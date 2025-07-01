import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EstudiosMedicosService } from '../../services/catalogos/estudios-medicos';
import { EstudioMedico, CreateEstudioMedicoDto, TipoEstudio, TIPOS_ESTUDIO } from '../../models/estudio-medico.model';

@Component({
  selector: 'app-estudios-medicos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './estudios-medicos.html',
  styleUrl: './estudios-medicos.css'
})
    export class EstudiosMedicosComponent implements OnInit {

  estudiosForm: FormGroup;
  estudios: EstudioMedico[] = [];
  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  editingId: number | null = null;

  // Opciones para el formulario
  tiposEstudio = Object.entries(TIPOS_ESTUDIO).map(([key, value]) => ({
    value: key as TipoEstudio,
    label: value
  }));

  constructor(
    private fb: FormBuilder,
    private estudiosService: EstudiosMedicosService
  ) {
    this.estudiosForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadEstudios();
  }

  createForm(): FormGroup {
    return this.fb.group({
      clave: ['', [Validators.required, Validators.minLength(3)]],
      nombre: ['', [Validators.required, Validators.minLength(5)]],
      tipo: ['', Validators.required],
      descripcion: [''],
      requiere_ayuno: [false],
      tiempo_resultado: [24, [Validators.required, Validators.min(1)]],
      costo: [0, [Validators.min(0)]],
      observaciones: [''],
      preparacion_paciente: [''],
      contraindicaciones: [''],
      activo: [true]
    });
  }

  async loadEstudios(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.estudiosService.getAll();
      this.estudios = response.data || [];
    } catch (error: any) {
      this.error = 'Error al cargar los estudios médicos';
      console.error('Error loading estudios:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.estudiosForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.success = null;

    try {
      const formData = this.estudiosForm.value as CreateEstudioMedicoDto;

      if (this.editingId) {
        await this.estudiosService.update(this.editingId, formData);
        this.success = 'Estudio médico actualizado correctamente';
      } else {
        await this.estudiosService.create(formData);
        this.success = 'Estudio médico creado correctamente';
      }

      this.resetForm();
      await this.loadEstudios();

    } catch (error: any) {
      this.error = error.error?.message || 'Error al guardar el estudio médico';
      console.error('Error saving estudio:', error);
    } finally {
      this.isLoading = false;
    }
  }

  editEstudio(estudio: EstudioMedico): void {
    this.editingId = estudio.id_estudio;
    this.estudiosForm.patchValue({
      clave: estudio.clave,
      nombre: estudio.nombre,
      tipo: estudio.tipo,
      descripcion: estudio.descripcion || '',
      requiere_ayuno: estudio.requiere_ayuno,
      tiempo_resultado: estudio.tiempo_resultado,
      costo: estudio.costo || 0,
      observaciones: estudio.observaciones || '',
      preparacion_paciente: estudio.preparacion_paciente || '',
      contraindicaciones: estudio.contraindicaciones || '',
      activo: estudio.activo
    });
    this.clearMessages();
  }

  async deleteEstudio(id: number): Promise<void> {
    if (!confirm('¿Está seguro de eliminar este estudio médico?')) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      await this.estudiosService.delete(id);
      this.success = 'Estudio médico eliminado correctamente';
      await this.loadEstudios();
    } catch (error: any) {
      this.error = error.error?.message || 'Error al eliminar el estudio médico';
      console.error('Error deleting estudio:', error);
    } finally {
      this.isLoading = false;
    }
  }

  resetForm(): void {
    this.editingId = null;
    this.estudiosForm.reset({
      clave: '',
      nombre: '',
      tipo: '',
      descripcion: '',
      requiere_ayuno: false,
      tiempo_resultado: 24,
      costo: 0,
      observaciones: '',
      preparacion_paciente: '',
      contraindicaciones: '',
      activo: true
    });
    this.clearMessages();
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.estudiosForm.controls).forEach(key => {
      const control = this.estudiosForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.estudiosForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `${fieldName} debe ser mayor a ${field.errors['min'].min}`;
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.estudiosForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }
}
