// src/app/services/base.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';
import {
  ApiResponse,
  BaseFilters,
  PaginationInfo,
  API_CONFIG
} from '../models/base.models';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService<T = any> {
  protected http = inject(HttpClient);

  // URL base del endpoint específico (debe ser sobrescrito en servicios hijos)
  protected abstract endpoint: string;

  // URL base de la API
  protected readonly baseUrl = API_CONFIG.BASE_URL;

  // Loading state para UI
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // ==========================================
  // MÉTODOS CRUD BÁSICOS
  // ==========================================

  /**
   * Obtener todos los registros con filtros y paginación
   */
  getAll(filters?: BaseFilters): Observable<ApiResponse<T[]>> {
    this.setLoading(true);

    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<T[]>>(`${this.baseUrl}${this.endpoint}`, { params })
      .pipe(
        retry(1),
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Obtener un registro por ID
   */
  getById(id: number): Observable<ApiResponse<T>> {
    this.setLoading(true);

    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${this.endpoint}/${id}`)
      .pipe(
        retry(1),
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Crear un nuevo registro
   */
  create(data: Partial<T>): Observable<ApiResponse<T>> {
    this.setLoading(true);

    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${this.endpoint}`, data)
      .pipe(
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Actualizar un registro existente
   */
  update(id: number, data: Partial<T>): Observable<ApiResponse<T>> {
    this.setLoading(true);

    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${this.endpoint}/${id}`, data)
      .pipe(
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Eliminar un registro
   */
  delete(id: number, force: boolean = false): Observable<ApiResponse<any>> {
    this.setLoading(true);

    let params = new HttpParams();
    if (force) {
      params = params.set('force', 'true');
    }

    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}${this.endpoint}/${id}`, { params })
      .pipe(
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  // ==========================================
  // MÉTODOS ESPECIALES COMUNES
  // ==========================================

  /**
   * Obtener solo registros activos
   */
  getActivos(filters?: BaseFilters): Observable<ApiResponse<T[]>> {
    return this.getAll({ ...filters, activo: true });
  }

  /**
   * Activar/Desactivar un registro
   */
  toggle(id: number): Observable<ApiResponse<T>> {
    this.setLoading(true);

    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${this.endpoint}/${id}/toggle`, {})
      .pipe(
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Búsqueda general
   */
  search(query: string, filters?: BaseFilters): Observable<ApiResponse<T[]>> {
    return this.getAll({ ...filters, search: query });
  }

  /**
   * Obtener estadísticas (si el endpoint lo soporta)
   */
  getEstadisticas(): Observable<ApiResponse<any>> {
    this.setLoading(true);

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}${this.endpoint}/estadisticas`)
      .pipe(
        retry(1),
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  // ==========================================
  // MÉTODOS PARA ENDPOINTS ESPECÍFICOS
  // ==========================================

  /**
   * Llamada personalizada GET con ruta específica
   */
  protected customGet<R = any>(path: string, params?: any): Observable<ApiResponse<R>> {
    this.setLoading(true);

    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<R>>(`${this.baseUrl}${this.endpoint}${path}`, { params: httpParams })
      .pipe(
        retry(1),
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Llamada personalizada POST con ruta específica
   */
  protected customPost<R = any>(path: string, data: any): Observable<ApiResponse<R>> {
    this.setLoading(true);

    return this.http.post<ApiResponse<R>>(`${this.baseUrl}${this.endpoint}${path}`, data)
      .pipe(
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Llamada personalizada PUT con ruta específica
   */
  protected customPut<R = any>(path: string, data: any): Observable<ApiResponse<R>> {
    this.setLoading(true);

    return this.http.put<ApiResponse<R>>(`${this.baseUrl}${this.endpoint}${path}`, data)
      .pipe(
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Llamada personalizada PATCH con ruta específica
   */
  protected customPatch<R = any>(path: string, data: any): Observable<ApiResponse<R>> {
    this.setLoading(true);

    return this.http.patch<ApiResponse<R>>(`${this.baseUrl}${this.endpoint}${path}`, data)
      .pipe(
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  /**
   * Construir URL completa
   */
  protected buildUrl(path: string = ''): string {
    return `${this.baseUrl}${this.endpoint}${path}`;
  }

  /**
   * Construir parámetros HTTP
   */
  protected buildParams(filters: any): HttpParams {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => {
              params = params.append(key, item.toString());
            });
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    return params;
  }

  /**
   * Extraer datos de respuesta API
   */
  protected extractData<R>(response: ApiResponse<R>): R | undefined {
    return response.success ? response.data : undefined;
  }

  /**
   * Extraer información de paginación
   */
  protected extractPagination(response: ApiResponse<any>): PaginationInfo | undefined {
    return response.pagination;
  }

  // ==========================================
  // MANEJO DE ESTADOS
  // ==========================================

  /**
   * Actualizar estado de loading
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Obtener estado actual de loading
   */
  protected isLoading(): boolean {
    return this.loadingSubject.value;
  }

  // ==========================================
  // MANEJO DE ERRORES
  // ==========================================

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Ha ocurrido un error inesperado';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error de conexión: ${error.error.message}`;
      errorCode = 'CLIENT_ERROR';
    } else {
      // Error del lado del servidor
      errorCode = `SERVER_ERROR_${error.status}`;

      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Solicitud inválida';
          break;
        case 401:
          errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente';
          break;
        case 403:
          errorMessage = 'No tiene permisos para realizar esta acción';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflicto con el estado actual del recurso';
          break;
        case 422:
          errorMessage = error.error?.message || 'Datos de entrada inválidos';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intente más tarde';
          break;
        case 503:
          errorMessage = 'Servicio no disponible temporalmente';
          break;
        default:
          errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }
    }

    // Log detallado para desarrollo
    if (API_CONFIG.BASE_URL.includes('localhost')) {
      console.error('Error detallado:', {
        code: errorCode,
        message: errorMessage,
        status: error.status,
        error: error.error,
        url: error.url
      });
    }

    return throwError(() => ({
      code: errorCode,
      message: errorMessage,
      originalError: error
    }));
  };

  // ==========================================
  // MÉTODOS DE LIFECYCLE (OPCIONAL)
  // ==========================================

  /**
   * Limpiar recursos al destruir el servicio
   */
  ngOnDestroy(): void {
    this.loadingSubject.complete();
  }
}
