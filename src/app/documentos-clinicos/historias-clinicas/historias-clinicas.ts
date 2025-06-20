// // import { Component } from '@angular/core';
// // import { HistoriasClinicasService } from '../../services/documentos-clinicos/historias-clinicas.service';
// // import { NgFor } from '@angular/common';

// // @Component({
// //   selector: 'app-historias-clinicas',
// //   imports: [NgFor],
// //   templateUrl: './historias-clinicas.html',
// //   styleUrl: './historias-clinicas.css'
// // })
// // export class HistoriasClinicas {

// //   historias: any[] = [];

// //   constructor(private historiaService: HistoriasClinicasService) {}

// // ngOnInit(): void {
// //     this.historiaService.getHistoriasClinicas().subscribe(
// //       (data) => {
// //         this.historias = data;
// //       },
// //       (error) => {
// //         console.error('Error al obtener las historias clínicas', error);
// //       }
// //     );
// //   }

// // }
// import { Component, OnInit } from '@angular/core';
// import { NgFor } from '@angular/common';
// import { HistoriasClinicasService } from '../../services/documentos-clinicos/historias-clinicas.service';
// import { HistoriaClinica } from '../../models';

// @Component({
//   selector: 'app-historias-clinicas',
//   templateUrl: './historias-clinicas.html',
//   styleUrls: ['./historias-clinicas.css'],
//   standalone: true,
//   imports: [NgFor]
// })
// export class HistoriasClinicasComponent implements OnInit {
//   historias: HistoriaClinica[] = [];

//   constructor(private historiaService: HistoriasClinicasService) {}

//   ngOnInit(): void {
//     this.historiaService.getHistoriasClinicas().subscribe(
//       (data) => {
//         this.historias = data;
//       },
//       (error) => {
//         console.error('Error al obtener historias clínicas', error);
//       }
//     );
//   }
// }













import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HistoriasClinicasService } from '../../services/documentos-clinicos/historias-clinicas.service';
import { HistoriaClinica } from '../../models';

@Component({
  selector: 'app-historias-clinicas',
   templateUrl: './historias-clinicas.html',
  styleUrls: ['./historias-clinicas.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class HistoriasClinicasComponent implements OnInit {
  historiaForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  historiaId?: number;

  // Opciones para selectores
  metodosPlanificacion = [
    'Ninguno',
    'Preservativo',
    'Píldoras anticonceptivas',
    'DIU',
    'Implante subdérmico',
    'Inyección mensual',
    'Inyección trimestral',
    'Vasectomía',
    'Salpingoclasia',
    'Método natural'
  ];

  constructor(
    private fb: FormBuilder,
    private historiasService: HistoriasClinicasService,
    private router: Router
  ) {
    this.historiaForm = this.createForm();
  }

  ngOnInit(): void {
    // Si hay un ID en la ruta, cargar datos para edición
    // this.checkEditMode();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Datos básicos del documento
      id_documento: ['', Validators.required],
      
      // Antecedentes Heredo-Familiares
      antecedentes_heredo_familiares: [''],
      
      // Hábitos
      habitos_higienicos: [''],
      habitos_alimenticios: [''],
      actividad_fisica: [''],
      ocupacion: [''],
      vivienda: [''],
      toxicomanias: [''],
      
      // Antecedentes Gineco-Obstétricos
      menarca: [''],
      ritmo_menstrual: [''],
      inicio_vida_sexual: [''],
      fecha_ultima_regla: [''],
      fecha_ultimo_parto: [''],
      gestas: [null, [Validators.min(0)]],
      partos: [null, [Validators.min(0)]],
      cesareas: [null, [Validators.min(0)]],
      abortos: [null, [Validators.min(0)]],
      hijos_vivos: [null, [Validators.min(0)]],
      metodo_planificacion: [''],
      
      // Antecedentes Patológicos
      enfermedades_infancia: [''],
      enfermedades_adulto: [''],
      cirugias_previas: [''],
      traumatismos: [''],
      alergias: [''],
      
      // Padecimiento Actual
      padecimiento_actual: ['', Validators.required],
      sintomas_generales: [''],
      aparatos_sistemas: [''],
      
      // Exploración Física
      exploracion_general: [''],
      exploracion_cabeza: [''],
      exploracion_cuello: [''],
      exploracion_torax: [''],
      exploracion_abdomen: [''],
      exploracion_columna: [''],
      exploracion_extremidades: [''],
      exploracion_genitales: [''],
      
      // Diagnóstico y Tratamiento
      impresion_diagnostica: ['', Validators.required],
      id_guia_diagnostico: [''],
      plan_diagnostico: [''],
      plan_terapeutico: [''],
      pronostico: ['']
    });
  }

  onSubmit(): void {
    if (this.historiaForm.valid) {
      this.isLoading = true;
      const formData = this.historiaForm.value;

      const request = this.isEditMode 
        ? this.historiasService.updateHistoriaClinica(this.historiaId!, formData)
        : this.historiasService.createHistoriaClinica(formData);

      request.subscribe({
        next: (response) => {
          console.log('Historia clínica guardada:', response);
          this.router.navigate(['/documentos-clinicos/historias-clinicas']);
        },
        error: (error) => {
          console.error('Error al guardar historia clínica:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/documentos-clinicos/historias-clinicas']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.historiaForm.controls).forEach(key => {
      const control = this.historiaForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helpers para validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.historiaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.historiaForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es obligatorio';
      if (field.errors['min']) return 'El valor debe ser mayor o igual a 0';
    }
    return '';
  }
}