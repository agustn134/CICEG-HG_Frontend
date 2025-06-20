// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class HistoriasClinicasService {
//   private apiUrl = 'http://localhost:3000/api/historias-clinicas'; // Cambia según tu API


//   constructor(private http: HttpClient) { }

//   getHistoriasClinicas(): Observable<any> {
//     return this.http.get(this.apiUrl);
//   }

//   getHistoriaClinica(id: number): Observable<any> {
//     return this.http.get(`${this.apiUrl}/${id}`);
//   }

//   createHistoriaClinica(data: any): Observable<any> {
//     return this.http.post(this.apiUrl, data);
//   }

//   updateHistoriaClinica(id: number, data: any): Observable<any> {
//     return this.http.put(`${this.apiUrl}/${id}`, data);
//   }

//   deleteHistoriaClinica(id: number): Observable<any> {
//     return this.http.delete(`${this.apiUrl}/${id}`);
//   }

// }


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoriaClinica } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class HistoriasClinicasService {
  private apiUrl = 'http://localhost:3000/api/historias-clinicas';

  constructor(private http: HttpClient) {}

  getHistoriasClinicas(): Observable<HistoriaClinica[]> {
    return this.http.get<HistoriaClinica[]>(this.apiUrl);
  }

  getHistoriaClinica(id: number): Observable<HistoriaClinica> {
    return this.http.get<HistoriaClinica>(`${this.apiUrl}/${id}`);
  }

  createHistoriaClinica(historia: Partial<HistoriaClinica>): Observable<HistoriaClinica> {
    return this.http.post<HistoriaClinica>(this.apiUrl, historia);
  }

  updateHistoriaClinica(id: number, historia: Partial<HistoriaClinica>): Observable<HistoriaClinica> {
    return this.http.put<HistoriaClinica>(`${this.apiUrl}/${id}`, historia);
  }

  deleteHistoriaClinica(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}