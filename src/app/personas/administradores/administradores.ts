// src/app/personas/administradores/administradores.ts
import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

// Importaciones de modelos y servicios
import {
  Administrador,
  AdministradorFilters,
  EstadisticasAdministradores,
  CreateAdministradorDto,
  UpdateAdministradorDto,
  NivelAcceso,
  ApiResponse,
  Genero,
  EstadoCivil,
  ADMINISTRADOR_CONFIG
} from '../../models';
import { AdministradorService } from '../../services/personas/administradores';
import { PersonasService } from '../../services/personas/personas';
import { CreatePersonaFrontendDto } from '../../models';

@Component({
  selector: 'app-administradores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './administradores.html',
  styleUrl: './administradores.css'
})
export class Administradores implements OnInit, OnDestroy {

  // ==========================================
  // INYECCIÓN DE DEPENDENCIAS
  // ==========================================
  private administradorService = inject(AdministradorService);
  private personasService = inject(PersonasService); // ← Agregar esta línea

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // ==========================================
  // PROPIEDADES DEL COMPONENTE
  // ==========================================

  // Datos principales
  administradores: Administrador[] = [];
  administradorSeleccionado: Administrador | null = null;
  estadisticas: EstadisticasAdministradores | null = null;

  // Estados de la UI
  loading = false;
  error: string | null = null;
  success: string | null = null;
  mostrarFiltros = false;
  mostrarEstadisticas = false; // Cambiado: estadísticas ocultas por defecto
  mostrarModal = false;
  mostrarModalPerfil = false;
  mostrarModalPassword = false;
  vistaActual: 'tabla' | 'tarjetas' = 'tarjetas';

  // Formularios
  textoBusqueda = '';
  filtrosForm!: FormGroup;
  administradorForm!: FormGroup;
  passwordForm!: FormGroup;
  filtrosAplicados: AdministradorFilters = {};

  // Estados del formulario
  isEditMode = false;
  administradorEnEdicion: Administrador | null = null;
  procesandoFormulario = false;

  menuAccionesAbierto: number | null = null;
fechaActualizacion: string = new Date().toISOString();


 private actualizarFechaActualizacion(): void {
    this.fechaActualizacion = new Date().toISOString();
  }

  // Configuraciones
  readonly nivelesAcceso = [
    { valor: NivelAcceso.USUARIO, etiqueta: 'Usuario', descripcion: 'Acceso básico al sistema' },
    { valor: NivelAcceso.SUPERVISOR, etiqueta: 'Supervisor', descripcion: 'Supervisa operaciones y reportes' },
    { valor: NivelAcceso.ADMINISTRADOR, etiqueta: 'Administrador', descripcion: 'Control total del sistema' }
  ];

  readonly opcionesActivo: { valor: boolean | '', etiqueta: string }[] = [
    { valor: '', etiqueta: 'Todos' },
    { valor: true, etiqueta: 'Activos' },
    { valor: false, etiqueta: 'Inactivos' }
  ];

  readonly opcionesGenero = [
    { valor: 'M', etiqueta: 'Masculino' },
    { valor: 'F', etiqueta: 'Femenino' }
  ];

  readonly estadosCiviles = [
    { valor: EstadoCivil.SOLTERO, etiqueta: 'Soltero(a)' },
    { valor: EstadoCivil.CASADO, etiqueta: 'Casado(a)' },
    { valor: EstadoCivil.DIVORCIADO, etiqueta: 'Divorciado(a)' },
    { valor: EstadoCivil.VIUDO, etiqueta: 'Viudo(a)' },
    { valor: EstadoCivil.UNION_LIBRE, etiqueta: 'Unión libre' }
  ];

  // Exponer enums para el template
  readonly NivelAcceso = NivelAcceso;
  readonly CONFIG = ADMINISTRADOR_CONFIG;

 // ==========================================
// MÉTODOS PARA TRACKING Y TEMPLATE
// ==========================================

trackByAdministradorId(index: number, administrador: Administrador): number {
  return administrador.id_administrador;
}

// ==========================================
// GETTERS ADICIONALES PARA VALIDACIONES
// ==========================================

get formValid(): boolean {
  return this.administradorForm.valid;
}

get passwordFormValid(): boolean {
  return this.passwordForm.valid;
}
// También puedes agregar este método auxiliar si no lo tienes
obtenerNombreCompleto(administrador: Administrador): string {
  return this.construirNombreCompleto(administrador);
}

// Agregar estos métodos
toggleMenuAcciones(adminId: number): void {
  this.menuAccionesAbierto = this.menuAccionesAbierto === adminId ? null : adminId;
}

// Cerrar menú al hacer clic fuera (opcional)
@HostListener('document:click', ['$event'])
onDocumentClick(event: Event): void {
  this.menuAccionesAbierto = null;
}

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

  // ==========================================
  // INICIALIZACIÓN DE FORMULARIOS
  // ==========================================

  // private initializeForms(): void {
  //   this.filtrosForm = this.fb.group({
  //     activo: [''],
  //     nivel_acceso: [''],
  //     usuario: [''],
  //     buscar: ['']
  //   });

  //   this.administradorForm = this.fb.group({
  //     // Datos de administrador
  //     usuario: ['', [Validators.required, Validators.minLength(this.CONFIG.USUARIO_MIN_LENGTH)]],
  //     password: ['', [Validators.required, Validators.minLength(this.CONFIG.PASSWORD_MIN_LENGTH)]],
  //     password_texto: ['', [Validators.required, Validators.minLength(this.CONFIG.PASSWORD_MIN_LENGTH)]],
  //     nivel_acceso: [NivelAcceso.USUARIO, [Validators.required]],
  //     activo: [true],
  //     // Datos de persona
  //     nombre: ['', [Validators.required, Validators.minLength(2)]],
  //     apellido_paterno: ['', [Validators.required, Validators.minLength(2)]],
  //     apellido_materno: [''],
  //     fecha_nacimiento: ['', [Validators.required]],
  //     genero: ['', [Validators.required]],
  //     telefono: ['', [Validators.pattern(/^\d{10}$/)]],
  //     email: ['', [Validators.required, Validators.email]],
  //     estado_civil: ['']
  //   });

  //   this.passwordForm = this.fb.group({
  //     password_actual: ['', [Validators.required]],
  //     password_nuevo: ['', [Validators.required, Validators.minLength(this.CONFIG.PASSWORD_MIN_LENGTH)]],
  //     confirmar_password: ['', [Validators.required]]
  //   });
  // }

  // En src/app/personas/administradores/administradores.ts
// CAMBIAR initializeForms()

private initializeForms(): void {
  this.filtrosForm = this.fb.group({
    activo: [''],
    nivel_acceso: [''],
    usuario: [''],
    buscar: ['']
  });

  this.administradorForm = this.fb.group({
    // Datos de administrador
    usuario: ['', [Validators.required, Validators.minLength(this.CONFIG.USUARIO_MIN_LENGTH)]],
    // 🔥 CAMBIO: Solo un campo de password
    password: ['', [Validators.required, Validators.minLength(this.CONFIG.PASSWORD_MIN_LENGTH)]],
    nivel_acceso: [NivelAcceso.USUARIO, [Validators.required]],
    activo: [true],
    // Datos de persona
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido_paterno: ['', [Validators.required, Validators.minLength(2)]],
    apellido_materno: [''],
    fecha_nacimiento: ['', [Validators.required]],
    genero: ['', [Validators.required]],
    telefono: ['', [Validators.pattern(/^\d{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    estado_civil: ['']
  });

  // 🔥 CAMBIO: Simplificar passwordForm
  this.passwordForm = this.fb.group({
    password_actual: ['', [Validators.required]],
    password_nuevo: ['', [Validators.required, Validators.minLength(this.CONFIG.PASSWORD_MIN_LENGTH)]],
    confirmar_password: ['', [Validators.required]]
  });
}

  // ==========================================
  // MÉTODOS DE INICIALIZACIÓN
  // ==========================================

  private inicializarComponente(): void {
    this.cargarAdministradores();
    this.cargarEstadisticas();
  }

  private configurarBusquedaEnTiempoReal(): void {
    this.filtrosForm.get('buscar')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(valor => {
        this.textoBusqueda = valor;
        this.aplicarFiltros();
      });
  }

  private suscribirAEstadoDelServicio(): void {
    this.administradorService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.administradorService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error = error);

    this.administradorService.administradores$
      .pipe(takeUntil(this.destroy$))
      .subscribe(administradores => {
        this.administradores = administradores;
      });
  }

  // ==========================================
  // MÉTODOS CRUD
  // ==========================================

  // cargarAdministradores(): void {
  //   this.limpiarMensajes();
  //   this.administradorService.getAdministradores(this.filtrosAplicados)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (response) => {
  //         if (response.success && response.data) {
  //           this.administradores = response.data;
  //         } else {
  //           this.mostrarError(response.message || 'Error al cargar administradores');
  //         }
  //       },
  //       error: (err) => {
  //         this.mostrarError(err.message || 'Error al cargar administradores');
  //       }
  //     });
  // }
cargarAdministradores(): void {
    this.limpiarMensajes();
    this.actualizarFechaActualizacion(); // ← Agregar esta línea
    this.administradorService.getAdministradores(this.filtrosAplicados)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.administradores = response.data;
          } else {
            this.mostrarError(response.message || 'Error al cargar administradores');
          }
        },
        error: (err) => {
          this.mostrarError(err.message || 'Error al cargar administradores');
        }
      });
  }


  cargarEstadisticas(): void {
    // SIMPLIFICADO: Solo cargar estadísticas básicas
    this.administradorService.getEstadisticas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.estadisticas = response.data;
          }
        },
        error: (err) => {
          // Error silencioso - las estadísticas no son críticas
          console.warn('Estadísticas no disponibles:', err);
        }
      });
  }

  // ==========================================
  // MÉTODOS DEL FORMULARIO
  // ==========================================

  mostrarFormularioCrear(): void {
    this.isEditMode = false;
    this.administradorEnEdicion = null;
    this.administradorForm.reset();
    this.administradorForm.patchValue({
      activo: true,
      nivel_acceso: NivelAcceso.USUARIO,
      genero: 'M'
    });
    this.mostrarModal = true;
  }

  mostrarFormularioEditar(administrador: Administrador): void {
    this.isEditMode = true;
    this.administradorEnEdicion = administrador;

    this.administradorForm.patchValue({
      usuario: administrador.usuario,
      nivel_acceso: administrador.nivel_acceso,
      activo: administrador.activo,
      nombre: administrador.persona?.nombre || '',
      apellido_paterno: administrador.persona?.apellido_paterno || '',
      apellido_materno: administrador.persona?.apellido_materno || '',
      genero: administrador.persona?.genero || 'M',
      telefono: administrador.persona?.telefono || '',
      email: administrador.persona?.email || ''
    });

    // En modo edición, no requerir contraseña
    this.administradorForm.get('password')?.clearValidators();
    this.administradorForm.get('password_texto')?.clearValidators();
    this.administradorForm.get('password')?.updateValueAndValidity();
    this.administradorForm.get('password_texto')?.updateValueAndValidity();

    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.isEditMode = false;
    this.administradorEnEdicion = null;
    this.administradorForm.reset();
    this.procesandoFormulario = false;
    this.limpiarMensajes();
  }



  onSubmit(): void {
    if (this.administradorForm.invalid) {
      this.marcarCamposComoTocados();
      this.mostrarError('Por favor completa todos los campos requeridos');
      return;
    }

    this.procesandoFormulario = true;
    this.limpiarMensajes();

    const formData = this.administradorForm.value;

    if (this.isEditMode && this.administradorEnEdicion) {
      this.actualizarAdministrador(formData);
    } else {
      this.crearAdministrador(formData);
    }
  }

private crearAdministrador(formData: any): void {
  // 🔥 PRIMERO: Crear la persona
  const createPersonaDto: CreatePersonaFrontendDto = {
    nombre: formData.nombre,
    apellido_paterno: formData.apellido_paterno,
    apellido_materno: formData.apellido_materno,
    fecha_nacimiento: formData.fecha_nacimiento,
    genero: formData.genero, // Frontend usa 'genero'
    telefono: formData.telefono,
    email: formData.email, // Frontend usa 'email'
    estado_civil: formData.estado_civil,
    activo: true
  };

  console.log('🔄 Creando persona:', createPersonaDto);

  this.personasService.createPersona(createPersonaDto)
    .pipe(
      switchMap(personaResponse => {
        if (personaResponse.success && personaResponse.data) {
          console.log('  Persona creada con ID:', personaResponse.data.id_persona);

          // 🔥 SEGUNDO: Crear el administrador con el id_persona obtenido
          const createAdminDto: CreateAdministradorDto = {
            id_persona: personaResponse.data.id_persona!, // ← Usar el ID de la persona creada
            usuario: formData.usuario,
            password: formData.password,
            nivel_acceso: formData.nivel_acceso,
            activo: formData.activo
          };

          console.log('🔄 Creando administrador:', createAdminDto);
          return this.administradorService.createAdministrador(createAdminDto);
        } else {
          throw new Error(personaResponse.message || 'Error al crear la persona');
        }
      }),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: (response) => {
        if (response.success) {
          this.mostrarExito('Administrador creado exitosamente');
          this.cargarAdministradores();
          this.cargarEstadisticas();
          this.cerrarModal();
        } else {
          this.mostrarError(response.message || 'Error al crear administrador');
        }
        this.procesandoFormulario = false;
      },
      error: (err) => {
        console.error('❌ Error en el proceso:', err);
        this.mostrarError(err.message || 'Error al crear administrador');
        this.procesandoFormulario = false;
      }
    });
}

private actualizarAdministrador(formData: any): void {
  if (!this.administradorEnEdicion) return;

  // 🔥 CORRECCIÓN: Usar id_persona del administrador, no de persona
  if (this.administradorEnEdicion.id_persona) {
    const updatePersonaDto: Partial<CreatePersonaFrontendDto> = {
      nombre: formData.nombre,
      apellido_paterno: formData.apellido_paterno,
      apellido_materno: formData.apellido_materno,
      fecha_nacimiento: formData.fecha_nacimiento,
      genero: formData.genero,
      telefono: formData.telefono,
      email: formData.email,
      estado_civil: formData.estado_civil
    };

    console.log('🔄 Actualizando persona con ID:', this.administradorEnEdicion.id_persona);
    console.log('🔄 Datos a actualizar:', updatePersonaDto);

    // ← CAMBIO: usar this.administradorEnEdicion.id_persona en lugar de this.administradorEnEdicion.persona.id_persona
    this.personasService.updatePersona(this.administradorEnEdicion.id_persona, updatePersonaDto)
      .pipe(
        switchMap(personaResponse => {
          if (personaResponse.success) {
            console.log('  Persona actualizada');

            // 🔥 SEGUNDO: Actualizar el administrador
            const updateAdminDto: UpdateAdministradorDto = {
              usuario: formData.usuario,
              nivel_acceso: formData.nivel_acceso,
              activo: formData.activo
            };

            console.log('🔄 Actualizando administrador:', updateAdminDto);
            return this.administradorService.updateAdministrador(this.administradorEnEdicion!.id_administrador, updateAdminDto);
          } else {
            throw new Error(personaResponse.message || 'Error al actualizar la persona');
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.mostrarExito('Administrador actualizado exitosamente');
            this.cargarAdministradores();
            this.cargarEstadisticas();
            this.cerrarModal();
          } else {
            this.mostrarError(response.message || 'Error al actualizar administrador');
          }
          this.procesandoFormulario = false;
        },
        error: (err) => {
          console.error('❌ Error en el proceso:', err);
          this.mostrarError(err.message || 'Error al actualizar administrador');
          this.procesandoFormulario = false;
        }
      });
  } else {
    // Si no tiene id_persona, solo actualizar administrador
    const updateAdminDto: UpdateAdministradorDto = {
      usuario: formData.usuario,
      nivel_acceso: formData.nivel_acceso,
      activo: formData.activo
    };

    this.administradorService.updateAdministrador(this.administradorEnEdicion.id_administrador, updateAdminDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.mostrarExito('Administrador actualizado exitosamente');
            this.cargarAdministradores();
            this.cargarEstadisticas();
            this.cerrarModal();
          } else {
            this.mostrarError(response.message || 'Error al actualizar administrador');
          }
          this.procesandoFormulario = false;
        },
        error: (err) => {
          this.mostrarError(err.message || 'Error al actualizar administrador');
          this.procesandoFormulario = false;
        }
      });
  }
}

  private marcarCamposComoTocados(): void {
    Object.keys(this.administradorForm.controls).forEach(key => {
      this.administradorForm.get(key)?.markAsTouched();
    });
  }



  // ==========================================
  // MÉTODOS DE ACCIONES
  // ==========================================

  // NUEVA FUNCIÓN: Navegar a configuración del sistema
  irAConfiguracion(): void {
    this.router.navigate(['/app/admin/configuracion']);
  }

  // Verificar si el usuario actual puede ver configuración
  puedeVerConfiguracion(): boolean {
    // Aquí podrías verificar el nivel del usuario actual
    // Por ahora, permitimos acceso a todos los administradores
    return true;
  }

  verPerfilCompleto(administrador: Administrador): void {
    this.administradorSeleccionado = administrador;
    this.mostrarModalPerfil = true;
  }

  cerrarModalPerfil(): void {
    this.mostrarModalPerfil = false;
    this.administradorSeleccionado = null;
  }

  mostrarCambioPassword(administrador: Administrador): void {
    this.administradorSeleccionado = administrador;
    this.passwordForm.reset();
    this.mostrarModalPassword = true;
  }

  cerrarModalPassword(): void {
    this.mostrarModalPassword = false;
    this.administradorSeleccionado = null;
    this.passwordForm.reset();
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      this.mostrarError('Por favor completa todos los campos');
      return;
    }

    const { password_nuevo, confirmar_password } = this.passwordForm.value;

    if (password_nuevo !== confirmar_password) {
      this.mostrarError('Las contraseñas no coinciden');
      return;
    }

    if (!this.administradorSeleccionado) return;

    const changePasswordDto = {
      password_actual: this.passwordForm.value.password_actual,
      password_nuevo: this.passwordForm.value.password_nuevo
    };

    this.administradorService.changePassword(this.administradorSeleccionado.id_administrador, changePasswordDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.mostrarExito('Contraseña cambiada exitosamente');
            this.cerrarModalPassword();
          } else {
            this.mostrarError(response.message || 'Error al cambiar contraseña');
          }
        },
        error: (err) => {
          this.mostrarError(err.message || 'Error al cambiar contraseña');
        }
      });
  }

// En src/app/personas/administradores/administradores.ts
// Cambiar el método cambiarEstado:

cambiarEstado(administrador: Administrador): void {
  const nuevoEstado = !administrador.activo;
  const accion = nuevoEstado ? 'activar' : 'desactivar';

  if (confirm(`¿Está seguro de ${accion} al administrador ${administrador.usuario}?`)) {
    this.administradorService.toggleAdministrador(administrador.id_administrador, nuevoEstado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.mostrarExito(`Administrador ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
            this.cargarAdministradores();
            this.cargarEstadisticas();
          } else {
            this.mostrarError(response.message || 'Error al cambiar estado');
          }
        },
        error: (err) => {
          this.mostrarError(err.message || 'Error al cambiar estado');
        }
      });
  }
}

  eliminarAdministrador(administrador: Administrador): void {
    if (confirm(`¿Está seguro de eliminar al administrador ${administrador.usuario}?\n\nEsta acción no se puede deshacer.`)) {
      this.administradorService.deleteAdministrador(administrador.id_administrador)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.mostrarExito('Administrador eliminado correctamente');
              this.cargarEstadisticas();
            } else {
              this.mostrarError(response.message || 'Error al eliminar administrador');
            }
          },
          error: (err) => {
            this.mostrarError(err.message || 'Error al eliminar administrador');
          }
        });
    }
  }

  // ==========================================
  // MÉTODOS DE BÚSQUEDA Y FILTROS
  // ==========================================

  aplicarFiltros(): void {
    const valoresFiltros = this.filtrosForm.value;

    this.filtrosAplicados = {
      activo: valoresFiltros.activo === '' ? undefined : valoresFiltros.activo,
      nivel_acceso: valoresFiltros.nivel_acceso || undefined,
      usuario: valoresFiltros.usuario || undefined,
      search: this.textoBusqueda || undefined
    };

    this.cargarAdministradores();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.textoBusqueda = '';
    this.filtrosAplicados = {};
    this.cargarAdministradores();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

   // 🔥 MODIFICAR el método recargarDatos para actualizar la fecha
  recargarDatos(): void {
    this.limpiarMensajes();
    this.actualizarFechaActualizacion(); // ← Agregar esta línea
    this.cargarAdministradores();
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

  construirNombreCompleto(administrador: Administrador): string {
    if (!administrador.persona) return administrador.usuario;

    const partes = [
      administrador.persona.nombre,
      administrador.persona.apellido_paterno,
      administrador.persona.apellido_materno
    ].filter(Boolean);

    return partes.join(' ') || administrador.usuario;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'Nunca';
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerColorPorNivel(nivel: NivelAcceso): string {
    const colores = {
      [NivelAcceso.USUARIO]: 'bg-blue-100 text-blue-800 border-blue-200',
      [NivelAcceso.SUPERVISOR]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [NivelAcceso.ADMINISTRADOR]: 'bg-red-100 text-red-800 border-red-200'
    };
    return colores[nivel] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  obtenerIconoPorNivel(nivel: NivelAcceso): string {
    const iconos = {
      [NivelAcceso.USUARIO]: 'USR',
      [NivelAcceso.SUPERVISOR]: 'SUP',
      [NivelAcceso.ADMINISTRADOR]: 'ADM'
    };
    return iconos[nivel] || 'USR';
  }

  obtenerTextoEstado(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }



// En administradores.ts
getFormErrors(): string[] {
  const errors: string[] = [];
  Object.keys(this.administradorForm.controls).forEach(key => {
    const control = this.administradorForm.get(key);
    if (control && control.errors) {
      errors.push(`${key}: ${Object.keys(control.errors).join(', ')}`);
    }
  });
  return errors;
}

  obtenerClaseEstado(activo: boolean): string {
    return activo
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  }

  calcularDiasDesdeUltimoAcceso(fechaAcceso: string): number {
    if (!fechaAcceso) return 999;
    const hoy = new Date();
    const ultimo = new Date(fechaAcceso);
    const diferencia = hoy.getTime() - ultimo.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
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

  get hayAdministradores(): boolean {
    return this.administradores.length > 0;
  }

  get hayFiltrosAplicados(): boolean {
    return Object.keys(this.filtrosAplicados).some(key =>
      this.filtrosAplicados[key as keyof AdministradorFilters] !== undefined
    );
  }

  get totalAdministradores(): number {
    return this.administradores.length;
  }

  get administradoresActivos(): Administrador[] {
    return this.administradores.filter(a => a.activo);
  }

  get administradoresInactivos(): Administrador[] {
    return this.administradores.filter(a => !a.activo);
  }

  get administradoresPorNivel(): { [key: string]: Administrador[] } {
    return this.administradores.reduce((acc, admin) => {
      const nivel = admin.nivel_acceso;
      if (!acc[nivel]) acc[nivel] = [];
      acc[nivel].push(admin);
      return acc;
    }, {} as { [key: string]: Administrador[] });
  }

  // Validaciones para el formulario
  get esUsuarioValido(): boolean {
    const usuario = this.administradorForm.get('usuario')?.value;
    return !usuario || (usuario.length >= this.CONFIG.USUARIO_MIN_LENGTH);
  }

  get esEmailValido(): boolean {
    const email = this.administradorForm.get('email')?.value;
    return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  get esTelefonoValido(): boolean {
    const telefono = this.administradorForm.get('telefono')?.value;
    return !telefono || /^\d{10}$/.test(telefono);
  }

  get esPasswordValida(): boolean {
    const password = this.administradorForm.get('password')?.value;
    return !password || password.length >= this.CONFIG.PASSWORD_MIN_LENGTH;
  }
}
