import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { TipoDocumento, CreateTipoDocumentoDto, UpdateTipoDocumentoDto, TipoDocumentoFilters } from '../../models/tipo-documento.model';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class TiposDocumentoService {
  private readonly API_URL = 'http://localhost:3000/api/catalogos/tipos-documento';

  constructor(private http: HttpClient) { }

  // ==========================================
  // MÉTODOS CRUD PRINCIPALES CON OBSERVABLES
  // ==========================================

  /**
   * Obtener todos los tipos de documento - ✅ RETORNA OBSERVABLE
   */
  getAll(filters?: TipoDocumentoFilters): Observable<ApiResponse<TipoDocumento[]>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search) {
        params = params.set('buscar', filters.search);
      }
      if (filters.nombre) {
        params = params.set('nombre', filters.nombre);
      }
      if (filters.categoria) {
        params = params.set('categoria', filters.categoria);
      }
      if (filters.requiere_firma_medico !== undefined) {
        params = params.set('requiere_firma_medico', filters.requiere_firma_medico.toString());
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
    }

    return this.http.get<ApiResponse<TipoDocumento[]>>(this.API_URL, { params }).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtener un tipo de documento por ID - ✅ RETORNA OBSERVABLE
   */
  getById(id: number): Observable<ApiResponse<TipoDocumento>> {
    return this.http.get<ApiResponse<TipoDocumento>>(`${this.API_URL}/${id}`).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Crear un nuevo tipo de documento - ✅ RETORNA OBSERVABLE
   */
  create(tipoDocumento: CreateTipoDocumentoDto): Observable<ApiResponse<TipoDocumento>> {
    return this.http.post<ApiResponse<TipoDocumento>>(this.API_URL, tipoDocumento).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Actualizar un tipo de documento existente - ✅ RETORNA OBSERVABLE
   */
  update(id: number, tipoDocumento: Partial<CreateTipoDocumentoDto>): Observable<ApiResponse<TipoDocumento>> {
    return this.http.put<ApiResponse<TipoDocumento>>(`${this.API_URL}/${id}`, tipoDocumento).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Eliminar un tipo de documento - ✅ RETORNA OBSERVABLE
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // ==========================================
  // MÉTODOS ESPECÍFICOS CON OBSERVABLES
  // ==========================================

  /**
   * Buscar tipos de documento por término
   */
  search(term: string): Observable<ApiResponse<TipoDocumento[]>> {
    return this.http.get<ApiResponse<TipoDocumento[]>>(`${this.API_URL}/search?q=${encodeURIComponent(term)}`).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtener tipos de documento por categoría
   */
  getByCategoria(categoria: string): Observable<ApiResponse<TipoDocumento[]>> {
    return this.http.get<ApiResponse<TipoDocumento[]>>(`${this.API_URL}/categoria/${categoria}`).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtener tipos de documento que requieren firma médica
   */
  getTiposConFirmaMedico(): Observable<ApiResponse<TipoDocumento[]>> {
    return this.http.get<ApiResponse<TipoDocumento[]>>(`${this.API_URL}/requiere-firma-medico`).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtener tipos de documento con plantilla disponible
   */
  getTiposConPlantilla(): Observable<ApiResponse<TipoDocumento[]>> {
    return this.http.get<ApiResponse<TipoDocumento[]>>(`${this.API_URL}/con-plantilla`).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Verificar si un nombre ya existe
   */
  verifyNombre(nombre: string, excludeId?: number): Observable<ApiResponse<{ exists: boolean }>> {
    let params = new HttpParams().set('nombre', nombre);
    if (excludeId) {
      params = params.set('exclude_id', excludeId.toString());
    }

    return this.http.get<ApiResponse<{ exists: boolean }>>(`${this.API_URL}/verify-nombre`, { params }).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtener tipos de documento activos
   */
  getActivos(): Observable<ApiResponse<TipoDocumento[]>> {
    return this.getAll({ activo: true });
  }

  /**
   * Obtener tipos de documento para un servicio específico
   */
  getByServicio(idServicio: number): Observable<ApiResponse<TipoDocumento[]>> {
    return this.http.get<ApiResponse<TipoDocumento[]>>(`${this.API_URL}/servicio/${idServicio}`).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtener estadísticas de tipos de documento
   */
  getEstadisticas(): Observable<ApiResponse<{
    total: number;
    activos: number;
    por_categoria: Array<{ categoria: string; total: number }>;
    con_plantilla: number;
    requieren_firma: number;
  }>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/estadisticas`).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /**
   * Obtener opciones para select de categorías
   */
  getCategorias(): { value: string; label: string }[] {
    return [
      { value: 'Ingreso', label: 'Ingreso' },
      { value: 'Evolución', label: 'Evolución' },
      { value: 'Egreso', label: 'Egreso' },
      { value: 'Procedimiento', label: 'Procedimiento' },
      { value: 'Consulta', label: 'Consulta' },
      { value: 'Laboratorio', label: 'Laboratorio' },
      { value: 'Imagen', label: 'Imagen' },
      { value: 'Quirúrgico', label: 'Quirúrgico' },
      { value: 'Administrativo', label: 'Administrativo' }
    ];
  }

  /**
   * Validar datos antes de enviar
   */
  validarDatosTipoDocumento(data: CreateTipoDocumentoDto): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!data.nombre || data.nombre.trim().length < 3) {
      errores.push('El nombre debe tener al menos 3 caracteres');
    }

    if (data.nombre && data.nombre.length > 100) {
      errores.push('El nombre no puede tener más de 100 caracteres');
    }

    if (data.descripcion && data.descripcion.length > 500) {
      errores.push('La descripción no puede tener más de 500 caracteres');
    }

    if (data.orden_impresion !== undefined && data.orden_impresion < 1) {
      errores.push('El orden de impresión debe ser mayor a 0');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Formatear datos para mostrar
   */
  formatearTipoDocumento(tipo: TipoDocumento): string {
    let texto = tipo.nombre;

    if (tipo.categoria) {
      texto += ` (${tipo.categoria})`;
    }

    if (!tipo.activo) {
      texto += ' [INACTIVO]';
    }

    return texto;
  }

  /**
   * Obtener icono según categoría
   */
  getIconoCategoria(categoria?: string): string {
    const iconos: { [key: string]: string } = {
      'Ingreso': 'fas fa-sign-in-alt',
      'Evolución': 'fas fa-chart-line',
      'Egreso': 'fas fa-sign-out-alt',
      'Procedimiento': 'fas fa-procedures',
      'Consulta': 'fas fa-user-md',
      'Laboratorio': 'fas fa-vial',
      'Imagen': 'fas fa-x-ray',
      'Quirúrgico': 'fas fa-cut',
      'Administrativo': 'fas fa-file-alt'
    };
    return iconos[categoria || ''] || 'fas fa-file-medical';
  }

  /**
   * Obtener color según categoría
   */
  getColorCategoria(categoria?: string): string {
    const colores: { [key: string]: string } = {
      'Ingreso': 'blue',
      'Evolución': 'green',
      'Egreso': 'orange',
      'Procedimiento': 'purple',
      'Consulta': 'indigo',
      'Laboratorio': 'pink',
      'Imagen': 'cyan',
      'Quirúrgico': 'red',
      'Administrativo': 'gray'
    };
    return colores[categoria || ''] || 'gray';
  }

  /**
   * Generar datos para nuevo tipo de documento
   */
  generarPlantillaVacia(): CreateTipoDocumentoDto {
    return {
      nombre: '',
      descripcion: '',
      categoria: 'Consulta',
      requiere_firma_medico: false,
      requiere_firma_paciente: false,
      plantilla_disponible: false,
      orden_impresion: 1,
      activo: true
    };
  }

  // ==========================================
  // MANEJO DE ERRORES
  // ==========================================

  private handleError(error: any): Observable<never> {
    console.error('Error en TiposDocumentoService:', error);

    let errorMessage = 'Error desconocido';

    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      switch (error.status) {
        case 400:
          errorMessage = 'Datos inválidos';
          break;
        case 401:
          errorMessage = 'No autorizado';
          break;
        case 403:
          errorMessage = 'Sin permisos';
          break;
        case 404:
          errorMessage = 'Tipo de documento no encontrado';
          break;
        case 409:
          errorMessage = 'El tipo de documento ya existe';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Error HTTP ${error.status}`;
      }
    }

    throw new Error(errorMessage);
  }
}
