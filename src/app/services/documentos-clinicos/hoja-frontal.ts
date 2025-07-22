// src/app/services/documentos-clinicos/hoja-frontal.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../../models/base.models';

export interface HojaFrontal {
  id_hoja_frontal?: number;
  id_expediente: number;
  id_paciente: number;

  // Datos del establecimiento (NOM-004)
  tipo_establecimiento: string;
  nombre_establecimiento: string;
  domicilio_establecimiento: string;
  razon_social?: string;

  // Datos del paciente
  numero_expediente: string;
  fecha_apertura: string;
  hora_apertura: string;

  // Datos demográficos adicionales
  lugar_nacimiento?: string;
  nacionalidad?: string;
  grupo_etnico?: string;
  lengua_indigena?: string;

  // Datos socioeconómicos
  escolaridad?: string;
  ocupacion?: string;
  estado_conyugal?: string;
  afiliacion_medica?: string;
  numero_afiliacion?: string;

  // Contactos de emergencia
  contacto_emergencia_1: ContactoEmergencia;
  contacto_emergencia_2?: ContactoEmergencia;

  // Datos del responsable legal (menores o incapacitados)
  responsable_legal?: ResponsableLegal;

  // Información médica relevante
  alergias_conocidas?: string;
  grupo_sanguineo?: string;
  enfermedades_cronicas?: string;
  medicamentos_actuales?: string;

  // Control administrativo
  id_personal_registro: number;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactoEmergencia {
  nombre_completo: string;
  parentesco: string;
  telefono_principal: string;
  telefono_secundario?: string;
  direccion?: string;
}

export interface ResponsableLegal {
  nombre_completo: string;
  parentesco: string;
  identificacion_tipo: string;
  identificacion_numero: string;
  telefono: string;
  direccion: string;
}

export interface CreateHojaFrontalDto extends Omit<HojaFrontal, 'id_hoja_frontal' | 'created_at' | 'updated_at'> {}
export interface UpdateHojaFrontalDto extends Partial<CreateHojaFrontalDto> {}

@Injectable({
  providedIn: 'root'
})
export class HojaFrontalService {
  private apiUrl = `${environment.apiUrl}/documentos-clinicos/hoja-frontal`;

  constructor(private http: HttpClient) {}

  create(data: CreateHojaFrontalDto): Observable<ApiResponse<HojaFrontal>> {
    return this.http.post<ApiResponse<HojaFrontal>>(this.apiUrl, data);
  }

  getById(id: number): Observable<ApiResponse<HojaFrontal>> {
    return this.http.get<ApiResponse<HojaFrontal>>(`${this.apiUrl}/${id}`);
  }

  getByExpediente(idExpediente: number): Observable<ApiResponse<HojaFrontal>> {
    return this.http.get<ApiResponse<HojaFrontal>>(`${this.apiUrl}/expediente/${idExpediente}`);
  }

  update(id: number, data: UpdateHojaFrontalDto): Observable<ApiResponse<HojaFrontal>> {
    return this.http.put<ApiResponse<HojaFrontal>>(`${this.apiUrl}/${id}`, data);
  }

  // Verificar completitud según NOM-004
  verificarCompletitudNOM004(idExpediente: number): Observable<ApiResponse<{
    completo: boolean;
    campos_faltantes: string[];
    porcentaje_completitud: number;
  }>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/verificar-nom004/${idExpediente}`);
  }

  // Generar carátula del expediente
  generarCaratula(idExpediente: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/caratula/${idExpediente}`, { responseType: 'blob' });
  }

  // Actualizar foto del paciente
  actualizarFoto(idExpediente: number, foto: File): Observable<ApiResponse<void>> {
    const formData = new FormData();
    formData.append('foto', foto);
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${idExpediente}/foto`, formData);
  }
}
