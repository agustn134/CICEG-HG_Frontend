// src/app/admin/configuracion/configuracion.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ConfiguracionService } from '../../services/configuracion.service';
import { ConfiguracionLogos } from '../../models/configuracion.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowPath,
  heroArrowUpTray,
  heroBuildingLibrary,
  heroBuildingOffice2,
  heroCheckCircle,
  heroCloudArrowUp,
  heroCog6Tooth,
  heroDocumentText,
  heroEye,
  heroInformationCircle,
  heroPaintBrush,
  heroPhoto,
  heroShieldCheck,
  heroUserGroup,
  heroXCircle,
} from '@ng-icons/heroicons/outline';
import { heroExclamationTriangleMicro } from '@ng-icons/heroicons/micro';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgIconComponent],
  providers: [
    provideIcons({
      heroCog6Tooth,
      heroPhoto,
      heroDocumentText,
      heroEye,
      heroArrowPath,
      heroCheckCircle,
      heroXCircle,
      heroCloudArrowUp,
      heroArrowUpTray,
      heroShieldCheck,
      heroBuildingLibrary,
      heroBuildingOffice2,
      heroPaintBrush,
      heroInformationCircle,
      heroExclamationTriangleMicro,
      heroUserGroup
    }),
  ],
  template: `
    <div class="min-h-screen bg-hospital-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center bg-hospital-primary p-3 rounded-full mb-4">
            <ng-icon name="heroCog6Tooth" class="h-8 w-8 text-white"></ng-icon>
          </div>
          <h1 class="text-3xl font-bold text-hospital-gray-900 mb-2">
            Configuración del Sistema
          </h1>
          <p class="text-hospital-gray-600">
            Personaliza la apariencia y contenido de tu sistema hospitalario
          </p>
        </div>

        <!-- Instrucciones -->
        <div class="mb-8 bg-hospital-info-light border border-hospital-info rounded-lg p-6">
          <h2 class="text-xl font-bold text-hospital-gray-800 mb-4 flex items-center gap-2">
            <ng-icon name="heroInformationCircle" class="h-6 w-6 text-hospital-info"></ng-icon>
            Instrucciones para Administradores
          </h2>

          <div class="grid md:grid-cols-2 gap-6">
            <!-- Sección para Informática -->
            <div class="bg-white p-4 rounded-lg border border-hospital-gray-200">
              <h3 class="font-semibold text-hospital-primary mb-3 flex items-center gap-2">
                <ng-icon name="heroCog6Tooth" class="h-5 w-5"></ng-icon>
                Para el Área de Informática:
              </h3>
              <ul class="space-y-2 text-sm text-hospital-gray-700">
                <li class="flex items-start gap-2">
                  <ng-icon name="heroCheckCircle" class="h-4 w-4 text-hospital-success mt-0.5"></ng-icon>
                  <span><strong>Logos:</strong> Suba imágenes en formato PNG, JPG o SVG (recomendado SVG para mejor calidad)</span>
                </li>
                <li class="flex items-start gap-2">
                  <ng-icon name="heroCheckCircle" class="h-4 w-4 text-hospital-success mt-0.5"></ng-icon>
                  <span><strong>Tamaño máximo:</strong> 2MB por imagen</span>
                </li>
                <li class="flex items-start gap-2">
                  <ng-icon name="heroCheckCircle" class="h-4 w-4 text-hospital-success mt-0.5"></ng-icon>
                  <span><strong>Proporción recomendada:</strong> 3:1 para logos de gobierno (600x200px)</span>
                </li>
              </ul>
            </div>

            <!-- Sección para Doctores Administradores -->
            <div class="bg-white p-4 rounded-lg border border-hospital-gray-200">
              <h3 class="font-semibold text-hospital-primary mb-3 flex items-center gap-2">
                <ng-icon name="heroUserGroup" class="h-5 w-5"></ng-icon>
                Para Doctores Administradores:
              </h3>
              <ul class="space-y-2 text-sm text-hospital-gray-700">
                <li class="flex items-start gap-2">
                  <ng-icon name="heroCheckCircle" class="h-4 w-4 text-hospital-success mt-0.5"></ng-icon>
                  <span><strong>Nombre del Hospital:</strong> Aparecerá en el encabezado de todas las páginas y PDFs</span>
                </li>
                <li class="flex items-start gap-2">
                  <ng-icon name="heroCheckCircle" class="h-4 w-4 text-hospital-success mt-0.5"></ng-icon>
                  <span><strong>Dependencia:</strong> Se mostrará en el pie de página y documentos oficiales</span>
                </li>
                <li class="flex items-start gap-2">
                  <ng-icon name="heroCheckCircle" class="h-4 w-4 text-hospital-success mt-0.5"></ng-icon>
                  <span><strong>Vista Previa:</strong> Muestra cómo aparecerán los logos en los PDFs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Grid Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Logos Section -->
          <section class="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-hospital-gray-100">
            <header class="flex items-center gap-3 mb-4">
              <ng-icon name="heroPhoto" class="h-6 w-6 text-hospital-primary"></ng-icon>
              <h2 class="text-xl font-bold tracking-tight text-hospital-gray-800">
                Logos e Imágenes
              </h2>
            </header>

            <div class="space-y-6">
              <!-- Logo Principal -->
              <div>
                <label class="block text-sm font-medium text-hospital-gray-700 mb-2">
                  Logo Principal (Hospital)
                </label>
                <div class="flex items-center gap-4">
                  <div class="relative w-32 h-20 bg-hospital-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-hospital-gray-300">
                    <img [src]="configuracion.logo_principal" alt="Logo Principal" class="max-h-full max-w-full object-contain">
                  </div>
                  <div class="flex-1">
                    <label class="relative inline-block w-full cursor-pointer group">
                      <input type="file" (change)="subirLogo($event, 'principal')" accept=".png,.jpg,.jpeg,.svg" class="sr-only">
                      <div class="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-hospital-primary text-white hover:bg-hospital-primary-dark transition-all">
                        <ng-icon name="heroCloudArrowUp" class="h-5 w-5"></ng-icon>
                        <span class="text-sm font-medium">Seleccionar Archivo</span>
                      </div>
                    </label>
                    <p class="text-xs text-hospital-gray-500 mt-2">Aparecerá en la esquina derecha del header de los PDFs</p>
                  </div>
                </div>
              </div>

              <!-- Logo Gobierno -->
              <div>
                <label class="block text-sm font-medium text-hospital-gray-700 mb-2">
                  Logo de Gobierno
                </label>
                <div class="flex items-center gap-4">
                  <div class="relative w-32 h-20 bg-hospital-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-hospital-gray-300">
                    <img [src]="configuracion.logo_gobierno" alt="Logo Gobierno" class="max-h-full max-w-full object-contain">
                  </div>
                  <div class="flex-1">
                    <label class="relative inline-block w-full cursor-pointer group">
                      <input type="file" (change)="subirLogo($event, 'gobierno')" accept=".png,.jpg,.jpeg,.svg" class="sr-only">
                      <div class="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-hospital-primary text-white hover:bg-hospital-primary-dark transition-all">
                        <ng-icon name="heroCloudArrowUp" class="h-5 w-5"></ng-icon>
                        <span class="text-sm font-medium">Seleccionar Archivo</span>
                      </div>
                    </label>
                    <p class="text-xs text-hospital-gray-500 mt-2">Aparecerá en la esquina izquierda del header de los PDFs</p>
                  </div>
                </div>
              </div>

              <!-- Logo Sidebar -->
              <div>
                <label class="block text-sm font-medium text-hospital-gray-700 mb-2">
                  Logo Sidebar (Navegación)
                </label>
                <div class="flex items-center gap-4">
                  <div class="relative w-16 h-16 bg-hospital-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-hospital-gray-300">
                    <img [src]="configuracion.logo_sidebar" alt="Logo Sidebar" class="max-h-full max-w-full object-contain">
                  </div>
                  <div class="flex-1">
                    <label class="relative inline-block w-full cursor-pointer group">
                      <input type="file" (change)="subirLogo($event, 'sidebar')" accept=".png,.jpg,.jpeg,.svg" class="sr-only">
                      <div class="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-hospital-primary text-white hover:bg-hospital-primary-dark transition-all">
                        <ng-icon name="heroCloudArrowUp" class="h-5 w-5"></ng-icon>
                        <span class="text-sm font-medium">Seleccionar Archivo</span>
                      </div>
                    </label>
                    <p class="text-xs text-hospital-gray-500 mt-2">Aparece en la barra lateral de navegación del sistema</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información General -->
            <div class="mt-8">
              <h3 class="text-lg font-semibold text-hospital-gray-800 mb-4">Información General</h3>

              <form [formGroup]="configForm" (ngSubmit)="guardarConfiguracion()" class="space-y-4">
                <!-- Nombre Hospital -->
                <div>
                  <label class="block text-sm font-medium text-hospital-gray-700 mb-1">
                    Nombre del Hospital
                  </label>
                  <input
                    type="text"
                    formControlName="nombre_hospital"
                    placeholder="Hospital General San Luis de la Paz"
                    class="w-full px-3 py-2 border border-hospital-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hospital-primary focus:border-transparent"
                  />
                </div>

                <!-- Dependencia -->
                <div>
                  <label class="block text-sm font-medium text-hospital-gray-700 mb-1">
                    Dependencia
                  </label>
                  <input
                    type="text"
                    formControlName="nombre_dependencia"
                    placeholder="Secretaría de Salud de Guanajuato"
                    class="w-full px-3 py-2 border border-hospital-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hospital-primary focus:border-transparent"
                  />
                </div>

                <!-- Actions -->
                <div class="pt-4 flex gap-3">
                  <button
                    type="submit"
                    [disabled]="!configForm.valid || procesando"
                    class="flex-1 bg-hospital-primary text-white px-4 py-2 rounded-md hover:bg-hospital-primary-dark disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span *ngIf="!procesando">
                      <ng-icon name="heroArrowUpTray" class="h-4 w-4"></ng-icon>
                      Guardar Cambios
                    </span>
                    <span *ngIf="procesando" class="loading">Procesando...</span>
                  </button>

                  <button
                    type="button"
                    (click)="resetearConfiguracion()"
                    class="px-4 py-2 bg-hospital-gray-200 text-hospital-gray-700 rounded-md hover:bg-hospital-gray-300 flex items-center gap-2"
                  >
                    <ng-icon name="heroArrowPath" class="h-4 w-4"></ng-icon>
                    Restablecer
                  </button>
                </div>
              </form>
            </div>
          </section>

          <!-- Vista Previa Mejorada -->
          <section class="bg-white rounded-2xl shadow-lg p-6 border border-hospital-gray-100">
            <header class="flex items-center gap-3 mb-6">
              <ng-icon name="heroEye" class="h-6 w-6 text-hospital-primary"></ng-icon>
              <h2 class="text-xl font-bold text-hospital-gray-800">
                Vista Previa del PDF
              </h2>
            </header>

            <div class="space-y-6">
              <!-- Preview del Header del PDF -->
              <div>
                <h3 class="text-sm font-medium text-hospital-gray-700 mb-3">
                  Encabezado de Documentos PDF
                </h3>
                <div class="border-2 border-hospital-gray-200 rounded-lg overflow-hidden bg-white">
                  <!-- Header simulado del PDF -->
                  <div class="p-4 bg-gray-50 border-b">
                    <div class="flex items-center justify-between">
                      <!-- Logo Gobierno (izquierda) -->
                      <div class="w-20 h-12 flex items-center">
                        <img
                          [src]="configuracion.logo_gobierno"
                          alt="Logo Gobierno"
                          class="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <!-- Texto central -->
                      <div class="flex-1 text-center px-4">
                        <p class="text-xs font-bold text-hospital-gray-800 leading-tight">
                          {{ configuracion.nombre_hospital || 'HOSPITAL GENERAL SAN LUIS DE LA PAZ' }}
                        </p>
                        <p class="text-xs text-hospital-gray-600 mt-1">
                          HISTORIA CLÍNICA GENERAL
                        </p>
                      </div>

                      <!-- Logo Hospital (derecha) -->
                      <div class="w-20 h-12 flex items-center justify-end">
                        <img
                          [src]="configuracion.logo_principal"
                          alt="Logo Hospital"
                          class="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Contenido simulado del PDF -->
                  <div class="p-4">
                    <div class="space-y-2">
                      <div class="h-3 bg-hospital-gray-200 rounded w-3/4"></div>
                      <div class="h-3 bg-hospital-gray-200 rounded w-1/2"></div>
                      <div class="h-3 bg-hospital-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Preview del Sidebar -->
              <div>
                <h3 class="text-sm font-medium text-hospital-gray-700 mb-3">
                  Navegación del Sistema
                </h3>
                <div class="flex border-2 border-hospital-gray-200 rounded-lg overflow-hidden bg-white">
                  <!-- Sidebar simulado -->
                  <div class="w-16 bg-hospital-gray-800 p-2 flex flex-col items-center">
                    <img
                      [src]="configuracion.logo_sidebar"
                      alt="Logo Sidebar"
                      class="w-10 h-10 object-contain mb-3"
                    />
                    <div class="space-y-2">
                      <div class="w-8 h-8 bg-hospital-gray-700 rounded"></div>
                      <div class="w-8 h-8 bg-hospital-gray-700 rounded"></div>
                      <div class="w-8 h-8 bg-hospital-primary rounded"></div>
                    </div>
                  </div>

                  <!-- Contenido simulado -->
                  <div class="flex-1 p-4 bg-hospital-gray-50">
                    <div class="bg-white rounded p-3 mb-3">
                      <div class="h-2 bg-hospital-gray-200 rounded w-1/2 mb-2"></div>
                      <div class="h-2 bg-hospital-gray-200 rounded w-3/4"></div>
                    </div>
                    <div class="text-center py-4">
                      <p class="text-xs text-hospital-gray-500">
                        {{ configuracion.nombre_dependencia || 'Secretaría de Salud de Guanajuato' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Mensajes -->
        <div *ngIf="mensaje" class="fixed bottom-6 right-6 animate-slide-up z-50">
          <div
            [class]="[
              'flex items-start gap-3 p-4 rounded-lg shadow-lg text-sm max-w-sm',
              tipoMensaje === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            ]"
          >
            <ng-icon
              *ngIf="tipoMensaje === 'success'"
              name="heroCheckCircle"
              class="h-5 w-5 text-green-600"
            ></ng-icon>
            <ng-icon
              *ngIf="tipoMensaje === 'error'"
              name="heroXCircle"
              class="h-5 w-5 text-red-600"
            ></ng-icon>
            <span>{{ mensaje }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .loading::after {
        content: '';
        display: inline-block;
        width: 1rem;
        height: 1rem;
        border: 2px solid transparent;
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-left: 0.5rem;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .animate-slide-up {
        animation: slideUp 0.3s ease-out forwards;
      }

      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class ConfiguracionComponent implements OnInit {
  configForm!: FormGroup;
  configuracion!: ConfiguracionLogos;
  procesando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private configuracionService: ConfiguracionService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarConfiguracion();
  }

  private initForm(): void {
    this.configForm = this.fb.group({
      nombre_hospital: ['', [Validators.required, Validators.minLength(5)]],
      nombre_dependencia: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  private cargarConfiguracion(): void {
    this.configuracionService.configuracion$.subscribe((config) => {
      this.configuracion = config;
      this.configForm.patchValue(config);
    });
  }

  subirLogo(
    event: Event,
    tipo: 'principal' | 'sidebar' | 'favicon' | 'gobierno'
  ): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (archivo) {
      this.procesando = true;

      this.configuracionService.subirLogo(archivo, tipo).subscribe({
        next: (response) => {
          this.mostrarMensaje('Logo actualizado correctamente', 'success');
          this.procesando = false;
        },
        error: (error) => {
          console.error('❌ Error completo:', error);
          this.mostrarMensaje('Error al subir el logo', 'error');
          this.procesando = false;
        },
      });
    }
  }

  guardarConfiguracion(): void {
    if (this.configForm.valid) {
      this.procesando = true;

      this.configuracionService
        .actualizarConfiguracion(this.configForm.value)
        .subscribe({
          next: () => {
            this.mostrarMensaje(
              'Configuración guardada correctamente',
              'success'
            );
            this.procesando = false;
          },
          error: (error) => {
            this.mostrarMensaje('Error al guardar la configuración', 'error');
            this.procesando = false;
          },
        });
    }
  }

  resetearConfiguracion(): void {
    if (confirm('¿Estás seguro de restablecer la configuración por defecto?')) {
      this.procesando = true;

      this.configuracionService
        .actualizarConfiguracion({
          nombre_hospital: 'Hospital General San Luis de la Paz',
          nombre_dependencia: 'Secretaría de Salud de Guanajuato',
        })
        .subscribe({
          next: () => {
            this.mostrarMensaje('Configuración restablecida', 'success');
            this.procesando = false;
          },
          error: (error) => {
            this.mostrarMensaje('Error al restablecer', 'error');
            this.procesando = false;
          },
        });
    }
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;

    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }
}
