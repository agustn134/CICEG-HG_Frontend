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
