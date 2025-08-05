import {
  Component,
  OnInit,
  HostListener,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs'; // 🆕 Agregar Subject y takeUntil
import { ConfiguracionService } from '../../../services/configuracion.service';
import {
  CONFIGURACION_DEFAULT,
  ConfiguracionLogos,
} from '../../../models/configuracion.model';
import { AuthService, Usuario } from '../../../services/auth/auth.service';

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
  template: `
    <!-- Overlay para móvil -->
    <div
      *ngIf="isMobileOpen"
      (click)="closeMobileSidebar()"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
    ></div>

    <!-- Modern Sidebar Container -->
    <aside
      class="flex h-full flex-col bg-white border-r border-gray-200 shadow-lg transition-all duration-300"
      [class.w-72]="!isCollapsed"
      [class.w-20]="isCollapsed"
      [class.fixed]="true"
      [class.left-0]="true"
      [class.top-0]="true"
      [class.z-50]="true"
      [class.translate-x-0]="isMobileOpen || !isMobile"
      [class.-translate-x-full]="!isMobileOpen && isMobile"
    >
      <!-- Header Logo Section -->
      <div
        class="flex items-center h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-800 to-blue-900"
      >
        <div class="flex items-center space-x-4 w-full">
          <!-- Logo Container -->
          <div
            class="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm p-2"
            [class.hidden]="isCollapsed"
          >
            <img
              [src]="configuracion.logo_sidebar"
              
              class="max-h-full max-w-full object-contain"
              [title]="configuracion.nombre_hospital"
            />
          </div>
          <!-- Hospital Info -->
          <div class="flex-1" [class.hidden]="isCollapsed">
            <h1 class="text-white font-bold text-lg tracking-wide">CICEG-HG</h1>
            <p class="text-white text-xs opacity-90 font-medium">
              San Luis de la Paz
            </p>
          </div>
          <!-- Collapse Button Desktop -->
          <button
            *ngIf="!isMobile"
            (click)="toggleCollapse()"
            class="hidden lg:flex p-1.5 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors duration-200"
          >
            <svg
              class="w-5 h-5 text-white transition-transform duration-200"
              [class.rotate-180]="isCollapsed"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            >
              <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Navigation Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Dashboard Principal -->
        <div class="px-4 pt-6 pb-4">
          <a
            routerLink="/app/dashboard"
            routerLinkActive="bg-blue-800 text-white shadow-md"
            #dashboardLink="routerLinkActive"
            class="nav-item group flex items-center px-4 py-3 text-sm font-semibold rounded-xl text-gray-700 hover:bg-gray-50 hover:text-blue-800 transition-all duration-200"
            [class.justify-center]="isCollapsed"
          >
            <div
              class="icon-container p-2 rounded-lg transition-all duration-200"
              [ngClass]="{
                'bg-gray-100 group-hover:bg-blue-100': !dashboardLink.isActive,
                'bg-blue-100': dashboardLink.isActive,
                'mr-3': !isCollapsed
              }"
            >
              <svg
                class="h-5 w-5 transition-colors duration-200"
                [ngClass]="{
                  'text-gray-500 group-hover:text-blue-800':
                    !dashboardLink.isActive,
                  'text-white': dashboardLink.isActive
                }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              >
                <path
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <span [class.hidden]="isCollapsed">Panel Principal</span>
            <!-- Tooltip for collapsed state -->
            <div *ngIf="isCollapsed" class="tooltip">Panel Principal</div>
          </a>
        </div>

        <!-- Navigation Sections -->
        <nav class="sidebar-scroll flex-1 px-4 pb-6 overflow-y-auto space-y-1">
          <div
            *ngFor="let section of menuSections; trackBy: trackByTitle"
            class="space-y-1"
          >
            <!-- Section Header -->
            <button
              (click)="toggleSection(section.title)"
              class="w-full group flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl text-gray-700 hover:bg-gray-50 hover:text-blue-800 transition-all duration-200"
              [ngClass]="{
                'bg-gray-50 text-blue-800': section.isExpanded && !isCollapsed,
                'justify-center': isCollapsed
              }"
            >
              <div class="flex items-center">
                <div
                  class="icon-container p-2 rounded-lg transition-all duration-200"
                  [ngClass]="{
                    'bg-gray-100': !section.isExpanded,
                    'bg-blue-100': section.isExpanded,
                    'mr-3': !isCollapsed
                  }"
                >
                  <svg
                    class="h-5 w-5 transition-colors duration-200"
                    [ngClass]="{
                      'text-gray-500': !section.isExpanded,
                      'text-blue-800': section.isExpanded
                    }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  >
                    <path [attr.d]="section.icon" />
                  </svg>
                </div>
                <span class="font-semibold" [class.hidden]="isCollapsed">{{
                  section.title
                }}</span>
              </div>

              <!-- Dropdown Arrow -->
              <div
                *ngIf="!isCollapsed"
                class="p-1 rounded-lg transition-all duration-200"
                [ngClass]="{
                  'bg-blue-100 rotate-90': section.isExpanded
                }"
              >
                <svg
                  class="h-4 w-4 transition-all duration-200"
                  [ngClass]="{
                    'text-gray-400': !section.isExpanded,
                    'text-blue-800': section.isExpanded
                  }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <!-- Tooltip for collapsed state -->
              <div *ngIf="isCollapsed" class="tooltip">
                {{ section.title }}
              </div>
            </button>

            <!-- Section Items (Submenu) -->
            <div
              *ngIf="section.isExpanded && !isCollapsed"
              class="dropdown-enter ml-4 mt-2 space-y-1 border-l-2 border-gray-100 pl-4"
            >
              <a
                *ngFor="let item of section.items; trackBy: trackByPath"
                [routerLink]="item.path"
                routerLinkActive="bg-blue-800 text-white shadow-sm"
                #itemLink="routerLinkActive"
                class="nav-item group flex items-center justify-between px-3 py-2.5 text-sm rounded-lg text-gray-600 hover:text-blue-800 hover:bg-gray-50 transition-all duration-200"
              >
                <div class="flex items-center">
                  <div
                    class="icon-container mr-3 p-1.5 rounded-md transition-all duration-200"
                    [ngClass]="{
                      'bg-gray-100 group-hover:bg-blue-100': !itemLink.isActive,
                      'bg-blue-100': itemLink.isActive
                    }"
                  >
                    <svg
                      class="h-4 w-4 transition-colors duration-200"
                      [ngClass]="{
                        'text-gray-400 group-hover:text-blue-800':
                          !itemLink.isActive,
                        'text-white': itemLink.isActive
                      }"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    >
                      <path [attr.d]="item.icon" />
                    </svg>
                  </div>
                  <span class="font-medium">{{ item.name }}</span>
                </div>

                <!-- Badge -->
                <span
                  *ngIf="item.badge"
                  [class]="getBadgeClasses(item.badgeColor)"
                >
                  {{ item.badge }}
                </span>
              </a>
            </div>
          </div>
        </nav>

        <!-- User Profile Section -->
        <div class="flex-shrink-0 px-4 pb-6 mt-4 border-t border-gray-100 pt-4">
    <div
      (click)="handleProfileClick()"
      class="group flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer"
      [class.justify-center]="isCollapsed"
    >
      <!-- Avatar Container - Foto o Fallback -->
      <div class="relative w-11 h-11 flex-shrink-0">
        <!-- Foto del usuario si existe -->
        <img
                *ngIf="getUserPhoto()"
                [src]="getUserPhoto()"
                [alt]="getUserDisplayName()"
                class="w-11 h-11 rounded-full object-cover shadow-sm ring-2 ring-white"
                (error)="onImageError($event)"
              />

        <!-- Fallback con gradiente e iniciales si no hay foto -->
        <div
          *ngIf="!getUserPhoto()"
          class="w-11 h-11 bg-gradient-to-br from-emerald-500 to-blue-800 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white"
        >
          <!-- Mostrar iniciales en lugar del icono -->
          <span class="text-white text-sm font-bold">
            {{ getUserInitials() }}
          </span>
        </div>

        <!-- Indicador de estado en línea -->
        <div class="absolute -bottom-0 -right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>

      <!-- Información del usuario -->
      <div class="ml-4 flex-1" [class.hidden]="isCollapsed">
              <p class="text-sm font-bold text-gray-800">
                {{ getUserDisplayName() }}
              </p>
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p class="text-xs text-gray-500 font-medium">En línea</p>
              </div>
            </div>

      <!-- Tooltip for collapsed state -->
      <div *ngIf="isCollapsed" class="tooltip">
        {{ getUserDisplayName() }}
      </div>
    </div>
  </div>


      </div>
    </aside>

    <!-- Mobile Menu Button -->
    <button
      *ngIf="isMobile"
      (click)="toggleMobileSidebar()"
      class="fixed bottom-4 right-4 z-50 p-3 bg-blue-800 text-white rounded-full shadow-lg hover:bg-blue-900 transition-colors duration-200 lg:hidden"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      >
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  `,
  styles: [
    `
      /* Scrollbar personalizado para sidebar */
      .sidebar-scroll::-webkit-scrollbar {
        width: 6px;
      }

      .sidebar-scroll::-webkit-scrollbar-track {
        background: transparent;
      }

      .sidebar-scroll::-webkit-scrollbar-thumb {
        background-color: rgba(156, 163, 175, 0.2);
        border-radius: 3px;
      }

      .sidebar-scroll::-webkit-scrollbar-thumb:hover {
        background-color: rgba(156, 163, 175, 0.4);
      }

      /* Animaciones suaves para elementos */
      .nav-item {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .nav-item:hover {
        transform: translateX(2px);
      }

      .dropdown-enter {
        animation: slideDown 0.2s ease-out;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Estados hover más suaves */
      .icon-container {
        transition: all 0.2s ease-in-out;
      }

      .nav-item:hover .icon-container {
        transform: scale(1.05);
      }

      /* Mejora visual para badges */
      .badge {
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      }

      /* Tooltips mejorados */
      .tooltip {
        position: absolute;
        left: 100%;
        margin-left: 0.5rem;
        padding: 0.5rem 0.75rem;
        color: white;
        font-size: 0.75rem;
        border-radius: 0.375rem;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
        white-space: nowrap;
        pointer-events: none;
        z-index: 50;
        background-color: rgb(31 41 55);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }

      button:hover .tooltip,
      a:hover .tooltip,
      .group:hover .tooltip {
        opacity: 1;
      }

      /* Indicador de estado activo mejorado */
      .nav-item.router-link-active {
        background-color: rgb(30 64 175);
        color: white;
        box-shadow: 0 4px 6px -1px rgba(30, 64, 175, 0.15);
      }

      /* Efecto de pulso sutil para elementos activos */
      .nav-item.router-link-active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 100%;
        background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
        border-radius: 0 4px 4px 0;
      }

      /* Ajustes responsivos */
      @media (max-width: 1024px) {
        aside {
          position: fixed;
        }
      }

      /* Estados de hover más precisos */
      .group:not(.router-link-active):hover svg {
        color: rgb(30 64 175) !important;
      }

      /* Estilo mejorado para badges */
      .badge {
        font-weight: 600;
        letter-spacing: 0.025em;
      }
    `,
  ],
})
export class ModernSidebarComponent implements OnInit {
    private destroy$ = new Subject<void>(); // 🆕 Para limpiar suscripciones

  @Output() sidebarStateChange = new EventEmitter<boolean>();

  isCollapsed = false;
  isMobile = false;
  isMobileOpen = false;
  currentUser: Usuario | null = null;
  menuSections: MenuSection[] = [
    {
      title: 'Registro de Pacientes',
      icon: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z',
      isExpanded: true,
      items: [
        {
          name: 'Nuevo Paciente',
          path: '/app/nuevo-paciente',
          icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
          badgeColor: 'primary',
        },
        {
          name: 'Buscar Pacientes',
          path: '/app/personas/pacientes',
          icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
        },
      ],
    },
    {
      title: 'Gestión de Expedientes',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      isExpanded: false,
      items: [
        {
          name: 'Ver Expedientes',
          path: '/app/gestion-expedientes/expedientes',
          icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        },
        {
          name: 'Camas Hospitalarias',
          path: '/app/gestion-expedientes/camas',
          icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z',
          badgeColor: 'warning',
        },
        {
          name: 'Internamientos',
          path: '/app/gestion-expedientes/internamientos',
          icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        },
        {
          name: 'Signos Vitales',
          path: '/app/gestion-expedientes/signos-vitales',
          icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
        },
      ],
    },
    {
      title: 'Documentos Clínicos',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      isExpanded: false,
      items: [
        {
          name: 'Historia Clínica',
          path: '/app/documentos-clinicos/historias-clinicas',
          icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        },
        {
          name: 'Notas de Urgencias',
          path: '/app/documentos-clinicos/notas-urgencias',
          icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
          badgeColor: 'emergency',
        },
        {
          name: 'Notas de Evolución',
          path: '/app/documentos-clinicos/notas-evolucion',
          icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
        },
        {
          name: 'Prescripciones',
          path: '/app/documentos-clinicos/prescripciones-medicamento',
          icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',

          badgeColor: 'success',
        },
      ],
    },
    {
      title: 'Catálogos del Sistema',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      isExpanded: false,
      items: [
        {
          name: 'Servicios Hospitalarios',
          path: '/app/catalogos/servicios',
          icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        },
        {
          name: 'Medicamentos',
          path: '/app/catalogos/medicamentos',
          icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
        },
        {
          name: 'Estudios Médicos',
          path: '/app/catalogos/estudios-medicos',
          icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        },
      ],
    },
    {
      title: 'Administración',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      isExpanded: false,
      items: [
        {
          name: 'Personal Médico',
          path: '/app/personas/personal-medico',
          icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
          badge: '23',
          badgeColor: 'success',
        },
        {
          name: 'Administradores',
          path: '/app/personas/administradores',
          icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
          badge: '5',
          badgeColor: 'info',
        },
      ],
    },
  ];

  constructor(
    private router: Router,
    private configuracionService: ConfiguracionService,
    private authService: AuthService // Inyectar el AuthService
  ) {}

  configuracion: ConfiguracionLogos = CONFIGURACION_DEFAULT;

  ngOnInit(): void {
   this.checkScreenSize();
   this.emitSidebarState();

   this.configuracionService.configuracion$.subscribe((config) => {
     this.configuracion = config;
   });

   // 🆕 Suscribirse a cambios del usuario en tiempo real
   this.authService.currentUser$
     .pipe(takeUntil(this.destroy$))
     .subscribe((user) => {
       this.currentUser = user;
       console.log('  Usuario actualizado en Sidebar:', user?.foto);
     });
 }

 ngOnDestroy(): void { // 🆕 Limpiar suscripciones
   this.destroy$.next();
   this.destroy$.complete();
 }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 1024;

    if (wasMobile && !this.isMobile) {
      this.isMobileOpen = false;
    }

    if (this.isMobile) {
      this.isCollapsed = false;
    }

    this.emitSidebarState();
  }

  // Métodos para mostrar información del usuario
  getUserDisplayName(): string {
    if (!this.currentUser) return 'Usuario';

    const { nombre_completo, tipo_usuario } = this.currentUser;
    const prefix = tipo_usuario === 'medico' ? 'Dr.' : '';

    return `${prefix} ${nombre_completo}`.trim();
  }

  // Nuevo método para manejar el click en el perfil
  handleProfileClick(): void {
    console.log('  Abriendo perfil del usuario');

    if (this.currentUser?.tipo_usuario === 'medico') {
      // Ir al perfil médico
      this.router.navigate([
        '/app/personas/perfil-medico',
        this.currentUser.id,
      ]);
    } else {
      // Ir a administradores
      this.router.navigate(['/app/personas/administradores']);
    }
  }

  toggleCollapse(): void {
    if (!this.isMobile) {
      this.isCollapsed = !this.isCollapsed;
      this.emitSidebarState();
    }
  }

  toggleMobileSidebar(): void {
    this.isMobileOpen = !this.isMobileOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileOpen = false;
  }

  toggleSection(title: string): void {
    if (this.isCollapsed && !this.isMobile) {
      // En estado colapsado, expandir primero el sidebar
      this.isCollapsed = false;
      this.emitSidebarState();
    }

    const section = this.menuSections.find((s) => s.title === title);
    if (section) {
      // Cerrar otras secciones
      this.menuSections.forEach((s) => {
        if (s.title !== title) {
          s.isExpanded = false;
        }
      });

      // Toggle la sección actual
      section.isExpanded = !section.isExpanded;
    }
  }

  isActiveRoute(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  getBadgeClasses(color?: string): string {
    const baseClasses =
      'badge inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide';
    switch (color) {
      case 'emergency':
        return `${baseClasses} bg-red-600 text-white shadow-sm`;
      case 'primary':
        return `${baseClasses} bg-blue-600 text-white shadow-sm`;
      case 'success':
        return `${baseClasses} bg-emerald-600 text-white shadow-sm`;
      case 'warning':
        return `${baseClasses} bg-amber-600 text-white shadow-sm`;
      case 'info':
        return `${baseClasses} bg-sky-600 text-white shadow-sm`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-800`;
    }
  }

  trackByTitle(index: number, section: MenuSection): string {
    return section.title;
  }

  trackByPath(index: number, item: MenuItem): string {
    return item.path;
  }

  private emitSidebarState(): void {
    const isOpen = !this.isMobile || (this.isMobile && this.isMobileOpen);
    this.sidebarStateChange.emit(!this.isMobile && !this.isCollapsed);
  }


   // 🆕 Métodos para manejo de fotos
  getUserPhoto(): string | null {
    return this.currentUser?.foto || null;
  }

  getUserInitials(): string {
    if (!this.currentUser?.nombre_completo) return 'U';

    const names = this.currentUser.nombre_completo.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  onImageError(event: any): void {
  console.warn('Error cargando imagen de perfil:', event);
  // Si la imagen falla, quitar la foto para mostrar fallback
  if (this.currentUser) {
    this.currentUser.foto= undefined;
  }
}


}
