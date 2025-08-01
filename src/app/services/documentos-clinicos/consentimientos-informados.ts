// src/app/services/documentos-clinicos/consentimientos-informados.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class ConsentimientosInformados {
  private apiUrl = `${environment.apiUrl}/documentos-clinicos/consentimientos-informados`;

  constructor(private http: HttpClient) {}

  // createConsentimiento(data: any): Observable<ApiResponse<any>> {
  //   return this.http.post<ApiResponse<any>>(this.apiUrl, data);
  // }

  createConsentimiento(data: any): Observable<ApiResponse<any>> {
    console.log('  ConsentimientosService.createConsentimiento()');
    console.log('  URL:', `${this.apiUrl}`);
    console.log('  Datos enviados:', data);
    console.log('  Campos requeridos verificados:');
    console.log('  - id_expediente:', data.id_expediente ? '✅' : '❌');
    console.log('  - id_paciente:', data.id_paciente ? '✅' : '❌');
    console.log('  - id_personal_medico:', data.id_personal_medico ? '✅' : '❌');

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}`, data);
  }

  getConsentimientos(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl);
  }

  getConsentimientoById(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  updateConsentimiento(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, data);
  }

  deleteConsentimiento(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
