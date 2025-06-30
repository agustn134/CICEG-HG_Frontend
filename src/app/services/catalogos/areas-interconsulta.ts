// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class AreasInterconsulta {
//   private readonly API_URL = 'http://localhost:3000/api/catalogos/servicios';
//   constructor() { }
// }
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { AreaInterconsulta, CreateAreaInterconsultaDto, UpdateAreaInterconsultaDto, AreaInterconsultaFilters } from '../../models/area-interconsulta.model';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class AreasInterconsultaService {
  private readonly API_URL = 'http://localhost:3000/api/catalogos/areas-interconsulta';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Obtener todas las áreas de interconsulta
  async getAll(filters?: AreaInterconsultaFilters): Promise<ApiResponse<AreaInterconsulta[]>> {
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
        this.http.get<ApiResponse<AreaInterconsulta[]>>(url, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  // Obtener un área de interconsulta por ID
  async getById(id: number): Promise<ApiResponse<AreaInterconsulta>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<AreaInterconsulta>>(`${this.API_URL}/${id}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  // Crear una nueva área de interconsulta
  async create(areaInterconsulta: CreateAreaInterconsultaDto): Promise<ApiResponse<AreaInterconsulta>> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<AreaInterconsulta>>(this.API_URL, areaInterconsulta, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  // Actualizar un área de interconsulta existente
  async update(id: number, areaInterconsulta: Partial<CreateAreaInterconsultaDto>): Promise<ApiResponse<AreaInterconsulta>> {
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<AreaInterconsulta>>(`${this.API_URL}/${id}`, areaInterconsulta, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  // Eliminar un área de interconsulta
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

  // Obtener solo áreas activas (para selects)
  async getActivas(): Promise<ApiResponse<AreaInterconsulta[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<AreaInterconsulta[]>>(`${this.API_URL}/activas`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getActivas:', error);
      throw error;
    }
  }

  // Obtener estadísticas de interconsultas
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

  // Buscar áreas de interconsulta por término
  async search(term: string): Promise<ApiResponse<AreaInterconsulta[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<AreaInterconsulta[]>>(`${this.API_URL}/search?q=${encodeURIComponent(term)}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }

  // Verificar si un nombre ya existe
  async verifyNombre(nombre: string, excludeId?: number): Promise<ApiResponse<{ exists: boolean }>> {
    try {
      let url = `${this.API_URL}/verify-nombre?nombre=${encodeURIComponent(nombre)}`;
      if (excludeId) {
        url += `&excludeId=${excludeId}`;
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ exists: boolean }>>(url, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in verifyNombre:', error);
      throw error;
    }
  }

  // Obtener áreas con interconsultas pendientes
  async getAreasPendientes(): Promise<ApiResponse<AreaInterconsulta[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<AreaInterconsulta[]>>(`${this.API_URL}?con_interconsultas_pendientes=true`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getAreasPendientes:', error);
      throw error;
    }
  }

  // Obtener ranking de áreas más solicitadas
  async getRankingAreas(): Promise<ApiResponse<any[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<any[]>>(`${this.API_URL}/ranking`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getRankingAreas:', error);
      throw error;
    }
  }
}
