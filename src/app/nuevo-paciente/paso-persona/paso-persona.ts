// src/app/nuevo-paciente/paso-persona/paso-persona.component.ts
import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { WizardStateService } from '../../services/wizard-state';
import { CatalogoService, CatalogoItem } from '../../services/catalogo';
import { DatosPersona, WizardStep, Genero, EstadoCivil, WizardPersonaMapper } from '../../models/wizard.models';
import { PersonasService } from '../../services/personas/personas';
import { CreatePersonaFrontendDto } from '../../models';

@Component({
  selector: 'app-paso-persona',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paso-persona.html',
  styleUrl: './paso-persona.css'
})
export class PasoPersona implements OnInit, OnDestroy {

  // ==========================================
  // SIGNALS Y PROPIEDADES REACTIVAS
  // ==========================================

  private destroy$ = new Subject<void>();

  // Form
  personaForm!: FormGroup;

  // Estados reactivos usando signals
  isLoading = signal(false);
  progreso = signal(16.7); // 1/6 * 100
  edadCalculada = signal(0);
  autoGuardadoStatus = signal('');

  // Configuración
  fechaMaxima = '';
  totalCamposObligatorios = 5; // nombre, apellido_paterno, fecha_nacimiento, genero, curp
  showDebugInfo = false; // Cambiar a true para desarrollo

  // Catálogos
  estadosCiviles: CatalogoItem[] = [];
  religiones: CatalogoItem[] = [];

  // Opciones para selects
  generoOptions = [
    { value: Genero.MASCULINO, label: 'Masculino' },
    { value: Genero.FEMENINO, label: 'Femenino' },
    { value: Genero.OTRO, label: 'Otro' }
  ];

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================

  camposObligatoriosCompletados = computed(() => {
    const form = this.personaForm;
    if (!form) return 0;

    let completados = 0;
    if (form.get('nombre')?.valid) completados++;
    if (form.get('apellido_paterno')?.valid) completados++;
    if (form.get('fecha_nacimiento')?.valid) completados++;
    if (form.get('genero')?.valid) completados++;
    if (form.get('curp')?.valid) completados++;

    return completados;
  });

  constructor(
    private fb: FormBuilder,
    private wizardStateService: WizardStateService,
    private catalogoService: CatalogoService,
    private personasService: PersonasService,
    private router: Router
  ) {
    this.fechaMaxima = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadCatalogos();
    this.loadExistingData();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  private initializeForm(): void {
    this.personaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellido_paterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellido_materno: ['', [Validators.maxLength(50)]],
      fecha_nacimiento: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      estado_civil: [''],
      telefono: ['', [Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.email]],
      direccion: ['', [Validators.maxLength(200)]],
      ciudad: ['', [Validators.maxLength(50)]],
      estado: ['', [Validators.maxLength(50)]],
      codigo_postal: ['', [Validators.pattern(/^\d{5}$/)]],
      curp: ['', [Validators.required, Validators.pattern(/^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/)]],
      religion: [''],


      // 🔥 CAMPOS ADICIONALES PARA PEDIATRÍA (opcionales)
    nombre_madre: [''],
    apellidos_madre: [''],
    telefono_madre: [''],
    ocupacion_madre: [''],

    nombre_padre: [''],
    apellidos_padre: [''],
    telefono_padre: [''],
    ocupacion_padre: [''],

    // Para el tutor legal si no son los padres
    nombre_tutor: [''],
    parentesco_tutor: [''],
    telefono_tutor: ['']

    });
  }

  private loadCatalogos(): void {
    // Cargar estados civiles
    this.catalogoService.getEstadosCiviles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (estados) => {
          this.estadosCiviles = estados;
          console.log('Estados civiles cargados:', estados.length);
        },
        error: (error) => {
          console.error('Error al cargar estados civiles:', error);
        }
      });

    // Cargar religiones
    this.catalogoService.getReligiones()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (religiones) => {
          this.religiones = religiones;
          console.log('Religiones cargadas:', religiones.length);
        },
        error: (error) => {
          console.error('Error al cargar religiones:', error);
        }
      });
  }

  private loadExistingData(): void {
    const currentState = this.wizardStateService.getCurrentState();
    if (currentState.datosPersona && Object.keys(currentState.datosPersona).length > 0) {
      console.log('Cargando datos existentes:', currentState.datosPersona);
      this.personaForm.patchValue(currentState.datosPersona);

      // Calcular edad si hay fecha de nacimiento
      if (currentState.datosPersona.fecha_nacimiento) {
        this.edadCalculada.set(this.calculateAge(new Date(currentState.datosPersona.fecha_nacimiento)));
      }
    }
  }

  private setupFormSubscriptions(): void {
    // Calcular edad automáticamente
    this.personaForm.get('fecha_nacimiento')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(fecha => {
        if (fecha) {
          this.edadCalculada.set(this.calculateAge(new Date(fecha)));
        } else {
          this.edadCalculada.set(0);
        }
      });

    // Convertir CURP a mayúsculas automáticamente
    this.personaForm.get('curp')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(curp => {
        if (curp && typeof curp === 'string') {
          const upperCurp = curp.toUpperCase();
          if (upperCurp !== curp) {
            this.personaForm.get('curp')?.setValue(upperCurp, { emitEvent: false });
          }
        }
      });

    // Auto-guardar cada 30 segundos
    this.personaForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(30000), // 30 segundos
        distinctUntilChanged()
      )
      .subscribe(() => {
        if (this.personaForm.dirty && !this.isLoading()) {
          console.log('Auto-guardando borrador...');
          this.guardarBorrador();
        }
      });

    // Log de cambios para debugging
    if (this.showDebugInfo) {
      this.personaForm.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(value => {
          console.log('Form changed:', value);
        });
    }
  }

  // ==========================================
  // VALIDACIONES Y UTILIDADES
  // ==========================================

  isFieldInvalid(fieldName: string): boolean {
    const field = this.personaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string | null {
    const field = this.personaForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} es muy corto (mínimo ${field.errors['minlength'].requiredLength} caracteres)`;
      if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} es muy largo (máximo ${field.errors['maxlength'].requiredLength} caracteres)`;
      if (field.errors['email']) return 'Formato de email inválido';
      if (field.errors['pattern']) {
        if (fieldName === 'curp') return 'CURP inválida (debe tener 18 caracteres con formato correcto)';
        if (fieldName === 'telefono') return 'Teléfono debe tener exactamente 10 dígitos';
        if (fieldName === 'codigo_postal') return 'Código postal debe tener exactamente 5 dígitos';
        return `Formato de ${this.getFieldLabel(fieldName)} inválido`;
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'nombre': 'Nombre',
      'apellido_paterno': 'Apellido paterno',
      'apellido_materno': 'Apellido materno',
      'fecha_nacimiento': 'Fecha de nacimiento',
      'genero': 'Género',
      'telefono': 'Teléfono',
      'email': 'Email',
      'curp': 'CURP',
      'codigo_postal': 'Código postal'
    };
    return labels[fieldName] || fieldName;
  }

  getFormStatusText(): string {
    if (this.personaForm.pristine) return 'Sin cambios';
    if (this.personaForm.valid) return 'Formulario válido';
    if (this.personaForm.invalid && (this.personaForm.dirty || this.personaForm.touched)) return 'Formulario incompleto';
    return 'Esperando datos';
  }

  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.personaForm.controls).forEach(key => {
      const control = this.personaForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return Math.max(0, age);
  }

  // ==========================================
  // ACCIONES DEL FORMULARIO
  // ==========================================

  onSubmit(): void {
    console.log('Form submitted. Valid:', this.personaForm.valid);

    if (this.personaForm.valid && !this.isLoading()) {
      this.saveAndContinue();
    } else {
      console.log('Form invalid, marking all fields as touched');
      this.markAllFieldsAsTouched();

      // Scroll al primer campo con error
      this.scrollToFirstError();
    }
  }



  // ==========================================
// MÉTODO saveAndContinue() CON BACKEND REAL
// ==========================================

private saveAndContinue(): void {
  this.isLoading.set(true);
  this.autoGuardadoStatus.set('Guardando datos del paciente...');

  try {
    // Preparar datos del formulario
    const formData = this.personaForm.value as DatosPersona;

    console.log('🔄 Datos del wizard:', formData);

    // Convertir datos del wizard al formato del frontend service
    const personaFrontendDto: CreatePersonaFrontendDto = {
      nombre: formData.nombre,
      apellido_paterno: formData.apellido_paterno,
      apellido_materno: formData.apellido_materno || undefined,
      fecha_nacimiento: formData.fecha_nacimiento,
      genero: formData.genero,
      estado_civil: formData.estado_civil || undefined,
      telefono: formData.telefono || undefined,
      email: formData.email || undefined,
      direccion: formData.direccion || undefined,
      ciudad: formData.ciudad || undefined,
      estado: formData.estado || undefined,
      codigo_postal: formData.codigo_postal || undefined,
      curp: formData.curp,
      religion: formData.religion || undefined,
      activo: true
    };

    console.log('🚀 Enviando al backend:', personaFrontendDto);

    // Llamada real al backend a través del PersonasService
    this.personasService.createPersona(personaFrontendDto).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del backend:', response);

        if (response.success && response.data) {
          // Actualizar estado del wizard con datos guardados
          this.wizardStateService.updatePersonaData(formData);

          // Guardar ID de la persona creada
          this.wizardStateService.updateIds({
            id_persona: response.data.id_persona!
          });

          // Marcar paso como completado
          this.wizardStateService.markStepAsCompleted(WizardStep.PERSONA);

          // Actualizar UI
          this.isLoading.set(false);
          this.autoGuardadoStatus.set('✅ Persona registrada exitosamente');

          console.log('✅ Persona creada con ID:', response.data.id_persona);
          console.log('➡️ Navegando al siguiente paso...');

          // Navegar al siguiente paso después de una breve pausa
          setTimeout(() => {
            this.wizardStateService.goToNextStep();
          }, 1000);

        } else {
          throw new Error(response.message || 'Error desconocido al crear persona');
        }
      },

      error: (error) => {
        console.error('❌ Error al crear persona:', error);

        this.isLoading.set(false);

        // Determinar mensaje de error apropiado
        let errorMessage = '❌ Error al guardar datos';

        if (error.error?.message) {
          errorMessage = `❌ ${error.error.message}`;
        } else if (error.message) {
          errorMessage = `❌ ${error.message}`;
        } else if (error.status === 0) {
          errorMessage = '❌ Sin conexión al servidor';
        } else if (error.status >= 400 && error.status < 500) {
          errorMessage = '❌ Error en los datos enviados';
        } else if (error.status >= 500) {
          errorMessage = '❌ Error del servidor';
        }

        this.autoGuardadoStatus.set(errorMessage);

        // Limpiar mensaje de error después de 8 segundos
        setTimeout(() => {
          this.autoGuardadoStatus.set('');
        }, 8000);
      }
    });

  } catch (error) {
    console.error('❌ Error al preparar datos:', error);
    this.isLoading.set(false);
    this.autoGuardadoStatus.set('❌ Error al procesar datos del formulario');

    setTimeout(() => {
      this.autoGuardadoStatus.set('');
    }, 5000);
  }
}

// ==========================================
// MÉTODO ALTERNATIVO CON MAPPER DEL WIZARD
// ==========================================

private saveAndContinueAlternative(): void {
  this.isLoading.set(true);
  this.autoGuardadoStatus.set('Guardando datos del paciente...');

  try {
    // Preparar datos del formulario
    const formData = this.personaForm.value as DatosPersona;

    console.log('🔄 Datos del wizard:', formData);

    // Usar el mapper del wizard para convertir al formato backend
    const backendData = WizardPersonaMapper.toBackendFormat(formData);

    console.log('🚀 Datos convertidos para backend:', backendData);

    // Crear DTO frontend compatible
    const frontendDto: CreatePersonaFrontendDto = {
      ...formData,
      // Asegurar campos opcionales
      apellido_materno: formData.apellido_materno || undefined,
      estado_civil: formData.estado_civil || undefined,
      telefono: formData.telefono || undefined,
      email: formData.email || undefined,
      direccion: formData.direccion || undefined,
      ciudad: formData.ciudad || undefined,
      estado: formData.estado || undefined,
      codigo_postal: formData.codigo_postal || undefined,
      religion: formData.religion || undefined,
      activo: true
    };

    // Llamada al PersonasService
    this.personasService.createPersona(frontendDto).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Actualizar wizard state
          this.wizardStateService.updatePersonaData(formData);
          this.wizardStateService.updateIds({
            id_persona: response.data.id_persona!
          });
          this.wizardStateService.markStepAsCompleted(WizardStep.PERSONA);

          // UI updates
          this.isLoading.set(false);
          this.autoGuardadoStatus.set('✅ Persona registrada exitosamente');

          // Navigate to next step
          setTimeout(() => {
            this.wizardStateService.goToNextStep();
          }, 1000);
        } else {
          throw new Error(response.message || 'Error al crear persona');
        }
      },

      error: (error) => {
        console.error('❌ Error:', error);
        this.isLoading.set(false);
        this.autoGuardadoStatus.set('❌ Error al guardar datos');

        setTimeout(() => {
          this.autoGuardadoStatus.set('');
        }, 8000);
      }
    });

  } catch (error) {
    console.error('❌ Error al preparar datos:', error);
    this.isLoading.set(false);
    this.autoGuardadoStatus.set('❌ Error al procesar datos');

    setTimeout(() => {
      this.autoGuardadoStatus.set('');
    }, 5000);
  }
}

// ==========================================
// MÉTODO guardarBorrador() TAMBIÉN CON BACKEND
// ==========================================

guardarBorrador(): void {
  if (!this.isLoading() && this.personaForm.dirty) {
    console.log('💾 Guardando borrador...');

    // Para borrador, solo actualizar el wizard state sin enviar al backend
    const formData = this.personaForm.value as Partial<DatosPersona>;

    this.autoGuardadoStatus.set('Guardando borrador...');

    try {
      this.wizardStateService.updatePersonaData(formData);

      setTimeout(() => {
        this.autoGuardadoStatus.set('💾 Borrador guardado localmente');

        setTimeout(() => {
          this.autoGuardadoStatus.set('');
        }, 3000);
      }, 500);

    } catch (error) {
      console.error('Error al guardar borrador:', error);
      this.autoGuardadoStatus.set('❌ Error al guardar borrador');

      setTimeout(() => {
        this.autoGuardadoStatus.set('');
      }, 3000);
    }
  }
}






  goBack(): void {
    console.log('Navegando hacia atrás');

    // Guardar borrador antes de salir si hay cambios
    if (this.personaForm.dirty) {
      console.log('Guardando borrador antes de salir');
      this.guardarBorrador();
    }

    // Navegar al paso anterior
    this.router.navigate(['/app/nuevo-paciente']);
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.personaForm.controls).forEach(key => {
      this.personaForm.get(key)?.markAsTouched();
    });
  }

  private scrollToFirstError(): void {
    const firstErrorField = document.querySelector('.form-field.error');
    if (firstErrorField) {
      firstErrorField.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      (firstErrorField as HTMLElement).focus();
    }
  }

  // ==========================================
  // MÉTODOS PARA DEBUGGING Y TESTING
  // ==========================================

  /** Método para testing - mostrar/ocultar debug info */
  toggleDebugInfo(): void {
    this.showDebugInfo = !this.showDebugInfo;
    console.log('Debug mode:', this.showDebugInfo ? 'ON' : 'OFF');
  }

  /** Método para testing - llenar formulario con datos de prueba */
  fillTestData(): void {
    if (this.showDebugInfo) {
      console.log('Llenando datos de prueba...');
      this.personaForm.patchValue({
        nombre: 'Juan Carlos',
        apellido_paterno: 'García',
        apellido_materno: 'López',
        fecha_nacimiento: '1990-03-15',
        genero: Genero.MASCULINO,
        estado_civil: EstadoCivil.SOLTERO,
        telefono: '4421234567',
        email: 'juan.garcia@email.com',
        direccion: 'Calle 5 de Mayo #123, Col. Centro',
        ciudad: 'San Luis de la Paz',
        estado: 'Guanajuato',
        codigo_postal: '37900',
        curp: 'GALJ900315HGTLPN01',
        religion: 'Católica'
      });
    }
  }

  /** Método para testing - limpiar formulario */
  clearForm(): void {
    if (this.showDebugInfo) {
      console.log('Limpiando formulario...');
      this.personaForm.reset();
      this.edadCalculada.set(0);
      this.autoGuardadoStatus.set('');
    }
  }

  /** Método para testing - validar CURP específica */
  testCurpValidation(curp: string): boolean {
    const curpRegex = /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;
    return curpRegex.test(curp);
  }

  // ==========================================
  // GETTERS PARA EL TEMPLATE
  // ==========================================

  /** Obtener el estado actual del wizard para debugging */
  get currentWizardState() {
    return this.showDebugInfo ? this.wizardStateService.getCurrentState() : null;
  }

  /** Verificar si el formulario está listo para enviar */
  get canSubmit(): boolean {
    return this.personaForm.valid && !this.isLoading();
  }

  /** Verificar si se puede guardar borrador */
  get canSaveDraft(): boolean {
    return this.personaForm.dirty && !this.isLoading();
  }
}
