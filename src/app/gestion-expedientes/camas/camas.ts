import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CamasService } from '../../services/gestion-expedientes/camas';
import { Cama, CreateCamaDto, CamaFilters } from '../../models/cama.model';
import { EstadoCama } from '../../models/base.models';

@Component({
  selector: 'app-camas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './camas.html',
  styleUrl: './camas.css'
})
export class CamasComponent implements OnInit {

  camasForm: FormGroup;
  filtrosForm: FormGroup;
  camas: Cama[] = [];

  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  editingId: number | null = null;

  // Estados de la interfaz
  showFilters = false;
  showEstadisticas = false;
  estadisticasCamas: any = null;

  // Opciones para formularios
  estadosCama: { value: EstadoCama; label: string; color: string }[] = [];
  estadosCamaEnum = EstadoCama; // Para usar en el template
  servicios: { id: number; nombre: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private camasService: CamasService
  ) {
    this.camasForm = this.createMainForm();
    this.filtrosForm = this.createFiltersForm();
    this.initializeEstadosCama();
  }

  ngOnInit(): void {
    this.loadCamas();
    this.loadServicios();
    this.loadEstadisticas();
  }

  createMainForm(): FormGroup {
    return this.fb.group({
      id_servicio: [null, Validators.required],
      numero: ['', [Validators.required, Validators.minLength(1)]],
      estado: [EstadoCama.DISPONIBLE, Validators.required],
      area: ['', Validators.required], // Agregado campo area
      subarea: [''], // Agregado campo subarea opcional
      observaciones: ['']
    });
  }

  createFiltersForm(): FormGroup {
    return this.fb.group({
      id_servicio: [null],
      estado: [null],
      numero: [''],
      solo_disponibles: [false]
    });
  }

  initializeEstadosCama(): void {
    this.estadosCama = [
      { value: EstadoCama.DISPONIBLE, label: 'Disponible', color: 'bg-green-100 text-green-800' },
      { value: EstadoCama.OCUPADA, label: 'Ocupada', color: 'bg-red-100 text-red-800' },
      { value: EstadoCama.MANTENIMIENTO, label: 'Mantenimiento', color: 'bg-yellow-100 text-yellow-800' },
      { value: EstadoCama.RESERVADA, label: 'Reservada', color: 'bg-blue-100 text-blue-800' },
      { value: EstadoCama.CONTAMINADA, label: 'Contaminada', color: 'bg-purple-100 text-purple-800' }
    ];
  }

  async loadCamas(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const filters: CamaFilters = this.filtrosForm.value;
      const response = await this.camasService.getAll(filters);
      this.camas = response.data || [];
    } catch (error: any) {
      this.error = 'Error al cargar las camas';
      console.error('Error loading camas:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadServicios(): Promise<void> {
    try {
      const response = await this.camasService.getServicios();
      this.servicios = response.data || [];
    } catch (error: any) {
      console.error('Error loading servicios:', error);
    }
  }

  async loadEstadisticas(): Promise<void> {
    try {
      const response = await this.camasService.getEstadisticas();
      this.estadisticasCamas = response.data || null;
    } catch (error: any) {
      console.error('Error loading estadisticas:', error);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.camasForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.success = null;

    try {
      const formData = this.camasForm.value as CreateCamaDto;

      if (this.editingId) {
        await this.camasService.update(this.editingId, formData);
        this.success = 'Cama actualizada correctamente';
      } else {
        await this.camasService.create(formData);
        this.success = 'Cama creada correctamente';
      }

      this.resetForm();
      await this.loadCamas();
      await this.loadEstadisticas();

    } catch (error: any) {
      this.error = error.error?.message || 'Error al guardar la cama';
      console.error('Error saving cama:', error);
    } finally {
      this.isLoading = false;
    }
  }

  editCama(cama: Cama): void {
    this.editingId = cama.id_cama;
    this.camasForm.patchValue({
      id_servicio: cama.id_servicio,
      numero: cama.numero,
      estado: cama.estado,
      area: cama.area || '',
      subarea: cama.subarea || '',
      observaciones: cama.observaciones || ''
    });
    this.clearMessages();
  }

  async deleteCama(id: number): Promise<void> {
    if (!confirm('¿Está seguro de eliminar esta cama?')) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      await this.camasService.delete(id);
      this.success = 'Cama eliminada correctamente';
      await this.loadCamas();
      await this.loadEstadisticas();
    } catch (error: any) {
      this.error = error.error?.message || 'Error al eliminar la cama';
      console.error('Error deleting cama:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async cambiarEstadoCama(id: number, nuevoEstado: EstadoCama): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await this.camasService.cambiarEstado(id, nuevoEstado);
      this.success = `Estado de cama cambiado a ${nuevoEstado}`;
      await this.loadCamas();
      await this.loadEstadisticas();
    } catch (error: any) {
      this.error = error.error?.message || 'Error al cambiar estado de la cama';
      console.error('Error changing cama estado:', error);
    } finally {
      this.isLoading = false;
    }
  }

  resetForm(): void {
    this.editingId = null;
    this.camasForm.reset({
      id_servicio: null,
      numero: '',
      estado: EstadoCama.DISPONIBLE,
      area: '',
      subarea: '',
      observaciones: ''
    });
    this.clearMessages();
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleEstadisticas(): void {
    this.showEstadisticas = !this.showEstadisticas;
  }

  async applyFilters(): Promise<void> {
    await this.loadCamas();
  }

  clearFilters(): void {
    this.filtrosForm.reset({
      id_servicio: null,
      estado: null,
      numero: '',
      solo_disponibles: false
    });
    this.loadCamas();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.camasForm.controls).forEach(key => {
      const control = this.camasForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.camasForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.camasForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  // Métodos de utilidad para el template
  getEstadoLabel(estado: EstadoCama): string {
    const estadoInfo = this.estadosCama.find(e => e.value === estado);
    return estadoInfo ? estadoInfo.label : estado;
  }

  getEstadoColor(estado: EstadoCama): string {
    const estadoInfo = this.estadosCama.find(e => e.value === estado);
    return estadoInfo ? estadoInfo.color : 'bg-gray-100 text-gray-800';
  }

  getServicioNombre(id: number): string {
    const servicio = this.servicios.find(s => s.id === id);
    return servicio ? servicio.nombre : 'Servicio no encontrado';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Filtrar camas por estado
  getCamasPorEstado(estado: EstadoCama): Cama[] {
    return this.camas.filter(cama => cama.estado === estado);
  }

  // Obtener porcentaje de ocupación
  getPorcentajeOcupacion(): number {
    if (this.camas.length === 0) return 0;
    const ocupadas = this.camas.filter(cama => cama.estado === EstadoCama.OCUPADA).length;
    return Math.round((ocupadas / this.camas.length) * 100);
  }

  // Buscar camas disponibles
  async buscarCamasDisponibles(idServicio?: number): Promise<void> {
    this.filtrosForm.patchValue({
      id_servicio: idServicio || null,
      estado: EstadoCama.DISPONIBLE,
      solo_disponibles: true
    });
    await this.applyFilters();
  }

  // Exportar reporte de camas
  exportarReporte(): void {
    if (this.camas.length === 0) {
      this.error = 'No hay datos para exportar';
      return;
    }

    const csv = this.generarCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-camas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private generarCSV(): string {
    const headers = ['Número', 'Servicio', 'Estado', 'Paciente Actual', 'Fecha Ingreso', 'Observaciones'];
    const rows = this.camas.map(cama => [
      cama.numero,
      this.getServicioNombre(cama.id_servicio),
      this.getEstadoLabel(cama.estado),
      cama.paciente_actual?.nombre_completo || 'N/A',
      cama.paciente_actual?.fecha_ingreso ? this.formatearFecha(cama.paciente_actual.fecha_ingreso) : 'N/A',
      cama.observaciones || ''
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  // Obtener camas críticas (mantenimiento o contaminadas)
  getCamasCriticas(): Cama[] {
    return this.camas.filter(cama =>
      cama.estado === EstadoCama.MANTENIMIENTO ||
      cama.estado === EstadoCama.CONTAMINADA
    );
  }

  // Validar disponibilidad antes de asignar
  async validarDisponibilidad(id: number): Promise<boolean> {
    try {
      const response = await this.camasService.validarDisponibilidad(id);
      return response.data?.disponible || false;
    } catch (error) {
      console.error('Error validating disponibilidad:', error);
      return false;
    }
  }
}
