// src/app/personas/personas/personas.ts
import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { PersonasService } from '../../services/personas/personas';
import {
  PersonaFrontend,
  CreatePersonaFrontendDto,
  PersonaFilters,
  Genero,
  EstadoCivil,
  PaginationInfo
} from '../../models';

@Component({
  selector: 'app-personas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './personas.html',
  styleUrl: './personas.css'
})
export class PersonasComponent implements OnInit, OnDestroy {
  // ==========================================
  // SIGNALS Y PROPIEDADES REACTIVAS
  // ==========================================

  personas = signal<PersonaFrontend[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Estados del modal
  showModal = signal(false);
  showDeleteModal = signal(false);
  showViewModal = signal(false); // 🔥 NUEVO: Modal para ver detalles
  isEditMode = signal(false);

  // Persona seleccionada
  selectedPersona = signal<PersonaFrontend | null>(null);

  // Paginación
  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);
  pageSize = signal(10);

  // Filtros (SIN activo)
  searchQuery = signal('');
  generoFilter = signal<Genero | undefined>(undefined);
  estadoCivilFilter = signal<EstadoCivil | undefined>(undefined);

  // ==========================================
  // FORMULARIOS
  // ==========================================
  personaForm!: FormGroup;
  searchForm!: FormGroup;

  // ==========================================
  // ENUMS PARA TEMPLATE
  // ==========================================
  Genero = Genero;
  EstadoCivil = EstadoCivil;

  // ==========================================
  // OPCIONES PARA SELECTS
  // ==========================================
  generoOptions = [
    { value: Genero.MASCULINO, label: 'Masculino' },
    { value: Genero.FEMENINO, label: 'Femenino' },
    { value: Genero.OTRO, label: 'Otro' }
  ];

  estadoCivilOptions = [
    { value: EstadoCivil.SOLTERO, label: 'Soltero(a)' },
    { value: EstadoCivil.CASADO, label: 'Casado(a)' },
    { value: EstadoCivil.DIVORCIADO, label: 'Divorciado(a)' },
    { value: EstadoCivil.VIUDO, label: 'Viudo(a)' },
    { value: EstadoCivil.UNION_LIBRE, label: 'Unión libre' },
    { value: EstadoCivil.OTRO, label: 'Otro' }
  ];

  pageSizeOptions = [5, 10, 25, 50, 100];

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================
  filteredPersonasCount = computed(() => this.personas().length);
  hasPersonas = computed(() => this.personas().length > 0);
  showPagination = computed(() => this.totalPages() > 1);
  modalTitle = computed(() => this.isEditMode() ? 'Editar Persona' : 'Nueva Persona');

  // ==========================================
  // PRIVATE PROPERTIES
  // ==========================================
  private destroy$ = new Subject<void>();
  Math = Math;

  constructor(
    private personasService: PersonasService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  ngOnInit(): void {
    this.setupSubscriptions();
    this.setupSearchDebounce();
    this.loadPersonas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================
  private initializeForms(): void {
    // Formulario principal (SIN campo activo)
    this.personaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellido_paterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellido_materno: ['', [Validators.maxLength(50)]],
      fecha_nacimiento: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      estado_civil: [''],
      telefono: ['', [Validators.pattern(/^\d{10}$/)]],
      telefono_emergencia: ['', [Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.email]],
      direccion: ['', [Validators.maxLength(200)]],
      ciudad: ['', [Validators.maxLength(50)]],
      estado: ['', [Validators.maxLength(50)]],
      codigo_postal: ['', [Validators.pattern(/^\d{5}$/)]],
      curp: ['', [Validators.pattern(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/)]],
      rfc: ['', [Validators.pattern(/^[A-ZÑ&]{3,4}\d{6}[A-V1-9][A-Z1-9][0-9A]$/)]],
      numero_seguro_social: ['', [Validators.pattern(/^\d{11}$/)]]
    });

    // Formulario de búsqueda (SIN filtro activo)
    this.searchForm = this.fb.group({
      search: [''],
      genero: [''],
      estado_civil: ['']
    });
  }

  private setupSubscriptions(): void {
    this.personasService.personas$
      .pipe(takeUntil(this.destroy$))
      .subscribe(personas => this.personas.set(personas));

    this.personasService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading.set(loading));

    this.personasService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error.set(error));
  }

  private setupSearchDebounce(): void {
    this.searchForm.get('search')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchQuery.set(value || '');
        this.currentPage.set(1);
        this.loadPersonas();
      });
  }

  // ==========================================
  // OPERACIONES CRUD
  // ==========================================
  loadPersonas(): void {
    const filters: PersonaFilters = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchQuery() || undefined,
      sexo: this.generoFilter(),
      estado_civil: this.estadoCivilFilter(),
      sort_by: 'nombre',
      sort_order: 'ASC'
    };

    this.personasService.getPersonas(filters).subscribe({
      next: (response) => {
        if (response.success && response.pagination) {
          this.updatePagination(response.pagination);
        }
      },
      error: (error) => {
        console.error('Error al cargar personas:', error);
      }
    });
  }

  createPersona(): void {
    if (this.personaForm.valid) {
      const personaData: CreatePersonaFrontendDto = this.personaForm.value;

      this.personasService.createPersona(personaData).subscribe({
        next: (response) => {
          if (response.success) {
            this.closeModal();
            this.loadPersonas();
          }
        },
        error: (error) => {
          console.error('Error al crear persona:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  updatePersona(): void {
    if (this.personaForm.valid && this.selectedPersona()) {
      const personaData: Partial<CreatePersonaFrontendDto> = {
        ...this.personaForm.value
      };

      this.personasService.updatePersona(this.selectedPersona()!.id_persona!, personaData).subscribe({
        next: (response) => {
          if (response.success) {
            this.closeModal();
            this.loadPersonas();
          }
        },
        error: (error) => {
          console.error('Error al actualizar persona:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  deletePersona(): void {
    if (this.selectedPersona()) {
      this.personasService.deletePersona(this.selectedPersona()!.id_persona!).subscribe({
        next: (response) => {
          if (response.success) {
            this.closeDeleteModal();
            this.loadPersonas();
          }
        },
        error: (error) => {
          console.error('Error al eliminar persona:', error);
        }
      });
    }
  }

  // ==========================================
  // OPERACIONES DE MODAL
  // ==========================================
  openCreateModal(): void {
    this.isEditMode.set(false);
    this.selectedPersona.set(null);
    this.personaForm.reset();
    this.showModal.set(true);
  }

  openEditModal(persona: PersonaFrontend): void {
    this.isEditMode.set(true);
    this.selectedPersona.set(persona);
    this.personaForm.patchValue(persona);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedPersona.set(null);
    this.personaForm.reset();
  }

  // 🔥 NUEVO: Modal para ver detalles
  openViewModal(persona: PersonaFrontend): void {
    this.selectedPersona.set(persona);
    this.showViewModal.set(true);
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
    this.selectedPersona.set(null);
  }

  openDeleteModal(persona: PersonaFrontend): void {
    this.selectedPersona.set(persona);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.selectedPersona.set(null);
  }

  // ==========================================
  // OPERACIONES DE FILTROS
  // ==========================================
  applyFilters(): void {
    const formValue = this.searchForm.value;

    this.generoFilter.set(formValue.genero || undefined);
    this.estadoCivilFilter.set(formValue.estado_civil || undefined);

    this.currentPage.set(1);
    this.loadPersonas();
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.searchQuery.set('');
    this.generoFilter.set(undefined);
    this.estadoCivilFilter.set(undefined);
    this.currentPage.set(1);
    this.loadPersonas();
  }

  // ==========================================
  // OPERACIONES DE PAGINACIÓN
  // ==========================================
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPersonas();
    }
  }

  changePageSize(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
    this.loadPersonas();
  }

  private updatePagination(pagination: PaginationInfo): void {
    this.currentPage.set(pagination.page);
    this.totalPages.set(pagination.totalPages);
    this.totalItems.set(pagination.total);
  }

  // ==========================================
  // MÉTODOS UTILITARIOS PARA TEMPLATE
  // ==========================================
  formatearNombreCompleto(persona: PersonaFrontend): string {
    return this.personasService.formatearNombreCompleto(persona);
  }

  calcularEdad(fechaNacimiento: string): number {
    return this.personasService.calcularEdad(fechaNacimiento);
  }

  getInitials(persona: PersonaFrontend): string {
    const nombre = persona.nombre.charAt(0).toUpperCase();
    const apellido = persona.apellido_paterno.charAt(0).toUpperCase();
    return `${nombre}${apellido}`;
  }

  getGeneroLabel(genero: Genero): string {
    const option = this.generoOptions.find(o => o.value === genero);
    return option ? option.label : genero;
  }

  getEstadoCivilLabel(estadoCivil: EstadoCivil): string {
    const option = this.estadoCivilOptions.find(o => o.value === estadoCivil);
    return option ? option.label : estadoCivil;
  }

  formatTelefono(telefono: string): string {
    if (telefono?.length === 10) {
      return `(${telefono.slice(0,3)}) ${telefono.slice(3,6)}-${telefono.slice(6)}`;
    }
    return telefono || '';
  }

  trackByPersonaId(index: number, persona: PersonaFrontend): number {
    return persona.id_persona!;
  }

  // 🔥 NUEVO: Método mejorado para ver persona
  viewPersona(persona: PersonaFrontend): void {
    this.openViewModal(persona);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.personaForm.controls).forEach(key => {
      this.personaForm.get(key)?.markAsTouched();
    });
  }

  // ==========================================
  // MÉTODOS PARA TEMPLATE
  // ==========================================
  onSubmit(): void {
    if (this.isEditMode()) {
      this.updatePersona();
    } else {
      this.createPersona();
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.personaForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} es muy corto`;
      if (field.errors['maxlength']) return `${fieldName} es muy largo`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['pattern']) return `Formato de ${fieldName} inválido`;
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.personaForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  // ==========================================
  // GETTERS PARA PAGINACIÓN
  // ==========================================
  get paginationNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < total - 1) {
      rangeWithDots.push(-1, total);
    } else {
      rangeWithDots.push(total);
    }

    return rangeWithDots.filter((v, i, a) => a.indexOf(v) === i && v !== -1);
  }
}
