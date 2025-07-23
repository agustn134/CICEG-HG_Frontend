// /home/agustin/CICEG-HG_Frontend/src/app/services/documentos-clinicos/inmunizaciones.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environments';
// Asegúrate de tener las interfaces necesarias en pediatria.model.ts o crear modelos específicos
// Por ahora, uso 'any' para tipos complejos que dependen de la estructura exacta del backend
import {
    Inmunizaciones,
    CreateInmunizacionesDto, // Asegúrate de definir este DTO si es necesario
    PediatriaFilters // Asegúrate de que PediatriaFilters esté importado desde pediatria.model.ts
} from '../../models/pediatria.model'; // Ajusta la ruta si es necesario

@Injectable({
    providedIn: 'root'
})
export class InmunizacionesService {
    // CORRECCION: URL base corregida para apuntar al endpoint correcto basado en el index.ts del backend
    private apiUrl = `${environment.apiUrl}/pediatria/inmunizaciones`;

    constructor(private http: HttpClient) { }

    /**
     * Crea un nuevo esquema de inmunizaciones.
     * @param dto Datos para la creación del esquema.
     * @returns Observable con el objeto de inmunizaciones creado.
     */
    crear(dto: CreateInmunizacionesDto): Observable<Inmunizaciones> { // Ajusta el tipo CreateInmunizacionesDto
        return this.http.post<Inmunizaciones>(this.apiUrl, dto)
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Obtiene el esquema completo de vacunación por ID de Historia Clínica.
     * Basado en la ruta GET /esquema-completo/:id_historia_clinica del backend.
     * @param idHistoriaClinica ID de la Historia Clínica.
     * @returns Observable con el esquema completo de vacunación.
     */
    obtenerEsquemaCompleto(idHistoriaClinica: number): Observable<any> { // Ajusta el tipo de retorno según la vista `esquema_vacunacion_completo`
        const url = `${this.apiUrl}/esquema-completo/${idHistoriaClinica}`;
        return this.http.get<any>(url)
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Obtiene el historial completo de vacunas por ID de Inmunización.
     * Basado en la ruta GET /historial/:id_inmunizacion del backend.
     * @param idInmunizacion ID del registro de inmunizaciones.
     * @returns Observable con el historial detallado de vacunas.
     */
    obtenerHistorialCompleto(idInmunizacion: number): Observable<any[]> { // Basado en la función `obtener_historial_vacunas_completo`
        const url = `${this.apiUrl}/historial/${idInmunizacion}`;
        return this.http.get<any[]>(url)
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Verifica la completitud del esquema de vacunación por ID de Inmunización.
     * Basado en la ruta GET /verificar-completitud/:id_inmunizacion del backend.
     * @param idInmunizacion ID del registro de inmunizaciones.
     * @returns Observable con información sobre la completitud del esquema.
     */
    verificarCompletitud(idInmunizacion: number): Observable<any> { // Ajusta el tipo de retorno según la lógica del backend
        const url = `${this.apiUrl}/verificar-completitud/${idInmunizacion}`;
        return this.http.get<any>(url)
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Obtiene las próximas vacunas recomendadas por ID de Inmunización.
     * Basado en la ruta GET /proximas-vacunas/:id_inmunizacion del backend.
     * @param idInmunizacion ID del registro de inmunizaciones.
     * @returns Observable con la lista de próximas vacunas.
     */
    obtenerProximasVacunas(idInmunizacion: number): Observable<any[]> { // Ajusta el tipo de retorno según la lógica del backend
        const url = `${this.apiUrl}/proximas-vacunas/${idInmunizacion}`;
        return this.http.get<any[]>(url)
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Actualiza un esquema de inmunizaciones existente.
     * @param id ID del registro de inmunizaciones a actualizar (id_inmunizacion).
     * @param dto Datos actualizados.
     * @returns Observable con el objeto actualizado.
     */
    actualizar(id: number, dto: Partial<CreateInmunizacionesDto>): Observable<Inmunizaciones> { // Ajusta el tipo
        const url = `${this.apiUrl}/${id}`;
        return this.http.put<Inmunizaciones>(url, dto)
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Elimina un esquema de inmunizaciones.
     * @param id ID del registro de inmunizaciones a eliminar (id_inmunizacion).
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