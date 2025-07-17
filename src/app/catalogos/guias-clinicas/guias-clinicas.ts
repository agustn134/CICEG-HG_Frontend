import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GuiasClinicasService } from '../../services/catalogos/guias-clinicas';
import { GuiaClinica, CreateGuiaClinicaDto } from '../../models/guia-clinica.model';

@Component({
  selector: 'app-guias-clinicas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './guias-clinicas.html',
  styleUrl: './guias-clinicas.css'
})
export class GuiasClinicasComponent implements OnInit {

  guiasClinicasForm: FormGroup;
  guiasClinicas: GuiaClinica[] = [];
  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  editingId: number | null = null;

  // Opciones para el formulario
  areas = [
    'Medicina Interna', 'Cirugía General', 'Pediatría', 'Ginecología',
    'Traumatología', 'Cardiología', 'Neumología', 'Neurología',
    'Psiquiatría', 'Dermatología', 'Oftalmología', 'Otorrinolaringología',
    'Urología', 'Oncología', 'Endocrinología', 'Gastroenterología',
    'Nefrología', 'Hematología', 'Infectología', 'Medicina de Urgencias'
  ];

  fuentes = [
    'IMSS', 'ISSSTE', 'SSA', 'NOM (Norma Oficial Mexicana)',
    'GPC (Guía de Práctica Clínica)', 'CENETEC', 'OMS',
    'Consenso Nacional', 'Sociedad Médica', 'Interno Hospital'
  ];

  especialidades = [
    'Medicina General', 'Medicina Familiar', 'Medicina Interna',
    'Cirugía General', 'Pediatría', 'Ginecología y Obstetricia',
    'Traumatología y Ortopedia', 'Cardiología', 'Neumología',
    'Neurología', 'Psiquiatría', 'Dermatología', 'Oftalmología',
    'Otorrinolaringología', 'Urología', 'Oncología', 'Endocrinología',
    'Gastroenterología', 'Nefrología', 'Hematología', 'Infectología',
    'Medicina de Urgencias', 'Anestesiología', 'Radiología',
    'Patología', 'Medicina Nuclear', 'Rehabilitación'
  ];

  nivelesEvidencia = [
    'Nivel I - Evidencia alta',
    'Nivel II - Evidencia moderada',
    'Nivel III - Evidencia baja',
    'Consenso de expertos',
    'Opinión de expertos',
    'No especificado'
  ];

  constructor(
    private fb: FormBuilder,
    private guiasClinicasService: GuiasClinicasService
  ) {
    this.guiasClinicasForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadGuiasClinicas();
  }

  createForm(): FormGroup {
    return this.fb.group({
      codigo: [''],
      nombre: ['', [Validators.required, Validators.minLength(5)]],
      area: [''],
      especialidad: [''],
      fuente: [''],
      version: [''],
      nivel_evidencia: [''],
      fecha_actualizacion: [''],
      descripcion: [''],
      aplicable_pediatria: [false],
      aplicable_adultos: [true],
      activo: [true]
    });
  }

  async loadGuiasClinicas(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.guiasClinicasService.getAll();
      this.guiasClinicas = response.data || [];
    } catch (error: any) {
      this.error = 'Error al cargar las guías clínicas';
      console.error('Error loading guias clinicas:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.guiasClinicasForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
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
      this.isLoading = false;
    }
  }

  editGuiaClinica(guia: GuiaClinica): void {
    this.editingId = guia.id_guia_diagnostico;

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
      especialidad: guia.especialidad || '',
      fuente: guia.fuente || '',
      version: guia.version || '',
      nivel_evidencia: guia.nivel_evidencia || '',
      fecha_actualizacion: fechaFormateada,
      descripcion: guia.descripcion || '',
      aplicable_pediatria: guia.aplicable_pediatria || false,
      aplicable_adultos: guia.aplicable_adultos || true,
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

  resetForm(): void {
    this.editingId = null;
    this.guiasClinicasForm.reset({
      codigo: '',
      nombre: '',
      area: '',
      especialidad: '',
      fuente: '',
      version: '',
      nivel_evidencia: '',
      fecha_actualizacion: '',
      descripcion: '',
      aplicable_pediatria: false,
      aplicable_adultos: true,
      activo: true
    });
    this.clearMessages();
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

  // // Método para filtrar guías por área
  // async filterByArea(area: string): Promise<void> {
  //   if (!area) {
  //     await this.loadGuiasClinicas();
  //     return;
  //   }

  //   try {
  //     const response = await this.guiasClinicasService.getByArea(area);
  //     this.guiasClinicas = response.data || [];
  //   } catch (error: any) {
  //     this.error = 'Error al filtrar guías clínicas';
  //     console.error('Error filtering guias clinicas:', error);
  //   }
  // }

  // // Método para filtrar guías por fuente
  // async filterByFuente(fuente: string): Promise<void> {
  //   if (!fuente) {
  //     await this.loadGuiasClinicas();
  //     return;
  //   }

  //   try {
  //     const response = await this.guiasClinicasService.getByFuente(fuente);
  //     this.guiasClinicas = response.data || [];
  //   } catch (error: any) {
  //     this.error = 'Error al filtrar guías clínicas';
  //     console.error('Error filtering guias clinicas by fuente:', error);
  //   }
  // }

  // // Formatear fecha para mostrar
  // formatDate(dateString: string): string {
  //   if (!dateString) return 'No especificada';
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('es-MX');
  // }
formatDate(dateString: string | undefined | null): string {
  if (!dateString) return 'No especificada';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX');
  } catch {
    return 'Fecha inválida';
  }
}

  async filterByArea(event: Event): Promise<void> {
  const target = event.target as HTMLSelectElement;
  const area = target.value;
  if (!area) {
    await this.loadGuiasClinicas();
    return;
  }

  try {
    const response = await this.guiasClinicasService.getByArea(area);
    this.guiasClinicas = response.data || [];
  } catch (error: any) {
    this.error = 'Error al filtrar guías clínicas';
    console.error('Error filtering guias clinicas:', error);
  }
}

async filterByFuente(event: Event): Promise<void> {
  const target = event.target as HTMLSelectElement;
  const fuente = target.value;
  if (!fuente) {
    await this.loadGuiasClinicas();
    return;
  }

  try {
    const response = await this.guiasClinicasService.getByFuente(fuente);
    this.guiasClinicas = response.data || [];
  } catch (error: any) {
    this.error = 'Error al filtrar guías clínicas';
    console.error('Error filtering guias clinicas by fuente:', error);
  }
}

}
