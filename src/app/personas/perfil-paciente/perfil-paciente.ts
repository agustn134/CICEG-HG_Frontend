// src/app/personas/perfil-paciente/perfil-paciente.ts - VERSIÓN CORREGIDA
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, Observable, firstValueFrom, switchMap, catchError, of } from 'rxjs';

// Servicios - USANDO TUS SERVICIOS EXISTENTES
import { ExpedientesService } from '../../services/gestion-expedientes/expedientes';
import { PacientesService } from '../../services/personas/pacientes';
import { DocumentosService } from '../../services/documentos-clinicos/documentos';
import { HistoriasClinicasService } from '../../services/documentos-clinicos/historias-clinicas';
import { NotasUrgenciasService } from '../../services/documentos-clinicos/notas-urgencias';
import { NotasEvolucionService } from '../../services/documentos-clinicos/notas-evolucion';
import { NotasEgresoService } from '../../services/documentos-clinicos/notas-egreso';
import { SignosVitalesService } from '../../services/gestion-expedientes/signos-vitales';

// Servicios de catálogos - USANDO TUS SERVICIOS EXISTENTES
import { ServiciosService } from '../../services/catalogos/servicios';
import { TiposDocumentoService } from '../../services/catalogos/tipos-documento';
import { PersonalMedicoService } from '../../services/personas/personal-medico';

// Modelos - USANDO TUS MODELOS EXISTENTES
import { Paciente } from '../../models/paciente.model';
import { Expediente } from '../../models/expediente.model';
import { DocumentoClinico } from '../../models/documento-clinico.model';
import { SignosVitales, CreateSignosVitalesDto } from '../../models/signos-vitales.model';
import { CreateHistoriaClinicaDto } from '../../models/historia-clinica.model';
import { CreateNotaUrgenciasDto } from '../../models/nota-urgencias.model';
import { CreateNotaEvolucionDto } from '../../models/nota-evolucion.model';
import { TipoDocumento } from '../../models/tipo-documento.model';
import { Servicio } from '../../models/servicio.model';
import { ApiResponse, EstadoDocumento } from '../../models/base.models';

// ==========================================
// INTERFACES MEJORADAS CON TIPOS SEGUROS
// ==========================================

interface PacienteCompleto {
  persona: any;
  paciente: Paciente;
  expediente: Expediente;
  documentos: DocumentoClinico[] | null;
  ultimoInternamiento: any;
  signosVitales: SignosVitales[] | null;
}

interface TipoDocumentoDisponible {
  id_tipo_documento: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  requiereInternamiento: boolean;
  orden: number;
  activo: boolean;
}

interface FormularioEstado {
  signosVitales: boolean;
  historiaClinica: boolean;
  notaUrgencias: boolean;
  notaEvolucion: boolean;
  [key: string]: boolean;
}

@Component({
  selector: 'app-perfil-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil-paciente.html',
  styleUrl: './perfil-paciente.css'
})
export class PerfilPaciente implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // ==========================================
  // DATOS DEL PACIENTE
  // ==========================================
  pacienteCompleto: PacienteCompleto | null = null;
  pacienteId: number | null = null;
  medicoActual: number | null = null; // ID del médico conectado

  // ==========================================
  // ESTADOS DE CARGA
  // ==========================================
  isLoading = true;
  isCreatingDocument = false;
  error: string | null = null;
  success: string | null = null;

  // ==========================================
  // FORMULARIOS - INICIALIZADOS EN EL CONSTRUCTOR
  // ==========================================
  signosVitalesForm: FormGroup;
  historiaClinicaForm: FormGroup;
  notaUrgenciasForm: FormGroup;
  notaEvolucionForm: FormGroup;

  // ==========================================
  // ESTADOS DE FORMULARIOS
  // ==========================================
  formularioActivo: string = 'signosVitales'; // Empezar con signos vitales
  formularioEstado: FormularioEstado = {
    signosVitales: false,
    historiaClinica: false,
    notaUrgencias: false,
    notaEvolucion: false
  };

  // ==========================================
  // CATÁLOGOS - USANDO TUS MODELOS
  // ==========================================
  tiposDocumentosDisponibles: TipoDocumentoDisponible[] = [];
  personalMedico: any[] = [];
  servicios: Servicio[] = [];

  // ==========================================
  // DOCUMENTO CLÍNICO ACTUAL
  // ==========================================
  documentoClinicoActual: number | null = null; // ID del documento padre

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    // Servicios principales
    private expedientesService: ExpedientesService,
    private pacientesService: PacientesService,
    private documentosService: DocumentosService,
    private signosVitalesService: SignosVitalesService,
    // Servicios de documentos específicos
    private historiasClinicasService: HistoriasClinicasService,
    private notasUrgenciasService: NotasUrgenciasService,
    private notasEvolucionService: NotasEvolucionService,
    private notasEgresoService: NotasEgresoService,
    // Servicios de catálogos
    private serviciosService: ServiciosService,
    private tiposDocumentoService: TiposDocumentoService,
    private personalMedicoService: PersonalMedicoService
  ) {
    // ✅ INICIALIZAR FORMULARIOS EN EL CONSTRUCTOR
    this.signosVitalesForm = this.initializeSignosVitalesForm();
    this.historiaClinicaForm = this.initializeHistoriaClinicaForm();
    this.notaUrgenciasForm = this.initializeNotaUrgenciasForm();
    this.notaEvolucionForm = this.initializeNotaEvolucionForm();
  }

  // ==========================================
  // GETTERS PARA VERIFICACIONES TYPE-SAFE
  // ==========================================

  get documentosDisponibles(): DocumentoClinico[] {
    return this.pacienteCompleto?.documentos || [];
  }

  get tieneDocumentos(): boolean {
    return this.documentosDisponibles.length > 0;
  }

  get signosVitalesDisponibles(): SignosVitales[] {
    return this.pacienteCompleto?.signosVitales || [];
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  ngOnInit(): void {
    // Obtener ID del paciente desde la ruta
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.pacienteId = parseInt(id, 10);
        this.initializeComponent();
      } else {
        this.error = 'ID de paciente no válido';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.isLoading = true;
    this.error = null;

    // Obtener médico actual (simulado por ahora)
    this.medicoActual = 9; // ID del Dr. que está conectado

    // Cargar todos los datos necesarios
    forkJoin({
      paciente: this.cargarDatosPaciente(),
      catalogos: this.cargarCatalogos()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.construirPacienteCompleto(data.paciente);
        this.procesarCatalogos(data.catalogos);
        this.isLoading = false;
        console.log('✅ Componente inicializado correctamente');
        console.log('🏥 Datos del paciente:', this.pacienteCompleto);
        console.log('📋 Catálogos cargados:', data.catalogos);
      },
      error: (error) => {
        console.error('❌ Error al inicializar componente:', error);
        this.error = 'Error al cargar la información del paciente';
        this.isLoading = false;
      }
    });
  }

  // ==========================================
  // INICIALIZACIÓN DE FORMULARIOS
  // ==========================================

  private initializeSignosVitalesForm(): FormGroup {
    return this.fb.group({
      temperatura: [null, [Validators.min(30), Validators.max(45)]],
      presion_arterial_sistolica: [null, [Validators.min(60), Validators.max(250)]],
      presion_arterial_diastolica: [null, [Validators.min(30), Validators.max(150)]],
      frecuencia_cardiaca: [null, [Validators.required, Validators.min(40), Validators.max(200)]],
      frecuencia_respiratoria: [null, [Validators.required, Validators.min(10), Validators.max(60)]],
      saturacion_oxigeno: [null, [Validators.min(70), Validators.max(100)]],
      peso: [null, [Validators.min(0.5), Validators.max(300)]],
      talla: [null, [Validators.min(30), Validators.max(250)]],
      glucosa: [null, [Validators.min(30), Validators.max(600)]],
      observaciones: ['']
    });
  }

  private initializeHistoriaClinicaForm(): FormGroup {
    return this.fb.group({
      antecedentes_heredo_familiares: ['', Validators.required],
      habitos_higienicos: [''],
      habitos_alimenticios: [''],
      actividad_fisica: [''],
      ocupacion: [''],
      vivienda: [''],
      toxicomanias: [''],
      padecimiento_actual: ['', Validators.required],
      sintomas_generales: [''],
      aparatos_sistemas: [''],
      exploracion_general: ['', Validators.required],
      exploracion_cabeza: [''],
      exploracion_cuello: [''],
      exploracion_torax: [''],
      exploracion_abdomen: [''],
      exploracion_extremidades: [''],
      impresion_diagnostica: ['', Validators.required],
      plan_diagnostico: [''],
      plan_terapeutico: ['', Validators.required],
      pronostico: ['', Validators.required]
    });
  }

  private initializeNotaUrgenciasForm(): FormGroup {
    return this.fb.group({
      motivo_atencion: ['', Validators.required],
      estado_conciencia: ['', Validators.required],
      resumen_interrogatorio: ['', Validators.required],
      exploracion_fisica: ['', Validators.required],
      resultados_estudios: [''],
      estado_mental: [''],
      diagnostico: ['', Validators.required],
      plan_tratamiento: ['', Validators.required],
      pronostico: ['', Validators.required]
    });
  }

  private initializeNotaEvolucionForm(): FormGroup {
    return this.fb.group({
      subjetivo: ['', Validators.required],
      objetivo: ['', Validators.required],
      analisis: ['', Validators.required],
      plan: ['', Validators.required]
    });
  }

  // ==========================================
  // CARGA DE DATOS - ✅ CORREGIDO: URLs EXACTAS
  // ==========================================

  private cargarDatosPaciente(): Observable<any> {
    if (!this.pacienteId) {
      throw new Error('ID de paciente no válido');
    }

    return forkJoin({
      // ✅ MÉTODO VERIFICADO: getPacienteById existe en PacientesService
      paciente: this.pacientesService.getPacienteById(this.pacienteId),

      // ✅ MÉTODO VERIFICADO: getExpedienteByPacienteId existe
      expediente: this.expedientesService.getExpedienteByPacienteId(this.pacienteId),

      // ✅ MÉTODO CORREGIDO: Obtener documentos via expediente
      documentos: this.obtenerDocumentosPorPaciente(this.pacienteId),

      // ✅ MÉTODO VERIFICADO: getSignosVitalesByPacienteId existe
      signosVitales: this.signosVitalesService.getSignosVitalesByPacienteId(this.pacienteId)
    }).pipe(
      takeUntil(this.destroy$)
    );
  }

  // ✅ MÉTODO HELPER PARA OBTENER DOCUMENTOS
  private obtenerDocumentosPorPaciente(idPaciente: number): Observable<any> {
    // Primero obtener el expediente, luego los documentos
    return this.expedientesService.getExpedienteByPacienteId(idPaciente).pipe(
      switchMap(expedienteResponse => {
        if (expedienteResponse.success && expedienteResponse.data?.id_expediente) {
          // ✅ USAR el método que SÍ existe
          return this.documentosService.getDocumentosByExpediente(expedienteResponse.data.id_expediente);
        } else {
          // ✅ Retornar array vacío si no hay expediente
          return of({
            success: true,
            message: 'Sin documentos',
            data: []
          });
        }
      }),
      catchError(error => {
        console.error('Error al obtener documentos:', error);
        return of({
          success: false,
          message: 'Error al obtener documentos',
          data: []
        });
      })
    );
  }

 private cargarCatalogos(): Observable<any> {
  return forkJoin({
    // ✅ MÉTODO VERIFICADO: getAll existe en TiposDocumentoService
    tiposDocumento: this.tiposDocumentoService.getAll(),

    // ✅ CORREGIDO: Usar getPersonalMedico() según el service que me mostraste
    personalMedico: this.personalMedicoService.getPersonalMedico(),

    // ✅ MÉTODO VERIFICADO: getAll existe en ServiciosService
    servicios: this.serviciosService.getAll()
  }).pipe(
    takeUntil(this.destroy$)
  );
}

  // ==========================================
  // PROCESAMIENTO DE DATOS - MEJORADO
  // ==========================================

  private construirPacienteCompleto(data: any): void {
    // ✅ MANEJO SEGURO DE RESPUESTAS API
    this.pacienteCompleto = {
      persona: data.paciente?.data || {},
      paciente: data.paciente?.data || {},
      expediente: data.expediente?.data || {},
      documentos: Array.isArray(data.documentos?.data) ? data.documentos.data : [], // ✅ Array vacío por defecto
      ultimoInternamiento: null, // Se obtendría del endpoint correspondiente
      signosVitales: Array.isArray(data.signosVitales?.data) ? data.signosVitales.data : [] // ✅ Array vacío por defecto
    };

    // Pre-llenar formularios con datos existentes
    this.preLlenarFormularios();
  }

  private procesarCatalogos(data: any): void {
    // ✅ PROCESAMIENTO SEGURO DE CATÁLOGOS
    this.tiposDocumentosDisponibles = (data.tiposDocumento?.data || []).map((tipo: TipoDocumento, index: number) => ({
      id_tipo_documento: tipo.id_tipo_documento,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion || '',
      icono: this.getIconoTipoDocumento(tipo.nombre),
      color: this.getColorTipoDocumento(tipo.nombre),
      requiereInternamiento: this.requiereInternamiento(tipo.nombre),
      orden: index + 1,
      activo: tipo.activo
    }));

    this.personalMedico = data.personalMedico?.data || [];
    this.servicios = data.servicios?.data || [];
  }

  private preLlenarFormularios(): void {
    if (!this.pacienteCompleto) return;

    // Pre-llenar datos del paciente en Historia Clínica
    if (this.pacienteCompleto.paciente && this.pacienteCompleto.persona) {
      this.historiaClinicaForm.patchValue({
        ocupacion: this.pacienteCompleto.paciente.ocupacion || '',
      });
    }

    // Pre-llenar signos vitales si ya existen
    const ultimosSignos = this.signosVitalesDisponibles[0];
    if (ultimosSignos) {
      this.signosVitalesForm.patchValue({
        peso: ultimosSignos.peso,
        talla: ultimosSignos.talla
      });
    }
  }

  private tieneFormularioActivo(): boolean {
    const formularios = ['signosVitales', 'historiaClinica', 'notaUrgencias', 'notaEvolucion'];
    return formularios.includes(this.formularioActivo);
  }

  // ==========================================
// GUARDAR DOCUMENTOS -
// ==========================================

async guardarFormularioActivo(): Promise<void> {
  if (this.isCreatingDocument) return;

  this.isCreatingDocument = true;
  this.error = null;
  this.success = null;

  try {
    switch (this.formularioActivo) {
      case 'signosVitales':
        await this.guardarSignosVitales();
        break;
      case 'historiaClinica':
        await this.guardarHistoriaClinica();
        break;
      case 'notaUrgencias':
        await this.guardarNotaUrgencias();
        break;
      case 'notaEvolucion':
        await this.guardarNotaEvolucion();
        break;
      default:
        throw new Error('Tipo de formulario no válido');
    }

    // ✅ MARCAR FORMULARIO COMO COMPLETADO INMEDIATAMENTE
    this.formularioEstado[this.formularioActivo] = true;

    // ✅ MOSTRAR SUCCESS INMEDIATAMENTE
    this.success = `${this.getTituloFormulario(this.formularioActivo)} guardado correctamente`;

    console.log('✅ Formulario completado:', this.formularioActivo);
    console.log('✅ Estado actualizado:', this.formularioEstado);

    // ✅ ACTUALIZAR DATOS DEL PACIENTE
    this.cargarDatosPaciente().subscribe(data => {
      this.construirPacienteCompleto(data);
    });

    // 🎯 AVANZAR AUTOMÁTICAMENTE AL SIGUIENTE PASO
    setTimeout(() => {
      this.avanzarAlSiguientePaso();
    }, 1500); // Esperar 1.5 segundos para que el usuario vea el éxito

  } catch (error) {
    console.error(`❌ Error al guardar ${this.formularioActivo}:`, error);
    this.error = `Error al guardar ${this.formularioActivo}`;
  } finally {
    // ✅ RESETEAR BOTÓN INMEDIATAMENTE
    this.isCreatingDocument = false;
  }
}

// ==========================================
// NUEVO MÉTODO: AVANZAR AL SIGUIENTE PASO
// ==========================================

private avanzarAlSiguientePaso(): void {
  const secuenciaFormularios = ['signosVitales', 'historiaClinica', 'notaUrgencias', 'notaEvolucion'];
  const indiceActual = secuenciaFormularios.indexOf(this.formularioActivo);

  if (indiceActual !== -1 && indiceActual < secuenciaFormularios.length - 1) {
    const siguienteFormulario = secuenciaFormularios[indiceActual + 1];
    console.log(`🎯 Avanzando de ${this.formularioActivo} a ${siguienteFormulario}`);
    this.cambiarFormulario(siguienteFormulario);
  } else {
    console.log('✅ Todos los formularios completados');
    // Opcional: mostrar mensaje de completado total
    this.success = '¡Todos los documentos han sido creados exitosamente!';
  }
}

// ==========================================
// NUEVO MÉTODO: OBTENER TÍTULO AMIGABLE
// ==========================================

private getTituloFormulario(formulario: string): string {
  const titulos: { [key: string]: string } = {
    'signosVitales': 'Signos Vitales',
    'historiaClinica': 'Historia Clínica',
    'notaUrgencias': 'Nota de Urgencias',
    'notaEvolucion': 'Nota de Evolución'
  };
  return titulos[formulario] || formulario;
}

// ==========================================
// CAMBIAR FORMULARIO - ✅ MEJORADO
// ==========================================

cambiarFormulario(tipoFormulario: string): void {
  if (this.formularioActivo === tipoFormulario) return;

  // ✅ PERMITIR NAVEGACIÓN LIBRE ENTRE FORMULARIOS YA COMPLETADOS
  const puedeNavegar = this.formularioEstado[tipoFormulario] || this.puedeAccederFormulario(tipoFormulario);

  if (!puedeNavegar) {
    this.error = `Complete el formulario actual antes de acceder a ${this.getTituloFormulario(tipoFormulario)}`;
    return;
  }

  // ✅ LIMPIAR MENSAJES
  this.error = null;
  this.success = null;

  console.log(`🔄 Cambiando formulario de ${this.formularioActivo} a ${tipoFormulario}`);
  this.formularioActivo = tipoFormulario;
}

// ==========================================
// NUEVO MÉTODO: VERIFICAR ACCESO A FORMULARIO
// ==========================================

private puedeAccederFormulario(formulario: string): boolean {
  const secuenciaFormularios = ['signosVitales', 'historiaClinica', 'notaUrgencias', 'notaEvolucion'];
  const indiceDestino = secuenciaFormularios.indexOf(formulario);

  if (indiceDestino === -1) return false;

  // ✅ LÓGICA DE ACCESO:
  // - Signos Vitales: Siempre accesible
  // - Historia Clínica: Solo si signos vitales está completado
  // - Urgencias y Evolución: Siempre accesibles (son independientes)

  switch (formulario) {
    case 'signosVitales':
      return true; // Siempre accesible
    case 'historiaClinica':
      return this.formularioEstado.signosVitales; // Requiere signos vitales
    case 'notaUrgencias':
    case 'notaEvolucion':
      return true; // Son independientes
    default:
      return false;
  }
}

// ==========================================
// NUEVO MÉTODO: RESETEAR FORMULARIO ACTUAL
// ==========================================

resetearFormularioActual(): void {
  if (confirm(`¿Está seguro de que desea resetear ${this.getTituloFormulario(this.formularioActivo)}?`)) {
    switch (this.formularioActivo) {
      case 'signosVitales':
        this.signosVitalesForm.reset();
        break;
      case 'historiaClinica':
        this.historiaClinicaForm.reset();
        break;
      case 'notaUrgencias':
        this.notaUrgenciasForm.reset();
        break;
      case 'notaEvolucion':
        this.notaEvolucionForm.reset();
        break;
    }

    this.formularioEstado[this.formularioActivo] = false;
    this.success = `Formulario ${this.getTituloFormulario(this.formularioActivo)} reseteado`;
  }
}

// ==========================================
// GETTER MEJORADO: MOSTRAR PROGRESO
// ==========================================

get progresoFormularios(): { completados: number; total: number; porcentaje: number } {
  const total = 4;
  const completados = Object.values(this.formularioEstado).filter(estado => estado).length;
  const porcentaje = Math.round((completados / total) * 100);

  return { completados, total, porcentaje };
}

// ==========================================
// GETTER: PUEDE FINALIZAR PROCESO
// ==========================================

get puedeFinalizarProceso(): boolean {
  // Al menos signos vitales e historia clínica deben estar completados
  return this.formularioEstado.signosVitales && this.formularioEstado.historiaClinica;
}

// ==========================================
// NUEVO MÉTODO: FINALIZAR PROCESO
// ==========================================

finalizarProceso(): void {
  if (!this.puedeFinalizarProceso) {
    this.error = 'Debe completar al menos Signos Vitales e Historia Clínica para finalizar';
    return;
  }

  const progreso = this.progresoFormularios;
  const mensaje = progreso.completados === progreso.total
    ? '¡Proceso completado exitosamente! Todos los documentos han sido creados.'
    : `Proceso finalizado. Se han completado ${progreso.completados} de ${progreso.total} formularios.`;

  this.success = mensaje;

  // Opcional: Navegar a otra página después de un tiempo
  setTimeout(() => {
    if (confirm('¿Desea continuar editando o volver a la lista de pacientes?')) {
      // Continuar editando
      this.success = null;
    } else {
      // Volver a lista
      this.volverAListaPacientes();
    }
  }, 3000);
}


private async guardarSignosVitales(): Promise<void> {
  if (!this.signosVitalesForm.valid) {
    throw new Error('Formulario de signos vitales inválido');
  }

  if (!this.pacienteCompleto?.expediente.id_expediente) {
    throw new Error('No hay expediente disponible');
  }

  // ✅ ESTRUCTURA EXACTA que espera el backend según controller
  const signosData = {
    // ✅ Campos requeridos por el backend
    id_expediente: this.pacienteCompleto.expediente.id_expediente,
    id_medico_registra: this.medicoActual!,
    fecha_toma: new Date().toISOString(),

    // ✅ Signos vitales opcionales - enviar null en lugar de undefined
    temperatura: this.signosVitalesForm.value.temperatura || null,
    presion_arterial_sistolica: this.signosVitalesForm.value.presion_arterial_sistolica || null,
    presion_arterial_diastolica: this.signosVitalesForm.value.presion_arterial_diastolica || null,
    frecuencia_cardiaca: this.signosVitalesForm.value.frecuencia_cardiaca || null,
    frecuencia_respiratoria: this.signosVitalesForm.value.frecuencia_respiratoria || null,
    saturacion_oxigeno: this.signosVitalesForm.value.saturacion_oxigeno || null,
    glucosa: this.signosVitalesForm.value.glucosa || null,
    peso: this.signosVitalesForm.value.peso || null,
    talla: this.signosVitalesForm.value.talla || null,
    observaciones: this.signosVitalesForm.value.observaciones || ''
  };

  console.log('✅ Datos a enviar al backend:', signosData);

  // ✅ USAR el método que ya verificamos que existe
  const response = await firstValueFrom(
    this.signosVitalesService.createSignosVitales(signosData)
  );

  console.log('✅ Signos vitales guardados exitosamente:', response);

  // 🔥 SOLUCIÓN: EXTRAER EL ID_DOCUMENTO DE LA RESPUESTA
  if (response?.data?.id_documento) {
    this.documentoClinicoActual = response.data.id_documento;
    console.log('✅ Documento clínico actual actualizado:', this.documentoClinicoActual);
  } else {
    console.warn('⚠️ No se pudo obtener id_documento de la respuesta');
  }
}


  private async guardarHistoriaClinica(): Promise<void> {
  if (!this.historiaClinicaForm.valid) {
    throw new Error('Formulario de historia clínica inválido');
  }

  // 🔥 LOG PARA DEBUG
  console.log('🔍 Estado del documentoClinicoActual:', this.documentoClinicoActual);
  console.log('🔍 Estado de formularios:', this.formularioEstado);

  if (!this.documentoClinicoActual) {
    // 🔥 INTENTAR OBTENER EL ID DEL DOCUMENTO MÁS RECIENTE
    if (this.signosVitalesDisponibles && this.signosVitalesDisponibles.length > 0) {
      const ultimoSigno = this.signosVitalesDisponibles[0];
      if (ultimoSigno.id_documento) {
        this.documentoClinicoActual = ultimoSigno.id_documento;
        console.log('✅ Documento clínico obtenido de signos vitales:', this.documentoClinicoActual);
      }
    }

    // Si aún no tenemos documento, crear uno nuevo
    if (!this.documentoClinicoActual) {
      console.log('🔄 Creando nuevo documento clínico padre...');
      await this.crearDocumentoClinicoPadre();
    }
  }

  // ✅ ESTRUCTURA EXACTA que espera el backend
  const historiaData: CreateHistoriaClinicaDto = {
    id_documento: this.documentoClinicoActual!,
    antecedentes_heredo_familiares: this.historiaClinicaForm.value.antecedentes_heredo_familiares || null,
    habitos_higienicos: this.historiaClinicaForm.value.habitos_higienicos || null,
    habitos_alimenticios: this.historiaClinicaForm.value.habitos_alimenticios || null,
    actividad_fisica: this.historiaClinicaForm.value.actividad_fisica || null,
    ocupacion: this.historiaClinicaForm.value.ocupacion || null,
    vivienda: this.historiaClinicaForm.value.vivienda || null,
    toxicomanias: this.historiaClinicaForm.value.toxicomanias || null,
    padecimiento_actual: this.historiaClinicaForm.value.padecimiento_actual || null,
    sintomas_generales: this.historiaClinicaForm.value.sintomas_generales || null,
    aparatos_sistemas: this.historiaClinicaForm.value.aparatos_sistemas || null,
    exploracion_general: this.historiaClinicaForm.value.exploracion_general || null,
    exploracion_cabeza: this.historiaClinicaForm.value.exploracion_cabeza || null,
    exploracion_cuello: this.historiaClinicaForm.value.exploracion_cuello || null,
    exploracion_torax: this.historiaClinicaForm.value.exploracion_torax || null,
    exploracion_abdomen: this.historiaClinicaForm.value.exploracion_abdomen || null,
    exploracion_extremidades: this.historiaClinicaForm.value.exploracion_extremidades || null,
    impresion_diagnostica: this.historiaClinicaForm.value.impresion_diagnostica || null,
    plan_diagnostico: this.historiaClinicaForm.value.plan_diagnostico || null,
    plan_terapeutico: this.historiaClinicaForm.value.plan_terapeutico || null,
    pronostico: this.historiaClinicaForm.value.pronostico || null
  };

  console.log('🚀 Enviando historia clínica al backend:', historiaData);

  const response = await firstValueFrom(
    this.historiasClinicasService.createHistoriaClinica(historiaData)
  );

  console.log('✅ Historia clínica guardada exitosamente:', response);
}

  // ==========================================
  // NOTA DE URGENCIAS - ✅ CORREGIDO
  // ==========================================

  private async guardarNotaUrgencias(): Promise<void> {
    if (!this.notaUrgenciasForm.valid) {
      throw new Error('Formulario de nota de urgencias inválido');
    }

    // Crear documento específico para nota de urgencias
    const tipoNotaUrgencias = this.tiposDocumentosDisponibles.find(t => t.nombre === 'Nota de Urgencias');
    if (!tipoNotaUrgencias) {
      throw new Error('Tipo de documento de urgencias no encontrado');
    }

    const documentoUrgencias = await this.crearDocumentoEspecifico(tipoNotaUrgencias.id_tipo_documento);

    const notaData = {
      id_documento: documentoUrgencias.id_documento,
      motivo_atencion: this.notaUrgenciasForm.value.motivo_atencion,
      estado_conciencia: this.notaUrgenciasForm.value.estado_conciencia,
      resumen_interrogatorio: this.notaUrgenciasForm.value.resumen_interrogatorio,
      exploracion_fisica: this.notaUrgenciasForm.value.exploracion_fisica,
      resultados_estudios: this.notaUrgenciasForm.value.resultados_estudios,
      estado_mental: this.notaUrgenciasForm.value.estado_mental,
      diagnostico: this.notaUrgenciasForm.value.diagnostico,
      plan_tratamiento: this.notaUrgenciasForm.value.plan_tratamiento,
      pronostico: this.notaUrgenciasForm.value.pronostico
    };

    const response = await firstValueFrom(
      this.notasUrgenciasService.createNotaUrgencias(notaData)
    );
    console.log('✅ Nota de urgencias guardada:', response);
  }

  // ==========================================
  // NOTA DE EVOLUCIÓN - ✅ CORREGIDO
  // ==========================================

  private async guardarNotaEvolucion(): Promise<void> {
    if (!this.notaEvolucionForm.valid) {
      throw new Error('Formulario de nota de evolución inválido');
    }

    const tipoNotaEvolucion = this.tiposDocumentosDisponibles.find(t => t.nombre === 'Nota de Evolución');
    if (!tipoNotaEvolucion) {
      throw new Error('Tipo de documento de evolución no encontrado');
    }

    const documentoEvolucion = await this.crearDocumentoEspecifico(tipoNotaEvolucion.id_tipo_documento);

    const notaData = {
      id_documento: documentoEvolucion.id_documento,
      subjetivo: this.notaEvolucionForm.value.subjetivo,
      objetivo: this.notaEvolucionForm.value.objetivo,
      analisis: this.notaEvolucionForm.value.analisis,
      plan: this.notaEvolucionForm.value.plan
    };

    const response = await firstValueFrom(
      this.notasEvolucionService.createNotaEvolucion(notaData)
    );
    console.log('✅ Nota de evolución guardada:', response);
  }
private async crearDocumentoClinicoPadre(): Promise<void> {
  if (!this.pacienteCompleto?.expediente.id_expediente) {
    throw new Error('No hay expediente disponible');
  }

  // Buscar tipo de documento para Historia Clínica
  const tipoHistoriaClinica = this.tiposDocumentosDisponibles.find(t =>
    t.nombre === 'Historia Clínica' ||
    t.nombre.toLowerCase().includes('historia')
  );

  if (!tipoHistoriaClinica) {
    console.error('❌ Tipos de documento disponibles:', this.tiposDocumentosDisponibles);
    throw new Error('Tipo de documento Historia Clínica no encontrado');
  }

  // ✅ ESTRUCTURA EXACTA que espera el backend
  const documentoData = {
    id_expediente: this.pacienteCompleto.expediente.id_expediente,
    id_internamiento: this.pacienteCompleto.ultimoInternamiento?.id_internamiento || null,
    id_tipo_documento: tipoHistoriaClinica.id_tipo_documento,
    id_personal_creador: this.medicoActual!,
    fecha_elaboracion: new Date().toISOString(),
    estado: EstadoDocumento.ACTIVO
  };

  console.log('🔄 Creando documento clínico padre:', documentoData);

  const response = await firstValueFrom(
    this.documentosService.createDocumentoClinico(documentoData)
  );

  if (response?.data?.id_documento) {
    this.documentoClinicoActual = response.data.id_documento;
    console.log('✅ Documento clínico padre creado con ID:', this.documentoClinicoActual);
  } else {
    console.error('❌ Respuesta del backend:', response);
    throw new Error('Error al crear documento clínico');
  }
}



  private async crearDocumentoEspecifico(idTipoDocumento: number): Promise<any> {
  if (!this.pacienteCompleto?.expediente.id_expediente) {
    throw new Error('No hay expediente disponible');
  }

  const documentoData = {
    id_expediente: this.pacienteCompleto.expediente.id_expediente,
    id_internamiento: this.pacienteCompleto.ultimoInternamiento?.id_internamiento || null,
    id_tipo_documento: idTipoDocumento,
    id_personal_creador: this.medicoActual!,
    fecha_elaboracion: new Date().toISOString(),
    estado: EstadoDocumento.ACTIVO // ✅ CORREGIDO: Usar enum en lugar de string
  };

  const response = await firstValueFrom(
    this.documentosService.createDocumentoClinico(documentoData)
  );

  if (response?.data) {
    return response.data;
  } else {
    throw new Error('Error al crear documento específico');
  }
}


  // ==========================================
  // HELPERS PARA UI
  // ==========================================

  private getIconoTipoDocumento(nombre: string): string {
    const iconos: { [key: string]: string } = {
      'Historia Clínica': 'fas fa-file-medical-alt',
      'Nota de Urgencias': 'fas fa-ambulance',
      'Nota de Evolución': 'fas fa-chart-line',
      'Nota de Interconsulta': 'fas fa-user-md',
      'Nota Preoperatoria': 'fas fa-procedures',
      'Nota Postoperatoria': 'fas fa-band-aid',
      'Nota de Egreso': 'fas fa-sign-out-alt'
    };
    return iconos[nombre] || 'fas fa-file-alt';
  }

  private getColorTipoDocumento(nombre: string): string {
    const colores: { [key: string]: string } = {
      'Historia Clínica': 'blue',
      'Nota de Urgencias': 'red',
      'Nota de Evolución': 'green',
      'Nota de Interconsulta': 'purple',
      'Nota Preoperatoria': 'orange',
      'Nota Postoperatoria': 'indigo',
      'Nota de Egreso': 'indigo'
    };
    return colores[nombre] || 'gray';
  }

  private requiereInternamiento(nombre: string): boolean {
    const requiereInternamiento = [
      'Nota de Evolución',
      'Nota Preoperatoria',
      'Nota Postoperatoria',
      'Nota de Egreso'
    ];
    return requiereInternamiento.includes(nombre);
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

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
      return new Date(fecha).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return fecha;
    }
  }

  getNombreCompleto(): string {
    if (!this.pacienteCompleto?.persona) return 'Cargando...';

    const { nombre, apellido_paterno, apellido_materno } = this.pacienteCompleto.persona;
    return `${nombre} ${apellido_paterno} ${apellido_materno || ''}`.trim();
  }

  getColorClase(color: string): string {
    const colores: { [key: string]: string } = {
      'blue': 'border-blue-200 bg-blue-50 text-blue-800',
      'red': 'border-red-200 bg-red-50 text-red-800',
      'green': 'border-green-200 bg-green-50 text-green-800',
      'purple': 'border-purple-200 bg-purple-50 text-purple-800',
      'orange': 'border-orange-200 bg-orange-50 text-orange-800',
      'indigo': 'border-indigo-200 bg-indigo-50 text-indigo-800',
      'gray': 'border-gray-200 bg-gray-50 text-gray-800'
    };
    return colores[color] || colores['gray'];
  }

  // ==========================================
  // GETTERS PARA TEMPLATE
  // ==========================================

  get formularioActualValido(): boolean {
    switch (this.formularioActivo) {
      case 'signosVitales':
        return this.signosVitalesForm.valid;
      case 'historiaClinica':
        return this.historiaClinicaForm.valid;
      case 'notaUrgencias':
        return this.notaUrgenciasForm.valid;
      case 'notaEvolucion':
        return this.notaEvolucionForm.valid;
      default:
        return false;
    }
  }

  get puedeAvanzar(): boolean {
    return this.formularioEstado[this.formularioActivo] || this.formularioActualValido;
  }

  get mostrarCargando(): boolean {
    return this.isLoading;
  }

  get mostrarError(): boolean {
    return !!this.error && !this.isLoading;
  }

  get mostrarContenido(): boolean {
    return !!this.pacienteCompleto && !this.isLoading && !this.error;
  }

  // ==========================================
  // ACCIONES DE NAVEGACIÓN
  // ==========================================

  volverAListaPacientes(): void {
    this.router.navigate(['/app/personas/pacientes']);
  }

  refrescarDatos(): void {
    this.initializeComponent();
  }
}
