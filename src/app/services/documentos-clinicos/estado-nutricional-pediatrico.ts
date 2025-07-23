// /home/agustin/CICEG-HG_Frontend/src/app/services/documentos-clinicos/estado-nutricional-pediatrico.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environments';
import {
  EstadoNutricionalPediatrico,
  CreateEstadoNutricionalPediatricoDto,
  PediatriaFilters // Asegúrate de que PediatriaFilters esté importado desde pediatria.model.ts
} from '../../models/pediatria.model'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root'
})
export class EstadoNutricionalPediatricoService {
  // CORRECCION: URL base corregida para apuntar al endpoint correcto basado en el index.ts del backend
  private apiUrl = `${environment.apiUrl}/pediatria/estado-nutricional`;

  constructor(private http: HttpClient) { }

  /**
   * Crea un nuevo registro de Estado Nutricional Pediátrico.
   * @param dto Datos para la creación.
   * @returns Observable con el objeto creado.
   */
  crear(dto: CreateEstadoNutricionalPediatricoDto): Observable<EstadoNutricionalPediatrico> {
    return this.http.post<EstadoNutricionalPediatrico>(this.apiUrl, dto)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene el registro de Estado Nutricional Pediátrico por ID de Historia Clínica.
   * @param idHistoriaClinica ID de la Historia Clínica.
   * @returns Observable con el objeto encontrado o null si no existe.
   */
  obtenerPorHistoriaClinica(idHistoriaClinica: number): Observable<EstadoNutricionalPediatrico | null> {
    const url = `${this.apiUrl}/historia-clinica/${idHistoriaClinica}`;
    return this.http.get<EstadoNutricionalPediatrico | null>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene alertas nutricionales.
   * Basado en la ruta GET /alertas del backend.
   * @returns Observable con la lista de alertas nutricionales.
   */
  obtenerAlertasNutricionales(): Observable<any[]> { // Ajusta el tipo de retorno según la estructura real del backend
    const url = `${this.apiUrl}/alertas`;
    return this.http.get<any[]>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Calcula percentiles nutricionales (método POST).
   * Basado en la ruta POST /calcular-percentiles del backend.
   * @param datos Datos necesarios para el cálculo (peso, talla, edad, sexo, etc.).
   * @returns Observable con los resultados del cálculo.
   */
  calcularPercentiles(datos: any): Observable<any> { // Ajusta el tipo de entrada y salida según el backend
    const url = `${this.apiUrl}/calcular-percentiles`;
    return this.http.post<any>(url, datos)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza un registro de Estado Nutricional Pediátrico existente.
   * @param id ID del registro a actualizar (id_nutricional).
   * @param dto Datos actualizados.
   * @returns Observable con el objeto actualizado.
   */
  actualizar(id: number, dto: Partial<CreateEstadoNutricionalPediatricoDto>): Observable<EstadoNutricionalPediatrico> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<EstadoNutricionalPediatrico>(url, dto)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Elimina un registro de Estado Nutricional Pediátrico.
   * @param id ID del registro a eliminar (id_nutricional).
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