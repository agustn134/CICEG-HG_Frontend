// Reemplaza todo el contenido de: C:\CICEG-HG-APP\src\app\services\gestion-expedientes\internamientos.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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

  // Estado de carga para la UI
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) { }

  // ==========================================
  // OPERACIONES CRUD BÁSICAS
  // ==========================================

  /**
   * Crear nuevo internamiento (ingreso de paciente) - FUNCIÓN PRINCIPAL
   */
  createInternamiento(data: CreateInternamientoDto): Observable<ApiResponse<Internamiento>> {
    this.loadingSubject.next(true);

    return this.http.post<ApiResponse<Internamiento>>(`${this.API_URL}`, data)
      .pipe(
        tap(() => this.loadingSubject.next(false)),
        catchError((error: HttpErrorResponse) => {
          this.loadingSubject.next(false);
          console.error('Error al crear internamiento:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Actualizar internamiento existente
   */
  updateInternamiento(id: number, data: UpdateInternamientoDto): Observable<ApiResponse<Internamiento>> {
    this.loadingSubject.next(true);

    return this.http.put<ApiResponse<Internamiento>>(`${this.API_URL}/${id}`, data)
      .pipe(
        tap(() => this.loadingSubject.next(false)),
        catchError((error: HttpErrorResponse) => {
          this.loadingSubject.next(false);
          console.error('Error al actualizar internamiento:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener internamiento por ID (vista completa)
   */
  getInternamientoById(id: number): Observable<ApiResponse<InternamientoDetallado>> {
    return this.http.get<ApiResponse<InternamientoDetallado>>(`${this.API_URL}/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al obtener internamiento:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener todos los internamientos con filtros básicos
   */
  getInternamientos(filters?: InternamientoFilters): Observable<ApiResponse<Internamiento[]>> {
    let params = new HttpParams();

    if (filters) {
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
      if (filters.buscar) {
        params = params.set('buscar', filters.buscar);
      }
    }

    return this.http.get<ApiResponse<Internamiento[]>>(`${this.API_URL}`, { params })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al obtener internamientos:', error);
          return throwError(() => error);
        })
      );
  }

  // ==========================================
  // OPERACIONES ESPECÍFICAS DE INTERNAMIENTOS
  // ==========================================

  /**
   * Egresar paciente (completar internamiento)
   */
  egresarPaciente(id: number, data: EgresarPacienteDto): Observable<ApiResponse<Internamiento>> {
    this.loadingSubject.next(true);

    return this.http.put<ApiResponse<Internamiento>>(`${this.API_URL}/${id}/egreso`, data)
      .pipe(
        tap(() => this.loadingSubject.next(false)),
        catchError((error: HttpErrorResponse) => {
          this.loadingSubject.next(false);
          console.error('Error al egresar paciente:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Transferir paciente (cambio de servicio/cama)
   */
  transferirPaciente(id: number, data: TransferirPacienteDto): Observable<ApiResponse<Internamiento>> {
    this.loadingSubject.next(true);

    return this.http.put<ApiResponse<Internamiento>>(`${this.API_URL}/${id}/transferencia`, data)
      .pipe(
        tap(() => this.loadingSubject.next(false)),
        catchError((error: HttpErrorResponse) => {
          this.loadingSubject.next(false);
          console.error('Error al transferir paciente:', error);
          return throwError(() => error);
        })
      );
  }

  // ==========================================
  // CONSULTAS ÚTILES
  // ==========================================

  /**
   * Obtener internamientos activos (sin fecha de egreso)
   */
  getInternamientosActivos(): Observable<ApiResponse<Internamiento[]>> {
    const params = new HttpParams().set('activos_solo', 'true');

    return this.http.get<ApiResponse<Internamiento[]>>(`${this.API_URL}`, { params })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al obtener internamientos activos:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Validar si un paciente puede ser ingresado
   */
  validarIngresoDisponible(idExpediente: number): Observable<ApiResponse<{ puede_ingresar: boolean; razon?: string }>> {
    return this.http.get<ApiResponse<{ puede_ingresar: boolean; razon?: string }>>(`${this.API_URL}/validar-ingreso/${idExpediente}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al validar ingreso:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Buscar internamientos (autocomplete)
   */
  buscarInternamientos(query: string): Observable<ApiResponse<InternamientoBusqueda[]>> {
    const params = new HttpParams()
      .set('q', query)
      .set('activos_solo', 'true');

    return this.http.get<ApiResponse<InternamientoBusqueda[]>>(`${this.API_URL}/buscar`, { params })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al buscar internamientos:', error);
          return throwError(() => error);
        })
      );
  }

  // ==========================================
  // MÉTODOS DE VALIDACIÓN
  // ==========================================

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

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /**
   * Obtener tipos de egreso disponibles
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
   * Calcular días de estancia
   */
  calcularDiasEstancia(fechaIngreso: string, fechaEgreso?: string): number {
    const inicio = new Date(fechaIngreso);
    const fin = fechaEgreso ? new Date(fechaEgreso) : new Date();
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Formatear estado del internamiento
   */
  formatearEstado(internamiento: Internamiento): string {
    if (internamiento.fecha_egreso) {
      return `Egresado - ${internamiento.tipo_egreso || 'Sin especificar'}`;
    }
    return 'Activo';
  }

  /**
   * Obtener color para el estado en la UI
   */
  getColorEstado(internamiento: Internamiento): string {
    if (internamiento.fecha_egreso) {
      switch (internamiento.tipo_egreso) {
        case 'Mejoría':
        case 'Alta voluntaria':
          return 'text-green-600';
        case 'Referencia':
          return 'text-blue-600';
        case 'Defunción':
          return 'text-red-600';
        case 'Máximo beneficio':
          return 'text-yellow-600';
        default:
          return 'text-gray-600';
      }
    }

    const dias = internamiento.dias_estancia || 0;
    if (dias <= 3) return 'text-blue-600';
    if (dias <= 7) return 'text-yellow-600';
    if (dias <= 15) return 'text-orange-600';
    return 'text-red-600';
  }

  /**
   * Preparar datos para envío al backend
   */
  prepararDatosParaBackend(formData: any): CreateInternamientoDto {
    return {
      id_expediente: Number(formData.id_expediente),
      id_servicio: formData.id_servicio ? Number(formData.id_servicio) : undefined,
      id_cama: formData.id_cama ? Number(formData.id_cama) : undefined,
      motivo_ingreso: formData.motivo_ingreso.trim(),
      diagnostico_ingreso: formData.diagnostico_ingreso ? formData.diagnostico_ingreso.trim() : undefined,
      id_medico_responsable: Number(formData.id_medico_responsable),
      observaciones: formData.observaciones ? formData.observaciones.trim() : undefined,
      fecha_ingreso: formData.fecha_ingreso || undefined,
      crear_nota_ingreso: formData.crear_nota_ingreso !== false
    };
  }

  /**
   * Manejar error y mostrar mensaje amigable
   */
  manejarError(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }

    switch (error.status) {
      case 400:
        return 'Datos inválidos. Verifique la información ingresada.';
      case 404:
        return 'El recurso solicitado no fue encontrado.';
      case 409:
        return 'Ya existe un internamiento activo para este paciente.';
      case 500:
        return 'Error interno del servidor. Intente nuevamente.';
      default:
        return 'Error de conexión. Verifique su conexión a internet.';
    }
  }
}
