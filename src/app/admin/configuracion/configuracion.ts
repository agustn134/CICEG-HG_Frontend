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
          <div
            class="inline-flex items-center justify-center bg-hospital-primary p-3 rounded-full mb-4"
          >
            <ng-icon name="heroCog6Tooth" class="h-8 w-8 text-white"></ng-icon>
          </div>
          <h1 class="text-3xl font-bold text-hospital-gray-900 mb-2">
            Configuración del Sistema
          </h1>
          <p class="text-hospital-gray-600">
            Personaliza la apariencia y contenido de tu sistema hospitalario
          </p>
        </div>


        <!-- Dentro del template, después del header y antes del grid layout -->
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
        <!-- <li class="flex items-start gap-2">
          <ng-icon name="heroCheckCircle" class="h-4 w-4 text-hospital-success mt-0.5"></ng-icon>
          <span><strong>Favicon:</strong> Use formato .ico (ideal), PNG o SVG (32x32px)</span>
        </li> -->
        <li class="flex items-start gap-2">
          <ng-icon name="heroCheckCircle" class="h-4 w-4 text-hospital-success mt-0.5"></ng-icon>
          <span><strong>Tamaño máximo:</strong> 2MB por imagen</span>
        </li>
        <li class="flex items-start gap-2">
          <ng-icon name="heroCheckCircle" class="h-4 w-4 text-hospital-success mt-0.5"></ng-icon>
          <span><strong>Colores:</strong> El color primario afectará el encabezado y elementos principales</span>
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
          <span><strong>Nombre del Hospital:</strong> Este aparecerá en el encabezado de todas las páginas</span>
        </li>
        <li class="flex items-start gap-2">
          <ng-icon name="heroCheckCircle" class="h-4 w-4 text-hospital-success mt-0.5"></ng-icon>
          <span><strong>Dependencia:</strong> Se mostrará en el pie de página y documentos</span>
        </li>
        <li class="flex items-start gap-2">
          <ng-icon name="heroCheckCircle" class="h-4 w-4 text-hospital-success mt-0.5"></ng-icon>
          <span><strong>Vista Previa:</strong> Verifique los cambios antes de guardar</span>
        </li>
        <li class="flex items-start gap-2">
          <ng-icon name="heroCheckCircle" class="h-4 w-4 text-hospital-success mt-0.5"></ng-icon>
          <span><strong>Restablecer:</strong> Use solo si necesita volver a la configuración original</span>
        </li>
      </ul>
    </div>
  </div>

  <div class="mt-6 bg-hospital-warning-light border-l-4 border-hospital-warning p-4">
    <div class="flex items-start gap-3">
      <ng-icon name="heroExclamationTriangle" class="h-5 w-5 text-hospital-warning-dark mt-0.5"></ng-icon>
      <div>
        <h4 class="font-medium text-hospital-gray-900">¡Importante!</h4>
        <p class="text-sm text-hospital-gray-700 mt-1">
          Todos los cambios afectarán la apariencia del sistema para todos los usuarios.
          Verifique en la sección "Vista Previa" antes de guardar.
        </p>
      </div>
    </div>
  </div>
</div>

        <!-- Grid Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Logos Section -->
          <section
            class="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-hospital-gray-100"
          >
            <header class="flex items-center gap-3 mb-4">
              <ng-icon
                name="heroPhoto"
                class="h-6 w-6 text-hospital-primary"
              ></ng-icon>
              <h2
                class="text-xl font-bold tracking-tight text-hospital-gray-800"
              >
                Logos e Imágenes
              </h2>
            </header>

            <div class="space-y-6">
             <!-- Logo Principal -->
<div>
  <label class="block text-sm font-medium text-hospital-gray-700 mb-2">Logo Principal</label>
  <div class="flex items-center gap-4">
    <div class="relative w-24 h-16 bg-hospital-gray-100 rounded-form flex items-center justify-center overflow-hidden">
      <img [src]="configuracion.logo_principal" alt="Logo Principal" class="max-h-full max-w-full object-contain">
    </div>
    <label class="relative inline-block w-full cursor-pointer group">
      <input type="file" (change)="subirLogo($event, 'principal')" accept=".png,.jpg,.jpeg,.svg" class="sr-only">
      <div class="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-hospital-primary-light text-white hover:bg-hospital-primary transition-all">
        <ng-icon name="heroCloudArrowUp" class="h-4 w-4"></ng-icon>
        <span class="text-sm font-medium">Subir</span>
      </div>
    </label>
  </div>
</div>

<!-- Logo Sidebar -->
<div>
  <label class="block text-sm font-medium text-hospital-gray-700 mb-2">Logo Sidebar</label>
  <div class="flex items-center gap-4">
    <div class="relative w-24 h-16 bg-hospital-gray-100 rounded-form flex items-center justify-center overflow-hidden">
      <img [src]="configuracion.logo_sidebar" alt="Logo Sidebar" class="max-h-full max-w-full object-contain">
    </div>
    <label class="relative inline-block w-full cursor-pointer group">
      <input type="file" (change)="subirLogo($event, 'sidebar')" accept=".png,.jpg,.jpeg,.svg" class="sr-only">
      <div class="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-hospital-primary-light text-white hover:bg-hospital-primary transition-all">
        <ng-icon name="heroCloudArrowUp" class="h-4 w-4"></ng-icon>
        <span class="text-sm font-medium">Subir</span>
      </div>
    </label>
  </div>
</div>

<!-- Favicon -->
<!-- <div>
  <label class="block text-sm font-medium text-hospital-gray-700 mb-2">Favicon</label>
  <div class="flex items-center gap-4">
    <div class="relative w-16 h-16 bg-hospital-gray-100 rounded-form flex items-center justify-center overflow-hidden">
      <img [src]="configuracion.favicon" alt="Favicon" class="max-h-full max-w-full object-contain">
    </div>
    <label class="relative inline-block w-full cursor-pointer group">
      <input type="file" (change)="subirLogo($event, 'favicon')" accept=".ico,.png,.svg" class="sr-only">
      <div class="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-hospital-primary-light text-white hover:bg-hospital-primary transition-all">
        <ng-icon name="heroCloudArrowUp" class="h-4 w-4"></ng-icon>
        <span class="text-sm font-medium">Subir</span>
      </div>
    </label>
  </div>
</div> -->

<!-- Logo Gobierno -->
<div>
  <label class="block text-sm font-medium text-hospital-gray-700 mb-2">Logo de Gobierno</label>
  <div class="flex items-center gap-4">
    <div class="relative w-24 h-16 bg-hospital-gray-100 rounded-form flex items-center justify-center overflow-hidden">
      <img [src]="configuracion.logo_gobierno" alt="Logo Gobierno" class="max-h-full max-w-full object-contain">
    </div>
    <label class="relative inline-block w-full cursor-pointer group">
      <input type="file" (change)="subirLogo($event, 'gobierno')" accept=".png,.jpg,.jpeg,.svg" class="sr-only">
      <div class="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-hospital-primary-light text-white hover:bg-hospital-primary transition-all">
        <ng-icon name="heroCloudArrowUp" class="h-4 w-4"></ng-icon>
        <span class="text-sm font-medium">Subir</span>
      </div>
    </label>
  </div>
</div>


            </div>
          </section>

          <!-- Textos y Colores -->
          <div class="bg-white rounded-card shadow-card p-6">
            <div class="flex items-center gap-3 mb-6">
              <ng-icon
                name="heroDocumentText"
                class="h-6 w-6 text-hospital-primary"
              ></ng-icon>
              <h2 class="text-xl font-semibold text-hospital-gray-800">
                Configuración General
              </h2>
            </div>

            <form
              [formGroup]="configForm"
              (ngSubmit)="guardarConfiguracion()"
              class="space-y-4"
            >
              <!-- Nombre Hospital -->
              <div>
                <label
                  class="block text-sm font-medium text-hospital-gray-700 mb-1"
                  >Nombre del Hospital</label
                >
                <div class="relative">

                  <input
                    type="text"
                    formControlName="nombre_hospital"
                    placeholder="Hospital General San Luis de la Paz"
                    class="form-field pl-10"
                  />
                </div>
              </div>

              <!-- Dependencia -->
              <div>
                <label
                  class="block text-sm font-medium text-hospital-gray-700 mb-1"
                  >Dependencia</label
                >
                <div class="relative">

                  <input
                    type="text"
                    formControlName="nombre_dependencia"
                    placeholder="Secretaría de Salud de Guanajuato"
                    class="form-field pl-10"
                  />
                </div>
              </div>

              <!-- Color Primario -->
              <div>
                <label
                  class="block text-sm font-medium text-hospital-gray-700 mb-1"
                  >Color Primario</label
                >
                <div class="flex items-center gap-3">
                  <ng-icon
                    name="heroPaintBrush"
                    class="h-5 w-5 text-hospital-gray-400"
                  ></ng-icon>
                  <input
                    type="color"
                    formControlName="color_primario"
                    class="w-12 h-12 rounded-full overflow-hidden cursor-pointer"
                  />
                  <span class="text-sm text-hospital-gray-500">{{
                    configForm.value.color_primario
                  }}</span>
                </div>
              </div>

              <!-- Color Secundario -->
              <div>
                <label
                  class="block text-sm font-medium text-hospital-gray-700 mb-1"
                  >Color Secundario</label
                >
                <div class="flex items-center gap-3">
                  <ng-icon
                    name="heroPaintBrush"
                    class="h-5 w-5 text-hospital-gray-400"
                  ></ng-icon>
                  <input
                    type="color"
                    formControlName="color_secundario"
                    class="w-12 h-12 rounded-full overflow-hidden cursor-pointer"
                  />
                  <span class="text-sm text-hospital-gray-500">{{
                    configForm.value.color_secundario
                  }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="pt-4 flex gap-3">
                <button
                  type="submit"
                  [disabled]="!configForm.valid || procesando"
                  class="btn-hospital bg-hospital-primary text-white hover:bg-hospital-primary-dark flex-1 flex items-center justify-center gap-2"
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
                  class="btn-hospital bg-hospital-gray-200 text-hospital-gray-700 hover:bg-hospital-gray-300 flex items-center justify-center gap-2"
                >
                  <ng-icon name="heroArrowPath" class="h-4 w-4"></ng-icon>
                  Restablecer
                </button>
              </div>
            </form>
          </div>

          <!-- Vista Previa -->
          <div class="bg-white rounded-card shadow-card p-6">
            <div class="flex items-center gap-3 mb-6">
              <ng-icon
                name="heroEye"
                class="h-6 w-6 text-hospital-primary"
              ></ng-icon>
              <h2 class="text-xl font-semibold text-hospital-gray-800">
                Vista Previa
              </h2>
            </div>

            <div
              class="border border-hospital-gray-200 rounded-form overflow-hidden"
            >
              <!-- Header Preview -->
              <div
                class="h-16 flex items-center px-4"
                [style.background]="configuracion.color_primario"
              >
                <div class="flex items-center gap-3">
                  <img
                    [src]="configuracion.logo_principal"
                    alt="Logo"
                    class="h-10 object-contain"
                  />
                  <span class="text-white font-medium">{{
                    configuracion.nombre_hospital
                  }}</span>
                </div>
              </div>

              <!-- Sidebar Preview -->
              <div class="flex">
                <div
                  class="w-16 bg-hospital-gray-800 h-48 flex flex-col items-center py-4"
                >
                  <img
                    [src]="configuracion.logo_sidebar"
                    alt="Sidebar Logo"
                    class="w-10 h-10 object-contain mb-4"
                  />
                  <div class="h-px w-8 bg-hospital-gray-600 my-2"></div>
                  <div
                    class="w-10 h-10 bg-hospital-gray-700 rounded-full mb-2"
                  ></div>
                  <div
                    class="w-10 h-10 bg-hospital-gray-700 rounded-full mb-2"
                  ></div>
                  <div
                    class="w-10 h-10 bg-hospital-gray-700 rounded-full"
                  ></div>
                </div>

                <!-- Content Preview -->
                <div class="flex-1 bg-hospital-gray-50 p-4">
                  <div class="bg-white rounded-form shadow-card-hover p-4 mb-4">
                    <div
                      class="h-4 bg-hospital-gray-200 rounded-full w-3/4 mb-2"
                    ></div>
                    <div
                      class="h-4 bg-hospital-gray-200 rounded-full w-1/2"
                    ></div>
                  </div>

                  <div class="text-center py-8">
                    <div
                      class="inline-flex items-center justify-center bg-hospital-primary-light p-2 rounded-full mb-3"
                    >
                      <ng-icon
                        name="heroShieldCheck"
                        class="h-6 w-6 text-white"
                      ></ng-icon>
                    </div>
                    <p class="text-sm text-hospital-gray-500">
                      {{ configuracion.nombre_dependencia }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensajes -->
        <div *ngIf="mensaje" class="fixed bottom-6 right-6 animate-slide-up">
          <div
            [class]="[
              'flex items-start gap-3 p-4 rounded-card shadow-card text-sm',
              tipoMensaje === 'success'
                ? 'bg-hospital-success-light text-hospital-success-dark'
                : 'bg-hospital-emergency-light text-hospital-emergency-dark'
            ]"
          >
            <ng-icon
              *ngIf="tipoMensaje === 'success'"
              name="heroCheckCircle"
              class="h-5 w-5"
            ></ng-icon>
            <ng-icon
              *ngIf="tipoMensaje === 'error'"
              name="heroXCircle"
              class="h-5 w-5"
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
      color_primario: ['#1e40af', [Validators.required]],
      color_secundario: ['#3b82f6', [Validators.required]],
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

          // Actualizar preview inmediatamente
          const reader = new FileReader();
          reader.onload = (e) => {
            const campo = `logo_${tipo}` as keyof ConfiguracionLogos;
            this.configuracion = {
              ...this.configuracion,
              [campo]: e.target?.result as string,
            };
          };
          reader.readAsDataURL(archivo);
        },
        error: (error) => {
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
          color_primario: '#1e40af',
          color_secundario: '#3b82f6',
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
