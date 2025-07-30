import { BaseEntity, AuditInfo, BaseFilters, EstadoCama } from './base.models';

export interface Cama extends BaseEntity, AuditInfo {
  id_cama: number;
  id_servicio: number;
  numero: string; // Cambié de numero_cama a numero para consistencia con BD
  estado: EstadoCama; // Cambié disponible por estado más específico
  observaciones?: string;
  area: string; // Agregar
  subarea?: string; // Agregar

  // Información del servicio
  nombre_servicio?: string;

  // Información del paciente actual (si está ocupada)
  paciente_actual?: {
    nombre_completo: string;
    numero_expediente: string;
    fecha_ingreso: string;
  };
}

export interface CamaFilters extends BaseFilters {
  id_servicio?: number;
  estado?: EstadoCama;
  numero?: string;
  solo_disponibles?: boolean;
}

export interface CreateCamaDto {
  id_servicio: number;
  numero: string;
  estado?: EstadoCama;
  observaciones?: string;
  area?: string; // Agregar
  subarea?: string; // Agregar
}

export interface UpdateCamaDto extends Partial<CreateCamaDto> {
  id_cama: number;
}
