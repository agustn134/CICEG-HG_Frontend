// src/app/models/shared/constantes-anestesia.ts

// 🔥 CONSTANTES COMPARTIDAS ENTRE NOTAS ANESTÉSICAS
export const CLASIFICACIONES_ASA = [
  'ASA I',
  'ASA II',
  'ASA III',
  'ASA IV',
  'ASA V',
  'ASA VI'
] as const;

export type ClasificacionASA = typeof CLASIFICACIONES_ASA[number];

// Constantes específicas para Escala Aldrete
export const ESCALA_ALDRETE_MAXIMA = 10;
export const ESCALA_ALDRETE_MINIMA_EGRESO = 8;

export const VALORES_ALDRETE = [0, 1, 2] as const;
export type ValorAldrete = typeof VALORES_ALDRETE[number];

// Tipos de anestesia comunes
export const TIPOS_ANESTESIA = [
  'General',
  'Regional',
  'Local',
  'Sedación',
  'Combinada'
] as const;

export type TipoAnestesia = typeof TIPOS_ANESTESIA[number];

// Estados de recuperación
export const ESTADOS_RECUPERACION = [
  'Satisfactoria',
  'Complicada',
  'En observación',
  'Transferido a UCI'
] as const;

export type EstadoRecuperacion = typeof ESTADOS_RECUPERACION[number];
