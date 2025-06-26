// src/app/models/nota-nutricion.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// ==========================================
// INTERFACE NOTA DE NUTRICIÓN
// ==========================================
export interface NotaNutricion extends BaseEntity, AuditInfo {
  id_nota_nutricion: number;
  id_documento: number;
  motivo_consulta: string;
  antecedentes_nutricionales?: string;
  habitos_alimentarios?: string;
  evaluacion_antropometrica?: string;
  evaluacion_bioquimica?: string;
  evaluacion_clinica?: string;
  diagnostico_nutricional?: string;
  plan_alimentario?: string;
  recomendaciones?: string;
  metas_nutricionales?: string;
  proxima_cita?: string;
  id_nutricionista?: number;

  // Información adicional del documento
  fecha_documento?: string;
  nombre_paciente?: string;
  edad_paciente?: number;
  nombre_nutricionista?: string;
}

// ==========================================
// FILTROS PARA BÚSQUEDAS
// ==========================================
export interface NotaNutricionFilters extends BaseFilters {
  id_nutricionista?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  tiene_plan_alimentario?: boolean;
  proxima_cita_programada?: boolean;
}

// ==========================================
// DTOS PARA CREACIÓN Y ACTUALIZACIÓN
// ==========================================
export interface CreateNotaNutricionDto {
  id_documento: number;
  motivo_consulta: string;
  antecedentes_nutricionales?: string;
  habitos_alimentarios?: string;
  evaluacion_antropometrica?: string;
  evaluacion_bioquimica?: string;
  evaluacion_clinica?: string;
  diagnostico_nutricional?: string;
  plan_alimentario?: string;
  recomendaciones?: string;
  metas_nutricionales?: string;
  proxima_cita?: string;
  id_nutricionista?: number;
}

export interface UpdateNotaNutricionDto extends Partial<CreateNotaNutricionDto> {
  id_nota_nutricion: number;
}
