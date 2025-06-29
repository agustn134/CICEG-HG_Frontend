// // src/app/services/personas/pacientes.ts
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable, BehaviorSubject } from 'rxjs';
// import { map, catchError } from 'rxjs/operators';
// import {
//   Paciente,
//   PacienteCompleto,
//   CreatePacienteDto,
//   UpdatePacienteDto,
//   PacienteFilters,
//   EstadisticasPacientes,
//   ApiResponse,
//   PaginationInfo
// } from '../../models';

// @Injectable({
//   providedIn: 'root'
// })
// export class PacientesService {
//   private readonly API_URL = 'http://localhost:3000/api/personas/pacientes';

//   // Estado del servicio
//   private pacientesSubject = new BehaviorSubject<Paciente[]>([]);
//   private loadingSubject = new BehaviorSubject<boolean>(false);
//   private errorSubject = new BehaviorSubject<string | null>(null);

//   // Observables públicos
//   public pacientes$ = this.pacientesSubject.asObservable();
//   public loading$ = this.loadingSubject.asObservable();
//   public error$ = this.errorSubject.asObservable();

//   constructor(private http: HttpClient) {}

//   // ==========================================
//   // MÉTODOS CRUD PRINCIPALES
//   // ==========================================

//   /**
//    * Obtener todos los pacientes con filtros y paginación
//    */
//   getPacientes(filters?: PacienteFilters): Observable<ApiResponse<Paciente[]>> {
//     this.setLoading(true);
//     this.clearError();

//     let params = new HttpParams();

//     if (filters) {
//       if (filters.page) params = params.set('page', filters.page.toString());
//       if (filters.limit) params = params.set('limit', filters.limit.toString());
//       if (filters.search) params = params.set('search', filters.search);
//       if (filters.activo !== undefined) params = params.set('activo', filters.activo.toString());
//       if (filters.tipo_sangre) params = params.set('tipo_sangre', filters.tipo_sangre);
//       if (filters.tiene_alergias !== undefined) params = params.set('tiene_alergias', filters.tiene_alergias.toString());
//       if (filters.seguro_medico) params = params.set('seguro_medico', filters.seguro_medico);
//       if (filters.numero_expediente) params = params.set('numero_expediente', filters.numero_expediente);
//       if (filters.sort_by) params = params.set('sort_by', filters.sort_by);
//       if (filters.sort_order) params = params.set('sort_order', filters.sort_order);
//     }

//     return this.http.get<ApiResponse<Paciente[]>>(this.API_URL, { params })
//       .pipe(
//         map(response => {
//           if (response.success && response.data) {
//             this.pacientesSubject.next(response.data);
//           }
//           this.setLoading(false);
//           return response;
//         }),
//         catchError(error => {
//           this.handleError('Error al obtener pacientes', error);
//           throw error;
//         })
//       );
//   }

//   /**
//    * Obtener paciente por ID
//    */
//   getPacienteById(id: number): Observable<ApiResponse<PacienteCompleto>> {
//     this.setLoading(true);
//     this.clearError();

//     return this.http.get<ApiResponse<PacienteCompleto>>(`${this.API_URL}/${id}`)
//       .pipe(
//         map(response => {
//           this.setLoading(false);
//           return response;
//         }),
//         catchError(error => {
//           this.handleError('Error al obtener paciente', error);
//           throw error;
//         })
//       );
//   }

//   /**
//    * Crear nuevo paciente
//    */
//   createPaciente(pacienteData: CreatePacienteDto): Observable<ApiResponse<Paciente>> {
//     this.setLoading(true);
//     this.clearError();

//     return this.http.post<ApiResponse<Paciente>>(this.API_URL, pacienteData)
//       .pipe(
//         map(response => {
//           if (response.success && response.data) {
//             // Actualizar la lista local
//             const currentPacientes = this.pacientesSubject.value;
//             this.pacientesSubject.next([response.data, ...currentPacientes]);
//           }
//           this.setLoading(false);
//           return response;
//         }),
//         catchError(error => {
//           this.handleError('Error al crear paciente', error);
//           throw error;
//         })
//       );
//   }

//   /**
//    * Actualizar paciente existente
//    */
//   updatePaciente(id: number, pacienteData: UpdatePacienteDto): Observable<ApiResponse<Paciente>> {
//     this.setLoading(true);
//     this.clearError();

//     return this.http.put<ApiResponse<Paciente>>(`${this.API_URL}/${id}`, pacienteData)
//       .pipe(
//         map(response => {
//           if (response.success && response.data) {
//             // Actualizar la lista local
//             const currentPacientes = this.pacientesSubject.value;
//             const updatedPacientes = currentPacientes.map(p =>
//               p.id_paciente === id ? response.data! : p
//             );
//             this.pacientesSubject.next(updatedPacientes);
//           }
//           this.setLoading(false);
//           return response;
//         }),
//         catchError(error => {
//           this.handleError('Error al actualizar paciente', error);
//           throw error;
//         })
//       );
//   }

//   /**
//    * Eliminar paciente (soft delete)
//    */
//   deletePaciente(id: number): Observable<ApiResponse<any>> {
//     this.setLoading(true);
//     this.clearError();

//     return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`)
//       .pipe(
//         map(response => {
//           if (response.success) {
//             // Remover de la lista local
//             const currentPacientes = this.pacientesSubject.value;
//             const filteredPacientes = currentPacientes.filter(p => p.id_paciente !== id);
//             this.pacientesSubject.next(filteredPacientes);
//           }
//           this.setLoading(false);
//           return response;
//         }),
//         catchError(error => {
//           this.handleError('Error al eliminar paciente', error);
//           throw error;
//         })
//       );
//   }

//   /**
//    * Obtener estadísticas de pacientes
//    */
//   getEstadisticas(): Observable<ApiResponse<EstadisticasPacientes>> {
//     return this.http.get<ApiResponse<EstadisticasPacientes>>(`${this.API_URL}/estadisticas`)
//       .pipe(
//         catchError(error => {
//           this.handleError('Error al obtener estadísticas', error);
//           throw error;
//         })
//       );
//   }

//   // ==========================================
//   // MÉTODOS PRIVADOS
//   // ==========================================

//   private setLoading(loading: boolean): void {
//     this.loadingSubject.next(loading);
//   }

//   private clearError(): void {
//     this.errorSubject.next(null);
//   }

//   private handleError(message: string, error: any): void {
//     console.error(message, error);
//     this.errorSubject.next(message);
//     this.setLoading(false);
//   }

//   // ==========================================
//   // GETTERS
//   // ==========================================

//   get currentPacientes(): Paciente[] {
//     return this.pacientesSubject.value;
//   }

//   get isLoading(): boolean {
//     return this.loadingSubject.value;
//   }

//   get currentError(): string | null {
//     return this.errorSubject.value;
//   }
// }











// src/app/services/personas/pacientes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import {
  Paciente,
  CreatePacienteDto,
  UpdatePacienteDto,
  ApiResponse,
  TipoSangreEnum,
  Genero
} from '../../models';

// ==========================================
// INTERFACES ESPECÍFICAS PARA EL SERVICIO
// ==========================================
export interface PacienteCompleto {
  id_paciente: number;
  alergias?: string;
  transfusiones: boolean;
  detalles_transfusiones?: string;
  familiar_responsable?: string;
  parentesco_familiar?: string;
  telefono_familiar?: string;
  ocupacion?: string;
  escolaridad?: string;
  lugar_nacimiento?: string;
  id_persona: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  sexo: Genero;
  curp: string;
  telefono?: string;
  correo_electronico?: string;
  domicilio?: string;
  estado_civil?: string;
  religion?: string;
  tipo_sangre?: string;
  edad: number;
  total_expedientes: number;
  expedientes_activos: number;
  expedientes?: ExpedienteResumen[];
}

export interface ExpedienteResumen {
  id_expediente: number;
  numero_expediente: string;
  estado: string;
  fecha_creacion: string;
  total_documentos: number;
  internamientos_activos: number;
}

export interface PacienteBusqueda {
  id_paciente: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  fecha_nacimiento: string;
  sexo: Genero;
  edad: number;
  nombre_completo: string;
}

export interface EstadisticasPacientes {
  resumen: {
    total_pacientes: number;
    pacientes_masculinos: number;
    pacientes_femeninos: number;
    con_transfusiones: number;
    con_alergias: number;
    edad_promedio: number;
  };
  distribucion_por_edad: {
    grupo_edad: string;
    total_pacientes: number;
    masculinos: number;
    femeninos: number;
  }[];
  distribucion_por_tipo_sangre: {
    tipo_sangre: string;
    total_pacientes: number;
    masculinos: number;
    femeninos: number;
  }[];
  pacientes_con_mas_expedientes: {
    id_paciente: number;
    nombre_completo: string;
    curp: string;
    edad: number;
    total_expedientes: number;
    expedientes_activos: number;
  }[];
}

export interface HistorialMedicoResumido {
  paciente: {
    id_paciente: number;
    nombre_completo: string;
  };
  expedientes: {
    id_expediente: number;
    numero_expediente: string;
    fecha_creacion: string;
    total_documentos: number;
    historias_clinicas: number;
    notas_urgencias: number;
    notas_evolucion: number;
    ultima_atencion?: string;
  }[];
  internamientos_recientes: {
    id_internamiento: number;
    fecha_ingreso: string;
    fecha_egreso?: string;
    motivo_ingreso: string;
    diagnostico_ingreso: string;
    diagnostico_egreso?: string;
    servicio?: string;
    cama?: string;
    medico_responsable?: string;
  }[];
}

export interface PacienteFilters {
  sexo?: Genero;
  edad_min?: number;
  edad_max?: number;
  tiene_alergias?: boolean;
  buscar?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private readonly API_URL = 'http://localhost:3000/api/personas/pacientes';

  // Estado del servicio
  private pacientesSubject = new BehaviorSubject<Paciente[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public pacientes$ = this.pacientesSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ==========================================
  // MÉTODOS CRUD PRINCIPALES
  // ==========================================

  /**
   * Obtener todos los pacientes con filtros
   * GET /api/personas/pacientes
   */
  getPacientes(filters?: PacienteFilters): Observable<ApiResponse<Paciente[]>> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams();

    if (filters) {
      if (filters.sexo) params = params.set('sexo', filters.sexo);
      if (filters.edad_min !== undefined) params = params.set('edad_min', filters.edad_min.toString());
      if (filters.edad_max !== undefined) params = params.set('edad_max', filters.edad_max.toString());
      if (filters.tiene_alergias !== undefined) params = params.set('tiene_alergias', filters.tiene_alergias.toString());
      if (filters.buscar) params = params.set('buscar', filters.buscar);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<ApiResponse<Paciente[]>>(this.API_URL, { params })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.pacientesSubject.next(response.data);
          }
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError('Error al obtener pacientes', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener paciente por ID con información completa
   * GET /api/personas/pacientes/:id
   */
  getPacienteById(id: number): Observable<ApiResponse<PacienteCompleto>> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<ApiResponse<PacienteCompleto>>(`${this.API_URL}/${id}`)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError(error => {
          this.handleError('Error al obtener paciente', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Crear nuevo paciente
   * POST /api/personas/pacientes
   */
  createPaciente(pacienteData: CreatePacienteDto): Observable<ApiResponse<Paciente>> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<ApiResponse<Paciente>>(this.API_URL, pacienteData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            // Actualizar la lista local
            const currentPacientes = this.pacientesSubject.value;
            this.pacientesSubject.next([response.data, ...currentPacientes]);
          }
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError('Error al crear paciente', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Actualizar paciente existente
   * PUT /api/personas/pacientes/:id
   */
  updatePaciente(id: number, pacienteData: UpdatePacienteDto): Observable<ApiResponse<Paciente>> {
    this.setLoading(true);
    this.clearError();

    return this.http.put<ApiResponse<Paciente>>(`${this.API_URL}/${id}`, pacienteData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            // Actualizar la lista local
            const currentPacientes = this.pacientesSubject.value;
            const updatedPacientes = currentPacientes.map(p =>
              p.id_paciente === id ? response.data! : p
            );
            this.pacientesSubject.next(updatedPacientes);
          }
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError('Error al actualizar paciente', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Eliminar paciente
   * DELETE /api/personas/pacientes/:id
   */
  deletePaciente(id: number): Observable<ApiResponse<any>> {
    this.setLoading(true);
    this.clearError();

    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`)
      .pipe(
        tap(response => {
          if (response.success) {
            // Remover de la lista local
            const currentPacientes = this.pacientesSubject.value;
            const filteredPacientes = currentPacientes.filter(p => p.id_paciente !== id);
            this.pacientesSubject.next(filteredPacientes);
          }
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError('Error al eliminar paciente', error);
          return throwError(() => error);
        })
      );
  }

  // ==========================================
  // MÉTODOS ESPECÍFICOS DE LA API
  // ==========================================

  /**
   * Buscar pacientes para autocomplete
   * GET /api/personas/pacientes/buscar?q=texto
   */
  buscarPacientes(query: string): Observable<ApiResponse<PacienteBusqueda[]>> {
    if (!query || query.trim().length < 2) {
      return throwError(() => new Error('La búsqueda debe tener al menos 2 caracteres'));
    }

    const params = new HttpParams().set('q', query.trim());

    return this.http.get<ApiResponse<PacienteBusqueda[]>>(`${this.API_URL}/buscar`, { params })
      .pipe(
        catchError(error => {
          this.handleError('Error al buscar pacientes', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener estadísticas de pacientes
   * GET /api/personas/pacientes/estadisticas
   */
  getEstadisticas(): Observable<ApiResponse<EstadisticasPacientes>> {
    return this.http.get<ApiResponse<EstadisticasPacientes>>(`${this.API_URL}/estadisticas`)
      .pipe(
        catchError(error => {
          this.handleError('Error al obtener estadísticas', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener historial médico resumido de un paciente
   * GET /api/personas/pacientes/:id/historial
   */
  getHistorialMedicoResumido(id: number): Observable<ApiResponse<HistorialMedicoResumido>> {
    return this.http.get<ApiResponse<HistorialMedicoResumido>>(`${this.API_URL}/${id}/historial`)
      .pipe(
        catchError(error => {
          this.handleError('Error al obtener historial médico', error);
          return throwError(() => error);
        })
      );
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /**
   * Obtener pacientes con filtros avanzados
   */
  getPacientesConFiltros(filtros: {
    sexo?: Genero;
    edadMinima?: number;
    edadMaxima?: number;
    tieneAlergias?: boolean;
    textoBusqueda?: string;
  }): Observable<ApiResponse<Paciente[]>> {
    const filters: PacienteFilters = {
      sexo: filtros.sexo,
      edad_min: filtros.edadMinima,
      edad_max: filtros.edadMaxima,
      tiene_alergias: filtros.tieneAlergias,
      buscar: filtros.textoBusqueda
    };

    return this.getPacientes(filters);
  }

  /**
   * Verificar si existe un paciente por CURP
   */
  verificarExistenciaPorCURP(curp: string): Observable<boolean> {
    return this.buscarPacientes(curp).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data.some(paciente =>
            paciente.curp.toLowerCase() === curp.toLowerCase()
          );
        }
        return false;
      }),
      catchError(() => throwError(() => new Error('Error al verificar CURP')))
    );
  }

  /**
   * Obtener pacientes por género
   */
  getPacientesPorGenero(genero: Genero): Observable<ApiResponse<Paciente[]>> {
    return this.getPacientes({ sexo: genero });
  }

  /**
   * Obtener pacientes por rango de edad
   */
  getPacientesPorRangoEdad(edadMinima: number, edadMaxima: number): Observable<ApiResponse<Paciente[]>> {
    return this.getPacientes({
      edad_min: edadMinima,
      edad_max: edadMaxima
    });
  }

  /**
   * Obtener pacientes con alergias
   */
  getPacientesConAlergias(): Observable<ApiResponse<Paciente[]>> {
    return this.getPacientes({ tiene_alergias: true });
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

  get currentPacientes(): Paciente[] {
    return this.pacientesSubject.value;
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
    this.pacientesSubject.next([]);
    this.clearError();
    this.setLoading(false);
  }

  /**
   * Recargar la lista de pacientes
   */
  reloadPacientes(filters?: PacienteFilters): Observable<ApiResponse<Paciente[]>> {
    return this.getPacientes(filters);
  }
}
