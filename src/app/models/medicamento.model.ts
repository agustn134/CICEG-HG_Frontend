import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface Medicamento extends BaseEntity, AuditInfo {
  id_medicamento: number;
  codigo?: string;
  nombre: string; // Cambié de nombre_generico a nombre para consistencia con BD
  presentacion?: string; // "Tableta", "Ampolleta", "Jarabe", etc.
  concentracion?: string; // "500 mg", "250 mg/5ml", etc.
  grupo_terapeutico?: string; // "Antibióticos", "Analgésicos", etc.
  activo: boolean;

  // Información adicional
  nombre_comercial?: string;
  laboratorio?: string;
  via_administracion?: string; // "Oral", "IV", "IM", etc.
  contraindicaciones?: string;
  efectos_secundarios?: string;
  dosis_pediatrica?: string;
  dosis_adulto?: string;

  // Estadísticas de uso
  total_prescripciones?: number;
  prescripciones_mes?: number;
}

export interface MedicamentoFilters extends BaseFilters {
  codigo?: string;
  grupo_terapeutico?: string;
  presentacion?: string;
  via_administracion?: string;
  nombre_comercial?: string;
}

export interface CreateMedicamentoDto {
  codigo?: string;
  nombre: string;
  presentacion?: string;
  concentracion?: string;
  grupo_terapeutico?: string;
  activo?: boolean;
  nombre_comercial?: string;
  laboratorio?: string;
  via_administracion?: string;
  contraindicaciones?: string;
  efectos_secundarios?: string;
  dosis_pediatrica?: string;
  dosis_adulto?: string;
}

export interface UpdateMedicamentoDto extends Partial<CreateMedicamentoDto> {
  id_medicamento: number;
}
