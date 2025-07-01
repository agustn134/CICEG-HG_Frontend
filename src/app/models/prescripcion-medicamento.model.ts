import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface PrescripcionMedicamento extends BaseEntity, AuditInfo {
  id_prescripcion: number;
  id_documento: number;
  id_medicamento: number;
  dosis: string;
  via_administracion?: string; // "Oral", "IV", "IM", "Tópica", etc.
  frecuencia: string; // "Cada 8 horas", "Cada 12 horas", "PRN", etc.
  duracion: string; // "7 días", "10 días", "Hasta nuevo aviso"
  cantidad_total?: string;
  indicaciones_especiales?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  activo: boolean;

  // Información del medicamento
  nombre_medicamento?: string;
  presentacion_medicamento?: string;
  concentracion_medicamento?: string;

  // Información adicional del documento
  fecha_documento?: string;
  nombre_paciente?: string;
  numero_expediente?: string;
  medico_prescriptor?: string;
}

export interface PrescripcionMedicamentoFilters extends BaseFilters {
  id_documento?: number;
  id_expediente?: number;
  id_medicamento?: number;
  via_administracion?: string;
  activo?: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  medico_prescriptor?: number;
  nombre_medicamento?: string;
  buscar?: string;
}

export interface CreatePrescripcionMedicamentoDto {
  id_documento: number;
  id_medicamento: number;
  dosis: string;
  via_administracion?: string;
  frecuencia: string;
  duracion: string;
  cantidad_total?: string;
  indicaciones_especiales?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  activo?: boolean;
}

export interface UpdatePrescripcionMedicamentoDto extends Partial<CreatePrescripcionMedicamentoDto> {
  id_prescripcion: number;
}
