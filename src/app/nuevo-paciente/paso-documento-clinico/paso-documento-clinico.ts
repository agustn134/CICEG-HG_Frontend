// // C:\CICEG-HG-APP\src\app\nuevo-paciente\paso-documento-clinico\paso-documento-clinico.ts
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// import { WizardStateService } from '../../services/wizard-state';
// import { DocumentosService } from '../../services/documentos-clinicos/documentos';
// import { CatalogoService } from '../../services/catalogo';
// import { DatosDocumento, WizardStep, EstadoWizard } from '../../models/wizard.models';
// import { CreateDocumentoClinicoDto, EstadoDocumento } from '../../models';

// // Interfaces para los tipos de documentos
// interface TipoDocumento {
//   id: number;
//   nombre: string;
//   categoria: string;
//   descripcion: string;
//   icono: string;
//   color: string;
//   requiere_internamiento: boolean;
//   orden_hospitalario: number; // Nuevo campo para orden lógico
//   es_inicial: boolean; // Si es documento inicial del expediente
// }

// @Component({
//   selector: 'app-paso-documento-clinico',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, FormsModule],
//   templateUrl: './paso-documento-clinico.html',
//   styleUrl: './paso-documento-clinico.css'
// })
// export class PasoDocumentoClinico implements OnInit, OnDestroy {

//   private destroy$ = new Subject<void>();

//   // Form
//   documentoForm!: FormGroup;

//   // Estados
//   isLoading = false;
//   progreso = 66.7; // 4/6 * 100
//   showDebugInfo = false;
//   autoGuardadoStatus = '';
//   estadoProceso: 'seleccionando' | 'creando' | 'completado' | 'error' = 'seleccionando';

//   // Datos acumulados
//   resumenPersona: any = null;
//   resumenPaciente: any = null;
//   resumenExpediente: any = null;
//   documentoCreado: any = null;

//   // Filtros y búsqueda
//   categoriaSeleccionada = 'todos';
//   textoBusqueda = '';
//   tipoSeleccionado: TipoDocumento | null = null;

//   // Catálogo de tipos de documentos (se cargan del backend)
//   tiposDocumento: TipoDocumento[] = [];

//   // Categorías disponibles
//   categorias = [
//     { value: 'todos', label: 'Todos los documentos', icono: 'fas fa-th-large' },
//     { value: 'Ingreso', label: 'Documentos de Ingreso', icono: 'fas fa-sign-in-alt' },
//     { value: 'Urgencias', label: 'Atención de Urgencias', icono: 'fas fa-ambulance' },
//     { value: 'Evolución', label: 'Notas de Evolución', icono: 'fas fa-chart-line' },
//     { value: 'Interconsulta', label: 'Interconsultas', icono: 'fas fa-user-md' },
//     { value: 'Quirúrgico', label: 'Documentos Quirúrgicos', icono: 'fas fa-procedures' },
//     { value: 'Egreso', label: 'Documentos de Egreso', icono: 'fas fa-sign-out-alt' },
//     { value: 'Legal', label: 'Documentos Legales', icono: 'fas fa-gavel' },
//     { value: 'Especialidad', label: 'Especialidades', icono: 'fas fa-stethoscope' }
//   ];

//   constructor(
//     private fb: FormBuilder,
//     private wizardStateService: WizardStateService,
//     private documentosService: DocumentosService,
//     private catalogoService: CatalogoService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.initializeForm();
//     this.loadTiposDocumento();
//     this.loadExistingData();
//     this.setupFormSubscriptions();
//     this.validatePreviousSteps();
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   // ==========================================
//   // INICIALIZACIÓN
//   // ==========================================

//   private initializeForm(): void {
//     this.documentoForm = this.fb.group({
//       tipo_documento: [null, [Validators.required]], // Cambiado a null para number
//       observaciones: [''],
//       crear_inmediatamente: [true]
//     });
//   }

//   private loadTiposDocumento(): void {
//     // Cargar tipos de documento del backend
//     this.catalogoService.getTiposDocumento()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (tipos) => {
//           this.tiposDocumento = tipos
//             .map(tipo => this.mapTipoDocumentoToLocal(tipo))
//             .filter(tipo => tipo !== null) as TipoDocumento[]; // Filtrar valores null y hacer type assertion
//           console.log('  Tipos de documento cargados:', this.tiposDocumento.length);
//         },
//         error: (error) => {
//           console.error('❌ Error al cargar tipos de documento:', error);
//           // Usar tipos básicos de fallback
//           this.loadFallbackTipos();
//         }
//       });
//   }

//   private mapTipoDocumentoToLocal(tipoBackend: any): TipoDocumento | null {
//     // Validar que tenemos los datos mínimos necesarios
//     if (!tipoBackend || !tipoBackend.nombre) {
//       console.warn('  Tipo de documento inválido:', tipoBackend);
//       return null;
//     }

//     // Mapear iconos y colores según el tipo
//     const iconosPorTipo: { [key: string]: string } = {
//       'Historia Clínica': 'fas fa-file-medical-alt',
//       'Historia Clínica Pediátrica': 'fas fa-baby',
//       'Nota de Urgencias': 'fas fa-ambulance',
//       'Nota de Evolución': 'fas fa-chart-line',
//       'Nota de Interconsulta': 'fas fa-user-md',
//       'Nota Preoperatoria': 'fas fa-procedures',
//       'Nota Preanestésica': 'fas fa-syringe',
//       'Nota Postoperatoria': 'fas fa-band-aid',
//       'Nota Postanestésica': 'fas fa-heartbeat',
//       'Nota de Egreso': 'fas fa-sign-out-alt',
//       'Nota de Psicología': 'fas fa-brain',
//       'Nota de Nutrición': 'fas fa-apple-alt',
//       'Control de Crecimiento y Desarrollo': 'fas fa-chart-area',
//       'Esquema de Vacunación': 'fas fa-shield-alt'
//     };

//     const coloresPorTipo: { [key: string]: string } = {
//       'Historia Clínica': 'blue',
//       'Historia Clínica Pediátrica': 'pink',
//       'Nota de Urgencias': 'red',
//       'Nota de Evolución': 'green',
//       'Nota de Interconsulta': 'purple',
//       'Nota Preoperatoria': 'orange',
//       'Nota Preanestésica': 'yellow',
//       'Nota Postoperatoria': 'indigo',
//       'Nota Postanestésica': 'teal',
//       'Nota de Egreso': 'indigo',
//       'Nota de Psicología': 'pink',
//       'Nota de Nutrición': 'lime',
//       'Control de Crecimiento y Desarrollo': 'cyan',
//       'Esquema de Vacunación': 'emerald'
//     };

//     const categoriasPorTipo: { [key: string]: string } = {
//       'Historia Clínica': 'Ingreso',
//       'Historia Clínica Pediátrica': 'Pediátrico',
//       'Nota de Urgencias': 'Urgencias',
//       'Nota de Evolución': 'Evolución',
//       'Nota de Interconsulta': 'Interconsulta',
//       'Nota Preoperatoria': 'Quirúrgico',
//       'Nota Preanestésica': 'Quirúrgico',
//       'Nota Postoperatoria': 'Quirúrgico',
//       'Nota Postanestésica': 'Quirúrgico',
//       'Nota de Egreso': 'Egreso',
//       'Nota de Psicología': 'Especialidad',
//       'Nota de Nutrición': 'Especialidad',
//       'Control de Crecimiento y Desarrollo': 'Pediátrico',
//       'Esquema de Vacunación': 'Pediátrico'
//     };

//     // ORDEN HOSPITALARIO LÓGICO (según flujo hospitalario real)
//     const ordenHospitalario: { [key: string]: number } = {
//       // 1. INGRESO - Documentos iniciales obligatorios
//       'Historia Clínica': 1,
//       'Historia Clínica Pediátrica': 2,

//       // 2. URGENCIAS - Si el paciente llega por urgencias
//       'Nota de Urgencias': 10,

//       // 3. INTERNAMIENTO - Documentos de seguimiento
//       'Nota de Evolución': 20,
//       'Nota de Interconsulta': 21,

//       // 4. ESPECIALIDADES - Durante internamiento
//       'Nota de Psicología': 30,
//       'Nota de Nutrición': 31,

//       // 5. QUIRÚRGICOS - Si requiere cirugía
//       'Nota Preoperatoria': 40,
//       'Nota Preanestésica': 41,
//       'Nota Postoperatoria': 42,
//       'Nota Postanestésica': 43,

//       // 6. PEDIÁTRICOS - Específicos
//       'Control de Crecimiento y Desarrollo': 50,
//       'Esquema de Vacunación': 51,

//       // 7. EGRESO - Documentos finales
//       'Nota de Egreso': 90
//     };

//     // Documentos iniciales (que se crean al inicio del expediente)
//     const documentosIniciales = [
//       'Historia Clínica',
//       'Historia Clínica Pediátrica',
//       'Nota de Urgencias'
//     ];

//     const tiposQueRequierenInternamiento = [
//       'Nota de Evolución',
//       'Nota Preoperatoria',
//       'Nota Preanestésica',
//       'Nota Postoperatoria',
//       'Nota Postanestésica',
//       'Nota de Egreso'
//     ];

//     return {
//       id: tipoBackend.id_tipo_documento || tipoBackend.id,
//       nombre: tipoBackend.nombre,
//       categoria: categoriasPorTipo[tipoBackend.nombre] || 'General',
//       descripcion: tipoBackend.descripcion || `Documento de tipo ${tipoBackend.nombre}`,
//       icono: iconosPorTipo[tipoBackend.nombre] || 'fas fa-file-medical',
//       color: coloresPorTipo[tipoBackend.nombre] || 'gray',
//       requiere_internamiento: tiposQueRequierenInternamiento.includes(tipoBackend.nombre),
//       orden_hospitalario: ordenHospitalario[tipoBackend.nombre] || 99,
//       es_inicial: documentosIniciales.includes(tipoBackend.nombre)
//     };
//   }

//   private loadFallbackTipos(): void {
//     // Tipos básicos de fallback si falla la carga del backend
//     this.tiposDocumento = [
//       {
//         id: 1,
//         nombre: 'Historia Clínica',
//         categoria: 'Ingreso',
//         descripcion: 'Documento principal con antecedentes completos del paciente',
//         icono: 'fas fa-file-medical-alt',
//         color: 'blue',
//         requiere_internamiento: false,
//         orden_hospitalario: 1,
//         es_inicial: true
//       },
//       {
//         id: 2,
//         nombre: 'Nota de Urgencias',
//         categoria: 'Urgencias',
//         descripcion: 'Atención médica de urgencia con triaje y tratamiento inmediato',
//         icono: 'fas fa-ambulance',
//         color: 'red',
//         requiere_internamiento: false,
//         orden_hospitalario: 10,
//         es_inicial: true
//       },
//       {
//         id: 3,
//         nombre: 'Nota de Evolución',
//         categoria: 'Evolución',
//         descripcion: 'Seguimiento diario del paciente hospitalizado (SOAP)',
//         icono: 'fas fa-chart-line',
//         color: 'green',
//         requiere_internamiento: true,
//         orden_hospitalario: 20,
//         es_inicial: false
//       },
//       {
//         id: 4,
//         nombre: 'Nota de Egreso',
//         categoria: 'Egreso',
//         descripcion: 'Resumen de alta hospitalaria con indicaciones',
//         icono: 'fas fa-sign-out-alt',
//         color: 'indigo',
//         requiere_internamiento: true,
//         orden_hospitalario: 90,
//         es_inicial: false
//       }
//     ];
//     console.log('  Usando tipos de documento de fallback');
//   }

//   private loadExistingData(): void {
//     const currentState = this.wizardStateService.getCurrentState();

//     console.log('  Estado actual del wizard:', currentState);

//     // Cargar datos de pasos anteriores
//     this.resumenPersona = currentState.datosPersona;
//     this.resumenPaciente = currentState.datosPaciente;
//     this.resumenExpediente = currentState.datosExpediente;

//     // Cargar datos del documento si existen
//     if (currentState.datosDocumento && Object.keys(currentState.datosDocumento).length > 0) {
//       this.documentoForm.patchValue(currentState.datosDocumento);

//       // Buscar tipo seleccionado - con validación de undefined
//       const tipoId = currentState.datosDocumento.tipo_documento;
//       if (tipoId && typeof tipoId === 'number') {
//         this.tipoSeleccionado = this.tiposDocumento.find(t => t.id === tipoId) || null;
//       }
//     }

//     // Si ya se completó el documento, mostrar estado completado
//     if (currentState.id_documento_creado) {
//       this.estadoProceso = 'completado';
//       this.documentoCreado = {
//         id_documento: currentState.id_documento_creado,
//         tipo_documento: this.tipoSeleccionado?.nombre || 'Documento Clínico',
//         fecha_elaboracion: new Date().toISOString(),
//         estado: 'Borrador'
//       };
//     }
//   }

//   private setupFormSubscriptions(): void {
//     // Auto-guardar cada 30 segundos
//     this.documentoForm.valueChanges
//       .pipe(
//         takeUntil(this.destroy$),
//         debounceTime(30000),
//         distinctUntilChanged()
//       )
//       .subscribe(() => {
//         this.guardarBorrador();
//       });
//   }

//   private validatePreviousSteps(): void {
//     const currentState = this.wizardStateService.getCurrentState();

//     console.log('  Validando pasos anteriores...');

//     // Verificar que existen todos los IDs necesarios
//     if (!currentState.id_persona_creada) {
//       console.error('❌ No hay ID de persona creada');
//       alert('Error: No se encontró el ID de la persona. Reinicie el proceso.');
//       this.wizardStateService.goToStep(WizardStep.PERSONA);
//       return;
//     }

//     if (!currentState.id_paciente_creado) {
//       console.error('❌ No hay ID de paciente creado');
//       alert('Error: No se encontró el ID del paciente. Reinicie el proceso.');
//       this.wizardStateService.goToStep(WizardStep.PACIENTE);
//       return;
//     }

//     if (!currentState.id_expediente_creado) {
//       console.error('❌ No hay ID de expediente creado');
//       alert('Error: No se encontró el ID del expediente. Reinicie el proceso.');
//       this.wizardStateService.goToStep(WizardStep.EXPEDIENTE);
//       return;
//     }

//     console.log('  Validación exitosa. IDs encontrados:', {
//       persona: currentState.id_persona_creada,
//       paciente: currentState.id_paciente_creado,
//       expediente: currentState.id_expediente_creado
//     });
//   }

//   // ==========================================
//   // FILTROS Y BÚSQUEDA - CON ORDEN HOSPITALARIO
//   // ==========================================

//   get tiposFiltrados(): TipoDocumento[] {
//     let tipos = this.tiposDocumento;

//     // Filtrar por categoría
//     if (this.categoriaSeleccionada !== 'todos') {
//       tipos = tipos.filter(tipo => tipo.categoria === this.categoriaSeleccionada);
//     }

//     // Filtrar por texto de búsqueda - CON VALIDACIÓN
//     if (this.textoBusqueda.trim()) {
//       const busqueda = this.textoBusqueda.toLowerCase();
//       tipos = tipos.filter(tipo => {
//         // Validar que nombre y descripción existen antes de usar toLowerCase
//         const nombre = tipo.nombre ? tipo.nombre.toLowerCase() : '';
//         const descripcion = tipo.descripcion ? tipo.descripcion.toLowerCase() : '';
//         return nombre.includes(busqueda) || descripcion.includes(busqueda);
//       });
//     }

//     // ORDENAR POR FLUJO HOSPITALARIO LÓGICO
//     return tipos.sort((a, b) => {
//       // Primero por orden hospitalario
//       if (a.orden_hospitalario !== b.orden_hospitalario) {
//         return a.orden_hospitalario - b.orden_hospitalario;
//       }
//       // Si tienen el mismo orden, alfabético - CON VALIDACIÓN
//       const nombreA = a.nombre || '';
//       const nombreB = b.nombre || '';
//       return nombreA.localeCompare(nombreB);
//     });
//   }

//   get tiposIniciales(): TipoDocumento[] {
//     // Documentos que se crean al inicio del expediente
//     return this.tiposDocumento
//       .filter(tipo => tipo.es_inicial)
//       .sort((a, b) => a.orden_hospitalario - b.orden_hospitalario);
//   }

//   get tiposSeguimiento(): TipoDocumento[] {
//     // Documentos de seguimiento/evolución
//     return this.tiposDocumento
//       .filter(tipo => !tipo.es_inicial && tipo.orden_hospitalario < 90)
//       .sort((a, b) => a.orden_hospitalario - b.orden_hospitalario);
//   }

//   get tiposEgreso(): TipoDocumento[] {
//     // Documentos de egreso
//     return this.tiposDocumento
//       .filter(tipo => tipo.orden_hospitalario >= 90)
//       .sort((a, b) => a.orden_hospitalario - b.orden_hospitalario);
//   }

//   // ==========================================
//   // UTILIDADES
//   // ==========================================

//   calcularEdad(fechaNacimiento: string): number {
//     if (!fechaNacimiento) return 0;

//     const today = new Date();
//     const birthDate = new Date(fechaNacimiento);
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDiff = today.getMonth() - birthDate.getMonth();

//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//       age--;
//     }

//     return age;
//   }

//   getColorClase(color: string): string {
//     const colores: { [key: string]: string } = {
//       'blue': 'border-blue-200 bg-blue-50 text-blue-800',
//       'red': 'border-red-200 bg-red-50 text-red-800',
//       'green': 'border-green-200 bg-green-50 text-green-800',
//       'purple': 'border-purple-200 bg-purple-50 text-purple-800',
//       'orange': 'border-orange-200 bg-orange-50 text-orange-800',
//       'indigo': 'border-indigo-200 bg-indigo-50 text-indigo-800',
//       'gray': 'border-gray-200 bg-gray-50 text-gray-800',
//       'pink': 'border-pink-200 bg-pink-50 text-pink-800',
//       'lime': 'border-lime-200 bg-lime-50 text-lime-800'
//     };
//     return colores[color] || colores['gray'];
//   }

//   getColorClaseHover(color: string): string {
//     const colores: { [key: string]: string } = {
//       'blue': 'hover:border-blue-300 hover:bg-blue-100',
//       'red': 'hover:border-red-300 hover:bg-red-100',
//       'green': 'hover:border-green-300 hover:bg-green-100',
//       'purple': 'hover:border-purple-300 hover:bg-purple-100',
//       'orange': 'hover:border-orange-300 hover:bg-orange-100',
//       'indigo': 'hover:border-indigo-300 hover:bg-indigo-100',
//       'gray': 'hover:border-gray-300 hover:bg-gray-100',
//       'pink': 'hover:border-pink-300 hover:bg-pink-100',
//       'lime': 'hover:border-lime-300 hover:bg-lime-100'
//     };
//     return colores[color] || colores['gray'];
//   }

//   // ==========================================
//   // ACCIONES
//   // ==========================================

//   seleccionarTipo(tipo: TipoDocumento): void {
//     this.tipoSeleccionado = tipo;
//     this.documentoForm.patchValue({
//       tipo_documento: tipo.id
//     });
//   }

//   limpiarSeleccion(): void {
//     this.tipoSeleccionado = null;
//     this.documentoForm.patchValue({
//       tipo_documento: null
//     });
//   }

//   onSubmit(): void {
//     console.log('🔄 Form submitted. Valid:', this.documentoForm.valid);

//     if (this.documentoForm.valid && this.tipoSeleccionado && !this.isLoading) {
//       if (this.documentoForm.get('crear_inmediatamente')?.value) {
//         this.crearDocumento();
//       } else {
//         this.guardarSeleccionYContinuar();
//       }
//     } else {
//       console.log('❌ Form invalid o tipo no seleccionado');
//       this.markAllFieldsAsTouched();
//     }
//   }

//   /**
//    * Crear documento inmediatamente en la base de datos
//    */
//   private crearDocumento(): void {
//     this.isLoading = true;
//     this.estadoProceso = 'creando';
//     this.autoGuardadoStatus = 'Creando documento clínico...';
//     this.wizardStateService.setWizardEstado(EstadoWizard.COMPLETANDO);

//     const currentState = this.wizardStateService.getCurrentState();
//     const formData = this.documentoForm.value;

//     // Verificar que tenemos el ID del expediente
//     const idExpediente = currentState.id_expediente_creado;
//     if (!idExpediente) {
//       console.error('❌ No se encontró el ID del expediente');
//       alert('Error: No se encontró el ID del expediente. Reinicie el proceso.');
//       this.isLoading = false;
//       this.estadoProceso = 'error';
//       this.autoGuardadoStatus = '';
//       return;
//     }

//     try {
//       // Validar que tenemos un tipo seleccionado
//       if (!this.tipoSeleccionado || !this.tipoSeleccionado.id) {
//         console.error('❌ No hay tipo de documento seleccionado');
//         alert('Error: Debe seleccionar un tipo de documento.');
//         this.isLoading = false;
//         this.estadoProceso = 'error';
//         this.autoGuardadoStatus = '';
//         return;
//       }

//       // Preparar datos para crear documento
//       const documentoData: CreateDocumentoClinicoDto = {
//         id_expediente: idExpediente,
//         id_tipo_documento: this.tipoSeleccionado.id,
//         id_personal_creador: 1, // ID fijo temporal
//         fecha_elaboracion: new Date().toISOString(),
//         estado: EstadoDocumento.BORRADOR,
//         observaciones: formData.observaciones || undefined,
//         es_digital: true,
//         requiere_firma: false
//       };

//       console.log('🚀 Enviando al backend (DocumentosService):', documentoData);

//       // Llamada real al backend
//       this.documentosService.createDocumentoClinico(documentoData).subscribe({
//         next: (response) => {
//           console.log('  Respuesta del backend (documento creado):', response);

//           if (response.success && response.data) {
//             // Actualizar datos en el wizard state
//             const datosDocumentoCompletos: Partial<DatosDocumento> = {
//               id_expediente: idExpediente,
//               tipo_documento: formData.tipo_documento,
//               fecha_elaboracion: response.data.fecha_elaboracion || new Date().toISOString(),
//               observaciones: formData.observaciones
//             };

//             this.wizardStateService.updateDocumentoData(datosDocumentoCompletos);

//             // Guardar ID del documento creado
//             this.wizardStateService.updateIds({
//               id_documento: response.data.id_documento!
//             });

//             // Marcar paso como completado
//             this.wizardStateService.markStepAsCompleted(WizardStep.DOCUMENTO_CLINICO);

//             // Actualizar estado local
//             this.documentoCreado = {
//               id_documento: response.data.id_documento,
//               tipo_documento: this.tipoSeleccionado!.nombre,
//               fecha_elaboracion: response.data.fecha_elaboracion || new Date().toISOString(),
//               estado: response.data.estado
//             };

//             // Actualizar UI
//             this.isLoading = false;
//             this.estadoProceso = 'completado';
//             this.autoGuardadoStatus = '  Documento clínico creado exitosamente';

//             console.log('  Documento creado con ID:', response.data.id_documento);
//             console.log('  Tipo documento:', this.tipoSeleccionado!.nombre);

//             // Navegar al siguiente paso después de una breve pausa
//             setTimeout(() => {
//               this.wizardStateService.goToNextStep();
//             }, 2000);

//           } else {
//             throw new Error(response.message || 'Error desconocido al crear documento');
//           }
//         },

//         error: (error) => {
//           console.error('❌ Error al crear documento:', error);

//           this.isLoading = false;
//           this.estadoProceso = 'error';

//           // Determinar mensaje de error apropiado
//           let errorMessage = '❌ Error al crear documento clínico';

//           if (error.error?.message) {
//             errorMessage = `❌ ${error.error.message}`;
//           } else if (error.message) {
//             errorMessage = `❌ ${error.message}`;
//           } else if (error.status === 0) {
//             errorMessage = '❌ Sin conexión al servidor';
//           } else if (error.status >= 400 && error.status < 500) {
//             errorMessage = '❌ Error en los datos enviados';
//           } else if (error.status >= 500) {
//             errorMessage = '❌ Error del servidor';
//           }

//           this.autoGuardadoStatus = errorMessage;

//           // Limpiar mensaje de error después de 8 segundos
//           setTimeout(() => {
//             this.autoGuardadoStatus = '';
//           }, 8000);
//         }
//       });

//     } catch (error) {
//       console.error('❌ Error al preparar datos:', error);
//       this.isLoading = false;
//       this.estadoProceso = 'error';
//       this.autoGuardadoStatus = '❌ Error al procesar datos del formulario';

//       setTimeout(() => {
//         this.autoGuardadoStatus = '';
//       }, 5000);
//     }
//   }

//   /**
//    * Guardar selección sin crear documento (para completar después)
//    */
//   private guardarSeleccionYContinuar(): void {
//     this.isLoading = true;
//     this.autoGuardadoStatus = 'Guardando selección...';

//     try {
//       const formData = this.documentoForm.value;

//       // Validar que tenemos un tipo seleccionado
//       if (!formData.tipo_documento || !this.tipoSeleccionado) {
//         console.error('❌ No hay tipo de documento seleccionado');
//         alert('Error: Debe seleccionar un tipo de documento.');
//         this.isLoading = false;
//         this.autoGuardadoStatus = '';
//         return;
//       }

//       // Actualizar datos en el wizard state
//       const datosDocumento: Partial<DatosDocumento> = {
//         tipo_documento: formData.tipo_documento,
//         observaciones: formData.observaciones,
//         fecha_elaboracion: new Date().toISOString()
//       };

//       this.wizardStateService.updateDocumentoData(datosDocumento);
//       this.wizardStateService.markStepAsCompleted(WizardStep.DOCUMENTO_CLINICO);

//       this.isLoading = false;
//       this.autoGuardadoStatus = '  Selección guardada exitosamente';

//       console.log('  Selección guardada:', datosDocumento);

//       // Navegar al siguiente paso
//       setTimeout(() => {
//         this.wizardStateService.goToNextStep();
//       }, 1000);

//     } catch (error) {
//       console.error('❌ Error al guardar selección:', error);
//       this.isLoading = false;
//       this.autoGuardadoStatus = '❌ Error al guardar selección';

//       setTimeout(() => {
//         this.autoGuardadoStatus = '';
//       }, 3000);
//     }
//   }

//   /**
//    * Guardar borrador (solo en wizard state, no en backend)
//    */
//   guardarBorrador(): void {
//     if (!this.isLoading && this.documentoForm.dirty) {
//       console.log('💾 Guardando borrador de documento...');

//       const formData = this.documentoForm.value as Partial<DatosDocumento>;

//       try {
//         this.wizardStateService.updateDocumentoData(formData);
//         console.log('💾 Borrador de documento guardado automáticamente');
//       } catch (error) {
//         console.error('❌ Error al guardar borrador:', error);
//       }
//     }
//   }

//   goBack(): void {
//     console.log('⬅️ Navegando hacia atrás');

//     // Guardar borrador antes de salir si hay cambios
//     if (this.documentoForm.dirty) {
//       console.log('💾 Guardando borrador antes de salir');
//       this.guardarBorrador();
//     }

//     // Navegar al paso anterior
//     this.wizardStateService.goToPreviousStep();
//   }

//   continuar(): void {
//     console.log('➡️ Continuando al siguiente paso');
//     this.wizardStateService.goToNextStep();
//   }

//   private markAllFieldsAsTouched(): void {
//     Object.keys(this.documentoForm.controls).forEach(key => {
//       this.documentoForm.get(key)?.markAsTouched();
//     });
//   }

//   // ==========================================
//   // MÉTODOS PARA DEBUGGING
//   // ==========================================

//   /** Método para testing - mostrar estado del wizard */
//   get currentWizardState() {
//     return this.showDebugInfo ? this.wizardStateService.getCurrentState() : null;
//   }

//   /** Verificar si el formulario está listo para enviar */
//   get canSubmit(): boolean {
//     return this.documentoForm.valid && !!this.tipoSeleccionado && !this.isLoading && this.estadoProceso === 'seleccionando';
//   }

//   /** Verificar si se puede continuar al siguiente paso */
//   get canContinue(): boolean {
//     return this.estadoProceso === 'completado' && !this.isLoading;
//   }

//   /** Verificar si se puede guardar borrador */
//   get canSaveDraft(): boolean {
//     return this.documentoForm.dirty && !this.isLoading && this.estadoProceso === 'seleccionando';
//   }
// }




































































// C:\CICEG-HG-APP\src\app\nuevo-paciente\paso-documento-clinico\paso-documento-clinico.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { WizardStateService } from '../../services/wizard-state';
import { DocumentosService } from '../../services/documentos-clinicos/documentos';
import { CatalogoService } from '../../services/catalogo';
import { DatosDocumento, WizardStep, EstadoWizard } from '../../models/wizard.models';
import { CreateDocumentoClinicoDto, EstadoDocumento } from '../../models';

// Interfaces para los tipos de documentos
interface TipoDocumento {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  icono: string;
  color: string;
  requiere_internamiento: boolean;
  orden_hospitalario: number; // Nuevo campo para orden lógico
  es_inicial: boolean; // Si es documento inicial del expediente
}

@Component({
  selector: 'app-paso-documento-clinico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './paso-documento-clinico.html',
  styleUrl: './paso-documento-clinico.css'
})
export class PasoDocumentoClinico implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Form
  documentoForm!: FormGroup;

  // Estados
  isLoading = false;
  progreso = 66.7; // 4/6 * 100
  showDebugInfo = false;
  autoGuardadoStatus = '';
  estadoProceso: 'seleccionando' | 'creando' | 'completado' | 'error' = 'seleccionando';

  // Datos acumulados
  resumenPersona: any = null;
  resumenPaciente: any = null;
  resumenExpediente: any = null;
  documentoCreado: any = null;

  // Filtros y búsqueda
  categoriaSeleccionada = 'todos';
  textoBusqueda = '';
  tipoSeleccionado: TipoDocumento | null = null;

  // Catálogo de tipos de documentos (se cargan del backend)
  tiposDocumento: TipoDocumento[] = [];

  // Categorías disponibles
  categorias = [
    { value: 'todos', label: 'Todos los documentos', icono: 'fas fa-th-large' },
    { value: 'Ingreso', label: 'Documentos de Ingreso', icono: 'fas fa-sign-in-alt' },
    { value: 'Urgencias', label: 'Atención de Urgencias', icono: 'fas fa-ambulance' },
    { value: 'Evolución', label: 'Notas de Evolución', icono: 'fas fa-chart-line' },
    { value: 'Interconsulta', label: 'Interconsultas', icono: 'fas fa-user-md' },
    { value: 'Quirúrgico', label: 'Documentos Quirúrgicos', icono: 'fas fa-procedures' },
    { value: 'Egreso', label: 'Documentos de Egreso', icono: 'fas fa-sign-out-alt' },
    { value: 'Legal', label: 'Documentos Legales', icono: 'fas fa-gavel' },
    { value: 'Especialidad', label: 'Especialidades', icono: 'fas fa-stethoscope' }
  ];

  constructor(
    private fb: FormBuilder,
    private wizardStateService: WizardStateService,
    private documentosService: DocumentosService,
    private catalogoService: CatalogoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadTiposDocumento();
    this.loadExistingData();
    this.setupFormSubscriptions();
    this.validatePreviousSteps();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  private initializeForm(): void {
    this.documentoForm = this.fb.group({
      tipo_documento: [null, [Validators.required]], // Cambiado a null para number
      observaciones: [''],
      crear_inmediatamente: [true]
    });
  }

  private loadTiposDocumento(): void {
    console.log('🔄 Iniciando carga de tipos de documento...');

    // Cargar tipos de documento del backend
    this.catalogoService.getTiposDocumento()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tipos) => {
          console.log('📦 Tipos recibidos del backend:', tipos);

          // Mapear y filtrar tipos válidos
          this.tiposDocumento = tipos
            .map(tipo => this.mapTipoDocumentoToLocal(tipo))
            .filter(tipo => tipo !== null) as TipoDocumento[];

          console.log('  Tipos de documento mapeados:', this.tiposDocumento.length);
          console.log('📋 Lista final de tipos:', this.tiposDocumento);
        },
        error: (error) => {
          console.error('❌ Error al cargar tipos de documento:', error);
          // Usar tipos básicos de fallback
          this.loadFallbackTipos();
        }
      });
  }

  private mapTipoDocumentoToLocal(tipoBackend: any): TipoDocumento | null {
    console.log('🔄 Mapeando tipo de documento:', tipoBackend);

    // Validar que tenemos los datos mínimos necesarios
    if (!tipoBackend) {
      console.warn('  Tipo de documento es null/undefined');
      return null;
    }

    if (!tipoBackend.nombre && !tipoBackend.label) {
      console.warn('  Tipo de documento sin nombre:', tipoBackend);
      return null;
    }

    // Obtener nombre del tipo (puede venir como 'nombre' o 'label')
    const nombreTipo = tipoBackend.nombre || tipoBackend.label || 'Documento Desconocido';
    const idTipo = tipoBackend.id_tipo_documento || tipoBackend.id || tipoBackend.value;

    if (!idTipo) {
      console.warn('  Tipo de documento sin ID:', tipoBackend);
      return null;
    }

    // Mapear iconos y colores según el tipo
    const iconosPorTipo: { [key: string]: string } = {
      'Historia Clínica': 'fas fa-file-medical-alt',
      'Historia Clínica Pediátrica': 'fas fa-baby',
      'Nota de Urgencias': 'fas fa-ambulance',
      'Nota de Evolución': 'fas fa-chart-line',
      'Nota de Interconsulta': 'fas fa-user-md',
      'Nota Preoperatoria': 'fas fa-procedures',
      'Nota Preanestésica': 'fas fa-syringe',
      'Nota Postoperatoria': 'fas fa-band-aid',
      'Nota Postanestésica': 'fas fa-heartbeat',
      'Nota de Egreso': 'fas fa-sign-out-alt',
      'Nota de Psicología': 'fas fa-brain',
      'Nota de Nutrición': 'fas fa-apple-alt',
      'Control de Crecimiento y Desarrollo': 'fas fa-chart-area',
      'Esquema de Vacunación': 'fas fa-shield-alt'
    };

    const coloresPorTipo: { [key: string]: string } = {
      'Historia Clínica': 'blue',
      'Historia Clínica Pediátrica': 'pink',
      'Nota de Urgencias': 'red',
      'Nota de Evolución': 'green',
      'Nota de Interconsulta': 'purple',
      'Nota Preoperatoria': 'orange',
      'Nota Preanestésica': 'yellow',
      'Nota Postoperatoria': 'indigo',
      'Nota Postanestésica': 'teal',
      'Nota de Egreso': 'indigo',
      'Nota de Psicología': 'pink',
      'Nota de Nutrición': 'lime',
      'Control de Crecimiento y Desarrollo': 'cyan',
      'Esquema de Vacunación': 'emerald'
    };

    const categoriasPorTipo: { [key: string]: string } = {
      'Historia Clínica': 'Ingreso',
      'Historia Clínica Pediátrica': 'Pediátrico',
      'Nota de Urgencias': 'Urgencias',
      'Nota de Evolución': 'Evolución',
      'Nota de Interconsulta': 'Interconsulta',
      'Nota Preoperatoria': 'Quirúrgico',
      'Nota Preanestésica': 'Quirúrgico',
      'Nota Postoperatoria': 'Quirúrgico',
      'Nota Postanestésica': 'Quirúrgico',
      'Nota de Egreso': 'Egreso',
      'Nota de Psicología': 'Especialidad',
      'Nota de Nutrición': 'Especialidad',
      'Control de Crecimiento y Desarrollo': 'Pediátrico',
      'Esquema de Vacunación': 'Pediátrico'
    };

    // ORDEN HOSPITALARIO LÓGICO (según flujo hospitalario real)
    const ordenHospitalario: { [key: string]: number } = {
      // 1. INGRESO - Documentos iniciales obligatorios
      'Historia Clínica': 1,
      'Historia Clínica Pediátrica': 2,

      // 2. URGENCIAS - Si el paciente llega por urgencias
      'Nota de Urgencias': 10,

      // 3. INTERNAMIENTO - Documentos de seguimiento
      'Nota de Evolución': 20,
      'Nota de Interconsulta': 21,

      // 4. ESPECIALIDADES - Durante internamiento
      'Nota de Psicología': 30,
      'Nota de Nutrición': 31,

      // 5. QUIRÚRGICOS - Si requiere cirugía
      'Nota Preoperatoria': 40,
      'Nota Preanestésica': 41,
      'Nota Postoperatoria': 42,
      'Nota Postanestésica': 43,

      // 6. PEDIÁTRICOS - Específicos
      'Control de Crecimiento y Desarrollo': 50,
      'Esquema de Vacunación': 51,

      // 7. EGRESO - Documentos finales
      'Nota de Egreso': 90
    };

    // Documentos iniciales (que se crean al inicio del expediente)
    const documentosIniciales = [
      'Historia Clínica',
      'Historia Clínica Pediátrica',
      'Nota de Urgencias'
    ];

    const tiposQueRequierenInternamiento = [
      'Nota de Evolución',
      'Nota Preoperatoria',
      'Nota Preanestésica',
      'Nota Postoperatoria',
      'Nota Postanestésica',
      'Nota de Egreso'
    ];

    const tipoDocumentoMapeado: TipoDocumento = {
      id: idTipo,
      nombre: nombreTipo,
      categoria: categoriasPorTipo[nombreTipo] || tipoBackend.categoria || 'General',
      descripcion: tipoBackend.descripcion || `Documento de tipo ${nombreTipo}`,
      icono: iconosPorTipo[nombreTipo] || 'fas fa-file-medical',
      color: coloresPorTipo[nombreTipo] || 'gray',
      requiere_internamiento: tipoBackend.requiere_internamiento ?? tiposQueRequierenInternamiento.includes(nombreTipo),
      orden_hospitalario: tipoBackend.orden_hospitalario ?? ordenHospitalario[nombreTipo] ?? 99,
      es_inicial: tipoBackend.es_inicial ?? documentosIniciales.includes(nombreTipo)
    };

    console.log('  Tipo mapeado correctamente:', tipoDocumentoMapeado);
    return tipoDocumentoMapeado;
  }

  private loadFallbackTipos(): void {
    // Tipos básicos de fallback si falla la carga del backend
    this.tiposDocumento = [
      {
        id: 1,
        nombre: 'Historia Clínica',
        categoria: 'Ingreso',
        descripcion: 'Documento principal con antecedentes completos del paciente',
        icono: 'fas fa-file-medical-alt',
        color: 'blue',
        requiere_internamiento: false,
        orden_hospitalario: 1,
        es_inicial: true
      },
      {
        id: 2,
        nombre: 'Nota de Urgencias',
        categoria: 'Urgencias',
        descripcion: 'Atención médica de urgencia con triaje y tratamiento inmediato',
        icono: 'fas fa-ambulance',
        color: 'red',
        requiere_internamiento: false,
        orden_hospitalario: 10,
        es_inicial: true
      },
      {
        id: 3,
        nombre: 'Nota de Evolución',
        categoria: 'Evolución',
        descripcion: 'Seguimiento diario del paciente hospitalizado (SOAP)',
        icono: 'fas fa-chart-line',
        color: 'green',
        requiere_internamiento: true,
        orden_hospitalario: 20,
        es_inicial: false
      },
      {
        id: 4,
        nombre: 'Nota de Egreso',
        categoria: 'Egreso',
        descripcion: 'Resumen de alta hospitalaria con indicaciones',
        icono: 'fas fa-sign-out-alt',
        color: 'indigo',
        requiere_internamiento: true,
        orden_hospitalario: 90,
        es_inicial: false
      }
    ];
    console.log('  Usando tipos de documento de fallback');
  }

  private loadExistingData(): void {
    const currentState = this.wizardStateService.getCurrentState();

    console.log('  Estado actual del wizard:', currentState);

    // Cargar datos de pasos anteriores
    this.resumenPersona = currentState.datosPersona;
    this.resumenPaciente = currentState.datosPaciente;
    this.resumenExpediente = currentState.datosExpediente;

    // Cargar datos del documento si existen
    if (currentState.datosDocumento && Object.keys(currentState.datosDocumento).length > 0) {
      this.documentoForm.patchValue(currentState.datosDocumento);

      // Buscar tipo seleccionado - con validación de undefined
      const tipoId = currentState.datosDocumento.tipo_documento;
      if (tipoId && typeof tipoId === 'number') {
        this.tipoSeleccionado = this.tiposDocumento.find(t => t.id === tipoId) || null;
      }
    }

    // Si ya se completó el documento, mostrar estado completado
    if (currentState.id_documento_creado) {
      this.estadoProceso = 'completado';
      this.documentoCreado = {
        id_documento: currentState.id_documento_creado,
        tipo_documento: this.tipoSeleccionado?.nombre || 'Documento Clínico',
        fecha_elaboracion: new Date().toISOString(),
        estado: 'Borrador'
      };
    }
  }

  private setupFormSubscriptions(): void {
    // Auto-guardar cada 30 segundos
    this.documentoForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(30000),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.guardarBorrador();
      });
  }

  private validatePreviousSteps(): void {
    const currentState = this.wizardStateService.getCurrentState();

    console.log('  Validando pasos anteriores...');

    // Verificar que existen todos los IDs necesarios
    if (!currentState.id_persona_creada) {
      console.error('❌ No hay ID de persona creada');
      alert('Error: No se encontró el ID de la persona. Reinicie el proceso.');
      this.wizardStateService.goToStep(WizardStep.PERSONA);
      return;
    }

    if (!currentState.id_paciente_creado) {
      console.error('❌ No hay ID de paciente creado');
      alert('Error: No se encontró el ID del paciente. Reinicie el proceso.');
      this.wizardStateService.goToStep(WizardStep.PACIENTE);
      return;
    }

    if (!currentState.id_expediente_creado) {
      console.error('❌ No hay ID de expediente creado');
      alert('Error: No se encontró el ID del expediente. Reinicie el proceso.');
      this.wizardStateService.goToStep(WizardStep.EXPEDIENTE);
      return;
    }

    console.log('  Validación exitosa. IDs encontrados:', {
      persona: currentState.id_persona_creada,
      paciente: currentState.id_paciente_creado,
      expediente: currentState.id_expediente_creado
    });
  }

  // ==========================================
  // FILTROS Y BÚSQUEDA - CON ORDEN HOSPITALARIO
  // ==========================================

  get tiposFiltrados(): TipoDocumento[] {
    let tipos = this.tiposDocumento;

    // Filtrar por categoría
    if (this.categoriaSeleccionada !== 'todos') {
      tipos = tipos.filter(tipo => tipo.categoria === this.categoriaSeleccionada);
    }

    // Filtrar por texto de búsqueda - CON VALIDACIÓN
    if (this.textoBusqueda.trim()) {
      const busqueda = this.textoBusqueda.toLowerCase();
      tipos = tipos.filter(tipo => {
        // Validar que nombre y descripción existen antes de usar toLowerCase
        const nombre = tipo.nombre ? tipo.nombre.toLowerCase() : '';
        const descripcion = tipo.descripcion ? tipo.descripcion.toLowerCase() : '';
        return nombre.includes(busqueda) || descripcion.includes(busqueda);
      });
    }

    // ORDENAR POR FLUJO HOSPITALARIO LÓGICO
    return tipos.sort((a, b) => {
      // Primero por orden hospitalario
      if (a.orden_hospitalario !== b.orden_hospitalario) {
        return a.orden_hospitalario - b.orden_hospitalario;
      }
      // Si tienen el mismo orden, alfabético - CON VALIDACIÓN
      const nombreA = a.nombre || '';
      const nombreB = b.nombre || '';
      return nombreA.localeCompare(nombreB);
    });
  }

  get tiposIniciales(): TipoDocumento[] {
    // Documentos que se crean al inicio del expediente
    return this.tiposDocumento
      .filter(tipo => tipo.es_inicial)
      .sort((a, b) => a.orden_hospitalario - b.orden_hospitalario);
  }

  get tiposSeguimiento(): TipoDocumento[] {
    // Documentos de seguimiento/evolución
    return this.tiposDocumento
      .filter(tipo => !tipo.es_inicial && tipo.orden_hospitalario < 90)
      .sort((a, b) => a.orden_hospitalario - b.orden_hospitalario);
  }

  get tiposEgreso(): TipoDocumento[] {
    // Documentos de egreso
    return this.tiposDocumento
      .filter(tipo => tipo.orden_hospitalario >= 90)
      .sort((a, b) => a.orden_hospitalario - b.orden_hospitalario);
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

  getColorClase(color: string): string {
    const colores: { [key: string]: string } = {
      'blue': 'border-blue-200 bg-blue-50 text-blue-800',
      'red': 'border-red-200 bg-red-50 text-red-800',
      'green': 'border-green-200 bg-green-50 text-green-800',
      'purple': 'border-purple-200 bg-purple-50 text-purple-800',
      'orange': 'border-orange-200 bg-orange-50 text-orange-800',
      'indigo': 'border-indigo-200 bg-indigo-50 text-indigo-800',
      'gray': 'border-gray-200 bg-gray-50 text-gray-800',
      'pink': 'border-pink-200 bg-pink-50 text-pink-800',
      'lime': 'border-lime-200 bg-lime-50 text-lime-800'
    };
    return colores[color] || colores['gray'];
  }

  getColorClaseHover(color: string): string {
    const colores: { [key: string]: string } = {
      'blue': 'hover:border-blue-300 hover:bg-blue-100',
      'red': 'hover:border-red-300 hover:bg-red-100',
      'green': 'hover:border-green-300 hover:bg-green-100',
      'purple': 'hover:border-purple-300 hover:bg-purple-100',
      'orange': 'hover:border-orange-300 hover:bg-orange-100',
      'indigo': 'hover:border-indigo-300 hover:bg-indigo-100',
      'gray': 'hover:border-gray-300 hover:bg-gray-100',
      'pink': 'hover:border-pink-300 hover:bg-pink-100',
      'lime': 'hover:border-lime-300 hover:bg-lime-100'
    };
    return colores[color] || colores['gray'];
  }

  // ==========================================
  // ACCIONES
  // ==========================================

  seleccionarTipo(tipo: TipoDocumento): void {
    this.tipoSeleccionado = tipo;
    this.documentoForm.patchValue({
      tipo_documento: tipo.id
    });
  }

  limpiarSeleccion(): void {
    this.tipoSeleccionado = null;
    this.documentoForm.patchValue({
      tipo_documento: null
    });
  }

  onSubmit(): void {
    console.log('🔄 Form submitted. Valid:', this.documentoForm.valid);

    if (this.documentoForm.valid && this.tipoSeleccionado && !this.isLoading) {
      if (this.documentoForm.get('crear_inmediatamente')?.value) {
        this.crearDocumento();
      } else {
        this.guardarSeleccionYContinuar();
      }
    } else {
      console.log('❌ Form invalid o tipo no seleccionado');
      this.markAllFieldsAsTouched();
    }
  }

  /**
   * Crear documento inmediatamente en la base de datos
   */
  private crearDocumento(): void {
    this.isLoading = true;
    this.estadoProceso = 'creando';
    this.autoGuardadoStatus = 'Creando documento clínico...';
    this.wizardStateService.setWizardEstado(EstadoWizard.COMPLETANDO);

    const currentState = this.wizardStateService.getCurrentState();
    const formData = this.documentoForm.value;

    // Verificar que tenemos el ID del expediente
    const idExpediente = currentState.id_expediente_creado;
    if (!idExpediente) {
      console.error('❌ No se encontró el ID del expediente');
      alert('Error: No se encontró el ID del expediente. Reinicie el proceso.');
      this.isLoading = false;
      this.estadoProceso = 'error';
      this.autoGuardadoStatus = '';
      return;
    }

    try {
      // Validar que tenemos un tipo seleccionado
      if (!this.tipoSeleccionado || !this.tipoSeleccionado.id) {
        console.error('❌ No hay tipo de documento seleccionado');
        alert('Error: Debe seleccionar un tipo de documento.');
        this.isLoading = false;
        this.estadoProceso = 'error';
        this.autoGuardadoStatus = '';
        return;
      }

      // Preparar datos para crear documento
      const documentoData: CreateDocumentoClinicoDto = {
        id_expediente: idExpediente,
        id_tipo_documento: this.tipoSeleccionado.id,
        id_personal_creador: 1, // ID fijo temporal
        fecha_elaboracion: new Date().toISOString(),
        estado: EstadoDocumento.BORRADOR,
        observaciones: formData.observaciones || undefined,
        es_digital: true,
        requiere_firma: false
      };

      console.log('🚀 Enviando al backend (DocumentosService):', documentoData);

      // Llamada real al backend
      this.documentosService.createDocumentoClinico(documentoData).subscribe({
        next: (response) => {
          console.log('  Respuesta del backend (documento creado):', response);

          if (response.success && response.data) {
            // Actualizar datos en el wizard state
            const datosDocumentoCompletos: Partial<DatosDocumento> = {
              id_expediente: idExpediente,
              tipo_documento: formData.tipo_documento,
              fecha_elaboracion: response.data.fecha_elaboracion || new Date().toISOString(),
              observaciones: formData.observaciones
            };

            this.wizardStateService.updateDocumentoData(datosDocumentoCompletos);

            // Guardar ID del documento creado
            this.wizardStateService.updateIds({
              id_documento: response.data.id_documento!
            });

            // Marcar paso como completado
            this.wizardStateService.markStepAsCompleted(WizardStep.DOCUMENTO_CLINICO);

            // Actualizar estado local
            this.documentoCreado = {
              id_documento: response.data.id_documento,
              tipo_documento: this.tipoSeleccionado!.nombre,
              fecha_elaboracion: response.data.fecha_elaboracion || new Date().toISOString(),
              estado: response.data.estado
            };

            // Actualizar UI
            this.isLoading = false;
            this.estadoProceso = 'completado';
            this.autoGuardadoStatus = '  Documento clínico creado exitosamente';

            console.log('  Documento creado con ID:', response.data.id_documento);
            console.log('  Tipo documento:', this.tipoSeleccionado!.nombre);

            // Navegar al siguiente paso después de una breve pausa
            setTimeout(() => {
              this.wizardStateService.goToNextStep();
            }, 2000);

          } else {
            throw new Error(response.message || 'Error desconocido al crear documento');
          }
        },

        error: (error) => {
          console.error('❌ Error al crear documento:', error);

          this.isLoading = false;
          this.estadoProceso = 'error';

          // Determinar mensaje de error apropiado
          let errorMessage = '❌ Error al crear documento clínico';

          if (error.error?.message) {
            errorMessage = `❌ ${error.error.message}`;
          } else if (error.message) {
            errorMessage = `❌ ${error.message}`;
          } else if (error.status === 0) {
            errorMessage = '❌ Sin conexión al servidor';
          } else if (error.status >= 400 && error.status < 500) {
            errorMessage = '❌ Error en los datos enviados';
          } else if (error.status >= 500) {
            errorMessage = '❌ Error del servidor';
          }

          this.autoGuardadoStatus = errorMessage;

          // Limpiar mensaje de error después de 8 segundos
          setTimeout(() => {
            this.autoGuardadoStatus = '';
          }, 8000);
        }
      });

    } catch (error) {
      console.error('❌ Error al preparar datos:', error);
      this.isLoading = false;
      this.estadoProceso = 'error';
      this.autoGuardadoStatus = '❌ Error al procesar datos del formulario';

      setTimeout(() => {
        this.autoGuardadoStatus = '';
      }, 5000);
    }
  }

  /**
   * Guardar selección sin crear documento (para completar después)
   */
  private guardarSeleccionYContinuar(): void {
    this.isLoading = true;
    this.autoGuardadoStatus = 'Guardando selección...';

    try {
      const formData = this.documentoForm.value;

      // Validar que tenemos un tipo seleccionado
      if (!formData.tipo_documento || !this.tipoSeleccionado) {
        console.error('❌ No hay tipo de documento seleccionado');
        alert('Error: Debe seleccionar un tipo de documento.');
        this.isLoading = false;
        this.autoGuardadoStatus = '';
        return;
      }

      // Actualizar datos en el wizard state
      const datosDocumento: Partial<DatosDocumento> = {
        tipo_documento: formData.tipo_documento,
        observaciones: formData.observaciones,
        fecha_elaboracion: new Date().toISOString()
      };

      this.wizardStateService.updateDocumentoData(datosDocumento);
      this.wizardStateService.markStepAsCompleted(WizardStep.DOCUMENTO_CLINICO);

      this.isLoading = false;
      this.autoGuardadoStatus = '  Selección guardada exitosamente';

      console.log('  Selección guardada:', datosDocumento);

      // Navegar al siguiente paso
      setTimeout(() => {
        this.wizardStateService.goToNextStep();
      }, 1000);

    } catch (error) {
      console.error('❌ Error al guardar selección:', error);
      this.isLoading = false;
      this.autoGuardadoStatus = '❌ Error al guardar selección';

      setTimeout(() => {
        this.autoGuardadoStatus = '';
      }, 3000);
    }
  }

  /**
   * Guardar borrador (solo en wizard state, no en backend)
   */
  guardarBorrador(): void {
    if (!this.isLoading && this.documentoForm.dirty) {
      console.log('💾 Guardando borrador de documento...');

      const formData = this.documentoForm.value as Partial<DatosDocumento>;

      try {
        this.wizardStateService.updateDocumentoData(formData);
        console.log('💾 Borrador de documento guardado automáticamente');
      } catch (error) {
        console.error('❌ Error al guardar borrador:', error);
      }
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
    console.log('➡️ Continuando al siguiente paso');
    this.wizardStateService.goToNextStep();
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.documentoForm.controls).forEach(key => {
      this.documentoForm.get(key)?.markAsTouched();
    });
  }

  // ==========================================
  // MÉTODOS PARA DEBUGGING
  // ==========================================

  /** Método para testing - mostrar estado del wizard */
  get currentWizardState() {
    return this.showDebugInfo ? this.wizardStateService.getCurrentState() : null;
  }

  /** Verificar si el formulario está listo para enviar */
  get canSubmit(): boolean {
    return this.documentoForm.valid && !!this.tipoSeleccionado && !this.isLoading && this.estadoProceso === 'seleccionando';
  }

  /** Verificar si se puede continuar al siguiente paso */
  get canContinue(): boolean {
    return this.estadoProceso === 'completado' && !this.isLoading;
  }

  /** Verificar si se puede guardar borrador */
  get canSaveDraft(): boolean {
    return this.documentoForm.dirty && !this.isLoading && this.estadoProceso === 'seleccionando';
  }
}
