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
    return (
      expediente?.numero_expediente_administrativo ||
      expediente?.numero_expediente ||
      'Sin número'
    );
  }

  private calcularIMC(peso: number, talla: number): string {
    if (!peso || !talla || peso <= 0 || talla <= 0) return '__';
    const imc = peso / Math.pow(talla / 100, 2);
    return imc.toFixed(1);
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
    if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) {
      return `${edad - 1} años`;
    }
    return `${edad} años`;
  }

  private formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-Mx', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
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
    if (edad < 3) return 'Lactante';
    if (edad < 6) return 'Preescolar';
    if (edad < 12) return `${edad - 5}° Primaria`;
    if (edad < 15) return `${edad - 11}° Secundaria`;
    if (edad < 18) return `${edad - 14}° Preparatoria`;
    return 'No aplica';
  }

  private construirTextoGuiasClinicas(guias: any[]): string {
    if (!guias || guias.length === 0) {
      return 'Guía clínica por definir según evolución clínica y estudios complementarios';
    }

    if (guias.length === 1) {
      const guia = guias[0];
      return (
        guia.nombre ||
        guia.nombre_completo ||
        `Guía Clínica ID: ${guia.id_guia_diagnostico}`
      );
    }

    return guias
      .map((guia, index) => {
        const nombre =
          guia.nombre ||
          guia.nombre_completo ||
          `Guía ID: ${guia.id_guia_diagnostico}`;
        const codigo = guia.codigo ? ` (${guia.codigo})` : '';
        return `${index + 1}. ${nombre}${codigo}`;
      })
      .join('\n');
  }

  private async obtenerImagenBase64(rutaImagen: string): Promise<string> {
    try {
      let urlCompleta: string;
      if (
        rutaImagen.startsWith('http://') ||
        rutaImagen.startsWith('https://')
      ) {
        urlCompleta = rutaImagen;
      } else {
        urlCompleta = `http://localhost:3000${rutaImagen}`;
      }
      console.log('Obteniendo imagen de:', urlCompleta);
      const response = await this.http
        .get(urlCompleta, { responseType: 'blob' })
        .toPromise();
      if (!response) {
        throw new Error('No se pudo obtener la imagen');
      }
      const tipoImagen = response.type;
      console.log('📄 Tipo de imagen:', tipoImagen);
      if (tipoImagen === 'image/svg+xml' || rutaImagen.endsWith('.svg')) {
        return await this.convertirSvgAPng(response);
      }
      // Para PNG, JPG, etc. - conversión normal
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          console.log('✅ Imagen convertida exitosamente');
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(response);
      });
    } catch (error) {
      console.error('Error al convertir imagen:', error);
      return this.obtenerImagenPlaceholder();
    }
  }

  private async convertirSvgAPng(svgBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgText = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo crear contexto de canvas'));
            return;
          }
          const aspectRatio = img.width / img.height;
          let canvasWidth, canvasHeight;
          if (aspectRatio > 2) {
            // Imagen muy ancha (como 600x200 = 3:1)
            canvasWidth = 120;
            canvasHeight = 40;
          } else if (aspectRatio > 1.5) {
            // Imagen moderadamente ancha (como 411x200 = 2:1)
            canvasWidth = 100;
            canvasHeight = 50;
          } else {
            // Imagen más cuadrada
            canvasWidth = 80;
            canvasHeight = 60;
          }
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          // Fondo transparente (mejor para logos)
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Dibujar SVG manteniendo proporciones
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png', 0.9);
          console.log(
            `✅ SVG convertido: ${img.width}x${img.height} → ${canvasWidth}x${canvasHeight}`
          );
          resolve(dataUrl);
        };

        img.onerror = () => {
          console.warn('❌ Error al cargar SVG, usando placeholder');
          resolve(this.obtenerImagenPlaceholder());
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
    canvas.width = 120; // 🔥 Tamaño más apropiado
    canvas.height = 40; // 🔥 Proporción 3:1
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

  /////////////////////////METODOS AUXILIARES/////////////////////////////////
  // ==========================================
  // MÉTODOS AUXILIARES PARA TABLAS Y LAYOUTS
  // ==========================================

  private getTableLayout(): any {
    return {
      hLineWidth: (i: number, node: any) => {
        return i === 0 || i === node.table.body.length ? 1 : 0.5;
      },
      vLineWidth: (i: number, node: any) => {
        return i === 0 || i === node.table.widths.length ? 1 : 0.5;
      },
      hLineColor: (i: number, node: any) => {
        return '#d1d5db';
      },
      vLineColor: (i: number, node: any) => {
        return '#d1d5db';
      },
      paddingLeft: (i: number, node: any) => 4,
      paddingRight: (i: number, node: any) => 4,
      paddingTop: (i: number, node: any) => 4,
      paddingBottom: (i: number, node: any) => 4,
      fillColor: (rowIndex: number, node: any, columnIndex: number) => {
        return rowIndex % 2 === 0 ? '#f9fafb' : null;
      },
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
      domicilio.estado,
    ].filter(Boolean);

    return partes.length > 0 ? partes.join(', ') : 'Domicilio no especificado';
  }

  private obtenerTituloSolicitud(tipo: string): string {
    const titulos: { [key: string]: string } = {
      laboratorio: 'SOLICITUD DE LABORATORIO',
      imagen: 'SOLICITUD DE IMAGENOLOGÍA',
      otros: 'SOLICITUD DE ESTUDIO ESPECIAL',
    };
    return titulos[tipo] || 'SOLICITUD DE ESTUDIO';
  }

  private obtenerIconoSolicitud(tipo: string): string {
    const iconos: { [key: string]: string } = {
      laboratorio: '🧪',
      imagen: '📷',
      otros: '🔬',
    };
    return iconos[tipo] || '📄';
  }

  private obtenerTituloSeccionEstudios(tipo: string): string {
    const titulos: { [key: string]: string } = {
      laboratorio: 'ESTUDIOS DE LABORATORIO SOLICITADOS',
      imagen: 'ESTUDIOS DE IMAGENOLOGÍA SOLICITADOS',
      otros: 'ESTUDIOS ESPECIALES SOLICITADOS',
    };
    return titulos[tipo] || 'ESTUDIOS SOLICITADOS';
  }

  private obtenerIconoSeccionEstudios(tipo: string): string {
    const iconos: { [key: string]: string } = {
      laboratorio: '📊',
      imagen: '🖼️',
      otros: '⚗️',
    };
    return iconos[tipo] || '📋';
  }

  private formatearUrgencia(urgencia: string): string {
    const urgencias: { [key: string]: string } = {
      normal: 'Normal',
      urgente: 'URGENTE',
      stat: 'STAT (Inmediato)',
    };
    return urgencias[urgencia] || urgencia;
  }

  private generarFolioSolicitud(): string {
    const fecha = new Date();
    const timestamp = fecha.getTime().toString().slice(-6);
    return `SOL-${fecha.getFullYear()}-${timestamp}`;
  }

    // MÉTODOS AUXILIARES PARA NOTA DE EVOLUCIÓN
  private tieneSignosVitales(notaEvolucion: any): boolean {
    return !!(
      notaEvolucion.temperatura ||
      notaEvolucion.frecuencia_cardiaca ||
      notaEvolucion.frecuencia_respiratoria ||
      notaEvolucion.presion_arterial_sistolica ||
      notaEvolucion.presion_arterial_diastolica ||
      notaEvolucion.saturacion_oxigeno ||
      notaEvolucion.peso_actual ||
      notaEvolucion.talla_actual
    );
  }

  private tieneExploracionSistemas(notaEvolucion: any): boolean {
    return !!(
      notaEvolucion.exploracion_cabeza ||
      notaEvolucion.exploracion_cuello ||
      notaEvolucion.exploracion_torax ||
      notaEvolucion.exploracion_abdomen ||
      notaEvolucion.exploracion_extremidades ||
      notaEvolucion.exploracion_neurologico
    );
  }

  // MÉTODOS AUXILIARES PARA PRESCRIPCIONES
  private generarFolioReceta(): string {
    const fecha = new Date();
    const timestamp = fecha.getTime().toString().slice(-6);
    return `RX-${fecha.getFullYear()}-${timestamp}`;
  }

  /////////////////////////////////////////// GENERACION DE DOCUMETNOS ///////////////////////////////////////

  async generarHistoriaClinica(datos: any): Promise<any> {
    const validarTodasLasTablas = (
      contenido: any[],
      nombre: string = 'Documento'
    ) => {
      contenido.forEach((elemento, index) => {
        if (elemento && elemento.table) {
          try {
            validarTabla(elemento, `${nombre}[${index}]`);
          } catch (error) {
            console.error(`Error en tabla ${nombre}[${index}]:`, error);
            throw error;
          }
        }
        if (elemento && elemento.table && elemento.table.body) {
          elemento.table.body.forEach((fila: any[], filaIndex: number) => {
            fila.forEach((celda: any, celdaIndex: number) => {
              if (celda && celda.table) {
                try {
                  validarTabla(
                    celda,
                    `${nombre}[${index}].fila[${filaIndex}].celda[${celdaIndex}]`
                  );
                } catch (error) {
                  console.error(
                    `❌ Error en tabla anidada ${nombre}[${index}].fila[${filaIndex}].celda[${celdaIndex}]:`,
                    error
                  );
                  throw error;
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
    const domicilioPaciente =
      pacienteCompleto.domicilio || 'Sin dirección registrada';
    const lugarNacimiento =
      pacienteCompleto.lugar_nacimiento || 'No especificado';
    const tipoSangre = pacienteCompleto.tipo_sangre || 'No especificado';
    const contarFilasIdentificacion = () => {
      let filas = 7;
      if (esPediatrico) filas += 1;
      return filas;
    };
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

      console.log(
        `  Antecedentes: ${filas} filas calculadas (esPediatrico: ${esPediatrico}, sexo: ${pacienteCompleto.sexo})`
      );
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
        console.log(
          `✅ Tabla ${nombreTabla} validada correctamente: ${tabla.table.body.length} filas`
        );
      } else {
        throw new Error(
          `Tabla ${nombreTabla} tiene errores: ${erroresEncontrados.join(', ')}`
        );
      }
    };

    const crearFilasIdentificacion = () => {
      const filasBase = [
        [
          {
            text: 'IDENTIFICACIÓN',
            fontSize: 8,
            bold: true,
            fillColor: '#f5f5f5',
            alignment: 'center',
            rowSpan: contarFilasIdentificacion(),
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
                  },
                  {
                    text: fechaActual.toLocaleTimeString('es-MX'),
                    fontSize: 7,
                    alignment: 'center',
                  },
                  {
                    text:
                      this.obtenerNumeroExpedientePreferido(
                        pacienteCompleto.expediente
                      ) || 'N/A',
                    fontSize: 7,
                    alignment: 'center',
                    bold: true,
                  },
                  {
                    text: historiaClinicaData.numero_cama || 'NO ASIGNADO',
                    fontSize: 7,
                    alignment: 'center',
                  },
                  {
                    text: medicoCompleto.departamento || 'No especificado',
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

        // FILA 2: Datos del paciente
        [
          {},
          {
            table: {
              widths: ['55%', '15%', '15%', '15%'],
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
                  {
                    text: 'Tipo de sangre',
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
                  },
                  {
                    text: pacienteCompleto.sexo,
                    fontSize: 7,
                    alignment: 'center',
                  },
                  {
                    text: tipoSangre,
                    fontSize: 7,
                    alignment: 'center',
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

        // FILA 3: Domicilio
        [
          {},
          {
            table: {
              widths: ['100%'],
              body: [
                [{ text: 'Domicilio del paciente', fontSize: 7, bold: true }],
                [{ text: domicilioPaciente, fontSize: 7, margin: [2, 3] }],
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

        // FILA 4: Datos personales básicos
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
                  // ✅ USAR CAMPOS YA PROCESADOS
                  {
                    text:
                      this.formatearFecha(pacienteCompleto.fecha_nacimiento) ||
                      'No registrada',
                    fontSize: 7,
                    alignment: 'center',
                  },
                  {
                    text: pacienteCompleto.curp || 'No registrado',
                    fontSize: 6,
                    alignment: 'center',
                  },
                  { text: lugarNacimiento, fontSize: 7, alignment: 'center' },
                  {
                    text: pacienteCompleto.telefono || 'No registrado',
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

        // FILA 5: Ocupación/Escolaridad
        [
          {},
          {
            table: {
              widths: ['25%', '25%', '25%', '25%'],
              body: [
                [
                  {
                    text: esPediatrico ? 'Grado escolar' : 'Ocupación',
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
                    text: esPediatrico
                      ? pacienteCompleto.grado_escolar ||
                        this.determinarGradoEscolarPorEdad(
                          pacienteCompleto.edad
                        )
                      : pacienteCompleto.ocupacion || 'No registrada',
                    fontSize: 7,
                    alignment: 'center',
                  },
                  {
                    text: pacienteCompleto.escolaridad || 'No registrada',
                    fontSize: 7,
                    alignment: 'center',
                  },
                  {
                    text: pacienteCompleto.estado_civil || 'No registrado',
                    fontSize: 7,
                    alignment: 'center',
                  },
                  {
                    text: pacienteCompleto.religion || 'No registrada',
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
      ];

      // FILA DE PADRES SOLO SI ES PEDIÁTRICO
      if (esPediatrico) {
        filasBase.push([
          {},
          {
            table: {
              widths: ['25%', '25%', '25%', '25%'],
              body: [
                [
                  {
                    text: 'Nombre del padre',
                    fontSize: 7,
                    bold: true,
                    alignment: 'center',
                  },
                  {
                    text: 'Edad padre',
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
                  {
                    text: 'Edad madre',
                    fontSize: 7,
                    bold: true,
                    alignment: 'center',
                  },
                ],
                [
                  {
                    text: datosPadres.nombre_padre || 'No registrado',
                    fontSize: 7,
                    alignment: 'center',
                  },
                  {
                    text: datosPadres.edad_padre || 'N/A',
                    fontSize: 7,
                    alignment: 'center',
                  },
                  {
                    text: datosPadres.nombre_madre || 'No registrado',
                    fontSize: 7,
                    alignment: 'center',
                  },
                  {
                    text: datosPadres.edad_madre || 'N/A',
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
        ]);
      }
      // FILAS FINALES
      filasBase.push(
        // Familiar responsable
        [
          {},
          {
            table: {
              widths: ['60%', '40%'],
              body: [
                [
                  {
                    text: esPediatrico
                      ? 'Familiar responsable/Tutor'
                      : 'Contacto de emergencia',
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
                  // ✅ USAR CAMPOS YA PROCESADOS
                  {
                    text:
                      pacienteCompleto.familiar_responsable || 'No registrado',
                    fontSize: 7,
                    alignment: 'center',
                  },
                  {
                    text: pacienteCompleto.telefono_familiar || 'No registrado',
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
        // Médico responsable
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
                  },
                  {
                    text: medicoCompleto.numero_cedula || 'No registrada',
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
        ]
      );
      return filasBase;
    };

    const tablaIdentificacion = {
      table: { widths: ['15%', '85%'], body: crearFilasIdentificacion() },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000',
      },
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
            text:
              historiaClinicaData.antecedentes_heredo_familiares ||
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
            text:
              `Alimentación: ${
                historiaClinicaData.habitos_alimenticios || 'No registrado'
              }\n` +
              `Higiene: ${
                historiaClinicaData.habitos_higienicos || 'Adecuada'
              }\n` +
              `Actividad física: ${
                historiaClinicaData.actividad_fisica ||
                (esPediatrico ? 'Apropiada para la edad' : 'Regular')
              }\n` +
              `Vivienda: ${
                historiaClinicaData.vivienda ||
                'Casa habitación con servicios básicos'
              }\n` +
              `${
                esPediatrico
                  ? 'Inmunizaciones: Esquema completo según edad\n'
                  : ''
              }` +
              `${
                esPediatrico ? 'Desarrollo psicomotor: Acorde a la edad\n' : ''
              }` +
              `${
                !esPediatrico && historiaClinicaData.toxicomanias
                  ? `Toxicomanías: ${historiaClinicaData.toxicomanias}\n`
                  : ''
              }`,
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
            text:
              `Enfermedades en la infancia: ${
                historiaClinicaData.enfermedades_infancia || 'Negadas'
              }\n` +
              `${
                !esPediatrico
                  ? `Enfermedades en el adulto: ${
                      historiaClinicaData.enfermedades_adulto || 'Negadas'
                    }\n`
                  : ''
              }` +
              `Hospitalizaciones previas: ${
                historiaClinicaData.hospitalizaciones_previas || 'Ninguna'
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
            margin: [3, 2],
            lineHeight: 1.1,
          },
        ],
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
              text:
                `Menarca: ${
                  historiaClinicaData.menarca || 'No registrada'
                } años\n` +
                `Ritmo menstrual: ${
                  historiaClinicaData.ritmo_menstrual || 'No registrado'
                }\n` +
                `Gestas: ${historiaClinicaData.gestas || '0'} | Partos: ${
                  historiaClinicaData.partos || '0'
                } | Cesáreas: ${
                  historiaClinicaData.cesareas || '0'
                } | Abortos: ${historiaClinicaData.abortos || '0'}\n` +
                `Método de planificación familiar: ${
                  historiaClinicaData.metodo_planificacion || 'Ninguno'
                }`,
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
              text:
                `Control prenatal: ${
                  historiaClinicaData.control_prenatal || 'Sí'
                }\n` +
                `Tipo de parto: ${
                  historiaClinicaData.tipo_parto || 'Vaginal'
                }\n` +
                `Peso al nacer: ${
                  historiaClinicaData.peso_nacer || 'No registrado'
                } kg\n` +
                `Complicaciones neonatales: ${
                  historiaClinicaData.complicaciones_neonatales || 'Ninguna'
                }\n` +
                `Apgar: ${historiaClinicaData.apgar || 'No registrado'}\n` +
                `Edad gestacional: ${
                  historiaClinicaData.edad_gestacional || 'No registrada'
                } semanas`,
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
        body: crearFilasAntecedentes(),
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000',
      },
    };

    console.log(
      `  Debug: Tabla tiene ${
        tablaIdentificacion.table.body.length
      } filas, rowSpan configurado para ${contarFilasIdentificacion()}`
    );
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
                image: await this.obtenerImagenBase64(
                  datos.configuracion?.logo_gobierno ||
                    '/uploads/logos/logo-gobierno-default.svg'
                ),
                fit: [80, 40], // 🔥 USAR fit EN LUGAR DE width/height
                alignment: 'left',
                margin: [0, 5],
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
                margin: [0, 8],
              },
              {
                // Logo del hospital (derecha)
                image: await this.obtenerImagenBase64(
                  datos.configuracion?.logo_principal ||
                    '/uploads/logos/logo-principal-default.svg'
                ),
                fit: [80, 40], // 🔥 USAR fit EN LUGAR DE width/height
                alignment: 'right',
                margin: [0, 5],
              },
            ],
          ],
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
                  {
                    text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ',
                    fontSize: 11,
                    bold: true,
                  },
                  { text: 'San Luis de la Paz, Guanajuato', fontSize: 9 },
                  {
                    text: 'RFC: HGS-123456-ABC',
                    fontSize: 8,
                    color: '#666666',
                  },
                ],
                border: [false, false, false, false],
              },
              {
                stack: [
                  {
                    text: 'HOJA FRONTAL',
                    fontSize: 14,
                    bold: true,
                    alignment: 'center',
                  },
                  {
                    text: 'DE EXPEDIENTE CLÍNICO',
                    fontSize: 12,
                    bold: true,
                    alignment: 'center',
                  },
                  {
                    text: 'NOM-004-SSA3-2012',
                    fontSize: 8,
                    alignment: 'center',
                    color: '#666666',
                  },
                ],
                border: [false, false, false, false],
              },
            ],
          ],
        },
        layout: 'noBorders',
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
                {
                  text: 'EXPEDIENTE No.',
                  fontSize: 9,
                  bold: true,
                  fillColor: '#f0f8ff',
                },
                {
                  text:
                    this.obtenerNumeroExpedientePreferido(
                      pacienteCompleto.expediente
                    ) || 'N/A',
                  fontSize: 10,
                  bold: true,
                },
                {
                  text: 'FECHA APERTURA',
                  fontSize: 9,
                  bold: true,
                  fillColor: '#f0f8ff',
                },
                { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 9 },
              ],
              [
                {
                  text: 'TIPO EXPEDIENTE',
                  fontSize: 9,
                  bold: true,
                  fillColor: '#f0f8ff',
                },
                {
                  text: pacienteCompleto.edad < 18 ? 'PEDIÁTRICO' : 'ADULTO',
                  fontSize: 9,
                },
                {
                  text: 'FOLIO',
                  fontSize: 9,
                  bold: true,
                  fillColor: '#f0f8ff',
                },
                { text: '____________', fontSize: 9 },
              ],
            ],
          },
          layout: {
            fillColor: function (
              rowIndex: number,
              node: any,
              columnIndex: number
            ) {
              return columnIndex % 2 === 0 ? '#f8f9fa' : null;
            },
          },
          margin: [0, 0, 0, 15],
        },

        // 🏥 DATOS DEL ESTABLECIMIENTO
        {
          text: 'DATOS DEL ESTABLECIMIENTO DE SALUD',
          fontSize: 11,
          bold: true,
          margin: [0, 10, 0, 5],
          decoration: 'underline',
        },
        {
          table: {
            widths: ['30%', '70%'],
            body: [
              [
                { text: 'Tipo de Establecimiento:', fontSize: 9, bold: true },
                {
                  text:
                    hojaFrontalData.tipo_establecimiento || 'Hospital General',
                  fontSize: 9,
                },
              ],
              [
                { text: 'Nombre:', fontSize: 9, bold: true },
                {
                  text:
                    hojaFrontalData.nombre_establecimiento ||
                    'Hospital General San Luis de la Paz',
                  fontSize: 9,
                },
              ],
              [
                { text: 'Domicilio:', fontSize: 9, bold: true },
                {
                  text:
                    hojaFrontalData.domicilio_establecimiento ||
                    'San Luis de la Paz, Guanajuato, México',
                  fontSize: 9,
                },
              ],
              [
                { text: 'Razón Social:', fontSize: 9, bold: true },
                {
                  text:
                    hojaFrontalData.razon_social ||
                    'Servicios de Salud de Guanajuato',
                  fontSize: 9,
                },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15],
        },

        // 👤 DATOS COMPLETOS DEL PACIENTE
        {
          text: 'DATOS DEL PACIENTE',
          fontSize: 11,
          bold: true,
          margin: [0, 10, 0, 5],
          decoration: 'underline',
        },
        {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
                {
                  text: 'NOMBRE COMPLETO:',
                  fontSize: 8,
                  bold: true,
                  colSpan: 1,
                },
                {
                  text: pacienteCompleto.nombre_completo || 'N/A',
                  fontSize: 9,
                  colSpan: 3,
                },
                {},
                {},
              ],
              [
                { text: 'CURP:', fontSize: 8, bold: true },
                { text: pacienteCompleto.curp || 'N/A', fontSize: 8 },
                { text: 'RFC:', fontSize: 8, bold: true },
                { text: pacienteCompleto.rfc || 'N/A', fontSize: 8 },
              ],
              [
                { text: 'FECHA NACIMIENTO:', fontSize: 8, bold: true },
                {
                  text: pacienteCompleto.fecha_nacimiento
                    ? new Date(
                        pacienteCompleto.fecha_nacimiento
                      ).toLocaleDateString('es-MX')
                    : 'N/A',
                  fontSize: 8,
                },
                { text: 'EDAD:', fontSize: 8, bold: true },
                { text: `${pacienteCompleto.edad || 0} años`, fontSize: 8 },
              ],
              [
                { text: 'SEXO:', fontSize: 8, bold: true },
                { text: pacienteCompleto.sexo || 'N/A', fontSize: 8 },
                { text: 'ESTADO CIVIL:', fontSize: 8, bold: true },
                { text: hojaFrontalData.estado_conyugal || 'N/A', fontSize: 8 },
              ],
              [
                { text: 'LUGAR NACIMIENTO:', fontSize: 8, bold: true },
                {
                  text: hojaFrontalData.lugar_nacimiento || 'N/A',
                  fontSize: 8,
                },
                { text: 'NACIONALIDAD:', fontSize: 8, bold: true },
                {
                  text: hojaFrontalData.nacionalidad || 'Mexicana',
                  fontSize: 8,
                },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15],
        },

        // 🏠 DOMICILIO COMPLETO
        {
          text: 'DOMICILIO',
          fontSize: 11,
          bold: true,
          margin: [0, 10, 0, 5],
          decoration: 'underline',
        },
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text:
                    this.formatearDireccionCompleta(pacienteCompleto) ||
                    'No especificado',
                  fontSize: 9,
                },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15],
        },

        // 📞 CONTACTO DE EMERGENCIA
        {
          text: 'CONTACTO DE EMERGENCIA',
          fontSize: 11,
          bold: true,
          margin: [0, 10, 0, 5],
          decoration: 'underline',
        },
        {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
                { text: 'NOMBRE:', fontSize: 8, bold: true },
                {
                  text:
                    hojaFrontalData.contacto_emergencia_1?.nombre_completo ||
                    'N/A',
                  fontSize: 9,
                  colSpan: 2,
                },
                {},
                { text: 'PARENTESCO:', fontSize: 8, bold: true },
              ],
              [
                {
                  text:
                    hojaFrontalData.contacto_emergencia_1?.parentesco || 'N/A',
                  fontSize: 9,
                },
                { text: 'TELÉFONO 1:', fontSize: 8, bold: true },
                {
                  text:
                    hojaFrontalData.contacto_emergencia_1?.telefono_principal ||
                    'N/A',
                  fontSize: 9,
                },
                { text: 'TELÉFONO 2:', fontSize: 8, bold: true },
              ],
              [
                {
                  text:
                    hojaFrontalData.contacto_emergencia_1
                      ?.telefono_secundario || 'N/A',
                  fontSize: 9,
                },
                { text: 'DIRECCIÓN:', fontSize: 8, bold: true, colSpan: 3 },
                {},
                {},
              ],
              [
                {
                  text:
                    hojaFrontalData.contacto_emergencia_1?.direccion || 'N/A',
                  fontSize: 9,
                  colSpan: 4,
                },
                {},
                {},
                {},
              ],
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15],
        },

        // 🩸 INFORMACIÓN MÉDICA RELEVANTE
        {
          text: 'INFORMACIÓN MÉDICA RELEVANTE',
          fontSize: 11,
          bold: true,
          margin: [0, 10, 0, 5],
          decoration: 'underline',
        },
        {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
                { text: 'TIPO SANGRE:', fontSize: 8, bold: true },
                {
                  text: `${pacienteCompleto.tipo_sangre || 'N/A'} ${
                    pacienteCompleto.factor_rh || ''
                  }`.trim(),
                  fontSize: 9,
                },
                { text: 'AFILIACIÓN:', fontSize: 8, bold: true },
                {
                  text: hojaFrontalData.afiliacion_medica || 'Ninguna',
                  fontSize: 8,
                },
              ],
              [
                { text: 'No. AFILIACIÓN:', fontSize: 8, bold: true },
                {
                  text: hojaFrontalData.numero_afiliacion || 'N/A',
                  fontSize: 8,
                },
                { text: 'ESCOLARIDAD:', fontSize: 8, bold: true },
                { text: hojaFrontalData.escolaridad || 'N/A', fontSize: 8 },
              ],
              [
                { text: 'OCUPACIÓN:', fontSize: 8, bold: true },
                { text: hojaFrontalData.ocupacion || 'N/A', fontSize: 8 },
                { text: 'RELIGIÓN:', fontSize: 8, bold: true },
                { text: hojaFrontalData.religion || 'N/A', fontSize: 8 },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15],
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
                    {
                      text:
                        hojaFrontalData.alergias_conocidas ||
                        'Ninguna conocida',
                      fontSize: 8,
                      margin: [0, 2, 0, 0],
                    },
                  ],
                },
                {
                  stack: [
                    { text: 'ENFERMEDADES CRÓNICAS:', fontSize: 9, bold: true },
                    {
                      text: hojaFrontalData.enfermedades_cronicas || 'Ninguna',
                      fontSize: 8,
                      margin: [0, 2, 0, 0],
                    },
                  ],
                },
              ],
              [
                {
                  stack: [
                    { text: 'MEDICAMENTOS ACTUALES:', fontSize: 9, bold: true },
                    {
                      text: hojaFrontalData.medicamentos_actuales || 'Ninguno',
                      fontSize: 8,
                      margin: [0, 2, 0, 0],
                    },
                  ],
                  colSpan: 2,
                },
                {},
              ],
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20],
        },

        // 📝 SECCIÓN DE OBSERVACIONES
        {
          text: 'OBSERVACIONES',
          fontSize: 11,
          bold: true,
          margin: [0, 10, 0, 5],
          decoration: 'underline',
        },
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: hojaFrontalData.observaciones || '_'.repeat(100),
                  fontSize: 9,
                  margin: [5, 10, 5, 10],
                },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 30],
        },
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
                    {
                      text: medicoCompleto.nombre_completo || 'Dr. [Nombre]',
                      fontSize: 8,
                    },
                    {
                      text: `Cédula: ${medicoCompleto.cedula || 'N/A'}`,
                      fontSize: 7,
                    },
                    {
                      text: '_'.repeat(25),
                      fontSize: 8,
                      margin: [0, 10, 0, 0],
                    },
                    { text: 'FIRMA', fontSize: 7, alignment: 'center' },
                  ],
                },
                {
                  stack: [
                    {
                      text: `Página ${currentPage} de ${pageCount}`,
                      fontSize: 8,
                      alignment: 'center',
                    },
                    {
                      text: 'HOJA FRONTAL DE EXPEDIENTE',
                      fontSize: 7,
                      alignment: 'center',
                      margin: [0, 5, 0, 0],
                    },
                    {
                      text: 'NOM-004-SSA3-2012',
                      fontSize: 6,
                      alignment: 'center',
                      color: '#666666',
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: 'FECHA Y HORA:',
                      fontSize: 8,
                      bold: true,
                      alignment: 'right',
                    },
                    {
                      text: fechaActual.toLocaleString('es-MX'),
                      fontSize: 8,
                      alignment: 'right',
                    },
                    {
                      text: `Exp: ${this.obtenerNumeroExpedientePreferido(
                        pacienteCompleto.expediente
                      )}`,
                      fontSize: 7,
                      alignment: 'right',
                      margin: [0, 5, 0, 0],
                    },
                  ],
                },
              ],
            ],
          },
          layout: 'noBorders',
        };
      },
    };
  }

  async generarSolicitudEstudio(datos: any): Promise<any> {
    console.log('📄 Generando Solicitud de Estudio...');

    const { pacienteCompleto, medicoCompleto, solicitudEstudio } = datos;
    const fechaActual = new Date();
    const tipoEstudio = solicitudEstudio.tipo_estudio || 'laboratorio';

    // Obtener título dinámico
    const tituloDocumento = this.obtenerTituloSolicitud(tipoEstudio);
    const iconoDocumento = this.obtenerIconoSolicitud(tipoEstudio);

    return {
      pageSize: 'LETTER',
      pageMargins: [40, 80, 40, 60],

      header: (currentPage: number, pageCount: number) => {
        return {
          margin: [40, 20, 40, 20],
          table: {
            widths: ['33%', '34%', '33%'],
            body: [
              [
                {
                  stack: [
                    { text: 'HOSPITAL GENERAL', fontSize: 12, bold: true },
                    { text: 'SAN LUIS DE LA PAZ', fontSize: 10, bold: true },
                    { text: 'GUANAJUATO, MÉXICO', fontSize: 8 },
                  ],
                },
                {
                  stack: [
                    {
                      text: `${iconoDocumento} ${tituloDocumento}`,
                      fontSize: 14,
                      bold: true,
                      alignment: 'center',
                      color: '#2563eb',
                    },
                    {
                      text: 'Cumplimiento NOM-004-SSA3-2012',
                      fontSize: 8,
                      alignment: 'center',
                      italics: true,
                      color: '#666666',
                      margin: [0, 5],
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: 'FECHA:',
                      fontSize: 8,
                      bold: true,
                      alignment: 'right',
                    },
                    {
                      text: fechaActual.toLocaleDateString('es-MX'),
                      fontSize: 10,
                      alignment: 'right',
                    },
                    {
                      text: `Folio: ${this.generarFolioSolicitud()}`,
                      fontSize: 8,
                      alignment: 'right',
                      margin: [0, 2],
                    },
                  ],
                },
              ],
            ],
          },
          layout: 'noBorders',
        };
      },

      content: [
        // SECCIÓN DATOS DEL PACIENTE
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '👤 DATOS DEL PACIENTE',
                  style: 'sectionHeader',
                  fillColor: '#f3f4f6',
                  margin: [10, 8],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#d1d5db',
            vLineColor: () => '#d1d5db',
          },
          margin: [0, 0, 0, 10],
        },

        {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
                { text: 'Nombre Completo:', style: 'fieldLabel' },
                {
                  text: pacienteCompleto.nombre_completo || 'N/A',
                  style: 'fieldValue',
                },
                { text: 'Expediente:', style: 'fieldLabel' },
                {
                  text: pacienteCompleto.numero_expediente || 'N/A',
                  style: 'fieldValue',
                },
              ],
              [
                { text: 'Edad:', style: 'fieldLabel' },
                {
                  text: `${pacienteCompleto.edad || 'N/A'} años`,
                  style: 'fieldValue',
                },
                { text: 'Sexo:', style: 'fieldLabel' },
                { text: pacienteCompleto.sexo || 'N/A', style: 'fieldValue' },
              ],
              [
                { text: 'Fecha Nacimiento:', style: 'fieldLabel' },
                {
                  text: this.formatearFecha(pacienteCompleto.fecha_nacimiento),
                  style: 'fieldValue',
                },
                { text: 'Tipo de Sangre:', style: 'fieldLabel' },
                {
                  text: pacienteCompleto.tipo_sangre || 'No especificado',
                  style: 'fieldValue',
                },
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15],
        },

        // SECCIÓN ESTUDIOS SOLICITADOS (DINÁMICO)
        this.generarSeccionEstudios(solicitudEstudio, tipoEstudio),

        // SECCIÓN INFORMACIÓN CLÍNICA
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '🏥 INFORMACIÓN CLÍNICA',
                  style: 'sectionHeader',
                  fillColor: '#f3f4f6',
                  margin: [10, 8],
                },
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 15, 0, 10],
        },

        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  stack: [
                    { text: 'INDICACIÓN CLÍNICA:', style: 'fieldLabel' },
                    {
                      text:
                        solicitudEstudio.indicacion_clinica ||
                        'No especificada',
                      style: 'fieldValue',
                      margin: [0, 5, 0, 10],
                    },
                  ],
                },
                {
                  stack: [
                    { text: 'DIAGNÓSTICO PRESUNTIVO:', style: 'fieldLabel' },
                    {
                      text:
                        solicitudEstudio.diagnostico_presuntivo ||
                        'No especificado',
                      style: 'fieldValue',
                      margin: [0, 5, 0, 10],
                    },
                  ],
                },
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15],
        },

        // SECCIÓN CONFIGURACIÓN
        {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
                { text: 'Urgencia:', style: 'fieldLabel' },
                {
                  text: this.formatearUrgencia(solicitudEstudio.urgencia),
                  style: 'fieldValue',
                },
                { text: 'Fecha Programada:', style: 'fieldLabel' },
                {
                  text:
                    this.formatearFecha(solicitudEstudio.fecha_programada) ||
                    'No programada',
                  style: 'fieldValue',
                },
              ],
              [
                { text: 'Ayuno Requerido:', style: 'fieldLabel' },
                {
                  text: solicitudEstudio.ayuno_requerido ? 'SÍ' : 'NO',
                  style: 'fieldValue',
                },
                { text: 'Contraste:', style: 'fieldLabel' },
                {
                  text: solicitudEstudio.contraste_requerido ? 'SÍ' : 'NO',
                  style: 'fieldValue',
                },
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15],
        },

        // OBSERVACIONES
        ...(solicitudEstudio.observaciones
          ? [
              {
                table: {
                  widths: ['100%'],
                  body: [
                    [
                      {
                        stack: [
                          { text: 'OBSERVACIONES:', style: 'fieldLabel' },
                          {
                            text: solicitudEstudio.observaciones,
                            style: 'fieldValue',
                            margin: [0, 5],
                          },
                        ],
                        margin: [10, 8],
                      },
                    ],
                  ],
                },
                layout: this.getTableLayout(),
                margin: [0, 0, 0, 20],
              },
            ]
          : []),

        // ESPACIADOR PARA FIRMAS
        { text: '', pageBreak: 'before' },

        // SECCIÓN FIRMAS
        {
          margin: [0, 40, 0, 0],
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  stack: [
                    {
                      text: '_'.repeat(40),
                      alignment: 'center',
                      margin: [0, 30, 0, 5],
                    },
                    { text: 'MÉDICO SOLICITANTE', style: 'signatureLabel' },
                    {
                      text: medicoCompleto.nombre_completo || 'N/A',
                      style: 'signatureName',
                    },
                    {
                      text: `Cédula: ${medicoCompleto.numero_cedula || 'N/A'}`,
                      style: 'signatureDetails',
                    },
                    {
                      text: `Especialidad: ${
                        medicoCompleto.especialidad || 'N/A'
                      }`,
                      style: 'signatureDetails',
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: '_'.repeat(40),
                      alignment: 'center',
                      margin: [0, 30, 0, 5],
                    },
                    { text: 'RECIBIDO POR', style: 'signatureLabel' },
                    {
                      text: 'LABORATORIO/IMAGENOLOGÍA',
                      style: 'signatureName',
                    },
                    {
                      text: 'Fecha: ________________',
                      style: 'signatureDetails',
                      margin: [0, 10, 0, 0],
                    },
                    {
                      text: 'Hora: ________________',
                      style: 'signatureDetails',
                    },
                  ],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
      ],

      footer: (currentPage: number, pageCount: number) => {
        return {
          margin: [40, 10],
          table: {
            widths: ['33%', '34%', '33%'],
            body: [
              [
                {
                  text: `${tituloDocumento} - Hospital General San Luis de la Paz`,
                  fontSize: 8,
                  color: '#666666',
                },
                {
                  text: `Página ${currentPage} de ${pageCount}`,
                  fontSize: 8,
                  alignment: 'center',
                  color: '#666666',
                },
                {
                  text: fechaActual.toLocaleString('es-MX'),
                  fontSize: 8,
                  alignment: 'right',
                  color: '#666666',
                },
              ],
            ],
          },
          layout: 'noBorders',
        };
      },

      styles: {
        sectionHeader: {
          fontSize: 12,
          bold: true,
          color: '#374151',
        },
        fieldLabel: {
          fontSize: 9,
          bold: true,
          color: '#4b5563',
        },
        fieldValue: {
          fontSize: 9,
          color: '#111827',
        },
        signatureLabel: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
          color: '#374151',
        },
        signatureName: {
          fontSize: 9,
          alignment: 'center',
          color: '#111827',
        },
        signatureDetails: {
          fontSize: 8,
          alignment: 'center',
          color: '#6b7280',
        },
        estudiosTitle: {
          fontSize: 10,
          bold: true,
          color: '#1f2937',
          margin: [0, 0, 0, 5],
        },
        estudioItem: {
          fontSize: 9,
          margin: [0, 2, 0, 2],
        },
      },
    };
  }

  // MÉTODOS AUXILIARES PARA LA SOLICITUD

  private generarSeccionEstudios(
    solicitudEstudio: any,
    tipoEstudio: string
  ): any {
    const estudiosArray = solicitudEstudio.estudios_solicitados
      ? solicitudEstudio.estudios_solicitados
          .split('\n')
          .filter((e: string) => e.trim())
      : [];

    const tituloSeccion = this.obtenerTituloSeccionEstudios(tipoEstudio);
    const iconoSeccion = this.obtenerIconoSeccionEstudios(tipoEstudio);

    return {
      stack: [
        // Header de la sección
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: `${iconoSeccion} ${tituloSeccion}`,
                  style: 'sectionHeader',
                  fillColor: '#f3f4f6',
                  margin: [10, 8],
                },
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 15, 0, 10],
        },

        // Lista de estudios
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'ESTUDIOS SOLICITADOS:', style: 'estudiosTitle' },
                    ...(estudiosArray.length > 0
                      ? estudiosArray.map((estudio: string) => ({
                          text: `• ${estudio}`,
                          style: 'estudioItem',
                        }))
                      : [
                          {
                            text: '• No se especificaron estudios',
                            style: 'estudioItem',
                            italics: true,
                            color: '#9ca3af',
                          },
                        ]),
                  ],
                  margin: [10, 8],
                },
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15],
        },
      ],
    };
  }

  async generarNotaEvolucion(datos: any): Promise<any> {
    console.log('📄 Generando Nota de Evolución Médica...');

    const { pacienteCompleto, medicoCompleto, notaEvolucion } = datos;
    const fechaActual = new Date();

    return {
      pageSize: 'LETTER',
      pageMargins: [40, 80, 40, 60],

      header: (currentPage: number, pageCount: number) => {
        return {
          table: {
            widths: ['33%', '34%', '33%'],
            body: [
              [
                {
                  image:
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                  width: 50,
                  height: 50,
                  alignment: 'left',
                },
                {
                  stack: [
                    {
                      text: 'HOSPITAL GENERAL',
                      fontSize: 14,
                      bold: true,
                      alignment: 'center',
                    },
                    {
                      text: 'SAN LUIS DE LA PAZ, GTO.',
                      fontSize: 10,
                      alignment: 'center',
                    },
                    {
                      text: 'NOTA DE EVOLUCIÓN MÉDICA',
                      fontSize: 12,
                      bold: true,
                      alignment: 'center',
                      margin: [0, 5, 0, 0],
                    },
                    {
                      text: 'NOM-004-SSA3-2012',
                      fontSize: 8,
                      alignment: 'center',
                      color: '#666666',
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: `Expediente: ${this.obtenerNumeroExpedientePreferido(
                        pacienteCompleto.expediente
                      )}`,
                      fontSize: 9,
                      alignment: 'right',
                    },
                    {
                      text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}`,
                      fontSize: 9,
                      alignment: 'right',
                    },
                    {
                      text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`,
                      fontSize: 9,
                      alignment: 'right',
                    },
                  ],
                },
              ],
            ],
          },
          layout: 'noBorders',
          margin: [40, 20, 40, 20],
        };
      },

      content: [
        // DATOS DEL PACIENTE
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '👤 DATOS DEL PACIENTE',
                  style: 'sectionHeader',
                  fillColor: '#e3f2fd',
                  margin: [10, 8],
                },
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
                { text: 'Nombre:', style: 'fieldLabel' },
                {
                  text: pacienteCompleto.nombre || 'No especificado',
                  style: 'fieldValue',
                },
                { text: 'Edad:', style: 'fieldLabel' },
                {
                  text: `${pacienteCompleto.edad || 'N/A'} años`,
                  style: 'fieldValue',
                },
              ],
              [
                { text: 'Sexo:', style: 'fieldLabel' },
                {
                  text: pacienteCompleto.sexo || 'No especificado',
                  style: 'fieldValue',
                },
                { text: 'Días Hospitalización:', style: 'fieldLabel' },
                {
                  text: notaEvolucion.dias_hospitalizacion
                    ? `${notaEvolucion.dias_hospitalizacion} días`
                    : 'Ambulatorio',
                  style: 'fieldValue',
                },
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15],
        },

        // SIGNOS VITALES
        ...(this.tieneSignosVitales(notaEvolucion)
          ? [
              {
                table: {
                  widths: ['100%'],
                  body: [
                    [
                      {
                        text: '💓 SIGNOS VITALES',
                        style: 'sectionHeader',
                        fillColor: '#ffebee',
                        margin: [10, 8],
                      },
                    ],
                  ],
                },
                layout: this.getTableLayout(),
                margin: [0, 10, 0, 10],
              },
              {
                table: {
                  widths: [
                    '12.5%',
                    '12.5%',
                    '12.5%',
                    '12.5%',
                    '12.5%',
                    '12.5%',
                    '12.5%',
                    '12.5%',
                  ],
                  body: [
                    [
                      {
                        text: 'Temp.',
                        style: 'fieldLabel',
                        alignment: 'center',
                      },
                      { text: 'FC', style: 'fieldLabel', alignment: 'center' },
                      { text: 'FR', style: 'fieldLabel', alignment: 'center' },
                      {
                        text: 'TA Sist.',
                        style: 'fieldLabel',
                        alignment: 'center',
                      },
                      {
                        text: 'TA Diast.',
                        style: 'fieldLabel',
                        alignment: 'center',
                      },
                      {
                        text: 'SatO₂',
                        style: 'fieldLabel',
                        alignment: 'center',
                      },
                      {
                        text: 'Peso',
                        style: 'fieldLabel',
                        alignment: 'center',
                      },
                      {
                        text: 'Talla',
                        style: 'fieldLabel',
                        alignment: 'center',
                      },
                    ],
                    [
                      {
                        text: notaEvolucion.temperatura
                          ? `${notaEvolucion.temperatura}°C`
                          : '--',
                        style: 'fieldValue',
                        alignment: 'center',
                      },
                      {
                        text: notaEvolucion.frecuencia_cardiaca
                          ? `${notaEvolucion.frecuencia_cardiaca} lpm`
                          : '--',
                        style: 'fieldValue',
                        alignment: 'center',
                      },
                      {
                        text: notaEvolucion.frecuencia_respiratoria
                          ? `${notaEvolucion.frecuencia_respiratoria} rpm`
                          : '--',
                        style: 'fieldValue',
                        alignment: 'center',
                      },
                      {
                        text: notaEvolucion.presion_arterial_sistolica
                          ? `${notaEvolucion.presion_arterial_sistolica}`
                          : '--',
                        style: 'fieldValue',
                        alignment: 'center',
                      },
                      {
                        text: notaEvolucion.presion_arterial_diastolica
                          ? `${notaEvolucion.presion_arterial_diastolica}`
                          : '--',
                        style: 'fieldValue',
                        alignment: 'center',
                      },
                      {
                        text: notaEvolucion.saturacion_oxigeno
                          ? `${notaEvolucion.saturacion_oxigeno}%`
                          : '--',
                        style: 'fieldValue',
                        alignment: 'center',
                      },
                      {
                        text: notaEvolucion.peso_actual
                          ? `${notaEvolucion.peso_actual} kg`
                          : '--',
                        style: 'fieldValue',
                        alignment: 'center',
                      },
                      {
                        text: notaEvolucion.talla_actual
                          ? `${notaEvolucion.talla_actual} cm`
                          : '--',
                        style: 'fieldValue',
                        alignment: 'center',
                      },
                    ],
                  ],
                },
                layout: this.getTableLayout(),
                margin: [0, 0, 0, 15],
              },
            ]
          : []),

        // EXPLORACIÓN FÍSICA
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '🔍 EXPLORACIÓN FÍSICA',
                  style: 'sectionHeader',
                  fillColor: '#e8f5e8',
                  margin: [10, 8],
                },
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 10, 0, 10],
        },
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'SÍNTOMAS Y SIGNOS:', style: 'fieldLabel' },
                    {
                      text: notaEvolucion.sintomas_signos || 'No especificado',
                      style: 'fieldValue',
                      margin: [0, 5, 0, 10],
                    },

                    { text: 'HABITUS EXTERIOR:', style: 'fieldLabel' },
                    {
                      text: notaEvolucion.habitus_exterior || 'No especificado',
                      style: 'fieldValue',
                      margin: [0, 5, 0, 10],
                    },

                    { text: 'ESTADO NUTRICIONAL:', style: 'fieldLabel' },
                    {
                      text:
                        notaEvolucion.estado_nutricional || 'No especificado',
                      style: 'fieldValue',
                      margin: [0, 5, 0, 0],
                    },
                  ],
                  margin: [10, 10],
                },
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15],
        },

        // EXPLORACIÓN POR SISTEMAS (si hay datos)
        ...(this.tieneExploracionSistemas(notaEvolucion)
          ? [
              {
                table: {
                  widths: ['50%', '50%'],
                  body: [
                    [
                      {
                        stack: [
                          ...(notaEvolucion.exploracion_cabeza
                            ? [
                                {
                                  text: 'CABEZA Y CUELLO:',
                                  style: 'fieldLabel',
                                },
                                {
                                  text: notaEvolucion.exploracion_cabeza,
                                  style: 'fieldValue',
                                  margin: [0, 2, 0, 8],
                                },
                              ]
                            : []),
                          ...(notaEvolucion.exploracion_torax
                            ? [
                                { text: 'TÓRAX:', style: 'fieldLabel' },
                                {
                                  text: notaEvolucion.exploracion_torax,
                                  style: 'fieldValue',
                                  margin: [0, 2, 0, 8],
                                },
                              ]
                            : []),
                          ...(notaEvolucion.exploracion_extremidades
                            ? [
                                { text: 'EXTREMIDADES:', style: 'fieldLabel' },
                                {
                                  text: notaEvolucion.exploracion_extremidades,
                                  style: 'fieldValue',
                                  margin: [0, 2, 0, 0],
                                },
                              ]
                            : []),
                        ],
                        margin: [10, 10],
                      },
                      {
                        stack: [
                          ...(notaEvolucion.exploracion_abdomen
                            ? [
                                { text: 'ABDOMEN:', style: 'fieldLabel' },
                                {
                                  text: notaEvolucion.exploracion_abdomen,
                                  style: 'fieldValue',
                                  margin: [0, 2, 0, 8],
                                },
                              ]
                            : []),
                          ...(notaEvolucion.exploracion_neurologico
                            ? [
                                { text: 'NEUROLÓGICO:', style: 'fieldLabel' },
                                {
                                  text: notaEvolucion.exploracion_neurologico,
                                  style: 'fieldValue',
                                  margin: [0, 2, 0, 0],
                                },
                              ]
                            : []),
                        ],
                        margin: [10, 10],
                      },
                    ],
                  ],
                },
                layout: this.getTableLayout(),
                margin: [0, 0, 0, 15],
              },
            ]
          : []),

        // ESTUDIOS Y EVOLUCIÓN
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '📊 ESTUDIOS Y EVOLUCIÓN',
                  style: 'sectionHeader',
                  fillColor: '#f3e5f5',
                  margin: [10, 8],
                },
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 10, 0, 10],
        },
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    {
                      text: 'ESTUDIOS DE LABORATORIO Y GABINETE:',
                      style: 'fieldLabel',
                    },
                    {
                      text:
                        notaEvolucion.estudios_laboratorio_gabinete ||
                        'No se realizaron estudios',
                      style: 'fieldValue',
                      margin: [0, 5, 0, 15],
                    },

                    {
                      text: 'EVOLUCIÓN Y ANÁLISIS DEL CUADRO CLÍNICO:',
                      style: 'fieldLabel',
                    },
                    {
                      text:
                        notaEvolucion.evolucion_analisis || 'No especificado',
                      style: 'fieldValue',
                      margin: [0, 5, 0, 15],
                    },

                    { text: 'DIAGNÓSTICOS ACTUALIZADOS:', style: 'fieldLabel' },
                    {
                      text: notaEvolucion.diagnosticos || 'No especificado',
                      style: 'fieldValue',
                      margin: [0, 5, 0, 0],
                    },
                  ],
                  margin: [10, 10],
                },
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15],
        },

        // PLAN TERAPÉUTICO Y PRONÓSTICO
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '📋 PLAN TERAPÉUTICO Y PRONÓSTICO',
                  style: 'sectionHeader',
                  fillColor: '#fff3e0',
                  margin: [10, 8],
                },
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 10, 0, 10],
        },
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    {
                      text: 'PLAN DE ESTUDIOS Y TRATAMIENTO:',
                      style: 'fieldLabel',
                    },
                    {
                      text:
                        notaEvolucion.plan_estudios_tratamiento ||
                        'No especificado',
                      style: 'fieldValue',
                      margin: [0, 5, 0, 15],
                    },

                    { text: 'PRONÓSTICO:', style: 'fieldLabel' },
                    {
                      text: notaEvolucion.pronostico || 'No especificado',
                      style: 'fieldValue',
                      margin: [0, 5, 0, 15],
                    },

                    ...(notaEvolucion.interconsultas &&
                    notaEvolucion.interconsultas !==
                      'No se solicitaron interconsultas en esta evolución'
                      ? [
                          { text: 'INTERCONSULTAS:', style: 'fieldLabel' },
                          {
                            text: notaEvolucion.interconsultas,
                            style: 'fieldValue',
                            margin: [0, 5, 0, 15],
                          },
                        ]
                      : []),

                    ...(notaEvolucion.indicaciones_medicas
                      ? [
                          {
                            text: 'INDICACIONES MÉDICAS:',
                            style: 'fieldLabel',
                          },
                          {
                            text: notaEvolucion.indicaciones_medicas,
                            style: 'fieldValue',
                            margin: [0, 5, 0, 15],
                          },
                        ]
                      : []),

                    ...(notaEvolucion.observaciones_adicionales
                      ? [
                          {
                            text: 'OBSERVACIONES ADICIONALES:',
                            style: 'fieldLabel',
                          },
                          {
                            text: notaEvolucion.observaciones_adicionales,
                            style: 'fieldValue',
                            margin: [0, 5, 0, 0],
                          },
                        ]
                      : []),
                  ],
                  margin: [10, 10],
                },
              ],
            ],
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 30],
        },
      ],

      footer: (currentPage: number, pageCount: number) => {
        return {
          table: {
            widths: ['33%', '34%', '33%'],
            body: [
              [
                {
                  stack: [
                    {
                      text: medicoCompleto.nombre_completo || '[Nombre]',
                      fontSize: 8,
                    },
                    {
                      text: `Cédula: ${medicoCompleto.cedula || 'N/A'}`,
                      fontSize: 7,
                    },
                    {
                      text: '_'.repeat(25),
                      fontSize: 8,
                      margin: [0, 10, 0, 0],
                    },
                    { text: 'FIRMA', fontSize: 7, alignment: 'center' },
                  ],
                },
                {
                  stack: [
                    {
                      text: `Página ${currentPage} de ${pageCount}`,
                      fontSize: 8,
                      alignment: 'center',
                    },
                    {
                      text: 'NOTA DE EVOLUCIÓN MÉDICA',
                      fontSize: 7,
                      alignment: 'center',
                      margin: [0, 5, 0, 0],
                    },
                    {
                      text: 'NOM-004-SSA3-2012',
                      fontSize: 6,
                      alignment: 'center',
                      color: '#666666',
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: 'FECHA Y HORA:',
                      fontSize: 8,
                      bold: true,
                      alignment: 'right',
                    },
                    {
                      text: fechaActual.toLocaleString('es-MX'),
                      fontSize: 8,
                      alignment: 'right',
                    },
                    {
                      text: `Exp: ${this.obtenerNumeroExpedientePreferido(
                        pacienteCompleto.expediente
                      )}`,
                      fontSize: 7,
                      alignment: 'right',
                      margin: [0, 5, 0, 0],
                    },
                  ],
                },
              ],
            ],
          },
          layout: 'noBorders',
        };
      },

      styles: {
        sectionHeader: {
          fontSize: 12,
          bold: true,
          color: '#374151',
        },
        fieldLabel: {
          fontSize: 9,
          bold: true,
          color: '#4b5563',
        },
        fieldValue: {
          fontSize: 9,
          color: '#111827',
        },
      },
    };
  }


  async generarPrescripcionMedicamentos(datos: any): Promise<any> {
    console.log('💊 Generando Prescripción de Medicamentos...');

    const { pacienteCompleto, medicoCompleto, prescripcion } = datos;
    const fechaActual = new Date();
    const medicamentos = prescripcion.medicamentos || [];

    return {
      pageSize: 'LETTER',
      pageMargins: [40, 80, 40, 60],

      header: (currentPage: number, pageCount: number) => {
        return {
          margin: [40, 20, 40, 20],
          table: {
            widths: ['30%', '40%', '30%'],
            body: [
              [
                {
                  stack: [
                    { text: 'HOSPITAL GENERAL', fontSize: 12, bold: true },
                    { text: 'SAN LUIS DE LA PAZ', fontSize: 10, bold: true },
                    { text: 'GUANAJUATO, MÉXICO', fontSize: 8 },
                    { text: 'RFC: HGS-123456-ABC', fontSize: 7, color: '#666666', margin: [0, 2, 0, 0] }
                  ]
                },
                {
                  stack: [
                    { text: '💊 PRESCRIPCIÓN MÉDICA', fontSize: 16, bold: true, alignment: 'center', color: '#7c3aed' },
                    { text: 'RECETA MÉDICA ELECTRÓNICA', fontSize: 10, alignment: 'center', italics: true },
                    { text: 'NOM-004-SSA3-2012', fontSize: 8, alignment: 'center', color: '#666666' }
                  ]
                },
                {
                  stack: [
                    { text: 'FECHA:', fontSize: 8, bold: true, alignment: 'right' },
                    { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 10, alignment: 'right' },
                    { text: `Folio: ${prescripcion.numero_receta || this.generarFolioReceta()}`, fontSize: 8, alignment: 'right', margin: [0, 2] },
                    { text: `Válida hasta: ${this.formatearFecha(prescripcion.valida_hasta)}`, fontSize: 7, alignment: 'right', color: '#dc2626' }
                  ]
                }
              ]
            ]
          },
          layout: 'noBorders'
        };
      },

      content: [
        // INFORMACIÓN DEL PACIENTE
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '👤 DATOS DEL PACIENTE',
                  style: 'sectionHeader',
                  fillColor: '#f3f4f6',
                  margin: [10, 8]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 10]
        },

        {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
                { text: 'Nombre:', style: 'fieldLabel' },
                { text: pacienteCompleto.nombre_completo || 'N/A', style: 'fieldValue' },
                { text: 'Expediente:', style: 'fieldLabel' },
                { text: pacienteCompleto.numero_expediente || 'N/A', style: 'fieldValue' }
              ],
              [
                { text: 'Edad:', style: 'fieldLabel' },
                { text: `${pacienteCompleto.edad || 'N/A'} años`, style: 'fieldValue' },
                { text: 'Sexo:', style: 'fieldLabel' },
                { text: pacienteCompleto.sexo || 'N/A', style: 'fieldValue' }
              ],
              [
                { text: 'Tipo de Sangre:', style: 'fieldLabel' },
                { text: pacienteCompleto.tipo_sangre || 'No especificado', style: 'fieldValue' },
                { text: 'Alergias:', style: 'fieldLabel' },
                { text: prescripcion.alergias_consideradas || 'No especificadas', style: 'fieldValue' }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // INFORMACIÓN MÉDICA
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '🏥 INFORMACIÓN MÉDICA',
                  style: 'sectionHeader',
                  fillColor: '#f3f4f6',
                  margin: [10, 8]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 10]
        },

        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  stack: [
                    { text: 'DIAGNÓSTICO:', style: 'fieldLabel' },
                    {
                      text: prescripcion.diagnostico_prescripcion || 'No especificado',
                      style: 'fieldValue',
                      margin: [0, 5, 0, 10]
                    }
                  ]
                },
                {
                  stack: [
                    { text: 'DURACIÓN TRATAMIENTO:', style: 'fieldLabel' },
                    {
                      text: prescripcion.duracion_tratamiento_dias ? `${prescripcion.duracion_tratamiento_dias} días` : 'Según indicación médica',
                      style: 'fieldValue',
                      margin: [0, 5, 0, 10]
                    }
                  ]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // MEDICAMENTOS PRESCRITOS
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '💊 MEDICAMENTOS PRESCRITOS',
                  style: 'sectionHeader',
                  fillColor: '#f3f4f6',
                  margin: [10, 8]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 10]
        },

        // TABLA DE MEDICAMENTOS
        ...(medicamentos.length > 0 ? [
          {
            table: {
              widths: ['5%', '25%', '15%', '15%', '10%', '10%', '20%'],
              headerRows: 1,
              body: [
                // ENCABEZADO
                [
                  { text: '#', style: 'tableHeader' },
                  { text: 'MEDICAMENTO', style: 'tableHeader' },
                  { text: 'DOSIS', style: 'tableHeader' },
                  { text: 'FRECUENCIA', style: 'tableHeader' },
                  { text: 'VÍA', style: 'tableHeader' },
                  { text: 'DURACIÓN', style: 'tableHeader' },
                  { text: 'INSTRUCCIONES', style: 'tableHeader' }
                ],
                // MEDICAMENTOS
                ...medicamentos.map((med: any, index: number) => [
                  { text: (index + 1).toString(), style: 'tableCell', alignment: 'center' },
                  {
                    stack: [
                      { text: med.medicamento_seleccionado?.nombre || 'Medicamento', style: 'medicamentoNombre' },
                      { text: med.medicamento_seleccionado?.presentacion ? `${med.medicamento_seleccionado.presentacion} ${med.medicamento_seleccionado.concentracion || ''}` : '', style: 'medicamentoPresentacion' },
                      ...(med.medicamento_controlado ? [{ text: '⚠️ CONTROLADO', style: 'medicamentoControlado' }] : [])
                    ]
                  },
                  { text: med.dosis || 'N/A', style: 'tableCell' },
                  { text: med.frecuencia || 'N/A', style: 'tableCell' },
                  { text: med.via_administracion || 'Oral', style: 'tableCell' },
                  { text: med.duracion_dias ? `${med.duracion_dias} días` : 'N/A', style: 'tableCell' },
                  {
                    stack: [
                      { text: med.instrucciones_toma || '', style: 'instruccionesTexto' },
                      { text: med.indicaciones_especiales || '', style: 'indicacionesTexto' }
                    ]
                  }
                ])
              ]
            },
            layout: this.getTableLayout(),
            margin: [0, 0, 0, 20]
          }
        ] : [
          {
            text: 'No se prescribieron medicamentos',
            style: 'noMedicamentos',
            alignment: 'center',
            margin: [0, 20, 0, 20]
          }
        ]),

        // INDICACIONES GENERALES
        ...(prescripcion.indicaciones_generales ? [
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    stack: [
                      { text: 'INDICACIONES GENERALES:', style: 'fieldLabel' },
                      {
                        text: prescripcion.indicaciones_generales,
                        style: 'fieldValue',
                        margin: [0, 5]
                      }
                    ],
                    margin: [10, 8]
                  }
                ]
              ]
            },
            layout: this.getTableLayout(),
            margin: [0, 0, 0, 15]
          }
        ] : []),

        // OBSERVACIONES
        ...(prescripcion.observaciones ? [
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    stack: [
                      { text: 'OBSERVACIONES:', style: 'fieldLabel' },
                      {
                        text: prescripcion.observaciones,
                        style: 'fieldValue',
                        margin: [0, 5]
                      }
                    ],
                    margin: [10, 8]
                  }
                ]
              ]
            },
            layout: this.getTableLayout(),
            margin: [0, 0, 0, 15]
          }
        ] : []),

        // INTERACCIONES Y SEGUIMIENTO
        ...(prescripcion.interacciones_importantes || prescripcion.requiere_seguimiento ? [
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    stack: [
                      { text: 'INTERACCIONES IMPORTANTES:', style: 'fieldLabel' },
                      {
                        text: prescripcion.interacciones_importantes || 'No se identificaron interacciones relevantes',
                        style: 'fieldValue',
                        margin: [0, 5]
                      }
                    ]
                  },
                  {
                    stack: [
                      { text: 'SEGUIMIENTO:', style: 'fieldLabel' },
                      {
                        text: prescripcion.requiere_seguimiento
                          ? `Próxima cita: ${this.formatearFecha(prescripcion.fecha_proxima_revision) || 'A programar'}`
                          : 'No requiere seguimiento especial',
                        style: 'fieldValue',
                        margin: [0, 5]
                      }
                    ]
                  }
                ]
              ]
            },
            layout: this.getTableLayout(),
            margin: [0, 0, 0, 20]
          }
        ] : []),

        // ESPACIADOR PARA FIRMA
        { text: '', pageBreak: 'before' },

        // SECCIÓN DE FIRMA
        {
          margin: [0, 40, 0, 0],
          table: {
            widths: ['60%', '40%'],
            body: [
              [
                {
                  stack: [
                    { text: '_'.repeat(50), alignment: 'center', margin: [0, 30, 0, 5] },
                    { text: 'MÉDICO PRESCRIPTOR', style: 'signatureLabel' },
                    { text: medicoCompleto.nombre_completo || 'N/A', style: 'signatureName' },
                    { text: `Cédula Profesional: ${medicoCompleto.numero_cedula || 'N/A'}`, style: 'signatureDetails' },
                    { text: `Especialidad: ${medicoCompleto.especialidad || 'Medicina General'}`, style: 'signatureDetails' }
                  ]
                },
                {
                  stack: [
                    { text: 'SELLO', alignment: 'center', margin: [0, 30, 0, 30], border: [1, 1, 1, 1], fontSize: 12 },
                    { text: 'Validez:', style: 'validezLabel' },
                    { text: `${this.formatearFecha(prescripcion.valida_hasta)}`, style: 'validezFecha' },
                    { text: 'Esta receta tiene validez de 30 días', style: 'validezNota' }
                  ]
                }
              ]
            ]
          },
          layout: 'noBorders'
        }
      ],

      footer: (currentPage: number, pageCount: number) => {
        return {
          margin: [40, 10],
          table: {
            widths: ['33%', '34%', '33%'],
            body: [
              [
                {
                  text: `Receta Médica - Hospital General San Luis de la Paz`,
                  fontSize: 8,
                  color: '#666666'
                },
                {
                  text: `Página ${currentPage} de ${pageCount}`,
                  fontSize: 8,
                  alignment: 'center',
                  color: '#666666'
                },
                {
                  text: fechaActual.toLocaleString('es-MX'),
                  fontSize: 8,
                  alignment: 'right',
                  color: '#666666'
                }
              ]
            ]
          },
          layout: 'noBorders'
        };
      },

      styles: {
        sectionHeader: {
          fontSize: 12,
          bold: true,
          color: '#374151'
        },
        fieldLabel: {
          fontSize: 9,
          bold: true,
          color: '#4b5563'
        },
        fieldValue: {
          fontSize: 9,
          color: '#111827'
        },
        tableHeader: {
          fontSize: 8,
          bold: true,
          color: '#ffffff',
          fillColor: '#7c3aed',
          margin: [3, 3, 3, 3]
        },
        tableCell: {
          fontSize: 8,
          margin: [3, 3, 3, 3]
        },
        medicamentoNombre: {
          fontSize: 9,
          bold: true,
          color: '#1f2937'
        },
        medicamentoPresentacion: {
          fontSize: 7,
          color: '#6b7280',
          italics: true
        },
        medicamentoControlado: {
          fontSize: 6,
          color: '#dc2626',
          bold: true
        },
        instruccionesTexto: {
          fontSize: 7,
          color: '#374151'
        },
        indicacionesTexto: {
          fontSize: 7,
          color: '#6b7280',
          italics: true
        },
        signatureLabel: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
          color: '#374151'
        },
        signatureName: {
          fontSize: 9,
          alignment: 'center',
          color: '#111827'
        },
        signatureDetails: {
          fontSize: 8,
          alignment: 'center',
          color: '#6b7280'
        },
        validezLabel: {
          fontSize: 8,
          bold: true,
          color: '#dc2626'
        },
        validezFecha: {
          fontSize: 8,
          color: '#dc2626'
        },
        validezNota: {
          fontSize: 7,
          color: '#6b7280',
          italics: true
        },
        noMedicamentos: {
          fontSize: 10,
          color: '#6b7280',
          italics: true
        }
      }
    };
  }


  async generarNotaUrgencias(datos: any): Promise<any> {
  console.log('🚨 Generando Nota de Urgencias...');

  const { pacienteCompleto, medicoCompleto, notaUrgencias } = datos;
  const fechaActual = new Date();

  return {
    pageSize: 'LETTER',
    pageMargins: [40, 80, 40, 60],

    header: (currentPage: number, pageCount: number) => {
      return {
        table: {
          widths: ['33%', '34%', '33%'],
          body: [
            [
              {
                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                width: 50,
                height: 50,
                alignment: 'left'
              },
              {
                stack: [
                  { text: 'HOSPITAL GENERAL', fontSize: 14, bold: true, alignment: 'center' },
                  { text: 'SAN LUIS DE LA PAZ, GTO.', fontSize: 10, alignment: 'center' },
                  { text: '🚨 NOTA DE URGENCIAS', fontSize: 12, bold: true, alignment: 'center', margin: [0, 5, 0, 0], color: '#dc2626' },
                  { text: 'NOM-004-SSA3-2012', fontSize: 8, alignment: 'center', color: '#666666' }
                ]
              },
              {
                stack: [
                  { text: `Expediente: ${this.obtenerNumeroExpedientePreferido(pacienteCompleto.expediente)}`, fontSize: 9, alignment: 'right' },
                  { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}`, fontSize: 9, alignment: 'right' },
                  { text: `Hora: ${notaUrgencias.hora_atencion || fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 9, alignment: 'right' }
                ]
              }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [40, 20, 40, 20]
      };
    },

    content: [
      // DATOS DEL PACIENTE Y URGENCIA
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: '👤 DATOS DEL PACIENTE - URGENCIAS',
                style: 'sectionHeader',
                fillColor: '#fee2e2',
                margin: [10, 8]
              }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: [
            [
              { text: 'Nombre:', style: 'fieldLabel' },
              { text: pacienteCompleto.nombre || 'No especificado', style: 'fieldValue' },
              { text: 'Edad:', style: 'fieldLabel' },
              { text: `${pacienteCompleto.edad || 'N/A'} años`, style: 'fieldValue' }
            ],
            [
              { text: 'Sexo:', style: 'fieldLabel' },
              { text: pacienteCompleto.sexo || 'No especificado', style: 'fieldValue' },
              { text: 'Cama:', style: 'fieldLabel' },
              { text: notaUrgencias.numero_cama || 'No asignada', style: 'fieldValue' }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 0, 0, 15]
      },

      // MOTIVO DE ATENCIÓN (NOM-004 OBLIGATORIO)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: '🚨 MOTIVO DE ATENCIÓN',
                style: 'sectionHeader',
                fillColor: '#fef3c7',
                margin: [10, 8]
              }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 10, 0, 10]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                stack: [
                  { text: 'MOTIVO DE LA CONSULTA:', style: 'fieldLabel' },
                  {
                    text: notaUrgencias.motivo_atencion || 'No especificado',
                    style: 'fieldValue',
                    margin: [0, 5, 0, 0]
                  }
                ],
                margin: [10, 10]
              }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 0, 0, 15]
      },

      // ESTADO MENTAL Y CONCIENCIA (NOM-004 OBLIGATORIO)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: '🧠 ESTADO MENTAL DEL PACIENTE',
                style: 'sectionHeader',
                fillColor: '#f3e8ff',
                margin: [10, 8]
              }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 10, 0, 10]
      },
      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              {
                stack: [
                  { text: 'ESTADO DE CONCIENCIA:', style: 'fieldLabel' },
                  {
                    text: notaUrgencias.estado_conciencia || 'No especificado',
                    style: 'fieldValue',
                    margin: [0, 5, 0, 10],
                    color: this.getColorEstadoConciencia(notaUrgencias.estado_conciencia)
                  }
                ]
              },
              {
                stack: [
                  { text: 'ESTADO MENTAL ADICIONAL:', style: 'fieldLabel' },
                  {
                    text: notaUrgencias.estado_mental || 'Sin observaciones adicionales',
                    style: 'fieldValue',
                    margin: [0, 5, 0, 10]
                  }
                ]
              }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 0, 0, 15]
      },

      // RESUMEN Y EXPLORACIÓN (NOM-004 OBLIGATORIO)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: '🩺 RESUMEN DEL INTERROGATORIO Y EXPLORACIÓN FÍSICA',
                style: 'sectionHeader',
                fillColor: '#e0f2fe',
                margin: [10, 8]
              }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 10, 0, 10]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                stack: [
                  { text: 'RESUMEN DEL INTERROGATORIO:', style: 'fieldLabel' },
                  {
                    text: notaUrgencias.resumen_interrogatorio || 'No especificado',
                    style: 'fieldValue',
                    margin: [0, 5, 0, 15]
                  },

                  { text: 'EXPLORACIÓN FÍSICA:', style: 'fieldLabel' },
                  {
                    text: notaUrgencias.exploracion_fisica || 'No especificado',
                    style: 'fieldValue',
                    margin: [0, 5, 0, 0]
                  }
                ],
                margin: [10, 10]
              }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 0, 0, 15]
      },

      // ESTUDIOS AUXILIARES
      ...(notaUrgencias.resultados_estudios ? [
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '🔬 RESULTADOS DE ESTUDIOS',
                  style: 'sectionHeader',
                  fillColor: '#f0fdf4',
                  margin: [10, 8]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 10, 0, 10]
},
       {
         table: {
           widths: ['100%'],
           body: [
             [
               {
                 stack: [
                   { text: 'RESULTADOS DE ESTUDIOS DE LABORATORIO Y GABINETE:', style: 'fieldLabel' },
                   {
                     text: notaUrgencias.resultados_estudios,
                     style: 'fieldValue',
                     margin: [0, 5, 0, 0]
                   }
                 ],
                 margin: [10, 10]
               }
             ]
           ]
         },
         layout: this.getTableLayout(),
         margin: [0, 0, 0, 15]
       }
     ] : []),

     // DIAGNÓSTICO Y PLAN DE TRATAMIENTO (NOM-004 OBLIGATORIO)
     {
       table: {
         widths: ['100%'],
         body: [
           [
             {
               text: '📋 DIAGNÓSTICO Y PLAN DE TRATAMIENTO',
               style: 'sectionHeader',
               fillColor: '#fef7ff',
               margin: [10, 8]
             }
           ]
         ]
       },
       layout: this.getTableLayout(),
       margin: [0, 10, 0, 10]
     },
     {
       table: {
         widths: ['100%'],
         body: [
           [
             {
               stack: [
                 { text: 'DIAGNÓSTICO(S) O PROBLEMAS CLÍNICOS:', style: 'fieldLabel' },
                 {
                   text: notaUrgencias.diagnostico || 'No especificado',
                   style: 'fieldValue',
                   margin: [0, 5, 0, 15],
                   bold: true,
                   color: '#1f2937'
                 },

                 { text: 'PLAN DE TRATAMIENTO:', style: 'fieldLabel' },
                 {
                   text: notaUrgencias.plan_tratamiento || 'No especificado',
                   style: 'fieldValue',
                   margin: [0, 5, 0, 0]
                 }
               ],
               margin: [10, 10]
             }
           ]
         ]
       },
       layout: this.getTableLayout(),
       margin: [0, 0, 0, 15]
     },

     // PROCEDIMIENTOS EN URGENCIAS (NOM-004 OBLIGATORIO)
     ...(notaUrgencias.procedimientos_urgencias ? [
       {
         table: {
           widths: ['100%'],
           body: [
             [
               {
                 text: '🛠️ PROCEDIMIENTOS EN EL ÁREA DE URGENCIAS',
                 style: 'sectionHeader',
                 fillColor: '#fef3c7',
                 margin: [10, 8]
               }
             ]
           ]
         },
         layout: this.getTableLayout(),
         margin: [0, 10, 0, 10]
       },
       {
         table: {
           widths: ['100%'],
           body: [
             [
               {
                 stack: [
                   { text: 'PROCEDIMIENTOS REALIZADOS:', style: 'fieldLabel' },
                   {
                     text: notaUrgencias.procedimientos_urgencias,
                     style: 'fieldValue',
                     margin: [0, 5, 0, 0]
                   }
                 ],
                 margin: [10, 10]
               }
             ]
           ]
         },
         layout: this.getTableLayout(),
         margin: [0, 0, 0, 15]
       }
     ] : []),

     // PRONÓSTICO Y DESTINO (NOM-004 OBLIGATORIO)
     {
       table: {
         widths: ['100%'],
         body: [
           [
             {
               text: '🎯 PRONÓSTICO Y DESTINO DEL PACIENTE',
               style: 'sectionHeader',
               fillColor: '#ecfdf5',
               margin: [10, 8]
             }
           ]
         ]
       },
       layout: this.getTableLayout(),
       margin: [0, 10, 0, 10]
     },
     {
       table: {
         widths: ['60%', '40%'],
         body: [
           [
             {
               stack: [
                 { text: 'PRONÓSTICO:', style: 'fieldLabel' },
                 {
                   text: notaUrgencias.pronostico || 'No especificado',
                   style: 'fieldValue',
                   margin: [0, 5, 0, 0]
                 }
               ]
             },
             {
               stack: [
                 { text: 'DESTINO DESPUÉS DE URGENCIAS:', style: 'fieldLabel' },
                 {
                   text: notaUrgencias.destino_paciente || 'A definir',
                   style: 'fieldValue',
                   margin: [0, 5, 0, 0],
                   bold: true,
                   color: this.getColorDestino(notaUrgencias.destino_paciente)
                 }
               ]
             }
           ]
         ]
       },
       layout: this.getTableLayout(),
       margin: [0, 0, 0, 30]
     },

     // INDICADOR DE NIVEL DE URGENCIA
     {
       table: {
         widths: ['100%'],
         body: [
           [
             {
               text: this.evaluarNivelUrgencia(notaUrgencias),
               style: 'urgencyLevel',
               fillColor: this.getColorNivelUrgencia(notaUrgencias),
               alignment: 'center',
               margin: [10, 8]
             }
           ]
         ]
       },
       layout: this.getTableLayout(),
       margin: [0, 10, 0, 0]
     }
   ],

   footer: (currentPage: number, pageCount: number) => {
     return {
       table: {
         widths: ['33%', '34%', '33%'],
         body: [
           [
             {
               stack: [
                 { text: medicoCompleto.nombre_completo || '[Nombre]', fontSize: 8 },
                 { text: `Cédula: ${medicoCompleto.cedula || 'N/A'}`, fontSize: 7 },
                 { text: '_'.repeat(25), fontSize: 8, margin: [0, 10, 0, 0] },
                 { text: 'MÉDICO URGENCIÓLOGO', fontSize: 7, alignment: 'center' }
               ]
             },
             {
               stack: [
                 { text: `Página ${currentPage} de ${pageCount}`, fontSize: 8, alignment: 'center' },
                 { text: 'NOTA DE URGENCIAS', fontSize: 7, alignment: 'center', margin: [0, 5, 0, 0] },
                 { text: 'NOM-004-SSA3-2012', fontSize: 6, alignment: 'center', color: '#666666' }
               ]
             },
             {
               stack: [
                 { text: 'ATENCIÓN DE URGENCIAS:', fontSize: 8, bold: true, alignment: 'right' },
                 { text: fechaActual.toLocaleString('es-MX'), fontSize: 8, alignment: 'right' },
                 { text: `Exp: ${this.obtenerNumeroExpedientePreferido(pacienteCompleto.expediente)}`, fontSize: 7, alignment: 'right', margin: [0, 5, 0, 0] }
               ]
             }
           ]
         ]
       },
       layout: 'noBorders'
     };
   },

   styles: {
     sectionHeader: {
       fontSize: 12,
       bold: true,
       color: '#374151'
     },
     fieldLabel: {
       fontSize: 9,
       bold: true,
       color: '#4b5563'
     },
     fieldValue: {
       fontSize: 9,
       color: '#111827'
     },
     urgencyLevel: {
       fontSize: 11,
       bold: true,
       color: '#ffffff'
     }
   }
 };
}

// MÉTODOS AUXILIARES PARA NOTA DE URGENCIAS
private getColorEstadoConciencia(estado: string): string {
 if (!estado) return '#111827';

 const estadoLower = estado.toLowerCase();
 if (estadoLower.includes('coma') || estadoLower.includes('inconsciente')) {
   return '#dc2626'; // Rojo - Crítico
 }
 if (estadoLower.includes('somnoliento') || estadoLower.includes('estupor')) {
   return '#f59e0b'; // Amarillo - Grave
 }
 if (estadoLower.includes('alerta') || estadoLower.includes('consciente')) {
   return '#059669'; // Verde - Estable
 }
 return '#6b7280'; // Gris - Sin clasificar
}

private getColorDestino(destino: string): string {
 if (!destino) return '#111827';

 const destinoLower = destino.toLowerCase();
 if (destinoLower.includes('defunción')) {
   return '#dc2626'; // Rojo
 }
 if (destinoLower.includes('hospitalización') || destinoLower.includes('observación')) {
   return '#f59e0b'; // Amarillo
 }
 if (destinoLower.includes('alta')) {
   return '#059669'; // Verde
 }
 if (destinoLower.includes('referencia')) {
   return '#7c3aed'; // Morado
 }
 return '#111827'; // Negro por defecto
}

private evaluarNivelUrgencia(notaUrgencias: any): string {
 const estado = notaUrgencias.estado_conciencia?.toLowerCase() || '';
 const motivo = notaUrgencias.motivo_atencion?.toLowerCase() || '';

 // Criterios de urgencia crítica
 if (estado.includes('coma') || estado.includes('inconsciente') ||
     motivo.includes('paro') || motivo.includes('shock') || motivo.includes('trauma')) {
   return '🔴 URGENCIA CRÍTICA - PRIORIDAD 1';
 }

 // Criterios de urgencia grave
 if (estado.includes('somnoliento') || estado.includes('confuso') ||
     motivo.includes('dolor intenso') || motivo.includes('dificultad respiratoria')) {
   return '🟡 URGENCIA GRAVE - PRIORIDAD 2';
 }

 // Criterios de urgencia menor
 if (estado.includes('alerta') || estado.includes('consciente')) {
   return '🟢 URGENCIA MENOR - PRIORIDAD 3';
 }

 return '⚪ NIVEL DE URGENCIA POR EVALUAR';
}

private getColorNivelUrgencia(notaUrgencias: any): string {
 const nivel = this.evaluarNivelUrgencia(notaUrgencias);

 if (nivel.includes('CRÍTICA')) {
   return '#dc2626'; // Rojo
 }
 if (nivel.includes('GRAVE')) {
   return '#f59e0b'; // Amarillo
 }
 if (nivel.includes('MENOR')) {
   return '#059669'; // Verde
 }
 return '#6b7280'; // Gris
}


async generarReferenciaContrarreferencia(datos: any): Promise<any> {
  console.log('🔄 Generando Referencia y Contrarreferencia...');

  const { pacienteCompleto, medicoCompleto, referencia } = datos;
  const fechaActual = new Date();
  const esContrarreferencia = referencia.tipo_referencia === 'contrarreferencia';

  return {
    pageSize: 'LETTER',
    pageMargins: [40, 80, 40, 60],

    header: (currentPage: number, pageCount: number) => {
      return {
        margin: [40, 20, 40, 20],
        table: {
          widths: ['30%', '40%', '30%'],
          body: [
            [
              {
                stack: [
                  { text: 'HOSPITAL GENERAL', fontSize: 12, bold: true },
                  { text: 'SAN LUIS DE LA PAZ', fontSize: 10, bold: true },
                  { text: 'GUANAJUATO, MÉXICO', fontSize: 8 }
                ]
              },
              {
                stack: [
                  { text: `🔄 ${esContrarreferencia ? 'CONTRARREFERENCIA' : 'REFERENCIA'}`, fontSize: 16, bold: true, alignment: 'center', color: '#059669' },
                  { text: 'SISTEMA DE REFERENCIA MÉDICA', fontSize: 10, alignment: 'center', italics: true },
                  { text: 'NOM-004-SSA3-2012', fontSize: 8, alignment: 'center', color: '#666666' }
                ]
              },
              {
                stack: [
                  { text: 'FOLIO:', fontSize: 8, bold: true, alignment: 'right' },
                  { text: referencia.folio_referencia || this.generarFolioReferencia(), fontSize: 10, alignment: 'right' },
                  { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}`, fontSize: 8, alignment: 'right', margin: [0, 2] },
                  { text: `Urgencia: ${this.formatearUrgenciaReferencia(referencia.urgencia_referencia)}`, fontSize: 8, alignment: 'right', color: referencia.urgencia_referencia === 'urgente' ? '#dc2626' : '#059669' }
                ]
              }
            ]
          ]
        },
        layout: 'noBorders'
      };
    },

    content: [
      // INFORMACIÓN DEL PACIENTE
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: '👤 DATOS DEL PACIENTE',
                style: 'sectionHeader',
                fillColor: '#f0fdf4',
                margin: [10, 8]
              }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 0, 0, 10]
      },

      {
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: [
            [
              { text: 'Nombre:', style: 'fieldLabel' },
              { text: pacienteCompleto.nombre_completo || 'N/A', style: 'fieldValue' },
              { text: 'Expediente:', style: 'fieldLabel' },
              { text: pacienteCompleto.numero_expediente || 'N/A', style: 'fieldValue' }
            ],
            [
              { text: 'Edad:', style: 'fieldLabel' },
              { text: `${pacienteCompleto.edad || 'N/A'} años`, style: 'fieldValue' },
              { text: 'Sexo:', style: 'fieldLabel' },
              { text: pacienteCompleto.sexo || 'N/A', style: 'fieldValue' }
            ],
            [
              { text: 'Tipo de Sangre:', style: 'fieldLabel' },
              { text: pacienteCompleto.tipo_sangre || 'No especificado', style: 'fieldValue' },
              { text: 'Teléfono:', style: 'fieldLabel' },
              { text: pacienteCompleto.telefono || 'No especificado', style: 'fieldValue' }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 0, 0, 15]
      },

      // INFORMACIÓN DE LA REFERENCIA
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: `🏥 INFORMACIÓN DE ${esContrarreferencia ? 'CONTRARREFERENCIA' : 'REFERENCIA'}`,
                style: 'sectionHeader',
                fillColor: '#f0fdf4',
                margin: [10, 8]
              }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 0, 0, 10]
      },

      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              {
                stack: [
                  { text: 'INSTITUCIÓN DESTINO:', style: 'fieldLabel' },
                  { text: referencia.institucion_destino || 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 10] },
                  { text: 'NIVEL DE ATENCIÓN:', style: 'fieldLabel' },
                  { text: this.formatearNivelAtencion(referencia.nivel_atencion_destino), style: 'fieldValue', margin: [0, 5, 0, 10] }
                ]
              },
              {
                stack: [
                  { text: 'MÉDICO DESTINO:', style: 'fieldLabel' },
                  { text: referencia.medico_destino || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 10] },
                  { text: 'ESPECIALIDAD:', style: 'fieldLabel' },
                  { text: referencia.especialidad_destino || 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 10] }
                ]
              }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 0, 0, 15]
      },

      // MOTIVO Y DIAGNÓSTICO
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                stack: [
                  { text: 'MOTIVO DE REFERENCIA:', style: 'fieldLabel' },
                  { text: referencia.motivo_referencia || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                  { text: 'DIAGNÓSTICO:', style: 'fieldLabel' },
                  { text: referencia.diagnostico_referencia || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                  { text: 'RESUMEN CLÍNICO:', style: 'fieldLabel' },
                  { text: referencia.resumen_clinico || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 0] }
                ],
                margin: [10, 10]
              }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 0, 0, 15]
      },

      // ESTADO ACTUAL DEL PACIENTE
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: '🩺 ESTADO ACTUAL DEL PACIENTE',
                style: 'sectionHeader',
                fillColor: '#fef3c7',
                margin: [10, 8]
              }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 0, 0, 10]
      },

      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                stack: [
                  { text: 'ESTADO DEL PACIENTE:', style: 'fieldLabel' },
                  { text: referencia.estado_paciente || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                  ...(referencia.estudios_realizados ? [
                    { text: 'ESTUDIOS REALIZADOS:', style: 'fieldLabel' },
                    { text: referencia.estudios_realizados, style: 'fieldValue', margin: [0, 5, 0, 15] }
                  ] : []),

                  ...(referencia.tratamiento_actual ? [
                    { text: 'TRATAMIENTO ACTUAL:', style: 'fieldLabel' },
                    { text: referencia.tratamiento_actual, style: 'fieldValue', margin: [0, 5, 0, 15] }
                  ] : []),

                  ...(referencia.medicamentos_actuales ? [
                    { text: 'MEDICAMENTOS ACTUALES:', style: 'fieldLabel' },
                    { text: referencia.medicamentos_actuales, style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ] : [])
                ],
                margin: [10, 10]
              }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 0, 0, 15]
      },

      // INFORMACIÓN DE TRASLADO
      ...(referencia.requiere_ambulancia || referencia.acompañante_autorizado ? [
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '🚑 INFORMACIÓN DE TRASLADO',
                  style: 'sectionHeader',
                  fillColor: '#fef2f2',
                  margin: [10, 8]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  stack: [
                    { text: 'REQUIERE AMBULANCIA:', style: 'fieldLabel' },
                    { text: referencia.requiere_ambulancia ? 'SÍ' : 'NO', style: 'fieldValue', color: referencia.requiere_ambulancia ? '#dc2626' : '#059669' },
                  ]
                },
                {
                  stack: [
                    { text: 'ACOMPAÑANTE AUTORIZADO:', style: 'fieldLabel' },
                    { text: referencia.acompañante_autorizado || 'No especificado', style: 'fieldValue' }
                  ]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        }
      ] : []),

      // SEGUIMIENTO Y CONTRARREFERENCIA
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: '📋 SEGUIMIENTO Y CONTRARREFERENCIA',
                style: 'sectionHeader',
                fillColor: '#f3e8ff',
                margin: [10, 8]
              }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 0, 0, 10]
      },

      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              {
                stack: [
                  { text: 'REQUIERE CONTRARREFERENCIA:', style: 'fieldLabel' },
                  { text: referencia.requiere_contrarreferencia ? 'SÍ' : 'NO', style: 'fieldValue' },
                  { text: 'TIEMPO ESPERADO DE RESPUESTA:', style: 'fieldLabel', margin: [0, 10, 0, 0] },
                  { text: this.formatearTiempoRespuesta(referencia.tiempo_esperado_respuesta), style: 'fieldValue' }
                ]
              },
              {
                stack: [
                  { text: 'FECHA PROGRAMADA:', style: 'fieldLabel' },
                  { text: this.formatearFecha(referencia.fecha_programada_cita) || 'A programar', style: 'fieldValue' },
                  { text: 'AUTORIZACIÓN:', style: 'fieldLabel', margin: [0, 10, 0, 0] },
                  { text: referencia.numero_autorizacion || 'No requerida', style: 'fieldValue' }
                ]
              }
            ]
          ]
        },
        layout: this.getTableLayout(),
        margin: [0, 0, 0, 15]
      },

      // OBSERVACIONES
      ...(referencia.observaciones ? [
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'OBSERVACIONES:', style: 'fieldLabel' },
                    { text: referencia.observaciones, style: 'fieldValue', margin: [0, 5] }
                  ],
                  margin: [10, 8]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 20]
        }
      ] : []),

      // ESPACIADOR PARA FIRMAS
      { text: '', pageBreak: 'before' },

      // SECCIÓN FIRMAS
      {
        margin: [0, 40, 0, 0],
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              {
                stack: [
                  { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
                  { text: 'MÉDICO REFERENTE', style: 'signatureLabel' },
                  { text: medicoCompleto.nombre_completo || 'N/A', style: 'signatureName' },
                  { text: `Cédula: ${medicoCompleto.numero_cedula || 'N/A'}`, style: 'signatureDetails' },
                  { text: `Servicio: ${medicoCompleto.departamento || 'N/A'}`, style: 'signatureDetails' }
                ]
              },
              {
                stack: [
                  { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
                  { text: 'RECIBIDO POR', style: 'signatureLabel' },
                  { text: referencia.institucion_destino || 'Institución Destino', style: 'signatureName' },
                  { text: 'Fecha: ________________', style: 'signatureDetails', margin: [0, 10, 0, 0] },
                  { text: 'Sello Institucional', style: 'signatureDetails' }
                ]
              }
            ]
          ]
        },
        layout: 'noBorders'
      }
    ],

    footer: (currentPage: number, pageCount: number) => {
      return {
        margin: [40, 10],
        table: {
          widths: ['33%', '34%', '33%'],
          body: [
            [
              {
                text: `${esContrarreferencia ? 'Contrarreferencia' : 'Referencia'} - Hospital General San Luis de la Paz`,
                fontSize: 8,
                color: '#666666'
              },
              {
                text: `Página ${currentPage} de ${pageCount}`,
                fontSize: 8,
                alignment: 'center',
                color: '#666666'
              },
              {
                text: fechaActual.toLocaleString('es-MX'),
                fontSize: 8,
                alignment: 'right',
                color: '#666666'
              }
            ]
          ]
        },
        layout: 'noBorders'
      };
    },

    styles: {
      sectionHeader: {
        fontSize: 12,
        bold: true,
        color: '#374151'
      },
      fieldLabel: {
        fontSize: 9,
        bold: true,
        color: '#4b5563'
      },
      fieldValue: {
        fontSize: 9,
        color: '#111827'
      },
      signatureLabel: {
        fontSize: 10,
        bold: true,
        alignment: 'center',
        color: '#374151'
      },
      signatureName: {
        fontSize: 9,
        alignment: 'center',
        color: '#111827'
      },
      signatureDetails: {
        fontSize: 8,
        alignment: 'center',
        color: '#6b7280'
      }
    }
  };
}

// MÉTODOS AUXILIARES PARA REFERENCIA
private formatearUrgenciaReferencia(urgencia: string): string {
  const urgencias: { [key: string]: string } = {
    urgente: 'URGENTE',
    programada: 'Programada'
  };
  return urgencias[urgencia] || urgencia;
}

private formatearNivelAtencion(nivel: string): string {
  const niveles: { [key: string]: string } = {
    primer_nivel: 'Primer Nivel (Atención Primaria)',
    segundo_nivel: 'Segundo Nivel (Especialidades)',
    tercer_nivel: 'Tercer Nivel (Alta Especialidad)'
  };
  return niveles[nivel] || nivel;
}

private formatearTiempoRespuesta(tiempo: string): string {
  const tiempos: { [key: string]: string } = {
    '7_dias': '7 días',
    '15_dias': '15 días',
    '30_dias': '30 días',
    '60_dias': '60 días'
  };
  return tiempos[tiempo] || tiempo;
}

private generarFolioReferencia(): string {
  const fecha = new Date();
  const timestamp = fecha.getTime().toString().slice(-6);
  return `REF-${fecha.getFullYear()}-${timestamp}`;
}


  // 📄 NOTA DE CONSENTIMIENTO INFORMADO PARA PROCEDIMIENTOS SEGÚN NOM-004-SSA3-2012
  async generarNotaConsentimientoProcedimientos(datos: any): Promise<any> {
    console.log(
      '📝 Generando Nota de Consentimiento Informado para Procedimientos según NOM-004...'
    );

    // ✅ CORRECCIÓN: Usar los datos ya preparados
    const medicoCompleto = datos.medicoCompleto;
    const pacienteCompleto = datos.pacienteCompleto;
    const consentimientoData = datos.consentimiento || {};
    const fechaActual = new Date();

    return {
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
                  text: this.obtenerNumeroExpedientePreferido(
                    pacienteCompleto.expediente
                  ),
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
          lineHeight: 1.1,
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
          lineHeight: 1.1,
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
          lineHeight: 1.1,
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
          lineHeight: 1.1,
          margin: [0, 0, 0, 15],
        },

        {
          text: 'Estoy enterado(a), de que no existe garantía o seguridad sobre resultados del procedimiento y de que existe la posibilidad de que no pueda curarse la enfermedad o padecimiento que presento.',
          fontSize: 11,
          lineHeight: 1.1,
          margin: [0, 0, 0, 15],
        },

        {
          text: 'Así también estoy enterado(a) de que nadie puede decir con seguridad cuáles serán las complicaciones que ocurran en mi caso, si es que las hay.',
          fontSize: 11,
          lineHeight: 1.1,
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
          lineHeight: 1.1,
          margin: [0, 0, 0, 15],
        },

        {
          text: 'Si tiene cualquier duda acerca de los riesgos o peligros de la cirugía o tratamiento propuesto, pregunte a su Cirujano, ahora. ¡Antes de firmar el documento! ¡No firme a menos de que entienda por completo este documento!',
          fontSize: 11,
          lineHeight: 1.1,
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
                      text: `Exp: ${this.obtenerNumeroExpedientePreferido(
                        pacienteCompleto.expediente
                      )}`,
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
  }





}
