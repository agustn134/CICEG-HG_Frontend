// src/app/models/nota-postoperatoria.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// ==========================================
// INTERFACE NOTA POSTOPERATORIA
// ==========================================
export interface NotaPostoperatoria extends BaseEntity, AuditInfo {
  id_nota_postoperatoria: number;
  id_documento: number;

  // Información del procedimiento realizado
  procedimiento_realizado: string;
  fecha_cirugia: string;
  hora_inicio?: string;
  hora_finalizacion?: string;
  duracion_minutos?: number;

  // Descripción quirúrgica
  tecnica_quirurgica?: string;
  hallazgos_transoperatorios?: string;
  complicaciones_transoperatorias?: string;
  tipo_anestesia_utilizada?: string;

  // Estado postoperatorio inmediato
  estado_postoperatorio: string;
  signos_vitales_estables?: boolean;
  dolor_postoperatorio?: string;
  nivel_consciencia?: string;

  // Herida quirúrgica
  tipo_herida?: string;
  cierre_herida?: string;
  drenajes?: string;
  vendajes_curaciones?: string;

  // Indicaciones postoperatorias
  dieta_postoperatoria?: string;
  movilizacion?: string;
  cuidados_herida?: string;
  manejo_dolor?: string;
  antibioticos?: string;

  // Pronóstico y seguimiento
  pronostico?: string;
  complicaciones_potenciales?: string;
  plan_seguimiento?: string;
  fecha_alta_estimada?: string;

  // Personal médico
  id_cirujano_principal?: number;
  id_anestesiologo?: number;

  // Información adicional del documento
  fecha_documento?: string;
  nombre_paciente?: string;
  edad_paciente?: number;
  nombre_cirujano?: string;
}

// ==========================================
// FILTROS PARA BÚSQUEDAS
// ==========================================
export interface NotaPostoperatoriaFilters extends BaseFilters {
  id_cirujano_principal?: number;
  fecha_cirugia_inicio?: string;
  fecha_cirugia_fin?: string;
  tipo_procedimiento?: string;
  con_complicaciones?: boolean;
  estado_postoperatorio?: string;
}

// ==========================================
// DTOS PARA CREACIÓN Y ACTUALIZACIÓN
// ==========================================
export interface CreateNotaPostoperatoriaDto {
  id_documento: number;
  procedimiento_realizado: string;
  fecha_cirugia: string;
  estado_postoperatorio: string;
  tecnica_quirurgica?: string;
  hallazgos_transoperatorios?: string;
  complicaciones_transoperatorias?: string;
  pronostico?: string;
  id_cirujano_principal?: number;
}

export interface UpdateNotaPostoperatoriaDto extends Partial<CreateNotaPostoperatoriaDto> {
  id_nota_postoperatoria: number;
}
