import { Component } from '@angular/core';

@Component({
  selector: 'app-administradores',
  imports: [],
  templateUrl: './administradores.html',
  styleUrl: './administradores.css'
})
export class Administradores {

}








// // src/app/personas/administradores/administradores.ts
// import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Subject } from 'rxjs';
// import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// import {
//   AdministradoresService,
//   Administrador,
//   CreateAdministradorDto,
//   UpdateAdministradorDto,
//   AdministradorFilters,
//   EstadisticasAdministradores
// } from '../../services/personas/administradores';
// import { NivelAcceso, PaginationInfo } from '../../models/base.models';

// @Component({
//   selector: 'app-administradores',
//   standalone: true,
//   imports: [CommonModule, FormsModule, ReactiveFormsModule],
//   templateUrl: './administradores.html',
//   styleUrl: './administradores.css'
// })
// export class AdministradoresComponent implements OnInit, OnDestroy {
//   // ==========================================
//   // SIGNALS Y PROPIEDADES REACTIVAS
//   // ==========================================
//   administradores = signal<Administrador[]>([]);
//   loading = signal(false);
//   error = signal<string | null>(null);
//   estadisticas = signal<EstadisticasAdministradores | null>(null);

//   // Estados del modal
//   showModal = signal(false);
//   showDeleteModal = signal(false);
//   showPasswordModal = signal(false);
//   isEditMode = signal(false);

//   // Administrador seleccionado
//   selectedAdministrador = signal<Administrador | null>(null);

//   // Paginación
//   currentPage = signal(1);
//   totalPages = signal(1);
//   totalItems = signal(0);
//   pageSize = signal(12);

//   // Filtros
//   searchTerm = signal('');
//   filtroNivelAcceso = signal<NivelAcceso | ''>('');
//   filtroActivo = signal<boolean | ''>('');

//   // ==========================================
//   // COMPUTED SIGNALS
//   // ==========================================
//   filteredAdministradores = computed(() => {
//     let filtered = this.administradores();

//     // Aplicar filtro de búsqueda
//     const search = this.searchTerm().toLowerCase().trim();
//     if (search) {
//       filtered = filtered.filter(admin =>
//         admin.usuario.toLowerCase().includes(search) ||
//         admin.id_administrador.toString().includes(search) ||
//         admin.id_persona.toString().includes(search) ||
//         admin.persona?.nombre?.toLowerCase().includes(search) ||
//         admin.persona?.apellido_paterno?.toLowerCase().includes(search)
//       );
//     }

//     // Aplicar filtro de nivel de acceso
//     if (this.filtroNivelAcceso()) {
//       filtered = filtered.filter(admin => admin.nivel_acceso === this.filtroNivelAcceso());
//     }

//     // Aplicar filtro de estado
//     if (this.filtroActivo() !== '') {
//       filtered = filtered.filter(admin => admin.activo === this.filtroActivo());
//     }

//     return filtered;
//   });

//   paginatedAdministradores = computed(() => {
//     const filtered = this.filteredAdministradores();
//     const startIndex = (this.currentPage() - 1) * this.pageSize();
//     const endIndex = startIndex + this.pageSize();

//     // Actualizar información de paginación
//     this.totalItems.set(filtered.length);
//     this.totalPages.set(Math.ceil(filtered.length / this.pageSize()));

//     return filtered.slice(startIndex, endIndex);
//   });

//   // ==========================================
//   // FORMULARIOS
//   // ==========================================
//   administradorForm!: FormGroup;
//   passwordForm!: FormGroup;

//   // ==========================================
//   // PROPIEDADES DE CLASE
//   // ==========================================
//   private destroy$ = new Subject<void>();
//   editingId: number | null = null;

//   // Exponer enums para el template
//   readonly NivelAcceso = NivelAcceso;

//   // ==========================================
//   // LIFECYCLE HOOKS
//   // ==========================================
//   constructor(
//     private administradoresService: AdministradoresService,
//     private fb: FormBuilder
//   ) {
//     this.initializeForms();
//   }

//   ngOnInit(): void {
//     this.loadAdministradores();
//     // this.loadEstadisticas();
//     this.setupSearchSubscription();
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   // ==========================================
//   // INICIALIZACIÓN
//   // ==========================================

//   private initializeForms(): void {
//     this.administradorForm = this.fb.group({
//       id_persona: ['', [Validators.required, Validators.min(1)]],
//       usuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//       nivel_acceso: [NivelAcceso.USUARIO, Validators.required],
//       activo: [true, Validators.required],
//       foto: ['']
//     });

//     this.passwordForm = this.fb.group({
//       password_actual: ['', Validators.required],
//       password_nuevo: ['', [Validators.required, Validators.minLength(6)]],
//       confirmar_password: ['', Validators.required]
//     }, {
//       validators: this.passwordMatchValidator
//     });
//   }

//   private setupSearchSubscription(): void {
//     // Configurar búsqueda con debounce
//     const searchInput = document.querySelector('input[placeholder*="Usuario"]') as HTMLInputElement;
//     if (searchInput) {
//       // En una implementación real, usarías FormControl para esto
//       // Por simplicidad, mantengo el ngModel del template
//     }
//   }

//   // ==========================================
//   // CARGA DE DATOS
//   // ==========================================

//   loadAdministradores(): void {
//     this.loading.set(true);
//     this.error.set(null);

//     const filters: AdministradorFilters = {
//       page: this.currentPage(),
//       limit: 100, // Cargar más para el filtrado local
//       activo: undefined // Cargar todos inicialmente
//     };

//     this.administradoresService.getAll(filters)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (response) => {
//           if (response.success && response.data) {
//             this.administradores.set(response.data);
//           }
//           this.loading.set(false);
//         },
//         error: (error) => {
//           this.error.set('Error al cargar administradores');
//           console.error('Error loading administradores:', error);
//           this.loading.set(false);
//         }
//       });
//   }

//   // loadEstadisticas(): void {
//   //   this.administradoresService.getEstadisticas()
//   //     .pipe(takeUntil(this.destroy$))
//   //     .subscribe({
//   //       next: (stats) => {
//   //         this.estadisticas.set(stats);
//   //       },
//   //       error: (error) => {
//   //         console.error('Error loading statistics:', error);
//   //       }
//   //     });
//   // }

//   // ==========================================
//   // GESTIÓN DEL MODAL
//   // ==========================================

//   openModal(administrador?: Administrador): void {
//     this.isEditMode.set(!!administrador);
//     this.selectedAdministrador.set(administrador || null);
//     this.editingId = administrador?.id_administrador || null;

//     if (administrador) {
//       // Modo edición
//       this.administradorForm.patchValue({
//         id_persona: administrador.id_persona,
//         usuario: administrador.usuario,
//         nivel_acceso: administrador.nivel_acceso,
//         activo: administrador.activo,
//         foto: administrador.foto || ''
//       });

//       // En modo edición, la contraseña no es requerida
//       this.administradorForm.get('password')?.clearValidators();
//       this.administradorForm.get('password')?.updateValueAndValidity();
//     } else {
//       // Modo creación
//       this.administradorForm.reset({
//         nivel_acceso: NivelAcceso.USUARIO,
//         activo: true
//       });

//       // En modo creación, la contraseña es requerida
//       this.administradorForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
//       this.administradorForm.get('password')?.updateValueAndValidity();
//     }

//     this.showModal.set(true);
//   }

//   closeModal(): void {
//     this.showModal.set(false);
//     this.selectedAdministrador.set(null);
//     this.editingId = null;
//     this.administradorForm.reset();
//   }

//   openPasswordModal(administrador: Administrador): void {
//     this.selectedAdministrador.set(administrador);
//     this.passwordForm.reset();
//     this.showPasswordModal.set(true);
//   }

//   closePasswordModal(): void {
//     this.showPasswordModal.set(false);
//     this.selectedAdministrador.set(null);
//     this.passwordForm.reset();
//   }

//   // ==========================================
//   // OPERACIONES CRUD
//   // ==========================================

//   onSubmit(): void {
//     if (this.administradorForm.invalid) {
//       this.markFormGroupTouched(this.administradorForm);
//       return;
//     }

//     const formData = this.administradorForm.value;

//     if (this.isEditMode()) {
//       this.updateAdministrador(formData);
//     } else {
//       this.createAdministrador(formData);
//     }
//   }

//   private createAdministrador(data: CreateAdministradorDto): void {
//     this.loading.set(true);

//     this.administradoresService.create(data)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (response) => {
//           if (response.success) {
//             this.loadAdministradores();
//             this.closeModal();
//             this.showSuccessMessage('Administrador creado exitosamente');
//           }
//           this.loading.set(false);
//         },
//         error: (error) => {
//           this.showErrorMessage('Error al crear administrador');
//           console.error('Error creating administrador:', error);
//           this.loading.set(false);
//         }
//       });
//   }

//   private updateAdministrador(data: UpdateAdministradorDto): void {
//     if (!this.editingId) return;

//     this.loading.set(true);

//     // Remover password del update si está vacío
//     if (!data.password) {
//       delete data.password;
//     }

//     this.administradoresService.update(this.editingId, data)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (response) => {
//           if (response.success) {
//             this.loadAdministradores();
//             this.closeModal();
//             this.showSuccessMessage('Administrador actualizado exitosamente');
//           }
//           this.loading.set(false);
//         },
//         error: (error) => {
//           this.showErrorMessage('Error al actualizar administrador');
//           console.error('Error updating administrador:', error);
//           this.loading.set(false);
//         }
//       });
//   }

//   deleteAdministrador(id: number): void {
//     if (!confirm('¿Está seguro de que desea eliminar este administrador?')) {
//       return;
//     }

//     this.loading.set(true);

//     this.administradoresService.delete(id)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (response) => {
//           if (response.success) {
//             this.loadAdministradores();
//             this.showSuccessMessage('Administrador eliminado exitosamente');
//           }
//           this.loading.set(false);
//         },
//         error: (error) => {
//           this.showErrorMessage('Error al eliminar administrador');
//           console.error('Error deleting administrador:', error);
//           this.loading.set(false);
//         }
//       });
//   }

//   toggleStatus(administrador: Administrador): void {
//     this.administradoresService.toggle(administrador.id_administrador)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (response) => {
//           if (response.success) {
//             this.loadAdministradores();
//             const status = !administrador.activo ? 'activado' : 'desactivado';
//             this.showSuccessMessage(`Administrador ${status} exitosamente`);
//           }
//         },
//         error: (error) => {
//           this.showErrorMessage('Error al cambiar estado del administrador');
//           console.error('Error toggling administrador:', error);
//         }
//       });
//   }

//   // ==========================================
//   // GESTIÓN DE CONTRASEÑAS
//   // ==========================================

//   onPasswordSubmit(): void {
//     if (this.passwordForm.invalid) {
//       this.markFormGroupTouched(this.passwordForm);
//       return;
//     }

//     const administrador = this.selectedAdministrador();
//     if (!administrador) return;

//     const passwordData = {
//       password_actual: this.passwordForm.value.password_actual,
//       password_nuevo: this.passwordForm.value.password_nuevo
//     };

//     this.administradoresService.cambiarPassword(administrador.id_administrador, passwordData)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (success) => {
//           if (success) {
//             this.closePasswordModal();
//             this.showSuccessMessage('Contraseña cambiada exitosamente');
//           } else {
//             this.showErrorMessage('Error al cambiar contraseña');
//           }
//         },
//         error: (error) => {
//           this.showErrorMessage('Error al cambiar contraseña');
//           console.error('Error changing password:', error);
//         }
//       });
//   }

//   // ==========================================
//   // PAGINACIÓN
//   // ==========================================

//   changePage(page: number): void {
//     if (page >= 1 && page <= this.totalPages()) {
//       this.currentPage.set(page);
//     }
//   }

//   // ==========================================
//   // FILTROS
//   // ==========================================

//   clearFilters(): void {
//     this.searchTerm.set('');
//     this.filtroNivelAcceso.set('');
//     this.filtroActivo.set('');
//     this.currentPage.set(1);
//   }

//   // ==========================================
//   // UTILIDADES
//   // ==========================================

//   getNivelAccesoLabel(nivel: NivelAcceso): string {
//     return this.administradoresService.getNivelAccesoLabel(nivel);
//   }

//   getNivelAccesoColor(nivel: NivelAcceso): string {
//     return this.administradoresService.getNivelAccesoColor(nivel);
//   }

//   get f() {
//     return this.administradorForm.controls;
//   }

//   get pf() {
//     return this.passwordForm.controls;
//   }

//   private markFormGroupTouched(formGroup: FormGroup): void {
//     Object.keys(formGroup.controls).forEach(key => {
//       const control = formGroup.get(key);
//       control?.markAsTouched();
//     });
//   }

//   private passwordMatchValidator(group: FormGroup) {
//     const password = group.get('password_nuevo');
//     const confirmPassword = group.get('confirmar_password');

//     if (!password || !confirmPassword) {
//       return null;
//     }

//     return password.value === confirmPassword.value ? null : { passwordMismatch: true };
//   }

//   private showSuccessMessage(message: string): void {
//     // Implementar notificación de éxito
//     console.log('Success:', message);
//     alert(message); // Temporal - reemplazar con toast/notification
//   }

//   private showErrorMessage(message: string): void {
//     // Implementar notificación de error
//     console.error('Error:', message);
//     alert(message); // Temporal - reemplazar con toast/notification
//   }

//   // ==========================================
//   // MÉTODOS PARA EL TEMPLATE
//   // ==========================================

//   Math = Math; // Exponer Math para el template
// }
