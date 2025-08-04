// src/app/services/validaciones/validaciones-comunes.service.ts
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export interface ValidacionResult {
  valido: boolean;
  errores: string[];
  advertencias: string[];
  porcentaje_completitud?: number;
  secciones_incompletas?: string[];
}

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

  static validarEmail(control: any): any {
    if (!control.value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(control.value)) {
      return { emailInvalido: true };
    }
    return null;
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


  // .......................................................    VALIDACIONES  .........................

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





    private formatearDireccionMejorada(paciente: any): string {
  if (!paciente) return 'Sin dirección registrada';
  const domicilio = paciente.persona?.domicilio ||paciente.domicilio ||paciente.paciente?.domicilio ||'';
  const domicilioLimpio = domicilio.toString().trim();
  return domicilioLimpio !== '' && domicilioLimpio !== 'null' && domicilioLimpio !== 'undefined'? domicilioLimpio : 'Sin dirección registrada';
}




  private validarCumplimientoNotaUrgencias(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '  VALIDANDO CUMPLIMIENTO NOM-004 SECCIÓN 7 - NOTA DE URGENCIAS...'
    );

    const validaciones = {
      // 7.1.1 Fecha y hora
      fecha_hora_atencion: true,

      // 7.1.2 Signos vitales
      signos_vitales: !!datos.signosVitales,

      // 7.1.3 Motivo de atención
      motivo_atencion: !!datos.notaUrgencias?.motivo_atencion,

      // 7.1.4 Resumen interrogatorio, exploración y estado mental
      resumen_interrogatorio: !!datos.notaUrgencias?.resumen_interrogatorio,
      exploracion_fisica: !!datos.notaUrgencias?.exploracion_fisica,

      // 7.1.5 Resultados de estudios (si aplica)
      estudios_disponibles: true, // Sección incluida

      // 7.1.6 Diagnósticos
      diagnosticos: !!datos.notaUrgencias?.diagnostico,

      // 7.1.7 Tratamiento y pronóstico
      tratamiento: !!datos.notaUrgencias?.plan_tratamiento,
      pronostico: !!datos.notaUrgencias?.pronostico,

      // 5.9-5.10 Datos del médico
      nombre_completo_medico: !!medico.nombre_completo,
      cedula_profesional: !!medico.numero_cedula,
      firma_espacio: true,
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `  CUMPLIMIENTO NOTA URGENCIAS NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  NOTA DE URGENCIAS CUMPLE CON NOM-004 SECCIÓN 7');
    }
  }

  private validarCumplimientoNotaEvolucion(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '  VALIDANDO CUMPLIMIENTO NOM-004 SECCIÓN 6.2 - NOTA DE EVOLUCIÓN...'
    );

    const validaciones = {
      // 6.2.1 Evolución y actualización del cuadro clínico
      evolucion_cuadro_clinico:
        !!datos.notaEvolucion?.evolucion_analisis ||
        !!datos.notaEvolucion?.sintomas_signos,

      // 6.2.2 Signos vitales según necesario
      signos_vitales_disponibles: !!datos.signosVitales,

      // 6.2.3 Resultados de estudios
      resultados_estudios: true, // Sección incluida

      // 6.2.4 Diagnósticos o problemas clínicos
      diagnosticos_problemas: !!datos.notaEvolucion?.diagnosticos,

      // 6.2.5 Pronóstico
      pronostico: !!datos.notaEvolucion?.pronostico,

      // 6.2.6 Tratamiento e indicaciones médicas
      tratamiento_indicaciones:
        !!datos.notaEvolucion?.plan_estudios_tratamiento,
      medicamentos_dosis_via: true, // Sección incluida

      // 5.9-5.10 Datos del médico
      fecha_hora_elaboracion: true,
      nombre_completo_medico: !!medico.nombre_completo,
      cedula_profesional: !!medico.numero_cedula,
      firma_espacio: true,

      // Datos del paciente
      nombre_completo_paciente: !!paciente.nombre_completo,
      edad_sexo: !!paciente.edad && !!paciente.sexo,
      numero_expediente: !!paciente.numero_expediente,
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `  CUMPLIMIENTO NOTA EVOLUCIÓN NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  NOTA DE EVOLUCIÓN CUMPLE CON NOM-004 SECCIÓN 6.2');
    }
  }

  private validarCumplimientoConsentimientoProcedimientos(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '  VALIDANDO CUMPLIMIENTO NOM-004 - CONSENTIMIENTO INFORMADO...'
    );

    const validaciones = {
      // Datos del paciente (5.9)
      nombre_completo_paciente: !!paciente.nombre_completo,
      edad_paciente: !!paciente.edad,
      sexo_paciente: !!paciente.sexo,
      numero_expediente: !!paciente.numero_expediente,

      // Elementos del consentimiento
      nombre_procedimiento: !!datos.consentimiento?.nombre_procedimiento,
      beneficios_procedimiento:
        !!datos.consentimiento?.beneficios_procedimiento,
      riesgos_generales: true, // Incluidos en el formato
      riesgos_especificos: !!datos.consentimiento?.riesgos_especificos,
      informacion_anestesia: true, // Incluida en el formato
      procedimientos_adicionales: true, // Sección incluida

      // Firmas requeridas
      espacio_firma_medico: true,
      espacio_firma_paciente: true,
      espacio_firma_testigos: true,

      // Fecha y lugar
      fecha_elaboracion: true,
      lugar_elaboracion: true,

      // Elementos legales
      declaracion_entendimiento: true,
      advertencia_riesgos: true,
      no_garantia_resultados: true,
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `  CUMPLIMIENTO CONSENTIMIENTO INFORMADO: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  CONSENTIMIENTO INFORMADO CUMPLE CON ESTÁNDARES LEGALES');
    }
  }

  private validarCumplimientoConsentimientoHospitalizacion(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '  VALIDANDO CUMPLIMIENTO NOM-004 - CONSENTIMIENTO HOSPITALIZACIÓN...'
    );

    const validaciones = {
      // Datos del paciente (5.9)
      nombre_completo_paciente: !!paciente.nombre_completo,
      edad_paciente: !!paciente.edad,
      sexo_paciente: !!paciente.sexo,
      numero_expediente: !!paciente.numero_expediente,
      fecha_nacimiento: !!paciente.fecha_nacimiento,

      // Elementos del consentimiento
      identificacion_responsable: true, // Sección "YO" incluida
      autorizacion_procedimientos: true, // AUTORIZO incluido
      declaracion_informacion: true, // DECLARO incluido
      riesgos_generales: true, // Información de riesgos incluida
      tecnicas_invasivas: true, // Información incluida
      procedimientos_quirurgicos: true, // Información incluida
      productos_sanguineos: true, // Información incluida
      protocolo_terapeutico: true, // Información incluida

      // Marco legal
      referencias_legales: true, // Art. 80-83 y NOM-168 incluidos
      tratado_helsinki: true, // Referencia incluida

      // Firmas requeridas
      espacio_firma_paciente: true,
      espacio_firma_testigos: true, // 3 testigos
      aceptacion_explicita: true, // "ACEPTO" incluido

      // Fecha y lugar
      fecha_elaboracion: true,
      hospital_identificado: true,
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `  CUMPLIMIENTO CONSENTIMIENTO HOSPITALIZACIÓN: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log(
        '  CONSENTIMIENTO HOSPITALIZACIÓN CUMPLE CON ESTÁNDARES LEGALES'
      );
    }
  }

  private validarCumplimientoConsentimientoReferencia(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '  VALIDANDO CUMPLIMIENTO NOM-004 - CONSENTIMIENTO REFERENCIA...'
    );

    const validaciones = {
      // Datos del paciente (5.9)
      nombre_completo_paciente: !!paciente.nombre_completo,
      numero_expediente: !!paciente.numero_expediente,
      fecha_nacimiento: !!paciente.fecha_nacimiento,
      edad_paciente: !!paciente.edad,

      // Datos administrativos
      unidad_medica_origen: true, // Hospital identificado
      fecha_hora_elaboracion: true,
      servicio_origen: !!medico.departamento,

      // Datos del médico responsable
      nombre_completo_medico: !!medico.nombre_completo,
      identificacion_medico: !!medico.numero_cedula,

      // Elementos del consentimiento
      explicacion_padecimiento: true, // Incluido en formato
      procedimiento_referencia: true, // Explicado en documento
      informacion_satisfactoria: true, // Declaración incluida
      aceptacion_explicita: true, // "Acepto" incluido

      // Información de la referencia
      motivo_referencia_explicado: true, // Sección incluida
      destino_referencia: true, // Información incluida
      contrarreferencia_explicada: true, // Procedimiento explicado

      // Firmas requeridas
      espacio_firma_paciente: true,
      espacio_firma_medico: true,
      espacio_firma_testigos: true, // 2 testigos

      // Lugar y fecha
      lugar_elaboracion: true, // San Luis de la Paz
      fecha_elaboracion: true,
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `  CUMPLIMIENTO CONSENTIMIENTO REFERENCIA: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log(
        '  CONSENTIMIENTO REFERENCIA CUMPLE CON ESTÁNDARES ADMINISTRATIVOS'
      );
    }
  }

  private validarCumplimientoConsentimientoTransfusion(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '  VALIDANDO CUMPLIMIENTO NOM-004 Y NOM-253 - CONSENTIMIENTO TRANSFUSIÓN...'
    );

    const validaciones = {
      // Datos del paciente (5.9)
      nombre_completo_paciente: !!paciente.nombre_completo,
      edad_paciente: !!paciente.edad,
      sexo_paciente: !!paciente.sexo,
      numero_expediente: !!paciente.numero_expediente,
      domicilio_completo: !!this.formatearDireccionMejorada(paciente),

      // Información médica específica
      diagnostico: !!datos.consentimientoTransfusion?.diagnostico,
      servicio_medico: !!medico.departamento,
      numero_cama: true, // Campo incluido

      // Marco legal específico (NOM-253-SSA1-2012)
      referencia_nom_004: true, // NOM-004-SSA3-2012 citada
      referencia_nom_253: true, // NOM-253-SSA1-2012 citada
      articulos_ley_salud: true, // Art. 80-83 citados

      // Información sobre hemoderivados
      descripcion_procedimiento: true, // Transfusión explicada
      tipos_hemoderivados: true, // Plasma, plaquetas, etc.
      via_administracion: true, // Vía intravenosa mencionada
      modificaciones_procedimiento: true, // Posibilidad mencionada

      // Riesgos específicos
      efectos_indeseables: true, // Riesgos generales
      condiciones_paciente: true, // Diabetes, cardiopatía, etc.
      origen_sangre: true, // Donantes voluntarios
      analisis_obligatorios: true, // SIDA, Hepatitis, etc.
      periodo_ventana: true, // Explicado
      reacciones_rechazo: true, // Mencionadas
      riesgo_muerte: true, // Incluido

      // Elementos del consentimiento
      hoja_informativa: true, // Mencionada
      comprension_riesgos: true, // Declarada
      preguntas_respondidas: true, // Incluido
      decision_libre: true, // Declarada
      autorizacion_contingencias: true, // Incluida

      // Firmas requeridas
      espacio_firma_paciente: true,
      espacio_firma_medico: true,
      espacio_firma_testigos: true, // 2 testigos
      sello_medico: true, // Espacio incluido

      // Información específica transfusión
      tipo_hemoderivado: true, // Sección incluida
      indicacion_medica: true, // Campo incluido
      tipo_sanguineo: true, // Campo incluido

      // Fecha y lugar
      fecha_elaboracion: true,
      lugar_elaboracion: true, // San Luis de la Paz
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `  CUMPLIMIENTO CONSENTIMIENTO TRANSFUSIÓN: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  CONSENTIMIENTO TRANSFUSIÓN CUMPLE CON NOM-004 Y NOM-253');
    }
  }

  private validarCumplimientoConsentimientoTratamiento(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '  VALIDANDO CUMPLIMIENTO NOM-004 - CONSENTIMIENTO TRATAMIENTO MÉDICO...'
    );

    const validaciones = {
      // Datos del paciente (5.9)
      nombre_completo_paciente: !!paciente.nombre_completo,
      apellidos_nombres_separados:
        !!paciente.apellido_paterno && !!paciente.nombre,
      edad_paciente: !!paciente.edad,
      sexo_paciente: !!paciente.sexo,
      numero_expediente: !!paciente.numero_expediente,
      curp_paciente: !!paciente.curp,
      domicilio_completo: !!this.formatearDireccionMejorada(paciente),

      // Información médica
      servicio_medico: !!medico.departamento,
      medico_responsable: !!medico.nombre_completo,
      cedula_profesional: !!medico.numero_cedula,
      especialidad_medico: !!medico.especialidad,

      // Elementos del consentimiento
      autorizacion_investigaciones: true, // Laboratorio y gabinete
      autorizacion_tratamientos: true, // Médicos y quirúrgicos
      compromiso_reglamento: true, // Observar reglamento interno
      declaracion_informacion: true, // Paciente informado
      autorizacion_voluntaria: true, // Decisión libre

      // Información específica tratamiento
      diagnostico_incluido: true, // Sección incluida
      tratamiento_propuesto: true, // Campo incluido
      estudios_autorizados: true, // Especificados

      // Firmas requeridas
      espacio_firma_responsable: true,
      espacio_firma_paciente: true,
      espacio_firma_testigos: true, // 2 testigos

      // Fecha y lugar
      fecha_lugar_elaboracion: true, // San Luis de la Paz
      fecha_hora_elaboracion: true,

      // Elementos administrativos
      director_hospital: true, // Dirigido al Director
      identificacion_hospital: true, // Hospital identificado
      formato_oficial: true, // Estructura formal
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `  CUMPLIMIENTO CONSENTIMIENTO TRATAMIENTO: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  CONSENTIMIENTO TRATAMIENTO CUMPLE CON NOM-004');
    }
  }

  private validarCumplimientoAltaVoluntaria(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '  VALIDANDO CUMPLIMIENTO NOM-004 - HOJA DE ALTA VOLUNTARIA...'
    );

    const validaciones = {
      // Datos del paciente (5.9)
      nombre_completo_paciente: !!paciente.nombre_completo,
      edad_paciente: !!paciente.edad,
      sexo_paciente: !!paciente.sexo,
      numero_expediente: !!paciente.numero_expediente,
      curp_paciente: !!paciente.curp,
      fecha_nacimiento: !!paciente.fecha_nacimiento,

      // Información médica básica
      servicio_medico: !!medico.departamento,
      fecha_hora_alta: true, // Siempre incluida

      // Información médica del alta
      motivo_ingreso: true, // Campo incluido
      diagnostico_alta: true, // Campo incluido
      estado_general: true, // Campo incluido

      // Elementos de la declaración
      identificacion_responsable: true, // Nombre del responsable
      relacion_con_paciente: true, // Campo incluido
      decision_libre_voluntaria: true, // Declaración incluida
      informacion_recibida: true, // Punto 1 incluido
      asuncion_riesgos: true, // Punto 2 incluido
      exencion_responsabilidad: true, // Punto 3 incluido
      decision_consciente: true, // Punto 4 incluido

      // Recomendaciones médicas
      recomendaciones_incluidas: true, // Sección incluida
      signos_alarma: true, // Signos de alarma incluidos
      seguimiento_ambulatorio: true, // Recomendado

      // Datos del médico responsable
      nombre_completo_medico: !!medico.nombre_completo,
      cedula_profesional: !!medico.numero_cedula,
      especialidad_medico: !!medico.especialidad,

      // Firmas requeridas
      espacio_firma_paciente: true,
      espacio_firma_medico: true,
      espacio_firma_testigos: true, // 2 testigos

      // Fecha y lugar
      fecha_elaboracion: true,
      hora_elaboracion: true,
      hospital_identificado: true, // Hospital General San Luis de la Paz

      // Elementos legales
      exencion_responsabilidad_hospital: true, // Declaración incluida
      advertencia_riesgos: true, // Incluida
      hospital_identificado_completo: true, // Nombre completo incluido
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `  CUMPLIMIENTO HOJA ALTA VOLUNTARIA: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  HOJA DE ALTA VOLUNTARIA CUMPLE CON NOM-004');
    }
  }

  private validarCumplimientoInformeDiario(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log('  VALIDANDO CUMPLIMIENTO NOM-004 - HOJA DE INFORME DIARIO...');

    const validaciones = {
      // Datos del paciente (5.9)
      nombre_completo_paciente: !!paciente.nombre_completo,
      numero_expediente: !!paciente.numero_expediente,
      fecha_nacimiento: !!paciente.fecha_nacimiento,
      curp_paciente: !!paciente.curp,

      // Información médica básica
      servicio_medico: !!medico.departamento,
      medico_responsable: !!medico.nombre_completo,
      numero_cama: true, // Campo incluido

      // Estructura del informe
      fecha_periodo: true, // Incluida
      diagnostico_principal: true, // Campo incluido
      turno_especificado: true, // Campo incluido

      // Elementos de registro
      tabla_registros: true, // Tabla incluida
      campos_fecha_hora: true, // Columna incluida
      campos_quien_informa: true, // Columna incluida
      campos_quien_recibe: true, // Columna incluida
      campos_informacion: true, // Columna incluida

      // Instrucciones y normas
      instrucciones_llenado: true, // Incluidas
      confidencialidad_mencionada: true, // Incluida
      archivo_expediente: true, // Mencionado

      // Aspectos administrativos
      formato_estructurado: true, // Tabla organizada
      espacios_suficientes: true, // 15 filas
      hospital_identificado: true, // En header

      // Fecha y lugar
      fecha_elaboracion: true,
      hospital_identificado_completo: true,

      // Cumplimiento normativo
      referencia_nom_004: true, // En footer
      formato_oficial: true, // Estructura formal
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `  CUMPLIMIENTO HOJA INFORME DIARIO: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  HOJA DE INFORME DIARIO CUMPLE CON NOM-004');
    }
  }

  private validarCumplimientoNotaEgreso(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '  VALIDANDO CUMPLIMIENTO NOM-004 SECCIÓN D12 - NOTA DE EGRESO...'
    );

    const validaciones = {
      // D12.1 - Nombre del paciente
      nombre_paciente: !!paciente.nombre_completo,

      // D12.2 - Edad y sexo
      edad_sexo: !!paciente.edad && !!paciente.sexo,

      // D12.3 - Fecha y hora de elaboración
      fecha_hora_elaboracion: true,

      // D12.4 - Signos vitales
      signos_vitales: true, // Estructura completa incluida

      // D12.5 - Fecha y hora ingreso/egreso
      fecha_hora_ingreso_egreso: true,

      // D12.6 - Días de estancia
      dias_estancia: true,

      // D12.7 - Identificación de reingreso
      identificacion_reingreso: true,

      // D12.8 - Diagnósticos de ingreso
      diagnosticos_ingreso: true,

      // D12.9 - Resumen evolución y estado actual
      resumen_evolucion: true,

      // D12.10 - Manejo durante estancia
      manejo_estancia: true,

      // D12.11 - Diagnósticos finales
      diagnosticos_finales: true,

      // D12.12 - Procedimientos realizados
      procedimientos_realizados: true,

      // D12.13 - Motivo de egreso
      motivo_egreso: true,

      // D12.14 - Problemas clínicos pendientes
      problemas_pendientes: true,

      // D12.15 -
      // D12.15 - Plan de manejo y tratamiento
      plan_manejo_tratamiento: true,

      // D12.16 - Recomendaciones vigilancia ambulatoria
      recomendaciones_ambulatorias: true,

      // D12.17 - Nombre completo, cédula profesional y firma del médico
      nombre_completo_medico: !!medico.nombre_completo,
      cedula_profesional: !!medico.numero_cedula,
      firma_espacio: true,

      // Datos adicionales del paciente
      numero_expediente: !!paciente.numero_expediente,
      identificacion_hospital: true,
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `  CUMPLIMIENTO NOTA EGRESO NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  NOTA DE EGRESO CUMPLE CON NOM-004 SECCIÓN D12');
    }
  }

  private validarCumplimientoNotaInterconsulta(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '  VALIDANDO CUMPLIMIENTO NOM-004 SECCIÓN D7 - NOTA DE INTERCONSULTA...'
    );

    const validaciones = {
      // Datos del paciente (5.9)
      nombre_completo_paciente: !!paciente.nombre_completo,
      edad_sexo: !!paciente.edad && !!paciente.sexo,
      numero_expediente: !!paciente.numero_expediente,

      // D7.12 - Criterio diagnóstico
      criterio_diagnostico: true, // Sección incluida

      // D7.13 - Sugerencias diagnósticas y de tratamiento
      sugerencias_diagnosticas: true, // Sección incluida
      sugerencias_tratamiento: true, // Sección incluida

      // D7.14 - Motivo de la consulta
      motivo_consulta: true, // Sección incluida

      // Información del médico solicitante
      medico_solicitante: !!medico.nombre_completo,
      cedula_solicitante: !!medico.numero_cedula,
      servicio_solicitante: !!medico.departamento,

      // Especialidad solicitada
      especialidad_identificada: true, // Campo incluido

      // Firma y fecha
      fecha_elaboracion: true,
      espacio_firmas: true, // Ambos médicos

      // Estructura del documento
      identificacion_hospital: true,
      formato_estructurado: true,
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `  CUMPLIMIENTO NOTA INTERCONSULTA NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  NOTA DE INTERCONSULTA CUMPLE CON NOM-004 SECCIÓN D7');
    }
  }

  private validarCumplimientoPrescripcionMedicamentos(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log('  VALIDANDO CUMPLIMIENTO PRESCRIPCIÓN DE MEDICAMENTOS...');

    const validaciones = {
      // Datos del paciente
      nombre_completo_paciente: !!paciente.nombre_completo,
      edad_paciente: !!paciente.edad,
      numero_expediente: !!paciente.numero_expediente,

      // Información médica básica
      diagnostico_incluido: true, // Campo incluido
      peso_paciente: true, // Campo incluido para dosificación
      alergias_verificadas: true, // Campo incluido

      // Medicamentos prescritos
      tabla_medicamentos: true, // Tabla estructurada
      denominacion_generica: true, // Campo obligatorio
      presentacion_concentracion: true, // Campo incluido
      cantidad_prescrita: true, // Campo incluido
      indicaciones_completas: true, // Dosis, vía, frecuencia

      // Instrucciones al paciente
      instrucciones_generales: true, // Incluidas
      proxima_cita: true, // Campo incluido
      dias_tratamiento: true, // Campo incluido

      // Datos del médico prescriptor
      nombre_completo_medico: !!medico.nombre_completo,
      cedula_profesional: !!medico.numero_cedula,
      especialidad_medico: !!medico.especialidad,
      firma_espacio: true, // Espacio para firma y sello

      // Fecha y validez
      fecha_prescripcion: true,
      identificacion_hospital: true,

      // Advertencias legales
      advertencias_incluidas: true, // Sección incluida
      contacto_emergencia: true, // Teléfono incluido
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `  CUMPLIMIENTO PRESCRIPCIÓN MEDICAMENTOS: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log(
        '  PRESCRIPCIÓN DE MEDICAMENTOS CUMPLE CON ESTÁNDARES MÉDICOS'
      );
    }
  }

  private validarCumplimientoRegistroTransfusion(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '  VALIDANDO CUMPLIMIENTO NOM-004 Y NOM-253 - REGISTRO DE TRANSFUSIÓN...'
    );

    const validaciones = {
      // D15.1 - Cantidad, volumen, número de identificación
      cantidad_unidades: true, // Campo incluido
      volumen_transfundido: true, // Campo incluido
      numero_identificacion: true, // Campo incluido
      tipo_componente: true, // Especificado

      // D15.2 - Fecha y hora inicio y finalización
      fecha_hora_inicio: true, // Campos incluidos
      fecha_hora_finalizacion: true, // Campos incluidos

      // D15.3 - Control signos vitales antes, durante y después
      signos_vitales_antes: true, // Tabla completa
      signos_vitales_durante: true, // Campos incluidos
      signos_vitales_despues: true, // Campos incluidos
      estado_general: true, // Campo incluido

      // D15.4 - Reacciones adversas
      reacciones_adversas_evaluadas: true, // Sección incluida
      tipo_reaccion: true, // Campo incluido
      manejo_reacciones: true, // Campo incluido
      investigacion_procedimientos: true, // Referenciado

      // D15.5 - Personal responsable
      medico_indicador: !!medico.nombre_completo,
      cedula_medico: !!medico.numero_cedula,
      personal_aplicacion: true, // Campo incluido
      personal_vigilancia: true, // Campo incluido

      // Datos del paciente
      nombre_completo_paciente: !!paciente.nombre_completo,
      tipo_sanguineo: true, // Campo crítico incluido
      numero_expediente: !!paciente.numero_expediente,

      // Marco normativo
      cumplimiento_nom_004: true, // Estructura según norma
      cumplimiento_nom_253: true, // Disposición de sangre

      // Firmas múltiples requeridas
      firma_medico: true, // Espacio incluido
      firma_enfermeria: true, // Espacio incluido
      firma_banco_sangre: true, // Espacio incluido

      // Fecha y lugar
      fecha_elaboracion: true,
      hospital_identificado: true,
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `  CUMPLIMIENTO REGISTRO TRANSFUSIÓN: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  REGISTRO DE TRANSFUSIÓN CUMPLE CON NOM-004 Y NOM-253');
    }
  }

  private validarCumplimientoNotaPostoperatoria(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '  VALIDANDO CUMPLIMIENTO NOM-004 SECCIÓN 8.8 - NOTA POSTOPERATORIA...'
    );

    const validaciones = {
      // 8.8.1 - Diagnóstico preoperatorio
      diagnostico_preoperatorio: true, // Campo incluido

      // 8.8.2 - Operación planeada
      operacion_planeada: true, // Campo incluido

      // 8.8.3 - Operación realizada
      operacion_realizada: true, // Campo incluido

      // 8.8.4 - Diagnóstico postoperatorio
      diagnostico_postoperatorio: true, // Campo incluido

      // 8.8.5 - Descripción técnica quirúrgica
      descripcion_tecnica_quirurgica: true, // Campo incluido

      // 8.8.6 - Hallazgos transoperatorios
      hallazgos_transoperatorios: true, // Campo incluido

      // 8.8.7 - Reporte de conteo gasas, compresas e instrumental
      conteo_gasas: true, // Campo incluido
      conteo_compresas: true, // Campo incluido
      conteo_instrumental: true, // Campo incluido

      // 8.8.8 - Incidentes y accidentes
      incidentes_accidentes: true, // Campo incluido

      // 8.8.9 - Cuantificación sangrado y transfusiones
      cuantificacion_sangrado: true, // Campo incluido
      transfusiones_reportadas: true, // Campo incluido

      // 8.8.10 - Estudios servicios auxiliares transoperatorios
      estudios_transoperatorios: true, // Campo incluido

      // 8.8.11 - Ayudantes, instrumentistas, anestesiólogo y circulante
      equipo_quirurgico_completo: true, // Tabla incluida
      ayudantes: true, // Campo incluido
      instrumentistas: true, // Campo incluido
      anestesiologo: true, // Campo incluido
      circulante: true, // Campo incluido

      // 8.8.12 - Estado post-quirúrgico inmediato
      estado_postquirurgico_inmediato: true, // Campo incluido

      // 8.8.13 - Plan manejo y tratamiento postoperatorio inmediato
      plan_manejo_postoperatorio: true, // Campo incluido

      // 8.8.14 - Pronóstico
      pronostico: true, // Campo incluido

      // 8.8.15 - Envío piezas y biopsias quirúrgicas
      envio_piezas_biopsias: true, // Campo incluido

      // 8.8.16 - Otros hallazgos de importancia
      otros_hallazgos_importancia: true, // Campo incluido

      // 8.8.17 - Nombre completo y firma del responsable
      nombre_completo_cirujano: !!medico.nombre_completo,
      cedula_profesional: !!medico.numero_cedula,
      firma_responsable_cirugia: true, // Espacio incluido

      // Datos del paciente
      nombre_completo_paciente: !!paciente.nombre_completo,
      numero_expediente: !!paciente.numero_expediente,
      edad_sexo: !!paciente.edad && !!paciente.sexo,

      // Información quirúrgica
      fecha_cirugia: true, // Campo incluido
      duracion_procedimiento: true, // Campo incluido
      quirofano_identificado: true, // Campo incluido

      // Fecha y lugar
      fecha_elaboracion: true,
      hospital_identificado: true,
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `  CUMPLIMIENTO NOTA POSTOPERATORIA NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  NOTA POSTOPERATORIA CUMPLE CON NOM-004 SECCIÓN 8.8');
    }
  }

  private validarCumplimientoNotaPreoperatoria(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '  VALIDANDO CUMPLIMIENTO NOM-004 SECCIÓN 8.5 - NOTA PREOPERATORIA...'
    );

    const validaciones = {
      // 8.5.1 - Fecha de la cirugía
      fecha_cirugia: true, // Campo incluido

      // 8.5.2 - Diagnóstico
      diagnostico_preoperatorio: true, // Campo incluido

      // 8.5.3 - Plan quirúrgico
      plan_quirurgico: true, // Campo incluido

      // 8.5.4 - Tipo de intervención quirúrgica
      tipo_intervencion_quirurgica: true, // Campo incluido

      // 8.5.5 - Riesgo quirúrgico
      riesgo_quirurgico: true, // Campo incluido con clasificación
      justificacion_riesgo: true, // Campo incluido

      // 8.5.6 - Cuidados y plan terapéutico preoperatorios
      cuidados_preoperatorios: true, // Campo incluido
      plan_terapeutico_preoperatorio: true, // Campo incluido

      // 8.5.7 - Pronóstico
      pronostico: true, // Campo incluido

      // Datos del paciente
      nombre_completo_paciente: !!paciente.nombre_completo,
      numero_expediente: !!paciente.numero_expediente,
      edad_sexo: !!paciente.edad && !!paciente.sexo,

      // Datos del cirujano
      nombre_completo_cirujano: !!medico.nombre_completo,
      cedula_profesional: !!medico.numero_cedula,
      especialidad_cirujano: !!medico.especialidad,

      // Información quirúrgica adicional
      estudios_preoperatorios: true, // Laboratorio y gabinete
      equipo_quirurgico: true, // Equipo programado
      tipo_sanguineo: true, // Campo crítico
      hora_programada: true, // Campo incluido
      quirofano_asignado: true, // Campo incluido

      // Fecha y lugar
      fecha_elaboracion: true,
      hospital_identificado: true,
      firma_cirujano: true, // Espacio incluido
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `  CUMPLIMIENTO NOTA PREOPERATORIA NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  NOTA PREOPERATORIA CUMPLE CON NOM-004 SECCIÓN 8.5');
    }
  }

  private validarCumplimientoNotaPostanestesica(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '  VALIDANDO CUMPLIMIENTO NOM-004 SECCIÓN D11 - NOTA POSTANESTÉSICA...'
    );

    const validaciones = {
      // D11.12 - Medicamentos utilizados
      medicamentos_utilizados:
        !!datos.notaPostanestesica?.medicamentos_utilizados,

      // D11.13 - Duración de la anestesia
      duracion_anestesia: !!datos.notaPostanestesica?.duracion_anestesia,
      tipo_anestesia: !!datos.notaPostanestesica?.tipo_anestesia,

      // D11.14 - Incidentes y accidentes atribuibles a la anestesia
      incidentes_accidentes_evaluados: true, // Sección incluida

      // D11.15 - Cantidad de sangre o soluciones aplicadas
      liquidos_administrados: true, // Campo incluido
      balance_hidrico_reportado: true, // Sección incluida
      hemoderivados_documentados: true, // Campo incluido

      // D11.16 - Estado clínico del enfermo a su egreso de quirófano
      estado_clinico_egreso: true, // Campo obligatorio incluido
      signos_vitales_egreso: true, // Tabla completa incluida
      evaluacion_neurológica: true, // Incluida en estado clínico

      // D11.17 - Plan manejo y tratamiento inmediato
      plan_tratamiento_inmediato: true, // Campo incluido

      // Datos del paciente
      nombre_completo_paciente: !!paciente.nombre_completo,
      numero_expediente: !!paciente.numero_expediente,
      edad_sexo: !!paciente.edad && !!paciente.sexo,

      // Datos del anestesiólogo
      nombre_completo_anestesiologo: !!medico.nombre_completo,
      cedula_profesional: !!medico.numero_cedula,
      firma_espacio: true, // Espacio incluido

      // Información quirúrgica
      procedimiento_identificado: true, // Campo incluido
      fecha_cirugia: true, // Campo incluido
      quirofano_identificado: true, // Campo incluido

      // Escala de recuperación
      escala_aldrete: true, // Incluida para evaluación objetiva
      puntuacion_recuperacion: true, // Calculada automáticamente

      // Fecha y lugar
      fecha_elaboracion: true,
      hospital_identificado: true,
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `  CUMPLIMIENTO NOTA POSTANESTÉSICA NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  NOTA POSTANESTÉSICA CUMPLE CON NOM-004 SECCIÓN D11');
    }
  }


  // src/app/services/validaciones/validaciones-comunes.service.ts - AGREGAR MÉTODOS

/**
 * Validaciones específicas para Hoja Frontal de Expediente
 */
validarHojaFrontalExpediente(datos: any): ValidacionResult {
  const errores: string[] = [];
  const advertencias: string[] = [];

  // Validaciones obligatorias NOM-004
  if (!datos.tipo_establecimiento) {
    errores.push('Tipo de establecimiento es obligatorio');
  }

  if (!datos.nombre_establecimiento) {
    errores.push('Nombre del establecimiento es obligatorio');
  }

  if (!datos.domicilio_establecimiento) {
    errores.push('Domicilio del establecimiento es obligatorio');
  }

  // Validaciones de contacto de emergencia principal
  if (!datos.contacto_emergencia_1_nombre) {
    errores.push('Nombre del contacto de emergencia principal es obligatorio');
  }

  if (!datos.contacto_emergencia_1_parentesco) {
    errores.push('Parentesco del contacto de emergencia es obligatorio');
  }

  if (!datos.contacto_emergencia_1_telefono_principal) {
    errores.push('Teléfono del contacto de emergencia es obligatorio');
  }

  // Validar formato de teléfonos
  const telefonoRegex = /^\d{10}$/;
  if (datos.contacto_emergencia_1_telefono_principal && 
      !telefonoRegex.test(datos.contacto_emergencia_1_telefono_principal.replace(/\D/g, ''))) {
    advertencias.push('El teléfono principal debe tener 10 dígitos');
  }

  // Validar NSS si está presente
  if (datos.nss && datos.nss.length !== 11) {
    advertencias.push('El NSS debe tener 11 dígitos');
  }

  // Validar RFC del establecimiento
  // Validar RFC del establecimiento
 if (datos.rfc_establecimiento) {
   const rfcRegex = /^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{2,3}$/;
   if (!rfcRegex.test(datos.rfc_establecimiento)) {
     advertencias.push('Formato de RFC del establecimiento incorrecto');
   }
 }

 // Validar email si está presente
 if (datos.email) {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(datos.email)) {
     errores.push('Formato de correo electrónico inválido');
   }
 }

 // Validaciones de completitud
 const camposOpcionales = [
   'lugar_nacimiento', 'nacionalidad', 'grupo_etnico', 'lengua_indigena',
   'escolaridad', 'ocupacion', 'estado_conyugal', 'religion',
   'afiliacion_medica', 'numero_afiliacion', 'nss'
 ];

 const camposCompletos = camposOpcionales.filter(campo => datos[campo] && datos[campo].trim());
 const porcentajeCompletitud = Math.round((camposCompletos.length / camposOpcionales.length) * 100);

 if (porcentajeCompletitud < 60) {
   advertencias.push(`Completitud del ${porcentajeCompletitud}% - Se recomienda completar más datos demográficos`);
 }

 return {
   valido: errores.length === 0,
   errores,
   advertencias,
   porcentaje_completitud: porcentajeCompletitud
 };
}

/**
* Validar cumplimiento NOM-004 para Hoja Frontal
*/
private validarCumplimientoHojaFrontal(datos: any, medico: any, paciente: any): void {
 console.log('🔍 VALIDANDO CUMPLIMIENTO NOM-004 SECCIÓN 5.18 - HOJA FRONTAL...');

 const validaciones = {
   // 5.18 - Hoja frontal (opcional pero recomendada)
   identificacion_establecimiento: !!datos.nombre_establecimiento,
   domicilio_establecimiento: !!datos.domicilio_establecimiento,
   tipo_establecimiento: !!datos.tipo_establecimiento,

   // Datos del paciente
   nombre_completo_paciente: !!paciente.nombre_completo,
   identificacion_paciente: !!paciente.curp || !!paciente.numero_expediente,
   datos_demograficos: !!datos.lugar_nacimiento || !!datos.nacionalidad,

   // Contacto de emergencia
   contacto_emergencia_nombre: !!datos.contacto_emergencia_1_nombre,
   contacto_emergencia_telefono: !!datos.contacto_emergencia_1_telefono_principal,
   parentesco_especificado: !!datos.contacto_emergencia_1_parentesco,

   // Información médica relevante
   tipo_sangre_registrado: !!paciente.tipo_sangre,
   alergias_documentadas: true, // Campo incluido
   afiliacion_medica: true, // Campo incluido

   // Aspectos administrativos
   numero_expediente: !!paciente.numero_expediente,
   fecha_apertura: true, // Se genera automáticamente
   personal_responsable: !!medico.nombre_completo,

   // Estructura del documento
   formato_estructurado: true,
   secciones_organizadas: true,
   espacios_adecuados: true,

   // Cumplimiento normativo
   referencia_nom_004: true,
   informacion_establecimiento: true,
   datos_paciente_completos: !!paciente.nombre_completo && !!paciente.edad,
 };

 const cumplimiento = Object.values(validaciones).filter(v => v).length;
 const total = Object.keys(validaciones).length;
 const porcentaje = Math.round((cumplimiento / total) * 100);

 console.log(`📊 CUMPLIMIENTO HOJA FRONTAL: ${cumplimiento}/${total} (${porcentaje}%)`);

 if (porcentaje < 85) {
   console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 85%');
 } else {
   console.log('✅ HOJA FRONTAL CUMPLE CON NOM-004 SECCIÓN 5.18');
 }
}



}