// src/app/models/signos-vitales.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// ==========================================
// INTERFACE SIGNOS VITALES
// ==========================================
export interface SignosVitales extends BaseEntity, AuditInfo {
  id_signos_vitales: number;
  id_documento: number;
  id_expediente: number;
  id_internamiento?: number;
  fecha_toma: string;
  temperatura?: number;
  presion_arterial_sistolica?: number;
  presion_arterial_diastolica?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  saturacion_oxigeno?: number;
  glucosa?: number;
  peso?: number;
  talla?: number;
  imc?: number;
  observaciones?: string;
  registrado_por?: string;
  especialidad_medico?: string;

  // Campos calculados (flags para valores anormales)
  temperatura_anormal?: boolean;
  presion_anormal?: boolean;
  fc_anormal?: boolean;
  saturacion_anormal?: boolean;

  // Información adicional del documento
  fecha_documento?: string;
  nombre_paciente?: string;
  edad_paciente?: number;
  numero_expediente?: string;
  servicio?: string;
  cama?: string;
}

// ==========================================
// FILTROS PARA BÚSQUEDAS
// ==========================================
export interface SignosVitalesFilters extends BaseFilters {
  id_expediente?: number;
  id_internamiento?: number;
  id_documento?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  incluir_anormales?: boolean;
  temperatura_min?: number;
  temperatura_max?: number;
  presion_sistolica_min?: number;
  presion_sistolica_max?: number;
  frecuencia_cardiaca_min?: number;
  frecuencia_cardiaca_max?: number;
  saturacion_min?: number;
  saturacion_max?: number;
}

// ==========================================
// DTOS PARA CREACIÓN Y ACTUALIZACIÓN
// ==========================================
export interface CreateSignosVitalesDto {
  id_documento: number;
  fecha_toma?: string; // Si no se proporciona, usa la fecha actual
  temperatura?: number;
  presion_arterial_sistolica?: number;
  presion_arterial_diastolica?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  saturacion_oxigeno?: number;
  glucosa?: number;
  peso?: number;
  talla?: number;
  observaciones?: string;
}

export interface UpdateSignosVitalesDto extends Partial<CreateSignosVitalesDto> {
  id_signos_vitales: number;
}

// ==========================================
// INTERFACES PARA GRÁFICAS Y ANÁLISIS
// ==========================================
export interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  borderDash?: number[];
}

export interface GraficoSignosVitales {
  labels: string[];
  datasets: Dataset[];
}

export interface SignosVitalesCompleto extends SignosVitales {
  // Información completa del paciente
  nombre_completo: string;
  edad: number;
  genero: string;
  numero_expediente: string;

  // Información del internamiento
  fecha_ingreso?: string;
  servicio: string;
  cama?: string;

  // Información del registro
  medico_responsable?: string;
  especialidad?: string;
}

// ==========================================
// INTERFACES PARA ANÁLISIS DE TENDENCIAS
// ==========================================
export interface TendenciaSignosVitales {
  parametro: string;
  valores: {
    fecha: string;
    valor: number;
    estado: 'normal' | 'anormal' | 'critico';
  }[];
  promedio: number;
  tendencia: 'estable' | 'mejorando' | 'empeorando';
  ultimo_valor: number;
  valores_anormales: number;
}

export interface ResumenSignosVitales {
  periodo: string;
  total_registros: number;
  registros_con_anormalidades: number;
  porcentaje_anormalidades: number;
  parametros_mas_alterados: string[];
  tendencias: TendenciaSignosVitales[];
}

// ==========================================
// RANGOS NORMALES POR EDAD
// ==========================================
export interface RangosNormales {
  temperatura: { min: number; max: number };
  presion_sistolica: { min: number; max: number };
  presion_diastolica: { min: number; max: number };
  frecuencia_cardiaca: { min: number; max: number };
  frecuencia_respiratoria: { min: number; max: number };
  saturacion_oxigeno: { min: number; max: number };
}

// ==========================================
// CONSTANTES PARA RANGOS NORMALES
// ==========================================
export const RANGOS_NORMALES_ADULTO: RangosNormales = {
  temperatura: { min: 36.0, max: 37.5 },
  presion_sistolica: { min: 90, max: 140 },
  presion_diastolica: { min: 60, max: 90 },
  frecuencia_cardiaca: { min: 60, max: 100 },
  frecuencia_respiratoria: { min: 12, max: 20 },
  saturacion_oxigeno: { min: 95, max: 100 }
};

export const RANGOS_NORMALES_PEDIATRICO: RangosNormales = {
  temperatura: { min: 36.0, max: 37.5 },
  presion_sistolica: { min: 80, max: 120 },
  presion_diastolica: { min: 50, max: 80 },
  frecuencia_cardiaca: { min: 80, max: 140 },
  frecuencia_respiratoria: { min: 16, max: 30 },
  saturacion_oxigeno: { min: 95, max: 100 }
};
