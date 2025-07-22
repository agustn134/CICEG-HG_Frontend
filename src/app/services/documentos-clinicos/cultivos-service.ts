// src/app/services/documentos-clinicos/cultivos-service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../../models/base.models';

export interface SolicitudCultivo {
  id_solicitud_cultivo?: number;
  id_documento: number;
  id_paciente: number;
  id_expediente: number;
  id_medico_solicita: number;
  tipo_cultivo: TipoCultivo;
  tipo_muestra: string;
  sitio_toma: string;
  fecha_toma: string;
  hora_toma: string;
  diagnostico_presuntivo: string;
  antibioticos_previos?: boolean;
  cuales_antibioticos?: string;
  observaciones_clinicas?: string;
  urgente?: boolean;
  estado?: EstadoSolicitud;
  resultados?: ResultadoCultivo;
  created_at?: string;
  updated_at?: string;
}

export enum TipoCultivo {
  UROCULTIVO = 'UROCULTIVO',
  HEMOCULTIVO = 'HEMOCULTIVO',
  COPROCULTIVO = 'COPROCULTIVO',
  CULTIVO_FARINGE = 'CULTIVO_FARINGE',
  CULTIVO_SECRECION = 'CULTIVO_SECRECION',
  CULTIVO_LCR = 'CULTIVO_LCR',
  CULTIVO_ESPUTO = 'CULTIVO_ESPUTO',
  OTROS = 'OTROS'
}

export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO'
}

export interface ResultadoCultivo {
  fecha_resultado?: string;
  microorganismo_aislado?: string;
  recuento_colonias?: string;
  antibiograma?: Antibiograma[];
  observaciones_laboratorio?: string;
  id_personal_laboratorio?: number;
}

export interface Antibiograma {
  antibiotico: string;
  sensibilidad: 'SENSIBLE' | 'INTERMEDIO' | 'RESISTENTE';
  cim?: string; // Concentración Inhibitoria Mínima
}

export interface CreateSolicitudCultivoDto extends Omit<SolicitudCultivo, 'id_solicitud_cultivo' | 'created_at' | 'updated_at' | 'resultados'> {}
export interface UpdateSolicitudCultivoDto extends Partial<CreateSolicitudCultivoDto> {}

@Injectable({
  providedIn: 'root'
})
export class CultivosService {
  private apiUrl = `${environment.apiUrl}/documentos-clinicos/cultivos`;

  constructor(private http: HttpClient) {}

  create(data: CreateSolicitudCultivoDto): Observable<ApiResponse<SolicitudCultivo>> {
    return this.http.post<ApiResponse<SolicitudCultivo>>(this.apiUrl, data);
  }

  getById(id: number): Observable<ApiResponse<SolicitudCultivo>> {
    return this.http.get<ApiResponse<SolicitudCultivo>>(`${this.apiUrl}/${id}`);
  }

  getByExpediente(idExpediente: number): Observable<ApiResponse<SolicitudCultivo[]>> {
    return this.http.get<ApiResponse<SolicitudCultivo[]>>(`${this.apiUrl}/expediente/${idExpediente}`);
  }

  getPendientes(): Observable<ApiResponse<SolicitudCultivo[]>> {
    return this.http.get<ApiResponse<SolicitudCultivo[]>>(`${this.apiUrl}/pendientes`);
  }

  update(id: number, data: UpdateSolicitudCultivoDto): Observable<ApiResponse<SolicitudCultivo>> {
    return this.http.put<ApiResponse<SolicitudCultivo>>(`${this.apiUrl}/${id}`, data);
  }

  registrarResultado(id: number, resultado: ResultadoCultivo): Observable<ApiResponse<SolicitudCultivo>> {
    return this.http.post<ApiResponse<SolicitudCultivo>>(`${this.apiUrl}/${id}/resultado`, resultado);
  }

  cancelar(id: number, motivo: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${id}/cancelar`, { motivo });
  }

  // Método para imprimir etiquetas
  imprimirEtiqueta(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/etiqueta`, { responseType: 'blob' });
  }
}
