export interface Medicamento {
  id_medicamento: number;
  nombre_generico: string;
  nombre_comercial?: string;
  forma_farmaceutica: string;
  dosis_recomendada: string;
  via_administracion: string;
  frecuencia: string;
}