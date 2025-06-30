// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class Servicios {

//   private readonly API_URL = 'http://localhost:3000/api/catalogos/servicios';

//   constructor() { }
// }
// src/app/services/catalogos/servicios.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';

import {
  Servicio,
  CreateServicioDto,
  UpdateServicioDto,
  ServicioFilters
} from '../../models/servicio.model';
import { ApiResponse, API_CONFIG } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  private http = inject(HttpClient);
  private readonly API_URL = `${API_CONFIG.BASE_URL}/catalogos/servicios`;

  // Loading state para UI
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // ==========================================
  // MÉTODOS CRUD PRINCIPALES
  // ==========================================

  /**
   * Obtener todos los servicios con filtros
   */
  getAll(filters?: ServicioFilters): Observable<ApiResponse<Servicio[]>> {
    this.setLoading(true);

    let params = new HttpParams();

    if (filters) {
      if (filters.search) {
        params = params.set('buscar', filters.search);
      }
      if (filters.nombre) {
        params = params.set('nombre', filters.nombre);
      }
      if (filters.tipo_servicio) {
        params = params.set('tipo_servicio', filters.tipo_servicio);
      }
      if (filters.con_camas_disponibles !== undefined) {
        params = params.set('con_camas_disponibles', filters.con_camas_disponibles.toString());
      }
      if (filters.jefe_servicio) {
        params = params.set('jefe_servicio', filters.jefe_servicio);
      }
      if (filters.activo !== undefined) {
        params = params.set('activo', filters.activo.toString());
      }
      if (filters.page) {
        params = params.set('page', filters.page.toString());
      }
      if (filters.limit) {
        params = params.set('limit', filters.limit.toString());
      }
      if (filters.sort_by) {
        params = params.set('sort_by', filters.sort_by);
      }
      if (filters.sort_order) {
        params = params.set('sort_order', filters.sort_order);
      }
    }

    return this.http.get<ApiResponse<Servicio[]>>(this.API_URL, { params })
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Obtener un servicio por ID
   */
  getById(id: number): Observable<ApiResponse<Servicio>> {
    this.setLoading(true);

    return this.http.get<ApiResponse<Servicio>>(`${this.API_URL}/${id}`)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Crear un nuevo servicio
   */
  create(servicio: CreateServicioDto): Observable<ApiResponse<Servicio>> {
    this.setLoading(true);

    // Validar datos antes de enviar
    const servicioValidado = this.validarDatosCreacion(servicio);

    return this.http.post<ApiResponse<Servicio>>(this.API_URL, servicioValidado)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Actualizar un servicio existente
   */
  update(id: number, servicio: UpdateServicioDto): Observable<ApiResponse<Servicio>> {
    this.setLoading(true);

    // Validar datos antes de enviar
    const servicioValidado = this.validarDatosActualizacion(servicio);

    return this.http.put<ApiResponse<Servicio>>(`${this.API_URL}/${id}`, servicioValidado)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Eliminar un servicio
   */
  delete(id: number): Observable<ApiResponse<void>> {
    this.setLoading(true);

    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Cambiar estado activo/inactivo de un servicio
   */
  toggleActivo(id: number): Observable<ApiResponse<Servicio>> {
    this.setLoading(true);

    return this.http.patch<ApiResponse<Servicio>>(`${this.API_URL}/${id}/toggle-activo`, {})
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  // ==========================================
  // MÉTODOS ADICIONALES
  // ==========================================

  /**
   * Obtener servicios activos únicamente
   */
  getServiciosActivos(): Observable<ApiResponse<Servicio[]>> {
    return this.getAll({ activo: true });
  }

  /**
   * Buscar servicios por nombre
   */
  buscarPorNombre(nombre: string): Observable<ApiResponse<Servicio[]>> {
    return this.getAll({ search: nombre });
  }

  /**
   * Obtener servicios por tipo
   */
  getServiciosPorTipo(tipo: string): Observable<ApiResponse<Servicio[]>> {
    return this.getAll({ tipo_servicio: tipo });
  }

  /**
   * Obtener estadísticas de servicios
   */
  getEstadisticas(): Observable<ApiResponse<any>> {
    this.setLoading(true);

    return this.http.get<ApiResponse<any>>(`${this.API_URL}/estadisticas`)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  // ==========================================
  // MÉTODOS DE VALIDACIÓN
  // ==========================================

  /**
   * Validar datos para creación
   */
  private validarDatosCreacion(servicio: CreateServicioDto): CreateServicioDto {
    const servicioLimpio: CreateServicioDto = {
      nombre: servicio.nombre?.trim() || '',
      descripcion: servicio.descripcion?.trim() || undefined,
      activo: servicio.activo !== undefined ? servicio.activo : true,
      jefe_servicio: servicio.jefe_servicio?.trim() || undefined,
      ubicacion: servicio.ubicacion?.trim() || undefined,
      telefono_interno: servicio.telefono_interno?.trim() || undefined,
      capacidad_camas: servicio.capacidad_camas || undefined,
      tipo_servicio: servicio.tipo_servicio?.trim() || undefined
    };

    // Validaciones básicas
    if (!servicioLimpio.nombre) {
      throw new Error('El nombre del servicio es obligatorio');
    }

    if (servicioLimpio.nombre.length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    if (servicioLimpio.capacidad_camas !== undefined && servicioLimpio.capacidad_camas < 0) {
      throw new Error('La capacidad de camas no puede ser negativa');
    }

    if (servicioLimpio.telefono_interno && !/^\d{3,4}$/.test(servicioLimpio.telefono_interno)) {
      throw new Error('El teléfono interno debe tener 3 o 4 dígitos');
    }

    return servicioLimpio;
  }

  /**
   * Validar datos para actualización
   */
  private validarDatosActualizacion(servicio: UpdateServicioDto): UpdateServicioDto {
    const servicioLimpio: UpdateServicioDto = {
      id_servicio: servicio.id_servicio,
      nombre: servicio.nombre?.trim() || undefined,
      descripcion: servicio.descripcion?.trim() || undefined,
      activo: servicio.activo,
      jefe_servicio: servicio.jefe_servicio?.trim() || undefined,
      ubicacion: servicio.ubicacion?.trim() || undefined,
      telefono_interno: servicio.telefono_interno?.trim() || undefined,
      capacidad_camas: servicio.capacidad_camas,
      tipo_servicio: servicio.tipo_servicio?.trim() || undefined
    };

    // Validaciones básicas
    if (servicioLimpio.nombre !== undefined && servicioLimpio.nombre.length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    if (servicioLimpio.capacidad_camas !== undefined && servicioLimpio.capacidad_camas < 0) {
      throw new Error('La capacidad de camas no puede ser negativa');
    }

    if (servicioLimpio.telefono_interno && !/^\d{3,4}$/.test(servicioLimpio.telefono_interno)) {
      throw new Error('El teléfono interno debe tener 3 o 4 dígitos');
    }

    return servicioLimpio;
  }

  // ==========================================
  // MÉTODOS PRIVADOS
  // ==========================================

  /**
   * Manejar errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado cliente
      errorMessage = `Error de cliente: ${error.error.message}`;
    } else {
      // Error del lado servidor
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Datos inválidos';
      } else if (error.status === 401) {
        errorMessage = 'No autorizado. Inicie sesión nuevamente.';
      } else if (error.status === 403) {
        errorMessage = 'No tiene permisos para realizar esta operación';
      } else if (error.status === 404) {
        errorMessage = 'Servicio no encontrado';
      } else if (error.status === 409) {
        errorMessage = error.error?.message || 'Ya existe un servicio con ese nombre';
      } else if (error.status >= 500) {
        errorMessage = 'Error interno del servidor. Intente más tarde.';
      } else {
        errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }
    }

    console.error('Error en ServiciosService:', error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Establecer estado de carga
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  // ==========================================
  // GETTERS PARA ACCESO RÁPIDO
  // ==========================================

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
