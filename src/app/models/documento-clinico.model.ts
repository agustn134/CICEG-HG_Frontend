// src/app/models/documento-clinico.model.ts
import { BaseEntity, AuditInfo, BaseFilters, EstadoDocumento } from './base.models';

// ==========================================
// INTERFACE PRINCIPAL DOCUMENTO CLÍNICO
// ==========================================
export interface DocumentoClinico extends BaseEntity, AuditInfo {
  id_documento: number;
  id_expediente: number;
  id_internamiento?: number;
  id_tipo_documento: number;
  fecha_elaboracion: string;
  id_personal_creador?: number;
  estado: EstadoDocumento;
  observaciones?: string;

  // Campos adicionales para funcionalidad completa
  contenido?: string;
  archivo_url?: string;
  es_digital: boolean;
  requiere_firma?: boolean;
  firmado_por?: number;
  fecha_firma?: string;
  codigo_autorizacion?: string;

  // Información adicional del tipo de documento
  nombre_tipo_documento?: string;
  categoria_documento?: 'Ingreso' | 'Evolución' | 'Egreso' | 'Procedimiento' | 'Consulta';

  // Información del paciente
  nombre_paciente?: string;
  numero_expediente?: string;
  edad_paciente?: number;
  genero_paciente?: string;

  // Información del médico
  medico_responsable?: {
    id_personal: number;
    nombre_completo: string;
    cedula?: string;
    especialidad?: string;
    firma_digital?: string;
  };

  // Información del internamiento
  servicio?: string;
  cama?: string;
  fecha_ingreso_internamiento?: string;

  // Metadatos del documento
  version?: number;
  documento_padre_id?: number;
  plantilla_utilizada?: string;
  palabras_clave?: string[];

  // Campos de auditoría específicos del documento
  fecha_ultimo_acceso?: string;
  total_accesos?: number;
  ip_creacion?: string;
  dispositivo_creacion?: string;
}

// ==========================================
// INTERFACE PARA DOCUMENTOS CON CONTENIDO ESTRUCTURADO
// ==========================================
export interface DocumentoClinicoEstructurado extends DocumentoClinico {
  seccion_subjetivo?: string;
  seccion_objetivo?: string;
  seccion_evaluacion?: string;
  seccion_plan?: string;
  signos_vitales?: {
    presion_arterial?: string;
    frecuencia_cardiaca?: number;
    frecuencia_respiratoria?: number;
    temperatura?: number;
    saturacion_oxigeno?: number;
    peso?: number;
    talla?: number;
  };
}

// ==========================================
// FILTROS PARA BÚSQUEDAS AVANZADAS - CORREGIDO
// ==========================================
export interface DocumentoClinicoFilters extends BaseFilters {
  buscar?: string; // CAMBIO: Hecho opcional
  id_expediente?: number;
  id_internamiento?: number;
  id_tipo_documento?: number;
  categoria_documento?: string;
  estado?: EstadoDocumento;
  fecha_inicio?: string;
  fecha_fin?: string;
  id_personal_creador?: number;
  servicio?: string;
  es_digital?: boolean;
  requiere_firma?: boolean;
  firmado?: boolean;
  palabra_clave?: string;
  contenido_texto?: string;

  // Filtros específicos del paciente
  numero_expediente?: string;
  nombre_paciente?: string;
  edad_minima?: number;
  edad_maxima?: number;
  genero_paciente?: string;

  // Filtros de auditoría
  accedido_en_rango?: boolean;
  version_documento?: number;
  tiene_versiones?: boolean;
}

// ==========================================
// DTOS PARA CREACIÓN
// ==========================================
export interface CreateDocumentoClinicoDto {
  id_expediente: number;
  id_internamiento?: number;
  id_tipo_documento: number;
  fecha_elaboracion?: string;
  id_personal_creador?: number;
  estado?: EstadoDocumento;
  observaciones?: string;
  contenido?: string;
  es_digital?: boolean;
  requiere_firma?: boolean;
  plantilla_utilizada?: string;
  palabras_clave?: string[];

  // Para documentos estructurados
  seccion_subjetivo?: string;
  seccion_objetivo?: string;
  seccion_evaluacion?: string;
  seccion_plan?: string;
  signos_vitales?: any;
}

// ==========================================
// DTOS PARA ACTUALIZACIÓN - CORREGIDO
// ==========================================
export interface UpdateDocumentoClinicoDto extends Partial<CreateDocumentoClinicoDto> {
  id_documento?: number; // CAMBIO: Hecho opcional para mayor flexibilidad
  motivo_actualizacion?: string;
  mantener_version_anterior?: boolean;
}

// ==========================================
// DTO ESPECÍFICO PARA ACTUALIZAR ESTADO - NUEVO
// ==========================================
export interface UpdateEstadoDocumentoDto {
  id_documento: number;
  estado: EstadoDocumento;
  observaciones?: string;
  motivo_cambio?: string;
}

// ==========================================
// DTO PARA FIRMAR DOCUMENTO
// ==========================================
export interface FirmarDocumentoDto {
  id_documento: number;
  id_personal_firmante: number;
  codigo_autorizacion?: string;
  observaciones_firma?: string;
  metodo_firma: 'Digital' | 'Biométrica' | 'PIN' | 'Certificado';
}

// ==========================================
// RESPUESTAS ESPECÍFICAS
// ==========================================
export interface DocumentoClinicoCompleto extends DocumentoClinico {
  tipo_documento: {
    nombre: string;
    categoria: string;
    requiere_firma_medico: boolean;
    requiere_firma_paciente: boolean;
  };
  expediente: {
    numero_expediente: string;
    paciente: {
      nombre_completo: string;
      fecha_nacimiento: string;
      genero: string;
      numero_telefono?: string;
    };
  };
  internamiento?: {
    fecha_ingreso: string;
    servicio: string;
    cama: string;
    medico_tratante: string;
  };
  personal_creador?: {
    nombre_completo: string;
    especialidad?: string;
    cedula?: string;
  };
  versiones_anteriores?: DocumentoClinico[];
  documentos_relacionados?: DocumentoClinico[];
}

// ==========================================
// ESTADÍSTICAS DE DOCUMENTOS
// ==========================================
export interface EstadisticasDocumentosClinicosStats {
  total_documentos: number;
  documentos_por_estado: Record<EstadoDocumento, number>;
  documentos_por_tipo: Record<string, number>;
  documentos_digitales: number;
  documentos_escaneados: number;
  documentos_pendientes_firma: number;
  documentos_mes_actual: number;
  tiempo_promedio_elaboracion: number;
  servicios_mas_activos: Array<{
    servicio: string;
    total_documentos: number;
  }>;
  medicos_mas_productivos: Array<{
    nombre: string;
    total_documentos: number;
  }>;
}

// ==========================================
// INTERFACE PARA BÚSQUEDA AVANZADA
// ==========================================
export interface BusquedaAvanzadaDocumentos {
  texto_libre?: string;
  filtros: DocumentoClinicoFilters;
  ordenamiento: {
    campo: keyof DocumentoClinico;
    direccion: 'ASC' | 'DESC';
  };
  incluir_contenido?: boolean;
  incluir_expediente?: boolean;
  incluir_personal?: boolean;
  incluir_versiones?: boolean;
}

// ==========================================
// TIPOS PARA EXPORTACIÓN
// ==========================================
export interface ExportarDocumentosOptions {
  ids_documentos?: number[];
  filtros?: DocumentoClinicoFilters;
  formato: 'PDF' | 'Word' | 'Excel' | 'CSV';
  incluir_firmas?: boolean;
  incluir_imagenes?: boolean;
  plantilla_exportacion?: string;
  marca_agua?: string;
}

// ==========================================
// AUDIT TRAIL ESPECÍFICO
// ==========================================
export interface DocumentoClinicoAuditLog {
  id_log: number;
  id_documento: number;
  accion: 'Creado' | 'Modificado' | 'Firmado' | 'Cancelado' | 'Consultado' | 'Exportado' | 'Eliminado';
  id_usuario: number;
  fecha_accion: string;
  detalles?: string;
  ip_address?: string;
  user_agent?: string;
  datos_anteriores?: any;
  datos_nuevos?: any;
}

// ==========================================
// CONSTANTES ÚTILES
// ==========================================
export const TIPOS_CONTENIDO_DOCUMENTO = {
  TEXTO_PLANO: 'text/plain',
  HTML: 'text/html',
  MARKDOWN: 'text/markdown',
  PDF: 'application/pdf',
  WORD: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
} as const;

export const CATEGORIAS_DOCUMENTO = [
  'Ingreso',
  'Evolución',
  'Egreso',
  'Procedimiento',
  'Consulta'
] as const;

export const METODOS_FIRMA = [
  'Digital',
  'Biométrica',
  'PIN',
  'Certificado'
] as const;

// ==========================================
// HELPERS Y VALIDACIONES
// ==========================================
export const DocumentoClinicoHelpers = {
  /**
   * Valida si un documento puede ser editado
   */
  puedeEditarse(documento: DocumentoClinico): boolean {
    return documento.estado === EstadoDocumento.BORRADOR ||
           documento.estado === EstadoDocumento.ACTIVO;
  },

  /**
   * Valida si un documento puede ser firmado
   */
  puedeFirmarse(documento: DocumentoClinico): boolean {
    return !!documento.requiere_firma &&
           !documento.fecha_firma &&
           documento.estado === EstadoDocumento.ACTIVO;
  },

  /**
   * Genera palabras clave automáticas basadas en el contenido
   */
  generarPalabrasClave(contenido: string, tipoDocumento: string): string[] {
    const palabrasComunes = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo'];
    const palabras = contenido
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter(palabra => palabra.length > 3 && !palabrasComunes.includes(palabra));

    const frecuencia = palabras.reduce((acc, palabra) => {
      acc[palabra] = (acc[palabra] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(frecuencia)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([palabra]) => palabra)
      .concat([tipoDocumento.toLowerCase()]);
  },

  /**
   * Calcula el tiempo transcurrido desde la elaboración
   */
  tiempoTranscurrido(fechaElaboracion: string): string {
    const fecha = new Date(fechaElaboracion);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (dias > 0) return `${dias} día${dias > 1 ? 's' : ''}`;
    if (horas > 0) return `${horas} hora${horas > 1 ? 's' : ''}`;
    return 'Reciente';
  },

  /**
   * Crea filtros vacíos para búsquedas
   */
  createEmptyFilters(): DocumentoClinicoFilters {
    return {
      buscar: '',
      page: 1,
      limit: 10,
      sort_by: 'fecha_elaboracion',
      sort_order: 'DESC'
    };
  },

  /**
   * Crea DTO para actualización de estado
   */
  createUpdateEstadoDto(idDocumento: number, estado: EstadoDocumento, observaciones?: string): UpdateEstadoDocumentoDto {
    return {
      id_documento: idDocumento,
      estado,
      observaciones
    };
  }
};
