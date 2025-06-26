// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-notas-evolucion',
//   imports: [],
//   templateUrl: './notas-evolucion.html',
//   styleUrl: './notas-evolucion.css'
// })
// export class NotasEvolucion {

// }








// src/app/documentos-clinicos/notas-evolucion/notas-evolucion.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotaEvolucionService } from '../../services/documentos-clinicos/nota-evolucion.service';
import { NotaEvolucion } from '../../models/nota-evolucion.model';

@Component({
  selector: 'app-notas-evolucion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-6 max-w-7xl">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Notas de Evolución</h1>
        <p class="text-gray-600">Gestión de notas de evolución médica</p>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Buscar notas..."
              [(ngModel)]="filtroTexto"
              (input)="filtrarNotas()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            (click)="abrirModalCrear()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nueva Nota
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="cargando" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
        <div class="flex">
          <svg class="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- Tabla de Notas -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" *ngIf="!cargando && !error">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjetivo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objetivo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Análisis</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let nota of notasFiltradas; trackBy: trackByFn" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ nota.id_nota_evolucion }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ nota.id_documento }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {{ nota.subjetivo }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {{ nota.objetivo }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {{ nota.analisis }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {{ nota.plan }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      (click)="verDetalle(nota)"
                      class="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                    >
                      Ver
                    </button>
                    <button
                      (click)="editarNota(nota)"
                      class="text-green-600 hover:text-green-900 transition-colors duration-200"
                    >
                      Editar
                    </button>
                    <button
                      (click)="eliminarNota(nota.id_nota_evolucion)"
                      class="text-red-600 hover:text-red-900 transition-colors duration-200"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="notasFiltradas.length === 0">
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                  No se encontraron notas de evolución
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Paginación -->
      <div class="mt-6 flex items-center justify-between" *ngIf="notasFiltradas.length > 0">
        <div class="text-sm text-gray-700">
          Mostrando {{ notasFiltradas.length }} de {{ notas.length }} notas
        </div>
        <!-- Aquí puedes agregar controles de paginación si necesitas -->
      </div>
    </div>
  `,
  styles: [`
    .truncate {
      max-width: 200px;
    }
  `]
})
export class NotasEvolucionComponent implements OnInit {
  private notaEvolucionService = inject(NotaEvolucionService);

  notas: NotaEvolucion[] = [];
  notasFiltradas: NotaEvolucion[] = [];
  filtroTexto: string = '';
  cargando: boolean = false;
  error: string = '';

  ngOnInit(): void {
    this.cargarNotas();
  }

  cargarNotas(): void {
    this.cargando = true;
    this.error = '';

    this.notaEvolucionService.getAll().subscribe({
      next: (notas) => {
        this.notas = notas;
        this.notasFiltradas = [...notas];
        this.cargando = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las notas de evolución: ' + error;
        this.cargando = false;
      }
    });
  }

  filtrarNotas(): void {
    if (!this.filtroTexto) {
      this.notasFiltradas = [...this.notas];
      return;
    }

    const filtro = this.filtroTexto.toLowerCase();
    this.notasFiltradas = this.notas.filter(nota =>
      nota.subjetivo?.toLowerCase().includes(filtro) ||
      nota.objetivo?.toLowerCase().includes(filtro) ||
      nota.analisis?.toLowerCase().includes(filtro) ||
      nota.plan?.toLowerCase().includes(filtro) ||
      nota.id_nota_evolucion.toString().includes(filtro)
    );
  }

  abrirModalCrear(): void {
    // Implementar modal para crear nueva nota
    console.log('Abrir modal para crear nueva nota');
  }

  verDetalle(nota: NotaEvolucion): void {
    // Implementar vista de detalle
    console.log('Ver detalle de nota:', nota);
  }

  editarNota(nota: NotaEvolucion): void {
    // Implementar edición
    console.log('Editar nota:', nota);
  }

  eliminarNota(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta nota de evolución?')) {
      this.notaEvolucionService.delete(id).subscribe({
        next: () => {
          this.notas = this.notas.filter(n => n.id_nota_evolucion !== id);
          this.filtrarNotas();
          console.log('Nota eliminada exitosamente');
        },
        error: (error) => {
          this.error = 'Error al eliminar la nota: ' + error;
        }
      });
    }
  }

  trackByFn(index: number, nota: NotaEvolucion): number {
    return nota.id_nota_evolucion;
  }
}
