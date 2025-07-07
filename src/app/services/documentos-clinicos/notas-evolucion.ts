// // // src/app/services/documentos-clinicos/notas-evolucion.service.ts
// // import { Injectable } from '@angular/core';
// // import { HttpClient, HttpParams } from '@angular/common/http';
// // import { Observable } from 'rxjs';
// // import {
// //   NotaEvolucion,
// //   NotaEvolucionFilters,
// //   CreateNotaEvolucionDto,
// //   UpdateNotaEvolucionDto,
// //   NotaEvolucionListResponse,
// //   ValidacionNotaEvolucion,
// //   PlantillaSOAP,
// //   PLANTILLAS_SOAP,
// //   CAMPOS_OBLIGATORIOS_EVOLUCION,
// //   NotaEvolucionUtils
// // } from '../../models/nota-evolucion.model';
// // import { ApiResponse } from '../../models/base.models';

// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class NotasEvolucionService {
// //   private readonly API_URL = 'http://localhost:3000/api/documentos-clinicos/notas-evolucion';

// //   constructor(private http: HttpClient) { }

// //   // ==========================================
// //   // OPERACIONES CRUD BÁSICAS
// //   // ==========================================

// //   /**
// //    * Obtener todas las notas de evolución con filtros
// //    */
// //   getNotasEvolucion(filters?: NotaEvolucionFilters): Observable<ApiResponse<NotaEvolucion[]>> {
// //     let params = new HttpParams();

// //     if (filters) {
// //       if (filters.page !== undefined) {
// //         params = params.set('page', filters.page.toString());
// //       }
// //       if (filters.limit !== undefined) {
// //         params = params.set('limit', filters.limit.toString());
// //       }
// //       if (filters.id_documento) {
// //         params = params.set('id_documento', filters.id_documento.toString());
// //       }
// //       if (filters.id_expediente) {
// //         params = params.set('id_expediente', filters.id_expediente.toString());
// //       }
// //       if (filters.buscar) {
// //         params = params.set('buscar', filters.buscar);
// //       }
// //       if (filters.fecha_inicio) {
// //         params = params.set('fecha_inicio', filters.fecha_inicio);
// //       }
// //       if (filters.fecha_fin) {
// //         params = params.set('fecha_fin', filters.fecha_fin);
// //       }
// //       if (filters.medico_nombre) {
// //         params = params.set('medico_nombre', filters.medico_nombre);
// //       }
// //     }

// //     return this.http.get<ApiResponse<NotaEvolucion[]>>(`${this.API_URL}`, { params });
// //   }

// //   /**
// //    * Obtener nota de evolución por ID
// //    */
// //   getNotaEvolucionById(id: number): Observable<ApiResponse<NotaEvolucion>> {
// //     return this.http.get<ApiResponse<NotaEvolucion>>(`${this.API_URL}/${id}`);
// //   }

// //   /**
// //    * Obtener nota de evolución por documento
// //    */
// //   getNotaEvolucionByDocumento(idDocumento: number): Observable<ApiResponse<NotaEvolucion>> {
// //     return this.http.get<ApiResponse<NotaEvolucion>>(`${this.API_URL}/documento/${idDocumento}`);
// //   }

// //   /**
// //    * Obtener notas de evolución por expediente
// //    */
// //   getNotasEvolucionByExpediente(idExpediente: number): Observable<ApiResponse<NotaEvolucion[]>> {
// //     return this.http.get<ApiResponse<NotaEvolucion[]>>(`${this.API_URL}/expediente/${idExpediente}`);
// //   }

// //   /**
// //    * Crear nueva nota de evolución
// //    */
// //   createNotaEvolucion(data: CreateNotaEvolucionDto): Observable<ApiResponse<NotaEvolucion>> {
// //     return this.http.post<ApiResponse<NotaEvolucion>>(`${this.API_URL}`, data);
// //   }

// //   /**
// //    * Actualizar nota de evolución existente
// //    */
// //   updateNotaEvolucion(id: number, data: UpdateNotaEvolucionDto): Observable<ApiResponse<NotaEvolucion>> {
// //     return this.http.put<ApiResponse<NotaEvolucion>>(`${this.API_URL}/${id}`, data);
// //   }

// //   /**
// //    * Eliminar (anular) nota de evolución
// //    */
// //   deleteNotaEvolucion(id: number): Observable<ApiResponse<any>> {
// //     return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`);
// //   }

// //   // ==========================================
// //   // MÉTODOS DE VALIDACIÓN Y UTILIDAD
// //   // ==========================================

// //   /**
// //    * Validar datos antes de crear nota de evolución
// //    */
// //   validarDatosNotaEvolucion(data: CreateNotaEvolucionDto): ValidacionNotaEvolucion {
// //     return NotaEvolucionUtils.validarCamposSOAP(data);
// //   }

// //   /**
// //    * Generar plantilla vacía para nota de evolución
// //    */
// //   generarPlantillaVacia(): CreateNotaEvolucionDto {
// //     return NotaEvolucionUtils.generarPlantillaVacia();
// //   }

// //   /**
// //    * Obtener plantillas SOAP disponibles
// //    */
// //   getPlantillasSOAP(): PlantillaSOAP[] {
// //     return PLANTILLAS_SOAP;
// //   }

// //   /**
// //    * Aplicar plantilla SOAP
// //    */
// //   aplicarPlantilla(plantillaId: string): Partial<CreateNotaEvolucionDto> {
// //     return NotaEvolucionUtils.aplicarPlantilla(plantillaId);
// //   }

// //   /**
// //    * Formatear nota en formato SOAP para mostrar
// //    */
// //   formatearSOAP(nota: NotaEvolucion): string {
// //     return NotaEvolucionUtils.formatearSOAP(nota);
// //   }

// //   /**
// //    * Calcular completitud de la nota (porcentaje de campos SOAP completados)
// //    */
// //   calcularCompletitud(nota: NotaEvolucion): {
// //     porcentaje: number;
// //     campos_completados: number;
// //     campos_totales: number;
// //     detalle: { campo: string; completado: boolean }[];
// //   } {
// //     const campos = [
// //       { campo: 'subjetivo', completado: !!(nota.subjetivo && nota.subjetivo.trim()) },
// //       { campo: 'objetivo', completado: !!(nota.objetivo && nota.objetivo.trim()) },
// //       { campo: 'analisis', completado: !!(nota.analisis && nota.analisis.trim()) },
// //       { campo: 'plan', completado: !!(nota.plan && nota.plan.trim()) }
// //     ];

// //     const completados = campos.filter(c => c.completado).length;
// //     const porcentaje = Math.round((completados / campos.length) * 100);

// //     return {
// //       porcentaje,
// //       campos_completados: completados,
// //       campos_totales: campos.length,
// //       detalle: campos
// //     };
// //   }

// //   /**
// //    * Verificar si se puede editar la nota de evolución
// //    */
// //   puedeEditar(nota: NotaEvolucion): { puede: boolean; razon?: string } {
// //     if (nota.estado_documento === 'Anulado') {
// //       return {
// //         puede: false,
// //         razon: 'No se puede editar una nota de evolución anulada'
// //       };
// //     }

// //     if (nota.estado_documento === 'Cancelado') {
// //       return {
// //         puede: false,
// //         razon: 'No se puede editar una nota de evolución cancelada'
// //       };
// //     }

// //     // Verificar si ha pasado más de 48 horas
// //     if (nota.fecha_documento) {
// //       const fecha = new Date(nota.fecha_documento);
// //       const ahora = new Date();
// //       const horasTranscurridas = (ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60);

// //       if (horasTranscurridas > 48) {
// //         return {
// //           puede: false,
// //           razon: 'No se puede editar una nota de evolución después de 48 horas de su creación'
// //         };
// //       }
// //     }

// //     return { puede: true };
// //   }

// //   /**
// //    * Generar resumen de la nota para listados
// //    */
// //   generarResumen(nota: NotaEvolucion): string {
// //     const partes: string[] = [];

// //     if (nota.subjetivo) {
// //       partes.push(`S: ${nota.subjetivo.substring(0, 50)}${nota.subjetivo.length > 50 ? '...' : ''}`);
// //     }

// //     if (nota.plan) {
// //       partes.push(`P: ${nota.plan.substring(0, 50)}${nota.plan.length > 50 ? '...' : ''}`);
// //     }

// //     return partes.join(' | ') || 'Nota sin contenido SOAP';
// //   }

// //   /**
// //    * Formatear fecha para mostrar
// //    */
// //   formatearFecha(fecha: string): string {
// //     if (!fecha) return 'No especificada';
// //     return new Date(fecha).toLocaleDateString('es-MX', {
// //       year: 'numeric',
// //       month: 'short',
// //       day: 'numeric',
// //       hour: '2-digit',
// //       minute: '2-digit'
// //     });
// //   }

// //   /**
// //    * Obtener color para porcentaje de completitud
// //    */
// //   getColorCompletitud(porcentaje: number): string {
// //     if (porcentaje >= 90) return 'success';
// //     if (porcentaje >= 75) return 'info';
// //     if (porcentaje >= 50) return 'warning';
// //     return 'danger';
// //   }

// //   /**
// //    * Buscar notas de evolución por criterios múltiples
// //    */
// //   buscarAvanzada(criterios: {
// //     texto?: string;
// //     medico?: string;
// //     fechaInicio?: string;
// //     fechaFin?: string;
// //     expediente?: number;
// //   }): Observable<ApiResponse<NotaEvolucion[]>> {
// //     const filtros: NotaEvolucionFilters = {};

// //     if (criterios.texto) {
// //       filtros.buscar = criterios.texto;
// //     }

// //     if (criterios.medico) {
// //       filtros.medico_nombre = criterios.medico;
// //     }

// //     if (criterios.fechaInicio) {
// //       filtros.fecha_inicio = criterios.fechaInicio;
// //     }

// //     if (criterios.fechaFin) {
// //       filtros.fecha_fin = criterios.fechaFin;
// //     }

// //     if (criterios.expediente) {
// //       filtros.id_expediente = criterios.expediente;
// //     }

// //     return this.getNotasEvolucion(filtros);
// //   }

// //   /**
// //    * Exportar nota de evolución a texto plano
// //    */
// //   exportarTextoPlano(nota: NotaEvolucion): string {
// //     const lineas: string[] = [];

// //     lineas.push('NOTA DE EVOLUCIÓN');
// //     lineas.push('==================');
// //     lineas.push('');

// //     // Datos del paciente
// //     lineas.push('DATOS DEL PACIENTE:');
// //     lineas.push(`Nombre: ${nota.paciente_nombre || 'No especificado'}`);
// //     lineas.push(`Expediente: ${nota.numero_expediente || 'No especificado'}`);
// //     lineas.push(`Fecha: ${nota.fecha_documento ? this.formatearFecha(nota.fecha_documento) : 'No especificada'}`);
// //     lineas.push(`Médico: ${nota.medico_nombre || 'No especificado'}`);
// //     lineas.push('');

// //     // Formato SOAP
// //     lineas.push('EVOLUCIÓN CLÍNICA (FORMATO SOAP):');
// //     lineas.push('');

// //     if (nota.subjetivo) {
// //       lineas.push('S (SUBJETIVO):');
// //       lineas.push(nota.subjetivo);
// //       lineas.push('');
// //     }

// //     if (nota.objetivo) {
// //       lineas.push('O (OBJETIVO):');
// //       lineas.push(nota.objetivo);
// //       lineas.push('');
// //     }

// //     if (nota.analisis) {
// //       lineas.push('A (ANÁLISIS):');
// //       lineas.push(nota.analisis);
// //       lineas.push('');
// //     }

// //     if (nota.plan) {
// //       lineas.push('P (PLAN):');
// //       lineas.push(nota.plan);
// //       lineas.push('');
// //     }

// //     return lineas.join('\n');
// //   }

// //   /**
// //    * Validar integridad de datos SOAP
// //    */
// //   validarIntegridadSOAP(nota: NotaEvolucion): {
// //     valida: boolean;
// //     problemas: string[];
// //     recomendaciones: string[];
// //   } {
// //     const problemas: string[] = [];
// //     const recomendaciones: string[] = [];

// //     // Verificar que al menos dos campos SOAP estén llenos
// //     const camposLlenos = [nota.subjetivo, nota.objetivo, nota.analisis, nota.plan]
// //       .filter(campo => campo && campo.trim() !== '').length;

// //     if (camposLlenos < 2) {
// //       problemas.push('Se recomienda completar al menos dos campos del formato SOAP');
// //     }

// //     // Verificar coherencia entre campos
// //     if (nota.plan && !nota.analisis) {
// //       recomendaciones.push('Se recomienda incluir el análisis médico antes del plan de tratamiento');
// //     }

// //     if (nota.analisis && !nota.objetivo) {
// //       recomendaciones.push('Se recomienda incluir hallazgos objetivos para sustentar el análisis');
// //     }

// //     return {
// //       valida: problemas.length === 0,
// //       problemas,
// //       recomendaciones
// //     };
// //   }
// // }
// // src/app/services/nota-evolucion.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import {
//   NotaEvolucion,
//   CreateNotaEvolucionDto,
//   UpdateNotaEvolucionDto,
//   NotaEvolucionFilters,
//   NotaEvolucionListResponse
// } from '../../models/nota-evolucion.model';
// import { ApiResponse } from '../../models/base.models';

// @Injectable({
//   providedIn: 'root'
// })
// export class NotasEvolucionService {
//   // private readonly API_URL = `${environment.apiUrl}/notas-evolucion`;
//   private readonly API_URL = 'http://localhost:3000/api/documentos-clinicos/notas-evolucion';

//   constructor(private http: HttpClient) {}

//   // ==========================================
//   // OPERACIONES CRUD BÁSICAS
//   // ==========================================

//   /**
//    * Crear nueva nota de evolución
//    */
//   create(notaData: CreateNotaEvolucionDto): Observable<ApiResponse<NotaEvolucion>> {
//     console.log('🚀 Enviando datos al backend:', notaData);
//     return this.http.post<ApiResponse<NotaEvolucion>>(this.API_URL, notaData);
//   }

//   /**
//    * Obtener todas las notas de evolución con filtros
//    */
//   getAll(filters?: NotaEvolucionFilters): Observable<ApiResponse<NotaEvolucionListResponse>> {
//     let params = new HttpParams();

//     if (filters) {
//       Object.keys(filters).forEach(key => {
//         const value = filters[key as keyof NotaEvolucionFilters];
//         if (value !== undefined && value !== null && value !== '') {
//           params = params.set(key, value.toString());
//         }
//       });
//     }

//     return this.http.get<ApiResponse<NotaEvolucionListResponse>>(this.API_URL, { params });
//   }

//   /**
//    * Obtener nota de evolución por ID
//    */
//   getById(id: number): Observable<ApiResponse<NotaEvolucion>> {
//     return this.http.get<ApiResponse<NotaEvolucion>>(`${this.API_URL}/${id}`);
//   }

//   /**
//    * Actualizar nota de evolución
//    */
//   update(id: number, notaData: UpdateNotaEvolucionDto): Observable<ApiResponse<NotaEvolucion>> {
//     return this.http.put<ApiResponse<NotaEvolucion>>(`${this.API_URL}/${id}`, notaData);
//   }

//   /**
//    * Anular nota de evolución (soft delete)
//    */
//   delete(id: number): Observable<ApiResponse<any>> {
//     return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`);
//   }

//   // ==========================================
//   // MÉTODOS ESPECÍFICOS
//   // ==========================================

//   /**
//    * Obtener notas de evolución por expediente
//    */
//   getByExpediente(idExpediente: number): Observable<ApiResponse<NotaEvolucion[]>> {
//     return this.http.get<ApiResponse<NotaEvolucion[]>>(`${this.API_URL}/expediente/${idExpediente}`);
//   }

//   /**
//    * Obtener nota de evolución por documento
//    */
//   getByDocumento(idDocumento: number): Observable<ApiResponse<NotaEvolucion>> {
//     return this.http.get<ApiResponse<NotaEvolucion>>(`${this.API_URL}/documento/${idDocumento}`);
//   }

//   /**
//    * Verificar si existe nota para un documento
//    */
//   existeNotaParaDocumento(idDocumento: number): Observable<boolean> {
//     return new Observable(observer => {
//       this.getByDocumento(idDocumento).subscribe({
//         next: (response) => {
//           observer.next(response.success && !!response.data);
//           observer.complete();
//         },
//         error: () => {
//           observer.next(false);
//           observer.complete();
//         }
//       });
//     });
//   }

//   // ==========================================
//   // MÉTODOS DE UTILIDAD
//   // ==========================================

//   /**
//    * Validar datos antes de envío
//    */
//   validarDatos(datos: CreateNotaEvolucionDto): { valido: boolean; errores: string[] } {
//     const errores: string[] = [];

//     // Validar campo obligatorio
//     if (!datos.id_documento) {
//       errores.push('El ID del documento es obligatorio');
//     }

//     // Validar campos obligatorios
//     const camposObligatorios = [
//       'sintomas_signos',
//       'habitus_exterior',
//       'estado_nutricional',
//       'estudios_laboratorio_gabinete',
//       'evolucion_analisis',
//       'diagnosticos',
//       'plan_estudios_tratamiento',
//       'pronostico'
//     ];

//     camposObligatorios.forEach(campo => {
//       const valor = datos[campo as keyof CreateNotaEvolucionDto];
//       if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
//         errores.push(`El campo ${campo.replace('_', ' ')} es obligatorio`);
//       }
//     });

//     // Validar rangos de signos vitales
//     if (datos.temperatura && (datos.temperatura < 30 || datos.temperatura > 45)) {
//       errores.push('La temperatura debe estar entre 30°C y 45°C');
//     }

//     if (datos.frecuencia_cardiaca && (datos.frecuencia_cardiaca < 30 || datos.frecuencia_cardiaca > 250)) {
//       errores.push('La frecuencia cardíaca debe estar entre 30 y 250 lpm');
//     }

//     if (datos.frecuencia_respiratoria && (datos.frecuencia_respiratoria < 8 || datos.frecuencia_respiratoria > 60)) {
//       errores.push('La frecuencia respiratoria debe estar entre 8 y 60 rpm');
//     }

//     if (datos.saturacion_oxigeno && (datos.saturacion_oxigeno < 50 || datos.saturacion_oxigeno > 100)) {
//       errores.push('La saturación de oxígeno debe estar entre 50% y 100%');
//     }

//     return {
//       valido: errores.length === 0,
//       errores
//     };
//   }

//   /**
//    * Obtener plantilla con datos por defecto
//    */
//   obtenerPlantillaVacia(idDocumento: number): CreateNotaEvolucionDto {
//     return {
//       id_documento: idDocumento,

//       // Campos obligatorios con valores por defecto
//       sintomas_signos: '',
//       habitus_exterior: '',
//       estado_nutricional: '',
//       estudios_laboratorio_gabinete: '',
//       evolucion_analisis: '',
//       diagnosticos: '',
//       plan_estudios_tratamiento: '',
//       pronostico: '',

//       // Campos opcionales
//       dias_hospitalizacion: undefined,
//       fecha_ultimo_ingreso: undefined,
//       temperatura: undefined,
//       frecuencia_cardiaca: undefined,
//       frecuencia_respiratoria: undefined,
//       presion_arterial_sistolica: undefined,
//       presion_arterial_diastolica: undefined,
//       saturacion_oxigeno: undefined,
//       peso_actual: undefined,
//       talla_actual: undefined,
//       exploracion_cabeza: '',
//       exploracion_cuello: '',
//       exploracion_torax: '',
//       exploracion_abdomen: '',
//       exploracion_extremidades: '',
//       exploracion_columna: '',
//       exploracion_genitales: '',
//       exploracion_neurologico: '',
//       diagnosticos_guias: '',
//       interconsultas: 'No se solicitaron interconsultas en esta evolución',
//       indicaciones_medicas: '',
//       observaciones_adicionales: ''
//     };
//   }

//   /**
//    * Formatear datos para envío (limpiar campos vacíos)
//    */
//   formatearParaEnvio(datos: CreateNotaEvolucionDto): CreateNotaEvolucionDto {
//     const datosLimpios = { ...datos };

//     // Limpiar strings vacíos en campos opcionales
//     Object.keys(datosLimpios).forEach(key => {
//       const valor = datosLimpios[key as keyof CreateNotaEvolucionDto];
//       if (typeof valor === 'string' && valor.trim() === '') {
//         // Solo limpiar campos opcionales, no los obligatorios
//         const camposObligatorios = [
//           'sintomas_signos',
//           'habitus_exterior',
//           'estado_nutricional',
//           'estudios_laboratorio_gabinete',
//           'evolucion_analisis',
//           'diagnosticos',
//           'plan_estudios_tratamiento',
//           'pronostico'
//         ];

//         if (!camposObligatorios.includes(key)) {
//           delete datosLimpios[key as keyof CreateNotaEvolucionDto];
//         }
//       }
//     });

//     return datosLimpios;
//   }

//   // ==========================================
//   // MÉTODOS PARA BÚSQUEDAS ESPECÍFICAS
//   // ==========================================

//   /**
//    * Buscar notas por texto libre
//    */
//   buscarPorTexto(termino: string, filtros?: Partial<NotaEvolucionFilters>): Observable<ApiResponse<NotaEvolucionListResponse>> {
//     const filters: NotaEvolucionFilters = {
//       ...filtros,
//       buscar: termino
//     };
//     return this.getAll(filters);
//   }

//   /**
//    * Obtener notas recientes (últimos 30 días)
//    */
//   getNotasRecientes(limite: number = 10): Observable<ApiResponse<NotaEvolucionListResponse>> {
//     const fechaInicio = new Date();
//     fechaInicio.setDate(fechaInicio.getDate() - 30);

//     const filters: NotaEvolucionFilters = {
//       fecha_inicio: fechaInicio.toISOString().split('T')[0],
//       limit: limite,
//       page: 1
//     };

//     return this.getAll(filters);
//   }
// }

// src/app/services/documentos-clinicos/notas-evolucion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  NotaEvolucion,
  CreateNotaEvolucionDto,
  UpdateNotaEvolucionDto,
  NotaEvolucionFilters,
  NotaEvolucionListResponse
} from '../../models/nota-evolucion.model';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class NotasEvolucionService {
  private readonly API_URL = 'http://localhost:3000/api/documentos-clinicos/notas-evolucion';

  constructor(private http: HttpClient) {}

  // ==========================================
  // OPERACIONES CRUD BÁSICAS
  // ==========================================

  /**
   * Crear nueva nota de evolución
   */
  createNotaEvolucion(notaData: CreateNotaEvolucionDto): Observable<ApiResponse<NotaEvolucion>> {
    console.log('🚀 Enviando datos al backend:', notaData);
    return this.http.post<ApiResponse<NotaEvolucion>>(this.API_URL, notaData);
  }

  /**
   * Obtener todas las notas de evolución con filtros
   */
  getNotasEvolucion(filters?: NotaEvolucionFilters): Observable<ApiResponse<NotaEvolucionListResponse>> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof NotaEvolucionFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<NotaEvolucionListResponse>>(this.API_URL, { params });
  }

  /**
   * Obtener nota de evolución por ID
   */
  getNotaEvolucionById(id: number): Observable<ApiResponse<NotaEvolucion>> {
    return this.http.get<ApiResponse<NotaEvolucion>>(`${this.API_URL}/${id}`);
  }

  /**
   * Actualizar nota de evolución
   */
  updateNotaEvolucion(id: number, notaData: UpdateNotaEvolucionDto): Observable<ApiResponse<NotaEvolucion>> {
    return this.http.put<ApiResponse<NotaEvolucion>>(`${this.API_URL}/${id}`, notaData);
  }

  /**
   * Anular nota de evolución (soft delete)
   */
  deleteNotaEvolucion(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`);
  }

  // ==========================================
  // MÉTODOS ESPECÍFICOS
  // ==========================================

  /**
   * Obtener notas de evolución por expediente
   */
  getNotasEvolucionByExpediente(idExpediente: number): Observable<ApiResponse<NotaEvolucion[]>> {
    return this.http.get<ApiResponse<NotaEvolucion[]>>(`${this.API_URL}/expediente/${idExpediente}`);
  }

  /**
   * Obtener nota de evolución por documento
   */
  getNotaEvolucionByDocumento(idDocumento: number): Observable<ApiResponse<NotaEvolucion>> {
    return this.http.get<ApiResponse<NotaEvolucion>>(`${this.API_URL}/documento/${idDocumento}`);
  }

  /**
   * Verificar si existe nota para un documento
   */
  existeNotaParaDocumento(idDocumento: number): Observable<boolean> {
    return new Observable(observer => {
      this.getNotaEvolucionByDocumento(idDocumento).subscribe({
        next: (response) => {
          observer.next(response.success && !!response.data);
          observer.complete();
        },
        error: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /**
   * Validar datos antes de envío
   */
  validarDatos(datos: CreateNotaEvolucionDto): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    // Validar campo obligatorio
    if (!datos.id_documento) {
      errores.push('El ID del documento es obligatorio');
    }

    // Validar campos obligatorios
    const camposObligatorios = [
      'sintomas_signos',
      'habitus_exterior',
      'estado_nutricional',
      'estudios_laboratorio_gabinete',
      'evolucion_analisis',
      'diagnosticos',
      'plan_estudios_tratamiento',
      'pronostico'
    ];

    camposObligatorios.forEach(campo => {
      const valor = datos[campo as keyof CreateNotaEvolucionDto];
      if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
        errores.push(`El campo ${campo.replace('_', ' ')} es obligatorio`);
      }
    });

    // Validar rangos de signos vitales
    if (datos.temperatura && (datos.temperatura < 30 || datos.temperatura > 45)) {
      errores.push('La temperatura debe estar entre 30°C y 45°C');
    }

    if (datos.frecuencia_cardiaca && (datos.frecuencia_cardiaca < 30 || datos.frecuencia_cardiaca > 250)) {
      errores.push('La frecuencia cardíaca debe estar entre 30 y 250 lpm');
    }

    if (datos.frecuencia_respiratoria && (datos.frecuencia_respiratoria < 8 || datos.frecuencia_respiratoria > 60)) {
      errores.push('La frecuencia respiratoria debe estar entre 8 y 60 rpm');
    }

    if (datos.saturacion_oxigeno && (datos.saturacion_oxigeno < 50 || datos.saturacion_oxigeno > 100)) {
      errores.push('La saturación de oxígeno debe estar entre 50% y 100%');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Obtener plantilla con datos por defecto
   */
  obtenerPlantillaVacia(idDocumento: number): CreateNotaEvolucionDto {
    return {
      id_documento: idDocumento,

      // Campos obligatorios con valores por defecto
      sintomas_signos: '',
      habitus_exterior: '',
      estado_nutricional: '',
      estudios_laboratorio_gabinete: '',
      evolucion_analisis: '',
      diagnosticos: '',
      plan_estudios_tratamiento: '',
      pronostico: '',

      // Campos opcionales
      dias_hospitalizacion: undefined,
      fecha_ultimo_ingreso: undefined,
      temperatura: undefined,
      frecuencia_cardiaca: undefined,
      frecuencia_respiratoria: undefined,
      presion_arterial_sistolica: undefined,
      presion_arterial_diastolica: undefined,
      saturacion_oxigeno: undefined,
      peso_actual: undefined,
      talla_actual: undefined,
      exploracion_cabeza: '',
      exploracion_cuello: '',
      exploracion_torax: '',
      exploracion_abdomen: '',
      exploracion_extremidades: '',
      exploracion_columna: '',
      exploracion_genitales: '',
      exploracion_neurologico: '',
      diagnosticos_guias: '',
      interconsultas: 'No se solicitaron interconsultas en esta evolución',
      indicaciones_medicas: '',
      observaciones_adicionales: ''
    };
  }

  /**
   * Formatear datos para envío (limpiar campos vacíos)
   */
  formatearParaEnvio(datos: CreateNotaEvolucionDto): CreateNotaEvolucionDto {
    const datosLimpios = { ...datos };

    // Limpiar strings vacíos en campos opcionales
    Object.keys(datosLimpios).forEach(key => {
      const valor = datosLimpios[key as keyof CreateNotaEvolucionDto];
      if (typeof valor === 'string' && valor.trim() === '') {
        // Solo limpiar campos opcionales, no los obligatorios
        const camposObligatorios = [
          'sintomas_signos',
          'habitus_exterior',
          'estado_nutricional',
          'estudios_laboratorio_gabinete',
          'evolucion_analisis',
          'diagnosticos',
          'plan_estudios_tratamiento',
          'pronostico'
        ];

        if (!camposObligatorios.includes(key)) {
          delete datosLimpios[key as keyof CreateNotaEvolucionDto];
        }
      }
    });

    return datosLimpios;
  }

  // ==========================================
  // MÉTODOS PARA BÚSQUEDAS ESPECÍFICAS
  // ==========================================

  /**
   * Buscar notas por texto libre
   */
  buscarPorTexto(termino: string, filtros?: Partial<NotaEvolucionFilters>): Observable<ApiResponse<NotaEvolucionListResponse>> {
    const filters: NotaEvolucionFilters = {
      ...filtros,
      buscar: termino
    };
    return this.getNotasEvolucion(filters);
  }

  /**
   * Obtener notas recientes (últimos 30 días)
   */
  getNotasRecientes(limite: number = 10): Observable<ApiResponse<NotaEvolucionListResponse>> {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 30);

    const filters: NotaEvolucionFilters = {
      fecha_inicio: fechaInicio.toISOString().split('T')[0],
      limit: limite,
      page: 1
    };

    return this.getNotasEvolucion(filters);
  }

  // ==========================================
  // MÉTODOS ADICIONALES PARA COMPATIBILIDAD
  // ==========================================

  /**
   * Alias para createNotaEvolucion (para mantener compatibilidad)
   */
  create(notaData: CreateNotaEvolucionDto): Observable<ApiResponse<NotaEvolucion>> {
    return this.createNotaEvolucion(notaData);
  }

  /**
   * Alias para getNotasEvolucion (para mantener compatibilidad)
   */
  getAll(filters?: NotaEvolucionFilters): Observable<ApiResponse<NotaEvolucionListResponse>> {
    return this.getNotasEvolucion(filters);
  }

  /**
   * Alias para getNotaEvolucionById (para mantener compatibilidad)
   */
  getById(id: number): Observable<ApiResponse<NotaEvolucion>> {
    return this.getNotaEvolucionById(id);
  }

  /**
   * Alias para updateNotaEvolucion (para mantener compatibilidad)
   */
  update(id: number, notaData: UpdateNotaEvolucionDto): Observable<ApiResponse<NotaEvolucion>> {
    return this.updateNotaEvolucion(id, notaData);
  }

  /**
   * Alias para deleteNotaEvolucion (para mantener compatibilidad)
   */
  delete(id: number): Observable<ApiResponse<any>> {
    return this.deleteNotaEvolucion(id);
  }

  /**
   * Alias para getNotasEvolucionByExpediente (para mantener compatibilidad)
   */
  getByExpediente(idExpediente: number): Observable<ApiResponse<NotaEvolucion[]>> {
    return this.getNotasEvolucionByExpediente(idExpediente);
  }

  /**
   * Alias para getNotaEvolucionByDocumento (para mantener compatibilidad)
   */
  getByDocumento(idDocumento: number): Observable<ApiResponse<NotaEvolucion>> {
    return this.getNotaEvolucionByDocumento(idDocumento);
  }
}
