import { Component } from '@angular/core';
// import { AuthService } from '../../services/auth.service'; // Comentado por ahora
// import { Router } from '@angular/router'; // Comentado por ahora

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: []
})
export class NavbarComponent {

  // constructor(private authService: AuthService, private router: Router) {} // Temporalmente eliminado
  constructor() {}

  // logout() {
  //   this.authService.logout();
  //   this.router.navigate(['/login']);
  // }

  // Datos estáticos para menú de navegación
  menuItems = [
    {
      title: 'Catálogos',
      items: [
        { name: 'Servicios', path: 'app/catalogos/servicios' },
        { name: 'Guías Clínicas', path: 'app/catalogos/guias-clinicas' },
        { name: 'Tipos de Sangre', path: 'app/catalogos/tipos-sangre' }
      ]
    },
    {
      title: 'Documentos Clínicos',
      items: [
        { name: 'Historias Clínicas', path: 'app/documentos-clinicos/historias-clinicas' },
        { name: 'Notas Urgencias', path: 'app/documentos-clinicos/notas-urgencias' },
        { name: 'Prescripciones', path: 'app/documentos-clinicos/prescripciones-medicamento' }
      ]
    },
    {
      title: 'Personas',
      items: [
        { name: 'Pacientes', path: 'app/personas/pacientes' },
        { name: 'Personal Médico', path: 'app/personas/personal-medico' },
        { name: 'Administradores', path: 'app/personas/administradores' }
      ]
    }
  ];

  activeDropdown: string | null = null;

  toggleDropdown(title: string) {
    this.activeDropdown = this.activeDropdown === title ? null : title;
  }

  isMobileMenuOpen = false;

toggleMobileMenu() {
  this.isMobileMenuOpen = !this.isMobileMenuOpen;
}
}