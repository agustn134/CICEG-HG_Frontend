// C:\CICEG-HG-APP\src\app\services\catalogo.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, catchError, tap, shareReplay, timeout } from 'rxjs/operators';
import { API_CONFIG, ApiResponse } from '../models/base.models';

// ==========================================
// INTERFACES ESPECÍFICAS
// ==========================================
// export interface CatalogoItem {
//   value: string | number;
//   label: string;
//   descripcion?: string;
//   activo?: boolean;
//   orden?: number;
// }
export interface CatalogoItem {
  value: string | number;
  label: string;
  descripcion?: string;
  activo?: boolean;
  orden?: number;
  // 🔧 AGREGAR PROPIEDADES PARA TIPOS DE SANGRE
  id?: number;
  id_tipo_sangre?: number;
}

export interface CatalogoResponse {
  success: boolean;
  data: CatalogoItem[];
  mensaje?: string;
}

export interface TipoDocumentoBackend {
  id_tipo_documento: number;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  activo: boolean;
  requiere_internamiento?: boolean;
  orden_hospitalario?: number;
  es_inicial?: boolean;
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

  /**
   * 🔥 NUEVO: Obtener tipos de documento del backend
   * GET /api/catalogos/tipos-documento
   */
  getTiposDocumento(): Observable<TipoDocumentoBackend[]> {
    console.log('  Cargando tipos de documento desde:', `${this.baseUrl}/tipos-documento`);

    return this.http.get<any>(`${this.baseUrl}/tipos-documento`)
      .pipe(
        map(response => {
          // Si el response tiene structure de ApiResponse
          if (response.success && response.data) {
            console.log('  Respuesta del backend (tipos documento):', response.data);
            return response.data;
          }
          // Si el response es directo array
          else if (Array.isArray(response)) {
            console.log('  Respuesta directa del backend (tipos documento):', response);
            return response;
          }
          // Si no hay datos
          else {
            console.warn('  Respuesta inesperada del backend:', response);
            return [];
          }
        }),
        catchError(error => {
          console.error('❌ Error al cargar tipos de documento desde backend:', error);
          // Fallback con tipos básicos
          const fallbackTipos: TipoDocumentoBackend[] = [
            {
              id_tipo_documento: 1,
              nombre: 'Historia Clínica',
              descripcion: 'Documento principal con antecedentes completos del paciente',
              categoria: 'Ingreso',
              activo: true,
              requiere_internamiento: false,
              orden_hospitalario: 1,
              es_inicial: true
            },
            {
              id_tipo_documento: 2,
              nombre: 'Nota de Urgencias',
              descripcion: 'Atención médica de urgencia con triaje y tratamiento inmediato',
              categoria: 'Urgencias',
              activo: true,
              requiere_internamiento: false,
              orden_hospitalario: 10,
              es_inicial: true
            },
            {
              id_tipo_documento: 3,
              nombre: 'Nota de Evolución',
              descripcion: 'Seguimiento diario del paciente hospitalizado (SOAP)',
              categoria: 'Evolución',
              activo: true,
              requiere_internamiento: true,
              orden_hospitalario: 20,
              es_inicial: false
            },
            {
              id_tipo_documento: 4,
              nombre: 'Nota de Egreso',
              descripcion: 'Resumen de alta hospitalaria con indicaciones',
              categoria: 'Egreso',
              activo: true,
              requiere_internamiento: true,
              orden_hospitalario: 90,
              es_inicial: false
            }
          ];

          console.log('  Usando tipos de fallback:', fallbackTipos);
          return of(fallbackTipos);
        }),
        shareReplay(1) // Cache la respuesta
      );
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

  // /**
  //  * Precargar todos los catálogos esenciales para el wizard
  //  */
  // preloadEssentialCatalogos(): Observable<boolean> {
  //   const essentialTypes: TipoCatalogo[] = [
  //     'tipos_sangre',
  //     'servicios',
  //     'tipos_documentos_clinicos'
  //   ];

  //   return this.getCatalogos(essentialTypes).pipe(
  //     map(() => true),
  //     catchError(() => of(false))
  //   );
  // }


// REEMPLAZAR el método preloadEssentialCatalogos en src/app/services/catalogo.ts

/**
 * 🔧 CORREGIDO: Precargar solo catálogos que realmente existen
 */
preloadEssentialCatalogos(): Observable<boolean> {
  // 🎯 SOLO CATÁLOGOS QUE EXISTEN EN TU BACKEND
  const essentialTypes: TipoCatalogo[] = [
    'tipos_sangre',     //   Existe como tipos-sangre
    'servicios'         //   Existe como servicios
    // ❌ NO incluir: 'tipos_documentos_clinicos' porque da problemas
  ];

  console.log('  Precargando catálogos esenciales:', essentialTypes);

  // Si no hay catálogos que cargar, retornar éxito inmediatamente
  if (essentialTypes.length === 0) {
    console.log('  No hay catálogos esenciales que cargar');
    return of(true);
  }

  return this.getCatalogos(essentialTypes).pipe(
    map(() => {
      console.log('  Catálogos esenciales cargados correctamente');
      return true;
    }),
    catchError((error) => {
      console.warn('  Error al cargar algunos catálogos esenciales:', error);
      //   RETORNAR TRUE PARA CONTINUAR AUNQUE HAYA ERRORES
      return of(true);
    }),
    //   TIMEOUT DE SEGURIDAD: Si no responde en 2 segundos, continuar
    timeout(2000),
    catchError(() => {
      console.warn('⏰ Timeout en carga de catálogos - continuando');
      return of(true);
    })
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
    const endpointMap: { [key in TipoCatalogo]: string } = {
      'tipos_sangre': 'tipos-sangre',
      'estados_civiles': 'estados-civiles',
      'religiones': 'religiones',
      'servicios': 'servicios',
      'especialidades_medicas': 'especialidades-medicas',
      'tipos_documentos_clinicos': 'tipos-documento',
      'areas_interconsulta': 'areas-interconsulta',
      'parentescos': 'parentescos',
      'niveles_escolaridad': 'niveles-escolaridad',
      'estados_republica': 'estados-republica',
      'tipos_egreso': 'tipos-egreso',
      'estados_documento': 'estados-documento'
    };

    const endpoint = endpointMap[tipo];
    const url = `${this.baseUrl}/${endpoint}`;

    console.log(`  Solicitando catálogo: ${tipo} -> ${url}`);

    return this.http.get<CatalogoResponse>(url).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log(`Catálogo ${tipo} cargado desde backend:`, response.data.length, 'items');
          return response.data;
        }
        throw new Error(response.mensaje || 'Error al cargar catálogo');
      }),
      catchError(error => {
        // MANEJO SILENCIOSO DE ERRORES ESPERADOS
        const expectedErrors = ['estados_civiles', 'religiones', 'parentescos', 'niveles_escolaridad'];

        if (expectedErrors.includes(tipo)) {
          console.info(`Usando datos estáticos para ${tipo}`);
        } else {
          console.warn(`Error al cargar catálogo ${tipo}:`, error.status, error.statusText);
        }

        const staticData = this.getStaticCatalogo(tipo);
        console.log(`  ${staticData.length} items estáticos para ${tipo}`);

        return of(staticData);
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

  async checkAvailableEndpoints(): Promise<{ [key: string]: boolean }> {
    const endpointsToCheck = [
      'tipos-sangre',
      'estados-civiles',
      'religiones',
      'parentescos',
      'niveles-escolaridad',
      'servicios',
      'tipos-documento'
    ];

    const results: { [key: string]: boolean } = {};

    for (const endpoint of endpointsToCheck) {
      try {
        await this.http.get(`${this.baseUrl}/${endpoint}`, {
          headers: { 'X-Silent-Check': 'true' }
        }).toPromise();
        results[endpoint] = true;
        console.log(`Endpoint disponible: /api/catalogos/${endpoint}`);
      } catch {
        results[endpoint] = false;
        console.log(`Endpoint NO disponible: /api/catalogos/${endpoint}`);
      }
    }

    return results;
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
