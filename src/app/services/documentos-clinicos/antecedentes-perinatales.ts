// /home/agustin/CICEG-HG_Frontend/src/app/services/documentos-clinicos/antecedentes-perinatales.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environments';
import {
  AntecedentesPerinatales,
  CreateAntecedentesPerinatalesDto,
  PediatriaFilters // Asegúrate de que PediatriaFilters esté importado desde pediatria.model.ts
} from '../../models/pediatria.model'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root'
})
export class AntecedentesPerinatalesService {
  // CORRECCION: URL base corregida para apuntar al endpoint correcto
  private apiUrl = `${environment.apiUrl}/pediatria/antecedentes-perinatales`;

  constructor(private http: HttpClient) { }

  /**
   * Crea un nuevo registro de Antecedentes Perinatales.
   * @param dto Datos para la creación.
   * @returns Observable con el objeto creado.
   */
  crear(dto: CreateAntecedentesPerinatalesDto): Observable<AntecedentesPerinatales> {
    return this.http.post<AntecedentesPerinatales>(this.apiUrl, dto)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene el registro de Antecedentes Perinatales por ID de Historia Clínica.
   * @param idHistoriaClinica ID de la Historia Clínica.
   * @returns Observable con el objeto encontrado o null si no existe.
   */
  obtenerPorHistoriaClinica(idHistoriaClinica: number): Observable<AntecedentesPerinatales | null> {
    const url = `${this.apiUrl}/historia-clinica/${idHistoriaClinica}`;
    return this.http.get<AntecedentesPerinatales | null>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza un registro de Antecedentes Perinatales existente.
   * @param id ID del registro a actualizar (id_perinatales).
   * @param dto Datos actualizados.
   * @returns Observable con el objeto actualizado.
   */
  actualizar(id: number, dto: Partial<CreateAntecedentesPerinatalesDto>): Observable<AntecedentesPerinatales> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<AntecedentesPerinatales>(url, dto)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Elimina un registro de Antecedentes Perinatales.
   * @param id ID del registro a eliminar (id_perinatales).
   * @returns Observable<void>.
   */
  eliminar(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Manejador de errores HTTP.
   * @param error Error de la respuesta HTTP.
   * @returns Observable que emite un mensaje de error.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido!';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
      // Puedes agregar lógica adicional aquí para manejar códigos de error específicos
      // Por ejemplo, mostrar un mensaje al usuario si es 404, 403, etc.
    }
    console.error(errorMessage);
    // Puedes usar un servicio de notificaciones aquí para mostrar el mensaje al usuario
    // this.notificationService.showError(errorMessage); // Ejemplo
    return throwError(errorMessage);
  }
}