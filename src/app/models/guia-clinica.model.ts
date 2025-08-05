// src/app/models/guia-clinica.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface GuiaClinica extends BaseEntity, AuditInfo {
  id_guia_diagnostico: number;
  area?: string;
  codigo?: string;
  nombre: string;
  fuente?: string; // "IMSS", "ISSSTE", "SSA", "SS", "S", etc.
  fecha_actualizacion?: string;
  descripcion?: string;
  activo: boolean;
  
  // Campos calculados (agregados por el backend en algunos endpoints)
  total_historias_clinicas?: number;
  total_notas_urgencias?: number;
  total_notas_preoperatorias?: number;
  total_notas_egreso?: number;
}

export interface GuiaClinicaFilters extends BaseFilters {
  area?: string;
  fuente?: string;
  codigo?: string;
  buscar?: string;
  activo?: boolean;
}

export interface CreateGuiaClinicaDto {
  area?: string;
  codigo?: string;
  nombre: string;
  fuente?: string;
  fecha_actualizacion?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdateGuiaClinicaDto extends Partial<CreateGuiaClinicaDto> {
  id_guia_diagnostico: number;
}

// Estadísticas de guías clínicas
export interface EstadisticasGuiasClinicas {
  por_area_fuente: {
    area: string;
    fuente: string;
    total_guias: number;
    guias_activas: number;
  }[];
  resumen: {
    total_guias: number;
    guias_activas: number;
  };
}

// Constantes útiles basadas en tus datos existentes
export const AREAS_DISPONIBLES = [
  'Urgencias', 
  'GINECOLOGIA', 
  'Pediatría', 
  'Cirugía General', 
  'Medicina Interna', 
  'Cardiología', 
  'Neumología', 
  'Neurología',
  'Psiquiatría', 
  'Dermatología', 
  'Oftalmología', 
  'Otorrinolaringología',
  'Urología', 
  'Oncología', 
  'Endocrinología', 
  'Gastroenterología',
  'Nefrología', 
  'Hematología', 
  'Infectología', 
  'Traumatología'
];

export const FUENTES_DISPONIBLES = [
  'IMSS',
  'ISSSTE', 
  'SSA',
  'SS',
  'S',
  'NOM (Norma Oficial Mexicana)',
  'GPC (Guía de Práctica Clínica)',
  'CENETEC',
  'OMS',
  'Consenso Nacional',
  'Sociedad Médica',
  'Interno Hospital'
];