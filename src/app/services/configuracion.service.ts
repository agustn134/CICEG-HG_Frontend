// src/app/services/configuracion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ConfiguracionSistema, ConfiguracionLogos, CONFIGURACION_DEFAULT } from '../models/configuracion.model';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private readonly API_URL = 'http://localhost:3000/api/configuracion';
  private readonly BASE_URL = 'http://localhost:3000'; // 🔥 AGREGADO

  // Estado reactivo de la configuración
  private configuracionSubject = new BehaviorSubject<ConfiguracionLogos>(CONFIGURACION_DEFAULT);
  public configuracion$ = this.configuracionSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarConfiguracion();
  }

  // Cargar configuración al iniciar
  private cargarConfiguracion(): void {
    this.getConfiguracionCompleta().subscribe({
      next: (config) => {
        // 🔥 CONVERTIR RUTAS RELATIVAS A ABSOLUTAS
        const configCompleta = this.normalizarRutas(config);
        this.configuracionSubject.next(configCompleta);
        this.aplicarConfiguracion(configCompleta);
      },
      error: (error) => {
        console.error('Error al cargar configuración:', error);
        // Usar configuración por defecto
        const configDefault = this.normalizarRutas(CONFIGURACION_DEFAULT);
        this.configuracionSubject.next(configDefault);
        this.aplicarConfiguracion(configDefault);
      }
    });
  }

  // 🔥 NUEVO: Normalizar rutas para que funcionen correctamente
  private normalizarRutas(config: ConfiguracionLogos): ConfiguracionLogos {
    return {
      ...config,
      logo_principal: this.construirUrlCompleta(config.logo_principal),
      logo_sidebar: this.construirUrlCompleta(config.logo_sidebar),
      favicon: this.construirUrlCompleta(config.favicon),
      logo_gobierno: this.construirUrlCompleta(config.logo_gobierno)
    };
  }

  // 🔥 NUEVO: Construir URL completa
  private construirUrlCompleta(ruta: string): string {
    if (!ruta) return `${this.BASE_URL}/uploads/logos/logo-default.png`;

    // Si ya es una URL completa, devolverla tal como está
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) {
      return ruta;
    }

    // Si es una ruta relativa, construir URL completa
    if (ruta.startsWith('/uploads/') || ruta.startsWith('uploads/')) {
      const rutaLimpia = ruta.startsWith('/') ? ruta : `/${ruta}`;
      return `${this.BASE_URL}${rutaLimpia}`;
    }

    // Fallback para otras rutas
    return `${this.BASE_URL}/uploads/logos/${ruta}`;
  }

  // Obtener configuración completa
  getConfiguracionCompleta(): Observable<ConfiguracionLogos> {
    return this.http.get<ConfiguracionLogos>(`${this.API_URL}/logos`).pipe(
      map(config => this.normalizarRutas(config)),
      catchError(error => {
        console.error('Error al obtener configuración:', error);
        return [this.normalizarRutas(CONFIGURACION_DEFAULT)];
      })
    );
  }

  // Actualizar configuración
  actualizarConfiguracion(config: Partial<ConfiguracionLogos>): Observable<any> {
    return this.http.put(`${this.API_URL}/logos`, config).pipe(
      tap(() => {
        const configuracionActual = this.configuracionSubject.value;
        const nuevaConfiguracion = this.normalizarRutas({ ...configuracionActual, ...config });
        this.configuracionSubject.next(nuevaConfiguracion);
        this.aplicarConfiguracion(nuevaConfiguracion);
      })
    );
  }

  // 🔥 CORREGIDO: Subir logo con mejor manejo de errores
  subirLogo(archivo: File, tipo: 'principal' | 'sidebar' | 'favicon' | 'gobierno'): Observable<any> {
    // Validar tipos de archivo
    const extensionesValidas = {
      principal: ['image/png', 'image/jpeg', 'image/svg+xml'],
      sidebar: ['image/png', 'image/jpeg', 'image/svg+xml'],
      favicon: ['image/x-icon', 'image/png', 'image/svg+xml'],
      gobierno: ['image/png', 'image/jpeg', 'image/svg+xml']
    };

    if (!extensionesValidas[tipo].includes(archivo.type)) {
      const extensiones = extensionesValidas[tipo].map(ext => ext.split('/')[1]).join(', ');
      throw new Error(`Formato no válido. Para ${tipo} use: ${extensiones}`);
    }

    // Validar tamaño máximo (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (archivo.size > maxSize) {
      throw new Error(`El archivo no debe exceder los 2MB`);
    }

    const formData = new FormData();
    formData.append('archivo', archivo); // 🔥 DEBE COINCIDIR CON EL BACKEND
    formData.append('tipo', tipo);

    console.log('🔥 DEBUG: FormData creado:', {
    archivo: archivo.name,
    tipo: tipo,
    size: archivo.size
  });

    return this.http.post(`${this.API_URL}/upload-logo`, formData).pipe(
      tap((response: any) => {
        // 🔥 ACTUALIZAR CONFIGURACIÓN INMEDIATAMENTE
        if (response.success && response.data?.ruta) {
          const configuracionActual = this.configuracionSubject.value;
          const campo = `logo_${tipo}` as keyof ConfiguracionLogos;
          const nuevaConfiguracion = {
            ...configuracionActual,
            [campo]: this.construirUrlCompleta(response.data.ruta)
          };

          this.configuracionSubject.next(nuevaConfiguracion);
          this.aplicarConfiguracion(nuevaConfiguracion);
        }
      })
    );
  }

  // Aplicar configuración al DOM
  private aplicarConfiguracion(config: ConfiguracionLogos): void {
    // 🔥 COMENTADO: Favicon ya está configurado en index.html como favicon-siceg.ico
    // No se modifica para mantener el favicon personalizado del hospital
    // let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    // if (!favicon) {
    //   favicon = document.createElement('link');
    //   favicon.rel = 'icon';
    //   document.head.appendChild(favicon);
    // }
    // favicon.href = config.favicon;

    // Cambiar título
    document.title = config.nombre_hospital;

    // Aplicar colores CSS
    const root = document.documentElement;
    root.style.setProperty('--color-primario', config.color_primario);
    root.style.setProperty('--color-secundario', config.color_secundario);
    root.style.setProperty('--hospital-primary', config.color_primario);
    root.style.setProperty('--hospital-secondary', config.color_secundario);
  }

  // Getters para componentes
  get configuracionActual(): ConfiguracionLogos {
    return this.configuracionSubject.value;
  }
}
