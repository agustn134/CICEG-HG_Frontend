// export interface Administrador {
//   id_administrador: number;
//   id_persona: number;
//   usuario: string;
//   contrasena: string;
//   nivel_acceso: number;
//   activo: boolean;
//   foto?: string;
// }



// src/app/models/administrador.model.ts
import { BaseEntity, AuditInfo, BaseFilters, NivelAcceso } from './base.models';

// ==========================================
// INTERFACE ADMINISTRADOR
// ==========================================
export interface Administrador extends BaseEntity, AuditInfo {
  id_administrador: number;
  id_persona: number;
  usuario: string;
  nivel_acceso: NivelAcceso;
  activo: boolean;
  foto?: string;

  // Información de la persona relacionada (opcional)
  persona?: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    email?: string;
    telefono?: string;
    fecha_nacimiento?: string;
    genero?: string;
  };

  // Metadatos adicionales
  ultimo_acceso?: string;
  total_accesos?: number;
  fecha_ultimo_cambio_password?: string;
}

// ==========================================
// FILTROS PARA BÚSQUEDAS
// ==========================================
export interface AdministradorFilters extends BaseFilters {
  usuario?: string;
  nivel_acceso?: NivelAcceso;
  id_persona?: number;
  con_accesos_recientes?: boolean;
  fecha_ultimo_acceso_inicio?: string;
  fecha_ultimo_acceso_fin?: string;
}

// ==========================================
// DTOS PARA CREACIÓN Y ACTUALIZACIÓN
// ==========================================
export interface CreateAdministradorDto {
  id_persona: number;
  usuario: string;
  password: string;
  nivel_acceso?: NivelAcceso;
  activo?: boolean;
  foto?: string;
}

export interface UpdateAdministradorDto {
  usuario?: string;
  nivel_acceso?: NivelAcceso;
  activo?: boolean;
  foto?: string;
  password?: string; // Solo si se quiere cambiar
}

// ==========================================
// INTERFACES PARA GESTIÓN DE CONTRASEÑAS
// ==========================================
export interface ChangePasswordDto {
  password_actual: string;
  password_nuevo: string;
}

export interface ResetPasswordDto {
  nueva_password: string;
}

// ==========================================
// INTERFACES PARA AUTENTICACIÓN
// ==========================================
export interface LoginCredentials {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  valido: boolean;
  administrador?: Administrador;
  token?: string;
  mensaje?: string;
}

// ==========================================
// ESTADÍSTICAS DE ADMINISTRADORES
// ==========================================
export interface EstadisticasAdministradores {
  total_administradores: number;
  administradores_activos: number;
  administradores_inactivos: number;
  distribucion_nivel_acceso: {
    [NivelAcceso.USUARIO]: number;
    [NivelAcceso.SUPERVISOR]: number;
    [NivelAcceso.ADMINISTRADOR]: number;
  };
  accesos_ultimo_mes: number;
  administradores_nuevos_mes: number;
  ultimo_administrador_creado?: {
    usuario: string;
    fecha_creacion: string;
  };
  promedio_accesos_por_admin: number;
  administradores_sin_acceso_30_dias: number;
}

// ==========================================
// INTERFACES PARA AUDITORÍA
// ==========================================
export interface AccesoAdministrador {
  id_acceso: number;
  id_administrador: number;
  fecha_acceso: string;
  ip_acceso?: string;
  user_agent?: string;
  accion_realizada?: string;
  duracion_sesion?: number;
  exito: boolean;
}

export interface HistorialAdministrador {
  id_historial: number;
  id_administrador: number;
  accion: 'CREACION' | 'ACTUALIZACION' | 'ELIMINACION' | 'CAMBIO_PASSWORD' | 'CAMBIO_ESTADO';
  descripcion: string;
  fecha_accion: string;
  usuario_responsable: string;
  datos_anteriores?: any;
  datos_nuevos?: any;
}

// ==========================================
// TIPOS UTILITARIOS
// ==========================================
export type AdministradorBasico = Pick<Administrador, 'id_administrador' | 'usuario' | 'nivel_acceso' | 'activo'>;

export type AdministradorParaSelect = Pick<Administrador, 'id_administrador' | 'usuario' | 'nivel_acceso'> & {
  label?: string; // Para uso en selects
  value?: number; // Para uso en selects
};

// ==========================================
// ENUMS ESPECÍFICOS PARA ADMINISTRADORES
// ==========================================
export enum AccionAdministrador {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREAR_USUARIO = 'CREAR_USUARIO',
  EDITAR_USUARIO = 'EDITAR_USUARIO',
  ELIMINAR_USUARIO = 'ELIMINAR_USUARIO',
  CAMBIAR_PASSWORD = 'CAMBIAR_PASSWORD',
  GENERAR_REPORTE = 'GENERAR_REPORTE',
  EXPORTAR_DATOS = 'EXPORTAR_DATOS',
  IMPORTAR_DATOS = 'IMPORTAR_DATOS'
}

// ==========================================
// INTERFACES PARA VALIDACIONES
// ==========================================
export interface ValidacionAdministrador {
  usuario_disponible: boolean;
  puede_eliminar: boolean;
  motivos_no_eliminacion?: string[];
  es_ultimo_admin?: boolean;
  tiene_sesiones_activas?: boolean;
}

// ==========================================
// CONFIGURACIÓN ESPECÍFICA
// ==========================================
export const ADMINISTRADOR_CONFIG = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 50,
  USUARIO_MIN_LENGTH: 3,
  USUARIO_MAX_LENGTH: 50,
  SESION_TIMEOUT_MINUTOS: 120,
  MAX_INTENTOS_LOGIN: 5,
  BLOQUEO_TEMPORAL_MINUTOS: 15
} as const;
