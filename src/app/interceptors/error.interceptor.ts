// src/app/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { ErrorNotificationService } from '../services/error-notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private errorNotificationService: ErrorNotificationService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('ErrorInterceptor - Error intercepted:', {
          status: error.status,
          message: error.message,
          url: error.url
        });

        //   CORRECCIÓN: Solo manejar redirecciones para errores 401
        if (error.status === 401) {
          // Token expirado o no válido - ÚNICA redirección permitida
          console.warn('Error 401: Token no válido o expirado, redirigiendo al login');
          this.errorNotificationService.showHttpError(401, 'Su sesión ha expirado');
          this.authService.logout(true); // Explícitamente redirigir
          // No necesitamos router.navigate aquí porque logout ya lo hace
        } else if (error.status === 403) {
          //   Sin permisos - NO redirigir, mantener en página actual
          console.warn('Error 403: Sin permisos para acceder al recurso - SIN redirección');
          this.errorNotificationService.showHttpError(403, 'No tiene permisos para realizar esta acción');
        } else if (error.status >= 500) {
          //   Errores de servidor - NO redirigir, mantener en página actual
          console.error(`Error ${error.status}: Error del servidor - SIN redirección, manteniéndose en página actual`);
          this.errorNotificationService.showHttpError(error.status,
            error.error?.message || 'Ha ocurrido un error interno del servidor'
          );
        } else if (error.status === 0) {
          //   Error de conexión - NO redirigir
          console.error('Error de conexión: No se puede conectar al servidor - SIN redirección');
          this.errorNotificationService.showError(
            'No se puede conectar al servidor. Verifique su conexión a internet.',
            'Error de Conexión'
          );
        } else if (error.status >= 400) {
          //   Otros errores de cliente - NO redirigir
          console.warn(`Error ${error.status}: ${error.message} - SIN redirección`);
          this.errorNotificationService.showHttpError(error.status,
            error.error?.message || error.message || 'Ha ocurrido un error'
          );
        }

        //   Para TODOS los casos: propagar el error SIN modificar la navegación
        return throwError(() => error);
      })
    );
  }
}
