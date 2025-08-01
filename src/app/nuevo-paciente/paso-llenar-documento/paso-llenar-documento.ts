// C:\CICEG-HG-APP\src\app\nuevo-paciente\paso-llenar-documento\paso-llenar-documento.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { WizardStateService } from '../../services/wizard-state';
import { DocumentosService } from '../../services/documentos-clinicos/documentos';
import { WizardStep, EstadoWizard } from '../../models/wizard.models';

interface TipoDocumentoInfo {
  id: number;
  nombre: string;
  descripcion: string;
  componenteFormulario: string;
  icono: string;
  color: string;
}

@Component({
  selector: 'app-paso-llenar-documento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './paso-llenar-documento.html',
  styleUrl: './paso-llenar-documento.css'
})
export class PasoLlenarDocumento implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Estados
  isLoading = false;
  progreso = 83.3; // 5/6 * 100
  autoGuardadoStatus = '';
  estadoProceso: 'cargando' | 'llenando' | 'guardando' | 'completado' | 'error' = 'cargando';

  // Datos del documento
  tipoDocumento: TipoDocumentoInfo | null = null;
  documentoCreado: any = null;

  // Datos del paciente para el formulario
  resumenPersona: any = null;
  resumenPaciente: any = null;
  resumenExpediente: any = null;

  // Formulario dinámico
  documentoForm!: FormGroup;
  componenteActual = '';

  constructor(
    private fb: FormBuilder,
    private wizardStateService: WizardStateService,
    private documentosService: DocumentosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExistingData();
    this.validatePreviousSteps();
    this.initializeFormulario();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  private loadExistingData(): void {
    const currentState = this.wizardStateService.getCurrentState();

    console.log('  Estado actual del wizard (paso llenar):', currentState);

    // Cargar datos de pasos anteriores
    this.resumenPersona = currentState.datosPersona;
    this.resumenPaciente = currentState.datosPaciente;
    this.resumenExpediente = currentState.datosExpediente;

    // Obtener información del documento seleccionado
    const tipoDocumento = currentState.datosDocumento?.tipo_documento;
    if (tipoDocumento) {
      this.tipoDocumento = this.mapTipoDocumento(tipoDocumento);
      this.componenteActual = this.tipoDocumento?.componenteFormulario || '';
    }

    // Verificar si ya se creó el documento
    if (currentState.id_documento_creado) {
      this.documentoCreado = {
        id_documento: currentState.id_documento_creado,
        tipo_documento: this.tipoDocumento?.nombre || 'Documento Clínico',
        fecha_elaboracion: new Date().toISOString(),
        estado: 'Borrador'
      };
    }
  }

  private validatePreviousSteps(): void {
    const currentState = this.wizardStateService.getCurrentState();

    console.log('  Validando pasos anteriores...');

    // Verificar que existen todos los IDs necesarios
    if (!currentState.id_expediente_creado) {
      console.error('❌ No hay ID de expediente creado');
      alert('Error: No se encontró el ID del expediente. Regrese al paso anterior.');
      this.wizardStateService.goToPreviousStep();
      return;
    }

    if (!currentState.datosDocumento?.tipo_documento) {
      console.error('❌ No hay tipo de documento seleccionado');
      alert('Error: No se encontró el tipo de documento. Regrese al paso anterior.');
      this.wizardStateService.goToPreviousStep();
      return;
    }

    console.log('  Validación exitosa. Documento:', {
      expediente: currentState.id_expediente_creado,
      documento: currentState.id_documento_creado,
      tipo: currentState.datosDocumento.tipo_documento
    });

    this.estadoProceso = 'llenando';
  }

  private initializeFormulario(): void {
    // Crear formulario base - se completará según el tipo de documento
    this.documentoForm = this.fb.group({
      observaciones_generales: [''],
      fecha_elaboracion: [new Date().toISOString().split('T')[0], Validators.required]
    });

    // Agregar campos específicos según el tipo de documento
    this.agregarCamposEspecificos();
  }

  private agregarCamposEspecificos(): void {
    if (!this.tipoDocumento) return;

    switch (this.tipoDocumento.componenteFormulario) {
      case 'historia-clinica':
        this.agregarCamposHistoriaClinica();
        break;

      case 'nota-urgencias':
        this.agregarCamposNotaUrgencias();
        break;

      case 'nota-evolucion':
        this.agregarCamposNotaEvolucion();
        break;

      case 'nota-egreso':
        this.agregarCamposNotaEgreso();
        break;

      default:
        this.agregarCamposGenericos();
        break;
    }
  }

  // ==========================================
  // CAMPOS ESPECÍFICOS POR TIPO DE DOCUMENTO - CORREGIDOS
  // ==========================================

  private agregarCamposHistoriaClinica(): void {
    // Crear FormGroup para signos vitales por separado
    const signosVitalesGroup = this.fb.group({
      tension_arterial: [''],
      frecuencia_cardiaca: [''],
      frecuencia_respiratoria: [''],
      temperatura: [''],
      saturacion_oxigeno: ['']
    });

    // Agregar controles individuales
    this.documentoForm.addControl('antecedentes_heredofamiliares', this.fb.control(''));
    this.documentoForm.addControl('antecedentes_personales_patologicos', this.fb.control(''));
    this.documentoForm.addControl('antecedentes_personales_no_patologicos', this.fb.control(''));
    this.documentoForm.addControl('padecimiento_actual', this.fb.control('', Validators.required));
    this.documentoForm.addControl('interrogatorio_sistemas', this.fb.control(''));
    this.documentoForm.addControl('signos_vitales', signosVitalesGroup);
    this.documentoForm.addControl('exploracion_fisica', this.fb.control('', Validators.required));
    this.documentoForm.addControl('estudios_laboratorio', this.fb.control(''));
    this.documentoForm.addControl('estudios_gabinete', this.fb.control(''));
    this.documentoForm.addControl('diagnosticos', this.fb.control('', Validators.required));
    this.documentoForm.addControl('plan_tratamiento', this.fb.control('', Validators.required));
  }

  private agregarCamposNotaUrgencias(): void {
    // Crear FormGroup para signos vitales por separado
    const signosVitalesGroup = this.fb.group({
      tension_arterial: [''],
      frecuencia_cardiaca: [''],
      frecuencia_respiratoria: [''],
      temperatura: ['']
    });

    // Agregar controles individuales
    this.documentoForm.addControl('motivo_consulta', this.fb.control('', Validators.required));
    this.documentoForm.addControl('padecimiento_actual', this.fb.control('', Validators.required));
    this.documentoForm.addControl('exploracion_fisica', this.fb.control('', Validators.required));
    this.documentoForm.addControl('signos_vitales', signosVitalesGroup);
    this.documentoForm.addControl('diagnostico_urgencias', this.fb.control('', Validators.required));
    this.documentoForm.addControl('tratamiento_urgencias', this.fb.control('', Validators.required));
    this.documentoForm.addControl('destino_paciente', this.fb.control('', Validators.required));
  }

  private agregarCamposNotaEvolucion(): void {
    // Crear FormGroup para signos vitales por separado
    const signosVitalesGroup = this.fb.group({
      tension_arterial: [''],
      frecuencia_cardiaca: [''],
      frecuencia_respiratoria: [''],
      temperatura: [''],
      saturacion_oxigeno: ['']
    });

    // Agregar controles individuales
    this.documentoForm.addControl('subjetivo', this.fb.control('', Validators.required)); // S del SOAP
    this.documentoForm.addControl('objetivo', this.fb.control('', Validators.required));  // O del SOAP
    this.documentoForm.addControl('analisis', this.fb.control('', Validators.required));  // A del SOAP
    this.documentoForm.addControl('plan', this.fb.control('', Validators.required));      // P del SOAP
    this.documentoForm.addControl('signos_vitales', signosVitalesGroup);
    this.documentoForm.addControl('indicaciones_medicas', this.fb.control(''));
    this.documentoForm.addControl('pronostico', this.fb.control(''));
  }

  private agregarCamposNotaEgreso(): void {
    // Agregar controles individuales
    this.documentoForm.addControl('resumen_hospitalizacion', this.fb.control('', Validators.required));
    this.documentoForm.addControl('diagnostico_ingreso', this.fb.control('', Validators.required));
    this.documentoForm.addControl('diagnostico_egreso', this.fb.control('', Validators.required));
    this.documentoForm.addControl('procedimientos_realizados', this.fb.control(''));
    this.documentoForm.addControl('tratamiento_hospitalario', this.fb.control(''));
    this.documentoForm.addControl('estado_egreso', this.fb.control('', Validators.required));
    this.documentoForm.addControl('indicaciones_egreso', this.fb.control('', Validators.required));
    this.documentoForm.addControl('medicamentos_egreso', this.fb.control(''));
    this.documentoForm.addControl('citas_seguimiento', this.fb.control(''));
    this.documentoForm.addControl('recomendaciones', this.fb.control(''));
  }

  private agregarCamposGenericos(): void {
    // Agregar controles individuales
    this.documentoForm.addControl('contenido_documento', this.fb.control('', Validators.required));
    this.documentoForm.addControl('conclusiones', this.fb.control(''));
    this.documentoForm.addControl('recomendaciones', this.fb.control(''));
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  private mapTipoDocumento(tipoId: number): TipoDocumentoInfo {
    const tiposMap: { [key: number]: TipoDocumentoInfo } = {
      1: {
        id: 1,
        nombre: 'Historia Clínica',
        descripcion: 'Documento principal con antecedentes completos del paciente',
        componenteFormulario: 'historia-clinica',
        icono: 'fas fa-file-medical-alt',
        color: 'blue'
      },
      2: {
        id: 2,
        nombre: 'Nota de Urgencias',
        descripcion: 'Atención médica de urgencia',
        componenteFormulario: 'nota-urgencias',
        icono: 'fas fa-ambulance',
        color: 'red'
      },
      3: {
        id: 3,
        nombre: 'Nota de Evolución',
        descripcion: 'Seguimiento del paciente hospitalizado',
        componenteFormulario: 'nota-evolucion',
        icono: 'fas fa-chart-line',
        color: 'green'
      },
      4: {
        id: 4,
        nombre: 'Nota de Egreso',
        descripcion: 'Resumen de alta hospitalaria',
        componenteFormulario: 'nota-egreso',
        icono: 'fas fa-sign-out-alt',
        color: 'indigo'
      }
    };

    return tiposMap[tipoId] || {
      id: tipoId,
      nombre: 'Documento Clínico',
      descripcion: 'Documento clínico genérico',
      componenteFormulario: 'generico',
      icono: 'fas fa-file-medical',
      color: 'gray'
    };
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

  getColorClase(color: string): string {
    const colores: { [key: string]: string } = {
      'blue': 'border-blue-200 bg-blue-50 text-blue-800',
      'red': 'border-red-200 bg-red-50 text-red-800',
      'green': 'border-green-200 bg-green-50 text-green-800',
      'indigo': 'border-indigo-200 bg-indigo-50 text-indigo-800',
      'gray': 'border-gray-200 bg-gray-50 text-gray-800'
    };
    return colores[color] || colores['gray'];
  }

  // ==========================================
  // ACCIONES
  // ==========================================

  onSubmit(): void {
    console.log('  Guardando documento...');

    if (this.documentoForm.valid && !this.isLoading) {
      this.guardarDocumento();
    } else {
      console.log('❌ Formulario inválido');
      this.markAllFieldsAsTouched();
    }
  }

  private guardarDocumento(): void {
    this.isLoading = true;
    this.estadoProceso = 'guardando';
    this.autoGuardadoStatus = 'Guardando contenido del documento...';

    try {
      const formData = this.documentoForm.value;

      // TODO: Aquí iría la lógica real para actualizar el documento con el contenido
      // Por ahora simulamos guardado exitoso
      console.log('  Datos del formulario a guardar:', formData);

      // Simular llamada al backend
      setTimeout(() => {
        this.isLoading = false;
        this.estadoProceso = 'completado';
        this.autoGuardadoStatus = '  Documento guardado exitosamente';

        // Marcar paso como completado
        this.wizardStateService.markStepAsCompleted(WizardStep.LLENAR_DOCUMENTO);

        console.log('  Documento completado:', formData);

        // Navegar al resumen después de una breve pausa
        setTimeout(() => {
          this.wizardStateService.goToNextStep();
        }, 2000);

      }, 1500); // Simular tiempo de guardado

    } catch (error) {
      console.error('❌ Error al guardar documento:', error);
      this.isLoading = false;
      this.estadoProceso = 'error';
      this.autoGuardadoStatus = '❌ Error al guardar documento';
    }
  }

  guardarBorrador(): void {
    if (!this.isLoading && this.documentoForm.dirty) {
      console.log('💾 Guardando borrador del documento...');

      // Lógica de auto-guardado (opcional)
      this.autoGuardadoStatus = '💾 Borrador guardado automáticamente';

      setTimeout(() => {
        this.autoGuardadoStatus = '';
      }, 3000);
    }
  }

  goBack(): void {
    console.log('⬅️ Navegando hacia atrás');

    // Guardar borrador antes de salir si hay cambios
    if (this.documentoForm.dirty) {
      console.log('💾 Guardando borrador antes de salir');
      this.guardarBorrador();
    }

    // Navegar al paso anterior
    this.wizardStateService.goToPreviousStep();
  }

  continuar(): void {
    console.log('➡️ Continuando al resumen');
    this.wizardStateService.goToNextStep();
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.documentoForm.controls).forEach(key => {
      const control = this.documentoForm.get(key);
      if (control) {
        control.markAsTouched();

        // Si es un FormGroup (como signos_vitales), marcar sus controles también
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(subKey => {
            control.get(subKey)?.markAsTouched();
          });
        }
      }
    });
  }

  // ==========================================
  // GETTERS PARA TEMPLATE
  // ==========================================

  /** Verificar si el formulario está listo para enviar */
  get canSubmit(): boolean {
    return this.documentoForm.valid && !this.isLoading && this.estadoProceso === 'llenando';
  }

  /** Verificar si se puede continuar al siguiente paso */
  get canContinue(): boolean {
    return this.estadoProceso === 'completado' && !this.isLoading;
  }

  /** Verificar si se puede guardar borrador */
  get canSaveDraft(): boolean {
    return this.documentoForm.dirty && !this.isLoading && this.estadoProceso === 'llenando';
  }

  /** Obtener título del documento */
  get tituloDocumento(): string {
    return this.tipoDocumento?.nombre || 'Documento Clínico';
  }

  /** Verificar si debe mostrar campos específicos */
  get esHistoriaClinica(): boolean {
    return this.componenteActual === 'historia-clinica';
  }

  get esNotaUrgencias(): boolean {
    return this.componenteActual === 'nota-urgencias';
  }

  get esNotaEvolucion(): boolean {
    return this.componenteActual === 'nota-evolucion';
  }

  get esNotaEgreso(): boolean {
    return this.componenteActual === 'nota-egreso';
  }

  get esDocumentoGenerico(): boolean {
    return this.componenteActual === 'generico' || !this.componenteActual;
  }
}
