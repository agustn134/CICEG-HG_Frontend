import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { EstudioMedico, CreateEstudioMedicoDto, UpdateEstudioMedicoDto, EstudioMedicoFilters } from '../../models/estudio-medico.model';
import { ApiResponse } from '../../models/base.models';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class EstudiosMedicosService {
  private readonly API_URL = `${environment.BASE_URL}/api/catalogos/estudios-medicos`;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Obtener todos los estudios médicos
  async getAll(filters?: EstudioMedicoFilters): Promise<ApiResponse<EstudioMedico[]>> {
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
        this.http.get<ApiResponse<EstudioMedico[]>>(url, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  // Obtener un estudio médico por ID
  async getById(id: number): Promise<ApiResponse<EstudioMedico>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<EstudioMedico>>(`${this.API_URL}/${id}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  // Crear un nuevo estudio médico
  async create(estudio: CreateEstudioMedicoDto): Promise<ApiResponse<EstudioMedico>> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<EstudioMedico>>(this.API_URL, estudio, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  // Actualizar un estudio médico existente
  async update(id: number, estudio: Partial<CreateEstudioMedicoDto>): Promise<ApiResponse<EstudioMedico>> {
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<EstudioMedico>>(`${this.API_URL}/${id}`, estudio, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  // Eliminar un estudio médico
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

  // Buscar estudios médicos por término
  async search(term: string): Promise<ApiResponse<EstudioMedico[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<EstudioMedico[]>>(`${this.API_URL}/search?q=${encodeURIComponent(term)}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }

  // Obtener estudios por tipo
  async getByTipo(tipo: string): Promise<ApiResponse<EstudioMedico[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<EstudioMedico[]>>(`${this.API_URL}/tipo/${tipo}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getByTipo:', error);
      throw error;
    }
  }

  // Verificar si una clave ya existe
  async verifyClave(clave: string, excludeId?: number): Promise<ApiResponse<{ exists: boolean }>> {
    try {
      let url = `${this.API_URL}/verify-clave?clave=${encodeURIComponent(clave)}`;
      if (excludeId) {
        url += `&excludeId=${excludeId}`;
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ exists: boolean }>>(url, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in verifyClave:', error);
      throw error;
    }
  }
}
