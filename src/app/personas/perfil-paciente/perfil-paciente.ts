import {Component,OnInit,OnDestroy,HostListener,ViewChild,ElementRef,} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, FormArray,} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {  Subject,  takeUntil,  forkJoin,  Observable,  firstValueFrom,  switchMap,  catchError,  of,} from 'rxjs';
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
import { Expediente, UpdateExpedienteDto } from '../../models/expediente.model';
import { DocumentoClinico } from '../../models/documento-clinico.model';
import {SignosVitales,CreateSignosVitalesDto,} from '../../models/signos-vitales.model';
import { CreateHistoriaClinicaDto } from '../../models/historia-clinica.model';
import { CreateNotaUrgenciasDto } from '../../models/nota-urgencias.model';
import { CAMPOS_OBLIGATORIOS_NOM004, CreateNotaEvolucionDto,} from '../../models/nota-evolucion.model';
import { TipoDocumento } from '../../models/tipo-documento.model';
import { Servicio } from '../../models/servicio.model';
import { ApiResponse, EstadoDocumento } from '../../models/base.models';
import { AuthService } from '../../services/auth/auth.service';
import { GuiasClinicasService } from '../../services/catalogos/guias-clinicas';
import { GuiaClinica } from '../../models/guia-clinica.model';
import { PdfGeneratorService } from '../../services/pdf/pdf-generator.service';
import { ConsentimientosInformados } from '../../services/documentos-clinicos/consentimientos-informados';
import { NotasPreoperatoria } from '../../services/documentos-clinicos/notas-preoperatoria';
import { NotasPostoperatoria } from '../../services/documentos-clinicos/notas-postoperatoria';
import { NotasPreanestesica } from '../../services/documentos-clinicos/notas-preanestesica';
import { NotasPostanestesica } from '../../services/documentos-clinicos/notas-postanestesica';
import { NotasInterconsulta } from '../../services/documentos-clinicos/notas-interconsulta';
import { ConsentimientoInformado } from '../../models/consentimiento-informado.model';
import { NotaPreoperatoria } from '../../models/nota-preoperatoria.model';
import { NotaPostoperatoria } from '../../models/nota-postoperatoria.model';
import { NotaPreanestesica } from '../../models/nota-preanestesica.model';
import { NotaPostanestesica } from '../../models/nota-postanestesica.model';
import { NotaInterconsulta } from '../../models/nota-interconsulta.model';
import { SolicitudesEstudio } from '../../services/documentos-clinicos/solicitudes-estudio';
import { ReferenciasTraslado } from '../../services/documentos-clinicos/referencias-traslado';
import { PrescripcionesMedicamentoService } from '../../services/documentos-clinicos/prescripciones-medicamento';
import { ControlCrecimientoService } from '../../services/documentos-clinicos/controlcrecimientoService';
import { EsquemaVacunacionService } from '../../services/documentos-clinicos/esquema-vacunacion';
import { HojaFrontalService } from '../../services/documentos-clinicos/hoja-frontal';
import { AltaVoluntariaService } from '../../services/documentos-clinicos/alta-voluntaria';
import { CultivosService } from '../../services/documentos-clinicos/cultivos-service';
import { GasometriaService } from '../../services/documentos-clinicos/gasometria';
import {  SolicitudEstudio,  CreateSolicitudEstudioDto,} from '../../models/solicitud-estudio.model';
import { ReferenciaTraslado, CreateReferenciaTraladoDto,} from '../../models/referencia-traslado.model';
import {PrescripcionMedicamento,CreatePrescripcionMedicamentoDto,} from '../../models/prescripcion-medicamento.model';
import {ControlCrecimiento,CreateControlCrecimientoDto,} from '../../models/control-crecimiento.model';
import { EsquemaVacunacion, RegistroVacuna, CreateEsquemaVacunacionDto,} from '../../models/esquema-vacunacion.model';
import { HojaFrontal } from '../../models/hoja-frontal.model';
import { AltaVoluntaria } from '../../models/alta-voluntaria.model';
import { SolicitudCultivo } from '../../models/solicitud-cultivo.model';
import { SolicitudGasometria } from '../../models/solicitud-gasometria.model';
import { AntecedentesHeredoFamiliaresService } from '../../services/documentos-clinicos/antecedentes-heredo-familiares';
import { AntecedentesPerinatalesService } from '../../services/documentos-clinicos/antecedentes-perinatales';
import { DesarrolloPsicomotrizService } from '../../services/documentos-clinicos/desarrollo-psicomotriz';
import { EstadoNutricionalPediatricoService } from '../../services/documentos-clinicos/estado-nutricional-pediatrico';
import { InmunizacionesService } from '../../services/documentos-clinicos/inmunizaciones';
import { VacunasAdicionalesService } from '../../services/documentos-clinicos/vacunas-adicionales';
import { CamasService } from '../../services/gestion-expedientes/camas';
import { Cama } from '../../models/cama.model';
import { ValidacionesComunesService } from '../../services/validaciones/validaciones-comunes.service';
import { MedicamentosService } from '../../services/catalogos/medicamentos';
import { Medicamento } from '../../models/medicamento.model';

interface TipoDocumentoConfig {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  requiereInternamiento: boolean;
  soloAdultos: boolean;
  soloPediatrico: boolean;
  requiereQuirurgico: boolean;
  orden: number;
}

interface PacienteCompleto {
  persona: {
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
    religion?: string;
    estado_civil?: string;
    [key: string]: any;
  };
  paciente: Paciente & {
    persona?: any;
    fecha_nacimiento?: string;
    tipo_sangre?: string;
    ocupacion?: string;
    escolaridad?: string;
    familiar_responsable?: string;
    telefono_familiar?: string;
    religion?: string;
    nombre_padre?: string;
    nombre_madre?: string;
    edad_padre?: number;
    edad_madre?: number;
    [key: string]: any;
  };
  expediente: Expediente;
  documentos: DocumentoClinico[] | null;
  ultimoInternamiento: any;
  signosVitales: SignosVitales[] | null;
  tipo_sangre?: string;
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
  historiaClinicaPediatrica: boolean;
  notaUrgencias: boolean;
  notaEvolucion: boolean;
  consentimiento: boolean;
  notaPreoperatoria: boolean;
  notaPostoperatoria: boolean;
  notaPreanestesica: boolean;
  notaPostanestesica: boolean;
  notaInterconsulta: boolean;
  controlCrecimiento: boolean;
  esquemaVacunacion: boolean;
  solicitudEstudio: boolean;
  referenciaTraslado: boolean;
  prescripcionMedicamento: boolean;
  registroTransfusion: boolean;
  notaEgreso: boolean;
  desarrolloPsicomotriz: boolean;
  alimentacionPediatrica: boolean;
  tamizajeNeonatal: boolean;
  antecedentesHeredoFamiliares: boolean;
  antecedentesPerinatales: boolean;
  estadoNutricionalPediatrico: boolean;
  inmunizaciones: boolean;
  vacunasAdicionales: boolean;
  solicitudCultivo: boolean;
  solicitudGasometria: boolean;
  hojaFrontal: boolean;
  altaVoluntaria: boolean;
}

type TabActiva = 'general' | 'crear' | 'historial' | 'datos';
type FormularioActivo =
  | 'signosVitales' | 'historiaClinica' | 'hojaFrontal' | 'notaUrgencias' | 'notaEvolucion'
  | 'consentimiento' | 'notaPreoperatoria' | 'notaPostoperatoria' | 'notaPreanestesica'
  | 'notaPostanestesica' | 'notaInterconsulta' | 'controlCrecimiento' | 'esquemaVacunacion'
  | 'solicitudEstudio' | 'referenciaTraslado' | 'prescripcionMedicamento' | 'registroTransfusion'
  | 'notaEgreso' | 'historiaClinicaPediatrica' | 'desarrolloPsicomotriz' | 'alimentacionPediatrica'
  | 'tamizajeNeonatal' | 'antecedentesHeredoFamiliares' | 'antecedentesPerinatales'
  | 'estadoNutricionalPediatrico' | 'inmunizaciones' | 'vacunasAdicionales' | 'solicitudCultivo'
  | 'solicitudGasometria' | 'altaVoluntaria' | null;

// ✅ AGREGAR AQUÍ
type FiltroCategoria = 'todos' | 'frecuentes' | 'obligatorios' | 'pediatricos';

@Component({
  selector: 'app-perfil-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './perfil-paciente.html',
  styleUrl: './perfil-paciente.css',
})

export class PerfilPaciente implements OnInit, OnDestroy {

  @ViewChild('formNav') formNav!: ElementRef;
  private destroy$ = new Subject<void>();
  private autoguardadoInterval: any;
  private ultimoGuardadoLocal = Date.now();
  pacienteCompleto: PacienteCompleto | null = null;
  pacienteId: number | null = null;
  medicoActual: number | null = null;
  medicoCompleto: any | null = null;
  isLoading = true;
  isCreatingDocument = false;
  guardandoFormulario = false;
  error: string | null = null;
  mostrarError = false;
  hayProblemasConexion = false;
  errorCritico: string | null = null;
  estadoAutoguardado: 'guardado' | 'guardando' | 'offline' | null = null;
  esPacientePediatrico: boolean = false;
  mostrarDocumentosQuirurgicos: boolean = false;
  success: string | null = null;
  camas: Cama[] = [];
  camasDisponibles: Cama[] = [];
  camaSeleccionada: Cama | null = null;
  mostrarDropdownCamas = false;
  filtroCama = '';
  guiasClinicasSeleccionadas: GuiaClinica[] = [];

  medicamentosDisponibles: Medicamento[] = [];
medicamentosFiltrados: Medicamento[] = [];
medicamentosMasPrescitos: Medicamento[] = [];
gruposTerapeuticos: string[] = [];
presentacionesDisponibles: string[] = [];

  // 🔥 FORMULARIOS CORREGIDOS - TODOS DECLARADOS
  signosVitalesForm: FormGroup;
  historiaClinicaForm: FormGroup;
  notaUrgenciasForm: FormGroup;
  notaEvolucionForm: FormGroup;
  consentimientoForm: FormGroup;
  notaPreoperatoriaForm: FormGroup;
  notaPostoperatoriaForm: FormGroup;
  notaPreanestesicaForm: FormGroup;
  notaPostanestesicaForm: FormGroup;
  notaInterconsultaForm: FormGroup;
  solicitudEstudioForm!: FormGroup;
  referenciaForm!: FormGroup;
  prescripcionForm!: FormGroup;
  controlCrecimientoForm!: FormGroup;
  esquemaVacunacionForm!: FormGroup;
  solicitudCultivoForm!: FormGroup;
  solicitudGasometriaForm!: FormGroup;
  registroTransfusionForm!: FormGroup;
  altaVoluntariaForm!: FormGroup;
  historiaClinicaPediatricaForm!: FormGroup;
  desarrolloPsicomotrizForm!: FormGroup;
  alimentacionPediatricaForm!: FormGroup;
  tamizajeNeonatalForm!: FormGroup;
  antecedentesHeredoFamiliaresForm!: FormGroup;
  antecedentesPerinatalesForm!: FormGroup;
  estadoNutricionalPediatricoForm!: FormGroup;
  inmunizacionesForm!: FormGroup;
  vacunasAdicionalesForm!: FormGroup;
  hojaFrontalForm!: FormGroup; // ✅ AGREGADO

  tabActiva: TabActiva = 'general';
  formularioActivo: FormularioActivo = 'signosVitales';
  grupoExpandido: string | null = 'basicos';
  mostrarTodosFormularios = false;
  busquedaFormulario = '';
  filtroActivo: FiltroCategoria = 'todos';
  formulariosVisibles: string[] = [];


  gruposFormularios = {
    basicos: {
      nombre: 'Documentos Básicos',
      icono: 'fas fa-file-medical',
      color: 'blue',
      formularios: [ 'signosVitales','historiaClinica','notaUrgencias', 'notaEvolucion' ],
    },
    quirurgicos: {
      nombre: 'Documentos Quirúrgicos',
      icono: 'fas fa-procedures',
      color: 'orange',
      formularios: ['notaPreoperatoria','notaPreanestesica','notaPostoperatoria', 'notaPostanestesica'],
    },
    solicitudes: {
      nombre: 'Solicitudes de Estudios',
      icono: 'fas fa-vial',
      color: 'green',
      formularios: ['solicitudEstudio', 'solicitudCultivo','solicitudGasometria'],
    },
    pediatricos: {
      nombre: 'Documentos Pediátricos',
      icono: 'fas fa-baby',
      color: 'pink',
      formularios: [
        'historiaClinicaPediatrica', 'controlCrecimiento', 'esquemaVacunacion', 'desarrolloPsicomotriz',
        'antecedentesHeredoFamiliares', 'antecedentesPerinatales', 'estadoNutricionalPediatrico',
        'inmunizaciones', 'vacunasAdicionales', 'alimentacionPediatrica', 'tamizajeNeonatal'
      ],
      condition: () => this.esPacientePediatrico,
    },
    prescripciones: {
      nombre: 'Prescripciones',
      icono: 'fas fa-pills',
      color: 'purple',
      formularios: ['prescripcionMedicamento', 'registroTransfusion'],
    },
    especiales: {
      nombre: 'Documentos Especiales',
      icono: 'fas fa-folder-open',
      color: 'gray',
      formularios: [ 'hojaFrontal', 'altaVoluntaria', 'consentimiento', 'referenciaTraslado' ],
    },
  };

  configFormularios: { [key: string]: any } = {
    signosVitales: { nombre: 'Signos Vitales', icono: 'fas fa-heartbeat', obligatorio: true, frecuente: true, completado: false },
    historiaClinica: { nombre: 'Historia Clínica', icono: 'fas fa-file-medical-alt', obligatorio: true, frecuente: true, completado: false },
    notaUrgencias: {nombre: 'Nota Urgencias',icono: 'fas fa-ambulance',obligatorio: true,frecuente: true,completado: false},
    notaEvolucion: {nombre: 'Evolución', icono:'fas fa-chart-line', obligatorio: false,frecuente: true,completado: false},
    notaPreoperatoria: {nombre: 'Preoperatoria',icono: 'fas fa-user-md',obligatorio: false,frecuente: false,completado: false},
    notaPreanestesica: {nombre: 'Preanestésica',icono: 'fas fa-syringe',obligatorio: false,frecuente: false,completado: false },
    notaPostoperatoria: {nombre: 'Postoperatoria',icono: 'fas fa-bed',obligatorio: false,frecuente: false,completado: false},
    notaPostanestesica: {nombre: 'Postanestésica',icono: 'fas fa-clock',obligatorio: false,frecuente: false,completado: false},
    consentimiento: {nombre: 'Consentimiento',icono: 'fas fa-signature',obligatorio: true,frecuente: false,completado: false},
    solicitudEstudio: {nombre: 'Solicitud Estudio',icono: 'fas fa-microscope',obligatorio: false,frecuente: true,completado: false},
    solicitudCultivo: {nombre: 'Solicitud Cultivo',icono: 'fas fa-flask',obligatorio: false,frecuente: false,completado: false},
    solicitudGasometria: {nombre: 'Gasometría',icono: 'fas fa-lungs',obligatorio: false,frecuente: false,completado: false},
    controlCrecimiento: {nombre: 'Control Crecimiento',icono: 'fas fa-child',obligatorio: false,frecuente: false,completado: false},
    esquemaVacunacion: {nombre: 'Vacunas',icono: 'fas fa-shield-alt',obligatorio: false,frecuente: false,completado: false},
    desarrolloPsicomotriz: {nombre: 'Desarrollo',icono: 'fas fa-brain',obligatorio: false,frecuente: false,completado: false},
    prescripcionMedicamento: { nombre: 'Prescripción',icono: 'fas fa-prescription-bottle-alt',obligatorio: false,frecuente: true,completado: false},
    registroTransfusion: {nombre: 'Transfusión',icono: 'fas fa-tint',obligatorio: false,frecuente: false,completado: false},
    hojaFrontal: {nombre: 'Hoja Frontal',icono: 'fas fa-file-alt',obligatorio: true,frecuente: false,completado: false},
    altaVoluntaria: {nombre: 'Alta Voluntaria',icono: 'fas fa-door-open',obligatorio: false,frecuente: false,completado: false},
    referenciaTraslado: {nombre: 'Referencia',icono: 'fas fa-share',obligatorio: false,frecuente: false,completado: false},
    historiaClinicaPediatrica: {nombre: 'Historia Clínica Pediátrica',icono: 'fas fa-baby-carriage',obligatorio: true,frecuente: true,completado: false},
    antecedentesHeredoFamiliares: {nombre: 'Antecedentes Heredo-Familiares',icono: 'fas fa-dna',obligatorio: true,frecuente: true,completado: false},
    antecedentesPerinatales: {nombre: 'Antecedentes Perinatales',icono: 'fas fa-baby', obligatorio: true,frecuente: true,completado: false},
    estadoNutricionalPediatrico: {nombre: 'Estado Nutricional',icono: 'fas fa-weight',obligatorio: false,frecuente: true,completado: false},
    inmunizaciones: {nombre: 'Inmunizaciones',icono: 'fas fa-syringe', obligatorio: true,frecuente: true,completado: false},
    vacunasAdicionales: {nombre: 'Vacunas Adicionales',icono: 'fas fa-plus-square',obligatorio: false,frecuente: false,completado: false},
    alimentacionPediatrica: {nombre: 'Alimentación Pediátrica',icono: 'fas fa-utensils',obligatorio: false,frecuente: true,completado: false },
    tamizajeNeonatal: {nombre: 'Tamizaje Neonatal',icono: 'fas fa-microscope',obligatorio: false,frecuente: false,completado: false},
  };

  formularioEstado: FormularioEstado = {
    signosVitales: false,historiaClinica: false,notaUrgencias: false,notaEvolucion: false,consentimiento: false,notaPreoperatoria: false,notaPostoperatoria: false,notaPreanestesica: false,
    notaPostanestesica: false,notaInterconsulta: false,controlCrecimiento: false,esquemaVacunacion: false,solicitudEstudio: false,referenciaTraslado: false,prescripcionMedicamento: false,
    registroTransfusion: false,notaEgreso: false,historiaClinicaPediatrica: false,desarrolloPsicomotriz: false,alimentacionPediatrica: false,tamizajeNeonatal: false,antecedentesHeredoFamiliares: false,
    antecedentesPerinatales: false,estadoNutricionalPediatrico: false,inmunizaciones: false,vacunasAdicionales: false,solicitudCultivo: false,solicitudGasometria: false,hojaFrontal: false,
    altaVoluntaria: false,
  };

  tiposDocumentosDisponibles: TipoDocumentoDisponible[] = [];
  documentosExistentes: { [key: string]: any } = {};
  formularios: { [key: string]: FormGroup } = {};
  mostrarModalEditarExpediente = false;
  numeroAdministrativoTemporal = '';

  constructor(
    private authService: AuthService,
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
    private consentimientosService: ConsentimientosInformados,
    private notasPreoperatoriaService: NotasPreoperatoria,
    private notasPostoperatoriaService: NotasPostoperatoria,
    private notasPreanestesicaService: NotasPreanestesica,
    private notasPostanestesicaService: NotasPostanestesica,
    private notasInterconsultaService: NotasInterconsulta,
    private solicitudesEstudioService: SolicitudesEstudio,
    private referenciasTrasladoService: ReferenciasTraslado,
    private prescripcionesMedicamentoService: PrescripcionesMedicamentoService,
    private controlCrecimientoService: ControlCrecimientoService,
    private esquemaVacunacionService: EsquemaVacunacionService,
    private hojaFrontalService: HojaFrontalService,
    private altaVoluntariaService: AltaVoluntariaService,
    private cultivosService: CultivosService,
    private gasometriaService: GasometriaService,
    private antecedentesHeredoFamiliaresService: AntecedentesHeredoFamiliaresService,
    private antecedentesPerinatalesService: AntecedentesPerinatalesService,
    private desarrolloPsicomotrizService: DesarrolloPsicomotrizService,
    private estadoNutricionalPediatricoService: EstadoNutricionalPediatricoService,
    private inmunizacionesService: InmunizacionesService,
    private vacunasAdicionalesService: VacunasAdicionalesService,
    private camasService: CamasService,
    private medicamentosService: MedicamentosService,
  ) {
    // ✅ INICIALIZACIÓN CORREGIDA
    this.signosVitalesForm = this.initializeSignosVitalesForm();
    this.historiaClinicaForm = this.initializeHistoriaClinicaForm();
    this.notaUrgenciasForm = this.initializeNotaUrgenciasForm();
    this.notaEvolucionForm = this.initializeNotaEvolucionForm();
    this.consentimientoForm = this.initializeConsentimientoForm();
    this.notaPreoperatoriaForm = this.initializeNotaPreoperatoriaForm();
    this.notaPostoperatoriaForm = this.initializeNotaPostoperatoriaForm();
    this.notaPreanestesicaForm = this.initializeNotaPreanestesicaForm();
    this.notaPostanestesicaForm = this.initializeNotaPostanestesicaForm();
    this.notaInterconsultaForm = this.initializeNotaInterconsultaForm();
    this.hojaFrontalForm = this.initializeHojaFrontalForm(); // ✅ AGREGADO
    this.inicializarFormularios();
  }

  // ✅ MÉTODO CORREGIDO initializeHojaFrontalForm
  private initializeHojaFrontalForm(): FormGroup {
    return this.fb.group({
      tipo_establecimiento: ['Hospital General', [ValidacionesComunesService.validarCampoObligatorioNOM004]],
      nombre_establecimiento: ['Hospital General San Luis de la Paz', [ValidacionesComunesService.validarCampoObligatorioNOM004]],
      lugar_nacimiento: [''],
      nacionalidad: ['Mexicana'],
      grupo_etnico: [''],
      lengua_indigena: [''],
      religion: [''],
      escolaridad: [''],
      ocupacion: [''],
      estado_conyugal: [''],
      afiliacion_medica: [''],
      numero_afiliacion: [''],
      contacto_emergencia_1: this.fb.group({
        nombre_completo: ['', [ValidacionesComunesService.validarCampoObligatorioNOM004]],
        parentesco: ['', [ValidacionesComunesService.validarCampoObligatorioNOM004]],
        telefono_principal: ['', [ValidacionesComunesService.validarCampoObligatorioNOM004, ValidacionesComunesService.validarTelefono]],
        telefono_secundario: ['', [ValidacionesComunesService.validarTelefono]],
        direccion: ['']
      }),
      alergias_conocidas: ['Ninguna conocida'],
      grupo_sanguineo: [''],
      enfermedades_cronicas: [''],
      medicamentos_actuales: [''],
      observaciones: ['']
    });
  }

  // RESTO DE MÉTODOS DE INICIALIZACIÓN... (continúan igual)
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
     observaciones: [''],
   });
 }

 private initializeHistoriaClinicaForm(): FormGroup {
   return this.fb.group({
     // Antecedentes heredofamiliares
     antecedentes_heredo_familiares: ['', [Validators.required]],

     // Antecedentes personales no patológicos
     habitos_higienicos: [''],
     habitos_alimenticios: [''],
     actividad_fisica: [''],
     ocupacion: [''],
     vivienda: [''],
     toxicomanias: [''],

     // Antecedentes perinatales (para pediátricos)
     control_prenatal: [''],
     tipo_parto: [''],
     peso_nacer: [''],
     edad_gestacional: [''],
     apgar: [''],
     complicaciones_neonatales: [''],

     // 🔥 CAMPOS PEDIÁTRICOS ESPECÍFICOS
     ...(this.esPacientePediatrico && {
       // Datos de los padres
       nombre_padre: [''],
       apellido_paterno_padre: [''],
       apellido_materno_padre: [''],
       edad_padre: [null, [Validators.min(15), Validators.max(80)]],
       ocupacion_padre: [''],
       escolaridad_padre: [''],

       nombre_madre: [''],
       apellido_paterno_madre: [''],
       apellido_materno_madre: [''],
       edad_madre: [null, [Validators.min(15), Validators.max(80)]],
       ocupacion_madre: [''],
       escolaridad_madre: [''],

       // Datos del embarazo
       embarazo_planeado: [false],
       edad_madre_embarazo: [null],
       control_prenatal: [false],
     }),

     // Antecedentes ginecobstétricos (se mostrarán condicionalmente)
     menarca: [''],
     ritmo_menstrual: [''],
     inicio_vida_sexual: [''],
     fecha_ultima_regla: [''],
     fecha_ultimo_parto: [''],
     gestas: [null],
     partos: [null],
     cesareas: [null],
     abortos: [null],
     hijos_vivos: [null],
     metodo_planificacion: [''],

     // Antecedentes personales patológicos
     enfermedades_infancia: [''],
     enfermedades_adulto: [''],
     cirugias_previas: [''],
     traumatismos: [''],
     alergias: ['', Validators.required], // Obligatorio por seguridad

     // Padecimiento actual
     padecimiento_actual: ['', [Validators.required]],
     sintomas_generales: [''],
     aparatos_sistemas: [''],

     // Exploración física
     exploracion_general: ['', [Validators.required]],
     exploracion_cabeza: [''],
     exploracion_cuello: [''],
     exploracion_torax: [''],
     exploracion_abdomen: [''],
     exploracion_columna: [''],
     exploracion_extremidades: [''],
     exploracion_genitales: [''],

     // Impresión diagnóstica y plan
     impresion_diagnostica: ['', [Validators.required]],
     id_guia_diagnostico: [null],
     plan_diagnostico: [''],
     plan_terapeutico: ['', [Validators.required]],
     pronostico: ['', [Validators.required]],

     // 🔥 NUEVOS CAMPOS FALTANTES
     numero_cama: [null],
     id_cama: [null],

     // Campos de interrogatorio por aparatos y sistemas
     interrogatorio_cardiovascular: [null],
     interrogatorio_respiratorio: [null],
     interrogatorio_digestivo: [null],
     interrogatorio_genitourinario: [null],
     interrogatorio_neurologico: [null],
     interrogatorio_musculoesqueletico: [null],
     interrogatorio_endocrino: [null],
     interrogatorio_tegumentario: [null],

     // Campos adicionales de exploración
     exploracion_neurologico: [null],
     exploracion_corazon: [null],

     // Campos de estudios
     estudios_laboratorio_previos: [null],
     estudios_gabinete_previos: [null],

     // Campos de tratamiento
     terapeutica_empleada: [null],
     indicacion_terapeutica: [null],

     // Campos pediátricos adicionales
     desarrollo_psicomotor_exploracion: [null],
     habitus_exterior: [null],

     // Campos de antecedentes adicionales
     hospitalizaciones_previas: [null],
     transfusiones: [null],

     // Campo para múltiples guías clínicas
     guias_clinicas_ids: [[]],
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
     id_guia_diagnostico: [null],
     numero_cama: [''],
     hora_atencion: ['']
   });
 }

 private initializeNotaEvolucionForm(): FormGroup {
   return this.fb.group({
     sintomas_signos: ['', [Validators.required, Validators.minLength(10)]],
     habitus_exterior: ['', [Validators.required, Validators.minLength(5)]],
     estado_nutricional: ['', [Validators.required, Validators.minLength(5)]],
     estudios_laboratorio_gabinete: ['', [Validators.required, Validators.minLength(10)]],
     evolucion_analisis: ['', [Validators.required, Validators.minLength(10)]],
     diagnosticos: ['', [Validators.required, Validators.minLength(10)]],
     plan_estudios_tratamiento: ['', [Validators.required, Validators.minLength(10)]],
     pronostico: ['', [Validators.required, Validators.minLength(5)]],
     id_guia_diagnostico: [null],
     dias_hospitalizacion: [null, [Validators.min(0), Validators.max(365)]],
     fecha_ultimo_ingreso: [''],
     temperatura: [null, [Validators.min(30), Validators.max(45)]],
     frecuencia_cardiaca: [null, [Validators.min(30), Validators.max(250)]],
     frecuencia_respiratoria: [null, [Validators.min(8), Validators.max(60)]],
     presion_arterial_sistolica: [null, [Validators.min(60), Validators.max(250)]],
     presion_arterial_diastolica: [null, [Validators.min(30), Validators.max(150)]],
     saturacion_oxigeno: [null, [Validators.min(50), Validators.max(100)]],
     peso_actual: [null, [Validators.min(0.5), Validators.max(300)]],
     talla_actual: [null, [Validators.min(30), Validators.max(250)]],
     exploracion_cabeza: [''],
     exploracion_cuello: [''],
     exploracion_torax: [''],
     exploracion_abdomen: [''],
     exploracion_extremidades: [''],
     exploracion_columna: [''],
     exploracion_genitales: [''],
     exploracion_neurologico: [''],
     diagnosticos_guias: [''],
     interconsultas: ['No se solicitaron interconsultas en esta evolución'],
     indicaciones_medicas: [''],
     observaciones_adicionales: [''],
   });
 }

 private initializeConsentimientoForm(): FormGroup {
   return this.fb.group({
     procedimiento: ['', Validators.required],
     riesgos: [''],
     alternativas: [''],
     nombre_testigo1: [''],
     nombre_testigo2: [''],
   });
 }

 private initializeNotaPreoperatoriaForm(): FormGroup {
   return this.fb.group({
     motivo_cirugia: ['', Validators.required],
     tecnica_propuesta: [''],
     riesgo_quirurgico: [''],
   });
 }

 private initializeNotaPostoperatoriaForm(): FormGroup {
   return this.fb.group({
     // Información básica
     fecha_cirugia: ['', Validators.required],
     duracion_cirugia: [null],

     // Diagnósticos (NOM-004: 8.8.1 y 8.8.4)
     diagnostico_preoperatorio: ['', Validators.required],
     diagnostico_postoperatorio: ['', Validators.required],

     // Procedimientos (NOM-004: 8.8.2 y 8.8.3)
     operacion_planeada: ['', Validators.required],
     operacion_realizada: ['', Validators.required],

     // Técnica y hallazgos (NOM-004: 8.8.5 y 8.8.6)
     descripcion_tecnica: ['', Validators.required],
     hallazgos_transoperatorios: ['', Validators.required],

     // Conteo (NOM-004: 8.8.7)
     conteo_gasas_completo: ['', Validators.required],
     conteo_instrumental_completo: ['', Validators.required],
     observaciones_conteo: [''],

     // Incidentes y sangrado (NOM-004: 8.8.8 y 8.8.9)
     incidentes_accidentes: ['', Validators.required],
     sangrado: [0, [Validators.required, Validators.min(0)]],
     transfusiones_realizadas: [false],
     detalles_transfusiones: [''],

     // Estudios (NOM-004: 8.8.10)
     estudios_transoperatorios: ['', Validators.required],

     // Equipo quirúrgico (NOM-004: 8.8.11)
     cirujano_principal: ['', Validators.required],
     ayudantes: ['', Validators.required],
     instrumentista: ['', Validators.required],
     anestesiologo: ['', Validators.required],
     circulante: ['', Validators.required],

     // Estado y plan (NOM-004: 8.8.12 y 8.8.13)
     estado_postquirurgico: ['', Validators.required],
     plan_postoperatorio: ['', Validators.required],

     // Pronóstico (NOM-004: 8.8.14)
     pronostico: ['', Validators.required],

     // Piezas (NOM-004: 8.8.15)
     piezas_enviadas_patologia: ['', Validators.required],
     se_enviaron_piezas: [false],
     numero_registro_patologia: [''],

     // Otros hallazgos (NOM-004: 8.8.16)
     otros_hallazgos: ['', Validators.required],

     // Responsabilidad (NOM-004: 8.8.17)
     nombre_responsable_cirugia: ['', Validators.required],
     cedula_responsable_cirugia: [''],
     especialidad_responsable: [''],
     firma_responsable_verificada: [false],

     // Información adicional
     quirofano: [''],
     tipo_anestesia: [''],
     hora_inicio: [''],
     hora_fin: [''],
     observaciones_adicionales: [''],
   });
 }

 private initializeNotaPreanestesicaForm(): FormGroup {
   return this.fb.group({
     estado_ayuno: ['', Validators.required],
     asa: ['', Validators.required],
     plan_anestesia: ['', Validators.required],
   });
 }

 private initializeNotaPostanestesicaForm(): FormGroup {
   return this.fb.group({
     estado_recuperacion: ['', Validators.required],
     signos_vitales_egreso: ['', Validators.required],
     indicaciones: [''],
   });
 }

 private initializeNotaInterconsultaForm(): FormGroup {
   return this.fb.group({
     area_interconsulta: ['', Validators.required],
     motivo_interconsulta: ['', Validators.required],
     diagnostico_presuntivo: [''],
     examenes_laboratorio: [false],
     examenes_gabinete: [false],
     hallazgos: [''],
     impresion_diagnostica: [''],
     recomendaciones: [''],
     seguimiento_requerido: [''],
     tiempo_seguimiento: [''],
     prioridad: ['media'],
     medico_solicitante: [''],
     cedula_solicitante: [''],
     id_medico_interconsulta: [''],
     especialidad_interconsulta: [''],
   });
 }

private initializeSolicitudEstudioForm(): FormGroup {
  return this.fb.group({
    // Tipo de estudio
    tipo_estudio: ['laboratorio', [Validators.required]], // laboratorio, imagen, otros

    // ===================================
    // ESTUDIOS DE LABORATORIO
    // ===================================

    // Química Sanguínea
    biometria_hematica: [false],
    quimica_sanguinea: [false],
    glucosa: [false],
    urea: [false],
    creatinina: [false],
    acido_urico: [false],
    colesterol_total: [false],
    trigliceridos: [false],
    hdl: [false],
    ldl: [false],
    transaminasas: [false],
    bilirrubinas: [false],
    proteinas_totales: [false],
    albumina: [false],
    fosfatasa_alcalina: [false],

    // Electrolitos
    sodio: [false],
    potasio: [false],
    cloro: [false],

    // Estudios hormonales
    tsh: [false],
    t3: [false],
    t4: [false],

    // Estudios de orina
    examen_general_orina: [false],
    urocultivo: [false],

    // Estudios de heces
    coproparasitoscopico: [false],
    coprocultivo: [false],
    sangre_oculta_heces: [false],

    // Marcadores cardiacos
    troponinas: [false],
    ck_mb: [false],

    // Coagulación
    tiempo_protrombina: [false],
    tiempo_tromboplastina: [false],
    inr: [false],

    // ===================================
    // ESTUDIOS DE IMAGENOLOGÍA
    // ===================================

    // Radiografías
    radiografia_torax: [false],
    radiografia_abdomen: [false],
    radiografia_columna: [false],
    radiografia_extremidades: [false],

    // Ultrasonidos
    ultrasonido_abdominal: [false],
    ultrasonido_pelvico: [false],
    ultrasonido_tiroideo: [false],
    ultrasonido_carotideo: [false],
    ultrasonido_renal: [false],
    ecocardiograma: [false],

    // Tomografías
    tomografia_cerebral: [false],
    tomografia_torax: [false],
    tomografia_abdomen: [false],
    tomografia_contrastada: [false],

    // Resonancias
    resonancia_cerebral: [false],
    resonancia_columna: [false],
    resonancia_articular: [false],

    // Estudios especiales
    mamografia: [false],
    densitometria_osea: [false],

    // ===================================
    // CAMPOS COMUNES PARA TODOS
    // ===================================

    // Otros estudios específicos
    otros_estudios: [''],

    // Información clínica (OBLIGATORIO)
    indicacion_clinica: ['', [Validators.required]],
    diagnostico_presuntivo: ['', [Validators.required]],

    // Configuración del estudio
    urgencia: ['normal'], // normal, urgente, stat
    ayuno_requerido: [false],
    contraste_requerido: [false], // Para imagenología
    sedacion_requerida: [false], // Para ciertos estudios

    // Fechas y observaciones
    fecha_solicitud: [new Date().toISOString().split('T')[0], [Validators.required]],
    fecha_programada: [''],
    observaciones: [''],

    // Médico solicitante
    medico_solicitante: [''],
    especialidad_solicitante: [''],

    // Guía clínica
    id_guia_clinica: [''],
  });
}

 private initializeSolicitudLaboratorioForm(): FormGroup {
  return this.fb.group({
    // Estudios de laboratorio más comunes
    biometria_hematica: [false],
    quimica_sanguinea: [false],
    glucosa: [false],
    urea: [false],
    creatinina: [false],
    acido_urico: [false],
    colesterol_total: [false],
    trigliceridos: [false],
    hdl: [false],
    ldl: [false],
    transaminasas: [false],
    bilirrubinas: [false],
    proteinas_totales: [false],
    albumina: [false],
    fosfatasa_alcalina: [false],

    // Electrolitos
    sodio: [false],
    potasio: [false],
    cloro: [false],

    // Estudios hormonales
    tsh: [false],
    t3: [false],
    t4: [false],

    // Estudios de orina
    examen_general_orina: [false],
    urocultivo: [false],

    // Estudios de heces
    coproparasitoscopico: [false],
    coprocultivo: [false],
    sangre_oculta_heces: [false],

    // Marcadores cardiacos
    troponinas: [false],
    ck_mb: [false],

    // Coagulación
    tiempo_protrombina: [false],
    tiempo_tromboplastina: [false],
    inr: [false],

    // Otros estudios
    otros_estudios: [''],

    // Información clínica
    indicacion_clinica: ['', Validators.required],
    diagnostico_presuntivo: ['', Validators.required],
    urgencia: ['normal'], // normal, urgente, stat
    ayuno_requerido: [false],

    // Observaciones
    observaciones: [''],

    // Fecha programada
    fecha_programada: ['']
  });
}

private initializePrescripcionForm(): FormGroup {
  return this.fb.group({
    // Información general de la prescripción
    fecha_prescripcion: [new Date().toISOString().split('T')[0], [Validators.required]],
    duracion_tratamiento_dias: [null, [Validators.min(1), Validators.max(365)]],
    indicaciones_generales: [''],
    diagnostico_prescripcion: ['', [Validators.required]],

    // Array de medicamentos
    medicamentos: this.fb.array([
      this.crearMedicamentoFormGroup() // Crear al menos uno por defecto
    ]),

    // Información del médico
    medico_prescriptor: [''],
    cedula_medico: [''],
    especialidad_medico: [''],

    // Observaciones y advertencias
    observaciones: [''],
    alergias_consideradas: [''],
    interacciones_importantes: [''],

    // Control de seguimiento
    requiere_seguimiento: [false],
    fecha_proxima_revision: [''],

    // Datos administrativos
    numero_receta: [''], // Se generará automáticamente
    valida_hasta: [''], // Se calculará automáticamente
  });
}

private crearMedicamentoFormGroup(): FormGroup {
  return this.fb.group({
    // Selección del medicamento
    id_medicamento: [null, [Validators.required]],
    medicamento_seleccionado: [null], // Objeto completo del medicamento
    busqueda_medicamento: [''], // Para el campo de búsqueda

    // Prescripción específica
    dosis: ['', [Validators.required]], // "500 mg", "1 tableta", etc.
    frecuencia: ['', [Validators.required]], // "Cada 8 horas", "3 veces al día"
    via_administracion: ['Oral', [Validators.required]], // Oral, IV, IM, etc.
    duracion_dias: [null, [Validators.required, Validators.min(1)]],

    // Instrucciones específicas
    instrucciones_toma: [''], // "Con alimentos", "En ayunas", etc.
    indicaciones_especiales: [''],

    // Cálculos automáticos
    cantidad_total: [null], // Se calculará automáticamente
    dosis_diaria_total: [''], // Se calculará si es posible

    // Control
    medicamento_controlado: [false],
    requiere_receta_especial: [false],
  });
}

// Método auxiliar para crear un medicamento individual
private crearGrupoMedicamento(): FormGroup {
  return this.fb.group({
    // Información del medicamento
    nombre_medicamento: ['', [Validators.required]],
    nombre_generico: [''],
    nombre_comercial: [''],
    concentracion: [''],
    presentacion: [''], // tableta, cápsula, jarabe, etc.

    // Dosis y administración
    dosis: ['', [Validators.required]],
    unidad_dosis: ['mg'], // mg, ml, g, etc.
    frecuencia: ['', [Validators.required]], // cada 8 horas, 3 veces al día, etc.
    via_administracion: ['oral', [Validators.required]], // oral, iv, im, etc.

    // Duración específica del medicamento
    duracion_dias: [null, [Validators.min(1), Validators.max(365)]],
    cantidad_total: [null, [Validators.min(1)]],

    // Instrucciones específicas
    instrucciones_especificas: [''],
    momento_administracion: [''], // antes de comer, después de comer, etc.

    // Información adicional
    indicacion: [''], // para qué sirve este medicamento específico
    contraindicaciones: [''],
    efectos_adversos: [''],

    // Control
    medicamento_controlado: [false],
    requiere_receta_especial: [false],

    // Estado
    activo: [true]
  });
}

// Métodos para manejar el array de medicamentos
get medicamentosFormArray(): FormArray {
  return this.prescripcionForm.get('medicamentos') as FormArray;
}

agregarMedicamento(): void {
  this.medicamentosFormArray.push(this.crearMedicamentoFormGroup());
}

// Agregar este método en perfil-paciente.ts
onBusquedaMedicamentoChange(event: Event, index: number): void {
  const target = event.target as HTMLInputElement;
  if (target) {
    this.buscarMedicamentos(target.value, index);
  }
}

// Eliminar un medicamento
eliminarMedicamento(index: number): void {
  if (this.medicamentosFormArray.length > 1) {
    this.medicamentosFormArray.removeAt(index);
  } else {
    this.error = 'Debe prescribir al menos un medicamento';
    setTimeout(() => this.error = null, 3000);
  }
}
async buscarMedicamentos(termino: string, medicamentoIndex: number): Promise<void> {
  if (!termino || termino.length < 2) {
    this.medicamentosFiltrados = [...this.medicamentosMasPrescitos];
    return;
  }

  try {
    const response = await this.medicamentosService.buscarPorNombre(termino);
    if (response.success) {
      this.medicamentosFiltrados = response.data || [];
    }
  } catch (error) {
    console.error('Error al buscar medicamentos:', error);
    this.medicamentosFiltrados = [];
  }
}

duplicarMedicamento(index: number): void {
  const medicamentoActual = this.medicamentosFormArray.at(index).value;
  const nuevoMedicamento = this.crearGrupoMedicamento();
  nuevoMedicamento.patchValue({
    ...medicamentoActual,
    nombre_medicamento: `${medicamentoActual.nombre_medicamento} (copia)`
  });
  this.medicamentosFormArray.push(nuevoMedicamento);
}


trackByIndex(index: number): number {
  return index;
}


private async guardarPrescripcionMedicamento(): Promise<void> {
  if (!this.prescripcionForm.valid) {
    this.marcarCamposInvalidos(this.prescripcionForm);
    throw new Error('Formulario de prescripción inválido');
  }

  if (!this.pacienteCompleto?.expediente.id_expediente) {
    throw new Error('No hay expediente disponible');
  }

  // Crear documento padre si no existe
  if (!this.documentoClinicoActual) {
    await this.crearDocumentoClinicoPadre('Prescripción de Medicamentos');
  }

  const prescripcionData = {
    id_documento: this.documentoClinicoActual!,
    fecha_prescripcion: this.prescripcionForm.value.fecha_prescripcion,
    duracion_tratamiento_dias: this.prescripcionForm.value.duracion_tratamiento_dias,
    indicaciones_generales: this.prescripcionForm.value.indicaciones_generales,
    diagnostico_prescripcion: this.prescripcionForm.value.diagnostico_prescripcion,
    medicamentos: this.medicamentosFormArray.value.map((med: any) => ({
      id_medicamento: med.id_medicamento,
      dosis: med.dosis,
      frecuencia: med.frecuencia,
      via_administracion: med.via_administracion,
      duracion_dias: med.duracion_dias,
      instrucciones_toma: med.instrucciones_toma,
      indicaciones_especiales: med.indicaciones_especiales,
      cantidad_total: med.cantidad_total
    })),
    observaciones: this.prescripcionForm.value.observaciones,
    numero_receta: this.generarNumeroReceta(),
    valida_hasta: this.calcularFechaValidez()
  };

  try {
    console.log('📄 Datos de prescripción preparados:', prescripcionData);
    // Aquí integraremos con el backend más tarde
  } catch (error: any) {
    console.error('❌ Error al guardar prescripción:', error);
    throw error;
  }
}

private generarNumeroReceta(): string {
  const fecha = new Date();
  const timestamp = fecha.getTime().toString().slice(-6);
  return `RX-${fecha.getFullYear()}-${timestamp}`;
}

private calcularFechaValidez(): string {
  const fechaValidez = new Date();
  fechaValidez.setDate(fechaValidez.getDate() + 30); // Válida por 30 días
  return fechaValidez.toISOString().split('T')[0];
}

private marcarCamposInvalidos(formGroup: FormGroup): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    if (control instanceof FormGroup) {
      this.marcarCamposInvalidos(control);
    } else if (control instanceof FormArray) {
      control.controls.forEach((arrayControl, index) => {
        if (arrayControl instanceof FormGroup) {
          this.marcarCamposInvalidos(arrayControl);
        }
      });
    } else {
      control?.markAsTouched();
    }
  });
}

private construirListaMedicamentos(): any[] {
  const medicamentos = this.medicamentosFormArray.value;
  return medicamentos.filter((med: any) => med.activo && med.nombre_medicamento.trim())
    .map((med: any, index: number) => ({
      numero_orden: index + 1,
      nombre_medicamento: med.nombre_medicamento,
      nombre_generico: med.nombre_generico || med.nombre_medicamento,
      nombre_comercial: med.nombre_comercial,
      concentracion: med.concentracion,
      presentacion: med.presentacion,
      dosis: med.dosis,
      unidad_dosis: med.unidad_dosis,
      frecuencia: med.frecuencia,
      via_administracion: med.via_administracion,
      duracion_dias: med.duracion_dias,
      cantidad_total: med.cantidad_total,
      instrucciones_especificas: med.instrucciones_especificas,
      momento_administracion: med.momento_administracion,
      indicacion: med.indicacion,
      medicamento_controlado: med.medicamento_controlado
    }));
}

private generarFolioReceta(): string {
  const fecha = new Date();
  const timestamp = fecha.getTime().toString().slice(-6);
  return `RX-${fecha.getFullYear()}-${timestamp}`;
}

private async generarPDFPrescripcion(): Promise<void> {
  try {
    const medicoCompleto = await this.obtenerDatosMedicoCompleto();
    const datosPacienteEstructurados = this.extraerDatosPaciente();

    await this.pdfGeneratorService.generarDocumento('Prescripción de Medicamentos', {
      paciente: datosPacienteEstructurados,
      medico: medicoCompleto,
      expediente: this.pacienteCompleto?.expediente,
      prescripcion: {
        ...this.prescripcionForm.value,
        medicamentos: this.medicamentosFormArray.value,
        numero_receta: this.generarNumeroReceta(),
        valida_hasta: this.calcularFechaValidez()
      }
    });

    console.log('✅ PDF de Prescripción generado correctamente');
  } catch (error) {
    console.error('❌ Error al generar PDF de prescripción:', error);
    this.error = 'Error al generar el PDF de la prescripción';
  }
}

// Seleccionar un medicamento específico
seleccionarMedicamento(medicamento: Medicamento, medicamentoIndex: number): void {
  const medicamentoFormGroup = this.medicamentosFormArray.at(medicamentoIndex) as FormGroup;

  medicamentoFormGroup.patchValue({
    id_medicamento: medicamento.id_medicamento,
    medicamento_seleccionado: medicamento,
    busqueda_medicamento: `${medicamento.nombre} - ${medicamento.presentacion} ${medicamento.concentracion}`,
    via_administracion: medicamento.via_administracion || 'Oral',
    medicamento_controlado: this.esMedicamentoControlado(medicamento),
  });

  // Auto-llenar dosis si está disponible
  if (medicamento.dosis_adulto && !this.esPacientePediatrico) {
    medicamentoFormGroup.patchValue({
      dosis: medicamento.dosis_adulto
    });
  } else if (medicamento.dosis_pediatrica && this.esPacientePediatrico) {
    medicamentoFormGroup.patchValue({
      dosis: medicamento.dosis_pediatrica
    });
  }

  // Calcular cantidad total automáticamente
  this.calcularCantidadTotal(medicamentoIndex);
}

// Calcular cantidad total necesaria
calcularCantidadTotal(medicamentoIndex: number): void {
  const medicamentoFormGroup = this.medicamentosFormArray.at(medicamentoIndex) as FormGroup;
  const frecuencia = medicamentoFormGroup.get('frecuencia')?.value;
  const duracionDias = medicamentoFormGroup.get('duracion_dias')?.value;

  if (frecuencia && duracionDias) {
    let tomasPorDia = this.extraerTomasPorDia(frecuencia);
    if (tomasPorDia > 0) {
      const cantidadTotal = Math.ceil(tomasPorDia * duracionDias);
      medicamentoFormGroup.patchValue({
        cantidad_total: cantidadTotal
      });
    }
  }
}

// Extraer número de tomas por día de la frecuencia
private extraerTomasPorDia(frecuencia: string): number {
  const frecuenciaLower = frecuencia.toLowerCase();

  // Patrones comunes
  if (frecuenciaLower.includes('cada 24 horas') || frecuenciaLower.includes('1 vez')) return 1;
  if (frecuenciaLower.includes('cada 12 horas') || frecuenciaLower.includes('2 veces')) return 2;
  if (frecuenciaLower.includes('cada 8 horas') || frecuenciaLower.includes('3 veces')) return 3;
  if (frecuenciaLower.includes('cada 6 horas') || frecuenciaLower.includes('4 veces')) return 4;
  if (frecuenciaLower.includes('cada 4 horas') || frecuenciaLower.includes('6 veces')) return 6;

  // Buscar números explícitos
  const matches = frecuencia.match(/(\d+)\s*veces/i);
  if (matches) {
    return parseInt(matches[1]);
  }

  return 0; // No se pudo determinar
}

// Verificar si es medicamento controlado
private esMedicamentoControlado(medicamento: Medicamento): boolean {
  const medicamentosControlados = [
    'tramadol', 'morfina', 'fentanilo', 'oxicodona', 'diazepam', 'alprazolam',
    'clonazepam', 'zolpidem', 'methylphenidate', 'anfetamina'
  ];

  const nombreLower = medicamento.nombre.toLowerCase();
  return medicamentosControlados.some(controlado => nombreLower.includes(controlado));
}






















 private initializeReferenciaForm(): FormGroup {
   return this.fb.group({
     institucion_destino: ['', [Validators.required]],
     medico_destino: [''],
     especialidad: [''],
     motivo_referencia: ['', [Validators.required, Validators.minLength(20)]],
     estado_paciente: ['', [Validators.required]],
     datos_clinicos_relevantes: [''],
     contacto_institucion: [''],
     fecha_referencia: [new Date().toISOString().split('T')[0]],
     tipo_referencia: ['segunda_opinion', [Validators.required]],
   });
 }

 private initializeControlCrecimientoForm(): FormGroup {
   return this.fb.group({
     peso: ['', [Validators.required, Validators.min(0.1), Validators.max(200)]],
     talla: ['', [Validators.required, Validators.min(20), Validators.max(250)]],
     imc: [''],
     percentil_peso: ['', [Validators.min(1), Validators.max(99)]],
     percentil_talla: ['', [Validators.min(1), Validators.max(99)]],
     percentil_imc: ['', [Validators.min(1), Validators.max(99)]],
     circunferencia_cefalica: ['', [Validators.min(0), Validators.max(70)]],
     fecha_control: [new Date().toISOString().split('T')[0], [Validators.required]],
     observaciones: [''],
   });
 }

 private initializeEsquemaVacunacionForm(): FormGroup {
   return this.fb.group({
     vacunas: this.fb.array([]),
     observaciones: [''],
     estado_general: ['completo', [Validators.required]],
     proximas_citas: this.fb.array([
       this.fb.group({
         vacuna: [''],
         fecha_programada: [''],
       }),
     ]),
   });
 }

 private initializeHistoriaClinicaPediatricaForm(): FormGroup {
   return this.fb.group({
     // Antecedentes perinatales
     semanas_gestacion: ['', [Validators.min(20), Validators.max(45)]],
     peso_nacer: ['', [Validators.min(500), Validators.max(6000)]],
     talla_nacer: ['', [Validators.min(25), Validators.max(60)]],
     apgar_1min: ['', [Validators.min(0), Validators.max(10)]],
     apgar_5min: ['', [Validators.min(0), Validators.max(10)]],
     tipo_parto: ['', Validators.required],
     complicaciones_parto: [''],

     // Antecedentes familiares pediátricos
     diabetes_familiar: [false],
     hipertension_familiar: [false],
     cardiopatias_familiar: [false],
     malformaciones_familiar: [false],
     otros_antecedentes_familiar: [''],

     // Desarrollo actual
     desarrollo_motor: [''],
     desarrollo_lenguaje: [''],
     desarrollo_social: [''],
     hitos_desarrollo: [''],

     // Alimentación
     lactancia_materna: [false],
     lactancia_duracion_meses: [''],
     edad_ablactacion_meses: [''],
     alimentacion_actual: [''],

     // Padecimiento actual pediátrico
     motivo_consulta: ['', Validators.required],
     tiempo_evolucion: [''],
     sintomas_asociados: [''],

     // Exploración física pediátrica
     estado_general: [''],
     estado_hidratacion: [''],
     palidez_tegumentos: [false],
     ictericia: [false],
     cianosis: [false],

     // Sistemas
     respiratorio: [''],
     cardiovascular: [''],
     digestivo: [''],
     genitourinario: [''],
     neurologico: [''],
     musculoesqueletico: [''],

     // Diagnósticos
     diagnostico_principal: ['', Validators.required],
     diagnosticos_secundarios: [''],

     // Plan
     plan_manejo: ['', Validators.required],
     medicamentos: [''],
     citas_seguimiento: [''],
     recomendaciones_padres: [''],
   });
 }

 private initializeAlimentacionPediatricaForm(): FormGroup {
   return this.fb.group({
     // Lactancia
     lactancia_materna_exclusiva: [false],
     edad_inicio_lactancia: [''],
     duracion_lactancia_meses: [''],
     dificultades_lactancia: [''],

     // Fórmula
     uso_formula: [false],
     tipo_formula: [''],
     cantidad_formula_ml: [''],
     frecuencia_formula: [''],

     // Ablactación
     edad_inicio_ablactacion_meses: ['', [Validators.min(3), Validators.max(12)]],
     primeros_alimentos: [''],
     alergias_alimentarias: [''],
     intolerancias: [''],

     // Alimentación actual
     tipo_alimentacion_actual: ['', Validators.required],
     numero_comidas_dia: ['', [Validators.min(1), Validators.max(8)]],
     apetito: [''],
     preferencias_alimentarias: [''],
     rechazos_alimentarios: [''],

     // Suplementos
     vitaminas: [false],
     tipo_vitaminas: [''],
     hierro: [false],
     otros_suplementos: [''],

     // Evaluación nutricional
     estado_nutricional: [''],
     signos_desnutricion: [false],
     signos_sobrepeso: [false],

     // Recomendaciones
     plan_alimentario: [''],
     recomendaciones_padres: [''],
     proxima_evaluacion: [''],
   });
 }

 private initializeTamizajeNeonatalForm(): FormGroup {
   return this.fb.group({
     // Datos del tamizaje
     fecha_toma_muestra: ['', Validators.required],
     edad_horas_toma: ['', [Validators.required, Validators.min(24), Validators.max(168)]],
     lugar_toma: [''],

     // Tamizaje metabólico
     hipotiroidismo_congenito: [''],
     fenilcetonuria: [''],
     galactosemia: [''],
     hiperplasia_suprarrenal: [''],
     fibrosis_quistica: [''],
     deficiencia_biotinidasa: [''],

     // Resultados
     resultados_normales: [true],
     alteraciones_encontradas: [''],
     requiere_confirmacion: [false],

     // Tamizaje auditivo
     tamizaje_auditivo_realizado: [false],
     resultado_auditivo: [''],
     fecha_tamizaje_auditivo: [''],

     // Tamizaje visual
     reflejo_rojo_presente: [true],
     cataratas_congenitas: [false],
     otras_alteraciones_visuales: [''],

     // Seguimiento
     requiere_seguimiento: [false],
     tipo_seguimiento: [''],
     fecha_proxima_cita: [''],

     // Observaciones
     observaciones: [''],
     medico_responsable: [''],
   });
 }

 private initializeAntecedentesHeredoFamiliaresForm(): FormGroup {
   return this.fb.group({
     antecedentes_paternos: this.fb.group({
       diabetes: [false],
       hipertension: [false],
       cardiopatias: [false],
       cancer: [false],
       enfermedades_mentales: [false],
       malformaciones_congenitas: [false],
       otros: [''],
     }),
     antecedentes_maternos: this.fb.group({
       diabetes: [false],
       hipertension: [false],
       cardiopatias: [false],
       cancer: [false],
       enfermedades_mentales: [false],
       malformaciones_congenitas: [false],
       otros: [''],
     }),
     numero_hermanos: [null, [Validators.min(0)]],
     antecedentes_hermanos: [''],
     otros_antecedentes_familiares: [''],
     observaciones: [''],
   });
 }

 private initializeAntecedentesPerinatalesForm(): FormGroup {
   return this.fb.group({
     embarazo_planeado: [false],
     numero_embarazo: [null, [Validators.min(1)]],
     control_prenatal: [false],
     numero_consultas_prenatales: [null, [Validators.min(0)]],
     complicaciones_embarazo: [''],
     tipo_parto: ['', Validators.required],
     semanas_gestacion: [null, [Validators.min(0)]],
     peso_nacimiento: [null, [Validators.min(0)]],
     talla_nacimiento: [null, [Validators.min(0)]],
     apgar_1_min: [null, [Validators.min(0), Validators.max(10)]],
     apgar_5_min: [null, [Validators.min(0), Validators.max(10)]],
     llanto_inmediato: [false],
     hospitalizacion_neonatal: [false],
     dias_hospitalizacion_neonatal: [null, [Validators.min(0)]],
     problemas_neonatales: [''],
     alimentacion_neonatal: [''],
     peso_2_meses: [null],
     peso_4_meses: [null],
     peso_6_meses: [null],
     observaciones: [''],
   });
 }

 private initializeDesarrolloPsicomotrizForm(): FormGroup {
   return this.fb.group({
     sostuvo_cabeza_meses: [null, [Validators.min(0)]],
     se_sento_meses: [null, [Validators.min(0)]],
     gateo_meses: [null, [Validators.min(0)]],
     camino_meses: [null, [Validators.min(0)]],
     primera_palabra_meses: [null, [Validators.min(0)]],
     primeras_frases_meses: [null, [Validators.min(0)]],
     sonrisa_social_meses: [null, [Validators.min(0)]],
     reconocimiento_padres_meses: [null, [Validators.min(0)]],
     control_diurno_meses: [null, [Validators.min(0)]],
     control_nocturno_meses: [null, [Validators.min(0)]],
     juego_simbolico_meses: [null, [Validators.min(0)]],
     seguimiento_instrucciones_meses: [null, [Validators.min(0)]],
     desarrollo_normal: [true],
     observaciones_desarrollo: [''],
     necesita_estimulacion: [false],
     tipo_estimulacion: [''],
     areas_retraso: [''],
     recomendaciones: [''],
   });
 }

 private initializeEstadoNutricionalPediatricoForm(): FormGroup {
   return this.fb.group({
     peso_kg: [null, [Validators.required, Validators.min(0.1)]],
     talla_cm: [null, [Validators.required, Validators.min(20)]],
     perimetro_cefalico_cm: [null, [Validators.min(0)]],
     perimetro_brazo_cm: [null, [Validators.min(0)]],
     percentil_peso: [null, [Validators.min(0), Validators.max(100)]],
     percentil_talla: [null, [Validators.min(0), Validators.max(100)]],
     percentil_perimetro_cefalico: [null, [Validators.min(0), Validators.max(100)]],
     peso_para_edad: [''],
     talla_para_edad: [''],
     peso_para_talla: [''],
     imc: [null, [Validators.min(0)]],
     aspecto_general: [''],
     estado_hidratacion: [''],
     palidez_mucosas: [false],
     edemas: [false],
     masa_muscular: [''],
     tejido_adiposo: [''],
     diagnostico_nutricional: [''],
     riesgo_nutricional: [false],
     tipo_alimentacion: [''],
     numero_comidas_dia: [null, [Validators.min(1)]],
     apetito: [''],
     nauseas: [false],
     vomitos: [false],
     diarrea: [false],
     estrenimiento: [false],
     recomendaciones_nutricionales: [''],
     suplementos_vitaminicos: [''],
     observaciones: [''],
     fecha_evaluacion: [new Date().toISOString().split('T')[0]],
   });
 }

 private initializeInmunizacionesForm(): FormGroup {
   return this.fb.group({
     esquema_completo_edad: [false],
     esquema_incompleto_razon: [''],
     porcentaje_completado: [null, [Validators.min(0), Validators.max(100)]],
     reacciones_adversas: [''],
     observaciones: [''],
     bcg_fecha: [''],
     bcg_observaciones: [''],
   });
 }

 private initializeVacunasAdicionalesForm(): FormGroup {
   return this.fb.group({
     nombre_vacuna: ['', Validators.required],
     laboratorio: [''],
     lote: [''],
     fecha_aplicacion: [new Date().toISOString().split('T')[0], Validators.required],
     dosis: [1, [Validators.required, Validators.min(1)]],
     via_aplicacion: [''],
     sitio_aplicacion: [''],
     reacciones_adversas: [''],
     observaciones: [''],
   });
 }

 private initializeSolicitudCultivoForm(): FormGroup {
   return this.fb.group({
     tipo_cultivo: ['', Validators.required],
     muestra_requerida: ['', Validators.required],
     informacion_clinica: ['', Validators.required],
     sospecha_diagnostica: [''],
     prioridad: ['Normal', Validators.required],
     instrucciones_toma: [''],
     antibioticos_previos: [false],
     antibiotico_usado: [''],
     fecha_solicitud: [new Date().toISOString().split('T')[0], Validators.required],
     medico_solicitante: [''],
     observaciones: [''],
   });
 }

 private initializeSolicitudGasometriaForm(): FormGroup {
   return this.fb.group({
     tipo_gasometria: ['', Validators.required],
     sitio_puncion: ['', Validators.required],
     temperatura_corporal: [null, [Validators.min(30), Validators.max(45)]],
     fio2: [21, [Validators.min(21), Validators.max(100)]],
     soporte_ventilatorio: ['Aire ambiente'],
     prioridad: ['Normal', Validators.required],
     informacion_clinica: ['', Validators.required],
     sospecha_diagnostica: [''],
     fecha_solicitud: [new Date().toISOString().split('T')[0], Validators.required],
     medico_solicitante: [''],
     observaciones: [''],
   });
 }

 private initializeRegistroTransfusionForm(): FormGroup {
   return this.fb.group({
     tipo_componente: ['', Validators.required],
     numero_unidad: ['', Validators.required],
     volumen: [null, [Validators.required, Validators.min(50), Validators.max(2000)]],
     grupo_sanguineo: ['', Validators.required],
     banco_sangre: ['', Validators.required],
     fecha_hora_inicio: ['', Validators.required],
     fecha_hora_fin: [''],
     presion_arterial_inicial: [''],
     temperatura_inicial: [null, [Validators.min(30), Validators.max(45)]],
     pulso_inicial: [null, [Validators.min(40), Validators.max(200)]],
     medico_responsable: ['', Validators.required],
     presenta_reacciones: [false],
     reacciones_adversas: [''],
     observaciones: [''],
   });
 }

 private initializeAltaVoluntariaForm(): FormGroup {
   return this.fb.group({
     fecha_egreso: ['', Validators.required],
     hora_egreso: ['', Validators.required],
     nombre_solicitante: ['', Validators.required],
     parentesco: ['', Validators.required],
     edad_solicitante: [null, [Validators.required, Validators.min(18), Validators.max(120)]],
     resumen_clinico: ['', Validators.required],
     motivo_egreso: [''],
    recomendaciones_medicas: ['', Validators.required],
     factores_riesgo: [''],
     continua_tratamiento_externo: [false],
     establecimiento_destino: [''],
     testigo1_nombre: ['', Validators.required],
     testigo2_nombre: ['', Validators.required],
     medico_autoriza: ['', Validators.required],
   });
 }

 // ===================================
 // RESTO DE MÉTODOS Y PROPIEDADES
 // ===================================

 private documentosDisponibles: TipoDocumentoConfig[] = [
   {
     id: 'signosVitales',
     nombre: 'Signos Vitales',
     descripcion: 'Registro de constantes vitales del paciente',
     icono: 'fas fa-heartbeat',
     color: 'red',
     requiereInternamiento: false,
     soloAdultos: false,
     soloPediatrico: false,
     requiereQuirurgico: false,
     orden: 1,
   },
   {
     id: 'historiaClinica',
     nombre: 'Historia Clínica',
     descripcion: 'Historia clínica completa del paciente',
     icono: 'fas fa-file-medical',
     color: 'blue',
     requiereInternamiento: false,
     soloAdultos: false,
     soloPediatrico: false,
     requiereQuirurgico: false,
     orden: 2,
   },
   {
     id: 'hojaFrontal', // ✅ AGREGADO
     nombre: 'Hoja Frontal',
     descripcion: 'Portada del expediente clínico',
     icono: 'fas fa-folder',
     color: 'gray',
     requiereInternamiento: false,
     soloAdultos: false,
     soloPediatrico: false,
     requiereQuirurgico: false,
     orden: 3,
   },
   // ... resto de documentos disponibles
 ];

 personalMedico: any[] = [];
 servicios: Servicio[] = [];
 documentoClinicoActual: number | null = null;
 filtroHistorial: any = {
   tipoDocumento: '',
   fechaDesde: '',
   fechaHasta: '',
 };
 timelineDocumentos: any[] = [];
 historialInternamientos: any[] = [];
 datosClinicosConsolidados: any = {};
 resumenGeneral: any = {};
 guiasClinicas: GuiaClinica[] = [];
 guiasClinicasFiltradas: GuiaClinica[] = [];
 guiaClinicaSeleccionada: GuiaClinica | null = null;
 filtroGuiaClinica: string = '';
 mostrarDropdownGuias: boolean = false;

 get tieneDocumentos(): boolean {
   return this.documentosDisponibles.length > 0;
 }

 get signosVitalesDisponibles(): SignosVitales[] {
   return this.pacienteCompleto?.signosVitales || [];
 }

 ngOnInit(): void {
   this.inicializarFormulariosVisibles();
   this.cargarCamasDisponibles();
    this.cargarCatalogosMedicamentos();
   this.route.paramMap.subscribe((params) => {
     const id = params.get('id');
     if (id) {
       this.pacienteId = parseInt(id, 10);
       this.inicializarFlujoPaciente();
     } else {
       this.error = 'ID de paciente no válido';
       this.isLoading = false;
     }
   });

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
 }

 ngOnDestroy(): void {
   if (this.autoguardadoInterval) {
     clearInterval(this.autoguardadoInterval);
   }
   this.guardarLocalmenteFormulario();
   this.destroy$.next();
   this.destroy$.complete();
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
         this.formularioEstado['signosVitales'] = true;
         this.success = 'Signos Vitales guardados correctamente';
         break;

       case 'historiaClinica':
         await this.guardarHistoriaClinica();
         this.formularioEstado['historiaClinica'] = true;
         this.success = this.esPacientePediatrico
           ? 'Historia Clínica Pediátrica guardada correctamente'
           : 'Historia Clínica guardada correctamente';
         break;

       case 'hojaFrontal': // ✅ CASO CORREGIDO
         const medicoCompleto = await this.obtenerDatosMedicoCompleto();
         const datosPacienteEstructurados = this.extraerDatosPaciente();
         await this.generarPDF('Hoja Frontal');
         this.formularioEstado['hojaFrontal'] = true;
         this.success = 'Hoja Frontal generada correctamente';
         break;

      case 'solicitudEstudio':
        await this.guardarSolicitudEstudio();
        this.formularioEstado['solicitudEstudio'] = true;
        const tipoEstudio = this.solicitudEstudioForm.value.tipo_estudio;
        this.success = `Solicitud de ${this.getTipoEstudioNombre(tipoEstudio)} guardada correctamente`;

        // Generar PDF automáticamente
        await this.generarPDFSolicitudEstudio(tipoEstudio);
        break;
      case 'prescripcionMedicamento':
        await this.guardarPrescripcionMedicamento();
        this.formularioEstado['prescripcionMedicamento'] = true;
        this.success = 'Prescripción de Medicamentos guardada correctamente';
        break;

       default:
         throw new Error('Tipo de formulario no válido');
     }

     if (this.formularioActivo !== 'signosVitales' && this.formularioActivo !== null) {
       this.mostrarConfirmacionPDF(this.getTituloFormulario(this.formularioActivo));
     }

     localStorage.removeItem(`perfil_paciente_${this.pacienteId}`);
     console.log('- Formulario completado:', this.formularioActivo);

     this.cargarDatosPaciente().subscribe((data) => {
       this.construirPacienteCompleto(data);
     });
   } catch (error: any) {
     console.error(`❌ Error al guardar ${this.formularioActivo ?? 'desconocido'}:`, error);
     if (this.formularioActivo !== null) {
       this.formularioEstado[this.formularioActivo] = true;
     } else {
       this.error = 'Error al procesar un formulario no especificado';
     }
     this.manejarError(error, 'guardar formulario');
   } finally {
     this.isCreatingDocument = false;
   }
 }

 // ✅ MÉTODO CORREGIDO generarPDF
  async generarPDF(tipoDocumento: string): Promise<void> {
    try {
      console.log(`- Generando PDF para: ${tipoDocumento}`);
      this.isCreatingDocument = true;
      const medicoCompleto = await this.obtenerDatosMedicoCompleto();
      const datosPacienteEstructurados = this.extraerDatosPaciente();

      switch (tipoDocumento) {
        case 'Historia Clínica':
          await this.pdfGeneratorService.generarHistoriaClinica({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            historiaClinica: {
              ...this.historiaClinicaForm.value,
              lugar_nacimiento: this.extraerLugarNacimiento(),
              tipo_historia: datosPacienteEstructurados.edad < 18 ? 'pediatrica' : 'general',
            },
            signosVitales: this.signosVitalesForm.value,
            guiasClinicas: this.guiasClinicasSeleccionadas,
            guiaClinica: this.guiasClinicasSeleccionadas[0] || null,
            datosPadres: {
              nombre_padre: datosPacienteEstructurados.nombre_padre || 'No registrado',
              nombre_madre: datosPacienteEstructurados.nombre_madre || 'No registrado',
              edad_padre: datosPacienteEstructurados.edad_padre || null,
              edad_madre: datosPacienteEstructurados.edad_madre || null,
            }
          });
          break;

        case 'Signos Vitales':
          await this.pdfGeneratorService.generarSignosVitales({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            signosVitales: {
              ...this.signosVitalesForm.value,
              observaciones: this.signosVitalesForm.value.observaciones || 'Sin observaciones específicas. Paciente estable.',
            },
          });
          break;

        case 'Hoja Frontal Expediente':
        case 'Hoja Frontal': // ✅ MÉTODO CORREGIDO
          await this.pdfGeneratorService.generarDocumento('Hoja Frontal', {
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            hojaFrontal: this.hojaFrontalForm?.value || {}
          });
          break;

        default:
          console.warn('Tipo de documento no soportado:', tipoDocumento);
          throw new Error(`Tipo de documento "${tipoDocumento}" no es válido`);
      }

      this.success = `PDF de ${tipoDocumento} generado exitosamente`;
      console.log(`PDF de ${tipoDocumento} creado correctamente`);
      setTimeout(() => { this.success = ''; }, 5000);
    } catch (error) {
      console.error(' Error al generar PDF:', error);
      if (error instanceof Error) {
        this.error = `Error al generar PDF: ${error.message}`;
      } else {
        this.error = 'Error al generar el PDF. Por favor intente nuevamente.';
      }
      setTimeout(() => { this.error = ''; }, 8000);
    } finally {
      this.isCreatingDocument = false;
    }
  }

  private async generarPDFSolicitudEstudio(tipoEstudio: string): Promise<void> {
  try {
    const medicoCompleto = await this.obtenerDatosMedicoCompleto();
    const datosPacienteEstructurados = this.extraerDatosPaciente();

    await this.pdfGeneratorService.generarDocumento('Solicitud de Estudio', {
      paciente: datosPacienteEstructurados,
      medico: medicoCompleto,
      expediente: this.pacienteCompleto?.expediente,
      solicitudEstudio: {
        ...this.solicitudEstudioForm.value,
        estudios_solicitados: this.construirEstudiosSeleccionados(tipoEstudio)
      }
    });

    console.log(`✅ PDF de Solicitud de ${tipoEstudio} generado correctamente`);
  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    this.error = 'Error al generar el PDF de la solicitud';
  }
}

 // ===================================
 // MÉTODOS AUXILIARES PRINCIPALES
 // ===================================

 private inicializarFormularios(): void {
   this.signosVitalesForm = this.initializeSignosVitalesForm();
   this.historiaClinicaForm = this.initializeHistoriaClinicaForm();
   this.notaUrgenciasForm = this.initializeNotaUrgenciasForm();
   this.notaEvolucionForm = this.initializeNotaEvolucionForm();
   this.consentimientoForm = this.initializeConsentimientoForm();
   this.notaPreoperatoriaForm = this.initializeNotaPreoperatoriaForm();
   this.notaPostoperatoriaForm = this.initializeNotaPostoperatoriaForm();
   this.notaPreanestesicaForm = this.initializeNotaPreanestesicaForm();
   this.notaPostanestesicaForm = this.initializeNotaPostanestesicaForm();
   this.notaInterconsultaForm = this.initializeNotaInterconsultaForm();
   this.solicitudEstudioForm = this.initializeSolicitudEstudioForm();
   this.prescripcionForm = this.initializePrescripcionForm();
   this.referenciaForm = this.initializeReferenciaForm();
   this.controlCrecimientoForm = this.initializeControlCrecimientoForm();
   this.esquemaVacunacionForm = this.initializeEsquemaVacunacionForm();
   this.historiaClinicaPediatricaForm = this.initializeHistoriaClinicaPediatricaForm();
   this.desarrolloPsicomotrizForm = this.initializeDesarrolloPsicomotrizForm();
   this.alimentacionPediatricaForm = this.initializeAlimentacionPediatricaForm();
   this.tamizajeNeonatalForm = this.initializeTamizajeNeonatalForm();
   this.antecedentesHeredoFamiliaresForm = this.initializeAntecedentesHeredoFamiliaresForm();
   this.antecedentesPerinatalesForm = this.initializeAntecedentesPerinatalesForm();
   this.estadoNutricionalPediatricoForm = this.initializeEstadoNutricionalPediatricoForm();
   this.inmunizacionesForm = this.initializeInmunizacionesForm();
   this.vacunasAdicionalesForm = this.initializeVacunasAdicionalesForm();
   this.solicitudCultivoForm = this.initializeSolicitudCultivoForm();
   this.solicitudGasometriaForm = this.initializeSolicitudGasometriaForm();
   this.registroTransfusionForm = this.initializeRegistroTransfusionForm();
   this.altaVoluntariaForm = this.initializeAltaVoluntariaForm();
   this.hojaFrontalForm = this.initializeHojaFrontalForm();
   console.log('Todos los formularios han sido inicializados correctamente.');
 }

 private inicializarFlujoPaciente(): void {
   this.inicializarFormularios();
   this.recuperarDatosLocales();
   this.initializeComponent();
   this.cargarGuiasClinicas();
   this.determinarTipoPaciente();
   this.configurarDocumentosDisponibles();
   this.iniciarAutoguardado();

   setTimeout(() => {
     this.debugPacienteCompleto();
   }, 2000);
 }

 cambiarFormulario(tipoFormulario: string): void {
   if (this.formularioActivo === tipoFormulario) return;

   if (!this.puedeAccederFormulario(tipoFormulario)) {
     this.mostrarMensajeValidacion(tipoFormulario);
     return;
   }

   console.log(`Cambiando formulario de ${this.formularioActivo} a ${tipoFormulario}`);

   const formulariosValidos: FormularioActivo[] = [
     'signosVitales', 'historiaClinica', 'hojaFrontal', 'notaUrgencias', 'notaEvolucion',
     'consentimiento', 'notaPreoperatoria', 'notaPostoperatoria', 'notaPreanestesica',
     'notaPostanestesica', 'notaInterconsulta', 'controlCrecimiento', 'esquemaVacunacion',
     'solicitudEstudio', 'referenciaTraslado', 'prescripcionMedicamento', 'solicitudCultivo',
     'solicitudGasometria', 'altaVoluntaria'
   ];

   if (formulariosValidos.includes(tipoFormulario as FormularioActivo)) {
     this.error = null;
     this.success = null;
     this.formularioActivo = tipoFormulario as FormularioActivo;
   } else {
     console.warn(`Formulario no válido: ${tipoFormulario}`);
   }
 }

 private getTituloFormulario(formulario: string): string {
   const titulos: { [key: string]: string } = {
     signosVitales: 'Signos Vitales',
     historiaClinica: this.esPacientePediatrico ? 'Historia Clínica Pediátrica' : 'Historia Clínica',
     hojaFrontal: 'Hoja Frontal',
     notaUrgencias: 'Nota de Urgencias',
     notaEvolucion: 'Nota de Evolución',
     consentimiento: 'Consentimiento Informado',
     notaInterconsulta: 'Nota de Interconsulta',
     notaPreoperatoria: 'Nota Preoperatoria',
     notaPostoperatoria: 'Nota Postoperatoria',
     notaPreanestesica: 'Nota Preanestésica',
     notaPostanestesica: 'Nota Postanestésica',
     controlCrecimiento: 'Control de Crecimiento',
     esquemaVacunacion: 'Esquema de Vacunación',
     solicitudEstudio: 'Solicitud de Estudio',
     referenciaTraslado: 'Referencia Traslado',
     solicitudCultivo: 'Solicitud Cultivo',
      prescripcionMedicamento: 'Prescripción de Medicamentos',
     solicitudGasometria: 'Solicitud Gasometría',
     altaVoluntaria: 'Alta Voluntaria',
   };
   return titulos[formulario] || formulario;
 }

 // ===================================
 // MÉTODOS DE NAVEGACIÓN Y UI
 // ===================================

 private inicializarFormulariosVisibles(): void {
   this.formulariosVisibles = Object.keys(this.configFormularios);
 }

 toggleGrupo(nombreGrupo: string): void {
   this.grupoExpandido = this.grupoExpandido === nombreGrupo ? null : nombreGrupo;
 }

 filtrarFormularios(): void {
   if (!this.busquedaFormulario.trim()) {
     this.formulariosVisibles = Object.keys(this.configFormularios);
     return;
   }
   const termino = this.busquedaFormulario.toLowerCase();
   this.formulariosVisibles = Object.keys(this.configFormularios).filter(
     (key) => this.configFormularios[key].nombre.toLowerCase().includes(termino)
   );
 }

 getFormulariosVisibles(): any[] {
  return this.formulariosVisibles
    .filter((key) => this.configFormularios[key])
    .map((key) => ({
      key: key,  // ✅ ASEGURAR QUE EXISTE LA PROPIEDAD KEY
      ...this.configFormularios[key]
    }));
}

 getClaseBotonFormulario(formulario: string): string {
   const isActive = this.formularioActivo === formulario;
   const config = this.configFormularios[formulario];
   const puedeAcceder = this.puedeAccederFormulario(formulario);

   if (isActive) {
     return 'bg-blue-500 text-white shadow-lg transform scale-105';
   }
   if (!puedeAcceder) {
     return 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed opacity-60';
   }

   let clases = 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-md hover:border-gray-300';
   if (config?.completado) {
     clases += ' ring-2 ring-green-200';
   }
   if (config?.obligatorio && !config?.completado) {
     clases += ' ring-2 ring-red-200';
   }
   return clases;
 }

 // ===================================
 // GETTERS Y PROPIEDADES CALCULADAS
 // ===================================

 get formularioActualValido(): boolean {
   switch (this.formularioActivo) {
     case 'signosVitales': return this.signosVitalesForm.valid;
     case 'historiaClinica': return this.historiaClinicaForm.valid;
     case 'hojaFrontal': return this.hojaFrontalForm.valid; // ✅ AGREGADO
     case 'notaUrgencias': return this.notaUrgenciasForm.valid;
     case 'notaEvolucion': return this.notaEvolucionForm.valid;
     case 'consentimiento': return this.consentimientoForm.valid;
     case 'notaPreoperatoria': return this.notaPreoperatoriaForm.valid;
     case 'notaPostoperatoria': return this.notaPostoperatoriaForm.valid;
     case 'notaPreanestesica': return this.notaPreanestesicaForm.valid;
     case 'notaPostanestesica': return this.notaPostanestesicaForm.valid;
     case 'notaInterconsulta': return this.notaInterconsultaForm.valid;
     case 'controlCrecimiento': return true;
     case 'esquemaVacunacion': return true;
     case 'solicitudEstudio': return this.solicitudEstudioForm.valid;
     case 'prescripcionMedicamento':
      return this.prescripcionForm.valid && this.medicamentosFormArray.length > 0;
     default: return false;
   }
 }

 get mostrarCargando(): boolean {
   return this.isLoading;
 }

 get mostrarContenido(): boolean {
   return !!this.pacienteCompleto && !this.isLoading && !this.error;
 }

 // ===================================
 // MÉTODOS AUXILIARES Y UTILIDADES
 // ===================================

 calcularEdad(fechaNacimiento?: string | null): number {
   let fecha = fechaNacimiento;

   if (!fecha) {
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

   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
     age--;
   }
   return age;
 }

 getNombreCompleto(): string {
   const persona = this.pacienteCompleto?.persona;
   const personaInfo = this.personaInfo;

   const objetos = [persona, personaInfo, this.pacienteCompleto?.paciente as any];

   let nombre = '';
   let apellidoPaterno = '';
   let apellidoMaterno = '';

   for (const obj of objetos) {
     if (!nombre) nombre = this.getNestedProperty(obj, 'nombre') || '';
     if (!apellidoPaterno) apellidoPaterno = this.getNestedProperty(obj, 'apellido_paterno') || '';
     if (!apellidoMaterno) apellidoMaterno = this.getNestedProperty(obj, 'apellido_materno') || '';
     if (nombre && apellidoPaterno && apellidoMaterno) break;
   }

   const nombreCompleto = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim();
   return nombreCompleto || 'Sin nombre registrado';
 }

 get personaInfo(): any {
   const pacienteCompleto = this.pacienteCompleto;
   if (!pacienteCompleto) return {};
   const pacienteData = pacienteCompleto.paciente as any;
   return (
     pacienteCompleto.persona ||
     pacienteCompleto['persona'] ||
     pacienteData?.persona ||
     pacienteData?.['persona'] ||
     pacienteCompleto.paciente ||
     {}
   );
 }

 private getNestedProperty(obj: any, path: string): any {
   if (!this.esObjetoValido(obj)) return null;
   if (this.tienePropiedad(obj, path)) {
     return obj[path];
   }
   return null;
 }

 private esObjetoValido(obj: any): boolean {
   return obj && typeof obj === 'object' && !Array.isArray(obj);
 }

 private tienePropiedad(obj: any, prop: string): boolean {
   return this.esObjetoValido(obj) && (prop in obj || obj[prop] !== undefined);
 }

 // ===================================
 // MÉTODOS OBLIGATORIOS FALTANTES
 // ===================================

 private extraerDatosPaciente(): any {
   if (!this.pacienteCompleto) return {};

   const paciente = this.pacienteCompleto.paciente as any;
   const persona = paciente?.persona || this.pacienteCompleto.persona || {};
   const expediente = this.pacienteCompleto.expediente || {};
   const edad = this.calcularEdad(persona.fecha_nacimiento || '');
   const esPediatrico = edad < 18;

   const datosBase = {
     id_paciente: paciente?.id_paciente,
     nombre: persona.nombre || '',
     apellido_paterno: persona.apellido_paterno || '',
     apellido_materno: persona.apellido_materno || '',
     nombre_completo: this.getNombreCompleto(),
     fecha_nacimiento: persona.fecha_nacimiento || '',
     edad: edad,
     sexo: this.formatearSexo(persona.sexo || ''),
     curp: persona.curp || '',
     tipo_sangre: persona.tipo_sangre || paciente?.tipo_sangre || 'No especificado',
     telefono: persona.telefono || '',
     correo_electronico: persona.correo_electronico || '',
     domicilio: this.extraerDireccionCompleta() || 'Sin dirección registrada',
     lugar_nacimiento: this.extraerLugarNacimiento() || 'No especificado',
     numero_expediente: expediente?.numero_expediente_administrativo || expediente?.numero_expediente || 'Sin número',
     religion: persona.religion || 'No registrada',
     familiar_responsable: paciente?.familiar_responsable || 'No registrado',
     telefono_familiar: paciente?.telefono_familiar || 'No registrado',
     expediente: expediente
   };

   if (esPediatrico) {
     return {
       ...datosBase,
       nombre_padre: paciente?.nombre_padre || 'No registrado',
       nombre_madre: paciente?.nombre_madre || 'No registrado',
       edad_padre: paciente?.edad_padre || null,
       edad_madre: paciente?.edad_madre || null,
       ocupacion: 'Estudiante',
       estado_civil: 'Soltero(a)',
       escolaridad: this.determinarGradoEscolarPorEdad(edad),
     };
   }

   return {
     ...datosBase,
     ocupacion: paciente?.ocupacion || 'No registrada',
     estado_civil: persona.estado_civil || 'No registrado',
     escolaridad: paciente?.escolaridad || 'No registrada',
   };
 }

 private extraerDireccionCompleta(): string {
   const persona = this.pacienteCompleto?.persona;
   const personaInfo = this.personaInfo;
   const paciente = this.pacienteCompleto?.paciente;

   const domicilio = persona?.domicilio || personaInfo?.domicilio || (paciente as any)?.domicilio || persona?.direccion || personaInfo?.direccion;
   return domicilio && domicilio.trim() !== '' ? domicilio.trim() : 'Sin dirección registrada';
 }

 private extraerLugarNacimiento(): string {
   if (!this.pacienteCompleto) return 'No especificado';

   const paciente = this.pacienteCompleto.paciente;
   if (paciente?.lugar_nacimiento) {
     return paciente.lugar_nacimiento;
   }

   const persona = this.pacienteCompleto.persona;
   if (persona?.lugar_nacimiento) {
     return persona.lugar_nacimiento;
   }

   const lugarConstruido = [
     persona?.ciudad_nacimiento,
     persona?.municipio_nacimiento,
     persona?.estado_nacimiento
   ].filter(campo => campo && campo.trim() !== '').join(', ');

   return lugarConstruido || 'No especificado';
 }

 private determinarGradoEscolarPorEdad(edad: number): string {
   if (edad < 3) return 'Lactante';
   if (edad < 6) return 'Preescolar';
   if (edad >= 6 && edad <= 11) return `${edad - 5}° Primaria`;
   if (edad >= 12 && edad <= 14) return `${edad - 11}° Secundaria`;
   if (edad >= 15 && edad <= 17) return `${edad - 14}° Preparatoria`;
   return 'Estudiante';
 }

 private formatearSexo(sexo: string): string {
   if (!sexo) return 'No especificado';
   const sexoUpper = sexo.toUpperCase();
   switch (sexoUpper) {
     case 'M':
     case 'MASCULINO':
       return 'Masculino';
     case 'F':
     case 'FEMENINO':
       return 'Femenino';
     default:
       return sexo;
   }
 }

 // ===================================
 // MÉTODOS AUXILIARES RESTANTES
 // ===================================

 private async cargarCatalogosMedicamentos(): Promise<void> {
  try {
    // Cargar medicamentos más prescritos para mostrar primero
    const masPrescritosResponse = await this.medicamentosService.getMasPrescitos(20);
    if (masPrescritosResponse.success) {
      this.medicamentosMasPrescitos = masPrescritosResponse.data || [];
    }

    // Cargar todos los medicamentos activos
    const medicamentosResponse = await this.medicamentosService.getAll({ activo: true });
    if (medicamentosResponse.success) {
      this.medicamentosDisponibles = medicamentosResponse.data || [];
      this.medicamentosFiltrados = [...this.medicamentosDisponibles];
    }

    // Cargar grupos terapéuticos
    const gruposResponse = await this.medicamentosService.getGruposTerapeuticos();
    if (gruposResponse.success) {
      this.gruposTerapeuticos = gruposResponse.data || [];
    }

    // Cargar presentaciones
    const presentacionesResponse = await this.medicamentosService.getPresentaciones();
    if (presentacionesResponse.success) {
      this.presentacionesDisponibles = presentacionesResponse.data || [];
    }

    console.log('✅ Catálogos de medicamentos cargados:', {
      medicamentos: this.medicamentosDisponibles.length,
      masPrescitos: this.medicamentosMasPrescitos.length,
      grupos: this.gruposTerapeuticos.length
    });
  } catch (error) {
    console.error('❌ Error al cargar catálogos de medicamentos:', error);
  }
}

 async cargarCamasDisponibles(): Promise<void> {
   try {
     const response = await this.camasService.getCamasDisponibles();
     this.camasDisponibles = response.data || [];
     this.camas = this.camasDisponibles;
   } catch (error) {
     console.error('Error al cargar camas:', error);
   }
 }

 trackByCamaId(index: number, cama: Cama): number {
   return cama.id_cama;
 }

 onCamaInputChange(valor: string): void {
   this.filtroCama = valor;
   if (valor.length > 0) {
     this.camas = this.camasDisponibles.filter(cama =>
       cama.numero.toLowerCase().includes(valor.toLowerCase()) ||
       cama.area.toLowerCase().includes(valor.toLowerCase()) ||
       (cama.subarea && cama.subarea.toLowerCase().includes(valor.toLowerCase()))
     );
   } else {
     this.camas = this.camasDisponibles;
   }
 }

 // Métodos para guías clínicas
 agregarGuiaClinica(guia: GuiaClinica): void {
   const yaSeleccionada = this.guiasClinicasSeleccionadas.find(g => g.id_guia_diagnostico === guia.id_guia_diagnostico);
   if (!yaSeleccionada) {
     this.guiasClinicasSeleccionadas.push(guia);
     this.limpiarBusquedaGuia();
   }
 }

 eliminarGuiaClinica(guia: GuiaClinica): void {
   this.guiasClinicasSeleccionadas = this.guiasClinicasSeleccionadas.filter(
     g => g.id_guia_diagnostico !== guia.id_guia_diagnostico
   );
}

 limpiarBusquedaGuia(): void {
   this.filtroGuiaClinica = '';
   this.guiaClinicaSeleccionada = null;
   this.mostrarDropdownGuias = false;
 }

 seleccionarGuiaClinica(guia: GuiaClinica): void {
   this.agregarGuiaClinica(guia);
 }

 esGuiaSeleccionada(guia: GuiaClinica): boolean {
   return this.guiasClinicasSeleccionadas.some(g => g.id_guia_diagnostico === guia.id_guia_diagnostico);
 }

 trackByGuiaId(index: number, guia: GuiaClinica): number {
   return guia.id_guia_diagnostico;
 }

 calcularGlasgowTotal(): number {
   const ocular = this.notaUrgenciasForm?.get('glasgow_ocular')?.value || 0;
   const verbal = this.notaUrgenciasForm?.get('glasgow_verbal')?.value || 0;
   const motor = this.notaUrgenciasForm?.get('glasgow_motor')?.value || 0;
   return parseInt(ocular) + parseInt(verbal) + parseInt(motor);
 }

 // ===================================
 // MÉTODOS DE CARGA DE DATOS
 // ===================================

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
       next: async (data) => {
         this.construirPacienteCompleto(data.paciente);
         this.procesarCatalogos(data.catalogos);
         try {
           this.medicoCompleto = await this.obtenerDatosMedicoCompleto();
         } catch (error) {
           console.warn('No se pudieron cargar datos del médico:', error);
         }
         this.isLoading = false;
         console.log('- Componente inicializado correctamente');
       },
       error: (error) => {
         console.error('❌ Error al inicializar componente:', error);
         this.error = 'Error al cargar la información del paciente';
         this.isLoading = false;
       },
     });
 }

 private cargarDatosPaciente(): Observable<any> {
   if (!this.pacienteId) {
     throw new Error('ID de paciente no válido');
   }
   return forkJoin({
     paciente: this.pacientesService.getPacienteById(this.pacienteId),
     expediente: this.expedientesService.getExpedienteByPacienteId(this.pacienteId),
     documentos: this.obtenerDocumentosPorPaciente(this.pacienteId),
     signosVitales: this.signosVitalesService.getSignosVitalesByPacienteId(this.pacienteId),
   }).pipe(takeUntil(this.destroy$));
 }

 private obtenerDocumentosPorPaciente(idPaciente: number): Observable<any> {
   return this.expedientesService.getExpedienteByPacienteId(idPaciente).pipe(
     switchMap((expedienteResponse) => {
       if (expedienteResponse.success && expedienteResponse.data?.id_expediente) {
         return this.documentosService.getDocumentosByExpediente(expedienteResponse.data.id_expediente);
       } else {
         return of({ success: true, message: 'Sin documentos', data: [] });
       }
     }),
     catchError((error) => {
       console.error('Error al obtener documentos:', error);
       return of({ success: false, message: 'Error al obtener documentos', data: [] });
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

 private construirPacienteCompleto(data: any): void {
   console.log('  Datos recibidos para construir paciente completo:', data);
   const pacienteData = (data.paciente?.data as any) || {};
   this.pacienteCompleto = {
     persona: pacienteData.persona || pacienteData['persona'] || pacienteData,
     paciente: {
       ...pacienteData,
       persona: pacienteData.persona || pacienteData['persona'],
     } as Paciente & { persona?: any; [key: string]: any },
     expediente: data.expediente?.data || {},
     documentos: Array.isArray(data.documentos?.data) ? data.documentos.data : [],
     ultimoInternamiento: null,
     signosVitales: Array.isArray(data.signosVitales?.data) ? data.signosVitales.data : [],
   };

   console.log('- Paciente completo construido:', this.pacienteCompleto);
   this.preLlenarFormularios();
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

private construirEstudiosSeleccionados(tipoEstudio: string): string {
  const form = this.solicitudEstudioForm.value;
  const estudios: string[] = [];

  // Mapeos según el tipo de estudio
  let mapeoEstudios: { [key: string]: string } = {};

  if (tipoEstudio === 'laboratorio') {
    mapeoEstudios = {
      biometria_hematica: 'Biometría hemática completa',
      quimica_sanguinea: 'Química sanguínea',
      glucosa: 'Glucosa sérica',
      urea: 'Urea',
      creatinina: 'Creatinina',
      acido_urico: 'Ácido úrico',
      colesterol_total: 'Colesterol total',
      trigliceridos: 'Triglicéridos',
      hdl: 'HDL colesterol',
      ldl: 'LDL colesterol',
      transaminasas: 'Transaminasas (ALT/AST)',
      bilirrubinas: 'Bilirrubinas',
      proteinas_totales: 'Proteínas totales',
      albumina: 'Albúmina',
      fosfatasa_alcalina: 'Fosfatasa alcalina',
      sodio: 'Sodio sérico',
      potasio: 'Potasio sérico',
      cloro: 'Cloro sérico',
      tsh: 'TSH',
      t3: 'T3',
      t4: 'T4',
      examen_general_orina: 'Examen general de orina',
      urocultivo: 'Urocultivo',
      coproparasitoscopico: 'Coproparasitoscópico',
      coprocultivo: 'Coprocultivo',
      sangre_oculta_heces: 'Sangre oculta en heces',
      troponinas: 'Troponinas',
      ck_mb: 'CK-MB',
      tiempo_protrombina: 'Tiempo de protrombina',
      tiempo_tromboplastina: 'Tiempo de tromboplastina parcial',
      inr: 'INR'
    };
  } else if (tipoEstudio === 'imagen') {
    mapeoEstudios = {
      radiografia_torax: 'Radiografía de tórax',
      radiografia_abdomen: 'Radiografía de abdomen',
      radiografia_columna: 'Radiografía de columna',
      radiografia_extremidades: 'Radiografía de extremidades',
      ultrasonido_abdominal: 'Ultrasonido abdominal',
      ultrasonido_pelvico: 'Ultrasonido pélvico',
      ultrasonido_tiroideo: 'Ultrasonido tiroideo',
      ultrasonido_carotideo: 'Ultrasonido carotídeo',
      ultrasonido_renal: 'Ultrasonido renal',
      ecocardiograma: 'Ecocardiograma',
      tomografia_cerebral: 'Tomografía cerebral',
      tomografia_torax: 'Tomografía de tórax',
      tomografia_abdomen: 'Tomografía abdominal',
      tomografia_contrastada: 'Tomografía con contraste',
      resonancia_cerebral: 'Resonancia magnética cerebral',
      resonancia_columna: 'Resonancia magnética de columna',
      resonancia_articular: 'Resonancia magnética articular',
      mamografia: 'Mamografía',
      densitometria_osea: 'Densitometría ósea'
    };
  }

  // Agregar estudios seleccionados
  Object.keys(mapeoEstudios).forEach(campo => {
    if (form[campo]) {
      estudios.push(mapeoEstudios[campo]);
    }
  });

  // Agregar otros estudios si los hay
  if (form.otros_estudios && form.otros_estudios.trim()) {
    estudios.push(form.otros_estudios.trim());
  }

  return estudios.join('\n');
}


 // ===================================
 // MÉTODOS DE GUARDADO
 // ===================================

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
     presion_arterial_sistolica: this.signosVitalesForm.value.presion_arterial_sistolica || null,
     presion_arterial_diastolica: this.signosVitalesForm.value.presion_arterial_diastolica || null,
     frecuencia_cardiaca: this.signosVitalesForm.value.frecuencia_cardiaca || null,
     frecuencia_respiratoria: this.signosVitalesForm.value.frecuencia_respiratoria || null,
     saturacion_oxigeno: this.signosVitalesForm.value.saturacion_oxigeno || null,
     glucosa: this.signosVitalesForm.value.glucosa || null,
     peso: this.signosVitalesForm.value.peso || null,
     talla: this.signosVitalesForm.value.talla || null,
     observaciones: this.signosVitalesForm.value.observaciones || '',
   };

   const response = await firstValueFrom(this.signosVitalesService.createSignosVitales(signosData));
   console.log(' Signos vitales guardados exitosamente:', response);

   if (response?.data?.id_documento) {
     this.documentoClinicoActual = response.data.id_documento;
   }
 }

 private async guardarHistoriaClinica(): Promise<void> {
   if (!this.historiaClinicaForm.valid) {
     throw new Error('Formulario de historia clínica inválido');
   }

   if (!this.documentoClinicoActual) {
     if (this.signosVitalesDisponibles && this.signosVitalesDisponibles.length > 0) {
       const ultimoSigno = this.signosVitalesDisponibles[0];
       if (ultimoSigno.id_documento) {
         this.documentoClinicoActual = ultimoSigno.id_documento;
       }
     }

     if (!this.documentoClinicoActual) {
       await this.crearDocumentoClinicoPadre();
     }
   }

   const historiaData: CreateHistoriaClinicaDto = {
     id_documento: this.documentoClinicoActual!,
     id_guia_diagnostico: this.historiaClinicaForm.value.id_guia_diagnostico || null,
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
     pronostico: this.historiaClinicaForm.value.pronostico || null,
     numero_cama: this.historiaClinicaForm.value.numero_cama || null,
     guias_clinicas_ids: this.guiasClinicasSeleccionadas.map(g => g.id_guia_diagnostico),
   };

   try {
     const response = await firstValueFrom(this.historiasClinicasService.createHistoriaClinica(historiaData));
     console.log('- Historia clínica guardada exitosamente:', response);
   } catch (error: any) {
     console.error('❌ Error al guardar historia clínica:', error);
     if (error?.status === 409) {
       this.formularioEstado['historiaClinica'] = true;
       this.success = 'Historia clínica validada correctamente';
       return;
     }
     throw error;
   }
 }



 // ===================================
 // MÉTODOS DE DOCUMENTOS
 // ===================================

 private async crearDocumentoClinicoPadre(tipoDocumento?: string): Promise<void> {
  if (!this.pacienteCompleto?.expediente.id_expediente) {
    throw new Error('No hay expediente disponible');
  }

  let nombreBusqueda = 'Historia Clínica';
  if (tipoDocumento) {
    nombreBusqueda = tipoDocumento;
  }

  const tipoDocumentoEncontrado = this.tiposDocumentosDisponibles.find(
    (t) => t.nombre === nombreBusqueda || t.nombre.toLowerCase().includes(nombreBusqueda.toLowerCase())
  );

  if (!tipoDocumentoEncontrado) {
    // Si no encuentra el tipo específico, usar Historia Clínica como fallback
    const tipoHistoriaClinica = this.tiposDocumentosDisponibles.find(
      (t) => t.nombre === 'Historia Clínica' || t.nombre.toLowerCase().includes('historia')
    );

    if (!tipoHistoriaClinica) {
      throw new Error('Tipo de documento Historia Clínica no encontrado');
    }
  }

  const tipoFinal = tipoDocumentoEncontrado || this.tiposDocumentosDisponibles.find(t => t.nombre.includes('Historia'));

  const documentoData = {
    id_expediente: this.pacienteCompleto.expediente.id_expediente,
    id_internamiento: this.pacienteCompleto.ultimoInternamiento?.id_internamiento || null,
    id_tipo_documento: tipoFinal!.id_tipo_documento,
    id_personal_creador: this.medicoActual!,
    fecha_elaboracion: new Date().toISOString(),
    estado: EstadoDocumento.ACTIVO,
  };

  const response = await firstValueFrom(this.documentosService.createDocumentoClinico(documentoData));

  if (response?.data?.id_documento) {
    this.documentoClinicoActual = response.data.id_documento;
  } else {
    throw new Error('Error al crear documento clínico');
  }
}

 private getTipoEstudioNombre(tipo: string): string {
  const nombres: { [key: string]: string } = {
    laboratorio: 'Laboratorio',
    imagen: 'Imagenología',
    otros: 'Estudio Especial'
  };
  return nombres[tipo] || 'Estudio';
}
private async guardarSolicitudEstudio(): Promise<void> {
  if (!this.solicitudEstudioForm.valid) {
    throw new Error('Formulario de solicitud de estudio inválido');
  }

  if (!this.pacienteCompleto?.expediente.id_expediente) {
    throw new Error('No hay expediente disponible');
  }

  // Crear documento padre si no existe
  if (!this.documentoClinicoActual) {
await this.crearDocumentoClinicoPadre();
  }

  const tipoEstudio = this.solicitudEstudioForm.value.tipo_estudio;
  const estudiosSeleccionados = this.construirEstudiosSeleccionados(tipoEstudio);

  const solicitudData = {
    id_documento: this.documentoClinicoActual!,
    tipo_estudio: tipoEstudio,
    estudios_solicitados: estudiosSeleccionados,
    indicacion_clinica: this.solicitudEstudioForm.value.indicacion_clinica,
    diagnostico_presuntivo: this.solicitudEstudioForm.value.diagnostico_presuntivo,
    urgencia: this.solicitudEstudioForm.value.urgencia,
    ayuno_requerido: this.solicitudEstudioForm.value.ayuno_requerido,
    contraste_requerido: this.solicitudEstudioForm.value.contraste_requerido,
    sedacion_requerida: this.solicitudEstudioForm.value.sedacion_requerida,
    observaciones: this.solicitudEstudioForm.value.observaciones,
    fecha_programada: this.solicitudEstudioForm.value.fecha_programada || null
  };

  try {
    console.log(`📄 Datos de solicitud de ${tipoEstudio} preparados:`, solicitudData);
    // Aquí integraremos con el backend más tarde
  } catch (error: any) {
    console.error(`❌ Error al guardar solicitud de ${tipoEstudio}:`, error);
    throw error;
  }
}

 private async obtenerDatosMedicoCompleto(): Promise<any> {
   try {
     if (!this.medicoActual) {
       throw new Error('No hay médico autenticado');
     }

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
         departamento: medico.departamento,
       };
     }

     const usuarioActual = this.authService.getCurrentUser();
     return {
       id_personal_medico: this.medicoActual,
       nombre_completo: usuarioActual?.nombre_completo || 'Médico no identificado',
       numero_cedula: 'No disponible',
       especialidad: usuarioActual?.especialidad || 'No especificada',
       cargo: usuarioActual?.cargo || 'Médico',
       departamento: usuarioActual?.departamento || 'No especificado',
     };
   } catch (error) {
     console.error('❌ Error al obtener datos del médico:', error);
     return {
       id_personal_medico: this.medicoActual || 0,
       nombre_completo: 'Médico no identificado',
       numero_cedula: 'No disponible',
       especialidad: 'No especificada',
       cargo: 'Médico',
       departamento: 'No especificado',
     };
   }
 }



 // ===================================
 // MÉTODOS DE UTILIDAD Y AUXILIARES
 // ===================================

 private getIconoTipoDocumento(nombre: string): string {
   const iconos: { [key: string]: string } = {
     'Historia Clínica': 'fas fa-file-medical-alt',
     'Nota de Urgencias': 'fas fa-ambulance',
     'Nota de Evolución': 'fas fa-chart-line',
     'Nota de Interconsulta': 'fas fa-user-md',
     'Nota Preoperatoria': 'fas fa-procedures',
     'Nota Postoperatoria': 'fas fa-band-aid',
     'Nota de Egreso': 'fas fa-sign-out-alt',
     'Hoja Frontal': 'fas fa-folder', // ✅ AGREGADO
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
     'Hoja Frontal': 'gray', // ✅ AGREGADO
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

 private determinarTipoPaciente(): void {
   if (this.pacienteCompleto?.persona?.fecha_nacimiento) {
     const edad = this.calcularEdad(this.pacienteCompleto.persona.fecha_nacimiento);
     const esPediatricoAnterior = this.esPacientePediatrico;
     this.esPacientePediatrico = edad < 18;
     console.log(`Paciente ${this.esPacientePediatrico ? 'PEDIÁTRICO' : 'ADULTO'} (${edad} años)`);

     this.evaluarDocumentosQuirurgicos();
     if (esPediatricoAnterior !== this.esPacientePediatrico) {
       this.ajustarFormulariosPorEdad();
     }
   }
 }

 private evaluarDocumentosQuirurgicos(): void {
   this.mostrarDocumentosQuirurgicos = this.pacienteCompleto?.ultimoInternamiento?.requiere_cirugia || false;
 }

 private ajustarFormulariosPorEdad(): void {
   if (this.esPacientePediatrico) {
     console.log('Ajustando formularios para paciente pediátrico');
     this.agregarCamposPediatricos();
   } else {
     console.log('Ajustando formularios para paciente adulto');
   }
 }

 private agregarCamposPediatricos(): void {
   this.historiaClinicaForm = this.fb.group({
     ...this.historiaClinicaForm.controls,
     nombre_madre: [''],
     edad_madre: [''],
     ocupacion_madre: [''],
     nombre_padre: [''],
     edad_padre: [''],
     ocupacion_padre: [''],
     embarazo_planeado: [false],
     tipo_parto: [''],
     peso_nacimiento: [''],
     talla_nacimiento: [''],
     sostuvo_cabeza_meses: [''],
     se_sento_meses: [''],
     camino_meses: [''],
     primeras_palabras_meses: [''],
     lactancia_materna: [false],
     lactancia_duracion_meses: [''],
     peso_actual: [''],
     talla_actual: [''],
     perimetro_cefalico: [''],
   });
 }

 private configurarDocumentosDisponibles(): void {
   let documentosBase = [...this.documentosDisponibles];

   if (this.esPacientePediatrico) {
     documentosBase = documentosBase.map((doc) => {
       if (doc.id === 'historiaClinica') {
         return {
           ...doc,
           nombre: 'Historia Clínica Pediátrica',
           descripcion: 'Historia clínica especializada para pacientes pediátricos',
         };
       }
       return doc;
     });
   }

   this.documentosDisponiblesFiltrados = documentosBase.sort((a, b) => a.orden - b.orden);
 }

 documentosDisponiblesFiltrados: TipoDocumentoConfig[] = [];

 // ===================================
 // MÉTODOS DE VALIDACIÓN Y NAVEGACIÓN
 // ===================================

 puedeAccederFormulario(formulario: string): boolean {
  if (!formulario) return false; // ✅ PROTECCIÓN CONTRA UNDEFINED

  const secuenciaFormularios = [
    'signosVitales',
    'historiaClinica',
    'hojaFrontal', // ✅ AGREGAR HOJA FRONTAL
    'notaUrgencias',
    'notaEvolucion',
  ];

  const indiceDestino = secuenciaFormularios.indexOf(formulario);

  // ✅ Si no está en secuencia, permitir acceso
  if (indiceDestino === -1) return true;

  switch (formulario) {
    case 'signosVitales':
      return true;
    case 'historiaClinica':
      return this.formularioEstado.signosVitales;
    case 'hojaFrontal': // ✅ AGREGAR CASO HOJA FRONTAL
      return true; // Siempre disponible
    case 'notaUrgencias':
    case 'notaEvolucion':
      return this.formularioEstado.signosVitales; // Requiere signos vitales
    default:
      return true;
  }
}

 private mostrarMensajeValidacion(formulario: string): void {
   let mensaje = '';

   switch (formulario) {
     case 'historiaClinica':
       mensaje = 'Debe completar los Signos Vitales antes de acceder a la Historia Clínica.';
       break;
     case 'notaEvolucion':
       if (!this.formularioEstado.signosVitales) {
         mensaje = 'Debe completar los Signos Vitales antes de crear una Nota de Evolución.';
       } else if (!this.formularioEstado.historiaClinica) {
         mensaje = 'Debe completar la Historia Clínica antes de crear una Nota de Evolución.';
       }
       break;
     default:
       mensaje = `No puede acceder a ${this.getTituloFormulario(formulario)} en este momento.`;
   }

   this.error = mensaje;
   setTimeout(() => { this.error = null; }, 5000);
 }

 mostrarConfirmacionPDF(tipoDocumento: string): void {
   if (tipoDocumento === 'Signos Vitales') {
     console.log('PDF de signos vitales desactivado por ahora');
     return;
   }

   if (confirm(`${tipoDocumento} guardado correctamente.\n\n¿Desea generar el PDF ahora?`)) {
     this.generarPDF(tipoDocumento);
   }
 }

 // ===================================
 // MÉTODOS DE NAVEGACIÓN DE TABS
 // ===================================

 cambiarTab(tab: string): void {
   const tabsValidas: TabActiva[] = ['general', 'crear', 'historial', 'datos'];
   if (tabsValidas.includes(tab as TabActiva)) {
     this.tabActiva = tab as TabActiva;
   } else {
     console.warn(`Tab no válida: ${tab}`);
     this.tabActiva = 'general';
   }

   if (this.tabActiva === 'historial') {
     this.cargarHistorialClinico();
   } else if (this.tabActiva === 'datos') {
     this.cargarDatosClinicosConsolidados();
   } else if (this.tabActiva === 'general') {
     this.cargarResumenGeneral();
   }
 }

 private cargarHistorialClinico(): void {
   this.timelineDocumentos = this.documentosDisponibles.map((doc) => ({
     titulo: doc.nombre || 'Documento Clínico',
     fecha: new Date().toISOString(),
     descripcion: `Documento tipo ${doc.nombre}`,
     icono: doc.icono,
     color: doc.color,
     estado: 'Activo',
   }));

   this.historialInternamientos = [];
 }

 private cargarDatosClinicosConsolidados(): void {
   this.datosClinicosConsolidados = {
     alergias: this.extraerAlergias(),
     medicamentosActuales: this.extraerMedicamentos(),
     diagnosticosActivos: this.extraerDiagnosticos(),
     antecedentesRelevantes: this.extraerAntecedentes(),
   };
 }

 private cargarResumenGeneral(): void {
   const documentosReales = this.pacienteCompleto?.documentos || [];
   const documentosRecientes = documentosReales
     .sort((a: any, b: any) => {
       const fechaA = new Date(a.fecha_elaboracion || a.created_at || 0);
       const fechaB = new Date(b.fecha_elaboracion || b.created_at || 0);
       return fechaB.getTime() - fechaA.getTime();
     })
     .slice(0, 5);

   const signosRecientes = this.signosVitalesDisponibles
     .sort((a: any, b: any) => {
       const fechaA = new Date(a.fecha_toma || a.created_at || 0);
       const fechaB = new Date(b.fecha_toma || b.created_at || 0);
       return fechaB.getTime() - fechaA.getTime();
     })
     .slice(0, 5);

   this.resumenGeneral = {
     alertasMedicas: this.identificarAlertasMedicas(),
     ultimoInternamiento: this.pacienteCompleto?.ultimoInternamiento || null,
     signosVitalesRecientes: signosRecientes,
     documentosRecientes: documentosRecientes,
   };
 }

 private extraerAlergias(): string[] { return []; }
 private extraerMedicamentos(): any[] { return []; }
 private extraerDiagnosticos(): any[] { return []; }
 private extraerAntecedentes(): any[] { return []; }

 private identificarAlertasMedicas(): string[] {
   const alertas: string[] = [];
   const ultimosSignos = this.signosVitalesDisponibles[0];

   if (ultimosSignos) {
     if (ultimosSignos.temperatura) {
       if (ultimosSignos.temperatura > 38.5) {
         alertas.push(' Fiebre alta (>38.5°C)');
       } else if (ultimosSignos.temperatura < 35) {
         alertas.push(' Hipotermia (<35°C)');
       }
     }
   }

   return alertas;
 }

 // ===================================
 // MÉTODOS DE MANEJO DE ERRORES
 // ===================================

 private manejarError(error: any, contexto: string): void {
   console.error(` Error en ${contexto}:`, error);
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

 private clasificarError(error: any): 'conexion' | 'validacion' | 'permisos' | 'critico' | 'general' {
   if (!navigator.onLine) return 'conexion';
   if (error?.status === 0 || error?.status === 504 || error?.status === 503) return 'conexion';
   if (error?.status === 400 || error?.status === 422) return 'validacion';
   if (error?.status === 401 || error?.status === 403) return 'permisos';
   if (error?.status === 500 || error?.message?.includes('crítico')) return 'critico';
   return 'general';
 }

 private manejarErrorConexion(error: any, contexto: string): void {
   this.hayProblemasConexion = true;
   this.estadoAutoguardado = 'offline';
   this.guardarLocalmenteFormulario();
   this.error = 'Problema de conexión detectado. Tus datos se guardan localmente.';
   this.iniciarReconexionAutomatica();
 }

 private manejarErrorValidacion(error: any, contexto: string): void {
   const mensaje = this.extraerMensajeValidacion(error);
   this.error = `Error de validación: ${mensaje}`;
 }

 private manejarErrorPermisos(error: any, contexto: string): void {
   this.guardarLocalmenteFormulario();
   let mensaje = 'No tienes permisos para realizar esta acción.';
   if (error?.status === 401) {
     mensaje = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
   }
   this.error = mensaje;
 }

 private manejarErrorCritico(error: any, contexto: string): void {
   this.guardarLocalmenteFormulario();
   this.errorCritico = `Error crítico en ${contexto}: ${error?.message || 'Error desconocido'}`;
 }

 private manejarErrorGeneral(error: any, contexto: string): void {
   this.error = `Error en ${contexto}. Tus datos están seguros.`;
 }

 private extraerMensajeValidacion(error: any): string {
   if (error?.error?.message) return error.error.message;
   if (error?.error?.errors) return error.error.errors.join(', ');
   if (error?.message) return error.message;
   return 'Datos inválidos';
 }

 // ===================================
 // MÉTODOS DE AUTOGUARDADO
 // ===================================

 private guardarLocalmenteFormulario(): void {
   try {
     const datosFormulario = {
       formularioActivo: this.formularioActivo,
       signosVitales: this.signosVitalesForm.value,
       historiaClinica: this.historiaClinicaForm.value,
   hojaFrontal: this.hojaFrontalForm?.value || {}, // ✅ AGREGADO
        notaUrgencias: this.notaUrgenciasForm.value,
        notaEvolucion: this.notaEvolucionForm.value,
        consentimiento: this.consentimientoForm.value,
        notaPreoperatoria: this.notaPreoperatoriaForm.value,
        notaPostoperatoria: this.notaPostoperatoriaForm.value,
        notaPreanestesica: this.notaPreanestesicaForm.value,
        notaPostanestesica: this.notaPostanestesicaForm.value,
        notaInterconsulta: this.notaInterconsultaForm.value,
        formularioEstado: this.formularioEstado,
        timestamp: Date.now(),
        pacienteId: this.pacienteId,
      };

      localStorage.setItem(
        `perfil_paciente_${this.pacienteId}`,
        JSON.stringify(datosFormulario)
      );
      this.ultimoGuardadoLocal = Date.now();

      console.log('Datos guardados localmente');
    } catch (error) {
      console.warn('No se pudo guardar localmente:', error);
    }
  }

  private recuperarDatosLocales(): boolean {
    try {
      const datosGuardados = localStorage.getItem(`perfil_paciente_${this.pacienteId}`);
      if (!datosGuardados) return false;

      const datos = JSON.parse(datosGuardados);
      const tiempoTranscurrido = Date.now() - datos.timestamp;

      if (tiempoTranscurrido > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(`perfil_paciente_${this.pacienteId}`);
        return false;
      }

      this.signosVitalesForm.patchValue(datos.signosVitales || {});
      this.historiaClinicaForm.patchValue(datos.historiaClinica || {});
      this.hojaFrontalForm?.patchValue(datos.hojaFrontal || {}); // ✅ AGREGADO
      this.notaUrgenciasForm.patchValue(datos.notaUrgencias || {});
      this.notaEvolucionForm.patchValue(datos.notaEvolucion || {});
      this.consentimientoForm.patchValue(datos.consentimiento || {});
      this.notaPreoperatoriaForm.patchValue(datos.notaPreoperatoria || {});
      this.notaPostoperatoriaForm.patchValue(datos.notaPostoperatoria || {});
      this.notaPreanestesicaForm.patchValue(datos.notaPreanestesica || {});
      this.notaPostanestesicaForm.patchValue(datos.notaPostanestesica || {});
      this.notaInterconsultaForm.patchValue(datos.notaInterconsulta || {});

      this.formularioEstado = datos.formularioEstado || this.formularioEstado;

      if (this.esFormularioValido(datos.formularioActivo)) {
        this.formularioActivo = datos.formularioActivo;
      }

      this.success = 'Datos recuperados desde tu última sesión';
      setTimeout(() => { this.success = null; }, 5000);

      return true;
    } catch (error) {
      console.warn('Error al recuperar datos locales:', error);
      return false;
    }
  }

  private iniciarAutoguardado(): void {
    this.autoguardadoInterval = setInterval(() => {
      if (this.hayFormularioCambiado()) {
        this.guardarLocalmenteFormulario();
        this.estadoAutoguardado = 'guardado';
        setTimeout(() => { this.estadoAutoguardado = null; }, 2000);
      }
    }, 30000);
  }

  private hayFormularioCambiado(): boolean {
    return [
      this.signosVitalesForm,
      this.historiaClinicaForm,
      this.hojaFrontalForm, // ✅ AGREGADO
      this.notaUrgenciasForm,
      this.notaEvolucionForm,
      this.consentimientoForm,
      this.notaPreoperatoriaForm,
      this.notaPostoperatoriaForm,
      this.notaPreanestesicaForm,
      this.notaPostanestesicaForm,
      this.notaInterconsultaForm,
      this.solicitudEstudioForm,
      this.referenciaForm,
      this.controlCrecimientoForm,
      this.esquemaVacunacionForm,
    ].some((form) => form?.dirty);
  }

  private iniciarReconexionAutomatica(): void {
    const intentarReconectar = () => {
      if (this.hayProblemasConexion && navigator.onLine) {
        this.verificarConexion();
      }
    };
    setInterval(intentarReconectar, 30000);
  }

  verificarConexion(): void {
    this.expedientesService
      .getExpedienteByPacienteId(this.pacienteId!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.hayProblemasConexion = false;
          this.estadoAutoguardado = 'guardado';
          this.success = 'Conexión restablecida ';
          setTimeout(() => { this.success = null; }, 3000);
        },
        error: () => {
          this.hayProblemasConexion = true;
          this.estadoAutoguardado = 'offline';
        },
      });
  }

  // ===================================
  // MÉTODOS AUXILIARES DE VALIDACIÓN
  // ===================================

  private esFormularioValido(formulario: string | null): formulario is FormularioActivo {
    if (formulario === null) return false;

    const formulariosValidos: FormularioActivo[] = [
      'signosVitales', 'historiaClinica', 'hojaFrontal', 'notaUrgencias', 'notaEvolucion',
      'consentimiento', 'notaPreoperatoria', 'notaPostoperatoria', 'notaPreanestesica',
      'notaPostanestesica', 'notaInterconsulta', 'controlCrecimiento', 'esquemaVacunacion'
    ];

    return formulariosValidos.includes(formulario as FormularioActivo);
  }

  // ===================================
  // MÉTODOS DE NAVEGACIÓN Y UTILIDADES
  // ===================================

  volverAListaPacientes(): void {
    this.router.navigate(['/app/personas/pacientes']);
  }

  refrescarDatos(): void {
    this.initializeComponent();
  }

  eliminarBorrador(): void {
    if (confirm('¿Está seguro de que desea eliminar el borrador guardado?')) {
      localStorage.removeItem(`perfil_paciente_${this.pacienteId}`);
      this.success = 'Borrador eliminado correctamente';

      // Resetear todos los formularios
      this.signosVitalesForm.reset();
      this.historiaClinicaForm.reset();
      this.hojaFrontalForm?.reset(); // ✅ AGREGADO
      this.notaUrgenciasForm.reset();
      this.notaEvolucionForm.reset();

      // Resetear estado
      this.formularioEstado = {
        signosVitales: false, historiaClinica: false, hojaFrontal: false, notaUrgencias: false,
        notaEvolucion: false, consentimiento: false, notaPreoperatoria: false, notaPostoperatoria: false,
        notaPreanestesica: false, notaPostanestesica: false, notaInterconsulta: false, controlCrecimiento: false,
        esquemaVacunacion: false, solicitudEstudio: false, referenciaTraslado: false, prescripcionMedicamento: false,
        registroTransfusion: false, notaEgreso: false, historiaClinicaPediatrica: false, desarrolloPsicomotriz: false,
        alimentacionPediatrica: false, tamizajeNeonatal: false, antecedentesHeredoFamiliares: false,
        antecedentesPerinatales: false, estadoNutricionalPediatrico: false, inmunizaciones: false,
        vacunasAdicionales: false, solicitudCultivo: false, solicitudGasometria: false, altaVoluntaria: false,
      };

      setTimeout(() => { this.success = null; }, 3000);
    }
  }

  resetearFormularioActual(): void {
    if (this.formularioActivo === null) {
      this.error = 'No hay un formulario activo para resetear.';
      return;
    }

    if (confirm(`¿Está seguro de que desea resetear ${this.getTituloFormulario(this.formularioActivo)}?`)) {
      switch (this.formularioActivo) {
        case 'signosVitales':
          this.signosVitalesForm.reset();
          break;
        case 'historiaClinica':
          this.historiaClinicaForm.reset();
          break;
        case 'hojaFrontal': // ✅ AGREGADO
          this.hojaFrontalForm.reset();
          break;
        case 'notaUrgencias':
          this.notaUrgenciasForm.reset();
          break;
        case 'notaEvolucion':
          this.notaEvolucionForm.reset();
          break;
        case 'consentimiento':
          this.consentimientoForm.reset();
          break;
        default:
          console.warn(`Formulario no reconocido: ${this.formularioActivo}`);
          return;
      }

      this.formularioEstado[this.formularioActivo] = false;
      this.success = `Formulario ${this.getTituloFormulario(this.formularioActivo)} reseteado`;
    }
  }

  // ===================================
  // GETTERS ADICIONALES
  // ===================================

  get progresoFormularios(): { completados: number; total: number; porcentaje: number; } {
    const total = 4;
    const completados = Object.values(this.formularioEstado).filter((estado) => estado).length;
    const porcentaje = Math.round((completados / total) * 100);
    return { completados, total, porcentaje };
  }

  get puedeFinalizarProceso(): boolean {
    return this.formularioEstado.signosVitales && this.formularioEstado.historiaClinica;
  }

  get puedeAvanzar(): boolean {
    if (this.formularioActivo === null) return false;
    const estadoFormulario = this.formularioEstado[this.formularioActivo];
    return estadoFormulario || this.formularioActualValido;
  }

  get mostrarErrores(): boolean {
    return !!this.error && !this.isLoading;
  }

  // ===================================
  // MÉTODOS DE GUÍAS CLÍNICAS
  // ===================================

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

  buscarGuiaClinica(event: Event): void {
    const target = event.target as HTMLInputElement;
    const termino = target?.value || '';
    this.filtroGuiaClinica = termino;

    if (!termino) {
      this.guiasClinicasFiltradas = [...this.guiasClinicas];
      return;
    }

    this.guiasClinicasFiltradas = this.guiasClinicas.filter(
      (guia) =>
        guia.nombre?.toLowerCase().includes(termino.toLowerCase()) ||
        guia.codigo?.toLowerCase().includes(termino.toLowerCase()) ||
        guia.area?.toLowerCase().includes(termino.toLowerCase())
    );
  }

  toggleDropdownGuias(): void {
    this.mostrarDropdownGuias = !this.mostrarDropdownGuias;
    if (this.mostrarDropdownGuias) {
      this.guiasClinicasFiltradas = [...this.guiasClinicas];
    }
  }

  isGuiaSeleccionada(guia: GuiaClinica): boolean {
    return this.guiasClinicasSeleccionadas.some(g => g.id_guia_diagnostico === guia.id_guia_diagnostico);
  }

  // ===================================
  // MÉTODOS AUXILIARES FINALES
  // ===================================

  debugPacienteCompleto(): void {
    console.log('  DEBUG pacienteCompleto completo:', this.pacienteCompleto);
    console.log('  DEBUG persona:', this.pacienteCompleto?.persona);
    console.log('  DEBUG paciente:', this.pacienteCompleto?.paciente);
    if (this.pacienteCompleto?.persona) {
      console.log('- Persona existe');
      console.log('📝 Nombre:', this.pacienteCompleto.persona.nombre);
      console.log('Apellido paterno:', this.pacienteCompleto.persona.apellido_paterno);
      console.log('Apellido materno:', this.pacienteCompleto.persona.apellido_materno);
    } else {
      console.log('❌ Persona no existe o es undefined');
    }
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

  intentarDeNuevo(): void {
    this.estadoAutoguardado = 'guardando';
    if (navigator.onLine) {
      this.verificarConexion();
    } else {
      this.error = 'Sin conexión a internet. Verifica tu red.';
      this.estadoAutoguardado = 'offline';
    }
  }

  ocultarError(): void {
    this.mostrarError = false;
    this.error = null;
  }

  recargarPagina(): void {
    this.guardarLocalmenteFormulario();
    window.location.reload();
  }

  cerrarErrorCritico(): void {
    this.errorCritico = null;
  }

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

    setTimeout(() => {
      if (confirm('¿Desea continuar editando o volver a la lista de pacientes?')) {
        this.success = null;
      } else {
        this.volverAListaPacientes();
      }
    }, 3000);
  }

  // ===================================
  // LISTENERS DE EVENTOS
  // ===================================

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target?.closest('.relative');
    if (!dropdown) {
      this.mostrarDropdownGuias = false;
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.tabActiva !== 'crear') return;

    if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '9') {
      event.preventDefault();
      const index = parseInt(event.key) - 1;
      const formularios = this.getFormulariosVisibles();
      if (formularios[index]) {
        this.cambiarFormulario(formularios[index].key);
      }
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.navegarFormulario(event.key === 'ArrowRight' ? 'siguiente' : 'anterior');
    }
  }

  navegarFormulario(direccion: 'anterior' | 'siguiente'): void {
    const formularios = this.getFormulariosVisibles();
    const actual = formularios.findIndex((f) => f.key === this.formularioActivo);
    if (actual === -1) return;

    let nuevo = direccion === 'siguiente' ? actual + 1 : actual - 1;
    if (nuevo >= formularios.length) nuevo = 0;
    if (nuevo < 0) nuevo = formularios.length - 1;

    this.cambiarFormulario(formularios[nuevo].key);
  }



  // ===================================/////////////////////////////////////////////////////////////////////////////////////////
// MÉTODOS AUXILIARES PARA EL HTML
// ===================================////////////////////////////////////////////////////////////////////////////////////

    filtrarPorCategoria(categoria: FiltroCategoria): void {
    this.filtroActivo = categoria;
    switch (categoria) {
      case 'frecuentes':
        this.formulariosVisibles = Object.keys(this.configFormularios).filter(
          (key) => this.configFormularios[key].frecuente
        );
        break;
      case 'obligatorios':
        this.formulariosVisibles = Object.keys(this.configFormularios).filter(
          (key) => this.configFormularios[key].obligatorio
        );
        break;
      case 'pediatricos':
        this.formulariosVisibles = Object.keys(this.configFormularios).filter(
          (key) => this.esFormularioPediatrico(key)
        );
        break;
      default:
        this.formulariosVisibles = Object.keys(this.configFormularios);
    }
  }


    toggleMostrarTodos(): void {
      this.mostrarTodosFormularios = !this.mostrarTodosFormularios;
    }

    getGruposVisibles(): any[] {
      // Retornar grupos básicos
      return [
        { key: 'principales', data: { nombre: 'Documentos Principales', icono: 'fas fa-star', color: 'blue', formularios: ['signosVitales', 'historiaClinica', 'hojaFrontal'] } },
        { key: 'clinicos', data: { nombre: 'Documentos Clínicos', icono: 'fas fa-file-medical', color: 'green', formularios: ['notaUrgencias', 'notaEvolucion'] } },
        { key: 'solicitudes',data: {nombre: 'Solicitudes de Estudios',icono: 'fas fa-microscope',color: 'green',formularios: ['solicitudEstudio', 'solicitudCultivo', 'solicitudGasometria']}},
        { key: 'prescripciones', data: {nombre: 'Prescripciones y Medicamentos',icono: 'fas fa-pills', color: 'purple',formularios: ['prescripcionMedicamento', 'registroTransfusion']}}


      ];
    }

    getFormulariosVisiblesEnGrupo(formularios: string[]): any[] {
  if (!formularios || !Array.isArray(formularios)) {
    return [];
  }

  return formularios
    .filter(key => this.configFormularios[key]) // Solo formularios que existen
    .map(key => ({
      key: key,  // ✅ ASEGURAR QUE EXISTE LA PROPIEDAD KEY
      ...this.configFormularios[key]
    }));
}

    esFormularioPediatrico(formulario: string): boolean {
      const pediatricos = ['controlCrecimiento', 'esquemaVacunacion'];
      return pediatricos.includes(formulario);
    }

    refrescarVistaGeneral(): void {
      this.cargarResumenGeneral();
    }

    getEstadoSaludGeneral(): {nivel: string, mensaje: string} {
      return { nivel: 'normal', mensaje: 'Estado estable' };
    }

    obtenerNumeroExpedientePreferido(): string {
      return this.pacienteCompleto?.expediente?.numero_expediente_administrativo ||
            this.pacienteCompleto?.expediente?.numero_expediente ||
            'Sin número';
    }

    abrirModalEditarExpediente(): void {
      this.mostrarModalEditarExpediente = true;
      this.numeroAdministrativoTemporal = this.pacienteCompleto?.expediente?.numero_expediente_administrativo || '';
    }

    esPacienteAdulto(): boolean {
      return !this.esPacientePediatrico;
    }

    toggleDropdownCamas(): void {
      this.mostrarDropdownCamas = !this.mostrarDropdownCamas;
    }

    limpiarCama(): void {
      this.camaSeleccionada = null;
      this.filtroCama = '';
    }

    seleccionarCama(cama: any): void {
      this.camaSeleccionada = cama;
      this.filtroCama = cama.numero;
      this.mostrarDropdownCamas = false;
    }

    esMujerAdolescente(): boolean {
      const sexo = this.personaInfo?.sexo;
      const edad = this.calcularEdad();
      return sexo === 'F' && edad >= 12;
    }

    onGuiaClinicaInputChange(valor: string): void {
      this.buscarGuiaClinica({ target: { value: valor } } as any);
    }

    limpiarFormulario(formulario: string): void {
      this.resetearFormularioActual();
    }

    guardarBorrador(): void {
      this.guardarLocalmenteFormulario();
      this.success = 'Borrador guardado localmente';
    }

    cancelarEditarExpediente(): void {
      this.mostrarModalEditarExpediente = false;
      this.numeroAdministrativoTemporal = '';
    }

    guardarNumeroAdministrativo(): void {
      this.mostrarModalEditarExpediente = false;
      this.success = 'Número administrativo actualizado';
    }

}
