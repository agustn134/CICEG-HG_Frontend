import { Component } from '@angular/core';
import { StatsCardComponent } from './stats-card/stats-card';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [StatsCardComponent]
})
export class Dashboard {
  user = {
    nombre: 'Juan',
    apellido_paterno: 'Pérez'
  };

  recentActivities = [
    { id: 1, type: 'Expediente creado', patient: 'Juan Pérez García', time: '10:30 AM', status: 'completado' },
    { id: 2, type: 'Historia Clínica', patient: 'María López Hernández', time: '09:45 AM', status: 'pendiente' },
    { id: 3, type: 'Nota de Evolución', patient: 'Carlos Rodríguez Silva', time: '08:20 AM', status: 'completado' },
    { id: 4, type: 'Paciente registrado', patient: 'Ana Martínez González', time: 'Ayer 4:15 PM', status: 'completado' }
  ];

  quickActions = [
    { title: 'Nuevo Paciente', description: 'Registrar nuevo paciente', href: '/personas/pacientes/nuevo', icon: 'user' },
    { title: 'Nueva Historia Clínica', description: 'Crear historia clínica', href: '/documentos-clinicos/historias-clinicas', icon: 'file-text' },
    { title: 'Buscar Expediente', description: 'Buscar expedientes existentes', href: '/gestion-expedientes/expedientes', icon: 'archive' }
  ];

  getStatusColor(status: string): string {
    switch (status) {
      case 'completado': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
