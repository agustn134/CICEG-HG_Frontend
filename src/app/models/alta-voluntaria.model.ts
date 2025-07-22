// src/app/models/alta-voluntaria.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface AltaVoluntaria extends BaseEntity, AuditInfo {
  id_alta_voluntaria: number;
  id_documento: number;
  id_expediente: number;
  id_paciente: number;
  id_personal_medico: number;

  // Información del alta voluntaria
  fecha_alta: string;
  hora_alta: string;
  motivo_alta_voluntaria: string;
  tipo_alta: TipoAltaVoluntaria;

  // Información médica
  diagnostico_actual: string;
  estado_clinico_actual: string;
  tratamiento_recomendado: string;
  riesgos_explicados: string;
  consecuencias_informadas: string;

  // Recomendaciones médicas
  medicamentos_prescritos?: string;
  cuidados_domiciliarios?: string;
  signos_alarma?: string;
  cuando_regresar?: string;
  cita_control?: string;

  // Información del responsable de la decisión
  paciente_decide: boolean;
  nombre_responsable?: string;
  parentesco_responsable?: string;
  identificacion_responsable?: string;
  motivo_responsabilidad?: string; // "Menor de edad", "Incapacidad", etc.

  // Testigos
  testigo1_nombre?: string;
  testigo1_identificacion?: string;
  testigo1_telefono?: string;
  testigo2_nombre?: string;
  testigo2_identificacion?: string;
  testigo2_telefono?: string;

  // Información médica adicional
  pronostico_sin_tratamiento?: string;
  complicaciones_posibles?: string;
  alternativas_tratamiento?: string;

  // Control y firmas
  firma_paciente: boolean;
  firma_responsable: boolean;
  firma_medico: boolean;
  firma_testigo1: boolean;
  firma_testigo2: boolean;

  // Observaciones y seguimiento
  observaciones_medicas?: string;
  observaciones_enfermeria?: string;
  condiciones_egreso?: string;
  medio_transporte?: string;
  acompañado_por?: string;

  // Información administrativa
  pendiente_pago?: boolean;
  monto_pendiente?: number;
  convenio_pago?: string;
}

export type TipoAltaVoluntaria =
  | 'CONTRA_OPINION_MEDICA'
  | 'POR_MEJORIA_SUBJETIVA'
  | 'MOTIVOS_FAMILIARES'
  | 'MOTIVOS_ECONOMICOS'
  | 'TRASLADO_PRIVADO'
  | 'SEGUNDA_OPINION'
  | 'OTROS';

export interface CreateAltaVoluntariaDto {
  id_documento: number;
  id_expediente: number;
  id_paciente: number;
  id_personal_medico: number;
  fecha_alta?: string;
  hora_alta?: string;
  motivo_alta_voluntaria: string;
  tipo_alta: TipoAltaVoluntaria;
  diagnostico_actual: string;
  estado_clinico_actual: string;
  tratamiento_recomendado: string;
  riesgos_explicados: string;
  consecuencias_informadas: string;
  medicamentos_prescritos?: string;
  cuidados_domiciliarios?: string;
  signos_alarma?: string;
  paciente_decide: boolean;
  nombre_responsable?: string;
  parentesco_responsable?: string;
  identificacion_responsable?: string;
  testigo1_nombre?: string;
  testigo1_identificacion?: string;
  testigo2_nombre?: string;
  testigo2_identificacion?: string;
  pronostico_sin_tratamiento?: string;
  observaciones_medicas?: string;
  condiciones_egreso?: string;
}

export interface AltaVoluntariaFilters extends BaseFilters {
  tipo_alta?: TipoAltaVoluntaria;
  fecha_desde?: string;
  fecha_hasta?: string;
  paciente_decide?: boolean;
  con_testigos?: boolean;
  pendiente_pago?: boolean;
}
