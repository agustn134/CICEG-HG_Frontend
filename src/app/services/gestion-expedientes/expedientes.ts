import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Expedientes {

  private readonly API_URL = 'http://localhost:3000/api/personas/expedientes';

  constructor() { }
}


























// // src/app/services/gestion-expedientes/expedientes.ts
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { BaseService } from '../base.service';
// import { ApiResponse, BaseFilters } from '../../models/base.models';

// // ==========================================
// // INTERFACES ESPECÍFICAS DE EXPEDIENTES
// // ==========================================

// export interface Expediente {
//   id_expediente: number;
//   numero_expediente: string;
//   id_paciente: number;
//   fecha_apertura: string;
//   fecha_ultima_consulta?: string;
//   activo: boolean;
//   observaciones?: string;
//   created_at?: string;
//   updated_at?: string;

//   // Información del paciente
//   paciente?: {
//     id_paciente: number;
//     nombre: string;
//     apellido_paterno: string;
//     apellido_materno?: string;
//     fecha_nacimiento: string;
//     genero: string;
//     numero_telefono?: string;
//     email?: string;
//   };

//   // Estadísticas del expediente
//   total_consultas?: number;
//   total_internamientos?: number;
//   total_documentos?: number;
//   ultimo_diagnostico?: string;
//   medico_tratante?: string;
//   servicio_actual?: string;
// }

// export interface ExpedienteFilters extends BaseFilters {
//   numero_expediente?: string;
//   id_paciente?: number;
//   nombre_paciente?: string;
//   fecha_apertura_inicio?: string;
//   fecha_apertura_fin?: string;
//   con_internamientos_activos?: boolean;
//   servicio?: string;
//   medico_tratante?: number;
// }

// export interface CreateExpedienteDto {
//   id_paciente: number;
//   observaciones?: string;
//   activo?: boolean;
// }

// export interface UpdateExpedienteDto extends Partial<CreateExpedienteDto> {
//   id_expediente: number;
// }

// export interface ExpedienteCompleto extends Expediente {
//   internamientos: any[];
//   documentos_clinicos: any[];
//   signos_vitales: any[];
//   alertas_medicas: any[];
//   historial_accesos: any[];
// }

// export interface AlertaExpediente {
//   id_alerta: number;
//   tipo_alerta: 'medicamento' | 'alergia' | 'condicion' | 'procedimiento' | 'otra';
//   descripcion: string;
//   nivel_criticidad: 'baja' | 'media' | 'alta' | 'critica';
//   fecha_creacion: string;
//   activa: boolean;
//   creado_por: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class ExpedientesService extends BaseService<Expediente> {
//   protected override endpoint = '/gestion-expedientes/expedientes';

//   // ==========================================
//   // MÉTODOS CRUD EXTENDIDOS
//   // ==========================================

//   /**
//    * Obtener todos los expedientes con filtros específicos
//    */
//   override getAll(filters?: ExpedienteFilters): Observable<ApiResponse<Expediente[]>> {
//     return super.getAll(filters);
//   }

//   /**
//    * Buscar expedientes por número o datos del paciente
//    */
//   buscarExpediente(termino: string): Observable<Expediente[]> {
//     return this.customGet<Expediente[]>('/buscar', { termino }).pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Obtener expediente completo con todos los datos relacionados
//    */
//   getExpedienteCompleto(idExpediente: number): Observable<ExpedienteCompleto> {
//     return this.customGet<ExpedienteCompleto>(`/${idExpediente}/completo`).pipe(
//       map(response => response.data!)
//     );
//   }

//   // ==========================================
//   // GESTIÓN DE EXPEDIENTES
//   // ==========================================

//   /**
//    * Crear expediente con validaciones automáticas
//    */
//   override create(data: CreateExpedienteDto): Observable<ApiResponse<Expediente>> {
//     return super.create(data);
//   }

//   /**
//    * Generar número de expediente automático
//    */
//   generarNumeroExpediente(): Observable<string> {
//     return this.customGet<{ numero: string }>('/generar-numero').pipe(
//       map(response => response.data!.numero)
//     );
//   }

//   /**
//    * Validar acceso al expediente
//    */
//   validarAcceso(idExpediente: number, motivoAcceso: string): Observable<{
//     acceso_permitido: boolean;
//     motivo_denegacion?: string;
//     requiere_autorizacion?: boolean;
//   }> {
//     return this.customPost<any>(`/${idExpediente}/validar-acceso`, { motivo_acceso: motivoAcceso }).pipe(
//       map(response => response.data!)
//     );
//   }

//   /**
//    * Registrar acceso al expediente (auditoría)
//    */
//   registrarAcceso(idExpediente: number, tipoAcceso: string, observaciones?: string): Observable<boolean> {
//     return this.customPost<any>(`/${idExpediente}/registrar-acceso`, {
//       tipo_acceso: tipoAcceso,
//       observaciones
//     }).pipe(
//       map(response => response.success)
//     );
//   }

//   /**
//    * Cerrar expediente (dar de alta)
//    */
//   cerrarExpediente(idExpediente: number, motivoCierre: string, observaciones?: string): Observable<boolean> {
//     return this.customPatch<any>(`/${idExpediente}/cerrar`, {
//       motivo_cierre: motivoCierre,
//       observaciones
//     }).pipe(
//       map(response => response.success)
//     );
//   }

//   /**
//    * Reactivar expediente
//    */
//   reactivarExpediente(idExpediente: number, motivo: string): Observable<boolean> {
//     return this.customPatch<any>(`/${idExpediente}/reactivar`, { motivo }).pipe(
//       map(response => response.success)
//     );
//   }

//   // ==========================================
//   // GESTIÓN DE ALERTAS
//   // ==========================================

//   /**
//    * Obtener alertas del expediente
//    */
//   getAlertas(idExpediente: number): Observable<AlertaExpediente[]> {
//     return this.customGet<AlertaExpediente[]>(`/${idExpediente}/alertas`).pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Crear nueva alerta
//    */
//   crearAlerta(idExpediente: number, alerta: Partial<AlertaExpediente>): Observable<AlertaExpediente> {
//     return this.customPost<AlertaExpediente>(`/${idExpediente}/alertas`, alerta).pipe(
//       map(response => response.data!)
//     );
//   }

//   /**
//    * Actualizar alerta existente
//    */
//   actualizarAlerta(idExpediente: number, idAlerta: number, alerta: Partial<AlertaExpediente>): Observable<AlertaExpediente> {
//     return this.customPut<AlertaExpediente>(`/${idExpediente}/alertas/${idAlerta}`, alerta).pipe(
//       map(response => response.data!)
//     );
//   }

//   /**
//    * Desactivar alerta
//    */
//   desactivarAlerta(idExpediente: number, idAlerta: number): Observable<boolean> {
//     return this.customPatch<any>(`/${idExpediente}/alertas/${idAlerta}/desactivar`, {}).pipe(
//       map(response => response.success)
//     );
//   }

//   // ==========================================
//   // HISTORIAL Y AUDITORÍA
//   // ==========================================

//   /**
//    * Obtener historial completo de accesos
//    */
//   getHistorialAccesos(idExpediente: number, filtros?: {
//     fecha_inicio?: string;
//     fecha_fin?: string;
//     tipo_acceso?: string;
//     usuario?: string;
//   }): Observable<ApiResponse<any[]>> {
//     return this.customGet<any[]>(`/${idExpediente}/auditoria`, filtros);
//   }

//   /**
//    * Obtener historial de modificaciones
//    */
//   getHistorialModificaciones(idExpediente: number): Observable<any[]> {
//     return this.customGet<any[]>(`/${idExpediente}/historial-modificaciones`).pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Obtener línea de tiempo del expediente
//    */
//   getLineaTiempo(idExpediente: number): Observable<{
//     eventos: {
//       fecha: string;
//       tipo: string;
//       descripcion: string;
//       usuario: string;
//       detalles?: any;
//     }[];
//   }> {
//     return this.customGet<any>(`/${idExpediente}/linea-tiempo`).pipe(
//       map(response => response.data!)
//     );
//   }

//   // ==========================================
//   // DOCUMENTOS CLÍNICOS
//   // ==========================================

//   /**
//    * Obtener todos los documentos del expediente
//    */
//   getDocumentos(idExpediente: number, filtros?: {
//     tipo_documento?: string;
//     fecha_inicio?: string;
//     fecha_fin?: string;
//     medico?: number;
//   }): Observable<any[]> {
//     return this.customGet<any[]>(`/${idExpediente}/documentos`, filtros).pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Obtener documentos por tipo específico
//    */
//   getDocumentosPorTipo(idExpediente: number, tipoDocumento: string): Observable<any[]> {
//     return this.customGet<any[]>(`/${idExpediente}/documentos/${tipoDocumento}`).pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Obtener última historia clínica
//    */
//   getUltimaHistoriaClinica(idExpediente: number): Observable<any> {
//     return this.customGet<any>(`/${idExpediente}/ultima-historia-clinica`).pipe(
//       map(response => response.data!)
//     );
//   }

//   /**
//    * Obtener últimos signos vitales
//    */
//   getUltimosSignosVitales(idExpediente: number, limite: number = 5): Observable<any[]> {
//     return this.customGet<any[]>(`/${idExpediente}/ultimos-signos-vitales`, { limite }).pipe(
//       map(response => response.data || [])
//     );
//   }

//   // ==========================================
//   // INTERNAMIENTOS
//   // ==========================================

//   /**
//    * Obtener internamientos del expediente
//    */
//   getInternamientos(idExpediente: number, soloActivos: boolean = false): Observable<any[]> {
//     return this.customGet<any[]>(`/${idExpediente}/internamientos`, { solo_activos: soloActivos }).pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Obtener internamiento activo
//    */
//   getInternamientoActivo(idExpediente: number): Observable<any | null> {
//     return this.customGet<any>(`/${idExpediente}/internamiento-activo`).pipe(
//       map(response => response.data)
//     );
//   }

//   /**
//    * Verificar si tiene internamiento activo
//    */
//   tieneInternamientoActivo(idExpediente: number): Observable<boolean> {
//     return this.getInternamientoActivo(idExpediente).pipe(
//       map(internamiento => !!internamiento)
//     );
//   }

//   // ==========================================
//   // ESTADÍSTICAS Y REPORTES
//   // ==========================================

//   /**
//    * Obtener estadísticas del expediente
//    */
//   getEstadisticasExpediente(idExpediente: number): Observable<{
//     total_consultas: number;
//     total_internamientos: number;
//     total_documentos: number;
//     dias_hospitalizacion_total: number;
//     ultimo_ingreso: string;
//     diagnosticos_frecuentes: string[];
//     medicamentos_recurrentes: string[];
//     alergias_conocidas: string[];
//   }> {
//     return this.customGet<any>(`/${idExpediente}/estadisticas`).pipe(
//       map(response => response.data!)
//     );
//   }

//   /**
//    * Generar reporte completo del expediente
//    */
//   generarReporte(idExpediente: number, incluir: {
//     historia_clinica?: boolean;
//     documentos_clinicos?: boolean;
//     signos_vitales?: boolean;
//     internamientos?: boolean;
//     alertas?: boolean;
//   } = {}): Observable<any> {
//     return this.customPost<any>(`/${idExpediente}/reporte`, incluir).pipe(
//       map(response => response.data!)
//     );
//   }

//   /**
//    * Exportar expediente completo
//    */
//   exportarExpediente(idExpediente: number, formato: 'pdf' | 'excel' = 'pdf'): Observable<Blob> {
//     return this.http.get(`${this.buildUrl()}/${idExpediente}/exportar`, {
//       params: { formato },
//       responseType: 'blob'
//     });
//   }

//   // ==========================================
//   // BÚSQUEDAS Y CONSULTAS ESPECIALES
//   // ==========================================

//   /**
//    * Buscar expedientes por criterios múltiples
//    */
//   busquedaAvanzada(criterios: {
//     numero_expediente?: string;
//     nombre_paciente?: string;
//     apellido_paterno?: string;
//     fecha_nacimiento?: string;
//     numero_telefono?: string;
//     email?: string;
//     diagnostico?: string;
//     medicamento?: string;
//   }): Observable<Expediente[]> {
//     return this.customPost<Expediente[]>('/busqueda-avanzada', criterios).pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Obtener expedientes por paciente
//    */
//   getExpedientesPorPaciente(idPaciente: number): Observable<Expediente[]> {
//     return this.customGet<Expediente[]>(`/paciente/${idPaciente}`).pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Obtener expedientes con alertas activas
//    */
//   getExpedientesConAlertas(nivel?: 'baja' | 'media' | 'alta' | 'critica'): Observable<Expediente[]> {
//     return this.customGet<Expediente[]>('/con-alertas', { nivel }).pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Obtener expedientes que requieren seguimiento
//    */
//   getExpedientesSeguimiento(): Observable<Expediente[]> {
//     return this.customGet<Expediente[]>('/requieren-seguimiento').pipe(
//       map(response => response.data || [])
//     );
//   }

//   // ==========================================
//   // VALIDACIONES
//   // ==========================================

//   /**
//    * Validar si se puede crear un nuevo expediente para un paciente
//    */
//   puedeCrearExpediente(idPaciente: number): Observable<{
//     puede_crear: boolean;
//     motivo?: string;
//     expediente_activo?: number;
//   }> {
//     return this.customGet<any>('/validar-creacion', { id_paciente: idPaciente }).pipe(
//       map(response => response.data!)
//     );
//   }

//   /**
//    * Validar número de expediente único
//    */
//   validarNumeroExpediente(numero: string, excluirId?: number): Observable<boolean> {
//     const params: any = { numero };
//     if (excluirId) params.excluir_id = excluirId;

//     return this.customGet<{ disponible: boolean }>('/validar-numero', params).pipe(
//       map(response => response.data?.disponible || false)
//     );
//   }

//   // ==========================================
//   // MÉTODOS DE UTILIDAD
//   // ==========================================

//   /**
//    * Obtener resumen rápido del expediente
//    */
//   getResumenRapido(idExpediente: number): Observable<{
//     paciente: string;
//     edad: number;
//     ultimo_diagnostico: string;
//     dias_ultima_consulta: number;
//     alertas_activas: number;
//     internamiento_activo: boolean;
//   }> {
//     return this.customGet<any>(`/${idExpediente}/resumen`).pipe(
//       map(response => response.data!)
//     );
//   }

//   /**
//    * Verificar compatibilidad para procedimientos
//    */
//   verificarCompatibilidad(idExpediente: number, tipoProcedimiento: string): Observable<{
//     compatible: boolean;
//     alertas: string[];
//     recomendaciones: string[];
//   }> {
//     return this.customPost<any>(`/${idExpediente}/verificar-compatibilidad`, {
//       tipo_procedimiento: tipoProcedimiento
//     }).pipe(
//       map(response => response.data!)
//     );
//   }
// }
