import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface Internamiento extends BaseEntity, AuditInfo {
  id_internamiento: number;
  id_expediente: number;
  id_cama?: number; // Puede ser null para consulta externa
  id_servicio: number;
  fecha_ingreso: string; // Cambié de Date a string
  fecha_egreso?: string;
  motivo_ingreso: string;
  diagnostico_ingreso: string;
  diagnostico_egreso?: string;
  estado_actual: 'Hospitalizado' | 'Egresado' | 'Transferido' | 'Defunción';
  tipo_egreso?: 'Alta voluntaria' | 'Mejoría' | 'Referencia' | 'Defunción' | 'Máximo beneficio';
  id_medico_responsable?: number;
  observaciones?: string;

  // Información adicional
  numero_expediente?: string;
  nombre_paciente?: string;
  nombre_servicio?: string;
  numero_cama?: string;
  medico_responsable?: string;
  dias_estancia?: number;
}

export interface InternamientoFilters extends BaseFilters {
  id_expediente?: number;
  id_servicio?: number;
  estado_actual?: string;
  fecha_ingreso_inicio?: string;
  fecha_ingreso_fin?: string;
  solo_activos?: boolean;
  id_medico_responsable?: number;
}

export interface CreateInternamientoDto {
  id_expediente: number;
  id_cama?: number;
  id_servicio: number;
  fecha_ingreso?: string;
  motivo_ingreso: string;
  diagnostico_ingreso: string;
  estado_actual?: string;
  id_medico_responsable?: number;
  observaciones?: string;
}

export interface UpdateInternamientoDto extends Partial<CreateInternamientoDto> {
  id_internamiento: number;
  fecha_egreso?: string;
  diagnostico_egreso?: string;
  tipo_egreso?: string;
}
