// src/app/nuevo-paciente/paso-persona/paso-persona.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { WizardStateService } from '../../services/wizard-state';
import { CatalogoService, CatalogoItem } from '../../services/catalogo';
import { DatosPersona, WizardStep } from '../../models/wizard.models';

@Component({
  selector: 'app-paso-persona',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center mb-4">
            <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-4">
              <span class="text-sm font-bold text-blue-600">1</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Datos Personales</h1>
              <p class="text-sm text-gray-600">Información básica del paciente</p>
            </div>
          </div>

          <!-- Barra de progreso -->
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" [style.width.%]="progreso"></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>Paso 1 de 6</span>
            <span>{{ progreso }}% completado</span>
          </div>
        </div>

        <!-- Formulario -->
        <form [formGroup]="personaForm" (ngSubmit)="onSubmit()" class="space-y-6">

          <!-- Tarjeta del formulario -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Información Personal</h2>
              <p class="mt-1 text-sm text-gray-600">Complete todos los campos obligatorios marcados con *</p>
            </div>

            <div class="px-6 py-6 space-y-6">

              <!-- Nombre completo -->
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">

                <!-- Nombre -->
                <div>
                  <label for="nombre" class="block text-sm font-medium text-gray-700">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    formControlName="nombre"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    [class.border-red-300]="isFieldInvalid('nombre')"
                    placeholder="Ej: Juan Carlos"
                  />
                  <div *ngIf="isFieldInvalid('nombre')" class="mt-1 text-sm text-red-600">
                    El nombre es obligatorio
                  </div>
                </div>

                <!-- Apellido Paterno -->
                <div>
                  <label for="apellido_paterno" class="block text-sm font-medium text-gray-700">
                    Apellido Paterno *
                  </label>
                  <input
                    type="text"
                    id="apellido_paterno"
                    formControlName="apellido_paterno"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    [class.border-red-300]="isFieldInvalid('apellido_paterno')"
                    placeholder="Ej: García"
                  />
                  <div *ngIf="isFieldInvalid('apellido_paterno')" class="mt-1 text-sm text-red-600">
                    El apellido paterno es obligatorio
                  </div>
                </div>

                <!-- Apellido Materno -->
                <div>
                  <label for="apellido_materno" class="block text-sm font-medium text-gray-700">
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    id="apellido_materno"
                    formControlName="apellido_materno"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: López"
                  />
                </div>
              </div>

              <!-- Datos básicos -->
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">

                <!-- Fecha de nacimiento -->
                <div>
                  <label for="fecha_nacimiento" class="block text-sm font-medium text-gray-700">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    id="fecha_nacimiento"
                    formControlName="fecha_nacimiento"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    [class.border-red-300]="isFieldInvalid('fecha_nacimiento')"
                    [max]="fechaMaxima"
                  />
                  <div *ngIf="isFieldInvalid('fecha_nacimiento')" class="mt-1 text-sm text-red-600">
                    La fecha de nacimiento es obligatoria
                  </div>
                  <div *ngIf="edadCalculada > 0" class="mt-1 text-sm text-gray-500">
                    Edad: {{ edadCalculada }} años
                  </div>
                </div>

                <!-- Sexo -->
                <div>
                  <label for="sexo" class="block text-sm font-medium text-gray-700">
                    Sexo *
                  </label>
                  <select
                    id="sexo"
                    formControlName="sexo"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    [class.border-red-300]="isFieldInvalid('sexo')"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                  <div *ngIf="isFieldInvalid('sexo')" class="mt-1 text-sm text-red-600">
                    El sexo es obligatorio
                  </div>
                </div>
              </div>

              <!-- CURP -->
              <div>
                <label for="curp" class="block text-sm font-medium text-gray-700">
                  CURP (Clave Única de Registro de Población) *
                </label>
                <input
                  type="text"
                  id="curp"
                  formControlName="curp"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  [class.border-red-300]="isFieldInvalid('curp')"
                  [class.border-green-300]="personaForm.get('curp')?.valid && personaForm.get('curp')?.value"
                  placeholder="Ej: GABC800312HGTLPN01"
                  maxlength="18"
                  style="text-transform: uppercase"
                />
                <div *ngIf="isFieldInvalid('curp')" class="mt-1 text-sm text-red-600">
                  <span *ngIf="personaForm.get('curp')?.errors?.['required']">La CURP es obligatoria</span>
                  <span *ngIf="personaForm.get('curp')?.errors?.['pattern']">La CURP debe tener el formato correcto (18 caracteres)</span>
                </div>
                <div *ngIf="personaForm.get('curp')?.valid && personaForm.get('curp')?.value" class="mt-1 text-sm text-green-600">
                  ✓ CURP válida
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  La CURP debe tener 18 caracteres. Ejemplo: GABC800312HGTLPN01
                </p>
              </div>

              <!-- Contacto -->
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">

                <!-- Teléfono -->
                <div>
                  <label for="telefono" class="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    formControlName="telefono"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    [class.border-red-300]="isFieldInvalid('telefono')"
                    placeholder="Ej: 4421234567"
                    maxlength="10"
                  />
                  <div *ngIf="isFieldInvalid('telefono')" class="mt-1 text-sm text-red-600">
                    El teléfono debe tener 10 dígitos
                  </div>
                </div>

                <!-- Correo electrónico -->
                <div>
                  <label for="correo_electronico" class="block text-sm font-medium text-gray-700">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="correo_electronico"
                    formControlName="correo_electronico"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    [class.border-red-300]="isFieldInvalid('correo_electronico')"
                    placeholder="Ej: ejemplo@correo.com"
                  />
                  <div *ngIf="isFieldInvalid('correo_electronico')" class="mt-1 text-sm text-red-600">
                    Ingrese un correo electrónico válido
                  </div>
                </div>
              </div>

              <!-- Domicilio -->
              <div>
                <label for="domicilio" class="block text-sm font-medium text-gray-700">
                  Domicilio
                </label>
                <textarea
                  id="domicilio"
                  formControlName="domicilio"
                  rows="2"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Calle 5 de Mayo #123, Col. Centro, San Luis de la Paz, Guanajuato"
                ></textarea>
              </div>

              <!-- Estado civil y religión -->
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">

                <!-- Estado civil -->
                <div>
                  <label for="estado_civil" class="block text-sm font-medium text-gray-700">
                    Estado Civil
                  </label>
                  <select
                    id="estado_civil"
                    formControlName="estado_civil"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccione...</option>
                    <option *ngFor="let estado of estadosCiviles" [value]="estado.value">
                      {{ estado.label }}
                    </option>
                  </select>
                </div>

                <!-- Religión -->
                <div>
                  <label for="religion" class="block text-sm font-medium text-gray-700">
                    Religión
                  </label>
                  <select
                    id="religion"
                    formControlName="religion"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccione...</option>
                    <option *ngFor="let religion of religiones" [value]="religion.value">
                      {{ religion.label }}
                    </option>
                  </select>
                </div>
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
                [disabled]="!personaForm.valid || isLoading"
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
            <div><strong>Form Valid:</strong> {{ personaForm.valid }}</div>
            <div><strong>Form Value:</strong></div>
            <pre>{{ personaForm.value | json }}</pre>
            <div><strong>Form Errors:</strong></div>
            <pre>{{ getFormErrors() | json }}</pre>
          </div>
        </div>

      </div>
    </div>
  `
})
export class PasoPersona implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Form
  personaForm!: FormGroup;

  // Estados
  isLoading = false;
  progreso = 16.7; // 1/6 * 100
  edadCalculada = 0;
  fechaMaxima = '';
  showDebugInfo = false; // true para desarrollo

  // Catálogos
  estadosCiviles: CatalogoItem[] = [];
  religiones: CatalogoItem[] = [];

  constructor(
    private fb: FormBuilder,
    private wizardStateService: WizardStateService,
    private catalogoService: CatalogoService,
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
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido_paterno: ['', [Validators.required, Validators.minLength(2)]],
      apellido_materno: [''],
      fecha_nacimiento: ['', Validators.required],
      sexo: ['', Validators.required],
      curp: ['', [Validators.required, Validators.pattern(/^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/)]],
      telefono: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      correo_electronico: ['', [Validators.email]],
      domicilio: [''],
      estado_civil: [''],
      religion: ['']
    });
  }

  private loadCatalogos(): void {
    // Cargar estados civiles
    this.catalogoService.getEstadosCiviles()
      .pipe(takeUntil(this.destroy$))
      .subscribe(estados => this.estadosCiviles = estados);

    // Cargar religiones
    this.catalogoService.getReligiones()
      .pipe(takeUntil(this.destroy$))
      .subscribe(religiones => this.religiones = religiones);
  }

  private loadExistingData(): void {
    const currentState = this.wizardStateService.getCurrentState();
    if (currentState.datosPersona && Object.keys(currentState.datosPersona).length > 0) {
      this.personaForm.patchValue(currentState.datosPersona);
    }
  }

  private setupFormSubscriptions(): void {
    // Calcular edad automáticamente
    this.personaForm.get('fecha_nacimiento')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(fecha => {
        if (fecha) {
          this.edadCalculada = this.calculateAge(new Date(fecha));
        }
      });

    // Convertir CURP a mayúsculas
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
        debounceTime(30000),
        distinctUntilChanged()
      )
      .subscribe(() => {
        if (this.personaForm.valid) {
          this.guardarBorrador();
        }
      });
  }

  // ==========================================
  // VALIDACIONES
  // ==========================================

  isFieldInvalid(fieldName: string): boolean {
    const field = this.personaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
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

    return age;
  }

  // ==========================================
  // ACCIONES
  // ==========================================

  onSubmit(): void {
    if (this.personaForm.valid && !this.isLoading) {
      this.saveAndContinue();
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private saveAndContinue(): void {
    this.isLoading = true;

    // Actualizar datos en el wizard state
    const formData = this.personaForm.value as DatosPersona;
    this.wizardStateService.updatePersonaData(formData);

    // Marcar paso como completado
    this.wizardStateService.markStepAsCompleted(WizardStep.PERSONA);

    // Simular guardado (aquí iría la llamada al backend)
    setTimeout(() => {
      this.isLoading = false;
      this.wizardStateService.goToNextStep();
    }, 1000);
  }

  guardarBorrador(): void {
    if (!this.isLoading) {
      const formData = this.personaForm.value as Partial<DatosPersona>;
      this.wizardStateService.updatePersonaData(formData);

      // Mostrar feedback visual
      console.log('Borrador guardado automáticamente');
    }
  }

  goBack(): void {
    this.router.navigate(['/app/nuevo-paciente']);
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.personaForm.controls).forEach(key => {
      this.personaForm.get(key)?.markAsTouched();
    });
  }
}
