// src/app/services/documentos-clinicos/notas-postoperatoria.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class NotasPostoperatoria {
  private apiUrl = `${environment.apiUrl}/documentos-clinicos/notas-postoperatoria`;

  constructor(private http: HttpClient) {}

  createNotaPostoperatoria(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, data);
  }

  getNotasPostoperatoria(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl);
  }

  getNotaPostoperatoriaById(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  updateNotaPostoperatoria(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, data);
  }

  deleteNotaPostoperatoria(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
