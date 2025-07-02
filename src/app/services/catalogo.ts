// C:\CICEG-HG-APP\src\app\services\catalogo.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { API_CONFIG, ApiResponse } from '../models/base.models';

// ==========================================
// INTERFACES ESPECÍFICAS
// ==========================================
export interface CatalogoItem {
  value: string | number;
  label: string;
  descripcion?: string;
  activo?: boolean;
  orden?: number;
}

export interface CatalogoResponse {
  success: boolean;
  data: CatalogoItem[];
  mensaje?: string;
}

// ==========================================
// TIPOS DE CATÁLOGOS DISPONIBLES
// ==========================================
export type TipoCatalogo =
  | 'tipos_sangre'
  | 'estados_civiles'
  | 'religiones'
  | 'servicios'
  | 'especialidades_medicas'
  | 'tipos_documentos_clinicos'
  | 'areas_interconsulta'
  | 'parentescos'
  | 'niveles_escolaridad'
  | 'estados_republica'
  | 'tipos_egreso'
  | 'estados_documento';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {

  private readonly baseUrl = `${API_CONFIG.BASE_URL}/catalogos`;

  // ==========================================
  // CACHE DE CATÁLOGOS
  // ==========================================
  private catalogosCache = new Map<TipoCatalogo, BehaviorSubject<CatalogoItem[]>>();
  private cacheTimestamps = new Map<TipoCatalogo, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor(private http: HttpClient) {
    this.initializeCache();
  }

  // ==========================================
  // MÉTODOS PRINCIPALES
  // ==========================================

  /**
   * Obtener un catálogo específico
   */
  getCatalogo(tipo: TipoCatalogo, forceRefresh = false): Observable<CatalogoItem[]> {
    const cached = this.catalogosCache.get(tipo);
    const timestamp = this.cacheTimestamps.get(tipo) || 0;
    const isExpired = Date.now() - timestamp > this.CACHE_DURATION;

    if (!cached || forceRefresh || isExpired) {
      return this.fetchCatalogo(tipo);
    }

    return cached.asObservable();
  }

  /**
   * Obtener múltiples catálogos de una vez
   */
  getCatalogos(tipos: TipoCatalogo[]): Observable<{ [key in TipoCatalogo]?: CatalogoItem[] }> {
    const requests = tipos.reduce((acc, tipo) => {
      acc[tipo] = this.getCatalogo(tipo);
      return acc;
    }, {} as { [key in TipoCatalogo]: Observable<CatalogoItem[]> });

    return forkJoin(requests);
  }

  /**
   * Precargar todos los catálogos esenciales para el wizard
   */
  preloadEssentialCatalogos(): Observable<boolean> {
    const essentialTypes: TipoCatalogo[] = [
      'tipos_sangre',
      'estados_civiles',
      'religiones',
      'servicios',
      'parentescos',
      'niveles_escolaridad',
      'tipos_documentos_clinicos'
    ];

    return this.getCatalogos(essentialTypes).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  // ==========================================
  // CATÁLOGOS ESPECÍFICOS PARA EL WIZARD
  // ==========================================

  /** Tipos de sangre para el formulario de paciente */
  getTiposSangre(): Observable<CatalogoItem[]> {
    return this.getCatalogo('tipos_sangre');
  }

  /** Estados civiles para datos personales */
  getEstadosCiviles(): Observable<CatalogoItem[]> {
    return this.getCatalogo('estados_civiles');
  }

  /** Religiones para datos personales */
  getReligiones(): Observable<CatalogoItem[]> {
    return this.getCatalogo('religiones');
  }

  /** Servicios hospitalarios */
  getServicios(): Observable<CatalogoItem[]> {
    return this.getCatalogo('servicios');
  }

  /** Parentescos para familiar responsable */
  getParentescos(): Observable<CatalogoItem[]> {
    return this.getCatalogo('parentescos');
  }

  /** Niveles de escolaridad */
  getNivelesEscolaridad(): Observable<CatalogoItem[]> {
    return this.getCatalogo('niveles_escolaridad');
  }

  /** Tipos de documentos clínicos */
  getTiposDocumentosClinicos(): Observable<CatalogoItem[]> {
    return this.getCatalogo('tipos_documentos_clinicos');
  }

  /** Especialidades médicas */
  getEspecialidadesMedicas(): Observable<CatalogoItem[]> {
    return this.getCatalogo('especialidades_medicas');
  }

  /** Estados de la República Mexicana */
  getEstadosRepublica(): Observable<CatalogoItem[]> {
    return this.getCatalogo('estados_republica');
  }

  // ==========================================
  // CATÁLOGOS ESTÁTICOS (FALLBACK)
  // ==========================================

  /** Obtener catálogo estático como fallback */
  private getStaticCatalogo(tipo: TipoCatalogo): CatalogoItem[] {
    switch (tipo) {
      case 'tipos_sangre':
        return [
          { value: 'A+', label: 'A+' },
          { value: 'A-', label: 'A-' },
          { value: 'B+', label: 'B+' },
          { value: 'B-', label: 'B-' },
          { value: 'AB+', label: 'AB+' },
          { value: 'AB-', label: 'AB-' },
          { value: 'O+', label: 'O+' },
          { value: 'O-', label: 'O-' },
          { value: 'Desconocido', label: 'Desconocido' }
        ];

      case 'estados_civiles':
        return [
          { value: 'Soltero(a)', label: 'Soltero(a)' },
          { value: 'Casado(a)', label: 'Casado(a)' },
          { value: 'Divorciado(a)', label: 'Divorciado(a)' },
          { value: 'Viudo(a)', label: 'Viudo(a)' },
          { value: 'Unión libre', label: 'Unión libre' },
          { value: 'Separado(a)', label: 'Separado(a)' }
        ];

      case 'religiones':
        return [
          { value: 'Católica', label: 'Católica' },
          { value: 'Protestante', label: 'Protestante' },
          { value: 'Evangélica', label: 'Evangélica' },
          { value: 'Testigo de Jehová', label: 'Testigo de Jehová' },
          { value: 'Judaísmo', label: 'Judaísmo' },
          { value: 'Islam', label: 'Islam' },
          { value: 'Budista', label: 'Budista' },
          { value: 'Ninguna', label: 'Ninguna' },
          { value: 'Otra', label: 'Otra' }
        ];

      case 'parentescos':
        return [
          { value: 'Padre', label: 'Padre' },
          { value: 'Madre', label: 'Madre' },
          { value: 'Esposo(a)', label: 'Esposo(a)' },
          { value: 'Hijo(a)', label: 'Hijo(a)' },
          { value: 'Hermano(a)', label: 'Hermano(a)' },
          { value: 'Abuelo(a)', label: 'Abuelo(a)' },
          { value: 'Tío(a)', label: 'Tío(a)' },
          { value: 'Primo(a)', label: 'Primo(a)' },
          { value: 'Amigo(a)', label: 'Amigo(a)' },
          { value: 'Tutor Legal', label: 'Tutor Legal' },
          { value: 'Otro', label: 'Otro' }
        ];

      case 'niveles_escolaridad':
        return [
          { value: 'Sin estudios', label: 'Sin estudios' },
          { value: 'Primaria incompleta', label: 'Primaria incompleta' },
          { value: 'Primaria completa', label: 'Primaria completa' },
          { value: 'Secundaria incompleta', label: 'Secundaria incompleta' },
          { value: 'Secundaria completa', label: 'Secundaria completa' },
          { value: 'Preparatoria incompleta', label: 'Preparatoria incompleta' },
          { value: 'Preparatoria completa', label: 'Preparatoria completa' },
          { value: 'Técnico', label: 'Técnico' },
          { value: 'Licenciatura incompleta', label: 'Licenciatura incompleta' },
          { value: 'Licenciatura completa', label: 'Licenciatura completa' },
          { value: 'Posgrado', label: 'Posgrado' },
          { value: 'Otro', label: 'Otro' }
        ];

      case 'servicios':
        return [
          { value: 'Medicina Interna', label: 'Medicina Interna' },
          { value: 'Cirugía General', label: 'Cirugía General' },
          { value: 'Pediatría', label: 'Pediatría' },
          { value: 'Ginecología', label: 'Ginecología' },
          { value: 'Traumatología', label: 'Traumatología' },
          { value: 'Urgencias', label: 'Urgencias' },
          { value: 'Consulta Externa', label: 'Consulta Externa' },
          { value: 'Hospitalización', label: 'Hospitalización' }
        ];

      case 'tipos_documentos_clinicos':
        return [
          { value: 'Historia Clínica', label: 'Historia Clínica' },
          { value: 'Nota de Ingreso', label: 'Nota de Ingreso' },
          { value: 'Nota de Evolución', label: 'Nota de Evolución' },
          { value: 'Nota de Egreso', label: 'Nota de Egreso' },
          { value: 'Interconsulta', label: 'Interconsulta' },
          { value: 'Registro de Transfusión', label: 'Registro de Transfusión' },
          { value: 'Signos Vitales', label: 'Signos Vitales' }
        ];

      default:
        return [];
    }
  }

  // ==========================================
  // MÉTODOS PRIVADOS
  // ==========================================

  private initializeCache(): void {
    const tipos: TipoCatalogo[] = [
      'tipos_sangre', 'estados_civiles', 'religiones', 'servicios',
      'especialidades_medicas', 'tipos_documentos_clinicos', 'areas_interconsulta',
      'parentescos', 'niveles_escolaridad', 'estados_republica', 'tipos_egreso', 'estados_documento'
    ];

    tipos.forEach(tipo => {
      this.catalogosCache.set(tipo, new BehaviorSubject<CatalogoItem[]>([]));
    });
  }

  private fetchCatalogo(tipo: TipoCatalogo): Observable<CatalogoItem[]> {
    const url = `${this.baseUrl}/${tipo}`;

    return this.http.get<CatalogoResponse>(url).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.mensaje || 'Error al cargar catálogo');
      }),
      catchError(error => {
        console.warn(`Error al cargar catálogo ${tipo}, usando datos estáticos:`, error);
        // Fallback a datos estáticos
        return of(this.getStaticCatalogo(tipo));
      }),
      tap(data => {
        // Actualizar cache
        const cached = this.catalogosCache.get(tipo);
        if (cached) {
          cached.next(data);
          this.cacheTimestamps.set(tipo, Date.now());
        }
      })
    );
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  /** Limpiar cache de catálogos */
  clearCache(): void {
    this.catalogosCache.forEach(subject => subject.next([]));
    this.cacheTimestamps.clear();
  }

  /** Refrescar un catálogo específico */
  refreshCatalogo(tipo: TipoCatalogo): Observable<CatalogoItem[]> {
    return this.getCatalogo(tipo, true);
  }

  /** Verificar si un catálogo está cargado */
  isCatalogoLoaded(tipo: TipoCatalogo): boolean {
    const cached = this.catalogosCache.get(tipo);
    return cached ? cached.value.length > 0 : false;
  }

  /** Obtener estado de carga de catálogos esenciales */
  getEssentialCatalogosStatus(): Observable<{ [key: string]: boolean }> {
    const essentialTypes: TipoCatalogo[] = [
      'tipos_sangre', 'estados_civiles', 'religiones',
      'parentescos', 'niveles_escolaridad', 'tipos_documentos_clinicos'
    ];

    const status: { [key: string]: boolean } = {};
    essentialTypes.forEach(tipo => {
      status[tipo] = this.isCatalogoLoaded(tipo);
    });

    return of(status);
  }

  // ==========================================
  // BÚSQUEDA Y FILTRADO
  // ==========================================

  /** Buscar en un catálogo */
  searchInCatalogo(tipo: TipoCatalogo, searchTerm: string): Observable<CatalogoItem[]> {
    return this.getCatalogo(tipo).pipe(
      map(items => {
        if (!searchTerm.trim()) return items;

        const term = searchTerm.toLowerCase();
        return items.filter(item =>
          item.label.toLowerCase().includes(term) ||
          (item.descripcion && item.descripcion.toLowerCase().includes(term))
        );
      })
    );
  }

  /** Obtener un item específico de un catálogo */
  getCatalogoItem(tipo: TipoCatalogo, value: string | number): Observable<CatalogoItem | undefined> {
    return this.getCatalogo(tipo).pipe(
      map(items => items.find(item => item.value === value))
    );
  }

  /** Validar si un valor existe en un catálogo */
  validateCatalogoValue(tipo: TipoCatalogo, value: string | number): Observable<boolean> {
    return this.getCatalogo(tipo).pipe(
      map(items => items.some(item => item.value === value))
    );
  }
}
