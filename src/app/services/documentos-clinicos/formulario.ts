// src/app/services/documentos-clinicos/formulario.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class FormularioService {
  private apiUrl = `${environment.apiUrl}/documentos-clinicos`;

  constructor(private http: HttpClient) {}

  crearSolicitudEstudio(datos: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/solicitudes-estudio`, datos);
  }

  crearReferencia(datos: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/referencias`, datos);
  }

  crearPrescripcion(datos: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/prescripciones`, datos);
  }

  crearControlCrecimiento(datos: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/control-crecimiento`, datos);
  }

  crearEsquemaVacunacion(datos: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/esquema-vacunacion`, datos);
  }
}