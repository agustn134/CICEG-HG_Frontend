// src/app/services/gestion-expedientes/expedientes.service.ts
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs'; //   AGREGAR ESTE IMPORT
import { BaseService } from '../base.service';
import {
  Expediente,
  ExpedienteCompleto,
  DocumentoClinicoResumen,
  SignosVitalesResumen,
  CreateExpedienteDto,
  UpdateExpedienteDto,
  ApiResponse,
  Genero,
  ExpedienteBusqueda
} from '../../models';


// ==========================================
// INTERFACES ESPECÍFICAS PARA EL SERVICIO
// ==========================================


export interface Internamiento {
  id_internamiento: number;
  fecha_ingreso: string;
  fecha_egreso?: string;
  motivo_ingreso: string;
  diagnostico_ingreso?: string;
  diagnostico_egreso?: string;
  tipo_egreso?: string;
  observaciones?: string;
  servicio?: string;
  cama?: string;
  area_cama?: string;
  subarea_cama?: string;
  medico_responsable?: string;
  especialidad_medico?: string;
  dias_estancia: number;
}


// export interface ExpedienteBusqueda {
//   id_expediente: number;
//   numero_expediente: string;
//   fecha_apertura: string;
//   estado: string;
//   nombre_paciente: string;
//   curp?: string;
//   edad: number;
//   sexo: Genero;
//   internamiento_activo: number;
// }

export interface ExpedientesPorPaciente {
  paciente: {
    id_paciente: number;
    nombre_completo: string;
  };
  expedientes: {
    id_expediente: number;
    numero_expediente: string;
    numero_expediente_administrativo?: string | null;
    fecha_apertura: string;
    estado: string;
    notas_administrativas?: string;
    total_documentos: number;
    total_internamientos: number;
    internamientos_activos: number;
    ultima_actividad?: string;
    ultimo_ingreso?: string;
  }[];
  total_expedientes: number;
}

export interface DashboardExpedientes {
  estadisticas: {
    total_expedientes: number;
    expedientes_activos: number;
    expedientes_cerrados: number;
    expedientes_archivados: number;
    expedientes_mes_actual: number;
    expedientes_semana_actual: number;
  };
  expedientes_con_internamiento_activo: {
    id_expediente: number;
    numero_expediente: string;
    numero_expediente_administrativo?: string | null;
    nombre_paciente: string;
    fecha_ingreso: string;
    servicio?: string;
    cama?: string;
    medico_responsable?: string;
    dias_estancia: number;
  }[];
  expedientes_mas_activos: {
    id_expediente: number;
    numero_expediente: string;
    numero_expediente_administrativo?: string | null;
    nombre_paciente: string;
    total_documentos: number;
    documentos_semana: number;
    ultima_actividad?: string;
  }[];
  alertas_activas: {
    tipo_alerta: string;
    mensaje: string;
    fecha_alerta: string;
    numero_expediente?: string;
    numero_expediente_administrativo?: string | null;
    nombre_paciente?: string;
  }[];
}

export interface ValidacionAcceso {
  requiere_validacion: boolean;
  id_validacion?: number;
  acceso_inmediato: boolean;
}

export interface AuditoriaExpediente {
  expediente: {
    numero_expediente: string;
    nombre_paciente: string;
  };
  auditorias: {
    id_auditoria: number;
    fecha_acceso: string;
    accion: string;
    datos_anteriores?: any;
    datos_nuevos?: any;
    ip_acceso?: string;
    navegador?: string;
    tiempo_sesion?: number;
    observaciones?: string;
    medico_nombre?: string;
    especialidad?: string;
    numero_cedula?: string;
  }[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export interface AlertasExpediente {
  todas: Alerta[];
  por_tipo: {
    CRITICA: Alerta[];
    ADVERTENCIA: Alerta[];
    INFORMATIVA: Alerta[];
  };
  resumen: {
    total: number;
    activas: number;
    revisadas: number;
    cerradas: number;
  };
}

export interface Alerta {
  id_alerta: number;
  tipo_alerta: 'CRITICA' | 'ADVERTENCIA' | 'INFORMATIVA';
  mensaje: string;
  fecha_alerta: string;
  estado: 'ACTIVA' | 'REVISADA' | 'CERRADA';
  fecha_revision?: string;
  acciones_tomadas?: string;
  medico_generador?: string;
  medico_revisor?: string;
}

export interface ValidacionReingreso {
  id_medico_validador: number;
  peso_actual: number;
  talla_actual: number;
  presion_arterial_sistolica: number;
  presion_arterial_diastolica: number;
  temperatura: number;
  alergias_confirmadas: string;
  medicamentos_actuales: string;
  contacto_emergencia_actual: string;
  observaciones_validacion?: string;
}

export interface ExpedienteFilters {
  estado?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  paciente_id?: number;
  tiene_internamiento_activo?: boolean;
  buscar?: string;
  limit?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExpedientesService extends BaseService<Expediente> {
  protected override endpoint = '/gestion-expedientes/expedientes';

  // ==========================================
  // MÉTODOS CRUD PRINCIPALES CON FILTROS ESPECÍFICOS
  // ==========================================

  /**
   * Obtener todos los expedientes con filtros específicos
   * GET /api/gestion-expedientes/expedientes
   */
  getExpedientes(filters?: ExpedienteFilters): Observable<ApiResponse<Expediente[]>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.estado) params = params.set('estado', filters.estado);
      if (filters.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
      if (filters.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
      if (filters.paciente_id) params = params.set('paciente_id', filters.paciente_id.toString());
      if (filters.tiene_internamiento_activo !== undefined) {
        params = params.set('tiene_internamiento_activo', filters.tiene_internamiento_activo.toString());
      }
      if (filters.buscar) params = params.set('buscar', filters.buscar);
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.offset) params = params.set('offset', filters.offset.toString());
    }

    return this.http.get<ApiResponse<Expediente[]>>(this.buildUrl(), { params });
  }

  /**
   * Obtener expediente por ID con información completa
   * GET /api/gestion-expedientes/expedientes/:id
   */
  getExpedienteCompleto(id: number): Observable<ApiResponse<ExpedienteCompleto>> {
    return this.getById(id) as Observable<ApiResponse<ExpedienteCompleto>>;
  }

  /**
   * Crear nuevo expediente con opciones avanzadas
   * POST /api/gestion-expedientes/expedientes
   */
  createExpedienteCompleto(data: CreateExpedienteDto & {
    crear_historia_clinica?: boolean;
    id_medico_creador?: number;
  }): Observable<ApiResponse<Expediente>> {
    return this.create(data);
  }

  /**
   * Eliminar expediente con opción de forzar
   * DELETE /api/gestion-expedientes/expedientes/:id
   */
  deleteExpediente(id: number, options?: {
    force?: boolean;
    id_medico_eliminador?: number;
    motivo_eliminacion?: string;
  }): Observable<ApiResponse<any>> {
    const data = options || {};
    return this.customPost(`/${id}`, data); // Usamos POST porque enviamos datos en el body
  }

  // ==========================================
  // MÉTODOS ESPECÍFICOS DE LA API
  // ==========================================

// src/app/services/gestion-expedientes/expedientes.service.ts

/**
 * Buscar expedientes para autocomplete (versión mejorada)
 * GET /api/gestion-expedientes/expedientes/buscar
 */
buscarExpedientes(termino: string, activosSolo: boolean = true): Observable<ApiResponse<ExpedienteBusqueda[]>> {
  // Validación básica
  if (!termino || termino.trim().length < 2) {
    return of({ success: true, data: [], message: 'Término de búsqueda muy corto' });
  }

  let params = new HttpParams()
    .set('q', termino.trim())
    .set('activos_solo', activosSolo.toString());

  return this.http.get<ApiResponse<ExpedienteBusqueda[]>>(this.buildUrl('/buscar'), { params })
    .pipe(
      catchError((error) => {
        console.error('Error al buscar expedientes:', error);
        return of({ success: false, data: [], message: 'Error en la búsqueda' });
      })
    );
}

/**
 * Obtener expedientes agrupados por estado
 */
getExpedientesAgrupadosPorEstado(): Observable<{ [estado: string]: number }> {
  return this.getExpedientes().pipe(
    map(response => {
      const agrupados: { [estado: string]: number } = {};
      //   CORREGIR: Verificar que response.data existe
      const expedientes = response.data || [];
      expedientes.forEach(exp => {
        agrupados[exp.estado] = (agrupados[exp.estado] || 0) + 1;
      });
      return agrupados;
    }),
    catchError(() => of({}))
  );
}

/**
 * Actualizar números administrativos en lote
 */
/**
 * Actualizar números administrativos en lote
 */
actualizarNumerosAdministrativosEnLote(actualizaciones: {
  id_expediente: number;
  numero_expediente_administrativo: string;
}[], idMedicoModificador?: number): Observable<{ exitosos: number; errores: any[] }> {

  const promesas = actualizaciones.map(async (actualizacion) => {
    try {
      //   CORREGIR: Usar firstValueFrom en lugar de toPromise()
      await firstValueFrom(this.updateNumeroAdministrativo(
        actualizacion.id_expediente,
        actualizacion.numero_expediente_administrativo,
        idMedicoModificador
      ));
      return { exito: true, id: actualizacion.id_expediente };
    } catch (error) {
      return { exito: false, id: actualizacion.id_expediente, error };
    }
  });

  return new Observable(subscriber => {
    Promise.all(promesas).then(resultados => {
      const exitosos = resultados.filter(r => r.exito).length;
      const errores = resultados.filter(r => !r.exito);

      subscriber.next({ exitosos, errores });
      subscriber.complete();
    }).catch(error => {
      subscriber.error(error);
    });
  });
}

/**
 * Exportar expedientes a CSV/Excel
 */
exportarExpedientes(filters?: ExpedienteFilters, formato: 'csv' | 'excel' = 'csv'): Observable<Blob> {
  return this.getExpedientes(filters).pipe(
    map(response => {
      //   CORREGIR: Verificar que response.data existe
      const data = response.data || [];

      if (formato === 'csv') {
        return this.convertirACSV(data);
      } else {
        return this.convertirAExcel(data);
      }
    }),
    catchError(error => {
      console.error('Error al exportar expedientes:', error);
      throw error;
    })
  );
}

private convertirACSV(expedientes: Expediente[]): Blob {
  const headers = [
    'ID Expediente',
    'Número Sistema',
    'Número Administrativo',
    'Paciente',
    'Fecha Apertura',
    'Estado',
    'Total Documentos',
    'Internamientos Activos'
  ];

  //   CORREGIR: Verificar que expedientes existe y no es undefined
  const expedientesSeguros = expedientes || [];
  const filas = expedientesSeguros.map(exp => [
    exp.id_expediente,
    exp.numero_expediente,
    exp.numero_expediente_administrativo || '',
    exp.nombre_paciente || '',
    exp.fecha_apertura,
    exp.estado,
    exp.total_documentos || 0,
    exp.internamientos_activos || 0
  ]);

  const csvContent = [headers, ...filas]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}
/**
 * Obtener estadísticas de números administrativos
 */
/**
 * Obtener estadísticas de números administrativos
 */
getEstadisticasNumerosAdministrativos(): Observable<{
  total_expedientes: number;
  con_numero_administrativo: number;
  sin_numero_administrativo: number;
  porcentaje_completado: number;
}> {
  return this.getExpedientes().pipe(
    map(response => {
      //   CORREGIR: Verificar que response.data existe
      const expedientes = response.data || [];
      const total = expedientes.length;
      const conNumero = expedientes.filter(exp => exp.numero_expediente_administrativo).length;
      const sinNumero = total - conNumero;
      const porcentaje = total > 0 ? Math.round((conNumero / total) * 100) : 0;

      return {
        total_expedientes: total,
        con_numero_administrativo: conNumero,
        sin_numero_administrativo: sinNumero,
        porcentaje_completado: porcentaje
      };
    }),
    catchError(() => of({
      total_expedientes: 0,
      con_numero_administrativo: 0,
      sin_numero_administrativo: 0,
      porcentaje_completado: 0
    }))
  );
}

/**
 * Validar número administrativo con reglas específicas del hospital
 */
// validarNumeroAdministrativoAvanzado(numero: string): {
//   valido: boolean;
//   errores: string[];
//   sugerencias: string[];
// } {
//   const errores: string[] = [];
//   const sugerencias: string[] = [];

//   // Validación de formato básico
//   if (!this.validarFormatoNumeroAdministrativo(numero)) {
//     errores.push('El formato debe ser YYYY-NNNNNN');
//     sugerencias.push(`Ejemplo: ${this.sugerirNumeroAdministrativo()}`);
//   }

//   // Validación de año
//   const año = numero.substring(0, 4);
//   const añoActual = new Date().getFullYear();
//   if (parseInt(año) > añoActual) {
//     errores.push('El año no puede ser mayor al año actual');
//   }

//   if (parseInt(año) < 2020) {
//     errores.push('El año debe ser 2020 o posterior');
//   }

//   // Validación de secuencia
//   const secuencia = numero.substring(5);
//   if (secuencia === '000000') {
//     errores.push('La secuencia no puede ser 000000');
//     sugerencias.push('Use una secuencia válida');
//   }

//   return {
//     valido: errores.length === 0,
//     errores,
//     sugerencias
//   };
// }

/**
 * Reemplazar el método anterior con validación libre
 */
validarNumeroAdministrativoAvanzado(numero: string): {
  valido: boolean;
  errores: string[];
  sugerencias: string[];
} {
  return this.validarNumeroAdministrativoLibre(numero);
}



/**
 * Validar número administrativo con formato libre
 */
validarNumeroAdministrativoLibre(numero: string): {
  valido: boolean;
  errores: string[];
  sugerencias: string[];
} {
  const errores: string[] = [];
  const sugerencias: string[] = [];

  // Si está vacío, es válido (campo opcional)
  if (!numero || numero.trim().length === 0) {
    return { valido: true, errores, sugerencias };
  }

  const numeroLimpio = numero.trim();

  // Validación de longitud mínima
  if (numeroLimpio.length < 3) {
    errores.push('El número debe tener al menos 3 caracteres');
    sugerencias.push('Ingrese un número más específico');
  }

  // Validación de longitud máxima
  if (numeroLimpio.length > 50) {
    errores.push('El número no puede exceder 50 caracteres');
  }

  // Solo caracteres alfanuméricos, guiones, puntos, espacios, guiones bajos y barras
  const patronPermitido = /^[a-zA-Z0-9\-\.\s_/]+$/;
  if (!patronPermitido.test(numeroLimpio)) {
    errores.push('Solo se permiten letras, números, guiones, puntos, espacios, guiones bajos y barras');
    sugerencias.push('Ejemplos válidos: "2025-001", "EXP-2025-001", "HG/001/2025", "A123", "EXPEDIENTE 001"');
  }

  return {
    valido: errores.length === 0,
    errores,
    sugerencias
  };
}





private convertirAExcel(expedientes: Expediente[]): Blob {
  // Implementación básica - en producción usar una librería como xlsx
  return this.convertirACSV(expedientes);
}


  /**
   * Obtener dashboard de expedientes
   * GET /api/gestion-expedientes/expedientes/dashboard
   */
  getDashboard(): Observable<ApiResponse<DashboardExpedientes>> {
    return this.customGet('/dashboard');
  }

  /**
   * Obtener expedientes por paciente
   * GET /api/gestion-expedientes/expedientes/paciente/:id_paciente
   */
  getExpedientesPorPaciente(idPaciente: number, incluirEliminados: boolean = false): Observable<ApiResponse<ExpedientesPorPaciente>> {
    return this.customGet(`/paciente/${idPaciente}`, { incluir_eliminados: incluirEliminados });
  }

  /**
   * Validar acceso a expediente (para reingresos)
   * POST /api/gestion-expedientes/expedientes/:id/validar-acceso
   */
  validarAccesoExpediente(idExpediente: number, data: {
    id_medico: number;
    justificacion_acceso?: string;
  }): Observable<ApiResponse<ValidacionAcceso>> {
    return this.customPost(`/${idExpediente}/validar-acceso`, data);
  }

  /**
   * Completar validación de reingreso
   * POST /api/gestion-expedientes/expedientes/:id/validar-reingreso
   */
  validarReingreso(idExpediente: number, data: ValidacionReingreso): Observable<ApiResponse<any>> {
    return this.customPost(`/${idExpediente}/validar-reingreso`, data);
  }

  /**
   * Obtener auditoría del expediente
   * GET /api/gestion-expedientes/expedientes/:id/auditoria
   */
  getAuditoria(idExpediente: number, filters?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    tipo_accion?: string;
    id_medico?: number;
    limit?: number;
    offset?: number;
  }): Observable<ApiResponse<AuditoriaExpediente>> {
    return this.customGet(`/${idExpediente}/auditoria`, filters);
  }

  /**
   * Obtener alertas del expediente
   * GET /api/gestion-expedientes/expedientes/:id/alertas
   */
  getAlertas(idExpediente: number, filters?: {
    estado_alerta?: 'ACTIVA' | 'REVISADA' | 'CERRADA' | 'todas';
    tipo_alerta?: 'CRITICA' | 'ADVERTENCIA' | 'INFORMATIVA';
  }): Observable<ApiResponse<AlertasExpediente>> {
    return this.customGet(`/${idExpediente}/alertas`, filters);
  }

/**
 * Actualizar expediente incluyendo número administrativo
 * PUT /api/gestion-expedientes/expedientes/:id
 */
updateExpediente(id: number, data: UpdateExpedienteDto): Observable<ApiResponse<Expediente>> {
  return this.update(id, data);
}

/**
 * Actualizar solo el número administrativo
 */
updateNumeroAdministrativo(id: number, numeroAdministrativo: string, idMedicoModificador?: number): Observable<ApiResponse<Expediente>> {
  return this.updateExpediente(id, {
    numero_expediente_administrativo: numeroAdministrativo,
    id_medico_modificador: idMedicoModificador
  });
}

/**
 * Buscar por número administrativo específicamente
 */
buscarPorNumeroAdministrativo(numeroAdministrativo: string): Observable<ApiResponse<ExpedienteBusqueda[]>> {
  return this.buscarExpedientes(numeroAdministrativo, true);
}

/**
 * Buscar por cualquier tipo de número (sistema o administrativo)
 */
buscarPorCualquierNumero(numero: string): Observable<ApiResponse<ExpedienteBusqueda[]>> {
  return this.buscarExpedientes(numero, true);
}

/**
 * Verificar si existe un número administrativo
 */
verificarNumeroAdministrativo(numero: string): Observable<boolean> {
  return this.buscarPorNumeroAdministrativo(numero).pipe(
    map(response => response.data ? response.data.length > 0 : false),
    catchError(() => of(false))
  );
}

/**
 * Buscar expedientes y devolver solo los datos (sin ApiResponse wrapper)
 * Para casos donde se necesite solo el array
 */
buscarExpedientesSoloData(termino: string, activosSolo: boolean = true): Observable<ExpedienteBusqueda[]> {
  return this.buscarExpedientes(termino, activosSolo).pipe(
    map(response => response.data || []),
    catchError(() => of([]))
  );
}

/**
 * Buscar por número administrativo (solo datos)
 */
buscarPorNumeroAdministrativoSoloData(numeroAdministrativo: string): Observable<ExpedienteBusqueda[]> {
  return this.buscarExpedientesSoloData(numeroAdministrativo, true);
}

/**busquedaAvanzada
 * Buscar por cualquier tipo de número (solo datos)
 */
buscarPorCualquierNumeroSoloData(numero: string): Observable<ExpedienteBusqueda[]> {
  return this.buscarExpedientesSoloData(numero, true);
}






/**
   * Obtener estadísticas de números administrativos
   */
  // getEstadisticasNumerosAdministrativos(): Observable<{
  //   total_expedientes: number;
  //   con_numero_administrativo: number;
  //   sin_numero_administrativo: number;
  //   porcentaje_completado: number;
  // }> {
  //   return this.getExpedientes().pipe(
  //     map(response => {
  //       const expedientes = response.data || []; //   CORREGIDO
  //       const total = expedientes.length;
  //       const conNumero = expedientes.filter(exp => exp.numero_expediente_administrativo).length;
  //       const sinNumero = total - conNumero;
  //       const porcentaje = total > 0 ? Math.round((conNumero / total) * 100) : 0;

  //       return {
  //         total_expedientes: total,
  //         con_numero_administrativo: conNumero,
  //         sin_numero_administrativo: sinNumero,
  //         porcentaje_completado: porcentaje
  //       };
  //     }),
  //     catchError(() => of({
  //       total_expedientes: 0,
  //       con_numero_administrativo: 0,
  //       sin_numero_administrativo: 0,
  //       porcentaje_completado: 0
  //     }))
  //   );
  // }


// /**
//  * Validar formato de número administrativo
//  */
// validarFormatoNumeroAdministrativo(numero: string): boolean {
//   // Ejemplo de validación: YYYY-NNNNNN
//   const patron = /^\d{4}-\d{6}$/;
//   return patron.test(numero);
// }

/**
 * Actualizar formato libre (sin restricciones específicas)
 */
validarFormatoNumeroAdministrativo(numero: string): boolean {
  if (!numero) return true; // Opcional, puede estar vacío

  const numeroLimpio = numero.trim();

  // Validación libre: solo verificar longitud y caracteres básicos
  return numeroLimpio.length >= 3 &&
         numeroLimpio.length <= 50 &&
         /^[a-zA-Z0-9\-\.\s_/]+$/.test(numeroLimpio);
}


// /**
//  * Sugerir formato de número administrativo
//  */
// sugerirNumeroAdministrativo(): string {
//   const year = new Date().getFullYear();
//   const timestamp = Date.now().toString().slice(-6);
//   return `${year}-${timestamp}`;
// }

/**
 * Sugerir ejemplos de formato libre
 */
sugerirNumeroAdministrativo(): string {
  const year = new Date().getFullYear();
  const mes = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const dia = new Date().getDate().toString().padStart(2, '0');

  // Ofrecer varios ejemplos de formato libre
  const ejemplos = [
    `${year}-001`,
    `EXP-${year}-001`,
    `HG-${mes}${dia}-001`,
    `${year}${mes}001`,
    `${year}/001`,
    `A-${year}-001`,
    `EXPEDIENTE-001`,
    `${year}001`,
    `EXP${year}001`
  ];

  return ejemplos[Math.floor(Math.random() * ejemplos.length)];
}



/**
 * Búsqueda avanzada que distingue entre tipos de número
 */
busquedaAvanzada(criterios: {
  numero_sistema?: string;
  numero_administrativo?: string;
  nombre_paciente?: string;
  curp?: string;
  activos_solo?: boolean;
}): Observable<ApiResponse<ExpedienteBusqueda[]>> {
  // Construir query de búsqueda inteligente
  const queries: string[] = [];

  if (criterios.numero_sistema) queries.push(criterios.numero_sistema);
  if (criterios.numero_administrativo) queries.push(criterios.numero_administrativo);
  if (criterios.nombre_paciente) queries.push(criterios.nombre_paciente);
  if (criterios.curp) queries.push(criterios.curp);

  const queryString = queries.join(' ');
  return this.buscarExpedientes(queryString, criterios.activos_solo ?? true);
}

/**
 * Búsqueda avanzada (solo datos)
 */
busquedaAvanzadaSoloData(criterios: {
  numero_sistema?: string;
  numero_administrativo?: string;
  nombre_paciente?: string;
  curp?: string;
  activos_solo?: boolean;
}): Observable<ExpedienteBusqueda[]> {
  return this.busquedaAvanzada(criterios).pipe(
    map(response => response.data || []),
    catchError(() => of([]))
  );
}

  /**
   * Actualizar alerta específica
   * PUT /api/gestion-expedientes/expedientes/:id/alertas/:id_alerta
   */
  updateAlerta(idExpediente: number, idAlerta: number, data: {
    estado?: 'ACTIVA' | 'REVISADA' | 'CERRADA';
    acciones_tomadas?: string;
    id_medico_revisor?: number;
  }): Observable<ApiResponse<Alerta>> {
    return this.customPut(`/${idExpediente}/alertas/${idAlerta}`, data);
  }

  /**
   * Generar reporte del expediente
   * GET /api/gestion-expedientes/expedientes/:id/reporte
   */
  generarReporte(idExpediente: number, options?: {
    incluir_documentos?: boolean;
    incluir_internamientos?: boolean;
  }): Observable<ApiResponse<any>> {
    return this.customGet(`/${idExpediente}/reporte`, options);
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /**
   * Obtener expedientes activos
   */
  getExpedientesActivos(filters?: Omit<ExpedienteFilters, 'estado'>): Observable<ApiResponse<Expediente[]>> {
    return this.getExpedientes({ ...filters, estado: 'Activo' });
  }

  /**
   * Obtener expedientes con internamientos activos
   */
  getExpedientesConInternamientoActivo(filters?: Omit<ExpedienteFilters, 'tiene_internamiento_activo'>): Observable<ApiResponse<Expediente[]>> {
    return this.getExpedientes({ ...filters, tiene_internamiento_activo: true });
  }

  /**
   * Verificar si un expediente requiere validación de reingreso
   */
  verificarValidacionReingreso(idExpediente: number, idMedico: number): Observable<ApiResponse<ValidacionAcceso>> {
    return this.validarAccesoExpediente(idExpediente, { id_medico: idMedico });
  }

  /**
   * Cerrar expediente (cambiar estado a Cerrado)
   */
  cerrarExpediente(idExpediente: number, data: {
    notas_administrativas?: string;
    id_medico_modificador?: number;
  }): Observable<ApiResponse<Expediente>> {
    return this.update(idExpediente, { ...data });
  }

  /**
   * Archivar expediente
   */
  archivarExpediente(idExpediente: number, data: {
    notas_administrativas?: string;
    id_medico_modificador?: number;
  }): Observable<ApiResponse<Expediente>> {
    return this.update(idExpediente, { ...data });
  }

  /**
   * Reactivar expediente
   */
  reactivarExpediente(idExpediente: number, data: {
    notas_administrativas?: string;
    id_medico_modificador?: number;
  }): Observable<ApiResponse<Expediente>> {
    return this.update(idExpediente, { ...data });
  }

/**
 * Obtener estadísticas de expedientes (override del método base)
 */
override getEstadisticas(): Observable<ApiResponse<any>> {
  return this.getDashboard();
}



/**
 * Buscar expedientes por número
 */
buscarPorNumero(numeroExpediente: string): Observable<ApiResponse<ExpedienteBusqueda[]>> {
  return this.buscarExpedientes(numeroExpediente);
}
/**
 * Buscar expedientes por paciente (nombre, CURP, etc.)
 */
buscarPorPaciente(queryPaciente: string): Observable<ApiResponse<ExpedienteBusqueda[]>> {
  return this.buscarExpedientes(queryPaciente);
}

  /**
   * Obtener expedientes del día actual
   */
  getExpedientesHoy(): Observable<ApiResponse<Expediente[]>> {
    const hoy = new Date().toISOString().split('T')[0];
    return this.getExpedientes({
      fecha_inicio: hoy,
      fecha_fin: hoy
    });
  }

  /**
   * Obtener expedientes de la semana actual
   */
  getExpedientesSemana(): Observable<ApiResponse<Expediente[]>> {
    const hoy = new Date();
    const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
    const finSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 6));

    return this.getExpedientes({
      fecha_inicio: inicioSemana.toISOString().split('T')[0],
      fecha_fin: finSemana.toISOString().split('T')[0]
    });
  }

  /**
   * Obtener expedientes por rango de fechas
   */
  getExpedientesPorRango(fechaInicio: string, fechaFin: string): Observable<ApiResponse<Expediente[]>> {
    return this.getExpedientes({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
  }

// ==========================================
  // MÉTODOS FALTANTES - AGREGAR AL FINAL DE LA CLASE
  // ==========================================

  /**
   * MÉTODO FALTANTE: Crear expediente (método principal)
   * POST /api/gestion-expedientes/expedientes
   */
  createExpediente(data: CreateExpedienteDto): Observable<ApiResponse<Expediente>> {
    return this.create(data);
  }

  /**
   * MÉTODO FALTANTE: Obtener expediente por ID de paciente (principal/activo)
   * GET /api/gestion-expedientes/expedientes/paciente/:id_paciente/principal
   */
  getExpedienteByPacienteId(idPaciente: number): Observable<ApiResponse<Expediente>> {
    return this.customGet(`/paciente/${idPaciente}/principal`);
  }

  /**
   * MÉTODO FALTANTE: Generar número de expediente automático
   * GET /api/gestion-expedientes/expedientes/generar-numero
   */
  generateNumeroExpediente(): Observable<ApiResponse<{ numero_expediente: string }>> {
    return this.customGet('/generar-numero');
  }

  // ==========================================
  // ALIAS PARA COMPATIBILIDAD
  // ==========================================

  /**
   * Alias para compatibilidad con código existente
   */
  generarNumeroExpediente = this.generateNumeroExpediente;

}
