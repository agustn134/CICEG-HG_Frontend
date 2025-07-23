// src/app/interceptors/http.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { API_CONFIG } from '../models/base.models';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Configurar headers por defecto
    const modifiedReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        // Agregar más headers según necesidad:
        // 'Authorization': `Bearer ${this.getToken()}`,
        // 'X-Hospital-ID': 'HOSPITAL_SLP',
      }
    });

    return next.handle(modifiedReq).pipe(
      timeout(API_CONFIG.TIMEOUT),
      catchError((error: HttpErrorResponse) => {
        // Log de errores para desarrollo
        if (API_CONFIG.BASE_URL.includes('localhost')) {
          console.error('HttpConfigInterceptor - Error intercepted:', {
            status: error.status,
            message: error.message,
            url: error.url,
            note: 'Error logged without causing redirections'
          });
        }

        // NO manejar redirecciones aquí - dejar que el ErrorInterceptor se encargue
        return throwError(() => error);
      })
    );
  }

  // Método para obtener token (implementar según tu sistema de auth)
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

// ==========================================
// INTERCEPTOR PARA AUTENTICACIÓN
// ==========================================

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Obtener token de autenticación
    const token = this.getAuthToken();

    // Si existe token y la URL es de nuestra API, agregarlo
    if (token && req.url.startsWith(API_CONFIG.BASE_URL)) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next.handle(authReq);
    }

    return next.handle(req);
  }

  private getAuthToken(): string | null {
    // Implementar según tu sistema de autenticación
    return localStorage.getItem('ciceg_auth_token');
  }
}

// ==========================================
// INTERCEPTOR PARA LOADING GLOBAL
// ==========================================

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Solo mostrar loading para requests que no sean de polling/background
    const showLoading = !req.headers.has('X-Skip-Loading');

    if (showLoading) {
      // Aquí puedes emitir un evento global de loading
      // this.loadingService.show();
    }

    return next.handle(req).pipe(
      catchError((error) => {
        if (showLoading) {
          // this.loadingService.hide();
        }
        return throwError(() => error);
      }),
      // En success también ocultar loading
      // tap(() => {
      //   if (showLoading) {
      //     this.loadingService.hide();
      //   }
      // })
    );
  }
}

// ==========================================
// INTERCEPTOR PARA CACHÉ (OPCIONAL)
// ==========================================

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, { response: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Solo cachear peticiones GET específicas
    if (req.method !== 'GET' || !this.shouldCache(req.url)) {
      return next.handle(req);
    }

    const cacheKey = this.getCacheKey(req);
    const cached = this.cache.get(cacheKey);

    // Si existe en caché y no ha expirado
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return new Observable(observer => {
        observer.next(cached.response);
        observer.complete();
      });
    }

    // Si no existe en caché o ha expirado, hacer la petición
    return next.handle(req).pipe(
      catchError((error) => {
        // En caso de error, limpiar caché de esta URL
        this.cache.delete(cacheKey);
        return throwError(() => error);
      })
      // tap((response) => {
      //   // Guardar en caché la respuesta exitosa
      //   if (response instanceof HttpResponse) {
      //     this.cache.set(cacheKey, {
      //       response: response,
      //       timestamp: Date.now()
      //     });
      //   }
      // })
    );
  }

  private shouldCache(url: string): boolean {
    // Solo cachear endpoints de catálogos que no cambian frecuentemente
    const cacheableEndpoints = [
      '/catalogos/servicios',
      '/catalogos/tipos-sangre',
      '/catalogos/tipos-documento',
      '/catalogos/areas-interconsulta',
      '/catalogos/medicamentos'
    ];

    return cacheableEndpoints.some(endpoint => url.includes(endpoint));
  }

  private getCacheKey(req: HttpRequest<any>): string {
    return `${req.method}:${req.urlWithParams}`;
  }

  // Método para limpiar caché manualmente
  clearCache(): void {
    this.cache.clear();
  }

  // Método para limpiar caché específico
  clearCacheForUrl(url: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(url));
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// ==========================================
// CONFIGURACIÓN PARA APP.CONFIG.TS
// ==========================================

/*
Para usar estos interceptors, agregar en app.config.ts:

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... otros providers
    provideHttpClient(),

    // Registrar interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true
    }
  ]
};
*/
