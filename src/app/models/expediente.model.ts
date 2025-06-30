// // import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// // export interface Expediente extends BaseEntity, AuditInfo {
// //   id_expediente: number;
// //   id_paciente: number;
// //   numero_expediente: string;
// //   fecha_apertura: string; // Cambié de Date a string
// //   estado: 'Activo' | 'Cerrado' | 'Transferido';
// //   observaciones?: string;

// //   // Información del paciente
// //   paciente?: {
// //     nombre_completo: string;
// //     fecha_nacimiento: string;
// //     genero: string;
// //     numero_seguro_social?: string;
// //   };

// //   // Estadísticas del expediente
// //   total_documentos?: number;
// //   total_internamientos?: number;
// //   ultimo_internamiento?: string;
// //   documentos_recientes?: {
// //     tipo: string;
// //     fecha: string;
// //     medico: string;
// //   }[];
// // }

// // export interface ExpedienteFilters extends BaseFilters {
// //   numero_expediente?: string;
// //   id_paciente?: number;
// //   estado?: string;
// //   fecha_apertura_inicio?: string;
// //   fecha_apertura_fin?: string;
// // }

// // export interface CreateExpedienteDto {
// //   id_paciente: number;
// //   numero_expediente?: string; // Se puede generar automáticamente
// //   fecha_apertura?: string;
// //   estado?: string;
// //   observaciones?: string;
// // }

// // export interface UpdateExpedienteDto extends Partial<CreateExpedienteDto> {
// //   id_expediente: number;
// // }















// // src/app/models/expediente.model.ts
// import { BaseEntity, AuditInfo, BaseFilters, Genero } from './base.models';

// // ==========================================
// // INTERFACE PRINCIPAL EXPEDIENTE
// // ==========================================
// export interface Expediente extends BaseEntity, AuditInfo {
//   id_expediente: number;
//   id_paciente: number;
//   numero_expediente: string;
//   fecha_apertura: string;
//   estado: EstadoExpediente;
//   notas_administrativas?: string;

//   // Información del paciente (cuando se hace join)
//   nombre_paciente?: string;
//   fecha_nacimiento?: string;
//   sexo?: Genero;
//   curp?: string;
//   edad?: number;
//   tipo_sangre?: string;

//   // Estadísticas del expediente
//   total_documentos?: number;
//   documentos_activos?: number;
//   documentos_mes_actual?: number;
//   total_internamientos?: number;
//   internamientos_activos?: number;
//   ultimo_ingreso?: string;

//   // Información de servicio actual
//   servicio_actual?: string;
//   cama_actual?: string;
//   medico_responsable_actual?: string;
// }

// // ==========================================
// // EXPEDIENTE COMPLETO CON TODA LA INFORMACIÓN
// // ==========================================
// export interface ExpedienteCompleto extends Expediente {
//   // Datos completos del paciente
//   alergias?: string;
//   transfusiones?: string;
//   detalles_transfusiones?: string;
//   familiar_responsable?: string;
//   parentesco_familiar?: string;
//   telefono_familiar?: string;
//   ocupacion?: string;
//   escolaridad?: string;
//   lugar_nacimiento?: string;

//   // Datos completos de la persona
//   id_persona: number;
//   nombre: string;
//   apellido_paterno: string;
//   apellido_materno: string;
//   telefono?: string;
//   correo_electronico?: string;
//   domicilio?: string;
//   estado_civil?: string;
//   religion?: string;

//   // Información relacionada
//   documentos_clinicos?: DocumentoClinicoResumen[];
//   internamientos?: InternamientoResumen[];
//   ultimos_signos_vitales?: SignosVitalesResumen[];
//   requiere_validacion_reingreso?: boolean;
// }

// // ==========================================
// // INTERFACES RELACIONADAS
// // ==========================================
// export interface DocumentoClinicoResumen {
//   id_documento: number;
//   fecha_elaboracion: string;
//   estado: EstadoDocumento;
//   tipo_documento: string;
//   descripcion_tipo_documento?: string;
//   medico_creador?: string;
//   especialidad_medico?: string;
//   subtipo_documento: string;
// }

// export interface InternamientoResumen {
//   id_internamiento: number;
//   fecha_ingreso: string;
//   fecha_egreso?: string;
//   motivo_ingreso: string;
//   diagnostico_ingreso?: string;
//   diagnostico_egreso?: string;
//   tipo_egreso?: TipoEgreso;
//   observaciones?: string;
//   servicio?: string;
//   cama?: string;
//   area_cama?: string;
//   subarea_cama?: string;
//   medico_responsable?: string;
//   especialidad_medico?: string;
//   dias_estancia: number;
// }

// export interface SignosVitalesResumen {
//   id_signos_vitales: number;
//   fecha_toma: string;
//   temperatura?: number;
//   presion_arterial_sistolica?: number;
//   presion_arterial_diastolica?: number;
//   frecuencia_cardiaca?: number;
//   frecuencia_respiratoria?: number;
//   saturacion_oxigeno?: number;
//   glucosa?: number;
//   peso?: number;
//   talla?: number;
//   imc?: number;
//   observaciones?: string;
// }

// // ==========================================
// // RESULTADOS DE BÚSQUEDA
// // ==========================================
// export interface ExpedienteBusqueda {
//   id_expediente: number;
//   numero_expediente: string;
//   fecha_apertura: string;
//   estado: EstadoExpediente;
//   nombre_paciente: string;
//   curp?: string;
//   edad: number;
//   sexo: Genero;
//   internamiento_activo: number;
// }

// export interface ExpedientesPorPaciente {
//   paciente: {
//     id_paciente: number;
//     nombre_completo: string;
//   };
//   expedientes: ExpedienteResumen[];
//   total_expedientes: number;
// }

// export interface ExpedienteResumen {
//   id_expediente: number;
//   numero_expediente: string;
//   fecha_apertura: string;
//   estado: EstadoExpediente;
//   notas_administrativas?: string;
//   total_documentos: number;
//   total_internamientos: number;
//   internamientos_activos: number;
//   ultima_actividad?: string;
//   ultimo_ingreso?: string;
// }

// // ==========================================
// // DASHBOARD Y ESTADÍSTICAS
// // ==========================================
// export interface DashboardExpedientes {
//   estadisticas: EstadisticasExpedientes;
//   expedientes_con_internamiento_activo: ExpedienteConInternamiento[];
//   expedientes_mas_activos: ExpedienteMasActivo[];
//   alertas_activas: AlertaActiva[];
// }

// export interface EstadisticasExpedientes {
//   total_expedientes: number;
//   expedientes_activos: number;
//   expedientes_cerrados: number;
//   expedientes_archivados: number;
//   expedientes_mes_actual: number;
//   expedientes_semana_actual: number;
// }

// export interface ExpedienteConInternamiento {
//   id_expediente: number;
//   numero_expediente: string;
//   nombre_paciente: string;
//   fecha_ingreso: string;
//   servicio?: string;
//   cama?: string;
//   medico_responsable?: string;
//   dias_estancia: number;
// }

// export interface ExpedienteMasActivo {
//   id_expediente: number;
//   numero_expediente: string;
//   nombre_paciente: string;
//   total_documentos: number;
//   documentos_semana: number;
//   ultima_actividad?: string;
// }

// export interface AlertaActiva {
//   tipo_alerta: TipoAlerta;
//   mensaje: string;
//   fecha_alerta: string;
//   numero_expediente?: string;
//   nombre_paciente?: string;
// }

// // ==========================================
// // AUDITORÍA Y CONTROL
// // ==========================================
// export interface AuditoriaExpediente {
//   expediente: {
//     numero_expediente: string;
//     nombre_paciente: string;
//   };
//   auditorias: RegistroAuditoria[];
//   pagination: PaginationInfo;
// }

// export interface RegistroAuditoria {
//   id_auditoria: number;
//   fecha_acceso: string;
//   accion: AccionAuditoria;
//   datos_anteriores?: any;
//   datos_nuevos?: any;
//   ip_acceso?: string;
//   navegador?: string;
//   tiempo_sesion?: number;
//   observaciones?: string;
//   medico_nombre?: string;
//   especialidad?: string;
//   numero_cedula?: string;
// }

// export interface AlertasExpediente {
//   todas: Alerta[];
//   por_tipo: {
//     CRITICA: Alerta[];
//     ADVERTENCIA: Alerta[];
//     INFORMATIVA: Alerta[];
//   };
//   resumen: ResumenAlertas;
// }

// export interface Alerta {
//   id_alerta: number;
//   tipo_alerta: TipoAlerta;
//   mensaje: string;
//   fecha_alerta: string;
//   estado: EstadoAlerta;
//   fecha_revision?: string;
//   acciones_tomadas?: string;
//   medico_generador?: string;
//   medico_revisor?: string;
// }

// export interface ResumenAlertas {
//   total: number;
//   activas: number;
//   revisadas: number;
//   cerradas: number;
// }

// // ==========================================
// // VALIDACIÓN Y REINGRESO
// // ==========================================
// export interface ValidacionAcceso {
//   requiere_validacion: boolean;
//   id_validacion?: number;
//   acceso_inmediato: boolean;
// }

// export interface ValidacionReingreso {
//   id_medico_validador: number;
//   peso_actual: number;
//   talla_actual: number;
//   presion_arterial_sistolica: number;
//   presion_arterial_diastolica: number;
//   temperatura: number;
//   alergias_confirmadas: string;
//   medicamentos_actuales: string;
//   contacto_emergencia_actual: string;
//   observaciones_validacion?: string;
// }

// export interface ResultadoValidacionReingreso {
//   validacion: any; // Datos de la validación creada
//   acceso_historico_habilitado: boolean;
// }

// // ==========================================
// // FILTROS Y DTOS
// // ==========================================
// export interface ExpedienteFilters extends BaseFilters {
//   estado?: EstadoExpediente | 'todos';
//   fecha_inicio?: string;
//   fecha_fin?: string;
//   paciente_id?: number;
//   tiene_internamiento_activo?: boolean;
//   buscar?: string;
//   limit?: number;
//   offset?: number;
// }

// export interface CreateExpedienteDto {
//   id_paciente: number;
//   numero_expediente?: string; // Se puede generar automáticamente
//   estado?: EstadoExpediente;
//   notas_administrativas?: string;
//   crear_historia_clinica?: boolean;
//   id_medico_creador?: number;
// }

// export interface UpdateExpedienteDto {
//   estado?: EstadoExpediente;
//   notas_administrativas?: string;
//   id_medico_modificador?: number;
// }

// export interface DeleteExpedienteOptions {
//   force?: boolean;
//   id_medico_eliminador?: number;
//   motivo_eliminacion?: string;
// }

// // ==========================================
// // ENUMS Y TIPOS
// // ==========================================
// export enum EstadoExpediente {
//   ACTIVO = 'Activo',
//   CERRADO = 'Cerrado',
//   ARCHIVADO = 'Archivado',
//   SUSPENDIDO = 'Suspendido',
//   ELIMINADO = 'Eliminado'
// }

// export enum EstadoDocumento {
//   ACTIVO = 'Activo',
//   CANCELADO = 'Cancelado',
//   ANULADO = 'Anulado',
//   BORRADOR = 'Borrador'
// }

// export enum TipoEgreso {
//   ALTA_VOLUNTARIA = 'Alta voluntaria',
//   MEJORIA = 'Mejoría',
//   REFERENCIA = 'Referencia',
//   DEFUNCION = 'Defunción',
//   MAXIMO_BENEFICIO = 'Máximo beneficio'
// }

// export enum TipoAlerta {
//   CRITICA = 'CRITICA',
//   ADVERTENCIA = 'ADVERTENCIA',
//   INFORMATIVA = 'INFORMATIVA'
// }

// export enum EstadoAlerta {
//   ACTIVA = 'ACTIVA',
//   REVISADA = 'REVISADA',
//   CERRADA = 'CERRADA'
// }

// export enum AccionAuditoria {
//   CONSULTA = 'consulta',
//   NUEVO_DOCUMENTO = 'nuevo_documento',
//   ACTUALIZACION = 'actualizacion',
//   ELIMINACION_LOGICA = 'eliminacion_logica',
//   ELIMINACION_FISICA = 'eliminacion_fisica',
//   VALIDACION_REINGRESO = 'validacion_reingreso',
//   ACCESO_NEGADO = 'acceso_negado',
//   NUEVO_EXPEDIENTE = 'nuevo_expediente'
// }

// // ==========================================
// // TIPOS UTILITARIOS
// // ==========================================
// export type ExpedienteCreacion = CreateExpedienteDto;
// export type ExpedienteActualizacion = UpdateExpedienteDto;
// export type ExpedienteLista = Expediente;
// export type ExpedienteDetalle = ExpedienteCompleto;

// // ==========================================
// // INTERFACES PARA REPORTES
// // ==========================================
// export interface ReporteExpediente {
//   expediente: ExpedienteCompleto;
//   generado_en: string;
//   incluye: {
//     documentos: boolean;
//     internamientos: boolean;
//   };
//   documentos?: DocumentoClinicoDetalle[];
//   internamientos?: InternamientoDetalle[];
// }

// export interface DocumentoClinicoDetalle extends DocumentoClinicoResumen {
//   contenido_especifico?: any; // Dependiendo del tipo de documento
// }

// export interface InternamientoDetalle extends InternamientoResumen {
//   procedimientos_realizados?: string[];
//   medicamentos_administrados?: string[];
//   evoluciones?: any[];
// }

// // ==========================================
// // INTERFACES DE PAGINACIÓN ESPECÍFICAS
// // ==========================================
// export interface PaginationInfo {
//   total: number;
//   limit: number;
//   offset: number;
//   pages: number;
// }

// export interface ExpedientesPaginados {
//   data: Expediente[];
//   pagination: PaginationInfo;
//   filtros_aplicados: {
//     estado: string;
//     fecha_inicio?: string;
//     fecha_fin?: string;
//     paciente_id?: number;
//     tiene_internamiento_activo: string;
//     buscar: string;
//   };
// }

// // ==========================================
// // CONSTANTES Y CONFIGURACIONES
// // ==========================================
// export const ESTADOS_EXPEDIENTE = [
//   { valor: EstadoExpediente.ACTIVO, descripcion: 'Activo', color: 'success' },
//   { valor: EstadoExpediente.CERRADO, descripcion: 'Cerrado', color: 'secondary' },
//   { valor: EstadoExpediente.ARCHIVADO, descripcion: 'Archivado', color: 'warning' },
//   { valor: EstadoExpediente.SUSPENDIDO, descripcion: 'Suspendido', color: 'danger' },
//   { valor: EstadoExpediente.ELIMINADO, descripcion: 'Eliminado', color: 'dark' }
// ] as const;

// export const TIPOS_ALERTA = [
//   { valor: TipoAlerta.CRITICA, descripcion: 'Crítica', color: 'danger', icono: 'alert-triangle' },
//   { valor: TipoAlerta.ADVERTENCIA, descripcion: 'Advertencia', color: 'warning', icono: 'alert-circle' },
//   { valor: TipoAlerta.INFORMATIVA, descripcion: 'Informativa', color: 'info', icono: 'info' }
// ] as const;

// export const ACCIONES_AUDITORIA = [
//   { valor: AccionAuditoria.CONSULTA, descripcion: 'Consulta' },
//   { valor: AccionAuditoria.NUEVO_DOCUMENTO, descripcion: 'Nuevo documento' },
//   { valor: AccionAuditoria.ACTUALIZACION, descripcion: 'Actualización' },
//   { valor: AccionAuditoria.ELIMINACION_LOGICA, descripcion: 'Eliminación lógica' },
//   { valor: AccionAuditoria.VALIDACION_REINGRESO, descripcion: 'Validación reingreso' },
//   { valor: AccionAuditoria.NUEVO_EXPEDIENTE, descripcion: 'Nuevo expediente' }
// ] as const;

// // ==========================================
// // FUNCIONES DE UTILIDAD
// // ==========================================

// /**
//  * Determina si un expediente está activo
//  */
// export function esExpedienteActivo(expediente: Expediente): boolean {
//   return expediente.estado === EstadoExpediente.ACTIVO;
// }

// /**
//  * Determina si un expediente tiene internamientos activos
//  */
// export function tieneInternamientoActivo(expediente: Expediente): boolean {
//   return (expediente.internamientos_activos || 0) > 0;
// }

// /**
//  * Calcula los días desde la apertura del expediente
//  */
// export function diasDesdeApertura(fechaApertura: string): number {
//   const hoy = new Date();
//   const apertura = new Date(fechaApertura);
//   const diferencia = hoy.getTime() - apertura.getTime();
//   return Math.floor(diferencia / (1000 * 3600 * 24));
// }

// /**
//  * Formatea el número de expediente para mostrar
//  */
// export function formatearNumeroExpediente(numero: string): string {
//   if (numero.length >= 10) {
//     // Formato: 2024-123456 -> 2024-123456
//     return `${numero.substring(0, 4)}-${numero.substring(4)}`;
//   }
//   return numero;
// }

// /**
//  * Obtiene el color del estado del expediente
//  */
// export function getColorEstado(estado: EstadoExpediente): string {
//   const estadoConfig = ESTADOS_EXPEDIENTE.find(e => e.valor === estado);
//   return estadoConfig?.color || 'secondary';
// }

// /**
//  * Obtiene el color del tipo de alerta
//  */
// export function getColorTipoAlerta(tipo: TipoAlerta): string {
//   const alertaConfig = TIPOS_ALERTA.find(t => t.valor === tipo);
//   return alertaConfig?.color || 'secondary';
// }

// /**
//  * Determina si un expediente puede ser eliminado
//  */
// export function puedeEliminarExpediente(expediente: Expediente): boolean {
//   return expediente.estado !== EstadoExpediente.ELIMINADO &&
//          (expediente.internamientos_activos || 0) === 0;
// }

// /**
//  * Determina si un expediente puede ser cerrado
//  */
// export function puedeCerrarExpediente(expediente: Expediente): boolean {
//   return expediente.estado === EstadoExpediente.ACTIVO &&
//          (expediente.internamientos_activos || 0) === 0;
// }

// /**
//  * Determina si un expediente puede ser reactivado
//  */
// export function puedeReactivarExpediente(expediente: Expediente): boolean {
//   return expediente.estado === EstadoExpediente.CERRADO ||
//          expediente.estado === EstadoExpediente.SUSPENDIDO;
// }

// /**
//  * Genera un resumen del expediente para mostrar en listas
//  */
// export function generarResumenExpediente(expediente: Expediente): string {
//   const partes = [];

//   if (expediente.total_documentos) {
//     partes.push(`${expediente.total_documentos} doc${expediente.total_documentos > 1 ? 's' : ''}`);
//   }

//   if (expediente.total_internamientos) {
//     partes.push(`${expediente.total_internamientos} int${expediente.total_internamientos > 1 ? 's' : ''}`);
//   }

//   if (expediente.internamientos_activos) {
//     partes.push(`${expediente.internamientos_activos} activo${expediente.internamientos_activos > 1 ? 's' : ''}`);
//   }

//   return partes.length > 0 ? partes.join(' • ') : 'Sin actividad';
// }

// /**
//  * Valida los datos mínimos para crear un expediente
//  */
// export function validarDatosExpediente(datos: CreateExpedienteDto): { esValido: boolean; errores: string[] } {
//   const errores: string[] = [];

//   if (!datos.id_paciente) {
//     errores.push('El ID del paciente es obligatorio');
//   }

//   if (datos.numero_expediente && datos.numero_expediente.trim().length < 6) {
//     errores.push('El número de expediente debe tener al menos 6 caracteres');
//   }

//   if (datos.estado && !Object.values(EstadoExpediente).includes(datos.estado as EstadoExpediente)) {
//     errores.push('El estado del expediente no es válido');
//   }

//   return {
//     esValido: errores.length === 0,
//     errores
//   };
// }

// /**
//  * Convierte filtros de expediente a parámetros de consulta
//  */
// export function filtrosAParametros(filtros: ExpedienteFilters): Record<string, string> {
//   const parametros: Record<string, string> = {};

//   if (filtros.estado && filtros.estado !== 'todos') {
//     parametros['estado'] = filtros.estado;
//   }

//   if (filtros.fecha_inicio) {
//     parametros['fecha_inicio'] = filtros.fecha_inicio;
//   }

//   if (filtros.fecha_fin) {
//     parametros['fecha_fin'] = filtros.fecha_fin;
//   }

//   if (filtros.paciente_id) {
//     parametros['paciente_id'] = filtros.paciente_id.toString();
//   }

//   if (filtros.tiene_internamiento_activo !== undefined) {
//     parametros['tiene_internamiento_activo'] = filtros.tiene_internamiento_activo.toString();
//   }

//   if (filtros.buscar) {
//     parametros['buscar'] = filtros.buscar;
//   }

//   if (filtros.limit) {
//     parametros['limit'] = filtros.limit.toString();
//   }

//   if (filtros.offset) {
//     parametros['offset'] = filtros.offset.toString();
//   }

//   return parametros;
// }








// src/app/models/expediente.model.ts
import { BaseEntity, AuditInfo, BaseFilters, Genero } from './base.models';

// ==========================================
// INTERFACE PRINCIPAL EXPEDIENTE
// ==========================================
export interface Expediente extends BaseEntity, AuditInfo {
  id_expediente: number;
  id_paciente: number;
  numero_expediente: string;
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
  estado: EstadoDocumento;
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
  tipo_egreso?: TipoEgreso;
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
  fecha_apertura: string;
  estado: EstadoExpediente;
  notas_administrativas?: string;
  total_documentos: number;
  total_internamientos: number;
  internamientos_activos: number;
  ultima_actividad?: string;
  ultimo_ingreso?: string;
}

// ==========================================
// DASHBOARD Y ESTADÍSTICAS
// ==========================================
export interface DashboardExpedientes {
  estadisticas: EstadisticasExpedientes;
  expedientes_con_internamiento_activo: ExpedienteConInternamiento[];
  expedientes_mas_activos: ExpedienteMasActivo[];
  alertas_activas: AlertaActiva[];
}

export interface EstadisticasExpedientes {
  total_expedientes: number;
  expedientes_activos: number;
  expedientes_cerrados: number;
  expedientes_archivados: number;
  expedientes_mes_actual: number;
  expedientes_semana_actual: number;
}

export interface ExpedienteConInternamiento {
  id_expediente: number;
  numero_expediente: string;
  nombre_paciente: string;
  fecha_ingreso: string;
  servicio?: string;
  cama?: string;
  medico_responsable?: string;
  dias_estancia: number;
}

export interface ExpedienteMasActivo {
  id_expediente: number;
  numero_expediente: string;
  nombre_paciente: string;
  total_documentos: number;
  documentos_semana: number;
  ultima_actividad?: string;
}

export interface AlertaActiva {
  tipo_alerta: TipoAlerta;
  mensaje: string;
  fecha_alerta: string;
  numero_expediente?: string;
  nombre_paciente?: string;
}

// ==========================================
// AUDITORÍA Y CONTROL
// ==========================================
export interface AuditoriaExpediente {
  expediente: {
    numero_expediente: string;
    nombre_paciente: string;
  };
  auditorias: RegistroAuditoria[];
  pagination: PaginationInfo;
}

export interface RegistroAuditoria {
  id_auditoria: number;
  fecha_acceso: string;
  accion: AccionAuditoria;
  datos_anteriores?: any;
  datos_nuevos?: any;
  ip_acceso?: string;
  navegador?: string;
  tiempo_sesion?: number;
  observaciones?: string;
  medico_nombre?: string;
  especialidad?: string;
  numero_cedula?: string;
}

export interface AlertasExpediente {
  todas: Alerta[];
  por_tipo: {
    CRITICA: Alerta[];
    ADVERTENCIA: Alerta[];
    INFORMATIVA: Alerta[];
  };
  resumen: ResumenAlertas;
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

export interface ResumenAlertas {
  total: number;
  activas: number;
  revisadas: number;
  cerradas: number;
}

// ==========================================
// VALIDACIÓN Y REINGRESO
// ==========================================
export interface ValidacionAcceso {
  requiere_validacion: boolean;
  id_validacion?: number;
  acceso_inmediato: boolean;
}

export interface ValidacionReingreso {
  id_medico_validador: number;
  peso_actual: number;
  talla_actual: number;
  presion_arterial_sistolica: number;
  presion_arterial_diastolica: number;
  temperatura: number;
  alergias_confirmadas: string;
  medicamentos_actuales: string;
  contacto_emergencia_actual: string;
  observaciones_validacion?: string;
}

export interface ResultadoValidacionReingreso {
  validacion: any; // Datos de la validación creada
  acceso_historico_habilitado: boolean;
}

// ==========================================
// FILTROS Y DTOS
// ==========================================
export interface ExpedienteFilters extends BaseFilters {
  estado?: string | 'todos'; // 'Activo', 'Cerrado', 'Archivado', 'Suspendido', 'Eliminado'
  fecha_inicio?: string;
  fecha_fin?: string;
  paciente_id?: number;
  tiene_internamiento_activo?: boolean;
  buscar?: string;
  limit?: number;
  offset?: number;
}

export interface CreateExpedienteDto {
  id_paciente: number;
  numero_expediente?: string; // Se puede generar automáticamente
  estado?: string; // 'Activo', 'Cerrado', 'Archivado', 'Suspendido'
  notas_administrativas?: string;
  crear_historia_clinica?: boolean;
  id_medico_creador?: number;
}

export interface UpdateExpedienteDto {
  estado?: string; // 'Activo', 'Cerrado', 'Archivado', 'Suspendido'
  notas_administrativas?: string;
  id_medico_modificador?: number;
}

export interface DeleteExpedienteOptions {
  force?: boolean;
  id_medico_eliminador?: number;
  motivo_eliminacion?: string;
}

// ==========================================
// ENUMS Y TIPOS (Mantenemos como referencia pero usamos strings)
// ==========================================
export const ESTADOS_EXPEDIENTE_VALUES = {
  ACTIVO: 'Activo',
  CERRADO: 'Cerrado',
  ARCHIVADO: 'Archivado',
  SUSPENDIDO: 'Suspendido',
  ELIMINADO: 'Eliminado'
} as const;

export type EstadoExpediente = typeof ESTADOS_EXPEDIENTE_VALUES[keyof typeof ESTADOS_EXPEDIENTE_VALUES];

export enum EstadoDocumento {
  ACTIVO = 'Activo',
  CANCELADO = 'Cancelado',
  ANULADO = 'Anulado',
  BORRADOR = 'Borrador'
}

export enum TipoEgreso {
  ALTA_VOLUNTARIA = 'Alta voluntaria',
  MEJORIA = 'Mejoría',
  REFERENCIA = 'Referencia',
  DEFUNCION = 'Defunción',
  MAXIMO_BENEFICIO = 'Máximo beneficio'
}

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

// ==========================================
// TIPOS UTILITARIOS
// ==========================================
export type ExpedienteCreacion = CreateExpedienteDto;
export type ExpedienteActualizacion = UpdateExpedienteDto;
export type ExpedienteLista = Expediente;
export type ExpedienteDetalle = ExpedienteCompleto;

// ==========================================
// INTERFACES PARA REPORTES
// ==========================================
export interface ReporteExpediente {
  expediente: ExpedienteCompleto;
  generado_en: string;
  incluye: {
    documentos: boolean;
    internamientos: boolean;
  };
  documentos?: DocumentoClinicoDetalle[];
  internamientos?: InternamientoDetalle[];
}

export interface DocumentoClinicoDetalle extends DocumentoClinicoResumen {
  contenido_especifico?: any; // Dependiendo del tipo de documento
}

export interface InternamientoDetalle extends InternamientoResumen {
  procedimientos_realizados?: string[];
  medicamentos_administrados?: string[];
  evoluciones?: any[];
}

// ==========================================
// INTERFACES DE PAGINACIÓN ESPECÍFICAS
// ==========================================
export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  pages: number;
}

export interface ExpedientesPaginados {
  data: Expediente[];
  pagination: PaginationInfo;
  filtros_aplicados: {
    estado: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    paciente_id?: number;
    tiene_internamiento_activo: string;
    buscar: string;
  };
}

// ==========================================
// CONSTANTES Y CONFIGURACIONES
// ==========================================
export const ESTADOS_EXPEDIENTE = [
  { valor: ESTADOS_EXPEDIENTE_VALUES.ACTIVO, descripcion: 'Activo', color: 'success' },
  { valor: ESTADOS_EXPEDIENTE_VALUES.CERRADO, descripcion: 'Cerrado', color: 'secondary' },
  { valor: ESTADOS_EXPEDIENTE_VALUES.ARCHIVADO, descripcion: 'Archivado', color: 'warning' },
  { valor: ESTADOS_EXPEDIENTE_VALUES.SUSPENDIDO, descripcion: 'Suspendido', color: 'danger' },
  { valor: ESTADOS_EXPEDIENTE_VALUES.ELIMINADO, descripcion: 'Eliminado', color: 'dark' }
] as const;

export const TIPOS_ALERTA = [
  { valor: TipoAlerta.CRITICA, descripcion: 'Crítica', color: 'danger', icono: 'alert-triangle' },
  { valor: TipoAlerta.ADVERTENCIA, descripcion: 'Advertencia', color: 'warning', icono: 'alert-circle' },
  { valor: TipoAlerta.INFORMATIVA, descripcion: 'Informativa', color: 'info', icono: 'info' }
] as const;

export const ACCIONES_AUDITORIA = [
  { valor: AccionAuditoria.CONSULTA, descripcion: 'Consulta' },
  { valor: AccionAuditoria.NUEVO_DOCUMENTO, descripcion: 'Nuevo documento' },
  { valor: AccionAuditoria.ACTUALIZACION, descripcion: 'Actualización' },
  { valor: AccionAuditoria.ELIMINACION_LOGICA, descripcion: 'Eliminación lógica' },
  { valor: AccionAuditoria.VALIDACION_REINGRESO, descripcion: 'Validación reingreso' },
  { valor: AccionAuditoria.NUEVO_EXPEDIENTE, descripcion: 'Nuevo expediente' }
] as const;

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

/**
 * Determina si un expediente está activo
 */
export function esExpedienteActivo(expediente: Expediente): boolean {
  return expediente.estado === ESTADOS_EXPEDIENTE_VALUES.ACTIVO;
}

/**
 * Determina si un expediente tiene internamientos activos
 */
export function tieneInternamientoActivo(expediente: Expediente): boolean {
  return (expediente.internamientos_activos || 0) > 0;
}

/**
 * Calcula los días desde la apertura del expediente
 */
export function diasDesdeApertura(fechaApertura: string): number {
  const hoy = new Date();
  const apertura = new Date(fechaApertura);
  const diferencia = hoy.getTime() - apertura.getTime();
  return Math.floor(diferencia / (1000 * 3600 * 24));
}

/**
 * Formatea el número de expediente para mostrar
 */
export function formatearNumeroExpediente(numero: string): string {
  if (numero.length >= 10) {
    // Formato: 2024-123456 -> 2024-123456
    return `${numero.substring(0, 4)}-${numero.substring(4)}`;
  }
  return numero;
}

/**
 * Obtiene el color del estado del expediente
 */
export function getColorEstado(estado: string): string {
  const estadoConfig = ESTADOS_EXPEDIENTE.find(e => e.valor === estado);
  return estadoConfig?.color || 'secondary';
}

/**
 * Obtiene el color del tipo de alerta
 */
export function getColorTipoAlerta(tipo: TipoAlerta): string {
  const alertaConfig = TIPOS_ALERTA.find(t => t.valor === tipo);
  return alertaConfig?.color || 'secondary';
}

/**
 * Determina si un expediente puede ser eliminado
 */
export function puedeEliminarExpediente(expediente: Expediente): boolean {
  return expediente.estado !== ESTADOS_EXPEDIENTE_VALUES.ELIMINADO &&
         (expediente.internamientos_activos || 0) === 0;
}

/**
 * Determina si un expediente puede ser cerrado
 */
export function puedeCerrarExpediente(expediente: Expediente): boolean {
  return expediente.estado === ESTADOS_EXPEDIENTE_VALUES.ACTIVO &&
         (expediente.internamientos_activos || 0) === 0;
}

/**
 * Determina si un expediente puede ser reactivado
 */
export function puedeReactivarExpediente(expediente: Expediente): boolean {
  return expediente.estado === ESTADOS_EXPEDIENTE_VALUES.CERRADO ||
         expediente.estado === ESTADOS_EXPEDIENTE_VALUES.SUSPENDIDO;
}

/**
 * Genera un resumen del expediente para mostrar en listas
 */
export function generarResumenExpediente(expediente: Expediente): string {
  const partes = [];

  if (expediente.total_documentos) {
    partes.push(`${expediente.total_documentos} doc${expediente.total_documentos > 1 ? 's' : ''}`);
  }

  if (expediente.total_internamientos) {
    partes.push(`${expediente.total_internamientos} int${expediente.total_internamientos > 1 ? 's' : ''}`);
  }

  if (expediente.internamientos_activos) {
    partes.push(`${expediente.internamientos_activos} activo${expediente.internamientos_activos > 1 ? 's' : ''}`);
  }

  return partes.length > 0 ? partes.join(' • ') : 'Sin actividad';
}

/**
 * Valida los datos mínimos para crear un expediente
 */
export function validarDatosExpediente(datos: CreateExpedienteDto): { esValido: boolean; errores: string[] } {
  const errores: string[] = [];

  if (!datos.id_paciente) {
    errores.push('El ID del paciente es obligatorio');
  }

  if (datos.numero_expediente && datos.numero_expediente.trim().length < 6) {
    errores.push('El número de expediente debe tener al menos 6 caracteres');
  }

  if (datos.estado && !Object.values(ESTADOS_EXPEDIENTE_VALUES).includes(datos.estado as any)) {
    errores.push('El estado del expediente no es válido');
  }

  return {
    esValido: errores.length === 0,
    errores
  };
}

/**
 * Convierte filtros de expediente a parámetros de consulta
 */
export function filtrosAParametros(filtros: ExpedienteFilters): Record<string, string> {
  const parametros: Record<string, string> = {};

  if (filtros.estado && filtros.estado !== 'todos') {
    parametros['estado'] = filtros.estado;
  }

  if (filtros.fecha_inicio) {
    parametros['fecha_inicio'] = filtros.fecha_inicio;
  }

  if (filtros.fecha_fin) {
    parametros['fecha_fin'] = filtros.fecha_fin;
  }

  if (filtros.paciente_id) {
    parametros['paciente_id'] = filtros.paciente_id.toString();
  }

  if (filtros.tiene_internamiento_activo !== undefined) {
    parametros['tiene_internamiento_activo'] = filtros.tiene_internamiento_activo.toString();
  }

  if (filtros.buscar) {
    parametros['buscar'] = filtros.buscar;
  }

  if (filtros.limit) {
    parametros['limit'] = filtros.limit.toString();
  }

  if (filtros.offset) {
    parametros['offset'] = filtros.offset.toString();
  }

  return parametros;
}
