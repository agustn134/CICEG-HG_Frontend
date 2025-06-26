// src/app/models/nota-interconsulta.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// ==========================================
// INTERFACE NOTA DE INTERCONSULTA
// ==========================================
export interface NotaInterconsulta extends BaseEntity, AuditInfo {
  id_nota_interconsulta: number;
  id_documento: number;
  area_interconsulta?: number;
  motivo_interconsulta: string;
  diagnostico_presuntivo?: string;
  examenes_laboratorio?: boolean;
  examenes_gabinete?: boolean;
  hallazgos?: string;
  impresion_diagnostica?: string;
  recomendaciones?: string;
  id_medico_solicitante?: number;
  id_medico_interconsulta?: number;

  // Información adicional del documento
  fecha_documento?: string;
  observaciones_documento?: string;

  // Información del paciente
  nombre_paciente?: string;
  fecha_nacimiento?: string;
  edad_anos?: number;
  sexo?: string;
  numero_expediente?: string;

  // Información del área y médicos
  nombre_area_interconsulta?: string;
  medico_solicitante?: string;
  cedula_solicitante?: string;
  medico_interconsulta?: string;
  cedula_interconsulta?: string;

  // Información del servicio
  nombre_servicio?: string;

  // Estado calculado
  estado_interconsulta?: 'Pendiente' | 'En Proceso' | 'Respondida';
}

// ==========================================
// FILTROS PARA BÚSQUEDAS
// ==========================================
export interface NotaInterconsultaFilters extends BaseFilters {
  area_interconsulta?: number;
  id_medico_solicitante?: number;
  id_medico_interconsulta?: number;
  estado?: 'Pendiente' | 'En Proceso' | 'Respondida' | 'all';
  fecha_inicio?: string;
  fecha_fin?: string;
  con_examenes_laboratorio?: boolean;
  con_examenes_gabinete?: boolean;
  respondida?: boolean;
}

// ==========================================
// DTOS PARA CREACIÓN Y ACTUALIZACIÓN
// ==========================================
export interface CreateNotaInterconsultaDto {
  id_documento: number;
  area_interconsulta?: number;
  motivo_interconsulta: string;
  diagnostico_presuntivo?: string;
  examenes_laboratorio?: boolean;
  examenes_gabinete?: boolean;
  hallazgos?: string;
  id_medico_solicitante?: number;
}

export interface UpdateNotaInterconsultaDto extends Partial<CreateNotaInterconsultaDto> {
  id_nota_interconsulta: number;
  impresion_diagnostica?: string;
  recomendaciones?: string;
  id_medico_interconsulta?: number;
}

// ==========================================
// RESPUESTAS ESPECÍFICAS
// ==========================================
export interface NotaInterconsultaCompleta extends NotaInterconsulta {
  // Información completa del paciente
  paciente: {
    nombre_completo: string;
    edad: number;
    genero: string;
    numero_expediente: string;
    fecha_nacimiento: string;
  };

  // Información completa del área
  area: {
    id: number;
    nombre: string;
    descripcion?: string;
  };

  // Información completa de médicos
  medico_solicitante_info?: {
    id: number;
    nombre_completo: string;
    cedula: string;
    especialidad?: string;
  };

  medico_interconsulta_info?: {
    id: number;
    nombre_completo: string;
    cedula: string;
    especialidad?: string;
  };

  // Información del servicio
  servicio: {
    id: number;
    nombre: string;
  };

  // Historial de la interconsulta
  fechas_importantes: {
    fecha_solicitud: string;
    fecha_respuesta?: string;
    tiempo_respuesta_horas?: number;
  };
}

// ==========================================
// ESTADÍSTICAS DE INTERCONSULTAS
// ==========================================
export interface EstadisticasInterconsultas {
  total_interconsultas: number;
  interconsultas_pendientes: number;
  interconsultas_respondidas: number;
  tiempo_promedio_respuesta_horas: number;

  // Por área
  por_area: {
    area: string;
    total: number;
    pendientes: number;
    respondidas: number;
    tiempo_promedio_respuesta: number;
  }[];

  // Por médico solicitante
  por_medico_solicitante: {
    medico: string;
    total_solicitadas: number;
    especialidad?: string;
  }[];

  // Por médico interconsultante
  por_medico_interconsulta: {
    medico: string;
    total_respondidas: number;
    tiempo_promedio_respuesta: number;
    especialidad?: string;
  }[];

  // Tendencias
  tendencia_mensual: {
    mes: string;
    total: number;
    pendientes: number;
    respondidas: number;
  }[];
}

// ==========================================
// TIPOS ESPECÍFICOS
// ==========================================
export type EstadoInterconsulta = 'Pendiente' | 'En Proceso' | 'Respondida';

export interface PrioridadInterconsulta {
  nivel: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  tiempo_respuesta_esperado_horas: number;
  color: string;
}

// ==========================================
// CONSTANTES
// ==========================================
export const PRIORIDADES_INTERCONSULTA: Record<string, PrioridadInterconsulta> = {
  'urgente': {
    nivel: 'Urgente',
    tiempo_respuesta_esperado_horas: 2,
    color: '#ef4444'
  },
  'alta': {
    nivel: 'Alta',
    tiempo_respuesta_esperado_horas: 8,
    color: '#f97316'
  },
  'media': {
    nivel: 'Media',
    tiempo_respuesta_esperado_horas: 24,
    color: '#eab308'
  },
  'baja': {
    nivel: 'Baja',
    tiempo_respuesta_esperado_horas: 72,
    color: '#22c55e'
  }
};
