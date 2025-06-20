import { PersonalMedico } from "../personas/personal-medico/personal-medico";
import { EstadoDocumentoEnum } from "./estado.enum";

export interface DocumentoClinico {
  id_documento: number;
  id_tipo_documento: number;
  id_internamiento?: number;
  id_paciente: number;
  id_medico_responsable?: number;
  fecha_documento: Date;
  estado_documento: EstadoDocumentoEnum;
  reacciones_adversas?: string;
  observaciones?: string;

  // Relaciones (para consultas)
  documento_clinico?: DocumentoClinico;
  medico_responsable?: PersonalMedico;
}