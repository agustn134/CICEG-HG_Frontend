// src/app/models/nota-egreso.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// ==========================================
// INTERFACE NOTA EGRESO (SEGÚN TU BD REAL)
// ==========================================
export interface NotaEgreso extends BaseEntity, AuditInfo {
  id_nota_egreso: number;
  id_documento: number;

  // Campos según tu tabla PostgreSQL real
  diagnostico_ingreso?: string;
  resumen_evolucion?: string;
  manejo_hospitalario?: string;
  diagnostico_egreso?: string;
  id_guia_diagnostico?: number;
  procedimientos_realizados?: string;
  fecha_procedimientos?: string;
  motivo_egreso?: string; // Mejoría, Máximo beneficio, Voluntario, Defunción
  problemas_pendientes?: string;
  plan_tratamiento?: string;
  recomendaciones_vigilancia?: string;
  atencion_factores_riesgo?: string;
  pronostico?: string;
  reingreso_por_misma_afeccion?: boolean;

  // Campos calculados que vienen del backend
  fecha_documento?: string;
  nombre_paciente?: string;
  numero_expediente?: string;
  nombre_medico?: string;
  numero_cedula?: string;
  nombre_guia_diagnostico?: string;
  nombre_servicio?: string;
  edad_anos?: number;
  observaciones_documento?: string;
  fecha_nacimiento?: string;
  sexo?: string;
}

// ==========================================
// ENUM PARA MOTIVOS DE EGRESO
// ==========================================
export enum MotivoEgresoEnum {
  MEJORIA = 'Mejoría',
  MAXIMO_BENEFICIO = 'Máximo beneficio',
  VOLUNTARIO = 'Voluntario',
  DEFUNCION = 'Defunción',
  REFERENCIA = 'Referencia',
  FUGA = 'Fuga'
}

// ==========================================
// FILTROS PARA BÚSQUEDAS
// ==========================================
export interface NotaEgresoFilters extends BaseFilters {
  page?: number;
  limit?: number;
  motivo_egreso?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  buscar?: string;
}

// ==========================================
// DTOS PARA CREACIÓN
// ==========================================
export interface CreateNotaEgresoDto {
  id_documento: number;
  diagnostico_ingreso?: string;
  resumen_evolucion?: string;
  manejo_hospitalario?: string;
  diagnostico_egreso?: string;
  id_guia_diagnostico?: number;
  procedimientos_realizados?: string;
  fecha_procedimientos?: string;
  motivo_egreso?: string;
  problemas_pendientes?: string;
  plan_tratamiento?: string;
  recomendaciones_vigilancia?: string;
  atencion_factores_riesgo?: string;
  pronostico?: string;
  reingreso_por_misma_afeccion?: boolean;
}

// ==========================================
// DTOS PARA ACTUALIZACIÓN
// ==========================================
export interface UpdateNotaEgresoDto extends Partial<CreateNotaEgresoDto> {
  // Se actualiza por ID en la URL
}

// ==========================================
// INTERFACES PARA RESPUESTAS DE LISTADO
// ==========================================
export interface NotaEgresoListResponse {
  data: NotaEgreso[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==========================================
// VALIDACIONES
// ==========================================
export interface ValidacionNotaEgreso {
  valido: boolean;
  errores: string[];
  advertencias: string[];
  campos_faltantes: string[];
}

// ==========================================
// ESTADÍSTICAS
// ==========================================
export interface EstadisticasNotaEgreso {
  motivos_egreso: {
    motivo_egreso: string;
    cantidad: number;
    porcentaje: number;
  }[];
  egresos_por_mes: {
    mes: string;
    cantidad_egresos: number;
  }[];
  reingresos: {
    total_reingresos: number;
    porcentaje_reingresos: number;
  };
}

// ==========================================
// CONSTANTES ÚTILES
// ==========================================
export const CAMPOS_OBLIGATORIOS_EGRESO = [
  'id_documento',
  'diagnostico_egreso',
  'motivo_egreso',
  'plan_tratamiento'
];

export const MOTIVOS_EGRESO_OPCIONES = [
  { value: 'Mejoría', label: 'Mejoría' },
  { value: 'Máximo beneficio', label: 'Máximo beneficio' },
  { value: 'Voluntario', label: 'Voluntario' },
  { value: 'Defunción', label: 'Defunción' },
  { value: 'Referencia', label: 'Referencia' },
  { value: 'Fuga', label: 'Fuga' }
];

// ==========================================
// PLANTILLAS PARA NOTAS DE EGRESO
// ==========================================
export interface PlantillaNotaEgreso {
  id: string;
  nombre: string;
  descripcion: string;
  campos: Partial<CreateNotaEgresoDto>;
}

export const PLANTILLAS_NOTA_EGRESO: PlantillaNotaEgreso[] = [
  {
    id: 'mejoria',
    nombre: 'Egreso por Mejoría',
    descripcion: 'Template para egreso por mejoría clínica',
    campos: {
      motivo_egreso: 'Mejoría',
      diagnostico_egreso: 'Paciente con mejoría clínica...',
      plan_tratamiento: 'Continuar tratamiento ambulatorio',
      recomendaciones_vigilancia: 'Control médico en una semana',
      pronostico: 'Favorable',
      reingreso_por_misma_afeccion: false
    }
  },
  {
    id: 'maximo_beneficio',
    nombre: 'Egreso por Máximo Beneficio',
    descripcion: 'Template para egreso por máximo beneficio hospitalario',
    campos: {
      motivo_egreso: 'Máximo beneficio',
      diagnostico_egreso: 'Paciente alcanzó el máximo beneficio hospitalario...',
      plan_tratamiento: 'Manejo ambulatorio',
      recomendaciones_vigilancia: 'Seguimiento por consulta externa',
      pronostico: 'Reservado a evolución',
      reingreso_por_misma_afeccion: false
    }
  },
  {
    id: 'voluntario',
    nombre: 'Egreso Voluntario',
    descripcion: 'Template para egreso voluntario del paciente',
    campos: {
      motivo_egreso: 'Voluntario',
      diagnostico_egreso: 'Paciente solicita egreso voluntario...',
      plan_tratamiento: 'Se otorgan recomendaciones',
      recomendaciones_vigilancia: 'Acudir a urgencias si presenta datos de alarma',
      pronostico: 'Reservado',
      reingreso_por_misma_afeccion: true
    }
  }
];

// ==========================================
// MÉTODOS DE UTILIDAD
// ==========================================
export class NotaEgresoUtils {

  static validarCamposObligatorios(nota: CreateNotaEgresoDto): ValidacionNotaEgreso {
    const errores: string[] = [];
    const advertencias: string[] = [];
    const camposFaltantes: string[] = [];

    // Validar campos obligatorios
    if (!nota.id_documento) {
      errores.push('El ID del documento es obligatorio');
      camposFaltantes.push('id_documento');
    }

    if (!nota.diagnostico_egreso?.trim()) {
      errores.push('El diagnóstico de egreso es obligatorio');
      camposFaltantes.push('diagnostico_egreso');
    }

    if (!nota.motivo_egreso?.trim()) {
      errores.push('El motivo de egreso es obligatorio');
      camposFaltantes.push('motivo_egreso');
    }

    if (!nota.plan_tratamiento?.trim()) {
      errores.push('El plan de tratamiento es obligatorio');
      camposFaltantes.push('plan_tratamiento');
    }

    // Advertencias
    if (!nota.recomendaciones_vigilancia?.trim()) {
      advertencias.push('Se recomienda incluir recomendaciones de vigilancia');
    }

    if (!nota.pronostico?.trim()) {
      advertencias.push('Se recomienda especificar el pronóstico');
    }

    return {
      valido: errores.length === 0,
      errores,
      advertencias,
      campos_faltantes: camposFaltantes
    };
  }

  static generarPlantillaVacia(): CreateNotaEgresoDto {
    return {
      id_documento: 0,
      diagnostico_ingreso: '',
      resumen_evolucion: '',
      manejo_hospitalario: '',
      diagnostico_egreso: '',
      motivo_egreso: '',
      plan_tratamiento: '',
      recomendaciones_vigilancia: '',
      pronostico: '',
      reingreso_por_misma_afeccion: false
    };
  }

  static aplicarPlantilla(plantillaId: string): Partial<CreateNotaEgresoDto> {
    const plantilla = PLANTILLAS_NOTA_EGRESO.find(p => p.id === plantillaId);
    return plantilla?.campos || {};
  }

  static formatearFecha(fecha: string): string {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static obtenerColorMotivo(motivo: string): string {
    switch (motivo) {
      case 'Mejoría':
      case 'Máximo beneficio':
        return 'success';
      case 'Voluntario':
        return 'warning';
      case 'Defunción':
        return 'danger';
      case 'Referencia':
        return 'info';
      case 'Fuga':
        return 'secondary';
      default:
        return 'primary';
    }
  }

  static generarResumen(nota: NotaEgreso): string {
    const partes: string[] = [];

    if (nota.motivo_egreso) {
      partes.push(`Motivo: ${nota.motivo_egreso}`);
    }

    if (nota.diagnostico_egreso) {
      const diagnostico = nota.diagnostico_egreso.substring(0, 50);
      partes.push(`Dx: ${diagnostico}${nota.diagnostico_egreso.length > 50 ? '...' : ''}`);
    }

    return partes.join(' | ') || 'Nota sin información';
  }

  static exportarTextoPlano(nota: NotaEgreso): string {
    const lineas: string[] = [];

    lineas.push('NOTA DE EGRESO HOSPITALARIO');
    lineas.push('Hospital General San Luis de la Paz');
    lineas.push('========================================');
    lineas.push('');

    // Datos del paciente
    lineas.push('DATOS DEL PACIENTE:');
    lineas.push(`Nombre: ${nota.nombre_paciente || 'No especificado'}`);
    lineas.push(`Expediente: ${nota.numero_expediente || 'No especificado'}`);
    lineas.push(`Fecha: ${nota.fecha_documento ? this.formatearFecha(nota.fecha_documento) : 'No especificada'}`);
    lineas.push(`Médico: ${nota.nombre_medico || 'No especificado'}`);
    lineas.push('');

    // Contenido de la nota
    if (nota.diagnostico_ingreso) {
      lineas.push('DIAGNÓSTICO DE INGRESO:');
      lineas.push(nota.diagnostico_ingreso);
      lineas.push('');
    }

    if (nota.resumen_evolucion) {
      lineas.push('RESUMEN DE EVOLUCIÓN:');
      lineas.push(nota.resumen_evolucion);
      lineas.push('');
    }

    if (nota.manejo_hospitalario) {
      lineas.push('MANEJO HOSPITALARIO:');
      lineas.push(nota.manejo_hospitalario);
      lineas.push('');
    }

    if (nota.diagnostico_egreso) {
      lineas.push('DIAGNÓSTICO DE EGRESO:');
      lineas.push(nota.diagnostico_egreso);
      lineas.push('');
    }

    if (nota.procedimientos_realizados) {
      lineas.push('PROCEDIMIENTOS REALIZADOS:');
      lineas.push(nota.procedimientos_realizados);
      if (nota.fecha_procedimientos) {
        lineas.push(`Fecha: ${nota.fecha_procedimientos}`);
      }
      lineas.push('');
    }

    lineas.push('MOTIVO DE EGRESO:');
    lineas.push(nota.motivo_egreso || 'No especificado');
    lineas.push('');

    if (nota.problemas_pendientes) {
      lineas.push('PROBLEMAS PENDIENTES:');
      lineas.push(nota.problemas_pendientes);
      lineas.push('');
    }

    if (nota.plan_tratamiento) {
      lineas.push('PLAN DE TRATAMIENTO:');
      lineas.push(nota.plan_tratamiento);
      lineas.push('');
    }

    if (nota.recomendaciones_vigilancia) {
      lineas.push('RECOMENDACIONES DE VIGILANCIA:');
      lineas.push(nota.recomendaciones_vigilancia);
      lineas.push('');
    }

    if (nota.atencion_factores_riesgo) {
      lineas.push('ATENCIÓN A FACTORES DE RIESGO:');
      lineas.push(nota.atencion_factores_riesgo);
      lineas.push('');
    }

    if (nota.pronostico) {
      lineas.push('PRONÓSTICO:');
      lineas.push(nota.pronostico);
      lineas.push('');
    }

    if (nota.reingreso_por_misma_afeccion !== undefined) {
      lineas.push('REINGRESO POR MISMA AFECCIÓN:');
      lineas.push(nota.reingreso_por_misma_afeccion ? 'Sí' : 'No');
    }

    return lineas.join('\n');
  }
}
