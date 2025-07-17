// // src/app/app.config.ts
// import { ApplicationConfig } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideHttpClient, withInterceptors } from '@angular/common/http';
// import { routes } from './app.routes';
// import { authInterceptor} from './interceptors/auth-interceptor';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideRouter(routes),
//     provideHttpClient(withInterceptors([authInterceptor])), // 🔥 Cambio aquí
//   ]
// };
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth-interceptor';

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
    provideHttpClient(withInterceptors([authInterceptor])),

    // ✅ Registro con el nombre correcto
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
