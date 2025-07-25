import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
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
import { Expediente, UpdateExpedienteDto } from '../../models/expediente.model';
import { DocumentoClinico } from '../../models/documento-clinico.model';
import {
  SignosVitales,
  CreateSignosVitalesDto,
} from '../../models/signos-vitales.model';
import { CreateHistoriaClinicaDto } from '../../models/historia-clinica.model';
import { CreateNotaUrgenciasDto } from '../../models/nota-urgencias.model';
import {
  CAMPOS_OBLIGATORIOS_NOM004,
  CreateNotaEvolucionDto,
} from '../../models/nota-evolucion.model';
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

// AGREGAR ESTAS IMPORTACIONES A perfil-paciente.ts
import {
  SolicitudEstudio,
  CreateSolicitudEstudioDto,
} from '../../models/solicitud-estudio.model';
import {
  ReferenciaTraslado,
  CreateReferenciaTraladoDto,
} from '../../models/referencia-traslado.model';
import {
  PrescripcionMedicamento,
  CreatePrescripcionMedicamentoDto,
} from '../../models/prescripcion-medicamento.model';
import {
  ControlCrecimiento,
  CreateControlCrecimientoDto,
} from '../../models/control-crecimiento.model';
import {
  EsquemaVacunacion,
  RegistroVacuna,
  CreateEsquemaVacunacionDto,
} from '../../models/esquema-vacunacion.model';
import { HojaFrontal } from '../../models/hoja-frontal.model';
import { AltaVoluntaria } from '../../models/alta-voluntaria.model';
import { SolicitudCultivo } from '../../models/solicitud-cultivo.model';
import { SolicitudGasometria } from '../../models/solicitud-gasometria.model';

// ... otras importaciones ...
import { AntecedentesHeredoFamiliaresService } from '../../services/documentos-clinicos/antecedentes-heredo-familiares';
import { AntecedentesPerinatalesService } from '../../services/documentos-clinicos/antecedentes-perinatales';
import { DesarrolloPsicomotrizService } from '../../services/documentos-clinicos/desarrollo-psicomotriz';
import { EstadoNutricionalPediatricoService } from '../../services/documentos-clinicos/estado-nutricional-pediatrico';
import { InmunizacionesService } from '../../services/documentos-clinicos/inmunizaciones';
import { VacunasAdicionalesService } from '../../services/documentos-clinicos/vacunas-adicionales';
// ... otras importaciones ...

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
    [key: string]: any;
  };
  paciente: Paciente & {
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
  | 'signosVitales'
  | 'historiaClinica'
  | 'notaUrgencias'
  | 'notaEvolucion'
  | 'consentimiento'
  | 'notaPreoperatoria'
  | 'notaPostoperatoria'
  | 'notaPreanestesica'
  | 'notaPostanestesica'
  | 'notaInterconsulta'
  | 'controlCrecimiento'
  | 'esquemaVacunacion'
  | 'historiaClinicaPediatrica'
  | 'desarrolloPsicomotriz'
  | 'alimentacionPediatrica'
  | 'tamizajeNeonatal'
  | 'antecedentesHeredoFamiliares'
  | 'antecedentesPerinatales'
  | 'estadoNutricionalPediatrico'
  | 'inmunizaciones'
  | 'vacunasAdicionales'
  | 'solicitudEstudio'
  | 'referenciaTraslado'
  | 'prescripcionMedicamento'
  | 'registroTransfusion'
  | 'notaEgreso'
  | 'hojaFrontal'
  | 'solicitudCultivo'
  | 'solicitudGasometria'
  | 'altaVoluntaria'
  | null;

@Component({
  selector: 'app-perfil-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './perfil-paciente.html',
  styleUrl: './perfil-paciente.css',
})
export class PerfilPaciente implements OnInit, OnDestroy {
  // ViewChild para el contenedor de navegación
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

  // NUEVOS FORMULARIOS AGREGADOS
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

  tabActiva: TabActiva = 'general';
  formularioActivo: FormularioActivo = 'signosVitales';

  // Propiedades para navegación mejorada
  grupoExpandido: string | null = 'basicos';
  mostrarTodosFormularios = false;
  busquedaFormulario = '';
  filtroActivo: 'todos' | 'frecuentes' | 'obligatorios' | 'pediatricos' =
    'todos';
  formulariosVisibles: string[] = [];

  // Configuración de grupos de formularios
  gruposFormularios = {
    basicos: {
      nombre: 'Documentos Básicos',
      icono: 'fas fa-file-medical',
      color: 'blue',
      formularios: [
        'signosVitales',
        'historiaClinica',
        'notaUrgencias',
        'notaEvolucion',
      ],
    },
    quirurgicos: {
      nombre: 'Documentos Quirúrgicos',
      icono: 'fas fa-procedures',
      color: 'orange',
      formularios: [
        'notaPreoperatoria',
        'notaPreanestesica',
        'notaPostoperatoria',
        'notaPostanestesica',
      ],
    },
    solicitudes: {
      nombre: 'Solicitudes de Estudios',
      icono: 'fas fa-vial',
      color: 'green',
      formularios: [
        'solicitudEstudio',
        'solicitudCultivo',
        'solicitudGasometria',
      ],
    },
    pediatricos: {
      nombre: 'Documentos Pediátricos',
      icono: 'fas fa-baby',
      color: 'pink',
      formularios: [
        'historiaClinicaPediatrica',
        'controlCrecimiento',
        'esquemaVacunacion',
        'desarrolloPsicomotriz',
        'antecedentesHeredoFamiliares',
        'antecedentesPerinatales',
        'estadoNutricionalPediatrico',
        'inmunizaciones',
        'vacunasAdicionales',
        'alimentacionPediatrica',
        'tamizajeNeonatal',
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
      formularios: [
        'hojaFrontal',
        'altaVoluntaria',
        'consentimiento',
        'referenciaTraslado',
      ],
    },
  };

  // Configuración de formularios con metadata
  configFormularios: { [key: string]: any } = {
    signosVitales: {
      nombre: 'Signos Vitales',
      icono: 'fas fa-heartbeat',
      obligatorio: true,
      frecuente: true,
      completado: false,
    },
    historiaClinica: {
      nombre: 'Historia Clínica',
      icono: 'fas fa-file-medical-alt',
      obligatorio: true,
      frecuente: true,
      completado: false,
    },
    notaUrgencias: {
      nombre: 'Nota Urgencias',
      icono: 'fas fa-ambulance',
      obligatorio: true,
      frecuente: true,
      completado: false,
    },
    notaEvolucion: {
      nombre: 'Evolución',
      icono: 'fas fa-chart-line',
      obligatorio: false,
      frecuente: true,
      completado: false,
    },
    notaPreoperatoria: {
      nombre: 'Preoperatoria',
      icono: 'fas fa-user-md',
      obligatorio: false,
      frecuente: false,
      completado: false,
    },
    notaPreanestesica: {
      nombre: 'Preanestésica',
      icono: 'fas fa-syringe',
      obligatorio: false,
      frecuente: false,
      completado: false,
    },
    notaPostoperatoria: {
      nombre: 'Postoperatoria',
      icono: 'fas fa-bed',
      obligatorio: false,
      frecuente: false,
      completado: false,
    },
    notaPostanestesica: {
      nombre: 'Postanestésica',
      icono: 'fas fa-clock',
      obligatorio: false,
      frecuente: false,
      completado: false,
    },
    consentimiento: {
      nombre: 'Consentimiento',
      icono: 'fas fa-signature',
      obligatorio: true,
      frecuente: false,
      completado: false,
    },
    solicitudEstudio: {
      nombre: 'Solicitud Estudio',
      icono: 'fas fa-microscope',
      obligatorio: false,
      frecuente: true,
      completado: false,
    },
    solicitudCultivo: {
      nombre: 'Solicitud Cultivo',
      icono: 'fas fa-flask',
      obligatorio: false,
      frecuente: false,
      completado: false,
    },
    solicitudGasometria: {
      nombre: 'Gasometría',
      icono: 'fas fa-lungs',
      obligatorio: false,
      frecuente: false,
      completado: false,
    },
    controlCrecimiento: {
      nombre: 'Control Crecimiento',
      icono: 'fas fa-child',
      obligatorio: false,
      frecuente: false,
      completado: false,
    },
    esquemaVacunacion: {
      nombre: 'Vacunas',
      icono: 'fas fa-shield-alt',
      obligatorio: false,
      frecuente: false,
      completado: false,
    },
    desarrolloPsicomotriz: {
      nombre: 'Desarrollo',
      icono: 'fas fa-brain',
      obligatorio: false,
      frecuente: false,
      completado: false,
    },
    prescripcionMedicamento: {
      nombre: 'Prescripción',
      icono: 'fas fa-prescription-bottle-alt',
      obligatorio: false,
      frecuente: true,
      completado: false,
    },
    registroTransfusion: {
      nombre: 'Transfusión',
      icono: 'fas fa-tint',
      obligatorio: false,
      frecuente: false,
      completado: false,
    },
    hojaFrontal: {
      nombre: 'Hoja Frontal',
      icono: 'fas fa-file-alt',
      obligatorio: true,
      frecuente: false,
      completado: false,
    },
    altaVoluntaria: {
      nombre: 'Alta Voluntaria',
      icono: 'fas fa-door-open',
      obligatorio: false,
      frecuente: false,
      completado: false,
    },
    referenciaTraslado: {
      nombre: 'Referencia',
      icono: 'fas fa-share',
      obligatorio: false,
      frecuente: false,
      completado: false,
    },
    // DOCUMENTOS PEDIÁTRICOS
    historiaClinicaPediatrica: {
      nombre: 'Historia Clínica Pediátrica',
      icono: 'fas fa-baby-carriage',
      obligatorio: true,
      frecuente: true,
      completado: false,
    },
    antecedentesHeredoFamiliares: {
      nombre: 'Antecedentes Heredo-Familiares',
      icono: 'fas fa-dna',
      obligatorio: true,
      frecuente: true,
      completado: false,
    },
    antecedentesPerinatales: {
      nombre: 'Antecedentes Perinatales',
      icono: 'fas fa-baby',
      obligatorio: true,
      frecuente: true,
      completado: false,
    },
    estadoNutricionalPediatrico: {
      nombre: 'Estado Nutricional',
      icono: 'fas fa-weight',
      obligatorio: false,
      frecuente: true,
      completado: false,
    },
    inmunizaciones: {
      nombre: 'Inmunizaciones',
      icono: 'fas fa-syringe',
      obligatorio: true,
      frecuente: true,
      completado: false,
    },
    vacunasAdicionales: {
      nombre: 'Vacunas Adicionales',
      icono: 'fas fa-plus-square',
      obligatorio: false,
      frecuente: false,
      completado: false,
    },
    alimentacionPediatrica: {
      nombre: 'Alimentación Pediátrica',
      icono: 'fas fa-utensils',
      obligatorio: false,
      frecuente: true,
      completado: false,
    },
    tamizajeNeonatal: {
      nombre: 'Tamizaje Neonatal',
      icono: 'fas fa-microscope',
      obligatorio: false,
      frecuente: false,
      completado: false,
    },
  };

  formularioEstado: FormularioEstado = {
    signosVitales: false,
    historiaClinica: false,
    notaUrgencias: false,
    notaEvolucion: false,
    consentimiento: false,
    notaPreoperatoria: false,
    notaPostoperatoria: false,
    notaPreanestesica: false,
    notaPostanestesica: false,
    notaInterconsulta: false,
    controlCrecimiento: false,
    esquemaVacunacion: false,
    solicitudEstudio: false,
    referenciaTraslado: false,
    prescripcionMedicamento: false,
    registroTransfusion: false,
    notaEgreso: false,
    historiaClinicaPediatrica: false,
    desarrolloPsicomotriz: false,
    alimentacionPediatrica: false,
    tamizajeNeonatal: false,
    antecedentesHeredoFamiliares: false,
    antecedentesPerinatales: false,
    estadoNutricionalPediatrico: false,
    inmunizaciones: false,
    vacunasAdicionales: false,
    solicitudCultivo: false,
    solicitudGasometria: false,
    hojaFrontal: false,
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
    private vacunasAdicionalesService: VacunasAdicionalesService
  ) {
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
    this.inicializarFormularios();
  }

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
      id: 'notaUrgencias',
      nombre: 'Nota de Urgencias',
      descripcion: 'Nota inicial de atención en urgencias',
      icono: 'fas fa-ambulance',
      color: 'red',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 3,
    },
    {
      id: 'notaEvolucion',
      nombre: 'Nota de Evolución',
      descripcion: 'Seguimiento de la evolución del paciente',
      icono: 'fas fa-chart-line',
      color: 'green',
      requiereInternamiento: true,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 4,
    },
    {
      id: 'notaPreoperatoria',
      nombre: 'Nota Preoperatoria',
      descripcion: 'Evaluación previa a cirugía',
      icono: 'fas fa-procedures',
      color: 'purple',
      requiereInternamiento: true,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: true,
      orden: 5,
    },
    {
      id: 'notaPreanestesica',
      nombre: 'Nota Preanestésica',
      descripcion: 'Evaluación anestésica preoperatoria',
      icono: 'fas fa-syringe',
      color: 'indigo',
      requiereInternamiento: true,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: true,
      orden: 6,
    },
    {
      id: 'notaPostoperatoria',
      nombre: 'Nota Postoperatoria',
      descripcion: 'Seguimiento posterior a cirugía',
      icono: 'fas fa-band-aid',
      color: 'teal',
      requiereInternamiento: true,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: true,
      orden: 7,
    },
    {
      id: 'notaPostanestesica',
      nombre: 'Nota Postanestésica',
      descripcion: 'Recuperación post-anestésica',
      icono: 'fas fa-bed',
      color: 'cyan',
      requiereInternamiento: true,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: true,
      orden: 8,
    },
    {
      id: 'controlCrecimiento',
      nombre: 'Control de Crecimiento',
      descripcion: 'Seguimiento del desarrollo pediátrico',
      icono: 'fas fa-baby',
      color: 'pink',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: true,
      requiereQuirurgico: false,
      orden: 9,
    },
    {
      id: 'esquemaVacunacion',
      nombre: 'Esquema de Vacunación',
      descripcion: 'Registro de vacunas aplicadas',
      icono: 'fas fa-shield-virus',
      color: 'yellow',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: true,
      requiereQuirurgico: false,
      orden: 10,
    },
    {
      id: 'consentimiento',
      nombre: 'Consentimiento Informado',
      descripcion: 'Autorización para procedimientos',
      icono: 'fas fa-signature',
      color: 'orange',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 11,
    },
    {
      id: 'solicitudEstudio',
      nombre: 'Solicitud de Estudio',
      descripcion: 'Solicitud de laboratorio o imagen',
      icono: 'fas fa-vial',
      color: 'gray',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 12,
    },
    {
      id: 'notaInterconsulta',
      nombre: 'Nota de Interconsulta',
      descripcion: 'Referencia a especialista',
      icono: 'fas fa-user-md',
      color: 'blue',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 13,
    },
    {
      id: 'referenciaTraslado',
      nombre: 'Referencia y Traslado',
      descripcion: 'Traslado a otra unidad médica',
      icono: 'fas fa-ambulance',
      color: 'red',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 14,
    },
    {
      id: 'notaEgreso',
      nombre: 'Nota de Egreso',
      descripcion: 'Resumen final del tratamiento',
      icono: 'fas fa-sign-out-alt',
      color: 'green',
      requiereInternamiento: true,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 15,
    },
    {
      id: 'consentimientoProcedimientos',
      nombre: 'Consentimiento Procedimientos',
      descripcion: 'Autorización para procedimientos específicos',
      icono: 'fas fa-hand-paper',
      color: 'orange',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 16,
    },
    {
      id: 'consentimientoHospitalizacion',
      nombre: 'Consentimiento Hospitalización',
      descripcion: 'Autorización para internamiento',
      icono: 'fas fa-hospital',
      color: 'blue',
      requiereInternamiento: true,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 17,
    },
    {
      id: 'consentimientoTransfusion',
      nombre: 'Consentimiento Transfusión',
      descripcion: 'Autorización para transfusión sanguínea',
      icono: 'fas fa-tint',
      color: 'red',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 18,
    },
    {
      id: 'hojaAltaVoluntaria',
      nombre: 'Hoja Alta Voluntaria',
      descripcion: 'Documento de alta por decisión del paciente',
      icono: 'fas fa-file-signature',
      color: 'yellow',
      requiereInternamiento: true,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 19,
    },
    {
      id: 'hojaFrontalExpediente',
      nombre: 'Hoja Frontal Expediente',
      descripcion: 'Portada del expediente clínico',
      icono: 'fas fa-folder',
      color: 'gray',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 20,
    },
    {
      id: 'solicitudLaboratorio',
      nombre: 'Solicitud Laboratorio',
      descripcion: 'Solicitud de estudios de laboratorio',
      icono: 'fas fa-flask',
      color: 'blue',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 21,
    },
    {
      id: 'solicitudImagenologia',
      nombre: 'Solicitud Imagenología',
      descripcion: 'Solicitud de estudios de imagen',
      icono: 'fas fa-x-ray',
      color: 'purple',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 22,
    },
    {
      id: 'solicitudCultivo',
      nombre: 'Solicitud Cultivo',
      descripcion: 'Solicitud de cultivos microbiológicos',
      icono: 'fas fa-bacteria',
      color: 'green',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 23,
    },
    {
      id: 'prescripcionMedicamentos',
      nombre: 'Prescripción Medicamentos',
      descripcion: 'Receta médica de medicamentos',
      icono: 'fas fa-pills',
      color: 'indigo',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 24,
    },
    {
      id: 'solicitudGasometria',
      nombre: 'Solicitud Gasometría',
      descripcion: 'Solicitud de gasometría arterial',
      icono: 'fas fa-lungs',
      color: 'teal',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: false,
      requiereQuirurgico: false,
      orden: 25,
    },

    // Documentos pediátricos
    {
      id: 'controlCrecimiento',
      nombre: 'Control de Crecimiento',
      descripcion: 'Seguimiento del desarrollo pediátrico',
      icono: 'fas fa-chart-area',
      color: 'cyan',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: true,
      requiereQuirurgico: false,
      orden: 50,
    },
    {
      id: 'esquemaVacunacion',
      nombre: 'Esquema de Vacunación',
      descripcion: 'Registro de vacunas aplicadas',
      icono: 'fas fa-shield-alt',
      color: 'emerald',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: true,
      requiereQuirurgico: false,
      orden: 51,
    },
    {
      id: 'historiaClinicaPediatrica',
      nombre: 'Historia Clínica Pediátrica',
      descripcion: 'Historia clínica específica para pacientes pediátricos',
      icono: 'fas fa-baby',
      color: 'purple',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: true,
      requiereQuirurgico: false,
      orden: 52,
    },
    {
      id: 'desarrolloPsicomotriz',
      nombre: 'Desarrollo Psicomotriz',
      descripcion: 'Evaluación del desarrollo psicomotor',
      icono: 'fas fa-child',
      color: 'indigo',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: true,
      requiereQuirurgico: false,
      orden: 53,
    },
    {
      id: 'alimentacionPediatrica',
      nombre: 'Alimentación Pediátrica',
      descripcion: 'Evaluación nutricional pediátrica',
      icono: 'fas fa-utensils',
      color: 'green',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: true,
      requiereQuirurgico: false,
      orden: 54,
    },
    {
      id: 'tamizajeNeonatal',
      nombre: 'Tamizaje Neonatal',
      descripcion: 'Pruebas de detección neonatal',
      icono: 'fas fa-microscope',
      color: 'yellow',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: true,
      requiereQuirurgico: false,
      orden: 55,
    },

    // DOCUMENTOS PEDIÁTRICOS

    {
      id: 'antecedentesHeredoFamiliares',
      nombre: 'Antecedentes Heredo-Familiares',
      descripcion: 'Antecedentes familiares detallados',
      icono: 'fas fa-dna',
      color: 'purple',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: true,
      requiereQuirurgico: false,
      orden: 53,
    },
    {
      id: 'antecedentesPerinatales',
      nombre: 'Antecedentes Perinatales',
      descripcion: 'Antecedentes del embarazo y parto',
      icono: 'fas fa-baby',
      color: 'pink',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: true,
      requiereQuirurgico: false,
      orden: 54,
    },
    {
      id: 'desarrolloPsicomotriz',
      nombre: 'Desarrollo Psicomotriz',
      descripcion: 'Evaluación del desarrollo psicomotor',
      icono: 'fas fa-brain',
      color: 'indigo',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: true,
      requiereQuirurgico: false,
      orden: 55,
    },
    {
      id: 'estadoNutricionalPediatrico',
      nombre: 'Estado Nutricional Pediátrico',
      descripcion: 'Evaluación nutricional especializada',
      icono: 'fas fa-weight',
      color: 'emerald',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: true,
      requiereQuirurgico: false,
      orden: 56,
    },
    {
      id: 'inmunizaciones',
      nombre: 'Inmunizaciones',
      descripcion: 'Control del esquema de vacunación',
      icono: 'fas fa-syringe',
      color: 'blue',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: true,
      requiereQuirurgico: false,
      orden: 57,
    },
    {
      id: 'vacunasAdicionales',
      nombre: 'Vacunas Adicionales',
      descripcion: 'Vacunas fuera del esquema básico',
      icono: 'fas fa-plus-square',
      color: 'teal',
      requiereInternamiento: false,
      soloAdultos: false,
      soloPediatrico: true,
      requiereQuirurgico: false,
      orden: 58,
    },
    // {
    //   id: 'alimentacionPediatrica',
    //   nombre: 'Alimentación Pediátrica',
    //   descripcion: 'Evaluación nutricional y alimentaria',
    //   icono: 'fas fa-utensils',
    //   color: 'green',
    //   requiereInternamiento: false,
    //   soloAdultos: false,
    //   soloPediatrico: true,
    //   requiereQuirurgico: false,
    //   orden: 59,
    // },
    // {
    //   id: 'tamizajeNeonatal',
    //   nombre: 'Tamizaje Neonatal',
    //   descripcion: 'Pruebas de detección neonatal',
    //   icono: 'fas fa-microscope',
    //   color: 'yellow',
    //   requiereInternamiento: false,
    //   soloAdultos: false,
    //   soloPediatrico: true,
    //   requiereQuirurgico: false,
    //   orden: 60,
    // }
  ];

  // Métodos para manejar documentos existentes
  getDocumentosExistentesArray(): any[] {
    if (!this.documentosExistentes) return [];
    return Object.keys(this.documentosExistentes).map((key) => ({
      ...this.documentosExistentes[key],
      tipoDocumento: key,
    }));
  }

  abrirModalEditarExpediente(): void {
    this.numeroAdministrativoTemporal =
      this.pacienteCompleto?.expediente?.numero_expediente_administrativo || '';
    this.mostrarModalEditarExpediente = true;
  }

  cancelarEditarExpediente(): void {
    this.mostrarModalEditarExpediente = false;
    this.numeroAdministrativoTemporal = '';
  }

  async guardarNumeroAdministrativo(): Promise<void> {
    try {
      await this.actualizarNumeroAdministrativo(
        this.numeroAdministrativoTemporal
      );
      this.mostrarModalEditarExpediente = false;
      this.numeroAdministrativoTemporal = '';
    } catch (error) {
      // El error ya se maneja en actualizarNumeroAdministrativo
    }
  }

  getTituloDocumento(documento: any): string {
    const titulos: { [key: string]: string } = {
      historiaClinica: this.esPacientePediatrico
        ? 'Historia Clínica Pediátrica'
        : 'Historia Clínica',
      signosVitales: 'Signos Vitales',
      notaUrgencias: 'Nota de Urgencias',
      notaEvolucion: 'Nota de Evolución',
      consentimiento: 'Consentimiento Informado',
      notaInterconsulta: 'Nota de Interconsulta',
      notaPreoperatoria: 'Nota Preoperatoria',
      notaPostoperatoria: 'Nota Postoperatoria',
      notaPreanestesica: 'Nota Preanestésica',
      notaPostanestesica: 'Nota Postanestésica',
      solicitudEstudio: 'Solicitud de Estudio',
      referenciaTraslado: 'Referencia y Traslado',
      controlCrecimiento: 'Control de Crecimiento',
      esquemaVacunacion: 'Esquema de Vacunación',
      hojaFrontal: 'Hoja Frontal',
      altaVoluntaria: 'Alta Voluntaria',
      solicitudCultivo: 'Solicitud de Cultivo',
      solicitudGasometria: 'Solicitud de Gasometría',
      // Nuevos documentos
      notaEgreso: 'Nota de Egreso',
      consentimientoProcedimientos: 'Consentimiento Procedimientos',
      consentimientoHospitalizacion: 'Consentimiento Hospitalización',
      consentimientoTransfusion: 'Consentimiento Transfusión',
      hojaAltaVoluntaria: 'Hoja Alta Voluntaria',
      hojaFrontalExpediente: 'Hoja Frontal Expediente',
      solicitudLaboratorio: 'Solicitud Laboratorio',
      solicitudImagenologia: 'Solicitud Imagenología',
      prescripcionMedicamentos: 'Prescripción Medicamentos',
    };

    return (
      titulos[documento.tipoDocumento] ||
      documento.nombre_tipo_documento ||
      documento.tipo_documento?.nombre ||
      'Documento Clínico'
    );
  }

  getColorClaseDocumento(documento: any): string {
    const colores: { [key: string]: string } = {
      historiaClinica: 'bg-blue-50 text-blue-600',
      signosVitales: 'bg-red-50 text-red-600',
      notaUrgencias: 'bg-red-50 text-red-600',
      notaEvolucion: 'bg-green-50 text-green-600',
      consentimiento: 'bg-orange-50 text-orange-600',
      notaInterconsulta: 'bg-purple-50 text-purple-600',
      solicitudEstudio: 'bg-gray-50 text-gray-600',
      referenciaTraslado: 'bg-amber-50 text-amber-600',
      controlCrecimiento: 'bg-pink-50 text-pink-600',
      esquemaVacunacion: 'bg-emerald-50 text-emerald-600',
      // Nuevos documentos
      notaEgreso: 'bg-green-50 text-green-600',
      consentimientoProcedimientos: 'bg-orange-50 text-orange-600',
      consentimientoHospitalizacion: 'bg-blue-50 text-blue-600',
      consentimientoTransfusion: 'bg-red-50 text-red-600',
      hojaAltaVoluntaria: 'bg-yellow-50 text-yellow-600',
      hojaFrontalExpediente: 'bg-gray-50 text-gray-600',
      solicitudLaboratorio: 'bg-blue-50 text-blue-600',
      solicitudImagenologia: 'bg-purple-50 text-purple-600',
      solicitudCultivo: 'bg-green-50 text-green-600',
      prescripcionMedicamentos: 'bg-indigo-50 text-indigo-600',
      solicitudGasometria: 'bg-teal-50 text-teal-600',
    };

    return colores[documento.tipoDocumento] || 'bg-gray-50 text-gray-600';
  }

  getIconoDocumento(documento: any): string {
    const iconos: { [key: string]: string } = {
      historiaClinica: 'fas fa-file-medical-alt',
      signosVitales: 'fas fa-heartbeat',
      notaUrgencias: 'fas fa-ambulance',
      notaEvolucion: 'fas fa-chart-line',
      consentimiento: 'fas fa-file-signature',
      notaInterconsulta: 'fas fa-user-md',
      notaPreoperatoria: 'fas fa-procedures',
      notaPostoperatoria: 'fas fa-band-aid',
      notaPreanestesica: 'fas fa-syringe',
      notaPostanestesica: 'fas fa-bed',
      solicitudEstudio: 'fas fa-vial',
      referenciaTraslado: 'fas fa-ambulance',
      controlCrecimiento: 'fas fa-baby',
      esquemaVacunacion: 'fas fa-shield-virus',
      hojaFrontal: 'fas fa-file-alt',
      altaVoluntaria: 'fas fa-sign-out-alt',
      solicitudCultivo: 'fas fa-microscope',
      solicitudGasometria: 'fas fa-lungs',
    };

    return iconos[documento.tipoDocumento] || 'fas fa-file-alt';
  }

  getClaseEstadoDocumento(estado: string): string {
    const clases: { [key: string]: string } = {
      Activo: 'bg-green-100 text-green-800',
      ACTIVO: 'bg-green-100 text-green-800',
      Inactivo: 'bg-gray-100 text-gray-800',
      INACTIVO: 'bg-gray-100 text-gray-800',
      Pendiente: 'bg-yellow-100 text-yellow-800',
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      Borrador: 'bg-blue-100 text-blue-800',
      BORRADOR: 'bg-blue-100 text-blue-800',
    };

    return clases[estado] || 'bg-gray-100 text-gray-800';
  }

  // Métodos para acciones de documentos
  verDocumento(documento: any): void {
    console.log('Ver documento:', documento);
    // Aquí puedes implementar la lógica para ver el documento
    // Por ejemplo, abrir un modal con los detalles
  }

  generarPDFDocumento(documento: any): void {
    const titulo = this.getTituloDocumento(documento);
    this.generarPDF(titulo);
  }

  private cargarDatosEnFormulario(documento: any): void {
    switch (documento.tipoDocumento) {
      case 'historiaClinica':
        if (this.historiaClinicaForm) {
          this.historiaClinicaForm.patchValue(documento);
        }
        break;
      case 'signosVitales':
        if (this.signosVitalesForm) {
          this.signosVitalesForm.patchValue(documento);
        }
        break;
      case 'notaUrgencias':
        if (this.notaUrgenciasForm) {
          this.notaUrgenciasForm.patchValue(documento);
        }
        break;
      case 'notaEvolucion':
        if (this.notaEvolucionForm) {
          this.notaEvolucionForm.patchValue(documento);
        }
        break;
      // Agregar más casos según necesites
      default:
        console.warn(
          'Tipo de documento no soportado para edición:',
          documento.tipoDocumento
        );
    }
  }

  // Hacer público el getter de documentosDisponibles
  get documentosDisponiblesPublicos(): TipoDocumentoConfig[] {
    return this.documentosDisponibles;
  }

  //   get documentosDisponiblesPublicos(): TipoDocumentoConfig[] {
  //   return this.documentosDisponibles;
  // }

  getEstadoDocumento(
    tipoDoc: string
  ): 'crear' | 'editar' | 'pdf' | 'no_disponible' {
    const documentoExiste = this.documentosExistentes[tipoDoc];
    if (documentoExiste) {
      if (this.documentoTieneDatosCompletos(tipoDoc)) {
        return 'pdf';
      } else {
        return 'editar';
      }
    }
    if (this.formularioActivo !== null && this.puedeCrearDocumento(tipoDoc)) {
      return 'crear';
    }
    return 'no_disponible';
  }

  private documentoTieneDatosCompletos(tipoDoc: string): boolean {
    const documento = this.documentosExistentes[tipoDoc];
    if (!documento) return false;

    switch (tipoDoc) {
      case 'consentimiento':
        return !!(
          documento.procedimiento &&
          documento.riesgos &&
          documento.acepta_procedimiento
        );

      case 'historiaClinica':
        return !!(
          documento.motivo_consulta &&
          documento.diagnosticos &&
          documento.plan_diagnostico_terapeutico
        );

      case 'notaPreoperatoria':
        return !!(
          documento.diagnostico_preoperatorio &&
          documento.cirugia_programada &&
          documento.riesgo_quirurgico
        );

      case 'solicitudEstudio':
        return !!(
          documento.tipo_estudio &&
          documento.estudios_solicitados &&
          documento.indicacion_clinica
        );

      default:
        return true;
    }
  }

  private puedeCrearDocumento(tipoDoc: string): boolean {
    const config = this.documentosDisponibles.find((d) => d.id === tipoDoc);
    if (!config) return false;
    if (
      config.requiereInternamiento &&
      !this.pacienteCompleto?.ultimoInternamiento
    ) {
      return false;
    }

    if (config.requiereQuirurgico && !this.mostrarDocumentosQuirurgicos) {
      return false;
    }

    if (config.soloPediatrico && !this.esPacientePediatrico) {
      return false;
    }

    if (config.soloAdultos && this.esPacientePediatrico) {
      return false;
    }

    return true;
  }

  private async cargarDocumentosDelPaciente(): Promise<void> {
    try {
      if (!this.pacienteCompleto?.expediente?.id_expediente) return;
      const response = await firstValueFrom(
        this.documentosService.getDocumentosByExpediente(
          this.pacienteCompleto.expediente.id_expediente
        )
      );

      if (response.success && response.data) {
        this.documentosExistentes = {};
        for (const doc of response.data) {
          const tipoDocumento = this.mapearTipoDocumento(doc);
          if (tipoDocumento) {
            this.documentosExistentes[tipoDocumento] = doc;
            if (this.formularioEstado.hasOwnProperty(tipoDocumento)) {
              (this.formularioEstado as any)[tipoDocumento] = true;
            }
          }
        }
      }

      console.log(
        '📋 Documentos existentes cargados:',
        this.documentosExistentes
      );
    } catch (error) {
      console.error('❌ Error al cargar documentos existentes:', error);
    }
  }

  obtenerNumeroExpedientePreferido(): string {
    if (!this.pacienteCompleto?.expediente) return 'Sin expediente';

    const expediente = this.pacienteCompleto.expediente;
    return (
      expediente.numero_expediente_administrativo ||
      expediente.numero_expediente ||
      'Sin número'
    );
  }

  // - MÉTODO PARA ACTUALIZAR NÚMERO ADMINISTRATIVO
  async actualizarNumeroAdministrativo(nuevoNumero: string): Promise<void> {
    if (!this.pacienteCompleto?.expediente?.id_expediente) {
      throw new Error('No hay expediente válido');
    }

    try {
      //   DEBUG COMPLETO
      const usuario = this.authService.getCurrentUser();
      console.log('  Usuario completo del AuthService:', usuario);
      console.log('  Propiedades del usuario:', Object.keys(usuario || {}));
      console.log('  ID usuario:', usuario?.id);
      console.log('  ID referencia:', usuario?.id_referencia);
      console.log('  Tipo usuario:', usuario?.tipo_usuario);
      console.log('  medicoActual (this.medicoActual):', this.medicoActual);

      // 🔧 Determinar qué ID usar
      let medicoId: number | undefined;

      if (usuario?.tipo_usuario === 'medico') {
        // Intentar usar id_referencia primero, luego id como fallback
        medicoId = usuario.id_referencia || usuario.id;
        console.log('- Usando ID del usuario médico:', medicoId);
      } else if (this.medicoActual) {
        medicoId = this.medicoActual;
        console.log('- Usando medicoActual:', medicoId);
      }

      const updateData: any = {
        numero_expediente_administrativo: nuevoNumero.trim() || undefined,
      };

      // Solo agregar ID del médico si lo tenemos
      if (medicoId) {
        updateData.id_medico_modificador = medicoId;
        console.log('- Enviando con id_medico_modificador:', medicoId);
      } else {
        console.warn('  No se encontró ID de médico válido');
      }

      console.log('📤 Datos finales a enviar:', updateData);

      const response = await firstValueFrom(
        this.expedientesService.update(
          this.pacienteCompleto.expediente.id_expediente,
          updateData
        )
      );

      // Actualizar el objeto local
      if (this.pacienteCompleto.expediente) {
        this.pacienteCompleto.expediente.numero_expediente_administrativo =
          nuevoNumero.trim() || undefined;
      }

      this.success =
        'Número de expediente administrativo actualizado correctamente';
      console.log('- Número administrativo actualizado:', nuevoNumero);
    } catch (error) {
      console.error('❌ Error al actualizar número administrativo:', error);
      this.error = 'Error al actualizar el número administrativo';
      throw error;
    }
  }

  // 🔧 AGREGAR ESTE MÉTODO SI NO EXISTE
  private obtenerIdMedicoActual(): number | undefined {
    // Intentar obtener del servicio de autenticación
    const usuario = this.authService.getCurrentUser();
    console.log('  Verificando usuario en obtenerIdMedicoActual:', usuario);

    if (usuario?.tipo_usuario === 'medico' && usuario?.id_referencia) {
      console.log(
        '- Médico obtenido del usuario autenticado:',
        usuario.id_referencia
      );
      return usuario.id_referencia;
    }

    // Fallback: usar this.medicoActual si está disponible
    if (this.medicoActual) {
      console.log('- Médico obtenido de medicoActual:', this.medicoActual);
      return this.medicoActual;
    }

    console.warn('  No se pudo obtener ID del médico');
    return undefined;
  }

  // - MAPEAR TIPO DE DOCUMENTO DEL BACKEND AL FRONTEND
  private mapearTipoDocumento(documento: any): string | null {
    // Mapear según el nombre del tipo de documento
    const mapeo: { [key: string]: string } = {
      'Historia Clínica': 'historiaClinica',
      'Signos Vitales': 'signosVitales',
      'Nota de Urgencias': 'notaUrgencias',
      'Nota de Evolución': 'notaEvolucion',
      'Consentimiento Informado': 'consentimiento',
      'Nota Preoperatoria': 'notaPreoperatoria',
      'Nota Postoperatoria': 'notaPostoperatoria',
      'Nota Preanestésica': 'notaPreanestesica',
      'Nota Postanestésica': 'notaPostanestesica',
      'Nota de Interconsulta': 'notaInterconsulta',
      'Solicitud de Estudio': 'solicitudEstudio',
      'Referencia y Traslado': 'referenciaTraslado',
      'Control de Crecimiento': 'controlCrecimiento',
      'Esquema de Vacunación': 'esquemaVacunacion',
    };

    return mapeo[documento.tipo_documento?.nombre] || null;
  }

  documentosDisponiblesFiltrados: TipoDocumentoConfig[] = [];

  private inicializarFormularios(): void {
    // Formularios clínicos principales (EXISTENTES)
    this.signosVitalesForm = this.initializeSignosVitalesForm();
    this.historiaClinicaForm = this.initializeHistoriaClinicaForm();
    this.notaUrgenciasForm = this.initializeNotaUrgenciasForm();
    this.notaEvolucionForm = this.initializeNotaEvolucionForm();

    // Formularios de consentimiento y procedimientos (EXISTENTES)
    this.consentimientoForm = this.initializeConsentimientoForm();
    this.notaPreoperatoriaForm = this.initializeNotaPreoperatoriaForm();
    this.notaPostoperatoriaForm = this.initializeNotaPostoperatoriaForm();
    this.notaPreanestesicaForm = this.initializeNotaPreanestesicaForm();
    this.notaPostanestesicaForm = this.initializeNotaPostanestesicaForm();

    // Formularios adicionales (EXISTENTES)
    this.notaInterconsultaForm = this.initializeNotaInterconsultaForm();

    // 🔥 CORREGIR: Estos ya están definidos pero faltaba inicializarlos aquí
    this.solicitudEstudioForm = this.initializeSolicitudEstudioForm();
    this.prescripcionForm = this.initializePrescripcionForm();
    this.referenciaForm = this.initializeReferenciaForm();
    this.controlCrecimientoForm = this.initializeControlCrecimientoForm();
    this.esquemaVacunacionForm = this.initializeEsquemaVacunacionForm();

    // Formularios pediátricos (EXISTENTES)
    this.historiaClinicaPediatricaForm =
      this.initializeHistoriaClinicaPediatricaForm();
    this.desarrolloPsicomotrizForm = this.initializeDesarrolloPsicomotrizForm();
    this.alimentacionPediatricaForm =
      this.initializeAlimentacionPediatricaForm();
    this.tamizajeNeonatalForm = this.initializeTamizajeNeonatalForm();
    this.antecedentesHeredoFamiliaresForm =
      this.initializeAntecedentesHeredoFamiliaresForm();
    this.antecedentesPerinatalesForm =
      this.initializeAntecedentesPerinatalesForm();
    this.estadoNutricionalPediatricoForm =
      this.initializeEstadoNutricionalPediatricoForm();
    this.inmunizacionesForm = this.initializeInmunizacionesForm();
    this.vacunasAdicionalesForm = this.initializeVacunasAdicionalesForm();
    this.alimentacionPediatricaForm = this.initializeAlimentacionPediatricaForm();
  this.tamizajeNeonatalForm = this.initializeTamizajeNeonatalForm();

    // 🔥 NUEVOS FORMULARIOS AGREGADOS
    this.solicitudCultivoForm = this.initializeSolicitudCultivoForm();
    this.solicitudGasometriaForm = this.initializeSolicitudGasometriaForm();
    this.registroTransfusionForm = this.initializeRegistroTransfusionForm();
    this.altaVoluntariaForm = this.initializeAltaVoluntariaForm();

    console.log(
      '✅ Todos los formularios han sido inicializados correctamente.'
    );
  }

  private ejecutarSiFormularioValido(
    callback: (form: Exclude<FormularioActivo, null>) => void
  ): void {
    if (this.formularioActivo !== null) {
      this.formularioEstado[this.formularioActivo] = true;
    }
  }

  async guardarDocumento(tipoDocumento: string): Promise<void> {
    try {
      this.isCreatingDocument = true;
      let response: any;
      let datosFormulario: any;
      switch (tipoDocumento) {
        case 'signosVitales':
          datosFormulario = this.prepararDatosSignosVitales();
          response = await this.signosVitalesService.createSignosVitales(
            datosFormulario
          );
          break;

        case 'historiaClinica':
          datosFormulario = this.prepararDatosHistoriaClinica();
          response = await this.historiasClinicasService.createHistoriaClinica(
            datosFormulario
          );
          break;

        case 'notaUrgencias':
          datosFormulario = this.prepararDatosNotaUrgencias();
          response = await this.notasUrgenciasService.createNotaUrgencias(
            datosFormulario
          );
          break;

        case 'notaEvolucion':
          datosFormulario = this.prepararDatosNotaEvolucion();
          response = await this.notaEvolucionService.createNotaEvolucion(
            datosFormulario
          );
          break;

        case 'notaPreoperatoria':
          datosFormulario = this.prepararDatosNotaPreoperatoria();
          response =
            await this.notasPreoperatoriaService.createNotaPreoperatoria(
              datosFormulario
            );
          break;

        case 'notaPreanestesica':
          datosFormulario = this.prepararDatosNotaPreanestesica();
          response =
            await this.notasPreanestesicaService.createNotaPreanestesica(
              datosFormulario
            );
          break;

        case 'notaPostoperatoria':
          datosFormulario = this.prepararDatosNotaPostoperatoria();
          response =
            await this.notasPostoperatoriaService.createNotaPostoperatoria(
              datosFormulario
            );
          break;

        case 'notaPostanestesica':
          datosFormulario = this.prepararDatosNotaPostanestesica();
          response =
            await this.notasPostanestesicaService.createNotaPostanestesica(
              datosFormulario
            );
          break;

        case 'notaInterconsulta':
          datosFormulario = this.prepararDatosNotaInterconsulta();
          response =
            await this.notasInterconsultaService.createNotaInterconsulta(
              datosFormulario
            );
          break;

        case 'consentimiento':
          datosFormulario = this.prepararDatosConsentimiento();
          response = await firstValueFrom(
            this.consentimientosService.createConsentimiento(datosFormulario)
          );
          break;

        case 'solicitudEstudio':
          datosFormulario = this.prepararDatosSolicitudEstudio();
          response = await firstValueFrom(
            this.solicitudesEstudioService.createSolicitud(datosFormulario)
          );
          break;

        case 'referenciaTraslado':
          datosFormulario = this.prepararDatosReferencia();
          response = await firstValueFrom(
            this.referenciasTrasladoService.createReferencia(datosFormulario)
          );
          break;

        default:
          throw new Error(`Tipo de documento no soportado: ${tipoDocumento}`);
      }

      if (response.success) {
        console.log(`- ${tipoDocumento} guardado exitosamente`);
        await this.cargarDocumentosDelPaciente();
        this.formularioActivo = null;
      }
    } catch (error) {
      const nombreFormulario = this.formularioActivo
        ? this.getTituloFormulario(this.formularioActivo)
        : 'documento';
      this.error = `Error al procesar ${nombreFormulario}`;
    } finally {
      this.isCreatingDocument = false;
    }
  }

  // 1. - Preparar Signos Vitales
  private prepararDatosSignosVitales(): any {
    return {
      ...this.signosVitalesForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
      fecha_registro: new Date().toISOString(),
    };
  }

  // 2. - Preparar Historia Clínica
  private prepararDatosHistoriaClinica(): any {
    return {
      ...this.historiaClinicaForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
      fecha_creacion: new Date().toISOString(),
    };
  }

  // 3. - Preparar Nota de Urgencias
  private prepararDatosNotaUrgencias(): any {
    return {
      ...this.notaUrgenciasForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
      fecha_registro: new Date().toISOString(),
    };
  }

  // 4. - Preparar Nota de Evolución
  private prepararDatosNotaEvolucion(): any {
    return {
      ...this.notaEvolucionForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
      fecha_registro: new Date().toISOString(),
    };
  }

  // 5. - Preparar Nota Preoperatoria
  private prepararDatosNotaPreoperatoria(): any {
    return {
      ...this.notaPreoperatoriaForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
      fecha_registro: new Date().toISOString(),
    };
  }

  // 6. - Preparar Nota Preanestésica
  private prepararDatosNotaPreanestesica(): any {
    return {
      ...this.notaPreanestesicaForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
      fecha_registro: new Date().toISOString(),
    };
  }

  // 7. - Preparar Nota Postoperatoria
  private prepararDatosNotaPostoperatoria(): any {
    return {
      ...this.notaPostoperatoriaForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
      fecha_registro: new Date().toISOString(),
    };
  }

  // 8. - Preparar Nota Postanestésica
  private prepararDatosNotaPostanestesica(): any {
    return {
      ...this.notaPostanestesicaForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
      fecha_registro: new Date().toISOString(),
    };
  }

  // 9. - Preparar Nota de Interconsulta
  private prepararDatosNotaInterconsulta(): any {
    return {
      ...this.notaInterconsultaForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
      fecha_registro: new Date().toISOString(),
    };
  }

  // 10. - Preparar Consentimiento Informado
  private prepararDatosConsentimiento(): any {
    return {
      ...this.consentimientoForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
      fecha_consentimiento: new Date().toISOString(),
    };
  }

  // 11. - Preparar Solicitud de Estudio
  private prepararDatosSolicitudEstudio(): any {
    return {
      ...this.solicitudEstudioForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
      fecha_solicitud: new Date().toISOString(),
    };
  }

  // 12. - Preparar Referencia o Traslado
  private prepararDatosReferencia(): any {
    return {
      ...this.referenciaForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
      fecha_referencia: new Date().toISOString(),
    };
  }

  // 13. - Preparar Prescripción de Medicamentos
  private prepararDatosPrescripcion(): any {
    return {
      ...this.prescripcionForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
      fecha_prescripcion: new Date().toISOString(),
    };
  }

  // 14. - Preparar Control de Crecimiento (pediatría)
  private prepararDatosControlCrecimiento(): any {
    return {
      ...this.controlCrecimientoForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
      fecha_control: new Date().toISOString(),
    };
  }

  // 15. - Preparar Esquema de Vacunación
  private prepararDatosEsquemaVacunacion(): any {
    return {
      ...this.esquemaVacunacionForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
      fecha_actualizacion: new Date().toISOString(),
    };
  }

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

  debugPacienteCompleto(): void {
    console.log('  DEBUG pacienteCompleto completo:', this.pacienteCompleto);
    console.log('  DEBUG persona:', this.pacienteCompleto?.persona);
    console.log('  DEBUG paciente:', this.pacienteCompleto?.paciente);
    if (this.pacienteCompleto?.persona) {
      console.log('- Persona existe');
      console.log('📝 Nombre:', this.pacienteCompleto.persona.nombre);
      console.log(
        'Apellido paterno:',
        this.pacienteCompleto.persona.apellido_paterno
      );
      console.log(
        'Apellido materno:',
        this.pacienteCompleto.persona.apellido_materno
      );
    } else {
      console.log('❌ Persona no existe o es undefined');
    }
  }

  ngOnInit(): void {
    // Inicializar navegación mejorada
    this.inicializarFormulariosVisibles();

    // 1. Suscripción a parámetros de ruta
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.pacienteId = parseInt(id, 10);
        this.inicializarFlujoPaciente(); // ← Encapsula toda la lógica inicial
      } else {
        this.error = 'ID de paciente no válido';
        this.isLoading = false;
      }
    });

    // 2. Escuchar cambios de conexión
    window.addEventListener('online', () => {
      this.hayProblemasConexion = false;
      this.verificarConexion();
    });

    window.addEventListener('offline', () => {
      this.hayProblemasConexion = true;
      this.estadoAutoguardado = 'offline';
    });

    // 3. Obtener médico actual
    this.authService.currentUser$.subscribe((user) => {
      if (user && user.tipo_usuario === 'medico') {
        this.medicoActual = user.id;
      }
    });
  }

  // Método auxiliar para organizar el flujo de carga del paciente
  private inicializarFlujoPaciente(): void {
    // Paso 1: Inicializar todos los formularios ANTES de cualquier operación
    this.inicializarFormularios();

    // Paso 2: Intentar recuperar datos guardados localmente (requiere formularios inicializados)
    this.recuperarDatosLocales();

    // Paso 3: Cargar datos del paciente y expediente
    this.initializeComponent();

    // Paso 4: Cargar datos adicionales del sistema
    this.cargarGuiasClinicas();
    this.determinarTipoPaciente();
    this.configurarDocumentosDisponibles();

    // Paso 5: Iniciar autoguardado (una sola vez)
    this.iniciarAutoguardado();

    // - Opcional: Debug (solo en desarrollo)
    setTimeout(() => {
      this.debugPacienteCompleto();
    }, 2000);
  }

  ngOnDestroy(): void {
    // 1. Detener autoguardado
    if (this.autoguardadoInterval) {
      clearInterval(this.autoguardadoInterval);
    }

    // 2. Guardar estado local antes de salir
    this.guardarLocalmenteFormulario();

    // 3. Completar Subject para desuscribirse
    this.destroy$.next();
    this.destroy$.complete();
  }

  private configurarDocumentosDisponibles(): void {
    let documentosBase = [...this.documentosDisponibles];

    if (this.esPacientePediatrico) {
      documentosBase = documentosBase.map((doc) => {
        if (doc.id === 'historiaClinica') {
          return {
            ...doc,
            nombre: 'Historia Clínica Pediátrica',
            descripcion:
              'Historia clínica especializada para pacientes pediátricos',
          };
        }
        return doc;
      });

      const docsPediatricos = ['controlCrecimiento', 'esquemaVacunacion'];
      docsPediatricos.forEach((docId) => {
        if (!documentosBase.find((d) => d.id === docId)) {
          documentosBase.push(this.obtenerConfigDocumentoPediatrico(docId));
        }
      });
    } else {
      documentosBase = documentosBase.filter(
        (doc) => !['controlCrecimiento', 'esquemaVacunacion'].includes(doc.id)
      );
    }

    this.documentosDisponiblesFiltrados = documentosBase.sort(
      (a, b) => a.orden - b.orden
    );
  }
  private determinarTipoPaciente(): void {
    if (this.pacienteCompleto?.persona?.fecha_nacimiento) {
      const edad = this.calcularEdad(
        this.pacienteCompleto.persona.fecha_nacimiento
      );
      const esPediatricoAnterior = this.esPacientePediatrico;
      this.esPacientePediatrico = edad < 18;
      console.log(
        `Paciente ${
          this.esPacientePediatrico ? 'PEDIÁTRICO' : 'ADULTO'
        } (${edad} años)`
      );
      this.evaluarDocumentosQuirurgicos();
      if (esPediatricoAnterior !== this.esPacientePediatrico) {
        this.ajustarFormulariosPorEdad();
      }
    }
  }

  private evaluarDocumentosQuirurgicos(): void {
    // Lógica para determinar si el paciente requiere documentos quirúrgicos
    // Puedes basarlo en diagnósticos, servicios, internamiento, etc.
    this.mostrarDocumentosQuirurgicos =
      this.pacienteCompleto?.ultimoInternamiento?.requiere_cirugia || false; // Por ahora false, se puede activar según necesidades
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

  onDocumentoClick(documento: TipoDocumentoConfig): void {
    const estado = this.getEstadoDocumento(documento.id);

    switch (estado) {
      case 'crear':
        this.activarFormulario(documento.id);
        break;
      case 'editar':
        this.editarDocumento(documento.id);
        break;
      case 'pdf':
        this.generarPDFDirecto(documento.id);
        break;
      case 'no_disponible':
        this.mostrarMensajeNoDisponible(documento);
        break;
    }
  }

  activarFormulario(tipoDoc: string): void {
    if (this.esFormularioValido(tipoDoc)) {
      this.formularioActivo = tipoDoc as FormularioActivo;
      this.tabActiva = 'crear';
    }
  }

  private mostrarMensajeError(mensaje: string): void {
    this.error = mensaje;
    this.mostrarError = true;
    setTimeout(() => {
      this.mostrarError = false;
    }, 5000);
  }
  private flujoDocumentalHospitalario = {
    ingreso: [
      'hojaFrontal',
      'historiaClinica',
      'consentimientoHospitalizacion',
    ],
    urgencias: ['notaUrgencias', 'signosVitales'],
    hospitalizacion: [
      'notaEvolucion',
      'indicacionesMedicas',
      'prescripcionMedicamento',
    ],
    estudios: ['solicitudLaboratorio', 'solicitudRadiologia'],
    interconsulta: ['notaInterconsulta', 'referenciaTraslado'],
    quirurgico: [
      'notaPreoperatoria',
      'notaPreanestesica',
      'consentimientoProcedimiento',
    ],
    egreso: ['notaEgreso', 'altaVoluntaria'],
  };

  private validarDocumentoNOM004(tipoDocumento: string): boolean {
    const camposObligatoriosNOM004: { [key: string]: string[] } = {
      historiaClinica: [
        'tipo_nombre_domicilio_establecimiento',
        'nombre_sexo_edad_domicilio_paciente',
        'antecedentes_heredo_familiares',
        'antecedentes_personales_patologicos',
        'padecimiento_actual',
        'exploracion_fisica',
        'resultados_estudios',
        'diagnosticos',
        'pronostico',
      ],
      notaEvolucion: [
        'evolucion_estado_actual',
        'signos_vitales',
        'resultados_estudios_gabinete',
        'diagnosticos',
        'tratamiento_indicaciones',
      ],
    };

    return this.validarCamposObligatorios(
      tipoDocumento,
      camposObligatoriosNOM004[tipoDocumento] || []
    );
  }

  editarDocumento(tipoDoc: string): void {
    const documento = this.documentosExistentes[tipoDoc];
    if (!documento) return;
    const formulario = this.formularios[tipoDoc];
    if (formulario) {
      formulario.patchValue(documento);
      if (this.formularioActivo !== null) {
        this.activarFormulario(this.formularioActivo);
      }
    }
  }

  async generarPDFDirecto(tipoDoc: string): Promise<void> {
    const documento = this.documentosExistentes[tipoDoc];
    if (!documento) {
      this.error = 'No hay datos para generar PDF';
      return;
    }

    try {
      await this.generarPDF(this.getTituloFormulario(tipoDoc));
    } catch (error) {
      console.error('Error al generar PDF:', error);
      this.error = 'Error al generar PDF';
    }
  }

  mostrarMensajeNoDisponible(documento: TipoDocumentoConfig): void {
    let mensaje = `${documento.nombre} no está disponible.`;

    if (documento.requiereInternamiento) {
      mensaje += ' Requiere que el paciente esté internado.';
    }

    if (documento.requiereQuirurgico) {
      mensaje += ' Solo disponible para procedimientos quirúrgicos.';
    }

    if (documento.soloPediatrico && !this.esPacientePediatrico) {
      mensaje += ' Solo disponible para pacientes pediátricos.';
    }

    this.error = mensaje;
    setTimeout(() => (this.error = null), 4000);
  }

  private calcularEdadEnMeses(): number {
    const fechaNacimiento = this.pacienteCompleto?.persona?.fecha_nacimiento;
    if (!fechaNacimiento) return 0;

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);

    let meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12;
    meses += hoy.getMonth() - nacimiento.getMonth();

    if (hoy.getDate() < nacimiento.getDate()) {
      meses--;
    }

    return Math.max(0, meses);
  }

  private calcularPercentiles(): any {
    return {
      peso: 50,
      talla: 50,
      perimetro_cefalico: 50,
    };
  }

  private obtenerConfigDocumentoPediatrico(docId: string): TipoDocumentoConfig {
    const configuracionesPediatricas: { [key: string]: TipoDocumentoConfig } = {
      controlCrecimiento: {
        id: 'controlCrecimiento',
        nombre: 'Control de Crecimiento',
        descripcion: 'Seguimiento del desarrollo pediátrico',
        icono: 'fas fa-baby',
        color: 'pink',
        requiereInternamiento: false,
        soloAdultos: false,
        soloPediatrico: true,
        requiereQuirurgico: false,
        orden: 50,
      },
      esquemaVacunacion: {
        id: 'esquemaVacunacion',
        nombre: 'Esquema de Vacunación',
        descripcion: 'Registro de vacunas aplicadas',
        icono: 'fas fa-shield-virus',
        color: 'yellow',
        requiereInternamiento: false,
        soloAdultos: false,
        soloPediatrico: true,
        requiereQuirurgico: false,
        orden: 51,
      },
    };

    return (
      configuracionesPediatricas[docId] || {
        id: docId,
        nombre: docId,
        descripcion: '',
        icono: 'fas fa-file',
        color: 'gray',
        requiereInternamiento: false,
        soloAdultos: false,
        soloPediatrico: true,
        requiereQuirurgico: false,
        orden: 99,
      }
    );
  }

  private validarCamposObligatorios(
    tipoDocumento: string,
    campos: string[]
  ): boolean {
    const formulario = this.formularios[tipoDocumento];
    if (!formulario) return false;

    return campos.every((campo) => {
      const control = formulario.get(campo);
      return control && control.value && control.valid;
    });
  }

  private marcarCamposInvalidos(form: FormGroup): void {
    Object.keys(form.controls).forEach((field) => {
      const control = form.get(field);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.marcarCamposInvalidos(control);
        }
      }
    });
  }

  getClasesTarjetaDocumento(documento: TipoDocumentoConfig): string {
    const estado = this.getEstadoDocumento(documento.id);
    const baseClasses =
      'bg-white rounded-lg border transition-all cursor-pointer';

    switch (estado) {
      case 'pdf':
        return `${baseClasses} border-green-300 hover:border-green-400 hover:shadow-md`;
      case 'editar':
        return `${baseClasses} border-yellow-300 hover:border-yellow-400 hover:shadow-md`;
      case 'crear':
        return `${baseClasses} border-blue-300 hover:border-blue-400 hover:shadow-md`;
      case 'no_disponible':
        return `${baseClasses} border-gray-200 opacity-50 cursor-not-allowed`;
      default:
        return `${baseClasses} border-gray-200`;
    }
  }

  getClasesBotonAccion(documento: TipoDocumentoConfig): string {
    const estado = this.getEstadoDocumento(documento.id);
    const baseClasses =
      'px-3 py-1 rounded text-sm font-medium flex items-center space-x-1';

    switch (estado) {
      case 'pdf':
        return `${baseClasses} bg-green-600 text-white hover:bg-green-700`;
      case 'editar':
        return `${baseClasses} bg-yellow-600 text-white hover:bg-yellow-700`;
      case 'crear':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`;
      default:
        return `${baseClasses} bg-gray-400 text-gray-600 cursor-not-allowed`;
    }
  }

  getIconoAccion(documento: TipoDocumentoConfig): string {
    const estado = this.getEstadoDocumento(documento.id);

    switch (estado) {
      case 'pdf':
        return 'fas fa-file-pdf';
      case 'editar':
        return 'fas fa-edit';
      case 'crear':
        return 'fas fa-plus';
      default:
        return 'fas fa-ban';
    }
  }

  getTextoAccion(documento: TipoDocumentoConfig): string {
    const estado = this.getEstadoDocumento(documento.id);

    switch (estado) {
      case 'pdf':
        return 'Ver PDF';
      case 'editar':
        return 'Editar';
      case 'crear':
        return 'Crear';
      case 'no_disponible':
        return 'No disponible';
      default:
        return '';
    }
  }

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

  private filtrarGuiasPorArea(area: string): GuiaClinica[] {
    if (!area) return this.guiasClinicas;

    return this.guiasClinicas.filter(
      (guia) =>
        guia.area?.toLowerCase().includes(area.toLowerCase()) ||
        guia.nombre?.toLowerCase().includes(area.toLowerCase())
    );
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

  buscarGuiaClinicaPorTermino(termino: string): void {
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

  onInputGuiaClinica(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.value !== undefined) {
      this.buscarGuiaClinicaPorTermino(input.value);
    }
  }

  onGuiaClinicaInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input?.value || '';
    this.filtroGuiaClinica = value;
    if (!value) {
      this.guiasClinicasFiltradas = [...this.guiasClinicas];
      return;
    }
    this.guiasClinicasFiltradas = this.guiasClinicas.filter(
      (guia) =>
        guia.nombre?.toLowerCase().includes(value.toLowerCase()) ||
        guia.codigo?.toLowerCase().includes(value.toLowerCase()) ||
        guia.area?.toLowerCase().includes(value.toLowerCase())
    );
  }

  seleccionarGuiaClinica(guia: GuiaClinica | null): void {
    if (!guia) return;
    this.guiaClinicaSeleccionada = guia;
    this.filtroGuiaClinica = guia.nombre || '';
    this.mostrarDropdownGuias = false;
    this.actualizarFormularioConGuia(guia);
  }

  private actualizarFormularioConGuia(guia: GuiaClinica): void {
    switch (this.formularioActivo) {
      case 'historiaClinica':
        this.historiaClinicaForm.patchValue({
          id_guia_diagnostico: guia.id_guia_diagnostico,
        });
        break;
      case 'notaUrgencias':
        this.notaUrgenciasForm.patchValue({
          id_guia_diagnostico: guia.id_guia_diagnostico,
        });
        break;
      case 'notaEvolucion':
        this.notaEvolucionForm.patchValue({
          id_guia_diagnostico: guia.id_guia_diagnostico,
        });
        break;
    }
  }

  limpiarGuiaClinica(): void {
    this.guiaClinicaSeleccionada = null;
    this.filtroGuiaClinica = '';
    this.mostrarDropdownGuias = false;
    switch (this.formularioActivo) {
      case 'historiaClinica':
        this.historiaClinicaForm.patchValue({
          id_guia_diagnostico: null,
        });
        break;
      case 'notaUrgencias':
        this.notaUrgenciasForm.patchValue({
          id_guia_diagnostico: null,
        });
        break;
      case 'notaEvolucion':
        this.notaEvolucionForm.patchValue({
          id_guia_diagnostico: null,
        });
        break;
    }
  }

  toggleDropdownGuias(): void {
    this.mostrarDropdownGuias = !this.mostrarDropdownGuias;
    if (this.mostrarDropdownGuias) {
      this.guiasClinicasFiltradas = [...this.guiasClinicas];
    }
  }

  trackByGuiaId(index: number, guia: GuiaClinica): number {
    return guia.id_guia_diagnostico;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target?.closest('.relative');

    if (!dropdown) {
      this.mostrarDropdownGuias = false;
    }
  }

  private getEventValue(event: Event): string {
    const target = event.target as HTMLInputElement;
    return target?.value || '';
  }

  get esGuiaClinicaValida(): boolean {
    return !!this.guiaClinicaSeleccionada?.id_guia_diagnostico;
  }
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
        next: async (data) => {
          this.construirPacienteCompleto(data.paciente);
          this.procesarCatalogos(data.catalogos);
          // Cargar datos completos del médico
          try {
            this.medicoCompleto = await this.obtenerDatosMedicoCompleto();
          } catch (error) {
            console.warn('No se pudieron cargar datos del médico:', error);
          }
          this.isLoading = false;
          console.log('- Componente inicializado correctamente');
          console.log('   Datos del paciente:', this.pacienteCompleto);
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

  // private initializeHistoriaClinicaForm(): FormGroup {
  //   return this.fb.group({
  //     antecedentes_heredo_familiares: ['', Validators.required],
  //     habitos_higienicos: [''],
  //     habitos_alimenticios: [''],
  //     actividad_fisica: [''],
  //     ocupacion: [''],
  //     vivienda: [''],
  //     toxicomanias: [''],
  //     menarca: [''],
  //   ritmo_menstrual: [''],
  //   inicio_vida_sexual: [''],
  //   fecha_ultima_regla: [''],
  //   fecha_ultimo_parto: [''],
  //   gestas: [null],
  //   partos: [null],
  //   cesareas: [null],
  //   abortos: [null],
  //   hijos_vivos: [null],
  //   metodo_planificacion: [''],
  //     padecimiento_actual: ['', Validators.required],
  //     sintomas_generales: [''],
  //     aparatos_sistemas: [''],
  //     exploracion_general: ['', Validators.required],
  //     exploracion_cabeza: [''],
  //     exploracion_cuello: [''],
  //     exploracion_torax: [''],
  //     exploracion_abdomen: [''],
  //     exploracion_extremidades: [''],
  //     impresion_diagnostica: ['', Validators.required],
  //     plan_diagnostico: [''],
  //     plan_terapeutico: ['', Validators.required],
  //     pronostico: ['', Validators.required],
  //     id_guia_diagnostico: [null],
  //   });
  // }

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
    alergias: [''],
    
    // Padecimiento actual
    padecimiento_actual: ['', [Validators.required]],
    sintomas_generales: [''],
    aparatos_sistemas: [''],
    
    // Exploración física (ESTOS SON LOS CAMPOS QUE TE FALTABAN)
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
    pronostico: ['', [Validators.required]]
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
    });
  }
  private initializeNotaEvolucionForm(): FormGroup {
    return this.fb.group({
      sintomas_signos: ['', [Validators.required, Validators.minLength(10)]],
      habitus_exterior: ['', [Validators.required, Validators.minLength(5)]],
      estado_nutricional: ['', [Validators.required, Validators.minLength(5)]],
      estudios_laboratorio_gabinete: [
        '',
        [Validators.required, Validators.minLength(10)],
      ],
      evolucion_analisis: ['', [Validators.required, Validators.minLength(10)]],
      diagnosticos: ['', [Validators.required, Validators.minLength(10)]],
      plan_estudios_tratamiento: [
        '',
        [Validators.required, Validators.minLength(10)],
      ],
      pronostico: ['', [Validators.required, Validators.minLength(5)]],
      id_guia_diagnostico: [null],
      dias_hospitalizacion: [null, [Validators.min(0), Validators.max(365)]],
      fecha_ultimo_ingreso: [''],
      temperatura: [null, [Validators.min(30), Validators.max(45)]],
      frecuencia_cardiaca: [null, [Validators.min(30), Validators.max(250)]],
      frecuencia_respiratoria: [null, [Validators.min(8), Validators.max(60)]],
      presion_arterial_sistolica: [
        null,
        [Validators.min(60), Validators.max(250)],
      ],
      presion_arterial_diastolica: [
        null,
        [Validators.min(30), Validators.max(150)],
      ],
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

  // private initializeNotaPostoperatoriaForm(): FormGroup {
  //   return this.fb.group({
  //     hallazgos_transoperatorios: ['', Validators.required],
  //     tecnica_quirurgica: ['', Validators.required],
  //     sangrado: [''],
  //     complicaciones: [''],
  //   });
  // }
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
      tipo_estudio: ['', [Validators.required]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      indicaciones: [''],
      fecha_solicitud: [
        new Date().toISOString().split('T')[0],
        [Validators.required],
      ],
      prioridad: ['normal', [Validators.required]], // 'baja', 'normal', 'alta', 'urgente'
      medico_solicitante: [''],
      diagnostico_presuntivo: [''],
      id_guia_clinica: [''],
    });
  }

  private initializePrescripcionForm(): FormGroup {
    return this.fb.group({
      medicamentos: this.fb.array([]), // Se maneja como FormArray
      indicaciones_generales: [''],
      duracion_tratamiento_dias: [null, [Validators.min(1)]],
      frecuencia: [''],
      via_administracion: [''],
      fecha_inicio: [new Date().toISOString().split('T')[0]],
      medico_prescriptor: [''],
    });
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
      tipo_referencia: ['segunda_opinion', [Validators.required]], // 'traslado', 'consulta_especializada'
    });
  }

  // Dentro de tu clase PerfilPaciente
  private prepararDatosAntecedentesHeredoFamiliares(): any {
    return {
      ...this.antecedentesHeredoFamiliaresForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_personal_registro: this.medicoActual,
      id_paciente: this.pacienteId,
    };
  }

  private prepararDatosAntecedentesPerinatales(): any {
    return {
      ...this.antecedentesPerinatalesForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_personal_registro: this.medicoActual,
      id_paciente: this.pacienteId,
    };
  }

  private prepararDatosDesarrolloPsicomotriz(): any {
    return {
      ...this.desarrolloPsicomotrizForm.value,
      id_historia_clinica: this.pacienteCompleto?.expediente?.id_expediente, // Usar id_expediente como fallback
      id_personal_registro: this.medicoActual,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
    };
  }

  private prepararDatosEstadoNutricionalPediatrico(): any {
    return {
      ...this.estadoNutricionalPediatricoForm.value,
      id_historia_clinica: this.pacienteCompleto?.expediente?.id_expediente, // Usar id_expediente como fallback
      id_personal_registro: this.medicoActual,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      fecha_evaluacion: new Date().toISOString().split('T')[0], // Fecha actual
    };
  }

  private prepararDatosInmunizaciones(): any {
    return {
      ...this.inmunizacionesForm.value,
      id_historia_clinica: this.pacienteCompleto?.expediente?.id_expediente, // Usar id_expediente como fallback
      id_personal_registro: this.medicoActual,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
    };
  }

  private prepararDatosVacunasAdicionales(): any {
    return {
      ...this.vacunasAdicionalesForm.value,
      id_inmunizacion: 1, // Esto podría necesitar ser obtenido dinámicamente
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_registro: this.medicoActual,
    };
  }

  private initializeControlCrecimientoForm(): FormGroup {
    return this.fb.group({
      peso: [
        '',
        [Validators.required, Validators.min(0.1), Validators.max(200)],
      ],
      talla: [
        '',
        [Validators.required, Validators.min(20), Validators.max(250)],
      ],
      imc: [''],
      percentil_peso: ['', [Validators.min(1), Validators.max(99)]],
      percentil_talla: ['', [Validators.min(1), Validators.max(99)]],
      percentil_imc: ['', [Validators.min(1), Validators.max(99)]],
      circunferencia_cefalica: ['', [Validators.min(0), Validators.max(70)]], // común en pediatría
      fecha_control: [
        new Date().toISOString().split('T')[0],
        [Validators.required],
      ],
      observaciones: [''],
    });
  }

  private initializeEsquemaVacunacionForm(): FormGroup {
    return this.fb.group({
      vacunas: this.fb.array([]), // Cada vacuna es un grupo con nombre, fecha, dosis, estado
      observaciones: [''],
      estado_general: ['completo', [Validators.required]], // 'completo', 'incompleto', 'pendiente'
      proximas_citas: this.fb.array([
        this.fb.group({
          vacuna: [''],
          fecha_programada: [''],
        }),
      ]),
    });
  }

  // Nuevo: Historia Clínica Pediátrica
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

  // Nuevo: Alimentación Pediátrica
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
      edad_inicio_ablactacion_meses: [
        '',
        [Validators.min(3), Validators.max(12)],
      ],
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

  // Nuevo: Tamizaje Neonatal
  private initializeTamizajeNeonatalForm(): FormGroup {
    return this.fb.group({
      // Datos del tamizaje
      fecha_toma_muestra: ['', Validators.required],
      edad_horas_toma: [
        '',
        [Validators.required, Validators.min(24), Validators.max(168)],
      ],
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
      // Inicializa con valores por defecto o vacíos
      // Basado en CreateAntecedentesHeredoFamiliaresDto
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
      // id_personal_registro se asignará al guardar
    });
  }

  private initializeAntecedentesPerinatalesForm(): FormGroup {
    return this.fb.group({
      // Basado en CreateAntecedentesPerinatalesDto
      embarazo_planeado: [false],
      numero_embarazo: [null, [Validators.min(1)]],
      control_prenatal: [false],
      numero_consultas_prenatales: [null, [Validators.min(0)]],
      complicaciones_embarazo: [''],
      tipo_parto: ['', Validators.required], // 'Vaginal' | 'Cesarea'
      semanas_gestacion: [null, [Validators.min(0)]],
      peso_nacimiento: [null, [Validators.min(0)]], // DECIMAL
      talla_nacimiento: [null, [Validators.min(0)]], // DECIMAL
      apgar_1_min: [null, [Validators.min(0), Validators.max(10)]],
      apgar_5_min: [null, [Validators.min(0), Validators.max(10)]],
      llanto_inmediato: [false],
      hospitalizacion_neonatal: [false],
      dias_hospitalizacion_neonatal: [null, [Validators.min(0)]],
      problemas_neonatales: [''],
      alimentacion_neonatal: [''], // 'Seno materno' | 'Fórmula' | 'Mixta'
      peso_2_meses: [null], // DECIMAL
      peso_4_meses: [null], // DECIMAL
      peso_6_meses: [null], // DECIMAL
      observaciones: [''],
      // id_personal_registro se asignará al guardar
    });
  }

  // Dentro de tu clase PerfilPaciente
  // Asumiendo que tienes acceso a `this.fb: FormBuilder` desde el constructor

  // ... (initializeAntecedentesHeredoFamiliaresForm e initializeAntecedentesPerinatalesForm como antes) ...

  private initializeDesarrolloPsicomotrizForm(): FormGroup {
    return this.fb.group({
      // Desarrollo motor grueso
      sostuvo_cabeza_meses: [null, [Validators.min(0)]],
      se_sento_meses: [null, [Validators.min(0)]],
      gateo_meses: [null, [Validators.min(0)]],
      camino_meses: [null, [Validators.min(0)]],
      // Puedes añadir más hitos de motor grueso según tu modelo/BD

      // Desarrollo del lenguaje
      primera_palabra_meses: [null, [Validators.min(0)]],
      primeras_frases_meses: [null, [Validators.min(0)]],

      // Desarrollo social y otros
      sonrisa_social_meses: [null, [Validators.min(0)]],
      reconocimiento_padres_meses: [null, [Validators.min(0)]],
      control_diurno_meses: [null, [Validators.min(0)]],
      control_nocturno_meses: [null, [Validators.min(0)]],
      juego_simbolico_meses: [null, [Validators.min(0)]],
      seguimiento_instrucciones_meses: [null, [Validators.min(0)]],

      // Evaluación actual
      desarrollo_normal: [true],
      observaciones_desarrollo: [''],
      necesita_estimulacion: [false],
      tipo_estimulacion: [''],
      areas_retraso: [''],
      recomendaciones: [''],
      // id_personal_registro se asignará al guardar
    });
  }

  private initializeEstadoNutricionalPediatricoForm(): FormGroup {
    return this.fb.group({
      // Datos antropométricos
      peso_kg: [null, [Validators.required, Validators.min(0.1)]],
      talla_cm: [null, [Validators.required, Validators.min(20)]],
      perimetro_cefalico_cm: [null, [Validators.min(0)]],
      perimetro_brazo_cm: [null, [Validators.min(0)]],

      // Índices nutricionales (pueden ser calculados o ingresados)
      percentil_peso: [null, [Validators.min(0), Validators.max(100)]],
      percentil_talla: [null, [Validators.min(0), Validators.max(100)]],
      percentil_perimetro_cefalico: [
        null,
        [Validators.min(0), Validators.max(100)],
      ],
      peso_para_edad: [''],
      talla_para_edad: [''],
      peso_para_talla: [''],
      imc: [null, [Validators.min(0)]],
      // imc_percentil podría calcularse

      // Evaluación clínica
      aspecto_general: [''],
      estado_hidratacion: [''],
      palidez_mucosas: [false],
      edemas: [false],
      masa_muscular: [''],
      tejido_adiposo: [''],

      // Clasificación nutricional
      diagnostico_nutricional: [''], // Este podría ser un select basado en cálculos
      riesgo_nutricional: [false],

      // Alimentación
      tipo_alimentacion: [''], // Considera usar un select con las opciones del enum
      numero_comidas_dia: [null, [Validators.min(1)]],
      apetito: [''], // Considera usar un select: 'BUENO', 'REGULAR', 'MALO'

      // Síntomas relacionados
      nauseas: [false],
      vomitos: [false],
      diarrea: [false],
      estrenimiento: [false],

      // Plan nutricional
      recomendaciones_nutricionales: [''],
      suplementos_vitaminicos: [''],
      observaciones: [''],

      // Fecha de evaluación (se puede manejar automáticamente o permitir selección)
      fecha_evaluacion: [new Date().toISOString().split('T')[0]],
      // id_personal_registro se asignará al guardar
    });
  }

  // Para Inmunizaciones, dado que maneja múltiples vacunas y dosis,
  // es más complejo. Una opción es manejar las vacunas como un FormArray
  // o tener campos específicos. Aquí un ejemplo básico con campos principales.
  private initializeInmunizacionesForm(): FormGroup {
    return this.fb.group({
      // Campos generales del esquema
      esquema_completo_edad: [false],
      esquema_incompleto_razon: [''],
      porcentaje_completado: [null, [Validators.min(0), Validators.max(100)]],
      reacciones_adversas: [''],
      observaciones: [''],

      // Campos para vacunas individuales (esto es simplificado)
      // En la práctica, podrías necesitar un FormArray para manejar múltiples dosis
      // o estructuras anidadas. Esto es un ejemplo básico.
      bcg_fecha: [''],
      bcg_observaciones: [''],
      // ... otros campos de vacunas según tu estructura de BD ...

      // id_personal_registro se asignará al guardar
    });
  }

  // VacunasAdicionales está más relacionado con registros individuales de vacunas aplicadas
  // que con un esquema general. Es posible que no necesites un formulario grande aquí,
  // sino una forma de agregar/eliminar vacunas adicionales una por una.
  // Si necesitas un formulario para esto, podría ser algo como:
  private initializeVacunasAdicionalesForm(): FormGroup {
    // Este formulario podría representar una *única* vacuna adicional a agregar
    return this.fb.group({
      // id_inmunizacion: [null, Validators.required], // Se necesitaría el ID del esquema
      nombre_vacuna: ['', Validators.required],
      laboratorio: [''],
      lote: [''],
      fecha_aplicacion: [
        new Date().toISOString().split('T')[0],
        Validators.required,
      ],
      dosis: [1, [Validators.required, Validators.min(1)]],
      via_aplicacion: [''],
      sitio_aplicacion: [''],
      reacciones_adversas: [''],
      observaciones: [''],
      // id_personal_registro se asignará al guardar
    });
  }

  // O si necesitas manejar varias vacunas adicionales en un solo formulario:
  private initializeVacunasAdicionalesListForm(): FormGroup {
    return this.fb.group({
      vacunas: this.fb.array([]), // Un FormArray para manejar múltiples VacunaAdicional
    });
  }

  // Helper para crear un FormGroup para una vacuna adicional individual (para usar con FormArray)
  createVacunaAdicionalGroup(): FormGroup {
    return this.fb.group({
      // id_vacuna_adicional: [null], // Para ediciones
      nombre_vacuna: ['', Validators.required],
      laboratorio: [''],
      lote: [''],
      fecha_aplicacion: [
        new Date().toISOString().split('T')[0],
        Validators.required,
      ],
      dosis: [1, [Validators.required, Validators.min(1)]],
      via_aplicacion: [''],
      sitio_aplicacion: [''],
      reacciones_adversas: [''],
      observaciones: [''],
    });
  }

  // NUEVOS MÉTODOS DE INICIALIZACIÓN PARA LOS FORMULARIOS AGREGADOS

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
      fecha_solicitud: [
        new Date().toISOString().split('T')[0],
        Validators.required,
      ],
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
      fecha_solicitud: [
        new Date().toISOString().split('T')[0],
        Validators.required,
      ],
      medico_solicitante: [''],
      observaciones: [''],
    });
  }

  private initializeRegistroTransfusionForm(): FormGroup {
    return this.fb.group({
      tipo_componente: ['', Validators.required],
      numero_unidad: ['', Validators.required],
      volumen: [
        null,
        [Validators.required, Validators.min(50), Validators.max(2000)],
      ],
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
      edad_solicitante: [
        null,
        [Validators.required, Validators.min(18), Validators.max(120)],
      ],
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
    return (
      this.formularioActivo !== null &&
      formularios.includes(this.formularioActivo)
    );
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

        case 'notaUrgencias':
          await this.guardarNotaUrgencias();
          this.formularioEstado['notaUrgencias'] = true;
          break;

        case 'notaEvolucion':
          await this.guardarNotaEvolucion();
          this.formularioEstado['notaEvolucion'] = true;
          break;

        case 'consentimiento':
          await this.guardarConsentimiento();
          this.formularioEstado['consentimiento'] = true;
          break;

        case 'notaPreoperatoria':
          await this.guardarNotaPreoperatoria();
          this.formularioEstado['notaPreoperatoria'] = true;
          break;

        case 'notaPostoperatoria':
          await this.guardarNotaPostoperatoria();
          this.formularioEstado['notaPostoperatoria'] = true;
          break;

        case 'notaPreanestesica':
          await this.guardarNotaPreanestesica();
          this.formularioEstado['notaPreanestesica'] = true;
          break;

        case 'notaPostanestesica':
          await this.guardarNotaPostanestesica();
          this.formularioEstado['notaPostanestesica'] = true;
          break;

        case 'notaInterconsulta':
          await this.guardarNotaInterconsulta();
          this.formularioEstado['notaInterconsulta'] = true;
          break;

        case 'controlCrecimiento':
          await this.guardarControlCrecimiento();
          this.formularioEstado['controlCrecimiento'] = true;
          break;

        case 'esquemaVacunacion':
          await this.guardarEsquemaVacunacion();
          this.formularioEstado['esquemaVacunacion'] = true;
          break;

        case 'solicitudEstudio':
          await this.guardarSolicitudEstudio();
          this.formularioEstado['solicitudEstudio'] = true;
          this.success = 'Solicitud de Estudio guardada correctamente';
          break;

        case 'referenciaTraslado':
          await this.guardarReferenciaTraslado();
          this.formularioEstado['referenciaTraslado'] = true;
          this.success = 'Referencia y Traslado guardado correctamente';
          break;

        case 'prescripcionMedicamento':
          await this.guardarPrescripcionMedicamento();
          this.formularioEstado['prescripcionMedicamento'] = true;
          this.success = 'Prescripción de Medicamentos guardada correctamente';
          break;

        case 'historiaClinicaPediatrica':
          await this.guardarHistoriaClinicaPediatrica();
          this.formularioEstado['historiaClinicaPediatrica'] = true;
          this.success = 'Historia Clínica Pediátrica guardada correctamente';
          break;

        // CASOS PEDIÁTRICOS
        case 'antecedentesHeredoFamiliares':
          await this.guardarAntecedentesHeredoFamiliares();
          this.formularioEstado['antecedentesHeredoFamiliares'] = true;
          this.success =
            'Antecedentes Heredo-Familiares guardados correctamente';
          break;

        case 'antecedentesPerinatales':
          await this.guardarAntecedentesPerinatales();
          this.formularioEstado['antecedentesPerinatales'] = true;
          this.success = 'Antecedentes Perinatales guardados correctamente';
          break;

        case 'desarrolloPsicomotriz':
          await this.guardarDesarrolloPsicomotriz();
          this.formularioEstado['desarrolloPsicomotriz'] = true;
          this.success = 'Desarrollo Psicomotriz guardado correctamente';
          break;

        case 'estadoNutricionalPediatrico':
          await this.guardarEstadoNutricionalPediatrico();
          this.formularioEstado['estadoNutricionalPediatrico'] = true;
          this.success = 'Estado Nutricional Pediátrico guardado correctamente';
          break;

        case 'inmunizaciones':
          await this.guardarInmunizaciones();
          this.formularioEstado['inmunizaciones'] = true;
          this.success = 'Inmunizaciones guardadas correctamente';
          break;

        case 'vacunasAdicionales':
          await this.guardarVacunasAdicionales();
          this.formularioEstado['vacunasAdicionales'] = true;
          this.success = 'Vacunas Adicionales guardadas correctamente';
          break;

        case 'alimentacionPediatrica':
          await this.guardarAlimentacionPediatrica();
          this.formularioEstado['alimentacionPediatrica'] = true;
          this.success = 'Alimentación Pediátrica guardada correctamente';
          break;

        case 'tamizajeNeonatal':
          await this.guardarTamizajeNeonatal();
          this.formularioEstado['tamizajeNeonatal'] = true;
          this.success = 'Tamizaje Neonatal guardado correctamente';
          break;

        default:
          throw new Error('Tipo de formulario no válido');
      }

      if (
        this.formularioActivo !== 'signosVitales' &&
        this.formularioActivo !== null
      ) {
        this.mostrarConfirmacionPDF(
          this.getTituloFormulario(this.formularioActivo)
        );
      }

      localStorage.removeItem(`perfil_paciente_${this.pacienteId}`);
      console.log('- Formulario completado:', this.formularioActivo);
      this.cargarDatosPaciente().subscribe((data) => {
        this.construirPacienteCompleto(data);
      });
    } catch (error: any) {
      console.error(
        `❌ Error al guardar ${this.formularioActivo ?? 'desconocido'}:`,
        error
      );
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

  // Método para guardar Control de Crecimiento
  private async guardarControlCrecimiento(): Promise<void> {
    if (this.controlCrecimientoForm.invalid) {
      this.marcarCamposInvalidos(this.controlCrecimientoForm);
      throw new Error('Por favor, complete todos los campos obligatorios');
    }

    const datosControl = this.prepararDatosControlCrecimiento();
    await firstValueFrom(this.controlCrecimientoService.create(datosControl));
  }

  // Método para guardar Esquema de Vacunación
  private async guardarEsquemaVacunacion(): Promise<void> {
    if (this.esquemaVacunacionForm.invalid) {
      this.marcarCamposInvalidos(this.esquemaVacunacionForm);
      throw new Error('Por favor, complete todos los campos obligatorios');
    }

    const datosVacunacion = this.prepararDatosEsquemaVacunacion();
    await firstValueFrom(
      this.esquemaVacunacionService.registrarVacuna(datosVacunacion)
    );
  }

  // 🔥 MÉTODOS DE GUARDADO FALTANTES
  private async guardarSolicitudEstudio(): Promise<void> {
    if (!this.solicitudEstudioForm.valid) {
      throw new Error('Formulario de solicitud de estudio inválido');
    }

    const tipoSolicitud = this.tiposDocumentosDisponibles.find(
      (t) => t.nombre === 'Solicitud de Estudio'
    );
    if (!tipoSolicitud) {
      throw new Error(
        'Tipo de documento de solicitud de estudio no encontrado'
      );
    }

    const documentoSolicitud = await this.crearDocumentoEspecifico(
      tipoSolicitud.id_tipo_documento
    );

    const solicitudData = {
      id_documento: documentoSolicitud.id_documento,
      ...this.solicitudEstudioForm.value,
    };

    await firstValueFrom(
      this.solicitudesEstudioService.createSolicitud(solicitudData)
    );
  }

  private async guardarReferenciaTraslado(): Promise<void> {
    if (!this.referenciaForm.valid) {
      throw new Error('Formulario de referencia y traslado inválido');
    }

    const tipoReferencia = this.tiposDocumentosDisponibles.find(
      (t) => t.nombre === 'Referencia y Traslado'
    );
    if (!tipoReferencia) {
      throw new Error('Tipo de documento de referencia no encontrado');
    }

    const documentoReferencia = await this.crearDocumentoEspecifico(
      tipoReferencia.id_tipo_documento
    );

    const referenciaData = {
      id_documento: documentoReferencia.id_documento,
      ...this.referenciaForm.value,
    };

    await firstValueFrom(
      this.referenciasTrasladoService.createReferencia(referenciaData)
    );
  }

  private async guardarPrescripcionMedicamento(): Promise<void> {
    if (!this.prescripcionForm.valid) {
      throw new Error('Formulario de prescripción de medicamentos inválido');
    }

    const tipoPrescripcion = this.tiposDocumentosDisponibles.find(
      (t) => t.nombre === 'Prescripción de Medicamentos'
    );
    if (!tipoPrescripcion) {
      throw new Error('Tipo de documento de prescripción no encontrado');
    }

    const documentoPrescripcion = await this.crearDocumentoEspecifico(
      tipoPrescripcion.id_tipo_documento
    );

    const prescripcionData = {
      id_documento: documentoPrescripcion.id_documento,
      ...this.prescripcionForm.value,
    };

    await firstValueFrom(
      this.prescripcionesMedicamentoService.createPrescripcion(prescripcionData)
    );
  }

  // Método para guardar Historia Clínica Pediátrica
  private async guardarHistoriaClinicaPediatrica(): Promise<void> {
    if (this.historiaClinicaPediatricaForm.invalid) {
      this.marcarCamposInvalidos(this.historiaClinicaPediatricaForm);
      throw new Error('Por favor, complete todos los campos obligatorios');
    }

    const datosHistoria = {
      ...this.historiaClinicaPediatricaForm.value,
      id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
      fecha_elaboracion: new Date().toISOString(),
    };

    await firstValueFrom(
      this.historiasClinicasService.createHistoriaClinica(datosHistoria)
    );
  }

  // Métodos de guardado pediátricos
  private async guardarAntecedentesHeredoFamiliares(): Promise<void> {
    if (this.antecedentesHeredoFamiliaresForm.invalid) {
      this.marcarCamposInvalidos(this.antecedentesHeredoFamiliaresForm);
      throw new Error('Por favor, complete todos los campos obligatorios');
    }

    const datosAntecedentes = this.prepararDatosAntecedentesHeredoFamiliares();
    await firstValueFrom(
      this.antecedentesHeredoFamiliaresService.crear(datosAntecedentes)
    );
  }

  private async guardarAntecedentesPerinatales(): Promise<void> {
    if (this.antecedentesPerinatalesForm.invalid) {
      this.marcarCamposInvalidos(this.antecedentesPerinatalesForm);
      throw new Error('Por favor, complete todos los campos obligatorios');
    }

    const datosAntecedentes = this.prepararDatosAntecedentesPerinatales();
    await firstValueFrom(
      this.antecedentesPerinatalesService.crear(datosAntecedentes)
    );
  }

  private async guardarDesarrolloPsicomotriz(): Promise<void> {
    if (this.desarrolloPsicomotrizForm.invalid) {
      this.marcarCamposInvalidos(this.desarrolloPsicomotrizForm);
      throw new Error('Por favor, complete todos los campos obligatorios');
    }

    const datosDesarrollo = this.prepararDatosDesarrolloPsicomotriz();
    await firstValueFrom(
      this.desarrolloPsicomotrizService.crear(datosDesarrollo)
    );
  }

  private async guardarEstadoNutricionalPediatrico(): Promise<void> {
    if (this.estadoNutricionalPediatricoForm.invalid) {
      this.marcarCamposInvalidos(this.estadoNutricionalPediatricoForm);
      throw new Error('Por favor, complete todos los campos obligatorios');
    }

    const datosNutricional = this.prepararDatosEstadoNutricionalPediatrico();
    await firstValueFrom(
      this.estadoNutricionalPediatricoService.crear(datosNutricional)
    );
  }

  private async guardarInmunizaciones(): Promise<void> {
    if (this.inmunizacionesForm.invalid) {
      this.marcarCamposInvalidos(this.inmunizacionesForm);
      throw new Error('Por favor, complete todos los campos obligatorios');
    }

    const datosInmunizaciones = this.prepararDatosInmunizaciones();
    await firstValueFrom(this.inmunizacionesService.crear(datosInmunizaciones));
  }

  private async guardarVacunasAdicionales(): Promise<void> {
    if (this.vacunasAdicionalesForm.invalid) {
      this.marcarCamposInvalidos(this.vacunasAdicionalesForm);
      throw new Error('Por favor, complete todos los campos obligatorios');
    }

    const datosVacunas = this.prepararDatosVacunasAdicionales();
    await firstValueFrom(this.vacunasAdicionalesService.agregar(datosVacunas));
  }

  // Método faltante para Alimentación Pediátrica
private async guardarAlimentacionPediatrica(): Promise<void> {
  if (this.alimentacionPediatricaForm.invalid) {
    this.marcarCamposInvalidos(this.alimentacionPediatricaForm);
    throw new Error('Por favor, complete todos los campos obligatorios');
  }

  const datosAlimentacion = {
    ...this.alimentacionPediatricaForm.value,
    id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
    id_personal_registro: this.medicoActual,
    id_paciente: this.pacienteId,
    fecha_evaluacion: new Date().toISOString().split('T')[0],
  };

  // Nota: Necesitarás crear el servicio correspondiente
  console.log('Datos de alimentación pediátrica preparados:', datosAlimentacion);
}


  // Método faltante para Tamizaje Neonatal
private async guardarTamizajeNeonatal(): Promise<void> {
  if (this.tamizajeNeonatalForm.invalid) {
    this.marcarCamposInvalidos(this.tamizajeNeonatalForm);
    throw new Error('Por favor, complete todos los campos obligatorios');
  }

  const datosTamizaje = {
    ...this.tamizajeNeonatalForm.value,
    id_expediente: this.pacienteCompleto?.expediente?.id_expediente,
    id_personal_registro: this.medicoActual,
    id_paciente: this.pacienteId,
  };

  // Nota: Necesitarás crear el servicio correspondiente
  console.log('Datos de tamizaje neonatal preparados:', datosTamizaje);
}

  private async guardarConsentimiento(): Promise<void> {
    console.log('🔄 Guardando consentimiento informado...');

    if (!this.consentimientoForm.valid) {
      console.error('❌ Formulario de consentimiento informado inválido');
      console.log('🔍 Errores del formulario:', this.consentimientoForm.errors);
      throw new Error('Formulario de consentimiento informado inválido');
    }

    // ✅ PASO 1: Buscar el tipo de documento de consentimiento informado
    const tipoConsentimiento = this.tiposDocumentosDisponibles.find(
      (t) =>
        t.nombre === 'Consentimiento Informado' ||
        t.nombre === 'Consentimientos Informados' ||
        t.nombre.toLowerCase().includes('consentimiento')
    );

    if (!tipoConsentimiento) {
      console.error('❌ Tipo de documento de consentimiento no encontrado');
      console.log(
        '🔍 Tipos disponibles:',
        this.tiposDocumentosDisponibles.map((t) => t.nombre)
      );
      throw new Error(
        'Tipo de documento de consentimiento informado no encontrado'
      );
    }

    console.log('✅ Tipo de documento encontrado:', tipoConsentimiento);

    // ✅ PASO 2: Crear el documento específico
    const documentoConsentimiento = await this.crearDocumentoEspecifico(
      tipoConsentimiento.id_tipo_documento
    );

    console.log('✅ Documento específico creado:', documentoConsentimiento);

    // ✅ PASO 3: Crear el consentimiento informado con el id_documento
    const consentimientoData = {
      id_documento: documentoConsentimiento.id_documento,
      tipo_consentimiento:
        this.consentimientoForm.value.tipo_consentimiento || 'General',
      procedimiento_autorizado:
        this.consentimientoForm.value.procedimiento_autorizado || '',
      riesgos_explicados:
        this.consentimientoForm.value.riesgos_explicados || '',
      alternativas_explicadas:
        this.consentimientoForm.value.alternativas_explicadas || '',
      autorizacion_procedimientos:
        this.consentimientoForm.value.autorizacion_procedimientos || false,
      autorizacion_anestesia:
        this.consentimientoForm.value.autorizacion_anestesia || false,
      firma_paciente: this.consentimientoForm.value.firma_paciente || false,
      firma_responsable:
        this.consentimientoForm.value.firma_responsable || false,
      nombre_responsable:
        this.consentimientoForm.value.nombre_responsable || '',
      parentesco_responsable:
        this.consentimientoForm.value.parentesco_responsable || '',
      testigos: this.consentimientoForm.value.testigos || [],
      fecha_consentimiento:
        this.consentimientoForm.value.fecha_consentimiento ||
        new Date().toISOString(),
    };

    console.log('🚀 Datos del consentimiento a enviar:', consentimientoData);
    console.log('🔍 Campos verificados:');
    console.log('  - id_documento:', consentimientoData.id_documento);
    console.log(
      '  - tipo_consentimiento:',
      consentimientoData.tipo_consentimiento
    );
    console.log(
      '  - procedimiento_autorizado:',
      consentimientoData.procedimiento_autorizado
    );
    console.log(
      '  - riesgos_explicados:',
      consentimientoData.riesgos_explicados
    );

    try {
      const response = await firstValueFrom(
        this.consentimientosService.createConsentimiento(consentimientoData)
      );
      console.log(
        '✅ Consentimiento informado guardado exitosamente:',
        response
      );
    } catch (error: any) {
      console.error('❌ Error al guardar consentimiento informado:', error);
      console.error('📋 Detalles del error:', {
        status: error?.status,
        message: error?.message,
        error: error?.error,
      });
      throw error;
    }
  }

  private async guardarNotaPreoperatoria(): Promise<void> {
    if (!this.notaPreoperatoriaForm.valid) {
      throw new Error('Formulario de nota preoperatoria inválido');
    }

    const payload = {
      ...this.notaPreoperatoriaForm.value,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
    };

    await firstValueFrom(
      this.notasPreoperatoriaService.createNotaPreoperatoria(payload)
    );
  }

  private async guardarNotaPostoperatoria(): Promise<void> {
    if (!this.notaPostoperatoriaForm.valid) {
      throw new Error('Formulario de nota postoperatoria inválido');
    }

    const payload = {
      ...this.notaPostoperatoriaForm.value,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
    };

    await firstValueFrom(
      this.notasPostoperatoriaService.createNotaPostoperatoria(payload)
    );
  }

  private async guardarNotaPreanestesica(): Promise<void> {
    if (!this.notaPreanestesicaForm.valid) {
      throw new Error('Formulario de nota preanestésica inválido');
    }

    const payload = {
      ...this.notaPreanestesicaForm.value,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
    };

    await firstValueFrom(
      this.notasPreanestesicaService.createNotaPreanestesica(payload)
    );
  }

  private async guardarNotaPostanestesica(): Promise<void> {
    if (!this.notaPostanestesicaForm.valid) {
      throw new Error('Formulario de nota postanestésica inválido');
    }

    const payload = {
      ...this.notaPostanestesicaForm.value,
      id_paciente: this.pacienteId,
      id_personal_medico: this.medicoActual,
    };

    await firstValueFrom(
      this.notasPostanestesicaService.createNotaPostanestesica(payload)
    );
  }

  async guardarNotaInterconsulta(): Promise<void> {
    if (!this.notaInterconsultaForm.valid) {
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }

    try {
      this.guardandoFormulario = true;
      this.error = null;

      const payload = {
        ...this.notaInterconsultaForm.value,
        id_paciente: this.pacienteId,
        id_personal_medico: this.medicoActual,
      };

      const response = await firstValueFrom(
        this.notasInterconsultaService.createNotaInterconsulta(payload)
      );

      this.formularioEstado.notaInterconsulta = true;
      this.success = 'Nota de interconsulta guardada correctamente';

      // Limpiar el mensaje de éxito después de 5 segundos
      setTimeout(() => {
        this.success = '';
      }, 5000);
    } catch (error) {
      console.error('Error al guardar nota de interconsulta:', error);
      this.error = 'Error al guardar la nota de interconsulta';
    } finally {
      this.guardandoFormulario = false;
    }
  }

  private avanzarAlSiguientePaso(): void {
    console.log(`- Formulario ${this.formularioActivo} completado`);
  }
  private getTituloFormulario(formulario: string): string {
    const titulos: { [key: string]: string } = {
      signosVitales: 'Signos Vitales',
      historiaClinica: this.esPacientePediatrico
        ? 'Historia Clínica Pediátrica'
        : 'Historia Clínica',
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
      // Nuevos documentos
      notaEgreso: 'Nota de Egreso',
      consentimientoProcedimientos: 'Consentimiento Procedimientos',
      consentimientoHospitalizacion: 'Consentimiento Hospitalización',
      consentimientoTransfusion: 'Consentimiento Transfusión',
      hojaAltaVoluntaria: 'Hoja Alta Voluntaria',
      hojaFrontalExpediente: 'Hoja Frontal Expediente',
      solicitudLaboratorio: 'Solicitud Laboratorio',
      solicitudImagenologia: 'Solicitud Imagenología',
      solicitudCultivo: 'Solicitud Cultivo',
      prescripcionMedicamentos: 'Prescripción Medicamentos',
      solicitudGasometria: 'Solicitud Gasometría',
    };
    return titulos[formulario] || formulario;
  }

  cambiarTab(tab: string): void {
    const tabsValidas: TabActiva[] = ['general', 'crear', 'historial', 'datos'];
    if (tabsValidas.includes(tab as TabActiva)) {
      this.tabActiva = tab as TabActiva;
    } else {
      console.warn(`Tab no válida: ${tab}`);
      this.tabActiva = 'general'; // fallback
    }
    if (this.tabActiva === 'historial') {
      this.cargarHistorialClinico();
    } else if (this.tabActiva === 'datos') {
      this.cargarDatosClinicosConsolidados();
    } else if (this.tabActiva === 'general') {
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

      // Reiniciar estado de todos los formularios (¡completo!)
      this.formularioEstado = {
        signosVitales: false,
        historiaClinica: false,
        notaUrgencias: false,
        notaEvolucion: false,
        consentimiento: false,
        notaPreoperatoria: false,
        notaPostoperatoria: false,
        notaPreanestesica: false,
        notaPostanestesica: false,
        notaInterconsulta: false,
        controlCrecimiento: false,
        esquemaVacunacion: false,
        solicitudEstudio: false,
        referenciaTraslado: false,
        prescripcionMedicamento: false,
        registroTransfusion: false,
        notaEgreso: false,
        historiaClinicaPediatrica: false,
        desarrolloPsicomotriz: false,
        alimentacionPediatrica: false,
        tamizajeNeonatal: false,
        antecedentesHeredoFamiliares: false,
        antecedentesPerinatales: false,
        estadoNutricionalPediatrico: false,
        inmunizaciones: false,
        vacunasAdicionales: false,
        solicitudCultivo: false,
        solicitudGasometria: false,
        hojaFrontal: false,
        altaVoluntaria: false,
      };

      setTimeout(() => {
        this.success = null;
      }, 3000);
    }
  }

  private cargarHistorialClinico(): void {
    // Cargar timeline de documentos
    this.timelineDocumentos = this.documentosDisponibles.map((doc) => ({
      titulo: doc.nombre || 'Documento Clínico',
      fecha: new Date().toISOString(),
      descripcion: `Documento tipo ${doc.nombre}`,
      icono: doc.icono,
      color: doc.color,
      estado: 'Activo',
    }));

    this.historialInternamientos = [
      // Aquí irían los datos reales de internamientos
      // Por ahora dejamos array vacío
    ];
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
    // Obtener documentos reales ordenados por fecha
    const documentosReales = this.pacienteCompleto?.documentos || [];
    const documentosRecientes = documentosReales
      .sort((a: any, b: any) => {
        const fechaA = new Date(a.fecha_elaboracion || a.created_at || 0);
        const fechaB = new Date(b.fecha_elaboracion || b.created_at || 0);
        return fechaB.getTime() - fechaA.getTime();
      })
      .slice(0, 5);

    // Obtener signos vitales ordenados por fecha
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

    console.log('📊 Resumen general cargado:', this.resumenGeneral);
  }

  // Método para refrescar la vista general
  refrescarVistaGeneral(): void {
    console.log('🔄 Refrescando vista general...');
    this.cargarResumenGeneral();
  }

  // Método para obtener estado de salud general
  getEstadoSaludGeneral(): {
    nivel: 'critico' | 'precaucion' | 'normal';
    mensaje: string;
  } {
    const alertas: string[] = this.resumenGeneral?.alertasMedicas || [];

    // 🔧 Verificar alertas críticas
    const tieneAlertaCritica = alertas.some(
      (alerta: string) =>
        alerta.toLowerCase().includes('crítica') ||
        alerta.toLowerCase().includes('critica') ||
        alerta.toLowerCase().includes('hipotermia') ||
        alerta.toLowerCase().includes('hipoxemia')
    );

    if (tieneAlertaCritica) {
      return {
        nivel: 'critico',
        mensaje: 'Requiere atención médica inmediata',
      };
    }

    if (alertas.length > 0) {
      return { nivel: 'precaucion', mensaje: 'Requiere monitoreo médico' };
    }

    return {
      nivel: 'normal',
      mensaje: 'Signos vitales dentro de parámetros normales',
    };
  }

  private extraerAlergias(): string[] {
    const alergias: string[] = [];
    return alergias;
  }

  private extraerMedicamentos(): any[] {
    return [];
  }

  private extraerDiagnosticos(): any[] {
    return [];
  }

  private extraerAntecedentes(): any[] {
    return [];
  }

  private identificarAlertasMedicas(alerta?: any): string[] {
    const alertas: string[] = [];
    const ultimosSignos = this.signosVitalesDisponibles[0];

    if (ultimosSignos) {
      // Alertas de temperatura
      if (ultimosSignos.temperatura) {
        if (ultimosSignos.temperatura > 38.5) {
          alertas.push('🌡️ Fiebre alta (>38.5°C)');
        } else if (ultimosSignos.temperatura < 35) {
          alertas.push('🌡️ Hipotermia (<35°C)');
        }
      }

      // Alertas de presión arterial
      if (
        ultimosSignos.presion_arterial_sistolica &&
        ultimosSignos.presion_arterial_diastolica
      ) {
        if (
          ultimosSignos.presion_arterial_sistolica > 140 ||
          ultimosSignos.presion_arterial_diastolica > 90
        ) {
          alertas.push('   Hipertensión arterial');
        } else if (
          ultimosSignos.presion_arterial_sistolica < 90 ||
          ultimosSignos.presion_arterial_diastolica < 60
        ) {
          alertas.push('   Hipotensión arterial');
        }
      }

      // Alertas de frecuencia cardíaca
      if (ultimosSignos.frecuencia_cardiaca) {
        if (ultimosSignos.frecuencia_cardiaca > 100) {
          alertas.push('  Taquicardia (>100 lpm)');
        } else if (ultimosSignos.frecuencia_cardiaca < 60) {
          alertas.push('  Bradicardia (<60 lpm)');
        }
      }

      // Alertas de saturación de oxígeno
      if (ultimosSignos.saturacion_oxigeno) {
        if (ultimosSignos.saturacion_oxigeno < 90) {
          alertas.push('🫁 Hipoxemia crítica (<90%)');
        } else if (ultimosSignos.saturacion_oxigeno < 95) {
          alertas.push('🫁 Saturación baja (<95%)');
        }
      }

      // Alertas de frecuencia respiratoria
      if (ultimosSignos.frecuencia_respiratoria) {
        if (ultimosSignos.frecuencia_respiratoria > 24) {
          alertas.push('🫁 Taquipnea (>24 rpm)');
        } else if (ultimosSignos.frecuencia_respiratoria < 12) {
          alertas.push('🫁 Bradipnea (<12 rpm)');
        }
      }
    }

    // Verificar si hay signos vitales recientes
    const ahora = new Date();
    const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
    const signosRecientes = this.signosVitalesDisponibles.filter((signo) => {
      const fechaSigno = new Date(signo.fecha_toma || signo.created_at || 0);
      return fechaSigno > hace24Horas;
    });

    if (signosRecientes.length === 0) {
      alertas.push('  Sin signos vitales en las últimas 24 horas');
    }

    return alertas;
  }

  cambiarFormulario(tipoFormulario: string): void {
    if (this.formularioActivo === tipoFormulario) return;

  if (!this.puedeAccederFormulario(tipoFormulario)) {
    this.mostrarMensajeValidacion(tipoFormulario);
    return;
  }
    console.log(
      `Cambiando formulario de ${this.formularioActivo} a ${tipoFormulario}`
    );
    const formulariosValidos: FormularioActivo[] = [
      'signosVitales',
      'historiaClinica',
      'notaUrgencias',
      'notaEvolucion',
      'consentimiento',
      'notaPreoperatoria',
      'notaPostoperatoria',
      'notaPreanestesica',
      'notaPostanestesica',
      'notaInterconsulta',
      'controlCrecimiento',
      'esquemaVacunacion',
      'solicitudEstudio',
      'referenciaTraslado',
      'prescripcionMedicamento',
      'solicitudCultivo',
      'solicitudGasometria',
      'hojaFrontal',
      'altaVoluntaria',
    ];

    if (formulariosValidos.includes(tipoFormulario as FormularioActivo)) {
      this.error = null;
      this.success = null;
      this.formularioActivo = tipoFormulario as FormularioActivo;
    } else {
      console.warn(`Formulario no válido: ${tipoFormulario}`);
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
  setTimeout(() => {
    this.error = null;
  }, 5000);
}

   puedeAccederFormulario(formulario: string): boolean {
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
    if (this.formularioActivo === null) {
      this.error = 'No hay un formulario activo para resetear.';
      return;
    }

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
        case 'consentimiento':
          this.consentimientoForm.reset();
          break;
        case 'notaPreoperatoria':
          this.notaPreoperatoriaForm.reset();
          break;
        case 'notaPostoperatoria':
          this.notaPostoperatoriaForm.reset();
          break;
        case 'notaPreanestesica':
          this.notaPreanestesicaForm.reset();
          break;
        case 'notaPostanestesica':
          this.notaPostanestesicaForm.reset();
          break;
        case 'notaInterconsulta':
          this.notaInterconsultaForm.reset();
          break;
        case 'controlCrecimiento':
          this.controlCrecimientoForm.reset();
          break;
        case 'esquemaVacunacion':
          this.esquemaVacunacionForm.reset();
          break;
        default:
          console.warn(`Formulario no reconocido: ${this.formularioActivo}`);
          return;
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
      '  Estado del documentoClinicoActual:',
      this.documentoClinicoActual
    );
    console.log('  Estado de formularios:', this.formularioEstado);

    if (!this.documentoClinicoActual) {
      if (
        this.signosVitalesDisponibles &&
        this.signosVitalesDisponibles.length > 0
      ) {
        const ultimoSigno = this.signosVitalesDisponibles[0];
        if (ultimoSigno.id_documento) {
          this.documentoClinicoActual = ultimoSigno.id_documento;
          console.log(
            '- Documento clínico obtenido de signos vitales:',
            this.documentoClinicoActual
          );
        }
      }

      if (!this.documentoClinicoActual) {
        console.log('🔄 Creando nuevo documento clínico padre...');
        await this.crearDocumentoClinicoPadre();
      }
    }

    const historiaData: CreateHistoriaClinicaDto = {
      id_documento: this.documentoClinicoActual!,
      id_guia_diagnostico:
        this.historiaClinicaForm.value.id_guia_diagnostico || null,
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

      console.log('- Historia clínica guardada exitosamente:', response);
    } catch (error: any) {
      console.error('❌ Error al guardar historia clínica:', error);
      if (error?.status === 409) {
        console.log('  Historia clínica ya existe para este documento');
        console.log('ℹ️ El documento ya tiene una historia clínica asociada');
        return;
      } else if (error?.status === 400) {
        console.error(
          '❌ Error de validación en el servidor:',
          error.error?.message
        );
        throw new Error(
          `Error de validación: ${error.error?.message || 'Datos inválidos'}`
        );
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
        console.error('❌ Error desconocido:', error);
        throw new Error(
          `Error inesperado: ${error?.message || 'Error desconocido'}`
        );
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
      id_guia_diagnostico:
        this.notaUrgenciasForm.value.id_guia_diagnostico || null,
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
    console.log('- Nota de urgencias guardada:', response);
  }

  private async guardarNotaEvolucion(): Promise<void> {
    if (!this.notaEvolucionForm.valid) {
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
    const notaData: CreateNotaEvolucionDto = {
      id_documento: documentoEvolucion.id_documento,
      id_guia_diagnostico:
        this.notaEvolucionForm.value.id_guia_diagnostico || null,
      dias_hospitalizacion:
        this.notaEvolucionForm.value.dias_hospitalizacion || null,
      fecha_ultimo_ingreso:
        this.notaEvolucionForm.value.fecha_ultimo_ingreso || null,
      temperatura: this.notaEvolucionForm.value.temperatura || null,
      frecuencia_cardiaca:
        this.notaEvolucionForm.value.frecuencia_cardiaca || null,
      frecuencia_respiratoria:
        this.notaEvolucionForm.value.frecuencia_respiratoria || null,
      presion_arterial_sistolica:
        this.notaEvolucionForm.value.presion_arterial_sistolica || null,
      presion_arterial_diastolica:
        this.notaEvolucionForm.value.presion_arterial_diastolica || null,
      saturacion_oxigeno:
        this.notaEvolucionForm.value.saturacion_oxigeno || null,
      peso_actual: this.notaEvolucionForm.value.peso_actual || null,
      talla_actual: this.notaEvolucionForm.value.talla_actual || null,
      sintomas_signos: this.notaEvolucionForm.value.sintomas_signos,
      habitus_exterior: this.notaEvolucionForm.value.habitus_exterior,
      estado_nutricional: this.notaEvolucionForm.value.estado_nutricional,
      estudios_laboratorio_gabinete:
        this.notaEvolucionForm.value.estudios_laboratorio_gabinete,
      evolucion_analisis: this.notaEvolucionForm.value.evolucion_analisis,
      diagnosticos: this.notaEvolucionForm.value.diagnosticos,
      plan_estudios_tratamiento:
        this.notaEvolucionForm.value.plan_estudios_tratamiento,
      pronostico: this.notaEvolucionForm.value.pronostico,
      exploracion_cabeza: this.notaEvolucionForm.value.exploracion_cabeza || '',
      exploracion_cuello: this.notaEvolucionForm.value.exploracion_cuello || '',
      exploracion_torax: this.notaEvolucionForm.value.exploracion_torax || '',
      exploracion_abdomen:
        this.notaEvolucionForm.value.exploracion_abdomen || '',
      exploracion_extremidades:
        this.notaEvolucionForm.value.exploracion_extremidades || '',
      exploracion_columna:
        this.notaEvolucionForm.value.exploracion_columna || '',
      exploracion_genitales:
        this.notaEvolucionForm.value.exploracion_genitales || '',
      exploracion_neurologico:
        this.notaEvolucionForm.value.exploracion_neurologico || '',
      diagnosticos_guias: this.notaEvolucionForm.value.diagnosticos_guias || '',
      interconsultas:
        this.notaEvolucionForm.value.interconsultas ||
        'No se solicitaron interconsultas',
      indicaciones_medicas:
        this.notaEvolucionForm.value.indicaciones_medicas || '',
      observaciones_adicionales:
        this.notaEvolucionForm.value.observaciones_adicionales || '',
    };

    console.log('- Enviando nota de evolución completa al backend:', notaData);

    const response = await firstValueFrom(
      this.notaEvolucionService.createNotaEvolucion(notaData)
    );

    console.log('- Nota de evolución guardada exitosamente:', response);
  }

  private validarFormularioNOM004(): string[] {
    const errores: string[] = [];
    const form = this.notaEvolucionForm;

    CAMPOS_OBLIGATORIOS_NOM004.forEach((campo) => {
      if (campo === 'id_documento') return;

      const control = form.get(campo);
      if (
        !control?.value ||
        (typeof control.value === 'string' && control.value.trim() === '')
      ) {
        errores.push(`${campo.replace('_', ' ')} es obligatorio según NOM-004`);
      }
    });

    const camposConLongitud = [
      { campo: 'sintomas_signos', minimo: 10 },
      { campo: 'evolucion_analisis', minimo: 10 },
      { campo: 'diagnosticos', minimo: 10 },
      { campo: 'plan_estudios_tratamiento', minimo: 10 },
    ];

    camposConLongitud.forEach(({ campo, minimo }) => {
      const valor = form.get(campo)?.value;
      if (valor && valor.length < minimo) {
        errores.push(
          `${campo.replace('_', ' ')} debe tener al menos ${minimo} caracteres`
        );
      }
    });

    return errores;
  }

  private validarDatosNOM004(): {
    valido: boolean;
    errores: string[];
    advertencias: string[];
  } {
    const datos = this.notaEvolucionForm.value;

    return this.notaEvolucionService.validarDatosNOM004(datos);
  }

  async generarPDFInterconsulta(): Promise<void> {
    try {
      if (!this.formularioEstado.notaInterconsulta) {
        this.error =
          'Debe guardar la nota de interconsulta antes de generar el PDF';
        return;
      }
      await this.generarPDF('Nota de Interconsulta');
    } catch (error) {
      console.error('Error al generar PDF de interconsulta:', error);
      this.error = 'Error al generar PDF de interconsulta';
    }
  }

  limpiarFormulario(tipoFormulario: string): void {
    switch (tipoFormulario) {
      case 'notaInterconsulta':
        this.notaInterconsultaForm.reset();
        this.notaInterconsultaForm.patchValue({
          prioridad: 'media',
          examenes_laboratorio: false,
          examenes_gabinete: false,
        });
        this.formularioEstado.notaInterconsulta = false;
        break;

      case 'solicitudCultivo':
        this.solicitudCultivoForm.reset();
        this.solicitudCultivoForm.patchValue({
          prioridad: 'Normal',
          antibioticos_previos: false,
          fecha_solicitud: new Date().toISOString().split('T')[0],
        });
        this.formularioEstado.solicitudCultivo = false;
        break;

      case 'solicitudGasometria':
        this.solicitudGasometriaForm.reset();
        this.solicitudGasometriaForm.patchValue({
          fio2: 21,
          soporte_ventilatorio: 'Aire ambiente',
          prioridad: 'Normal',
          fecha_solicitud: new Date().toISOString().split('T')[0],
        });
        this.formularioEstado.solicitudGasometria = false;
        break;

      case 'registroTransfusion':
        this.registroTransfusionForm.reset();
        this.registroTransfusionForm.patchValue({
          presenta_reacciones: false,
        });
        this.formularioEstado.registroTransfusion = false;
        break;

      case 'altaVoluntaria':
        this.altaVoluntariaForm.reset();
        this.altaVoluntariaForm.patchValue({
          continua_tratamiento_externo: false,
        });
        this.formularioEstado.altaVoluntaria = false;
        break;

      default:
        console.warn(
          'Tipo de formulario no reconocido para limpiar:',
          tipoFormulario
        );
    }
  }

  async generarPDF(tipoDocumento: string): Promise<void> {
    try {
      console.log(`- Generando PDF para: ${tipoDocumento}`);
      this.isCreatingDocument = true;
      const medicoCompleto = await this.obtenerDatosMedicoCompleto();
      // const datosPacienteEstructurados = {
      //   ...this.pacienteCompleto,
      //   persona: this.pacienteCompleto?.persona || this.pacienteCompleto,
      //   expediente: this.pacienteCompleto?.expediente,
      //   signosVitalesDisponibles: this.pacienteCompleto?.signosVitales || [],
      // };
    const datosPacienteEstructurados = this.extraerDatosPaciente();
      console.log(
        '📋 Datos del paciente estructurados:',
        datosPacienteEstructurados
      );
      console.log(
        '🩺 Signos vitales del formulario:',
        this.signosVitalesForm.value
      );
      console.log(
        '📖 Guía clínica seleccionada:',
        this.guiaClinicaSeleccionada
      );
      // ✅ DEBUG: Verificar que el tipo de sangre esté presente
    console.log('🩸 Tipo de sangre del paciente:', datosPacienteEstructurados.tipo_sangre);
    console.log('📋 Datos completos del paciente:', datosPacienteEstructurados);
    console.log('🏠 Domicilio del paciente:', datosPacienteEstructurados.domicilio);
    console.log('📋 Estructura persona:', this.pacienteCompleto?.persona);
      switch (tipoDocumento) {
        case 'Historia Clínica':
          await this.pdfGeneratorService.generarHistoriaClinica({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            historiaClinica: {
              ...this.historiaClinicaForm.value,
              // - ACCESO CORRECTO A LUGAR DE NACIMIENTO
              lugar_nacimiento: this.extraerLugarNacimiento(),
            },
            signosVitales: this.signosVitalesForm.value,
            guiaClinica: this.guiaClinicaSeleccionada,
          });
          break;

        case 'Nota de Evolución':
          await this.pdfGeneratorService.generarNotaEvolucion({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            notaEvolucion: this.notaEvolucionForm.value,
            signosVitales: this.signosVitalesForm.value,
            guiaClinica: this.guiaClinicaSeleccionada,
          });
          break;

        case 'Nota de Urgencias':
          await this.pdfGeneratorService.generarNotaUrgencias({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            notaUrgencias: this.notaUrgenciasForm.value,
            signosVitales: this.signosVitalesForm.value,
            guiaClinica: this.guiaClinicaSeleccionada,
          });
          break;

        case 'Signos Vitales':
          await this.pdfGeneratorService.generarSignosVitales({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            signosVitales: {
              ...this.signosVitalesForm.value,
              observaciones:
                this.signosVitalesForm.value.observaciones ||
                'Sin observaciones específicas. Paciente estable.',
            },
          });
          break;

        case 'Nota de Egreso':
          await this.pdfGeneratorService.generarNotaEgreso({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            notaEgreso: {}, // No hay formulario específico de egreso implementado aún
            signosVitales: this.signosVitalesForm.value,
            guiaClinica: this.guiaClinicaSeleccionada,
          });
          break;

        case 'Nota Preoperatoria':
          await this.pdfGeneratorService.generarNotaPreoperatoria({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            notaPreoperatoria: this.notaPreoperatoriaForm?.value || {},
            signosVitales: this.signosVitalesForm.value,
            guiaClinica: this.guiaClinicaSeleccionada,
          });
          break;

        case 'Nota Postoperatoria':
          await this.pdfGeneratorService.generarNotaPostoperatoria({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            notaPostoperatoria: this.notaPostoperatoriaForm?.value || {},
            signosVitales: this.signosVitalesForm.value,
            guiaClinica: this.guiaClinicaSeleccionada,
          });
          break;

        case 'Nota Preanestésica':
          await this.pdfGeneratorService.generarNotaPreanestesica({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            notaPreanestesica: this.notaPreanestesicaForm?.value || {},
            signosVitales: this.signosVitalesForm.value,
            guiaClinica: this.guiaClinicaSeleccionada,
          });
          break;

        case 'Nota Postanestésica':
          await this.pdfGeneratorService.generarNotaPostanestesica({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            notaPostanestesica: this.notaPostanestesicaForm?.value || {},
            signosVitales: this.signosVitalesForm.value,
            guiaClinica: this.guiaClinicaSeleccionada,
          });
          break;

        // Consentimientos Informados
        case 'Consentimiento Procedimientos':
          await this.pdfGeneratorService.generarNotaConsentimientoProcedimientos(
            {
              paciente: datosPacienteEstructurados,
              medico: medicoCompleto,
              expediente: this.pacienteCompleto?.expediente,
              consentimiento: this.consentimientoForm?.value || {},
            }
          );
          break;

        case 'Consentimiento Hospitalización':
          await this.pdfGeneratorService.generarConsentimientoHospitalizacion({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            consentimiento: this.consentimientoForm?.value || {},
          });
          break;

        case 'Consentimiento Referencia':
          await this.pdfGeneratorService.generarConsentimientoReferenciaPacientes(
            {
              paciente: datosPacienteEstructurados,
              medico: medicoCompleto,
              expediente: this.pacienteCompleto?.expediente,
              consentimiento: this.consentimientoForm?.value || {},
            }
          );
          break;

        case 'Consentimiento Transfusión':
          await this.pdfGeneratorService.generarConsentimientoTransfusionSanguinea(
            {
              paciente: datosPacienteEstructurados,
              medico: medicoCompleto,
              expediente: this.pacienteCompleto?.expediente,
              consentimiento: this.consentimientoForm?.value || {},
            }
          );
          break;

        case 'Consentimiento Tratamiento':
          await this.pdfGeneratorService.generarConsentimientoTratamientoMedico(
            {
              paciente: datosPacienteEstructurados,
              medico: medicoCompleto,
              expediente: this.pacienteCompleto?.expediente,
              consentimiento: this.consentimientoForm?.value || {},
            }
          );
          break;

        // Hojas y Documentos Especiales
        case 'Hoja Alta Voluntaria':
          await this.pdfGeneratorService.generarHojaAltaVoluntaria({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            altaVoluntaria: {}, // Se pueden agregar datos específicos
          });
          break;

        case 'Hoja Frontal Expediente':
          await this.pdfGeneratorService.generarHojaFrontalExpediente({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            hojaFrontal: {}, // Se pueden agregar datos específicos
          });
          break;

        // Solicitudes de Estudios
        case 'Solicitud Laboratorio':
          await this.pdfGeneratorService.generarSolicitudLaboratorio({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            solicitud: this.solicitudEstudioForm?.value || {},
          });
          break;

        case 'Solicitud Imagenología':
          await this.pdfGeneratorService.generarSolicitudImagenologia({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            solicitud: this.solicitudEstudioForm?.value || {},
          });
          break;

        case 'Solicitud Cultivo':
          await this.pdfGeneratorService.generarSolicitudCultivo({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            solicitud: this.solicitudEstudioForm?.value || {},
          });
          break;

        // Prescripciones y Referencias
        case 'Prescripción Medicamentos':
          await this.pdfGeneratorService.generarPrescripcionMedicamentos({
            paciente: datosPacienteEstructurados,
            medico: medicoCompleto,
            expediente: this.pacienteCompleto?.expediente,
            prescripcion: this.prescripcionForm?.value || {},
          });
          break;

        case 'Referencia Traslado':
          await this.pdfGeneratorService.generarDocumentoPDF(
            'Referencia Traslado',
            {
              paciente: datosPacienteEstructurados,
              medico: medicoCompleto,
              expediente: this.pacienteCompleto?.expediente,
              referencia: this.referenciaForm?.value || {},
            }
          );
          break;

        // Documentos Pediátricos
        case 'Control Crecimiento':
          await this.pdfGeneratorService.generarDocumentoPDF(
            'Control Crecimiento',
            {
              paciente: datosPacienteEstructurados,
              medico: medicoCompleto,
              expediente: this.pacienteCompleto?.expediente,
              control: this.controlCrecimientoForm?.value || {},
              signosVitales: this.signosVitalesForm.value,
            }
          );
          break;

        case 'Esquema Vacunación':
          await this.pdfGeneratorService.generarDocumentoPDF(
            'Esquema Vacunación',
            {
              paciente: datosPacienteEstructurados,
              medico: medicoCompleto,
              expediente: this.pacienteCompleto?.expediente,
              esquema: this.esquemaVacunacionForm?.value || {},
            }
          );
          break;

        // Solicitudes Especiales
        case 'Solicitud Gasometría':
          await this.pdfGeneratorService.generarDocumentoPDF(
            'Solicitud Gasometría',
            {
              paciente: datosPacienteEstructurados,
              medico: medicoCompleto,
              expediente: this.pacienteCompleto?.expediente,
              solicitud: this.solicitudEstudioForm?.value || {},
            }
          );
          break;

        // Consentimiento Informado genérico
        case 'Consentimiento Informado':
          await this.pdfGeneratorService.generarDocumentoPDF(
            'Consentimiento Tratamiento',
            {
              paciente: datosPacienteEstructurados,
              medico: medicoCompleto,
              expediente: this.pacienteCompleto?.expediente,
              consentimientoTratamiento: this.consentimientoForm?.value || {},
            }
          );
          break;

        // Nota de Interconsulta (NOM-004)
        case 'Nota de Interconsulta':
          await this.pdfGeneratorService.generarDocumentoPDF(
            'Nota Interconsulta',
            {
              paciente: datosPacienteEstructurados,
              medico: medicoCompleto,
              expediente: this.pacienteCompleto?.expediente,
              interconsulta: this.notaInterconsultaForm?.value || {},
              signosVitales: this.signosVitalesForm.value,
            }
          );
          break;

        default:
          console.warn('Tipo de documento no soportado:', tipoDocumento);
          throw new Error(`Tipo de documento "${tipoDocumento}" no es válido`);
      }

      this.success = `PDF de ${tipoDocumento} generado exitosamente`;
      console.log(`PDF de ${tipoDocumento} creado correctamente`);
      setTimeout(() => {
        this.success = '';
      }, 5000);
    } catch (error) {
      console.error(' Error al generar PDF:', error);
      if (error instanceof Error) {
        this.error = `Error al generar PDF: ${error.message}`;
      } else {
        this.error = 'Error al generar el PDF. Por favor intente nuevamente.';
      }

      setTimeout(() => {
        this.error = '';
      }, 8000);
    } finally {
      this.isCreatingDocument = false;
    }

  }

  private extraerDireccionCompleta(): string {
  const persona = this.pacienteCompleto?.persona;
  const personaInfo = this.personaInfo;
  const paciente = this.pacienteCompleto?.paciente;

  // Buscar el campo domicilio en los objetos disponibles
  const domicilio = 
    persona?.domicilio || 
    personaInfo?.domicilio || 
    (paciente as any)?.domicilio ||
    persona?.direccion ||  // fallback por si acaso
    personaInfo?.direccion;

  return domicilio && domicilio.trim() !== '' 
    ? domicilio.trim() 
    : 'Sin dirección registrada';
}

  private extraerLugarNacimiento(): string {
    const objetos = [
      this.pacienteCompleto?.persona,
      this.personaInfo,
      this.pacienteCompleto?.paciente as any,
    ];

    const propiedades = [
      'lugar_nacimiento',
      'ciudad_nacimiento',
      'municipio_nacimiento',
      'estado_nacimiento',
    ];

    for (const propiedad of propiedades) {
      const valor = this.findPropertyInObjects(objetos, propiedad);
      if (valor) return valor;
    }

    return 'No especificado';
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
      documentos: Array.isArray(data.documentos?.data)
        ? data.documentos.data
        : [],
      ultimoInternamiento: null,
      signosVitales: Array.isArray(data.signosVitales?.data)
        ? data.signosVitales.data
        : [],
    };

    console.log('- Paciente completo construido:', this.pacienteCompleto);
    console.log('- Persona info:', this.pacienteCompleto.persona);

    this.preLlenarFormularios();
  }

  private obtenerFechaNacimiento(): string | null {
    const objetos = [
      this.pacienteCompleto?.persona,
      this.personaInfo,
      this.pacienteCompleto?.paciente as any,
    ];

    for (const obj of objetos) {
      const fecha = this.getNestedProperty(obj, 'fecha_nacimiento');
      if (fecha && typeof fecha === 'string') {
        return fecha;
      }
    }

    return null;
  }

  private async obtenerDatosMedicoCompleto(): Promise<any> {
    try {
      if (!this.medicoActual) {
        throw new Error('No hay médico autenticado');
      }

      console.log(
        '🩺 Obteniendo datos completos del médico:',
        this.medicoActual
      );

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
        nombre_completo:
          usuarioActual?.nombre_completo || 'Médico no identificado',
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

  mostrarConfirmacionPDF(tipoDocumento: string): void {
    if (tipoDocumento === 'Signos Vitales') {
      console.log('PDF de signos vitales desactivado por ahora');
      return;
    }

    if (
      confirm(
        `${tipoDocumento} guardado correctamente.\n\n¿Desea generar el PDF ahora?`
      )
    ) {
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
    let fecha = fechaNacimiento;
    if (!fecha) {
      const persona = this.pacienteCompleto?.persona;
      const personaInfo = this.personaInfo;
      fecha =
        this.getNestedProperty(persona, 'fecha_nacimiento') ||
        this.getNestedProperty(personaInfo, 'fecha_nacimiento') ||
        this.getNestedProperty(
          this.pacienteCompleto?.paciente as any,
          'fecha_nacimiento'
        );
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

    const objetos = [
      persona,
      personaInfo,
      this.pacienteCompleto?.paciente as any,
    ];

    let nombre = '';
    let apellidoPaterno = '';
    let apellidoMaterno = '';

    for (const obj of objetos) {
      if (!nombre) nombre = this.getNestedProperty(obj, 'nombre') || '';
      if (!apellidoPaterno)
        apellidoPaterno = this.getNestedProperty(obj, 'apellido_paterno') || '';
      if (!apellidoMaterno)
        apellidoMaterno = this.getNestedProperty(obj, 'apellido_materno') || '';
      if (nombre && apellidoPaterno && apellidoMaterno) break;
    }

    const nombreCompleto =
      `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim();

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
      case 'consentimiento':
        return this.consentimientoForm.valid;
      case 'notaPreoperatoria':
        return this.notaPreoperatoriaForm.valid;
      case 'notaPostoperatoria':
        return this.notaPostoperatoriaForm.valid;
      case 'notaPreanestesica':
        return this.notaPreanestesicaForm.valid;
      case 'notaPostanestesica':
        return this.notaPostanestesicaForm.valid;
      case 'notaInterconsulta':
        return this.notaInterconsultaForm.valid;
      case 'controlCrecimiento':
        return true;
      case 'esquemaVacunacion':
        return true;
      default:
        return false;
    }
  }

  get puedeAvanzar(): boolean {
    if (this.formularioActivo === null) {
      return false;
    }
    const estadoFormulario = this.formularioEstado[this.formularioActivo];
    return estadoFormulario || this.formularioActualValido;
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

  private esObjetoValido(obj: any): boolean {
    return obj && typeof obj === 'object' && !Array.isArray(obj);
  }

  private tienePropiedad(obj: any, prop: string): boolean {
    return this.esObjetoValido(obj) && (prop in obj || obj[prop] !== undefined);
  }

  private getNestedProperty(obj: any, path: string): any {
    if (!this.esObjetoValido(obj)) return null;
    if (this.tienePropiedad(obj, path)) {
      return obj[path];
    }

    return null;
  }

  private esFormularioValido(
    formulario: string | null
  ): formulario is FormularioActivo {
    if (formulario === null) {
      return false;
    }
    const formulariosValidos: FormularioActivo[] = [
      'signosVitales',
      'historiaClinica',
      'notaUrgencias',
      'notaEvolucion',
      'consentimiento',
      'notaPreoperatoria',
      'notaPostoperatoria',
      'notaPreanestesica',
      'notaPostanestesica',
      'notaInterconsulta',
      'controlCrecimiento',
      'esquemaVacunacion',
    ];
    return formulariosValidos.includes(formulario as FormularioActivo);
  }

  private esTabValida(
    tab: string
  ): tab is 'general' | 'crear' | 'historial' | 'datos' {
    return ['general', 'crear', 'historial', 'datos'].includes(tab);
  }

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

  private manejarErrorConexion(error: any, contexto: string): void {
    this.hayProblemasConexion = true;
    this.estadoAutoguardado = 'offline';
    this.guardarLocalmenteFormulario();
    this.error =
      'Problema de conexión detectado. Tus datos se guardan localmente.';
    this.mostrarError = true;
    setTimeout(() => {
      this.mostrarError = false;
    }, 5000);

    this.iniciarReconexionAutomatica();
  }

  private manejarErrorValidacion(error: any, contexto: string): void {
    const mensaje = this.extraerMensajeValidacion(error);
    this.error = `Error de validación: ${mensaje}`;
    this.mostrarError = true;
    setTimeout(() => {
      this.mostrarError = false;
    }, 7000);
  }

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

  private manejarErrorCritico(error: any, contexto: string): void {
    this.guardarLocalmenteFormulario();
    this.errorCritico = `Error crítico en ${contexto}: ${
      error?.message || 'Error desconocido'
    }`;
  }

  private manejarErrorGeneral(error: any, contexto: string): void {
    this.error = `Error en ${contexto}. Tus datos están seguros.`;
    this.mostrarError = true;

    setTimeout(() => {
      this.mostrarError = false;
    }, 4000);
  }

  private guardarLocalmenteFormulario(): void {
    try {
      const datosFormulario = {
        formularioActivo: this.formularioActivo,
        signosVitales: this.signosVitalesForm.value,
        historiaClinica: this.historiaClinicaForm.value,
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
      const datosGuardados = localStorage.getItem(
        `perfil_paciente_${this.pacienteId}`
      );
      if (!datosGuardados) return false;

      const datos = JSON.parse(datosGuardados);
      const tiempoTranscurrido = Date.now() - datos.timestamp;

      if (tiempoTranscurrido > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(`perfil_paciente_${this.pacienteId}`);
        return false;
      }

      this.signosVitalesForm.patchValue(datos.signosVitales || {});
      this.historiaClinicaForm.patchValue(datos.historiaClinica || {});
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

      setTimeout(() => {
        this.success = null;
      }, 5000);

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

        setTimeout(() => {
          this.estadoAutoguardado = null;
        }, 2000);
      }
    }, 30000);
  }

  private hayFormularioCambiado(): boolean {
    return [
      this.signosVitalesForm,
      this.historiaClinicaForm,
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

  verificarConexion(): void {
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

  recargarPagina(): void {
    this.guardarLocalmenteFormulario();
    window.location.reload();
  }

  cerrarErrorCritico(): void {
    this.errorCritico = null;
  }

  private iniciarReconexionAutomatica(): void {
    const intentarReconectar = () => {
      if (this.hayProblemasConexion && navigator.onLine) {
        this.verificarConexion();
      }
    };

    setInterval(intentarReconectar, 30000);
  }

  private extraerMensajeValidacion(error: any): string {
    if (error?.error?.message) return error.error.message;
    if (error?.error?.errors) return error.error.errors.join(', ');
    if (error?.message) return error.message;
    return 'Datos inválidos';
  }

  // ===============================
  // MÉTODOS PARA NAVEGACIÓN MEJORADA
  // ===============================

  private inicializarFormulariosVisibles(): void {
    this.formulariosVisibles = Object.keys(this.configFormularios);
  }

  // Método para expandir/contraer grupos
  toggleGrupo(nombreGrupo: string): void {
    this.grupoExpandido =
      this.grupoExpandido === nombreGrupo ? null : nombreGrupo;
  }

  // Método para mostrar/ocultar todos los formularios
  toggleMostrarTodos(): void {
    this.mostrarTodosFormularios = !this.mostrarTodosFormularios;
    if (this.mostrarTodosFormularios) {
      this.grupoExpandido = null;
    }
  }

  // Filtrado de formularios por búsqueda
  filtrarFormularios(): void {
    if (!this.busquedaFormulario.trim()) {
      this.formulariosVisibles = Object.keys(this.configFormularios);
      return;
    }

    const termino = this.busquedaFormulario.toLowerCase();
    this.formulariosVisibles = Object.keys(this.configFormularios).filter(
      (key) =>
        this.configFormularios[key].nombre.toLowerCase().includes(termino)
    );
  }

  // Filtrado por categoría
  filtrarPorCategoria(
    categoria: 'todos' | 'frecuentes' | 'obligatorios' | 'pediatricos'
  ): void {
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

  // Método para verificar si un formulario es pediátrico
  esFormularioPediatrico(formulario: string): boolean {
    const formulariosPediatricos = [
      'historiaClinicaPediatrica',
      'antecedentesHeredoFamiliares',
      'antecedentesPerinatales',
      'desarrolloPsicomotriz',
      'estadoNutricionalPediatrico',
      'inmunizaciones',
      'vacunasAdicionales',
      'alimentacionPediatrica',
      'tamizajeNeonatal',
      'controlCrecimiento',
      'esquemaVacunacion',
    ];
    return formulariosPediatricos.includes(formulario);
  }

  // Obtener clase CSS para botones de formulario
  getClaseBotonFormulario(formulario: string): string {
  const isActive = this.formularioActivo === formulario;
  const config = this.configFormularios[formulario];
  const puedeAcceder = this.puedeAccederFormulario(formulario);

  if (isActive) {
    return 'bg-blue-500 text-white shadow-lg transform scale-105';
  }

  // 🔥 Si no puede acceder, mostrar deshabilitado
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

  // Obtener grupos visibles (filtrados por condiciones)
  getGruposVisibles() {
    return Object.entries(this.gruposFormularios)
      .filter(
        ([_, grupo]) => !(grupo as any).condition || (grupo as any).condition()
      )
      .map(([key, data]) => ({ key, data }));
  }

  // Obtener formularios visibles en un grupo específico
  getFormulariosVisiblesEnGrupo(formulariosGrupo: string[]) {
    return formulariosGrupo
      .filter((f) => this.formulariosVisibles.includes(f))
      .filter((f) => this.configFormularios[f])
      .map((key) => ({ key, ...this.configFormularios[key] }));
  }

  // Obtener todos los formularios visibles (para vista completa)
  getFormulariosVisibles() {
    return this.formulariosVisibles
      .filter((key) => this.configFormularios[key])
      .map((key) => ({ key, ...this.configFormularios[key] }));
  }

  // Navegación con teclado (opcional)
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Solo procesar si estamos en el tab de crear
    if (this.tabActiva !== 'crear') return;

    // Ctrl/Cmd + número para acceso rápido
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key >= '1' &&
      event.key <= '9'
    ) {
      event.preventDefault();
      const index = parseInt(event.key) - 1;
      const formularios = this.getFormulariosVisibles();
      if (formularios[index]) {
        this.cambiarFormulario(formularios[index].key);
      }
    }

    // Flecha izquierda/derecha para navegar
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.navegarFormulario(
        event.key === 'ArrowRight' ? 'siguiente' : 'anterior'
      );
    }
  }

  // Navegación secuencial entre formularios
  navegarFormulario(direccion: 'anterior' | 'siguiente'): void {
    const formularios = this.getFormulariosVisibles();
    const actual = formularios.findIndex(
      (f) => f.key === this.formularioActivo
    );

    if (actual === -1) return;

    let nuevo = direccion === 'siguiente' ? actual + 1 : actual - 1;

    if (nuevo >= formularios.length) nuevo = 0;
    if (nuevo < 0) nuevo = formularios.length - 1;

    this.cambiarFormulario(formularios[nuevo].key);
  }

  // Actualizar estado de completado de formularios
  actualizarEstadoFormulario(formulario: string, completado: boolean): void {
    if (this.configFormularios[formulario]) {
      this.configFormularios[formulario].completado = completado;
    }
  }

  // Agregar en la clase PerfilPaciente
get esPediatrico(): boolean {
  if (!this.pacienteCompleto?.paciente?.persona?.fecha_nacimiento) return false;
  
  const fechaNacimiento = new Date(this.pacienteCompleto.paciente.persona.fecha_nacimiento);
  const hoy = new Date();
  const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  
  return edad < 18;
}

get esMujer(): boolean {
  return this.pacienteCompleto?.paciente?.persona?.sexo === 'F';
}



private extraerDatosPaciente(): any {
  if (!this.pacienteCompleto) return {};

  const paciente = this.pacienteCompleto.paciente;
  const persona = paciente?.persona || {};

  return {
    // Datos básicos
    id_paciente: paciente?.id_paciente,
    nombre: persona.nombre || '',
    apellido_paterno: persona.apellido_paterno || '',
    apellido_materno: persona.apellido_materno || '',
    nombre_completo: `${persona.nombre || ''} ${persona.apellido_paterno || ''} ${persona.apellido_materno || ''}`.trim(),
    
    // Datos demográficos
    fecha_nacimiento: persona.fecha_nacimiento || '',
    edad: this.calcularEdad(persona.fecha_nacimiento || ''),
    sexo: persona.sexo || '',
    curp: persona.curp || '',
    
    // ✅ AGREGAR TIPO DE SANGRE AQUÍ
    tipo_sangre: persona.tipo_sangre || 'No especificado',
    
    // Datos de contacto
    telefono: persona.telefono || '',
    correo_electronico: persona.correo_electronico || '',
    domicilio: persona.domicilio || 'Sin dirección registrada',
    lugar_nacimiento: paciente?.lugar_nacimiento || '',
    
    // Datos médicos
    alergias: paciente?.alergias || 'No especificadas',
    transfusiones: paciente?.transfusiones || false,
    detalles_transfusiones: paciente?.detalles_transfusiones || '',
    
    // Familiar responsable
    familiar_responsable: paciente?.familiar_responsable || '',
    parentesco_familiar: paciente?.parentesco_familiar || '',
    telefono_familiar: paciente?.telefono_familiar || '',
    
    // Datos socioeconómicos
    ocupacion: paciente?.ocupacion || '',
    escolaridad: paciente?.escolaridad || '',
    estado_civil: persona.estado_civil || '',
    religion: persona.religion || '',
    
    // Expediente actual
    numero_expediente: this.pacienteCompleto?.expediente?.numero_expediente || '',
    signosVitales: this.pacienteCompleto?.signosVitales || [],
  };
}


}
