 export interface Persona {
  id_persona: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: Date;
  sexo: 'M' | 'F' | 'O';
  curp?: string;
  tipo_sangre_id?: number;
  estado_civil?: string;
  religion?: string;
  telefono?: string;
  correo_electronico?: string;
  domicilio?: string;
}