// src/app/models/nota-urgencias.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// ==========================================
// INTERFACE NOTA URGENCIAS (MAPEO DIRECTO CON BACKEND)
// ==========================================
export interface NotaUrgencias extends BaseEntity, AuditInfo {
  id_nota_urgencias: number;
  id_documento: number;

  // Campos principales de urgencias
  motivo_atencion: string;
  estado_conciencia?: string;
  resumen_interrogatorio?: string;
  exploracion_fisica?: string;
  resultados_estudios?: string;
  estado_mental?: string;
  diagnostico?: string;
  id_guia_diagnostico?: number;
  plan_tratamiento?: string;
  pronostico?: string;
  area_interconsulta?: number;

  // Campos calculados que vienen del backend
  id_expediente?: number;
  fecha_documento?: string;
  estado_documento?: string;
  numero_expediente?: string;
  paciente_nombre?: string;
  fecha_nacimiento?: string;
  sexo?: string;
  medico_urgenciologo?: string;
  especialidad?: string;
  cedula_profesional?: string;
  guia_clinica_nombre?: string;
  guia_clinica_codigo?: string;
  area_interconsulta_nombre?: string;
  servicio_nombre?: string;
  nivel_urgencia?: string;
  horas_desde_ingreso?: number;
  edad_anos?: number;
  tipo_ingreso?: string;
}

// ==========================================
// INTERFACE PARA VISTA DETALLADA
// ==========================================
export interface NotaUrgenciasDetallada extends NotaUrgencias {
  id_personal_creador?: number;
  fecha_apertura?: string;
  curp?: string;
  guia_clinica_descripcion?: string;
  area_interconsulta_descripcion?: string;
  fecha_ingreso?: string;
  motivo_ingreso?: string;

  // Signos vitales
  temperatura?: number;
  presion_arterial_sistolica?: number;
  presion_arterial_diastolica?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  saturacion_oxigeno?: number;
  fecha_signos_vitales?: string;

  // Análisis temporal
  horas_desde_atencion?: number;
  edad_anos_atencion?: number;
}

// ==========================================
// FILTROS PARA BÚSQUEDAS
// ==========================================
export interface NotaUrgenciasFilters extends BaseFilters {
  page?: number;
  limit?: number;
  id_documento?: number;
  id_expediente?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  buscar?: string;
  estado_conciencia?: string;
  area_interconsulta?: number;
  prioridad_triage?: string;
  nivel_urgencia?: 'CRÍTICO' | 'GRAVE' | 'ESTABLE' | 'POR EVALUAR';
}

// ==========================================
// DTOS PARA CREACIÓN
// ==========================================
export interface CreateNotaUrgenciasDto {
  id_documento: number; // Obligatorio
  motivo_atencion: string; // Obligatorio
  estado_conciencia?: string;
  resumen_interrogatorio?: string;
  exploracion_fisica?: string;
  resultados_estudios?: string;
  estado_mental?: string;
  diagnostico?: string;
  id_guia_diagnostico?: number;
  plan_tratamiento?: string;
  pronostico?: string;
  area_interconsulta?: number;
}

// ==========================================
// DTOS PARA ACTUALIZACIÓN
// ==========================================
export interface UpdateNotaUrgenciasDto extends Partial<CreateNotaUrgenciasDto> {
  // Se actualiza por ID en la URL
}

// ==========================================
// INTERFACES PARA RESPUESTAS DE LISTADO
// ==========================================
export interface NotaUrgenciasListResponse {
  data: NotaUrgencias[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==========================================
// INTERFACES PARA ESTADÍSTICAS
// ==========================================
export interface EstadisticasUrgencias {
  periodo_dias: number;
  total_atenciones: number;
  motivos_mas_frecuentes: {
    motivo_corto: string;
    cantidad: number;
  }[];
  distribucion_estados_conciencia: {
    categoria_conciencia: string;
    cantidad: number;
  }[];
  interconsultas_solicitadas: {
    area_interconsulta: string;
    cantidad: number;
  }[];
  atenciones_por_hora: {
    hora: number;
    atenciones: number;
  }[];
  analisis_reingresos: {
    pacientes_reingreso: number;
    total_pacientes: number;
    porcentaje_reingreso: number;
  };
  promedio_tiempo_atencion_minutos: number;
}

// ==========================================
// INTERFACE PARA PANEL EN TIEMPO REAL
// ==========================================
export interface PacienteUrgencias {
  id_nota_urgencias: number;
  numero_expediente: string;
  paciente_nombre: string;
  edad: number;
  sexo: string;
  motivo_atencion: string;
  estado_conciencia?: string;
  diagnostico?: string;
  hora_llegada: string;
  medico_atencion?: string;
  interconsulta_solicitada?: string;
  minutos_desde_llegada: number;
  prioridad_triage: number;
  estado_actual: 'EN_ATENCION' | 'EN_INTERCONSULTA' | 'ESPERA_PROLONGADA' | 'ATENDIDO';
}

export interface PanelUrgenciasTiempoReal {
  data: PacienteUrgencias[];
  analisis: {
    total_pacientes: number;
    por_prioridad: {
      criticos: number;
      urgentes: number;
      menos_urgentes: number;
      no_urgentes: number;
    };
    por_estado: {
      en_atencion: number;
      en_interconsulta: number;
      espera_prolongada: number;
      atendidos: number;
    };
    tiempo_espera_promedio: number;
  };
  timestamp: string;
}

// ==========================================
// INTERFACE PARA PACIENTES FRECUENTES
// ==========================================
export interface PacienteFrecuenteUrgencias {
  id_expediente: number;
  numero_expediente: string;
  paciente_nombre: string;
  fecha_nacimiento: string;
  edad: number;
  sexo: string;
  total_visitas_urgencias: number;
  primera_visita: string;
  ultima_visita: string;
  dias_entre_visitas: number;
  motivos_frecuentes: string;
  diagnosticos_frecuentes: string;
  promedio_dias_entre_visitas?: number;
}

// ==========================================
// ENUMS Y CONSTANTES
// ==========================================
export enum NivelUrgencia {
  CRITICO = 'CRÍTICO',
  GRAVE = 'GRAVE',
  ESTABLE = 'ESTABLE',
  POR_EVALUAR = 'POR EVALUAR'
}

export enum EstadoActualPaciente {
  EN_ATENCION = 'EN_ATENCION',
  EN_INTERCONSULTA = 'EN_INTERCONSULTA',
  ESPERA_PROLONGADA = 'ESPERA_PROLONGADA',
  ATENDIDO = 'ATENDIDO'
}

export enum PrioridadTriage {
  CRITICO = 1,
  URGENTE = 2,
  MENOS_URGENTE = 3,
  NO_URGENTE = 4
}

// ==========================================
// CONSTANTES ÚTILES
// ==========================================
export const CAMPOS_OBLIGATORIOS_URGENCIAS = [
  'id_documento',
  'motivo_atencion'
];

export const ESTADOS_CONCIENCIA_OPCIONES = [
  'Alerta y orientado',
  'Alerta y confuso',
  'Somnoliento',
  'Estuporoso',
  'Inconsciente',
  'En coma'
];

export const PRONOSTICOS_URGENCIAS = [
  'Excelente',
  'Bueno',
  'Reservado',
  'Malo',
  'Grave'
];

// ==========================================
// VALIDACIONES
// ==========================================
export interface ValidacionNotaUrgencias {
  valido: boolean;
  errores: string[];
  advertencias: string[];
  campos_faltantes: string[];
}

// ==========================================
// TIPOS PARA OPCIONES DE SELECCIÓN
// ==========================================
export type EstadoConcienciaOpcion = typeof ESTADOS_CONCIENCIA_OPCIONES[number];
export type PronosticoUrgencias = typeof PRONOSTICOS_URGENCIAS[number];
