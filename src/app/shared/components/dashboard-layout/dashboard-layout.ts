// src/app/shared/layout/dashboard-layout/dashboard-layout.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ModernSidebarComponent } from '../modern-sidebar/modern-sidebar';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService, Usuario } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ModernSidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Modern Sidebar -->
      <app-modern-sidebar
        (sidebarStateChange)="onSidebarStateChange($event)"
      ></app-modern-sidebar>

      <!-- Main Content Area -->
      <main
        class="transition-all duration-300 ease-in-out"
        [class.lg:ml-72]="sidebarExpanded && !isMobile"
        [class.lg:ml-20]="!sidebarExpanded && !isMobile"
        [class.ml-0]="isMobile"
      >
        <!-- Top Header Bar -->
        <header
          class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30"
        >
          <div class="px-4 sm:px-6 py-4">
            <div class="flex items-center justify-between">
              <!-- Page Title & Breadcrumb -->
              <div class="flex items-center space-x-4 flex-1">
                <h1
                  class="text-xl sm:text-2xl font-bold text-gray-900 truncate"
                >
                  {{ currentPageTitle }}
                </h1>
                <nav class="hidden md:flex" aria-label="Breadcrumb">
                  <ol class="flex items-center space-x-2 text-sm">
                    <li>
                      <a
                        routerLink="/app/dashboard"
                        class="text-gray-500 hover:text-blue-800 transition-colors duration-200 font-medium"
                      >
                        Inicio
                      </a>
                    </li>
                    <li
                      class="flex items-center"
                      *ngIf="currentPageTitle !== 'Panel Principal'"
                    >
                      <svg
                        class="w-4 h-4 mx-2 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      <span class="text-gray-700 font-medium truncate">{{
                        currentPageTitle
                      }}</span>
                    </li>
                  </ol>
                </nav>
              </div>

              <!-- Header Actions -->
              <div class="flex items-center space-x-2 sm:space-x-4">
                <!-- Quick Actions (Hidden on mobile) -->
                <div class="hidden lg:flex items-center space-x-2">
                  <!-- Notifications -->
                  <button
                    class="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <span
                      *ngIf="getNotificationCount() > 0"
                      class="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold"
                    >
                      {{ getNotificationCount() }}
                    </span>
                  </button>

                  <!-- Help -->
                  <button
                    class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                </div>

                <!-- Current Time -->
                <div
                  class="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg"
                >
                  <svg
                    class="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span class="text-xs text-gray-700 font-medium">{{
                    getCurrentTime()
                  }}</span>
                </div>

                <!-- User Profile with Dropdown -->
                <div class="relative user-dropdown-container">
                  <button
                    (click)="toggleUserDropdown()"
                    class="flex items-center space-x-2 sm:space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
                    [class.bg-gray-100]="isUserDropdownOpen"
                  >
                    <div
                      class="w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-900 rounded-full flex items-center justify-center shadow-sm"
                    >
                      <svg
                        class="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div class="hidden sm:block text-left">
                      <p class="text-sm font-semibold text-gray-800">
                        {{ getUserDisplayName() }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ getUserRole() }} - Hospital General
                      </p>
                    </div>
                    <svg
                      class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all duration-200"
                      [class.rotate-180]="isUserDropdownOpen"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <!-- Dropdown Menu -->
                  <div
                    *ngIf="isUserDropdownOpen"
                    class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-dropdown-in"
                  >
                    <!-- User Info Header -->
                    <div
                      class="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200"
                    >
                      <div class="flex items-center space-x-3">
                        <div
                          class="w-10 h-10 bg-gradient-to-br from-blue-800 to-blue-900 rounded-full flex items-center justify-center shadow-sm"
                        >
                          <svg
                            class="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <p class="text-sm font-semibold text-gray-800">
                            {{ getUserDisplayName() }}
                          </p>
                          <p class="text-xs text-gray-500">
                            {{ getUserRole() }} - Hospital General San Luis de
                            la Paz
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Menu Items -->
                    <div class="py-2">
                      <!-- Mi Perfil -->
                      <button
                        type="button"
                        (click)="onDropdownItemClick('profile', $event)"
                        class="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-800 transition-all duration-200 group text-left"
                      >
                        <div
                          class="mr-3 p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors duration-200"
                        >
                          <svg
                            class="w-4 h-4 text-gray-500 group-hover:text-blue-800"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <span class="font-medium">Mi Perfil</span>
                          <p class="text-xs text-gray-500 mt-0.5">
                            Ver y editar información personal
                          </p>
                        </div>
                      </button>

                      <!-- Configuración -->
                      <button
                        type="button"
                        (click)="onDropdownItemClick('settings', $event)"
                        class="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-800 transition-all duration-200 group text-left"
                      >
                        <div
                          class="mr-3 p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors duration-200"
                        >
                          <svg
                            class="w-4 h-4 text-gray-500 group-hover:text-blue-800"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <span class="font-medium">Configuración</span>
                          <p class="text-xs text-gray-500 mt-0.5">
                            Preferencias del sistema
                          </p>
                        </div>
                      </button>

                      <!-- Separador -->
                      <div class="border-t border-gray-200 my-2"></div>

                      <!-- Cerrar Sesión -->
                      <button
                        type="button"
                        (click)="onDropdownItemClick('logout', $event)"
                        class="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 group text-left"
                      >
                        <div
                          class="mr-3 p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors duration-200"
                        >
                          <svg
                            class="w-4 h-4 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <span class="font-medium">Cerrar Sesión</span>
                          <p class="text-xs text-red-500 mt-0.5">
                            Salir del sistema
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mobile Info Bar -->
            <div class="flex items-center justify-between mt-3 lg:hidden">
              <div class="flex items-center space-x-2 text-xs text-gray-600">
                <span class="font-medium">{{ getWelcomeMessage() }}</span>
                <span class="text-gray-400">•</span>
                <span>{{ getSystemStatus() }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  class="relative p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span
                    *ngIf="getNotificationCount() > 0"
                    class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  >
                    {{ getNotificationCount() }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="p-4 sm:p-6">
          <!-- Wizard Info Banner -->
          <div
            *ngIf="isInWizardFlow()"
            class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div class="flex items-center">
              <svg
                class="w-5 h-5 text-blue-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p class="text-sm text-blue-800">
                Está en el proceso de registro de nuevo paciente. Paso
                {{ getCurrentWizardStep() + 1 }} de 3
              </p>
            </div>
          </div>

          <!-- Contenedor con animación -->
          <div class="animate-fade-in">
            <router-outlet></router-outlet>
          </div>
        </div>

        <!-- Footer -->
        <footer class="bg-white border-t border-gray-200 mt-12">
          <div class="px-4 sm:px-6 py-4">
            <div
              class="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0"
            >
              <div class="text-sm text-gray-600 text-center sm:text-left">
                © 2025
                <span class="font-semibold text-gray-800">SICEG-HG</span> -
                Sistema de Expediente Clínico Electrónico
              </div>
              <div class="flex items-center space-x-4">
                <span class="text-xs text-gray-500"
                  >Hospital General San Luis de la Paz, Guanajuato</span
                >
              </div>
            </div>
          </div>
        </footer>
      </main>

      <!-- Overlay para cerrar dropdown -->
      <!-- <div
        *ngIf="isUserDropdownOpen"
        (click)="closeUserDropdown()"
        class="fixed inset-0 z-40"
      ></div> -->
      <div
  *ngIf="isUserDropdownOpen"
  (click)="closeUserDropdown()"
  class="fixed inset-0 z-40"
  style="pointer-events: auto;"
></div>
    </div>
  `,
  styles: [
    `
    .user-dropdown-container {
  position: relative;
  z-index: 50; /* Mayor que el overlay */
}

.animate-dropdown-in {
  animation: dropdownIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 60; /* Asegurar que está por encima del overlay */
}

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes dropdownIn {
        from {
          opacity: 0;
          transform: translateY(-8px) scale(0.96);
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

      :focus-visible {
        outline: 2px solid rgb(30 64 175);
        outline-offset: 2px;
      }
    `,
  ],
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
private timeInterval: any;

  currentPageTitle = 'Panel Principal';
  isUserDropdownOpen = false;
  sidebarExpanded = true;
  isMobile = false;
  currentUser: Usuario | null = null;

  systemStatus: 'online' | 'maintenance' | 'offline' = 'online';
  currentTime = '';
  welcomeMessage = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Suscribirse a los cambios del usuario actual
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        this.updateWelcomeMessage();
      });

    // Escuchar cambios de ruta
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.url);
      });

    this.updatePageTitle(this.router.url);
    this.updateTime();
    setInterval(() => this.updateTime(), 60000);
    this.checkScreenSize();
    this.timeInterval = setInterval(() => this.updateTime(), 60000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timeInterval);
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
    this.isUserDropdownOpen = false;
  }

  @HostListener('keydown.escape')
  onEscapeKey(): void {
    this.isUserDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown-container')) {
      this.isUserDropdownOpen = false;
    }
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 1024;
  }

  // Agrega este método temporal al dashboard component
  testLogout(): void {
    console.log('🧪 Probando logout directamente...');
    try {
      this.authService.logout();
      console.log('✅ Logout directo exitoso');
    } catch (error) {
      console.error('❌ Error en logout directo:', error);
    }
  }

  onSidebarStateChange(expanded: boolean): void {
    this.sidebarExpanded = expanded;
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  closeUserDropdown(): void {
    this.isUserDropdownOpen = false;
  }

  // onDropdownItemClick(action: string, event: Event): void {
  //   event.preventDefault();
  //   event.stopPropagation();

  //   this.closeUserDropdown();

  //   switch (action) {
  //     case 'profile':
  //       this.handleProfileClick();
  //       break;
  //     case 'settings':
  //       this.handleSettingsClick();
  //       break;
  //     case 'logout':
  //       this.handleLogoutClick();
  //       break;
  //     default:
  //       console.log(`Acción no reconocida: ${action}`);
  //   }
  // }


  // onDropdownItemClick(action: string, event: Event): void {
  //   event.stopPropagation();

  //   console.log(`🔄 Ejecutando acción: ${action}`);

  //   this.closeUserDropdown();

  //   switch (action) {
  //     case 'profile':
  //       this.handleProfileClick();
  //       break;
  //     case 'settings':
  //       this.handleSettingsClick();
  //       break;
  //     case 'logout':
  //       this.handleLogoutClick();
  //       break;
  //     default:
  //       console.log(`❌ Acción no reconocida: ${action}`);
  //   }
  // }

onDropdownItemClick(action: string, event: Event): void {
  event.stopPropagation();
  this.closeUserDropdown();

  console.log(`🔄 Ejecutando acción: ${action}`);

  switch (action) {
    case 'profile':
      this.handleProfileClick();
      break;
    case 'settings':
      this.handleSettingsClick();
      break;
    case 'logout':
      // No prevenir el comportamiento por defecto para logout
      this.handleLogoutClick();
      break;
    default:
      console.log(`❌ Acción no reconocida: ${action}`);
  }
}

private handleLogoutClick(): void {
  console.log('🚪 Iniciando proceso de logout');

  if (confirm('¿Está seguro que desea cerrar sesión del sistema?')) {
    console.log('✅ Logout confirmado por el usuario');
    try {
      this.authService.logout();
      console.log('✅ Sesión cerrada exitosamente');
      // Redirigir explícitamente si es necesario
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('❌ Error durante el logout:', error);
    }
  } else {
    console.log('❌ Logout cancelado por el usuario');
  }
}

  private handleProfileClick(): void {
    console.log('🏥 Abriendo perfil del usuario');
   this.router.navigate(['/app/personas/administradores']);
  }

  private handleSettingsClick(): void {
    console.log('⚙️ Abriendo configuración del sistema');
    // this.router.navigate(['/app/settings']);
  }

  // private handleLogoutClick(): void {
  //   console.log('🚪 Iniciando proceso de logout');
  //   console.log('🔍 Estado actual del usuario:', this.currentUser);

  //   if (this.confirmLogout()) {
  //     try {
  //       console.log('✅ Logout confirmado por el usuario');
  //       console.log('🔄 Llamando a authService.logout()');
  //       this.authService.logout();
  //       console.log('✅ Sesión cerrada exitosamente');
  //     } catch (error) {
  //       console.error('❌ Error durante el logout:', error);
  //     }
  //   } else {
  //     console.log('❌ Logout cancelado por el usuario');
  //   }
  // }

  private confirmLogout(): boolean {
    return confirm('¿Está seguro que desea cerrar sesión del sistema?');
  }

  // Métodos para mostrar información del usuario
  getUserDisplayName(): string {
    if (!this.currentUser) return 'Usuario';

    const { nombre_completo, tipo_usuario } = this.currentUser;
    const prefix = tipo_usuario === 'medico' ? 'Dr.' : '';

    return `${prefix} ${nombre_completo}`.trim();
  }

  getUserRole(): string {
    if (!this.currentUser) return 'Usuario';

    const roles = {
      medico: 'Médico',
      administrador: 'Administrador',
      enfermeria: 'Enfermería',
      residente: 'Residente',
    };

    return roles[this.currentUser.tipo_usuario] || 'Usuario';
  }

  private updateWelcomeMessage(): void {
    if (!this.currentUser) {
      this.welcomeMessage = 'Bienvenido';
      return;
    }

    const hour = new Date().getHours();
    let greeting = '';

    if (hour < 12) {
      greeting = 'Buenos días';
    } else if (hour < 19) {
      greeting = 'Buenas tardes';
    } else {
      greeting = 'Buenas noches';
    }

    const userPrefix = this.currentUser.tipo_usuario === 'medico' ? 'Dr.' : '';
    this.welcomeMessage =
      `${greeting}, ${userPrefix} ${this.currentUser.nombre_completo}`.trim();
  }

  private updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  private updatePageTitle(url: string): void {
    const routeTitles: { [key: string]: string } = {
      '/app/dashboard': 'Panel Principal',
      '/app/nuevo-paciente': 'Registro de Nuevo Paciente',
      '/app/nuevo-paciente/inicio': 'Iniciar Registro de Paciente',
      '/app/nuevo-paciente/persona': 'Datos Personales del Paciente',
      '/app/nuevo-paciente/paciente': 'Información Médica del Paciente',
      '/app/nuevo-paciente/expediente': 'Creación de Expediente',
      '/app/nuevo-paciente/documento-clinico': 'Selección de Documento Clínico',
      '/app/nuevo-paciente/resumen': 'Resumen de Registro',
      '/app/personas/pacientes': 'Buscar Pacientes',
      '/app/personas/pacientes/nuevo': 'Registrar Nuevo Paciente',
      '/app/personas/pacientes-list': 'Lista de Pacientes',
      '/app/personas/personal-medico': 'Personal Médico',
      '/app/personas/administradores': 'Administradores del Sistema',
      '/app/personas': 'Gestión de Personas',
      '/app/gestion-expedientes/expedientes': 'Expedientes Clínicos',
      '/app/gestion-expedientes/expedientes/nuevo': 'Crear Nuevo Expediente',
      '/app/gestion-expedientes/camas': 'Gestión de Camas Hospitalarias',
      '/app/gestion-expedientes/internamientos': 'Control de Hospitalizaciones',
      '/app/gestion-expedientes/signos-vitales': 'Registro de Signos Vitales',
      '/app/documentos-clinicos': 'Documentos Clínicos',
      '/app/documentos-clinicos/nuevo': 'Crear Documento Clínico',
      '/app/documentos-clinicos/plantillas': 'Plantillas de Documentos',
      '/app/documentos-clinicos/historial': 'Historial de Documentos',
      '/app/configuracion': 'Configuración del Sistema',
      '/app/configuracion/perfil': 'Mi Perfil',
      '/app/configuracion/usuarios': 'Gestión de Usuarios',
      '/app/configuracion/roles': 'Gestión de Roles y Permisos',
      '/app/configuracion/auditoria': 'Auditoría del Sistema',
      '/app/reportes': 'Reportes y Estadísticas',
      '/app/reportes/actividad': 'Reporte de Actividad',
      '/app/reportes/pacientes': 'Reporte de Pacientes',
      '/app/reportes/ingresos': 'Reporte de Ingresos',
    };

    let matchedRoute = '';
    for (const route in routeTitles) {
      if (url.startsWith(route)) {
        if (route.length > matchedRoute.length) {
          matchedRoute = route;
        }
      }
    }

    this.currentPageTitle = routeTitles[matchedRoute] || 'Panel Principal';
  }

  getCurrentTime(): string {
    return this.currentTime;
  }

  getWelcomeMessage(): string {
    return this.welcomeMessage;
  }

  getSystemStatus(): string {
    switch (this.systemStatus) {
      case 'online':
        return 'Sistema operativo';
      case 'maintenance':
        return 'En mantenimiento';
      case 'offline':
        return 'Sistema no disponible';
      default:
        return '';
    }
  }

  getNotificationCount(): number {
    return 3; // Valor de ejemplo
  }

  isInWizardFlow(): boolean {
    return this.router.url.includes('/nuevo-paciente');
  }

  getCurrentWizardStep(): number {
    const wizardRoutes = [
      '/app/nuevo-paciente/inicio',
      '/app/nuevo-paciente/persona',
      '/app/nuevo-paciente/paciente',
      '/app/nuevo-paciente/expediente',
      '/app/nuevo-paciente/documento-clinico',
      '/app/nuevo-paciente/resumen',
    ];

    const currentIndex = wizardRoutes.findIndex((route) =>
      this.router.url.includes(route)
    );

    return currentIndex >= 0 ? currentIndex : 0;
  }
}
