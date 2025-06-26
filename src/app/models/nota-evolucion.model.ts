import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface NotaEvolucion extends BaseEntity, AuditInfo {
  id_nota_evolucion: number;
  id_documento: number;

  // Campos automáticos calculados (según tu BD)
  dias_hospitalizacion?: number;
  fecha_ultimo_ingreso?: string;

  // Signos vitales opcionales
  temperatura?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  presion_arterial_sistolica?: number;
  presion_arterial_diastolica?: number;
  saturacion_oxigeno?: number;
  peso_actual?: number;
  talla_actual?: number;

  // Formato SOAP clásico
  subjetivo?: string; // Lo que reporta el paciente
  objetivo?: string;  // Hallazgos de la exploración física
  analisis?: string;  // Interpretación
  plan?: string;      // Plan de tratamiento

  // Campos obligatorios según norma hospitalaria
  sintomas_signos: string;
  habitus_exterior: string;
  estado_nutricional: string;
  estudios_laboratorio_gabinete: string;
  evolucion_analisis: string;
  diagnosticos: string;
  plan_estudios_tratamiento: string;
  pronostico: string;

  // Exploración física detallada (opcionales)
  exploracion_cabeza?: string;
  exploracion_cuello?: string;
  exploracion_torax?: string;
  exploracion_abdomen?: string;
  exploracion_extremidades?: string;
  exploracion_columna?: string;
  exploracion_genitales?: string;
  exploracion_neurologico?: string;

  // Campos opcionales adicionales
  diagnosticos_guias?: string;
  interconsultas?: string;
  indicaciones_medicas?: string;
  observaciones_adicionales?: string;

  // Información adicional del documento
  fecha_documento?: string;
  nombre_paciente?: string;
  numero_expediente?: string;
  medico_responsable?: string;
  servicio?: string;
}

export interface NotaEvolucionFilters extends BaseFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  dias_hospitalizacion_min?: number;
  dias_hospitalizacion_max?: number;
  con_signos_vitales?: boolean;
  id_expediente?: number;
  medico_responsable?: number;
}

export interface CreateNotaEvolucionDto {
  id_documento: number;
  // Signos vitales opcionales
  temperatura?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  presion_arterial_sistolica?: number;
  presion_arterial_diastolica?: number;
  saturacion_oxigeno?: number;
  peso_actual?: number;
  talla_actual?: number;

  // SOAP
  subjetivo?: string;
  objetivo?: string;
  analisis?: string;
  plan?: string;

  // Campos obligatorios
  sintomas_signos: string;
  habitus_exterior: string;
  estado_nutricional: string;
  estudios_laboratorio_gabinete: string;
  evolucion_analisis: string;
  diagnosticos: string;
  plan_estudios_tratamiento: string;
  pronostico: string;

  // Opcionales
  exploracion_cabeza?: string;
  exploracion_cuello?: string;
  exploracion_torax?: string;
  exploracion_abdomen?: string;
  exploracion_extremidades?: string;
  exploracion_columna?: string;
  exploracion_genitales?: string;
  exploracion_neurologico?: string;
  diagnosticos_guias?: string;
  interconsultas?: string;
  indicaciones_medicas?: string;
  observaciones_adicionales?: string;
}

export interface UpdateNotaEvolucionDto extends Partial<CreateNotaEvolucionDto> {
  id_nota_evolucion: number;
}
