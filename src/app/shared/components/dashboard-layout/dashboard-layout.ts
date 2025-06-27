// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterOutlet } from '@angular/router';
// import { ModernSidebarComponent } from '../modern-sidebar/modern-sidebar';

// @Component({
//   selector: 'app-dashboard-layout',
//   standalone: true,
//   imports: [CommonModule, RouterOutlet, ModernSidebarComponent],
//   template: `
//     <div class="min-h-screen bg-hospital-gray-50">
//       <!-- Modern Sidebar -->
//       <app-modern-sidebar></app-modern-sidebar>

//       <!-- Main Content Area -->
//       <main class="transition-all duration-300 ease-in-out"
//             [class.ml-64]="sidebarExpanded"
//             [class.ml-16]="!sidebarExpanded">

//         <!-- Top Header Bar -->
//         <header class="bg-white border-b border-hospital-gray-200 shadow-sm sticky top-0 z-40">
//           <div class="px-6 py-4">
//             <div class="flex items-center justify-between">

//               <!-- Page Title & Breadcrumb -->
//               <div class="flex items-center space-x-4">
//                 <h1 class="text-2xl font-bold text-hospital-gray-900">
//                   {{ currentPageTitle }}
//                 </h1>
//                 <nav class="hidden md:flex" aria-label="Breadcrumb">
//                   <ol class="flex items-center space-x-2 text-sm">
//                     <li>
//                       <a routerLink="/app/dashboard" class="text-hospital-gray-500 hover:text-hospital-primary">
//                         Inicio
//                       </a>
//                     </li>
//                     <li class="flex items-center">
//                       <svg class="w-4 h-4 mx-2 text-hospital-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                         <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
//                       </svg>
//                       <span class="text-hospital-gray-700">{{ currentPageTitle }}</span>
//                     </li>
//                   </ol>
//                 </nav>
//               </div>

//               <!-- Header Actions -->
//               <div class="flex items-center space-x-4">

//                 <!-- Quick Actions -->
//                 <div class="hidden lg:flex items-center space-x-2">
//                   <button class="btn-hospital bg-hospital-primary text-white hover:bg-hospital-primary-dark">
//                     <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
//                     </svg>
//                     Nuevo Paciente
//                   </button>

//                   <button class="btn-hospital bg-hospital-success text-white hover:bg-hospital-success-dark">
//                     <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
//                     </svg>
//                     Nuevo Expediente
//                   </button>
//                 </div>

//                 <!-- Notifications -->
//                 <div class="relative">
//                   <button class="p-2 text-hospital-gray-600 hover:text-hospital-primary hover:bg-hospital-gray-100 rounded-lg transition-all duration-200 relative">
//                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
//                     </svg>
//                     <!-- Badge de notificaciones -->
//                     <span class="absolute -top-1 -right-1 bg-hospital-emergency text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
//                       3
//                     </span>
//                   </button>
//                 </div>

//                 <!-- System Status -->
//                 <div class="hidden md:flex items-center space-x-2 px-3 py-2 bg-hospital-success bg-opacity-10 border border-hospital-success border-opacity-20 rounded-lg">
//                   <div class="w-2 h-2 bg-hospital-success rounded-full animate-pulse"></div>
//                   <span class="text-xs text-hospital-success font-medium">Sistema Operativo</span>
//                 </div>

//                 <!-- User Profile -->
//                 <div class="relative">
//                   <button class="flex items-center space-x-3 p-2 text-hospital-gray-700 hover:bg-hospital-gray-100 rounded-lg transition-all duration-200">
//                     <div class="w-8 h-8 bg-gradient-to-br from-hospital-primary to-hospital-info rounded-full flex items-center justify-center">
//                       <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
//                       </svg>
//                     </div>
//                     <div class="hidden lg:block text-left">
//                       <p class="text-sm font-medium">Dr. Administrador</p>
//                       <p class="text-xs text-hospital-gray-500">Hospital General</p>
//                     </div>
//                     <svg class="w-4 h-4 text-hospital-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         <!-- Page Content -->
//         <div class="p-6">
//           <router-outlet></router-outlet>
//         </div>

//         <!-- Footer -->
//         <footer class="bg-white border-t border-hospital-gray-200 mt-12">
//           <div class="px-6 py-4">
//             <div class="flex flex-col md:flex-row justify-between items-center">
//               <div class="text-sm text-hospital-gray-600">
//                 © 2025 CICEG-HG - Sistema de Expediente Clínico Electrónico
//               </div>
//               <div class="flex items-center space-x-4 mt-2 md:mt-0">
//                 <span class="text-xs text-hospital-gray-500">Hospital General San Luis de la Paz, Guanajuato</span>
//                 <div class="flex items-center space-x-1">
//                   <div class="w-2 h-2 bg-hospital-success rounded-full animate-pulse"></div>
//                   <span class="text-xs text-hospital-success">Online</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </footer>
//       </main>
//     </div>
//   `,
//   styles: [`
//     /* Animaciones personalizadas */
//     @keyframes fadeIn {
//       from { opacity: 0; transform: translateY(-10px); }
//       to { opacity: 1; transform: translateY(0); }
//     }

//     .animate-fade-in {
//       animation: fadeIn 0.3s ease-out;
//     }

//     /* Scrollbar personalizado */
//     ::-webkit-scrollbar {
//       width: 6px;
//     }

//     ::-webkit-scrollbar-track {
//       background: transparent;
//     }

//     ::-webkit-scrollbar-thumb {
//       background: rgba(156, 163, 175, 0.5);
//       border-radius: 3px;
//     }

//     ::-webkit-scrollbar-thumb:hover {
//       background: rgba(156, 163, 175, 0.7);
//     }
//   `]
// })
// export class DashboardLayoutComponent implements OnInit {
//   sidebarExpanded = true;
//   currentPageTitle = 'Dashboard';

//   constructor() {}

//   ngOnInit(): void {
//     // Escuchar cambios de ruta para actualizar el título
//     this.updatePageTitle();
//   }

//   private updatePageTitle(): void {
//     // Lógica para actualizar el título basado en la ruta actual
//     const path = window.location.pathname;

//     if (path.includes('dashboard')) {
//       this.currentPageTitle = 'Dashboard';
//     } else if (path.includes('pacientes')) {
//       this.currentPageTitle = 'Gestión de Pacientes';
//     } else if (path.includes('expedientes')) {
//       this.currentPageTitle = 'Expedientes Clínicos';
//     } else if (path.includes('catalogos')) {
//       this.currentPageTitle = 'Catálogos';
//     } else {
//       this.currentPageTitle = 'Panel de Control';
//     }
//   }
// }
























// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
// import { ModernSidebarComponent } from '../../components/modern-sidebar/modern-sidebar';
// import { filter } from 'rxjs/operators';

// @Component({
//   selector: 'app-dashboard-layout',
//   standalone: true,
//   imports: [CommonModule, RouterOutlet, ModernSidebarComponent],
//   template: `
//     <div class="min-h-screen bg-hospital-gray-50">
//       <!-- Modern Sidebar -->
//       <app-modern-sidebar></app-modern-sidebar>

//       <!-- Main Content Area -->
//       <main class="transition-all duration-300 ease-in-out ml-64">

//         <!-- Top Header Bar -->
//         <header class="bg-white border-b border-hospital-gray-200 shadow-sm sticky top-0 z-40">
//           <div class="px-6 py-4">
//             <div class="flex items-center justify-between">

//               <!-- Page Title & Breadcrumb -->
//               <div class="flex items-center space-x-4">
//                 <h1 class="text-2xl font-bold text-hospital-gray-900">
//                   {{ currentPageTitle }}
//                 </h1>
//                 <nav class="hidden md:flex" aria-label="Breadcrumb">
//                   <ol class="flex items-center space-x-2 text-sm">
//                     <li>
//                       <a routerLink="/app/dashboard" class="text-hospital-gray-500 hover:text-hospital-primary transition-colors">
//                         Inicio
//                       </a>
//                     </li>
//                     <li class="flex items-center" *ngIf="currentPageTitle !== 'Dashboard'">
//                       <svg class="w-4 h-4 mx-2 text-hospital-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                         <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
//                       </svg>
//                       <span class="text-hospital-gray-700">{{ currentPageTitle }}</span>
//                     </li>
//                   </ol>
//                 </nav>
//               </div>

//               <!-- Header Actions -->
//               <div class="flex items-center space-x-4">

//                 <!-- Quick Actions -->
//                 <div class="hidden lg:flex items-center space-x-2">
//                   <button routerLink="/app/personas/pacientes"
//                           class="btn-hospital bg-hospital-primary text-white hover:bg-hospital-primary-dark">
//                     <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
//                     </svg>
//                     Nuevo Paciente
//                   </button>

//                   <button routerLink="/app/gestion-expedientes/expedientes"
//                           class="btn-hospital bg-hospital-success text-white hover:bg-hospital-success-dark">
//                     <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
//                     </svg>
//                     Nuevo Expediente
//                   </button>
//                 </div>

//                 <!-- Notifications -->
//                 <div class="relative">
//                   <button class="p-2 text-hospital-gray-600 hover:text-hospital-primary hover:bg-hospital-gray-100 rounded-lg transition-all duration-200 relative">
//                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
//                     </svg>
//                     <!-- Badge de notificaciones -->
//                     <span class="absolute -top-1 -right-1 bg-hospital-emergency text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
//                       3
//                     </span>
//                   </button>
//                 </div>

//                 <!-- System Status -->
//                 <div class="hidden md:flex items-center space-x-2 px-3 py-2 bg-hospital-success bg-opacity-10 border border-hospital-success border-opacity-20 rounded-lg">
//                   <div class="w-2 h-2 bg-hospital-success rounded-full animate-pulse"></div>
//                   <span class="text-xs text-hospital-success font-medium">Sistema Operativo</span>
//                 </div>

//                 <!-- User Profile -->
//                 <div class="relative">
//                   <button class="flex items-center space-x-3 p-2 text-hospital-gray-700 hover:bg-hospital-gray-100 rounded-lg transition-all duration-200">
//                     <div class="w-8 h-8 bg-gradient-to-br from-hospital-primary to-hospital-info rounded-full flex items-center justify-center">
//                       <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
//                       </svg>
//                     </div>
//                     <div class="hidden lg:block text-left">
//                       <p class="text-sm font-medium">Dr. Administrador</p>
//                       <p class="text-xs text-hospital-gray-500">Hospital General</p>
//                     </div>
//                     <svg class="w-4 h-4 text-hospital-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         <!-- Page Content -->
//         <div class="p-6">
//           <router-outlet></router-outlet>
//         </div>

//         <!-- Footer -->
//         <footer class="bg-white border-t border-hospital-gray-200 mt-12">
//           <div class="px-6 py-4">
//             <div class="flex flex-col md:flex-row justify-between items-center">
//               <div class="text-sm text-hospital-gray-600">
//                 © 2025 CICEG-HG - Sistema de Expediente Clínico Electrónico
//               </div>
//               <div class="flex items-center space-x-4 mt-2 md:mt-0">
//                 <span class="text-xs text-hospital-gray-500">Hospital General San Luis de la Paz, Guanajuato</span>
//                 <div class="flex items-center space-x-1">
//                   <div class="w-2 h-2 bg-hospital-success rounded-full animate-pulse"></div>
//                   <span class="text-xs text-hospital-success">Online</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </footer>
//       </main>
//     </div>
//   `,
//   styles: [`
//     /* Animaciones personalizadas */
//     @keyframes fadeIn {
//       from { opacity: 0; transform: translateY(-10px); }
//       to { opacity: 1; transform: translateY(0); }
//     }

//     .animate-fade-in {
//       animation: fadeIn 0.3s ease-out;
//     }

//     /* Scrollbar personalizado */
//     ::-webkit-scrollbar {
//       width: 6px;
//     }

//     ::-webkit-scrollbar-track {
//       background: transparent;
//     }

//     ::-webkit-scrollbar-thumb {
//       background: rgba(156, 163, 175, 0.5);
//       border-radius: 3px;
//     }

//     ::-webkit-scrollbar-thumb:hover {
//       background: rgba(156, 163, 175, 0.7);
//     }
//   `]
// })
// export class DashboardLayoutComponent implements OnInit {
//   currentPageTitle = 'Dashboard';

//   constructor(private router: Router) {}

//   ngOnInit(): void {
//     // Escuchar cambios de ruta para actualizar el título
//     this.router.events
//       .pipe(filter(event => event instanceof NavigationEnd))
//       .subscribe((event: NavigationEnd) => {
//         this.updatePageTitle(event.url);
//       });

//     // Establecer título inicial
//     this.updatePageTitle(this.router.url);
//   }

//   private updatePageTitle(url: string): void {
//     // Mapeo de rutas a títulos
//     const routeTitles: { [key: string]: string } = {
//       '/app/dashboard': 'Dashboard',

//       // Catálogos
//       '/app/catalogos/servicios': 'Servicios',
//       '/app/catalogos/areas-interconsulta': 'Áreas de Interconsulta',
//       '/app/catalogos/guias-clinicas': 'Guías Clínicas',
//       '/app/catalogos/estudios-medicos': 'Estudios Médicos',
//       '/app/catalogos/medicamentos': 'Medicamentos',
//       '/app/catalogos/tipos-sangre': 'Tipos de Sangre',
//       '/app/catalogos/tipos-documento': 'Tipos de Documento',

//       // Personas
//       '/app/personas': 'Gestión de Personas',
//       '/app/personas/pacientes': 'Pacientes',
//       '/app/personas/pacientes-list': 'Lista de Pacientes',
//       '/app/personas/personal-medico': 'Personal Médico',
//       '/app/personas/administradores': 'Administradores',

//       // Gestión de Expedientes
//       '/app/gestion-expedientes/expedientes': 'Expedientes Clínicos',
//       '/app/gestion-expedientes/camas': 'Gestión de Camas',
//       '/app/gestion-expedientes/internamientos': 'Internamientos',
//       '/app/gestion-expedientes/signos-vitales': 'Signos Vitales',

//       // Documentos Clínicos
//       '/app/documentos-clinicos/documentos': 'Documentos Clínicos',
//       '/app/documentos-clinicos/historias-clinicas': 'Historias Clínicas',
//       '/app/documentos-clinicos/notas-urgencias': 'Notas de Urgencias',
//       '/app/documentos-clinicos/notas-evolucion': 'Notas de Evolución',
//       '/app/documentos-clinicos/notas-interconsulta': 'Notas de Interconsulta',
//       '/app/documentos-clinicos/notas-preoperatoria': 'Notas Preoperatorias',
//       '/app/documentos-clinicos/notas-preanestesica': 'Notas Preanestésicas',
//       '/app/documentos-clinicos/notas-postoperatoria': 'Notas Postoperatorias',
//       '/app/documentos-clinicos/notas-postanestesica': 'Notas Postanestésicas',
//       '/app/documentos-clinicos/notas-egreso': 'Notas de Egreso',
//       '/app/documentos-clinicos/consentimientos-informados': 'Consentimientos Informados',
//       '/app/documentos-clinicos/solicitudes-estudio': 'Solicitudes de Estudio',
//       '/app/documentos-clinicos/referencias-traslado': 'Referencias y Traslados',
//       '/app/documentos-clinicos/prescripciones-medicamento': 'Prescripciones de Medicamentos',
//       '/app/documentos-clinicos/registros-transfusion': 'Registros de Transfusión',

//       // Notas Especializadas
//       '/app/notas-especializadas/notas-psicologia': 'Notas de Psicología',
//       '/app/notas-especializadas/notas-nutricion': 'Notas de Nutrición',
//     };

//     // Buscar título exacto o por categoría
//     this.currentPageTitle = routeTitles[url] || this.getTitleByCategory(url);
//   }

//   private getTitleByCategory(url: string): string {
//     if (url.includes('catalogos')) return 'Catálogos';
//     if (url.includes('personas')) return 'Gestión de Personas';
//     if (url.includes('gestion-expedientes')) return 'Gestión de Expedientes';
//     if (url.includes('documentos-clinicos')) return 'Documentos Clínicos';
//     if (url.includes('notas-especializadas')) return 'Notas Especializadas';
//     return 'Dashboard';
//   }
// }


























// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
// import { ModernSidebarComponent } from '../modern-sidebar/modern-sidebar';
// import { filter } from 'rxjs/operators';

// @Component({
//   selector: 'app-dashboard-layout',
//   standalone: true,
//   imports: [CommonModule, RouterOutlet, ModernSidebarComponent],
//   templateUrl: './dashboard-layout.html',
//   styles: [`
//     /* Variables CSS personalizadas para el sistema hospitalario */
//     :root {
//       --hospital-primary: rgb(59 130 246);      /* blue-500 */
//       --hospital-primary-dark: rgb(37 99 235);  /* blue-600 */
//       --hospital-success: rgb(16 185 129);      /* emerald-500 */
//       --hospital-warning: rgb(245 158 11);      /* amber-500 */
//       --hospital-error: rgb(239 68 68);         /* red-500 */
//     }

//     /* Animaciones personalizadas estilo Apple */
//     @keyframes fadeIn {
//       from {
//         opacity: 0;
//         transform: translateY(-10px);
//       }
//       to {
//         opacity: 1;
//         transform: translateY(0);
//       }
//     }

//     .animate-fade-in {
//       animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
//     }

//     /* Scrollbar personalizado más elegante */
//     ::-webkit-scrollbar {
//       width: 6px;
//     }

//     ::-webkit-scrollbar-track {
//       background: transparent;
//     }

//     ::-webkit-scrollbar-thumb {
//       background: rgba(120, 113, 108, 0.3);
//       border-radius: 3px;
//       transition: background 0.2s ease;
//     }

//     ::-webkit-scrollbar-thumb:hover {
//       background: rgba(120, 113, 108, 0.5);
//     }

//     /* Efectos hover mejorados */
//     .btn-hospital {
//       @apply inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm;
//     }

//     .btn-hospital:hover {
//       transform: translateY(-1px);
//       box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//     }

//     /* Tooltips mejorados */
//     .tooltip {
//       @apply absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-stone-800 text-white text-xs rounded opacity-0 transition-opacity duration-200 whitespace-nowrap pointer-events-none;
//     }

//     .tooltip-trigger:hover .tooltip {
//       @apply opacity-100;
//     }

//     /* Estados de notificación */
//     .notification-badge {
//       @apply absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold;
//       animation: pulse 2s infinite;
//     }

//     /* Responsive adjustments */
//     @media (max-width: 1024px) {
//       .ml-64 {
//         margin-left: 0;
//       }
//     }
//   `]
// })
// export class DashboardLayoutComponent implements OnInit {
//   currentPageTitle = 'Dashboard';

//   constructor(private router: Router) {}

//   ngOnInit(): void {
//     // Escuchar cambios de ruta para actualizar el título
//     this.router.events
//       .pipe(filter(event => event instanceof NavigationEnd))
//       .subscribe((event: NavigationEnd) => {
//         this.updatePageTitle(event.url);
//       });

//     // Establecer título inicial
//     this.updatePageTitle(this.router.url);
//   }

//   private updatePageTitle(url: string): void {
//     // Mapeo de rutas a títulos amigables para médicos
//     const routeTitles: { [key: string]: string } = {
//       '/app/dashboard': 'Panel Principal',

//       // Pacientes
//       '/app/personas/pacientes': 'Buscar Pacientes',
//       '/app/personas/pacientes/nuevo': 'Registrar Nuevo Paciente',
//       '/app/personas/pacientes-list': 'Lista de Pacientes',
//       '/app/personas/personal-medico': 'Personal Médico',
//       '/app/personas/administradores': 'Administradores',
//       '/app/personas': 'Gestión de Personas',

//       // Expedientes
//       '/app/gestion-expedientes/expedientes': 'Expedientes Clínicos',
//       '/app/gestion-expedientes/expedientes/nuevo': 'Crear Nuevo Expediente',
//       '/app/gestion-expedientes/camas': 'Gestión de Camas',
//       '/app/gestion-expedientes/internamientos': 'Hospitalizaciones',
//       '/app/gestion-expedientes/signos-vitales': 'Signos Vitales',

//       // Documentos Clínicos
//       '/app/documentos-clinicos/historias-clinicas': 'Historias Clínicas',
//       '/app/documentos-clinicos/notas-urgencias': 'Notas de Urgencias',
//       '/app/documentos-clinicos/notas-evolucion': 'Notas de Consulta',
//       '/app/documentos-clinicos/notas-interconsulta': 'Notas de Interconsulta',
//       '/app/documentos-clinicos/notas-preoperatoria': 'Notas Preoperatorias',
//       '/app/documentos-clinicos/notas-preanestesica': 'Notas Preanestésicas',
//       '/app/documentos-clinicos/notas-postoperatoria': 'Notas Postoperatorias',
//       '/app/documentos-clinicos/notas-postanestesica': 'Notas Postanestésicas',
//       '/app/documentos-clinicos/notas-egreso': 'Notas de Egreso',
//       '/app/documentos-clinicos/consentimientos-informados': 'Consentimientos Informados',
//       '/app/documentos-clinicos/solicitudes-estudio': 'Solicitudes de Estudio',
//       '/app/documentos-clinicos/referencias-traslado': 'Referencias y Traslados',
//       '/app/documentos-clinicos/prescripciones-medicamento': 'Recetas Médicas',
//       '/app/documentos-clinicos/registros-transfusion': 'Registros de Transfusión',
//       '/app/documentos-clinicos/documentos': 'Documentos Clínicos',

//       // Catálogos
//       '/app/catalogos/servicios': 'Servicios Médicos',
//       '/app/catalogos/medicamentos': 'Catálogo de Medicamentos',
//       '/app/catalogos/estudios-medicos': 'Estudios Médicos',
//       '/app/catalogos/tipos-sangre': 'Tipos de Sangre',
//       '/app/catalogos/areas-interconsulta': 'Áreas de Interconsulta',
//       '/app/catalogos/guias-clinicas': 'Guías Clínicas',
//       '/app/catalogos/tipos-documento': 'Tipos de Documento',

//       // Notas Especializadas
//       '/app/notas-especializadas/notas-psicologia': 'Notas de Psicología',
//       '/app/notas-especializadas/notas-nutricion': 'Notas de Nutrición',
//     };

//     // Buscar título exacto o por categoría
//     this.currentPageTitle = routeTitles[url] || this.getTitleByCategory(url);
//   }

//   private getTitleByCategory(url: string): string {
//     // Títulos por categoría con terminología médica amigable
//     if (url.includes('personas')) return 'Gestión de Personas';
//     if (url.includes('gestion-expedientes')) return 'Gestión de Expedientes';
//     if (url.includes('documentos-clinicos')) return 'Documentos Médicos';
//     if (url.includes('catalogos')) return 'Catálogos del Sistema';
//     if (url.includes('notas-especializadas')) return 'Notas Especializadas';
//     return 'Panel Principal';
//   }

//   // Métodos adicionales para mejorar la experiencia del usuario
//   getCurrentTime(): string {
//     return new Date().toLocaleTimeString('es-MX', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   }

//   getWelcomeMessage(): string {
//     const hour = new Date().getHours();
//     if (hour < 12) return '🌅 Buenos días, Doctor';
//     if (hour < 18) return '☀️ Buenas tardes, Doctor';
//     return '🌙 Buenas noches, Doctor';
//   }

//   // Funciones para notificaciones (futuras implementaciones)
//   getNotificationCount(): number {
//     // Aquí podrías conectar con un servicio real
//     return 3;
//   }

//   hasUrgentNotifications(): boolean {
//     // Lógica para detectar notificaciones urgentes
//     return this.getNotificationCount() > 0;
//   }

//   // Función para debugging en desarrollo
//   logCurrentRoute(): void {
//     if (!environment.production) {
//       console.log(`🏥 CICEG-HG - Navegando a: ${this.currentPageTitle} (${this.router.url})`);
//     }
//   }
// }

// // Importar environment si existe
// declare const environment: any;




































import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ModernSidebarComponent } from '../modern-sidebar/modern-sidebar';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ModernSidebarComponent],
  templateUrl: './dashboard-layout.html',
  styles: [`
    /* Variables CSS personalizadas para el sistema hospitalario */
    :root {
      --hospital-primary: rgb(59 130 246);      /* blue-500 */
      --hospital-primary-dark: rgb(37 99 235);  /* blue-600 */
      --hospital-success: rgb(16 185 129);      /* emerald-500 */
      --hospital-warning: rgb(245 158 11);      /* amber-500 */
      --hospital-error: rgb(239 68 68);         /* red-500 */
    }

    /* Animaciones personalizadas estilo Apple */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes dropdownIn {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .animate-dropdown-in {
      animation: dropdownIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Scrollbar personalizado más elegante */
    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(120, 113, 108, 0.3);
      border-radius: 3px;
      transition: background 0.2s ease;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(120, 113, 108, 0.5);
    }

    /* Efectos hover mejorados */
    .btn-hospital {
      @apply inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm;
    }

    .btn-hospital:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    /* Tooltips mejorados */
    .tooltip {
      @apply absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-stone-800 text-white text-xs rounded opacity-0 transition-opacity duration-200 whitespace-nowrap pointer-events-none;
    }

    .tooltip-trigger:hover .tooltip {
      @apply opacity-100;
    }

    /* Estados de notificación */
    .notification-badge {
      @apply absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold;
      animation: pulse 2s infinite;
    }

    /* Responsive adjustments */
    @media (max-width: 1024px) {
      .ml-64 {
        margin-left: 0;
      }
    }
  `]
})
export class DashboardLayoutComponent implements OnInit {
  currentPageTitle = 'Dashboard';
  isUserDropdownOpen = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Escuchar cambios de ruta para actualizar el título
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.url);
      });

    // Establecer título inicial
    this.updatePageTitle(this.router.url);

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown-container')) {
        this.isUserDropdownOpen = false;
      }
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    // Cerrar dropdown en resize
    this.isUserDropdownOpen = false;
  }

  // Métodos para manejar el dropdown del usuario
  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  closeUserDropdown(): void {
    this.isUserDropdownOpen = false;
  }

  onDropdownItemClick(action: string): void {
    this.closeUserDropdown();

    switch (action) {
      case 'profile':
        this.handleProfileClick();
        break;
      case 'settings':
        this.handleSettingsClick();
        break;
      case 'schedule':
        this.handleScheduleClick();
        break;
      case 'help':
        this.handleHelpClick();
        break;
      case 'logout':
        this.handleLogoutClick();
        break;
      default:
        console.log(`Acción no reconocida: ${action}`);
    }
  }

  // Handlers para cada acción del dropdown
  private handleProfileClick(): void {
    console.log('🏥 Abriendo perfil del usuario');
    // Aquí podrías navegar a una ruta de perfil
    // this.router.navigate(['/app/profile']);
  }

  private handleSettingsClick(): void {
    console.log('⚙️ Abriendo configuración');
    // this.router.navigate(['/app/settings']);
  }

  private handleScheduleClick(): void {
    console.log('📅 Abriendo horarios médicos');
    // this.router.navigate(['/app/schedule']);
  }

  private handleHelpClick(): void {
    console.log('❓ Abriendo centro de ayuda');
    // Podrías abrir un modal de ayuda o navegar a documentación
    // this.openHelpModal();
  }

  private handleLogoutClick(): void {
    console.log('🚪 Cerrando sesión');
    // Aquí implementarías la lógica de logout
    if (this.confirmLogout()) {
      // this.authService.logout();
      // this.router.navigate(['/login']);
    }
  }

  private confirmLogout(): boolean {
    return confirm('¿Está seguro que desea cerrar sesión?');
  }

  private updatePageTitle(url: string): void {
    // Mapeo de rutas a títulos amigables para médicos (SIN EMOJIS)
    const routeTitles: { [key: string]: string } = {
      '/app/dashboard': 'Panel Principal',

      // Pacientes
      '/app/personas/pacientes': 'Buscar Pacientes',
      '/app/personas/pacientes/nuevo': 'Registrar Nuevo Paciente',
      '/app/personas/pacientes-list': 'Lista de Pacientes',
      '/app/personas/personal-medico': 'Personal Médico',
      '/app/personas/administradores': 'Administradores',
      '/app/personas': 'Gestión de Personas',

      // Expedientes
      '/app/gestion-expedientes/expedientes': 'Expedientes Clínicos',
      '/app/gestion-expedientes/expedientes/nuevo': 'Crear Nuevo Expediente',
      '/app/gestion-expedientes/camas': 'Gestión de Camas',
      '/app/gestion-expedientes/internamientos': 'Hospitalizaciones',
      '/app/gestion-expedientes/signos-vitales': 'Signos Vitales',

      // Documentos Clínicos
      '/app/documentos-clinicos/historias-clinicas': 'Historias Clínicas',
      '/app/documentos-clinicos/notas-urgencias': 'Notas de Urgencias',
      '/app/documentos-clinicos/notas-evolucion': 'Notas de Consulta',
      '/app/documentos-clinicos/notas-interconsulta': 'Notas de Interconsulta',
      '/app/documentos-clinicos/notas-preoperatoria': 'Notas Preoperatorias',
      '/app/documentos-clinicos/notas-preanestesica': 'Notas Preanestésicas',
      '/app/documentos-clinicos/notas-postoperatoria': 'Notas Postoperatorias',
      '/app/documentos-clinicos/notas-postanestesica': 'Notas Postanestésicas',
      '/app/documentos-clinicos/notas-egreso': 'Notas de Egreso',
      '/app/documentos-clinicos/consentimientos-informados': 'Consentimientos Informados',
      '/app/documentos-clinicos/solicitudes-estudio': 'Solicitudes de Estudio',
      '/app/documentos-clinicos/referencias-traslado': 'Referencias y Traslados',
      '/app/documentos-clinicos/prescripciones-medicamento': 'Recetas Médicas',
      '/app/documentos-clinicos/registros-transfusion': 'Registros de Transfusión',
      '/app/documentos-clinicos/documentos': 'Documentos Clínicos',

      // Catálogos
      '/app/catalogos/servicios': 'Servicios Médicos',
      '/app/catalogos/medicamentos': 'Catálogo de Medicamentos',
      '/app/catalogos/estudios-medicos': 'Estudios Médicos',
      '/app/catalogos/tipos-sangre': 'Tipos de Sangre',
      '/app/catalogos/areas-interconsulta': 'Áreas de Interconsulta',
      '/app/catalogos/guias-clinicas': 'Guías Clínicas',
      '/app/catalogos/tipos-documento': 'Tipos de Documento',

      // Notas Especializadas
      '/app/notas-especializadas/notas-psicologia': 'Notas de Psicología',
      '/app/notas-especializadas/notas-nutricion': 'Notas de Nutrición',
    };

    // Buscar título exacto o por categoría
    this.currentPageTitle = routeTitles[url] || this.getTitleByCategory(url);
  }

  private getTitleByCategory(url: string): string {
    // Títulos por categoría con terminología médica amigable (SIN EMOJIS)
    if (url.includes('personas')) return 'Gestión de Personas';
    if (url.includes('gestion-expedientes')) return 'Gestión de Expedientes';
    if (url.includes('documentos-clinicos')) return 'Documentos Médicos';
    if (url.includes('catalogos')) return 'Catálogos del Sistema';
    if (url.includes('notas-especializadas')) return 'Notas Especializadas';
    return 'Panel Principal';
  }

  // Métodos adicionales para mejorar la experiencia del usuario
  getCurrentTime(): string {
    return new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días, Doctor';
    if (hour < 18) return 'Buenas tardes, Doctor';
    return 'Buenas noches, Doctor';
  }

  // Funciones para notificaciones (futuras implementaciones)
  getNotificationCount(): number {
    // Aquí podrías conectar con un servicio real
    return 3;
  }

  hasUrgentNotifications(): boolean {
    // Lógica para detectar notificaciones urgentes
    return this.getNotificationCount() > 0;
  }

  // Función para debugging en desarrollo
  logCurrentRoute(): void {
    console.log(`CICEG-HG - Navegando a: ${this.currentPageTitle} (${this.router.url})`);
  }
}

// Comentar si no tienes environment configurado
// declare const environment: any;
