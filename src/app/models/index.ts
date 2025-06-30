// src/app/models/index.ts

// ==========================================
// EXPORTACIONES BASE
// ==========================================
export * from './base.models';
export * from './estado.enum';

// ==========================================
// EXPORTACIONES PERSONAS
// ==========================================
export * from './persona.model';
export * from './paciente.model';
export * from './personal-medico.model';
export * from './administrador.model';

// ==========================================
// EXPORTACIONES CATÁLOGOS
// ==========================================
export * from './servicio.model';
export * from './area-interconsulta.model';
export * from './guia-clinica.model';
export * from './estudio-medico.model';
export * from './medicamento.model';
export * from './tipo-sangre.model';
export * from './tipo-documento.model';

// ==========================================
// EXPORTACIONES GESTIÓN EXPEDIENTES
// ==========================================
export * from './expediente.model';
export * from './cama.model';
export * from './internamiento.model';
export * from './signos-vitales.model';

// ==========================================
// EXPORTACIONES DOCUMENTOS CLÍNICOS
// ==========================================
export * from './documento-clinico.model';
export * from './historia-clinica.model';
export * from './nota-urgencias.model';
export * from './nota-evolucion.model';
export * from './nota-interconsulta.model';
export * from './nota-preoperatoria.model';
export * from './nota-preanestesica.model';
export * from './nota-postoperatoria.model';
export * from './nota-postanestesica.model';
export * from './nota-egreso.model';
export * from './consentimiento-informado.model';
export * from './referencia-traslado.model';
export * from './prescripcion-medicamento.model';
export * from './registro-transfusion.model';

// ==========================================
// EXPORTACIONES NOTAS ESPECIALIZADAS
// ==========================================
export * from './nota-psicologia.model';
export * from './nota-nutricion.model';

// ==========================================
// TIPOS UNIÓN ÚTILES
// ==========================================

// Tipos para todas las notas médicas
export type TipoNota =
  | 'nota-urgencias'
  | 'nota-evolucion'
  | 'nota-interconsulta'
  | 'nota-preoperatoria'
  | 'nota-preanestesica'
  | 'nota-postoperatoria'
  | 'nota-postanestesica'
  | 'nota-egreso'
  | 'nota-psicologia'
  | 'nota-nutricion';

// Tipos para documentos clínicos
export type TipoDocumentoClinico =
  | 'historia-clinica'
  | 'consentimiento-informado'
  | 'solicitud-estudio'
  | 'referencia-traslado'
  | 'prescripcion-medicamento'
  | 'registro-transfusion'
  | TipoNota;

// Tipos para personas del sistema
export type TipoPersona =
  | 'paciente'
  | 'personal-medico'
  | 'administrador';

// Tipos para módulos del sistema
export type ModuloSistema =
  | 'catalogos'
  | 'personas'
  | 'gestion-expedientes'
  | 'documentos-clinicos'
  | 'notas-especializadas'
  | 'sistema';

// ==========================================
// CONSTANTES ÚTILES
// ==========================================

export const MODULOS_SISTEMA: Record<ModuloSistema, string> = {
  'catalogos': 'Catálogos',
  'personas': 'Gestión de Personas',
  'gestion-expedientes': 'Gestión de Expedientes',
  'documentos-clinicos': 'Documentos Clínicos',
  'notas-especializadas': 'Notas Especializadas',
  'sistema': 'Sistema'
};

export const TIPOS_DOCUMENTO: Record<TipoDocumentoClinico, string> = {
  'historia-clinica': 'Historia Clínica',
  'nota-urgencias': 'Nota de Urgencias',
  'nota-evolucion': 'Nota de Evolución',
  'nota-interconsulta': 'Nota de Interconsulta',
  'nota-preoperatoria': 'Nota Preoperatoria',
  'nota-preanestesica': 'Nota Preanestésica',
  'nota-postoperatoria': 'Nota Postoperatoria',
  'nota-postanestesica': 'Nota Postanestésica',
  'nota-egreso': 'Nota de Egreso',
  'nota-psicologia': 'Nota de Psicología',
  'nota-nutricion': 'Nota de Nutrición',
  'consentimiento-informado': 'Consentimiento Informado',
  'solicitud-estudio': 'Solicitud de Estudio',
  'referencia-traslado': 'Referencia y Traslado',
  'prescripcion-medicamento': 'Prescripción de Medicamento',
  'registro-transfusion': 'Registro de Transfusión'
};
