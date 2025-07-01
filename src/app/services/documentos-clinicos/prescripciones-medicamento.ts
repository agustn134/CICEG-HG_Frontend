import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PrescripcionMedicamento,
  PrescripcionMedicamentoFilters,
  CreatePrescripcionMedicamentoDto,
  UpdatePrescripcionMedicamentoDto
} from '../../models/prescripcion-medicamento.model';
import { ApiResponse } from '../../models/base.models';

// Interfaz para respuesta paginada
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PrescripcionesMedicamentoService {

  private readonly API_URL = 'http://localhost:3000/api/documentos-clinicos/prescripciones-medicamento';

  constructor(private http: HttpClient) { }

  // ==========================================
  // MÉTODOS CRUD BÁSICOS
  // ==========================================

  /**
   * Obtener todas las prescripciones con filtros y paginación
   */
  getPrescripciones(filters: PrescripcionMedicamentoFilters = {}): Observable<PaginatedResponse<PrescripcionMedicamento>> {
    let params = new HttpParams();

    // Aplicar filtros
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.id_documento) params = params.set('id_documento', filters.id_documento.toString());
    if (filters.id_expediente) params = params.set('id_expediente', filters.id_expediente.toString());
    if (filters.id_medicamento) params = params.set('id_medicamento', filters.id_medicamento.toString());
    if (filters.activo !== undefined) params = params.set('activo', filters.activo.toString());
    if (filters.via_administracion) params = params.set('via_administracion', filters.via_administracion);
    if (filters.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
    if (filters.buscar) params = params.set('buscar', filters.buscar);

    return this.http.get<PaginatedResponse<PrescripcionMedicamento>>(this.API_URL, { params });
  }

  /**
   * Obtener prescripción por ID
   */
  getPrescripcionById(id: number): Observable<ApiResponse<PrescripcionMedicamento>> {
    return this.http.get<ApiResponse<PrescripcionMedicamento>>(`${this.API_URL}/${id}`);
  }

  /**
   * Crear nueva prescripción
   */
  createPrescripcion(prescripcion: CreatePrescripcionMedicamentoDto): Observable<ApiResponse<PrescripcionMedicamento>> {
    return this.http.post<ApiResponse<PrescripcionMedicamento>>(this.API_URL, prescripcion);
  }

  /**
   * Actualizar prescripción existente
   */
  updatePrescripcion(id: number, prescripcion: Partial<UpdatePrescripcionMedicamentoDto>): Observable<ApiResponse<PrescripcionMedicamento>> {
    return this.http.put<ApiResponse<PrescripcionMedicamento>>(`${this.API_URL}/${id}`, prescripcion);
  }

  /**
   * Desactivar prescripción (soft delete)
   */
  deletePrescripcion(id: number): Observable<ApiResponse<PrescripcionMedicamento>> {
    return this.http.delete<ApiResponse<PrescripcionMedicamento>>(`${this.API_URL}/${id}`);
  }

  // ==========================================
  // MÉTODOS ESPECÍFICOS
  // ==========================================

  /**
   * Obtener prescripciones por expediente
   */
  getPrescripcionesByExpediente(idExpediente: number, activo: boolean = true): Observable<ApiResponse<PrescripcionMedicamento[]>> {
    const params = new HttpParams().set('activo', activo.toString());
    return this.http.get<ApiResponse<PrescripcionMedicamento[]>>(`${this.API_URL}/expediente/${idExpediente}`, { params });
  }

  /**
   * Obtener estadísticas de prescripciones
   */
  getEstadisticas(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/estadisticas`);
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /**
   * Activar/Desactivar prescripción
   */
  toggleActivePrescripcion(id: number, activo: boolean): Observable<ApiResponse<PrescripcionMedicamento>> {
    return this.updatePrescripcion(id, { activo });
  }

  /**
   * Extender duración de prescripción
   */
  extenderPrescripcion(id: number, nuevaFechaFin: string): Observable<ApiResponse<PrescripcionMedicamento>> {
    return this.updatePrescripcion(id, { fecha_fin: nuevaFechaFin });
  }

  /**
   * Modificar dosis de prescripción
   */
  modificarDosis(id: number, nuevaDosis: string): Observable<ApiResponse<PrescripcionMedicamento>> {
    return this.updatePrescripcion(id, { dosis: nuevaDosis });
  }
}
