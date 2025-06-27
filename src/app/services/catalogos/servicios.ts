import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Servicios {

  private readonly API_URL = 'http://localhost:3000/api/catalogos/servicios';

  constructor() { }
}











// // src/app/services/catalogos/servicios.ts
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { BaseService } from '../base.service';
// import { ApiResponse, BaseFilters } from '../../models/base.models';

// // ==========================================
// // INTERFACES ESPECÍFICAS
// // ==========================================

// export interface Servicio {
//   id_servicio: number;
//   nombre: string;
//   descripcion?: string;
//   activo: boolean;
//   created_at?: string;
//   updated_at?: string;

//   // Estadísticas adicionales
//   total_personal?: number;
//   personal_activo?: number;
//   total_pacientes_atendidos?: number;
//   promedio_estancia?: number;
// }

// export interface ServicioFilters extends BaseFilters {
//   nombre?: string;
//   con_personal?: boolean;
//   con_pacientes?: boolean;
// }

// export interface CreateServicioDto {
//   nombre: string;
//   descripcion?: string;
//   activo?: boolean;
// }

// export interface UpdateServicioDto extends Partial<CreateServicioDto> {
//   id_servicio: number;
// }

// export interface ServicioEstadisticas {
//   total_servicios: number;
//   servicios_activos: number;
//   servicios_inactivos: number;
//   servicios_con_personal: number;
//   servicios_sin_personal: number;
//   promedio_personal_por_servicio: number;
//   servicio_con_mas_personal: {
//     nombre: string;
//     total_personal: number;
//   };
//   distribución_por_turno: {
//     matutino: number;
//     vespertino: number;
//     nocturno: number;
//     jornada_acumulada: number;
//   };
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class ServiciosService extends BaseService<Servicio> {
//   protected override endpoint = '/catalogos/servicios';

//   // ==========================================
//   // MÉTODOS CRUD EXTENDIDOS
//   // ==========================================

//   /**
//    * Obtener todos los servicios con filtros específicos
//    */
//   override getAll(filters?: ServicioFilters): Observable<ApiResponse<Servicio[]>> {
//     return super.getAll(filters);
//   }

//   /**
//    * Buscar servicios por nombre
//    */
//   buscarPorNombre(nombre: string): Observable<Servicio[]> {
//     return this.search(nombre).pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Obtener servicios activos (para selects/dropdowns)
//    */
//   getServiciosActivos(): Observable<Servicio[]> {
//     return this.getActivos().pipe(
//       map(response => response.data || [])
//     );
//   }

//   // ==========================================
//   // MÉTODOS ESPECÍFICOS DE SERVICIOS
//   // ==========================================

//   /**
//    * Obtener estadísticas completas de servicios
//    */
//   // override getEstadisticas(): Observable<ServicioEstadisticas> {
//   //   return super.getEstadisticas().pipe(
//   //     map(response => response.data!)
//   //   );
//   // }

//   /**
//    * Obtener servicios con personal asignado
//    */
//   getServiciosConPersonal(): Observable<Servicio[]> {
//     return this.customGet<Servicio[]>('/con-personal').pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Obtener servicios sin personal asignado
//    */
//   getServiciosSinPersonal(): Observable<Servicio[]> {
//     return this.customGet<Servicio[]>('/sin-personal').pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Obtener personal asignado a un servicio específico
//    */
//   getPersonalDelServicio(idServicio: number): Observable<any[]> {
//     return this.customGet<any[]>(`/${idServicio}/personal`).pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Obtener pacientes actualmente en un servicio
//    */
//   getPacientesDelServicio(idServicio: number): Observable<any[]> {
//     return this.customGet<any[]>(`/${idServicio}/pacientes`).pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Obtener historial de pacientes atendidos en un servicio
//    */
//   getHistorialPacientes(idServicio: number, filters?: {
//     fecha_inicio?: string;
//     fecha_fin?: string;
//     page?: number;
//     limit?: number;
//   }): Observable<ApiResponse<any[]>> {
//     return this.customGet<any[]>(`/${idServicio}/historial-pacientes`, filters);
//   }

//   /**
//    * Obtener camas disponibles en un servicio
//    */
//   getCamasDisponibles(idServicio: number): Observable<any[]> {
//     return this.customGet<any[]>(`/${idServicio}/camas-disponibles`).pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Obtener estadísticas específicas de un servicio
//    */
//   getEstadisticasServicio(idServicio: number): Observable<{
//     total_personal: number;
//     personal_por_turno: any;
//     ocupacion_promedio: number;
//     tiempo_estancia_promedio: number;
//     pacientes_mes_actual: number;
//     ingresos_por_mes: any[];
//   }> {
//     return this.customGet<any>(`/${idServicio}/estadisticas`).pipe(
//       map(response => response.data!)
//     );
//   }

//   // ==========================================
//   // MÉTODOS DE GESTIÓN AVANZADA
//   // ==========================================

//   /**
//    * Asignar personal a un servicio
//    */
//   asignarPersonal(idServicio: number, idPersonalMedico: number): Observable<boolean> {
//     return this.customPost<any>(`/${idServicio}/asignar-personal`, {
//       id_personal_medico: idPersonalMedico
//     }).pipe(
//       map(response => response.success)
//     );
//   }

//   /**
//    * Remover personal de un servicio
//    */
//   removerPersonal(idServicio: number, idPersonalMedico: number): Observable<boolean> {
//     return this.customPost<any>(`/${idServicio}/remover-personal`, {
//       id_personal_medico: idPersonalMedico
//     }).pipe(
//       map(response => response.success)
//     );
//   }

//   /**
//    * Transferir paciente entre servicios
//    */
//   transferirPaciente(idPaciente: number, servicioOrigen: number, servicioDestino: number, motivo: string): Observable<boolean> {
//     return this.customPost<any>('/transferir-paciente', {
//       id_paciente: idPaciente,
//       servicio_origen: servicioOrigen,
//       servicio_destino: servicioDestino,
//       motivo: motivo
//     }).pipe(
//       map(response => response.success)
//     );
//   }

//   /**
//    * Obtener capacidad y ocupación de un servicio
//    */
//   getCapacidadServicio(idServicio: number): Observable<{
//     capacidad_total: number;
//     ocupacion_actual: number;
//     porcentaje_ocupacion: number;
//     camas_disponibles: number;
//     camas_mantenimiento: number;
//     lista_espera: number;
//   }> {
//     return this.customGet<any>(`/${idServicio}/capacidad`).pipe(
//       map(response => response.data!)
//     );
//   }

//   // ==========================================
//   // MÉTODOS DE VALIDACIÓN
//   // ==========================================

//   /**
//    * Validar si un nombre de servicio está disponible
//    */
//   validarNombreDisponible(nombre: string, idExcluir?: number): Observable<boolean> {
//     const params: any = { nombre };
//     if (idExcluir) {
//       params.excluir_id = idExcluir;
//     }

//     return this.customGet<{ disponible: boolean }>('/validar-nombre', params).pipe(
//       map(response => response.data?.disponible || false)
//     );
//   }

//   /**
//    * Verificar si se puede eliminar un servicio
//    */
//   puedeEliminar(idServicio: number): Observable<{
//     puede_eliminar: boolean;
//     motivos: string[];
//     personal_asignado: number;
//     pacientes_activos: number;
//   }> {
//     return this.customGet<any>(`/${idServicio}/puede-eliminar`).pipe(
//       map(response => response.data!)
//     );
//   }

//   // ==========================================
//   // MÉTODOS DE UTILIDAD
//   // ==========================================

//   /**
//    * Obtener servicios más utilizados
//    */
//   getServiciosMasUtilizados(limite: number = 10): Observable<Servicio[]> {
//     return this.customGet<Servicio[]>('/mas-utilizados', { limite }).pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Generar reporte de actividad de servicios
//    */
//   generarReporteActividad(filtros: {
//     fecha_inicio: string;
//     fecha_fin: string;
//     incluir_inactivos?: boolean;
//   }): Observable<{
//     servicios: any[];
//     resumen: any;
//     graficos: any;
//   }> {
//     return this.customPost<any>('/reporte-actividad', filtros).pipe(
//       map(response => response.data!)
//     );
//   }

//   /**
//    * Exportar listado de servicios
//    */
//   exportarServicios(formato: 'excel' | 'pdf' | 'csv' = 'excel'): Observable<Blob> {
//     return this.http.get(`${this.buildUrl()}/exportar`, {
//       params: { formato },
//       responseType: 'blob'
//     });
//   }

//   /**
//    * Importar servicios desde archivo
//    */
//   importarServicios(archivo: File): Observable<{
//     exitosos: number;
//     errores: number;
//     detalles: any[];
//   }> {
//     const formData = new FormData();
//     formData.append('archivo', archivo);

//     return this.http.post<ApiResponse<any>>(`${this.buildUrl()}/importar`, formData).pipe(
//       map(response => response.data!)
//     );
//   }
// }
