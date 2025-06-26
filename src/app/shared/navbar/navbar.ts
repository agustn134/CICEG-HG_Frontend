// import { Component } from '@angular/core';
// // import { AuthService } from '../../services/auth.service'; // Comentado por ahora
// // import { Router } from '@angular/router'; // Comentado por ahora

// @Component({
//   selector: 'app-navbar',
//   templateUrl: './navbar.html',
//   styleUrls: ['./navbar.css'],
//   standalone: true,
//   imports: []
// })
// export class NavbarComponent {

//   // constructor(private authService: AuthService, private router: Router) {} // Temporalmente eliminado
//   constructor() {}

//   // logout() {
//   //   this.authService.logout();
//   //   this.router.navigate(['/login']);
//   // }

//   // Datos estáticos para menú de navegación
//   menuItems = [
//     {
//       title: 'Catálogos',
//       items: [
//         { name: 'Servicios', path: 'app/catalogos/servicios' },
//         { name: 'Guías Clínicas', path: 'app/catalogos/guias-clinicas' },
//         { name: 'Tipos de Sangre', path: 'app/catalogos/tipos-sangre' }
//       ]
//     },
//     {
//       title: 'Documentos Clínicos',
//       items: [
//         { name: 'Historias Clínicas', path: 'app/documentos-clinicos/historias-clinicas' },
//         { name: 'Notas Urgencias', path: 'app/documentos-clinicos/notas-urgencias' },
//         { name: 'Prescripciones', path: 'app/documentos-clinicos/prescripciones-medicamento' }
//       ]
//     },
//     {
//       title: 'Personas',
//       items: [
//         { name: 'Pacientes', path: 'app/personas/pacientes' },
//         { name: 'Personal Médico', path: 'app/personas/personal-medico' },
//         { name: 'Administradores', path: 'app/personas/administradores' }
//       ]
//     }
//   ];

//   activeDropdown: string | null = null;

//   toggleDropdown(title: string) {
//     this.activeDropdown = this.activeDropdown === title ? null : title;
//   }

//   isMobileMenuOpen = false;

// toggleMobileMenu() {
//   this.isMobileMenuOpen = !this.isMobileMenuOpen;
// }
// }






// C:\CICEG-HG-APP\src\app\shared\navbar\navbar.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { AuthService } from '../../services/auth.service'; // Comentado por ahora
// import { Router } from '@angular/router'; // Comentado por ahora

interface MenuItem {
  name: string;
  path: string;
  icon?: string;
}

interface MenuSection {
  title: string;
  icon: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent implements OnInit {

  // constructor(private authService: AuthService, private router: Router) {} // Temporalmente eliminado
  constructor() {}

  ngOnInit(): void {
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        this.activeDropdown = null;
      }
    });
  }

  // Estado del navbar
  activeDropdown: string | null = null;
  isMobileMenuOpen = false;
  isScrolled = false;

  // Datos completos del menú de navegación
  menuItems: MenuSection[] = [
    {
      title: 'Dashboard',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z',
      items: [
        { name: 'Inicio', path: '/app/dashboard', icon: 'home' }
      ]
    },
    {
      title: 'Catálogos',
      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      items: [
        { name: 'Servicios', path: '/app/catalogos/servicios' },
        { name: 'Áreas de Interconsulta', path: '/app/catalogos/areas-interconsulta' },
        { name: 'Guías Clínicas', path: '/app/catalogos/guias-clinicas' },
        { name: 'Estudios Médicos', path: '/app/catalogos/estudios-medicos' },
        { name: 'Medicamentos', path: '/app/catalogos/medicamentos' },
        { name: 'Tipos de Sangre', path: '/app/catalogos/tipos-sangre' },
        { name: 'Tipos de Documento', path: '/app/catalogos/tipos-documento' }
      ]
    },
    {
      title: 'Personas',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      items: [
        { name: 'Pacientes', path: '/app/personas/pacientes' },
        { name: 'Lista de Pacientes', path: '/app/personas/pacientes-list' },
        { name: 'Personal Médico', path: '/app/personas/personal-medico' },
        { name: 'Administradores', path: '/app/personas/administradores' },
        { name: 'Personas (General)', path: '/app/personas' }
      ]
    },
    {
      title: 'Gestión de Expedientes',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      items: [
        { name: 'Expedientes', path: '/app/gestion-expedientes/expedientes' },
        { name: 'Camas', path: '/app/gestion-expedientes/camas' },
        { name: 'Internamientos', path: '/app/gestion-expedientes/internamientos' },
        { name: 'Signos Vitales', path: '/app/gestion-expedientes/signos-vitales' }
      ]
    },
    {
      title: 'Documentos Clínicos',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      items: [
        { name: 'Documentos', path: '/app/documentos-clinicos/documentos' },
        { name: 'Historias Clínicas', path: '/app/documentos-clinicos/historias-clinicas' },
        { name: 'Notas de Urgencias', path: '/app/documentos-clinicos/notas-urgencias' },
        { name: 'Notas de Evolución', path: '/app/documentos-clinicos/notas-evolucion' },
        { name: 'Notas de Interconsulta', path: '/app/documentos-clinicos/notas-interconsulta' },
        { name: 'Notas Preoperatorias', path: '/app/documentos-clinicos/notas-preoperatoria' },
        { name: 'Notas Preanestésicas', path: '/app/documentos-clinicos/notas-preanestesica' },
        { name: 'Notas Postoperatorias', path: '/app/documentos-clinicos/notas-postoperatoria' },
        { name: 'Notas Postanestésicas', path: '/app/documentos-clinicos/notas-postanestesica' },
        { name: 'Notas de Egreso', path: '/app/documentos-clinicos/notas-egreso' },
        { name: 'Consentimientos Informados', path: '/app/documentos-clinicos/consentimientos-informados' },
        { name: 'Solicitudes de Estudio', path: '/app/documentos-clinicos/solicitudes-estudio' },
        { name: 'Referencias y Traslados', path: '/app/documentos-clinicos/referencias-traslado' },
        { name: 'Prescripciones de Medicamentos', path: '/app/documentos-clinicos/prescripciones-medicamento' },
        { name: 'Registros de Transfusión', path: '/app/documentos-clinicos/registros-transfusion' }
      ]
    },
    {
      title: 'Notas Especializadas',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      items: [
        { name: 'Notas de Psicología', path: '/app/notas-especializadas/notas-psicologia' },
        { name: 'Notas de Nutrición', path: '/app/notas-especializadas/notas-nutricion' }
      ]
    }
  ];





  // Métodos de navegación
  toggleDropdown(title: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.activeDropdown = this.activeDropdown === title ? null : title;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    // Prevent body scroll when mobile menu is open
    if (this.isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.activeDropdown = null;
    document.body.classList.remove('overflow-hidden');
  }

  // Listener para scroll
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.pageYOffset > 10;
  }

  // Cerrar dropdown al hacer clic en un enlace
  onLinkClick(): void {
    this.activeDropdown = null;
    this.closeMobileMenu();
  }

  // Obtener icono SVG
  getIconPath(iconName: string): string {
    const icons: { [key: string]: string } = {
      home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      catalog: 'M19 11H5m14-4H5m14 8H5',
      users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      documents: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    };
    return icons[iconName]
  }

  // TrackBy functions para optimizar el rendering
  trackByTitle(index: number, menu: MenuSection): string {
    return menu.title;
  }

  trackByPath(index: number, item: MenuItem): string {
    return item.path;
  }

  // Logout method (cuando esté disponible)
  // logout(): void {
  //   this.authService.logout();
  //   this.router.navigate(['/login']);
  // }

}
