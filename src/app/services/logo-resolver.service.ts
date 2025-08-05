// 🔥 NUEVO: src/app/services/logo-resolver.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environments';

export interface ConfiguracionLogos {
  logo_gobierno?: string;
  logo_principal?: string;
  logo_sidebar?: string;
  nombre_hospital?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogoResolverService {
  private readonly API_URL = `${environment.apiUrl}/configuracion`;

  constructor(private http: HttpClient) {}

  // 🔥 OBTENER CONFIGURACIÓN DE LOGOS DESDE EL BACKEND
  async obtenerConfiguracionLogos(): Promise<ConfiguracionLogos> {
    try {
      const config = await this.http.get<ConfiguracionLogos>(`${this.API_URL}/logos`).toPromise();
      
      return {
        logo_gobierno: this.resolverRutaLogo(config?.logo_gobierno, 'gobierno'),
        logo_principal: this.resolverRutaLogo(config?.logo_principal, 'principal'),
        logo_sidebar: this.resolverRutaLogo(config?.logo_sidebar, 'sidebar'),
        nombre_hospital: config?.nombre_hospital || 'Hospital General San Luis de la Paz'
      };
    } catch (error) {
      console.warn('⚠️ No se pudo obtener configuración, usando valores por defecto');
      return this.obtenerConfiguracionPorDefecto();
    }
  }

  // 🔥 RESOLVER RUTA PRIORITARIA PARA UN LOGO
  private resolverRutaLogo(rutaConfig: string | undefined, tipo: string): string {
    // Si hay configuración específica, usarla
    if (rutaConfig) {
      return rutaConfig.startsWith('http') 
        ? rutaConfig 
        : `${environment.BASE_URL}${rutaConfig}`;
    }

    // Sino, usar sistema de prioridad
    return `/uploads/logos/logo-${tipo}-importado.png`; // Prioridad 1
  }

  // 🔥 CONFIGURACIÓN POR DEFECTO MEJORADA
  private obtenerConfiguracionPorDefecto(): ConfiguracionLogos {
    return {
      logo_gobierno: '/uploads/logos/logo-gobierno-importado.png',
      logo_principal: '/uploads/logos/logo-principal-importado.png',
      logo_sidebar: '/uploads/logos/logo-sidebar-importado.png',
      nombre_hospital: 'Hospital General San Luis de la Paz'
    };
  }

  // 🔥 VERIFICAR SI EXISTE UNA IMAGEN
  async verificarExistenciaImagen(ruta: string): Promise<boolean> {
    try {
      const urlCompleta = ruta.startsWith('http') 
        ? ruta 
        : `${environment.BASE_URL}${ruta}`;
        
      const response = await this.http.head(urlCompleta).toPromise();
      return true;
    } catch {
      return false;
    }
  }
}