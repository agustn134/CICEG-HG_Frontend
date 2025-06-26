import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface GuiaClinica extends BaseEntity, AuditInfo {
  id_guia_diagnostico: number;
  area?: string;
  codigo?: string;
  nombre: string;
  fuente?: string; // "IMSS", "ISSSTE", "NOM", "Interno"
  fecha_actualizacion?: string;
  descripcion?: string;
  activo: boolean;
  version?: string;

  // Información adicional
  especialidad?: string;
  nivel_evidencia?: string;
  aplicable_pediatria?: boolean;
  aplicable_adultos?: boolean;
}

export interface GuiaClinicaFilters extends BaseFilters {
  area?: string;
  fuente?: string;
  codigo?: string;
  especialidad?: string;
  aplicable_pediatria?: boolean;
  aplicable_adultos?: boolean;
}

export interface CreateGuiaClinicaDto {
  area?: string;
  codigo?: string;
  nombre: string;
  fuente?: string;
  fecha_actualizacion?: string;
  descripcion?: string;
  activo?: boolean;
  version?: string;
  especialidad?: string;
  nivel_evidencia?: string;
  aplicable_pediatria?: boolean;
  aplicable_adultos?: boolean;
}

export interface UpdateGuiaClinicaDto extends Partial<CreateGuiaClinicaDto> {
  id_guia_diagnostico: number;
}
