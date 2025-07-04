// src/app/services/documentos-clinicos/notas-urgencias.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  NotaUrgencias,
  NotaUrgenciasDetallada,
  NotaUrgenciasFilters,
  CreateNotaUrgenciasDto,
  UpdateNotaUrgenciasDto,
  NotaUrgenciasListResponse,
  EstadisticasUrgencias,
  PanelUrgenciasTiempoReal,
  PacienteFrecuenteUrgencias,
  ValidacionNotaUrgencias,
  CAMPOS_OBLIGATORIOS_URGENCIAS,
  ESTADOS_CONCIENCIA_OPCIONES,
  PRONOSTICOS_URGENCIAS,
  NivelUrgencia,
  EstadoActualPaciente
} from '../../models/nota-urgencias.model';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class NotasUrgenciasService {
  private readonly API_URL = 'http://localhost:3000/api/documentos-clinicos/notas-urgencias';

  constructor(private http: HttpClient) { }

  // ==========================================
  // OPERACIONES CRUD BÁSICAS
  // ==========================================

  /**
   * Obtener todas las notas de urgencias con filtros y paginación
   */
  getNotasUrgencias(filters?: NotaUrgenciasFilters): Observable<ApiResponse<NotaUrgencias[]>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.page !== undefined) {
        params = params.set('page', filters.page.toString());
      }
      if (filters.limit !== undefined) {
        params = params.set('limit', filters.limit.toString());
      }
      if (filters.id_documento) {
        params = params.set('id_documento', filters.id_documento.toString());
      }
      if (filters.id_expediente) {
        params = params.set('id_expediente', filters.id_expediente.toString());
      }
      if (filters.buscar) {
        params = params.set('buscar', filters.buscar);
      }
      if (filters.fecha_inicio) {
        params = params.set('fecha_inicio', filters.fecha_inicio);
      }
      if (filters.fecha_fin) {
        params = params.set('fecha_fin', filters.fecha_fin);
      }
      if (filters.estado_conciencia) {
        params = params.set('estado_conciencia', filters.estado_conciencia);
      }
      if (filters.area_interconsulta) {
        params = params.set('area_interconsulta', filters.area_interconsulta.toString());
      }
      if (filters.prioridad_triage) {
        params = params.set('prioridad_triage', filters.prioridad_triage);
      }
      if (filters.sort_by) {
        params = params.set('sort_by', filters.sort_by);
      }
      if (filters.sort_order) {
        params = params.set('sort_order', filters.sort_order);
      }
    }

    return this.http.get<ApiResponse<NotaUrgencias[]>>(`${this.API_URL}`, { params });
  }

  /**
   * Obtener nota de urgencias por ID (vista completa)
   */
  getNotaUrgenciasById(id: number): Observable<ApiResponse<NotaUrgenciasDetallada>> {
    return this.http.get<ApiResponse<NotaUrgenciasDetallada>>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtener nota de urgencias por documento
   */
  getNotaUrgenciasByDocumento(idDocumento: number): Observable<ApiResponse<NotaUrgencias>> {
    return this.http.get<ApiResponse<NotaUrgencias>>(`${this.API_URL}/documento/${idDocumento}`);
  }

  /**
   * Obtener notas de urgencias por expediente
   */
  getNotasUrgenciasByExpediente(idExpediente: number): Observable<ApiResponse<NotaUrgencias[]>> {
    return this.http.get<ApiResponse<NotaUrgencias[]>>(`${this.API_URL}/expediente/${idExpediente}`);
  }

  /**
   * Crear nueva nota de urgencias
   */
  createNotaUrgencias(data: CreateNotaUrgenciasDto): Observable<ApiResponse<NotaUrgencias>> {
    return this.http.post<ApiResponse<NotaUrgencias>>(`${this.API_URL}`, data);
  }

  /**
   * Actualizar nota de urgencias existente
   */
  updateNotaUrgencias(id: number, data: UpdateNotaUrgenciasDto): Observable<ApiResponse<NotaUrgencias>> {
    return this.http.put<ApiResponse<NotaUrgencias>>(`${this.API_URL}/${id}`, data);
  }

  /**
   * Eliminar (anular) nota de urgencias
   */
  deleteNotaUrgencias(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtener estadísticas de urgencias
   */
  getEstadisticasUrgencias(periodo?: number): Observable<ApiResponse<EstadisticasUrgencias>> {
    let params = new HttpParams();
    if (periodo) {
      params = params.set('periodo', periodo.toString());
    }
    return this.http.get<ApiResponse<EstadisticasUrgencias>>(`${this.API_URL}/estadisticas`, { params });
  }

  /**
   * Obtener panel de urgencias en tiempo real
   */
  getPanelTiempoReal(): Observable<ApiResponse<PanelUrgenciasTiempoReal>> {
    return this.http.get<ApiResponse<PanelUrgenciasTiempoReal>>(`${this.API_URL}/panel-tiempo-real`);
  }

  /**
   * Obtener pacientes frecuentes en urgencias
   */
  getPacientesFrecuentes(meses?: number, minimoVisitas?: number): Observable<ApiResponse<PacienteFrecuenteUrgencias[]>> {
    let params = new HttpParams();
    if (meses) {
      params = params.set('meses', meses.toString());
    }
    if (minimoVisitas) {
      params = params.set('minimo_visitas', minimoVisitas.toString());
    }
    return this.http.get<ApiResponse<PacienteFrecuenteUrgencias[]>>(`${this.API_URL}/pacientes-frecuentes`, { params });
  }

  // ==========================================
  // MÉTODOS DE VALIDACIÓN Y UTILIDAD
  // ==========================================

  /**
   * Validar datos antes de crear nota de urgencias
   */
  validarDatosNotaUrgencias(data: CreateNotaUrgenciasDto): ValidacionNotaUrgencias {
    const errores: string[] = [];
    const advertencias: string[] = [];
    const camposFaltantes: string[] = [];

    // Validaciones obligatorias
    if (!data.id_documento) {
      errores.push('El documento clínico es obligatorio');
      camposFaltantes.push('id_documento');
    }

    if (!data.motivo_atencion || data.motivo_atencion.trim() === '') {
      errores.push('El motivo de atención es obligatorio');
      camposFaltantes.push('motivo_atencion');
    }

    // Validaciones recomendadas
    if (!data.estado_conciencia || data.estado_conciencia.trim() === '') {
      advertencias.push('Se recomienda especificar el estado de conciencia del paciente');
    }

    if (!data.exploracion_fisica || data.exploracion_fisica.trim() === '') {
      advertencias.push('Se recomienda agregar hallazgos de exploración física');
    }

    if (!data.diagnostico || data.diagnostico.trim() === '') {
      advertencias.push('Se recomienda establecer un diagnóstico de urgencias');
    }

    if (!data.plan_tratamiento || data.plan_tratamiento.trim() === '') {
      advertencias.push('Se recomienda especificar el plan de tratamiento');
    }

    return {
      valido: errores.length === 0,
      errores,
      advertencias,
      campos_faltantes: camposFaltantes
    };
  }

  /**
   * Determinar nivel de urgencia basado en estado de conciencia
   */
  determinarNivelUrgencia(estadoConciencia?: string): NivelUrgencia {
    if (!estadoConciencia) {
      return NivelUrgencia.POR_EVALUAR;
    }

    const estado = estadoConciencia.toLowerCase();

    if (estado.includes('inconsciente') || estado.includes('coma')) {
      return NivelUrgencia.CRITICO;
    }

    if (estado.includes('somnoliento') || estado.includes('confuso') || estado.includes('estuporoso')) {
      return NivelUrgencia.GRAVE;
    }

    if (estado.includes('alerta') || estado.includes('consciente')) {
      return NivelUrgencia.ESTABLE;
    }

    return NivelUrgencia.POR_EVALUAR;
  }

  /**
   * Generar plantilla vacía para nota de urgencias
   */
  generarPlantillaVacia(): CreateNotaUrgenciasDto {
    return {
      id_documento: 0,
      motivo_atencion: ''
    };
  }

  /**
   * Calcular tiempo de espera en formato legible
   */
  formatearTiempoEspera(minutos: number): string {
    if (minutos < 60) {
      return `${Math.round(minutos)} min`;
    }

    const horas = Math.floor(minutos / 60);
    const minutosRestantes = Math.round(minutos % 60);

    if (minutosRestantes === 0) {
      return `${horas}h`;
    }

    return `${horas}h ${minutosRestantes}min`;
  }

  /**
   * Obtener color para nivel de urgencia
   */
  getColorNivelUrgencia(nivel: string): string {
    switch (nivel) {
      case 'CRÍTICO':
        return 'danger';
      case 'GRAVE':
        return 'warning';
      case 'ESTABLE':
        return 'success';
      case 'POR EVALUAR':
        return 'info';
      default:
        return 'secondary';
    }
  }

  /**
   * Obtener icono para nivel de urgencia
   */
  getIconoNivelUrgencia(nivel: string): string {
    switch (nivel) {
      case 'CRÍTICO':
        return 'fas fa-exclamation-triangle text-red-600';
      case 'GRAVE':
        return 'fas fa-exclamation-circle text-orange-600';
      case 'ESTABLE':
        return 'fas fa-check-circle text-green-600';
      case 'POR EVALUAR':
        return 'fas fa-question-circle text-blue-600';
      default:
        return 'fas fa-circle text-gray-600';
    }
  }

  /**
   * Obtener opciones para estado de conciencia
   */
  getOpcionesEstadoConciencia(): { value: string; label: string }[] {
    return ESTADOS_CONCIENCIA_OPCIONES.map(opcion => ({
      value: opcion,
      label: opcion
    }));
  }

  /**
   * Obtener opciones para pronóstico
   */
  getOpcionesPronostico(): { value: string; label: string }[] {
    return PRONOSTICOS_URGENCIAS.map(pronostico => ({
      value: pronostico,
      label: pronostico
    }));
  }

  /**
   * Formatear fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatear fecha y hora para mostrar
   */
  formatearFechaHora(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtener resumen de la nota para listados
   */
  generarResumen(nota: NotaUrgencias): string {
    const partes: string[] = [];

    if (nota.motivo_atencion) {
      partes.push(`Motivo: ${nota.motivo_atencion.substring(0, 80)}${nota.motivo_atencion.length > 80 ? '...' : ''}`);
    }

    if (nota.diagnostico) {
      partes.push(`Dx: ${nota.diagnostico.substring(0, 60)}${nota.diagnostico.length > 60 ? '...' : ''}`);
    }

    return partes.join(' | ') || 'Sin resumen disponible';
  }

  /**
   * Verificar si se puede editar la nota de urgencias
   */
  puedeEditar(nota: NotaUrgencias): { puede: boolean; razon?: string } {
    if (nota.estado_documento === 'Anulado') {
      return {
        puede: false,
        razon: 'No se puede editar una nota de urgencias anulada'
      };
    }

    if (nota.estado_documento === 'Cancelado') {
      return {
        puede: false,
        razon: 'No se puede editar una nota de urgencias cancelada'
      };
    }

    // Verificar si ha pasado más de 24 horas
    if (nota.fecha_documento) {
      const fecha = new Date(nota.fecha_documento);
      const ahora = new Date();
      const horasTranscurridas = (ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60);

      if (horasTranscurridas > 24) {
        return {
          puede: false,
          razon: 'No se puede editar una nota de urgencias después de 24 horas de su creación'
        };
      }
    }

    return { puede: true };
  }

  /**
   * Buscar notas de urgencias por criterios múltiples
   */
  buscarAvanzada(criterios: {
    texto?: string;
    estadoConciencia?: string;
    areaInterconsulta?: number;
    fechaInicio?: string;
    fechaFin?: string;
    nivelUrgencia?: string;
  }): Observable<ApiResponse<NotaUrgencias[]>> {
    const filtros: NotaUrgenciasFilters = {};

    if (criterios.texto) {
      filtros.buscar = criterios.texto;
    }

    if (criterios.estadoConciencia) {
      filtros.estado_conciencia = criterios.estadoConciencia;
    }

    if (criterios.areaInterconsulta) {
      filtros.area_interconsulta = criterios.areaInterconsulta;
    }

    if (criterios.fechaInicio) {
      filtros.fecha_inicio = criterios.fechaInicio;
    }

    if (criterios.fechaFin) {
      filtros.fecha_fin = criterios.fechaFin;
    }

    return this.getNotasUrgencias(filtros);
  }

  /**
   * Exportar nota de urgencias a texto plano
   */
  exportarTextoPlano(nota: NotaUrgencias): string {
    const lineas: string[] = [];

    lineas.push('NOTA DE URGENCIAS');
    lineas.push('=================');
    lineas.push('');

    // Datos del paciente
    lineas.push('DATOS DEL PACIENTE:');
    lineas.push(`Nombre: ${nota.paciente_nombre || 'No especificado'}`);
    lineas.push(`Expediente: ${nota.numero_expediente || 'No especificado'}`);
    lineas.push(`Fecha: ${nota.fecha_documento ? this.formatearFechaHora(nota.fecha_documento) : 'No especificada'}`);
    lineas.push(`Médico: ${nota.medico_urgenciologo || 'No especificado'}`);
    lineas.push('');

    // Motivo de atención
    lineas.push('MOTIVO DE ATENCIÓN:');
    lineas.push(nota.motivo_atencion || 'No especificado');
    lineas.push('');

    // Estado de conciencia
    if (nota.estado_conciencia) {
      lineas.push('ESTADO DE CONCIENCIA:');
      lineas.push(nota.estado_conciencia);
      lineas.push('');
    }

    // Exploración física
    if (nota.exploracion_fisica) {
      lineas.push('EXPLORACIÓN FÍSICA:');
      lineas.push(nota.exploracion_fisica);
      lineas.push('');
    }

    // Diagnóstico
    if (nota.diagnostico) {
      lineas.push('DIAGNÓSTICO:');
      lineas.push(nota.diagnostico);
      lineas.push('');
    }

    // Plan de tratamiento
    if (nota.plan_tratamiento) {
      lineas.push('PLAN DE TRATAMIENTO:');
      lineas.push(nota.plan_tratamiento);
      lineas.push('');
    }

    return lineas.join('\n');
  }
}
