// // src/app/models/signos-vitales.model.ts
// import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// // ==========================================
// // INTERFACE SIGNOS VITALES
// // ==========================================
// export interface SignosVitales extends BaseEntity, AuditInfo {
//   id_signos_vitales: number;
//   id_documento: number;
//   id_expediente: number;
//   id_internamiento?: number;
//   fecha_toma: string;
//   temperatura?: number;
//   presion_arterial_sistolica?: number;
//   presion_arterial_diastolica?: number;
//   frecuencia_cardiaca?: number;
//   frecuencia_respiratoria?: number;
//   saturacion_oxigeno?: number;
//   glucosa?: number;
//   peso?: number;
//   talla?: number;
//   imc?: number;
//   observaciones?: string;
//   registrado_por?: string;
//   especialidad_medico?: string;

//   // Campos calculados (flags para valores anormales)
//   temperatura_anormal?: boolean;
//   presion_anormal?: boolean;
//   fc_anormal?: boolean;
//   saturacion_anormal?: boolean;

//   // Información adicional del documento
//   fecha_documento?: string;
//   nombre_paciente?: string;
//   edad_paciente?: number;
//   numero_expediente?: string;
//   servicio?: string;
//   cama?: string;
// }

// // ==========================================
// // FILTROS PARA BÚSQUEDAS
// // ==========================================
// export interface SignosVitalesFilters extends BaseFilters {
//   id_expediente?: number;
//   id_internamiento?: number;
//   id_documento?: number;
//   fecha_inicio?: string;
//   fecha_fin?: string;
//   incluir_anormales?: boolean;
//   temperatura_min?: number;
//   temperatura_max?: number;
//   presion_sistolica_min?: number;
//   presion_sistolica_max?: number;
//   frecuencia_cardiaca_min?: number;
//   frecuencia_cardiaca_max?: number;
//   saturacion_min?: number;
//   saturacion_max?: number;
// }

// // ==========================================
// // DTOS PARA CREACIÓN Y ACTUALIZACIÓN
// // ==========================================
// export interface CreateSignosVitalesDto {
//   id_documento: number;
//   fecha_toma?: string; // Si no se proporciona, usa la fecha actual
//   temperatura?: number;
//   presion_arterial_sistolica?: number;
//   presion_arterial_diastolica?: number;
//   frecuencia_cardiaca?: number;
//   frecuencia_respiratoria?: number;
//   saturacion_oxigeno?: number;
//   glucosa?: number;
//   peso?: number;
//   talla?: number;
//   observaciones?: string;
// }

// export interface UpdateSignosVitalesDto extends Partial<CreateSignosVitalesDto> {
//   id_signos_vitales: number;
// }

// // ==========================================
// // INTERFACES PARA GRÁFICAS Y ANÁLISIS
// // ==========================================
// export interface Dataset {
//   label: string;
//   data: number[];
//   borderColor: string;
//   backgroundColor: string;
//   borderDash?: number[];
// }

// export interface GraficoSignosVitales {
//   labels: string[];
//   datasets: Dataset[];
// }

// export interface SignosVitalesCompleto extends SignosVitales {
//   // Información completa del paciente
//   nombre_completo: string;
//   edad: number;
//   genero: string;
//   numero_expediente: string;

//   // Información del internamiento
//   fecha_ingreso?: string;
//   servicio: string;
//   cama?: string;

//   // Información del registro
//   medico_responsable?: string;
//   especialidad?: string;
// }

// // ==========================================
// // INTERFACES PARA ANÁLISIS DE TENDENCIAS
// // ==========================================
// export interface TendenciaSignosVitales {
//   parametro: string;
//   valores: {
//     fecha: string;
//     valor: number;
//     estado: 'normal' | 'anormal' | 'critico';
//   }[];
//   promedio: number;
//   tendencia: 'estable' | 'mejorando' | 'empeorando';
//   ultimo_valor: number;
//   valores_anormales: number;
// }

// export interface ResumenSignosVitales {
//   periodo: string;
//   total_registros: number;
//   registros_con_anormalidades: number;
//   porcentaje_anormalidades: number;
//   parametros_mas_alterados: string[];
//   tendencias: TendenciaSignosVitales[];
// }

// // ==========================================
// // RANGOS NORMALES POR EDAD
// // ==========================================
// export interface RangosNormales {
//   temperatura: { min: number; max: number };
//   presion_sistolica: { min: number; max: number };
//   presion_diastolica: { min: number; max: number };
//   frecuencia_cardiaca: { min: number; max: number };
//   frecuencia_respiratoria: { min: number; max: number };
//   saturacion_oxigeno: { min: number; max: number };
// }

// // ==========================================
// // CONSTANTES PARA RANGOS NORMALES
// // ==========================================
// export const RANGOS_NORMALES_ADULTO: RangosNormales = {
//   temperatura: { min: 36.0, max: 37.5 },
//   presion_sistolica: { min: 90, max: 140 },
//   presion_diastolica: { min: 60, max: 90 },
//   frecuencia_cardiaca: { min: 60, max: 100 },
//   frecuencia_respiratoria: { min: 12, max: 20 },
//   saturacion_oxigeno: { min: 95, max: 100 }
// };

// export const RANGOS_NORMALES_PEDIATRICO: RangosNormales = {
//   temperatura: { min: 36.0, max: 37.5 },
//   presion_sistolica: { min: 80, max: 120 },
//   presion_diastolica: { min: 50, max: 80 },
//   frecuencia_cardiaca: { min: 80, max: 140 },
//   frecuencia_respiratoria: { min: 16, max: 30 },
//   saturacion_oxigeno: { min: 95, max: 100 }
// };


// src/app/models/signos-vitales.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// ==========================================
// INTERFACE SIGNOS VITALES (MAPEO DIRECTO CON BACKEND)
// ==========================================
export interface SignosVitales extends BaseEntity, AuditInfo {
  id_signos_vitales: number;
  id_documento: number;
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

  // Campos calculados por el backend (flags para valores anormales)
  temperatura_anormal?: boolean;
  presion_anormal?: boolean;
  fc_anormal?: boolean;
  saturacion_anormal?: boolean;
  glucosa_anormal?: boolean;

  // Información adicional del documento clínico
  fecha_elaboracion?: string;
  estado_documento?: string;

  // Información del expediente y paciente
  id_expediente?: number;
  numero_expediente?: string;
  nombre_paciente?: string;
  fecha_nacimiento?: string;
  edad?: number;
  sexo?: string;
  curp?: string;

  // Información del internamiento (si existe)
  id_internamiento?: number;
  fecha_ingreso?: string;
  motivo_ingreso?: string;
  servicio?: string;
  cama?: string;

  // Personal que registró
  registrado_por?: string;
  especialidad_medico?: string;
  numero_cedula?: string;
}

// ==========================================
// INTERFACE PARA VISTA COMPLETA (getSignosVitalesById)
// ==========================================
export interface SignosVitalesCompleto extends SignosVitales {
  // Información completa del paciente
  nombre_completo: string;
  edad_paciente: number;
  genero: string;

  // Información completa del internamiento
  fecha_ingreso_internamiento?: string;
  servicio_completo?: string;
  cama_detalle?: string;

  // Información completa del registro
  medico_responsable?: string;
  especialidad_completa?: string;
}

// ==========================================
// FILTROS PARA BÚSQUEDAS (ALINEADOS CON BACKEND)
// ==========================================
export interface SignosVitalesFilters extends BaseFilters {
  id_expediente?: number;
  id_internamiento?: number;
  id_documento?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  incluir_anormales?: boolean;

  // Filtros por rangos específicos
  temperatura_min?: number;
  temperatura_max?: number;
  presion_sistolica_min?: number;
  presion_sistolica_max?: number;
  frecuencia_cardiaca_min?: number;
  frecuencia_cardiaca_max?: number;
  saturacion_min?: number;
  saturacion_max?: number;

  // Paginación del backend
  limit?: number;
  offset?: number;
}

// ==========================================
// DTOS PARA CREACIÓN (ALINEADOS CON BACKEND)
// ==========================================
export interface CreateSignosVitalesDto {
  id_expediente: number; // Obligatorio
  id_internamiento?: number;
  id_medico_registra: number; // Obligatorio
  fecha_toma?: string; // Opcional, por defecto fecha actual
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

// ==========================================
// DTOS PARA ACTUALIZACIÓN
// ==========================================
export interface UpdateSignosVitalesDto {
  fecha_toma?: string;
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
  id_medico_modifica?: number;
}

// ==========================================
// DTO PARA ELIMINACIÓN
// ==========================================
export interface DeleteSignosVitalesDto {
  id_medico_elimina?: number;
  motivo_eliminacion?: string;
}

// ==========================================
// INTERFACES PARA GRÁFICAS Y ANÁLISIS
// ==========================================
export interface Dataset {
  label: string;
  data: (number | null)[];
  borderColor: string;
  backgroundColor: string;
  borderDash?: number[];
}

export interface GraficoSignosVitales {
  labels: string[];
  datasets: Dataset[];
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
// INTERFACE PARA ESTADÍSTICAS (DEL BACKEND)
// ==========================================
export interface EstadisticasSignosVitales {
  // Promedios
  temp_promedio?: number;
  pas_promedio?: number;
  pad_promedio?: number;
  fc_promedio?: number;
  sat_promedio?: number;
  glucosa_promedio?: number;

  // Máximos
  temp_maxima?: number;
  pas_maxima?: number;
  fc_maxima?: number;
  glucosa_maxima?: number;

  // Mínimos
  temp_minima?: number;
  pas_minima?: number;
  fc_minima?: number;
  sat_minima?: number;

  // Conteo de anormales
  temp_anormales?: number;
  hipertension_casos?: number;
  sat_baja_casos?: number;
}

// ==========================================
// INTERFACE PARA RESPUESTA DE HISTORIAL
// ==========================================
export interface HistorialSignosVitalesResponse {
  data: SignosVitales[];
  estadisticas: EstadisticasSignosVitales;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
  filtros_aplicados: {
    fecha_inicio?: string;
    fecha_fin?: string;
    tipo_signo?: string;
  };
}

// ==========================================
// INTERFACE PARA RESPUESTA DE GRÁFICA
// ==========================================
export interface GraficaSignosVitalesResponse {
  data: GraficoSignosVitales;
  registros: number;
  periodo: {
    dias: number;
    desde: string;
    hasta: string;
  };
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
  glucosa?: { min: number; max: number };
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
  saturacion_oxigeno: { min: 95, max: 100 },
  glucosa: { min: 70, max: 140 }
};

export const RANGOS_NORMALES_PEDIATRICO: RangosNormales = {
  temperatura: { min: 36.0, max: 37.5 },
  presion_sistolica: { min: 80, max: 120 },
  presion_diastolica: { min: 50, max: 80 },
  frecuencia_cardiaca: { min: 80, max: 140 },
  frecuencia_respiratoria: { min: 16, max: 30 },
  saturacion_oxigeno: { min: 95, max: 100 },
  glucosa: { min: 60, max: 120 }
};

export const RANGOS_NORMALES_NEONATO: RangosNormales = {
  temperatura: { min: 36.5, max: 37.5 },
  presion_sistolica: { min: 60, max: 90 },
  presion_diastolica: { min: 30, max: 60 },
  frecuencia_cardiaca: { min: 100, max: 160 },
  frecuencia_respiratoria: { min: 30, max: 60 },
  saturacion_oxigeno: { min: 95, max: 100 },
  glucosa: { min: 45, max: 100 }
};

// ==========================================
// TIPOS PARA FILTROS DE GRÁFICAS
// ==========================================
export type TipoSignoVital = 'todos' | 'temperatura' | 'presion' | 'frecuencia_cardiaca' | 'saturacion' | 'glucosa' | 'peso';

// ==========================================
// INTERFACE PARA ÚLTIMOS SIGNOS VITALES
// ==========================================
export interface UltimosSignosVitales extends SignosVitales {
  registrado_por: string;
  especialidad: string;

  // Flags adicionales de anormalidades
  temperatura_anormal: boolean;
  presion_anormal: boolean;
  fc_anormal: boolean;
  saturacion_anormal: boolean;
  glucosa_anormal: boolean;
}

// ==========================================
// INTERFACE PARA VALIDACIÓN DE SIGNOS VITALES
// ==========================================
export interface ValidacionSignosVitales {
  valido: boolean;
  errores: string[];
  advertencias: string[];
  valores_anormales: {
    parametro: string;
    valor: number;
    rango_normal: { min: number; max: number };
    nivel: 'leve' | 'moderado' | 'severo';
  }[];
}

// ==========================================
// COLORES PARA GRÁFICAS
// ==========================================
export const COLORES_GRAFICAS = {
  temperatura: {
    border: 'rgb(255, 99, 132)',
    background: 'rgba(255, 99, 132, 0.5)'
  },
  presion_sistolica: {
    border: 'rgb(54, 162, 235)',
    background: 'rgba(54, 162, 235, 0.5)'
  },
  presion_diastolica: {
    border: 'rgb(54, 162, 235)',
    background: 'rgba(54, 162, 235, 0.3)'
  },
  frecuencia_cardiaca: {
    border: 'rgb(255, 206, 86)',
    background: 'rgba(255, 206, 86, 0.5)'
  },
  saturacion_oxigeno: {
    border: 'rgb(75, 192, 192)',
    background: 'rgba(75, 192, 192, 0.5)'
  },
  glucosa: {
    border: 'rgb(153, 102, 255)',
    background: 'rgba(153, 102, 255, 0.5)'
  },
  peso: {
    border: 'rgb(255, 159, 64)',
    background: 'rgba(255, 159, 64, 0.5)'
  }
};
