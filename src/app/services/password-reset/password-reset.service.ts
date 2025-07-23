// src/app/services/password-reset/password-reset.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

// ==========================================
// INTERFACES
// ==========================================
export interface PasswordResetRequest {
  email: string;
  tipoUsuario: 'medico' | 'administrador';
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ValidateTokenResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    tipoUsuario: string;
  };
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  // 🔥 URL del API
  private readonly API_URL = 'http://localhost:3000/api/auth/password-reset';

  // Estados del proceso
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private successSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public success$ = this.successSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ==========================================
  // MÉTODOS PRINCIPALES
  // ==========================================

  /**
   * Solicitar recuperación de contraseña
   */
  requestPasswordReset(data: PasswordResetRequest): Observable<PasswordResetResponse> {
    this.setLoading(true);
    this.clearMessages();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('🔄 Enviando request a:', `${this.API_URL}/request`);
    console.log('🔄 Datos:', data);

    return this.http.post<PasswordResetResponse>(`${this.API_URL}/request`, data, { headers })
      .pipe(
        tap(response => {
          if (response.success) {
            this.setSuccess(response.message);
          } else {
            this.setError(response.message);
          }
        }),
        catchError(error => {
          console.error('❌ Error en requestPasswordReset:', error);
          this.setError(error.error?.message || 'Error de conexión');
          return throwError(() => error);
        }),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Validar token de recuperación
   */
  validateToken(token: string): Observable<ValidateTokenResponse> {
    this.setLoading(true);
    this.clearMessages();

    console.log('🔄 Validando token:', `${this.API_URL}/validate/${token}`);

    return this.http.get<ValidateTokenResponse>(`${this.API_URL}/validate/${token}`)
      .pipe(
        tap(response => {
          if (!response.success) {
            this.setError(response.message);
          }
        }),
        catchError(error => {
          console.error('❌ Error en validateToken:', error);
          this.setError(error.error?.message || 'Error al validar token');
          return throwError(() => error);
        }),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Restablecer contraseña
   */
  resetPassword(data: ResetPasswordRequest): Observable<PasswordResetResponse> {
    this.setLoading(true);
    this.clearMessages();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('🔄 Reseteando password:', `${this.API_URL}/reset`);
    console.log('🔄 Datos:', { token: data.token, passwordLength: data.newPassword.length });

    return this.http.post<PasswordResetResponse>(`${this.API_URL}/reset`, data, { headers })
      .pipe(
        tap(response => {
          if (response.success) {
            this.setSuccess(response.message);
          } else {
            this.setError(response.message);
          }
        }),
        catchError(error => {
          console.error('❌ Error en resetPassword:', error);
          this.setError(error.error?.message || 'Error al cambiar contraseña');
          return throwError(() => error);
        }),
        finalize(() => this.setLoading(false))
      );
  }

  // ==========================================
  // MÉTODOS DE ESTADO
  // ==========================================

  public setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  public setError(error: string | null): void {
    this.errorSubject.next(error);
    if (error) {
      console.error('🔥 Error en PasswordResetService:', error);
    }
  }

  public setSuccess(message: string | null): void {
    this.successSubject.next(message);
    if (message) {
      console.log('  Éxito en PasswordResetService:', message);
    }
  }

  public clearError(): void {
    this.errorSubject.next(null);
  }

  public clearSuccess(): void {
    this.successSubject.next(null);
  }

  public clearMessages(): void {
    this.clearError();
    this.clearSuccess();
  }

  // ==========================================
  // MÉTODO DE UTILIDAD
  // ==========================================

  public getCurrentState() {
    return {
      loading: this.loadingSubject.value,
      error: this.errorSubject.value,
      success: this.successSubject.value
    };
  }
}
