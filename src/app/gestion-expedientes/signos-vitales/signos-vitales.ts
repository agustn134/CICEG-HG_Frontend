import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  SignosVitales,
  CreateSignosVitalesDto,
  SignosVitalesFilters,
  UltimosSignosVitales,
  ValidacionSignosVitales,
  TipoSignoVital
} from '../../models/signos-vitales.model';
import { SignosVitalesService } from '../../services/gestion-expedientes/signos-vitales';

@Component({
  selector: 'app-signos-vitales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signos-vitales.html',
  styleUrl: './signos-vitales.css'
})
export class SignosVitalesComponent implements OnInit {

  signosVitalesForm: FormGroup;
  signosVitales: SignosVitales[] = [];
  filtrosForm: FormGroup;

  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  editingId: number | null = null;

  // Estados de la interfaz
  showFilters = false;
  showValidation = false;
  currentValidation: ValidacionSignosVitales | null = null;

  // Datos para el contexto del paciente
  expedienteSeleccionado: number | null = null;
  internamiento: number | null = null;
  medicoActual: number | null = null;
  edadPaciente: number = 25; // Por defecto adulto

   // ✅ Inicializar como arrays vacíos
  tiposSignosVitales: { value: TipoSignoVital; label: string; }[] = [];
  periodosGraficas: { value: number; label: string; }[] = [];



  constructor(
  private fb: FormBuilder,
  private signosVitalesService: SignosVitalesService
) {
  this.signosVitalesForm = this.createMainForm();
  this.filtrosForm = this.createFiltersForm();

  // ✅ Ahora el servicio ya está disponible
  this.tiposSignosVitales = this.signosVitalesService.getTiposSignosVitales();
  this.periodosGraficas = this.signosVitalesService.getPeriodosGraficas();
}

  ngOnInit(): void {
    this.initializeComponent();
  }

  initializeComponent(): void {
    // Aquí podrías cargar el expediente desde route params o servicio
    // Por ahora usamos valores de ejemplo
    this.expedienteSeleccionado = 1; // Ejemplo
    this.medicoActual = 1; // Ejemplo
    this.loadSignosVitales();
  }

  createMainForm(): FormGroup {
    return this.fb.group({
      // Campos obligatorios
      id_expediente: [null, Validators.required],
      id_medico_registra: [null, Validators.required],

      // Fecha y hora (opcional, por defecto ahora)
      fecha_toma: [new Date().toISOString().slice(0, 16)],

      // Signos vitales (todos opcionales pero al menos uno requerido)
      temperatura: [null, [Validators.min(30), Validators.max(45)]],
      presion_arterial_sistolica: [null, [Validators.min(50), Validators.max(300)]],
      presion_arterial_diastolica: [null, [Validators.min(30), Validators.max(200)]],
      frecuencia_cardiaca: [null, [Validators.min(30), Validators.max(250)]],
      frecuencia_respiratoria: [null, [Validators.min(8), Validators.max(60)]],
      saturacion_oxigeno: [null, [Validators.min(50), Validators.max(100)]],
      glucosa: [null, [Validators.min(20), Validators.max(500)]],
      peso: [null, [Validators.min(0.5), Validators.max(300)]],
      talla: [null, [Validators.min(30), Validators.max(250)]],

      // Observaciones
      observaciones: ['']
    });
  }

  createFiltersForm(): FormGroup {
    return this.fb.group({
      fecha_inicio: [''],
      fecha_fin: [''],
      incluir_anormales: [false],
      tipo_signo: ['todos'],
      limit: [10],
      offset: [0]
    });
  }

  async loadSignosVitales(): Promise<void> {
    if (!this.expedienteSeleccionado) return;

    this.isLoading = true;
    this.error = null;

    try {
      const filters: SignosVitalesFilters = {
        id_expediente: this.expedienteSeleccionado,
        ...this.filtrosForm.value
      };

      this.signosVitalesService.getSignosVitales(filters).subscribe({
        next: (response) => {
          this.signosVitales = response.data || [];
        },
        error: (error) => {
          this.error = 'Error al cargar los signos vitales';
          console.error('Error loading signos vitales:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } catch (error: any) {
      this.error = 'Error al cargar los signos vitales';
      console.error('Error loading signos vitales:', error);
      this.isLoading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.expedienteSeleccionado || !this.medicoActual) {
      this.error = 'Falta información del expediente o médico';
      return;
    }

    // Validar antes de enviar
    const formData = {
      ...this.signosVitalesForm.value,
      id_expediente: this.expedienteSeleccionado,
      id_medico_registra: this.medicoActual,
      id_internamiento: this.internamiento
    } as CreateSignosVitalesDto;

    const validation = this.signosVitalesService.validarDatosSignosVitales(formData, this.edadPaciente);

    if (!validation.valido) {
      this.currentValidation = validation;
      this.showValidation = true;
      return;
    }

    if (validation.valores_anormales.length > 0) {
      this.currentValidation = validation;
      this.showValidation = true;
      // El usuario puede decidir continuar o cancelar
      return;
    }

    await this.saveSignosVitales(formData);
  }

  async saveSignosVitales(formData: CreateSignosVitalesDto): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.success = null;

    try {
      if (this.editingId) {
        this.signosVitalesService.updateSignosVitales(this.editingId, formData).subscribe({
          next: () => {
            this.success = 'Signos vitales actualizados correctamente';
            this.resetForm();
            this.loadSignosVitales();
          },
          error: (error) => {
            this.error = error.error?.message || 'Error al actualizar signos vitales';
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } else {
        this.signosVitalesService.createSignosVitales(formData).subscribe({
          next: () => {
            this.success = 'Signos vitales registrados correctamente';
            this.resetForm();
            this.loadSignosVitales();
          },
          error: (error) => {
            this.error = error.error?.message || 'Error al registrar signos vitales';
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    } catch (error: any) {
      this.error = error.error?.message || 'Error al guardar signos vitales';
      console.error('Error saving signos vitales:', error);
      this.isLoading = false;
    }
  }

  editSignosVitales(signos: SignosVitales): void {
    this.editingId = signos.id_signos_vitales;

    // Convertir fecha para el input datetime-local
    const fechaFormateada = new Date(signos.fecha_toma).toISOString().slice(0, 16);

    this.signosVitalesForm.patchValue({
      fecha_toma: fechaFormateada,
      temperatura: signos.temperatura,
      presion_arterial_sistolica: signos.presion_arterial_sistolica,
      presion_arterial_diastolica: signos.presion_arterial_diastolica,
      frecuencia_cardiaca: signos.frecuencia_cardiaca,
      frecuencia_respiratoria: signos.frecuencia_respiratoria,
      saturacion_oxigeno: signos.saturacion_oxigeno,
      glucosa: signos.glucosa,
      peso: signos.peso,
      talla: signos.talla,
      observaciones: signos.observaciones || ''
    });
    this.clearMessages();
  }

  async deleteSignosVitales(id: number): Promise<void> {
    if (!confirm('¿Está seguro de eliminar este registro de signos vitales?')) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      this.signosVitalesService.deleteSignosVitales(id, {
        id_medico_elimina: this.medicoActual || undefined,
        motivo_eliminacion: 'Eliminación solicitada por el usuario'
      }).subscribe({
        next: () => {
          this.success = 'Signos vitales eliminados correctamente';
          this.loadSignosVitales();
        },
        error: (error) => {
          this.error = error.error?.message || 'Error al eliminar signos vitales';
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } catch (error: any) {
      this.error = error.error?.message || 'Error al eliminar signos vitales';
      console.error('Error deleting signos vitales:', error);
      this.isLoading = false;
    }
  }

  resetForm(): void {
    this.editingId = null;
    this.signosVitalesForm.reset({
      fecha_toma: new Date().toISOString().slice(0, 16),
      observaciones: ''
    });
    this.clearMessages();
    this.hideValidation();
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  hideValidation(): void {
    this.showValidation = false;
    this.currentValidation = null;
  }

  async confirmSaveWithWarnings(): Promise<void> {
    this.hideValidation();

    const formData = {
      ...this.signosVitalesForm.value,
      id_expediente: this.expedienteSeleccionado,
      id_medico_registra: this.medicoActual,
      id_internamiento: this.internamiento
    } as CreateSignosVitalesDto;

    await this.saveSignosVitales(formData);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  async applyFilters(): Promise<void> {
    await this.loadSignosVitales();
  }

  clearFilters(): void {
    this.filtrosForm.reset({
      fecha_inicio: '',
      fecha_fin: '',
      incluir_anormales: false,
      tipo_signo: 'todos',
      limit: 10,
      offset: 0
    });
    this.loadSignosVitales();
  }

  // Métodos de utilidad para el template
  formatearValor(valor: number | undefined, parametro: string): string {
    return this.signosVitalesService.formatearValorConUnidad(valor, parametro);
  }

  formatearFecha(fecha: string): string {
    return this.signosVitalesService.formatearFecha(fecha);
  }

  formatearPresion(sistolica?: number, diastolica?: number): string {
    return this.signosVitalesService.formatearPresionArterial(sistolica, diastolica);
  }

  getColorValor(valor: number, parametro: string): string {
    return this.signosVitalesService.getColorValor(valor, parametro, this.edadPaciente);
  }

  esValorNormal(valor: number, parametro: string): boolean {
    return this.signosVitalesService.esValorNormal(valor, parametro, this.edadPaciente);
  }

  calcularIMC(): number | null {
    const peso = this.signosVitalesForm.get('peso')?.value;
    const talla = this.signosVitalesForm.get('talla')?.value;

    if (peso && talla) {
      return this.signosVitalesService.calcularIMC(peso, talla);
    }
    return null;
  }

  interpretarIMC(): string {
    const imc = this.calcularIMC();
    if (imc) {
      return this.signosVitalesService.interpretarIMC(imc);
    }
    return '';
  }

  // Validaciones en tiempo real
  getFieldError(fieldName: string): string | null {
    const field = this.signosVitalesForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signosVitalesForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signosVitalesForm.controls).forEach(key => {
      const control = this.signosVitalesForm.get(key);
      control?.markAsTouched();
    });
  }

  // Verificar si hay al menos un signo vital
  hasAtLeastOneVitalSign(): boolean {
    const form = this.signosVitalesForm.value;
    return !!(
      form.temperatura ||
      form.presion_arterial_sistolica ||
      form.presion_arterial_diastolica ||
      form.frecuencia_cardiaca ||
      form.frecuencia_respiratoria ||
      form.saturacion_oxigeno ||
      form.glucosa ||
      form.peso ||
      form.talla
    );
  }

  // Obtener últimos signos vitales para referencia
  async loadUltimosSignosVitales(): Promise<void> {
    if (!this.expedienteSeleccionado) return;

    try {
      this.signosVitalesService.getUltimosSignosVitalesPaciente(this.expedienteSeleccionado, 3).subscribe({
        next: (response) => {
          // Aquí podrías mostrar los últimos registros como referencia
          console.log('Últimos signos vitales:', response.data);
        },
        error: (error) => {
          console.error('Error loading últimos signos vitales:', error);
        }
      });
    } catch (error) {
      console.error('Error loading últimos signos vitales:', error);
    }
  }

  // Exportar datos a CSV
  exportarCSV(): void {
    if (this.signosVitales.length === 0) {
      this.error = 'No hay datos para exportar';
      return;
    }

    const csv = this.signosVitalesService.exportarCSV(this.signosVitales);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `signos-vitales-expediente-${this.expedienteSeleccionado}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
