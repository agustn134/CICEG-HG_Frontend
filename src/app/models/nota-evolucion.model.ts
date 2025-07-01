// src/app/models/nota-evolucion.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// ==========================================
// INTERFACE NOTA EVOLUCIÓN (SEGÚN TU BD REAL - FORMATO SOAP)
// ==========================================
export interface NotaEvolucion extends BaseEntity, AuditInfo {
  id_nota_evolucion: number;
  id_documento: number;

  // Campos SOAP (coinciden exactamente con tu tabla PostgreSQL)
  subjetivo?: string; // Lo que reporta el paciente (S)
  objetivo?: string;  // Hallazgos de la exploración física (O)
  analisis?: string;  // Interpretación médica (A)
  plan?: string;      // Plan de tratamiento (P)

  // Campos calculados que vienen del backend
  id_expediente?: number;
  fecha_documento?: string;
  estado_documento?: string;
  numero_expediente?: string;
  paciente_nombre?: string;
  fecha_nacimiento?: string;
  sexo?: string;
  medico_nombre?: string;
  especialidad?: string;
  servicio_nombre?: string;
  dias_hospitalizacion?: number;
}

// ==========================================
// FILTROS PARA BÚSQUEDAS
// ==========================================
export interface NotaEvolucionFilters extends BaseFilters {
  page?: number;
  limit?: number;
  id_documento?: number;
  id_expediente?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  buscar?: string;
  medico_nombre?: string;
}

// ==========================================
// DTOS PARA CREACIÓN (SIMPLIFICADO SEGÚN TU BD)
// ==========================================
export interface CreateNotaEvolucionDto {
  id_documento: number; // Obligatorio

  // Campos SOAP - formato estándar médico (todos opcionales)
  subjetivo?: string;   // S: Lo que dice el paciente
  objetivo?: string;    // O: Lo que observa el médico
  analisis?: string;    // A: Assessment/Evaluación
  plan?: string;        // P: Plan de acción
}

// ==========================================
// DTOS PARA ACTUALIZACIÓN
// ==========================================
export interface UpdateNotaEvolucionDto extends Partial<CreateNotaEvolucionDto> {
  // Se actualiza por ID en la URL
}

// ==========================================
// INTERFACES PARA RESPUESTAS DE LISTADO
// ==========================================
export interface NotaEvolucionListResponse {
  data: NotaEvolucion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==========================================
// VALIDACIONES
// ==========================================
export interface ValidacionNotaEvolucion {
  valido: boolean;
  errores: string[];
  advertencias: string[];
  campos_vacios: string[];
}

// ==========================================
// CONSTANTES ÚTILES
// ==========================================
export const CAMPOS_OBLIGATORIOS_EVOLUCION = [
  'id_documento'
];

export const CAMPOS_SOAP = [
  'subjetivo',
  'objetivo',
  'analisis',
  'plan'
];

// ==========================================
// TIPOS PARA OPCIONES
// ==========================================
export type CampoSOAP = 'subjetivo' | 'objetivo' | 'analisis' | 'plan';

// ==========================================
// PLANTILLAS SOAP
// ==========================================
export interface PlantillaSOAP {
  id: string;
  nombre: string;
  descripcion: string;
  subjetivo_template?: string;
  objetivo_template?: string;
  analisis_template?: string;
  plan_template?: string;
}

export const PLANTILLAS_SOAP: PlantillaSOAP[] = [
  {
    id: 'general',
    nombre: 'Evolución General',
    descripcion: 'Template básico para evolución médica',
    subjetivo_template: 'Paciente refiere...',
    objetivo_template: 'Signos vitales: TA ___ FC ___ FR ___ Temp ___\nExploración física:',
    analisis_template: 'Evolución clínica:\nImpresión diagnóstica:',
    plan_template: 'Plan de manejo:\n1. Continuar tratamiento...\n2. Vigilar...'
  },
  {
    id: 'postoperatorio',
    nombre: 'Evolución Postoperatoria',
    descripcion: 'Template para seguimiento postoperatorio',
    subjetivo_template: 'Paciente se encuentra en ____ día postoperatorio\nRefiere:',
    objetivo_template: 'Signos vitales estables\nHerida quirúrgica:',
    analisis_template: 'Evolución postoperatoria satisfactoria/complicada',
    plan_template: 'Continuar analgesia\nMobilización progresiva\nValorar egreso'
  },
  {
    id: 'pediatrica',
    nombre: 'Evolución Pediátrica',
    descripcion: 'Template para pacientes pediátricos',
    subjetivo_template: 'Familiar refiere que el paciente...',
    objetivo_template: 'Peso: ___ kg Talla: ___ cm\nSignos vitales apropiados para la edad',
    analisis_template: 'Paciente pediátrico con evolución...',
    plan_template: 'Continuar esquema pediátrico\nValoración por familiar'
  }
];

// ==========================================
// MÉTODOS DE UTILIDAD
// ==========================================
export class NotaEvolucionUtils {

  static validarCamposSOAP(nota: CreateNotaEvolucionDto): ValidacionNotaEvolucion {
    const errores: string[] = [];
    const advertencias: string[] = [];
    const camposVacios: string[] = [];

    // Validar campo obligatorio
    if (!nota.id_documento) {
      errores.push('El ID del documento es obligatorio');
    }

    // Verificar campos SOAP vacíos
    CAMPOS_SOAP.forEach(campo => {
      const valor = nota[campo as CampoSOAP];
      if (!valor || valor.trim() === '') {
        camposVacios.push(campo);
      }
    });

    // Advertencias si faltan campos importantes
    if (camposVacios.includes('subjetivo')) {
      advertencias.push('Se recomienda registrar los síntomas que refiere el paciente');
    }

    if (camposVacios.includes('objetivo')) {
      advertencias.push('Se recomienda registrar los hallazgos de exploración física');
    }

    if (camposVacios.includes('plan')) {
      advertencias.push('Se recomienda especificar el plan de tratamiento');
    }

    return {
      valido: errores.length === 0,
      errores,
      advertencias,
      campos_vacios: camposVacios
    };
  }

  static generarPlantillaVacia(): CreateNotaEvolucionDto {
    return {
      id_documento: 0,
      subjetivo: '',
      objetivo: '',
      analisis: '',
      plan: ''
    };
  }

  static aplicarPlantilla(plantillaId: string): Partial<CreateNotaEvolucionDto> {
    const plantilla = PLANTILLAS_SOAP.find(p => p.id === plantillaId);
    if (!plantilla) {
      return {};
    }

    return {
      subjetivo: plantilla.subjetivo_template || '',
      objetivo: plantilla.objetivo_template || '',
      analisis: plantilla.analisis_template || '',
      plan: plantilla.plan_template || ''
    };
  }

  static formatearSOAP(nota: NotaEvolucion): string {
    const partes: string[] = [];

    if (nota.subjetivo) {
      partes.push(`S (Subjetivo): ${nota.subjetivo}`);
    }

    if (nota.objetivo) {
      partes.push(`O (Objetivo): ${nota.objetivo}`);
    }

    if (nota.analisis) {
      partes.push(`A (Análisis): ${nota.analisis}`);
    }

    if (nota.plan) {
      partes.push(`P (Plan): ${nota.plan}`);
    }

    return partes.join('\n\n');
  }
}
