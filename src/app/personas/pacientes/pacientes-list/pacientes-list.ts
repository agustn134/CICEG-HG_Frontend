// src/app/personas/pacientes/pacientes-list/pacientes-list.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacientesService } from '../../../services/personas/pacientes';
import { Paciente, ApiResponse } from '../../../models';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="mb-4">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
          placeholder="Buscar pacientes..."
          class="input-field max-w-md">
      </div>

      <div *ngIf="loading()" class="text-center py-4">
        <div class="spinner mx-auto"></div>
        <p class="mt-2 text-gray-600">Cargando pacientes...</p>
      </div>

      <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
        <p class="text-red-800">{{ error() }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let paciente of filteredPacientes(); trackBy: trackByPaciente"
             class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">

          <div class="flex items-center mb-3">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 font-medium">
                {{ getInitials(paciente) }}
              </span>
            </div>
            <div class="ml-3">
              <h3 class="font-medium text-gray-900">
                {{ getNombreCompleto(paciente) }}
              </h3>
              <p class="text-sm text-gray-500">
                Exp: {{ paciente.numero_expediente }}
              </p>
            </div>
          </div>

          <div class="space-y-1 text-sm text-gray-600">
            <div *ngIf="paciente.persona?.telefono" class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              {{ paciente.persona?.telefono }}
            </div>

            <div *ngIf="paciente.tipo_sangre" class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"/>
              </svg>
              Tipo: {{ paciente.tipo_sangre }}
            </div>

            <div class="flex items-center justify-between mt-3">
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    [class]="paciente.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ paciente.activo ? 'Activo' : 'Inactivo' }}
              </span>

              <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Ver detalles
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading() && filteredPacientes().length === 0" class="text-center py-8">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900">No hay pacientes</h3>
        <p class="text-gray-500">No se encontraron pacientes con los criterios de búsqueda</p>
      </div>
    </div>
  `
})
export class PacientesListComponent implements OnInit {
  // Signals
  pacientes = signal<Paciente[]>([]);
  filteredPacientes = signal<Paciente[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  searchTerm = '';

  constructor(private pacientesService: PacientesService) {}

  ngOnInit(): void {
    this.loadPacientes();
  }

  private loadPacientes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.pacientesService.getPacientes({ limit: 100 }).subscribe({
      next: (response: ApiResponse<Paciente[]>) => {
        if (response.success && response.data) {
          this.pacientes.set(response.data);
          this.filteredPacientes.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading pacientes:', error);
        this.error.set('Error al cargar pacientes');
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredPacientes.set(this.pacientes());
      return;
    }

    const filtered = this.pacientes().filter(p =>
      this.getNombreCompleto(p).toLowerCase().includes(term) ||
      p.numero_expediente.toLowerCase().includes(term) ||
      (p.persona?.curp && p.persona.curp.toLowerCase().includes(term))
    );

    this.filteredPacientes.set(filtered);
  }

  getNombreCompleto(paciente: Paciente): string {
    if (paciente.persona) {
      const apellidoMaterno = paciente.persona.apellido_materno ? ` ${paciente.persona.apellido_materno}` : '';
      return `${paciente.persona.nombre} ${paciente.persona.apellido_paterno}${apellidoMaterno}`;
    }
    return 'Sin nombre';
  }

  getInitials(paciente: Paciente): string {
    if (paciente.persona) {
      const nombre = paciente.persona.nombre.charAt(0).toUpperCase();
      const apellido = paciente.persona.apellido_paterno.charAt(0).toUpperCase();
      return `${nombre}${apellido}`;
    }
    return 'PA';
  }

  trackByPaciente(index: number, paciente: Paciente): number {
    return paciente.id_paciente;
  }
}
