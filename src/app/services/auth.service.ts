import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = false;

  isAuthenticated(): boolean {
    return this.loggedIn;
  }

  login() {
    this.loggedIn = true;
  }

  logout() {
    this.loggedIn = false;
  }
}









// // src/app/services/auth.service.ts
// import { Injectable, signal, computed, inject } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { Observable, BehaviorSubject, of } from 'rxjs';
// import { map, tap, catchError } from 'rxjs/operators';
// import {
//   ApiResponse,
//   API_CONFIG,
//   NivelAcceso
// } from '../models/base.models';

// // ==========================================
// // INTERFACES PARA AUTENTICACIÓN
// // ==========================================

// export interface LoginCredentials {
//   usuario: string;
//   password: string;
// }

// export interface AuthUser {
//   id_administrador: number;
//   id_persona: number;
//   usuario: string;
//   nivel_acceso: NivelAcceso;
//   activo: boolean;

//   // Datos de la persona
//   nombre: string;
//   apellido_paterno: string;
//   apellido_materno?: string;
//   email?: string;
//   telefono?: string;

//   // Metadatos de sesión
//   ultimo_acceso?: string;
//   token_expires_at?: string;
// }

// export interface LoginResponse {
//   user: AuthUser;
//   token: string;
//   expires_in: number;
//   refresh_token?: string;
// }

// export interface ChangePasswordRequest {
//   password_actual: string;
//   password_nuevo: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private http = inject(HttpClient);
//   private router = inject(Router);

//   // ==========================================
//   // ESTADO DE AUTENTICACIÓN CON SIGNALS
//   // ==========================================

//   private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
//   private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
//   private loadingSubject = new BehaviorSubject<boolean>(false);

//   // Signals públicos
//   currentUser = signal<AuthUser | null>(null);
//   isAuthenticated = signal<boolean>(false);
//   loading = signal<boolean>(false);

//   // Computed signals
//   userDisplayName = computed(() => {
//     const user = this.currentUser();
//     if (!user) return '';
//     return `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno || ''}`.trim();
//   });

//   userRole = computed(() => this.currentUser()?.nivel_acceso || null);
//   canAdminister = computed(() => this.userRole() === NivelAcceso.ADMINISTRADOR);
//   canSupervise = computed(() => {
//     const role = this.userRole();
//     return role === NivelAcceso.ADMINISTRADOR || role === NivelAcceso.SUPERVISOR;
//   });

//   // Observables para compatibilidad
//   public currentUser$ = this.currentUserSubject.asObservable();
//   public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
//   public loading$ = this.loadingSubject.asObservable();

//   // ==========================================
//   // CONFIGURACIÓN
//   // ==========================================

//   private readonly TOKEN_KEY = 'ciceg_auth_token';
//   private readonly REFRESH_TOKEN_KEY = 'ciceg_refresh_token';
//   private readonly USER_KEY = 'ciceg_user_data';
//   private readonly baseUrl = API_CONFIG.BASE_URL;

//   // ==========================================
//   // LIFECYCLE
//   // ==========================================

//   constructor() {
//     // Verificar si hay una sesión activa al inicializar
//     this.checkStoredAuth();

//     // Suscribirse a cambios en los subjects para actualizar signals
//     this.currentUserSubject.subscribe(user => this.currentUser.set(user));
//     this.isAuthenticatedSubject.subscribe(auth => this.isAuthenticated.set(auth));
//     this.loadingSubject.subscribe(loading => this.loading.set(loading));
//   }

//   // ==========================================
//   // MÉTODOS DE AUTENTICACIÓN
//   // ==========================================

//   /**
//    * Iniciar sesión
//    */
//   login(credentials: LoginCredentials): Observable<boolean> {
//     this.setLoading(true);

//     return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/personas/administradores/login`, credentials)
//       .pipe(
//         map(response => {
//           if (response.success && response.data) {
//             this.setAuthData(response.data);
//             return true;
//           }
//           return false;
//         }),
//         catchError(error => {
//           this.handleAuthError(error);
//           return of(false);
//         }),
//         tap(() => this.setLoading(false))
//       );
//   }

//   /**
//    * Cerrar sesión
//    */
//   logout(): void {
//     this.clearAuthData();
//     this.router.navigate(['/login']);
//   }

//   /**
//    * Verificar si el token es válido
//    */
//   verifyToken(): Observable<boolean> {
//     const token = this.getToken();
//     if (!token) {
//       return of(false);
//     }

//     return this.http.get<ApiResponse<AuthUser>>(`${this.baseUrl}/auth/verify`)
//       .pipe(
//         map(response => {
//           if (response.success && response.data) {
//             this.updateUser(response.data);
//             return true;
//           }
//           return false;
//         }),
//         catchError(() => {
//           this.clearAuthData();
//           return of(false);
//         })
//       );
//   }

//   /**
//    * Refrescar token
//    */
//   refreshToken(): Observable<boolean> {
//     const refreshToken = this.getRefreshToken();
//     if (!refreshToken) {
//       return of(false);
//     }

//     return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/refresh`, {
//       refresh_token: refreshToken
//     }).pipe(
//       map(response => {
//         if (response.success && response.data) {
//           this.setAuthData(response.data);
//           return true;
//         }
//         return false;
//       }),
//       catchError(() => {
//         this.clearAuthData();
//         return of(false);
//       })
//     );
//   }

//   /**
//    * Cambiar contraseña
//    */
//   changePassword(passwordData: ChangePasswordRequest): Observable<boolean> {
//     const userId = this.currentUser()?.id_administrador;
//     if (!userId) {
//       return of(false);
//     }

//     this.setLoading(true);

//     return this.http.put<ApiResponse<any>>(`${this.baseUrl}/personas/administradores/${userId}/password`, passwordData)
//       .pipe(
//         map(response => response.success),
//         catchError(error => {
//           console.error('Error al cambiar contraseña:', error);
//           return of(false);
//         }),
//         tap(() => this.setLoading(false))
//       );
//   }

//   // ==========================================
//   // MÉTODOS DE AUTORIZACIÓN
//   // ==========================================

//   /**
//    * Verificar si el usuario tiene un rol específico
//    */
//   hasRole(role: NivelAcceso): boolean {
//     return this.currentUser()?.nivel_acceso === role;
//   }

//   /**
//    * Verificar si el usuario tiene al menos un nivel de acceso
//    */
//   hasMinimumRole(minimumRole: NivelAcceso): boolean {
//     const userRole = this.currentUser()?.nivel_acceso;
//     if (!userRole) return false;

//     const roleHierarchy = {
//       [NivelAcceso.USUARIO]: 1,
//       [NivelAcceso.SUPERVISOR]: 2,
//       [NivelAcceso.ADMINISTRADOR]: 3
//     };

//     return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
//   }

//   /**
//    * Verificar si puede acceder a un módulo específico
//    */
//   canAccessModule(module: string): boolean {
//     const user = this.currentUser();
//     if (!user || !user.activo) return false;

//     // Lógica de permisos por módulo
//     switch (module) {
//       case 'sistema':
//       case 'administradores':
//         return this.hasRole(NivelAcceso.ADMINISTRADOR);

//       case 'estadisticas':
//       case 'reportes':
//         return this.hasMinimumRole(NivelAcceso.SUPERVISOR);

//       case 'pacientes':
//       case 'expedientes':
//       case 'documentos-clinicos':
//         return this.hasMinimumRole(NivelAcceso.USUARIO);

//       default:
//         return true;
//     }
//   }

//   // ==========================================
//   // GESTIÓN DE DATOS DE AUTENTICACIÓN
//   // ==========================================

//   private setAuthData(loginResponse: LoginResponse): void {
//     try {
//       // Guardar token
//       localStorage.setItem(this.TOKEN_KEY, loginResponse.token);

//       // Guardar refresh token si existe
//       if (loginResponse.refresh_token) {
//         localStorage.setItem(this.REFRESH_TOKEN_KEY, loginResponse.refresh_token);
//       }

//       // Guardar datos del usuario
//       localStorage.setItem(this.USER_KEY, JSON.stringify(loginResponse.user));

//       // Actualizar estado
//       this.updateUser(loginResponse.user);

//     } catch (error) {
//       console.error('Error al guardar datos de autenticación:', error);
//       this.clearAuthData();
//     }
//   }

//   private clearAuthData(): void {
//     localStorage.removeItem(this.TOKEN_KEY);
//     localStorage.removeItem(this.REFRESH_TOKEN_KEY);
//     localStorage.removeItem(this.USER_KEY);

//     this.currentUserSubject.next(null);
//     this.isAuthenticatedSubject.next(false);
//   }

//   private updateUser(user: AuthUser): void {
//     this.currentUserSubject.next(user);
//     this.isAuthenticatedSubject.next(true);

//     // Actualizar localStorage también
//     localStorage.setItem(this.USER_KEY, JSON.stringify(user));
//   }

//   private checkStoredAuth(): void {
//     try {
//       const token = localStorage.getItem(this.TOKEN_KEY);
//       const userData = localStorage.getItem(this.USER_KEY);

//       if (token && userData) {
//         const user = JSON.parse(userData) as AuthUser;

//         // Verificar si el token no ha expirado
//         if (this.isTokenValid(token)) {
//           this.updateUser(user);
//         } else {
//           // Intentar refrescar el token
//           this.refreshToken().subscribe(success => {
//             if (!success) {
//               this.clearAuthData();
//             }
//           });
//         }
//       }
//     } catch (error) {
//       console.error('Error al verificar autenticación almacenada:', error);
//       this.clearAuthData();
//     }
//   }

//   private isTokenValid(token: string): boolean {
//     try {
//       // Decodificar JWT para verificar expiración
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       const currentTime = Date.now() / 1000;

//       return payload.exp > currentTime;
//     } catch {
//       return false;
//     }
//   }

//   private setLoading(loading: boolean): void {
//     this.loadingSubject.next(loading);
//   }

//   private handleAuthError(error: any): void {
//     let message = 'Error de autenticación';

//     if (error?.error?.message) {
//       message = error.error.message;
//     } else if (error?.message) {
//       message = error.message;
//     }

//     console.error('Error de autenticación:', message);
//     // Aquí puedes emitir un evento para mostrar el error en la UI
//   }

//   // ==========================================
//   // MÉTODOS PÚBLICOS DE UTILIDAD
//   // ==========================================

//   /**
//    * Obtener token actual
//    */
//   getToken(): string | null {
//     return localStorage.getItem(this.TOKEN_KEY);
//   }

//   /**
//    * Obtener refresh token
//    */
//   getRefreshToken(): string | null {
//     return localStorage.getItem(this.REFRESH_TOKEN_KEY);
//   }

//   /**
//    * Obtener ID del usuario actual
//    */
//   getCurrentUserId(): number | null {
//     return this.currentUser()?.id_administrador || null;
//   }

//   /**
//    * Obtener nombre completo del usuario
//    */
//   getCurrentUserName(): string {
//     return this.userDisplayName();
//   }

//   /**
//    * Verificar si la sesión está activa
//    */
//   isSessionActive(): boolean {
//     const token = this.getToken();
//     return !!(token && this.isTokenValid(token) && this.currentUser());
//   }

//   /**
//    * Obtener tiempo restante de sesión en minutos
//    */
//   getSessionTimeRemaining(): number {
//     const token = this.getToken();
//     if (!token) return 0;

//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       const currentTime = Date.now() / 1000;
//       const timeRemaining = payload.exp - currentTime;

//       return Math.max(0, Math.floor(timeRemaining / 60));
//     } catch {
//       return 0;
//     }
//   }

//   /**
//    * Extender sesión (si es necesario)
//    */
//   extendSession(): Observable<boolean> {
//     const timeRemaining = this.getSessionTimeRemaining();

//     // Si quedan menos de 15 minutos, intentar refrescar
//     if (timeRemaining < 15) {
//       return this.refreshToken();
//     }

//     return of(true);
//   }

//   // ==========================================
//   // GUARDS PARA RUTAS
//   // ==========================================

//   /**
//    * Verificar si puede acceder a una ruta específica
//    */
//   canActivateRoute(requiredRole?: NivelAcceso): boolean {
//     if (!this.isAuthenticated()) {
//       this.router.navigate(['/login']);
//       return false;
//     }

//     if (requiredRole && !this.hasMinimumRole(requiredRole)) {
//       this.router.navigate(['/unauthorized']);
//       return false;
//     }

//     return true;
//   }

//   /**
//    * Verificar si puede activar una ruta de administración
//    */
//   canActivateAdminRoute(): boolean {
//     return this.canActivateRoute(NivelAcceso.ADMINISTRADOR);
//   }

//   /**
//    * Verificar si puede activar una ruta de supervisión
//    */
//   canActivateSupervisorRoute(): boolean {
//     return this.canActivateRoute(NivelAcceso.SUPERVISOR);
//   }

//   // ==========================================
//   // CLEANUP
//   // ==========================================

//   ngOnDestroy(): void {
//     this.currentUserSubject.complete();
//     this.isAuthenticatedSubject.complete();
//     this.loadingSubject.complete();
//   }
// }









// // src/app/services/auth.service.ts
// // VERSIÓN TEMPORAL - Para desarrollo sin login real

// import { Injectable, signal, computed } from '@angular/core';
// import { Observable, of } from 'rxjs';
// import { NivelAcceso } from '../models/base.models';

// export interface AuthUser {
//   id_administrador: number;
//   id_persona: number;
//   usuario: string;
//   nivel_acceso: NivelAcceso;
//   activo: boolean;
//   nombre: string;
//   apellido_paterno: string;
//   apellido_materno?: string;
//   email?: string;
//   telefono?: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   // ==========================================
//   // ESTADO TEMPORAL PARA DESARROLLO
//   // ==========================================

//   private _isAuthenticated = signal<boolean>(false);
//   private _currentUser = signal<AuthUser | null>(null);
//   private _loading = signal<boolean>(false);

//   // Signals públicos
//   currentUser = this._currentUser.asReadonly();
//   isAuthenticated = this._isAuthenticated.asReadonly();
//   loading = this._loading.asReadonly();

//   // Computed signals
//   userDisplayName = computed(() => {
//     const user = this.currentUser();
//     if (!user) return '';
//     return `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno || ''}`.trim();
//   });

//   userRole = computed(() => this.currentUser()?.nivel_acceso || null);
//   canAdminister = computed(() => this.userRole() === NivelAcceso.ADMINISTRADOR);
//   canSupervise = computed(() => {
//     const role = this.userRole();
//     return role === NivelAcceso.ADMINISTRADOR || role === NivelAcceso.SUPERVISOR;
//   });

//   // Observables para compatibilidad con el código existente
//   public currentUser$ = of(this.currentUser());
//   public isAuthenticated$ = of(this.isAuthenticated());
//   public loading$ = of(this.loading());

//   // ==========================================
//   // MÉTODOS TEMPORALES PARA DESARROLLO
//   // ==========================================

//   /**
//    * Login simple para desarrollo (sin parámetros)
//    */
//   login(): void {
//     // Simular usuario logueado para desarrollo
//     const mockUser: AuthUser = {
//       id_administrador: 1,
//       id_persona: 1,
//       usuario: 'admin',
//       nivel_acceso: NivelAcceso.ADMINISTRADOR,
//       activo: true,
//       nombre: 'Administrador',
//       apellido_paterno: 'Sistema',
//       apellido_materno: 'CICEG',
//       email: 'admin@ciceg.com',
//       telefono: '477-123-4567'
//     };

//     this._currentUser.set(mockUser);
//     this._isAuthenticated.set(true);

//     console.log('🔓 Sesión iniciada (modo desarrollo)');
//   }

//   /**
//    * Login con credenciales (para compatibilidad futura)
//    */
//   loginWithCredentials(credentials: { usuario: string; password: string }): Observable<boolean> {
//     this.login(); // Usar el método simple por ahora
//     return of(true);
//   }

//   /**
//    * Cerrar sesión
//    */
//   logout(): void {
//     this._currentUser.set(null);
//     this._isAuthenticated.set(false);
//     console.log('🔒 Sesión cerrada');
//   }

//   // ==========================================
//   // MÉTODOS DE AUTORIZACIÓN BÁSICOS
//   // ==========================================

//   /**
//    * Verificar si el usuario tiene un rol específico
//    */
//   hasRole(role: NivelAcceso): boolean {
//     return this.currentUser()?.nivel_acceso === role;
//   }

//   /**
//    * Verificar si el usuario tiene al menos un nivel de acceso
//    */
//   hasMinimumRole(minimumRole: NivelAcceso): boolean {
//     const userRole = this.currentUser()?.nivel_acceso;
//     if (!userRole) return false;

//     const roleHierarchy = {
//       [NivelAcceso.USUARIO]: 1,
//       [NivelAcceso.SUPERVISOR]: 2,
//       [NivelAcceso.ADMINISTRADOR]: 3
//     };

//     return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
//   }

//   /**
//    * Verificar si puede acceder a un módulo específico
//    */
//   canAccessModule(module: string): boolean {
//     const user = this.currentUser();
//     if (!user || !user.activo) return false;

//     // Para desarrollo, permitir acceso a todo
//     return true;
//   }

//   // ==========================================
//   // MÉTODOS DE UTILIDAD BÁSICOS
//   // ==========================================

//   /**
//    * Obtener token (mock para desarrollo)
//    */
//   getToken(): string | null {
//     return this.isAuthenticated() ? 'mock-token-for-development' : null;
//   }

//   /**
//    * Obtener ID del usuario actual
//    */
//   getCurrentUserId(): number | null {
//     return this.currentUser()?.id_administrador || null;
//   }

//   /**
//    * Obtener nombre completo del usuario
//    */
//   getCurrentUserName(): string {
//     return this.userDisplayName();
//   }

//   /**
//    * Verificar si la sesión está activa
//    */
//   isSessionActive(): boolean {
//     return this.isAuthenticated();
//   }

//   /**
//    * Guards para rutas (simplificados para desarrollo)
//    */
//   canActivateRoute(requiredRole?: NivelAcceso): boolean {
//     // Para desarrollo, siempre permitir acceso si está "logueado"
//     return this.isAuthenticated();
//   }

//   canActivateAdminRoute(): boolean {
//     return this.canActivateRoute(NivelAcceso.ADMINISTRADOR);
//   }

//   canActivateSupervisorRoute(): boolean {
//     return this.canActivateRoute(NivelAcceso.SUPERVISOR);
//   }

//   // ==========================================
//   // MÉTODOS ADICIONALES PARA DESARROLLO
//   // ==========================================

//   /**
//    * Auto-login para desarrollo (llamar en app.component.ts si quieres)
//    */
//   autoLoginForDevelopment(): void {
//     if (!this.isAuthenticated()) {
//       this.login();
//       console.log('🚀 Auto-login activado para desarrollo');
//     }
//   }

//   /**
//    * Cambiar rol para testing
//    */
//   changeRoleForTesting(role: NivelAcceso): void {
//     const user = this.currentUser();
//     if (user) {
//       this._currentUser.set({ ...user, nivel_acceso: role });
//       console.log(`🔄 Rol cambiado a: ${role}`);
//     }
//   }

//   /**
//    * Estado de desarrollo
//    */
//   getDevelopmentStatus(): { isAuthenticated: boolean; user: AuthUser | null; role: string | null } {
//     return {
//       isAuthenticated: this.isAuthenticated(),
//       user: this.currentUser(),
//       role: this.userRole()
//     };
//   }
// }

// // ==========================================
// // COMENTARIOS PARA CUANDO IMPLEMENTES EL LOGIN REAL
// // ==========================================

// /*
// CUANDO QUIERAS IMPLEMENTAR EL LOGIN REAL:

// 1. Reemplazar este archivo con el AuthService completo que te creé
// 2. Actualizar el componente login.ts para usar el nuevo método:

// // En login.ts:
// handleSubmit() {
//   const credentials = {
//     usuario: this.credentials.usuario,
//     password: this.credentials.contrasena  // Cambiar de 'contrasena' a 'password'
//   };

//   this.authService.loginWithCredentials(credentials).subscribe({
//     next: (success) => {
//       if (success) {
//         this.router.navigate(['/app/dashboard']);
//       } else {
//         alert('Usuario o contraseña incorrectos');
//       }
//     },
//     error: (error) => {
//       console.error('Error de login:', error);
//       alert('Error al iniciar sesión');
//     }
//   });
// }

// 3. Configurar los interceptors HTTP
// 4. Configurar el backend para manejar la autenticación
// */
