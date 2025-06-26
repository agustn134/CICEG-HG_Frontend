import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter} from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth-guard';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    AuthService,
    AuthGuard,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // provideHttpClient(withInterceptorsFromDi())
  ]
};



// // src/app/app.config.ts
// import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// import { routes } from './app.routes';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideRouter(routes),
//     provideHttpClient(withInterceptorsFromDi())
//   ]
// };
