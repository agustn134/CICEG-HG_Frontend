export interface NotaPreoperatoria {
  id_nota_preoperatoria: number;
  id_documento: number;
  procedimiento_propuesto: string;
  riesgos_potenciales: string;
  alternativas: string;
  instrucciones_preoperatorias: string;
  confirmacion_cumplimiento: boolean;
}