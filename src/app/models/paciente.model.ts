// // src/app/models/paciente.model.ts
// import { BaseEntity, AuditInfo, TipoSangreEnum, BaseFilters } from './base.models';
// import { Persona } from './persona.model';

// // ==========================================
// // INTERFACE PACIENTE
// // ==========================================
// export interface Paciente extends BaseEntity, AuditInfo {
//   id_paciente: number;
//   id_persona: number;
//   numero_expediente: string;
//   tipo_sangre?: TipoSangreEnum;
//   alergias?: string;
//   enfermedades_cronicas?: string;
//   medicamentos_actuales?: string;
//   contacto_emergencia_nombre?: string;
//   contacto_emergencia_telefono?: string;
//   contacto_emergencia_relacion?: string;
//   observaciones_medicas?: string;
//   seguro_medico?: string;
//   numero_poliza?: string;
//   activo: boolean;

//   // Relación con persona
//   persona?: Persona;

//   // Estadísticas del paciente
//   total_consultas?: number;
//   ultima_consulta?: string;
//   total_internamientos?: number;
//   ultimo_internamiento?: string;
// }

// // ==========================================
// // FILTROS PARA BÚSQUEDAS DE PACIENTES
// // ==========================================
// export interface PacienteFilters extends BaseFilters {
//   tipo_sangre?: TipoSangreEnum;
//   tiene_alergias?: boolean;
//   tiene_enfermedades_cronicas?: boolean;
//   seguro_medico?: string;
//   fecha_ultima_consulta_inicio?: string;
//   fecha_ultima_consulta_fin?: string;
//   numero_expediente?: string;
// }

// // ==========================================
// // DTOS PARA PACIENTE
// // ==========================================
// export interface CreatePacienteDto {
//   id_persona?: number; // Si se crea persona junto con paciente
//   persona?: any; // Datos de persona si se crea nueva
//   tipo_sangre?: TipoSangreEnum;
//   alergias?: string;
//   enfermedades_cronicas?: string;
//   medicamentos_actuales?: string;
//   contacto_emergencia_nombre?: string;
//   contacto_emergencia_telefono?: string;
//   contacto_emergencia_relacion?: string;
//   observaciones_medicas?: string;
//   seguro_medico?: string;
//   numero_poliza?: string;
//   activo?: boolean;
// }

// export interface UpdatePacienteDto extends Partial<Omit<CreatePacienteDto, 'id_persona' | 'persona'>> {
//   id_paciente: number;
//   persona?: any; // Para actualizar datos de persona
// }

// // ==========================================
// // RESPUESTAS ESPECÍFICAS DE PACIENTE
// // ==========================================
// export interface PacienteCompleto extends Paciente {
//   persona: Persona;
//   expedientes?: any[]; // Se definirá en expedientes.models.ts
//   ultimo_internamiento_info?: {
//     fecha_ingreso: string;
//     servicio: string;
//     estado: string;
//   };
//   proxima_cita?: {
//     fecha: string;
//     medico: string;
//     servicio: string;
//   };
// }

// // ==========================================
// // ESTADÍSTICAS DE PACIENTES
// // ==========================================
// export interface EstadisticasPacientes {
//   total_pacientes: number;
//   pacientes_activos: number;
//   distribución_tipo_sangre: Record<TipoSangreEnum, number>;
//   pacientes_con_alergias: number;
//   pacientes_con_enfermedades_cronicas: number;
//   consultas_mes_actual: number;
//   internamientos_activos: number;
//   nuevos_pacientes_mes: number;
// }





// src/app/models/paciente.model.ts
import { BaseEntity, AuditInfo, BaseFilters, Genero } from './base.models';

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
import { ExpedienteResumen } from './expediente.model';

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
// RESUMEN DE EXPEDIENTE PARA PACIENTE
// ==========================================
// export interface ExpedienteResumen {
//   id_expediente: number;
//   numero_expediente: string;
//   estado: 'Activo' | 'Cerrado' | 'Transferido';
//   fecha_creacion: string;
//   total_documentos: number;
//   internamientos_activos: number;
// }

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
// ESTADÍSTICAS DE PACIENTES
// ==========================================
export interface EstadisticasPacientes {
  resumen: {
    total_pacientes: number;
    pacientes_masculinos: number;
    pacientes_femeninos: number;
    con_transfusiones: number;
    con_alergias: number;
    edad_promedio: number;
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
