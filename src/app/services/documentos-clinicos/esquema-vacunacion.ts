// src/app/services/documentos-clinicos/esquema-vacunacion.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../../models/base.models';

export interface RegistroVacuna {
  id_registro_vacuna?: number;
  id_paciente: number;
  id_expediente: number;
  id_vacuna: number; // Del catálogo de vacunas
  nombre_vacuna?: string;
  dosis_numero: number;
  fecha_aplicacion: string;
  edad_aplicacion_meses?: number;
  lote_vacuna?: string;
  marca_laboratorio?: string;
  sitio_aplicacion?: string;
  id_personal_aplica: number;
  reacciones_adversas?: string;
  observaciones?: string;
  proxima_dosis_fecha?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EsquemaVacunacion {
  id_esquema?: number;
  id_paciente: number;
  vacunas_aplicadas: RegistroVacuna[];
  vacunas_pendientes: VacunaPendiente[];
  porcentaje_completado: number;
  observaciones_generales?: string;
  ultima_actualizacion?: string;
}

export interface VacunaPendiente {
  id_vacuna: number;
  nombre_vacuna: string;
  dosis_numero: number;
  edad_recomendada_meses: number;
  fecha_ideal_aplicacion: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
}

export interface CreateRegistroVacunaDto extends Omit<RegistroVacuna, 'id_registro_vacuna' | 'created_at' | 'updated_at'> {}
export interface UpdateRegistroVacunaDto extends Partial<CreateRegistroVacunaDto> {}

@Injectable({
  providedIn: 'root'
})
export class EsquemaVacunacionService {
  private apiUrl = `${environment.apiUrl}/documentos-clinicos/esquema-vacunacion`;

  constructor(private http: HttpClient) {}

  // Registro individual de vacunas
  registrarVacuna(data: CreateRegistroVacunaDto): Observable<ApiResponse<RegistroVacuna>> {
    return this.http.post<ApiResponse<RegistroVacuna>>(`${this.apiUrl}/registrar`, data);
  }

  // Obtener esquema completo del paciente
  obtenerEsquema(idPaciente: number): Observable<ApiResponse<EsquemaVacunacion>> {
    return this.http.get<ApiResponse<EsquemaVacunacion>>(`${this.apiUrl}/paciente/${idPaciente}`);
  }

  // Obtener vacunas pendientes
  obtenerPendientes(idPaciente: number): Observable<ApiResponse<VacunaPendiente[]>> {
    return this.http.get<ApiResponse<VacunaPendiente[]>>(`${this.apiUrl}/pendientes/${idPaciente}`);
  }

  // Actualizar registro de vacuna
  actualizarRegistro(id: number, data: UpdateRegistroVacunaDto): Observable<ApiResponse<RegistroVacuna>> {
    return this.http.put<ApiResponse<RegistroVacuna>>(`${this.apiUrl}/${id}`, data);
  }

  // Eliminar registro (solo si fue error)
  eliminarRegistro(id: number, motivo: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, {
      params: { motivo }
    });
  }

  // Generar cartilla de vacunación
  generarCartilla(idPaciente: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/cartilla/${idPaciente}`, { responseType: 'blob' });
  }

  // Verificar esquema según edad
  verificarEsquemaCompleto(idPaciente: number): Observable<ApiResponse<{
    completo: boolean;
    vacunas_faltantes: string[];
    porcentaje: number;
  }>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/verificar/${idPaciente}`);
  }

  // Programar recordatorios
  programarRecordatorio(idPaciente: number, idVacuna: number, fecha: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/recordatorio`, {
      id_paciente: idPaciente,
      id_vacuna: idVacuna,
      fecha_recordatorio: fecha
    });
  }
}
