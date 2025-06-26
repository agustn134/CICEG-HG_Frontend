import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface TipoDocumento extends BaseEntity, AuditInfo {
  id_tipo_documento: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;

  // Información adicional
  categoria?: 'Ingreso' | 'Evolución' | 'Egreso' | 'Procedimiento' | 'Consulta';
  requiere_firma_medico?: boolean;
  requiere_firma_paciente?: boolean;
  plantilla_disponible?: boolean;
  orden_impresion?: number;

  // Estadísticas
  total_documentos?: number;
  documentos_mes?: number;
  servicios_que_usan?: string[];
}

export interface TipoDocumentoFilters extends BaseFilters {
  nombre?: string;
  categoria?: string;
  requiere_firma_medico?: boolean;
  requiere_firma_paciente?: boolean;
}

export interface CreateTipoDocumentoDto {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  categoria?: string;
  requiere_firma_medico?: boolean;
  requiere_firma_paciente?: boolean;
  plantilla_disponible?: boolean;
  orden_impresion?: number;
}

export interface UpdateTipoDocumentoDto extends Partial<CreateTipoDocumentoDto> {
  id_tipo_documento: number;
}
