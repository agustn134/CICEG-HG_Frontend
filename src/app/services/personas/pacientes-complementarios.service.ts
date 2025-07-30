// src/app/services/personas/pacientes-complementarios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/base.models';

export interface DatosComplementariosPaciente {
  tipo_sangre?: string;
  nombre_padre?: string;
  nombre_madre?: string;
  edad_padre?: number;
  edad_madre?: number;
  grado_escolar?: string;
  derechohabiente?: string;
  programa_social?: string;
  peso_nacer?: number;
  edad_gestacional?: number;
  apgar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PacientesComplementariosService {
  private readonly API_URL = 'http://localhost:3000/api/personas/pacientes';

  constructor(private http: HttpClient) {}

  /**
   * Obtener datos complementarios del paciente para Historia Clínica
   */
  getDatosComplementarios(idPaciente: number): Observable<ApiResponse<DatosComplementariosPaciente>> {
    return this.http.get<ApiResponse<DatosComplementariosPaciente>>(`${this.API_URL}/${idPaciente}/complementarios`);
  }

  /**
   * Actualizar datos complementarios
   */
  updateDatosComplementarios(idPaciente: number, datos: Partial<DatosComplementariosPaciente>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.API_URL}/${idPaciente}/complementarios`, datos);
  }
}
