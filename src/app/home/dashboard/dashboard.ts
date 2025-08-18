// C:\Proyectos\CICEG-HG_Frontend\src\app\home\dashboard\dashboard.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';

// Servicios del sistema SICEG-HG
import { PacientesService } from '../../services/personas/pacientes';
import { ExpedientesService } from '../../services/gestion-expedientes/expedientes';
import { DocumentosService } from '../../services/documentos-clinicos/documentos';
import { SistemaInfoService } from '../../services/sistema/info';
import { AuthService } from '../../services/auth/auth.service';

// Interfaces específicas del dashboard
interface EstadisticasSistema {
  pacientesActivos: number;
  pacientesNuevos: number;
  expedientesNuevos: number;
  documentosClinicosHoy: number;
  camasOcupadas: number;
  camasTotal: number;
}

interface ActividadReciente {
  id: string;
  type: string;
  patient: string;
  status: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  action?: string;
}

interface AlertaUrgente {
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
export class Dashboard implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // ==========================================
  // PROPIEDADES DEL COMPONENTE
  // ==========================================

  user = {
    nombre: 'Dr. Administrador',
    apellido_paterno: 'Sistema'
  };

  // Control de visualización
  mostrarEstadisticas = true;
  cargandoDatos = false;

  // Estadísticas del sistema
  statistics: EstadisticasSistema = {
    pacientesActivos: 0,
    pacientesNuevos: 0,
    expedientesNuevos: 0,
    documentosClinicosHoy: 0,
    camasOcupadas: 0,
    camasTotal: 20
  };

  // Datos para mostrar
  estadisticas: any = null;
  recentActivities: ActividadReciente[] = [];
  urgentAlerts: AlertaUrgente[] = [];

  constructor(
    private pacientesService: PacientesService,
    private expedientesService: ExpedientesService,
    private documentosService: DocumentosService,
    private sistemaInfoService: SistemaInfoService,
    private authService: AuthService,
        private router: Router // 🔥 Inyectar Router aquí
  ) {}

  ngOnInit(): void {
    console.log('   Dashboard SICEG-HG inicializado correctamente');
    this.inicializarDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // MÉTODOS DE INICIALIZACIÓN
  // ==========================================

  private inicializarDashboard(): void {
    this.obtenerUsuarioActual();
    this.cargarDatosDashboard();
    this.configurarActualizacionAutomatica();
  }

  private obtenerUsuarioActual(): void {
    const usuarioLogueado = this.authService.getCurrentUser();
    if (usuarioLogueado) {
      // Extraer nombre y apellido del nombre_completo o usar propiedades individuales
      const nombreCompleto = usuarioLogueado.nombre_completo || '';
      const partesNombre = nombreCompleto.split(' ');

      this.user = {
        nombre: partesNombre[0] || 'Dr. Usuario',
        apellido_paterno: partesNombre[1] || 'Sistema'
      };
    }
  }

  private cargarDatosDashboard(): void {
    this.cargandoDatos = true;
    console.log('  Cargando datos del dashboard...');

    // Cargar datos en paralelo con manejo de errores individual
    forkJoin({
      estadisticasPacientes: this.pacientesService.getEstadisticas().pipe(
        takeUntil(this.destroy$)
      ),
      actividadReciente: of(this.obtenerActividadReciente()),
      infoSistema: this.sistemaInfoService.getInfoSistema().pipe(
        takeUntil(this.destroy$)
      ),
      alertas: of(this.obtenerAlertas())
    }).subscribe({
      next: (datos) => {
        console.log('  Datos del dashboard cargados:', datos);
        this.procesarEstadisticas(datos.estadisticasPacientes);
        this.recentActivities = datos.actividadReciente as ActividadReciente[];
        this.urgentAlerts = datos.alertas as AlertaUrgente[];
        this.estadisticas = datos.estadisticasPacientes;
        this.cargandoDatos = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar datos del dashboard:', error);
        this.cargarDatosMock(); // Datos de respaldo
        this.cargandoDatos = false;
      }
    });
  }

  private procesarEstadisticas(stats: any): void {
    if (stats?.resumen) {
      this.statistics = {
        pacientesActivos: stats.resumen.total_pacientes || 0,
        pacientesNuevos: stats.resumen.consultas_mes_actual || 0,
        expedientesNuevos: stats.resumen.pacientes_activos || 0,
        documentosClinicosHoy: 15, // Este dato se calculará con el servicio real
        camasOcupadas: 12,
        camasTotal: 20
      };
    }
  }



  private obtenerActividadReciente(): ActividadReciente[] {
    // Datos de actividad reciente del sistema SICEG-HG
    return [
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
        type: 'Nota de Evolución',
        patient: 'Ana Martínez Sánchez - CURP: MASA920308MGTRNR03',
        status: 'Completada',
        time: 'Hace 30 minutos',
        priority: 'low',
        action: 'Ver Detalles'
      },
      {
        id: '4',
        type: 'Expediente Nuevo',
        patient: 'José Luis Hernández - CURP: HELJ750612HGTRSN04',
        status: 'Pendiente',
        time: 'Hace 1 hora',
        priority: 'medium',
        action: 'Continuar Registro'
      },
      {
        id: '5',
        type: 'Nota de Urgencias',
        patient: 'Laura Jiménez Morales - CURP: JIML950215MGTMRL05',
        status: 'Completada',
        time: 'Hace 2 horas',
        priority: 'high',
        action: 'Ver PDF'
      }
    ];
  }

  private obtenerAlertas(): AlertaUrgente[] {
    // Alertas del sistema hospitalario
    return [
      {
        id: '1',
        type: 'warning',
        message: 'Cama de terapia intensiva disponible',
        time: 'Hace 10 minutos',
        action: 'Gestionar Camas'
      },
      {
        id: '2',
        type: 'info',
        message: 'Nuevo módulo de PDFs implementado y funcionando',
        time: 'Hace 2 horas',
        action: 'Ver Documentación'
      },
      {
        id: '3',
        type: 'info',
        message: 'Catálogo de guías clínicas actualizado',
        time: 'Hace 4 horas',
        action: 'Ver Catálogo'
      }
    ];
  }

  private cargarDatosMock(): void {
    console.log('  Cargando datos de respaldo...');

    this.statistics = {
      pacientesActivos: 142,
      pacientesNuevos: 23,
      expedientesNuevos: 18,
      documentosClinicosHoy: 15,
      camasOcupadas: 12,
      camasTotal: 20
    };

    this.recentActivities = [
      {
        id: '1',
        type: 'Wizard Completado',
        patient: 'Paciente de Demostración',
        status: 'Completado',
        time: 'Hace 10 minutos',
        priority: 'high',
        action: 'Ver Detalles'
      }
    ];

    this.urgentAlerts = [
      {
        id: '1',
        type: 'info',
        message: 'Sistema funcionando en modo de demostración',
        time: 'Ahora',
        action: 'Configurar'
      }
    ];

    this.estadisticas = { resumen: this.statistics };
  }

  private configurarActualizacionAutomatica(): void {
    // Actualizar datos cada 5 minutos
    setInterval(() => {
      if (!this.cargandoDatos) {
        console.log('  Actualizando datos automáticamente...');
        this.cargarDatosDashboard();
      }
    }, 300000); // 5 minutos
  }

  // ==========================================
  // MÉTODOS DE INTERFAZ
  // ==========================================

  toggleEstadisticas(): void {
    this.mostrarEstadisticas = !this.mostrarEstadisticas;
    console.log('  Estadísticas:', this.mostrarEstadisticas ? 'mostradas' : 'ocultas');
  }

  refreshData(): void {
    console.log('  Actualizando datos manualmente...');
    this.cargarDatosDashboard();
  }

  getOcupacionPorcentaje(): number {
    return Math.round((this.statistics.camasOcupadas / this.statistics.camasTotal) * 100);
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ==========================================
  // MÉTODOS DE ESTILO Y CLASES CSS
  // ==========================================

  getStatusClasses(status: string): string {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch(status) {
      case 'Completado':
      case 'Completada':
      case 'Expediente Creado':
        return `${baseClasses} bg-emerald-50 text-emerald-700 border border-emerald-200`;
      case 'En Proceso':
      case 'Pendiente':
        return `${baseClasses} bg-amber-50 text-amber-700 border border-amber-200`;
      case 'Activo':
        return `${baseClasses} bg-blue-50 text-blue-700 border border-blue-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`;
    }
  }

  getAlertClasses(type: string): string {
    switch(type) {
      case 'critical':
        return 'bg-red-50 border-red-500 text-red-700';
      case 'warning':
        return 'bg-amber-50 border-amber-500 text-amber-700';
      case 'info':
        return 'bg-blue-50 border-blue-500 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-400 text-gray-700';
    }
  }

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

  // ==========================================
  // MÉTODOS DE MANEJO DE EVENTOS
  // ==========================================

  handleUrgentAlert(alert: AlertaUrgente): void {
    console.log(`🚨 Manejando alerta urgente: ${alert.message}`);

    switch(alert.action) {
      case 'Gestionar Camas':
        this.navigateTo('/app/gestion-expedientes/camas');
        break;
      case 'Ver Documentación':
        console.log('📚 Abriendo documentación...');
        break;
      case 'Ver Catálogo':
        this.navigateTo('/app/catalogos/guias-clinicas');
        break;
      case 'Configurar':
        console.log('⚙️ Abriendo configuración...');
        break;
      default:
        console.log('🔧 Acción no implementada:', alert.action);
    }
  }

  handleActivityAction(activity: ActividadReciente): void {
    console.log(`  Ejecutando acción: ${activity.action} para ${activity.type}`);

    switch(activity.action) {
      case 'Ver Expediente':
        console.log('📄 Abriendo expediente...');
        // TODO: Implementar navegación al expediente específico
        break;
      case 'Ver Detalles':
        console.log('  Mostrando detalles...');
        break;
      case 'Continuar':
        console.log('➡️ Continuando proceso...');
        break;
      case 'Continuar Registro':
        this.navigateTo('/app/nuevo-paciente/inicio');
        break;
      case 'Ver PDF':
        console.log('📄 Abriendo PDF generado...');
        break;
      default:
        console.log('🔧 Acción no implementada:', activity.action);
    }
  }

   private navigateTo(route: string): void {
    this.router.navigate([route]); // Usar router en lugar de window.location.href
  }

  // ==========================================
  // MÉTODOS DE TRACKING PARA ANGULAR
  // ==========================================

  trackById(index: number, item: any): string {
    return item.id;
  }

  trackByType(index: number, item: any): string {
    return item.type;
  }

    // 🔥 MÉTODO CORREGIDO
  irAAreaBienestar(): void {
    console.log('🎯 Navegando al área de bienestar...');
    this.router.navigate(['/app/bienestar']);
  }


}
