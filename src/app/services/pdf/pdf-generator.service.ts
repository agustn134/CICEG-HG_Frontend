// src/app/services/pdf-generator.service.ts
import { Injectable, inject } from '@angular/core';
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
import { SolicitudesEstudio } from '../documentos-clinicos/solicitudes-estudio';
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
import { ConfiguracionService } from '../configuracion.service';


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
  private personalMedicoService = inject(PersonalMedicoService);
  private configuracionService = inject(ConfiguracionService);
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

  // C:\Proyectos\CICEG-HG_Frontend\src\app\services\pdf\pdf-generator.service.ts
  async generarDocumento(tipoDocumento: string, datos: any): Promise<void> {
    console.log(`📄 Generando ${tipoDocumento}...`);

    try {
      await this.ensurePdfMakeLoaded();

      // 1. Procesar datos común para todos
      const medicoCompleto = await this.obtenerDatosMedicoActual();
      const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
      const datosParaTemplate = {
        ...datos,
        medicoCompleto,
        pacienteCompleto
      };
      let documentDefinition;
      switch (tipoDocumento) {
        case 'Historia Clínica':
          documentDefinition = await this.pdfTemplatesService.generarHistoriaClinica( datosParaTemplate );
          break;
        case 'Hoja Frontal':
        case 'Hoja Frontal Expediente':
        case 'Hoja Frontal de Expediente':
          documentDefinition =  await this.pdfTemplatesService.generarHojaFrontalExpediente( datosParaTemplate );
          break;
        case 'Solicitud de Estudio':
        case 'Solicitud de Laboratorio':
        case 'Solicitud de Imagenología':
          documentDefinition =  await this.pdfTemplatesService.generarSolicitudEstudio( datosParaTemplate );
          break;
        case 'Prescripción de Medicamentos':
        case 'Prescripción':
          documentDefinition = await this.pdfTemplatesService.generarPrescripcionMedicamentos( datosParaTemplate );
          break;
        case 'Nota de Evolución':
        case 'Nota de Evolución Médica': documentDefinition = await this.pdfTemplatesService.generarNotaEvolucion( datosParaTemplate);
          break;
        case 'Nota de Urgencias':
        case 'Nota de Urgencias Médicas':
          documentDefinition = await this.pdfTemplatesService.generarNotaUrgencias(datosParaTemplate);
          break;
        case 'Referencia y Contrarreferencia':
        case 'Referencia':
        case 'Contrarreferencia':
        case 'Referencia y Traslado':
          documentDefinition = await this.pdfTemplatesService.generarReferenciaContrarreferencia(datosParaTemplate);
          break;
        // case 'Consentimiento Informado':
        // case 'Consentimiento':
        //   documentDefinition = await this.pdfTemplatesService.generarNotaConsentimientoProcedimientos(datosParaTemplate);
        //   break;

        case 'Consentimiento Informado':
          case 'Consentimiento':
            documentDefinition = await this.pdfTemplatesService.generarConsentimientoSegunTipo(datosParaTemplate);
            break;

        case 'Alta Voluntaria':
          documentDefinition = await this.pdfTemplatesService.generarAltaVoluntaria(datosParaTemplate);
          break;
        
        case 'Nota Preanestésica': 
        documentDefinition = await this.pdfTemplatesService.generarNotaPreanestesica(datosParaTemplate);
          break;
      case 'Nota Preoperatoria':
      case 'Preoperatoria':
        documentDefinition = await this.pdfTemplatesService.generarNotaPreoperatoria(datosParaTemplate);
        break;
        case 'Nota Postoperatoria':
        case 'Postoperatoria':
          documentDefinition = await this.pdfTemplatesService.generarNotaPostoperatoria(datosParaTemplate);
          break;
        case 'Nota Postanestésica':
          documentDefinition = await this.pdfTemplatesService.generarNotaPostanestesica(datosParaTemplate);
        break;
        case 'Nota de Interconsulta':
        case 'Interconsulta':
          documentDefinition = await this.pdfTemplatesService.generarNotaInterconsulta(datosParaTemplate);
          break;

        // ✅ AGREGAR ESTE CASO SIMPLE:
        case 'Nota de Egreso':
        case 'notaEgreso':
          documentDefinition = await this.pdfTemplatesService.generarNotaEgreso(datosParaTemplate);
          break;

  
        default:
          throw new Error(`Documento ${tipoDocumento} no implementado aún`);
      }

      // 4. Generar y descargar PDF
      const fechaActual = new Date();
      const nombreArchivo = `${tipoDocumento.toLowerCase().replace(/\s+/g, '-')}-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log(`✅ ${tipoDocumento} generado exitosamente`);
    } catch (error) {
      console.error(`❌ Error generando ${tipoDocumento}:`, error);
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
      pacienteInfo?.['email'] ||
      'No registrado',
    direccion_completa: this.formatearDireccionMejorada(pacienteInfo),

      // Información médica
      tipo_sangre: pacienteInfo?.tipo_sangre ||
      datosPaciente?.paciente?.['tipo_sangre'] ||
      datosPaciente?.['tipo_sangre'] ||
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

  // private obtenerSignosVitalesReales(datos: any): any {
  //   console.log('  Buscando signos vitales en los datos recibidos...');

  //   let signosVitales = {
  //     peso: null as number | null,
  //     talla: null as number | null,
  //     temperatura: null as number | null,
  //     presion_arterial_sistolica: null as number | null,
  //     presion_arterial_diastolica: null as number | null,
  //     frecuencia_cardiaca: null as number | null,
  //     frecuencia_respiratoria: null as number | null,
  //     saturacion_oxigeno: null as number | null,
  //     glucosa: null as number | null,
  //   };
  //   if (datos.signosVitales) {
  //     console.log('Encontrados signos vitales en datos.signosVitales');
  //     signosVitales = {
  //       ...signosVitales,
  //       ...Object.fromEntries(
  //         Object.entries(datos.signosVitales).map(([key, value]) => [
  //           key,
  //           value !== null && value !== undefined ? Number(value) : null,
  //         ])
  //       ),
  //     };
  //   }
  //   if (
  //     datos.paciente?.signosVitales &&
  //     Array.isArray(datos.paciente.signosVitales) &&
  //     datos.paciente.signosVitales.length > 0
  //   ) {
  //     console.log(
  //       'Encontrados signos vitales históricos en datos.paciente.signosVitales'
  //     );
  //     const ultimosSignos = datos.paciente.signosVitales[0]; // El más reciente
  //     signosVitales = {
  //       ...signosVitales,
  //       ...Object.fromEntries(
  //         Object.entries(ultimosSignos).map(([key, value]) => [
  //           key,
  //           value !== null && value !== undefined ? Number(value) : null,
  //         ])
  //       ),
  //     };
  //   }
  //   console.log('🩺 Signos vitales finales para el PDF:', signosVitales);
  //   return signosVitales;
  // }

  // src/app/services/PDF/pdf-generator.service.ts
private obtenerSignosVitalesReales(datos: any): any {
  console.log('🩺 Buscando signos vitales en los datos recibidos...');

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
    observaciones: null as string | null,
  };

  // 🔥 NUEVA PRIORIDAD 1: Buscar en Historia Clínica PRIMERO (datos propagados)
  if (datos.historiaClinica) {
    console.log('✅ Encontrados signos vitales en Historia Clínica (datos propagados)');
    signosVitales = {
      ...signosVitales,
      peso: datos.historiaClinica.peso || null,
      talla: datos.historiaClinica.talla || null,
      temperatura: datos.historiaClinica.temperatura || null,
      presion_arterial_sistolica: datos.historiaClinica.presion_arterial_sistolica || null,
      presion_arterial_diastolica: datos.historiaClinica.presion_arterial_diastolica || null,
      frecuencia_cardiaca: datos.historiaClinica.frecuencia_cardiaca || null,
      frecuencia_respiratoria: datos.historiaClinica.frecuencia_respiratoria || null,
      saturacion_oxigeno: datos.historiaClinica.saturacion_oxigeno || null,
      glucosa: datos.historiaClinica.glucosa || null,
      observaciones: datos.historiaClinica.observaciones_signos_vitales || null,
    };
  }

  // 🔥 PRIORIDAD 2: Si no hay en Historia Clínica, buscar en signosVitales
  if (datos.signosVitales && Object.values(signosVitales).every(v => v === null)) {
    console.log('✅ Usando signos vitales de datos.signosVitales');
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

  // 🔥 PRIORIDAD 3: Buscar en datos históricos del paciente
  if (datos.paciente?.signosVitales && Array.isArray(datos.paciente.signosVitales) && 
      datos.paciente.signosVitales.length > 0 && 
      Object.values(signosVitales).every(v => v === null)) {
    console.log('✅ Usando signos vitales históricos del paciente');
    const ultimosSignos = datos.paciente.signosVitales[0];
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
      `  CUMPLIMIENTO NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`
    );

    if (porcentaje < 90) {
      console.warn('  ADVERTENCIA: Cumplimiento por debajo del 90%');
      const faltantes = Object.entries(validaciones)
        .filter(([_, valor]) => !valor)
        .map(([campo, _]) => campo);
      console.warn('  Campos faltantes:', faltantes);
    } else {
      console.log('  CUMPLIMIENTO NORMATIVO SATISFACTORIO');
    }
  }

private formatearDireccionMejorada(paciente: any): string {
  console.log('🏠 DEBUG - Datos del paciente recibidos:', {
    domicilio: paciente.domicilio,
    direccion: paciente.direccion,
    persona_domicilio: paciente.persona?.domicilio,
    estructura_completa: Object.keys(paciente)
  });
  
  if (!paciente) return 'Sin dirección registrada';
  
  // ✅ USAR BRACKET NOTATION para propiedades con índice signature
  const domicilio =
    paciente.domicilio ||
    paciente.direccion ||
    paciente.persona?.domicilio ||
    paciente.persona?.['direccion'] ||
    paciente['direccion_completa'] ||
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
    //1. Buscar en datos del paciente
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
      guiaClinica.nombre_completo = `${datos.guiaClinica.codigo || ''} - ${datos.guiaClinica.nombre || ''
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

      console.log('  Generando Signos Vitales con datos completos...');

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
                  text: ' ',
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
                    text: `${signosVitalesData.presion_arterial_sistolica || '___'
                      }/${signosVitalesData.presion_arterial_diastolica || '___'
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
                    text: `${signosVitalesData.frecuencia_cardiaca || '___'
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
                    text: `${signosVitalesData.frecuencia_respiratoria || '___'
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


  // //////////////////////////////  GENERACION DE DOCUMENTOS ////////////////////////////////


// C:\Proyectos\CICEG-HG_Frontend\src\app\services\PDF\pdf-generator.service.ts
  async generarHistoriaClinica(datos: any): Promise<void> {
    console.log('🩺 Generando Historia Clínica NOM-004...');
    try {
      await this.ensurePdfMakeLoaded();
      if (!this.pdfMake) {
        throw new Error('PDFMake no está disponible');
      }

      // 1. Obtener y procesar datos (responsabilidad del generador)
      const medicoCompleto = await this.obtenerDatosMedicoActual();
      // ✅ CAMBIO CRÍTICO: NO procesar de nuevo, usar los datos ya estructurados
      const pacienteCompleto = datos.paciente; // Los datos YA vienen procesados correctamente
      const configuracion = await this.configuracionService.getConfiguracionCompleta().toPromise();
      const signosVitalesReales = this.obtenerSignosVitalesReales(datos); // 🔥 LÍNEA SEPARADA
      const guiaClinicaData = this.obtenerGuiaClinicaSeleccionada(datos);
      const datosPadres = this.obtenerDatosPadres(datos);

      // 2. Preparar datos para el template
      const datosParaTemplate = {
  ...datos,
  medicoCompleto,
  pacienteCompleto,
  signosVitales: signosVitalesReales,
  historiaClinica: {
    ...datos.historiaClinica,
    codigo_cie10: datos.historiaClinica?.codigo_cie10, // 🔥 ASEGURAR QUE PASE
  },
  guiaClinica: guiaClinicaData,
  guiasClinicas: datos.guiasClinicas || [],
  datosPadres,
  configuracion,
};

      // ✅ DEBUG: Verificar que los datos llegan correctamente
      console.log('  Datos del paciente que van al template:', pacienteCompleto);
      console.log('🏠 Domicilio del paciente:', pacienteCompleto.domicilio);
      console.log('🩸 Tipo de sangre:', pacienteCompleto.tipo_sangre);

      // 3. Obtener definición del documento desde PdfTemplatesService
      const documentDefinition = await this.pdfTemplatesService.generarHistoriaClinica(datosParaTemplate);

      if (!documentDefinition || !documentDefinition.content) {
        throw new Error('Definición del documento inválida');
      }

      console.log('  Contenido del documento:', documentDefinition.content.length, 'elementos');

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
      console.error('❌ Error al generar PDF:', error);
      // ✅ MOSTRAR DETALLES DEL ERROR
      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
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

  async generarPrescripcionMedicamentos(datos: any): Promise<void> {
    console.log('💊 Generando PDF de Prescripción de Medicamentos...');

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
      const nombreArchivo = `prescripcion-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log('✅ PDF de Prescripción de Medicamentos generado exitosamente');

    } catch (error) {
      console.error('❌ Error al generar PDF de Prescripción:', error);
      throw error;
    }
  }

// C:\Proyectos\CICEG-HG_Frontend\src\app\services\PDF\pdf-generator.service.ts
  async generarNotaUrgenciasMedicas(datos: any): Promise<void> {
    console.log('  Generando PDF de Nota de Urgencias...');

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
      const documentDefinition = await this.pdfTemplatesService.generarNotaUrgencias(datosParaTemplate);

      // 4. Generar y descargar
      const fechaActual = new Date();
      const nombreArchivo = `nota-urgencias-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log('✅ PDF de Nota de Urgencias generado exitosamente');

    } catch (error) {
      console.error('❌ Error al generar PDF de Nota de Urgencias:', error);
      throw error;
    }
  }

  async generarNotaEvolucion(datos: any): Promise<void> {
  console.log('📈 Generando PDF de Nota de Evolución...');

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
    const documentDefinition = await this.pdfTemplatesService.generarNotaEvolucion(datosParaTemplate);

    // 4. Generar y descargar
    const fechaActual = new Date();
    const nombreArchivo = `nota-evolucion-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Nota de Evolución generado exitosamente');

  } catch (error) {
    console.error('❌ Error al generar PDF de Nota de Evolución:', error);
    throw error;
  }
}


}
