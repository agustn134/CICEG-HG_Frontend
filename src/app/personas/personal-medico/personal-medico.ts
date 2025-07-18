// src/app/personas/personal-medico/personal-medico.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Importaciones de modelos y servicios
import {
  PersonalMedico,
  PersonalMedicoFilters,
  EstadisticasPersonalMedico,
  Genero,
  ApiResponse,
  ESPECIALIDADES_MEDICAS,
  CARGOS_MEDICOS,
  DEPARTAMENTOS_HOSPITALARIOS,
  CreatePersonalMedicoDto,
  UpdatePersonalMedicoDto,
} from '../../models';
import { PersonalMedicoService } from '../../services/personas/personal-medico';

@Component({
  selector: 'app-personal-medico',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './personal-medico.html',
  styleUrl: './personal-medico.css',
})
export class PersonalMedicoComponent implements OnInit, OnDestroy {
  // ==========================================
  // INYECCIÓN DE DEPENDENCIAS
  // ==========================================
  private personalMedicoService = inject(PersonalMedicoService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // ==========================================
  // PROPIEDADES DEL COMPONENTE
  // ==========================================

  // Datos principales
  personalMedico: PersonalMedico[] = [];
  personalSeleccionado: PersonalMedico | null = null;
  estadisticas: EstadisticasPersonalMedico | null = null;

  // Estados de la UI
  loading = false;
  error: string | null = null;
  success: string | null = null;
  mostrarFiltros = false;
  mostrarEstadisticas = true;
  mostrarModal = false;
  mostrarModalPerfil = false;
  mostrarModalCredenciales = false;
  vistaActual: 'tabla' | 'tarjetas' = 'tarjetas';

  // Formularios - INICIALIZADOS CORRECTAMENTE
  textoBusqueda = '';
  filtrosForm!: FormGroup;
  personalForm!: FormGroup;
  credencialesForm!: FormGroup;
  filtrosAplicados: PersonalMedicoFilters = {};
  // En personal-medico.ts, agregar esta propiedad:
  mostrarPassword = false;
  usuarioYaExiste = false;
  correoYaExiste = false;
  curpYaExiste = false;
  cedulaYaExiste = false;

  // Estados del formulario
  isEditMode = false;
  personalEnEdicion: PersonalMedico | null = null;
  procesandoFormulario = false;

  // Configuraciones
  readonly especialidadesMedicas = ESPECIALIDADES_MEDICAS;
  readonly cargosMedicos = CARGOS_MEDICOS;
  readonly departamentosHospitalarios = DEPARTAMENTOS_HOSPITALARIOS;

  readonly opcionesActivo: { valor: boolean | ''; etiqueta: string }[] = [
    { valor: '', etiqueta: 'Todos' },
    { valor: true, etiqueta: 'Activos' },
    { valor: false, etiqueta: 'Inactivos' },
  ];

  readonly opcionesGenero = [
    { valor: 'M', etiqueta: 'Masculino' },
    { valor: 'F', etiqueta: 'Femenino' },
  ];

  readonly tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Exponer enum para el template
  readonly Genero = Genero;

  // ==========================================
  // CONSTRUCTOR Y CICLO DE VIDA
  // ==========================================

  constructor() {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.inicializarComponente();
    this.configurarBusquedaEnTiempoReal();
    this.suscribirAEstadoDelServicio();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.filtrosForm = this.fb.group({
      activo: [''],
      especialidad: [''],
      cargo: [''],
      departamento: [''],
      buscar: [''],
    });

    this.personalForm = this.fb.group({
      // Datos de personal médico
      numero_cedula: ['', [Validators.required, Validators.minLength(6)]],
      especialidad: ['', [Validators.required]],
      cargo: [''],
      departamento: [''],
      activo: [true],

      // Datos de persona
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido_paterno: ['', [Validators.required, Validators.minLength(2)]],
      apellido_materno: [''],
      fecha_nacimiento: ['', [Validators.required]],
      sexo: ['', [Validators.required]],
      telefono: ['', [Validators.pattern(/^\d{10}$/)]],
      correo_electronico: ['', [Validators.email]],
      curp: [
        '',
        [Validators.pattern(/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9]{2}$/)],
      ],
      tipo_sangre: [''],
      domicilio: [''],
      estado_civil: [''],
      religion: [''],

      // 🔥 NUEVOS CAMPOS DE CREDENCIALES
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      password_texto: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.credencialesForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      password_texto: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // ==========================================
  // MÉTODOS DE INICIALIZACIÓN
  // ==========================================

  private inicializarComponente(): void {
    this.cargarPersonalMedico();
    this.cargarEstadisticas();
  }

  private configurarBusquedaEnTiempoReal(): void {
    this.filtrosForm
      .get('buscar')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((valor) => {
        this.textoBusqueda = valor;
        this.aplicarFiltros();
      });
  }

  private suscribirAEstadoDelServicio(): void {
    this.personalMedicoService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    this.personalMedicoService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => (this.error = error));

    this.personalMedicoService.personalMedico$
      .pipe(takeUntil(this.destroy$))
      .subscribe((personal) => (this.personalMedico = personal));
  }

  // ==========================================
  // MÉTODOS CRUD
  // ==========================================

  cargarPersonalMedico(): void {
    this.personalMedicoService
      .getPersonalMedico(this.filtrosAplicados)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<PersonalMedico[]>) => {
          if (response.success && response.data) {
            // Procesar datos para mostrar nombre completo
            this.personalMedico = response.data.map((medico) => ({
              ...medico,
              nombre_completo: this.construirNombreCompleto(medico),
            }));
          }
        },
        error: (error) => {
          this.mostrarError(
            'Error al cargar personal médico: ' + error.message
          );
        },
      });
  }

  cargarEstadisticas(): void {
    this.personalMedicoService
      .getEstadisticas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<EstadisticasPersonalMedico>) => {
          if (response.success && response.data) {
            this.estadisticas = response.data;
          }
        },
        error: (error) => {
          console.warn('No se pudieron cargar las estadísticas:', error);
          // Crear estadísticas mock desde los datos actuales
          this.crearEstadisticasMock();
        },
      });
  }

  private crearEstadisticasMock(): void {
    if (this.personalMedico.length === 0) return;

    const especialidades = [
      ...new Set(this.personalMedico.map((p) => p.especialidad)),
    ];
    const departamentos = [
      ...new Set(
        this.personalMedico.map((p) => p.departamento).filter(Boolean)
      ),
    ];

    this.estadisticas = {
      resumen: {
        total_personal_registrado: this.personalMedico.length,
        total_personal_activo: this.personalMedico.filter((p) => p.activo)
          .length,
        total_especialidades: especialidades.length,
        total_departamentos: departamentos.length,
      },
      por_especialidad_departamento: especialidades.map((esp) => ({
        especialidad: esp,
        total_personal: this.personalMedico.filter(
          (p) => p.especialidad === esp
        ).length,
        personal_activo: this.personalMedico.filter(
          (p) => p.especialidad === esp && p.activo
        ).length,
        total_documentos_creados: this.personalMedico
          .filter((p) => p.especialidad === esp)
          .reduce(
            (sum, p) =>
              sum + parseInt(p.total_documentos_creados?.toString() || '0'),
            0
          ),
        documentos_mes_actual: this.personalMedico
          .filter((p) => p.especialidad === esp)
          .reduce(
            (sum, p) =>
              sum + parseInt(p.documentos_mes_actual?.toString() || '0'),
            0
          ),
      })),
      mas_productivos: this.personalMedico
        .filter(
          (p) =>
            p.total_documentos_creados &&
            parseInt(p.total_documentos_creados.toString()) > 0
        )
        .sort(
          (a, b) =>
            parseInt(b.total_documentos_creados?.toString() || '0') -
            parseInt(a.total_documentos_creados?.toString() || '0')
        )
        .slice(0, 5)
        .map((p) => ({
          id_personal_medico: p.id_personal_medico,
          numero_cedula: p.numero_cedula,
          especialidad: p.especialidad,
          nombre_completo: this.construirNombreCompleto(p),
          total_documentos: parseInt(
            p.total_documentos_creados?.toString() || '0'
          ),
          documentos_mes: parseInt(p.documentos_mes_actual?.toString() || '0'),
        })),
    };
  }

  // ==========================================
  // MÉTODOS DEL FORMULARIO
  // ==========================================

  mostrarFormularioCrear(): void {
    this.isEditMode = false;
    this.personalEnEdicion = null;
    this.personalForm.reset();
    this.personalForm.patchValue({
      activo: true,
      sexo: 'M',
      // Sugerir usuario basado en estructura estándar
      usuario: '',
      password_texto: '',
    });
    this.mostrarModal = true;
  }

  mostrarFormularioEditar(personal: PersonalMedico): void {
    this.isEditMode = true;
    this.personalEnEdicion = personal;

    this.personalForm.patchValue({
      numero_cedula: personal.numero_cedula,
      especialidad: personal.especialidad,
      cargo: personal.cargo || '',
      departamento: personal.departamento || '',
      activo: personal.activo,
      nombre: personal.nombre || '',
      apellido_paterno: personal.apellido_paterno || '',
      apellido_materno: personal.apellido_materno || '',
      fecha_nacimiento: personal.fecha_nacimiento
        ? personal.fecha_nacimiento.split('T')[0]
        : '',
      sexo: personal.sexo || 'M',
      telefono: personal.telefono || '',
      correo_electronico: personal.correo_electronico || '',
      curp: personal.curp || '',
      tipo_sangre: personal.tipo_sangre || '',
    });

    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.isEditMode = false;
    this.personalEnEdicion = null;
    this.personalForm.reset();
    this.procesandoFormulario = false;
    this.limpiarMensajes();
  }

  onSubmit(): void {
    if (this.personalForm.invalid) {
      this.marcarCamposComoTocados();
      this.mostrarError('Por favor completa todos los campos requeridos');
      return;
    }

    this.procesandoFormulario = true;
    this.limpiarMensajes();

    const formData = this.personalForm.value;

    if (this.isEditMode && this.personalEnEdicion) {
      this.actualizarPersonal(formData);
    } else {
      this.crearPersonal(formData);
    }
  }

  private crearPersonal(formData: any): void {
    // Preparar datos con estructura completa
    const requestData = {
      // Datos de persona
      persona: {
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno || null,
        fecha_nacimiento: formData.fecha_nacimiento,
        sexo: formData.sexo,
        telefono: formData.telefono || null,
        correo_electronico: formData.correo_electronico || null,
        curp: formData.curp || null,
        tipo_sangre: formData.tipo_sangre || null,
        domicilio: formData.domicilio || null,
        estado_civil: formData.estado_civil || null,
        religion: formData.religion || null,
      },

      // Datos de personal médico
      numero_cedula: formData.numero_cedula,
      especialidad: formData.especialidad,
      cargo: formData.cargo || null,
      departamento: formData.departamento || null,
      activo: formData.activo ?? true,
      foto: null,

      // 🔥 CREDENCIALES DE ACCESO
      usuario: formData.usuario,
      password_texto: formData.password_texto,
    };

    console.log('📤 Enviando datos para crear personal médico:', {
      nombre: requestData.persona.nombre,
      usuario: requestData.usuario,
    });

    this.personalMedicoService
      .createPersonalMedico(requestData as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.mostrarExito(
              `Personal médico creado exitosamente. Usuario: ${formData.usuario}`
            );
            this.cargarPersonalMedico();
            this.cargarEstadisticas();
            this.cerrarModal();
          } else {
            this.mostrarError(
              'Error al crear personal médico: ' + response.message
            );
          }
          this.procesandoFormulario = false;
        },
        error: (error) => {
          console.error('❌ Error al crear personal médico:', error);
          const errorMessage =
            error.error?.message || error.message || 'Error desconocido';
          this.mostrarError('Error al crear personal médico: ' + errorMessage);
          this.procesandoFormulario = false;
        },
      });
  }

  private actualizarPersonal(formData: any): void {
    if (!this.personalEnEdicion) return;

    const personalData: UpdatePersonalMedicoDto = {
      numero_cedula: formData.numero_cedula,
      especialidad: formData.especialidad,
      cargo: formData.cargo || undefined,
      departamento: formData.departamento || undefined,
      activo: formData.activo,
    };

    this.personalMedicoService
      .updatePersonalMedico(
        this.personalEnEdicion.id_personal_medico,
        personalData
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.mostrarExito('Personal médico actualizado exitosamente');
            this.cargarPersonalMedico();
            this.cargarEstadisticas();
            this.cerrarModal();
          } else {
            this.mostrarError(
              'Error al actualizar personal médico: ' + response.message
            );
          }
          this.procesandoFormulario = false;
        },
        error: (error) => {
          this.mostrarError(
            'Error al actualizar personal médico: ' +
              (error.error?.message || error.message || 'Error desconocido')
          );
          this.procesandoFormulario = false;
        },
      });
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.personalForm.controls).forEach((key) => {
      this.personalForm.get(key)?.markAsTouched();
    });
  }

  // ==========================================
  // MÉTODOS DE ACCIONES
  // ==========================================

  verPerfilCompleto(personal: PersonalMedico): void {
    this.personalSeleccionado = personal;
    this.mostrarModalPerfil = true;
  }

  cerrarModalPerfil(): void {
    this.mostrarModalPerfil = false;
    this.personalSeleccionado = null;
  }

  mostrarCredenciales(personal: PersonalMedico): void {
    this.personalSeleccionado = personal;
    this.credencialesForm.reset();
    this.mostrarModalCredenciales = true;
  }

  cerrarModalCredenciales(): void {
    this.mostrarModalCredenciales = false;
    this.personalSeleccionado = null;
    this.credencialesForm.reset();
  }

  cambiarEstado(personal: PersonalMedico): void {
    const nuevoEstado = !personal.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    if (
      confirm(
        `¿Está seguro de ${accion} al Dr.(a) ${this.construirNombreCompleto(
          personal
        )}?`
      )
    ) {
      this.personalMedicoService
        .updatePersonalMedico(personal.id_personal_medico, {
          activo: nuevoEstado,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.mostrarExito(
                `Personal médico ${
                  nuevoEstado ? 'activado' : 'desactivado'
                } correctamente`
              );
              this.cargarPersonalMedico();
              this.cargarEstadisticas();
            }
          },
          error: (error) => {
            this.mostrarError('Error al cambiar estado: ' + error.message);
          },
        });
    }
  }

  eliminarPersonal(personal: PersonalMedico): void {
    if (
      confirm(
        `¿Está seguro de eliminar al Dr.(a) ${this.construirNombreCompleto(
          personal
        )}?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      this.personalMedicoService
        .deletePersonalMedico(personal.id_personal_medico)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.mostrarExito('Personal médico eliminado correctamente');
              this.cargarPersonalMedico();
              this.cargarEstadisticas();
            }
          },
          error: (error) => {
            this.mostrarError(
              'Error al eliminar personal médico: ' + error.message
            );
          },
        });
    }
  }

  verDocumentosCreados(personal: PersonalMedico): void {
    this.router.navigate(['/app/documentos-clinicos'], {
      queryParams: { medico: personal.id_personal_medico },
    });
  }

  // ==========================================
  // MÉTODOS DE BÚSQUEDA Y FILTROS
  // ==========================================

  aplicarFiltros(): void {
    const valoresFiltros = this.filtrosForm.value;

    this.filtrosAplicados = {
      activo: valoresFiltros.activo === '' ? undefined : valoresFiltros.activo,
      especialidad: valoresFiltros.especialidad || undefined,
      cargo: valoresFiltros.cargo || undefined,
      departamento: valoresFiltros.departamento || undefined,
      buscar: this.textoBusqueda || undefined,
    };

    this.cargarPersonalMedico();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.textoBusqueda = '';
    this.filtrosAplicados = {};
    this.cargarPersonalMedico();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  recargarDatos(): void {
    this.limpiarMensajes();
    this.cargarPersonalMedico();
    this.cargarEstadisticas();
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD PARA LA UI
  // ==========================================

  cambiarVista(nuevaVista: 'tabla' | 'tarjetas'): void {
    this.vistaActual = nuevaVista;
  }

  toggleEstadisticas(): void {
    this.mostrarEstadisticas = !this.mostrarEstadisticas;
  }

  construirNombreCompleto(personal: PersonalMedico): string {
    const partes = [
      personal.nombre,
      personal.apellido_paterno,
      personal.apellido_materno,
    ].filter(Boolean);
    return partes.join(' ') || 'Sin nombre';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  obtenerColorPorEspecialidad(especialidad: string): string {
    const colores: { [key: string]: string } = {
      'Medicina General': 'bg-blue-100 text-blue-800 border-blue-200',
      'Medicina Interna': 'bg-purple-100 text-purple-800 border-purple-200',
      Pediatría: 'bg-pink-100 text-pink-800 border-pink-200',
      'Ginecología y Obstetricia': 'bg-rose-100 text-rose-800 border-rose-200',
      'Cirugía General': 'bg-red-100 text-red-800 border-red-200',
      'Traumatología y Ortopedia':
        'bg-orange-100 text-orange-800 border-orange-200',
      Anestesiología: 'bg-gray-100 text-gray-800 border-gray-200',
      'Medicina de Urgencias':
        'bg-emerald-100 text-emerald-800 border-emerald-200',
      Cardiología: 'bg-red-100 text-red-800 border-red-200',
      Neurología: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return colores[especialidad] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  obtenerIconoPorEspecialidad(especialidad: string): string {
    // Retornar texto simple en lugar de emojis para ser profesional
    const iconos: { [key: string]: string } = {
      'Medicina General': 'MG',
      'Medicina Interna': 'MI',
      Pediatría: 'PED',
      'Ginecología y Obstetricia': 'GO',
      'Cirugía General': 'CG',
      'Traumatología y Ortopedia': 'TO',
      Anestesiología: 'ANE',
      'Medicina de Urgencias': 'URG',
      Cardiología: 'CAR',
      Neurología: 'NEU',
    };
    return iconos[especialidad] || 'ESP';
  }

  obtenerTextoEstado(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  obtenerClaseEstado(activo: boolean): string {
    return activo
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  }

  obtenerNivelProductividad(totalDocumentos: number): string {
    if (totalDocumentos >= 100) return 'Muy Alto';
    if (totalDocumentos >= 50) return 'Alto';
    if (totalDocumentos >= 10) return 'Medio';
    if (totalDocumentos > 0) return 'Básico';
    return 'Sin actividad';
  }

  obtenerColorProductividad(totalDocumentos: number): string {
    if (totalDocumentos >= 100) return 'text-green-600';
    if (totalDocumentos >= 50) return 'text-blue-600';
    if (totalDocumentos >= 10) return 'text-yellow-600';
    if (totalDocumentos > 0) return 'text-orange-600';
    return 'text-gray-400';
  }

  esEspecialista(personal: PersonalMedico): boolean {
    if (!personal.especialidad) return false;
    const especialidadesGenerales = ['medicina general', 'medicina familiar'];
    return !especialidadesGenerales.some((esp) =>
      personal.especialidad.toLowerCase().includes(esp)
    );
  }

  obtenerTituloProfesional(personal: PersonalMedico): string {
    if (!personal.especialidad) return 'Dr.(a)';

    if (personal.especialidad.toLowerCase().includes('psicología')) {
      return 'Psic.';
    }

    if (personal.especialidad.toLowerCase().includes('nutrición')) {
      return 'Nut.';
    }

    return personal.sexo === 'M' ? 'Dr.' : 'Dra.';
  }

  get esUsuarioValido(): boolean {
    const usuario = this.personalForm.get('usuario')?.value;
    return (
      !usuario || (usuario.length >= 3 && /^[a-zA-Z0-9._-]+$/.test(usuario))
    );
  }

  get esPasswordValida(): boolean {
    const password = this.personalForm.get('password_texto')?.value;
    return !password || password.length >= 6;
  }

  // Método auxiliar para convertir a number de forma segura
  convertirANumero(valor: any): number {
    if (typeof valor === 'number') return valor;
    if (typeof valor === 'string') return parseInt(valor) || 0;
    return 0;
  }

  // ==========================================
  // MÉTODOS DE MANEJO DE MENSAJES
  // ==========================================

  private mostrarError(mensaje: string): void {
    this.error = mensaje;
    this.success = null;
    setTimeout(() => {
      this.limpiarMensajes();
    }, 5000);
  }

  private mostrarExito(mensaje: string): void {
    this.success = mensaje;
    this.error = null;
    setTimeout(() => {
      this.limpiarMensajes();
    }, 3000);
  }

  limpiarMensajes(): void {
    this.error = null;
    this.success = null;
  }

  // ==========================================
  // GETTERS PARA EL TEMPLATE
  // ==========================================

  get hayPersonalMedico(): boolean {
    return this.personalMedico.length > 0;
  }

  get hayFiltrosAplicados(): boolean {
    return Object.keys(this.filtrosAplicados).some(
      (key) =>
        this.filtrosAplicados[key as keyof PersonalMedicoFilters] !== undefined
    );
  }

  get totalPersonalMedico(): number {
    return this.personalMedico.length;
  }

  get personalActivo(): PersonalMedico[] {
    return this.personalMedico.filter((p) => p.activo);
  }

  get personalInactivo(): PersonalMedico[] {
    return this.personalMedico.filter((p) => !p.activo);
  }

  get especialidadesUnicas(): string[] {
    const especialidades = this.personalMedico
      .filter((p) => p.especialidad)
      .map((p) => p.especialidad);
    return [...new Set(especialidades)];
  }

  get departamentosUnicos(): string[] {
    const departamentos = this.personalMedico
      .filter((p) => p.departamento)
      .map((p) => p.departamento!);
    return [...new Set(departamentos)];
  }

  // Validaciones para el formulario
  get esCedulaValida(): boolean {
    const cedula = this.personalForm.get('numero_cedula')?.value;
    return !cedula || (cedula.length >= 6 && /^\d+$/.test(cedula));
  }

  get esEmailValido(): boolean {
    const email = this.personalForm.get('correo_electronico')?.value;
    return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  get esTelefonoValido(): boolean {
    const telefono = this.personalForm.get('telefono')?.value;
    return !telefono || /^\d{10}$/.test(telefono);
  }

  get esCurpValida(): boolean {
    const curp = this.personalForm.get('curp')?.value;
    return !curp || /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9]{2}$/.test(curp);
  }



  // Métodos de validación
verificarUsuarioDisponible(): void {
  const usuario = this.personalForm.get('usuario')?.value;
  if (usuario && usuario.length >= 3) {
    // Simular verificación (aquí podrías llamar a un servicio)
    // this.personalMedicoService.verificarUsuario(usuario)
    this.usuarioYaExiste = false; // Cambiar según resultado
  }
}

verificarCorreoDisponible(): void {
  const correo = this.personalForm.get('correo_electronico')?.value;
  if (correo && this.esEmailValido) {
    this.correoYaExiste = false;
  }
}

verificarCurpDisponible(): void {
  const curp = this.personalForm.get('curp')?.value;
  if (curp && curp.length === 18) {
    this.curpYaExiste = false;
  }
}

verificarCedulaDisponible(): void {
  const cedula = this.personalForm.get('numero_cedula')?.value;
  if (cedula && cedula.length >= 6) {
    this.cedulaYaExiste = false;
  }
}

// Métodos para validar fortaleza de contraseña
obtenerClaseFortalezaPassword(password: string): string {
  const fortaleza = this.calcularFortalezaPassword(password);
  if (fortaleza >= 80) return 'bg-green-500';
  if (fortaleza >= 60) return 'bg-yellow-500';
  if (fortaleza >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

obtenerPorcentajeFortaleza(password: string): number {
  return this.calcularFortalezaPassword(password);
}

obtenerTextoFortaleza(password: string): {texto: string, clase: string} {
  const fortaleza = this.calcularFortalezaPassword(password);
  if (fortaleza >= 80) return {texto: 'Fuerte', clase: 'text-green-600'};
  if (fortaleza >= 60) return {texto: 'Buena', clase: 'text-yellow-600'};
  if (fortaleza >= 40) return {texto: 'Regular', clase: 'text-orange-600'};
  return {texto: 'Débil', clase: 'text-red-600'};
}

private calcularFortalezaPassword(password: string): number {
  if (!password) return 0;

  let puntos = 0;
  if (password.length >= 6) puntos += 25;
  if (password.length >= 8) puntos += 25;
  if (/[a-z]/.test(password)) puntos += 10;
  if (/[A-Z]/.test(password)) puntos += 10;
  if (/[0-9]/.test(password)) puntos += 15;
  if (/[^a-zA-Z0-9]/.test(password)) puntos += 15;

  return Math.min(puntos, 100);
}

get tieneConflictos(): boolean {
  return this.usuarioYaExiste || this.correoYaExiste || this.curpYaExiste || this.cedulaYaExiste;
}
}
