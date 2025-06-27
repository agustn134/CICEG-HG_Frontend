// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-dashboard',
// //   templateUrl: './dashboard.html',
// //   styleUrls: ['./dashboard.css'],
// //   imports: []
// // })
// // export class Dashboard {
// //   user = {
// //     nombre: 'Juan',
// //     apellido_paterno: 'Pérez'
// //   };

// //   recentActivities = [
// //     { id: 1, type: 'Expediente creado', patient: 'Juan Pérez García', time: '10:30 AM', status: 'completado' },
// //     { id: 2, type: 'Historia Clínica', patient: 'María López Hernández', time: '09:45 AM', status: 'pendiente' },
// //     { id: 3, type: 'Nota de Evolución', patient: 'Carlos Rodríguez Silva', time: '08:20 AM', status: 'completado' },
// //     { id: 4, type: 'Paciente registrado', patient: 'Ana Martínez González', time: 'Ayer 4:15 PM', status: 'completado' }
// //   ];

// //   quickActions = [
// //     { title: 'Nuevo Paciente', description: 'Registrar nuevo paciente', href: '/personas/pacientes/nuevo', icon: 'user' },
// //     { title: 'Nueva Historia Clínica', description: 'Crear historia clínica', href: '/documentos-clinicos/historias-clinicas', icon: 'file-text' },
// //     { title: 'Buscar Expediente', description: 'Buscar expedientes existentes', href: '/gestion-expedientes/expedientes', icon: 'archive' }
// //   ];


// // }


















// // import { Component, OnInit } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { RouterOutlet } from '@angular/router';
// // import { ModernSidebarComponent } from "../../shared/components/modern-sidebar/modern-sidebar";

// // @Component({
// //   selector: 'app-dashboard-layout',
// //   standalone: true,
// //   imports: [CommonModule, RouterOutlet, ModernSidebarComponent],
// //   template: `
// //     <div class="min-h-screen bg-hospital-gray-50">
// //       <!-- Modern Sidebar -->
// //       <app-modern-sidebar></app-modern-sidebar>

// //       <!-- Main Content Area -->
// //       <main class="transition-all duration-300 ease-in-out"
// //             [class.ml-64]="sidebarExpanded"
// //             [class.ml-16]="!sidebarExpanded">

// //         <!-- Top Header Bar -->
// //         <header class="bg-white border-b border-hospital-gray-200 shadow-sm sticky top-0 z-40">
// //           <div class="px-6 py-4">
// //             <div class="flex items-center justify-between">

// //               <!-- Page Title & Breadcrumb -->
// //               <div class="flex items-center space-x-4">
// //                 <h1 class="text-2xl font-bold text-hospital-gray-900">
// //                   {{ currentPageTitle }}
// //                 </h1>
// //                 <nav class="hidden md:flex" aria-label="Breadcrumb">
// //                   <ol class="flex items-center space-x-2 text-sm">
// //                     <li>
// //                       <a routerLink="/app/dashboard" class="text-hospital-gray-500 hover:text-hospital-primary">
// //                         Inicio
// //                       </a>
// //                     </li>
// //                     <li class="flex items-center">
// //                       <svg class="w-4 h-4 mx-2 text-hospital-gray-400" fill="currentColor" viewBox="0 0 20 20">
// //                         <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
// //                       </svg>
// //                       <span class="text-hospital-gray-700">{{ currentPageTitle }}</span>
// //                     </li>
// //                   </ol>
// //                 </nav>
// //               </div>

// //               <!-- Header Actions -->
// //               <div class="flex items-center space-x-4">

// //                 <!-- Quick Actions -->
// //                 <div class="hidden lg:flex items-center space-x-2">
// //                   <button class="btn-hospital bg-hospital-primary text-white hover:bg-hospital-primary-dark">
// //                     <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
// //                     </svg>
// //                     Nuevo Paciente
// //                   </button>

// //                   <button class="btn-hospital bg-hospital-success text-white hover:bg-hospital-success-dark">
// //                     <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
// //                     </svg>
// //                     Nuevo Expediente
// //                   </button>
// //                 </div>

// //                 <!-- Notifications -->
// //                 <div class="relative">
// //                   <button class="p-2 text-hospital-gray-600 hover:text-hospital-primary hover:bg-hospital-gray-100 rounded-lg transition-all duration-200 relative">
// //                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
// //                     </svg>
// //                     <!-- Badge de notificaciones -->
// //                     <span class="absolute -top-1 -right-1 bg-hospital-emergency text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
// //                       3
// //                     </span>
// //                   </button>
// //                 </div>

// //                 <!-- System Status -->
// //                 <div class="hidden md:flex items-center space-x-2 px-3 py-2 bg-hospital-success bg-opacity-10 border border-hospital-success border-opacity-20 rounded-lg">
// //                   <div class="w-2 h-2 bg-hospital-success rounded-full animate-pulse"></div>
// //                   <span class="text-xs text-hospital-success font-medium">Sistema Operativo</span>
// //                 </div>

// //                 <!-- User Profile -->
// //                 <div class="relative">
// //                   <button class="flex items-center space-x-3 p-2 text-hospital-gray-700 hover:bg-hospital-gray-100 rounded-lg transition-all duration-200">
// //                     <div class="w-8 h-8 bg-gradient-to-br from-hospital-primary to-hospital-info rounded-full flex items-center justify-center">
// //                       <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
// //                       </svg>
// //                     </div>
// //                     <div class="hidden lg:block text-left">
// //                       <p class="text-sm font-medium">Dr. Administrador</p>
// //                       <p class="text-xs text-hospital-gray-500">Hospital General</p>
// //                     </div>
// //                     <svg class="w-4 h-4 text-hospital-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
// //                     </svg>
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </header>

// //         <!-- Page Content -->
// //         <div class="p-6">
// //           <router-outlet></router-outlet>
// //         </div>

// //         <!-- Footer -->
// //         <footer class="bg-white border-t border-hospital-gray-200 mt-12">
// //           <div class="px-6 py-4">
// //             <div class="flex flex-col md:flex-row justify-between items-center">
// //               <div class="text-sm text-hospital-gray-600">
// //                 © 2025 CICEG-HG - Sistema de Expediente Clínico Electrónico
// //               </div>
// //               <div class="flex items-center space-x-4 mt-2 md:mt-0">
// //                 <span class="text-xs text-hospital-gray-500">Hospital General San Luis de la Paz, Guanajuato</span>
// //                 <div class="flex items-center space-x-1">
// //                   <div class="w-2 h-2 bg-hospital-success rounded-full animate-pulse"></div>
// //                   <span class="text-xs text-hospital-success">Online</span>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </footer>
// //       </main>
// //     </div>
// //   `,
// //   styles: [`
// //     /* Animaciones personalizadas */
// //     @keyframes fadeIn {
// //       from { opacity: 0; transform: translateY(-10px); }
// //       to { opacity: 1; transform: translateY(0); }
// //     }

// //     .animate-fade-in {
// //       animation: fadeIn 0.3s ease-out;
// //     }

// //     /* Scrollbar personalizado */
// //     ::-webkit-scrollbar {
// //       width: 6px;
// //     }

// //     ::-webkit-scrollbar-track {
// //       background: transparent;
// //     }

// //     ::-webkit-scrollbar-thumb {
// //       background: rgba(156, 163, 175, 0.5);
// //       border-radius: 3px;
// //     }

// //     ::-webkit-scrollbar-thumb:hover {
// //       background: rgba(156, 163, 175, 0.7);
// //     }
// //   `]
// // })
// // export class DashboardLayoutComponent implements OnInit {
// //   sidebarExpanded = true;
// //   currentPageTitle = 'Dashboard';

// //   constructor() {}

// //   ngOnInit(): void {
// //     // Escuchar cambios de ruta para actualizar el título
// //     this.updatePageTitle();
// //   }

// //   private updatePageTitle(): void {
// //     // Lógica para actualizar el título basado en la ruta actual
// //     const path = window.location.pathname;

// //     if (path.includes('dashboard')) {
// //       this.currentPageTitle = 'Dashboard';
// //     } else if (path.includes('pacientes')) {
// //       this.currentPageTitle = 'Gestión de Pacientes';
// //     } else if (path.includes('expedientes')) {
// //       this.currentPageTitle = 'Expedientes Clínicos';
// //     } else if (path.includes('catalogos')) {
// //       this.currentPageTitle = 'Catálogos';
// //     } else {
// //       this.currentPageTitle = 'Panel de Control';
// //     }
// //   }
// // }


















// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';

// interface QuickAction {
//   title: string;
//   description: string;
//   href: string;
//   icon: string;
//   color: string;
//   badge?: string;
// }

// interface RecentActivity {
//   id: string;
//   type: string;
//   patient: string;
//   status: string;
//   time: string;
//   priority: 'low' | 'medium' | 'high';
// }

// interface StatCard {
//   title: string;
//   value: string;
//   change: string;
//   trend: 'up' | 'down' | 'stable';
//   icon: string;
//   color: string;
// }

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   template: `
//     <div class="space-y-8">

//       <!-- Header de Bienvenida -->
//       <div class="card-hospital bg-gradient-to-l from-hospital-primary to-hospital-info text-white">
//         <div class="flex items-center justify-between">
//           <div>
//             <h1 class="text-3xl font-bold mb-2">
//               Bienvenido, {{ user.nombre }} {{ user.apellido_paterno }}
//             </h1>
//             <p class="text-hospital-primary-light opacity-90">
//               Panel de control del Sistema de Expediente Clínico Electrónico
//             </p>
//             <div class="flex items-center mt-4 space-x-4">
//               <div class="flex items-center space-x-2">
//                 <div class="w-2 h-2 bg-hospital-success rounded-full animate-pulse"></div>
//                 <span class="text-sm">Sistema </span>
//               </div>
//               <div class="text-sm opacity-75">
//                 Último acceso: {{ lastAccess }}
//               </div>
//             </div>
//           </div>
//           <div class="hidden lg:block">
//             <svg class="w-24 h-24 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
//                     d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
//             </svg>
//           </div>
//         </div>
//       </div>

//       <!-- Estadísticas Principales -->
//       <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div *ngFor="let stat of statistics; trackBy: trackByTitle"
//              class="card-hospital hover:shadow-card-hover transition-all duration-300 cursor-pointer group">
//           <div class="flex items-center justify-between">
//             <div>
//               <p class="text-sm font-medium text-hospital-gray-600 mb-1">{{ stat.title }}</p>
//               <p class="text-3xl font-bold text-hospital-gray-900">{{ stat.value }}</p>
//               <div class="flex items-center mt-2">
//                 <svg class="w-4 h-4 mr-1"
//                      [class.text-hospital-success]="stat.trend === 'up'"
//                      [class.text-hospital-emergency]="stat.trend === 'down'"
//                      [class.text-hospital-gray-400]="stat.trend === 'stable'"
//                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
//                         [attr.d]="getTrendIcon(stat.trend)"/>
//                 </svg>
//                 <span class="text-sm font-medium"
//                       [class.text-hospital-success]="stat.trend === 'up'"
//                       [class.text-hospital-emergency]="stat.trend === 'down'"
//                       [class.text-hospital-gray-400]="stat.trend === 'stable'">
//                   {{ stat.change }}
//                 </span>
//               </div>
//             </div>
//             <div class="p-3 rounded-full group-hover:scale-110 transition-transform duration-300"
//                  [class]="'bg-' + stat.color + '-100'">
//               <svg class="w-8 h-8" [class]="'text-' + stat.color + '-600'"
//                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="stat.icon"/>
//               </svg>
//             </div>
//           </div>
//         </div>
//       </div>

//       <!-- Contenido Principal -->
//       <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

//         <!-- Acciones Rápidas -->
//         <div class="card-hospital">
//           <div class="flex items-center justify-between mb-6">
//             <h2 class="text-xl font-semibold text-hospital-gray-900">Acciones Rápidas</h2>
//             <svg class="w-5 h-5 text-hospital-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
//             </svg>
//           </div>
//           <p class="text-sm text-hospital-gray-500 mb-6">Accesos directos a funciones frecuentes</p>

//           <div class="space-y-4">
//             <div *ngFor="let action of quickActions; trackBy: trackByTitle"
//                  class="group">
//               <a [routerLink]="action.href"
//                  class="flex items-center p-4 border-2 border-hospital-gray-200 rounded-lg hover:border-hospital-primary hover:bg-hospital-primary hover:bg-opacity-5 transition-all duration-300 group">

//                 <div class="p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300"
//                      [class]="'bg-' + action.color + '-100'">
//                   <svg class="w-6 h-6" [class]="'text-' + action.color + '-600'"
//                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="action.icon"/>
//                   </svg>
//                 </div>

//                 <div class="flex-1">
//                   <div class="flex items-center justify-between">
//                     <h3 class="font-semibold text-hospital-gray-900 group-hover:text-hospital-primary transition-colors">
//                       {{ action.title }}
//                     </h3>
//                     <span *ngIf="action.badge"
//                           class="px-2 py-1 text-xs font-medium bg-hospital-emergency text-white rounded-full">
//                       {{ action.badge }}
//                     </span>
//                   </div>
//                   <p class="text-sm text-hospital-gray-600 mt-1">{{ action.description }}</p>
//                 </div>

//                 <svg class="w-5 h-5 text-hospital-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
//                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
//                 </svg>
//               </a>
//             </div>
//           </div>
//         </div>

//         <!-- Actividad Reciente -->
//         <div class="lg:col-span-2 card-hospital">
//           <div class="flex items-center justify-between mb-6">
//             <h2 class="text-xl font-semibold text-hospital-gray-900">Actividad Reciente</h2>
//             <button class="text-sm text-hospital-primary hover:text-hospital-primary-dark font-medium">
//               Ver todo
//             </button>
//           </div>
//           <p class="text-sm text-hospital-gray-500 mb-6">Últimas acciones realizadas en el sistema</p>

//           <div class="space-y-4">
//             <div *ngFor="let activity of recentActivities; trackBy: trackById"
//                  class="flex items-center justify-between p-4 bg-hospital-gray-50 rounded-lg hover:bg-hospital-gray-100 transition-colors duration-200">

//               <div class="flex items-center space-x-4">
//                 <!-- Priority Indicator -->
//                 <div class="w-1 h-12 rounded-full"
//                      [class.bg-hospital-success]="activity.priority === 'low'"
//                      [class.bg-hospital-warning]="activity.priority === 'medium'"
//                      [class.bg-hospital-emergency]="activity.priority === 'high'">
//                 </div>

//                 <div class="flex-1">
//                   <div class="flex items-center space-x-2 mb-1">
//                     <span class="font-semibold text-hospital-gray-900">{{ activity.type }}</span>
//                     <span class="px-2 py-1 text-xs font-medium rounded-full"
//                           [class]="getStatusClasses(activity.status)">
//                       {{ activity.status }}
//                     </span>
//                   </div>
//                   <p class="text-sm text-hospital-gray-600">{{ activity.patient }}</p>
//                 </div>
//               </div>

//               <div class="text-right">
//                 <p class="text-xs text-hospital-gray-500">{{ activity.time }}</p>
//                 <button class="text-hospital-primary hover:text-hospital-primary-dark text-sm font-medium mt-1">
//                   Ver detalles
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <!-- Gráficos y Métricas Adicionales -->
//       <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

//         <!-- Ocupación de Camas -->
//         <div class="card-hospital">
//           <h3 class="text-lg font-semibold text-hospital-gray-900 mb-4">Ocupación de Camas</h3>
//           <div class="space-y-4">
//             <div class="flex items-center justify-between">
//               <span class="text-sm text-hospital-gray-600">Camas Ocupadas</span>
//               <span class="font-semibold text-hospital-gray-900">12 / 20</span>
//             </div>
//             <div class="w-full bg-hospital-gray-200 rounded-full h-2">
//               <div class="bg-hospital-warning h-2 rounded-full transition-all duration-500" style="width: 60%"></div>
//             </div>
//             <div class="grid grid-cols-3 gap-4 text-center">
//               <div>
//                 <p class="text-lg font-semibold text-hospital-success">8</p>
//                 <p class="text-xs text-hospital-gray-500">Disponibles</p>
//               </div>
//               <div>
//                 <p class="text-lg font-semibold text-hospital-warning">12</p>
//                 <p class="text-xs text-hospital-gray-500">Ocupadas</p>
//               </div>
//               <div>
//                 <p class="text-lg font-semibold text-hospital-emergency">2</p>
//                 <p class="text-xs text-hospital-gray-500">Mantenimiento</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <!-- Próximas Citas -->
//         <div class="card-hospital">
//           <h3 class="text-lg font-semibold text-hospital-gray-900 mb-4">Próximas Citas</h3>
//           <div class="space-y-3">
//             <div *ngFor="let appointment of upcomingAppointments"
//                  class="flex items-center justify-between p-3 bg-hospital-gray-50 rounded-lg">
//               <div class="flex items-center space-x-3">
//                 <div class="w-2 h-2 bg-hospital-primary rounded-full"></div>
//                 <div>
//                   <p class="font-medium text-hospital-gray-900">{{ appointment.patient }}</p>
//                   <p class="text-sm text-hospital-gray-600">{{ appointment.type }}</p>
//                 </div>
//               </div>
//               <div class="text-right">
//                 <p class="text-sm font-medium text-hospital-gray-900">{{ appointment.time }}</p>
//                 <p class="text-xs text-hospital-gray-500">{{ appointment.doctor }}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .card-hospital {
//       @apply bg-white rounded-xl shadow-sm border border-hospital-gray-200 p-6 transition-all duration-200;
//     }

//     .card-hospital:hover {
//       @apply shadow-md border-hospital-gray-300;
//     }
//   `]
// })
// export class Dashboard implements OnInit {
//   user = {
//     nombre: 'Dr. Administrador',
//     apellido_paterno: 'Sistema'
//   };

//   lastAccess = 'Hoy 08:30 AM';

//   statistics: StatCard[] = [
//     {
//       title: 'Pacientes Activos',
//       value: '142',
//       change: '+12% vs mes anterior',
//       trend: 'up',
//       icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
//       color: 'hospital-primary'
//     },
//     {
//       title: 'Expedientes Nuevos',
//       value: '23',
//       change: '+5% esta semana',
//       trend: 'up',
//       icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
//       color: 'hospital-success'
//     },
//     {
//       title: 'Camas Ocupadas',
//       value: '12/20',
//       change: '60% ocupación',
//       trend: 'stable',
//       icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z',
//       color: 'hospital-warning'
//     },
//     {
//       title: 'Personal Médico',
//       value: '45',
//       change: '+2 este mes',
//       trend: 'up',
//       icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
//       color: 'hospital-info'
//     }
//   ];

//   quickActions: QuickAction[] = [
//     {
//       title: 'Nuevo Paciente',
//       description: 'Registrar un nuevo paciente en el sistema',
//       href: '/app/personas/pacientes',
//       icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
//       color: 'hospital-primary',
//       badge: 'Frecuente'
//     },
//     {
//       title: 'Crear Expediente',
//       description: 'Generar un nuevo expediente clínico',
//       href: '/app/gestion-expedientes/expedientes',
//       icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
//       color: 'hospital-success'
//     },
//     {
//       title: 'Gestionar Camas',
//       description: 'Administrar ocupación de camas',
//       href: '/app/gestion-expedientes/camas',
//       icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z',
//       color: 'hospital-warning'
//     },
//     {
//       title: 'Reportes',
//       description: 'Generar reportes y estadísticas',
//       href: '/app/reportes',
//       icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
//       color: 'hospital-info'
//     }
//   ];

//   recentActivities: RecentActivity[] = [
//     {
//       id: '1',
//       type: 'Nuevo Paciente Registrado',
//       patient: 'María González López - CURP: GOLM890123MGTLPR01',
//       status: 'Completado',
//       time: 'Hace 5 minutos',
//       priority: 'high'
//     },
//     {
//       id: '2',
//       type: 'Expediente Actualizado',
//       patient: 'Carlos Rodríguez Pérez - CURP: ROPC850415HGTDRL02',
//       status: 'En Proceso',
//       time: 'Hace 15 minutos',
//       priority: 'medium'
//     },
//     {
//       id: '3',
//       type: 'Alta Médica',
//       patient: 'Ana Martínez Sánchez - CURP: MASA920308MGTRNR03',
//       status: 'Completado',
//       time: 'Hace 30 minutos',
//       priority: 'low'
//     },
//     {
//       id: '4',
//       type: 'Internamiento',
//       patient: 'José Luis Hernández - CURP: HELJ770620HGTRSF04',
//       status: 'Activo',
//       time: 'Hace 1 hora',
//       priority: 'high'
//     }
//   ];

//   upcomingAppointments = [
//     {
//       patient: 'Patricia Ruiz',
//       type: 'Consulta General',
//       time: '10:30 AM',
//       doctor: 'Dr. Martínez'
//     },
//     {
//       patient: 'Roberto García',
//       type: 'Seguimiento',
//       time: '11:15 AM',
//       doctor: 'Dra. López'
//     },
//     {
//       patient: 'Elena Morales',
//       type: 'Urgencia',
//       time: '12:00 PM',
//       doctor: 'Dr. Ramírez'
//     }
//   ];

//   constructor() {}

//   ngOnInit(): void {
//     // Inicialización del componente
//   }

//   getTrendIcon(trend: string): string {
//     switch(trend) {
//       case 'up': return 'M7 14l9-9 9 9';
//       case 'down': return 'M17 14l-9-9-9 9';
//       case 'stable': return 'M5 12h14';
//       default: return 'M5 12h14';
//     }
//   }

//   getStatusClasses(status: string): string {
//     const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
//     switch(status) {
//       case 'Completado':
//         return `${baseClasses} bg-hospital-success bg-opacity-10 text-hospital-success`;
//       case 'En Proceso':
//         return `${baseClasses} bg-hospital-warning bg-opacity-10 text-hospital-warning`;
//       case 'Activo':
//         return `${baseClasses} bg-hospital-primary bg-opacity-10 text-hospital-primary`;
//       default:
//         return `${baseClasses} bg-hospital-gray-100 text-hospital-gray-600`;
//     }
//   }

//   trackByTitle(index: number, item: any): string {
//     return item.title;
//   }

//   trackById(index: number, item: any): string {
//     return item.id;
//   }
// }







































import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
  badge?: string;
}

interface RecentActivity {
  id: string;
  type: string;
  patient: string;
  status: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  user = {
    nombre: 'Dr. Administrador',
    apellido_paterno: 'Sistema'
  };

  lastAccess = 'Hoy 08:30 AM';

  statistics: StatCard[] = [
    {
      title: 'Pacientes Activos',
      value: '142',
      change: '+12% vs mes anterior',
      trend: 'up',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      color: 'blue'
    },
    {
      title: 'Expedientes Nuevos',
      value: '23',
      change: '+5% esta semana',
      trend: 'up',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'emerald'
    },
    {
      title: 'Camas Ocupadas',
      value: '12/20',
      change: '60% ocupación',
      trend: 'stable',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z',
      color: 'amber'
    },
    {
      title: 'Personal Médico',
      value: '45',
      change: '+2 este mes',
      trend: 'up',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      color: 'indigo'
    }
  ];

  quickActions: QuickAction[] = [
    {
      title: 'Nuevo Paciente',
      description: 'Registrar un nuevo paciente en el sistema',
      href: '/app/personas/pacientes',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      color: 'blue',
      badge: 'Frecuente'
    },
    {
      title: 'Crear Expediente',
      description: 'Generar un nuevo expediente clínico',
      href: '/app/gestion-expedientes/expedientes',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'emerald'
    },
    {
      title: 'Gestionar Camas',
      description: 'Administrar ocupación de camas',
      href: '/app/gestion-expedientes/camas',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z',
      color: 'amber'
    },
    {
      title: 'Reportes',
      description: 'Generar reportes y estadísticas',
      href: '/app/reportes',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      color: 'indigo'
    }
  ];

  recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'Nuevo Paciente Registrado',
      patient: 'María González López - CURP: GOLM890123MGTLPR01',
      status: 'Completado',
      time: 'Hace 5 minutos',
      priority: 'high'
    },
    {
      id: '2',
      type: 'Expediente Actualizado',
      patient: 'Carlos Rodríguez Pérez - CURP: ROPC850415HGTDRL02',
      status: 'En Proceso',
      time: 'Hace 15 minutos',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'Alta Médica',
      patient: 'Ana Martínez Sánchez - CURP: MASA920308MGTRNR03',
      status: 'Completado',
      time: 'Hace 30 minutos',
      priority: 'low'
    },
    {
      id: '4',
      type: 'Internamiento',
      patient: 'José Luis Hernández - CURP: HELJ770620HGTRSF04',
      status: 'Activo',
      time: 'Hace 1 hora',
      priority: 'high'
    }
  ];

  upcomingAppointments = [
    {
      patient: 'Patricia Ruiz',
      type: 'Consulta General',
      time: '10:30 AM',
      doctor: 'Dr. Martínez'
    },
    {
      patient: 'Roberto García',
      type: 'Seguimiento',
      time: '11:15 AM',
      doctor: 'Dra. López'
    },
    {
      patient: 'Elena Morales',
      type: 'Urgencia',
      time: '12:00 PM',
      doctor: 'Dr. Ramírez'
    }
  ];

  constructor() {}

  ngOnInit(): void {
    // Inicialización del componente
    console.log('Dashboard del CICEG-HG inicializado correctamente');
  }

  getTrendIcon(trend: string): string {
    switch(trend) {
      case 'up': return 'M7 14l9-9 9 9';
      case 'down': return 'M17 14l-9-9-9 9';
      case 'stable': return 'M5 12h14';
      default: return 'M5 12h14';
    }
  }

  getStatusClasses(status: string): string {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch(status) {
      case 'Completado':
        return `${baseClasses} bg-emerald-50 text-emerald-700`;
      case 'En Proceso':
        return `${baseClasses} bg-amber-50 text-amber-700`;
      case 'Activo':
        return `${baseClasses} bg-blue-50 text-blue-700`;
      default:
        return `${baseClasses} bg-stone-100 text-stone-600`;
    }
  }

  trackByTitle(index: number, item: any): string {
    return item.title;
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  // Métodos adicionales para la funcionalidad del dashboard
  refreshData(): void {
    console.log('Actualizando datos del dashboard...');
    // Aquí podrías llamar servicios para actualizar los datos
  }

  navigateToSection(section: string): void {
    console.log(`Navegando a la sección: ${section}`);
    // Lógica de navegación
  }

  exportReport(type: string): void {
    console.log(`Exportando reporte: ${type}`);
    // Lógica para exportar reportes
  }
}
