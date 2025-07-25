// src/app/nuevo-paciente/paso-paciente/paso-paciente.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { WizardStateService } from '../../services/wizard-state';
import { CatalogoService, CatalogoItem } from '../../services/catalogo';
import { PacientesService } from '../../services/personas/pacientes';
import { DatosPaciente, WizardStep } from '../../models/wizard.models';
import { CreatePacienteDto, TipoSangreEnum } from '../../models';

@Component({
  selector: 'app-paso-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paso-paciente.html',
  styleUrl: './paso-paciente.css',
})
export class PasoPaciente implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Form
  pacienteForm!: FormGroup;

  // Estados
  isLoading = false;
  progreso = 33.3; // 2/6 * 100
  showDebugInfo = false; // true para desarrollo
  autoGuardadoStatus = '';

  // Datos del paso anterior
  resumenPersona: any = null;

  // Catálogos
  tiposSangre: CatalogoItem[] = [];
  parentescos: CatalogoItem[] = [];
  nivelesEscolaridad: CatalogoItem[] = [];

  constructor(
    private fb: FormBuilder,
    private wizardStateService: WizardStateService,
    private catalogoService: CatalogoService,
    private pacientesService: PacientesService, // ← Agregamos PacientesService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCatalogos();
    this.loadExistingData();
    this.setupFormSubscriptions();
    this.validatePreviousStep();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  private initializeForm(): void {
    this.pacienteForm = this.fb.group({
      tipo_sangre: ['', [Validators.required]],
      alergias: [''],
      transfusiones: ['', [Validators.required]],
      detalles_transfusiones: [''],
      familiar_responsable: [
        '',
        [Validators.required, Validators.minLength(3)],
      ],
      parentesco_familiar: ['', [Validators.required]],
      telefono_familiar: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
      ocupacion: [''],
      escolaridad: [''],
      lugar_nacimiento: [''],
    });
  }

private loadCatalogos(): void {
  console.log('🔄 Iniciando carga de catálogos...');

  //   CORRECCIÓN: Cargar tipos de sangre con mapeo correcto
  this.catalogoService.getTiposSangre()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (tipos) => {
        console.log('  Tipos de sangre desde backend:', tipos);

        // 🔧 MAPEAR la respuesta del backend al formato esperado
        this.tiposSangre = tipos.map((tipo: any) => ({
          value: tipo.value || tipo.nombre || tipo.id_tipo_sangre,  // Usar cualquier campo disponible
          label: tipo.label || tipo.nombre || `Tipo ${tipo.id_tipo_sangre}`  // Mostrar nombre legible
        }));

        console.log('🩸 Tipos de sangre mapeados para el select:', this.tiposSangre);
      },
      error: (error) => {
        console.error('❌ Error cargando tipos de sangre:', error);
        // Fallback manual
        this.tiposSangre = [
          { value: 'A+', label: 'A+' },
          { value: 'A-', label: 'A-' },
          { value: 'B+', label: 'B+' },
          { value: 'B-', label: 'B-' },
          { value: 'AB+', label: 'AB+' },
          { value: 'AB-', label: 'AB-' },
          { value: 'O+', label: 'O+' },
          { value: 'O-', label: 'O-' },
          { value: 'Desconocido', label: 'Desconocido' }
        ];
        console.log('🔄 Usando tipos de sangre de fallback:', this.tiposSangre);
      }
    });

  // Cargar parentescos (ya funcionan con fallback)
  this.catalogoService.getParentescos()
    .pipe(takeUntil(this.destroy$))
    .subscribe(parentescos => {
      this.parentescos = parentescos;
      console.log('👨‍👩‍👧‍👦 Parentescos cargados:', parentescos.length);
    });

  // Cargar niveles de escolaridad (ya funcionan con fallback)
  this.catalogoService.getNivelesEscolaridad()
    .pipe(takeUntil(this.destroy$))
    .subscribe(niveles => {
      this.nivelesEscolaridad = niveles;
      console.log('🎓 Niveles de escolaridad cargados:', niveles.length);
    });
}

  private loadExistingData(): void {
    const currentState = this.wizardStateService.getCurrentState();

    // Cargar datos de la persona del paso anterior
    this.resumenPersona = currentState.datosPersona;

    // Cargar datos del paciente si existen
    if (
      currentState.datosPaciente &&
      Object.keys(currentState.datosPaciente).length > 0
    ) {
      this.pacienteForm.patchValue(currentState.datosPaciente);
    }
  }

  private setupFormSubscriptions(): void {
    // Validación condicional de detalles de transfusiones
    this.pacienteForm
      .get('transfusiones')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        const detallesControl = this.pacienteForm.get('detalles_transfusiones');

        if (value === 'Si') {
          detallesControl?.setValidators([
            Validators.required,
            Validators.minLength(10),
          ]);
        } else {
          detallesControl?.clearValidators();
          detallesControl?.setValue('');
        }
        detallesControl?.updateValueAndValidity();
      });

    // Auto-guardar cada 30 segundos
    this.pacienteForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(30000),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.guardarBorrador();
      });
  }

  private validatePreviousStep(): void {
    const currentState = this.wizardStateService.getCurrentState();

    console.log(
      '  Validando paso anterior. Estado actual del wizard:',
      currentState
    );

    // Verificar que existan datos de persona
    if (
      !currentState.datosPersona ||
      Object.keys(currentState.datosPersona).length === 0
    ) {
      console.error('❌ No hay datos de persona en el wizard state');
      alert('Debe completar primero los datos personales');
      this.wizardStateService.goToStep(WizardStep.PERSONA);
      return;
    }

    // Verificar que existe el ID de persona creada (fundamental para el backend)
    if (!currentState.id_persona_creada) {
      console.error('❌ No hay ID de persona creada. Estado:', currentState);
      alert('Error: Faltan IDs de persona o paciente. Reinicie el proceso.');
      this.wizardStateService.goToStep(WizardStep.PERSONA);
      return;
    }

    // Verificar que el paso anterior esté válido
    const personaValidation = this.wizardStateService.validateStep(
      WizardStep.PERSONA
    );
    if (!personaValidation.isValid) {
      console.error('❌ Validación del paso persona falló:', personaValidation);
      alert('Los datos personales tienen errores. Por favor revíselos.');
      this.wizardStateService.goToStep(WizardStep.PERSONA);
      return;
    }

    console.log(
      '  Validación del paso anterior exitosa. ID Persona:',
      currentState.id_persona_creada
    );
  }

  // ==========================================
  // VALIDACIONES
  // ==========================================

  isFieldInvalid(fieldName: string): boolean {
    const field = this.pacienteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;

    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  // ==========================================
  // ACCIONES CON BACKEND
  // ==========================================

  onSubmit(): void {
    console.log('🔄 Form submitted. Valid:', this.pacienteForm.valid);

    if (this.pacienteForm.valid && !this.isLoading) {
      this.saveAndContinue();
    } else {
      console.log('❌ Form invalid, marking all fields as touched');
      this.markAllFieldsAsTouched();
    }
  }

  /**
   * Guardar paciente en la base de datos usando PacientesService
   */
  // private saveAndContinue(): void {
  //   this.isLoading = true;
  //   this.autoGuardadoStatus = 'Guardando información médica...';

  //   // Obtener ID de persona del paso anterior
  //   const currentState = this.wizardStateService.getCurrentState();
  //   const idPersona = currentState.id_persona_creada;

  //   if (!idPersona) {
  //     console.error('❌ No se encontró el ID de la persona.');
  //     alert('Error: No se encontró el ID de la persona. Debe completar el paso anterior.');
  //     this.isLoading = false;
  //     this.autoGuardadoStatus = '';
  //     this.wizardStateService.goToStep(WizardStep.PERSONA);
  //     return;
  //   }

  //   try {
  //     // Preparar datos del formulario
  //     const formData = this.pacienteForm.value;

  //     console.log('🔄 Datos del formulario paciente:', formData);

  //     // Preparar DTO para el backend
  //     const createPacienteDto: CreatePacienteDto = {
  //       id_persona: idPersona,
  //       tipo_sangre: this.mapTipoSangre(formData.tipo_sangre),
  //       alergias: formData.alergias || undefined,
  //       transfusiones: formData.transfusiones === 'Si',
  //       detalles_transfusiones: formData.detalles_transfusiones || undefined,
  //       familiar_responsable: formData.familiar_responsable,
  //       parentesco_familiar: formData.parentesco_familiar,
  //       telefono_familiar: formData.telefono_familiar,
  //       ocupacion: formData.ocupacion || undefined,
  //       escolaridad: formData.escolaridad || undefined,
  //       lugar_nacimiento: formData.lugar_nacimiento || undefined,
  //       // Aquí deberías agregar el ID del doctor si tienes login
  //       // id_doctor: currentState.id_doctor || 1, // Por ahora usamos 1 como default
  //       activo: true
  //     };

  //     console.log('🚀 Enviando al backend (PacientesService):', createPacienteDto);

  //     // Llamada real al backend
  //     this.pacientesService.createPaciente(createPacienteDto).subscribe({
  //       next: (response) => {
  //         console.log('  Respuesta del backend (paciente creado):', response);

  //         if (response.success && response.data) {
  //           // Actualizar datos en el wizard state
  //           const datosPacienteCompletos: Partial<DatosPaciente> = {
  //             ...formData,
  //             id_persona: idPersona,
  //             id_paciente: response.data.id_paciente
  //           };

  //           this.wizardStateService.updatePacienteData(datosPacienteCompletos);

  //           // Guardar ID del paciente creado
  //           this.wizardStateService.updateIds({
  //             id_paciente: response.data.id_paciente!
  //           });

  //           // Marcar paso como completado
  //           this.wizardStateService.markStepAsCompleted(WizardStep.PACIENTE);

  //           // Actualizar UI
  //           this.isLoading = false;
  //           this.autoGuardadoStatus = '  Información médica registrada exitosamente';

  //           console.log('  Paciente creado con ID:', response.data.id_paciente);
  //           console.log('➡️ Navegando al siguiente paso...');

  //           // Navegar al siguiente paso después de una breve pausa
  //           setTimeout(() => {
  //             this.wizardStateService.goToNextStep();
  //           }, 1000);

  //         } else {
  //           throw new Error(response.message || 'Error desconocido al crear paciente');
  //         }
  //       },

  //       error: (error) => {
  //         console.error('❌ Error al crear paciente:', error);

  //         this.isLoading = false;

  //         // Determinar mensaje de error apropiado
  //         let errorMessage = '❌ Error al guardar información médica';

  //         if (error.error?.message) {
  //           errorMessage = `❌ ${error.error.message}`;
  //         } else if (error.message) {
  //           errorMessage = `❌ ${error.message}`;
  //         } else if (error.status === 0) {
  //           errorMessage = '❌ Sin conexión al servidor';
  //         } else if (error.status >= 400 && error.status < 500) {
  //           errorMessage = '❌ Error en los datos enviados';
  //         } else if (error.status >= 500) {
  //           errorMessage = '❌ Error del servidor';
  //         }

  //         this.autoGuardadoStatus = errorMessage;

  //         // Limpiar mensaje de error después de 8 segundos
  //         setTimeout(() => {
  //           this.autoGuardadoStatus = '';
  //         }, 8000);
  //       }
  //     });

  //   } catch (error) {
  //     console.error('❌ Error al preparar datos:', error);
  //     this.isLoading = false;
  //     this.autoGuardadoStatus = '❌ Error al procesar datos del formulario';

  //     setTimeout(() => {
  //       this.autoGuardadoStatus = '';
  //     }, 5000);
  //   }
  // }

  // En paso-paciente.ts, busca el método saveAndContinue() y actualiza esta parte:

  private saveAndContinue(): void {
    this.isLoading = true;
    this.autoGuardadoStatus = 'Guardando información médica...';

    const currentState = this.wizardStateService.getCurrentState();
    const idPersona = currentState.id_persona_creada;

    if (!idPersona) {
      console.error('❌ No se encontró el ID de la persona.');
      alert(
        'Error: No se encontró el ID de la persona. Debe completar el paso anterior.'
      );
      this.isLoading = false;
      this.autoGuardadoStatus = '';
      this.wizardStateService.goToStep(WizardStep.PERSONA);
      return;
    }

    try {
      const formData = this.pacienteForm.value;
      console.log('🔄 Datos del formulario paciente:', formData);

      //   CORRECCIÓN: Buscar el nombre del tipo de sangre seleccionado
      const tipoSangreSeleccionado = this.tiposSangre.find(
        (tipo) => tipo.value === formData.tipo_sangre
      );
      const tipoSangreNombre =
        tipoSangreSeleccionado?.label || 'No especificado';

      console.log('🩸 Tipo de sangre seleccionado:', {
        valor: formData.tipo_sangre,
        nombre: tipoSangreNombre,
        tipos_disponibles: this.tiposSangre,
      });

      // Preparar DTO para el backend
      const createPacienteDto: CreatePacienteDto = {
        id_persona: idPersona,
        tipo_sangre: this.mapTipoSangre(formData.tipo_sangre),
        alergias: formData.alergias || undefined,
        transfusiones: formData.transfusiones === 'Si',
        detalles_transfusiones: formData.detalles_transfusiones || undefined,
        familiar_responsable: formData.familiar_responsable,
        parentesco_familiar: formData.parentesco_familiar,
        telefono_familiar: formData.telefono_familiar,
        ocupacion: formData.ocupacion || undefined,
        escolaridad: formData.escolaridad || undefined,
        lugar_nacimiento: formData.lugar_nacimiento || undefined,
        activo: true,
      };

      console.log(
        '🚀 Enviando al backend (PacientesService):',
        createPacienteDto
      );

      // Llamada real al backend
      this.pacientesService.createPaciente(createPacienteDto).subscribe({
        next: (response) => {
          console.log('  Respuesta del backend (paciente creado):', response);

          if (response.success && response.data) {
            //   CORRECCIÓN: Incluir el nombre del tipo de sangre en los datos guardados
            const datosPacienteCompletos: Partial<DatosPaciente> = {
              ...formData,
              tipo_sangre_nombre: tipoSangreNombre, //   Agregar nombre para el resumen
              id_persona: idPersona,
              id_paciente: response.data.id_paciente,
            };

            this.wizardStateService.updatePacienteData(datosPacienteCompletos);

            // Guardar ID del paciente creado
            this.wizardStateService.updateIds({
              id_paciente: response.data.id_paciente!,
            });

            // Marcar paso como completado
            this.wizardStateService.markStepAsCompleted(WizardStep.PACIENTE);

            // Actualizar UI
            this.isLoading = false;
            this.autoGuardadoStatus =
              '  Información médica registrada exitosamente';

            console.log(
              '  Paciente creado con ID:',
              response.data.id_paciente
            );
            console.log(
              '  Datos guardados con tipo de sangre:',
              datosPacienteCompletos
            );

            // Navegar al siguiente paso después de una breve pausa
            setTimeout(() => {
              this.wizardStateService.goToNextStep();
            }, 1000);
          } else {
            throw new Error(
              response.message || 'Error desconocido al crear paciente'
            );
          }
        },

        error: (error) => {
          console.error('❌ Error al crear paciente:', error);
          this.isLoading = false;

          let errorMessage = '❌ Error al guardar información médica';
          if (error.error?.message) {
            errorMessage = `❌ ${error.error.message}`;
          } else if (error.message) {
            errorMessage = `❌ ${error.message}`;
          }

          this.autoGuardadoStatus = errorMessage;
          setTimeout(() => {
            this.autoGuardadoStatus = '';
          }, 8000);
        },
      });
    } catch (error) {
      console.error('❌ Error al preparar datos:', error);
      this.isLoading = false;
      this.autoGuardadoStatus = '❌ Error al procesar datos del formulario';
    }
  }

  /**
   * Mapear tipo de sangre del formulario al enum del backend
   */
  private mapTipoSangre(tipoSangre: string): TipoSangreEnum {
    const mapping: { [key: string]: TipoSangreEnum } = {
      'A+': TipoSangreEnum.A_POSITIVO,
      'A-': TipoSangreEnum.A_NEGATIVO,
      'B+': TipoSangreEnum.B_POSITIVO,
      'B-': TipoSangreEnum.B_NEGATIVO,
      'AB+': TipoSangreEnum.AB_POSITIVO,
      'AB-': TipoSangreEnum.AB_NEGATIVO,
      'O+': TipoSangreEnum.O_POSITIVO,
      'O-': TipoSangreEnum.O_NEGATIVO,
      Desconocido: TipoSangreEnum.DESCONOCIDO,
    };

    return mapping[tipoSangre] || TipoSangreEnum.DESCONOCIDO;
  }

  /**
   * Guardar borrador (solo en wizard state, no en backend)
   */
  guardarBorrador(): void {
    if (!this.isLoading && this.pacienteForm.dirty) {
      console.log('💾 Guardando borrador de paciente...');

      const formData = this.pacienteForm.value as Partial<DatosPaciente>;

      //   CORRECCIÓN: Incluir nombre del tipo de sangre en el borrador también
      const tipoSangreSeleccionado = this.tiposSangre.find(
        (tipo) => tipo.value === formData.tipo_sangre
      );

      const datosConNombre = {
        ...formData,
        tipo_sangre_nombre: tipoSangreSeleccionado?.label || 'No especificado',
      };

      try {
        this.wizardStateService.updatePacienteData(datosConNombre);
        console.log('💾 Borrador de paciente guardado automáticamente');
      } catch (error) {
        console.error('❌ Error al guardar borrador:', error);
      }
    }
  }

  goBack(): void {
    console.log('⬅️ Navegando hacia atrás');

    // Guardar borrador antes de salir si hay cambios
    if (this.pacienteForm.dirty) {
      console.log('💾 Guardando borrador antes de salir');
      this.guardarBorrador();
    }

    // Navegar al paso anterior
    this.wizardStateService.goToPreviousStep();
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.pacienteForm.controls).forEach((key) => {
      this.pacienteForm.get(key)?.markAsTouched();
    });
  }

  // ==========================================
  // MÉTODOS PARA DEBUGGING
  // ==========================================

  /** Método para testing - mostrar estado del wizard */
  get currentWizardState() {
    return this.showDebugInfo
      ? this.wizardStateService.getCurrentState()
      : null;
  }

  /** Verificar si el formulario está listo para enviar */
  get canSubmit(): boolean {
    return this.pacienteForm.valid && !this.isLoading;
  }

  /** Verificar si se puede guardar borrador */
  get canSaveDraft(): boolean {
    return this.pacienteForm.dirty && !this.isLoading;
  }
}
