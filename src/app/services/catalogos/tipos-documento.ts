// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class TiposDocumento {

//   private readonly API_URL = 'http://localhost:3000/api/catalogos/tipos-documento';

//   constructor() { }
// }
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { TipoDocumento, CreateTipoDocumentoDto, UpdateTipoDocumentoDto, TipoDocumentoFilters } from '../../models/tipo-documento.model';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class TiposDocumentoService {
  private readonly API_URL = 'http://localhost:3000/api/catalogos/tipos-documento';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Obtener todos los tipos de documento
  async getAll(filters?: TipoDocumentoFilters): Promise<ApiResponse<TipoDocumento[]>> {
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
        this.http.get<ApiResponse<TipoDocumento[]>>(url, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  // Obtener un tipo de documento por ID
  async getById(id: number): Promise<ApiResponse<TipoDocumento>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<TipoDocumento>>(`${this.API_URL}/${id}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  // Crear un nuevo tipo de documento
  async create(tipoDocumento: CreateTipoDocumentoDto): Promise<ApiResponse<TipoDocumento>> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<TipoDocumento>>(this.API_URL, tipoDocumento, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  // Actualizar un tipo de documento existente
  async update(id: number, tipoDocumento: Partial<CreateTipoDocumentoDto>): Promise<ApiResponse<TipoDocumento>> {
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<TipoDocumento>>(`${this.API_URL}/${id}`, tipoDocumento, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  // Eliminar un tipo de documento
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

  // Buscar tipos de documento por término
  async search(term: string): Promise<ApiResponse<TipoDocumento[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<TipoDocumento[]>>(`${this.API_URL}/search?q=${encodeURIComponent(term)}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }

  // Obtener tipos de documento por categoría
  async getByCategoria(categoria: string): Promise<ApiResponse<TipoDocumento[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<TipoDocumento[]>>(`${this.API_URL}/categoria/${categoria}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getByCategoria:', error);
      throw error;
    }
  }

  // Obtener tipos de documento que requieren firma médica
  async getTiposConFirmaMedico(): Promise<ApiResponse<TipoDocumento[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<TipoDocumento[]>>(`${this.API_URL}/requiere-firma-medico`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getTiposConFirmaMedico:', error);
      throw error;
    }
  }

  // Obtener tipos de documento con plantilla disponible
  async getTiposConPlantilla(): Promise<ApiResponse<TipoDocumento[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<TipoDocumento[]>>(`${this.API_URL}/con-plantilla`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getTiposConPlantilla:', error);
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

  // Reordenar tipos de documento por orden de impresión
  async reorderTipos(tiposOrdenados: { id: number; orden: number }[]): Promise<ApiResponse<void>> {
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<void>>(`${this.API_URL}/reorder`, { tipos: tiposOrdenados }, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in reorderTipos:', error);
      throw error;
    }
  }
}
