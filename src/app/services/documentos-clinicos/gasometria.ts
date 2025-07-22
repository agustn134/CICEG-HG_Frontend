// src/app/services/documentos-clinicos/gasometria.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../../models/base.models';

export interface SolicitudGasometria {
  id_solicitud_gasometria?: number;
  id_documento: number;
  id_paciente: number;
  id_expediente: number;
  id_medico_solicita: number;
  tipo_muestra: TipoMuestraGasometria;
  sitio_puncion?: string;
  fio2?: number; // Fracción inspirada de oxígeno
  temperatura_paciente?: number;
  diagnostico_presuntivo: string;
  urgente: boolean;
  observaciones_clinicas?: string;
  estado?: EstadoSolicitud;
  resultados?: ResultadosGasometria;
  created_at?: string;
  updated_at?: string;
}

export enum TipoMuestraGasometria {
  ARTERIAL = 'ARTERIAL',
  VENOSA = 'VENOSA',
  CAPILAR = 'CAPILAR',
  VENOSA_MIXTA = 'VENOSA_MIXTA'
}

export interface ResultadosGasometria {
  fecha_procesamiento?: string;
  ph?: number;
  pco2?: number; // mmHg
  po2?: number; // mmHg
  hco3?: number; // mEq/L
  be?: number; // Base excess
  sato2?: number; // Saturación O2 %
  lactato?: number;
  na?: number; // Sodio
  k?: number; // Potasio
  cl?: number; // Cloro
  ca_ionico?: number; // Calcio iónico
  glucosa?: number;
  interpretacion?: string;
  observaciones_laboratorio?: string;
  id_personal_laboratorio?: number;
}

export interface CreateSolicitudGasometriaDto extends Omit<SolicitudGasometria, 'id_solicitud_gasometria' | 'created_at' | 'updated_at' | 'resultados'> {}
export interface UpdateSolicitudGasometriaDto extends Partial<CreateSolicitudGasometriaDto> {}

@Injectable({
  providedIn: 'root'
})
export class GasometriaService {
  private apiUrl = `${environment.apiUrl}/documentos-clinicos/gasometria`;

  constructor(private http: HttpClient) {}

  create(data: CreateSolicitudGasometriaDto): Observable<ApiResponse<SolicitudGasometria>> {
    return this.http.post<ApiResponse<SolicitudGasometria>>(this.apiUrl, data);
  }

  getById(id: number): Observable<ApiResponse<SolicitudGasometria>> {
    return this.http.get<ApiResponse<SolicitudGasometria>>(`${this.apiUrl}/${id}`);
  }

  getByExpediente(idExpediente: number): Observable<ApiResponse<SolicitudGasometria[]>> {
    return this.http.get<ApiResponse<SolicitudGasometria[]>>(`${this.apiUrl}/expediente/${idExpediente}`);
  }

  getPendientes(): Observable<ApiResponse<SolicitudGasometria[]>> {
    return this.http.get<ApiResponse<SolicitudGasometria[]>>(`${this.apiUrl}/pendientes`);
  }

  registrarResultados(id: number, resultados: ResultadosGasometria): Observable<ApiResponse<SolicitudGasometria>> {
    return this.http.post<ApiResponse<SolicitudGasometria>>(`${this.apiUrl}/${id}/resultados`, resultados);
  }

  // Interpretación automática de resultados
  interpretarResultados(resultados: ResultadosGasometria): Observable<ApiResponse<{
    estado_acido_base: string;
    compensacion: string;
    oxigenacion: string;
    recomendaciones: string[];
  }>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/interpretar`, resultados);
  }

  // Cálculos adicionales
  calcularAnionGap(na: number, cl: number, hco3: number): number {
    return na - (cl + hco3);
  }

  calcularGradienteAA(po2Alveolar: number, po2Arterial: number): number {
    return po2Alveolar - po2Arterial;
  }

  // Generar reporte PDF
  generarReporte(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/reporte`, { responseType: 'blob' });
  }
}

// Enum compartido para estado
export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO'
}
