// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-tipos-documento',
// //   imports: [],
// //   templateUrl: './tipos-documento.html',
// //   styleUrl: './tipos-documento.css'
// // })
// // export class TiposDocumento {

// // }
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { TiposDocumentoService } from '../../services/catalogos/tipos-documento';
// import { TipoDocumento, CreateTipoDocumentoDto } from '../../models/tipo-documento.model';

// @Component({
//   selector: 'app-tipos-documento',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './tipos-documento.html',
//   styleUrl: './tipos-documento.css'
// })
// export class TiposDocumento implements OnInit {

//   tiposDocumentoForm: FormGroup;
//   tiposDocumento: TipoDocumento[] = [];
//   isLoading = false;
//   error: string | null = null;
//   success: string | null = null;
//   editingId: number | null = null;

//   // Opciones para el formulario
//   categorias = [
//     { value: 'Ingreso', label: 'Ingreso' },
//     { value: 'Evolución', label: 'Evolución' },
//     { value: 'Egreso', label: 'Egreso' },
//     { value: 'Procedimiento', label: 'Procedimiento' },
//     { value: 'Consulta', label: 'Consulta' }
//   ];

//   constructor(
//     private fb: FormBuilder,
//     private tiposDocumentoService: TiposDocumentoService
//   ) {
//     this.tiposDocumentoForm = this.createForm();
//   }

//   ngOnInit(): void {
//     this.loadTiposDocumento();
//   }

//   createForm(): FormGroup {
//     return this.fb.group({
//       nombre: ['', [Validators.required, Validators.minLength(3)]],
//       descripcion: [''],
//       categoria: [''],
//       requiere_firma_medico: [false],
//       requiere_firma_paciente: [false],
//       plantilla_disponible: [false],
//       orden_impresion: [1, [Validators.min(1)]],
//       activo: [true]
//     });
//   }

//   async loadTiposDocumento(): Promise<void> {
//     this.isLoading = true;
//     this.error = null;

//     try {
//       const response = await this.tiposDocumentoService.getAll();
//       this.tiposDocumento = response.data || [];
//     } catch (error: any) {
//       this.error = 'Error al cargar los tipos de documento';
//       console.error('Error loading tipos documento:', error);
//     } finally {
//       this.isLoading = false;
//     }
//   }

//   async onSubmit(): Promise<void> {
//     if (this.tiposDocumentoForm.invalid) {
//       this.markFormGroupTouched();
//       return;
//     }

//     this.isLoading = true;
//     this.error = null;
//     this.success = null;

//     try {
//       const formData = this.tiposDocumentoForm.value as CreateTipoDocumentoDto;

//       if (this.editingId) {
//         await this.tiposDocumentoService.update(this.editingId, formData);
//         this.success = 'Tipo de documento actualizado correctamente';
//       } else {
//         await this.tiposDocumentoService.create(formData);
//         this.success = 'Tipo de documento creado correctamente';
//       }

//       this.resetForm();
//       await this.loadTiposDocumento();

//     } catch (error: any) {
//       this.error = error.error?.message || 'Error al guardar el tipo de documento';
//       console.error('Error saving tipo documento:', error);
//     } finally {
//       this.isLoading = false;
//     }
//   }

//   editTipoDocumento(tipoDocumento: TipoDocumento): void {
//     this.editingId = tipoDocumento.id_tipo_documento;
//     this.tiposDocumentoForm.patchValue({
//       nombre: tipoDocumento.nombre,
//       descripcion: tipoDocumento.descripcion || '',
//       categoria: tipoDocumento.categoria || '',
//       requiere_firma_medico: tipoDocumento.requiere_firma_medico || false,
//       requiere_firma_paciente: tipoDocumento.requiere_firma_paciente || false,
//       plantilla_disponible: tipoDocumento.plantilla_disponible || false,
//       orden_impresion: tipoDocumento.orden_impresion || 1,
//       activo: tipoDocumento.activo
//     });
//     this.clearMessages();
//   }

//   async deleteTipoDocumento(id: number): Promise<void> {
//     if (!confirm('¿Está seguro de eliminar este tipo de documento?')) {
//       return;
//     }

//     this.isLoading = true;
//     this.error = null;

//     try {
//       await this.tiposDocumentoService.delete(id);
//       this.success = 'Tipo de documento eliminado correctamente';
//       await this.loadTiposDocumento();
//     } catch (error: any) {
//       this.error = error.error?.message || 'Error al eliminar el tipo de documento';
//       console.error('Error deleting tipo documento:', error);
//     } finally {
//       this.isLoading = false;
//     }
//   }

//   resetForm(): void {
//     this.editingId = null;
//     this.tiposDocumentoForm.reset({
//       nombre: '',
//       descripcion: '',
//       categoria: '',
//       requiere_firma_medico: false,
//       requiere_firma_paciente: false,
//       plantilla_disponible: false,
//       orden_impresion: 1,
//       activo: true
//     });
//     this.clearMessages();
//   }

//   clearMessages(): void {
//     this.error = null;
//     this.success = null;
//   }

//   private markFormGroupTouched(): void {
//     Object.keys(this.tiposDocumentoForm.controls).forEach(key => {
//       const control = this.tiposDocumentoForm.get(key);
//       control?.markAsTouched();
//     });
//   }

//   getFieldError(fieldName: string): string | null {
//     const field = this.tiposDocumentoForm.get(fieldName);
//     if (field?.errors && field.touched) {
//       if (field.errors['required']) return `${fieldName} es requerido`;
//       if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
//       if (field.errors['min']) return `${fieldName} debe ser mayor a ${field.errors['min'].min}`;
//     }
//     return null;
//   }

//   isFieldInvalid(fieldName: string): boolean {
//     const field = this.tiposDocumentoForm.get(fieldName);
//     return !!(field?.errors && field.touched);
//   }

//   getCategoriaLabel(categoria: string): string {
//     const categoriaObj = this.categorias.find(c => c.value === categoria);
//     return categoriaObj ? categoriaObj.label : categoria;
//   }
// }
// src/app/catalogos/tipos-documento/tipos-documento.ts - VERSIÓN CORREGIDA
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TiposDocumentoService } from '../../services/catalogos/tipos-documento';
import { TipoDocumento, CreateTipoDocumentoDto } from '../../models/tipo-documento.model';

@Component({
  selector: 'app-tipos-documento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tipos-documento.html',
  styleUrl: './tipos-documento.css'
})
export class TiposDocumento implements OnInit {

  tiposDocumentoForm: FormGroup;
  tiposDocumento: TipoDocumento[] = [];
  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  editingId: number | null = null;

  // Opciones para el formulario
  categorias = [
    { value: 'Ingreso', label: 'Ingreso' },
    { value: 'Evolución', label: 'Evolución' },
    { value: 'Egreso', label: 'Egreso' },
    { value: 'Procedimiento', label: 'Procedimiento' },
    { value: 'Consulta', label: 'Consulta' }
  ];

  constructor(
    private fb: FormBuilder,
    private tiposDocumentoService: TiposDocumentoService
  ) {
    this.tiposDocumentoForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadTiposDocumento();
  }

  createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      categoria: [''],
      requiere_firma_medico: [false],
      requiere_firma_paciente: [false],
      plantilla_disponible: [false],
      orden_impresion: [1, [Validators.min(1)]],
      activo: [true]
    });
  }

  // ✅ MÉTODO CORREGIDO - Usar Observables en lugar de async/await
  loadTiposDocumento(): void {
    this.isLoading = true;
    this.error = null;

    this.tiposDocumentoService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.tiposDocumento = response.data;
        } else {
          this.error = response.message || 'Error al cargar tipos de documento';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los tipos de documento';
        console.error('Error loading tipos documento:', error);
        this.isLoading = false;
      }
    });
  }

  // ✅ MÉTODO CORREGIDO - Usar Observables en lugar de async/await
  onSubmit(): void {
    if (this.tiposDocumentoForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.success = null;

    const formData = this.tiposDocumentoForm.value as CreateTipoDocumentoDto;

    // Decidir si crear o actualizar
    const operation = this.editingId ?
      this.tiposDocumentoService.update(this.editingId, formData) :
      this.tiposDocumentoService.create(formData);

    operation.subscribe({
      next: (response) => {
        if (response.success) {
          this.success = this.editingId ?
            'Tipo de documento actualizado correctamente' :
            'Tipo de documento creado correctamente';
          this.resetForm();
          this.loadTiposDocumento(); // Recargar la lista
        } else {
          this.error = response.message || 'Error al guardar el tipo de documento';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Error al guardar el tipo de documento';
        console.error('Error saving tipo documento:', error);
        this.isLoading = false;
      }
    });
  }

  editTipoDocumento(tipoDocumento: TipoDocumento): void {
    this.editingId = tipoDocumento.id_tipo_documento;
    this.tiposDocumentoForm.patchValue({
      nombre: tipoDocumento.nombre,
      descripcion: tipoDocumento.descripcion || '',
      categoria: tipoDocumento.categoria || '',
      requiere_firma_medico: tipoDocumento.requiere_firma_medico || false,
      requiere_firma_paciente: tipoDocumento.requiere_firma_paciente || false,
      plantilla_disponible: tipoDocumento.plantilla_disponible || false,
      orden_impresion: tipoDocumento.orden_impresion || 1,
      activo: tipoDocumento.activo
    });
    this.clearMessages();
  }

  // ✅ MÉTODO CORREGIDO - Usar Observables en lugar de async/await
  deleteTipoDocumento(id: number): void {
    if (!confirm('¿Está seguro de eliminar este tipo de documento?')) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.tiposDocumentoService.delete(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = 'Tipo de documento eliminado correctamente';
          this.loadTiposDocumento(); // Recargar la lista
        } else {
          this.error = response.message || 'Error al eliminar el tipo de documento';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Error al eliminar el tipo de documento';
        console.error('Error deleting tipo documento:', error);
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.tiposDocumentoForm.reset({
      nombre: '',
      descripcion: '',
      categoria: '',
      requiere_firma_medico: false,
      requiere_firma_paciente: false,
      plantilla_disponible: false,
      orden_impresion: 1,
      activo: true
    });
    this.clearMessages();
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.tiposDocumentoForm.controls).forEach(key => {
      const control = this.tiposDocumentoForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.tiposDocumentoForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `${fieldName} debe ser mayor a ${field.errors['min'].min}`;
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.tiposDocumentoForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  getCategoriaLabel(categoria: string): string {
    const categoriaObj = this.categorias.find(c => c.value === categoria);
    return categoriaObj ? categoriaObj.label : categoria;
  }
}
