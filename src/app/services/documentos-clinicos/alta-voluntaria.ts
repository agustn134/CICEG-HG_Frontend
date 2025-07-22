// src/app/services/documentos-clinicos/alta-voluntaria.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../../models/base.models';

export interface AltaVoluntaria {
  id_alta_voluntaria?: number;
  id_documento: number;
  id_paciente: number;
  id_expediente: number;
  motivo_alta: string;
  riesgos_explicados: string;
  nombre_responsable: string;
  parentesco_responsable: string;
  identificacion_responsable: string;
  testigo1_nombre?: string;
  testigo1_identificacion?: string;
  testigo2_nombre?: string;
  testigo2_identificacion?: string;
  observaciones?: string;
  fecha_alta: string;
  hora_alta: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAltaVoluntariaDto extends Omit<AltaVoluntaria, 'id_alta_voluntaria' | 'created_at' | 'updated_at'> {}
export interface UpdateAltaVoluntariaDto extends Partial<CreateAltaVoluntariaDto> {}

@Injectable({
  providedIn: 'root'
})
export class AltaVoluntariaService {
  private apiUrl = `${environment.apiUrl}/documentos-clinicos/alta-voluntaria`;

  constructor(private http: HttpClient) {}

  create(data: CreateAltaVoluntariaDto): Observable<ApiResponse<AltaVoluntaria>> {
    return this.http.post<ApiResponse<AltaVoluntaria>>(this.apiUrl, data);
  }

  getById(id: number): Observable<ApiResponse<AltaVoluntaria>> {
    return this.http.get<ApiResponse<AltaVoluntaria>>(`${this.apiUrl}/${id}`);
  }

  getByExpediente(idExpediente: number): Observable<ApiResponse<AltaVoluntaria[]>> {
    return this.http.get<ApiResponse<AltaVoluntaria[]>>(`${this.apiUrl}/expediente/${idExpediente}`);
  }

  update(id: number, data: UpdateAltaVoluntariaDto): Observable<ApiResponse<AltaVoluntaria>> {
    return this.http.put<ApiResponse<AltaVoluntaria>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // Método específico para validar alta voluntaria
  validarAltaVoluntaria(data: CreateAltaVoluntariaDto): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!data.motivo_alta || data.motivo_alta.length < 20) {
      errores.push('El motivo del alta debe tener al menos 20 caracteres');
    }

    if (!data.riesgos_explicados || data.riesgos_explicados.length < 50) {
      errores.push('Los riesgos explicados deben detallarse con al menos 50 caracteres');
    }

    if (!data.nombre_responsable || !data.parentesco_responsable) {
      errores.push('Datos del responsable incompletos');
    }

    return { valido: errores.length === 0, errores };
  }
}
