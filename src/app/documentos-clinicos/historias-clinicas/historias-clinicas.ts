import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HistoriasClinicasService } from '../../services/documentos-clinicos/historias-clinicas';
import {
  HistoriaClinica,
  CreateHistoriaClinicaDto,
  HistoriaClinicaListResponse
} from '../../models/historia-clinica.model';
import { ApiResponse } from '../../models/base.models';

@Component({
  selector: 'app-historias-clinicas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './historias-clinicas.html',
  styleUrl: './historias-clinicas.css'
})
export class HistoriasClinicasComponent implements OnInit {
  historias: HistoriaClinica[] = [];

  // Control de vistas
  mostrarFormulario = false;
  editando = false;
  historiaActual: HistoriaClinica | null = null;

  // Estados de carga y errores
  cargando = false;
  error: string | null = null;
  exito: string | null = null;

  // Formulario reactivo
  historiaForm: FormGroup;

  constructor(
    private historiasService: HistoriasClinicasService,
    private fb: FormBuilder
  ) {
    this.historiaForm = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarHistorias();
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      // Campo obligatorio
      id_documento: [0, [Validators.required, Validators.min(1)]],

      // Antecedentes heredofamiliares
      antecedentes_heredo_familiares: [''],

      // Antecedentes personales no patológicos
      habitos_higienicos: [''],
      habitos_alimenticios: [''],
      actividad_fisica: [''],
      ocupacion: [''],
      vivienda: [''],
      toxicomanias: [''],

      // Antecedentes ginecobstétricos
      menarca: [''],
      ritmo_menstrual: [''],
      inicio_vida_sexual: [''],
      fecha_ultima_regla: [''],
      fecha_ultimo_parto: [''],
      gestas: [null, [Validators.min(0)]],
      partos: [null, [Validators.min(0)]],
      cesareas: [null, [Validators.min(0)]],
      abortos: [null, [Validators.min(0)]],
      hijos_vivos: [null, [Validators.min(0)]],
      metodo_planificacion: [''],

      // Antecedentes personales patológicos
      enfermedades_infancia: [''],
      enfermedades_adulto: [''],
      cirugias_previas: [''],
      traumatismos: [''],
      alergias: [''],

      // Padecimiento actual - OBLIGATORIO
      padecimiento_actual: ['', [Validators.required]],
      sintomas_generales: [''],
      aparatos_sistemas: [''],

      // Exploración física - OBLIGATORIO
      exploracion_general: ['', [Validators.required]],
      exploracion_cabeza: [''],
      exploracion_cuello: [''],
      exploracion_torax: [''],
      exploracion_abdomen: [''],
      exploracion_columna: [''],
      exploracion_extremidades: [''],
      exploracion_genitales: [''],

      // Impresión diagnóstica y plan - OBLIGATORIO
      impresion_diagnostica: ['', [Validators.required]],
      id_guia_diagnostico: [null],
      plan_diagnostico: [''],
      plan_terapeutico: [''],
      pronostico: ['']
    });
  }

  cargarHistorias(): void {
    this.cargando = true;
    this.error = null;

    this.historiasService.getHistoriasClinicas().subscribe({
      next: (response: ApiResponse<HistoriaClinicaListResponse>) => {
        if (response.success && response.data) {
          this.historias = response.data.data;
        } else {
          this.error = response.message || 'Error al cargar historias clínicas';
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar historias:', error);
        this.error = 'Error de conexión al cargar historias clínicas';
        this.cargando = false;
      }
    });
  }

  nuevaHistoria(): void {
    this.editando = false;
    this.historiaActual = null;
    this.historiaForm.reset();
    this.historiaForm.patchValue({
      id_documento: 0,
      gestas: null,
      partos: null,
      cesareas: null,
      abortos: null,
      hijos_vivos: null,
      id_guia_diagnostico: null
    });
    this.mostrarFormulario = true;
    this.limpiarMensajes();
  }

  editarHistoria(historia: HistoriaClinica): void {
    this.editando = true;
    this.historiaActual = historia;
    this.historiaForm.patchValue(historia);
    this.mostrarFormulario = true;
    this.limpiarMensajes();
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.historiaActual = null;
    this.historiaForm.reset();
    this.limpiarMensajes();
  }

  guardarHistoria(): void {
    if (this.historiaForm.invalid) {
      this.marcarCamposComoTocados();
      this.error = 'Por favor complete los campos obligatorios';
      return;
    }

    this.cargando = true;
    this.limpiarMensajes();

    const formData = this.historiaForm.value;
    const historiaData: CreateHistoriaClinicaDto = this.limpiarFormData(formData);

    if (this.editando && this.historiaActual) {
      // Actualizar historia existente
      this.historiasService.updateHistoriaClinica(this.historiaActual.id_historia_clinica, historiaData).subscribe({
        next: (response: ApiResponse<HistoriaClinica>) => {
          if (response.success) {
            this.exito = 'Historia clínica actualizada correctamente';
            this.cargarHistorias();
            this.cancelarEdicion();
          } else {
            this.error = response.message || 'Error al actualizar historia clínica';
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al actualizar historia:', error);
          this.error = this.extraerMensajeError(error);
          this.cargando = false;
        }
      });
    } else {
      // Crear nueva historia
      this.historiasService.createHistoriaClinica(historiaData).subscribe({
        next: (response: ApiResponse<HistoriaClinica>) => {
          if (response.success) {
            this.exito = 'Historia clínica creada correctamente';
            this.cargarHistorias();
            this.cancelarEdicion();
          } else {
            this.error = response.message || 'Error al crear historia clínica';
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al crear historia:', error);
          this.error = this.extraerMensajeError(error);
          this.cargando = false;
        }
      });
    }
  }

  eliminarHistoria(historia: HistoriaClinica): void {
    if (!confirm('¿Está seguro de que desea eliminar esta historia clínica?')) {
      return;
    }

    this.cargando = true;
    this.limpiarMensajes();

    this.historiasService.deleteHistoriaClinica(historia.id_historia_clinica).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this.exito = 'Historia clínica eliminada correctamente';
          this.cargarHistorias();
        } else {
          this.error = response.message || 'Error al eliminar historia clínica';
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al eliminar historia:', error);
        this.error = this.extraerMensajeError(error);
        this.cargando = false;
      }
    });
  }

  private limpiarFormData(formData: any): CreateHistoriaClinicaDto {
    const data: any = {};

    // Solo incluir campos que tengan valor
    Object.keys(formData).forEach(key => {
      const value = formData[key];

      if (value !== null && value !== undefined && value !== '') {
        // Para campos numéricos, convertir string vacío a null
        if (['gestas', 'partos', 'cesareas', 'abortos', 'hijos_vivos', 'id_documento', 'id_guia_diagnostico'].includes(key)) {
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
    Object.keys(this.historiaForm.controls).forEach(key => {
      this.historiaForm.get(key)?.markAsTouched();
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
    const control = this.historiaForm.get(campo);
    return control ? control.hasError('required') : false;
  }

  mostrarErrorCampo(campo: string): boolean {
    const control = this.historiaForm.get(campo);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  obtenerErrorCampo(campo: string): string {
    const control = this.historiaForm.get(campo);
    if (control && control.errors) {
      if (control.errors['required']) return 'Este campo es obligatorio';
      if (control.errors['min']) return 'El valor debe ser mayor o igual a 0';
    }
    return '';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'No especificada';
    return this.historiasService.formatearFechaHora(fecha);
  }

  generarResumen(historia: HistoriaClinica): string {
    return this.historiasService.generarResumen(historia);
  }
}
