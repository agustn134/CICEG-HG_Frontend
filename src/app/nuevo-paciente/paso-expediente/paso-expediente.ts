// src/app/nuevo-paciente/paso-expediente/paso-expediente.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { WizardStateService } from '../../services/wizard-state';
import { ExpedientesService } from '../../services/gestion-expedientes/expedientes';
import { DatosExpediente, WizardStep, EstadoWizard } from '../../models/wizard.models';
import { CreateExpedienteDto, ESTADOS_EXPEDIENTE_VALUES } from '../../models/expediente.model';

@Component({
  selector: 'app-paso-expediente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center mb-4">
            <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-4">
              <span class="text-sm font-bold text-blue-600">3</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Crear Expediente Clínico</h1>
              <p class="text-sm text-gray-600">Generación del expediente del paciente</p>
            </div>
          </div>

          <!-- Barra de progreso -->
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" [style.width.%]="progreso"></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>Paso 3 de 6</span>
            <span>{{ progreso }}% completado</span>
          </div>
        </div>

        <!-- Resumen del paciente -->
        <div *ngIf="resumenCompleto" class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div class="flex items-start">
            <svg class="w-6 h-6 text-blue-600 mt-1 mr-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
            </svg>
            <div class="flex-1">
              <h3 class="text-lg font-medium text-blue-900 mb-3">Resumen del Paciente</h3>

              <!-- Datos personales -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-blue-800">
                    <strong>Nombre:</strong> {{ resumenCompleto.persona.nombre }} {{ resumenCompleto.persona.apellido_paterno }} {{ resumenCompleto.persona.apellido_materno }}
                  </p>
                  <p class="text-blue-800">
                    <strong>CURP:</strong> {{ resumenCompleto.persona.curp }}
                  </p>
                  <p class="text-blue-800">
                    <strong>Edad:</strong> {{ calcularEdad(resumenCompleto.persona.fecha_nacimiento) }} años
                  </p>
                  <p class="text-blue-800">
                    <strong>Sexo:</strong> {{ resumenCompleto.persona.genero }}
                  </p>
                </div>
                <div>
                  <p class="text-blue-800">
                    <strong>Tipo de sangre:</strong> {{ resumenCompleto.paciente.tipo_sangre }}
                  </p>
                  <p class="text-blue-800">
                    <strong>Alergias:</strong> {{ resumenCompleto.paciente.alergias || 'Ninguna' }}
                  </p>
                  <p class="text-blue-800">
                    <strong>Contacto emergencia:</strong> {{ resumenCompleto.paciente.familiar_responsable }}
                  </p>
                  <p class="text-blue-800">
                    <strong>Teléfono:</strong> {{ resumenCompleto.paciente.telefono_familiar }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado del proceso -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Estado del Proceso</h2>
            <p class="mt-1 text-sm text-gray-600">Progreso de creación del expediente</p>
          </div>

          <div class="px-6 py-6">
            <!-- Pasos completados -->
            <div class="space-y-4">

              <!-- Paso 1: Datos personales -->
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">Datos personales registrados</p>
                  <p class="text-sm text-gray-500">Información básica del paciente completada</p>
                </div>
              </div>

              <!-- Paso 2: Información médica -->
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">Información médica registrada</p>
                  <p class="text-sm text-gray-500">Datos de salud y contacto de emergencia</p>
                </div>
              </div>

              <!-- Paso 3: Creación de expediente -->
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center"
                       [ngClass]="{
                         'bg-blue-100': estadoProceso === 'preparando',
                         'bg-yellow-100': estadoProceso === 'creando',
                         'bg-green-100': estadoProceso === 'completado',
                         'bg-red-100': estadoProceso === 'error'
                       }">
                    <!-- Spinner de carga -->
                    <div *ngIf="estadoProceso === 'preparando' || estadoProceso === 'creando'"
                         class="animate-spin rounded-full h-5 w-5 border-b-2"
                         [ngClass]="{
                           'border-blue-600': estadoProceso === 'preparando',
                           'border-yellow-600': estadoProceso === 'creando'
                         }">
                    </div>

                    <!-- Check de completado -->
                    <svg *ngIf="estadoProceso === 'completado'" class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>

                    <!-- X de error -->
                    <svg *ngIf="estadoProceso === 'error'" class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">{{ getTituloEstado() }}</p>
                  <p class="text-sm text-gray-500">{{ getDescripcionEstado() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuración del expediente (solo si está preparando) -->
        <div *ngIf="estadoProceso === 'preparando'" class="bg-white shadow rounded-lg mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Configuración del Expediente</h2>
            <p class="mt-1 text-sm text-gray-600">Opciones adicionales para el expediente</p>
          </div>

          <form [formGroup]="expedienteForm" class="px-6 py-6 space-y-6">

            <!-- Número de expediente -->
            <div>
              <label for="numero_expediente" class="block text-sm font-medium text-gray-700">
                Número de Expediente
              </label>
              <input
                type="text"
                id="numero_expediente"
                formControlName="numero_expediente"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                readonly
                placeholder="Se generará automáticamente"
              />
              <p class="mt-1 text-xs text-gray-500">
                El número se genera automáticamente según el formato del hospital
              </p>
            </div>

            <!-- Estado inicial -->
            <div>
              <label for="estado" class="block text-sm font-medium text-gray-700">
                Estado Inicial del Expediente
              </label>
              <select
                id="estado"
                formControlName="estado"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Activo">Activo</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </div>

            <!-- Crear historia clínica automática -->
            <div>
              <div class="flex items-center">
                <input
                  id="crear_historia_clinica"
                  formControlName="crear_historia_clinica"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="crear_historia_clinica" class="ml-2 block text-sm text-gray-900">
                  Crear Historia Clínica automáticamente
                </label>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                Recomendado: Crea una historia clínica básica con los datos del paciente
              </p>
            </div>

            <!-- Notas administrativas -->
            <div>
              <label for="notas_administrativas" class="block text-sm font-medium text-gray-700">
                Notas Administrativas
              </label>
              <textarea
                id="notas_administrativas"
                formControlName="notas_administrativas"
                rows="3"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Observaciones o notas especiales sobre el expediente..."
              ></textarea>
            </div>
          </form>
        </div>

        <!-- Resultado del expediente (solo si está completado) -->
        <div *ngIf="estadoProceso === 'completado' && expedienteCreado" class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div class="flex items-start">
            <svg class="w-6 h-6 text-green-600 mt-1 mr-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <div class="flex-1">
              <h3 class="text-lg font-medium text-green-900 mb-3">¡Expediente Creado Exitosamente!</h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-green-800">
                    <strong>Número de Expediente:</strong> {{ expedienteCreado.numero_expediente }}
                  </p>
                  <p class="text-green-800">
                    <strong>Estado:</strong> {{ expedienteCreado.estado }}
                  </p>
                  <p class="text-green-800">
                    <strong>Fecha de Apertura:</strong> {{ formatearFecha(expedienteCreado.fecha_apertura) }}
                  </p>
                </div>
                <div>
                  <p class="text-green-800">
                    <strong>ID del Expediente:</strong> #{{ expedienteCreado.id_expediente }}
                  </p>
                  <p class="text-green-800">
                    <strong>Historia Clínica:</strong> {{ expedienteCreado.crear_historia_clinica ? 'Creada' : 'No creada' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div *ngIf="estadoProceso === 'error'" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex">
            <svg class="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <div>
              <h3 class="text-sm font-medium text-red-800 mb-1">Error al crear el expediente</h3>
              <p class="text-sm text-red-700">{{ mensajeError }}</p>
              <button
                (click)="reintentar()"
                class="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>

        <!-- Botones de navegación -->
        <div class="flex justify-between">
          <button
            type="button"
            (click)="goBack()"
            [disabled]="estadoProceso === 'creando'"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Anterior
          </button>

          <div class="flex space-x-3">
            <!-- Botón crear expediente (solo en preparando) -->
            <button
              *ngIf="estadoProceso === 'preparando'"
              type="button"
              (click)="crearExpediente()"
              [disabled]="!expedienteForm.valid"
              class="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Crear Expediente
            </button>

            <!-- Botón siguiente (solo cuando completado) -->
            <button
              *ngIf="estadoProceso === 'completado'"
              type="button"
              (click)="continuar()"
              class="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continuar
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Debug info (solo desarrollo) -->
        <div *ngIf="showDebugInfo" class="mt-8 bg-gray-100 rounded-lg p-4">
          <h3 class="text-sm font-medium text-gray-900 mb-2">Debug Info</h3>
          <div class="text-xs text-gray-600 space-y-2">
            <div><strong>Estado:</strong> {{ estadoProceso }}</div>
            <div><strong>Form Valid:</strong> {{ expedienteForm.valid }}</div>
            <div><strong>Wizard State:</strong></div>
            <pre>{{ resumenCompleto | json }}</pre>
          </div>
        </div>

      </div>
    </div>
  `
})
export class PasoExpediente implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Form
  expedienteForm!: FormGroup;

  // Estados
  estadoProceso: 'preparando' | 'creando' | 'completado' | 'error' = 'preparando';
  progreso = 50; // 3/6 * 100
  showDebugInfo = false; // true para desarrollo
  mensajeError = '';

  // Datos
  resumenCompleto: any = null;
  expedienteCreado: any = null;

  constructor(
    private fb: FormBuilder,
    private wizardStateService: WizardStateService,
    private expedientesService: ExpedientesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingData();
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
      numero_expediente: [''],
      estado: [ESTADOS_EXPEDIENTE_VALUES.ACTIVO, [Validators.required]],
      notas_administrativas: [''],
      crear_historia_clinica: [true]
    });
  }

  private loadExistingData(): void {
    const currentState = this.wizardStateService.getCurrentState();

    // Preparar resumen completo
    this.resumenCompleto = {
      persona: currentState.datosPersona,
      paciente: currentState.datosPaciente
    };

    // Cargar datos del expediente si existen
    if (currentState.datosExpediente && Object.keys(currentState.datosExpediente).length > 0) {
      this.expedienteForm.patchValue(currentState.datosExpediente);
    }

    // Verificar si ya se creó el expediente
    if (currentState.id_expediente_creado) {
      this.estadoProceso = 'completado';
      this.expedienteCreado = {
        id_expediente: currentState.id_expediente_creado,
        numero_expediente: currentState.datosExpediente?.numero_expediente || 'N/A',
        estado: currentState.datosExpediente?.estado || 'Activo',
        fecha_apertura: new Date().toISOString(),
        crear_historia_clinica: currentState.datosExpediente?.crear_historia_clinica || false
      };
    }
  }

  private validatePreviousSteps(): void {
    const currentState = this.wizardStateService.getCurrentState();

    // Verificar que existan datos de persona y paciente
    if (!currentState.datosPersona || Object.keys(currentState.datosPersona).length === 0) {
      alert('Debe completar primero los datos personales');
      this.wizardStateService.goToStep(WizardStep.PERSONA);
      return;
    }

    if (!currentState.datosPaciente || Object.keys(currentState.datosPaciente).length === 0) {
      alert('Debe completar primero la información médica');
      this.wizardStateService.goToStep(WizardStep.PACIENTE);
      return;
    }

    // Verificar IDs generados
    if (!currentState.id_persona_creada || !currentState.id_paciente_creado) {
      alert('Error: Faltan IDs de persona o paciente. Reinicie el proceso.');
      this.wizardStateService.resetWizard();
      return;
    }
  }

  // ==========================================
  // ACCIONES
  // ==========================================

  crearExpediente(): void {
    if (!this.expedienteForm.valid) return;

    this.estadoProceso = 'creando';
    this.wizardStateService.setWizardEstado(EstadoWizard.COMPLETANDO);

    const currentState = this.wizardStateService.getCurrentState();
    const formData = this.expedienteForm.value;

    // Preparar datos para crear expediente
    const expedienteData: CreateExpedienteDto = {
      id_paciente: currentState.id_paciente_creado!,
      estado: formData.estado,
      notas_administrativas: formData.notas_administrativas,
      crear_historia_clinica: formData.crear_historia_clinica,
      // id_medico_creador: 1 // TODO: Obtener del contexto de usuario
    };

    // Simular creación del expediente
    // En producción, usarías: this.expedientesService.createExpedienteCompleto(expedienteData)
    setTimeout(() => {
      this.simulateExpedienteCreation(expedienteData);
    }, 2000);
  }

  private simulateExpedienteCreation(data: CreateExpedienteDto): void {
    try {
      // Simular datos del expediente creado
      const expedienteCreado = {
        id_expediente: Math.floor(Math.random() * 1000) + 1000,
        numero_expediente: this.generateNumeroExpediente(),
        fecha_apertura: new Date().toISOString(),
        estado: data.estado,
        notas_administrativas: data.notas_administrativas,
        crear_historia_clinica: data.crear_historia_clinica,
        id_paciente: data.id_paciente
      };

      // Actualizar estado del wizard
      const datosExpediente: Partial<DatosExpediente> = {
        id_paciente: data.id_paciente,
        numero_expediente: expedienteCreado.numero_expediente,
        estado: data.estado!,
        notas_administrativas: data.notas_administrativas,
        crear_historia_clinica: data.crear_historia_clinica!
      };

      this.wizardStateService.updateExpedienteData(datosExpediente);
      this.wizardStateService.setGeneratedIds({ id_expediente: expedienteCreado.id_expediente });
      this.wizardStateService.markStepAsCompleted(WizardStep.EXPEDIENTE);

      // Actualizar UI
      this.expedienteCreado = expedienteCreado;
      this.estadoProceso = 'completado';
      this.wizardStateService.setWizardEstado(EstadoWizard.EN_PROGRESO);

    } catch (error) {
      this.handleError('Error al crear el expediente: ' + (error as any).message);
    }
  }

  private generateNumeroExpediente(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `EXP${year}${random}`;
  }

  private handleError(message: string): void {
    this.estadoProceso = 'error';
    this.mensajeError = message;
    this.wizardStateService.setWizardEstado(EstadoWizard.ERROR);
  }

  reintentar(): void {
    this.estadoProceso = 'preparando';
    this.mensajeError = '';
    this.wizardStateService.setWizardEstado(EstadoWizard.EN_PROGRESO);
  }

  continuar(): void {
    this.wizardStateService.goToNextStep();
  }

  goBack(): void {
    this.wizardStateService.goToPreviousStep();
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

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTituloEstado(): string {
    switch (this.estadoProceso) {
      case 'preparando':
        return 'Preparando expediente';
      case 'creando':
        return 'Creando expediente...';
      case 'completado':
        return 'Expediente creado exitosamente';
      case 'error':
        return 'Error en la creación';
      default:
        return 'Estado desconocido';
    }
  }

  getDescripcionEstado(): string {
    switch (this.estadoProceso) {
      case 'preparando':
        return 'Configure las opciones del expediente y haga clic en "Crear Expediente"';
      case 'creando':
        return 'Generando el expediente clínico en el sistema...';
      case 'completado':
        return 'El expediente ha sido creado y está listo para documentos clínicos';
      case 'error':
        return 'Ocurrió un problema durante la creación del expediente';
      default:
        return '';
    }
  }
}
