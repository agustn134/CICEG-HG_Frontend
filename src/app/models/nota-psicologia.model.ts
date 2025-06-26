// src/app/models/nota-psicologia.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// ==========================================
// INTERFACE NOTA DE PSICOLOGÍA
// ==========================================
export interface NotaPsicologia extends BaseEntity, AuditInfo {
  id_nota_psicologia: number;
  id_documento: number;
  motivo_consulta: string;
  historia_problema?: string;
  antecedentes_psicologicos?: string;
  estado_mental?: string;
  pruebas_aplicadas?: string;
  impresion_diagnostica?: string;
  plan_tratamiento?: string;
  recomendaciones?: string;
  proxima_cita?: string;
  id_psicologo?: number;

  // Información adicional del documento
  fecha_documento?: string;
  nombre_paciente?: string;
  edad_paciente?: number;
  nombre_psicologo?: string;
}

// ==========================================
// FILTROS PARA BÚSQUEDAS
// ==========================================
export interface NotaPsicologiaFilters extends BaseFilters {
  id_psicologo?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  tiene_plan_tratamiento?: boolean;
  proxima_cita_programada?: boolean;
}

// ==========================================
// DTOS PARA CREACIÓN Y ACTUALIZACIÓN
// ==========================================
export interface CreateNotaPsicologiaDto {
  id_documento: number;
  motivo_consulta: string;
  historia_problema?: string;
  antecedentes_psicologicos?: string;
  estado_mental?: string;
  pruebas_aplicadas?: string;
  impresion_diagnostica?: string;
  plan_tratamiento?: string;
  recomendaciones?: string;
  proxima_cita?: string;
  id_psicologo?: number;
}

export interface UpdateNotaPsicologiaDto extends Partial<CreateNotaPsicologiaDto> {
  id_nota_psicologia: number;
}
