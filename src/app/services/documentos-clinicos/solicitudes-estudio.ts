import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesEstudio {

  private readonly API_URL = 'http://localhost:3000/api/documentos-clinicos/solicitudes-estudio';


  constructor(private http: HttpClient) { }


  createSolicitud(data: any): Observable<ApiResponse<any>> {
  return this.http.post<ApiResponse<any>>(`${this.API_URL}`, data);
}

}
