// src/app/personas/perfil-medico/perfil-medico.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { PersonalMedicoService, MedicoConPacientes, PacienteAtendido } from '../../services/personas/personal-medico'; //   Cambiar ruta

@Component({
  selector: 'app-perfil-medico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-medico.html',
  styleUrl: './perfil-medico.css'
})
export class PerfilMedico implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  medicoCompleto: MedicoConPacientes | null = null;
  loading = true;
  error = '';
  filtroActivo = 'todos';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private personalMedicoService: PersonalMedicoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.cargarPerfilMedico(parseInt(id));
    } else {
      this.error = 'ID de médico no válido';
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarPerfilMedico(id: number): void {
    this.loading = true;
    this.error = '';

    this.personalMedicoService.getPerfilMedicoConPacientes(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.medicoCompleto = response.data || null; //   Cambiar esto
          } else {
            this.error = response.message || 'Error al cargar el perfil médico';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar perfil médico:', error);
          this.error = 'Error al cargar la información del médico';
          this.loading = false;
        }
      });
  }

  get pacientesFiltrados(): PacienteAtendido[] {
    if (!this.medicoCompleto?.pacientes_atendidos) return [];

    const pacientes = this.medicoCompleto.pacientes_atendidos;

    switch (this.filtroActivo) {
      case 'activos':
        // Pacientes con documentos recientes (últimos 30 días)
        return pacientes.filter(p => {
          const fechaUltimoDoc = new Date(p.ultimo_documento);
          const hace30Dias = new Date();
          hace30Dias.setDate(hace30Dias.getDate() - 30);
          return fechaUltimoDoc >= hace30Dias;
        });
      case 'hospitalizados':
        // Aquí podrías filtrar pacientes hospitalizados si tienes esa info
        return pacientes.filter(p => p.total_documentos > 5); // Ejemplo temporal
      default:
        return pacientes;
    }
  }

  get estadisticasRapidas() {
    if (!this.medicoCompleto) return null;

    const pacientes = this.medicoCompleto.pacientes_atendidos;
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    return {
      total_pacientes: pacientes.length,
      pacientes_activos: pacientes.filter(p => {
        const fechaUltimoDoc = new Date(p.ultimo_documento);
        return fechaUltimoDoc >= hace30Dias;
      }).length,
      documentos_total: this.medicoCompleto.total_documentos_creados,
      documentos_mes: this.medicoCompleto.documentos_mes_actual
    };
  }

  verPerfilPaciente(idPaciente: number): void {
    this.router.navigate(['/app/personas/perfil-paciente', idPaciente]);
  }

  aplicarFiltro(filtro: string): void {
    this.filtroActivo = filtro;
  }

  recargarPerfil(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.cargarPerfilMedico(parseInt(id));
    }
  }

  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatearFechaRelativa(fecha: string): string {
    const fechaDoc = new Date(fecha);
    const ahora = new Date();
    const diferenciaDias = Math.floor((ahora.getTime() - fechaDoc.getTime()) / (1000 * 60 * 60 * 24));

    if (diferenciaDias === 0) return 'Hoy';
    if (diferenciaDias === 1) return 'Ayer';
    if (diferenciaDias < 7) return `Hace ${diferenciaDias} días`;
    if (diferenciaDias < 30) return `Hace ${Math.floor(diferenciaDias / 7)} semanas`;
    return this.formatearFecha(fecha);
  }

  trackByPaciente(index: number, paciente: PacienteAtendido): number {
    return paciente.id_paciente;
  }
}
