// // import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// // export interface PrescripcionMedicamento extends BaseEntity, AuditInfo {
// //   id_prescripcion: number;
// //   id_documento: number;
// //   id_medicamento: number;
// //   dosis: string;
// //   via_administracion?: string;
// //   frecuencia: string;
// //   duracion: string;
// //   cantidad_total?: string;
// //   indicaciones_especiales?: string;
// //   fecha_inicio?: string;
// //   fecha_fin?: string;
// //   activo: boolean;

// //   // Add these new properties
// //   fecha_prescripcion?: string;
// //   especialidad_medico?: string;

// //   // Existing information fields
// //   nombre_medicamento?: string;
// //   presentacion_medicamento?: string;
// //   concentracion_medicamento?: string;
// //   fecha_documento?: string;
// //   nombre_paciente?: string;
// //   numero_expediente?: string;
// //   medico_prescriptor?: string;
// // }

// // export interface PrescripcionMedicamentoFilters extends BaseFilters {
// //   id_documento?: number;
// //   id_expediente?: number;
// //   id_medicamento?: number;
// //   via_administracion?: string;
// //   activo?: boolean;
// //   fecha_inicio?: string;
// //   fecha_fin?: string;
// //   medico_prescriptor?: number;
// //   nombre_medicamento?: string;
// //   buscar?: string;
// // }

// // export interface CreatePrescripcionMedicamentoDto {
// //   id_documento: number;
// //   id_medicamento: number;
// //   dosis: string;
// //   via_administracion?: string;
// //   frecuencia: string;
// //   duracion: string;
// //   cantidad_total?: string;
// //   indicaciones_especiales?: string;
// //   fecha_inicio?: string;
// //   fecha_fin?: string;
// //   activo?: boolean;
// // }

// // export interface UpdatePrescripcionMedicamentoDto extends Partial<CreatePrescripcionMedicamentoDto> {
// //   id_prescripcion: number;
// // }





// // src/app/models/prescripcion-medicamento.model.ts
// import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// export interface PrescripcionMedicamento extends BaseEntity, AuditInfo {
//   id_prescripcion: number;
//   id_documento: number;
//   id_expediente: number;
//   id_paciente: number;
//   id_medico_prescriptor: number;

//   // Información del medicamento
//   medicamento: string;
//   nombre_generico?: string;
//   nombre_comercial?: string;
//   concentracion?: string;
//   forma_farmaceutica?: string;

//   // Detalles de la prescripción
//   dosis: string;
//   via_administracion: ViaAdministracion;
//   frecuencia: string;
//   duracion_tratamiento: string;
//   cantidad_prescrita?: string;

//   // Instrucciones
//   indicaciones_especiales?: string;
//   indicaciones_generales?: string;
//   contraindicaciones?: string;
//   efectos_secundarios?: string;

//   // Control y fechas
//   fecha_prescripcion: string;
//   fecha_inicio?: string;
//   fecha_fin?: string;
//   renovaciones_permitidas?: number;

//   // Estado
//   activo: boolean;
//   dispensado?: boolean;
//   fecha_dispensacion?: string;
//   observaciones?: string;
// }

// export type ViaAdministracion =
//   | 'ORAL'
//   | 'INTRAVENOSA'
//   | 'INTRAMUSCULAR'
//   | 'SUBCUTANEA'
//   | 'TOPICA'
//   | 'INHALATORIA'
//   | 'RECTAL'
//   | 'VAGINAL'
//   | 'SUBLINGUAL'
//   | 'TRANSDERMICA'
//   | 'OFTÁLMICA'
//   | 'OTICA'
//   | 'NASAL'
//   | 'OTROS';

// export interface CreatePrescripcionMedicamentoDto {
//   id_documento: number;
//   id_expediente: number;
//   id_paciente: number;
//   id_medico_prescriptor: number;
//   medicamento: string;
//   nombre_generico?: string;
//   nombre_comercial?: string;
//   concentracion?: string;
//   forma_farmaceutica?: string;
//   dosis: string;
//   via_administracion: ViaAdministracion;
//   frecuencia: string;
//   duracion_tratamiento: string;
//   cantidad_prescrita?: string;
//   indicaciones_especiales?: string;
//   contraindicaciones?: string;
//   fecha_prescripcion?: string;
//   fecha_inicio?: string;
//   renovaciones_permitidas?: number;
//   observaciones?: string;
// }

// export interface PrescripcionMedicamentoFilters extends BaseFilters {
//   medicamento?: string;
//   via_administracion?: ViaAdministracion;
//   activo?: boolean;
//   dispensado?: boolean;
//   fecha_desde?: string;
//   fecha_hasta?: string;
//   id_medico?: number;
// }





// src/app/models/prescripcion-medicamento.model.ts
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

export interface PrescripcionMedicamento extends BaseEntity, AuditInfo {
  id_prescripcion: number;
  id_documento: number;
  id_expediente: number;
  id_paciente: number;
  id_medico_prescriptor: number;

  // Información del medicamento (para coincidir con el servicio)
  id_medicamento?: number; // Agregado para compatibilidad con servicio
  medicamento: string;
  nombre_generico?: string;
  nombre_comercial?: string;
  concentracion?: string;
  forma_farmaceutica?: string;

  // Detalles de la prescripción
  dosis: string;
  via_administracion: ViaAdministracion;
  frecuencia: string;
  duracion_tratamiento: string;
  duracion?: string; // Alias para duracion_tratamiento (compatibilidad servicio)
  cantidad_prescrita?: string;
  cantidad_total?: string; // Alias para cantidad_prescrita (compatibilidad servicio)

  // Instrucciones
  indicaciones_especiales?: string;
  indicaciones_generales?: string;
  contraindicaciones?: string;
  efectos_secundarios?: string;

  // Control y fechas
  fecha_prescripcion: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  renovaciones_permitidas?: number;

  // Estado
  activo: boolean;
  dispensado?: boolean;
  fecha_dispensacion?: string;
  observaciones?: string;

  // Campos adicionales del servicio
  nombre_medicamento?: string;
  presentacion_medicamento?: string;
  concentracion_medicamento?: string;
  fecha_documento?: string;
  nombre_paciente?: string;
  numero_expediente?: string;
  medico_prescriptor?: string;
  especialidad_medico?: string;
}

export type ViaAdministracion =
  | 'ORAL'
  | 'INTRAVENOSA'
  | 'INTRAMUSCULAR'
  | 'SUBCUTANEA'
  | 'TOPICA'
  | 'INHALATORIA'
  | 'RECTAL'
  | 'VAGINAL'
  | 'SUBLINGUAL'
  | 'TRANSDERMICA'
  | 'OFTÁLMICA'
  | 'OTICA'
  | 'NASAL'
  | 'OTROS';

export interface CreatePrescripcionMedicamentoDto {
  id_documento: number;
  id_expediente: number;
  id_paciente: number;
  id_medico_prescriptor: number;
  id_medicamento?: number; // Agregado para compatibilidad
  medicamento: string;
  nombre_generico?: string;
  nombre_comercial?: string;
  concentracion?: string;
  forma_farmaceutica?: string;
  dosis: string;
  via_administracion: ViaAdministracion;
  frecuencia: string;
  duracion_tratamiento: string;
  duracion?: string; // Alias para compatibilidad
  cantidad_prescrita?: string;
  cantidad_total?: string; // Alias para compatibilidad
  indicaciones_especiales?: string;
  contraindicaciones?: string;
  fecha_prescripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  renovaciones_permitidas?: number;
  observaciones?: string;
  activo?: boolean;
}

export interface UpdatePrescripcionMedicamentoDto extends Partial<CreatePrescripcionMedicamentoDto> {
  id_prescripcion: number;
}

export interface PrescripcionMedicamentoFilters extends BaseFilters {
  id_documento?: number;
  id_expediente?: number;
  id_medicamento?: number;
  medicamento?: string;
  via_administracion?: ViaAdministracion;
  activo?: boolean;
  dispensado?: boolean;
  fecha_desde?: string;
  fecha_hasta?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  id_medico?: number;
  medico_prescriptor?: number;
  nombre_medicamento?: string;
  buscar?: string;
}
