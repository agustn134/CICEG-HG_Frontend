// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class GuiasClinicas {

//   private readonly API_URL = 'http://localhost:3000/api/catalogos/guias-clinicas';

//   constructor() { }
// }
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { GuiaClinica, CreateGuiaClinicaDto, UpdateGuiaClinicaDto, GuiaClinicaFilters } from '../../models/guia-clinica.model';
import { ApiResponse } from '../../models/base.models';

@Injectable({
  providedIn: 'root'
})
export class GuiasClinicasService {
  private readonly API_URL = 'http://localhost:3000/api/catalogos/guias-clinicas';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Obtener todas las guías clínicas
  async getAll(filters?: GuiaClinicaFilters): Promise<ApiResponse<GuiaClinica[]>> {
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

  // Buscar guías clínicas por término
  async search(term: string): Promise<ApiResponse<GuiaClinica[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<GuiaClinica[]>>(`${this.API_URL}/search?q=${encodeURIComponent(term)}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }

  // Obtener guías clínicas por área
  async getByArea(area: string): Promise<ApiResponse<GuiaClinica[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<GuiaClinica[]>>(`${this.API_URL}/area/${encodeURIComponent(area)}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getByArea:', error);
      throw error;
    }
  }

  // Obtener guías clínicas por fuente
  async getByFuente(fuente: string): Promise<ApiResponse<GuiaClinica[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<GuiaClinica[]>>(`${this.API_URL}/fuente/${encodeURIComponent(fuente)}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getByFuente:', error);
      throw error;
    }
  }

  // Obtener guías clínicas por especialidad
  async getByEspecialidad(especialidad: string): Promise<ApiResponse<GuiaClinica[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<GuiaClinica[]>>(`${this.API_URL}/especialidad/${encodeURIComponent(especialidad)}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getByEspecialidad:', error);
      throw error;
    }
  }

  // Obtener guías aplicables a pediatría
  async getGuiasPediatricas(): Promise<ApiResponse<GuiaClinica[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<GuiaClinica[]>>(`${this.API_URL}/pediatricas`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getGuiasPediatricas:', error);
      throw error;
    }
  }

  // Obtener guías aplicables a adultos
  async getGuiasAdultos(): Promise<ApiResponse<GuiaClinica[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<GuiaClinica[]>>(`${this.API_URL}/adultos`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getGuiasAdultos:', error);
      throw error;
    }
  }

  // Obtener guías por nivel de evidencia
  async getByNivelEvidencia(nivel: string): Promise<ApiResponse<GuiaClinica[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<GuiaClinica[]>>(`${this.API_URL}/nivel-evidencia/${encodeURIComponent(nivel)}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getByNivelEvidencia:', error);
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

  // Obtener guías desactualizadas (más de X tiempo sin actualizar)
  async getGuiasDesactualizadas(meses: number = 24): Promise<ApiResponse<GuiaClinica[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<GuiaClinica[]>>(`${this.API_URL}/desactualizadas?meses=${meses}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getGuiasDesactualizadas:', error);
      throw error;
    }
  }

  // Obtener estadísticas de guías clínicas
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

  // Obtener todas las áreas disponibles
  async getAreas(): Promise<ApiResponse<string[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<string[]>>(`${this.API_URL}/areas`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getAreas:', error);
      throw error;
    }
  }

  // Obtener todas las fuentes disponibles
  async getFuentes(): Promise<ApiResponse<string[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<string[]>>(`${this.API_URL}/fuentes`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getFuentes:', error);
      throw error;
    }
  }

  // Obtener todas las especialidades disponibles
  async getEspecialidades(): Promise<ApiResponse<string[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<string[]>>(`${this.API_URL}/especialidades`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in getEspecialidades:', error);
      throw error;
    }
  }

  // Buscar por nombre o código
  async buscarPorNombreOCodigo(termino: string): Promise<ApiResponse<GuiaClinica[]>> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<GuiaClinica[]>>(`${this.API_URL}/buscar?termino=${encodeURIComponent(termino)}`, this.httpOptions)
      );
      return response;
    } catch (error) {
      console.error('Error in buscarPorNombreOCodigo:', error);
      throw error;
    }
  }
}
