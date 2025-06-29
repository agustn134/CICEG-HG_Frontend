// // src/app/services/personas/personas.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable, BehaviorSubject } from 'rxjs';
// import { map, catchError } from 'rxjs/operators';
// import {
//   Persona,
//   PersonaFrontend,
//   CreatePersonaFrontendDto,
//   UpdatePersonaDto,
//   PersonaFilters,
//   EstadisticasPersonas,
//   PersonaMapper,
//   ApiResponse,
// } from '../../models';

// @Injectable({
//   providedIn: 'root'
// })
// export class PersonasService {
//   private readonly API_URL = 'http://localhost:3000/api/personas';

//   // Estado del servicio (mantenemos formato frontend para la UI)
//   private personasSubject = new BehaviorSubject<PersonaFrontend[]>([]);
//   private loadingSubject = new BehaviorSubject<boolean>(false);
//   private errorSubject = new BehaviorSubject<string | null>(null);

//   // Observables públicos
//   public personas$ = this.personasSubject.asObservable();
//   public loading$ = this.loadingSubject.asObservable();
//   public error$ = this.errorSubject.asObservable();

//   constructor(private http: HttpClient) {}

//   // ==========================================
//   // MÉTODOS CRUD PRINCIPALES
//   // ==========================================

//   /**
//    * Obtener todas las personas con filtros y paginación
//    */
//   getPersonas(filters?: PersonaFilters): Observable<ApiResponse<PersonaFrontend[]>> {
//     this.setLoading(true);
//     this.clearError();

//     let params = new HttpParams();

//     if (filters) {
//       if (filters.page) params = params.set('page', filters.page.toString());
//       if (filters.limit) params = params.set('limit', filters.limit.toString());
//       if (filters.search) params = params.set('buscar', filters.search); // 🔥 CAMBIO: backend usa 'buscar'
//       if (filters.activo !== undefined) params = params.set('activo', filters.activo.toString());
//       if (filters.sexo) params = params.set('sexo', filters.sexo); // 🔥 CAMBIO: usar 'sexo'
//       if (filters.estado_civil) params = params.set('estado_civil', filters.estado_civil);
//       if (filters.edad_minima) params = params.set('edad_min', filters.edad_minima.toString());
//       if (filters.edad_maxima) params = params.set('edad_max', filters.edad_maxima.toString());
//       if (filters.ciudad) params = params.set('ciudad', filters.ciudad);
//       if (filters.estado) params = params.set('estado', filters.estado);
//       if (filters.tipo_sangre) params = params.set('tipo_sangre', filters.tipo_sangre);
//       if (filters.sort_by) params = params.set('sort_by', filters.sort_by);
//       if (filters.sort_order) params = params.set('sort_order', filters.sort_order);
//     }

//     return this.http.get<ApiResponse<Persona[]>>(this.API_URL, { params })
//       .pipe(
//         map(response => {
//           if (response.success && response.data) {
//             // 🔥 CONVERTIR: Backend -> Frontend
//             const personasFrontend = response.data.map(persona =>
//               PersonaMapper.backendToFrontend(persona)
//             );
//             this.personasSubject.next(personasFrontend);

//             // Devolver respuesta convertida
//             return {
//               success: response.success,
//               message: response.message,
//               data: personasFrontend,
//               pagination: response.pagination,
//               timestamp: response.timestamp
//             } as ApiResponse<PersonaFrontend[]>;
//           }
//           this.setLoading(false);
//           return {
//             success: false,
//             message: 'No se encontraron datos',
//             data: []
//           } as ApiResponse<PersonaFrontend[]>;
//         }),
//         catchError(error => {
//           this.handleError('Error al obtener personas', error);
//           throw error;
//         })
//       );
//   }

//   /**
//    * Obtener persona por ID
//    */
//   getPersonaById(id: number): Observable<ApiResponse<PersonaFrontend>> {
//     this.setLoading(true);
//     this.clearError();

//     return this.http.get<ApiResponse<Persona>>(`${this.API_URL}/${id}`)
//       .pipe(
//         map(response => {
//           this.setLoading(false);
//           if (response.success && response.data) {
//             const personaFrontend = PersonaMapper.backendToFrontend(response.data);
//             return {
//               success: response.success,
//               message: response.message,
//               data: personaFrontend,
//               timestamp: response.timestamp
//             } as ApiResponse<PersonaFrontend>;
//           }
//           return {
//             success: false,
//             message: 'Persona no encontrada',
//             data: undefined
//           } as ApiResponse<PersonaFrontend>;
//         }),
//         catchError(error => {
//           this.handleError('Error al obtener persona', error);
//           throw error;
//         })
//       );
//   }

//   /**
//    * Crear nueva persona
//    */
//   createPersona(personaDataFrontend: CreatePersonaFrontendDto): Observable<ApiResponse<PersonaFrontend>> {
//     this.setLoading(true);
//     this.clearError();

//     // 🔥 CONVERTIR: Frontend -> Backend
//     const personaDataBackend = PersonaMapper.frontendToBackend(personaDataFrontend);

//     console.log('🔄 Datos enviados al backend:', personaDataBackend);

//     return this.http.post<ApiResponse<Persona>>(this.API_URL, personaDataBackend)
//       .pipe(
//         map(response => {
//           if (response.success && response.data) {
//             // 🔥 CONVERTIR: Backend -> Frontend para el estado local
//             const personaFrontend = PersonaMapper.backendToFrontend(response.data);

//             // Actualizar la lista local
//             const currentPersonas = this.personasSubject.value;
//             this.personasSubject.next([personaFrontend, ...currentPersonas]);

//             return {
//               success: response.success,
//               message: response.message,
//               data: personaFrontend,
//               timestamp: response.timestamp
//             } as ApiResponse<PersonaFrontend>;
//           }
//           this.setLoading(false);
//           return {
//             success: false,
//             message: 'Error al crear persona',
//             data: undefined
//           } as ApiResponse<PersonaFrontend>;
//         }),
//         catchError(error => {
//           this.handleError('Error al crear persona', error);
//           throw error;
//         })
//       );
//   }

//   /**
//    * Actualizar persona existente
//    */
//   updatePersona(id: number, personaDataFrontend: Partial<CreatePersonaFrontendDto>): Observable<ApiResponse<PersonaFrontend>> {
//     this.setLoading(true);
//     this.clearError();

//     // 🔥 CONVERTIR: Frontend -> Backend
//     const personaDataBackend = PersonaMapper.frontendToBackend(personaDataFrontend as CreatePersonaFrontendDto);

//     return this.http.put<ApiResponse<Persona>>(`${this.API_URL}/${id}`, personaDataBackend)
//       .pipe(
//         map(response => {
//           if (response.success && response.data) {
//             // 🔥 CONVERTIR: Backend -> Frontend
//             const personaFrontend = PersonaMapper.backendToFrontend(response.data);

//             // Actualizar la lista local
//             const currentPersonas = this.personasSubject.value;
//             const updatedPersonas = currentPersonas.map(p =>
//               p.id_persona === id ? personaFrontend : p
//             );
//             this.personasSubject.next(updatedPersonas);

//             return {
//               success: response.success,
//               message: response.message,
//               data: personaFrontend,
//               timestamp: response.timestamp
//             } as ApiResponse<PersonaFrontend>;
//           }
//           this.setLoading(false);
//           return {
//             success: false,
//             message: 'Error al actualizar persona',
//             data: undefined
//           } as ApiResponse<PersonaFrontend>;
//         }),
//         catchError(error => {
//           this.handleError('Error al actualizar persona', error);
//           throw error;
//         })
//       );
//   }

//   /**
//    * Eliminar persona (soft delete)
//    */
//   deletePersona(id: number): Observable<ApiResponse<any>> {
//     this.setLoading(true);
//     this.clearError();

//     return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`)
//       .pipe(
//         map(response => {
//           if (response.success) {
//             // Remover de la lista local
//             const currentPersonas = this.personasSubject.value;
//             const filteredPersonas = currentPersonas.filter(p => p.id_persona !== id);
//             this.personasSubject.next(filteredPersonas);
//           }
//           this.setLoading(false);
//           return response;
//         }),
//         catchError(error => {
//           this.handleError('Error al eliminar persona', error);
//           throw error;
//         })
//       );
//   }

//   /**
//    * Activar/Desactivar persona (si existe el endpoint)
//    */
//   togglePersona(id: number): Observable<ApiResponse<PersonaFrontend>> {
//     this.setLoading(true);
//     this.clearError();

//     return this.http.patch<ApiResponse<Persona>>(`${this.API_URL}/${id}/toggle`, {})
//       .pipe(
//         map(response => {
//           if (response.success && response.data) {
//             // 🔥 CONVERTIR: Backend -> Frontend
//             const personaFrontend = PersonaMapper.backendToFrontend(response.data);

//             // Actualizar la lista local
//             const currentPersonas = this.personasSubject.value;
//             const updatedPersonas = currentPersonas.map(p =>
//               p.id_persona === id ? personaFrontend : p
//             );
//             this.personasSubject.next(updatedPersonas);

//             return {
//               success: response.success,
//               message: response.message,
//               data: personaFrontend,
//               timestamp: response.timestamp
//             } as ApiResponse<PersonaFrontend>;
//           }
//           this.setLoading(false);
//           return {
//             success: false,
//             message: 'Error al cambiar estado',
//             data: undefined
//           } as ApiResponse<PersonaFrontend>;
//         }),
//         catchError(error => {
//           this.handleError('Error al cambiar estado de persona', error);
//           throw error;
//         })
//       );
//   }

//   // ==========================================
//   // MÉTODOS ESPECIALIZADOS
//   // ==========================================

//   /**
//    * Buscar personas por nombre (para autocomplete)
//    */
//   buscarPersonas(query: string, sinRol: boolean = false): Observable<ApiResponse<PersonaFrontend[]>> {
//     let params = new HttpParams()
//       .set('q', query);

//     if (sinRol) {
//       params = params.set('sin_rol', 'true');
//     }

//     return this.http.get<ApiResponse<Persona[]>>(`${this.API_URL}/buscar`, { params })
//       .pipe(
//         map(response => {
//           if (response.success && response.data) {
//             const personasFrontend = response.data.map(persona =>
//               PersonaMapper.backendToFrontend(persona)
//             );
//             return {
//               success: response.success,
//               message: response.message,
//               data: personasFrontend,
//               timestamp: response.timestamp
//             } as ApiResponse<PersonaFrontend[]>;
//           }
//           return {
//             success: false,
//             message: 'No se encontraron personas',
//             data: []
//           } as ApiResponse<PersonaFrontend[]>;
//         }),
//         catchError(error => {
//           this.handleError('Error al buscar personas', error);
//           throw error;
//         })
//       );
//   }

//   /**
//    * Obtener personas activas para selects
//    */
//   getPersonasActivas(): Observable<PersonaFrontend[]> {
//     const filters: PersonaFilters = {
//       activo: true,
//       limit: 100,
//       sort_by: 'nombre',
//       sort_order: 'ASC'
//     };

//     return this.getPersonas(filters).pipe(
//       map(response => response.data || [])
//     );
//   }

//   /**
//    * Obtener estadísticas de personas
//    */
//   getEstadisticas(): Observable<ApiResponse<EstadisticasPersonas>> {
//     return this.http.get<ApiResponse<EstadisticasPersonas>>(`${this.API_URL}/estadisticas`)
//       .pipe(
//         catchError(error => {
//           this.handleError('Error al obtener estadísticas', error);
//           throw error;
//         })
//       );
//   }

//   /**
//    * Validar CURP
//    */
//   validarCURP(curp: string): Observable<ApiResponse<{valido: boolean, mensaje?: string}>> {
//     return this.http.post<ApiResponse<{valido: boolean, mensaje?: string}>>(`${this.API_URL}/validar-curp`, { curp })
//       .pipe(
//         catchError(error => {
//           this.handleError('Error al validar CURP', error);
//           throw error;
//         })
//       );
//   }

//   /**
//    * Validar RFC
//    */
//   validarRFC(rfc: string): Observable<ApiResponse<{valido: boolean, mensaje?: string}>> {
//     return this.http.post<ApiResponse<{valido: boolean, mensaje?: string}>>(`${this.API_URL}/validar-rfc`, { rfc })
//       .pipe(
//         catchError(error => {
//           this.handleError('Error al validar RFC', error);
//           throw error;
//         })
//       );
//   }

//   // ==========================================
//   // MÉTODOS UTILITARIOS
//   // ==========================================

//   /**
//    * Limpiar datos del servicio
//    */
//   clearData(): void {
//     this.personasSubject.next([]);
//     this.clearError();
//   }

//   /**
//    * Obtener persona por ID del estado local
//    */
//   getPersonaFromState(id: number): PersonaFrontend | undefined {
//     return this.personasSubject.value.find(p => p.id_persona === id);
//   }

//   /**
//    * Calcular edad a partir de fecha de nacimiento
//    */
//   calcularEdad(fechaNacimiento: string): number {
//     const hoy = new Date();
//     const nacimiento = new Date(fechaNacimiento);
//     let edad = hoy.getFullYear() - nacimiento.getFullYear();
//     const mesActual = hoy.getMonth();
//     const mesNacimiento = nacimiento.getMonth();

//     if (mesNacimiento > mesActual || (mesNacimiento === mesActual && nacimiento.getDate() > hoy.getDate())) {
//       edad--;
//     }

//     return edad;
//   }

//   /**
//    * Formatear nombre completo
//    */
//   formatearNombreCompleto(persona: PersonaFrontend): string {
//     const apellidoMaterno = persona.apellido_materno ? ` ${persona.apellido_materno}` : '';
//     return `${persona.nombre} ${persona.apellido_paterno}${apellidoMaterno}`;
//   }

//   /**
//    * Validar formato de email
//    */
//   validarEmail(email: string): boolean {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   }

//   /**
//    * Validar formato de teléfono (México)
//    */
//   validarTelefono(telefono: string): boolean {
//     const telefonoRegex = /^(\+52|52)?\s*\d{10}$/;
//     return telefonoRegex.test(telefono.replace(/\s/g, ''));
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
//     console.error('🔥 Error completo:', error.error); // Para debugging
//     this.errorSubject.next(message);
//     this.setLoading(false);
//   }

//   // ==========================================
//   // GETTERS PARA ACCESO RÁPIDO
//   // ==========================================

//   get currentPersonas(): PersonaFrontend[] {
//     return this.personasSubject.value;
//   }

//   get isLoading(): boolean {
//     return this.loadingSubject.value;
//   }

//   get currentError(): string | null {
//     return this.errorSubject.value;
//   }
// }



// src/app/services/personas/personas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Persona,
  PersonaFrontend,
  CreatePersonaFrontendDto,
  UpdatePersonaDto,
  PersonaFilters,
  EstadisticasPersonas,
  PersonaMapper,
  ApiResponse,
} from '../../models';

@Injectable({
  providedIn: 'root'
})
export class PersonasService {
  private readonly API_URL = 'http://localhost:3000/api/personas';

  // Estado del servicio (mantenemos formato frontend para la UI)
  private personasSubject = new BehaviorSubject<PersonaFrontend[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public personas$ = this.personasSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ==========================================
  // MÉTODOS CRUD PRINCIPALES
  // ==========================================

  /**
   * Obtener todas las personas con filtros y paginación
   */
  getPersonas(filters?: PersonaFilters): Observable<ApiResponse<PersonaFrontend[]>> {
    this.setLoading(true);
    this.clearError();

    let params = new HttpParams();

    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.search) params = params.set('buscar', filters.search);
      // 🔥 REMOVIDO: filtro activo ya que no existe en la BD
      if (filters.sexo) params = params.set('sexo', filters.sexo);
      if (filters.estado_civil) params = params.set('estado_civil', filters.estado_civil);
      if (filters.edad_minima) params = params.set('edad_min', filters.edad_minima.toString());
      if (filters.edad_maxima) params = params.set('edad_max', filters.edad_maxima.toString());
      if (filters.ciudad) params = params.set('ciudad', filters.ciudad);
      if (filters.estado) params = params.set('estado', filters.estado);
      if (filters.tipo_sangre) params = params.set('tipo_sangre', filters.tipo_sangre);
      if (filters.sort_by) params = params.set('sort_by', filters.sort_by);
      if (filters.sort_order) params = params.set('sort_order', filters.sort_order);
    }

    return this.http.get<ApiResponse<Persona[]>>(this.API_URL, { params })
      .pipe(
        map(response => {
          // 🔥 CRÍTICO: Siempre terminar el loading
          this.setLoading(false);

          if (response.success && response.data) {
            // 🔥 CONVERTIR: Backend -> Frontend
            const personasFrontend = response.data.map(persona =>
              PersonaMapper.backendToFrontend(persona)
            );
            this.personasSubject.next(personasFrontend);

            console.log('✅ Personas cargadas exitosamente:', personasFrontend.length);

            // Devolver respuesta convertida
            return {
              success: response.success,
              message: response.message,
              data: personasFrontend,
              pagination: response.pagination,
              timestamp: response.timestamp
            } as ApiResponse<PersonaFrontend[]>;
          }

          // Caso cuando no hay datos pero la respuesta es exitosa
          console.log('⚠️ Respuesta exitosa pero sin datos');
          this.personasSubject.next([]);
          return {
            success: false,
            message: 'No se encontraron datos',
            data: []
          } as ApiResponse<PersonaFrontend[]>;
        }),
        catchError(error => {
          console.error('❌ Error en getPersonas:', error);
          this.handleError('Error al obtener personas', error);

          // Devolver una respuesta de error observable
          return new Observable<ApiResponse<PersonaFrontend[]>>(observer => {
            observer.next({
              success: false,
              message: 'Error al obtener personas',
              data: []
            });
            observer.complete();
          });
        })
      );
  }

  /**
   * Obtener persona por ID
   */
  getPersonaById(id: number): Observable<ApiResponse<PersonaFrontend>> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<ApiResponse<Persona>>(`${this.API_URL}/${id}`)
      .pipe(
        map(response => {
          this.setLoading(false);
          if (response.success && response.data) {
            const personaFrontend = PersonaMapper.backendToFrontend(response.data);
            return {
              success: response.success,
              message: response.message,
              data: personaFrontend,
              timestamp: response.timestamp
            } as ApiResponse<PersonaFrontend>;
          }
          return {
            success: false,
            message: 'Persona no encontrada',
            data: undefined
          } as ApiResponse<PersonaFrontend>;
        }),
        catchError(error => {
          this.handleError('Error al obtener persona', error);
          throw error;
        })
      );
  }

  /**
   * Crear nueva persona
   */
  createPersona(personaDataFrontend: CreatePersonaFrontendDto): Observable<ApiResponse<PersonaFrontend>> {
    this.setLoading(true);
    this.clearError();

    // 🔥 CONVERTIR: Frontend -> Backend
    const personaDataBackend = PersonaMapper.frontendToBackend(personaDataFrontend);

    console.log('🔄 Datos enviados al backend:', personaDataBackend);

    return this.http.post<ApiResponse<Persona>>(this.API_URL, personaDataBackend)
      .pipe(
        map(response => {
          this.setLoading(false);

          if (response.success && response.data) {
            // 🔥 CONVERTIR: Backend -> Frontend para el estado local
            const personaFrontend = PersonaMapper.backendToFrontend(response.data);

            // Actualizar la lista local
            const currentPersonas = this.personasSubject.value;
            this.personasSubject.next([personaFrontend, ...currentPersonas]);

            return {
              success: response.success,
              message: response.message,
              data: personaFrontend,
              timestamp: response.timestamp
            } as ApiResponse<PersonaFrontend>;
          }

          return {
            success: false,
            message: 'Error al crear persona',
            data: undefined
          } as ApiResponse<PersonaFrontend>;
        }),
        catchError(error => {
          this.handleError('Error al crear persona', error);
          throw error;
        })
      );
  }

  /**
   * Actualizar persona existente
   */
  updatePersona(id: number, personaDataFrontend: Partial<CreatePersonaFrontendDto>): Observable<ApiResponse<PersonaFrontend>> {
    this.setLoading(true);
    this.clearError();

    // 🔥 CONVERTIR: Frontend -> Backend
    const personaDataBackend = PersonaMapper.frontendToBackend(personaDataFrontend as CreatePersonaFrontendDto);

    return this.http.put<ApiResponse<Persona>>(`${this.API_URL}/${id}`, personaDataBackend)
      .pipe(
        map(response => {
          this.setLoading(false);

          if (response.success && response.data) {
            // 🔥 CONVERTIR: Backend -> Frontend
            const personaFrontend = PersonaMapper.backendToFrontend(response.data);

            // Actualizar la lista local
            const currentPersonas = this.personasSubject.value;
            const updatedPersonas = currentPersonas.map(p =>
              p.id_persona === id ? personaFrontend : p
            );
            this.personasSubject.next(updatedPersonas);

            return {
              success: response.success,
              message: response.message,
              data: personaFrontend,
              timestamp: response.timestamp
            } as ApiResponse<PersonaFrontend>;
          }

          return {
            success: false,
            message: 'Error al actualizar persona',
            data: undefined
          } as ApiResponse<PersonaFrontend>;
        }),
        catchError(error => {
          this.handleError('Error al actualizar persona', error);
          throw error;
        })
      );
  }

  /**
   * Eliminar persona (soft delete)
   */
  deletePersona(id: number): Observable<ApiResponse<any>> {
    this.setLoading(true);
    this.clearError();

    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`)
      .pipe(
        map(response => {
          this.setLoading(false);

          if (response.success) {
            // Remover de la lista local
            const currentPersonas = this.personasSubject.value;
            const filteredPersonas = currentPersonas.filter(p => p.id_persona !== id);
            this.personasSubject.next(filteredPersonas);
          }
          return response;
        }),
        catchError(error => {
          this.handleError('Error al eliminar persona', error);
          throw error;
        })
      );
  }

  // 🔥 REMOVIDO: togglePersona ya que no hay campo activo

  // ==========================================
  // MÉTODOS ESPECIALIZADOS
  // ==========================================

  /**
   * Buscar personas por nombre (para autocomplete)
   */
  buscarPersonas(query: string, sinRol: boolean = false): Observable<ApiResponse<PersonaFrontend[]>> {
    let params = new HttpParams()
      .set('q', query);

    if (sinRol) {
      params = params.set('sin_rol', 'true');
    }

    return this.http.get<ApiResponse<Persona[]>>(`${this.API_URL}/buscar`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            const personasFrontend = response.data.map(persona =>
              PersonaMapper.backendToFrontend(persona)
            );
            return {
              success: response.success,
              message: response.message,
              data: personasFrontend,
              timestamp: response.timestamp
            } as ApiResponse<PersonaFrontend[]>;
          }
          return {
            success: false,
            message: 'No se encontraron personas',
            data: []
          } as ApiResponse<PersonaFrontend[]>;
        }),
        catchError(error => {
          this.handleError('Error al buscar personas', error);
          throw error;
        })
      );
  }

  /**
   * Obtener personas para selects (sin filtro activo)
   */
  getPersonasParaSelect(): Observable<PersonaFrontend[]> {
    const filters: PersonaFilters = {
      limit: 100,
      sort_by: 'nombre',
      sort_order: 'ASC'
    };

    return this.getPersonas(filters).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Obtener estadísticas de personas
   */
  getEstadisticas(): Observable<ApiResponse<EstadisticasPersonas>> {
    return this.http.get<ApiResponse<EstadisticasPersonas>>(`${this.API_URL}/estadisticas`)
      .pipe(
        catchError(error => {
          this.handleError('Error al obtener estadísticas', error);
          throw error;
        })
      );
  }

  /**
   * Validar CURP
   */
  validarCURP(curp: string): Observable<ApiResponse<{valido: boolean, mensaje?: string}>> {
    return this.http.post<ApiResponse<{valido: boolean, mensaje?: string}>>(`${this.API_URL}/validar-curp`, { curp })
      .pipe(
        catchError(error => {
          this.handleError('Error al validar CURP', error);
          throw error;
        })
      );
  }

  /**
   * Validar RFC
   */
  validarRFC(rfc: string): Observable<ApiResponse<{valido: boolean, mensaje?: string}>> {
    return this.http.post<ApiResponse<{valido: boolean, mensaje?: string}>>(`${this.API_URL}/validar-rfc`, { rfc })
      .pipe(
        catchError(error => {
          this.handleError('Error al validar RFC', error);
          throw error;
        })
      );
  }

  // ==========================================
  // MÉTODOS UTILITARIOS
  // ==========================================

  /**
   * Limpiar datos del servicio
   */
  clearData(): void {
    this.personasSubject.next([]);
    this.clearError();
  }

  /**
   * Obtener persona por ID del estado local
   */
  getPersonaFromState(id: number): PersonaFrontend | undefined {
    return this.personasSubject.value.find(p => p.id_persona === id);
  }

  /**
   * Calcular edad a partir de fecha de nacimiento
   */
  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();

    if (mesNacimiento > mesActual || (mesNacimiento === mesActual && nacimiento.getDate() > hoy.getDate())) {
      edad--;
    }

    return edad;
  }

  /**
   * Formatear nombre completo
   */
  formatearNombreCompleto(persona: PersonaFrontend): string {
    const apellidoMaterno = persona.apellido_materno ? ` ${persona.apellido_materno}` : '';
    return `${persona.nombre} ${persona.apellido_paterno}${apellidoMaterno}`;
  }

  /**
   * Validar formato de email
   */
  validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar formato de teléfono (México)
   */
  validarTelefono(telefono: string): boolean {
    const telefonoRegex = /^(\+52|52)?\s*\d{10}$/;
    return telefonoRegex.test(telefono.replace(/\s/g, ''));
  }

  // ==========================================
  // MÉTODOS PRIVADOS
  // ==========================================

  private setLoading(loading: boolean): void {
    console.log(`🔄 Loading state: ${loading}`);
    this.loadingSubject.next(loading);
  }

  private clearError(): void {
    this.errorSubject.next(null);
  }

  private handleError(message: string, error: any): void {
    console.error('❌', message, error);
    console.error('🔥 Error completo:', error.error);
    this.errorSubject.next(message);
    this.setLoading(false);
  }

  // ==========================================
  // GETTERS PARA ACCESO RÁPIDO
  // ==========================================

  get currentPersonas(): PersonaFrontend[] {
    return this.personasSubject.value;
  }

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  get currentError(): string | null {
    return this.errorSubject.value;
  }
}
