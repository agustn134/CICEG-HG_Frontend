// src/app/models/internamiento.model.ts
import { BaseEntity, AuditInfo, BaseFilters, TipoEgreso } from './base.models';

// ==========================================
// INTERFACE INTERNAMIENTO (MAPEO DIRECTO CON BACKEND)
// ==========================================
export interface Internamiento extends BaseEntity, AuditInfo {
  id_internamiento: number;
  id_expediente: number;
  id_cama?: number; // Puede ser null
  id_servicio?: number; // Puede ser null
  fecha_ingreso: string;
  fecha_egreso?: string;
  motivo_ingreso: string;
  diagnostico_ingreso?: string;
  diagnostico_egreso?: string;
  tipo_egreso?: TipoEgreso;
  id_medico_responsable?: number;
  observaciones?: string;

  // Campos calculados que vienen del backend (para listados)
  numero_expediente?: string;
  estado_expediente?: string;
  nombre_paciente?: string;
  fecha_nacimiento?: string;
  sexo?: string;
  curp?: string;
  edad?: number;

  // Información del servicio y cama
  servicio?: string;
  id_cama_info?: number;
  cama?: string;
  area_cama?: string;
  subarea_cama?: string;
  estado_cama?: string;

  // Médico responsable
  medico_responsable?: string;
  especialidad?: string;
  cargo?: string;

  // Cálculos de estancia
  dias_estancia?: number;
  estado_internamiento?: 'Activo' | 'Egresado';

  // Documentos y estadísticas
  total_documentos?: number;
  total_documentos_internamiento?: number;
  ultima_actividad?: string;
}

// ==========================================
// INTERFACE PARA VISTA DETALLADA (getInternamientoById)
// ==========================================
export interface InternamientoDetallado extends Internamiento {
  // Datos completos del paciente
  id_paciente?: number;
  alergias?: string;
  transfusiones?: string;
  familiar_responsable?: string;
  telefono_familiar?: string;
  telefono?: string;
  domicilio?: string;
  tipo_sangre?: string;

  // Servicio completo
  descripcion_servicio?: string;

  // Médico completo
  numero_cedula?: string;
  departamento?: string;

  // Documentos relacionados
  documentos_clinicos?: DocumentoClinicoResumen[];
  signos_vitales?: SignosVitalesResumen[];
  prescripciones?: PrescripcionResumen[];
  historial_camas?: HistorialCamaResumen[];
}

// ==========================================
// INTERFACES AUXILIARES
// ==========================================
export interface DocumentoClinicoResumen {
  id_documento: number;
  fecha_elaboracion: string;
  estado: string;
  tipo_documento: string;
  medico_creador?: string;
  especialidad_creador?: string;
  subtipo_documento?: string;
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

export interface PrescripcionResumen {
  id_prescripcion: number;
  dosis: string;
  via_administracion: string;
  frecuencia: string;
  duracion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  indicaciones_especiales?: string;
  activo: boolean;
  medicamento: string;
  presentacion?: string;
  concentracion?: string;
  grupo_terapeutico?: string;
}

export interface HistorialCamaResumen {
  cama: string;
  area: string;
  subarea?: string;
  servicio: string;
  tipo_registro: string;
}

// ==========================================
// FILTROS PARA BÚSQUEDAS (ALINEADOS CON BACKEND)
// ==========================================
export interface InternamientoFilters extends BaseFilters {
  // Filtros principales
  activos_solo?: boolean;
  servicio_id?: number;
  medico_responsable_id?: number;
  fecha_inicio?: string; // fecha_inicio para fecha_ingreso
  fecha_fin?: string; // fecha_fin para fecha_ingreso
  tipo_egreso?: TipoEgreso;
  buscar?: string; // Búsqueda general

  // Paginación (del backend)
  limit?: number;
  offset?: number;
}

// ==========================================
// DTOS PARA CREACIÓN (alineados con backend)
// ==========================================
export interface CreateInternamientoDto {
  id_expediente: number;
  id_servicio?: number;
  id_cama?: number;
  motivo_ingreso: string;
  diagnostico_ingreso?: string;
  id_medico_responsable: number; // Obligatorio en backend
  observaciones?: string;
  fecha_ingreso?: string; // Opcional, por defecto new Date()
  crear_nota_ingreso?: boolean; // Opcional, por defecto true
}

// ==========================================
// DTOS PARA ACTUALIZACIÓN
// ==========================================
export interface UpdateInternamientoDto {
  id_servicio?: number;
  id_cama?: number;
  motivo_ingreso?: string;
  diagnostico_ingreso?: string;
  diagnostico_egreso?: string;
  id_medico_responsable?: number;
  observaciones?: string;
  id_medico_modificador?: number;
}

// ==========================================
// DTO PARA EGRESO DE PACIENTE
// ==========================================
export interface EgresarPacienteDto {
  fecha_egreso?: string; // Opcional, por defecto new Date()
  diagnostico_egreso: string; // Obligatorio
  tipo_egreso: TipoEgreso; // Obligatorio
  observaciones?: string;
  id_medico_egreso: number; // Obligatorio
  crear_nota_egreso?: boolean; // Opcional, por defecto true
}

// ==========================================
// DTO PARA TRANSFERENCIA DE PACIENTE
// ==========================================
export interface TransferirPacienteDto {
  nuevo_servicio_id?: number;
  nueva_cama_id?: number;
  motivo_transferencia: string; // Obligatorio
  nuevo_medico_responsable_id?: number;
  id_medico_autorizante: number; // Obligatorio
  observaciones?: string;
}

// ==========================================
// INTERFACES PARA DASHBOARDS Y ESTADÍSTICAS
// ==========================================
export interface DashboardInternamientos {
  estadisticas: EstadisticasInternamientos;
  ocupacion_por_servicio: OcupacionServicio[];
  estancias_prolongadas: InternamientoProlongado[];
  actividad_reciente: ActividadReciente[];
}

export interface EstadisticasInternamientos {
  total_internamientos_historicos: number;
  internamientos_activos: number;
  internamientos_egresados: number;
  ingresos_mes_actual: number;
  egresos_mes_actual: number;
  ingresos_hoy: number;
  egresos_hoy: number;
  promedio_estancia_dias: number;
}

export interface OcupacionServicio {
  id_servicio: number;
  servicio: string;
  total_camas: number;
  camas_ocupadas: number;
  camas_disponibles: number;
  pacientes_actuales: number;
  porcentaje_ocupacion: number;
}

export interface InternamientoProlongado {
  id_internamiento: number;
  numero_expediente: string;
  nombre_paciente: string;
  fecha_ingreso: string;
  motivo_ingreso: string;
  servicio?: string;
  cama?: string;
  medico_responsable?: string;
  dias_estancia: number;
}

export interface ActividadReciente {
  tipo_actividad: 'Ingreso' | 'Egreso';
  fecha_actividad: string;
  numero_expediente: string;
  nombre_paciente: string;
  detalle: string;
  servicio?: string;
  cama?: string;
}

// ==========================================
// INTERFACE PARA BÚSQUEDA AUTOCOMPLETE
// ==========================================
export interface InternamientoBusqueda {
  id_internamiento: number;
  fecha_ingreso: string;
  fecha_egreso?: string;
  motivo_ingreso: string;
  numero_expediente: string;
  nombre_paciente: string;
  curp?: string;
  servicio?: string;
  cama?: string;
  estado_internamiento: 'Activo' | 'Egresado';
}

// ==========================================
// INTERFACE PARA HISTORIAL DE PACIENTE
// ==========================================
export interface HistorialInternamientosPaciente {
  paciente: {
    id_paciente: number;
    nombre_completo: string;
  };
  estadisticas: {
    total_internamientos: number;
    internamientos_activos: number;
    internamientos_completados: number;
    promedio_estancia: number;
    ultimo_ingreso?: string;
    ultimo_egreso?: string;
  };
  internamientos: Internamiento[];
}
