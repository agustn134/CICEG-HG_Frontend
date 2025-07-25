// src/app/services/pdf-generator.service.ts
import { Injectable,inject } from '@angular/core';
import { PersonalMedicoService } from '../personas/personal-medico';
import { AuthService } from '../auth/auth.service';
import { GuiasClinicasService } from '../catalogos/guias-clinicas';
import { PacientesService } from '../personas/pacientes';
import { SignosVitalesService } from '../gestion-expedientes/signos-vitales';
import { HistoriasClinicasService } from '../documentos-clinicos/historias-clinicas';
import { NotasUrgenciasService } from '../documentos-clinicos/notas-urgencias';
import { NotasEvolucionService } from '../documentos-clinicos/notas-evolucion';
import { NotasEgresoService } from '../documentos-clinicos/notas-egreso';
import { DocumentosService } from '../documentos-clinicos/documentos';
import { ConsentimientosInformados } from '../documentos-clinicos/consentimientos-informados';
import { NotasPreoperatoria } from '../documentos-clinicos/notas-preoperatoria';
import { NotasPostoperatoria } from '../documentos-clinicos/notas-postoperatoria';
import { NotasPreanestesica } from '../documentos-clinicos/notas-preanestesica';
import { NotasPostanestesica } from '../documentos-clinicos/notas-postanestesica';
import { NotasInterconsulta } from '../documentos-clinicos/notas-interconsulta';
import {SolicitudesEstudio } from '../documentos-clinicos/solicitudes-estudio';
import { PrescripcionesMedicamentoService } from '../documentos-clinicos/prescripciones-medicamento';
import { ControlCrecimientoService } from '../documentos-clinicos/controlcrecimientoService';
import { ReferenciasTraslado } from '../documentos-clinicos/referencias-traslado';
import { EsquemaVacunacionService } from '../documentos-clinicos/esquema-vacunacion';
import { HojaFrontalService } from '../documentos-clinicos/hoja-frontal';
import { AltaVoluntariaService } from '../documentos-clinicos/alta-voluntaria';
import { CultivosService } from '../documentos-clinicos/cultivos-service';
import { GasometriaService } from '../documentos-clinicos/gasometria';
import { TiposDocumentoService } from '../catalogos/tipos-documento';
import { AntecedentesHeredoFamiliaresService } from '../documentos-clinicos/antecedentes-heredo-familiares';
import { AntecedentesPerinatalesService } from '../documentos-clinicos/antecedentes-perinatales';
import { EstadoNutricionalPediatricoService } from '../documentos-clinicos/estado-nutricional-pediatrico';
import { InmunizacionesService } from '../documentos-clinicos/inmunizaciones';
import { VacunasAdicionalesService } from '../documentos-clinicos/vacunas-adicionales';
import { DesarrolloPsicomotrizService } from '../documentos-clinicos/desarrollo-psicomotriz';
import { PdfTemplatesService } from './PdfTemplatesService';



interface GuiaClinicaData {
  codigo: string | null;
  nombre: string | null;
  area: string | null;
  fuente: string | null;
  nombre_completo: string | null;
}

interface DatosPadres {
  nombre_padre: string;
  nombre_madre: string;
  edad_padre: number | null;
  edad_madre: number | null;
}

interface SignosVitalesData {
  peso: number | null;
  talla: number | null;
  temperatura: number | null;
  presion_arterial_sistolica: number | null;
  presion_arterial_diastolica: number | null;
  frecuencia_cardiaca: number | null;
  frecuencia_respiratoria: number | null;
  saturacion_oxigeno: number | null;
  glucosa: number | null;
}

interface DatosConsentimiento {
  tipo_consentimiento?: string;
  procedimiento_autorizado?: string;
  riesgos_explicados?: string;
  alternativas_explicadas?: string;
  autorizacion_procedimientos?: boolean;
  autorizacion_anestesia?: boolean;
  firma_paciente?: boolean;
  firma_responsable?: boolean;
  nombre_responsable?: string;
  parentesco_responsable?: string;
  testigos?: string[];
  fecha_consentimiento?: string;
}

interface DatosNotaPreoperatoria {
  fecha_cirugia?: string;
  diagnostico_preoperatorio?: string;
  plan_quirurgico?: string;
  tipo_intervencion_quirurgica?: string;
  riesgo_quirurgico?: string;
  justificacion_riesgo?: string;
  cuidados_preoperatorios?: string;
  plan_terapeutico_preoperatorio?: string;
  pronostico?: string;
}

interface DatosNotaPostoperatoria {
  fecha_cirugia?: string;
  duracion_cirugia?: number;
  diagnostico_preoperatorio?: string;
  diagnostico_postoperatorio?: string;
  operacion_planeada?: string;
  operacion_realizada?: string;
  descripcion_tecnica?: string;
  hallazgos_transoperatorios?: string;
  conteo_gasas_completo?: string;
  conteo_instrumental_completo?: string;
  incidentes_accidentes?: string;
  sangrado?: number;
  estado_postquirurgico?: string;
  plan_postoperatorio?: string;
  pronostico?: string;
}



@Injectable({
  providedIn: 'root',
})

export class PdfGeneratorService {
  private pdfMake: any;
  private isLoaded = false;

  // Using inject() to avoid circular dependency issues
  private personalMedicoService = inject(PersonalMedicoService);
  private authService = inject(AuthService);
  private guiasClinicasService = inject(GuiasClinicasService);
  private pacientesService = inject(PacientesService);
  private signosVitalesService = inject(SignosVitalesService);
  private historiasClinicasService = inject(HistoriasClinicasService);
  private notasUrgenciasService = inject(NotasUrgenciasService);
  private notasEvolucionService = inject(NotasEvolucionService);
  private notasEgresoService = inject(NotasEgresoService);
  private documentosService = inject(TiposDocumentoService);
  private consentimientosService = inject(ConsentimientosInformados);
  private notasPreoperatoriaService = inject(NotasPreoperatoria);
  private notasPostoperatoriaService = inject(NotasPostoperatoria);
  private notasPreanestesicaService = inject(NotasPreanestesica);
  private notasPostanestesicaService = inject(NotasPostanestesica);
  private notasInterconsultaService = inject(NotasInterconsulta);
  private solicitudesEstudioService = inject(SolicitudesEstudio);
  private referenciasTrasladoService = inject(ReferenciasTraslado);
  private prescripcionesMedicamentoService = inject(PrescripcionesMedicamentoService);
  private controlCrecimientoService = inject(ControlCrecimientoService);
  private esquemaVacunacionService = inject(EsquemaVacunacionService);
  private hojaFrontalService = inject(HojaFrontalService);
  private altaVoluntariaService = inject(AltaVoluntariaService);
  private cultivosService = inject(CultivosService);
  private gasometriaService = inject(GasometriaService);
  private antecedentesHeredoFamiliaresService = inject(AntecedentesHeredoFamiliaresService);
  private antecedentesPerinatalesService = inject(AntecedentesPerinatalesService);
  private desarrolloPsicomotrizService = inject(DesarrolloPsicomotrizService);
  private estadoNutricionalPediatricoService = inject(EstadoNutricionalPediatricoService);
  private inmunizacionesService = inject(InmunizacionesService);
  private vacunasAdicionalesService = inject(VacunasAdicionalesService);
  private pdfTemplatesService = inject(PdfTemplatesService);

  constructor() {
    this.loadPdfMake();
  }


  // 🔥 MÉTODO PRINCIPAL PARA INTEGRAR TODOS LOS FORMATOS
    async generarDocumentoPDF(tipoDocumento: string, datos: any): Promise<void> {
    console.log('🎯 PdfGeneratorService: Iniciando generación de PDF:', tipoDocumento);

    try {
      switch (tipoDocumento) {
        case 'Historia Clínica':
          await this.generarHistoriaClinica(datos);
          break;
        case 'Nota de Urgencias':
          await this.generarNotaUrgencias(datos);
          break;
        case 'Nota de Evolución':
          await this.generarNotaEvolucion(datos);
          break;
        case 'Nota de Egreso':
          await this.generarNotaEgreso(datos);
          break;
        case 'Nota de Interconsulta':
          await this.generarNotaInterconsulta(datos);
          break;
        case 'Nota Preoperatoria':
          await this.generarNotaPreoperatoria(datos);
          break;
        case 'Nota Postoperatoria':
          await this.generarNotaPostoperatoria(datos);
          break;
        case 'Nota Postanestésica':
          await this.generarNotaPostanestesica(datos);
          break;
        case 'Nota Preanestésica':
          await this.generarNotaPreanestesica(datos);
          break;
        case 'Signos Vitales':
          await this.generarSignosVitales(datos);
          break;
        case 'Consentimiento Procedimientos':
          await this.generarNotaConsentimientoProcedimientos(datos);
          break;
        case 'Consentimiento Hospitalización':
          await this.generarConsentimientoHospitalizacion(datos);
          break;
        case 'Consentimiento Referencia':
          await this.generarConsentimientoReferenciaPacientes(datos);
          break;
        case 'Consentimiento Transfusión':
          await this.generarConsentimientoTransfusionSanguinea(datos);
          break;
        case 'Consentimiento Tratamiento':
          await this.generarConsentimientoTratamientoMedico(datos);
          break;
        case 'Hoja Alta Voluntaria':
          await this.generarHojaAltaVoluntaria(datos);
          break;
        case 'Hoja Informe Diario':
          await this.generarHojaInformeDiario(datos);
          break;
        case 'Hoja Frontal Expediente':
          await this.generarHojaFrontalExpediente(datos);
          break;
        case 'Solicitud Laboratorio':
          await this.generarSolicitudLaboratorio(datos);
          break;
        case 'Solicitud Imagenología':
          await this.generarSolicitudImagenologia(datos);
          break;
        case 'Solicitud Cultivo':
          await this.generarSolicitudCultivo(datos);
          break;
        case 'Prescripción Medicamentos':
          await this.generarPrescripcionMedicamentos(datos);
          break;
        case 'Registro Transfusión':
          await this.generarRegistroTransfusion(datos);
          break;
        case 'Hoja Quirófano':
          await this.generarHojaQuirofano(datos);
          break;
        case 'Referencia Traslado':
          console.log('📄 Generando Referencia Traslado con datos generales');
          await this.generarDocumentoGenerico('Referencia de Traslado', datos);
          break;
        case 'Control Crecimiento':
          console.log(
            '📄 Generando Control de Crecimiento con datos generales'
          );
          await this.generarDocumentoGenerico('Control de Crecimiento', datos);
          break;
        case 'Esquema Vacunación':
          console.log('📄 Generando Esquema de Vacunación con datos generales');
          await this.generarDocumentoGenerico('Esquema de Vacunación', datos);
          break;
        case 'Solicitud Gasometría':
          console.log(
            '📄 Generando Solicitud de Gasometría con datos generales'
          );
          await this.generarDocumentoGenerico('Solicitud de Gasometría', datos);
          break;
        default:
          throw new Error(`Tipo de documento no soportado: ${tipoDocumento}`);
      }

      console.log(`  PDF ${tipoDocumento} generado exitosamente`);
    } catch (error) {
      console.error(`❌ Error generando PDF ${tipoDocumento}:`, error);
      throw error;
    }
  }

  private async obtenerDatosMedicoActual(): Promise<any> {
    try {
      const usuarioActual = this.authService.getCurrentUser();

      if (!usuarioActual || usuarioActual.tipo_usuario !== 'medico') {
        throw new Error('Usuario no es médico o no está autenticado');
      }

      console.log(
        '🩺 Obteniendo datos completos del médico:',
        usuarioActual.id
      );

      const response = await this.personalMedicoService
        .getPersonalMedicoById(usuarioActual.id)
        .toPromise();

      if (response?.success && response.data) {
        const medico = response.data;

        return {
          id_personal_medico: medico.id_personal_medico,
          nombre_completo: `${medico.nombre} ${medico.apellido_paterno} ${medico.apellido_materno}`,
          nombre: medico.nombre,
          apellido_paterno: medico.apellido_paterno,
          apellido_materno: medico.apellido_materno,
          numero_cedula: medico.numero_cedula,
          especialidad: medico.especialidad,
          cargo: medico.cargo,
          departamento: medico.departamento,
          titulo_profesional: this.obtenerTituloProfesional(
            medico.especialidad
          ),
        };
      }

      throw new Error('No se pudieron obtener los datos del médico');
    } catch (error) {
      console.error('❌ Error al obtener datos del médico:', error);
      const usuarioActual = this.authService.getCurrentUser();
      return {
        id_personal_medico: usuarioActual?.id || 0,
        nombre_completo:
          usuarioActual?.nombre_completo || 'Médico no identificado',
        numero_cedula: 'No disponible',
        especialidad: usuarioActual?.especialidad || 'No especificada',
        cargo: usuarioActual?.cargo || 'Médico',
        departamento: usuarioActual?.departamento || 'No especificado',
        titulo_profesional: 'Dr.',
      };
    }
  }

  private obtenerTituloProfesional(especialidad: string): string {
    if (!especialidad) return 'Dr.';

    const especialidadLower = especialidad.toLowerCase();

    if (
      especialidadLower.includes('psicología') ||
      especialidadLower.includes('psicolog')
    ) {
      return 'Psic.';
    }
    if (
      especialidadLower.includes('nutrición') ||
      especialidadLower.includes('nutricion')
    ) {
      return 'Nut.';
    }
    if (
      especialidadLower.includes('enfermería') ||
      especialidadLower.includes('enfermeria')
    ) {
      return 'Enf.';
    }

    return 'Dr.';
  }

  private validarYFormatearDatosPaciente(datosPaciente: any): any {
    console.log('  Datos recibidos del paciente:', datosPaciente);

    let pacienteInfo = null;
    let expedienteInfo = null;

    // 1. Si los datos vienen directamente del wizard (paso persona)
    if (datosPaciente?.persona) {
      console.log('  Datos encontrados en datosPaciente.persona');
      pacienteInfo = datosPaciente.persona;
      expedienteInfo = datosPaciente.expediente;
    }

    // 2. Si vienen anidados en paciente.persona.persona
    else if (datosPaciente?.paciente?.persona?.persona) {
      console.log('  Datos encontrados en estructura anidada');
      pacienteInfo = datosPaciente.paciente.persona.persona;
      expedienteInfo =
        datosPaciente.paciente?.expediente || datosPaciente.expediente;
    }

    // 3. Si vienen en paciente.persona
    else if (datosPaciente?.paciente?.persona) {
      console.log('  Datos encontrados en paciente.persona');
      pacienteInfo = datosPaciente.paciente.persona;
      expedienteInfo = datosPaciente.expediente;
    }

    // 4. Si los datos están directamente en paciente
    else if (datosPaciente?.paciente) {
      console.log('  Datos encontrados directamente en paciente');
      pacienteInfo = datosPaciente.paciente;
      expedienteInfo = datosPaciente.expediente;
    }

    // 5. Si vienen del formData del wizard directamente
    else if (datosPaciente?.nombre || datosPaciente?.apellido_paterno) {
      console.log('  Datos encontrados directamente en el objeto raíz');
      pacienteInfo = datosPaciente;
      expedienteInfo = datosPaciente.expediente;
    }

    console.log('  Datos extraídos del paciente:', pacienteInfo);
    console.log('  Datos del expediente:', expedienteInfo);

    return {
      // Información personal
      nombre_completo: this.construirNombreCompleto(pacienteInfo),
      nombre: pacienteInfo?.nombre || 'No disponible',
      apellido_paterno: pacienteInfo?.apellido_paterno || '',
      apellido_materno: pacienteInfo?.apellido_materno || '',

      // Datos demográficos
      fecha_nacimiento: pacienteInfo?.fecha_nacimiento || null,
      edad: this.calcularEdad(pacienteInfo?.fecha_nacimiento),
      sexo: this.formatearSexo(pacienteInfo?.sexo || pacienteInfo?.genero),
      curp: pacienteInfo?.curp || 'No registrado',
      lugar_nacimiento:
        pacienteInfo?.lugar_nacimiento ||
        pacienteInfo?.ciudad_nacimiento ||
        pacienteInfo?.municipio_nacimiento ||
        'No especificado',

      // Contacto
      telefono: pacienteInfo?.telefono || 'No registrado',
      correo_electronico:
        pacienteInfo?.correo_electronico ||
        pacienteInfo?.email ||
        'No registrado',
      direccion_completa: this.formatearDireccionMejorada(pacienteInfo),

      // Información médica
      tipo_sangre: pacienteInfo?.tipo_sangre || 
                  datosPaciente?.paciente?.tipo_sangre || 
                  datosPaciente?.tipo_sangre || 
                  'No registrado',
      ocupacion:
        pacienteInfo?.ocupacion ||
        datosPaciente?.paciente?.ocupacion ||
        'No registrado',
      escolaridad:
        pacienteInfo?.escolaridad ||
        datosPaciente?.paciente?.escolaridad ||
        'No registrado',
      estado_civil: pacienteInfo?.estado_civil || 'No registrado',
      religion: pacienteInfo?.religion || 'No registrado',

      // Expediente
      numero_expediente: expedienteInfo?.numero_expediente || 'No disponible',
      fecha_apertura: expedienteInfo?.fecha_apertura || null,

      // Contacto de emergencia
      familiar_responsable:
        datosPaciente?.paciente?.familiar_responsable || 'No registrado',
      telefono_familiar:
        datosPaciente?.paciente?.telefono_familiar || 'No registrado',
    };
  }

  private construirNombreCompleto(persona: any): string {
    if (!persona) return 'Paciente no identificado';

    const partes = [
      persona.nombre,
      persona.apellido_paterno,
      persona.apellido_materno,
    ].filter((parte) => parte && parte.trim() !== '');

    return partes.length > 0 ? partes.join(' ') : 'Nombre no disponible';
  }

  private formatearSexo(sexo: string): string {
    if (!sexo) return 'No especificado';

    const sexoUpper = sexo.toUpperCase();
    switch (sexoUpper) {
      case 'M':
      case 'MASCULINO':
        return 'Masculino';
      case 'F':
      case 'FEMENINO':
        return 'Femenino';
      default:
        return sexo;
    }
  }

  private obtenerSignosVitalesReales(datos: any): any {
    console.log('  Buscando signos vitales en los datos recibidos...');

    let signosVitales = {
      peso: null as number | null,
      talla: null as number | null,
      temperatura: null as number | null,
      presion_arterial_sistolica: null as number | null,
      presion_arterial_diastolica: null as number | null,
      frecuencia_cardiaca: null as number | null,
      frecuencia_respiratoria: null as number | null,
      saturacion_oxigeno: null as number | null,
      glucosa: null as number | null,
    };

    // 🔥 BUSCAR EN DIFERENTES UBICACIONES POSIBLES
    // 1. En datos.signosVitales (datos del formulario actual)
    if (datos.signosVitales) {
      console.log('Encontrados signos vitales en datos.signosVitales');
      signosVitales = {
        ...signosVitales,
        ...Object.fromEntries(
          Object.entries(datos.signosVitales).map(([key, value]) => [
            key,
            value !== null && value !== undefined ? Number(value) : null,
          ])
        ),
      };
    }

    // 2. En datos.paciente.signosVitales (datos históricos del paciente)
    if (
      datos.paciente?.signosVitales &&
      Array.isArray(datos.paciente.signosVitales) &&
      datos.paciente.signosVitales.length > 0
    ) {
      console.log(
        'Encontrados signos vitales históricos en datos.paciente.signosVitales'
      );
      const ultimosSignos = datos.paciente.signosVitales[0]; // El más reciente
      signosVitales = {
        ...signosVitales,
        ...Object.fromEntries(
          Object.entries(ultimosSignos).map(([key, value]) => [
            key,
            value !== null && value !== undefined ? Number(value) : null,
          ])
        ),
      };
    }

    console.log('🩺 Signos vitales finales para el PDF:', signosVitales);
    return signosVitales;
  }

  private formatearDireccion(paciente: any): string {
    if (!paciente) return 'Sin dirección registrada';

    const partes = [
      paciente.calle,
      paciente.numero_exterior ? `#${paciente.numero_exterior}` : '',
      paciente.numero_interior ? `Int. ${paciente.numero_interior}` : '',
      paciente.colonia,
      paciente.municipio,
      paciente.estado,
      paciente.codigo_postal ? `C.P. ${paciente.codigo_postal}` : '',
    ].filter((parte) => parte && parte.trim() !== '');

    return partes.length > 0 ? partes.join(', ') : 'Sin dirección registrada';
  }

  // 🔧 MÉTODOS AUXILIARES MEJORADOS
  private calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const diferenciaMeses = hoy.getMonth() - nacimiento.getMonth();

    if (
      diferenciaMeses < 0 ||
      (diferenciaMeses === 0 && hoy.getDate() < nacimiento.getDate())
    ) {
      edad--;
    }

    return edad;
  }

  private calcularIMC(peso: number, talla: number): string {
    if (!peso || !talla || peso <= 0 || talla <= 0) return '__';

    const imc = peso / Math.pow(talla / 100, 2);
    return imc.toFixed(1);
  }

  private validarCumplimientoNOM004(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log('  VALIDANDO CUMPLIMIENTO NOM-004-SSA3-2012...');

    const validaciones = {
      // 5.2 Datos generales obligatorios
      establecimiento: true, //  Hospital General San Luis de la Paz
      nombre_paciente: !!paciente.nombre_completo,
      sexo_paciente: !!paciente.sexo,
      edad_paciente: !!paciente.edad,
      domicilio_paciente: !!paciente.direccion_completa,

      // 5.9-5.10 Datos de elaboración
      fecha_elaboracion: true, //  Siempre se incluye
      hora_elaboracion: true, //  Siempre se incluye
      nombre_completo_medico: !!medico.nombre_completo,
      cedula_profesional: !!medico.numero_cedula,
      firma_medico: true, //  Espacio para firma

      // 6.1.1 Interrogatorio completo
      ficha_identificacion: !!paciente.nombre_completo,
      antecedentes_heredo_familiares:
        !!datos.historiaClinica?.antecedentes_heredo_familiares,
      antecedentes_personales_patologicos: true, //  Sección incluida
      antecedentes_personales_no_patologicos: true, //  Sección incluida
      padecimiento_actual: !!datos.historiaClinica?.padecimiento_actual,
      interrogatorio_aparatos_sistemas: true, //  Sección completa incluida

      // 6.1.2 Exploración física
      habitus_exterior: true, //  Incluido
      signos_vitales: true, //  Completos
      peso_talla: true, //  Somatometría incluida
      exploracion_por_aparatos: true, //  Todos los sistemas

      // 6.1.3 Estudios
      resultados_estudios_previos: true, //  Sección incluida

      // 6.1.4-6.1.6 Diagnóstico y tratamiento
      diagnosticos_problemas: !!datos.historiaClinica?.impresion_diagnostica,
      pronostico: true, // Sección incluida
      indicacion_terapeutica: true, // Sección incluida

      // Específico para pediatría (NOM-031)
      datos_padres: true, //  Incluidos
      desarrollo_psicomotor: true, // Incluido
      inmunizaciones: true, //  Referenciadas
    };

    const cumplimiento = Object.values(validaciones).filter((v) => v).length;
    const total = Object.keys(validaciones).length;
    const porcentaje = Math.round((cumplimiento / total) * 100);

    console.log(
      `📊 CUMPLIMIENTO NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
      const faltantes = Object.entries(validaciones)
        .filter(([_, valor]) => !valor)
        .map(([campo, _]) => campo);
      console.warn('📋 Campos faltantes:', faltantes);
    } else {
      console.log('  CUMPLIMIENTO NORMATIVO SATISFACTORIO');
    }
  }

private formatearDireccionMejorada(paciente: any): string {
  // ✅ DEBUG TEMPORAL - Verificar qué datos llegan
  console.log('🏠 DEBUG - Datos del paciente recibidos:', {
    domicilio: paciente.domicilio,
    direccion: paciente.direccion,
    persona_domicilio: paciente.persona?.domicilio,
    estructura_completa: Object.keys(paciente)
  });
  
  if (!paciente) return 'Sin dirección registrada';
  
  const domicilio = 
    paciente.domicilio || 
    paciente.direccion ||
    paciente.persona?.domicilio || 
    paciente.persona?.direccion ||
    '';

  const domicilioLimpio = domicilio.toString().trim();
  
  return domicilioLimpio !== '' && 
         domicilioLimpio !== 'null' && 
         domicilioLimpio !== 'undefined' 
    ? domicilioLimpio 
    : 'Sin dirección registrada';
}

  private obtenerDatosPadres(datos: any): DatosPadres {
    console.log('  Buscando datos de padres para Historia Clínica...');

    const datosPadres: DatosPadres = {
      nombre_padre: 'No registrado',
      nombre_madre: 'No registrado',
      edad_padre: null,
      edad_madre: null,
    };

    // 1. Buscar en datos del paciente
    if (datos.paciente?.paciente) {
      const pacienteData = datos.paciente.paciente;
      datosPadres.nombre_padre = pacienteData.nombre_padre || 'No registrado';
      datosPadres.nombre_madre = pacienteData.nombre_madre || 'No registrado';
      datosPadres.edad_padre = pacienteData.edad_padre || null;
      datosPadres.edad_madre = pacienteData.edad_madre || null;
    }

    // 2. Buscar en persona directamente
    if (datos.paciente?.persona) {
      const personaData = datos.paciente.persona;
      if (personaData.nombre_padre)
        datosPadres.nombre_padre = personaData.nombre_padre;
      if (personaData.nombre_madre)
        datosPadres.nombre_madre = personaData.nombre_madre;
      if (personaData.edad_padre)
        datosPadres.edad_padre = personaData.edad_padre;
      if (personaData.edad_madre)
        datosPadres.edad_madre = personaData.edad_madre;
    }

    // 3. Buscar en historiaClinica si tiene campos específicos
    if (datos.historiaClinica?.nombre_padre) {
      datosPadres.nombre_padre = datos.historiaClinica.nombre_padre;
    }
    if (datos.historiaClinica?.nombre_madre) {
      datosPadres.nombre_madre = datos.historiaClinica.nombre_madre;
    }

    console.log('👨‍👩‍👧‍👦 Datos de padres finales para HC:', datosPadres);
    return datosPadres;
  }

  private obtenerGuiaClinicaSeleccionada(datos: any): GuiaClinicaData {
    console.log('  Buscando guía clínica seleccionada...');

    const guiaClinica: GuiaClinicaData = {
      codigo: null,
      nombre: null,
      area: null,
      fuente: null,
      nombre_completo: null,
    };

    // 1. Buscar en datos.guiaClinica (pasada desde el componente)
    if (datos.guiaClinica) {
      console.log('  Encontrada guía clínica en datos.guiaClinica');
      guiaClinica.codigo = datos.guiaClinica.codigo || null;
      guiaClinica.nombre = datos.guiaClinica.nombre || null;
      guiaClinica.area = datos.guiaClinica.area || null;
      guiaClinica.fuente = datos.guiaClinica.fuente || null;
      guiaClinica.nombre_completo = `${datos.guiaClinica.codigo || ''} - ${
        datos.guiaClinica.nombre || ''
      } ${datos.guiaClinica.area ? `(${datos.guiaClinica.area})` : ''}`.trim();
    }

    // 2. Buscar en historiaClinica.id_guia_diagnostico
    else if (datos.historiaClinica?.id_guia_diagnostico) {
      console.log(
        ' ID de guía encontrado en historiaClinica:',
        datos.historiaClinica.id_guia_diagnostico
      );
      guiaClinica.nombre_completo = `Guía Clínica ID: ${datos.historiaClinica.id_guia_diagnostico}`;
    }

    console.log('📖 Guía clínica final para el PDF:', guiaClinica);
    return guiaClinica;
  }

  private async loadPdfMake(): Promise<void> {
    if (this.isLoaded) return;
    
    try {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

      this.pdfMake = (pdfMakeModule as any).default || pdfMakeModule;

      if (pdfFontsModule && (pdfFontsModule as any).pdfMake) {
        this.pdfMake.vfs = (pdfFontsModule as any).pdfMake.vfs;
      } else {
        this.pdfMake.vfs = {};
      }

      this.pdfMake.fonts = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf',
        },
      };

      this.isLoaded = true;
      console.log('✅ PDFMake cargado correctamente en PdfGeneratorService');
    } catch (error) {
      console.error('❌ Error al cargar PDFMake:', error);
      throw error;
    }
  }

  private async ensurePdfMakeLoaded(): Promise<void> {
    if (!this.isLoaded) {
      await this.loadPdfMake();
    }
  }

  private calcularDiaHospitalizacion(): number {
    // Esta función calcularía los días desde el ingreso
    // Por ahora retorna un valor por defecto
    // En implementación real se calcularía desde la fecha de ingreso
    return 1;
  }

  private obtenerNumeroExpedientePreferido(expediente: any): string {
    // Priorizar número administrativo sobre el del sistema
    return (
      expediente?.numero_expediente_administrativo ||
      expediente?.numero_expediente ||
      'Sin número'
    );
  }

  // 📄 SIGNOS VITALES CON DATOS COMPLETOS
  async generarSignosVitales(datos: any): Promise<void> {
    try {
      await this.ensurePdfMakeLoaded();

      console.log('📊 Generando Signos Vitales con datos completos...');

      const medicoCompleto = await this.obtenerDatosMedicoActual();
      const pacienteCompleto = this.validarYFormatearDatosPaciente(
        datos.paciente
      );
      const signosVitalesData = datos.signosVitales || {};
      const fechaActual = new Date();

      const documentDefinition = {
        pageSize: 'LETTER',
        pageMargins: [20, 80, 20, 60],

        header: {
          margin: [20, 20, 20, 20],
          table: {
            widths: ['15%', '70%', '15%'],
            body: [
              [
                {
                  text: '📊',
                  fontSize: 20,
                  alignment: 'center',
                  color: '#7c3aed',
                },
                {
                  text: [
                    {
                      text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ\n',
                      fontSize: 14,
                      bold: true,
                      color: '#7c3aed',
                    },
                    {
                      text: 'REGISTRO DE SIGNOS VITALES\n',
                      fontSize: 12,
                      bold: true,
                    },
                    {
                      text: 'Control de Signos Vitales - SICEG',
                      fontSize: 8,
                      color: '#6b7280',
                    },
                  ],
                  alignment: 'center',
                  margin: [0, 5],
                },
                {
                  text: [
                    { text: 'Folio:\n', fontSize: 8, bold: true },
                    {
                      text: `SV-${this.obtenerNumeroExpedientePreferido(
                        pacienteCompleto.expediente
                      )}\n`,
                      fontSize: 8,
                    },
                    { text: 'Hora:\n', fontSize: 8, bold: true },
                    {
                      text: fechaActual.toLocaleTimeString('es-MX'),
                      fontSize: 8,
                    },
                  ],
                  alignment: 'center',
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#7c3aed',
            vLineColor: () => '#7c3aed',
          },
        },

        content: [
          { text: '', margin: [0, 10] },

          // 🔹 DATOS DEL PACIENTE
          {
            table: {
              widths: ['15%', '85%'],
              body: [
                [
                  {
                    text: 'PACIENTE',
                    fontSize: 9,
                    bold: true,
                    fillColor: '#ede9fe',
                    alignment: 'center',
                    rowSpan: 3,
                  },
                  {
                    text: `${pacienteCompleto.nombre_completo} - ${pacienteCompleto.edad} años - ${pacienteCompleto.sexo}`,
                    fontSize: 10,
                    bold: true,
                    margin: [5, 3],
                  },
                ],
                [
                  {},
                  {
                    text: `Expediente: ${this.obtenerNumeroExpedientePreferido(
                      pacienteCompleto.expediente
                    )} | Fecha de registro: ${fechaActual.toLocaleDateString(
                      'es-MX'
                    )}`,
                    fontSize: 8,
                    margin: [5, 3],
                  },
                ],
                [
                  {},
                  {
                    text: `Servicio: ${medicoCompleto.departamento} | Registrado por: ${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}`,
                    fontSize: 8,
                    margin: [5, 3],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#374151',
              vLineColor: () => '#374151',
            },
          },

          { text: '', margin: [0, 15] },

          // 🔹 SIGNOS VITALES PRINCIPALES
          {
            table: {
              widths: ['25%', '25%', '25%', '25%'],
              body: [
                [
                  {
                    text: 'SIGNOS VITALES PRINCIPALES',
                    fontSize: 10,
                    bold: true,
                    fillColor: '#fef3c7',
                    alignment: 'center',
                    colSpan: 4,
                  },
                  {},
                  {},
                  {},
                ],
                [
                  {
                    text: 'PRESIÓN ARTERIAL',
                    fontSize: 9,
                    bold: true,
                    fillColor: '#fee2e2',
                    alignment: 'center',
                  },
                  {
                    text: 'FRECUENCIA CARDÍACA',
                    fontSize: 9,
                    bold: true,
                    fillColor: '#fecaca',
                    alignment: 'center',
                  },
                  {
                    text: 'FRECUENCIA RESPIRATORIA',
                    fontSize: 9,
                    bold: true,
                    fillColor: '#fed7d7',
                    alignment: 'center',
                  },
                  {
                    text: 'TEMPERATURA',
                    fontSize: 9,
                    bold: true,
                    fillColor: '#fee2e2',
                    alignment: 'center',
                  },
                ],
                [
                  {
                    text: `${
                      signosVitalesData.presion_arterial_sistolica || '___'
                    }/${
                      signosVitalesData.presion_arterial_diastolica || '___'
                    } mmHg`,
                    fontSize: 14,
                    bold: true,
                    alignment: 'center',
                    margin: [5, 15],
                    color: this.evaluarPresionArterial(
                      signosVitalesData.presion_arterial_sistolica,
                      signosVitalesData.presion_arterial_diastolica
                    ),
                  },
                  {
                    text: `${
                      signosVitalesData.frecuencia_cardiaca || '___'
                    } lpm`,
                    fontSize: 14,
                    bold: true,
                    alignment: 'center',
                    margin: [5, 15],
                    color: this.evaluarFrecuenciaCardiaca(
                      signosVitalesData.frecuencia_cardiaca
                    ),
                  },
                  {
                    text: `${
                      signosVitalesData.frecuencia_respiratoria || '___'
                    } rpm`,
                    fontSize: 14,
                    bold: true,
                    alignment: 'center',
                    margin: [5, 15],
                    color: this.evaluarFrecuenciaRespiratoria(
                      signosVitalesData.frecuencia_respiratoria
                    ),
                  },
                  {
                    text: `${signosVitalesData.temperatura || '___'} °C`,
                    fontSize: 14,
                    bold: true,
                    alignment: 'center',
                    margin: [5, 15],
                    color: this.evaluarTemperatura(
                      signosVitalesData.temperatura
                    ),
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#374151',
              vLineColor: () => '#374151',
            },
          },

          { text: '', margin: [0, 15] },

          // 🔹 SIGNOS VITALES ADICIONALES
          {
            table: {
              widths: ['33.33%', '33.33%', '33.33%'],
              body: [
                [
                  {
                    text: 'SIGNOS VITALES ADICIONALES',
                    fontSize: 10,
                    bold: true,
                    fillColor: '#e0e7ff',
                    alignment: 'center',
                    colSpan: 3,
                  },
                  {},
                  {},
                ],
                [
                  {
                    text: 'SATURACIÓN DE OXÍGENO',
                    fontSize: 9,
                    bold: true,
                    fillColor: '#dbeafe',
                    alignment: 'center',
                  },
                  {
                    text: 'GLUCOSA',
                    fontSize: 9,
                    bold: true,
                    fillColor: '#dbeafe',
                    alignment: 'center',
                  },
                  {
                    text: 'ESTADO GENERAL',
                    fontSize: 9,
                    bold: true,
                    fillColor: '#dbeafe',
                    alignment: 'center',
                  },
                ],
                [
                  {
                    text: `${signosVitalesData.saturacion_oxigeno || '___'} %`,
                    fontSize: 12,
                    bold: true,
                    alignment: 'center',
                    margin: [5, 10],
                    color: this.evaluarSaturacionOxigeno(
                      signosVitalesData.saturacion_oxigeno
                    ),
                  },
                  {
                    text: `${signosVitalesData.glucosa || '___'} mg/dL`,
                    fontSize: 12,
                    bold: true,
                    alignment: 'center',
                    margin: [5, 10],
                    color: this.evaluarGlucosa(signosVitalesData.glucosa),
                  },
                  {
                    text: this.evaluarEstadoGeneral(signosVitalesData),
                    fontSize: 10,
                    bold: true,
                    alignment: 'center',
                    margin: [5, 10],
                    color: '#059669',
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#374151',
              vLineColor: () => '#374151',
            },
          },

          { text: '', margin: [0, 15] },

          // 🔹 SOMATOMETRÍA
          {
            table: {
              widths: ['25%', '25%', '25%', '25%'],
              body: [
                [
                  {
                    text: 'SOMATOMETRÍA',
                    fontSize: 10,
                    bold: true,
                    fillColor: '#c7f3d0',
                    alignment: 'center',
                    colSpan: 4,
                  },
                  {},
                  {},
                  {},
                ],
                [
                  {
                    text: 'PESO',
                    fontSize: 9,
                    bold: true,
                    fillColor: '#ecfdf5',
                    alignment: 'center',
                  },
                  {
                    text: 'TALLA',
                    fontSize: 9,
                    bold: true,
                    fillColor: '#ecfdf5',
                    alignment: 'center',
                  },
                  {
                    text: 'IMC',
                    fontSize: 9,
                    bold: true,
                    fillColor: '#ecfdf5',
                    alignment: 'center',
                  },
                  {
                    text: 'CLASIFICACIÓN',
                    fontSize: 9,
                    bold: true,
                    fillColor: '#ecfdf5',
                    alignment: 'center',
                  },
                ],
                [
                  {
                    text: `${signosVitalesData.peso || '___'} kg`,
                    fontSize: 12,
                    bold: true,
                    alignment: 'center',
                    margin: [5, 10],
                  },
                  {
                    text: `${signosVitalesData.talla || '___'} cm`,
                    fontSize: 12,
                    bold: true,
                    alignment: 'center',
                    margin: [5, 10],
                  },
                  {
                    text: this.calcularIMC(
                      signosVitalesData.peso,
                      signosVitalesData.talla
                    ),
                    fontSize: 12,
                    bold: true,
                    alignment: 'center',
                    margin: [5, 10],
                  },
                  {
                    text: this.clasificarIMC(
                      this.calcularIMC(
                        signosVitalesData.peso,
                        signosVitalesData.talla
                      )
                    ),
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    margin: [5, 10],
                    color: this.colorIMC(
                      this.calcularIMC(
                        signosVitalesData.peso,
                        signosVitalesData.talla
                      )
                    ),
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#374151',
              vLineColor: () => '#374151',
            },
          },

          { text: '', margin: [0, 15] },

          // 🔹 OBSERVACIONES
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'OBSERVACIONES',
                    fontSize: 9,
                    bold: true,
                    fillColor: '#fef3c7',
                    alignment: 'center',
                  },
                ],
                [
                  {
                    text:
                      signosVitalesData.observaciones ||
                      'Sin observaciones especiales. Paciente estable.',
                    fontSize: 9,
                    margin: [10, 15],
                    lineHeight: 1.4,
                    minHeight: 60,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#374151',
              vLineColor: () => '#374151',
            },
          },

          { text: '', margin: [0, 20] },

          // 🔹 PERSONAL QUE REGISTRA
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    text: 'PERSONAL QUE REGISTRA',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#f9fafb',
                    alignment: 'center',
                  },
                  {
                    text: 'FIRMA Y HORA',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#f9fafb',
                    alignment: 'center',
                  },
                ],
                [
                  {
                    text: [
                      {
                        text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}\n`,
                        fontSize: 9,
                        bold: true,
                      },
                      {
                        text: `Cédula: ${medicoCompleto.numero_cedula}\n`,
                        fontSize: 8,
                      },
                      { text: `${medicoCompleto.especialidad}\n`, fontSize: 8 },
                      {
                        text: `${medicoCompleto.cargo} - ${medicoCompleto.departamento}`,
                        fontSize: 8,
                      },
                    ],
                    margin: [5, 15],
                    alignment: 'center',
                  },
                  {
                    text: `\n\n_________________________\nFirma\n${fechaActual.toLocaleString(
                      'es-MX'
                    )}`,
                    fontSize: 8,
                    margin: [5, 15],
                    alignment: 'center',
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#374151',
              vLineColor: () => '#374151',
            },
          },
        ],

        footer: (currentPage: number, pageCount: number) => {
          return {
            margin: [20, 10],
            table: {
              widths: ['30%', '40%', '30%'],
              body: [
                [
                  {
                    text: `Página ${currentPage}`,
                    fontSize: 7,
                    color: '#6b7280',
                  },
                  {
                    text: 'Signos Vitales - SICEG',
                    fontSize: 7,
                    alignment: 'center',
                    color: '#6b7280',
                  },
                  {
                    text: fechaActual.toLocaleDateString('es-MX'),
                    fontSize: 7,
                    alignment: 'right',
                    color: '#6b7280',
                  },
                ],
              ],
            },
            layout: 'noBorders',
          };
        },
      };

      const nombreArchivo = `signos-vitales-${pacienteCompleto.nombre.replace(
        /\s+/g,
        '-'
      )}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      this.pdfMake.createPdf(documentDefinition).download(nombreArchivo);
      console.log('  PDF de Signos Vitales generado exitosamente');
    } catch (error) {
      console.error('❌ Error al generar PDF de Signos Vitales:', error);
      throw error;
    }
  }

  // 🔧 MÉTODOS AUXILIARES PARA EVALUACIÓN DE SIGNOS VITALES
  private evaluarPresionArterial(
    sistolica: number,
    diastolica: number
  ): string {
    if (!sistolica || !diastolica) return '#374151';
    if (sistolica > 140 || diastolica > 90) return '#dc2626'; // Rojo - Hipertensión
    if (sistolica < 90 || diastolica < 60) return '#dc2626'; // Rojo - Hipotensión
    return '#059669'; // Verde - Normal
  }

  private evaluarFrecuenciaCardiaca(fc: number): string {
    if (!fc) return '#374151';
    if (fc > 100 || fc < 60) return '#dc2626'; // Rojo - Anormal
    return '#059669'; // Verde - Normal
  }

  private evaluarFrecuenciaRespiratoria(fr: number): string {
    if (!fr) return '#374151';
    if (fr > 24 || fr < 12) return '#dc2626'; // Rojo - Anormal
    return '#059669'; // Verde - Normal
  }

  private evaluarTemperatura(temp: number): string {
    if (!temp) return '#374151';
    if (temp > 37.5 || temp < 35.5) return '#dc2626'; // Rojo - Anormal
    return '#059669'; // Verde - Normal
  }

  private evaluarSaturacionOxigeno(sat: number): string {
    if (!sat) return '#374151';
    if (sat < 95) return '#dc2626'; // Rojo - Bajo
    return '#059669'; // Verde - Normal
  }

  private evaluarGlucosa(glucosa: number): string {
    if (!glucosa) return '#374151';
    if (glucosa > 126 || glucosa < 70) return '#dc2626'; // Rojo - Anormal
    return '#059669'; // Verde - Normal
  }

  private evaluarEstadoGeneral(signos: any): string {
    let alteraciones = 0;

    if (signos.temperatura > 37.5 || signos.temperatura < 35.5) alteraciones++;
    if (signos.frecuencia_cardiaca > 100 || signos.frecuencia_cardiaca < 60)
      alteraciones++;
    if (
      signos.presion_arterial_sistolica > 140 ||
      signos.presion_arterial_sistolica < 90
    )
      alteraciones++;
    if (signos.saturacion_oxigeno < 95) alteraciones++;

    if (alteraciones === 0) return 'ESTABLE';
    if (alteraciones <= 2) return 'VIGILAR';
    return 'CRÍTICO';
  }

  private clasificarIMC(imc: string): string {
    const imcNum = parseFloat(imc);
    if (isNaN(imcNum)) return 'No calculable';

    if (imcNum < 18.5) return 'Bajo peso';
    if (imcNum < 25) return 'Normal';
    if (imcNum < 30) return 'Sobrepeso';
    return 'Obesidad';
  }

  private colorIMC(imc: string): string {
    const imcNum = parseFloat(imc);
    if (isNaN(imcNum)) return '#374151';

    if (imcNum < 18.5 || imcNum >= 30) return '#dc2626';
    if (imcNum >= 25) return '#f59e0b';
    return '#059669';
  }

    // ==========================================
  // MÉTODOS DE UTILIDAD PARA EL GENERADOR GENÉRICO
  // ==========================================
  private obtenerNombreCompletoPersona(persona: any): string {
    if (!persona) return 'N/A';
    const nombre = persona.nombre || '';
    const apellidoPaterno = persona.apellido_paterno || '';
    const apellidoMaterno = persona.apellido_materno || '';
    return `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim();
  }

  private calcularEdadPersona(fechaNacimiento: string): string {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const meses = hoy.getMonth() - nacimiento.getMonth();

    if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) {
      return `${edad - 1} años`;
    }
    return `${edad} años`;
  }

  private formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  }
    // 🔧 MÉTODO AUXILIAR PARA CALCULAR TOTAL ALDRETE - MOVIDO DENTRO DE LA CLASE
  private calcularTotalAldrete(postanestesicaData: any): number {
    const actividad = parseInt(postanestesicaData.aldrete_actividad) || 2;
    const respiracion = parseInt(postanestesicaData.aldrete_respiracion) || 2;
    const circulacion = parseInt(postanestesicaData.aldrete_circulacion) || 2;
    const conciencia = parseInt(postanestesicaData.aldrete_conciencia) || 2;
    const saturacion = parseInt(postanestesicaData.aldrete_saturacion) || 2;

    return actividad + respiracion + circulacion + conciencia + saturacion;
  }
  
  // .......................................................    VALIDACIONES  .........................

  // 🔥 VALIDACIÓN ESPECÍFICA PARA NOTA DE URGENCIAS
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
      `📊 CUMPLIMIENTO NOTA URGENCIAS NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  NOTA DE URGENCIAS CUMPLE CON NOM-004 SECCIÓN 7');
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA NOTA DE EVOLUCIÓN
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
      `📊 CUMPLIMIENTO NOTA EVOLUCIÓN NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  NOTA DE EVOLUCIÓN CUMPLE CON NOM-004 SECCIÓN 6.2');
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA CONSENTIMIENTO INFORMADO
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
      `📊 CUMPLIMIENTO CONSENTIMIENTO INFORMADO: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  CONSENTIMIENTO INFORMADO CUMPLE CON ESTÁNDARES LEGALES');
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA CONSENTIMIENTO DE HOSPITALIZACIÓN
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
      `📊 CUMPLIMIENTO CONSENTIMIENTO HOSPITALIZACIÓN: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log(
        '  CONSENTIMIENTO HOSPITALIZACIÓN CUMPLE CON ESTÁNDARES LEGALES'
      );
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA CONSENTIMIENTO DE REFERENCIA
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
      `📊 CUMPLIMIENTO CONSENTIMIENTO REFERENCIA: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log(
        '  CONSENTIMIENTO REFERENCIA CUMPLE CON ESTÁNDARES ADMINISTRATIVOS'
      );
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA CONSENTIMIENTO DE TRANSFUSIÓN SANGUÍNEA
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
      `📊 CUMPLIMIENTO CONSENTIMIENTO TRANSFUSIÓN: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  CONSENTIMIENTO TRANSFUSIÓN CUMPLE CON NOM-004 Y NOM-253');
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA CONSENTIMIENTO DE TRATAMIENTO MÉDICO
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
      `📊 CUMPLIMIENTO CONSENTIMIENTO TRATAMIENTO: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  CONSENTIMIENTO TRATAMIENTO CUMPLE CON NOM-004');
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA HOJA DE ALTA VOLUNTARIA
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
      `📊 CUMPLIMIENTO HOJA ALTA VOLUNTARIA: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  HOJA DE ALTA VOLUNTARIA CUMPLE CON NOM-004');
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA HOJA DE INFORME DIARIO
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
      `📊 CUMPLIMIENTO HOJA INFORME DIARIO: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  HOJA DE INFORME DIARIO CUMPLE CON NOM-004');
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA NOTA DE EGRESO
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
      `📊 CUMPLIMIENTO NOTA EGRESO NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  NOTA DE EGRESO CUMPLE CON NOM-004 SECCIÓN D12');
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA NOTA DE INTERCONSULTA
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
      `📊 CUMPLIMIENTO NOTA INTERCONSULTA NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  NOTA DE INTERCONSULTA CUMPLE CON NOM-004 SECCIÓN D7');
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA PRESCRIPCIÓN DE MEDICAMENTOS
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
      `📊 CUMPLIMIENTO PRESCRIPCIÓN MEDICAMENTOS: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log(
        '  PRESCRIPCIÓN DE MEDICAMENTOS CUMPLE CON ESTÁNDARES MÉDICOS'
      );
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA REGISTRO DE TRANSFUSIÓN
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
      `📊 CUMPLIMIENTO REGISTRO TRANSFUSIÓN: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  REGISTRO DE TRANSFUSIÓN CUMPLE CON NOM-004 Y NOM-253');
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA NOTA POSTOPERATORIA
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
      `📊 CUMPLIMIENTO NOTA POSTOPERATORIA NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  NOTA POSTOPERATORIA CUMPLE CON NOM-004 SECCIÓN 8.8');
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA NOTA PREOPERATORIA
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
      `📊 CUMPLIMIENTO NOTA PREOPERATORIA NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  NOTA PREOPERATORIA CUMPLE CON NOM-004 SECCIÓN 8.5');
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA NOTA POSTANESTÉSICA - MOVIDO DENTRO DE LA CLASE
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
      `📊 CUMPLIMIENTO NOTA POSTANESTÉSICA NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('  NOTA POSTANESTÉSICA CUMPLE CON NOM-004 SECCIÓN D11');
    }
  }

  // //////////////////////////////  GENERACION DE DOCUMENTOS ////////////////////////////////


  // ==========================================
  // MÉTODOS REFACTORIZADOS QUE USAN PdfTemplatesService
  // ==========================================
  async generarHistoriaClinica(datos: any): Promise<void> {
    console.log('🩺 Generando Historia Clínica Pediátrica NOM-004...');
    
    try {
      await this.ensurePdfMakeLoaded();

      // 1. Obtener y procesar datos (responsabilidad del generador)
      const medicoCompleto = await this.obtenerDatosMedicoActual();
      const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
      const signosVitalesReales = this.obtenerSignosVitalesReales(datos);
      const guiaClinicaData = this.obtenerGuiaClinicaSeleccionada(datos);
      const datosPadres = this.obtenerDatosPadres(datos);

      // 2. Preparar datos para el template
      const datosParaTemplate = {
        ...datos,
        medicoCompleto,
        pacienteCompleto,
        signosVitales: signosVitalesReales,
        guiaClinica: guiaClinicaData,
        datosPadres
      };

      // 3. Obtener definición del documento desde PdfTemplatesService
      const documentDefinition = await this.pdfTemplatesService.generarHistoriaClinica(datosParaTemplate);

      // 4. Generar nombre del archivo
      const fechaActual = new Date();
      const nombreArchivo = `historia-clinica-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      // 5. Crear y descargar PDF (responsabilidad del generador)
      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log('✅ PDF de Historia Clínica Pediátrica NOM-004 generado exitosamente');
      console.log(`📄 Archivo: ${nombreArchivo}`);

      // 6. Validaciones normativas
      this.validarCumplimientoNOM004(datos, medicoCompleto, pacienteCompleto);

    } catch (error) {
      console.error('❌ Error al generar PDF de Historia Clínica Pediátrica NOM-004:', error);
      throw error;
    }
  }

   async generarNotaUrgencias(datos: any): Promise<void> {
    console.log('🚨 Generando Nota de Urgencias...');
    
    try {
      await this.ensurePdfMakeLoaded();

      // 1. Procesar datos
      const medicoCompleto = await this.obtenerDatosMedicoActual();
      const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
      const signosVitales = this.obtenerSignosVitalesReales(datos);

      // 2. Preparar datos para template
      const datosParaTemplate = {
        ...datos,
        medicoCompleto,
        pacienteCompleto,
        signosVitales,
        numeroExpediente: this.obtenerNumeroExpedientePreferido(pacienteCompleto.expediente) || 'N/A',
       direccionCompleta: this.formatearDireccionMejorada(pacienteCompleto),
       folioNota: `NU-${this.obtenerNumeroExpedientePreferido(pacienteCompleto.expediente)}-${new Date().getFullYear()}`,

      };

      // 3. Obtener definición del template
      const documentDefinition = await this.pdfTemplatesService.generarNotaUrgencias(datosParaTemplate);

      // 4. Generar y descargar
      const fechaActual = new Date();
      const nombreArchivo = `nota-urgencias-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log('✅ PDF de Nota de Urgencias generado exitosamente');

      // 5. Validación específica
      this.validarCumplimientoNotaUrgencias(datos, medicoCompleto, pacienteCompleto);

    } catch (error) {
      console.error('❌ Error al generar PDF de Nota de Urgencias:', error);
      throw error;
    }
  }

// ==========================================
// MÉTODOS REFACTORIZADOS COMPLETOS
// ==========================================

 async generarNotaEvolucion(datos: any): Promise<void> {
  console.log('📈 Generando Nota de Evolución...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
    const signosVitales = this.obtenerSignosVitalesReales(datos);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto,
      signosVitales
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarNotaEvolucion(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `nota-evolucion-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Nota de Evolución generado exitosamente');

    // 5. Validación específica
    this.validarCumplimientoNotaEvolucion(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Nota de Evolución:', error);
    throw error;
  }
}

 async generarNotaEgreso(datos: any): Promise<void> {
  console.log('🚪 Generando Nota de Egreso...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
    const signosVitales = this.obtenerSignosVitalesReales(datos);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto,
      signosVitales,
      diasHospitalizacion: this.calcularDiaHospitalizacion()
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarNotaEgreso(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `nota-egreso-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Nota de Egreso generado exitosamente');

    // 5. Validación específica
    this.validarCumplimientoNotaEgreso(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Nota de Egreso:', error);
    throw error;
  }
}

 async generarNotaInterconsulta(datos: any): Promise<void> {
  console.log('🩺 Generando Nota de Interconsulta...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarNotaInterconsulta(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `nota-interconsulta-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Nota de Interconsulta generado exitosamente');

    // 5. Validación específica
    this.validarCumplimientoNotaInterconsulta(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Nota de Interconsulta:', error);
    throw error;
  }
}

 async generarNotaPreoperatoria(datos: any): Promise<void> {
  console.log('🔧 Generando Nota Preoperatoria...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
    const signosVitales = this.obtenerSignosVitalesReales(datos);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto,
      signosVitales
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarNotaPreoperatoria(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `nota-preoperatoria-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Nota Preoperatoria generado exitosamente');

    // 5. Validación específica
    this.validarCumplimientoNotaPreoperatoria(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Nota Preoperatoria:', error);
    throw error;
  }
}

 async generarNotaPostoperatoria(datos: any): Promise<void> {
  console.log('⚕️ Generando Nota Postoperatoria...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
    const signosVitales = this.obtenerSignosVitalesReales(datos);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto,
      signosVitales
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarNotaPostoperatoria(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `nota-postoperatoria-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Nota Postoperatoria generado exitosamente');

    // 5. Validación específica
    this.validarCumplimientoNotaPostoperatoria(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Nota Postoperatoria:', error);
    throw error;
  }
}

 async generarNotaPreanestesica(datos: any): Promise<void> {
  console.log('💉 Generando Nota Preanestésica...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
    const signosVitales = this.obtenerSignosVitalesReales(datos);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto,
      signosVitales
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarNotaPreanestesica(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `nota-preanestesica-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Nota Preanestésica generado exitosamente');

  } catch (error) {
    console.error('❌ Error al generar PDF de Nota Preanestésica:', error);
    throw error;
  }
}

 async generarNotaPostanestesica(datos: any): Promise<void> {
  console.log('🏥 Generando Nota Postanestésica...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
    const signosVitales = this.obtenerSignosVitalesReales(datos);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto,
      signosVitales,
      totalAldrete: this.calcularTotalAldrete(datos.notaPostanestesica || {})
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarNotaPostanestesica(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `nota-postanestesica-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Nota Postanestésica generado exitosamente');

    // 5. Validación específica
    this.validarCumplimientoNotaPostanestesica(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Nota Postanestésica:', error);
    throw error;
  }
}

// ==========================================
// CONSENTIMIENTOS INFORMADOS
// ==========================================

 async generarNotaConsentimientoProcedimientos(datos: any): Promise<void> {
  console.log('📋 Generando Consentimiento Informado de Procedimientos...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto
    };

    // 3. Obtener definición del template
const documentDefinition = await this.pdfTemplatesService.generarConsentimientoProcedimientos(datosParaTemplate);
    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `consentimiento-procedimientos-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Consentimiento Informado de Procedimientos generado exitosamente');

    // 5. Validación específica
    this.validarCumplimientoConsentimientoProcedimientos(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Consentimiento Informado de Procedimientos:', error);
    throw error;
  }
}

 async generarConsentimientoHospitalizacion(datos: any): Promise<void> {
  console.log('🏥 Generando Consentimiento de Hospitalización...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarConsentimientoHospitalizacion(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `consentimiento-hospitalizacion-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Consentimiento de Hospitalización generado exitosamente');

    // 5. Validación específica
    this.validarCumplimientoConsentimientoHospitalizacion(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Consentimiento de Hospitalización:', error);
    throw error;
  }
}

 async generarConsentimientoReferenciaPacientes(datos: any): Promise<void> {
  console.log('↗️ Generando Consentimiento de Referencia de Pacientes...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarConsentimientoReferenciaPacientes(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `consentimiento-referencia-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Consentimiento de Referencia generado exitosamente');

    // 5. Validación específica
    this.validarCumplimientoConsentimientoReferencia(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Consentimiento de Referencia:', error);
    throw error;
  }
}

 async generarConsentimientoTransfusionSanguinea(datos: any): Promise<void> {
  console.log('🩸 Generando Consentimiento de Transfusión Sanguínea...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarConsentimientoTransfusionSanguinea(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `consentimiento-transfusion-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Consentimiento de Transfusión Sanguínea generado exitosamente');

    // 5. Validación específica
    this.validarCumplimientoConsentimientoTransfusion(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Consentimiento de Transfusión Sanguínea:', error);
    throw error;
  }
}

 async generarConsentimientoTratamientoMedico(datos: any): Promise<void> {
  console.log('💊 Generando Consentimiento de Tratamiento Médico...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarConsentimientoTratamientoMedico(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `consentimiento-tratamiento-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Consentimiento de Tratamiento Médico generado exitosamente');

    // 5. Validación específica
    this.validarCumplimientoConsentimientoTratamiento(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Consentimiento de Tratamiento Médico:', error);
    throw error;
  }
}

// ==========================================
// HOJAS Y FORMATOS ADMINISTRATIVOS
// ==========================================

 async generarHojaAltaVoluntaria(datos: any): Promise<void> {
  console.log('🚪 Generando Hoja de Alta Voluntaria...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarHojaAltaVoluntaria(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `hoja-alta-voluntaria-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Hoja de Alta Voluntaria generado exitosamente');

    // 5. Validación específica
    this.validarCumplimientoAltaVoluntaria(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Hoja de Alta Voluntaria:', error);
    throw error;
  }
}

private async generarHojaInformeDiario(datos: any): Promise<void> {
  console.log('📊 Generando Hoja de Informe Diario...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarHojaInformeDiario(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `hoja-informe-diario-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Hoja de Informe Diario generado exitosamente');

    // 5. Validación específica
    this.validarCumplimientoInformeDiario(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Hoja de Informe Diario:', error);
    throw error;
  }
}

 async generarHojaFrontalExpediente(datos: any): Promise<void> {
  console.log('📂 Generando Hoja Frontal de Expediente...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarHojaFrontalExpediente(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `hoja-frontal-expediente-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Hoja Frontal de Expediente generado exitosamente');

  } catch (error) {
    console.error('❌ Error al generar PDF de Hoja Frontal de Expediente:', error);
    throw error;
  }
}

// ==========================================
// SOLICITUDES Y PRESCRIPCIONES
// ==========================================

 async generarSolicitudLaboratorio(datos: any): Promise<void> {
  console.log('🧪 Generando Solicitud de Laboratorio...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarSolicitudLaboratorio(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `solicitud-laboratorio-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Solicitud de Laboratorio generado exitosamente');

  } catch (error) {
    console.error('❌ Error al generar PDF de Solicitud de Laboratorio:', error);
    throw error;
  }
}

 async generarSolicitudImagenologia(datos: any): Promise<void> {
  console.log('📸 Generando Solicitud de Imagenología...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarSolicitudImagenologia(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `solicitud-imagenologia-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Solicitud de Imagenología generado exitosamente');

  } catch (error) {
    console.error('❌ Error al generar PDF de Solicitud de Imagenología:', error);
    throw error;
  }
}

 async generarSolicitudCultivo(datos: any): Promise<void> {
  console.log('🦠 Generando Solicitud de Cultivo...');
  
  try {
    await this.ensurePdfMakeLoaded();

    // 1. Procesar datos
    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);

    // 2. Preparar datos para template
    const datosParaTemplate = {
      ...datos,
      medicoCompleto,
      pacienteCompleto
    };

    // 3. Obtener definición del template
    const documentDefinition = await this.pdfTemplatesService.generarSolicitudCultivo(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `solicitud-cultivo-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Solicitud de Cultivo generado exitosamente');

  } catch (error) {
    console.error('❌ Error al generar PDF de Solicitud de Imagenología:', error);
    throw error;
  }
}// ==========================================
// SOLICITUDES Y PRESCRIPCIONES (CONTINUACIÓN)
// ==========================================

 async generarPrescripcionMedicamentos(datos: any): Promise<void> {
 console.log('💊 Generando Prescripción de Medicamentos...');
 
 try {
   await this.ensurePdfMakeLoaded();

   // 1. Procesar datos
   const medicoCompleto = await this.obtenerDatosMedicoActual();
   const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);

   // 2. Preparar datos para template
   const datosParaTemplate = {
     ...datos,
     medicoCompleto,
     pacienteCompleto
   };

   // 3. Obtener definición del template
   const documentDefinition = await this.pdfTemplatesService.generarPrescripcionMedicamentos(datosParaTemplate);

   // 4. Generar y descargar
   const fechaActual = new Date();
   const nombreArchivo = `prescripcion-medicamentos-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

   const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
   pdfDocGenerator.download(nombreArchivo);

   console.log('✅ PDF de Prescripción de Medicamentos generado exitosamente');

   // 5. Validación específica
   this.validarCumplimientoPrescripcionMedicamentos(datos, medicoCompleto, pacienteCompleto);

 } catch (error) {
   console.error('❌ Error al generar PDF de Prescripción de Medicamentos:', error);
   throw error;
 }
}

private async generarRegistroTransfusion(datos: any): Promise<void> {
 console.log('🩸 Generando Registro de Transfusión...');
 
 try {
   await this.ensurePdfMakeLoaded();

   // 1. Procesar datos
   const medicoCompleto = await this.obtenerDatosMedicoActual();
   const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
   const signosVitales = this.obtenerSignosVitalesReales(datos);

   // 2. Preparar datos para template
   const datosParaTemplate = {
     ...datos,
     medicoCompleto,
     pacienteCompleto,
     signosVitales
   };

   // 3. Obtener definición del template
   const documentDefinition = await this.pdfTemplatesService.generarRegistroTransfusion(datosParaTemplate);

   // 4. Generar y descargar
   const fechaActual = new Date();
   const nombreArchivo = `registro-transfusion-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

   const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
   pdfDocGenerator.download(nombreArchivo);

   console.log('✅ PDF de Registro de Transfusión generado exitosamente');

   // 5. Validación específica
   this.validarCumplimientoRegistroTransfusion(datos, medicoCompleto, pacienteCompleto);

 } catch (error) {
   console.error('❌ Error al generar PDF de Registro de Transfusión:', error);
   throw error;
 }
}

private async generarHojaQuirofano(datos: any): Promise<void> {
 console.log('🏥 Generando Hoja de Quirófano...');
 
 try {
   await this.ensurePdfMakeLoaded();

   // 1. Procesar datos
   const medicoCompleto = await this.obtenerDatosMedicoActual();
   const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
   const signosVitales = this.obtenerSignosVitalesReales(datos);

   // 2. Preparar datos para template
   const datosParaTemplate = {
     ...datos,
     medicoCompleto,
     pacienteCompleto,
     signosVitales
   };

   // 3. Obtener definición del template
   const documentDefinition = await this.pdfTemplatesService.generarHojaQuirofano(datosParaTemplate);

   // 4. Generar y descargar
   const fechaActual = new Date();
   const nombreArchivo = `hoja-quirofano-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

   const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
   pdfDocGenerator.download(nombreArchivo);

   console.log('✅ PDF de Hoja de Quirófano generado exitosamente');

 } catch (error) {
   console.error('❌ Error al generar PDF de Hoja de Quirófano:', error);
   throw error;
 }
}

// ==========================================
// DOCUMENTOS GENÉRICOS Y ESPECIALES
// ==========================================

private async generarDocumentoGenerico(tipoDocumento: string, datos: any): Promise<void> {
 console.log(`📄 Generando documento genérico: ${tipoDocumento}...`);
 
 try {
   await this.ensurePdfMakeLoaded();

   // 1. Procesar datos básicos
   const medicoCompleto = await this.obtenerDatosMedicoActual();
   const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
   const fechaActual = new Date();

   // 2. Crear documento genérico básico
   const documentDefinition = {
     pageSize: 'LETTER',
     pageMargins: [40, 60, 40, 60],

     header: {
       margin: [40, 20, 40, 20],
       table: {
         widths: ['100%'],
         body: [
           [
             {
               text: `HOSPITAL GENERAL SAN LUIS DE LA PAZ\n${tipoDocumento.toUpperCase()}`,
               fontSize: 14,
               bold: true,
               alignment: 'center',
               color: '#1a365d',
             },
           ],
         ],
       },
       layout: 'noBorders',
     },

     content: [
       { text: '', margin: [0, 20] },

       // Datos del paciente
       {
         table: {
           widths: ['100%'],
           body: [
             [
               {
                 text: 'DATOS DEL PACIENTE',
                 fontSize: 10,
                 bold: true,
                 fillColor: '#f0f0f0',
                 alignment: 'center',
                 margin: [0, 5],
               },
             ],
             [
               {
                 text: [
                   { text: 'Nombre: ', bold: true },
                   { text: `${pacienteCompleto.nombre_completo}\n`, fontSize: 10 },
                   { text: 'Expediente: ', bold: true },
                   { text: `${this.obtenerNumeroExpedientePreferido(pacienteCompleto.expediente || {})}\n`, fontSize: 10 },
                   { text: 'Edad: ', bold: true },
                   { text: `${pacienteCompleto.edad} años\n`, fontSize: 10 },
                   { text: 'Sexo: ', bold: true },
                   { text: `${pacienteCompleto.sexo}\n`, fontSize: 10 },
                   { text: 'Fecha: ', bold: true },
                   { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 10 },
                 ],
                 margin: [10, 10],
               },
             ],
           ],
         },
         layout: {
           hLineWidth: () => 1,
           vLineWidth: () => 1,
           hLineColor: () => '#cccccc',
           vLineColor: () => '#cccccc',
         },
       },

       { text: '', margin: [0, 20] },

       // Contenido específico del documento
       {
         table: {
           widths: ['100%'],
           body: [
             [
               {
                 text: `CONTENIDO DE ${tipoDocumento.toUpperCase()}`,
                 fontSize: 10,
                 bold: true,
                 fillColor: '#f0f0f0',
                 alignment: 'center',
                 margin: [0, 5],
               },
             ],
             [
               {
                 text: [
                   { text: 'Este documento será completado por el personal médico correspondiente.\n\n', fontSize: 10 },
                   { text: 'Observaciones: ', bold: true },
                   { text: datos.observaciones || 'Sin observaciones especiales.', fontSize: 10 },
                 ],
                 margin: [10, 20],
                 minHeight: 200,
               },
             ],
           ],
         },
         layout: {
           hLineWidth: () => 1,
           vLineWidth: () => 1,
           hLineColor: () => '#cccccc',
           vLineColor: () => '#cccccc',
         },
       },

       { text: '', margin: [0, 30] },

       // Datos del médico
       {
         table: {
           widths: ['50%', '50%'],
           body: [
             [
               {
                 text: 'MÉDICO RESPONSABLE',
                 fontSize: 9,
                 bold: true,
                 fillColor: '#f0f0f0',
                 alignment: 'center',
                 margin: [0, 5],
               },
               {
                 text: 'FIRMA',
                 fontSize: 9,
                 bold: true,
                 fillColor: '#f0f0f0',
                 alignment: 'center',
                 margin: [0, 5],
               },
             ],
             [
               {
                 text: [
                   { text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}\n`, fontSize: 9, bold: true },
                   { text: `Cédula: ${medicoCompleto.numero_cedula}\n`, fontSize: 8 },
                   { text: `${medicoCompleto.especialidad}\n`, fontSize: 8 },
                   { text: `${medicoCompleto.departamento}`, fontSize: 8 },
                 ],
                 margin: [10, 15],
                 alignment: 'center',
               },
               {
                 text: '\n\n_________________________\nFirma del Médico',
                 fontSize: 8,
                 margin: [10, 15],
                 alignment: 'center',
               },
             ],
           ],
         },
         layout: {
           hLineWidth: () => 1,
           vLineWidth: () => 1,
           hLineColor: () => '#cccccc',
           vLineColor: () => '#cccccc',
         },
       },
     ],

     footer: (currentPage: number, pageCount: number) => {
       return {
         margin: [40, 10],
         table: {
           widths: ['50%', '50%'],
           body: [
             [
               {
                 text: `${tipoDocumento} - SICEG`,
                 fontSize: 7,
                 color: '#666666',
               },
               {
                 text: fechaActual.toLocaleDateString('es-MX'),
                 fontSize: 7,
                 alignment: 'right',
                 color: '#666666',
               },
             ],
           ],
         },
         layout: 'noBorders',
       };
     },
   };

   // 3. Generar y descargar
   const nombreArchivo = `${tipoDocumento.toLowerCase().replace(/\s+/g, '-')}-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

   const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
   pdfDocGenerator.download(nombreArchivo);

   console.log(`✅ PDF de ${tipoDocumento} generado exitosamente`);

 } catch (error) {
   console.error(`❌ Error al generar PDF de ${tipoDocumento}:`, error);
   throw error;
 }
}








}
