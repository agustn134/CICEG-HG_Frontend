// src/app/catalogos/tipos-sangre/tipos-sangre.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Importaciones de modelos y servicios
import {
  TipoSangre,
  CreateTipoSangreDto,
  UpdateTipoSangreDto,
  TipoSangreFilters,
  TIPOS_SANGRE_SISTEMA_ABO,
  FRECUENCIAS_POBLACIONALES_MEXICO,
  TipoSangreUtil
} from '../../models/tipo-sangre.model';
import { ApiResponse } from '../../models/base.models';
import { TiposSangreService } from '../../services/catalogos/tipos-sangre';

@Component({
  selector: 'app-tipos-sangre',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './tipos-sangre.html',
  styleUrl: './tipos-sangre.css'
})
export class TiposSangre implements OnInit, OnDestroy {

  // ==========================================
  // INYECCIÓN DE DEPENDENCIAS
  // ==========================================
  private tiposSangreService = inject(TiposSangreService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // ==========================================
  // PROPIEDADES DEL COMPONENTE
  // ==========================================

  // Datos principales
  tiposSangre: TipoSangre[] = [];
  tipoSeleccionado: TipoSangre | null = null;

  // Estados de la UI
  loading = false;
  error: string | null = null;
  mostrarModal = false;
  mostrarConfirmacion = false;
  mostrarCompatibilidad = false;
  isEditMode = false;

  // Formularios
  tipoSangreForm: FormGroup;
  textoBusqueda = '';

  // Datos para el formulario
  readonly tiposDisponibles = [
    { valor: 'O-', etiqueta: 'O- (Donador Universal)' },
    { valor: 'O+', etiqueta: 'O+ (Más Común)' },
    { valor: 'A-', etiqueta: 'A-' },
    { valor: 'A+', etiqueta: 'A+' },
    { valor: 'B-', etiqueta: 'B-' },
    { valor: 'B+', etiqueta: 'B+' },
    { valor: 'AB-', etiqueta: 'AB-' },
    { valor: 'AB+', etiqueta: 'AB+ (Receptor Universal)' }
  ];

  // Compatibilidad seleccionada
  compatibilidadSeleccionada: any = null;

  // ==========================================
  // CONSTRUCTOR E INICIALIZACIÓN
  // ==========================================
  constructor() {
    this.tipoSangreForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^(O|A|B|AB)[+-]$/)]],
      descripcion: ['', [Validators.maxLength(500)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarTiposSangre();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // MÉTODOS CRUD
  // ==========================================

  /**
   * Cargar todos los tipos de sangre
   */
  cargarTiposSangre(): void {
    this.loading = true;
    this.error = null;

    const filtros: TipoSangreFilters = {
      search: this.textoBusqueda || undefined
    };

    this.tiposSangreService.getAll(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<TipoSangre[]>) => {
          if (response.success && response.data) {
            this.tiposSangre = response.data;
          } else {
            this.error = response.message || 'Error al cargar tipos de sangre';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar tipos de sangre:', error);
          this.error = 'Error de conexión al cargar tipos de sangre';
          this.loading = false;
        }
      });
  }

  /**
   * Crear un nuevo tipo de sangre
   */
  crearTipoSangre(): void {
    if (this.tipoSangreForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    this.loading = true;
    this.error = null;

    const nuevoTipo: CreateTipoSangreDto = {
      ...this.tipoSangreForm.value
    };

    this.tiposSangreService.create(nuevoTipo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<TipoSangre>) => {
          if (response.success && response.data) {
            this.tiposSangre.unshift(response.data);
            this.cerrarModal();
            console.log('✅ Tipo de sangre creado exitosamente');
          } else {
            this.error = response.message || 'Error al crear tipo de sangre';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al crear tipo de sangre:', error);
          this.error = 'Error de conexión al crear tipo de sangre';
          this.loading = false;
        }
      });
  }

  /**
   * Actualizar tipo de sangre existente
   */
  actualizarTipoSangre(): void {
    if (this.tipoSangreForm.invalid || !this.tipoSeleccionado) {
      this.marcarCamposComoTocados();
      return;
    }

    this.loading = true;
    this.error = null;

    const tipoActualizado: UpdateTipoSangreDto = {
      id_tipo_sangre: this.tipoSeleccionado.id_tipo_sangre,
      ...this.tipoSangreForm.value
    };

    this.tiposSangreService.update(tipoActualizado.id_tipo_sangre, tipoActualizado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<TipoSangre>) => {
          if (response.success && response.data) {
            const index = this.tiposSangre.findIndex(t => t.id_tipo_sangre === response.data!.id_tipo_sangre);
            if (index !== -1) {
              this.tiposSangre[index] = response.data;
            }
            this.cerrarModal();
            console.log('✅ Tipo de sangre actualizado exitosamente');
          } else {
            this.error = response.message || 'Error al actualizar tipo de sangre';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al actualizar tipo de sangre:', error);
          this.error = 'Error de conexión al actualizar tipo de sangre';
          this.loading = false;
        }
      });
  }

  /**
   * Eliminar tipo de sangre
   */
  eliminarTipoSangre(): void {
    if (!this.tipoSeleccionado) return;

    this.loading = true;
    this.error = null;

    this.tiposSangreService.delete(this.tipoSeleccionado.id_tipo_sangre)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse) => {
          if (response.success) {
            this.tiposSangre = this.tiposSangre.filter(t => t.id_tipo_sangre !== this.tipoSeleccionado!.id_tipo_sangre);
            this.cerrarConfirmacion();
            console.log('✅ Tipo de sangre eliminado exitosamente');
          } else {
            this.error = response.message || 'Error al eliminar tipo de sangre';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al eliminar tipo de sangre:', error);
          this.error = 'Error de conexión al eliminar tipo de sangre';
          this.loading = false;
        }
      });
  }

  // ==========================================
  // MÉTODOS DE UI
  // ==========================================

  /**
   * Abrir modal para crear nuevo tipo
   */
  abrirModalCrear(): void {
    this.isEditMode = false;
    this.tipoSeleccionado = null;
    this.tipoSangreForm.reset({
      nombre: '',
      descripcion: '',
      activo: true
    });
    this.mostrarModal = true;
    this.error = null;
  }

  /**
   * Abrir modal para editar tipo
   */
  abrirModalEditar(tipo: TipoSangre): void {
    this.isEditMode = true;
    this.tipoSeleccionado = tipo;
    this.tipoSangreForm.patchValue({
      nombre: tipo.nombre,
      descripcion: tipo.descripcion || '',
      activo: tipo.activo
    });
    this.mostrarModal = true;
    this.error = null;
  }

  /**
   * Abrir modal de confirmación para eliminar
   */
  abrirConfirmacionEliminar(tipo: TipoSangre): void {
    this.tipoSeleccionado = tipo;
    this.mostrarConfirmacion = true;
  }

  /**
   * Ver compatibilidad de un tipo de sangre
   */
  verCompatibilidad(tipo: TipoSangre): void {
    this.compatibilidadSeleccionada = TipoSangreUtil.obtenerCompatibilidadCompleta(tipo.nombre);
    this.mostrarCompatibilidad = true;
  }

  /**
   * Cerrar modal
   */
  cerrarModal(): void {
    this.mostrarModal = false;
    this.isEditMode = false;
    this.tipoSeleccionado = null;
    this.tipoSangreForm.reset();
    this.error = null;
  }

  /**
   * Cerrar modal de confirmación
   */
  cerrarConfirmacion(): void {
    this.mostrarConfirmacion = false;
    this.tipoSeleccionado = null;
  }

  /**
   * Cerrar modal de compatibilidad
   */
  cerrarCompatibilidad(): void {
    this.mostrarCompatibilidad = false;
    this.compatibilidadSeleccionada = null;
  }

  /**
   * Manejar envío del formulario
   */
  onSubmit(): void {
    if (this.isEditMode) {
      this.actualizarTipoSangre();
    } else {
      this.crearTipoSangre();
    }
  }

  /**
   * Buscar tipos de sangre
   */
  buscarTipos(): void {
    this.cargarTiposSangre();
  }

  /**
   * Marcar todos los campos como tocados para mostrar validaciones
   */
  private marcarCamposComoTocados(): void {
    Object.keys(this.tipoSangreForm.controls).forEach(field => {
      this.tipoSangreForm.get(field)?.markAsTouched();
    });
  }

  // ==========================================
  // MÉTODOS UTILITARIOS
  // ==========================================

  /**
   * Obtener el factor RH de un tipo
   */
  obtenerFactorRh(nombre: string): string {
    return TipoSangreUtil.obtenerFactorRh(nombre) || 'N/A';
  }

  /**
   * Obtener el grupo ABO de un tipo
   */
  obtenerGrupoABO(nombre: string): string {
    return TipoSangreUtil.obtenerGrupoABO(nombre) || 'N/A';
  }

  /**
   * Verificar si es donador universal
   */
  esDonadorUniversal(nombre: string): boolean {
    return TipoSangreUtil.esDonadorUniversal(nombre);
  }

  /**
   * Verificar si es receptor universal
   */
  esReceptorUniversal(nombre: string): boolean {
    return TipoSangreUtil.esReceptorUniversal(nombre);
  }

  /**
   * Obtener frecuencia poblacional
   */
  obtenerFrecuenciaPoblacional(nombre: string): number {
    return FRECUENCIAS_POBLACIONALES_MEXICO[nombre as keyof typeof FRECUENCIAS_POBLACIONALES_MEXICO] || 0;
  }

  // ==========================================
  // GETTERS PARA VALIDACIONES
  // ==========================================

  get nombreInvalido(): boolean {
    const control = this.tipoSangreForm.get('nombre');
    return !!(control && control.invalid && control.touched);
  }

  get descripcionInvalida(): boolean {
    const control = this.tipoSangreForm.get('descripcion');
    return !!(control && control.invalid && control.touched);
  }
}
