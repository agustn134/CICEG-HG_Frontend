export interface Internamiento {
  id_internamiento: number;
  id_expediente: number;
  id_cama: number;
  fecha_ingreso: Date;
  motivo_ingreso: string;
  diagnostico_ingreso: string;
  estado_actual: string;
}