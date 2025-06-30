// // src/app/personas/pacientes/pacientes.ts
// import { Component, OnInit, OnDestroy, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
// import { Router } from '@angular/router';
// import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// // Importaciones de modelos y servicios
// import {
//   Paciente,
//   PacienteFilters,
//   PacienteBusqueda,
//   EstadisticasPacientes,
//   Genero,
//   ApiResponse
// } from '../../models';
// import { PacientesService } from '../../services/personas/pacientes';

// @Component({
//   selector: 'app-pacientes',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule
//   ],
//   templateUrl: './pacientes.html',
//   styleUrl: './pacientes.css'
// })
// export class Pacientes implements OnInit, OnDestroy {

//   // ==========================================
//   // INYECCIÓN DE DEPENDENCIAS
//   // ==========================================
//   private pacientesService = inject(PacientesService);
//   private fb = inject(FormBuilder);
//   private router = inject(Router);
//   private destroy$ = new Subject<void>();

//   // ==========================================
//   // PROPIEDADES DEL COMPONENTE
//   // ==========================================

//   // Datos principales
//   pacientes: Paciente[] = [];
//   pacienteSeleccionado: Paciente | null = null;
//   estadisticas: EstadisticasPacientes | null = null;

//   // Estados de la UI
//   loading = false;
//   error: string | null = null;
//   mostrarFiltros = false;
//   mostrarEstadisticas = false;
//   vistaActual: 'lista' | 'tarjetas' | 'tabla' = 'tabla';

//   // Paginación
//   paginaActual = 1;
//   totalPaginas = 1;
//   totalRegistros = 0;
//   registrosPorPagina = 10;

//   // Búsqueda y filtros
//   textoBusqueda = '';
//   filtrosForm: FormGroup;
//   filtrosAplicados: PacienteFilters = {};

//   // Configuraciones
//  // Configuraciones
// readonly opcionesRegistrosPorPagina = [5, 10, 20, 50];
// readonly opcionesGenero: { valor: Genero | '', etiqueta: string }[] = [
//   { valor: '', etiqueta: 'Todos' },
//   { valor: Genero.MASCULINO, etiqueta: 'Masculino' },
//   { valor: Genero.FEMENINO, etiqueta: 'Femenino' }
// ];

//   // ==========================================
//   // CONSTRUCTOR Y CICLO DE VIDA
//   // ==========================================

//   constructor() {
//     this.filtrosForm = this.fb.group({
//       sexo: [''],
//       edad_min: [''],
//       edad_max: [''],
//       tiene_alergias: [''],
//       buscar: ['']
//     });
//   }

//   ngOnInit(): void {
//     this.inicializarComponente();
//     this.configurarBusquedaEnTiempoReal();
//     this.suscribirAEstadoDelServicio();
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   // ==========================================
//   // MÉTODOS DE INICIALIZACIÓN
//   // ==========================================

//   private inicializarComponente(): void {
//     this.cargarPacientes();
//     this.cargarEstadisticas();
//   }

//   private configurarBusquedaEnTiempoReal(): void {
//     this.filtrosForm.get('buscar')?.valueChanges
//       .pipe(
//         debounceTime(300),
//         distinctUntilChanged(),
//         takeUntil(this.destroy$)
//       )
//       .subscribe(valor => {
//         this.textoBusqueda = valor;
//         this.aplicarFiltros();
//       });
//   }

//   private suscribirAEstadoDelServicio(): void {
//     // Suscribirse al estado de loading
//     this.pacientesService.loading$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(loading => this.loading = loading);

//     // Suscribirse a errores
//     this.pacientesService.error$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(error => this.error = error);

//     // Suscribirse a los pacientes
//     this.pacientesService.pacientes$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(pacientes => this.pacientes = pacientes);
//   }

//   // ==========================================
//   // MÉTODOS DE CARGA DE DATOS
//   // ==========================================

//   cargarPacientes(): void {
//     const filtros: PacienteFilters = {
//       ...this.filtrosAplicados,
//       page: this.paginaActual,
//       limit: this.registrosPorPagina
//     };

//     this.pacientesService.getPacientes(filtros)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (response: ApiResponse<Paciente[]>) => {
//           if (response.success && response.data) {
//             this.pacientes = response.data;
//             // Actualizar información de paginación si viene en la respuesta
//             if (response.pagination) {
//               this.totalRegistros = response.pagination.total;
//               this.totalPaginas = Math.ceil(this.totalRegistros / this.registrosPorPagina);
//             }
//           }
//         },
//         error: (error) => {
//           this.mostrarError('Error al cargar pacientes: ' + error.message);
//         }
//       });
//   }

//   cargarEstadisticas(): void {
//     this.pacientesService.getEstadisticas()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (response: ApiResponse<EstadisticasPacientes>) => {
//           if (response.success && response.data) {
//             this.estadisticas = response.data;
//           }
//         },
//         error: (error) => {
//           console.warn('No se pudieron cargar las estadísticas:', error);
//         }
//       });
//   }

//   recargarDatos(): void {
//     this.limpiarError();
//     this.cargarPacientes();
//     this.cargarEstadisticas();
//   }

//   // ==========================================
//   // MÉTODOS DE BÚSQUEDA Y FILTROS
//   // ==========================================

//   aplicarFiltros(): void {
//     const valoresFiltros = this.filtrosForm.value;

//     this.filtrosAplicados = {
//       sexo: valoresFiltros.sexo || undefined,
//       edad_min: valoresFiltros.edad_min || undefined,
//       edad_max: valoresFiltros.edad_max || undefined,
//       tiene_alergias: valoresFiltros.tiene_alergias === '' ? undefined : valoresFiltros.tiene_alergias,
//       buscar: this.textoBusqueda || undefined
//     };

//     this.paginaActual = 1; // Resetear a la primera página
//     this.cargarPacientes();
//   }

//   limpiarFiltros(): void {
//     this.filtrosForm.reset();
//     this.textoBusqueda = '';
//     this.filtrosAplicados = {};
//     this.paginaActual = 1;
//     this.cargarPacientes();
//   }

//   toggleFiltros(): void {
//     this.mostrarFiltros = !this.mostrarFiltros;
//   }

//   // ==========================================
//   // MÉTODOS DE PAGINACIÓN
//   // ==========================================

//   cambiarPagina(nuevaPagina: number): void {
//     if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
//       this.paginaActual = nuevaPagina;
//       this.cargarPacientes();
//     }
//   }

//   cambiarRegistrosPorPagina(nuevaCantidad: number): void {
//     this.registrosPorPagina = nuevaCantidad;
//     this.paginaActual = 1;
//     this.cargarPacientes();
//   }

//   get paginasVisibles(): number[] {
//     const paginas: number[] = [];
//     const inicio = Math.max(1, this.paginaActual - 2);
//     const fin = Math.min(this.totalPaginas, this.paginaActual + 2);

//     for (let i = inicio; i <= fin; i++) {
//       paginas.push(i);
//     }
//     return paginas;
//   }

//   // ==========================================
//   // MÉTODOS DE NAVEGACIÓN Y ACCIONES
//   // ==========================================

//   verDetallePaciente(paciente: Paciente): void {
//     this.pacienteSeleccionado = paciente;
//     this.router.navigate(['/personas/pacientes', paciente.id_paciente]);
//   }

//   editarPaciente(paciente: Paciente): void {
//     this.router.navigate(['/personas/pacientes', paciente.id_paciente, 'editar']);
//   }

//   crearNuevoPaciente(): void {
//     this.router.navigate(['/personas/pacientes/nuevo']);
//   }

//   eliminarPaciente(paciente: Paciente): void {
//     if (confirm(`¿Está seguro de eliminar al paciente ${paciente.nombre_completo}?`)) {
//       this.pacientesService.deletePaciente(paciente.id_paciente!)
//         .pipe(takeUntil(this.destroy$))
//         .subscribe({
//           next: (response) => {
//             if (response.success) {
//               this.mostrarMensaje('Paciente eliminado correctamente');
//               this.cargarPacientes();
//             }
//           },
//           error: (error) => {
//             this.mostrarError('Error al eliminar paciente: ' + error.message);
//           }
//         });
//     }
//   }

//   verHistorialMedico(paciente: Paciente): void {
//     this.router.navigate(['/personas/pacientes', paciente.id_paciente, 'historial']);
//   }

//   verExpedientes(paciente: Paciente): void {
//     this.router.navigate(['/expedientes'], {
//       queryParams: { paciente: paciente.id_paciente }
//     });
//   }

//   // ==========================================
//   // MÉTODOS DE UTILIDAD PARA LA UI
//   // ==========================================

//   cambiarVista(nuevaVista: 'lista' | 'tarjetas' | 'tabla'): void {
//     this.vistaActual = nuevaVista;
//   }

//   toggleEstadisticas(): void {
//     this.mostrarEstadisticas = !this.mostrarEstadisticas;
//   }

//   formatearFecha(fecha: string): string {
//     if (!fecha) return 'No disponible';
//     return new Date(fecha).toLocaleDateString('es-MX', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric'
//     });
//   }

//   calcularEdad(fechaNacimiento: string): number {
//     if (!fechaNacimiento) return 0;
//     const hoy = new Date();
//     const nacimiento = new Date(fechaNacimiento);
//     let edad = hoy.getFullYear() - nacimiento.getFullYear();
//     const diferenciaMeses = hoy.getMonth() - nacimiento.getMonth();

//     if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < nacimiento.getDate())) {
//       edad--;
//     }

//     return edad;
//   }

//   obtenerClasePorGenero(genero: Genero): string {
//     return genero === Genero.MASCULINO ? 'badge-primary' : 'badge-secondary';
//   }

//   obtenerIconoPorGenero(genero: Genero): string {
//     return genero === Genero.MASCULINO ? '♂' : '♀';
//   }

//   obtenerTextoGenero(genero: Genero): string {
//     return genero === Genero.MASCULINO ? 'Masculino' : 'Femenino';
//   }

//   tieneAlergias(paciente: Paciente): boolean {
//     return !!(paciente.alergias && paciente.alergias.trim().length > 0);
//   }

//   tieneFamiliarResponsable(paciente: Paciente): boolean {
//     return !!(paciente.familiar_responsable && paciente.familiar_responsable.trim().length > 0);
//   }

//   // ==========================================
//   // MÉTODOS DE MANEJO DE ERRORES Y MENSAJES
//   // ==========================================

//   private mostrarError(mensaje: string): void {
//     this.error = mensaje;
//     console.error(mensaje);
//   }

//   private mostrarMensaje(mensaje: string): void {
//     // Aquí podrías implementar un sistema de notificaciones
//     console.log(mensaje);
//   }

//   limpiarError(): void {
//     this.error = null;
//   }

//   // ==========================================
//   // GETTERS PARA TEMPLATES
//   // ==========================================

//   get hayPacientes(): boolean {
//     return this.pacientes.length > 0;
//   }

//   get hayFiltrosAplicados(): boolean {
//     return Object.keys(this.filtrosAplicados).some(key =>
//       this.filtrosAplicados[key as keyof PacienteFilters] !== undefined
//     );
//   }

//   get textoPaginacion(): string {
//     if (!this.hayPacientes) return 'No hay registros';

//     const inicio = ((this.paginaActual - 1) * this.registrosPorPagina) + 1;
//     const fin = Math.min(this.paginaActual * this.registrosPorPagina, this.totalRegistros);

//     return `Mostrando ${inicio}-${fin} de ${this.totalRegistros} registros`;
//   }

//   get puedeIrAnterior(): boolean {
//     return this.paginaActual > 1;
//   }

//   get puedeIrSiguiente(): boolean {
//     return this.paginaActual < this.totalPaginas;
//   }
// }
// src/app/personas/pacientes/pacientes.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Importaciones de modelos y servicios
import {
  Paciente,
  PacienteFilters,
  EstadisticasPacientes,
  Genero,
  ApiResponse
} from '../../models';
import { PacientesService } from '../../services/personas/pacientes';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css'
})
export class Pacientes implements OnInit, OnDestroy {

  // ==========================================
  // INYECCIÓN DE DEPENDENCIAS
  // ==========================================
  private pacientesService = inject(PacientesService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // ==========================================
  // PROPIEDADES DEL COMPONENTE
  // ==========================================

  // Datos principales
  pacientes: Paciente[] = [];
  pacienteSeleccionado: Paciente | null = null;
  estadisticas: EstadisticasPacientes | null = null;

  // Estados de la UI
  loading = false;
  error: string | null = null;
  mostrarFiltros = false;
  mostrarEstadisticas = false;
  vistaActual: 'tabla' | 'tarjetas' = 'tabla';

  // Búsqueda y filtros
  textoBusqueda = '';
  filtrosForm: FormGroup;
  filtrosAplicados: PacienteFilters = {};

  // Configuraciones simplificadas
  readonly opcionesGenero: { valor: Genero | '', etiqueta: string }[] = [
    { valor: '', etiqueta: 'Todos' },
    { valor: Genero.MASCULINO, etiqueta: 'Masculino' },
    { valor: Genero.FEMENINO, etiqueta: 'Femenino' }
  ];

  // Exponer enum para el template
  readonly Genero = Genero;

  // ==========================================
  // CONSTRUCTOR Y CICLO DE VIDA
  // ==========================================

  constructor() {
    this.filtrosForm = this.fb.group({
      sexo: [''],
      edad_min: [''],
      edad_max: [''],
      tiene_alergias: [''],
      buscar: ['']
    });
  }

  ngOnInit(): void {
    this.inicializarComponente();
    this.configurarBusquedaEnTiempoReal();
    this.suscribirAEstadoDelServicio();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // MÉTODOS DE INICIALIZACIÓN
  // ==========================================

  private inicializarComponente(): void {
    this.cargarPacientes();
    this.cargarEstadisticas();
  }

  private configurarBusquedaEnTiempoReal(): void {
    this.filtrosForm.get('buscar')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(valor => {
        this.textoBusqueda = valor;
        this.aplicarFiltros();
      });
  }

  private suscribirAEstadoDelServicio(): void {
    // Suscribirse al estado de loading
    this.pacientesService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    // Suscribirse a errores
    this.pacientesService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error = error);

    // Suscribirse a los pacientes
    this.pacientesService.pacientes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(pacientes => this.pacientes = pacientes);
  }

  // ==========================================
  // MÉTODOS DE CARGA DE DATOS (SIMPLIFICADOS)
  // ==========================================

  cargarPacientes(): void {
    this.pacientesService.getPacientes(this.filtrosAplicados)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Paciente[]>) => {
          if (response.success && response.data) {
            this.pacientes = response.data;
          }
        },
        error: (error) => {
          this.mostrarError('Error al cargar pacientes: ' + error.message);
        }
      });
  }

  cargarEstadisticas(): void {
    this.pacientesService.getEstadisticas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<EstadisticasPacientes>) => {
          if (response.success && response.data) {
            this.estadisticas = response.data;
          }
        },
        error: (error) => {
          console.warn('No se pudieron cargar las estadísticas:', error);
        }
      });
  }

  recargarDatos(): void {
    this.limpiarError();
    this.cargarPacientes();
    this.cargarEstadisticas();
  }

  // ==========================================
  // MÉTODOS DE BÚSQUEDA Y FILTROS
  // ==========================================

  aplicarFiltros(): void {
    const valoresFiltros = this.filtrosForm.value;

    this.filtrosAplicados = {
      sexo: valoresFiltros.sexo || undefined,
      edad_min: valoresFiltros.edad_min || undefined,
      edad_max: valoresFiltros.edad_max || undefined,
      tiene_alergias: valoresFiltros.tiene_alergias === '' ? undefined : valoresFiltros.tiene_alergias,
      buscar: this.textoBusqueda || undefined
    };

    this.cargarPacientes();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.textoBusqueda = '';
    this.filtrosAplicados = {};
    this.cargarPacientes();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  // ==========================================
  // MÉTODOS DE NAVEGACIÓN Y ACCIONES
  // ==========================================

  verDetallePaciente(paciente: Paciente): void {
    this.pacienteSeleccionado = paciente;
    this.router.navigate(['/personas/pacientes', paciente.id_paciente]);
  }

  editarPaciente(paciente: Paciente): void {
    this.router.navigate(['/personas/pacientes', paciente.id_paciente, 'editar']);
  }

  crearNuevoPaciente(): void {
    this.router.navigate(['/personas/pacientes/nuevo']);
  }

  eliminarPaciente(paciente: Paciente): void {
    if (confirm(`¿Está seguro de eliminar al paciente ${paciente.nombre_completo}?`)) {
      this.pacientesService.deletePaciente(paciente.id_paciente!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.mostrarMensaje('Paciente eliminado correctamente');
              this.cargarPacientes();
            }
          },
          error: (error) => {
            this.mostrarError('Error al eliminar paciente: ' + error.message);
          }
        });
    }
  }

  verHistorialMedico(paciente: Paciente): void {
    this.router.navigate(['/personas/pacientes', paciente.id_paciente, 'historial']);
  }

  verExpedientes(paciente: Paciente): void {
    this.router.navigate(['/expedientes'], {
      queryParams: { paciente: paciente.id_paciente }
    });
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD PARA LA UI
  // ==========================================

  cambiarVista(nuevaVista: 'tabla' | 'tarjetas'): void {
    this.vistaActual = nuevaVista;
  }

  toggleEstadisticas(): void {
    this.mostrarEstadisticas = !this.mostrarEstadisticas;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const diferenciaMeses = hoy.getMonth() - nacimiento.getMonth();

    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  obtenerClasePorGenero(genero: Genero): string {
    return genero === Genero.MASCULINO ? 'badge-primary' : 'badge-secondary';
  }

  obtenerIconoPorGenero(genero: Genero): string {
    return genero === Genero.MASCULINO ? '♂' : '♀';
  }

  obtenerTextoGenero(genero: Genero): string {
    return genero === Genero.MASCULINO ? 'Masculino' : 'Femenino';
  }

  tieneAlergias(paciente: Paciente): boolean {
    return !!(paciente.alergias && paciente.alergias.trim().length > 0);
  }

  tieneFamiliarResponsable(paciente: Paciente): boolean {
    return !!(paciente.familiar_responsable && paciente.familiar_responsable.trim().length > 0);
  }

  // ==========================================
  // MÉTODOS DE MANEJO DE ERRORES Y MENSAJES
  // ==========================================

  private mostrarError(mensaje: string): void {
    this.error = mensaje;
    console.error(mensaje);
  }

  private mostrarMensaje(mensaje: string): void {
    console.log(mensaje);
    // Aquí podrías implementar un toast/notification simple
    alert(mensaje); // Temporal, reemplazar con un sistema de notificaciones
  }

  limpiarError(): void {
    this.error = null;
  }

  // ==========================================
  // GETTERS SIMPLIFICADOS
  // ==========================================

  get hayPacientes(): boolean {
    return this.pacientes.length > 0;
  }

  get hayFiltrosAplicados(): boolean {
    return Object.keys(this.filtrosAplicados).some(key =>
      this.filtrosAplicados[key as keyof PacienteFilters] !== undefined
    );
  }

  get totalPacientes(): number {
    return this.pacientes.length;
  }
}
