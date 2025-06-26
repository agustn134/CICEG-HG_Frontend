// src/app/models/tipo-sangre.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// ==========================================
// INTERFACE TIPO DE SANGRE
// ==========================================
export interface TipoSangre extends BaseEntity, AuditInfo {
  id_tipo_sangre: number;
  nombre: string; // A+, A-, B+, B-, AB+, AB-, O+, O-
  descripcion?: string;
  activo?: boolean;

  // Propiedades calculadas/adicionales
  factor_rh?: 'Positivo' | 'Negativo';
  grupo_abo?: 'A' | 'B' | 'AB' | 'O';
  es_donador_universal?: boolean;
  es_receptor_universal?: boolean;
  total_pacientes?: number; // Cuántos pacientes tienen este tipo
}

// ==========================================
// FILTROS PARA BÚSQUEDAS
// ==========================================
export interface TipoSangreFilters extends BaseFilters {
  grupo_abo?: 'A' | 'B' | 'AB' | 'O';
  factor_rh?: 'Positivo' | 'Negativo';
  compatible_donacion?: string; // Buscar tipos compatibles para donación
  compatible_recepcion?: string; // Buscar tipos compatibles para recepción
}

// ==========================================
// DTOS PARA CREACIÓN Y ACTUALIZACIÓN
// ==========================================
export interface CreateTipoSangreDto {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdateTipoSangreDto extends Partial<CreateTipoSangreDto> {
  id_tipo_sangre: number;
}

// ==========================================
// INTERFACES PARA COMPATIBILIDAD SANGUÍNEA
// ==========================================
export interface CompatibilidadSanguinea {
  tipo_sangre: string;
  puede_donar_a: string[];
  puede_recibir_de: string[];
  factor_rh: 'Positivo' | 'Negativo';
  grupo_abo: 'A' | 'B' | 'AB' | 'O';
  caracteristicas: string[];
}

export interface TransfusionInfo {
  tipo_donador: string;
  tipo_receptor: string;
  es_compatible: boolean;
  riesgo: 'Bajo' | 'Moderado' | 'Alto' | 'Prohibido';
  observaciones?: string;
}

// ==========================================
// ESTADÍSTICAS DE TIPOS DE SANGRE
// ==========================================
export interface EstadisticasTiposSangre {
  total_tipos: number;
  distribución_poblacion: {
    tipo: string;
    cantidad: number;
    porcentaje: number;
    frecuencia_regional: number;
  }[];

  // Compatibilidad más común
  donaciones_mas_comunes: {
    tipo_donador: string;
    tipo_receptor: string;
    frecuencia: number;
  }[];

  // Tipos más escasos
  tipos_escasos: {
    tipo: string;
    porcentaje_poblacion: number;
    nivel_escasez: 'Común' | 'Poco Común' | 'Raro' | 'Muy Raro';
  }[];

  // Demanda vs disponibilidad
  demanda_vs_disponibilidad: {
    tipo: string;
    demanda_mensual: number;
    disponibilidad_promedio: number;
    deficit_superavit: number;
  }[];
}

// ==========================================
// RESPUESTAS ESPECÍFICAS
// ==========================================
export interface TipoSangreCompleto extends TipoSangre {
  compatibilidad: CompatibilidadSanguinea;
  estadisticas_uso: {
    total_pacientes: number;
    transfusiones_mes: number;
    donaciones_mes: number;
    stock_actual?: number;
  };
  pacientes_recientes: {
    id_paciente: number;
    nombre_completo: string;
    numero_expediente: string;
    fecha_registro: string;
  }[];
}

// ==========================================
// CONSTANTES DE COMPATIBILIDAD SANGUÍNEA
// ==========================================
export const TIPOS_SANGRE_SISTEMA_ABO: Record<string, CompatibilidadSanguinea> = {
  'O-': {
    tipo_sangre: 'O-',
    puede_donar_a: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    puede_recibir_de: ['O-'],
    factor_rh: 'Negativo',
    grupo_abo: 'O',
    caracteristicas: ['Donador universal', 'Solo recibe de O-', 'Muy valioso']
  },
  'O+': {
    tipo_sangre: 'O+',
    puede_donar_a: ['O+', 'A+', 'B+', 'AB+'],
    puede_recibir_de: ['O-', 'O+'],
    factor_rh: 'Positivo',
    grupo_abo: 'O',
    caracteristicas: ['Más común', 'Donador para Rh+', 'Recibe de O']
  },
  'A-': {
    tipo_sangre: 'A-',
    puede_donar_a: ['A-', 'A+', 'AB-', 'AB+'],
    puede_recibir_de: ['O-', 'A-'],
    factor_rh: 'Negativo',
    grupo_abo: 'A',
    caracteristicas: ['Donador para A y AB', 'Recibe de O- y A-']
  },
  'A+': {
    tipo_sangre: 'A+',
    puede_donar_a: ['A+', 'AB+'],
    puede_recibir_de: ['O-', 'O+', 'A-', 'A+'],
    factor_rh: 'Positivo',
    grupo_abo: 'A',
    caracteristicas: ['Segundo más común', 'Recibe de O y A']
  },
  'B-': {
    tipo_sangre: 'B-',
    puede_donar_a: ['B-', 'B+', 'AB-', 'AB+'],
    puede_recibir_de: ['O-', 'B-'],
    factor_rh: 'Negativo',
    grupo_abo: 'B',
    caracteristicas: ['Donador para B y AB', 'Recibe de O- y B-']
  },
  'B+': {
    tipo_sangre: 'B+',
    puede_donar_a: ['B+', 'AB+'],
    puede_recibir_de: ['O-', 'O+', 'B-', 'B+'],
    factor_rh: 'Positivo',
    grupo_abo: 'B',
    caracteristicas: ['Donador para B+ y AB+', 'Recibe de O y B']
  },
  'AB-': {
    tipo_sangre: 'AB-',
    puede_donar_a: ['AB-', 'AB+'],
    puede_recibir_de: ['O-', 'A-', 'B-', 'AB-'],
    factor_rh: 'Negativo',
    grupo_abo: 'AB',
    caracteristicas: ['Receptor de todos los Rh-', 'Solo dona a AB']
  },
  'AB+': {
    tipo_sangre: 'AB+',
    puede_donar_a: ['AB+'],
    puede_recibir_de: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    factor_rh: 'Positivo',
    grupo_abo: 'AB',
    caracteristicas: ['Receptor universal', 'Solo dona a AB+', 'Recibe de todos']
  }
};

// ==========================================
// FRECUENCIAS POBLACIONALES (México)
// ==========================================
export const FRECUENCIAS_POBLACIONALES_MEXICO = {
  'O+': 85.0,  // 85% de la población
  'A+': 8.0,   // 8% de la población
  'B+': 4.0,   // 4% de la población
  'AB+': 1.0,  // 1% de la población
  'O-': 1.5,   // 1.5% de la población
  'A-': 0.3,   // 0.3% de la población
  'B-': 0.15,  // 0.15% de la población
  'AB-': 0.05  // 0.05% de la población
};

// ==========================================
// UTILIDADES PARA TRABAJAR CON TIPOS DE SANGRE
// ==========================================
export class TipoSangreUtil {
  static esCompatibleDonacion(donador: string, receptor: string): boolean {
    const infoCompatibilidad = TIPOS_SANGRE_SISTEMA_ABO[donador];
    return infoCompatibilidad?.puede_donar_a.includes(receptor) || false;
  }

  static obtenerCompatibilidadCompleta(tipo: string): CompatibilidadSanguinea | null {
    return TIPOS_SANGRE_SISTEMA_ABO[tipo] || null;
  }

  static obtenerFactorRh(tipo: string): 'Positivo' | 'Negativo' | null {
    return tipo.includes('+') ? 'Positivo' :
           tipo.includes('-') ? 'Negativo' : null;
  }

  static obtenerGrupoABO(tipo: string): 'A' | 'B' | 'AB' | 'O' | null {
    if (tipo.startsWith('A') && !tipo.startsWith('AB')) return 'A';
    if (tipo.startsWith('B')) return 'B';
    if (tipo.startsWith('AB')) return 'AB';
    if (tipo.startsWith('O')) return 'O';
    return null;
  }

  static esDonadorUniversal(tipo: string): boolean {
    return tipo === 'O-';
  }

  static esReceptorUniversal(tipo: string): boolean {
    return tipo === 'AB+';
  }

  static obtenerRiesgoTransfusion(donador: string, receptor: string): TransfusionInfo {
    const esCompatible = this.esCompatibleDonacion(donador, receptor);

    return {
      tipo_donador: donador,
      tipo_receptor: receptor,
      es_compatible: esCompatible,
      riesgo: esCompatible ? 'Bajo' : 'Prohibido',
      observaciones: esCompatible
        ? 'Transfusión compatible según sistema ABO/Rh'
        : 'INCOMPATIBLE: Riesgo de reacción hemolítica grave'
    };
  }
}
