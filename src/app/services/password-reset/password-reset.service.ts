// src/app/services/password-reset/password-reset.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

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
  // 🔥 CAMBIO: URL directa sin environments
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

    return this.http.post<PasswordResetResponse>(`${this.API_URL}/request`, data, { headers });
  }

  /**
   * Validar token de recuperación
   */
  validateToken(token: string): Observable<ValidateTokenResponse> {
    this.setLoading(true);
    this.clearMessages();

    console.log('🔄 Validando token:', `${this.API_URL}/validate/${token}`);

    return this.http.get<ValidateTokenResponse>(`${this.API_URL}/validate/${token}`);
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

    return this.http.post<PasswordResetResponse>(`${this.API_URL}/reset`, data, { headers });
  }

  // ==========================================
  // MÉTODOS DE ESTADO
  // ==========================================

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private clearMessages(): void {
    this.errorSubject.next(null);
    this.successSubject.next(null);
  }

  public setError(message: string): void {
    this.errorSubject.next(message);
    this.setLoading(false);
  }

  public setSuccess(message: string): void {
    this.successSubject.next(message);
    this.setLoading(false);
  }

  public clearError(): void {
    this.errorSubject.next(null);
  }

  public clearSuccess(): void {
    this.successSubject.next(null);
  }

  // ==========================================
  // GETTERS
  // ==========================================

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  get currentError(): string | null {
    return this.errorSubject.value;
  }

  get currentSuccess(): string | null {
    return this.successSubject.value;
  }
}
