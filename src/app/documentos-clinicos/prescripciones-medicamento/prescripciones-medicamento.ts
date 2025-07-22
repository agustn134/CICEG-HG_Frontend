import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrescripcionesMedicamentoService, PaginatedResponse } from '../../services/documentos-clinicos/prescripciones-medicamento';
import {
  PrescripcionMedicamento,
  PrescripcionMedicamentoFilters,
  CreatePrescripcionMedicamentoDto
} from '../../models/prescripcion-medicamento.model';

@Component({
  selector: 'app-prescripciones-medicamento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './prescripciones-medicamento.html',
  styleUrl: './prescripciones-medicamento.css'
})
export class PrescripcionesMedicamento implements OnInit {

  // ==========================================
  // PROPIEDADES PRINCIPALES
  // ==========================================
  prescripciones: PrescripcionMedicamento[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;

  // ==========================================
  // FORMULARIOS
  // ==========================================
  searchForm!: FormGroup;
  prescripcionForm!: FormGroup;

  // ==========================================
  // CONTROL DE MODALES Y VISTAS
  // ==========================================
  showCreateModal = false;
  showEditModal = false;
  showViewModal = false;
  selectedPrescripcion: PrescripcionMedicamento | null = null;

  // ==========================================
  // PAGINACIÓN
  // ==========================================
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // ==========================================
  // OPCIONES PARA SELECTS
  // ==========================================
  viasAdministracion = [
    'Oral',
    'Intravenosa (IV)',
    'Intramuscular (IM)',
    'Subcutánea (SC)',
    'Tópica',
    'Inhalatoria',
    'Rectal',
    'Vaginal',
    'Oftálmica',
    'Ótica',
    'Nasal'
  ];

  frecuenciasComunes = [
    'Cada 6 horas',
    'Cada 8 horas',
    'Cada 12 horas',
    'Cada 24 horas',
    'Cada 48 horas',
    'Una vez al día',
    'Dos veces al día',
    'Tres veces al día',
    'Según necesidad (PRN)',
    'Antes de las comidas',
    'Después de las comidas'
  ];

  constructor(
    private prescripcionesService: PrescripcionesMedicamentoService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadPrescripciones();
  }

  // ==========================================
  // INICIALIZACIÓN DE FORMULARIOS
  // ==========================================
  private initializeForms(): void {
    // Formulario de búsqueda
    this.searchForm = this.fb.group({
      buscar: [''],
      activo: [true],
      via_administracion: [''],
      fecha_inicio: [''],
      fecha_fin: ['']
    });

    // Formulario para crear/editar prescripción
 this.prescripcionForm = this.fb.group({
  id_documento: [1, Validators.required],
  id_medicamento: [1], // Opcional
  medicamento: ['', Validators.required], // Agregado como requerido
  dosis: ['', [Validators.required, Validators.minLength(1)]],
  via_administracion: ['ORAL', Validators.required],
  frecuencia: ['', Validators.required],
  duracion: [''], // Este será para duracion_tratamiento
  indicaciones_especiales: [''],
  fecha_inicio: [this.getCurrentDate(), Validators.required],
  fecha_fin: [''],
  activo: [true]
});
  }

  // ==========================================
  // MÉTODOS DE CARGA DE DATOS
  // ==========================================
  loadPrescripciones(): void {
    this.loading = true;
    this.error = null;

    const filters: PrescripcionMedicamentoFilters = {
      page: this.currentPage,
      limit: this.pageSize,
      ...this.searchForm.value
    };

    this.prescripcionesService.getPrescripciones(filters).subscribe({
      next: (response: PaginatedResponse<PrescripcionMedicamento>) => {
        if (response.success) {
          this.prescripciones = response.data;
          this.totalItems = response.pagination?.total || 0;
          this.totalPages = response.pagination?.totalPages || 0;
        } else {
          this.error = response.message || 'Error al cargar prescripciones';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar prescripciones:', error);
        this.error = 'Error de conexión al cargar prescripciones';
        this.loading = false;
      }
    });
  }

  // ==========================================
  // MÉTODOS DE BÚSQUEDA Y FILTROS
  // ==========================================
  onSearch(): void {
    this.currentPage = 1;
    this.loadPrescripciones();
  }

  clearSearch(): void {
    this.searchForm.reset({
      activo: true
    });
    this.currentPage = 1;
    this.loadPrescripciones();
  }

  // ==========================================
  // MÉTODOS DE PAGINACIÓN
  // ==========================================
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPrescripciones();
    }
  }

  // ==========================================
  // MÉTODOS PARA CREAR PRESCRIPCIÓN
  // ==========================================
  openCreateModal(): void {
    this.prescripcionForm.reset({
      id_documento: 1,
      id_medicamento: 1,
      dosis: '',
      via_administracion: 'Oral',
      fecha_inicio: this.getCurrentDate(),
      activo: true
    });
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.prescripcionForm.reset();
  }

  onSubmitCreate(): void {
    if (this.prescripcionForm.valid) {
      this.loading = true;
      this.error = null;

      const prescripcionData: CreatePrescripcionMedicamentoDto = this.prescripcionForm.value;

      this.prescripcionesService.createPrescripcion(prescripcionData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Prescripción creada exitosamente';
            this.closeCreateModal();
            this.loadPrescripciones();
            this.clearMessages(3000);
          } else {
            this.error = response.message || 'Error al crear prescripción';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al crear prescripción:', error);
          this.error = error.error?.message || 'Error de conexión al crear prescripción';
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.prescripcionForm);
    }
  }

  // ==========================================
  // MÉTODOS PARA EDITAR PRESCRIPCIÓN
  // // ==========================================
  // openEditModal(prescripcion: PrescripcionMedicamento): void {
  //   this.selectedPrescripcion = prescripcion;

  //   this.prescripcionForm.patchValue({
  //     id_documento: prescripcion.id_documento,
  //     id_medicamento: prescripcion.id_medicamento,
  //     dosis: prescripcion.dosis,
  //     via_administracion: prescripcion.via_administracion || 'Oral',
  //     frecuencia: prescripcion.frecuencia,
  //     duracion: prescripcion.duracion,
  //     indicaciones_especiales: prescripcion.indicaciones_especiales,
  //     fecha_inicio: prescripcion.fecha_inicio?.split('T')[0],
  //     fecha_fin: prescripcion.fecha_fin?.split('T')[0],
  //     activo: prescripcion.activo
  //   });

  //   this.showEditModal = true;
  // }
openEditModal(prescripcion: PrescripcionMedicamento): void {
  this.selectedPrescripcion = prescripcion;

  this.prescripcionForm.patchValue({
    id_documento: prescripcion.id_documento,
    id_medicamento: prescripcion.id_medicamento,
    medicamento: prescripcion.medicamento, // Agregado
    dosis: prescripcion.dosis,
    via_administracion: prescripcion.via_administracion || 'ORAL',
    frecuencia: prescripcion.frecuencia,
    duracion: prescripcion.duracion || prescripcion.duracion_tratamiento, // Usar ambos campos
    indicaciones_especiales: prescripcion.indicaciones_especiales,
    fecha_inicio: prescripcion.fecha_inicio?.split('T')[0],
    fecha_fin: prescripcion.fecha_fin?.split('T')[0],
    activo: prescripcion.activo
  });

  this.showEditModal = true;
}

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedPrescripcion = null;
    this.prescripcionForm.reset();
  }

  onSubmitEdit(): void {
    if (this.prescripcionForm.valid && this.selectedPrescripcion) {
      this.loading = true;
      this.error = null;

      const updateData = this.prescripcionForm.value;

      this.prescripcionesService.updatePrescripcion(this.selectedPrescripcion.id_prescripcion, updateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Prescripción actualizada exitosamente';
            this.closeEditModal();
            this.loadPrescripciones();
            this.clearMessages(3000);
          } else {
            this.error = response.message || 'Error al actualizar prescripción';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al actualizar prescripción:', error);
          this.error = error.error?.message || 'Error de conexión al actualizar prescripción';
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.prescripcionForm);
    }
  }

  // ==========================================
  // MÉTODOS PARA VER DETALLES
  // ==========================================
  openViewModal(prescripcion: PrescripcionMedicamento): void {
    this.selectedPrescripcion = prescripcion;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedPrescripcion = null;
  }

  // ==========================================
  // MÉTODOS PARA DESACTIVAR PRESCRIPCIÓN
  // ==========================================
  onDelete(id: number): void {
    if (confirm('¿Está seguro de que desea desactivar esta prescripción?')) {
      this.loading = true;
      this.error = null;

      this.prescripcionesService.deletePrescripcion(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Prescripción desactivada exitosamente';
            this.loadPrescripciones();
            this.clearMessages(3000);
          } else {
            this.error = response.message || 'Error al desactivar prescripción';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al desactivar prescripción:', error);
          this.error = error.error?.message || 'Error de conexión al desactivar prescripción';
          this.loading = false;
        }
      });
    }
  }

  // ==========================================
  // MÉTODOS PARA TOGGLE ACTIVO
  // ==========================================
  onToggleActive(prescripcion: PrescripcionMedicamento): void {
    this.loading = true;
    this.error = null;

    this.prescripcionesService.toggleActivePrescripcion(
      prescripcion.id_prescripcion,
      !prescripcion.activo
    ).subscribe({
      next: (response) => {
        if (response.success) {
          const action = prescripcion.activo ? 'desactivada' : 'activada';
          this.success = `Prescripción ${action} exitosamente`;
          this.loadPrescripciones();
          this.clearMessages(3000);
        } else {
          this.error = response.message || 'Error al cambiar estado de prescripción';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        this.error = error.error?.message || 'Error de conexión al cambiar estado';
        this.loading = false;
      }
    });
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================
  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private clearMessages(delay: number = 5000): void {
    setTimeout(() => {
      this.success = null;
      this.error = null;
    }, delay);
  }

  // ==========================================
  // GETTERS PARA VALIDACIONES DE FORMULARIO
  // ==========================================
  get dosis() { return this.prescripcionForm.get('dosis'); }
  get viaAdministracion() { return this.prescripcionForm.get('via_administracion'); }
  get frecuencia() { return this.prescripcionForm.get('frecuencia'); }
  get fechaInicio() { return this.prescripcionForm.get('fecha_inicio'); }
}
