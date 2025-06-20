import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PersonalMedico } from '../../models';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class PersonalMedicoService {
  private apiUrl = 'http://localhost:3000/api/personas/personal-medico';
  
  constructor(private http: HttpClient) {}

  getPersonalMedico(): Observable<PersonalMedico[]> {
    return this.http.get<PersonalMedico[]>(this.apiUrl);
  }

  getPersonalMedicoById(id: number): Observable<PersonalMedico> {
    return this.http.get<PersonalMedico>(`${this.apiUrl}/${id}`);
  }

  createPersonalMedico(medico: Partial<PersonalMedico>): Observable<PersonalMedico> {
    return this.http.post<PersonalMedico>(this.apiUrl, medico);
  }

  updatePersonalMedico(id: number, medico: Partial<PersonalMedico>): Observable<PersonalMedico> {
    return this.http.put<PersonalMedico>(`${this.apiUrl}/${id}`, medico);
  }

  deletePersonalMedico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}