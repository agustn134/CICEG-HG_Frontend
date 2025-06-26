import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { App } from './app/app';
import { routes } from './app/app.routes'; // Asegúrate de tener tus rutas definidas

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes) // Si tienes rutas configuradas
  ]
}).catch(err => console.error(err));
