import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacientesService } from '../../../services/personas/pacientes.service';
import { Paciente } from '../../../models/paciente.model';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes-list.html',
  styleUrl: './pacientes-list.css',
})
export class PacientesListComponent implements OnInit {
  pacientes: Paciente[] = [];
  filteredPacientes: Paciente[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;

  constructor(public pacientesService: PacientesService) {}

  ngOnInit(): void {
    this.loadPacientes();
  }

  loadPacientes(): void {
    this.pacientesService.getPacientes().subscribe({
      next: (data) => {
        this.pacientes = data;
        this.filteredPacientes = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar pacientes:', error);
        this.isLoading = false;
      },
    });
  }
//   loadPacientes(): void {
//   this.pacientesService.getPacientes().subscribe({
//     next: (data) => {
//       console.log('Datos recibidos:', data); // 👈 Mira qué estructura tienen tus pacientes
//       this.pacientes = data;
//       this.filteredPacientes = data;
//       this.isLoading = false;
//     },
//     error: (error) => {
//       console.error('Error al cargar pacientes:', error);
//       this.isLoading = false;
//     }
//   });
// }

  filterPacientes(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredPacientes = this.pacientes.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(term) ||
        p.apellido_paterno?.toLowerCase().includes(term) ||
        p.apellido_materno?.toLowerCase().includes(term) ||
        p.curp?.toLowerCase().includes(term)
    );
  }

  calculateAge(birthDate: string | Date | undefined): number | null {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  getAlergiaClass(alergias: string | undefined): string {
    if (!alergias || alergias === '' || alergias === 'Ninguna conocida') {
      return 'text-green-600';
    }
    return 'text-red-600 font-medium';
  }

  trackByPatientId(index: number, patient: Paciente): any {
    return patient.id_paciente;
  }

  trackByFn(index: number, item: Paciente): number {
    return item.id_paciente;
  }
}
