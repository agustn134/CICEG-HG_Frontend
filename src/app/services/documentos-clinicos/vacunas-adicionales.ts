// /home/agustin/CICEG-HG_Frontend/src/app/services/documentos-clinicos/vacunas-adicionales.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environments';
import {
    VacunasAdicionales,
    VacunaAdicional,
    // Asegúrate de tener estas interfaces definidas correctamente en pediatria.model.ts
    // o crea interfaces específicas para las respuestas complejas si es necesario.
} from '../../models/pediatria.model'; // Ajusta la ruta si es necesario
import { ApiResponse } from '../../models/base.models'; // Importamos ApiResponse

// Definimos explícitamente los parámetros permitidos para el catálogo
// Esto mejora la seguridad de tipos y evita el error TS7053
export interface CatalogoVacunasParams {
    tipo_vacuna?: string;
    activa?: boolean;
}

// Definimos una interfaz para el catálogo de vacunas (ajusta según la estructura real de tu backend)
export interface VacunaCatalogo {
    id_vacuna: number;
    nombre_vacuna: string;
    descripcion: string;
    tipo_vacuna: string;
    edad_aplicacion: string;
    dosis_requeridas: number;
    via_administracion: string;
    activa: boolean;
    fecha_registro: string;
}

// Definimos una interfaz para el reporte de vacunas (ajusta según la estructura real)
export interface ReporteVacunas {
    nombre_vacuna_libre: string | null;
    nombre_catalogo: string | null;
    tipo_vacuna: string | null;
    total_aplicadas: string; // Viene como string de la BD
    con_reacciones: string; // Viene como string de la BD
    institucion_aplicacion: string;
}

@Injectable({
    providedIn: 'root'
})
export class VacunasAdicionalesService {
    private apiUrl = `${environment.apiUrl}/pediatria/vacunas-adicionales`;

    constructor(private http: HttpClient) { }

    /**
     * Agrega una nueva vacuna adicional al esquema de inmunización.
     * @param dto Datos de la vacuna adicional a agregar.
     * @returns Observable con el objeto de vacuna adicional creado.
     */
    agregar(dto: any): Observable<ApiResponse<VacunaAdicional>> {
        return this.http.post<ApiResponse<VacunaAdicional>>(this.apiUrl, dto)
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Obtiene las vacunas adicionales asociadas a un ID de Inmunización.
     * @param idInmunizacion ID del registro de inmunizaciones.
     * @returns Observable con la lista de vacunas adicionales.
     */
    obtenerPorInmunizacion(idInmunizacion: number): Observable<ApiResponse<VacunaAdicional[]>> {
        const url = `${this.apiUrl}/inmunizacion/${idInmunizacion}`;
        return this.http.get<ApiResponse<VacunaAdicional[]>>(url)
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Obtiene el catálogo completo de vacunas disponibles.
     * @param params (Opcional) Parámetros de consulta como tipo_vacuna y activa.
     * @returns Observable con la lista de vacunas del catálogo.
     */
    obtenerCatalogo(params?: CatalogoVacunasParams): Observable<ApiResponse<VacunaCatalogo[]>> {
        const url = `${this.apiUrl}/catalogo`;
        let httpParams = new HttpParams();

        // Manejo explícito de parámetros para evitar errores de tipado
        if (params) {
            if (params.tipo_vacuna !== undefined && params.tipo_vacuna !== null) {
                httpParams = httpParams.set('tipo_vacuna', params.tipo_vacuna);
            }
            if (params.activa !== undefined && params.activa !== null) {
                httpParams = httpParams.set('activa', params.activa.toString());
            }
        }

        return this.http.get<ApiResponse<VacunaCatalogo[]>>(url, { params: httpParams })
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Busca vacunas en el catálogo por un término.
     * @param termino Término de búsqueda.
     * @returns Observable con la lista de vacunas que coinciden.
     */
    buscarVacunas(termino: string): Observable<ApiResponse<VacunaCatalogo[]>> {
        const url = `${this.apiUrl}/buscar`;
        const params = new HttpParams().set('termino', termino);
        return this.http.get<ApiResponse<VacunaCatalogo[]>>(url, { params })
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Obtiene un reporte de vacunas adicionales aplicadas.
     * @param params (Opcional) Parámetros de consulta para filtrar el reporte.
     * @returns Observable con los datos del reporte.
     */
    obtenerReporte(params?: any): Observable<ApiResponse<ReporteVacunas[]>> {
        const url = `${this.apiUrl}/reporte`;
        let httpParams = new HttpParams();

        // Manejo genérico de parámetros para el reporte
        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null) {
                    httpParams = httpParams.set(key, params[key].toString());
                }
            });
        }

        return this.http.get<ApiResponse<ReporteVacunas[]>>(url, { params: httpParams })
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Agrega una nueva vacuna al catálogo.
     * @param dto Datos de la nueva vacuna para el catálogo.
     * @returns Observable con la vacuna agregada al catálogo.
     */
    agregarAlCatalogo(dto: any): Observable<ApiResponse<VacunaCatalogo>> {
        const url = `${this.apiUrl}/catalogo`;
        return this.http.post<ApiResponse<VacunaCatalogo>>(url, dto)
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Actualiza una vacuna adicional existente.
     * @param id ID de la vacuna adicional a actualizar (id_vacuna_adicional).
     * @param dto Datos actualizados.
     * @returns Observable con el objeto actualizado.
     */
    actualizar(id: number, dto: Partial<any>): Observable<ApiResponse<VacunaAdicional>> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.put<ApiResponse<VacunaAdicional>>(url, dto)
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Elimina una vacuna adicional.
     * @param id ID de la vacuna adicional a eliminar (id_vacuna_adicional).
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
        }
        console.error(errorMessage);
        return throwError(errorMessage);
    }
}