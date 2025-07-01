// src/app/services/documentos-clinicos/notas-evolucion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  NotaEvolucion,
  NotaEvolucionFilters,
  CreateNotaEvolucionDto,
  UpdateNotaEvolucionDto,
  NotaEvolucionListResponse,
  ValidacionNotaEvolucion,
  PlantillaSOAP,
  PLANTILLAS_SOAP,
  CAMPOS_OBLIGATORIOS_EVOLUCION,
  NotaEvolucionUtils
} from '../../models/nota-evolucion.model';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class NotasEvolucionService {
  private readonly API_URL = 'http://localhost:3000/api/documentos-clinicos/notas-evolucion';

  constructor(private http: HttpClient) { }

  // ==========================================
  // OPERACIONES CRUD BÁSICAS
  // ==========================================

  /**
   * Obtener todas las notas de evolución con filtros
   */
  getNotasEvolucion(filters?: NotaEvolucionFilters): Observable<ApiResponse<NotaEvolucion[]>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.page !== undefined) {
        params = params.set('page', filters.page.toString());
      }
      if (filters.limit !== undefined) {
        params = params.set('limit', filters.limit.toString());
      }
      if (filters.id_documento) {
        params = params.set('id_documento', filters.id_documento.toString());
      }
      if (filters.id_expediente) {
        params = params.set('id_expediente', filters.id_expediente.toString());
      }
      if (filters.buscar) {
        params = params.set('buscar', filters.buscar);
      }
      if (filters.fecha_inicio) {
        params = params.set('fecha_inicio', filters.fecha_inicio);
      }
      if (filters.fecha_fin) {
        params = params.set('fecha_fin', filters.fecha_fin);
      }
      if (filters.medico_nombre) {
        params = params.set('medico_nombre', filters.medico_nombre);
      }
    }

    return this.http.get<ApiResponse<NotaEvolucion[]>>(`${this.API_URL}`, { params });
  }

  /**
   * Obtener nota de evolución por ID
   */
  getNotaEvolucionById(id: number): Observable<ApiResponse<NotaEvolucion>> {
    return this.http.get<ApiResponse<NotaEvolucion>>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtener nota de evolución por documento
   */
  getNotaEvolucionByDocumento(idDocumento: number): Observable<ApiResponse<NotaEvolucion>> {
    return this.http.get<ApiResponse<NotaEvolucion>>(`${this.API_URL}/documento/${idDocumento}`);
  }

  /**
   * Obtener notas de evolución por expediente
   */
  getNotasEvolucionByExpediente(idExpediente: number): Observable<ApiResponse<NotaEvolucion[]>> {
    return this.http.get<ApiResponse<NotaEvolucion[]>>(`${this.API_URL}/expediente/${idExpediente}`);
  }

  /**
   * Crear nueva nota de evolución
   */
  createNotaEvolucion(data: CreateNotaEvolucionDto): Observable<ApiResponse<NotaEvolucion>> {
    return this.http.post<ApiResponse<NotaEvolucion>>(`${this.API_URL}`, data);
  }

  /**
   * Actualizar nota de evolución existente
   */
  updateNotaEvolucion(id: number, data: UpdateNotaEvolucionDto): Observable<ApiResponse<NotaEvolucion>> {
    return this.http.put<ApiResponse<NotaEvolucion>>(`${this.API_URL}/${id}`, data);
  }

  /**
   * Eliminar (anular) nota de evolución
   */
  deleteNotaEvolucion(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`);
  }

  // ==========================================
  // MÉTODOS DE VALIDACIÓN Y UTILIDAD
  // ==========================================

  /**
   * Validar datos antes de crear nota de evolución
   */
  validarDatosNotaEvolucion(data: CreateNotaEvolucionDto): ValidacionNotaEvolucion {
    return NotaEvolucionUtils.validarCamposSOAP(data);
  }

  /**
   * Generar plantilla vacía para nota de evolución
   */
  generarPlantillaVacia(): CreateNotaEvolucionDto {
    return NotaEvolucionUtils.generarPlantillaVacia();
  }

  /**
   * Obtener plantillas SOAP disponibles
   */
  getPlantillasSOAP(): PlantillaSOAP[] {
    return PLANTILLAS_SOAP;
  }

  /**
   * Aplicar plantilla SOAP
   */
  aplicarPlantilla(plantillaId: string): Partial<CreateNotaEvolucionDto> {
    return NotaEvolucionUtils.aplicarPlantilla(plantillaId);
  }

  /**
   * Formatear nota en formato SOAP para mostrar
   */
  formatearSOAP(nota: NotaEvolucion): string {
    return NotaEvolucionUtils.formatearSOAP(nota);
  }

  /**
   * Calcular completitud de la nota (porcentaje de campos SOAP completados)
   */
  calcularCompletitud(nota: NotaEvolucion): {
    porcentaje: number;
    campos_completados: number;
    campos_totales: number;
    detalle: { campo: string; completado: boolean }[];
  } {
    const campos = [
      { campo: 'subjetivo', completado: !!(nota.subjetivo && nota.subjetivo.trim()) },
      { campo: 'objetivo', completado: !!(nota.objetivo && nota.objetivo.trim()) },
      { campo: 'analisis', completado: !!(nota.analisis && nota.analisis.trim()) },
      { campo: 'plan', completado: !!(nota.plan && nota.plan.trim()) }
    ];

    const completados = campos.filter(c => c.completado).length;
    const porcentaje = Math.round((completados / campos.length) * 100);

    return {
      porcentaje,
      campos_completados: completados,
      campos_totales: campos.length,
      detalle: campos
    };
  }

  /**
   * Verificar si se puede editar la nota de evolución
   */
  puedeEditar(nota: NotaEvolucion): { puede: boolean; razon?: string } {
    if (nota.estado_documento === 'Anulado') {
      return {
        puede: false,
        razon: 'No se puede editar una nota de evolución anulada'
      };
    }

    if (nota.estado_documento === 'Cancelado') {
      return {
        puede: false,
        razon: 'No se puede editar una nota de evolución cancelada'
      };
    }

    // Verificar si ha pasado más de 48 horas
    if (nota.fecha_documento) {
      const fecha = new Date(nota.fecha_documento);
      const ahora = new Date();
      const horasTranscurridas = (ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60);

      if (horasTranscurridas > 48) {
        return {
          puede: false,
          razon: 'No se puede editar una nota de evolución después de 48 horas de su creación'
        };
      }
    }

    return { puede: true };
  }

  /**
   * Generar resumen de la nota para listados
   */
  generarResumen(nota: NotaEvolucion): string {
    const partes: string[] = [];

    if (nota.subjetivo) {
      partes.push(`S: ${nota.subjetivo.substring(0, 50)}${nota.subjetivo.length > 50 ? '...' : ''}`);
    }

    if (nota.plan) {
      partes.push(`P: ${nota.plan.substring(0, 50)}${nota.plan.length > 50 ? '...' : ''}`);
    }

    return partes.join(' | ') || 'Nota sin contenido SOAP';
  }

  /**
   * Formatear fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtener color para porcentaje de completitud
   */
  getColorCompletitud(porcentaje: number): string {
    if (porcentaje >= 90) return 'success';
    if (porcentaje >= 75) return 'info';
    if (porcentaje >= 50) return 'warning';
    return 'danger';
  }

  /**
   * Buscar notas de evolución por criterios múltiples
   */
  buscarAvanzada(criterios: {
    texto?: string;
    medico?: string;
    fechaInicio?: string;
    fechaFin?: string;
    expediente?: number;
  }): Observable<ApiResponse<NotaEvolucion[]>> {
    const filtros: NotaEvolucionFilters = {};

    if (criterios.texto) {
      filtros.buscar = criterios.texto;
    }

    if (criterios.medico) {
      filtros.medico_nombre = criterios.medico;
    }

    if (criterios.fechaInicio) {
      filtros.fecha_inicio = criterios.fechaInicio;
    }

    if (criterios.fechaFin) {
      filtros.fecha_fin = criterios.fechaFin;
    }

    if (criterios.expediente) {
      filtros.id_expediente = criterios.expediente;
    }

    return this.getNotasEvolucion(filtros);
  }

  /**
   * Exportar nota de evolución a texto plano
   */
  exportarTextoPlano(nota: NotaEvolucion): string {
    const lineas: string[] = [];

    lineas.push('NOTA DE EVOLUCIÓN');
    lineas.push('==================');
    lineas.push('');

    // Datos del paciente
    lineas.push('DATOS DEL PACIENTE:');
    lineas.push(`Nombre: ${nota.paciente_nombre || 'No especificado'}`);
    lineas.push(`Expediente: ${nota.numero_expediente || 'No especificado'}`);
    lineas.push(`Fecha: ${nota.fecha_documento ? this.formatearFecha(nota.fecha_documento) : 'No especificada'}`);
    lineas.push(`Médico: ${nota.medico_nombre || 'No especificado'}`);
    lineas.push('');

    // Formato SOAP
    lineas.push('EVOLUCIÓN CLÍNICA (FORMATO SOAP):');
    lineas.push('');

    if (nota.subjetivo) {
      lineas.push('S (SUBJETIVO):');
      lineas.push(nota.subjetivo);
      lineas.push('');
    }

    if (nota.objetivo) {
      lineas.push('O (OBJETIVO):');
      lineas.push(nota.objetivo);
      lineas.push('');
    }

    if (nota.analisis) {
      lineas.push('A (ANÁLISIS):');
      lineas.push(nota.analisis);
      lineas.push('');
    }

    if (nota.plan) {
      lineas.push('P (PLAN):');
      lineas.push(nota.plan);
      lineas.push('');
    }

    return lineas.join('\n');
  }

  /**
   * Validar integridad de datos SOAP
   */
  validarIntegridadSOAP(nota: NotaEvolucion): {
    valida: boolean;
    problemas: string[];
    recomendaciones: string[];
  } {
    const problemas: string[] = [];
    const recomendaciones: string[] = [];

    // Verificar que al menos dos campos SOAP estén llenos
    const camposLlenos = [nota.subjetivo, nota.objetivo, nota.analisis, nota.plan]
      .filter(campo => campo && campo.trim() !== '').length;

    if (camposLlenos < 2) {
      problemas.push('Se recomienda completar al menos dos campos del formato SOAP');
    }

    // Verificar coherencia entre campos
    if (nota.plan && !nota.analisis) {
      recomendaciones.push('Se recomienda incluir el análisis médico antes del plan de tratamiento');
    }

    if (nota.analisis && !nota.objetivo) {
      recomendaciones.push('Se recomienda incluir hallazgos objetivos para sustentar el análisis');
    }

    return {
      valida: problemas.length === 0,
      problemas,
      recomendaciones
    };
  }
}
