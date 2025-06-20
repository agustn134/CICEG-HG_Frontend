export interface ConsentimientoInformado {
  id_consentimiento_informado: number;
  id_documento: number;
  autorizacion_procedimientos: boolean;
  firma_paciente: boolean;
  firma_responsable: boolean;
  testigos: string[];
}