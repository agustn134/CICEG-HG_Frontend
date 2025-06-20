export interface SolicitudEstudio {
  id_solicitud: number;
  id_documento: number;
  id_estudio: number;
  justificacion: string;
  preparacion_requerida: string;
  fecha_solicitada: Date;
  prioridad: 'Urgente' | 'Normal';
  estado: 'Solicitado' | 'En proceso' | 'Completado' | 'Cancelado';
}