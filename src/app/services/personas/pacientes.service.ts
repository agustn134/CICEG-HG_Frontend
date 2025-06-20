// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class PacientesService {

//   constructor() { }
// }



import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from '../../models/paciente.model';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private apiUrl = 'http://localhost:3000/api/personas/pacientes/';
  

  constructor(private http: HttpClient) {}

  getPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.apiUrl);
  }

  getPaciente(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/${id}`);
  }

  createPaciente(paciente: Partial<Paciente>): Observable<Paciente> {
    return this.http.post<Paciente>(this.apiUrl, paciente);
  }

  updatePaciente(id: number, paciente: Partial<Paciente>): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.apiUrl}/${id}`, paciente);
  }

  deletePaciente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}