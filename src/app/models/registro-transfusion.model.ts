export interface RegistroTransfusion {
  id_registro_transfusion: number;
  id_documento: number;
  tipo_sangre: string;
  cantidad: string;
  fecha_transfusion: Date;
  reacciones: string;
}