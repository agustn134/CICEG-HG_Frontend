import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface Expediente extends BaseEntity, AuditInfo {
  id_expediente: number;
  id_paciente: number;
  numero_expediente: string;
  fecha_apertura: string; // Cambié de Date a string
  estado: 'Activo' | 'Cerrado' | 'Transferido';
  observaciones?: string;

  // Información del paciente
  paciente?: {
    nombre_completo: string;
    fecha_nacimiento: string;
    genero: string;
    numero_seguro_social?: string;
  };

  // Estadísticas del expediente
  total_documentos?: number;
  total_internamientos?: number;
  ultimo_internamiento?: string;
  documentos_recientes?: {
    tipo: string;
    fecha: string;
    medico: string;
  }[];
}

export interface ExpedienteFilters extends BaseFilters {
  numero_expediente?: string;
  id_paciente?: number;
  estado?: string;
  fecha_apertura_inicio?: string;
  fecha_apertura_fin?: string;
}

export interface CreateExpedienteDto {
  id_paciente: number;
  numero_expediente?: string; // Se puede generar automáticamente
  fecha_apertura?: string;
  estado?: string;
  observaciones?: string;
}

export interface UpdateExpedienteDto extends Partial<CreateExpedienteDto> {
  id_expediente: number;
}
