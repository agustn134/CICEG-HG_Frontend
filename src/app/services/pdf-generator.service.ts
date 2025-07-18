// src/app/services/pdf-generator.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  private pdfMake: any;
  private isLoaded = false;

  constructor() {
    this.loadPdfMake();
  }

  private async loadPdfMake() {
    try {
      // Importar PDFMake y fuentes de forma corregida
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

      // Configuración correcta para evitar errores de fuentes
      this.pdfMake = (pdfMakeModule as any).default || pdfMakeModule;

      // Configurar fuentes virtuales correctamente
      if (pdfFontsModule && (pdfFontsModule as any).pdfMake) {
        this.pdfMake.vfs = (pdfFontsModule as any).pdfMake.vfs;
      } else {
        // Fuentes básicas como fallback
        this.pdfMake.vfs = {};
      }

      // Configurar fuentes por defecto
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
      // Continuar sin fuentes personalizadas
      this.isLoaded = true;
    }
  }

  private async ensurePdfMakeLoaded() {
    if (!this.isLoaded) {
      await this.loadPdfMake();
    }
  }

  // 🏥 Plantilla base simplificada sin fuentes problemáticas
  private getPlantillaBase() {
    return {
      pageSize: 'LETTER',
      pageMargins: [40, 80, 40, 60],

      header: (currentPage: number, pageCount: number) => {
        return {
          margin: [40, 20, 40, 20],
          table: {
            widths: ['20%', '60%', '20%'],
            body: [
              [
                {
                  text: '🏥',
                  fontSize: 24,
                  alignment: 'center'
                },
                {
                  text: [
                    { text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ\n', fontSize: 12, bold: true },
                    { text: 'Sistema de Expedientes Clínicos Electrónicos\n', fontSize: 8 },
                    { text: 'CICEG-HG', fontSize: 7, color: '#666666' }
                  ],
                  alignment: 'center'
                },
                {
                  text: [
                    { text: 'Fecha:\n', fontSize: 7 },
                    { text: new Date().toLocaleDateString('es-MX'), fontSize: 7, bold: true }
                  ],
                  alignment: 'right'
                }
              ]
            ]
          },
          layout: 'noBorders'
        };
      },

      footer: (currentPage: number, pageCount: number) => {
        return {
          margin: [40, 10, 40, 0],
          table: {
            widths: ['70%', '30%'],
            body: [
              [
                {
                  text: 'Hospital General San Luis de la Paz - CICEG-HG',
                  fontSize: 7,
                  color: '#666666'
                },
                {
                  text: `Página ${currentPage} de ${pageCount}`,
                  fontSize: 7,
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
        titulo: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 15]
        },
        subtitulo: {
          fontSize: 12,
          bold: true,
          margin: [0, 15, 0, 8]
        },
        normal: {
          fontSize: 9,
          lineHeight: 1.4
        },
        pequeño: {
          fontSize: 7,
          color: '#666666'
        }
      },

      defaultStyle: {
        fontSize: 9,
        lineHeight: 1.3
      }
    };
  }


  // 📄 Versión ULTRA SIMPLE
async generarSignosVitales(datos: any): Promise<void> {
  try {
    await this.ensurePdfMakeLoaded();

    const pacienteInfo = datos.paciente?.persona || datos.paciente || {};
    const expedienteInfo = datos.expediente || {};

    const documentDefinition = {
      content: [
        'HOSPITAL GENERAL SAN LUIS DE LA PAZ',
        'SIGNOS VITALES',
        '',
        `Paciente: ${pacienteInfo.nombre || 'N/A'} ${pacienteInfo.apellido_paterno || ''} ${pacienteInfo.apellido_materno || ''}`,
        `Expediente: ${expedienteInfo.numero_expediente || 'N/A'}`,
        `Fecha: ${new Date().toLocaleDateString('es-MX')}`,
        '',
        'VALORES REGISTRADOS:',
        'Temperatura: °C',
        'Presión Arterial:  mmHg',
        'Frecuencia Cardíaca: lpm',
        'Frecuencia Respiratoria:  rpm',
        'Saturación de Oxígeno: %',
        'Peso:  kg',
        'Talla: cm',
        'Glucosa: 85 mg/dL',
        '',
        'Observaciones: Paciente adulto joven en condiciones generales estables.',
        '',
        `Generado por CICEG-HG el ${new Date().toLocaleDateString('es-MX')} a las ${new Date().toLocaleTimeString('es-MX')}`
      ]
    };

    this.pdfMake.createPdf(documentDefinition).download('signos-vitales.pdf');
    console.log('✅ PDF ultra simple descargado');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

  // Función auxiliar para calcular edad
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

  // 📄 Generar PDF de Historia Clínica (placeholder mejorado)
  async generarHistoriaClinica(datos: any): Promise<void> {
    try {
      await this.ensurePdfMakeLoaded();

      const plantilla = this.getPlantillaBase();
      const documentDefinition = {
        ...plantilla,
        content: [
          {
            text: 'HISTORIA CLÍNICA',
            style: 'titulo',
            color: '#0066cc'
          },
          {
            text: 'Este documento se completará con los datos del formulario de Historia Clínica.',
            style: 'normal',
            margin: [0, 20, 0, 0]
          }
        ]
      };

      this.pdfMake.createPdf(documentDefinition).download('historia-clinica.pdf');
      console.log('✅ PDF de Historia Clínica descargado');
    } catch (error) {
      console.error('❌ Error al generar PDF de Historia Clínica:', error);
      throw error;
    }
  }

  // 📄 Generar PDF de Nota de Evolución (placeholder)
  async generarNotaEvolucion(datos: any): Promise<void> {
    try {
      await this.ensurePdfMakeLoaded();

      const plantilla = this.getPlantillaBase();
      const documentDefinition = {
        ...plantilla,
        content: [
          {
            text: 'NOTA DE EVOLUCIÓN',
            style: 'titulo',
            color: '#0066cc'
          },
          {
            text: 'Este documento se completará con los datos del formulario de Nota de Evolución.',
            style: 'normal',
            margin: [0, 20, 0, 0]
          }
        ]
      };

      this.pdfMake.createPdf(documentDefinition).download('nota-evolucion.pdf');
      console.log('✅ PDF de Nota de Evolución descargado');
    } catch (error) {
      console.error('❌ Error al generar PDF de Nota de Evolución:', error);
      throw error;
    }
  }

  // 📄 Generar PDF de Nota de Urgencias (placeholder)
  async generarNotaUrgencias(datos: any): Promise<void> {
    try {
      await this.ensurePdfMakeLoaded();

      const plantilla = this.getPlantillaBase();
      const documentDefinition = {
        ...plantilla,
        content: [
          {
            text: 'NOTA DE URGENCIAS',
            style: 'titulo',
            color: '#0066cc'
          },
          {
            text: 'Este documento se completará con los datos del formulario de Nota de Urgencias.',
            style: 'normal',
            margin: [0, 20, 0, 0]
          }
        ]
      };

      this.pdfMake.createPdf(documentDefinition).download('nota-urgencias.pdf');
      console.log('✅ PDF de Nota de Urgencias descargado');
    } catch (error) {
      console.error('❌ Error al generar PDF de Nota de Urgencias:', error);
      throw error;
    }
  }
}
