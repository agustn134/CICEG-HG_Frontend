// src/app/services/personas/pacientes.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Paciente,
  PacienteCompleto,
  CreatePacienteDto,
  UpdatePacienteDto,
  PacienteFilters,
  EstadisticasPacientes,
  ApiResponse,
  PaginationInfo
} from '../../models';

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
   * Obtener todos los pacientes con filtros y paginación
   */
  getPacientes(filters?: PacienteFilters): Observable<ApiResponse<Paciente[]>> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams();

    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.activo !== undefined) params = params.set('activo', filters.activo.toString());
      if (filters.tipo_sangre) params = params.set('tipo_sangre', filters.tipo_sangre);
      if (filters.tiene_alergias !== undefined) params = params.set('tiene_alergias', filters.tiene_alergias.toString());
      if (filters.seguro_medico) params = params.set('seguro_medico', filters.seguro_medico);
      if (filters.numero_expediente) params = params.set('numero_expediente', filters.numero_expediente);
      if (filters.sort_by) params = params.set('sort_by', filters.sort_by);
      if (filters.sort_order) params = params.set('sort_order', filters.sort_order);
    }

    return this.http.get<ApiResponse<Paciente[]>>(this.API_URL, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.pacientesSubject.next(response.data);
          }
          this.setLoading(false);
          return response;
        }),
        catchError(error => {
          this.handleError('Error al obtener pacientes', error);
          throw error;
        })
      );
  }

  /**
   * Obtener paciente por ID
   */
  getPacienteById(id: number): Observable<ApiResponse<PacienteCompleto>> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<ApiResponse<PacienteCompleto>>(`${this.API_URL}/${id}`)
      .pipe(
        map(response => {
          this.setLoading(false);
          return response;
        }),
        catchError(error => {
          this.handleError('Error al obtener paciente', error);
          throw error;
        })
      );
  }

  /**
   * Crear nuevo paciente
   */
  createPaciente(pacienteData: CreatePacienteDto): Observable<ApiResponse<Paciente>> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<ApiResponse<Paciente>>(this.API_URL, pacienteData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            // Actualizar la lista local
            const currentPacientes = this.pacientesSubject.value;
            this.pacientesSubject.next([response.data, ...currentPacientes]);
          }
          this.setLoading(false);
          return response;
        }),
        catchError(error => {
          this.handleError('Error al crear paciente', error);
          throw error;
        })
      );
  }

  /**
   * Actualizar paciente existente
   */
  updatePaciente(id: number, pacienteData: UpdatePacienteDto): Observable<ApiResponse<Paciente>> {
    this.setLoading(true);
    this.clearError();

    return this.http.put<ApiResponse<Paciente>>(`${this.API_URL}/${id}`, pacienteData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            // Actualizar la lista local
            const currentPacientes = this.pacientesSubject.value;
            const updatedPacientes = currentPacientes.map(p =>
              p.id_paciente === id ? response.data! : p
            );
            this.pacientesSubject.next(updatedPacientes);
          }
          this.setLoading(false);
          return response;
        }),
        catchError(error => {
          this.handleError('Error al actualizar paciente', error);
          throw error;
        })
      );
  }

  /**
   * Eliminar paciente (soft delete)
   */
  deletePaciente(id: number): Observable<ApiResponse<any>> {
    this.setLoading(true);
    this.clearError();

    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`)
      .pipe(
        map(response => {
          if (response.success) {
            // Remover de la lista local
            const currentPacientes = this.pacientesSubject.value;
            const filteredPacientes = currentPacientes.filter(p => p.id_paciente !== id);
            this.pacientesSubject.next(filteredPacientes);
          }
          this.setLoading(false);
          return response;
        }),
        catchError(error => {
          this.handleError('Error al eliminar paciente', error);
          throw error;
        })
      );
  }

  /**
   * Obtener estadísticas de pacientes
   */
  getEstadisticas(): Observable<ApiResponse<EstadisticasPacientes>> {
    return this.http.get<ApiResponse<EstadisticasPacientes>>(`${this.API_URL}/estadisticas`)
      .pipe(
        catchError(error => {
          this.handleError('Error al obtener estadísticas', error);
          throw error;
        })
      );
  }

  // ==========================================
  // MÉTODOS PRIVADOS
  // ==========================================

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private clearError(): void {
    this.errorSubject.next(null);
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorSubject.next(message);
    this.setLoading(false);
  }

  // ==========================================
  // GETTERS
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
}
