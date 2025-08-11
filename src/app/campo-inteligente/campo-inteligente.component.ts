// src/app/campo-inteligente/campo-inteligente.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common'; // ✅ AGREGADO
import { ModoInteligenteService } from '../services/modo-inteligente.service';

@Component({
  selector: 'app-campo-inteligente',
  standalone: true, // ✅ AGREGADO para Angular 20
  imports: [CommonModule], // ✅ AGREGADO
  template: `
    <div class="campo-inteligente-container">
      <!-- Campo normal cuando debe mostrarse -->
      <div *ngIf="mostrarCampo" class="campo-normal">
        <ng-content></ng-content>
      </div>

      <!-- Indicador cuando está completado en formulario superior -->
      <div *ngIf="!mostrarCampo && estaCompletado" 
           class="campo-completado bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-green-700 font-medium">Completado en {{ fuenteAmigable }}</span>
          </div>
          
          <div class="flex items-center space-x-2">
            <!-- Botón ver -->
            <button 
              type="button"
              (click)="mostrarValor = !mostrarValor"
              class="text-green-600 hover:text-green-800 text-sm font-medium">
              {{ mostrarValor ? 'Ocultar' : 'Ver' }}
            </button>
            
            <!-- Botón editar -->
            <button 
              type="button"
              (click)="habilitarEdicion()"
              class="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors">
              Modificar
            </button>
          </div>
        </div>
        
        <!-- Valor mostrado cuando se expande -->
        <div *ngIf="mostrarValor" class="mt-3 p-3 bg-white border border-green-200 rounded text-sm text-gray-700">
          <strong>Valor:</strong> {{ valorCompleto }}
        </div>
      </div>

      <!-- Campo en modo edición -->
      <div *ngIf="modoEdicion" class="campo-edicion">
        <div class="mb-2">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.828-2.828z"></path>
            </svg>
            Editando (se sobrescribirá valor de {{ fuenteAmigable }})
          </span>
        </div>
        <ng-content></ng-content>
        <div class="mt-2 flex space-x-2">
          <button 
            type="button"
            (click)="guardarEdicion()"
            class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
            Guardar
          </button>
          <button 
            type="button"
            (click)="cancelarEdicion()"
            class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded text-sm">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `
})
export class CampoInteligenteComponent implements OnInit {
  @Input() nombreCampo!: string;
  @Input() formularioActual!: string;
  @Input() formulario!: FormGroup;
  @Input() obligatorio = false;
  @Output() valorCambiado = new EventEmitter<any>();
   @Input() mapeoDestino?: string;

  mostrarCampo = true;
  estaCompletado = false;
  valorCompleto = '';
  fuenteAmigable = '';
  mostrarValor = false;
  modoEdicion = false;

  constructor(private modoInteligenteService: ModoInteligenteService) {}

  ngOnInit(): void {
    this.evaluarEstadoCampo();
  }

  private evaluarEstadoCampo(): void {
    if (!this.modoInteligenteService.isActivo()) {
      this.mostrarCampo = true;
      return;
    }

    this.estaCompletado = this.modoInteligenteService.estaCompletoEnJerarquiaSuperior(
      this.nombreCampo, 
      this.formularioActual
    );

    if (this.estaCompletado) {
      const resultado = this.modoInteligenteService.obtenerValorDesdeMayorJerarquia(
        this.nombreCampo, 
        this.formularioActual
      );
      
      if (resultado) {
        this.valorCompleto = resultado.valor;
        this.fuenteAmigable = this.modoInteligenteService.obtenerNombreFuenteAmigable(resultado.fuente);
        this.mostrarCampo = false;
      }
    }
  }

  habilitarEdicion(): void {
    this.modoEdicion = true;
    this.mostrarCampo = true;
  }

  guardarEdicion(): void {
    this.modoEdicion = false;
    this.evaluarEstadoCampo();
    this.valorCambiado.emit(this.formulario.get(this.nombreCampo)?.value);
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.mostrarCampo = false;
  }
}