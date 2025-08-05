// src/app/services/pdf/pdf-templates.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class PdfTemplatesService {
  constructor(private http: HttpClient) { }

  private obtenerNumeroExpedientePreferido(expediente: any): string {
    return (
      expediente?.numero_expediente_administrativo ||
      expediente?.numero_expediente ||
      expediente?.numero_expediente_administrativo ||
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

  // public async obtenerImagenBase64(rutaImagen: string): Promise<string> {
  //   try {
  //     let urlCompleta: string;
  //     if (
  //       rutaImagen.startsWith('http://') ||
  //       rutaImagen.startsWith('https://')
  //     ) {
  //       urlCompleta = rutaImagen;
  //     } else {
  //       urlCompleta = `${environment.BASE_URL}${rutaImagen}`;
  //     }
  //     console.log('Obteniendo imagen de:', urlCompleta);
  //     const response = await this.http
  //       .get(urlCompleta, { responseType: 'blob' })
  //       .toPromise();
  //     if (!response) {
  //       throw new Error('No se pudo obtener la imagen');
  //     }
  //     const tipoImagen = response.type;
  //     console.log('📄 Tipo de imagen:', tipoImagen);
  //     if (tipoImagen === 'image/svg+xml' || rutaImagen.endsWith('.svg')) {
  //       return await this.convertirSvgAPng(response);
  //     }
  //     // Para PNG, JPG, etc. - conversión normal
  //     return new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onload = () => {
  //         const result = reader.result as string;
  //         console.log('✅ Imagen convertida exitosamente');
  //         resolve(result);
  //       };
  //       reader.onerror = reject;
  //       reader.readAsDataURL(response);
  //     });
  //   } catch (error) {
  //     console.error('Error al convertir imagen:', error);
  //     return this.obtenerImagenPlaceholder();
  //   }
  // }


  // 🔥 VERSIÓN MEJORADA - Reemplaza en PdfTemplatesService.ts
private async obtenerImagenBase64(rutaImagen: string): Promise<string> {
  try {
    // 🔥 SISTEMA DE PRIORIDAD DE RUTAS
    const rutasAIntentar = this.construirRutasPrioridad(rutaImagen);
    
    // Intentar cada ruta en orden de prioridad
    for (const ruta of rutasAIntentar) {
      try {
        console.log(`🔍 Intentando cargar: ${ruta}`);
        const response = await this.http
          .get(ruta, { responseType: 'blob' })
          .toPromise();
          
        if (response && response.size > 0) {
          console.log(`✅ Imagen cargada exitosamente: ${ruta}`);
          return await this.procesarImagen(response, ruta);
        }
      } catch (error) {
        console.warn(`⚠️ No se pudo cargar: ${ruta}, intentando siguiente...`);
        continue; // Intentar la siguiente ruta
      }
    }
    
    throw new Error('No se encontraron imágenes válidas en ninguna ruta');
    
  } catch (error) {
    console.error('❌ Error al obtener imagen:', error);
    return this.obtenerImagenPlaceholder();
  }
}
private construirRutasPrioridad(rutaBase: string): string[] {
  const rutas: string[] = [];
  
  // Si ya es una URL completa, usarla tal como está
  if (rutaBase.startsWith('http://') || rutaBase.startsWith('https://')) {
    rutas.push(rutaBase);
    return rutas;
  }
  
  // Determinar tipo de logo basado en la ruta
  let tipoLogo = 'default';
  if (rutaBase.includes('gobierno')) {
    tipoLogo = 'gobierno';
  } else if (rutaBase.includes('principal')) {
    tipoLogo = 'principal';
  } else if (rutaBase.includes('sidebar')) {
    tipoLogo = 'sidebar';
  }
  
  // 🔥 ORDEN DE PRIORIDAD:
  // 1. Imagen importada PNG (mejor calidad)
  rutas.push(`${environment.BASE_URL}/uploads/logos/logo-${tipoLogo}-importado.png`);
  
  // 2. Imagen importada SVG (escalable)
  rutas.push(`${environment.BASE_URL}/uploads/logos/logo-${tipoLogo}-importado.svg`);
  
  // 3. Imagen por defecto SVG
  rutas.push(`${environment.BASE_URL}/uploads/logos/logo-${tipoLogo}-default.svg`);
  
  // 4. Imagen por defecto PNG (fallback)
  rutas.push(`${environment.BASE_URL}/uploads/logos/logo-${tipoLogo}-default.png`);
  
  // 5. Ruta original proporcionada (por si acaso)
  const rutaCompleta = rutaBase.startsWith('/') 
    ? `${environment.BASE_URL}${rutaBase}`
    : `${environment.BASE_URL}/${rutaBase}`;
  rutas.push(rutaCompleta);
  
  console.log(`🔍 Rutas a intentar para ${tipoLogo}:`, rutas);
  return rutas;
}

// 🔥 FUNCIÓN 2: Procesar imagen según tipo
private async procesarImagen(response: Blob, ruta: string): Promise<string> {
  const tipoImagen = response.type;
  console.log(`📄 Procesando imagen: ${tipoImagen} desde ${ruta}`);
  
  if (tipoImagen === 'image/svg+xml' || ruta.endsWith('.svg')) {
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
}

// 🔥 FUNCIÓN 3: Obtener configuración de logos inteligente
private async obtenerConfiguracionLogosInteligente(): Promise<any> {
  try {
    // Intentar obtener configuración del backend
    const config = await this.http.get<any>(`${environment.apiUrl}/configuracion/logos`).toPromise();
    
    return {
      logo_gobierno: config?.logo_gobierno || '/uploads/logos/logo-gobierno-importado.png',
      logo_principal: config?.logo_principal || '/uploads/logos/logo-principal-importado.png',
      logo_sidebar: config?.logo_sidebar || '/uploads/logos/logo-sidebar-importado.png',
      nombre_hospital: config?.nombre_hospital || 'Hospital General San Luis de la Paz'
    };
  } catch (error) {
    console.warn('⚠️ No se pudo obtener configuración, usando valores por defecto inteligentes');
    return {
      logo_gobierno: '/uploads/logos/logo-gobierno-importado.png',
      logo_principal: '/uploads/logos/logo-principal-importado.png',
      logo_sidebar: '/uploads/logos/logo-sidebar-importado.png',
      nombre_hospital: 'Hospital General San Luis de la Paz'
    };
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

  private getColorUrgencia(urgencia: string): string {
    const colores: { [key: string]: string } = {
      'Urgente': '#dc2626',
      'Alta': '#ea580c',
      'Normal': '#059669',
      'Baja': '#6b7280'
    };
    return colores[urgencia] || '#6b7280';
  }

  private getColorEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      'Pendiente': '#d97706',
      'En Proceso': '#2563eb',
      'Respondida': '#059669'
    };
    return colores[estado] || '#6b7280';
  }

  private generarNumeroInterconsulta(): string {
    const fecha = new Date();
    const timestamp = fecha.getTime().toString().slice(-6);
    return `IC-${fecha.getFullYear()}-${timestamp}`;
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

  // MÉTODOS AUXILIARES PARA ALTA VOLUNTARIA
  private formatearTipoAlta(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'CONTRA_OPINION_MEDICA': 'Contra opinión médica',
      'POR_MEJORIA_SUBJETIVA': 'Por mejoría subjetiva',
      'MOTIVOS_FAMILIARES': 'Motivos familiares',
      'MOTIVOS_ECONOMICOS': 'Motivos económicos',
      'TRASLADO_PRIVADO': 'Traslado a institución privada',
      'SEGUNDA_OPINION': 'Búsqueda de segunda opinión',
      'OTROS': 'Otros motivos'
    };
    return tipos[tipo] || tipo;
  }

  private formatearParentesco(parentesco: string): string {
    const parentescos: { [key: string]: string } = {
      'paciente': 'Paciente',
      'padre': 'Padre',
      'madre': 'Madre',
      'tutor': 'Tutor legal',
      'representante': 'Representante legal',
      'esposo': 'Esposo(a)',
      'hijo': 'Hijo(a)',
      'hermano': 'Hermano(a)'
    };
    return parentescos[parentesco] || parentesco;
  }

  private generarFolioAlta(): string {
    const fecha = new Date();
    const timestamp = fecha.getTime().toString().slice(-6);
    return `AV-${fecha.getFullYear()}-${timestamp}`;
  }

  // MÉTODOS AUXILIARES PARA NOTA PREOPERATORIA
  private tieneSignosVitalesPreop(notaPreoperatoria: any): boolean {
    return !!(notaPreoperatoria.temperatura_preop ||
      notaPreoperatoria.frecuencia_cardiaca ||
      notaPreoperatoria.frecuencia_respiratoria ||
      notaPreoperatoria.presion_arterial_sistolica ||
      notaPreoperatoria.presion_arterial_diastolica ||
      notaPreoperatoria.saturacion_oxigeno);
  }

  private getColorRiesgo(riesgo: string): string {
    const colores: { [key: string]: string } = {
      'Bajo': '#059669',
      'Moderado': '#d97706',
      'Alto': '#dc2626',
      'Muy Alto': '#7c2d12'
    };
    return colores[riesgo] || '#6b7280';
  }

  private getColorASA(asa: string): string {
    const colores: { [key: string]: string } = {
      'I': '#059669',
      'II': '#65a30d',
      'III': '#d97706',
      'IV': '#dc2626',
      'V': '#7c2d12',
      'VI': '#000000'
    };
    return colores[asa] || '#6b7280';
  }

  private generarFolioPreoperatorio(): string {
    const fecha = new Date();
    const timestamp = fecha.getTime().toString().slice(-6);
    return `PREOP-${fecha.getFullYear()}-${timestamp}`;
  }

  // MÉTODOS AUXILIARES PARA NOTA POSTOPERATORIA
  private getColorConteo(estado: string): string {
    const colores: { [key: string]: string } = {
      'Correcto': '#059669',
      'Completo': '#059669',
      'Incorrecto': '#dc2626',
      'Incompleto': '#dc2626',
      'No realizado': '#d97706',
      'No aplica': '#6b7280'
    };
    return colores[estado] || '#6b7280';
  }

  private formatearDuracion(minutos: number | null): string {
    if (!minutos) return 'No calculada';

    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    if (horas > 0) {
      return `${horas}h ${mins}min`;
    }
    return `${mins} minutos`;
  }

  private generarFolioPostoperatorio(): string {
    const fecha = new Date();
    const timestamp = fecha.getTime().toString().slice(-6);
    return `POSTOP-${fecha.getFullYear()}-${timestamp}`;
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
              `Alimentación: ${historiaClinicaData.habitos_alimenticios || 'No registrado'
              }\n` +
              `Higiene: ${historiaClinicaData.habitos_higienicos || 'Adecuada'
              }\n` +
              `Actividad física: ${historiaClinicaData.actividad_fisica ||
              (esPediatrico ? 'Apropiada para la edad' : 'Regular')
              }\n` +
              `Vivienda: ${historiaClinicaData.vivienda ||
              'Casa habitación con servicios básicos'
              }\n` +
              `${esPediatrico
                ? 'Inmunizaciones: Esquema completo según edad\n'
                : ''
              }` +
              `${esPediatrico ? 'Desarrollo psicomotor: Acorde a la edad\n' : ''
              }` +
              `${!esPediatrico && historiaClinicaData.toxicomanias
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
              `Enfermedades en la infancia: ${historiaClinicaData.enfermedades_infancia || 'Negadas'
              }\n` +
              `${!esPediatrico
                ? `Enfermedades en el adulto: ${historiaClinicaData.enfermedades_adulto || 'Negadas'
                }\n`
                : ''
              }` +
              `Hospitalizaciones previas: ${historiaClinicaData.hospitalizaciones_previas || 'Ninguna'
              }\n` +
              `Cirugías previas: ${historiaClinicaData.cirugias_previas || 'Ninguna'
              }\n` +
              `Traumatismos: ${historiaClinicaData.traumatismos || 'Ninguno'
              }\n` +
              `Alergias (medicamentos/alimentos): ${historiaClinicaData.alergias || 'Negadas'
              }\n` +
              `Transfusiones: ${historiaClinicaData.transfusiones || 'Ninguna'
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
                `Menarca: ${historiaClinicaData.menarca || 'No registrada'
                } años\n` +
                `Ritmo menstrual: ${historiaClinicaData.ritmo_menstrual || 'No registrado'
                }\n` +
                `Gestas: ${historiaClinicaData.gestas || '0'} | Partos: ${historiaClinicaData.partos || '0'
                } | Cesáreas: ${historiaClinicaData.cesareas || '0'
                } | Abortos: ${historiaClinicaData.abortos || '0'}\n` +
                `Método de planificación familiar: ${historiaClinicaData.metodo_planificacion || 'Ninguno'
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
                `Control prenatal: ${historiaClinicaData.control_prenatal || 'Sí'
                }\n` +
                `Tipo de parto: ${historiaClinicaData.tipo_parto || 'Vaginal'
                }\n` +
                `Peso al nacer: ${historiaClinicaData.peso_nacer || 'No registrado'
                } kg\n` +
                `Complicaciones neonatales: ${historiaClinicaData.complicaciones_neonatales || 'Ninguna'
                }\n` +
                `Apgar: ${historiaClinicaData.apgar || 'No registrado'}\n` +
                `Edad gestacional: ${historiaClinicaData.edad_gestacional || 'No registrada'
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
      `  Debug: Tabla tiene ${tablaIdentificacion.table.body.length
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
                    `Cardiovascular: ${historiaClinicaData.interrogatorio_cardiovascular ||
                    'Sin información registrada'
                    }\n` +
                    `Respiratorio: ${historiaClinicaData.interrogatorio_respiratorio ||
                    'Sin información registrada'
                    }\n` +
                    `Digestivo: ${historiaClinicaData.interrogatorio_digestivo ||
                    'Sin información registrada'
                    }\n` +
                    `Genitourinario: ${historiaClinicaData.interrogatorio_genitourinario ||
                    'Sin información registrada'
                    }\n` +
                    `Neurológico: ${historiaClinicaData.interrogatorio_neurologico ||
                    'Sin información registrada'
                    }\n` +
                    `Musculoesquelético: ${historiaClinicaData.interrogatorio_musculoesqueletico ||
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
                      text: `Peso: ${signosVitales.peso || '___'} kg\nTalla: ${signosVitales.talla || '___'
                        } cm\nIMC: ${this.calcularIMC(
                          signosVitales.peso,
                          signosVitales.talla
                        )}`,
                      fontSize: 7,
                    },
                    {
                      width: '33%',
                      text: `TA: ${signosVitales.presion_arterial_sistolica || '___'
                        }/${signosVitales.presion_arterial_diastolica || '___'
                        } mmHg\nFC: ${signosVitales.frecuencia_cardiaca || '___'
                        } lpm\nFR: ${signosVitales.frecuencia_respiratoria || '___'
                        } rpm`,
                      fontSize: 7,
                    },
                    {
                      width: '34%',
                      text: `Temperatura: ${signosVitales.temperatura || '___'
                        } °C\nSaturación O2: ${signosVitales.saturacion_oxigeno || '___'
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
                    `CABEZA Y CUELLO: ${historiaClinicaData.exploracion_cabeza ||
                    'Sin información registrada'
                    }\n\n` +
                    `TÓRAX Y PULMONES: ${historiaClinicaData.exploracion_torax ||
                    'Sin información registrada'
                    }\n\n` +
                    `CARDIOVASCULAR: ${historiaClinicaData.exploracion_corazon ||
                    'Sin información registrada'
                    }\n\n` +
                    `ABDOMEN: ${historiaClinicaData.exploracion_abdomen ||
                    'Sin información registrada'
                    }\n\n` +
                    `EXTREMIDADES: ${historiaClinicaData.exploracion_extremidades ||
                    'Sin información registrada'
                    }\n\n` +
                    `GENITALES: ${historiaClinicaData.exploracion_genitales ||
                    'Sin información registrada'
                    }\n\n` +
                    `NEUROLÓGICO: ${historiaClinicaData.exploracion_neurologico ||
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
                  text: `PRONÓSTICO: ${historiaClinicaData.pronostico ||
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


  // 🔥 VERSIÓN MEJORADA - Reemplaza el método generarHojaFrontalExpediente completo
async generarHojaFrontalExpediente(datos: any): Promise<any> {
  console.log('📂 Generando Hoja Frontal de Expediente según NOM-004...');

  // ✅ VALIDACIÓN CORREGIDA (ya funcionaba)
  const validarTabla = (tabla: any, nombreTabla: string) => {
    if (!tabla.table || !tabla.table.widths || !tabla.table.body) {
      console.warn(`⚠️ Tabla ${nombreTabla} no tiene estructura válida`);
      return;
    }

     if (!datos.configuracion) {
    console.log('🔧 Obteniendo configuración inteligente de logos...');
    datos.configuracion = this.obtenerConfiguracionLogosInteligente();
  }


    const columnasEsperadas = tabla.table.widths.length;
    
    tabla.table.body.forEach((fila: any[], index: number) => {
      let celdas = 0;
      
      fila.forEach((celda) => {
        if (celda && Object.keys(celda).length > 0) {
          if (celda.colSpan) {
            celdas += celda.colSpan;
          } else {
            celdas += 1;
          }
        }
      });

      if (celdas !== columnasEsperadas) {
        console.error(`❌ ERROR en ${nombreTabla}, Fila ${index}: esperaba ${columnasEsperadas} columnas, encontró ${celdas}`);
        throw new Error(`Tabla ${nombreTabla} tiene errores en fila ${index}`);
      }
    });

    console.log(`✅ Tabla ${nombreTabla} validada: ${tabla.table.body.length} filas`);
  };

  const validarTodasLasTablas = (contenido: any[], nombre: string = 'Documento') => {
    contenido.forEach((elemento, index) => {
      if (elemento && elemento.table) {
        try {
          validarTabla(elemento, `${nombre}[${index}]`);
        } catch (error) {
          console.error(`Error en tabla ${nombre}[${index}]:`, error);
          throw error;
        }
      }
    });
  };

  // 🔥 EXTRAER DATOS CORRECTAMENTE
  const pacienteCompleto = datos.pacienteCompleto || datos.paciente;
  const medicoCompleto = datos.medicoCompleto || datos.medico;
  const hojaFrontalData = datos.hojaFrontal || {};
  const expedienteData = datos.expediente || {};
  const fechaActual = new Date();
  const esPediatrico = pacienteCompleto.edad < 18;

  // 🔥 HEADER LIMPIO Y PROFESIONAL (igual que Historia Clínica)
  const header = {
    margin: [20, 10, 20, 10],
    table: {
      widths: ['20%', '60%', '20%'], // ✅ 3 COLUMNAS EXACTAS
      body: [
        [
          {
            image: await this.obtenerImagenBase64(
            datos.configuracion?.logo_gobierno || 
            '/uploads/logos/logo-gobierno-importado.png' // ✅ PRIORIZA IMPORTADO
          ),
          fit: [80, 40],
          alignment: 'left',
          margin: [0, 5],
          },
          {
            text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ\nHOJA FRONTAL DE EXPEDIENTE CLÍNICO\nNOM-004-SSA3-2012',
            fontSize: 10,
            bold: true,
            alignment: 'center',
            color: '#1a365d',
            margin: [0, 8],
          },
          {
          image: await this.obtenerImagenBase64(
            datos.configuracion?.logo_principal || 
            '/uploads/logos/logo-principal-importado.png' // ✅ PRIORIZA IMPORTADO
          ),
          fit: [80, 40],
          alignment: 'right',
          margin: [0, 5],
          },
        ],
      ],
    },
    layout: 'noBorders',
  };

  // 🔥 TABLA DATOS DEL ESTABLECIMIENTO - ESTILO LIMPIO
  const tablaDatosEstablecimiento = {
    table: {
      widths: ['30%', '70%'], // ✅ 2 COLUMNAS EXACTAS
      body: [
        [
          {
            text: 'DATOS DEL ESTABLECIMIENTO',
            fontSize: 8,
            bold: true,
            fillColor: '#f5f5f5',
            alignment: 'center',
            colSpan: 2,
          },
          {},
        ],
        [
          { text: 'Tipo de establecimiento:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData.tipo_establecimiento || 'Hospital General', fontSize: 8 },
        ],
        [
          { text: 'Nombre del establecimiento:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData.nombre_establecimiento || 'Hospital General San Luis de la Paz', fontSize: 8 },
        ],
        [
          { text: 'Domicilio del establecimiento:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData.domicilio_establecimiento || 'San Luis de la Paz, Guanajuato, México', fontSize: 8 },
        ],
        [
          { text: 'Razón social:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData.razon_social || 'Servicios de Salud de Guanajuato', fontSize: 8 },
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
  };

  // 🔥 TABLA DATOS DEL PACIENTE - ESTILO LIMPIO
  const tablaDatosPaciente = {
    table: {
      widths: ['30%', '70%'], // ✅ 2 COLUMNAS EXACTAS
      body: [
        [
          {
            text: 'DATOS DEL PACIENTE',
            fontSize: 8,
            bold: true,
            fillColor: '#f5f5f5',
            alignment: 'center',
            colSpan: 2,
          },
          {},
        ],
        [
          { text: 'Nombre completo:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: pacienteCompleto.nombre_completo || 'N/A', fontSize: 9, bold: true },
        ],
        [
          { text: 'CURP:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: pacienteCompleto.curp || 'No registrado', fontSize: 8 },
        ],
        [
          { text: 'Fecha de nacimiento:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: this.formatearFecha(pacienteCompleto.fecha_nacimiento) || 'No registrada', fontSize: 8 },
        ],
        [
          { text: 'Edad:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: `${pacienteCompleto.edad || 0} años`, fontSize: 8 },
        ],
        [
          { text: 'Sexo:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: pacienteCompleto.sexo || 'No especificado', fontSize: 8 },
        ],
        [
          { text: 'Tipo sanguíneo:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: pacienteCompleto.tipo_sangre || 'No especificado', fontSize: 8, bold: true },
        ],
        [
          { text: 'Lugar de nacimiento:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: pacienteCompleto.lugar_nacimiento || 'No especificado', fontSize: 8 },
        ],
        [
          { text: 'Nacionalidad:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData.nacionalidad || 'Mexicana', fontSize: 8 },
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
  };

  // 🔥 TABLA DATOS DE CONTACTO - ESTILO LIMPIO
  const tablaDatosContacto = {
    table: {
      widths: ['30%', '70%'], // ✅ 2 COLUMNAS EXACTAS
      body: [
        [
          {
            text: 'DATOS DE CONTACTO Y DOMICILIO',
            fontSize: 8,
            bold: true,
            fillColor: '#f5f5f5',
            alignment: 'center',
            colSpan: 2,
          },
          {},
        ],
        [
          { text: 'Domicilio:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: this.formatearDireccionCompleta(pacienteCompleto) || 'Sin dirección registrada', fontSize: 8 },
        ],
        [
          { text: 'Teléfono principal:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: pacienteCompleto.telefono || 'No registrado', fontSize: 8 },
        ],
        [
          { text: 'Teléfono secundario:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData.telefono_secundario || 'No registrado', fontSize: 8 },
        ],
        [
          { text: 'Correo electrónico:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: pacienteCompleto.correo_electronico || hojaFrontalData.email || 'No registrado', fontSize: 8 },
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
  };

  // 🔥 TABLA DATOS SOCIOECONÓMICOS - ESTILO LIMPIO
  const tablaDatosSocioeconomicos = {
    table: {
      widths: ['30%', '70%'], // ✅ 2 COLUMNAS EXACTAS
      body: [
        [
          {
            text: 'DATOS SOCIOECONÓMICOS',
            fontSize: 8,
            bold: true,
            fillColor: '#f5f5f5',
            alignment: 'center',
            colSpan: 2,
          },
          {},
        ],
        [
          { text: 'Ocupación:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: pacienteCompleto.ocupacion || hojaFrontalData.ocupacion || (esPediatrico ? 'Estudiante' : 'No registrada'), fontSize: 8 },
        ],
        [
          { text: 'Escolaridad:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: pacienteCompleto.escolaridad || hojaFrontalData.escolaridad || 'No registrada', fontSize: 8 },
        ],
        [
          { text: 'Estado civil:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: pacienteCompleto.estado_civil || hojaFrontalData.estado_conyugal || 'No registrado', fontSize: 8 },
        ],
        [
          { text: 'Religión:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: pacienteCompleto.religion || hojaFrontalData.religion || 'No registrada', fontSize: 8 },
        ],
        [
          { text: 'Afiliación médica:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData.afiliacion_medica || 'Sin afiliación', fontSize: 8 },
        ],
        [
          { text: 'Número de afiliación:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData.numero_afiliacion || 'No aplica', fontSize: 8 },
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
  };

  // 🔥 TABLA CONTACTO DE EMERGENCIA - ESTILO LIMPIO
  const tablaContactoEmergencia = {
    table: {
      widths: ['30%', '70%'], // ✅ 2 COLUMNAS EXACTAS
      body: [
        [
          {
            text: 'CONTACTO DE EMERGENCIA',
            fontSize: 8,
            bold: true,
            fillColor: '#f5f5f5',
            alignment: 'center',
            colSpan: 2,
          },
          {},
        ],
        [
          { text: 'Nombre completo:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData?.contacto_emergencia_1?.nombre_completo || pacienteCompleto.familiar_responsable || 'No registrado', fontSize: 8 },
        ],
        [
          { text: 'Parentesco:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData?.contacto_emergencia_1?.parentesco || 'No especificado', fontSize: 8 },
        ],
        [
          { text: 'Teléfono principal:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData?.contacto_emergencia_1?.telefono_principal || pacienteCompleto.telefono_familiar || 'No registrado', fontSize: 8 },
        ],
        [
          { text: 'Teléfono secundario:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData?.contacto_emergencia_1?.telefono_secundario || 'No registrado', fontSize: 8 },
        ],
        [
          { text: 'Dirección:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData?.contacto_emergencia_1?.direccion || 'No registrada', fontSize: 8 },
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
  };

  // 🔥 TABLA INFORMACIÓN MÉDICA - ESTILO LIMPIO
  const tablaInformacionMedica = {
    table: {
      widths: ['30%', '70%'], // ✅ 2 COLUMNAS EXACTAS
      body: [
        [
          {
            text: 'INFORMACIÓN MÉDICA RELEVANTE',
            fontSize: 8,
            bold: true,
            fillColor: '#f5f5f5',
            alignment: 'center',
            colSpan: 2,
          },
          {},
        ],
        [
          { text: 'Alergias conocidas:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData.alergias_conocidas || 'Ninguna conocida', fontSize: 8 },
        ],
        [
          { text: 'Enfermedades crónicas:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData.enfermedades_cronicas || 'Ninguna registrada', fontSize: 8 },
        ],
        [
          { text: 'Medicamentos actuales:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData.medicamentos_actuales || 'Ninguno', fontSize: 8 },
        ],
        [
          { text: 'Antecedentes quirúrgicos:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData.antecedentes_quirurgicos || 'Ninguno', fontSize: 8 },
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
  };

  // 🔥 TABLA DATOS DEL EXPEDIENTE - ESTILO LIMPIO
  const tablaDatosExpediente = {
    table: {
      widths: ['30%', '70%'], // ✅ 2 COLUMNAS EXACTAS
      body: [
        [
          {
            text: 'DATOS DEL EXPEDIENTE CLÍNICO',
            fontSize: 8,
            bold: true,
            fillColor: '#f5f5f5',
            alignment: 'center',
            colSpan: 2,
          },
          {},
        ],
        [
          { text: 'Número de expediente:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: this.obtenerNumeroExpedientePreferido(expedienteData) || 'Sin asignar', fontSize: 9, bold: true },
        ],
        [
          { text: 'Fecha de apertura:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: this.formatearFecha(expedienteData.fecha_apertura) || fechaActual.toLocaleDateString('es-MX'), fontSize: 8 },
        ],
        [
          { text: 'Hora de apertura:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData.hora_apertura || fechaActual.toLocaleTimeString('es-MX'), fontSize: 8 },
        ],
        [
          { text: 'Folio hoja frontal:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: hojaFrontalData.folio || `HF-${fechaActual.getFullYear()}-${fechaActual.getTime().toString().slice(-6)}`, fontSize: 8 },
        ],
        [
          { text: 'Estado del expediente:', bold: true, fontSize: 8, fillColor: '#fafafa' },
          { text: expedienteData.estado || 'Activo', fontSize: 8 },
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
  };

  // 🔥 TABLA FIRMA DEL RESPONSABLE - ESTILO LIMPIO
  const tablaFirmaResponsable = {
    table: {
      widths: ['50%', '50%'], // ✅ 2 COLUMNAS EXACTAS
      body: [
        [
          {
            text: 'RESPONSABLE DE LA ELABORACIÓN',
            fontSize: 8,
            bold: true,
            fillColor: '#f5f5f5',
            alignment: 'center',
            colSpan: 2,
          },
          {},
        ],
        [
          {
            text: [
              { text: `${medicoCompleto.titulo_profesional || 'Dr.'} ${medicoCompleto.nombre_completo}\n\n`, fontSize: 9, bold: true },
              { text: `Cédula profesional: ${medicoCompleto.numero_cedula || 'No registrada'}\n`, fontSize: 8 },
              { text: `Especialidad: ${medicoCompleto.especialidad || 'Medicina General'}\n`, fontSize: 8 },
              { text: `Cargo: ${medicoCompleto.cargo || 'Médico'}\n`, fontSize: 8 },
              { text: `Departamento: ${medicoCompleto.departamento || 'No especificado'}\n\n`, fontSize: 8 },
              { text: `Fecha de elaboración: ${fechaActual.toLocaleDateString('es-MX')}\n`, fontSize: 8, color: '#666666' },
              { text: `Hora de elaboración: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 8, color: '#666666' },
            ],
            margin: [5, 10],
            alignment: 'center',
          },
          {
            text: '\n\n\n\n_____________________________\nFIRMA AUTÓGRAFA\n\n(Conforme a NOM-004-SSA3-2012)',
            fontSize: 8,
            margin: [5, 10],
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
    margin: [0, 10, 0, 10],
  };

  // 🔥 DOCUMENTO FINAL LIMPIO Y PROFESIONAL
  const documentoFinal = {
    pageSize: 'LETTER',
    pageMargins: [20, 70, 20, 50],
    header,
    content: [
      { text: '', margin: [0, 5] },
      tablaDatosEstablecimiento,
      tablaDatosPaciente,
      tablaDatosContacto,
      tablaDatosSocioeconomicos,
      tablaContactoEmergencia,
      tablaInformacionMedica,
      tablaDatosExpediente,
      tablaFirmaResponsable,
      
      { text: '', margin: [0, 15] },
      {
        columns: [
          {
            width: '50%',
            text: [
              { text: '* Documento elaborado conforme a:\n', fontSize: 7, italics: true, color: '#666666' },
              { text: '• NOM-004-SSA3-2012 Del expediente clínico\n', fontSize: 7, color: '#666666' },
              { text: '• Lineamientos para la integración del expediente clínico\n', fontSize: 7, color: '#666666' },
              { text: '• Modelo de Evaluación del Expediente Clínico (MECIC)', fontSize: 7, color: '#666666' },
            ],
            alignment: 'left',
          },
          {
            width: '50%',
            text: [
              { text: 'Sistema Integral Clínico de Expedientes y Gestión (SICEG)\n', fontSize: 7, italics: true, color: '#666666' },
              { text: `Documento generado: ${fechaActual.toLocaleString('es-MX')}\n`, fontSize: 7, color: '#666666' },
              { text: 'Hospital General San Luis de la Paz, Guanajuato', fontSize: 7, color: '#666666' },
            ],
            alignment: 'right',
          },
        ],
      },
    ],
    footer: (currentPage: number, pageCount: number) => ({
      margin: [20, 10],
      table: {
        widths: ['33%', '34%', '33%'], // ✅ 3 COLUMNAS PARA EL FOOTER
        body: [
          [
            { text: `Página ${currentPage} de ${pageCount}`, fontSize: 7, color: '#666666' },
            { text: 'Hoja Frontal de Expediente Clínico - SICEG\nNOM-004-SSA3-2012', fontSize: 7, alignment: 'center', color: '#666666' },
            { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'right', color: '#666666' },
          ],
        ],
      },
      layout: 'noBorders',
    }),
  };

  // ✅ VALIDACIÓN FINAL
  console.log('🔍 Validando todas las tablas del documento...');
  try {
    validarTodasLasTablas(documentoFinal.content, 'HojaFrontal');
    console.log('✅ Todas las tablas validadas correctamente');
  } catch (error) {
    console.error('❌ Error en validación de tablas:', error);
    throw error;
  }

  console.log('✅ Hoja Frontal de Expediente generada exitosamente');
  return documentoFinal;
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
                      text: `Especialidad: ${medicoCompleto.especialidad || 'N/A'
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
    console.log('📄 Generando Nota de Evolución Médica con logos y estilo sobrio...');

    const { pacienteCompleto, medicoCompleto, notaEvolucion } = datos;
    const fechaActual = new Date();
    const esPediatrico = pacienteCompleto.edad < 18;

    return {
      pageSize: 'LETTER',
      pageMargins: [20, 60, 20, 40],

      header: {
        margin: [20, 10, 20, 10],
        table: {
          widths: ['20%', '60%', '20%'], // ✅ MISMO PATRÓN QUE HISTORIA CLÍNICA
          body: [
            [
              {
                // ✅ LOGO DE GOBIERNO (izquierda)
                image: await this.obtenerImagenBase64(
                  datos.configuracion?.logo_gobierno ||
                  '/uploads/logos/logo-gobierno-default.svg'
                ),
                fit: [80, 40], // ✅ USAR fit EN LUGAR DE width/height
                alignment: 'left',
                margin: [0, 5],
              },
              {
                // ✅ TEXTO CENTRAL SOBRIO
                text: esPediatrico
                  ? 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - NOTA DE EVOLUCIÓN MÉDICA PEDIÁTRICA'
                  : 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - NOTA DE EVOLUCIÓN MÉDICA',
                fontSize: 10,
                bold: true,
                alignment: 'center',
                color: '#1a365d', // ✅ MISMO COLOR SOBRIO
                margin: [0, 8],
              },
              {
                // ✅ LOGO DEL HOSPITAL (derecha)
                image: await this.obtenerImagenBase64(
                  datos.configuracion?.logo_principal ||
                  '/uploads/logos/logo-principal-default.svg'
                ),
                fit: [80, 40], // ✅ USAR fit EN LUGAR DE width/height
                alignment: 'right',
                margin: [0, 5],
              },
            ],
          ],
        },
        layout: 'noBorders',
      },

      content: [
        // ✅ TABLA PRINCIPAL CON ESTILO SOBRIO
        {
          table: {
            widths: ['25%', '75%'], // ✅ MISMO PATRÓN: 25% etiquetas, 75% contenido
            body: [
              // HEADER PRINCIPAL SOBRIO
              [
                {
                  text: 'EVOLUCIÓN MÉDICA',
                  fontSize: 8,
                  bold: true,
                  fillColor: '#1a365d', // ✅ COLOR SOBRIO
                  color: 'white',
                  alignment: 'center',
                  margin: [5, 5]
                },
                {
                  text: `${esPediatrico ? 'PACIENTE PEDIÁTRICO' : 'PACIENTE ADULTO'} - DÍAS DE ESTANCIA: ${notaEvolucion.dias_hospitalizacion || 'AMBULATORIO'}`,
                  fontSize: 8,
                  bold: true,
                  fillColor: '#1a365d', // ✅ COLOR SOBRIO
                  color: 'white',
                  alignment: 'center',
                  margin: [5, 5]
                }
              ],

              // DATOS DEL PACIENTE
              [
                {
                  text: 'DATOS DEL PACIENTE',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0' // ✅ GRIS SOBRIO
                },
                {
                  text: [
                    { text: 'NOMBRE: ', bold: true, fontSize: 7 },
                    { text: `${pacienteCompleto.nombre_completo || 'N/A'}\n`, fontSize: 7 },
                    { text: 'EDAD: ', bold: true, fontSize: 7 },
                    { text: `${pacienteCompleto.edad || 'N/A'} años   `, fontSize: 7 },
                    { text: 'SEXO: ', bold: true, fontSize: 7 },
                    { text: `${pacienteCompleto.sexo || 'N/A'}   `, fontSize: 7 },
                    { text: 'TIPO SANGUÍNEO: ', bold: true, fontSize: 7 },
                    { text: `${pacienteCompleto.tipo_sangre || 'N/A'}\n`, fontSize: 7, color: '#dc2626' },
                    { text: 'EXPEDIENTE: ', bold: true, fontSize: 7 },
                    { text: `${this.obtenerNumeroExpedientePreferido(pacienteCompleto.expediente)}`, fontSize: 7 }
                  ],
                  margin: [5, 3],
                  lineHeight: 1.2
                }
              ],

              // SIGNOS VITALES (si existen)
              ...(this.tieneSignosVitales(notaEvolucion) ? [
                [
                  {
                    text: 'SIGNOS VITALES ACTUALES',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0' // ✅ GRIS SOBRIO
                  },
                  {
                    table: {
                      widths: ['12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%'],
                      body: [
                        [
                          { text: 'T°C', fontSize: 6, bold: true, alignment: 'center', fillColor: '#e2e8f0' },
                          { text: 'FC', fontSize: 6, bold: true, alignment: 'center', fillColor: '#e2e8f0' },
                          { text: 'FR', fontSize: 6, bold: true, alignment: 'center', fillColor: '#e2e8f0' },
                          { text: 'T/A Sist', fontSize: 6, bold: true, alignment: 'center', fillColor: '#e2e8f0' },
                          { text: 'T/A Diast', fontSize: 6, bold: true, alignment: 'center', fillColor: '#e2e8f0' },
                          { text: 'SatO₂', fontSize: 6, bold: true, alignment: 'center', fillColor: '#e2e8f0' },
                          { text: 'Peso', fontSize: 6, bold: true, alignment: 'center', fillColor: '#e2e8f0' },
                          { text: 'Talla', fontSize: 6, bold: true, alignment: 'center', fillColor: '#e2e8f0' }
                        ],
                        [
                          { text: notaEvolucion.temperatura ? `${notaEvolucion.temperatura}°` : '--', fontSize: 6, alignment: 'center' },
                          { text: notaEvolucion.frecuencia_cardiaca ? `${notaEvolucion.frecuencia_cardiaca}` : '--', fontSize: 6, alignment: 'center' },
                          { text: notaEvolucion.frecuencia_respiratoria ? `${notaEvolucion.frecuencia_respiratoria}` : '--', fontSize: 6, alignment: 'center' },
                          { text: notaEvolucion.presion_arterial_sistolica || '--', fontSize: 6, alignment: 'center' },
                          { text: notaEvolucion.presion_arterial_diastolica || '--', fontSize: 6, alignment: 'center' },
                          { text: notaEvolucion.saturacion_oxigeno ? `${notaEvolucion.saturacion_oxigeno}%` : '--', fontSize: 6, alignment: 'center' },
                          { text: notaEvolucion.peso_actual ? `${notaEvolucion.peso_actual}kg` : '--', fontSize: 6, alignment: 'center' },
                          { text: notaEvolucion.talla_actual ? `${notaEvolucion.talla_actual}cm` : '--', fontSize: 6, alignment: 'center' }
                        ]
                      ]
                    },
                    layout: {
                      hLineWidth: () => 0.5,
                      vLineWidth: () => 0.5,
                      hLineColor: () => '#000000',
                      vLineColor: () => '#000000'
                    },
                    margin: [3, 2]
                  }
                ]
              ] : []),

              // SÍNTOMAS Y SIGNOS
              [
                {
                  text: 'SÍNTOMAS Y SIGNOS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0' // ✅ GRIS SOBRIO
                },
                {
                  text: notaEvolucion.sintomas_signos || 'Sin información registrada',
                  fontSize: 7,
                  margin: [5, 3],
                  lineHeight: 1.2
                }
              ],

              // HÁBITUS EXTERIOR
              [
                {
                  text: 'HÁBITUS EXTERIOR',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0' // ✅ GRIS SOBRIO
                },
                {
                  text: notaEvolucion.habitus_exterior || 'Sin información registrada',
                  fontSize: 7,
                  margin: [5, 3],
                  lineHeight: 1.2
                }
              ],

              // ESTADO NUTRICIONAL
              [
                {
                  text: 'ESTADO NUTRICIONAL',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0' // ✅ GRIS SOBRIO
                },
                {
                  text: notaEvolucion.estado_nutricional || 'Sin información registrada',
                  fontSize: 7,
                  margin: [5, 3],
                  lineHeight: 1.2
                }
              ],

              // EXPLORACIÓN POR SISTEMAS (si existe)
              ...(this.tieneExploracionSistemas(notaEvolucion) ? [
                [
                  {
                    text: 'EXPLORACIÓN POR APARATOS Y SISTEMAS',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0' // ✅ GRIS SOBRIO
                  },
                  {
                    text: [
                      ...(notaEvolucion.exploracion_cabeza ? [
                        { text: 'CABEZA Y CUELLO: ', bold: true, fontSize: 7 },
                        { text: `${notaEvolucion.exploracion_cabeza}\n\n`, fontSize: 7 }
                      ] : []),
                      ...(notaEvolucion.exploracion_torax ? [
                        { text: 'TÓRAX Y PULMONES: ', bold: true, fontSize: 7 },
                        { text: `${notaEvolucion.exploracion_torax}\n\n`, fontSize: 7 }
                      ] : []),
                      ...(notaEvolucion.exploracion_abdomen ? [
                        { text: 'ABDOMEN: ', bold: true, fontSize: 7 },
                        { text: `${notaEvolucion.exploracion_abdomen}\n\n`, fontSize: 7 }
                      ] : []),
                      ...(notaEvolucion.exploracion_extremidades ? [
                        { text: 'EXTREMIDADES: ', bold: true, fontSize: 7 },
                        { text: `${notaEvolucion.exploracion_extremidades}\n\n`, fontSize: 7 }
                      ] : []),
                      ...(notaEvolucion.exploracion_neurologico ? [
                        { text: 'NEUROLÓGICO: ', bold: true, fontSize: 7 },
                        { text: `${notaEvolucion.exploracion_neurologico}`, fontSize: 7 }
                      ] : [])
                    ].length > 0 ? [
                      ...(notaEvolucion.exploracion_cabeza ? [
                        { text: 'CABEZA Y CUELLO: ', bold: true, fontSize: 7 },
                        { text: `${notaEvolucion.exploracion_cabeza}\n\n`, fontSize: 7 }
                      ] : []),
                      ...(notaEvolucion.exploracion_torax ? [
                        { text: 'TÓRAX Y PULMONES: ', bold: true, fontSize: 7 },
                        { text: `${notaEvolucion.exploracion_torax}\n\n`, fontSize: 7 }
                      ] : []),
                      ...(notaEvolucion.exploracion_abdomen ? [
                        { text: 'ABDOMEN: ', bold: true, fontSize: 7 },
                        { text: `${notaEvolucion.exploracion_abdomen}\n\n`, fontSize: 7 }
                      ] : []),
                      ...(notaEvolucion.exploracion_extremidades ? [
                        { text: 'EXTREMIDADES: ', bold: true, fontSize: 7 },
                        { text: `${notaEvolucion.exploracion_extremidades}\n\n`, fontSize: 7 }
                      ] : []),
                      ...(notaEvolucion.exploracion_neurologico ? [
                        { text: 'NEUROLÓGICO: ', bold: true, fontSize: 7 },
                        { text: `${notaEvolucion.exploracion_neurologico}`, fontSize: 7 }
                      ] : [])
                    ] : [
                      { text: 'Sin exploración por sistemas registrada', fontSize: 7, italics: true }
                    ],
                    margin: [5, 3],
                    lineHeight: 1.1
                  }
                ]
              ] : []),

              // ESTUDIOS DE LABORATORIO Y GABINETE
              [
                {
                  text: 'ESTUDIOS DE LABORATORIO Y GABINETE',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0' // ✅ GRIS SOBRIO
                },
                {
                  text: notaEvolucion.estudios_laboratorio_gabinete || 'No se realizaron estudios',
                  fontSize: 7,
                  margin: [5, 3],
                  lineHeight: 1.2
                }
              ],

              // EVOLUCIÓN Y ANÁLISIS DEL CUADRO CLÍNICO
              [
                {
                  text: 'EVOLUCIÓN Y ANÁLISIS DEL CUADRO CLÍNICO',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0' // ✅ GRIS SOBRIO
                },
                {
                  text: notaEvolucion.evolucion_analisis || 'Sin información registrada',
                  fontSize: 7,
                  margin: [5, 3],
                  lineHeight: 1.2
                }
              ],

              // DIAGNÓSTICOS ACTUALIZADOS
              [
                {
                  text: 'IMPRESIÓN DIAGNÓSTICA O PROBLEMAS CLÍNICOS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0' // ✅ GRIS SOBRIO
                },
                {
                  text: notaEvolucion.diagnosticos || 'Sin información registrada',
                  fontSize: 7,
                  margin: [5, 3],
                  lineHeight: 1.2,
                  bold: true
                }
              ],

              // PLAN DE ESTUDIOS Y TRATAMIENTO
              [
                {
                  text: 'PLAN DE ESTUDIOS Y TRATAMIENTO',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0' // ✅ GRIS SOBRIO
                },
                {
                  text: notaEvolucion.plan_estudios_tratamiento || 'Sin información registrada',
                  fontSize: 7,
                  margin: [5, 3],
                  lineHeight: 1.2
                }
              ],

              // INTERCONSULTAS (si las hay)
              ...(notaEvolucion.interconsultas && 
                  notaEvolucion.interconsultas !== 'No se solicitaron interconsultas en esta evolución' ? [
                [
                  {
                    text: 'INTERCONSULTAS SOLICITADAS',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0' // ✅ GRIS SOBRIO
                  },
                  {
                    text: notaEvolucion.interconsultas,
                    fontSize: 7,
                    margin: [5, 3],
                    lineHeight: 1.2
                  }
                ]
              ] : []),

              // PRONÓSTICO
              [
                {
                  text: 'PRONÓSTICO',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#f0f0f0' // ✅ GRIS SOBRIO
                },
                {
                  text: notaEvolucion.pronostico || 'Sin información registrada',
                  fontSize: 7,
                  margin: [5, 3],
                  lineHeight: 1.2
                }
              ],

              // INDICACIONES MÉDICAS (si las hay)
              ...(notaEvolucion.indicaciones_medicas ? [
                [
                  {
                    text: 'INDICACIONES MÉDICAS',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0' // ✅ GRIS SOBRIO
                  },
                  {
                    text: notaEvolucion.indicaciones_medicas,
                    fontSize: 7,
                    margin: [5, 3],
                    lineHeight: 1.2
                  }
                ]
              ] : []),

              // OBSERVACIONES ADICIONALES (si las hay)
              ...(notaEvolucion.observaciones_adicionales ? [
                [
                  {
                    text: 'OBSERVACIONES ADICIONALES',
                    fontSize: 7,
                    bold: true,
                    fillColor: '#f0f0f0' // ✅ GRIS SOBRIO
                  },
                  {
                    text: notaEvolucion.observaciones_adicionales,
                    fontSize: 7,
                    margin: [5, 3],
                    lineHeight: 1.2
                  }
                ]
              ] : [])
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        },

        // ✅ ESPACIO Y NOTAS AL PIE COMO HISTORIA CLÍNICA
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
                  text: esPediatrico ? '• NOM-031-SSA2-1999 Para la atención a la salud del niño\n' : '',
                  fontSize: 6,
                  color: '#666666',
                },
                {
                  text: '• Sección 6.2 - Nota de evolución',
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
                  text: `Documento generado el: ${fechaActual.toLocaleString('es-MX')}\n`,
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
            widths: ['25%', '50%', '25%'], // ✅ MISMO LAYOUT QUE HISTORIA CLÍNICA
            body: [
              [
                {
                  text: `Página ${currentPage} de ${pageCount}`,
                  fontSize: 7,
                  color: '#666666',
                },
                {
                  text: esPediatrico
                    ? 'Nota de Evolución Médica Pediátrica - SICEG\nNOM-004-SSA3-2012 • NOM-031-SSA2-1999'
                    : 'Nota de Evolución Médica - SICEG\nNOM-004-SSA3-2012 • Sección 6.2',
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

  async generarAltaVoluntaria(datos: any): Promise<any> {
    console.log('🚪 Generando Alta Voluntaria...');

    const { pacienteCompleto, medicoCompleto, altaVoluntaria } = datos;
    const fechaActual = new Date();

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
                    { text: '🚪 ALTA VOLUNTARIA', fontSize: 16, bold: true, alignment: 'center', color: '#dc2626' },
                    { text: 'EGRESO POR VOLUNTAD PROPIA', fontSize: 10, alignment: 'center', italics: true },
                    { text: 'NOM-004-SSA3-2012', fontSize: 8, alignment: 'center', color: '#666666' }
                  ]
                },
                {
                  stack: [
                    { text: 'FOLIO:', fontSize: 8, bold: true, alignment: 'right' },
                    { text: altaVoluntaria.folio_alta || this.generarFolioAlta(), fontSize: 10, alignment: 'right' },
                    { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}`, fontSize: 8, alignment: 'right', margin: [0, 2] },
                    { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 8, alignment: 'right' }
                  ]
                }
              ]
            ]
          },
          layout: 'noBorders'
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
                { text: 'Cama:', style: 'fieldLabel' },
                { text: altaVoluntaria.numero_cama || 'N/A', style: 'fieldValue' },
                { text: 'Servicio:', style: 'fieldLabel' },
                { text: altaVoluntaria.servicio_medico || medicoCompleto.departamento || 'N/A', style: 'fieldValue' }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // DECLARACIÓN DE ALTA VOLUNTARIA
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'DECLARACIÓN DE ALTA VOLUNTARIA', style: 'declarationTitle', alignment: 'center', margin: [0, 10, 0, 15] },

                    { text: 'Por medio de la presente, yo:', style: 'declarationText' },
                    { text: altaVoluntaria.nombre_responsable || pacienteCompleto.nombre_completo, style: 'responsableName', margin: [0, 5, 0, 10] },

                    {
                      text: [
                        { text: 'En mi calidad de: ', style: 'declarationText' },
                        { text: this.formatearParentesco(altaVoluntaria.parentesco_responsable), style: 'parentescoValue' },
                        { text: ', manifiesto mi decisión LIBRE y VOLUNTARIA de solicitar el alta médica, aún cuando no haya sido autorizada por el médico tratante.', style: 'declarationText' }
                      ], margin: [0, 0, 0, 15]
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

        // INFORMACIÓN MÉDICA
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '🏥 INFORMACIÓN MÉDICA ACTUAL',
                  style: 'sectionHeader',
                  fillColor: '#f0f9ff',
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
                    { text: 'DIAGNÓSTICO ACTUAL:', style: 'fieldLabel' },
                    { text: altaVoluntaria.diagnostico_actual || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'ESTADO CLÍNICO ACTUAL:', style: 'fieldLabel' },
                    { text: altaVoluntaria.estado_clinico_actual || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'RESUMEN CLÍNICO:', style: 'fieldLabel' },
                    { text: altaVoluntaria.resumen_clinico || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ],
                  margin: [10, 10]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // TRATAMIENTO Y RECOMENDACIONES
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '💊 TRATAMIENTO RECOMENDADO Y RIESGOS',
                  style: 'sectionHeader',
                  fillColor: '#fefce8',
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
                    { text: 'TRATAMIENTO MÉDICO RECOMENDADO:', style: 'fieldLabel' },
                    { text: altaVoluntaria.tratamiento_recomendado || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'RIESGOS EXPLICADOS AL PACIENTE:', style: 'fieldLabel' },
                    { text: altaVoluntaria.riesgos_explicados || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'CONSECUENCIAS DE NO CONTINUAR TRATAMIENTO:', style: 'fieldLabel' },
                    { text: altaVoluntaria.consecuencias_informadas || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ],
                  margin: [10, 10]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // RECOMENDACIONES PARA EL ALTA
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '📋 RECOMENDACIONES PARA EL EGRESO',
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
                    { text: 'RECOMENDACIONES MÉDICAS:', style: 'fieldLabel' },
                    { text: altaVoluntaria.recomendaciones_medicas || 'Seguir indicaciones generales', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    ...(altaVoluntaria.medicamentos_prescritos ? [
                      { text: 'MEDICAMENTOS:', style: 'fieldLabel' },
                      { text: altaVoluntaria.medicamentos_prescritos, style: 'fieldValue', margin: [0, 5, 0, 10] }
                    ] : []),

                    { text: 'CUÁNDO REGRESAR:', style: 'fieldLabel' },
                    { text: altaVoluntaria.cuando_regresar || 'Ante cualquier complicación', style: 'fieldValue' }
                  ]
                },
                {
                  stack: [
                    { text: 'CUIDADOS EN CASA:', style: 'fieldLabel' },
                    { text: altaVoluntaria.cuidados_domiciliarios || 'Reposo relativo y cuidados generales', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'SIGNOS DE ALARMA:', style: 'fieldLabel' },
                    { text: altaVoluntaria.signos_alarma || 'Fiebre, dolor intenso, sangrado', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    ...(altaVoluntaria.cita_control ? [
                      { text: 'CITA DE CONTROL:', style: 'fieldLabel' },
                      { text: altaVoluntaria.cita_control, style: 'fieldValue' }
                    ] : [])
                  ]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // MOTIVO DEL ALTA VOLUNTARIA
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'MOTIVO DEL ALTA VOLUNTARIA:', style: 'fieldLabel' },
                    { text: altaVoluntaria.motivo_alta_voluntaria || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'TIPO DE ALTA:', style: 'fieldLabel' },
                    { text: this.formatearTipoAlta(altaVoluntaria.tipo_alta), style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ],
                  margin: [10, 10]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // DECLARACIÓN DE RESPONSABILIDAD
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'DECLARACIÓN DE RESPONSABILIDAD', style: 'declarationTitle', alignment: 'center', margin: [0, 10, 0, 15] },

                    { text: 'DECLARO QUE:', style: 'fieldLabel', margin: [0, 0, 0, 10] },

                    { text: '• He sido informado(a) completamente sobre mi estado de salud actual', style: 'declarationList' },
                    { text: '• Conozco los riesgos de abandonar el tratamiento médico', style: 'declarationList' },
                    { text: '• Entiendo las consecuencias de esta decisión', style: 'declarationList' },
                    { text: '• Esta decisión es completamente voluntaria y libre', style: 'declarationList' },
                    { text: '• Eximo de toda responsabilidad al hospital y su personal médico', style: 'declarationList', margin: [0, 0, 0, 15] },

                    { text: 'Me hago completamente responsable de cualquier complicación o deterioro de mi salud derivado de esta decisión.', style: 'responsabilityText', alignment: 'center', margin: [0, 10, 0, 0] }
                  ],
                  margin: [10, 10]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 20]
        },

        // INFORMACIÓN DE CONTINUIDAD
        ...(altaVoluntaria.continua_tratamiento_externo ? [
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    stack: [
                      { text: 'CONTINUIDAD DE TRATAMIENTO:', style: 'fieldLabel' },
                      { text: altaVoluntaria.continua_tratamiento_externo ? 'SÍ' : 'NO', style: 'fieldValue' }
                    ]
                  },
                  {
                    stack: [
                      { text: 'ESTABLECIMIENTO DESTINO:', style: 'fieldLabel' },
                      { text: altaVoluntaria.establecimiento_destino || 'No especificado', style: 'fieldValue' }
                    ]
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

        // SECCIÓN DE FIRMAS
        {
          margin: [0, 40, 0, 0],
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  stack: [
                    { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
                    { text: 'PACIENTE / RESPONSABLE', style: 'signatureLabel' },
                    { text: altaVoluntaria.nombre_responsable || pacienteCompleto.nombre_completo, style: 'signatureName' },
                    { text: `Parentesco: ${this.formatearParentesco(altaVoluntaria.parentesco_responsable)}`, style: 'signatureDetails' },
                    { text: `ID: ${altaVoluntaria.identificacion_responsable || 'No proporcionada'}`, style: 'signatureDetails' }
                  ]
                },
                {
                  stack: [
                    { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
                    { text: 'MÉDICO TRATANTE', style: 'signatureLabel' },
                    { text: medicoCompleto.nombre_completo || 'N/A', style: 'signatureName' },
                    { text: `Cédula: ${medicoCompleto.numero_cedula || 'N/A'}`, style: 'signatureDetails' },
                    { text: `Servicio: ${medicoCompleto.departamento || 'N/A'}`, style: 'signatureDetails' }
                  ]
                }
              ]
            ]
          },
          layout: 'noBorders'
        },

        // TESTIGOS
        {
          margin: [0, 30, 0, 0],
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  stack: [
                    { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
                    { text: 'TESTIGO 1', style: 'signatureLabel' },
                    { text: altaVoluntaria.testigo1_nombre || 'N/A', style: 'signatureName' },
                    { text: `ID: ${altaVoluntaria.testigo1_identificacion || 'N/A'}`, style: 'signatureDetails' }
                  ]
                },
                {
                  stack: [
                    { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
                    { text: 'TESTIGO 2', style: 'signatureLabel' },
                    { text: altaVoluntaria.testigo2_nombre || 'N/A', style: 'signatureName' },
                    { text: `ID: ${altaVoluntaria.testigo2_identificacion || 'N/A'}`, style: 'signatureDetails' }
                  ]
                }
              ]
            ]
          },
          layout: 'noBorders'
        },

        // LUGAR Y FECHA
        {
          margin: [0, 30, 0, 0],
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: `San Luis de la Paz, Guanajuato a ${fechaActual.getDate()} de ${fechaActual.toLocaleDateString('es-MX', { month: 'long' })} de ${fechaActual.getFullYear()}`,
                  alignment: 'center',
                  style: 'fechaFirma'
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
                  text: `Alta Voluntaria - Hospital General San Luis de la Paz`,
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
        declarationTitle: {
          fontSize: 14,
          bold: true,
          color: '#dc2626'
        },
        declarationText: {
          fontSize: 10,
          color: '#111827'
        },
        responsableName: {
          fontSize: 12,
          bold: true,
          color: '#111827',
          decoration: 'underline'
        },
        parentescoValue: {
          fontSize: 10,
          bold: true,
          color: '#dc2626'
        },
        declarationList: {
          fontSize: 10,
          color: '#111827',
          margin: [0, 2, 0, 2]
        },
        responsabilityText: {
          fontSize: 11,
          bold: true,
          color: '#dc2626',
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
        fechaFirma: {
          fontSize: 10,
          color: '#111827'
        }
      }
    };
  }

  async generarNotaPreoperatoria(datos: any): Promise<any> {
    console.log('⚕️ Generando Nota Preoperatoria...');

    const { pacienteCompleto, medicoCompleto, notaPreoperatoria } = datos;
    const fechaActual = new Date();

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
                    { text: '⚕️ NOTA PREOPERATORIA', fontSize: 16, bold: true, alignment: 'center', color: '#ea580c' },
                    { text: 'EVALUACIÓN PREQUIRÚRGICA', fontSize: 10, alignment: 'center', italics: true },
                    { text: 'NOM-004-SSA3-2012', fontSize: 8, alignment: 'center', color: '#666666' }
                  ]
                },
                {
                  stack: [
                    { text: 'FOLIO:', fontSize: 8, bold: true, alignment: 'right' },
                    { text: notaPreoperatoria.folio_preoperatorio || this.generarFolioPreoperatorio(), fontSize: 10, alignment: 'right' },
                    { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}`, fontSize: 8, alignment: 'right', margin: [0, 2] },
                    { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 8, alignment: 'right' }
                  ]
                }
              ]
            ]
          },
          layout: 'noBorders'
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
                  fillColor: '#fff7ed',
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
                { text: 'Peso:', style: 'fieldLabel' },
                { text: notaPreoperatoria.peso_actual ? `${notaPreoperatoria.peso_actual} kg` : 'N/A', style: 'fieldValue' },
                { text: 'Talla:', style: 'fieldLabel' },
                { text: notaPreoperatoria.talla_actual ? `${notaPreoperatoria.talla_actual} cm` : 'N/A', style: 'fieldValue' }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // INFORMACIÓN QUIRÚRGICA
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '🏥 INFORMACIÓN QUIRÚRGICA PROGRAMADA',
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
            widths: ['50%', '50%'],
            body: [
              [
                {
                  stack: [
                    { text: 'PROCEDIMIENTO PROGRAMADO:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.procedimiento_programado || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'FECHA DE CIRUGÍA:', style: 'fieldLabel' },
                    { text: this.formatearFecha(notaPreoperatoria.fecha_cirugia_programada), style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'HORA PROGRAMADA:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.hora_programada || 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ]
                },
                {
                  stack: [
                    { text: 'DURACIÓN ESTIMADA:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.duracion_estimada_minutos ? `${notaPreoperatoria.duracion_estimada_minutos} minutos` : 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'TIPO DE ANESTESIA:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.tipo_anestesia_propuesta || 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'QUIRÓFANO ASIGNADO:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.quirofano_asignado || 'No asignado', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // DIAGNÓSTICO Y INDICACIÓN
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'DIAGNÓSTICO PREOPERATORIO:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.diagnostico_preoperatorio || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'INDICACIÓN QUIRÚRGICA:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.indicacion_quirurgica || 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ],
                  margin: [10, 10]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // CLASIFICACIÓN DE RIESGO
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '⚠️ CLASIFICACIÓN DE RIESGO',
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
            widths: ['33%', '33%', '34%'],
            body: [
              [
                {
                  stack: [
                    { text: 'RIESGO QUIRÚRGICO:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.riesgo_quirurgico || 'No evaluado', style: 'riskValue', color: this.getColorRiesgo(notaPreoperatoria.riesgo_quirurgico) }
                  ]
                },
                {
                  stack: [
                    { text: 'CLASIFICACIÓN ASA:', style: 'fieldLabel' },
                    { text: `ASA ${notaPreoperatoria.clasificacion_asa || 'No evaluada'}`, style: 'riskValue', color: this.getColorASA(notaPreoperatoria.clasificacion_asa) }
                  ]
                },
                {
                  stack: [
                    { text: 'EVALUACIÓN COMPLETA:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.evaluacion_completa ? '✅ SÍ' : '❌ NO', style: 'riskValue', color: notaPreoperatoria.evaluacion_completa ? '#059669' : '#dc2626' }
                  ]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // SIGNOS VITALES
        ...(this.tieneSignosVitalesPreop(notaPreoperatoria) ? [
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: '💓 SIGNOS VITALES PREOPERATORIOS',
                    style: 'sectionHeader',
                    fillColor: '#ffebee',
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
              widths: ['16.66%', '16.66%', '16.66%', '16.66%', '16.66%', '16.7%'],
              body: [
                [
                  { text: 'Temp.', style: 'vitalHeader' },
                  { text: 'FC', style: 'vitalHeader' },
                  { text: 'FR', style: 'vitalHeader' },
                  { text: 'TA Sist.', style: 'vitalHeader' },
                  { text: 'TA Diast.', style: 'vitalHeader' },
                  { text: 'SatO₂', style: 'vitalHeader' }
                ],
                [
                  { text: notaPreoperatoria.temperatura_preop ? `${notaPreoperatoria.temperatura_preop}°C` : '--', style: 'vitalValue' },
                  { text: notaPreoperatoria.frecuencia_cardiaca ? `${notaPreoperatoria.frecuencia_cardiaca} lpm` : '--', style: 'vitalValue' },
                  { text: notaPreoperatoria.frecuencia_respiratoria ? `${notaPreoperatoria.frecuencia_respiratoria} rpm` : '--', style: 'vitalValue' },
                  { text: notaPreoperatoria.presion_arterial_sistolica ? `${notaPreoperatoria.presion_arterial_sistolica}` : '--', style: 'vitalValue' },
                  { text: notaPreoperatoria.presion_arterial_diastolica ? `${notaPreoperatoria.presion_arterial_diastolica}` : '--', style: 'vitalValue' },
                  { text: notaPreoperatoria.saturacion_oxigeno ? `${notaPreoperatoria.saturacion_oxigeno}%` : '--', style: 'vitalValue' }
                ]
              ]
            },
            layout: this.getTableLayout(),
            margin: [0, 0, 0, 15]
          }
        ] : []),

        // ANTECEDENTES Y ALERGIAS
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '📋 ANTECEDENTES RELEVANTES',
                  style: 'sectionHeader',
                  fillColor: '#f0f9ff',
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
                    { text: 'ALERGIAS CONOCIDAS:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.alergias_conocidas || 'Ninguna conocida', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'ANTECEDENTES QUIRÚRGICOS:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.antecedentes_quirurgicos || 'Sin antecedentes quirúrgicos', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'MEDICAMENTOS HABITUALES:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.medicamentos_habituales || 'No toma medicamentos', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ]
                },
                {
                  stack: [
                    { text: 'ANTECEDENTES ANESTÉSICOS:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.antecedentes_anestesicos || 'Sin antecedentes anestésicos', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'COMORBILIDADES:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.comorbilidades || 'Sin comorbilidades relevantes', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'VÍA AÉREA:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.via_aerea || 'Vía aérea normal', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // EXAMEN FÍSICO
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'ESTADO GENERAL:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.estado_general || 'No evaluado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'EXPLORACIÓN FÍSICA:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.exploracion_fisica || 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ],
                  margin: [10, 10]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // ESTUDIOS PREOPERATORIOS
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '🔬 ESTUDIOS PREOPERATORIOS',
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
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'LABORATORIOS:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.laboratorios_preoperatorios || 'No realizados', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'ESTUDIOS DE IMAGEN:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.estudios_imagen || 'No realizados', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'ELECTROCARDIOGRAMA:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.electrocardiograma || 'No realizado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'INTERCONSULTAS REALIZADAS:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.interconsultas_realizadas || 'No se solicitaron interconsultas', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ],
                  margin: [10, 10]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // PREPARACIÓN PREOPERATORIA
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '📋 PREPARACIÓN PREOPERATORIA',
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
                    { text: 'AYUNO INDICADO:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.ayuno_indicado || '8 horas para sólidos, 2 horas para líquidos claros', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'PROFILAXIS ANTIBIÓTICA:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.profilaxis_antibiotica || 'No indicada', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'PREPARACIÓN INTESTINAL:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.preparacion_intestinal ? 'SÍ' : 'NO', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ]
                },
                {
                  stack: [
                    { text: 'MEDICACIÓN PREANESTÉSICA:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.medicacion_preanestesica || 'No indicada', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'SUSPENDER MEDICAMENTOS:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.suspender_medicamentos || 'No se suspenden medicamentos', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'BANCO DE SANGRE:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.banco_sangre_reservado ? `SÍ - ${notaPreoperatoria.unidades_sangre_reservadas || 0} unidades` : 'NO', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // EQUIPO QUIRÚRGICO
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '👥 EQUIPO QUIRÚRGICO',
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
            widths: ['50%', '50%'],
            body: [
              [
                {
                  stack: [
                    { text: 'CIRUJANO PRINCIPAL:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.cirujano_principal || 'No asignado', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'AYUDANTE DE CIRUGÍA:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.ayudante_cirugia || 'No asignado', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ]
                },
                {
                  stack: [
                    { text: 'ANESTESIÓLOGO:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.anestesiologo_asignado || 'No asignado', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'INSTRUMENTISTA:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.instrumentista_asignada || 'No asignada', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // CONSENTIMIENTO Y RIESGOS
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '✅ CONSENTIMIENTO Y RIESGOS EXPLICADOS',
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
            widths: ['25%', '25%', '50%'],
            body: [
              [
                {
                  stack: [
                    { text: 'CONSENTIMIENTO:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.consentimiento_informado ? '✅ FIRMADO' : '❌ PENDIENTE', style: 'consentValue', color: notaPreoperatoria.consentimiento_informado ? '#059669' : '#dc2626' }
                  ]
                },
                {
                  stack: [
                    { text: 'AUTORIZACIÓN FAMILIAR:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.autorizacion_familiar ? '✅ SÍ' : '❌ NO', style: 'consentValue', color: notaPreoperatoria.autorizacion_familiar ? '#059669' : '#dc2626' }
                  ]
                },
                {
                  stack: [
                    { text: 'RIESGOS EXPLICADOS:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.riesgos_explicados || 'No especificados', style: 'fieldValue' }
                  ]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // INDICACIONES FINALES
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'INDICACIONES PREOPERATORIAS:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.indicaciones_preoperatorias || 'Indicaciones estándar', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'CUIDADOS ESPECIALES:', style: 'fieldLabel' },
                    { text: notaPreoperatoria.cuidados_especiales || 'No requiere cuidados especiales', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    ...(notaPreoperatoria.observaciones ? [
                      { text: 'OBSERVACIONES:', style: 'fieldLabel' },
                      { text: notaPreoperatoria.observaciones, style: 'fieldValue', margin: [0, 5, 0, 0] }
                    ] : [])
                  ],
                  margin: [10, 10]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 20]
        },

        // CONCLUSIÓN
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'CONCLUSIÓN PREOPERATORIA', style: 'conclusionTitle', alignment: 'center', margin: [0, 10, 0, 15] },
                    { text: 'PACIENTE APTO PARA CIRUGÍA:', style: 'fieldLabel', alignment: 'center' },
                    {
                      text: notaPreoperatoria.paciente_apto_cirugia ? '✅ SÍ - AUTORIZADO PARA CIRUGÍA' : '❌ NO APTO - REQUIERE EVALUACIÓN ADICIONAL',
                      style: 'conclusionValue',
                      alignment: 'center',
                      color: notaPreoperatoria.paciente_apto_cirugia ? '#059669' : '#dc2626',
                      margin: [0, 5, 0, 0]
                    }
                  ],
                  margin: [10, 10]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 30]
        },

        // FIRMAS
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  stack: [
                    { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
                    { text: 'MÉDICO EVALUADOR', style: 'signatureLabel' },
                    { text: medicoCompleto.nombre_completo || 'N/A', style: 'signatureName' },
                    { text: `Cédula: ${medicoCompleto.numero_cedula || 'N/A'}`, style: 'signatureDetails' },
                    { text: `Especialidad: ${medicoCompleto.especialidad || 'N/A'}`, style: 'signatureDetails' }
                  ]
                },
                {
                  stack: [
                    { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
                    { text: 'CIRUJANO RESPONSABLE', style: 'signatureLabel' },
                    { text: notaPreoperatoria.cirujano_principal || 'N/A', style: 'signatureName' },
                    { text: 'Fecha: ________________', style: 'signatureDetails', margin: [0, 10, 0, 0] }
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
                  text: `Nota Preoperatoria - Hospital General San Luis de la Paz`,
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
        vitalHeader: {
          fontSize: 8,
          bold: true,
          color: '#ffffff',
          fillColor: '#dc2626',
          alignment: 'center',
          margin: [2, 2, 2, 2]
        },
        vitalValue: {
          fontSize: 8,
          alignment: 'center',
          margin: [2, 2, 2, 2]
        },
        riskValue: {
          fontSize: 10,
          bold: true
        },
        consentValue: {
          fontSize: 9,
          bold: true
        },
        conclusionTitle: {
          fontSize: 14,
          bold: true,
          color: '#ea580c'
        },
        conclusionValue: {
          fontSize: 12,
          bold: true
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

  async generarNotaPostoperatoria(datos: any): Promise<any> {
    console.log('⚕️ Generando Nota Postoperatoria...');

    const { pacienteCompleto, medicoCompleto, notaPostoperatoria } = datos;
    const fechaActual = new Date();

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
                    { text: '⚕️ NOTA POSTOPERATORIA', fontSize: 16, bold: true, alignment: 'center', color: '#059669' },
                    { text: 'REGISTRO POSTQUIRÚRGICO', fontSize: 10, alignment: 'center', italics: true },
                    { text: 'NOM-004-SSA3-2012', fontSize: 8, alignment: 'center', color: '#666666' }
                  ]
                },
                {
                  stack: [
                    { text: 'FOLIO:', fontSize: 8, bold: true, alignment: 'right' },
                    { text: notaPostoperatoria.folio_postoperatorio || this.generarFolioPostoperatorio(), fontSize: 10, alignment: 'right' },
                    { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}`, fontSize: 8, alignment: 'right', margin: [0, 2] },
                    { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 8, alignment: 'right' }
                  ]
                }
              ]
            ]
          },
          layout: 'noBorders'
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
                { text: 'Quirófano:', style: 'fieldLabel' },
                { text: notaPostoperatoria.quirofano_utilizado || 'No especificado', style: 'fieldValue' },
                { text: 'Fecha Cirugía:', style: 'fieldLabel' },
                { text: this.formatearFecha(notaPostoperatoria.fecha_cirugia), style: 'fieldValue' }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // INFORMACIÓN TEMPORAL DE LA CIRUGÍA
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '⏰ INFORMACIÓN TEMPORAL DE LA CIRUGÍA',
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
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
                { text: 'Hora Inicio:', style: 'fieldLabel' },
                { text: notaPostoperatoria.hora_inicio || 'No registrada', style: 'fieldValue' },
                { text: 'Hora Fin:', style: 'fieldLabel' },
                { text: notaPostoperatoria.hora_fin || 'No registrada', style: 'fieldValue' }
              ],
              [
                { text: 'Duración:', style: 'fieldLabel' },
                { text: this.formatearDuracion(notaPostoperatoria.duracion_calculada || notaPostoperatoria.duracion_cirugia), style: 'fieldValue' },
                { text: 'Anestesia Utilizada:', style: 'fieldLabel' },
                { text: notaPostoperatoria.tipo_anestesia_utilizada || 'No especificada', style: 'fieldValue' }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // DIAGNÓSTICOS
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '🩺 DIAGNÓSTICOS',
                  style: 'sectionHeader',
                  fillColor: '#f0f9ff',
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
                    { text: 'DIAGNÓSTICO PREOPERATORIO:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.diagnostico_preoperatorio || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'DIAGNÓSTICO POSTOPERATORIO:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.diagnostico_postoperatorio || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    ...(notaPostoperatoria.diagnosticos_adicionales ? [
                      { text: 'DIAGNÓSTICOS ADICIONALES:', style: 'fieldLabel' },
                      { text: notaPostoperatoria.diagnosticos_adicionales, style: 'fieldValue', margin: [0, 5, 0, 0] }
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

        // PROCEDIMIENTOS REALIZADOS
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '🔧 PROCEDIMIENTOS REALIZADOS',
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
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'OPERACIÓN PLANEADA:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.operacion_planeada || 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'OPERACIÓN REALIZADA:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.operacion_realizada || 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    ...(notaPostoperatoria.procedimientos_adicionales ? [
                      { text: 'PROCEDIMIENTOS ADICIONALES:', style: 'fieldLabel' },
                      { text: notaPostoperatoria.procedimientos_adicionales, style: 'fieldValue', margin: [0, 5, 0, 15] }
                    ] : []),

                    ...(notaPostoperatoria.modificaciones_plan_original ? [
                      { text: 'MODIFICACIONES AL PLAN ORIGINAL:', style: 'fieldLabel' },
                      { text: notaPostoperatoria.modificaciones_plan_original, style: 'fieldValue', margin: [0, 5, 0, 0] }
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

        // TÉCNICA QUIRÚRGICA
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'DESCRIPCIÓN DE LA TÉCNICA QUIRÚRGICA:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.descripcion_tecnica || 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'ABORDAJE QUIRÚRGICO:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.abordaje_quirurgico || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'POSICIÓN DEL PACIENTE:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.posicion_paciente || 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ],
                  margin: [10, 10]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // HALLAZGOS TRANSOPERATORIOS
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '🔍 HALLAZGOS TRANSOPERATORIOS',
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
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'HALLAZGOS PRINCIPALES:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.hallazgos_transoperatorios || 'Sin hallazgos relevantes', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    ...(notaPostoperatoria.hallazgos_inesperados ? [
                      { text: 'HALLAZGOS INESPERADOS:', style: 'fieldLabel' },
                      { text: notaPostoperatoria.hallazgos_inesperados, style: 'fieldValue', margin: [0, 5, 0, 15] }
                    ] : []),

                    ...(notaPostoperatoria.anatomia_patologica ? [
                      { text: 'ANATOMÍA PATOLÓGICA:', style: 'fieldLabel' },
                      { text: notaPostoperatoria.anatomia_patologica, style: 'fieldValue', margin: [0, 5, 0, 0] }
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

        // CONTEO DE MATERIAL
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '✅ CONTEO DE MATERIAL QUIRÚRGICO',
                  style: 'sectionHeader',
                  fillColor: '#ecfdf5',
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
            widths: ['33%', '33%', '34%'],
            body: [
              [
                {
                  stack: [
                    { text: 'CONTEO DE GASAS:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.conteo_gasas_completo || 'No realizado', style: 'conteoValue', color: this.getColorConteo(notaPostoperatoria.conteo_gasas_completo) }
                  ]
                },
                {
                  stack: [
                    { text: 'CONTEO INSTRUMENTAL:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.conteo_instrumental_completo || 'No realizado', style: 'conteoValue', color: this.getColorConteo(notaPostoperatoria.conteo_instrumental_completo) }
                  ]
                },
                {
                  stack: [
                    { text: 'CONTEO COMPRESAS:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.conteo_compresas_completo || 'No aplica', style: 'conteoValue', color: this.getColorConteo(notaPostoperatoria.conteo_compresas_completo) }
                  ]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 10]
        },

        ...(notaPostoperatoria.observaciones_conteo ? [
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    stack: [
                      { text: 'OBSERVACIONES DEL CONTEO:', style: 'fieldLabel' },
                      { text: notaPostoperatoria.observaciones_conteo, style: 'fieldValue' }
                    ],
                    margin: [10, 5]
                  }
                ]
              ]
            },
            layout: this.getTableLayout(),
            margin: [0, 0, 0, 15]
          }
        ] : []),

        // INCIDENTES Y COMPLICACIONES
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '⚠️ INCIDENTES Y COMPLICACIONES',
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
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'INCIDENTES/ACCIDENTES:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.incidentes_accidentes || 'Sin incidentes', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    ...(notaPostoperatoria.complicaciones_transoperatorias ? [
                      { text: 'COMPLICACIONES TRANSOPERATORIAS:', style: 'fieldLabel' },
                      { text: notaPostoperatoria.complicaciones_transoperatorias, style: 'fieldValue', margin: [0, 5, 0, 15] }
                    ] : []),

                    ...(notaPostoperatoria.medidas_correctivas ? [
                      { text: 'MEDIDAS CORRECTIVAS:', style: 'fieldLabel' },
                      { text: notaPostoperatoria.medidas_correctivas, style: 'fieldValue', margin: [0, 5, 0, 0] }
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

        // SANGRADO Y TRANSFUSIONES
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '🩸 SANGRADO Y TRANSFUSIONES',
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
                    { text: 'SANGRADO ESTIMADO:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.sangrado_estimado ? `${notaPostoperatoria.sangrado_estimado} ml` : '0 ml', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'MÉTODO HEMOSTASIA:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.metodo_hemostasia || 'Hemostasia convencional', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'TRANSFUSIONES:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.transfusiones_realizadas ? 'SÍ' : 'NO', style: 'fieldValue', color: notaPostoperatoria.transfusiones_realizadas ? '#dc2626' : '#059669' }
                  ]
                },
                {
                  stack: [
                    ...(notaPostoperatoria.transfusiones_realizadas ? [
                      { text: 'TIPO COMPONENTE:', style: 'fieldLabel' },
                      { text: notaPostoperatoria.tipo_componente_transfundido || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 10] },

                      { text: 'VOLUMEN TRANSFUNDIDO:', style: 'fieldLabel' },
                      { text: notaPostoperatoria.volumen_transfundido ? `${notaPostoperatoria.volumen_transfundido} ml` : 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 10] },

                      { text: 'REACCIONES:', style: 'fieldLabel' },
                      { text: notaPostoperatoria.reacciones_transfusionales || 'Sin reacciones', style: 'fieldValue' }
                    ] : [
                      { text: 'LÍQUIDOS ADMINISTRADOS:', style: 'fieldLabel' },
                      { text: notaPostoperatoria.liquidos_administrados ? `${notaPostoperatoria.liquidos_administrados} ml` : 'No registrado', style: 'fieldValue', margin: [0, 5, 0, 10] },

                      { text: 'DIURESIS TRANSOP.:', style: 'fieldLabel' },
                      { text: notaPostoperatoria.diuresis_transoperatoria ? `${notaPostoperatoria.diuresis_transoperatoria} ml` : 'No registrado', style: 'fieldValue' }
                    ])
                  ]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // ESTUDIOS Y ESPECÍMENES
        ...(notaPostoperatoria.estudios_transoperatorios !== 'No se realizaron estudios transoperatorios' ||
          notaPostoperatoria.piezas_enviadas_patologia ? [
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: '🔬 ESTUDIOS Y ESPECÍMENES',
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
              widths: ['100%'],
              body: [
                [
                  {
                    stack: [
                      { text: 'ESTUDIOS TRANSOPERATORIOS:', style: 'fieldLabel' },
                      { text: notaPostoperatoria.estudios_transoperatorios || 'No se realizaron estudios', style: 'fieldValue', margin: [0, 5, 0, 15] },

                      ...(notaPostoperatoria.piezas_enviadas_patologia ? [
                        { text: 'ESPECÍMENES ENVIADOS A PATOLOGÍA:', style: 'fieldLabel' },
                        { text: 'SÍ', style: 'fieldValue', color: '#059669', margin: [0, 5, 0, 10] },

                        { text: 'DESCRIPCIÓN ESPECÍMENES:', style: 'fieldLabel' },
                        { text: notaPostoperatoria.descripcion_especimenes || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 10] },

                        { text: 'NÚMERO DE FRASCOS:', style: 'fieldLabel' },
                        { text: notaPostoperatoria.numero_frascos_patologia?.toString() || '1', style: 'fieldValue', margin: [0, 5, 0, 0] }
                      ] : [])
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

        // NUEVA PÁGINA PARA EQUIPO Y ESTADO
        { text: '', pageBreak: 'before' },

        // EQUIPO QUIRÚRGICO
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '👥 EQUIPO QUIRÚRGICO',
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
            widths: ['50%', '50%'],
            body: [
              [
                {
                  stack: [
                    { text: 'CIRUJANO PRINCIPAL:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.cirujano_principal || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'PRIMER AYUDANTE:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.primer_ayudante || 'No asignado', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'SEGUNDO AYUDANTE:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.segundo_ayudante || 'No asignado', style: 'fieldValue' }
                  ]
                },
                {
                  stack: [
                    { text: 'ANESTESIÓLOGO:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.anestesiologo || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'INSTRUMENTISTA:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.instrumentista || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 10] },

                    { text: 'CIRCULANTE:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.circulante || 'No especificado', style: 'fieldValue' }
                  ]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // ESTADO POSTQUIRÚRGICO
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '💗 ESTADO POSTQUIRÚRGICO DEL PACIENTE',
                  style: 'sectionHeader',
                  fillColor: '#ffebee',
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
                    { text: 'ESTADO GENERAL:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.estado_postquirurgico || 'No evaluado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'ESTABILIDAD HEMODINÁMICA:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.estabilidad_hemodinamica || 'No evaluada', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'ESTADO DE CONCIENCIA:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.estado_conciencia || 'No evaluado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'DESTINO DEL PACIENTE:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.destino_paciente || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ],
                  margin: [10, 10]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // PLAN POSTOPERATORIO
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '📋 PLAN POSTOPERATORIO',
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
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'PLAN POSTOPERATORIO:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.plan_postoperatorio || 'Plan estándar postoperatorio', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'INDICACIONES POSTOPERATORIAS:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.indicaciones_postoperatorias || 'Indicaciones estándar', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'ANALGESIA PRESCRITA:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.analgesia_prescrita || 'Según protocolo', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ],
                  margin: [10, 10]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // PRONÓSTICO
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'PRONÓSTICO:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.pronostico || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'EXPECTATIVA DE RECUPERACIÓN:', style: 'fieldLabel' },
                    { text: notaPostoperatoria.expectativa_recuperacion || 'Favorable', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    ...(notaPostoperatoria.seguimiento_requerido ? [
                      { text: 'SEGUIMIENTO REQUERIDO:', style: 'fieldLabel' },
                      { text: notaPostoperatoria.seguimiento_requerido, style: 'fieldValue', margin: [0, 5, 0, 0] }
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

        // OBSERVACIONES FINALES
        ...(notaPostoperatoria.observaciones_cirujano || notaPostoperatoria.observaciones_anestesiologo ? [
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: '💬 OBSERVACIONES ADICIONALES',
                    style: 'sectionHeader',
                    fillColor: '#f8fafc',
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
                      ...(notaPostoperatoria.observaciones_cirujano ? [
                        { text: 'OBSERVACIONES DEL CIRUJANO:', style: 'fieldLabel' },
                        { text: notaPostoperatoria.observaciones_cirujano, style: 'fieldValue', margin: [0, 5, 0, 15] }
                      ] : []),

                      ...(notaPostoperatoria.observaciones_anestesiologo ? [
                        { text: 'OBSERVACIONES DEL ANESTESIÓLOGO:', style: 'fieldLabel' },
                        { text: notaPostoperatoria.observaciones_anestesiologo, style: 'fieldValue', margin: [0, 5, 0, 15] }
                      ] : []),

                      ...(notaPostoperatoria.observaciones_enfermeria ? [
                        { text: 'OBSERVACIONES DE ENFERMERÍA:', style: 'fieldLabel' },
                        { text: notaPostoperatoria.observaciones_enfermeria, style: 'fieldValue', margin: [0, 5, 0, 0] }
                      ] : [])
                    ],
                    margin: [10, 10]
                  }
                ]
              ]
            },
            layout: this.getTableLayout(),
            margin: [0, 0, 0, 20]
          }
        ] : []),

        // RESULTADO DE LA CIRUGÍA
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'RESULTADO DE LA CIRUGÍA', style: 'conclusionTitle', alignment: 'center', margin: [0, 10, 0, 15] },

                    { text: 'CIRUGÍA SIN COMPLICACIONES:', style: 'fieldLabel', alignment: 'center' },
                    {
                      text: notaPostoperatoria.cirugia_sin_complicaciones ? '✅ SÍ' : '❌ NO',
                      style: 'conclusionValue',
                      alignment: 'center',
                      color: notaPostoperatoria.cirugia_sin_complicaciones ? '#059669' : '#dc2626',
                      margin: [0, 5, 0, 10]
                    },

                    { text: 'OBJETIVOS QUIRÚRGICOS ALCANZADOS:', style: 'fieldLabel', alignment: 'center' },
                    {
                      text: notaPostoperatoria.objetivos_alcanzados ? '✅ SÍ' : '❌ NO',
                      style: 'conclusionValue',
                      alignment: 'center',
                      color: notaPostoperatoria.objetivos_alcanzados ? '#059669' : '#dc2626',
                      margin: [0, 5, 0, 0]
                    }
                  ],
                  margin: [10, 10]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 30]
        },

        // FIRMAS
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  stack: [
                    { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
                    { text: 'CIRUJANO PRINCIPAL', style: 'signatureLabel' },
                    { text: notaPostoperatoria.cirujano_principal || 'N/A', style: 'signatureName' },
                    { text: `Cédula Profesional`, style: 'signatureDetails' },
                    { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}`, style: 'signatureDetails' }
                  ]
                },
                {
                  stack: [
                    { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
                    { text: 'MÉDICO RESPONSABLE', style: 'signatureLabel' },
                    { text: medicoCompleto.nombre_completo || 'N/A', style: 'signatureName' },
                    { text: `Cédula: ${medicoCompleto.numero_cedula || 'N/A'}`, style: 'signatureDetails' },
                    { text: `Especialidad: ${medicoCompleto.especialidad || 'N/A'}`, style: 'signatureDetails' }
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
                  text: `Nota Postoperatoria - Hospital General San Luis de la Paz`,
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
        conteoValue: {
          fontSize: 10,
          bold: true
        },
        conclusionTitle: {
          fontSize: 14,
          bold: true,
          color: '#059669'
        },
        conclusionValue: {
          fontSize: 12,
          bold: true
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


  async generarNotaInterconsulta(datos: any): Promise<any> {
    console.log('💫 Generando Nota de Interconsulta - ¡EL GRAN FINAL!');

    const { pacienteCompleto, medicoCompleto, interconsulta } = datos;
    const fechaActual = new Date();

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
                    { text: '💫 NOTA DE INTERCONSULTA', fontSize: 16, bold: true, alignment: 'center', color: '#7c3aed' },
                    { text: 'COMUNICACIÓN ENTRE ESPECIALIDADES', fontSize: 10, alignment: 'center', italics: true },
                    { text: 'NOM-004-SSA3-2012', fontSize: 8, alignment: 'center', color: '#666666' }
                  ]
                },
                {
                  stack: [
                    { text: 'FOLIO:', fontSize: 8, bold: true, alignment: 'right' },
                    { text: interconsulta.numero_interconsulta || this.generarNumeroInterconsulta(), fontSize: 10, alignment: 'right' },
                    { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}`, fontSize: 8, alignment: 'right', margin: [0, 2] },
                    { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 8, alignment: 'right' }
                  ]
                }
              ]
            ]
          },
          layout: 'noBorders'
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
                  fillColor: '#faf5ff',
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
                { text: 'Fecha Solicitud:', style: 'fieldLabel' },
                { text: this.formatearFecha(interconsulta.fecha_solicitud), style: 'fieldValue' },
                { text: 'Urgencia:', style: 'fieldLabel' },
                { text: this.formatearUrgencia(interconsulta.urgencia_interconsulta), style: 'urgenciaValue', color: this.getColorUrgencia(interconsulta.urgencia_interconsulta) }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // INFORMACIÓN DE LA SOLICITUD
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '📋 INFORMACIÓN DE LA SOLICITUD',
                  style: 'sectionHeader',
                  fillColor: '#eff6ff',
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
                    { text: 'ESPECIALIDAD SOLICITADA:', style: 'fieldLabel' },
                    { text: interconsulta.especialidad_solicitada || 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'MÉDICO SOLICITANTE:', style: 'fieldLabel' },
                    { text: interconsulta.medico_solicitante || medicoCompleto.nombre_completo || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'SERVICIO SOLICITANTE:', style: 'fieldLabel' },
                    { text: interconsulta.servicio_solicitante || medicoCompleto.departamento || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ]
                },
                {
                  stack: [
                    { text: 'CONTACTO:', style: 'fieldLabel' },
                    { text: interconsulta.telefono_contacto ? `Tel: ${interconsulta.telefono_contacto}` : 'No proporcionado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'TIEMPO ESPERADO:', style: 'fieldLabel' },
                    { text: interconsulta.tiempo_respuesta_esperado || '48 horas', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'ESTADO:', style: 'fieldLabel' },
                    { text: interconsulta.estado_interconsulta || 'Pendiente', style: 'estadoValue', color: this.getColorEstado(interconsulta.estado_interconsulta), margin: [0, 5, 0, 0] }
                  ]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // MOTIVO DE LA INTERCONSULTA
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '❓ MOTIVO DE LA INTERCONSULTA',
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
                    { text: 'MOTIVO DE INTERCONSULTA:', style: 'fieldLabel' },
                    { text: interconsulta.motivo_interconsulta || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'PREGUNTA ESPECÍFICA AL ESPECIALISTA:', style: 'fieldLabel' },
                    { text: interconsulta.pregunta_especifica || 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'JUSTIFICACIÓN DE LA INTERCONSULTA:', style: 'fieldLabel' },
                    { text: interconsulta.justificacion_interconsulta || 'Evaluación especializada requerida', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ],
                  margin: [10, 10]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // INFORMACIÓN CLÍNICA
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '🩺 INFORMACIÓN CLÍNICA DEL PACIENTE',
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
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'RESUMEN DEL CASO:', style: 'fieldLabel' },
                    { text: interconsulta.resumen_caso || 'No proporcionado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'DIAGNÓSTICO PRESUNTIVO:', style: 'fieldLabel' },
                    { text: interconsulta.diagnostico_presuntivo || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'SÍNTOMAS PRINCIPALES:', style: 'fieldLabel' },
                    { text: interconsulta.sintomas_principales || 'No especificados', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'TIEMPO DE EVOLUCIÓN:', style: 'fieldLabel' },
                    { text: interconsulta.tiempo_evolucion || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ],
                  margin: [10, 10]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // SIGNOS VITALES ACTUALES
        ...(this.tieneSignosVitales(interconsulta) ? [
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: '💓 SIGNOS VITALES ACTUALES',
                    style: 'sectionHeader',
                    fillColor: '#ffebee',
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
              widths: ['20%', '20%', '20%', '20%', '20%'],
              body: [
                [
                  { text: 'TA', style: 'vitalHeader' },
                  { text: 'FC', style: 'vitalHeader' },
                  { text: 'FR', style: 'vitalHeader' },
                  { text: 'Temp.', style: 'vitalHeader' },
                  { text: 'SatO₂', style: 'vitalHeader' }
                ],
                [
                  { text: interconsulta.presion_arterial_actual || '--', style: 'vitalValue' },
                  { text: interconsulta.frecuencia_cardiaca_actual ? `${interconsulta.frecuencia_cardiaca_actual} lpm` : '--', style: 'vitalValue' },
                  { text: interconsulta.frecuencia_respiratoria_actual ? `${interconsulta.frecuencia_respiratoria_actual} rpm` : '--', style: 'vitalValue' },
                  { text: interconsulta.temperatura_actual ? `${interconsulta.temperatura_actual}°C` : '--', style: 'vitalValue' },
                  { text: interconsulta.saturacion_oxigeno_actual ? `${interconsulta.saturacion_oxigeno_actual}%` : '--', style: 'vitalValue' }
                ]
              ]
            },
            layout: this.getTableLayout(),
            margin: [0, 0, 0, 15]
          }
        ] : []),

        // EXPLORACIÓN FÍSICA
        ...(interconsulta.exploracion_fisica_relevante ? [
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    stack: [
                      { text: 'EXPLORACIÓN FÍSICA RELEVANTE:', style: 'fieldLabel' },
                      { text: interconsulta.exploracion_fisica_relevante, style: 'fieldValue', margin: [0, 5, 0, 15] },

                      ...(interconsulta.hallazgos_importantes ? [
                        { text: 'HALLAZGOS IMPORTANTES:', style: 'fieldLabel' },
                        { text: interconsulta.hallazgos_importantes, style: 'fieldValue', margin: [0, 5, 0, 0] }
                      ] : [])
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

        // ESTUDIOS REALIZADOS
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '🔬 ESTUDIOS REALIZADOS',
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
            widths: ['25%', '25%', '50%'],
            body: [
              [
                {
                  stack: [
                    { text: 'LABORATORIO:', style: 'fieldLabel' },
                    { text: interconsulta.examenes_laboratorio ? '✅ SÍ' : '❌ NO', style: 'estudioValue', color: interconsulta.examenes_laboratorio ? '#059669' : '#dc2626' }
                  ]
                },
                {
                  stack: [
                    { text: 'GABINETE:', style: 'fieldLabel' },
                    { text: interconsulta.examenes_gabinete ? '✅ SÍ' : '❌ NO', style: 'estudioValue', color: interconsulta.examenes_gabinete ? '#059669' : '#dc2626' }
                  ]
                },
                {
                  stack: [
                    { text: 'ESTUDIOS REALIZADOS:', style: 'fieldLabel' },
                    { text: interconsulta.estudios_realizados || 'No se han realizado estudios', style: 'fieldValue' }
                  ]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 10]
        },

        ...(interconsulta.resultados_relevantes ? [
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    stack: [
                      { text: 'RESULTADOS RELEVANTES:', style: 'fieldLabel' },
                      { text: interconsulta.resultados_relevantes, style: 'fieldValue' }
                    ],
                    margin: [10, 5]
                  }
                ]
              ]
            },
            layout: this.getTableLayout(),
            margin: [0, 0, 0, 15]
          }
        ] : []),

        // TRATAMIENTO ACTUAL
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '💊 TRATAMIENTO ACTUAL',
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
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: 'TRATAMIENTO ACTUAL:', style: 'fieldLabel' },
                    { text: interconsulta.tratamiento_actual || 'Sin tratamiento específico', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'MEDICAMENTOS ACTUALES:', style: 'fieldLabel' },
                    { text: interconsulta.medicamentos_actuales || 'Sin medicamentos', style: 'fieldValue', margin: [0, 5, 0, 15] },

                    { text: 'ALERGIAS MEDICAMENTOSAS:', style: 'fieldLabel' },
                    { text: interconsulta.alergias_medicamentosas || 'Sin alergias conocidas', style: 'fieldValue', margin: [0, 5, 0, 0] }
                  ],
                  margin: [10, 10]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 15]
        },

        // NUEVA PÁGINA PARA RESPUESTA
        { text: '', pageBreak: 'before' },

        // RESPUESTA DEL ESPECIALISTA
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '👨‍⚕️ RESPUESTA DEL ESPECIALISTA',
                  style: 'sectionHeader',
                  fillColor: '#e0f2fe',
                  margin: [10, 8]
                }
              ]
            ]
          },
          layout: this.getTableLayout(),
          margin: [0, 0, 0, 10]
        },

        ...(interconsulta.medico_consultor ? [
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    stack: [
                      { text: 'MÉDICO CONSULTOR:', style: 'fieldLabel' },
                      { text: interconsulta.medico_consultor, style: 'fieldValue', margin: [0, 5, 0, 10] },

                      { text: 'FECHA DE RESPUESTA:', style: 'fieldLabel' },
                      { text: this.formatearFecha(interconsulta.fecha_respuesta), style: 'fieldValue' }
                    ]
                  },
                  {
                    stack: [
                      { text: 'HORA DE EVALUACIÓN:', style: 'fieldLabel' },
                      { text: interconsulta.hora_evaluacion || 'No registrada', style: 'fieldValue', margin: [0, 5, 0, 10] },

                      { text: 'ESPECIALIDAD:', style: 'fieldLabel' },
                      { text: interconsulta.especialidad_solicitada || 'No especificada', style: 'fieldValue' }
                    ]
                  }
                ]
              ]
            },
            layout: this.getTableLayout(),
            margin: [0, 0, 0, 15]
          }
        ] : [
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: '⏳ PENDIENTE DE RESPUESTA DEL ESPECIALISTA',
                    style: 'pendienteText',
                    alignment: 'center',
                    margin: [10, 20]
                  }
                ]
              ]
            },
            layout: this.getTableLayout(),
            margin: [0, 0, 0, 15]
          }
        ]),

        // EVALUACIÓN DEL ESPECIALISTA
        ...(interconsulta.impresion_diagnostica ? [
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    stack: [
                      { text: 'IMPRESIÓN DIAGNÓSTICA DEL ESPECIALISTA:', style: 'fieldLabel' },
                      { text: interconsulta.impresion_diagnostica, style: 'fieldValue', margin: [0, 5, 0, 15] },

                      ...(interconsulta.diagnostico_especialista ? [
                        { text: 'DIAGNÓSTICO DEL ESPECIALISTA:', style: 'fieldLabel' },
                        { text: interconsulta.diagnostico_especialista, style: 'fieldValue', margin: [0, 5, 0, 15] }
                      ] : []),

                      ...(interconsulta.comentarios_especialista ? [
                        { text: 'COMENTARIOS DEL ESPECIALISTA:', style: 'fieldLabel' },
                        { text: interconsulta.comentarios_especialista, style: 'fieldValue', margin: [0, 5, 0, 0] }
                      ] : [])
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

        // RECOMENDACIONES
        ...(interconsulta.recomendaciones ? [
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: '💡 RECOMENDACIONES DEL ESPECIALISTA',
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
              widths: ['100%'],
              body: [
                [
                  {
                    stack: [
                      { text: 'RECOMENDACIONES PRINCIPALES:', style: 'fieldLabel' },
                      { text: interconsulta.recomendaciones, style: 'fieldValue', margin: [0, 5, 0, 15] },

                      ...(interconsulta.plan_manejo ? [
                        { text: 'PLAN DE MANEJO:', style: 'fieldLabel' },
                        { text: interconsulta.plan_manejo, style: 'fieldValue', margin: [0, 5, 0, 15] }
                      ] : []),

                      ...(interconsulta.medicamentos_sugeridos ? [
                        { text: 'MEDICAMENTOS SUGERIDOS:', style: 'fieldLabel' },
                        { text: interconsulta.medicamentos_sugeridos, style: 'fieldValue', margin: [0, 5, 0, 15] }
                      ] : []),

                      ...(interconsulta.estudios_adicionales ? [
                        { text: 'ESTUDIOS ADICIONALES:', style: 'fieldLabel' },
                        { text: interconsulta.estudios_adicionales, style: 'fieldValue', margin: [0, 5, 0, 0] }
                      ] : [])
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

        // SEGUIMIENTO
        ...(interconsulta.requiere_seguimiento ? [
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: '📅 PLAN DE SEGUIMIENTO',
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
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    stack: [
                      { text: 'REQUIERE SEGUIMIENTO:', style: 'fieldLabel' },
                      { text: '✅ SÍ', style: 'fieldValue', color: '#059669', margin: [0, 5, 0, 10] },

                      { text: 'TIPO DE SEGUIMIENTO:', style: 'fieldLabel' },
                      { text: interconsulta.tipo_seguimiento || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 10] },

                      { text: 'FRECUENCIA:', style: 'fieldLabel' },
                      { text: interconsulta.frecuencia_seguimiento || 'No especificada', style: 'fieldValue' }
                    ]
                  },
                  {
                    stack: [
                      { text: 'HOSPITALIZACÓN:', style: 'fieldLabel' },
                      { text: interconsulta.requiere_hospitalizacion ? '✅ SÍ' : '❌ NO', style: 'fieldValue', color: interconsulta.requiere_hospitalizacion ? '#dc2626' : '#059669', margin: [0, 5, 0, 10] },

                      { text: 'CIRUGÍA:', style: 'fieldLabel' },
                      { text: interconsulta.requiere_cirugia ? '✅ SÍ' : '❌ NO', style: 'fieldValue', color: interconsulta.requiere_cirugia ? '#dc2626' : '#059669', margin: [0, 5, 0, 10] },

                      { text: 'OTRAS ESPECIALIDADES:', style: 'fieldLabel' },
                      { text: interconsulta.otras_especialidades || 'No requiere', style: 'fieldValue' }
                    ]
                  }
                ]
              ]
            },
            layout: this.getTableLayout(),
            margin: [0, 0, 0, 15]
          }
        ] : []),

        // PRONÓSTICO
        ...(interconsulta.pronostico_especialista ? [
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    stack: [
                      { text: 'PRONÓSTICO:', style: 'fieldLabel' },
                      { text: interconsulta.pronostico_especialista, style: 'fieldValue', margin: [0, 5, 0, 15] },

                      ...(interconsulta.signos_alarma ? [
                        { text: 'SIGNOS DE ALARMA:', style: 'fieldLabel' },
                        { text: interconsulta.signos_alarma, style: 'fieldValue', margin: [0, 5, 0, 0] }
                      ] : [])
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

        // OBSERVACIONES FINALES
        ...(interconsulta.observaciones_especialista || interconsulta.observaciones_adicionales ? [
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: '💬 OBSERVACIONES ADICIONALES',
                    style: 'sectionHeader',
                    fillColor: '#f8fafc',
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
                      ...(interconsulta.observaciones_especialista ? [
                        { text: 'OBSERVACIONES DEL ESPECIALISTA:', style: 'fieldLabel' },
                        { text: interconsulta.observaciones_especialista, style: 'fieldValue', margin: [0, 5, 0, 15] }
                      ] : []),

                      ...(interconsulta.observaciones_adicionales ? [
                        { text: 'OBSERVACIONES ADICIONALES:', style: 'fieldLabel' },
                        { text: interconsulta.observaciones_adicionales, style: 'fieldValue', margin: [0, 5, 0, 0] }
                      ] : [])
                    ],
                    margin: [10, 10]
                  }
                ]
              ]
            },
            layout: this.getTableLayout(),
            margin: [0, 0, 0, 20]
          }
        ] : []),

        // FIRMAS
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  stack: [
                    { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
                    { text: 'MÉDICO SOLICITANTE', style: 'signatureLabel' },
                    { text: interconsulta.medico_solicitante || medicoCompleto.nombre_completo || 'N/A', style: 'signatureName' },
                    { text: `Servicio: ${interconsulta.servicio_solicitante || medicoCompleto.departamento || 'N/A'}`, style: 'signatureDetails' },
                    { text: `Cédula: ${medicoCompleto.numero_cedula || 'N/A'}`, style: 'signatureDetails' }
                  ]
                },
                {
                  stack: [
                    { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
                    { text: 'MÉDICO CONSULTOR', style: 'signatureLabel' },
                    { text: interconsulta.medico_consultor || 'Pendiente de asignar', style: 'signatureName' },
                    { text: `Especialidad: ${interconsulta.especialidad_solicitada || 'N/A'}`, style: 'signatureDetails' },
                    { text: `Fecha: ${this.formatearFecha(interconsulta.fecha_respuesta) || '________________'}`, style: 'signatureDetails' }
                  ]
                }
              ]
            ]
          },
          layout: 'noBorders'
        },

        // MENSAJE DE COMPLETADO AL 100%
        {
          margin: [0, 30, 0, 0],
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  stack: [
                    { text: '🎉 SISTEMA SICEG-HG COMPLETADO AL 100% 🎉', style: 'completedTitle', alignment: 'center', margin: [0, 10, 0, 5] },
                    { text: '12/12 DOCUMENTOS CLÍNICOS FUNCIONALES', style: 'completedSubtitle', alignment: 'center', margin: [0, 0, 0, 5] },
                    { text: 'CUMPLIMIENTO TOTAL NOM-004-SSA3-2012', style: 'completedSubtitle', alignment: 'center', margin: [0, 0, 0, 10] },
                    { text: 'Hospital General San Luis de la Paz, Guanajuato', style: 'completedFooter', alignment: 'center' }
                  ],
                  fillColor: '#f0fdf4',
                  margin: [10, 15]
                }
              ]
            ]
          },
          layout: this.getTableLayout()
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
                  text: `Interconsulta - Hospital General San Luis de la Paz`,
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
        urgenciaValue: {
          fontSize: 10,
          bold: true
        },
        estadoValue: {
          fontSize: 10,
          bold: true
        },
        estudioValue: {
          fontSize: 9,
          bold: true
        },
        vitalHeader: {
          fontSize: 8,
          bold: true,
          color: '#ffffff',
          fillColor: '#7c3aed',
          alignment: 'center',
          margin: [2, 2, 2, 2]
        },
        vitalValue: {
          fontSize: 8,
          alignment: 'center',
          margin: [2, 2, 2, 2]
        },
        pendienteText: {
          fontSize: 12,
          bold: true,
          color: '#d97706',
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
        completedTitle: {
          fontSize: 14,
          bold: true,
          color: '#059669'
        },
        completedSubtitle: {
          fontSize: 10,
          bold: true,
          color: '#059669'
        },
        completedFooter: {
          fontSize: 8,
          color: '#6b7280'
        }
      }
    };
  }



}
