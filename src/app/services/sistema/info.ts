// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class Info {

//   constructor() { }
// }




















// src/app/services/sistema/info.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from '../base.service';
import { ApiResponse } from '../../models/base.models';

// ==========================================
// INTERFACES ESPECÍFICAS
// ==========================================

export interface SistemaInfo {
  hospital: string;
  ubicacion: string;
  sistema: string;
  version: string;
  estado: string;
  timestamp: string;
  documentacion: {
    health_check: string;
    info_sistema: string;
    endpoints: {
      catalogos: string;
      personas: string;
      expedientes: string;
      documentos_clinicos: string;
      notas_especializadas: string;
    };
  };
  contacto: {
    desarrollo: string;
    email: string;
    soporte: string;
  };
}

export interface HealthCheck {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
}

export interface EstadisticasGenerales {
  nota: string;
  enlaces_estadisticas: {
    tipos_sangre: string;
    servicios: string;
    areas_interconsulta: string;
    vacunas: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SistemaInfoService extends BaseService<SistemaInfo> {
  protected override endpoint = '/sistema';

  // ==========================================
  // MÉTODOS ESPECÍFICOS DEL SISTEMA
  // ==========================================

  /**
   * Obtener información general del sistema
   */
  getInfoSistema(): Observable<SistemaInfo> {
    return this.customGet<SistemaInfo>('/info').pipe(
      map(response => response.data!)
    );
  }

  /**
   * Verificar estado de salud de la API
   */
  getHealthCheck(): Observable<HealthCheck> {
    return this.http.get<ApiResponse<HealthCheck>>(`${this.baseUrl}/health`).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Obtener estadísticas generales del sistema
   */
  getEstadisticasGenerales(): Observable<EstadisticasGenerales> {
    return this.customGet<EstadisticasGenerales>('/estadisticas').pipe(
      map(response => response.data!)
    );
  }

  /**
   * Verificar conectividad completa del sistema
   */
  verificarConectividad(): Observable<{
    api_principal: boolean;
    base_datos: boolean;
    servicios_externos: boolean;
    tiempo_respuesta: number;
  }> {
    const startTime = Date.now();

    return this.getHealthCheck().pipe(
      map(health => ({
        api_principal: health.status === 'healthy',
        base_datos: true, // Se puede implementar una verificación específica
        servicios_externos: true, // Se puede implementar verificaciones adicionales
        tiempo_respuesta: Date.now() - startTime
      }))
    );
  }

  /**
   * Obtener información de endpoints disponibles
   */
  getEndpointsDisponibles(): Observable<string[]> {
    return this.getInfoSistema().pipe(
      map(info => {
        const endpoints: string[] = [];

        // Extraer endpoints de la documentación
        Object.values(info.documentacion.endpoints).forEach(endpoint => {
          endpoints.push(endpoint);
        });

        // Agregar endpoints específicos
        endpoints.push(info.documentacion.health_check);
        endpoints.push(info.documentacion.info_sistema);

        return endpoints;
      })
    );
  }

  /**
   * Obtener versión del sistema
   */
  getVersion(): Observable<string> {
    return this.getInfoSistema().pipe(
      map(info => info.version)
    );
  }

  /**
   * Verificar si hay actualizaciones disponibles
   */
  verificarActualizaciones(): Observable<{
    version_actual: string;
    version_disponible: string;
    hay_actualizacion: boolean;
    notas_version?: string;
  }> {
    return this.getVersion().pipe(
      map(versionActual => ({
        version_actual: versionActual,
        version_disponible: versionActual, // En el futuro se puede consultar un servicio externo
        hay_actualizacion: false,
        notas_version: 'Sistema actualizado'
      }))
    );
  }

  // ==========================================
  // MÉTODOS DE MONITOREO
  // ==========================================

  /**
   * Obtener métricas de rendimiento
   */
  getMetricasRendimiento(): Observable<{
    uptime: number;
    memoria_uso: string;
    cpu_uso: string;
    conexiones_activas: number;
    tiempo_respuesta_promedio: number;
  }> {
    return this.getHealthCheck().pipe(
      map(health => ({
        uptime: health.uptime,
        memoria_uso: 'N/A', // Se puede implementar desde el backend
        cpu_uso: 'N/A',
        conexiones_activas: 0,
        tiempo_respuesta_promedio: 0
      }))
    );
  }

  /**
   * Obtener logs del sistema (si están disponibles)
   */
  getLogs(nivel: 'error' | 'warn' | 'info' | 'debug' = 'info', limite: number = 100): Observable<any[]> {
    return this.customGet<any[]>(`/logs`, { nivel, limite }).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Limpiar caché del sistema (si está implementado)
   */
  limpiarCache(): Observable<boolean> {
    return this.customPost<any>('/cache/clear', {}).pipe(
      map(response => response.success)
    );
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /**
   * Formatear tiempo de actividad en formato legible
   */
  formatearUptime(uptime: number): string {
    const dias = Math.floor(uptime / 86400);
    const horas = Math.floor((uptime % 86400) / 3600);
    const minutos = Math.floor((uptime % 3600) / 60);

    if (dias > 0) {
      return `${dias}d ${horas}h ${minutos}m`;
    } else if (horas > 0) {
      return `${horas}h ${minutos}m`;
    } else {
      return `${minutos}m`;
    }
  }

  /**
   * Verificar si el sistema está en mantenimiento
   */
  estaEnMantenimiento(): Observable<boolean> {
    return this.getHealthCheck().pipe(
      map(health => health.status === 'maintenance')
    );
  }

  /**
   * Obtener información de contacto
   */
  getContactoSoporte(): Observable<{
    desarrollo: string;
    email: string;
    soporte: string;
  }> {
    return this.getInfoSistema().pipe(
      map(info => info.contacto)
    );
  }
}
