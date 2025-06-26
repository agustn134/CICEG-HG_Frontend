export interface PersonalMedico {
  id_personal_medico: number;
  id_persona: number;
  cedula_profesional: string;
  especialidad: string;
  cargo: string;
  departamento: string;
  nivel_acceso: number;
  activo: boolean;
  foto?: string;
}
