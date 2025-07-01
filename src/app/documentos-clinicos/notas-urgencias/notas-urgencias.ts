import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotasUrgenciasService } from '../../services/documentos-clinicos/notas-urgencias';
import {
  NotaUrgencias,
  CreateNotaUrgenciasDto,
  NivelUrgencia
} from '../../models/nota-urgencias.model';
import { ApiResponse } from '../../models/base.models';

@Component({
  selector: 'app-notas-urgencias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './notas-urgencias.html',
  styleUrl: './notas-urgencias.css'
})
export class NotasUrgenciasComponent implements OnInit {
  notas: NotaUrgencias[] = [];

  // Control de vistas
  mostrarFormulario = false;
  editando = false;
  notaActual: NotaUrgencias | null = null;

  // Estados de carga y errores
  cargando = false;
  error: string | null = null;
  exito: string | null = null;

  // Formulario reactivo
  notaForm: FormGroup;

  // Opciones para selects
  opcionesEstadoConciencia: { value: string; label: string }[] = [];
  opcionesPronostico: { value: string; label: string }[] = [];

  constructor(
    private notasService: NotasUrgenciasService,
    private fb: FormBuilder
  ) {
    this.notaForm = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarNotas();
    this.cargarOpciones();
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      // Campo obligatorio
      id_documento: [0, [Validators.required, Validators.min(1)]],

      // Motivo de atención - OBLIGATORIO
      motivo_atencion: ['', [Validators.required]],

      // Estado de conciencia
      estado_conciencia: [''],

      // Resumen de interrogatorio
      resumen_interrogatorio: [''],

      // Exploración física
      exploracion_fisica: [''],

      // Resultados de estudios
      resultados_estudios: [''],

      // Estado mental
      estado_mental: [''],

      // Diagnóstico
      diagnostico: [''],

      // Guía clínica
      id_guia_diagnostico: [null],

      // Plan de tratamiento
      plan_tratamiento: [''],

      // Pronóstico
      pronostico: [''],

      // Área de interconsulta
      area_interconsulta: [null]
    });
  }

  private cargarOpciones(): void {
    this.opcionesEstadoConciencia = this.notasService.getOpcionesEstadoConciencia();
    this.opcionesPronostico = this.notasService.getOpcionesPronostico();
  }

  cargarNotas(): void {
    this.cargando = true;
    this.error = null;

    this.notasService.getNotasUrgencias().subscribe({
      next: (response: ApiResponse<NotaUrgencias[]>) => {
        if (response.success && response.data) {
          this.notas = response.data;
        } else {
          this.error = response.message || 'Error al cargar notas de urgencias';
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar notas:', error);
        this.error = 'Error de conexión al cargar notas de urgencias';
        this.cargando = false;
      }
    });
  }

  nuevaNota(): void {
    this.editando = false;
    this.notaActual = null;
    this.notaForm.reset();
    this.notaForm.patchValue({
      id_documento: 0,
      id_guia_diagnostico: null,
      area_interconsulta: null
    });
    this.mostrarFormulario = true;
    this.limpiarMensajes();
  }

  editarNota(nota: NotaUrgencias): void {
    this.editando = true;
    this.notaActual = nota;
    this.notaForm.patchValue(nota);
    this.mostrarFormulario = true;
    this.limpiarMensajes();
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.notaActual = null;
    this.notaForm.reset();
    this.limpiarMensajes();
  }

  guardarNota(): void {
    if (this.notaForm.invalid) {
      this.marcarCamposComoTocados();
      this.error = 'Por favor complete los campos obligatorios';
      return;
    }

    this.cargando = true;
    this.limpiarMensajes();

    const formData = this.notaForm.value;
    const notaData: CreateNotaUrgenciasDto = this.limpiarFormData(formData);

    // Validar datos antes de enviar
    const validacion = this.notasService.validarDatosNotaUrgencias(notaData);
    if (!validacion.valido) {
      this.error = validacion.errores.join(', ');
      this.cargando = false;
      return;
    }

    if (this.editando && this.notaActual) {
      // Actualizar nota existente
      this.notasService.updateNotaUrgencias(this.notaActual.id_nota_urgencias, notaData).subscribe({
        next: (response: ApiResponse<NotaUrgencias>) => {
          if (response.success) {
            this.exito = 'Nota de urgencias actualizada correctamente';
            this.cargarNotas();
            this.cancelarEdicion();
          } else {
            this.error = response.message || 'Error al actualizar nota de urgencias';
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al actualizar nota:', error);
          this.error = this.extraerMensajeError(error);
          this.cargando = false;
        }
      });
    } else {
      // Crear nueva nota
      this.notasService.createNotaUrgencias(notaData).subscribe({
        next: (response: ApiResponse<NotaUrgencias>) => {
          if (response.success) {
            this.exito = 'Nota de urgencias creada correctamente';
            this.cargarNotas();
            this.cancelarEdicion();
          } else {
            this.error = response.message || 'Error al crear nota de urgencias';
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al crear nota:', error);
          this.error = this.extraerMensajeError(error);
          this.cargando = false;
        }
      });
    }
  }

  eliminarNota(nota: NotaUrgencias): void {
    if (!confirm('¿Está seguro de que desea eliminar esta nota de urgencias?')) {
      return;
    }

    this.cargando = true;
    this.limpiarMensajes();

    this.notasService.deleteNotaUrgencias(nota.id_nota_urgencias).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this.exito = 'Nota de urgencias eliminada correctamente';
          this.cargarNotas();
        } else {
          this.error = response.message || 'Error al eliminar nota de urgencias';
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al eliminar nota:', error);
        this.error = this.extraerMensajeError(error);
        this.cargando = false;
      }
    });
  }

  private limpiarFormData(formData: any): CreateNotaUrgenciasDto {
    const data: any = {};

    // Solo incluir campos que tengan valor
    Object.keys(formData).forEach(key => {
      const value = formData[key];

      if (value !== null && value !== undefined && value !== '') {
        // Para campos numéricos, convertir string vacío a null
        if (['id_documento', 'id_guia_diagnostico', 'area_interconsulta'].includes(key)) {
          data[key] = value === '' ? null : Number(value);
        } else {
          // Para campos de texto, trim spaces
          data[key] = typeof value === 'string' ? value.trim() : value;
        }
      }
    });

    return data;
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.notaForm.controls).forEach(key => {
      this.notaForm.get(key)?.markAsTouched();
    });
  }

  private extraerMensajeError(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Error desconocido al procesar la solicitud';
  }

  private limpiarMensajes(): void {
    this.error = null;
    this.exito = null;
  }

  // Métodos de utilidad para el template
  esCampoObligatorio(campo: string): boolean {
    const control = this.notaForm.get(campo);
    return control ? control.hasError('required') : false;
  }

  mostrarErrorCampo(campo: string): boolean {
    const control = this.notaForm.get(campo);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  obtenerErrorCampo(campo: string): string {
    const control = this.notaForm.get(campo);
    if (control && control.errors) {
      if (control.errors['required']) return 'Este campo es obligatorio';
      if (control.errors['min']) return 'El valor debe ser mayor o igual a 1';
    }
    return '';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'No especificada';
    return this.notasService.formatearFechaHora(fecha);
  }

  generarResumen(nota: NotaUrgencias): string {
    return this.notasService.generarResumen(nota);
  }

  obtenerNivelUrgencia(nota: NotaUrgencias): string {
    return this.notasService.determinarNivelUrgencia(nota.estado_conciencia);
  }

  obtenerColorUrgencia(nota: NotaUrgencias): string {
    const nivel = this.obtenerNivelUrgencia(nota);
    return this.notasService.getColorNivelUrgencia(nivel);
  }

  obtenerIconoUrgencia(nota: NotaUrgencias): string {
    const nivel = this.obtenerNivelUrgencia(nota);
    return this.notasService.getIconoNivelUrgencia(nivel);
  }

  formatearTiempoEspera(minutos: number): string {
    return this.notasService.formatearTiempoEspera(minutos);
  }

  puedeEditar(nota: NotaUrgencias): boolean {
    return this.notasService.puedeEditar(nota).puede;
  }

  obtenerRazonNoEditable(nota: NotaUrgencias): string {
    const resultado = this.notasService.puedeEditar(nota);
    return resultado.razon || '';
  }
}
