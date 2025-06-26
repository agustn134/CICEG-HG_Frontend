// src/app/models/estado.enum.ts

// ==========================================
// ENUMS PARA ESTADOS DE DOCUMENTOS
// ==========================================
export enum EstadoDocumentoEnum {
  ACTIVO = 'Activo',
  CANCELADO = 'Cancelado',
  ANULADO = 'Anulado',
  BORRADOR = 'Borrador'
}

// ==========================================
// ENUMS PARA PRIORIDADES
// ==========================================
export enum PrioridadEstudioEnum {
  URGENTE = 'Urgente',
  NORMAL = 'Normal'
}

export enum PrioridadInterconsultaEnum {
  URGENTE = 'Urgente',
  ALTA = 'Alta',
  MEDIA = 'Media',
  BAJA = 'Baja'
}

// ==========================================
// ENUMS PARA ESTADOS DE SOLICITUDES
// ==========================================
export enum EstadoSolicitudEnum {
  SOLICITADO = 'Solicitado',
  PROGRAMADO = 'Programado',
  EN_PROCESO = 'En proceso',
  COMPLETADO = 'Completado',
  CANCELADO = 'Cancelado'
}

export enum EstadoInterconsultaEnum {
  PENDIENTE = 'Pendiente',
  EN_PROCESO = 'En Proceso',
  RESPONDIDA = 'Respondida'
}

// ==========================================
// ENUMS PARA TIPOS DE EGRESO
// ==========================================
export enum TipoEgresoEnum {
  ALTA_VOLUNTARIA = 'Alta voluntaria',
  MEJORIA = 'Mejoría',
  REFERENCIA = 'Referencia',
  DEFUNCION = 'Defunción',
  MAXIMO_BENEFICIO = 'Máximo beneficio',
  FUGA = 'Fuga'
}

// ==========================================
// ENUMS PARA ESTADOS DE INTERNAMIENTO
// ==========================================
export enum EstadoInternamientoEnum {
  HOSPITALIZADO = 'Hospitalizado',
  EGRESADO = 'Egresado',
  TRANSFERIDO = 'Transferido',
  DEFUNCION = 'Defunción'
}

// ==========================================
// ENUMS PARA DISPOSICIÓN DE PACIENTES
// ==========================================
export enum DisposicionPacienteEnum {
  ALTA = 'Alta',
  HOSPITALIZACION = 'Hospitalización',
  REFERENCIA = 'Referencia',
  OBSERVACION = 'Observación',
  DEFUNCION = 'Defunción'
}

// ==========================================
// ENUMS PARA TRIAGE
// ==========================================
export enum TriageCategoriaEnum {
  RESUCITACION = 'Resucitación',
  EMERGENCIA = 'Emergencia',
  URGENCIA = 'Urgencia',
  MENOS_URGENTE = 'Menos Urgente',
  NO_URGENTE = 'No Urgente'
}

// ==========================================
// ENUMS PARA CLASIFICACIONES MÉDICAS
// ==========================================
export enum ClasificacionASAEnum {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
  V = 'V',
  VI = 'VI'
}

export enum RiesgoQuirurgicoEnum {
  BAJO = 'Bajo',
  MODERADO = 'Moderado',
  ALTO = 'Alto',
  MUY_ALTO = 'Muy Alto'
}

// ==========================================
// ENUMS PARA URGENCIAS DE TRASLADO
// ==========================================
export enum UrgenciaTrasladoEnum {
  URGENTE = 'Urgente',
  PROGRAMADO = 'Programado',
  ELECTIVO = 'Electivo'
}

export enum MedioTransporteEnum {
  AMBULANCIA = 'Ambulancia',
  HELICOPTERO = 'Helicóptero',
  TERRESTRE = 'Terrestre',
  PARTICULAR = 'Particular'
}

// ==========================================
// ENUMS PARA TIPOS DE SERVICIO
// ==========================================
export enum TipoServicioEnum {
  HOSPITALIZACION = 'Hospitalización',
  CONSULTA_EXTERNA = 'Consulta Externa',
  QUIROFANO = 'Quirófano',
  URGENCIAS = 'Urgencias',
  DIAGNOSTICO = 'Diagnóstico'
}

// ==========================================
// ENUMS PARA CATEGORÍAS DE DOCUMENTOS
// ==========================================
export enum CategoriaDocumentoEnum {
  INGRESO = 'Ingreso',
  EVOLUCION = 'Evolución',
  EGRESO = 'Egreso',
  PROCEDIMIENTO = 'Procedimiento',
  CONSULTA = 'Consulta'
}

// ==========================================
// UTILIDADES PARA TRABAJAR CON ENUMS
// ==========================================
export class EnumUtils {
  /**
   * Convierte un enum a array de opciones para selects
   */
  static enumToOptions<T extends Record<string, string>>(enumObject: T): Array<{value: string, label: string}> {
    return Object.entries(enumObject).map(([key, value]) => ({
      value: value,
      label: value
    }));
  }

  /**
   * Obtiene todas las claves de un enum
   */
  static getEnumKeys<T extends Record<string, string>>(enumObject: T): string[] {
    return Object.keys(enumObject);
  }

  /**
   * Obtiene todos los valores de un enum
   */
  static getEnumValues<T extends Record<string, string>>(enumObject: T): string[] {
    return Object.values(enumObject);
  }

  /**
   * Valida si un valor existe en un enum
   */
  static isValidEnumValue<T extends Record<string, string>>(enumObject: T, value: string): boolean {
    return Object.values(enumObject).includes(value);
  }
}

// ==========================================
// CONSTANTES PARA COLORES DE ESTADOS
// ==========================================
export const COLORES_ESTADO_DOCUMENTO = {
  [EstadoDocumentoEnum.ACTIVO]: '#22c55e',     // Verde
  [EstadoDocumentoEnum.BORRADOR]: '#eab308',   // Amarillo
  [EstadoDocumentoEnum.CANCELADO]: '#ef4444',  // Rojo
  [EstadoDocumentoEnum.ANULADO]: '#6b7280'     // Gris
};

export const COLORES_PRIORIDAD = {
  [PrioridadEstudioEnum.URGENTE]: '#ef4444',   // Rojo
  [PrioridadEstudioEnum.NORMAL]: '#22c55e'     // Verde
};

export const COLORES_TRIAGE = {
  [TriageCategoriaEnum.RESUCITACION]: '#7f1d1d',    // Rojo oscuro
  [TriageCategoriaEnum.EMERGENCIA]: '#ef4444',      // Rojo
  [TriageCategoriaEnum.URGENCIA]: '#f97316',        // Naranja
  [TriageCategoriaEnum.MENOS_URGENTE]: '#eab308',   // Amarillo
  [TriageCategoriaEnum.NO_URGENTE]: '#22c55e'       // Verde
};
