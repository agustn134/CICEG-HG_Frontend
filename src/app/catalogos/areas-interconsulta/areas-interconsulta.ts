// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-areas-interconsulta',
//   imports: [],
//   templateUrl: './areas-interconsulta.html',
//   styleUrl: './areas-interconsulta.css'
// })
// export class AreasInterconsultaComponent {

// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AreasInterconsultaService } from '../../services/catalogos/areas-interconsulta';
import { AreaInterconsulta, CreateAreaInterconsultaDto } from '../../models/area-interconsulta.model';

@Component({
  selector: 'app-areas-interconsulta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './areas-interconsulta.html',
  styleUrl: './areas-interconsulta.css'
})
export class AreasInterconsultaComponent implements OnInit {

  areasInterconsultaForm: FormGroup;
  areasInterconsulta: AreaInterconsulta[] = [];
  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  editingId: number | null = null;
  showStatistics = false;
  estadisticas: any = null;

  constructor(
    private fb: FormBuilder,
    private areasInterconsultaService: AreasInterconsultaService
  ) {
    this.areasInterconsultaForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadAreasInterconsulta();
    this.loadEstadisticas();
  }

  createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      activo: [true]
    });
  }

  async loadAreasInterconsulta(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.areasInterconsultaService.getAll();
      this.areasInterconsulta = response.data || [];
    } catch (error: any) {
      this.error = 'Error al cargar las áreas de interconsulta';
      console.error('Error loading areas interconsulta:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadEstadisticas(): Promise<void> {
    try {
      const response = await this.areasInterconsultaService.getEstadisticas();
      this.estadisticas = response.data || null;
    } catch (error: any) {
      console.error('Error loading estadisticas:', error);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.areasInterconsultaForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.success = null;

    try {
      const formData = this.areasInterconsultaForm.value as CreateAreaInterconsultaDto;

      if (this.editingId) {
        await this.areasInterconsultaService.update(this.editingId, formData);
        this.success = 'Área de interconsulta actualizada correctamente';
      } else {
        await this.areasInterconsultaService.create(formData);
        this.success = 'Área de interconsulta creada correctamente';
      }

      this.resetForm();
      await this.loadAreasInterconsulta();
      await this.loadEstadisticas();

    } catch (error: any) {
      this.error = error.error?.message || 'Error al guardar el área de interconsulta';
      console.error('Error saving area interconsulta:', error);
    } finally {
      this.isLoading = false;
    }
  }

  editAreaInterconsulta(area: AreaInterconsulta): void {
    this.editingId = area.id_area_interconsulta;
    this.areasInterconsultaForm.patchValue({
      nombre: area.nombre,
      descripcion: area.descripcion || '',
      activo: area.activo
    });
    this.clearMessages();
  }

  async deleteAreaInterconsulta(id: number): Promise<void> {
    if (!confirm('¿Está seguro de eliminar esta área de interconsulta?')) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      await this.areasInterconsultaService.delete(id);
      this.success = 'Área de interconsulta eliminada correctamente';
      await this.loadAreasInterconsulta();
      await this.loadEstadisticas();
    } catch (error: any) {
      this.error = error.error?.message || 'Error al eliminar el área de interconsulta';
      console.error('Error deleting area interconsulta:', error);
    } finally {
      this.isLoading = false;
    }
  }

  resetForm(): void {
    this.editingId = null;
    this.areasInterconsultaForm.reset({
      nombre: '',
      descripcion: '',
      activo: true
    });
    this.clearMessages();
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  toggleStatistics(): void {
    this.showStatistics = !this.showStatistics;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.areasInterconsultaForm.controls).forEach(key => {
      const control = this.areasInterconsultaForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.areasInterconsultaForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.areasInterconsultaForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  // Método para obtener detalles de un área específica
  async getAreaDetails(id: number): Promise<void> {
    try {
      const response = await this.areasInterconsultaService.getById(id);
      // Aquí puedes mostrar un modal o expandir información
      console.log('Detalles del área:', response.data);
    } catch (error: any) {
      this.error = 'Error al obtener detalles del área';
      console.error('Error getting area details:', error);
    }
  }

  // Formatear números grandes
  formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  // Obtener solo áreas activas
  async loadAreasActivas(): Promise<void> {
    try {
      const response = await this.areasInterconsultaService.getActivas();
      this.areasInterconsulta = response.data || [];
    } catch (error: any) {
      this.error = 'Error al cargar áreas activas';
      console.error('Error loading areas activas:', error);
    }
  }
}
