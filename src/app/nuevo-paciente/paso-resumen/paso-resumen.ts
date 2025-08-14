// C:\CICEG-HG-APP\src\app\nuevo-paciente\paso-resumen\paso-resumen.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { WizardStateService } from '../../services/wizard-state';
import { WizardStep, EstadoWizard } from '../../models/wizard.models';

interface ResumenCompleto {
  persona: any;
  paciente: any;
  expediente: any;
  documento: any;
  ids: {
    id_persona: number | undefined;
    id_paciente: number | undefined;
    id_expediente: number | undefined;
    id_documento: number | undefined;
  };
  fechas: {
    inicio: string;
    finalizacion: string;
    duracion: string;
  };
}

@Component({
  selector: 'app-paso-resumen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paso-resumen.html',
  styleUrl: './paso-resumen.css'
})
export class PasoResumen implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Estados
  isLoading = false;
  progreso = 100; // 6/6 * 100
  estadoProceso: 'mostrando' | 'finalizando' | 'completado' | 'error' = 'mostrando';
  autoGuardadoStatus = '';

  // Datos del resumen
  resumen: ResumenCompleto | null = null;
  expedienteCompleto = false;

  constructor(
    private wizardStateService: WizardStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadResumenCompleto();
    this.validateWizard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  private loadResumenCompleto(): void {
    const currentState = this.wizardStateService.getCurrentState();

    console.log('  Estado final del wizard:', currentState);

    // Construir resumen completo
    this.resumen = {
      persona: currentState.datosPersona,
      paciente: currentState.datosPaciente,
      expediente: currentState.datosExpediente,
      documento: currentState.datosDocumento,
      ids: {
        id_persona: currentState.id_persona_creada,
        id_paciente: currentState.id_paciente_creado,
        id_expediente: currentState.id_expediente_creado,
        id_documento: currentState.id_documento_creado
      },
      fechas: {
        inicio: currentState.fechaInicio,
        finalizacion: new Date().toISOString(),
        duracion: this.calcularDuracion(currentState.fechaInicio)
      }
    };

    // Verificar si el expediente está completo
    this.expedienteCompleto = !!(
      this.resumen.ids.id_persona &&
      this.resumen.ids.id_paciente &&
      this.resumen.ids.id_expediente &&
      this.resumen.ids.id_documento
    );

    console.log('  Resumen completo:', this.resumen);
    console.log('  Expediente completo:', this.expedienteCompleto);
  }

  private validateWizard(): void {
    const validation = this.wizardStateService.validateWizard();

    if (!validation.canProceed) {
      console.error('❌ Validación del wizard falló:', validation.globalErrors);
      this.estadoProceso = 'error';
      this.autoGuardadoStatus = '❌ El proceso no está completo';
      return;
    }

    if (!this.expedienteCompleto) {
      console.error('❌ Expediente incompleto');
      this.estadoProceso = 'error';
      this.autoGuardadoStatus = '❌ Faltan datos del expediente';
      return;
    }

    console.log('  Validación exitosa del wizard completo');
    this.estadoProceso = 'mostrando';
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  private calcularDuracion(fechaInicio: string): string {
    const inicio = new Date(fechaInicio);
    const fin = new Date();
    const diffMs = fin.getTime() - inicio.getTime();

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const horas = Math.floor(diffMins / 60);
    const minutos = diffMins % 60;

    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    } else {
      return `${minutos}m`;
    }
  }

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;

    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'No disponible';

    try {
      return new Date(fecha).toLocaleString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return fecha;
    }
  }

  formatearFechaCorta(fecha: string): string {
    if (!fecha) return 'No disponible';

    try {
      return new Date(fecha).toLocaleDateString('es-MX');
    } catch (error) {
      return fecha;
    }
  }

  getNombreCompleto(): string {
    if (!this.resumen?.persona) return 'No disponible';

    const { nombre, apellido_paterno, apellido_materno } = this.resumen.persona;
    return `${nombre} ${apellido_paterno} ${apellido_materno || ''}`.trim();
  }

  getTipoDocumento(): string {
    if (!this.resumen?.documento?.tipo_documento) return 'No disponible';

    // Mapear ID a nombre
    const tiposMap: { [key: number]: string } = {
      1: 'Historia Clínica',
      2: 'Nota de Urgencias',
      3: 'Nota de Evolución',
      4: 'Nota de Egreso'
    };

    return tiposMap[this.resumen.documento.tipo_documento] || `Documento #${this.resumen.documento.tipo_documento}`;
  }

  // ==========================================
  // ACCIONES
  // ==========================================

  finalizarProceso(): void {
    console.log('   Finalizando proceso del wizard...');

    this.isLoading = true;
    this.estadoProceso = 'finalizando';
    this.autoGuardadoStatus = 'Finalizando expediente...';

    try {
      // Marcar wizard como completado
      this.wizardStateService.setWizardEstado(EstadoWizard.COMPLETADO);
      this.wizardStateService.markStepAsCompleted(WizardStep.RESUMEN);

      // Simular finalización
      setTimeout(() => {
        this.isLoading = false;
        this.estadoProceso = 'completado';
        this.autoGuardadoStatus = '   ¡Expediente creado exitosamente!';

        console.log('   Proceso completado exitosamente');
        console.log('  Resumen final:', this.resumen);

        // Navegar al dashboard después de un momento
        setTimeout(() => {
          this.irAlDashboard();
        }, 3000);

      }, 2000);

    } catch (error) {
      console.error('❌ Error al finalizar proceso:', error);
      this.isLoading = false;
      this.estadoProceso = 'error';
      this.autoGuardadoStatus = '❌ Error al finalizar el proceso';
    }
  }

  crearNuevoExpediente(): void {
    console.log('  Iniciando nuevo expediente...');

    // Limpiar wizard state
    this.wizardStateService.resetWizard();

    // Redirigir al inicio del wizard
    this.router.navigate(['/app/nuevo-paciente']);
  }

  irAlDashboard(): void {
    console.log('🏠 Regresando al dashboard...');

    // Limpiar wizard state
    this.wizardStateService.resetWizard();

    // Redirigir al dashboard
    this.router.navigate(['/app/dashboard']);
  }

  editarPaso(paso: WizardStep): void {
    console.log('✏️ Editando paso:', paso);

    // Ir al paso específico
    this.wizardStateService.goToStep(paso);
  }

  imprimirResumen(): void {
    console.log('🖨️ Imprimiendo resumen...');

    // Implementar lógica de impresión
    window.print();
  }

  descargarResumen(): void {
    console.log('💾 Descargando resumen...');

    // Crear contenido para descarga
    const contenido = this.generarContenidoDescarga();

    // Crear y descargar archivo
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expediente_${this.resumen?.ids.id_expediente}_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private generarContenidoDescarga(): string {
    if (!this.resumen) return 'No hay datos disponibles';

    return `
RESUMEN DE EXPEDIENTE CLÍNICO
Hospital General San Luis de la Paz, Guanajuato
================================

INFORMACIÓN DEL PACIENTE
-------------------------
Nombre: ${this.getNombreCompleto()}
CURP: ${this.resumen.persona.curp || 'No disponible'}
Fecha de Nacimiento: ${this.formatearFechaCorta(this.resumen.persona.fecha_nacimiento)}
Edad: ${this.calcularEdad(this.resumen.persona.fecha_nacimiento)} años
Género: ${this.resumen.persona.genero || 'No disponible'}
Teléfono: ${this.resumen.persona.telefono || 'No disponible'}

INFORMACIÓN MÉDICA
------------------
Tipo de Sangre: ${this.resumen.paciente.tipo_sangre || 'No disponible'}
Alergias: ${this.resumen.paciente.alergias || 'Ninguna conocida'}
Transfusiones: ${this.resumen.paciente.transfusiones || 'No'}
Familiar Responsable: ${this.resumen.paciente.familiar_responsable || 'No disponible'}
Teléfono Familiar: ${this.resumen.paciente.telefono_familiar || 'No disponible'}

EXPEDIENTE
----------
ID Expediente: ${this.resumen.ids.id_expediente}
Número: ${this.resumen.expediente.numero_expediente || 'Generado automáticamente'}
Estado: ${this.resumen.expediente.estado || 'Activo'}
Fecha de Apertura: ${this.formatearFecha(this.resumen.fechas.inicio)}

DOCUMENTO CLÍNICO
-----------------
ID Documento: ${this.resumen.ids.id_documento}
Tipo: ${this.getTipoDocumento()}
Fecha de Elaboración: ${this.formatearFecha(this.resumen.documento.fecha_elaboracion)}
Observaciones: ${this.resumen.documento.observaciones || 'Ninguna'}

INFORMACIÓN DEL PROCESO
-----------------------
Fecha de Inicio: ${this.formatearFecha(this.resumen.fechas.inicio)}
Fecha de Finalización: ${this.formatearFecha(this.resumen.fechas.finalizacion)}
Duración Total: ${this.resumen.fechas.duracion}

================================
Generado automáticamente por CICEG-HG
${this.formatearFecha(new Date().toISOString())}
    `.trim();
  }

  // ==========================================
  // GETTERS PARA TEMPLATE
  // ==========================================

  get puedeImprimir(): boolean {
    return this.estadoProceso === 'mostrando' && this.expedienteCompleto;
  }

  get puedeDescargar(): boolean {
    return this.estadoProceso === 'mostrando' && this.expedienteCompleto;
  }

  get puedeEditar(): boolean {
    return this.estadoProceso === 'mostrando';
  }

  get puedeFinalizarProceso(): boolean {
    return this.estadoProceso === 'mostrando' && this.expedienteCompleto && !this.isLoading;
  }

  get mostrarErrores(): boolean {
    return this.estadoProceso === 'error';
  }

  get procesoCompletado(): boolean {
    return this.estadoProceso === 'completado';
  }

  // ==========================================
  // INFORMACIÓN DE PASOS PARA NAVEGACIÓN
  // ==========================================

  get pasosCompletados() {
    const currentState = this.wizardStateService.getCurrentState();
    return [
      {
        paso: WizardStep.PERSONA,
        titulo: 'Datos Personales',
        completado: currentState.completedSteps.includes(WizardStep.PERSONA),
        icono: 'fas fa-user',
        datos: this.resumen?.persona
      },
      {
        paso: WizardStep.PACIENTE,
        titulo: 'Información Médica',
        completado: currentState.completedSteps.includes(WizardStep.PACIENTE),
        icono: 'fas fa-heartbeat',
        datos: this.resumen?.paciente
      },
      {
        paso: WizardStep.EXPEDIENTE,
        titulo: 'Expediente',
        completado: currentState.completedSteps.includes(WizardStep.EXPEDIENTE),
        icono: 'fas fa-folder-open',
        datos: this.resumen?.expediente
      },
      {
        paso: WizardStep.DOCUMENTO_CLINICO,
        titulo: 'Documento Clínico',
        completado: currentState.completedSteps.includes(WizardStep.DOCUMENTO_CLINICO),
        icono: 'fas fa-file-medical',
        datos: this.resumen?.documento
      },
      {
        paso: WizardStep.LLENAR_DOCUMENTO,
        titulo: 'Contenido del Documento',
        completado: currentState.completedSteps.includes(WizardStep.LLENAR_DOCUMENTO),
        icono: 'fas fa-edit',
        datos: null
      }
    ];
  }
}
