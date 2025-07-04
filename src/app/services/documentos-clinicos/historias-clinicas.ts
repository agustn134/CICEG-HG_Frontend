// src/app/services/documentos-clinicos/historias-clinicas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  HistoriaClinica,
  HistoriaClinicaDetallada,
  HistoriaClinicaFilters,
  CreateHistoriaClinicaDto,
  UpdateHistoriaClinicaDto,
  HistoriaClinicaListResponse,
  EstadisticasHistoriasClinicas,
  ValidacionHistoriaClinica,
  SeccionHistoriaClinica,
  TemplateHistoriaClinica,
  SECCIONES_HISTORIA_CLINICA,
  TEMPLATES_HISTORIA_CLINICA,
  CAMPOS_OBLIGATORIOS_BASICOS,
  CAMPOS_APLICABLES_MUJERES,
  TipoPronostico,
  MetodoPlanificacion,
  NivelActividad,
  TipoVivienda
} from '../../models/historia-clinica.model';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class HistoriasClinicasService {
  private readonly API_URL = 'http://localhost:3000/api/documentos-clinicos/historias-clinicas';

  constructor(private http: HttpClient) { }

  // ==========================================
  // OPERACIONES CRUD BÁSICAS
  // ==========================================

  /**
   * Obtener todas las historias clínicas con filtros y paginación
   */
  getHistoriasClinicas(filters?: HistoriaClinicaFilters): Observable<ApiResponse<HistoriaClinicaListResponse>> {
    let params = new HttpParams();

    if (filters) {
      // Filtros del backend
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

      // Filtros base
      if (filters.search) {
        params = params.set('buscar', filters.search); // Mapear search a buscar
      }
      if (filters.sort_by) {
        params = params.set('sort_by', filters.sort_by);
      }
      if (filters.sort_order) {
        params = params.set('sort_order', filters.sort_order);
      }
    }

    return this.http.get<ApiResponse<HistoriaClinicaListResponse>>(`${this.API_URL}`, { params });
  }

  /**
   * Obtener historia clínica por ID (vista completa)
   */
  getHistoriaClinicaById(id: number): Observable<ApiResponse<HistoriaClinicaDetallada>> {
    return this.http.get<ApiResponse<HistoriaClinicaDetallada>>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtener historia clínica por documento
   */
  getHistoriaClinicaByDocumento(idDocumento: number): Observable<ApiResponse<HistoriaClinica>> {
    return this.http.get<ApiResponse<HistoriaClinica>>(`${this.API_URL}/documento/${idDocumento}`);
  }

  /**
   * Crear nueva historia clínica
   */
  createHistoriaClinica(data: CreateHistoriaClinicaDto): Observable<ApiResponse<HistoriaClinica>> {
    return this.http.post<ApiResponse<HistoriaClinica>>(`${this.API_URL}`, data);
  }

  /**
   * Actualizar historia clínica existente
   */
  updateHistoriaClinica(id: number, data: UpdateHistoriaClinicaDto): Observable<ApiResponse<HistoriaClinica>> {
    return this.http.put<ApiResponse<HistoriaClinica>>(`${this.API_URL}/${id}`, data);
  }

  /**
   * Eliminar (anular) historia clínica
   */
  deleteHistoriaClinica(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtener estadísticas de historias clínicas
   */
  getEstadisticasHistoriasClinicas(): Observable<ApiResponse<EstadisticasHistoriasClinicas>> {
    return this.http.get<ApiResponse<EstadisticasHistoriasClinicas>>(`${this.API_URL}/estadisticas`);
  }

  // ==========================================
  // MÉTODOS DE VALIDACIÓN Y UTILIDAD
  // ==========================================

  /**
   * Validar datos antes de crear historia clínica
   */
  validarDatosHistoriaClinica(data: CreateHistoriaClinicaDto, sexoPaciente?: string): ValidacionHistoriaClinica {
    const errores: string[] = [];
    const advertencias: string[] = [];
    const seccionesIncompletas: any[] = [];

    // Validaciones obligatorias
    if (!data.id_documento) {
      errores.push('El documento clínico es obligatorio');
    }

    // Validar campos obligatorios básicos
    const camposObligatoriosFaltantes = CAMPOS_OBLIGATORIOS_BASICOS.filter(campo => {
      if (campo === 'id_documento') return false; // Ya validado arriba
      return !data[campo as keyof CreateHistoriaClinicaDto];
    });

    if (camposObligatoriosFaltantes.length > 0) {
      errores.push(`Campos obligatorios faltantes: ${camposObligatoriosFaltantes.join(', ')}`);
    }

    // Validar secciones según género
    SECCIONES_HISTORIA_CLINICA.forEach(seccion => {
      // Verificar si la sección aplica para este género
      if (seccion.aplicable_genero && seccion.aplicable_genero !== 'ambos' && seccion.aplicable_genero !== sexoPaciente) {
        return; // Saltear secciones que no aplican
      }

      const camposFaltantes = seccion.campos.filter(campo => {
        const valor = data[campo as keyof CreateHistoriaClinicaDto];
        return seccion.obligatoria && (!valor || (typeof valor === 'string' && valor.trim() === ''));
      });

      if (camposFaltantes.length > 0) {
        seccionesIncompletas.push({
          seccion: seccion.nombre,
          campos_faltantes: camposFaltantes,
          importancia: seccion.obligatoria ? 'alta' : 'media'
        });
      }
    });

    // Validaciones específicas
    if (sexoPaciente === 'F') {
      // Advertencias para datos ginecobstétricos inconsistentes
      if (data.gestas && data.partos && data.cesareas) {
        if (data.gestas < (data.partos + data.cesareas)) {
          advertencias.push('El número de gestas es menor que la suma de partos y cesáreas');
        }
      }

      if (data.hijos_vivos && data.partos && data.hijos_vivos > data.partos) {
        advertencias.push('El número de hijos vivos es mayor que el número de partos');
      }
    }

    // Validar fechas
    if (data.fecha_ultima_regla) {
      const fecha = new Date(data.fecha_ultima_regla);
      const hoy = new Date();
      if (fecha > hoy) {
        errores.push('La fecha de última regla no puede ser futura');
      }
    }

    if (data.fecha_ultimo_parto) {
      const fecha = new Date(data.fecha_ultimo_parto);
      const hoy = new Date();
      if (fecha > hoy) {
        errores.push('La fecha de último parto no puede ser futura');
      }
    }

    return {
      valido: errores.length === 0,
      errores,
      advertencias,
      secciones_incompletas: seccionesIncompletas
    };
  }

  /**
   * Obtener template de historia clínica según servicio
   */
  getTemplatePorServicio(servicio: string): TemplateHistoriaClinica {
    const servicioLower = servicio.toLowerCase();

    if (servicioLower.includes('gineco') || servicioLower.includes('obstetr')) {
      return TEMPLATES_HISTORIA_CLINICA.find(t => t.id === 'ginecologia') || TEMPLATES_HISTORIA_CLINICA[0];
    }

    if (servicioLower.includes('pediatr') || servicioLower.includes('neonat')) {
      return TEMPLATES_HISTORIA_CLINICA.find(t => t.id === 'pediatria') || TEMPLATES_HISTORIA_CLINICA[0];
    }

    if (servicioLower.includes('urgenc') || servicioLower.includes('triage')) {
      return TEMPLATES_HISTORIA_CLINICA.find(t => t.id === 'urgencias') || TEMPLATES_HISTORIA_CLINICA[0];
    }

    return TEMPLATES_HISTORIA_CLINICA[0]; // Template general por defecto
  }

  /**
   * Generar plantilla vacía según template
   */
  generarPlantillaVacia(templateId: string = 'general'): CreateHistoriaClinicaDto {
    const template = TEMPLATES_HISTORIA_CLINICA.find(t => t.id === templateId) || TEMPLATES_HISTORIA_CLINICA[0];

    const plantilla: CreateHistoriaClinicaDto = {
      id_documento: 0
    };

    // Inicializar campos según el template
    template.secciones_incluidas.forEach(seccionId => {
      const seccion = SECCIONES_HISTORIA_CLINICA.find(s => s.id === seccionId);
      if (seccion) {
        seccion.campos.forEach(campo => {
          if (campo in plantilla) {
            (plantilla as any)[campo] = '';
          }
        });
      }
    });

    return plantilla;
  }

  /**
   * Calcular porcentaje de completitud de la historia clínica
   */
  calcularCompletitud(historiaClinica: HistoriaClinica, sexoPaciente?: string): {
    porcentaje: number;
    secciones_completadas: number;
    secciones_totales: number;
    secciones_detalle: {
      seccion: string;
      completada: boolean;
      campos_completados: number;
      campos_totales: number;
    }[];
  } {
    const seccionesAplicables = SECCIONES_HISTORIA_CLINICA.filter(seccion => {
      if (seccion.aplicable_genero && seccion.aplicable_genero !== 'ambos') {
        return seccion.aplicable_genero === sexoPaciente;
      }
      return true;
    });

    let seccionesCompletadas = 0;
    const seccionesDetalle: any[] = [];

    seccionesAplicables.forEach(seccion => {
      let camposCompletados = 0;

      seccion.campos.forEach(campo => {
        const valor = (historiaClinica as any)[campo];
        if (valor && valor.toString().trim() !== '') {
          camposCompletados++;
        }
      });

      const completada = camposCompletados > 0 && (seccion.obligatoria ? camposCompletados >= Math.ceil(seccion.campos.length * 0.6) : camposCompletados > 0);

      if (completada) {
        seccionesCompletadas++;
      }

      seccionesDetalle.push({
        seccion: seccion.nombre,
        completada,
        campos_completados: camposCompletados,
        campos_totales: seccion.campos.length
      });
    });

    return {
      porcentaje: Math.round((seccionesCompletadas / seccionesAplicables.length) * 100),
      secciones_completadas: seccionesCompletadas,
      secciones_totales: seccionesAplicables.length,
      secciones_detalle: seccionesDetalle
    };
  }

  /**
   * Verificar si un campo aplica para el género del paciente
   */
  campoAplicaPorGenero(campo: string, sexoPaciente?: string): boolean {
    if (!sexoPaciente || sexoPaciente === 'O') {
      return true; // Aplicar todos los campos si no se conoce el género
    }

    if (CAMPOS_APLICABLES_MUJERES.includes(campo)) {
      return sexoPaciente === 'F';
    }

    return true; // Todos los demás campos aplican para cualquier género
  }

  // ==========================================
  // MÉTODOS PARA OPCIONES Y SELECTS
  // ==========================================

  /**
   * Obtener opciones para pronóstico
   */
  getOpcionesPronostico(): { value: TipoPronostico; label: string }[] {
    return [
      { value: 'Excelente', label: 'Excelente' },
      { value: 'Bueno', label: 'Bueno' },
      { value: 'Regular', label: 'Regular' },
      { value: 'Malo', label: 'Malo' },
      { value: 'Grave', label: 'Grave' },
      { value: 'Reservado', label: 'Reservado' }
    ];
  }

  /**
   * Obtener opciones para métodos de planificación familiar
   */
  getOpcionesMetodosPlanificacion(): { value: MetodoPlanificacion; label: string }[] {
    return [
      { value: 'Ninguno', label: 'Ninguno' },
      { value: 'Preservativo', label: 'Preservativo' },
      { value: 'Anticonceptivos orales', label: 'Anticonceptivos orales' },
      { value: 'DIU', label: 'Dispositivo intrauterino (DIU)' },
      { value: 'Implante subdérmico', label: 'Implante subdérmico' },
      { value: 'Inyección mensual', label: 'Inyección mensual' },
      { value: 'Inyección trimestral', label: 'Inyección trimestral' },
      { value: 'Parche anticonceptivo', label: 'Parche anticonceptivo' },
      { value: 'Anillo vaginal', label: 'Anillo vaginal' },
      { value: 'Vasectomía', label: 'Vasectomía' },
      { value: 'Salpingoclasia', label: 'Salpingoclasia' },
      { value: 'Otro', label: 'Otro' }
    ];
  }

  /**
   * Obtener opciones para nivel de actividad física
   */
  getOpcionesNivelActividad(): { value: NivelActividad; label: string }[] {
    return [
      { value: 'Sedentario', label: 'Sedentario' },
      { value: 'Ligero', label: 'Actividad ligera' },
      { value: 'Moderado', label: 'Actividad moderada' },
      { value: 'Intenso', label: 'Actividad intensa' },
      { value: 'Muy intenso', label: 'Actividad muy intensa' }
    ];
  }

  /**
   * Obtener opciones para tipo de vivienda
   */
  getOpcionesTipoVivienda(): { value: TipoVivienda; label: string }[] {
    return [
      { value: 'Casa propia', label: 'Casa propia' },
      { value: 'Casa rentada', label: 'Casa rentada' },
      { value: 'Departamento', label: 'Departamento' },
      { value: 'Cuarto', label: 'Cuarto' },
      { value: 'Otro', label: 'Otro' }
    ];
  }

  /**
   * Obtener todas las secciones disponibles
   */
  getSecciones(): SeccionHistoriaClinica[] {
    return SECCIONES_HISTORIA_CLINICA;
  }

  /**
   * Obtener todos los templates disponibles
   */
  getTemplates(): TemplateHistoriaClinica[] {
    return TEMPLATES_HISTORIA_CLINICA;
  }

  // ==========================================
  // MÉTODOS DE FORMATEO Y UTILIDAD
  // ==========================================

  /**
   * Formatear fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatear fecha y hora para mostrar
   */
  formatearFechaHora(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtener edad a partir de fecha de nacimiento
   */
  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  /**
   * Formatear nombre completo del paciente
   */
  formatearNombreCompleto(historiaClinica: HistoriaClinica): string {
    return historiaClinica.paciente_nombre || 'Paciente sin nombre';
  }

  /**
   * Obtener icono para el estado del documento
   */
  getIconoEstado(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'fas fa-check-circle text-success';
      case 'borrador':
        return 'fas fa-edit text-warning';
      case 'cancelado':
        return 'fas fa-times-circle text-danger';
      case 'anulado':
        return 'fas fa-ban text-danger';
      default:
        return 'fas fa-file-medical text-secondary';
    }
  }

  /**
   * Obtener color para el porcentaje de completitud
   */
  getColorCompletitud(porcentaje: number): string {
    if (porcentaje >= 90) return 'success';
    if (porcentaje >= 70) return 'info';
    if (porcentaje >= 50) return 'warning';
    return 'danger';
  }

  /**
   * Generar resumen de la historia clínica para mostrar en listados
   */
  generarResumen(historiaClinica: HistoriaClinica): string {
    const partes: string[] = [];

    if (historiaClinica.padecimiento_actual) {
      partes.push(`Motivo: ${historiaClinica.padecimiento_actual.substring(0, 100)}${historiaClinica.padecimiento_actual.length > 100 ? '...' : ''}`);
    }

    if (historiaClinica.impresion_diagnostica) {
      partes.push(`Dx: ${historiaClinica.impresion_diagnostica.substring(0, 80)}${historiaClinica.impresion_diagnostica.length > 80 ? '...' : ''}`);
    }

    return partes.join(' | ') || 'Sin resumen disponible';
  }

  /**
   * Validar coherencia de datos ginecobstétricos
   */
  validarDatosGinecobstetricos(data: Partial<CreateHistoriaClinicaDto>): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    // Validar gestas vs partos + cesáreas
    if (data.gestas !== undefined && data.partos !== undefined && data.cesareas !== undefined) {
      if (data.gestas < (data.partos + data.cesareas)) {
        errores.push('El número de gestas debe ser mayor o igual a la suma de partos y cesáreas');
      }
    }

    // Validar hijos vivos vs partos
    if (data.hijos_vivos !== undefined && data.partos !== undefined) {
      if (data.hijos_vivos > data.partos) {
        errores.push('El número de hijos vivos no puede ser mayor que el número de partos');
      }
    }

    // Validar abortos
    if (data.gestas !== undefined && data.partos !== undefined && data.cesareas !== undefined && data.abortos !== undefined) {
      if (data.gestas !== (data.partos + data.cesareas + data.abortos)) {
        errores.push('La suma de partos, cesáreas y abortos debe ser igual al número de gestas');
      }
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Exportar historia clínica a texto plano para impresión
   */
  exportarTextoPlano(historiaClinica: HistoriaClinica): string {
    const lineas: string[] = [];

    lineas.push('HISTORIA CLÍNICA');
    lineas.push('================');
    lineas.push('');

    // Datos del paciente
    lineas.push('DATOS DEL PACIENTE:');
    lineas.push(`Nombre: ${historiaClinica.paciente_nombre || 'No especificado'}`);
    lineas.push(`Expediente: ${historiaClinica.numero_expediente || 'No especificado'}`);
    lineas.push(`Fecha: ${historiaClinica.fecha_elaboracion ? this.formatearFechaHora(historiaClinica.fecha_elaboracion) : 'No especificada'}`);
    lineas.push(`Médico: ${historiaClinica.medico_creador || 'No especificado'}`);
    lineas.push('');

    // Antecedentes heredofamiliares
    if (historiaClinica.antecedentes_heredo_familiares) {
      lineas.push('ANTECEDENTES HEREDOFAMILIARES:');
      lineas.push(historiaClinica.antecedentes_heredo_familiares);
      lineas.push('');
    }

    // Padecimiento actual
    if (historiaClinica.padecimiento_actual) {
      lineas.push('PADECIMIENTO ACTUAL:');
      lineas.push(historiaClinica.padecimiento_actual);
      lineas.push('');
    }

    // Exploración física
    if (historiaClinica.exploracion_general) {
      lineas.push('EXPLORACIÓN FÍSICA:');
      lineas.push(historiaClinica.exploracion_general);
      lineas.push('');
    }

    // Impresión diagnóstica
    if (historiaClinica.impresion_diagnostica) {
      lineas.push('IMPRESIÓN DIAGNÓSTICA:');
      lineas.push(historiaClinica.impresion_diagnostica);
      lineas.push('');
    }

    // Plan
    if (historiaClinica.plan_terapeutico) {
      lineas.push('PLAN TERAPÉUTICO:');
      lineas.push(historiaClinica.plan_terapeutico);
      lineas.push('');
    }

    return lineas.join('\n');
  }

  /**
   * Buscar historias clínicas por criterios múltiples
   */
  buscarAvanzada(criterios: {
    texto?: string;
    diagnostico?: string;
    medico?: string;
    fechaInicio?: string;
    fechaFin?: string;
    conAlergias?: boolean;
  }): Observable<ApiResponse<HistoriaClinicaListResponse>> {
    const filtros: HistoriaClinicaFilters = {};

    if (criterios.texto) {
      filtros.buscar = criterios.texto;
    }

    if (criterios.fechaInicio) {
      filtros.fecha_inicio = criterios.fechaInicio;
    }

    if (criterios.fechaFin) {
      filtros.fecha_fin = criterios.fechaFin;
    }

    if (criterios.conAlergias) {
      filtros.con_alergias = true;
    }

    return this.getHistoriasClinicas(filtros);
  }

  /**
   * Verificar si se puede editar la historia clínica
   */
  puedeEditar(historiaClinica: HistoriaClinica): { puede: boolean; razon?: string } {
    if (historiaClinica.estado_documento === 'Anulado') {
      return {
        puede: false,
        razon: 'No se puede editar una historia clínica anulada'
      };
    }

    if (historiaClinica.estado_documento === 'Cancelado') {
      return {
        puede: false,
        razon: 'No se puede editar una historia clínica cancelada'
      };
    }

    // Verificar si ha pasado más de 24 horas (opcional)
    if (historiaClinica.fecha_elaboracion) {
      const fecha = new Date(historiaClinica.fecha_elaboracion);
      const ahora = new Date();
      const horasTranscurridas = (ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60);

      if (horasTranscurridas > 72) { // 72 horas = 3 días
        return {
          puede: false,
          razon: 'No se puede editar una historia clínica después de 72 horas de su creación'
        };
      }
    }

    return { puede: true };
  }

  /**
   * Obtener estadísticas de uso de templates
   */
  getEstadisticasTemplates(): { [templateId: string]: number } {
    // Esta implementación sería mejorada con datos reales del backend
    return {
      'general': 45,
      'ginecologia': 25,
      'pediatria': 20,
      'urgencias': 10
    };
  }
}
