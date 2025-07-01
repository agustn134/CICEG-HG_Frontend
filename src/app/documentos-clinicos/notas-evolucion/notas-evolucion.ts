import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotasEvolucionService } from '../../services/documentos-clinicos/notas-evolucion';
import {
  NotaEvolucion,
  CreateNotaEvolucionDto,
  PlantillaSOAP
} from '../../models/nota-evolucion.model';
import { ApiResponse } from '../../models/base.models';

@Component({
  selector: 'app-notas-evolucion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './notas-evolucion.html',
  styleUrl: './notas-evolucion.css'
})
export class NotasEvolucionComponent implements OnInit {
  notas: NotaEvolucion[] = [];

  // Control de vistas
  mostrarFormulario = false;
  editando = false;
  notaActual: NotaEvolucion | null = null;

  // Estados de carga y errores
  cargando = false;
  error: string | null = null;
  exito: string | null = null;

  // Formulario reactivo
  notaForm: FormGroup;

  // Plantillas SOAP
  plantillasSOAP: PlantillaSOAP[] = [];
  plantillaSeleccionada: string = '';

  constructor(
    private notasService: NotasEvolucionService,
    private fb: FormBuilder
  ) {
    this.notaForm = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarNotas();
    this.cargarPlantillas();
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      // Campo obligatorio
      id_documento: [0, [Validators.required, Validators.min(1)]],

      // Campos SOAP (todos opcionales)
      subjetivo: [''],
      objetivo: [''],
      analisis: [''],
      plan: ['']
    });
  }

  private cargarPlantillas(): void {
    this.plantillasSOAP = this.notasService.getPlantillasSOAP();
  }

  cargarNotas(): void {
    this.cargando = true;
    this.error = null;

    this.notasService.getNotasEvolucion().subscribe({
      next: (response: ApiResponse<NotaEvolucion[]>) => {
        if (response.success && response.data) {
          this.notas = response.data;
        } else {
          this.error = response.message || 'Error al cargar notas de evolución';
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar notas:', error);
        this.error = 'Error de conexión al cargar notas de evolución';
        this.cargando = false;
      }
    });
  }

  nuevaNota(): void {
    this.editando = false;
    this.notaActual = null;
    this.notaForm.reset();
    this.notaForm.patchValue({
      id_documento: 0
    });
    this.plantillaSeleccionada = '';
    this.mostrarFormulario = true;
    this.limpiarMensajes();
  }

  editarNota(nota: NotaEvolucion): void {
    this.editando = true;
    this.notaActual = nota;
    this.notaForm.patchValue(nota);
    this.plantillaSeleccionada = '';
    this.mostrarFormulario = true;
    this.limpiarMensajes();
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.notaActual = null;
    this.notaForm.reset();
    this.plantillaSeleccionada = '';
    this.limpiarMensajes();
  }

  aplicarPlantilla(): void {
    if (!this.plantillaSeleccionada) {
      return;
    }

    const plantillaData = this.notasService.aplicarPlantilla(this.plantillaSeleccionada);
    this.notaForm.patchValue(plantillaData);
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
    const notaData: CreateNotaEvolucionDto = this.limpiarFormData(formData);

    // Validar datos antes de enviar
    const validacion = this.notasService.validarDatosNotaEvolucion(notaData);
    if (!validacion.valido) {
      this.error = validacion.errores.join(', ');
      this.cargando = false;
      return;
    }

    if (this.editando && this.notaActual) {
      // Actualizar nota existente
      this.notasService.updateNotaEvolucion(this.notaActual.id_nota_evolucion, notaData).subscribe({
        next: (response: ApiResponse<NotaEvolucion>) => {
          if (response.success) {
            this.exito = 'Nota de evolución actualizada correctamente';
            this.cargarNotas();
            this.cancelarEdicion();
          } else {
            this.error = response.message || 'Error al actualizar nota de evolución';
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
      this.notasService.createNotaEvolucion(notaData).subscribe({
        next: (response: ApiResponse<NotaEvolucion>) => {
          if (response.success) {
            this.exito = 'Nota de evolución creada correctamente';
            this.cargarNotas();
            this.cancelarEdicion();
          } else {
            this.error = response.message || 'Error al crear nota de evolución';
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

  eliminarNota(nota: NotaEvolucion): void {
    if (!confirm('¿Está seguro de que desea eliminar esta nota de evolución?')) {
      return;
    }

    this.cargando = true;
    this.limpiarMensajes();

    this.notasService.deleteNotaEvolucion(nota.id_nota_evolucion).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this.exito = 'Nota de evolución eliminada correctamente';
          this.cargarNotas();
        } else {
          this.error = response.message || 'Error al eliminar nota de evolución';
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

  private limpiarFormData(formData: any): CreateNotaEvolucionDto {
    const data: any = {};

    // Solo incluir campos que tengan valor
    Object.keys(formData).forEach(key => {
      const value = formData[key];

      if (value !== null && value !== undefined && value !== '') {
        // Para el campo id_documento, convertir a número
        if (key === 'id_documento') {
          data[key] = Number(value);
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
    return this.notasService.formatearFecha(fecha);
  }

  generarResumen(nota: NotaEvolucion): string {
    return this.notasService.generarResumen(nota);
  }

  calcularCompletitud(nota: NotaEvolucion): number {
    return this.notasService.calcularCompletitud(nota).porcentaje;
  }

  obtenerColorCompletitud(nota: NotaEvolucion): string {
    const porcentaje = this.calcularCompletitud(nota);
    return this.notasService.getColorCompletitud(porcentaje);
  }

  puedeEditar(nota: NotaEvolucion): boolean {
    return this.notasService.puedeEditar(nota).puede;
  }

  obtenerRazonNoEditable(nota: NotaEvolucion): string {
    const resultado = this.notasService.puedeEditar(nota);
    return resultado.razon || '';
  }

  formatearSOAP(nota: NotaEvolucion): string {
    return this.notasService.formatearSOAP(nota);
  }
}
