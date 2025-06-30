// src/app/services/gestion-expedientes/internamientos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Internamiento,
  InternamientoDetallado,
  InternamientoFilters,
  CreateInternamientoDto,
  UpdateInternamientoDto,
  EgresarPacienteDto,
  TransferirPacienteDto,
  DashboardInternamientos,
  InternamientoBusqueda,
  HistorialInternamientosPaciente
} from '../../models/internamiento.model';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class InternamientosService {
  private readonly API_URL = 'http://localhost:3000/api/gestion-expedientes/internamientos';

  constructor(private http: HttpClient) { }

  // ==========================================
  // OPERACIONES CRUD BÁSICAS
  // ==========================================

  /**
   * Obtener todos los internamientos con filtros y paginación
   */
  getInternamientos(filters?: InternamientoFilters): Observable<ApiResponse<Internamiento[]>> {
    let params = new HttpParams();

    if (filters) {
      // Filtros principales
      if (filters.activos_solo !== undefined) {
        params = params.set('activos_solo', filters.activos_solo.toString());
      }
      if (filters.servicio_id) {
        params = params.set('servicio_id', filters.servicio_id.toString());
      }
      if (filters.medico_responsable_id) {
        params = params.set('medico_responsable_id', filters.medico_responsable_id.toString());
      }
      if (filters.fecha_inicio) {
        params = params.set('fecha_inicio', filters.fecha_inicio);
      }
      if (filters.fecha_fin) {
        params = params.set('fecha_fin', filters.fecha_fin);
      }
      if (filters.tipo_egreso) {
        params = params.set('tipo_egreso', filters.tipo_egreso);
      }
      if (filters.buscar) {
        params = params.set('buscar', filters.buscar);
      }

      // Paginación
      if (filters.limit !== undefined) {
        params = params.set('limit', filters.limit.toString());
      }
      if (filters.offset !== undefined) {
        params = params.set('offset', filters.offset.toString());
      }

      // Filtros base
      if (filters.search) {
        params = params.set('search', filters.search);
      }
      if (filters.sort_by) {
        params = params.set('sort_by', filters.sort_by);
      }
      if (filters.sort_order) {
        params = params.set('sort_order', filters.sort_order);
      }
    }

    return this.http.get<ApiResponse<Internamiento[]>>(`${this.API_URL}`, { params });
  }

  /**
   * Obtener internamiento por ID (vista completa)
   */
  getInternamientoById(id: number): Observable<ApiResponse<InternamientoDetallado>> {
    return this.http.get<ApiResponse<InternamientoDetallado>>(`${this.API_URL}/${id}`);
  }

  /**
   * Crear nuevo internamiento (ingreso de paciente)
   */
  createInternamiento(data: CreateInternamientoDto): Observable<ApiResponse<Internamiento>> {
    return this.http.post<ApiResponse<Internamiento>>(`${this.API_URL}`, data);
  }

  /**
   * Actualizar internamiento existente
   */
  updateInternamiento(id: number, data: UpdateInternamientoDto): Observable<ApiResponse<Internamiento>> {
    return this.http.put<ApiResponse<Internamiento>>(`${this.API_URL}/${id}`, data);
  }

  // ==========================================
  // OPERACIONES ESPECÍFICAS DE INTERNAMIENTOS
  // ==========================================

  /**
   * Egresar paciente (completar internamiento)
   */
  egresarPaciente(id: number, data: EgresarPacienteDto): Observable<ApiResponse<Internamiento>> {
    return this.http.put<ApiResponse<Internamiento>>(`${this.API_URL}/${id}/egreso`, data);
  }

  /**
   * Transferir paciente (cambio de servicio/cama)
   */
  transferirPaciente(id: number, data: TransferirPacienteDto): Observable<ApiResponse<Internamiento>> {
    return this.http.put<ApiResponse<Internamiento>>(`${this.API_URL}/${id}/transferencia`, data);
  }

  // ==========================================
  // CONSULTAS ESPECIALIZADAS
  // ==========================================

  /**
   * Obtener internamientos activos (sin fecha de egreso)
   */
  getInternamientosActivos(filters?: { servicio_id?: number; medico_responsable_id?: number }): Observable<ApiResponse<Internamiento[]>> {
    let params = new HttpParams();

    if (filters?.servicio_id) {
      params = params.set('servicio_id', filters.servicio_id.toString());
    }
    if (filters?.medico_responsable_id) {
      params = params.set('medico_responsable_id', filters.medico_responsable_id.toString());
    }

    return this.http.get<ApiResponse<Internamiento[]>>(`${this.API_URL}/activos`, { params });
  }

  /**
   * Obtener dashboard de internamientos (estadísticas y resúmenes)
   */
  getDashboardInternamientos(): Observable<ApiResponse<DashboardInternamientos>> {
    return this.http.get<ApiResponse<DashboardInternamientos>>(`${this.API_URL}/dashboard`);
  }

  /**
   * Obtener historial de internamientos por paciente
   */
  getHistorialInternamientosPaciente(idPaciente: number): Observable<ApiResponse<HistorialInternamientosPaciente>> {
    return this.http.get<ApiResponse<HistorialInternamientosPaciente>>(`${this.API_URL}/historial/paciente/${idPaciente}`);
  }

  /**
   * Buscar internamientos (autocomplete)
   */
  buscarInternamientos(query: string, activosSolo: boolean = true): Observable<ApiResponse<InternamientoBusqueda[]>> {
    let params = new HttpParams()
      .set('q', query)
      .set('activos_solo', activosSolo.toString());

    return this.http.get<ApiResponse<InternamientoBusqueda[]>>(`${this.API_URL}/buscar`, { params });
  }

  /**
   * Obtener estadísticas de internamientos
   */
  getEstadisticasInternamientos(filters?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    servicio_id?: number;
  }): Observable<ApiResponse<any>> {
    let params = new HttpParams();

    if (filters?.fecha_inicio) {
      params = params.set('fecha_inicio', filters.fecha_inicio);
    }
    if (filters?.fecha_fin) {
      params = params.set('fecha_fin', filters.fecha_fin);
    }
    if (filters?.servicio_id) {
      params = params.set('servicio_id', filters.servicio_id.toString());
    }

    return this.http.get<ApiResponse<any>>(`${this.API_URL}/estadisticas`, { params });
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /**
   * Validar si un paciente puede ser ingresado
   */
  validarIngresoDisponible(idExpediente: number): Observable<ApiResponse<{ puede_ingresar: boolean; razon?: string }>> {
    return this.http.get<ApiResponse<{ puede_ingresar: boolean; razon?: string }>>(`${this.API_URL}/validar-ingreso/${idExpediente}`);
  }

  /**
   * Obtener internamientos por expediente
   */
  getInternamientosPorExpediente(idExpediente: number): Observable<ApiResponse<Internamiento[]>> {
    return this.http.get<ApiResponse<Internamiento[]>>(`${this.API_URL}/expediente/${idExpediente}`);
  }

  /**
   * Obtener internamientos por servicio
   */
  getInternamientosPorServicio(idServicio: number, activosSolo: boolean = false): Observable<ApiResponse<Internamiento[]>> {
    let params = new HttpParams();
    if (activosSolo) {
      params = params.set('activos_solo', 'true');
    }

    return this.http.get<ApiResponse<Internamiento[]>>(`${this.API_URL}/servicio/${idServicio}`, { params });
  }

  /**
   * Obtener internamientos por médico responsable
   */
  getInternamientosPorMedico(idMedico: number, activosSolo: boolean = false): Observable<ApiResponse<Internamiento[]>> {
    let params = new HttpParams();
    if (activosSolo) {
      params = params.set('activos_solo', 'true');
    }

    return this.http.get<ApiResponse<Internamiento[]>>(`${this.API_URL}/medico/${idMedico}`, { params });
  }

  // ==========================================
  // MÉTODOS PARA FORMULARIOS Y SELECTS
  // ==========================================

  /**
   * Obtener opciones para el select de tipos de egreso
   */
  getTiposEgreso(): string[] {
    return [
      'Alta voluntaria',
      'Mejoría',
      'Referencia',
      'Defunción',
      'Máximo beneficio'
    ];
  }

  /**
   * Obtener estados posibles de internamiento
   */
  getEstadosInternamiento(): string[] {
    return ['Activo', 'Egresado'];
  }

  /**
   * Calcular días de estancia
   */
  calcularDiasEstancia(fechaIngreso: string, fechaEgreso?: string): number {
    const inicio = new Date(fechaIngreso);
    const fin = fechaEgreso ? new Date(fechaEgreso) : new Date();
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Formatear estado del internamiento para mostrar
   */
  formatearEstado(internamiento: Internamiento): string {
    if (internamiento.fecha_egreso) {
      return `Egresado - ${internamiento.tipo_egreso || 'Sin especificar'}`;
    }
    return 'Activo';
  }

  /**
   * Obtener color para el estado del internamiento
   */
  getColorEstado(internamiento: Internamiento): string {
    if (internamiento.fecha_egreso) {
      switch (internamiento.tipo_egreso) {
        case 'Mejoría':
        case 'Alta voluntaria':
          return 'success';
        case 'Referencia':
          return 'info';
        case 'Defunción':
          return 'danger';
        case 'Máximo beneficio':
          return 'warning';
        default:
          return 'secondary';
      }
    }

    // Para internamientos activos, color basado en días de estancia
    const dias = internamiento.dias_estancia || 0;
    if (dias <= 3) return 'primary';
    if (dias <= 7) return 'info';
    if (dias <= 15) return 'warning';
    return 'danger';
  }

  /**
   * Validar datos antes de crear internamiento
   */
  validarDatosInternamiento(data: CreateInternamientoDto): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!data.id_expediente) {
      errores.push('El expediente es obligatorio');
    }

    if (!data.motivo_ingreso || data.motivo_ingreso.trim() === '') {
      errores.push('El motivo de ingreso es obligatorio');
    }

    if (!data.id_medico_responsable) {
      errores.push('El médico responsable es obligatorio');
    }

    if (data.fecha_ingreso) {
      const fecha = new Date(data.fecha_ingreso);
      const hoy = new Date();
      if (fecha > hoy) {
        errores.push('La fecha de ingreso no puede ser futura');
      }
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Validar datos de egreso
   */
  validarDatosEgreso(data: EgresarPacienteDto): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!data.diagnostico_egreso || data.diagnostico_egreso.trim() === '') {
      errores.push('El diagnóstico de egreso es obligatorio');
    }

    if (!data.tipo_egreso) {
      errores.push('El tipo de egreso es obligatorio');
    }

    if (!data.id_medico_egreso) {
      errores.push('El médico que autoriza el egreso es obligatorio');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }
}
