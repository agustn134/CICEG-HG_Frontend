export interface Administrador {
  id_administrador: number;
  id_persona: number;
  usuario: string;
  contrasena: string;
  nivel_acceso: number;
  activo: boolean;
  foto?: string;
}