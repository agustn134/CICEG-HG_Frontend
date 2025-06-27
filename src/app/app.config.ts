import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter} from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth-guard';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    AuthService,
    AuthGuard,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // provideHttpClient(withInterceptorsFromDi())
  ]
};



// // src/app/app.config.ts
// import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// import { routes } from './app.routes';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideRouter(routes),
//     provideHttpClient(withInterceptorsFromDi())
//   ]
// };









// // src/app/app.config.ts
// import { ApplicationConfig, importProvidersFrom } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
// import { provideAnimations } from '@angular/platform-browser/animations';

// import { routes } from './app.routes';

// // Importar interceptors
// import {
//   HttpConfigInterceptor,
//   AuthInterceptor,
//   LoadingInterceptor,
//   CacheInterceptor
// } from './interceptors/http.interceptor';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     // ==========================================
//     // CONFIGURACIÓN BÁSICA
//     // ==========================================
//     provideRouter(routes),
//     provideHttpClient(),
//     provideAnimations(),

//     // ==========================================
//     // INTERCEPTORS HTTP
//     // ==========================================
//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: HttpConfigInterceptor,
//       multi: true
//     },
//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: AuthInterceptor,
//       multi: true
//     },
//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: LoadingInterceptor,
//       multi: true
//     },
//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: CacheInterceptor,
//       multi: true
//     }
//   ]
// };

// ==========================================
// EJEMPLO DE USO EN COMPONENTE
// ==========================================

/*
// src/app/ejemplo-uso-servicios/ejemplo.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importar servicios necesarios
import { ServiciosService } from '../services/catalogos/servicios';
import { ExpedientesService } from '../services/gestion-expedientes/expedientes';
import { SistemaInfoService } from '../services/sistema/info';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-ejemplo-uso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Ejemplo de Uso de Servicios</h1>

      <!-- Sistema Info -->
      <div class="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 class="text-lg font-semibold mb-2">Información del Sistema</h2>
        @if (sistemaInfo(); as info) {
          <p><strong>Hospital:</strong> {{ info.hospital }}</p>
          <p><strong>Versión:</strong> {{ info.version }}</p>
          <p><strong>Estado:</strong> {{ info.estado }}</p>
        }
        @if (healthCheck(); as health) {
          <p><strong>Estado API:</strong> {{ health.status }}</p>
          <p><strong>Tiempo activo:</strong> {{ formatUptime(health.uptime) }}</p>
        }
      </div>

      <!-- Servicios -->
      <div class="mb-6 p-4 bg-green-50 rounded-lg">
        <h2 class="text-lg font-semibold mb-2">Servicios Médicos</h2>
        <div class="mb-2">
          <button
            (click)="cargarServicios()"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            [disabled]="serviciosService.loading$()"
          >
            @if (serviciosService.loading$()) {
              Cargando...
            } @else {
              Cargar Servicios
            }
          </button>
        </div>

        @if (servicios().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (servicio of servicios(); track servicio.id_servicio) {
              <div class="p-3 bg-white border rounded-lg">
                <h3 class="font-semibold">{{ servicio.nombre }}</h3>
                <p class="text-sm text-gray-600">{{ servicio.descripcion }}</p>
                <span class="inline-block px-2 py-1 text-xs rounded-full"
                      [class]="servicio.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ servicio.activo ? 'Activo' : 'Inactivo' }}
                </span>
                @if (servicio.total_personal) {
                  <p class="text-sm mt-1">Personal: {{ servicio.total_personal }}</p>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- Búsqueda de Expedientes -->
      <div class="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h2 class="text-lg font-semibold mb-2">Búsqueda de Expedientes</h2>
        <div class="flex gap-2 mb-4">
          <input
            type="text"
            [(ngModel)]="busquedaExpediente"
            placeholder="Buscar por número o nombre del paciente"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <button
            (click)="buscarExpedientes()"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            [disabled]="expedientesService.loading$()"
          >
            Buscar
          </button>
        </div>

        @if (expedientes().length > 0) {
          <div class="space-y-2">
            @for (expediente of expedientes(); track expediente.id_expediente) {
              <div class="p-3 bg-white border rounded-lg flex justify-between items-center">
                <div>
                  <h3 class="font-semibold">{{ expediente.numero_expediente }}</h3>
                  @if (expediente.paciente) {
                    <p class="text-sm text-gray-600">
                      {{ expediente.paciente.nombre }} {{ expediente.paciente.apellido_paterno }}
                    </p>
                  }
                  <p class="text-xs text-gray-500">
                    Apertura: {{ expediente.fecha_apertura | date:'dd/MM/yyyy' }}
                  </p>
                </div>
                <div class="text-right">
                  @if (expediente.total_consultas) {
                    <p class="text-sm">Consultas: {{ expediente.total_consultas }}</p>
                  }
                  <button
                    (click)="verExpedienteCompleto(expediente.id_expediente)"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Ver Completo
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Autenticación -->
      <div class="mb-6 p-4 bg-purple-50 rounded-lg">
        <h2 class="text-lg font-semibold mb-2">Estado de Autenticación</h2>
        @if (authService.isAuthenticated()) {
          <div>
            <p><strong>Usuario:</strong> {{ authService.userDisplayName() }}</p>
            <p><strong>Rol:</strong> {{ authService.userRole() }}</p>
            <p><strong>Tiempo de sesión restante:</strong> {{ tiempoSesionRestante() }} minutos</p>
            <button
              (click)="authService.logout()"
              class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
          </div>
        } @else {
          <p class="text-red-600">No autenticado</p>
          <button
            (click)="mostrarLogin()"
            class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Iniciar Sesión
          </button>
        }
      </div>

      <!-- Estadísticas -->
      @if (estadisticasServicios(); as stats) {
        <div class="p-4 bg-gray-50 rounded-lg">
          <h2 class="text-lg font-semibold mb-2">Estadísticas de Servicios</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ stats.total_servicios }}</div>
              <div class="text-sm text-gray-600">Total Servicios</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ stats.servicios_activos }}</div>
              <div class="text-sm text-gray-600">Activos</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ stats.servicios_con_personal }}</div>
              <div class="text-sm text-gray-600">Con Personal</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ stats.promedio_personal_por_servicio | number:'1.1-1' }}</div>
              <div class="text-sm text-gray-600">Promedio Personal</div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class EjemploUsoComponent implements OnInit {
  // ==========================================
  // INYECCIÓN DE SERVICIOS
  // ==========================================
  serviciosService = inject(ServiciosService);
  expedientesService = inject(ExpedientesService);
  sistemaInfoService = inject(SistemaInfoService);
  authService = inject(AuthService);

  // ==========================================
  // SIGNALS PARA ESTADO DEL COMPONENTE
  // ==========================================
  sistemaInfo = signal<any>(null);
  healthCheck = signal<any>(null);
  servicios = signal<any[]>([]);
  expedientes = signal<any[]>([]);
  estadisticasServicios = signal<any>(null);

  // Formularios
  busquedaExpediente = '';

  // ==========================================
  // LIFECYCLE
  // ==========================================
  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  // ==========================================
  // MÉTODOS DEL COMPONENTE
  // ==========================================

  async cargarDatosIniciales(): Promise<void> {
    try {
      // Cargar información del sistema
      const info = await this.sistemaInfoService.getInfoSistema().toPromise();
      this.sistemaInfo.set(info);

      // Verificar salud de la API
      const health = await this.sistemaInfoService.getHealthCheck().toPromise();
      this.healthCheck.set(health);

      // Cargar estadísticas si el usuario está autenticado
      if (this.authService.isAuthenticated()) {
        this.cargarEstadisticas();
      }

    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
  }

  cargarServicios(): void {
    this.serviciosService.getAll({ activo: true, limit: 20 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.servicios.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
      }
    });
  }

  buscarExpedientes(): void {
    if (!this.busquedaExpediente.trim()) return;

    this.expedientesService.buscarExpediente(this.busquedaExpediente).subscribe({
      next: (expedientes) => {
        this.expedientes.set(expedientes);
      },
      error: (error) => {
        console.error('Error al buscar expedientes:', error);
      }
    });
  }

  verExpedienteCompleto(idExpediente: number): void {
    this.expedientesService.getExpedienteCompleto(idExpediente).subscribe({
      next: (expediente) => {
        console.log('Expediente completo:', expediente);
        // Aquí puedes navegar a una página de detalle o abrir un modal
      },
      error: (error) => {
        console.error('Error al obtener expediente completo:', error);
      }
    });
  }

  cargarEstadisticas(): void {
    this.serviciosService.getEstadisticas().subscribe({
      next: (stats) => {
        this.estadisticasServicios.set(stats);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  formatUptime(uptime: number): string {
    return this.sistemaInfoService.formatearUptime(uptime);
  }

  tiempoSesionRestante(): number {
    return this.authService.getSessionTimeRemaining();
  }

  mostrarLogin(): void {
    // Implementar lógica de login
    console.log('Mostrar formulario de login');
  }
}
*/
