import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface NotaUrgencias extends BaseEntity, AuditInfo {
  id_nota_urgencias: number;
  id_documento: number;
  motivo_atencion: string;
  estado_conciencia?: string;
  resumen_interrogatorio?: string;
  exploracion_fisica?: string;
  signos_vitales?: string;
  glasgow?: number;
  triage_categoria?: 'Resucitación' | 'Emergencia' | 'Urgencia' | 'Menos Urgente' | 'No Urgente';
  tiempo_atencion_minutos?: number;
  procedimientos_realizados?: string;
  diagnostico_urgencias?: string;
  disposicion_paciente?: 'Alta' | 'Hospitalización' | 'Referencia' | 'Observación' | 'Defunción';
  interconsultas_solicitadas?: string;
  observaciones?: string;

  // Información adicional del documento
  fecha_documento?: string;
  hora_ingreso?: string;
  hora_egreso?: string;
  nombre_paciente?: string;
  numero_expediente?: string;
  medico_urgencias?: string;
}

export interface NotaUrgenciasFilters extends BaseFilters {
  triage_categoria?: string;
  disposicion_paciente?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  glasgow_min?: number;
  glasgow_max?: number;
  tiempo_atencion_min?: number;
  tiempo_atencion_max?: number;
}

export interface CreateNotaUrgenciasDto {
  id_documento: number;
  motivo_atencion: string;
  estado_conciencia?: string;
  resumen_interrogatorio?: string;
  exploracion_fisica?: string;
  signos_vitales?: string;
  glasgow?: number;
  triage_categoria?: string;
  tiempo_atencion_minutos?: number;
  procedimientos_realizados?: string;
  diagnostico_urgencias?: string;
  disposicion_paciente?: string;
  interconsultas_solicitadas?: string;
  observaciones?: string;
  hora_ingreso?: string;
  hora_egreso?: string;
}

export interface UpdateNotaUrgenciasDto extends Partial<CreateNotaUrgenciasDto> {
  id_nota_urgencias: number;
}
