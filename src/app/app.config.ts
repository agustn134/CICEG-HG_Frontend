// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from '../app/interceptors/auth-interceptor';
import { ErrorInterceptor } from '../app/interceptors/error.interceptor';

//   Importa desde @ng-icons/core
import { provideIcons } from '@ng-icons/core';
import {
  heroCog6Tooth,
  heroPhoto,
  heroDocumentText,
  heroEye,
  heroArrowPath,
  heroCheckCircle,
  heroXCircle,
  heroCloudArrowUp,
  heroArrowUpTray,
  heroShieldCheck,
  heroBuildingLibrary,
  heroBuildingOffice2,
  heroPaintBrush,
} from '@ng-icons/heroicons/outline';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    //   Interceptor de autenticación
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    //   Interceptor de manejo de errores (DEBE IR DESPUÉS del AuthInterceptor)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    //   Registro de iconos
    provideIcons({
      heroCog6Tooth,
      heroPhoto,
      heroDocumentText,
      heroEye,
      heroArrowPath,
      heroCheckCircle,
      heroXCircle,
      heroCloudArrowUp,
      heroArrowUpTray,
      heroShieldCheck,
      heroBuildingLibrary,
      heroBuildingOffice2,
      heroPaintBrush,
    }),
  ],
};
