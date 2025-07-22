// src/app/services/documentos-clinicos/notas-postanestesica.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class NotasPostanestesica {
  private apiUrl = `${environment.apiUrl}/documentos-clinicos/notas-postanestesica`;

  constructor(private http: HttpClient) {}

  createNotaPostanestesica(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, data);
  }

  getNotasPostanestesica(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl);
  }

  getNotaPostanestesicaById(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  updateNotaPostanestesica(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, data);
  }

  deleteNotaPostanestesica(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
