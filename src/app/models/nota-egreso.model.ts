export interface NotaEgreso {
  id_nota_egreso: number;
  id_documento: number;
  diagnostico_egreso: string;
  motivo_egreso: MotivoEgresoEnum;
  problemas_pendientes: string;
  plan_tratamiento: string;
  recomendaciones_vigilancia: string;
  atencion_factores_riesgo: string;
  pronostico: string;
  reingreso_por_misma_afeccion: boolean;
}

export enum MotivoEgresoEnum {
  MEJORIA = 'Mejoría',
  MAXIMO_BENEFICIO = 'Máximo beneficio',
  VOLUNTARIO = 'Voluntario',
  DEFUNCION = 'Defunción'
}