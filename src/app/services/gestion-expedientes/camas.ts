import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Cama, CreateCamaDto, UpdateCamaDto, CamaFilters } from '../../models/cama.model';
import { EstadoCama } from '../../models/base.models';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class CamasService {
  private readonly API_URL = 'http://localhost:3000/api/gestion-expedientes/camas';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // ==========================================
  // OPERACIONES CRUD BÁSICAS
  // ==========================================

  // Obtener todas las camas
  async getAll(filters?: CamaFilters): Promise<ApiResponse<Cama[]>> {
    try {
      let url = this.API_URL;
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<Cama[]>>(url, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  // Obtener una cama por ID
  async getById(id: number): Promise<ApiResponse<Cama>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Cama>>(`${this.API_URL}/${id}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  // Crear una nueva cama
  async create(cama: CreateCamaDto): Promise<ApiResponse<Cama>> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Cama>>(this.API_URL, cama, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  // Actualizar una cama existente
  async update(id: number, cama: Partial<CreateCamaDto>): Promise<ApiResponse<Cama>> {
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<Cama>>(`${this.API_URL}/${id}`, cama, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  // Eliminar una cama
  async delete(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }

  // ==========================================
  // OPERACIONES ESPECÍFICAS DE CAMAS
  // ==========================================

  // Cambiar estado de una cama
  async cambiarEstado(id: number, nuevoEstado: EstadoCama): Promise<ApiResponse<Cama>> {
    try {
      const response = await firstValueFrom(
        this.http.patch<ApiResponse<Cama>>(`${this.API_URL}/${id}/estado`, { estado: nuevoEstado }, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in cambiarEstado:', error);
      throw error;
    }
  }

  // Obtener camas disponibles
  // async getCamasDisponibles(idServicio?: number): Promise<ApiResponse<Cama[]>> {
  //   try {
  //     let url = `${this.API_URL}/disponibles`;
  //     if (idServicio) {
  //       url += `?id_servicio=${idServicio}`;
  //     }

  //     const response = await firstValueFrom(
  //       this.http.get<ApiResponse<Cama[]>>(url, this.httpOptions)
  //     );
  //     return response;
  //   } catch (error) {
  //     console.error('Error in getCamasDisponibles:', error);
  //     throw error;
  //   }
  // }

  // Obtener camas disponibles
async getCamasDisponibles(idServicio?: number): Promise<ApiResponse<Cama[]>> {
  try {
    let url = this.API_URL; // http://localhost:3000/api/gestion-expedientes/camas

    // Usar query parameters
    if (idServicio) {
      url += `?id_servicio=${idServicio}&solo_disponibles=true`;
    } else {
      url += `?solo_disponibles=true`; // Solo camas disponibles
    }

    const response = await firstValueFrom(
      this.http.get<ApiResponse<Cama[]>>(url, this.httpOptions)
    );
    return response;
  } catch (error) {
    console.error('Error in getCamasDisponibles:', error);
    throw error;
  }
}

  // Obtener camas por servicio
  async getCamasPorServicio(idServicio: number): Promise<ApiResponse<Cama[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Cama[]>>(`${this.API_URL}/servicio/${idServicio}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getCamasPorServicio:', error);
      throw error;
    }
  }

  // Obtener camas por estado
  async getCamasPorEstado(estado: EstadoCama): Promise<ApiResponse<Cama[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Cama[]>>(`${this.API_URL}/estado/${estado}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getCamasPorEstado:', error);
      throw error;
    }
  }

  // Buscar camas por número
  async buscarPorNumero(numero: string): Promise<ApiResponse<Cama[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Cama[]>>(`${this.API_URL}/buscar?numero=${encodeURIComponent(numero)}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in buscarPorNumero:', error);
      throw error;
    }
  }

  // Obtener estadísticas de ocupación
  async getEstadisticas(): Promise<ApiResponse<any>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<any>>(`${this.API_URL}/estadisticas`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getEstadisticas:', error);
      throw error;
    }
  }

  // Obtener estadísticas por servicio
  async getEstadisticasPorServicio(): Promise<ApiResponse<any[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<any[]>>(`${this.API_URL}/estadisticas/servicios`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getEstadisticasPorServicio:', error);
      throw error;
    }
  }

  // Validar si una cama está disponible
  async validarDisponibilidad(id: number): Promise<ApiResponse<{ disponible: boolean; motivo?: string }>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ disponible: boolean; motivo?: string }>>(`${this.API_URL}/${id}/disponibilidad`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in validarDisponibilidad:', error);
      throw error;
    }
  }

  // Asignar paciente a cama
  async asignarPaciente(idCama: number, idExpediente: number): Promise<ApiResponse<Cama>> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Cama>>(`${this.API_URL}/${idCama}/asignar`, { id_expediente: idExpediente }, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in asignarPaciente:', error);
      throw error;
    }
  }

  // Liberar cama (quitar paciente)
  async liberarCama(idCama: number): Promise<ApiResponse<Cama>> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Cama>>(`${this.API_URL}/${idCama}/liberar`, {}, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in liberarCama:', error);
      throw error;
    }
  }

  // Obtener servicios (para dropdown)
  async getServicios(): Promise<ApiResponse<{ id: number; nombre: string }[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ id: number; nombre: string }[]>>(`${this.API_URL}/servicios`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getServicios:', error);
      throw error;
    }
  }

  // Verificar si un número de cama ya existe en el servicio
  async verificarNumeroExiste(numero: string, idServicio: number, excludeId?: number): Promise<ApiResponse<{ exists: boolean }>> {
    try {
      let url = `${this.API_URL}/verify-numero?numero=${encodeURIComponent(numero)}&id_servicio=${idServicio}`;
      if (excludeId) {
        url += `&excludeId=${excludeId}`;
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ exists: boolean }>>(url, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in verificarNumeroExiste:', error);
      throw error;
    }
  }

  // Obtener historial de cambios de estado de una cama
  async getHistorialEstados(idCama: number): Promise<ApiResponse<any[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<any[]>>(`${this.API_URL}/${idCama}/historial`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getHistorialEstados:', error);
      throw error;
    }
  }

  // Obtener reporte de ocupación por período
  async getReporteOcupacion(fechaInicio: string, fechaFin: string): Promise<ApiResponse<any>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<any>>(`${this.API_URL}/reporte/ocupacion?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getReporteOcupacion:', error);
      throw error;
    }
  }

  // Obtener camas que requieren mantenimiento
  async getCamasMantenimiento(): Promise<ApiResponse<Cama[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Cama[]>>(`${this.API_URL}/mantenimiento`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getCamasMantenimiento:', error);
      throw error;
    }
  }

  // Marcar cama para limpieza/descontaminación
  async marcarParaLimpieza(idCama: number, motivo: string): Promise<ApiResponse<Cama>> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Cama>>(`${this.API_URL}/${idCama}/limpieza`, { motivo }, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in marcarParaLimpieza:', error);
      throw error;
    }
  }

  // Completar limpieza de cama
  async completarLimpieza(idCama: number): Promise<ApiResponse<Cama>> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Cama>>(`${this.API_URL}/${idCama}/completar-limpieza`, {}, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in completarLimpieza:', error);
      throw error;
    }
  }

  // Obtener tiempo promedio de ocupación
  async getTiempoPromedioOcupacion(): Promise<ApiResponse<{ promedio_horas: number; promedio_dias: number }>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ promedio_horas: number; promedio_dias: number }>>(`${this.API_URL}/tiempo-promedio`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getTiempoPromedioOcupacion:', error);
      throw error;
    }
  }
}
