// src/app/services/validaciones/validaciones-comunes.service.ts
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidacionesComunesService {

  // ==========================================
  // VALIDACIONES BÁSICAS REUTILIZABLES
  // ==========================================

  // Validación de CURP
  public static validarCURP(control: AbstractControl): ValidationErrors | null {
    const curp = control.value;
    if (!curp) return null;
    
    const curpRegex = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/;
    return curpRegex.test(curp) ? null : { curpInvalido: true };
  }

  // Validación de RFC
  public static validarRFC(control: AbstractControl): ValidationErrors | null {
    const rfc = control.value;
    if (!rfc) return null;
    
    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    return rfcRegex.test(rfc) ? null : { rfcInvalido: true };
  }

  // Validación de teléfono mexicano
  public static validarTelefono(control: AbstractControl): ValidationErrors | null {
    const telefono = control.value;
    if (!telefono) return null;
    
    const telefonoRegex = /^[0-9]{10}$/;
    return telefonoRegex.test(telefono.replace(/\D/g, '')) ? null : { telefonoInvalido: true };
  }

  // Validación de fecha no futura
  public static validarFechaNoFutura(control: AbstractControl): ValidationErrors | null {
    const fecha = new Date(control.value);
    const hoy = new Date();
    return fecha <= hoy ? null : { fechaFutura: true };
  }

  // Validación de edad mínima
  public static validarEdadMinima(edadMinima: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const fechaNacimiento = new Date(control.value);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      
      return edad >= edadMinima ? null : { edadMinima: { requiredAge: edadMinima, actualAge: edad } };
    };
  }

  // Validaciones específicas para NOM-004
  public static validarCampoObligatorioNOM004(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
      return { requiredNOM004: true };
    }
    return null;
  }

  // Obtener mensaje de error amigable
  public static obtenerMensajeError(nombreCampo: string, errores: ValidationErrors): string {
    if (errores['required'] || errores['requiredNOM004']) {
      return `${nombreCampo} es obligatorio según NOM-004`;
    }
    if (errores['curpInvalido']) {
      return 'CURP no válida. Formato: AAAA######HMCCCCC##';
    }
    if (errores['rfcInvalido']) {
      return 'RFC no válido. Formato: AAA######AAA';
    }
    if (errores['telefonoInvalido']) {
      return 'Teléfono debe tener 10 dígitos';
    }
    if (errores['fechaFutura']) {
      return 'La fecha no puede ser futura';
    }
    if (errores['edadMinima']) {
      return `Edad mínima requerida: ${errores['edadMinima'].requiredAge} años`;
    }
    if (errores['email']) {
      return 'Formato de email inválido';
    }
    return 'Campo inválido';
  }

  // Validar completitud del formulario para NOM-004
  public static validarCompletitudNOM004(formGroup: FormGroup, camposObligatorios: string[]): {
    completo: boolean;
    camposFaltantes: string[];
    porcentajeCompletitud: number;
  } {
    const camposFaltantes: string[] = [];
    
    camposObligatorios.forEach(campo => {
      const control = formGroup.get(campo);
      if (!control || !control.value || (typeof control.value === 'string' && control.value.trim() === '')) {
        camposFaltantes.push(campo);
      }
    });
    
    const porcentajeCompletitud = Math.round(((camposObligatorios.length - camposFaltantes.length) / camposObligatorios.length) * 100);
    
    return {
      completo: camposFaltantes.length === 0,
      camposFaltantes,
      porcentajeCompletitud
    };
  }
}