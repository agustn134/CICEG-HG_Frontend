// src/app/models/personal-medico.model.ts
import { BaseEntity, AuditInfo, BaseFilters, Genero } from './base.models';

// ==========================================
// INTERFACE PRINCIPAL PERSONAL MÉDICO
// ==========================================
export interface PersonalMedico extends BaseEntity, AuditInfo {
  id_personal_medico: number;
  id_persona: number;
  numero_cedula: string;
  especialidad: string;
  cargo?: string;
  departamento?: string;
  activo: boolean;
  foto?: string;

  // Información de la persona relacionada (cuando se hace join)
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  fecha_nacimiento?: string;
  sexo?: Genero;
  curp?: string;
  telefono?: string;
  correo_electronico?: string;
  domicilio?: string;
  estado_civil?: string;
  religion?: string;
  tipo_sangre?: string;

  // Campos calculados/estadísticos
  total_documentos_creados?: number;
  documentos_mes_actual?: number;
  nombre_completo?: string;
}

// ==========================================
// PERSONAL MÉDICO COMPLETO CON TODA LA INFORMACIÓN
// ==========================================
export interface PersonalMedicoCompleto extends PersonalMedico {
  documentos_activos: number;
  documentos_semana: number;
  documentos_mes: number;
  ultimos_documentos?: DocumentoMedico[];
}

// ==========================================
// DOCUMENTO MÉDICO PARA HISTORIAL
// ==========================================
export interface DocumentoMedico {
  id_documento: number;
  fecha_elaboracion: string;
  estado: string;
  tipo_documento: string;
  numero_expediente?: string;
  nombre_paciente?: string;
}

// ==========================================
// PERSONAL MÉDICO ACTIVO PARA SELECTS
// ==========================================
export interface PersonalMedicoActivo {
  id_personal_medico: number;
  numero_cedula: string;
  especialidad: string;
  cargo?: string;
  departamento?: string;
  nombre_completo: string;
    foto?: string; // 🆕 AGREGAR ESTA LÍNEA SI ES NECESARIA
}

// ==========================================
// FILTROS PARA BÚSQUEDAS DE PERSONAL MÉDICO
// ==========================================
export interface PersonalMedicoFilters extends BaseFilters {
  activo?: boolean;
  especialidad?: string;
  cargo?: string;
  departamento?: string;
  buscar?: string;
}

// ==========================================
// DTOS PARA PERSONAL MÉDICO
// ==========================================
export interface CreatePersonalMedicoDto {
  id_persona: number;
  numero_cedula: string;
  especialidad: string;
  cargo?: string;
  departamento?: string;
  activo?: boolean;
  foto?: string;
}

export interface UpdatePersonalMedicoDto {
  numero_cedula?: string;
  especialidad?: string;
  cargo?: string;
  departamento?: string;
  activo?: boolean;
  foto?: string;
}

// ==========================================
// ESTADÍSTICAS DE PERSONAL MÉDICO
// ==========================================
export interface EstadisticasPersonalMedico {
  por_especialidad_departamento: EspecialidadDepartamentoStats[];
  mas_productivos: PersonalMedicoProductivo[];
  resumen: ResumenPersonalMedico;
}

export interface EspecialidadDepartamentoStats {
  especialidad: string;
  departamento?: string;
  total_personal: number;
  personal_activo: number;
  total_documentos_creados: number;
  documentos_mes_actual: number;
}

export interface PersonalMedicoProductivo {
  id_personal_medico: number;
  numero_cedula: string;
  especialidad: string;
  nombre_completo: string;
  total_documentos: number;
  documentos_mes: number;
}

export interface ResumenPersonalMedico {
  total_personal_registrado: number;
  total_personal_activo: number;
  total_especialidades: number;
  total_departamentos: number;
}

// ==========================================
// VALIDACIONES Y UTILIDADES
// ==========================================
export interface PersonalMedicoValidation {
  cedula_valida: boolean;
  especialidad_valida: boolean;
  persona_asociada_valida: boolean;
  cedula_duplicada: boolean;
}

// ==========================================
// TIPOS UTILITARIOS ESPECÍFICOS
// ==========================================
export type PersonalMedicoCreacion = CreatePersonalMedicoDto;
export type PersonalMedicoActualizacion = UpdatePersonalMedicoDto;
export type PersonalMedicoLista = PersonalMedico;
export type PersonalMedicoDetalle = PersonalMedicoCompleto;

// ==========================================
// CONSTANTES RELACIONADAS
// ==========================================
export const ESPECIALIDADES_MEDICAS = [
  'Medicina General',
  'Medicina Interna',
  'Pediatría',
  'Ginecología y Obstetricia',
  'Cirugía General',
  'Anestesiología',
  'Radiología e Imagen',
  'Patología',
  'Medicina de Urgencias',
  'Cardiología',
  'Neurología',
  'Ortopedia y Traumatología',
  'Urología',
  'Oftalmología',
  'Otorrinolaringología',
  'Dermatología',
  'Psiquiatría',
  'Medicina Familiar',
  'Neumología',
  'Gastroenterología',
  'Endocrinología',
  'Nefrología',
  'Oncología',
  'Hematología',
  'Reumatología',
  'Infectología',
  'Geriatría',
  'Medicina del Trabajo',
  'Medicina Física y Rehabilitación',
  'Nutrición Clínica',
  'Psicología Clínica'
] as const;

export const CARGOS_MEDICOS = [
  'Médico Adscrito',
  'Médico Residente',
  'Médico Interno',
  'Médico Pasante',
  'Jefe de Servicio',
  'Subjefe de Servicio',
  'Coordinador Médico',
  'Director Médico',
  'Subdirector Médico',
  'Médico Especialista',
  'Médico General',
  'Médico de Base',
  'Médico de Guardia',
  'Médico Consultor',
  'Médico Interconsultante'
] as const;

export const DEPARTAMENTOS_HOSPITALARIOS = [
  'Urgencias',
  'Consulta Externa',
  'Hospitalización',
  'Cirugía',
  'Terapia Intensiva',
  'Pediatría',
  'Ginecología',
  'Medicina Interna',
  'Imagenología',
  'Laboratorio',
  'Patología',
  'Anestesiología',
  'Rehabilitación',
  'Psicología',
  'Nutrición',
  'Trabajo Social',
  'Administración',
  'Enseñanza e Investigación',
  'Calidad y Seguridad del Paciente',
  'Epidemiología'
] as const;

export const NIVELES_ACCESO_MEDICO = [
  { valor: 1, descripcion: 'Básico - Solo consulta' },
  { valor: 2, descripcion: 'Estándar - Consulta y documentos básicos' },
  { valor: 3, descripcion: 'Avanzado - Todas las funciones médicas' },
  { valor: 4, descripcion: 'Supervisor - Funciones administrativas' },
  { valor: 5, descripcion: 'Administrador - Control total del sistema' }
] as const;

export type EspecialidadMedica = typeof ESPECIALIDADES_MEDICAS[number];
export type CargoMedico = typeof CARGOS_MEDICOS[number];
export type DepartamentoHospitalario = typeof DEPARTAMENTOS_HOSPITALARIOS[number];

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

/**
 * Valida el formato de cédula profesional
 */
export function validarCedulaProfesional(cedula: string): boolean {
  if (!cedula) return false;

  // Eliminar espacios y convertir a mayúsculas
  const cedulaLimpia = cedula.replace(/\s/g, '').toUpperCase();

  // Validar longitud (típicamente 7-8 dígitos para México)
  if (cedulaLimpia.length < 6 || cedulaLimpia.length > 10) return false;

  // Validar que contenga solo números
  return /^\d+$/.test(cedulaLimpia);
}

/**
 * Formatea el nombre completo del personal médico
 */
export function formatearNombreCompletoMedico(medico: PersonalMedico): string {
  const partes = [
    medico.nombre,
    medico.apellido_paterno,
    medico.apellido_materno
  ].filter(Boolean);

  return partes.join(' ');
}

/**
 * Obtiene el título profesional basado en la especialidad
 */
export function obtenerTituloProfesional(especialidad: string): string {
  if (especialidad.toLowerCase().includes('medicina general') ||
      especialidad.toLowerCase().includes('medicina familiar')) {
    return 'Dr.';
  }

  if (especialidad.toLowerCase().includes('psicología')) {
    return 'Psic.';
  }

  if (especialidad.toLowerCase().includes('nutrición')) {
    return 'Nut.';
  }

  return 'Dr.'; // Por defecto para especialidades médicas
}

/**
 * Determina si un médico es especialista
 */
export function esEspecialista(medico: PersonalMedico): boolean {
  if (!medico.especialidad) return false;

  const especialidadesGenerales = [
    'medicina general',
    'medicina familiar',
    'médico general'
  ];

  return !especialidadesGenerales.some(esp =>
    medico.especialidad.toLowerCase().includes(esp)
  );
}

/**
 * Obtiene el nivel de experiencia basado en documentos creados
 */
export function obtenerNivelExperiencia(totalDocumentos: number): string {
  if (totalDocumentos >= 1000) return 'Senior';
  if (totalDocumentos >= 500) return 'Intermedio';
  if (totalDocumentos >= 100) return 'Junior';
  return 'Nuevo';
}
