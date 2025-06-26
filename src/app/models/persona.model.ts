// src/app/models/persona.model.ts
import { BaseEntity, AuditInfo, Genero, EstadoCivil, BaseFilters } from './base.models';

// ==========================================
// INTERFACE PERSONA BASE
// ==========================================
export interface Persona extends BaseEntity, AuditInfo {
  id_persona: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  genero: Genero;
  estado_civil?: EstadoCivil;
  telefono?: string;
  telefono_emergencia?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  curp?: string;
  rfc?: string;
  numero_seguro_social?: string;
  activo: boolean;

  // Propiedades calculadas
  nombre_completo?: string;
  edad?: number;
}

// ==========================================
// FILTROS PARA BÚSQUEDAS DE PERSONAS
// ==========================================
export interface PersonaFilters extends BaseFilters {
  genero?: Genero;
  estado_civil?: EstadoCivil;
  edad_minima?: number;
  edad_maxima?: number;
  ciudad?: string;
  estado?: string;
  tiene_telefono?: boolean;
  tiene_email?: boolean;
}

// ==========================================
// DTOS PARA PERSONA
// ==========================================
export interface CreatePersonaDto {
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  genero: Genero;
  estado_civil?: EstadoCivil;
  telefono?: string;
  telefono_emergencia?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  curp?: string;
  rfc?: string;
  numero_seguro_social?: string;
  activo?: boolean;
}

export interface UpdatePersonaDto extends Partial<CreatePersonaDto> {
  id_persona: number;
}

// ==========================================
// ESTADÍSTICAS DE PERSONAS
// ==========================================
export interface EstadisticasPersonas {
  total_personas: number;
  personas_activas: number;
  distribución_genero: {
    masculino: number;
    femenino: number;
    otro: number;
  };
  distribución_edad: {
    menores_18: number;
    adultos_18_65: number;
    mayores_65: number;
  };
  personas_con_telefono: number;
  personas_con_email: number;
  nuevas_personas_mes: number;
}
