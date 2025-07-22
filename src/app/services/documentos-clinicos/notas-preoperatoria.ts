// src/app/services/documentos-clinicos/notas-preoperatoria.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class NotasPreoperatoria {
  private apiUrl = `${environment.apiUrl}/documentos-clinicos/notas-preoperatoria`;

  constructor(private http: HttpClient) {}

  createNotaPreoperatoria(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, data);
  }

  getNotasPreoperatoria(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl);
  }

  getNotaPreoperatoriaById(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  updateNotaPreoperatoria(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, data);
  }

  deleteNotaPreoperatoria(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
