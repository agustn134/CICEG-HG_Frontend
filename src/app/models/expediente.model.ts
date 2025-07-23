// src/app/models/expediente.model.ts
import { BaseEntity, AuditInfo, BaseFilters, Genero, EstadoDocumento, TipoEgreso } from './base.models';

// ==========================================
// INTERFACE PRINCIPAL EXPEDIENTE
// ==========================================
export interface Expediente extends BaseEntity, AuditInfo {
  id_expediente: number;
  id_paciente: number;
  numero_expediente: string;
  // 🆕 Número asignado manualmente por expedientes clínicos
  numero_expediente_administrativo?: string | null;  //   Ahora permite null
  fecha_apertura: string;
  estado: string; // 'Activo', 'Cerrado', 'Archivado', 'Suspendido', 'Eliminado'
  notas_administrativas?: string;

  // Información del paciente (cuando se hace join)
  nombre_paciente?: string;
  fecha_nacimiento?: string;
  sexo?: Genero;
  curp?: string;
  edad?: number;
  tipo_sangre?: string;

  // Estadísticas del expediente
  total_documentos?: number;
  documentos_activos?: number;
  documentos_mes_actual?: number;
  total_internamientos?: number;
  internamientos_activos?: number;
  ultimo_ingreso?: string;

  // Información de servicio actual
  servicio_actual?: string;
  cama_actual?: string;
  medico_responsable_actual?: string;
}

// ==========================================
// EXPEDIENTE COMPLETO CON TODA LA INFORMACIÓN
// ==========================================
export interface ExpedienteCompleto extends Expediente {
  // Datos completos del paciente
  alergias?: string;
  transfusiones?: string;
  detalles_transfusiones?: string;
  familiar_responsable?: string;
  parentesco_familiar?: string;
  telefono_familiar?: string;
  ocupacion?: string;
  escolaridad?: string;
  lugar_nacimiento?: string;

  // Datos completos de la persona
  id_persona: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono?: string;
  correo_electronico?: string;
  domicilio?: string;
  estado_civil?: string;
  religion?: string;

  // Información relacionada
  documentos_clinicos?: DocumentoClinicoResumen[];
  internamientos?: InternamientoResumen[];
  ultimos_signos_vitales?: SignosVitalesResumen[];
  requiere_validacion_reingreso?: boolean;
}

// ==========================================
// INTERFACES RELACIONADAS
// ==========================================
export interface DocumentoClinicoResumen {
  id_documento: number;
  fecha_elaboracion: string;
  estado: EstadoDocumento; // Usar el del base.models.ts
  tipo_documento: string;
  descripcion_tipo_documento?: string;
  medico_creador?: string;
  especialidad_medico?: string;
  subtipo_documento: string;
}

export interface InternamientoResumen {
  id_internamiento: number;
  fecha_ingreso: string;
  fecha_egreso?: string;
  motivo_ingreso: string;
  diagnostico_ingreso?: string;
  diagnostico_egreso?: string;
  tipo_egreso?: TipoEgreso; // Usar el del base.models.ts
  observaciones?: string;
  servicio?: string;
  cama?: string;
  area_cama?: string;
  subarea_cama?: string;
  medico_responsable?: string;
  especialidad_medico?: string;
  dias_estancia: number;
}

export interface SignosVitalesResumen {
  id_signos_vitales: number;
  fecha_toma: string;
  temperatura?: number;
  presion_arterial_sistolica?: number;
  presion_arterial_diastolica?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  saturacion_oxigeno?: number;
  glucosa?: number;
  peso?: number;
  talla?: number;
  imc?: number;
  observaciones?: string;
}

// ==========================================
// RESULTADOS DE BÚSQUEDA
// ==========================================
export interface ExpedienteBusqueda {
  id_expediente: number;
  numero_expediente: string;
  numero_expediente_administrativo?: string;  //   AGREGAR ESTE CAMPO
  fecha_apertura: string;
  estado: string;
  nombre_paciente: string;
  curp?: string;
  edad: number;
  sexo: Genero;
  internamiento_activo: number;
}

export interface ExpedientesPorPaciente {
  paciente: {
    id_paciente: number;
    nombre_completo: string;
  };
  expedientes: ExpedienteResumen[];
  total_expedientes: number;
}

export interface ExpedienteResumen {
  id_expediente: number;
  numero_expediente: string;
  numero_expediente_administrativo?: string;  //   AGREGAR ESTE CAMPO
  fecha_apertura: string;
  estado: string;
  notas_administrativas?: string;
  total_documentos: number;
  total_internamientos: number;
  internamientos_activos: number;
  ultima_actividad?: string;
  ultimo_ingreso?: string;
}

// ==========================================
// FILTROS Y DTOS
// ==========================================
export interface ExpedienteFilters extends BaseFilters {
  estado?: string | 'todos';
  fecha_inicio?: string;
  fecha_fin?: string;
  paciente_id?: number;
  tiene_internamiento_activo?: boolean;
  buscar?: string;
}

// export interface CreateExpedienteDto {
//   id_paciente: number;
//   numero_expediente?: string;
//   estado?: string;
//   notas_administrativas?: string;
//   crear_historia_clinica?: boolean;
//   id_medico_creador?: number;
// }
export interface CreateExpedienteDto {
  id_paciente: number;
  numero_expediente?: string;

  /**
   * Número administrativo de formato libre
   * - Opcional
   * - Entre 3 y 50 caracteres
   * - Permite: letras, números, guiones, puntos, espacios, guiones bajos, barras
   * - Ejemplos: "2025-001", "EXP-HG-001", "HG/001/2025", "A123", "EXPEDIENTE 001"
   */
  numero_expediente_administrativo?: string;

  fecha_apertura?: string;
  estado?: string;
  notas_administrativas?: string;
  crear_historia_clinica?: boolean;
  id_medico_creador?: number;
}
// export interface UpdateExpedienteDto {
//   estado?: string;
//   numero_expediente_administrativo?: string;  //   AGREGAR ESTE CAMPO
//   notas_administrativas?: string;
//   id_medico_modificador?: number;
// }
export interface UpdateExpedienteDto {
  estado?: string;
  numero_expediente_administrativo?: string | null;  //   CAMBIAR AQUÍ
  notas_administrativas?: string;
  id_medico_modificador?: number;
}

// ==========================================
// ENUMS ESPECÍFICOS DE EXPEDIENTE (SIN DUPLICAR)
// ==========================================
export enum TipoAlerta {
  CRITICA = 'CRITICA',
  ADVERTENCIA = 'ADVERTENCIA',
  INFORMATIVA = 'INFORMATIVA'
}

export enum EstadoAlerta {
  ACTIVA = 'ACTIVA',
  REVISADA = 'REVISADA',
  CERRADA = 'CERRADA'
}

export enum AccionAuditoria {
  CONSULTA = 'consulta',
  NUEVO_DOCUMENTO = 'nuevo_documento',
  ACTUALIZACION = 'actualizacion',
  ELIMINACION_LOGICA = 'eliminacion_logica',
  ELIMINACION_FISICA = 'eliminacion_fisica',
  VALIDACION_REINGRESO = 'validacion_reingreso',
  ACCESO_NEGADO = 'acceso_negado',
  NUEVO_EXPEDIENTE = 'nuevo_expediente'
}

// Resto de interfaces sin las duplicaciones...
export interface ValidacionAcceso {
  requiere_validacion: boolean;
  id_validacion?: number;
  acceso_inmediato: boolean;
}

export interface Alerta {
  id_alerta: number;
  tipo_alerta: TipoAlerta;
  mensaje: string;
  fecha_alerta: string;
  estado: EstadoAlerta;
  fecha_revision?: string;
  acciones_tomadas?: string;
  medico_generador?: string;
  medico_revisor?: string;
}

// ==========================================
// CONSTANTES
// ==========================================
export const ESTADOS_EXPEDIENTE_VALUES = {
  ACTIVO: 'Activo',
  CERRADO: 'Cerrado',
  ARCHIVADO: 'Archivado',
  SUSPENDIDO: 'Suspendido',
  ELIMINADO: 'Eliminado'
} as const;

export type EstadoExpediente = typeof ESTADOS_EXPEDIENTE_VALUES[keyof typeof ESTADOS_EXPEDIENTE_VALUES];
