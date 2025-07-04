// src/app/models/historia-clinica.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// ==========================================
// INTERFACE HISTORIA CLÍNICA (MAPEO DIRECTO CON BACKEND)
// ==========================================
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
  fecha_ultima_regla?: string;
  fecha_ultimo_parto?: string;
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

  // Impresión diagnóstica y plan
  impresion_diagnostica?: string;
  id_guia_diagnostico?: number;
  plan_diagnostico?: string;
  plan_terapeutico?: string;
  pronostico?: string;

  // Campos calculados que vienen del backend (para listados)
  id_expediente?: number;
  fecha_elaboracion?: string;
  estado_documento?: string;
  numero_expediente?: string;
  paciente_nombre?: string;
  fecha_nacimiento?: string;
  sexo?: string;
  curp?: string;
  numero_seguro_social?: string;
  medico_creador?: string;
  especialidad?: string;
  cedula_profesional?: string;
  guia_clinica_nombre?: string;
  guia_clinica_codigo?: string;
  guia_clinica_descripcion?: string;
}

// ==========================================
// INTERFACE PARA VISTA DETALLADA (getHistoriaClinicaById)
// ==========================================
export interface HistoriaClinicaDetallada extends HistoriaClinica {
  // Información completa del documento
  id_personal_creador?: number;

  // Información completa del paciente
  nombre_completo?: string;
  edad_paciente?: number;

  // Información completa de la guía clínica
  guia_clinica_completa?: {
    id_guia_diagnostico: number;
    nombre: string;
    codigo: string;
    descripcion: string;
    area: string;
    fuente: string;
    fecha_actualizacion: string;
  };
}

// ==========================================
// FILTROS PARA BÚSQUEDAS (ALINEADOS CON BACKEND)
// ==========================================
export interface HistoriaClinicaFilters extends BaseFilters {
  // Filtros del backend
  page?: number;
  limit?: number;
  id_documento?: number;
  id_expediente?: number;
  buscar?: string;
  fecha_inicio?: string;
  fecha_fin?: string;

  // Filtros adicionales del frontend
  con_antecedentes_familiares?: boolean;
  con_cirugias_previas?: boolean;
  con_alergias?: boolean;
  con_guia_clinica?: boolean;
  sexo_paciente?: string;
  medico_creador?: string;
}

// ==========================================
// DTOS PARA CREACIÓN (ALINEADOS CON BACKEND)
// ==========================================
export interface CreateHistoriaClinicaDto {
  id_documento: number; // Obligatorio
  antecedentes_heredo_familiares?: string;
  habitos_higienicos?: string;
  habitos_alimenticios?: string;
  actividad_fisica?: string;
  ocupacion?: string;
  vivienda?: string;
  toxicomanias?: string;
  menarca?: string;
  ritmo_menstrual?: string;
  inicio_vida_sexual?: string;
  fecha_ultima_regla?: string;
  fecha_ultimo_parto?: string;
  gestas?: number;
  partos?: number;
  cesareas?: number;
  abortos?: number;
  hijos_vivos?: number;
  metodo_planificacion?: string;
  enfermedades_infancia?: string;
  enfermedades_adulto?: string;
  cirugias_previas?: string;
  traumatismos?: string;
  alergias?: string;
  padecimiento_actual?: string;
  sintomas_generales?: string;
  aparatos_sistemas?: string;
  exploracion_general?: string;
  exploracion_cabeza?: string;
  exploracion_cuello?: string;
  exploracion_torax?: string;
  exploracion_abdomen?: string;
  exploracion_columna?: string;
  exploracion_extremidades?: string;
  exploracion_genitales?: string;
  impresion_diagnostica?: string;
  id_guia_diagnostico?: number;
  plan_diagnostico?: string;
  plan_terapeutico?: string;
  pronostico?: string;
}

// ==========================================
// DTOS PARA ACTUALIZACIÓN
// ==========================================
export interface UpdateHistoriaClinicaDto extends Partial<CreateHistoriaClinicaDto> {
  // Se actualiza por ID en la URL, no necesita id_historia_clinica en el body
}

// ==========================================
// INTERFACES PARA ESTADÍSTICAS (DEL BACKEND)
// ==========================================
export interface EstadisticasHistoriasClinicas {
  total: number;
  historiasRecientes: {
    fecha: string;
    cantidad: number;
  }[];
  guiasClinicasMasUsadas: {
    guia_clinica: string;
    codigo: string;
    cantidad: number;
  }[];
}

// ==========================================
// INTERFACE PARA RESPUESTA DE LISTADO
// ==========================================
export interface HistoriaClinicaListResponse {
  data: HistoriaClinica[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==========================================
// INTERFACE PARA VALIDACIÓN DE HISTORIA CLÍNICA
// ==========================================
export interface ValidacionHistoriaClinica {
  valido: boolean;
  errores: string[];
  advertencias: string[];
  secciones_incompletas: {
    seccion: string;
    campos_faltantes: string[];
    importancia: 'alta' | 'media' | 'baja';
  }[];
}

// ==========================================
// SECCIONES DE LA HISTORIA CLÍNICA
// ==========================================
export interface SeccionHistoriaClinica {
  id: string;
  nombre: string;
  campos: string[];
  obligatoria: boolean;
  aplicable_genero?: 'M' | 'F' | 'ambos';
  descripcion: string;
}

export const SECCIONES_HISTORIA_CLINICA: SeccionHistoriaClinica[] = [
  {
    id: 'antecedentes_heredo_familiares',
    nombre: 'Antecedentes Heredofamiliares',
    campos: ['antecedentes_heredo_familiares'],
    obligatoria: true,
    aplicable_genero: 'ambos',
    descripcion: 'Historia familiar de enfermedades'
  },
  {
    id: 'antecedentes_personales_no_patologicos',
    nombre: 'Antecedentes Personales No Patológicos',
    campos: ['habitos_higienicos', 'habitos_alimenticios', 'actividad_fisica', 'ocupacion', 'vivienda', 'toxicomanias'],
    obligatoria: true,
    aplicable_genero: 'ambos',
    descripcion: 'Hábitos y estilo de vida del paciente'
  },
  {
    id: 'antecedentes_ginecobstetricos',
    nombre: 'Antecedentes Ginecobstétricos',
    campos: ['menarca', 'ritmo_menstrual', 'inicio_vida_sexual', 'fecha_ultima_regla', 'fecha_ultimo_parto', 'gestas', 'partos', 'cesareas', 'abortos', 'hijos_vivos', 'metodo_planificacion'],
    obligatoria: false,
    aplicable_genero: 'F',
    descripcion: 'Historia ginecológica y obstétrica (solo mujeres)'
  },
  {
    id: 'antecedentes_personales_patologicos',
    nombre: 'Antecedentes Personales Patológicos',
    campos: ['enfermedades_infancia', 'enfermedades_adulto', 'cirugias_previas', 'traumatismos', 'alergias'],
    obligatoria: true,
    aplicable_genero: 'ambos',
    descripcion: 'Historia médica previa del paciente'
  },
  {
    id: 'padecimiento_actual',
    nombre: 'Padecimiento Actual',
    campos: ['padecimiento_actual', 'sintomas_generales', 'aparatos_sistemas'],
    obligatoria: true,
    aplicable_genero: 'ambos',
    descripcion: 'Motivo de consulta y síntomas actuales'
  },
  {
    id: 'exploracion_fisica',
    nombre: 'Exploración Física',
    campos: ['exploracion_general', 'exploracion_cabeza', 'exploracion_cuello', 'exploracion_torax', 'exploracion_abdomen', 'exploracion_columna', 'exploracion_extremidades', 'exploracion_genitales'],
    obligatoria: true,
    aplicable_genero: 'ambos',
    descripcion: 'Hallazgos de la exploración física'
  },
  {
    id: 'impresion_diagnostica',
    nombre: 'Impresión Diagnóstica y Plan',
    campos: ['impresion_diagnostica', 'plan_diagnostico', 'plan_terapeutico', 'pronostico'],
    obligatoria: true,
    aplicable_genero: 'ambos',
    descripcion: 'Diagnóstico y plan de manejo'
  }
];

// ==========================================
// TEMPLATES PARA DIFERENTES TIPOS DE HISTORIA CLÍNICA
// ==========================================
export interface TemplateHistoriaClinica {
  id: string;
  nombre: string;
  descripcion: string;
  secciones_incluidas: string[];
  campos_obligatorios: string[];
  aplicable_servicios?: string[];
}

export const TEMPLATES_HISTORIA_CLINICA: TemplateHistoriaClinica[] = [
  {
    id: 'general',
    nombre: 'Historia Clínica General',
    descripcion: 'Template estándar para medicina general',
    secciones_incluidas: ['antecedentes_heredo_familiares', 'antecedentes_personales_no_patologicos', 'antecedentes_personales_patologicos', 'padecimiento_actual', 'exploracion_fisica', 'impresion_diagnostica'],
    campos_obligatorios: ['padecimiento_actual', 'exploracion_general', 'impresion_diagnostica']
  },
  {
    id: 'ginecologia',
    nombre: 'Historia Clínica Ginecológica',
    descripcion: 'Template especializado para ginecología',
    secciones_incluidas: ['antecedentes_heredo_familiares', 'antecedentes_personales_no_patologicos', 'antecedentes_ginecobstetricos', 'antecedentes_personales_patologicos', 'padecimiento_actual', 'exploracion_fisica', 'impresion_diagnostica'],
    campos_obligatorios: ['padecimiento_actual', 'exploracion_general', 'exploracion_genitales', 'impresion_diagnostica', 'menarca', 'ritmo_menstrual'],
    aplicable_servicios: ['Ginecología', 'Obstetricia']
  },
  {
    id: 'pediatria',
    nombre: 'Historia Clínica Pediátrica',
    descripcion: 'Template especializado para pediatría',
    secciones_incluidas: ['antecedentes_heredo_familiares', 'antecedentes_personales_no_patologicos', 'antecedentes_personales_patologicos', 'padecimiento_actual', 'exploracion_fisica', 'impresion_diagnostica'],
    campos_obligatorios: ['padecimiento_actual', 'exploracion_general', 'impresion_diagnostica', 'antecedentes_heredo_familiares'],
    aplicable_servicios: ['Pediatría', 'Neonatología']
  },
  {
    id: 'urgencias',
    nombre: 'Historia Clínica de Urgencias',
    descripcion: 'Template simplificado para urgencias',
    secciones_incluidas: ['antecedentes_personales_patologicos', 'padecimiento_actual', 'exploracion_fisica', 'impresion_diagnostica'],
    campos_obligatorios: ['padecimiento_actual', 'exploracion_general', 'impresion_diagnostica', 'alergias'],
    aplicable_servicios: ['Urgencias', 'Triage']
  }
];

// ==========================================
// TIPOS PARA CAMPOS ESPECÍFICOS
// ==========================================
export type TipoPronostico = 'Excelente' | 'Bueno' | 'Regular' | 'Malo' | 'Grave' | 'Reservado';

export type MetodoPlanificacion =
  | 'Ninguno'
  | 'Preservativo'
  | 'Anticonceptivos orales'
  | 'DIU'
  | 'Implante subdérmico'
  | 'Inyección mensual'
  | 'Inyección trimestral'
  | 'Parche anticonceptivo'
  | 'Anillo vaginal'
  | 'Vasectomía'
  | 'Salpingoclasia'
  | 'Otro';

export type NivelActividad = 'Sedentario' | 'Ligero' | 'Moderado' | 'Intenso' | 'Muy intenso';

export type TipoVivienda = 'Casa propia' | 'Casa rentada' | 'Departamento' | 'Cuarto' | 'Otro';

// ==========================================
// CONSTANTES ÚTILES
// ==========================================
export const CAMPOS_OBLIGATORIOS_BASICOS = [
  'id_documento',
  'padecimiento_actual',
  'exploracion_general',
  'impresion_diagnostica'
];

export const CAMPOS_APLICABLES_MUJERES = [
  'menarca',
  'ritmo_menstrual',
  'inicio_vida_sexual',
  'fecha_ultima_regla',
  'fecha_ultimo_parto',
  'gestas',
  'partos',
  'cesareas',
  'abortos',
  'hijos_vivos',
  'metodo_planificacion'
];

export const CAMPOS_EXPLORACION_FISICA = [
  'exploracion_general',
  'exploracion_cabeza',
  'exploracion_cuello',
  'exploracion_torax',
  'exploracion_abdomen',
  'exploracion_columna',
  'exploracion_extremidades',
  'exploracion_genitales'
];

export const CAMPOS_PLAN_MANEJO = [
  'impresion_diagnostica',
  'plan_diagnostico',
  'plan_terapeutico',
  'pronostico'
];
