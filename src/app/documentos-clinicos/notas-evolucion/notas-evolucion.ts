import { Component } from '@angular/core';

@Component({
  selector: 'app-notas-evolucion',
  imports: [],
  templateUrl: './notas-evolucion.html',
  styleUrl: './notas-evolucion.css'
})
export class NotasEvolucion {

}








// src/app/documentos-clinicos/notas-evolucion/notas-evolucion.component.ts
// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { NotasEvolucion } from '../../services/documentos-clinicos/notas-evolucion';
// import { NotaEvolucion } from '../../models/nota-evolucion.model';

// @Component({
//   selector: 'app-notas-evolucion',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   template: `
//   `,
//   styles: [`
//     .truncate {
//       max-width: 200px;
//     }
//   `]
// })
// export class NotasEvolucionComponent implements OnInit {
//   private notaEvolucionService = inject(NotasEvolucion);

//   notas: NotaEvolucion[] = [];
//   notasFiltradas: NotaEvolucion[] = [];
//   filtroTexto: string = '';
//   cargando: boolean = false;
//   error: string = '';

//   ngOnInit(): void {
//     this.cargarNotas();
//   }

//   cargarNotas(): void {
//     this.cargando = true;
//     this.error = '';

//     this.notaEvolucionService.getAll().subscribe({
//       next: (notas) => {
//         this.notas = notas;
//         this.notasFiltradas = [...notas];
//         this.cargando = false;
//       },
//       error: (error) => {
//         this.error = 'Error al cargar las notas de evolución: ' + error;
//         this.cargando = false;
//       }
//     });
//   }

//   filtrarNotas(): void {
//     if (!this.filtroTexto) {
//       this.notasFiltradas = [...this.notas];
//       return;
//     }

//     const filtro = this.filtroTexto.toLowerCase();
//     this.notasFiltradas = this.notas.filter(nota =>
//       nota.subjetivo?.toLowerCase().includes(filtro) ||
//       nota.objetivo?.toLowerCase().includes(filtro) ||
//       nota.analisis?.toLowerCase().includes(filtro) ||
//       nota.plan?.toLowerCase().includes(filtro) ||
//       nota.id_nota_evolucion.toString().includes(filtro)
//     );
//   }

//   abrirModalCrear(): void {
//     console.log('Abrir modal para crear nueva nota');
//   }

//   verDetalle(nota: NotaEvolucion): void {
//     console.log('Ver detalle de nota:', nota);
//   }

//   editarNota(nota: NotaEvolucion): void {
//     console.log('Editar nota:', nota);
//   }

//   eliminarNota(id: number): void {
//     if (confirm('¿Está seguro de que desea eliminar esta nota de evolución?')) {
//       this.notaEvolucionService.delete(id).subscribe({
//         next: () => {
//           this.notas = this.notas.filter(n => n.id_nota_evolucion !== id);
//           this.filtrarNotas();
//           console.log('Nota eliminada exitosamente');
//         },
//         error: (error) => {
//           this.error = 'Error al eliminar la nota: ' + error;
//         }
//       });
//     }
//   }

//   trackByFn(index: number, nota: NotaEvolucion): number {
//     return nota.id_nota_evolucion;
//   }
// }
