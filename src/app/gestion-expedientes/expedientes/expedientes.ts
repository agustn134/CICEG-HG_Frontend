// src/app/gestion-expedientes/expedientes/expedientes.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Importaciones de modelos y servicios
import {
  Expediente,
  ExpedienteFilters,
  ExpedienteBusqueda,
  Genero,
  ApiResponse,
  ESTADOS_EXPEDIENTE_VALUES
} from '../../models';
import { DashboardExpedientes, ExpedientesService } from '../../services/gestion-expedientes/expedientes';

@Component({
  selector: 'app-expedientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './expedientes.html',
  styleUrl: './expedientes.css'
})
export class Expedientes implements OnInit, OnDestroy {

  // ==========================================
  // INYECCIÓN DE DEPENDENCIAS
  // ==========================================
  private expedientesService = inject(ExpedientesService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // ==========================================
  // PROPIEDADES DEL COMPONENTE
  // ==========================================

  // Datos principales
  expedientes: Expediente[] = [];
  expedienteSeleccionado: Expediente | null = null;
  dashboard: DashboardExpedientes | null = null;

  // Estados de la UI
  loading = false;
  error: string | null = null;
  mostrarFiltros = false;
  mostrarDashboard = false;
  vistaActual: 'tabla' | 'tarjetas' = 'tabla';

  // Búsqueda y filtros
  textoBusqueda = '';
  filtrosForm: FormGroup;
  filtrosAplicados: ExpedienteFilters = {};

  // Configuraciones
  readonly estadosExpediente = [
    { valor: '', etiqueta: 'Todos' },
    { valor: ESTADOS_EXPEDIENTE_VALUES.ACTIVO, etiqueta: 'Activos' },
    { valor: ESTADOS_EXPEDIENTE_VALUES.CERRADO, etiqueta: 'Cerrados' },
    { valor: ESTADOS_EXPEDIENTE_VALUES.ARCHIVADO, etiqueta: 'Archivados' },
    { valor: ESTADOS_EXPEDIENTE_VALUES.SUSPENDIDO, etiqueta: 'Suspendidos' }
  ];

  readonly opcionesInternamientoActivo = [
    { valor: undefined, etiqueta: 'Todos' },
    { valor: true, etiqueta: 'Con internamiento activo' },
    { valor: false, etiqueta: 'Sin internamiento activo' }
  ];

  // Exponer enum para el template
  readonly Genero = Genero;
  readonly ESTADOS_EXPEDIENTE = ESTADOS_EXPEDIENTE_VALUES;

  // ==========================================
  // CONSTRUCTOR Y CICLO DE VIDA
  // ==========================================

  constructor() {
    this.filtrosForm = this.fb.group({
      estado: [''],
      fecha_inicio: [''],
      fecha_fin: [''],
      paciente_id: [''],
      tiene_internamiento_activo: [''],
      buscar: ['']
    });
  }

  ngOnInit(): void {
    this.inicializarComponente();
    this.configurarBusquedaEnTiempoReal();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // MÉTODOS DE INICIALIZACIÓN
  // ==========================================

  private inicializarComponente(): void {
    this.cargarExpedientes();
    this.cargarDashboard();
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

  // ==========================================
  // MÉTODOS DE CARGA DE DATOS
  // ==========================================

  cargarExpedientes(): void {
    this.loading = true;
    this.limpiarError();

    this.expedientesService.getExpedientes(this.filtrosAplicados)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Expediente[]>) => {
          if (response.success && response.data) {
            this.expedientes = response.data;
          }
          this.loading = false;
        },
        error: (error) => {
          this.mostrarError('Error al cargar expedientes: ' + error.message);
          this.loading = false;
        }
      });
  }

  cargarDashboard(): void {
    this.expedientesService.getDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<DashboardExpedientes>) => {
          if (response.success && response.data) {
            this.dashboard = response.data;
          }
        },
        error: (error) => {
          console.warn('No se pudo cargar el dashboard:', error);
        }
      });
  }

  recargarDatos(): void {
    this.cargarExpedientes();
    this.cargarDashboard();
  }

  // ==========================================
  // MÉTODOS DE BÚSQUEDA Y FILTROS
  // ==========================================

  aplicarFiltros(): void {
    const valoresFiltros = this.filtrosForm.value;

    this.filtrosAplicados = {
      estado: valoresFiltros.estado || undefined,
      fecha_inicio: valoresFiltros.fecha_inicio || undefined,
      fecha_fin: valoresFiltros.fecha_fin || undefined,
      paciente_id: valoresFiltros.paciente_id ? parseInt(valoresFiltros.paciente_id) : undefined,
      tiene_internamiento_activo: valoresFiltros.tiene_internamiento_activo === '' ? undefined : valoresFiltros.tiene_internamiento_activo,
      buscar: this.textoBusqueda || undefined
    };

    this.cargarExpedientes();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.textoBusqueda = '';
    this.filtrosAplicados = {};
    this.cargarExpedientes();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  buscarExpedientes(query: string): void {
    if (query.length >= 2) {
      this.expedientesService.buscarExpedientes(query)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: ApiResponse<ExpedienteBusqueda[]>) => {
            if (response.success && response.data) {
              console.log('Resultados de búsqueda:', response.data);
            }
          },
          error: (error) => {
            console.warn('Error en búsqueda:', error);
          }
        });
    }
  }

  // ==========================================
  // MÉTODOS DE NAVEGACIÓN Y ACCIONES
  // ==========================================

  verDetalleExpediente(expediente: Expediente): void {
    this.expedienteSeleccionado = expediente;
    this.router.navigate(['/gestion-expedientes/expedientes', expediente.id_expediente]);
  }

  editarExpediente(expediente: Expediente): void {
    this.router.navigate(['/gestion-expedientes/expedientes', expediente.id_expediente, 'editar']);
  }

  crearNuevoExpediente(): void {
    this.router.navigate(['/gestion-expedientes/expedientes/nuevo']);
  }

  eliminarExpediente(expediente: Expediente): void {
    if (confirm(`¿Está seguro de eliminar el expediente ${expediente.numero_expediente}?`)) {
      this.expedientesService.deleteExpediente(expediente.id_expediente!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.mostrarMensaje('Expediente eliminado correctamente');
              this.cargarExpedientes();
            }
          },
          error: (error) => {
            this.mostrarError('Error al eliminar expediente: ' + error.message);
          }
        });
    }
  }

  verInternamientos(expediente: Expediente): void {
    this.router.navigate(['/gestion-expedientes/internamientos'], {
      queryParams: { expediente: expediente.id_expediente }
    });
  }

  verDocumentosClinicosDelExpediente(expediente: Expediente): void {
    this.router.navigate(['/documentos-clinicos'], {
      queryParams: { expediente: expediente.id_expediente }
    });
  }

  cerrarExpediente(expediente: Expediente): void {
    if (confirm(`¿Está seguro de cerrar el expediente ${expediente.numero_expediente}?`)) {
      this.expedientesService.cerrarExpediente(expediente.id_expediente!, {
        notas_administrativas: 'Expediente cerrado desde la interfaz'
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.mostrarMensaje('Expediente cerrado correctamente');
              this.cargarExpedientes();
            }
          },
          error: (error) => {
            this.mostrarError('Error al cerrar expediente: ' + error.message);
          }
        });
    }
  }

  archivarExpediente(expediente: Expediente): void {
    if (confirm(`¿Está seguro de archivar el expediente ${expediente.numero_expediente}?`)) {
      this.expedientesService.archivarExpediente(expediente.id_expediente!, {
        notas_administrativas: 'Expediente archivado desde la interfaz'
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.mostrarMensaje('Expediente archivado correctamente');
              this.cargarExpedientes();
            }
          },
          error: (error) => {
            this.mostrarError('Error al archivar expediente: ' + error.message);
          }
        });
    }
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD PARA LA UI
  // ==========================================

  cambiarVista(nuevaVista: 'tabla' | 'tarjetas'): void {
    this.vistaActual = nuevaVista;
  }

  toggleDashboard(): void {
    this.mostrarDashboard = !this.mostrarDashboard;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatearNumeroExpediente(numero: string): string {
    if (!numero) return 'N/A';
    if (numero.length >= 10) {
      return `${numero.substring(0, 4)}-${numero.substring(4)}`;
    }
    return numero;
  }

  obtenerClasePorEstado(estado: string): string {
    switch (estado) {
      case ESTADOS_EXPEDIENTE_VALUES.ACTIVO:
        return 'badge-success';
      case ESTADOS_EXPEDIENTE_VALUES.CERRADO:
        return 'badge-secondary';
      case ESTADOS_EXPEDIENTE_VALUES.ARCHIVADO:
        return 'badge-warning';
      case ESTADOS_EXPEDIENTE_VALUES.SUSPENDIDO:
        return 'badge-danger';
      default:
        return 'badge-neutral';
    }
  }

  obtenerTextoGenero(genero: Genero): string {
    return genero === Genero.MASCULINO ? 'Masculino' : 'Femenino';
  }

  tieneInternamientoActivo(expediente: Expediente): boolean {
    return (expediente.internamientos_activos || 0) > 0;
  }

  esExpedienteActivo(expediente: Expediente): boolean {
    return expediente.estado === ESTADOS_EXPEDIENTE_VALUES.ACTIVO;
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

  obtenerResumenExpediente(expediente: Expediente): string {
    const partes = [];

    if (expediente.total_documentos) {
      partes.push(`${expediente.total_documentos} doc${expediente.total_documentos > 1 ? 's' : ''}`);
    }

    if (expediente.total_internamientos) {
      partes.push(`${expediente.total_internamientos} int${expediente.total_internamientos > 1 ? 's' : ''}`);
    }

    if (expediente.internamientos_activos) {
      partes.push(`${expediente.internamientos_activos} activo${expediente.internamientos_activos > 1 ? 's' : ''}`);
    }

    return partes.length > 0 ? partes.join(' - ') : 'Sin actividad';
  }

  puedeEliminarExpediente(expediente: Expediente): boolean {
    return expediente.estado !== ESTADOS_EXPEDIENTE_VALUES.ELIMINADO &&
           (expediente.internamientos_activos || 0) === 0;
  }

  puedeCerrarExpediente(expediente: Expediente): boolean {
    return expediente.estado === ESTADOS_EXPEDIENTE_VALUES.ACTIVO &&
           (expediente.internamientos_activos || 0) === 0;
  }

  puedeArchivarExpediente(expediente: Expediente): boolean {
    return expediente.estado === ESTADOS_EXPEDIENTE_VALUES.CERRADO;
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
    alert(mensaje); // Temporal, reemplazar con un sistema de notificaciones
  }

  limpiarError(): void {
    this.error = null;
  }

  // ==========================================
  // GETTERS SIMPLIFICADOS
  // ==========================================

  get hayExpedientes(): boolean {
    return this.expedientes.length > 0;
  }

  get hayFiltrosAplicados(): boolean {
    return Object.keys(this.filtrosAplicados).some(key =>
      this.filtrosAplicados[key as keyof ExpedienteFilters] !== undefined
    );
  }

  get totalExpedientes(): number {
    return this.expedientes.length;
  }

  get expedientesActivos(): Expediente[] {
    return this.expedientes.filter(e => e.estado === ESTADOS_EXPEDIENTE_VALUES.ACTIVO);
  }

  get expedientesCerrados(): Expediente[] {
    return this.expedientes.filter(e => e.estado === ESTADOS_EXPEDIENTE_VALUES.CERRADO);
  }

  get expedientesConInternamientoActivo(): Expediente[] {
    return this.expedientes.filter(e => this.tieneInternamientoActivo(e));
  }

  get estadosUnicos(): string[] {
    const estados = this.expedientes
      .map(e => e.estado)
      .filter(Boolean);
    return [...new Set(estados)];
  }

  get pacientesUnicos(): { id: number; nombre: string }[] {
    const pacientes = this.expedientes
      .filter(e => e.id_paciente && e.nombre_paciente)
      .map(e => ({ id: e.id_paciente, nombre: e.nombre_paciente! }));

    // Eliminar duplicados por id
    const uniquePacientes = pacientes.filter((paciente, index, self) =>
      index === self.findIndex(p => p.id === paciente.id)
    );

    return uniquePacientes;
  }
}


