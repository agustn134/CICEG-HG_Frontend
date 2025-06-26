// src/app/models/paciente.model.ts
import { BaseEntity, AuditInfo, TipoSangreEnum, BaseFilters } from './base.models';
import { Persona } from './persona.model';

// ==========================================
// INTERFACE PACIENTE
// ==========================================
export interface Paciente extends BaseEntity, AuditInfo {
  id_paciente: number;
  id_persona: number;
  numero_expediente: string;
  tipo_sangre?: TipoSangreEnum;
  alergias?: string;
  enfermedades_cronicas?: string;
  medicamentos_actuales?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  observaciones_medicas?: string;
  seguro_medico?: string;
  numero_poliza?: string;
  activo: boolean;

  // Relación con persona
  persona?: Persona;

  // Estadísticas del paciente
  total_consultas?: number;
  ultima_consulta?: string;
  total_internamientos?: number;
  ultimo_internamiento?: string;
}

// ==========================================
// FILTROS PARA BÚSQUEDAS DE PACIENTES
// ==========================================
export interface PacienteFilters extends BaseFilters {
  tipo_sangre?: TipoSangreEnum;
  tiene_alergias?: boolean;
  tiene_enfermedades_cronicas?: boolean;
  seguro_medico?: string;
  fecha_ultima_consulta_inicio?: string;
  fecha_ultima_consulta_fin?: string;
  numero_expediente?: string;
}

// ==========================================
// DTOS PARA PACIENTE
// ==========================================
export interface CreatePacienteDto {
  id_persona?: number; // Si se crea persona junto con paciente
  persona?: any; // Datos de persona si se crea nueva
  tipo_sangre?: TipoSangreEnum;
  alergias?: string;
  enfermedades_cronicas?: string;
  medicamentos_actuales?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  observaciones_medicas?: string;
  seguro_medico?: string;
  numero_poliza?: string;
  activo?: boolean;
}

export interface UpdatePacienteDto extends Partial<Omit<CreatePacienteDto, 'id_persona' | 'persona'>> {
  id_paciente: number;
  persona?: any; // Para actualizar datos de persona
}

// ==========================================
// RESPUESTAS ESPECÍFICAS DE PACIENTE
// ==========================================
export interface PacienteCompleto extends Paciente {
  persona: Persona;
  expedientes?: any[]; // Se definirá en expedientes.models.ts
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
// ESTADÍSTICAS DE PACIENTES
// ==========================================
export interface EstadisticasPacientes {
  total_pacientes: number;
  pacientes_activos: number;
  distribución_tipo_sangre: Record<TipoSangreEnum, number>;
  pacientes_con_alergias: number;
  pacientes_con_enfermedades_cronicas: number;
  consultas_mes_actual: number;
  internamientos_activos: number;
  nuevos_pacientes_mes: number;
}
