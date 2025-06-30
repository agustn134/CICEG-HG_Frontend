// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-medicamentos',
//   imports: [],
//   templateUrl: './medicamentos.html',
//   styleUrl: './medicamentos.css'
// })
// export class Medicamentos {

// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedicamentosService } from '../../services/catalogos/medicamentos';
import { Medicamento, CreateMedicamentoDto } from '../../models/medicamento.model';

@Component({
  selector: 'app-medicamentos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medicamentos.html',
  styleUrl: './medicamentos.css'
})
export class MedicamentosComponent implements OnInit {

  medicamentosForm: FormGroup;
  medicamentos: Medicamento[] = [];
  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  editingId: number | null = null;

  // Opciones para el formulario
  presentaciones = [
    'Tableta', 'Cápsula', 'Jarabe', 'Suspensión', 'Ampolleta',
    'Vial', 'Crema', 'Pomada', 'Gel', 'Solución', 'Gotas',
    'Spray', 'Inhalador', 'Supositorio', 'Óvulo', 'Parche'
  ];

  gruposTerapeuticos = [
    'Analgésicos', 'Antibióticos', 'Antiinflamatorios', 'Antihipertensivos',
    'Antidiabéticos', 'Broncodilatadores', 'Diuréticos', 'Antihistamínicos',
    'Antiácidos', 'Vitaminas', 'Hormonas', 'Anticoagulantes',
    'Anticonvulsivantes', 'Antidepresivos', 'Sedantes', 'Otros'
  ];

  viasAdministracion = [
    'Oral', 'Intravenosa (IV)', 'Intramuscular (IM)', 'Subcutánea (SC)',
    'Tópica', 'Oftálmica', 'Ótica', 'Nasal', 'Rectal', 'Vaginal',
    'Inhalatoria', 'Sublingual', 'Transdérmica'
  ];

  constructor(
    private fb: FormBuilder,
    private medicamentosService: MedicamentosService
  ) {
    this.medicamentosForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadMedicamentos();
  }

  createForm(): FormGroup {
    return this.fb.group({
      codigo: [''],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      nombre_comercial: [''],
      presentacion: [''],
      concentracion: [''],
      grupo_terapeutico: [''],
      laboratorio: [''],
      via_administracion: [''],
      dosis_adulto: [''],
      dosis_pediatrica: [''],
      contraindicaciones: [''],
      efectos_secundarios: [''],
      activo: [true]
    });
  }

  async loadMedicamentos(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.medicamentosService.getAll();
      this.medicamentos = response.data || [];
    } catch (error: any) {
      this.error = 'Error al cargar los medicamentos';
      console.error('Error loading medicamentos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.medicamentosForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.success = null;

    try {
      const formData = this.medicamentosForm.value as CreateMedicamentoDto;

      if (this.editingId) {
        await this.medicamentosService.update(this.editingId, formData);
        this.success = 'Medicamento actualizado correctamente';
      } else {
        await this.medicamentosService.create(formData);
        this.success = 'Medicamento creado correctamente';
      }

      this.resetForm();
      await this.loadMedicamentos();

    } catch (error: any) {
      this.error = error.error?.message || 'Error al guardar el medicamento';
      console.error('Error saving medicamento:', error);
    } finally {
      this.isLoading = false;
    }
  }

  editMedicamento(medicamento: Medicamento): void {
    this.editingId = medicamento.id_medicamento;
    this.medicamentosForm.patchValue({
      codigo: medicamento.codigo || '',
      nombre: medicamento.nombre,
      nombre_comercial: medicamento.nombre_comercial || '',
      presentacion: medicamento.presentacion || '',
      concentracion: medicamento.concentracion || '',
      grupo_terapeutico: medicamento.grupo_terapeutico || '',
      laboratorio: medicamento.laboratorio || '',
      via_administracion: medicamento.via_administracion || '',
      dosis_adulto: medicamento.dosis_adulto || '',
      dosis_pediatrica: medicamento.dosis_pediatrica || '',
      contraindicaciones: medicamento.contraindicaciones || '',
      efectos_secundarios: medicamento.efectos_secundarios || '',
      activo: medicamento.activo
    });
    this.clearMessages();
  }

  async deleteMedicamento(id: number): Promise<void> {
    if (!confirm('¿Está seguro de eliminar este medicamento?')) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      await this.medicamentosService.delete(id);
      this.success = 'Medicamento eliminado correctamente';
      await this.loadMedicamentos();
    } catch (error: any) {
      this.error = error.error?.message || 'Error al eliminar el medicamento';
      console.error('Error deleting medicamento:', error);
    } finally {
      this.isLoading = false;
    }
  }

  resetForm(): void {
    this.editingId = null;
    this.medicamentosForm.reset({
      codigo: '',
      nombre: '',
      nombre_comercial: '',
      presentacion: '',
      concentracion: '',
      grupo_terapeutico: '',
      laboratorio: '',
      via_administracion: '',
      dosis_adulto: '',
      dosis_pediatrica: '',
      contraindicaciones: '',
      efectos_secundarios: '',
      activo: true
    });
    this.clearMessages();
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.medicamentosForm.controls).forEach(key => {
      const control = this.medicamentosForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.medicamentosForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.medicamentosForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  // Método para filtrar medicamentos por grupo terapéutico
  async filterByGrupo(grupo: string): Promise<void> {
    if (!grupo) {
      await this.loadMedicamentos();
      return;
    }

    try {
      const response = await this.medicamentosService.getByGrupoTerapeutico(grupo);
      this.medicamentos = response.data || [];
    } catch (error: any) {
      this.error = 'Error al filtrar medicamentos';
      console.error('Error filtering medicamentos:', error);
    }
  }
}
