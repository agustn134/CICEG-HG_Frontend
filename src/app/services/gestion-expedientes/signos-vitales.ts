// src/app/services/gestion-expedientes/signos-vitales.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SignosVitales,
  SignosVitalesCompleto,
  SignosVitalesFilters,
  CreateSignosVitalesDto,
  UpdateSignosVitalesDto,
  DeleteSignosVitalesDto,
  GraficaSignosVitalesResponse,
  HistorialSignosVitalesResponse,
  UltimosSignosVitales,
  TipoSignoVital,
  ValidacionSignosVitales,
  RangosNormales,
  RANGOS_NORMALES_ADULTO,
  RANGOS_NORMALES_PEDIATRICO,
  RANGOS_NORMALES_NEONATO
} from '../../models/signos-vitales.model';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class SignosVitalesService {
  private readonly API_URL = 'http://localhost:3000/api/gestion-expedientes/signos-vitales';

  constructor(private http: HttpClient) { }

  // ==========================================
  // OPERACIONES CRUD BÁSICAS
  // ==========================================

  /**
   * Obtener todos los signos vitales con filtros y paginación
   */
  getSignosVitales(filters?: SignosVitalesFilters): Observable<ApiResponse<SignosVitales[]>> {
    let params = new HttpParams();

    if (filters) {
      // Filtros principales
      if (filters.id_expediente) {
        params = params.set('id_expediente', filters.id_expediente.toString());
      }
      if (filters.id_internamiento) {
        params = params.set('id_internamiento', filters.id_internamiento.toString());
      }
      if (filters.id_documento) {
        params = params.set('id_documento', filters.id_documento.toString());
      }
      if (filters.fecha_inicio) {
        params = params.set('fecha_inicio', filters.fecha_inicio);
      }
      if (filters.fecha_fin) {
        params = params.set('fecha_fin', filters.fecha_fin);
      }
      if (filters.incluir_anormales !== undefined) {
        params = params.set('incluir_anormales', filters.incluir_anormales.toString());
      }

      // Paginación
      if (filters.limit !== undefined) {
        params = params.set('limit', filters.limit.toString());
      }
      if (filters.offset !== undefined) {
        params = params.set('offset', filters.offset.toString());
      }

      // Filtros base
      if (filters.search) {
        params = params.set('search', filters.search);
      }
      if (filters.sort_by) {
        params = params.set('sort_by', filters.sort_by);
      }
      if (filters.sort_order) {
        params = params.set('sort_order', filters.sort_order);
      }
    }

    return this.http.get<ApiResponse<SignosVitales[]>>(`${this.API_URL}`, { params });
  }

  /**
   * Obtener signos vitales por ID (vista completa)
   */
  getSignosVitalesById(id: number): Observable<ApiResponse<SignosVitalesCompleto>> {
    return this.http.get<ApiResponse<SignosVitalesCompleto>>(`${this.API_URL}/${id}`);
  }

  /**
   * Crear nuevos signos vitales
   */
  createSignosVitales(data: CreateSignosVitalesDto): Observable<ApiResponse<SignosVitales>> {
    return this.http.post<ApiResponse<SignosVitales>>(`${this.API_URL}`, data);
  }

  /**
   * Actualizar signos vitales existentes
   */
  updateSignosVitales(id: number, data: UpdateSignosVitalesDto): Observable<ApiResponse<SignosVitales>> {
    return this.http.put<ApiResponse<SignosVitales>>(`${this.API_URL}/${id}`, data);
  }

  /**
   * Eliminar (anular) signos vitales
   */
  deleteSignosVitales(id: number, data?: DeleteSignosVitalesDto): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`, { body: data });
  }

  // ==========================================
  // CONSULTAS ESPECIALIZADAS
  // ==========================================

  /**
   * Obtener últimos signos vitales de un expediente
   */
  getUltimosSignosVitalesPaciente(idExpediente: number, limite: number = 1): Observable<ApiResponse<UltimosSignosVitales | UltimosSignosVitales[]>> {
    let params = new HttpParams();
    if (limite !== 1) {
      params = params.set('limite', limite.toString());
    }

    return this.http.get<ApiResponse<UltimosSignosVitales | UltimosSignosVitales[]>>(`${this.API_URL}/expediente/${idExpediente}/ultimos`, { params });
  }

  /**
   * Obtener historial completo de signos vitales de un expediente
   */
  getHistorialSignosVitales(
    idExpediente: number,
    filters?: {
      fecha_inicio?: string;
      fecha_fin?: string;
      tipo_signo?: string;
      limit?: number;
      offset?: number;
    }
  ): Observable<ApiResponse<HistorialSignosVitalesResponse>> {
    let params = new HttpParams();

    if (filters?.fecha_inicio) {
      params = params.set('fecha_inicio', filters.fecha_inicio);
    }
    if (filters?.fecha_fin) {
      params = params.set('fecha_fin', filters.fecha_fin);
    }
    if (filters?.tipo_signo) {
      params = params.set('tipo_signo', filters.tipo_signo);
    }
    if (filters?.limit !== undefined) {
      params = params.set('limit', filters.limit.toString());
    }
    if (filters?.offset !== undefined) {
      params = params.set('offset', filters.offset.toString());
    }

    return this.http.get<ApiResponse<HistorialSignosVitalesResponse>>(`${this.API_URL}/expediente/${idExpediente}/historial`, { params });
  }

  /**
   * Obtener datos para gráfica de signos vitales
   */
  getGraficaSignosVitales(
    idExpediente: number,
    filters?: {
      tipo_signo?: TipoSignoVital;
      dias?: number;
      id_internamiento?: number;
    }
  ): Observable<ApiResponse<GraficaSignosVitalesResponse>> {
    let params = new HttpParams();

    if (filters?.tipo_signo) {
      params = params.set('tipo_signo', filters.tipo_signo);
    }
    if (filters?.dias !== undefined) {
      params = params.set('dias', filters.dias.toString());
    }
    if (filters?.id_internamiento) {
      params = params.set('id_internamiento', filters.id_internamiento.toString());
    }

    return this.http.get<ApiResponse<GraficaSignosVitalesResponse>>(`${this.API_URL}/expediente/${idExpediente}/grafica`, { params });
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD Y VALIDACIÓN
  // ==========================================

  /**
   * Validar datos antes de crear signos vitales
   */
  validarDatosSignosVitales(data: CreateSignosVitalesDto, edad?: number): ValidacionSignosVitales {
    const errores: string[] = [];
    const advertencias: string[] = [];
    const valoresAnormales: any[] = [];

    // Validaciones obligatorias
    if (!data.id_expediente) {
      errores.push('El expediente es obligatorio');
    }

    if (!data.id_medico_registra) {
      errores.push('El médico que registra es obligatorio');
    }

    // Validar que al menos se registre un signo vital
    const signosRegistrados = [
      data.temperatura,
      data.presion_arterial_sistolica,
      data.presion_arterial_diastolica,
      data.frecuencia_cardiaca,
      data.frecuencia_respiratoria,
      data.saturacion_oxigeno,
      data.glucosa,
      data.peso,
      data.talla
    ].filter(valor => valor !== null && valor !== undefined);

    if (signosRegistrados.length === 0) {
      errores.push('Debe registrar al menos un signo vital');
    }

    // Obtener rangos normales según edad
    const rangos = this.obtenerRangosNormalesPorEdad(edad || 25);

    // Validar rangos y detectar anormalidades
    if (data.temperatura !== undefined) {
      if (data.temperatura < 35 || data.temperatura > 42) {
        errores.push('La temperatura está fuera del rango fisiológico (35-42°C)');
      } else if (data.temperatura < rangos.temperatura.min || data.temperatura > rangos.temperatura.max) {
        valoresAnormales.push({
          parametro: 'Temperatura',
          valor: data.temperatura,
          rango_normal: rangos.temperatura,
          nivel: this.determinarNivelAnormalidad(data.temperatura, rangos.temperatura)
        });
      }
    }

    if (data.presion_arterial_sistolica !== undefined) {
      if (data.presion_arterial_sistolica < 50 || data.presion_arterial_sistolica > 250) {
        errores.push('La presión sistólica está fuera del rango fisiológico (50-250 mmHg)');
      } else if (data.presion_arterial_sistolica < rangos.presion_sistolica.min || data.presion_arterial_sistolica > rangos.presion_sistolica.max) {
        valoresAnormales.push({
          parametro: 'Presión Sistólica',
          valor: data.presion_arterial_sistolica,
          rango_normal: rangos.presion_sistolica,
          nivel: this.determinarNivelAnormalidad(data.presion_arterial_sistolica, rangos.presion_sistolica)
        });
      }
    }

    if (data.frecuencia_cardiaca !== undefined) {
      if (data.frecuencia_cardiaca < 30 || data.frecuencia_cardiaca > 220) {
        errores.push('La frecuencia cardíaca está fuera del rango fisiológico (30-220 lpm)');
      } else if (data.frecuencia_cardiaca < rangos.frecuencia_cardiaca.min || data.frecuencia_cardiaca > rangos.frecuencia_cardiaca.max) {
        valoresAnormales.push({
          parametro: 'Frecuencia Cardíaca',
          valor: data.frecuencia_cardiaca,
          rango_normal: rangos.frecuencia_cardiaca,
          nivel: this.determinarNivelAnormalidad(data.frecuencia_cardiaca, rangos.frecuencia_cardiaca)
        });
      }
    }

    if (data.saturacion_oxigeno !== undefined) {
      if (data.saturacion_oxigeno < 50 || data.saturacion_oxigeno > 100) {
        errores.push('La saturación de oxígeno está fuera del rango fisiológico (50-100%)');
      } else if (data.saturacion_oxigeno < rangos.saturacion_oxigeno.min) {
        valoresAnormales.push({
          parametro: 'Saturación de Oxígeno',
          valor: data.saturacion_oxigeno,
          rango_normal: rangos.saturacion_oxigeno,
          nivel: data.saturacion_oxigeno < 90 ? 'severo' : 'moderado'
        });
      }
    }

    // Validar coherencia entre presiones
    if (data.presion_arterial_sistolica && data.presion_arterial_diastolica) {
      if (data.presion_arterial_sistolica <= data.presion_arterial_diastolica) {
        errores.push('La presión sistólica debe ser mayor que la diastólica');
      }
    }

    // Generar advertencias
    if (valoresAnormales.length > 0) {
      advertencias.push(`Se detectaron ${valoresAnormales.length} valor(es) fuera del rango normal`);
    }

    return {
      valido: errores.length === 0,
      errores,
      advertencias,
      valores_anormales: valoresAnormales
    };
  }

  /**
   * Obtener rangos normales según la edad del paciente
   */
  obtenerRangosNormalesPorEdad(edad: number): RangosNormales {
    if (edad < 0.1) { // Neonatos (menos de 1 mes)
      return RANGOS_NORMALES_NEONATO;
    } else if (edad < 18) { // Pediátricos
      return RANGOS_NORMALES_PEDIATRICO;
    } else { // Adultos
      return RANGOS_NORMALES_ADULTO;
    }
  }

  /**
   * Determinar nivel de anormalidad de un valor
   */
  private determinarNivelAnormalidad(valor: number, rango: { min: number; max: number }): 'leve' | 'moderado' | 'severo' {
    const diferencia = Math.min(Math.abs(valor - rango.min), Math.abs(valor - rango.max));
    const rangoTotal = rango.max - rango.min;
    const porcentajeDiferencia = (diferencia / rangoTotal) * 100;

    if (porcentajeDiferencia <= 20) {
      return 'leve';
    } else if (porcentajeDiferencia <= 50) {
      return 'moderado';
    } else {
      return 'severo';
    }
  }

  /**
   * Verificar si un valor está dentro del rango normal
   */
  esValorNormal(valor: number, parametro: string, edad: number = 25): boolean {
    const rangos = this.obtenerRangosNormalesPorEdad(edad);

    switch (parametro) {
      case 'temperatura':
        return valor >= rangos.temperatura.min && valor <= rangos.temperatura.max;
      case 'presion_sistolica':
        return valor >= rangos.presion_sistolica.min && valor <= rangos.presion_sistolica.max;
      case 'presion_diastolica':
        return valor >= rangos.presion_diastolica.min && valor <= rangos.presion_diastolica.max;
      case 'frecuencia_cardiaca':
        return valor >= rangos.frecuencia_cardiaca.min && valor <= rangos.frecuencia_cardiaca.max;
      case 'frecuencia_respiratoria':
        return valor >= rangos.frecuencia_respiratoria.min && valor <= rangos.frecuencia_respiratoria.max;
      case 'saturacion_oxigeno':
        return valor >= rangos.saturacion_oxigeno.min && valor <= rangos.saturacion_oxigeno.max;
      case 'glucosa':
        return rangos.glucosa ? valor >= rangos.glucosa.min && valor <= rangos.glucosa.max : true;
      default:
        return true;
    }
  }

  /**
   * Calcular IMC
   */
  calcularIMC(peso: number, tallaCm: number): number {
    const tallaM = tallaCm / 100;
    return Math.round((peso / (tallaM * tallaM)) * 100) / 100;
  }

  /**
   * Interpretar IMC
   */
  interpretarIMC(imc: number): string {
    if (imc < 18.5) return 'Bajo peso';
    if (imc >= 18.5 && imc < 25) return 'Peso normal';
    if (imc >= 25 && imc < 30) return 'Sobrepeso';
    if (imc >= 30 && imc < 35) return 'Obesidad grado I';
    if (imc >= 35 && imc < 40) return 'Obesidad grado II';
    return 'Obesidad grado III';
  }

  /**
   * Formatear presión arterial para mostrar
   */
formatearPresionArterial(sistolica?: number, diastolica?: number): string {
    if (sistolica && diastolica) {
      return `${sistolica}/${diastolica} mmHg`;
    } else if (sistolica) {
      return `${sistolica}/- mmHg`;
    } else if (diastolica) {
      return `-/${diastolica} mmHg`;
    }
    return 'No registrada';
  }

  /**
   * Obtener color para un valor según si es normal o anormal
   */
  getColorValor(valor: number, parametro: string, edad: number = 25): string {
    if (this.esValorNormal(valor, parametro, edad)) {
      return 'success';
    }

    const rangos = this.obtenerRangosNormalesPorEdad(edad);
    const nivel = this.determinarNivelAnormalidadPublico(valor, parametro, rangos);

    switch (nivel) {
      case 'leve':
        return 'warning';
      case 'moderado':
        return 'orange';
      case 'severo':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Método público para determinar nivel de anormalidad
   */
  private determinarNivelAnormalidadPublico(valor: number, parametro: string, rangos: RangosNormales): 'leve' | 'moderado' | 'severo' {
    let rango: { min: number; max: number };

    switch (parametro) {
      case 'temperatura':
        rango = rangos.temperatura;
        break;
      case 'presion_sistolica':
        rango = rangos.presion_sistolica;
        break;
      case 'presion_diastolica':
        rango = rangos.presion_diastolica;
        break;
      case 'frecuencia_cardiaca':
        rango = rangos.frecuencia_cardiaca;
        break;
      case 'saturacion_oxigeno':
        rango = rangos.saturacion_oxigeno;
        break;
      default:
        return 'leve';
    }

    return this.determinarNivelAnormalidad(valor, rango);
  }

  /**
   * Obtener icono para un parámetro
   */
  getIconoParametro(parametro: string): string {
    switch (parametro) {
      case 'temperatura':
        return 'fas fa-thermometer-half';
      case 'presion':
      case 'presion_sistolica':
      case 'presion_diastolica':
        return 'fas fa-heart-pulse';
      case 'frecuencia_cardiaca':
        return 'fas fa-heartbeat';
      case 'frecuencia_respiratoria':
        return 'fas fa-lungs';
      case 'saturacion_oxigeno':
        return 'fas fa-percentage';
      case 'glucosa':
        return 'fas fa-vial';
      case 'peso':
        return 'fas fa-weight';
      case 'talla':
        return 'fas fa-ruler-vertical';
      case 'imc':
        return 'fas fa-calculator';
      default:
        return 'fas fa-stethoscope';
    }
  }

  /**
   * Obtener unidad de medida para un parámetro
   */
  getUnidadMedida(parametro: string): string {
    switch (parametro) {
      case 'temperatura':
        return '°C';
      case 'presion_sistolica':
      case 'presion_diastolica':
        return 'mmHg';
      case 'frecuencia_cardiaca':
        return 'lpm';
      case 'frecuencia_respiratoria':
        return 'rpm';
      case 'saturacion_oxigeno':
        return '%';
      case 'glucosa':
        return 'mg/dl';
      case 'peso':
        return 'kg';
      case 'talla':
        return 'cm';
      case 'imc':
        return 'kg/m²';
      default:
        return '';
    }
  }

  /**
   * Formatear fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formatear valor con unidad
   */
  formatearValorConUnidad(valor: number | undefined, parametro: string): string {
    if (valor === undefined || valor === null) {
      return 'No registrado';
    }

    const unidad = this.getUnidadMedida(parametro);
    return `${valor} ${unidad}`;
  }

  // ==========================================
  // MÉTODOS PARA ANÁLISIS Y TENDENCIAS
  // ==========================================

  /**
   * Analizar tendencia de un parámetro en el tiempo
   */
  analizarTendencia(valores: { fecha: string; valor: number }[]): 'estable' | 'mejorando' | 'empeorando' {
    if (valores.length < 2) {
      return 'estable';
    }

    // Ordenar por fecha
    const valoresOrdenados = valores.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    // Calcular la tendencia usando regresión lineal simple
    const n = valoresOrdenados.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    valoresOrdenados.forEach((item, index) => {
      const x = index;
      const y = item.valor;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const pendiente = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    // Determinar tendencia basada en la pendiente
    if (Math.abs(pendiente) < 0.1) {
      return 'estable';
    } else if (pendiente > 0) {
      return 'mejorando'; // Valores aumentando
    } else {
      return 'empeorando'; // Valores disminuyendo
    }
  }

  /**
   * Obtener resumen de signos vitales anormales
   */
  obtenerResumenAnormalidades(signosVitales: SignosVitales[], edad: number = 25): {
    total: number;
    anormales: number;
    porcentaje: number;
    parametrosMasAlterados: string[];
  } {
    if (signosVitales.length === 0) {
      return {
        total: 0,
        anormales: 0,
        porcentaje: 0,
        parametrosMasAlterados: []
      };
    }

    const contadorAnormalidades: { [key: string]: number } = {};
    let totalAnormales = 0;

    signosVitales.forEach(signos => {
      let tieneAnormalidad = false;

      // Verificar cada parámetro
      if (signos.temperatura && !this.esValorNormal(signos.temperatura, 'temperatura', edad)) {
        contadorAnormalidades['temperatura'] = (contadorAnormalidades['temperatura'] || 0) + 1;
        tieneAnormalidad = true;
      }

      if (signos.presion_arterial_sistolica && !this.esValorNormal(signos.presion_arterial_sistolica, 'presion_sistolica', edad)) {
        contadorAnormalidades['presion'] = (contadorAnormalidades['presion'] || 0) + 1;
        tieneAnormalidad = true;
      }

      if (signos.frecuencia_cardiaca && !this.esValorNormal(signos.frecuencia_cardiaca, 'frecuencia_cardiaca', edad)) {
        contadorAnormalidades['frecuencia_cardiaca'] = (contadorAnormalidades['frecuencia_cardiaca'] || 0) + 1;
        tieneAnormalidad = true;
      }

      if (signos.saturacion_oxigeno && !this.esValorNormal(signos.saturacion_oxigeno, 'saturacion_oxigeno', edad)) {
        contadorAnormalidades['saturacion'] = (contadorAnormalidades['saturacion'] || 0) + 1;
        tieneAnormalidad = true;
      }

      if (tieneAnormalidad) {
        totalAnormales++;
      }
    });

    // Obtener los parámetros más alterados
    const parametrosMasAlterados = Object.entries(contadorAnormalidades)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([parametro]) => parametro);

    return {
      total: signosVitales.length,
      anormales: totalAnormales,
      porcentaje: Math.round((totalAnormales / signosVitales.length) * 100),
      parametrosMasAlterados
    };
  }

  // ==========================================
  // MÉTODOS PARA FORMULARIOS Y SELECTS
  // ==========================================

  /**
   * Obtener opciones para tipos de signos vitales
   */
  getTiposSignosVitales(): { value: TipoSignoVital; label: string }[] {
    return [
      { value: 'todos', label: 'Todos los signos' },
      { value: 'temperatura', label: 'Temperatura' },
      { value: 'presion', label: 'Presión arterial' },
      { value: 'frecuencia_cardiaca', label: 'Frecuencia cardíaca' },
      { value: 'saturacion', label: 'Saturación de oxígeno' },
      { value: 'glucosa', label: 'Glucosa' },
      { value: 'peso', label: 'Peso y talla' }
    ];
  }

  /**
   * Obtener opciones para períodos de gráficas
   */
  getPeriodosGraficas(): { value: number; label: string }[] {
    return [
      { value: 1, label: 'Último día' },
      { value: 3, label: 'Últimos 3 días' },
      { value: 7, label: 'Última semana' },
      { value: 15, label: 'Últimos 15 días' },
      { value: 30, label: 'Último mes' },
      { value: 90, label: 'Últimos 3 meses' }
    ];
  }

  /**
   * Generar plantilla de signos vitales en blanco
   */
  generarPlantillaVacia(): CreateSignosVitalesDto {
    return {
      id_expediente: 0,
      id_medico_registra: 0,
      fecha_toma: new Date().toISOString(),
      temperatura: undefined,
      presion_arterial_sistolica: undefined,
      presion_arterial_diastolica: undefined,
      frecuencia_cardiaca: undefined,
      frecuencia_respiratoria: undefined,
      saturacion_oxigeno: undefined,
      glucosa: undefined,
      peso: undefined,
      talla: undefined,
      observaciones: ''
    };
  }

  /**
   * Exportar signos vitales a CSV (simulado)
   */
  exportarCSV(signosVitales: SignosVitales[]): string {
    const headers = [
      'Fecha/Hora',
      'Temperatura (°C)',
      'Presión Sistólica (mmHg)',
      'Presión Diastólica (mmHg)',
      'Frecuencia Cardíaca (lpm)',
      'Frecuencia Respiratoria (rpm)',
      'Saturación O2 (%)',
      'Glucosa (mg/dl)',
      'Peso (kg)',
      'Talla (cm)',
      'IMC (kg/m²)',
      'Observaciones'
    ].join(',');

    const rows = signosVitales.map(signos => [
      this.formatearFecha(signos.fecha_toma),
      signos.temperatura || '',
      signos.presion_arterial_sistolica || '',
      signos.presion_arterial_diastolica || '',
      signos.frecuencia_cardiaca || '',
      signos.frecuencia_respiratoria || '',
      signos.saturacion_oxigeno || '',
      signos.glucosa || '',
      signos.peso || '',
      signos.talla || '',
      signos.imc || '',
      signos.observaciones || ''
    ].join(','));

    return [headers, ...rows].join('\n');
  }

  /**
   * Validar coherencia temporal de signos vitales
   */
  validarCoherenciaTemporal(nuevaFecha: string, ultimaFecha?: string): { valido: boolean; mensaje?: string } {
    if (!ultimaFecha) {
      return { valido: true };
    }

    const nueva = new Date(nuevaFecha);
    const ultima = new Date(ultimaFecha);
    const ahora = new Date();

    // No puede ser en el futuro
    if (nueva > ahora) {
      return {
        valido: false,
        mensaje: 'La fecha no puede ser en el futuro'
      };
    }

    // No puede ser más de 30 días en el pasado
    const treintaDiasAtras = new Date(ahora.getTime() - (30 * 24 * 60 * 60 * 1000));
    if (nueva < treintaDiasAtras) {
      return {
        valido: false,
        mensaje: 'La fecha no puede ser mayor a 30 días en el pasado'
      };
    }

    // No puede ser anterior al último registro si es muy reciente
    const diferenciaMinutos = (nueva.getTime() - ultima.getTime()) / (1000 * 60);
    if (diferenciaMinutos < -60) { // No más de 1 hora antes del último
      return {
        valido: false,
        mensaje: 'La fecha no puede ser anterior al último registro por más de 1 hora'
      };
    }

    return { valido: true };
  }
}
