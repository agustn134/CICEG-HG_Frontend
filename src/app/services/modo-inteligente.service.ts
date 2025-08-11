// src/app/services/modo-inteligente.service.ts
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CAMPOS_COMPARTIDOS, JERARQUIA_FORMULARIOS, CampoCompartido } from '../models/campos-compartidos.model';

@Injectable({
  providedIn: 'root'
})
export class ModoInteligenteService {
  private formularios: { [key: string]: FormGroup } = {};
  private configuracion = {
    activo: true,
    mostrarIndicadores: true,
    permitirEdicionDirecta: true
  };

  constructor() {}

  // Registrar formularios en el servicio
  registrarFormulario(nombre: string, formulario: FormGroup): void {
    this.formularios[nombre] = formulario;
  }

  // Verificar si un campo está completado en formularios de mayor jerarquía
  estaCompletoEnJerarquiaSuperior(nombreCampo: string, formularioActual: string): boolean {
    const campo = CAMPOS_COMPARTIDOS.find(c => c.nombre === nombreCampo);
    if (!campo) return false;

    // ✅ CORRECCIÓN: Usar as any o verificar existencia
    const jerarquiaActual = (JERARQUIA_FORMULARIOS as any)[formularioActual] || 999;
    
    for (const formularioNombre of campo.formularios) {
      // ✅ CORRECCIÓN: Usar as any o verificar existencia
      const jerarquiaFormulario = (JERARQUIA_FORMULARIOS as any)[formularioNombre] || 999;
      
      // Solo revisar formularios de mayor jerarquía (menor número)
      if (jerarquiaFormulario < jerarquiaActual) {
        const formulario = this.formularios[formularioNombre];
        if (formulario && this.tieneDatos(formulario, nombreCampo)) {
          return true;
        }
      }
    }
    
    return false;
  }

  // Obtener el valor de un campo desde el formulario de mayor jerarquía
  obtenerValorDesdeMayorJerarquia(nombreCampo: string, formularioActual: string): { valor: any, fuente: string } | null {
    const campo = CAMPOS_COMPARTIDOS.find(c => c.nombre === nombreCampo);
    if (!campo) return null;

    // ✅ CORRECCIÓN: Usar as any
    const jerarquiaActual = (JERARQUIA_FORMULARIOS as any)[formularioActual] || 999;
    let mejorValor: any = null;
    let mejorFuente = '';
    let mejorJerarquia = 999;

    for (const formularioNombre of campo.formularios) {
      // ✅ CORRECCIÓN: Usar as any
      const jerarquiaFormulario = (JERARQUIA_FORMULARIOS as any)[formularioNombre] || 999;
      
      if (jerarquiaFormulario < jerarquiaActual && jerarquiaFormulario < mejorJerarquia) {
        const formulario = this.formularios[formularioNombre];
        if (formulario && this.tieneDatos(formulario, nombreCampo)) {
          mejorValor = formulario.get(nombreCampo)?.value;
          mejorFuente = formularioNombre;
          mejorJerarquia = jerarquiaFormulario;
        }
      }
    }

    return mejorValor ? { valor: mejorValor, fuente: mejorFuente } : null;
  }

  // Verificar si un campo tiene datos
  private tieneDatos(formulario: FormGroup, nombreCampo: string): boolean {
    const control = formulario.get(nombreCampo);
    if (!control) return false;
    
    const valor = control.value;
    return valor !== null && valor !== undefined && valor !== '' && valor.toString().trim() !== '';
  }

  // Propagar datos desde formulario maestro
  propagarDesdeFormularioMaestro(formularioOrigen: string): void {
    const formularioOrigenRef = this.formularios[formularioOrigen];
    if (!formularioOrigenRef) return;

    CAMPOS_COMPARTIDOS.forEach(campo => {
      if (campo.formularios.includes(formularioOrigen) && this.tieneDatos(formularioOrigenRef, campo.nombre)) {
        const valor = formularioOrigenRef.get(campo.nombre)?.value;
        
        // Propagar a todos los demás formularios de menor jerarquía
        campo.formularios.forEach(formularioDestino => {
          if (formularioDestino !== formularioOrigen) {
            // ✅ CORRECCIÓN: Usar as any
            const jerarquiaOrigen = (JERARQUIA_FORMULARIOS as any)[formularioOrigen] || 999;
            const jerarquiaDestino = (JERARQUIA_FORMULARIOS as any)[formularioDestino] || 999;
            
            if (jerarquiaOrigen < jerarquiaDestino) {
              const formularioDestinoRef = this.formularios[formularioDestino];
              if (formularioDestinoRef && formularioDestinoRef.get(campo.nombre)) {
                formularioDestinoRef.patchValue({ [campo.nombre]: valor });
              }
            }
          }
        });
      }
    });
  }

  // Obtener datos para PDF con jerarquía
  obtenerDatoParaPDF(nombreCampo: string): string {
    const campo = CAMPOS_COMPARTIDOS.find(c => c.nombre === nombreCampo);
    if (!campo) return 'No especificado';

    let mejorValor = '';
    let mejorJerarquia = 999;

    campo.formularios.forEach(formularioNombre => {
      // ✅ CORRECCIÓN: Usar as any
      const jerarquia = (JERARQUIA_FORMULARIOS as any)[formularioNombre] || 999;
      const formulario = this.formularios[formularioNombre];
      
      if (formulario && this.tieneDatos(formulario, nombreCampo) && jerarquia < mejorJerarquia) {
        mejorValor = formulario.get(nombreCampo)?.value;
        mejorJerarquia = jerarquia;
      }
    });

    return mejorValor || 'No especificado';
  }

  // Obtener nombre amigable del formulario fuente
  obtenerNombreFuenteAmigable(formulario: string): string {
    const nombres: { [key: string]: string } = {
      'capturaIngreso': 'Captura Inicial',
      'historiaClinica': 'Historia Clínica',
      'notaUrgencias': 'Nota de Urgencias',
      'notaEvolucion': 'Nota de Evolución',
      'hojaFrontal': 'Hoja Frontal'
    };
    return nombres[formulario] || formulario;
  }

  // Habilitar/deshabilitar modo inteligente
  configurarModo(activo: boolean): void {
    this.configuracion.activo = activo;
  }

  isActivo(): boolean {
    return this.configuracion.activo;
  }
}