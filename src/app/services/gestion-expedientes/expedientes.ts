// src/app/services/gestion-expedientes/expedientes.service.ts
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import {
  Expediente,
  ExpedienteCompleto,
  DocumentoClinicoResumen,
  SignosVitalesResumen,
  CreateExpedienteDto,
  UpdateExpedienteDto,
  ApiResponse,
  Genero
} from '../../models';
// ==========================================
// INTERFACES ESPECÍFICAS PARA EL SERVICIO
// ==========================================


export interface Internamiento {
  id_internamiento: number;
  fecha_ingreso: string;
  fecha_egreso?: string;
  motivo_ingreso: string;
  diagnostico_ingreso?: string;
  diagnostico_egreso?: string;
  tipo_egreso?: string;
  observaciones?: string;
  servicio?: string;
  cama?: string;
  area_cama?: string;
  subarea_cama?: string;
  medico_responsable?: string;
  especialidad_medico?: string;
  dias_estancia: number;
}


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
  expedientes: {
    id_expediente: number;
    numero_expediente: string;
    fecha_apertura: string;
    estado: string;
    notas_administrativas?: string;
    total_documentos: number;
    total_internamientos: number;
    internamientos_activos: number;
    ultima_actividad?: string;
    ultimo_ingreso?: string;
  }[];
  total_expedientes: number;
}

export interface DashboardExpedientes {
  estadisticas: {
    total_expedientes: number;
    expedientes_activos: number;
    expedientes_cerrados: number;
    expedientes_archivados: number;
    expedientes_mes_actual: number;
    expedientes_semana_actual: number;
  };
  expedientes_con_internamiento_activo: {
    id_expediente: number;
    numero_expediente: string;
    nombre_paciente: string;
    fecha_ingreso: string;
    servicio?: string;
    cama?: string;
    medico_responsable?: string;
    dias_estancia: number;
  }[];
  expedientes_mas_activos: {
    id_expediente: number;
    numero_expediente: string;
    nombre_paciente: string;
    total_documentos: number;
    documentos_semana: number;
    ultima_actividad?: string;
  }[];
  alertas_activas: {
    tipo_alerta: string;
    mensaje: string;
    fecha_alerta: string;
    numero_expediente?: string;
    nombre_paciente?: string;
  }[];
}

export interface ValidacionAcceso {
  requiere_validacion: boolean;
  id_validacion?: number;
  acceso_inmediato: boolean;
}

export interface AuditoriaExpediente {
  expediente: {
    numero_expediente: string;
    nombre_paciente: string;
  };
  auditorias: {
    id_auditoria: number;
    fecha_acceso: string;
    accion: string;
    datos_anteriores?: any;
    datos_nuevos?: any;
    ip_acceso?: string;
    navegador?: string;
    tiempo_sesion?: number;
    observaciones?: string;
    medico_nombre?: string;
    especialidad?: string;
    numero_cedula?: string;
  }[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export interface AlertasExpediente {
  todas: Alerta[];
  por_tipo: {
    CRITICA: Alerta[];
    ADVERTENCIA: Alerta[];
    INFORMATIVA: Alerta[];
  };
  resumen: {
    total: number;
    activas: number;
    revisadas: number;
    cerradas: number;
  };
}

export interface Alerta {
  id_alerta: number;
  tipo_alerta: 'CRITICA' | 'ADVERTENCIA' | 'INFORMATIVA';
  mensaje: string;
  fecha_alerta: string;
  estado: 'ACTIVA' | 'REVISADA' | 'CERRADA';
  fecha_revision?: string;
  acciones_tomadas?: string;
  medico_generador?: string;
  medico_revisor?: string;
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

export interface ExpedienteFilters {
  estado?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  paciente_id?: number;
  tiene_internamiento_activo?: boolean;
  buscar?: string;
  limit?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExpedientesService extends BaseService<Expediente> {
  protected override endpoint = '/gestion-expedientes/expedientes';

  // ==========================================
  // MÉTODOS CRUD PRINCIPALES CON FILTROS ESPECÍFICOS
  // ==========================================

  /**
   * Obtener todos los expedientes con filtros específicos
   * GET /api/gestion-expedientes/expedientes
   */
  getExpedientes(filters?: ExpedienteFilters): Observable<ApiResponse<Expediente[]>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.estado) params = params.set('estado', filters.estado);
      if (filters.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
      if (filters.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
      if (filters.paciente_id) params = params.set('paciente_id', filters.paciente_id.toString());
      if (filters.tiene_internamiento_activo !== undefined) {
        params = params.set('tiene_internamiento_activo', filters.tiene_internamiento_activo.toString());
      }
      if (filters.buscar) params = params.set('buscar', filters.buscar);
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.offset) params = params.set('offset', filters.offset.toString());
    }

    return this.http.get<ApiResponse<Expediente[]>>(this.buildUrl(), { params });
  }

  /**
   * Obtener expediente por ID con información completa
   * GET /api/gestion-expedientes/expedientes/:id
   */
  getExpedienteCompleto(id: number): Observable<ApiResponse<ExpedienteCompleto>> {
    return this.getById(id) as Observable<ApiResponse<ExpedienteCompleto>>;
  }

  /**
   * Crear nuevo expediente con opciones avanzadas
   * POST /api/gestion-expedientes/expedientes
   */
  createExpedienteCompleto(data: CreateExpedienteDto & {
    crear_historia_clinica?: boolean;
    id_medico_creador?: number;
  }): Observable<ApiResponse<Expediente>> {
    return this.create(data);
  }

  /**
   * Eliminar expediente con opción de forzar
   * DELETE /api/gestion-expedientes/expedientes/:id
   */
  deleteExpediente(id: number, options?: {
    force?: boolean;
    id_medico_eliminador?: number;
    motivo_eliminacion?: string;
  }): Observable<ApiResponse<any>> {
    const data = options || {};
    return this.customPost(`/${id}`, data); // Usamos POST porque enviamos datos en el body
  }

  // ==========================================
  // MÉTODOS ESPECÍFICOS DE LA API
  // ==========================================

  /**
   * Buscar expedientes para autocomplete
   * GET /api/gestion-expedientes/expedientes/buscar
   */
  buscarExpedientes(query: string, activosSolo: boolean = true): Observable<ApiResponse<ExpedienteBusqueda[]>> {
    return this.customGet('/buscar', { q: query, activos_solo: activosSolo });
  }

  /**
   * Obtener dashboard de expedientes
   * GET /api/gestion-expedientes/expedientes/dashboard
   */
  getDashboard(): Observable<ApiResponse<DashboardExpedientes>> {
    return this.customGet('/dashboard');
  }

  /**
   * Obtener expedientes por paciente
   * GET /api/gestion-expedientes/expedientes/paciente/:id_paciente
   */
  getExpedientesPorPaciente(idPaciente: number, incluirEliminados: boolean = false): Observable<ApiResponse<ExpedientesPorPaciente>> {
    return this.customGet(`/paciente/${idPaciente}`, { incluir_eliminados: incluirEliminados });
  }

  /**
   * Validar acceso a expediente (para reingresos)
   * POST /api/gestion-expedientes/expedientes/:id/validar-acceso
   */
  validarAccesoExpediente(idExpediente: number, data: {
    id_medico: number;
    justificacion_acceso?: string;
  }): Observable<ApiResponse<ValidacionAcceso>> {
    return this.customPost(`/${idExpediente}/validar-acceso`, data);
  }

  /**
   * Completar validación de reingreso
   * POST /api/gestion-expedientes/expedientes/:id/validar-reingreso
   */
  validarReingreso(idExpediente: number, data: ValidacionReingreso): Observable<ApiResponse<any>> {
    return this.customPost(`/${idExpediente}/validar-reingreso`, data);
  }

  /**
   * Obtener auditoría del expediente
   * GET /api/gestion-expedientes/expedientes/:id/auditoria
   */
  getAuditoria(idExpediente: number, filters?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    tipo_accion?: string;
    id_medico?: number;
    limit?: number;
    offset?: number;
  }): Observable<ApiResponse<AuditoriaExpediente>> {
    return this.customGet(`/${idExpediente}/auditoria`, filters);
  }

  /**
   * Obtener alertas del expediente
   * GET /api/gestion-expedientes/expedientes/:id/alertas
   */
  getAlertas(idExpediente: number, filters?: {
    estado_alerta?: 'ACTIVA' | 'REVISADA' | 'CERRADA' | 'todas';
    tipo_alerta?: 'CRITICA' | 'ADVERTENCIA' | 'INFORMATIVA';
  }): Observable<ApiResponse<AlertasExpediente>> {
    return this.customGet(`/${idExpediente}/alertas`, filters);
  }

  /**
   * Actualizar alerta específica
   * PUT /api/gestion-expedientes/expedientes/:id/alertas/:id_alerta
   */
  updateAlerta(idExpediente: number, idAlerta: number, data: {
    estado?: 'ACTIVA' | 'REVISADA' | 'CERRADA';
    acciones_tomadas?: string;
    id_medico_revisor?: number;
  }): Observable<ApiResponse<Alerta>> {
    return this.customPut(`/${idExpediente}/alertas/${idAlerta}`, data);
  }

  /**
   * Generar reporte del expediente
   * GET /api/gestion-expedientes/expedientes/:id/reporte
   */
  generarReporte(idExpediente: number, options?: {
    incluir_documentos?: boolean;
    incluir_internamientos?: boolean;
  }): Observable<ApiResponse<any>> {
    return this.customGet(`/${idExpediente}/reporte`, options);
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /**
   * Obtener expedientes activos
   */
  getExpedientesActivos(filters?: Omit<ExpedienteFilters, 'estado'>): Observable<ApiResponse<Expediente[]>> {
    return this.getExpedientes({ ...filters, estado: 'Activo' });
  }

  /**
   * Obtener expedientes con internamientos activos
   */
  getExpedientesConInternamientoActivo(filters?: Omit<ExpedienteFilters, 'tiene_internamiento_activo'>): Observable<ApiResponse<Expediente[]>> {
    return this.getExpedientes({ ...filters, tiene_internamiento_activo: true });
  }

  /**
   * Verificar si un expediente requiere validación de reingreso
   */
  verificarValidacionReingreso(idExpediente: number, idMedico: number): Observable<ApiResponse<ValidacionAcceso>> {
    return this.validarAccesoExpediente(idExpediente, { id_medico: idMedico });
  }

  /**
   * Cerrar expediente (cambiar estado a Cerrado)
   */
  cerrarExpediente(idExpediente: number, data: {
    notas_administrativas?: string;
    id_medico_modificador?: number;
  }): Observable<ApiResponse<Expediente>> {
    return this.update(idExpediente, { ...data });
  }

  /**
   * Archivar expediente
   */
  archivarExpediente(idExpediente: number, data: {
    notas_administrativas?: string;
    id_medico_modificador?: number;
  }): Observable<ApiResponse<Expediente>> {
    return this.update(idExpediente, { ...data });
  }

  /**
   * Reactivar expediente
   */
  reactivarExpediente(idExpediente: number, data: {
    notas_administrativas?: string;
    id_medico_modificador?: number;
  }): Observable<ApiResponse<Expediente>> {
    return this.update(idExpediente, { ...data });
  }

  /**
   * Obtener estadísticas de expedientes (override del método base)
   */
  override getEstadisticas(): Observable<ApiResponse<any>> {
    return this.getDashboard();
  }

  /**
   * Buscar expedientes por número
   */
  buscarPorNumero(numeroExpediente: string): Observable<ApiResponse<ExpedienteBusqueda[]>> {
    return this.buscarExpedientes(numeroExpediente);
  }

  /**
   * Buscar expedientes por paciente (nombre, CURP, etc.)
   */
  buscarPorPaciente(queryPaciente: string): Observable<ApiResponse<ExpedienteBusqueda[]>> {
    return this.buscarExpedientes(queryPaciente);
  }

  /**
   * Obtener expedientes del día actual
   */
  getExpedientesHoy(): Observable<ApiResponse<Expediente[]>> {
    const hoy = new Date().toISOString().split('T')[0];
    return this.getExpedientes({
      fecha_inicio: hoy,
      fecha_fin: hoy
    });
  }

  /**
   * Obtener expedientes de la semana actual
   */
  getExpedientesSemana(): Observable<ApiResponse<Expediente[]>> {
    const hoy = new Date();
    const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
    const finSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 6));

    return this.getExpedientes({
      fecha_inicio: inicioSemana.toISOString().split('T')[0],
      fecha_fin: finSemana.toISOString().split('T')[0]
    });
  }

  /**
   * Obtener expedientes por rango de fechas
   */
  getExpedientesPorRango(fechaInicio: string, fechaFin: string): Observable<ApiResponse<Expediente[]>> {
    return this.getExpedientes({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
  }

// ==========================================
  // MÉTODOS FALTANTES - AGREGAR AL FINAL DE LA CLASE
  // ==========================================

  /**
   * MÉTODO FALTANTE: Crear expediente (método principal)
   * POST /api/gestion-expedientes/expedientes
   */
  createExpediente(data: CreateExpedienteDto): Observable<ApiResponse<Expediente>> {
    return this.create(data);
  }

  /**
   * MÉTODO FALTANTE: Obtener expediente por ID de paciente (principal/activo)
   * GET /api/gestion-expedientes/expedientes/paciente/:id_paciente/principal
   */
  getExpedienteByPacienteId(idPaciente: number): Observable<ApiResponse<Expediente>> {
    return this.customGet(`/paciente/${idPaciente}/principal`);
  }

  /**
   * MÉTODO FALTANTE: Generar número de expediente automático
   * GET /api/gestion-expedientes/expedientes/generar-numero
   */
  generateNumeroExpediente(): Observable<ApiResponse<{ numero_expediente: string }>> {
    return this.customGet('/generar-numero');
  }

  // ==========================================
  // ALIAS PARA COMPATIBILIDAD
  // ==========================================

  /**
   * Alias para compatibilidad con código existente
   */
  generarNumeroExpediente = this.generateNumeroExpediente;

}
