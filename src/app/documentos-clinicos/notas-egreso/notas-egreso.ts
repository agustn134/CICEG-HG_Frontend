// src/app/documentos-clinicos/notas-egreso/notas-egreso.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotasEgresoService } from '../../services/documentos-clinicos/notas-egreso';
import {
  NotaEgreso,
  CreateNotaEgresoDto,
  PlantillaNotaEgreso
} from '../../models/nota-egreso.model';
import { ApiResponse } from '../../models/base.models';

@Component({
  selector: 'app-notas-egreso',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './notas-egreso.html',
  styleUrl: './notas-egreso.css'
})
export class NotasEgresoComponent implements OnInit {
  notas: NotaEgreso[] = [];

  // Control de vistas
  mostrarFormulario = false;
  editando = false;
  notaActual: NotaEgreso | null = null;

  // Estados de carga y errores
  cargando = false;
  error: string | null = null;
  exito: string | null = null;

  // Formulario reactivo
  notaForm: FormGroup;

  // Plantillas y opciones
  plantillas: PlantillaNotaEgreso[] = [];
  plantillaSeleccionada: string = '';
  motivosEgreso: { value: string; label: string }[] = [];

  constructor(
    private notasService: NotasEgresoService,
    private fb: FormBuilder
  ) {
    this.notaForm = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarNotas();
    this.cargarPlantillas();
    this.cargarMotivosEgreso();
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      // Campo obligatorio
      id_documento: [0, [Validators.required, Validators.min(1)]],

      // Campos principales
      diagnostico_ingreso: [''],
      resumen_evolucion: [''],
      manejo_hospitalario: [''],
      diagnostico_egreso: ['', Validators.required],
      id_guia_diagnostico: [null],
      procedimientos_realizados: [''],
      fecha_procedimientos: [''],
      motivo_egreso: ['', Validators.required],
      problemas_pendientes: [''],
      plan_tratamiento: ['', Validators.required],
      recomendaciones_vigilancia: [''],
      atencion_factores_riesgo: [''],
      pronostico: [''],
      reingreso_por_misma_afeccion: [false]
    });
  }

  private cargarPlantillas(): void {
    this.plantillas = this.notasService.getPlantillasNotaEgreso();
  }

  private cargarMotivosEgreso(): void {
    this.motivosEgreso = this.notasService.getMotivosEgresoOpciones();
  }

  cargarNotas(): void {
    this.cargando = true;
    this.error = null;

    this.notasService.getNotasEgreso().subscribe({
      next: (response: ApiResponse<NotaEgreso[]>) => {
        if (response.success && response.data) {
          this.notas = response.data;
        } else {
          this.error = response.message || 'Error al cargar notas de egreso';
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar notas:', error);
        this.error = 'Error de conexión al cargar notas de egreso';
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
      reingreso_por_misma_afeccion: false
    });
    this.plantillaSeleccionada = '';
    this.mostrarFormulario = true;
    this.limpiarMensajes();
  }

  editarNota(nota: NotaEgreso): void {
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
    const notaData: CreateNotaEgresoDto = this.limpiarFormData(formData);

    // Validar datos antes de enviar
    const validacion = this.notasService.validarDatosNotaEgreso(notaData);
    if (!validacion.valido) {
      this.error = validacion.errores.join(', ');
      this.cargando = false;
      return;
    }

    if (this.editando && this.notaActual) {
      // Actualizar nota existente
      this.notasService.updateNotaEgreso(this.notaActual.id_nota_egreso, notaData).subscribe({
        next: (response: ApiResponse<NotaEgreso>) => {
          if (response.success) {
            this.exito = 'Nota de egreso actualizada correctamente';
            this.cargarNotas();
            this.cancelarEdicion();
          } else {
            this.error = response.message || 'Error al actualizar nota de egreso';
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
      this.notasService.createNotaEgreso(notaData).subscribe({
        next: (response: ApiResponse<NotaEgreso>) => {
          if (response.success) {
            this.exito = 'Nota de egreso creada correctamente';
            this.cargarNotas();
            this.cancelarEdicion();
          } else {
            this.error = response.message || 'Error al crear nota de egreso';
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

  eliminarNota(nota: NotaEgreso): void {
    if (!confirm('¿Está seguro de que desea eliminar esta nota de egreso?')) {
      return;
    }

    this.cargando = true;
    this.limpiarMensajes();

    this.notasService.deleteNotaEgreso(nota.id_nota_egreso).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this.exito = 'Nota de egreso eliminada correctamente';
          this.cargarNotas();
        } else {
          this.error = response.message || 'Error al eliminar nota de egreso';
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

  private limpiarFormData(formData: any): CreateNotaEgresoDto {
    const data: any = {};

    // Solo incluir campos que tengan valor
    Object.keys(formData).forEach(key => {
      const value = formData[key];

      if (value !== null && value !== undefined && value !== '') {
        // Para el campo id_documento, convertir a número
        if (key === 'id_documento' || key === 'id_guia_diagnostico') {
          data[key] = Number(value);
        } else if (key === 'reingreso_por_misma_afeccion') {
          data[key] = Boolean(value);
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
    return this.notasService.formatearFecha(fecha);
  }

  generarResumen(nota: NotaEgreso): string {
    return this.notasService.generarResumen(nota);
  }

  getColorMotivo(motivo: string): string {
    return this.notasService.getColorMotivo(motivo);
  }

  esReingreso(nota: NotaEgreso): boolean {
    return this.notasService.esReingreso(nota);
  }

  estaCompleta(nota: NotaEgreso): boolean {
    return this.notasService.estaCompleta(nota);
  }

  exportarNota(nota: NotaEgreso): void {
    const textoPlano = this.notasService.exportarTextoPlano(nota);

    // Crear blob y descarga
    const blob = new Blob([textoPlano], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nota_egreso_${nota.numero_expediente || nota.id_nota_egreso}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  validarNota(nota: NotaEgreso): void {
    this.cargando = true;
    this.limpiarMensajes();

    this.notasService.validarNotaEgreso(nota.id_nota_egreso).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          const validacion = response.data;
          if (validacion.es_completa) {
            this.exito = 'La nota de egreso está completa';
          } else {
            this.error = `Campos faltantes: ${validacion.campos_faltantes.join(', ')}`;
          }
        } else {
          this.error = response.message || 'Error al validar nota';
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al validar nota:', error);
        this.error = this.extraerMensajeError(error);
        this.cargando = false;
      }
    });
  }
}
