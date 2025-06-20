// export interface Paciente {
//   id_paciente: number;
//   id_persona: number;
//   alergias?: string;
//   transfusiones?: boolean;
//   detalles_transfusiones?: string;
//   familiar_responsable?: string;
//   parentesco_familiar?: string;
//   telefono_familiar?: string;
//   ocupacion?: string;
//   escolaridad?: string;
//   lugar_nacimiento?: string;
// }

export interface Paciente {
  id_paciente: number;
  id_persona: number;

  // Datos de persona
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string | Date; // Puedes usar Date si lo parseas
  sexo: 'M' | 'F' | 'O';
  curp?: string;
  tipo_sangre_id?: number;
  estado_civil?: string;
  religion?: string;
  telefono?: string;
  correo_electronico?: string;
  domicilio?: string;

  // Otros campos propios del paciente
  alergias?: string;
  transfusiones?: boolean;
  detalles_transfusiones?: string;
  familiar_responsable?: string;
  parentesco_familiar?: string;
  telefono_familiar?: string;
  ocupacion?: string;
  escolaridad?: string;
  lugar_nacimiento?: string;
}