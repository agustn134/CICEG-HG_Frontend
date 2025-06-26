import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface ConsentimientoInformado extends BaseEntity, AuditInfo {
  id_consentimiento_informado: number;
  id_documento: number;
  tipo_consentimiento: string; // "Quirúrgico", "Anestésico", "Procedimiento", etc.
  procedimiento_autorizado: string;
  riesgos_explicados: string;
  alternativas_explicadas?: string;
  autorizacion_procedimientos: boolean;
  autorizacion_anestesia?: boolean;
  firma_paciente: boolean;
  firma_responsable?: boolean;
  nombre_responsable?: string;
  parentesco_responsable?: string;
  testigos: string[];
  fecha_consentimiento: string;

  // Información adicional del documento
  nombre_paciente?: string;
  edad_paciente?: number;
  medico_responsable?: string;
}

export interface ConsentimientoInformadoFilters extends BaseFilters {
  tipo_consentimiento?: string;
  con_firma_paciente?: boolean;
  con_firma_responsable?: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface CreateConsentimientoInformadoDto {
  id_documento: number;
  tipo_consentimiento: string;
  procedimiento_autorizado: string;
  riesgos_explicados: string;
  alternativas_explicadas?: string;
  autorizacion_procedimientos: boolean;
  autorizacion_anestesia?: boolean;
  firma_paciente: boolean;
  firma_responsable?: boolean;
  nombre_responsable?: string;
  parentesco_responsable?: string;
  testigos: string[];
  fecha_consentimiento?: string;
}

export interface UpdateConsentimientoInformadoDto extends Partial<CreateConsentimientoInformadoDto> {
  id_consentimiento_informado: number;
}
