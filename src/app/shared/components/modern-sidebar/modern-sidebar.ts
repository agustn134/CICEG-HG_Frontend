// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-modern-sidebar',
//   imports: [],
//   templateUrl: './modern-sidebar.html',
//   styleUrl: './modern-sidebar.css'
// })
// export class ModernSidebar {

// }
// import { Component, OnInit, HostListener } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';

// interface MenuItem {
//   name: string;
//   path: string;
//   icon: string;
//   badge?: string;
//   badgeColor?: string;
// }

// interface MenuSection {
//   title: string;
//   icon: string;
//   items: MenuItem[];
//   isExpanded?: boolean;
// }

// @Component({
//   selector: 'app-modern-sidebar',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   template: `
//     <!-- Sidebar Container -->
//     <div class="fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out"
//          [class.w-64]="isExpanded"
//          [class.w-16]="!isExpanded">

//       <!-- Sidebar Content -->
//       <div class="h-full bg-gradient-to-b from-hospital-gray-900 to-hospital-gray-800 border-r border-hospital-gray-700 shadow-2xl">

//         <!-- Header Logo -->
//         <div class="p-4 border-b border-hospital-gray-700">
//           <div class="flex items-center space-x-3">
//             <div class="w-8 h-8 bg-gradient-to-br from-hospital-primary to-hospital-info rounded-lg flex items-center justify-center flex-shrink-0">
//               <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
//                       d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
//               </svg>
//             </div>
//             <div class="transition-all duration-300" [class.opacity-0]="!isExpanded" [class.w-0]="!isExpanded" [class.overflow-hidden]="!isExpanded">
//               <h1 class="text-white font-bold text-lg whitespace-nowrap">CICEG-HG</h1>
//               <p class="text-hospital-gray-400 text-xs whitespace-nowrap">Hospital General</p>
//             </div>
//           </div>
//         </div>

//         <!-- Toggle Button -->
//         <div class="p-4 border-b border-hospital-gray-700">
//           <button
//             (click)="toggleSidebar()"
//             class="w-full flex items-center justify-center p-2 text-hospital-gray-400 hover:text-white hover:bg-hospital-gray-700 rounded-lg transition-all duration-200">
//             <svg class="w-5 h-5 transition-transform duration-300"
//                  [class.rotate-180]="!isExpanded"
//                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
//             </svg>
//             <span class="ml-2 transition-all duration-300"
//                   [class.opacity-0]="!isExpanded"
//                   [class.w-0]="!isExpanded"
//                   [class.overflow-hidden]="!isExpanded">
//               Contraer
//             </span>
//           </button>
//         </div>

//         <!-- Navigation Menu -->
//         <nav class="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
//           <!-- Dashboard Quick Access -->
//           <a routerLink="/app/dashboard"
//              routerLinkActive="bg-hospital-primary text-white shadow-lg"
//              class="flex items-center p-3 text-hospital-gray-300 hover:text-white hover:bg-hospital-gray-700 rounded-lg transition-all duration-200 group">
//             <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
//                     d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
//             </svg>
//             <span class="ml-3 transition-all duration-300"
//                   [class.opacity-0]="!isExpanded"
//                   [class.w-0]="!isExpanded"
//                   [class.overflow-hidden]="!isExpanded">
//               Dashboard
//             </span>
//           </a>

//           <!-- Menu Sections -->
//           <div *ngFor="let section of menuSections; trackBy: trackByTitle" class="space-y-1">
//             <!-- Section Header -->
//             <button
//               (click)="toggleSection(section.title)"
//               class="w-full flex items-center justify-between p-3 text-hospital-gray-300 hover:text-white hover:bg-hospital-gray-700 rounded-lg transition-all duration-200 group">

//               <div class="flex items-center">
//                 <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="section.icon"/>
//                 </svg>
//                 <span class="ml-3 font-medium transition-all duration-300"
//                       [class.opacity-0]="!isExpanded"
//                       [class.w-0]="!isExpanded"
//                       [class.overflow-hidden]="!isExpanded">
//                   {{ section.title }}
//                 </span>
//               </div>

//               <svg class="w-4 h-4 transition-transform duration-300 flex-shrink-0"
//                    [class.rotate-90]="section.isExpanded && isExpanded"
//                    [class.opacity-0]="!isExpanded"
//                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
//               </svg>
//             </button>

//             <!-- Section Items -->
//             <div *ngIf="section.isExpanded && isExpanded"
//                  class="ml-4 space-y-1 animate-fade-in">
//               <a *ngFor="let item of section.items; trackBy: trackByPath"
//                  [routerLink]="item.path"
//                  routerLinkActive="bg-hospital-primary text-white shadow-md border-l-4 border-hospital-primary-light"
//                  class="flex items-center justify-between p-2 pl-4 text-sm text-hospital-gray-400 hover:text-white hover:bg-hospital-gray-700 rounded-lg transition-all duration-200 group">

//                 <div class="flex items-center">
//                   <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon"/>
//                   </svg>
//                   <span class="ml-2 font-medium">{{ item.name }}</span>
//                 </div>

//                 <!-- Badge -->
//                 <span *ngIf="item.badge"
//                       class="px-2 py-1 text-xs rounded-full"
//                       [class]="getBadgeClasses(item.badgeColor)">
//                   {{ item.badge }}
//                 </span>
//               </a>
//             </div>
//           </div>
//         </nav>

//         <!-- User Profile Section -->
//         <div class="p-4 border-t border-hospital-gray-700">
//           <div class="flex items-center space-x-3 p-3 bg-hospital-gray-800 rounded-lg">
//             <div class="w-8 h-8 bg-gradient-to-br from-hospital-success to-hospital-info rounded-full flex items-center justify-center flex-shrink-0">
//               <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
//               </svg>
//             </div>
//             <div class="transition-all duration-300"
//                  [class.opacity-0]="!isExpanded"
//                  [class.w-0]="!isExpanded"
//                  [class.overflow-hidden]="!isExpanded">
//               <p class="text-white font-medium text-sm">Dr. Admin</p>
//               <p class="text-hospital-gray-400 text-xs">Sistema Activo</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>

//     <!-- Overlay para móvil -->
//     <div *ngIf="isExpanded && isMobile"
//          (click)="closeSidebar()"
//          class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"></div>
//   `,
//   styles: [`
//     .custom-scrollbar::-webkit-scrollbar {
//       width: 4px;
//     }
//     .custom-scrollbar::-webkit-scrollbar-track {
//       background: transparent;
//     }
//     .custom-scrollbar::-webkit-scrollbar-thumb {
//       background: rgba(75, 85, 99, 0.5);
//       border-radius: 2px;
//     }
//     .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//       background: rgba(75, 85, 99, 0.7);
//     }
//   `]
// })
// export class ModernSidebarComponent implements OnInit {
//   isExpanded = true;
//   isMobile = false;

//   menuSections: MenuSection[] = [
//     {
//       title: 'Catálogos',
//       icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
//       isExpanded: false,
//       items: [
//         { name: 'Servicios', path: '/app/catalogos/servicios', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
//         { name: 'Áreas de Interconsulta', path: '/app/catalogos/areas-interconsulta', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
//         { name: 'Guías Clínicas', path: '/app/catalogos/guias-clinicas', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
//         { name: 'Estudios Médicos', path: '/app/catalogos/estudios-medicos', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
//         { name: 'Medicamentos', path: '/app/catalogos/medicamentos', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', badge: 'New' },
//         { name: 'Tipos de Sangre', path: '/app/catalogos/tipos-sangre', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
//         { name: 'Tipos de Documento', path: '/app/catalogos/tipos-documento', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
//       ]
//     },
//     {
//       title: 'Personas',
//       icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
//       isExpanded: false,
//       items: [
//         { name: 'Pacientes', path: '/app/personas/pacientes', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', badge: '142', badgeColor: 'blue' },
//         { name: 'Lista de Pacientes', path: '/app/personas/pacientes-list', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
//         { name: 'Personal Médico', path: '/app/personas/personal-medico', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', badge: '23', badgeColor: 'green' },
//         { name: 'Administradores', path: '/app/personas/administradores', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', badge: '5', badgeColor: 'purple' }
//       ]
//     },
//     {
//       title: 'Gestión de Expedientes',
//       icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
//       isExpanded: false,
//       items: [
//         { name: 'Expedientes', path: '/app/gestion-expedientes/expedientes', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z', badge: 'Hot', badgeColor: 'red' },
//         { name: 'Camas', path: '/app/gestion-expedientes/camas', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z', badge: '12/20', badgeColor: 'yellow' },
//         { name: 'Internamientos', path: '/app/gestion-expedientes/internamientos', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
//         { name: 'Signos Vitales', path: '/app/gestion-expedientes/signos-vitales', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' }
//       ]
//     },
//     {
//       title: 'Documentos Clínicos',
//       icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
//       isExpanded: false,
//       items: [
//         { name: 'Documentos', path: '/app/documentos-clinicos/documentos', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
//         { name: 'Historias Clínicas', path: '/app/documentos-clinicos/historias-clinicas', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
//         { name: 'Notas de Urgencias', path: '/app/documentos-clinicos/notas-urgencias', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', badge: 'Urgent', badgeColor: 'red' }
//       ]
//     }
//   ];

//   constructor() {}

//   ngOnInit(): void {
//     this.checkScreenSize();
//   }

//   // 🔧 CORRECCIÓN: Remover el parámetro del HostListener
//   @HostListener('window:resize')
//   onResize(): void {
//     this.checkScreenSize();
//   }

//   checkScreenSize(): void {
//     this.isMobile = window.innerWidth < 1024;
//     if (this.isMobile) {
//       this.isExpanded = false;
//     }
//   }

//   toggleSidebar(): void {
//     this.isExpanded = !this.isExpanded;
//   }

//   closeSidebar(): void {
//     if (this.isMobile) {
//       this.isExpanded = false;
//     }
//   }

//   toggleSection(title: string): void {
//     if (!this.isExpanded) {
//       this.isExpanded = true;
//     }

//     const section = this.menuSections.find(s => s.title === title);
//     if (section) {
//       section.isExpanded = !section.isExpanded;
//     }
//   }

//   getBadgeClasses(color?: string): string {
//     const baseClasses = 'px-2 py-1 text-xs rounded-full font-medium';
//     switch (color) {
//       case 'red':
//         return `${baseClasses} bg-hospital-emergency text-white`;
//       case 'blue':
//         return `${baseClasses} bg-hospital-primary text-white`;
//       case 'green':
//         return `${baseClasses} bg-hospital-success text-white`;
//       case 'yellow':
//         return `${baseClasses} bg-hospital-warning text-white`;
//       case 'purple':
//         return `${baseClasses} bg-purple-500 text-white`;
//       default:
//         return `${baseClasses} bg-hospital-gray-600 text-white`;
//     }
//   }

//   trackByTitle(index: number, section: MenuSection): string {
//     return section.title;
//   }

//   trackByPath(index: number, item: MenuItem): string {
//     return item.path;
//   }
// }


































import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface MenuItem {
  name: string;
  path: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

interface MenuSection {
  title: string;
  icon: string;
  items: MenuItem[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-modern-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './modern-sidebar.html',
  styles: [`

    :root {
    --sidebar-primary: rgb(59 130 246);     /* blue-500 */
    --sidebar-primary-dark: rgb(37 99 235); /* blue-600 */
    --sidebar-primary-light: rgb(96 165 250); /* blue-400 */
    --sidebar-primary-bg: rgb(239 246 255);   /* blue-50 */
    --sidebar-primary-hover: rgb(219 234 254); /* blue-100 */
  }

  /* Luego usa las variables */
  .bg-primary { background-color: var(--sidebar-primary); }
  .text-primary { color: var(--sidebar-primary); }
  /* etc... */

    /* Custom scrollbar para el sidebar */
    ::-webkit-scrollbar {
      width: 4px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(156, 163, 175, 0.3);
      border-radius: 2px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(156, 163, 175, 0.5);
    }

    /* Animación suave para dropdown */
    .space-y-1 > * {
      animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class ModernSidebarComponent implements OnInit {
  isMobileMenuOpen = false;

  menuSections: MenuSection[] = [
    {
      title: 'Pacientes',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      isExpanded: false,
      items: [
        {
          name: 'Buscar Pacientes',
          path: '/app/personas/pacientes',
          icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
          badge: '142',
          badgeColor: 'gray'
        },
        {
          name: 'Nuevo Paciente',
          path: '/app/personas/pacientes/nuevo',
          icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
        },
        {
          name: 'Lista de Pacientes',
          path: '/app/personas/pacientes-list',
          icon: 'M4 6h16M4 10h16M4 14h16M4 18h16'
        },
      ]
    },
    {
      title: 'Expedientes',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      isExpanded: false,
      items: [
        {
          name: 'Ver Expedientes',
          path: '/app/gestion-expedientes/expedientes',
          icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
          badge: 'Hot',
          badgeColor: 'red'
        },
        {
          name: 'Nuevo Expediente',
          path: '/app/gestion-expedientes/expedientes/nuevo',
          icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
        },
        {
          name: 'Camas',
          path: '/app/gestion-expedientes/camas',
          icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z',
          badge: '12/20',
          badgeColor: 'yellow'
        },
        {
          name: 'Internamientos',
          path: '/app/gestion-expedientes/internamientos',
          icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
        },
        {
          name: 'Signos Vitales',
          path: '/app/gestion-expedientes/signos-vitales',
          icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
        }
      ]
    },
    // {
    //   title: 'Documentos Clínicos',
    //   icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    //   isExpanded: false,
    //   items: [
    //     {
    //       name: 'Historia Clínica',
    //       path: '/app/documentos-clinicos/historias-clinicas',
    //       icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    //     },
    //     {
    //       name: 'Notas de Evolución',
    //       path: '/app/documentos-clinicos/notas-evolucion',
    //       icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
    //     },
    //     {
    //       name: 'Notas de Urgencias',
    //       path: '/app/documentos-clinicos/notas-urgencias',
    //       icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    //       badge: 'Urgent',
    //       badgeColor: 'red'
    //     },
    //     {
    //       name: 'Otros Documentos',
    //       path: '/app/documentos-clinicos/documentos',
    //       icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707L16.414 6.5a1 1 0 00-.707-.293H7a2 2 0 00-2 2v11a2 2 0 002 2z'
    //     },
    //   ]
    // },

{
  title: 'Documentos Clínicos',
  icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  isExpanded: false,
  items: [
    {
      name: 'Historia Clínica',
      path: '/app/documentos-clinicos/historias-clinicas',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    },
    {
      name: 'Notas de Urgencias',
      path: '/app/documentos-clinicos/notas-urgencias',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      badge: 'Urgent',
      badgeColor: 'red'
    },
    {
      name: 'Notas de Evolución',
      path: '/app/documentos-clinicos/notas-evolucion',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
    },
    {
      name: 'Notas de Interconsulta',
      path: '/app/documentos-clinicos/notas-interconsulta',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
    },
    {
      name: 'Notas Preoperatorias',
      path: '/app/documentos-clinicos/notas-preoperatoria',
      icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
    },
    {
      name: 'Notas Preanestésicas',
      path: '/app/documentos-clinicos/notas-preanestesica',
      icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
    },
    {
      name: 'Notas Postoperatorias',
      path: '/app/documentos-clinicos/notas-postoperatoria',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      name: 'Notas Postanestésicas',
      path: '/app/documentos-clinicos/notas-postanestesica',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      name: 'Notas de Egreso',
      path: '/app/documentos-clinicos/notas-egreso',
      icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
    },
    {
      name: 'Consentimientos Informados',
      path: '/app/documentos-clinicos/consentimientos-informados',
      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
    },
    {
      name: 'Solicitudes de Estudio',
      path: '/app/documentos-clinicos/solicitudes-estudio',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
    },
    {
      name: 'Referencias y Traslados',
      path: '/app/documentos-clinicos/referencias-traslado',
      icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m12 6H4m0 0l4 4m-4-4l4-4'
    },
    {
      name: 'Prescripciones de Medicamentos',
      path: '/app/documentos-clinicos/prescripciones-medicamento',
      icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
      badge: 'Recetas',
      badgeColor: 'green'
    },
    {
      name: 'Registros de Transfusión',
      path: '/app/documentos-clinicos/registros-transfusion',
      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      badge: 'Sangre',
      badgeColor: 'red'
    }
  ]
},
    {
      title: 'Catálogos',
      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      isExpanded: false,
      items: [
        {
          name: 'Servicios',
          path: '/app/catalogos/servicios',
          icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
        },
        {
          name: 'Medicamentos',
          path: '/app/catalogos/medicamentos',
          icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
          badge: 'New',
          badgeColor: 'green'
        },
        {
          name: 'Estudios Médicos',
          path: '/app/catalogos/estudios-medicos',
          icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
          name: 'Tipos de Sangre',
          path: '/app/catalogos/tipos-sangre',
          icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
        },
      ]
    },
    {
      title: 'Personal',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      isExpanded: false,
      items: [
        {
          name: 'Personal Médico',
          path: '/app/personas/personal-medico',
          icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
          badge: '23',
          badgeColor: 'green'
        },
        {
          name: 'Administradores',
          path: '/app/personas/administradores',
          icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
          badge: '5',
          badgeColor: 'purple'
        }
      ]
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Inicialización del componente
  }

  @HostListener('window:resize')
  onResize(): void {
    // Responsive handling si es necesario
  }

  toggleSection(title: string): void {
    const section = this.menuSections.find(s => s.title === title);
    if (section) {
      // Cerrar otras secciones (accordion behavior)
      this.menuSections.forEach(s => {
        if (s.title !== title) {
          s.isExpanded = false;
        }
      });

      // Toggle la sección actual
      section.isExpanded = !section.isExpanded;
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  isActiveRoute(path: string): boolean {
    return this.router.url === path;
  }

  getBadgeClasses(color?: string): string {
    const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
    switch (color) {
      case 'red':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'gray':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'green':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'yellow':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'purple':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  trackByTitle(index: number, section: MenuSection): string {
    return section.title;
  }

  trackByPath(index: number, item: MenuItem): string {
    return item.path;
  }
}
