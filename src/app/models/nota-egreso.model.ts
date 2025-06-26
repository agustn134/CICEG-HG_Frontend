import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface NotaEgreso extends BaseEntity, AuditInfo {
  id_nota_egreso: number;
  id_documento: number;
  diagnostico_egreso: string;
  motivo_egreso: MotivoEgresoEnum;
  problemas_pendientes?: string;
  plan_tratamiento?: string;
  recomendaciones_vigilancia?: string;
  atencion_factores_riesgo?: string;
  pronostico?: string;
  reingreso_por_misma_afeccion?: boolean;
  fecha_egreso?: string;
  hora_egreso?: string;
  condiciones_egreso?: string;
  cita_seguimiento?: string;
  medicamentos_egreso?: string;

  // Información adicional del documento
  fecha_documento?: string;
  nombre_paciente?: string;
  numero_expediente?: string;
  dias_hospitalizacion?: number;
  servicio?: string;
  medico_responsable?: string;
}

export enum MotivoEgresoEnum {
  MEJORIA = 'Mejoría',
  MAXIMO_BENEFICIO = 'Máximo beneficio',
  VOLUNTARIO = 'Voluntario',
  DEFUNCION = 'Defunción',
  REFERENCIA = 'Referencia',
  FUGA = 'Fuga'
}

export interface NotaEgresoFilters extends BaseFilters {
  motivo_egreso?: MotivoEgresoEnum;
  fecha_egreso_inicio?: string;
  fecha_egreso_fin?: string;
  con_reingreso?: boolean;
  servicio?: string;
  dias_hospitalizacion_min?: number;
  dias_hospitalizacion_max?: number;
}

export interface CreateNotaEgresoDto {
  id_documento: number;
  diagnostico_egreso: string;
  motivo_egreso: MotivoEgresoEnum;
  problemas_pendientes?: string;
  plan_tratamiento?: string;
  recomendaciones_vigilancia?: string;
  atencion_factores_riesgo?: string;
  pronostico?: string;
  reingreso_por_misma_afeccion?: boolean;
  fecha_egreso?: string;
  hora_egreso?: string;
  condiciones_egreso?: string;
  cita_seguimiento?: string;
  medicamentos_egreso?: string;
}

export interface UpdateNotaEgresoDto extends Partial<CreateNotaEgresoDto> {
  id_nota_egreso: number;
}
