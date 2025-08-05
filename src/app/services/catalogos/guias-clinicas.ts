// src/app/services/catalogos/guias-clinicas.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GuiaClinica, CreateGuiaClinicaDto, UpdateGuiaClinicaDto, GuiaClinicaFilters } from '../../models/guia-clinica.model';
import { ApiResponse } from '../../models/base.models';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class GuiasClinicasService {
  private readonly API_URL = `${environment.apiUrl}/catalogos/guias-clinicas`;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Obtener todas las guías clínicas con filtros
  async getAll(filters?: GuiaClinicaFilters): Promise<ApiResponse<GuiaClinica[]>> {
    try {
      let params = new HttpParams();
      
      if (filters) {
        if (filters.area) params = params.set('area', filters.area);
        if (filters.fuente) params = params.set('fuente', filters.fuente);
        if (filters.codigo) params = params.set('codigo', filters.codigo);
        if (filters.buscar) params = params.set('buscar', filters.buscar);
        if (filters.activo !== undefined) params = params.set('activo', filters.activo.toString());
      }

      const url = params.toString() ? `${this.API_URL}?${params.toString()}` : this.API_URL;
      
      const response = await firstValueFrom(
        this.http.get<ApiResponse<GuiaClinica[]>>(url, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  // Obtener una guía clínica por ID
  async getById(id: number): Promise<ApiResponse<GuiaClinica>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<GuiaClinica>>(`${this.API_URL}/${id}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  // Crear una nueva guía clínica
  async create(guiaClinica: CreateGuiaClinicaDto): Promise<ApiResponse<GuiaClinica>> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<GuiaClinica>>(this.API_URL, guiaClinica, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  // Actualizar una guía clínica existente
  async update(id: number, guiaClinica: Partial<CreateGuiaClinicaDto>): Promise<ApiResponse<GuiaClinica>> {
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<GuiaClinica>>(`${this.API_URL}/${id}`, guiaClinica, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  // Eliminar una guía clínica
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

  // Obtener guías clínicas activas (para selects)
  async getActivas(area?: string): Promise<ApiResponse<GuiaClinica[]>> {
    try {
      let params = new HttpParams();
      if (area) {
        params = params.set('area', area);
      }

      const url = params.toString() ? `${this.API_URL}/activas?${params.toString()}` : `${this.API_URL}/activas`;

      const response = await firstValueFrom(
        this.http.get<ApiResponse<GuiaClinica[]>>(url, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getActivas:', error);
      throw error;
    }
  }

  // Obtener estadísticas
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

  // Búsqueda rápida por término
  async buscar(termino: string): Promise<ApiResponse<GuiaClinica[]>> {
    try {
      const params = new HttpParams().set('buscar', termino);
      const response = await firstValueFrom(
        this.http.get<ApiResponse<GuiaClinica[]>>(`${this.API_URL}?${params.toString()}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in buscar:', error);
      throw error;
    }
  }

  // Filtrar por área específica
  async filtrarPorArea(area: string): Promise<ApiResponse<GuiaClinica[]>> {
    try {
      const params = new HttpParams().set('area', area);
      const response = await firstValueFrom(
        this.http.get<ApiResponse<GuiaClinica[]>>(`${this.API_URL}?${params.toString()}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in filtrarPorArea:', error);
      throw error;
    }
  }

  // Filtrar por fuente específica
  async filtrarPorFuente(fuente: string): Promise<ApiResponse<GuiaClinica[]>> {
    try {
      const params = new HttpParams().set('fuente', fuente);
      const response = await firstValueFrom(
        this.http.get<ApiResponse<GuiaClinica[]>>(`${this.API_URL}?${params.toString()}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in filtrarPorFuente:', error);
      throw error;
    }
  }

  // Verificar si existe un código
  async verificarCodigo(codigo: string, excludeId?: number): Promise<ApiResponse<{ exists: boolean }>> {
    try {
      let params = new HttpParams().set('codigo', codigo);
      if (excludeId) {
        params = params.set('excludeId', excludeId.toString());
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ exists: boolean }>>(`${this.API_URL}/verificar-codigo?${params.toString()}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in verificarCodigo:', error);
      throw error;
    }
  }
}