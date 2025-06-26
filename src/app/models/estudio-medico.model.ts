// src/app/models/estudio-medico.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// ==========================================
// INTERFACE ESTUDIO MÉDICO
// ==========================================
export interface EstudioMedico extends BaseEntity, AuditInfo {
  id_estudio: number;
  clave: string; // Código único del estudio (ej: "19101", "30001")
  nombre: string; // Nombre del estudio
  tipo: TipoEstudio; // Laboratorio, Imagen, Gabinete, etc.
  descripcion?: string;
  requiere_ayuno: boolean;
  tiempo_resultado: number; // En horas
  activo: boolean;

  // Información adicional
  costo?: number;
  observaciones?: string;
  preparacion_paciente?: string;
  contraindicaciones?: string;

  // Estadísticas de uso
  total_solicitudes?: number;
  solicitudes_mes?: number;
  tiempo_promedio_resultado?: number;
}

// ==========================================
// TIPOS DE ESTUDIOS
// ==========================================
export type TipoEstudio =
  | 'Laboratorio'
  | 'Imagen'
  | 'Gabinete'
  | 'Patología'
  | 'Microbiología'
  | 'Genética'
  | 'Funcional'
  | 'Endoscopia'
  | 'Biopsia';

// ==========================================
// CATEGORÍAS DE LABORATORIO
// ==========================================
export type CategoriaLaboratorio =
  | 'Hematología'
  | 'Química Sanguínea'
  | 'Inmunología'
  | 'Microbiología'
  | 'Parasitología'
  | 'Urianálisis'
  | 'Gasometría'
  | 'Hormonas'
  | 'Marcadores Tumorales'
  | 'Perfil Cardíaco'
  | 'Perfil Hepático'
  | 'Perfil Renal'
  | 'Perfil Lipídico'
  | 'Coagulación';

// ==========================================
// CATEGORÍAS DE IMAGEN
// ==========================================
export type CategoriaImagen =
  | 'Radiografía'
  | 'Ultrasonido'
  | 'Tomografía'
  | 'Resonancia Magnética'
  | 'Medicina Nuclear'
  | 'Angiografía'
  | 'Mamografía'
  | 'Densitometría';

// ==========================================
// FILTROS PARA BÚSQUEDAS
// ==========================================
export interface EstudioMedicoFilters extends BaseFilters {
  tipo?: TipoEstudio;
  categoria?: CategoriaLaboratorio | CategoriaImagen;
  requiere_ayuno?: boolean;
  tiempo_resultado_max?: number;
  clave?: string;
  costo_min?: number;
  costo_max?: number;
  disponible_urgencias?: boolean;
}

// ==========================================
// DTOS PARA CREACIÓN Y ACTUALIZACIÓN
// ==========================================
export interface CreateEstudioMedicoDto {
  clave: string;
  nombre: string;
  tipo: TipoEstudio;
  descripcion?: string;
  requiere_ayuno?: boolean;
  tiempo_resultado: number;
  costo?: number;
  observaciones?: string;
  preparacion_paciente?: string;
  contraindicaciones?: string;
  activo?: boolean;
}

export interface UpdateEstudioMedicoDto extends Partial<CreateEstudioMedicoDto> {
  id_estudio: number;
}

// ==========================================
// RESPUESTAS ESPECÍFICAS
// ==========================================
export interface EstudioMedicoCompleto extends EstudioMedico {
  categoria?: CategoriaLaboratorio | CategoriaImagen;

  // Estadísticas detalladas
  estadisticas: {
    total_solicitudes_historicas: number;
    solicitudes_ultimo_mes: number;
    solicitudes_ultima_semana: number;
    tiempo_promedio_resultado: number;
    porcentaje_resultados_anormales: number;
  };

  // Información de disponibilidad
  disponibilidad: {
    disponible_24h: boolean;
    disponible_urgencias: boolean;
    dias_disponibles: string[];
    horarios_disponibles: string;
  };

  // Servicios que más lo solicitan
  servicios_solicitantes: {
    servicio: string;
    total_solicitudes: number;
    porcentaje: number;
  }[];
}

// ==========================================
// GRUPO DE ESTUDIOS
// ==========================================
export interface GrupoEstudios {
  id_grupo: number;
  nombre: string; // "Perfil Hepático", "Biometría + Química", etc.
  descripcion?: string;
  estudios: EstudioMedico[];
  precio_grupo?: number;
  descuento_porcentaje?: number;
  requiere_ayuno: boolean;
  tiempo_resultado_max: number;
}

// ==========================================
// SOLICITUD DE ESTUDIO (REFERENCIA)
// ==========================================
export interface SolicitudEstudioRef {
  id_solicitud: number;
  id_estudio: number;
  id_expediente: number;
  id_medico_solicitante: number;
  fecha_solicitud: string;
  urgente: boolean;
  indicaciones_especiales?: string;
  estado: EstadoSolicitud;

  // Información del estudio
  estudio?: EstudioMedico;

  // Fechas importantes
  fecha_toma_muestra?: string;
  fecha_resultado?: string;
  fecha_entrega?: string;

  // Resultado
  resultado?: string;
  valores_referencia?: string;
  interpretacion?: string;
  patologico?: boolean;
}

export type EstadoSolicitud =
  | 'Solicitado'
  | 'Programado'
  | 'En Proceso'
  | 'Completado'
  | 'Entregado'
  | 'Cancelado';

// ==========================================
// ESTADÍSTICAS DE ESTUDIOS MÉDICOS
// ==========================================
export interface EstadisticasEstudiosMedicos {
  total_estudios_disponibles: number;
  estudios_activos: number;

  // Por tipo
  por_tipo: {
    tipo: TipoEstudio;
    cantidad: number;
    porcentaje: number;
    solicitudes_mes: number;
  }[];

  // Más solicitados
  mas_solicitados: {
    estudio: string;
    clave: string;
    total_solicitudes: number;
    porcentaje_total: number;
  }[];

  // Tiempos de resultado
  tiempos_resultado: {
    promedio_horas: number;
    mas_rapido: { estudio: string; tiempo: number };
    mas_lento: { estudio: string; tiempo: number };
  };

  // Por servicio solicitante
  por_servicio: {
    servicio: string;
    total_solicitudes: number;
    estudios_frecuentes: string[];
  }[];

  // Tendencias mensuales
  tendencia_mensual: {
    mes: string;
    total_solicitudes: number;
    estudios_nuevos_agregados: number;
  }[];
}

// ==========================================
// VALORES DE REFERENCIA
// ==========================================
export interface ValorReferencia {
  parametro: string;
  valor_minimo?: number;
  valor_maximo?: number;
  valor_normal?: string;
  unidad: string;
  grupo_edad?: string; // "Adulto", "Pediátrico", "Neonatal"
  genero?: 'M' | 'F' | 'Ambos';
  observaciones?: string;
}

export interface ResultadoEstudio {
  id_resultado: number;
  id_solicitud: number;
  parametros: {
    nombre: string;
    valor: string | number;
    unidad?: string;
    valor_referencia: ValorReferencia;
    anormal: boolean;
    critico: boolean;
  }[];
  interpretacion_clinica?: string;
  recomendaciones?: string;
  requiere_seguimiento: boolean;
  fecha_resultado: string;
  validado_por: string;
}

// ==========================================
// CONSTANTES ÚTILES
// ==========================================
export const TIPOS_ESTUDIO: Record<TipoEstudio, string> = {
  'Laboratorio': 'Estudios de Laboratorio Clínico',
  'Imagen': 'Estudios de Imagen y Radiología',
  'Gabinete': 'Estudios de Gabinete',
  'Patología': 'Estudios Anatomopatológicos',
  'Microbiología': 'Estudios Microbiológicos',
  'Genética': 'Estudios Genéticos',
  'Funcional': 'Pruebas Funcionales',
  'Endoscopia': 'Estudios Endoscópicos',
  'Biopsia': 'Estudios de Biopsia'
};

export const CATEGORIAS_LABORATORIO: Record<CategoriaLaboratorio, string> = {
  'Hematología': 'Estudios de células sanguíneas',
  'Química Sanguínea': 'Análisis bioquímicos en sangre',
  'Inmunología': 'Estudios del sistema inmune',
  'Microbiología': 'Cultivos y antibiogramas',
  'Parasitología': 'Detección de parásitos',
  'Urianálisis': 'Análisis de orina',
  'Gasometría': 'Gases arteriales y venosos',
  'Hormonas': 'Perfil hormonal',
  'Marcadores Tumorales': 'Detección de cáncer',
  'Perfil Cardíaco': 'Enzimas cardíacas',
  'Perfil Hepático': 'Función hepática',
  'Perfil Renal': 'Función renal',
  'Perfil Lipídico': 'Lípidos y colesterol',
  'Coagulación': 'Pruebas de coagulación'
};

export const TIEMPOS_RESULTADO_ESTANDAR = {
  'URGENTE': 2,      // 2 horas
  'RUTINARIO': 24,   // 24 horas
  'ESPECIAL': 72,    // 3 días
  'GENETICO': 168    // 1 semana
};

// ==========================================
// GRUPOS DE ESTUDIOS MÁS COMUNES
// ==========================================
export const GRUPOS_ESTUDIOS_COMUNES = [
  {
    nombre: 'Perfil Básico',
    estudios: ['Biometría Hemática', 'Química Sanguínea', 'Examen General de Orina'],
    descripcion: 'Estudios básicos de rutina'
  },
  {
    nombre: 'Perfil Prequirúrgico',
    estudios: ['Biometría Hemática', 'TP/TPT', 'Química Sanguínea', 'Radiografía de Tórax', 'Electrocardiograma'],
    descripcion: 'Estudios preoperatorios estándar'
  },
  {
    nombre: 'Perfil Diabético',
    estudios: ['Glucosa', 'HbA1c', 'Química Sanguínea', 'Microalbuminuria'],
    descripcion: 'Seguimiento de diabetes mellitus'
  },
  {
    nombre: 'Perfil Cardiológico',
    estudios: ['Troponina I', 'CK-MB', 'LDH', 'Electrocardiograma', 'Radiografía de Tórax'],
    descripcion: 'Evaluación de síndrome coronario agudo'
  }
] as const;
