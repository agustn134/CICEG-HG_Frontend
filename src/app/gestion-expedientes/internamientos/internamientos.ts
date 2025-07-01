// // Reemplaza el contenido completo de: src/app/components/internamientos/internamientos.component.ts

// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';

// import { InternamientosService } from '../../services/gestion-expedientes/internamientos';
// import { Internamiento } from '../../models/internamiento.model';
// import { CrearInternamientoComponent } from './crear-internamiento.component';

// @Component({
//   selector: 'app-internamientos',
//   standalone: true,
//   imports: [CommonModule, CrearInternamientoComponent],
//   templateUrl: './internamientos.html',
//   styleUrl: './internamientos.css'
// })
// export class InternamientosComponent implements OnInit {
//   internamientos: Internamiento[] = [];
//   isLoading = false;
//   errorMessage = '';

//   constructor(
//     private internamientosService: InternamientosService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.cargarInternamientos();
//   }

//   cargarInternamientos(): void {
//     this.isLoading = true;
//     this.errorMessage = '';

//     this.internamientosService.getInternamientos().subscribe({
//       next: (response) => {
//         if (response.success && response.data) {
//           this.internamientos = response.data;
//         } else {
//           this.errorMessage = response.message || 'Error al cargar internamientos';
//         }
//         this.isLoading = false;
//       },
//       error: (error) => {
//         this.errorMessage = this.internamientosService.manejarError(error);
//         this.isLoading = false;
//         console.error('Error al cargar internamientos:', error);
//       }
//     });
//   }

//   crearNuevo(): void {
//     this.router.navigate(['/internamientos/crear']);
//   }

//   verDetalle(id: number): void {
//     this.router.navigate(['/internamientos', id]);
//   }

//   editarInternamiento(id: number): void {
//     this.router.navigate(['/internamientos', id, 'editar']);
//   }

//   egresarPaciente(id: number): void {
//     this.router.navigate(['/internamientos', id, 'egreso']);
//   }

//   formatearFecha(fecha: string): string {
//     return new Date(fecha).toLocaleDateString('es-MX', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   }

//   formatearEstado(internamiento: Internamiento): string {
//     return this.internamientosService.formatearEstado(internamiento);
//   }

//   getEstadoClass(internamiento: Internamiento): string {
//     if (internamiento.fecha_egreso) {
//       switch (internamiento.tipo_egreso) {
//         case 'Mejoría':
//         case 'Alta voluntaria':
//           return 'bg-green-100 text-green-800';
//         case 'Referencia':
//           return 'bg-blue-100 text-blue-800';
//         case 'Defunción':
//           return 'bg-red-100 text-red-800';
//         case 'Máximo beneficio':
//           return 'bg-yellow-100 text-yellow-800';
//         default:
//           return 'bg-gray-100 text-gray-800';
//       }
//     }

//     const dias = internamiento.dias_estancia || 0;
//     if (dias <= 3) return 'bg-blue-100 text-blue-800';
//     if (dias <= 7) return 'bg-yellow-100 text-yellow-800';
//     if (dias <= 15) return 'bg-orange-100 text-orange-800';
//     return 'bg-red-100 text-red-800';
//   }

//   // Método para usar en el template si prefieres mantener el HTML separado
//   onCrearNuevo(): void {
//     this.crearNuevo();
//   }

//   onVerDetalle(id: number): void {
//     this.verDetalle(id);
//   }

//   onEditarInternamiento(id: number): void {
//     this.editarInternamiento(id);
//   }

//   onEgresarPaciente(id: number): void {
//     this.egresarPaciente(id);
//   }
// }
// Reemplaza todo el contenido de: C:\CICEG-HG-APP\src\app\gestion-expedientes\internamientos\internamientos.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { InternamientosService } from '../../services/gestion-expedientes/internamientos';
import { Internamiento, CreateInternamientoDto } from '../../models/internamiento.model';

@Component({
  selector: 'app-internamientos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './internamientos.html',
  styleUrl: './internamientos.css'
})
export class InternamientosComponent implements OnInit {
  // Datos
  internamientos: Internamiento[] = [];

  // Estados de la UI
  isLoading = false;
  errorMessage = '';
  mostrarFormulario = false; // Controla si se muestra el formulario

  // Formulario de creación
  internamientoForm: FormGroup;
  erroresFormulario: string[] = [];
  mensajeExito = '';

  constructor(
    private internamientosService: InternamientosService,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Inicializar formulario
    this.internamientoForm = this.fb.group({
      id_expediente: ['', [Validators.required, Validators.min(1)]],
      id_medico_responsable: ['', [Validators.required, Validators.min(1)]],
      id_servicio: [''],
      id_cama: [''],
      motivo_ingreso: ['', [Validators.required, Validators.minLength(10)]],
      diagnostico_ingreso: [''],
      observaciones: [''],
      fecha_ingreso: [''],
      crear_nota_ingreso: [true]
    });
  }

  ngOnInit(): void {
    this.cargarInternamientos();

    // Suscribirse al estado de loading del servicio
    this.internamientosService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  // ==========================================
  // MÉTODOS PARA LISTAR INTERNAMIENTOS
  // ==========================================

  cargarInternamientos(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.internamientosService.getInternamientos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.internamientos = response.data;
        } else {
          this.errorMessage = response.message || 'Error al cargar internamientos';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.internamientosService.manejarError(error);
        this.isLoading = false;
        console.error('Error al cargar internamientos:', error);
      }
    });
  }

  // ==========================================
  // MÉTODOS PARA EL FORMULARIO
  // ==========================================

  mostrarFormularioCrear(): void {
    this.mostrarFormulario = true;
    this.erroresFormulario = [];
    this.mensajeExito = '';
    this.internamientoForm.reset();
    this.internamientoForm.patchValue({ crear_nota_ingreso: true });
  }

  ocultarFormulario(): void {
    this.mostrarFormulario = false;
    this.erroresFormulario = [];
    this.mensajeExito = '';
    this.internamientoForm.reset();
  }

  onSubmitFormulario(): void {
    if (this.internamientoForm.valid) {
      this.erroresFormulario = [];
      this.mensajeExito = '';

      // Preparar datos para el backend
      const formData = this.internamientosService.prepararDatosParaBackend(this.internamientoForm.value);

      // Validar datos antes de enviar
      const validacion = this.internamientosService.validarDatosInternamiento(formData);

      if (!validacion.valido) {
        this.erroresFormulario = validacion.errores;
        return;
      }

      // Crear internamiento
      this.internamientosService.createInternamiento(formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.mensajeExito = 'Internamiento creado exitosamente';
            this.internamientoForm.reset();
            this.internamientoForm.patchValue({ crear_nota_ingreso: true });

            // Recargar la lista de internamientos
            this.cargarInternamientos();

            // Ocultar formulario después de 2 segundos
            setTimeout(() => {
              this.ocultarFormulario();
            }, 2000);
          } else {
            this.erroresFormulario = [response.message || 'Error al crear el internamiento'];
          }
        },
        error: (error) => {
          const mensajeError = this.internamientosService.manejarError(error);
          this.erroresFormulario = [mensajeError];
        }
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      this.marcarCamposComoTocados();
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.internamientoForm.controls).forEach(key => {
      this.internamientoForm.get(key)?.markAsTouched();
    });
  }

  // ==========================================
  // MÉTODOS DE NAVEGACIÓN
  // ==========================================

  verDetalle(id: number): void {
    this.router.navigate(['/app/gestion-expedientes/internamientos', id]);
  }

  editarInternamiento(id: number): void {
    this.router.navigate(['/app/gestion-expedientes/internamientos', id, 'editar']);
  }

  egresarPaciente(id: number): void {
    this.router.navigate(['/app/gestion-expedientes/internamientos', id, 'egreso']);
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD PARA EL TEMPLATE
  // ==========================================

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearEstado(internamiento: Internamiento): string {
    return this.internamientosService.formatearEstado(internamiento);
  }

  getEstadoClass(internamiento: Internamiento): string {
    if (internamiento.fecha_egreso) {
      switch (internamiento.tipo_egreso) {
        case 'Mejoría':
        case 'Alta voluntaria':
          return 'bg-green-100 text-green-800';
        case 'Referencia':
          return 'bg-blue-100 text-blue-800';
        case 'Defunción':
          return 'bg-red-100 text-red-800';
        case 'Máximo beneficio':
          return 'bg-yellow-100 text-yellow-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }

    const dias = internamiento.dias_estancia || 0;
    if (dias <= 3) return 'bg-blue-100 text-blue-800';
    if (dias <= 7) return 'bg-yellow-100 text-yellow-800';
    if (dias <= 15) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  }
}
