// src/app/models/nota-preoperatoria.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// ==========================================
// INTERFACE NOTA PREOPERATORIA
// ==========================================
export interface NotaPreoperatoria extends BaseEntity, AuditInfo {
  id_nota_preoperatoria: number;
  id_documento: number;

  // Información del procedimiento programado
  procedimiento_programado: string;
  fecha_cirugia_programada: string;
  hora_programada?: string;
  duracion_estimada_minutos?: number;

  // Evaluación preoperatoria
  diagnostico_preoperatorio: string;
  id_guia_diagnostico?: number;
  indicacion_quirurgica: string;
  riesgo_quirurgico?: 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto';
  clasificacion_asa?: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';

  // Antecedentes relevantes
  antecedentes_quirurgicos?: string;
  antecedentes_anestesicos?: string;
  alergias_conocidas?: string;
  medicamentos_habituales?: string;

  // Examen físico preoperatorio
  estado_general?: string;
  signos_vitales?: string;
  exploracion_fisica?: string;
  via_aerea?: string;

  // Estudios preoperatorios
  laboratorios_preoperatorios?: string;
  estudios_imagen?: string;
  interconsultas_realizadas?: string;

  // Preparación preoperatoria
  ayuno_indicado?: string;
  preparacion_intestinal?: boolean;
  profilaxis_antibiotica?: string;
  medicacion_preanestesica?: string;

  // Consentimiento y autorizaciones
  consentimiento_informado?: boolean;
  autorizacion_familiar?: boolean;
  riesgos_explicados?: string;

  // Indicaciones preoperatorias
  indicaciones_preoperatorias?: string;
  cuidados_especiales?: string;
  observaciones?: string;

  // Personal médico
  id_cirujano_principal?: number;
  id_anestesiologo_asignado?: number;

  // Información adicional del documento
  fecha_documento?: string;
  nombre_paciente?: string;
  edad_paciente?: number;
  nombre_cirujano?: string;
  nombre_anestesiologo?: string;
  guia_clinica_nombre?: string;
  guia_clinica_codigo?: string;
}

// ==========================================
// FILTROS PARA BÚSQUEDAS
// ==========================================
export interface NotaPreoperatoriaFilters extends BaseFilters {
  id_cirujano_principal?: number;
  id_anestesiologo_asignado?: number;
  fecha_cirugia_inicio?: string;
  fecha_cirugia_fin?: string;
  tipo_procedimiento?: string;
  riesgo_quirurgico?: string;
  clasificacion_asa?: string;
  con_consentimiento?: boolean;
  fecha_evaluacion_inicio?: string;
  fecha_evaluacion_fin?: string;
}

// ==========================================
// DTOS PARA CREACIÓN Y ACTUALIZACIÓN
// ==========================================
export interface CreateNotaPreoperatoriaDto {
  id_documento: number;
  procedimiento_programado: string;
  fecha_cirugia_programada: string;
  diagnostico_preoperatorio: string;
  id_guia_diagnostico?: number;
  indicacion_quirurgica: string;
  riesgo_quirurgico?: 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto';
  clasificacion_asa?: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  antecedentes_quirurgicos?: string;
  antecedentes_anestesicos?: string;
  alergias_conocidas?: string;
  medicamentos_habituales?: string;
  estado_general?: string;
  laboratorios_preoperatorios?: string;
  estudios_imagen?: string;
  ayuno_indicado?: string;
  preparacion_intestinal?: boolean;
  profilaxis_antibiotica?: string;
  consentimiento_informado?: boolean;
  autorizacion_familiar?: boolean;
  riesgos_explicados?: string;
  indicaciones_preoperatorias?: string;
  observaciones?: string;
  id_cirujano_principal?: number;
  id_anestesiologo_asignado?: number;
}

export interface UpdateNotaPreoperatoriaDto extends Partial<CreateNotaPreoperatoriaDto> {
  id_nota_preoperatoria: number;
}

// ==========================================
// RESPUESTAS ESPECÍFICAS
// ==========================================
export interface NotaPreoperatoriaCompleta extends NotaPreoperatoria {
  // Información completa del paciente
  paciente: {
    nombre_completo: string;
    edad: number;
    genero: string;
    numero_expediente: string;
    peso: number;
    talla: number;
    alergias?: string;
    enfermedades_cronicas?: string;
  };

  // Información del equipo quirúrgico
  equipo_quirurgico: {
    cirujano_principal?: {
      id: number;
      nombre_completo: string;
      cedula: string;
      especialidad: string;
    };
    anestesiologo?: {
      id: number;
      nombre_completo: string;
      cedula: string;
      especialidad: string;
    };
  };

  // Información de la cirugía
  cirugia: {
    servicio: string;
    sala_asignada?: string;
    tipo_cirugia: string;
    complejidad: string;
    duracion_estimada: number;
  };

  // Estudios preoperatorios detallados
  estudios_completos?: {
    laboratorios: any[];
    imagenes: any[];
    interconsultas: any[];
    resultados_anormales: string[];
  };
}

// ==========================================
// ESTADÍSTICAS PREOPERATORIAS
// ==========================================
export interface EstadisticasPreoperatorias {
  total_evaluaciones: number;
  cirugias_programadas: number;
  cirugias_realizadas: number;
  cirugias_canceladas: number;

  // Por riesgo quirúrgico
  por_riesgo: {
    riesgo: string;
    total: number;
    porcentaje: number;
  }[];

  // Por clasificación ASA
  por_asa: {
    clasificacion: string;
    total: number;
    porcentaje: number;
  }[];

  // Por tipo de procedimiento
  por_procedimiento: {
    procedimiento: string;
    total: number;
    duracion_promedio: number;
  }[];

  // Cumplimiento de protocolos
  cumplimiento: {
    consentimiento_informado: number;
    laboratorios_completos: number;
    ayuno_adecuado: number;
    preparacion_completa: number;
  };

  // Cancelaciones
  motivos_cancelacion: {
    motivo: string;
    frecuencia: number;
    porcentaje: number;
  }[];
}

// ==========================================
// CONSTANTES
// ==========================================
export const RIESGOS_QUIRURGICOS = [
  'Bajo',
  'Moderado',
  'Alto',
  'Muy Alto'
] as const;

export const MOTIVOS_CANCELACION_COMUNES = [
  'Paciente no en ayuno',
  'Estudios preoperatorios incompletos',
  'Infección activa',
  'Descompensación médica',
  'Falta de consentimiento',
  'Suspensión por paciente',
  'Emergencia médica',
  'Problemas administrativos'
] as const;

export const PREPARACIONES_ESPECIALES = [
  'Preparación intestinal',
  'Suspensión de anticoagulantes',
  'Ajuste de antidiabéticos',
  'Profilaxis antibiótica',
  'Rasurado quirúrgico',
  'Venoclisis preoperatoria',
  'Premedicación ansiolítica'
] as const;
