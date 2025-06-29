// // src/app/models/persona.model.ts
// import { BaseEntity, AuditInfo, Genero, EstadoCivil, BaseFilters } from './base.models';

// // ==========================================
// // INTERFACE PERSONA BASE
// // ==========================================
// export interface Persona extends BaseEntity, AuditInfo {
//   id_persona: number;
//   nombre: string;
//   apellido_paterno: string;
//   apellido_materno?: string;
//   fecha_nacimiento: string;
//   genero: Genero;
//   estado_civil?: EstadoCivil;
//   telefono?: string;
//   telefono_emergencia?: string;
//   email?: string;
//   direccion?: string;
//   ciudad?: string;
//   estado?: string;
//   codigo_postal?: string;
//   curp?: string;
//   rfc?: string;
//   numero_seguro_social?: string;
//   activo: boolean;

//   // Propiedades calculadas
//   nombre_completo?: string;
//   edad?: number;
// }

// // ==========================================
// // FILTROS PARA BÚSQUEDAS DE PERSONAS
// // ==========================================
// export interface PersonaFilters extends BaseFilters {
//   genero?: Genero;
//   estado_civil?: EstadoCivil;
//   edad_minima?: number;
//   edad_maxima?: number;
//   ciudad?: string;
//   estado?: string;
//   tiene_telefono?: boolean;
//   tiene_email?: boolean;
// }

// // ==========================================
// // DTOS PARA PERSONA
// // ==========================================
// export interface CreatePersonaDto {
//   nombre: string;
//   apellido_paterno: string;
//   apellido_materno?: string;
//   fecha_nacimiento: string;
//   genero: Genero;
//   estado_civil?: EstadoCivil;
//   telefono?: string;
//   telefono_emergencia?: string;
//   email?: string;
//   direccion?: string;
//   ciudad?: string;
//   estado?: string;
//   codigo_postal?: string;
//   curp?: string;
//   rfc?: string;
//   numero_seguro_social?: string;
//   activo?: boolean;
// }

// export interface UpdatePersonaDto extends Partial<CreatePersonaDto> {
//   id_persona: number;
// }

// // ==========================================
// // ESTADÍSTICAS DE PERSONAS
// // ==========================================
// export interface EstadisticasPersonas {
//   total_personas: number;
//   personas_activas: number;
//   distribución_genero: {
//     masculino: number;
//     femenino: number;
//     otro: number;
//   };
//   distribución_edad: {
//     menores_18: number;
//     adultos_18_65: number;
//     mayores_65: number;
//   };
//   personas_con_telefono: number;
//   personas_con_email: number;
//   nuevas_personas_mes: number;
// }




































// src/app/models/persona.model.ts
import { BaseEntity, AuditInfo, Genero, EstadoCivil, BaseFilters } from './base.models';

// ==========================================
// INTERFACE PERSONA BASE (MAPEO DIRECTO CON POSTGRESQL)
// ==========================================
export interface Persona extends BaseEntity, AuditInfo {
  id_persona: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  sexo: Genero; // 🔥 CAMBIO: backend usa 'sexo' no 'genero'
  estado_civil?: EstadoCivil;
  telefono?: string;
  telefono_emergencia?: string;
  correo_electronico?: string; // 🔥 CAMBIO: backend usa 'correo_electronico' no 'email'
  domicilio?: string; // 🔥 CAMBIO: backend usa 'domicilio' no 'direccion'
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  curp?: string;
  rfc?: string;
  numero_seguro_social?: string;
  tipo_sangre_id?: number; // 🔥 NUEVO: Campo requerido en backend
  religion?: string; // 🔥 NUEVO: Campo del backend
  activo?: boolean;

  // Propiedades calculadas que vienen del backend
  nombre_completo?: string;
  edad?: number;
  tipo_sangre?: string; // Nombre del tipo de sangre (JOIN)
  rol_en_sistema?: string; // 'Paciente' | 'Personal Médico' | 'Administrador' | 'Sin rol asignado'
  id_rol?: number; // ID del rol específico
}

// ==========================================
// INTERFACE PARA COMPATIBILIDAD CON FRONTEND
// ==========================================
export interface PersonaFrontend {
  id_persona?: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  genero: Genero; // Frontend usa 'genero'
  estado_civil?: EstadoCivil;
  telefono?: string;
  telefono_emergencia?: string;
  email?: string; // Frontend usa 'email'
  direccion?: string; // Frontend usa 'direccion'
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  curp?: string;
  rfc?: string;
  numero_seguro_social?: string;
  tipo_sangre_id?: number;
  religion?: string;
  activo?: boolean;
}

// ==========================================
// FILTROS PARA BÚSQUEDAS DE PERSONAS
// ==========================================
export interface PersonaFilters extends BaseFilters {
  sexo?: Genero; // 🔥 CAMBIO: usar 'sexo' para filtros
  estado_civil?: EstadoCivil;
  edad_minima?: number;
  edad_maxima?: number;
  ciudad?: string;
  estado?: string;
  tiene_telefono?: boolean;
  tiene_email?: boolean;
  tipo_sangre?: string;
}

// ==========================================
// DTOS PARA PERSONA (BACKEND FORMAT)
// ==========================================
export interface CreatePersonaDto {
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  sexo: Genero; // 🔥 CAMBIO: backend espera 'sexo'
  estado_civil?: EstadoCivil;
  telefono?: string;
  telefono_emergencia?: string;
  correo_electronico?: string; // 🔥 CAMBIO: backend espera 'correo_electronico'
  domicilio?: string; // 🔥 CAMBIO: backend espera 'domicilio'
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  curp?: string;
  rfc?: string;
  numero_seguro_social?: string;
  tipo_sangre_id?: number; // 🔥 NUEVO: Campo del backend
  religion?: string; // 🔥 NUEVO: Campo del backend
  activo?: boolean;
}

export interface UpdatePersonaDto extends Partial<CreatePersonaDto> {
  id_persona: number;
}

// ==========================================
// DTO PARA FRONTEND (FORMULARIOS)
// ==========================================
export interface CreatePersonaFrontendDto {
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  genero: Genero; // Frontend mantiene 'genero'
  estado_civil?: EstadoCivil;
  telefono?: string;
  telefono_emergencia?: string;
  email?: string; // Frontend mantiene 'email'
  direccion?: string; // Frontend mantiene 'direccion'
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  curp?: string;
  rfc?: string;
  numero_seguro_social?: string;
  tipo_sangre_id?: number;
  religion?: string;
  activo?: boolean;
}

// ==========================================
// ESTADÍSTICAS DE PERSONAS
// ==========================================
export interface EstadisticasPersonas {
  total_personas: number;
  personas_activas: number;
  distribución_genero: {
    masculino: number;
    femenino: number;
    otro: number;
  };
  distribución_edad: {
    menores_18: number;
    adultos_18_65: number;
    mayores_65: number;
  };
  personas_con_telefono: number;
  personas_con_email: number;
  nuevas_personas_mes: number;
}

// ==========================================
// MAPPERS PARA CONVERSIÓN FRONTEND <-> BACKEND
// ==========================================
export class PersonaMapper {

  /**
   * Convierte datos del frontend al formato del backend
   */
  static frontendToBackend(persona: CreatePersonaFrontendDto): CreatePersonaDto {
    return {
      nombre: persona.nombre,
      apellido_paterno: persona.apellido_paterno,
      apellido_materno: persona.apellido_materno,
      fecha_nacimiento: persona.fecha_nacimiento,
      sexo: persona.genero, // 🔥 MAPEO: genero -> sexo
      estado_civil: persona.estado_civil,
      telefono: persona.telefono,
      telefono_emergencia: persona.telefono_emergencia,
      correo_electronico: persona.email, // 🔥 MAPEO: email -> correo_electronico
      domicilio: persona.direccion, // 🔥 MAPEO: direccion -> domicilio
      ciudad: persona.ciudad,
      estado: persona.estado,
      codigo_postal: persona.codigo_postal,
      curp: persona.curp,
      rfc: persona.rfc,
      numero_seguro_social: persona.numero_seguro_social,
      tipo_sangre_id: persona.tipo_sangre_id || undefined, // 🔥 FIX: usar undefined
      religion: persona.religion,
      activo: persona.activo ?? true
    };
  }

  /**
   * Convierte datos del backend al formato del frontend
   */
  static backendToFrontend(persona: Persona): PersonaFrontend {
    return {
      id_persona: persona.id_persona,
      nombre: persona.nombre,
      apellido_paterno: persona.apellido_paterno,
      apellido_materno: persona.apellido_materno,
      fecha_nacimiento: persona.fecha_nacimiento,
      genero: persona.sexo, // 🔥 MAPEO: sexo -> genero
      estado_civil: persona.estado_civil,
      telefono: persona.telefono,
      telefono_emergencia: persona.telefono_emergencia,
      email: persona.correo_electronico, // 🔥 MAPEO: correo_electronico -> email
      direccion: persona.domicilio, // 🔥 MAPEO: domicilio -> direccion
      ciudad: persona.ciudad,
      estado: persona.estado,
      codigo_postal: persona.codigo_postal,
      curp: persona.curp,
      rfc: persona.rfc,
      numero_seguro_social: persona.numero_seguro_social,
      tipo_sangre_id: persona.tipo_sangre_id,
      religion: persona.religion,
      activo: persona.activo
    };
  }
}
