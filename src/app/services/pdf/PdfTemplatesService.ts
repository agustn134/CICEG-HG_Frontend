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

//   public obtenerNumeroExpedientePreferido(expediente: any): string {
//     console.log('🔍 DEBUG obtenerNumeroExpedientePreferido:', {
//       expediente_completo: expediente,
//       numero_expediente_administrativo: expediente?.numero_expediente_administrativo,
//       numero_expediente: expediente?.numero_expediente,
//       tipo: typeof expediente
//     });
    
//     const resultado = expediente?.numero_expediente_administrativo ||
//       expediente?.numero_expediente ||
//       'Sin número';
      
//     // 🔥 BUSCAR EN RUTA CORRECTA:
//   const numeroAdministrativo = expediente?.expediente?.numero_expediente_administrativo;
//   const numeroRegular = expediente?.expediente?.numero_expediente;
  
//   if (numeroAdministrativo) {
//     console.log('✅ Número ADMINISTRATIVO encontrado:', numeroAdministrativo);
//     return numeroAdministrativo;
//   }
  
//   if (numeroRegular) {
//     console.log('✅ Número REGULAR encontrado:', numeroRegular);
//     return numeroRegular;
//   }
  
//   console.log('❌ No se encontró número de expediente');
//   return 'Sin número';
// }
// En PdfTemplatesService.ts - REEMPLAZAR obtenerNumeroExpedientePreferido():
public obtenerNumeroExpedientePreferido(expediente: any): string {
  console.log('🔍 DEBUG obtenerNumeroExpedientePreferido - CORREGIDO:', {
    expediente_completo: expediente,
    pacienteCompleto_expediente: expediente?.expediente,
    numero_administrativo: expediente?.expediente?.numero_expediente_administrativo,
    numero_regular: expediente?.expediente?.numero_expediente
  });
  
  // 🔥 BUSCAR EN RUTA CORRECTA:
  const numeroAdministrativo = expediente?.expediente?.numero_expediente_administrativo;
  const numeroRegular = expediente?.expediente?.numero_expediente;
  
  if (numeroAdministrativo) {
    console.log('✅ Número ADMINISTRATIVO encontrado:', numeroAdministrativo);
    return numeroAdministrativo;
  }
  
  if (numeroRegular) {
    console.log('✅ Número REGULAR encontrado:', numeroRegular);
    return numeroRegular;
  }
  
  console.log('❌ No se encontró número de expediente');
  return 'Sin número';
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

  public async obtenerImagenBase64(rutaImagen: string): Promise<string> {
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
  public async obtenerConfiguracionLogosInteligente(): Promise<any> {
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
    laboratorio: 'SOLICITUD DE ESTUDIOS DE LABORATORIO',
    imagenologia: 'SOLICITUD DE ESTUDIOS DE IMAGENOLOGÍA', // ✅ Cambio aquí
    otros: 'SOLICITUD DE ESTUDIOS ESPECIALES',
  };
  return titulos[tipo] || 'SOLICITUD DE ESTUDIO';
}

  private obtenerIconoSolicitud(tipo: string): string {
  const iconos: { [key: string]: string } = {
    laboratorio: '-',
    imagenologia: '-', // ✅ Cambio aquí
    otros: '-',
  };
  return iconos[tipo] || '📄';
}

private obtenerTituloSeccionEstudios(tipo: string): string {
  const titulos: { [key: string]: string } = {
    laboratorio: 'ESTUDIOS DE LABORATORIO SOLICITADOS',
    imagenologia: 'ESTUDIOS DE IMAGENOLOGÍA SOLICITADOS', // ✅ Cambio aquí
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


private construirTextoEstudiosSeleccionados(solicitudEstudio: any, tipoEstudio: string): string {
  const estudiosArray = solicitudEstudio.estudios_solicitados
    ? solicitudEstudio.estudios_solicitados.split('\n').filter((e: string) => e.trim())
    : [];

  if (estudiosArray.length > 0) {
    return estudiosArray.map((estudio: string) => `• ${estudio}`).join('\n');
  }

  // Si no hay estudios específicos, construir a partir de checkboxes según tipo
  if (tipoEstudio === 'laboratorio') {
    return this.construirEstudiosLaboratorio(solicitudEstudio);
  } else if (tipoEstudio === 'imagen') {
    return this.construirEstudiosImagenologia(solicitudEstudio);
  } else if (tipoEstudio === 'otros') {
    return solicitudEstudio.otros_estudios || 'No se especificaron estudios especiales';
  }

  return 'No se especificaron estudios';
}


private construirEstudiosLaboratorio(solicitud: any): string {
  const estudios: string[] = [];
  
  // Química sanguínea
  if (solicitud.quimica_sanguinea) estudios.push('• Química sanguínea completa');
  if (solicitud.glucosa) estudios.push('• Glucosa sérica');
  if (solicitud.urea) estudios.push('• Urea');
  if (solicitud.creatinina) estudios.push('• Creatinina sérica');
  if (solicitud.acido_urico) estudios.push('• Ácido úrico');
  if (solicitud.transaminasas) estudios.push('• Transaminasas (ALT/AST)');
  if (solicitud.bilirrubinas) estudios.push('• Bilirrubinas');
  if (solicitud.proteinas_totales) estudios.push('• Proteínas totales');
  if (solicitud.albumina) estudios.push('• Albúmina');

  // Perfil lipídico
  if (solicitud.colesterol_total) estudios.push('• Colesterol total');
  if (solicitud.trigliceridos) estudios.push('• Triglicéridos');
  if (solicitud.hdl) estudios.push('• HDL colesterol');
  if (solicitud.ldl) estudios.push('• LDL colesterol');

  // Hematología
  if (solicitud.biometria_hematica) estudios.push('• Biometría hemática completa');
  if (solicitud.tiempo_protrombina) estudios.push('• Tiempo de protrombina');
  if (solicitud.tiempo_tromboplastina) estudios.push('• Tiempo de tromboplastina');
  if (solicitud.inr) estudios.push('• INR');

  // Estudios de orina
  if (solicitud.examen_general_orina) estudios.push('• Examen general de orina');
  if (solicitud.urocultivo) estudios.push('• Urocultivo');

  // Electrolitos
  if (solicitud.sodio) estudios.push('• Sodio sérico');
  if (solicitud.potasio) estudios.push('• Potasio sérico');
  if (solicitud.cloro) estudios.push('• Cloro sérico');

  return estudios.length > 0 ? estudios.join('\n') : 'No se seleccionaron estudios de laboratorio específicos';
}

private construirEstudiosImagenologia(solicitud: any): string {
  const estudios: string[] = [];

  // Radiografías
  if (solicitud.radiografia_torax) estudios.push('• Radiografía de tórax');
  if (solicitud.radiografia_abdomen) estudios.push('• Radiografía de abdomen');
  if (solicitud.radiografia_columna) estudios.push('• Radiografía de columna');
  if (solicitud.radiografia_extremidades) estudios.push('• Radiografía de extremidades');

  // Ultrasonidos
  if (solicitud.ultrasonido_abdominal) estudios.push('• Ultrasonido abdominal');
  if (solicitud.ultrasonido_pelvico) estudios.push('• Ultrasonido pélvico');
  if (solicitud.ecocardiograma) estudios.push('• Ecocardiograma');
  if (solicitud.ultrasonido_renal) estudios.push('• Ultrasonido renal');
  if (solicitud.ultrasonido_tiroideo) estudios.push('• Ultrasonido tiroideo');

  // Tomografías
  if (solicitud.tomografia_cerebral) estudios.push('• TAC cerebral simple');
  if (solicitud.tomografia_torax) estudios.push('• TAC de tórax');
  if (solicitud.tomografia_abdomen) estudios.push('• TAC abdominal');
  if (solicitud.tomografia_contrastada) estudios.push('• TAC con medio de contraste');

  // Resonancias
  if (solicitud.resonancia_cerebral) estudios.push('• RM cerebral');
  if (solicitud.resonancia_columna) estudios.push('• RM de columna');
  if (solicitud.resonancia_articular) estudios.push('• RM articular');

  return estudios.length > 0 ? estudios.join('\n') : 'No se seleccionaron estudios de imagenología específicos';
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

public obtenerNumeroExpedienteInteligente(pacienteCompleto: any): string {
  console.log('🔍 Obteniendo número de expediente ADMINISTRATIVO:', pacienteCompleto);
  
  // 🔥 ESTRATEGIA 1: PRIORIZAR SIEMPRE EL ADMINISTRATIVO
  const posiblesRutasAdministrativo = [
    // Administrativo PRIMERO en todas las rutas
    pacienteCompleto?.expediente?.numero_expediente_administrativo,
    pacienteCompleto?.numero_expediente_administrativo,
    pacienteCompleto?.paciente?.expediente?.numero_expediente_administrativo,
    pacienteCompleto?.paciente?.numero_expediente_administrativo,
  ];
  
  // Buscar SOLO el administrativo primero
  for (const ruta of posiblesRutasAdministrativo) {
    if (ruta && ruta.toString().trim() !== '' && ruta.toString() !== 'null') {
      console.log('✅ Número ADMINISTRATIVO encontrado:', ruta);
      return ruta.toString();
    }
  }
  
  // 🔥 ESTRATEGIA 2: Si no hay administrativo, usar el regular como fallback
  console.log('⚠️ No se encontró número administrativo, usando regular como fallback');
  
  const posiblesRutasRegular = [
    pacienteCompleto?.expediente?.numero_expediente,
    pacienteCompleto?.numero_expediente,
    pacienteCompleto?.paciente?.expediente?.numero_expediente,
    pacienteCompleto?.paciente?.numero_expediente,
  ];
  
  for (const ruta of posiblesRutasRegular) {
    if (ruta && ruta.toString().trim() !== '' && ruta.toString() !== 'null') {
      console.log('✅ Número regular encontrado como fallback:', ruta);
      return `${ruta.toString()} (REG)`; // Marcar que es regular
    }
  }
  
  // Si no hay ninguno, generar temporal
  const numeroTemporal = `ADM-TEMP-${new Date().getTime().toString().slice(-6)}`;
  console.log('⚠️ Generando número temporal:', numeroTemporal);
  return numeroTemporal;
}

// 🔥 MÉTODO AUXILIAR PARA CONSTRUIR TEXTO DE EXPLORACIÓN POR SISTEMAS
private construirTextoExploracionSistemas(notaEvolucion: any): string {
  const exploraciones = [
    { campo: notaEvolucion.exploracion_cabeza, label: 'CABEZA Y CUELLO' },
    { campo: notaEvolucion.exploracion_cuello, label: 'CUELLO' },
    { campo: notaEvolucion.exploracion_torax, label: 'TÓRAX Y PULMONES' },
    { campo: notaEvolucion.exploracion_abdomen, label: 'ABDOMEN' },
    { campo: notaEvolucion.exploracion_extremidades, label: 'EXTREMIDADES' },
    { campo: notaEvolucion.exploracion_columna, label: 'COLUMNA' },
    { campo: notaEvolucion.exploracion_genitales, label: 'GENITALES' },
    { campo: notaEvolucion.exploracion_neurologico, label: 'NEUROLÓGICO' },
  ];

  const textosExploracion = exploraciones
    .filter(exp => exp.campo && exp.campo.trim())
    .map(exp => `${exp.label}: ${exp.campo}`)
    .join('\n\n');

  return textosExploracion || 'Sin exploración específica por sistemas registrada';
}
  /////////////////////////////////////////// GENERACION DE DOCUMETNOS ///////////////////////////////////////
// C:\Proyectos\CICEG-HG_Frontend\src\app\services\PDF\PdfTemplatesService.ts
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
            fontSize: 6,
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
                    fontSize: 6,
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
            fontSize: 6,
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
      `Alimentación: ${historiaClinicaData.habitos_alimenticios || 'No registrado'}\n` +
      `Higiene: ${historiaClinicaData.habitos_higienicos || 'Adecuada'}\n` +
      `Actividad física: ${historiaClinicaData.actividad_fisica || 
        (esPediatrico ? 'Apropiada para la edad' : 'Regular')}\n` +
      `Vivienda: ${historiaClinicaData.vivienda || 'Casa habitación con servicios básicos'}\n` +
      `${esPediatrico ? 'Inmunizaciones: Esquema completo según edad\n' : ''}` +
      `${esPediatrico ? 'Desarrollo psicomotor: Acorde a la edad\n' : ''}` +
      `${!esPediatrico && historiaClinicaData.toxicomanias
        ? `Toxicomanías: ${historiaClinicaData.toxicomanias}\n`
        : !esPediatrico ? 'Toxicomanías: Negadas\n' : ''
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
                  '/uploads/logos/logo-gobierno-importado.svg'
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
                fontSize: 8,
                bold: true,
                alignment: 'center',
                color: '#1a365d',
                margin: [0, 8],
              },
              {
                // Logo del hospital (derecha)
                image: await this.obtenerImagenBase64(
                  datos.configuracion?.logo_principal ||
                  '/uploads/logos/logo-principal-importado.svg'
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
                  fontSize: 6,
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
                  fontSize: 6,
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
      text: `Peso: ${signosVitales.peso || 
             historiaClinicaData.peso || '___'} kg\n` +
            `Talla: ${signosVitales.talla || 
             historiaClinicaData.talla || '___'} cm\n` +
            `IMC: ${this.calcularIMC(
              signosVitales.peso || historiaClinicaData.peso,
              signosVitales.talla || historiaClinicaData.talla
            )}`,
      fontSize: 7,
    },
    {
      width: '33%',
      text: `TA: ${signosVitales.presion_arterial_sistolica || 
             historiaClinicaData.presion_arterial_sistolica || '___'}/${
             signosVitales.presion_arterial_diastolica || 
             historiaClinicaData.presion_arterial_diastolica || '___'
            } mmHg\n` +
            `FC: ${signosVitales.frecuencia_cardiaca || 
             historiaClinicaData.frecuencia_cardiaca || '___'} lpm\n` +
            `FR: ${signosVitales.frecuencia_respiratoria || 
             historiaClinicaData.frecuencia_respiratoria || '___'} rpm`,
      fontSize: 7,
    },
    {
      width: '34%',
      text: `Temperatura: ${signosVitales.temperatura || 
             historiaClinicaData.temperatura || '___'} °C\n` +
            `Saturación O2: ${signosVitales.saturacion_oxigeno || 
             historiaClinicaData.saturacion_oxigeno || '___'} %\n` +
            `Glucosa: ${signosVitales.glucosa || 
             historiaClinicaData.glucosa || '___'} mg/dL`,
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
                  fontSize: 6,
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
                  fontSize: 6,
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
    text: [
      {
        text: historiaClinicaData.impresion_diagnostica ||
              historiaClinicaData.diagnosticos ||
              'Sin información registrada',
        fontSize: 7,
        bold: true,
      },
      // 🔥 AGREGAR CIE-10
      historiaClinicaData.codigo_cie10 ? {
        text: `\n\nCódigo CIE-10: ${historiaClinicaData.codigo_cie10}`,
        fontSize: 7,
        bold: true,
        color: '#000000ff',
        italics: true,
      } : {}
    ],
    margin: [3, 2],
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
                  fontSize: 6,
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
                  fontSize: 6,
                  bold: true,
                  fillColor: '#ddd9c3',
                  alignment: 'center',
                  margin: [2, 5],
                },
                {
                  text: 'FIRMA AUTÓGRAFA',
                  fontSize: 6,
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
                      fontSize: 7,
                      bold: true,
                    },
                    {
                      text: `Cédula Profesional: ${medicoCompleto.numero_cedula}\n`,
                      fontSize: 6,
                    },
                    {
                      text: `Especialidad: ${medicoCompleto.especialidad}\n`,
                      fontSize: 6,
                    },
                    {
                      text: `${medicoCompleto.cargo} - ${medicoCompleto.departamento}\n`,
                      fontSize: 6,
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
                  fontSize: 6,
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


  // 🔥 VERSIÓN MEJORADA
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
              fontSize: 8,
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
              fontSize: 6,
              bold: true,
              fillColor: '#f5f5f5',
              alignment: 'center',
              colSpan: 2,
            },
            {},
          ],
          [
            { text: 'Tipo de establecimiento:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData.tipo_establecimiento || 'Hospital General', fontSize: 6 },
          ],
          [
            { text: 'Nombre del establecimiento:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData.nombre_establecimiento || 'Hospital General San Luis de la Paz', fontSize: 6 },
          ],
          [
            { text: 'Domicilio del establecimiento:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData.domicilio_establecimiento || 'San Luis de la Paz, Guanajuato, México', fontSize: 6 },
          ],
          [
            { text: 'Razón social:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData.razon_social || 'Servicios de Salud de Guanajuato', fontSize: 6 },
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
              fontSize: 6,
              bold: true,
              fillColor: '#f5f5f5',
              alignment: 'center',
              colSpan: 2,
            },
            {},
          ],
          [
            { text: 'Nombre completo:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: pacienteCompleto.nombre_completo || 'N/A', fontSize: 7, bold: true },
          ],
          [
            { text: 'CURP:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: pacienteCompleto.curp || 'No registrado', fontSize: 6 },
          ],
          [
            { text: 'Fecha de nacimiento:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: this.formatearFecha(pacienteCompleto.fecha_nacimiento) || 'No registrada', fontSize: 6 },
          ],
          [
            { text: 'Edad:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: `${pacienteCompleto.edad || 0} años`, fontSize: 6 },
          ],
          [
            { text: 'Sexo:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: pacienteCompleto.sexo || 'No especificado', fontSize: 6 },
          ],
          [
            { text: 'Tipo sanguíneo:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: pacienteCompleto.tipo_sangre || 'No especificado', fontSize: 6, bold: true },
          ],
          [
            { text: 'Lugar de nacimiento:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: pacienteCompleto.lugar_nacimiento || 'No especificado', fontSize: 6 },
          ],
          [
            { text: 'Nacionalidad:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData.nacionalidad || 'Mexicana', fontSize: 6 },
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
              fontSize: 6,
              bold: true,
              fillColor: '#f5f5f5',
              alignment: 'center',
              colSpan: 2,
            },
            {},
          ],
          [
            { text: 'Domicilio:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: this.formatearDireccionCompleta(pacienteCompleto) || 'Sin dirección registrada', fontSize: 6 },
          ],
          [
            { text: 'Teléfono principal:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: pacienteCompleto.telefono || 'No registrado', fontSize: 6 },
          ],
          [
            { text: 'Teléfono secundario:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData.telefono_secundario || 'No registrado', fontSize: 6 },
          ],
          [
            { text: 'Correo electrónico:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: pacienteCompleto.correo_electronico || hojaFrontalData.email || 'No registrado', fontSize: 6 },
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
              fontSize: 6,
              bold: true,
              fillColor: '#f5f5f5',
              alignment: 'center',
              colSpan: 2,
            },
            {},
          ],
          [
            { text: 'Ocupación:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: pacienteCompleto.ocupacion || hojaFrontalData.ocupacion || (esPediatrico ? 'Estudiante' : 'No registrada'), fontSize: 6 },
          ],
          [
            { text: 'Escolaridad:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: pacienteCompleto.escolaridad || hojaFrontalData.escolaridad || 'No registrada', fontSize: 6 },
          ],
          [
            { text: 'Estado civil:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: pacienteCompleto.estado_civil || hojaFrontalData.estado_conyugal || 'No registrado', fontSize: 6 },
          ],
          [
            { text: 'Religión:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: pacienteCompleto.religion || hojaFrontalData.religion || 'No registrada', fontSize: 6 },
          ],
          [
            { text: 'Afiliación médica:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData.afiliacion_medica || 'Sin afiliación', fontSize: 6 },
          ],
          [
            { text: 'Número de afiliación:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData.numero_afiliacion || 'No aplica', fontSize: 6 },
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
              fontSize: 6,
              bold: true,
              fillColor: '#f5f5f5',
              alignment: 'center',
              colSpan: 2,
            },
            {},
          ],
          [
            { text: 'Nombre completo:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData?.contacto_emergencia_1?.nombre_completo || pacienteCompleto.familiar_responsable || 'No registrado', fontSize: 6 },
          ],
          [
            { text: 'Parentesco:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData?.contacto_emergencia_1?.parentesco || 'No especificado', fontSize: 6 },
          ],
          [
            { text: 'Teléfono principal:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData?.contacto_emergencia_1?.telefono_principal || pacienteCompleto.telefono_familiar || 'No registrado', fontSize: 6 },
          ],
          [
            { text: 'Teléfono secundario:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData?.contacto_emergencia_1?.telefono_secundario || 'No registrado', fontSize: 6 },
          ],
          [
            { text: 'Dirección:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData?.contacto_emergencia_1?.direccion || 'No registrada', fontSize: 6 },
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
              fontSize: 6,
              bold: true,
              fillColor: '#f5f5f5',
              alignment: 'center',
              colSpan: 2,
            },
            {},
          ],
          [
            { text: 'Alergias conocidas:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData.alergias_conocidas || 'Ninguna conocida', fontSize: 6 },
          ],
          [
            { text: 'Enfermedades crónicas:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData.enfermedades_cronicas || 'Ninguna registrada', fontSize: 6 },
          ],
          [
            { text: 'Medicamentos actuales:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData.medicamentos_actuales || 'Ninguno', fontSize: 6 },
          ],
          [
            { text: 'Antecedentes quirúrgicos:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData.antecedentes_quirurgicos || 'Ninguno', fontSize: 6 },
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
              fontSize: 6,
              bold: true,
              fillColor: '#f5f5f5',
              alignment: 'center',
              colSpan: 2,
            },
            {},
          ],
          [
            { text: 'Número de expediente:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: this.obtenerNumeroExpedientePreferido(expedienteData) || 'Sin asignar', fontSize: 7, bold: true },
          ],
          [
            { text: 'Fecha de apertura:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: this.formatearFecha(expedienteData.fecha_apertura) || fechaActual.toLocaleDateString('es-MX'), fontSize: 6 },
          ],
          [
            { text: 'Hora de apertura:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData.hora_apertura || fechaActual.toLocaleTimeString('es-MX'), fontSize: 6 },
          ],
          [
            { text: 'Folio hoja frontal:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: hojaFrontalData.folio || `HF-${fechaActual.getFullYear()}-${fechaActual.getTime().toString().slice(-6)}`, fontSize: 6 },
          ],
          [
            { text: 'Estado del expediente:', bold: true, fontSize: 6, fillColor: '#fafafa' },
            { text: expedienteData.estado || 'Activo', fontSize: 6 },
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
              fontSize: 6,
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
                { text: `${medicoCompleto.titulo_profesional || 'Dr.'} ${medicoCompleto.nombre_completo}\n\n`, fontSize: 7, bold: true },
                { text: `Cédula profesional: ${medicoCompleto.numero_cedula || 'No registrada'}\n`, fontSize: 6 },
                { text: `Especialidad: ${medicoCompleto.especialidad || 'Medicina General'}\n`, fontSize: 6 },
                { text: `Cargo: ${medicoCompleto.cargo || 'Médico'}\n`, fontSize: 6 },
                { text: `Departamento: ${medicoCompleto.departamento || 'No especificado'}\n\n`, fontSize: 6 },
                { text: `Fecha de elaboración: ${fechaActual.toLocaleDateString('es-MX')}\n`, fontSize: 6, color: '#666666' },
                { text: `Hora de elaboración: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 6, color: '#666666' },
              ],
              margin: [5, 10],
              alignment: 'center',
            },
            {
              text: '\n\n\n\n_____________________________\nFIRMA AUTÓGRAFA\n\n(Conforme a NOM-004-SSA3-2012)',
              fontSize: 6,
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


  // async generarSolicitudEstudio(datos: any): Promise<any> {
  //   console.log('📄 Generando Solicitud de Estudio...');

  //   const { pacienteCompleto, medicoCompleto, solicitudEstudio } = datos;
  //   const fechaActual = new Date();
  //   const tipoEstudio = solicitudEstudio.tipo_estudio || 'laboratorio';

  //   // Obtener título dinámico
  //   const tituloDocumento = this.obtenerTituloSolicitud(tipoEstudio);
  //   const iconoDocumento = this.obtenerIconoSolicitud(tipoEstudio);

  //   return {
  //     pageSize: 'LETTER',
  //     pageMargins: [40, 80, 40, 60],

  //     header: (currentPage: number, pageCount: number) => {
  //       return {
  //         margin: [40, 20, 40, 20],
  //         table: {
  //           widths: ['33%', '34%', '33%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'HOSPITAL GENERAL', fontSize: 12, bold: true },
  //                   { text: 'SAN LUIS DE LA PAZ', fontSize: 8, bold: true },
  //                   { text: 'GUANAJUATO, MÉXICO', fontSize: 6 },
  //                 ],
  //               },
  //               {
  //                 stack: [
  //                   {
  //                     text: `${iconoDocumento} ${tituloDocumento}`,
  //                     fontSize: 14,
  //                     bold: true,
  //                     alignment: 'center',
  //                     color: '#2563eb',
  //                   },
  //                   {
  //                     text: 'Cumplimiento NOM-004-SSA3-2012',
  //                     fontSize: 6,
  //                     alignment: 'center',
  //                     italics: true,
  //                     color: '#666666',
  //                     margin: [0, 5],
  //                   },
  //                 ],
  //               },
  //               {
  //                 stack: [
  //                   {
  //                     text: 'FECHA:',
  //                     fontSize: 6,
  //                     bold: true,
  //                     alignment: 'right',
  //                   },
  //                   {
  //                     text: fechaActual.toLocaleDateString('es-MX'),
  //                     fontSize: 8,
  //                     alignment: 'right',
  //                   },
  //                   {
  //                     text: `Folio: ${this.generarFolioSolicitud()}`,
  //                     fontSize: 6,
  //                     alignment: 'right',
  //                     margin: [0, 2],
  //                   },
  //                 ],
  //               },
  //             ],
  //           ],
  //         },
  //         layout: 'noBorders',
  //       };
  //     },

  //     content: [
  //       // SECCIÓN DATOS DEL PACIENTE
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: '👤 DATOS DEL PACIENTE',
  //                 style: 'sectionHeader',
  //                 fillColor: '#f3f4f6',
  //                 margin: [10, 8],
  //               },
  //             ],
  //           ],
  //         },
  //         layout: {
  //           hLineWidth: () => 1,
  //           vLineWidth: () => 1,
  //           hLineColor: () => '#d1d5db',
  //           vLineColor: () => '#d1d5db',
  //         },
  //         margin: [0, 0, 0, 10],
  //       },

  //       {
  //         table: {
  //           widths: ['25%', '25%', '25%', '25%'],
  //           body: [
  //             [
  //               { text: 'Nombre Completo:', style: 'fieldLabel' },
  //               {
  //                 text: pacienteCompleto.nombre_completo || 'N/A',
  //                 style: 'fieldValue',
  //               },
  //               { text: 'Expediente:', style: 'fieldLabel' },
  //               {
  //                 text: pacienteCompleto.numero_expediente || 'N/A',
  //                 style: 'fieldValue',
  //               },
  //             ],
  //             [
  //               { text: 'Edad:', style: 'fieldLabel' },
  //               {
  //                 text: `${pacienteCompleto.edad || 'N/A'} años`,
  //                 style: 'fieldValue',
  //               },
  //               { text: 'Sexo:', style: 'fieldLabel' },
  //               { text: pacienteCompleto.sexo || 'N/A', style: 'fieldValue' },
  //             ],
  //             [
  //               { text: 'Fecha Nacimiento:', style: 'fieldLabel' },
  //               {
  //                 text: this.formatearFecha(pacienteCompleto.fecha_nacimiento),
  //                 style: 'fieldValue',
  //               },
  //               { text: 'Tipo de Sangre:', style: 'fieldLabel' },
  //               {
  //                 text: pacienteCompleto.tipo_sangre || 'No especificado',
  //                 style: 'fieldValue',
  //               },
  //             ],
  //           ],
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15],
  //       },

  //       // SECCIÓN ESTUDIOS SOLICITADOS (DINÁMICO)
  //       this.generarSeccionEstudios(solicitudEstudio, tipoEstudio),

  //       // SECCIÓN INFORMACIÓN CLÍNICA
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: '🏥 INFORMACIÓN CLÍNICA',
  //                 style: 'sectionHeader',
  //                 fillColor: '#f3f4f6',
  //                 margin: [10, 8],
  //               },
  //             ],
  //           ],
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 15, 0, 10],
  //       },

  //       {
  //         table: {
  //           widths: ['50%', '50%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'INDICACIÓN CLÍNICA:', style: 'fieldLabel' },
  //                   {
  //                     text:
  //                       solicitudEstudio.indicacion_clinica ||
  //                       'No especificada',
  //                     style: 'fieldValue',
  //                     margin: [0, 5, 0, 10],
  //                   },
  //                 ],
  //               },
  //               {
  //                 stack: [
  //                   { text: 'DIAGNÓSTICO PRESUNTIVO:', style: 'fieldLabel' },
  //                   {
  //                     text:
  //                       solicitudEstudio.diagnostico_presuntivo ||
  //                       'No especificado',
  //                     style: 'fieldValue',
  //                     margin: [0, 5, 0, 10],
  //                   },
  //                 ],
  //               },
  //             ],
  //           ],
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15],
  //       },

  //       // SECCIÓN CONFIGURACIÓN
  //       {
  //         table: {
  //           widths: ['25%', '25%', '25%', '25%'],
  //           body: [
  //             [
  //               { text: 'Urgencia:', style: 'fieldLabel' },
  //               {
  //                 text: this.formatearUrgencia(solicitudEstudio.urgencia),
  //                 style: 'fieldValue',
  //               },
  //               { text: 'Fecha Programada:', style: 'fieldLabel' },
  //               {
  //                 text:
  //                   this.formatearFecha(solicitudEstudio.fecha_programada) ||
  //                   'No programada',
  //                 style: 'fieldValue',
  //               },
  //             ],
  //             [
  //               { text: 'Ayuno Requerido:', style: 'fieldLabel' },
  //               {
  //                 text: solicitudEstudio.ayuno_requerido ? 'SÍ' : 'NO',
  //                 style: 'fieldValue',
  //               },
  //               { text: 'Contraste:', style: 'fieldLabel' },
  //               {
  //                 text: solicitudEstudio.contraste_requerido ? 'SÍ' : 'NO',
  //                 style: 'fieldValue',
  //               },
  //             ],
  //           ],
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15],
  //       },

  //       // OBSERVACIONES
  //       ...(solicitudEstudio.observaciones
  //         ? [
  //           {
  //             table: {
  //               widths: ['100%'],
  //               body: [
  //                 [
  //                   {
  //                     stack: [
  //                       { text: 'OBSERVACIONES:', style: 'fieldLabel' },
  //                       {
  //                         text: solicitudEstudio.observaciones,
  //                         style: 'fieldValue',
  //                         margin: [0, 5],
  //                       },
  //                     ],
  //                     margin: [10, 8],
  //                   },
  //                 ],
  //               ],
  //             },
  //             layout: this.getTableLayout(),
  //             margin: [0, 0, 0, 20],
  //           },
  //         ]
  //         : []),

  //       // ESPACIADOR PARA FIRMAS
  //       { text: '', pageBreak: 'before' },

  //       // SECCIÓN FIRMAS
  //       {
  //         margin: [0, 40, 0, 0],
  //         table: {
  //           widths: ['50%', '50%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   {
  //                     text: '_'.repeat(40),
  //                     alignment: 'center',
  //                     margin: [0, 30, 0, 5],
  //                   },
  //                   { text: 'MÉDICO SOLICITANTE', style: 'signatureLabel' },
  //                   {
  //                     text: medicoCompleto.nombre_completo || 'N/A',
  //                     style: 'signatureName',
  //                   },
  //                   {
  //                     text: `Cédula: ${medicoCompleto.numero_cedula || 'N/A'}`,
  //                     style: 'signatureDetails',
  //                   },
  //                   {
  //                     text: `Especialidad: ${medicoCompleto.especialidad || 'N/A'
  //                       }`,
  //                     style: 'signatureDetails',
  //                   },
  //                 ],
  //               },
  //               {
  //                 stack: [
  //                   {
  //                     text: '_'.repeat(40),
  //                     alignment: 'center',
  //                     margin: [0, 30, 0, 5],
  //                   },
  //                   { text: 'RECIBIDO POR', style: 'signatureLabel' },
  //                   {
  //                     text: 'LABORATORIO/IMAGENOLOGÍA',
  //                     style: 'signatureName',
  //                   },
  //                   {
  //                     text: 'Fecha: ________________',
  //                     style: 'signatureDetails',
  //                     margin: [0, 10, 0, 0],
  //                   },
  //                   {
  //                     text: 'Hora: ________________',
  //                     style: 'signatureDetails',
  //                   },
  //                 ],
  //               },
  //             ],
  //           ],
  //         },
  //         layout: 'noBorders',
  //       },
  //     ],

  //     footer: (currentPage: number, pageCount: number) => {
  //       return {
  //         margin: [40, 10],
  //         table: {
  //           widths: ['33%', '34%', '33%'],
  //           body: [
  //             [
  //               {
  //                 text: `${tituloDocumento} - Hospital General San Luis de la Paz`,
  //                 fontSize: 6,
  //                 color: '#666666',
  //               },
  //               {
  //                 text: `Página ${currentPage} de ${pageCount}`,
  //                 fontSize: 6,
  //                 alignment: 'center',
  //                 color: '#666666',
  //               },
  //               {
  //                 text: fechaActual.toLocaleString('es-MX'),
  //                 fontSize: 6,
  //                 alignment: 'right',
  //                 color: '#666666',
  //               },
  //             ],
  //           ],
  //         },
  //         layout: 'noBorders',
  //       };
  //     },

  //     styles: {
  //       sectionHeader: {
  //         fontSize: 12,
  //         bold: true,
  //         color: '#374151',
  //       },
  //       fieldLabel: {
  //         fontSize: 7,
  //         bold: true,
  //         color: '#4b5563',
  //       },
  //       fieldValue: {
  //         fontSize: 7,
  //         color: '#111827',
  //       },
  //       signatureLabel: {
  //         fontSize: 8,
  //         bold: true,
  //         alignment: 'center',
  //         color: '#374151',
  //       },
  //       signatureName: {
  //         fontSize: 7,
  //         alignment: 'center',
  //         color: '#111827',
  //       },
  //       signatureDetails: {
  //         fontSize: 6,
  //         alignment: 'center',
  //         color: '#6b7280',
  //       },
  //       estudiosTitle: {
  //         fontSize: 8,
  //         bold: true,
  //         color: '#1f2937',
  //         margin: [0, 0, 0, 5],
  //       },
  //       estudioItem: {
  //         fontSize: 7,
  //         margin: [0, 2, 0, 2],
  //       },
  //     },
  //   };
  // }


// C:\Proyectos\CICEG-HG_Frontend\src\app\services\pdf\PdfTemplatesService.ts
  
// C:\Proyectos\CICEG-HG_Frontend\src\app\services\pdf\PdfTemplatesService.ts
// async generarSolicitudEstudio(datos: any): Promise<any> {
//   console.log('📄 Generando Solicitud de Estudio - Estilo Profesional...');

//   const { pacienteCompleto, medicoCompleto, solicitudEstudio } = datos;
//   const fechaActual = new Date();
//   const tipoEstudio = solicitudEstudio.tipo_estudio || 'laboratorio';
  
//   // 🔥 OBTENER CONFIGURACIÓN INTELIGENTE DE LOGOS
//   const configuracion = await this.obtenerConfiguracionLogosInteligente();

//   // Obtener título dinámico
//   const tituloDocumento = this.obtenerTituloSolicitud(tipoEstudio);
//   const iconoDocumento = this.obtenerIconoSolicitud(tipoEstudio);

//   return {
//     pageSize: 'LETTER',
//     pageMargins: [20, 60, 20, 40],

//     header: {
//       margin: [20, 10, 20, 10],
//       table: {
//         widths: ['20%', '60%', '20%'],
//         body: [
//           [
//             {
//               // Logo de gobierno (izquierda)
//               image: await this.obtenerImagenBase64(
//                 datos.configuracion?.logo_gobierno ||
//                 configuracion.logo_gobierno
//               ),
//               fit: [80, 40],
//               alignment: 'left',
//               margin: [0, 5],
//             },
//             {
//               // Texto central
//               text: `HOSPITAL GENERAL SAN LUIS DE LA PAZ - ${tituloDocumento}`,
//               fontSize: 8,
//               bold: true,
//               alignment: 'center',
//               color: '#1a365d',
//               margin: [0, 8],
//             },
//             {
//               // Logo del hospital (derecha)
//               image: await this.obtenerImagenBase64(
//                 datos.configuracion?.logo_principal ||
//                 configuracion.logo_principal
//               ),
//               fit: [80, 40],
//               alignment: 'right',
//               margin: [0, 5],
//             },
//           ],
//         ],
//       },
//       layout: 'noBorders',
//     },

//     content: [
//       // IDENTIFICACIÓN Y DATOS BÁSICOS
//       {
//         table: {
//           widths: ['15%', '85%'],
//           body: [
//             [
//               {
//                 text: 'IDENTIFICACIÓN',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f5f5f5',
//                 alignment: 'center',
//                 rowSpan: 3,
//               },
//               {
//                 table: {
//                   widths: ['20%', '20%', '20%', '20%', '20%'],
//                   body: [
//                     [
//                       { text: 'Fecha solicitud', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Hora solicitud', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'No. Expediente', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Folio', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Urgencia', fontSize: 7, bold: true, alignment: 'center' },
//                     ],
//                     [
//                       { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'center' },
//                       { text: fechaActual.toLocaleTimeString('es-MX'), fontSize: 7, alignment: 'center' },
//                       { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto) || 'N/A', fontSize: 7, alignment: 'center', bold: true },
//                       { text: this.generarFolioSolicitud(), fontSize: 7, alignment: 'center', bold: true, color: '#2563eb' },
//                       { text: this.formatearUrgencia(solicitudEstudio.urgencia), fontSize: 7, alignment: 'center', color: solicitudEstudio.urgencia === 'urgente' ? '#dc2626' : '#059669' },
//                     ],
//                   ],
//                 },
//                 layout: {
//                   hLineWidth: () => 0.3,
//                   vLineWidth: () => 0.3,
//                   hLineColor: () => '#000000',
//                   vLineColor: () => '#000000',
//                 },
//               },
//             ],
//             [
//               {},
//               {
//                 table: {
//                   widths: ['55%', '15%', '15%', '15%'],
//                   body: [
//                     [
//                       { text: 'Nombre completo del paciente', fontSize: 7, bold: true },
//                       { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Tipo de sangre', fontSize: 7, bold: true, alignment: 'center' },
//                     ],
//                     [
//                       { text: pacienteCompleto.nombre_completo, fontSize: 6, bold: true, margin: [2, 3] },
//                       { text: `${pacienteCompleto.edad} años`, fontSize: 7, alignment: 'center' },
//                       { text: pacienteCompleto.sexo, fontSize: 7, alignment: 'center' },
//                       { text: pacienteCompleto.tipo_sangre || 'No especificado', fontSize: 7, alignment: 'center', bold: true, color: '#dc2626' },
//                     ],
//                   ],
//                 },
//                 layout: {
//                   hLineWidth: () => 0.3,
//                   vLineWidth: () => 0.3,
//                   hLineColor: () => '#000000',
//                   vLineColor: () => '#000000',
//                 },
//               },
//             ],
//             [
//               {},
//               {
//                 table: {
//                   widths: ['50%', '25%', '25%'],
//                   body: [
//                     [
//                       { text: 'Médico solicitante', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Cédula profesional', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Especialidad', fontSize: 7, bold: true, alignment: 'center' },
//                     ],
//                     [
//                       { text: medicoCompleto.nombre_completo || 'No especificado', fontSize: 7, alignment: 'center' },
//                       { text: medicoCompleto.numero_cedula || 'No registrada', fontSize: 7, alignment: 'center' },
//                       { text: medicoCompleto.especialidad || 'N/A', fontSize: 7, alignment: 'center' },
//                     ],
//                   ],
//                 },
//                 layout: {
//                   hLineWidth: () => 0.3,
//                   vLineWidth: () => 0.3,
//                   hLineColor: () => '#000000',
//                   vLineColor: () => '#000000',
//                 },
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//       },

//       { text: '', margin: [0, 2] },

//       // ESTUDIOS SOLICITADOS (DINÁMICO)
//       {
//         table: {
//           widths: ['15%', '85%'],
//           body: [
//             [
//               {
//                 text: 'ESTUDIOS SOLICITADOS',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f5f5f5',
//                 alignment: 'center',
//                 rowSpan: 2,
//               },
//               {
//                 text: `${iconoDocumento} ${this.obtenerTituloSeccionEstudios(tipoEstudio)}`,
//                 fontSize: 7,
//                 bold: true,
//                 fillColor: '#fafafa',
//               },
//             ],
//             [
//               {},
//               {
//                 text: this.construirTextoEstudiosSeleccionados(solicitudEstudio, tipoEstudio),
//                 fontSize: 7,
//                 margin: [5, 8],
//                 lineHeight: 1.3,
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//       },

//       { text: '', margin: [0, 2] },

//       // INFORMACIÓN CLÍNICA
//       {
//         table: {
//           widths: ['15%', '85%'],
//           body: [
//             [
//               {
//                 text: 'INFORMACIÓN CLÍNICA',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f5f5f5',
//                 alignment: 'center',
//                 rowSpan: 4,
//               },
//               {
//                 text: 'INDICACIÓN CLÍNICA',
//                 fontSize: 7,
//                 bold: true,
//                 fillColor: '#fafafa',
//               },
//             ],
//             [
//               {},
//               {
//                 text: solicitudEstudio.indicacion_clinica || 'No especificada',
//                 fontSize: 7,
//                 margin: [5, 8],
//                 lineHeight: 1.3,
//               },
//             ],
//             [
//               {},
//               {
//                 text: 'DIAGNÓSTICO PRESUNTIVO',
//                 fontSize: 7,
//                 bold: true,
//                 fillColor: '#fafafa',
//               },
//             ],
//             [
//               {},
//               {
//                 text: solicitudEstudio.diagnostico_presuntivo || 'No especificado',
//                 fontSize: 7,
//                 margin: [5, 8],
//                 lineHeight: 1.3,
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//       },

//       { text: '', margin: [0, 2] },

//       // CONFIGURACIÓN DEL ESTUDIO
//       {
//         table: {
//           widths: ['15%', '85%'],
//           body: [
//             [
//               {
//                 text: 'CONFIGURACIÓN',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f5f5f5',
//                 alignment: 'center',
//                 rowSpan: 2,
//               },
//               {
//                 table: {
//                   widths: ['25%', '25%', '25%', '25%'],
//                   body: [
//                     [
//                       { text: 'Fecha programada', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Ayuno requerido', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Contraste', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Sedación', fontSize: 7, bold: true, alignment: 'center' },
//                     ],
//                     [
//                       { text: this.formatearFecha(solicitudEstudio.fecha_programada) || 'No programada', fontSize: 7, alignment: 'center' },
//                       { text: solicitudEstudio.ayuno_requerido ? 'SÍ' : 'NO', fontSize: 7, alignment: 'center', color: solicitudEstudio.ayuno_requerido ? '#dc2626' : '#059669', bold: true },
//                       { text: solicitudEstudio.contraste_requerido ? 'SÍ' : 'NO', fontSize: 7, alignment: 'center', color: solicitudEstudio.contraste_requerido ? '#dc2626' : '#059669', bold: true },
//                       { text: solicitudEstudio.sedacion_requerida ? 'SÍ' : 'NO', fontSize: 7, alignment: 'center', color: solicitudEstudio.sedacion_requerida ? '#dc2626' : '#059669', bold: true },
//                     ],
//                   ],
//                 },
//                 layout: {
//                   hLineWidth: () => 0.3,
//                   vLineWidth: () => 0.3,
//                   hLineColor: () => '#000000',
//                   vLineColor: () => '#000000',
//                 },
//               },
//             ],
//             [
//               {},
//               {
//                 text: 'OBSERVACIONES ESPECIALES',
//                 fontSize: 7,
//                 bold: true,
//                 fillColor: '#fafafa',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//       },

//       // OBSERVACIONES (si existen)
//       ...(solicitudEstudio.observaciones ? [
//         {
//           table: {
//             widths: ['100%'],
//             body: [
//               [
//                 {
//                   text: `OBSERVACIONES: ${solicitudEstudio.observaciones}`,
//                   fontSize: 6,
//                   bold: true,
//                   fillColor: '#f8f8f8',
//                   margin: [5, 8],
//                   alignment: 'center',
//                   lineHeight: 1.1,
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
//           margin: [0, 2, 0, 0],
//         },
//       ] : []),

//       { text: '', margin: [0, 10] },

//       // FIRMAS
//       {
//         table: {
//           widths: ['50%', '50%'],
//           body: [
//             [
//               {
//                 text: 'MÉDICO SOLICITANTE',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f5f5f5',
//                 alignment: 'center',
//                 margin: [2, 5],
//               },
//               {
//                 text: 'RECIBIDO POR LABORATORIO/IMAGENOLOGÍA',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f5f5f5',
//                 alignment: 'center',
//                 margin: [2, 5],
//               },
//             ],
//             [
//               {
//                 text: [
//                   {
//                     text: `${medicoCompleto.titulo_profesional || 'Dr.'} ${medicoCompleto.nombre_completo}\n`,
//                     fontSize: 7,
//                     bold: true,
//                   },
//                   {
//                     text: `Cédula Profesional: ${medicoCompleto.numero_cedula || 'No registrada'}\n`,
//                     fontSize: 6,
//                   },
//                   {
//                     text: `Especialidad: ${medicoCompleto.especialidad || 'N/A'}\n`,
//                     fontSize: 6,
//                   },
//                   {
//                     text: `${medicoCompleto.cargo || 'Médico'} - ${medicoCompleto.departamento || 'N/A'}\n`,
//                     fontSize: 6,
//                   },
//                   {
//                     text: `\n\n_________________________\n`,
//                     fontSize: 6,
//                   },
//                   {
//                     text: `FIRMA DEL MÉDICO\n`,
//                     fontSize: 7,
//                     bold: true,
//                   },
//                   {
//                     text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}\n`,
//                     fontSize: 7,
//                   },
//                   {
//                     text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`,
//                     fontSize: 7,
//                   },
//                 ],
//                 margin: [5, 20],
//                 alignment: 'center',
//               },
//               {
//                 text: [
//                   {
//                     text: 'SERVICIO DE LABORATORIO/IMAGENOLOGÍA\n',
//                     fontSize: 7,
//                     bold: true,
//                   },
//                   {
//                     text: 'Hospital General San Luis de la Paz\n',
//                     fontSize: 6,
//                   },
//                   {
//                     text: '\n\n_________________________\n',
//                     fontSize: 6,
//                   },
//                   {
//                     text: 'RECIBIDO POR\n',
//                     fontSize: 7,
//                     bold: true,
//                   },
//                   {
//                     text: 'Fecha recepción: _______________\n',
//                     fontSize: 7,
//                   },
//                   {
//                     text: 'Hora recepción: _______________\n',
//                     fontSize: 7,
//                   },
//                   {
//                     text: '(NOM-004-SSA3-2012)',
//                     fontSize: 6,
//                     italics: true,
//                   },
//                 ],
//                 margin: [5, 20],
//                 alignment: 'center',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//       },

//       { text: '', margin: [0, 5] },

//       // NOTAS AL PIE
//       {
//         columns: [
//           {
//             width: '50%',
//             text: [
//               {
//                 text: '* Elaborado conforme a:\n',
//                 fontSize: 6,
//                 italics: true,
//                 color: '#666666',
//               },
//               {
//                 text: '• NOM-004-SSA3-2012 Del expediente clínico\n',
//                 fontSize: 6,
//                 color: '#666666',
//               },
//               {
//                 text: '• Solicitud de estudios auxiliares de diagnóstico\n',
//                 fontSize: 6,
//                 color: '#666666',
//               },
//               {
//                 text: '• Justificación clínica adecuada',
//                 fontSize: 6,
//                 color: '#666666',
//               },
//             ],
//             alignment: 'left',
//           },
//           {
//             width: '50%',
//             text: [
//               {
//                 text: 'Sistema Integral Clínico de Expedientes y Gestión (SICEG)\n',
//                 fontSize: 6,
//                 italics: true,
//                 color: '#666666',
//               },
//               {
//                 text: `Documento generado: ${fechaActual.toLocaleString('es-MX')}\n`,
//                 fontSize: 6,
//                 color: '#666666',
//               },
//               {
//                 text: 'Hospital General San Luis de la Paz, Guanajuato',
//                 fontSize: 6,
//                 color: '#666666',
//               },
//             ],
//             alignment: 'right',
//           },
//         ],
//       },
//     ],

//     footer: (currentPage: number, pageCount: number) => {
//       return {
//         margin: [20, 10],
//         table: {
//           widths: ['25%', '50%', '25%'],
//           body: [
//             [
//               {
//                 text: `Página ${currentPage} de ${pageCount}`,
//                 fontSize: 7,
//                 color: '#666666',
//               },
//               {
//                 text: `${tituloDocumento} - SICEG\nNOM-004-SSA3-2012 • Auxiliares de Diagnóstico`,
//                 fontSize: 7,
//                 alignment: 'center',
//                 color: '#666666',
//               },
//               {
//                 text: [
//                   {
//                     text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
//                     fontSize: 7,
//                   },
//                   {
//                     text: `Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
//                     fontSize: 6,
//                   },
//                 ],
//                 alignment: 'right',
//                 color: '#666666',
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//       };
//     },
//   };
// }


async generarSolicitudEstudio(datos: any): Promise<any> {
  console.log('📄 Generando Solicitud de Estudio Inteligente...');

  const { pacienteCompleto, medicoCompleto, solicitudEstudio } = datos;
  const fechaActual = new Date();
  const tipoEstudio = solicitudEstudio.tipo_estudio || 'laboratorio';
  
  // 🔥 OBTENER CONFIGURACIÓN INTELIGENTE DE LOGOS
  const configuracion = await this.obtenerConfiguracionLogosInteligente();

  // DECIDIR QUÉ FORMATO GENERAR
  if (tipoEstudio === 'imagenologia') {
    return this.generarSolicitudImagenologia(datos);
  } else {
    return this.generarSolicitudLaboratorio(datos);
  }
}

// 📋 SOLICITUD DE LABORATORIO (FORMATO DETALLADO CON CÓDIGOS)
async generarSolicitudLaboratorio(datos: any): Promise<any> {
  console.log('Generando Solicitud de Laboratorio - Formato Profesional...');

  const { pacienteCompleto, medicoCompleto, solicitudEstudio } = datos;
  const fechaActual = new Date();
  const configuracion = await this.obtenerConfiguracionLogosInteligente();

  // 🔥 HEADER ESTÁNDAR (igual que Historia Clínica)
  const header = {
    margin: [20, 10, 20, 10],
    table: {
      widths: ['20%', '60%', '20%'],
      body: [
        [
          {
            image: await this.obtenerImagenBase64(
              datos.configuracion?.logo_gobierno ||
              configuracion.logo_gobierno ||
              '/uploads/logos/logo-gobierno-importado.svg'
            ),
            fit: [80, 40],
            alignment: 'left',
            margin: [0, 5],
          },
          {
            text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ\nSOLICITUD DE ESTUDIOS DE LABORATORIO\nNOM-004-SSA3-2012',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            color: '#1a365d',
            margin: [0, 8],
          },
          {
            image: await this.obtenerImagenBase64(
              datos.configuracion?.logo_principal ||
              configuracion.logo_principal ||
              '/uploads/logos/logo-principal-importado.svg'
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

  return {
    pageSize: 'LETTER',
    pageMargins: [20, 80, 20, 50],
    header,

    content: [
      { text: '', margin: [0, 5] },

      // 🔥 TABLA IDENTIFICACIÓN (ESTILO ESTÁNDAR)
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'IDENTIFICACIÓN',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 3,
              },
              {
                table: {
                  widths: ['20%', '20%', '20%', '20%', '20%'],
                  body: [
                    [
                      { text: 'Fecha solicitud', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Hora solicitud', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'No. Expediente', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Servicio', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Urgencia', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: solicitudEstudio.fecha_solicitud || fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'center' },
                      { text: solicitudEstudio.hora_solicitud || fechaActual.toLocaleTimeString('es-MX'), fontSize: 7, alignment: 'center' },
                      { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto) || 'N/A', fontSize: 7, alignment: 'center', bold: true },
                      { text: solicitudEstudio.servicio_solicitante || 'NO ESPECIFICADO', fontSize: 7, alignment: 'center' },
                      { text: this.formatearUrgencia(solicitudEstudio.urgencia), fontSize: 7, alignment: 'center', color: solicitudEstudio.urgencia === 'urgente' ? '#dc2626' : '#059669', bold: true },
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
                  widths: ['55%', '15%', '15%', '15%'],
                  body: [
                    [
                      { text: 'Nombre completo del paciente', fontSize: 7, bold: true },
                      { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'No. Cama', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: pacienteCompleto.nombre_completo, fontSize: 6, bold: true, margin: [2, 3] },
                      { text: `${pacienteCompleto.edad} años`, fontSize: 7, alignment: 'center' },
                      { text: pacienteCompleto.sexo, fontSize: 7, alignment: 'center' },
                      { text: solicitudEstudio.numero_cama || 'c. ext', fontSize: 7, alignment: 'center' },
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
                      { text: 'CURP del paciente', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Fecha próxima consulta', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'No. CAUSES', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: pacienteCompleto.curp || 'No registrado', fontSize: 6, alignment: 'center' },
                      { text: this.formatearFecha(solicitudEstudio.fecha_proxima_consulta) || 'No programada', fontSize: 7, alignment: 'center' },
                      { text: solicitudEstudio.numero_intervencion_causes || 'N/A', fontSize: 7, alignment: 'center' },
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

      { text: '', margin: [0, 2] },

      // 🔥 TABLA ESTUDIOS SOLICITADOS (ESTILO ESTÁNDAR)
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'ESTUDIOS SOLICITADOS',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 2,
              },
              {
                text: 'ESTUDIOS DE LABORATORIO CON CÓDIGOS',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                table: {
                  widths: ['50%', '50%'],
                  body: [
                    // HEMATOLOGÍA e INMUNOHEMATOLOGÍA
                    [
                      {
                        stack: [
                          { text: 'HEMATOLOGÍA', fontSize: 7, bold: true, margin: [0, 0, 0, 3], color: '#000000ff' },
                          ...this.construirEstudiosHematologia(solicitudEstudio),
                        ],
                      },
                      {
                        stack: [
                          { text: 'INMUNOHEMATOLOGÍA', fontSize: 7, bold: true, margin: [0, 0, 0, 3], color: '#000000ff' },
                          ...this.construirEstudiosInmunohematologia(solicitudEstudio),
                        ],
                      },
                    ],
                    // COAGULACIÓN e BIOQUÍMICA CLÍNICA
                    [
                      {
                        stack: [
                          { text: 'COAGULACIÓN', fontSize: 7, bold: true, margin: [0, 8, 0, 3], color: '#000000ff' },
                          ...this.construirEstudiosCoagulacion(solicitudEstudio),
                        ],
                      },
                      {
                        stack: [
                          { text: 'BIOQUÍMICA CLÍNICA', fontSize: 7, bold: true, margin: [0, 8, 0, 3], color: '#000000ff' },
                          ...this.construirEstudiosBioquimica(solicitudEstudio),
                        ],
                      },
                    ],
                    // PAQUETES e URIANÁLISIS
                    [
                      {
                        stack: [
                          { text: 'PAQUETES', fontSize: 7, bold: true, margin: [0, 8, 0, 3], color: '#000000ff' },
                          ...this.construirEstudiosPaquetes(solicitudEstudio),
                        ],
                      },
                      {
                        stack: [
                          { text: 'URIANÁLISIS', fontSize: 7, bold: true, margin: [0, 8, 0, 3], color: '#000000ff' },
                          ...this.construirEstudiosUrianalisis(solicitudEstudio),
                        ],
                      },
                    ],
                    // INMUNOLOGÍA e PERFIL CARDÍACO
                    [
                      {
                        stack: [
                          { text: 'INMUNOLOGÍA', fontSize: 7, bold: true, margin: [0, 8, 0, 3], color: '#000000ff' },
                          ...this.construirEstudiosInmunologia(solicitudEstudio),
                        ],
                      },
                      {
                        stack: [
                          { text: 'PERFIL CARDÍACO', fontSize: 7, bold: true, margin: [0, 8, 0, 3], color: '#0a0a0aff' },
                          ...this.construirEstudiosPerfilCardiaco(solicitudEstudio),
                        ],
                      },
                    ],
                    // PARASITOLOGÍA
                    [
                      {
                        stack: [
                          { text: 'PARASITOLOGÍA', fontSize: 7, bold: true, margin: [0, 8, 0, 3], color: '#000000ff' },
                          ...this.construirEstudiosParasitologia(solicitudEstudio),
                        ],
                        colSpan: 2,
                      },
                      {},
                    ],
                    // OTROS ESTUDIOS
                    [
                      {
                        stack: [
                          { text: 'OTROS ESTUDIOS', fontSize: 7, bold: true, margin: [0, 8, 0, 3], color: '#000000ff' },
                          { text: solicitudEstudio.otros_estudios || 'No se especificaron otros estudios', fontSize: 6, margin: [0, 2] },
                        ],
                        colSpan: 2,
                      },
                      {},
                    ],
                  ],
                },
                layout: 'noBorders',
                margin: [5, 5],
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

      // 🔥 TABLA INFORMACIÓN CLÍNICA (ESTILO ESTÁNDAR)
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'INFORMACIÓN CLÍNICA',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 4,
              },
              {
                text: 'DIAGNÓSTICO PRESUNTIVO',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: solicitudEstudio.diagnostico_presuntivo || 'No especificado',
                fontSize: 7,
                margin: [5, 8],
                lineHeight: 1.3,
              },
            ],
            [
              {},
              {
                text: 'INDICACIÓN CLÍNICA',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: solicitudEstudio.indicacion_clinica || 'No especificada',
                fontSize: 7,
                margin: [5, 8],
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

      { text: '', margin: [0, 2] },

      // 🔥 TABLA CONTROL DE HORARIOS (ESTILO ESTÁNDAR)
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'CONTROL DE HORARIOS',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 2,
              },
              {
                text: 'HORARIOS DE TOMA, RECEPCIÓN Y ENTREGA',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                table: {
                  widths: ['33%', '34%', '33%'],
                  body: [
                    [
                      { text: 'HORA DE TOMA DE MUESTRA', fontSize: 6, bold: true, alignment: 'center' },
                      { text: 'HORA DE RECEPCIÓN DE LA MUESTRA', fontSize: 6, bold: true, alignment: 'center' },
                      { text: 'HORA DE ENTREGA DE RESULTADOS', fontSize: 6, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: solicitudEstudio.hora_toma_muestra || '_____________', fontSize: 7, alignment: 'center' },
                      { text: solicitudEstudio.hora_recepcion_muestra || '_____________', fontSize: 7, alignment: 'center' },
                      { text: solicitudEstudio.hora_entrega_resultados || '_____________', fontSize: 7, alignment: 'center' },
                    ],
                  ],
                },
                layout: {
                  hLineWidth: () => 0.3,
                  vLineWidth: () => 0.3,
                  hLineColor: () => '#000000',
                  vLineColor: () => '#000000',
                },
                margin: [5, 5],
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

      // 🔥 TABLA FIRMA MÉDICA (ESTILO ESTÁNDAR)
      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              {
                text: 'MÉDICO SOLICITANTE',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
              {
                text: 'RECIBIDO POR LABORATORIO',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
            ],
            [
              {
                text: [
                  {
                    text: `${medicoCompleto.titulo_profesional || 'Dr.'} ${medicoCompleto.nombre_completo}\n`,
                    fontSize: 7,
                    bold: true,
                  },
                  {
                    text: `Cédula Profesional: ${medicoCompleto.numero_cedula || 'No registrada'}\n`,
                    fontSize: 6,
                  },
                  {
                    text: `Especialidad: ${medicoCompleto.especialidad || 'N/A'}\n`,
                    fontSize: 6,
                  },
                  {
                    text: `${medicoCompleto.cargo || 'Médico'} - ${medicoCompleto.departamento || 'N/A'}\n`,
                    fontSize: 6,
                  },
                  {
                    text: `\n\n_________________________\n`,
                    fontSize: 6,
                  },
                  {
                    text: `FIRMA DEL MÉDICO\n`,
                    fontSize: 7,
                    bold: true,
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
                margin: [5, 20],
                alignment: 'center',
              },
              {
                text: [
                  {
                    text: 'SERVICIO DE LABORATORIO\n',
                    fontSize: 7,
                    bold: true,
                  },
                  {
                    text: 'Hospital General San Luis de la Paz\n',
                    fontSize: 6,
                  },
                  {
                    text: '\n\n_________________________\n',
                    fontSize: 6,
                  },
                  {
                    text: 'RECIBIDO POR\n',
                    fontSize: 7,
                    bold: true,
                  },
                  {
                    text: 'Fecha recepción: _______________\n',
                    fontSize: 7,
                  },
                  {
                    text: 'Hora recepción: _______________\n',
                    fontSize: 7,
                  },
                  {
                    text: '(NOM-004-SSA3-2012)',
                    fontSize: 6,
                    italics: true,
                  },
                ],
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

      { text: '', margin: [0, 15] },

      // 🔥 NOTAS AL PIE (ESTILO ESTÁNDAR)
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
                text: '• Solicitud de estudios auxiliares de diagnóstico\n',
                fontSize: 6,
                color: '#666666',
              },
              {
                text: '• Justificación clínica adecuada',
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
                text: `Documento generado: ${fechaActual.toLocaleString('es-MX')}\n`,
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
                text: 'Solicitud de Estudios de Laboratorio - SICEG\nNOM-004-SSA3-2012 • Auxiliares de Diagnóstico',
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
                    text: `Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
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

// 📷 SOLICITUD DE IMAGENOLOGÍA/RX (FORMATO PROFESIONAL ESTÁNDAR)
async generarSolicitudImagenologia(datos: any): Promise<any> {
  console.log('📷 Generando Solicitud de Imagenología - Formato Profesional...');

  const { pacienteCompleto, medicoCompleto, solicitudEstudio } = datos;
  const fechaActual = new Date();
  const configuracion = await this.obtenerConfiguracionLogosInteligente();

  // 🔥 HEADER ESTÁNDAR
  const header = {
    margin: [20, 10, 20, 10],
    table: {
      widths: ['20%', '60%', '20%'],
      body: [
        [
          {
            image: await this.obtenerImagenBase64(
              datos.configuracion?.logo_gobierno ||
              configuracion.logo_gobierno ||
              '/uploads/logos/logo-gobierno-importado.svg'
            ),
            fit: [80, 40],
            alignment: 'left',
            margin: [0, 5],
          },
          {
            text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ\nSOLICITUD DE ESTUDIOS DE IMAGENOLOGÍA\nNOM-004-SSA3-2012',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            color: '#1a365d',
            margin: [0, 8],
          },
          {
            image: await this.obtenerImagenBase64(
              datos.configuracion?.logo_principal ||
              configuracion.logo_principal ||
              '/uploads/logos/logo-principal-importado.svg'
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

  return {
    pageSize: 'LETTER',
    pageMargins: [20, 80, 20, 50],
    header,

    content: [
      { text: '', margin: [0, 5] },

      // 🔥 TABLA IDENTIFICACIÓN (ESTILO ESTÁNDAR)
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'IDENTIFICACIÓN',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 3,
              },
              {
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: [
                    [
                      { text: 'FECHA:', fontSize: 7, bold: true },
                      { text: solicitudEstudio.fecha_solicitud || fechaActual.toLocaleDateString('es-MX'), fontSize: 7 },
                      { text: 'HORA:', fontSize: 7, bold: true },
                      { text: solicitudEstudio.hora_solicitud || fechaActual.toLocaleTimeString('es-MX'), fontSize: 7 },
                    ],
                  ],
                },
                layout: 'noBorders',
              },
            ],
            [
              {},
              {
                table: {
                  widths: ['40%', '20%', '20%', '20%'],
                  body: [
                    [
                      { text: 'NOMBRE DEL PACIENTE', fontSize: 7, bold: true },
                      { text: 'EDAD', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'SEXO', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'SERVICIO', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: pacienteCompleto.nombre_completo, fontSize: 7, bold: true },
                      { text: `${pacienteCompleto.edad} AÑOS`, fontSize: 7, alignment: 'center' },
                      { text: pacienteCompleto.sexo?.toUpperCase(), fontSize: 7, alignment: 'center' },
                      { text: solicitudEstudio.servicio_solicitante || 'NO ESPECIFICADO', fontSize: 7, alignment: 'center' },
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
                      { text: 'CURP', fontSize: 7, bold: true },
                      { text: 'No. CAMA', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'No. EXPEDIENTE', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: pacienteCompleto.curp || 'No registrado', fontSize: 6 },
                      { text: solicitudEstudio.numero_cama || 'c. ext', fontSize: 7, alignment: 'center' },
                      { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto) || 'N/A', fontSize: 7, alignment: 'center', bold: true },
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

      { text: '', margin: [0, 2] },

      // 🔥 TABLA DIAGNÓSTICO (ESTILO ESTÁNDAR)
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'DIAGNÓSTICO',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 4,
              },
              {
                text: 'DIAGNÓSTICO CON CLAVE CIE10',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: solicitudEstudio.diagnostico_cie10 || 'NO ESPECIFICADO',
                fontSize: 7,
                margin: [5, 8],
                lineHeight: 1.3,
              },
            ],
            [
             {},
             {
               text: 'INTERVENCIÓN DE CAUSES',
               fontSize: 7,
               bold: true,
               fillColor: '#fafafa',
             },
           ],
           [
             {},
             {
               text: solicitudEstudio.intervencion_causes || 'No aplica',
               fontSize: 7,
               margin: [5, 8],
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

     { text: '', margin: [0, 2] },

     // 🔥 TABLA ESTUDIOS SOLICITADOS (ESTILO ESTÁNDAR)
     {
       table: {
         widths: ['15%', '85%'],
         body: [
           [
             {
               text: 'ESTUDIOS SOLICITADOS',
               fontSize: 6,
               bold: true,
               fillColor: '#f5f5f5',
               alignment: 'center',
               rowSpan: 2,
             },
             {
               text: '📷 ESTUDIOS DE IMAGENOLOGÍA',
               fontSize: 7,
               bold: true,
               fillColor: '#fafafa',
             },
           ],
           [
             {},
             {
               text: solicitudEstudio.estudios_imagenologia || 'NO ESPECIFICADOS',
               fontSize: 7,
               bold: true,
               margin: [5, 8],
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

     { text: '', margin: [0, 10] },

     // 🔥 TABLA FIRMAS DE RECEPCIÓN (ESTILO ESTÁNDAR)
     {
       table: {
         widths: ['50%', '50%'],
         body: [
           [
             {
               text: 'MÉDICO SOLICITANTE',
               fontSize: 6,
               bold: true,
               fillColor: '#f5f5f5',
               alignment: 'center',
               margin: [2, 5],
             },
             {
               text: 'CONTROL DE RECEPCIÓN',
               fontSize: 6,
               bold: true,
               fillColor: '#f5f5f5',
               alignment: 'center',
               margin: [2, 5],
             },
           ],
           [
             {
               text: [
                 {
                   text: `${medicoCompleto.titulo_profesional || 'Dr.'} ${medicoCompleto.nombre_completo}\n`,
                   fontSize: 7,
                   bold: true,
                 },
                 {
                   text: `Cédula Profesional: ${medicoCompleto.numero_cedula || 'No registrada'}\n`,
                   fontSize: 6,
                 },
                 {
                   text: `Especialidad: ${medicoCompleto.especialidad || 'N/A'}\n`,
                   fontSize: 6,
                 },
                 {
                   text: `${medicoCompleto.cargo || 'Médico'} - ${medicoCompleto.departamento || 'N/A'}\n`,
                   fontSize: 6,
                 },
                 {
                   text: `\n\n_________________________\n`,
                   fontSize: 6,
                 },
                 {
                   text: `FIRMA DEL MÉDICO\n`,
                   fontSize: 7,
                   bold: true,
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
               margin: [5, 20],
               alignment: 'center',
             },
             {
               table: {
                 widths: ['100%'],
                 body: [
                   [
                     {
                       text: 'Firma y hora que recibe (camillero)',
                       fontSize: 6,
                       bold: true,
                       alignment: 'center',
                       margin: [0, 5, 0, 2],
                     },
                   ],
                   [
                     {
                       text: solicitudEstudio.hora_recibe_camillero || '_________________',
                       fontSize: 7,
                       alignment: 'center',
                       margin: [0, 10],
                     },
                   ],
                   [
                     {
                       text: 'Firma y hora que recibe (técnico de rayos X)',
                       fontSize: 6,
                       bold: true,
                       alignment: 'center',
                       margin: [0, 15, 0, 2],
                     },
                   ],
                   [
                     {
                       text: solicitudEstudio.hora_recibe_tecnico || '_________________',
                       fontSize: 7,
                       alignment: 'center',
                       margin: [0, 10],
                     },
                   ],
                 ],
               },
               layout: 'noBorders',
               margin: [5, 10],
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

     { text: '', margin: [0, 15] },

     // 🔥 NOTAS AL PIE (ESTILO ESTÁNDAR)
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
               text: '• Solicitud de estudios de imagenología\n',
               fontSize: 6,
               color: '#666666',
             },
             {
               text: '• Justificación clínica adecuada',
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
               text: `Documento generado: ${fechaActual.toLocaleString('es-MX')}\n`,
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
               text: 'Solicitud de Estudios de Imagenología - SICEG\nNOM-004-SSA3-2012 • Auxiliares de Diagnóstico',
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
                   text: `Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
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


// ==========================================
// MÉTODOS AUXILIARES PARA SOLICITUD DE LABORATORIO
// ==========================================

private construirEstudiosHematologia(solicitud: any): any[] {
  const estudios = [
    { campo: 'biometria_hematica', texto: 'BIOMETRIA HEMATICA (20109)', codigo: '(20109)' },
    { campo: 'grupo_sanguineo', texto: 'GRUPO SANGUINEO (20108)', codigo: '(20108)' },
    { campo: 'vel_sedimentacion', texto: 'VEL SEDIMENTACION GLOBULAR (20103)', codigo: '(20103)' },
    { campo: 'reticulocitos', texto: 'RETICULOCITOS (20102)', codigo: '(20102)' },
    { campo: 'frotis_sangre_gota', texto: 'FROTIS SANGRE GOTA GRUESA (20105)', codigo: '(20105)' },
    { campo: 'hemoglobina_glicosilada', texto: 'HEMOGLOBINA GLICOSILADA (19303)', codigo: '(19303)' },
  ];

  return estudios
    .filter(estudio => solicitud[estudio.campo])
    .map(estudio => ({
      text: `☑ ${estudio.texto}`,
      fontSize: 6,
      margin: [0, 1],
    }));
}

private construirEstudiosInmunohematologia(solicitud: any): any[] {
  const estudios = [
    { campo: 'pruebas_cruzadas', texto: 'PRUEBAS CRUZADAS (20107)', codigo: '(20107)' },
    { campo: 'coombs_directo', texto: 'COOMBS DIRECTO (19210)', codigo: '(19210)' },
    { campo: 'coombs_indirecto', texto: 'COOMBS INDIRECTO (19211)', codigo: '(19211)' },
  ];

  return estudios
    .filter(estudio => solicitud[estudio.campo])
    .map(estudio => ({
      text: `☑ ${estudio.texto}`,
      fontSize: 6,
      margin: [0, 1],
    }));
}

private construirEstudiosCoagulacion(solicitud: any): any[] {
  const estudios = [
    { campo: 'tiempo_protrombina', texto: 'T. PROTROMBINA (20113)', codigo: '(20113)' },
    { campo: 'tiempo_tromboplastina', texto: 'TROMBOPLASTINA PARCIAL (20114)', codigo: '(20114)' },
    { campo: 'fibrinogeno', texto: 'FIBRINOGENO (20116)', codigo: '(20116)' },
  ];

  return estudios
    .filter(estudio => solicitud[estudio.campo])
    .map(estudio => ({
      text: `☑ ${estudio.texto}`,
      fontSize: 6,
      margin: [0, 1],
    }));
}

private construirEstudiosInmunologia(solicitud: any): any[] {
  const estudios = [
    { campo: 'reacciones_febriles', texto: 'REACCIONES FEBRILES (19201)' },
    { campo: 'proteina_c_reactiva', texto: 'PROTEINA C REACTIVA (19206)' },
    { campo: 'factor_reumatoide', texto: 'FACTOR REUMATOIDE (19207)' },
    { campo: 'antiestreptolisinas', texto: 'ANTIESTREPTOLISINAS (19205)' },
    { campo: 'vdrl', texto: 'VDRL (22131)' },
    { campo: 'antigeno_prostatico', texto: 'ANTIGENO PROSTATICO CUALITATIVO (19212)' },
    { campo: 'rpr_sifilis', texto: 'RPR PRUEBA DE SIFILIS (19206)' },
    { campo: 'hgc_beta_serica', texto: 'HGC Beta CUALITATIVA serica (19720)' },
    { campo: 'prueba_embarazo_orina', texto: 'PRUEBA DE EMBARAZO EN ORINA (19715)' },
    { campo: 'ac_hiv_1_2', texto: 'Ac HIV 1-2 PRUEBA RAPIDA (20117)' },
  ];

  return estudios
    .filter(estudio => solicitud[estudio.campo])
    .map(estudio => ({
      text: `☑ ${estudio.texto}`,
      fontSize: 6,
      margin: [0, 1],
    }));
}

private construirEstudiosParasitologia(solicitud: any): any[] {
  const estudios = [
    { campo: 'coproparasitoscopico_3', texto: 'COPROPARASITOSCOPICO 3 (20001)' },
    { campo: 'coproparasitoscopico_1', texto: 'COPROPARASITOSCOPICO 1 (20001)' },
    { campo: 'citologia_moco_fecal', texto: 'CITOLOGIA DE MOCO FECAL (20006)' },
    { campo: 'coprologico', texto: 'COPROLOGICO (20005)' },
    { campo: 'amiba_fresco', texto: 'AMIBA EN FRESCO (20006)' },
    { campo: 'sangre_oculta_heces', texto: 'SANGRE OCULTA EN HECES (19502)' },
    { campo: 'azucares_reductores', texto: 'AZUCARES REDUCTORES (20005)' },
    { campo: 'rotavirus', texto: 'ROTAVIRUS (19215)' },
  ];

  return estudios
    .filter(estudio => solicitud[estudio.campo])
    .map(estudio => ({
      text: `☑ ${estudio.texto}`,
      fontSize: 6,
      margin: [0, 1],
    }));
}

private construirEstudiosPerfilCardiaco(solicitud: any): any[] {
  const estudios = [
    { campo: 'dhl', texto: 'DHL (19406)' },
    { campo: 'cpk', texto: 'CPK (19409)' },
    { campo: 'ck_mb', texto: 'CK-MB (19409)' },
  ];

  return estudios
    .filter(estudio => solicitud[estudio.campo])
    .map(estudio => ({
      text: `☑ ${estudio.texto}`,
      fontSize: 6,
      margin: [0, 1],
    }));
}

private construirEstudiosBioquimica(solicitud: any): any[] {
  const estudios = [
    // Glucosa y derivados
    { campo: 'tamiz_gestacional_50g', texto: 'TAMIZ GESTACIONAL 50 G/1HR (19303)' },
    { campo: 'glucosa_postprandial', texto: 'GLUCOSA POST-PRANDIAL (19302)' },
    { campo: 'curva_tolerancia_glucosa', texto: 'CURVA TOLERANCIA GLUCOSA (19303)' },
    { campo: 'glucosa', texto: 'GLUCOSA (19301)' },
    
    // Función renal
    { campo: 'urea', texto: 'UREA/BUN (19304)' },
    { campo: 'creatinina', texto: 'CREATININA (19306)' },
    { campo: 'acido_urico', texto: 'ACIDO URICO (19307)' },
    
    // Perfil lipídico
    { campo: 'colesterol_total', texto: 'COLESTEROL TOTAL (19307)' },
    { campo: 'hdl_colesterol', texto: 'HDL COLESTEROL (19703)' },
    { campo: 'perfil_lipidos', texto: 'PERFIL DE LIPIDOS (20203)' },
    { campo: 'trigliceridos', texto: 'TRIGLICERIDOS (19702)' },
    
    // Función hepática
    { campo: 'bilirrubina_directa', texto: 'BILIRRUBINA DIRECTA (19308)' },
    { campo: 'bilirrubina_total', texto: 'BILIRRUBINA TOTAL (22118)' },
    { campo: 'transaminasas', texto: 'AST (TGO) (19401)' },
    { campo: 'alt_tgp', texto: 'ALT (TGP) (19402)' },
    { campo: 'fosfatasa_alcalina', texto: 'FOSFATASA ALCALINA (ALP) (19403)' },
    
    // Proteínas
    { campo: 'proteinas_totales', texto: 'PROTEINAS TOTALES (19309)' },
    { campo: 'albumina', texto: 'ALBUMINA (19310)' },
    
    // Enzimas digestivas
    { campo: 'amilasa', texto: 'AMILASA (19407)' },
    { campo: 'lipasa', texto: 'LIPASA (19408)' },
    
    // Electrolitos
    { campo: 'calcio', texto: 'CALCIO (19604)' },
    { campo: 'fosforo', texto: 'FOSFORO (19603)' },
    { campo: 'cloro', texto: 'CLORO (20103)' },
    { campo: 'potasio', texto: 'POTASIO (19602)' },
    { campo: 'sodio', texto: 'SODIO (19601)' },
    { campo: 'magnesio', texto: 'MAGNESIO (19602)' },
  ];

  return estudios
    .filter(estudio => solicitud[estudio.campo])
    .map(estudio => ({
      text: `☑ ${estudio.texto}`,
      fontSize: 6,
      margin: [0, 1],
    }));
}

private construirEstudiosUrianalisis(solicitud: any): any[] {
  const estudios = [
    // Urianálisis básico
    { campo: 'examen_general_orina', texto: 'EXAMEN GENERAL DE ORINA (20201)' },
    
    // Electrolitos en orina
    { campo: 'cloro_orina', texto: 'CLORO (ORINA) (19601)' },
    { campo: 'potasio_orina', texto: 'POTASIO (ORINA) (19601)' },
    { campo: 'sodio_orina', texto: 'SODIO (ORINA) (19601)' },
    
    // Estudios especializados
    { campo: 'microalbuminuria_24hrs', texto: 'MICROALBUMINURIA EN ORINA 24 HRS (22803)' },
    { campo: 'depuracion_creatinina', texto: 'DEPURACION DE CREATININA (19501)' },
    
    // También mantener los originales por compatibilidad
    { campo: 'sodio', texto: 'SODIO (19601)' },
    { campo: 'potasio', texto: 'POTASIO (19601)' },
    { campo: 'cloro', texto: 'CLORO (19601)' },
  ];

  return estudios
    .filter(estudio => solicitud[estudio.campo])
    .map(estudio => ({
      text: `☑ ${estudio.texto}`,
      fontSize: 6,
      margin: [0, 1],
    }));
}

// Agregar nuevos métodos para las otras secciones
private construirEstudiosPaquetes(solicitud: any): any[] {
  const estudios = [
    { campo: 'quimica_sanguinea_iii', texto: 'QUIMICA SANGUINEA III (20204)' },
    { campo: 'quimica_sanguinea_iv', texto: 'QUIMICA SANGUINEA IV (20207)' },
    { campo: 'perfil_hepatico', texto: 'PERFIL HEPATICO (20208)' },
    { campo: 'perfil_quirurgico', texto: 'PERFIL QUIRURGICO (20209)' },
    { campo: 'perfil_reumatico', texto: 'PERFIL REUMATICO (20210)' },
    { campo: 'perfil_control_embarazo', texto: 'PERFIL CONTROL DE EMBARAZO (20211)' },
  ];

  return estudios
    .filter(estudio => solicitud[estudio.campo])
    .map(estudio => ({
      text: `☑ ${estudio.texto}`,
      fontSize: 6,
      margin: [0, 1],
    }));
}

// private formatearFecha(fecha: string): string {
//   if (!fecha) return '';
  
//   try {
//     const fechaObj = new Date(fecha);
//     return fechaObj.toLocaleDateString('es-MX');
//   } catch (error) {
//     return fecha;
//   }
// }

// private formatearUrgencia(urgencia: string): string {
//   const urgencias: { [key: string]: string } = {
//     urgente: 'URGENTE',
//     rutina: 'RUTINA',
//     normal: 'NORMAL',
//     stat: 'STAT',
//   };
//   return urgencias[urgencia] || urgencia?.toUpperCase() || 'RUTINA';
// }

// private generarFolioSolicitud(): string {
//   const fecha = new Date();
//   const timestamp = fecha.getTime().toString().slice(-6);
//   return `SOL-${fecha.getFullYear()}-${timestamp}`;
// }

// private obtenerNumeroExpedienteInteligente(paciente: any): string {
//   return paciente.numero_expediente || 
//          paciente.expediente || 
//          paciente.id || 
//          'SIN-EXP';
// }



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

// C:\Proyectos\CICEG-HG_Frontend\src\app\services\PDF\PdfTemplatesService.ts
  async generarNotaEvolucion(datos: any): Promise<any> {
    console.log('📄 Generando Nota de Evolución Médica - Estilo Profesional...');
    
    const pacienteCompleto = datos.pacienteCompleto;
    const medicoCompleto = datos.medicoCompleto;
    const notaEvolucionData = datos.notaEvolucion || {};
    const fechaActual = new Date();
    const esPediatrico = pacienteCompleto.edad < 18;
    
    // 🔥 OBTENER CONFIGURACIÓN INTELIGENTE DE LOGOS
    const configuracion = await this.obtenerConfiguracionLogosInteligente();
 // 🔥 DEBUG ADICIONAL:
  console.log('🔧 DEBUG PDF - Datos recibidos:');
  console.log('- servicio_destino en notaEvolucionData:', notaEvolucionData.servicio_destino);
  console.log('- numero_cama en notaEvolucionData:', notaEvolucionData.numero_cama);
  console.log('- cama en notaEvolucionData:', notaEvolucionData.cama);
  console.log('- pacienteCompleto expediente:', pacienteCompleto?.expediente);
    return {
      pageSize: 'LETTER',
      pageMargins: [20, 60, 20, 40],
      
      header: {
        margin: [20, 10, 20, 10],
        table: {
          widths: ['20%', '60%', '20%'],
          body: [
            [
              {
                // Logo de gobierno (izquierda)
                image: await this.obtenerImagenBase64(
                  datos.configuracion?.logo_gobierno ||
                  configuracion.logo_gobierno
                ),
                fit: [80, 40],
                alignment: 'left',
                margin: [0, 5],
              },
              {
                // Texto central
                text: esPediatrico
                  ? 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - NOTA DE EVOLUCIÓN MÉDICA PEDIÁTRICA'
                  : 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - NOTA DE EVOLUCIÓN MÉDICA',
                fontSize: 8,
                bold: true,
                alignment: 'center',
                color: '#1a365d',
                margin: [0, 8],
              },
              {
                // Logo del hospital (derecha)
                image: await this.obtenerImagenBase64(
                  datos.configuracion?.logo_principal ||
                  configuracion.logo_principal
                ),
                fit: [80, 40],
                alignment: 'right',
                margin: [0, 5],
              },
            ],
          ],
        },
        layout: 'noBorders',
      },

      content: [
        // IDENTIFICACIÓN Y DATOS BÁSICOS
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                {
                  text: 'IDENTIFICACIÓN',
                  fontSize: 6,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 3,
                },
                {
                  table: {
                    widths: ['20%', '20%', '20%', '20%', '20%'],
                    body: [
                      [
                        { text: 'Fecha elaboración', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Hora elaboración', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'No. Expediente', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'No. de cama', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Servicio', fontSize: 7, bold: true, alignment: 'center' },
                      ],
                      [
                        { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'center' },
                        { text: fechaActual.toLocaleTimeString('es-MX'), fontSize: 7, alignment: 'center' },
                        { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto) || 'N/A', fontSize: 7, alignment: 'center', bold: true },
{ text: notaEvolucionData.numero_cama || notaEvolucionData.cama || '______', fontSize: 7, alignment: 'center' },
{ text: notaEvolucionData.servicio_destino || medicoCompleto.departamento || '________', fontSize: 7, alignment: 'center' },                    
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
                    widths: ['55%', '15%', '15%', '15%'],
                    body: [
                      [
                        { text: 'Nombre completo del paciente', fontSize: 7, bold: true },
                        { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Tipo de sangre', fontSize: 7, bold: true, alignment: 'center' },
                      ],
                      [
                        { text: pacienteCompleto.nombre_completo, fontSize: 6, bold: true, margin: [2, 3] },
                        { text: `${pacienteCompleto.edad} años`, fontSize: 7, alignment: 'center' },
                        { text: pacienteCompleto.sexo, fontSize: 7, alignment: 'center' },
                        { text: pacienteCompleto.tipo_sangre || 'No especificado', fontSize: 7, alignment: 'center', bold: true, color: '#dc2626' },
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
                        { text: 'Días de hospitalización', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Fecha último ingreso', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Guía clínica', fontSize: 7, bold: true, alignment: 'center' },
                      ],
                      [
                        { text: notaEvolucionData.dias_hospitalizacion ? `${notaEvolucionData.dias_hospitalizacion} días` : 'AMBULATORIO', fontSize: 7, alignment: 'center', bold: true },
                        { text: notaEvolucionData.fecha_ultimo_ingreso ? this.formatearFecha(notaEvolucionData.fecha_ultimo_ingreso) : 'N/A', fontSize: 7, alignment: 'center' },
                        { text: notaEvolucionData.guia_clinica_nombre || 'Por determinar', fontSize: 7, alignment: 'center' },
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

        { text: '', margin: [0, 2] },

        // SIGNOS VITALES ACTUALES (si existen)
        ...(this.tieneSignosVitales(notaEvolucionData) ? [
          {
            table: {
              widths: ['15%', '85%'],
              body: [
                [
                  {
                    text: 'SIGNOS VITALES',
                    fontSize: 6,
                    bold: true,
                    fillColor: '#f5f5f5',
                    alignment: 'center',
                  },
                  {
                    table: {
                      widths: ['12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%'],
                      body: [
                        [
                          { text: 'Temperatura', fontSize: 7, bold: true, alignment: 'center' },
                          { text: 'Freq. Cardíaca', fontSize: 7, bold: true, alignment: 'center' },
                          { text: 'Freq. Respiratoria', fontSize: 7, bold: true, alignment: 'center' },
                          { text: 'T/A Sistólica', fontSize: 7, bold: true, alignment: 'center' },
                          { text: 'T/A Diastólica', fontSize: 7, bold: true, alignment: 'center' },
                          { text: 'SatO₂', fontSize: 7, bold: true, alignment: 'center' },
                          { text: 'Peso', fontSize: 7, bold: true, alignment: 'center' },
                          { text: 'Talla', fontSize: 7, bold: true, alignment: 'center' },
                        ],
                        [
                          { text: notaEvolucionData.temperatura ? `${notaEvolucionData.temperatura}°C` : '--', fontSize: 7, alignment: 'center' },
                          { text: notaEvolucionData.frecuencia_cardiaca ? `${notaEvolucionData.frecuencia_cardiaca} lpm` : '--', fontSize: 7, alignment: 'center' },
                          { text: notaEvolucionData.frecuencia_respiratoria ? `${notaEvolucionData.frecuencia_respiratoria} rpm` : '--', fontSize: 7, alignment: 'center' },
                          { text: notaEvolucionData.presion_arterial_sistolica ? `${notaEvolucionData.presion_arterial_sistolica} mmHg` : '--', fontSize: 7, alignment: 'center' },
                          { text: notaEvolucionData.presion_arterial_diastolica ? `${notaEvolucionData.presion_arterial_diastolica} mmHg` : '--', fontSize: 7, alignment: 'center' },
                          { text: notaEvolucionData.saturacion_oxigeno ? `${notaEvolucionData.saturacion_oxigeno}%` : '--', fontSize: 7, alignment: 'center' },
                          { text: notaEvolucionData.peso_actual ? `${notaEvolucionData.peso_actual} kg` : '--', fontSize: 7, alignment: 'center' },
                          { text: notaEvolucionData.talla_actual ? `${notaEvolucionData.talla_actual} cm` : '--', fontSize: 7, alignment: 'center' },
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
          { text: '', margin: [0, 2] },
        ] : []),

        // EVOLUCIÓN MÉDICA PRINCIPAL
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                {
                  text: 'EVOLUCIÓN MÉDICA',
                  fontSize: 6,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 8,
                },
                {
                  text: 'SÍNTOMAS Y SIGNOS ACTUALES',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  text: notaEvolucionData.sintomas_signos || 'Sin información registrada',
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'HÁBITUS EXTERIOR',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  text: notaEvolucionData.habitus_exterior || 'Sin información registrada',
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'ESTADO NUTRICIONAL',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  text: notaEvolucionData.estado_nutricional || 'Sin información registrada',
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'EXPLORACIÓN POR APARATOS Y SISTEMAS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  text: this.construirTextoExploracionSistemas(notaEvolucionData),
                  fontSize: 7,
                  margin: [5, 8],
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

        { text: '', margin: [0, 2] },

        // ESTUDIOS Y ANÁLISIS
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                {
                  text: 'ESTUDIOS Y ANÁLISIS',
                  fontSize: 6,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 4,
                },
                {
                  text: 'ESTUDIOS DE LABORATORIO Y GABINETE',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  text: notaEvolucionData.estudios_laboratorio_gabinete || 'No se realizaron estudios adicionales',
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'EVOLUCIÓN Y ANÁLISIS DEL CUADRO CLÍNICO',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  text: notaEvolucionData.evolucion_analisis || 'Sin información registrada',
                  fontSize: 7,
                  margin: [5, 8],
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

        { text: '', margin: [0, 2] },

        // DIAGNÓSTICOS Y PLAN
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                {
                  text: 'DIAGNÓSTICO Y PLAN',
                  fontSize: 6,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 8,
                },
                {
                  text: 'IMPRESIÓN DIAGNÓSTICA O PROBLEMAS CLÍNICOS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
[
  {},
  {
    text: [
      {
        text: notaEvolucionData.diagnosticos || 'Sin información registrada',
        fontSize: 7,
        bold: true,
      },
      // 🔥 AGREGAR CIE-10 PARA NOTA DE EVOLUCIÓN
      notaEvolucionData.codigo_cie10 ? {
        text: `\n\nCódigo CIE-10: ${notaEvolucionData.codigo_cie10}`,
        fontSize: 7,
        bold: true,
        color: '#000000ff',
        italics: true,
      } : {}
    ],
    margin: [5, 8],
    lineHeight: 1.3,
  },
],
              [
                {},
                {
                  text: 'DIAGNÓSTICOS SEGÚN GUÍAS CLÍNICAS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  text: notaEvolucionData.diagnosticos_guias || 'Por determinar según evolución clínica',
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'PLAN DE ESTUDIOS Y TRATAMIENTO',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  text: notaEvolucionData.plan_estudios_tratamiento || 'Sin información registrada',
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'INTERCONSULTAS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  text: notaEvolucionData.interconsultas || 'No se requieren interconsultas en esta evolución',
                  fontSize: 7,
                  margin: [5, 8],
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

        { text: '', margin: [0, 2] },

        // PRONÓSTICO E INDICACIONES
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                {
                  text: 'PRONÓSTICO',
                  fontSize: 6,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 4,
                },
                {
                  text: 'PRONÓSTICO MÉDICO',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  text: notaEvolucionData.pronostico || 'Sin información registrada',
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.3,
                },
              ],
              [
                {},
                {
                  text: 'INDICACIONES MÉDICAS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  text: notaEvolucionData.indicaciones_medicas || 'Continuar con el manejo actual',
                  fontSize: 7,
                  margin: [5, 8],
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

        // OBSERVACIONES ADICIONALES (si existen)
        ...(notaEvolucionData.observaciones_adicionales ? [
          { text: '', margin: [0, 2] },
          {
            table: {
              widths: ['100%'],
              body: [
                [
                  {
                    text: `OBSERVACIONES ADICIONALES: ${notaEvolucionData.observaciones_adicionales}`,
                    fontSize: 6,
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
        ] : []),

        { text: '', margin: [0, 2] },

        // FIRMA MÉDICA COMPLETA SEGÚN NOM-004
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  text: 'NOMBRE COMPLETO, CÉDULA PROFESIONAL Y FIRMA',
                  fontSize: 6,
                  bold: true,
                  fillColor: '#ddd9c3',
                  alignment: 'center',
                  margin: [2, 5],
                },
                {
                  text: 'FIRMA AUTÓGRAFA',
                  fontSize: 6,
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
                      fontSize: 7,
                      bold: true,
                    },
                    {
                      text: `Cédula Profesional: ${medicoCompleto.numero_cedula}\n`,
                      fontSize: 6,
                    },
                    {
                      text: `Especialidad: ${medicoCompleto.especialidad}\n`,
                      fontSize: 6,
                    },
                    {
                      text: `${medicoCompleto.cargo} - ${medicoCompleto.departamento}\n`,
                      fontSize: 6,
                    },
                    {
                      text: `Hospital General San Luis de la Paz\n`,
                      fontSize: 7,
                      color: '#6b7280',
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
                  margin: [5, 20],
                  alignment: 'center',
                },
                {
                  text: '\n\n\n\n_________________________\nFIRMA DEL MÉDICO\n(Según NOM-004-SSA3-2012)',
                  fontSize: 6,
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

        // NOTAS AL PIE
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
                  text: '• Sección 6.2 - Nota de evolución médica',
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
                      text: `Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
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
// C:\Proyectos\CICEG-HG_Frontend\src\app\services\PDF\PdfTemplatesService.ts
    async generarNotaUrgencias(datos: any): Promise<any> {
    console.log('  Generando Nota de Urgencias - Estilo Profesional...');

  console.log('📊 ESTRUCTURA COMPLETA DE DATOS:', {
      datos_completos: datos,
      pacienteCompleto: datos.pacienteCompleto,
      expediente: datos.pacienteCompleto?.expediente,
      numero_expediente: datos.pacienteCompleto?.expediente?.numero_expediente,
      numero_administrativo: datos.pacienteCompleto?.expediente?.numero_expediente_administrativo
    });

    const pacienteCompleto = datos.pacienteCompleto;
    const medicoCompleto = datos.medicoCompleto;
    const notaUrgenciasData = datos.notaUrgencias || {};
    const signosVitales = datos.signosVitales || {};
    const fechaActual = new Date();
    
    // Validar datos obligatorios NOM-004
    const motivoAtencion = notaUrgenciasData.motivo_atencion || 'No especificado';
    const numeroExpediente = this.obtenerNumeroExpedientePreferido(pacienteCompleto.expediente);

    return {
      pageSize: 'LETTER',
      pageMargins: [20, 60, 20, 40],

      header: {
        margin: [20, 10, 20, 10],
        table: {
          widths: ['20%', '60%', '20%'],
          body: [
            [
              {
                // Logo de gobierno (izquierda)
                image: await this.obtenerImagenBase64(
                  datos.configuracion?.logo_gobierno ||
                  '/uploads/logos/logo-gobierno-importado.svg'
                ),
                fit: [80, 40],
                alignment: 'left',
                margin: [0, 5],
              },
              {
                // Texto central
                text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - NOTA DE URGENCIAS',
                fontSize: 8,
                bold: true,
                alignment: 'center',
                color: '#1a365d',
                margin: [0, 8],
              },
              {
                // Logo del hospital (derecha)
                image: await this.obtenerImagenBase64(
                  datos.configuracion?.logo_principal ||
                  '/uploads/logos/logo-principal-importado.svg'
                ),
                fit: [80, 40],
                alignment: 'right',
                margin: [0, 5],
              },
            ],
          ],
        },
        layout: 'noBorders',
      },

      content: [
        // IDENTIFICACIÓN Y DATOS BÁSICOS
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                {
                  text: 'IDENTIFICACIÓN',
                  fontSize: 6,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 3,
                },
                {
                  table: {
                    widths: ['20%', '20%', '20%', '20%', '20%'],
                    body: [
                      [
                        { text: 'Fecha de atención', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Hora de atención', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'No. Expediente', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Cama/Cubículo', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Área de Urgencias', fontSize: 7, bold: true, alignment: 'center' },
                      ],
                      [
                        { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'center' },
                        { text: notaUrgenciasData.hora_atencion || fechaActual.toLocaleTimeString('es-MX'), fontSize: 7, alignment: 'center' },
                      { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto) || 'N/A', fontSize: 7, alignment: 'center', bold: true },
                        { text: notaUrgenciasData.numero_cama || 'URG-SIN ASIGNAR', fontSize: 7, alignment: 'center' },
                        { text: notaUrgenciasData.area_urgencias || 'Triage General', fontSize: 7, alignment: 'center' },
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
                    widths: ['50%', '15%', '15%', '20%'],
                    body: [
                      [
                        { text: 'Nombre completo del paciente', fontSize: 7, bold: true },
                        { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Tipo de sangre', fontSize: 7, bold: true, alignment: 'center' },
                      ],
                      [
                        { text: pacienteCompleto.nombre_completo, fontSize: 6, bold: true, margin: [2, 3] },
                        { text: `${pacienteCompleto.edad} años`, fontSize: 7, alignment: 'center' },
                        { text: pacienteCompleto.sexo, fontSize: 7, alignment: 'center' },
                        { text: pacienteCompleto.tipo_sangre || 'No especificado', fontSize: 7, alignment: 'center', bold: true, color: '#dc2626' },
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
                        { text: 'Médico responsable de la atención de urgencias', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Cédula profesional', fontSize: 7, bold: true, alignment: 'center' },
                      ],
                      [
                        { text: medicoCompleto.nombre_completo || 'No especificado', fontSize: 7, alignment: 'center' },
                        { text: medicoCompleto.numero_cedula || 'No registrada', fontSize: 7, alignment: 'center' },
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
          margin: [0, 0, 0, 10],
        },

        // SIGNOS VITALES (NOM-004 OBLIGATORIO)
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                {
                  text: 'SIGNOS VITALES',
                  fontSize: 6,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 2,
                },
                {
                  text: 'CONSTANTES VITALES AL INGRESO',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  columns: [
                    {
                      width: '25%',
                      text: `TA: ${notaUrgenciasData.presion_arterial_sistolica || signosVitales.presion_arterial_sistolica || '___'}/${notaUrgenciasData.presion_arterial_diastolica || signosVitales.presion_arterial_diastolica || '___'} mmHg\nFC: ${notaUrgenciasData.frecuencia_cardiaca || signosVitales.frecuencia_cardiaca || '___'} lpm`,
                      fontSize: 7,
                      margin: [5, 3],
                    },
                    {
                      width: '25%',
                      text: `FR: ${notaUrgenciasData.frecuencia_respiratoria || signosVitales.frecuencia_respiratoria || '___'} rpm\nTemp: ${notaUrgenciasData.temperatura || signosVitales.temperatura || '___'} °C`,
                      fontSize: 7,
                      margin: [5, 3],
                    },
                    {
                      width: '25%',
                      text: `SatO2: ${notaUrgenciasData.saturacion_oxigeno || signosVitales.saturacion_oxigeno || '___'} %\nPeso: ${notaUrgenciasData.peso || signosVitales.peso || '___'} kg`,
                      fontSize: 7,
                      margin: [5, 3],
                    },
                    {
                      width: '25%',
                      text: `Glucosa: ${notaUrgenciasData.glucosa || signosVitales.glucosa || '___'} mg/dL\nEVA: ${notaUrgenciasData.escala_dolor || '___'}/10`,
                      fontSize: 7,
                      margin: [5, 3],
                    },
                  ],
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
          margin: [0, 0, 0, 10],
        },

        // MOTIVO DE ATENCIÓN (NOM-004 7.1.3)
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                {
                  text: 'ATENCIÓN DE URGENCIAS',
                  fontSize: 6,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 4,
                },
                {
                  text: 'MOTIVO DE LA ATENCIÓN (NOM-004 7.1.3)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  text: motivoAtencion,
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.4,
                },
              ],
              [
                {},
                {
                  text: 'RESUMEN DEL INTERROGATORIO, EXPLORACIÓN FÍSICA Y ESTADO MENTAL (NOM-004 7.1.4)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  text: `INTERROGATORIO: ${notaUrgenciasData.resumen_interrogatorio || 'Sin información específica'}\n\nEXPLORACIÓN FÍSICA: ${notaUrgenciasData.exploracion_fisica || 'Sin información específica'}\n\nESTADO MENTAL: Estado de conciencia: ${notaUrgenciasData.estado_conciencia || 'No especificado'}. ${notaUrgenciasData.estado_mental || 'Sin observaciones adicionales.'}`,
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.4,
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
          margin: [0, 0, 0, 10],
        },

        // ESTUDIOS Y RESULTADOS (NOM-004 7.1.5)
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                {
                  text: 'ESTUDIOS',
                  fontSize: 6,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 2,
                },
                {
                  text: 'RESULTADOS DE ESTUDIOS DE SERVICIOS AUXILIARES DE DIAGNÓSTICO (NOM-004 7.1.5)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  text: notaUrgenciasData.resultados_estudios || 'Sin estudios de laboratorio o gabinete realizados al momento de la elaboración de esta nota.',
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.4,
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
          margin: [0, 0, 0, 10],
        },

        // DIAGNÓSTICO Y TRATAMIENTO (NOM-004 7.1.6 y 7.1.7)
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                {
                  text: 'DIAGNÓSTICO Y TRATAMIENTO',
                  fontSize: 6,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  rowSpan: 6,
                },
                {
                  text: 'DIAGNÓSTICOS O PROBLEMAS CLÍNICOS (NOM-004 7.1.6)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
[
  {},
  {
    text: [
      {
        text: notaUrgenciasData.diagnostico || 'Diagnóstico por establecer. Paciente en evaluación.',
        fontSize: 7,
        bold: true,
      },
      // 🔥 AGREGAR CIE-10 PARA URGENCIAS
      notaUrgenciasData.codigo_cie10 ? {
        text: `\n\nCódigo CIE-10: ${notaUrgenciasData.codigo_cie10}`,
        fontSize: 7,
        bold: true,
        color: '#dc2626',
        italics: true,
      } : {}
    ],
    margin: [5, 8],
    lineHeight: 1.4,
  },
],
              [
                {},
                {
                  text: 'TRATAMIENTO Y PRONÓSTICO (NOM-004 7.1.7)',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  text: `TRATAMIENTO INMEDIATO: ${notaUrgenciasData.plan_tratamiento || 'Plan terapéutico por definir según evolución clínica'}\n\nPRONÓSTICO: ${notaUrgenciasData.pronostico || 'Reservado, condicionado a evolución clínica y respuesta al tratamiento'}`,
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.4,
                },
              ],
              [
                {},
                {
                  text: 'PROCEDIMIENTOS REALIZADOS EN URGENCIAS',
                  fontSize: 7,
                  bold: true,
                  fillColor: '#fafafa',
                },
              ],
              [
                {},
                {
                  text: notaUrgenciasData.procedimientos_urgencias || 'Sin procedimientos invasivos realizados. Manejo médico conservador.',
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.4,
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
          margin: [0, 0, 0, 10],
        },

        // DESTINO DEL PACIENTE
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                {
                  text: 'DESTINO',
                  fontSize: 6,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                },
                {
                  text: `DESTINO DEL PACIENTE POSTERIOR A LA ATENCIÓN DE URGENCIAS: ${notaUrgenciasData.destino_paciente || 'A definir según evolución clínica y disponibilidad de servicios'}`,
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.4,
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
          margin: [0, 0, 0, 10],
        },

        // ÁREA DE INTERCONSULTA
        ...(notaUrgenciasData.area_interconsulta ? [
          {
            table: {
              widths: ['15%', '85%'],
              body: [
                [
                  {
                    text: 'INTERCONSULTA',
                    fontSize: 6,
                    bold: true,
                    fillColor: '#f5f5f5',
                    alignment: 'center',
                  },
                  {
                    text: `INTERCONSULTA SOLICITADA A: ${notaUrgenciasData.area_interconsulta_nombre || notaUrgenciasData.area_interconsulta || 'No especificada'}`,
                    fontSize: 7,
                    margin: [5, 8],
                    lineHeight: 1.4,
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
            margin: [0, 0, 0, 10],
          }
        ] : []),

        { text: '', margin: [0, 10] },

        // FIRMA MÉDICA (NOM-004 5.10)
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  text: 'NOMBRE COMPLETO, CÉDULA PROFESIONAL Y FIRMA',
                  fontSize: 6,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  margin: [2, 5],
                },
                {
                  text: 'FIRMA AUTÓGRAFA',
                  fontSize: 6,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  margin: [2, 5],
                },
              ],
              [
                {
                  text: [
                    {
                      text: `${medicoCompleto.titulo_profesional || 'Dr.'} ${medicoCompleto.nombre_completo}\n`,
                      fontSize: 7,
                      bold: true,
                    },
                    {
                      text: `Cédula Profesional: ${medicoCompleto.numero_cedula || 'No registrada'}\n`,
                      fontSize: 6,
                    },
                    {
                      text: `Especialidad: ${medicoCompleto.especialidad || 'Medicina de Urgencias'}\n`,
                      fontSize: 6,
                    },
                    {
                      text: `Servicio de Urgencias - Hospital General San Luis de la Paz\n`,
                      fontSize: 7,
                      color: '#6b7280',
                    },
                    {
                      text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')} - Hora: ${fechaActual.toLocaleTimeString('es-MX')}`,
                      fontSize: 7,
                    },
                  ],
                  margin: [5, 20],
                  alignment: 'center',
                },
                {
                  text: '\n\n\n\n_________________________\nFIRMA DEL MÉDICO\n(NOM-004-SSA3-2012)',
                  fontSize: 6,
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
          margin: [0, 0, 0, 10],
        },

        // INFORMACIÓN NORMATIVA
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
                  text: '• Numerales 7.1, 7.2 y 7.3 (Notas médicas en urgencias)',
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
                  text: `Documento generado: ${fechaActual.toLocaleString('es-MX')}\n`,
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
                  text: 'Nota de Urgencias - SICEG\nNOM-004-SSA3-2012 (Numerales 7.1 - 7.3)',
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
                      text: `Exp: ${numeroExpediente}`,
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
                    { text: 'SAN LUIS DE LA PAZ', fontSize: 8, bold: true },
                    { text: 'GUANAJUATO, MÉXICO', fontSize: 6 },
                    { text: 'RFC: HGS-123456-ABC', fontSize: 7, color: '#666666', margin: [0, 2, 0, 0] }
                  ]
                },
                {
                  stack: [
                    { text: '💊 PRESCRIPCIÓN MÉDICA', fontSize: 16, bold: true, alignment: 'center', color: '#7c3aed' },
                    { text: 'RECETA MÉDICA ELECTRÓNICA', fontSize: 8, alignment: 'center', italics: true },
                    { text: 'NOM-004-SSA3-2012', fontSize: 6, alignment: 'center', color: '#666666' }
                  ]
                },
                {
                  stack: [
                    { text: 'FECHA:', fontSize: 6, bold: true, alignment: 'right' },
                    { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 8, alignment: 'right' },
                    { text: `Folio: ${prescripcion.numero_receta || this.generarFolioReceta()}`, fontSize: 6, alignment: 'right', margin: [0, 2] },
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
                  fontSize: 6,
                  color: '#666666'
                },
                {
                  text: `Página ${currentPage} de ${pageCount}`,
                  fontSize: 6,
                  alignment: 'center',
                  color: '#666666'
                },
                {
                  text: fechaActual.toLocaleString('es-MX'),
                  fontSize: 6,
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
          fontSize: 7,
          bold: true,
          color: '#4b5563'
        },
        fieldValue: {
          fontSize: 7,
          color: '#111827'
        },
        tableHeader: {
          fontSize: 6,
          bold: true,
          color: '#ffffff',
          fillColor: '#7c3aed',
          margin: [3, 3, 3, 3]
        },
        tableCell: {
          fontSize: 6,
          margin: [3, 3, 3, 3]
        },
        medicamentoNombre: {
          fontSize: 7,
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
          fontSize: 8,
          bold: true,
          alignment: 'center',
          color: '#374151'
        },
        signatureName: {
          fontSize: 7,
          alignment: 'center',
          color: '#111827'
        },
        signatureDetails: {
          fontSize: 6,
          alignment: 'center',
          color: '#6b7280'
        },
        validezLabel: {
          fontSize: 6,
          bold: true,
          color: '#dc2626'
        },
        validezFecha: {
          fontSize: 6,
          color: '#dc2626'
        },
        validezNota: {
          fontSize: 7,
          color: '#6b7280',
          italics: true
        },
        noMedicamentos: {
          fontSize: 8,
          color: '#6b7280',
          italics: true
        }
      }
    };
  }

  // async generarReferenciaContrarreferencia(datos: any): Promise<any> {
  //   console.log('🔄 Generando Referencia y Contrarreferencia...');

  //   const { pacienteCompleto, medicoCompleto, referencia } = datos;
  //   const fechaActual = new Date();
  //   const esContrarreferencia = referencia.tipo_referencia === 'contrarreferencia';

  //   return {
  //     pageSize: 'LETTER',
  //     pageMargins: [40, 80, 40, 60],

  //     header: (currentPage: number, pageCount: number) => {
  //       return {
  //         margin: [40, 20, 40, 20],
  //         table: {
  //           widths: ['30%', '40%', '30%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'HOSPITAL GENERAL', fontSize: 12, bold: true },
  //                   { text: 'SAN LUIS DE LA PAZ', fontSize: 8, bold: true },
  //                   { text: 'GUANAJUATO, MÉXICO', fontSize: 6 }
  //                 ]
  //               },
  //               {
  //                 stack: [
  //                   { text: `🔄 ${esContrarreferencia ? 'CONTRARREFERENCIA' : 'REFERENCIA'}`, fontSize: 16, bold: true, alignment: 'center', color: '#059669' },
  //                   { text: 'SISTEMA DE REFERENCIA MÉDICA', fontSize: 8, alignment: 'center', italics: true },
  //                   { text: 'NOM-004-SSA3-2012', fontSize: 6, alignment: 'center', color: '#666666' }
  //                 ]
  //               },
  //               {
  //                 stack: [
  //                   { text: 'FOLIO:', fontSize: 6, bold: true, alignment: 'right' },
  //                   { text: referencia.folio_referencia || this.generarFolioReferencia(), fontSize: 8, alignment: 'right' },
  //                   { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}`, fontSize: 6, alignment: 'right', margin: [0, 2] },
  //                   { text: `Urgencia: ${this.formatearUrgenciaReferencia(referencia.urgencia_referencia)}`, fontSize: 6, alignment: 'right', color: referencia.urgencia_referencia === 'urgente' ? '#dc2626' : '#059669' }
  //                 ]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: 'noBorders'
  //       };
  //     },

  //     content: [
  //       // INFORMACIÓN DEL PACIENTE
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: '👤 DATOS DEL PACIENTE',
  //                 style: 'sectionHeader',
  //                 fillColor: '#f0fdf4',
  //                 margin: [10, 8]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 10]
  //       },

  //       {
  //         table: {
  //           widths: ['25%', '25%', '25%', '25%'],
  //           body: [
  //             [
  //               { text: 'Nombre:', style: 'fieldLabel' },
  //               { text: pacienteCompleto.nombre_completo || 'N/A', style: 'fieldValue' },
  //               { text: 'Expediente:', style: 'fieldLabel' },
  //               { text: pacienteCompleto.numero_expediente || 'N/A', style: 'fieldValue' }
  //             ],
  //             [
  //               { text: 'Edad:', style: 'fieldLabel' },
  //               { text: `${pacienteCompleto.edad || 'N/A'} años`, style: 'fieldValue' },
  //               { text: 'Sexo:', style: 'fieldLabel' },
  //               { text: pacienteCompleto.sexo || 'N/A', style: 'fieldValue' }
  //             ],
  //             [
  //               { text: 'Tipo de Sangre:', style: 'fieldLabel' },
  //               { text: pacienteCompleto.tipo_sangre || 'No especificado', style: 'fieldValue' },
  //               { text: 'Teléfono:', style: 'fieldLabel' },
  //               { text: pacienteCompleto.telefono || 'No especificado', style: 'fieldValue' }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15]
  //       },

  //       // INFORMACIÓN DE LA REFERENCIA
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: `🏥 INFORMACIÓN DE ${esContrarreferencia ? 'CONTRARREFERENCIA' : 'REFERENCIA'}`,
  //                 style: 'sectionHeader',
  //                 fillColor: '#f0fdf4',
  //                 margin: [10, 8]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 10]
  //       },

  //       {
  //         table: {
  //           widths: ['50%', '50%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'INSTITUCIÓN DESTINO:', style: 'fieldLabel' },
  //                   { text: referencia.institucion_destino || 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 10] },
  //                   { text: 'NIVEL DE ATENCIÓN:', style: 'fieldLabel' },
  //                   { text: this.formatearNivelAtencion(referencia.nivel_atencion_destino), style: 'fieldValue', margin: [0, 5, 0, 10] }
  //                 ]
  //               },
  //               {
  //                 stack: [
  //                   { text: 'MÉDICO DESTINO:', style: 'fieldLabel' },
  //                   { text: referencia.medico_destino || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 10] },
  //                   { text: 'ESPECIALIDAD:', style: 'fieldLabel' },
  //                   { text: referencia.especialidad_destino || 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 10] }
  //                 ]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15]
  //       },

  //       // MOTIVO Y DIAGNÓSTICO
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'MOTIVO DE REFERENCIA:', style: 'fieldLabel' },
  //                   { text: referencia.motivo_referencia || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'DIAGNÓSTICO:', style: 'fieldLabel' },
  //                   { text: referencia.diagnostico_referencia || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'RESUMEN CLÍNICO:', style: 'fieldLabel' },
  //                   { text: referencia.resumen_clinico || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 0] }
  //                 ],
  //                 margin: [10, 10]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15]
  //       },

  //       // ESTADO ACTUAL DEL PACIENTE
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: '🩺 ESTADO ACTUAL DEL PACIENTE',
  //                 style: 'sectionHeader',
  //                 fillColor: '#fef3c7',
  //                 margin: [10, 8]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 10]
  //       },

  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'ESTADO DEL PACIENTE:', style: 'fieldLabel' },
  //                   { text: referencia.estado_paciente || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   ...(referencia.estudios_realizados ? [
  //                     { text: 'ESTUDIOS REALIZADOS:', style: 'fieldLabel' },
  //                     { text: referencia.estudios_realizados, style: 'fieldValue', margin: [0, 5, 0, 15] }
  //                   ] : []),

  //                   ...(referencia.tratamiento_actual ? [
  //                     { text: 'TRATAMIENTO ACTUAL:', style: 'fieldLabel' },
  //                     { text: referencia.tratamiento_actual, style: 'fieldValue', margin: [0, 5, 0, 15] }
  //                   ] : []),

  //                   ...(referencia.medicamentos_actuales ? [
  //                     { text: 'MEDICAMENTOS ACTUALES:', style: 'fieldLabel' },
  //                     { text: referencia.medicamentos_actuales, style: 'fieldValue', margin: [0, 5, 0, 0] }
  //                   ] : [])
  //                 ],
  //                 margin: [10, 10]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15]
  //       },

  //       // INFORMACIÓN DE TRASLADO
  //       ...(referencia.requiere_ambulancia || referencia.acompañante_autorizado ? [
  //         {
  //           table: {
  //             widths: ['100%'],
  //             body: [
  //               [
  //                 {
  //                   text: '🚑 INFORMACIÓN DE TRASLADO',
  //                   style: 'sectionHeader',
  //                   fillColor: '#fef2f2',
  //                   margin: [10, 8]
  //                 }
  //               ]
  //             ]
  //           },
  //           layout: this.getTableLayout(),
  //           margin: [0, 0, 0, 10]
  //         },
  //         {
  //           table: {
  //             widths: ['50%', '50%'],
  //             body: [
  //               [
  //                 {
  //                   stack: [
  //                     { text: 'REQUIERE AMBULANCIA:', style: 'fieldLabel' },
  //                     { text: referencia.requiere_ambulancia ? 'SÍ' : 'NO', style: 'fieldValue', color: referencia.requiere_ambulancia ? '#dc2626' : '#059669' },
  //                   ]
  //                 },
  //                 {
  //                   stack: [
  //                     { text: 'ACOMPAÑANTE AUTORIZADO:', style: 'fieldLabel' },
  //                     { text: referencia.acompañante_autorizado || 'No especificado', style: 'fieldValue' }
  //                   ]
  //                 }
  //               ]
  //             ]
  //           },
  //           layout: this.getTableLayout(),
  //           margin: [0, 0, 0, 15]
  //         }
  //       ] : []),

  //       // SEGUIMIENTO Y CONTRARREFERENCIA
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: '📋 SEGUIMIENTO Y CONTRARREFERENCIA',
  //                 style: 'sectionHeader',
  //                 fillColor: '#f3e8ff',
  //                 margin: [10, 8]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 10]
  //       },

  //       {
  //         table: {
  //           widths: ['50%', '50%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'REQUIERE CONTRARREFERENCIA:', style: 'fieldLabel' },
  //                   { text: referencia.requiere_contrarreferencia ? 'SÍ' : 'NO', style: 'fieldValue' },
  //                   { text: 'TIEMPO ESPERADO DE RESPUESTA:', style: 'fieldLabel', margin: [0, 10, 0, 0] },
  //                   { text: this.formatearTiempoRespuesta(referencia.tiempo_esperado_respuesta), style: 'fieldValue' }
  //                 ]
  //               },
  //               {
  //                 stack: [
  //                   { text: 'FECHA PROGRAMADA:', style: 'fieldLabel' },
  //                   { text: this.formatearFecha(referencia.fecha_programada_cita) || 'A programar', style: 'fieldValue' },
  //                   { text: 'AUTORIZACIÓN:', style: 'fieldLabel', margin: [0, 10, 0, 0] },
  //                   { text: referencia.numero_autorizacion || 'No requerida', style: 'fieldValue' }
  //                 ]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15]
  //       },

  //       // OBSERVACIONES
  //       ...(referencia.observaciones ? [
  //         {
  //           table: {
  //             widths: ['100%'],
  //             body: [
  //               [
  //                 {
  //                   stack: [
  //                     { text: 'OBSERVACIONES:', style: 'fieldLabel' },
  //                     { text: referencia.observaciones, style: 'fieldValue', margin: [0, 5] }
  //                   ],
  //                   margin: [10, 8]
  //                 }
  //               ]
  //             ]
  //           },
  //           layout: this.getTableLayout(),
  //           margin: [0, 0, 0, 20]
  //         }
  //       ] : []),

  //       // ESPACIADOR PARA FIRMAS
  //       { text: '', pageBreak: 'before' },

  //       // SECCIÓN FIRMAS
  //       {
  //         margin: [0, 40, 0, 0],
  //         table: {
  //           widths: ['50%', '50%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
  //                   { text: 'MÉDICO REFERENTE', style: 'signatureLabel' },
  //                   { text: medicoCompleto.nombre_completo || 'N/A', style: 'signatureName' },
  //                   { text: `Cédula: ${medicoCompleto.numero_cedula || 'N/A'}`, style: 'signatureDetails' },
  //                   { text: `Servicio: ${medicoCompleto.departamento || 'N/A'}`, style: 'signatureDetails' }
  //                 ]
  //               },
  //               {
  //                 stack: [
  //                   { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
  //                   { text: 'RECIBIDO POR', style: 'signatureLabel' },
  //                   { text: referencia.institucion_destino || 'Institución Destino', style: 'signatureName' },
  //                   { text: 'Fecha: ________________', style: 'signatureDetails', margin: [0, 10, 0, 0] },
  //                   { text: 'Sello Institucional', style: 'signatureDetails' }
  //                 ]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: 'noBorders'
  //       }
  //     ],

  //     footer: (currentPage: number, pageCount: number) => {
  //       return {
  //         margin: [40, 10],
  //         table: {
  //           widths: ['33%', '34%', '33%'],
  //           body: [
  //             [
  //               {
  //                 text: `${esContrarreferencia ? 'Contrarreferencia' : 'Referencia'} - Hospital General San Luis de la Paz`,
  //                 fontSize: 6,
  //                 color: '#666666'
  //               },
  //               {
  //                 text: `Página ${currentPage} de ${pageCount}`,
  //                 fontSize: 6,
  //                 alignment: 'center',
  //                 color: '#666666'
  //               },
  //               {
  //                 text: fechaActual.toLocaleString('es-MX'),
  //                 fontSize: 6,
  //                 alignment: 'right',
  //                 color: '#666666'
  //               }
  //             ]
  //           ]
  //         },
  //         layout: 'noBorders'
  //       };
  //     },

  //     styles: {
  //       sectionHeader: {
  //         fontSize: 12,
  //         bold: true,
  //         color: '#374151'
  //       },
  //       fieldLabel: {
  //         fontSize: 7,
  //         bold: true,
  //         color: '#4b5563'
  //       },
  //       fieldValue: {
  //         fontSize: 7,
  //         color: '#111827'
  //       },
  //       signatureLabel: {
  //         fontSize: 8,
  //         bold: true,
  //         alignment: 'center',
  //         color: '#374151'
  //       },
  //       signatureName: {
  //         fontSize: 7,
  //         alignment: 'center',
  //         color: '#111827'
  //       },
  //       signatureDetails: {
  //         fontSize: 6,
  //         alignment: 'center',
  //         color: '#6b7280'
  //       }
  //     }
  //   };
  // }

  async generarReferenciaContrarreferencia(datos: any): Promise<any> {
  console.log('🔄 Generando Referencia y Contrarreferencia - Estilo Profesional...');

  const { pacienteCompleto, medicoCompleto, referencia } = datos;
  const fechaActual = new Date();
  const esContrarreferencia = referencia.tipo_referencia === 'contrarreferencia';
  
  // 🔥 OBTENER CONFIGURACIÓN INTELIGENTE DE LOGOS
  const configuracion = await this.obtenerConfiguracionLogosInteligente();

  return {
    pageSize: 'LETTER',
    pageMargins: [20, 60, 20, 40],

    header: {
      margin: [20, 10, 20, 10],
      table: {
        widths: ['20%', '60%', '20%'],
        body: [
          [
            {
              // Logo de gobierno (izquierda)
              image: await this.obtenerImagenBase64(
                datos.configuracion?.logo_gobierno ||
                configuracion.logo_gobierno
              ),
              fit: [80, 40],
              alignment: 'left',
              margin: [0, 5],
            },
            {
              // Texto central
              text: esContrarreferencia 
                ? 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - CONTRARREFERENCIA MÉDICA'
                : 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - REFERENCIA MÉDICA',
              fontSize: 8,
              bold: true,
              alignment: 'center',
              color: '#1a365d',
              margin: [0, 8],
            },
            {
              // Logo del hospital (derecha)
              image: await this.obtenerImagenBase64(
                datos.configuracion?.logo_principal ||
                configuracion.logo_principal
              ),
              fit: [80, 40],
              alignment: 'right',
              margin: [0, 5],
            },
          ],
        ],
      },
      layout: 'noBorders',
    },

    content: [
      // IDENTIFICACIÓN Y DATOS BÁSICOS
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'IDENTIFICACIÓN',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 3,
              },
              {
                table: {
                  widths: ['20%', '20%', '20%', '20%', '20%'],
                  body: [
                    [
                      { text: 'Fecha referencia', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Folio', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'No. Expediente', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Urgencia', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Tipo', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'center' },
                      { text: referencia.folio_referencia || this.generarFolioReferencia(), fontSize: 7, alignment: 'center' },
                      { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto) || 'N/A', fontSize: 7, alignment: 'center', bold: true },
                      { text: this.formatearUrgenciaReferencia(referencia.urgencia_referencia), fontSize: 7, alignment: 'center', color: referencia.urgencia_referencia === 'urgente' ? '#dc2626' : '#059669' },
                      { text: esContrarreferencia ? 'CONTRARREFERENCIA' : 'REFERENCIA', fontSize: 7, alignment: 'center', bold: true, color: '#059669' },
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
                  widths: ['55%', '15%', '15%', '15%'],
                  body: [
                    [
                      { text: 'Nombre completo del paciente', fontSize: 7, bold: true },
                      { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Tipo de sangre', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: pacienteCompleto.nombre_completo, fontSize: 6, bold: true, margin: [2, 3] },
                      { text: `${pacienteCompleto.edad} años`, fontSize: 7, alignment: 'center' },
                      { text: pacienteCompleto.sexo, fontSize: 7, alignment: 'center' },
                      { text: pacienteCompleto.tipo_sangre || 'No especificado', fontSize: 7, alignment: 'center', bold: true, color: '#dc2626' },
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
                      { text: 'Médico referente', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Cédula profesional', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Especialidad', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: medicoCompleto.nombre_completo || 'No especificado', fontSize: 7, alignment: 'center' },
                      { text: medicoCompleto.numero_cedula || 'No registrada', fontSize: 7, alignment: 'center' },
                      { text: medicoCompleto.especialidad || 'N/A', fontSize: 7, alignment: 'center' },
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

      { text: '', margin: [0, 2] },

      // INFORMACIÓN DEL DESTINO
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'DESTINO',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 2,
              },
              {
                text: 'INFORMACIÓN DE LA INSTITUCIÓN DESTINO',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: [
                    [
                      { text: 'Institución destino', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Nivel de atención', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Médico destino', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Especialidad', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: referencia.institucion_destino || 'No especificada', fontSize: 7, alignment: 'center' },
                      { text: this.formatearNivelAtencion(referencia.nivel_atencion_destino), fontSize: 7, alignment: 'center' },
                      { text: referencia.medico_destino || 'No especificado', fontSize: 7, alignment: 'center' },
                      { text: referencia.especialidad_destino || 'No especificada', fontSize: 7, alignment: 'center' },
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

      { text: '', margin: [0, 2] },

      // MOTIVO Y DIAGNÓSTICO CLÍNICO
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'INFORMACIÓN CLÍNICA',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 6,
              },
              {
                text: 'MOTIVO DE LA REFERENCIA',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: referencia.motivo_referencia || 'No especificado',
                fontSize: 7,
                margin: [5, 8],
                lineHeight: 1.3,
              },
            ],
            [
              {},
              {
                text: 'DIAGNÓSTICO CLÍNICO',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: referencia.diagnostico_referencia || 'No especificado',
                fontSize: 7,
                margin: [5, 8],
                lineHeight: 1.3,
              },
            ],
            [
              {},
              {
                text: 'RESUMEN CLÍNICO Y EVOLUCIÓN',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: referencia.resumen_clinico || 'No especificado',
                fontSize: 7,
                margin: [5, 8],
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

      { text: '', margin: [0, 2] },

      // ESTADO ACTUAL Y TRATAMIENTO
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'ESTADO ACTUAL',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 6,
              },
              {
                text: 'ESTADO DEL PACIENTE',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: referencia.estado_paciente || 'No especificado',
                fontSize: 7,
                margin: [5, 8],
                lineHeight: 1.3,
              },
            ],
            [
              {},
              {
                text: 'ESTUDIOS REALIZADOS',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: referencia.estudios_realizados || 'Sin estudios específicos realizados',
                fontSize: 7,
                margin: [5, 8],
                lineHeight: 1.3,
              },
            ],
            [
              {},
              {
                text: 'TRATAMIENTO ACTUAL',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: referencia.tratamiento_actual || 'Sin tratamiento específico',
                fontSize: 7,
                margin: [5, 8],
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

      { text: '', margin: [0, 2] },

      // INFORMACIÓN DE TRASLADO Y SEGUIMIENTO
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'TRASLADO Y SEGUIMIENTO',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 4,
              },
              {
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: [
                    [
                      { text: 'Ambulancia requerida', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Acompañante autorizado', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Contrarreferencia', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Tiempo respuesta', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: referencia.requiere_ambulancia ? 'SÍ' : 'NO', fontSize: 7, alignment: 'center', color: referencia.requiere_ambulancia ? '#dc2626' : '#059669', bold: true },
                      { text: referencia.acompañante_autorizado || 'No especificado', fontSize: 7, alignment: 'center' },
                      { text: referencia.requiere_contrarreferencia ? 'SÍ' : 'NO', fontSize: 7, alignment: 'center', bold: true },
                      { text: this.formatearTiempoRespuesta(referencia.tiempo_esperado_respuesta), fontSize: 7, alignment: 'center' },
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
                text: 'FECHA PROGRAMADA Y AUTORIZACIÓN',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: `Fecha programada: ${this.formatearFecha(referencia.fecha_programada_cita) || 'A programar'}\nNúmero de autorización: ${referencia.numero_autorizacion || 'No requerida'}`,
                fontSize: 7,
                margin: [5, 8],
                lineHeight: 1.3,
              },
            ],
            [
              {},
              {
                text: 'OBSERVACIONES ADICIONALES',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
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

      // OBSERVACIONES (solo si existen)
      ...(referencia.observaciones ? [
        { text: '', margin: [0, 2] },
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: `OBSERVACIONES: ${referencia.observaciones}`,
                  fontSize: 6,
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
      ] : []),

      { text: '', margin: [0, 10] },

      // FIRMA MÉDICA COMPLETA SEGÚN NOM-004
      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              {
                text: 'MÉDICO REFERENTE',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
              {
                text: 'INSTITUCIÓN RECEPTORA',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
            ],
            [
              {
                text: [
                  {
                    text: `${medicoCompleto.titulo_profesional || 'Dr.'} ${medicoCompleto.nombre_completo}\n`,
                    fontSize: 7,
                    bold: true,
                  },
                  {
                    text: `Cédula Profesional: ${medicoCompleto.numero_cedula || 'No registrada'}\n`,
                    fontSize: 6,
                  },
                  {
                    text: `Especialidad: ${medicoCompleto.especialidad || 'N/A'}\n`,
                    fontSize: 6,
                  },
                  {
                    text: `${medicoCompleto.cargo || 'Médico'} - ${medicoCompleto.departamento || 'N/A'}\n`,
                    fontSize: 6,
                  },
                  {
                    text: `Hospital General San Luis de la Paz\n`,
                    fontSize: 7,
                    color: '#6b7280',
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
                margin: [5, 20],
                alignment: 'center',
              },
              {
                text: [
                  {
                    text: `${referencia.institucion_destino || 'Institución Destino'}\n`,
                    fontSize: 7,
                    bold: true,
                  },
                  {
                    text: `${referencia.medico_destino || 'Médico Receptor'}\n`,
                    fontSize: 6,
                  },
                  {
                    text: `${referencia.especialidad_destino || 'Especialidad'}\n`,
                    fontSize: 6,
                  },
                  {
                    text: '\n\n_________________________\n',
                    fontSize: 6,
                  },
                  {
                    text: 'FIRMA Y SELLO INSTITUCIONAL\n',
                    fontSize: 7,
                    bold: true,
                  },
                  {
                    text: `Fecha recepción: _______________\n`,
                    fontSize: 7,
                  },
                  {
                    text: `(NOM-004-SSA3-2012)`,
                    fontSize: 6,
                    italics: true,
                  },
                ],
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

      // NOTAS AL PIE
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
                text: '• Sistema de referencia y contrarreferencia\n',
                fontSize: 6,
                color: '#666666',
              },
              {
                text: '• Continuidad de la atención médica',
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
                text: `Documento generado: ${fechaActual.toLocaleString('es-MX')}\n`,
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
                text: `${esContrarreferencia ? 'Contrarreferencia' : 'Referencia'} Médica - SICEG\nNOM-004-SSA3-2012 • Sistema de Referencia`,
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
                    text: `Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
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


  // async generarNotaConsentimientoProcedimientos(datos: any): Promise<any> {
  //   console.log(
  //     '📝 Generando Nota de Consentimiento Informado para Procedimientos según NOM-004...'
  //   );

  //   // ✅ CORRECCIÓN: Usar los datos ya preparados
  //   const medicoCompleto = datos.medicoCompleto;
  //   const pacienteCompleto = datos.pacienteCompleto;
  //   const consentimientoData = datos.consentimiento || {};
  //   const fechaActual = new Date();

  //   return {
  //     pageSize: 'LETTER',
  //     pageMargins: [40, 80, 40, 80],

  //     header: {
  //       margin: [40, 20, 40, 20],
  //       table: {
  //         widths: ['100%'],
  //         body: [
  //           [
  //             {
  //               text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ',
  //               fontSize: 14,
  //               bold: true,
  //               alignment: 'center',
  //             },
  //           ],
  //           [
  //             {
  //               text: 'CARTA DE CONSENTIMIENTO INFORMADO PARA',
  //               fontSize: 12,
  //               bold: true,
  //               alignment: 'center',
  //               margin: [0, 5, 0, 0],
  //             },
  //           ],
  //           [
  //             {
  //               text: 'OPERACIÓN O PROCEDIMIENTOS Y ALTERNATIVAS',
  //               fontSize: 14,
  //               bold: true,
  //               alignment: 'center',
  //               margin: [0, 2, 0, 0],
  //             },
  //           ],
  //         ],
  //       },
  //       layout: 'noBorders',
  //     },

  //     content: [
  //       { text: '', margin: [0, 10] },

  //       // 🔹 DATOS DEL PACIENTE
  //       {
  //         table: {
  //           widths: ['13%', '37%', '8%', '12%', '12%', '18%'],
  //           body: [
  //             [
  //               { text: 'Nombre:', fontSize: 7, bold: true },
  //               {
  //                 text: pacienteCompleto.nombre_completo,
  //                 fontSize: 7,
  //                 decoration: 'underline',
  //               },
  //               { text: 'Edad:', fontSize: 7, bold: true },
  //               {
  //                 text: `${pacienteCompleto.edad} años`,
  //                 fontSize: 7,
  //                 decoration: 'underline',
  //               },
  //               { text: 'Fecha:', fontSize: 7, bold: true },
  //               {
  //                 text: fechaActual.toLocaleDateString('es-MX'),
  //                 fontSize: 7,
  //                 decoration: 'underline',
  //               },
  //             ],
  //             [
  //               { text: 'CURP:', fontSize: 7, bold: true },
  //               {
  //                 text: pacienteCompleto.curp,
  //                 fontSize: 7,
  //                 decoration: 'underline',
  //               },
  //               { text: 'Sexo:', fontSize: 7, bold: true },
  //               {
  //                 text: pacienteCompleto.sexo,
  //                 fontSize: 7,
  //                 decoration: 'underline',
  //               },
  //               { text: 'Expediente:', fontSize: 7, bold: true },
  //               {
  //                 text: this.obtenerNumeroExpedientePreferido(
  //                   pacienteCompleto.expediente
  //                 ),
  //                 fontSize: 7,
  //                 decoration: 'underline',
  //               },
  //             ],
  //             [
  //               { text: 'F. Nacimiento:', fontSize: 6, bold: true },
  //               {
  //                 text: pacienteCompleto.fecha_nacimiento || 'No registrada',
  //                 fontSize: 7,
  //                 decoration: 'underline',
  //               },
  //               { text: 'Cama:', fontSize: 7, bold: true },
  //               {
  //                 text: consentimientoData.numero_cama || 'N/A',
  //                 fontSize: 7,
  //                 decoration: 'underline',
  //               },
  //               { text: 'Servicio:', fontSize: 7, bold: true },
  //               {
  //                 text: medicoCompleto.departamento,
  //                 fontSize: 7,
  //                 decoration: 'underline',
  //               },
  //             ],
  //           ],
  //         },
  //         layout: 'noBorders',
  //         margin: [0, 0, 0, 20],
  //       },

  //       // 🔹 DECLARACIÓN INICIAL
  //       {
  //         table: {
  //           widths: ['5%', '95%'],
  //           body: [
  //             [
  //               { text: 'YO', fontSize: 11, bold: true },
  //               {
  //                 text:
  //                   consentimientoData.nombre_responsable ||
  //                   pacienteCompleto.nombre_completo,
  //                 fontSize: 11,
  //                 decoration: 'underline',
  //                 color: '#000000',
  //               },
  //             ],
  //           ],
  //         },
  //         layout: 'noBorders',
  //         margin: [0, 0, 0, 15],
  //       },

  //       {
  //         text: [
  //           {
  //             text: 'en pleno uso de mis facultades mentales, ',
  //             fontSize: 11,
  //           },
  //           { text: 'AUTORIZO', fontSize: 11, bold: true },
  //           {
  //             text: ' a este Hospital y a su personal para realizar la siguiente Operación (o Procedimiento):',
  //             fontSize: 11,
  //           },
  //         ],
  //         lineHeight: 1.1,
  //         margin: [0, 0, 0, 10],
  //       },

  //       // 🔹 NOMBRE DEL PROCEDIMIENTO
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text:
  //                   consentimientoData.nombre_procedimiento ||
  //                   '________________________________________________________________________',
  //                 fontSize: 12,
  //                 bold: true,
  //                 alignment: 'center',
  //                 margin: [0, 15, 0, 15],
  //               },
  //             ],
  //           ],
  //         },
  //         layout: {
  //           hLineWidth: () => 1,
  //           vLineWidth: () => 1,
  //           hLineColor: () => '#000000',
  //           vLineColor: () => '#000000',
  //         },
  //         margin: [0, 0, 0, 15],
  //       },

  //       {
  //         text: 'Entendiendo que la ventaja de someterme a este procedimiento quirúrgico o diagnóstico es:',
  //         fontSize: 11,
  //         margin: [0, 0, 0, 10],
  //       },

  //       // 🔹 BENEFICIOS DEL PROCEDIMIENTO
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text:
  //                   consentimientoData.beneficios_procedimiento ||
  //                   '_________________________________________________________________\n_________________________________________________________________',
  //                 fontSize: 8,
  //                 margin: [10, 10, 10, 10],
  //                 minHeight: 40,
  //               },
  //             ],
  //           ],
  //         },
  //         layout: {
  //           hLineWidth: () => 1,
  //           vLineWidth: () => 1,
  //           hLineColor: () => '#000000',
  //           vLineColor: () => '#000000',
  //         },
  //         margin: [0, 0, 0, 15],
  //       },

  //       // 🔹 RIESGOS
  //       {
  //         text: [{ text: 'RIESGOS:', fontSize: 11, bold: true }],
  //         margin: [0, 0, 0, 10],
  //       },

  //       {
  //         text: 'Se da autorización bajo el entendimiento pleno de que cualquier operación o procedimiento médico-quirúrgico, implica algún(os) riesgo(s) y/o peligro(s). Los riesgos más comunes incluyen: Infección, Hemorragia, Lesión nerviosa, Coágulos sanguíneos, ataque cardiaco, Reacciones alérgicas y neumonía. Estos riesgos pueden ser graves e incluso mortales. Algunos riesgos importantes en especial de este tipo de intervención que se va a realizar son:',
  //         fontSize: 8,
  //         lineHeight: 1.1,
  //         margin: [0, 0, 0, 15],
  //       },

  //       // 🔹 RIESGOS ESPECÍFICOS
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text:
  //                   consentimientoData.riesgos_especificos ||
  //                   '_________________________________________________________________\n_________________________________________________________________\n_________________________________________________________________',
  //                 fontSize: 8,
  //                 margin: [10, 10, 10, 10],
  //                 minHeight: 60,
  //               },
  //             ],
  //           ],
  //         },
  //         layout: {
  //           hLineWidth: () => 1,
  //           vLineWidth: () => 1,
  //           hLineColor: () => '#000000',
  //           vLineColor: () => '#000000',
  //         },
  //         margin: [0, 0, 0, 15],
  //       },

  //       // 🔹 ANESTESIA
  //       {
  //         text: [{ text: 'ANESTESIA:', fontSize: 11, bold: true }],
  //         margin: [0, 0, 0, 10],
  //       },

  //       {
  //         text: [
  //           {
  //             text: 'La aplicación de Anestesia también implica riesgos; el más importante de estos, aunque poco frecuente que suceda, es el riesgo de sufrir alguna reacción a los medicamentos que pueden ser incluso fatales. ',
  //             fontSize: 11,
  //           },
  //           { text: 'Autorizo', fontSize: 11, bold: true },
  //           {
  //             text: ' la técnica y el uso de anestésicos que juzgue necesarios la persona de este servicio para la realización del procedimiento autorizado.',
  //             fontSize: 11,
  //           },
  //         ],
  //         lineHeight: 1.1,
  //         margin: [0, 0, 0, 15],
  //       },

  //       // 🔹 PROCEDIMIENTOS ADICIONALES
  //       {
  //         text: [
  //           { text: 'PROCEDIMIENTOS ADICIONALES:', fontSize: 11, bold: true },
  //         ],
  //         margin: [0, 0, 0, 10],
  //       },

  //       {
  //         text: [
  //           {
  //             text: 'Si mi Médico selecciona un procedimiento diferente, por alguna situación especial no sospechada en el transcurso de mi intervención, (sí ó no) ',
  //             fontSize: 11,
  //           },
  //           {
  //             text:
  //               consentimientoData.autoriza_procedimientos_adicionales ||
  //               '______',
  //             fontSize: 11,
  //             decoration: 'underline',
  //           },
  //           {
  //             text: ' lo autorizo a realizar si lo considera necesario',
  //             fontSize: 11,
  //           },
  //         ],
  //         lineHeight: 1.1,
  //         margin: [0, 0, 0, 15],
  //       },

  //       {
  //         text: 'Estoy enterado(a), de que no existe garantía o seguridad sobre resultados del procedimiento y de que existe la posibilidad de que no pueda curarse la enfermedad o padecimiento que presento.',
  //         fontSize: 11,
  //         lineHeight: 1.1,
  //         margin: [0, 0, 0, 15],
  //       },

  //       {
  //         text: 'Así también estoy enterado(a) de que nadie puede decir con seguridad cuáles serán las complicaciones que ocurran en mi caso, si es que las hay.',
  //         fontSize: 11,
  //         lineHeight: 1.1,
  //         margin: [0, 0, 0, 20],
  //       },

  //       // 🔹 CONSENTIMIENTO DEL PACIENTE
  //       {
  //         text: [
  //           {
  //             text: 'CONSENTIMIENTO DEL PACIENTE, O TUTOR:',
  //             fontSize: 11,
  //             bold: true,
  //           },
  //         ],
  //         margin: [0, 0, 0, 15],
  //       },

  //       {
  //         text: 'Tengo que leer y entender esta forma de consentimiento, la que no debo firmar si alguno de los párrafos o de mis dudas no han sido explicadas a mi entera satisfacción o si no entiendo cualquier término o palabra contenida en ese documento.',
  //         fontSize: 11,
  //         lineHeight: 1.1,
  //         margin: [0, 0, 0, 15],
  //       },

  //       {
  //         text: 'Si tiene cualquier duda acerca de los riesgos o peligros de la cirugía o tratamiento propuesto, pregunte a su Cirujano, ahora. ¡Antes de firmar el documento! ¡No firme a menos de que entienda por completo este documento!',
  //         fontSize: 11,
  //         lineHeight: 1.1,
  //         margin: [0, 0, 0, 25],
  //       },

  //       // 🔹 FIRMAS
  //       {
  //         table: {
  //           widths: ['50%', '50%'],
  //           body: [
  //             [
  //               {
  //                 text: '\n\n\n_________________________________\nNombre y firma del médico',
  //                 fontSize: 11,
  //                 alignment: 'center',
  //                 margin: [0, 20, 0, 10],
  //               },
  //               {
  //                 text: '\n\n\n_________________________________\nNombre y firma del paciente, tutor o representante',
  //                 fontSize: 11,
  //                 alignment: 'center',
  //                 margin: [0, 20, 0, 10],
  //               },
  //             ],
  //           ],
  //         },
  //         layout: 'noBorders',
  //         margin: [0, 0, 0, 20],
  //       },

  //       {
  //         table: {
  //           widths: ['50%', '50%'],
  //           body: [
  //             [
  //               {
  //                 text: '\n\n\n_________________________________\nTestigo nombre y firma',
  //                 fontSize: 11,
  //                 alignment: 'center',
  //                 margin: [0, 10, 0, 10],
  //               },
  //               {
  //                 text: '\n\n\n_________________________________\nTestigo nombre y firma',
  //                 fontSize: 11,
  //                 alignment: 'center',
  //                 margin: [0, 10, 0, 10],
  //               },
  //             ],
  //           ],
  //         },
  //         layout: 'noBorders',
  //         margin: [0, 0, 0, 30],
  //       },

  //       // 🔹 LUGAR Y FECHA
  //       {
  //         table: {
  //           widths: ['35%', '10%', '8%', '20%', '8%', '19%'],
  //           body: [
  //             [
  //               { text: 'San Luis de la Paz, Guanajuato a', fontSize: 8 },
  //               {
  //                 text: fechaActual.getDate(),
  //                 fontSize: 8,
  //                 decoration: 'underline',
  //                 alignment: 'center',
  //               },
  //               { text: 'de', fontSize: 8, alignment: 'center' },
  //               {
  //                 text: fechaActual.toLocaleDateString('es-MX', {
  //                   month: 'long',
  //                 }),
  //                 fontSize: 8,
  //                 decoration: 'underline',
  //                 alignment: 'center',
  //               },
  //               { text: 'de', fontSize: 8, alignment: 'center' },
  //               {
  //                 text: `20${fechaActual.getFullYear().toString().slice(-2)}`,
  //                 fontSize: 8,
  //                 decoration: 'underline',
  //                 alignment: 'center',
  //               },
  //             ],
  //           ],
  //         },
  //         layout: 'noBorders',
  //         alignment: 'center',
  //       },
  //     ],

  //     footer: (currentPage: number, pageCount: number) => {
  //       return {
  //         margin: [40, 20],
  //         table: {
  //           widths: ['25%', '50%', '25%'],
  //           body: [
  //             [
  //               {
  //                 text: `Página ${currentPage} de ${pageCount}`,
  //                 fontSize: 6,
  //                 color: '#000000',
  //               },
  //               {
  //                 text: 'Consentimiento Informado - SICEG\nNOM-004-SSA3-2012',
  //                 fontSize: 6,
  //                 alignment: 'center',
  //                 color: '#000000',
  //               },
  //               {
  //                 text: [
  //                   {
  //                     text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
  //                     fontSize: 6,
  //                   },
  //                   {
  //                     text: `Exp: ${this.obtenerNumeroExpedientePreferido(
  //                       pacienteCompleto.expediente
  //                     )}`,
  //                     fontSize: 7,
  //                   },
  //                 ],
  //                 alignment: 'right',
  //                 color: '#000000',
  //               },
  //             ],
  //           ],
  //         },
  //         layout: 'noBorders',
  //       };
  //     },
  //   };
  // }

// async generarNotaConsentimientoProcedimientos(datos: any): Promise<any> {
//   console.log('📝 Generando Consentimiento Informado - Estilo Profesional...');

//   const { pacienteCompleto, medicoCompleto, consentimiento } = datos;
//   const fechaActual = new Date();
  
//   // 🔥 OBTENER CONFIGURACIÓN INTELIGENTE DE LOGOS
//   const configuracion = await this.obtenerConfiguracionLogosInteligente();

//   return {
//     pageSize: 'LETTER',
//     pageMargins: [20, 60, 20, 40],

//     header: {
//       margin: [20, 10, 20, 10],
//       table: {
//         widths: ['20%', '60%', '20%'],
//         body: [
//           [
//             {
//               // Logo de gobierno (izquierda)
//               image: await this.obtenerImagenBase64(
//                 datos.configuracion?.logo_gobierno ||
//                 configuracion.logo_gobierno
//               ),
//               fit: [80, 40],
//               alignment: 'left',
//               margin: [0, 5],
//             },
//             {
//               // Texto central
//               text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - CONSENTIMIENTO INFORMADO',
//               fontSize: 8,
//               bold: true,
//               alignment: 'center',
//               color: '#1a365d',
//               margin: [0, 8],
//             },
//             {
//               // Logo del hospital (derecha)
//               image: await this.obtenerImagenBase64(
//                 datos.configuracion?.logo_principal ||
//                 configuracion.logo_principal
//               ),
//               fit: [80, 40],
//               alignment: 'right',
//               margin: [0, 5],
//             },
//           ],
//         ],
//       },
//       layout: 'noBorders',
//     },

//     content: [
//       // IDENTIFICACIÓN Y DATOS BÁSICOS
//       {
//         table: {
//           widths: ['15%', '85%'],
//           body: [
//             [
//               {
//                 text: 'IDENTIFICACIÓN',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f5f5f5',
//                 alignment: 'center',
//                 rowSpan: 3,
//               },
//               {
//                 table: {
//                   widths: ['20%', '20%', '20%', '20%', '20%'],
//                   body: [
//                     [
//                       { text: 'Fecha', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Hora', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'No. Expediente', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Folio', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Servicio', fontSize: 7, bold: true, alignment: 'center' },
//                     ],
//                     [
//                       { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'center' },
//                       { text: fechaActual.toLocaleTimeString('es-MX'), fontSize: 7, alignment: 'center' },
//                       { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto) || 'N/A', fontSize: 7, alignment: 'center', bold: true },
//                       { text: consentimiento.folio_consentimiento || this.generarFolioConsentimiento(), fontSize: 7, alignment: 'center', bold: true, color: '#dc2626' },
//                       { text: consentimiento.servicio_medico || medicoCompleto.departamento || 'N/A', fontSize: 7, alignment: 'center' },
//                     ],
//                   ],
//                 },
//                 layout: {
//                   hLineWidth: () => 0.3,
//                   vLineWidth: () => 0.3,
//                   hLineColor: () => '#000000',
//                   vLineColor: () => '#000000',
//                 },
//               },
//             ],
//             [
//               {},
//               {
//                 table: {
//                   widths: ['55%', '15%', '15%', '15%'],
//                   body: [
//                     [
//                       { text: 'Nombre completo del paciente', fontSize: 7, bold: true },
//                       { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Tipo de sangre', fontSize: 7, bold: true, alignment: 'center' },
//                     ],
//                     [
//                       { text: pacienteCompleto.nombre_completo, fontSize: 6, bold: true, margin: [2, 3] },
//                       { text: `${pacienteCompleto.edad} años`, fontSize: 7, alignment: 'center' },
//                       { text: pacienteCompleto.sexo, fontSize: 7, alignment: 'center' },
//                       { text: pacienteCompleto.tipo_sangre || 'No especificado', fontSize: 7, alignment: 'center', bold: true, color: '#dc2626' },
//                     ],
//                   ],
//                 },
//                 layout: {
//                   hLineWidth: () => 0.3,
//                   vLineWidth: () => 0.3,
//                   hLineColor: () => '#000000',
//                   vLineColor: () => '#000000',
//                 },
//               },
//             ],
//             [
//               {},
//               {
//                 table: {
//                   widths: ['50%', '25%', '25%'],
//                   body: [
//                     [
//                       { text: 'Médico responsable', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Cédula profesional', fontSize: 7, bold: true, alignment: 'center' },
//                       { text: 'Cama/Habitación', fontSize: 7, bold: true, alignment: 'center' },
//                     ],
//                     [
//                       { text: medicoCompleto.nombre_completo || 'No especificado', fontSize: 7, alignment: 'center' },
//                       { text: medicoCompleto.numero_cedula || 'No registrada', fontSize: 7, alignment: 'center' },
//                       { text: consentimiento.numero_cama || 'N/A', fontSize: 7, alignment: 'center' },
//                     ],
//                   ],
//                 },
//                 layout: {
//                   hLineWidth: () => 0.3,
//                   vLineWidth: () => 0.3,
//                   hLineColor: () => '#000000',
//                   vLineColor: () => '#000000',
//                 },
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//       },

//       { text: '', margin: [0, 2] },

//       // DECLARACIÓN INICIAL
//       {
//         table: {
//           widths: ['15%', '85%'],
//           body: [
//             [
//               {
//                 text: 'DECLARACIÓN',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f5f5f5',
//                 alignment: 'center',
//                 rowSpan: 2,
//               },
//               {
//                 text: 'CONSENTIMIENTO PARA PROCEDIMIENTO MÉDICO',
//                 fontSize: 7,
//                 bold: true,
//                 fillColor: '#fafafa',
//               },
//             ],
//             [
//               {},
//               {
//                 text: [
//                   { text: 'YO, ', fontSize: 7, bold: true },
//                   { text: consentimiento.nombre_responsable || pacienteCompleto.nombre_completo, fontSize: 6, bold: true, decoration: 'underline' },
//                   { text: `, en mi calidad de `, fontSize: 7 },
//                   { text: consentimiento.parentesco || 'paciente', fontSize: 7, bold: true, color: '#dc2626' },
//                   { text: ', en pleno uso de mis facultades mentales, AUTORIZO al personal médico de este Hospital para realizar el siguiente procedimiento:', fontSize: 7 }
//                 ],
//                 margin: [5, 8],
//                 lineHeight: 1.3,
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//       },

//       { text: '', margin: [0, 2] },

//       // PROCEDIMIENTO Y BENEFICIOS
//       {
//         table: {
//           widths: ['15%', '85%'],
//           body: [
//             [
//               {
//                 text: 'PROCEDIMIENTO',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f5f5f5',
//                 alignment: 'center',
//                 rowSpan: 6,
//               },
//               {
//                 text: 'NOMBRE DEL PROCEDIMIENTO',
//                 fontSize: 7,
//                 bold: true,
//                 fillColor: '#fafafa',
//               },
//             ],
//             [
//               {},
//               {
//                 text: consentimiento.nombre_procedimiento || 'No especificado',
//                 fontSize: 6,
//                 bold: true,
//                 margin: [5, 8],
//                 lineHeight: 1.3,
//               },
//             ],
//             [
//               {},
//               {
//                 text: 'TIPO DE PROCEDIMIENTO',
//                 fontSize: 7,
//                 bold: true,
//                 fillColor: '#fafafa',
//               },
//             ],
//             [
//               {},
//               {
//                 text: this.formatearTipoProcedimiento(consentimiento.tipo_procedimiento),
//                 fontSize: 7,
//                 margin: [5, 8],
//                 lineHeight: 1.3,
//               },
//             ],
//             [
//               {},
//               {
//                 text: 'BENEFICIOS DEL PROCEDIMIENTO',
//                 fontSize: 7,
//                 bold: true,
//                 fillColor: '#fafafa',
//               },
//             ],
//             [
//               {},
//               {
//                 text: consentimiento.beneficios_procedimiento || 'No especificado',
//                 fontSize: 7,
//                 margin: [5, 8],
//                 lineHeight: 1.3,
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//       },

//       { text: '', margin: [0, 2] },

//       // RIESGOS Y ALTERNATIVAS
//       {
//         table: {
//           widths: ['15%', '85%'],
//           body: [
//             [
//               {
//                 text: 'RIESGOS Y ALTERNATIVAS',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f5f5f5',
//                 alignment: 'center',
//                 rowSpan: 6,
//               },
//               {
//                 text: 'RIESGOS ESPECÍFICOS DEL PROCEDIMIENTO',
//                 fontSize: 7,
//                 bold: true,
//                 fillColor: '#fafafa',
//               },
//             ],
//             [
//               {},
//               {
//                 text: consentimiento.riesgos_especificos || 'Los riesgos incluyen pero no se limitan a: infección, hemorragia, reacciones alérgicas, y complicaciones relacionadas con la anestesia.',
//                 fontSize: 7,
//                 margin: [5, 8],
//                 lineHeight: 1.3,
//               },
//             ],
//             [
//               {},
//               {
//                 text: 'RIESGOS DE LA ANESTESIA',
//                 fontSize: 7,
//                 bold: true,
//                 fillColor: '#fafafa',
//               },
//             ],
//             [
//               {},
//               {
//                 text: consentimiento.riesgos_anestesia || 'Se han explicado los riesgos de la anestesia',
//                 fontSize: 7,
//                 margin: [5, 8],
//                 lineHeight: 1.3,
//               },
//             ],
//             [
//               {},
//               {
//                 text: 'ALTERNATIVAS DE TRATAMIENTO',
//                 fontSize: 7,
//                 bold: true,
//                 fillColor: '#fafafa',
//               },
//             ],
//             [
//               {},
//               {
//                 text: consentimiento.alternativas_tratamiento || 'Se han explicado las alternativas de tratamiento disponibles',
//                 fontSize: 7,
//                 margin: [5, 8],
//                 lineHeight: 1.3,
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//       },

//       { text: '', margin: [0, 2] },

//       // PROCEDIMIENTOS ADICIONALES
//       {
//         table: {
//           widths: ['15%', '85%'],
//           body: [
//             [
//               {
//                 text: 'AUTORIZACIONES',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f5f5f5',
//                 alignment: 'center',
//                 rowSpan: 2,
//               },
//               {
//                 text: 'PROCEDIMIENTOS ADICIONALES',
//                 fontSize: 7,
//                 bold: true,
//                 fillColor: '#fafafa',
//               },
//             ],
//             [
//               {},
//               {
//                 text: [
//                   { text: 'Si durante el procedimiento se requieren técnicas adicionales no previstas, ', fontSize: 7 },
//                   { text: consentimiento.autoriza_procedimientos_adicionales === 'si' ? 'SÍ AUTORIZO' : 'NO AUTORIZO', fontSize: 7, bold: true, color: consentimiento.autoriza_procedimientos_adicionales === 'si' ? '#059669' : '#dc2626' },
//                   { text: ' su realización si el médico lo considera necesario.', fontSize: 7 }
//                 ],
//                 margin: [5, 8],
//                 lineHeight: 1.3,
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//       },

//       { text: '', margin: [0, 2] },

//       // CONFIRMACIONES
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'CONFIRMACIONES DEL PACIENTE/RESPONSABLE',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f8f8f8',
//                 margin: [10, 8],
//                 alignment: 'center',
//               },
//             ],
//             [
//               {
//                 text: [
//                   { text: '✓ ', fontSize: 6, color: '#059669' },
//                   { text: 'He recibido explicación satisfactoria sobre el procedimiento\n', fontSize: 7 },
//                   { text: '✓ ', fontSize: 6, color: '#059669' },
//                   { text: 'Todas mis dudas han sido resueltas adecuadamente\n', fontSize: 7 },
//                   { text: '✓ ', fontSize: 6, color: '#059669' },
//                   { text: 'Comprendo completamente los riesgos involucrados\n', fontSize: 7 },
//                   { text: '✓ ', fontSize: 6, color: '#059669' },
//                   { text: 'Esta decisión es completamente voluntaria y libre', fontSize: 7 }
//                 ],
//                 margin: [10, 10],
//                 lineHeight: 1.3,
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//       },

//       // OBSERVACIONES (si existen)
//       ...(consentimiento.observaciones ? [
//         { text: '', margin: [0, 2] },
//         {
//           table: {
//             widths: ['100%'],
//             body: [
//               [
//                 {
//                   text: `OBSERVACIONES: ${consentimiento.observaciones}`,
//                   fontSize: 6,
//                   bold: true,
//                   fillColor: '#f8f8f8',
//                   margin: [5, 8],
//                   alignment: 'center',
//                   lineHeight: 1.1,
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
//       ] : []),

//       { text: '', margin: [0, 10] },

//       // FIRMAS
//       {
//         table: {
//           widths: ['50%', '50%'],
//           body: [
//             [
//               {
//                 text: 'PACIENTE / RESPONSABLE LEGAL',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f5f5f5',
//                 alignment: 'center',
//                 margin: [2, 5],
//               },
//               {
//                 text: 'MÉDICO RESPONSABLE',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f5f5f5',
//                 alignment: 'center',
//                 margin: [2, 5],
//               },
//             ],
//             [
//               {
//                 text: [
//                   {
//                     text: `${consentimiento.nombre_responsable || pacienteCompleto.nombre_completo}\n`,
//                     fontSize: 7,
//                     bold: true,
//                   },
//                   {
//                     text: `Parentesco: ${consentimiento.parentesco || 'Paciente'}\n`,
//                     fontSize: 6,
//                   },
//                   {
//                     text: `Identificación: ${consentimiento.identificacion_responsable || 'No proporcionada'}\n`,
//                     fontSize: 6,
//                   },
//                   {
//                     text: `\n\n_________________________\n`,
//                     fontSize: 6,
//                   },
//                   {
//                     text: `FIRMA\n`,
//                     fontSize: 7,
//                     bold: true,
//                   },
//                   {
//                     text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}\n`,
//                     fontSize: 7,
//                   },
//                   {
//                     text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`,
//                     fontSize: 7,
//                   },
//                 ],
//                 margin: [5, 20],
//                 alignment: 'center',
//               },
//               {
//                 text: [
//                   {
//                     text: `${medicoCompleto.titulo_profesional || 'Dr.'} ${medicoCompleto.nombre_completo}\n`,
//                     fontSize: 7,
//                     bold: true,
//                   },
//                   {
//                     text: `Cédula Profesional: ${medicoCompleto.numero_cedula || 'No registrada'}\n`,
//                     fontSize: 6,
//                   },
//                   {
//                     text: `Especialidad: ${medicoCompleto.especialidad || 'N/A'}\n`,
//                     fontSize: 6,
//                   },
//                   {
//                     text: `\n_________________________\n`,
//                     fontSize: 6,
//                   },
//                   {
//                     text: `FIRMA DEL MÉDICO\n`,
//                     fontSize: 7,
//                     bold: true,
//                   },
//                   {
//                     text: `(NOM-004-SSA3-2012)`,
//                     fontSize: 6,
//                     italics: true,
//                   },
//                 ],
//                 margin: [5, 20],
//                 alignment: 'center',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//       },

//       // TESTIGOS
//       {
//         margin: [0, 10, 0, 0],
//         table: {
//           widths: ['50%', '50%'],
//           body: [
//             [
//               {
//                 text: 'TESTIGO 1',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f5f5f5',
//                 alignment: 'center',
//                 margin: [2, 5],
//               },
//               {
//                 text: 'TESTIGO 2',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f5f5f5',
//                 alignment: 'center',
//                 margin: [2, 5],
//               },
//             ],
//             [
//               {
//                 text: [
//                   {
//                     text: `${consentimiento.testigo1_nombre || 'N/A'}\n`,
//                     fontSize: 7,
//                     bold: true,
//                   },
//                   {
//                     text: `ID: ${consentimiento.testigo1_identificacion || 'N/A'}\n`,
//                     fontSize: 6,
//                   },
//                   {
//                     text: `\n\n_________________________\n`,
//                     fontSize: 6,
//                   },
//                   {
//                     text: `FIRMA TESTIGO 1`,
//                     fontSize: 7,
//                     bold: true,
//                   },
//                 ],
//                 margin: [5, 20],
//                 alignment: 'center',
//               },
//               {
//                 text: [
//                   {
//                     text: `${consentimiento.testigo2_nombre || 'N/A'}\n`,
//                     fontSize: 7,
//                     bold: true,
//                   },
//                   {
//                     text: `ID: ${consentimiento.testigo2_identificacion || 'N/A'}\n`,
//                     fontSize: 6,
//                   },
//                   {
//                     text: `\n\n_________________________\n`,
//                     fontSize: 6,
//                   },
//                   {
//                     text: `FIRMA TESTIGO 2`,
//                     fontSize: 7,
//                     bold: true,
//                   },
//                 ],
//                 margin: [5, 20],
//                 alignment: 'center',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//       },

//       { text: '', margin: [0, 5] },

//       // LUGAR Y FECHA
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: `San Luis de la Paz, Guanajuato a ${fechaActual.getDate()} de ${fechaActual.toLocaleDateString('es-MX', { month: 'long' })} de ${fechaActual.getFullYear()}`,
//                 fontSize: 8,
//                 bold: true,
//                 alignment: 'center',
//                 margin: [10, 8],
//                 color: '#111827',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//       },

//       { text: '', margin: [0, 5] },

//       // NOTAS AL PIE
//       {
//         columns: [
//           {
//             width: '50%',
//             text: [
//               {
//                 text: '* Elaborado conforme a:\n',
//                 fontSize: 6,
//                 italics: true,
//                 color: '#666666',
//               },
//               {
//                 text: '• NOM-004-SSA3-2012 Del expediente clínico\n',
//                 fontSize: 6,
//                 color: '#666666',
//               },
//               {
//                 text: '• Consentimiento informado para procedimientos\n',
//                 fontSize: 6,
//                 color: '#666666',
//               },
//               {
//                 text: '• Autorización libre y voluntaria',
//                 fontSize: 6,
//                 color: '#666666',
//               },
//             ],
//             alignment: 'left',
//           },
//           {
//             width: '50%',
//             text: [
//               {
//                 text: 'Sistema Integral Clínico de Expedientes y Gestión (SICEG)\n',
//                 fontSize: 6,
//                 italics: true,
//                 color: '#666666',
//               },
//               {
//                 text: `Documento generado: ${fechaActual.toLocaleString('es-MX')}\n`,
//                 fontSize: 6,
//                 color: '#666666',
//               },
//               {
//                 text: 'Hospital General San Luis de la Paz, Guanajuato',
//                 fontSize: 6,
//                 color: '#666666',
//               },
//             ],
//             alignment: 'right',
//           },
//         ],
//       },
//     ],

//     footer: (currentPage: number, pageCount: number) => {
//       return {
//         margin: [20, 10],
//         table: {
//           widths: ['25%', '50%', '25%'],
//           body: [
//             [
//               {
//                 text: `Página ${currentPage} de ${pageCount}`,
//                 fontSize: 7,
//                 color: '#666666',
//               },
//               {
//                 text: 'Consentimiento Informado - SICEG\nNOM-004-SSA3-2012 • Procedimientos Médicos',
//                 fontSize: 7,
//                 alignment: 'center',
//                 color: '#666666',
//               },
//               {
//                 text: [
//                   {
//                     text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
//                     fontSize: 7,
//                   },
//                   {
//                     text: `Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
//                     fontSize: 6,
//                   },
//                 ],
//                 alignment: 'right',
//                 color: '#666666',
//               },
//             ],
//           ],
//         },
//           layout: 'noBorders',
//         };
//       },
//     };
//   }


// async generarNotaConsentimientoProcedimientos(datos: any): Promise<any> {
//   console.log('📝 Generando Consentimiento Informado para Hospitalización - Estilo Profesional...');

//   const { pacienteCompleto, medicoCompleto, consentimiento } = datos;
//   const fechaActual = new Date();
  
//   // 🔥 OBTENER CONFIGURACIÓN INTELIGENTE DE LOGOS
//   const configuracion = await this.obtenerConfiguracionLogosInteligente();

//   return {
//     pageSize: 'LETTER',
//     pageMargins: [20, 100, 20, 60],

//     header: {
//       margin: [20, 15, 20, 15],
//       table: {
//         widths: ['20%', '60%', '20%'],
//         body: [
//           [
//             {
//               // Logo de gobierno (izquierda)
//               image: await this.obtenerImagenBase64(
//                 datos.configuracion?.logo_gobierno ||
//                 configuracion.logo_gobierno
//               ),
//               fit: [80, 45],
//               alignment: 'left',
//               margin: [0, 5],
//             },
//             {
//               // Texto central
//               stack: [
//                 {
//                   text: 'INSTITUTO DE SALUD PÚBLICA DEL ESTADO DE GUANAJUATO',
//                   fontSize: 7,
//                   bold: true,
//                   alignment: 'center',
//                   color: '#1a365d',
//                 },
//                 {
//                   text: 'HOSPITAL GENERAL DE SAN LUIS DE LA PAZ',
//                   fontSize: 11,
//                   bold: true,
//                   alignment: 'center',
//                   color: '#1a365d',
//                   margin: [0, 2, 0, 5],
//                 },
//                 {
//                   text: 'CARTA DE CONSENTIMIENTO INFORMADO PARA',
//                   fontSize: 8,
//                   bold: true,
//                   alignment: 'center',
//                   color: '#374151',
//                 },
//                 {
//                   text: 'HOSPITALIZACIÓN',
//                   fontSize: 12,
//                   bold: true,
//                   alignment: 'center',
//                   color: '#dc2626',
//                   margin: [0, 2, 0, 0],
//                 },
//               ],
//             },
//             {
//               // Logo del hospital (derecha)
//               image: await this.obtenerImagenBase64(
//                 datos.configuracion?.logo_principal ||
//                 configuracion.logo_principal
//               ),
//               fit: [80, 45],
//               alignment: 'right',
//               margin: [0, 5],
//             },
//           ],
//         ],
//       },
//       layout: 'noBorders',
//     },

//     content: [
//       // IDENTIFICACIÓN PROFESIONAL
//       {
//         table: {
//           widths: ['15%', '85%'],
//           body: [
//             [
//               {
//                 text: 'IDENTIFICACIÓN',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f3f4f6',
//                 alignment: 'center',
//                 rowSpan: 3,
//                 color: '#374151',
//               },
//               {
//                 table: {
//                   widths: ['20%', '30%', '15%', '15%', '20%'],
//                   body: [
//                     [
//                       { text: 'Fecha', fontSize: 7, bold: true, alignment: 'center', fillColor: '#fafafa' },
//                       { text: 'Nombre del Paciente', fontSize: 7, bold: true, alignment: 'center', fillColor: '#fafafa' },
//                       { text: 'Edad', fontSize: 7, bold: true, alignment: 'center', fillColor: '#fafafa' },
//                       { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center', fillColor: '#fafafa' },
//                       { text: 'No. Expediente', fontSize: 7, bold: true, alignment: 'center', fillColor: '#fafafa' },
//                     ],
//                     [
//                       { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 6, alignment: 'center', bold: true },
//                       { text: pacienteCompleto.nombre_completo, fontSize: 6, alignment: 'center', bold: true, color: '#1f2937' },
//                       { text: `${pacienteCompleto.edad}`, fontSize: 6, alignment: 'center' },
//                       { text: pacienteCompleto.sexo, fontSize: 6, alignment: 'center' },
//                       { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto) || 'N/A', fontSize: 6, alignment: 'center', bold: true, color: '#dc2626' },
//                     ],
//                   ],
//                 },
//                 layout: {
//                   hLineWidth: () => 0.3,
//                   vLineWidth: () => 0.3,
//                   hLineColor: () => '#d1d5db',
//                   vLineColor: () => '#d1d5db',
//                 },
//               },
//             ],
//             [
//               {},
//               {
//                 table: {
//                   widths: ['25%', '25%', '25%', '25%'],
//                   body: [
//                     [
//                       { text: 'CURP', fontSize: 7, bold: true, alignment: 'center', fillColor: '#fafafa' },
//                       { text: 'F. Nacimiento', fontSize: 7, bold: true, alignment: 'center', fillColor: '#fafafa' },
//                       { text: 'Cama', fontSize: 7, bold: true, alignment: 'center', fillColor: '#fafafa' },
//                       { text: 'Servicio', fontSize: 7, bold: true, alignment: 'center', fillColor: '#fafafa' },
//                     ],
//                     [
//                       { text: pacienteCompleto.curp || 'No registrado', fontSize: 7, alignment: 'center' },
//                       { text: this.formatearFecha(pacienteCompleto.fecha_nacimiento) || 'No registrada', fontSize: 7, alignment: 'center' },
//                       { text: consentimiento.numero_cama || 'Por asignar', fontSize: 7, alignment: 'center', bold: true, color: '#059669' },
//                       { text: medicoCompleto.departamento || 'No especificado', fontSize: 7, alignment: 'center' },
//                     ],
//                   ],
//                 },
//                 layout: {
//                   hLineWidth: () => 0.3,
//                   vLineWidth: () => 0.3,
//                   hLineColor: () => '#d1d5db',
//                   vLineColor: () => '#d1d5db',
//                 },
//               },
//             ],
//             [
//               {},
//               {
//                 table: {
//                   widths: ['40%', '30%', '30%'],
//                   body: [
//                     [
//                       { text: 'Médico Responsable', fontSize: 7, bold: true, alignment: 'center', fillColor: '#fafafa' },
//                       { text: 'Cédula Profesional', fontSize: 7, bold: true, alignment: 'center', fillColor: '#fafafa' },
//                       { text: 'Folio Consentimiento', fontSize: 7, bold: true, alignment: 'center', fillColor: '#fafafa' },
//                     ],
//                     [
//                       { text: medicoCompleto.nombre_completo || 'No especificado', fontSize: 7, alignment: 'center' },
//                       { text: medicoCompleto.numero_cedula || 'No registrada', fontSize: 7, alignment: 'center' },
//                       { text: consentimiento.folio_consentimiento || this.generarFolioConsentimiento(), fontSize: 7, alignment: 'center', bold: true, color: '#dc2626' },
//                     ],
//                   ],
//                 },
//                 layout: {
//                   hLineWidth: () => 0.3,
//                   vLineWidth: () => 0.3,
//                   hLineColor: () => '#d1d5db',
//                   vLineColor: () => '#d1d5db',
//                 },
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#6b7280',
//           vLineColor: () => '#6b7280',
//         },
//         margin: [0, 0, 0, 15],
//       },

//       // DECLARACIÓN INICIAL YO
//       {
//         table: {
//           widths: ['15%', '85%'],
//           body: [
//             [
//               {
//                 text: 'DECLARACIÓN',
//                 fontSize: 6,
//                 bold: true,
//                 fillColor: '#f3f4f6',
//                 alignment: 'center',
//                 color: '#374151',
//               },
//               {
//                 text: [
//                   { text: 'YO, ', fontSize: 8, bold: true, color: '#1f2937' },
//                   { text: `${consentimiento.nombre_responsable || pacienteCompleto.nombre_completo}`, fontSize: 11, bold: true, decoration: 'underline', color: '#dc2626' },
//                   { text: ', familiar o allegado designado por el paciente, y en caso de menores de edad e incapacitados para otorgar su consentimiento y/o autorización.', fontSize: 8, color: '#374151' }
//                 ],
//                 margin: [8, 8],
//                 lineHeight: 1.3,
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#6b7280',
//           vLineColor: () => '#6b7280',
//         },
//         margin: [0, 0, 0, 12],
//       },

//       // AUTORIZO (enmarcado destacado)
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'AUTORIZO',
//                 fontSize: 16,
//                 bold: true,
//                 alignment: 'center',
//                 margin: [0, 12, 0, 12],
//                 color: '#dc2626',
//                 fillColor: '#fef2f2',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 2,
//           vLineWidth: () => 2,
//           hLineColor: () => '#dc2626',
//           vLineColor: () => '#dc2626',
//         },
//         margin: [0, 0, 0, 15],
//       },

//       {
//         text: 'En atención a los artículos 80 al 83 de reglamento de la Ley General de Salud en materia de atención médica y a la NOM-168-SSA1-1998 relativa al expediente clínico numerales 4.2, 10.1 al 10.1.2, se otorga la presente autorización al personal Médico y Paramédico del Hospital.',
//         fontSize: 8,
//         lineHeight: 1.4,
//         alignment: 'justify',
//         margin: [0, 0, 0, 15],
//         color: '#374151',
//       },

//       // HOSPITAL (enmarcado destacado)
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ',
//                 fontSize: 13,
//                 bold: true,
//                 alignment: 'center',
//                 margin: [0, 10, 0, 10],
//                 color: '#1a365d',
//                 fillColor: '#f0f9ff',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 1.5,
//           vLineWidth: () => 1.5,
//           hLineColor: () => '#1a365d',
//           vLineColor: () => '#1a365d',
//         },
//         margin: [0, 0, 0, 15],
//       },

//       {
//         text: 'para realizar los procedimientos médicos y/o quirúrgicos necesarios al paciente en cuestión, y para tal efecto, dicho paciente y/o su representante legal DECLARA:',
//         fontSize: 8,
//         margin: [0, 0, 0, 15],
//         color: '#374151',
//         lineHeight: 1.3,
//       },

//       // DECLARO (enmarcado destacado)
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'DECLARO',
//                 fontSize: 16,
//                 bold: true,
//                 alignment: 'center',
//                 margin: [0, 12, 0, 12],
//                 color: '#059669',
//                 fillColor: '#f0fdf4',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 2,
//           vLineWidth: () => 2,
//           hLineColor: () => '#059669',
//           vLineColor: () => '#059669',
//         },
//         margin: [0, 0, 0, 15],
//       },

//       // PÁRRAFOS DEL CONSENTIMIENTO
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'Que los Médicos del Hospital le han explicado de una manera detallada y con un lenguaje que pudo comprender, que los procedimientos médicos y/o quirúrgicos que se planean realizar, tienen como objetivo primordial dar solución a los problemas de salud del enfermo, utilizando las técnicas vigentes para tal efecto, en virtud de que el personal de salud que labora en dicha institución se declara ampliamente capacitado y que cuanta con autorización legal con efectos de patente y cédula profesional correspondiente para el libre ejercicio de su especialidad médica o quirúrgica en su caso, así como la certificación vigente del consejo nacional de dicha especialidad, además de comprometerse a cuidar de la salud y la integridad, del enfermo y actuar con ética y responsabilidad en beneficio del paciente y su entorno biológico, psicológico y social.',
//                 fontSize: 7,
//                 lineHeight: 1.4,
//                 alignment: 'justify',
//                 margin: [8, 8],
//                 color: '#374151',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.3,
//           vLineWidth: () => 0.3,
//           hLineColor: () => '#d1d5db',
//           vLineColor: () => '#d1d5db',
//         },
//         margin: [0, 0, 0, 8],
//       },

//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'Que cualquier procedimiento médico implica una serie de riesgo no siempre previsible debido a diversas circunstancias que entre otras se consideran se estado físico previo, enfermedades pre o coexistentes, tratamientos previos, etcétera y que existe la posibilidad de complicaciones debidas al tratamiento médico y/o quirúrgico, ya que cada paciente puede reaccionar en forma diversa a la aplicación de tal fármaco o bien a la realización de determinado procedimiento, dichas complicaciones pueden ser transitorias o permanentes y pueden ir desde leves hasta severas y pueden poner en peligro la vida del paciente e incluso provocar la muerte.',
//                 fontSize: 7,
//                 lineHeight: 1.4,
//                 alignment: 'justify',
//                 margin: [8, 8],
//                 color: '#374151',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.3,
//           vLineWidth: () => 0.3,
//           hLineColor: () => '#d1d5db',
//           vLineColor: () => '#d1d5db',
//         },
//         margin: [0, 0, 0, 8],
//       },

//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'Que, en circunstancias especiales, el personal de salud se verá obligado a utilizar técnicas invasivas de diagnóstico y tratamiento, conforme a los protocolos médicos actuales con el objeto de mantener una vigilancia estrecha de las constantes vitales o bien de proporcionar una terapéutica oportuna que puede salvar la vida del paciente, pero las cuales se requiere la aplicación de sondas, catéteres o marcapasos según sea al caso.',
//                 fontSize: 7,
//                 lineHeight: 1.4,
//                 alignment: 'justify',
//                 margin: [8, 8],
//                 color: '#374151',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.3,
//           vLineWidth: () => 0.3,
//           hLineColor: () => '#d1d5db',
//           vLineColor: () => '#d1d5db',
//         },
//         margin: [0, 0, 0, 8],
//       },

//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'Que algunas enfermedades pueden requerir de un procedimiento quirúrgico para su resolución y que esta necesidad puede presentarse en cualquier momento de su estancia hospitalaria, para lo cual se solicitará una autorización previa del paciente o su representante legal en su caso, sin embargo en dado caso que dicha persona no autorice el procedimiento en cuestión, o bien solicite su alta voluntaria por cualquier motivo, el Hospital y el personal que en el labora quedará automáticamente exento de cualquier implicación médica y legal derivada de la decisión, así como de la evolución consecutiva del paciente.',
//                 fontSize: 7,
//                 lineHeight: 1.4,
//                 alignment: 'justify',
//                 margin: [8, 8],
//                 color: '#374151',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.3,
//           vLineWidth: () => 0.3,
//           hLineColor: () => '#d1d5db',
//           vLineColor: () => '#d1d5db',
//         },
//         margin: [0, 0, 0, 8],
//       },

//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'Que en ocasiones puede ser necesaria la aplicación de sangre o productos sanguíneos para la resolución de determinados problemas de salud, por lo que se autoriza a los médicos a emplear dicha terapéutica siempre que sea necesaria, con las reservas que marcan las normas vigentes.',
//                 fontSize: 7,
//                 lineHeight: 1.4,
//                 alignment: 'justify',
//                 margin: [8, 8],
//                 color: '#374151',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.3,
//           vLineWidth: () => 0.3,
//           hLineColor: () => '#d1d5db',
//           vLineColor: () => '#d1d5db',
//         },
//         margin: [0, 0, 0, 8],
//       },

//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'Que el paciente será sometido a un protocolo terapéutico que se encuentra ampliamente documentado en el expediente clínico y que se apega estrechamente a las consideraciones éticas del tratado de Helsinki modificado en Viena y que el paciente debe seguir estrechamente las indicaciones para el diagnóstico y tratamiento de su enfermedad, ya que de no ser así o bien en el caso que el paciente siga instrucciones ajenas o bien actué de acuerdo a su propio entender o en su caso amita las indicaciones específicas del médico, así como el Hospital',
//                 fontSize: 7,
//                 lineHeight: 1.4,
//                 alignment: 'justify',
//                 margin: [8, 8],
//                 color: '#374151',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.3,
//           vLineWidth: () => 0.3,
//           hLineColor: () => '#d1d5db',
//           vLineColor: () => '#d1d5db',
//         },
//         margin: [0, 0, 0, 15],
//       },

//       // HOSPITAL (repetido enmarcado)
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ',
//                 fontSize: 12,
//                 bold: true,
//                 alignment: 'center',
//                 margin: [0, 8, 0, 8],
//                 color: '#1a365d',
//                 fillColor: '#f0f9ff',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 1.5,
//           vLineWidth: () => 1.5,
//           hLineColor: () => '#1a365d',
//           vLineColor: () => '#1a365d',
//         },
//         margin: [0, 0, 0, 15],
//       },

//       {
//         text: 'Queda totalmente exentos de cualquier implicación médica y legal que se deriven de la evolución subsecuente del paciente.',
//         fontSize: 8,
//         lineHeight: 1.4,
//         alignment: 'justify',
//         margin: [0, 0, 0, 20],
//         color: '#374151',
//       },

//       // ACEPTO (destacado)
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'ACEPTO',
//                 fontSize: 18,
//                 bold: true,
//                 alignment: 'center',
//                 margin: [0, 15, 0, 15],
//                 color: '#dc2626',
//                 fillColor: '#fef2f2',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 2,
//           vLineWidth: () => 2,
//           hLineColor: () => '#dc2626',
//           vLineColor: () => '#dc2626',
//         },
//         margin: [0, 0, 0, 25],
//       },

//       // INFORMACIÓN ADICIONAL (si hay observaciones)
//       ...(consentimiento.observaciones ? [
//         {
//           table: {
//             widths: ['100%'],
//             body: [
//               [
//                 {
//                   text: 'OBSERVACIONES ADICIONALES',
//                   fontSize: 6,
//                   bold: true,
//                   fillColor: '#fef3c7',
//                   alignment: 'center',
//                   margin: [0, 5, 0, 5],
//                   color: '#92400e',
//                 },
//               ],
//               [
//                 {
//                   text: consentimiento.observaciones,
//                   fontSize: 7,
//                   margin: [8, 8],
//                   lineHeight: 1.3,
//                   color: '#374151',
//                 },
//               ],
//             ],
//           },
//           layout: {
//             hLineWidth: () => 0.5,
//             vLineWidth: () => 0.5,
//             hLineColor: () => '#f59e0b',
//             vLineColor: () => '#f59e0b',
//           },
//           margin: [0, 0, 0, 20],
//         },
//       ] : []),

//       // FIRMAS CON ESTILO PROFESIONAL
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'FIRMAS Y RESPONSABILIDADES',
//                 fontSize: 8,
//                 bold: true,
//                 fillColor: '#f3f4f6',
//                 alignment: 'center',
//                 margin: [0, 8, 0, 8],
//                 color: '#374151',
//               },
//             ],
//             [
//               {
//                 table: {
//                   widths: ['50%', '50%'],
//                   body: [
//                     [
//                       {
//                         stack: [
//                           {
//                             text: 'PACIENTE / RESPONSABLE LEGAL',
//                             fontSize: 6,
//                             bold: true,
//                             alignment: 'center',
//                             color: '#1f2937',
//                             margin: [0, 0, 0, 5],
//                           },
//                           {
//                             text: `${consentimiento.nombre_responsable || pacienteCompleto.nombre_completo}`,
//                             fontSize: 7,
//                             bold: true,
//                             alignment: 'center',
//                             color: '#dc2626',
//                             margin: [0, 0, 0, 15],
//                           },
//                           {
//                             text: '\n\n_________________________________',
//                             fontSize: 7,
//                             alignment: 'center',
//                             margin: [0, 25, 0, 5],
//                           },
//                           {
//                             text: 'FIRMA',
//                             fontSize: 6,
//                             bold: true,
//                             alignment: 'center',
//                             color: '#374151',
//                             margin: [0, 0, 0, 3],
//                           },
//                           {
//                             text: `Parentesco: ${consentimiento.parentesco || 'Paciente'}`,
//                             fontSize: 7,
//                             alignment: 'center',
//                             color: '#6b7280',
//                           },
//                         ],
//                         margin: [10, 10],
//                       },
//                       {
//                         stack: [
//                           {
//                             text: 'MÉDICO RESPONSABLE',
//                             fontSize: 6,
//                             bold: true,
//                             alignment: 'center',
//                             color: '#1f2937',
//                             margin: [0, 0, 0, 5],
//                           },
//                           {
//                             text: `${medicoCompleto.titulo_profesional || 'Dr.'} ${medicoCompleto.nombre_completo}`,
//                             fontSize: 7,
//                             bold: true,
//                             alignment: 'center',
//                             color: '#059669',
//                             margin: [0, 0, 0, 15],
//                           },
//                           {
//                             text: '\n\n_________________________________',
//                             fontSize: 7,
//                             alignment: 'center',
//                             margin: [0, 25, 0, 5],
//                           },
//                           {
//                             text: 'FIRMA Y SELLO',
//                             fontSize: 6,
//                             bold: true,
//                             alignment: 'center',
//                             color: '#374151',
//                             margin: [0, 0, 0, 3],
//                           },
//                           {
//                             text: `Cédula: ${medicoCompleto.numero_cedula || 'No registrada'}`,
//                             fontSize: 7,
//                             alignment: 'center',
//                             color: '#6b7280',
//                           },
//                         ],
//                         margin: [10, 10],
//                       },
//                     ],
//                   ],
//                 },
//                 layout: 'noBorders',
//                 margin: [5, 5],
//               },
//             ],
//             [
//               {
//                 table: {
//                   widths: ['50%', '50%'],
//                   body: [
//                     [
//                       {
//                         stack: [
//                           {
//                             text: 'TESTIGO 1',
//                             fontSize: 6,
//                             bold: true,
//                             alignment: 'center',
//                             color: '#1f2937',
//                             margin: [0, 10, 0, 5],
//                           },
//                           {
//                             text: '\n\n_____________________________',
//                             fontSize: 6,
//                             alignment: 'center',
//                             margin: [0, 15, 0, 5],
//                           },
//                           {
//                             text: 'Nombre y Firma',
//                             fontSize: 7,
//                             alignment: 'center',
//                             color: '#6b7280',
//                           },
//                         ],
//                         margin: [10, 5],
//                       },
//                       {
//                         stack: [
//                           {
//                             text: 'TESTIGO 2',
//                             fontSize: 6,
//                             bold: true,
//                             alignment: 'center',
//                             color: '#1f2937',
//                             margin: [0, 10, 0, 5],
//                           },
//                           {
//                             text: '\n\n_____________________________',
//                             fontSize: 6,
//                             alignment: 'center',
//                             margin: [0, 15, 0, 5],
//                           },
//                           {
//                             text: 'Nombre y Firma',
//                             fontSize: 7,
//                             alignment: 'center',
//                             color: '#6b7280',
//                           },
//                         ],
//                         margin: [10, 5],
//                       },
//                     ],
//                   ],
//                 },
//                 layout: 'noBorders',
//                 margin: [5, 5],
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#6b7280',
//           vLineColor: () => '#6b7280',
//         },
//         margin: [0, 0, 0, 15],
//       },

//       // LUGAR Y FECHA PROFESIONAL
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: `San Luis de la Paz, Guanajuato a ${fechaActual.getDate()} de ${fechaActual.toLocaleDateString('es-MX', { month: 'long' })} de ${fechaActual.getFullYear()}`,
//                 fontSize: 11,
//                 bold: true,
//                 alignment: 'center',
//                 margin: [10, 10],
//                 color: '#1f2937',
//                 fillColor: '#f9fafb',
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 0.8,
//           vLineWidth: () => 0.8,
//           hLineColor: () => '#374151',
//           vLineColor: () => '#374151',
//         },
//         margin: [0, 0, 0, 15],
//       },

//       // INFORMACIÓN NORMATIVA AL PIE
//       {
//         columns: [
//           {
//             width: '50%',
//             text: [
//               {
//                 text: 'Marco Legal de Referencia:\n',
//                 fontSize: 7,
//                 bold: true,
//                 color: '#374151',
//               },
//               {
//                 text: '• NOM-004-SSA3-2012 Del expediente clínico\n',
//                 fontSize: 6,
//                 color: '#6b7280',
//               },
//               {
//                 text: '• NOM-168-SSA1-1998 Expediente clínico\n',
//                 fontSize: 6,
//                 color: '#6b7280',
//               },
//               {
//                text: '• Arts. 80-83 Reglamento Ley General de Salud\n',
//                fontSize: 6,
//                color: '#6b7280',
//              },
//              {
//                text: '• Tratado de Helsinki (Consideraciones éticas)',
//                fontSize: 6,
//                color: '#6b7280',
//              },
//            ],
//            alignment: 'left',
//          },
//          {
//            width: '50%',
//            text: [
//              {
//                text: 'Sistema Integral Clínico de Expedientes y Gestión\n',
//                fontSize: 7,
//                bold: true,
//                color: '#374151',
//              },
//              {
//                text: `Documento generado: ${fechaActual.toLocaleString('es-MX')}\n`,
//                fontSize: 6,
//                color: '#6b7280',
//              },
//              {
//                text: `Folio: ${consentimiento.folio_consentimiento || this.generarFolioConsentimiento()}\n`,
//                fontSize: 6,
//                color: '#6b7280',
//              },
//              {
//                text: 'Hospital General San Luis de la Paz, Gto.',
//                fontSize: 6,
//                color: '#6b7280',
//              },
//            ],
//            alignment: 'right',
//          },
//        ],
//        margin: [0, 10, 0, 0],
//      },
//    ],

//    footer: (currentPage: number, pageCount: number) => {
//      return {
//        margin: [20, 15],
//        table: {
//          widths: ['25%', '50%', '25%'],
//          body: [
//            [
//              {
//                text: `Página ${currentPage} de ${pageCount}`,
//                fontSize: 7,
//                color: '#6b7280',
//              },
//              {
//                text: 'Consentimiento Informado para Hospitalización - SICEG\nHospital General San Luis de la Paz • NOM-004-SSA3-2012',
//                fontSize: 7,
//                alignment: 'center',
//                color: '#6b7280',
//                lineHeight: 1.2,
//              },
//              {
//                text: [
//                  {
//                    text: `${fechaActual.toLocaleDateString('es-MX')}\n`,
//                    fontSize: 7,
//                  },
//                  {
//                    text: `Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
//                    fontSize: 6,
//                  },
//                ],
//                alignment: 'right',
//                color: '#6b7280',
//              },
//            ],
//          ],
//        },
//        layout: 'noBorders',
//      };
//    },
//  };
// }

async generarConsentimientoHospitalizacion(datos: any): Promise<any> {
  console.log('📝 Generando Consentimiento Informado para Hospitalización - Estilo Formal...');

  const { pacienteCompleto, medicoCompleto, consentimiento } = datos;
  const fechaActual = new Date();
  
  // 🔥 OBTENER CONFIGURACIÓN INTELIGENTE DE LOGOS
  const configuracion = await this.obtenerConfiguracionLogosInteligente();

  return {
    pageSize: 'LETTER',
    pageMargins: [20, 80, 20, 40],

    header: {
      margin: [20, 10, 20, 10],
      table: {
        widths: ['20%', '60%', '20%'],
        body: [
          [
            {
              // Logo de gobierno (izquierda)
              image: await this.obtenerImagenBase64(
                datos.configuracion?.logo_gobierno ||
                configuracion.logo_gobierno ||
                '/uploads/logos/logo-gobierno-importado.svg'
              ),
              fit: [80, 40],
              alignment: 'left',
              margin: [0, 5],
            },
            {
              // Texto central
              stack: [
                {
                  text: 'INSTITUTO DE SALUD PÚBLICA DEL ESTADO DE GUANAJUATO',
                  fontSize: 7,
                  bold: true,
                  alignment: 'center',
                  color: '#000000',
                },
                {
                  text: 'HOSPITAL GENERAL DE SAN LUIS DE LA PAZ',
                  fontSize: 8,
                  bold: true,
                  alignment: 'center',
                  color: '#000000',
                  margin: [0, 1, 0, 2],
                },
                {
                  text: 'CARTA DE CONSENTIMIENTO INFORMADO PARA HOSPITALIZACIÓN',
                  fontSize: 7,
                  bold: true,
                  alignment: 'center',
                  color: '#000000',
                  margin: [0, 1, 0, 0],
                },
              ],
            },
            {
              // Logo del hospital (derecha)
              image: await this.obtenerImagenBase64(
                datos.configuracion?.logo_principal ||
                configuracion.logo_principal ||
                '/uploads/logos/logo-principal-importado.svg'
              ),
              fit: [80, 40],
              alignment: 'right',
              margin: [0, 5],
            },
          ],
        ],
      },
      layout: 'noBorders',
    },

    content: [
      // IDENTIFICACIÓN COMPACTA
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'IDENTIFICACIÓN',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 3,
              },
              {
                table: {
                  widths: ['20%', '30%', '15%', '15%', '20%'],
                  body: [
                    [
                      { text: 'Fecha', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Nombre del Paciente', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'No. Expediente', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'center' },
                      { text: pacienteCompleto.nombre_completo, fontSize: 7, alignment: 'center', bold: true },
                      { text: `${pacienteCompleto.edad}`, fontSize: 7, alignment: 'center' },
                      { text: pacienteCompleto.sexo, fontSize: 7, alignment: 'center' },
                      { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto) || 'N/A', fontSize: 7, alignment: 'center', bold: true },
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
                      { text: 'CURP', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'F. Nacimiento', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Cama', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Servicio', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: pacienteCompleto.curp || 'No registrado', fontSize: 7, alignment: 'center' },
                      { text: this.formatearFecha(pacienteCompleto.fecha_nacimiento) || 'No registrada', fontSize: 7, alignment: 'center' },
                      { text: consentimiento.numero_cama || 'Por asignar', fontSize: 7, alignment: 'center' },
                      { text: medicoCompleto.departamento || 'No especificado', fontSize: 7, alignment: 'center' },
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
                      { text: 'Médico Responsable', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Cédula Profesional', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: medicoCompleto.nombre_completo || 'No especificado', fontSize: 7, alignment: 'center' },
                      { text: medicoCompleto.numero_cedula || 'No registrada', fontSize: 7, alignment: 'center' },
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
        margin: [0, 0, 0, 8],
      },

      // DECLARACIÓN INICIAL YO
      {
        table: {
          widths: ['5%', '95%'],
          body: [
            [
              { text: 'YO', fontSize: 8, bold: true },
              {
                text: `${consentimiento.nombre_responsable || pacienteCompleto.nombre_completo}`,
                fontSize: 8,
                decoration: 'underline',
                margin: [0, 0, 0, 0],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 5],
      },

      {
        text: 'familiar o allegado designado por el paciente, y en caso de menores de edad e incapacitados para otorgar su consentimiento y/o autorización.',
        fontSize: 8,
        lineHeight: 1.2,
        margin: [0, 0, 0, 10],
      },

      // AUTORIZO (enmarcado simple)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'AUTORIZO',
                fontSize: 8,
                bold: true,
                alignment: 'center',
                margin: [0, 4, 0, 4],
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
        margin: [0, 0, 0, 6],
      },

      {
        text: 'En atención a los artículos 80 al 83 de reglamento de la Ley General de Salud en materia de atención médica y a la NOM-168-SSA1-1998 relativa al expediente clínico numerales 4.2, 10.1 al 10.1.2, se otorga la presente autorización al personal Médico y Paramédico del Hospital.',
        fontSize: 7,
        lineHeight: 1.3,
        alignment: 'justify',
        margin: [0, 0, 0, 8],
      },

      // HOSPITAL (enmarcado simple)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ',
                fontSize: 8,
                bold: true,
                alignment: 'center',
                margin: [0, 4, 0, 4],
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
        margin: [0, 0, 0, 6],
      },

      {
        text: 'para realizar los procedimientos médicos y/o quirúrgicos necesarios al paciente en cuestión, y para tal efecto, dicho paciente y/o su representante legal DECLARA:',
        fontSize: 7,
        margin: [0, 0, 0, 8],
        lineHeight: 1.2,
      },

      // DECLARO (enmarcado simple)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'DECLARO',
                fontSize: 7,
                bold: true,
                alignment: 'center',
                margin: [0, 4, 0, 4],
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
        margin: [0, 0, 0, 8],
      },

      // PÁRRAFOS DEL CONSENTIMIENTO (compactos)
      {
        text: 'Que los Médicos del Hospital le han explicado de una manera detallada y con un lenguaje que pudo comprender, que los procedimientos médicos y/o quirúrgicos que se planean realizar, tienen como objetivo primordial dar solución a los problemas de salud del enfermo, utilizando las técnicas vigentes para tal efecto, en virtud de que el personal de salud que labora en dicha institución se declara ampliamente capacitado y que cuanta con autorización legal con efectos de patente y cédula profesional correspondiente para el libre ejercicio de su especialidad médica o quirúrgica en su caso, así como la certificación vigente del consejo nacional de dicha especialidad, además de comprometerse a cuidar de la salud y la integridad, del enfermo y actuar con ética y responsabilidad en beneficio del paciente y su entorno biológico, psicológico y social.',
        fontSize: 6,
        lineHeight: 1.2,
        alignment: 'justify',
        margin: [0, 0, 0, 6],
      },

      {
        text: 'Que cualquier procedimiento médico implica una serie de riesgo no siempre previsible debido a diversas circunstancias que entre otras se consideran se estado físico previo, enfermedades pre o coexistentes, tratamientos previos, etcétera y que existe la posibilidad de complicaciones debidas al tratamiento médico y/o quirúrgico, ya que cada paciente puede reaccionar en forma diversa a la aplicación de tal fármaco o bien a la realización de determinado procedimiento, dichas complicaciones pueden ser transitorias o permanentes y pueden ir desde leves hasta severas y pueden poner en peligro la vida del paciente e incluso provocar la muerte.',
        fontSize: 6,
        lineHeight: 1.2,
        alignment: 'justify',
        margin: [0, 0, 0, 6],
      },

      {
        text: 'Que, en circunstancias especiales, el personal de salud se verá obligado a utilizar técnicas invasivas de diagnóstico y tratamiento, conforme a los protocolos médicos actuales con el objeto de mantener una vigilancia estrecha de las constantes vitales o bien de proporcionar una terapéutica oportuna que puede salvar la vida del paciente, pero las cuales se requiere la aplicación de sondas, catéteres o marcapasos según sea al caso.',
        fontSize: 6,
        lineHeight: 1.2,
        alignment: 'justify',
        margin: [0, 0, 0, 6],
      },

      {
        text: 'Que algunas enfermedades pueden requerir de un procedimiento quirúrgico para su resolución y que esta necesidad puede presentarse en cualquier momento de su estancia hospitalaria, para lo cual se solicitará una autorización previa del paciente o su representante legal en su caso, sin embargo en dado caso que dicha persona no autorice el procedimiento en cuestión, o bien solicite su alta voluntaria por cualquier motivo, el Hospital y el personal que en el labora quedará automáticamente exento de cualquier implicación médica y legal derivada de la decisión, así como de la evolución consecutiva del paciente.',
        fontSize: 6,
        lineHeight: 1.2,
        alignment: 'justify',
        margin: [0, 0, 0, 6],
      },

      {
        text: 'Que en ocasiones puede ser necesaria la aplicación de sangre o productos sanguíneos para la resolución de determinados problemas de salud, por lo que se autoriza a los médicos a emplear dicha terapéutica siempre que sea necesaria, con las reservas que marcan las normas vigentes.',
        fontSize: 6,
        lineHeight: 1.2,
        alignment: 'justify',
        margin: [0, 0, 0, 6],
      },

      {
        text: 'Que el paciente será sometido a un protocolo terapéutico que se encuentra ampliamente documentado en el expediente clínico y que se apega estrechamente a las consideraciones éticas del tratado de Helsinki modificado en Viena y que el paciente debe seguir estrechamente las indicaciones para el diagnóstico y tratamiento de su enfermedad, ya que de no ser así o bien en el caso que el paciente siga instrucciones ajenas o bien actué de acuerdo a su propio entender o en su caso amita las indicaciones específicas del médico, así como el Hospital',
        fontSize: 6,
        lineHeight: 1.2,
        alignment: 'justify',
        margin: [0, 0, 0, 8],
      },

      // HOSPITAL (repetido enmarcado)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ',
                fontSize: 7,
                bold: true,
                alignment: 'center',
                margin: [0, 4, 0, 4],
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
        margin: [0, 0, 0, 8],
      },

      {
        text: 'Queda totalmente exentos de cualquier implicación médica y legal que se deriven de la evolución subsecuente del paciente.',
        fontSize: 6,
        lineHeight: 1.2,
        alignment: 'justify',
        margin: [0, 0, 0, 15],
      },

      // ACEPTO (simple)
      {
        text: 'ACEPTO',
        fontSize: 7,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 15],
      },

      // OBSERVACIONES (si existen, compactas)
      ...(consentimiento.observaciones ? [
        {
          text: `OBSERVACIONES: ${consentimiento.observaciones}`,
          fontSize: 6,
          margin: [0, 0, 0, 10],
          lineHeight: 1.2,
          italics: true,
        },
      ] : []),

      // FIRMAS COMPACTAS
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: '\n\n\n_________________________________________\nNombre y firma del paciente y/o Representante legal',
                fontSize: 7,
                alignment: 'center',
                margin: [0, 15, 0, 15],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 10],
      },

      // TESTIGOS COMPACTOS
      {
        table: {
          widths: ['45%', '10%', '45%'],
          body: [
            [
              {
                text: '\n\n_____________________________\nTestigo',
                fontSize: 7,
                alignment: 'center',
                margin: [0, 10, 0, 10],
              },
              { text: '', fontSize: 7 },
              {
                text: '\n\n_____________________________\nTestigo',
                fontSize: 7,
                alignment: 'center',
                margin: [0, 10, 0, 10],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 15],
      },

      // LUGAR Y FECHA SIMPLE
      {
        text: `San Luis de la Paz, Guanajuato a ${fechaActual.getDate()} de ${fechaActual.toLocaleDateString('es-MX', { month: 'long' })} de ${fechaActual.getFullYear()}`,
        fontSize: 7,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 10],
      },

      // INFORMACIÓN NORMATIVA SIMPLE
      {
        columns: [
          {
            width: '50%',
            text: [
              {
                text: 'Marco Legal:\n',
                fontSize: 6,
                bold: true,
              },
              {
                text: '• NOM-004-SSA3-2012\n• NOM-168-SSA1-1998\n• Arts. 80-83 Ley General de Salud',
                fontSize: 6,
              },
            ],
            alignment: 'left',
          },
          {
            width: '50%',
            text: [
              {
                text: 'SICEG - Hospital General San Luis de la Paz\n',
                fontSize: 6,
                bold: true,
              },
              {
                text: `${fechaActual.toLocaleString('es-MX')} - Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
                fontSize: 6,
              },
            ],
            alignment: 'right',
          },
        ],
        margin: [0, 5, 0, 0],
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
                text: 'Consentimiento Informado para Hospitalización - SICEG\nNOM-004-SSA3-2012',
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
                    text: `Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
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

// 📋 CONSENTIMIENTO PARA HOSPITALIZACIÓN
// async generarConsentimientoHospitalizacion(datos: any): Promise<any> {
//   console.log('📝 Generando Consentimiento para Hospitalización...');

//   const { pacienteCompleto, medicoCompleto, consentimiento } = datos;
//   const fechaActual = new Date();
//   const configuracion = await this.obtenerConfiguracionLogosInteligente();

//   return {
//     pageSize: 'LETTER',
//     pageMargins: [20, 80, 20, 40],

//     header: {
//       margin: [20, 10, 20, 10],
//       table: {
//         widths: ['20%', '60%', '20%'],
//         body: [
//           [
//             {
//               image: await this.obtenerImagenBase64(
//                 datos.configuracion?.logo_gobierno ||
//                 configuracion.logo_gobierno ||
//                 '/uploads/logos/logo-gobierno-importado.svg'
//               ),
//               fit: [80, 40],
//               alignment: 'left',
//               margin: [0, 5],
//             },
//             {
//               stack: [
//                 {
//                   text: 'INSTITUTO DE SALUD PÚBLICA DEL ESTADO DE GUANAJUATO',
//                   fontSize: 7,
//                   bold: true,
//                   alignment: 'center',
//                 },
//                 {
//                   text: 'HOSPITAL GENERAL DE SAN LUIS DE LA PAZ',
//                   fontSize: 8,
//                   bold: true,
//                   alignment: 'center',
//                   margin: [0, 1, 0, 2],
//                 },
//                 {
//                   text: 'CARTA DE CONSENTIMIENTO INFORMADO PARA HOSPITALIZACIÓN',
//                   fontSize: 7,
//                   bold: true,
//                   alignment: 'center',
//                   margin: [0, 1, 0, 0],
//                 },
//               ],
//             },
//             {
//               image: await this.obtenerImagenBase64(
//                 datos.configuracion?.logo_principal ||
//                 configuracion.logo_principal ||
//                 '/uploads/logos/logo-principal-importado.svg'
//               ),
//               fit: [80, 40],
//               alignment: 'right',
//               margin: [0, 5],
//             },
//           ],
//         ],
//       },
//       layout: 'noBorders',
//     },

//     content: [
//       // IDENTIFICACIÓN
//       {
//         table: {
//           widths: ['15%', '35%', '15%', '15%', '20%'],
//           body: [
//             [
//               { text: 'Nombre:', fontSize: 7, bold: true },
//               { text: pacienteCompleto.nombre_completo, fontSize: 7, decoration: 'underline' },
//               { text: 'Edad:', fontSize: 7, bold: true },
//               { text: `${pacienteCompleto.edad}`, fontSize: 7, decoration: 'underline' },
//               { text: 'Fecha:', fontSize: 7, bold: true },
//             ],
//             [
//               { text: 'CURP:', fontSize: 7, bold: true },
//               { text: pacienteCompleto.curp || 'No registrado', fontSize: 7, decoration: 'underline' },
//               { text: 'Sexo:', fontSize: 7, bold: true },
//               { text: pacienteCompleto.sexo, fontSize: 7, decoration: 'underline' },
//               { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, decoration: 'underline' },
//             ],
//             [
//               { text: 'F. Nacimiento:', fontSize: 7, bold: true },
//               { text: this.formatearFecha(pacienteCompleto.fecha_nacimiento) || 'No registrada', fontSize: 7, decoration: 'underline' },
//               { text: 'Cama:', fontSize: 7, bold: true },
//               { text: consentimiento.numero_cama || 'Por asignar', fontSize: 7, decoration: 'underline' },
//               { text: 'Expediente:', fontSize: 7, bold: true },
//             ],
//             [
//               { text: '', fontSize: 7 },
//               { text: '', fontSize: 7 },
//               { text: '', fontSize: 7 },
//               { text: '', fontSize: 7 },
//               { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto) || 'N/A', fontSize: 7, decoration: 'underline' },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//         margin: [0, 0, 0, 15],
//       },

//       // YO
//       {
//         table: {
//           widths: ['5%', '95%'],
//           body: [
//             [
//               { text: 'YO', fontSize: 8, bold: true },
//               {
//                 text: `${consentimiento.nombre_responsable || pacienteCompleto.nombre_completo}`,
//                 fontSize: 8,
//                 decoration: 'underline',
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//         margin: [0, 0, 0, 8],
//       },

//       {
//         text: 'familiar o allegado designado por el paciente, y en caso de menores de edad e incapacitados para otorgar su consentimiento y/o autorización.',
//         fontSize: 8,
//         lineHeight: 1.2,
//         margin: [0, 0, 0, 15],
//       },

//       // AUTORIZO
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'AUTORIZO',
//                 fontSize: 14,
//                 bold: true,
//                 alignment: 'center',
//                 margin: [0, 8, 0, 8],
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 1,
//           vLineWidth: () => 1,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//         margin: [0, 0, 0, 10],
//       },

//       {
//         text: 'En atención a los artículos 80 al 83 de reglamento de la Ley General de Salud en materia de atención médica y a la NOM-168-SSA1-1998 relativa al expediente clínico numerales 4.2, 10.1 al 10.1.2, se otorga la presente autorización al personal Médico y Paramédico del Hospital.',
//         fontSize: 7,
//         lineHeight: 1.3,
//         alignment: 'justify',
//         margin: [0, 0, 0, 10],
//       },

//       // HOSPITAL
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ',
//                 fontSize: 11,
//                 bold: true,
//                 alignment: 'center',
//                 margin: [0, 6, 0, 6],
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 1,
//           vLineWidth: () => 1,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//         margin: [0, 0, 0, 10],
//       },

//       {
//         text: 'para realizar los procedimientos médicos y/o quirúrgicos necesarios al paciente en cuestión, y para tal efecto, dicho paciente y/o su representante legal DECLARA:',
//         fontSize: 7,
//         margin: [0, 0, 0, 10],
//         lineHeight: 1.2,
//       },

//       // DECLARO
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'DECLARO',
//                 fontSize: 14,
//                 bold: true,
//                 alignment: 'center',
//                 margin: [0, 8, 0, 8],
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 1,
//           vLineWidth: () => 1,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//         margin: [0, 0, 0, 10],
//       },

//       // PÁRRAFOS DEL CONSENTIMIENTO (texto compacto del hospital original)
//       {
//         text: 'Que los Médicos del Hospital le han explicado de una manera detallada y con un lenguaje que pudo comprender, que los procedimientos médicos y/o quirúrgicos que se planean realizar, tienen como objetivo primordial dar solución a los problemas de salud del enfermo, utilizando las técnicas vigentes para tal efecto, en virtud de que el personal de salud que labora en dicha institución se declara ampliamente capacitado y que cuanta con autorización legal con efectos de patente y cédula profesional correspondiente para el libre ejercicio de su especialidad médica o quirúrgica en su caso, así como la certificación vigente del consejo nacional de dicha especialidad, además de comprometerse a cuidar de la salud y la integridad, del enfermo y actuar con ética y responsabilidad en beneficio del paciente y su entorno biológico, psicológico y social.',
//         fontSize: 6,
//         lineHeight: 1.2,
//         alignment: 'justify',
//         margin: [0, 0, 0, 6],
//       },

//       {
//         text: 'Que cualquier procedimiento médico implica una serie de riesgo no siempre previsible debido a diversas circunstancias que entre otras se consideran se estado físico previo, enfermedades pre o coexistentes, tratamientos previos, etcétera y que existe la posibilidad de complicaciones debidas al tratamiento médico y/o quirúrgico, ya que cada paciente puede reaccionar en forma diversa a la aplicación de tal fármaco o bien a la realización de determinado procedimiento, dichas complicaciones pueden ser transitorias o permanentes y pueden ir desde leves hasta severas y pueden poner en peligro la vida del paciente e incluso provocar la muerte.',
//         fontSize: 6,
//         lineHeight: 1.2,
//         alignment: 'justify',
//         margin: [0, 0, 0, 6],
//       },

//       {
//         text: 'Que, en circunstancias especiales, el personal de salud se verá obligado a utilizar técnicas invasivas de diagnóstico y tratamiento, conforme a los protocolos médicos actuales con el objeto de mantener una vigilancia estrecha de las constantes vitales o bien de proporcionar una terapéutica oportuna que puede salvar la vida del paciente, pero las cuales se requiere la aplicación de sondas, catéteres o marcapasos según sea al caso.',
//         fontSize: 6,
//         lineHeight: 1.2,
//         alignment: 'justify',
//         margin: [0, 0, 0, 6],
//       },

//       {
//         text: 'Que algunas enfermedades pueden requerir de un procedimiento quirúrgico para su resolución y que esta necesidad puede presentarse en cualquier momento de su estancia hospitalaria, para lo cual se solicitará una autorización previa del paciente o su representante legal en su caso, sin embargo en dado caso que dicha persona no autorice el procedimiento en cuestión, o bien solicite su alta voluntaria por cualquier motivo, el Hospital y el personal que en el labora quedará automáticamente exento de cualquier implicación médica y legal derivada de la decisión, así como de la evolución consecutiva del paciente.',
//         fontSize: 6,
//         lineHeight: 1.2,
//         alignment: 'justify',
//         margin: [0, 0, 0, 6],
//       },

//       {
//         text: 'Que en ocasiones puede ser necesaria la aplicación de sangre o productos sanguíneos para la resolución de determinados problemas de salud, por lo que se autoriza a los médicos a emplear dicha terapéutica siempre que sea necesaria, con las reservas que marcan las normas vigentes.',
//         fontSize: 6,
//         lineHeight: 1.2,
//         alignment: 'justify',
//         margin: [0, 0, 0, 6],
//       },

//       {
//         text: 'Que el paciente será sometido a un protocolo terapéutico que se encuentra ampliamente documentado en el expediente clínico y que se apega estrechamente a las consideraciones éticas del tratado de Helsinki modificado en Viena y que el paciente debe seguir estrechamente las indicaciones para el diagnóstico y tratamiento de su enfermedad, ya que de no ser así o bien en el caso que el paciente siga instrucciones ajenas o bien actué de acuerdo a su propio entender o en su caso amita las indicaciones específicas del médico, así como el Hospital',
//         fontSize: 6,
//         lineHeight: 1.2,
//         alignment: 'justify',
//         margin: [0, 0, 0, 8],
//       },

//       // HOSPITAL (repetido)
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ',
//                 fontSize: 8,
//                 bold: true,
//                 alignment: 'center',
//                 margin: [0, 6, 0, 6],
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 1,
//           vLineWidth: () => 1,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//         margin: [0, 0, 0, 8],
//       },

//       {
//         text: 'Queda totalmente exentos de cualquier implicación médica y legal que se deriven de la evolución subsecuente del paciente.',
//         fontSize: 6,
//         lineHeight: 1.2,
//         alignment: 'justify',
//         margin: [0, 0, 0, 15],
//       },

//       // ACEPTO
//       {
//         text: 'ACEPTO',
//         fontSize: 16,
//         bold: true,
//         alignment: 'center',
//         margin: [0, 0, 0, 20],
//       },

//       // FIRMAS
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: '\n\n\n_________________________________________\nNombre y firma del paciente y/o Representante legal',
//                 fontSize: 7,
//                 alignment: 'center',
//                 margin: [0, 15, 0, 15],
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//         margin: [0, 0, 0, 10],
//       },

//       // TESTIGOS
//       {
//         table: {
//           widths: ['45%', '10%', '45%'],
//           body: [
//             [
//               {
//                 text: '\n\n_____________________________\nTestigo',
//                 fontSize: 7,
//                 alignment: 'center',
//                 margin: [0, 10, 0, 10],
//               },
//               { text: '', fontSize: 7 },
//               {
//                 text: '\n\n_____________________________\nTestigo',
//                 fontSize: 7,
//                 alignment: 'center',
//                 margin: [0, 10, 0, 10],
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//         margin: [0, 0, 0, 10],
//       },

//       // LUGAR Y FECHA
//       {
//         text: `San Luis de la Paz, Guanajuato a ${fechaActual.getDate()} de ${fechaActual.toLocaleDateString('es-MX', { month: 'long' })} de ${fechaActual.getFullYear()}`,
//         fontSize: 7,
//         bold: true,
//         alignment: 'center',
//       },
//     ],

//     footer: (currentPage: number, pageCount: number) => {
//       return {
//         margin: [20, 10],
//         table: {
//           widths: ['25%', '50%', '25%'],
//           body: [
//             [
//               {
//                 text: `Página ${currentPage} de ${pageCount}`,
//                 fontSize: 7,
//                 color: '#666666',
//               },
//               {
//                 text: 'Consentimiento para Hospitalización - SICEG\nNOM-004-SSA3-2012',
//                 fontSize: 7,
//                 alignment: 'center',
//                 color: '#666666',
//               },
//               {
//                 text: `${fechaActual.toLocaleDateString('es-MX')}\nExp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
//                 fontSize: 6,
//                 alignment: 'right',
//                 color: '#666666',
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//       };
//     },
//   };
// } 

// 🏥 CONSENTIMIENTO PARA REFERENCIA DE PACIENTES
// 🏥 CONSENTIMIENTO PARA REFERENCIA DE PACIENTES
async generarConsentimientoReferencia(datos: any): Promise<any> {
  console.log('📝 Generando Consentimiento para Referencia - Estilo Formal...');

  const { pacienteCompleto, medicoCompleto, consentimiento } = datos;
  const fechaActual = new Date();
  const configuracion = await this.obtenerConfiguracionLogosInteligente();

  return {
    pageSize: 'LETTER',
    pageMargins: [20, 80, 20, 40],

    header: {
      margin: [20, 10, 20, 10],
      table: {
        widths: ['20%', '60%', '20%'],
        body: [
          [
            {
              image: await this.obtenerImagenBase64(
                datos.configuracion?.logo_gobierno ||
                configuracion.logo_gobierno ||
                '/uploads/logos/logo-gobierno-importado.svg'
              ),
              fit: [80, 40],
              alignment: 'left',
              margin: [0, 5],
            },
            {
              stack: [
                {
                  text: 'INSTITUTO DE SALUD PÚBLICA DEL ESTADO DE GUANAJUATO',
                  fontSize: 7,
                  bold: true,
                  alignment: 'center',
                  color: '#000000',
                },
                {
                  text: 'HOSPITAL GENERAL DE SAN LUIS DE LA PAZ',
                  fontSize: 8,
                  bold: true,
                  alignment: 'center',
                  color: '#000000',
                  margin: [0, 1, 0, 2],
                },
                {
                  text: 'CARTA DE CONSENTIMIENTO INFORMADO PARA LA REFERENCIA DE PACIENTES',
                  fontSize: 7,
                  bold: true,
                  alignment: 'center',
                  color: '#000000',
                  margin: [0, 1, 0, 0],
                },
              ],
            },
            {
              image: await this.obtenerImagenBase64(
                datos.configuracion?.logo_principal ||
                configuracion.logo_principal ||
                '/uploads/logos/logo-principal-importado.svg'
              ),
              fit: [80, 40],
              alignment: 'right',
              margin: [0, 5],
            },
          ],
        ],
      },
      layout: 'noBorders',
    },

    content: [
      // FECHA Y LUGAR (estilo hospitalización)
      {
        table: {
          widths: ['60%', '40%'],
          body: [
            [
              { text: '', fontSize: 7 },
              {
                text: `San Luis de la Paz, Guanajuato a ${fechaActual.getDate()} de ${fechaActual.toLocaleDateString('es-MX', { month: 'long' })} de ${fechaActual.getFullYear()}`,
                fontSize: 7,
                bold: true,
                alignment: 'right',
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 8],
      },

      // IDENTIFICACIÓN COMPACTA (mismo estilo hospitalización)
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'IDENTIFICACIÓN',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 3,
              },
              {
                table: {
                  widths: ['20%', '30%', '15%', '15%', '20%'],
                  body: [
                    [
                      { text: 'Fecha', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Nombre del Paciente', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'No. Expediente', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'center' },
                      { text: pacienteCompleto.nombre_completo, fontSize: 7, alignment: 'center', bold: true },
                      { text: `${pacienteCompleto.edad}`, fontSize: 7, alignment: 'center' },
                      { text: pacienteCompleto.sexo, fontSize: 7, alignment: 'center' },
                      { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto) || 'N/A', fontSize: 7, alignment: 'center', bold: true },
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
                      { text: 'CURP', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'F. Nacimiento', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Servicio', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Cama', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: pacienteCompleto.curp || 'No registrado', fontSize: 7, alignment: 'center' },
                      { text: this.formatearFecha(pacienteCompleto.fecha_nacimiento) || 'No registrada', fontSize: 7, alignment: 'center' },
                      { text: medicoCompleto.departamento || 'No especificado', fontSize: 7, alignment: 'center' },
                      { text: consentimiento.numero_cama || 'Por asignar', fontSize: 7, alignment: 'center' },
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
                      { text: 'Médico Responsable', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Cédula Profesional', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: medicoCompleto.nombre_completo || 'No especificado', fontSize: 7, alignment: 'center' },
                      { text: medicoCompleto.numero_cedula || 'No registrada', fontSize: 7, alignment: 'center' },
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
        margin: [0, 0, 0, 8],
      },

      // DIAGNÓSTICO Y MOTIVO DE REFERENCIA (si existe)
      ...(consentimiento.diagnostico_referencia || consentimiento.motivo_referencia ? [
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: `DIAGNÓSTICO: ${consentimiento.diagnostico_referencia || 'No especificado'}\nMOTIVO DE REFERENCIA: ${consentimiento.motivo_referencia || 'No especificado'}`,
                  fontSize: 6,
                  margin: [5, 5, 5, 5],
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
          margin: [0, 0, 0, 8],
        },
      ] : []),

      // MARCO LEGAL
      {
        text: 'Con fundamento en la ley general de salud artículo 77 bis, reglamento de la ley general de salud en materia de prestaciones de servicios de atención médica, artículos 80,81,82,83 y a la norma oficial mexicana NOM-004-SSA3-2012 del expediente clínico, fracciones 10.1 a 10.1.1.10',
        fontSize: 7,
        lineHeight: 1.3,
        alignment: 'justify',
        margin: [0, 0, 0, 8],
      },

      // ACEPTO QUE EL DR. (enmarcado como hospitalización)
      {
        table: {
          widths: ['25%', '50%', '25%'],
          body: [
            [
              { text: 'ACEPTO QUE EL (LA)', fontSize: 8, bold: true },
              {
                text: `${medicoCompleto.titulo_profesional || 'DRA.'} ${medicoCompleto.nombre_completo}`,
                fontSize: 8,
                bold: true,
                decoration: 'underline',
                alignment: 'center',
              },
              // { text: 'me ha explicado de forma clara y entendi-', fontSize: 8 },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 5],
      },

      {
        text: 'Me ha explicado de forma clara y entendible el padecimiento riesgos, cuidados, tratamientos médicos requeridos para la estabilización de mi salud o la de mi paciente.',
        fontSize: 8,
        lineHeight: 1.2,
        margin: [0, 0, 0, 10],
      },

      // AUTORIZO (enmarcado simple)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'AUTORIZO',
                fontSize: 8,
                bold: true,
                alignment: 'center',
                margin: [0, 4, 0, 4],
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
        margin: [0, 0, 0, 6],
      },

      {
        text: 'Para su atención se requiere de la realización del procedimiento administrativo de referencia de pacientes, que consiste en el envío a otra unidad donde se cuenta con la capacidad física instalada para atender el problema de salud y una vez estabilizado o resuelto se contrarrefiera a la unidad de salud de origen.',
        fontSize: 7,
        lineHeight: 1.3,
        alignment: 'justify',
        margin: [0, 0, 0, 8],
      },

      // DECLARO (enmarcado simple)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'DECLARO',
                fontSize: 7,
                bold: true,
                alignment: 'center',
                margin: [0, 4, 0, 4],
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
        margin: [0, 0, 0, 8],
      },

      {
        text: 'Enterado (a) de todo lo anterior y una vez que me han informado a mi entera satisfacción, otorgo el presente consentimiento.',
        fontSize: 7,
        lineHeight: 1.3,
        alignment: 'justify',
        margin: [0, 0, 0, 15],
      },

      // ACEPTO (simple)
      {
        text: 'ACEPTO',
        fontSize: 7,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 15],
      },

      // OBSERVACIONES (si existen, compactas)
      ...(consentimiento.observaciones ? [
        {
          text: `OBSERVACIONES: ${consentimiento.observaciones}`,
          fontSize: 6,
          margin: [0, 0, 0, 5],
          lineHeight: 1.2,
          italics: true,
        },
      ] : []),

      // FIRMAS COMPACTAS (mismo estilo hospitalización)
      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              {
                text: '\n\n\n_________________________________________\nNombre y firma del paciente, tutor\no representante legal',
                fontSize: 7,
                alignment: 'center',
                margin: [0, 15, 0, 15],
              },
              {
                text: '\n\n\n_________________________________________\nNombre completo y firma de médico tratante',
                fontSize: 7,
                alignment: 'center',
                margin: [0, 15, 0, 15],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 5],
      },

      // TESTIGOS COMPACTOS
      {
        table: {
          widths: ['45%', '10%', '45%'],
          body: [
            [
              {
                text: '\n\n_____________________________\nTestigo nombre completo y firma ',
                fontSize: 7,
                alignment: 'center',
                margin: [0, 10, 0, 10],
              },
              { text: '', fontSize: 7 },
              {
                text: '\n\n_____________________________\nTestigo nombre completo y firma',
                fontSize: 7,
                alignment: 'center',
                margin: [0, 10, 0, 10],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 5],
      },

      // LUGAR Y FECHA SIMPLE
      {
        text: `San Luis de la Paz, Guanajuato a ${fechaActual.getDate()} de ${fechaActual.toLocaleDateString('es-MX', { month: 'long' })} de ${fechaActual.getFullYear()}`,
        fontSize: 7,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 10],
      },

      // INFORMACIÓN NORMATIVA SIMPLE
      {
        columns: [
          {
            width: '50%',
            text: [
              {
                text: 'Marco Legal:\n',
                fontSize: 6,
                bold: true,
              },
              {
                text: '• NOM-004-SSA3-2012\n• Arts. 80-83 Ley General de Salud',
                fontSize: 6,
              },
            ],
            alignment: 'left',
          },
          {
            width: '50%',
            text: [
              {
                text: 'SICEG - Hospital General San Luis de la Paz\n',
                fontSize: 6,
                bold: true,
              },
              {
                text: `${fechaActual.toLocaleString('es-MX')} - Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
                fontSize: 6,
              },
            ],
            alignment: 'right',
          },
        ],
        margin: [0, 5, 0, 0],
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
                text: 'Consentimiento para Referencia - SICEG\nNOM-004-SSA3-2012',
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
                    text: `Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
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

// ⚕️ CONSENTIMIENTO PARA TRATAMIENTO MÉDICO
// ⚕️ CONSENTIMIENTO PARA TRATAMIENTO MÉDICO
// async generarConsentimientoTratamientoMedico(datos: any): Promise<any> {
//   console.log('📝 Generando Consentimiento para Tratamiento Médico...');

//   const { pacienteCompleto, medicoCompleto, consentimiento } = datos;
//   const fechaActual = new Date();

//   return {
//     pageSize: 'LETTER',
//     pageMargins: [20, 40, 20, 40],

//     content: [
//       // TÍTULO PRINCIPAL
//       {
//         text: 'CONSENTIMIENTO INFORMADO DE TRATAMIENTO MEDICO',
//         fontSize: 11,
//         bold: true,
//         alignment: 'center',
//         margin: [0, 15, 0, 15],
//       },

//       // FECHA Y LUGAR
//       {
//         text: `San Luis de la Paz Guanajuato a ${fechaActual.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
//         fontSize: 7,
//         margin: [0, 0, 0, 20],
//       },

//       // DESTINATARIO
//       {
//         text: `DR.${medicoCompleto.nombre_completo?.toUpperCase() || 'RICARDO YURI SALAZAR NARANJO'}`,
//         fontSize: 7,
//         bold: true,
//         margin: [0, 0, 0, 3],
//       },

//       {
//         text: 'DIRECTOR',
//         fontSize: 7,
//         bold: true,
//         margin: [0, 0, 0, 3],
//       },

//       {
//         text: 'P R E S E N T E.',
//         fontSize: 7,
//         bold: true,
//         margin: [0, 0, 0, 15],
//       },

//       // QUIEN SUSCRIBE
//       {
//         text: 'QUIEN SUSCRIBE',
//         fontSize: 7,
//         bold: true,
//         margin: [0, 0, 0, 8],
//       },

//       {
//         text: `${consentimiento.nombre_responsable?.toUpperCase() || pacienteCompleto.nombre_completo?.toUpperCase()}`,
//         fontSize: 7,
//         bold: true,
//         margin: [0, 0, 0, 10],
//       },

//       {
//         text: 'Responsable de:',
//         fontSize: 7,
//         margin: [0, 0, 0, 3],
//       },

//       {
//         text: `${pacienteCompleto.nombre_completo?.toUpperCase()}`,
//         fontSize: 7,
//         bold: true,
//         margin: [0, 0, 0, 10],
//       },

//       // DOMICILIO
//       {
//         text: `Domicilio: ${this.formatearDireccionCompleta(pacienteCompleto)?.toUpperCase() || 'NO ESPECIFICADO'}`,
//         fontSize: 6,
//         margin: [0, 0, 0, 15],
//       },

//       // AUTORIZACIÓN PRINCIPAL
//       {
//         text: `AUTORIZO PLENAMENTE AL PERSONAL DEL HOSPITAL A SU CARGO PARA EJECUTAR LAS INVESTIGACIONES CLINICAS, DE LABORATORIO Y DE GABINETE, QUE SEAN NECESARIAS PARA EL DIAGNOSTICO DE LA ENFERMEDAD DE MI PACIENTE:`,
//         fontSize: 6,
//         lineHeight: 1.3,
//         alignment: 'justify',
//         margin: [0, 0, 0, 15],
//       },

//       // NOMBRE DEL PACIENTE (destacado)
//       {
//         text: `${pacienteCompleto.nombre_completo?.toUpperCase()}`,
//         fontSize: 7,
//         bold: true,
//         alignment: 'center',
//         margin: [0, 0, 0, 10],
//       },

//       {
//         text: 'ASI COMO TAMBIEN PARA REALIZAR LOS TRATAMIENTOS MEDICOS O QUIRURGICOS QUE CONVENGAN. ASI MISMO SE COMPROMETE A OBSERVAR EL REGLAMENTO INTERNO DE LA INSTITUCION.',
//         fontSize: 6,
//         lineHeight: 1.3,
//         alignment: 'justify',
//         margin: [0, 0, 0, 20],
//       },

//       // DESPEDIDA
//       {
//         text: 'ATENTAMENTE',
//         fontSize: 7,
//         bold: true,
//         alignment: 'center',
//         margin: [0, 0, 0, 30],
//       },

//       // FIRMAS (estilo compacto)
//       {
//         table: {
//           widths: ['50%', '50%'],
//           body: [
//             [
//               {
//                 text: `${consentimiento.nombre_responsable?.toUpperCase() || 'RESPONSABLE'}\nNOMBRE Y FIRMA DE PERSONA LEGALMENTE RESPONSABLE`,
//                 fontSize: 6,
//                 alignment: 'center',
//                 margin: [0, 25, 0, 15],
//               },
//               {
//                 text: `${pacienteCompleto.nombre_completo?.toUpperCase()}\nNOMBRE Y FIRMA DEL PACIENTE`,
//                 fontSize: 6,
//                 alignment: 'center',
//                 margin: [0, 25, 0, 15],
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//         margin: [0, 0, 0, 20],
//       },

//       // MÉDICO TESTIGO
//       {
//         table: {
//           widths: ['50%', '50%'],
//           body: [
//             [
//               {
//                 text: `${medicoCompleto.titulo_profesional || 'DRA.'} ${medicoCompleto.nombre_completo?.toUpperCase()}\nTESTIGO`,
//                 fontSize: 6,
//                 alignment: 'center',
//                 margin: [0, 15, 0, 10],
//               },
//               {
//                 text: `_______________________________\nTESTIGO`,
//                 fontSize: 6,
//                 alignment: 'center',
//                 margin: [0, 15, 0, 10],
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//       },
//     ],

//     footer: (currentPage: number, pageCount: number) => {
//       return {
//         margin: [20, 10],
//         table: {
//           widths: ['25%', '50%', '25%'],
//           body: [
//             [
//               {
//                 text: `Página ${currentPage} de ${pageCount}`,
//                 fontSize: 7,
//                 color: '#666666',
//               },
//               {
//                 text: 'Consentimiento para Tratamiento Médico - SICEG\nNOM-004-SSA3-2012',
//                 fontSize: 7,
//                 alignment: 'center',
//                 color: '#666666',
//               },
//               {
//                 text: `${fechaActual.toLocaleDateString('es-MX')}\nExp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
//                 fontSize: 6,
//                 alignment: 'right',
//                 color: '#666666',
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//       };
//     },
//   };
// }
// ⚕️ CONSENTIMIENTO PARA TRATAMIENTO MÉDICO (ESTILO HOSPITALIZACIÓN)
async generarConsentimientoTratamientoMedico(datos: any): Promise<any> {
  console.log('📝 Generando Consentimiento para Tratamiento Médico - Estilo Formal...');

  const { pacienteCompleto, medicoCompleto, consentimiento } = datos;
  const fechaActual = new Date();
  const configuracion = await this.obtenerConfiguracionLogosInteligente();

  return {
    pageSize: 'LETTER',
    pageMargins: [20, 80, 20, 40],

    header: {
      margin: [20, 10, 20, 10],
      table: {
        widths: ['20%', '60%', '20%'],
        body: [
          [
            {
              image: await this.obtenerImagenBase64(
                datos.configuracion?.logo_gobierno ||
                configuracion.logo_gobierno ||
                '/uploads/logos/logo-gobierno-importado.svg'
              ),
              fit: [80, 40],
              alignment: 'left',
              margin: [0, 5],
            },
            {
              stack: [
                {
                  text: 'INSTITUTO DE SALUD PÚBLICA DEL ESTADO DE GUANAJUATO',
                  fontSize: 7,
                  bold: true,
                  alignment: 'center',
                  color: '#000000',
                },
                {
                  text: 'HOSPITAL GENERAL DE SAN LUIS DE LA PAZ',
                  fontSize: 8,
                  bold: true,
                  alignment: 'center',
                  color: '#000000',
                  margin: [0, 1, 0, 2],
                },
                {
                  text: 'CONSENTIMIENTO INFORMADO DE TRATAMIENTO MÉDICO',
                  fontSize: 7,
                  bold: true,
                  alignment: 'center',
                  color: '#000000',
                  margin: [0, 1, 0, 0],
                },
              ],
            },
            {
              image: await this.obtenerImagenBase64(
                datos.configuracion?.logo_principal ||
                configuracion.logo_principal ||
                '/uploads/logos/logo-principal-importado.svg'
              ),
              fit: [80, 40],
              alignment: 'right',
              margin: [0, 5],
            },
          ],
        ],
      },
      layout: 'noBorders',
    },

    content: [
      // FECHA Y LUGAR (estilo hospitalización)
      {
        text: `San Luis de la Paz Guanajuato a ${fechaActual.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
        fontSize: 7,
        margin: [0, 0, 0, 8],
      },

      // IDENTIFICACIÓN COMPACTA (mismo estilo hospitalización)
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'IDENTIFICACIÓN',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 3,
              },
              {
                table: {
                  widths: ['20%', '30%', '15%', '15%', '20%'],
                  body: [
                    [
                      { text: 'Fecha', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Nombre del Paciente', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'No. Expediente', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'center' },
                      { text: pacienteCompleto.nombre_completo, fontSize: 7, alignment: 'center', bold: true },
                      { text: `${pacienteCompleto.edad}`, fontSize: 7, alignment: 'center' },
                      { text: pacienteCompleto.sexo, fontSize: 7, alignment: 'center' },
                      { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto) || 'N/A', fontSize: 7, alignment: 'center', bold: true },
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
                      { text: 'CURP', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'F. Nacimiento', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Servicio', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Cama', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: pacienteCompleto.curp || 'No registrado', fontSize: 7, alignment: 'center' },
                      { text: this.formatearFecha(pacienteCompleto.fecha_nacimiento) || 'No registrada', fontSize: 7, alignment: 'center' },
                      { text: medicoCompleto.departamento || 'No especificado', fontSize: 7, alignment: 'center' },
                      { text: consentimiento.numero_cama || 'Por asignar', fontSize: 7, alignment: 'center' },
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
                      { text: 'Médico Responsable', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Cédula Profesional', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: medicoCompleto.nombre_completo || 'No especificado', fontSize: 7, alignment: 'center' },
                      { text: medicoCompleto.numero_cedula || 'No registrada', fontSize: 7, alignment: 'center' },
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
        margin: [0, 0, 0, 8],
      },

      // DESTINATARIO
      {
        text: `DR. ${medicoCompleto.nombre_completo?.toUpperCase() || 'RICARDO YURI SALAZAR NARANJO'}`,
        fontSize: 7,
        bold: true,
        margin: [0, 0, 0, 3],
      },

      {
        text: 'DIRECTOR DR.RICARDO YURI SALAZAR NARANJO',
        fontSize: 7,
        bold: true,
        margin: [0, 0, 0, 3],
      },

      {
        text: 'P R E S E N T E.',
        fontSize: 7,
        bold: true,
        margin: [0, 0, 0, 10],
      },

      // QUIEN SUSCRIBE
      {
        text: 'QUIEN SUSCRIBE',
        fontSize: 7,
        bold: true,
        margin: [0, 0, 0, 5],
      },

      {
        text: `${consentimiento.nombre_responsable?.toUpperCase() || pacienteCompleto.nombre_completo?.toUpperCase()}`,
        fontSize: 7,
        bold: true,
        margin: [0, 0, 0, 8],
      },

      {
        text: 'Responsable de:',
        fontSize: 7,
        margin: [0, 0, 0, 3],
      },

      {
        text: `${pacienteCompleto.nombre_completo?.toUpperCase()}`,
        fontSize: 7,
        bold: true,
        margin: [0, 0, 0, 8],
      },

      // DOMICILIO
      {
        text: `Domicilio: ${this.formatearDireccionCompleta(pacienteCompleto)?.toUpperCase() || 'NO ESPECIFICADO'}`,
        fontSize: 6,
        margin: [0, 0, 0, 10],
      },

      // AUTORIZO (enmarcado como hospitalización)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'AUTORIZO PLENAMENTE',
                fontSize: 8,
                bold: true,
                alignment: 'center',
                margin: [0, 2, 0, 2],
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
        margin: [0, 0, 0, 6],
      },

      // AUTORIZACIÓN PRINCIPAL
      {
        text: `AL PERSONAL DEL HOSPITAL A SU CARGO PARA EJECUTAR LAS INVESTIGACIONES CLINICAS, DE LABORATORIO Y DE GABINETE, QUE SEAN NECESARIAS PARA EL DIAGNOSTICO DE LA ENFERMEDAD DE MI PACIENTE:`,
        fontSize: 6,
        lineHeight: 1.3,
        alignment: 'justify',
        margin: [0, 0, 0, 10],
      },

      // NOMBRE DEL PACIENTE (destacado en caja)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: `${pacienteCompleto.nombre_completo?.toUpperCase()}`,
                fontSize: 7,
                bold: true,
                alignment: 'center',
                margin: [0, 3, 0, 3],
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
        margin: [0, 0, 0, 8],
      },

      {
        text: 'ASI COMO TAMBIEN PARA REALIZAR LOS TRATAMIENTOS MEDICOS O QUIRURGICOS QUE CONVENGAN. ASI MISMO SE COMPROMETE A OBSERVAR EL REGLAMENTO INTERNO DE LA INSTITUCION.',
        fontSize: 6,
        lineHeight: 1.3,
        alignment: 'justify',
        margin: [0, 0, 0, 15],
      },

      // INFORMACIÓN ESPECÍFICA DEL TRATAMIENTO (si está disponible)
      ...(consentimiento.diagnostico_tratamiento ? [
        {
          text: `DIAGNÓSTICO: ${consentimiento.diagnostico_tratamiento}`,
          fontSize: 6,
          margin: [0, 0, 0, 5],
        },
      ] : []),

      ...(consentimiento.estudios_autorizados ? [
        {
          text: `ESTUDIOS AUTORIZADOS: ${consentimiento.estudios_autorizados}`,
          fontSize: 6,
          margin: [0, 0, 0, 10],
        },
      ] : []),

      // ACEPTO (simple como hospitalización)
      {
        text: 'ATENTAMENTE',
        fontSize: 7,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 20],
      },

      // OBSERVACIONES (si existen, compactas)
      ...(consentimiento.observaciones ? [
        {
          text: `OBSERVACIONES: ${consentimiento.observaciones}`,
          fontSize: 6,
          margin: [0, 0, 0, 8],
          lineHeight: 1.2,
          italics: true,
        },
      ] : []),

      // FIRMAS COMPACTAS (mismo estilo hospitalización)
      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              {
                text: '\n\n\n_________________________________________\nNOMBRE Y FIRMA DE PERSONA LEGALMENTE RESPONSABLE',
                fontSize: 6,
                alignment: 'center',
                margin: [0, 10, 0, 10],
              },
              {
                text: '\n\n\n_________________________________________\nNOMBRE Y FIRMA DEL PACIENTE',
                fontSize: 6,
                alignment: 'center',
                margin: [0, 10, 0, 10],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 15],
      },

      // MÉDICO TESTIGO COMPACTOS
      {
        table: {
          widths: ['45%', '10%', '45%'],
          body: [
            [
              {
                text: '\n\n_____________________________\nTESTIGO',
                fontSize: 6,
                alignment: 'center',
                margin: [0, 8, 0, 8],
              },
              { text: '', fontSize: 6 },
              {
                text: '\n\n_____________________________\nTESTIGO',
                fontSize: 6,
                alignment: 'center',
                margin: [0, 8, 0, 8],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 10],
      },

      // LUGAR Y FECHA SIMPLE
      {
        text: `San Luis de la Paz, Guanajuato a ${fechaActual.getDate()} de ${fechaActual.toLocaleDateString('es-MX', { month: 'long' })} de ${fechaActual.getFullYear()}`,
        fontSize: 7,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 8],
      },

      // INFORMACIÓN NORMATIVA SIMPLE
      {
        columns: [
          {
            width: '50%',
            text: [
              {
                text: 'Marco Legal:\n',
                fontSize: 6,
                bold: true,
              },
              {
                text: '• NOM-004-SSA3-2012\n• Tratamiento Médico\n• Arts. 80-83 Ley General de Salud',
                fontSize: 6,
              },
            ],
            alignment: 'left',
          },
          {
            width: '50%',
            text: [
              {
                text: 'SICEG - Hospital General San Luis de la Paz\n',
                fontSize: 6,
                bold: true,
              },
              {
                text: `${fechaActual.toLocaleString('es-MX')} - Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
                fontSize: 6,
              },
            ],
            alignment: 'right',
          },
        ],
        margin: [0, 3, 0, 0],
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
                text: 'Consentimiento para Tratamiento Médico - SICEG\nNOM-004-SSA3-2012',
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
                    text: `Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
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



// 🔪 CONSENTIMIENTO PARA CIRUGÍA O PROCEDIMIENTOS
// 🔪 CONSENTIMIENTO PARA CIRUGÍA O PROCEDIMIENTOS
// async generarConsentimientoCirugia(datos: any): Promise<any> {
//   console.log('📝 Generando Consentimiento para Cirugía/Procedimientos...');

//   const { pacienteCompleto, medicoCompleto, consentimiento } = datos;
//   const fechaActual = new Date();
//   const configuracion = await this.obtenerConfiguracionLogosInteligente();

//   return {
//     pageSize: 'LETTER',
//     pageMargins: [20, 80, 20, 40],

//     header: {
//       margin: [20, 10, 20, 10],
//       table: {
//         widths: ['20%', '60%', '20%'],
//         body: [
//           [
//             {
//               image: await this.obtenerImagenBase64(
//                 datos.configuracion?.logo_gobierno ||
//                 configuracion.logo_gobierno ||
//                 '/uploads/logos/logo-gobierno-importado.svg'
//               ),
//               fit: [80, 40],
//               alignment: 'left',
//               margin: [0, 5],
//             },
//             {
//               stack: [
//                 {
//                   text: 'INSTITUTO DE SALUD PÚBLICA DEL ESTADO DE GUANAJUATO',
//                   fontSize: 7,
//                   bold: true,
//                   alignment: 'center',
//                 },
//                 {
//                   text: 'HOSPITAL GENERAL DE SAN LUIS DE LA PAZ',
//                   fontSize: 8,
//                   bold: true,
//                   alignment: 'center',
//                   margin: [0, 1, 0, 2],
//                 },
//                 {
//                   text: 'CARTA DE CONSENTIMIENTO INFORMADO PARA CIRUGÍA O PROCEDIMIENTOS Y ALTERNATIVAS',
//                   fontSize: 7,
//                   bold: true,
//                   alignment: 'center',
//                   margin: [0, 1, 0, 0],
//                 },
//               ],
//             },
//             {
//               image: await this.obtenerImagenBase64(
//                 datos.configuracion?.logo_principal ||
//                 configuracion.logo_principal ||
//                 '/uploads/logos/logo-principal-importado.svg'
//               ),
//               fit: [80, 40],
//               alignment: 'right',
//               margin: [0, 5],
//             },
//           ],
//         ],
//       },
//       layout: 'noBorders',
//     },

//     content: [
//       // DATOS DEL PACIENTE (estilo compacto como hospitalización)
//       {
//         table: {
//           widths: ['15%', '35%', '15%', '15%', '10%', '10%'],
//           body: [
//             [
//               { text: 'NOMBRE:', fontSize: 7, bold: true },
//               { text: pacienteCompleto.nombre_completo, fontSize: 7, bold: true, decoration: 'underline' },
//               { text: 'EDAD:', fontSize: 7, bold: true },
//               { text: `${pacienteCompleto.edad} AÑOS`, fontSize: 7, decoration: 'underline' },
//               { text: 'FECHA:', fontSize: 7, bold: true },
//               { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, decoration: 'underline' },
//             ],
//             [
//               { text: 'CURP:', fontSize: 7, bold: true },
//               { text: pacienteCompleto.curp || 'No registrado', fontSize: 7, decoration: 'underline' },
//               { text: 'SEXO:', fontSize: 7, bold: true },
//               { text: pacienteCompleto.sexo?.toUpperCase(), fontSize: 7, decoration: 'underline' },
//               { text: 'EXPEDIENTE:', fontSize: 7, bold: true },
//               { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto), fontSize: 7, decoration: 'underline' },
//             ],
//             [
//               { text: 'F. NACIMIENTO:', fontSize: 7, bold: true },
//               { text: this.formatearFecha(pacienteCompleto.fecha_nacimiento) || 'No registrada', fontSize: 7, decoration: 'underline' },
//               { text: 'No. CAMA:', fontSize: 7, bold: true },
//               { text: consentimiento.numero_cama || 'Sin asignar', fontSize: 7, decoration: 'underline' },
//               { text: 'SERVICIO:', fontSize: 7, bold: true },
//               { text: medicoCompleto.departamento?.toUpperCase() || 'NO ESPECIFICADO', fontSize: 7, decoration: 'underline' },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//         margin: [0, 0, 0, 15],
//       },

//       // YO (estilo compacto)
//       {
//         table: {
//           widths: ['5%', '95%'],
//           body: [
//             [
//               { text: 'YO:', fontSize: 7, bold: true },
//               {
//                 text: `${consentimiento.nombre_responsable || pacienteCompleto.nombre_completo}`,
//                 fontSize: 7,
//                 decoration: 'underline',
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//         margin: [0, 0, 0, 5],
//       },

//       {
//         text: 'En pleno uso de mis facultades mentales, AUTORIZO a este Hospital y a su personal para realizar la siguiente Operación (o Procedimiento):',
//         fontSize: 7,
//         lineHeight: 1.2,
//         margin: [0, 0, 0, 10],
//       },

//       // NOMBRE DEL PROCEDIMIENTO (estilo compacto)
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: consentimiento.nombre_procedimiento || 'AGREGAR NOMBRE DE LA CIRUGÍA',
//                 fontSize: 8,
//                 bold: true,
//                 alignment: 'center',
//                 margin: [0, 8, 0, 8],
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 1,
//           vLineWidth: () => 1,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//         margin: [0, 0, 0, 10],
//       },

//       {
//         text: 'Entendiendo que la ventaja de someterme a este procedimiento quirúrgico o diagnóstico es:',
//         fontSize: 6,
//         margin: [0, 0, 0, 5],
//       },

//       // BENEFICIOS (compacto)
//       {
//         text: consentimiento.beneficios_procedimiento || 'ESPECIFICAR BENEFICIOS DEL PROCEDIMIENTO',
//         fontSize: 6,
//         margin: [0, 0, 0, 10],
//       },

//       // RIESGOS
//       {
//         text: 'RIESGOS:',
//         fontSize: 7,
//         bold: true,
//         margin: [0, 0, 0, 5],
//       },

//       {
//         text: 'Se da autorización bajo el entendimiento pleno de que cualquier operación o procedimiento médico-quirúrgico, implica algún(os) riesgo(s) y/o peligro(s). Los riesgos más comunes incluyen: Infección, Hemorragia, Lesión nerviosa, Coágulos sanguíneos, ataque cardiaco, Reacciones alérgicas y neumonía. Estos riesgos pueden ser graves e incluso mortales. Algunos riesgos importantes en especial de este tipo de intervención que se va a realizar son:',
//         fontSize: 7,
//         lineHeight: 1.2,
//         alignment: 'justify',
//         margin: [0, 0, 0, 8],
//       },

//       // RIESGOS ESPECÍFICOS (compacto)
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: consentimiento.riesgos_especificos || 'AGREGAR RIESGOS ESPECÍFICOS',
//                 fontSize: 6,
//                 margin: [5, 5, 5, 5],
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 1,
//           vLineWidth: () => 1,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//         margin: [0, 0, 0, 10],
//       },

//       // ANESTESIA (compacto)
//       {
//         text: 'ANESTESIA',
//         fontSize: 6,
//         bold: true,
//         margin: [0, 0, 0, 5],
//       },

//       {
//         text: 'La aplicación de Anestesia también implica riesgos; el más importante de estos, aunque poco frecuente que suceda, es el riesgo de sufrir alguna reacción a los medicamentos que pueden ser incluso fatales. Autorizo la técnica y el uso de anestésicos que juzgue necesarios la persona de este servicio para la realización del procedimiento autorizado',
//         fontSize: 7,
//         lineHeight: 1.2,
//         alignment: 'justify',
//         margin: [0, 0, 0, 10],
//       },

//       // PROCEDIMIENTOS ADICIONALES (compacto)
//       {
//         text: 'PROCEDIMIENTOS ADICIONALES:',
//         fontSize: 6,
//         bold: true,
//         margin: [0, 0, 0, 5],
//       },

//       {
//         text: [
//           {
//             text: 'Si mi Médico selecciona un procedimiento diferente, por alguna situación especial no sospechada en el transcurso de mi intervención (SI o NO) ',
//             fontSize: 6,
//           },
//           {
//             text: consentimiento.autoriza_procedimientos_adicionales?.toUpperCase() || 'AGREGAR',
//             fontSize: 6,
//             bold: true,
//             decoration: 'underline',
//           },
//           {
//             text: ' lo AUTORIZO a realizar si lo considera necesario.',
//             fontSize: 6,
//           },
//         ],
//         margin: [0, 0, 0, 10],
//       },

//       {
//         text: 'Estoy enterado(a), de que no existe garantía o seguridad sobre resultados del procedimiento y de que existe la posibilidad de que no pueda curarse la enfermedad o padecimiento que presento.',
//         fontSize: 7,
//         lineHeight: 1.2,
//         alignment: 'justify',
//         margin: [0, 0, 0, 8],
//       },

//       {
//         text: 'Así también estoy enterado(a) de que nadie puede decir con seguridad cuáles serán las complicaciones que ocurran en mi caso, si es que las hay',
//         fontSize: 7,
//         lineHeight: 1.2,
//         alignment: 'justify',
//         margin: [0, 0, 0, 10],
//       },

//       // CONSENTIMIENTO DEL PACIENTE
//       {
//         text: 'CONSENTIMIENTO DEL PACIENTE O TUTOR.',
//         fontSize: 7,
//         bold: true,
//         margin: [0, 0, 0, 8],
//       },

//       {
//         text: 'Tengo que leer y entender esta forma de consentimiento, la que no debo firmar si alguno de los párrafos o de mis dudas no han sido explicadas a mi entera satisfacción o si no entiendo cualquier término o palabra contenida en ese documento.',
//         fontSize: 7,
//         lineHeight: 1.2,
//         alignment: 'justify',
//         margin: [0, 0, 0, 10],
//       },

//       {
//         text: 'Si tiene cualquier duda acerca de los riesgos o peligros de la cirugía o tratamiento propuesto, pregunte a su Cirujano, ahora. ¡Antes de firmar el documento! ¡No firme a menos de que entienda por completo este documento!',
//         fontSize: 7,
//         lineHeight: 1.2,
//         alignment: 'justify',
//         margin: [0, 0, 0, 20],
//       },

//       // FIRMAS (estilo compacto)
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: `${medicoCompleto.titulo_profesional || 'DRA.'} ${medicoCompleto.nombre_completo}\nNombre y Firma del médico`,
//                 fontSize: 6,
//                 alignment: 'center',
//                 margin: [0, 20, 0, 15],
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//         margin: [0, 0, 0, 15],
//       },

//       // TESTIGOS (estilo compacto)
//       {
//         table: {
//           widths: ['50%', '50%'],
//           body: [
//             [
//               {
//                 text: `${consentimiento.testigo1_nombre || consentimiento.nombre_responsable || 'TESTIGO'}\nTestigo (Nombre y Firma)`,
//                 fontSize: 6,
//                 alignment: 'center',
//                 margin: [0, 15, 0, 10],
//               },
//               {
//                 text: `${consentimiento.testigo2_nombre || '_'.repeat(20)}\nTestigo (Nombre y Firma)`,
//                 fontSize: 6,
//                 alignment: 'center',
//                 margin: [0, 15, 0, 10],
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//         margin: [0, 0, 0, 15],
//       },

//       // PACIENTE (estilo compacto)
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: `${pacienteCompleto.nombre_completo}\nNombre y firma del paciente, tutor o representante`,
//                 fontSize: 6,
//                 alignment: 'center',
//                 margin: [0, 15, 0, 10],
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//         margin: [0, 0, 0, 10],
//       },

//       // LUGAR Y FECHA (estilo compacto)
//       {
//         text: `San Luis de la Paz, Guanajuato a ${fechaActual.getDate()} de ${fechaActual.toLocaleDateString('es-MX', { month: 'long' })} de ${fechaActual.getFullYear()}`,
//         fontSize: 6,
//         bold: true,
//         alignment: 'center',
//         margin: [0, 0, 0, 5],
//       },

//       // INFORMACIÓN NORMATIVA SIMPLE
//       {
//         columns: [
//           {
//             width: '50%',
//             text: [
//               {
//                 text: 'Marco Legal:\n',
//                 fontSize: 6,
//                 bold: true,
//               },
//               {
//                 text: '• NOM-004-SSA3-2012\n• Consentimiento Quirúrgico',
//                 fontSize: 6,
//               },
//             ],
//             alignment: 'left',
//           },
//           {
//             width: '50%',
//             text: [
//               {
//                 text: 'SICEG - Hospital General San Luis de la Paz\n',
//                 fontSize: 6,
//                 bold: true,
//               },
//               {
//                 text: `${fechaActual.toLocaleString('es-MX')} - Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
//                 fontSize: 6,
//               },
//             ],
//             alignment: 'right',
//           },
//         ],
//         margin: [0, 5, 0, 0],
//       },
//     ],

//     footer: (currentPage: number, pageCount: number) => {
//       return {
//         margin: [20, 10],
//         table: {
//           widths: ['25%', '50%', '25%'],
//           body: [
//             [
//               {
//                 text: `Página ${currentPage} de ${pageCount}`,
//                 fontSize: 7,
//                 color: '#666666',
//               },
//               {
//                 text: 'Consentimiento para Cirugía/Procedimientos - SICEG\nNOM-004-SSA3-2012',
//                 fontSize: 7,
//                 alignment: 'center',
//                 color: '#666666',
//               },
//               {
//                 text: `${fechaActual.toLocaleDateString('es-MX')}\nExp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
//                 fontSize: 6,
//                 alignment: 'right',
//                 color: '#666666',
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//       };
//     },
//   };
// }
// 🔪 CONSENTIMIENTO PARA CIRUGÍA O PROCEDIMIENTOS (ESTILO HOSPITALIZACIÓN)
async generarConsentimientoCirugia(datos: any): Promise<any> {
  console.log('📝 Generando Consentimiento para Cirugía/Procedimientos - Estilo Formal...');

  const { pacienteCompleto, medicoCompleto, consentimiento } = datos;
  const fechaActual = new Date();
  const configuracion = await this.obtenerConfiguracionLogosInteligente();

  return {
    pageSize: 'LETTER',
    pageMargins: [20, 80, 20, 40],

    header: {
      margin: [20, 10, 20, 10],
      table: {
        widths: ['20%', '60%', '20%'],
        body: [
          [
            {
              image: await this.obtenerImagenBase64(
                datos.configuracion?.logo_gobierno ||
                configuracion.logo_gobierno ||
                '/uploads/logos/logo-gobierno-importado.svg'
              ),
              fit: [80, 40],
              alignment: 'left',
              margin: [0, 5],
            },
            {
              stack: [
                {
                  text: 'INSTITUTO DE SALUD PÚBLICA DEL ESTADO DE GUANAJUATO',
                  fontSize: 7,
                  bold: true,
                  alignment: 'center',
                  color: '#000000',
                },
                {
                  text: 'HOSPITAL GENERAL DE SAN LUIS DE LA PAZ',
                  fontSize: 8,
                  bold: true,
                  alignment: 'center',
                  color: '#000000',
                  margin: [0, 1, 0, 2],
                },
                {
                  text: 'CARTA DE CONSENTIMIENTO INFORMADO PARA CIRUGÍA O PROCEDIMIENTOS Y ALTERNATIVAS',
                  fontSize: 7,
                  bold: true,
                  alignment: 'center',
                  color: '#000000',
                  margin: [0, 1, 0, 0],
                },
              ],
            },
            {
              image: await this.obtenerImagenBase64(
                datos.configuracion?.logo_principal ||
                configuracion.logo_principal ||
                '/uploads/logos/logo-principal-importado.svg'
              ),
              fit: [80, 40],
              alignment: 'right',
              margin: [0, 5],
            },
          ],
        ],
      },
      layout: 'noBorders',
    },

    content: [
      // IDENTIFICACIÓN COMPACTA (mismo estilo hospitalización)
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'IDENTIFICACIÓN',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 3,
              },
              {
                table: {
                  widths: ['20%', '30%', '15%', '15%', '20%'],
                  body: [
                    [
                      { text: 'Fecha', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Nombre del Paciente', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'No. Expediente', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'center' },
                      { text: pacienteCompleto.nombre_completo, fontSize: 7, alignment: 'center', bold: true },
                      { text: `${pacienteCompleto.edad}`, fontSize: 7, alignment: 'center' },
                      { text: pacienteCompleto.sexo, fontSize: 7, alignment: 'center' },
                      { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto) || 'N/A', fontSize: 7, alignment: 'center', bold: true },
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
                      { text: 'CURP', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'F. Nacimiento', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Servicio', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Cama', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: pacienteCompleto.curp || 'No registrado', fontSize: 7, alignment: 'center' },
                      { text: this.formatearFecha(pacienteCompleto.fecha_nacimiento) || 'No registrada', fontSize: 7, alignment: 'center' },
                      { text: medicoCompleto.departamento || 'No especificado', fontSize: 7, alignment: 'center' },
                      { text: consentimiento.numero_cama || 'Por asignar', fontSize: 7, alignment: 'center' },
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
                      { text: 'Médico Responsable', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Cédula Profesional', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: medicoCompleto.nombre_completo || 'No especificado', fontSize: 7, alignment: 'center' },
                      { text: medicoCompleto.numero_cedula || 'No registrada', fontSize: 7, alignment: 'center' },
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
        margin: [0, 0, 0, 8],
      },

      // YO (estilo hospitalización)
      {
        table: {
          widths: ['5%', '95%'],
          body: [
            [
              { text: 'YO', fontSize: 8, bold: true },
              {
                text: `${consentimiento.nombre_responsable || pacienteCompleto.nombre_completo}`,
                fontSize: 8,
                decoration: 'underline',
                margin: [0, 0, 0, 0],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 5],
      },

      {
        text: 'en pleno uso de mis facultades mentales, y en caso de menores de edad e incapacitados para otorgar su consentimiento y/o autorización.',
        fontSize: 8,
        lineHeight: 1.2,
        margin: [0, 0, 0, 8],
      },

      // AUTORIZO (enmarcado como hospitalización)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'AUTORIZO',
                fontSize: 8,
                bold: true,
                alignment: 'center',
                margin: [0, 2, 0, 2],
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
        margin: [0, 0, 0, 6],
      },

      {
        text: 'a este Hospital y a su personal para realizar la siguiente Operación (o Procedimiento):',
        fontSize: 7,
        lineHeight: 1.2,
        margin: [0, 0, 0, 8],
      },

      // NOMBRE DEL PROCEDIMIENTO (enmarcado como hospitalización)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: consentimiento.nombre_procedimiento || 'AGREGAR NOMBRE DE LA CIRUGÍA',
                fontSize: 8,
                bold: true,
                alignment: 'center',
                margin: [0, 4, 0, 4],
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
        margin: [0, 0, 0, 8],
      },

      {
        text: 'Entendiendo que la ventaja de someterme a este procedimiento quirúrgico o diagnóstico es:',
        fontSize: 6,
        margin: [0, 0, 0, 5],
      },

      // BENEFICIOS (en caja si existe)
      ...(consentimiento.beneficios_procedimiento ? [
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: consentimiento.beneficios_procedimiento,
                  fontSize: 6,
                  margin: [3, 3, 3, 3],
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
          margin: [0, 0, 0, 8],
        },
      ] : [
        {
          text: 'ESPECIFICAR BENEFICIOS DEL PROCEDIMIENTO',
          fontSize: 6,
          margin: [0, 0, 0, 8],
        },
      ]),

      // RIESGOS (enmarcado como hospitalización)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'RIESGOS',
                fontSize: 7,
                bold: true,
                alignment: 'center',
                margin: [0, 2, 0, 2],
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
        margin: [0, 0, 0, 6],
      },

      {
        text: 'Se da autorización bajo el entendimiento pleno de que cualquier operación o procedimiento médico-quirúrgico, implica algún(os) riesgo(s) y/o peligro(s). Los riesgos más comunes incluyen: Infección, Hemorragia, Lesión nerviosa, Coágulos sanguíneos, ataque cardiaco, Reacciones alérgicas y neumonía. Estos riesgos pueden ser graves e incluso mortales.',
        fontSize: 6,
        lineHeight: 1.2,
        alignment: 'justify',
        margin: [0, 0, 0, 8],
      },

      {
        text: 'Algunos riesgos importantes en especial de este tipo de intervención que se va a realizar son:',
        fontSize: 6,
        margin: [0, 0, 0, 5],
      },

      // RIESGOS ESPECÍFICOS (en caja)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: consentimiento.riesgos_especificos || 'AGREGAR RIESGOS ESPECÍFICOS',
                fontSize: 6,
                margin: [3, 4, 3, 4],
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
        margin: [0, 0, 0, 8],
      },

      // ANESTESIA Y PROCEDIMIENTOS ADICIONALES (compactos)
      {
        text: [
          { text: 'ANESTESIA: ', fontSize: 6, bold: true },
          { text: 'La aplicación de Anestesia también implica riesgos; el más importante es el riesgo de sufrir alguna reacción a los medicamentos que pueden ser incluso fatales. Autorizo la técnica y el uso de anestésicos que juzgue necesarios.', fontSize: 6 },
        ],
        lineHeight: 1.2,
        alignment: 'justify',
        margin: [0, 0, 0, 8],
      },

      {
        text: [
          { text: 'PROCEDIMIENTOS ADICIONALES: ', fontSize: 6, bold: true },
          { text: 'Si mi Médico selecciona un procedimiento diferente (SI o NO) ', fontSize: 6 },
          { text: consentimiento.autoriza_procedimientos_adicionales?.toUpperCase() || 'AGREGAR', fontSize: 6, bold: true, decoration: 'underline' },
          { text: ' lo AUTORIZO a realizar si lo considera necesario.', fontSize: 6 },
        ],
        margin: [0, 0, 0, 8],
      },

      {
        text: 'Estoy enterado(a), de que no existe garantía o seguridad sobre resultados del procedimiento y de que existe la posibilidad de que no pueda curarse la enfermedad o padecimiento que presento. También estoy enterado(a) de que nadie puede decir con seguridad cuáles serán las complicaciones que ocurran en mi caso, si es que las hay.',
        fontSize: 6,
        lineHeight: 1.2,
        alignment: 'justify',
        margin: [0, 0, 0, 10],
      },

      // CONSENTIMIENTO DEL PACIENTE (enmarcado)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'CONSENTIMIENTO DEL PACIENTE O TUTOR',
                fontSize: 7,
                bold: true,
                alignment: 'center',
                margin: [0, 2, 0, 2],
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
        margin: [0, 0, 0, 6],
      },

      {
        text: 'Tengo que leer y entender esta forma de consentimiento, la que no debo firmar si alguno de los párrafos o de mis dudas no han sido explicadas a mi entera satisfacción o si no entiendo cualquier término o palabra contenida en ese documento.',
        fontSize: 6,
        lineHeight: 1.2,
        alignment: 'justify',
        margin: [0, 0, 0, 8],
      },

      {
        text: 'Si tiene cualquier duda acerca de los riesgos o peligros de la cirugía o tratamiento propuesto, pregunte a su Cirujano, ahora. ¡Antes de firmar el documento! ¡No firme a menos de que entienda por completo este documento!',
        fontSize: 6,
        lineHeight: 1.2,
        alignment: 'justify',
        margin: [0, 0, 0, 15],
      },

      // ACEPTO (simple como hospitalización)
      {
        text: 'ACEPTO',
        fontSize: 7,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 15],
      },

      // OBSERVACIONES (si existen, compactas)
      ...(consentimiento.observaciones ? [
        {
          text: `OBSERVACIONES: ${consentimiento.observaciones}`,
          fontSize: 6,
          margin: [0, 0, 0, 8],
          lineHeight: 1.2,
          italics: true,
        },
      ] : []),

      // FIRMAS COMPACTAS (mismo estilo hospitalización)
      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              {
                text: '\n\n\n_________________________________________\nNombre y Firma del médico',
                fontSize: 6,
                alignment: 'center',
                margin: [0, 10, 0, 10],
              },
              {
                text: '\n\n\n_________________________________________\nNombre y firma del paciente, tutor o representante',
                fontSize: 6,
                alignment: 'center',
                margin: [0, 10, 0, 10],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 10],
      },

      // TESTIGOS COMPACTOS
      {
        table: {
          widths: ['45%', '10%', '45%'],
          body: [
            [
              {
                text: '\n\n_____________________________\nTestigo',
                fontSize: 6,
                alignment: 'center',
                margin: [0, 8, 0, 8],
              },
              { text: '', fontSize: 6 },
              {
                text: '\n\n_____________________________\nTestigo',
                fontSize: 6,
                alignment: 'center',
                margin: [0, 8, 0, 8],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 10],
      },

      // LUGAR Y FECHA SIMPLE
      {
        text: `San Luis de la Paz, Guanajuato a ${fechaActual.getDate()} de ${fechaActual.toLocaleDateString('es-MX', { month: 'long' })} de ${fechaActual.getFullYear()}`,
        fontSize: 7,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 8],
      },

      // INFORMACIÓN NORMATIVA SIMPLE
      {
        columns: [
          {
            width: '50%',
            text: [
              {
                text: 'Marco Legal:\n',
                fontSize: 6,
                bold: true,
              },
              {
                text: '• NOM-004-SSA3-2012\n• Consentimiento Quirúrgico\n• Arts. 80-83 Ley General de Salud',
                fontSize: 6,
              },
            ],
            alignment: 'left',
          },
          {
            width: '50%',
            text: [
              {
                text: 'SICEG - Hospital General San Luis de la Paz\n',
                fontSize: 6,
                bold: true,
              },
              {
                text: `${fechaActual.toLocaleString('es-MX')} - Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
                fontSize: 6,
              },
            ],
            alignment: 'right',
          },
        ],
        margin: [0, 3, 0, 0],
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
                text: 'Consentimiento para Cirugía/Procedimientos - SICEG\nNOM-004-SSA3-2012',
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
                    text: `Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
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



// // 🩸 CONSENTIMIENTO PARA TRANSFUSIÓN SANGUÍNEA
// async generarConsentimientoTransfusionSanguinea(datos: any): Promise<any> {
//   console.log('📝 Generando Consentimiento para Transfusión Sanguínea...');

//   const { pacienteCompleto, medicoCompleto, consentimiento } = datos;
//   const fechaActual = new Date();
//   const configuracion = await this.obtenerConfiguracionLogosInteligente();

//   return {
//     pageSize: 'LETTER',
//     pageMargins: [20, 80, 20, 40],

//     header: {
//       margin: [20, 10, 20, 10],
//       table: {
//         widths: ['20%', '60%', '20%'],
//         body: [
//           [
//             {
//               image: await this.obtenerImagenBase64(
//                 datos.configuracion?.logo_gobierno ||
//                 configuracion.logo_gobierno ||
//                 '/uploads/logos/logo-gobierno-importado.svg'
//               ),
//               fit: [80, 40],
//               alignment: 'left',
//               margin: [0, 5],
//             },
//             {
//               stack: [
//                 {
//                   text: 'INSTITUTO DE SALUD PÚBLICA DEL ESTADO DE GUANAJUATO',
//                   fontSize: 7,
//                   bold: true,
//                   alignment: 'center',
//                 },
//                 {
//                   text: 'HOSPITAL GENERAL DE SAN LUIS DE LA PAZ',
//                   fontSize: 8,
//                   bold: true,
//                   alignment: 'center',
//                   margin: [0, 1, 0, 2],
//                 },
//                 {
//                   text: 'CARTA DE CONSENTIMIENTO INFORMADO PARA LA TRANSFUSIÓN SANGUÍNEA O SUS DERIVADOS',
//                   fontSize: 7,
//                   bold: true,
//                   alignment: 'center',
//                   margin: [0, 1, 0, 0],
//                 },
//               ],
//             },
//             {
//               image: await this.obtenerImagenBase64(
//                 datos.configuracion?.logo_principal ||
//                 configuracion.logo_principal ||
//                 '/uploads/logos/logo-principal-importado.svg'
//               ),
//               fit: [80, 40],
//               alignment: 'right',
//               margin: [0, 5],
//             },
//           ],
//         ],
//       },
//       layout: 'noBorders',
//     },

//     content: [
//       // DATOS DEL PACIENTE (formato original exacto)
//       {
//         table: {
//           widths: ['15%', '35%', '15%', '15%', '10%', '10%'],
//           body: [
//             [
//               { text: 'NOMBRE:', fontSize: 7, bold: true },
//               { text: pacienteCompleto.nombre_completo, fontSize: 7, bold: true, decoration: 'underline' },
//               { text: 'EDAD:', fontSize: 7, bold: true },
//               { text: `${pacienteCompleto.edad} AÑOS`, fontSize: 7, decoration: 'underline' },
//               { text: 'FECHA:', fontSize: 7, bold: true },
//               { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, decoration: 'underline' },
//             ],
//             [
//               { text: 'CURP:', fontSize: 7, bold: true },
//               { text: pacienteCompleto.curp || 'No registrado', fontSize: 7, decoration: 'underline' },
//               { text: 'SEXO:', fontSize: 7, bold: true },
//               { text: pacienteCompleto.sexo?.toUpperCase(), fontSize: 7, decoration: 'underline' },
//               { text: 'EXPEDIENTE:', fontSize: 7, bold: true },
//               { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto), fontSize: 7, decoration: 'underline' },
//             ],
//             [
//               { text: '', fontSize: 7 },
//               { text: '', fontSize: 7 },
//               { text: '', fontSize: 7 },
//               { text: '', fontSize: 7 },
//               { text: 'ESTADO CIVIL:', fontSize: 7, bold: true },
//               { text: consentimiento.estado_civil || pacienteCompleto.estado_civil || 'No especificado', fontSize: 7, decoration: 'underline' },
//             ],
//             [
//               { text: 'F. NACIMIENTO:', fontSize: 7, bold: true },
//               { text: this.formatearFecha(pacienteCompleto.fecha_nacimiento) || 'No registrada', fontSize: 7, decoration: 'underline' },
//               { text: 'No. CAMA:', fontSize: 7, bold: true },
//               { text: consentimiento.numero_cama || 'Sin asignar', fontSize: 7, decoration: 'underline' },
//               { text: 'SERVICIO:', fontSize: 7, bold: true },
//               { text: medicoCompleto.departamento?.toUpperCase() || 'NO ESPECIFICADO', fontSize: 7, decoration: 'underline' },
//             ],
//             [
//               { text: 'DIAGNÓSTICO:', fontSize: 7, bold: true },
//               { text: consentimiento.diagnostico_transfusion || 'AGREGAR', fontSize: 7, decoration: 'underline', colSpan: 5 },
//               {},
//               {},
//               {},
//               {},
//             ],
//             [
//               { text: 'DOMICILIO:', fontSize: 7, bold: true },
//               { text: consentimiento.domicilio_completo || this.formatearDireccionCompleta(pacienteCompleto) || 'NO ESPECIFICADO', fontSize: 7, decoration: 'underline', colSpan: 5 },
//               {},
//               {},
//               {},
//               {},
//             ],
//           ],
//         },
//         layout: 'noBorders',
//         margin: [0, 0, 0, 15],
//       },

//       // TEXTO INFORMATIVO (exacto del hospital)
//       {
//         text: '"Durante su ingreso hospitalario puede ser necesaria la transfusión de sangre y otros hemoderivados como plasma fresco congelado, plaquetas, y crioprecipitados, bien porque se precise durante la intervención quirúrgica, o porque tenga una enfermedad en la que sea necesaria.',
//         fontSize: 6,
//         lineHeight: 1.3,
//         alignment: 'justify',
//         margin: [0, 0, 0, 10],
//       },

//       {
//         text: 'La transfusión consiste en la administración de sangre humana o alguno de sus componentes, a los pacientes que lo precisen. Se administra por vía intravenosa. También cabe la posibilidad de que durante el procedimiento haya que realizar modificaciones del mismo.',
//         fontSize: 6,
//         lineHeight: 1.3,
//         alignment: 'justify',
//         margin: [0, 0, 0, 10],
//       },

//       {
//         text: 'Aún que se haga una adecuada elección del procedimiento y de su correcta aplicación, pueden presentarse efectos indeseables, tanto los comunes derivados del mismo y pueden afectar a todos los órganos y sistemas, como son debidos a la situación vital del paciente (diabetes, cardiopatía, hipertensión, edad avanzada, anemia, obesidad entre otras), y los específicos del procedimiento.',
//         fontSize: 6,
//         lineHeight: 1.3,
//         alignment: 'justify',
//         margin: [0, 0, 0, 10],
//       },

//       {
//         text: 'La sangre y sus derivados proceden de personas que gozan de buena salud. Son personas que, por donar no perciben compensación económica alguna. Todos los donadores son seleccionados con criterios médicos y la sangre se estudia cuidadosamente con los análisis que exigen las leyes. Cualquier unidad de sangre o hemoderivado que vaya usted a recibir habrá sido analizada para SIDA (anticuerpos anti-HIV), HEPATITIS (Hepatitis B/C), SIFILIS, BRUCELOSIS Y CHAGAS.',
//         fontSize: 6,
//         lineHeight: 1.3,
//         alignment: 'justify',
//         margin: [0, 0, 0, 10],
//       },

//       {
//         text: 'A pesar de ello puede ocurrir que el donante se encuentre en el periodo ventana (espacio de tiempo en el cual no es posible la detección serológica de la infección) y se pueda trasmitir alguna de las infecciones anteriormente mencionadas.',
//         fontSize: 6,
//         lineHeight: 1.3,
//         alignment: 'justify',
//         margin: [0, 0, 0, 8],
//       },

//       {
//         text: 'Otro riesgo posible que tienen las transfusiones es que el receptor pueda sufrir algún tipo de reacción de rechazo a alguno de los componentes de la sangre. Estas reacciones son frecuentes y, prácticamente, siempre leves.',
//         fontSize: 6,
//         lineHeight: 1.3,
//         alignment: 'justify',
//         margin: [0, 0, 0, 8],
//       },

//       {
//         text: 'Ningún procedimiento invasivo está absolutamente exento de riesgos importantes, incluyendo la muerte, aunque esta posibilidad es poco frecuente.',
//         fontSize: 6,
//         lineHeight: 1.3,
//         alignment: 'justify',
//         margin: [0, 0, 0, 15],
//       },

//       // MARCO LEGAL
//       {
//         text: 'En atención a los artículos 80 al 83 de reglamento de la Ley General de Salud en materia de atención médica y a la Norma Oficial Mexicana NOM-004-SSA3-2012, relativa al expediente clínico numerales 4.2, 10.1 al10.1.2, considerando la NORMA Oficial Mexicana NOM-253-SSA1-2012, para la disposición de sangre humana y sus componentes con fines terapéuticos. Se otorga la presente autorización al personal Médico y Paramédico del Hospital para realizar la transfusión de hemoderivados necesarios al paciente en cuestión, y para tal efecto, dicho paciente y/ó su representante legal: DECLARA"',
//         fontSize: 6,
//         lineHeight: 1.3,
//         alignment: 'justify',
//         margin: [0, 0, 0, 20],
//       },

//       // DECLARO
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: 'DECLARO',
//                 fontSize: 14,
//                 bold: true,
//                 alignment: 'center',
//                 margin: [0, 8, 0, 8],
//               },
//             ],
//           ],
//         },
//         layout: {
//           hLineWidth: () => 1,
//           vLineWidth: () => 1,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//         margin: [0, 0, 0, 15],
//       },

//       {
//         text: 'Que los médicos me han entregado esta hoja informativa, la cual he leído y he comprendido el significado del procedimiento y los riesgos inherentes al mismo, por lo cual, declaro estar debidamente informado por el personal de salud del Hospital General San Luis de la Paz.',
//         fontSize: 6,
//         lineHeight: 1.3,
//         alignment: 'justify',
//         margin: [0, 0, 0, 20],
//       },

//       // ACEPTO
//       {
//         text: 'ACEPTO',
//         fontSize: 16,
//         bold: true,
//         alignment: 'center',
//         margin: [0, 0, 0, 30],
//       },

//       // FIRMAS
//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: `${pacienteCompleto.nombre_completo}\nNombre y firma del paciente, tutor o representante legal.`,
//                 fontSize: 6,
//                 alignment: 'center',
//                 margin: [0, 20, 0, 20],
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//         margin: [0, 0, 0, 20],
//       },

//       {
//         table: {
//           widths: ['100%'],
//           body: [
//             [
//               {
//                 text: `${medicoCompleto.titulo_profesional || 'DRA.'} ${medicoCompleto.nombre_completo}\nNombre, firma y sello del médico tratante`,
//                 fontSize: 6,
//                 alignment: 'center',
//                 margin: [0, 20, 0, 20],
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//         margin: [0, 0, 0, 20],
//       },

//       // TESTIGOS
//       {
//         table: {
//           widths: ['50%', '50%'],
//           body: [
//             [
//               {
//                 text: `${consentimiento.testigo1_nombre || consentimiento.nombre_responsable || 'TESTIGO'}\nTestigo (Nombre y Firma)`,
//                 fontSize: 6,
//                 alignment: 'center',
//                 margin: [0, 15, 0, 10],
//               },
//               {
//                 text: `${consentimiento.testigo2_nombre || '_'.repeat(20)}\nTestigo (Nombre y Firma)`,
//                 fontSize: 6,
//                 alignment: 'center',
//                 margin: [0, 15, 0, 10],
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//       },
//     ],

//     footer: (currentPage: number, pageCount: number) => {
//       return {
//         margin: [20, 10],
//         table: {
//           widths: ['25%', '50%', '25%'],
//           body: [
//             [
//               {
//                 text: `Página ${currentPage} de ${pageCount}`,
//                 fontSize: 7,
//                 color: '#666666',
//               },
//               {
//                 text: 'Consentimiento para Transfusión Sanguínea - SICEG\nNOM-004-SSA3-2012 | NOM-253-SSA1-2012',
//                 fontSize: 7,
//                 alignment: 'center',
//                 color: '#666666',
//               },
//               {
//                 text: `${fechaActual.toLocaleDateString('es-MX')}\nExp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
//                 fontSize: 6,
//                 alignment: 'right',
//                 color: '#666666',
//               },
//             ],
//           ],
//         },
//         layout: 'noBorders',
//       };
//     },
//   };
// }
// 🩸 CONSENTIMIENTO PARA TRANSFUSIÓN SANGUÍNEA (ESTILO HOSPITALIZACIÓN)
async generarConsentimientoTransfusionSanguinea(datos: any): Promise<any> {
  console.log('📝 Generando Consentimiento para Transfusión Sanguínea - Estilo Formal...');

  const { pacienteCompleto, medicoCompleto, consentimiento } = datos;
  const fechaActual = new Date();
  const configuracion = await this.obtenerConfiguracionLogosInteligente();

  return {
    pageSize: 'LETTER',
    pageMargins: [20, 80, 20, 40],

    header: {
       margin: [15, 5, 15, 5], // Era [20, 10, 20, 10]
      table: {
        widths: ['20%', '60%', '20%'],
        body: [
          [
            {
              image: await this.obtenerImagenBase64(
                datos.configuracion?.logo_gobierno ||
                configuracion.logo_gobierno ||
                '/uploads/logos/logo-gobierno-importado.svg'
              ),
             fit: [70, 35], // Era [80, 40]
              alignment: 'left',
              margin: [0, 3], // Era [0, 5]
            },
            {
              stack: [
                {
                  text: 'INSTITUTO DE SALUD PÚBLICA DEL ESTADO DE GUANAJUATO',
                  fontSize: 7,
                  bold: true,
                  alignment: 'center',
                  color: '#000000',
                },
                {
                  text: 'HOSPITAL GENERAL DE SAN LUIS DE LA PAZ',
                  fontSize: 8,
                  bold: true,
                  alignment: 'center',
                  color: '#000000',
                 margin: [0, 0, 0, 1], // Era [0, 1, 0, 2]
                },
                {
                  text: 'CARTA DE CONSENTIMIENTO INFORMADO PARA LA TRANSFUSIÓN SANGUÍNEA O SUS DERIVADOS',
                  fontSize: 7,
                  bold: true,
                  alignment: 'center',
                  color: '#000000',
                  margin: [0, 0, 0, 1], // Era [0, 1, 0, 2]
                },
              ],
            },
            {
              image: await this.obtenerImagenBase64(
                datos.configuracion?.logo_principal ||
                configuracion.logo_principal ||
                '/uploads/logos/logo-principal-importado.svg'
              ),
              fit: [80, 40],
              alignment: 'right',
              margin: [0, 3], // Era [0, 5]
            },
          ],
        ],
      },
      layout: 'noBorders',
    },

    content: [
      // IDENTIFICACIÓN COMPACTA (mismo estilo hospitalización)
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'IDENTIFICACIÓN',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 4,
              },
              {
                table: {
                  widths: ['20%', '30%', '15%', '15%', '20%'],
                  body: [
                    [
                      { text: 'Fecha', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Nombre del Paciente', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'No. Expediente', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'center' },
                      { text: pacienteCompleto.nombre_completo, fontSize: 7, alignment: 'center', bold: true },
                      { text: `${pacienteCompleto.edad}`, fontSize: 7, alignment: 'center' },
                      { text: pacienteCompleto.sexo, fontSize: 7, alignment: 'center' },
                      { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto) || 'N/A', fontSize: 7, alignment: 'center', bold: true },
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
                  widths: ['20%', '20%', '20%', '20%', '20%'],
                  body: [
                    [
                      { text: 'CURP', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'F. Nacimiento', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Servicio', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Cama', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Estado Civil', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: pacienteCompleto.curp || 'No registrado', fontSize: 7, alignment: 'center' },
                      { text: this.formatearFecha(pacienteCompleto.fecha_nacimiento) || 'No registrada', fontSize: 7, alignment: 'center' },
                      { text: medicoCompleto.departamento || 'No especificado', fontSize: 7, alignment: 'center' },
                      { text: consentimiento.numero_cama || 'Por asignar', fontSize: 7, alignment: 'center' },
                      { text: consentimiento.estado_civil || pacienteCompleto.estado_civil || 'No especificado', fontSize: 7, alignment: 'center' },
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
                      { text: 'Médico Responsable', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Cédula Profesional', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: medicoCompleto.nombre_completo || 'No especificado', fontSize: 7, alignment: 'center' },
                      { text: medicoCompleto.numero_cedula || 'No registrada', fontSize: 7, alignment: 'center' },
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
                      { text: 'Diagnóstico que Requiere Transfusión', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: consentimiento.diagnostico_transfusion || 'AGREGAR DIAGNÓSTICO', fontSize: 7, alignment: 'center' },
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
        margin: [0, 0, 0, 5],
      },

      // DOMICILIO (si está disponible)
      ...(consentimiento.domicilio_completo || this.formatearDireccionCompleta(pacienteCompleto) ? [
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: `DOMICILIO: ${consentimiento.domicilio_completo || this.formatearDireccionCompleta(pacienteCompleto) || 'NO ESPECIFICADO'}`,
                  fontSize: 7,
                  margin: [3, 3, 3, 3],
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
          margin: [0, 0, 0, 8],
        },
      ] : []),

      // TEXTO INFORMATIVO (exacto del hospital, con comillas)
      {
        text: '"Durante su ingreso hospitalario puede ser necesaria la transfusión de sangre y otros hemoderivados como plasma fresco congelado, plaquetas, y crioprecipitados, bien porque se precise durante la intervención quirúrgica, o porque tenga una enfermedad en la que sea necesaria.',
        fontSize: 6,
        lineHeight: 1.3,
        alignment: 'justify',
        margin: [0, 0, 0, 8],
      },

      {
        text: 'La transfusión consiste en la administración de sangre humana o alguno de sus componentes, a los pacientes que lo precisen. Se administra por vía intravenosa. También cabe la posibilidad de que durante el procedimiento haya que realizar modificaciones del mismo.',
        fontSize: 6,
        lineHeight: 1.3,
        alignment: 'justify',
        margin: [0, 0, 0, 8],
      },

      {
        text: 'Aún que se haga una adecuada elección del procedimiento y de su correcta aplicación, pueden presentarse efectos indeseables, tanto los comunes derivados del mismo y pueden afectar a todos los órganos y sistemas, como son debidos a la situación vital del paciente (diabetes, cardiopatía, hipertensión, edad avanzada, anemia, obesidad entre otras), y los específicos del procedimiento.',
        fontSize: 6,
        lineHeight: 1.3,
        alignment: 'justify',
        margin: [0, 0, 0, 8],
      },

      {
        text: 'La sangre y sus derivados proceden de personas que gozan de buena salud. Son personas que, por donar no perciben compensación económica alguna. Todos los donadores son seleccionados con criterios médicos y la sangre se estudia cuidadosamente con los análisis que exigen las leyes. Cualquier unidad de sangre o hemoderivado que vaya usted a recibir habrá sido analizada para SIDA (anticuerpos anti-HIV), HEPATITIS (Hepatitis B/C), SIFILIS, BRUCELOSIS Y CHAGAS.',
        fontSize: 6,
        lineHeight: 1.3,
        alignment: 'justify',
        margin: [0, 0, 0, 8],
      },

      {
        text: 'A pesar de ello puede ocurrir que el donante se encuentre en el periodo ventana (espacio de tiempo en el cual no es posible la detección serológica de la infección) y se pueda trasmitir alguna de las infecciones anteriormente mencionadas. Otro riesgo posible que tienen las transfusiones es que el receptor pueda sufrir algún tipo de reacción de rechazo a alguno de los componentes de la sangre. Estas reacciones son frecuentes y, prácticamente, siempre leves.',
        fontSize: 6,
        lineHeight: 1.3,
        alignment: 'justify',
        margin: [0, 0, 0, 8],
      },

      {
        text: 'Ningún procedimiento invasivo está absolutamente exento de riesgos importantes, incluyendo la muerte, aunque esta posibilidad es poco frecuente."',
        fontSize: 6,
        lineHeight: 1.3,
        alignment: 'justify',
        margin: [0, 0, 0, 10],
      },

      // MARCO LEGAL
      {
        text: 'En atención a los artículos 80 al 83 de reglamento de la Ley General de Salud en materia de atención médica y a la Norma Oficial Mexicana NOM-004-SSA3-2012, relativa al expediente clínico numerales 4.2, 10.1 al10.1.2, considerando la NORMA Oficial Mexicana NOM-253-SSA1-2012, para la disposición de sangre humana y sus componentes con fines terapéuticos. Se otorga la presente autorización al personal Médico y Paramédico del Hospital para realizar la transfusión de hemoderivados necesarios al paciente en cuestión, y para tal efecto, dicho paciente y/ó su representante legal:',
        fontSize: 6,
        lineHeight: 1.3,
        alignment: 'justify',
        margin: [0, 0, 0, 8],
      },

      // DECLARO (enmarcado como hospitalización)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'DECLARO',
                fontSize: 8,
                bold: true,
                alignment: 'center',
                margin: [0, 4, 0, 4],
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
        margin: [0, 0, 0, 8],
      },

      {
        text: 'Que los médicos me han entregado esta hoja informativa, la cual he leído y he comprendido el significado del procedimiento y los riesgos inherentes al mismo, por lo cual, declaro estar debidamente informado por el personal de salud del Hospital General San Luis de la Paz.',
        fontSize: 6,
        lineHeight: 1.3,
        alignment: 'justify',
        margin: [0, 0, 0, 15],
      },

      // ACEPTO (simple como hospitalización)
      {
        text: 'ACEPTO',
        fontSize: 7,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 15],
      },

      // TIPO DE HEMODERIVADO (si está especificado)
      ...(consentimiento.tipo_hemoderivado ? [
        {
          text: `TIPO DE HEMODERIVADO AUTORIZADO: ${consentimiento.tipo_hemoderivado.toUpperCase()}`,
          fontSize: 6,
          bold: true,
          margin: [0, 0, 0, 8],
        },
      ] : []),

      // OBSERVACIONES (si existen, compactas)
      ...(consentimiento.observaciones ? [
        {
          text: `OBSERVACIONES: ${consentimiento.observaciones}`,
          fontSize: 6,
          margin: [0, 0, 0, 8],
          lineHeight: 1.2,
          italics: true,
        },
      ] : []),

      // FIRMAS COMPACTAS (mismo estilo hospitalización)
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: '\n\n\n_________________________________________\nNombre y firma del paciente, tutor o representante legal',
                fontSize: 6,
                alignment: 'center',
                margin: [0, 10, 0, 10],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 15],
      },

      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: '\n\n\n_________________________________________\nNombre, firma y sello del médico tratante',
                fontSize: 6,
                alignment: 'center',
                margin: [0, 10, 0, 10],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 15],
      },

      // TESTIGOS COMPACTOS
      {
        table: {
          widths: ['45%', '10%', '45%'],
          body: [
            [
              {
                text: '\n\n_____________________________\nTestigo (Nombre y Firma)',
                fontSize: 6,
                alignment: 'center',
                margin: [0, 8, 0, 8],
              },
              { text: '', fontSize: 6 },
              {
                text: '\n\n_____________________________\nTestigo (Nombre y Firma)',
                fontSize: 6,
                alignment: 'center',
                margin: [0, 8, 0, 8],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 10],
      },

      // LUGAR Y FECHA SIMPLE
      {
        text: `San Luis de la Paz, Guanajuato a ${fechaActual.getDate()} de ${fechaActual.toLocaleDateString('es-MX', { month: 'long' })} de ${fechaActual.getFullYear()}`,
        fontSize: 7,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 8],
      },

      // INFORMACIÓN NORMATIVA SIMPLE
      {
        columns: [
          {
            width: '50%',
            text: [
              {
                text: 'Marco Legal:\n',
                fontSize: 6,
                bold: true,
              },
              {
                text: '• NOM-004-SSA3-2012\n• NOM-253-SSA1-2012\n• Arts. 80-83 Ley General de Salud',
                fontSize: 6,
              },
            ],
            alignment: 'left',
          },
          {
            width: '50%',
            text: [
              {
                text: 'SICEG - Hospital General San Luis de la Paz\n',
                fontSize: 6,
                bold: true,
              },
              {
                text: `${fechaActual.toLocaleString('es-MX')} - Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
                fontSize: 6,
              },
            ],
            alignment: 'right',
          },
        ],
        margin: [0, 3, 0, 0],
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
                text: 'Consentimiento para Transfusión Sanguínea - SICEG\nNOM-004-SSA3-2012 | NOM-253-SSA1-2012',
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
                    text: `Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
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

async generarConsentimientoSegunTipo(datos: any): Promise<any> {
  const tipoConsentimiento = datos.consentimiento?.tipo_consentimiento || 'hospitalizacion';
  
  console.log(`📝 Generando consentimiento tipo: ${tipoConsentimiento}`);
  
  switch(tipoConsentimiento) {
    case 'hospitalizacion':
      return this.generarConsentimientoHospitalizacion(datos);
    
    case 'referencia':
      return this.generarConsentimientoReferencia(datos);
    
    case 'tratamiento_medico':
      return this.generarConsentimientoTratamientoMedico(datos);
    
    case 'cirugia_procedimientos':
      return this.generarConsentimientoCirugia(datos);

       case 'transfusion_sanguinea':
      return this.generarConsentimientoTransfusionSanguinea(datos);
    
    default:
      console.warn(`Tipo de consentimiento no reconocido: ${tipoConsentimiento}`);
      return this.generarConsentimientoHospitalizacion(datos);
  }
}











// MÉTODOS AUXILIARES
private formatearTipoProcedimiento(tipo: string): string {
  const tipos: { [key: string]: string } = {
    'quirurgico': 'Procedimiento Quirúrgico',
    'diagnostico': 'Procedimiento Diagnóstico',
    'terapeutico': 'Procedimiento Terapéutico'
  };
  return tipos[tipo] || tipo;
}

private generarFolioConsentimiento(): string {
  const fecha = new Date();
  const timestamp = fecha.getTime().toString().slice(-6);
  return `CI-${fecha.getFullYear()}-${timestamp}`;
}




  // async generarAltaVoluntaria(datos: any): Promise<any> {
  //   console.log('🚪 Generando Alta Voluntaria...');

  //   const { pacienteCompleto, medicoCompleto, altaVoluntaria } = datos;
  //   const fechaActual = new Date();

  //   return {
  //     pageSize: 'LETTER',
  //     pageMargins: [40, 80, 40, 60],

  //     header: (currentPage: number, pageCount: number) => {
  //       return {
  //         margin: [40, 20, 40, 20],
  //         table: {
  //           widths: ['30%', '40%', '30%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'HOSPITAL GENERAL', fontSize: 12, bold: true },
  //                   { text: 'SAN LUIS DE LA PAZ', fontSize: 8, bold: true },
  //                   { text: 'GUANAJUATO, MÉXICO', fontSize: 6 }
  //                 ]
  //               },
  //               {
  //                 stack: [
  //                   { text: '🚪 ALTA VOLUNTARIA', fontSize: 16, bold: true, alignment: 'center', color: '#dc2626' },
  //                   { text: 'EGRESO POR VOLUNTAD PROPIA', fontSize: 8, alignment: 'center', italics: true },
  //                   { text: 'NOM-004-SSA3-2012', fontSize: 6, alignment: 'center', color: '#666666' }
  //                 ]
  //               },
  //               {
  //                 stack: [
  //                   { text: 'FOLIO:', fontSize: 6, bold: true, alignment: 'right' },
  //                   { text: altaVoluntaria.folio_alta || this.generarFolioAlta(), fontSize: 8, alignment: 'right' },
  //                   { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}`, fontSize: 6, alignment: 'right', margin: [0, 2] },
  //                   { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 6, alignment: 'right' }
  //                 ]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: 'noBorders'
  //       };
  //     },

  //     content: [
  //       // DATOS DEL PACIENTE
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: '👤 DATOS DEL PACIENTE',
  //                 style: 'sectionHeader',
  //                 fillColor: '#fef2f2',
  //                 margin: [10, 8]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 10]
  //       },

  //       {
  //         table: {
  //           widths: ['25%', '25%', '25%', '25%'],
  //           body: [
  //             [
  //               { text: 'Nombre:', style: 'fieldLabel' },
  //               { text: pacienteCompleto.nombre_completo || 'N/A', style: 'fieldValue' },
  //               { text: 'Expediente:', style: 'fieldLabel' },
  //               { text: pacienteCompleto.numero_expediente || 'N/A', style: 'fieldValue' }
  //             ],
  //             [
  //               { text: 'Edad:', style: 'fieldLabel' },
  //               { text: `${pacienteCompleto.edad || 'N/A'} años`, style: 'fieldValue' },
  //               { text: 'Sexo:', style: 'fieldLabel' },
  //               { text: pacienteCompleto.sexo || 'N/A', style: 'fieldValue' }
  //             ],
  //             [
  //               { text: 'Cama:', style: 'fieldLabel' },
  //               { text: altaVoluntaria.numero_cama || 'N/A', style: 'fieldValue' },
  //               { text: 'Servicio:', style: 'fieldLabel' },
  //               { text: altaVoluntaria.servicio_medico || medicoCompleto.departamento || 'N/A', style: 'fieldValue' }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15]
  //       },

  //       // DECLARACIÓN DE ALTA VOLUNTARIA
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'DECLARACIÓN DE ALTA VOLUNTARIA', style: 'declarationTitle', alignment: 'center', margin: [0, 10, 0, 15] },

  //                   { text: 'Por medio de la presente, yo:', style: 'declarationText' },
  //                   { text: altaVoluntaria.nombre_responsable || pacienteCompleto.nombre_completo, style: 'responsableName', margin: [0, 5, 0, 10] },

  //                   {
  //                     text: [
  //                       { text: 'En mi calidad de: ', style: 'declarationText' },
  //                       { text: this.formatearParentesco(altaVoluntaria.parentesco_responsable), style: 'parentescoValue' },
  //                       { text: ', manifiesto mi decisión LIBRE y VOLUNTARIA de solicitar el alta médica, aún cuando no haya sido autorizada por el médico tratante.', style: 'declarationText' }
  //                     ], margin: [0, 0, 0, 15]
  //                   }
  //                 ],
  //                 margin: [10, 10]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15]
  //       },

  //       // INFORMACIÓN MÉDICA
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: '🏥 INFORMACIÓN MÉDICA ACTUAL',
  //                 style: 'sectionHeader',
  //                 fillColor: '#f0f9ff',
  //                 margin: [10, 8]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 10]
  //       },

  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'DIAGNÓSTICO ACTUAL:', style: 'fieldLabel' },
  //                   { text: altaVoluntaria.diagnostico_actual || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'ESTADO CLÍNICO ACTUAL:', style: 'fieldLabel' },
  //                   { text: altaVoluntaria.estado_clinico_actual || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'RESUMEN CLÍNICO:', style: 'fieldLabel' },
  //                   { text: altaVoluntaria.resumen_clinico || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 0] }
  //                 ],
  //                 margin: [10, 10]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15]
  //       },

  //       // TRATAMIENTO Y RECOMENDACIONES
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: '💊 TRATAMIENTO RECOMENDADO Y RIESGOS',
  //                 style: 'sectionHeader',
  //                 fillColor: '#fefce8',
  //                 margin: [10, 8]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 10]
  //       },

  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'TRATAMIENTO MÉDICO RECOMENDADO:', style: 'fieldLabel' },
  //                   { text: altaVoluntaria.tratamiento_recomendado || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'RIESGOS EXPLICADOS AL PACIENTE:', style: 'fieldLabel' },
  //                   { text: altaVoluntaria.riesgos_explicados || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'CONSECUENCIAS DE NO CONTINUAR TRATAMIENTO:', style: 'fieldLabel' },
  //                   { text: altaVoluntaria.consecuencias_informadas || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 0] }
  //                 ],
  //                 margin: [10, 10]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15]
  //       },

  //       // RECOMENDACIONES PARA EL ALTA
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: '📋 RECOMENDACIONES PARA EL EGRESO',
  //                 style: 'sectionHeader',
  //                 fillColor: '#f0fdf4',
  //                 margin: [10, 8]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 10]
  //       },

  //       {
  //         table: {
  //           widths: ['50%', '50%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'RECOMENDACIONES MÉDICAS:', style: 'fieldLabel' },
  //                   { text: altaVoluntaria.recomendaciones_medicas || 'Seguir indicaciones generales', style: 'fieldValue', margin: [0, 5, 0, 10] },

  //                   ...(altaVoluntaria.medicamentos_prescritos ? [
  //                     { text: 'MEDICAMENTOS:', style: 'fieldLabel' },
  //                     { text: altaVoluntaria.medicamentos_prescritos, style: 'fieldValue', margin: [0, 5, 0, 10] }
  //                   ] : []),

  //                   { text: 'CUÁNDO REGRESAR:', style: 'fieldLabel' },
  //                   { text: altaVoluntaria.cuando_regresar || 'Ante cualquier complicación', style: 'fieldValue' }
  //                 ]
  //               },
  //               {
  //                 stack: [
  //                   { text: 'CUIDADOS EN CASA:', style: 'fieldLabel' },
  //                   { text: altaVoluntaria.cuidados_domiciliarios || 'Reposo relativo y cuidados generales', style: 'fieldValue', margin: [0, 5, 0, 10] },

  //                   { text: 'SIGNOS DE ALARMA:', style: 'fieldLabel' },
  //                   { text: altaVoluntaria.signos_alarma || 'Fiebre, dolor intenso, sangrado', style: 'fieldValue', margin: [0, 5, 0, 10] },

  //                   ...(altaVoluntaria.cita_control ? [
  //                     { text: 'CITA DE CONTROL:', style: 'fieldLabel' },
  //                     { text: altaVoluntaria.cita_control, style: 'fieldValue' }
  //                   ] : [])
  //                 ]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15]
  //       },

  //       // MOTIVO DEL ALTA VOLUNTARIA
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'MOTIVO DEL ALTA VOLUNTARIA:', style: 'fieldLabel' },
  //                   { text: altaVoluntaria.motivo_alta_voluntaria || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'TIPO DE ALTA:', style: 'fieldLabel' },
  //                   { text: this.formatearTipoAlta(altaVoluntaria.tipo_alta), style: 'fieldValue', margin: [0, 5, 0, 0] }
  //                 ],
  //                 margin: [10, 10]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15]
  //       },

  //       // DECLARACIÓN DE RESPONSABILIDAD
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'DECLARACIÓN DE RESPONSABILIDAD', style: 'declarationTitle', alignment: 'center', margin: [0, 10, 0, 15] },

  //                   { text: 'DECLARO QUE:', style: 'fieldLabel', margin: [0, 0, 0, 10] },

  //                   { text: '• He sido informado(a) completamente sobre mi estado de salud actual', style: 'declarationList' },
  //                   { text: '• Conozco los riesgos de abandonar el tratamiento médico', style: 'declarationList' },
  //                   { text: '• Entiendo las consecuencias de esta decisión', style: 'declarationList' },
  //                   { text: '• Esta decisión es completamente voluntaria y libre', style: 'declarationList' },
  //                   { text: '• Eximo de toda responsabilidad al hospital y su personal médico', style: 'declarationList', margin: [0, 0, 0, 15] },

  //                   { text: 'Me hago completamente responsable de cualquier complicación o deterioro de mi salud derivado de esta decisión.', style: 'responsabilityText', alignment: 'center', margin: [0, 10, 0, 0] }
  //                 ],
  //                 margin: [10, 10]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 20]
  //       },

  //       // INFORMACIÓN DE CONTINUIDAD
  //       ...(altaVoluntaria.continua_tratamiento_externo ? [
  //         {
  //           table: {
  //             widths: ['50%', '50%'],
  //             body: [
  //               [
  //                 {
  //                   stack: [
  //                     { text: 'CONTINUIDAD DE TRATAMIENTO:', style: 'fieldLabel' },
  //                     { text: altaVoluntaria.continua_tratamiento_externo ? 'SÍ' : 'NO', style: 'fieldValue' }
  //                   ]
  //                 },
  //                 {
  //                   stack: [
  //                     { text: 'ESTABLECIMIENTO DESTINO:', style: 'fieldLabel' },
  //                     { text: altaVoluntaria.establecimiento_destino || 'No especificado', style: 'fieldValue' }
  //                   ]
  //                 }
  //               ]
  //             ]
  //           },
  //           layout: this.getTableLayout(),
  //           margin: [0, 0, 0, 20]
  //         }
  //       ] : []),

  //       // ESPACIADOR PARA FIRMAS
  //       { text: '', pageBreak: 'before' },

  //       // SECCIÓN DE FIRMAS
  //       {
  //         margin: [0, 40, 0, 0],
  //         table: {
  //           widths: ['50%', '50%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
  //                   { text: 'PACIENTE / RESPONSABLE', style: 'signatureLabel' },
  //                   { text: altaVoluntaria.nombre_responsable || pacienteCompleto.nombre_completo, style: 'signatureName' },
  //                   { text: `Parentesco: ${this.formatearParentesco(altaVoluntaria.parentesco_responsable)}`, style: 'signatureDetails' },
  //                   { text: `ID: ${altaVoluntaria.identificacion_responsable || 'No proporcionada'}`, style: 'signatureDetails' }
  //                 ]
  //               },
  //               {
  //                 stack: [
  //                   { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
  //                   { text: 'MÉDICO TRATANTE', style: 'signatureLabel' },
  //                   { text: medicoCompleto.nombre_completo || 'N/A', style: 'signatureName' },
  //                   { text: `Cédula: ${medicoCompleto.numero_cedula || 'N/A'}`, style: 'signatureDetails' },
  //                   { text: `Servicio: ${medicoCompleto.departamento || 'N/A'}`, style: 'signatureDetails' }
  //                 ]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: 'noBorders'
  //       },

  //       // TESTIGOS
  //       {
  //         margin: [0, 30, 0, 0],
  //         table: {
  //           widths: ['50%', '50%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
  //                   { text: 'TESTIGO 1', style: 'signatureLabel' },
  //                   { text: altaVoluntaria.testigo1_nombre || 'N/A', style: 'signatureName' },
  //                   { text: `ID: ${altaVoluntaria.testigo1_identificacion || 'N/A'}`, style: 'signatureDetails' }
  //                 ]
  //               },
  //               {
  //                 stack: [
  //                   { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
  //                   { text: 'TESTIGO 2', style: 'signatureLabel' },
  //                   { text: altaVoluntaria.testigo2_nombre || 'N/A', style: 'signatureName' },
  //                   { text: `ID: ${altaVoluntaria.testigo2_identificacion || 'N/A'}`, style: 'signatureDetails' }
  //                 ]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: 'noBorders'
  //       },

  //       // LUGAR Y FECHA
  //       {
  //         margin: [0, 30, 0, 0],
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: `San Luis de la Paz, Guanajuato a ${fechaActual.getDate()} de ${fechaActual.toLocaleDateString('es-MX', { month: 'long' })} de ${fechaActual.getFullYear()}`,
  //                 alignment: 'center',
  //                 style: 'fechaFirma'
  //               }
  //             ]
  //           ]
  //         },
  //         layout: 'noBorders'
  //       }
  //     ],

  //     footer: (currentPage: number, pageCount: number) => {
  //       return {
  //         margin: [40, 10],
  //         table: {
  //           widths: ['33%', '34%', '33%'],
  //           body: [
  //             [
  //               {
  //                 text: `Alta Voluntaria - Hospital General San Luis de la Paz`,
  //                 fontSize: 6,
  //                 color: '#666666'
  //               },
  //               {
  //                 text: `Página ${currentPage} de ${pageCount}`,
  //                 fontSize: 6,
  //                 alignment: 'center',
  //                 color: '#666666'
  //               },
  //               {
  //                 text: fechaActual.toLocaleString('es-MX'),
  //                 fontSize: 6,
  //                 alignment: 'right',
  //                 color: '#666666'
  //               }
  //             ]
  //           ]
  //         },
  //         layout: 'noBorders'
  //       };
  //     },

  //     styles: {
  //       sectionHeader: {
  //         fontSize: 12,
  //         bold: true,
  //         color: '#374151'
  //       },
  //       fieldLabel: {
  //         fontSize: 7,
  //         bold: true,
  //         color: '#4b5563'
  //       },
  //       fieldValue: {
  //         fontSize: 7,
  //         color: '#111827'
  //       },
  //       declarationTitle: {
  //         fontSize: 14,
  //         bold: true,
  //         color: '#dc2626'
  //       },
  //       declarationText: {
  //         fontSize: 8,
  //         color: '#111827'
  //       },
  //       responsableName: {
  //         fontSize: 12,
  //         bold: true,
  //         color: '#111827',
  //         decoration: 'underline'
  //       },
  //       parentescoValue: {
  //         fontSize: 8,
  //         bold: true,
  //         color: '#dc2626'
  //       },
  //       declarationList: {
  //         fontSize: 8,
  //         color: '#111827',
  //         margin: [0, 2, 0, 2]
  //       },
  //       responsabilityText: {
  //         fontSize: 11,
  //         bold: true,
  //         color: '#dc2626',
  //         italics: true
  //       },
  //       signatureLabel: {
  //         fontSize: 8,
  //         bold: true,
  //         alignment: 'center',
  //         color: '#374151'
  //       },
  //       signatureName: {
  //         fontSize: 7,
  //         alignment: 'center',
  //         color: '#111827'
  //       },
  //       signatureDetails: {
  //         fontSize: 6,
  //         alignment: 'center',
  //         color: '#6b7280'
  //       },
  //       fechaFirma: {
  //         fontSize: 8,
  //         color: '#111827'
  //       }
  //     }
  //   };
  // }


async generarAltaVoluntaria(datos: any): Promise<any> {
  console.log('🚪 Generando Alta Voluntaria - Estilo Profesional...');

  const { pacienteCompleto, medicoCompleto, altaVoluntaria } = datos;
  const fechaActual = new Date();
  
  // 🔥 OBTENER CONFIGURACIÓN INTELIGENTE DE LOGOS
  const configuracion = await this.obtenerConfiguracionLogosInteligente();

  return {
    pageSize: 'LETTER',
    pageMargins: [20, 60, 20, 40],

    header: {
      margin: [20, 10, 20, 10],
      table: {
        widths: ['20%', '60%', '20%'],
        body: [
          [
            {
              // Logo de gobierno (izquierda)
              image: await this.obtenerImagenBase64(
                datos.configuracion?.logo_gobierno ||
                configuracion.logo_gobierno
              ),
              fit: [80, 40],
              alignment: 'left',
              margin: [0, 5],
            },
            {
              // Texto central
              text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - ALTA VOLUNTARIA',
              fontSize: 8,
              bold: true,
              alignment: 'center',
              color: '#1a365d',
              margin: [0, 8],
            },
            {
              // Logo del hospital (derecha)
              image: await this.obtenerImagenBase64(
                datos.configuracion?.logo_principal ||
                configuracion.logo_principal
              ),
              fit: [80, 40],
              alignment: 'right',
              margin: [0, 5],
            },
          ],
        ],
      },
      layout: 'noBorders',
    },

    content: [
      // IDENTIFICACIÓN Y DATOS BÁSICOS
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'IDENTIFICACIÓN',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 3,
              },
              {
                table: {
                  widths: ['20%', '20%', '20%', '20%', '20%'],
                  body: [
                    [
                      { text: 'Fecha del alta', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Hora del alta', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'No. Expediente', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Folio', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Servicio', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: fechaActual.toLocaleDateString('es-MX'), fontSize: 7, alignment: 'center' },
                      { text: fechaActual.toLocaleTimeString('es-MX'), fontSize: 7, alignment: 'center' },
                      { text: this.obtenerNumeroExpedienteInteligente(pacienteCompleto) || 'N/A', fontSize: 7, alignment: 'center', bold: true },
                      { text: altaVoluntaria.folio_alta || this.generarFolioAlta(), fontSize: 7, alignment: 'center', bold: true, color: '#dc2626' },
                      { text: altaVoluntaria.servicio_medico || medicoCompleto.departamento || 'N/A', fontSize: 7, alignment: 'center' },
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
                  widths: ['55%', '15%', '15%', '15%'],
                  body: [
                    [
                      { text: 'Nombre completo del paciente', fontSize: 7, bold: true },
                      { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Tipo de sangre', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: pacienteCompleto.nombre_completo, fontSize: 6, bold: true, margin: [2, 3] },
                      { text: `${pacienteCompleto.edad} años`, fontSize: 7, alignment: 'center' },
                      { text: pacienteCompleto.sexo, fontSize: 7, alignment: 'center' },
                      { text: pacienteCompleto.tipo_sangre || 'No especificado', fontSize: 7, alignment: 'center', bold: true, color: '#dc2626' },
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
                      { text: 'Médico tratante', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Cédula profesional', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Cama/Habitación', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: medicoCompleto.nombre_completo || 'No especificado', fontSize: 7, alignment: 'center' },
                      { text: medicoCompleto.numero_cedula || 'No registrada', fontSize: 7, alignment: 'center' },
                      { text: altaVoluntaria.numero_cama || 'N/A', fontSize: 7, alignment: 'center' },
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

      { text: '', margin: [0, 2] },

      // DECLARACIÓN DE ALTA VOLUNTARIA
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'DECLARACIÓN',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 4,
              },
              {
                text: 'DECLARACIÓN DE ALTA VOLUNTARIA',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: [
                  { text: 'Por medio de la presente, yo: ', fontSize: 7 },
                  { text: altaVoluntaria.nombre_responsable || pacienteCompleto.nombre_completo, fontSize: 6, bold: true, decoration: 'underline' },
                  { text: `, en mi calidad de `, fontSize: 7 },
                  { text: this.formatearParentesco(altaVoluntaria.parentesco_responsable), fontSize: 7, bold: true, color: '#dc2626' },
                  { text: ', manifiesto mi decisión LIBRE y VOLUNTARIA de solicitar el alta médica, aún cuando no haya sido autorizada por el médico tratante.', fontSize: 7 }
                ],
                margin: [5, 8],
                lineHeight: 1.3,
              },
            ],
            [
              {},
              {
                text: 'MOTIVO DEL ALTA VOLUNTARIA',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: [
                  { text: 'Tipo de alta: ', fontSize: 7, bold: true },
                  { text: this.formatearTipoAlta(altaVoluntaria.tipo_alta), fontSize: 7 },
                  { text: '\n\nMotivo específico: ', fontSize: 7, bold: true },
                  { text: altaVoluntaria.motivo_alta_voluntaria || 'No especificado', fontSize: 7 }
                ],
                margin: [5, 8],
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

      { text: '', margin: [0, 2] },

      // INFORMACIÓN MÉDICA ACTUAL
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'INFORMACIÓN MÉDICA',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 6,
              },
              {
                text: 'DIAGNÓSTICO ACTUAL',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: altaVoluntaria.diagnostico_actual || 'No especificado',
                fontSize: 7,
                margin: [5, 8],
                lineHeight: 1.3,
              },
            ],
            [
              {},
              {
                text: 'ESTADO CLÍNICO ACTUAL',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: altaVoluntaria.estado_clinico_actual || 'No especificado',
                fontSize: 7,
                margin: [5, 8],
                lineHeight: 1.3,
              },
            ],
            [
              {},
              {
                text: 'RESUMEN CLÍNICO',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: altaVoluntaria.resumen_clinico || 'No especificado',
                fontSize: 7,
                margin: [5, 8],
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

      { text: '', margin: [0, 2] },

      // TRATAMIENTO Y RIESGOS
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'TRATAMIENTO Y RIESGOS',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 6,
              },
              {
                text: 'TRATAMIENTO MÉDICO RECOMENDADO',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: altaVoluntaria.tratamiento_recomendado || 'No especificado',
                fontSize: 7,
                margin: [5, 8],
                lineHeight: 1.3,
              },
            ],
            [
              {},
              {
                text: 'RIESGOS EXPLICADOS AL PACIENTE',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: altaVoluntaria.riesgos_explicados || 'No especificado',
                fontSize: 7,
                margin: [5, 8],
                lineHeight: 1.3,
              },
            ],
            [
              {},
              {
                text: 'CONSECUENCIAS DE NO CONTINUAR TRATAMIENTO',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: altaVoluntaria.consecuencias_informadas || 'No especificado',
                fontSize: 7,
                margin: [5, 8],
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

      { text: '', margin: [0, 2] },

      // RECOMENDACIONES PARA EL EGRESO
      {
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: 'RECOMENDACIONES',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                rowSpan: 4,
              },
              {
                table: {
                  widths: ['50%', '50%'],
                  body: [
                    [
                      { text: 'Recomendaciones médicas', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Cuidados en casa', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: altaVoluntaria.recomendaciones_medicas || 'Seguir indicaciones generales', fontSize: 7, margin: [3, 5], lineHeight: 1.2 },
                      { text: altaVoluntaria.cuidados_domiciliarios || 'Reposo relativo y cuidados generales', fontSize: 7, margin: [3, 5], lineHeight: 1.2 },
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
                      { text: 'Signos de alarma', fontSize: 7, bold: true, alignment: 'center' },
                      { text: 'Cuándo regresar', fontSize: 7, bold: true, alignment: 'center' },
                    ],
                    [
                      { text: altaVoluntaria.signos_alarma || 'Fiebre, dolor intenso, sangrado', fontSize: 7, margin: [3, 5], lineHeight: 1.2 },
                      { text: altaVoluntaria.cuando_regresar || 'Ante cualquier complicación', fontSize: 7, margin: [3, 5], lineHeight: 1.2 },
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
                text: 'MEDICAMENTOS PRESCRITOS',
                fontSize: 7,
                bold: true,
                fillColor: '#fafafa',
              },
            ],
            [
              {},
              {
                text: altaVoluntaria.medicamentos_prescritos || 'No se prescriben medicamentos específicos',
                fontSize: 7,
                margin: [5, 8],
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

      { text: '', margin: [0, 2] },

      // DECLARACIÓN DE RESPONSABILIDAD
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'DECLARACIÓN DE RESPONSABILIDAD',
                fontSize: 6,
                bold: true,
                fillColor: '#f8f8f8',
                margin: [10, 8],
                alignment: 'center',
              },
            ],
            [
              {
                text: [
                  { text: 'DECLARO QUE:\n\n', fontSize: 7, bold: true },
                  { text: '• He sido informado(a) completamente sobre mi estado de salud actual\n', fontSize: 7 },
                  { text: '• Conozco los riesgos de abandonar el tratamiento médico\n', fontSize: 7 },
                  { text: '• Entiendo las consecuencias de esta decisión\n', fontSize: 7 },
                  { text: '• Esta decisión es completamente voluntaria y libre\n', fontSize: 7 },
                  { text: '• Eximo de toda responsabilidad al hospital y su personal médico\n\n', fontSize: 7 },
                  { text: 'Me hago completamente responsable de cualquier complicación o deterioro de mi salud derivado de esta decisión.', fontSize: 6, bold: true, color: '#dc2626', italics: true }
                ],
                margin: [10, 10],
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

      // INFORMACIÓN DE CONTINUIDAD (si aplica)
      ...(altaVoluntaria.continua_tratamiento_externo ? [
        { text: '', margin: [0, 2] },
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: `CONTINUIDAD DE TRATAMIENTO: ${altaVoluntaria.continua_tratamiento_externo ? 'SÍ' : 'NO'} - Establecimiento destino: ${altaVoluntaria.establecimiento_destino || 'No especificado'}`,
                  fontSize: 6,
                  bold: true,
                  fillColor: '#f0fdf4',
                  margin: [10, 8],
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
      ] : []),

      { text: '', margin: [0, 10] },

      // FIRMA MÉDICA Y RESPONSABLE
      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              {
                text: 'PACIENTE / RESPONSABLE',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
              {
                text: 'MÉDICO TRATANTE',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
            ],
            [
              {
                text: [
                  {
                    text: `${altaVoluntaria.nombre_responsable || pacienteCompleto.nombre_completo}\n`,
                    fontSize: 7,
                    bold: true,
                  },
                  {
                    text: `Parentesco: ${this.formatearParentesco(altaVoluntaria.parentesco_responsable)}\n`,
                    fontSize: 6,
                  },
                  {
                    text: `ID: ${altaVoluntaria.identificacion_responsable || 'No proporcionada'}\n`,
                    fontSize: 6,
                  },
                  {
                    text: `\n\n_________________________\n`,
                    fontSize: 6,
                  },
                  {
                    text: `FIRMA DEL RESPONSABLE\n`,
                    fontSize: 7,
                    bold: true,
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
                margin: [5, 20],
                alignment: 'center',
              },
              {
                text: [
                  {
                    text: `${medicoCompleto.titulo_profesional || 'Dr.'} ${medicoCompleto.nombre_completo}\n`,
                    fontSize: 7,
                    bold: true,
                  },
                  {
                    text: `Cédula Profesional: ${medicoCompleto.numero_cedula || 'No registrada'}\n`,
                    fontSize: 6,
                  },
                  {
                    text: `Especialidad: ${medicoCompleto.especialidad || 'N/A'}\n`,
                    fontSize: 6,
                  },
                  {
                    text: `${medicoCompleto.cargo || 'Médico'} - ${medicoCompleto.departamento || 'N/A'}\n`,
                    fontSize: 6,
                  },
                  {
                    text: `\n_________________________\n`,
                    fontSize: 6,
                  },
                  {
                    text: `FIRMA DEL MÉDICO\n`,
                    fontSize: 7,
                    bold: true,
                  },
                  {
                    text: `(NOM-004-SSA3-2012)`,
                    fontSize: 6,
                    italics: true,
                  },
                ],
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

      // TESTIGOS
      {
        margin: [0, 10, 0, 0],
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              {
                text: 'TESTIGO 1',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
              {
                text: 'TESTIGO 2',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
            ],
            [
              {
                text: [
                  {
                    text: `${altaVoluntaria.testigo1_nombre || 'N/A'}\n`,
                    fontSize: 7,
                    bold: true,
                  },
                  {
                    text: `ID: ${altaVoluntaria.testigo1_identificacion || 'N/A'}\n`,
                    fontSize: 6,
                  },
                  {
                    text: `\n\n_________________________\n`,
                    fontSize: 6,
                  },
                  {
                    text: `FIRMA TESTIGO 1`,
                    fontSize: 7,
                    bold: true,
                  },
                ],
                margin: [5, 20],
                alignment: 'center',
              },
              {
                text: [
                  {
                    text: `${altaVoluntaria.testigo2_nombre || 'N/A'}\n`,
                    fontSize: 7,
                    bold: true,
                  },
                  {
                    text: `ID: ${altaVoluntaria.testigo2_identificacion || 'N/A'}\n`,
                    fontSize: 6,
                  },
                  {
                    text: `\n\n_________________________\n`,
                    fontSize: 6,
                  },
                  {
                    text: `FIRMA TESTIGO 2`,
                    fontSize: 7,
                    bold: true,
                  },
                ],
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

      // LUGAR Y FECHA
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: `San Luis de la Paz, Guanajuato a ${fechaActual.getDate()} de ${fechaActual.toLocaleDateString('es-MX', { month: 'long' })} de ${fechaActual.getFullYear()}`,
                fontSize: 8,
                bold: true,
                alignment: 'center',
                margin: [10, 8],
                color: '#111827',
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

      // NOTAS AL PIE
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
                text: '• Derecho del paciente a decidir sobre su atención\n',
                fontSize: 6,
                color: '#666666',
              },
              {
                text: '• Egreso voluntario contra opinión médica',
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
                text: `Documento generado: ${fechaActual.toLocaleString('es-MX')}\n`,
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
                text: 'Alta Voluntaria - SICEG\nNOM-004-SSA3-2012 • Egreso por Voluntad Propia',
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
                    text: `Exp: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`,
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





 async generarNotaPreanestesica(datos: any): Promise<any> {
  console.log('📄 Generando Nota Preanestésica según NOM-004...');
  
  // 🔥 CORRECCIÓN: Adaptar estructura de datos
  const pacienteData = datos.paciente || datos.pacienteCompleto;
  const medicoData = datos.medico || datos.medicoCompleto;
  const notaData = datos.notaPreanestesica || {};
  
  // 🔥 ADAPTAR DATOS DEL PACIENTE
  const pacienteAdaptado = {
    nombre_completo: pacienteData.nombre_completo || 
                    `${pacienteData.nombre || ''} ${pacienteData.apellido_paterno || ''} ${pacienteData.apellido_materno || ''}`.trim(),
    edad: pacienteData.edad,
    sexo: pacienteData.sexo,
    expediente: pacienteData.expediente || { numero_expediente: 'Sin asignar' },
    fecha_nacimiento: pacienteData.fecha_nacimiento
  };

  // 🔥 ADAPTAR DATOS DEL MÉDICO
  const medicoAdaptado = {
    nombre_completo: medicoData.nombre_completo || 
                    `${medicoData.nombre || ''} ${medicoData.apellido_paterno || ''}`.trim(),
    numero_cedula: medicoData.numero_cedula || medicoData.cedula_anestesiologo || 'No registrada',
    especialidad: medicoData.especialidad || 'Anestesiología'
  };

  return {
    pageSize: 'LETTER',
    pageMargins: [20, 60, 20, 40],
    
    // 🔥 HEADER PROFESIONAL SIN COLORES
    header: {
      margin: [20, 10, 20, 10],
      table: {
        widths: ['20%', '60%', '20%'],
        body: [[
          {
            image: await this.obtenerImagenBase64(
              datos.configuracion?.logo_gobierno || 
              '/uploads/logos/logo-gobierno-importado.png'
            ),
            fit: [60, 35],
            alignment: 'left',
            margin: [0, 5],
          },
          {
            text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ\nNOTA PREANESTÉSICA\nNOM-004-SSA3-2012',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            margin: [0, 8],
          },
          {
            image: await this.obtenerImagenBase64(
              datos.configuracion?.logo_principal || 
              '/uploads/logos/logo-principal-importado.png'
            ),
            fit: [60, 35],
            alignment: 'right',
            margin: [0, 5],
          },
        ]],
      },
      layout: 'noBorders',
    },

    content: [
      // 🔥 DATOS DEL PACIENTE - ESTILO LIMPIO
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'DATOS DEL PACIENTE', style: 'sectionHeader', colSpan: 3, alignment: 'center' },
              {},
              {}
            ],
            [
              { text: `Paciente: ${pacienteAdaptado.nombre_completo}`, style: 'tableText' },
              { text: `Expediente: ${pacienteAdaptado.expediente.numero_expediente}`, style: 'tableText' },
              { text: `Fecha: ${new Date(notaData.fecha_evaluacion || Date.now()).toLocaleDateString('es-MX')}`, style: 'tableText' }
            ],
            [
              { text: `Edad: ${pacienteAdaptado.edad} años`, style: 'tableText' },
              { text: `Sexo: ${pacienteAdaptado.sexo}`, style: 'tableText' },
              { text: `Hora: ${notaData.hora_evaluacion || 'No registrada'}`, style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // 🔥 SIGNOS VITALES - ESTILO PROFESIONAL
      { text: 'SIGNOS VITALES PREOPERATORIOS', style: 'sectionHeader' },
      {
        table: {
          widths: ['*', '*', '*', '*'],
          body: [
            [
              { text: `Peso: ${notaData.peso || '--'} kg`, style: 'tableText' },
              { text: `Talla: ${notaData.talla || '--'} cm`, style: 'tableText' },
              { text: `IMC: ${notaData.imc_calculado || '--'}`, style: 'tableText' },
              { text: `T/A: ${notaData.tension_arterial || '--'}`, style: 'tableText' }
            ],
            [
              { text: `FC: ${notaData.frecuencia_cardiaca || '--'} lpm`, style: 'tableText' },
              { text: `FR: ${notaData.frecuencia_respiratoria || '--'} rpm`, style: 'tableText' },
              { text: `Temp: ${notaData.temperatura || '--'}°C`, style: 'tableText' },
              { text: `SatO2: ${notaData.saturacion_oxigeno || '--'}%`, style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // 🔥 EVALUACIÓN CLÍNICA
      { text: 'EVALUACIÓN CLÍNICA DEL PACIENTE', style: 'sectionHeader' },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [{ text: 'Estado General:', style: 'boldText' }, { text: notaData.estado_general || 'No evaluado', style: 'tableText' }],
            [{ text: 'Estado de Ayuno:', style: 'boldText' }, { text: notaData.estado_ayuno || 'No registrado', style: 'tableText' }],
            [{ text: 'Vía Aérea:', style: 'boldText' }, { text: notaData.via_aerea || 'No evaluada', style: 'tableText' }],
            [{ text: 'Sistema Cardiovascular:', style: 'boldText' }, { text: notaData.sistema_cardiovascular || 'Sin alteraciones', style: 'tableText' }],
            [{ text: 'Sistema Respiratorio:', style: 'boldText' }, { text: notaData.sistema_respiratorio || 'Sin alteraciones', style: 'tableText' }],
            [{ text: 'Sistema Nervioso:', style: 'boldText' }, { text: notaData.sistema_nervioso || 'Sin alteraciones', style: 'tableText' }]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // 🔥 CLASIFICACIÓN ASA
      { text: 'CLASIFICACIÓN ASA Y RIESGO ANESTÉSICO', style: 'sectionHeader' },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: `Clasificación ASA: ${notaData.asa || 'No clasificado'}`, style: 'boldText' },
              { text: `Riesgo Anestésico: ${notaData.riesgo_anestesico || 'No evaluado'}`, style: 'boldText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 10]
      },

      // 🔥 TIPO DE ANESTESIA
      { text: 'TIPO DE ANESTESIA PROPUESTO', style: 'sectionHeader' },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [{ text: 'Tipo de Anestesia:', style: 'boldText' }, { text: notaData.tipo_anestesia || 'No especificado', style: 'tableText' }],
            [{ text: 'Técnica Anestésica:', style: 'boldText' }, { text: notaData.tecnica_anestesica || 'Estándar', style: 'tableText' }]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // 🔥 PLAN ANESTÉSICO
      { text: 'PLAN ANESTÉSICO', style: 'sectionHeader' },
      {
        text: notaData.plan_anestesia || 'Plan anestésico estándar según procedimiento.',
        style: 'tableText',
        margin: [0, 0, 0, 15]
      },

      // 🔥 ANTECEDENTES
      { text: 'ANTECEDENTES ANESTÉSICOS Y MEDICAMENTOS', style: 'sectionHeader' },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [{ text: 'Anestesias Previas:', style: 'boldText' }, { text: notaData.anestesias_previas ? 'Sí' : 'No', style: 'tableText' }],
            [{ text: 'Alergias Medicamentos:', style: 'boldText' }, { text: notaData.alergias_medicamentos || 'Sin alergias conocidas', style: 'tableText' }],
            [{ text: 'Medicamentos Actuales:', style: 'boldText' }, { text: notaData.medicamentos_actuales || 'Ninguno', style: 'tableText' }]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // 🔥 CONSENTIMIENTO INFORMADO
      {
        table: {
          widths: ['*'],
          body: [[
            {
              text: [
                { text: 'CONSENTIMIENTO INFORMADO: ', style: 'boldText' },
                { text: notaData.consentimiento_informado ? 
                  'El paciente ha sido informado sobre los riesgos anestésicos y ha otorgado su consentimiento.' :
                  'PENDIENTE - Debe obtenerse antes del procedimiento.',
                  style: 'tableText'
                }
              ]
            }
          ]]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 30]
      },

      // 🔥 FIRMA DEL ANESTESIÓLOGO
      {
        table: {
          widths: ['*', '*'],
          body: [[
            { 
              text: [
                '\n\n\n',
                '_'.repeat(40),
                '\n',
                { text: notaData.medico_anestesiologo || medicoAdaptado.nombre_completo || 'Dr(a). [Nombre]', style: 'boldText' },
                '\n',
                'Médico Anestesiólogo',
                '\n',
                `Cédula: ${notaData.cedula_anestesiologo || medicoAdaptado.numero_cedula}`
              ],
              alignment: 'center'
            },
            {
              text: [
                '\n\n\n',
                '_'.repeat(40),
                '\n',
                { text: 'FECHA Y HORA', style: 'boldText' },
                '\n',
                `${new Date().toLocaleDateString('es-MX')} ${notaData.hora_evaluacion || new Date().toLocaleTimeString('es-MX')}`
              ],
              alignment: 'center'
            }
          ]]
        },
        layout: 'noBorders'
      }
    ],

    // 🔥 ESTILOS PROFESIONALES - SIN COLORES
    styles: {
      sectionHeader: { 
        fontSize: 8, 
        bold: true, 
        margin: [0, 10, 0, 5], 
        fillColor: '#f5f5f5' 
      },
      boldText: { 
        fontSize: 7, 
        bold: true 
      },
      tableText: { 
        fontSize: 7 
      }
    }
  };
}
// C:\Proyectos\CICEG-HG_Frontend\src\app\services\PDF\PdfTemplatesService.ts
async generarNotaPreoperatoria(datos: any): Promise<any> {
  console.log('⚕️ Generando Nota Preoperatoria...');

  const { pacienteCompleto, medicoCompleto, notaPreoperatoria } = datos;
  const fechaActual = new Date();

  return {
    pageSize: 'LETTER',
    pageMargins: [20, 60, 20, 40],

    // 🔥 HEADER PROFESIONAL IGUAL QUE OTROS DOCUMENTOS
    header: {
      margin: [20, 10, 20, 10],
      table: {
        widths: ['20%', '60%', '20%'],
        body: [[
          {
            image: await this.obtenerImagenBase64(
              datos.configuracion?.logo_gobierno || 
              '/uploads/logos/logo-gobierno-importado.png'
            ),
            fit: [80, 40],
            alignment: 'left',
            margin: [0, 5],
          },
          {
            text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ\nNOTA PREOPERATORIA\nNOM-004-SSA3-2012',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            margin: [0, 8],
          },
          {
            image: await this.obtenerImagenBase64(
              datos.configuracion?.logo_principal || 
              '/uploads/logos/logo-principal-importado.png'
            ),
            fit: [80, 40],
            alignment: 'right',
            margin: [0, 5],
          },
        ]],
      },
      layout: 'noBorders',
    },

    content: [
      // INFORMACIÓN DEL FOLIO Y FECHA
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: '', border: [false, false, false, false] },
              { 
                text: `FOLIO: ${notaPreoperatoria.folio_preoperatorio || this.generarFolioPreoperatorio()}`, 
                style: 'folioText',
                alignment: 'center',
                border: [false, false, false, false]
              },
              { 
                text: `FECHA: ${fechaActual.toLocaleDateString('es-MX')}\nHORA: ${fechaActual.toLocaleTimeString('es-MX')}`, 
                style: 'dateText',
                alignment: 'right',
                border: [false, false, false, false]
              }
            ]
          ]
        },
        margin: [0, 0, 0, 15]
      },

      // DATOS DEL PACIENTE - ESTILO LIMPIO
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'DATOS DEL PACIENTE', style: 'sectionHeader', colSpan: 3, alignment: 'center', fillColor: '#f5f5f5' },
              {},
              {}
            ],
            [
              { text: `Paciente: ${pacienteCompleto.nombre_completo}`, style: 'tableText' },
              { text: `Expediente: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`, style: 'tableText' },
              { text: `Fecha de Cirugía: ${this.formatearFecha(notaPreoperatoria.fecha_cirugia)}`, style: 'tableText' }
            ],
            [
              { text: `Edad: ${pacienteCompleto.edad} años`, style: 'tableText' },
              { text: `Sexo: ${pacienteCompleto.sexo}`, style: 'tableText' },
              { text: `Cama: ${notaPreoperatoria.numero_cama || 'No asignada'}`, style: 'tableText' }
            ],
            [
              { text: `CURP: ${pacienteCompleto.curp || 'No registrado'}`, style: 'tableText' },
              { text: `Fecha Nac.: ${this.formatearFecha(pacienteCompleto.fecha_nacimiento)}`, style: 'tableText' },
              { text: `Tipo sangre: ${pacienteCompleto.tipo_sangre || 'No especificado'}`, style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // INFORMACIÓN QUIRÚRGICA PROGRAMADA
      {
        text: 'INFORMACIÓN QUIRÚRGICA PROGRAMADA',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: `Tipo de Cirugía: ${notaPreoperatoria.tipo_cirugia || 'No especificado'}`, style: 'tableText' },
              { text: `Riesgo Quirúrgico: ${notaPreoperatoria.riesgo_quirurgico || 'No evaluado'}`, style: 'tableText' },
              { text: `Fecha Programada: ${this.formatearFecha(notaPreoperatoria.fecha_cirugia)}`, style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // RESUMEN DEL INTERROGATORIO (NOM-004 D8.5)
      {
        text: 'RESUMEN DEL INTERROGATORIO (NOM-004 D8.5)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: notaPreoperatoria.resumen_interrogatorio || 'Sin información registrada', 
                style: 'tableText',
                margin: [8, 8, 8, 8]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // EXPLORACIÓN FÍSICA (NOM-004 D8.6)
      {
        text: 'EXPLORACIÓN FÍSICA (NOM-004 D8.6)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: notaPreoperatoria.exploracion_fisica || 'Sin información registrada', 
                style: 'tableText',
                margin: [8, 8, 8, 8]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // RESULTADOS DE ESTUDIOS (NOM-004 D8.7)
      {
        text: 'RESULTADOS DE ESTUDIOS AUXILIARES DE DIAGNÓSTICO (NOM-004 D8.7)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: notaPreoperatoria.resultados_estudios || 'Sin estudios registrados', 
                style: 'tableText',
                margin: [8, 8, 8, 8]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // DIAGNÓSTICO PREOPERATORIO (NOM-004 D8.8 & D8.13)
{
  text: 'DIAGNÓSTICO PREOPERATORIO (NOM-004 D8.8 & D8.13)',
  style: 'sectionHeader',
  fillColor: '#f5f5f5',
  margin: [0, 0, 0, 5]
},
{
  table: {
    widths: ['100%'],
    body: [
      [
        { 
          text: [
            {
              text: notaPreoperatoria.diagnostico_preoperatorio || 'No especificado',
              style: 'boldText',
            },
            // 🔥 AGREGAR CIE-10 PARA NOTA PREOPERATORIA
            notaPreoperatoria.codigo_cie10_preoperatorio ? {
              text: `\n\nCódigo CIE-10: ${notaPreoperatoria.codigo_cie10_preoperatorio}`,
              fontSize: 7,
              bold: true,
              color: '#d97706',
              italics: true,
            } : {}
          ],
          margin: [8, 8, 8, 8]
        }
      ]
    ]
  },
  layout: 'lightHorizontalLines',
  margin: [0, 0, 0, 15]
},

      // GUÍAS CLÍNICAS DE DIAGNÓSTICO
      ...(notaPreoperatoria.guias_clinicas && notaPreoperatoria.guias_clinicas.length > 0 ? [
        {
          text: 'GUÍAS CLÍNICAS DE DIAGNÓSTICO',
          style: 'sectionHeader',
          fillColor: '#f5f5f5',
          margin: [0, 0, 0, 5]
        },
        {
          table: {
            widths: ['100%'],
            body: [
              [
                { 
                  text: this.construirTextoGuiasClinicas(notaPreoperatoria.guias_clinicas),
                  style: 'tableText',
                  margin: [8, 8, 8, 8]
                }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        }
      ] : []),

      // PLAN QUIRÚRGICO (NOM-004 D8.14)
      {
        text: 'PLAN QUIRÚRGICO (NOM-004 D8.14)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: notaPreoperatoria.plan_quirurgico || 'No especificado', 
                style: 'tableText',
                margin: [8, 8, 8, 8]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // RIESGO QUIRÚRGICO (NOM-004 D8.15)
      {
        text: 'EVALUACIÓN DE RIESGO QUIRÚRGICO (NOM-004 D8.15)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: `Clasificación ASA: ${notaPreoperatoria.riesgo_quirurgico || 'No evaluado'}`, style: 'boldText' },
              { text: `Tipo de Cirugía: ${notaPreoperatoria.tipo_cirugia || 'No especificado'}`, style: 'boldText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // PLAN TERAPÉUTICO PREOPERATORIO (NOM-004 D8.16)
      {
        text: 'PLAN TERAPÉUTICO PREOPERATORIO (NOM-004 D8.16)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: notaPreoperatoria.plan_terapeutico_preoperatorio || 'Plan estándar preoperatorio', 
                style: 'tableText',
                margin: [8, 8, 8, 8]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // PRONÓSTICO (NOM-004 D8.10)
      {
        text: 'PRONÓSTICO (NOM-004 D8.10)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: notaPreoperatoria.pronostico || 'No especificado', 
                style: 'tableText',
                margin: [8, 8, 8, 8]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // AUTORIZACIÓN Y PREPARACIÓN
      {
        text: 'AUTORIZACIÓN Y PREPARACIÓN QUIRÚRGICA',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: 'Consentimiento Informado: FIRMADO', style: 'tableText' },
              { text: 'Evaluación Preanestésica: PENDIENTE', style: 'tableText' }
            ],
            [
              { text: 'Laboratorios Preoperatorios: COMPLETOS', style: 'tableText' },
              { text: 'Interconsultas: SEGÚN NECESIDAD', style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20]
      },

      // CONCLUSIÓN
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'CONCLUSIÓN: PACIENTE APTO PARA PROCEDIMIENTO QUIRÚRGICO PROGRAMADO',
                style: 'conclusionText',
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [8, 12, 8, 12]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 30]
      },

      // FIRMAS PROFESIONALES
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              {
                text: 'NOMBRE COMPLETO, CÉDULA PROFESIONAL Y FIRMA',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
              {
                text: 'FIRMA AUTÓGRAFA',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
            ],
            [
              {
                text: [
                  { text: `${medicoCompleto.nombre_completo || 'Dr(a). [Nombre]'}\n`, fontSize: 7, bold: true },
                  { text: `Médico Cirujano Evaluador\n`, fontSize: 6 },
                  { text: `Cédula Profesional: ${medicoCompleto.numero_cedula || 'No registrada'}\n`, fontSize: 6 },
                  { text: `Especialidad: ${medicoCompleto.especialidad || 'No especificada'}\n`, fontSize: 6 },
                  { text: `Hospital General San Luis de la Paz\n`, fontSize: 7, color: '#6b7280' },
                  { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}\n`, fontSize: 7 },
                  { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 7 },
                ],
                margin: [5, 20],
                alignment: 'center',
              },
              {
                text: '\n\n\n\n_________________________\nFIRMA DEL MÉDICO\n(Según NOM-004-SSA3-2012)',
                fontSize: 6,
                margin: [5, 20],
                alignment: 'center',
              },
            ],
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20]
      },

      // PIE DE PÁGINA INFORMATIVO
      {
        columns: [
          {
            width: '50%',
            text: [
              { text: '* Documento elaborado conforme a:\n', fontSize: 7, italics: true, color: '#666666' },
              { text: '• NOM-004-SSA3-2012 Del expediente clínico\n', fontSize: 7, color: '#666666' },
              { text: '• Guías de práctica clínica quirúrgica\n', fontSize: 7, color: '#666666' },
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
      }
    ],

    footer: (currentPage: number, pageCount: number) => ({
      margin: [20, 10],
      table: {
        widths: ['33%', '34%', '33%'],
        body: [
          [
            { 
              text: `Nota Preoperatoria - ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`, 
              fontSize: 7, 
              color: '#666666' 
            },
            { 
              text: `Página ${currentPage} de ${pageCount}`, 
              fontSize: 7, 
              alignment: 'center', 
              color: '#666666' 
            },
            { 
              text: fechaActual.toLocaleDateString('es-MX'), 
              fontSize: 7, 
              alignment: 'right', 
              color: '#666666' 
            },
          ],
        ],
      },
      layout: 'noBorders',
    }),

    // 🔥 ESTILOS PROFESIONALES - SIN COLORES
    styles: {
      sectionHeader: { 
        fontSize: 8, 
        bold: true, 
        margin: [0, 10, 0, 5],
        fillColor: '#f5f5f5'
      },
      boldText: { 
        fontSize: 7, 
        bold: true 
      },
      tableText: { 
        fontSize: 7 
      },
      folioText: {
        fontSize: 8,
        bold: true
      },
      dateText: {
        fontSize: 7
      },
      conclusionText: {
        fontSize: 11,
        bold: true
      }
    }
  };
}

  async generarNotaPostanestesica(datos: any): Promise<any> {
    console.log('📄 Generando Nota Postanestésica según NOM-004...');
    
    // 🔥 ADAPTAR ESTRUCTURA DE DATOS
    const pacienteData = datos.paciente || datos.pacienteCompleto;
    const medicoData = datos.medico || datos.medicoCompleto;
    const notaData = datos.notaPostanestesica || {};
    
    const pacienteAdaptado = {
      nombre_completo: pacienteData.nombre_completo || 
                      `${pacienteData.nombre || ''} ${pacienteData.apellido_paterno || ''} ${pacienteData.apellido_materno || ''}`.trim(),
      edad: pacienteData.edad,
      sexo: pacienteData.sexo,
      expediente: pacienteData.expediente || { numero_expediente: 'Sin asignar' }
    };

    const medicoAdaptado = {
      nombre_completo: medicoData.nombre_completo || 
                      `${medicoData.nombre || ''} ${medicoData.apellido_paterno || ''}`.trim(),
      numero_cedula: medicoData.numero_cedula || notaData.cedula_anestesiologo || 'No registrada',
      especialidad: medicoData.especialidad || 'Anestesiología'
    };

    return {
      pageSize: 'LETTER',
      pageMargins: [20, 60, 20, 40],
      
      // 🔥 HEADER PROFESIONAL
      header: {
        margin: [20, 10, 20, 10],
        table: {
          widths: ['20%', '60%', '20%'],
          body: [[
            {
              image: await this.obtenerImagenBase64(
                datos.configuracion?.logo_gobierno || 
                '/uploads/logos/logo-gobierno-importado.png'
              ),
              fit: [60, 35],
              alignment: 'left',
              margin: [0, 5],
            },
            {
              text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ\nNOTA POSTANESTÉSICA\nNOM-004-SSA3-2012',
              fontSize: 8,
              bold: true,
              alignment: 'center',
              margin: [0, 8],
            },
            {
              image: await this.obtenerImagenBase64(
                datos.configuracion?.logo_principal || 
                '/uploads/logos/logo-principal-importado.png'
              ),
              fit: [60, 35],
              alignment: 'right',
              margin: [0, 5],
            },
          ]],
        },
        layout: 'noBorders',
      },

      content: [
        // 🔥 DATOS DEL PACIENTE
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: 'DATOS DEL PACIENTE', style: 'sectionHeader', colSpan: 3, alignment: 'center' },
                {},
                {}
              ],
              [
                { text: `Paciente: ${pacienteAdaptado.nombre_completo}`, style: 'tableText' },
                { text: `Expediente: ${pacienteAdaptado.expediente.numero_expediente}`, style: 'tableText' },
                { text: `Fecha: ${new Date(notaData.fecha_procedimiento || Date.now()).toLocaleDateString('es-MX')}`, style: 'tableText' }
              ],
              [
                { text: `Edad: ${pacienteAdaptado.edad} años`, style: 'tableText' },
                { text: `Sexo: ${pacienteAdaptado.sexo}`, style: 'tableText' },
                { text: `Quirófano: ${notaData.quirofano || 'No especificado'}`, style: 'tableText' }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        },

        // 🔥 DATOS DEL PROCEDIMIENTO
        { text: 'DATOS DEL PROCEDIMIENTO ANESTÉSICO', style: 'sectionHeader' },
        {
          table: {
            widths: ['25%', '*', '25%', '*'],
            body: [
              [
                { text: 'Procedimiento Realizado:', style: 'boldText' },
                { text: notaData.procedimiento_realizado || 'No especificado', style: 'tableText' },
                { text: 'Clasificación ASA:', style: 'boldText' },
                { text: notaData.clasificacion_asa || 'No clasificado', style: 'tableText' }
              ],
              [
                { text: 'Hora de Inicio:', style: 'boldText' },
                { text: notaData.hora_inicio || 'No registrada', style: 'tableText' },
                { text: 'Hora de Término:', style: 'boldText' },
                { text: notaData.hora_termino || 'No registrada', style: 'tableText' }
              ],
              [
                { text: 'Duración Total:', style: 'boldText' },
                { text: notaData.duracion_calculada || 'No calculada', style: 'tableText', colSpan: 3 },
                {},
                {}
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        },

        // 🔥 TIPO DE ANESTESIA
        { text: 'TIPO Y TÉCNICA ANESTÉSICA UTILIZADA', style: 'sectionHeader' },
        {
          table: {
            widths: ['25%', '*'],
            body: [
              [{ text: 'Tipo de Anestesia:', style: 'boldText' }, { text: notaData.tipo_anestesia || 'No especificado', style: 'tableText' }],
              [{ text: 'Técnica Anestésica:', style: 'boldText' }, { text: notaData.tecnica_anestesica || 'Estándar', style: 'tableText' }]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        },

        // 🔥 MEDICAMENTOS UTILIZADOS (NOM-004)
        { text: 'MEDICAMENTOS UTILIZADOS (NOM-004 D11.12)', style: 'sectionHeader' },
        {
          text: notaData.medicamentos_utilizados || 'No se registraron medicamentos específicos.',
          style: 'tableText',
          margin: [0, 0, 0, 15]
        },

        // 🔥 SIGNOS VITALES DE EGRESO
        { text: 'SIGNOS VITALES AL EGRESO DEL QUIRÓFANO', style: 'sectionHeader' },
        {
          table: {
            widths: ['*', '*', '*', '*', '*'],
            body: [
              [
                { text: `T/A: ${notaData.presion_arterial_egreso || '--'}`, style: 'tableText' },
                { text: `FC: ${notaData.frecuencia_cardiaca_egreso || '--'} lpm`, style: 'tableText' },
                { text: `FR: ${notaData.frecuencia_respiratoria_egreso || '--'} rpm`, style: 'tableText' },
                { text: `SatO2: ${notaData.saturacion_oxigeno_egreso || '--'}%`, style: 'tableText' },
                { text: `Temp: ${notaData.temperatura_egreso || '--'}°C`, style: 'tableText' }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        },

        // 🔥 ESCALA DE ALDRETE
        { text: 'ESCALA DE ALDRETE (RECUPERACIÓN POSTANESTÉSICA)', style: 'sectionHeader' },
        {
          table: {
            widths: ['*', '*', '*', '*', '*', 'auto'],
            body: [
              [
                { text: 'Actividad', style: 'boldText', alignment: 'center' },
                { text: 'Respiración', style: 'boldText', alignment: 'center' },
                { text: 'Circulación', style: 'boldText', alignment: 'center' },
                { text: 'Conciencia', style: 'boldText', alignment: 'center' },
                { text: 'Saturación', style: 'boldText', alignment: 'center' },
                { text: 'TOTAL', style: 'boldText', alignment: 'center' }
              ],
              [
                { text: `${notaData.aldrete_actividad || '2'}/2`, style: 'tableText', alignment: 'center' },
                { text: `${notaData.aldrete_respiracion || '2'}/2`, style: 'tableText', alignment: 'center' },
                { text: `${notaData.aldrete_circulacion || '2'}/2`, style: 'tableText', alignment: 'center' },
                { text: `${notaData.aldrete_conciencia || '2'}/2`, style: 'tableText', alignment: 'center' },
                { text: `${notaData.aldrete_saturacion || '2'}/2`, style: 'tableText', alignment: 'center' },
                { text: `${notaData.aldrete_total || '10'}/10`, style: 'boldText', alignment: 'center', fillColor: '#f5f5f5' }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        },

        // 🔥 EVALUACIÓN CLÍNICA DE EGRESO
        { text: 'EVALUACIÓN CLÍNICA DE EGRESO (NOM-004 D11.16)', style: 'sectionHeader' },
        {
          table: {
            widths: ['25%', '*'],
            body: [
              [{ text: 'Estado Clínico:', style: 'boldText' }, { text: notaData.estado_clinico_egreso || 'Estable', style: 'tableText' }],
              [{ text: 'Estado de Conciencia:', style: 'boldText' }, { text: notaData.estado_conciencia_egreso || 'Despierto, orientado', style: 'tableText' }],
              [{ text: 'Dolor Postoperatorio:', style: 'boldText' }, { text: notaData.dolor_postoperatorio || 'Sin dolor', style: 'tableText' }]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        },

        // 🔥 INCIDENTES Y COMPLICACIONES (NOM-004)
        { text: 'INCIDENTES Y COMPLICACIONES (NOM-004 D11.14)', style: 'sectionHeader' },
        {
          table: {
            widths: ['25%', '*'],
            body: [
              [{ text: 'Incidentes/Accidentes:', style: 'boldText' }, { text: notaData.incidentes_accidentes || 'Sin incidentes reportados', style: 'tableText' }],
              [{ text: 'Complicaciones:', style: 'boldText' }, { text: notaData.complicaciones_transanestesicas || 'Sin complicaciones', style: 'tableText' }]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        },

        // 🔥 BALANCE HÍDRICO (NOM-004)
        { text: 'BALANCE HÍDRICO Y PÉRDIDAS (NOM-004 D11.15)', style: 'sectionHeader' },
        {
          table: {
            widths: ['*', '*', '*', '*'],
            body: [
              [
                { text: `Líquidos: ${notaData.liquidos_administrados || '0'} ml`, style: 'tableText' },
                { text: `Sangrado: ${notaData.sangrado || '0'} ml`, style: 'tableText' },
                { text: `Hemoderivados: ${notaData.hemoderivados_transfundidos || 'Ninguno'}`, style: 'tableText' },
                { text: `Balance: ${notaData.balance_hidrico || 'Equilibrado'}`, style: 'tableText' }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        },

        // 🔥 PLAN DE MANEJO (NOM-004)
        { text: 'PLAN DE MANEJO Y TRATAMIENTO (NOM-004 D11.17)', style: 'sectionHeader' },
        {
          text: notaData.plan_tratamiento || 'Plan de manejo postanestésico estándar según protocolo institucional.',
          style: 'tableText',
          margin: [0, 0, 0, 15]
        },

        // 🔥 PRONÓSTICO
        {
          table: {
            widths: ['*'],
            body: [[
              {
                text: `PRONÓSTICO: ${notaData.pronostico || 'Favorable'}`,
                style: 'boldText',
                fillColor: '#f5f5f5',
                margin: [5, 8],
                alignment: 'center'
              }
            ]]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20]
        },

        // 🔥 FIRMA DEL ANESTESIÓLOGO
        {
          table: {
            widths: ['*', '*'],
            body: [[
              { 
                text: [
                  '\n\n\n',
                  '_'.repeat(40),
                  '\n',
                  { text: notaData.anestesiologo_nombre || medicoAdaptado.nombre_completo || 'Dr(a). [Nombre]', style: 'boldText' },
                  '\n',
                  'Médico Anestesiólogo',
                  '\n',
                  `Cédula: ${notaData.cedula_anestesiologo || medicoAdaptado.numero_cedula}`
                ],
                alignment: 'center'
              },
              {
                text: [
                  '\n\n\n',
                  '_'.repeat(40),
                  '\n',
                  { text: 'FECHA Y HORA', style: 'boldText' },
                  '\n',
                  `${new Date().toLocaleDateString('es-MX')} ${notaData.hora_termino || new Date().toLocaleTimeString('es-MX')}`
                ],
                alignment: 'center'
              }
            ]]
          },
          layout: 'noBorders'
        }
      ],

      // 🔥 ESTILOS PROFESIONALES
      styles: {
        sectionHeader: { 
          fontSize: 8, 
          bold: true, 
          margin: [0, 10, 0, 5], 
          fillColor: '#f5f5f5' 
        },
        boldText: { 
          fontSize: 7, 
          bold: true 
        },
        tableText: { 
          fontSize: 7 
        }
      }
    };
  }
// C:\Proyectos\CICEG-HG_Frontend\src\app\services\PDF\PdfTemplatesService.ts
async generarNotaPostoperatoria(datos: any): Promise<any> {
  console.log('⚕️ Generando Nota Postoperatoria...');

  const { pacienteCompleto, medicoCompleto, notaPostoperatoria } = datos;
  const fechaActual = new Date();

  return {
    pageSize: 'LETTER',
    pageMargins: [20, 60, 20, 40],

    // 🔥 HEADER PROFESIONAL IGUAL QUE HISTORIA CLÍNICA
    header: {
      margin: [20, 10, 20, 10],
      table: {
        widths: ['20%', '60%', '20%'],
        body: [[
          {
            image: await this.obtenerImagenBase64(
              datos.configuracion?.logo_gobierno || 
              '/uploads/logos/logo-gobierno-importado.png'
            ),
            fit: [80, 40],
            alignment: 'left',
            margin: [0, 5],
          },
          {
            text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ\nNOTA POSTOPERATORIA\nNOM-004-SSA3-2012',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            margin: [0, 8],
          },
          {
            image: await this.obtenerImagenBase64(
              datos.configuracion?.logo_principal || 
              '/uploads/logos/logo-principal-importado.png'
            ),
            fit: [80, 40],
            alignment: 'right',
            margin: [0, 5],
          },
        ]],
      },
      layout: 'noBorders',
    },

    content: [
      // INFORMACIÓN DEL FOLIO Y FECHA
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: '', border: [false, false, false, false] },
              { 
                text: `FOLIO: ${notaPostoperatoria.folio_postoperatorio || this.generarFolioPostoperatorio()}`, 
                style: 'folioText',
                alignment: 'center',
                border: [false, false, false, false]
              },
              { 
                text: `FECHA: ${fechaActual.toLocaleDateString('es-MX')}\nHORA: ${fechaActual.toLocaleTimeString('es-MX')}`, 
                style: 'dateText',
                alignment: 'right',
                border: [false, false, false, false]
              }
            ]
          ]
        },
        margin: [0, 0, 0, 15]
      },

      // DATOS DEL PACIENTE - ESTILO LIMPIO
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'DATOS DEL PACIENTE', style: 'sectionHeader', colSpan: 3, alignment: 'center', fillColor: '#f5f5f5' },
              {},
              {}
            ],
            [
              { text: `Paciente: ${pacienteCompleto.nombre_completo}`, style: 'tableText' },
              { text: `Expediente: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`, style: 'tableText' },
              { text: `Servicio: ${notaPostoperatoria.servicio_hospitalizacion || 'Cirugía General'}`, style: 'tableText' }
            ],
            [
              { text: `Edad: ${pacienteCompleto.edad} años`, style: 'tableText' },
              { text: `Sexo: ${pacienteCompleto.sexo}`, style: 'tableText' },
              { text: `Cama: ${notaPostoperatoria.numero_cama || 'No asignada'}`, style: 'tableText' }
            ],
            [
              { text: `CURP: ${pacienteCompleto.curp || 'No registrado'}`, style: 'tableText' },
              { text: `Fecha Nac.: ${this.formatearFecha(pacienteCompleto.fecha_nacimiento)}`, style: 'tableText' },
              { text: `Tipo sangre: ${pacienteCompleto.tipo_sangre || 'No especificado'}`, style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // INFORMACIÓN TEMPORAL DE LA CIRUGÍA
      {
        text: 'INFORMACIÓN TEMPORAL DEL PROCEDIMIENTO QUIRÚRGICO',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', '*', '*', '*'],
          body: [
            [
              { text: `Fecha Cirugía: ${this.formatearFecha(notaPostoperatoria.fecha_cirugia)}`, style: 'tableText' },
              { text: `Hora Inicio: ${notaPostoperatoria.hora_inicio || 'No registrada'}`, style: 'tableText' },
              { text: `Hora Fin: ${notaPostoperatoria.hora_fin || 'No registrada'}`, style: 'tableText' },
              { text: `Duración: ${this.formatearDuracionPostoperatoria(notaPostoperatoria.duracion_calculada)}`, style: 'tableText' }
            ],
            [
              { text: `Quirófano: ${notaPostoperatoria.quirofano_utilizado || 'No especificado'}`, style: 'tableText' },
              { text: `Anestesia: ${notaPostoperatoria.tipo_anestesia_utilizada || 'No especificada'}`, style: 'tableText' },
              { text: '', style: 'tableText' },
              { text: '', style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // DIAGNÓSTICOS
{
  text: 'DIAGNÓSTICOS (NOM-004 D10.12)',
  style: 'sectionHeader',
  fillColor: '#f5f5f5',
  margin: [0, 0, 0, 5]
},
{
  table: {
    widths: ['25%', '*'],
    body: [
      [
        { text: 'DIAGNÓSTICO PREOPERATORIO:', style: 'boldText' },
        { text: notaPostoperatoria.diagnostico_preoperatorio || 'No especificado', style: 'tableText' }
      ],
      [
        { text: 'DIAGNÓSTICO POSTOPERATORIO:', style: 'boldText' },
        { 
          text: [
            {
              text: notaPostoperatoria.diagnostico_postoperatorio || 'No especificado',
              style: 'tableText'
            },
            // 🔥 AGREGAR CIE-10 PARA NOTA POSTOPERATORIA
            notaPostoperatoria.codigo_cie10_postoperatorio ? {
              text: `\n\nCódigo CIE-10: ${notaPostoperatoria.codigo_cie10_postoperatorio}`,
              fontSize: 7,
              bold: true,
              color: '#7c2d12',
              italics: true,
            } : {}
          ]
        }
      ]
    ]
  },
  layout: 'lightHorizontalLines',
  margin: [0, 0, 0, 15]
},

      // PROCEDIMIENTOS REALIZADOS
      {
        text: 'PROCEDIMIENTOS REALIZADOS (NOM-004 D10.13)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [
              { text: 'OPERACIÓN PLANEADA:', style: 'boldText' },
              { text: notaPostoperatoria.operacion_planeada || 'No especificada', style: 'tableText' }
            ],
            [
              { text: 'OPERACIÓN REALIZADA:', style: 'boldText' },
              { text: notaPostoperatoria.operacion_realizada || 'No especificada', style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // DESCRIPCIÓN DE LA TÉCNICA QUIRÚRGICA
      {
        text: 'DESCRIPCIÓN DE LA TÉCNICA QUIRÚRGICA (NOM-004 D10.15)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [
              { text: 'DESCRIPCIÓN TÉCNICA:', style: 'boldText' },
              { text: notaPostoperatoria.descripcion_tecnica || 'No especificada', style: 'tableText' }
            ],
            [
              { text: 'TIPO DE ANESTESIA:', style: 'boldText' },
              { text: notaPostoperatoria.tipo_anestesia_utilizada || 'No especificada', style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // HALLAZGOS TRANSOPERATORIOS
      {
        text: 'HALLAZGOS TRANSOPERATORIOS (NOM-004 D10.16)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [
              { text: 'HALLAZGOS:', style: 'boldText' },
              { text: notaPostoperatoria.hallazgos_transoperatorios || 'Sin hallazgos relevantes', style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // CONTEO DE MATERIAL QUIRÚRGICO
      {
        text: 'REPORTE DE GASAS Y COMPRESAS (NOM-004 D10.17)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: `Conteo de Gasas: ${notaPostoperatoria.conteo_gasas_completo || 'No realizado'}`, style: 'tableText' },
              { text: `Conteo Instrumental: ${notaPostoperatoria.conteo_instrumental_completo || 'No realizado'}`, style: 'tableText' },
              { text: `Conteo Compresas: ${notaPostoperatoria.conteo_compresas_completo || 'No aplica'}`, style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // INCIDENTES Y ACCIDENTES
      {
        text: 'INCIDENTES Y ACCIDENTES (NOM-004 D10.18)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [
              { text: 'INCIDENTES/ACCIDENTES:', style: 'boldText' },
              { text: notaPostoperatoria.incidentes_accidentes || 'Sin incidentes', style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // CUANTIFICACIÓN DE SANGRADO
      {
        text: 'CUANTIFICACIÓN DE SANGRADO (NOM-004 D10.19)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: `Sangrado Estimado: ${notaPostoperatoria.sangrado_estimado ? `${notaPostoperatoria.sangrado_estimado} ml` : '0 ml'}`, style: 'tableText' },
              { text: `Método Hemostasia: ${notaPostoperatoria.metodo_hemostasia || 'Hemostasia convencional'}`, style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // ESTUDIOS TRANSOPERATORIOS
      {
        text: 'ESTUDIOS TRANSOPERATORIOS (NOM-004 D10.20)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [
              { text: 'ESTUDIOS REALIZADOS:', style: 'boldText' },
              { text: notaPostoperatoria.estudios_transoperatorios || 'No se realizaron estudios transoperatorios', style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // EQUIPO QUIRÚRGICO
      {
        text: 'EQUIPO QUIRÚRGICO',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: `Cirujano Principal: ${notaPostoperatoria.cirujano_principal || 'No especificado'}`, style: 'tableText' },
              { text: `Anestesiólogo: ${notaPostoperatoria.anestesiologo || 'No especificado'}`, style: 'tableText' }
            ],
            [
              { text: `Primer Ayudante: ${notaPostoperatoria.primer_ayudante || 'No asignado'}`, style: 'tableText' },
              { text: `Segundo Ayudante: ${notaPostoperatoria.segundo_ayudante || 'No asignado'}`, style: 'tableText' }
            ],
            [
              { text: `Instrumentista: ${notaPostoperatoria.instrumentista || 'No especificado'}`, style: 'tableText' },
              { text: `Circulante: ${notaPostoperatoria.circulante || 'No especificado'}`, style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // ESTADO POSTQUIRÚRGICO
      {
        text: 'ESTADO POSTQUIRÚRGICO DEL PACIENTE (NOM-004 D10.21)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [
              { text: 'ESTADO POSTQUIRÚRGICO:', style: 'boldText' },
              { text: notaPostoperatoria.estado_postquirurgico || 'No evaluado', style: 'tableText' }
            ],
            [
              { text: 'ESTABILIDAD HEMODINÁMICA:', style: 'boldText' },
              { text: notaPostoperatoria.estabilidad_hemodinamica || 'Estable', style: 'tableText' }
            ],
            [
              { text: 'DESTINO DEL PACIENTE:', style: 'boldText' },
              { text: notaPostoperatoria.destino_paciente || 'No especificado', style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // PLAN POSTOPERATORIO
      {
        text: 'PLAN DE MANEJO POSTOPERATORIO (NOM-004 D10.22)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [
              { text: 'PLAN POSTOPERATORIO:', style: 'boldText' },
              { text: notaPostoperatoria.plan_postoperatorio || 'Plan estándar postoperatorio', style: 'tableText' }
            ],
            [
              { text: 'INDICACIONES POSTOPERATORIAS:', style: 'boldText' },
              { text: notaPostoperatoria.indicaciones_postoperatorias || 'Indicaciones estándar', style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // ENVÍO DE PIEZAS A PATOLOGÍA (solo si aplica)
      ...(notaPostoperatoria.piezas_enviadas_patologia ? [
        {
          text: 'ENVÍO DE PIEZAS A PATOLOGÍA (NOM-004 D10.23)',
          style: 'sectionHeader',
          fillColor: '#f5f5f5',
          margin: [0, 0, 0, 5]
        },
        {
          table: {
            widths: ['25%', '*'],
            body: [
              [
                { text: 'ESPECÍMENES ENVIADOS:', style: 'boldText' },
                { text: `${notaPostoperatoria.descripcion_especimenes || 'No especificado'} (${notaPostoperatoria.numero_frascos_patologia || '1'} frasco/s)`, style: 'tableText' }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        }
      ] : []),

      // PRONÓSTICO
      {
        text: 'PRONÓSTICO',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [
              { text: 'PRONÓSTICO:', style: 'boldText' },
              { text: notaPostoperatoria.pronostico || 'No especificado', style: 'tableText' }
            ],
            [
              { text: 'EXPECTATIVA DE RECUPERACIÓN:', style: 'boldText' },
              { text: notaPostoperatoria.expectativa_recuperacion || 'Favorable', style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // OBSERVACIONES ADICIONALES (solo si existen)
      ...(notaPostoperatoria.observaciones_cirujano || notaPostoperatoria.observaciones_anestesiologo ? [
        {
          text: 'OBSERVACIONES ADICIONALES',
          style: 'sectionHeader',
          fillColor: '#f5f5f5',
          margin: [0, 0, 0, 5]
        },
        {
          table: {
            widths: ['25%', '*'],
            body: [
              ...(notaPostoperatoria.observaciones_cirujano ? [
                [
                  { text: 'OBSERVACIONES DEL CIRUJANO:', style: 'boldText' },
                  { text: notaPostoperatoria.observaciones_cirujano, style: 'tableText' }
                ]
              ] : []),
              ...(notaPostoperatoria.observaciones_anestesiologo ? [
                [
                  { text: 'OBSERVACIONES DEL ANESTESIÓLOGO:', style: 'boldText' },
                  { text: notaPostoperatoria.observaciones_anestesiologo, style: 'tableText' }
                ]
              ] : [])
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        }
      ] : []),

      // EVALUACIÓN FINAL
      {
        text: 'EVALUACIÓN FINAL DEL PROCEDIMIENTO QUIRÚRGICO',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: `Cirugía sin complicaciones: ${notaPostoperatoria.cirugia_sin_complicaciones ? 'SÍ' : 'NO'}`, style: 'boldText' },
              { text: `Objetivos quirúrgicos alcanzados: ${notaPostoperatoria.objetivos_alcanzados ? 'SÍ' : 'NO'}`, style: 'boldText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 30]
      },

      // FIRMAS PROFESIONALES
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              {
                text: 'NOMBRE COMPLETO, CÉDULA PROFESIONAL Y FIRMA',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
              {
                text: 'FIRMA AUTÓGRAFA',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
            ],
            [
              {
                text: [
                  { text: `${notaPostoperatoria.cirujano_principal || 'Dr(a). [Nombre]'}\n`, fontSize: 7, bold: true },
                  { text: `Cirujano Principal\n`, fontSize: 6 },
                  { text: `Cédula Profesional: ${notaPostoperatoria.cedula_cirujano || 'No registrada'}\n`, fontSize: 6 },
                  { text: `Hospital General San Luis de la Paz\n`, fontSize: 7, color: '#6b7280' },
                  { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}\n`, fontSize: 7 },
                  { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 7 },
                ],
                margin: [5, 20],
                alignment: 'center',
              },
              {
                text: '\n\n\n\n_________________________\nFIRMA DEL CIRUJANO\n(Según NOM-004-SSA3-2012)',
                fontSize: 6,
                margin: [5, 20],
                alignment: 'center',
              },
            ],
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20]
      }
    ],

    // 🔥 ESTILOS PROFESIONALES - SIN COLORES
    styles: {
      sectionHeader: { 
        fontSize: 8, 
        bold: true, 
        margin: [0, 10, 0, 5],
        fillColor: '#f5f5f5'
      },
      boldText: { 
        fontSize: 7, 
        bold: true 
      },
      tableText: { 
        fontSize: 7 
      },
      folioText: {
        fontSize: 8,
        bold: true
      },
      dateText: {
        fontSize: 7
      }
    }
  };
}

// MÉTODOS AUXILIARES PARA NOTA POSTOPERATORIA
private formatearDuracionPostoperatoria(duracion: string | null): string {
  if (!duracion) return 'No calculada';
  return duracion;
}

async generarNotaInterconsulta(datos: any): Promise<any> {
  console.log('💫 Generando Nota de Interconsulta...');

  const { pacienteCompleto, medicoCompleto, notaInterconsulta } = datos;
  const fechaActual = new Date();

  return {
    pageSize: 'LETTER',
    pageMargins: [20, 60, 20, 40],

    // 🔥 HEADER PROFESIONAL IGUAL QUE OTROS DOCUMENTOS
    header: {
      margin: [20, 10, 20, 10],
      table: {
        widths: ['20%', '60%', '20%'],
        body: [[
          {
            image: await this.obtenerImagenBase64(
              datos.configuracion?.logo_gobierno || 
              '/uploads/logos/logo-gobierno-importado.png'
            ),
            fit: [80, 40],
            alignment: 'left',
            margin: [0, 5],
          },
          {
            text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ\nNOTA DE INTERCONSULTA\nNOM-004-SSA3-2012',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            margin: [0, 8],
          },
          {
            image: await this.obtenerImagenBase64(
              datos.configuracion?.logo_principal || 
              '/uploads/logos/logo-principal-importado.png'
            ),
            fit: [80, 40],
            alignment: 'right',
            margin: [0, 5],
          },
        ]],
      },
      layout: 'noBorders',
    },

    content: [
      // INFORMACIÓN DEL FOLIO Y FECHA
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: '', border: [false, false, false, false] },
              { 
text: `FOLIO: ${datos.notaInterconsulta?.numero_interconsulta || this.generarNumeroInterconsulta()}`,
                style: 'folioText',
                alignment: 'center',
                border: [false, false, false, false]
              },
              { 
                text: `FECHA: ${fechaActual.toLocaleDateString('es-MX')}\nHORA: ${fechaActual.toLocaleTimeString('es-MX')}`, 
                style: 'dateText',
                alignment: 'right',
                border: [false, false, false, false]
              }
            ]
          ]
        },
        margin: [0, 0, 0, 15]
      },

      // DATOS DEL PACIENTE - ESTILO LIMPIO
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'DATOS DEL PACIENTE', style: 'sectionHeader', colSpan: 3, alignment: 'center', fillColor: '#f5f5f5' },
              {},
              {}
            ],
            [
              { text: `Paciente: ${pacienteCompleto.nombre_completo}`, style: 'tableText' },
              { text: `Expediente: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`, style: 'tableText' },
              { text: `Servicio: ${datos.notaInterconsulta?.servicio_solicitante || 'No especificado'}`, style: 'tableText' }
            ],
            [
              { text: `Edad: ${pacienteCompleto.edad} años`, style: 'tableText' },
              { text: `Sexo: ${pacienteCompleto.sexo}`, style: 'tableText' },
              { text: `Cama: ${datos.notaInterconsulta?.numero_cama || 'No asignada'}`, style: 'tableText' }
            ],
            [
              { text: `CURP: ${pacienteCompleto.curp || 'No registrado'}`, style: 'tableText' },
              { text: `Fecha Nac.: ${this.formatearFecha(pacienteCompleto.fecha_nacimiento)}`, style: 'tableText' },
              { text: `Tipo sangre: ${pacienteCompleto.tipo_sangre || 'No especificado'}`, style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // INFORMACIÓN DE LA INTERCONSULTA
      {
        text: 'INFORMACIÓN DE LA INTERCONSULTA',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: `Área Solicitada: ${datos.notaInterconsulta?.area_interconsulta || 'No especificada'}`, style: 'tableText' },
              { text: `Urgencia: ${datos.notaInterconsulta?.urgencia_interconsulta || 'Normal'}`, style: 'tableText' },
              { text: `Estado: ${datos.notaInterconsulta?.estado_interconsulta || 'Pendiente'}`, style: 'tableText' }
            ],
            [
              { text: `Médico Solicitante: ${datos.notaInterconsulta?.medico_solicitante || medicoCompleto.nombre_completo}`, style: 'tableText' },
              { text: `Fecha Solicitud: ${this.formatearFecha(datos.notaInterconsulta?.fecha_solicitud)}`, style: 'tableText' },
              { text: `Contacto: ${datos.notaInterconsulta?.telefono_contacto || 'No registrado'}`, style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // MOTIVO DE LA INTERCONSULTA (NOM-004 D7.14)
      {
        text: 'MOTIVO DE LA INTERCONSULTA (NOM-004 D7.14)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: datos.notaInterconsulta?.motivo_interconsulta || 'No especificado', 
                style: 'tableText',
                margin: [8, 8, 8, 8]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // PREGUNTA ESPECÍFICA PARA EL ESPECIALISTA
      {
        text: 'PREGUNTA ESPECÍFICA PARA EL ESPECIALISTA',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: datos.notaInterconsulta?.pregunta_especifica || 'No especificada', 
                style: 'tableText',
                margin: [8, 8, 8, 8]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // CRITERIO DIAGNÓSTICO (NOM-004 D7.12)
      {
        text: 'CRITERIO DIAGNÓSTICO (NOM-004 D7.12)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [
              { text: 'DIAGNÓSTICO PRESUNTIVO:', style: 'boldText' },
              { text: datos.notaInterconsulta?.diagnostico_presuntivo || 'No especificado', style: 'tableText' }
            ],
            [
              { text: 'RESUMEN DEL CASO:', style: 'boldText' },
              { text: datos.notaInterconsulta?.resumen_caso || 'Sin información registrada', style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // INFORMACIÓN CLÍNICA RELEVANTE
      {
        text: 'INFORMACIÓN CLÍNICA RELEVANTE',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [
              { text: 'SÍNTOMAS PRINCIPALES:', style: 'boldText' },
              { text: datos.notaInterconsulta?.sintomas_principales || 'No especificados', style: 'tableText' }
            ],
            [
              { text: 'TIEMPO DE EVOLUCIÓN:', style: 'boldText' },
              { text: datos.notaInterconsulta?.tiempo_evolucion || 'No especificado', style: 'tableText' }
            ],
            [
              { text: 'HALLAZGOS IMPORTANTES:', style: 'boldText' },
              { text: datos.notaInterconsulta?.hallazgos_importantes || 'Sin hallazgos relevantes', style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // ANTECEDENTES RELEVANTES
      {
        text: 'ANTECEDENTES RELEVANTES',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [
              { text: 'ANTECEDENTES MÉDICOS:', style: 'boldText' },
              { text: datos.notaInterconsulta?.antecedentes_relevantes || 'Sin antecedentes relevantes', style: 'tableText' }
            ],
            [
              { text: 'MEDICAMENTOS ACTUALES:', style: 'boldText' },
              { text: datos.notaInterconsulta?.medicamentos_actuales || 'No toma medicamentos', style: 'tableText' }
            ],
            [
              { text: 'ALERGIAS MEDICAMENTOSAS:', style: 'boldText' },
              { text: datos.notaInterconsulta?.alergias_medicamentosas || 'Sin alergias conocidas', style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // SIGNOS VITALES ACTUALES
      {
        text: 'SIGNOS VITALES AL MOMENTO DE LA SOLICITUD',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', '*', '*', '*', '*'],
          body: [
            [
              { text: `T/A: ${datos.notaInterconsulta?.presion_arterial_actual || '--'}`, style: 'tableText' },
              { text: `FC: ${datos.notaInterconsulta?.frecuencia_cardiaca_actual || '--'} lpm`, style: 'tableText' },
              { text: `FR: ${datos.notaInterconsulta?.frecuencia_respiratoria_actual || '--'} rpm`, style: 'tableText' },
              { text: `Temp: ${datos.notaInterconsulta?.temperatura_actual || '--'}°C`, style: 'tableText' },
              { text: `SatO2: ${datos.notaInterconsulta?.saturacion_oxigeno_actual || '--'}%`, style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // EXPLORACIÓN FÍSICA RELEVANTE
      {
        text: 'EXPLORACIÓN FÍSICA RELEVANTE',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: datos.notaInterconsulta?.exploracion_fisica_relevante || 'Sin hallazgos relevantes para la interconsulta', 
                style: 'tableText',
                margin: [8, 8, 8, 8]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // ESTUDIOS REALIZADOS
      {
        text: 'ESTUDIOS DE LABORATORIO Y GABINETE',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: `Laboratorio: ${datos.notaInterconsulta?.examenes_laboratorio ? 'SÍ' : 'NO'}`, style: 'tableText' },
              { text: `Gabinete: ${datos.notaInterconsulta?.examenes_gabinete ? 'SÍ' : 'NO'}`, style: 'tableText' }
            ],
            [
              { text: 'ESTUDIOS REALIZADOS:', style: 'boldText', colSpan: 2 },
              {}
            ],
            [
              { 
                text: datos.notaInterconsulta?.estudios_realizados || 'No se han realizado estudios específicos', 
                style: 'tableText',
                colSpan: 2,
                margin: [5, 5, 5, 5]
              },
              {}
            ],
            [
              { text: 'RESULTADOS RELEVANTES:', style: 'boldText', colSpan: 2 },
              {}
            ],
            [
              { 
                text: datos.notaInterconsulta?.resultados_relevantes || 'Sin resultados significativos', 
                style: 'tableText',
                colSpan: 2,
                margin: [5, 5, 5, 5]
              },
              {}
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // TRATAMIENTO ACTUAL
      {
        text: 'TRATAMIENTO ACTUAL',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [
              { text: 'TRATAMIENTO ACTUAL:', style: 'boldText' },
              { text: datos.notaInterconsulta?.tratamiento_actual || 'Sin tratamiento específico', style: 'tableText' }
            ],
            [
              { text: 'MEDIDAS TOMADAS:', style: 'boldText' },
              { text: datos.notaInterconsulta?.medidas_tomadas || 'Medidas conservadoras', style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // ESTUDIOS SUGERIDOS O PENDIENTES
      {
        text: 'ESTUDIOS PENDIENTES O RECOMENDADOS',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['25%', '*'],
          body: [
            [
              { text: 'ESTUDIOS PENDIENTES:', style: 'boldText' },
              { text: datos.notaInterconsulta?.estudios_pendientes || 'Ninguno pendiente', style: 'tableText' }
            ],
            [
              { text: 'ESTUDIOS RECOMENDADOS:', style: 'boldText' },
              { text: datos.notaInterconsulta?.estudios_recomendados || 'A criterio del especialista', style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // LÍNEA DIVISORIA PARA RESPUESTA DEL ESPECIALISTA
      { text: '', pageBreak: 'before' },

      // RESPUESTA DEL ESPECIALISTA
      {
        text: 'RESPUESTA DEL ESPECIALISTA',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: `Médico Consultor: ${datos.notaInterconsulta?.medico_consultor || 'PENDIENTE DE ASIGNACIÓN'}`, style: 'tableText' },
              { text: `Fecha Respuesta: ${this.formatearFecha(datos.notaInterconsulta?.fecha_respuesta) || 'PENDIENTE'}`, style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // IMPRESIÓN DIAGNÓSTICA (NOM-004 D7.12)
      {
        text: 'CRITERIO DIAGNÓSTICO DEL ESPECIALISTA (NOM-004 D7.12)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: datos.notaInterconsulta?.impresion_diagnostica || 'PENDIENTE DE EVALUACIÓN POR EL ESPECIALISTA', 
                style: 'tableText',
                margin: [8, 15, 8, 15]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // SUGERENCIAS DIAGNÓSTICAS Y TRATAMIENTO (NOM-004 D7.13)
      {
        text: 'SUGERENCIAS DIAGNÓSTICAS Y DE TRATAMIENTO (NOM-004 D7.13)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: datos.notaInterconsulta?.recomendaciones || 'PENDIENTE DE RECOMENDACIONES DEL ESPECIALISTA', 
                style: 'tableText',
                margin: [8, 15, 8, 15]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // PLAN DE MANEJO
      {
        text: 'PLAN DE MANEJO PROPUESTO',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: datos.notaInterconsulta?.plan_manejo || 'PENDIENTE DE PLAN DE MANEJO', 
                style: 'tableText',
                margin: [8, 15, 8, 15]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // SEGUIMIENTO Y CONTROL
      {
        text: 'SEGUIMIENTO Y CONTROL',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: `Requiere Seguimiento: ${datos.notaInterconsulta?.requiere_seguimiento ? 'SÍ' : 'NO'}`, style: 'tableText' },
              { text: `Requiere Hospitalización: ${datos.notaInterconsulta?.requiere_hospitalizacion ? 'SÍ' : 'NO'}`, style: 'tableText' }
            ],
            [
              { text: `Tipo de Seguimiento: ${datos.notaInterconsulta?.tipo_seguimiento || 'No especificado'}`, style: 'tableText' },
              { text: `Frecuencia: ${datos.notaInterconsulta?.frecuencia_seguimiento || 'No especificada'}`, style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // PRONÓSTICO
      {
        text: 'PRONÓSTICO',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: datos.notaInterconsulta?.pronostico_especialista || 'Pendiente de evaluación pronóstica', 
                style: 'tableText',
                margin: [8, 8, 8, 8]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20]
      },

      // FIRMAS PROFESIONALES
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              {
                text: 'MÉDICO SOLICITANTE',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
              {
                text: 'MÉDICO ESPECIALISTA',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
            ],
            [
              {
                text: [
                  { text: `${datos.notaInterconsulta?.medico_solicitante || medicoCompleto.nombre_completo}\n`, fontSize: 7, bold: true },
                  { text: `Médico Solicitante\n`, fontSize: 6 },
                  { text: `Cédula: ${medicoCompleto.numero_cedula || 'No registrada'}\n`, fontSize: 6 },
                  { text: `Servicio: ${datos.notaInterconsulta?.servicio_solicitante || 'No especificado'}\n`, fontSize: 6 },
                  { text: `Contacto: ${datos.notaInterconsulta?.telefono_contacto || 'No registrado'}\n`, fontSize: 7 },
                  { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}`, fontSize: 7 },
                ],
                margin: [5, 20],
                alignment: 'center',
              },
              {
                text: [
                  { text: `${datos.notaInterconsulta?.medico_consultor || 'PENDIENTE DE ASIGNACIÓN'}\n`, fontSize: 7, bold: true },
                  { text: `Médico Especialista\n`, fontSize: 6 },
                  { text: `Área: ${datos.notaInterconsulta?.area_interconsulta || 'No especificada'}\n`, fontSize: 6 },
                  { text: `Fecha Respuesta: ${this.formatearFecha(datos.notaInterconsulta?.fecha_respuesta) || 'PENDIENTE'}\n`, fontSize: 6 },
                  { text: '\n_________________________\nFIRMA DEL ESPECIALISTA', fontSize: 7 },
                ],
                margin: [5, 20],
                alignment: 'center',
              },
            ],
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20]
      },

      // PIE DE PÁGINA INFORMATIVO
      {
        columns: [
          {
            width: '50%',
            text: [
              { text: '* Documento elaborado conforme a:\n', fontSize: 7, italics: true, color: '#666666' },
              { text: '• NOM-004-SSA3-2012 Del expediente clínico\n', fontSize: 7, color: '#666666' },
              { text: '• Nota de Interconsulta D7\n', fontSize: 7, color: '#666666' },
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
      }
    ],

    footer: (currentPage: number, pageCount: number) => ({
      margin: [20, 10],
      table: {
        widths: ['33%', '34%', '33%'],
        body: [
          [
            { 
              text: `Interconsulta - ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`, 
              fontSize: 7, 
              color: '#666666' 
            },
            { 
              text: `Página ${currentPage} de ${pageCount}`, 
              fontSize: 7, 
              alignment: 'center', 
              color: '#666666' 
            },
            { 
              text: fechaActual.toLocaleDateString('es-MX'), 
              fontSize: 7, 
              alignment: 'right', 
              color: '#666666' 
            },
          ],
        ],
      },
      layout: 'noBorders',
    }),

    // 🔥 ESTILOS PROFESIONALES - SIN COLORES
    styles: {
      sectionHeader: { 
        fontSize: 8, 
        bold: true, 
        margin: [0, 10, 0, 5],
        fillColor: '#f5f5f5'
      },
      boldText: { 
        fontSize: 7, 
        bold: true 
      },
      tableText: { 
        fontSize: 7 
      },
      folioText: {
        fontSize: 8,
        bold: true
      },
      dateText: {
        fontSize: 7
      }
    }
  };
}

async generarNotaEgreso(datos: any): Promise<any> {
  console.log('🏥 Generando Nota de Egreso...');

  const { pacienteCompleto, medicoCompleto } = datos;
  const notaEgreso = datos.notaEgreso;
  const fechaActual = new Date();

  return {
    pageSize: 'LETTER',
    pageMargins: [20, 60, 20, 40],

    // 🔥 HEADER PROFESIONAL IGUAL QUE OTROS DOCUMENTOS
    header: {
      margin: [20, 10, 20, 10],
      table: {
        widths: ['20%', '60%', '20%'],
        body: [[
          {
            image: await this.obtenerImagenBase64(
              datos.configuracion?.logo_gobierno || 
              '/uploads/logos/logo-gobierno-importado.png'
            ),
            fit: [80, 40],
            alignment: 'left',
            margin: [0, 5],
          },
          {
            text: 'HOSPITAL GENERAL SAN LUIS DE LA PAZ\nNOTA DE EGRESO HOSPITALARIO\nNOM-004-SSA3-2012',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            margin: [0, 8],
          },
          {
            image: await this.obtenerImagenBase64(
              datos.configuracion?.logo_principal || 
              '/uploads/logos/logo-principal-importado.png'
            ),
            fit: [80, 40],
            alignment: 'right',
            margin: [0, 5],
          },
        ]],
      },
      layout: 'noBorders',
    },

    content: [
      // INFORMACIÓN DEL FOLIO Y FECHA
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: '', border: [false, false, false, false] },
              { 
                text: `FOLIO: ${datos.notaEgreso?.folio_egreso || this.generarFolioEgreso()}`, 
                style: 'folioText',
                alignment: 'center',
                border: [false, false, false, false]
              },
              { 
                text: `FECHA DE EGRESO: ${fechaActual.toLocaleDateString('es-MX')}\nHORA: ${fechaActual.toLocaleTimeString('es-MX')}`, 
                style: 'dateText',
                alignment: 'right',
                border: [false, false, false, false]
              }
            ]
          ]
        },
        margin: [0, 0, 0, 15]
      },

      // DATOS DEL PACIENTE - ESTILO LIMPIO
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'DATOS DEL PACIENTE', style: 'sectionHeader', colSpan: 3, alignment: 'center', fillColor: '#f5f5f5' },
              {},
              {}
            ],
            [
              { text: `Paciente: ${pacienteCompleto.nombre_completo}`, style: 'tableText' },
              { text: `Expediente: ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`, style: 'tableText' },
              { text: `Servicio: ${datos.notaEgreso?.servicio || 'No especificado'}`, style: 'tableText' }
            ],
            [
              { text: `Edad: ${pacienteCompleto.edad} años`, style: 'tableText' },
              { text: `Sexo: ${pacienteCompleto.sexo}`, style: 'tableText' },
              { text: `Cama: ${datos.notaEgreso?.numero_cama || 'No asignada'}`, style: 'tableText' }
            ],
            [
              { text: `CURP: ${pacienteCompleto.curp || 'No registrado'}`, style: 'tableText' },
              { text: `Fecha Nac.: ${this.formatearFecha(pacienteCompleto.fecha_nacimiento)}`, style: 'tableText' },
              { text: `Tipo sangre: ${pacienteCompleto.tipo_sangre || 'No especificado'}`, style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // INFORMACIÓN DE HOSPITALIZACIÓN
      {
        text: 'INFORMACIÓN DE HOSPITALIZACIÓN',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: `Fecha de Ingreso: ${this.formatearFecha(datos.notaEgreso?.fecha_ingreso)}`, style: 'tableText' },
              { text: `Fecha de Egreso: ${fechaActual.toLocaleDateString('es-MX')}`, style: 'tableText' },
              { text: `Días de Estancia: ${datos.notaEgreso?.dias_estancia || 'No calculado'}`, style: 'tableText' }
            ],
            [
              { text: `Motivo de Egreso: ${datos.notaEgreso?.motivo_egreso || 'No especificado'}`, style: 'boldText', colSpan: 2 },
              {},
              { text: `Reingreso: ${datos.notaEgreso?.reingreso_por_misma_afeccion ? 'SÍ' : 'NO'}`, style: 'boldText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // DIAGNÓSTICO DE INGRESO (NOM-004 D12.8)
      {
        text: 'DIAGNÓSTICO DE INGRESO (NOM-004 D12.8)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: datos.notaEgreso?.diagnostico_ingreso || 'No especificado', 
                style: 'tableText',
                margin: [8, 8, 8, 8]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // RESUMEN DE LA EVOLUCIÓN (NOM-004 D12.9)
      {
        text: 'RESUMEN DE LA EVOLUCIÓN Y ESTADO ACTUAL (NOM-004 D12.9)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: datos.notaEgreso?.resumen_evolucion || 'Sin información registrada', 
                style: 'tableText',
                margin: [8, 8, 8, 8]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // MANEJO DURANTE LA ESTANCIA HOSPITALARIA (NOM-004 D12.10)
      {
        text: 'MANEJO DURANTE LA ESTANCIA HOSPITALARIA (NOM-004 D12.10)',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: datos.notaEgreso?.manejo_hospitalario || 'Sin información registrada', 
                style: 'tableText',
                margin: [8, 8, 8, 8]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // PROCEDIMIENTOS REALIZADOS
      ...(datos.notaEgreso?.procedimientos_realizados ? [
        {
          text: 'PROCEDIMIENTOS REALIZADOS DURANTE LA HOSPITALIZACIÓN',
          style: 'sectionHeader',
          fillColor: '#f5f5f5',
          margin: [0, 0, 0, 5]
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'PROCEDIMIENTOS:', style: 'boldText' },
                { text: `FECHA: ${this.formatearFecha(datos.notaEgreso?.fecha_procedimientos)}`, style: 'boldText' }
              ],
              [
                { 
                  text: datos.notaEgreso?.procedimientos_realizados, 
                  style: 'tableText',
                  colSpan: 2,
                  margin: [5, 5, 5, 5]
                },
                {}
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        }
      ] : []),

      // DIAGNÓSTICO DE EGRESO
{
  text: 'DIAGNÓSTICO DE EGRESO',
  style: 'sectionHeader',
  fillColor: '#f5f5f5',
  margin: [0, 0, 0, 5]
},
{
  table: {
    widths: ['100%'],
    body: [
      [
        { 
          text: [
            {
              text: datos.notaEgreso?.diagnostico_egreso || 'No especificado',
              style: 'boldText'
            },
            // 🔥 AGREGAR CIE-10 PARA NOTA DE EGRESO
            datos.notaEgreso?.codigo_cie10_egreso ? {
              text: `\n\nCódigo CIE-10: ${datos.notaEgreso.codigo_cie10_egreso}`,
              fontSize: 7,
              bold: true,
              color: '#059669',
              italics: true,
            } : {}
          ],
          margin: [8, 8, 8, 8]
        }
      ]
    ]
  },
  layout: 'lightHorizontalLines',
  margin: [0, 0, 0, 15]
},

      // GUÍAS CLÍNICAS DE DIAGNÓSTICO
      ...(datos.notaEgreso?.guias_clinicas && datos.notaEgreso.guias_clinicas.length > 0 ? [
        {
          text: 'GUÍAS CLÍNICAS DE DIAGNÓSTICO',
          style: 'sectionHeader',
          fillColor: '#f5f5f5',
          margin: [0, 0, 0, 5]
        },
        {
          table: {
            widths: ['100%'],
            body: [
              [
                { 
                  text: this.construirTextoGuiasClinicas(datos.notaEgreso.guias_clinicas),
                  style: 'tableText',
                  margin: [8, 8, 8, 8]
                }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        }
      ] : []),

      // PROBLEMAS CLÍNICOS PENDIENTES
      ...(datos.notaEgreso?.problemas_pendientes ? [
        {
          text: 'PROBLEMAS CLÍNICOS PENDIENTES',
          style: 'sectionHeader',
          fillColor: '#f5f5f5',
          margin: [0, 0, 0, 5]
        },
        {
          table: {
            widths: ['100%'],
            body: [
              [
                { 
                  text: datos.notaEgreso?.problemas_pendientes, 
                  style: 'tableText',
                  margin: [8, 8, 8, 8]
                }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        }
      ] : []),

      // PLAN DE TRATAMIENTO AMBULATORIO
      {
        text: 'PLAN DE TRATAMIENTO AMBULATORIO',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: datos.notaEgreso?.plan_tratamiento || 'No especificado', 
                style: 'tableText',
                margin: [8, 8, 8, 8]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 15]
      },

      // RECOMENDACIONES DE VIGILANCIA
      ...(datos.notaEgreso?.recomendaciones_vigilancia ? [
        {
          text: 'RECOMENDACIONES DE VIGILANCIA',
          style: 'sectionHeader',
          fillColor: '#f5f5f5',
          margin: [0, 0, 0, 5]
        },
        {
          table: {
            widths: ['100%'],
            body: [
              [
                { 
                  text: datos.notaEgreso?.recomendaciones_vigilancia, 
                  style: 'tableText',
                  margin: [8, 8, 8, 8]
                }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        }
      ] : []),

      // ATENCIÓN A FACTORES DE RIESGO
      ...(datos.notaEgreso?.atencion_factores_riesgo ? [
        {
          text: 'ATENCIÓN A FACTORES DE RIESGO',
          style: 'sectionHeader',
          fillColor: '#f5f5f5',
          margin: [0, 0, 0, 5]
        },
        {
          table: {
            widths: ['100%'],
            body: [
              [
                { 
                  text: datos.notaEgreso?.atencion_factores_riesgo, 
                  style: 'tableText',
                  margin: [8, 8, 8, 8]
                }
              ]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15]
        }
      ] : []),

      // PRONÓSTICO
      {
        text: 'PRONÓSTICO',
        style: 'sectionHeader',
        fillColor: '#f5f5f5',
        margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['100%'],
          body: [
            [
              { 
                text: datos.notaEgreso?.pronostico || 'No especificado', 
                style: 'tableText',
                margin: [8, 8, 8, 8]
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20]
      },

      // INFORMACIÓN DE SEGUIMIENTO
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: 'SEGUIMIENTO Y CONTROL', style: 'sectionHeader', colSpan: 2, fillColor: '#f5f5f5' },
              {}
            ],
            [
              { text: 'Control médico ambulatorio: PROGRAMADO', style: 'tableText' },
              { text: 'Citas de seguimiento: SEGÚN NECESIDAD', style: 'tableText' }
            ],
            [
              { text: 'Signos de alarma: EXPLICADOS AL PACIENTE', style: 'tableText' },
              { text: 'Reingresos: MONITOREAR', style: 'tableText' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 30]
      },

      // FIRMAS PROFESIONALES
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              {
                text: 'MÉDICO RESPONSABLE DEL EGRESO',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
              {
                text: 'FIRMA AUTÓGRAFA',
                fontSize: 6,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
            ],
            [
              {
                text: [
                  { text: `${medicoCompleto.nombre_completo || 'Dr(a). [Nombre]'}\n`, fontSize: 7, bold: true },
                  { text: `Médico Responsable del Egreso\n`, fontSize: 6 },
                  { text: `Cédula Profesional: ${medicoCompleto.numero_cedula || 'No registrada'}\n`, fontSize: 6 },
                  { text: `Especialidad: ${medicoCompleto.especialidad || 'No especificada'}\n`, fontSize: 6 },
                  { text: `Hospital General San Luis de la Paz\n`, fontSize: 7, color: '#6b7280' },
                  { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}\n`, fontSize: 7 },
                  { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 7 },
                ],
                margin: [5, 20],
                alignment: 'center',
              },
              {
                text: '\n\n\n\n_________________________\nFIRMA DEL MÉDICO\n(Según NOM-004-SSA3-2012)',
                fontSize: 6,
                margin: [5, 20],
                alignment: 'center',
              },
            ],
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20]
      },

      // PIE DE PÁGINA INFORMATIVO
      {
        columns: [
          {
            width: '50%',
            text: [
              { text: '* Documento elaborado conforme a:\n', fontSize: 7, italics: true, color: '#666666' },
              { text: '• NOM-004-SSA3-2012 Del expediente clínico\n', fontSize: 7, color: '#666666' },
              { text: '• Nota de Egreso D12\n', fontSize: 7, color: '#666666' },
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
      }
    ],

    footer: (currentPage: number, pageCount: number) => ({
      margin: [20, 10],
      table: {
        widths: ['33%', '34%', '33%'],
        body: [
          [
            { 
              text: `Nota de Egreso - ${this.obtenerNumeroExpedienteInteligente(pacienteCompleto)}`, 
              fontSize: 7, 
              color: '#666666' 
            },
            { 
              text: `Página ${currentPage} de ${pageCount}`, 
              fontSize: 7, 
              alignment: 'center', 
              color: '#666666' 
            },
            { 
              text: fechaActual.toLocaleDateString('es-MX'), 
              fontSize: 7, 
              alignment: 'right', 
              color: '#666666' 
            },
          ],
        ],
      },
      layout: 'noBorders',
    }),

    // 🔥 ESTILOS PROFESIONALES - SIN COLORES
    styles: {
      sectionHeader: { 
        fontSize: 8, 
        bold: true, 
        margin: [0, 10, 0, 5],
        fillColor: '#f5f5f5'
      },
      boldText: { 
        fontSize: 7, 
        bold: true 
      },
      tableText: { 
        fontSize: 7 
      },
      folioText: {
        fontSize: 8,
        bold: true
      },
      dateText: {
        fontSize: 7
      }
    }
  };
}

private generarFolioEgreso(): string {
  const fecha = new Date();
  const timestamp = fecha.getTime().toString().slice(-6);
  return `EGR-${fecha.getFullYear()}-${timestamp}`;
}

}
