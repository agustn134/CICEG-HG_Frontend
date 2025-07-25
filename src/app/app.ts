// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { NavbarComponent } from "./shared/navbar/navbar";

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet, NavbarComponent],
//   templateUrl: './app.html',
//   styleUrl: './app.css'
// })
// export class App {
//   protected title = 'CICEG-HG-APP';
// }






// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [RouterOutlet],
//   template: `
//     <!-- El layout se maneja por las rutas ahora -->
//     <router-outlet></router-outlet>
//   `,
//   styles: [`
//     :host {
//       display: block;
//       min-height: 100vh;
//       background-color: #f9fafb;
//     }
//   `]
// })
// export class App {
//   protected title = 'CICEG-HG-APP';
// }

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- El layout se maneja completamente por las rutas ahora -->
    <router-outlet></router-outlet>
  `,
  styles: [`
    /* Estilos base para el componente raíz del hospital */
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f9fafb; /* hospital-gray-50 */
      font-family: Inter, system-ui, sans-serif;
    }

    /* Reset básico para elementos del sistema hospitalario */
    * {
      box-sizing: border-box;
    }

    /* Variables CSS globales para el sistema hospitalario */
    :root {
      /* Colores hospital */
      --hospital-primary: #1e40af;
      --hospital-primary-light: #3b82f6;
      --hospital-primary-dark: #1e3a8a;
      --hospital-success: #059669;
      --hospital-success-light: #10b981;
      --hospital-success-dark: #047857;
      --hospital-emergency: #dc2626;
      --hospital-emergency-light: #ef4444;
      --hospital-emergency-dark: #b91c1c;
      --hospital-warning: #d97706;
      --hospital-warning-light: #f59e0b;
      --hospital-warning-dark: #b45309;
      --hospital-info: #0284c7;
      --hospital-info-light: #0ea5e9;
      --hospital-info-dark: #0369a1;

      /* Grises hospital */
      --hospital-gray-50: #f9fafb;
      --hospital-gray-100: #f3f4f6;
      --hospital-gray-200: #e5e7eb;
      --hospital-gray-300: #d1d5db;
      --hospital-gray-400: #9ca3af;
      --hospital-gray-500: #6b7280;
      --hospital-gray-600: #4b5563;
      --hospital-gray-700: #374151;
      --hospital-gray-800: #1f2937;
      --hospital-gray-900: #111827;

      /* Fuentes */
      --hospital-font-family: Inter, system-ui, sans-serif;
      --hospital-font-mono: 'JetBrains Mono', Monaco, Consolas, monospace;

      /* Sombras */
      --hospital-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --hospital-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      --hospital-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      --hospital-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

      /* Transiciones estándar */
      --hospital-transition: all 0.2s ease-in-out;
      --hospital-transition-fast: all 0.15s ease-in-out;
      --hospital-transition-slow: all 0.3s ease-in-out;
    }

    /* Scrollbar global personalizado para el sistema hospitalario */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background-color: var(--hospital-gray-400);
      background-color: rgba(107, 114, 128, 0.3);
      border-radius: 3px;
      transition: background-color 0.2s ease;
    }

    ::-webkit-scrollbar-thumb:hover {
      background-color: rgba(107, 114, 128, 0.5);
    }

    ::-webkit-scrollbar-corner {
      background: transparent;
    }

    /* Estilos base para elementos de formulario del hospital */
    input, select, textarea, button {
      font-family: var(--hospital-font-family);
    }

    /* Focus states globales para accesibilidad */
    *:focus-visible {
      outline: 2px solid var(--hospital-primary);
      outline-offset: 2px;
    }

    /* Animaciones globales para el sistema hospitalario */
    @keyframes hospital-fade-in {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes hospital-slide-up {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes hospital-slide-down {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes hospital-pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }

    /* Clases utilitarias globales */
    .hospital-fade-in {
      animation: hospital-fade-in 0.3s ease-out;
    }

    .hospital-slide-up {
      animation: hospital-slide-up 0.3s ease-out;
    }

    .hospital-slide-down {
      animation: hospital-slide-down 0.3s ease-out;
    }

    .hospital-pulse {
      animation: hospital-pulse 2s infinite;
    }

    /* Clases para estados de carga */
    .hospital-loading {
      pointer-events: none;
      opacity: 0.7;
    }

    /* Clases para elementos ocultos */
    .hospital-hidden {
      display: none !important;
    }

    .hospital-invisible {
      visibility: hidden;
    }

    /* Print styles para documentos médicos */
    @media print {
      :host {
        background-color: white !important;
      }

      /* Ocultar navegación en impresión */
      app-modern-sidebar,
      .no-print {
        display: none !important;
      }

      /* Ajustar márgenes para documentos médicos */
      .print-content {
        margin: 0 !important;
        padding: 1rem !important;
      }
    }

    /* Soporte para modo alto contraste */
    @media (prefers-contrast: high) {
      :root {
        --hospital-primary: #0000ff;
        --hospital-gray-700: #000000;
        --hospital-gray-500: #333333;
      }
    }

    /* Soporte para modo oscuro (si se implementa en el futuro) */
    @media (prefers-color-scheme: dark) {
      /* Variables para modo oscuro del hospital */
      :root {
        --hospital-gray-50: #1f2937;
        --hospital-gray-100: #374151;
        --hospital-gray-900: #f9fafb;
      }
    }

    /* Reducir animaciones si el usuario lo prefiere */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `]
})
export class App {
  protected title = 'SICEG-HG-APP';

  constructor() {
    // Configuración inicial del sistema hospitalario
    this.initializeHospitalSystem();
  }

  private initializeHospitalSystem(): void {
    // Log de inicialización del sistema
    console.log('   SICEG-HG - Sistema de Expedientes Clínicos');
    console.log('   Hospital General San Luis de la Paz, Guanajuato');
    console.log('   Iniciando aplicación...');

    // Configurar título de la página
    document.title = 'SICEG-HG - Sistema de Expedientes Clínicos';

    // Agregar meta tags específicos del hospital
    this.addHospitalMetaTags();

    // Configurar manejadores globales de errores
    this.setupGlobalErrorHandlers();
  }

  private addHospitalMetaTags(): void {
    // Meta description
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Sistema de Expedientes Clínicos Electrónicos - Hospital General San Luis de la Paz, Guanajuato';
    document.head.appendChild(metaDescription);

    // Meta keywords
    const metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    metaKeywords.content = 'expedientes, clínicos, hospital, san luis de la paz, guanajuato, medicina, salud';
    document.head.appendChild(metaKeywords);

    // Meta author
    const metaAuthor = document.createElement('meta');
    metaAuthor.name = 'author';
    metaAuthor.content = 'Hospital General San Luis de la Paz';
    document.head.appendChild(metaAuthor);

    // Viewport optimizado para sistema hospitalario
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=yes');
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Manejador global de errores de JavaScript
    window.addEventListener('error', (event) => {
      console.error('   Error del sistema hospitalario:', event.error);
      // TODO: Enviar errores a servicio de logging
    });

    // Manejador de promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      console.error('   Promesa rechazada en sistema hospitalario:', event.reason);
      // TODO: Enviar errores a servicio de logging
    });
  }
}
