// src/app/services/documentos-clinicos/controlcrecimientoService.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../../models/base.models';

export interface ControlCrecimiento {
  id_control_crecimiento?: number;
  id_paciente: number;
  id_expediente: number;
  id_personal_medico: number;
  fecha_control: string;
  edad_meses: number;
  peso_kg: number;
  talla_cm: number;
  perimetro_cefalico_cm?: number;
  perimetro_toracico_cm?: number;
  perimetro_abdominal_cm?: number;
  indice_masa_corporal?: number;
  percentil_peso?: number;
  percentil_talla?: number;
  percentil_pc?: number;
  desarrollo_psicomotor?: string;
  alimentacion_actual?: string;
  vacunas_pendientes?: string;
  observaciones?: string;
  signos_alarma?: string;
  recomendaciones?: string;
  proxima_cita?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateControlCrecimientoDto extends Omit<ControlCrecimiento, 'id_control_crecimiento' | 'created_at' | 'updated_at'> {}
export interface UpdateControlCrecimientoDto extends Partial<CreateControlCrecimientoDto> {}

@Injectable({
  providedIn: 'root'
})
export class ControlCrecimientoService {
  private apiUrl = `${environment.apiUrl}/documentos-clinicos/control-crecimiento`;

  constructor(private http: HttpClient) {}

  create(data: CreateControlCrecimientoDto): Observable<ApiResponse<ControlCrecimiento>> {
    // Calcular IMC automáticamente
    if (data.peso_kg && data.talla_cm) {
      const tallaMetros = data.talla_cm / 100;
      data.indice_masa_corporal = Number((data.peso_kg / (tallaMetros * tallaMetros)).toFixed(2));
    }
    return this.http.post<ApiResponse<ControlCrecimiento>>(this.apiUrl, data);
  }

  getById(id: number): Observable<ApiResponse<ControlCrecimiento>> {
    return this.http.get<ApiResponse<ControlCrecimiento>>(`${this.apiUrl}/${id}`);
  }

  getByPaciente(idPaciente: number): Observable<ApiResponse<ControlCrecimiento[]>> {
    return this.http.get<ApiResponse<ControlCrecimiento[]>>(`${this.apiUrl}/paciente/${idPaciente}`);
  }

  getHistorial(idPaciente: number): Observable<ApiResponse<ControlCrecimiento[]>> {
    return this.http.get<ApiResponse<ControlCrecimiento[]>>(`${this.apiUrl}/historial/${idPaciente}`);
  }

  update(id: number, data: UpdateControlCrecimientoDto): Observable<ApiResponse<ControlCrecimiento>> {
    // Recalcular IMC si se actualizan peso o talla
    if (data.peso_kg && data.talla_cm) {
      const tallaMetros = data.talla_cm / 100;
      data.indice_masa_corporal = Number((data.peso_kg / (tallaMetros * tallaMetros)).toFixed(2));
    }
    return this.http.put<ApiResponse<ControlCrecimiento>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // Métodos específicos para cálculos pediátricos
  calcularPercentiles(edad_meses: number, peso: number, talla: number, sexo: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calcular-percentiles`, {
      edad_meses,
      peso,
      talla,
      sexo
    });
  }

  obtenerCurvasCrecimiento(idPaciente: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/curvas-crecimiento/${idPaciente}`);
  }

  evaluarDesarrollo(edad_meses: number): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/hitos-desarrollo/${edad_meses}`);
  }
}
