// src/app/nuevo-paciente/paso-expediente/paso-expediente.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { WizardStateService } from '../../services/wizard-state';
import { ExpedientesService } from '../../services/gestion-expedientes/expedientes';
import { DatosExpediente, WizardStep, EstadoWizard } from '../../models/wizard.models';
import { CreateExpedienteDto, ApiResponse, Expediente } from '../../models';

@Component({
  selector: 'app-paso-expediente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paso-expediente.html',
  styleUrl: './paso-expediente.css'
})
export class PasoExpediente implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Form
  expedienteForm!: FormGroup;

  // Estados
  isLoading = false;
  progreso = 50; // 3/6 * 100
  showDebugInfo = false;
  autoGuardadoStatus = '';
  estadoProceso: 'preparando' | 'creando' | 'completado' | 'error' = 'preparando';

  // Datos acumulados
  resumenPersona: any = null;
  resumenPaciente: any = null;
  expedienteCreado: any = null;

  // Opciones para selects
  estadosExpediente = [
    { value: 'Activo', label: 'Activo' },
    { value: 'Suspendido', label: 'Suspendido' }
  ];

  constructor(
    private fb: FormBuilder,
    private wizardStateService: WizardStateService,
    private expedientesService: ExpedientesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingData();
    this.setupFormSubscriptions();
    this.validatePreviousSteps();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
private initializeForm(): void {
  this.expedienteForm = this.fb.group({
    numero_expediente: [''], // Opcional, se puede generar automáticamente
    numero_expediente_administrativo: ['', [
      //   VALIDADOR PERSONALIZADO PARA FORMATO LIBRE
      (control: any) => {
        if (!control.value) return null; // Opcional

        const validacion = this.expedientesService?.validarNumeroAdministrativoLibre(control.value);
        return validacion?.valido ? null : { formato: validacion?.errores[0] || 'Formato inválido' };
      }
    ]],
    estado: ['Activo', [Validators.required]],
    crear_historia_clinica: [true],
    notas_administrativas: [''],
    fecha_apertura: [new Date().toISOString().split('T')[0]]
  });
}

  private loadExistingData(): void {
    const currentState = this.wizardStateService.getCurrentState();

    console.log('  Estado actual del wizard:', currentState);

    // Cargar datos de pasos anteriores
    this.resumenPersona = currentState.datosPersona;
    this.resumenPaciente = currentState.datosPaciente;

    // Cargar datos del expediente si existen
    if (currentState.datosExpediente && Object.keys(currentState.datosExpediente).length > 0) {
      this.expedienteForm.patchValue(currentState.datosExpediente);
    }

    // Si ya se completó el expediente, mostrar estado completado
    if (currentState.id_expediente_creado) {
      this.estadoProceso = 'completado';
      this.expedienteCreado = {
        id_expediente: currentState.id_expediente_creado,
        numero_expediente: currentState.datosExpediente?.numero_expediente || 'Generándose...',
        estado: currentState.datosExpediente?.estado || 'Activo',
        fecha_apertura: new Date().toISOString(),
        historia_clinica_creada: currentState.datosExpediente?.crear_historia_clinica || false
      };
    }
  }

  private setupFormSubscriptions(): void {
    // Auto-guardar cada 30 segundos
    this.expedienteForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(30000),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.guardarBorrador();
      });
  }

  private validatePreviousSteps(): void {
    const currentState = this.wizardStateService.getCurrentState();

    console.log('  Validando pasos anteriores...');

    // Verificar que existen datos de persona
    if (!currentState.datosPersona || Object.keys(currentState.datosPersona).length === 0) {
      console.error('❌ No hay datos de persona');
      alert('Debe completar primero los datos personales');
      this.wizardStateService.goToStep(WizardStep.PERSONA);
      return;
    }

    // Verificar que existe ID de persona
    if (!currentState.id_persona_creada) {
      console.error('❌ No hay ID de persona creada');
      alert('Error: No se encontró el ID de la persona. Reinicie el proceso.');
      this.wizardStateService.goToStep(WizardStep.PERSONA);
      return;
    }

    // Verificar que existen datos de paciente
    if (!currentState.datosPaciente || Object.keys(currentState.datosPaciente).length === 0) {
      console.error('❌ No hay datos de paciente');
      alert('Debe completar primero la información médica');
      this.wizardStateService.goToStep(WizardStep.PACIENTE);
      return;
    }

    // Verificar que existe ID de paciente
    if (!currentState.id_paciente_creado) {
      console.error('❌ No hay ID de paciente creado');
      alert('Error: No se encontró el ID del paciente. Reinicie el proceso.');
      this.wizardStateService.goToStep(WizardStep.PACIENTE);
      return;
    }

    console.log('  Validación exitosa. IDs encontrados:', {
      persona: currentState.id_persona_creada,
      paciente: currentState.id_paciente_creado
    });
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

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  //   MÉTODO RENOMBRADO Y CORREGIDO
  private generarNumeroExpediente(): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `HG-${year}-${String(timestamp).slice(-6)}${String(random).padStart(4, '0')}`;
  }

  //   NUEVO MÉTODO CORREGIDO
  async generateNumeroExpediente(): Promise<void> {
    try {
      this.expedientesService.generateNumeroExpediente().subscribe({
        next: (response: ApiResponse<{ numero_expediente: string }>) => {
          if (response.success && response.data?.numero_expediente) {
            this.expedienteForm.patchValue({
              numero_expediente: response.data.numero_expediente
            });
            console.log('  Número generado:', response.data.numero_expediente);
          }
        },
        error: (error: any) => {
          console.error('❌ Error al generar número:', error);
          // Fallback: generar número localmente
          this.expedienteForm.patchValue({
            numero_expediente: this.generarNumeroExpediente()
          });
        }
      });
    } catch (error) {
      console.error('❌ Error en generateNumeroExpediente:', error);
      // Fallback: generar número localmente
      this.expedienteForm.patchValue({
        numero_expediente: this.generarNumeroExpediente()
      });
    }
  }

  // ==========================================
  // ACCIONES CON BACKEND - MÉTODO PRINCIPAL CORREGIDO
  // ==========================================

//   MÉTODO PRINCIPAL CORREGIDO Y SIMPLIFICADO



crearExpediente(): void {
  console.log('🔄 Form submitted. Valid:', this.expedienteForm.valid);

  if (!this.expedienteForm.valid) {
    console.log('❌ Form invalid');
    return;
  }

  this.isLoading = true;
  this.estadoProceso = 'creando';
  this.autoGuardadoStatus = 'Creando expediente...';
  this.wizardStateService.setWizardEstado(EstadoWizard.COMPLETANDO);

  const currentState = this.wizardStateService.getCurrentState();
  const formData = this.expedienteForm.value;

  // Verificar que tenemos el ID del paciente
  const idPaciente = currentState.id_paciente_creado;
  if (!idPaciente) {
    console.error('❌ No se encontró el ID del paciente');
    alert('Error: No se encontró el ID del paciente. Reinicie el proceso.');
    this.isLoading = false;
    this.estadoProceso = 'error';
    this.autoGuardadoStatus = '';
    return;
  }

  try {
    // Preparar datos para crear expediente
    const expedienteData: CreateExpedienteDto = {
      id_paciente: idPaciente,
      numero_expediente: formData.numero_expediente || this.generarNumeroExpediente(),
      numero_expediente_administrativo: formData.numero_expediente_administrativo?.trim() || null,
      fecha_apertura: formData.fecha_apertura || new Date().toISOString(),
      estado: formData.estado || 'Activo',
      notas_administrativas: formData.notas_administrativas || 'Expediente creado mediante wizard',
      crear_historia_clinica: formData.crear_historia_clinica,
      id_medico_creador: 9 // TODO: Obtener del contexto de usuario cuando tengas login
    };

    console.log('🚀 Enviando al backend (ExpedientesService):', expedienteData);

    // Llamada real al backend
    this.expedientesService.createExpediente(expedienteData).subscribe({
      next: (response: ApiResponse<Expediente>) => {
        console.log('  Respuesta del backend (expediente creado):', response);

        if (response.success && response.data) {
          // Actualizar datos en el wizard state
          const datosExpedienteCompletos: Partial<DatosExpediente> = {
            id_paciente: idPaciente,
            id_expediente: response.data.id_expediente,
            numero_expediente: response.data.numero_expediente,
            numero_expediente_administrativo: response.data.numero_expediente_administrativo, //   NUEVO CAMPO
            estado: response.data.estado,
            notas_administrativas: formData.notas_administrativas,
            crear_historia_clinica: formData.crear_historia_clinica,
            fecha_apertura: response.data.fecha_apertura
          };

          this.wizardStateService.updateExpedienteData(datosExpedienteCompletos);

          // Guardar ID del expediente creado
          this.wizardStateService.updateIds({
            id_expediente: response.data.id_expediente!
          });

          // Marcar paso como completado
          this.wizardStateService.markStepAsCompleted(WizardStep.EXPEDIENTE);

          // Actualizar estado local
          this.expedienteCreado = {
            id_expediente: response.data.id_expediente,
            numero_expediente: response.data.numero_expediente,
            numero_expediente_administrativo: response.data.numero_expediente_administrativo, //   NUEVO CAMPO
            fecha_apertura: response.data.fecha_apertura,
            estado: response.data.estado,
            historia_clinica_creada: formData.crear_historia_clinica
          };

          // Actualizar UI
          this.isLoading = false;
          this.estadoProceso = 'completado';
          this.autoGuardadoStatus = '  Expediente creado exitosamente';

          console.log('  Expediente creado con ID:', response.data.id_expediente);
          console.log('  Número de expediente:', response.data.numero_expediente);
          console.log('  Número administrativo:', response.data.numero_expediente_administrativo);

          // 🔥 REDIRIGIR AL PERFIL DEL PACIENTE después de crear expediente
          setTimeout(() => {
            this.irAPerfilPaciente(idPaciente);
          }, 2000);

        } else {
          throw new Error(response.message || 'Error desconocido al crear expediente');
        }
      },

      error: (error: any) => {
        console.error('❌ Error al crear expediente:', error);
        this.isLoading = false;
        this.estadoProceso = 'error';

        let errorMessage = '❌ Error al crear expediente';
        if (error.error?.message) {
          errorMessage = `❌ ${error.error.message}`;
        } else if (error.message) {
          errorMessage = `❌ ${error.message}`;
        }

        this.autoGuardadoStatus = errorMessage;
        setTimeout(() => {
          this.autoGuardadoStatus = '';
        }, 8000);
      }
    });

  } catch (error: any) {
    console.error('❌ Error al preparar datos:', error);
    this.isLoading = false;
    this.estadoProceso = 'error';
    this.autoGuardadoStatus = '❌ Error al procesar datos del formulario';
  }
}

// //   NUEVO MÉTODO: Validar número administrativo
// validarNumeroAdministrativo(numero: string): boolean {
//   if (!numero) return true; // Es opcional

//   // Validación básica de formato (puedes ajustar según tus reglas)
//   const patron = /^\d{4}-\d{6}$/; // Formato: YYYY-NNNNNN
//   return patron.test(numero);
// }

//   MÉTODO ACTUALIZADO: Validar número administrativo con formato libre
validarNumeroAdministrativo(numero: string): boolean {
  if (!numero) return true; // Es opcional

  const validacion = this.expedientesService.validarNumeroAdministrativoLibre(numero);

  if (!validacion.valido) {
    console.warn('Errores de validación:', validacion.errores);
    // Opcional: mostrar errores al usuario
  }

  return validacion.valido;
}



// //   MÉTODO CORREGIDO: Verificar disponibilidad del número administrativo
// verificarDisponibilidadNumero(): void {
//   const numero = this.expedienteForm.get('numero_expediente_administrativo')?.value;

//   if (numero && numero.trim().length > 0) {
//     // Solo validar formato local
//     if (!this.validarNumeroAdministrativo(numero.trim())) {
//       this.expedienteForm.get('numero_expediente_administrativo')?.setErrors({ 'formato': true });
//     } else {
//       // Limpiar errores de formato
//       const control = this.expedienteForm.get('numero_expediente_administrativo');
//       if (control?.errors?.['formato']) {
//         delete control.errors['formato'];
//         if (Object.keys(control.errors).length === 0) {
//           control.setErrors(null);
//         }
//       }
//     }
//   }
// }
//   MÉTODO ACTUALIZADO: Verificar solo formato básico (sin verificar duplicados en backend por ahora)
verificarDisponibilidadNumero(): void {
  const numero = this.expedienteForm.get('numero_expediente_administrativo')?.value;

  if (numero && numero.trim().length > 0) {
    const validacion = this.expedientesService.validarNumeroAdministrativoLibre(numero.trim());

    const control = this.expedienteForm.get('numero_expediente_administrativo');

    if (!validacion.valido) {
      // Mostrar errores de formato
      control?.setErrors({ 'formato': validacion.errores[0] });
    } else {
      // Limpiar errores de formato
      if (control?.errors?.['formato']) {
        delete control.errors['formato'];
        if (Object.keys(control.errors).length === 0) {
          control.setErrors(null);
        }
      }
    }
  }
}

//   MÉTODO PARA OBTENER EJEMPLOS
obtenerEjemplosFormato(): string[] {
  return [
    '2025-001',
    'EXP-2025-001',
    'HG/001/2025',
    'A123',
    'EXPEDIENTE 001',
    '2025001',
    'HG-A-001'
  ];
}




  //   NUEVO MÉTODO: Redirigir al perfil del paciente
  private irAPerfilPaciente(idPaciente: number): void {
    console.log('🔄 Redirigiendo al perfil del paciente ID:', idPaciente);

    // Opcional: Limpiar el wizard state
    // this.wizardStateService.resetWizard();

    // Redirigir al perfil del paciente
    this.router.navigate(['/app/personas/perfil-paciente', idPaciente]);
  }

  // ==========================================
  // MÉTODOS DE NAVEGACIÓN
  // ==========================================

  /**
   * Guardar borrador (solo en wizard state, no en backend)
   */
  guardarBorrador(): void {
    if (!this.isLoading && this.expedienteForm.dirty) {
      console.log('💾 Guardando borrador de expediente...');

      const formData = this.expedienteForm.value as Partial<DatosExpediente>;

      try {
        this.wizardStateService.updateExpedienteData(formData);
        console.log('💾 Borrador de expediente guardado automáticamente');
      } catch (error) {
        console.error('❌ Error al guardar borrador:', error);
      }
    }
  }

  goBack(): void {
    console.log('⬅️ Navegando hacia atrás');

    // Guardar borrador antes de salir si hay cambios
    if (this.expedienteForm.dirty) {
      console.log('💾 Guardando borrador antes de salir');
      this.guardarBorrador();
    }

    // Navegar al paso anterior
    this.wizardStateService.goToPreviousStep();
  }

  //   MÉTODO CONTINUAR CORREGIDO para ir al perfil
  continuar(): void {
    console.log('➡️ Continuando al perfil del paciente');

    const currentState = this.wizardStateService.getCurrentState();
    const idPaciente = currentState.id_paciente_creado;

    if (idPaciente) {
      this.irAPerfilPaciente(idPaciente);
    } else {
      console.error('❌ No se encontró ID del paciente para continuar');
      this.wizardStateService.goToNextStep(); // Fallback al siguiente paso
    }
  }

  // ==========================================
  // GETTERS PARA TEMPLATE
  // ==========================================

  /** Método para testing - mostrar estado del wizard */
  get currentWizardState() {
    return this.showDebugInfo ? this.wizardStateService.getCurrentState() : null;
  }

  /** Verificar si el formulario está listo para enviar */
  get canSubmit(): boolean {
    return this.expedienteForm.valid && !this.isLoading && this.estadoProceso === 'preparando';
  }

  /** Verificar si se puede continuar al siguiente paso */
  get canContinue(): boolean {
    return this.estadoProceso === 'completado' && !this.isLoading;
  }

  /** Verificar si se puede guardar borrador */
  get canSaveDraft(): boolean {
    return this.expedienteForm.dirty && !this.isLoading && this.estadoProceso === 'preparando';
  }
}
