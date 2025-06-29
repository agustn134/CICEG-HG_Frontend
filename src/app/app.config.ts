import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter} from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth-guard';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    AuthService,
    AuthGuard,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
     provideHttpClient(withInterceptorsFromDi())
  ]
};
