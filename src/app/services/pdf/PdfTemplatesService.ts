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
    console.log('🔍 DEBUG obtenerNumeroExpedientePreferido:', {
      expediente_completo: expediente,
      numero_expediente_administrativo: expediente?.numero_expediente_administrativo,
      numero_expediente: expediente?.numero_expediente,
      tipo: typeof expediente
    });
    
    const resultado = expediente?.numero_expediente_administrativo ||
      expediente?.numero_expediente ||
      'Sin número';
      
    console.log('📋 Resultado del número de expediente:', resultado);
    return resultado;
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

private obtenerNumeroExpedienteInteligente(pacienteCompleto: any): string {
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
    console.log('📄 Generando Nota de Evolución Médica - Estilo Profesional...');
    
    const pacienteCompleto = datos.pacienteCompleto;
    const medicoCompleto = datos.medicoCompleto;
    const notaEvolucionData = datos.notaEvolucion || {};
    const fechaActual = new Date();
    const esPediatrico = pacienteCompleto.edad < 18;
    
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
                text: esPediatrico
                  ? 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - NOTA DE EVOLUCIÓN MÉDICA PEDIÁTRICA'
                  : 'HOSPITAL GENERAL SAN LUIS DE LA PAZ - NOTA DE EVOLUCIÓN MÉDICA',
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
                  fontSize: 8,
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
                        { text: notaEvolucionData.numero_cama || 'NO ASIGNADO', fontSize: 7, alignment: 'center' },
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
                    widths: ['55%', '15%', '15%', '15%'],
                    body: [
                      [
                        { text: 'Nombre completo del paciente', fontSize: 7, bold: true },
                        { text: 'Edad', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Sexo', fontSize: 7, bold: true, alignment: 'center' },
                        { text: 'Tipo de sangre', fontSize: 7, bold: true, alignment: 'center' },
                      ],
                      [
                        { text: pacienteCompleto.nombre_completo, fontSize: 8, bold: true, margin: [2, 3] },
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
                    fontSize: 8,
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
                  fontSize: 8,
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
                  fontSize: 8,
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
                  fontSize: 8,
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
                  text: notaEvolucionData.diagnosticos || 'Sin información registrada',
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.3,
                  bold: true,
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
                  fontSize: 8,
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
                  fontSize: 8,
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
                        { text: pacienteCompleto.nombre_completo, fontSize: 8, bold: true, margin: [2, 3] },
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
                  fontSize: 8,
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
                  fontSize: 8,
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
                  fontSize: 8,
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
                  fontSize: 8,
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
                  text: notaUrgenciasData.diagnostico || 'Diagnóstico por establecer. Paciente en evaluación.',
                  fontSize: 7,
                  margin: [5, 8],
                  lineHeight: 1.4,
                  bold: true,
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
                  fontSize: 8,
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
                    fontSize: 8,
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
                  fontSize: 8,
                  bold: true,
                  fillColor: '#f5f5f5',
                  alignment: 'center',
                  margin: [2, 5],
                },
                {
                  text: 'FIRMA AUTÓGRAFA',
                  fontSize: 8,
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
                      fontSize: 9,
                      bold: true,
                    },
                    {
                      text: `Cédula Profesional: ${medicoCompleto.numero_cedula || 'No registrada'}\n`,
                      fontSize: 8,
                    },
                    {
                      text: `Especialidad: ${medicoCompleto.especialidad || 'Medicina de Urgencias'}\n`,
                      fontSize: 8,
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
            fontSize: 10,
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
        fontSize: 10, 
        bold: true, 
        margin: [0, 10, 0, 5], 
        fillColor: '#f5f5f5' 
      },
      boldText: { 
        fontSize: 9, 
        bold: true 
      },
      tableText: { 
        fontSize: 9 
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
            fontSize: 10,
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
                text: notaPreoperatoria.diagnostico_preoperatorio || 'No especificado', 
                style: 'boldText',
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
                fontSize: 8,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
              {
                text: 'FIRMA AUTÓGRAFA',
                fontSize: 8,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
            ],
            [
              {
                text: [
                  { text: `${medicoCompleto.nombre_completo || 'Dr(a). [Nombre]'}\n`, fontSize: 9, bold: true },
                  { text: `Médico Cirujano Evaluador\n`, fontSize: 8 },
                  { text: `Cédula Profesional: ${medicoCompleto.numero_cedula || 'No registrada'}\n`, fontSize: 8 },
                  { text: `Especialidad: ${medicoCompleto.especialidad || 'No especificada'}\n`, fontSize: 8 },
                  { text: `Hospital General San Luis de la Paz\n`, fontSize: 7, color: '#6b7280' },
                  { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}\n`, fontSize: 7 },
                  { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 7 },
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
        fontSize: 10, 
        bold: true, 
        margin: [0, 10, 0, 5],
        fillColor: '#f5f5f5'
      },
      boldText: { 
        fontSize: 9, 
        bold: true 
      },
      tableText: { 
        fontSize: 9 
      },
      folioText: {
        fontSize: 10,
        bold: true
      },
      dateText: {
        fontSize: 9
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
              fontSize: 10,
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
          fontSize: 10, 
          bold: true, 
          margin: [0, 10, 0, 5], 
          fillColor: '#f5f5f5' 
        },
        boldText: { 
          fontSize: 9, 
          bold: true 
        },
        tableText: { 
          fontSize: 9 
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
            fontSize: 10,
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
              { text: notaPostoperatoria.diagnostico_postoperatorio || 'No especificado', style: 'tableText' }
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
                fontSize: 8,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
              {
                text: 'FIRMA AUTÓGRAFA',
                fontSize: 8,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
            ],
            [
              {
                text: [
                  { text: `${notaPostoperatoria.cirujano_principal || 'Dr(a). [Nombre]'}\n`, fontSize: 9, bold: true },
                  { text: `Cirujano Principal\n`, fontSize: 8 },
                  { text: `Cédula Profesional: ${notaPostoperatoria.cedula_cirujano || 'No registrada'}\n`, fontSize: 8 },
                  { text: `Hospital General San Luis de la Paz\n`, fontSize: 7, color: '#6b7280' },
                  { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}\n`, fontSize: 7 },
                  { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 7 },
                ],
                margin: [5, 20],
                alignment: 'center',
              },
              {
                text: '\n\n\n\n_________________________\nFIRMA DEL CIRUJANO\n(Según NOM-004-SSA3-2012)',
                fontSize: 8,
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
        fontSize: 10, 
        bold: true, 
        margin: [0, 10, 0, 5],
        fillColor: '#f5f5f5'
      },
      boldText: { 
        fontSize: 9, 
        bold: true 
      },
      tableText: { 
        fontSize: 9 
      },
      folioText: {
        fontSize: 10,
        bold: true
      },
      dateText: {
        fontSize: 9
      }
    }
  };
}

// // MÉTODOS AUXILIARES PARA NOTA POSTOPERATORIA
// private formatearDuracionPostoperatoria(duracion: string | null): string {
//   if (!duracion) return 'No calculada';
//   return duracion;
// }

// private generarFolioPostoperatorio(): string {
//   const fecha = new Date();
//   const timestamp = fecha.getTime().toString().slice(-6);
//   return `POSTOP-${fecha.getFullYear()}-${timestamp}`;
// }




// MÉTODOS AUXILIARES PARA NOTA POSTOPERATORIA
private formatearDuracionPostoperatoria(duracion: string | null): string {
  if (!duracion) return 'No calculada';
  return duracion;
}





  // async generarNotaInterconsulta(datos: any): Promise<any> {
  //   console.log('💫 Generando Nota de Interconsulta - ¡EL GRAN FINAL!');

  //   const { pacienteCompleto, medicoCompleto, interconsulta } = datos;
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
  //                   { text: 'SAN LUIS DE LA PAZ', fontSize: 10, bold: true },
  //                   { text: 'GUANAJUATO, MÉXICO', fontSize: 8 }
  //                 ]
  //               },
  //               {
  //                 stack: [
  //                   { text: '💫 NOTA DE INTERCONSULTA', fontSize: 16, bold: true, alignment: 'center', color: '#7c3aed' },
  //                   { text: 'COMUNICACIÓN ENTRE ESPECIALIDADES', fontSize: 10, alignment: 'center', italics: true },
  //                   { text: 'NOM-004-SSA3-2012', fontSize: 8, alignment: 'center', color: '#666666' }
  //                 ]
  //               },
  //               {
  //                 stack: [
  //                   { text: 'FOLIO:', fontSize: 8, bold: true, alignment: 'right' },
  //                   { text: interconsulta.numero_interconsulta || this.generarNumeroInterconsulta(), fontSize: 10, alignment: 'right' },
  //                   { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}`, fontSize: 8, alignment: 'right', margin: [0, 2] },
  //                   { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 8, alignment: 'right' }
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
  //                 fillColor: '#faf5ff',
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
  //               { text: 'Fecha Solicitud:', style: 'fieldLabel' },
  //               { text: this.formatearFecha(interconsulta.fecha_solicitud), style: 'fieldValue' },
  //               { text: 'Urgencia:', style: 'fieldLabel' },
  //               { text: this.formatearUrgencia(interconsulta.urgencia_interconsulta), style: 'urgenciaValue', color: this.getColorUrgencia(interconsulta.urgencia_interconsulta) }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15]
  //       },

  //       // INFORMACIÓN DE LA SOLICITUD
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: '📋 INFORMACIÓN DE LA SOLICITUD',
  //                 style: 'sectionHeader',
  //                 fillColor: '#eff6ff',
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
  //                   { text: 'ESPECIALIDAD SOLICITADA:', style: 'fieldLabel' },
  //                   { text: interconsulta.especialidad_solicitada || 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'MÉDICO SOLICITANTE:', style: 'fieldLabel' },
  //                   { text: interconsulta.medico_solicitante || medicoCompleto.nombre_completo || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'SERVICIO SOLICITANTE:', style: 'fieldLabel' },
  //                   { text: interconsulta.servicio_solicitante || medicoCompleto.departamento || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 0] }
  //                 ]
  //               },
  //               {
  //                 stack: [
  //                   { text: 'CONTACTO:', style: 'fieldLabel' },
  //                   { text: interconsulta.telefono_contacto ? `Tel: ${interconsulta.telefono_contacto}` : 'No proporcionado', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'TIEMPO ESPERADO:', style: 'fieldLabel' },
  //                   { text: interconsulta.tiempo_respuesta_esperado || '48 horas', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'ESTADO:', style: 'fieldLabel' },
  //                   { text: interconsulta.estado_interconsulta || 'Pendiente', style: 'estadoValue', color: this.getColorEstado(interconsulta.estado_interconsulta), margin: [0, 5, 0, 0] }
  //                 ]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15]
  //       },

  //       // MOTIVO DE LA INTERCONSULTA
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: '❓ MOTIVO DE LA INTERCONSULTA',
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
  //                   { text: 'MOTIVO DE INTERCONSULTA:', style: 'fieldLabel' },
  //                   { text: interconsulta.motivo_interconsulta || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'PREGUNTA ESPECÍFICA AL ESPECIALISTA:', style: 'fieldLabel' },
  //                   { text: interconsulta.pregunta_especifica || 'No especificada', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'JUSTIFICACIÓN DE LA INTERCONSULTA:', style: 'fieldLabel' },
  //                   { text: interconsulta.justificacion_interconsulta || 'Evaluación especializada requerida', style: 'fieldValue', margin: [0, 5, 0, 0] }
  //                 ],
  //                 margin: [10, 10]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15]
  //       },

  //       // INFORMACIÓN CLÍNICA
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: '🩺 INFORMACIÓN CLÍNICA DEL PACIENTE',
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
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'RESUMEN DEL CASO:', style: 'fieldLabel' },
  //                   { text: interconsulta.resumen_caso || 'No proporcionado', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'DIAGNÓSTICO PRESUNTIVO:', style: 'fieldLabel' },
  //                   { text: interconsulta.diagnostico_presuntivo || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'SÍNTOMAS PRINCIPALES:', style: 'fieldLabel' },
  //                   { text: interconsulta.sintomas_principales || 'No especificados', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'TIEMPO DE EVOLUCIÓN:', style: 'fieldLabel' },
  //                   { text: interconsulta.tiempo_evolucion || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 0] }
  //                 ],
  //                 margin: [10, 10]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15]
  //       },

  //       // SIGNOS VITALES ACTUALES
  //       ...(this.tieneSignosVitales(interconsulta) ? [
  //         {
  //           table: {
  //             widths: ['100%'],
  //             body: [
  //               [
  //                 {
  //                   text: '💓 SIGNOS VITALES ACTUALES',
  //                   style: 'sectionHeader',
  //                   fillColor: '#ffebee',
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
  //             widths: ['20%', '20%', '20%', '20%', '20%'],
  //             body: [
  //               [
  //                 { text: 'TA', style: 'vitalHeader' },
  //                 { text: 'FC', style: 'vitalHeader' },
  //                 { text: 'FR', style: 'vitalHeader' },
  //                 { text: 'Temp.', style: 'vitalHeader' },
  //                 { text: 'SatO₂', style: 'vitalHeader' }
  //               ],
  //               [
  //                 { text: interconsulta.presion_arterial_actual || '--', style: 'vitalValue' },
  //                 { text: interconsulta.frecuencia_cardiaca_actual ? `${interconsulta.frecuencia_cardiaca_actual} lpm` : '--', style: 'vitalValue' },
  //                 { text: interconsulta.frecuencia_respiratoria_actual ? `${interconsulta.frecuencia_respiratoria_actual} rpm` : '--', style: 'vitalValue' },
  //                 { text: interconsulta.temperatura_actual ? `${interconsulta.temperatura_actual}°C` : '--', style: 'vitalValue' },
  //                 { text: interconsulta.saturacion_oxigeno_actual ? `${interconsulta.saturacion_oxigeno_actual}%` : '--', style: 'vitalValue' }
  //               ]
  //             ]
  //           },
  //           layout: this.getTableLayout(),
  //           margin: [0, 0, 0, 15]
  //         }
  //       ] : []),

  //       // EXPLORACIÓN FÍSICA
  //       ...(interconsulta.exploracion_fisica_relevante ? [
  //         {
  //           table: {
  //             widths: ['100%'],
  //             body: [
  //               [
  //                 {
  //                   stack: [
  //                     { text: 'EXPLORACIÓN FÍSICA RELEVANTE:', style: 'fieldLabel' },
  //                     { text: interconsulta.exploracion_fisica_relevante, style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                     ...(interconsulta.hallazgos_importantes ? [
  //                       { text: 'HALLAZGOS IMPORTANTES:', style: 'fieldLabel' },
  //                       { text: interconsulta.hallazgos_importantes, style: 'fieldValue', margin: [0, 5, 0, 0] }
  //                     ] : [])
  //                   ],
  //                   margin: [10, 10]
  //                 }
  //               ]
  //             ]
  //           },
  //           layout: this.getTableLayout(),
  //           margin: [0, 0, 0, 15]
  //         }
  //       ] : []),

  //       // ESTUDIOS REALIZADOS
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: '🔬 ESTUDIOS REALIZADOS',
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
  //           widths: ['25%', '25%', '50%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'LABORATORIO:', style: 'fieldLabel' },
  //                   { text: interconsulta.examenes_laboratorio ? '✅ SÍ' : '❌ NO', style: 'estudioValue', color: interconsulta.examenes_laboratorio ? '#059669' : '#dc2626' }
  //                 ]
  //               },
  //               {
  //                 stack: [
  //                   { text: 'GABINETE:', style: 'fieldLabel' },
  //                   { text: interconsulta.examenes_gabinete ? '✅ SÍ' : '❌ NO', style: 'estudioValue', color: interconsulta.examenes_gabinete ? '#059669' : '#dc2626' }
  //                 ]
  //               },
  //               {
  //                 stack: [
  //                   { text: 'ESTUDIOS REALIZADOS:', style: 'fieldLabel' },
  //                   { text: interconsulta.estudios_realizados || 'No se han realizado estudios', style: 'fieldValue' }
  //                 ]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 10]
  //       },

  //       ...(interconsulta.resultados_relevantes ? [
  //         {
  //           table: {
  //             widths: ['100%'],
  //             body: [
  //               [
  //                 {
  //                   stack: [
  //                     { text: 'RESULTADOS RELEVANTES:', style: 'fieldLabel' },
  //                     { text: interconsulta.resultados_relevantes, style: 'fieldValue' }
  //                   ],
  //                   margin: [10, 5]
  //                 }
  //               ]
  //             ]
  //           },
  //           layout: this.getTableLayout(),
  //           margin: [0, 0, 0, 15]
  //         }
  //       ] : []),

  //       // TRATAMIENTO ACTUAL
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: '💊 TRATAMIENTO ACTUAL',
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
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: 'TRATAMIENTO ACTUAL:', style: 'fieldLabel' },
  //                   { text: interconsulta.tratamiento_actual || 'Sin tratamiento específico', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'MEDICAMENTOS ACTUALES:', style: 'fieldLabel' },
  //                   { text: interconsulta.medicamentos_actuales || 'Sin medicamentos', style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                   { text: 'ALERGIAS MEDICAMENTOSAS:', style: 'fieldLabel' },
  //                   { text: interconsulta.alergias_medicamentosas || 'Sin alergias conocidas', style: 'fieldValue', margin: [0, 5, 0, 0] }
  //                 ],
  //                 margin: [10, 10]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 15]
  //       },

  //       // NUEVA PÁGINA PARA RESPUESTA
  //       { text: '', pageBreak: 'before' },

  //       // RESPUESTA DEL ESPECIALISTA
  //       {
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 text: '👨‍  RESPUESTA DEL ESPECIALISTA',
  //                 style: 'sectionHeader',
  //                 fillColor: '#e0f2fe',
  //                 margin: [10, 8]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout(),
  //         margin: [0, 0, 0, 10]
  //       },

  //       ...(interconsulta.medico_consultor ? [
  //         {
  //           table: {
  //             widths: ['50%', '50%'],
  //             body: [
  //               [
  //                 {
  //                   stack: [
  //                     { text: 'MÉDICO CONSULTOR:', style: 'fieldLabel' },
  //                     { text: interconsulta.medico_consultor, style: 'fieldValue', margin: [0, 5, 0, 10] },

  //                     { text: 'FECHA DE RESPUESTA:', style: 'fieldLabel' },
  //                     { text: this.formatearFecha(interconsulta.fecha_respuesta), style: 'fieldValue' }
  //                   ]
  //                 },
  //                 {
  //                   stack: [
  //                     { text: 'HORA DE EVALUACIÓN:', style: 'fieldLabel' },
  //                     { text: interconsulta.hora_evaluacion || 'No registrada', style: 'fieldValue', margin: [0, 5, 0, 10] },

  //                     { text: 'ESPECIALIDAD:', style: 'fieldLabel' },
  //                     { text: interconsulta.especialidad_solicitada || 'No especificada', style: 'fieldValue' }
  //                   ]
  //                 }
  //               ]
  //             ]
  //           },
  //           layout: this.getTableLayout(),
  //           margin: [0, 0, 0, 15]
  //         }
  //       ] : [
  //         {
  //           table: {
  //             widths: ['100%'],
  //             body: [
  //               [
  //                 {
  //                   text: '⏳ PENDIENTE DE RESPUESTA DEL ESPECIALISTA',
  //                   style: 'pendienteText',
  //                   alignment: 'center',
  //                   margin: [10, 20]
  //                 }
  //               ]
  //             ]
  //           },
  //           layout: this.getTableLayout(),
  //           margin: [0, 0, 0, 15]
  //         }
  //       ]),

  //       // EVALUACIÓN DEL ESPECIALISTA
  //       ...(interconsulta.impresion_diagnostica ? [
  //         {
  //           table: {
  //             widths: ['100%'],
  //             body: [
  //               [
  //                 {
  //                   stack: [
  //                     { text: 'IMPRESIÓN DIAGNÓSTICA DEL ESPECIALISTA:', style: 'fieldLabel' },
  //                     { text: interconsulta.impresion_diagnostica, style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                     ...(interconsulta.diagnostico_especialista ? [
  //                       { text: 'DIAGNÓSTICO DEL ESPECIALISTA:', style: 'fieldLabel' },
  //                       { text: interconsulta.diagnostico_especialista, style: 'fieldValue', margin: [0, 5, 0, 15] }
  //                     ] : []),

  //                     ...(interconsulta.comentarios_especialista ? [
  //                       { text: 'COMENTARIOS DEL ESPECIALISTA:', style: 'fieldLabel' },
  //                       { text: interconsulta.comentarios_especialista, style: 'fieldValue', margin: [0, 5, 0, 0] }
  //                     ] : [])
  //                   ],
  //                   margin: [10, 10]
  //                 }
  //               ]
  //             ]
  //           },
  //           layout: this.getTableLayout(),
  //           margin: [0, 0, 0, 15]
  //         }
  //       ] : []),

  //       // RECOMENDACIONES
  //       ...(interconsulta.recomendaciones ? [
  //         {
  //           table: {
  //             widths: ['100%'],
  //             body: [
  //               [
  //                 {
  //                   text: '💡 RECOMENDACIONES DEL ESPECIALISTA',
  //                   style: 'sectionHeader',
  //                   fillColor: '#f0fdf4',
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
  //             widths: ['100%'],
  //             body: [
  //               [
  //                 {
  //                   stack: [
  //                     { text: 'RECOMENDACIONES PRINCIPALES:', style: 'fieldLabel' },
  //                     { text: interconsulta.recomendaciones, style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                     ...(interconsulta.plan_manejo ? [
  //                       { text: 'PLAN DE MANEJO:', style: 'fieldLabel' },
  //                       { text: interconsulta.plan_manejo, style: 'fieldValue', margin: [0, 5, 0, 15] }
  //                     ] : []),

  //                     ...(interconsulta.medicamentos_sugeridos ? [
  //                       { text: 'MEDICAMENTOS SUGERIDOS:', style: 'fieldLabel' },
  //                       { text: interconsulta.medicamentos_sugeridos, style: 'fieldValue', margin: [0, 5, 0, 15] }
  //                     ] : []),

  //                     ...(interconsulta.estudios_adicionales ? [
  //                       { text: 'ESTUDIOS ADICIONALES:', style: 'fieldLabel' },
  //                       { text: interconsulta.estudios_adicionales, style: 'fieldValue', margin: [0, 5, 0, 0] }
  //                     ] : [])
  //                   ],
  //                   margin: [10, 10]
  //                 }
  //               ]
  //             ]
  //           },
  //           layout: this.getTableLayout(),
  //           margin: [0, 0, 0, 15]
  //         }
  //       ] : []),

  //       // SEGUIMIENTO
  //       ...(interconsulta.requiere_seguimiento ? [
  //         {
  //           table: {
  //             widths: ['100%'],
  //             body: [
  //               [
  //                 {
  //                   text: '📅 PLAN DE SEGUIMIENTO',
  //                   style: 'sectionHeader',
  //                   fillColor: '#fef3c7',
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
  //                     { text: 'REQUIERE SEGUIMIENTO:', style: 'fieldLabel' },
  //                     { text: '✅ SÍ', style: 'fieldValue', color: '#059669', margin: [0, 5, 0, 10] },

  //                     { text: 'TIPO DE SEGUIMIENTO:', style: 'fieldLabel' },
  //                     { text: interconsulta.tipo_seguimiento || 'No especificado', style: 'fieldValue', margin: [0, 5, 0, 10] },

  //                     { text: 'FRECUENCIA:', style: 'fieldLabel' },
  //                     { text: interconsulta.frecuencia_seguimiento || 'No especificada', style: 'fieldValue' }
  //                   ]
  //                 },
  //                 {
  //                   stack: [
  //                     { text: 'HOSPITALIZACÓN:', style: 'fieldLabel' },
  //                     { text: interconsulta.requiere_hospitalizacion ? '✅ SÍ' : '❌ NO', style: 'fieldValue', color: interconsulta.requiere_hospitalizacion ? '#dc2626' : '#059669', margin: [0, 5, 0, 10] },

  //                     { text: 'CIRUGÍA:', style: 'fieldLabel' },
  //                     { text: interconsulta.requiere_cirugia ? '✅ SÍ' : '❌ NO', style: 'fieldValue', color: interconsulta.requiere_cirugia ? '#dc2626' : '#059669', margin: [0, 5, 0, 10] },

  //                     { text: 'OTRAS ESPECIALIDADES:', style: 'fieldLabel' },
  //                     { text: interconsulta.otras_especialidades || 'No requiere', style: 'fieldValue' }
  //                   ]
  //                 }
  //               ]
  //             ]
  //           },
  //           layout: this.getTableLayout(),
  //           margin: [0, 0, 0, 15]
  //         }
  //       ] : []),

  //       // PRONÓSTICO
  //       ...(interconsulta.pronostico_especialista ? [
  //         {
  //           table: {
  //             widths: ['100%'],
  //             body: [
  //               [
  //                 {
  //                   stack: [
  //                     { text: 'PRONÓSTICO:', style: 'fieldLabel' },
  //                     { text: interconsulta.pronostico_especialista, style: 'fieldValue', margin: [0, 5, 0, 15] },

  //                     ...(interconsulta.signos_alarma ? [
  //                       { text: 'SIGNOS DE ALARMA:', style: 'fieldLabel' },
  //                       { text: interconsulta.signos_alarma, style: 'fieldValue', margin: [0, 5, 0, 0] }
  //                     ] : [])
  //                   ],
  //                   margin: [10, 10]
  //                 }
  //               ]
  //             ]
  //           },
  //           layout: this.getTableLayout(),
  //           margin: [0, 0, 0, 15]
  //         }
  //       ] : []),

  //       // OBSERVACIONES FINALES
  //       ...(interconsulta.observaciones_especialista || interconsulta.observaciones_adicionales ? [
  //         {
  //           table: {
  //             widths: ['100%'],
  //             body: [
  //               [
  //                 {
  //                   text: '💬 OBSERVACIONES ADICIONALES',
  //                   style: 'sectionHeader',
  //                   fillColor: '#f8fafc',
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
  //             widths: ['100%'],
  //             body: [
  //               [
  //                 {
  //                   stack: [
  //                     ...(interconsulta.observaciones_especialista ? [
  //                       { text: 'OBSERVACIONES DEL ESPECIALISTA:', style: 'fieldLabel' },
  //                       { text: interconsulta.observaciones_especialista, style: 'fieldValue', margin: [0, 5, 0, 15] }
  //                     ] : []),

  //                     ...(interconsulta.observaciones_adicionales ? [
  //                       { text: 'OBSERVACIONES ADICIONALES:', style: 'fieldLabel' },
  //                       { text: interconsulta.observaciones_adicionales, style: 'fieldValue', margin: [0, 5, 0, 0] }
  //                     ] : [])
  //                   ],
  //                   margin: [10, 10]
  //                 }
  //               ]
  //             ]
  //           },
  //           layout: this.getTableLayout(),
  //           margin: [0, 0, 0, 20]
  //         }
  //       ] : []),

  //       // FIRMAS
  //       {
  //         table: {
  //           widths: ['50%', '50%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
  //                   { text: 'MÉDICO SOLICITANTE', style: 'signatureLabel' },
  //                   { text: interconsulta.medico_solicitante || medicoCompleto.nombre_completo || 'N/A', style: 'signatureName' },
  //                   { text: `Servicio: ${interconsulta.servicio_solicitante || medicoCompleto.departamento || 'N/A'}`, style: 'signatureDetails' },
  //                   { text: `Cédula: ${medicoCompleto.numero_cedula || 'N/A'}`, style: 'signatureDetails' }
  //                 ]
  //               },
  //               {
  //                 stack: [
  //                   { text: '_'.repeat(40), alignment: 'center', margin: [0, 30, 0, 5] },
  //                   { text: 'MÉDICO CONSULTOR', style: 'signatureLabel' },
  //                   { text: interconsulta.medico_consultor || 'Pendiente de asignar', style: 'signatureName' },
  //                   { text: `Especialidad: ${interconsulta.especialidad_solicitada || 'N/A'}`, style: 'signatureDetails' },
  //                   { text: `Fecha: ${this.formatearFecha(interconsulta.fecha_respuesta) || '________________'}`, style: 'signatureDetails' }
  //                 ]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: 'noBorders'
  //       },

  //       // MENSAJE DE COMPLETADO AL 100%
  //       {
  //         margin: [0, 30, 0, 0],
  //         table: {
  //           widths: ['100%'],
  //           body: [
  //             [
  //               {
  //                 stack: [
  //                   { text: '🎉 SISTEMA SICEG-HG COMPLETADO AL 100% 🎉', style: 'completedTitle', alignment: 'center', margin: [0, 10, 0, 5] },
  //                   { text: '12/12 DOCUMENTOS CLÍNICOS FUNCIONALES', style: 'completedSubtitle', alignment: 'center', margin: [0, 0, 0, 5] },
  //                   { text: 'CUMPLIMIENTO TOTAL NOM-004-SSA3-2012', style: 'completedSubtitle', alignment: 'center', margin: [0, 0, 0, 10] },
  //                   { text: 'Hospital General San Luis de la Paz, Guanajuato', style: 'completedFooter', alignment: 'center' }
  //                 ],
  //                 fillColor: '#f0fdf4',
  //                 margin: [10, 15]
  //               }
  //             ]
  //           ]
  //         },
  //         layout: this.getTableLayout()
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
  //                 text: `Interconsulta - Hospital General San Luis de la Paz`,
  //                 fontSize: 8,
  //                 color: '#666666'
  //               },
  //               {
  //                 text: `Página ${currentPage} de ${pageCount}`,
  //                 fontSize: 8,
  //                 alignment: 'center',
  //                 color: '#666666'
  //               },
  //               {
  //                 text: fechaActual.toLocaleString('es-MX'),
  //                 fontSize: 8,
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
  //         fontSize: 9,
  //         bold: true,
  //         color: '#4b5563'
  //       },
  //       fieldValue: {
  //         fontSize: 9,
  //         color: '#111827'
  //       },
  //       urgenciaValue: {
  //         fontSize: 10,
  //         bold: true
  //       },
  //       estadoValue: {
  //         fontSize: 10,
  //         bold: true
  //       },
  //       estudioValue: {
  //         fontSize: 9,
  //         bold: true
  //       },
  //       vitalHeader: {
  //         fontSize: 8,
  //         bold: true,
  //         color: '#ffffff',
  //         fillColor: '#7c3aed',
  //         alignment: 'center',
  //         margin: [2, 2, 2, 2]
  //       },
  //       vitalValue: {
  //         fontSize: 8,
  //         alignment: 'center',
  //         margin: [2, 2, 2, 2]
  //       },
  //       pendienteText: {
  //         fontSize: 12,
  //         bold: true,
  //         color: '#d97706',
  //         italics: true
  //       },
  //       signatureLabel: {
  //         fontSize: 10,
  //         bold: true,
  //         alignment: 'center',
  //         color: '#374151'
  //       },
  //       signatureName: {
  //         fontSize: 9,
  //         alignment: 'center',
  //         color: '#111827'
  //       },
  //       signatureDetails: {
  //         fontSize: 8,
  //         alignment: 'center',
  //         color: '#6b7280'
  //       },
  //       completedTitle: {
  //         fontSize: 14,
  //         bold: true,
  //         color: '#059669'
  //       },
  //       completedSubtitle: {
  //         fontSize: 10,
  //         bold: true,
  //         color: '#059669'
  //       },
  //       completedFooter: {
  //         fontSize: 8,
  //         color: '#6b7280'
  //       }
  //     }
  //   };
  // }
// C:\Proyectos\CICEG-HG_Frontend\src\app\services\pdf\PdfTemplatesService.ts
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
            fontSize: 10,
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
                fontSize: 8,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
              {
                text: 'MÉDICO ESPECIALISTA',
                fontSize: 8,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
            ],
            [
              {
                text: [
                  { text: `${datos.notaInterconsulta?.medico_solicitante || medicoCompleto.nombre_completo}\n`, fontSize: 9, bold: true },
                  { text: `Médico Solicitante\n`, fontSize: 8 },
                  { text: `Cédula: ${medicoCompleto.numero_cedula || 'No registrada'}\n`, fontSize: 8 },
                  { text: `Servicio: ${datos.notaInterconsulta?.servicio_solicitante || 'No especificado'}\n`, fontSize: 8 },
                  { text: `Contacto: ${datos.notaInterconsulta?.telefono_contacto || 'No registrado'}\n`, fontSize: 7 },
                  { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}`, fontSize: 7 },
                ],
                margin: [5, 20],
                alignment: 'center',
              },
              {
                text: [
                  { text: `${datos.notaInterconsulta?.medico_consultor || 'PENDIENTE DE ASIGNACIÓN'}\n`, fontSize: 9, bold: true },
                  { text: `Médico Especialista\n`, fontSize: 8 },
                  { text: `Área: ${datos.notaInterconsulta?.area_interconsulta || 'No especificada'}\n`, fontSize: 8 },
                  { text: `Fecha Respuesta: ${this.formatearFecha(datos.notaInterconsulta?.fecha_respuesta) || 'PENDIENTE'}\n`, fontSize: 8 },
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
        fontSize: 10, 
        bold: true, 
        margin: [0, 10, 0, 5],
        fillColor: '#f5f5f5'
      },
      boldText: { 
        fontSize: 9, 
        bold: true 
      },
      tableText: { 
        fontSize: 9 
      },
      folioText: {
        fontSize: 10,
        bold: true
      },
      dateText: {
        fontSize: 9
      }
    }
  };
}



// // MÉTODOS AUXILIARES PARA NOTA DE INTERCONSULTA
// private generarNumeroInterconsulta(): string {
//   const fecha = new Date();
//   const timestamp = fecha.getTime().toString().slice(-6);
//   return `IC-${fecha.getFullYear()}-${timestamp}`;
// }




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
            fontSize: 10,
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
                text: datos.notaEgreso?.diagnostico_egreso || 'No especificado', 
                style: 'boldText',
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
                fontSize: 8,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
              {
                text: 'FIRMA AUTÓGRAFA',
                fontSize: 8,
                bold: true,
                fillColor: '#f5f5f5',
                alignment: 'center',
                margin: [2, 5],
              },
            ],
            [
              {
                text: [
                  { text: `${medicoCompleto.nombre_completo || 'Dr(a). [Nombre]'}\n`, fontSize: 9, bold: true },
                  { text: `Médico Responsable del Egreso\n`, fontSize: 8 },
                  { text: `Cédula Profesional: ${medicoCompleto.numero_cedula || 'No registrada'}\n`, fontSize: 8 },
                  { text: `Especialidad: ${medicoCompleto.especialidad || 'No especificada'}\n`, fontSize: 8 },
                  { text: `Hospital General San Luis de la Paz\n`, fontSize: 7, color: '#6b7280' },
                  { text: `Fecha: ${fechaActual.toLocaleDateString('es-MX')}\n`, fontSize: 7 },
                  { text: `Hora: ${fechaActual.toLocaleTimeString('es-MX')}`, fontSize: 7 },
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
        fontSize: 10, 
        bold: true, 
        margin: [0, 10, 0, 5],
        fillColor: '#f5f5f5'
      },
      boldText: { 
        fontSize: 9, 
        bold: true 
      },
      tableText: { 
        fontSize: 9 
      },
      folioText: {
        fontSize: 10,
        bold: true
      },
      dateText: {
        fontSize: 9
      }
    }
  };
}

// MÉTODOS AUXILIARES PARA NOTA DE EGRESO
private generarFolioEgreso(): string {
  const fecha = new Date();
  const timestamp = fecha.getTime().toString().slice(-6);
  return `EGR-${fecha.getFullYear()}-${timestamp}`;
}

}
