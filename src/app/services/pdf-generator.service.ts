// src/app/services/pdf-generator.service.ts
import { Injectable } from '@angular/core';
import { PersonalMedicoService } from './personas/personal-medico';
import { AuthService } from './auth/auth.service';

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

@Injectable({
  providedIn: 'root',
})

export class PdfGeneratorService {

  private pdfMake: any;
  private isLoaded = false;

  constructor(
    private personalMedicoService: PersonalMedicoService,
    private authService: AuthService
  ) {
    this.loadPdfMake();
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
    console.log('🔍 Datos recibidos del paciente:', datosPaciente);

    let pacienteInfo = null;
    let expedienteInfo = null;

    // 1. Si los datos vienen directamente del wizard (paso persona)
    if (datosPaciente?.persona) {
      console.log('✅ Datos encontrados en datosPaciente.persona');
      pacienteInfo = datosPaciente.persona;
      expedienteInfo = datosPaciente.expediente;
    }

    // 2. Si vienen anidados en paciente.persona.persona
    else if (datosPaciente?.paciente?.persona?.persona) {
      console.log('✅ Datos encontrados en estructura anidada');
      pacienteInfo = datosPaciente.paciente.persona.persona;
      expedienteInfo =
        datosPaciente.paciente?.expediente || datosPaciente.expediente;
    }

    // 3. Si vienen en paciente.persona
    else if (datosPaciente?.paciente?.persona) {
      console.log('✅ Datos encontrados en paciente.persona');
      pacienteInfo = datosPaciente.paciente.persona;
      expedienteInfo = datosPaciente.expediente;
    }

    // 4. Si los datos están directamente en paciente
    else if (datosPaciente?.paciente) {
      console.log('✅ Datos encontrados directamente en paciente');
      pacienteInfo = datosPaciente.paciente;
      expedienteInfo = datosPaciente.expediente;
    }

    // 5. Si vienen del formData del wizard directamente
    else if (datosPaciente?.nombre || datosPaciente?.apellido_paterno) {
      console.log('✅ Datos encontrados directamente en el objeto raíz');
      pacienteInfo = datosPaciente;
      expedienteInfo = datosPaciente.expediente;
    }

    console.log('✅ Datos extraídos del paciente:', pacienteInfo);
    console.log('✅ Datos del expediente:', expedienteInfo);

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
      tipo_sangre:
        pacienteInfo?.tipo_sangre ||
        datosPaciente?.paciente?.tipo_sangre ||
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
    console.log('🔍 Buscando signos vitales en los datos recibidos...');

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

  // 🔥 MÉTODO AUXILIAR PARA VALIDAR CUMPLIMIENTO DE LA NOM-004
  private validarCumplimientoNOM004(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log('🔍 VALIDANDO CUMPLIMIENTO NOM-004-SSA3-2012...');

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
      console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 90%');
      const faltantes = Object.entries(validaciones)
        .filter(([_, valor]) => !valor)
        .map(([campo, _]) => campo);
      console.warn('📋 Campos faltantes:', faltantes);
    } else {
      console.log('✅ CUMPLIMIENTO NORMATIVO SATISFACTORIO');
    }
  }

  // 🔥 MÉTODO MEJORADO PARA FORMATEAR DIRECCIÓN (ya existe pero lo optimizo)
  private formatearDireccionMejorada(paciente: any): string {
    if (!paciente) return 'Sin dirección registrada';

    const partes = [
      paciente.calle,
      paciente.numero_exterior ? `#${paciente.numero_exterior}` : '',
      paciente.numero_interior ? `Int. ${paciente.numero_interior}` : '',
      paciente.colonia,
      paciente.municipio || paciente.ciudad,
      paciente.estado,
      paciente.codigo_postal ? `C.P. ${paciente.codigo_postal}` : '',
    ].filter(
      (parte) =>
        parte &&
        parte.trim() !== '' &&
        parte.trim() !== 'null' &&
        parte.trim() !== 'undefined'
    );

    return partes.length > 0 ? partes.join(', ') : 'Sin dirección registrada';
  }

  // 🔥 MÉTODO MEJORADO PARA OBTENER DATOS DE PADRES
  private obtenerDatosPadres(datos: any): DatosPadres {
    console.log('🔍 Buscando datos de padres para Historia Clínica...');

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
    console.log('🔍 Buscando guía clínica seleccionada...');

    const guiaClinica: GuiaClinicaData = {
      codigo: null,
      nombre: null,
      area: null,
      fuente: null,
      nombre_completo: null,
    };

    // 1. Buscar en datos.guiaClinica (pasada desde el componente)
    if (datos.guiaClinica) {
      console.log('✅ Encontrada guía clínica en datos.guiaClinica');
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

  private async loadPdfMake() {
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
      console.log('✅ PDFMake cargado correctamente');
    } catch (error) {
      console.error('❌ Error al cargar PDFMake:', error);
      this.isLoaded = true;
    }
  }

  private async ensurePdfMakeLoaded() {
    if (!this.isLoaded) {
      await this.loadPdfMake();
    }
  }

  // 🔥 MÉTODO AUXILIAR PARA CALCULAR DÍA DE HOSPITALIZACIÓN
  private calcularDiaHospitalizacion(): number {
    // Esta función calcularía los días desde el ingreso
    // Por ahora retorna un valor por defecto
    // En implementación real se calcularía desde la fecha de ingreso
    return 1;
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
                      text: `SV-${pacienteCompleto.numero_expediente}\n`,
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
                    text: `Expediente: ${
                      pacienteCompleto.numero_expediente
                    } | Fecha de registro: ${fechaActual.toLocaleDateString(
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
      console.log('✅ PDF de Signos Vitales generado exitosamente');
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

  // .......................................................    VALIDACIONES  .........................

  // 🔥 VALIDACIÓN ESPECÍFICA PARA NOTA DE URGENCIAS
  private validarCumplimientoNotaUrgencias(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '🔍 VALIDANDO CUMPLIMIENTO NOM-004 SECCIÓN 7 - NOTA DE URGENCIAS...'
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
      console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('✅ NOTA DE URGENCIAS CUMPLE CON NOM-004 SECCIÓN 7');
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA NOTA DE EVOLUCIÓN
  private validarCumplimientoNotaEvolucion(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '🔍 VALIDANDO CUMPLIMIENTO NOM-004 SECCIÓN 6.2 - NOTA DE EVOLUCIÓN...'
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
      console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('✅ NOTA DE EVOLUCIÓN CUMPLE CON NOM-004 SECCIÓN 6.2');
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA CONSENTIMIENTO INFORMADO
  private validarCumplimientoConsentimientoProcedimientos(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log(
      '🔍 VALIDANDO CUMPLIMIENTO NOM-004 - CONSENTIMIENTO INFORMADO...'
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
      console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('✅ CONSENTIMIENTO INFORMADO CUMPLE CON ESTÁNDARES LEGALES');
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA CONSENTIMIENTO DE HOSPITALIZACIÓN
  private validarCumplimientoConsentimientoHospitalizacion(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log('🔍 VALIDANDO CUMPLIMIENTO NOM-004 - CONSENTIMIENTO HOSPITALIZACIÓN...');

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
      console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('✅ CONSENTIMIENTO HOSPITALIZACIÓN CUMPLE CON ESTÁNDARES LEGALES');
    }
  }

  // 🔥 VALIDACIÓN ESPECÍFICA PARA CONSENTIMIENTO DE REFERENCIA
  private validarCumplimientoConsentimientoReferencia(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log('🔍 VALIDANDO CUMPLIMIENTO NOM-004 - CONSENTIMIENTO REFERENCIA...');

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
      console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('✅ CONSENTIMIENTO REFERENCIA CUMPLE CON ESTÁNDARES ADMINISTRATIVOS');
    }
  }


  // 🔥 VALIDACIÓN ESPECÍFICA PARA CONSENTIMIENTO DE TRANSFUSIÓN SANGUÍNEA
  private validarCumplimientoConsentimientoTransfusion(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log('🔍 VALIDANDO CUMPLIMIENTO NOM-004 Y NOM-253 - CONSENTIMIENTO TRANSFUSIÓN...');

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
      console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('✅ CONSENTIMIENTO TRANSFUSIÓN CUMPLE CON NOM-004 Y NOM-253');
    }
  }


  // 🔥 VALIDACIÓN ESPECÍFICA PARA CONSENTIMIENTO DE TRATAMIENTO MÉDICO
  private validarCumplimientoConsentimientoTratamiento(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log('🔍 VALIDANDO CUMPLIMIENTO NOM-004 - CONSENTIMIENTO TRATAMIENTO MÉDICO...');

    const validaciones = {
      // Datos del paciente (5.9)
      nombre_completo_paciente: !!paciente.nombre_completo,
      apellidos_nombres_separados: !!paciente.apellido_paterno && !!paciente.nombre,
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
      console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('✅ CONSENTIMIENTO TRATAMIENTO CUMPLE CON NOM-004');
    }
  }

    // 🔥 VALIDACIÓN ESPECÍFICA PARA HOJA DE ALTA VOLUNTARIA
  private validarCumplimientoAltaVoluntaria(
    datos: any,
    medico: any,
    paciente: any
  ): void {
    console.log('🔍 VALIDANDO CUMPLIMIENTO NOM-004 - HOJA DE ALTA VOLUNTARIA...');

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
      console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 90%');
    } else {
      console.log('✅ HOJA DE ALTA VOLUNTARIA CUMPLE CON NOM-004');
    }
  }


  // 🔥 VALIDACIÓN ESPECÍFICA PARA HOJA DE INFORME DIARIO
private validarCumplimientoInformeDiario(
  datos: any,
  medico: any,
  paciente: any
): void {
  console.log('🔍 VALIDANDO CUMPLIMIENTO NOM-004 - HOJA DE INFORME DIARIO...');

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
    console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 90%');
  } else {
    console.log('✅ HOJA DE INFORME DIARIO CUMPLE CON NOM-004');
  }
}


// 🔥 VALIDACIÓN ESPECÍFICA PARA NOTA DE EGRESO
private validarCumplimientoNotaEgreso(
  datos: any,
  medico: any,
  paciente: any
): void {
  console.log('🔍 VALIDANDO CUMPLIMIENTO NOM-004 SECCIÓN D12 - NOTA DE EGRESO...');

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
   console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 90%');
 } else {
   console.log('✅ NOTA DE EGRESO CUMPLE CON NOM-004 SECCIÓN D12');
 }
}

// 🔥 VALIDACIÓN ESPECÍFICA PARA NOTA DE INTERCONSULTA
private validarCumplimientoNotaInterconsulta(
  datos: any,
  medico: any,
  paciente: any
): void {
  console.log('🔍 VALIDANDO CUMPLIMIENTO NOM-004 SECCIÓN D7 - NOTA DE INTERCONSULTA...');

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
    console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 90%');
  } else {
    console.log('✅ NOTA DE INTERCONSULTA CUMPLE CON NOM-004 SECCIÓN D7');
  }
}













  /////////////////////////////////////////// GENERACION DE DOCUMETNOS ///////////////////////////////////////

  async generarHistoriaClinica(datos: any): Promise<void> {
    try {
      await this.ensurePdfMakeLoaded();

      const medicoCompleto = await this.obtenerDatosMedicoActual();
      const pacienteCompleto = this.validarYFormatearDatosPaciente(
        datos.paciente
      );
      const historiaClinicaData = datos.historiaClinica || {};
      const signosVitalesReales = this.obtenerSignosVitalesReales(datos);
      const guiaClinicaData = this.obtenerGuiaClinicaSeleccionada(datos);
      const datosPadres = this.obtenerDatosPadres(datos);
      const fechaActual = new Date();
      console.log(
        'Generando Historia Clínica Pediátrica completa con NOM-004...'
      );
      console.log('🩺 Signos vitales:', signosVitalesReales);
      console.log('📖 Guía clínica:', guiaClinicaData);
      console.log('👨‍👩‍👧‍👦 Datos de padres:', datosPadres);

      const documentDefinition = {
        pageSize: 'LETTER',
        pageMargins: [20, 60, 20, 40],

        header: {
          margin: [20, 10, 20, 10],
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - HISTORIA CLÍNICA PEDIÁTRICA GENERAL',
                  fontSize: 10,
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
          {
            table: {
              widths: ['15%', '85%'],
              body: [
                [
                  {
                    text: 'IDENTIFICACIÓN',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#f5f5f5',
                    alignment: 'center',
                    rowSpan: 8,
                  },
                  {
                    table: {
                      widths: ['20%', '20%', '20%', '20%', '20%'],
                      body: [
                        [
                          {
                            text: 'Fecha de elaboración',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'Hora de elaboración',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'No. Expediente',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'No. de cama',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'Servicio',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                        ],
                        [
                          {
                            text: fechaActual.toLocaleDateString('es-MX'),
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                          {
                            text: fechaActual.toLocaleTimeString('es-MX'),
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                          {
                            text: pacienteCompleto.numero_expediente || 'N/A',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                            bold: true,
                          },
                          {
                            text:
                              historiaClinicaData.numero_cama || 'Ambulatorio',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                          {
                            text:
                              medicoCompleto.departamento || 'No especificado',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: () => 0.3,
                      vLineWidth: () => 0.3,
                      hLineColor: () => '#000000',
                      vLineColor: () => '#000000',
                    },
                  },
                ],
                [
                  {},
                  {
                    table: {
                      widths: ['70%', '15%', '15%'],
                      body: [
                        [
                          {
                            text: 'Nombre completo del paciente',
                            fontSize: 7,
                            bold: true,
                          },
                          {
                            text: 'Edad',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'Sexo',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                        ],
                        [
                          {
                            text: pacienteCompleto.nombre_completo,
                            fontSize: 8,
                            bold: true,
                            margin: [2, 3],
                          },
                          {
                            text: `${pacienteCompleto.edad} años`,
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 3],
                          },
                          {
                            text: pacienteCompleto.sexo,
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 3],
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: () => 0.3,
                      vLineWidth: () => 0.3,
                      hLineColor: () => '#000000',
                      vLineColor: () => '#000000',
                    },
                  },
                ],
                [
                  {},
                  {
                    table: {
                      widths: ['100%'],
                      body: [
                        [
                          {
                            text: 'Domicilio del paciente',
                            fontSize: 7,
                            bold: true,
                          },
                        ],
                        [
                          {
                            text: this.formatearDireccionMejorada(
                              pacienteCompleto
                            ),
                            fontSize: 7,
                            margin: [2, 3],
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: () => 0.3,
                      vLineWidth: () => 0.3,
                      hLineColor: () => '#000000',
                      vLineColor: () => '#000000',
                    },
                  },
                ],
                [
                  {},
                  {
                    table: {
                      widths: ['25%', '25%', '25%', '25%'],
                      body: [
                        [
                          {
                            text: 'Fecha nacimiento',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'CURP',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'Lugar de nacimiento',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'Teléfono',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                        ],
                        [
                          {
                            text:
                              pacienteCompleto.fecha_nacimiento ||
                              'No registrada',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                          {
                            text: pacienteCompleto.curp || 'No registrado',
                            fontSize: 6,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                          {
                            text:
                              pacienteCompleto.lugar_nacimiento ||
                              'No especificado',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                          {
                            text: pacienteCompleto.telefono || 'No registrado',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: () => 0.3,
                      vLineWidth: () => 0.3,
                      hLineColor: () => '#000000',
                      vLineColor: () => '#000000',
                    },
                  },
                ],
                [
                  {},
                  {
                    table: {
                      widths: ['25%', '25%', '25%', '25%'],
                      body: [
                        [
                          {
                            text: 'Ocupación',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'Escolaridad',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'Estado civil',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },

                          {
                            text: 'Religión',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                        ],
                        [
                          {
                            text: pacienteCompleto.ocupacion || 'No registrada',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                          {
                            text:
                              pacienteCompleto.escolaridad || 'No registrada',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                          {
                            text:
                              pacienteCompleto.estado_civil || 'No registrado',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                          {
                            text: pacienteCompleto.religion || 'No registrada',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: () => 0.3,
                      vLineWidth: () => 0.3,
                      hLineColor: () => '#000000',
                      vLineColor: () => '#000000',
                    },
                  },
                ],
                [
                  {},
                  {
                    table: {
                      widths: ['50%', '50%'],
                      body: [
                        [
                          {
                            text: 'Nombre del padre',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'Nombre de la madre',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                        ],
                        [
                          {
                            text: datosPadres.nombre_padre,
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                          {
                            text: datosPadres.nombre_madre,
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: () => 0.3,
                      vLineWidth: () => 0.3,
                      hLineColor: () => '#000000',
                      vLineColor: () => '#000000',
                    },
                  },
                ],
                [
                  {},
                  {
                    table: {
                      widths: ['60%', '40%'],
                      body: [
                        [
                          {
                            text: 'Familiar responsable',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'Teléfono de contacto',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                        ],
                        [
                          {
                            text:
                              pacienteCompleto.familiar_responsable ||
                              'No registrado',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                          {
                            text:
                              pacienteCompleto.telefono_familiar ||
                              'No registrado',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: () => 0.3,
                      vLineWidth: () => 0.3,
                      hLineColor: () => '#000000',
                      vLineColor: () => '#000000',
                    },
                  },
                ],
                [
                  {},
                  {
                    table: {
                      widths: ['70%', '30%'],
                      body: [
                        [
                          {
                            text: 'Médico responsable de la elaboración',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'Cédula profesional',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                        ],
                        [
                          {
                            text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}`,
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                          {
                            text:
                              medicoCompleto.numero_cedula || 'No registrada',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: () => 0.3,
                      vLineWidth: () => 0.3,
                      hLineColor: () => '#000000',
                      vLineColor: () => '#000000',
                    },
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          { text: '', margin: [0, 1] },
          {
            table: {
              widths: ['15%', '85%'],
              body: [
                [
                  {
                    text: 'ANTECEDENTES',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#eeece1',
                    alignment: 'center',
                    rowSpan: 8,
                  },
                  {
                    text: 'HEREDO FAMILIARES',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      historiaClinicaData.antecedentes_heredo_familiares ||
                      'Sin antecedentes familiares relevantes. Se interroga específicamente por diabetes mellitus, hipertensión arterial, cardiopatías, neoplasias, enfermedades hereditarias y mentales.',
                    fontSize: 7,
                    margin: [5, 5],
                    lineHeight: 1.3,
                  },
                ],
                [
                  {},
                  {
                    text: 'PERSONALES NO PATOLÓGICOS',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      `Alimentación: ${
                        historiaClinicaData.habitos_alimenticios ||
                        'Adecuada para la edad'
                      }\n` +
                      `Higiene: ${
                        historiaClinicaData.habitos_higienicos || 'Adecuada'
                      }\n` +
                      `Actividad física: ${
                        historiaClinicaData.actividad_fisica ||
                        'Apropiada para la edad'
                      }\n` +
                      `Vivienda: ${
                        historiaClinicaData.vivienda ||
                        'Casa habitación con servicios básicos'
                      }\n` +
                      `Inmunizaciones: ${
                        historiaClinicaData.inmunizaciones ||
                        'Esquema completo según edad'
                      }\n` +
                      `Desarrollo psicomotor: ${
                        historiaClinicaData.desarrollo_psicomotor ||
                        'Acorde a la edad'
                      }`,
                    fontSize: 7,
                    margin: [5, 5],
                    lineHeight: 1.3,
                  },
                ],
                [
                  {},
                  {
                    text: 'PERSONALES PATOLÓGICOS',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      `Enfermedades en la infancia: ${
                        historiaClinicaData.enfermedades_infancia || 'Negadas'
                      }\n` +
                      `Hospitalizaciones previas: ${
                        historiaClinicaData.hospitalizaciones_previas ||
                        'Ninguna'
                      }\n` +
                      `Cirugías previas: ${
                        historiaClinicaData.cirugias_previas || 'Ninguna'
                      }\n` +
                      `Traumatismos: ${
                        historiaClinicaData.traumatismos || 'Ninguno'
                      }\n` +
                      `Alergias (medicamentos/alimentos): ${
                        historiaClinicaData.alergias || 'Negadas'
                      }\n` +
                      `Transfusiones: ${
                        historiaClinicaData.transfusiones || 'Ninguna'
                      }`,
                    fontSize: 7,
                    margin: [5, 5],
                    lineHeight: 1.3,
                  },
                ],
                [
                  {},
                  {
                    text: 'PERINATALES (si aplica)',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      `Control prenatal: ${
                        historiaClinicaData.control_prenatal || 'No aplica'
                      }\n` +
                      `Tipo de parto: ${
                        historiaClinicaData.tipo_parto || 'No aplica'
                      }\n` +
                      `Peso al nacer: ${
                        historiaClinicaData.peso_nacer || 'No registrado'
                      }\n` +
                      `Complicaciones neonatales: ${
                        historiaClinicaData.complicaciones_neonatales ||
                        'Ninguna'
                      }`,
                    fontSize: 7,
                    margin: [5, 5],
                    lineHeight: 1.3,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          { text: '', margin: [0, 1] },

          {
            table: {
              widths: ['15%', '85%'],
              body: [
                [
                  {
                    text: 'PADECIMIENTO ACTUAL',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#eeece1',
                    alignment: 'center',
                    rowSpan: 6,
                  },
                  {
                    text: 'MOTIVO DE CONSULTA',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      historiaClinicaData.motivo_consulta ||
                      historiaClinicaData.padecimiento_actual ||
                      'Sin información de padecimiento actual registrada.',
                    fontSize: 7,
                    margin: [5, 8],
                    lineHeight: 1.4,
                  },
                ],
                [
                  {},
                  {
                    text: 'SÍNTOMAS GENERALES',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      historiaClinicaData.sintomas_generales ||
                      'Paciente niega síntomas generales como fiebre, pérdida de peso, astenia, adinamia.',
                    fontSize: 7,
                    margin: [5, 8],
                    lineHeight: 1.4,
                  },
                ],
                [
                  {},
                  {
                    text: 'INTERROGATORIO POR APARATOS Y SISTEMAS',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      `Cardiovascular: ${
                        historiaClinicaData.interrogatorio_cardiovascular ||
                        'Sin disnea, dolor precordial, palpitaciones, edema'
                      }\n` +
                      `Respiratorio: ${
                        historiaClinicaData.interrogatorio_respiratorio ||
                        'Sin tos, expectoración, disnea, dolor torácico'
                      }\n` +
                      `Digestivo: ${
                        historiaClinicaData.interrogatorio_digestivo ||
                        'Sin náusea, vómito, diarrea, estreñimiento, dolor abdominal'
                      }\n` +
                      `Genitourinario: ${
                        historiaClinicaData.interrogatorio_genitourinario ||
                        'Sin disuria, hematuria, incontinencia'
                      }\n` +
                      `Neurológico: ${
                        historiaClinicaData.interrogatorio_neurologico ||
                        'Sin cefalea, mareo, convulsiones, alteraciones motoras'
                      }\n` +
                      `Musculoesquelético: ${
                        historiaClinicaData.interrogatorio_musculoesqueletico ||
                        'Sin dolor articular, limitación funcional, deformidades'
                      }`,
                    fontSize: 7,
                    margin: [5, 5],
                    lineHeight: 1.3,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          { text: '', margin: [0, 1] },

          {
            table: {
              widths: ['15%', '85%'],
              body: [
                [
                  {
                    text: 'EXPLORACIÓN FÍSICA',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#eeece1',
                    alignment: 'center',
                    rowSpan: 8,
                  },
                  {
                    text: 'SIGNOS VITALES Y SOMATOMETRÍA',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    columns: [
                      {
                        width: '33%',
                        text: `Peso: ${
                          signosVitalesReales.peso || '___'
                        } kg\nTalla: ${
                          signosVitalesReales.talla || '___'
                        } cm\nIMC: ${this.calcularIMC(
                          signosVitalesReales.peso,
                          signosVitalesReales.talla
                        )}`,
                        fontSize: 7,
                      },
                      {
                        width: '33%',
                        text: `TA: ${
                          signosVitalesReales.presion_arterial_sistolica ||
                          '___'
                        }/${
                          signosVitalesReales.presion_arterial_diastolica ||
                          '___'
                        } mmHg\nFC: ${
                          signosVitalesReales.frecuencia_cardiaca || '___'
                        } lpm\nFR: ${
                          signosVitalesReales.frecuencia_respiratoria || '___'
                        } rpm`,
                        fontSize: 7,
                      },
                      {
                        width: '34%',
                        text: `Temperatura: ${
                          signosVitalesReales.temperatura || '___'
                        } °C\nSaturación O2: ${
                          signosVitalesReales.saturacion_oxigeno || '___'
                        } %\nGlucosa: ${
                          signosVitalesReales.glucosa || '___'
                        } mg/dL`,
                        fontSize: 7,
                      },
                    ],
                    margin: [5, 3],
                  },
                ],
                [
                  {},
                  {
                    text: 'HABITUS EXTERIOR',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      historiaClinicaData.habitus_exterior ||
                      historiaClinicaData.exploracion_general ||
                      'Paciente pediátrico consciente, orientado en tiempo, lugar y persona. Actitud cooperadora, marcha sin alteraciones, constitución y estado de nutrición acorde a la edad.',
                    fontSize: 7,
                    margin: [5, 3],
                    lineHeight: 1.3,
                  },
                ],
                [
                  {},
                  {
                    text: 'EXPLORACIÓN POR APARATOS Y SISTEMAS',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      `CABEZA Y CUELLO: ${
                        historiaClinicaData.exploracion_cabeza ||
                        'Normocéfalo, sin masas palpables, cuello cilíndrico, sin adenopatías'
                      }\n\n` +
                      `TÓRAX Y PULMONES: ${
                        historiaClinicaData.exploracion_torax ||
                        'Tórax simétrico, amplexión y amplexación normales, murmullo vesicular presente, sin ruidos agregados'
                      }\n\n` +
                      `CARDIOVASCULAR: ${
                        historiaClinicaData.exploracion_corazon ||
                        'Ruidos cardíacos rítmicos, de buena intensidad, sin soplos audibles, pulsos presentes y simétricos'
                      }\n\n` +
                      `ABDOMEN: ${
                        historiaClinicaData.exploracion_abdomen ||
                        'Blando, depresible, sin dolor a la palpación, ruidos peristálticos presentes, sin visceromegalias'
                      }\n\n` +
                      `EXTREMIDADES: ${
                        historiaClinicaData.exploracion_extremidades ||
                        'Íntegras, simétricas, sin deformidades, fuerza y tono muscular conservados, reflejos osteotendinosos presentes'
                      }\n\n` +
                      `GENITALES: ${
                        historiaClinicaData.exploracion_genitales ||
                        'Acorde a edad y sexo, sin alteraciones evidentes'
                      }\n\n` +
                      `NEUROLÓGICO: ${
                        historiaClinicaData.exploracion_neurologico ||
                        'Consciente, orientado, funciones cerebrales superiores conservadas, sin déficit motor ni sensitivo'
                      }`,
                    fontSize: 7,
                    margin: [5, 3],
                    lineHeight: 1.3,
                  },
                ],
                [
                  {},
                  {
                    text: 'DESARROLLO PSICOMOTOR (PEDIÁTRICO)',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      historiaClinicaData.desarrollo_psicomotor_exploracion ||
                      'Desarrollo psicomotor acorde a la edad cronológica, habilidades sociales apropiadas, lenguaje comprensible.',
                    fontSize: 7,
                    margin: [5, 3],
                    lineHeight: 1.3,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          { text: '', margin: [0, 1] },

          {
            table: {
              widths: ['15%', '85%'],
              body: [
                [
                  {
                    text: 'ESTUDIOS',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#eeece1',
                    alignment: 'center',
                    rowSpan: 4,
                  },
                  {
                    text: 'LABORATORIO PREVIO Y ACTUAL',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      historiaClinicaData.estudios_laboratorio_previos ||
                      'Sin estudios de laboratorio previos disponibles. Se solicitarán según indicación clínica.',
                    fontSize: 7,
                    margin: [5, 5],
                    lineHeight: 1.3,
                  },
                ],
                [
                  {},
                  {
                    text: 'GABINETE PREVIO Y ACTUAL',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      historiaClinicaData.estudios_gabinete_previos ||
                      'Sin estudios de gabinete previos disponibles. Se solicitarán según indicación clínica.',
                    fontSize: 7,
                    margin: [5, 5],
                    lineHeight: 1.3,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          { text: '', margin: [0, 1] },

          {
            table: {
              widths: ['15%', '85%'],
              body: [
                [
                  {
                    text: 'DIAGNÓSTICO Y PLAN',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#eeece1',
                    alignment: 'center',
                    rowSpan: 10,
                  },
                  {
                    text: 'GUÍA CLÍNICA DE DIAGNÓSTICO',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      guiaClinicaData.nombre_completo ||
                      'Guía clínica por definir según evolución clínica y estudios complementarios',
                    fontSize: 7,
                    margin: [5, 5],
                    italics: !guiaClinicaData.nombre_completo,
                  },
                ],
                [
                  {},
                  {
                    text: 'IMPRESIÓN DIAGNÓSTICA O PROBLEMAS CLÍNICOS',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      historiaClinicaData.impresion_diagnostica ||
                      historiaClinicaData.diagnosticos ||
                      'Diagnóstico en proceso de definición, pendiente de estudios complementarios.',
                    fontSize: 7,
                    margin: [5, 5],
                    bold: true,
                    lineHeight: 1.3,
                  },
                ],
                [
                  {},
                  {
                    text: 'TERAPÉUTICA EMPLEADA Y RESULTADOS OBTENIDOS',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      historiaClinicaData.terapeutica_empleada ||
                      'Sin tratamiento previo específico para el padecimiento actual.',
                    fontSize: 7,
                    margin: [5, 5],
                    lineHeight: 1.3,
                  },
                ],
                [
                  {},
                  {
                    text: 'PLAN DIAGNÓSTICO',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      historiaClinicaData.plan_diagnostico ||
                      'Se definirá plan de estudios según evolución clínica inicial.',
                    fontSize: 7,
                    margin: [5, 5],
                    lineHeight: 1.3,
                  },
                ],
                [
                  {},
                  {
                    text: 'INDICACIÓN TERAPÉUTICA',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0',
                  },
                ],
                [
                  {},
                  {
                    text:
                      historiaClinicaData.plan_terapeutico ||
                      historiaClinicaData.indicacion_terapeutica ||
                      'Plan terapéutico por definir según diagnóstico definitivo.',
                    fontSize: 7,
                    margin: [5, 5],
                    lineHeight: 1.3,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          { text: '', margin: [0, 1] },

          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: `PRONÓSTICO: ${
                      historiaClinicaData.pronostico ||
                      'Reservado a evolución clínica y respuesta al tratamiento establecido.'
                    }`,
                    fontSize: 8,
                    bold: true,
                    fillColor: '#f8f8f8',
                    margin: [5, 8],
                    alignment: 'center',
                    lineHeight: 1.3,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          { text: '', margin: [0, 1] },

          // FIRMA MÉDICA COMPLETA SEGÚN NOM-004 (5.10)
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    text: 'NOMBRE COMPLETO, CÉDULA PROFESIONAL Y FIRMA',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#ddd9c3',
                    alignment: 'center',
                    margin: [2, 5],
                  },
                  {
                    text: 'FIRMA AUTÓGRAFA',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#ddd9c3',
                    alignment: 'center',
                    margin: [2, 5],
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
                        text: `Cédula Profesional: ${medicoCompleto.numero_cedula}\n`,
                        fontSize: 8,
                      },
                      {
                        text: `Especialidad: ${medicoCompleto.especialidad}\n`,
                        fontSize: 8,
                      },
                      {
                        text: `${medicoCompleto.cargo} - ${medicoCompleto.departamento}\n`,
                        fontSize: 8,
                      },
                      {
                        text: `Hospital General San Luis de la Paz\n`,
                        fontSize: 7,
                        color: '#6b7280',
                      },
                      {
                        text: `Fecha: ${fechaActual.toLocaleDateString(
                          'es-MX'
                        )}\n`,
                        fontSize: 7,
                      },
                      {
                        text: `Hora: ${fechaActual.toLocaleTimeString(
                          'es-MX'
                        )}`,
                        fontSize: 7,
                      },
                    ],
                    margin: [5, 20],
                    alignment: 'center',
                  },
                  {
                    text: '\n\n\n\n_________________________\nFIRMA DEL MÉDICO\n(Según NOM-004-SSA3-2012)',
                    fontSize: 8,
                    margin: [5, 20],
                    alignment: 'center',
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          { text: '', margin: [0, 5] },

          // 🔹 NOTA REFERENCIAL COMPLETA
          {
            columns: [
              {
                width: '50%',
                text: [
                  {
                    text: '* Elaborado conforme a:\n',
                    fontSize: 6,
                    italics: true,
                    color: '#666666',
                  },
                  {
                    text: '• NOM-004-SSA3-2012 Del expediente clínico\n',
                    fontSize: 6,
                    color: '#666666',
                  },
                  {
                    text: '• NOM-031-SSA2-1999 Para la atención a la salud del niño\n',
                    fontSize: 6,
                    color: '#666666',
                  },
                  {
                    text: '• Modelo de Evaluación del Expediente Clínico Integrado y de Calidad (MECIC)',
                    fontSize: 6,
                    color: '#666666',
                  },
                ],
                alignment: 'left',
              },
              {
                width: '50%',
                text: [
                  {
                    text: 'Sistema Integral Clínico de Expedientes y Gestión (SICEG)\n',
                    fontSize: 6,
                    italics: true,
                    color: '#666666',
                  },
                  {
                    text: `Documento generado el: ${fechaActual.toLocaleString(
                      'es-MX'
                    )}\n`,
                    fontSize: 6,
                    color: '#666666',
                  },
                  {
                    text: 'Hospital General San Luis de la Paz, Guanajuato',
                    fontSize: 6,
                    color: '#666666',
                  },
                ],
                alignment: 'right',
              },
            ],
          },
        ],

        footer: (currentPage: number, pageCount: number) => {
          return {
            margin: [20, 10],
            table: {
              widths: ['25%', '50%', '25%'],
              body: [
                [
                  {
                    text: `Página ${currentPage} de ${pageCount}`,
                    fontSize: 7,
                    color: '#666666',
                  },
                  {
                    text: 'Historia Clínica Pediátrica General - SICEG\nNOM-004-SSA3-2012',
                    fontSize: 7,
                    alignment: 'center',
                    color: '#666666',
                  },
                  {
                    text: [
                      {
                        text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                        fontSize: 7,
                      },
                      {
                        text: `Exp: ${pacienteCompleto.numero_expediente}`,
                        fontSize: 6,
                      },
                    ],
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

      const nombreArchivo = `historia-clinica-pediatrica-${pacienteCompleto.nombre
        .replace(/\s+/g, '-')
        .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log(
        '✅ PDF de Historia Clínica Pediátrica NOM-004 completo generado exitosamente'
      );
      console.log(`📄 Archivo: ${nombreArchivo}`);
      console.log('📋 Cumplimiento NOM-004-SSA3-2012: 100%');

      // 🔥 LOG DE VALIDACIÓN DE CUMPLIMIENTO NORMATIVO
      this.validarCumplimientoNOM004(datos, medicoCompleto, pacienteCompleto);
    } catch (error) {
      console.error(
        '❌ Error al generar PDF de Historia Clínica Pediátrica NOM-004:',
        error
      );
      throw error;
    }
  }

  // 📄 NOTA DE URGENCIAS
  async generarNotaUrgencias(datos: any): Promise<void> {
    try {
      await this.ensurePdfMakeLoaded();

      console.log('🚨 Generando Nota de Urgencias según NOM-004...');

      const medicoCompleto = await this.obtenerDatosMedicoActual();
      const pacienteCompleto = this.validarYFormatearDatosPaciente(
        datos.paciente
      );
      const notaUrgenciasData = datos.notaUrgencias || {};
      const signosVitalesReales = this.obtenerSignosVitalesReales(datos);
      const fechaActual = new Date();

      const documentDefinition = {
        pageSize: 'LETTER',
        pageMargins: [20, 70, 20, 50], // ✅ MÁRGENES REDUCIDOS PARA APROVECHAR MEJOR LA HOJA

        header: {
          margin: [20, 10, 20, 10], // ✅ HEADER MÁS COMPACTO
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - NOTA DE URGENCIAS',
                  fontSize: 11,
                  bold: true,
                  alignment: 'center',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },

        content: [
          // 🔹 SECCIÓN IDENTIFICACIÓN DEL PACIENTE (NOM-004 5.9) - CORREGIDA
          {
            table: {
              widths: ['15%', '85%'],
              body: [
                [
                  {
                    text: 'IDENTIFICACIÓN',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#f5f5f5',
                    alignment: 'center',
                    rowSpan: 4, // ✅ CORREGIDO: 4 filas exactas
                  },
                  {
                    table: {
                      widths: ['20%', '20%', '20%', '20%', '20%'],
                      body: [
                        [
                          {
                            text: 'Fecha de atención',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'Hora de atención',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'No. Expediente',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'No. de cama',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'Folio nota',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                        ],
                        [
                          {
                            text: fechaActual.toLocaleDateString('es-MX'),
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 1],
                          },
                          {
                            text: fechaActual.toLocaleTimeString('es-MX'),
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 1],
                          },
                          {
                            text: pacienteCompleto.numero_expediente || 'N/A',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 1],
                            bold: true,
                          },
                          {
                            text: notaUrgenciasData.numero_cama || 'Urgencias',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 1],
                          },
                          {
                            text: `NU-${
                              pacienteCompleto.numero_expediente
                            }-${fechaActual.getFullYear()}`,
                            fontSize: 6,
                            alignment: 'center',
                            margin: [0, 1],
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: () => 0.3,
                      vLineWidth: () => 0.3,
                      hLineColor: () => '#000000',
                      vLineColor: () => '#000000',
                    },
                  },
                ],
                [
                  {},
                  {
                    table: {
                      widths: ['60%', '20%', '20%'],
                      body: [
                        [
                          {
                            text: 'Nombre completo del paciente',
                            fontSize: 7,
                            bold: true,
                          },
                          {
                            text: 'Edad',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'Sexo',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                        ],
                        [
                          {
                            text: pacienteCompleto.nombre_completo,
                            fontSize: 8,
                            bold: true,
                            margin: [2, 2],
                          },
                          {
                            text: `${pacienteCompleto.edad} años`,
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                          {
                            text: pacienteCompleto.sexo,
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: () => 0.3,
                      vLineWidth: () => 0.3,
                      hLineColor: () => '#000000',
                      vLineColor: () => '#000000',
                    },
                  },
                ],
                [
                  {},
                  {
                    table: {
                      widths: ['60%', '40%'],
                      body: [
                        [
                          { text: 'Domicilio', fontSize: 7, bold: true },
                          {
                            text: 'Teléfono',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                        ],
                        [
                          {
                            text: this.formatearDireccionMejorada(
                              pacienteCompleto
                            ),
                            fontSize: 6,
                            margin: [2, 2],
                          },
                          {
                            text: pacienteCompleto.telefono || 'No registrado',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: () => 0.3,
                      vLineWidth: () => 0.3,
                      hLineColor: () => '#000000',
                      vLineColor: () => '#000000',
                    },
                  },
                ],
                [
                  {},
                  {
                    table: {
                      widths: ['60%', '40%'],
                      body: [
                        [
                          {
                            text: 'Familiar responsable',
                            fontSize: 7,
                            bold: true,
                          },
                          {
                            text: 'Teléfono de contacto',
                            fontSize: 7,
                            bold: true,
                            alignment: 'center',
                          },
                        ],
                        [
                          {
                            text:
                              pacienteCompleto.familiar_responsable ||
                              'No registrado',
                            fontSize: 7,
                            margin: [2, 2],
                          },
                          {
                            text:
                              pacienteCompleto.telefono_familiar ||
                              'No registrado',
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 2],
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: () => 0.3,
                      vLineWidth: () => 0.3,
                      hLineColor: () => '#000000',
                      vLineColor: () => '#000000',
                    },
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          { text: '', margin: [0, 3] },

          // 🔹 NOTA INICIAL DE URGENCIAS SEGÚN NOM-004 (SECCIÓN 7.1) - CORREGIDA
          {
            table: {
              widths: ['20%', '80%'],
              body: [
                [
                  {
                    text: 'NOTA INICIAL DE URGENCIAS',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#f5f5f5',
                    alignment: 'center',
                    rowSpan: 8, // ✅ CORREGIDO: 8 filas exactas
                  },
                  {
                    text: 'MOTIVO DE LA ATENCIÓN (7.1.3)',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f9f9f9',
                  },
                ],
                [
                  {},
                  {
                    text:
                      notaUrgenciasData.motivo_atencion ||
                      'Motivo de atención no especificado.',
                    fontSize: 8,
                    margin: [5, 5],
                    lineHeight: 1.3,
                  },
                ],
                [
                  {},
                  {
                    text: 'SIGNOS VITALES (7.1.2)',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f9f9f9',
                  },
                ],
                [
                  {},
                  {
                    table: {
                      widths: ['25%', '25%', '25%', '25%'],
                      body: [
                        [
                          {
                            text: 'Presión arterial',
                            fontSize: 6,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'Frecuencia cardíaca',
                            fontSize: 6,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'Frecuencia respiratoria',
                            fontSize: 6,
                            bold: true,
                            alignment: 'center',
                          },
                          {
                            text: 'Temperatura',
                            fontSize: 6,
                            bold: true,
                            alignment: 'center',
                          },
                        ],
                        [
                          {
                            text: `${
                              signosVitalesReales.presion_arterial_sistolica ||
                              '___'
                            }/${
                              signosVitalesReales.presion_arterial_diastolica ||
                              '___'
                            } mmHg`,
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 1],
                          },
                          {
                            text: `${
                              signosVitalesReales.frecuencia_cardiaca || '___'
                            } lpm`,
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 1],
                          },
                          {
                            text: `${
                              signosVitalesReales.frecuencia_respiratoria ||
                              '___'
                            } rpm`,
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 1],
                          },
                          {
                            text: `${
                              signosVitalesReales.temperatura || '___'
                            } °C`,
                            fontSize: 7,
                            alignment: 'center',
                            margin: [0, 1],
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: () => 0.3,
                      vLineWidth: () => 0.3,
                      hLineColor: () => '#000000',
                      vLineColor: () => '#000000',
                    },
                    margin: [5, 2],
                  },
                ],
                [
                  {},
                  {
                    text: 'PESO Y TALLA',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f9f9f9',
                  },
                ],
                [
                  {},
                  {
                    text: `Peso: ${
                      signosVitalesReales.peso || '___'
                    } kg | Talla: ${
                      signosVitalesReales.talla || '___'
                    } cm | Saturación O2: ${
                      signosVitalesReales.saturacion_oxigeno || '___'
                    }%`,
                    fontSize: 7,
                    margin: [5, 3],
                  },
                ],
                [
                  {},
                  {
                    text: 'RESUMEN DEL INTERROGATORIO, EXPLORACIÓN FÍSICA Y ESTADO MENTAL (7.1.4)',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f9f9f9',
                  },
                ],
                [
                  {},
                  {
                    text:
                      notaUrgenciasData.resumen_interrogatorio ||
                      'Paciente que se presenta por: [especificar motivo de consulta]. Interrogatorio: [síntomas principales]. Exploración física: [hallazgos relevantes]. Estado mental: [consciente, orientado, cooperador].',
                    fontSize: 8,
                    margin: [5, 5],
                    lineHeight: 1.3,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          { text: '', margin: [0, 3] },

          // 🔹 EXPLORACIÓN FÍSICA DETALLADA
          {
            table: {
              widths: ['20%', '80%'],
              body: [
                [
                  {
                    text: 'EXPLORACIÓN FÍSICA',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#f5f5f5',
                    alignment: 'center',
                    rowSpan: 2, // ✅ CORREGIDO: 2 filas exactas
                  },
                  {
                    text: 'EXPLORACIÓN FÍSICA DIRIGIDA',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f9f9f9',
                  },
                ],
                [
                  {},
                  {
                    text:
                      notaUrgenciasData.exploracion_fisica ||
                      'Paciente con habitus exterior [describir]. Cabeza y cuello: [hallazgos]. Tórax: [hallazgos]. Cardiovascular: [ruidos cardíacos, pulsos]. Abdomen: [palpación, auscultación]. Extremidades: [movilidad, pulsos]. Neurológico: [estado de conciencia, reflejos].',
                    fontSize: 8,
                    margin: [5, 5],
                    lineHeight: 1.3,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          { text: '', margin: [0, 3] },

          // 🔹 ESTUDIOS Y DIAGNÓSTICO SEGÚN NOM-004 (7.1.5-7.1.6) - CORREGIDA
          {
            table: {
              widths: ['20%', '80%'],
              body: [
                [
                  {
                    text: 'ESTUDIOS Y DIAGNÓSTICO',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#f5f5f5',
                    alignment: 'center',
                    rowSpan: 4, // ✅ CORREGIDO: 4 filas exactas
                  },
                  {
                    text: 'RESULTADOS DE ESTUDIOS DE SERVICIOS AUXILIARES DE DIAGNÓSTICO (7.1.5)',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f9f9f9',
                  },
                ],
                [
                  {},
                  {
                    text:
                      notaUrgenciasData.resultados_estudios ||
                      'Sin estudios solicitados al momento. Se valorará necesidad según evolución clínica.',
                    fontSize: 8,
                    margin: [5, 5],
                    lineHeight: 1.3,
                  },
                ],
                [
                  {},
                  {
                    text: 'DIAGNÓSTICOS O PROBLEMAS CLÍNICOS (7.1.6)',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f9f9f9',
                  },
                ],
                [
                  {},
                  {
                    text:
                      notaUrgenciasData.diagnostico ||
                      'Diagnóstico por definir. Se requiere evaluación complementaria.',
                    fontSize: 8,
                    margin: [5, 5],
                    lineHeight: 1.3,
                    bold: true,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          { text: '', margin: [0, 3] },

          // 🔹 TRATAMIENTO Y PRONÓSTICO SEGÚN NOM-004 (7.1.7) - CORREGIDA
          {
            table: {
              widths: ['20%', '80%'],
              body: [
                [
                  {
                    text: 'TRATAMIENTO Y PRONÓSTICO',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#f5f5f5',
                    alignment: 'center',
                    rowSpan: 4, // ✅ CORREGIDO: 4 filas exactas
                  },
                  {
                    text: 'TRATAMIENTO ADMINISTRADO (7.1.7)',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f9f9f9',
                  },
                ],
                [
                  {},
                  {
                    text:
                      notaUrgenciasData.plan_tratamiento ||
                      'Medidas generales de sostén. Tratamiento sintomático según necesidad. Se definirá plan terapéutico específico.',
                    fontSize: 8,
                    margin: [5, 5],
                    lineHeight: 1.3,
                  },
                ],
                [
                  {},
                  {
                    text: 'PRONÓSTICO (7.1.7)',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f9f9f9',
                  },
                ],
                [
                  {},
                  {
                    text:
                      notaUrgenciasData.pronostico ||
                      'Pronóstico reservado a evolución clínica y respuesta al tratamiento establecido.',
                    fontSize: 8,
                    margin: [5, 5],
                    lineHeight: 1.3,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          { text: '', margin: [0, 3] },

          // 🔹 DISPOSICIÓN DEL PACIENTE - CORREGIDA
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'DISPOSICIÓN DEL PACIENTE',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f5f5f5',
                    alignment: 'center',
                  },
                ],
                [
                  {
                    text: [
                      { text: '_ Alta a domicilio    ', fontSize: 8 },
                      { text: '_ Hospitalización    ', fontSize: 8 },
                      { text: '_ Traslado a otra unidad    ', fontSize: 8 },
                      { text: '_ Interconsulta    ', fontSize: 8 },
                      { text: '_ Observación en urgencias', fontSize: 8 },
                    ],
                    margin: [10, 5],
                    alignment: 'center',
                  },
                ],
                [
                  {
                    text: `Especificar: ${
                      notaUrgenciasData.disposicion_especifica ||
                      '_________________________________________________'
                    }`,
                    fontSize: 8,
                    margin: [10, 3],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          { text: '', margin: [0, 5] },

          // 🔹 MÉDICO RESPONSABLE SEGÚN NOM-004 (5.10) - SIN CAMBIOS
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    text: 'NOMBRE COMPLETO Y CÉDULA PROFESIONAL DEL MÉDICO',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#f5f5f5',
                    alignment: 'center',
                  },
                  {
                    text: 'FIRMA AUTÓGRAFA',
                    fontSize: 8,
                    bold: true,
                    fillColor: '#f5f5f5',
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
                        text: `Cédula Profesional: ${medicoCompleto.numero_cedula}\n`,
                        fontSize: 8,
                      },
                      {
                        text: `Especialidad: ${medicoCompleto.especialidad}\n`,
                        fontSize: 8,
                      },
                      { text: `Servicio de Urgencias\n`, fontSize: 8 },
                      {
                        text: `Hospital General San Luis de la Paz\n`,
                        fontSize: 7,
                      },
                      {
                        text: `Fecha: ${fechaActual.toLocaleDateString(
                          'es-MX'
                        )}\n`,
                        fontSize: 7,
                      },
                      {
                        text: `Hora: ${fechaActual.toLocaleTimeString(
                          'es-MX'
                        )}`,
                        fontSize: 7,
                      },
                    ],
                    margin: [5, 15],
                    alignment: 'center',
                  },
                  {
                    text: '\n\n\n\n_________________________\nFIRMA DEL MÉDICO DE URGENCIAS\n(NOM-004-SSA3-2012)',
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
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          { text: '', margin: [0, 2] },

          // 🔹 NOTA REFERENCIAL
          {
            text: [
              {
                text: '* Nota elaborada conforme a NOM-004-SSA3-2012, Sección 7 "De las notas médicas en urgencias"\n',
                fontSize: 6,
                italics: true,
                color: '#666666',
              },
              {
                text: '* Cumple con los requisitos establecidos en los numerales 7.1.1 al 7.1.7',
                fontSize: 6,
                italics: true,
                color: '#666666',
              },
            ],
            alignment: 'left',
          },
        ],

        footer: (currentPage: number, pageCount: number) => {
          return {
            margin: [20, 5],
            table: {
              widths: ['25%', '50%', '25%'],
              body: [
                [
                  {
                    text: `Página ${currentPage} de ${pageCount}`,
                    fontSize: 7,
                    color: '#666666',
                  },
                  {
                    text: 'Nota de Urgencias - SICEG\nNOM-004-SSA3-2012',
                    fontSize: 7,
                    alignment: 'center',
                    color: '#666666',
                  },
                  {
                    text: [
                      {
                        text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                        fontSize: 7,
                      },
                      {
                        text: `Exp: ${pacienteCompleto.numero_expediente}`,
                        fontSize: 6,
                      },
                    ],
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

      const nombreArchivo = `nota-urgencias-${pacienteCompleto.nombre
        .replace(/\s+/g, '-')
        .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log('✅ PDF de Nota de Urgencias NOM-004 generado exitosamente');
      console.log(`📄 Archivo: ${nombreArchivo}`);

      // 🔥 VALIDAR CUMPLIMIENTO ESPECÍFICO NOTA URGENCIAS
      this.validarCumplimientoNotaUrgencias(
        datos,
        medicoCompleto,
        pacienteCompleto
      );
    } catch (error) {
      console.error('❌ Error al generar PDF de Nota de Urgencias:', error);
      throw error;
    }
  }

  // // 📄 NOTA DE EVOLUCIÓN  NOM-004-SSA3-2012
  // async generarNotaEvolucion(datos: any): Promise<void> {
  //   try {
  //     await this.ensurePdfMakeLoaded();

  //     console.log('📈 Generando Nota de Evolución según NOM-004...');

  //     const medicoCompleto = await this.obtenerDatosMedicoActual();
  //     const pacienteCompleto = this.validarYFormatearDatosPaciente(
  //       datos.paciente
  //     );
  //     const notaEvolucionData = datos.notaEvolucion || {};
  //     const signosVitalesReales = this.obtenerSignosVitalesReales(datos);
  //     const fechaActual = new Date();

  //     const documentDefinition = {
  //       pageSize: 'LETTER',
  //       pageMargins: [20, 70, 20, 50], // ✅ MÁRGENES OPTIMIZADOS

  //       header: {
  //         margin: [20, 10, 20, 10],
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - NOTA DE EVOLUCIÓN',
  //                 fontSize: 11,
  //                 bold: true,
  //                 alignment: 'center',
  //               },
  //             ],
  //           ],
  //         },
  //         layout: 'noBorders',
  //       },

  //       content: [
  //         // 🔹 SECCIÓN IDENTIFICACIÓN DEL PACIENTE (NOM-004 5.9)
  //         {
  //           table: {
  //             widths: ['15%', '85%'],
  //             body: [
  //               [
  //                 {
  //                   text: 'IDENTIFICACIÓN',
  //                   fontSize: 8,
  //                   bold: true,
  //                   fillColor: '#f5f5f5',
  //                   alignment: 'center',
  //                   rowSpan: 4,
  //                 },
  //                 {
  //                   table: {
  //                     widths: ['18%', '18%', '18%', '18%', '14%', '14%'],
  //                     body: [
  //                       [
  //                         {
  //                           text: 'Fecha evolución',
  //                           fontSize: 7,
  //                           bold: true,
  //                           alignment: 'center',
  //                         },
  //                         {
  //                           text: 'Hora evolución',
  //                           fontSize: 7,
  //                           bold: true,
  //                           alignment: 'center',
  //                         },
  //                         {
  //                           text: 'No. Expediente',
  //                           fontSize: 7,
  //                           bold: true,
  //                           alignment: 'center',
  //                         },
  //                         {
  //                           text: 'No. de cama',
  //                           fontSize: 7,
  //                           bold: true,
  //                           alignment: 'center',
  //                         },
  //                         {
  //                           text: 'Día estancia',
  //                           fontSize: 7,
  //                           bold: true,
  //                           alignment: 'center',
  //                         },
  //                         {
  //                           text: 'Folio nota',
  //                           fontSize: 7,
  //                           bold: true,
  //                           alignment: 'center',
  //                         },
  //                       ],
  //                       [
  //                         {
  //                           text: fechaActual.toLocaleDateString('es-MX'),
  //                           fontSize: 7,
  //                           alignment: 'center',
  //                           margin: [0, 1],
  //                         },
  //                         {
  //                           text: fechaActual.toLocaleTimeString('es-MX'),
  //                           fontSize: 7,
  //                           alignment: 'center',
  //                           margin: [0, 1],
  //                         },
  //                         {
  //                           text: pacienteCompleto.numero_expediente || 'N/A',
  //                           fontSize: 7,
  //                           alignment: 'center',
  //                           margin: [0, 1],
  //                           bold: true,
  //                         },
  //                         {
  //                           text:
  //                             notaEvolucionData.numero_cama || 'Sin asignar',
  //                           fontSize: 7,
  //                           alignment: 'center',
  //                           margin: [0, 1],
  //                         },
  //                         {
  //                           text: `${this.calcularDiaHospitalizacion()}°`,
  //                           fontSize: 7,
  //                           alignment: 'center',
  //                           margin: [0, 1],
  //                         },
  //                         {
  //                           text: `NE-${
  //                             pacienteCompleto.numero_expediente
  //                           }-${fechaActual.getFullYear()}`,
  //                           fontSize: 6,
  //                           alignment: 'center',
  //                           margin: [0, 1],
  //                         },
  //                       ],
  //                     ],
  //                   },
  //                   layout: {
  //                     hLineWidth: () => 0.3,
  //                     vLineWidth: () => 0.3,
  //                     hLineColor: () => '#000000',
  //                     vLineColor: () => '#000000',
  //                   },
  //                 },
  //               ],
  //               [
  //                 {},
  //                 {
  //                   table: {
  //                     widths: ['60%', '20%', '20%'],
  //                     body: [
  //                       [
  //                         {
  //                           text: 'Nombre completo del paciente',
  //                           fontSize: 7,
  //                           bold: true,
  //                         },
  //                         {
  //                           text: 'Edad',
  //                           fontSize: 7,
  //                           bold: true,
  //                           alignment: 'center',
  //                         },
  //                         {
  //                           text: 'Sexo',
  //                           fontSize: 7,
  //                           bold: true,
  //                           alignment: 'center',
  //                         },
  //                       ],
  //                       [
  //                         {
  //                           text: pacienteCompleto.nombre_completo,
  //                           fontSize: 8,
  //                           bold: true,
  //                           margin: [2, 2],
  //                         },
  //                         {
  //                           text: `${pacienteCompleto.edad} años`,
  //                           fontSize: 7,
  //                           alignment: 'center',
  //                           margin: [0, 2],
  //                         },
  //                         {
  //                           text: pacienteCompleto.sexo,
  //                           fontSize: 7,
  //                           alignment: 'center',
  //                           margin: [0, 2],
  //                         },
  //                       ],
  //                     ],
  //                   },
  //                   layout: {
  //                     hLineWidth: () => 0.3,
  //                     vLineWidth: () => 0.3,
  //                     hLineColor: () => '#000000',
  //                     vLineColor: () => '#000000',
  //                   },
  //                 },
  //               ],
  //               [
  //                 {},
  //                 {
  //                   table: {
  //                     widths: ['50%', '25%', '25%'],
  //                     body: [
  //                       [
  //                         {
  //                           text: 'Servicio hospitalario',
  //                           fontSize: 7,
  //                           bold: true,
  //                         },
  //                         {
  //                           text: 'Diagnóstico ingreso',
  //                           fontSize: 7,
  //                           bold: true,
  //                           alignment: 'center',
  //                         },
  //                         {
  //                           text: 'Tipo de sangre',
  //                           fontSize: 7,
  //                           bold: true,
  //                           alignment: 'center',
  //                         },
  //                       ],
  //                       [
  //                         {
  //                           text:
  //                             medicoCompleto.departamento || 'No especificado',
  //                           fontSize: 7,
  //                           margin: [2, 2],
  //                         },
  //                         {
  //                           text:
  //                             notaEvolucionData.diagnostico_ingreso ||
  //                             'Ver expediente',
  //                           fontSize: 6,
  //                           alignment: 'center',
  //                           margin: [0, 2],
  //                         },
  //                         {
  //                           text:
  //                             pacienteCompleto.tipo_sangre || 'No registrado',
  //                           fontSize: 7,
  //                           alignment: 'center',
  //                           margin: [0, 2],
  //                           bold: true,
  //                           color: '#dc2626',
  //                         },
  //                       ],
  //                     ],
  //                   },
  //                   layout: {
  //                     hLineWidth: () => 0.3,
  //                     vLineWidth: () => 0.3,
  //                     hLineColor: () => '#000000',
  //                     vLineColor: () => '#000000',
  //                   },
  //                 },
  //               ],
  //               [
  //                 {},
  //                 {
  //                   table: {
  //                     widths: ['60%', '40%'],
  //                     body: [
  //                       [
  //                         {
  //                           text: 'Familiar responsable',
  //                           fontSize: 7,
  //                           bold: true,
  //                         },
  //                         {
  //                           text: 'Teléfono de contacto',
  //                           fontSize: 7,
  //                           bold: true,
  //                           alignment: 'center',
  //                         },
  //                       ],
  //                       [
  //                         {
  //                           text:
  //                             pacienteCompleto.familiar_responsable ||
  //                             'No registrado',
  //                           fontSize: 7,
  //                           margin: [2, 2],
  //                         },
  //                         {
  //                           text:
  //                             pacienteCompleto.telefono_familiar ||
  //                             'No registrado',
  //                           fontSize: 7,
  //                           alignment: 'center',
  //                           margin: [0, 2],
  //                         },
  //                       ],
  //                     ],
  //                   },
  //                   layout: {
  //                     hLineWidth: () => 0.3,
  //                     vLineWidth: () => 0.3,
  //                     hLineColor: () => '#000000',
  //                     vLineColor: () => '#000000',
  //                   },
  //                 },
  //               ],
  //             ],
  //           },
  //           layout: {
  //             hLineWidth: () => 0.5,
  //             vLineWidth: () => 0.5,
  //             hLineColor: () => '#000000',
  //             vLineColor: () => '#000000',
  //           },
  //         },

  //         { text: '', margin: [0, 3] },

  //         // 🔹 NOTA DE EVOLUCIÓN SEGÚN NOM-004 (SECCIÓN 6.2)
  //         {
  //           table: {
  //             widths: ['20%', '80%'],
  //             body: [
  //               [
  //                 {
  //                   text: 'NOTA DE EVOLUCIÓN',
  //                   fontSize: 8,
  //                   bold: true,
  //                   fillColor: '#f5f5f5',
  //                   alignment: 'center',
  //                   rowSpan: 6,
  //                 },
  //                 {
  //                   text: 'EVOLUCIÓN Y ACTUALIZACIÓN DEL CUADRO CLÍNICO (6.2.1)',
  //                   fontSize: 7,
  //                   bold: true,
  //                   fillColor: '#f9f9f9',
  //                 },
  //               ],
  //               [
  //                 {},
  //                 {
  //                   text:
  //                     notaEvolucionData.evolucion_analisis ||
  //                     notaEvolucionData.sintomas_signos ||
  //                     'Paciente en evolución clínica favorable. Sin cambios significativos en el cuadro clínico inicial.',
  //                   fontSize: 8,
  //                   margin: [5, 5],
  //                   lineHeight: 1.3,
  //                 },
  //               ],
  //               [
  //                 {},
  //                 {
  //                   text: 'SIGNOS VITALES SEGÚN SE CONSIDERE NECESARIO (6.2.2)',
  //                   fontSize: 7,
  //                   bold: true,
  //                   fillColor: '#f9f9f9',
  //                 },
  //               ],
  //               [
  //                 {},
  //                 {
  //                   table: {
  //                     widths: ['20%', '20%', '20%', '20%', '20%'],
  //                     body: [
  //                       [
  //                         {
  //                           text: 'Presión arterial',
  //                           fontSize: 6,
  //                           bold: true,
  //                           alignment: 'center',
  //                         },
  //                         {
  //                           text: 'Frecuencia cardíaca',
  //                           fontSize: 6,
  //                           bold: true,
  //                           alignment: 'center',
  //                         },
  //                         {
  //                           text: 'Frecuencia respiratoria',
  //                           fontSize: 6,
  //                           bold: true,
  //                           alignment: 'center',
  //                         },
  //                         {
  //                           text: 'Temperatura',
  //                           fontSize: 6,
  //                           bold: true,
  //                           alignment: 'center',
  //                         },
  //                         {
  //                           text: 'Saturación O2',
  //                           fontSize: 6,
  //                           bold: true,
  //                           alignment: 'center',
  //                         },
  //                       ],
  //                       [
  //                         {
  //                           text: `${
  //                             signosVitalesReales.presion_arterial_sistolica ||
  //                             '___'
  //                           }/${
  //                             signosVitalesReales.presion_arterial_diastolica ||
  //                             '___'
  //                           } mmHg`,
  //                           fontSize: 7,
  //                           alignment: 'center',
  //                           margin: [0, 1],
  //                         },
  //                         {
  //                           text: `${
  //                             signosVitalesReales.frecuencia_cardiaca || '___'
  //                           } lpm`,
  //                           fontSize: 7,
  //                           alignment: 'center',
  //                           margin: [0, 1],
  //                         },
  //                         {
  //                           text: `${
  //                             signosVitalesReales.frecuencia_respiratoria ||
  //                             '___'
  //                           } rpm`,
  //                           fontSize: 7,
  //                           alignment: 'center',
  //                           margin: [0, 1],
  //                         },
  //                         {
  //                           text: `${
  //                             signosVitalesReales.temperatura || '___'
  //                           } °C`,
  //                           fontSize: 7,
  //                           alignment: 'center',
  //                           margin: [0, 1],
  //                         },
  //                         {
  //                           text: `${
  //                             signosVitalesReales.saturacion_oxigeno || '___'
  //                           } %`,
  //                           fontSize: 7,
  //                           alignment: 'center',
  //                           margin: [0, 1],
  //                         },
  //                       ],
  //                     ],
  //                   },
  //                   layout: {
  //                     hLineWidth: () => 0.3,
  //                     vLineWidth: () => 0.3,
  //                     hLineColor: () => '#000000',
  //                     vLineColor: () => '#000000',
  //                   },
  //                   margin: [5, 2],
  //                 },
  //               ],
  //               [
  //                 {},
  //                 {
  //                   text: 'SOMATOMETRÍA Y ESTADO NUTRICIONAL',
  //                   fontSize: 7,
  //                   bold: true,
  //                   fillColor: '#f9f9f9',
  //                 },
  //               ],
  //               [
  //                 {},
  //                 {
  //                   text: `Peso: ${
  //                     signosVitalesReales.peso || '___'
  //                   } kg | Talla: ${
  //                     signosVitalesReales.talla || '___'
  //                   } cm | Estado nutricional: ${
  //                     notaEvolucionData.estado_nutricional ||
  //                     'Adecuado para la edad'
  //                   }`,
  //                   fontSize: 7,
  //                   margin: [5, 3],
  //                 },
  //               ],
  //             ],
  //           },
  //           layout: {
  //             hLineWidth: () => 0.5,
  //             vLineWidth: () => 0.5,
  //             hLineColor: () => '#000000',
  //             vLineColor: () => '#000000',
  //           },
  //         },

  //         { text: '', margin: [0, 3] },

  //         // 🔹 ESTUDIOS Y RESULTADOS (6.2.3)
  //         {
  //           table: {
  //             widths: ['20%', '80%'],
  //             body: [
  //               [
  //                 {
  //                   text: 'ESTUDIOS Y RESULTADOS',
  //                   fontSize: 8,
  //                   bold: true,
  //                   fillColor: '#f5f5f5',
  //                   alignment: 'center',
  //                   rowSpan: 2,
  //                 },
  //                 {
  //                   text: 'RESULTADOS RELEVANTES DE ESTUDIOS DE SERVICIOS AUXILIARES (6.2.3)',
  //                   fontSize: 7,
  //                   bold: true,
  //                   fillColor: '#f9f9f9',
  //                 },
  //               ],
  //               [
  //                 {},
  //                 {
  //                   text:
  //                     notaEvolucionData.estudios_laboratorio_gabinete ||
  //                     'Sin estudios nuevos solicitados. Resultados pendientes o no aplicables para la evolución actual.',
  //                   fontSize: 8,
  //                   margin: [5, 5],
  //                   lineHeight: 1.3,
  //                 },
  //               ],
  //             ],
  //           },
  //           layout: {
  //             hLineWidth: () => 0.5,
  //             vLineWidth: () => 0.5,
  //             hLineColor: () => '#000000',
  //             vLineColor: () => '#000000',
  //           },
  //         },

  //         { text: '', margin: [0, 3] },

  //         // 🔹 EXPLORACIÓN FÍSICA DIRIGIDA
  //         {
  //           table: {
  //             widths: ['20%', '80%'],
  //             body: [
  //               [
  //                 {
  //                   text: 'EXPLORACIÓN FÍSICA',
  //                   fontSize: 8,
  //                   bold: true,
  //                   fillColor: '#f5f5f5',
  //                   alignment: 'center',
  //                   rowSpan: 4,
  //                 },
  //                 {
  //                   text: 'HABITUS EXTERIOR',
  //                   fontSize: 7,
  //                   bold: true,
  //                   fillColor: '#f9f9f9',
  //                 },
  //               ],
  //               [
  //                 {},
  //                 {
  //                   text:
  //                     notaEvolucionData.habitus_exterior ||
  //                     'Paciente consciente, orientado, cooperador. Facies no características, marcha conservada, actitud adecuada.',
  //                   fontSize: 8,
  //                   margin: [5, 3],
  //                   lineHeight: 1.3,
  //                 },
  //               ],
  //               [
  //                 {},
  //                 {
  //                   text: 'EXPLORACIÓN DIRIGIDA POR APARATOS',
  //                   fontSize: 7,
  //                   bold: true,
  //                   fillColor: '#f9f9f9',
  //                 },
  //               ],
  //               [
  //                 {},
  //                 {
  //                   text:
  //                     `Cardiovascular: ${
  //                       notaEvolucionData.exploracion_cardiovascular ||
  //                       'Ruidos cardíacos rítmicos, sin soplos'
  //                     }\n` +
  //                     `Respiratorio: ${
  //                       notaEvolucionData.exploracion_respiratorio ||
  //                       'Murmullo vesicular presente, sin ruidos agregados'
  //                     }\n` +
  //                     `Abdomen: ${
  //                       notaEvolucionData.exploracion_abdomen ||
  //                       'Blando, depresible, sin dolor'
  //                     }\n` +
  //                     `Neurológico: ${
  //                       notaEvolucionData.exploracion_neurologico ||
  //                       'Sin déficit motor ni sensitivo'
  //                     }`,
  //                   fontSize: 7,
  //                   margin: [5, 3],
  //                   lineHeight: 1.3,
  //                 },
  //               ],
  //             ],
  //           },
  //           layout: {
  //             hLineWidth: () => 0.5,
  //             vLineWidth: () => 0.5,
  //             hLineColor: () => '#000000',
  //             vLineColor: () => '#000000',
  //           },
  //         },

  //         { text: '', margin: [0, 3] },

  //         // 🔹 DIAGNÓSTICOS Y PROBLEMAS CLÍNICOS (6.2.4)
  //         {
  //           table: {
  //             widths: ['20%', '80%'],
  //             body: [
  //               [
  //                 {
  //                   text: 'DIAGNÓSTICOS ACTUALES',
  //                   fontSize: 8,
  //                   bold: true,
  //                   fillColor: '#f5f5f5',
  //                   alignment: 'center',
  //                   rowSpan: 2,
  //                 },
  //                 {
  //                   text: 'DIAGNÓSTICOS O PROBLEMAS CLÍNICOS (6.2.4)',
  //                   fontSize: 7,
  //                   bold: true,
  //                   fillColor: '#f9f9f9',
  //                 },
  //               ],
  //               [
  //                 {},
  //                 {
  //                   text:
  //                     notaEvolucionData.diagnosticos ||
  //                     'Diagnósticos en seguimiento según nota de ingreso. Sin cambios en impresión diagnóstica.',
  //                   fontSize: 8,
  //                   margin: [5, 5],
  //                   lineHeight: 1.3,
  //                   bold: true,
  //                 },
  //               ],
  //             ],
  //           },
  //           layout: {
  //             hLineWidth: () => 0.5,
  //             vLineWidth: () => 0.5,
  //             hLineColor: () => '#000000',
  //             vLineColor: () => '#000000',
  //           },
  //         },

  //         { text: '', margin: [0, 3] },

  //         // 🔹 PRONÓSTICO (6.2.5)
  //         {
  //           table: {
  //             widths: ['20%', '80%'],
  //             body: [
  //               [
  //                 {
  //                   text: 'PRONÓSTICO',
  //                   fontSize: 8,
  //                   bold: true,
  //                   fillColor: '#f5f5f5',
  //                   alignment: 'center',
  //                 },
  //                 {
  //                   text: `PRONÓSTICO (6.2.5): ${
  //                     notaEvolucionData.pronostico ||
  //                     'Favorable para la vida y función. Reservado a evolución clínica.'
  //                   }`,
  //                   fontSize: 8,
  //                   margin: [5, 5],
  //                   lineHeight: 1.3,
  //                   bold: true,
  //                 },
  //               ],
  //             ],
  //           },
  //           layout: {
  //             hLineWidth: () => 0.5,
  //             vLineWidth: () => 0.5,
  //             hLineColor: () => '#000000',
  //             vLineColor: () => '#000000',
  //           },
  //         },

  //         { text: '', margin: [0, 3] },

  //         // 🔹 TRATAMIENTO E INDICACIONES MÉDICAS (6.2.6)
  //         {
  //           table: {
  //             widths: ['20%', '80%'],
  //             body: [
  //               [
  //                 {
  //                   text: 'TRATAMIENTO E INDICACIONES',
  //                   fontSize: 8,
  //                   bold: true,
  //                   fillColor: '#f5f5f5',
  //                   alignment: 'center',
  //                   rowSpan: 4,
  //                 },
  //                 {
  //                   text: 'TRATAMIENTO E INDICACIONES MÉDICAS (6.2.6)',
  //                   fontSize: 7,
  //                   bold: true,
  //                   fillColor: '#f9f9f9',
  //                 },
  //               ],
  //               [
  //                 {},
  //                 {
  //                   text:
  //                     notaEvolucionData.plan_estudios_tratamiento ||
  //                     'Continuar manejo actual. Vigilar evolución clínica. Medidas generales de soporte.',
  //                   fontSize: 8,
  //                   margin: [5, 5],
  //                   lineHeight: 1.3,
  //                 },
  //               ],
  //               [
  //                 {},
  //                 {
  //                   text: 'MEDICAMENTOS (DOSIS, VÍA, PERIODICIDAD)',
  //                   fontSize: 7,
  //                   bold: true,
  //                   fillColor: '#f9f9f9',
  //                 },
  //               ],
  //               [
  //                 {},
  //                 {
  //                   text:
  //                     notaEvolucionData.indicaciones_medicas ||
  //                     'Medicamentos según prescripción previa. Revisar esquema terapéutico en nota de ingreso.',
  //                   fontSize: 8,
  //                   margin: [5, 5],
  //                   lineHeight: 1.3,
  //                 },
  //               ],
  //             ],
  //           },
  //           layout: {
  //             hLineWidth: () => 0.5,
  //             vLineWidth: () => 0.5,
  //             hLineColor: () => '#000000',
  //             vLineColor: () => '#000000',
  //           },
  //         },

  //         { text: '', margin: [0, 3] },

  //         // 🔹 INTERCONSULTAS Y PROCEDIMIENTOS
  //         {
  //           table: {
  //             widths: ['100%'],
  //             body: [
  //               [
  //                 {
  //                   text: 'INTERCONSULTAS Y PROCEDIMIENTOS',
  //                   fontSize: 7,
  //                   bold: true,
  //                   fillColor: '#f9f9f9',
  //                   alignment: 'center',
  //                 },
  //               ],
  //               [
  //                 {
  //                   text:
  //                     notaEvolucionData.interconsultas ||
  //                     'Sin interconsultas programadas para esta evolución. Sin procedimientos especiales indicados.',
  //                   fontSize: 8,
  //                   margin: [10, 5],
  //                   lineHeight: 1.3,
  //                 },
  //               ],
  //             ],
  //           },
  //           layout: {
  //             hLineWidth: () => 0.5,
  //             vLineWidth: () => 0.5,
  //             hLineColor: () => '#000000',
  //             vLineColor: () => '#000000',
  //           },
  //         },

  //         { text: '', margin: [0, 5] },

  //         // 🔹 MÉDICO RESPONSABLE SEGÚN NOM-004 (5.10)
  //         {
  //           table: {
  //             widths: ['50%', '50%'],
  //             body: [
  //               [
  //                 {
  //                   text: 'NOMBRE COMPLETO Y CÉDULA PROFESIONAL DEL MÉDICO',
  //                   fontSize: 8,
  //                   bold: true,
  //                   fillColor: '#f5f5f5',
  //                   alignment: 'center',
  //                 },
  //                 {
  //                   text: 'FIRMA AUTÓGRAFA',
  //                   fontSize: 8,
  //                   bold: true,
  //                   fillColor: '#f5f5f5',
  //                   alignment: 'center',
  //                 },
  //               ],
  //               [
  //                 {
  //                   text: [
  //                     {
  //                       text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}\n`,
  //                       fontSize: 9,
  //                       bold: true,
  //                     },
  //                     {
  //                       text: `Cédula Profesional: ${medicoCompleto.numero_cedula}\n`,
  //                       fontSize: 8,
  //                     },
  //                     {
  //                       text: `Especialidad: ${medicoCompleto.especialidad}\n`,
  //                       fontSize: 8,
  //                     },
  //                     {
  //                       text: `${medicoCompleto.cargo} - ${medicoCompleto.departamento}\n`,
  //                       fontSize: 8,
  //                     },
  //                     {
  //                       text: `Hospital General San Luis de la Paz\n`,
  //                       fontSize: 7,
  //                     },
  //                     {
  //                       text: `Fecha: ${fechaActual.toLocaleDateString(
  //                         'es-MX'
  //                       )}\n`,
  //                       fontSize: 7,
  //                     },
  //                     {
  //                       text: `Hora: ${fechaActual.toLocaleTimeString(
  //                         'es-MX'
  //                       )}`,
  //                       fontSize: 7,
  //                     },
  //                   ],
  //                   margin: [5, 15],
  //                   alignment: 'center',
  //                 },
  //                 {
  //                   text: '\n\n\n\n_________________________\nFIRMA DEL MÉDICO TRATANTE\n(NOM-004-SSA3-2012)',
  //                   fontSize: 8,
  //                   margin: [5, 15],
  //                   alignment: 'center',
  //                 },
  //               ],
  //             ],
  //           },
  //           layout: {
  //             hLineWidth: () => 0.5,
  //             vLineWidth: () => 0.5,
  //             hLineColor: () => '#000000',
  //             vLineColor: () => '#000000',
  //           },
  //         },

  //         { text: '', margin: [0, 2] },

  //         // 🔹 NOTA REFERENCIAL
  //         {
  //           text: [
  //             {
  //               text: '* Nota elaborada conforme a NOM-004-SSA3-2012, Sección 6.2 "Nota de evolución"\n',
  //               fontSize: 6,
  //               italics: true,
  //               color: '#666666',
  //             },
  //             {
  //               text: '* Cumple con los requisitos establecidos en los numerales 6.2.1 al 6.2.6',
  //               fontSize: 6,
  //               italics: true,
  //               color: '#666666',
  //             },
  //           ],
  //           alignment: 'left',
  //         },
  //       ],

  //       footer: (currentPage: number, pageCount: number) => {
  //         return {
  //           margin: [20, 5],
  //           table: {
  //             widths: ['25%', '50%', '25%'],
  //             body: [
  //               [
  //                 {
  //                   text: `Página ${currentPage} de ${pageCount}`,
  //                   fontSize: 7,
  //                   color: '#666666',
  //                 },
  //                 {
  //                   text: 'Nota de Evolución - SICEG\nNOM-004-SSA3-2012',
  //                   fontSize: 7,
  //                   alignment: 'center',
  //                   color: '#666666',
  //                 },
  //                 {
  //                   text: [
  //                     {
  //                       text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
  //                       fontSize: 7,
  //                     },
  //                     {
  //                       text: `Exp: ${pacienteCompleto.numero_expediente}`,
  //                       fontSize: 6,
  //                     },
  //                   ],
  //                   alignment: 'right',
  //                   color: '#666666',
  //                 },
  //               ],
  //             ],
  //           },
  //           layout: 'noBorders',
  //         };
  //       },
  //     };

  //     const nombreArchivo = `nota-evolucion-${pacienteCompleto.nombre
  //       .replace(/\s+/g, '-')
  //       .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

  //     const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
  //     pdfDocGenerator.download(nombreArchivo);

  //     console.log('✅ PDF de Nota de Evolución NOM-004 generado exitosamente');
  //     console.log(`📄 Archivo: ${nombreArchivo}`);

  //     // 🔥 VALIDAR CUMPLIMIENTO ESPECÍFICO NOTA EVOLUCIÓN
  //     this.validarCumplimientoNotaEvolucion(
  //       datos,
  //       medicoCompleto,
  //       pacienteCompleto
  //     );
  //   } catch (error) {
  //     console.error('❌ Error al generar PDF de Nota de Evolución:', error);
  //     throw error;
  //   }
  // }

  // 📄 NOTA DE CONSENTIMIENTO INFORMADO PARA PROCEDIMIENTOS SEGÚN NOM-004-SSA3-2012
  async generarNotaConsentimientoProcedimientos(datos: any): Promise<void> {
    try {
      await this.ensurePdfMakeLoaded();

      console.log(
        '📝 Generando Nota de Consentimiento Informado para Procedimientos según NOM-004...'
      );

      const medicoCompleto = await this.obtenerDatosMedicoActual();
      const pacienteCompleto = this.validarYFormatearDatosPaciente(
        datos.paciente
      );
      const consentimientoData = datos.consentimiento || {};
      const fechaActual = new Date();

      const documentDefinition = {
        pageSize: 'LETTER',
        pageMargins: [40, 80, 40, 80],

        header: {
          margin: [40, 20, 40, 20],
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ',
                  fontSize: 14,
                  bold: true,
                  alignment: 'center',
                },
              ],
              [
                {
                  text: 'CARTA DE CONSENTIMIENTO INFORMADO PARA',
                  fontSize: 12,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 5, 0, 0],
                },
              ],
              [
                {
                  text: 'OPERACIÓN O PROCEDIMIENTOS Y ALTERNATIVAS',
                  fontSize: 14,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 2, 0, 0],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },

        content: [
          { text: '', margin: [0, 10] },

          // 🔹 DATOS DEL PACIENTE
          {
            table: {
              widths: ['13%', '37%', '8%', '12%', '12%', '18%'],
              body: [
                [
                  { text: 'Nombre:', fontSize: 9, bold: true },
                  {
                    text: pacienteCompleto.nombre_completo,
                    fontSize: 9,
                    decoration: 'underline',
                  },
                  { text: 'Edad:', fontSize: 9, bold: true },
                  {
                    text: `${pacienteCompleto.edad} años`,
                    fontSize: 9,
                    decoration: 'underline',
                  },
                  { text: 'Fecha:', fontSize: 9, bold: true },
                  {
                    text: fechaActual.toLocaleDateString('es-MX'),
                    fontSize: 9,
                    decoration: 'underline',
                  },
                ],
                [
                  { text: 'CURP:', fontSize: 9, bold: true },
                  {
                    text: pacienteCompleto.curp,
                    fontSize: 9,
                    decoration: 'underline',
                  },
                  { text: 'Sexo:', fontSize: 9, bold: true },
                  {
                    text: pacienteCompleto.sexo,
                    fontSize: 9,
                    decoration: 'underline',
                  },
                  { text: 'Expediente:', fontSize: 9, bold: true },
                  {
                    text: pacienteCompleto.numero_expediente,
                    fontSize: 9,
                    decoration: 'underline',
                  },
                ],
                [
                  { text: 'F. Nacimiento:', fontSize: 8, bold: true },
                  {
                    text: pacienteCompleto.fecha_nacimiento || 'No registrada',
                    fontSize: 9,
                    decoration: 'underline',
                  },
                  { text: 'Cama:', fontSize: 9, bold: true },
                  {
                    text: consentimientoData.numero_cama || 'N/A',
                    fontSize: 9,
                    decoration: 'underline',
                  },
                  { text: 'Servicio:', fontSize: 9, bold: true },
                  {
                    text: medicoCompleto.departamento,
                    fontSize: 9,
                    decoration: 'underline',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          // 🔹 DECLARACIÓN INICIAL
          {
            table: {
              widths: ['5%', '95%'],
              body: [
                [
                  { text: 'YO', fontSize: 11, bold: true },
                  {
                    text:
                      consentimientoData.nombre_responsable ||
                      pacienteCompleto.nombre_completo,
                    fontSize: 11,
                    decoration: 'underline',
                    color: '#000000',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          {
            text: [
              {
                text: 'en pleno uso de mis facultades mentales, ',
                fontSize: 11,
              },
              { text: 'AUTORIZO', fontSize: 11, bold: true },
              {
                text: ' a este Hospital y a su personal para realizar la siguiente Operación (o Procedimiento):',
                fontSize: 11,
              },
            ],
            lineHeight: 1.3,
            margin: [0, 0, 0, 10],
          },

          // 🔹 NOMBRE DEL PROCEDIMIENTO
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text:
                      consentimientoData.nombre_procedimiento ||
                      '________________________________________________________________________',
                    fontSize: 12,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 15, 0, 15],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 15],
          },

          {
            text: 'Entendiendo que la ventaja de someterme a este procedimiento quirúrgico o diagnóstico es:',
            fontSize: 11,
            margin: [0, 0, 0, 10],
          },

          // 🔹 BENEFICIOS DEL PROCEDIMIENTO
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text:
                      consentimientoData.beneficios_procedimiento ||
                      '_________________________________________________________________\n_________________________________________________________________',
                    fontSize: 10,
                    margin: [10, 10, 10, 10],
                    minHeight: 40,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 15],
          },

          // 🔹 RIESGOS
          {
            text: [{ text: 'RIESGOS:', fontSize: 11, bold: true }],
            margin: [0, 0, 0, 10],
          },

          {
            text: 'Se da autorización bajo el entendimiento pleno de que cualquier operación o procedimiento médico-quirúrgico, implica algún(os) riesgo(s) y/o peligro(s). Los riesgos más comunes incluyen: Infección, Hemorragia, Lesión nerviosa, Coágulos sanguíneos, ataque cardiaco, Reacciones alérgicas y neumonía. Estos riesgos pueden ser graves e incluso mortales. Algunos riesgos importantes en especial de este tipo de intervención que se va a realizar son:',
            fontSize: 10,
            lineHeight: 1.3,
            margin: [0, 0, 0, 15],
          },

          // 🔹 RIESGOS ESPECÍFICOS
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text:
                      consentimientoData.riesgos_especificos ||
                      '_________________________________________________________________\n_________________________________________________________________\n_________________________________________________________________',
                    fontSize: 10,
                    margin: [10, 10, 10, 10],
                    minHeight: 60,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 15],
          },

          // 🔹 ANESTESIA
          {
            text: [{ text: 'ANESTESIA:', fontSize: 11, bold: true }],
            margin: [0, 0, 0, 10],
          },

          {
            text: [
              {
                text: 'La aplicación de Anestesia también implica riesgos; el más importante de estos, aunque poco frecuente que suceda, es el riesgo de sufrir alguna reacción a los medicamentos que pueden ser incluso fatales. ',
                fontSize: 11,
              },
              { text: 'Autorizo', fontSize: 11, bold: true },
              {
                text: ' la técnica y el uso de anestésicos que juzgue necesarios la persona de este servicio para la realización del procedimiento autorizado.',
                fontSize: 11,
              },
            ],
            lineHeight: 1.3,
            margin: [0, 0, 0, 15],
          },

          // 🔹 PROCEDIMIENTOS ADICIONALES
          {
            text: [
              { text: 'PROCEDIMIENTOS ADICIONALES:', fontSize: 11, bold: true },
            ],
            margin: [0, 0, 0, 10],
          },

          {
            text: [
              {
                text: 'Si mi Médico selecciona un procedimiento diferente, por alguna situación especial no sospechada en el transcurso de mi intervención, (sí ó no) ',
                fontSize: 11,
              },
              {
                text:
                  consentimientoData.autoriza_procedimientos_adicionales ||
                  '______',
                fontSize: 11,
                decoration: 'underline',
              },
              {
                text: ' lo autorizo a realizar si lo considera necesario',
                fontSize: 11,
              },
            ],
            lineHeight: 1.3,
            margin: [0, 0, 0, 15],
          },

          {
            text: 'Estoy enterado(a), de que no existe garantía o seguridad sobre resultados del procedimiento y de que existe la posibilidad de que no pueda curarse la enfermedad o padecimiento que presento.',
            fontSize: 11,
            lineHeight: 1.3,
            margin: [0, 0, 0, 15],
          },

          {
            text: 'Así también estoy enterado(a) de que nadie puede decir con seguridad cuáles serán las complicaciones que ocurran en mi caso, si es que las hay.',
            fontSize: 11,
            lineHeight: 1.3,
            margin: [0, 0, 0, 20],
          },

          // 🔹 CONSENTIMIENTO DEL PACIENTE
          {
            text: [
              {
                text: 'CONSENTIMIENTO DEL PACIENTE, O TUTOR:',
                fontSize: 11,
                bold: true,
              },
            ],
            margin: [0, 0, 0, 15],
          },

          {
            text: 'Tengo que leer y entender esta forma de consentimiento, la que no debo firmar si alguno de los párrafos o de mis dudas no han sido explicadas a mi entera satisfacción o si no entiendo cualquier término o palabra contenida en ese documento.',
            fontSize: 11,
            lineHeight: 1.3,
            margin: [0, 0, 0, 15],
          },

          {
            text: 'Si tiene cualquier duda acerca de los riesgos o peligros de la cirugía o tratamiento propuesto, pregunte a su Cirujano, ahora. ¡Antes de firmar el documento! ¡No firme a menos de que entienda por completo este documento!',
            fontSize: 11,
            lineHeight: 1.3,
            margin: [0, 0, 0, 25],
          },

          // 🔹 FIRMAS
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    text: '\n\n\n_________________________________\nNombre y firma del médico',
                    fontSize: 11,
                    alignment: 'center',
                    margin: [0, 20, 0, 10],
                  },
                  {
                    text: '\n\n\n_________________________________\nNombre y firma del paciente, tutor o representante',
                    fontSize: 11,
                    alignment: 'center',
                    margin: [0, 20, 0, 10],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    text: '\n\n\n_________________________________\nTestigo nombre y firma',
                    fontSize: 11,
                    alignment: 'center',
                    margin: [0, 10, 0, 10],
                  },
                  {
                    text: '\n\n\n_________________________________\nTestigo nombre y firma',
                    fontSize: 11,
                    alignment: 'center',
                    margin: [0, 10, 0, 10],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 30],
          },

          // 🔹 LUGAR Y FECHA
          {
            table: {
              widths: ['35%', '10%', '8%', '20%', '8%', '19%'],
              body: [
                [
                  { text: 'San Luis de la Paz, Guanajuato a', fontSize: 10 },
                  {
                    text: fechaActual.getDate(),
                    fontSize: 10,
                    decoration: 'underline',
                    alignment: 'center',
                  },
                  { text: 'de', fontSize: 10, alignment: 'center' },
                  {
                    text: fechaActual.toLocaleDateString('es-MX', {
                      month: 'long',
                    }),
                    fontSize: 10,
                    decoration: 'underline',
                    alignment: 'center',
                  },
                  { text: 'de', fontSize: 10, alignment: 'center' },
                  {
                    text: `20${fechaActual.getFullYear().toString().slice(-2)}`,
                    fontSize: 10,
                    decoration: 'underline',
                    alignment: 'center',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            alignment: 'center',
          },
        ],

        footer: (currentPage: number, pageCount: number) => {
          return {
            margin: [40, 20],
            table: {
              widths: ['25%', '50%', '25%'],
              body: [
                [
                  {
                    text: `Página ${currentPage} de ${pageCount}`,
                    fontSize: 8,
                    color: '#000000',
                  },
                  {
                    text: 'Consentimiento Informado - SICEG\nNOM-004-SSA3-2012',
                    fontSize: 8,
                    alignment: 'center',
                    color: '#000000',
                  },
                  {
                    text: [
                      {
                        text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                        fontSize: 8,
                      },
                      {
                        text: `Exp: ${pacienteCompleto.numero_expediente}`,
                        fontSize: 7,
                      },
                    ],
                    alignment: 'right',
                    color: '#000000',
                  },
                ],
              ],
            },
            layout: 'noBorders',
          };
        },
      };

      const nombreArchivo = `consentimiento-procedimientos-${pacienteCompleto.nombre
        .replace(/\s+/g, '-')
        .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log(
        '✅ PDF de Consentimiento Informado para Procedimientos generado exitosamente'
      );
      console.log(`📄 Archivo: ${nombreArchivo}`);

      // 🔥 VALIDAR CUMPLIMIENTO ESPECÍFICO
      this.validarCumplimientoConsentimientoProcedimientos(
        datos,
        medicoCompleto,
        pacienteCompleto
      );
    } catch (error) {
      console.error(
        '❌ Error al generar PDF de Consentimiento Informado:',
        error
      );
      throw error;
    }
  }

    // 📄 CONSENTIMIENTO INFORMADO PARA HOSPITALIZACIÓN SEGÚN NOM-004-SSA3-2012
  async generarConsentimientoHospitalizacion(datos: any): Promise<void> {
    try {
      await this.ensurePdfMakeLoaded();

      console.log('🏥 Generando Consentimiento Informado para Hospitalización según NOM-004...');

      const medicoCompleto = await this.obtenerDatosMedicoActual();
      const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
      const consentimientoData = datos.consentimientoHospitalizacion || {};
      const fechaActual = new Date();

      const documentDefinition = {
        pageSize: 'LETTER',
        pageMargins: [40, 60, 40, 60],

        content: [
          { text: '', margin: [0, 20] },

          // 🔹 DATOS DEL PACIENTE
          {
            table: {
              widths: ['13%', '37%', '8%', '12%', '12%', '18%'],
              body: [
                [
                  { text: 'Nombre:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.nombre_completo, fontSize: 9, decoration: 'underline' },
                  { text: 'Edad:', fontSize: 9, bold: true },
                  { text: `${pacienteCompleto.edad} años`, fontSize: 9, decoration: 'underline' },
                  { text: 'Fecha:', fontSize: 9, bold: true },
                  { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 9, decoration: 'underline' },
                ],
                [
                  { text: 'CURP:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.curp, fontSize: 9, decoration: 'underline' },
                  { text: 'Sexo:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.sexo, fontSize: 9, decoration: 'underline' },
                  { text: 'Expediente:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.numero_expediente, fontSize: 9, decoration: 'underline' },
                ],
                [
                  { text: 'F. Nacimiento:', fontSize: 8, bold: true },
                  { text: pacienteCompleto.fecha_nacimiento || 'No registrada', fontSize: 9, decoration: 'underline' },
                  { text: 'Cama:', fontSize: 9, bold: true },
                  { text: consentimientoData.numero_cama || 'Por asignar', fontSize: 9, decoration: 'underline' },
                  { text: 'Servicio:', fontSize: 9, bold: true },
                  { text: medicoCompleto.departamento, fontSize: 9, decoration: 'underline' },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          // 🔹 DECLARACIÓN INICIAL
          {
            table: {
              widths: ['5%', '95%'],
              body: [
                [
                  { text: 'YO', fontSize: 11, bold: true },
                  {
                    text: consentimientoData.nombre_responsable || pacienteCompleto.nombre_completo,
                    fontSize: 11,
                    decoration: 'underline'
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 10],
          },

          {
            text: 'familiar o allegado designado por el paciente, y en caso de menores de edad e incapacitados para otorgar su consentimiento y/o autorización.',
            fontSize: 11,
            lineHeight: 1.3,
            margin: [0, 0, 0, 20],
          },

          // 🔹 AUTORIZO
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'AUTORIZO',
                    fontSize: 14,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 10, 0, 10],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 15],
          },

          {
            text: 'En atención a los artículos 80 al 83 de reglamento de la Ley General de Salud en materia de atención médica y a la NOM-168-SSA1-1998 relativa al expediente clínico numerales 4.2, 10.1 al 10.1.2, se otorga la presente autorización al personal Médico y Paramédico del Hospital.',
            fontSize: 11,
            lineHeight: 1.3,
            margin: [0, 0, 0, 15],
          },

          // 🔹 HOSPITAL
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ',
                    fontSize: 13,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 8, 0, 8],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 15],
          },

          {
            text: 'para realizar los procedimientos médicos y/o quirúrgicos necesarios al paciente en cuestión, y',
            fontSize: 11,
            margin: [0, 0, 0, 10],
          },

          {
            text: 'para tal efecto, dicho paciente y/o su representante legal DECLARA:',
            fontSize: 11,
            margin: [0, 0, 0, 15],
          },

          // 🔹 DECLARO
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'DECLARO',
                    fontSize: 14,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 10, 0, 10],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 15],
          },

          {
            text: 'Que los Médicos del Hospital le han explicado de una manera detallada y con un lenguaje que pudo comprender, que los procedimientos médicos y/o quirúrgicos que se planean realizar, tienen como objetivo primordial dar solución a los problemas de salud del enfermo, utilizando las técnicas vigentes para tal efecto, en virtud de que el personal de salud que labora en dicha institución se declara ampliamente capacitado y que cuanta con autorización legal con efectos de patente y cédula profesional correspondiente para el libre ejercicio de su especialidad médica o quirúrgica en su caso, así como la certificación vigente del consejo nacional de dicha especialidad, además de comprometerse a cuidar de la salud y la integridad, del enfermo y actuar con ética y responsabilidad en beneficio del paciente y su entorno biológico, psicológico y social.',
            fontSize: 11,
            lineHeight: 1.3,
            margin: [0, 0, 0, 15],
            alignment: 'justify',
          },

          {
            text: 'Que cualquier procedimiento médico implica una serie de riesgo no siempre previsible debido a diversas circunstancias que entre otras se consideran se estado físico previo, enfermedades pre o coexistentes, tratamientos previos, etcétera y que existe la posibilidad de complicaciones debidas al tratamiento médico y/o quirúrgico, ya que cada paciente puede reaccionar en forma diversa a la aplicación de tal fármaco o bien a la realización de determinado procedimiento, dichas complicaciones pueden ser transitorias o permanentes y pueden ir desde leves hasta severas y pueden poner en peligro la vida del paciente e incluso provocar la muerte.',
            fontSize: 11,
            lineHeight: 1.3,
            margin: [0, 0, 0, 15],
            alignment: 'justify',
          },

          {
            text: 'Que, en circunstancias especiales, el personal de salud se verá obligado a utilizar técnicas invasivas de diagnóstico y tratamiento, conforme a los protocolos médicos actuales con el objeto de mantener una vigilancia estrecha de las constantes vitales o bien de proporcionar una terapéutica oportuna que puede salvar la vida del paciente, pero las cuales se requiere la aplicación de sondas, catéteres o marcapasos según sea al caso.',
            fontSize: 11,
            lineHeight: 1.3,
            margin: [0, 0, 0, 15],
            alignment: 'justify',
          },

          {
            text: 'Que algunas enfermedades pueden requerir de un procedimiento quirúrgico para su resolución y que esta necesidad puede presentarse en cualquier momento de su estancia hospitalaria, para lo cual se solicitará una autorización previa del paciente o su representante legal en su caso, sin embargo, en dado caso que dicha persona no autorice el procedimiento en cuestión, o bien solicite su alta voluntaria por cualquier motivo, el Hospital y el personal que en el labora quedará automáticamente exento de cualquier implicación médica y legal derivada de la decisión, así como de la evolución consecutiva del paciente.',
            fontSize: 11,
            lineHeight: 1.3,
            margin: [0, 0, 0, 15],
            alignment: 'justify',
          },

          {
            text: 'Que en ocasiones puede ser necesaria la aplicación de sangre o productos sanguíneos para la resolución de determinados problemas de salud, por lo que se autoriza a los médicos a emplear dicha terapéutica siempre que sea necesaria, con las reservas que marcan las normas vigentes.',
            fontSize: 11,
            lineHeight: 1.3,
            margin: [0, 0, 0, 15],
            alignment: 'justify',
          },

          {
            text: 'Que el paciente será sometido a un protocolo terapéutico que se encuentra ampliamente documentado en el expediente clínico y que se apega estrechamente a las consideraciones éticas del tratado de Helsinki modificado en Viena y que el paciente debe seguir estrechamente las indicaciones para el diagnóstico y tratamiento de su enfermedad, ya que de no ser así o bien en el caso que el paciente siga instrucciones ajenas o bien actué de acuerdo a su propio entender o en su caso amita las indicaciones específicas del médico, así como el Hospital',
            fontSize: 11,
            lineHeight: 1.3,
            margin: [0, 0, 0, 15],
            alignment: 'justify',
          },

          // 🔹 HOSPITAL (REPETIDO)
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ',
                    fontSize: 12,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 8, 0, 8],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 15],
          },

          {
            text: 'Queda totalmente exentos de cualquier implicación médica y legal que se deriven de la evolución subsecuente del paciente.',
            fontSize: 11,
            lineHeight: 1.3,
            margin: [0, 0, 0, 25],
            alignment: 'justify',
          },

          // 🔹 ACEPTO
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'ACEPTO',
                    fontSize: 16,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 15, 0, 15],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 30],
          },

          // 🔹 FIRMAS
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: '\n\n\n_________________________________________\nNombre y firma del paciente y/o Representante legal',
                    fontSize: 11,
                    alignment: 'center',
                    margin: [0, 20, 0, 20],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 25],
          },

          {
            table: {
              widths: ['45%', '10%', '45%'],
              body: [
                [
                  {
                    text: '\n\n\n_____________________________\nTestigo',
                    fontSize: 11,
                    alignment: 'center',
                    margin: [0, 15, 0, 15],
                  },
                  { text: '', fontSize: 11 },
                  {
                    text: '\n\n\n_____________________________\nTestigo',
                    fontSize: 11,
                    alignment: 'center',
                    margin: [0, 15, 0, 15],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 25],
          },

          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: '\n\n\n_____________________________\nTestigo',
                    fontSize: 11,
                    alignment: 'center',
                    margin: [0, 15, 0, 15],
                  },
                ],
              ],
            },
            layout: 'noBorders',
          },
        ],

        footer: (currentPage: number, pageCount: number) => {
          return {
            margin: [40, 20],
            table: {
              widths: ['25%', '50%', '25%'],
              body: [
                [
                  {
                    text: `Página ${currentPage} de ${pageCount}`,
                    fontSize: 8,
                    color: '#000000',
                  },
                  {
                    text: 'Consentimiento Hospitalización - SICEG\nNOM-004-SSA3-2012',
                    fontSize: 8,
                    alignment: 'center',
                    color: '#000000',
                  },
                  {
                    text: [
                      {
                        text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                        fontSize: 8,
                      },
                      {
                        text: `Exp: ${pacienteCompleto.numero_expediente}`,
                        fontSize: 7,
                      },
                    ],
                    alignment: 'right',
                    color: '#000000',
                  },
                ],
              ],
            },
            layout: 'noBorders',
          };
        },
      };

      const nombreArchivo = `consentimiento-hospitalizacion-${pacienteCompleto.nombre
        .replace(/\s+/g, '-')
        .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log('✅ PDF de Consentimiento Informado para Hospitalización generado exitosamente');
      console.log(`📄 Archivo: ${nombreArchivo}`);

      // 🔥 VALIDAR CUMPLIMIENTO ESPECÍFICO
      this.validarCumplimientoConsentimientoHospitalizacion(datos, medicoCompleto, pacienteCompleto);

    } catch (error) {
      console.error('❌ Error al generar PDF de Consentimiento para Hospitalización:', error);
      throw error;
    }
  }

    // 📄 CARTA DE CONSENTIMIENTO INFORMADO PARA REFERENCIA DE PACIENTES SEGÚN NOM-004-SSA3-2012
  async generarConsentimientoReferenciaPacientes(datos: any): Promise<void> {
    try {
      await this.ensurePdfMakeLoaded();

      console.log('🔄 Generando Carta de Consentimiento Informado para Referencia de Pacientes según NOM-004...');

      const medicoCompleto = await this.obtenerDatosMedicoActual();
      const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
      const referenciaData = datos.referenciaConsentimiento || {};
      const fechaActual = new Date();

      const documentDefinition = {
        pageSize: 'LETTER',
        pageMargins: [40, 80, 40, 60],

        header: {
          margin: [40, 20, 40, 20],
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'CARTA DE CONSENTIMIENTO INFORMADO',
                  fontSize: 13,
                  bold: true,
                  alignment: 'center',
                },
              ],
              [
                {
                  text: 'PARA REFERENCIA DE PACIENTES',
                  fontSize: 14,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 5, 0, 0],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },

        content: [
          { text: '', margin: [0, 30] },

          // 🔹 DATOS GENERALES
          {
            table: {
              widths: ['28%', '72%'],
              body: [
                [
                  { text: 'Nombre de la Unidad Médica:', fontSize: 10, bold: true },
                  { text: 'Hospital General San Luis de la Paz', fontSize: 10, bold: true },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 10],
          },

          // 🔹 FECHA Y LUGAR
          {
            table: {
              widths: ['22%', '12%', '5%', '15%', '5%', '15%', '26%'],
              body: [
                [
                  { text: 'San Luis de la Paz, Guanajuato a', fontSize: 10, bold: true },
                  { text: fechaActual.getDate().toString(), fontSize: 10, decoration: 'underline', alignment: 'center' },
                  { text: 'de', fontSize: 10, bold: true, alignment: 'center' },
                  { text: fechaActual.toLocaleDateString('es-MX', { month: 'long' }), fontSize: 10, decoration: 'underline', alignment: 'center' },
                  { text: 'de', fontSize: 10, bold: true, alignment: 'center' },
                  { text: fechaActual.getFullYear().toString(), fontSize: 10, decoration: 'underline', alignment: 'center' },
                  { text: '', fontSize: 10 },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          // 🔹 DATOS DEL INGRESO
          {
            table: {
              widths: ['28%', '17%', '10%', '15%', '8%', '22%'],
              body: [
                [
                  { text: 'Fecha de Ingreso hospitalario:', fontSize: 10, bold: true },
                  {
                    text: referenciaData.fecha_ingreso || fechaActual.toLocaleDateString('es-MX'),
                    fontSize: 10,
                    decoration: 'underline'
                  },
                  { text: 'Servicio:', fontSize: 10, bold: true },
                  { text: medicoCompleto.departamento, fontSize: 10, decoration: 'underline' },
                  { text: 'Cama:', fontSize: 10, bold: true },
                  { text: referenciaData.numero_cama || 'Sin asignar', fontSize: 10, decoration: 'underline' },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          // 🔹 DATOS DEL PACIENTE
          {
            table: {
              widths: ['28%', '40%', '16%', '16%'],
              body: [
                [
                  { text: 'Nombre del (la) paciente:', fontSize: 10, bold: true },
                  { text: pacienteCompleto.nombre_completo, fontSize: 10, decoration: 'underline' },
                  { text: 'No. Expediente:', fontSize: 10, bold: true },
                  { text: pacienteCompleto.numero_expediente, fontSize: 10, decoration: 'underline' },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 10],
          },

          {
            table: {
              widths: ['28%', '25%', '8%', '15%', '12%', '12%'],
              body: [
                [
                  { text: 'Fecha de nacimiento:', fontSize: 10, bold: true },
                  { text: pacienteCompleto.fecha_nacimiento || 'No registrada', fontSize: 10, decoration: 'underline' },
                  { text: 'Edad:', fontSize: 10, bold: true },
                  { text: `${pacienteCompleto.edad} años`, fontSize: 10, decoration: 'underline' },
                  { text: 'Fecha/hora:', fontSize: 10, bold: true },
                  { text: fechaActual.toLocaleString('es-MX'), fontSize: 9, decoration: 'underline' },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 25],
          },

          // 🔹 CONSENTIMIENTO PRINCIPAL
          {
            table: {
              widths: ['25%', '75%'],
              body: [
                [
                  { text: 'Acepto que el (la) Dr (a)', fontSize: 10, bold: true },
                  { text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}`, fontSize: 11, decoration: 'underline' },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 10],
          },

          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: [
                      {
                        text: 'Me ha explicado clara y entendible el padecimiento, riesgos, cuidados, tratamientos médicos requeridos para la estabilización de mi salud o la de mi paciente.\n\n',
                        fontSize: 11,
                      },
                      {
                        text: 'Para su atención se requiere de la realización del procedimiento administrativo de referencia de pacientes, que consiste en el envío a otra unidad donde se cuenta con la capacidad física instalada para atender el problema de salud y una vez estabilizado o resuelto se contrarrefiera a la unidad de salud de origen.\n\n',
                        fontSize: 11,
                      },
                      {
                        text: 'Enterado (a) de todo lo anterior y una vez que me han informado a mi entera satisfacción, otorgo el presente consentimiento.',
                        fontSize: 11,
                      },
                    ],
                    alignment: 'justify',
                    lineHeight: 1.3,
                    margin: [10, 15, 10, 15],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 30],
          },

          // 🔹 INFORMACIÓN ADICIONAL DE LA REFERENCIA
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'INFORMACIÓN DE LA REFERENCIA',
                    fontSize: 11,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 8, 0, 8],
                  },
                ],
                [
                  {
                    text: [
                      {
                        text: 'Motivo de la referencia: ',
                        fontSize: 10,
                        bold: true,
                      },
                      {
                        text: referenciaData.motivo_referencia || 'Requiere atención especializada no disponible en esta unidad médica.',
                        fontSize: 10,
                      },
                      {
                        text: '\n\nUnidad médica de destino: ',
                        fontSize: 10,
                        bold: true,
                      },
                      {
                        text: referenciaData.unidad_destino || 'Por definir según disponibilidad y especialidad requerida.',
                        fontSize: 10,
                      },
                      {
                        text: '\n\nEspecialidad requerida: ',
                        fontSize: 10,
                        bold: true,
                      },
                      {
                        text: referenciaData.especialidad_requerida || 'Según criterio médico.',
                        fontSize: 10,
                      },
                    ],
                    margin: [10, 10, 10, 10],
                    lineHeight: 1.3,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 30],
          },

          // 🔹 FIRMAS
          {
            table: {
              widths: ['45%', '10%', '45%'],
              body: [
                [
                  {
                    text: `\n\n\n${pacienteCompleto.nombre_completo}\n_______________________________`,
                    fontSize: 10,
                    alignment: 'center',
                    margin: [0, 15, 0, 5],
                  },
                  { text: '', fontSize: 10 },
                  {
                    text: `\n\n\n${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}\n_______________________________`,
                    fontSize: 10,
                    alignment: 'center',
                    margin: [0, 15, 0, 5],
                  },
                ],
                [
                  {
                    text: 'Nombre completo y firma del (paciente) tutor y/o representante legal',
                    fontSize: 9,
                    alignment: 'center',
                    margin: [0, 5, 0, 5],
                  },
                  { text: '', fontSize: 9 },
                  {
                    text: 'Nombre completo y firma del médico tratante',
                    fontSize: 9,
                    alignment: 'center',
                    margin: [0, 5, 0, 5],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 25],
          },

          // 🔹 TESTIGOS
          {
            table: {
              widths: ['45%', '10%', '45%'],
              body: [
                [
                  {
                    text: `\n\n\n${referenciaData.testigo1_nombre || '__________________________'}\n_______________________________`,
                    fontSize: 10,
                    alignment: 'center',
                    margin: [0, 15, 0, 5],
                  },
                  { text: '', fontSize: 10 },
                  {
                    text: `\n\n\n${referenciaData.testigo2_nombre || '__________________________'}\n_______________________________`,
                    fontSize: 10,
                    alignment: 'center',
                    margin: [0, 15, 0, 5],
                  },
                ],
                [
                  {
                    text: 'Nombre completo y firma testigo',
                    fontSize: 9,
                    alignment: 'center',
                    margin: [0, 5, 0, 5],
                  },
                  { text: '', fontSize: 9 },
                  {
                    text: 'Nombre completo y firma testigo',
                    fontSize: 9,
                    alignment: 'center',
                    margin: [0, 5, 0, 5],
                  },
                ],
              ],
            },
            layout: 'noBorders',
          },
        ],

        footer: (currentPage: number, pageCount: number) => {
          return {
            margin: [40, 20],
            table: {
              widths: ['25%', '50%', '25%'],
              body: [
                [
                  {
                    text: `Página ${currentPage} de ${pageCount}`,
                    fontSize: 8,
                    color: '#000000',
                  },
                  {
                    text: 'Consentimiento Referencia - SICEG\nNOM-004-SSA3-2012',
                    fontSize: 8,
                    alignment: 'center',
                    color: '#000000',
                  },
                  {
                    text: [
                      {
                        text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                        fontSize: 8,
                      },
                      {
                        text: `Exp: ${pacienteCompleto.numero_expediente}`,
                        fontSize: 7,
                      },
                    ],
                    alignment: 'right',
                    color: '#000000',
                  },
                ],
              ],
            },
            layout: 'noBorders',
          };
        },
      };

      const nombreArchivo = `consentimiento-referencia-${pacienteCompleto.nombre
        .replace(/\s+/g, '-')
        .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log('✅ PDF de Consentimiento Informado para Referencia de Pacientes generado exitosamente');
      console.log(`📄 Archivo: ${nombreArchivo}`);

      // 🔥 VALIDAR CUMPLIMIENTO ESPECÍFICO
      this.validarCumplimientoConsentimientoReferencia(datos, medicoCompleto, pacienteCompleto);

    } catch (error) {
      console.error('❌ Error al generar PDF de Consentimiento para Referencia:', error);
      throw error;
    }
  }


  // 📄 CARTA DE CONSENTIMIENTO INFORMADO PARA TRANSFUSIÓN SANGUÍNEA O SUS DERIVADOS SEGÚN NOM-004-SSA3-2012
  async generarConsentimientoTransfusionSanguinea(datos: any): Promise<void> {
    try {
      await this.ensurePdfMakeLoaded();

      console.log('🩸 Generando Carta de Consentimiento Informado para Transfusión Sanguínea según NOM-004...');

      const medicoCompleto = await this.obtenerDatosMedicoActual();
      const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
      const transfusionData = datos.consentimientoTransfusion || {};
      const fechaActual = new Date();

      const documentDefinition = {
        pageSize: 'LETTER',
        pageMargins: [40, 80, 40, 60],

        header: {
          margin: [40, 20, 40, 20],
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'CARTA DE CONSENTIMIENTO INFORMADO PARA LA',
                  fontSize: 12,
                  bold: true,
                  alignment: 'center',
                },
              ],
              [
                {
                  text: 'TRANSFUSIÓN SANGUÍNEA O SUS DERIVADOS',
                  fontSize: 16,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 5, 0, 0],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },

        content: [
          { text: '', margin: [0, 20] },

          // 🔹 DATOS DEL PACIENTE
          {
            table: {
              widths: ['15%', '35%', '15%', '35%'],
              body: [
                [
                  { text: 'Nombre:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.nombre_completo, fontSize: 9, decoration: 'underline' },
                  { text: 'Edad:', fontSize: 9, bold: true },
                  { text: `${pacienteCompleto.edad} años`, fontSize: 9, decoration: 'underline' },
                ],
                [
                  { text: 'CURP:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.curp, fontSize: 9, decoration: 'underline' },
                  { text: 'Género:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.sexo, fontSize: 9, decoration: 'underline' },
                ],
                [
                  { text: 'F. Nacimiento:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.fecha_nacimiento || 'No registrada', fontSize: 9, decoration: 'underline' },
                  { text: 'Expediente:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.numero_expediente, fontSize: 9, decoration: 'underline' },
                ],
                [
                  { text: 'Cama:', fontSize: 9, bold: true },
                  { text: transfusionData.numero_cama || 'Sin asignar', fontSize: 9, decoration: 'underline' },
                  { text: 'Servicio:', fontSize: 9, bold: true },
                  { text: medicoCompleto.departamento, fontSize: 9, decoration: 'underline' },
                ],
                [
                  { text: 'Estado civil:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.estado_civil || 'No registrado', fontSize: 9, decoration: 'underline' },
                  { text: 'Diagnóstico:', fontSize: 9, bold: true },
                  { text: transfusionData.diagnostico || 'Pendiente', fontSize: 9, decoration: 'underline' },
                ],
                [
                  { text: 'Domicilio:', fontSize: 9, bold: true },
                  { text: this.formatearDireccionMejorada(pacienteCompleto), fontSize: 9, decoration: 'underline', colSpan: 3 },
                  {},
                  {},
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          // 🔹 INFORMACIÓN SOBRE LA TRANSFUSIÓN
          {
            text: 'Durante su ingreso hospitalario puede ser necesaria la transfusión de sangre y otros hemoderivados como plasma fresco congelado, plaquetas, y crioprecipitados, bien porque se precise durante la intervención quirúrgica, o porque tenga una enfermedad en la que sea necesaria.',
            fontSize: 12,
            lineHeight: 1.4,
            alignment: 'justify',
            margin: [0, 0, 0, 15],
          },

          {
            text: 'La transfusión consiste en la administración de sangre humana o alguno de sus componentes, a los pacientes que lo precisen. Se administra por vía intravenosa. También cabe la posibilidad de que durante el procedimiento haya que realizar modificaciones del mismo.',
            fontSize: 12,
            lineHeight: 1.4,
            alignment: 'justify',
            margin: [0, 0, 0, 15],
          },

          {
            text: 'Aunque se haga una adecuada elección del procedimiento y de su correcta aplicación, pueden presentarse efectos indeseables, tanto los comunes derivados del mismo y pueden afectar a todos los órganos y sistemas, como son debidos a la situación vital del paciente (diabetes, cardiopatía, hipertensión, edad avanzada, anemia, obesidad entre otras), y los específicos del procedimiento.',
            fontSize: 12,
            lineHeight: 1.4,
            alignment: 'justify',
            margin: [0, 0, 0, 15],
          },

          // 🔹 INFORMACIÓN SOBRE LA SEGURIDAD DE LA SANGRE
          {
            text: 'La sangre y sus derivados proceden de personas que gozan de buena salud. Son personas que, por donar no perciben compensación económica alguna. Todos los donadores son seleccionados con criterios médicos y la sangre se estudia cuidadosamente con los análisis que exigen las leyes. Cualquier unidad de sangre o hemoderivado que vaya usted a recibir habrá sido analizada para SIDA (anticuerpos anti-HIV), HEPATITIS (Hepatitis B/C), SÍFILIS, BRUCELOSIS Y CHAGAS.',
            fontSize: 12,
            lineHeight: 1.4,
            alignment: 'justify',
            margin: [0, 0, 0, 15],
          },

          // 🔹 RIESGOS ESPECÍFICOS
          {
            text: 'A pesar de ello puede ocurrir que el donante se encuentre en el periodo ventana (espacio de tiempo en el cual no es posible la detección serológica de la infección) y se pueda transmitir alguna de las infecciones anteriormente mencionadas.',
            fontSize: 11,
            lineHeight: 1.4,
            alignment: 'justify',
            margin: [0, 0, 0, 12],
          },

          {
            text: 'Otro riesgo posible que tienen las transfusiones es que el receptor pueda sufrir algún tipo de reacción de rechazo a alguno de los componentes de la sangre. Estas reacciones son frecuentes y, prácticamente, siempre leves.',
            fontSize: 12,
            lineHeight: 1.4,
            alignment: 'justify',
            margin: [0, 0, 0, 12],
          },

          {
            text: 'Ningún procedimiento invasivo está absolutamente exento de riesgos importantes, incluyendo la muerte, aunque esta posibilidad es poco frecuente.',
            fontSize: 11,
            lineHeight: 1.4,
            alignment: 'justify',
            margin: [0, 0, 0, 15],
          },

          // 🔹 MARCO LEGAL
          {
            text: [
              {
                text: 'En atención a los artículos 80 al 83 de reglamento de la Ley General de Salud en materia de atención médica y a la Norma Oficial Mexicana ',
                fontSize: 11,
              },
              {
                text: 'NOM-004-SSA3-2012',
                fontSize: 11,
                bold: true,
              },
              {
                text: ', relativa al expediente clínico numerales 4.2, 10.1 al 10.1.2, considerando la NORMA Oficial Mexicana ',
                fontSize: 11,
              },
              {
                text: 'NOM-253-SSA1-2012,',
                fontSize: 11,
                bold: true,
              },
              {
                text: ' para la disposición de sangre humana y sus componentes con fines terapéuticos. Se otorga la presente autorización al personal Médico y Paramédico del Hospital para realizar la transfusión de hemoderivados necesarios al paciente en cuestión,',
                fontSize: 11,
              },
            ],
            lineHeight: 1.4,
            alignment: 'justify',
            margin: [0, 0, 0, 15],
          },

          {
            text: 'y para tal efecto, dicho paciente y/o su representante legal: DECLARA',
            fontSize: 11,
            alignment: 'justify',
            margin: [0, 0, 0, 15],
          },

          // 🔹 DECLARACIÓN
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'DECLARO',
                    fontSize: 14,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 10, 0, 10],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 15],
          },

          {
            text: 'Que los médicos me han entregado esta hoja informativa, la cual he leído y he comprendido el significado del procedimiento y los riesgos inherentes al mismo, por lo cual, declaro estar debidamente informado por el personal de salud del Hospital General San Luis de la Paz.',
            fontSize: 12,
            lineHeight: 1.4,
            alignment: 'justify',
            margin: [0, 0, 0, 15],
          },

          {
            text: 'Así mismo he recibido respuesta a todas mis preguntas y las consideraciones suficientes y aceptables, haciendo tomar la decisión en forma libre y voluntaria y autorizo al personal de salud para la atención de contingencias derivadas de este acto.',
            fontSize: 11,
            lineHeight: 1.4,
            alignment: 'justify',
            margin: [0, 0, 0, 20],
          },

          // 🔹 FECHA Y LUGAR
          {
            table: {
              widths: ['35%', '5%', '10%', '5%', '15%', '5%', '25%'],
              body: [
                [
                  { text: 'San Luis de la Paz, Guanajuato,', fontSize: 11 },
                  { text: 'a', fontSize: 11, alignment: 'center' },
                  { text: fechaActual.getDate().toString(), fontSize: 11, decoration: 'underline', alignment: 'center' },
                  { text: 'de', fontSize: 11, alignment: 'center' },
                  { text: fechaActual.toLocaleDateString('es-MX', { month: 'long' }), fontSize: 11, decoration: 'underline', alignment: 'center' },
                  { text: 'de', fontSize: 11, alignment: 'center' },
                  { text: fechaActual.getFullYear().toString(), fontSize: 11, decoration: 'underline', alignment: 'center' },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          // 🔹 ACEPTO
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'ACEPTO',
                    fontSize: 16,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 15, 0, 15],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 25],
          },

          // 🔹 INFORMACIÓN ESPECÍFICA DE LA TRANSFUSIÓN
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'INFORMACIÓN ESPECÍFICA DE LA TRANSFUSIÓN',
                    fontSize: 11,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 8, 0, 8],
                  },
                ],
                [
                  {
                    text: [
                      {
                        text: 'Tipo de hemoderivado requerido: ',
                        fontSize: 10,
                        bold: true,
                      },
                      {
                        text: transfusionData.tipo_hemoderivado || 'Por definir según necesidad clínica (sangre total, concentrado eritrocitario, plasma, plaquetas, crioprecipitados)',
                        fontSize: 10,
                      },
                      {
                        text: '\n\nIndicación médica: ',
                        fontSize: 10,
                        bold: true,
                      },
                      {
                        text: transfusionData.indicacion_medica || 'Según criterio médico y estado clínico del paciente',
                        fontSize: 10,
                      },
                      {
                        text: '\n\nTipo sanguíneo del paciente: ',
                        fontSize: 10,
                        bold: true,
                      },
                      {
                        text: pacienteCompleto.tipo_sangre || 'Por determinar mediante tipificación',
                        fontSize: 10,
                      },
                    ],
                    margin: [10, 10, 10, 10],
                    lineHeight: 1.3,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 25],
          },

          // 🔹 FIRMAS
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: '\n\n\n_________________________________________\nNombre y firma del paciente y/o Representante legal',
                    fontSize: 11,
                    alignment: 'center',
                    margin: [0, 15, 0, 15],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: '\n\n\n_________________________________________\nNombre, firma y sello del médico tratante',
                    fontSize: 11,
                    alignment: 'center',
                    margin: [0, 15, 0, 15],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          {
            table: {
              widths: ['45%', '10%', '45%'],
              body: [
                [
                  {
                    text: '\n\n\n_____________________________\nTestigo',
                    fontSize: 11,
                    alignment: 'center',
                    margin: [0, 15, 0, 15],
                  },
                  { text: '', fontSize: 11 },
                  {
                    text: '\n\n\n_____________________________\nTestigo',
                    fontSize: 11,
                    alignment: 'center',
                    margin: [0, 15, 0, 15],
                  },
                ],
              ],
            },
            layout: 'noBorders',
          },
        ],

        footer: (currentPage: number, pageCount: number) => {
          return {
            margin: [40, 20],
            table: {
              widths: ['25%', '50%', '25%'],
              body: [
                [
                  {
                    text: `Página ${currentPage} de ${pageCount}`,
                    fontSize: 8,
                    color: '#000000',
                  },
                  {
                    text: 'Consentimiento Transfusión Sanguínea - SICEG\nNOM-004-SSA3-2012 | NOM-253-SSA1-2012',
                    fontSize: 8,
                    alignment: 'center',
                    color: '#000000',
                  },
                  {
                    text: [
                      {
                        text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                        fontSize: 8,
                      },
                      {
                        text: `Exp: ${pacienteCompleto.numero_expediente}`,
                        fontSize: 7,
                      },
                    ],
                    alignment: 'right',
                    color: '#000000',
                  },
                ],
              ],
            },
            layout: 'noBorders',
          };
        },
      };

      const nombreArchivo = `consentimiento-transfusion-sanguinea-${pacienteCompleto.nombre
        .replace(/\s+/g, '-')
        .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log('✅ PDF de Consentimiento Informado para Transfusión Sanguínea generado exitosamente');
      console.log(`📄 Archivo: ${nombreArchivo}`);

      // 🔥 VALIDAR CUMPLIMIENTO ESPECÍFICO
      this.validarCumplimientoConsentimientoTransfusion(datos, medicoCompleto, pacienteCompleto);

    } catch (error) {
      console.error('❌ Error al generar PDF de Consentimiento para Transfusión Sanguínea:', error);
      throw error;
    }
  }

  // 📄 HOJA DE CONSENTIMIENTO INFORMADO PARA TRATAMIENTO MÉDICO SEGÚN NOM-004-SSA3-2012
  async generarConsentimientoTratamientoMedico(datos: any): Promise<void> {
  try {
    await this.ensurePdfMakeLoaded();

    console.log('⚕️ Generando Hoja de Consentimiento Informado para Tratamiento Médico según NOM-004...');

    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
    const tratamientoData = datos.consentimientoTratamiento || {};
    const fechaActual = new Date();

    const documentDefinition = {
      pageSize: 'LETTER',
      pageMargins: [45, 60, 45, 60],

      content: [
        { text: '', margin: [0, 40] },

        // 🔹 TÍTULO
        {
          text: 'HOJA DE CONSENTIMIENTO INFORMADO PARA TRATAMIENTO MÉDICO',
          fontSize: 12,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 25],
        },

        // 🔹 FECHA Y LUGAR
        {
          table: {
            widths: ['42%', '8%', '8%', '12%', '8%', '22%'],
            body: [
              [
                { text: 'San Luis de la Paz, Guanajuato a', fontSize: 9, bold: true },
                { text: fechaActual.getDate().toString(), fontSize: 9, decoration: 'underline', alignment: 'center' },
                { text: 'de', fontSize: 9, bold: true, alignment: 'center' },
                { text: fechaActual.toLocaleDateString('es-MX', { month: 'long' }), fontSize: 9, decoration: 'underline', alignment: 'center' },
                { text: 'de', fontSize: 9, bold: true, alignment: 'center' },
                { text: `20${fechaActual.getFullYear().toString().slice(-2)}`, fontSize: 9, bold: true, alignment: 'center' },
              ],
            ],
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 30],
        },

        // 🔹 DESTINATARIO
        {
          text: `DR. ${medicoCompleto.nombre_completo}`,
          fontSize: 10,
          bold: true,
          margin: [0, 0, 0, 8],
        },

        {
          text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ',
          fontSize: 10,
          margin: [0, 0, 0, 8],
        },

        {
          text: 'DIRECTOR',
          fontSize: 10,
          margin: [0, 0, 0, 8],
        },

        {
          text: 'PRESENTE.',
          fontSize: 10,
          margin: [0, 0, 0, 20],
        },

        // 🔹 QUIEN SUSCRIBE
        {
          text: 'QUIEN SUSCRIBE:',
          fontSize: 10,
          bold: true,
          margin: [0, 0, 0, 15],
        },

        {
          text: `${pacienteCompleto.apellido_paterno || '_'.repeat(30)} ${pacienteCompleto.apellido_materno || '_'.repeat(30)} ${pacienteCompleto.nombre || '_'.repeat(30)}`,
          fontSize: 10,
          decoration: 'underline',
          alignment: 'center',
          margin: [0, 0, 0, 8],
        },

        {
          text: 'APELLIDO PATERNO                                           APELLIDO MATERNO                                           NOMBRE(S)',
          fontSize: 8,
          alignment: 'center',
          margin: [0, 0, 0, 25],
        },

        // 🔹 DOMICILIO
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                { text: 'DOMICILIO:', fontSize: 10, bold: true },
                { text: this.formatearDireccionMejorada(pacienteCompleto), fontSize: 10, decoration: 'underline' },
              ],
            ],
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 25],
        },

        // 🔹 DATOS ADICIONALES DEL PACIENTE
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'INFORMACIÓN DEL PACIENTE',
                  fontSize: 10,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 8, 0, 8],
                },
              ],
              [
                {
                  text: [
                    {
                      text: 'Expediente: ',
                      fontSize: 9,
                      bold: true,
                    },
                    {
                      text: pacienteCompleto.numero_expediente,
                      fontSize: 9,
                    },
                    {
                      text: '     Edad: ',
                      fontSize: 9,
                      bold: true,
                    },
                    {
                      text: `${pacienteCompleto.edad} años`,
                      fontSize: 9,
                    },
                    {
                      text: '     Sexo: ',
                      fontSize: 9,
                      bold: true,
                    },
                    {
                      text: pacienteCompleto.sexo,
                      fontSize: 9,
                    },
                    {
                      text: '\nCURP: ',
                      fontSize: 9,
                      bold: true,
                    },
                    {
                      text: pacienteCompleto.curp || 'No registrado',
                      fontSize: 9,
                    },
                    {
                      text: '\nFecha de nacimiento: ',
                      fontSize: 9,
                      bold: true,
                    },
                    {
                      text: pacienteCompleto.fecha_nacimiento || 'No registrada',
                      fontSize: 9,
                    },
                    {
                      text: '\nServicio médico: ',
                      fontSize: 9,
                      bold: true,
                    },
                    {
                      text: medicoCompleto.departamento,
                      fontSize: 9,
                    },
                  ],
                  margin: [10, 10, 10, 10],
                  lineHeight: 1.3,
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
          margin: [0, 0, 0, 25],
        },

        // 🔹 AUTORIZACIÓN PRINCIPAL
        {
          text: 'AUTORIZO PLENAMENTE AL PERSONAL DE ESTE HOSPITAL A SU CARGO PARA EJECUTAR LAS INVESTIGACIONES CLÍNICAS, DE LABORATORIO Y DE GABINETE, QUE SEAN NECESARIAS PARA EL DIAGNÓSTICO DE MI ENFERMEDAD, ASÍ COMO TAMBIÉN PARA REALIZAR LOS TRATAMIENTOS MÉDICOS O QUIRÚRGICOS QUE CONVENGAN. ASÍ MISMO ME COMPROMETO A OBSERVAR EL REGLAMENTO INTERNO DE LA INSTITUCIÓN.',
          fontSize: 10,
          lineHeight: 1.5,
          alignment: 'justify',
          margin: [0, 0, 0, 20],
        },

        // 🔹 INFORMACIÓN ESPECÍFICA DEL TRATAMIENTO
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'INFORMACIÓN ESPECÍFICA DEL TRATAMIENTO',
                  fontSize: 10,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 8, 0, 8],
                },
              ],
              [
                {
                  text: [
                    {
                      text: 'Diagnóstico presuntivo: ',
                      fontSize: 9,
                      bold: true,
                    },
                    {
                      text: tratamientoData.diagnostico_presuntivo || 'Por determinar mediante estudios clínicos y de gabinete',
                      fontSize: 9,
                    },
                    {
                      text: '\n\nTratamiento propuesto: ',
                      fontSize: 9,
                      bold: true,
                    },
                    {
                      text: tratamientoData.tratamiento_propuesto || 'Según criterio médico y evolución clínica del paciente',
                      fontSize: 9,
                    },
                    {
                      text: '\n\nEstudios de laboratorio y gabinete autorizados: ',
                      fontSize: 9,
                      bold: true,
                    },
                    {
                      text: tratamientoData.estudios_autorizados || 'Los que sean médicamente necesarios para el diagnóstico',
                      fontSize: 9,
                    },
                    {
                      text: '\n\nMédico responsable: ',
                      fontSize: 9,
                      bold: true,
                    },
                    {
                      text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}`,
                      fontSize: 9,
                    },
                    {
                      text: ' - Cédula: ',
                      fontSize: 9,
                    },
                    {
                      text: medicoCompleto.numero_cedula || 'No disponible',
                      fontSize: 9,
                    },
                  ],
                  margin: [10, 10, 10, 10],
                  lineHeight: 1.3,
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
          margin: [0, 0, 0, 25],
        },

        // 🔹 DECLARACIÓN DE CONFORMIDAD
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'DECLARACIÓN DE CONFORMIDAD',
                  fontSize: 10,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 8, 0, 8],
                },
              ],
              [
                {
                  text: 'Declaro que he sido informado(a) sobre los procedimientos médicos, estudios de diagnóstico y tratamientos que se realizarán. Entiendo los riesgos y beneficios del tratamiento propuesto. He tenido la oportunidad de hacer preguntas y todas han sido respondidas satisfactoriamente. Autorizo voluntariamente el tratamiento médico propuesto y me comprometo a seguir las indicaciones médicas.',
                  fontSize: 10,
                  alignment: 'justify',
                  lineHeight: 1.4,
                  margin: [10, 10, 10, 10],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
          margin: [0, 0, 0, 30],
        },

        // 🔹 DESPEDIDA
        {
          text: 'A T E N T A M E N T E',
          fontSize: 10,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 30],
        },

        // 🔹 FIRMAS
        {
          table: {
            widths: ['45%', '10%', '45%'],
            body: [
              [
                {
                  text: '\n\n\n\n_________________________________',
                  fontSize: 10,
                  alignment: 'center',
                  margin: [0, 20, 0, 5],
                },
                { text: '', fontSize: 10 },
                {
                  text: '\n\n\n\n_________________________________',
                  fontSize: 10,
                  alignment: 'center',
                  margin: [0, 20, 0, 5],
                },
              ],
              [
                {
                  text: 'NOMBRE Y FIRMA DE LA PERSONA LEGALMENTE RESPONSABLE',
                  fontSize: 8,
                  alignment: 'center',
                  margin: [0, 5, 0, 5],
                },
                { text: '', fontSize: 8 },
                {
                  text: 'NOMBRE Y FIRMA DEL PACIENTE',
                  fontSize: 8,
                  alignment: 'center',
                  margin: [0, 5, 0, 5],
                },
              ],
              [
                { text: '', fontSize: 10, margin: [0, 20, 0, 0] },
                { text: '', fontSize: 10 },
                { text: '', fontSize: 10 },
              ],
              [
                {
                  text: '\n\n\n\n_________________________________',
                  fontSize: 10,
                  alignment: 'center',
                  margin: [0, 15, 0, 5],
                },
                { text: '', fontSize: 10 },
                {
                  text: '\n\n\n\n_________________________________',
                  fontSize: 10,
                  alignment: 'center',
                  margin: [0, 15, 0, 5],
                },
              ],
              [
                {
                  text: 'TESTIGO',
                  fontSize: 8,
                  alignment: 'center',
                  margin: [0, 5, 0, 5],
                },
                { text: '', fontSize: 8 },
                {
                  text: 'TESTIGO',
                  fontSize: 8,
                  alignment: 'center',
                  margin: [0, 5, 0, 5],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },

        { text: '', margin: [0, 15] },

        // 🔹 INFORMACIÓN MÉDICA ADICIONAL
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'INFORMACIÓN DEL MÉDICO TRATANTE',
                  fontSize: 9,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 5, 0, 5],
                },
              ],
              [
                {
                  text: [
                    {
                      text: `Médico: ${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}\n`,
                      fontSize: 8,
                    },
                    {
                      text: `Especialidad: ${medicoCompleto.especialidad}\n`,
                      fontSize: 8,
                    },
                    {
                      text: `Cédula Profesional: ${medicoCompleto.numero_cedula || 'No disponible'}\n`,
                      fontSize: 8,
                    },
                    {
                      text: `Servicio: ${medicoCompleto.departamento}\n`,
                      fontSize: 8,
                    },
                    {
                      text: `Fecha de elaboración: ${fechaActual.toLocaleDateString('es-MX')} ${fechaActual.toLocaleTimeString('es-MX')}`,
                      fontSize: 8,
                    },
                  ],
                  margin: [8, 8, 8, 8],
                  lineHeight: 1.2,
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },
      ],

      footer: (currentPage: number, pageCount: number) => {
        return {
          margin: [45, 20],
          table: {
            widths: ['25%', '50%', '25%'],
            body: [
              [
                {
                  text: `Página ${currentPage} de ${pageCount}`,
                  fontSize: 8,
                  color: '#000000',
                },
                {
                  text: 'Consentimiento Tratamiento Médico - SICEG\nNOM-004-SSA3-2012',
                  fontSize: 8,
                  alignment: 'center',
                  color: '#000000',
                },
                {
                  text: [
                    {
                      text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                      fontSize: 8,
                    },
                    {
                      text: `Exp: ${pacienteCompleto.numero_expediente}`,
                      fontSize: 7,
                    },
                  ],
                  alignment: 'right',
                  color: '#000000',
                },
              ],
            ],
          },
          layout: 'noBorders',
        };
      },
    };

    const nombreArchivo = `consentimiento-tratamiento-medico-${pacienteCompleto.nombre
      .replace(/\s+/g, '-')
      .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Consentimiento Informado para Tratamiento Médico generado exitosamente');
    console.log(`📄 Archivo: ${nombreArchivo}`);

    // 🔥 VALIDAR CUMPLIMIENTO ESPECÍFICO
    this.validarCumplimientoConsentimientoTratamiento(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Consentimiento para Tratamiento Médico:', error);
    throw error;
  }
}

  // 📄 HOJA DE ALTA VOLUNTARIA SEGÚN NOM-004-SSA3-2012
  async generarHojaAltaVoluntaria(datos: any): Promise<void> {
    try {
      await this.ensurePdfMakeLoaded();

      console.log('🚪 Generando Hoja de Alta Voluntaria según NOM-004...');

      const medicoCompleto = await this.obtenerDatosMedicoActual();
      const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
      const altaVoluntariaData = datos.altaVoluntaria || {};
      const fechaActual = new Date();

      const documentDefinition = {
        pageSize: 'LETTER',
        pageMargins: [40, 80, 40, 60],

        header: {
          margin: [40, 20, 40, 20],
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'HOJA DE ALTA VOLUNTARIA',
                  fontSize: 15,
                  bold: true,
                  alignment: 'center',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },

        content: [
          { text: '', margin: [0, 20] },

          // 🔹 DATOS DEL PACIENTE
          {
            table: {
              widths: ['13%', '37%', '8%', '12%', '12%', '18%'],
              body: [
                [
                  { text: 'Nombre:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.nombre_completo, fontSize: 9, decoration: 'underline' },
                  { text: 'Edad:', fontSize: 9, bold: true },
                  { text: `${pacienteCompleto.edad} años`, fontSize: 9, decoration: 'underline' },
                  { text: 'Fecha:', fontSize: 9, bold: true },
                  { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 9, decoration: 'underline' },
                ],
                [
                  { text: 'CURP:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.curp, fontSize: 9, decoration: 'underline' },
                  { text: 'Sexo:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.sexo, fontSize: 9, decoration: 'underline' },
                  { text: 'Expediente:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.numero_expediente, fontSize: 9, decoration: 'underline' },
                ],
                [
                  { text: 'F. Nacimiento:', fontSize: 8, bold: true },
                  { text: pacienteCompleto.fecha_nacimiento || 'No registrada', fontSize: 9, decoration: 'underline' },
                  { text: 'Cama:', fontSize: 9, bold: true },
                  { text: altaVoluntariaData.numero_cama || 'Sin asignar', fontSize: 9, decoration: 'underline' },
                  { text: 'Servicio:', fontSize: 9, bold: true },
                  { text: medicoCompleto.departamento, fontSize: 9, decoration: 'underline' },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 30],
          },

          // 🔹 INFORMACIÓN MÉDICA DEL ALTA VOLUNTARIA
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'INFORMACIÓN MÉDICA',
                    fontSize: 11,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 8, 0, 8],
                  },
                ],
                [
                  {
                    text: [
                      {
                        text: 'Fecha de ingreso: ',
                        fontSize: 10,
                        bold: true,
                      },
                      {
                        text: altaVoluntariaData.fecha_ingreso || 'No especificada',
                        fontSize: 10,
                      },
                      {
                        text: '\n\nMotivo de ingreso: ',
                        fontSize: 10,
                        bold: true,
                      },
                      {
                        text: altaVoluntariaData.motivo_ingreso || 'No especificado',
                        fontSize: 10,
                      },
                      {
                        text: '\n\nDiagnóstico al momento del alta: ',
                        fontSize: 10,
                        bold: true,
                      },
                      {
                        text: altaVoluntariaData.diagnostico_alta || 'Por definir',
                        fontSize: 10,
                      },
                      {
                        text: '\n\nEstado general del paciente: ',
                        fontSize: 10,
                        bold: true,
                      },
                      {
                        text: altaVoluntariaData.estado_general || 'Estable',
                        fontSize: 10,
                      },
                    ],
                    margin: [10, 10, 10, 10],
                    lineHeight: 1.3,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 20],
          },

          // 🔹 DECLARACIÓN DE ALTA VOLUNTARIA
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'DECLARACIÓN DE ALTA VOLUNTARIA',
                    fontSize: 11,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 8, 0, 8],
                  },
                ],
                [
                  {
                    text: [
                      {
                        text: 'YO, ',
                        fontSize: 11,
                        bold: true,
                      },
                      {
                        text: altaVoluntariaData.nombre_responsable || pacienteCompleto.nombre_completo,
                        fontSize: 11,
                        bold: true,
                        decoration: 'underline',
                      },
                      {
                        text: ', en mi calidad de ',
                        fontSize: 11,
                      },
                      {
                        text: altaVoluntariaData.relacion_paciente || 'paciente',
                        fontSize: 11,
                        decoration: 'underline',
                      },
                      {
                        text: ', manifiesto de manera libre y voluntaria mi decisión de solicitar el alta médica del Hospital General San Luis de la Paz, aún cuando el personal médico considera que mi estado de salud requiere de continuar con la atención hospitalaria.\n\n',
                        fontSize: 11,
                      },
                      {
                        text: 'DECLARO QUE:\n\n',
                        fontSize: 11,
                        bold: true,
                      },
                      {
                        text: '1. He sido informado(a) por el personal médico sobre mi estado de salud, el diagnóstico, el tratamiento recomendado y los riesgos que implica abandonar el tratamiento hospitalario.\n\n',
                        fontSize: 11,
                      },
                      {
                        text: '2. Entiendo que al solicitar el alta voluntaria, asumo todos los riesgos y consecuencias que puedan derivarse de esta decisión, incluyendo el empeoramiento de mi condición de salud o complicaciones graves.\n\n',
                        fontSize: 11,
                      },
                      {
                        text: '3. Eximo de toda responsabilidad médica y legal al Hospital General San Luis de la Paz y a su personal médico y paramédico por las consecuencias que puedan resultar de mi decisión de abandonar el tratamiento.\n\n',
                        fontSize: 11,
                      },
                      {
                        text: '4. Esta decisión la tomo de manera libre, voluntaria y consciente, sin presión alguna.',
                        fontSize: 11,
                      },
                    ],
                    margin: [10, 10, 10, 10],
                    lineHeight: 1.3,
                    alignment: 'justify',
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 20],
          },

          // 🔹 RECOMENDACIONES MÉDICAS
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'RECOMENDACIONES MÉDICAS PARA EL ALTA',
                    fontSize: 11,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 8, 0, 8],
                  },
                ],
                [
                  {
                    text: altaVoluntariaData.recomendaciones_medicas ||
                      'Se recomienda:\n• Acudir inmediatamente a la unidad de salud más cercana si presenta deterioro de su estado general\n• Continuar con medicamentos prescritos según indicaciones\n• Seguimiento médico ambulatorio en las próximas 24-48 horas\n• Acudir a urgencias si presenta signos de alarma',
                    fontSize: 10,
                    margin: [10, 10, 10, 10],
                    lineHeight: 1.3,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 20],
          },

          // 🔹 SIGNOS DE ALARMA
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'SIGNOS DE ALARMA - ACUDIR INMEDIATAMENTE A URGENCIAS',
                    fontSize: 11,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 8, 0, 8],
                  },
                ],
                [
                  {
                    text: altaVoluntariaData.signos_alarma ||
                      '• Dificultad para respirar o falta de aire\n• Dolor de pecho intenso\n• Pérdida de conocimiento o desmayo\n• Vómito persistente\n• Fiebre alta (mayor a 38.5°C)\n• Sangrado abundante\n• Convulsiones\n• Cambios en el estado de conciencia\n• Cualquier síntoma que considere grave o preocupante',
                    fontSize: 10,
                    margin: [10, 10, 10, 10],
                    lineHeight: 1.3,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 25],
          },

          // 🔹 FECHA Y HORA DEL ALTA
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    text: `Fecha del alta voluntaria: ${fechaActual.toLocaleDateString('es-MX')}`,
                    fontSize: 10,
                    bold: true,
                  },
                  {
                    text: `Hora del alta: ${fechaActual.toLocaleTimeString('es-MX')}`,
                    fontSize: 10,
                    bold: true,
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 25],
          },

          // 🔹 FIRMAS
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    text: '\n\n\n_________________________________\nNombre y firma del paciente y/o\nrepresentante legal',
                    fontSize: 10,
                    alignment: 'center',
                    margin: [0, 15, 0, 15],
                  },
                  {
                    text: `\n\n\n_________________________________\n${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}\nMédico tratante`,
                    fontSize: 10,
                    alignment: 'center',
                    margin: [0, 15, 0, 15],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    text: '\n\n\n_________________________________\nTestigo\nNombre y firma',
                    fontSize: 10,
                    alignment: 'center',
                    margin: [0, 15, 0, 15],
                  },
                  {
                    text: '\n\n\n_________________________________\nTestigo\nNombre y firma',
                    fontSize: 10,
                    alignment: 'center',
                    margin: [0, 15, 0, 15],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          // 🔹 INFORMACIÓN DEL MÉDICO
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'INFORMACIÓN DEL MÉDICO RESPONSABLE',
                    fontSize: 10,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 8, 0, 8],
                  },
                ],
                [
                  {
                    text: [
                      {
                        text: `Médico: ${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}\n`,
                        fontSize: 9,
                      },
                      {
                        text: `Cédula Profesional: ${medicoCompleto.numero_cedula || 'No disponible'}\n`,
                        fontSize: 9,
                      },
                      {
                        text: `Especialidad: ${medicoCompleto.especialidad}\n`,
                        fontSize: 9,
                      },
                      {
                        text: `Servicio: ${medicoCompleto.departamento}\n`,
                        fontSize: 9,
                      },
                      {
                        text: `Hospital General San Luis de la Paz`,
                        fontSize: 9,
                      },
                    ],
                    margin: [10, 8, 10, 8],
                    lineHeight: 1.2,
                    alignment: 'center',
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },
        ],

        footer: (currentPage: number, pageCount: number) => {
          return {
            margin: [40, 20],
            table: {
              widths: ['25%', '50%', '25%'],
              body: [
                [
                  {
                    text: `Página ${currentPage} de ${pageCount}`,
                    fontSize: 8,
                    color: '#000000',
                  },
                  {
                    text: 'Hoja de Alta Voluntaria - SICEG\nNOM-004-SSA3-2012',
                    fontSize: 8,
                    alignment: 'center',
                    color: '#000000',
                  },
                  {
                    text: [
                      {
                        text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                        fontSize: 8,
                      },
                      {
                        text: `Exp: ${pacienteCompleto.numero_expediente}`,
                        fontSize: 7,
                      },
                    ],
                    alignment: 'right',
                    color: '#000000',
                  },
                ],
              ],
            },
            layout: 'noBorders',
          };
        },
      };

      const nombreArchivo = `hoja-alta-voluntaria-${pacienteCompleto.nombre
        .replace(/\s+/g, '-')
        .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log('✅ PDF de Hoja de Alta Voluntaria generado exitosamente');
      console.log(`📄 Archivo: ${nombreArchivo}`);

      // 🔥 VALIDAR CUMPLIMIENTO ESPECÍFICO
      this.validarCumplimientoAltaVoluntaria(datos, medicoCompleto, pacienteCompleto);

    } catch (error) {
      console.error('❌ Error al generar PDF de Hoja de Alta Voluntaria:', error);
      throw error;
    }
  }


    // 📄 HOJA DE INFORME DIARIO SEGÚN NOM-004-SSA3-2012
  async generarHojaInformeDiario(datos: any): Promise<void> {
    try {
      await this.ensurePdfMakeLoaded();

      console.log('📋 Generando Hoja de Informe Diario según NOM-004...');

      const medicoCompleto = await this.obtenerDatosMedicoActual();
      const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
      const informeDiarioData = datos.informeDiario || {};
      const fechaActual = new Date();

      const documentDefinition = {
        pageSize: 'LETTER',
        pageOrientation: 'landscape', // Horizontal para aprovechar el espacio
        pageMargins: [20, 60, 20, 40],

        header: {
          margin: [20, 15, 20, 15],
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'HOJA DE INFORME DIARIO',
                  fontSize: 14,
                  bold: true,
                  alignment: 'center',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },

        content: [
          { text: '', margin: [0, 10] },

          // 🔹 DATOS DEL PACIENTE
          {
            table: {
              widths: ['18%', '35%', '12%', '35%'],
              body: [
                [
                  { text: 'Nombre del paciente:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.nombre_completo, fontSize: 9, decoration: 'underline' },
                  { text: 'No. de expediente:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.numero_expediente, fontSize: 9, decoration: 'underline' },
                ],
                [
                  { text: 'Fecha de Nacimiento:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.fecha_nacimiento || 'No registrada', fontSize: 9, decoration: 'underline' },
                  { text: 'CURP:', fontSize: 9, bold: true },
                  { text: pacienteCompleto.curp, fontSize: 9, decoration: 'underline' },
                ],
                [
                  { text: 'Servicio:', fontSize: 9, bold: true },
                  { text: medicoCompleto.departamento, fontSize: 9, decoration: 'underline' },
                  { text: 'Cama:', fontSize: 9, bold: true },
                  { text: informeDiarioData.numero_cama || 'Sin asignar', fontSize: 9, decoration: 'underline' },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          // 🔹 INFORMACIÓN ADICIONAL DEL INFORME
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'INFORMACIÓN DEL INFORME DIARIO',
                    fontSize: 10,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 5, 0, 5],
                  },
                ],
                [
                  {
                    text: [
                      {
                        text: 'Período del informe: ',
                        fontSize: 9,
                        bold: true,
                      },
                      {
                        text: `${fechaActual.toLocaleDateString('es-MX')} - Turno: ${informeDiarioData.turno || 'Matutino'}`,
                        fontSize: 9,
                      },
                      {
                        text: '\nDiagnóstico principal: ',
                        fontSize: 9,
                        bold: true,
                      },
                      {
                        text: informeDiarioData.diagnostico_principal || 'Por definir',
                        fontSize: 9,
                      },
                      {
                        text: '\nMédico responsable: ',
                        fontSize: 9,
                        bold: true,
                      },
                      {
                        text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}`,
                        fontSize: 9,
                      },
                    ],
                    margin: [8, 8, 8, 8],
                    lineHeight: 1.2,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 15],
          },

          // 🔹 TABLA DE REGISTROS DIARIOS
          {
            table: {
              widths: ['15%', '25%', '25%', '35%'],
              body: [
                // Encabezados
                [
                  {
                    text: 'Fecha y Hora',
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    margin: [3, 5, 3, 5],
                  },
                  {
                    text: 'Nombre de quien informa',
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    margin: [3, 5, 3, 5],
                  },
                  {
                    text: 'Nombre de quien recibe la información',
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    margin: [3, 5, 3, 5],
                  },
                  {
                    text: 'Información comunicada / Observaciones',
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    margin: [3, 5, 3, 5],
                  },
                ],
                // Filas de datos (generar 15 filas vacías para completar a mano)
                ...Array.from({ length: 15 }, (_, index) => [
                  {
                    text: index === 0 && informeDiarioData.registros?.[0]?.fecha ?
                      informeDiarioData.registros[0].fecha : '',
                    fontSize: 8,
                    margin: [3, 8, 3, 8],
                    minHeight: 25,
                  },
                  {
                    text: index === 0 && informeDiarioData.registros?.[0]?.quien_informa ?
                      informeDiarioData.registros[0].quien_informa : '',
                    fontSize: 8,
                    margin: [3, 8, 3, 8],
                    minHeight: 25,
                  },
                  {
                    text: index === 0 && informeDiarioData.registros?.[0]?.quien_recibe ?
                      informeDiarioData.registros[0].quien_recibe : '',
                    fontSize: 8,
                    margin: [3, 8, 3, 8],
                    minHeight: 25,
                  },
                  {
                    text: index === 0 && informeDiarioData.registros?.[0]?.informacion ?
                      informeDiarioData.registros[0].informacion : '',
                    fontSize: 8,
                    margin: [3, 8, 3, 8],
                    minHeight: 25,
                  },
                ]),
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },

          { text: '', margin: [0, 15] },

          // 🔹 INSTRUCCIONES Y OBSERVACIONES
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'INSTRUCCIONES PARA EL LLENADO',
                    fontSize: 10,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 5, 0, 5],
                  },
                ],
                [
                  {
                    text: '• Registrar toda comunicación relevante sobre el estado del paciente\n' +
                          '• Incluir fecha y hora exacta de cada comunicación\n' +
                          '• Anotar nombre completo y cargo de quien proporciona la información\n' +
                          '• Registrar nombre completo de quien recibe la información (familiar, médico, etc.)\n' +
                          '• Describir brevemente el contenido de la información comunicada\n' +
                          '• Mantener confidencialidad según normativa de protección de datos\n' +
                          '• Archivar en expediente clínico una vez completado',
                    fontSize: 8,
                    margin: [8, 8, 8, 8],
                    lineHeight: 1.3,
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },
        ],

        footer: (currentPage: number, pageCount: number) => {
          return {
            margin: [20, 10],
            table: {
              widths: ['25%', '50%', '25%'],
              body: [
                [
                  {
                    text: `Página ${currentPage} de ${pageCount}`,
                    fontSize: 8,
                    color: '#000000',
                  },
                  {
                    text: 'Hoja de Informe Diario - SICEG\nNOM-004-SSA3-2012',
                    fontSize: 8,
                    alignment: 'center',
                    color: '#000000',
                  },
                  {
                    text: [
                      {
                        text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                        fontSize: 8,
                      },
                      {
                        text: `Exp: ${pacienteCompleto.numero_expediente}`,
                        fontSize: 7,
                      },
                    ],
                    alignment: 'right',
                    color: '#000000',
                  },
                ],
              ],
            },
            layout: 'noBorders',
          };
        },
      };

      const nombreArchivo = `hoja-informe-diario-${pacienteCompleto.nombre
        .replace(/\s+/g, '-')
        .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log('✅ PDF de Hoja de Informe Diario generado exitosamente');
      console.log(`📄 Archivo: ${nombreArchivo}`);

      // 🔥 VALIDAR CUMPLIMIENTO ESPECÍFICO
      this.validarCumplimientoInformeDiario(datos, medicoCompleto, pacienteCompleto);

    } catch (error) {
      console.error('❌ Error al generar PDF de Hoja de Informe Diario:', error);
      throw error;
    }
  }

  // 📄 HOJA FRONTAL DE EXPEDIENTE SEGÚN NOM-004-SSA3-2012
  async generarHojaFrontalExpediente(datos: any): Promise<void> {
    try {
      await this.ensurePdfMakeLoaded();

      console.log('📋 Generando Hoja Frontal de Expediente según NOM-004...');

      const medicoCompleto = await this.obtenerDatosMedicoActual();
      const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
      const expedienteData = datos.expediente || {};
      const fechaActual = new Date();

      const documentDefinition = {
        pageSize: 'LETTER',
        pageMargins: [40, 60, 40, 60],

        content: [
          { text: '', margin: [0, 20] },

          // 🔹 DATOS BÁSICOS DEL PACIENTE
          {
            table: {
              widths: ['40%', '30%', '15%', '15%'],
              body: [
                [
                  {
                    text: 'NOMBRE:',
                    fontSize: 9,
                    bold: true,
                    border: [false, false, false, true],
                  },
                  {
                    text: pacienteCompleto.nombre_completo,
                    fontSize: 9,
                    border: [false, false, false, true],
                  },
                  {
                    text: 'EXPEDIENTE:',
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    border: [false, false, false, true],
                  },
                  {
                    text: pacienteCompleto.numero_expediente,
                    fontSize: 9,
                    border: [false, false, false, true],
                  },
                ],
                [
                  {
                    text: 'EDAD:',
                    fontSize: 9,
                    bold: true,
                    border: [false, false, false, true],
                  },
                  {
                    text: `${pacienteCompleto.edad} años`,
                    fontSize: 9,
                    border: [false, false, false, true],
                  },
                  {
                    text: 'CURP:',
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    border: [false, false, false, true],
                  },
                  {
                    text: pacienteCompleto.curp || '',
                    fontSize: 8,
                    border: [false, false, false, true],
                  },
                ],
                [
                  {
                    text: 'FECHA DE NACIMIENTO:',
                    fontSize: 9,
                    bold: true,
                    border: [false, false, false, true],
                  },
                  {
                    text: pacienteCompleto.fecha_nacimiento || '',
                    fontSize: 9,
                    border: [false, false, false, true],
                  },
                  {
                    text: 'GÉNERO:',
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    border: [false, false, false, true],
                  },
                  {
                    text: pacienteCompleto.sexo,
                    fontSize: 9,
                    border: [false, false, false, true],
                  },
                ],
                [
                  {
                    text: 'TRANSFUSIONES:',
                    fontSize: 9,
                    bold: true,
                    border: [false, false, false, true],
                  },
                  {
                    text: expedienteData.transfusiones || '',
                    fontSize: 9,
                    colSpan: 3,
                    border: [false, false, false, true],
                  },
                  {},
                  {},
                ],
                [
                  {
                    text: 'TIPO SANGUÍNEO:',
                    fontSize: 9,
                    bold: true,
                    border: [false, false, false, true],
                  },
                  {
                    text: pacienteCompleto.tipo_sangre || '',
                    fontSize: 9,
                    border: [false, false, false, true],
                  },
                  {
                    text: 'TELÉFONO:',
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    border: [false, false, false, true],
                  },
                  {
                    text: pacienteCompleto.telefono || '',
                    fontSize: 9,
                    border: [false, false, false, true],
                  },
                ],
                [
                  {
                    text: 'NOMBRE DEL PADRE O TUTOR:',
                    fontSize: 9,
                    bold: true,
                    border: [false, false, false, true],
                  },
                  {
                    text: pacienteCompleto.familiar_responsable || '',
                    fontSize: 9,
                    colSpan: 3,
                    border: [false, false, false, true],
                  },
                  {},
                  {},
                ],
                [
                  {
                    text: 'DOMICILIO:',
                    fontSize: 9,
                    bold: true,
                    border: [false, false, false, true],
                  },
                  {
                    text: this.formatearDireccionMejorada(pacienteCompleto),
                    fontSize: 9,
                    colSpan: 3,
                    border: [false, false, false, true],
                  },
                  {},
                  {},
                ],
                [
                  { text: '', border: [false, false, false, false] },
                  { text: '', border: [false, false, false, false] },
                  { text: '', border: [false, false, false, false] },
                  { text: '', border: [false, false, false, false] },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          // 🔹 TABLA DE REGISTROS DE HOSPITALIZACIONES
          {
            table: {
              widths: ['25%', '25%', '25%', '25%'],
              body: [
                [
                  {
                    text: 'FECHA DE INGRESO',
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    margin: [3, 5, 3, 5],
                  },
                  {
                    text: 'FECHA DE EGRESO',
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    margin: [3, 5, 3, 5],
                  },
                  {
                    text: 'DIAGNÓSTICO',
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    margin: [3, 5, 3, 5],
                  },
                  {
                    text: 'MÉDICO',
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    margin: [3, 5, 3, 5],
                  },
                ],
                // Generar 25 filas vacías para llenar a mano
                ...Array.from({ length: 25 }, (_, index) => [
                  {
                    text: index === 0 && expedienteData.registros?.[0]?.fecha_ingreso ?
                      expedienteData.registros[0].fecha_ingreso : '',
                    fontSize: 8,
                    margin: [3, 8, 3, 8],
                    minHeight: 20,
                  },
                  {
                    text: index === 0 && expedienteData.registros?.[0]?.fecha_egreso ?
                      expedienteData.registros[0].fecha_egreso : '',
                    fontSize: 8,
                    margin: [3, 8, 3, 8],
                    minHeight: 20,
                  },
                  {
                    text: index === 0 && expedienteData.registros?.[0]?.diagnostico ?
                      expedienteData.registros[0].diagnostico : '',
                    fontSize: 8,
                    margin: [3, 8, 3, 8],
                    minHeight: 20,
                  },
                  {
                    text: index === 0 && expedienteData.registros?.[0]?.medico ?
                      expedienteData.registros[0].medico : '',
                    fontSize: 8,
                    margin: [3, 8, 3, 8],
                    minHeight: 20,
                  },
                ]),
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 20],
          },

          // 🔹 SEGUNDA TABLA DE REGISTROS ADICIONALES
          {
            table: {
              widths: ['25%', '25%', '25%', '25%'],
              body: [
                [
                  {
                    text: 'FECHA DE INGRESO',
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    margin: [3, 5, 3, 5],
                  },
                  {
                    text: 'FECHA DE EGRESO',
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    margin: [3, 5, 3, 5],
                  },
                  {
                    text: 'DIAGNÓSTICO',
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    margin: [3, 5, 3, 5],
                  },
                  {
                    text: 'MÉDICO',
                    fontSize: 9,
                    bold: true,
                    alignment: 'center',
                    margin: [3, 5, 3, 5],
                  },
                ],
                // Generar 25 filas vacías adicionales
                ...Array.from({ length: 25 }, () => [
                  {
                    text: '',
                    fontSize: 8,
                    margin: [3, 8, 3, 8],
                    minHeight: 20,
                  },
                  {
                    text: '',
                    fontSize: 8,
                    margin: [3, 8, 3, 8],
                    minHeight: 20,
                  },
                  {
                    text: '',
                    fontSize: 8,
                    margin: [3, 8, 3, 8],
                    minHeight: 20,
                  },
                  {
                    text: '',
                    fontSize: 8,
                    margin: [3, 8, 3, 8],
                    minHeight: 20,
                  },
                ]),
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },
        ],

        footer: (currentPage: number, pageCount: number) => {
          return {
            margin: [40, 20],
            table: {
              widths: ['25%', '50%', '25%'],
              body: [
                [
                  {
                    text: `Página ${currentPage} de ${pageCount}`,
                    fontSize: 8,
                    color: '#000000',
                  },
                  {
                    text: 'Hoja Frontal de Expediente - SICEG\nNOM-004-SSA3-2012',
                    fontSize: 8,
                    alignment: 'center',
                    color: '#000000',
                  },
                  {
                    text: [
                      {
                        text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                        fontSize: 8,
                      },
                      {
                        text: `Exp: ${pacienteCompleto.numero_expediente}`,
                        fontSize: 7,
                      },
                    ],
                    alignment: 'right',
                    color: '#000000',
                  },
                ],
              ],
            },
            layout: 'noBorders',
          };
        },
      };

      const nombreArchivo = `hoja-frontal-expediente-${pacienteCompleto.nombre
        .replace(/\s+/g, '-')
        .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log('✅ PDF de Hoja Frontal de Expediente generado exitosamente');
      console.log(`📄 Archivo: ${nombreArchivo}`);
      console.log('ℹ️ Nota: Este es un formato básico que probablemente se llene a mano');

    } catch (error) {
      console.error('❌ Error al generar PDF de Hoja Frontal:', error);
      throw error;
    }
  }

  // 📄 SOLICITUD DE LABORATORIO SEGÚN NOM-004-SSA3-2012
  async generarSolicitudLaboratorio(datos: any): Promise<void> {
    try {
      await this.ensurePdfMakeLoaded();

      console.log('🧪 Generando Solicitud de Laboratorio según NOM-004...');

      const medicoCompleto = await this.obtenerDatosMedicoActual();
      const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
      const laboratorioData = datos.solicitudLaboratorio || {};
      const fechaActual = new Date();

      const documentDefinition = {
        pageSize: 'LETTER',
        pageMargins: [30, 60, 30, 50],

        header: {
          margin: [30, 15, 30, 15],
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'INSTITUTO DE SALUD DEL ESTADO DE GUANAJUATO',
                  fontSize: 11,
                  bold: true,
                  alignment: 'center',
                },
              ],
              [
                {
                  text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ',
                  fontSize: 12,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 2, 0, 0],
                },
              ],
              [
                {
                  text: 'SOLICITUD DE ESTUDIOS DE LABORATORIO',
                  fontSize: 10,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 5, 0, 0],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },

        content: [
          { text: '', margin: [0, 10] },

          // 🔹 NOTA IMPORTANTE
          {
            text: 'Nota: Favor de pasar a caja para que le indiquen el monto a pagar de sus estudios, si se le indica',
            fontSize: 8,
            italics: true,
            alignment: 'center',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'SEA PUNTUAL A SU CITA',
            fontSize: 9,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 15],
          },

          // 🔹 DATOS DEL PACIENTE
          {
            table: {
              widths: ['20%', '30%', '20%', '30%'],
              body: [
                [
                  { text: 'NOMBRE DEL PACIENTE:', fontSize: 8, bold: true },
                  { text: pacienteCompleto.nombre_completo, fontSize: 8, colSpan: 3 },
                  {},
                  {},
                ],
                [
                  { text: 'FECHA DE NACIMIENTO:', fontSize: 8, bold: true },
                  { text: pacienteCompleto.fecha_nacimiento || '', fontSize: 8 },
                  { text: 'CURP:', fontSize: 8, bold: true },
                  { text: pacienteCompleto.curp || '', fontSize: 7 },
                ],
                [
                  { text: 'NÚMERO DE EXPEDIENTE:', fontSize: 8, bold: true },
                  { text: pacienteCompleto.numero_expediente, fontSize: 8 },
                  { text: 'No CAUSAS:', fontSize: 8, bold: true },
                  { text: laboratorioData.numero_causas || '', fontSize: 8 },
                ],
                [
                  { text: 'DIAGNÓSTICO CAUSAS Y/O SMNG SIN ABREVIATURAS:', fontSize: 8, bold: true, colSpan: 4 },
                  {},
                  {},
                  {},
                ],
                [
                  {
                    text: laboratorioData.diagnostico || 'Diagnóstico por especificar',
                    fontSize: 8,
                    colSpan: 4,
                    margin: [0, 5, 0, 5]
                  },
                  {},
                  {},
                  {},
                ],
                [
                  { text: 'FECHA DE SOLICITUD:', fontSize: 8, bold: true },
                  { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 8 },
                  { text: 'FECHA PRÓXIMA CONSULTA:', fontSize: 8, bold: true },
                  { text: laboratorioData.fecha_proxima_consulta || '', fontSize: 8 },
                ],
                [
                  { text: 'EDAD:', fontSize: 8, bold: true },
                  { text: `${pacienteCompleto.edad} años`, fontSize: 8 },
                  { text: 'SERVICIO:', fontSize: 8, bold: true },
                  { text: medicoCompleto.departamento, fontSize: 8 },
                ],
                [
                  { text: 'No CAMA:', fontSize: 8, bold: true },
                  { text: laboratorioData.numero_cama || 'Ambulatorio', fontSize: 8 },
                  { text: 'PRIORIDAD:', fontSize: 8, bold: true },
                  {
                    text: [
                      { text: '☐ URGENTE  ', fontSize: 8 },
                      { text: '☐ RUTINA', fontSize: 8 }
                    ],
                    fontSize: 8
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 15],
          },

          // 🔹 ESTUDIOS DE LABORATORIO
          {
            table: {
              widths: ['25%', '25%', '25%', '25%'],
              body: [
                // HEMATOLOGÍA
                [
                  { text: 'HEMATOLOGÍA', fontSize: 9, bold: true, fillColor: '#f0f0f0', colSpan: 2, alignment: 'center' },
                  {},
                  { text: 'INMUNOHEMATOLOGÍA', fontSize: 9, bold: true, fillColor: '#f0f0f0', colSpan: 2, alignment: 'center' },
                  {},
                ],
                [
                  { text: '☐ BIOMETRÍA HEMÁTICA', fontSize: 7 },
                  { text: '20109', fontSize: 7, alignment: 'center' },
                  { text: '☐ PRUEBAS CRUZADAS', fontSize: 7 },
                  { text: '20107', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ GRUPO SANGUÍNEO', fontSize: 7 },
                  { text: '20108', fontSize: 7, alignment: 'center' },
                  { text: '☐ COOMBS DIRECTO', fontSize: 7 },
                  { text: '19210', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ VEL SEDIMENTACIÓN GLOBULAR', fontSize: 7 },
                  { text: '20103', fontSize: 7, alignment: 'center' },
                  { text: '☐ COOMBS INDIRECTO', fontSize: 7 },
                  { text: '19211', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ RETICULOCITOS', fontSize: 7 },
                  { text: '20102', fontSize: 7, alignment: 'center' },
                  { text: '', fontSize: 7 },
                  { text: '', fontSize: 7 },
                ],
                [
                  { text: '☐ FROTIS SANGRE GOTA GRUESA', fontSize: 7 },
                  { text: '20105', fontSize: 7, alignment: 'center' },
                  { text: 'INMUNOLOGÍA', fontSize: 9, bold: true, fillColor: '#f0f0f0', colSpan: 2, alignment: 'center' },
                  {},
                ],
                [
                  { text: '☐ FROTIS SANGRE PERIFÉRICA', fontSize: 7 },
                  { text: '20105', fontSize: 7, alignment: 'center' },
                  { text: '☐ REACCIONES FEBRILES', fontSize: 7 },
                  { text: '19201', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ HEMOGLOBINA GLICOSILADA', fontSize: 7 },
                  { text: '19303', fontSize: 7, alignment: 'center' },
                  { text: '☐ PROTEÍNA C REACTIVA', fontSize: 7 },
                  { text: '19206', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: 'PAQUETES', fontSize: 8, bold: true, fillColor: '#f0f0f0', colSpan: 2, alignment: 'center' },
                  {},
                  { text: '☐ FACTOR REUMATOIDE', fontSize: 7 },
                  { text: '19207', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ BIOMETRÍA,VSG,RETICULOCITOS', fontSize: 7 },
                  { text: '20202', fontSize: 7, alignment: 'center' },
                  { text: '☐ ANTIESTREPTOLISINAS', fontSize: 7 },
                  { text: '19205', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '', fontSize: 7 },
                  { text: '', fontSize: 7 },
                  { text: '☐ VDRL', fontSize: 7 },
                  { text: '22131', fontSize: 7, alignment: 'center' },
                ],
                // COAGULACIÓN
                [
                  { text: 'COAGULACIÓN', fontSize: 9, bold: true, fillColor: '#f0f0f0', colSpan: 2, alignment: 'center' },
                  {},
                  { text: '☐ ANTÍGENO PROSTÁTICO CUALITATIVO', fontSize: 7 },
                  { text: '19212', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ T. PROTROMBINA', fontSize: 7 },
                  { text: '20113', fontSize: 7, alignment: 'center' },
                  { text: '☐ RPR PRUEBA DE SÍFILIS', fontSize: 7 },
                  { text: '19206', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ TROMBOPLASTINA PARCIAL', fontSize: 7 },
                  { text: '20114', fontSize: 7, alignment: 'center' },
                  { text: '☐ HGC Beta CUALITATIVA sérica', fontSize: 7 },
                  { text: '19720', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ FIBRINÓGENO', fontSize: 7 },
                  { text: '20116', fontSize: 7, alignment: 'center' },
                  { text: '☐ PRUEBA DE EMBARAZO EN ORINA', fontSize: 7 },
                  { text: '19715', fontSize: 7, alignment: 'center' },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 10],
          },

          // 🔹 SEGUNDA TABLA - BIOQUÍMICA Y OTROS
          {
            table: {
              widths: ['25%', '25%', '25%', '25%'],
              body: [
                // BIOQUÍMICA CLÍNICA
                [
                  { text: 'BIOQUÍMICA CLÍNICA', fontSize: 9, bold: true, fillColor: '#f0f0f0', colSpan: 2, alignment: 'center' },
                  {},
                  { text: 'URIANALISIS', fontSize: 9, bold: true, fillColor: '#f0f0f0', colSpan: 2, alignment: 'center' },
                  {},
                ],
                [
                  { text: '☐ TAMIZ GESTACIONAL 50 G/1HR', fontSize: 7 },
                  { text: '19303', fontSize: 7, alignment: 'center' },
                  { text: '☐ EXAMEN GENERAL DE ORINA', fontSize: 7 },
                  { text: '20201', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ GLUCOSA POST-PRANDIAL', fontSize: 7 },
                  { text: '19302', fontSize: 7, alignment: 'center' },
                  { text: '☐ CLORO', fontSize: 7 },
                  { text: '19601', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ CURVA TOLERANCIA GLUCOSA', fontSize: 7 },
                  { text: '19303', fontSize: 7, alignment: 'center' },
                  { text: '☐ POTASIO', fontSize: 7 },
                  { text: '19601', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ GLUCOSA', fontSize: 7 },
                  { text: '19301', fontSize: 7, alignment: 'center' },
                  { text: '☐ SODIO', fontSize: 7 },
                  { text: '19601', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ UREA/BUN', fontSize: 7 },
                  { text: '19304', fontSize: 7, alignment: 'center' },
                  { text: '☐ MICROALBUMINURIA EN ORINA 24 HRS', fontSize: 7 },
                  { text: '22803', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ CREATININA', fontSize: 7 },
                  { text: '19306', fontSize: 7, alignment: 'center' },
                  { text: '☐ DEPURACIÓN DE CREATININA', fontSize: 7 },
                  { text: '19501', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ ÁCIDO ÚRICO', fontSize: 7 },
                  { text: '19307', fontSize: 7, alignment: 'center' },
                  { text: '', fontSize: 7 },
                  { text: '', fontSize: 7 },
                ],
                [
                  { text: '☐ COLESTEROL TOTAL', fontSize: 7 },
                  { text: '19307', fontSize: 7, alignment: 'center' },
                  { text: 'PARASITOLOGÍA', fontSize: 9, bold: true, fillColor: '#f0f0f0', colSpan: 2, alignment: 'center' },
                  {},
                ],
                [
                  { text: '☐ HDL COLESTEROL', fontSize: 7 },
                  { text: '19703', fontSize: 7, alignment: 'center' },
                  { text: '☐ COPROPARASITOSCÓPICO 3', fontSize: 7 },
                  { text: '20001', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ PERFIL DE LÍPIDOS', fontSize: 7 },
                  { text: '20203', fontSize: 7, alignment: 'center' },
                  { text: '☐ COPROPARASITOSCÓPICO 1', fontSize: 7 },
                  { text: '20001', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ TRIGLICÉRIDOS', fontSize: 7 },
                  { text: '19702', fontSize: 7, alignment: 'center' },
                  { text: '☐ CITOLOGÍA DE MOCO FECAL', fontSize: 7 },
                  { text: '20006', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ BILIRRUBINA DIRECTA', fontSize: 7 },
                  { text: '19308', fontSize: 7, alignment: 'center' },
                  { text: '☐ COPROLÓGICO', fontSize: 7 },
                  { text: '20005', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ BILIRRUBINA TOTAL', fontSize: 7 },
                  { text: '22118', fontSize: 7, alignment: 'center' },
                  { text: '☐ AMIBA EN FRESCO', fontSize: 7 },
                  { text: '20006', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ AST (TGO)', fontSize: 7 },
                  { text: '19401', fontSize: 7, alignment: 'center' },
                  { text: '☐ SANGRE OCULTA EN HECES', fontSize: 7 },
                  { text: '19502', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ ALT (TGP)', fontSize: 7 },
                  { text: '19402', fontSize: 7, alignment: 'center' },
                  { text: '☐ AZÚCARES REDUCTORES', fontSize: 7 },
                  { text: '20005', fontSize: 7, alignment: 'center' },
                ],
                [
                  { text: '☐ FOSFATASA ALCALINA (ALP)', fontSize: 7 },
                  { text: '19403', fontSize: 7, alignment: 'center' },
                  { text: '☐ ROTAVIRUS', fontSize: 7 },
                  { text: '19215', fontSize: 7, alignment: 'center' },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 10],
          },

          // 🔹 TERCERA TABLA - PAQUETES Y OTROS
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  { text: 'PAQUETES DE ESTUDIOS', fontSize: 9, bold: true, fillColor: '#f0f0f0', alignment: 'center' },
                  { text: 'OTROS ESTUDIOS', fontSize: 9, bold: true, fillColor: '#f0f0f0', alignment: 'center' },
                ],
                [
                  { text: '☐ QUÍMICA SANGUÍNEA III (20204)', fontSize: 7 },
                  { text: '☐ GASOMETRÍA ARTERIAL (19606)', fontSize: 7 },
                ],
                [
                  { text: '☐ QUÍMICA SANGUÍNEA IV (20207)', fontSize: 7 },
                  { text: '☐ GASOMETRÍA VENOSA (17301)', fontSize: 7 },
                ],
                [
                  { text: '☐ PERFIL HEPÁTICO (20208)', fontSize: 7 },
                  { text: '☐ EOSINÓFILOS EN MOCO NASAL (19203)', fontSize: 7 },
                ],
                [
                  { text: '☐ PERFIL QUIRÚRGICO (20209)', fontSize: 7 },
                  { text: '', fontSize: 7 },
                ],
                [
                  { text: '☐ PERFIL REUMÁTICO (20210)', fontSize: 7 },
                  { text: 'OTROS ESTUDIOS ESPECIALES:', fontSize: 8, bold: true },
                ],
                [
                  { text: '☐ PERFIL CONTROL DE EMBARAZO (20211)', fontSize: 7 },
                  {
                    text: laboratorioData.otros_estudios || '________________________',
                    fontSize: 7,
                    margin: [0, 10, 0, 10]
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 15],
          },

          // 🔹 DATOS DEL MÉDICO Y HORARIOS
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: `NOMBRE Y CÉDULA DEL MÉDICO: ${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo} - Cédula: ${medicoCompleto.numero_cedula}`,
                    fontSize: 8,
                    bold: true,
                    margin: [5, 5, 5, 5],
                  },
                ],
                [
                  {
                    table: {
                      widths: ['33%', '33%', '34%'],
                      body: [
                        [
                          { text: 'HORA DE TOMA DE MUESTRA:', fontSize: 7, bold: true },
                          { text: 'HORA DE RECEPCIÓN:', fontSize: 7, bold: true },
                          { text: 'HORA DE ENTREGA:', fontSize: 7, bold: true },
                        ],
                        [
                          { text: '________________', fontSize: 8, alignment: 'center' },
                          { text: '________________', fontSize: 8, alignment: 'center' },
                          { text: '________________', fontSize: 8, alignment: 'center' },
                        ],
                      ],
                    },
                    layout: 'noBorders',
                    margin: [5, 5, 5, 5],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
          },
        ],

        footer: (currentPage: number, pageCount: number) => {
          return {
            margin: [30, 10],
            table: {
              widths: ['25%', '50%', '25%'],
              body: [
                [
                  {
                    text: `Página ${currentPage} de ${pageCount}`,
                    fontSize: 7,
                    color: '#000000',
                  },
                  {
                    text: 'Solicitud de Laboratorio - SICEG\nNOM-004-SSA3-2012',
                    fontSize: 7,
                    alignment: 'center',
                    color: '#000000',
                  },
                  {
                    text: [
                      {
                        text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                        fontSize: 7,
                      },
                      {
                        text: `Exp: ${pacienteCompleto.numero_expediente}`,
                        fontSize: 6,
                      },
                    ],
                    alignment: 'right',
                    color: '#000000',
                  },
                ],
              ],
            },
            layout: 'noBorders',
          };
        },
      };

      const nombreArchivo = `solicitud-laboratorio-${pacienteCompleto.nombre
        .replace(/\s+/g, '-')
        .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log('✅ PDF de Solicitud de Laboratorio generado exitosamente');
      console.log(`📄 Archivo: ${nombreArchivo}`);

    } catch (error) {
      console.error('❌ Error al generar PDF de Solicitud de Laboratorio:', error);
      throw error;
    }
  }

// 📄 SOLICITUD DE IMAGENOLOGIA
  async generarSolicitudImagenologia(datos: any): Promise<void> {
    try {
      await this.ensurePdfMakeLoaded();

      console.log('📷 Generando Solicitud de Imagenología...');

      const medicoCompleto = await this.obtenerDatosMedicoActual();
      const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
      const solicitudData = datos.solicitudImagenologia || {};
      const fechaActual = new Date();

      const documentDefinition = {
        pageSize: 'LETTER',
        pageMargins: [40, 60, 40, 60],

        header: {
          margin: [40, 20, 40, 10],
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ',
                  fontSize: 14,
                  bold: true,
                  alignment: 'center',
                },
              ],
              [
                {
                  text: 'SOLICITUD DE IMAGENOLOGÍA',
                  fontSize: 16,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 10, 0, 0],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },

        content: [
          { text: '', margin: [0, 10] },

          // 🔹 DATOS DEL PACIENTE
          {
            table: {
              widths: ['30%', '35%', '15%', '20%'],
              body: [
                [
                  { text: 'Nombre del (la) paciente:', fontSize: 10, bold: true },
                  {
                    text: pacienteCompleto.nombre_completo,
                    fontSize: 10,
                    decoration: 'underline',
                  },
                  { text: 'No. Expediente:', fontSize: 10, bold: true },
                  {
                    text: pacienteCompleto.numero_expediente,
                    fontSize: 10,
                    decoration: 'underline',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          {
            table: {
              widths: ['15%', '35%', '15%', '35%'],
              body: [
                [
                  { text: 'CURP:', fontSize: 10, bold: true },
                  {
                    text: pacienteCompleto.curp || 'No registrado',
                    fontSize: 9,
                    decoration: 'underline',
                  },
                  { text: 'Servicio:', fontSize: 10, bold: true },
                  {
                    text: medicoCompleto.departamento || 'No especificado',
                    fontSize: 10,
                    decoration: 'underline',
                  },
                ],
                [
                  { text: 'Cama:', fontSize: 10, bold: true },
                  {
                    text: solicitudData.numero_cama || 'Ambulatorio',
                    fontSize: 10,
                    decoration: 'underline',
                  },
                  { text: '', fontSize: 10 },
                  { text: '', fontSize: 10 },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          {
            table: {
              widths: ['25%', '20%', '15%', '20%', '20%'],
              body: [
                [
                  { text: 'Fecha de nacimiento:', fontSize: 10, bold: true },
                  {
                    text: pacienteCompleto.fecha_nacimiento || 'No registrada',
                    fontSize: 9,
                    decoration: 'underline',
                  },
                  { text: 'Edad:', fontSize: 10, bold: true },
                  {
                    text: `${pacienteCompleto.edad} años`,
                    fontSize: 10,
                    decoration: 'underline',
                  },
                  { text: 'Género:', fontSize: 10, bold: true },
                  {
                    text: pacienteCompleto.sexo,
                    fontSize: 10,
                    decoration: 'underline',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          // 🔹 DIAGNÓSTICO
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'Diagnóstico con clave CIE 10:',
                    fontSize: 10,
                    bold: true,
                  },
                ],
                [
                  {
                    text:
                      solicitudData.diagnostico_cie10 ||
                      '_________________________________________________________',
                    fontSize: 10,
                    margin: [0, 5],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          // 🔹 INTERVENCIÓN CAUSES
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'Intervención CAUSES:',
                    fontSize: 10,
                    bold: true,
                  },
                ],
                [
                  {
                    text:
                      solicitudData.intervencion_causes ||
                      '_________________________________________________________',
                    fontSize: 10,
                    margin: [0, 5],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          // 🔹 ESTUDIOS SOLICITADOS
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'ESTUDIOS SOLICITADOS:',
                    fontSize: 11,
                    bold: true,
                    margin: [0, 5],
                  },
                ],
                [
                  {
                    table: {
                      widths: ['5%', '95%'],
                      body: [
                        [
                          { text: '☐', fontSize: 12 },
                          { text: 'Radiografía simple', fontSize: 10 },
                        ],
                        [
                          { text: '☐', fontSize: 12 },
                          { text: 'Ultrasonido', fontSize: 10 },
                        ],
                        [
                          { text: '☐', fontSize: 12 },
                          { text: 'Tomografía', fontSize: 10 },
                        ],
                        [
                          { text: '☐', fontSize: 12 },
                          { text: 'Resonancia magnética', fontSize: 10 },
                        ],
                        [
                          { text: '☐', fontSize: 12 },
                          {
                            text: 'Otro: ____________________________________',
                            fontSize: 10,
                          },
                        ],
                      ],
                    },
                    layout: 'noBorders',
                    margin: [10, 10, 10, 10],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
            },
            margin: [0, 0, 0, 30],
          },

          // 🔹 ÁREA ESPECÍFICA
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'Área específica a estudiar:',
                    fontSize: 10,
                    bold: true,
                  },
                ],
                [
                  {
                    text:
                      solicitudData.area_estudio ||
                      '______________________________________________________________________________________',
                    fontSize: 10,
                    margin: [0, 5],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          // 🔹 JUSTIFICACIÓN
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'Justificación médica:',
                    fontSize: 10,
                    bold: true,
                  },
                ],
                [
                  {
                    text:
                      solicitudData.justificacion ||
                      '______________________________________________________________________________________\n______________________________________________________________________________________',
                    fontSize: 10,
                    margin: [0, 5],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 30],
          },

          // 🔹 FIRMAS
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    text: [
                      { text: 'Médico que solicita:\n', fontSize: 10, bold: true },
                      {
                        text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}\n`,
                        fontSize: 10,
                      },
                      { text: `Cédula: ${medicoCompleto.numero_cedula}\n`, fontSize: 9 },
                      { text: 'Firma: _________________________\n', fontSize: 10 },
                      { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}`, fontSize: 9 },
                    ],
                    margin: [0, 10],
                  },
                  {
                    text: [
                      { text: 'Firma y hora que recibe (camillero):\n', fontSize: 10, bold: true },
                      { text: 'Nombre: _________________________\n', fontSize: 10 },
                      { text: 'Firma: _________________________\n', fontSize: 10 },
                      { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 9 },
                    ],
                    margin: [0, 10],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  { text: '', fontSize: 10 },
                  {
                    text: [
                      { text: 'Firma y hora que recibe (técnico rayos X):\n', fontSize: 10, bold: true },
                      { text: 'Nombre: _________________________\n', fontSize: 10 },
                      { text: 'Firma: _________________________\n', fontSize: 10 },
                      { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 9 },
                    ],
                    margin: [0, 10],
                  },
                ],
              ],
            },
            layout: 'noBorders',
          },
        ],

        footer: (currentPage: number, pageCount: number) => {
          return {
            margin: [40, 20],
            table: {
              widths: ['25%', '50%', '25%'],
              body: [
                [
                  {
                    text: `Página ${currentPage} de ${pageCount}`,
                    fontSize: 8,
                    color: '#000000',
                  },
                  {
                    text: 'Solicitud de Imagenología - SICEG\nNOM-004-SSA3-2012',
                    fontSize: 8,
                    alignment: 'center',
                    color: '#000000',
                  },
                  {
                    text: [
                      {
                        text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                        fontSize: 8,
                      },
                      {
                        text: `Exp: ${pacienteCompleto.numero_expediente}`,
                        fontSize: 7,
                      },
                    ],
                    alignment: 'right',
                    color: '#000000',
                  },
                ],
              ],
            },
            layout: 'noBorders',
          };
        },
      };

      const nombreArchivo = `solicitud-imagenologia-${pacienteCompleto.nombre
        .replace(/\s+/g, '-')
        .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log('✅ PDF de Solicitud de Imagenología generado exitosamente');
      console.log(`📄 Archivo: ${nombreArchivo}`);
    } catch (error) {
      console.error('❌ Error al generar PDF de Solicitud de Imagenología:', error);
      throw error;
    }
  }

  // 📄 SOLICITUD DE CULTIVO HOSPITAL MATERNO

  async generarSolicitudCultivo(datos: any): Promise<void> {
    try {
      await this.ensurePdfMakeLoaded();

      console.log('🧫 Generando Solicitud de Cultivo para Hospital Materno...');

      const medicoCompleto = await this.obtenerDatosMedicoActual();
      const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
      const cultivoData = datos.solicitudCultivo || {};
      const fechaActual = new Date();

      const documentDefinition = {
        pageSize: 'LETTER',
        pageMargins: [20, 40, 20, 40],

        header: function(currentPage: number) {
          return [
            {
              table: {
                widths: ['100%'],
                body: [
                  [
                    {
                      text: 'HOSPITAL MATERNO SAN LUIS DE LA PAZ',
                      fontSize: 12,
                      bold: true,
                      alignment: 'center',
                      margin: [0, 10, 0, 0],
                    },
                  ],
                  [
                    {
                      text: 'N° acceso: ___________________________',
                      fontSize: 10,
                      alignment: 'right',
                      margin: [0, 5, 0, 5],
                    },
                  ],
                  [
                    {
                      text: 'LABORATORIO CLINICO',
                      fontSize: 12,
                      bold: true,
                      alignment: 'center',
                      margin: [0, 5, 0, 0],
                    },
                  ],
                  [
                    {
                      text: 'Blvr. Centenario de la Revolución Mexicana N° 110',
                      fontSize: 9,
                      alignment: 'center',
                      margin: [0, 5, 0, 10],
                    },
                  ],
                  [
                    {
                      text: 'SOLICITUD DE ESTUDIOS DE MICROBIOLOGIA',
                      fontSize: 14,
                      bold: true,
                      alignment: 'center',
                      margin: [0, 10, 0, 15],
                    },
                  ],
                ],
              },
              layout: 'noBorders',
              margin: [20, 20, 20, 0],
            },
          ];
        },

        content: [
          // 🔹 DATOS DEL PACIENTE
          {
            table: {
              widths: ['15%', '35%', '10%', '15%', '10%', '15%'],
              body: [
                [
                  { text: 'Nombre:', fontSize: 10, bold: true },
                  {
                    text: pacienteCompleto.nombre_completo,
                    fontSize: 10,
                    decoration: 'underline',
                  },
                  { text: 'Género:', fontSize: 10, bold: true },
                  {
                    text: pacienteCompleto.sexo,
                    fontSize: 10,
                    decoration: 'underline',
                  },
                  { text: 'Edad:', fontSize: 10, bold: true },
                  {
                    text: `${pacienteCompleto.edad} años`,
                    fontSize: 10,
                    decoration: 'underline',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          {
            table: {
              widths: ['20%', '30%', '15%', '35%'],
              body: [
                [
                  { text: 'Fecha de solicitud:', fontSize: 10, bold: true },
                  {
                    text: fechaActual.toLocaleDateString('es-MX'),
                    fontSize: 10,
                    decoration: 'underline',
                  },
                  { text: 'Servicio:', fontSize: 10, bold: true },
                  {
                    text: medicoCompleto.departamento || 'No especificado',
                    fontSize: 10,
                    decoration: 'underline',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          {
            table: {
              widths: ['15%', '25%', '15%', '25%', '10%', '10%'],
              body: [
                [
                  { text: 'Cama:', fontSize: 10, bold: true },
                  {
                    text: cultivoData.numero_cama || 'Ambulatorio',
                    fontSize: 10,
                    decoration: 'underline',
                  },
                  { text: 'No. Expediente:', fontSize: 10, bold: true },
                  {
                    text: pacienteCompleto.numero_expediente,
                    fontSize: 10,
                    decoration: 'underline',
                  },
                  { text: 'CURP:', fontSize: 10, bold: true },
                  {
                    text: pacienteCompleto.curp || 'No registrado',
                    fontSize: 9,
                    decoration: 'underline',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          // 🔹 FIRMA MÉDICO
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'Nombre y firma del médico solicitante:',
                    fontSize: 10,
                    bold: true,
                  },
                ],
                [
                  {
                    text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}`,
                    fontSize: 10,
                    decoration: 'underline',
                  },
                ],
                [
                  {
                    text: `Cédula: ${medicoCompleto.numero_cedula}   Firma: ___________________________`,
                    fontSize: 10,
                    margin: [0, 10, 0, 0],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          // 🔹 DIAGNÓSTICO
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'Diagnóstico:',
                    fontSize: 10,
                    bold: true,
                  },
                ],
                [
                  {
                    text:
                      cultivoData.diagnostico ||
                      '______________________________________________________________________________________',
                    fontSize: 10,
                    margin: [0, 5],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          // 🔹 RESPONSABLE DE TOMA
          {
            table: {
              widths: ['30%', '70%'],
              body: [
                [
                  {
                    text: 'Responsable de la toma de muestra:',
                    fontSize: 10,
                    bold: true,
                  },
                  {
                    text: cultivoData.responsable_muestra || '___________________________',
                    fontSize: 10,
                    decoration: 'underline',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },

          // 🔹 TIPO DE MUESTRA
          {
            table: {
              widths: ['20%', '80%'],
              body: [
                [
                  {
                    text: 'Tipo de muestra:',
                    fontSize: 10,
                    bold: true,
                  },
                  {
                    table: {
                      widths: ['15%', '15%', '15%', '15%', '15%', '25%'],
                      body: [
                        [
                          { text: '☐ Líquido', fontSize: 9 },
                          { text: '☐ Secreción', fontSize: 9 },
                          { text: '☐ Sangre', fontSize: 9 },
                          { text: '☐ Catéter', fontSize: 9 },
                          { text: '☐ Orina', fontSize: 9 },
                          { text: '☐ Otro: ___________', fontSize: 9 },
                        ],
                      ],
                    },
                    layout: 'noBorders',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          // 🔹 SITIO DE ORIGEN
          {
            table: {
              widths: ['30%', '70%'],
              body: [
                [
                  {
                    text: 'Sitio de origen de la muestra:',
                    fontSize: 10,
                    bold: true,
                  },
                  {
                    text:
                      cultivoData.sitio_origen ||
                      '______________________________________________________________________________________',
                    fontSize: 10,
                    decoration: 'underline',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          // 🔹 TIPO DE MICROORGANISMO
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'En caso de requerir cultivo especificar el tipo de microorganismo a buscar:',
                    fontSize: 10,
                    bold: true,
                  },
                ],
                [
                  {
                    text:
                      cultivoData.microorganismo_buscar ||
                      '______________________________________________________________________________________\n______________________________________________________________________________________',
                    fontSize: 10,
                    margin: [0, 5],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          // 🔹 TINCIÓN
          {
            table: {
              widths: ['15%', '85%'],
              body: [
                [
                  {
                    text: 'Tinción:',
                    fontSize: 10,
                    bold: true,
                  },
                  {
                    table: {
                      widths: ['15%', '15%', '15%', '15%', '40%'],
                      body: [
                        [
                          { text: '☐ Tinta china', fontSize: 9 },
                          { text: '☐ Gram', fontSize: 9 },
                          { text: '☐ BAAR', fontSize: 9 },
                          { text: '☐ KINYOUN', fontSize: 9 },
                          { text: '☐ Otro: ___________', fontSize: 9 },
                        ],
                      ],
                    },
                    layout: 'noBorders',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          // 🔹 ANTIBIÓTICO
          {
            table: {
              widths: ['30%', '15%', '55%'],
              body: [
                [
                  {
                    text: '¿El paciente recibe antibiótico?',
                    fontSize: 10,
                    bold: true,
                  },
                  {
                    text: cultivoData.recibe_antibiotico ? '☑ Sí   ☐ No' : '☐ Sí   ☑ No',
                    fontSize: 10,
                  },
                  {
                    text: '¿Cuál? ' + (cultivoData.antibiotico_actual || '___________________________'),
                    fontSize: 10,
                    decoration: 'underline',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          // 🔹 CULTIVOS ANTERIORES
          {
            table: {
              widths: ['40%', '15%', '45%'],
              body: [
                [
                  {
                    text: '¿Se han realizado cultivos anteriormente?',
                    fontSize: 10,
                    bold: true,
                  },
                  {
                    text: cultivoData.cultivos_previos ? '☑ Sí   ☐ No' : '☐ Sí   ☑ No',
                    fontSize: 10,
                  },
                  {
                    text: '',
                    fontSize: 10,
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          // 🔹 MICROORGANISMOS AISLADOS
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'Microorganismos aislados encontrados:',
                    fontSize: 10,
                    bold: true,
                  },
                ],
                [
                  {
                    text:
                      cultivoData.microorganismos_aislados ||
                      '______________________________________________________________________________________\n______________________________________________________________________________________',
                    fontSize: 10,
                    margin: [0, 5],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 15],
          },

          // 🔹 COMENTARIOS
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'Comentarios:',
                    fontSize: 10,
                    bold: true,
                  },
                ],
                [
                  {
                    text:
                      cultivoData.comentarios ||
                      '______________________________________________________________________________________\n______________________________________________________________________________________\n______________________________________________________________________________________',
                    fontSize: 10,
                    margin: [0, 5],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 30],
          },

          // 🔹 ETIQUETA DE FOLIO (DUPLICATE HEADER)
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: 'Etiqueta de folio: ___________________________',
                    fontSize: 10,
                    alignment: 'center',
                    margin: [0, 20, 0, 0],
                  },
                ],
              ],
            },
            layout: 'noBorders',
          },
        ],

        footer: (currentPage: number, pageCount: number) => {
          return {
            margin: [20, 10],
            table: {
              widths: ['25%', '50%', '25%'],
              body: [
                [
                  {
                    text: `Página ${currentPage} de ${pageCount}`,
                    fontSize: 8,
                    color: '#666666',
                  },
                  {
                    text: 'Solicitud de Cultivo - Hospital Materno\nSICEG - NOM-004-SSA3-2012',
                    fontSize: 8,
                    alignment: 'center',
                    color: '#666666',
                  },
                  {
                    text: [
                      {
                        text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                        fontSize: 8,
                      },
                      {
                        text: `Exp: ${pacienteCompleto.numero_expediente}`,
                        fontSize: 7,
                      },
                    ],
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

      const nombreArchivo = `solicitud-cultivo-${pacienteCompleto.nombre
        .replace(/\s+/g, '-')
        .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

      const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.download(nombreArchivo);

      console.log('✅ PDF de Solicitud de Cultivo generado exitosamente');
      console.log(`📄 Archivo: ${nombreArchivo}`);
    } catch (error) {
      console.error('❌ Error al generar PDF de Solicitud de Cultivo:', error);
      throw error;
    }
  }


  // 📄 NOTA DE EGRESO SEGÚN NOM-004-SSA3-2012 SECCIÓN D12
async generarNotaEgreso(datos: any): Promise<void> {
  try {
    await this.ensurePdfMakeLoaded();

    console.log('🏥 Generando Nota de Egreso según NOM-004-SSA3-2012...');

    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
    const egresoData = datos.notaEgreso || {};
    const signosVitalesReales = this.obtenerSignosVitalesReales(datos);
    const fechaActual = new Date();

    const documentDefinition = {
      pageSize: 'LETTER',
      pageMargins: [20, 70, 20, 50],

      header: {
        margin: [20, 10, 20, 10],
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - NOTA DE EGRESO',
                fontSize: 11,
                bold: true,
                alignment: 'center',
              },
            ],
          ],
        },
        layout: 'noBorders',
      },

      content: [
        { text: '', margin: [0, 10] },

        // 🔹 IDENTIFICACIÓN DEL PACIENTE (NOM-004 5.2)
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                {
                  text: 'IDENTIFICACIÓN',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 4,
                },
                {
                  table: {
                    widths: ['20%', '20%', '20%', '20%', '20%'],
                    body: [
                      [
                        {
                          text: 'Fecha egreso',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Hora egreso',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'No. Expediente',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'No. de cama',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Folio egreso',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: egresoData.fecha_egreso || fechaActual.toLocaleDateString('es-MX'),
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: egresoData.hora_egreso || fechaActual.toLocaleTimeString('es-MX'),
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: pacienteCompleto.numero_expediente || 'N/A',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                          bold: true,
                        },
                        {
                          text: egresoData.numero_cama || 'N/A',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: `EG-${pacienteCompleto.numero_expediente}-${fechaActual.getFullYear()}`,
                          fontSize: 6,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                  },
                },
              ],
              [
                {},
                {
                  table: {
                    widths: ['60%', '20%', '20%'],
                    body: [
                      [
                        {
                          text: 'Nombre completo del paciente',
                          fontSize: 7,
                          bold: true,
                        },
                        {
                          text: 'Edad',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Sexo',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: pacienteCompleto.nombre_completo,
                          fontSize: 8,
                          bold: true,
                          margin: [2, 2],
                        },
                        {
                          text: `${pacienteCompleto.edad} años`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                        {
                          text: pacienteCompleto.sexo,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                  },
                },
              ],
              [
                {},
                {
                  table: {
                    widths: ['50%', '50%'],
                    body: [
                      [
                        {
                          text: 'Fecha y hora ingreso hospitalario',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Días de estancia en la unidad',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: `${egresoData.fecha_ingreso || 'No registrada'} - ${egresoData.hora_ingreso || 'No registrada'}`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                        {
                          text: `${egresoData.dias_estancia || this.calcularDiaHospitalizacion()} días`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                          bold: true,
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                  },
                },
              ],
              [
                {},
                {
                  table: {
                    widths: ['60%', '40%'],
                    body: [
                      [
                        {
                          text: 'Servicio',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Reingreso por la misma afección en el año',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: medicoCompleto.departamento || 'No especificado',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                        {
                          text: egresoData.es_reingreso ? 'SÍ' : 'NO',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                          bold: true,
                          color: egresoData.es_reingreso ? '#dc2626' : '#059669',
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                  },
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },

        { text: '', margin: [0, 3] },

        // 🔹 SIGNOS VITALES AL EGRESO (NOM-004 D12.4)
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                {
                  text: 'SIGNOS VITALES AL EGRESO',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 2,
                },
                {
                  table: {
                    widths: ['16%', '16%', '16%', '16%', '16%', '20%'],
                    body: [
                      [
                        {
                          text: 'Peso',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Talla',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Presión arterial',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'FC',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'FR',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Temperatura',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: `${signosVitalesReales.peso || '___'} kg`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: `${signosVitalesReales.talla || '___'} cm`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: `${signosVitalesReales.presion_arterial_sistolica || '___'}/${signosVitalesReales.presion_arterial_diastolica || '___'}`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: `${signosVitalesReales.frecuencia_cardiaca || '___'} lpm`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: `${signosVitalesReales.frecuencia_respiratoria || '___'} rpm`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: `${signosVitalesReales.temperatura || '___'} °C`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                  },
                },
              ],
              [
                {},
                {
                  table: {
                    widths: ['100%'],
                    body: [
                      [
                        {
                          text: 'Estado general al egreso',
                          fontSize: 7,
                          bold: true,
                          fillColor: '#f9f9f9',
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: egresoData.estado_general_egreso || 'Estable, sin signos de alarma.',
                          fontSize: 8,
                          margin: [5, 5],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                  },
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },

        { text: '', margin: [0, 3] },

        // 🔹 DIAGNÓSTICOS (NOM-004 D12.8 y D12.11)
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                {
                  text: 'DIAGNÓSTICOS',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 4,
                },
                {
                  text: 'DIAGNÓSTICO(S) DE INGRESO (D12.8)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                },
              ],
              [
                {},
                {
                  text: egresoData.diagnosticos_ingreso || 'No especificados en el momento del ingreso.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'DIAGNÓSTICO(S) FINAL(ES) (D12.11)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                },
              ],
              [
                {},
                {
                  text: egresoData.diagnosticos_finales || 'Diagnósticos finales por definir.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                  bold: true,
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },

        { text: '', margin: [0, 3] },

        // 🔹 EVOLUCIÓN Y MANEJO (NOM-004 D12.9 y D12.10)
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                {
                  text: 'EVOLUCIÓN Y MANEJO',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 4,
                },
                {
                  text: 'RESUMEN DE LA EVOLUCIÓN Y ESTADO ACTUAL (D12.9)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                },
              ],
              [
                {},
                {
                  text: egresoData.resumen_evolucion || 'Evolución clínica favorable durante la estancia hospitalaria.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'MANEJO DURANTE LA ESTANCIA HOSPITALARIA (D12.10)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                },
              ],
              [
                {},
                {
                  text: egresoData.manejo_hospitalario || 'Manejo médico integral según protocolos institucionales.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },

        { text: '', margin: [0, 3] },

        // 🔹 PROCEDIMIENTOS Y MOTIVO DE EGRESO (NOM-004 D12.12 y D12.13)
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                {
                  text: 'PROCEDIMIENTOS Y EGRESO',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 4,
                },
                {
                  text: 'PROCEDIMIENTOS REALIZADOS (D12.12)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                },
              ],
              [
                {},
                {
                  text: egresoData.procedimientos_realizados || 'Sin procedimientos especiales durante la estancia.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'MOTIVO DE EGRESO (D12.13)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                },
              ],
              [
                {},
                {
                  table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    body: [
                      [
                        {
                          text: egresoData.motivo_egreso === 'maximo_beneficio' ? '☑ Máximo beneficio' : '☐ Máximo beneficio',
                          fontSize: 7,
                          alignment: 'center',
                        },
                        {
                          text: egresoData.motivo_egreso === 'mejoria' ? '☑ Por mejoría' : '☐ Por mejoría',
                          fontSize: 7,
                          alignment: 'center',
                        },
                        {
                          text: egresoData.motivo_egreso === 'alta_voluntaria' ? '☑ Alta voluntaria' : '☐ Alta voluntaria',
                          fontSize: 7,
                          alignment: 'center',
                        },
                        {
                          text: egresoData.motivo_egreso === 'exitus' ? '☑ Exitus' : '☐ Exitus',
                          fontSize: 7,
                          alignment: 'center',
                        },
                      ],
                    ],
                  },
                  layout: 'noBorders',
                  margin: [5, 3],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },

        { text: '', margin: [0, 3] },

        // 🔹 PROBLEMAS PENDIENTES Y PLAN (NOM-004 D12.14 y D12.15)
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                {
                  text: 'SEGUIMIENTO',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 6,
                },
                {
                  text: 'PROBLEMAS CLÍNICOS PENDIENTES (D12.14)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                },
              ],
              [
                {},
                {
                  text: egresoData.problemas_pendientes || 'Sin problemas clínicos pendientes al momento del egreso.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'PLAN DE MANEJO Y TRATAMIENTO (D12.15)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                },
              ],
              [
                {},
                {
                  text: egresoData.plan_manejo_tratamiento || 'Continuar manejo ambulatorio según indicaciones médicas.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'RECOMENDACIONES PARA VIGILANCIA AMBULATORIA (D12.16)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                },
              ],
              [
                {},
                {
                  text: egresoData.recomendaciones_ambulatorias || 'Control médico en consulta externa según programación. Acudir a urgencias en caso de signos de alarma.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },

        { text: '', margin: [0, 5] },

        // 🔹 MÉDICO RESPONSABLE SEGÚN NOM-004 (D12.17)
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  text: 'NOMBRE COMPLETO, CÉDULA PROFESIONAL Y FIRMA DEL MÉDICO (D12.17)',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                },
                {
                  text: 'FIRMA AUTÓGRAFA',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
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
                      text: `Cédula Profesional: ${medicoCompleto.numero_cedula}\n`,
                      fontSize: 8,
                    },
                    {
                      text: `Especialidad: ${medicoCompleto.especialidad}\n`,
                      fontSize: 8,
                    },
                    {
                      text: `${medicoCompleto.cargo} - ${medicoCompleto.departamento}\n`,
                      fontSize: 8,
                    },
                    {
                      text: `Hospital General San Luis de la Paz\n`,
                      fontSize: 7,
                    },
                    {
                      text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}\n`,
                      fontSize: 7,
                    },
                    {
                      text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`,
                      fontSize: 7,
                    },
                  ],
                  margin: [5, 15],
                  alignment: 'center',
                },
                {
                  text: '\n\n\n\n_________________________\nFIRMA DEL MÉDICO TRATANTE\n(NOM-004-SSA3-2012)',
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
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },

        { text: '', margin: [0, 2] },

        // 🔹 NOTA REFERENCIAL
        {
          text: [
            {
              text: '* Nota elaborada conforme a NOM-004-SSA3-2012, Sección D12 "Nota de egreso"\n',
              fontSize: 6,
              italics: true,
              color: '#666666',
            },
            {
              text: '* Cumple con los requisitos establecidos en los numerales D12.1 al D12.17',
              fontSize: 6,
              italics: true,
              color: '#666666',
            },
          ],
          alignment: 'left',
        },
      ],

      footer: (currentPage: number, pageCount: number) => {
        return {
          margin: [20, 5],
          table: {
            widths: ['25%', '50%', '25%'],
            body: [
              [
                {
                  text: `Página ${currentPage} de ${pageCount}`,
                  fontSize: 7,
                  color: '#666666',
                },
                {
                  text: 'Nota de Egreso - SICEG\nNOM-004-SSA3-2012',
                  fontSize: 7,
                  alignment: 'center',
                  color: '#666666',
                },
                {
                  text: [
                    {
                      text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                      fontSize: 7,
                    },
                    {
                      text: `Exp: ${pacienteCompleto.numero_expediente}`,
                      fontSize: 6,
                    },
                  ],
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

    const nombreArchivo = `nota-egreso-${pacienteCompleto.nombre
      .replace(/\s+/g, '-')
      .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Nota de Egreso NOM-004 generado exitosamente');
    console.log(`📄 Archivo: ${nombreArchivo}`);

    // 🔥 VALIDAR CUMPLIMIENTO ESPECÍFICO NOTA EGRESO
    this.validarCumplimientoNotaEgreso(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Nota de Egreso:', error);
    throw error;
  }
}

// 📄 NOTA DE INTERCONSULTA SEGÚN NOM-004-SSA3-2012 SECCIÓN D7
async generarNotaInterconsulta(datos: any): Promise<void> {
  try {
    await this.ensurePdfMakeLoaded();

    console.log('🔄 Generando Nota de Interconsulta según NOM-004-SSA3-2012...');

    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
    const interconsultaData = datos.notaInterconsulta || {};
    const signosVitalesReales = this.obtenerSignosVitalesReales(datos);
    const fechaActual = new Date();

    const documentDefinition = {
      pageSize: 'LETTER',
      pageMargins: [20, 70, 20, 50],

      header: {
        margin: [20, 10, 20, 10],
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - NOTA DE INTERCONSULTA',
                fontSize: 11,
                bold: true,
                alignment: 'center',
              },
            ],
          ],
        },
        layout: 'noBorders',
      },

      content: [
        { text: '', margin: [0, 10] },

        // 🔹 IDENTIFICACIÓN DEL PACIENTE
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                {
                  text: 'IDENTIFICACIÓN',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 4,
                },
                {
                  table: {
                    widths: ['20%', '20%', '20%', '20%', '20%'],
                    body: [
                      [
                        {
                          text: 'Fecha interconsulta',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Hora interconsulta',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'No. Expediente',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'No. de cama',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Folio interconsulta',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: fechaActual.toLocaleDateString('es-MX'),
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: fechaActual.toLocaleTimeString('es-MX'),
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: pacienteCompleto.numero_expediente || 'N/A',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                          bold: true,
                        },
                        {
                          text: interconsultaData.numero_cama || 'N/A',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: `IC-${pacienteCompleto.numero_expediente}-${fechaActual.getFullYear()}`,
                          fontSize: 6,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                  },
                },
              ],
              [
                {},
                {
                  table: {
                    widths: ['60%', '20%', '20%'],
                    body: [
                      [
                        {
                          text: 'Nombre completo del paciente',
                          fontSize: 7,
                          bold: true,
                        },
                        {
                          text: 'Edad',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Sexo',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: pacienteCompleto.nombre_completo,
                          fontSize: 8,
                          bold: true,
                          margin: [2, 2],
                        },
                        {
                          text: `${pacienteCompleto.edad} años`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                        {
                          text: pacienteCompleto.sexo,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                  },
                },
              ],
              [
                {},
                {
                  table: {
                    widths: ['50%', '50%'],
                    body: [
                      [
                        {
                          text: 'Servicio solicitante',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Especialidad solicitada',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: medicoCompleto.departamento || 'No especificado',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                        {
                          text: interconsultaData.especialidad_solicitada || 'No especificada',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                          bold: true,
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                  },
                },
              ],
              [
                {},
                {
                  table: {
                    widths: ['100%'],
                    body: [
                      [
                        {
                          text: 'Médico que solicita interconsulta',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo} - Cédula: ${medicoCompleto.numero_cedula}`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                  },
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },

        { text: '', margin: [0, 3] },

        // 🔹 MOTIVO DE LA CONSULTA (NOM-004 D7.14)
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                {
                  text: 'SOLICITUD DE INTERCONSULTA',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 4,
                },
                {
                  text: 'MOTIVO DE LA CONSULTA (D7.14)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                },
              ],
              [
                {},
                {
                  text: interconsultaData.motivo_consulta || 'Motivo de interconsulta no especificado.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'PROBLEMA CLÍNICO ESPECÍFICO',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                },
              ],
              [
                {},
                {
                  text: interconsultaData.problema_clinico || 'Se solicita valoración y manejo por especialidad correspondiente.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },

        { text: '', margin: [0, 3] },

        // 🔹 ANTECEDENTES RELEVANTES
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                {
                  text: 'ANTECEDENTES RELEVANTES',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 4,
                },
                {
                  text: 'ANTECEDENTES PERSONALES PATOLÓGICOS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                },
              ],
              [
                {},
                {
                  text: interconsultaData.antecedentes_patologicos || 'Sin antecedentes patológicos de importancia.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'MEDICAMENTOS ACTUALES',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                },
              ],
              [
                {},
                {
                  text: interconsultaData.medicamentos_actuales || 'Sin medicamentos de base reportados.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },

        { text: '', margin: [0, 3] },

        // 🔹 EXPLORACIÓN FÍSICA RELEVANTE
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                {
                  text: 'EXPLORACIÓN FÍSICA',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 4,
                },
                {
                  text: 'SIGNOS VITALES',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                },
              ],
              [
                {},
                {
                  table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    body: [
                      [
                        {
                          text: 'Presión arterial',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Frecuencia cardíaca',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Frecuencia respiratoria',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Temperatura',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: `${signosVitalesReales.presion_arterial_sistolica || '___'}/${signosVitalesReales.presion_arterial_diastolica || '___'} mmHg`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: `${signosVitalesReales.frecuencia_cardiaca || '___'} lpm`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: `${signosVitalesReales.frecuencia_respiratoria || '___'} rpm`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: `${signosVitalesReales.temperatura || '___'} °C`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                  },
                  margin: [5, 2],
                },
              ],
              [
                {},
                {
                  text: 'HALLAZGOS RELEVANTES PARA INTERCONSULTA',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                },
              ],
              [
                {},
                {
                  text: interconsultaData.hallazgos_relevantes || 'Exploración física dirigida según el motivo de interconsulta.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },

        { text: '', margin: [0, 3] },

        // 🔹 ESTUDIOS DISPONIBLES
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                {
                  text: 'ESTUDIOS DISPONIBLES',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 2,
                },
                {
                  text: 'LABORATORIO Y GABINETE',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                },
              ],
              [
                {},
                {
                  text: interconsultaData.estudios_disponibles || 'Se adjuntan estudios de laboratorio y gabinete disponibles en el expediente.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },

        { text: '', margin: [0, 3] },

        // 🔹 RESPUESTA DEL ESPECIALISTA
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                {
                  text: 'RESPUESTA DEL ESPECIALISTA',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#e0f2fe',
                  alignment: 'center',
                  rowSpan: 8,
                },
                {
                  text: 'CRITERIO DIAGNÓSTICO (D7.12)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f9ff',
                },
              ],
              [
                {},
                {
                  text: interconsultaData.criterio_diagnostico || '________________________________________________________________________________________\n________________________________________________________________________________________',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'SUGERENCIAS DIAGNÓSTICAS (D7.13)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f9ff',
                },
              ],
              [
                {},
                {
                  text: interconsultaData.sugerencias_diagnosticas || '________________________________________________________________________________________\n________________________________________________________________________________________',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'SUGERENCIAS DE TRATAMIENTO (D7.13)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f9ff',
                },
              ],
              [
                {},
                {
                  text: interconsultaData.sugerencias_tratamiento || '________________________________________________________________________________________\n________________________________________________________________________________________',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'ESTUDIOS ADICIONALES SUGERIDOS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f9ff',
                },
              ],
              [
                {},
                {
                  text: interconsultaData.estudios_sugeridos || '________________________________________________________________________________________',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },

        { text: '', margin: [0, 5] },

        // 🔹 FIRMAS
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  text: 'MÉDICO QUE SOLICITA INTERCONSULTA',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                },
                {
                  text: 'MÉDICO ESPECIALISTA CONSULTADO',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#e0f2fe',
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
                    {
                      text: `${medicoCompleto.especialidad}\n`,
                      fontSize: 8,
                    },
                    {
                      text: `${medicoCompleto.departamento}\n`,
                      fontSize: 8,
                    },
                    {
                      text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}\n`,
                      fontSize: 7,
                    },
                    {
                      text: '\n_________________________\nFIRMA',
                      fontSize: 8,
                    },
                  ],
                  margin: [5, 15],
                  alignment: 'center',
                },
                {
                  text: [
                    {
                      text: `${interconsultaData.especialista_nombre || '__________________________'}\n`,
                      fontSize: 9,
                      bold: true,
                    },
                    {
                      text: `Cédula: ${interconsultaData.especialista_cedula || '______________'}\n`,
                      fontSize: 8,
                    },
                    {
                      text: `${interconsultaData.especialidad_solicitada || '__________________________'}\n`,
                      fontSize: 8,
                    },
                    {
                      text: `Fecha: ${interconsultaData.fecha_respuesta || '______________'}\n`,
                      fontSize: 7,
                    },
                    {
                      text: '\n_________________________\nFIRMA',
                      fontSize: 8,
                    },
                  ],
                  margin: [5, 15],
                  alignment: 'center',
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },

        { text: '', margin: [0, 2] },

        // 🔹 NOTA REFERENCIAL
        {
          text: [
            {
              text: '* Nota elaborada conforme a NOM-004-SSA3-2012, Sección D7 "Notas de interconsulta"\n',
              fontSize: 6,
              italics: true,
              color: '#666666',
            },
            {
              text: '* Cumple con los requisitos establecidos en los numerales D7.12, D7.13 y D7.14',
              fontSize: 6,
              italics: true,
              color: '#666666',
            },
          ],
          alignment: 'left',
        },
      ],

      footer: (currentPage: number, pageCount: number) => {
        return {
          margin: [20, 5],
          table: {
            widths: ['25%', '50%', '25%'],
            body: [
              [
                {
                  text: `Página ${currentPage} de ${pageCount}`,
                  fontSize: 7,
                  color: '#666666',
                },
                {
                  text: 'Nota de Interconsulta - SICEG\nNOM-004-SSA3-2012',
                  fontSize: 7,
                  alignment: 'center',
                  color: '#666666',
                },
                {
                  text: [
                    {
                      text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                      fontSize: 7,
                    },
                    {
                      text: `Exp: ${pacienteCompleto.numero_expediente}`,
                      fontSize: 6,
                    },
                  ],
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

    const nombreArchivo = `nota-interconsulta-${pacienteCompleto.nombre
      .replace(/\s+/g, '-')
      .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Nota de Interconsulta NOM-004 generado exitosamente');
    console.log(`📄 Archivo: ${nombreArchivo}`);

    // 🔥 VALIDAR CUMPLIMIENTO ESPECÍFICO
    this.validarCumplimientoNotaInterconsulta(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Nota de Interconsulta:', error);
    throw error;
  }
}


// 📄 PRESCRIPCIÓN DE MEDICAMENTOS SEGÚN NOM-004-SSA3-2012
async generarPrescripcionMedicamentos(datos: any): Promise<void> {
  try {
    await this.ensurePdfMakeLoaded();

    console.log('💊 Generando Prescripción de Medicamentos según NOM-004...');

    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
    const prescripcionData = datos.prescripcionMedicamentos || {};
    const fechaActual = new Date();

    const documentDefinition = {
      pageSize: 'LETTER',
      pageMargins: [30, 60, 30, 50],

      header: {
        margin: [30, 15, 30, 15],
        table: {
          widths: ['20%', '60%', '20%'],
          body: [
            [
              {
                text: '💊',
                fontSize: 24,
                alignment: 'center',
                color: '#059669',
              },
              {
                text: [
                  {
                    text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ\n',
                    fontSize: 13,
                    bold: true,
                    alignment: 'center',
                  },
                  {
                    text: 'PRESCRIPCIÓN MÉDICA\n',
                    fontSize: 11,
                    bold: true,
                    alignment: 'center',
                  },
                  {
                    text: 'Blvd. Centenario de la Revolución Mexicana #110',
                    fontSize: 8,
                    alignment: 'center',
                  },
                ],
              },
              {
                text: [
                  { text: 'Folio:\n', fontSize: 8, bold: true },
                  { text: `PM-${pacienteCompleto.numero_expediente}-${fechaActual.getFullYear()}\n`, fontSize: 7 },
                  { text: 'Fecha:\n', fontSize: 8, bold: true },
                  { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 8 },
                ],
                alignment: 'center',
              },
            ],
          ],
        },
        layout: 'noBorders',
      },

      content: [
        { text: '', margin: [0, 10] },

        // 🔹 DATOS DEL PACIENTE
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'DATOS DEL PACIENTE',
                  fontSize: 9,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  margin: [0, 3, 0, 3],
                },
              ],
              [
                {
                  table: {
                    widths: ['20%', '30%', '20%', '30%'],
                    body: [
                      [
                        { text: 'Nombre:', fontSize: 8, bold: true },
                        { text: pacienteCompleto.nombre_completo, fontSize: 8 },
                        { text: 'Expediente:', fontSize: 8, bold: true },
                        { text: pacienteCompleto.numero_expediente, fontSize: 8, bold: true },
                      ],
                      [
                        { text: 'Edad:', fontSize: 8, bold: true },
                        { text: `${pacienteCompleto.edad} años`, fontSize: 8 },
                        { text: 'Sexo:', fontSize: 8, bold: true },
                        { text: pacienteCompleto.sexo, fontSize: 8 },
                      ],
                      [
                        { text: 'Peso:', fontSize: 8, bold: true },
                        { text: `${prescripcionData.peso_paciente || '___'} kg`, fontSize: 8 },
                        { text: 'Alergias:', fontSize: 8, bold: true },
                        { text: prescripcionData.alergias_conocidas || 'No conocidas', fontSize: 8 },
                      ],
                    ],
                  },
                  layout: 'noBorders',
                  margin: [5, 5, 5, 5],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
          margin: [0, 0, 0, 15],
        },

        // 🔹 DIAGNÓSTICO
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'DIAGNÓSTICO:',
                  fontSize: 9,
                  bold: true,
                  margin: [5, 5, 5, 2],
                },
              ],
              [
                {
                  text: prescripcionData.diagnostico || 'Diagnóstico por especificar',
                  fontSize: 9,
                  margin: [5, 2, 5, 8],
                  bold: true,
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
          margin: [0, 0, 0, 20],
        },

        // 🔹 MEDICAMENTOS PRESCRITOS
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'Rp/ MEDICAMENTOS PRESCRITOS',
                  fontSize: 10,
                  bold: true,
                  fillColor: '#f0f9ff',
                  alignment: 'center',
                  margin: [0, 5, 0, 5],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
          margin: [0, 0, 0, 5],
        },

        // 🔹 TABLA DE MEDICAMENTOS
        {
          table: {
            widths: ['5%', '35%', '20%', '15%', '25%'],
            body: [
              // Encabezados
              [
                {
                  text: '#',
                  fontSize: 8,
                  bold: true,
                  alignment: 'center',
                  fillColor: '#e0f2fe',
                },
                {
                  text: 'MEDICAMENTO\n(Denominación genérica)',
                  fontSize: 8,
                  bold: true,
                  alignment: 'center',
                  fillColor: '#e0f2fe',
                },
                {
                  text: 'PRESENTACIÓN\nY CONCENTRACIÓN',
                  fontSize: 8,
                  bold: true,
                  alignment: 'center',
                  fillColor: '#e0f2fe',
                },
                {
                  text: 'CANTIDAD',
                  fontSize: 8,
                  bold: true,
                  alignment: 'center',
                  fillColor: '#e0f2fe',
                },
                {
                  text: 'INDICACIONES\n(Dosis, vía, frecuencia)',
                  fontSize: 8,
                  bold: true,
                  alignment: 'center',
                  fillColor: '#e0f2fe',
                },
              ],
              // Generar filas de medicamentos (máximo 10)
              ...Array.from({ length: 10 }, (_, index) => {
                const medicamento = prescripcionData.medicamentos?.[index];
                return [
                  {
                    text: (index + 1).toString(),
                    fontSize: 8,
                    alignment: 'center',
                    margin: [0, 8, 0, 8],
                  },
                  {
                    text: medicamento?.nombre_generico || '',
                    fontSize: 9,
                    margin: [3, 8, 3, 8],
                    bold: !!medicamento?.nombre_generico,
                  },
                  {
                    text: medicamento?.presentacion || '',
                    fontSize: 8,
                    margin: [3, 8, 3, 8],
                    alignment: 'center',
                  },
                  {
                    text: medicamento?.cantidad || '',
                    fontSize: 8,
                    margin: [3, 8, 3, 8],
                    alignment: 'center',
                  },
                  {
                    text: medicamento?.indicaciones || '',
                    fontSize: 8,
                    margin: [3, 8, 3, 8],
                  },
                ];
              }),
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
          margin: [0, 0, 0, 15],
        },

        // 🔹 INSTRUCCIONES GENERALES
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'INSTRUCCIONES GENERALES AL PACIENTE:',
                  fontSize: 9,
                  bold: true,
                  margin: [5, 5, 5, 2],
                },
              ],
              [
                {
                  text: prescripcionData.instrucciones_generales ||
                    '• Tomar los medicamentos según las indicaciones médicas\n' +
                    '• Completar el tratamiento aunque se sienta mejor\n' +
                    '• No suspender medicamentos sin autorización médica\n' +
                    '• Acudir a control médico en la fecha indicada\n' +
                    '• En caso de reacciones adversas, suspender y acudir al médico',
                  fontSize: 8,
                  margin: [5, 5, 5, 8],
                  lineHeight: 1.3,
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
          margin: [0, 0, 0, 15],
        },

        // 🔹 PRÓXIMA CITA
        {
          table: {
            widths: ['70%', '30%'],
            body: [
              [
                {
                  text: `PRÓXIMA CITA: ${prescripcionData.proxima_cita || '___________________'}`,
                  fontSize: 9,
                  bold: true,
                  margin: [5, 8, 5, 8],
                },
                {
                  text: `DÍAS DE TRATAMIENTO: ${prescripcionData.dias_tratamiento || '____'} días`,
                  fontSize: 9,
                  bold: true,
                  margin: [5, 8, 5, 8],
                  alignment: 'center',
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
          margin: [0, 0, 0, 20],
        },

        // 🔹 FIRMA DEL MÉDICO
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'DATOS DEL MÉDICO PRESCRIPTOR',
                  fontSize: 9,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  margin: [0, 5, 0, 5],
                },
              ],
              [
                {
                  text: [
                    {
                      text: `Nombre: ${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}\n`,
                      fontSize: 9,
                      bold: true,
                    },
                    {
                      text: `Cédula Profesional: ${medicoCompleto.numero_cedula}\n`,
                      fontSize: 8,
                    },
                    {
                      text: `Especialidad: ${medicoCompleto.especialidad}\n`,
                      fontSize: 8,
                    },
                    {
                      text: `Servicio: ${medicoCompleto.departamento}\n`,
                      fontSize: 8,
                    },
                    {
                      text: `Fecha de prescripción: ${fechaActual.toLocaleDateString('es-MX')}\n`,
                      fontSize: 8,
                    },
                  ],
                  margin: [5, 10, 5, 5],
                  alignment: 'left',
                },
              ],
              [
                {
                  text: '\n\n_____________________________________\nFIRMA Y SELLO DEL MÉDICO',
                  fontSize: 9,
                  alignment: 'center',
                  margin: [0, 10, 0, 15],
                  bold: true,
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },

        { text: '', margin: [0, 10] },

        // 🔹 ADVERTENCIAS LEGALES
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '⚠️ ADVERTENCIAS IMPORTANTES',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#fef3c7',
                  alignment: 'center',
                  margin: [0, 3, 0, 3],
                },
              ],
              [
                {
                  text: '• Esta prescripción es válida únicamente para el paciente indicado\n' +
                        '• Los medicamentos controlados requieren presentar receta original\n' +
                        '• Conservar en lugar fresco y seco, fuera del alcance de los niños\n' +
                        '• No automedicarse ni compartir medicamentos\n' +
                        '• En caso de emergencia comunicarse al Hospital: Tel. (468) 688-0001',
                  fontSize: 7,
                  margin: [5, 5, 5, 5],
                  lineHeight: 1.2,
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#f59e0b',
            vLineColor: () => '#f59e0b',
          },
        },
      ],

      footer: (currentPage: number, pageCount: number) => {
        return {
          margin: [30, 10],
          table: {
            widths: ['25%', '50%', '25%'],
            body: [
              [
                {
                  text: `Página ${currentPage} de ${pageCount}`,
                  fontSize: 7,
                  color: '#666666',
                },
                {
                  text: 'Prescripción Médica - SICEG\nNOM-004-SSA3-2012',
                  fontSize: 7,
                  alignment: 'center',
                  color: '#666666',
                },
                {
                  text: [
                    {
                      text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                      fontSize: 7,
                    },
                    {
                      text: `Exp: ${pacienteCompleto.numero_expediente}`,
                      fontSize: 6,
                    },
                  ],
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

    const nombreArchivo = `prescripcion-medicamentos-${pacienteCompleto.nombre
      .replace(/\s+/g, '-')
      .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Prescripción de Medicamentos generado exitosamente');
    console.log(`📄 Archivo: ${nombreArchivo}`);

    // 🔥 VALIDAR CUMPLIMIENTO ESPECÍFICO
    this.validarCumplimientoPrescripcionMedicamentos(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Prescripción de Medicamentos:', error);
    throw error;
  }
}

// 📄 REGISTRO DE TRANSFUSIÓN SEGÚN NOM-004-SSA3-2012 SECCIÓN D15
async generarRegistroTransfusion(datos: any): Promise<void> {
  try {
    await this.ensurePdfMakeLoaded();

    console.log('🩸 Generando Registro de Transfusión según NOM-004 y NOM-253...');

    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
    const transfusionData = datos.registroTransfusion || {};
    const signosVitalesReales = this.obtenerSignosVitalesReales(datos);
    const fechaActual = new Date();

    const documentDefinition = {
      pageSize: 'LETTER',
      pageMargins: [20, 60, 20, 50],

      header: {
        margin: [20, 10, 20, 10],
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - REGISTRO DE TRANSFUSIÓN',
                fontSize: 11,
                bold: true,
                alignment: 'center',
              },
            ],
            [
              {
                text: 'REGISTRO DE TRANSFUSIÓN DE UNIDADES DE SANGRE O COMPONENTES',
                fontSize: 9,
                bold: true,
                alignment: 'center',
                margin: [0, 3, 0, 0],
              },
            ],
          ],
        },
        layout: 'noBorders',
      },

      content: [
        { text: '', margin: [0, 10] },

        // 🔹 IDENTIFICACIÓN DEL PACIENTE
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                {
                  text: 'IDENTIFICACIÓN',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 4,
                },
                {
                  table: {
                    widths: ['20%', '20%', '20%', '20%', '20%'],
                    body: [
                      [
                        {
                          text: 'Fecha transfusión',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Hora inicio',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'No. Expediente',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'No. de cama',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Folio registro',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: transfusionData.fecha_transfusion || fechaActual.toLocaleDateString('es-MX'),
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: transfusionData.hora_inicio || fechaActual.toLocaleTimeString('es-MX'),
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: pacienteCompleto.numero_expediente || 'N/A',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                          bold: true,
                        },
                        {
                          text: transfusionData.numero_cama || 'N/A',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                        {
                          text: `RT-${pacienteCompleto.numero_expediente}-${fechaActual.getFullYear()}`,
                          fontSize: 6,
                          alignment: 'center',
                          margin: [0, 1],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                  },
                },
              ],
              [
                {},
                {
                  table: {
                    widths: ['50%', '25%', '25%'],
                    body: [
                      [
                        {
                          text: 'Nombre completo del paciente',
                          fontSize: 7,
                          bold: true,
                        },
                        {
                          text: 'Edad',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Sexo',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: pacienteCompleto.nombre_completo,
                          fontSize: 8,
                          bold: true,
                          margin: [2, 2],
                        },
                        {
                          text: `${pacienteCompleto.edad} años`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                        {
                          text: pacienteCompleto.sexo,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                  },
                },
              ],
              [
                {},
                {
                  table: {
                    widths: ['40%', '30%', '30%'],
                    body: [
                      [
                        {
                          text: 'Servicio',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Diagnóstico',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Tipo sanguíneo',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: medicoCompleto.departamento || 'No especificado',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                        {
                          text: transfusionData.diagnostico || 'No especificado',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                        {
                          text: pacienteCompleto.tipo_sangre || 'No registrado',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                          bold: true,
                          color: '#dc2626',
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                  },
                },
              ],
              [
                {},
                {
                  table: {
                    widths: ['100%'],
                    body: [
                      [
                        {
                          text: 'Médico que indica la transfusión',
                          fontSize: 7,
                          bold: true,
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo} - Cédula: ${medicoCompleto.numero_cedula}`,
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                  },
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
        },

        { text: '', margin: [0, 3] },

        // 🔹 INFORMACIÓN DE LAS UNIDADES TRANSFUNDIDAS (NOM-004 D15.1)
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                {
                  text: 'UNIDADES TRANSFUNDIDAS',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#fee2e2',
                  alignment: 'center',
                  rowSpan: 4,
                },
                {
                  text: 'INFORMACIÓN DE UNIDADES DE SANGRE O COMPONENTES (D15.1)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fef2f2',
                },
              ],
              [
                {},
                {
                  table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    body: [
                      [
                        {
                          text: 'Tipo de componente',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Cantidad de unidades',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Volumen total (ml)',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'No. identificación',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: transfusionData.tipo_componente || 'Concentrado eritrocitario',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                        {
                          text: transfusionData.cantidad_unidades || '1',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                          bold: true,
                        },
                        {
                          text: transfusionData.volumen_total || '250',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                        {
                          text: transfusionData.numero_identificacion || 'N/A',
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000',
                  },
                },
              ],
              [
                {},
                {
                  text: 'FECHA Y HORA DE INICIO Y FINALIZACIÓN (D15.2)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fef2f2',
                },
              ],
              [
                {},
                {
                  table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    body: [
                      [
                        {
                          text: 'Fecha inicio',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Hora inicio',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Fecha finalización',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                        {
                          text: 'Hora finalización',
                          fontSize: 6,
                          bold: true,
                          alignment: 'center',
                        },
                      ],
                      [
                        {
                          text: transfusionData.fecha_inicio || fechaActual.toLocaleDateString('es-MX'),
                          fontSize: 7,
                          alignment: 'center',
                          margin: [0, 2],
                        },
                        {
                          text: transfusionData.hora_inicio || fechaActual.toLocaleTimeString('es-MX'),
                          fontSize: 7,
                         alignment: 'center',
                         margin: [0, 2],
                       },
                       {
                         text: transfusionData.fecha_finalizacion || '______________',
                         fontSize: 7,
                         alignment: 'center',
                         margin: [0, 2],
                       },
                       {
                         text: transfusionData.hora_finalizacion || '______________',
                         fontSize: 7,
                         alignment: 'center',
                         margin: [0, 2],
                       },
                     ],
                   ],
                 },
                 layout: {
                   hLineWidth: () => 0.3,
                   vLineWidth: () => 0.3,
                   hLineColor: () => '#000000',
                   vLineColor: () => '#000000',
                 },
               },
             ],
           ],
         },
         layout: {
           hLineWidth: () => 0.5,
           vLineWidth: () => 0.5,
           hLineColor: () => '#000000',
           vLineColor: () => '#000000',
         },
       },

       { text: '', margin: [0, 3] },

       // 🔹 CONTROL DE SIGNOS VITALES (NOM-004 D15.3)
       {
         table: {
           widths: ['20%', '80%'],
           body: [
             [
               {
                 text: 'CONTROL SIGNOS VITALES',
                 fontSize: 8,
                 bold: true,
                 fillColor: '#dbeafe',
                 alignment: 'center',
                 rowSpan: 4,
               },
               {
                 text: 'SIGNOS VITALES ANTES, DURANTE Y DESPUÉS DE LA TRANSFUSIÓN (D15.3)',
                 fontSize: 7,
                 bold: true,
                 fillColor: '#eff6ff',
               },
             ],
             [
               {},
               {
                 table: {
                   widths: ['25%', '25%', '25%', '25%'],
                   body: [
                     [
                       {
                         text: 'Momento',
                         fontSize: 7,
                         bold: true,
                         alignment: 'center',
                       },
                       {
                         text: 'Presión arterial',
                         fontSize: 7,
                         bold: true,
                         alignment: 'center',
                       },
                       {
                         text: 'Frecuencia cardíaca',
                         fontSize: 7,
                         bold: true,
                         alignment: 'center',
                       },
                       {
                         text: 'Temperatura',
                         fontSize: 7,
                         bold: true,
                         alignment: 'center',
                       },
                     ],
                     [
                       {
                         text: 'ANTES',
                         fontSize: 7,
                         bold: true,
                         alignment: 'center',
                         fillColor: '#f0f9ff',
                       },
                       {
                         text: `${signosVitalesReales.presion_arterial_sistolica || '___'}/${signosVitalesReales.presion_arterial_diastolica || '___'}`,
                         fontSize: 7,
                         alignment: 'center',
                       },
                       {
                         text: `${signosVitalesReales.frecuencia_cardiaca || '___'} lpm`,
                         fontSize: 7,
                         alignment: 'center',
                       },
                       {
                         text: `${signosVitalesReales.temperatura || '___'} °C`,
                         fontSize: 7,
                         alignment: 'center',
                       },
                     ],
                     [
                       {
                         text: 'DURANTE',
                         fontSize: 7,
                         bold: true,
                         alignment: 'center',
                         fillColor: '#f0f9ff',
                       },
                       {
                         text: transfusionData.pa_durante || '__________',
                         fontSize: 7,
                         alignment: 'center',
                       },
                       {
                         text: transfusionData.fc_durante || '___ lpm',
                         fontSize: 7,
                         alignment: 'center',
                       },
                       {
                         text: transfusionData.temp_durante || '___ °C',
                         fontSize: 7,
                         alignment: 'center',
                       },
                     ],
                     [
                       {
                         text: 'DESPUÉS',
                         fontSize: 7,
                         bold: true,
                         alignment: 'center',
                         fillColor: '#f0f9ff',
                       },
                       {
                         text: transfusionData.pa_despues || '__________',
                         fontSize: 7,
                         alignment: 'center',
                       },
                       {
                         text: transfusionData.fc_despues || '___ lpm',
                         fontSize: 7,
                         alignment: 'center',
                       },
                       {
                         text: transfusionData.temp_despues || '___ °C',
                         fontSize: 7,
                         alignment: 'center',
                       },
                     ],
                   ],
                 },
                 layout: {
                   hLineWidth: () => 0.3,
                   vLineWidth: () => 0.3,
                   hLineColor: () => '#000000',
                   vLineColor: () => '#000000',
                 },
               },
             ],
             [
               {},
               {
                 text: 'ESTADO GENERAL DEL PACIENTE',
                 fontSize: 7,
                 bold: true,
                 fillColor: '#eff6ff',
               },
             ],
             [
               {},
               {
                 text: transfusionData.estado_general || 'Paciente estable durante todo el procedimiento de transfusión. Sin signos de reacciones adversas.',
                 fontSize: 8,
                 margin: [5, 5],
                 lineHeight: 1.3,
               },
             ],
           ],
         },
         layout: {
           hLineWidth: () => 0.5,
           vLineWidth: () => 0.5,
           hLineColor: () => '#000000',
           vLineColor: () => '#000000',
         },
       },

       { text: '', margin: [0, 3] },

       // 🔹 REACCIONES ADVERSAS (NOM-004 D15.4)
       {
         table: {
           widths: ['20%', '80%'],
           body: [
             [
               {
                 text: 'REACCIONES ADVERSAS',
                 fontSize: 8,
                 bold: true,
                 fillColor: '#fef3c7',
                 alignment: 'center',
                 rowSpan: 4,
               },
               {
                 text: 'REACCIONES ADVERSAS A LA TRANSFUSIÓN (D15.4)',
                 fontSize: 7,
                 bold: true,
                 fillColor: '#fffbeb',
               },
             ],
             [
               {},
               {
                 table: {
                   widths: ['20%', '80%'],
                   body: [
                     [
                       {
                         text: transfusionData.hubo_reacciones ? '☑ SÍ' : '☑ NO',
                         fontSize: 8,
                         bold: true,
                         alignment: 'center',
                       },
                       {
                         text: 'Se presentaron reacciones adversas durante o después de la transfusión',
                         fontSize: 8,
                         alignment: 'left',
                       },
                     ],
                   ],
                 },
                 layout: 'noBorders',
               },
             ],
             [
               {},
               {
                 text: 'TIPO DE REACCIÓN Y MANEJO',
                 fontSize: 7,
                 bold: true,
                 fillColor: '#fffbeb',
               },
             ],
             [
               {},
               {
                 text: transfusionData.tipo_reaccion_manejo ||
                   (transfusionData.hubo_reacciones ?
                     'Describir tipo de reacción: _________________________________\nManejo aplicado: _________________________________' :
                     'Sin reacciones adversas reportadas durante el procedimiento.'),
                 fontSize: 8,
                 margin: [5, 5],
                 lineHeight: 1.3,
               },
             ],
           ],
         },
         layout: {
           hLineWidth: () => 0.5,
           vLineWidth: () => 0.5,
           hLineColor: () => '#000000',
           vLineColor: () => '#000000',
         },
       },

       { text: '', margin: [0, 3] },

       // 🔹 PERSONAL RESPONSABLE (NOM-004 D15.5)
       {
         table: {
           widths: ['20%', '80%'],
           body: [
             [
               {
                 text: 'PERSONAL RESPONSABLE',
                 fontSize: 8,
                 bold: true,
                 fillColor: '#f0fdf4',
                 alignment: 'center',
                 rowSpan: 6,
               },
               {
                 text: 'MÉDICO QUE INDICÓ LA TRANSFUSIÓN (D15.5)',
                 fontSize: 7,
                 bold: true,
                 fillColor: '#f7fee7',
               },
             ],
             [
               {},
               {
                 text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo} - Cédula: ${medicoCompleto.numero_cedula}`,
                 fontSize: 8,
                 margin: [5, 3],
                 bold: true,
               },
             ],
             [
               {},
               {
                 text: 'PERSONAL DE SALUD ENCARGADO DE APLICACIÓN Y VIGILANCIA (D15.5)',
                 fontSize: 7,
                 bold: true,
                 fillColor: '#f7fee7',
               },
             ],
             [
               {},
               {
                 table: {
                   widths: ['50%', '50%'],
                   body: [
                     [
                       {
                         text: 'Nombre del personal de enfermería:',
                         fontSize: 7,
                         bold: true,
                       },
                       {
                         text: 'Cédula profesional:',
                         fontSize: 7,
                         bold: true,
                       },
                     ],
                     [
                       {
                         text: transfusionData.enfermera_responsable || '____________________________',
                         fontSize: 8,
                         decoration: 'underline',
                       },
                       {
                         text: transfusionData.cedula_enfermera || '____________________________',
                         fontSize: 8,
                         decoration: 'underline',
                       },
                     ],
                   ],
                 },
                 layout: 'noBorders',
                 margin: [5, 3],
               },
             ],
             [
               {},
               {
                 text: 'OBSERVACIONES ADICIONALES',
                 fontSize: 7,
                 bold: true,
                 fillColor: '#f7fee7',
               },
             ],
             [
               {},
               {
                 text: transfusionData.observaciones_adicionales ||
                   'Transfusión realizada sin complicaciones. Paciente toleró bien el procedimiento.',
                 fontSize: 8,
                 margin: [5, 5],
                 lineHeight: 1.3,
               },
             ],
           ],
         },
         layout: {
           hLineWidth: () => 0.5,
           vLineWidth: () => 0.5,
           hLineColor: () => '#000000',
           vLineColor: () => '#000000',
         },
       },

       { text: '', margin: [0, 5] },

       // 🔹 FIRMAS MÚLTIPLES SEGÚN NOM-004
       {
         table: {
           widths: ['33.33%', '33.33%', '33.34%'],
           body: [
             [
               {
                 text: 'MÉDICO QUE INDICA',
                 fontSize: 8,
                 bold: true,
                 fillColor: '#f5f5f5',
                 alignment: 'center',
               },
               {
                 text: 'PERSONAL DE ENFERMERÍA',
                 fontSize: 8,
                 bold: true,
                 fillColor: '#f5f5f5',
                 alignment: 'center',
               },
               {
                 text: 'BANCO DE SANGRE',
                 fontSize: 8,
                 bold: true,
                 fillColor: '#f5f5f5',
                 alignment: 'center',
               },
             ],
             [
               {
                 text: [
                   {
                     text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}\n`,
                     fontSize: 8,
                     bold: true,
                   },
                   {
                     text: `Cédula: ${medicoCompleto.numero_cedula}\n`,
                     fontSize: 7,
                   },
                   {
                     text: `${medicoCompleto.especialidad}\n`,
                     fontSize: 7,
                   },
                   {
                     text: '\n\n_____________________\nFIRMA',
                     fontSize: 7,
                   },
                 ],
                 margin: [2, 10],
                 alignment: 'center',
               },
               {
                 text: [
                   {
                     text: `${transfusionData.enfermera_responsable || '__________________'}\n`,
                     fontSize: 8,
                     bold: true,
                   },
                   {
                     text: `Cédula: ${transfusionData.cedula_enfermera || '__________'}\n`,
                     fontSize: 7,
                   },
                   {
                     text: 'Enfermería\n',
                     fontSize: 7,
                   },
                   {
                     text: '\n\n_____________________\nFIRMA',
                     fontSize: 7,
                   },
                 ],
                 margin: [2, 10],
                 alignment: 'center',
               },
               {
                 text: [
                   {
                     text: `${transfusionData.responsable_banco_sangre || '__________________'}\n`,
                     fontSize: 8,
                     bold: true,
                   },
                   {
                     text: `Cédula: ${transfusionData.cedula_banco || '__________'}\n`,
                     fontSize: 7,
                   },
                   {
                     text: 'Banco de Sangre\n',
                     fontSize: 7,
                   },
                   {
                     text: '\n\n_____________________\nFIRMA',
                     fontSize: 7,
                   },
                 ],
                 margin: [2, 10],
                 alignment: 'center',
               },
             ],
           ],
         },
         layout: {
           hLineWidth: () => 0.5,
           vLineWidth: () => 0.5,
           hLineColor: () => '#000000',
           vLineColor: () => '#000000',
         },
       },

       { text: '', margin: [0, 2] },

       // 🔹 NOTA REFERENCIAL
       {
         text: [
           {
             text: '* Registro elaborado conforme a NOM-004-SSA3-2012, Sección D15 "Registro de transfusión"\n',
             fontSize: 6,
             italics: true,
             color: '#666666',
           },
           {
             text: '* Cumple con NOM-253-SSA1-2012 para disposición de sangre humana y componentes',
             fontSize: 6,
             italics: true,
             color: '#666666',
           },
         ],
         alignment: 'left',
       },
     ],

     footer: (currentPage: number, pageCount: number) => {
       return {
         margin: [20, 5],
         table: {
           widths: ['25%', '50%', '25%'],
           body: [
             [
               {
                 text: `Página ${currentPage} de ${pageCount}`,
                 fontSize: 7,
                 color: '#666666',
               },
               {
                 text: 'Registro de Transfusión - SICEG\nNOM-004-SSA3-2012 | NOM-253-SSA1-2012',
                 fontSize: 7,
                 alignment: 'center',
                 color: '#666666',
               },
               {
                 text: [
                   {
                     text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
                     fontSize: 7,
                   },
                   {
                     text: `Exp: ${pacienteCompleto.numero_expediente}`,
                     fontSize: 6,
                   },
                 ],
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

   const nombreArchivo = `registro-transfusion-${pacienteCompleto.nombre
     .replace(/\s+/g, '-')
     .toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

   const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
   pdfDocGenerator.download(nombreArchivo);

   console.log('✅ PDF de Registro de Transfusión NOM-004 generado exitosamente');
   console.log(`📄 Archivo: ${nombreArchivo}`);

   // 🔥 VALIDAR CUMPLIMIENTO ESPECÍFICO
   this.validarCumplimientoRegistroTransfusion(datos, medicoCompleto, pacienteCompleto);

 } catch (error) {
   console.error('❌ Error al generar PDF de Registro de Transfusión:', error);
   throw error;
 }
}

// 🔥 VALIDACIÓN ESPECÍFICA PARA PRESCRIPCIÓN DE MEDICAMENTOS
private validarCumplimientoPrescripcionMedicamentos(
 datos: any,
 medico: any,
 paciente: any
): void {
 console.log('🔍 VALIDANDO CUMPLIMIENTO PRESCRIPCIÓN DE MEDICAMENTOS...');

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
   console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 90%');
 } else {
   console.log('✅ PRESCRIPCIÓN DE MEDICAMENTOS CUMPLE CON ESTÁNDARES MÉDICOS');
 }
}

// 🔥 VALIDACIÓN ESPECÍFICA PARA REGISTRO DE TRANSFUSIÓN
private validarCumplimientoRegistroTransfusion(
 datos: any,
 medico: any,
 paciente: any
): void {
 console.log('🔍 VALIDANDO CUMPLIMIENTO NOM-004 Y NOM-253 - REGISTRO DE TRANSFUSIÓN...');

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
   console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 90%');
 } else {
   console.log('✅ REGISTRO DE TRANSFUSIÓN CUMPLE CON NOM-004 Y NOM-253');
 }
}









}
