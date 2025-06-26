import { BaseEntity, AuditInfo, BaseFilters, EstadoCama } from './base.models';

export interface Cama extends BaseEntity, AuditInfo {
  id_cama: number;
  id_servicio: number;
  numero: string; // Cambié de numero_cama a numero para consistencia con BD
  estado: EstadoCama; // Cambié disponible por estado más específico
  observaciones?: string;

  // Información del servicio
  nombre_servicio?: string;

  // Información del paciente actual (si está ocupada)
  paciente_actual?: {
    nombre_completo: string;
    numero_expediente: string;
    fecha_ingreso: string;
  };
}
