// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from '../app/interceptors/auth-interceptor';

// ✅ Importa desde @ng-icons/core
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
    // ✅ Proveedor del interceptor corregido
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    // ✅ Registro de iconos
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
