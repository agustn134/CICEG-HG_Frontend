import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Administrador } from '../../models/administrador.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdministradoresService {


    private apiUrl = 'http://localhost:3000/api/personas/administradores';
  

  constructor(private http: HttpClient) {}

  getAdministradores(): Observable<Administrador[]> {
    return this.http.get<Administrador[]>(this.apiUrl);
  }

  getAdministrador(id: number): Observable<Administrador> {
    return this.http.get<Administrador>(`${this.apiUrl}/${id}`);
  }

  createAdministrador(administrador: Partial<Administrador>): Observable<Administrador> {
    return this.http.post<Administrador>(this.apiUrl, administrador);
  }

  updateAdministrador(id: number, administrador: Partial<Administrador>): Observable<Administrador> {
    return this.http.put<Administrador>(`${this.apiUrl}/${id}`, administrador);
  }

  deleteAdministrador(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
