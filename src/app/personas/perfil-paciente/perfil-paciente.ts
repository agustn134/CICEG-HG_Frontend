// C:\CICEG-HG-APP\src\app\personas\perfil-paciente\perfil-paciente.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';

// Servicios - TODOS los servicios de documentos clínicos
import { ExpedientesService } from '../../services/gestion-expedientes/expedientes';
import { PacientesService } from '../../services/personas/pacientes';
import { DocumentosService } from '../../services/documentos-clinicos/documentos';
import { HistoriasClinicasService } from '../../services/documentos-clinicos/historias-clinicas';
import { NotasUrgenciasService } from '../../services/documentos-clinicos/notas-urgencias';
import { NotasEvolucionService } from '../../services/documentos-clinicos/notas-evolucion';
import { NotasEgresoService } from '../../services/documentos-clinicos/notas-egreso';
import { NotasInterconsulta} from '../../services/documentos-clinicos/notas-interconsulta';
import { NotasPreoperatoria } from '../../services/documentos-clinicos/notas-preoperatoria';
import { NotasPostoperatoria } from '../../services/documentos-clinicos/notas-postoperatoria';
import { NotasPreanestesica } from '../../services/documentos-clinicos/notas-preanestesica';
import { NotasPostanestesica } from '../../services/documentos-clinicos/notas-postanestesica';
import { PrescripcionesMedicamentoService } from '../../services/documentos-clinicos/prescripciones-medicamento';
import { SignosVitalesService } from '../../services/gestion-expedientes/signos-vitales';

// Modelos
import { Paciente } from '../../models/paciente.model';
import { Expediente } from '../../models/expediente.model';
import { DocumentoClinico } from '../../models/documento-clinico.model';

interface PacienteCompleto {
  persona: any;
  paciente: Paciente;
  expediente: Expediente;
  documentos: DocumentoClinico[];
  ultimoInternamiento: any;
  signosVitales: any[];
}

interface TipoDocumentoDisponible {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  servicio: string; // Nombre del servicio Angular
  ruta: string;     // Ruta para crear/editar
  requiereInternamiento: boolean;
}

@Component({
  selector: 'app-perfil-paciente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-paciente.html',
  styleUrl: './perfil-paciente.css'
})
export class PerfilPaciente implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Estados de carga
  isLoading = true;
  isCreatingDocument = false;
  error: string | null = null;


  // Datos del paciente
  pacienteCompleto: PacienteCompleto | null = null;
  pacienteId: number | null = null;

  // Filtros y vista
  filtroDocumentos = 'todos'; // todos, activos, borradores
  vistaActual = 'resumen'; // resumen, documentos, historial

  // Tipos de documentos disponibles para crear
  tiposDocumentosDisponibles: TipoDocumentoDisponible[] = [
    {
      id: 'historia-clinica',
      nombre: 'Historia Clínica',
      descripcion: 'Documento principal con antecedentes completos',
      icono: 'fas fa-file-medical-alt',
      color: 'blue',
      servicio: 'HistoriasClinicasService',
      ruta: '/app/documentos-clinicos/historias-clinicas/nuevo',
      requiereInternamiento: false
    },
    {
      id: 'nota-urgencias',
      nombre: 'Nota de Urgencias',
      descripcion: 'Atención médica de urgencia con triaje',
      icono: 'fas fa-ambulance',
      color: 'red',
      servicio: 'NotasUrgenciasService',
      ruta: '/app/documentos-clinicos/notas-urgencias/nuevo',
      requiereInternamiento: false
    },
    {
      id: 'nota-evolucion',
      nombre: 'Nota de Evolución',
      descripcion: 'Seguimiento diario del paciente (SOAP)',
      icono: 'fas fa-chart-line',
      color: 'green',
      servicio: 'NotasEvolucionService',
      ruta: '/app/documentos-clinicos/notas-evolucion/nuevo',
      requiereInternamiento: true
    },
    {
      id: 'nota-interconsulta',
      nombre: 'Nota de Interconsulta',
      descripcion: 'Solicitud de valoración por especialista',
      icono: 'fas fa-user-md',
      color: 'purple',
      servicio: 'NotasInterconsultaService',
      ruta: '/app/documentos-clinicos/notas-interconsulta/nuevo',
      requiereInternamiento: false
    },
    {
      id: 'nota-preoperatoria',
      nombre: 'Nota Preoperatoria',
      descripcion: 'Evaluación antes de cirugía',
      icono: 'fas fa-procedures',
      color: 'orange',
      servicio: 'NotasPreoperatoriaService',
      ruta: '/app/documentos-clinicos/notas-preoperatoria/nuevo',
      requiereInternamiento: true
    },
    {
      id: 'nota-postoperatoria',
      nombre: 'Nota Postoperatoria',
      descripcion: 'Seguimiento después de cirugía',
      icono: 'fas fa-band-aid',
      color: 'indigo',
      servicio: 'NotasPostoperatoriaService',
      ruta: '/app/documentos-clinicos/notas-postoperatoria/nuevo',
      requiereInternamiento: true
    },
    {
      id: 'nota-egreso',
      nombre: 'Nota de Egreso',
      descripcion: 'Resumen de alta hospitalaria',
      icono: 'fas fa-sign-out-alt',
      color: 'indigo',
      servicio: 'NotasEgresoService',
      ruta: '/app/documentos-clinicos/notas-egreso/nuevo',
      requiereInternamiento: true
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    // Servicios de gestión
    private expedientesService: ExpedientesService,
    private pacientesService: PacientesService,
    private documentosService: DocumentosService,
    private signosVitalesService: SignosVitalesService,
    // Servicios de documentos clínicos - TODOS importados
    private historiasClinicasService: HistoriasClinicasService,
    private notasUrgenciasService: NotasUrgenciasService,
    private notasEvolucionService: NotasEvolucionService,
    private notasEgresoService: NotasEgresoService,
    private notasInterconsultaService: NotasInterconsulta,
    private notasPreoperatoriaService: NotasPreoperatoria,
    private notasPostoperatoriaService: NotasPostoperatoria,
    private notasPreanestesicaService: NotasPreanestesica,
    private notasPostanestesicaService: NotasPostanestesica,
    private prescripcionesMedicamentoService: PrescripcionesMedicamentoService
  ) {}

  ngOnInit(): void {
    // Obtener ID del paciente desde la ruta
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.pacienteId = parseInt(id, 10);
        this.cargarDatosPaciente();
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

  // ==========================================
  // CARGA DE DATOS
  // ==========================================

  private cargarDatosPaciente(): void {
    if (!this.pacienteId) return;

    this.isLoading = true;
    this.error = null;

    // Cargar todos los datos del paciente en paralelo
    forkJoin({
      paciente: this.pacientesService.getPacienteById(this.pacienteId),
      expediente: this.expedientesService.getExpedienteByPacienteId(this.pacienteId),
      documentos: this.documentosService.getDocumentosByPacienteId(this.pacienteId),
      signosVitales: this.signosVitalesService.getSignosVitalesByPacienteId(this.pacienteId)
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.construirPacienteCompleto(data);
        this.isLoading = false;
        console.log('✅ Datos del paciente cargados:', this.pacienteCompleto);
      },
      error: (error) => {
        console.error('❌ Error al cargar datos del paciente:', error);
        this.error = 'Error al cargar los datos del paciente';
        this.isLoading = false;
      }
    });
  }

  private construirPacienteCompleto(data: any): void {
    this.pacienteCompleto = {
      persona: data.paciente.data?.persona || {},
      paciente: data.paciente.data || {},
      expediente: data.expediente.data || {},
      documentos: data.documentos.data || [],
      ultimoInternamiento: null, // Se obtendría de otro servicio
      signosVitales: data.signosVitales.data || []
    };
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

  formatearFechaHora(fecha: string): string {
    if (!fecha) return 'No disponible';

    try {
      return new Date(fecha).toLocaleString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
  // FILTROS Y VISTA
  // ==========================================

  get documentosFiltrados(): DocumentoClinico[] {
    if (!this.pacienteCompleto?.documentos) return [];

    switch (this.filtroDocumentos) {
      case 'activos':
        return this.pacienteCompleto.documentos.filter(doc => doc.estado === 'Activo');
      case 'borradores':
        return this.pacienteCompleto.documentos.filter(doc => doc.estado === 'Borrador');
      default:
        return this.pacienteCompleto.documentos;
    }
  }

  get tiposDocumentosPermitidos(): TipoDocumentoDisponible[] {
    // Filtrar tipos según el estado del paciente
    const tieneInternamiento = !!this.pacienteCompleto?.ultimoInternamiento;

    return this.tiposDocumentosDisponibles.filter(tipo => {
      if (tipo.requiereInternamiento && !tieneInternamiento) {
        return false; // No permitir documentos que requieren internamiento
      }
      return true;
    });
  }

  // ==========================================
  // ACCIONES
  // ==========================================

  cambiarVista(vista: string): void {
    this.vistaActual = vista;
  }

  cambiarFiltro(filtro: string): void {
    this.filtroDocumentos = filtro;
  }

  crearDocumento(tipoDocumento: TipoDocumentoDisponible): void {
    if (!this.pacienteCompleto?.expediente.id_expediente) {
      console.error('❌ No hay expediente disponible');
      return;
    }

    console.log('🆕 Creando documento:', tipoDocumento.nombre);

    // Navegar a la ruta de creación con el ID del expediente
    const rutaCompleta = `${tipoDocumento.ruta}?expediente=${this.pacienteCompleto.expediente.id_expediente}`;
    this.router.navigate([rutaCompleta]);
  }

  verDocumento(documento: DocumentoClinico): void {
    console.log('👁️ Ver documento:', documento);

    // Navegar a la vista del documento específico
    const ruta = `/app/documentos-clinicos/ver/${documento.id_documento}`;
    this.router.navigate([ruta]);
  }

  editarDocumento(documento: DocumentoClinico): void {
    console.log('✏️ Editar documento:', documento);

    // Navegar a la edición del documento específico
    const ruta = `/app/documentos-clinicos/editar/${documento.id_documento}`;
    this.router.navigate([ruta]);
  }

  refrescarDatos(): void {
    console.log('🔄 Refrescando datos del paciente...');
    this.cargarDatosPaciente();
  }

  volverAListaPacientes(): void {
    this.router.navigate(['/app/personas/pacientes']);
  }

  irAExpediente(): void {
    if (this.pacienteCompleto?.expediente.id_expediente) {
      this.router.navigate(['/app/gestion-expedientes/expedientes', this.pacienteCompleto.expediente.id_expediente]);
    }
  }

  // ==========================================
  // GETTERS PARA TEMPLATE
  // ==========================================

  get tieneDocumentos(): boolean {
    return this.documentosFiltrados.length > 0;
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

  get esPediatrico(): boolean {
    if (!this.pacienteCompleto?.persona.fecha_nacimiento) return false;
    return this.calcularEdad(this.pacienteCompleto.persona.fecha_nacimiento) < 18;
  }
}
