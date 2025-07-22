// src/app/models/esquema-vacunacion.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface EsquemaVacunacion extends BaseEntity, AuditInfo {
  id_esquema_vacunacion: number;
  id_expediente: number;
  id_paciente: number;

  // Estado general del esquema
  porcentaje_completado: number;
  esquema_completo: boolean;
  estado_general: EstadoEsquema;

  // Información de control
  fecha_ultima_actualizacion: string;
  id_personal_actualiza: number;
  observaciones_generales?: string;

  // Vacunas aplicadas
  vacunas_aplicadas: RegistroVacuna[];
  vacunas_pendientes: VacunaPendiente[];
  proximas_citas: ProximaCita[];
}

export interface RegistroVacuna {
  id_registro_vacuna?: number;
  id_esquema_vacunacion: number;

  // Información de la vacuna
  nombre_vacuna: string;
  tipo_vacuna: string;
  laboratorio?: string;
  lote_vacuna?: string;

  // Aplicación
  dosis_numero: number;
  fecha_aplicacion: string;
  edad_aplicacion_meses: number;
  sitio_aplicacion?: string;
  via_aplicacion?: string;

  // Personal y seguimiento
  id_personal_aplica: number;
  reacciones_adversas?: string;
  contraindicaciones?: string;
  observaciones?: string;
}

export interface VacunaPendiente {
  nombre_vacuna: string;
  dosis_numero: number;
  edad_recomendada_meses: number;
  fecha_limite?: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  observaciones?: string;
}

export interface ProximaCita {
  fecha_programada: string;
  vacunas_programadas: string[];
  edad_paciente_meses: number;
  observaciones?: string;
}

export type EstadoEsquema =
  | 'COMPLETO'
  | 'INCOMPLETO'
  | 'EN_PROCESO'
  | 'ATRASADO'
  | 'CONTRAINDICADO';

export interface CreateEsquemaVacunacionDto {
  id_expediente: number;
  id_paciente: number;
  id_personal_actualiza: number;
  observaciones_generales?: string;
}

export interface CreateRegistroVacunaDto {
  id_esquema_vacunacion: number;
  nombre_vacuna: string;
  tipo_vacuna: string;
  laboratorio?: string;
  lote_vacuna?: string;
  dosis_numero: number;
  fecha_aplicacion?: string;
  edad_aplicacion_meses?: number;
  sitio_aplicacion?: string;
  via_aplicacion?: string;
  id_personal_aplica: number;
  reacciones_adversas?: string;
  observaciones?: string;
}
