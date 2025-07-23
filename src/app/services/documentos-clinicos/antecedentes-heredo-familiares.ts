// /home/agustin/CICEG-HG_Frontend/src/app/services/documentos-clinicos/antecedentes-heredo-familiares.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environments';
import {
  AntecedentesHeredoFamiliares,
  CreateAntecedentesHeredoFamiliaresDto,
  PediatriaFilters // Asegúrate de que PediatriaFilters esté importado desde pediatria.model.ts
} from '../../models/pediatria.model'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root'
})
export class AntecedentesHeredoFamiliaresService {
  // CORRECCION: URL base corregida para apuntar al endpoint correcto
  private apiUrl = `${environment.apiUrl}/pediatria/antecedentes-heredo-familiares`;

  constructor(private http: HttpClient) { }

  /**
   * Crea un nuevo registro de Antecedentes Heredo Familiares.
   * @param dto Datos para la creación.
   * @returns Observable con el objeto creado.
   */
  crear(dto: CreateAntecedentesHeredoFamiliaresDto): Observable<AntecedentesHeredoFamiliares> {
    return this.http.post<AntecedentesHeredoFamiliares>(this.apiUrl, dto)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene el registro de Antecedentes Heredo Familiares por ID de Historia Clínica.
   * @param idHistoriaClinica ID de la Historia Clínica.
   * @returns Observable con el objeto encontrado o null si no existe.
   */
  obtenerPorHistoriaClinica(idHistoriaClinica: number): Observable<AntecedentesHeredoFamiliares | null> {
    const url = `${this.apiUrl}/historia-clinica/${idHistoriaClinica}`;
    return this.http.get<AntecedentesHeredoFamiliares | null>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza un registro de Antecedentes Heredo Familiares existente.
   * @param id ID del registro a actualizar.
   * @param dto Datos actualizados.
   * @returns Observable con el objeto actualizado.
   */
  actualizar(id: number, dto: Partial<CreateAntecedentesHeredoFamiliaresDto>): Observable<AntecedentesHeredoFamiliares> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<AntecedentesHeredoFamiliares>(url, dto)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Elimina un registro de Antecedentes Heredo Familiares.
   * @param id ID del registro a eliminar.
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