// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class TiposSangre {

//   private readonly API_URL = 'http://localhost:3000/api/catalogos/tipos-sangre';

//   constructor() { }
// }
// src/app/services/catalogos/tipos-sangre.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';

import {
  TipoSangre,
  CreateTipoSangreDto,
  UpdateTipoSangreDto,
  TipoSangreFilters,
  EstadisticasTiposSangre,
  TipoSangreCompleto,
  TransfusionInfo,
  TipoSangreUtil,
  TIPOS_SANGRE_SISTEMA_ABO
} from '../../models/tipo-sangre.model';
import { ApiResponse, API_CONFIG } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class TiposSangreService {
  private http = inject(HttpClient);
  private readonly API_URL = `${API_CONFIG.BASE_URL}/catalogos/tipos-sangre`;

  // Loading state para UI
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // ==========================================
  // MÉTODOS CRUD PRINCIPALES
  // ==========================================

  /**
   * Obtener todos los tipos de sangre con filtros
   */
  getAll(filters?: TipoSangreFilters): Observable<ApiResponse<TipoSangre[]>> {
    this.setLoading(true);

    let params = new HttpParams();

    if (filters) {
      if (filters.search) {
        params = params.set('buscar', filters.search);
      }
      if (filters.grupo_abo) {
        params = params.set('grupo_abo', filters.grupo_abo);
      }
      if (filters.factor_rh) {
        params = params.set('factor_rh', filters.factor_rh);
      }
      if (filters.compatible_donacion) {
        params = params.set('compatible_donacion', filters.compatible_donacion);
      }
      if (filters.compatible_recepcion) {
        params = params.set('compatible_recepcion', filters.compatible_recepcion);
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

    return this.http.get<ApiResponse<TipoSangre[]>>(this.API_URL, { params })
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Obtener un tipo de sangre por ID
   */
  getById(id: number): Observable<ApiResponse<TipoSangre>> {
    this.setLoading(true);

    return this.http.get<ApiResponse<TipoSangre>>(`${this.API_URL}/${id}`)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Crear un nuevo tipo de sangre
   */
  create(tipoSangre: CreateTipoSangreDto): Observable<ApiResponse<TipoSangre>> {
    this.setLoading(true);

    // Validar datos antes de enviar
    const tipoValidado = this.validarDatosCreacion(tipoSangre);

    return this.http.post<ApiResponse<TipoSangre>>(this.API_URL, tipoValidado)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Actualizar un tipo de sangre existente
   */
  update(id: number, tipoSangre: UpdateTipoSangreDto): Observable<ApiResponse<TipoSangre>> {
    this.setLoading(true);

    // Validar datos antes de enviar
    const tipoValidado = this.validarDatosActualizacion(tipoSangre);

    return this.http.put<ApiResponse<TipoSangre>>(`${this.API_URL}/${id}`, tipoValidado)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Eliminar un tipo de sangre
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
   * Cambiar estado activo/inactivo de un tipo de sangre
   */
  toggleActivo(id: number): Observable<ApiResponse<TipoSangre>> {
    this.setLoading(true);

    return this.http.patch<ApiResponse<TipoSangre>>(`${this.API_URL}/${id}/toggle-activo`, {})
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  // ==========================================
  // MÉTODOS ESPECÍFICOS DE TIPOS DE SANGRE
  // ==========================================

  /**
   * Obtener tipos de sangre activos únicamente
   */
  getTiposActivos(): Observable<ApiResponse<TipoSangre[]>> {
    return this.getAll({ activo: true });
  }

  /**
   * Buscar tipos por grupo ABO
   */
  buscarPorGrupoABO(grupo: 'A' | 'B' | 'AB' | 'O'): Observable<ApiResponse<TipoSangre[]>> {
    return this.getAll({ grupo_abo: grupo });
  }

  /**
   * Buscar tipos por factor RH
   */
  buscarPorFactorRh(factor: 'Positivo' | 'Negativo'): Observable<ApiResponse<TipoSangre[]>> {
    return this.getAll({ factor_rh: factor });
  }

  /**
   * Obtener tipos compatibles para donación
   */
  getTiposCompatiblesDonacion(tipoReceptor: string): Observable<ApiResponse<TipoSangre[]>> {
    return this.getAll({ compatible_donacion: tipoReceptor });
  }

  /**
   * Obtener tipos compatibles para recepción
   */
  getTiposCompatiblesRecepcion(tipoDonador: string): Observable<ApiResponse<TipoSangre[]>> {
    return this.getAll({ compatible_recepcion: tipoDonador });
  }

  /**
   * Obtener información completa de un tipo con estadísticas
   */
  getTipoCompleto(id: number): Observable<ApiResponse<TipoSangreCompleto>> {
    this.setLoading(true);

    return this.http.get<ApiResponse<TipoSangreCompleto>>(`${this.API_URL}/${id}/completo`)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Obtener estadísticas de tipos de sangre
   */
  getEstadisticas(): Observable<ApiResponse<EstadisticasTiposSangre>> {
    this.setLoading(true);

    return this.http.get<ApiResponse<EstadisticasTiposSangre>>(`${this.API_URL}/estadisticas`)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Verificar compatibilidad para transfusión
   */
  verificarCompatibilidad(tipoDonador: string, tipoReceptor: string): Observable<ApiResponse<TransfusionInfo>> {
    this.setLoading(true);

    const params = new HttpParams()
      .set('donador', tipoDonador)
      .set('receptor', tipoReceptor);

    return this.http.get<ApiResponse<TransfusionInfo>>(`${this.API_URL}/compatibilidad`, { params })
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this)),
        finalize(() => this.setLoading(false))
      );
  }

  // ==========================================
  // MÉTODOS UTILITARIOS LOCALES
  // ==========================================

  /**
   * Verificar compatibilidad local (sin llamada al servidor)
   */
  verificarCompatibilidadLocal(tipoDonador: string, tipoReceptor: string): TransfusionInfo {
    return TipoSangreUtil.obtenerRiesgoTransfusion(tipoDonador, tipoReceptor);
  }

  /**
   * Obtener todos los tipos válidos del sistema ABO
   */
  getTiposValidos(): string[] {
    return Object.keys(TIPOS_SANGRE_SISTEMA_ABO);
  }

  // ==========================================
  // MÉTODOS DE VALIDACIÓN
  // ==========================================

  /**
   * Validar datos para creación
   */
  private validarDatosCreacion(tipoSangre: CreateTipoSangreDto): CreateTipoSangreDto {
    const tipoLimpio: CreateTipoSangreDto = {
      nombre: tipoSangre.nombre?.trim().toUpperCase() || '',
      descripcion: tipoSangre.descripcion?.trim() || undefined,
      activo: tipoSangre.activo !== undefined ? tipoSangre.activo : true
    };

    // Validaciones básicas
    if (!tipoLimpio.nombre) {
      throw new Error('El nombre del tipo de sangre es obligatorio');
    }

    // Validar formato del tipo de sangre
    if (!/^(O|A|B|AB)[+-]$/.test(tipoLimpio.nombre)) {
      throw new Error('Formato de tipo de sangre inválido. Debe ser: O+, O-, A+, A-, B+, B-, AB+, AB-');
    }

    // Validar que sea un tipo reconocido
    if (!Object.keys(TIPOS_SANGRE_SISTEMA_ABO).includes(tipoLimpio.nombre)) {
      throw new Error('Tipo de sangre no reconocido en el sistema ABO/Rh');
    }

    return tipoLimpio;
  }

  /**
   * Validar datos para actualización
   */
  private validarDatosActualizacion(tipoSangre: UpdateTipoSangreDto): UpdateTipoSangreDto {
    const tipoLimpio: UpdateTipoSangreDto = {
      id_tipo_sangre: tipoSangre.id_tipo_sangre,
      nombre: tipoSangre.nombre?.trim().toUpperCase() || undefined,
      descripcion: tipoSangre.descripcion?.trim() || undefined,
      activo: tipoSangre.activo
    };

    // Validaciones básicas
    if (tipoLimpio.nombre) {
      // Validar formato del tipo de sangre
      if (!/^(O|A|B|AB)[+-]$/.test(tipoLimpio.nombre)) {
        throw new Error('Formato de tipo de sangre inválido. Debe ser: O+, O-, A+, A-, B+, B-, AB+, AB-');
      }

      // Validar que sea un tipo reconocido
      if (!Object.keys(TIPOS_SANGRE_SISTEMA_ABO).includes(tipoLimpio.nombre)) {
        throw new Error('Tipo de sangre no reconocido en el sistema ABO/Rh');
      }
    }

    return tipoLimpio;
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
        errorMessage = 'Tipo de sangre no encontrado';
      } else if (error.status === 409) {
        errorMessage = error.error?.message || 'Ya existe un tipo de sangre con ese nombre';
      } else if (error.status >= 500) {
        errorMessage = 'Error interno del servidor. Intente más tarde.';
      } else {
        errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }
    }

    console.error('Error en TiposSangreService:', error);
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
