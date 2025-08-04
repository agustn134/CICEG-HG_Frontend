// src/app/models/base.models.ts

import { environment } from "../../environments/environments";

// ==========================================
// INTERFACES BASE PARA TODA LA APLICACIÓN
// ==========================================

export interface BaseEntity {
  id?: number;
}

export interface AuditInfo {
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// ENUMS PRINCIPALES
// ==========================================

export enum Genero {
  MASCULINO = 'M',
  FEMENINO = 'F',
  OTRO = 'O'
}

export enum EstadoCivil {
  SOLTERO = 'Soltero(a)',
  CASADO = 'Casado(a)',
  DIVORCIADO = 'Divorciado(a)',
  VIUDO = 'Viudo(a)',
  UNION_LIBRE = 'Unión libre',
  OTRO = 'Otro'
}

export enum TipoSangreEnum {
  A_POSITIVO = 'A+',
  A_NEGATIVO = 'A-',
  B_POSITIVO = 'B+',
  B_NEGATIVO = 'B-',
  AB_POSITIVO = 'AB+',
  AB_NEGATIVO = 'AB-',
  O_POSITIVO = 'O+',
  O_NEGATIVO = 'O-',
  DESCONOCIDO = 'Desconocido'
}

export enum NivelAcceso {
  ADMINISTRADOR = 'Administrador',
  SUPERVISOR = 'Supervisor',
  USUARIO = 'Usuario'
}

export enum Turno {
  MATUTINO = 'Matutino',
  VESPERTINO = 'Vespertino',
  NOCTURNO = 'Nocturno',
  JORNADA_ACUMULADA = 'Jornada Acumulada'
}

export enum EstadoDocumento {
  ACTIVO = 'Activo',
  CANCELADO = 'Cancelado',
  ANULADO = 'Anulado',
  BORRADOR = 'Borrador'
}

export enum EstadoCama {
  DISPONIBLE = 'Disponible',
  OCUPADA = 'Ocupada',
  MANTENIMIENTO = 'Mantenimiento',
  RESERVADA = 'Reservada',
  CONTAMINADA = 'Contaminada'
}

export enum TipoEgreso {
  ALTA_VOLUNTARIA = 'Alta voluntaria',
  MEJORIA = 'Mejoría',
  REFERENCIA = 'Referencia',
  DEFUNCION = 'Defunción',
  MAXIMO_BENEFICIO = 'Máximo beneficio'
}

// ==========================================
// INTERFACES PARA FILTROS
// ==========================================

export interface BaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  activo?: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ==========================================
// RESPUESTAS ESTÁNDAR DE LA API
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
  timestamp?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
  details?: any;
  timestamp: string;
}

// ==========================================
// INTERFACES PARA ESTADÍSTICAS
// ==========================================

export interface EstadisticasBase {
  total: number;
  activos: number;
  inactivos: number;
  nuevos_mes_actual: number;
  porcentaje_crecimiento: number;
}

// ==========================================
// TIPOS UTILITARIOS
// ==========================================

export type CreateDto<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
export type UpdateDto<T> = Partial<CreateDto<T>> & { id: number };

// ==========================================
// INTERFACES PARA VALIDACIÓN
// ==========================================

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ==========================================
// CONFIGURACIÓN GLOBAL
// ==========================================

export const API_CONFIG = {
  BASE_URL: environment.apiUrl,
  TIMEOUT: 30000,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
} as const;
