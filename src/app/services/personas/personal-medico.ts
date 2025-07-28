// src/app/services/personas/personal-medico.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import {
  PersonalMedico,
  CreatePersonalMedicoDto,
  UpdatePersonalMedicoDto,
  ApiResponse,
  Genero
} from '../../models';

// ==========================================
// INTERFACES ESPECÍFICAS PARA EL SERVICIO
// ==========================================
export interface PersonalMedicoCompleto {
  id_personal_medico: number;
  numero_cedula: string;
  especialidad: string;
  cargo?: string;
  departamento?: string;
  activo: boolean;
  foto?: string;
  id_persona: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  sexo: Genero;
  curp?: string;
  telefono?: string;
  correo_electronico?: string;
  domicilio?: string;
  estado_civil?: string;
  religion?: string;
  tipo_sangre?: string;
  total_documentos_creados: number;
  documentos_activos: number;
  documentos_semana: number;
  documentos_mes: number;
  ultimos_documentos?: DocumentoMedico[];
}

export interface DocumentoMedico {
  id_documento: number;
  fecha_elaboracion: string;
  estado: string;
  tipo_documento: string;
  numero_expediente?: string;
  nombre_paciente?: string;
}

export interface PersonalMedicoActivo {
  id_personal_medico: number;
  numero_cedula: string;
  especialidad: string;
  cargo?: string;
  departamento?: string;
  nombre_completo: string;
}

export interface EstadisticasPersonalMedico {
  por_especialidad_departamento: {
    especialidad: string;
    departamento?: string;
    total_personal: number;
    personal_activo: number;
    total_documentos_creados: number;
    documentos_mes_actual: number;
  }[];
  mas_productivos: {
    id_personal_medico: number;
    numero_cedula: string;
    especialidad: string;
    nombre_completo: string;
    total_documentos: number;
    documentos_mes: number;
  }[];
  resumen: {
    total_personal_registrado: number;
    total_personal_activo: number;
    total_especialidades: number;
    total_departamentos: number;
  };
}

export interface PersonalMedicoFilters {
  activo?: boolean;
  especialidad?: string;
  cargo?: string;
  departamento?: string;
  buscar?: string;
  page?: number;
  limit?: number;
}



export interface MedicoConPacientes {
  // Datos del médico
  id_personal_medico: number;
  nombre_completo: string;
  numero_cedula: string;
  especialidad: string;
  cargo: string;
  departamento: string;
 foto?: string;
  // Estadísticas
  total_documentos_creados: number;
  documentos_mes_actual: number;

  // Pacientes
  pacientes_atendidos: PacienteAtendido[];
}

export interface PacienteAtendido {
  id_paciente: number;
  nombre_completo: string;
  numero_expediente: string;
  edad: number;
  ultimo_documento: string;
  total_documentos: number;
}

@Injectable({
  providedIn: 'root'
})
export class PersonalMedicoService {
  private readonly API_URL = 'http://localhost:3000/api/personas/personal-medico';

  // Estado del servicio
  private personalMedicoSubject = new BehaviorSubject<PersonalMedico[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public personalMedico$ = this.personalMedicoSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ==========================================
  // MÉTODOS CRUD PRINCIPALES
  // ==========================================

  /**
   * Obtener todo el personal médico con filtros
   * GET /api/personas/personal-medico
   */
  getPersonalMedico(filters?: PersonalMedicoFilters): Observable<ApiResponse<PersonalMedico[]>> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams();

    if (filters) {
      if (filters.activo !== undefined) params = params.set('activo', filters.activo.toString());
      if (filters.especialidad) params = params.set('especialidad', filters.especialidad);
      if (filters.cargo) params = params.set('cargo', filters.cargo);
      if (filters.departamento) params = params.set('departamento', filters.departamento);
      if (filters.buscar) params = params.set('buscar', filters.buscar);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<ApiResponse<PersonalMedico[]>>(this.API_URL, { params })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.personalMedicoSubject.next(response.data);
          }
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError('Error al obtener personal médico', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener personal médico por ID con información completa
   * GET /api/personas/personal-medico/:id
   */
  getPersonalMedicoById(id: number): Observable<ApiResponse<PersonalMedicoCompleto>> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<ApiResponse<PersonalMedicoCompleto>>(`${this.API_URL}/${id}`)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError(error => {
          this.handleError('Error al obtener personal médico', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Crear nuevo personal médico
   * POST /api/personas/personal-medico
   */
  createPersonalMedico(personalData: CreatePersonalMedicoDto): Observable<ApiResponse<PersonalMedico>> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<ApiResponse<PersonalMedico>>(this.API_URL, personalData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            // Actualizar la lista local
            const currentPersonal = this.personalMedicoSubject.value;
            this.personalMedicoSubject.next([response.data, ...currentPersonal]);
          }
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError('Error al crear personal médico', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Actualizar personal médico existente
   * PUT /api/personas/personal-medico/:id
   */
  updatePersonalMedico(id: number, personalData: UpdatePersonalMedicoDto): Observable<ApiResponse<PersonalMedico>> {
    this.setLoading(true);
    this.clearError();

    return this.http.put<ApiResponse<PersonalMedico>>(`${this.API_URL}/${id}`, personalData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            // Actualizar la lista local
            const currentPersonal = this.personalMedicoSubject.value;
            const updatedPersonal = currentPersonal.map(p =>
              p.id_personal_medico === id ? response.data! : p
            );
            this.personalMedicoSubject.next(updatedPersonal);
          }
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError('Error al actualizar personal médico', error);
          return throwError(() => error);
        })
      );
  }

// src/app/services/personas/personal-medico.service.ts

/**
 * Actualizar foto del personal médico
 * PATCH /api/personas/personal-medico/:id/foto
 */
updateFotoPersonalMedico(id: number, fotoUrl: string | null): Observable<ApiResponse<{ foto: string | null }>> {
  this.setLoading(true);
  this.clearError();

  const body = { foto: fotoUrl };

  return this.http.patch<ApiResponse<{ foto: string | null }>>(`${this.API_URL}/${id}/foto`, body)
    .pipe(
      tap(response => {
        if (response.success) {
          // Actualizar la lista local si existe
          const currentPersonal = this.personalMedicoSubject.value;
          const updatedPersonal = currentPersonal.map(p =>
            p.id_personal_medico === id ? { ...p, foto: fotoUrl || undefined } : p // 🔧 Cambiar null por undefined
          );
          this.personalMedicoSubject.next(updatedPersonal);
        }
        this.setLoading(false);
      }),
      catchError(error => {
        this.handleError('Error al actualizar foto', error);
        return throwError(() => error);
      })
    );
}


  /**
   * Eliminar personal médico
   * DELETE /api/personas/personal-medico/:id
   */
  deletePersonalMedico(id: number): Observable<ApiResponse<any>> {
    this.setLoading(true);
    this.clearError();

    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`)
      .pipe(
        tap(response => {
          if (response.success) {
            // Remover de la lista local
            const currentPersonal = this.personalMedicoSubject.value;
            const filteredPersonal = currentPersonal.filter(p => p.id_personal_medico !== id);
            this.personalMedicoSubject.next(filteredPersonal);
          }
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError('Error al eliminar personal médico', error);
          return throwError(() => error);
        })
      );
  }

  // ==========================================
  // MÉTODOS ESPECÍFICOS DE LA API
  // ==========================================

  /**
   * Obtener personal médico activo (para selects)
   * GET /api/personas/personal-medico/activos
   */
  getPersonalMedicoActivo(filters?: {
    especialidad?: string;
    cargo?: string;
    departamento?: string;
  }): Observable<ApiResponse<PersonalMedicoActivo[]>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.especialidad) params = params.set('especialidad', filters.especialidad);
      if (filters.cargo) params = params.set('cargo', filters.cargo);
      if (filters.departamento) params = params.set('departamento', filters.departamento);
    }

    return this.http.get<ApiResponse<PersonalMedicoActivo[]>>(`${this.API_URL}/activos`, { params })
      .pipe(
        catchError(error => {
          this.handleError('Error al obtener personal activo', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener estadísticas de personal médico
   * GET /api/personas/personal-medico/estadisticas
   */
  getEstadisticas(): Observable<ApiResponse<EstadisticasPersonalMedico>> {
    return this.http.get<ApiResponse<EstadisticasPersonalMedico>>(`${this.API_URL}/estadisticas`)
      .pipe(
        catchError(error => {
          this.handleError('Error al obtener estadísticas', error);
          return throwError(() => error);
        })
      );
  }

  /**
 * Obtener perfil médico con pacientes atendidos
 * GET /api/personas/personal-medico/:id/perfil-completo
 */
getPerfilMedicoConPacientes(id: number): Observable<ApiResponse<MedicoConPacientes>> {
  this.setLoading(true);
  this.clearError();

  return this.http.get<ApiResponse<MedicoConPacientes>>(`${this.API_URL}/${id}/perfil-completo`)
    .pipe(
      tap(() => this.setLoading(false)),
      catchError(error => {
        this.handleError('Error al obtener perfil médico con pacientes', error);
        return throwError(() => error);
      })
    );
}

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /**
   * Obtener personal médico por especialidad
   */
  getPersonalPorEspecialidad(especialidad: string): Observable<ApiResponse<PersonalMedico[]>> {
    return this.getPersonalMedico({ especialidad, activo: true });
  }

  /**
   * Obtener personal médico por departamento
   */
  getPersonalPorDepartamento(departamento: string): Observable<ApiResponse<PersonalMedico[]>> {
    return this.getPersonalMedico({ departamento, activo: true });
  }

  /**
   * Buscar personal médico por nombre o cédula
   */
  buscarPersonalMedico(query: string): Observable<ApiResponse<PersonalMedico[]>> {
    if (!query || query.trim().length < 2) {
      return throwError(() => new Error('La búsqueda debe tener al menos 2 caracteres'));
    }

    return this.getPersonalMedico({ buscar: query.trim() });
  }

  /**
   * Verificar si existe personal médico con una cédula específica
   */
  verificarExistenciaPorCedula(cedula: string): Observable<boolean> {
    return this.buscarPersonalMedico(cedula).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data.some(personal =>
            personal.numero_cedula === cedula
          );
        }
        return false;
      }),
      catchError(() => throwError(() => new Error('Error al verificar cédula')))
    );
  }

  /**
   * Obtener médicos especialistas activos
   */
  getEspecialistasActivos(): Observable<ApiResponse<PersonalMedicoActivo[]>> {
    return this.getPersonalMedicoActivo().pipe(
      map(response => ({
        ...response,
        data: response.data?.filter(medico =>
          medico.especialidad &&
          medico.especialidad.toLowerCase() !== 'medicina general'
        ) || []
      }))
    );
  }

  /**
   * Obtener médicos generales activos
   */
  getMedicosGeneralesActivos(): Observable<ApiResponse<PersonalMedicoActivo[]>> {
    return this.getPersonalMedicoActivo().pipe(
      map(response => ({
        ...response,
        data: response.data?.filter(medico =>
          medico.especialidad &&
          medico.especialidad.toLowerCase().includes('medicina general')
        ) || []
      }))
    );
  }

  /**
   * Obtener personal por cargo específico
   */
  getPersonalPorCargo(cargo: string): Observable<ApiResponse<PersonalMedicoActivo[]>> {
    return this.getPersonalMedicoActivo({ cargo });
  }

  /**
   * Obtener jefes de servicio activos
   */
  getJefesDeServicio(): Observable<ApiResponse<PersonalMedicoActivo[]>> {
    return this.getPersonalMedicoActivo().pipe(
      map(response => ({
        ...response,
        data: response.data?.filter(medico =>
          medico.cargo &&
          medico.cargo.toLowerCase().includes('jefe')
        ) || []
      }))
    );
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

  get currentPersonalMedico(): PersonalMedico[] {
    return this.personalMedicoSubject.value;
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
    this.personalMedicoSubject.next([]);
    this.clearError();
    this.setLoading(false);
  }

  /**
   * Recargar la lista de personal médico
   */
  reloadPersonalMedico(filters?: PersonalMedicoFilters): Observable<ApiResponse<PersonalMedico[]>> {
    return this.getPersonalMedico(filters);
  }
}
