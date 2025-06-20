export interface NotaUrgencias {
  id_nota_urgencias: number;
  id_documento: number;
  motivo_atencion: string;
  estado_conciencia?: string;
  resumen_interrogatorio?: string;
}