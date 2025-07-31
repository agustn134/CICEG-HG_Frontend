

// src/app/models/pediatria.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// ==========================================
// ANTECEDENTES HEREDO FAMILIARES
// ==========================================
// CORRECCION: El nombre del ID coincide con la BD (id_antecedentes_hf)
export interface AntecedentesHeredoFamiliares extends BaseEntity, AuditInfo {
  id_antecedentes_hf: number; // Coincide con la BD
  id_expediente: number;
  id_paciente: number;
  id_historia_clinica: number; // Añadido para alinearse con la estructura de la BD

  // Antecedentes paternos
  antecedentes_paternos?: AntecedentesFamiliares;

  // Antecedentes maternos
  antecedentes_maternos?: AntecedentesFamiliares;

  // Hermanos
  numero_hermanos?: number;
  antecedentes_hermanos?: string;

  // Otros familiares
  otros_antecedentes_familiares?: string;

  // Observaciones
  observaciones?: string;
  id_personal_registro: number;
}

export interface AntecedentesFamiliares {
  diabetes?: boolean;
  hipertension?: boolean;
  cardiopatias?: boolean;
  cancer?: boolean;
  enfermedades_mentales?: boolean;
  malformaciones_congenitas?: boolean;
  otros?: string;
}

// ==========================================
// ANTECEDENTES PERINATALES
// ==========================================
// CORRECCION: El nombre del ID coincide con la BD (id_perinatales)
export interface AntecedentesPerinatales extends BaseEntity, AuditInfo {
  id_perinatales: number; // Corregido de id_antecedentes_perinatales
  id_expediente: number;
  id_paciente: number;
  id_historia_clinica: number; // Añadido para alinearse con la estructura de la BD

  // Datos del embarazo
  embarazo_planeado?: boolean; // Añadido según BD
  numero_embarazo?: number; // Añadido según BD
  control_prenatal?: boolean; // Añadido según BD
  numero_consultas_prenatales?: number; // Añadido según BD
  complicaciones_embarazo?: string;

  // Datos del parto
  tipo_parto: 'Vaginal' | 'Cesarea'; // Ajustado al ENUM de la BD
  semanas_gestacion?: number; // Añadido según BD
  peso_nacimiento?: number; // Añadido según BD (DECIMAL(5,2) -> number)
  talla_nacimiento?: number; // Añadido según BD (DECIMAL(5,2) -> number)
  apgar_1_min?: number;
  apgar_5_min?: number;

  // Periodo neonatal
  llanto_inmediato?: boolean; // Añadido según BD
  hospitalizacion_neonatal?: boolean; // Añadido según BD
  dias_hospitalizacion_neonatal?: number; // Añadido según BD
  problemas_neonatales?: string; // Añadido según BD
  alimentacion_neonatal?: 'Seno materno' | 'Fórmula' | 'Mixta'; // Añadido según BD

  // Desarrollo temprano
  peso_2_meses?: number; // Añadido según BD
  peso_4_meses?: number; // Añadido según BD
  peso_6_meses?: number; // Añadido según BD

  observaciones?: string;
  id_personal_registro: number;
}

// ==========================================
// DESARROLLO PSICOMOTRIZ
// ==========================================
// CORRECCION: El nombre del ID coincide con la BD (id_desarrollo)
export interface DesarrolloPsicomotriz extends BaseEntity, AuditInfo {
  id_desarrollo: number; // Corregido de id_desarrollo_psicomotriz
  id_expediente: number;
  id_paciente: number;
  id_historia_clinica: number; // Añadido para alinearse con la estructura de la BD

  // Desarrollo motor grueso
  sostuvo_cabeza_meses?: number; // Ajustado al nombre de la BD
  se_sento_meses?: number; // Ajustado al nombre de la BD
  gateo_meses?: number; // Ajustado al nombre de la BD
  camino_meses?: number; // Ajustado al nombre de la BD
  // Pueden faltar otros hitos de motor grueso según la BD (correr, saltar, etc.)

  // Desarrollo del lenguaje
  primera_palabra_meses?: number; // Ajustado al nombre de la BD
  primeras_frases_meses?: number; // Ajustado al nombre de la BD

  // Desarrollo social y otros
  sonrisa_social_meses?: number; // Ajustado al nombre de la BD
  reconocimiento_padres_meses?: number; // Añadido según BD
  control_diurno_meses?: number; // Añadido según BD
  control_nocturno_meses?: number; // Añadido según BD
  juego_simbolico_meses?: number; // Ajustado al nombre de la BD
  seguimiento_instrucciones_meses?: number; // Añadido según BD

  // Evaluación actual
  desarrollo_normal?: boolean;
  observaciones_desarrollo?: string; // Ajustado para ser más específico
  necesita_estimulacion?: boolean; // Añadido según BD
  tipo_estimulacion?: string; // Añadido según BD
  areas_retraso?: string; // Puede estar duplicado o relacionado con otras propiedades
  recomendaciones?: string; // Puede estar duplicado o relacionado con otras propiedades

  id_personal_registro: number;
}

// ==========================================
// INMUNIZACIONES
// ==========================================
// CORRECCION: El nombre del ID coincide con la BD (id_inmunizacion)
export interface Inmunizaciones extends BaseEntity, AuditInfo {
  id_inmunizacion: number; // Corregido de id_inmunizaciones
  id_expediente: number;
  id_paciente: number;
  id_historia_clinica: number; // Añadido para alinearse con la estructura de la BD

  // Estado del esquema
  esquema_completo_edad?: boolean;
  esquema_incompleto_razon?: string; // Añadido según BD
  porcentaje_completado?: number; // Puede estar implícito o calculado

  // Vacunas básicas (estructura simplificada, el control real puede ser más complejo según la BD)
  bcg_fecha?: string; // Añadido según BD
  bcg_observaciones?: string; // Añadido según BD
  // ... (otras vacunas con sufijo _fecha, _lote, _reacciones)
  // La estructura actual con arrays es útil para el frontend, pero requiere mapeo especial con la BD

  reacciones_adversas?: string; // Añadido según BD
  observaciones?: string;
  id_personal_registro: number;
}

// La interfaz RegistroVacunaBasica sigue siendo útil para el modelo del frontend
export interface RegistroVacunaBasica {
  aplicada: boolean;
  fecha_aplicacion?: string;
  dosis?: number;
  lote?: string;
  reacciones?: string;
}


// ==========================================
// VACUNAS ADICIONALES
// ==========================================
// CORRECCION: El nombre del ID principal de la colección coincide con la BD (id_vacunas_adicionales)
// Asumiendo que la tabla se llama `vacunas_adicionales` y su PK es `id_vacunas_adicionales`
export interface VacunasAdicionales extends BaseEntity, AuditInfo {
  id_vacunas_adicionales: number; // Asumido que coincide con la BD
  id_expediente: number;
  id_paciente: number;
  id_inmunizacion: number; // Relación con la tabla inmunizaciones

  // Vacunas no incluidas en esquema básico
  vacunas_adicionales: VacunaAdicional[];

  observaciones?: string;
  id_personal_registro: number;
}

export interface VacunaAdicional extends BaseEntity { // Puede extender BaseEntity si cada vacuna tiene su propio ID y fechas
  id_vacuna_adicional?: number; // Corresponde al id en la tabla vacunas_adicionales de la BD
  nombre_vacuna: string;
  laboratorio?: string;
  lote?: string;
  fecha_aplicacion: string;
  dosis: number;
  via_aplicacion?: string;
  sitio_aplicacion?: string;
  reacciones_adversas?: string;
  observaciones?: string;
}

// ==========================================
// ESTADO NUTRICIONAL PEDIÁTRICO
// ==========================================
// CORRECCION: El nombre del ID coincide con la BD (id_estado_nutricional)
export interface EstadoNutricionalPediatrico extends BaseEntity, AuditInfo {
  id_estado_nutricional: number; // Corregido, asumiendo coincide con la BD
  id_expediente: number;
  id_paciente: number;
  id_historia_clinica: number; // Añadido para alinearse con la estructura de la BD

  // Datos antropométricos
  peso_kg: number;
  talla_cm: number;
  perimetro_cefalico_cm?: number;
  perimetro_brazo_cm?: number; // Ajustado al nombre de la BD

  // Índices nutricionales (Nombres ajustados según BD)
  percentil_peso?: number; // Ajustado
  percentil_talla?: number; // Ajustado
  percentil_perimetro_cefalico?: number; // Ajustado
  peso_para_edad?: string; // Ajustado (puede ser texto descriptivo)
  talla_para_edad?: string; // Ajustado (puede ser texto descriptivo)
  peso_para_talla?: string; // Ajustado (puede ser texto descriptivo)
  imc?: number;
  imc_percentil?: number; // Puede estar implícito o calculado

  // Evaluación clínica (Nombres ajustados según BD)
  aspecto_general?: string; // Añadido
  estado_hidratacion?: string; // Añadido
  palidez_mucosas?: boolean; // Añadido
  edemas?: boolean; // Añadido
  masa_muscular?: string; // Añadido
  tejido_adiposo?: string; // Añadido

  // Clasificación nutricional
  diagnostico_nutricional?: string; // Ajustado al nombre de la BD
  riesgo_nutricional?: boolean;

  // Alimentación
  tipo_alimentacion?: TipoAlimentacion;
  numero_comidas_dia?: number;
  apetito?: 'BUENO' | 'REGULAR' | 'MALO';

  // Síntomas relacionados
  nauseas?: boolean;
  vomitos?: boolean;
  diarrea?: boolean;
  estrenimiento?: boolean;

  // Plan nutricional
  recomendaciones_nutricionales?: string;
  suplementos_vitaminicos?: string;

  observaciones?: string;
  fecha_evaluacion: string;
  id_personal_registro: number;
}

// Ajustados según los ENUM de la BD
export type TipoAlimentacion =
  | 'Lactancia materna exclusiva'
  | 'Lactancia mixta'
  | 'Fórmula láctea'
  | 'Alimentación complementaria'
  | 'Alimentación familiar';

// Clasificación nutricional podría requerir ajuste según la BD
export type ClasificacionNutricional =
  | 'NORMAL'
  | 'SOBREPESO'
  | 'OBESIDAD'
  | 'DESNUTRICION_LEVE'
  | 'DESNUTRICION_MODERADA'
  | 'DESNUTRICION_SEVERA'
  | 'RIESGO_NUTRICIONAL';

// ==========================================
// FILTROS Y DTOs
// ==========================================
export interface PediatriaFilters extends BaseFilters {
  id_expediente?: number;
  id_paciente?: number;
  id_historia_clinica?: number; // Añadido
  fecha_desde?: string;
  fecha_hasta?: string;
}

// DTOs (ejemplo, ajustar según los campos requeridos por los controladores)
export interface CreateAntecedentesHeredoFamiliaresDto {
  id_historia_clinica: number; // Añadido
  antecedentes_paternos?: AntecedentesFamiliares;
  antecedentes_maternos?: AntecedentesFamiliares;
  numero_hermanos?: number;
  antecedentes_hermanos?: string;
  otros_antecedentes_familiares?: string;
  observaciones?: string;
  id_personal_registro: number;
}

export interface CreateAntecedentesPerinatalesDto {
  id_historia_clinica: number; // Añadido
  embarazo_planeado?: boolean;
  numero_embarazo?: number;
  control_prenatal?: boolean;
  numero_consultas_prenatales?: number;
  complicaciones_embarazo?: string;
  tipo_parto: 'Vaginal' | 'Cesarea';
  semanas_gestacion?: number;
  peso_nacimiento?: number;
  talla_nacimiento?: number;
  apgar_1_min?: number;
  apgar_5_min?: number;
  llanto_inmediato?: boolean;
  hospitalizacion_neonatal?: boolean;
  dias_hospitalizacion_neonatal?: number;
  problemas_neonatales?: string;
  alimentacion_neonatal?: string;
  peso_2_meses?: number;
  peso_4_meses?: number;
  peso_6_meses?: number;
  observaciones?: string;
  id_personal_registro: number;
}

export interface CreateDesarrolloPsicomotrizDto {
  id_historia_clinica: number; // Añadido
  sostuvo_cabeza_meses?: number;
  se_sento_meses?: number;
  gateo_meses?: number;
  camino_meses?: number;
  primera_palabra_meses?: number;
  primeras_frases_meses?: number;
  sonrisa_social_meses?: number;
  reconocimiento_padres_meses?: number;
  control_diurno_meses?: number;
  control_nocturno_meses?: number;
  juego_simbolico_meses?: number;
  seguimiento_instrucciones_meses?: number;
  desarrollo_normal?: boolean;
  observaciones_desarrollo?: string;
  necesita_estimulacion?: boolean;
  tipo_estimulacion?: string;
  id_personal_registro: number;
}

export interface CreateEstadoNutricionalPediatricoDto {
  id_historia_clinica: number; // Añadido
  peso_kg: number;
  talla_cm: number;
  perimetro_cefalico_cm?: number;
  perimetro_brazo_cm?: number;
  percentil_peso?: number;
  percentil_talla?: number;
  percentil_perimetro_cefalico?: number;
  peso_para_edad?: string;
  talla_para_edad?: string;
  peso_para_talla?: string;
  imc?: number;
  aspecto_general?: string;
  estado_hidratacion?: string;
  palidez_mucosas?: boolean;
  edemas?: boolean;
  masa_muscular?: string;
  tejido_adiposo?: string;
  diagnostico_nutricional?: string;
  riesgo_nutricional?: boolean;
  tipo_alimentacion?: TipoAlimentacion;
  numero_comidas_dia?: number;
  apetito?: 'BUENO' | 'REGULAR' | 'MALO';
  nauseas?: boolean;
  vomitos?: boolean;
  diarrea?: boolean;
  estrenimiento?: boolean;
  recomendaciones_nutricionales?: string;
  suplementos_vitaminicos?: string;
  observaciones?: string;
  fecha_evaluacion: string;
  id_personal_registro: number;
}

// DTO para Inmunizaciones (ejemplo, ajustar según la estructura real esperada por el backend)
export interface CreateInmunizacionesDto {
  id_historia_clinica: number; // Añadido
  // ... campos específicos de vacunas
  observaciones?: string;
  id_personal_registro: number;
}
