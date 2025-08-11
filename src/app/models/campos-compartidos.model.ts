// src/app/models/campos-compartidos.model.ts
export interface CampoCompartido {
  nombre: string;
  formularios: string[];
  obligatorio: boolean;
  jerarquia: number; // 1 = mayor prioridad
  fuente?: string;
  valor?: any;
  completado?: boolean; // ✅ OPCIONAL para evitar el error
   campoOrigen?: string;
}

export interface ConfiguracionModoInteligente {
  activo: boolean;
  mostrarIndicadores: boolean;
  permitirEdicionDirecta: boolean;
  jerarquiaFormularios: { [formulario: string]: number };
}

// src/app/models/campos-compartidos.model.ts
export const CAMPOS_COMPARTIDOS: CampoCompartido[] = [
  // ===== ANTECEDENTES =====
  {
    nombre: 'antecedentes_heredo_familiares',
    formularios: ['capturaIngreso', 'historiaClinica'],
    obligatorio: true,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'alergias',
    formularios: ['capturaIngreso', 'historiaClinica', 'hojaFrontal'],
    obligatorio: true,
    jerarquia: 1,
    completado: false
  },
  
  // ===== PADECIMIENTO ACTUAL =====
  {
    nombre: 'padecimiento_actual',
    formularios: ['capturaIngreso', 'historiaClinica', 'notaUrgencias'],
    obligatorio: true,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'sintomas_generales',
    formularios: ['capturaIngreso', 'historiaClinica'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },

  // ===== EXPLORACIÓN FÍSICA =====
  {
    nombre: 'exploracion_general',
    formularios: ['capturaIngreso', 'historiaClinica', 'notaUrgencias', 'notaEvolucion'],
    obligatorio: true,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'habitus_exterior',
    formularios: ['capturaIngreso', 'historiaClinica', 'notaEvolucion'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'exploracion_cabeza',
    formularios: ['capturaIngreso', 'historiaClinica'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'exploracion_cuello',
    formularios: ['capturaIngreso', 'historiaClinica'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'exploracion_torax',
    formularios: ['capturaIngreso', 'historiaClinica'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'exploracion_abdomen',
    formularios: ['capturaIngreso', 'historiaClinica'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'exploracion_extremidades',
    formularios: ['capturaIngreso', 'historiaClinica'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'exploracion_genitales',
    formularios: ['capturaIngreso', 'historiaClinica'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'exploracion_neurologico',
    formularios: ['capturaIngreso', 'historiaClinica'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },

  // ===== DIAGNÓSTICO Y PLAN =====
  {
    nombre: 'impresion_diagnostica',
    formularios: ['capturaIngreso', 'historiaClinica', 'notaUrgencias'],
    obligatorio: true,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'plan_terapeutico',
    formularios: ['capturaIngreso', 'historiaClinica', 'notaEvolucion'],
    obligatorio: true,
    jerarquia: 1,
    completado: false
  },

  // ===== SIGNOS VITALES =====
  {
    nombre: 'presion_arterial_sistolica',
    formularios: ['capturaIngreso', 'signosVitales'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'presion_arterial_diastolica',
    formularios: ['capturaIngreso', 'signosVitales'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'frecuencia_cardiaca',
    formularios: ['capturaIngreso', 'signosVitales'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'frecuencia_respiratoria',
    formularios: ['capturaIngreso', 'signosVitales'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'temperatura',
    formularios: ['capturaIngreso', 'signosVitales'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'saturacion_oxigeno',
    formularios: ['capturaIngreso', 'signosVitales'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'peso',
    formularios: ['capturaIngreso', 'signosVitales'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },
  {
    nombre: 'talla',
    formularios: ['capturaIngreso', 'signosVitales'],
    obligatorio: false,
    jerarquia: 1,
    completado: false
  },

  {
  nombre: 'motivo_atencion',
  formularios: ['notaUrgencias'],
  campoOrigen: 'padecimiento_actual',
  obligatorio: true,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'resumen_interrogatorio', 
  formularios: ['notaUrgencias'],
  campoOrigen: 'interrogatorio_cardiovascular,interrogatorio_respiratorio',
  obligatorio: true,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'exploracion_fisica',
  formularios: ['notaUrgencias'],
  campoOrigen: 'exploracion_general',
  obligatorio: true,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'diagnostico',
  formularios: ['notaUrgencias'],
  campoOrigen: 'impresion_diagnostica',
  obligatorio: true,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'plan_tratamiento',
  formularios: ['notaUrgencias'],
  campoOrigen: 'plan_terapeutico',
  obligatorio: true,
  jerarquia: 1,
  completado: false
},
// ===== SIGNOS VITALES PARA URGENCIAS =====
{
  nombre: 'temperatura',
  formularios: ['capturaIngreso', 'notaUrgencias'],
  obligatorio: false,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'presion_arterial_sistolica',
  formularios: ['capturaIngreso', 'notaUrgencias'],
  obligatorio: false,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'presion_arterial_diastolica',
  formularios: ['capturaIngreso', 'notaUrgencias'],
  obligatorio: false,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'frecuencia_cardiaca',
  formularios: ['capturaIngreso', 'notaUrgencias'],
  obligatorio: false,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'frecuencia_respiratoria',
  formularios: ['capturaIngreso', 'notaUrgencias'],
  obligatorio: false,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'saturacion_oxigeno',
  formularios: ['capturaIngreso', 'notaUrgencias'],
  obligatorio: false,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'peso',
  formularios: ['capturaIngreso', 'notaUrgencias'],
  obligatorio: false,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'glucosa',
  formularios: ['capturaIngreso', 'notaUrgencias'],
  obligatorio: false,
  jerarquia: 1,
  completado: false
},

// ===== CAMPOS PARA NOTA DE EVOLUCIÓN =====
{
  nombre: 'sintomas_signos_actuales',
  formularios: ['capturaEvolucion', 'notaEvolucion'],
  obligatorio: true,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'habitus_exterior_actual',
  formularios: ['capturaEvolucion', 'notaEvolucion'],
  obligatorio: true,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'evolucion_analisis',
  formularios: ['capturaEvolucion', 'notaEvolucion'],
  obligatorio: true,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'diagnosticos',
  formularios: ['capturaEvolucion', 'notaEvolucion'],
  obligatorio: true,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'plan_estudios_tratamiento',
  formularios: ['capturaEvolucion', 'notaEvolucion'],
  obligatorio: true,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'estado_nutricional',
  formularios: ['capturaEvolucion', 'notaEvolucion'],
  obligatorio: true,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'pronostico',
  formularios: ['capturaEvolucion', 'notaEvolucion'],
  obligatorio: true,
  jerarquia: 1,
  completado: false
},
{
  nombre: 'interconsultas',
  formularios: ['capturaEvolucion', 'notaEvolucion'],
  obligatorio: false,
  jerarquia: 1,
  completado: false
},


];

export const JERARQUIA_FORMULARIOS: { [key: string]: number } = {
  'capturaIngreso': 1,     // ✅ Mayor prioridad
  'historiaClinica': 2,
  'notaUrgencias': 3,
  'notaEvolucion': 4,
  'hojaFrontal': 5
};