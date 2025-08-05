// src/app/catalogos/guias-clinicas/guias-clinicas.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GuiasClinicasService } from '../../services/catalogos/guias-clinicas';
import { 
  GuiaClinica, 
  CreateGuiaClinicaDto, 
  AREAS_DISPONIBLES, 
  FUENTES_DISPONIBLES 
} from '../../models/guia-clinica.model';

@Component({
  selector: 'app-guias-clinicas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './guias-clinicas.html',
  styleUrl: './guias-clinicas.css'
})
export class GuiasClinicasComponent implements OnInit {

  guiasClinicasForm: FormGroup;
  filtersForm: FormGroup;
  guiasClinicas: GuiaClinica[] = [];
  filteredGuias: GuiaClinica[] = [];
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;
  success: string | null = null;
  editingId: number | null = null;
  showForm = false;

  // Usar las constantes del modelo
  areas = AREAS_DISPONIBLES;
  fuentes = FUENTES_DISPONIBLES;

  constructor(
    private fb: FormBuilder,
    private guiasClinicasService: GuiasClinicasService
  ) {
    this.guiasClinicasForm = this.createForm();
    this.filtersForm = this.createFiltersForm();
  }

  ngOnInit(): void {
    this.loadGuiasClinicas();
    this.setupFilters();
  }

  createForm(): FormGroup {
    return this.fb.group({
      codigo: [''],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      area: [''],
      fuente: [''],
      fecha_actualizacion: [''],
      descripcion: [''],
      activo: [true]
    });
  }

  createFiltersForm(): FormGroup {
    return this.fb.group({
      buscar: [''],
      area: [''],
      fuente: [''],
      activo: ['']
    });
  }

  setupFilters(): void {
    this.filtersForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  async loadGuiasClinicas(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.guiasClinicasService.getAll();
      this.guiasClinicas = response.data || [];
      this.filteredGuias = [...this.guiasClinicas];
    } catch (error: any) {
      this.error = 'Error al cargar las guías clínicas';
      console.error('Error loading guias clinicas:', error);
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters(): void {
    const filters = this.filtersForm.value;
    let filtered = [...this.guiasClinicas];

    // Filtro por búsqueda de texto
    if (filters.buscar && filters.buscar.trim()) {
      const searchTerm = filters.buscar.toLowerCase();
      filtered = filtered.filter(guia =>
        guia.nombre.toLowerCase().includes(searchTerm) ||
        (guia.codigo && guia.codigo.toLowerCase().includes(searchTerm)) ||
        (guia.descripcion && guia.descripcion.toLowerCase().includes(searchTerm))
      );
    }

    // Filtro por área
    if (filters.area) {
      filtered = filtered.filter(guia => guia.area === filters.area);
    }

    // Filtro por fuente
    if (filters.fuente) {
      filtered = filtered.filter(guia => guia.fuente === filters.fuente);
    }

    // Filtro por estado activo
    if (filters.activo !== '') {
      const isActive = filters.activo === 'true';
      filtered = filtered.filter(guia => guia.activo === isActive);
    }

    this.filteredGuias = filtered;
  }

  async onSubmit(): Promise<void> {
    if (this.guiasClinicasForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    this.success = null;

    try {
      const formData = this.guiasClinicasForm.value as CreateGuiaClinicaDto;

      if (this.editingId) {
        await this.guiasClinicasService.update(this.editingId, formData);
        this.success = 'Guía clínica actualizada correctamente';
      } else {
        await this.guiasClinicasService.create(formData);
        this.success = 'Guía clínica creada correctamente';
      }

      this.resetForm();
      await this.loadGuiasClinicas();

    } catch (error: any) {
      this.error = error.error?.message || 'Error al guardar la guía clínica';
      console.error('Error saving guia clinica:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  editGuiaClinica(guia: GuiaClinica): void {
    this.editingId = guia.id_guia_diagnostico;
    this.showForm = true;

    // Formatear fecha para el input date
    let fechaFormateada = '';
    if (guia.fecha_actualizacion) {
      const fecha = new Date(guia.fecha_actualizacion);
      fechaFormateada = fecha.toISOString().split('T')[0];
    }

    this.guiasClinicasForm.patchValue({
      codigo: guia.codigo || '',
      nombre: guia.nombre,
      area: guia.area || '',
      fuente: guia.fuente || '',
      fecha_actualizacion: fechaFormateada,
      descripcion: guia.descripcion || '',
      activo: guia.activo
    });
    this.clearMessages();
  }

  async deleteGuiaClinica(id: number): Promise<void> {
    if (!confirm('¿Está seguro de eliminar esta guía clínica?')) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      await this.guiasClinicasService.delete(id);
      this.success = 'Guía clínica eliminada correctamente';
      await this.loadGuiasClinicas();
    } catch (error: any) {
      this.error = error.error?.message || 'Error al eliminar la guía clínica';
      console.error('Error deleting guia clinica:', error);
    } finally {
      this.isLoading = false;
    }
  }

  showNewForm(): void {
    this.showForm = true;
    this.resetForm();
  }

  hideForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.editingId = null;
    this.guiasClinicasForm.reset({
      codigo: '',
      nombre: '',
      area: '',
      fuente: '',
      fecha_actualizacion: '',
      descripcion: '',
      activo: true
    });
    this.clearMessages();
  }

  clearFilters(): void {
    this.filtersForm.reset({
      buscar: '',
      area: '',
      fuente: '',
      activo: ''
    });
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.guiasClinicasForm.controls).forEach(key => {
      const control = this.guiasClinicasForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.guiasClinicasForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.guiasClinicasForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  formatDate(dateString: string | undefined | null): string {
    if (!dateString) return 'No especificada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX');
    } catch {
      return 'Fecha inválida';
    }
  }
}