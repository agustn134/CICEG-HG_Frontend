import { BaseEntity, AuditInfo, BaseFilters, EstadoDocumento } from './base.models';

export interface DocumentoClinico extends BaseEntity, AuditInfo {
  id_documento: number;
  id_expediente: number; // Agregué este campo que faltaba
  id_internamiento?: number;
  id_tipo_documento: number;
  fecha_elaboracion: string; // Cambié de Date a string para consistencia
  id_personal_creador?: number;
  estado: EstadoDocumento; // Uso el enum de base.models
  observaciones?: string;

  // Información adicional del tipo de documento
  nombre_tipo_documento?: string;

  // Información del paciente
  nombre_paciente?: string;
  numero_expediente?: string;

  // Información del médico
  medico_responsable?: {
    nombre_completo: string;
    cedula?: string;
    especialidad?: string;
  };

  // Información del internamiento
  servicio?: string;
  cama?: string;
}

export interface DocumentoClinicoFilters extends BaseFilters {
  id_expediente?: number;
  id_internamiento?: number;
  id_tipo_documento?: number;
  estado?: EstadoDocumento;
  fecha_inicio?: string;
  fecha_fin?: string;
  id_personal_creador?: number;
}

export interface CreateDocumentoClinicoDto {
  id_expediente: number;
  id_internamiento?: number;
  id_tipo_documento: number;
  fecha_elaboracion?: string;
  id_personal_creador?: number;
  estado?: EstadoDocumento;
  observaciones?: string;
}

export interface UpdateDocumentoClinicoDto extends Partial<CreateDocumentoClinicoDto> {
  id_documento: number;
}
