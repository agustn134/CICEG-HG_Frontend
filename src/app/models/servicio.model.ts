import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface Servicio extends BaseEntity, AuditInfo {
  id_servicio: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;

  // Información adicional
  jefe_servicio?: string;
  ubicacion?: string;
  telefono_interno?: string;
  capacidad_camas?: number;
  tipo_servicio?: 'Hospitalización' | 'Consulta Externa' | 'Quirófano' | 'Urgencias' | 'Diagnóstico';

  // Estadísticas
  total_camas?: number;
  camas_ocupadas?: number;
  porcentaje_ocupacion?: number;
  personal_asignado?: number;
  consultas_mes?: number;
}

export interface ServicioFilters extends BaseFilters {
  nombre?: string;
  tipo_servicio?: string;
  con_camas_disponibles?: boolean;
  jefe_servicio?: string;
}

export interface CreateServicioDto {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  jefe_servicio?: string;
  ubicacion?: string;
  telefono_interno?: string;
  capacidad_camas?: number;
  tipo_servicio?: string;
}

export interface UpdateServicioDto extends Partial<CreateServicioDto> {
  id_servicio: number;
}
