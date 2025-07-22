// src/app/models/hoja-frontal.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface HojaFrontal extends BaseEntity, AuditInfo {
  id_hoja_frontal: number;
  id_expediente: number;
  id_paciente: number;

  // Datos del establecimiento (NOM-004)
  tipo_establecimiento: string;
  nombre_establecimiento: string;
  domicilio_establecimiento: string;
  razon_social?: string;
  clave_establecimiento?: string;

  // Datos del expediente
  numero_expediente: string;
  fecha_apertura: string;
  hora_apertura: string;
  folio_consecutivo?: string;

  // Datos demográficos adicionales del paciente
  lugar_nacimiento?: string;
  nacionalidad?: string;
  grupo_etnico?: string;
  lengua_indigena?: string;
  religion?: string;

  // Datos socioeconómicos
  escolaridad?: string;
  ocupacion?: string;
  estado_conyugal?: string;

  // Información de seguridad social
  afiliacion_medica?: TipoAfiliacion;
  numero_afiliacion?: string;
  vigencia_afiliacion?: string;

  // Contactos de emergencia
  contacto_emergencia_1: ContactoEmergencia;
  contacto_emergencia_2?: ContactoEmergencia;

  // Datos del responsable legal (menores o incapacitados)
  responsable_legal?: ResponsableLegal;

  // Información médica relevante
  alergias_conocidas?: string;
  grupo_sanguineo?: string;
  factor_rh?: string;
  enfermedades_cronicas?: string;
  medicamentos_actuales?: string;
  discapacidades?: string;

  // Datos de ingreso
  fecha_ingreso?: string;
  hora_ingreso?: string;
  servicio_ingreso?: string;
  tipo_ingreso?: TipoIngreso;
  procedencia?: string;

  // Control administrativo
  id_personal_registro: number;
  verificado_por?: number;
  fecha_verificacion?: string;
  observaciones?: string;

  // Documentos adjuntos
  foto_paciente?: string;
  documentos_identificacion?: string[];
  consentimiento_fotografias?: boolean;
  autorizacion_datos_personales?: boolean;
}

export interface ContactoEmergencia {
  nombre_completo: string;
  parentesco: string;
  telefono_principal: string;
  telefono_secundario?: string;
  direccion?: string;
  trabajo?: string;
  telefono_trabajo?: string;
}

export interface ResponsableLegal {
  nombre_completo: string;
  parentesco: string;
  identificacion_tipo: TipoIdentificacion;
  identificacion_numero: string;
  telefono: string;
  direccion: string;
  trabajo?: string;
  motivo_responsabilidad?: string; // "Menor de edad", "Incapacidad", etc.
}

export type TipoAfiliacion =
  | 'IMSS'
  | 'ISSSTE'
  | 'SEDENA'
  | 'SEMAR'
  | 'PEMEX'
  | 'SEGURO_POPULAR'
  | 'INSABI'
  | 'PRIVADO'
  | 'NINGUNO';

export type TipoIdentificacion =
  | 'INE'
  | 'PASAPORTE'
  | 'CEDULA_PROFESIONAL'
  | 'CARTILLA_MILITAR'
  | 'LICENCIA_CONDUCIR'
  | 'ACTA_NACIMIENTO'
  | 'OTRO';

export type TipoIngreso =
  | 'URGENCIAS'
  | 'CONSULTA_EXTERNA'
  | 'HOSPITALIZACION'
  | 'CIRUGIA_PROGRAMADA'
  | 'TRASLADO'
  | 'REFERENCIA';

export interface CreateHojaFrontalDto {
  id_expediente: number;
  id_paciente: number;
  tipo_establecimiento: string;
  nombre_establecimiento: string;
  domicilio_establecimiento: string;
  razon_social?: string;
  numero_expediente: string;
  fecha_apertura?: string;
  hora_apertura?: string;
  lugar_nacimiento?: string;
  nacionalidad?: string;
  grupo_etnico?: string;
  lengua_indigena?: string;
  escolaridad?: string;
  ocupacion?: string;
  estado_conyugal?: string;
  afiliacion_medica?: TipoAfiliacion;
  numero_afiliacion?: string;
  contacto_emergencia_1: ContactoEmergencia;
  contacto_emergencia_2?: ContactoEmergencia;
  responsable_legal?: ResponsableLegal;
  alergias_conocidas?: string;
  grupo_sanguineo?: string;
  factor_rh?: string;
  enfermedades_cronicas?: string;
  medicamentos_actuales?: string;
  fecha_ingreso?: string;
  hora_ingreso?: string;
  servicio_ingreso?: string;
  tipo_ingreso?: TipoIngreso;
  id_personal_registro: number;
  observaciones?: string;
}

export interface HojaFrontalFilters extends BaseFilters {
  tipo_establecimiento?: string;
  afiliacion_medica?: TipoAfiliacion;
  tipo_ingreso?: TipoIngreso;
  servicio_ingreso?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  verificado?: boolean;
}
