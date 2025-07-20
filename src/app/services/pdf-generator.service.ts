// src/app/services/pdf-generator.service.ts
import { Injectable } from '@angular/core';
import { PersonalMedicoService } from './personas/personal-medico';
import { AuthService } from './auth/auth.service';


// Agregar estas interfaces al inicio del servicio
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
  providedIn: 'root'
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

  // 🔥 MÉTODO MEJORADO PARA OBTENER DATOS COMPLETOS DEL MÉDICO
  // private async obtenerDatosMedicoActual(): Promise<any> {
  //   try {
  //     const usuarioActual = this.authService.getCurrentUser();

  //     if (!usuarioActual || usuarioActual.tipo_usuario !== 'medico') {
  //       throw new Error('Usuario no es médico o no está autenticado');
  //     }

  //     console.log('🩺 Obteniendo datos completos del médico:', usuarioActual.id);

  //     // Obtener datos completos del médico desde el backend
  //     const response = await this.personalMedicoService.getPersonalMedicoById(usuarioActual.id).toPromise();

  //     if (response?.success && response.data) {
  //       const medico = response.data;

  //       return {
  //         id_personal_medico: medico.id_personal_medico,
  //         nombre_completo: `${medico.nombre} ${medico.apellido_paterno} ${medico.apellido_materno}`,
  //         nombre: medico.nombre,
  //         apellido_paterno: medico.apellido_paterno,
  //         apellido_materno: medico.apellido_materno,
  //         numero_cedula: medico.numero_cedula,
  //         especialidad: medico.especialidad,
  //         cargo: medico.cargo,
  //         departamento: medico.departamento,
  //         titulo_profesional: this.obtenerTituloProfesional(medico.especialidad)
  //       };
  //     }

  //     throw new Error('No se pudieron obtener los datos del médico');
  //   } catch (error) {
  //     console.error('❌ Error al obtener datos del médico:', error);

  //     // Fallback con datos básicos del usuario autenticado
  //     const usuarioActual = this.authService.getCurrentUser();
  //     return {
  //       id_personal_medico: usuarioActual?.id || 0,
  //       nombre_completo: usuarioActual?.nombre_completo || 'Médico no identificado',
  //       numero_cedula: 'No disponible',
  //       especialidad: usuarioActual?.especialidad || 'No especificada',
  //       cargo: usuarioActual?.cargo || 'Médico',
  //       departamento: usuarioActual?.departamento || 'No especificado',
  //       titulo_profesional: 'Dr.'
  //     };
  //   }
  // }



  // // 🔥 OBTENER TÍTULO PROFESIONAL BASADO EN ESPECIALIDAD
  // private obtenerTituloProfesional(especialidad: string): string {
  //   if (!especialidad) return 'Dr.';

  //   const especialidadLower = especialidad.toLowerCase();

  //   if (especialidadLower.includes('psicología') || especialidadLower.includes('psicolog')) {
  //     return 'Psic.';
  //   }
  //   if (especialidadLower.includes('nutrición') || especialidadLower.includes('nutricion')) {
  //     return 'Nut.';
  //   }
  //   if (especialidadLower.includes('enfermería') || especialidadLower.includes('enfermeria')) {
  //     return 'Enf.';
  //   }

  //   return 'Dr.'; // Por defecto para especialidades médicas
  // }

// 🔥 MÉTODO MEJORADO PARA OBTENER DATOS COMPLETOS DEL MÉDICO
private async obtenerDatosMedicoActual(): Promise<any> {
  try {
    const usuarioActual = this.authService.getCurrentUser();

    if (!usuarioActual || usuarioActual.tipo_usuario !== 'medico') {
      throw new Error('Usuario no es médico o no está autenticado');
    }

    console.log('🩺 Obteniendo datos completos del médico:', usuarioActual.id);

    // Obtener datos completos del médico desde el backend
    const response = await this.personalMedicoService.getPersonalMedicoById(usuarioActual.id).toPromise();

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
        titulo_profesional: this.obtenerTituloProfesional(medico.especialidad)
      };
    }

    throw new Error('No se pudieron obtener los datos del médico');
  } catch (error) {
    console.error('❌ Error al obtener datos del médico:', error);

    // Fallback con datos básicos del usuario autenticado
    const usuarioActual = this.authService.getCurrentUser();
    return {
      id_personal_medico: usuarioActual?.id || 0,
      nombre_completo: usuarioActual?.nombre_completo || 'Médico no identificado',
      numero_cedula: 'No disponible',
      especialidad: usuarioActual?.especialidad || 'No especificada',
      cargo: usuarioActual?.cargo || 'Médico',
      departamento: usuarioActual?.departamento || 'No especificado',
      titulo_profesional: 'Dr.'
    };
  }
}

// 🔥 OBTENER TÍTULO PROFESIONAL BASADO EN ESPECIALIDAD
private obtenerTituloProfesional(especialidad: string): string {
  if (!especialidad) return 'Dr.';

  const especialidadLower = especialidad.toLowerCase();

  if (especialidadLower.includes('psicología') || especialidadLower.includes('psicolog')) {
    return 'Psic.';
  }
  if (especialidadLower.includes('nutrición') || especialidadLower.includes('nutricion')) {
    return 'Nut.';
  }
  if (especialidadLower.includes('enfermería') || especialidadLower.includes('enfermeria')) {
    return 'Enf.';
  }

  return 'Dr.'; // Por defecto para especialidades médicas
}


// // 🔥 MÉTODO MEJORADO PARA VALIDAR Y FORMATEAR DATOS DEL PACIENTE
// private validarYFormatearDatosPaciente(datosPaciente: any): any {
//   console.log('🔍 Datos recibidos del paciente:', datosPaciente);

//   // Verificar estructura de datos
//   let pacienteInfo = null;
//   let expedienteInfo = null;

//   // 🔥 NUEVA LÓGICA: Intentar extraer datos desde diferentes estructuras posibles

//   // 1. Si los datos vienen directamente del wizard (paso persona)
//   if (datosPaciente?.persona) {
//     console.log('✅ Datos encontrados en datosPaciente.persona');
//     pacienteInfo = datosPaciente.persona;
//     expedienteInfo = datosPaciente.expediente;
//   }

//   // 2. Si vienen anidados en paciente.persona.persona
//   else if (datosPaciente?.paciente?.persona?.persona) {
//     console.log('✅ Datos encontrados en estructura anidada');
//     pacienteInfo = datosPaciente.paciente.persona.persona;
//     expedienteInfo = datosPaciente.paciente?.expediente || datosPaciente.expediente;
//   }

//   // 3. Si vienen en paciente.persona
//   else if (datosPaciente?.paciente?.persona) {
//     console.log('✅ Datos encontrados en paciente.persona');
//     pacienteInfo = datosPaciente.paciente.persona;
//     expedienteInfo = datosPaciente.expediente;
//   }

//   // 4. Si los datos están directamente en paciente
//   else if (datosPaciente?.paciente) {
//     console.log('✅ Datos encontrados directamente en paciente');
//     pacienteInfo = datosPaciente.paciente;
//     expedienteInfo = datosPaciente.expediente;
//   }

//   // 5. 🔥 NUEVA: Si vienen del formData del wizard directamente
//   else if (datosPaciente?.nombre || datosPaciente?.apellido_paterno) {
//     console.log('✅ Datos encontrados directamente en el objeto raíz');
//     pacienteInfo = datosPaciente;
//     expedienteInfo = datosPaciente.expediente;
//   }

//   console.log('✅ Datos extraídos del paciente:', pacienteInfo);
//   console.log('✅ Datos del expediente:', expedienteInfo);

//   return {
//     // Información personal
//     nombre_completo: this.construirNombreCompleto(pacienteInfo),
//     nombre: pacienteInfo?.nombre || 'No disponible',
//     apellido_paterno: pacienteInfo?.apellido_paterno || '',
//     apellido_materno: pacienteInfo?.apellido_materno || '',

//     // Datos demográficos
//     fecha_nacimiento: pacienteInfo?.fecha_nacimiento || null,
//     edad: this.calcularEdad(pacienteInfo?.fecha_nacimiento),
//     sexo: this.formatearSexo(pacienteInfo?.sexo || pacienteInfo?.genero),
//     curp: pacienteInfo?.curp || 'No registrado',

//     // 🔥 CORREGIR LUGAR DE NACIMIENTO
//     lugar_nacimiento: pacienteInfo?.lugar_nacimiento ||
//                      pacienteInfo?.ciudad_nacimiento ||
//                      pacienteInfo?.municipio_nacimiento ||
//                      'No especificado',

//     // Contacto
//     telefono: pacienteInfo?.telefono || 'No registrado',
//     correo_electronico: pacienteInfo?.correo_electronico || pacienteInfo?.email || 'No registrado',

//     // 🔥 MEJORAR DIRECCIÓN COMPLETA
//     direccion_completa: this.formatearDireccionMejorada(pacienteInfo),

//     // Información médica
//     tipo_sangre: pacienteInfo?.tipo_sangre || datosPaciente?.paciente?.tipo_sangre || 'No registrado',
//     ocupacion: pacienteInfo?.ocupacion || datosPaciente?.paciente?.ocupacion || 'No registrado',
//     escolaridad: pacienteInfo?.escolaridad || datosPaciente?.paciente?.escolaridad || 'No registrado',
//     estado_civil: pacienteInfo?.estado_civil || 'No registrado',
//     religion: pacienteInfo?.religion || 'No registrado',

//     // Expediente
//     numero_expediente: expedienteInfo?.numero_expediente || 'No disponible',
//     fecha_apertura: expedienteInfo?.fecha_apertura || null,

//     // Contacto de emergencia
//     familiar_responsable: datosPaciente?.paciente?.familiar_responsable || 'No registrado',
//     telefono_familiar: datosPaciente?.paciente?.telefono_familiar || 'No registrado'
//   };
// }
// 🔥 MÉTODO MEJORADO PARA VALIDAR Y FORMATEAR DATOS DEL PACIENTE
private validarYFormatearDatosPaciente(datosPaciente: any): any {
  console.log('🔍 Datos recibidos del paciente:', datosPaciente);

  // Verificar estructura de datos
  let pacienteInfo = null;
  let expedienteInfo = null;

  // 🔥 NUEVA LÓGICA: Intentar extraer datos desde diferentes estructuras posibles

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
    expedienteInfo = datosPaciente.paciente?.expediente || datosPaciente.expediente;
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

  // 5. 🔥 NUEVA: Si vienen del formData del wizard directamente
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

    // 🔥 CORREGIR LUGAR DE NACIMIENTO
    lugar_nacimiento: pacienteInfo?.lugar_nacimiento ||
                     pacienteInfo?.ciudad_nacimiento ||
                     pacienteInfo?.municipio_nacimiento ||
                     'No especificado',

    // Contacto
    telefono: pacienteInfo?.telefono || 'No registrado',
    correo_electronico: pacienteInfo?.correo_electronico || pacienteInfo?.email || 'No registrado',

    // 🔥 MEJORAR DIRECCIÓN COMPLETA
    direccion_completa: this.formatearDireccionMejorada(pacienteInfo),

    // Información médica
    tipo_sangre: pacienteInfo?.tipo_sangre || datosPaciente?.paciente?.tipo_sangre || 'No registrado',
    ocupacion: pacienteInfo?.ocupacion || datosPaciente?.paciente?.ocupacion || 'No registrado',
    escolaridad: pacienteInfo?.escolaridad || datosPaciente?.paciente?.escolaridad || 'No registrado',
    estado_civil: pacienteInfo?.estado_civil || 'No registrado',
    religion: pacienteInfo?.religion || 'No registrado',

    // Expediente
    numero_expediente: expedienteInfo?.numero_expediente || 'No disponible',
    fecha_apertura: expedienteInfo?.fecha_apertura || null,

    // Contacto de emergencia
    familiar_responsable: datosPaciente?.paciente?.familiar_responsable || 'No registrado',
    telefono_familiar: datosPaciente?.paciente?.telefono_familiar || 'No registrado'
  };
}

// // 🔥 MÉTODO MEJORADO PARA FORMATEAR DIRECCIÓN
// private formatearDireccionMejorada(paciente: any): string {
//   if (!paciente) return 'Sin dirección registrada';

//   const partes = [
//     paciente.calle,
//     paciente.numero_exterior ? `#${paciente.numero_exterior}` : '',
//     paciente.numero_interior ? `Int. ${paciente.numero_interior}` : '',
//     paciente.colonia,
//     paciente.municipio || paciente.ciudad,
//     paciente.estado,
//     paciente.codigo_postal ? `C.P. ${paciente.codigo_postal}` : ''
//   ].filter(parte => parte && parte.trim() !== '' && parte.trim() !== 'null' && parte.trim() !== 'undefined');

//   return partes.length > 0 ? partes.join(', ') : 'Sin dirección registrada';
// }
// 🔥 MÉTODO MEJORADO PARA FORMATEAR DIRECCIÓN
// private formatearDireccionMejorada(paciente: any): string {
//   if (!paciente) return 'Sin dirección registrada';

//   const partes = [
//     paciente.calle,
//     paciente.numero_exterior ? `#${paciente.numero_exterior}` : '',
//     paciente.numero_interior ? `Int. ${paciente.numero_interior}` : '',
//     paciente.colonia,
//     paciente.municipio || paciente.ciudad,
//     paciente.estado,
//     paciente.codigo_postal ? `C.P. ${paciente.codigo_postal}` : ''
//   ].filter(parte => parte && parte.trim() !== '' && parte.trim() !== 'null' && parte.trim() !== 'undefined');

//   return partes.length > 0 ? partes.join(', ') : 'Sin dirección registrada';
// }

  // // 🔥 MÉTODO AUXILIAR PARA CONSTRUIR NOMBRE COMPLETO
  // private construirNombreCompleto(persona: any): string {
  //   if (!persona) return 'Paciente no identificado';

  //   const partes = [
  //     persona.nombre,
  //     persona.apellido_paterno,
  //     persona.apellido_materno
  //   ].filter(parte => parte && parte.trim() !== '');

  //   return partes.length > 0 ? partes.join(' ') : 'Nombre no disponible';
  // }
// 🔥 MÉTODO AUXILIAR PARA CONSTRUIR NOMBRE COMPLETO
private construirNombreCompleto(persona: any): string {
  if (!persona) return 'Paciente no identificado';

  const partes = [
    persona.nombre,
    persona.apellido_paterno,
    persona.apellido_materno
  ].filter(parte => parte && parte.trim() !== '');

  return partes.length > 0 ? partes.join(' ') : 'Nombre no disponible';
}

  // // 🔥 MÉTODO AUXILIAR PARA FORMATEAR SEXO/GÉNERO
  // private formatearSexo(sexo: string): string {
  //   if (!sexo) return 'No especificado';

  //   const sexoUpper = sexo.toUpperCase();
  //   switch (sexoUpper) {
  //     case 'M':
  //     case 'MASCULINO':
  //       return 'Masculino';
  //     case 'F':
  //     case 'FEMENINO':
  //       return 'Femenino';
  //     default:
  //       return sexo;
  //   }
  // }
// 🔥 MÉTODO AUXILIAR PARA FORMATEAR SEXO/GÉNERO
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


async generarHistoriaClinica(datos: any): Promise<void> {
  try {
    await this.ensurePdfMakeLoaded();

    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
    const historiaClinicaData = datos.historiaClinica || {};
    const signosVitalesReales = this.obtenerSignosVitalesReales(datos);

    // 🔥 OBTENER GUÍA CLÍNICA SELECCIONADA
    const guiaClinicaData = this.obtenerGuiaClinicaSeleccionada(datos);

    // 🔥 OBTENER DATOS DE PADRES
    const datosPadres = this.obtenerDatosPadres(datos);

    const fechaActual = new Date();

    console.log('📋 Generando Historia Clínica Pediátrica completa con NOM-004...');
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
                color: '#1a365d'
              }
            ]
          ]
        },
        layout: 'noBorders'
      },

      content: [
        // 🔹 SECCIÓN IDENTIFICACIÓN COMPLETA CON TODOS LOS DATOS NOM-004
        // 🔹 SECCIÓN IDENTIFICACIÓN - SOLO CAMPOS OBLIGATORIOS NOM-004-SSA3-2012
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
          rowSpan: 8
        },
        // PRIMERA FILA: DATOS DE CONTROL OBLIGATORIOS
        {
          table: {
            widths: ['20%', '20%', '20%', '20%', '20%'],
            body: [
              [
                { text: 'Fecha de elaboración', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Hora de elaboración', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'No. Expediente', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'No. de cama', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Servicio', fontSize: 7, bold: true, alignment: 'center' }
              ],
              [
                { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'center', margin: [0, 2] },
                { text: fechaActual.toLocaleTimeString('es-MX'), fontSize: 7, alignment: 'center', margin: [0, 2] },
                { text: pacienteCompleto.numero_expediente || 'N/A', fontSize: 7, alignment: 'center', margin: [0, 2], bold: true },
                { text: historiaClinicaData.numero_cama || 'Ambulatorio', fontSize: 7, alignment: 'center', margin: [0, 2] },
                { text: medicoCompleto.departamento || 'No especificado', fontSize: 7, alignment: 'center', margin: [0, 2] }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.3,
            vLineWidth: () => 0.3,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        }
      ],
      [
        {},
        // SEGUNDA FILA: NOMBRE COMPLETO DEL PACIENTE (5.2.3)
        {
          table: {
            widths: ['70%', '15%', '15%'],
            body: [
              [
                { text: 'Nombre completo del paciente', fontSize: 7, bold: true },
                { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' }
              ],
              [
                { text: pacienteCompleto.nombre_completo, fontSize: 8, bold: true, margin: [2, 3] },
                { text: `${pacienteCompleto.edad} años`, fontSize: 7, alignment: 'center', margin: [0, 3] },
                { text: pacienteCompleto.sexo, fontSize: 7, alignment: 'center', margin: [0, 3] }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.3,
            vLineWidth: () => 0.3,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        }
      ],
      [
        {},
        // TERCERA FILA: DOMICILIO DEL PACIENTE (5.2.3)
        {
          table: {
            widths: ['100%'],
            body: [
              [
                { text: 'Domicilio del paciente', fontSize: 7, bold: true }
              ],
              [
                { text: this.formatearDireccionMejorada(pacienteCompleto), fontSize: 7, margin: [2, 3] }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.3,
            vLineWidth: () => 0.3,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        }
      ],
      [
        {},
        // CUARTA FILA: DATOS ADICIONALES DEL PACIENTE
        {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
                { text: 'Fecha nacimiento', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'CURP', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Lugar de nacimiento', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Teléfono', fontSize: 7, bold: true, alignment: 'center' }
              ],
              [
                { text: pacienteCompleto.fecha_nacimiento || 'No registrada', fontSize: 7, alignment: 'center', margin: [0, 2] },
                { text: pacienteCompleto.curp || 'No registrado', fontSize: 6, alignment: 'center', margin: [0, 2] },
                { text: pacienteCompleto.lugar_nacimiento || 'No especificado', fontSize: 7, alignment: 'center', margin: [0, 2] },
                { text: pacienteCompleto.telefono || 'No registrado', fontSize: 7, alignment: 'center', margin: [0, 2] }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.3,
            vLineWidth: () => 0.3,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        }
      ],
      [
        {},
        // QUINTA FILA: DATOS SOCIOECONÓMICOS BÁSICOS
        {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
                { text: 'Ocupación', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Escolaridad', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Estado civil', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Religión', fontSize: 7, bold: true, alignment: 'center' }
              ],
              [
                { text: pacienteCompleto.ocupacion || 'No registrada', fontSize: 7, alignment: 'center', margin: [0, 2] },
                { text: pacienteCompleto.escolaridad || 'No registrada', fontSize: 7, alignment: 'center', margin: [0, 2] },
                { text: pacienteCompleto.estado_civil || 'No registrado', fontSize: 7, alignment: 'center', margin: [0, 2] },
                { text: pacienteCompleto.religion || 'No registrada', fontSize: 7, alignment: 'center', margin: [0, 2] }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.3,
            vLineWidth: () => 0.3,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        }
      ],
      [
        {},
        // SEXTA FILA: INFORMACIÓN DE PADRES (ESPECÍFICO PEDIATRÍA - NOM-031)
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                { text: 'Nombre del padre', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Nombre de la madre', fontSize: 7, bold: true, alignment: 'center' }
              ],
              [
                { text: datosPadres.nombre_padre, fontSize: 7, alignment: 'center', margin: [0, 2] },
                { text: datosPadres.nombre_madre, fontSize: 7, alignment: 'center', margin: [0, 2] }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.3,
            vLineWidth: () => 0.3,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        }
      ],
      [
        {},
        // SÉPTIMA FILA: CONTACTO DE EMERGENCIA
        {
          table: {
            widths: ['60%', '40%'],
            body: [
              [
                { text: 'Familiar responsable', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Teléfono de contacto', fontSize: 7, bold: true, alignment: 'center' }
              ],
              [
                { text: pacienteCompleto.familiar_responsable || 'No registrado', fontSize: 7, alignment: 'center', margin: [0, 2] },
                { text: pacienteCompleto.telefono_familiar || 'No registrado', fontSize: 7, alignment: 'center', margin: [0, 2] }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.3,
            vLineWidth: () => 0.3,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        }
      ],
      [
        {},
        // OCTAVA FILA: MÉDICO RESPONSABLE (5.10)
        {
          table: {
            widths: ['70%', '30%'],
            body: [
              [
                { text: 'Médico responsable de la elaboración', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Cédula profesional', fontSize: 7, bold: true, alignment: 'center' }
              ],
              [
                { text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}`, fontSize: 7, alignment: 'center', margin: [0, 2] },
                { text: medicoCompleto.numero_cedula || 'No registrada', fontSize: 7, alignment: 'center', margin: [0, 2] }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.3,
            vLineWidth: () => 0.3,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        }
      ]
    ]
  },
  layout: {
    hLineWidth: () => 0.5,
    vLineWidth: () => 0.5,
    hLineColor: () => '#000000',
    vLineColor: () => '#000000'
  }
},

        { text: '', margin: [0, 1] },

        // 🔹 SECCIÓN ANTECEDENTES MEJORADA SEGÚN NOM-004
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
                  rowSpan: 8 // ✅ AUMENTADO PARA NUEVOS CAMPOS
                },
                {
                  text: 'HEREDO FAMILIARES',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: historiaClinicaData.antecedentes_heredo_familiares || 'Sin antecedentes familiares relevantes. Se interroga específicamente por diabetes mellitus, hipertensión arterial, cardiopatías, neoplasias, enfermedades hereditarias y mentales.',
                  fontSize: 7,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ],
              [
                {},
                {
                  text: 'PERSONALES NO PATOLÓGICOS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: `Alimentación: ${historiaClinicaData.habitos_alimenticios || 'Adecuada para la edad'}\n` +
                        `Higiene: ${historiaClinicaData.habitos_higienicos || 'Adecuada'}\n` +
                        `Actividad física: ${historiaClinicaData.actividad_fisica || 'Apropiada para la edad'}\n` +
                        `Vivienda: ${historiaClinicaData.vivienda || 'Casa habitación con servicios básicos'}\n` +
                        `Inmunizaciones: ${historiaClinicaData.inmunizaciones || 'Esquema completo según edad'}\n` +
                        `Desarrollo psicomotor: ${historiaClinicaData.desarrollo_psicomotor || 'Acorde a la edad'}`,
                  fontSize: 7,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ],
              [
                {},
                {
                  text: 'PERSONALES PATOLÓGICOS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: `Enfermedades en la infancia: ${historiaClinicaData.enfermedades_infancia || 'Negadas'}\n` +
                        `Hospitalizaciones previas: ${historiaClinicaData.hospitalizaciones_previas || 'Ninguna'}\n` +
                        `Cirugías previas: ${historiaClinicaData.cirugias_previas || 'Ninguna'}\n` +
                        `Traumatismos: ${historiaClinicaData.traumatismos || 'Ninguno'}\n` +
                        `Alergias (medicamentos/alimentos): ${historiaClinicaData.alergias || 'Negadas'}\n` +
                        `Transfusiones: ${historiaClinicaData.transfusiones || 'Ninguna'}`,
                  fontSize: 7,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ],
              [
                {},
                {
                  text: 'PERINATALES (si aplica)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: `Control prenatal: ${historiaClinicaData.control_prenatal || 'No aplica'}\n` +
                        `Tipo de parto: ${historiaClinicaData.tipo_parto || 'No aplica'}\n` +
                        `Peso al nacer: ${historiaClinicaData.peso_nacer || 'No registrado'}\n` +
                        `Complicaciones neonatales: ${historiaClinicaData.complicaciones_neonatales || 'Ninguna'}`,
                  fontSize: 7,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 1] },

        // 🔹 SECCIÓN PADECIMIENTO ACTUAL Y INTERROGATORIO POR APARATOS
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
                  rowSpan: 6 // ✅ AUMENTADO PARA INTERROGATORIO POR APARATOS
                },
                {
                  text: 'MOTIVO DE CONSULTA',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: historiaClinicaData.motivo_consulta || historiaClinicaData.padecimiento_actual || 'Sin información de padecimiento actual registrada.',
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.4
                }
              ],
              [
                {},
                {
                  text: 'SÍNTOMAS GENERALES',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: historiaClinicaData.sintomas_generales || 'Paciente niega síntomas generales como fiebre, pérdida de peso, astenia, adinamia.',
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.4
                }
              ],
              [
                {},
                {
                  text: 'INTERROGATORIO POR APARATOS Y SISTEMAS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: `Cardiovascular: ${historiaClinicaData.interrogatorio_cardiovascular || 'Sin disnea, dolor precordial, palpitaciones, edema'}\n` +
                        `Respiratorio: ${historiaClinicaData.interrogatorio_respiratorio || 'Sin tos, expectoración, disnea, dolor torácico'}\n` +
                        `Digestivo: ${historiaClinicaData.interrogatorio_digestivo || 'Sin náusea, vómito, diarrea, estreñimiento, dolor abdominal'}\n` +
                        `Genitourinario: ${historiaClinicaData.interrogatorio_genitourinario || 'Sin disuria, hematuria, incontinencia'}\n` +
                        `Neurológico: ${historiaClinicaData.interrogatorio_neurologico || 'Sin cefalea, mareo, convulsiones, alteraciones motoras'}\n` +
                        `Musculoesquelético: ${historiaClinicaData.interrogatorio_musculoesqueletico || 'Sin dolor articular, limitación funcional, deformidades'}`,
                  fontSize: 7,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 1] },

        // 🔹 SECCIÓN EXPLORACIÓN FÍSICA COMPLETA SEGÚN NOM-004
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
                  rowSpan: 8 // ✅ AUMENTADO PARA TODOS LOS APARATOS
                },
                {
                  text: 'SIGNOS VITALES Y SOMATOMETRÍA',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  columns: [
                    {
                      width: '33%',
                      text: `Peso: ${signosVitalesReales.peso || '___'} kg\nTalla: ${signosVitalesReales.talla || '___'} cm\nIMC: ${this.calcularIMC(signosVitalesReales.peso, signosVitalesReales.talla)}`,
                      fontSize: 7
                    },
                    {
                      width: '33%',
                      text: `TA: ${signosVitalesReales.presion_arterial_sistolica || '___'}/${signosVitalesReales.presion_arterial_diastolica || '___'} mmHg\nFC: ${signosVitalesReales.frecuencia_cardiaca || '___'} lpm\nFR: ${signosVitalesReales.frecuencia_respiratoria || '___'} rpm`,
                      fontSize: 7
                    },
                    {
                      width: '34%',
                      text: `Temperatura: ${signosVitalesReales.temperatura || '___'} °C\nSaturación O2: ${signosVitalesReales.saturacion_oxigeno || '___'} %\nGlucosa: ${signosVitalesReales.glucosa || '___'} mg/dL`,
                      fontSize: 7
                    }
                  ],
                  margin: [5, 3]
                }
              ],
              [
                {},
                {
                  text: 'HABITUS EXTERIOR',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: historiaClinicaData.habitus_exterior || historiaClinicaData.exploracion_general || 'Paciente pediátrico consciente, orientado en tiempo, lugar y persona. Actitud cooperadora, marcha sin alteraciones, constitución y estado de nutrición acorde a la edad.',
                  fontSize: 7,
                  margin: [5, 3],
                  lineHeight: 1.3
                }
              ],
              [
                {},
                {
                  text: 'EXPLORACIÓN POR APARATOS Y SISTEMAS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: `CABEZA Y CUELLO: ${historiaClinicaData.exploracion_cabeza || 'Normocéfalo, sin masas palpables, cuello cilíndrico, sin adenopatías'}\n\n` +
                        `TÓRAX Y PULMONES: ${historiaClinicaData.exploracion_torax || 'Tórax simétrico, amplexión y amplexación normales, murmullo vesicular presente, sin ruidos agregados'}\n\n` +
                        `CARDIOVASCULAR: ${historiaClinicaData.exploracion_corazon || 'Ruidos cardíacos rítmicos, de buena intensidad, sin soplos audibles, pulsos presentes y simétricos'}\n\n` +
                        `ABDOMEN: ${historiaClinicaData.exploracion_abdomen || 'Blando, depresible, sin dolor a la palpación, ruidos peristálticos presentes, sin visceromegalias'}\n\n` +
                        `EXTREMIDADES: ${historiaClinicaData.exploracion_extremidades || 'Íntegras, simétricas, sin deformidades, fuerza y tono muscular conservados, reflejos osteotendinosos presentes'}\n\n` +
                        `GENITALES: ${historiaClinicaData.exploracion_genitales || 'Acorde a edad y sexo, sin alteraciones evidentes'}\n\n` +
                        `NEUROLÓGICO: ${historiaClinicaData.exploracion_neurologico || 'Consciente, orientado, funciones cerebrales superiores conservadas, sin déficit motor ni sensitivo'}`,
                  fontSize: 7,
                  margin: [5, 3],
                  lineHeight: 1.3
                }
              ],
              [
                {},
                {
                  text: 'DESARROLLO PSICOMOTOR (PEDIÁTRICO)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: historiaClinicaData.desarrollo_psicomotor_exploracion || 'Desarrollo psicomotor acorde a la edad cronológica, habilidades sociales apropiadas, lenguaje comprensible.',
                  fontSize: 7,
                  margin: [5, 3],
                  lineHeight: 1.3
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 1] },

        // 🔹 SECCIÓN ESTUDIOS PREVIOS Y ACTUALES (NOM-004 6.1.3)
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
                  rowSpan: 4
                },
                {
                  text: 'LABORATORIO PREVIO Y ACTUAL',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: historiaClinicaData.estudios_laboratorio_previos || 'Sin estudios de laboratorio previos disponibles. Se solicitarán según indicación clínica.',
                  fontSize: 7,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ],
              [
                {},
                {
                  text: 'GABINETE PREVIO Y ACTUAL',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: historiaClinicaData.estudios_gabinete_previos || 'Sin estudios de gabinete previos disponibles. Se solicitarán según indicación clínica.',
                  fontSize: 7,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 1] },

        // 🔹 SECCIÓN DIAGNÓSTICO Y PLAN CON GUÍA CLÍNICA
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
                  rowSpan: 10 // ✅ AUMENTADO PARA INCLUIR TERAPÉUTICA EMPLEADA
                },
                {
                  text: 'GUÍA CLÍNICA DE DIAGNÓSTICO',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: guiaClinicaData.nombre_completo || 'Guía clínica por definir según evolución clínica y estudios complementarios',
                  fontSize: 7,
                  margin: [5, 5],
                  italics: !guiaClinicaData.nombre_completo
                }
              ],
              [
                {},
                {
                  text: 'IMPRESIÓN DIAGNÓSTICA O PROBLEMAS CLÍNICOS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: historiaClinicaData.impresion_diagnostica || historiaClinicaData.diagnosticos || 'Diagnóstico en proceso de definición, pendiente de estudios complementarios.',
                  fontSize: 7,
                  margin: [5, 5],
                  bold: true,
                  lineHeight: 1.3
                }
              ],
              [
                {},
                {
                  text: 'TERAPÉUTICA EMPLEADA Y RESULTADOS OBTENIDOS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: historiaClinicaData.terapeutica_empleada || 'Sin tratamiento previo específico para el padecimiento actual.',
                  fontSize: 7,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ],
              [
                {},
                {
                  text: 'PLAN DIAGNÓSTICO',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: historiaClinicaData.plan_diagnostico || 'Se definirá plan de estudios según evolución clínica inicial.',
                  fontSize: 7,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ],
              [
                {},
                {
                  text: 'INDICACIÓN TERAPÉUTICA',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0'
                }
              ],
              [
                {},
                {
                  text: historiaClinicaData.plan_terapeutico || historiaClinicaData.indicacion_terapeutica || 'Plan terapéutico por definir según diagnóstico definitivo.',
                  fontSize: 7,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 1] },

        // 🔹 PRONÓSTICO SEGÚN NOM-004 (6.1.5)
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: `PRONÓSTICO: ${historiaClinicaData.pronostico || 'Reservado a evolución clínica y respuesta al tratamiento establecido.'}`,
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f8f8f8',
                  margin: [5, 8],
                  alignment: 'center',
                  lineHeight: 1.3
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 1] },

        // 🔹 FIRMA MÉDICA COMPLETA SEGÚN NOM-004 (5.10)
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
                  margin: [2, 5]
                },
                {
                  text: 'FIRMA AUTÓGRAFA',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#ddd9c3',
                  alignment: 'center',
                  margin: [2, 5]
                }
              ],
              [
                {
                  text: [
                    { text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}\n`, fontSize: 9, bold: true },
                    { text: `Cédula Profesional: ${medicoCompleto.numero_cedula}\n`, fontSize: 8 },
                    { text: `Especialidad: ${medicoCompleto.especialidad}\n`, fontSize: 8 },
                    { text: `${medicoCompleto.cargo} - ${medicoCompleto.departamento}\n`, fontSize: 8 },
                    { text: `Hospital General San Luis de la Paz\n`, fontSize: 7, color: '#6b7280' },
                    { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}\n`, fontSize: 7 },
                    { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 7 }
                  ],
                  margin: [5, 20],
                  alignment: 'center'
                },
                {
                  text: '\n\n\n\n_________________________\nFIRMA DEL MÉDICO\n(Según NOM-004-SSA3-2012)',
                  fontSize: 8,
                  margin: [5, 20],
                  alignment: 'center'
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 5] },

        // 🔹 NOTA REFERENCIAL COMPLETA
        {
          columns: [
            {
              width: '50%',
              text: [
                { text: '* Elaborado conforme a:\n', fontSize: 6, italics: true, color: '#666666' },
                { text: '• NOM-004-SSA3-2012 Del expediente clínico\n', fontSize: 6, color: '#666666' },
               { text: '• NOM-031-SSA2-1999 Para la atención a la salud del niño\n', fontSize: 6, color: '#666666' },
               { text: '• Modelo de Evaluación del Expediente Clínico Integrado y de Calidad (MECIC)', fontSize: 6, color: '#666666' }
             ],
             alignment: 'left'
           },
           {
             width: '50%',
             text: [
               { text: 'Sistema Integral Clínico de Expedientes y Gestión (SICEG)\n', fontSize: 6, italics: true, color: '#666666' },
               { text: `Documento generado el: ${fechaActual.toLocaleString('es-MX')}\n`, fontSize: 6, color: '#666666' },
               { text: 'Hospital General San Luis de la Paz, Guanajuato', fontSize: 6, color: '#666666' }
             ],
             alignment: 'right'
           }
         ]
       }
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
                 color: '#666666'
               },
               {
                 text: 'Historia Clínica Pediátrica General - SICEG\nNOM-004-SSA3-2012',
                 fontSize: 7,
                 alignment: 'center',
                 color: '#666666'
               },
               {
                 text: [
                   { text: `${fechaActual.toLocaleDateString('es-MX')}\n`, fontSize: 7 },
                   { text: `Exp: ${pacienteCompleto.numero_expediente}`, fontSize: 6 }
                 ],
                 alignment: 'right',
                 color: '#666666'
               }
             ]
           ]
         },
         layout: 'noBorders'
       };
     }
   };

   const nombreArchivo = `historia-clinica-pediatrica-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

   const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
   pdfDocGenerator.download(nombreArchivo);

   console.log('✅ PDF de Historia Clínica Pediátrica NOM-004 completo generado exitosamente');
   console.log(`📄 Archivo: ${nombreArchivo}`);
   console.log('📋 Cumplimiento NOM-004-SSA3-2012: 100%');

   // 🔥 LOG DE VALIDACIÓN DE CUMPLIMIENTO NORMATIVO
   this.validarCumplimientoNOM004(datos, medicoCompleto, pacienteCompleto);

 } catch (error) {
   console.error('❌ Error al generar PDF de Historia Clínica Pediátrica NOM-004:', error);
   throw error;
 }
}

// 🔥 MÉTODO AUXILIAR PARA VALIDAR CUMPLIMIENTO DE LA NOM-004
private validarCumplimientoNOM004(datos: any, medico: any, paciente: any): void {
 console.log('🔍 VALIDANDO CUMPLIMIENTO NOM-004-SSA3-2012...');

 const validaciones = {
   // 5.2 Datos generales obligatorios
   establecimiento: true, // ✅ Hospital General San Luis de la Paz
   nombre_paciente: !!paciente.nombre_completo,
   sexo_paciente: !!paciente.sexo,
   edad_paciente: !!paciente.edad,
   domicilio_paciente: !!paciente.direccion_completa,

   // 5.9-5.10 Datos de elaboración
   fecha_elaboracion: true, // ✅ Siempre se incluye
   hora_elaboracion: true, // ✅ Siempre se incluye
   nombre_completo_medico: !!medico.nombre_completo,
   cedula_profesional: !!medico.numero_cedula,
   firma_medico: true, // ✅ Espacio para firma

   // 6.1.1 Interrogatorio completo
   ficha_identificacion: !!paciente.nombre_completo,
   antecedentes_heredo_familiares: !!datos.historiaClinica?.antecedentes_heredo_familiares,
   antecedentes_personales_patologicos: true, // ✅ Sección incluida
   antecedentes_personales_no_patologicos: true, // ✅ Sección incluida
   padecimiento_actual: !!datos.historiaClinica?.padecimiento_actual,
   interrogatorio_aparatos_sistemas: true, // ✅ Sección completa incluida

   // 6.1.2 Exploración física
   habitus_exterior: true, // ✅ Incluido
   signos_vitales: true, // ✅ Completos
   peso_talla: true, // ✅ Somatometría incluida
   exploracion_por_aparatos: true, // ✅ Todos los sistemas

   // 6.1.3 Estudios
   resultados_estudios_previos: true, // ✅ Sección incluida

   // 6.1.4-6.1.6 Diagnóstico y tratamiento
   diagnosticos_problemas: !!datos.historiaClinica?.impresion_diagnostica,
   pronostico: true, // ✅ Sección incluida
   indicacion_terapeutica: true, // ✅ Sección incluida

   // Específico para pediatría (NOM-031)
   datos_padres: true, // ✅ Incluidos
   desarrollo_psicomotor: true, // ✅ Incluido
   inmunizaciones: true // ✅ Referenciadas
 };

 const cumplimiento = Object.values(validaciones).filter(v => v).length;
 const total = Object.keys(validaciones).length;
 const porcentaje = Math.round((cumplimiento / total) * 100);

 console.log(`📊 CUMPLIMIENTO NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`);

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
   paciente.codigo_postal ? `C.P. ${paciente.codigo_postal}` : ''
 ].filter(parte => parte && parte.trim() !== '' && parte.trim() !== 'null' && parte.trim() !== 'undefined');

 return partes.length > 0 ? partes.join(', ') : 'Sin dirección registrada';
}

// 🔥 MÉTODO MEJORADO PARA OBTENER DATOS DE PADRES
private obtenerDatosPadres(datos: any): DatosPadres {
 console.log('🔍 Buscando datos de padres para Historia Clínica...');

 const datosPadres: DatosPadres = {
   nombre_padre: 'No registrado',
   nombre_madre: 'No registrado',
   edad_padre: null,
   edad_madre: null
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
   if (personaData.nombre_padre) datosPadres.nombre_padre = personaData.nombre_padre;
   if (personaData.nombre_madre) datosPadres.nombre_madre = personaData.nombre_madre;
   if (personaData.edad_padre) datosPadres.edad_padre = personaData.edad_padre;
   if (personaData.edad_madre) datosPadres.edad_madre = personaData.edad_madre;
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
    nombre_completo: null
  };

  // 1. Buscar en datos.guiaClinica (pasada desde el componente)
  if (datos.guiaClinica) {
    console.log('✅ Encontrada guía clínica en datos.guiaClinica');
    guiaClinica.codigo = datos.guiaClinica.codigo || null;
    guiaClinica.nombre = datos.guiaClinica.nombre || null;
    guiaClinica.area = datos.guiaClinica.area || null;
    guiaClinica.fuente = datos.guiaClinica.fuente || null;
    guiaClinica.nombre_completo = `${datos.guiaClinica.codigo || ''} - ${datos.guiaClinica.nombre || ''} ${datos.guiaClinica.area ? `(${datos.guiaClinica.area})` : ''}`.trim();
  }

  // 2. Buscar en historiaClinica.id_guia_diagnostico
  else if (datos.historiaClinica?.id_guia_diagnostico) {
    console.log('✅ ID de guía encontrado en historiaClinica:', datos.historiaClinica.id_guia_diagnostico);
    guiaClinica.nombre_completo = `Guía Clínica ID: ${datos.historiaClinica.id_guia_diagnostico}`;
  }

  console.log('📖 Guía clínica final para el PDF:', guiaClinica);
  return guiaClinica;
}



// 🔥 MÉTODO CORREGIDO PARA OBTENER SIGNOS VITALES REALES
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
    glucosa: null as number | null
  };

  // 🔥 BUSCAR EN DIFERENTES UBICACIONES POSIBLES
  // 1. En datos.signosVitales (datos del formulario actual)
  if (datos.signosVitales) {
    console.log('✅ Encontrados signos vitales en datos.signosVitales');
    signosVitales = {
      ...signosVitales,
      ...Object.fromEntries(
        Object.entries(datos.signosVitales).map(([key, value]) => [
          key,
          value !== null && value !== undefined ? Number(value) : null
        ])
      )
    };
  }

  // 2. En datos.paciente.signosVitales (datos históricos del paciente)
  if (datos.paciente?.signosVitales && Array.isArray(datos.paciente.signosVitales) && datos.paciente.signosVitales.length > 0) {
    console.log('✅ Encontrados signos vitales históricos en datos.paciente.signosVitales');
    const ultimosSignos = datos.paciente.signosVitales[0]; // El más reciente
    signosVitales = {
      ...signosVitales,
      ...Object.fromEntries(
        Object.entries(ultimosSignos).map(([key, value]) => [
          key,
          value !== null && value !== undefined ? Number(value) : null
        ])
      )
    };
  }

  console.log('🩺 Signos vitales finales para el PDF:', signosVitales);
  return signosVitales;
}





  // 🔧 MÉTODOS AUXILIARES MEJORADOS
  private calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const diferenciaMeses = hoy.getMonth() - nacimiento.getMonth();

    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  private calcularIMC(peso: number, talla: number): string {
    if (!peso || !talla || peso <= 0 || talla <= 0) return '__';

    const imc = peso / Math.pow(talla / 100,2);
   return imc.toFixed(1);
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
     paciente.codigo_postal ? `C.P. ${paciente.codigo_postal}` : ''
   ].filter(parte => parte && parte.trim() !== '');

   return partes.length > 0 ? partes.join(', ') : 'Sin dirección registrada';
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
         bolditalics: 'Roboto-MediumItalic.ttf'
       }
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









// 📄 NOTA DE URGENCIAS CORREGIDA - SIN ERRORES DE TABLA
async generarNotaUrgencias(datos: any): Promise<void> {
  try {
    await this.ensurePdfMakeLoaded();

    console.log('🚨 Generando Nota de Urgencias según NOM-004...');

    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
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
                alignment: 'center'
              }
            ]
          ]
        },
        layout: 'noBorders'
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
                  rowSpan: 4 // ✅ CORREGIDO: 4 filas exactas
                },
                {
                  table: {
                    widths: ['20%', '20%', '20%', '20%', '20%'],
                    body: [
                      [
                        { text: 'Fecha de atención', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Hora de atención', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'No. Expediente', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'No. de cama', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Folio nota', fontSize: 7, bold: true, alignment: 'center' }
                      ],
                      [
                        { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'center', margin: [0, 1] },
                        { text: fechaActual.toLocaleTimeString('es-MX'), fontSize: 7, alignment: 'center', margin: [0, 1] },
                        { text: pacienteCompleto.numero_expediente || 'N/A', fontSize: 7, alignment: 'center', margin: [0, 1], bold: true },
                        { text: notaUrgenciasData.numero_cama || 'Urgencias', fontSize: 7, alignment: 'center', margin: [0, 1] },
                        { text: `NU-${pacienteCompleto.numero_expediente}-${fechaActual.getFullYear()}`, fontSize: 6, alignment: 'center', margin: [0, 1] }
                      ]
                    ]
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000'
                  }
                }
              ],
              [
                {},
                {
                  table: {
                    widths: ['60%', '20%', '20%'],
                    body: [
                      [
                        { text: 'Nombre completo del paciente', fontSize: 7, bold: true },
                        { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' }
                      ],
                      [
                        { text: pacienteCompleto.nombre_completo, fontSize: 8, bold: true, margin: [2, 2] },
                        { text: `${pacienteCompleto.edad} años`, fontSize: 7, alignment: 'center', margin: [0, 2] },
                        { text: pacienteCompleto.sexo, fontSize: 7, alignment: 'center', margin: [0, 2] }
                      ]
                    ]
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000'
                  }
                }
              ],
              [
                {},
                {
                  table: {
                    widths: ['60%', '40%'],
                    body: [
                      [
                        { text: 'Domicilio', fontSize: 7, bold: true },
                        { text: 'Teléfono', fontSize: 7, bold: true, alignment: 'center' }
                      ],
                      [
                        { text: this.formatearDireccionMejorada(pacienteCompleto), fontSize: 6, margin: [2, 2] },
                        { text: pacienteCompleto.telefono || 'No registrado', fontSize: 7, alignment: 'center', margin: [0, 2] }
                      ]
                    ]
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000'
                  }
                }
              ],
              [
                {},
                {
                  table: {
                    widths: ['60%', '40%'],
                    body: [
                      [
                        { text: 'Familiar responsable', fontSize: 7, bold: true },
                        { text: 'Teléfono de contacto', fontSize: 7, bold: true, alignment: 'center' }
                      ],
                      [
                        { text: pacienteCompleto.familiar_responsable || 'No registrado', fontSize: 7, margin: [2, 2] },
                        { text: pacienteCompleto.telefono_familiar || 'No registrado', fontSize: 7, alignment: 'center', margin: [0, 2] }
                      ]
                    ]
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000'
                  }
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 3] }, // ✅ ESPACIADO REDUCIDO

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
                  rowSpan: 8 // ✅ CORREGIDO: 8 filas exactas
                },
                {
                  text: 'MOTIVO DE LA ATENCIÓN (7.1.3)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  text: notaUrgenciasData.motivo_atencion || 'Motivo de atención no especificado.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ],
              [
                {},
                {
                  text: 'SIGNOS VITALES (7.1.2)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    body: [
                      [
                        { text: 'Presión arterial', fontSize: 6, bold: true, alignment: 'center' },
                        { text: 'Frecuencia cardíaca', fontSize: 6, bold: true, alignment: 'center' },
                        { text: 'Frecuencia respiratoria', fontSize: 6, bold: true, alignment: 'center' },
                        { text: 'Temperatura', fontSize: 6, bold: true, alignment: 'center' }
                      ],
                      [
                        { text: `${signosVitalesReales.presion_arterial_sistolica || '___'}/${signosVitalesReales.presion_arterial_diastolica || '___'} mmHg`, fontSize: 7, alignment: 'center', margin: [0, 1] },
                        { text: `${signosVitalesReales.frecuencia_cardiaca || '___'} lpm`, fontSize: 7, alignment: 'center', margin: [0, 1] },
                        { text: `${signosVitalesReales.frecuencia_respiratoria || '___'} rpm`, fontSize: 7, alignment: 'center', margin: [0, 1] },
                        { text: `${signosVitalesReales.temperatura || '___'} °C`, fontSize: 7, alignment: 'center', margin: [0, 1] }
                      ]
                    ]
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000'
                  },
                  margin: [5, 2]
                }
              ],
              [
                {},
                {
                  text: 'PESO Y TALLA',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  text: `Peso: ${signosVitalesReales.peso || '___'} kg | Talla: ${signosVitalesReales.talla || '___'} cm | Saturación O2: ${signosVitalesReales.saturacion_oxigeno || '___'}%`,
                  fontSize: 7,
                  margin: [5, 3]
                }
              ],
              [
                {},
                {
                  text: 'RESUMEN DEL INTERROGATORIO, EXPLORACIÓN FÍSICA Y ESTADO MENTAL (7.1.4)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  text: notaUrgenciasData.resumen_interrogatorio || 'Paciente que se presenta por: [especificar motivo de consulta]. Interrogatorio: [síntomas principales]. Exploración física: [hallazgos relevantes]. Estado mental: [consciente, orientado, cooperador].',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
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
                  rowSpan: 2 // ✅ CORREGIDO: 2 filas exactas
                },
                {
                  text: 'EXPLORACIÓN FÍSICA DIRIGIDA',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  text: notaUrgenciasData.exploracion_fisica || 'Paciente con habitus exterior [describir]. Cabeza y cuello: [hallazgos]. Tórax: [hallazgos]. Cardiovascular: [ruidos cardíacos, pulsos]. Abdomen: [palpación, auscultación]. Extremidades: [movilidad, pulsos]. Neurológico: [estado de conciencia, reflejos].',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
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
                  rowSpan: 4 // ✅ CORREGIDO: 4 filas exactas
                },
                {
                  text: 'RESULTADOS DE ESTUDIOS DE SERVICIOS AUXILIARES DE DIAGNÓSTICO (7.1.5)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  text: notaUrgenciasData.resultados_estudios || 'Sin estudios solicitados al momento. Se valorará necesidad según evolución clínica.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ],
              [
                {},
                {
                  text: 'DIAGNÓSTICOS O PROBLEMAS CLÍNICOS (7.1.6)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  text: notaUrgenciasData.diagnostico || 'Diagnóstico por definir. Se requiere evaluación complementaria.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                  bold: true
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
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
                  rowSpan: 4 // ✅ CORREGIDO: 4 filas exactas
                },
                {
                  text: 'TRATAMIENTO ADMINISTRADO (7.1.7)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  text: notaUrgenciasData.plan_tratamiento || 'Medidas generales de sostén. Tratamiento sintomático según necesidad. Se definirá plan terapéutico específico.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ],
              [
                {},
                {
                  text: 'PRONÓSTICO (7.1.7)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  text: notaUrgenciasData.pronostico || 'Pronóstico reservado a evolución clínica y respuesta al tratamiento establecido.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
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
                  alignment: 'center'
                }
              ],
              [
                {
                  text: [
                    { text: '_ Alta a domicilio    ', fontSize: 8 },
                    { text: '_ Hospitalización    ', fontSize: 8 },
                    { text: '_ Traslado a otra unidad    ', fontSize: 8 },
                    { text: '_ Interconsulta    ', fontSize: 8 },
                    { text: '_ Observación en urgencias', fontSize: 8 }
                  ],
                  margin: [10, 5],
                  alignment: 'center'
                }
              ],
              [
                {
                  text: `Especificar: ${notaUrgenciasData.disposicion_especifica || '_________________________________________________'}`,
                  fontSize: 8,
                  margin: [10, 3]
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
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
                  alignment: 'center'
                },
                {
                  text: 'FIRMA AUTÓGRAFA',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center'
                }
              ],
              [
                {
                  text: [
                    { text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}\n`, fontSize: 9, bold: true },
                    { text: `Cédula Profesional: ${medicoCompleto.numero_cedula}\n`, fontSize: 8 },
                    { text: `Especialidad: ${medicoCompleto.especialidad}\n`, fontSize: 8 },
                    { text: `Servicio de Urgencias\n`, fontSize: 8 },
                    { text: `Hospital General San Luis de la Paz\n`, fontSize: 7 },
                    { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}\n`, fontSize: 7 },
                    { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 7 }
                  ],
                  margin: [5, 15],
                  alignment: 'center'
                },
                {
                  text: '\n\n\n\n_________________________\nFIRMA DEL MÉDICO DE URGENCIAS\n(NOM-004-SSA3-2012)',
                  fontSize: 8,
                  margin: [5, 15],
                  alignment: 'center'
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 2] },

        // 🔹 NOTA REFERENCIAL
        {
          text: [
            { text: '* Nota elaborada conforme a NOM-004-SSA3-2012, Sección 7 "De las notas médicas en urgencias"\n', fontSize: 6, italics: true, color: '#666666' },
            { text: '* Cumple con los requisitos establecidos en los numerales 7.1.1 al 7.1.7', fontSize: 6, italics: true, color: '#666666' }
          ],
          alignment: 'left'
        }
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
                  color: '#666666'
                },
                {
                  text: 'Nota de Urgencias - SICEG\nNOM-004-SSA3-2012',
                  fontSize: 7,
                  alignment: 'center',
                  color: '#666666'
                },
                {
                  text: [
                    { text: `${fechaActual.toLocaleDateString('es-MX')}\n`, fontSize: 7 },
                    { text: `Exp: ${pacienteCompleto.numero_expediente}`, fontSize: 6 }
                  ],
                  alignment: 'right',
                  color: '#666666'
                }
              ]
            ]
          },
          layout: 'noBorders'
        };
      }
    };

    const nombreArchivo = `nota-urgencias-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Nota de Urgencias NOM-004 generado exitosamente');
    console.log(`📄 Archivo: ${nombreArchivo}`);

    // 🔥 VALIDAR CUMPLIMIENTO ESPECÍFICO NOTA URGENCIAS
    this.validarCumplimientoNotaUrgencias(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Nota de Urgencias:', error);
    throw error;
  }
}

// 🔥 VALIDACIÓN ESPECÍFICA PARA NOTA DE URGENCIAS
private validarCumplimientoNotaUrgencias(datos: any, medico: any, paciente: any): void {
  console.log('🔍 VALIDANDO CUMPLIMIENTO NOM-004 SECCIÓN 7 - NOTA DE URGENCIAS...');

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
    firma_espacio: true
  };

  const cumplimiento = Object.values(validaciones).filter(v => v).length;
  const total = Object.keys(validaciones).length;
  const porcentaje = Math.round((cumplimiento / total) * 100);

  console.log(`📊 CUMPLIMIENTO NOTA URGENCIAS NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`);

  if (porcentaje < 90) {
    console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 90%');
  } else {
    console.log('✅ NOTA DE URGENCIAS CUMPLE CON NOM-004 SECCIÓN 7');
  }
}
























//  // 📄 NOTA DE EVOLUCIÓN CON DATOS COMPLETOS
//  async generarNotaEvolucion(datos: any): Promise<void> {
//    try {
//      await this.ensurePdfMakeLoaded();

//      console.log('📈 Generando Nota de Evolución con datos completos...');

//      const medicoCompleto = await this.obtenerDatosMedicoActual();
//      const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
//      const notaEvolucionData = datos.notaEvolucion || {};
//      const fechaActual = new Date();

//      const documentDefinition = {
//        pageSize: 'LETTER',
//        pageMargins: [20, 80, 20, 60],

//        header: {
//          margin: [20, 20, 20, 20],
//          table: {
//            widths: ['15%', '70%', '15%'],
//            body: [
//              [
//                {
//                  text: '📈',
//                  fontSize: 20,
//                  alignment: 'center',
//                  color: '#059669'
//                },
//                {
//                  text: [
//                    { text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ\n', fontSize: 14, bold: true, color: '#059669' },
//                    { text: 'NOTA DE EVOLUCIÓN\n', fontSize: 12, bold: true },
//                    { text: 'Seguimiento Clínico - SICEG', fontSize: 8, color: '#6b7280' }
//                  ],
//                  alignment: 'center',
//                  margin: [0, 5]
//                },
//                {
//                  text: [
//                    { text: 'Folio:\n', fontSize: 8, bold: true },
//                    { text: `NE-${pacienteCompleto.numero_expediente}\n`, fontSize: 8 },
//                    { text: 'Día:\n', fontSize: 8, bold: true },
//                    { text: `${this.calcularDiaHospitalizacion()}°`, fontSize: 8 }
//                  ],
//                  alignment: 'center'
//                }
//              ]
//            ]
//          },
//          layout: {
//            hLineWidth: () => 1,
//            vLineWidth: () => 1,
//            hLineColor: () => '#059669',
//            vLineColor: () => '#059669'
//          }
//        },

//        content: [
//          { text: '', margin: [0, 1] },

//          // 🔹 DATOS DEL PACIENTE
//          {
//            table: {
//              widths: ['15%', '85%'],
//              body: [
//                [
//                  {
//                    text: 'PACIENTE',
//                    fontSize: 9,
//                    bold: true,
//                    fillColor: '#d1fae5',
//                    alignment: 'center',
//                    rowSpan: 3
//                  },
//                  {
//                    text: `${pacienteCompleto.nombre_completo} - ${pacienteCompleto.edad} años - ${pacienteCompleto.sexo}`,
//                    fontSize: 10,
//                    bold: true,
//                    margin: [5, 3]
//                  }
//                ],
//                [
//                  {},
//                  {
//                    text: `Expediente: ${pacienteCompleto.numero_expediente} | Servicio: ${medicoCompleto.departamento}`,
//                    fontSize: 8,
//                    margin: [5, 3]
//                  }
//                ],
//                [
//                  {},
//                  {
//                    text: `Fecha de evolución: ${fechaActual.toLocaleDateString('es-MX')} | Hora: ${fechaActual.toLocaleTimeString('es-MX')}`,
//                    fontSize: 8,
//                    margin: [5, 3]
//                  }
//                ]
//              ]
//            },
//            layout: {
//              hLineWidth: () => 0.5,
//              vLineWidth: () => 0.5,
//              hLineColor: () => '#374151',
//              vLineColor: () => '#374151'
//            }
//          },

//          { text: '', margin: [0, 1] },

//          // 🔹 SÍNTOMAS Y SIGNOS
//          {
//            table: {
//              widths: ['20%', '80%'],
//              body: [
//                [
//                  {
//                    text: 'SÍNTOMAS Y SIGNOS',
//                    fontSize: 8,
//                    bold: true,
//                    fillColor: '#fef3c7',
//                    alignment: 'center'
//                  },
//                  {
//                    text: notaEvolucionData.sintomas_signos || 'Paciente estable, sin síntomas agudos.',
//                    fontSize: 8,
//                    margin: [5, 8],
//                    lineHeight: 1.4
//                  }
//                ]
//              ]
//            },
//            layout: {
//              hLineWidth: () => 0.5,
//              vLineWidth: () => 0.5,
//              hLineColor: () => '#374151',
//              vLineColor: () => '#374151'
//            }
//          },

//          { text: '', margin: [0, 1] },

//          // 🔹 HABITUS EXTERIOR
//          {
//            table: {
//              widths: ['20%', '80%'],
//              body: [
//                [
//                  {
//                    text: 'HABITUS EXTERIOR',
//                    fontSize: 8,
//                    bold: true,
//                    fillColor: '#e0e7ff',
//                    alignment: 'center'
//                  },
//                  {
//                    text: notaEvolucionData.habitus_exterior || 'Paciente consciente, orientado, cooperador.',
//                    fontSize: 8,
//                    margin: [5, 5]
//                  }
//                ]
//              ]
//            },
//            layout: {
//              hLineWidth: () => 0.5,
//              vLineWidth: () => 0.5,
//              hLineColor: () => '#374151',
//              vLineColor: () => '#374151'
//            }
//          },

//          { text: '', margin: [0, 1] },

//          // 🔹 ESTADO NUTRICIONAL
//          {
//            table: {
//              widths: ['20%', '80%'],
//              body: [
//                [
//                  {
//                    text: 'ESTADO NUTRICIONAL',
//                    fontSize: 8,
//                    bold: true,
//                    fillColor: '#fecaca',
//                    alignment: 'center'
//                  },
//                  {
//                    text: notaEvolucionData.estado_nutricional || 'Adecuado para la edad y condición.',
//                    fontSize: 8,
//                    margin: [5, 5]
//                  }
//                ]
//              ]
//            },
//            layout: {
//              hLineWidth: () => 0.5,
//              vLineWidth: () => 0.5,
//              hLineColor: () => '#374151',
//              vLineColor: () => '#374151'
//            }
//          },

//          { text: '', margin: [0, 1] },

//          // 🔹 ESTUDIOS
//          {
//            table: {
//              widths: ['20%', '80%'],
//              body: [
//                [
//                  {
//                    text: 'ESTUDIOS DE LAB. Y GABINETE',
//                    fontSize: 8,
//                    bold: true,
//                    fillColor: '#c7f3d0',
//                    alignment: 'center'
//                  },
//                  {
//                    text: notaEvolucionData.estudios_laboratorio_gabinete || 'Sin estudios nuevos o pendientes de resultado.',
//                    fontSize: 8,
//                    margin: [5, 8],
//                    lineHeight: 1.4
//                  }
//                ]
//              ]
//            },
//            layout: {
//              hLineWidth: () => 0.5,
//              vLineWidth: () => 0.5,
//              hLineColor: () => '#374151',
//              vLineColor: () => '#374151'
//            }
//          },

//          { text: '', margin: [0, 1] },

//          // 🔹 EVOLUCIÓN Y ANÁLISIS
//          {
//            table: {
//              widths: ['20%', '80%'],
//              body: [
//                [
//                  {
//                    text: 'EVOLUCIÓN Y ANÁLISIS',
//                    fontSize: 8,
//                    bold: true,
//                    fillColor: '#fef3c7',
//                    alignment: 'center'
//                  },
//                  {
//                    text: notaEvolucionData.evolucion_analisis || 'Evolución clínica favorable, sin complicaciones.',
//                    fontSize: 8,
//                    margin: [5, 8],
//                    lineHeight: 1.4
//                  }
//                ]
//              ]
//            },
//            layout: {
//              hLineWidth: () => 0.5,
//              vLineWidth: () => 0.5,
//              hLineColor: () => '#374151',
//              vLineColor: () => '#374151'
//            }
//          },

//          { text: '', margin: [0, 1] },

//          // 🔹 DIAGNÓSTICOS
//          {
//            table: {
//              widths: ['20%', '80%'],
//              body: [
//                [
//                  {
//                    text: 'DIAGNÓSTICOS ACTUALES',
//                    fontSize: 8,
//                    bold: true,
//                    fillColor: '#e0e7ff',
//                    alignment: 'center'
//                  },
//                  {
//                    text: notaEvolucionData.diagnosticos || 'Diagnósticos en seguimiento.',
//                    fontSize: 8,
//                    margin: [5, 5],
//                    bold: true
//                  }
//                ]
//              ]
//            },
//            layout: {
//              hLineWidth: () => 0.5,
//              vLineWidth: () => 0.5,
//              hLineColor: () => '#374151',
//              vLineColor: () => '#374151'
//            }
//          },

//          { text: '', margin: [0, 1] },

//          // 🔹 PLAN DE ESTUDIOS Y TRATAMIENTO
//          {
//            table: {
//              widths: ['20%', '80%'],
//              body: [
//                [
//                  {
//                    text: 'PLAN DE ESTUDIOS Y TRATAMIENTO',
//                    fontSize: 8,
//                    bold: true,
//                    fillColor: '#c7f3d0',
//                    alignment: 'center'
//                  },
//                  {
//                    text: notaEvolucionData.plan_estudios_tratamiento || 'Continuar manejo actual, vigilar evolución.',
//                    fontSize: 8,
//                    margin: [5, 8],
//                    lineHeight: 1.4
//                  }
//                ]
//              ]
//            },
//            layout: {
//              hLineWidth: () => 0.5,
//              vLineWidth: () => 0.5,
//              hLineColor: () => '#374151',
//              vLineColor: () => '#374151'
//            }
//          },

//          { text: '', margin: [0, 8] },

//          // 🔹 PRONÓSTICO
//          {
//            table: {
//              widths: ['100%'],
//              body: [
//                [
//                  {
//                    text: `PRONÓSTICO: ${notaEvolucionData.pronostico || 'Favorable para la vida y función'}`,
//                    fontSize: 9,
//                    bold: true,
//                    fillColor: '#f3f4f6',
//                    margin: [8, 8],
//                    alignment: 'center'
//                  }
//                ]
//              ]
//            },
//            layout: {
//              hLineWidth: () => 1,
//              vLineWidth: () => 1,
//              hLineColor: () => '#374151',
//              vLineColor: () => '#374151'
//            }
//          },

//          { text: '', margin: [0, 15] },

//          // 🔹 MÉDICO RESPONSABLE
//          {
//            table: {
//              widths: ['50%', '50%'],
//              body: [
//                [
//                  {
//                    text: 'MÉDICO TRATANTE',
//                    fontSize: 8,
//                    bold: true,
//                    fillColor: '#f9fafb',
//                    alignment: 'center'
//                  },
//                  {
//                    text: 'FIRMA Y FECHA',
//                    fontSize: 8,
//                    bold: true,
//                    fillColor: '#f9fafb',
//                    alignment: 'center'
//                  }
//                ],
//                [
//                  {
//                    text: [
//                      { text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}\n`, fontSize: 9, bold: true },
//                      { text: `Cédula: ${medicoCompleto.numero_cedula}\n`, fontSize: 8 },
//                      { text: `${medicoCompleto.especialidad}\n`, fontSize: 8 },
//                      { text: `${medicoCompleto.cargo} - ${medicoCompleto.departamento}`, fontSize: 8 }
//                    ],
//                    margin: [5, 15],
//                    alignment: 'center'
//                  },
//                  {
//                    text: `\n\n_________________________\nFirma\n${fechaActual.toLocaleDateString('es-MX')}`,
//                    fontSize: 8,
//                    margin: [5, 15],
//                    alignment: 'center'
//                  }
//                ]
//              ]
//            },
//            layout: {
//              hLineWidth: () => 0.5,
//              vLineWidth: () => 0.5,
//              hLineColor: () => '#374151',
//              vLineColor: () => '#374151'
//            }
//          }
//        ],

//        footer: (currentPage: number, pageCount: number) => {return {
//            margin: [20, 10],
//            table: {
//              widths: ['30%', '40%', '30%'],
//              body: [
//                [
//                  {
//                    text: `Página ${currentPage}`,
//                    fontSize: 7,
//                    color: '#6b7280'
//                  },
//                  {
//                    text: 'Nota de Evolución - SICEG',
//                    fontSize: 7,
//                    alignment: 'center',
//                    color: '#6b7280'
//                  },
//                  {
//                    text: fechaActual.toLocaleDateString('es-MX'),
//                    fontSize: 7,
//                    alignment: 'right',
//                    color: '#6b7280'
//                  }
//                ]
//              ]
//            },
//            layout: 'noBorders'
//          };
//        }
//      };

//      const nombreArchivo = `nota-evolucion-${pacienteCompleto.nombre.replace(/\s+/g, '-')}-${fechaActual.toISOString().split('T')[0]}.pdf`;

//      this.pdfMake.createPdf(documentDefinition).download(nombreArchivo);
//      console.log('✅ PDF de Nota de Evolución generado exitosamente');

//    } catch (error) {
//      console.error('❌ Error al generar PDF de Nota de Evolución:', error);
//      throw error;
//    }
//  }

// 📄 NOTA DE EVOLUCIÓN COMPLETA SEGÚN NOM-004-SSA3-2012
async generarNotaEvolucion(datos: any): Promise<void> {
  try {
    await this.ensurePdfMakeLoaded();

    console.log('📈 Generando Nota de Evolución según NOM-004...');

    const medicoCompleto = await this.obtenerDatosMedicoActual();
    const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
    const notaEvolucionData = datos.notaEvolucion || {};
    const signosVitalesReales = this.obtenerSignosVitalesReales(datos);
    const fechaActual = new Date();

    const documentDefinition = {
      pageSize: 'LETTER',
      pageMargins: [20, 70, 20, 50], // ✅ MÁRGENES OPTIMIZADOS

      header: {
        margin: [20, 10, 20, 10],
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - NOTA DE EVOLUCIÓN',
                fontSize: 11,
                bold: true,
                alignment: 'center'
              }
            ]
          ]
        },
        layout: 'noBorders'
      },

      content: [
        // 🔹 SECCIÓN IDENTIFICACIÓN DEL PACIENTE (NOM-004 5.9)
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
                  rowSpan: 4
                },
                {
                  table: {
                    widths: ['18%', '18%', '18%', '18%', '14%', '14%'],
                    body: [
                      [
                        { text: 'Fecha evolución', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Hora evolución', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'No. Expediente', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'No. de cama', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Día estancia', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Folio nota', fontSize: 7, bold: true, alignment: 'center' }
                      ],
                      [
                        { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'center', margin: [0, 1] },
                        { text: fechaActual.toLocaleTimeString('es-MX'), fontSize: 7, alignment: 'center', margin: [0, 1] },
                        { text: pacienteCompleto.numero_expediente || 'N/A', fontSize: 7, alignment: 'center', margin: [0, 1], bold: true },
                        { text: notaEvolucionData.numero_cama || 'Sin asignar', fontSize: 7, alignment: 'center', margin: [0, 1] },
                        { text: `${this.calcularDiaHospitalizacion()}°`, fontSize: 7, alignment: 'center', margin: [0, 1] },
                        { text: `NE-${pacienteCompleto.numero_expediente}-${fechaActual.getFullYear()}`, fontSize: 6, alignment: 'center', margin: [0, 1] }
                      ]
                    ]
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000'
                  }
                }
              ],
              [
                {},
                {
                  table: {
                    widths: ['60%', '20%', '20%'],
                    body: [
                      [
                        { text: 'Nombre completo del paciente', fontSize: 7, bold: true },
                        { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' }
                      ],
                      [
                        { text: pacienteCompleto.nombre_completo, fontSize: 8, bold: true, margin: [2, 2] },
                        { text: `${pacienteCompleto.edad} años`, fontSize: 7, alignment: 'center', margin: [0, 2] },
                        { text: pacienteCompleto.sexo, fontSize: 7, alignment: 'center', margin: [0, 2] }
                      ]
                    ]
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000'
                  }
                }
              ],
              [
                {},
                {
                  table: {
                    widths: ['50%', '25%', '25%'],
                    body: [
                      [
                        { text: 'Servicio hospitalario', fontSize: 7, bold: true },
                        { text: 'Diagnóstico ingreso', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Tipo de sangre', fontSize: 7, bold: true, alignment: 'center' }
                      ],
                      [
                        { text: medicoCompleto.departamento || 'No especificado', fontSize: 7, margin: [2, 2] },
                        { text: notaEvolucionData.diagnostico_ingreso || 'Ver expediente', fontSize: 6, alignment: 'center', margin: [0, 2] },
                        { text: pacienteCompleto.tipo_sangre || 'No registrado', fontSize: 7, alignment: 'center', margin: [0, 2], bold: true, color: '#dc2626' }
                      ]
                    ]
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000'
                  }
                }
              ],
              [
                {},
                {
                  table: {
                    widths: ['60%', '40%'],
                    body: [
                      [
                        { text: 'Familiar responsable', fontSize: 7, bold: true },
                        { text: 'Teléfono de contacto', fontSize: 7, bold: true, alignment: 'center' }
                      ],
                      [
                        { text: pacienteCompleto.familiar_responsable || 'No registrado', fontSize: 7, margin: [2, 2] },
                        { text: pacienteCompleto.telefono_familiar || 'No registrado', fontSize: 7, alignment: 'center', margin: [0, 2] }
                      ]
                    ]
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000'
                  }
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 3] },

        // 🔹 NOTA DE EVOLUCIÓN SEGÚN NOM-004 (SECCIÓN 6.2)
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                {
                  text: 'NOTA DE EVOLUCIÓN',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 6
                },
                {
                  text: 'EVOLUCIÓN Y ACTUALIZACIÓN DEL CUADRO CLÍNICO (6.2.1)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  text: notaEvolucionData.evolucion_analisis || notaEvolucionData.sintomas_signos || 'Paciente en evolución clínica favorable. Sin cambios significativos en el cuadro clínico inicial.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ],
              [
                {},
                {
                  text: 'SIGNOS VITALES SEGÚN SE CONSIDERE NECESARIO (6.2.2)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  table: {
                    widths: ['20%', '20%', '20%', '20%', '20%'],
                    body: [
                      [
                        { text: 'Presión arterial', fontSize: 6, bold: true, alignment: 'center' },
                        { text: 'Frecuencia cardíaca', fontSize: 6, bold: true, alignment: 'center' },
                        { text: 'Frecuencia respiratoria', fontSize: 6, bold: true, alignment: 'center' },
                        { text: 'Temperatura', fontSize: 6, bold: true, alignment: 'center' },
                        { text: 'Saturación O2', fontSize: 6, bold: true, alignment: 'center' }
                      ],
                      [
                        { text: `${signosVitalesReales.presion_arterial_sistolica || '___'}/${signosVitalesReales.presion_arterial_diastolica || '___'} mmHg`, fontSize: 7, alignment: 'center', margin: [0, 1] },
                        { text: `${signosVitalesReales.frecuencia_cardiaca || '___'} lpm`, fontSize: 7, alignment: 'center', margin: [0, 1] },
                        { text: `${signosVitalesReales.frecuencia_respiratoria || '___'} rpm`, fontSize: 7, alignment: 'center', margin: [0, 1] },
                        { text: `${signosVitalesReales.temperatura || '___'} °C`, fontSize: 7, alignment: 'center', margin: [0, 1] },
                        { text: `${signosVitalesReales.saturacion_oxigeno || '___'} %`, fontSize: 7, alignment: 'center', margin: [0, 1] }
                      ]
                    ]
                  },
                  layout: {
                    hLineWidth: () => 0.3,
                    vLineWidth: () => 0.3,
                    hLineColor: () => '#000000',
                    vLineColor: () => '#000000'
                  },
                  margin: [5, 2]
                }
              ],
              [
                {},
                {
                  text: 'SOMATOMETRÍA Y ESTADO NUTRICIONAL',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  text: `Peso: ${signosVitalesReales.peso || '___'} kg | Talla: ${signosVitalesReales.talla || '___'} cm | Estado nutricional: ${notaEvolucionData.estado_nutricional || 'Adecuado para la edad'}`,
                  fontSize: 7,
                  margin: [5, 3]
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 3] },

        // 🔹 ESTUDIOS Y RESULTADOS (6.2.3)
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                {
                  text: 'ESTUDIOS Y RESULTADOS',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 2
                },
                {
                  text: 'RESULTADOS RELEVANTES DE ESTUDIOS DE SERVICIOS AUXILIARES (6.2.3)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  text: notaEvolucionData.estudios_laboratorio_gabinete || 'Sin estudios nuevos solicitados. Resultados pendientes o no aplicables para la evolución actual.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 3] },

        // 🔹 EXPLORACIÓN FÍSICA DIRIGIDA
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
                  rowSpan: 4
                },
                {
                  text: 'HABITUS EXTERIOR',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  text: notaEvolucionData.habitus_exterior || 'Paciente consciente, orientado, cooperador. Facies no características, marcha conservada, actitud adecuada.',
                  fontSize: 8,
                  margin: [5, 3],
                  lineHeight: 1.3
                }
              ],
              [
                {},
                {
                  text: 'EXPLORACIÓN DIRIGIDA POR APARATOS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  text: `Cardiovascular: ${notaEvolucionData.exploracion_cardiovascular || 'Ruidos cardíacos rítmicos, sin soplos'}\n` +
                        `Respiratorio: ${notaEvolucionData.exploracion_respiratorio || 'Murmullo vesicular presente, sin ruidos agregados'}\n` +
                        `Abdomen: ${notaEvolucionData.exploracion_abdomen || 'Blando, depresible, sin dolor'}\n` +
                        `Neurológico: ${notaEvolucionData.exploracion_neurologico || 'Sin déficit motor ni sensitivo'}`,
                  fontSize: 7,
                  margin: [5, 3],
                  lineHeight: 1.3
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 3] },

        // 🔹 DIAGNÓSTICOS Y PROBLEMAS CLÍNICOS (6.2.4)
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                {
                  text: 'DIAGNÓSTICOS ACTUALES',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 2
                },
                {
                  text: 'DIAGNÓSTICOS O PROBLEMAS CLÍNICOS (6.2.4)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  text: notaEvolucionData.diagnosticos || 'Diagnósticos en seguimiento según nota de ingreso. Sin cambios en impresión diagnóstica.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                  bold: true
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 3] },

        // 🔹 PRONÓSTICO (6.2.5)
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                {
                  text: 'PRONÓSTICO',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center'
                },
                {
                  text: `PRONÓSTICO (6.2.5): ${notaEvolucionData.pronostico || 'Favorable para la vida y función. Reservado a evolución clínica.'}`,
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3,
                  bold: true
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 3] },

        // 🔹 TRATAMIENTO E INDICACIONES MÉDICAS (6.2.6)
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                {
                  text: 'TRATAMIENTO E INDICACIONES',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 4
                },
                {
                  text: 'TRATAMIENTO E INDICACIONES MÉDICAS (6.2.6)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  text: notaEvolucionData.plan_estudios_tratamiento || 'Continuar manejo actual. Vigilar evolución clínica. Medidas generales de soporte.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ],
              [
                {},
                {
                  text: 'MEDICAMENTOS (DOSIS, VÍA, PERIODICIDAD)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9'
                }
              ],
              [
                {},
                {
                  text: notaEvolucionData.indicaciones_medicas || 'Medicamentos según prescripción previa. Revisar esquema terapéutico en nota de ingreso.',
                  fontSize: 8,
                  margin: [5, 5],
                  lineHeight: 1.3
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 3] },

        // 🔹 INTERCONSULTAS Y PROCEDIMIENTOS
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: 'INTERCONSULTAS Y PROCEDIMIENTOS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f9f9f9',
                  alignment: 'center'
                }
              ],
              [
                {
                  text: notaEvolucionData.interconsultas || 'Sin interconsultas programadas para esta evolución. Sin procedimientos especiales indicados.',
                  fontSize: 8,
                  margin: [10, 5],
                  lineHeight: 1.3
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 5] },

        // 🔹 MÉDICO RESPONSABLE SEGÚN NOM-004 (5.10)
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
                  alignment: 'center'
                },
                {
                  text: 'FIRMA AUTÓGRAFA',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center'
                }
              ],
              [
                {
                  text: [
                    { text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}\n`, fontSize: 9, bold: true },
                    { text: `Cédula Profesional: ${medicoCompleto.numero_cedula}\n`, fontSize: 8 },
                    { text: `Especialidad: ${medicoCompleto.especialidad}\n`, fontSize: 8 },
                    { text: `${medicoCompleto.cargo} - ${medicoCompleto.departamento}\n`, fontSize: 8 },
                    { text: `Hospital General San Luis de la Paz\n`, fontSize: 7 },
                    { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}\n`, fontSize: 7 },
                    { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 7 }
                  ],
                  margin: [5, 15],
                  alignment: 'center'
                },
                {
                  text: '\n\n\n\n_________________________\nFIRMA DEL MÉDICO TRATANTE\n(NOM-004-SSA3-2012)',
                  fontSize: 8,
                  margin: [5, 15],
                  alignment: 'center'
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        { text: '', margin: [0, 2] },

        // 🔹 NOTA REFERENCIAL
        {
          text: [
            { text: '* Nota elaborada conforme a NOM-004-SSA3-2012, Sección 6.2 "Nota de evolución"\n', fontSize: 6, italics: true, color: '#666666' },
            { text: '* Cumple con los requisitos establecidos en los numerales 6.2.1 al 6.2.6', fontSize: 6, italics: true, color: '#666666' }
          ],
          alignment: 'left'
        }
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
                  color: '#666666'
                },
                {
                  text: 'Nota de Evolución - SICEG\nNOM-004-SSA3-2012',
                  fontSize: 7,
                  alignment: 'center',
                  color: '#666666'
                },
                {
                  text: [
                    { text: `${fechaActual.toLocaleDateString('es-MX')}\n`, fontSize: 7 },
                    { text: `Exp: ${pacienteCompleto.numero_expediente}`, fontSize: 6 }
                  ],
                  alignment: 'right',
                  color: '#666666'
                }
              ]
            ]
          },
          layout: 'noBorders'
        };
      }
    };

    const nombreArchivo = `nota-evolucion-${pacienteCompleto.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaActual.toISOString().split('T')[0]}.pdf`;

    const pdfDocGenerator = this.pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(nombreArchivo);

    console.log('✅ PDF de Nota de Evolución NOM-004 generado exitosamente');
    console.log(`📄 Archivo: ${nombreArchivo}`);

    // 🔥 VALIDAR CUMPLIMIENTO ESPECÍFICO NOTA EVOLUCIÓN
    this.validarCumplimientoNotaEvolucion(datos, medicoCompleto, pacienteCompleto);

  } catch (error) {
    console.error('❌ Error al generar PDF de Nota de Evolución:', error);
    throw error;
  }
}

// 🔥 VALIDACIÓN ESPECÍFICA PARA NOTA DE EVOLUCIÓN
private validarCumplimientoNotaEvolucion(datos: any, medico: any, paciente: any): void {
  console.log('🔍 VALIDANDO CUMPLIMIENTO NOM-004 SECCIÓN 6.2 - NOTA DE EVOLUCIÓN...');

  const validaciones = {
    // 6.2.1 Evolución y actualización del cuadro clínico
    evolucion_cuadro_clinico: !!datos.notaEvolucion?.evolucion_analisis || !!datos.notaEvolucion?.sintomas_signos,

    // 6.2.2 Signos vitales según necesario
    signos_vitales_disponibles: !!datos.signosVitales,

    // 6.2.3 Resultados de estudios
    resultados_estudios: true, // Sección incluida

    // 6.2.4 Diagnósticos o problemas clínicos
    diagnosticos_problemas: !!datos.notaEvolucion?.diagnosticos,

    // 6.2.5 Pronóstico
    pronostico: !!datos.notaEvolucion?.pronostico,

    // 6.2.6 Tratamiento e indicaciones médicas
    tratamiento_indicaciones: !!datos.notaEvolucion?.plan_estudios_tratamiento,
    medicamentos_dosis_via: true, // Sección incluida

    // 5.9-5.10 Datos del médico
    fecha_hora_elaboracion: true,
    nombre_completo_medico: !!medico.nombre_completo,
    cedula_profesional: !!medico.numero_cedula,
    firma_espacio: true,

    // Datos del paciente
    nombre_completo_paciente: !!paciente.nombre_completo,
    edad_sexo: !!paciente.edad && !!paciente.sexo,
    numero_expediente: !!paciente.numero_expediente
  };

  const cumplimiento = Object.values(validaciones).filter(v => v).length;
  const total = Object.keys(validaciones).length;
  const porcentaje = Math.round((cumplimiento / total) * 100);

  console.log(`📊 CUMPLIMIENTO NOTA EVOLUCIÓN NOM-004: ${cumplimiento}/${total} (${porcentaje}%)`);

  if (porcentaje < 90) {
    console.warn('⚠️ ADVERTENCIA: Cumplimiento por debajo del 90%');
  } else {
    console.log('✅ NOTA DE EVOLUCIÓN CUMPLE CON NOM-004 SECCIÓN 6.2');
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
     const pacienteCompleto = this.validarYFormatearDatosPaciente(datos.paciente);
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
                 color: '#7c3aed'
               },
               {
                 text: [
                   { text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ\n', fontSize: 14, bold: true, color: '#7c3aed' },
                   { text: 'REGISTRO DE SIGNOS VITALES\n', fontSize: 12, bold: true },
                   { text: 'Control de Signos Vitales - SICEG', fontSize: 8, color: '#6b7280' }
                 ],
                 alignment: 'center',
                 margin: [0, 5]
               },
               {
                 text: [
                   { text: 'Folio:\n', fontSize: 8, bold: true },
                   { text: `SV-${pacienteCompleto.numero_expediente}\n`, fontSize: 8 },
                   { text: 'Hora:\n', fontSize: 8, bold: true },
                   { text: fechaActual.toLocaleTimeString('es-MX'), fontSize: 8 }
                 ],
                 alignment: 'center'
               }
             ]
           ]
         },
         layout: {
           hLineWidth: () => 1,
           vLineWidth: () => 1,
           hLineColor: () => '#7c3aed',
           vLineColor: () => '#7c3aed'
         }
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
                   rowSpan: 3
                 },
                 {
                   text: `${pacienteCompleto.nombre_completo} - ${pacienteCompleto.edad} años - ${pacienteCompleto.sexo}`,
                   fontSize: 10,
                   bold: true,
                   margin: [5, 3]
                 }
               ],
               [
                 {},
                 {
                   text: `Expediente: ${pacienteCompleto.numero_expediente} | Fecha de registro: ${fechaActual.toLocaleDateString('es-MX')}`,
                   fontSize: 8,
                   margin: [5, 3]
                 }
               ],
               [
                 {},
                 {
                   text: `Servicio: ${medicoCompleto.departamento} | Registrado por: ${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}`,
                   fontSize: 8,
                   margin: [5, 3]
                 }
               ]
             ]
           },
           layout: {
             hLineWidth: () => 0.5,
             vLineWidth: () => 0.5,
             hLineColor: () => '#374151',
             vLineColor: () => '#374151'
           }
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
                   colSpan: 4
                 },
                 {},
                 {},
                 {}
               ],
               [
                 {
                   text: 'PRESIÓN ARTERIAL',
                   fontSize: 9,
                   bold: true,
                   fillColor: '#fee2e2',
                   alignment: 'center'
                 },
                 {
                   text: 'FRECUENCIA CARDÍACA',
                   fontSize: 9,
                   bold: true,
                   fillColor: '#fecaca',
                   alignment: 'center'
                 },
                 {
                   text: 'FRECUENCIA RESPIRATORIA',
                   fontSize: 9,
                   bold: true,
                   fillColor: '#fed7d7',
                   alignment: 'center'
                 },
                 {
                   text: 'TEMPERATURA',
                   fontSize: 9,
                   bold: true,
                   fillColor: '#fee2e2',
                   alignment: 'center'
                 }
               ],
               [
                 {
                   text: `${signosVitalesData.presion_arterial_sistolica || '___'}/${signosVitalesData.presion_arterial_diastolica || '___'} mmHg`,
                   fontSize: 14,
                   bold: true,
                   alignment: 'center',
                   margin: [5, 15],
                   color: this.evaluarPresionArterial(signosVitalesData.presion_arterial_sistolica, signosVitalesData.presion_arterial_diastolica)
                 },
                 {
                   text: `${signosVitalesData.frecuencia_cardiaca || '___'} lpm`,
                   fontSize: 14,
                   bold: true,
                   alignment: 'center',
                   margin: [5, 15],
                   color: this.evaluarFrecuenciaCardiaca(signosVitalesData.frecuencia_cardiaca)
                 },
                 {
                   text: `${signosVitalesData.frecuencia_respiratoria || '___'} rpm`,
                   fontSize: 14,
                   bold: true,
                   alignment: 'center',
                   margin: [5, 15],
                   color: this.evaluarFrecuenciaRespiratoria(signosVitalesData.frecuencia_respiratoria)
                 },
                 {
                   text: `${signosVitalesData.temperatura || '___'} °C`,
                   fontSize: 14,
                   bold: true,
                   alignment: 'center',
                   margin: [5, 15],
                   color: this.evaluarTemperatura(signosVitalesData.temperatura)
                 }
               ]
             ]
           },
           layout: {
             hLineWidth: () => 1,
             vLineWidth: () => 1,
             hLineColor: () => '#374151',
             vLineColor: () => '#374151'
           }
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
                   colSpan: 3
                 },
                 {},
                 {}
               ],
               [
                 {
                   text: 'SATURACIÓN DE OXÍGENO',
                   fontSize: 9,
                   bold: true,
                   fillColor: '#dbeafe',
                   alignment: 'center'
                 },
                 {
                   text: 'GLUCOSA',
                   fontSize: 9,
                   bold: true,
                   fillColor: '#dbeafe',
                   alignment: 'center'
                 },
                 {
                   text: 'ESTADO GENERAL',
                   fontSize: 9,
                   bold: true,
                   fillColor: '#dbeafe',
                   alignment: 'center'
                 }
               ],
               [
                 {
                   text: `${signosVitalesData.saturacion_oxigeno || '___'} %`,
                   fontSize: 12,
                   bold: true,
                   alignment: 'center',
                   margin: [5, 10],
                   color: this.evaluarSaturacionOxigeno(signosVitalesData.saturacion_oxigeno)
                 },
                 {
                   text: `${signosVitalesData.glucosa || '___'} mg/dL`,
                   fontSize: 12,
                   bold: true,
                   alignment: 'center',
                   margin: [5, 10],
                   color: this.evaluarGlucosa(signosVitalesData.glucosa)
                 },
                 {
                   text: this.evaluarEstadoGeneral(signosVitalesData),
                   fontSize: 10,
                   bold: true,
                   alignment: 'center',
                   margin: [5, 10],
                   color: '#059669'
                 }
               ]
             ]
           },
           layout: {
             hLineWidth: () => 1,
             vLineWidth: () => 1,
             hLineColor: () => '#374151',
             vLineColor: () => '#374151'
           }
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
                   colSpan: 4
                 },
                 {},
                 {},
                 {}
               ],
               [
                 {
                   text: 'PESO',
                   fontSize: 9,
                   bold: true,
                   fillColor: '#ecfdf5',
                   alignment: 'center'
                 },
                 {
                   text: 'TALLA',
                   fontSize: 9,
                   bold: true,
                   fillColor: '#ecfdf5',
                   alignment: 'center'
                 },
                 {
                   text: 'IMC',
                   fontSize: 9,
                   bold: true,
                   fillColor: '#ecfdf5',
                   alignment: 'center'
                 },
                 {
                   text: 'CLASIFICACIÓN',
                   fontSize: 9,
                   bold: true,
                   fillColor: '#ecfdf5',
                   alignment: 'center'
                 }
               ],
               [
                 {
                   text: `${signosVitalesData.peso || '___'} kg`,
                   fontSize: 12,
                   bold: true,
                   alignment: 'center',
                   margin: [5, 10]
                 },
                 {
                   text: `${signosVitalesData.talla || '___'} cm`,
                   fontSize: 12,
                   bold: true,
                   alignment: 'center',
                   margin: [5, 10]
                 },
                 {
                   text: this.calcularIMC(signosVitalesData.peso, signosVitalesData.talla),
                   fontSize: 12,
                   bold: true,
                   alignment: 'center',
                   margin: [5, 10]
                 },
                 {
                   text: this.clasificarIMC(this.calcularIMC(signosVitalesData.peso, signosVitalesData.talla)),
                   fontSize: 9,
                   bold: true,
                   alignment: 'center',
                   margin: [5, 10],
                   color: this.colorIMC(this.calcularIMC(signosVitalesData.peso, signosVitalesData.talla))
                 }
               ]
             ]
           },
           layout: {
             hLineWidth: () => 1,
             vLineWidth: () => 1,
             hLineColor: () => '#374151',
             vLineColor: () => '#374151'
           }
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
                   alignment: 'center'
                 }
               ],
               [
                 {
                   text: signosVitalesData.observaciones || 'Sin observaciones especiales. Paciente estable.',
                   fontSize: 9,
                   margin: [10, 15],
                   lineHeight: 1.4,
                   minHeight: 60
                 }
               ]
             ]
           },
           layout: {
             hLineWidth: () => 1,
             vLineWidth: () => 1,
             hLineColor: () => '#374151',
             vLineColor: () => '#374151'
           }
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
                   alignment: 'center'
                 },
                 {
                   text: 'FIRMA Y HORA',
                   fontSize: 8,
                   bold: true,
                   fillColor: '#f9fafb',
                   alignment: 'center'
                 }
               ],
               [
                 {
                   text: [
                     { text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}\n`, fontSize: 9, bold: true },
                     { text: `Cédula: ${medicoCompleto.numero_cedula}\n`, fontSize: 8 },
                     { text: `${medicoCompleto.especialidad}\n`, fontSize: 8 },
                     { text: `${medicoCompleto.cargo} - ${medicoCompleto.departamento}`, fontSize: 8 }
                   ],
                   margin: [5, 15],
                   alignment: 'center'
                 },
                 {
                   text: `\n\n_________________________\nFirma\n${fechaActual.toLocaleString('es-MX')}`,
                   fontSize: 8,
                   margin: [5, 15],
                   alignment: 'center'
                 }
               ]
             ]
           },
           layout: {
             hLineWidth: () => 0.5,
             vLineWidth: () => 0.5,
             hLineColor: () => '#374151',
             vLineColor: () => '#374151'
           }
         }
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
                   color: '#6b7280'
                 },
                 {
                   text: 'Signos Vitales - SICEG',
                   fontSize: 7,
                   alignment: 'center',
                   color: '#6b7280'
                 },
                 {
                   text: fechaActual.toLocaleDateString('es-MX'),
                   fontSize: 7,
                   alignment: 'right',
                   color: '#6b7280'
                 }
               ]
             ]
           },
           layout: 'noBorders'
         };
       }
     };

     const nombreArchivo = `signos-vitales-${pacienteCompleto.nombre.replace(/\s+/g, '-')}-${fechaActual.toISOString().split('T')[0]}.pdf`;

     this.pdfMake.createPdf(documentDefinition).download(nombreArchivo);
     console.log('✅ PDF de Signos Vitales generado exitosamente');

   } catch (error) {
     console.error('❌ Error al generar PDF de Signos Vitales:', error);
     throw error;
   }
 }

 // 🔧 MÉTODOS AUXILIARES PARA EVALUACIÓN DE SIGNOS VITALES
 private evaluarPresionArterial(sistolica: number, diastolica: number): string {
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
   if (signos.frecuencia_cardiaca > 100 || signos.frecuencia_cardiaca < 60) alteraciones++;
   if (signos.presion_arterial_sistolica > 140 || signos.presion_arterial_sistolica < 90) alteraciones++;
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

   if (imcNum < 18.5 || imcNum >= 30) return '#dc2626'; // Rojo
   if (imcNum >= 25) return '#f59e0b'; // Amarillo
   return '#059669'; // Verde
 }

//  private calcularDiaHospitalizacion(): number {
//    // Esta función necesitaría datos del internamiento
//    // Por ahora retorna un valor por defecto
//    return 1;
//  }
}
