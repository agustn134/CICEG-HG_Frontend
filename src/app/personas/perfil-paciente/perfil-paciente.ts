import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Subject,
  takeUntil,
  forkJoin,
  Observable,
  firstValueFrom,
  switchMap,
  catchError,
  of,
} from 'rxjs';
import { ExpedientesService } from '../../services/gestion-expedientes/expedientes';
import { PacientesService } from '../../services/personas/pacientes';
import { DocumentosService } from '../../services/documentos-clinicos/documentos';
import { HistoriasClinicasService } from '../../services/documentos-clinicos/historias-clinicas';
import { NotasUrgenciasService } from '../../services/documentos-clinicos/notas-urgencias';
import { NotasEvolucionService } from '../../services/documentos-clinicos/notas-evolucion';
import { NotasEgresoService } from '../../services/documentos-clinicos/notas-egreso';
import { SignosVitalesService } from '../../services/gestion-expedientes/signos-vitales';
import { ServiciosService } from '../../services/catalogos/servicios';
import { TiposDocumentoService } from '../../services/catalogos/tipos-documento';
import { PersonalMedicoService } from '../../services/personas/personal-medico';
import { Paciente } from '../../models/paciente.model';
import { Expediente } from '../../models/expediente.model';
import { DocumentoClinico } from '../../models/documento-clinico.model';
import {
  SignosVitales,
  CreateSignosVitalesDto,
} from '../../models/signos-vitales.model';
import { CreateHistoriaClinicaDto } from '../../models/historia-clinica.model';
import { CreateNotaUrgenciasDto } from '../../models/nota-urgencias.model';
import { CAMPOS_OBLIGATORIOS_NOM004, CreateNotaEvolucionDto } from '../../models/nota-evolucion.model';
import { TipoDocumento } from '../../models/tipo-documento.model';
import { Servicio } from '../../models/servicio.model';
import { ApiResponse, EstadoDocumento } from '../../models/base.models';
import { AuthService } from '../../services/auth/auth.service';

import { GuiasClinicasService } from '../../services/catalogos/guias-clinicas';
import { GuiaClinica } from '../../models/guia-clinica.model';
import { PdfGeneratorService } from '../../services/pdf-generator.service'; // Agregar import


interface PacienteCompleto {
  persona: {
    // Datos personales de la persona - campos conocidos
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    fecha_nacimiento?: string;
    lugar_nacimiento?: string;
    ciudad_nacimiento?: string;
    municipio_nacimiento?: string;
    estado_nacimiento?: string;
    sexo?: string;
    telefono?: string;
    correo_electronico?: string;
    domicilio?: string;
    direccion?: string;
    calle?: string;
    numero_exterior?: string;
    numero_interior?: string;
    colonia?: string;
    ciudad?: string;
    estado?: string;
    codigo_postal?: string;
    curp?: string;
    tipo_sangre?: string;
    // Mantener index signature para propiedades adicionales
    [key: string]: any;
  };
  paciente: Paciente & { // ✅ EXTENDER EL TIPO PACIENTE
    persona?: any;
    fecha_nacimiento?: string;
    [key: string]: any;
  };
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
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './perfil-paciente.html',
  styleUrl: './perfil-paciente.css',
})

export class PerfilPaciente implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  pacienteCompleto: PacienteCompleto | null = null;
  pacienteId: number | null = null;
  medicoActual: number | null = null; // ID del médico conectado
  isLoading = true;
  isCreatingDocument = false;
  error: string | null = null;
  mostrarError = false;
  hayProblemasConexion = false;
  errorCritico: string | null = null;
  estadoAutoguardado: 'guardado' | 'guardando' | 'offline' | null = null;

  // Autoguardado local
  private autoguardadoInterval: any;
  private ultimoGuardadoLocal = Date.now();

  success: string | null = null;
  signosVitalesForm: FormGroup;
  historiaClinicaForm: FormGroup;
  notaUrgenciasForm: FormGroup;
  notaEvolucionForm: FormGroup;
  formularioActivo: string = 'signosVitales';
  formularioEstado: FormularioEstado = {
    signosVitales: false,
    historiaClinica: false,
    notaUrgencias: false,
    notaEvolucion: false,
  };
  tiposDocumentosDisponibles: TipoDocumentoDisponible[] = [];
  personalMedico: any[] = [];
  servicios: Servicio[] = [];
  documentoClinicoActual: number | null = null;

  // Para el tab de historial
  tabActiva: string = 'general';
  filtroHistorial: any = {
    tipoDocumento: '',
    fechaDesde: '',
    fechaHasta: '',
  };
  timelineDocumentos: any[] = [];
  historialInternamientos: any[] = [];

  // Para el tab de datos clínicos
  datosClinicosConsolidados: any = {};
  resumenGeneral: any = {};


  // 🔥 NUEVAS PROPIEDADES PARA GUÍAS CLÍNICAS
  guiasClinicas: GuiaClinica[] = [];
  guiasClinicasFiltradas: GuiaClinica[] = [];
  guiaClinicaSeleccionada: GuiaClinica | null = null;
  filtroGuiaClinica: string = '';
  mostrarDropdownGuias: boolean = false;

  constructor(
    private authService: AuthService, // 🔥 Agregar esto
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private expedientesService: ExpedientesService,
    private pacientesService: PacientesService,
    private documentosService: DocumentosService,
    private signosVitalesService: SignosVitalesService,
    private historiasClinicasService: HistoriasClinicasService,
    private notasUrgenciasService: NotasUrgenciasService,
    private notaEvolucionService: NotasEvolucionService,
    private notasEgresoService: NotasEgresoService,
    private serviciosService: ServiciosService,
    private tiposDocumentoService: TiposDocumentoService,
    private personalMedicoService: PersonalMedicoService,
    private guiasClinicasService: GuiasClinicasService,
    private pdfGeneratorService: PdfGeneratorService,
) {
    this.signosVitalesForm = this.initializeSignosVitalesForm();
    this.historiaClinicaForm = this.initializeHistoriaClinicaForm();
    this.notaUrgenciasForm = this.initializeNotaUrgenciasForm();
    this.notaEvolucionForm = this.initializeNotaEvolucionForm();
  }
  get documentosDisponibles(): DocumentoClinico[] {
    return this.pacienteCompleto?.documentos || [];
  }
  get tieneDocumentos(): boolean {
    return this.documentosDisponibles.length > 0;
  }
  get signosVitalesDisponibles(): SignosVitales[] {
    return this.pacienteCompleto?.signosVitales || [];
  }

  debugPacienteCompleto(): void {
    console.log('🔍 DEBUG pacienteCompleto completo:', this.pacienteCompleto);
    console.log('🔍 DEBUG persona:', this.pacienteCompleto?.persona);
    console.log('🔍 DEBUG paciente:', this.pacienteCompleto?.paciente);
    if (this.pacienteCompleto?.persona) {
      console.log('✅ Persona existe');
      console.log('📝 Nombre:', this.pacienteCompleto.persona.nombre);
      console.log(
        '📝 Apellido paterno:',
        this.pacienteCompleto.persona.apellido_paterno
      );
      console.log(
        '📝 Apellido materno:',
        this.pacienteCompleto.persona.apellido_materno
      );
    } else {
      console.log('❌ Persona no existe o es undefined');
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.pacienteId = parseInt(id, 10);
        this.initializeComponent();
      } else {
        this.error = 'ID de paciente no válido';
        this.isLoading = false;
      }
    });

    setTimeout(() => {
      this.debugPacienteCompleto();
    }, 2000);

    this.iniciarAutoguardado();

    setTimeout(() => {
      this.recuperarDatosLocales();
    }, 1000);

    window.addEventListener('online', () => {
      this.hayProblemasConexion = false;
      this.verificarConexion();
    });

    window.addEventListener('offline', () => {
      this.hayProblemasConexion = true;
      this.estadoAutoguardado = 'offline';
    });

    this.authService.currentUser$.subscribe((user) => {
      if (user && user.tipo_usuario === 'medico') {
        this.medicoActual = user.id;
      }
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.pacienteId = parseInt(id, 10);
        this.initializeComponent();
      } else {
        this.error = 'ID de paciente no válido';
        this.isLoading = false;
      }
    });

    this.cargarGuiasClinicas();
  }

  ngOnDestroy(): void {
    // Limpiar autoguardado
    if (this.autoguardadoInterval) {
      clearInterval(this.autoguardadoInterval);
    }

    // Guardar antes de salir
    this.guardarLocalmenteFormulario();

    // Tu código existente...
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 🔥 MÉTODO PARA CARGAR GUÍAS CLÍNICAS
  private async cargarGuiasClinicas(): Promise<void> {
    try {
      const response = await this.guiasClinicasService.getAll({ activo: true });
      if (response.success) {
        this.guiasClinicas = response.data || [];
        this.guiasClinicasFiltradas = [...this.guiasClinicas];
      }
    } catch (error) {
      console.error('Error al cargar guías clínicas:', error);
    }
  }

  // 🔥 MÉTODO PARA FILTRAR GUÍAS POR ÁREA
  private filtrarGuiasPorArea(area: string): GuiaClinica[] {
    if (!area) return this.guiasClinicas;

    return this.guiasClinicas.filter(guia =>
      guia.area?.toLowerCase().includes(area.toLowerCase()) ||
      guia.nombre?.toLowerCase().includes(area.toLowerCase())
    );
  }

  // 🔥 MÉTODO PARA BUSCAR GUÍAS CLÍNICAS
  buscarGuiaClinica(event: Event): void {
  const target = event.target as HTMLInputElement;
  const termino = target?.value || '';

  this.filtroGuiaClinica = termino;

  if (!termino) {
    this.guiasClinicasFiltradas = [...this.guiasClinicas];
    return;
  }

  this.guiasClinicasFiltradas = this.guiasClinicas.filter(guia =>
    guia.nombre?.toLowerCase().includes(termino.toLowerCase()) ||
    guia.codigo?.toLowerCase().includes(termino.toLowerCase()) ||
    guia.area?.toLowerCase().includes(termino.toLowerCase())
  );
}

// 🔥 AGREGAR MÉTODO ALTERNATIVO MÁS SEGURO
buscarGuiaClinicaPorTermino(termino: string): void {
  this.filtroGuiaClinica = termino;

  if (!termino) {
    this.guiasClinicasFiltradas = [...this.guiasClinicas];
    return;
  }

  this.guiasClinicasFiltradas = this.guiasClinicas.filter(guia =>
    guia.nombre?.toLowerCase().includes(termino.toLowerCase()) ||
    guia.codigo?.toLowerCase().includes(termino.toLowerCase()) ||
    guia.area?.toLowerCase().includes(termino.toLowerCase())
  );
}

// 🔥 MÉTODO PARA MANEJAR EVENTOS DE INPUT DE FORMA SEGURA
onInputGuiaClinica(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input && input.value !== undefined) {
    this.buscarGuiaClinicaPorTermino(input.value);
  }
}

// 🔥 MÉTODO PARA MANEJAR CAMBIOS EN NGMODEL
onGuiaClinicaInputChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  const value = input?.value || '';

  this.filtroGuiaClinica = value;

  if (!value) {
    this.guiasClinicasFiltradas = [...this.guiasClinicas];
    return;
  }

  this.guiasClinicasFiltradas = this.guiasClinicas.filter(guia =>
    guia.nombre?.toLowerCase().includes(value.toLowerCase()) ||
    guia.codigo?.toLowerCase().includes(value.toLowerCase()) ||
    guia.area?.toLowerCase().includes(value.toLowerCase())
  );
}


  // 🔥 MÉTODO SEGURO PARA SELECCIONAR GUÍA CLÍNICA
seleccionarGuiaClinica(guia: GuiaClinica | null): void {
  if (!guia) return;

  this.guiaClinicaSeleccionada = guia;
  this.filtroGuiaClinica = guia.nombre || '';
  this.mostrarDropdownGuias = false;

  // Actualizar el formulario activo con la guía seleccionada
  this.actualizarFormularioConGuia(guia);
}

  // 🔥 MÉTODO PARA ACTUALIZAR EL FORMULARIO CON LA GUÍA SELECCIONADA
  private actualizarFormularioConGuia(guia: GuiaClinica): void {
    switch (this.formularioActivo) {
      case 'historiaClinica':
        this.historiaClinicaForm.patchValue({
          id_guia_diagnostico: guia.id_guia_diagnostico
        });
        break;
      case 'notaUrgencias':
        this.notaUrgenciasForm.patchValue({
          id_guia_diagnostico: guia.id_guia_diagnostico
        });
        break;
      case 'notaEvolucion':
        // La nota de evolución también puede tener guía diagnóstica
        this.notaEvolucionForm.patchValue({
          id_guia_diagnostico: guia.id_guia_diagnostico
        });
        break;
    }
  }



// 🔥 MÉTODO SEGURO PARA LIMPIAR GUÍA CLÍNICA
limpiarGuiaClinica(): void {
  this.guiaClinicaSeleccionada = null;
  this.filtroGuiaClinica = '';
  this.mostrarDropdownGuias = false;

  // Limpiar del formulario activo
  switch (this.formularioActivo) {
    case 'historiaClinica':
      this.historiaClinicaForm.patchValue({
        id_guia_diagnostico: null
      });
      break;
    case 'notaUrgencias':
      this.notaUrgenciasForm.patchValue({
        id_guia_diagnostico: null
      });
      break;
    case 'notaEvolucion':
      this.notaEvolucionForm.patchValue({
        id_guia_diagnostico: null
      });
      break;
  }
}

   // 🔥 MÉTODO PARA MOSTRAR/OCULTAR DROPDOWN
  toggleDropdownGuias(): void {
    this.mostrarDropdownGuias = !this.mostrarDropdownGuias;
    if (this.mostrarDropdownGuias) {
      this.guiasClinicasFiltradas = [...this.guiasClinicas];
    }
  }

// 🔥 MÉTODO PARA TRACKBY EN NGFOR (MEJORA PERFORMANCE)
trackByGuiaId(index: number, guia: GuiaClinica): number {
  return guia.id_guia_diagnostico;
}

// 🔥 MÉTODO PARA CERRAR DROPDOWN AL HACER CLICK FUERA
@HostListener('document:click', ['$event'])
onClickOutside(event: Event): void {
  const target = event.target as HTMLElement;
  const dropdown = target?.closest('.relative');

  if (!dropdown) {
    this.mostrarDropdownGuias = false;
  }
}

// 🔥 MÉTODO SEGURO PARA OBTENER VALOR DE EVENTO
private getEventValue(event: Event): string {
  const target = event.target as HTMLInputElement;
  return target?.value || '';
}

// 🔥 MÉTODO PARA VALIDAR GUÍA CLÍNICA SELECCIONADA
get esGuiaClinicaValida(): boolean {
  return !!(this.guiaClinicaSeleccionada?.id_guia_diagnostico);
}

// 🔥 MÉTODO PARA OBTENER TEXTO DEL FILTRO DE FORMA SEGURA
get textoFiltroGuia(): string {
  return this.filtroGuiaClinica || '';
}






  private initializeComponent(): void {
    this.isLoading = true;
    this.error = null;
    this.medicoActual = 9;
    forkJoin({
      paciente: this.cargarDatosPaciente(),
      catalogos: this.cargarCatalogos(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
        },
      });
  }

  private initializeSignosVitalesForm(): FormGroup {
    return this.fb.group({
      temperatura: [null, [Validators.min(30), Validators.max(45)]],
      presion_arterial_sistolica: [
        null,
        [Validators.min(60), Validators.max(250)],
      ],
      presion_arterial_diastolica: [
        null,
        [Validators.min(30), Validators.max(150)],
      ],
      frecuencia_cardiaca: [
        null,
        [Validators.required, Validators.min(40), Validators.max(200)],
      ],
      frecuencia_respiratoria: [
        null,
        [Validators.required, Validators.min(10), Validators.max(60)],
      ],
      saturacion_oxigeno: [null, [Validators.min(70), Validators.max(100)]],
      peso: [null, [Validators.min(0.5), Validators.max(300)]],
      talla: [null, [Validators.min(30), Validators.max(250)]],
      glucosa: [null, [Validators.min(30), Validators.max(600)]],
      observaciones: [''],
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
      pronostico: ['', Validators.required],
      id_guia_diagnostico: [null], // 🔥 AGREGAR ESTE CAMPO
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
      pronostico: ['', Validators.required],
      id_guia_diagnostico: [null], // 🔥 AGREGAR ESTE CAMPO
    });
  }
  private initializeNotaEvolucionForm(): FormGroup {
  return this.fb.group({
    // 🔥 CAMPOS OBLIGATORIOS SEGÚN NOM-004-SSA3-2012
    sintomas_signos: ['', [Validators.required, Validators.minLength(10)]],
    habitus_exterior: ['', [Validators.required, Validators.minLength(5)]],
    estado_nutricional: ['', [Validators.required, Validators.minLength(5)]],
    estudios_laboratorio_gabinete: ['', [Validators.required, Validators.minLength(10)]],
    evolucion_analisis: ['', [Validators.required, Validators.minLength(10)]],
    diagnosticos: ['', [Validators.required, Validators.minLength(10)]],
    plan_estudios_tratamiento: ['', [Validators.required, Validators.minLength(10)]],
    pronostico: ['', [Validators.required, Validators.minLength(5)]],

    // 🔥 CAMPOS OPCIONALES MEJORADOS
    id_guia_diagnostico: [null],
    dias_hospitalizacion: [null, [Validators.min(0), Validators.max(365)]],
    fecha_ultimo_ingreso: [''],

    // Signos vitales en nota de evolución
    temperatura: [null, [Validators.min(30), Validators.max(45)]],
    frecuencia_cardiaca: [null, [Validators.min(30), Validators.max(250)]],
    frecuencia_respiratoria: [null, [Validators.min(8), Validators.max(60)]],
    presion_arterial_sistolica: [null, [Validators.min(60), Validators.max(250)]],
    presion_arterial_diastolica: [null, [Validators.min(30), Validators.max(150)]],
    saturacion_oxigeno: [null, [Validators.min(50), Validators.max(100)]],
    peso_actual: [null, [Validators.min(0.5), Validators.max(300)]],
    talla_actual: [null, [Validators.min(30), Validators.max(250)]],

    // Exploración física detallada
    exploracion_cabeza: [''],
    exploracion_cuello: [''],
    exploracion_torax: [''],
    exploracion_abdomen: [''],
    exploracion_extremidades: [''],
    exploracion_columna: [''],
    exploracion_genitales: [''],
    exploracion_neurologico: [''],

    // Campos adicionales
    diagnosticos_guias: [''],
    interconsultas: ['No se solicitaron interconsultas en esta evolución'],
    indicaciones_medicas: [''],
    observaciones_adicionales: ['']
  });
}

  private cargarDatosPaciente(): Observable<any> {
    if (!this.pacienteId) {
      throw new Error('ID de paciente no válido');
    }
    return forkJoin({
      paciente: this.pacientesService.getPacienteById(this.pacienteId),
      expediente: this.expedientesService.getExpedienteByPacienteId(
        this.pacienteId
      ),
      documentos: this.obtenerDocumentosPorPaciente(this.pacienteId),
      signosVitales: this.signosVitalesService.getSignosVitalesByPacienteId(
        this.pacienteId
      ),
    }).pipe(takeUntil(this.destroy$));
  }

  private obtenerDocumentosPorPaciente(idPaciente: number): Observable<any> {
    return this.expedientesService.getExpedienteByPacienteId(idPaciente).pipe(
      switchMap((expedienteResponse) => {
        if (
          expedienteResponse.success &&
          expedienteResponse.data?.id_expediente
        ) {
          return this.documentosService.getDocumentosByExpediente(
            expedienteResponse.data.id_expediente
          );
        } else {
          return of({
            success: true,
            message: 'Sin documentos',
            data: [],
          });
        }
      }),
      catchError((error) => {
        console.error('Error al obtener documentos:', error);
        return of({
          success: false,
          message: 'Error al obtener documentos',
          data: [],
        });
      })
    );
  }

  private cargarCatalogos(): Observable<any> {
    return forkJoin({
      tiposDocumento: this.tiposDocumentoService.getAll(),
      personalMedico: this.personalMedicoService.getPersonalMedico(),
      servicios: this.serviciosService.getAll(),
    }).pipe(takeUntil(this.destroy$));
  }



  private procesarCatalogos(data: any): void {
    this.tiposDocumentosDisponibles = (data.tiposDocumento?.data || []).map(
      (tipo: TipoDocumento, index: number) => ({
        id_tipo_documento: tipo.id_tipo_documento,
        nombre: tipo.nombre,
        descripcion: tipo.descripcion || '',
        icono: this.getIconoTipoDocumento(tipo.nombre),
        color: this.getColorTipoDocumento(tipo.nombre),
        requiereInternamiento: this.requiereInternamiento(tipo.nombre),
        orden: index + 1,
        activo: tipo.activo,
      })
    );
    this.personalMedico = data.personalMedico?.data || [];
    this.servicios = data.servicios?.data || [];
  }

  private preLlenarFormularios(): void {
    if (!this.pacienteCompleto) return;
    if (this.pacienteCompleto.paciente && this.pacienteCompleto.persona) {
      this.historiaClinicaForm.patchValue({
        ocupacion: this.pacienteCompleto.paciente.ocupacion || '',
      });
    }
    const ultimosSignos = this.signosVitalesDisponibles[0];
    if (ultimosSignos) {
      this.signosVitalesForm.patchValue({
        peso: ultimosSignos.peso,
        talla: ultimosSignos.talla,
      });
    }
  }

  private tieneFormularioActivo(): boolean {
    const formularios = [
      'signosVitales',
      'historiaClinica',
      'notaUrgencias',
      'notaEvolucion',
    ];
    return formularios.includes(this.formularioActivo);
  }

async guardarFormularioActivo(): Promise<void> {
  if (this.isCreatingDocument) return;

  this.isCreatingDocument = true;
  this.error = null;
  this.success = null;

  try {
    switch (this.formularioActivo) {
      case 'signosVitales':
        await this.guardarSignosVitales();
        this.formularioEstado.signosVitales = true;
        this.success = `${this.getTituloFormulario(this.formularioActivo)} guardado correctamente`;
        break;

      case 'historiaClinica':
        await this.guardarHistoriaClinica();
        // ✅ MARCAR COMO COMPLETADO SIEMPRE (incluso con error 409)
        this.formularioEstado.historiaClinica = true;
        this.success = 'Historia Clínica procesada correctamente';
        break;

      case 'notaUrgencias':
        await this.guardarNotaUrgencias();
        this.formularioEstado.notaUrgencias = true;
        break;

      case 'notaEvolucion':
        await this.guardarNotaEvolucion();
        this.formularioEstado.notaEvolucion = true;
        break;

      default:
        throw new Error('Tipo de formulario no válido');
    }

    // 🔥 MOSTRAR CONFIRMACIÓN DE PDF (excepto para signos vitales)
    if (this.formularioActivo !== 'signosVitales') {
      setTimeout(() => {
        this.mostrarConfirmacionPDF(this.getTituloFormulario(this.formularioActivo));
      }, 1000);
    }

    // Limpiar datos locales
    localStorage.removeItem(`perfil_paciente_${this.pacienteId}`);

    console.log('✅ Formulario completado:', this.formularioActivo);
    console.log('✅ Estado actualizado:', this.formularioEstado);

    // Recargar datos del paciente
    this.cargarDatosPaciente().subscribe((data) => {
      this.construirPacienteCompleto(data);
    });

  } catch (error: any) {
    console.error(`❌ Error al guardar ${this.formularioActivo}:`, error);

    // 🔥 MANEJO DE ERRORES MÁS SUAVE
    if (error?.message?.includes('validación')) {
      this.error = error.message;
    } else if (error?.message?.includes('permisos')) {
      this.error = error.message;
    } else if (error?.message?.includes('conexión')) {
      this.error = error.message;
      this.hayProblemasConexion = true;
    } else {
      this.error = `Error al procesar ${this.getTituloFormulario(this.formularioActivo)}`;
    }

    this.manejarError(error, 'guardar formulario');

  } finally {
    this.isCreatingDocument = false;
  }
}
  private avanzarAlSiguientePaso(): void {
  console.log(`✅ Formulario ${this.formularioActivo} completado`);
  }

  private getTituloFormulario(formulario: string): string {
    const titulos: { [key: string]: string } = {
      signosVitales: 'Signos Vitales',
      historiaClinica: 'Historia Clínica',
      notaUrgencias: 'Nota de Urgencias',
      notaEvolucion: 'Nota de Evolución',
    };
    return titulos[formulario] || formulario;
  }

  // Métodos que faltan
  cambiarTab(tab: string): void {
    this.tabActiva = tab;

    // Cargar datos específicos según el tab
    if (tab === 'historial') {
      this.cargarHistorialClinico();
    } else if (tab === 'datos') {
      this.cargarDatosClinicosConsolidados();
    } else if (tab === 'general') {
      this.cargarResumenGeneral();
    }
  }

  eliminarBorrador(): void {
    if (confirm('¿Está seguro de que desea eliminar el borrador guardado?')) {
      localStorage.removeItem(`perfil_paciente_${this.pacienteId}`);
      this.success = 'Borrador eliminado correctamente';

      // Resetear formularios
      this.signosVitalesForm.reset();
      this.historiaClinicaForm.reset();
      this.notaUrgenciasForm.reset();
      this.notaEvolucionForm.reset();

      // Resetear estados
      this.formularioEstado = {
        signosVitales: false,
        historiaClinica: false,
        notaUrgencias: false,
        notaEvolucion: false,
      };

      setTimeout(() => {
        this.success = null;
      }, 3000);
    }
  }

  private cargarHistorialClinico(): void {
    // Cargar timeline de documentos
    this.timelineDocumentos = this.documentosDisponibles.map((doc) => ({
      titulo: doc.nombre_tipo_documento || 'Documento Clínico',
      fecha: doc.fecha_elaboracion,
      descripcion: `Documento creado por ${
        doc.medico_responsable || 'Sistema'
      }`,
      icono: this.getIconoTipoDocumento(doc.nombre_tipo_documento || ''),
      color: this.getColorTipoDocumento(doc.nombre_tipo_documento || ''),
      estado: doc.estado || 'Activo',
    }));

    // Cargar historial de internamientos (simulado)
    this.historialInternamientos = [
      // Aquí irían los datos reales de internamientos
      // Por ahora dejamos array vacío
    ];
  }

  private cargarDatosClinicosConsolidados(): void {
    // Consolidar datos de todas las historias clínicas
    this.datosClinicosConsolidados = {
      alergias: this.extraerAlergias(),
      medicamentosActuales: this.extraerMedicamentos(),
      diagnosticosActivos: this.extraerDiagnosticos(),
      antecedentesRelevantes: this.extraerAntecedentes(),
    };
  }

  private cargarResumenGeneral(): void {
    this.resumenGeneral = {
      alertasMedicas: this.identificarAlertasMedicas(),
      ultimoInternamiento: this.pacienteCompleto?.ultimoInternamiento || null,
      signosVitalesRecientes: this.signosVitalesDisponibles.slice(0, 5),
      documentosRecientes: this.documentosDisponibles.slice(0, 5),
    };
  }

  private extraerAlergias(): string[] {
    // Extraer alergias de las historias clínicas
    const alergias: string[] = [];
    // Lógica para extraer alergias de los documentos
    return alergias;
  }

  private extraerMedicamentos(): any[] {
    // Extraer medicamentos actuales
    return [];
  }

  private extraerDiagnosticos(): any[] {
    // Extraer diagnósticos activos
    return [];
  }

  private extraerAntecedentes(): any[] {
    // Extraer antecedentes relevantes
    return [];
  }

  private identificarAlertasMedicas(): string[] {
    const alertas: string[] = [];

    // Revisar signos vitales críticos
    const ultimosSignos = this.signosVitalesDisponibles[0];
    if (ultimosSignos) {
      if (ultimosSignos.temperatura && ultimosSignos.temperatura > 38.5) {
        alertas.push('Temperatura elevada');
      }
      if (
        ultimosSignos.presion_arterial_sistolica &&
        ultimosSignos.presion_arterial_sistolica > 140
      ) {
        alertas.push('Presión arterial alta');
      }
      if (
        ultimosSignos.frecuencia_cardiaca &&
        ultimosSignos.frecuencia_cardiaca > 100
      ) {
        alertas.push('Taquicardia');
      }
    }

    return alertas;
  }

  cambiarFormulario(tipoFormulario: string): void {
    if (this.formularioActivo === tipoFormulario) return;
    const puedeNavegar =
      this.formularioEstado[tipoFormulario] ||
      this.puedeAccederFormulario(tipoFormulario);
    if (!puedeNavegar) {
      this.error = `Complete el formulario actual antes de acceder a ${this.getTituloFormulario(
        tipoFormulario
      )}`;
      return;
    }
    this.error = null;
    this.success = null;

    console.log(
      ` Cambiando formulario de ${this.formularioActivo} a ${tipoFormulario}`
    );
    this.formularioActivo = tipoFormulario;
  }
  private puedeAccederFormulario(formulario: string): boolean {
    const secuenciaFormularios = [
      'signosVitales',
      'historiaClinica',
      'notaUrgencias',
      'notaEvolucion',
    ];
    const indiceDestino = secuenciaFormularios.indexOf(formulario);

    if (indiceDestino === -1) return false;
    switch (formulario) {
      case 'signosVitales':
        return true;
      case 'historiaClinica':
        return this.formularioEstado.signosVitales;
      case 'notaUrgencias':
      case 'notaEvolucion':
        return true;
      default:
        return false;
    }
  }

  resetearFormularioActual(): void {
    if (
      confirm(
        `¿Está seguro de que desea resetear ${this.getTituloFormulario(
          this.formularioActivo
        )}?`
      )
    ) {
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
      this.success = `Formulario ${this.getTituloFormulario(
        this.formularioActivo
      )} reseteado`;
    }
  }

  get progresoFormularios(): {
    completados: number;
    total: number;
    porcentaje: number;
  } {
    const total = 4;
    const completados = Object.values(this.formularioEstado).filter(
      (estado) => estado
    ).length;
    const porcentaje = Math.round((completados / total) * 100);

    return { completados, total, porcentaje };
  }

  get puedeFinalizarProceso(): boolean {
    return (
      this.formularioEstado.signosVitales &&
      this.formularioEstado.historiaClinica
    );
  }

  finalizarProceso(): void {
    if (!this.puedeFinalizarProceso) {
      this.error =
        'Debe completar al menos Signos Vitales e Historia Clínica para finalizar';
      return;
    }
    const progreso = this.progresoFormularios;
    const mensaje =
      progreso.completados === progreso.total
        ? '¡Proceso completado exitosamente! Todos los documentos han sido creados.'
        : `Proceso finalizado. Se han completado ${progreso.completados} de ${progreso.total} formularios.`;

    this.success = mensaje;

    setTimeout(() => {
      if (
        confirm('¿Desea continuar editando o volver a la lista de pacientes?')
      ) {
        this.success = null;
      } else {
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

    const signosData = {
      id_expediente: this.pacienteCompleto.expediente.id_expediente,
      id_medico_registra: this.medicoActual!,
      fecha_toma: new Date().toISOString(),
      temperatura: this.signosVitalesForm.value.temperatura || null,
      presion_arterial_sistolica:
        this.signosVitalesForm.value.presion_arterial_sistolica || null,
      presion_arterial_diastolica:
        this.signosVitalesForm.value.presion_arterial_diastolica || null,
      frecuencia_cardiaca:
        this.signosVitalesForm.value.frecuencia_cardiaca || null,
      frecuencia_respiratoria:
        this.signosVitalesForm.value.frecuencia_respiratoria || null,
      saturacion_oxigeno:
        this.signosVitalesForm.value.saturacion_oxigeno || null,
      glucosa: this.signosVitalesForm.value.glucosa || null,
      peso: this.signosVitalesForm.value.peso || null,
      talla: this.signosVitalesForm.value.talla || null,
      observaciones: this.signosVitalesForm.value.observaciones || '',
    };

    console.log(' Datos a enviar al backend:', signosData);

    const response = await firstValueFrom(
      this.signosVitalesService.createSignosVitales(signosData)
    );

    console.log(' Signos vitales guardados exitosamente:', response);
    if (response?.data?.id_documento) {
      this.documentoClinicoActual = response.data.id_documento;
      console.log(
        ' Documento clínico actual actualizado:',
        this.documentoClinicoActual
      );
    } else {
      console.warn(' No se pudo obtener id_documento de la respuesta');
    }
  }
private async guardarHistoriaClinica(): Promise<void> {
  if (!this.historiaClinicaForm.valid) {
    throw new Error('Formulario de historia clínica inválido');
  }

  console.log(
    '🔍 Estado del documentoClinicoActual:',
    this.documentoClinicoActual
  );
  console.log('🔍 Estado de formularios:', this.formularioEstado);

  // Verificar o crear documento clínico padre
  if (!this.documentoClinicoActual) {
    if (
      this.signosVitalesDisponibles &&
      this.signosVitalesDisponibles.length > 0
    ) {
      const ultimoSigno = this.signosVitalesDisponibles[0];
      if (ultimoSigno.id_documento) {
        this.documentoClinicoActual = ultimoSigno.id_documento;
        console.log(
          '✅ Documento clínico obtenido de signos vitales:',
          this.documentoClinicoActual
        );
      }
    }

    if (!this.documentoClinicoActual) {
      console.log('🔄 Creando nuevo documento clínico padre...');
      await this.crearDocumentoClinicoPadre();
    }
  }

  // Preparar datos de la historia clínica
  const historiaData: CreateHistoriaClinicaDto = {
    id_documento: this.documentoClinicoActual!,
    id_guia_diagnostico: this.historiaClinicaForm.value.id_guia_diagnostico || null,
    antecedentes_heredo_familiares:
      this.historiaClinicaForm.value.antecedentes_heredo_familiares || null,
    habitos_higienicos:
      this.historiaClinicaForm.value.habitos_higienicos || null,
    habitos_alimenticios:
      this.historiaClinicaForm.value.habitos_alimenticios || null,
    actividad_fisica: this.historiaClinicaForm.value.actividad_fisica || null,
    ocupacion: this.historiaClinicaForm.value.ocupacion || null,
    vivienda: this.historiaClinicaForm.value.vivienda || null,
    toxicomanias: this.historiaClinicaForm.value.toxicomanias || null,
    padecimiento_actual:
      this.historiaClinicaForm.value.padecimiento_actual || null,
    sintomas_generales:
      this.historiaClinicaForm.value.sintomas_generales || null,
    aparatos_sistemas:
      this.historiaClinicaForm.value.aparatos_sistemas || null,
    exploracion_general:
      this.historiaClinicaForm.value.exploracion_general || null,
    exploracion_cabeza:
      this.historiaClinicaForm.value.exploracion_cabeza || null,
    exploracion_cuello:
      this.historiaClinicaForm.value.exploracion_cuello || null,
    exploracion_torax:
      this.historiaClinicaForm.value.exploracion_torax || null,
    exploracion_abdomen:
      this.historiaClinicaForm.value.exploracion_abdomen || null,
    exploracion_extremidades:
      this.historiaClinicaForm.value.exploracion_extremidades || null,
    impresion_diagnostica:
      this.historiaClinicaForm.value.impresion_diagnostica || null,
    plan_diagnostico: this.historiaClinicaForm.value.plan_diagnostico || null,
    plan_terapeutico: this.historiaClinicaForm.value.plan_terapeutico || null,
    pronostico: this.historiaClinicaForm.value.pronostico || null,
  };

  console.log('📤 Enviando historia clínica al backend:', historiaData);

  try {
    const response = await firstValueFrom(
      this.historiasClinicasService.createHistoriaClinica(historiaData)
    );

    console.log('✅ Historia clínica guardada exitosamente:', response);

  } catch (error: any) {
    console.error('❌ Error al guardar historia clínica:', error);

    // 🔥 MANEJO ESPECÍFICO PARA DIFERENTES TIPOS DE ERROR
    if (error?.status === 409) {
      console.log('⚠️ Historia clínica ya existe para este documento');
      console.log('ℹ️ El documento ya tiene una historia clínica asociada');

      // 🎯 NO LANZAR ERROR - permitir que continúe el flujo
      // El PDF se puede generar con los datos del formulario
      return; // Salir sin error para continuar con PDF

    } else if (error?.status === 400) {
      console.error('❌ Error de validación en el servidor:', error.error?.message);
      throw new Error(`Error de validación: ${error.error?.message || 'Datos inválidos'}`);

    } else if (error?.status === 403) {
      console.error('❌ No tienes permisos para crear historia clínica');
      throw new Error('No tienes permisos para crear historia clínica');

    } else if (error?.status === 500) {
      console.error('❌ Error interno del servidor');
      throw new Error('Error interno del servidor. Intenta nuevamente');

    } else if (error?.status === 0) {
      console.error('❌ Error de conexión');
      throw new Error('Error de conexión. Verifica tu red');

    } else {
      // Error desconocido
      console.error('❌ Error desconocido:', error);
      throw new Error(`Error inesperado: ${error?.message || 'Error desconocido'}`);
    }
  }
}

  private async guardarNotaUrgencias(): Promise<void> {
    if (!this.notaUrgenciasForm.valid) {
      throw new Error('Formulario de nota de urgencias inválido');
    }

    const tipoNotaUrgencias = this.tiposDocumentosDisponibles.find(
      (t) => t.nombre === 'Nota de Urgencias'
    );
    if (!tipoNotaUrgencias) {
      throw new Error('Tipo de documento de urgencias no encontrado');
    }

    const documentoUrgencias = await this.crearDocumentoEspecifico(
      tipoNotaUrgencias.id_tipo_documento
    );

    const notaData = {
      id_documento: documentoUrgencias.id_documento,
      id_guia_diagnostico: this.notaUrgenciasForm.value.id_guia_diagnostico || null,
      motivo_atencion: this.notaUrgenciasForm.value.motivo_atencion,
      estado_conciencia: this.notaUrgenciasForm.value.estado_conciencia,
      resumen_interrogatorio:
      this.notaUrgenciasForm.value.resumen_interrogatorio,
      exploracion_fisica: this.notaUrgenciasForm.value.exploracion_fisica,
      resultados_estudios: this.notaUrgenciasForm.value.resultados_estudios,
      estado_mental: this.notaUrgenciasForm.value.estado_mental,
      diagnostico: this.notaUrgenciasForm.value.diagnostico,
      plan_tratamiento: this.notaUrgenciasForm.value.plan_tratamiento,
      pronostico: this.notaUrgenciasForm.value.pronostico,
    };

    const response = await firstValueFrom(
      this.notasUrgenciasService.createNotaUrgencias(notaData)
    );
    console.log('✅ Nota de urgencias guardada:', response);
  }

  // private async guardarNotaEvolucion(): Promise<void> {
  //   if (!this.notaEvolucionForm.valid) {
  //     throw new Error('Formulario de nota de evolución inválido');
  //   }

  //   const tipoNotaEvolucion = this.tiposDocumentosDisponibles.find(
  //     (t) => t.nombre === 'Nota de Evolución'
  //   );
  //   if (!tipoNotaEvolucion) {
  //     throw new Error('Tipo de documento de evolución no encontrado');
  //   }

  //   const documentoEvolucion = await this.crearDocumentoEspecifico(
  //     tipoNotaEvolucion.id_tipo_documento
  //   );

  //   const notaData: CreateNotaEvolucionDto = {
  //     id_documento: documentoEvolucion.id_documento,
  //     id_guia_diagnostico: this.notaEvolucionForm.value.id_guia_diagnostico || null,
  //     sintomas_signos: this.notaEvolucionForm.value.sintomas_signos,
  //     habitus_exterior: this.notaEvolucionForm.value.habitus_exterior,
  //     estado_nutricional: this.notaEvolucionForm.value.estado_nutricional,
  //     estudios_laboratorio_gabinete:
  //       this.notaEvolucionForm.value.estudios_laboratorio_gabinete,
  //     evolucion_analisis: this.notaEvolucionForm.value.evolucion_analisis,
  //     diagnosticos: this.notaEvolucionForm.value.diagnosticos,
  //     plan_estudios_tratamiento:
  //       this.notaEvolucionForm.value.plan_estudios_tratamiento,
  //     pronostico: this.notaEvolucionForm.value.pronostico,
  //     interconsultas: this.notaEvolucionForm.value.interconsultas || '',
  //     indicaciones_medicas:
  //       this.notaEvolucionForm.value.indicaciones_medicas || '',
  //     // Campos opcionales de exploración física
  //     exploracion_cabeza: this.notaEvolucionForm.value.exploracion_cabeza || '',
  //     exploracion_cuello: this.notaEvolucionForm.value.exploracion_cuello || '',
  //     exploracion_torax: this.notaEvolucionForm.value.exploracion_torax || '',
  //     exploracion_abdomen:
  //       this.notaEvolucionForm.value.exploracion_abdomen || '',
  //     exploracion_extremidades:
  //       this.notaEvolucionForm.value.exploracion_extremidades || '',
  //     exploracion_neurologico:
  //       this.notaEvolucionForm.value.exploracion_neurologico || '',
  //   };

  //   console.log('🔥 Enviando nota de evolución al backend:', notaData);

  //   const response = await firstValueFrom(
  //     this.notaEvolucionService.createNotaEvolucion(notaData)
  //   );

  //   console.log('✅ Nota de evolución guardada:', response);
  // }


  private async guardarNotaEvolucion(): Promise<void> {
  if (!this.notaEvolucionForm.valid) {
    // 🔥 VALIDACIÓN ESPECÍFICA CON CAMPOS NOM-004
    const errores = this.validarFormularioNOM004();
    throw new Error(`Formulario inválido: ${errores.join(', ')}`);
  }

  const tipoNotaEvolucion = this.tiposDocumentosDisponibles.find(
    (t) => t.nombre === 'Nota de Evolución'
  );

  if (!tipoNotaEvolucion) {
    throw new Error('Tipo de documento de evolución no encontrado');
  }

  const documentoEvolucion = await this.crearDocumentoEspecifico(
    tipoNotaEvolucion.id_tipo_documento
  );

  // 🔥 DATOS COMPLETOS SEGÚN TU MODELO ACTUALIZADO
  const notaData: CreateNotaEvolucionDto = {
    id_documento: documentoEvolucion.id_documento,
    id_guia_diagnostico: this.notaEvolucionForm.value.id_guia_diagnostico || null,

    // Datos de hospitalización
    dias_hospitalizacion: this.notaEvolucionForm.value.dias_hospitalizacion || null,
    fecha_ultimo_ingreso: this.notaEvolucionForm.value.fecha_ultimo_ingreso || null,

    // Signos vitales actuales
    temperatura: this.notaEvolucionForm.value.temperatura || null,
    frecuencia_cardiaca: this.notaEvolucionForm.value.frecuencia_cardiaca || null,
    frecuencia_respiratoria: this.notaEvolucionForm.value.frecuencia_respiratoria || null,
    presion_arterial_sistolica: this.notaEvolucionForm.value.presion_arterial_sistolica || null,
    presion_arterial_diastolica: this.notaEvolucionForm.value.presion_arterial_diastolica || null,
    saturacion_oxigeno: this.notaEvolucionForm.value.saturacion_oxigeno || null,
    peso_actual: this.notaEvolucionForm.value.peso_actual || null,
    talla_actual: this.notaEvolucionForm.value.talla_actual || null,

    // Campos obligatorios NOM-004
    sintomas_signos: this.notaEvolucionForm.value.sintomas_signos,
    habitus_exterior: this.notaEvolucionForm.value.habitus_exterior,
    estado_nutricional: this.notaEvolucionForm.value.estado_nutricional,
    estudios_laboratorio_gabinete: this.notaEvolucionForm.value.estudios_laboratorio_gabinete,
    evolucion_analisis: this.notaEvolucionForm.value.evolucion_analisis,
    diagnosticos: this.notaEvolucionForm.value.diagnosticos,
    plan_estudios_tratamiento: this.notaEvolucionForm.value.plan_estudios_tratamiento,
    pronostico: this.notaEvolucionForm.value.pronostico,

    // Exploración física detallada
    exploracion_cabeza: this.notaEvolucionForm.value.exploracion_cabeza || '',
    exploracion_cuello: this.notaEvolucionForm.value.exploracion_cuello || '',
    exploracion_torax: this.notaEvolucionForm.value.exploracion_torax || '',
    exploracion_abdomen: this.notaEvolucionForm.value.exploracion_abdomen || '',
    exploracion_extremidades: this.notaEvolucionForm.value.exploracion_extremidades || '',
    exploracion_columna: this.notaEvolucionForm.value.exploracion_columna || '',
    exploracion_genitales: this.notaEvolucionForm.value.exploracion_genitales || '',
    exploracion_neurologico: this.notaEvolucionForm.value.exploracion_neurologico || '',

    // Campos adicionales
    diagnosticos_guias: this.notaEvolucionForm.value.diagnosticos_guias || '',
    interconsultas: this.notaEvolucionForm.value.interconsultas || 'No se solicitaron interconsultas',
    indicaciones_medicas: this.notaEvolucionForm.value.indicaciones_medicas || '',
    observaciones_adicionales: this.notaEvolucionForm.value.observaciones_adicionales || ''
  };

  console.log('🔥 Enviando nota de evolución completa al backend:', notaData);

  const response = await firstValueFrom(
    this.notaEvolucionService.createNotaEvolucion(notaData)
  );

  console.log('✅ Nota de evolución guardada exitosamente:', response);
}


// 🔥 MÉTODO NUEVO PARA VALIDAR SEGÚN NOM-004
private validarFormularioNOM004(): string[] {
  const errores: string[] = [];
  const form = this.notaEvolucionForm;

  // Validar campos obligatorios NOM-004
  CAMPOS_OBLIGATORIOS_NOM004.forEach(campo => {
    if (campo === 'id_documento') return; // Se maneja automáticamente

    const control = form.get(campo);
    if (!control?.value || (typeof control.value === 'string' && control.value.trim() === '')) {
      errores.push(`${campo.replace('_', ' ')} es obligatorio según NOM-004`);
    }
  });

  // Validar longitud mínima para campos críticos
  const camposConLongitud = [
    { campo: 'sintomas_signos', minimo: 10 },
    { campo: 'evolucion_analisis', minimo: 10 },
    { campo: 'diagnosticos', minimo: 10 },
    { campo: 'plan_estudios_tratamiento', minimo: 10 }
  ];

  camposConLongitud.forEach(({ campo, minimo }) => {
    const valor = form.get(campo)?.value;
    if (valor && valor.length < minimo) {
      errores.push(`${campo.replace('_', ' ')} debe tener al menos ${minimo} caracteres`);
    }
  });

  return errores;
}

// 🔥 MÉTODO PARA VALIDAR DATOS ANTES DE ENVÍO
private validarDatosNOM004(): { valido: boolean; errores: string[]; advertencias: string[] } {
  const datos = this.notaEvolucionForm.value;

  return this.notaEvolucionService.validarDatosNOM004(datos);
}






// En perfil-paciente.ts, actualizar el método generarPDF:
async generarPDF(tipoDocumento: string): Promise<void> {
  try {
    console.log(`🔥 Generando PDF para: ${tipoDocumento}`);
    this.isCreatingDocument = true;

    // 🔥 OBTENER DATOS COMPLETOS DEL MÉDICO ACTUAL
    const medicoCompleto = await this.obtenerDatosMedicoCompleto();

    // 🔥 PREPARAR DATOS DEL PACIENTE CON ESTRUCTURA MEJORADA
    const datosPacienteEstructurados = {
      // ✅ INCLUIR DATOS DIRECTOS DEL PACIENTE
      ...this.pacienteCompleto,

      // ✅ ASEGURAR QUE LOS DATOS DE PERSONA ESTÉN DISPONIBLES
      persona: this.pacienteCompleto?.persona || this.pacienteCompleto,

      // ✅ EXPEDIENTE
      expediente: this.pacienteCompleto?.expediente,

      // ✅ SIGNOS VITALES HISTÓRICOS SI EXISTEN
      signosVitalesDisponibles: this.pacienteCompleto?.signosVitales || []
    };

    console.log('📋 Datos del paciente estructurados:', datosPacienteEstructurados);
    console.log('🩺 Signos vitales del formulario:', this.signosVitalesForm.value);
    console.log('📖 Guía clínica seleccionada:', this.guiaClinicaSeleccionada);

    switch (tipoDocumento) {
      case 'Historia Clínica':
        await this.pdfGeneratorService.generarHistoriaClinica({
          paciente: datosPacienteEstructurados,
          medico: medicoCompleto,
          expediente: this.pacienteCompleto?.expediente,
          historiaClinica: {
            ...this.historiaClinicaForm.value,
            // ✅ ACCESO CORRECTO A LUGAR DE NACIMIENTO
            lugar_nacimiento: this.extraerLugarNacimiento()
          },
          signosVitales: this.signosVitalesForm.value, // ✅ SIGNOS VITALES DEL FORMULARIO ACTUAL
          guiaClinica: this.guiaClinicaSeleccionada
        });
        break;

      case 'Nota de Evolución':
        await this.pdfGeneratorService.generarNotaEvolucion({
          paciente: datosPacienteEstructurados,
          medico: medicoCompleto,
          expediente: this.pacienteCompleto?.expediente,
          notaEvolucion: this.notaEvolucionForm.value,
          signosVitales: this.signosVitalesForm.value, // ✅ SIGNOS VITALES ACTUALES
          guiaClinica: this.guiaClinicaSeleccionada
        });
        break;

      case 'Nota de Urgencias':
        await this.pdfGeneratorService.generarNotaUrgencias({
          paciente: datosPacienteEstructurados,
          medico: medicoCompleto,
          expediente: this.pacienteCompleto?.expediente,
          notaUrgencias: this.notaUrgenciasForm.value,
          signosVitales: this.signosVitalesForm.value, // ✅ SIGNOS VITALES ACTUALES
          guiaClinica: this.guiaClinicaSeleccionada
        });
        break;

      case 'Signos Vitales':
        await this.pdfGeneratorService.generarSignosVitales({
          paciente: datosPacienteEstructurados,
          medico: medicoCompleto,
          expediente: this.pacienteCompleto?.expediente,
          signosVitales: {
            ...this.signosVitalesForm.value,
            // ✅ INCLUIR OBSERVACIONES ADICIONALES SI EXISTEN
            observaciones: this.signosVitalesForm.value.observaciones ||
                          'Sin observaciones específicas. Paciente estable.'
          }
        });
        break;

      default:
        console.warn('⚠️ Tipo de documento no soportado:', tipoDocumento);
        throw new Error(`Tipo de documento "${tipoDocumento}" no es válido`);
    }

    // ✅ MENSAJE DE ÉXITO MEJORADO
    this.success = `✅ PDF de ${tipoDocumento} generado exitosamente`;
    console.log(`✅ PDF de ${tipoDocumento} creado correctamente`);

    // 🔥 OPCIONAL: LIMPIAR MENSAJE DESPUÉS DE 5 SEGUNDOS
    setTimeout(() => {
      this.success = '';
    }, 5000);

  } catch (error) {
    console.error('❌ Error al generar PDF:', error);

    // 🔥 MENSAJE DE ERROR MÁS ESPECÍFICO
    if (error instanceof Error) {
      this.error = `Error al generar PDF: ${error.message}`;
    } else {
      this.error = 'Error al generar el PDF. Por favor intente nuevamente.';
    }

    // 🔥 OPCIONAL: LIMPIAR ERROR DESPUÉS DE 8 SEGUNDOS
    setTimeout(() => {
      this.error = '';
    }, 8000);

  } finally {
    this.isCreatingDocument = false;
  }
}




// 🔥 MÉTODO AUXILIAR PARA EXTRAER DIRECCIÓN COMPLETA
private extraerDireccionCompleta(): string {
  const persona = this.pacienteCompleto?.persona;
  const personaInfo = this.personaInfo;

  if (!persona && !personaInfo) return 'Sin dirección registrada';

  // Helper para acceso seguro a propiedades
  const getProperty = (obj: any, prop: string): any => {
    return obj?.[prop] || null;
  };

  // Usar el objeto persona principal o personaInfo como fallback
  const datosPersona = persona || personaInfo;

  const partes = [
    getProperty(datosPersona, 'domicilio') ||
    getProperty(datosPersona, 'direccion') ||
    getProperty(datosPersona, 'calle'),

    getProperty(datosPersona, 'numero_exterior') ?
      `#${getProperty(datosPersona, 'numero_exterior')}` : '',

    getProperty(datosPersona, 'numero_interior') ?
      `Int. ${getProperty(datosPersona, 'numero_interior')}` : '',

    getProperty(datosPersona, 'colonia'),
    getProperty(datosPersona, 'municipio') || getProperty(datosPersona, 'ciudad'),
    getProperty(datosPersona, 'estado'),

    getProperty(datosPersona, 'codigo_postal') ?
      `C.P. ${getProperty(datosPersona, 'codigo_postal')}` : ''
  ].filter(parte => parte && parte.trim() !== '' && parte.trim() !== 'null');

  return partes.length > 0 ? partes.join(', ') : 'Sin dirección registrada';
}




private extraerLugarNacimiento(): string {
  // ✅ USAR MÉTODO MEJORADO CON HELPERS
  const objetos = [
    this.pacienteCompleto?.persona,
    this.personaInfo,
    this.pacienteCompleto?.paciente as any
  ];

  const propiedades = [
    'lugar_nacimiento',
    'ciudad_nacimiento',
    'municipio_nacimiento',
    'estado_nacimiento'
  ];

  for (const propiedad of propiedades) {
    const valor = this.findPropertyInObjects(objetos, propiedad);
    if (valor) return valor;
  }

  return 'No especificado';
}




private construirPacienteCompleto(data: any): void {
  console.log('🔍 Datos recibidos para construir paciente completo:', data);

  // ✅ ACCESO SEGURO A LOS DATOS CON TYPE ASSERTION
  const pacienteData = data.paciente?.data as any || {};

  this.pacienteCompleto = {
    // ✅ ESTRUCTURA MEJORADA - acceso seguro a persona
    persona: pacienteData.persona ||
             pacienteData['persona'] ||
             pacienteData,

    paciente: {
      ...pacienteData,
      // ✅ ASEGURAR QUE TENGA ACCESO A PERSONA
      persona: pacienteData.persona || pacienteData['persona']
    } as Paciente & { persona?: any; [key: string]: any },

    expediente: data.expediente?.data || {},
    documentos: Array.isArray(data.documentos?.data) ? data.documentos.data : [],
    ultimoInternamiento: null,
    signosVitales: Array.isArray(data.signosVitales?.data) ? data.signosVitales.data : [],
  };

  console.log('✅ Paciente completo construido:', this.pacienteCompleto);
  console.log('✅ Persona info:', this.pacienteCompleto.persona);

  this.preLlenarFormularios();
}

// 🔥 MÉTODO HELPER ESPECÍFICO PARA FECHAS
private obtenerFechaNacimiento(): string | null {
  const objetos = [
    this.pacienteCompleto?.persona,
    this.personaInfo,
    this.pacienteCompleto?.paciente as any
  ];

  for (const obj of objetos) {
    const fecha = this.getNestedProperty(obj, 'fecha_nacimiento');
    if (fecha && typeof fecha === 'string') {
      return fecha;
    }
  }

  return null;
}


// 🔥 MÉTODO NUEVO PARA OBTENER DATOS COMPLETOS DEL MÉDICO
private async obtenerDatosMedicoCompleto(): Promise<any> {
  try {
    if (!this.medicoActual) {
      throw new Error('No hay médico autenticado');
    }

    console.log('🩺 Obteniendo datos completos del médico:', this.medicoActual);

    const response = await firstValueFrom(
      this.personalMedicoService.getPersonalMedicoById(this.medicoActual)
    );

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
        departamento: medico.departamento
      };
    }

    // Fallback con datos del usuario autenticado
    const usuarioActual = this.authService.getCurrentUser();
    return {
      id_personal_medico: this.medicoActual,
      nombre_completo: usuarioActual?.nombre_completo || 'Médico no identificado',
      numero_cedula: 'No disponible',
      especialidad: usuarioActual?.especialidad || 'No especificada',
      cargo: usuarioActual?.cargo || 'Médico',
      departamento: usuarioActual?.departamento || 'No especificado'
    };

  } catch (error) {
    console.error('❌ Error al obtener datos del médico:', error);

    // Fallback básico
    return {
      id_personal_medico: this.medicoActual || 0,
      nombre_completo: 'Médico no identificado',
      numero_cedula: 'No disponible',
      especialidad: 'No especificada',
      cargo: 'Médico',
      departamento: 'No especificado'
    };
  }
}


// mostrarConfirmacionPDF(tipoDocumento: string): void {
//   if (confirm(`✅ ${tipoDocumento} guardado correctamente.\n\n¿Desea generar el PDF ahora?`)) {
//     this.generarPDF(tipoDocumento);
//   }
// }
mostrarConfirmacionPDF(tipoDocumento: string): void {
  // ❌ No mostrar confirmación para signos vitales
  if (tipoDocumento === 'Signos Vitales') {
    console.log('PDF de signos vitales desactivado por ahora');
    return;
  }

  // ✅ Mostrar confirmación para otros documentos
  if (confirm(`✅ ${tipoDocumento} guardado correctamente.\n\n¿Desea generar el PDF ahora?`)) {
    this.generarPDF(tipoDocumento);
  }
}

  private async crearDocumentoClinicoPadre(): Promise<void> {
    if (!this.pacienteCompleto?.expediente.id_expediente) {
      throw new Error('No hay expediente disponible');
    }
    const tipoHistoriaClinica = this.tiposDocumentosDisponibles.find(
      (t) =>
        t.nombre === 'Historia Clínica' ||
        t.nombre.toLowerCase().includes('historia')
    );

    if (!tipoHistoriaClinica) {
      console.error(
        ' Tipos de documento disponibles:',
        this.tiposDocumentosDisponibles
      );
      throw new Error('Tipo de documento Historia Clínica no encontrado');
    }

    const documentoData = {
      id_expediente: this.pacienteCompleto.expediente.id_expediente,
      id_internamiento:
        this.pacienteCompleto.ultimoInternamiento?.id_internamiento || null,
      id_tipo_documento: tipoHistoriaClinica.id_tipo_documento,
      id_personal_creador: this.medicoActual!,
      fecha_elaboracion: new Date().toISOString(),
      estado: EstadoDocumento.ACTIVO,
    };

    console.log(' Creando documento clínico padre:', documentoData);

    const response = await firstValueFrom(
      this.documentosService.createDocumentoClinico(documentoData)
    );

    if (response?.data?.id_documento) {
      this.documentoClinicoActual = response.data.id_documento;
      console.log(
        'Documento clínico padre creado con ID:',
        this.documentoClinicoActual
      );
    } else {
      console.error(' Respuesta del backend:', response);
      throw new Error('Error al crear documento clínico');
    }
  }

  private async crearDocumentoEspecifico(
    idTipoDocumento: number
  ): Promise<any> {
    if (!this.pacienteCompleto?.expediente.id_expediente) {
      throw new Error('No hay expediente disponible');
    }

    const documentoData = {
      id_expediente: this.pacienteCompleto.expediente.id_expediente,
      id_internamiento:
        this.pacienteCompleto.ultimoInternamiento?.id_internamiento || null,
      id_tipo_documento: idTipoDocumento,
      id_personal_creador: this.medicoActual!,
      fecha_elaboracion: new Date().toISOString(),
      estado: EstadoDocumento.ACTIVO,
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

  private getIconoTipoDocumento(nombre: string): string {
    const iconos: { [key: string]: string } = {
      'Historia Clínica': 'fas fa-file-medical-alt',
      'Nota de Urgencias': 'fas fa-ambulance',
      'Nota de Evolución': 'fas fa-chart-line',
      'Nota de Interconsulta': 'fas fa-user-md',
      'Nota Preoperatoria': 'fas fa-procedures',
      'Nota Postoperatoria': 'fas fa-band-aid',
      'Nota de Egreso': 'fas fa-sign-out-alt',
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
      'Nota de Egreso': 'indigo',
    };
    return colores[nombre] || 'gray';
  }
  private requiereInternamiento(nombre: string): boolean {
    const requiereInternamiento = [
      'Nota de Evolución',
      'Nota Preoperatoria',
      'Nota Postoperatoria',
      'Nota de Egreso',
    ];
    return requiereInternamiento.includes(nombre);
  }

  calcularEdad(fechaNacimiento?: string): number {
  // ✅ USAR MÉTODOS HELPER PARA ACCESO SEGURO
  let fecha = fechaNacimiento;

  if (!fecha) {
    // Buscar fecha de nacimiento usando métodos seguros
    const persona = this.pacienteCompleto?.persona;
    const personaInfo = this.personaInfo;

    fecha = this.getNestedProperty(persona, 'fecha_nacimiento') ||
            this.getNestedProperty(personaInfo, 'fecha_nacimiento') ||
            this.getNestedProperty(this.pacienteCompleto?.paciente as any, 'fecha_nacimiento');
  }

  if (!fecha) return 0;

  const today = new Date();
  const birthDate = new Date(fecha);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
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
        day: 'numeric',
      });
    } catch (error) {
      return fecha;
    }
  }

  getNombreCompleto(): string {
  const persona = this.pacienteCompleto?.persona;
  const personaInfo = this.personaInfo;

  // ✅ BUSCAR EN MÚLTIPLES UBICACIONES DE FORMA SEGURA
  const objetos = [persona, personaInfo, this.pacienteCompleto?.paciente as any];

  let nombre = '';
  let apellidoPaterno = '';
  let apellidoMaterno = '';

  // Buscar nombre en todos los objetos posibles
  for (const obj of objetos) {
    if (!nombre) nombre = this.getNestedProperty(obj, 'nombre') || '';
    if (!apellidoPaterno) apellidoPaterno = this.getNestedProperty(obj, 'apellido_paterno') || '';
    if (!apellidoMaterno) apellidoMaterno = this.getNestedProperty(obj, 'apellido_materno') || '';

    // Si ya tenemos todos los datos, salir del bucle
    if (nombre && apellidoPaterno && apellidoMaterno) break;
  }

  const nombreCompleto = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim();

  return nombreCompleto || 'Sin nombre registrado';
}

  get personaInfo(): any {
  // ✅ ACCESO SEGURO CON MÚLTIPLES FALLBACKS
  const pacienteCompleto = this.pacienteCompleto;

  if (!pacienteCompleto) return {};

  // ✅ USAR TYPE ASSERTION Y ACCESO SEGURO
  const pacienteData = pacienteCompleto.paciente as any;

  // Intentar diferentes rutas de acceso
  return pacienteCompleto.persona ||
         pacienteCompleto['persona'] ||
         pacienteData?.persona ||
         pacienteData?.['persona'] ||
         pacienteCompleto.paciente ||
         {};
  }

  getColorClase(color: string): string {
    const colores: { [key: string]: string } = {
      blue: 'border-blue-200 bg-blue-50 text-blue-800',
      red: 'border-red-200 bg-red-50 text-red-800',
      green: 'border-green-200 bg-green-50 text-green-800',
      purple: 'border-purple-200 bg-purple-50 text-purple-800',
      orange: 'border-orange-200 bg-orange-50 text-orange-800',
      indigo: 'border-indigo-200 bg-indigo-50 text-indigo-800',
      gray: 'border-gray-200 bg-gray-50 text-gray-800',
    };
    return colores[color] || colores['gray'];
  }

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
    return (
      this.formularioEstado[this.formularioActivo] ||
      this.formularioActualValido
    );
  }

  get mostrarCargando(): boolean {
    return this.isLoading;
  }

  get mostrarErrores(): boolean {
    return !!this.error && !this.isLoading;
  }

  get mostrarContenido(): boolean {
    return !!this.pacienteCompleto && !this.isLoading && !this.error;
  }
  volverAListaPacientes(): void {
    this.router.navigate(['/app/personas/pacientes']);
  }

  refrescarDatos(): void {
    this.initializeComponent();
  }

  // 🔥 MÉTODO HELPER PARA BUSCAR EN MÚLTIPLES OBJETOS
private findPropertyInObjects(objects: any[], property: string): any {
  for (const obj of objects) {
    if (!obj) continue;

    const value = this.getNestedProperty(obj, property);
    if (value && typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }
  return null;
}

// 🔥 TYPE GUARDS PARA VALIDACIÓN SEGURA
private esObjetoValido(obj: any): boolean {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
}

private tienePropiedad(obj: any, prop: string): boolean {
  return this.esObjetoValido(obj) && (prop in obj || obj[prop] !== undefined);
}

// 🔥 MÉTODO MEJORADO CON TYPE GUARDS
private getNestedProperty(obj: any, path: string): any {
  if (!this.esObjetoValido(obj)) return null;

  // Intentar acceso directo primero
  if (this.tienePropiedad(obj, path)) {
    return obj[path];
  }

  return null;
}



  /**
   * Maneja errores de forma inteligente sin interrumpir el trabajo
   */
  private manejarError(error: any, contexto: string): void {
    console.error(` Error en ${contexto}:`, error);

    // Clasificar el tipo de error
    const tipoError = this.clasificarError(error);

    switch (tipoError) {
      case 'conexion':
        this.manejarErrorConexion(error, contexto);
        break;
      case 'validacion':
        this.manejarErrorValidacion(error, contexto);
        break;
      case 'permisos':
        this.manejarErrorPermisos(error, contexto);
        break;
      case 'critico':
        this.manejarErrorCritico(error, contexto);
        break;
      default:
        this.manejarErrorGeneral(error, contexto);
    }
  }

  /**
   * Clasifica el error para manejo específico
   */
  private clasificarError(
    error: any
  ): 'conexion' | 'validacion' | 'permisos' | 'critico' | 'general' {
    if (!navigator.onLine) return 'conexion';
    if (error?.status === 0 || error?.status === 504 || error?.status === 503)
      return 'conexion';
    if (error?.status === 400 || error?.status === 422) return 'validacion';
    if (error?.status === 401 || error?.status === 403) return 'permisos';
    if (error?.status === 500 || error?.message?.includes('crítico'))
      return 'critico';
    return 'general';
  }

  /**
   * Error de conexión - No interrumpe el trabajo
   */
  private manejarErrorConexion(error: any, contexto: string): void {
    this.hayProblemasConexion = true;
    this.estadoAutoguardado = 'offline';

    // Guardar localmente para no perder datos
    this.guardarLocalmenteFormulario();

    // Mostrar toast discreto
    this.error =
      'Problema de conexión detectado. Tus datos se guardan localmente.';
    this.mostrarError = true;

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      this.mostrarError = false;
    }, 5000);

    // Intentar reconectar cada 30 segundos
    this.iniciarReconexionAutomatica();
  }

  /**
   * Error de validación - Mostrar en contexto
   */
  private manejarErrorValidacion(error: any, contexto: string): void {
    const mensaje = this.extraerMensajeValidacion(error);
    this.error = `Error de validación: ${mensaje}`;
    this.mostrarError = true;

    // Auto-ocultar después de 7 segundos
    setTimeout(() => {
      this.mostrarError = false;
    }, 7000);
  }

  /**
   * Error de permisos - Manejo específico
   */
  private manejarErrorPermisos(error: any, contexto: string): void {
    this.guardarLocalmenteFormulario();

    let mensaje = 'No tienes permisos para realizar esta acción.';

    if (error?.status === 401) {
      mensaje = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    } else if (error?.status === 403) {
      mensaje = 'No tienes los permisos necesarios para esta operación.';
    }

    this.error = mensaje;
    this.mostrarError = true;

    // Para errores de permisos, mostrar más tiempo
    setTimeout(() => {
      this.mostrarError = false;
    }, 10000);

    // Si es error 401, podríamos redirigir al login después de un tiempo
    if (error?.status === 401) {
      setTimeout(() => {
        // Opcional: redirigir al login
        // this.router.navigate(['/login']);
      }, 8000);
    }
  }

  /**
   * Error crítico - Requiere atención pero preserva trabajo
   */
  private manejarErrorCritico(error: any, contexto: string): void {
    this.guardarLocalmenteFormulario();
    this.errorCritico = `Error crítico en ${contexto}: ${
      error?.message || 'Error desconocido'
    }`;
  }

  /**
   * Error general - Manejo suave
   */
  private manejarErrorGeneral(error: any, contexto: string): void {
    this.error = `Error en ${contexto}. Tus datos están seguros.`;
    this.mostrarError = true;

    setTimeout(() => {
      this.mostrarError = false;
    }, 4000);
  }

  // ==========================================
  // AUTOGUARDADO LOCAL Y RECUPERACIÓN
  // ==========================================

  /**
   * Guarda el formulario actual en localStorage
   */
  private guardarLocalmenteFormulario(): void {
    try {
      const datosFormulario = {
        formularioActivo: this.formularioActivo,
        signosVitales: this.signosVitalesForm.value,
        historiaClinica: this.historiaClinicaForm.value,
        notaUrgencias: this.notaUrgenciasForm.value,
        notaEvolucion: this.notaEvolucionForm.value,
        formularioEstado: this.formularioEstado,
        timestamp: Date.now(),
        pacienteId: this.pacienteId,
      };

      localStorage.setItem(
        `perfil_paciente_${this.pacienteId}`,
        JSON.stringify(datosFormulario)
      );
      this.ultimoGuardadoLocal = Date.now();

      console.log('💾 Datos guardados localmente');
    } catch (error) {
      console.warn('No se pudo guardar localmente:', error);
    }
  }

  /**
   * Recupera datos del formulario desde localStorage
   */
  private recuperarDatosLocales(): boolean {
    try {
      const datosGuardados = localStorage.getItem(
        `perfil_paciente_${this.pacienteId}`
      );
      if (!datosGuardados) return false;

      const datos = JSON.parse(datosGuardados);
      const tiempoTranscurrido = Date.now() - datos.timestamp;

      // Solo recuperar si son datos recientes (menos de 24 horas)
      if (tiempoTranscurrido > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(`perfil_paciente_${this.pacienteId}`);
        return false;
      }

      // Restaurar formularios
      this.signosVitalesForm.patchValue(datos.signosVitales);
      this.historiaClinicaForm.patchValue(datos.historiaClinica);
      this.notaUrgenciasForm.patchValue(datos.notaUrgencias);
      this.notaEvolucionForm.patchValue(datos.notaEvolucion);
      this.formularioEstado = datos.formularioEstado;
      this.formularioActivo = datos.formularioActivo;

      this.success = 'Datos recuperados desde tu última sesión 📁';

      setTimeout(() => {
        this.success = null;
      }, 5000);

      return true;
    } catch (error) {
      console.warn('Error al recuperar datos locales:', error);
      return false;
    }
  }

  /**
   * Inicia autoguardado cada 30 segundos
   */
  private iniciarAutoguardado(): void {
    this.autoguardadoInterval = setInterval(() => {
      if (this.hayFormularioCambiado()) {
        this.guardarLocalmenteFormulario();
        this.estadoAutoguardado = 'guardado';

        setTimeout(() => {
          this.estadoAutoguardado = null;
        }, 2000);
      }
    }, 30000);
  }

  /**
   * Verifica si hay cambios en el formulario
   */
  private hayFormularioCambiado(): boolean {
    return (
      this.signosVitalesForm.dirty ||
      this.historiaClinicaForm.dirty ||
      this.notaUrgenciasForm.dirty ||
      this.notaEvolucionForm.dirty
    );
  }

  // ==========================================
  // MÉTODOS PÚBLICOS PARA EL TEMPLATE
  // ==========================================

  /**
   * Intenta reconectar y reenviar datos
   */
  intentarDeNuevo(): void {
    this.estadoAutoguardado = 'guardando';

    // Verificar conexión
    if (navigator.onLine) {
      this.verificarConexion();
    } else {
      this.error = 'Sin conexión a internet. Verifica tu red.';
      this.estadoAutoguardado = 'offline';
    }
  }

  /**
   * Oculta el error y permite continuar trabajando
   */
  ocultarError(): void {
    this.mostrarError = false;
    this.error = null;
  }

  /**
   * Verifica el estado de la conexión
   */
  verificarConexion(): void {
    // Ping simple al servidor
    this.expedientesService
      .getExpedienteByPacienteId(this.pacienteId!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.hayProblemasConexion = false;
          this.estadoAutoguardado = 'guardado';
          this.success = 'Conexión restablecida ';

          setTimeout(() => {
            this.success = null;
          }, 3000);
        },
        error: () => {
          this.hayProblemasConexion = true;
          this.estadoAutoguardado = 'offline';
        },
      });
  }

  /**
   * Recarga la página preservando datos
   */
  recargarPagina(): void {
    this.guardarLocalmenteFormulario();
    window.location.reload();
  }

  /**
   * Cierra error crítico y continúa
   */
  cerrarErrorCritico(): void {
    this.errorCritico = null;
  }

  /**
   * Inicia reconexión automática
   */
  private iniciarReconexionAutomatica(): void {
    const intentarReconectar = () => {
      if (this.hayProblemasConexion && navigator.onLine) {
        this.verificarConexion();
      }
    };

    // Intentar cada 30 segundos
    setInterval(intentarReconectar, 30000);
  }

  /**
   * Extrae mensaje de error de validación
   */
  private extraerMensajeValidacion(error: any): string {
    if (error?.error?.message) return error.error.message;
    if (error?.error?.errors) return error.error.errors.join(', ');
    if (error?.message) return error.message;
    return 'Datos inválidos';
  }
}
