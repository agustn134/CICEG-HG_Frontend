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
    /* Estilos corregidos para dashboard-layout.ts - Reemplazar en el styles */

/* Variables CSS personalizadas para el sistema hospitalario */
:root {
  --hospital-primary: rgb(30 64 175);      /* hospital-primary */
  --hospital-primary-dark: rgb(30 58 138); /* hospital-primary-dark */
  --hospital-success: rgb(5 150 105);      /* hospital-success */
  --hospital-warning: rgb(217 119 6);      /* hospital-warning */
  --hospital-error: rgb(220 38 38);        /* hospital-emergency */
  --hospital-gray-50: rgb(249 250 251);    /* hospital-gray-50 */
  --hospital-gray-100: rgb(243 244 246);   /* hospital-gray-100 */
  --hospital-gray-200: rgb(229 231 235);   /* hospital-gray-200 */
  --hospital-gray-500: rgb(107 114 128);   /* hospital-gray-500 */
  --hospital-gray-700: rgb(55 65 81);      /* hospital-gray-700 */
  --hospital-gray-800: rgb(31 41 55);      /* hospital-gray-800 */
  --hospital-gray-900: rgb(17 24 39);      /* hospital-gray-900 */
}

/* Animaciones personalizadas mejoradas para hospital */
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

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-dropdown-in {
  animation: dropdownIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-slide-in-right {
  animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Scrollbar personalizado más elegante para hospital */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--hospital-gray-500);
  opacity: 0.3;
  border-radius: 3px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--hospital-gray-500);
  opacity: 0.5;
}

/* Botones hospital mejorados - SIN @apply */
.btn-hospital {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: none;
  cursor: pointer;
}

.btn-hospital:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-hospital:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

/* Tooltips mejorados - SIN @apply */
.tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  color: white;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  white-space: nowrap;
  pointer-events: none;
  z-index: 50;
  background-color: var(--hospital-gray-800);
}

.tooltip-trigger:hover .tooltip {
  opacity: 1;
}

/* Estados de notificación mejorados - SIN @apply */
.notification-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  color: white;
  font-size: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  background-color: var(--hospital-error);
  animation: pulse 2s infinite;
}

/* Responsive adjustments para escritorio */
@media (max-width: 1280px) {
  .ml-72 {
    margin-left: 16rem; /* 64 para pantallas más pequeñas */
  }
}

@media (max-width: 1024px) {
  .ml-72 {
    margin-left: 0;
  }
}

/* Estados hover específicos para sistema hospitalario */
.hospital-hover-effect {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.hospital-hover-effect:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.1);
}

/* Indicadores de estado del sistema */
.system-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.system-status.online {
  background-color: var(--hospital-success);
  color: white;
}

.system-status.maintenance {
  background-color: var(--hospital-warning);
  color: white;
}

.system-status.offline {
  background-color: var(--hospital-error);
  color: white;
}

/* Mejoras de accesibilidad */
.focus-visible:focus {
  outline: 2px solid var(--hospital-primary);
  outline-offset: 2px;
}

/* Mejoras específicas para dropdown del usuario - SIN @apply */
.user-dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  transition: all 0.2s ease-in-out;
  color: var(--hospital-gray-700);
}

.user-dropdown-item:hover {
  background-color: var(--hospital-gray-50);
  color: var(--hospital-primary);
}

/* Animación sutil para iconos */
.icon-hover {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-hover:hover {
  transform: scale(1.05);
}
  `]
})
export class DashboardLayoutComponent implements OnInit {
  currentPageTitle = 'Panel Principal';
  isUserDropdownOpen = false;

  // Propiedades adicionales para funcionalidad mejorada
  systemStatus: 'online' | 'maintenance' | 'offline' = 'online';
  currentTime = '';
  welcomeMessage = '';

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

    // Actualizar hora cada minuto
    this.updateTime();
    setInterval(() => this.updateTime(), 60000);

    // Establecer mensaje de bienvenida
    this.updateWelcomeMessage();

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

  @HostListener('keydown.escape')
  onEscapeKey(): void {
    // Cerrar dropdown con tecla Escape
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
    // TODO: Implementar navegación a perfil
    // this.router.navigate(['/app/profile']);
  }

  private handleSettingsClick(): void {
    console.log('⚙️ Abriendo configuración del sistema');
    // TODO: Implementar navegación a configuración
    // this.router.navigate(['/app/settings']);
  }

  private handleScheduleClick(): void {
    console.log('📅 Abriendo horarios médicos');
    // TODO: Implementar navegación a horarios
    // this.router.navigate(['/app/schedule']);
  }

  private handleHelpClick(): void {
    console.log('❓ Abriendo centro de ayuda');
    // TODO: Implementar modal de ayuda o navegación
    // this.openHelpModal();
  }

  private handleLogoutClick(): void {
    console.log('🚪 Cerrando sesión');
    if (this.confirmLogout()) {
      // TODO: Implementar lógica de logout
      // this.authService.logout();
      // this.router.navigate(['/login']);
      console.log('Sesión cerrada exitosamente');
    }
  }

  private confirmLogout(): boolean {
    return confirm('¿Está seguro que desea cerrar sesión del sistema?');
  }

  private updatePageTitle(url: string): void {
    // Mapeo de rutas a títulos amigables para médicos (SIN EMOJIS)
    const routeTitles: { [key: string]: string } = {
      '/app/dashboard': 'Panel Principal',

      // Wizard de nuevo paciente
      '/app/nuevo-paciente': 'Registro de Nuevo Paciente',
      '/app/nuevo-paciente/inicio': 'Iniciar Registro de Paciente',
      '/app/nuevo-paciente/persona': 'Datos Personales del Paciente',
      '/app/nuevo-paciente/paciente': 'Información Médica del Paciente',
      '/app/nuevo-paciente/expediente': 'Creación de Expediente',
      '/app/nuevo-paciente/documento-clinico': 'Selección de Documento Clínico',
      '/app/nuevo-paciente/resumen': 'Resumen de Registro',

      // Pacientes
      '/app/personas/pacientes': 'Buscar Pacientes',
      '/app/personas/pacientes/nuevo': 'Registrar Nuevo Paciente',
      '/app/personas/pacientes-list': 'Lista de Pacientes',
      '/app/personas/personal-medico': 'Personal Médico',
      '/app/personas/administradores': 'Administradores del Sistema',
      '/app/personas': 'Gestión de Personas',

      // Expedientes
      '/app/gestion-expedientes/expedientes': 'Expedientes Clínicos',
      '/app/gestion-expedientes/expedientes/nuevo': 'Crear Nuevo Expediente',
      '/app/gestion-expedientes/camas': 'Gestión de Camas Hospitalarias',
      '/app/gestion-expedientes/internamientos': 'Control de Hospitalizaciones',
      '/app/gestion-expedientes/signos-vitales': 'Registro de Signos Vitales',

      // Documentos Clínicos
      '/app/documentos-clinicos/historias-clinicas': 'Historias Clínicas',
      '/app/documentos-clinicos/notas-urgencias': 'Notas de Urgencias',
      '/app/documentos-clinicos/notas-evolucion': 'Notas de Evolución',
      '/app/documentos-clinicos/notas-interconsulta': 'Notas de Interconsulta',
      '/app/documentos-clinicos/notas-preoperatoria': 'Notas Preoperatorias',
      '/app/documentos-clinicos/notas-preanestesica': 'Notas Preanestésicas',
      '/app/documentos-clinicos/notas-postoperatoria': 'Notas Postoperatorias',
      '/app/documentos-clinicos/notas-postanestesica': 'Notas Postanestésicas',
      '/app/documentos-clinicos/notas-egreso': 'Notas de Egreso Hospitalario',
      '/app/documentos-clinicos/consentimientos-informados': 'Consentimientos Informados',
      '/app/documentos-clinicos/solicitudes-estudio': 'Solicitudes de Estudios Médicos',
      '/app/documentos-clinicos/referencias-traslado': 'Referencias y Traslados',
      '/app/documentos-clinicos/prescripciones-medicamento': 'Prescripciones Médicas',
      '/app/documentos-clinicos/registros-transfusion': 'Registros de Transfusión Sanguínea',
      '/app/documentos-clinicos/documentos': 'Documentos Clínicos Generales',

      // Catálogos
      '/app/catalogos/servicios': 'Catálogo de Servicios Médicos',
      '/app/catalogos/medicamentos': 'Catálogo de Medicamentos',
      '/app/catalogos/estudios-medicos': 'Catálogo de Estudios Médicos',
      '/app/catalogos/tipos-sangre': 'Catálogo de Tipos de Sangre',
      '/app/catalogos/areas-interconsulta': 'Catálogo de Áreas de Interconsulta',
      '/app/catalogos/guias-clinicas': 'Catálogo de Guías Clínicas',
      '/app/catalogos/tipos-documento': 'Catálogo de Tipos de Documento',

      // Notas Especializadas
      '/app/notas-especializadas/notas-psicologia': 'Notas de Psicología Clínica',
      '/app/notas-especializadas/notas-nutricion': 'Notas de Nutrición Clínica',
    };

    // Buscar título exacto o por categoría
    this.currentPageTitle = routeTitles[url] || this.getTitleByCategory(url);
  }

  private getTitleByCategory(url: string): string {
    // Títulos por categoría con terminología médica amigable
    if (url.includes('nuevo-paciente')) return 'Registro de Nuevo Paciente';
    if (url.includes('personas')) return 'Gestión de Personas';
    if (url.includes('gestion-expedientes')) return 'Gestión de Expedientes';
    if (url.includes('documentos-clinicos')) return 'Documentos Médicos';
    if (url.includes('catalogos')) return 'Catálogos del Sistema';
    if (url.includes('notas-especializadas')) return 'Notas Especializadas';
    return 'Panel Principal';
  }

  // Métodos para mejorar la experiencia del usuario
  getCurrentTime(): string {
    return this.currentTime;
  }

  private updateTime(): void {
    this.currentTime = new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  getWelcomeMessage(): string {
    return this.welcomeMessage;
  }

  private updateWelcomeMessage(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.welcomeMessage = 'Buenos días, Doctor';
    } else if (hour < 18) {
      this.welcomeMessage = 'Buenas tardes, Doctor';
    } else {
      this.welcomeMessage = 'Buenas noches, Doctor';
    }
  }

  // Funciones para notificaciones
  getNotificationCount(): number {
    // TODO: Conectar con servicio real de notificaciones
    return 3;
  }

  hasUrgentNotifications(): boolean {
    return this.getNotificationCount() > 0;
  }

  getSystemStatus(): string {
    switch (this.systemStatus) {
      case 'online':
        return 'Sistema Operativo';
      case 'maintenance':
        return 'Mantenimiento';
      case 'offline':
        return 'Fuera de Línea';
      default:
        return 'Estado Desconocido';
    }
  }

  getSystemStatusClass(): string {
    return `system-status ${this.systemStatus}`;
  }

  // Funciones de navegación rápida
  navigateToNewPatient(): void {
    this.router.navigate(['/app/nuevo-paciente']);
  }

  navigateToPatientSearch(): void {
    this.router.navigate(['/app/personas/pacientes']);
  }

  navigateToExpedientes(): void {
    this.router.navigate(['/app/gestion-expedientes/expedientes']);
  }

  // Función para debugging en desarrollo
  logCurrentRoute(): void {
    console.log(`🏥 CICEG-HG - Navegando a: ${this.currentPageTitle} (${this.router.url})`);
  }

  // Función para detectar si estamos en el wizard
  isInWizardFlow(): boolean {
    return this.router.url.includes('/nuevo-paciente');
  }

  // Función para obtener el paso actual del wizard
  getCurrentWizardStep(): number {
    const url = this.router.url;
    if (url.includes('/inicio')) return 0;
    if (url.includes('/persona')) return 1;
    if (url.includes('/paciente')) return 2;
    if (url.includes('/expediente')) return 3;
    if (url.includes('/documento-clinico')) return 4;
    if (url.includes('/llenar-documento')) return 5;
    if (url.includes('/resumen')) return 6;
    return -1;
  }

  // Función para mostrar información contextual
  showContextualInfo(): boolean {
    // Mostrar información adicional según la sección actual
    return this.isInWizardFlow() || this.router.url.includes('/documentos-clinicos');
  }
}
