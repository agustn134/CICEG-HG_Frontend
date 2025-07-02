// src/app/nuevo-paciente/paso-paciente/paso-paciente.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { WizardStateService } from '../../services/wizard-state';
import { CatalogoService, CatalogoItem } from '../../services/catalogo';
import { DatosPaciente, WizardStep } from '../../models/wizard.models';
import { PARENTESCOS_FAMILIAR, NIVELES_ESCOLARIDAD } from '../../models/paciente.model';

@Component({
  selector: 'app-paso-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center mb-4">
            <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-4">
              <span class="text-sm font-bold text-blue-600">2</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Información Médica</h1>
              <p class="text-sm text-gray-600">Datos de salud y contacto familiar</p>
            </div>
          </div>

          <!-- Barra de progreso -->
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" [style.width.%]="progreso"></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>Paso 2 de 6</span>
            <span>{{ progreso }}% completado</span>
          </div>
        </div>

        <!-- Resumen del paciente -->
        <div *ngIf="resumenPersona" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
            </svg>
            <div>
              <h3 class="text-sm font-medium text-blue-900 mb-1">Datos del Paciente</h3>
              <p class="text-sm text-blue-800">
                <strong>{{ resumenPersona.nombre }} {{ resumenPersona.apellido_paterno }} {{ resumenPersona.apellido_materno }}</strong>
                - CURP: {{ resumenPersona.curp }}
                - Edad: {{ calcularEdad(resumenPersona.fecha_nacimiento) }} años
                - Sexo: {{ resumenPersona.genero }}
              </p>
            </div>
          </div>
        </div>

        <!-- Formulario -->
        <form [formGroup]="pacienteForm" (ngSubmit)="onSubmit()" class="space-y-6">

          <!-- Información Médica Básica -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Información Médica</h2>
              <p class="mt-1 text-sm text-gray-600">Datos de salud y tipo de sangre</p>
            </div>

            <div class="px-6 py-6 space-y-6">

              <!-- Tipo de sangre -->
              <div>
                <label for="tipo_sangre" class="block text-sm font-medium text-gray-700">
                  Tipo de Sangre *
                </label>
                <select
                  id="tipo_sangre"
                  formControlName="tipo_sangre"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  [class.border-red-300]="isFieldInvalid('tipo_sangre')"
                >
                  <option value="">Seleccione tipo de sangre...</option>
                  <option *ngFor="let tipo of tiposSangre" [value]="tipo.value">
                    {{ tipo.label }}
                  </option>
                </select>
                <div *ngIf="isFieldInvalid('tipo_sangre')" class="mt-1 text-sm text-red-600">
                  El tipo de sangre es obligatorio
                </div>
              </div>

              <!-- Alergias -->
              <div>
                <label for="alergias" class="block text-sm font-medium text-gray-700">
                  Alergias
                </label>
                <textarea
                  id="alergias"
                  formControlName="alergias"
                  rows="3"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Especifique las alergias conocidas (medicamentos, alimentos, etc.) o escriba 'Ninguna'"
                ></textarea>
                <p class="mt-1 text-xs text-gray-500">
                  Indique cualquier alergia conocida a medicamentos, alimentos o sustancias
                </p>
              </div>

              <!-- Transfusiones -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  ¿Ha recibido transfusiones sanguíneas? *
                </label>
                <div class="flex space-x-4">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      formControlName="transfusiones"
                      value="Si"
                      class="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <span class="ml-2 text-sm text-gray-700">Sí</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      formControlName="transfusiones"
                      value="No"
                      class="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <span class="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
                <div *ngIf="isFieldInvalid('transfusiones')" class="mt-1 text-sm text-red-600">
                  Debe especificar si ha recibido transfusiones
                </div>
              </div>

              <!-- Detalles de transfusiones (solo si seleccionó "Sí") -->
              <div *ngIf="pacienteForm.get('transfusiones')?.value === 'Si'">
                <label for="detalles_transfusiones" class="block text-sm font-medium text-gray-700">
                  Detalles de las Transfusiones *
                </label>
                <textarea
                  id="detalles_transfusiones"
                  formControlName="detalles_transfusiones"
                  rows="2"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  [class.border-red-300]="isFieldInvalid('detalles_transfusiones')"
                  placeholder="Describa cuándo, dónde y motivo de las transfusiones"
                ></textarea>
                <div *ngIf="isFieldInvalid('detalles_transfusiones')" class="mt-1 text-sm text-red-600">
                  Debe especificar los detalles de las transfusiones
                </div>
              </div>
            </div>
          </div>

          <!-- Contacto de Emergencia -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Contacto de Emergencia</h2>
              <p class="mt-1 text-sm text-gray-600">Familiar o persona responsable</p>
            </div>

            <div class="px-6 py-6 space-y-6">

              <!-- Familiar responsable -->
              <div>
                <label for="familiar_responsable" class="block text-sm font-medium text-gray-700">
                  Nombre del Familiar Responsable *
                </label>
                <input
                  type="text"
                  id="familiar_responsable"
                  formControlName="familiar_responsable"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  [class.border-red-300]="isFieldInvalid('familiar_responsable')"
                  placeholder="Ej: María García López"
                />
                <div *ngIf="isFieldInvalid('familiar_responsable')" class="mt-1 text-sm text-red-600">
                  El nombre del familiar responsable es obligatorio
                </div>
              </div>

              <!-- Parentesco y teléfono -->
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">

                <!-- Parentesco -->
                <div>
                  <label for="parentesco_familiar" class="block text-sm font-medium text-gray-700">
                    Parentesco *
                  </label>
                  <select
                    id="parentesco_familiar"
                    formControlName="parentesco_familiar"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    [class.border-red-300]="isFieldInvalid('parentesco_familiar')"
                  >
                    <option value="">Seleccione...</option>
                    <option *ngFor="let parentesco of parentescos" [value]="parentesco.value">
                      {{ parentesco.label }}
                    </option>
                  </select>
                  <div *ngIf="isFieldInvalid('parentesco_familiar')" class="mt-1 text-sm text-red-600">
                    El parentesco es obligatorio
                  </div>
                </div>

                <!-- Teléfono familiar -->
                <div>
                  <label for="telefono_familiar" class="block text-sm font-medium text-gray-700">
                    Teléfono del Familiar *
                  </label>
                  <input
                    type="tel"
                    id="telefono_familiar"
                    formControlName="telefono_familiar"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    [class.border-red-300]="isFieldInvalid('telefono_familiar')"
                    placeholder="Ej: 4421234567"
                    maxlength="10"
                  />
                  <div *ngIf="isFieldInvalid('telefono_familiar')" class="mt-1 text-sm text-red-600">
                    <span *ngIf="pacienteForm.get('telefono_familiar')?.errors?.['required']">El teléfono del familiar es obligatorio</span>
                    <span *ngIf="pacienteForm.get('telefono_familiar')?.errors?.['pattern']">El teléfono debe tener 10 dígitos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Información Adicional -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Información Adicional</h2>
              <p class="mt-1 text-sm text-gray-600">Datos sociodemográficos (opcional)</p>
            </div>

            <div class="px-6 py-6 space-y-6">

              <!-- Ocupación y Escolaridad -->
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">

                <!-- Ocupación -->
                <div>
                  <label for="ocupacion" class="block text-sm font-medium text-gray-700">
                    Ocupación
                  </label>
                  <input
                    type="text"
                    id="ocupacion"
                    formControlName="ocupacion"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Comerciante, Estudiante, Ama de casa"
                  />
                </div>

                <!-- Escolaridad -->
                <div>
                  <label for="escolaridad" class="block text-sm font-medium text-gray-700">
                    Nivel de Escolaridad
                  </label>
                  <select
                    id="escolaridad"
                    formControlName="escolaridad"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccione...</option>
                    <option *ngFor="let nivel of nivelesEscolaridad" [value]="nivel.value">
                      {{ nivel.label }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Lugar de nacimiento -->
              <div>
                <label for="lugar_nacimiento" class="block text-sm font-medium text-gray-700">
                  Lugar de Nacimiento
                </label>
                <input
                  type="text"
                  id="lugar_nacimiento"
                  formControlName="lugar_nacimiento"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: San Luis de la Paz, Guanajuato"
                />
              </div>
            </div>
          </div>

          <!-- Botones de navegación -->
          <div class="flex justify-between">
            <button
              type="button"
              (click)="goBack()"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Anterior
            </button>

            <div class="flex space-x-3">
              <button
                type="button"
                (click)="guardarBorrador()"
                [disabled]="isLoading"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                Guardar Borrador
              </button>

              <button
                type="submit"
                [disabled]="!pacienteForm.valid || isLoading"
                class="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span *ngIf="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                {{ isLoading ? 'Guardando...' : 'Siguiente' }}
                <svg *ngIf="!isLoading" class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </button>
            </div>
          </div>

        </form>

        <!-- Debug info (solo desarrollo) -->
        <div *ngIf="showDebugInfo" class="mt-8 bg-gray-100 rounded-lg p-4">
          <h3 class="text-sm font-medium text-gray-900 mb-2">Debug Info</h3>
          <div class="text-xs text-gray-600 space-y-2">
            <div><strong>Form Valid:</strong> {{ pacienteForm.valid }}</div>
            <div><strong>Form Value:</strong></div>
            <pre>{{ pacienteForm.value | json }}</pre>
            <div><strong>Wizard State:</strong></div>
            <pre>{{ resumenPersona | json }}</pre>
          </div>
        </div>

      </div>
    </div>
  `
})
export class PasoPaciente implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Form
  pacienteForm!: FormGroup;

  // Estados
  isLoading = false;
  progreso = 33.3; // 2/6 * 100
  showDebugInfo = false; // true para desarrollo

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
      familiar_responsable: ['', [Validators.required, Validators.minLength(3)]],
      parentesco_familiar: ['', [Validators.required]],
      telefono_familiar: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      ocupacion: [''],
      escolaridad: [''],
      lugar_nacimiento: ['']
    });
  }

  private loadCatalogos(): void {
    // Cargar tipos de sangre
    this.catalogoService.getTiposSangre()
      .pipe(takeUntil(this.destroy$))
      .subscribe(tipos => this.tiposSangre = tipos);

    // Cargar parentescos
    this.catalogoService.getParentescos()
      .pipe(takeUntil(this.destroy$))
      .subscribe(parentescos => this.parentescos = parentescos);

    // Cargar niveles de escolaridad
    this.catalogoService.getNivelesEscolaridad()
      .pipe(takeUntil(this.destroy$))
      .subscribe(niveles => this.nivelesEscolaridad = niveles);
  }

  private loadExistingData(): void {
    const currentState = this.wizardStateService.getCurrentState();

    // Cargar datos de la persona del paso anterior
    this.resumenPersona = currentState.datosPersona;

    // Cargar datos del paciente si existen
    if (currentState.datosPaciente && Object.keys(currentState.datosPaciente).length > 0) {
      this.pacienteForm.patchValue(currentState.datosPaciente);
    }
  }

  private setupFormSubscriptions(): void {
    // Validación condicional de detalles de transfusiones
    this.pacienteForm.get('transfusiones')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        const detallesControl = this.pacienteForm.get('detalles_transfusiones');

        if (value === 'Si') {
          detallesControl?.setValidators([Validators.required, Validators.minLength(10)]);
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

    // Verificar que existan datos de persona
    if (!currentState.datosPersona || Object.keys(currentState.datosPersona).length === 0) {
      alert('Debe completar primero los datos personales');
      this.wizardStateService.goToStep(WizardStep.PERSONA);
      return;
    }

    // Verificar que el paso anterior esté válido
    const personaValidation = this.wizardStateService.validateStep(WizardStep.PERSONA);
    if (!personaValidation.isValid) {
      alert('Los datos personales tienen errores. Por favor revíselos.');
      this.wizardStateService.goToStep(WizardStep.PERSONA);
      return;
    }
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

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // ==========================================
  // ACCIONES
  // ==========================================

  onSubmit(): void {
    if (this.pacienteForm.valid && !this.isLoading) {
      this.saveAndContinue();
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private saveAndContinue(): void {
    this.isLoading = true;

    // Obtener ID de persona del paso anterior
    const currentState = this.wizardStateService.getCurrentState();
    const idPersona = currentState.id_persona_creada;

    if (!idPersona) {
      alert('Error: No se encontró el ID de la persona. Debe completar el paso anterior.');
      this.isLoading = false;
      this.wizardStateService.goToStep(WizardStep.PERSONA);
      return;
    }

    // Preparar datos del paciente
    const formData = this.pacienteForm.value as Partial<DatosPaciente>;
    const datosPaciente: Partial<DatosPaciente> = {
      ...formData,
      id_persona: idPersona
    };

    // Actualizar datos en el wizard state
    this.wizardStateService.updatePacienteData(datosPaciente);

    // Marcar paso como completado
    this.wizardStateService.markStepAsCompleted(WizardStep.PACIENTE);

    // Simular guardado (aquí iría la llamada al backend)
    setTimeout(() => {
      this.isLoading = false;
      this.wizardStateService.goToNextStep();
    }, 1500);
  }

  guardarBorrador(): void {
    if (!this.isLoading) {
      const formData = this.pacienteForm.value as Partial<DatosPaciente>;
      this.wizardStateService.updatePacienteData(formData);

      // Mostrar feedback visual
      console.log('Borrador de paciente guardado automáticamente');
    }
  }

  goBack(): void {
    this.wizardStateService.goToPreviousStep();
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.pacienteForm.controls).forEach(key => {
      this.pacienteForm.get(key)?.markAsTouched();
    });
  }
}
