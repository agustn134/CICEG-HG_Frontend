// src/app/models/nota-preanestesica.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// ==========================================
// INTERFACE NOTA PREANESTÉSICA
// ==========================================
export interface NotaPreanestesica extends BaseEntity, AuditInfo {
  id_nota_preanestesica: number;
  id_documento: number;

  // Evaluación preanestésica
  antecedentes_anestesicos?: string;
  alergias_medicamentos?: string;
  medicamentos_actuales?: string;
  ayuno_horas?: number;

  // Examen físico preoperatorio
  estado_general?: string;
  via_aerea?: string;
  sistema_cardiovascular?: string;
  sistema_respiratorio?: string;
  sistema_nervioso?: string;

  // Laboratorios y estudios
  laboratorios_relevantes?: string;
  estudios_gabinete?: string;

  // Evaluación de riesgo
  clasificacion_asa?: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  riesgo_cardiovascular?: string;
  riesgo_respiratorio?: string;
  riesgo_anestesico?: 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto';

  // Plan anestésico
  tipo_anestesia_propuesto?: string;
  tecnica_anestesica?: string;
  medicamentos_preanestesicos?: string;
  precauciones_especiales?: string;

  // Información del procedimiento
  procedimiento_quirurgico?: string;
  duracion_estimada_minutos?: number;
  posicion_quirurgica?: string;

  // Consentimiento y observaciones
  consentimiento_informado?: boolean;
  observaciones?: string;
  recomendaciones?: string;

  // Personal médico
  id_anestesiologo?: number;

  // Información adicional del documento
  fecha_documento?: string;
  nombre_paciente?: string;
  edad_paciente?: number;
  peso_paciente?: number;
  talla_paciente?: number;
  nombre_anestesiologo?: string;
  cedula_anestesiologo?: string;
}

// ==========================================
// FILTROS PARA BÚSQUEDAS
// ==========================================
export interface NotaPreanestesicaFilters extends BaseFilters {
  id_anestesiologo?: number;
  clasificacion_asa?: string;
  riesgo_anestesico?: string;
  tipo_anestesia?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  procedimiento?: string;
  con_consentimiento?: boolean;
  ayuno_minimo?: number;
  ayuno_maximo?: number;
}

// ==========================================
// DTOS PARA CREACIÓN Y ACTUALIZACIÓN
// ==========================================
export interface CreateNotaPreanestesicaDto {
  id_documento: number;
  antecedentes_anestesicos?: string;
  alergias_medicamentos?: string;
  medicamentos_actuales?: string;
  ayuno_horas?: number;
  estado_general?: string;
  via_aerea?: string;
  sistema_cardiovascular?: string;
  sistema_respiratorio?: string;
  sistema_nervioso?: string;
  laboratorios_relevantes?: string;
  estudios_gabinete?: string;
  clasificacion_asa?: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  riesgo_cardiovascular?: string;
  riesgo_respiratorio?: string;
  riesgo_anestesico?: 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto';
  tipo_anestesia_propuesto?: string;
  tecnica_anestesica?: string;
  medicamentos_preanestesicos?: string;
  precauciones_especiales?: string;
  procedimiento_quirurgico?: string;
  duracion_estimada_minutos?: number;
  posicion_quirurgica?: string;
  consentimiento_informado?: boolean;
  observaciones?: string;
  recomendaciones?: string;
  id_anestesiologo?: number;
}

export interface UpdateNotaPreanestesicaDto extends Partial<CreateNotaPreanestesicaDto> {
  id_nota_preanestesica: number;
}

// ==========================================
// RESPUESTAS ESPECÍFICAS
// ==========================================
export interface NotaPreanestesicaCompleta extends NotaPreanestesica {
  // Información completa del paciente
  paciente: {
    nombre_completo: string;
    edad: number;
    genero: string;
    peso: number;
    talla: number;
    imc: number;
    numero_expediente: string;
    alergias_conocidas?: string;
    enfermedades_cronicas?: string;
  };

  // Información del anestesiólogo
  anestesiologo?: {
    id: number;
    nombre_completo: string;
    cedula: string;
    especialidad: string;
  };

  // Información del procedimiento
  cirugia?: {
    nombre: string;
    tipo: string;
    duracion_estimada: number;
    riesgo_quirurgico: string;
  };

  // Signos vitales preoperatorios
  signos_vitales?: {
    temperatura: number;
    presion_sistolica: number;
    presion_diastolica: number;
    frecuencia_cardiaca: number;
    frecuencia_respiratoria: number;
    saturacion_oxigeno: number;
  };
}

// ==========================================
// CLASIFICACIONES Y ESCALAS
// ==========================================
export interface ClasificacionASA {
  grado: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  descripcion: string;
  ejemplo: string;
  mortalidad_estimada: string;
}

export interface RiesgoAnestesico {
  nivel: 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto';
  descripcion: string;
  factores_riesgo: string[];
  precauciones: string[];
}

// ==========================================
// ESTADÍSTICAS PREANESTÉSICAS
// ==========================================
export interface EstadisticasPreanestesicas {
  total_evaluaciones: number;

  // Por clasificación ASA
  por_clasificacion_asa: {
    clasificacion: string;
    total: number;
    porcentaje: number;
  }[];

  // Por riesgo anestésico
  por_riesgo: {
    nivel: string;
    total: number;
    porcentaje: number;
  }[];

  // Por tipo de anestesia
  por_tipo_anestesia: {
    tipo: string;
    total: number;
    porcentaje: number;
  }[];

  // Tiempos de ayuno
  ayuno_promedio_horas: number;
  ayuno_insuficiente: number;
  ayuno_excesivo: number;

  // Complicaciones predichas vs reales
  complicaciones_predichas: number;
  precision_prediccion: number;
}

// ==========================================
// CONSTANTES
// ==========================================
export const CLASIFICACIONES_ASA: Record<string, ClasificacionASA> = {
  'I': {
    grado: 'I',
    descripcion: 'Paciente sano normal',
    ejemplo: 'Sin alteraciones orgánicas, fisiológicas o psiquiátricas',
    mortalidad_estimada: '0.06-0.08%'
  },
  'II': {
    grado: 'II',
    descripcion: 'Paciente con enfermedad sistémica leve',
    ejemplo: 'HTA controlada, DM sin complicaciones, obesidad leve',
    mortalidad_estimada: '0.27-0.4%'
  },
  'III': {
    grado: 'III',
    descripcion: 'Paciente con enfermedad sistémica grave',
    ejemplo: 'HTA no controlada, DM con complicaciones, EPOC moderado',
    mortalidad_estimada: '1.8-4.3%'
  },
  'IV': {
    grado: 'IV',
    descripcion: 'Paciente con enfermedad sistémica grave que amenaza la vida',
    ejemplo: 'Insuficiencia cardiaca severa, sepsis, coma',
    mortalidad_estimada: '7.8-23%'
  },
  'V': {
    grado: 'V',
    descripcion: 'Paciente moribundo',
    ejemplo: 'Politraumatizado grave, ruptura de aneurisma',
    mortalidad_estimada: '9.4-51%'
  },
  'VI': {
    grado: 'VI',
    descripcion: 'Paciente con muerte cerebral para donación de órganos',
    ejemplo: 'Donante de órganos con muerte cerebral',
    mortalidad_estimada: 'N/A'
  }
};

export const TIPOS_ANESTESIA = [
  'General balanceada',
  'General intravenosa',
  'Regional epidural',
  'Regional subaracnoidea',
  'Regional plexos',
  'Local infiltrativa',
  'Sedación consciente',
  'Combinada'
] as const;
