// src/app/services/pdf/pdf-templates.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PdfTemplatesService {
  constructor(private http: HttpClient) {}

  private obtenerNumeroExpedientePreferido(expediente: any): string {
    return (expediente?.numero_expediente_administrativo ||expediente?.numero_expediente ||'Sin número');
  }

  private calcularIMC(peso: number, talla: number): string {if (!peso || !talla || peso <= 0 || talla <= 0) return '__'; const imc = peso / Math.pow(talla / 100, 2);return imc.toFixed(1);
  }



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
    if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) { return `${edad - 1} años`; }
    return `${edad} años`;
  }

  private formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    try { const fechaObj = new Date(fecha); return fechaObj.toLocaleDateString('es-Mx', {day: '2-digit', month: '2-digit', year: 'numeric', });} catch { return 'N/A'; }
  }

  private calcularTotalAldrete(postanestesicaData: any): number {
    const actividad = parseInt(postanestesicaData.aldrete_actividad) || 2;
    const respiracion = parseInt(postanestesicaData.aldrete_respiracion) || 2;
    const circulacion = parseInt(postanestesicaData.aldrete_circulacion) || 2;
    const conciencia = parseInt(postanestesicaData.aldrete_conciencia) || 2;
    const saturacion = parseInt(postanestesicaData.aldrete_saturacion) || 2;
    return actividad + respiracion + circulacion + conciencia + saturacion;
  }

  private determinarGradoEscolarPorEdad(edad: number): string {
    if (edad < 3) return 'Lactante'; if (edad < 6) return 'Preescolar'; if (edad < 12) return `${edad - 5}° Primaria`;if (edad < 15) return `${edad - 11}° Secundaria`;if (edad < 18) return `${edad - 14}° Preparatoria`;
    return 'No aplica';
  }

  private construirTextoGuiasClinicas(guias: any[]): string {
  if (!guias || guias.length === 0) {return 'Guía clínica por definir según evolución clínica y estudios complementarios'}

  if (guias.length === 1) {const guia = guias[0]; return guia.nombre || guia.nombre_completo || `Guía Clínica ID: ${guia.id_guia_diagnostico}`;}

  return guias.map((guia, index) => {const nombre = guia.nombre || guia.nombre_completo || `Guía ID: ${guia.id_guia_diagnostico}`;const codigo = guia.codigo ? ` (${guia.codigo})` : '';return `${index + 1}. ${nombre}${codigo}`;
  }).join('\n');
}

private async obtenerImagenBase64(rutaImagen: string): Promise<string> {
  try {
    let urlCompleta: string;
    if (rutaImagen.startsWith('http://') || rutaImagen.startsWith('https://')) {urlCompleta = rutaImagen; } else {urlCompleta = `http://localhost:3000${rutaImagen}`;}
    console.log('Obteniendo imagen de:', urlCompleta);
    const response = await this.http.get(urlCompleta, {responseType: 'blob' }).toPromise();
    if (!response) {throw new Error('No se pudo obtener la imagen');}
    const tipoImagen = response.type;
    console.log('📄 Tipo de imagen:', tipoImagen);
    if (tipoImagen === 'image/svg+xml' || rutaImagen.endsWith('.svg')) {
      return await this.convertirSvgAPng(response);
    }
    // Para PNG, JPG, etc. - conversión normal
    return new Promise((resolve, reject) => {const reader = new FileReader();
      reader.onload = () => {const result = reader.result as string;console.log('✅ Imagen convertida exitosamente');resolve(result);};
      reader.onerror = reject;
      reader.readAsDataURL(response);
    });
  } catch (error) {console.error('Error al convertir imagen:', error); return this.obtenerImagenPlaceholder();}
}

private async convertirSvgAPng(svgBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {const svgText = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('No se pudo crear contexto de canvas'));return;}
        const aspectRatio = img.width / img.height;
        let canvasWidth, canvasHeight;
        if (aspectRatio > 2) {
          // Imagen muy ancha (como 600x200 = 3:1)
          canvasWidth = 120; canvasHeight = 40;
        } else if (aspectRatio > 1.5) {
          // Imagen moderadamente ancha (como 411x200 = 2:1)
          canvasWidth = 100; canvasHeight = 50;
        } else {
          // Imagen más cuadrada
          canvasWidth = 80; canvasHeight = 60;
        }
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        // Fondo transparente (mejor para logos)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Dibujar SVG manteniendo proporciones
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png', 0.9);
        console.log(`✅ SVG convertido: ${img.width}x${img.height} → ${canvasWidth}x${canvasHeight}`);
        resolve(dataUrl);
      };

      img.onerror = () => {
        console.warn('❌ Error al cargar SVG, usando placeholder'); resolve(this.obtenerImagenPlaceholder());
      };
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgText)}`;
      img.src = svgDataUrl;
    };
    reader.onerror = () => {
      console.warn('❌ Error al leer SVG blob, usando placeholder');
      resolve(this.obtenerImagenPlaceholder());
    };
    reader.readAsText(svgBlob);
  });
}

private obtenerImagenPlaceholder(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = 120;  // 🔥 Tamaño más apropiado
  canvas.height = 40;  // 🔥 Proporción 3:1
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Borde
  ctx.strokeStyle = '#d1d5db';
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  // Texto
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('LOGO', canvas.width / 2, canvas.height / 2 + 4);
  return canvas.toDataURL('image/png', 0.8);
}


  /////////////////////////////////////////// GENERACION DE DOCUMETNOS ///////////////////////////////////////


  async generarHistoriaClinica(datos: any): Promise<any> {

  const validarTodasLasTablas = (contenido: any[], nombre: string = 'Documento') => {
  contenido.forEach((elemento, index) => { if (elemento && elemento.table) { try {
  validarTabla(elemento, `${nombre}[${index}]`); } catch (error) {
  console.error(`Error en tabla ${nombre}[${index}]:`, error);
  throw error; }} if (elemento && elemento.table && elemento.table.body) {
      elemento.table.body.forEach((fila: any[], filaIndex: number) => {
        fila.forEach((celda: any, celdaIndex: number) => {
          if (celda && celda.table) { try { validarTabla(celda, `${nombre}[${index}].fila[${filaIndex}].celda[${celdaIndex}]`);
            } catch (error) { console.error(`❌ Error en tabla anidada ${nombre}[${index}].fila[${filaIndex}].celda[${celdaIndex}]:`, error); throw error;
            }
          }
        });
      });
    }
  });
};

    const pacienteCompleto = datos.pacienteCompleto;
    const medicoCompleto = datos.medicoCompleto;
    const historiaClinicaData = datos.historiaClinica || {};
    const signosVitales = datos.signosVitales || {};
    const guiaClinicaData = datos.guiaClinica || {};
    const datosPadres = datos.datosPadres || {};
    const fechaActual = new Date();
    const esPediatrico = pacienteCompleto.edad < 18;
    const domicilioPaciente = pacienteCompleto.domicilio || 'Sin dirección registrada';
    const lugarNacimiento = pacienteCompleto.lugar_nacimiento || 'No especificado';
    const tipoSangre = pacienteCompleto.tipo_sangre || 'No especificado';
    const contarFilasIdentificacion = () => { let filas = 7; if (esPediatrico) filas += 1; return filas;};
    const contarFilasAntecedentes = () => {



      let filas = 6; // Base: heredo familiares, personales no patológicos, personales patológicos

  // Sección ginecobstétrica (solo mujeres adultas)
  if (!esPediatrico && pacienteCompleto.sexo === 'F') {
    filas += 2; // +2 filas
  }

  // Antecedentes perinatales (solo pediátrico)
  if (esPediatrico) {
    filas += 2; // +2 filas
  }

  console.log(`  Antecedentes: ${filas} filas calculadas (esPediatrico: ${esPediatrico}, sexo: ${pacienteCompleto.sexo})`);
  return filas;
};

  const validarTabla = (tabla: any, nombreTabla: string) => {
  if (!tabla.table || !tabla.table.widths || !tabla.table.body) {
    console.warn(`⚠️ Tabla ${nombreTabla} no tiene estructura válida`);
    return;
  }

  const numColumnas = tabla.table.widths.length;
  let erroresEncontrados: string[] = [];

  tabla.table.body.forEach((fila: any[], index: number) => {
    let celdas = 0;
    fila.forEach((celda, celdaIndex) => {
      if (celda && typeof celda === 'object' && celda.colSpan) {
        celdas += celda.colSpan;
      } else {
        celdas += 1;
      }
    });

    if (celdas !== numColumnas) {
      const error = `Fila ${index}: esperaba ${numColumnas} columnas, encontró ${celdas}`;
      erroresEncontrados.push(error);
      console.error(`❌ ERROR en ${nombreTabla}, ${error}`);
    }
  });

  if (erroresEncontrados.length === 0) {
    console.log(`✅ Tabla ${nombreTabla} validada correctamente: ${tabla.table.body.length} filas`);
  } else {
    throw new Error(`Tabla ${nombreTabla} tiene errores: ${erroresEncontrados.join(', ')}`);
  }
};

  const crearFilasIdentificacion = () => {
    const filasBase = [
      [
        {
          text: 'IDENTIFICACIÓN',fontSize: 8,bold: true,fillColor: '#f5f5f5',  alignment: 'center',rowSpan: contarFilasIdentificacion(),
        },
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
              ], [
                { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'center' },
                { text: fechaActual.toLocaleTimeString('es-MX'), fontSize: 7, alignment: 'center' },
                { text: this.obtenerNumeroExpedientePreferido(pacienteCompleto.expediente) || 'N/A', fontSize: 7, alignment: 'center', bold: true },
                { text: historiaClinicaData.numero_cama || 'NO ASIGNADO', fontSize: 7, alignment: 'center' },
                { text: medicoCompleto.departamento || 'No especificado', fontSize: 7, alignment: 'center' }
              ]
            ]
          },
          layout: { hLineWidth: () => 0.3, vLineWidth: () => 0.3, hLineColor: () => '#000000',vLineColor: () => '#000000',}
        }
      ],

      // FILA 2: Datos del paciente
      [
        {},
        {
          table: {
            widths: ['55%', '15%', '15%', '15%'],
            body: [
              [
                { text: 'Nombre completo del paciente', fontSize: 7, bold: true },
                { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Tipo de sangre', fontSize: 7, bold: true, alignment: 'center' }
              ],
              [
                { text: pacienteCompleto.nombre_completo, fontSize: 8, bold: true, margin: [2, 3] },
                { text: `${pacienteCompleto.edad} años`, fontSize: 7, alignment: 'center' },
                { text: pacienteCompleto.sexo, fontSize: 7, alignment: 'center' },
                { text: tipoSangre, fontSize: 7, alignment: 'center', bold: true, color: '#dc2626' }
              ]
            ]
          },
          layout: {  hLineWidth: () => 0.3, vLineWidth: () => 0.3, hLineColor: () => '#000000', vLineColor: () => '#000000', }
        }
      ],

      // FILA 3: Domicilio
      [
        {}, {
          table: {
            widths: ['100%'],
            body: [
              [{ text: 'Domicilio del paciente', fontSize: 7, bold: true }],
              [{ text: domicilioPaciente, fontSize: 7, margin: [2, 3] }]
            ]
          },
          layout: {
            hLineWidth: () => 0.3, vLineWidth: () => 0.3, hLineColor: () => '#000000', vLineColor: () => '#000000',}
        }
      ],

      // FILA 4: Datos personales básicos
      [
        {},
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
          // ✅ USAR CAMPOS YA PROCESADOS
              { text: this.formatearFecha(pacienteCompleto.fecha_nacimiento) || 'No registrada', fontSize: 7, alignment: 'center' },
              { text: pacienteCompleto.curp || 'No registrado', fontSize: 6, alignment: 'center' },
              { text: lugarNacimiento, fontSize: 7, alignment: 'center' },
              { text: pacienteCompleto.telefono || 'No registrado', fontSize: 7, alignment: 'center' }
            ]
            ]
          },
          layout: {
            hLineWidth: () => 0.3, vLineWidth: () => 0.3, hLineColor: () => '#000000', vLineColor: () => '#000000',
          }
        }
      ],

      // FILA 5: Ocupación/Escolaridad
      [
        {},
        {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
              { text: esPediatrico ? 'Grado escolar' : 'Ocupación', fontSize: 7, bold: true, alignment: 'center' },
              { text: 'Escolaridad', fontSize: 7, bold: true, alignment: 'center' },
              { text: 'Estado civil', fontSize: 7, bold: true, alignment: 'center' },
              { text: 'Religión', fontSize: 7, bold: true, alignment: 'center' }
            ],
            [
              { text: esPediatrico ? (pacienteCompleto.grado_escolar || this.determinarGradoEscolarPorEdad(pacienteCompleto.edad)) : (pacienteCompleto.ocupacion || 'No registrada'), fontSize: 7, alignment: 'center' },
              { text: pacienteCompleto.escolaridad || 'No registrada', fontSize: 7, alignment: 'center' },
              { text: pacienteCompleto.estado_civil || 'No registrado', fontSize: 7, alignment: 'center' },
              { text: pacienteCompleto.religion || 'No registrada', fontSize: 7, alignment: 'center' }
            ]
            ]
          },
          layout: {
            hLineWidth: () => 0.3, vLineWidth: () => 0.3, hLineColor: () => '#000000', vLineColor: () => '#000000',
          }
        }
      ]
    ];

    // FILA DE PADRES SOLO SI ES PEDIÁTRICO
    if (esPediatrico) {
      filasBase.push([
        {},{
          table: { widths: ['25%', '25%', '25%', '25%'], body: [
              [
                { text: 'Nombre del padre', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Edad padre', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Nombre de la madre', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Edad madre', fontSize: 7, bold: true, alignment: 'center' }
              ],
              [
                { text: datosPadres.nombre_padre || 'No registrado', fontSize: 7, alignment: 'center' },
                { text: datosPadres.edad_padre || 'N/A', fontSize: 7, alignment: 'center' },
                { text: datosPadres.nombre_madre || 'No registrado', fontSize: 7, alignment: 'center' },
                { text: datosPadres.edad_madre || 'N/A', fontSize: 7, alignment: 'center' }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.3, vLineWidth: () => 0.3, hLineColor: () => '#000000', vLineColor: () => '#000000',
          }
        }
      ]);
    }
    // FILAS FINALES
    filasBase.push(
      // Familiar responsable
      [
        {}, {
          table: {
            widths: ['60%', '40%'],
            body: [
            [
              { text: esPediatrico ? 'Familiar responsable/Tutor' : 'Contacto de emergencia', fontSize: 7, bold: true, alignment: 'center' },
              { text: 'Teléfono de contacto', fontSize: 7, bold: true, alignment: 'center' }
            ],
            [
              // ✅ USAR CAMPOS YA PROCESADOS
              { text: pacienteCompleto.familiar_responsable || 'No registrado', fontSize: 7, alignment: 'center' },
              { text: pacienteCompleto.telefono_familiar || 'No registrado', fontSize: 7, alignment: 'center' }
            ]
            ]
          },
          layout: {
            hLineWidth: () => 0.3, vLineWidth: () => 0.3, hLineColor: () => '#000000', vLineColor: () => '#000000',
          }
        }
      ],
      // Médico responsable
      [
        {},
        {
          table: {
            widths: ['70%', '30%'],
            body: [
              [
                { text: 'Médico responsable de la elaboración', fontSize: 7, bold: true, alignment: 'center' },
                { text: 'Cédula profesional', fontSize: 7, bold: true, alignment: 'center' }
              ],
              [
                { text: `${medicoCompleto.titulo_profesional} ${medicoCompleto.nombre_completo}`, fontSize: 7, alignment: 'center' },
                { text: medicoCompleto.numero_cedula || 'No registrada', fontSize: 7, alignment: 'center' }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.3, vLineWidth: () => 0.3, hLineColor: () => '#000000', vLineColor: () => '#000000',
          }
        }
      ]
    );
    return filasBase;
  };

  const tablaIdentificacion = {
    table: { widths: ['15%', '85%'],body: crearFilasIdentificacion() },
    layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => '#000000', vLineColor: () => '#000000',}
  };

  const crearFilasAntecedentes = () => {
  const filasBase = [
    [
      {
        text: 'ANTECEDENTES',
        fontSize: 8,
        bold: true,
        fillColor: '#eeece1',
        alignment: 'center',
        rowSpan: contarFilasAntecedentes(),
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
        text: historiaClinicaData.antecedentes_heredo_familiares ||
          'Sin información registrada',
        fontSize: 7,
        margin: [3, 2],
        lineHeight: 1.1,
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
        text: `Alimentación: ${historiaClinicaData.habitos_alimenticios || 'No registrado'}\n`+
          `Higiene: ${historiaClinicaData.habitos_higienicos || 'Adecuada'}\n` +
          `Actividad física: ${historiaClinicaData.actividad_fisica || (esPediatrico ? 'Apropiada para la edad' : 'Regular')}\n` +
          `Vivienda: ${historiaClinicaData.vivienda || 'Casa habitación con servicios básicos'}\n` +
          `${esPediatrico ? 'Inmunizaciones: Esquema completo según edad\n' : ''}` +
          `${esPediatrico ? 'Desarrollo psicomotor: Acorde a la edad\n' : ''}` +
          `${!esPediatrico && historiaClinicaData.toxicomanias ? `Toxicomanías: ${historiaClinicaData.toxicomanias}\n` : ''}`,
        fontSize: 7,
        margin: [3, 2],
        lineHeight: 1.1,
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
        text: `Enfermedades en la infancia: ${historiaClinicaData.enfermedades_infancia || 'Negadas'}\n` +
          `${!esPediatrico ? `Enfermedades en el adulto: ${historiaClinicaData.enfermedades_adulto || 'Negadas'}\n` : ''}` +
          `Hospitalizaciones previas: ${historiaClinicaData.hospitalizaciones_previas || 'Ninguna'}\n` +
          `Cirugías previas: ${historiaClinicaData.cirugias_previas || 'Ninguna'}\n` +
          `Traumatismos: ${historiaClinicaData.traumatismos || 'Ninguno'}\n` +
          `Alergias (medicamentos/alimentos): ${historiaClinicaData.alergias || 'Negadas'}\n` +
          `Transfusiones: ${historiaClinicaData.transfusiones || 'Ninguna'}`,
        fontSize: 7,
        margin: [3, 2],
        lineHeight: 1.1,
      },
    ]
  ];

  // Sección ginecobstétrica (solo mujeres adultas)
  if (!esPediatrico && pacienteCompleto.sexo === 'F') {
    filasBase.push(
      [
        {},
        {
          text: 'GINECOBSTÉTRICOS',
          fontSize: 7,
          bold: true,
          fillColor: '#f0f0f0',
        },
      ],
      [
        {},
        {
          text: `Menarca: ${historiaClinicaData.menarca || 'No registrada'} años\n` +
            `Ritmo menstrual: ${historiaClinicaData.ritmo_menstrual || 'No registrado'}\n` +
            `Gestas: ${historiaClinicaData.gestas || '0'} | Partos: ${historiaClinicaData.partos || '0'} | Cesáreas: ${historiaClinicaData.cesareas || '0'} | Abortos: ${historiaClinicaData.abortos || '0'}\n` +
            `Método de planificación familiar: ${historiaClinicaData.metodo_planificacion || 'Ninguno'}`,
          fontSize: 7,
          margin: [3, 2],
          lineHeight: 1.1,
        },
      ]
    );
  }

  // Antecedentes perinatales (solo pediátrico)
  if (esPediatrico) {
    filasBase.push(
      [
        {},
        {
          text: 'PERINATALES (Pediatría)',
          fontSize: 7,
          bold: true,
          fillColor: '#f0f0f0',
        },
      ],
      [
        {},
        {
          text: `Control prenatal: ${historiaClinicaData.control_prenatal || 'Sí'}\n` +
            `Tipo de parto: ${historiaClinicaData.tipo_parto || 'Vaginal'}\n` +
            `Peso al nacer: ${historiaClinicaData.peso_nacer || 'No registrado'} kg\n` +
            `Complicaciones neonatales: ${historiaClinicaData.complicaciones_neonatales || 'Ninguna'}\n` +
            `Apgar: ${historiaClinicaData.apgar || 'No registrado'}\n` +
            `Edad gestacional: ${historiaClinicaData.edad_gestacional || 'No registrada'} semanas`,
          fontSize: 7,
          margin: [3, 2],
          lineHeight: 1.1,
        },
      ]
    );
  }

  return filasBase;
};

const tablaAntecedentes = {
  table: {
    widths: ['15%', '85%'],
    body: crearFilasAntecedentes()
  },
  layout: {
    hLineWidth: () => 0.5,
    vLineWidth: () => 0.5,
    hLineColor: () => '#000000',
    vLineColor: () => '#000000',
  },
};




  console.log(`  Debug: Tabla tiene ${tablaIdentificacion.table.body.length} filas, rowSpan configurado para ${contarFilasIdentificacion()}`);
  console.log(`  esPediatrico: ${esPediatrico}`);


  validarTabla(tablaIdentificacion, 'Identificación');


    const documentoFinal = {
      pageSize: 'LETTER',
      pageMargins: [20, 60, 20, 40],
      header: {
  margin: [20, 10, 20, 10],
  table: {
    widths: ['20%', '60%', '20%'], // 🔥 Ajustar anchos para dar más espacio a logos
    body: [
      [
        {
          // Logo de gobierno (izquierda)
          image: await this.obtenerImagenBase64(datos.configuracion?.logo_gobierno || '/uploads/logos/logo-gobierno-default.svg'),
          fit: [80, 40], // 🔥 USAR fit EN LUGAR DE width/height
          alignment: 'left',
          margin: [0, 5]
        },
        {
          // Texto central
          text: esPediatrico
            ? 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - HISTORIA CLÍNICA PEDIÁTRICA GENERAL'
            : 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - HISTORIA CLÍNICA GENERAL',
          fontSize: 10,
          bold: true,
          alignment: 'center',
          color: '#1a365d',
          margin: [0, 8]
        },
        {
          // Logo del hospital (derecha)
          image: await this.obtenerImagenBase64(datos.configuracion?.logo_principal || '/uploads/logos/logo-principal-default.svg'),
          fit: [80, 40], // 🔥 USAR fit EN LUGAR DE width/height
          alignment: 'right',
          margin: [0, 5]
        }
      ]
    ]
  },
  layout: 'noBorders',
},
      content: [
        tablaIdentificacion,
        { text: '', margin: [0, 1] },
        tablaAntecedentes,
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
                    'Sin información registrada',
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
                    'Sin información registrada',
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
                      'Sin información registrada'
                    }\n` +
                    `Respiratorio: ${
                      historiaClinicaData.interrogatorio_respiratorio ||
                      'Sin información registrada'
                    }\n` +
                    `Digestivo: ${
                      historiaClinicaData.interrogatorio_digestivo ||
                      'Sin información registrada'
                    }\n` +
                    `Genitourinario: ${
                      historiaClinicaData.interrogatorio_genitourinario ||
                      'Sin información registrada'
                    }\n` +
                    `Neurológico: ${
                      historiaClinicaData.interrogatorio_neurologico ||
                      'Sin información registrada'
                    }\n` +
                    `Musculoesquelético: ${
                      historiaClinicaData.interrogatorio_musculoesqueletico ||
                      'Sin información registrada'
                    }`,
                  fontSize: 7,
                  margin: [3, 2],
                  lineHeight: 1.1,
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
                      text: `Peso: ${signosVitales.peso || '___'} kg\nTalla: ${
                        signosVitales.talla || '___'
                      } cm\nIMC: ${this.calcularIMC(
                        signosVitales.peso,
                        signosVitales.talla
                      )}`,
                      fontSize: 7,
                    },
                    {
                      width: '33%',
                      text: `TA: ${
                        signosVitales.presion_arterial_sistolica || '___'
                      }/${
                        signosVitales.presion_arterial_diastolica || '___'
                      } mmHg\nFC: ${
                        signosVitales.frecuencia_cardiaca || '___'
                      } lpm\nFR: ${
                        signosVitales.frecuencia_respiratoria || '___'
                      } rpm`,
                      fontSize: 7,
                    },
                    {
                      width: '34%',
                      text: `Temperatura: ${
                        signosVitales.temperatura || '___'
                      } °C\nSaturación O2: ${
                        signosVitales.saturacion_oxigeno || '___'
                      } %\nGlucosa: ${signosVitales.glucosa || '___'} mg/dL`,
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
                    'Sin información registrada',
                  fontSize: 7,
                  margin: [5, 3],
                  lineHeight: 1.1,
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
                      'Sin información registrada'
                    }\n\n` +
                    `TÓRAX Y PULMONES: ${
                      historiaClinicaData.exploracion_torax ||
                      'Sin información registrada'
                    }\n\n` +
                    `CARDIOVASCULAR: ${
                      historiaClinicaData.exploracion_corazon ||
                      'Sin información registrada'
                    }\n\n` +
                    `ABDOMEN: ${
                      historiaClinicaData.exploracion_abdomen ||
                      'Sin información registrada'
                    }\n\n` +
                    `EXTREMIDADES: ${
                      historiaClinicaData.exploracion_extremidades ||
                      'Sin información registrada'
                    }\n\n` +
                    `GENITALES: ${
                      historiaClinicaData.exploracion_genitales ||
                      'Sin información registrada'
                    }\n\n` +
                    `NEUROLÓGICO: ${
                      historiaClinicaData.exploracion_neurologico ||
                      'Sin información registrada'
                    }`,
                  fontSize: 7,
                  margin: [5, 3],
                  lineHeight: 1.1,
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
                    'Sin información registrada',
                  fontSize: 7,
                  margin: [5, 3],
                  lineHeight: 1.1,
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
                    'Sin información registrada',
                  fontSize: 7,
                  margin: [3, 2],
                  lineHeight: 1.1,
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
                    'Sin información registrada.',
                  fontSize: 7,
                  margin: [3, 2],
                  lineHeight: 1.1,
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
                  text: this.construirTextoGuiasClinicas(
                    datos.guiasClinicas ||
                      (datos.guiaClinica ? [datos.guiaClinica] : [])
                  ),
                  fontSize: 7,
                  margin: [3, 2],
                  italics:
                    !datos.guiasClinicas || datos.guiasClinicas.length === 0,
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
                    'Sin información registrada',
                  fontSize: 7,
                  margin: [3, 2],
                  bold: true,
                  lineHeight: 1.1,
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
                    'Sin información registrada',
                  fontSize: 7,
                  margin: [3, 2],
                  lineHeight: 1.1,
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
                    'Sin información registrada.',
                  fontSize: 7,
                  margin: [3, 2],
                  lineHeight: 1.1,
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
                    'Sin información registrada.',
                  fontSize: 7,
                  margin: [3, 2],
                  lineHeight: 1.1,
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
                    'Sin información registrada.'
                  }`,
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f8f8f8',
                  margin: [5, 8],
                  alignment: 'center',
                  lineHeight: 1.1,
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
                      text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`,
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
                  text: esPediatrico
                    ? 'Historia Clínica Pediátrica General - SICEG\nNOM-004-SSA3-2012 • NOM-031-SSA2-1999'
                    : 'Historia Clínica General - SICEG\nNOM-004-SSA3-2012',
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
                      text: `Exp: ${this.obtenerNumeroExpedientePreferido(
                        pacienteCompleto.expediente
                      )}`,
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

    // ✅ AQUÍ AGREGAR LA VALIDACIÓN COMPLETA
  console.log('  Validando todas las tablas del documento...');
  try {
    validarTodasLasTablas(documentoFinal.content, 'HistoriaClinica');
    console.log('✅ Todas las tablas validadas correctamente');
  } catch (error) {
    console.error('❌ Error en validación de tablas:', error);
    throw error;
  }

  return documentoFinal;

  }

// Actualizar el método en PdfTemplatesService.ts
async generarHojaFrontalExpediente(datos: any): Promise<any> {
  console.log('📂 Generando Hoja Frontal de Expediente según NOM-004...');

  const medicoCompleto = datos.medicoCompleto;
  const pacienteCompleto = datos.pacienteCompleto;
  const expedienteData = datos.expediente || {};
  const hojaFrontalData = datos.hojaFrontal || {};
  const fechaActual = new Date();

  return {
    pageSize: 'LETTER',
    pageMargins: [30, 40, 30, 60],
    
    header: {
      margin: [30, 20, 30, 0],
      table: {
        widths: ['70%', '30%'],
        body: [
          [
            {
              stack: [
                { text: 'SECRETARÍA DE SALUD', fontSize: 12, bold: true },
                { text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ', fontSize: 11, bold: true },
                { text: 'San Luis de la Paz, Guanajuato', fontSize: 9 },
                { text: 'RFC: HGS-123456-ABC', fontSize: 8, color: '#666666' }
              ],
              border: [false, false, false, false]
            },
            {
              stack: [
                { text: 'HOJA FRONTAL', fontSize: 14, bold: true, alignment: 'center' },
                { text: 'DE EXPEDIENTE CLÍNICO', fontSize: 12, bold: true, alignment: 'center' },
                { text: 'NOM-004-SSA3-2012', fontSize: 8, alignment: 'center', color: '#666666' }
              ],
              border: [false, false, false, false]
            }
          ]
        ]
      },
      layout: 'noBorders'
    },

    content: [
      // ESPACIO PARA HEADER
      { text: '', margin: [0, 20] },

      // 📋 INFORMACIÓN DEL EXPEDIENTE
      {
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: [
            [
              { text: 'EXPEDIENTE No.', fontSize: 9, bold: true, fillColor: '#f0f8ff' },
              { text: this.obtenerNumeroExpedientePreferido(pacienteCompleto.expediente) || 'N/A', fontSize: 10, bold: true },
              { text: 'FECHA APERTURA', fontSize: 9, bold: true, fillColor: '#f0f8ff' },
              { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 9 }
            ],
            [
              { text: 'TIPO EXPEDIENTE', fontSize: 9, bold: true, fillColor: '#f0f8ff' },
              { text: pacienteCompleto.edad < 18 ? 'PEDIÁTRICO' : 'ADULTO', fontSize: 9 },
              { text: 'FOLIO', fontSize: 9, bold: true, fillColor: '#f0f8ff' },
              { text: '____________', fontSize: 9 }
            ]
          ]
        },
        layout: {
          fillColor: function (rowIndex: number, node: any, columnIndex: number) {
            return (columnIndex % 2 === 0) ? '#f8f9fa' : null;
          }
        },
        margin: [0, 0, 0, 15]
      },

      // 🏥 DATOS DEL ESTABLECIMIENTO
      {
        text: 'DATOS DEL ESTABLECIMIENTO DE SALUD',
        fontSize: 11,
        bold: true,
        margin: [0, 10, 0, 5],
        decoration: 'underline'
      },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            [
              { text: 'Tipo de Establecimiento:', fontSize: 9, bold: true },
              { text: hojaFrontalData.tipo_establecimiento || 'Hospital General', fontSize: 9 }
            ],
            [
              { text: 'Nombre:', fontSize: 9, bold: true },
              { text: hojaFrontalData.nombre_establecimiento || 'Hospital General San Luis de la Paz', fontSize: 9 }
            ],
            [
              { text: 'Domicilio:', fontSize: 9, bold: true },
              { text: hojaFrontalData.domicilio_establecimiento || 'San Luis de la Paz, Guanajuato, México', fontSize: 9 }
            ],
            [
              { text: 'Razón Social:', fontSize: 9, bold: true },
              { text: hojaFrontalData.razon_social || 'Servicios de Salud de Guanajuato', fontSize: 9 }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // 👤 DATOS COMPLETOS DEL PACIENTE
      {
        text: 'DATOS DEL PACIENTE',
        fontSize: 11,
        bold: true,
        margin: [0, 10, 0, 5],
        decoration: 'underline'
      },
      {
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: [
            [
              { text: 'NOMBRE COMPLETO:', fontSize: 8, bold: true, colSpan: 1 },
              { text: pacienteCompleto.nombre_completo || 'N/A', fontSize: 9, colSpan: 3 },
              {}, {}
            ],
            [
              { text: 'CURP:', fontSize: 8, bold: true },
              { text: pacienteCompleto.curp || 'N/A', fontSize: 8 },
              { text: 'RFC:', fontSize: 8, bold: true },
              { text: pacienteCompleto.rfc || 'N/A', fontSize: 8 }
            ],
            [
              { text: 'FECHA NACIMIENTO:', fontSize: 8, bold: true },
              { text: pacienteCompleto.fecha_nacimiento ? new Date(pacienteCompleto.fecha_nacimiento).toLocaleDateString('es-MX') : 'N/A', fontSize: 8 },
              { text: 'EDAD:', fontSize: 8, bold: true },
              { text: `${pacienteCompleto.edad || 0} años`, fontSize: 8 }
            ],
            [
              { text: 'SEXO:', fontSize: 8, bold: true },
              { text: pacienteCompleto.sexo || 'N/A', fontSize: 8 },
              { text: 'ESTADO CIVIL:', fontSize: 8, bold: true },
              { text: hojaFrontalData.estado_conyugal || 'N/A', fontSize: 8 }
            ],
            [
              { text: 'LUGAR NACIMIENTO:', fontSize: 8, bold: true },
              { text: hojaFrontalData.lugar_nacimiento || 'N/A', fontSize: 8 },
              { text: 'NACIONALIDAD:', fontSize: 8, bold: true },
              { text: hojaFrontalData.nacionalidad || 'Mexicana', fontSize: 8 }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // 🏠 DOMICILIO COMPLETO
      {
        text: 'DOMICILIO',
        fontSize: 11,
        bold: true,
        margin: [0, 10, 0, 5],
        decoration: 'underline'
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [{ 
              text: this.formatearDireccionCompleta(pacienteCompleto) || 'No especificado', 
              fontSize: 9 
            }]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // 📞 CONTACTO DE EMERGENCIA
      {
        text: 'CONTACTO DE EMERGENCIA',
        fontSize: 11,
        bold: true,
        margin: [0, 10, 0, 5],
        decoration: 'underline'
      },
      {
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: [
            [
              { text: 'NOMBRE:', fontSize: 8, bold: true },
              { text: hojaFrontalData.contacto_emergencia_1?.nombre_completo || 'N/A', fontSize: 9, colSpan: 2 },
              {},
              { text: 'PARENTESCO:', fontSize: 8, bold: true }
            ],
            [
              { text: hojaFrontalData.contacto_emergencia_1?.parentesco || 'N/A', fontSize: 9 },
              { text: 'TELÉFONO 1:', fontSize: 8, bold: true },
              { text: hojaFrontalData.contacto_emergencia_1?.telefono_principal || 'N/A', fontSize: 9 },
              { text: 'TELÉFONO 2:', fontSize: 8, bold: true }
            ],
            [
              { text: hojaFrontalData.contacto_emergencia_1?.telefono_secundario || 'N/A', fontSize: 9 },
              { text: 'DIRECCIÓN:', fontSize: 8, bold: true, colSpan: 3 },
              {}, {}
            ],
            [
              { text: hojaFrontalData.contacto_emergencia_1?.direccion || 'N/A', fontSize: 9, colSpan: 4 },
              {}, {}, {}
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // 🩸 INFORMACIÓN MÉDICA RELEVANTE
      {
        text: 'INFORMACIÓN MÉDICA RELEVANTE',
        fontSize: 11,
        bold: true,
        margin: [0, 10, 0, 5],
        decoration: 'underline'
      },
      {
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: [
            [
              { text: 'TIPO SANGRE:', fontSize: 8, bold: true },
              { text: `${pacienteCompleto.tipo_sangre || 'N/A'} ${pacienteCompleto.factor_rh || ''}`.trim(), fontSize: 9 },
              { text: 'AFILIACIÓN:', fontSize: 8, bold: true },
              { text: hojaFrontalData.afiliacion_medica || 'Ninguna', fontSize: 8 }
            ],
            [
              { text: 'No. AFILIACIÓN:', fontSize: 8, bold: true },
              { text: hojaFrontalData.numero_afiliacion || 'N/A', fontSize: 8 },
              { text: 'ESCOLARIDAD:', fontSize: 8, bold: true },
              { text: hojaFrontalData.escolaridad || 'N/A', fontSize: 8 }
            ],
            [
              { text: 'OCUPACIÓN:', fontSize: 8, bold: true },
              { text: hojaFrontalData.ocupacion || 'N/A', fontSize: 8 },
              { text: 'RELIGIÓN:', fontSize: 8, bold: true },
              { text: hojaFrontalData.religion || 'N/A', fontSize: 8 }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // 🚨 ALERGIAS Y ENFERMEDADES
      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              {
                stack: [
                  { text: 'ALERGIAS CONOCIDAS:', fontSize: 9, bold: true },
                  { text: hojaFrontalData.alergias_conocidas || 'Ninguna conocida', fontSize: 8, margin: [0, 2, 0, 0] }
                ]
              },
              {
                stack: [
                  { text: 'ENFERMEDADES CRÓNICAS:', fontSize: 9, bold: true },
                  { text: hojaFrontalData.enfermedades_cronicas || 'Ninguna', fontSize: 8, margin: [0, 2, 0, 0] }
                ]
              }
            ],
            [
              {
                stack: [
                  { text: 'MEDICAMENTOS ACTUALES:', fontSize: 9, bold: true },
                  { text: hojaFrontalData.medicamentos_actuales || 'Ninguno', fontSize: 8, margin: [0, 2, 0, 0] }
                ],
                colSpan: 2
              },
              {}
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20]
      },

      // 📝 SECCIÓN DE OBSERVACIONES
      {
        text: 'OBSERVACIONES',
        fontSize: 11,
        bold: true,
        margin: [0, 10, 0, 5],
        decoration: 'underline'
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [{ 
              text: hojaFrontalData.observaciones || '_'.repeat(100), 
              fontSize: 9,
              margin: [5, 10, 5, 10]
            }]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 30]
      }
    ],

    footer: (currentPage: number, pageCount: number) => {
      return {
        margin: [30, 10],
        table: {
          widths: ['33%', '34%', '33%'],
          body: [
            [
              {
                stack: [
                  { text: 'PERSONAL REGISTRA:', fontSize: 8, bold: true },
                  { text: medicoCompleto.nombre_completo || 'Dr. [Nombre]', fontSize: 8 },
                  { text: `Cédula: ${medicoCompleto.cedula || 'N/A'}`, fontSize: 7 },
                  { text: '_'.repeat(25), fontSize: 8, margin: [0, 10, 0, 0] },
                  { text: 'FIRMA', fontSize: 7, alignment: 'center' }
                ]
              },
              {
                stack: [
                  { text: `Página ${currentPage} de ${pageCount}`, fontSize: 8, alignment: 'center' },
                  { text: 'HOJA FRONTAL DE EXPEDIENTE', fontSize: 7, alignment: 'center', margin: [0, 5, 0, 0] },
                  { text: 'NOM-004-SSA3-2012', fontSize: 6, alignment: 'center', color: '#666666' }
                ]
              },
              {
                stack: [
                  { text: 'FECHA Y HORA:', fontSize: 8, bold: true, alignment: 'right' },
                  { text: fechaActual.toLocaleString('es-MX'), fontSize: 8, alignment: 'right' },
                  { text: `Exp: ${this.obtenerNumeroExpedientePreferido(pacienteCompleto.expediente)}`, fontSize: 7, alignment: 'right', margin: [0, 5, 0, 0] }
                ]
              }
            ]
          ]
        },
        layout: 'noBorders'
      };
    }
  };
}

// Método auxiliar para formatear dirección completa
private formatearDireccionCompleta(paciente: any): string {
  const domicilio = paciente.domicilio || {};
  const partes = [
    domicilio.calle,
    domicilio.numero_exterior ? `#${domicilio.numero_exterior}` : null,
    domicilio.numero_interior ? `Int. ${domicilio.numero_interior}` : null,
    domicilio.colonia,
    domicilio.codigo_postal ? `C.P. ${domicilio.codigo_postal}` : null,
    domicilio.municipio,
    domicilio.estado
  ].filter(Boolean);

  return partes.length > 0 ? partes.join(', ') : 'Domicilio no especificado';
}


}
