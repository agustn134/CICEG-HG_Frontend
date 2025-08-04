// src/app/services/documentos-clinicos/notas-evolucion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  NotaEvolucion,
  CreateNotaEvolucionDto,
  UpdateNotaEvolucionDto,
  NotaEvolucionFilters,
  NotaEvolucionListResponse,
  CAMPOS_OBLIGATORIOS_NOM004,
  CAMPOS_RECOMENDADOS_NOM004
} from '../../models/nota-evolucion.model';
import { ApiResponse } from '../../models/base.models';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class NotasEvolucionService {
  private readonly API_URL = `${environment.apiUrl}/documentos-clinicos/notas-evolucion`;

  constructor(private http: HttpClient) {}

  // ==========================================
  // OPERACIONES CRUD BÁSICAS
  // ==========================================

  /**
   * Crear nueva nota de evolución
   */
  // CRUD básico (mantienes los métodos existentes)
  createNotaEvolucion(notaData: CreateNotaEvolucionDto): Observable<ApiResponse<NotaEvolucion>> {
    console.log('  Enviando datos al backend:', notaData);
    return this.http.post<ApiResponse<NotaEvolucion>>(this.API_URL, notaData);
  }


  // 🔥 NUEVO: Validación según NOM-004-SSA3-2012
  validarDatosNOM004(datos: CreateNotaEvolucionDto): { valido: boolean; errores: string[]; advertencias: string[] } {
    const errores: string[] = [];
    const advertencias: string[] = [];

    // Validar campos obligatorios según NOM-004
    CAMPOS_OBLIGATORIOS_NOM004.forEach(campo => {
      const valor = datos[campo as keyof CreateNotaEvolucionDto];
      if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
        errores.push(`Campo obligatorio según NOM-004-SSA3-2012: ${campo.replace('_', ' ')}`);
      }
    });

    // Validar campos recomendados
    CAMPOS_RECOMENDADOS_NOM004.forEach(campo => {
      const valor = datos[campo as keyof CreateNotaEvolucionDto];
      if (!valor) {
        advertencias.push(`Se recomienda completar: ${campo.replace('_', ' ')}`);
      }
    });

    // Validaciones específicas de rangos (NOM-004 - Signos vitales)
    if (datos.temperatura && (datos.temperatura < 30 || datos.temperatura > 45)) {
      errores.push('Temperatura fuera del rango normal (30-45°C)');
    }

    if (datos.frecuencia_cardiaca && (datos.frecuencia_cardiaca < 30 || datos.frecuencia_cardiaca > 250)) {
      errores.push('Frecuencia cardíaca fuera del rango normal (30-250 lpm)');
    }

    if (datos.frecuencia_respiratoria && (datos.frecuencia_respiratoria < 8 || datos.frecuencia_respiratoria > 60)) {
      errores.push('Frecuencia respiratoria fuera del rango normal (8-60 rpm)');
    }

    if (datos.saturacion_oxigeno && (datos.saturacion_oxigeno < 50 || datos.saturacion_oxigeno > 100)) {
      errores.push('Saturación de oxígeno fuera del rango válido (50-100%)');
    }

    // Validación específica de diagnósticos (NOM-004 - 6.2.4)
    if (datos.diagnosticos && datos.diagnosticos.length < 10) {
      advertencias.push('Los diagnósticos deben ser específicos y detallados según NOM-004');
    }

    return {
      valido: errores.length === 0,
      errores,
      advertencias
    };
  }

// 🔥 NUEVO: Plantilla actualizada según NOM-004
  obtenerPlantillaNOM004(idDocumento: number): CreateNotaEvolucionDto {
    return {
      id_documento: idDocumento,
      id_guia_diagnostico: undefined,

      // Campos obligatorios con valores por defecto según NOM-004
      sintomas_signos: '',
      habitus_exterior: '',
      estado_nutricional: '',
      estudios_laboratorio_gabinete: '',
      evolucion_analisis: '',
      diagnosticos: '',
      plan_estudios_tratamiento: '',
      pronostico: '',

      // Campos recomendados
      interconsultas: 'No se solicitaron interconsultas',
      indicaciones_medicas: '',
      diagnosticos_guias: '',
      observaciones_adicionales: '',

      // Signos vitales
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

      // Exploración física
      exploracion_cabeza: '',
      exploracion_cuello: '',
      exploracion_torax: '',
      exploracion_abdomen: '',
      exploracion_extremidades: '',
      exploracion_columna: '',
      exploracion_genitales: '',
      exploracion_neurologico: ''
    };
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
