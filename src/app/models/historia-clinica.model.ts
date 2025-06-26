import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface HistoriaClinica extends BaseEntity, AuditInfo {
  id_historia_clinica: number;
  id_documento: number;

  // Antecedentes heredofamiliares
  antecedentes_heredo_familiares?: string;

  // Antecedentes personales no patológicos
  habitos_higienicos?: string;
  habitos_alimenticios?: string;
  actividad_fisica?: string;
  ocupacion?: string;
  vivienda?: string;
  toxicomanias?: string;

  // Antecedentes ginecobstétricos (para mujeres)
  menarca?: string;
  ritmo_menstrual?: string;
  inicio_vida_sexual?: string;
  fecha_ultima_regla?: string; // Cambié de Date a string
  fecha_ultimo_parto?: string; // Cambié de Date a string
  gestas?: number;
  partos?: number;
  cesareas?: number;
  abortos?: number;
  hijos_vivos?: number;
  metodo_planificacion?: string;

  // Antecedentes personales patológicos
  enfermedades_infancia?: string;
  enfermedades_adulto?: string;
  cirugias_previas?: string;
  traumatismos?: string;
  alergias?: string;
  hospitalizaciones_previas?: string;
  transfusiones?: string;

  // Padecimiento actual
  padecimiento_actual?: string;
  sintomas_generales?: string;
  aparatos_sistemas?: string;

  // Exploración física
  exploracion_general?: string;
  exploracion_cabeza?: string;
  exploracion_cuello?: string;
  exploracion_torax?: string;
  exploracion_abdomen?: string;
  exploracion_columna?: string;
  exploracion_extremidades?: string;
  exploracion_genitales?: string;
  exploracion_neurologica?: string;

  // Impresión diagnóstica y plan
  impresion_diagnostica?: string;
  plan_diagnostico?: string;
  plan_terapeutico?: string;
  pronostico?: string;

  // Información adicional del documento
  fecha_documento?: string;
  nombre_paciente?: string;
  edad_paciente?: number;
  medico_responsable?: string;
}

export interface HistoriaClinicaFilters extends BaseFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  con_antecedentes_familiares?: boolean;
  con_cirugias_previas?: boolean;
  con_alergias?: boolean;
}

export interface CreateHistoriaClinicaDto {
  id_documento: number;
  antecedentes_heredo_familiares?: string;
  habitos_higienicos?: string;
  padecimiento_actual?: string;
  exploracion_general?: string;
  impresion_diagnostica?: string;
  plan_diagnostico?: string;
  plan_terapeutico?: string;
  pronostico?: string;
  // ... resto de campos opcionales
}

export interface UpdateHistoriaClinicaDto extends Partial<CreateHistoriaClinicaDto> {
  id_historia_clinica: number;
}
