// src/app/personas/personal-medico/personal-medico.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Importaciones de modelos y servicios
import {
  PersonalMedico,
  PersonalMedicoFilters,
  EstadisticasPersonalMedico,
  Genero,
  ApiResponse,
  ESPECIALIDADES_MEDICAS,
  CARGOS_MEDICOS,
  DEPARTAMENTOS_HOSPITALARIOS
} from '../../models';
import { PersonalMedicoService } from '../../services/personas/personal-medico';

@Component({
  selector: 'app-personal-medico',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './personal-medico.html',
  styleUrl: './personal-medico.css'
})
export class PersonalMedicoComponent implements OnInit, OnDestroy {

  // ==========================================
  // INYECCIÓN DE DEPENDENCIAS
  // ==========================================
  private personalMedicoService = inject(PersonalMedicoService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // ==========================================
  // PROPIEDADES DEL COMPONENTE
  // ==========================================

  // Datos principales
  personalMedico: PersonalMedico[] = [];
  personalSeleccionado: PersonalMedico | null = null;
  estadisticas: EstadisticasPersonalMedico | null = null;

  // Estados de la UI
  loading = false;
  error: string | null = null;
  mostrarFiltros = false;
  mostrarEstadisticas = false;
  vistaActual: 'tabla' | 'tarjetas' = 'tabla';

  // Búsqueda y filtros
  textoBusqueda = '';
  filtrosForm: FormGroup;
  filtrosAplicados: PersonalMedicoFilters = {};

  // Configuraciones - usando las constantes del modelo
  readonly especialidadesMedicas = ESPECIALIDADES_MEDICAS;
  readonly cargosMedicos = CARGOS_MEDICOS;
  readonly departamentosHospitalarios = DEPARTAMENTOS_HOSPITALARIOS;

  readonly opcionesActivo: { valor: boolean | '', etiqueta: string }[] = [
    { valor: '', etiqueta: 'Todos' },
    { valor: true, etiqueta: 'Activos' },
    { valor: false, etiqueta: 'Inactivos' }
  ];

  // Exponer enum para el template
  readonly Genero = Genero;

  // ==========================================
  // CONSTRUCTOR Y CICLO DE VIDA
  // ==========================================

  constructor() {
    this.filtrosForm = this.fb.group({
      activo: [''],
      especialidad: [''],
      cargo: [''],
      departamento: [''],
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
    this.cargarPersonalMedico();
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
    this.personalMedicoService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    // Suscribirse a errores
    this.personalMedicoService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error = error);

    // Suscribirse al personal médico
    this.personalMedicoService.personalMedico$
      .pipe(takeUntil(this.destroy$))
      .subscribe(personal => this.personalMedico = personal);
  }

  // ==========================================
  // MÉTODOS DE CARGA DE DATOS
  // ==========================================

  cargarPersonalMedico(): void {
    this.personalMedicoService.getPersonalMedico(this.filtrosAplicados)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<PersonalMedico[]>) => {
          if (response.success && response.data) {
            this.personalMedico = response.data;
          }
        },
        error: (error) => {
          this.mostrarError('Error al cargar personal médico: ' + error.message);
        }
      });
  }

  cargarEstadisticas(): void {
    this.personalMedicoService.getEstadisticas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<EstadisticasPersonalMedico>) => {
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
    this.cargarPersonalMedico();
    this.cargarEstadisticas();
  }

  // ==========================================
  // MÉTODOS DE BÚSQUEDA Y FILTROS
  // ==========================================

  aplicarFiltros(): void {
    const valoresFiltros = this.filtrosForm.value;

    this.filtrosAplicados = {
      activo: valoresFiltros.activo === '' ? undefined : valoresFiltros.activo,
      especialidad: valoresFiltros.especialidad || undefined,
      cargo: valoresFiltros.cargo || undefined,
      departamento: valoresFiltros.departamento || undefined,
      buscar: this.textoBusqueda || undefined
    };

    this.cargarPersonalMedico();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.textoBusqueda = '';
    this.filtrosAplicados = {};
    this.cargarPersonalMedico();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  // ==========================================
  // MÉTODOS DE NAVEGACIÓN Y ACCIONES
  // ==========================================

  verDetallePersonal(personal: PersonalMedico): void {
    this.personalSeleccionado = personal;
    this.router.navigate(['/personas/personal-medico', personal.id_personal_medico]);
  }

  editarPersonal(personal: PersonalMedico): void {
    this.router.navigate(['/personas/personal-medico', personal.id_personal_medico, 'editar']);
  }

  crearNuevoPersonal(): void {
    this.router.navigate(['/personas/personal-medico/nuevo']);
  }

  eliminarPersonal(personal: PersonalMedico): void {
    if (confirm(`¿Está seguro de eliminar al Dr.(a) ${personal.nombre_completo}?`)) {
      this.personalMedicoService.deletePersonalMedico(personal.id_personal_medico!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.mostrarMensaje('Personal médico eliminado correctamente');
              this.cargarPersonalMedico();
            }
          },
          error: (error) => {
            this.mostrarError('Error al eliminar personal médico: ' + error.message);
          }
        });
    }
  }

  verDocumentosCreados(personal: PersonalMedico): void {
    this.router.navigate(['/documentos-clinicos'], {
      queryParams: { medico: personal.id_personal_medico }
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

  obtenerClasePorEstado(activo: boolean): string {
    return activo ? 'badge-success' : 'badge-danger';
  }

  obtenerTextoEstado(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  obtenerIconoPorGenero(genero: Genero): string {
    return genero === Genero.MASCULINO ? '♂' : '♀';
  }

  obtenerTextoGenero(genero: Genero): string {
    return genero === Genero.MASCULINO ? 'Masculino' : 'Femenino';
  }

  esEspecialista(personal: PersonalMedico): boolean {
    if (!personal.especialidad) return false;
    const especialidadesGenerales = ['medicina general', 'medicina familiar'];
    return !especialidadesGenerales.some(esp =>
      personal.especialidad.toLowerCase().includes(esp)
    );
  }

  obtenerTituloProfesional(especialidad: string): string {
    if (!especialidad) return 'Dr.(a)';

    if (especialidad.toLowerCase().includes('psicología')) {
      return 'Psic.';
    }

    if (especialidad.toLowerCase().includes('nutrición')) {
      return 'Nut.';
    }

    return 'Dr.(a)';
  }

  obtenerNivelProductividad(totalDocumentos: number): string {
    if (totalDocumentos >= 1000) return 'Muy Alto';
    if (totalDocumentos >= 500) return 'Alto';
    if (totalDocumentos >= 100) return 'Medio';
    return 'Bajo';
  }

  obtenerColorProductividad(totalDocumentos: number): string {
    if (totalDocumentos >= 1000) return 'text-green-600';
    if (totalDocumentos >= 500) return 'text-blue-600';
    if (totalDocumentos >= 100) return 'text-yellow-600';
    return 'text-gray-600';
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

  get hayPersonalMedico(): boolean {
    return this.personalMedico.length > 0;
  }

  get hayFiltrosAplicados(): boolean {
    return Object.keys(this.filtrosAplicados).some(key =>
      this.filtrosAplicados[key as keyof PersonalMedicoFilters] !== undefined
    );
  }

  get totalPersonalMedico(): number {
    return this.personalMedico.length;
  }

  get personalActivo(): PersonalMedico[] {
    return this.personalMedico.filter(p => p.activo);
  }

  get personalInactivo(): PersonalMedico[] {
    return this.personalMedico.filter(p => !p.activo);
  }

  get especialidadesUnicas(): string[] {
  const especialidades = this.personalMedico
    .filter(p => p.especialidad) // Filtrar primero los que tienen especialidad
    .map(p => p.especialidad!); // Usar ! porque ya sabemos que existe
  return [...new Set(especialidades)];
}

  get departamentosUnicos(): string[] {
  const departamentos = this.personalMedico
    .filter(p => p.departamento) // Filtrar primero los que tienen departamento
    .map(p => p.departamento!); // Usar ! porque ya sabemos que existe
  return [...new Set(departamentos)];
}


}
