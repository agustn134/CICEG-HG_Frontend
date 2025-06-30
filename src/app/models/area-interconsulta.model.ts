import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface AreaInterconsulta extends BaseEntity, AuditInfo {
  id_area_interconsulta: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;

  // Estadísticas adicionales
  total_interconsultas?: number;
  interconsultas_pendientes?: number;
  tiempo_promedio_respuesta?: number;
  interconsultas_mes?: number; // Esta propiedad faltaba
  interconsultas_semana?: number; // Agregamos también esta que usa el backend
  interconsultas_ano?: number; // Y esta para estadísticas anuales
}

export interface AreaInterconsultaFilters extends BaseFilters {
  nombre?: string;
  con_interconsultas_pendientes?: boolean;
}

export interface CreateAreaInterconsultaDto {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdateAreaInterconsultaDto extends Partial<CreateAreaInterconsultaDto> {
  id_area_interconsulta: number;
}
