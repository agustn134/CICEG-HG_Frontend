import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Importaciones de modelos y servicios
import {
  Servicio,
  CreateServicioDto,
  UpdateServicioDto,
  ServicioFilters
} from '../../models/servicio.model';
import { ApiResponse } from '../../models/base.models';
import { ServiciosService } from '../../services/catalogos/servicios';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css'
})
export class Servicios implements OnInit, OnDestroy {

  // ==========================================
  // INYECCIÓN DE DEPENDENCIAS
  // ==========================================
  private serviciosService = inject(ServiciosService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // ==========================================
  // PROPIEDADES DEL COMPONENTE
  // ==========================================

  // Datos principales
  servicios: Servicio[] = [];
  servicioSeleccionado: Servicio | null = null;

  // Estados de la UI
  loading = false;
  error: string | null = null;
  mostrarModal = false;
  mostrarConfirmacion = false;
  isEditMode = false;

  // Formularios
  servicioForm: FormGroup;
  textoBusqueda = '';

  // Opciones para el formulario
  readonly tiposServicio = [
    { valor: 'Hospitalización', etiqueta: 'Hospitalización' },
    { valor: 'Consulta Externa', etiqueta: 'Consulta Externa' },
    { valor: 'Quirófano', etiqueta: 'Quirófano' },
    { valor: 'Urgencias', etiqueta: 'Urgencias' },
    { valor: 'Diagnóstico', etiqueta: 'Diagnóstico' }
  ];

  // ==========================================
  // CONSTRUCTOR E INICIALIZACIÓN
  // ==========================================
  constructor() {
    this.servicioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(500)]],
      activo: [true],
      jefe_servicio: ['', [Validators.maxLength(100)]],
      ubicacion: ['', [Validators.maxLength(200)]],
      telefono_interno: ['', [Validators.pattern(/^\d{3,4}$/)]],
      capacidad_camas: [0, [Validators.min(0), Validators.max(999)]],
      tipo_servicio: ['']
    });
  }

  ngOnInit(): void {
    this.cargarServicios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // MÉTODOS CRUD
  // ==========================================

  /**
   * Cargar todos los servicios
   */
  cargarServicios(): void {
    this.loading = true;
    this.error = null;

    const filtros: ServicioFilters = {
      search: this.textoBusqueda || undefined
    };

    this.serviciosService.getAll(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Servicio[]>) => {
          if (response.success && response.data) {
            this.servicios = response.data;
          } else {
            this.error = response.message || 'Error al cargar servicios';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar servicios:', error);
          this.error = 'Error de conexión al cargar servicios';
          this.loading = false;
        }
      });
  }

  /**
   * Crear un nuevo servicio
   */
  crearServicio(): void {
    if (this.servicioForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    this.loading = true;
    this.error = null;

    const nuevoServicio: CreateServicioDto = {
      ...this.servicioForm.value
    };

    this.serviciosService.create(nuevoServicio)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Servicio>) => {
          if (response.success && response.data) {
            this.servicios.unshift(response.data);
            this.cerrarModal();
            console.log('  Servicio creado exitosamente');
          } else {
            this.error = response.message || 'Error al crear servicio';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al crear servicio:', error);
          this.error = 'Error de conexión al crear servicio';
          this.loading = false;
        }
      });
  }

  /**
   * Actualizar servicio existente
   */
  actualizarServicio(): void {
    if (this.servicioForm.invalid || !this.servicioSeleccionado) {
      this.marcarCamposComoTocados();
      return;
    }

    this.loading = true;
    this.error = null;

    const servicioActualizado: UpdateServicioDto = {
      id_servicio: this.servicioSeleccionado.id_servicio,
      ...this.servicioForm.value
    };

    this.serviciosService.update(servicioActualizado.id_servicio, servicioActualizado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Servicio>) => {
          if (response.success && response.data) {
            const index = this.servicios.findIndex(s => s.id_servicio === response.data!.id_servicio);
            if (index !== -1) {
              this.servicios[index] = response.data;
            }
            this.cerrarModal();
            console.log('  Servicio actualizado exitosamente');
          } else {
            this.error = response.message || 'Error al actualizar servicio';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al actualizar servicio:', error);
          this.error = 'Error de conexión al actualizar servicio';
          this.loading = false;
        }
      });
  }

  /**
   * Eliminar servicio
   */
  eliminarServicio(): void {
    if (!this.servicioSeleccionado) return;

    this.loading = true;
    this.error = null;

    this.serviciosService.delete(this.servicioSeleccionado.id_servicio)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse) => {
          if (response.success) {
            this.servicios = this.servicios.filter(s => s.id_servicio !== this.servicioSeleccionado!.id_servicio);
            this.cerrarConfirmacion();
            console.log('  Servicio eliminado exitosamente');
          } else {
            this.error = response.message || 'Error al eliminar servicio';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al eliminar servicio:', error);
          this.error = 'Error de conexión al eliminar servicio';
          this.loading = false;
        }
      });
  }

  // ==========================================
  // MÉTODOS DE UI
  // ==========================================

  /**
   * Abrir modal para crear nuevo servicio
   */
  abrirModalCrear(): void {
    this.isEditMode = false;
    this.servicioSeleccionado = null;
    this.servicioForm.reset({
      nombre: '',
      descripcion: '',
      activo: true,
      jefe_servicio: '',
      ubicacion: '',
      telefono_interno: '',
      capacidad_camas: 0,
      tipo_servicio: ''
    });
    this.mostrarModal = true;
    this.error = null;
  }

  /**
   * Abrir modal para editar servicio
   */
  abrirModalEditar(servicio: Servicio): void {
    this.isEditMode = true;
    this.servicioSeleccionado = servicio;
    this.servicioForm.patchValue({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      activo: servicio.activo,
      jefe_servicio: servicio.jefe_servicio || '',
      ubicacion: servicio.ubicacion || '',
      telefono_interno: servicio.telefono_interno || '',
      capacidad_camas: servicio.capacidad_camas || 0,
      tipo_servicio: servicio.tipo_servicio || ''
    });
    this.mostrarModal = true;
    this.error = null;
  }

  /**
   * Abrir modal de confirmación para eliminar
   */
  abrirConfirmacionEliminar(servicio: Servicio): void {
    this.servicioSeleccionado = servicio;
    this.mostrarConfirmacion = true;
  }

  /**
   * Cerrar modal
   */
  cerrarModal(): void {
    this.mostrarModal = false;
    this.isEditMode = false;
    this.servicioSeleccionado = null;
    this.servicioForm.reset();
    this.error = null;
  }

  /**
   * Cerrar modal de confirmación
   */
  cerrarConfirmacion(): void {
    this.mostrarConfirmacion = false;
    this.servicioSeleccionado = null;
  }

  /**
   * Manejar envío del formulario
   */
  onSubmit(): void {
    if (this.isEditMode) {
      this.actualizarServicio();
    } else {
      this.crearServicio();
    }
  }

  /**
   * Buscar servicios
   */
  buscarServicios(): void {
    this.cargarServicios();
  }

  /**
   * Marcar todos los campos como tocados para mostrar validaciones
   */
  private marcarCamposComoTocados(): void {
    Object.keys(this.servicioForm.controls).forEach(field => {
      this.servicioForm.get(field)?.markAsTouched();
    });
  }

  // ==========================================
  // GETTERS PARA VALIDACIONES
  // ==========================================

  get nombreInvalido(): boolean {
    const control = this.servicioForm.get('nombre');
    return !!(control && control.invalid && control.touched);
  }

  get descripcionInvalida(): boolean {
    const control = this.servicioForm.get('descripcion');
    return !!(control && control.invalid && control.touched);
  }

  get jefeServicioInvalido(): boolean {
    const control = this.servicioForm.get('jefe_servicio');
    return !!(control && control.invalid && control.touched);
  }

  get ubicacionInvalida(): boolean {
    const control = this.servicioForm.get('ubicacion');
    return !!(control && control.invalid && control.touched);
  }

  get telefonoInternoInvalido(): boolean {
    const control = this.servicioForm.get('telefono_interno');
    return !!(control && control.invalid && control.touched);
  }

  get capacidadCamasInvalida(): boolean {
    const control = this.servicioForm.get('capacidad_camas');
    return !!(control && control.invalid && control.touched);
  }
}
