// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class BaseService {
//   protected apiUrl = 'http://localhost:3000/api'; // 👈 Eliminado espacio adicional

//   constructor(protected http: HttpClient) {}
// }


// src/app/services/base.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService<T> {
  protected baseUrl = 'http://localhost:3000/api';

  constructor(
    protected http: HttpClient,
    protected endpoint: string
  ) {}

  // Obtener todos los registros
  getAll(): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${this.endpoint}`)
      .pipe(catchError(this.handleError));
  }

  // Obtener por ID
  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${this.endpoint}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Crear nuevo registro
  create(item: Partial<T>): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${this.endpoint}`, item)
      .pipe(catchError(this.handleError));
  }

  // Actualizar registro
  update(id: number, item: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${this.endpoint}/${id}`, item)
      .pipe(catchError(this.handleError));
  }

  // Eliminar registro
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.endpoint}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Manejo de errores centralizado
  protected handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => errorMessage);
  }
}
