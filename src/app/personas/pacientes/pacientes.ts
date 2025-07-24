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
  mostrarEstadisticas = true; // Mostrar por defecto
  vistaActual: 'tabla' | 'tarjetas' = 'tabla';

  // Búsqueda y filtros
  textoBusqueda = '';
  filtrosForm: FormGroup;
  filtrosAplicados: PacienteFilters = {};

  // Configuraciones
  readonly opcionesGenero: { valor: Genero | '', etiqueta: string }[] = [
    { valor: '', etiqueta: 'Todos los géneros' },
    { valor: Genero.MASCULINO, etiqueta: 'Masculino' },
    { valor: Genero.FEMENINO, etiqueta: 'Femenino' }
  ];

  // Exponer enum para el template
  readonly Genero = Genero;

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
    console.log('   Módulo de Pacientes SICEG-HG inicializado');
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
    this.pacientesService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.pacientesService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error = error);

    this.pacientesService.pacientes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(pacientes => this.pacientes = pacientes);
  }

  // ==========================================
  // MÉTODOS DE CARGA DE DATOS
  // ==========================================

  cargarPacientes(): void {
    this.pacientesService.getPacientes(this.filtrosAplicados)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Paciente[]>) => {
          if (response.success && response.data) {
            this.pacientes = response.data;
            console.log(`  ${this.pacientes.length} pacientes cargados`);
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
            console.log('📊 Estadísticas de pacientes cargadas');
          }
        },
        error: (error) => {
          console.warn('  No se pudieron cargar las estadísticas:', error);
        }
      });
  }

  recargarDatos(): void {
    console.log('🔄 Recargando datos de pacientes...');
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

    console.log('  Aplicando filtros:', this.filtrosAplicados);
    this.cargarPacientes();
  }

  limpiarFiltros(): void {
    console.log('🧹 Limpiando filtros');
    this.filtrosForm.reset();
    this.textoBusqueda = '';
    this.filtrosAplicados = {};
    this.cargarPacientes();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
    console.log('🔧 Filtros:', this.mostrarFiltros ? 'mostrados' : 'ocultos');
  }

  toggleEstadisticas(): void {
    this.mostrarEstadisticas = !this.mostrarEstadisticas;
    console.log('📊 Estadísticas:', this.mostrarEstadisticas ? 'mostradas' : 'ocultas');
  }

  cambiarVista(nuevaVista: 'tabla' | 'tarjetas'): void {
    this.vistaActual = nuevaVista;
    console.log('👁️ Vista cambiada a:', nuevaVista);
  }

  // ==========================================
  // MÉTODOS DE NAVEGACIÓN Y ACCIONES
  // ==========================================

  verDetallePaciente(paciente: Paciente): void {
    console.log('👤 Navegando al perfil del paciente:', paciente.nombre_completo);
    this.pacienteSeleccionado = paciente;
    this.router.navigate(['/app/personas/perfil-paciente', paciente.id_paciente]);
  }

  crearNuevoPaciente(): void {
    console.log('➕ Navegando al wizard de nuevo paciente');
    this.router.navigate(['/app/nuevo-paciente/inicio']);
  }

  crearExpediente(paciente: Paciente): void {
    console.log('📄 Creando nuevo expediente para:', paciente.nombre_completo);
    this.router.navigate(['/app/gestion-expedientes/expedientes'], {
      queryParams: {
        nuevo: true,
        paciente: paciente.id_paciente
      }
    });
  }

  verExpedientes(paciente: Paciente): void {
    console.log('📋 Ver expedientes de:', paciente.nombre_completo);
    this.router.navigate(['/app/gestion-expedientes/expedientes'], {
      queryParams: { paciente: paciente.id_paciente }
    });
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD PARA LA UI
  // ==========================================

  formatearFecha(fecha?: string): string {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  calcularEdad(fechaNacimiento?: string): number {
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

  obtenerClasePorGenero(genero?: Genero): string {
    if (!genero) return 'bg-gray-500';

    switch(genero) {
      case Genero.MASCULINO:
        return 'bg-blue-600';
      case Genero.FEMENINO:
        return 'bg-emerald-600';
      default:
        return 'bg-gray-500';
    }
  }

  obtenerIconoPorGenero(genero?: Genero): string {
    if (!genero) return '○';

    switch(genero) {
      case Genero.MASCULINO:
        return '♂';
      case Genero.FEMENINO:
        return '♀';
      default:
        return '○';
    }
  }

  obtenerTextoGenero(genero?: Genero): string {
    if (!genero) return 'No especificado';

    switch(genero) {
      case Genero.MASCULINO:
        return 'Masculino';
      case Genero.FEMENINO:
        return 'Femenino';
      default:
        return 'No especificado';
    }
  }

  tieneAlergias(paciente: Paciente): boolean {
    return !!(paciente.alergias && paciente.alergias.trim().length > 0);
  }

  tieneFamiliarResponsable(paciente: Paciente): boolean {
    return !!(paciente.familiar_responsable && paciente.familiar_responsable.trim().length > 0);
  }

  // ==========================================
  // MÉTODOS DE MANEJO DE ERRORES
  // ==========================================

  private mostrarError(mensaje: string): void {
    this.error = mensaje;
    console.error('❌', mensaje);
  }

  limpiarError(): void {
    this.error = null;
  }

  // ==========================================
  // GETTERS
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

  // ==========================================
  // MÉTODOS DE TRACKING PARA ANGULAR
  // ==========================================

  trackById(index: number, item: Paciente): number {
    return item.id_paciente;
  }
}
