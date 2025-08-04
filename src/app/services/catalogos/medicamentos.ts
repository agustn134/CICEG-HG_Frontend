import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Medicamento, CreateMedicamentoDto, UpdateMedicamentoDto, MedicamentoFilters } from '../../models/medicamento.model';
import { ApiResponse } from '../../models/base.models';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class MedicamentosService {
  private readonly API_URL = `${environment.apiUrl}/catalogos/medicamentos`;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Obtener todos los medicamentos
  async getAll(filters?: MedicamentoFilters): Promise<ApiResponse<Medicamento[]>> {
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
        this.http.get<ApiResponse<Medicamento[]>>(url, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  // Obtener un medicamento por ID
  async getById(id: number): Promise<ApiResponse<Medicamento>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Medicamento>>(`${this.API_URL}/${id}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  // Crear un nuevo medicamento
  async create(medicamento: CreateMedicamentoDto): Promise<ApiResponse<Medicamento>> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Medicamento>>(this.API_URL, medicamento, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  // Actualizar un medicamento existente
  async update(id: number, medicamento: Partial<CreateMedicamentoDto>): Promise<ApiResponse<Medicamento>> {
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<Medicamento>>(`${this.API_URL}/${id}`, medicamento, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  // Eliminar un medicamento
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

  // Buscar medicamentos por término
  async search(term: string): Promise<ApiResponse<Medicamento[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Medicamento[]>>(`${this.API_URL}/search?q=${encodeURIComponent(term)}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }

  // Obtener medicamentos por grupo terapéutico
  async getByGrupoTerapeutico(grupo: string): Promise<ApiResponse<Medicamento[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Medicamento[]>>(`${this.API_URL}/grupo/${encodeURIComponent(grupo)}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getByGrupoTerapeutico:', error);
      throw error;
    }
  }

  // Obtener medicamentos por presentación
  async getByPresentacion(presentacion: string): Promise<ApiResponse<Medicamento[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Medicamento[]>>(`${this.API_URL}/presentacion/${encodeURIComponent(presentacion)}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getByPresentacion:', error);
      throw error;
    }
  }

  // Obtener medicamentos por vía de administración
  async getByViaAdministracion(via: string): Promise<ApiResponse<Medicamento[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Medicamento[]>>(`${this.API_URL}/via/${encodeURIComponent(via)}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getByViaAdministracion:', error);
      throw error;
    }
  }

  // Obtener medicamentos por laboratorio
  async getByLaboratorio(laboratorio: string): Promise<ApiResponse<Medicamento[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Medicamento[]>>(`${this.API_URL}/laboratorio/${encodeURIComponent(laboratorio)}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getByLaboratorio:', error);
      throw error;
    }
  }

  // Verificar si un código ya existe
  async verifyCodigo(codigo: string, excludeId?: number): Promise<ApiResponse<{ exists: boolean }>> {
    try {
      let url = `${this.API_URL}/verify-codigo?codigo=${encodeURIComponent(codigo)}`;
      if (excludeId) {
        url += `&excludeId=${excludeId}`;
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ exists: boolean }>>(url, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in verifyCodigo:', error);
      throw error;
    }
  }

  // Obtener medicamentos más prescritos
  async getMasPrescitos(limit: number = 10): Promise<ApiResponse<Medicamento[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Medicamento[]>>(`${this.API_URL}/mas-prescritos?limit=${limit}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getMasPrescitos:', error);
      throw error;
    }
  }

  // Obtener estadísticas de medicamentos
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

  // Buscar por nombre comercial o genérico
  async buscarPorNombre(nombre: string): Promise<ApiResponse<Medicamento[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Medicamento[]>>(`${this.API_URL}/buscar-nombre?nombre=${encodeURIComponent(nombre)}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in buscarPorNombre:', error);
      throw error;
    }
  }

  // Obtener grupos terapéuticos disponibles
  async getGruposTerapeuticos(): Promise<ApiResponse<string[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<string[]>>(`${this.API_URL}/grupos-terapeuticos`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getGruposTerapeuticos:', error);
      throw error;
    }
  }

  // Obtener presentaciones disponibles
  async getPresentaciones(): Promise<ApiResponse<string[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<string[]>>(`${this.API_URL}/presentaciones`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getPresentaciones:', error);
      throw error;
    }
  }
}
