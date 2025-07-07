// // // src/app/models/nota-evolucion.model.ts
// // import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// // // ==========================================
// // // INTERFACE NOTA EVOLUCIÓN (SEGÚN TU BD REAL - FORMATO SOAP)
// // // ==========================================
// // export interface NotaEvolucion extends BaseEntity, AuditInfo {
// //   id_nota_evolucion: number;
// //   id_documento: number;

// //   // Campos SOAP (coinciden exactamente con tu tabla PostgreSQL)
// //   subjetivo?: string; // Lo que reporta el paciente (S)
// //   objetivo?: string;  // Hallazgos de la exploración física (O)
// //   analisis?: string;  // Interpretación médica (A)
// //   plan?: string;      // Plan de tratamiento (P)

// //   // Campos calculados que vienen del backend
// //   id_expediente?: number;
// //   fecha_documento?: string;
// //   estado_documento?: string;
// //   numero_expediente?: string;
// //   paciente_nombre?: string;
// //   fecha_nacimiento?: string;
// //   sexo?: string;
// //   medico_nombre?: string;
// //   especialidad?: string;
// //   servicio_nombre?: string;
// //   dias_hospitalizacion?: number;
// // }

// // // ==========================================
// // // FILTROS PARA BÚSQUEDAS
// // // ==========================================
// // export interface NotaEvolucionFilters extends BaseFilters {
// //   page?: number;
// //   limit?: number;
// //   id_documento?: number;
// //   id_expediente?: number;
// //   fecha_inicio?: string;
// //   fecha_fin?: string;
// //   buscar?: string;
// //   medico_nombre?: string;
// // }

// // // ==========================================
// // // DTOS PARA CREACIÓN (SIMPLIFICADO SEGÚN TU BD)
// // // ==========================================
// // export interface CreateNotaEvolucionDto {
// //   id_documento: number; // Obligatorio

// //   // Campos SOAP - formato estándar médico (todos opcionales)
// //   subjetivo?: string;   // S: Lo que dice el paciente
// //   objetivo?: string;    // O: Lo que observa el médico
// //   analisis?: string;    // A: Assessment/Evaluación
// //   plan?: string;        // P: Plan de acción
// // }

// // // ==========================================
// // // DTOS PARA ACTUALIZACIÓN
// // // ==========================================
// // export interface UpdateNotaEvolucionDto extends Partial<CreateNotaEvolucionDto> {
// //   // Se actualiza por ID en la URL
// // }

// // // ==========================================
// // // INTERFACES PARA RESPUESTAS DE LISTADO
// // // ==========================================
// // export interface NotaEvolucionListResponse {
// //   data: NotaEvolucion[];
// //   pagination: {
// //     page: number;
// //     limit: number;
// //     total: number;
// //     totalPages: number;
// //     hasNext: boolean;
// //     hasPrev: boolean;
// //   };
// // }

// // // ==========================================
// // // VALIDACIONES
// // // ==========================================
// // export interface ValidacionNotaEvolucion {
// //   valido: boolean;
// //   errores: string[];
// //   advertencias: string[];
// //   campos_vacios: string[];
// // }

// // // ==========================================
// // // CONSTANTES ÚTILES
// // // ==========================================
// // export const CAMPOS_OBLIGATORIOS_EVOLUCION = [
// //   'id_documento'
// // ];

// // export const CAMPOS_SOAP = [
// //   'subjetivo',
// //   'objetivo',
// //   'analisis',
// //   'plan'
// // ];

// // // ==========================================
// // // TIPOS PARA OPCIONES
// // // ==========================================
// // export type CampoSOAP = 'subjetivo' | 'objetivo' | 'analisis' | 'plan';

// // // ==========================================
// // // PLANTILLAS SOAP
// // // ==========================================
// // export interface PlantillaSOAP {
// //   id: string;
// //   nombre: string;
// //   descripcion: string;
// //   subjetivo_template?: string;
// //   objetivo_template?: string;
// //   analisis_template?: string;
// //   plan_template?: string;
// // }

// // export const PLANTILLAS_SOAP: PlantillaSOAP[] = [
// //   {
// //     id: 'general',
// //     nombre: 'Evolución General',
// //     descripcion: 'Template básico para evolución médica',
// //     subjetivo_template: 'Paciente refiere...',
// //     objetivo_template: 'Signos vitales: TA ___ FC ___ FR ___ Temp ___\nExploración física:',
// //     analisis_template: 'Evolución clínica:\nImpresión diagnóstica:',
// //     plan_template: 'Plan de manejo:\n1. Continuar tratamiento...\n2. Vigilar...'
// //   },
// //   {
// //     id: 'postoperatorio',
// //     nombre: 'Evolución Postoperatoria',
// //     descripcion: 'Template para seguimiento postoperatorio',
// //     subjetivo_template: 'Paciente se encuentra en ____ día postoperatorio\nRefiere:',
// //     objetivo_template: 'Signos vitales estables\nHerida quirúrgica:',
// //     analisis_template: 'Evolución postoperatoria satisfactoria/complicada',
// //     plan_template: 'Continuar analgesia\nMobilización progresiva\nValorar egreso'
// //   },
// //   {
// //     id: 'pediatrica',
// //     nombre: 'Evolución Pediátrica',
// //     descripcion: 'Template para pacientes pediátricos',
// //     subjetivo_template: 'Familiar refiere que el paciente...',
// //     objetivo_template: 'Peso: ___ kg Talla: ___ cm\nSignos vitales apropiados para la edad',
// //     analisis_template: 'Paciente pediátrico con evolución...',
// //     plan_template: 'Continuar esquema pediátrico\nValoración por familiar'
// //   }
// // ];

// // // ==========================================
// // // MÉTODOS DE UTILIDAD
// // // ==========================================
// // export class NotaEvolucionUtils {

// //   static validarCamposSOAP(nota: CreateNotaEvolucionDto): ValidacionNotaEvolucion {
// //     const errores: string[] = [];
// //     const advertencias: string[] = [];
// //     const camposVacios: string[] = [];

// //     // Validar campo obligatorio
// //     if (!nota.id_documento) {
// //       errores.push('El ID del documento es obligatorio');
// //     }

// //     // Verificar campos SOAP vacíos
// //     CAMPOS_SOAP.forEach(campo => {
// //       const valor = nota[campo as CampoSOAP];
// //       if (!valor || valor.trim() === '') {
// //         camposVacios.push(campo);
// //       }
// //     });

// //     // Advertencias si faltan campos importantes
// //     if (camposVacios.includes('subjetivo')) {
// //       advertencias.push('Se recomienda registrar los síntomas que refiere el paciente');
// //     }

// //     if (camposVacios.includes('objetivo')) {
// //       advertencias.push('Se recomienda registrar los hallazgos de exploración física');
// //     }

// //     if (camposVacios.includes('plan')) {
// //       advertencias.push('Se recomienda especificar el plan de tratamiento');
// //     }

// //     return {
// //       valido: errores.length === 0,
// //       errores,
// //       advertencias,
// //       campos_vacios: camposVacios
// //     };
// //   }

// //   static generarPlantillaVacia(): CreateNotaEvolucionDto {
// //     return {
// //       id_documento: 0,
// //       subjetivo: '',
// //       objetivo: '',
// //       analisis: '',
// //       plan: ''
// //     };
// //   }

// //   static aplicarPlantilla(plantillaId: string): Partial<CreateNotaEvolucionDto> {
// //     const plantilla = PLANTILLAS_SOAP.find(p => p.id === plantillaId);
// //     if (!plantilla) {
// //       return {};
// //     }

// //     return {
// //       subjetivo: plantilla.subjetivo_template || '',
// //       objetivo: plantilla.objetivo_template || '',
// //       analisis: plantilla.analisis_template || '',
// //       plan: plantilla.plan_template || ''
// //     };
// //   }

// //   static formatearSOAP(nota: NotaEvolucion): string {
// //     const partes: string[] = [];

// //     if (nota.subjetivo) {
// //       partes.push(`S (Subjetivo): ${nota.subjetivo}`);
// //     }

// //     if (nota.objetivo) {
// //       partes.push(`O (Objetivo): ${nota.objetivo}`);
// //     }

// //     if (nota.analisis) {
// //       partes.push(`A (Análisis): ${nota.analisis}`);
// //     }

// //     if (nota.plan) {
// //       partes.push(`P (Plan): ${nota.plan}`);
// //     }

// //     return partes.join('\n\n');
// //   }
// // }
// // src/app/models/nota-evolucion.model.ts - CORREGIDO SEGÚN BD REAL
// import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// // ==========================================
// // INTERFACE NOTA EVOLUCIÓN REAL (SEGÚN TU BD POSTGRESQL)
// // ==========================================
// export interface NotaEvolucion extends BaseEntity, AuditInfo {
//   id_nota_evolucion: number;
//   id_documento: number;

//   // Datos de hospitalización
//   dias_hospitalizacion?: number;
//   fecha_ultimo_ingreso?: string;

//   // Signos vitales actuales
//   temperatura?: number;
//   frecuencia_cardiaca?: number;
//   frecuencia_respiratoria?: number;
//   presion_arterial_sistolica?: number;
//   presion_arterial_diastolica?: number;
//   saturacion_oxigeno?: number;
//   peso_actual?: number;
//   talla_actual?: number;

//   // Campos obligatorios de exploración
//   sintomas_signos: string;
//   habitus_exterior: string;
//   estado_nutricional: string;
//   estudios_laboratorio_gabinete: string;
//   evolucion_analisis: string;
//   diagnosticos: string;
//   plan_estudios_tratamiento: string;
//   pronostico: string;

//   // Exploración física detallada (opcional)
//   exploracion_cabeza?: string;
//   exploracion_cuello?: string;
//   exploracion_torax?: string;
//   exploracion_abdomen?: string;
//   exploracion_extremidades?: string;
//   exploracion_columna?: string;
//   exploracion_genitales?: string;
//   exploracion_neurologico?: string;

//   // Campos adicionales
//   diagnosticos_guias?: string;
//   interconsultas?: string;
//   indicaciones_medicas?: string;
//   fecha_elaboracion?: string;
//   observaciones_adicionales?: string;

//   // Campos calculados del backend
//   id_expediente?: number;
//   fecha_documento?: string;
//   estado_documento?: string;
//   numero_expediente?: string;
//   paciente_nombre?: string;
//   fecha_nacimiento?: string;
//   sexo?: string;
//   medico_nombre?: string;
//   especialidad?: string;
//   servicio_nombre?: string;
// }

// // ==========================================
// // FILTROS PARA BÚSQUEDAS
// // ==========================================
// export interface NotaEvolucionFilters extends BaseFilters {
//   page?: number;
//   limit?: number;
//   id_documento?: number;
//   id_expediente?: number;
//   fecha_inicio?: string;
//   fecha_fin?: string;
//   buscar?: string;
//   medico_nombre?: string;
// }

// // ==========================================
// // DTO PARA CREACIÓN (SEGÚN ESTRUCTURA REAL)
// // ==========================================
// export interface CreateNotaEvolucionDto {
//   id_documento: number; // Obligatorio

//   // Datos de hospitalización (opcionales)
//   dias_hospitalizacion?: number;
//   fecha_ultimo_ingreso?: string;

//   // Signos vitales (opcionales)
//   temperatura?: number;
//   frecuencia_cardiaca?: number;
//   frecuencia_respiratoria?: number;
//   presion_arterial_sistolica?: number;
//   presion_arterial_diastolica?: number;
//   saturacion_oxigeno?: number;
//   peso_actual?: number;
//   talla_actual?: number;

//   // Campos obligatorios de la nota
//   sintomas_signos: string;
//   habitus_exterior: string;
//   estado_nutricional: string;
//   estudios_laboratorio_gabinete: string;
//   evolucion_analisis: string;
//   diagnosticos: string;
//   plan_estudios_tratamiento: string;
//   pronostico: string;

//   // Exploración física (opcional)
//   exploracion_cabeza?: string;
//   exploracion_cuello?: string;
//   exploracion_torax?: string;
//   exploracion_abdomen?: string;
//   exploracion_extremidades?: string;
//   exploracion_columna?: string;
//   exploracion_genitales?: string;
//   exploracion_neurologico?: string;

//   // Campos adicionales (opcionales)
//   diagnosticos_guias?: string;
//   interconsultas?: string;
//   indicaciones_medicas?: string;
//   observaciones_adicionales?: string;
// }

// // ==========================================
// // DTO PARA ACTUALIZACIÓN
// // ==========================================
// export interface UpdateNotaEvolucionDto extends Partial<CreateNotaEvolucionDto> {
//   // Se actualiza por ID en la URL
// }

// // ==========================================
// // INTERFACES PARA RESPUESTAS DE LISTADO
// // ==========================================
// export interface NotaEvolucionListResponse {
//   data: NotaEvolucion[];
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//     hasNext: boolean;
//     hasPrev: boolean;
//   };
// }

// // ==========================================
// // CAMPOS OBLIGATORIOS SEGÚN BD REAL
// // ==========================================
// export const CAMPOS_OBLIGATORIOS_EVOLUCION = [
//   'id_documento',
//   'sintomas_signos',
//   'habitus_exterior',
//   'estado_nutricional',
//   'estudios_laboratorio_gabinete',
//   'evolucion_analisis',
//   'diagnosticos',
//   'plan_estudios_tratamiento',
//   'pronostico'
// ];

// // ==========================================
// // CAMPOS DE EXPLORACIÓN FÍSICA
// // ==========================================
// export const CAMPOS_EXPLORACION_FISICA = [
//   'exploracion_cabeza',
//   'exploracion_cuello',
//   'exploracion_torax',
//   'exploracion_abdomen',
//   'exploracion_extremidades',
//   'exploracion_columna',
//   'exploracion_genitales',
//   'exploracion_neurologico'
// ];

// // ==========================================
// // CAMPOS DE SIGNOS VITALES
// // ==========================================
// export const CAMPOS_SIGNOS_VITALES = [
//   'temperatura',
//   'frecuencia_cardiaca',
//   'frecuencia_respiratoria',
//   'presion_arterial_sistolica',
//   'presion_arterial_diastolica',
//   'saturacion_oxigeno',
//   'peso_actual',
//   'talla_actual'
// ];

// // ==========================================
// // VALIDACIONES
// // ==========================================
// export interface ValidacionNotaEvolucion {
//   valido: boolean;
//   errores: string[];
//   advertencias: string[];
//   campos_vacios: string[];
// }

// // ==========================================
// // PLANTILLAS PARA NOTA DE EVOLUCIÓN
// // ==========================================
// export interface PlantillaEvolucion {
//   id: string;
//   nombre: string;
//   descripcion: string;
//   especialidad?: string;
//   template_sintomas?: string;
//   template_habitus?: string;
//   template_estudios?: string;
//   template_analisis?: string;
//   template_diagnosticos?: string;
//   template_plan?: string;
//   template_pronostico?: string;
// }

// export const PLANTILLAS_EVOLUCION: PlantillaEvolucion[] = [
//   {
//     id: 'general',
//     nombre: 'Evolución General',
//     descripcion: 'Template básico para evolución médica',
//     template_sintomas: 'Paciente se encuentra tranquilo(a), con...',
//     template_habitus: 'Paciente en condiciones generales...',
//     template_estudios: 'Laboratorios pendientes/Estudios de gabinete...',
//     template_analisis: 'Evolución postoperatoria satisfactoria...',
//     template_diagnosticos: 'Postoperatorio de...',
//     template_plan: 'Continuar analgesia, movilización...',
//     template_pronostico: 'Favorable para la vida...'
//   }
// ];

// // ==========================================
// // MÉTODOS DE UTILIDAD
// // ==========================================
// export class NotaEvolucionUtils {

//   static validarCamposObligatorios(nota: CreateNotaEvolucionDto): ValidacionNotaEvolucion {
//     const errores: string[] = [];
//     const advertencias: string[] = [];
//     const camposVacios: string[] = [];

//     // Validar campo obligatorio principal
//     if (!nota.id_documento) {
//       errores.push('El ID del documento es obligatorio');
//     }

//     // Verificar campos obligatorios según tu BD
//     CAMPOS_OBLIGATORIOS_EVOLUCION.forEach(campo => {
//       if (campo === 'id_documento') return; // Ya validado arriba

//       const valor = nota[campo as keyof CreateNotaEvolucionDto];
//       if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
//         errores.push(`El campo ${campo.replace('_', ' ')} es obligatorio`);
//         camposVacios.push(campo);
//       }
//     });

//     // Verificar campos opcionales importantes vacíos
//     CAMPOS_SIGNOS_VITALES.forEach(campo => {
//       const valor = nota[campo as keyof CreateNotaEvolucionDto];
//       if (!valor) {
//         camposVacios.push(campo);
//       }
//     });

//     // Advertencias médicas importantes
//     if (!nota.temperatura) {
//       advertencias.push('Se recomienda registrar la temperatura del paciente');
//     }

//     if (!nota.frecuencia_cardiaca || !nota.frecuencia_respiratoria) {
//       advertencias.push('Se recomienda registrar signos vitales completos');
//     }

//     if (!nota.interconsultas || nota.interconsultas.trim() === '') {
//       advertencias.push('Considere si se requieren interconsultas');
//     }

//     return {
//       valido: errores.length === 0,
//       errores,
//       advertencias,
//       campos_vacios: camposVacios
//     };
//   }

//   static generarPlantillaVacia(): CreateNotaEvolucionDto {
//     return {
//       id_documento: 0,
//       // Campos obligatorios con valores por defecto
//       sintomas_signos: '',
//       habitus_exterior: '',
//       estado_nutricional: '',
//       estudios_laboratorio_gabinete: '',
//       evolucion_analisis: '',
//       diagnosticos: '',
//       plan_estudios_tratamiento: '',
//       pronostico: '',
//       // Campos opcionales
//       dias_hospitalizacion: undefined,
//       fecha_ultimo_ingreso: undefined,
//       temperatura: undefined,
//       frecuencia_cardiaca: undefined,
//       frecuencia_respiratoria: undefined,
//       presion_arterial_sistolica: undefined,
//       presion_arterial_diastolica: undefined,
//       saturacion_oxigeno: undefined,
//       peso_actual: undefined,
//       talla_actual: undefined,
//       exploracion_cabeza: '',
//       exploracion_cuello: '',
//       exploracion_torax: '',
//       exploracion_abdomen: '',
//       exploracion_extremidades: '',
//       exploracion_columna: '',
//       exploracion_genitales: '',
//       exploracion_neurologico: '',
//       diagnosticos_guias: '',
//       interconsultas: 'No se solicitaron interconsultas en esta evolución',
//       indicaciones_medicas: '',
//       observaciones_adicionales: ''
//     };
//   }

//   static aplicarPlantilla(plantillaId: string): Partial<CreateNotaEvolucionDto> {
//     const plantilla = PLANTILLAS_EVOLUCION.find(p => p.id === plantillaId);
//     if (!plantilla) {
//       return {};
//     }

//     return {
//       sintomas_signos: plantilla.template_sintomas || '',
//       habitus_exterior: plantilla.template_habitus || '',
//       estudios_laboratorio_gabinete: plantilla.template_estudios || '',
//       evolucion_analisis: plantilla.template_analisis || '',
//       diagnosticos: plantilla.template_diagnosticos || '',
//       plan_estudios_tratamiento: plantilla.template_plan || '',
//       pronostico: plantilla.template_pronostico || ''
//     };
//   }

//   static formatearNotaCompleta(nota: NotaEvolucion): string {
//     const partes: string[] = [];

//     // Datos básicos del paciente
//     if (nota.paciente_nombre) {
//       partes.push(`PACIENTE: ${nota.paciente_nombre}`);
//     }

//     if (nota.numero_expediente) {
//       partes.push(`EXPEDIENTE: ${nota.numero_expediente}`);
//     }

//     // Días de hospitalización
//     if (nota.dias_hospitalizacion) {
//       partes.push(`DÍAS DE ESTANCIA: ${nota.dias_hospitalizacion} días`);
//     }

//     // Signos vitales
//     if (nota.temperatura || nota.frecuencia_cardiaca || nota.frecuencia_respiratoria) {
//       let signos = 'SIGNOS VITALES: ';
//       const vitales = [];
//       if (nota.temperatura) vitales.push(`Temp: ${nota.temperatura}°C`);
//       if (nota.frecuencia_cardiaca) vitales.push(`FC: ${nota.frecuencia_cardiaca} lpm`);
//       if (nota.frecuencia_respiratoria) vitales.push(`FR: ${nota.frecuencia_respiratoria} rpm`);
//       if (nota.presion_arterial_sistolica && nota.presion_arterial_diastolica) {
//         vitales.push(`TA: ${nota.presion_arterial_sistolica}/${nota.presion_arterial_diastolica} mmHg`);
//       }
//       if (nota.saturacion_oxigeno) vitales.push(`SatO2: ${nota.saturacion_oxigeno}%`);
//       signos += vitales.join(', ');
//       partes.push(signos);
//     }

//     // Síntomas y signos
//     if (nota.sintomas_signos) {
//       partes.push(`SÍNTOMAS Y SIGNOS: ${nota.sintomas_signos}`);
//     }

//     // Exploración física
//     partes.push('EXPLORACIÓN FÍSICA:');
//     if (nota.habitus_exterior) {
//       partes.push(`  Habitus exterior: ${nota.habitus_exterior}`);
//     }

//     const exploraciones = [
//       { campo: nota.exploracion_cabeza, label: 'Cabeza' },
//       { campo: nota.exploracion_cuello, label: 'Cuello' },
//       { campo: nota.exploracion_torax, label: 'Tórax' },
//       { campo: nota.exploracion_abdomen, label: 'Abdomen' },
//       { campo: nota.exploracion_extremidades, label: 'Extremidades' },
//       { campo: nota.exploracion_columna, label: 'Columna' },
//       { campo: nota.exploracion_genitales, label: 'Genitales' },
//       { campo: nota.exploracion_neurologico, label: 'Neurológico' }
//     ];

//     exploraciones.forEach(exp => {
//       if (exp.campo && exp.campo.trim()) {
//         partes.push(`  ${exp.label}: ${exp.campo}`);
//       }
//     });

//     // Estado nutricional
//     if (nota.estado_nutricional) {
//       partes.push(`ESTADO NUTRICIONAL: ${nota.estado_nutricional}`);
//     }

//     // Estudios
//     if (nota.estudios_laboratorio_gabinete) {
//       partes.push(`ESTUDIOS DE LABORATORIO Y GABINETE: ${nota.estudios_laboratorio_gabinete}`);
//     }

//     // Evolución y análisis
//     if (nota.evolucion_analisis) {
//       partes.push(`EVOLUCIÓN Y ANÁLISIS: ${nota.evolucion_analisis}`);
//     }

//     // Diagnósticos
//     if (nota.diagnosticos) {
//       partes.push(`DIAGNÓSTICOS: ${nota.diagnosticos}`);
//     }

//     if (nota.diagnosticos_guias) {
//       partes.push(`DIAGNÓSTICOS SEGÚN GUÍAS: ${nota.diagnosticos_guias}`);
//     }

//     // Plan de tratamiento
//     if (nota.plan_estudios_tratamiento) {
//       partes.push(`PLAN DE ESTUDIOS Y TRATAMIENTO: ${nota.plan_estudios_tratamiento}`);
//     }

//     // Interconsultas
//     if (nota.interconsultas) {
//       partes.push(`INTERCONSULTAS: ${nota.interconsultas}`);
//     }

//     // Pronóstico
//     if (nota.pronostico) {
//       partes.push(`PRONÓSTICO: ${nota.pronostico}`);
//     }

//     // Indicaciones médicas
//     if (nota.indicaciones_medicas) {
//       partes.push(`INDICACIONES MÉDICAS: ${nota.indicaciones_medicas}`);
//     }

//     // Observaciones adicionales
//     if (nota.observaciones_adicionales) {
//       partes.push(`OBSERVACIONES: ${nota.observaciones_adicionales}`);
//     }

//     return partes.join('\n\n');
//   }

//   static calcularIMC(peso?: number, talla?: number): number | null {
//     if (!peso || !talla || talla === 0) return null;
//     const tallaMts = talla > 10 ? talla / 100 : talla; // Convertir cm a metros si es necesario
//     return parseFloat((peso / (tallaMts * tallaMts)).toFixed(2));
//   }

//   static interpretarIMC(imc: number, edad?: number): string {
//     if (!imc) return '';

//     // Para adultos (>= 18 años)
//     if (!edad || edad >= 18) {
//       if (imc < 18.5) return 'Bajo peso';
//       if (imc >= 18.5 && imc < 25) return 'Peso normal';
//       if (imc >= 25 && imc < 30) return 'Sobrepeso';
//       if (imc >= 30) return 'Obesidad';
//     }

//     // Para pediatría se necesitarían percentiles específicos
//     return 'Requiere evaluación pediátrica con percentiles';
//   }
// }

// // ==========================================
// // TIPOS PARA FORMULARIOS
// // ==========================================
// export type CampoEvolucion = keyof CreateNotaEvolucionDto;
// export type SeccionFormulario = 'datos_basicos' | 'signos_vitales' | 'exploracion' | 'analisis' | 'plan';

// // ==========================================
// // CONFIGURACIÓN DE SECCIONES DEL FORMULARIO
// // ==========================================
// export interface SeccionFormularioConfig {
//   id: SeccionFormulario;
//   titulo: string;
//   descripcion: string;
//   campos: CampoEvolucion[];
//   obligatorio: boolean;
//   icono?: string;
// }

// export const SECCIONES_FORMULARIO: SeccionFormularioConfig[] = [
//   {
//     id: 'datos_basicos',
//     titulo: 'Datos Básicos',
//     descripcion: 'Información general de la evolución',
//     campos: ['id_documento', 'dias_hospitalizacion', 'fecha_ultimo_ingreso'],
//     obligatorio: true,
//     icono: 'user'
//   },
//   {
//     id: 'signos_vitales',
//     titulo: 'Signos Vitales',
//     descripcion: 'Constantes vitales del paciente',
//     campos: ['temperatura', 'frecuencia_cardiaca', 'frecuencia_respiratoria', 'presion_arterial_sistolica', 'presion_arterial_diastolica', 'saturacion_oxigeno', 'peso_actual', 'talla_actual'],
//     obligatorio: false,
//     icono: 'activity'
//   },
//   {
//     id: 'exploracion',
//     titulo: 'Exploración Física',
//     descripcion: 'Hallazgos de la exploración física',
//     campos: ['sintomas_signos', 'habitus_exterior', 'exploracion_cabeza', 'exploracion_cuello', 'exploracion_torax', 'exploracion_abdomen', 'exploracion_extremidades', 'exploracion_columna', 'exploracion_genitales', 'exploracion_neurologico', 'estado_nutricional'],
//     obligatorio: true,
//     icono: 'search'
//   },
//   {
//     id: 'analisis',
//     titulo: 'Análisis y Diagnóstico',
//     descripcion: 'Estudios, evolución y diagnósticos',
//     campos: ['estudios_laboratorio_gabinete', 'evolucion_analisis', 'diagnosticos', 'diagnosticos_guias'],
//     obligatorio: true,
//     icono: 'clipboard'
//   },
//   {
//     id: 'plan',
//     titulo: 'Plan y Pronóstico',
//     descripcion: 'Plan terapéutico y pronóstico',
//     campos: ['plan_estudios_tratamiento', 'interconsultas', 'pronostico', 'indicaciones_medicas', 'observaciones_adicionales'],
//     obligatorio: true,
//     icono: 'calendar'
//   }
// ];'Paciente con evolución clínica...',
//     template_diagnosticos: 'Diagnóstico principal: ...',
//     template_plan: 'Continuar manejo actual...',
//     template_pronostico: 'Favorable para la vida...'
//   },
//   {
//     id: 'pediatrica',
//     nombre: 'Evolución Pediátrica',
//     descripcion: 'Template para pacientes pediátricos',
//     especialidad: 'Pediatría',
//     template_sintomas: 'Paciente pediátrico se encuentra...',
//     template_habitus: 'Menor en condiciones generales...',
//     template_estudios: 'Paraclínicos acordes a edad...',
//     template_analisis: 'Menor con evolución...',
//     template_diagnosticos: 'Diagnóstico pediátrico...',
//     template_plan: 'Continuar esquema pediátrico...',
//     template_pronostico: 'Favorable para la vida y función...'
//   },
//   {
//     id: 'postoperatorio',
//     nombre: 'Evolución Postoperatoria',
//     descripcion: 'Template para seguimiento postoperatorio',
//     template_sintomas: 'Paciente en postoperatorio de...',
//     template_habitus: 'Paciente postquirúrgico en condiciones...',
//     template_estudios: 'Controles postoperatorios...',
//     template_analisis: 'Evolución postoperatoria satisfactoria...',
//    template_diagnosticos: 'Postoperatorio de...',
//    template_plan: 'Continuar analgesia, movilización...',
//    template_pronostico: 'Favorable para la vida...'
//  }
// ];

// src/app/models/nota-evolucion.model.ts - CORREGIDO SEGÚN BD REAL
import { BaseEntity, AuditInfo, BaseFilters } from './base.models';

// ==========================================
// INTERFACE NOTA EVOLUCIÓN REAL (SEGÚN TU BD POSTGRESQL)
// ==========================================
export interface NotaEvolucion extends BaseEntity, AuditInfo {
  id_nota_evolucion: number;
  id_documento: number;

  // Datos de hospitalización
  dias_hospitalizacion?: number;
  fecha_ultimo_ingreso?: string;

  // Signos vitales actuales
  temperatura?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  presion_arterial_sistolica?: number;
  presion_arterial_diastolica?: number;
  saturacion_oxigeno?: number;
  peso_actual?: number;
  talla_actual?: number;

  // Campos obligatorios de exploración
  sintomas_signos: string;
  habitus_exterior: string;
  estado_nutricional: string;
  estudios_laboratorio_gabinete: string;
  evolucion_analisis: string;
  diagnosticos: string;
  plan_estudios_tratamiento: string;
  pronostico: string;

  // Exploración física detallada (opcional)
  exploracion_cabeza?: string;
  exploracion_cuello?: string;
  exploracion_torax?: string;
  exploracion_abdomen?: string;
  exploracion_extremidades?: string;
  exploracion_columna?: string;
  exploracion_genitales?: string;
  exploracion_neurologico?: string;

  // Campos adicionales
  diagnosticos_guias?: string;
  interconsultas?: string;
  indicaciones_medicas?: string;
  fecha_elaboracion?: string;
  observaciones_adicionales?: string;

  // Campos calculados del backend
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
// DTO PARA CREACIÓN (SEGÚN ESTRUCTURA REAL)
// ==========================================
export interface CreateNotaEvolucionDto {
  id_documento: number; // Obligatorio

  // Datos de hospitalización (opcionales)
  dias_hospitalizacion?: number;
  fecha_ultimo_ingreso?: string;

  // Signos vitales (opcionales)
  temperatura?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  presion_arterial_sistolica?: number;
  presion_arterial_diastolica?: number;
  saturacion_oxigeno?: number;
  peso_actual?: number;
  talla_actual?: number;

  // Campos obligatorios de la nota
  sintomas_signos: string;
  habitus_exterior: string;
  estado_nutricional: string;
  estudios_laboratorio_gabinete: string;
  evolucion_analisis: string;
  diagnosticos: string;
  plan_estudios_tratamiento: string;
  pronostico: string;

  // Exploración física (opcional)
  exploracion_cabeza?: string;
  exploracion_cuello?: string;
  exploracion_torax?: string;
  exploracion_abdomen?: string;
  exploracion_extremidades?: string;
  exploracion_columna?: string;
  exploracion_genitales?: string;
  exploracion_neurologico?: string;

  // Campos adicionales (opcionales)
  diagnosticos_guias?: string;
  interconsultas?: string;
  indicaciones_medicas?: string;
  observaciones_adicionales?: string;
}

// ==========================================
// DTO PARA ACTUALIZACIÓN
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
// CAMPOS OBLIGATORIOS SEGÚN BD REAL
// ==========================================
export const CAMPOS_OBLIGATORIOS_EVOLUCION = [
  'id_documento',
  'sintomas_signos',
  'habitus_exterior',
  'estado_nutricional',
  'estudios_laboratorio_gabinete',
  'evolucion_analisis',
  'diagnosticos',
  'plan_estudios_tratamiento',
  'pronostico'
];

// ==========================================
// CAMPOS DE EXPLORACIÓN FÍSICA
// ==========================================
export const CAMPOS_EXPLORACION_FISICA = [
  'exploracion_cabeza',
  'exploracion_cuello',
  'exploracion_torax',
  'exploracion_abdomen',
  'exploracion_extremidades',
  'exploracion_columna',
  'exploracion_genitales',
  'exploracion_neurologico'
];

// ==========================================
// CAMPOS DE SIGNOS VITALES
// ==========================================
export const CAMPOS_SIGNOS_VITALES = [
  'temperatura',
  'frecuencia_cardiaca',
  'frecuencia_respiratoria',
  'presion_arterial_sistolica',
  'presion_arterial_diastolica',
  'saturacion_oxigeno',
  'peso_actual',
  'talla_actual'
];

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
// PLANTILLAS PARA NOTA DE EVOLUCIÓN
// ==========================================
export interface PlantillaEvolucion {
  id: string;
  nombre: string;
  descripcion: string;
  especialidad?: string;
  template_sintomas?: string;
  template_habitus?: string;
  template_estudios?: string;
  template_analisis?: string;
  template_diagnosticos?: string;
  template_plan?: string;
  template_pronostico?: string;
}

export const PLANTILLAS_EVOLUCION: PlantillaEvolucion[] = [
  {
    id: 'general',
    nombre: 'Evolución General',
    descripcion: 'Template básico para evolución médica',
    template_sintomas: 'Paciente se encuentra tranquilo(a), con...',
    template_habitus: 'Paciente en condiciones generales...',
    template_estudios: 'Laboratorios pendientes/Estudios de gabinete...',
    template_analisis: 'Paciente con evolución clínica...',
    template_diagnosticos: 'Diagnóstico principal: ...',
    template_plan: 'Continuar manejo actual...',
    template_pronostico: 'Favorable para la vida...'
  },
  {
    id: 'pediatrica',
    nombre: 'Evolución Pediátrica',
    descripcion: 'Template para pacientes pediátricos',
    especialidad: 'Pediatría',
    template_sintomas: 'Paciente pediátrico se encuentra...',
    template_habitus: 'Menor en condiciones generales...',
    template_estudios: 'Paraclínicos acordes a edad...',
    template_analisis: 'Menor con evolución...',
    template_diagnosticos: 'Diagnóstico pediátrico...',
    template_plan: 'Continuar esquema pediátrico...',
    template_pronostico: 'Favorable para la vida y función...'
  },
  {
    id: 'postoperatorio',
    nombre: 'Evolución Postoperatoria',
    descripcion: 'Template para seguimiento postoperatorio',
    template_sintomas: 'Paciente en postoperatorio de...',
    template_habitus: 'Paciente postquirúrgico en condiciones...',
    template_estudios: 'Controles postoperatorios...',
    template_analisis: 'Evolución postoperatoria satisfactoria...',
    template_diagnosticos: 'Postoperatorio de...',
    template_plan: 'Continuar analgesia, movilización...',
    template_pronostico: 'Favorable para la vida...'
  }
];

// ==========================================
// MÉTODOS DE UTILIDAD
// ==========================================
export class NotaEvolucionUtils {

  static validarCamposObligatorios(nota: CreateNotaEvolucionDto): ValidacionNotaEvolucion {
    const errores: string[] = [];
    const advertencias: string[] = [];
    const camposVacios: string[] = [];

    // Validar campo obligatorio principal
    if (!nota.id_documento) {
      errores.push('El ID del documento es obligatorio');
    }

    // Verificar campos obligatorios según tu BD
    CAMPOS_OBLIGATORIOS_EVOLUCION.forEach(campo => {
      if (campo === 'id_documento') return; // Ya validado arriba

      const valor = nota[campo as keyof CreateNotaEvolucionDto];
      if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
        errores.push(`El campo ${campo.replace('_', ' ')} es obligatorio`);
        camposVacios.push(campo);
      }
    });

    // Verificar campos opcionales importantes vacíos
    CAMPOS_SIGNOS_VITALES.forEach(campo => {
      const valor = nota[campo as keyof CreateNotaEvolucionDto];
      if (!valor) {
        camposVacios.push(campo);
      }
    });

    // Advertencias médicas importantes
    if (!nota.temperatura) {
      advertencias.push('Se recomienda registrar la temperatura del paciente');
    }

    if (!nota.frecuencia_cardiaca || !nota.frecuencia_respiratoria) {
      advertencias.push('Se recomienda registrar signos vitales completos');
    }

    if (!nota.interconsultas || nota.interconsultas.trim() === '') {
      advertencias.push('Considere si se requieren interconsultas');
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
      // Campos obligatorios con valores por defecto
      sintomas_signos: '',
      habitus_exterior: '',
      estado_nutricional: '',
      estudios_laboratorio_gabinete: '',
      evolucion_analisis: '',
      diagnosticos: '',
      plan_estudios_tratamiento: '',
      pronostico: '',
      // Campos opcionales
      dias_hospitalizacion: undefined,
      fecha_ultimo_ingreso: undefined,
      temperatura: undefined,
      frecuencia_cardiaca: undefined,
      frecuencia_respiratoria: undefined,
      presion_arterial_sistolica: undefined,
      presion_arterial_diastolica: undefined,
      saturacion_oxigeno: undefined,
      peso_actual: undefined,
      talla_actual: undefined,
      exploracion_cabeza: '',
      exploracion_cuello: '',
      exploracion_torax: '',
      exploracion_abdomen: '',
      exploracion_extremidades: '',
      exploracion_columna: '',
      exploracion_genitales: '',
      exploracion_neurologico: '',
      diagnosticos_guias: '',
      interconsultas: 'No se solicitaron interconsultas en esta evolución',
      indicaciones_medicas: '',
      observaciones_adicionales: ''
    };
  }

  static aplicarPlantilla(plantillaId: string): Partial<CreateNotaEvolucionDto> {
    const plantilla = PLANTILLAS_EVOLUCION.find(p => p.id === plantillaId);
    if (!plantilla) {
      return {};
    }

    return {
      sintomas_signos: plantilla.template_sintomas || '',
      habitus_exterior: plantilla.template_habitus || '',
      estudios_laboratorio_gabinete: plantilla.template_estudios || '',
      evolucion_analisis: plantilla.template_analisis || '',
      diagnosticos: plantilla.template_diagnosticos || '',
      plan_estudios_tratamiento: plantilla.template_plan || '',
      pronostico: plantilla.template_pronostico || ''
    };
  }

  static formatearNotaCompleta(nota: NotaEvolucion): string {
    const partes: string[] = [];

    // Datos básicos del paciente
    if (nota.paciente_nombre) {
      partes.push(`PACIENTE: ${nota.paciente_nombre}`);
    }

    if (nota.numero_expediente) {
      partes.push(`EXPEDIENTE: ${nota.numero_expediente}`);
    }

    // Días de hospitalización
    if (nota.dias_hospitalizacion) {
      partes.push(`DÍAS DE ESTANCIA: ${nota.dias_hospitalizacion} días`);
    }

    // Signos vitales
    if (nota.temperatura || nota.frecuencia_cardiaca || nota.frecuencia_respiratoria) {
      let signos = 'SIGNOS VITALES: ';
      const vitales = [];
      if (nota.temperatura) vitales.push(`Temp: ${nota.temperatura}°C`);
      if (nota.frecuencia_cardiaca) vitales.push(`FC: ${nota.frecuencia_cardiaca} lpm`);
      if (nota.frecuencia_respiratoria) vitales.push(`FR: ${nota.frecuencia_respiratoria} rpm`);
      if (nota.presion_arterial_sistolica && nota.presion_arterial_diastolica) {
        vitales.push(`TA: ${nota.presion_arterial_sistolica}/${nota.presion_arterial_diastolica} mmHg`);
      }
      if (nota.saturacion_oxigeno) vitales.push(`SatO2: ${nota.saturacion_oxigeno}%`);
      signos += vitales.join(', ');
      partes.push(signos);
    }

    // Síntomas y signos
    if (nota.sintomas_signos) {
      partes.push(`SÍNTOMAS Y SIGNOS: ${nota.sintomas_signos}`);
    }

    // Exploración física
    partes.push('EXPLORACIÓN FÍSICA:');
    if (nota.habitus_exterior) {
      partes.push(`  Habitus exterior: ${nota.habitus_exterior}`);
    }

    const exploraciones = [
      { campo: nota.exploracion_cabeza, label: 'Cabeza' },
      { campo: nota.exploracion_cuello, label: 'Cuello' },
      { campo: nota.exploracion_torax, label: 'Tórax' },
      { campo: nota.exploracion_abdomen, label: 'Abdomen' },
      { campo: nota.exploracion_extremidades, label: 'Extremidades' },
      { campo: nota.exploracion_columna, label: 'Columna' },
      { campo: nota.exploracion_genitales, label: 'Genitales' },
      { campo: nota.exploracion_neurologico, label: 'Neurológico' }
    ];

    exploraciones.forEach(exp => {
      if (exp.campo && exp.campo.trim()) {
        partes.push(`  ${exp.label}: ${exp.campo}`);
      }
    });

    // Estado nutricional
    if (nota.estado_nutricional) {
      partes.push(`ESTADO NUTRICIONAL: ${nota.estado_nutricional}`);
    }

    // Estudios
    if (nota.estudios_laboratorio_gabinete) {
      partes.push(`ESTUDIOS DE LABORATORIO Y GABINETE: ${nota.estudios_laboratorio_gabinete}`);
    }

    // Evolución y análisis
    if (nota.evolucion_analisis) {
      partes.push(`EVOLUCIÓN Y ANÁLISIS: ${nota.evolucion_analisis}`);
    }

    // Diagnósticos
    if (nota.diagnosticos) {
      partes.push(`DIAGNÓSTICOS: ${nota.diagnosticos}`);
    }

    if (nota.diagnosticos_guias) {
      partes.push(`DIAGNÓSTICOS SEGÚN GUÍAS: ${nota.diagnosticos_guias}`);
    }

    // Plan de tratamiento
    if (nota.plan_estudios_tratamiento) {
      partes.push(`PLAN DE ESTUDIOS Y TRATAMIENTO: ${nota.plan_estudios_tratamiento}`);
    }

    // Interconsultas
    if (nota.interconsultas) {
      partes.push(`INTERCONSULTAS: ${nota.interconsultas}`);
    }

    // Pronóstico
    if (nota.pronostico) {
      partes.push(`PRONÓSTICO: ${nota.pronostico}`);
    }

    // Indicaciones médicas
    if (nota.indicaciones_medicas) {
      partes.push(`INDICACIONES MÉDICAS: ${nota.indicaciones_medicas}`);
    }

    // Observaciones adicionales
    if (nota.observaciones_adicionales) {
      partes.push(`OBSERVACIONES: ${nota.observaciones_adicionales}`);
    }

    return partes.join('\n\n');
  }

  static calcularIMC(peso?: number, talla?: number): number | null {
    if (!peso || !talla || talla === 0) return null;
    const tallaMts = talla > 10 ? talla / 100 : talla; // Convertir cm a metros si es necesario
    return parseFloat((peso / (tallaMts * tallaMts)).toFixed(2));
  }

  static interpretarIMC(imc: number, edad?: number): string {
    if (!imc) return '';

    // Para adultos (>= 18 años)
    if (!edad || edad >= 18) {
      if (imc < 18.5) return 'Bajo peso';
      if (imc >= 18.5 && imc < 25) return 'Peso normal';
      if (imc >= 25 && imc < 30) return 'Sobrepeso';
      if (imc >= 30) return 'Obesidad';
    }

    // Para pediatría se necesitarían percentiles específicos
    return 'Requiere evaluación pediátrica con percentiles';
  }
}

// ==========================================
// TIPOS PARA FORMULARIOS
// ==========================================
export type CampoEvolucion = keyof CreateNotaEvolucionDto;
export type SeccionFormulario = 'datos_basicos' | 'signos_vitales' | 'exploracion' | 'analisis' | 'plan';

// ==========================================
// CONFIGURACIÓN DE SECCIONES DEL FORMULARIO
// ==========================================
export interface SeccionFormularioConfig {
  id: SeccionFormulario;
  titulo: string;
  descripcion: string;
  campos: CampoEvolucion[];
  obligatorio: boolean;
  icono?: string;
}

export const SECCIONES_FORMULARIO: SeccionFormularioConfig[] = [
  {
    id: 'datos_basicos',
    titulo: 'Datos Básicos',
    descripcion: 'Información general de la evolución',
    campos: ['id_documento', 'dias_hospitalizacion', 'fecha_ultimo_ingreso'],
    obligatorio: true,
    icono: 'user'
  },
  {
    id: 'signos_vitales',
    titulo: 'Signos Vitales',
    descripcion: 'Constantes vitales del paciente',
    campos: ['temperatura', 'frecuencia_cardiaca', 'frecuencia_respiratoria', 'presion_arterial_sistolica', 'presion_arterial_diastolica', 'saturacion_oxigeno', 'peso_actual', 'talla_actual'],
    obligatorio: false,
    icono: 'activity'
  },
  {
    id: 'exploracion',
    titulo: 'Exploración Física',
    descripcion: 'Hallazgos de la exploración física',
    campos: ['sintomas_signos', 'habitus_exterior', 'exploracion_cabeza', 'exploracion_cuello', 'exploracion_torax', 'exploracion_abdomen', 'exploracion_extremidades', 'exploracion_columna', 'exploracion_genitales', 'exploracion_neurologico', 'estado_nutricional'],
    obligatorio: true,
    icono: 'search'
  },
  {
    id: 'analisis',
    titulo: 'Análisis y Diagnóstico',
    descripcion: 'Estudios, evolución y diagnósticos',
    campos: ['estudios_laboratorio_gabinete', 'evolucion_analisis', 'diagnosticos', 'diagnosticos_guias'],
    obligatorio: true,
    icono: 'clipboard'
  },
  {
    id: 'plan',
    titulo: 'Plan y Pronóstico',
    descripcion: 'Plan terapéutico y pronóstico',
    campos: ['plan_estudios_tratamiento', 'interconsultas', 'pronostico', 'indicaciones_medicas', 'observaciones_adicionales'],
    obligatorio: true,
    icono: 'calendar'
  }
];
