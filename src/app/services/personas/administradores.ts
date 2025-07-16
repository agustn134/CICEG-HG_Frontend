// src/app/services/personas/administradores.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import {
  Administrador,
  AdministradorFilters,
  EstadisticasAdministradores,
  CreateAdministradorDto,
  UpdateAdministradorDto,
  ChangePasswordDto,
  ResetPasswordDto,
  LoginCredentials,
  LoginResponse,
  ValidacionAdministrador,
  AccesoAdministrador,
  HistorialAdministrador,
  NivelAcceso,
  ApiResponse
} from '../../models';

// ==========================================
// INTERFACES ESPECÍFICAS PARA EL SERVICIO
// ==========================================
export interface AdministradorCompleto extends Administrador {
  accesos_recientes?: AccesoAdministrador[];
  historial_cambios?: HistorialAdministrador[];
  estadisticas_personales?: {
    total_sesiones: number;
    promedio_duracion_sesion: number;
    ultimo_cambio_password: string;
    accesos_ultimo_mes: number;
  };
}

export interface AdministradorParaLogin {
  id_administrador: number;
  usuario: string;
  nivel_acceso: NivelAcceso;
  activo: boolean;
  nombre_completo: string;
  ultimo_acceso?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {
  private readonly API_URL = 'http://localhost:3000/api/personas/administradores';

  // Estado del servicio
  private administradoresSubject = new BehaviorSubject<Administrador[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public administradores$ = this.administradoresSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ==========================================
  // MÉTODOS CRUD PRINCIPALES
  // ==========================================

  /**
   * Obtener todos los administradores con filtros
   * GET /api/personas/administradores
   */
  getAdministradores(filters?: AdministradorFilters): Observable<ApiResponse<Administrador[]>> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams();

    if (filters) {
      if (filters.activo !== undefined) params = params.set('activo', filters.activo.toString());
      if (filters.nivel_acceso) params = params.set('nivel_acceso', filters.nivel_acceso);
      if (filters.usuario) params = params.set('usuario', filters.usuario);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.con_accesos_recientes !== undefined) {
        params = params.set('con_accesos_recientes', filters.con_accesos_recientes.toString());
      }
      if (filters.fecha_ultimo_acceso_inicio) {
        params = params.set('fecha_ultimo_acceso_inicio', filters.fecha_ultimo_acceso_inicio);
      }
      if (filters.fecha_ultimo_acceso_fin) {
        params = params.set('fecha_ultimo_acceso_fin', filters.fecha_ultimo_acceso_fin);
      }
    }

    return this.http.get<ApiResponse<Administrador[]>>(this.API_URL, { params })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.administradoresSubject.next(response.data);
          }
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError('Error al obtener administradores', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener administrador por ID con información completa
   * GET /api/personas/administradores/:id
   */
  getAdministradorById(id: number): Observable<ApiResponse<AdministradorCompleto>> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<ApiResponse<AdministradorCompleto>>(`${this.API_URL}/${id}`)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError(error => {
          this.handleError('Error al obtener administrador', error);
          return throwError(() => error);
        })
      );
  }


toggleAdministrador(id: number, nuevoEstado: boolean): Observable<ApiResponse<any>> {
  this.setLoading(true);
  this.clearError();

  return this.http.patch<ApiResponse<any>>(`${this.API_URL}/${id}/toggle`, {})
    .pipe(
      tap(() => this.setLoading(false)),
      catchError(error => {
        this.handleError('Error al cambiar estado del administrador', error);
        return throwError(() => error);
      })
    );
}

  /**
   * Crear nuevo administrador
   * POST /api/personas/administradores
   */
  createAdministrador(adminData: CreateAdministradorDto): Observable<ApiResponse<Administrador>> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<ApiResponse<Administrador>>(this.API_URL, adminData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            // Actualizar la lista local
            const currentAdmins = this.administradoresSubject.value;
            this.administradoresSubject.next([response.data, ...currentAdmins]);
          }
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError('Error al crear administrador', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Actualizar administrador existente
   * PUT /api/personas/administradores/:id
   */
  updateAdministrador(id: number, adminData: UpdateAdministradorDto): Observable<ApiResponse<Administrador>> {
    this.setLoading(true);
    this.clearError();

    return this.http.put<ApiResponse<Administrador>>(`${this.API_URL}/${id}`, adminData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            // Actualizar la lista local
            const currentAdmins = this.administradoresSubject.value;
            const updatedAdmins = currentAdmins.map(admin =>
              admin.id_administrador === id ? response.data! : admin
            );
            this.administradoresSubject.next(updatedAdmins);
          }
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError('Error al actualizar administrador', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Eliminar administrador
   * DELETE /api/personas/administradores/:id
   */
  deleteAdministrador(id: number): Observable<ApiResponse<any>> {
    this.setLoading(true);
    this.clearError();

    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`)
      .pipe(
        tap(response => {
          if (response.success) {
            // Remover de la lista local
            const currentAdmins = this.administradoresSubject.value;
            const filteredAdmins = currentAdmins.filter(admin => admin.id_administrador !== id);
            this.administradoresSubject.next(filteredAdmins);
          }
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError('Error al eliminar administrador', error);
          return throwError(() => error);
        })
      );
  }

  // ==========================================
  // MÉTODOS DE GESTIÓN DE CONTRASEÑAS
  // ==========================================

  /**
   * Cambiar contraseña del administrador autenticado
   * PUT /api/personas/administradores/:id/password
   */
  changePassword(id: number, passwordData: ChangePasswordDto): Observable<ApiResponse<any>> {
    this.setLoading(true);
    this.clearError();

    return this.http.put<ApiResponse<any>>(`${this.API_URL}/${id}/password`, passwordData)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError(error => {
          this.handleError('Error al cambiar contraseña', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Resetear contraseña de administrador (solo para administradores)
   * PUT /api/personas/administradores/:id/reset-password
   */
  resetPassword(id: number, passwordData: ResetPasswordDto): Observable<ApiResponse<any>> {
    this.setLoading(true);
    this.clearError();

    return this.http.put<ApiResponse<any>>(`${this.API_URL}/${id}/reset-password`, passwordData)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError(error => {
          this.handleError('Error al resetear contraseña', error);
          return throwError(() => error);
        })
      );
  }

  // ==========================================
  // MÉTODOS DE AUTENTICACIÓN
  // ==========================================

  /**
   * Validar credenciales de login
   * POST /api/personas/administradores/login
   */
  login(credentials: LoginCredentials): Observable<ApiResponse<LoginResponse>> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError(error => {
          this.handleError('Error en el login', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Registrar logout del administrador
   * POST /api/personas/administradores/:id/logout
   */
  logout(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/${id}/logout`, {})
      .pipe(
        catchError(error => {
          this.handleError('Error en el logout', error);
          return throwError(() => error);
        })
      );
  }

  // ==========================================
  // MÉTODOS DE ESTADÍSTICAS Y REPORTES
  // ==========================================

  /**
   * Obtener estadísticas de administradores
   * GET /api/personas/administradores/estadisticas
   */
  getEstadisticas(): Observable<ApiResponse<EstadisticasAdministradores>> {
    return this.http.get<ApiResponse<EstadisticasAdministradores>>(`${this.API_URL}/estadisticas`)
      .pipe(
        catchError(error => {
          this.handleError('Error al obtener estadísticas', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener administradores activos (para selects)
   * GET /api/personas/administradores/activos
   */
  getAdministradoresActivos(): Observable<ApiResponse<AdministradorParaLogin[]>> {
    return this.http.get<ApiResponse<AdministradorParaLogin[]>>(`${this.API_URL}/activos`)
      .pipe(
        catchError(error => {
          this.handleError('Error al obtener administradores activos', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener historial de accesos de un administrador
   * GET /api/personas/administradores/:id/accesos
   */
  getHistorialAccesos(id: number, limit: number = 10): Observable<ApiResponse<AccesoAdministrador[]>> {
    let params = new HttpParams().set('limit', limit.toString());

    return this.http.get<ApiResponse<AccesoAdministrador[]>>(`${this.API_URL}/${id}/accesos`, { params })
      .pipe(
        catchError(error => {
          this.handleError('Error al obtener historial de accesos', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener historial de cambios de un administrador
   * GET /api/personas/administradores/:id/historial
   */
  getHistorialCambios(id: number, limit: number = 10): Observable<ApiResponse<HistorialAdministrador[]>> {
    let params = new HttpParams().set('limit', limit.toString());

    return this.http.get<ApiResponse<HistorialAdministrador[]>>(`${this.API_URL}/${id}/historial`, { params })
      .pipe(
        catchError(error => {
          this.handleError('Error al obtener historial de cambios', error);
          return throwError(() => error);
        })
      );
  }

  // ==========================================
  // MÉTODOS DE VALIDACIÓN
  // ==========================================

  /**
   * Validar si un usuario está disponible
   * GET /api/personas/administradores/validar-usuario/:usuario
   */
  validarUsuario(usuario: string): Observable<ApiResponse<{ disponible: boolean }>> {
    return this.http.get<ApiResponse<{ disponible: boolean }>>(`${this.API_URL}/validar-usuario/${usuario}`)
      .pipe(
        catchError(error => {
          this.handleError('Error al validar usuario', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Validar si un administrador puede ser eliminado
   * GET /api/personas/administradores/:id/validar-eliminacion
   */
  validarEliminacion(id: number): Observable<ApiResponse<ValidacionAdministrador>> {
    return this.http.get<ApiResponse<ValidacionAdministrador>>(`${this.API_URL}/${id}/validar-eliminacion`)
      .pipe(
        catchError(error => {
          this.handleError('Error al validar eliminación', error);
          return throwError(() => error);
        })
      );
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /**
   * Obtener administradores por nivel de acceso
   */
  getAdministradoresPorNivel(nivel: NivelAcceso): Observable<ApiResponse<Administrador[]>> {
    return this.getAdministradores({ nivel_acceso: nivel, activo: true });
  }

  /**
   * Buscar administradores por nombre o usuario
   */
  buscarAdministradores(query: string): Observable<ApiResponse<Administrador[]>> {
    if (!query || query.trim().length < 2) {
      return throwError(() => new Error('La búsqueda debe tener al menos 2 caracteres'));
    }

    return this.getAdministradores({ search: query.trim() });
  }

  /**
   * Obtener administradores con accesos recientes
   */
  getAdministradoresConAccesosRecientes(dias: number = 30): Observable<ApiResponse<Administrador[]>> {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);

    return this.getAdministradores({
      con_accesos_recientes: true,
      fecha_ultimo_acceso_inicio: fechaInicio.toISOString().split('T')[0]
    });
  }

  /**
   * Obtener administradores sin acceso reciente
   */
  getAdministradoresSinAccesoReciente(dias: number = 30): Observable<ApiResponse<Administrador[]>> {
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() - dias);

    return this.getAdministradores({
      fecha_ultimo_acceso_fin: fechaFin.toISOString().split('T')[0]
    });
  }

  /**
   * Cambiar estado de un administrador
   */
  cambiarEstado(id: number, activo: boolean): Observable<ApiResponse<Administrador>> {
    return this.updateAdministrador(id, { activo });
  }

  /**
   * Cambiar nivel de acceso
   */
  cambiarNivelAcceso(id: number, nivel: NivelAcceso): Observable<ApiResponse<Administrador>> {
    return this.updateAdministrador(id, { nivel_acceso: nivel });
  }

  // ==========================================
  // MÉTODOS PRIVADOS PARA MANEJO DE ESTADO
  // ==========================================

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private clearError(): void {
    this.errorSubject.next(null);
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    let errorMessage = message;

    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    this.errorSubject.next(errorMessage);
    this.setLoading(false);
  }

  // ==========================================
  // GETTERS PARA ACCESO DIRECTO AL ESTADO
  // ==========================================

  get currentAdministradores(): Administrador[] {
    return this.administradoresSubject.value;
  }

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  get currentError(): string | null {
    return this.errorSubject.value;
  }

  /**
   * Limpiar el estado del servicio
   */
  clearState(): void {
    this.administradoresSubject.next([]);
    this.clearError();
    this.setLoading(false);
  }

  /**
   * Recargar la lista de administradores
   */
  reloadAdministradores(filters?: AdministradorFilters): Observable<ApiResponse<Administrador[]>> {
    return this.getAdministradores(filters);
  }

  // ==========================================
  // MÉTODOS PARA MANEJO DE CACHE
  // ==========================================

  /**
   * Verificar si necesita recargar datos
   */
  private needsReload(): boolean {
    return this.administradoresSubject.value.length === 0;
  }

  /**
   * Obtener datos del cache o recargar
   */
  getAdministradoresFromCacheOrReload(filters?: AdministradorFilters): Observable<ApiResponse<Administrador[]>> {
    if (this.needsReload()) {
      return this.getAdministradores(filters);
    }

    // Retornar datos del cache
    return new Observable(observer => {
      observer.next({
        success: true,
        message: 'Datos del cache',
        data: this.currentAdministradores
      });
      observer.complete();
    });
  }

  // ==========================================
  // MÉTODOS PARA TRANSFORMACIÓN DE DATOS
  // ==========================================

  /**
   * Transformar administrador para uso en selects
   */
  transformarParaSelect(administradores: Administrador[]): { label: string; value: number }[] {
    return administradores.map(admin => ({
      label: `${admin.usuario} (${admin.nivel_acceso})`,
      value: admin.id_administrador
    }));
  }

  /**
   * Agrupar administradores por nivel de acceso
   */
  agruparPorNivel(administradores: Administrador[]): { [key: string]: Administrador[] } {
    return administradores.reduce((acc, admin) => {
      const nivel = admin.nivel_acceso;
      if (!acc[nivel]) acc[nivel] = [];
      acc[nivel].push(admin);
      return acc;
    }, {} as { [key: string]: Administrador[] });
  }

  /**
   * Obtener estadísticas rápidas
   */
  getEstadisticasRapidas(): {
    total: number;
    activos: number;
    inactivos: number;
    porNivel: { [key: string]: number };
  } {
    const administradores = this.currentAdministradores;
    const porNivel = this.agruparPorNivel(administradores);

    return {
      total: administradores.length,
      activos: administradores.filter(a => a.activo).length,
      inactivos: administradores.filter(a => !a.activo).length,
      porNivel: Object.keys(porNivel).reduce((acc, nivel) => {
        acc[nivel] = porNivel[nivel].length;
        return acc;
      }, {} as { [key: string]: number })
    };
  }
}
