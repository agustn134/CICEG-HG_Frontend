// modern-sidebar.ts
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
  `]
})
export class ModernSidebarComponent implements OnInit {

  menuSections: MenuSection[] = [
    {
      title: 'Registro de Pacientes',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      isExpanded: true, // Expandido por defecto para acceso rápido
      items: [
        {
          name: 'Nuevo Paciente (Wizard)',
          path: '/app/nuevo-paciente',
          icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
          badge: 'Nuevo',
          badgeColor: 'hospital-primary'
        },
        {
          name: 'Buscar Pacientes',
          path: '/app/personas/pacientes',
          icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
        },
        {
          name: 'Lista de Pacientes',
          path: '/app/personas/pacientes-list',
          icon: 'M4 6h16M4 10h16M4 14h16M4 18h16'
        },
      ]
    },
    {
      title: 'Gestión de Expedientes',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      isExpanded: false,
      items: [
        {
          name: 'Ver Expedientes',
          path: '/app/gestion-expedientes/expedientes',
          icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        },
        {
          name: 'Camas Hospitalarias',
          path: '/app/gestion-expedientes/camas',
          icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z',
          badge: '12/20',
          badgeColor: 'hospital-warning'
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
          badge: 'Urgente',
          badgeColor: 'hospital-emergency'
        },
        {
          name: 'Notas de Evolución',
          path: '/app/documentos-clinicos/notas-evolucion',
          icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
        },
        {
          name: 'Interconsultas',
          path: '/app/documentos-clinicos/notas-interconsulta',
          icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
        },
        {
          name: 'Documentos Quirúrgicos',
          path: '/app/documentos-clinicos/documentos',
          icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
        },
        {
          name: 'Consentimientos',
          path: '/app/documentos-clinicos/consentimientos-informados',
          icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
        },
        {
          name: 'Prescripciones',
          path: '/app/documentos-clinicos/prescripciones-medicamento',
          icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
          badge: 'Recetas',
          badgeColor: 'hospital-success'
        }
      ]
    },
    {
      title: 'Catálogos del Sistema',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      isExpanded: false,
      items: [
        {
          name: 'Servicios Hospitalarios',
          path: '/app/catalogos/servicios',
          icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
        },
        {
          name: 'Medicamentos',
          path: '/app/catalogos/medicamentos',
          icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
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
        {
          name: 'Áreas de Interconsulta',
          path: '/app/catalogos/areas-interconsulta',
          icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 1.657-2.657 1.657-2.657A8 8 0 1017.657 18.657z'
        },
        {
          name: 'Guías Clínicas',
          path: '/app/catalogos/guias-clinicas',
          icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
        },
        {
          name: 'Tipos de Documento',
          path: '/app/catalogos/tipos-documento',
          icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707L16.414 6.5a1 1 0 00-.707-.293H7a2 2 0 00-2 2v11a2 2 0 002 2z'
        }
      ]
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
          badgeColor: 'hospital-success'
        },
        {
          name: 'Administradores',
          path: '/app/personas/administradores',
          icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
          badge: '5',
          badgeColor: 'hospital-info'
        }
      ]
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Configuración inicial
  }

  @HostListener('window:resize')
  onResize(): void {
    // Manejo responsive para escritorio
  }

  toggleSection(title: string): void {
    const section = this.menuSections.find(s => s.title === title);
    if (section) {
      // Cerrar otras secciones (comportamiento accordion)
      this.menuSections.forEach(s => {
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
    const baseClasses = 'badge inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
    switch (color) {
      case 'hospital-emergency':
        return `${baseClasses} bg-hospital-emergency text-white`;
      case 'hospital-primary':
        return `${baseClasses} bg-hospital-primary text-white`;
      case 'hospital-success':
        return `${baseClasses} bg-hospital-success text-white`;
      case 'hospital-warning':
        return `${baseClasses} bg-hospital-warning text-white`;
      case 'hospital-info':
        return `${baseClasses} bg-hospital-info text-white`;
      default:
        return `${baseClasses} bg-hospital-gray-100 text-hospital-gray-800`;
    }
  }

  trackByTitle(index: number, section: MenuSection): string {
    return section.title;
  }

  trackByPath(index: number, item: MenuItem): string {
    return item.path;
  }
}
