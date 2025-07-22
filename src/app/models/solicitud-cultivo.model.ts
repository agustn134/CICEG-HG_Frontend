// src/app/models/solicitud-cultivo.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface SolicitudCultivo extends BaseEntity, AuditInfo {
  id_solicitud_cultivo: number;
  id_documento: number;
  id_expediente: number;
  id_paciente: number;
  id_medico_solicita: number;

  // Información del cultivo
  tipo_cultivo: TipoCultivo;
  tipo_muestra: TipoMuestra;
  sitio_toma_muestra: string;
  especificaciones_muestra?: string;

  // Información clínica
  diagnostico_presuntivo: string;
  sospecha_microorganismo?: string;
  sintomatologia_clinica?: string;
  datos_clinicos_relevantes?: string;

  // Toma de muestra
  fecha_toma_muestra: string;
  hora_toma_muestra: string;
  tecnica_obtencion?: string;
  cantidad_muestra?: string;
  calidad_muestra?: CalidadMuestra;

  // Tratamiento antibiótico previo
  antibioticos_previos?: boolean;
  cuales_antibioticos?: string;
  fecha_ultimo_antibiotico?: string;
  suspension_antibioticos?: boolean;

  // Solicitud específica
  antibiograma_solicitado?: boolean;
  microorganismos_especificos?: string[];
  pruebas_especiales?: string;
  urgente?: boolean;
  motivo_urgencia?: string;

  // Estado y procesamiento
  estado_solicitud: EstadoSolicitud;
  fecha_recepcion_lab?: string;
  fecha_siembra?: string;
  fecha_lectura_preliminar?: string;
  fecha_resultado_final?: string;

  // Resultados
  resultados?: ResultadoCultivo;
  interpretacion_clinica?: string;
  recomendaciones?: string;

  // Control de calidad
  id_personal_toma?: number;
  id_personal_laboratorio?: number;
  observaciones_laboratorio?: string;
  rechazado?: boolean;
  motivo_rechazo?: string;
}

export type TipoCultivo =
  | 'UROCULTIVO'
  | 'HEMOCULTIVO'
  | 'COPROCULTIVO'
  | 'CULTIVO_FARINGE'
  | 'CULTIVO_ESPUTO'
  | 'CULTIVO_LCR'
  | 'CULTIVO_HERIDA'
  | 'CULTIVO_SECRECION'
  | 'CULTIVO_GENITAL'
  | 'CULTIVO_CONJUNTIVA'
  | 'CULTIVO_ANAEROBIOS'
  | 'CULTIVO_HONGOS'
  | 'CULTIVO_MICOBACTERIAS'
  | 'OTROS';

export type TipoMuestra =
  | 'ORINA'
  | 'SANGRE'
  | 'HECES'
  | 'ESPUTO'
  | 'LCR'
  | 'SECRECION_HERIDA'
  | 'SECRECION_VAGINAL'
  | 'SECRECION_URETRAL'
  | 'SECRECION_FARINGEA'
  | 'SECRECION_NASAL'
  | 'LIQUIDO_PLEURAL'
  | 'LIQUIDO_ASCITICO'
  | 'BIOPSIA'
  | 'CATETER'
  | 'OTROS';

export type CalidadMuestra =
  | 'ADECUADA'
  | 'INADECUADA'
  | 'CONTAMINADA'
  | 'INSUFICIENTE';

export type EstadoSolicitud =
  | 'SOLICITADO'
  | 'RECIBIDO'
  | 'EN_PROCESO'
  | 'SEMBRADO'
  | 'LECTURA_PRELIMINAR'
  | 'COMPLETADO'
  | 'RECHAZADO'
  | 'CANCELADO';

export interface ResultadoCultivo {
  crecimiento_bacteriano: boolean;
  microorganismo_aislado?: string;
  recuento_colonias?: string;
  morfologia_colonias?: string;
  gram_resultado?: string;
  antibiograma?: Antibiograma[];
  sensibilidad_global?: 'SENSIBLE' | 'INTERMEDIO' | 'RESISTENTE';
  observaciones_resultado?: string;
}

export interface Antibiograma {
  antibiotico: string;
  concentracion?: string;
  sensibilidad: 'S' | 'I' | 'R'; // Sensible, Intermedio, Resistente
  cim?: string; // Concentración Inhibitoria Mínima
  diametro_halo?: number;
  metodo?: 'DISCO' | 'DILUCIÓN' | 'E-TEST' | 'AUTOMATIZADO';
}

export interface CreateSolicitudCultivoDto {
  id_documento: number;
  id_expediente: number;
  id_paciente: number;
  id_medico_solicita: number;
  tipo_cultivo: TipoCultivo;
  tipo_muestra: TipoMuestra;
  sitio_toma_muestra: string;
  especificaciones_muestra?: string;
  diagnostico_presuntivo: string;
  sospecha_microorganismo?: string;
  sintomatologia_clinica?: string;
  fecha_toma_muestra?: string;
  hora_toma_muestra?: string;
  antibioticos_previos?: boolean;
  cuales_antibioticos?: string;
  antibiograma_solicitado?: boolean;
  urgente?: boolean;
  motivo_urgencia?: string;
  id_personal_toma?: number;
}

export interface SolicitudCultivoFilters extends BaseFilters {
  tipo_cultivo?: TipoCultivo;
  tipo_muestra?: TipoMuestra;
  estado_solicitud?: EstadoSolicitud;
  urgente?: boolean;
  fecha_desde?: string;
  fecha_hasta?: string;
  con_resultados?: boolean;
  microorganismo?: string;
}
