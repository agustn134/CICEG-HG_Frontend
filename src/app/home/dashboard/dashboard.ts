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
//   templateUrl: './dashboard.html',
//   styleUrls: ['./dashboard.css']
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
//       color: 'blue'
//     },
//     {
//       title: 'Expedientes Nuevos',
//       value: '23',
//       change: '+5% esta semana',
//       trend: 'up',
//       icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
//       color: 'emerald'
//     },
//     {
//       title: 'Camas Ocupadas',
//       value: '12/20',
//       change: '60% ocupación',
//       trend: 'stable',
//       icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z',
//       color: 'amber'
//     },
//     {
//       title: 'Personal Médico',
//       value: '45',
//       change: '+2 este mes',
//       trend: 'up',
//       icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
//       color: 'indigo'
//     }
//   ];

//   quickActions: QuickAction[] = [
//     {
//       title: 'Nuevo Paciente',
//       description: 'Registrar un nuevo paciente en el sistema',
//       href: '/app/personas/pacientes',
//       icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
//       color: 'blue',
//       badge: 'Frecuente'
//     },
//     {
//       title: 'Crear Expediente',
//       description: 'Generar un nuevo expediente clínico',
//       href: '/app/gestion-expedientes/expedientes',
//       icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
//       color: 'emerald'
//     },
//     {
//       title: 'Gestionar Camas',
//       description: 'Administrar ocupación de camas',
//       href: '/app/gestion-expedientes/camas',
//       icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z',
//       color: 'amber'
//     },
//     {
//       title: 'Reportes',
//       description: 'Generar reportes y estadísticas',
//       href: '/app/reportes',
//       icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
//       color: 'indigo'
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
//     console.log('Dashboard del CICEG-HG inicializado correctamente');
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
//         return `${baseClasses} bg-emerald-50 text-emerald-700`;
//       case 'En Proceso':
//         return `${baseClasses} bg-amber-50 text-amber-700`;
//       case 'Activo':
//         return `${baseClasses} bg-blue-50 text-blue-700`;
//       default:
//         return `${baseClasses} bg-stone-100 text-stone-600`;
//     }
//   }

//   trackByTitle(index: number, item: any): string {
//     return item.title;
//   }

//   trackById(index: number, item: any): string {
//     return item.id;
//   }

//   // Métodos adicionales para la funcionalidad del dashboard
//   refreshData(): void {
//     console.log('Actualizando datos del dashboard...');
//     // Aquí podrías llamar servicios para actualizar los datos
//   }

//   navigateToSection(section: string): void {
//     console.log(`Navegando a la sección: ${section}`);
//     // Lógica de navegación
//   }

//   exportReport(type: string): void {
//     console.log(`Exportando reporte: ${type}`);
//     // Lógica para exportar reportes
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
  isWizard?: boolean;
}

interface RecentActivity {
  id: string;
  type: string;
  patient: string;
  status: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  action?: string;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

interface WizardProgress {
  total: number;
  completed: number;
  inProgress: number;
  abandoned: number;
}

interface UrgentAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  patient?: string;
  time: string;
  action: string;
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

  // Estadísticas principales
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
      title: 'Wizard Completados',
      value: '18',
      change: '+8 hoy',
      trend: 'up',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      color: 'indigo'
    }
  ];

  // Acciones rápidas actualizadas con wizard
  quickActions: QuickAction[] = [
    {
      title: 'Nuevo Paciente (Wizard)',
      description: 'Registro guiado completo de paciente',
      href: '/app/nuevo-paciente/inicio',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m0 0V9a3 3 0 013-3m-3 12a3 3 0 01-3-3m0 3c1.657 0 3-1.007 3-2.25s-1.343-2.25-3-2.25-3 1.007-3 2.25 1.343 2.25 3 2.25zm9-3a3 3 0 01-3-3m3 3c1.657 0 3-1.007 3-2.25s-1.343-2.25-3-2.25-3 1.007-3 2.25 1.343 2.25 3 2.25z',
      color: 'blue',
      badge: 'Nuevo',
      isWizard: true
    },
    {
      title: 'Buscar Pacientes',
      description: 'Consultar expedientes existentes',
      href: '/app/personas/pacientes',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      color: 'emerald'
    },
    {
      title: 'Gestionar Camas',
      description: 'Administrar ocupación hospitalaria',
      href: '/app/gestion-expedientes/camas',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z',
      color: 'amber'
    },
    {
      title: 'Documentos Clínicos',
      description: 'Crear notas e historias clínicas',
      href: '/app/documentos-clinicos/documentos',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'purple'
    }
  ];

  // Actividad reciente con acciones específicas
  recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'Wizard Completado',
      patient: 'María González López - CURP: GOLM890123MGTLPR01',
      status: 'Expediente Creado',
      time: 'Hace 5 minutos',
      priority: 'high',
      action: 'Ver Expediente'
    },
    {
      id: '2',
      type: 'Historia Clínica',
      patient: 'Carlos Rodríguez Pérez - CURP: ROPC850415HGTDRL02',
      status: 'En Proceso',
      time: 'Hace 15 minutos',
      priority: 'medium',
      action: 'Continuar'
    },
    {
      id: '3',
      type: 'Alta Médica',
      patient: 'Ana Martínez Sánchez - CURP: MASA920308MGTRNR03',
      status: 'Completado',
      time: 'Hace 30 minutos',
      priority: 'low',
      action: 'Ver Detalles'
    },
    {
      id: '4',
      type: 'Wizard Abandonado',
      patient: 'Proceso en paso "Datos del Paciente"',
      status: 'Pendiente',
      time: 'Hace 45 minutos',
      priority: 'medium',
      action: 'Continuar Wizard'
    }
  ];

  // Progreso del wizard
  wizardProgress: WizardProgress = {
    total: 25,
    completed: 18,
    inProgress: 4,
    abandoned: 3
  };

  // Alertas urgentes
  urgentAlerts: UrgentAlert[] = [
    {
      id: '1',
      type: 'critical',
      message: 'Paciente con signos vitales anormales',
      patient: 'Juan Pérez - Cama 15',
      time: 'Hace 2 minutos',
      action: 'Ver Signos Vitales'
    },
    {
      id: '2',
      type: 'warning',
      message: 'Cama de terapia intensiva disponible',
      time: 'Hace 10 minutos',
      action: 'Gestionar Camas'
    }
  ];

  // Próximas citas
  upcomingAppointments = [
    {
      patient: 'Patricia Ruiz',
      type: 'Consulta General',
      time: '10:30 AM',
      doctor: 'Dr. Martínez',
      status: 'confirmada'
    },
    {
      patient: 'Roberto García',
      type: 'Seguimiento',
      time: '11:15 AM',
      doctor: 'Dra. López',
      status: 'pendiente'
    },
    {
      patient: 'Elena Morales',
      type: 'Urgencia',
      time: '12:00 PM',
      doctor: 'Dr. Ramírez',
      status: 'urgente'
    }
  ];

  constructor() {}

  ngOnInit(): void {
    console.log('Dashboard del CICEG-HG inicializado correctamente');
    this.loadDashboardData();
  }

  // Cargar datos del dashboard
  loadDashboardData(): void {
    // Aquí podrías llamar a servicios reales
    console.log('Cargando datos del dashboard...');
  }

  // Obtener icono de tendencia
  getTrendIcon(trend: string): string {
    switch(trend) {
      case 'up': return 'M7 14l9-9 9 9';
      case 'down': return 'M17 14l-9-9-9 9';
      case 'stable': return 'M5 12h14';
      default: return 'M5 12h14';
    }
  }

  // Obtener clases CSS para estados
  getStatusClasses(status: string): string {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch(status) {
      case 'Completado':
      case 'Expediente Creado':
        return `${baseClasses} bg-emerald-50 text-emerald-700 border border-emerald-200`;
      case 'En Proceso':
      case 'Pendiente':
        return `${baseClasses} bg-amber-50 text-amber-700 border border-amber-200`;
      case 'Activo':
        return `${baseClasses} bg-blue-50 text-blue-700 border border-blue-200`;
      default:
        return `${baseClasses} bg-stone-100 text-stone-600`;
    }
  }

  // Obtener clases para alertas
  getAlertClasses(type: string): string {
    switch(type) {
      case 'critical':
        return 'bg-red-50 border-l-4 border-red-500 text-red-700';
      case 'warning':
        return 'bg-amber-50 border-l-4 border-amber-500 text-amber-700';
      case 'info':
        return 'bg-blue-50 border-l-4 border-blue-500 text-blue-700';
      default:
        return 'bg-stone-50 border-l-4 border-stone-400 text-stone-700';
    }
  }

  // Obtener ícono de alerta
  getAlertIcon(type: string): string {
    switch(type) {
      case 'critical':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z';
      case 'warning':
        return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'info':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  // Calcular porcentaje de progreso del wizard
  getWizardProgressPercentage(): number {
    return Math.round((this.wizardProgress.completed / this.wizardProgress.total) * 100);
  }

  // Métodos de tracking para Angular
  trackByTitle(index: number, item: any): string {
    return item.title;
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  // Métodos de navegación
  navigateToWizard(): void {
    console.log('Navegando al wizard de nuevo paciente...');
  }

  handleQuickAction(action: QuickAction): void {
    console.log(`Ejecutando acción rápida: ${action.title}`);
    if (action.isWizard) {
      console.log('Iniciando wizard...');
    }
  }

  handleUrgentAlert(alert: UrgentAlert): void {
    console.log(`Manejando alerta urgente: ${alert.message}`);
  }

  // Obtener mensaje de bienvenida según la hora
  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  // Obtener hora actual
  getCurrentTime(): string {
    return new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Funciones para exportar reportes
  exportReport(type: string): void {
    console.log(`Exportando reporte: ${type}`);
  }

  // Refrescar datos
  refreshData(): void {
    console.log('Actualizando datos del dashboard...');
    this.loadDashboardData();
  }
}
