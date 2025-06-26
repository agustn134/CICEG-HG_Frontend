import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface RegistroTransfusion extends BaseEntity, AuditInfo {
  id_registro_transfusion: number;
  id_documento: number;
  tipo_componente: string; // "Sangre Total", "Concentrado Eritrocitario", "Plaquetas", etc.
  grupo_sanguineo: string; // "A+", "O-", etc.
  numero_unidad: string;
  volumen?: number; // En ml
  fecha_inicio: string; // Cambié de fecha_transfusion a fecha_inicio
  fecha_fin?: string;
  hora_inicio?: string;
  hora_fin?: string;
  velocidad_infusion?: string;
  id_medico_responsable?: number;
  reacciones_adversas?: string;
  signos_vitales_pre?: string;
  signos_vitales_post?: string;
  observaciones?: string;

  // Información adicional del documento
  fecha_documento?: string;
  nombre_paciente?: string;
  numero_expediente?: string;
  tipo_sangre_paciente?: string;
  medico_responsable?: string;
  banco_sangre?: string;
}

export interface RegistroTransfusionFilters extends BaseFilters {
  tipo_componente?: string;
  grupo_sanguineo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  con_reacciones?: boolean;
  medico_responsable?: number;
  numero_unidad?: string;
}

export interface CreateRegistroTransfusionDto {
  id_documento: number;
  tipo_componente: string;
  grupo_sanguineo: string;
  numero_unidad: string;
  volumen?: number;
  fecha_inicio?: string; // Si no se proporciona, usa fecha actual
  fecha_fin?: string;
  hora_inicio?: string;
  hora_fin?: string;
  velocidad_infusion?: string;
  id_medico_responsable?: number;
  reacciones_adversas?: string;
  signos_vitales_pre?: string;
  signos_vitales_post?: string;
  observaciones?: string;
  banco_sangre?: string;
}

export interface UpdateRegistroTransfusionDto extends Partial<CreateRegistroTransfusionDto> {
  id_registro_transfusion: number;
}
