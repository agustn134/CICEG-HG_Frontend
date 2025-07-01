// src/app/models/paciente.model.ts
import { BaseEntity, AuditInfo, BaseFilters, Genero } from './base.models';
import { ExpedienteResumen } from './expediente.model';

// ==========================================
// INTERFACE PRINCIPAL PACIENTE
// ==========================================
export interface Paciente extends BaseEntity, AuditInfo {
  id_paciente: number;
  id_persona: number;
  alergias?: string;
  transfusiones: boolean;
  detalles_transfusiones?: string;
  familiar_responsable?: string;
  parentesco_familiar?: string;
  telefono_familiar?: string;
  ocupacion?: string;
  escolaridad?: string;
  lugar_nacimiento?: string;

  // Información de la persona relacionada
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

  // Campos calculados
  edad?: number;
  total_expedientes?: number;
  expedientes_activos?: number;
  total_internamientos?: number;
  internamientos_activos?: number;
  nombre_completo?: string;
}

// ==========================================
// PACIENTE COMPLETO CON TODA LA INFORMACIÓN
// ==========================================
export interface PacienteCompleto extends Paciente {
  expedientes?: ExpedienteResumen[];
  ultimo_internamiento_info?: {
    fecha_ingreso: string;
    servicio: string;
    estado: string;
  };
  proxima_cita?: {
    fecha: string;
    medico: string;
    servicio: string;
  };
}

// ==========================================
// RESULTADO DE BÚSQUEDA DE PACIENTES
// ==========================================
export interface PacienteBusqueda {
  id_paciente: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  fecha_nacimiento: string;
  sexo: Genero;
  edad: number;
  nombre_completo: string;
}

// ==========================================
// FILTROS PARA BÚSQUEDAS DE PACIENTES
// ==========================================
export interface PacienteFilters extends BaseFilters {
  sexo?: Genero;
  edad_min?: number;
  edad_max?: number;
  tiene_alergias?: boolean;
  buscar?: string;
}

// ==========================================
// DTOS PARA PACIENTE
// ==========================================
export interface CreatePacienteDto {
  id_persona: number;
  alergias?: string;
  transfusiones?: boolean;
  detalles_transfusiones?: string;
  familiar_responsable?: string;
  parentesco_familiar?: string;
  telefono_familiar?: string;
  ocupacion?: string;
  escolaridad?: string;
  lugar_nacimiento?: string;
}

export interface UpdatePacienteDto {
  alergias?: string;
  transfusiones?: boolean;
  detalles_transfusiones?: string;
  familiar_responsable?: string;
  parentesco_familiar?: string;
  telefono_familiar?: string;
  ocupacion?: string;
  escolaridad?: string;
  lugar_nacimiento?: string;
}

// ==========================================
// ESTADÍSTICAS DE PACIENTES - SINCRONIZADA CON SERVICIO
// ==========================================
export interface EstadisticasPacientes {
  resumen: {
    total_pacientes: number;
    pacientes_masculinos: number;
    pacientes_femeninos: number;
    con_transfusiones: number;
    con_alergias: number;
    edad_promedio: number;
    consultas_mes_actual: number;
    pacientes_activos: number;
  };
  distribucion_por_edad: GrupoEdad[];
  distribucion_por_tipo_sangre: DistribucionTipoSangre[];
  pacientes_con_mas_expedientes: PacienteConExpedientes[];
}

export interface GrupoEdad {
  grupo_edad: string;
  total_pacientes: number;
  masculinos: number;
  femeninos: number;
}

export interface DistribucionTipoSangre {
  tipo_sangre: string;
  total_pacientes: number;
  masculinos: number;
  femeninos: number;
}

export interface PacienteConExpedientes {
  id_paciente: number;
  nombre_completo: string;
  curp: string;
  edad: number;
  total_expedientes: number;
  expedientes_activos: number;
}

// ==========================================
// HISTORIAL MÉDICO RESUMIDO
// ==========================================
export interface HistorialMedicoResumido {
  paciente: {
    id_paciente: number;
    nombre_completo: string;
  };
  expedientes: HistorialExpediente[];
  internamientos_recientes: HistorialInternamiento[];
}

export interface HistorialExpediente {
  id_expediente: number;
  numero_expediente: string;
  fecha_creacion: string;
  total_documentos: number;
  historias_clinicas: number;
  notas_urgencias: number;
  notas_evolucion: number;
  ultima_atencion?: string;
}

export interface HistorialInternamiento {
  id_internamiento: number;
  fecha_ingreso: string;
  fecha_egreso?: string;
  motivo_ingreso: string;
  diagnostico_ingreso: string;
  diagnostico_egreso?: string;
  servicio?: string;
  cama?: string;
  medico_responsable?: string;
}

// ==========================================
// VALIDACIONES Y UTILIDADES
// ==========================================
export interface PacienteValidation {
  id_persona_valido: boolean;
  alergias_formato_valido: boolean;
  familiar_datos_completos: boolean;
  transfusiones_coherente: boolean;
}

// ==========================================
// TIPOS UTILITARIOS ESPECÍFICOS
// ==========================================
export type PacienteCreacion = CreatePacienteDto;
export type PacienteActualizacion = UpdatePacienteDto;
export type PacienteLista = Paciente;
export type PacienteDetalle = PacienteCompleto;

// ==========================================
// CONSTANTES RELACIONADAS
// ==========================================
export const PARENTESCOS_FAMILIAR = [
  'Padre',
  'Madre',
  'Esposo(a)',
  'Hijo(a)',
  'Hermano(a)',
  'Abuelo(a)',
  'Tío(a)',
  'Primo(a)',
  'Amigo(a)',
  'Tutor Legal',
  'Otro'
] as const;

export const NIVELES_ESCOLARIDAD = [
  'Sin estudios',
  'Primaria incompleta',
  'Primaria completa',
  'Secundaria incompleta',
  'Secundaria completa',
  'Preparatoria incompleta',
  'Preparatoria completa',
  'Técnico',
  'Licenciatura incompleta',
  'Licenciatura completa',
  'Posgrado',
  'Otro'
] as const;

export const GRUPOS_EDAD = [
  'Menores (0-17)',
  'Adultos Jóvenes (18-39)',
  'Adultos (40-59)',
  'Adultos Mayores (60+)'
] as const;

export type ParentescoFamiliar = typeof PARENTESCOS_FAMILIAR[number];
export type NivelEscolaridad = typeof NIVELES_ESCOLARIDAD[number];
export type GrupoEdadTipo = typeof GRUPOS_EDAD[number];
