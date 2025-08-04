// src/app/services/documentos-clinicos/notas-egreso.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  NotaEgreso,
  NotaEgresoFilters,
  CreateNotaEgresoDto,
  UpdateNotaEgresoDto,
  NotaEgresoListResponse,
  ValidacionNotaEgreso,
  EstadisticasNotaEgreso,
  PlantillaNotaEgreso,
  PLANTILLAS_NOTA_EGRESO,
  CAMPOS_OBLIGATORIOS_EGRESO,
  MOTIVOS_EGRESO_OPCIONES,
  NotaEgresoUtils
} from '../../models/nota-egreso.model';
import { ApiResponse } from '../../models/base.models';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class NotasEgresoService {
  private readonly API_URL = `${environment.apiUrl}/documentos-clinicos/notas-egreso`;

  constructor(private http: HttpClient) { }

  // ==========================================
  // OPERACIONES CRUD BÁSICAS
  // ==========================================

  /**
   * Obtener todas las notas de egreso con filtros
   */
  getNotasEgreso(filters?: NotaEgresoFilters): Observable<ApiResponse<NotaEgreso[]>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.page !== undefined) {
        params = params.set('page', filters.page.toString());
      }
      if (filters.limit !== undefined) {
        params = params.set('limit', filters.limit.toString());
      }
      if (filters.motivo_egreso) {
        params = params.set('motivo_egreso', filters.motivo_egreso);
      }
      if (filters.fecha_inicio) {
        params = params.set('fecha_inicio', filters.fecha_inicio);
      }
      if (filters.fecha_fin) {
        params = params.set('fecha_fin', filters.fecha_fin);
      }
      if (filters.buscar) {
        params = params.set('buscar', filters.buscar);
      }
    }

    return this.http.get<ApiResponse<NotaEgreso[]>>(`${this.API_URL}`, { params });
  }

  /**
   * Obtener nota de egreso por ID
   */
  getNotaEgresoById(id: number): Observable<ApiResponse<NotaEgreso>> {
    return this.http.get<ApiResponse<NotaEgreso>>(`${this.API_URL}/${id}`);
  }

  /**
   * Crear nueva nota de egreso
   */
  createNotaEgreso(data: CreateNotaEgresoDto): Observable<ApiResponse<NotaEgreso>> {
    return this.http.post<ApiResponse<NotaEgreso>>(`${this.API_URL}`, data);
  }

  /**
   * Actualizar nota de egreso existente
   */
  updateNotaEgreso(id: number, data: UpdateNotaEgresoDto): Observable<ApiResponse<NotaEgreso>> {
    return this.http.put<ApiResponse<NotaEgreso>>(`${this.API_URL}/${id}`, data);
  }

  /**
   * Eliminar nota de egreso
   */
  deleteNotaEgreso(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`);
  }

  // ==========================================
  // CONSULTAS ESPECÍFICAS
  // ==========================================

  /**
   * Obtener notas de egreso por expediente
   */
  getNotasEgresoByExpediente(idExpediente: number): Observable<ApiResponse<NotaEgreso[]>> {
    return this.http.get<ApiResponse<NotaEgreso[]>>(`${this.API_URL}/expediente/${idExpediente}`);
  }

  /**
   * Obtener notas de egreso por paciente
   */
  getNotasEgresoByPaciente(idPaciente: number): Observable<ApiResponse<NotaEgreso[]>> {
    return this.http.get<ApiResponse<NotaEgreso[]>>(`${this.API_URL}/paciente/${idPaciente}`);
  }

  /**
   * Buscar notas de egreso
   */
  searchNotasEgreso(query: string): Observable<ApiResponse<NotaEgreso[]>> {
    return this.http.get<ApiResponse<NotaEgreso[]>>(`${this.API_URL}/search/${query}`);
  }

  /**
   * Obtener notas de egreso con detalles completos
   */
  getNotasEgresoWithDetails(limit: number = 10): Observable<ApiResponse<NotaEgreso[]>> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<ApiResponse<NotaEgreso[]>>(`${this.API_URL}/details/all`, { params });
  }

  /**
   * Obtener estadísticas de notas de egreso
   */
  getEstadisticasNotasEgreso(): Observable<ApiResponse<EstadisticasNotaEgreso>> {
    return this.http.get<ApiResponse<EstadisticasNotaEgreso>>(`${this.API_URL}/estadisticas/general`);
  }

  /**
   * Validar completitud de nota de egreso
   */
  validarNotaEgreso(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/${id}/validar`, {});
  }

  // ==========================================
  // MÉTODOS DE VALIDACIÓN Y UTILIDAD
  // ==========================================

  /**
   * Validar datos antes de crear nota de egreso
   */
  validarDatosNotaEgreso(data: CreateNotaEgresoDto): ValidacionNotaEgreso {
    return NotaEgresoUtils.validarCamposObligatorios(data);
  }

  /**
   * Generar plantilla vacía para nota de egreso
   */
  generarPlantillaVacia(): CreateNotaEgresoDto {
    return NotaEgresoUtils.generarPlantillaVacia();
  }

  /**
   * Obtener plantillas de nota de egreso disponibles
   */
  getPlantillasNotaEgreso(): PlantillaNotaEgreso[] {
    return PLANTILLAS_NOTA_EGRESO;
  }

  /**
   * Aplicar plantilla de nota de egreso
   */
  aplicarPlantilla(plantillaId: string): Partial<CreateNotaEgresoDto> {
    return NotaEgresoUtils.aplicarPlantilla(plantillaId);
  }

  /**
   * Obtener opciones de motivos de egreso
   */
  getMotivosEgresoOpciones(): { value: string; label: string }[] {
    return MOTIVOS_EGRESO_OPCIONES;
  }

  /**
   * Obtener campos obligatorios
   */
  getCamposObligatorios(): string[] {
    return CAMPOS_OBLIGATORIOS_EGRESO;
  }

  /**
   * Formatear fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    return NotaEgresoUtils.formatearFecha(fecha);
  }

  /**
   * Obtener color para motivo de egreso
   */
  getColorMotivo(motivo: string): string {
    return NotaEgresoUtils.obtenerColorMotivo(motivo);
  }

  /**
   * Generar resumen de la nota para listados
   */
  generarResumen(nota: NotaEgreso): string {
    return NotaEgresoUtils.generarResumen(nota);
  }

  /**
   * Exportar nota de egreso a texto plano
   */
  exportarTextoPlano(nota: NotaEgreso): string {
    return NotaEgresoUtils.exportarTextoPlano(nota);
  }

  /**
   * Verificar si es reingreso
   */
  esReingreso(nota: NotaEgreso): boolean {
    return nota.reingreso_por_misma_afeccion === true;
  }

  /**
   * Calcular días de hospitalización (si están disponibles en el backend)
   */
  calcularDiasHospitalizacion(fechaIngreso: string, fechaEgreso: string): number {
    if (!fechaIngreso || !fechaEgreso) return 0;

    const ingreso = new Date(fechaIngreso);
    const egreso = new Date(fechaEgreso);
    const diferencia = egreso.getTime() - ingreso.getTime();

    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  /**
   * Validar motivo de egreso
   */
  validarMotivoEgreso(motivo: string): boolean {
    return MOTIVOS_EGRESO_OPCIONES.some(opcion => opcion.value === motivo);
  }

  /**
   * Buscar notas de egreso por criterios múltiples
   */
  buscarAvanzada(criterios: {
    texto?: string;
    motivo?: string;
    fechaInicio?: string;
    fechaFin?: string;
    conReingreso?: boolean;
  }): Observable<ApiResponse<NotaEgreso[]>> {
    const filtros: NotaEgresoFilters = {};

    if (criterios.texto) {
      filtros.buscar = criterios.texto;
    }

    if (criterios.motivo) {
      filtros.motivo_egreso = criterios.motivo;
    }

    if (criterios.fechaInicio) {
      filtros.fecha_inicio = criterios.fechaInicio;
    }

    if (criterios.fechaFin) {
      filtros.fecha_fin = criterios.fechaFin;
    }

    return this.getNotasEgreso(filtros);
  }

  /**
   * Generar estadísticas simples de una lista de notas
   */
  generarEstadisticasSimples(notas: NotaEgreso[]): {
    total: number;
    por_motivo: { [key: string]: number };
    reingresos: number;
    porcentaje_reingresos: number;
  } {
    const total = notas.length;
    const porMotivo: { [key: string]: number } = {};
    let reingresos = 0;

    notas.forEach(nota => {
      // Contar por motivo
      if (nota.motivo_egreso) {
        porMotivo[nota.motivo_egreso] = (porMotivo[nota.motivo_egreso] || 0) + 1;
      }

      // Contar reingresos
      if (nota.reingreso_por_misma_afeccion) {
        reingresos++;
      }
    });

    return {
      total,
      por_motivo: porMotivo,
      reingresos,
      porcentaje_reingresos: total > 0 ? Math.round((reingresos / total) * 100) : 0
    };
  }

  /**
   * Obtener notas de egreso recientes
   */
  getNotasEgresoRecientes(dias: number = 7): Observable<ApiResponse<NotaEgreso[]>> {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);

    const filtros: NotaEgresoFilters = {
      fecha_inicio: fechaInicio.toISOString().split('T')[0],
      limit: 50
    };

    return this.getNotasEgreso(filtros);
  }

  /**
   * Verificar si la nota está completa
   */
  estaCompleta(nota: NotaEgreso): boolean {
    const validacion = this.validarDatosNotaEgreso(nota);
    return validacion.valido;
  }

  /**
   * Obtener campos faltantes en una nota
   */
  getCamposFaltantes(nota: NotaEgreso): string[] {
    const validacion = this.validarDatosNotaEgreso(nota);
    return validacion.campos_faltantes;
  }

  /**
   * Generar reporte de nota de egreso
   */
  generarReporte(nota: NotaEgreso): {
    encabezado: any;
    contenido: any;
    pie: any;
  } {
    return {
      encabezado: {
        hospital: 'Hospital General San Luis de la Paz',
        titulo: 'NOTA DE EGRESO HOSPITALARIO',
        paciente: nota.nombre_paciente,
        expediente: nota.numero_expediente,
        fecha: this.formatearFecha(nota.fecha_documento || '')
      },
      contenido: {
        diagnostico_ingreso: nota.diagnostico_ingreso,
        resumen_evolucion: nota.resumen_evolucion,
        manejo_hospitalario: nota.manejo_hospitalario,
        diagnostico_egreso: nota.diagnostico_egreso,
        procedimientos_realizados: nota.procedimientos_realizados,
        motivo_egreso: nota.motivo_egreso,
        plan_tratamiento: nota.plan_tratamiento,
        recomendaciones_vigilancia: nota.recomendaciones_vigilancia,
        pronostico: nota.pronostico
      },
      pie: {
        medico: nota.nombre_medico,
        cedula: nota.numero_cedula,
        fecha_elaboracion: this.formatearFecha(nota.fecha_documento || ''),
        reingreso: nota.reingreso_por_misma_afeccion ? 'Sí' : 'No'
      }
    };
  }
}
