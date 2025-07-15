// src/app/services/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginRequest {
  usuario: string;
  password: string;
  tipoUsuario: 'medico' | 'administrador';
}

export interface UserData {
  id: number;
  usuario: string;
  nombre_completo: string;
  tipo_usuario: 'medico' | 'administrador';
  especialidad?: string;
  cargo?: string;
  departamento?: string;
  nivel_acceso?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    usuario: UserData;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<UserData | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Cargar usuario desde localStorage al inicializar
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      this.currentUserSubject.next(JSON.parse(storedUser));
      this.tokenSubject.next(storedToken);
    }
  }

  // ==========================================
  // LOGIN
  // ==========================================
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map(response => {
          if (response.success) {
            // Guardar en localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('currentUser', JSON.stringify(response.data.usuario));

            // Actualizar subjects
            this.tokenSubject.next(response.data.token);
            this.currentUserSubject.next(response.data.usuario);
          }
          return response;
        })
      );
  }

  // ==========================================
  // LOGOUT
  // ==========================================
  logout(): void {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');

    // Limpiar subjects
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);

    // Redirigir al login
    this.router.navigate(['/login']);
  }

  // ==========================================
  // VERIFICAR TOKEN
  // ==========================================
  verifyToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify`, {});
  }

  // ==========================================
  // GETTERS
  // ==========================================
  get currentUserValue(): UserData | null {
    return this.currentUserSubject.value;
  }

  get tokenValue(): string | null {
    return this.tokenSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.tokenValue && !!this.currentUserValue;
  }

  get isMedico(): boolean {
    return this.currentUserValue?.tipo_usuario === 'medico';
  }

  get isAdmin(): boolean {
    return this.currentUserValue?.tipo_usuario === 'administrador';
  }

  // ==========================================
  // OBTENER HEADERS CON TOKEN
  // ==========================================
  getAuthHeaders(): { [key: string]: string } {
    const token = this.tokenValue;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}
