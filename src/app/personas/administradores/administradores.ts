// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-administradores',
//   imports: [],
//   templateUrl: './administradores.html',
//   styleUrl: './administradores.css'
// })
// export class Administradores {

// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdministradoresService } from '../../services/personas/administradores.service';
import { Administrador } from '../../models/administrador.model';

@Component({
  selector: 'app-administradores',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './administradores.html',
  styleUrl: './administradores.css'
})
export class Administradores implements OnInit {
  administradores: Administrador[] = [];
  administradorForm: FormGroup;
  showModal = false;
  editingId: number | null = null;
  isLoading = false;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 8;
  // Exponer Math global para usar en el template
  Math: any = Math; 

  // Filtros
  filtroNivelAcceso = '';
  filtroActivo = '';


  constructor(
    private fb: FormBuilder,
    public administradoresService: AdministradoresService,
  ) {
    this.administradorForm = this.fb.group({
      id_persona: ['', [Validators.required, Validators.min(1)]],
      usuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      nivel_acceso: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      activo: [true],
      foto: ['']
    });
  }

  ngOnInit() {
    this.loadAdministradores();
  }

  loadAdministradores() {
    this.isLoading = true;
    // Aquí llamarías al servicio real
    this.administradoresService.getAdministradores().subscribe(
      (data: Administrador[]) => {
        this.administradores = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al cargar administradores:', error);
        this.isLoading = false;
      }
    );
  

    // // Datos de ejemplo para demostración
    // setTimeout(() => {
    //   this.administradores = [
    //     {
    //       id_administrador: 1,
    //       id_persona: 101,
    //       usuario: 'admin01',
    //       contrasena: '******',
    //       nivel_acceso: 5,
    //       activo: true,
    //       foto: 'https://via.placeholder.com/40'
    //     },
    //     {
    //       id_administrador: 2,
    //       id_persona: 102,
    //       usuario: 'supervisor',
    //       contrasena: '******',
    //       nivel_acceso: 3,
    //       activo: true,
    //       foto: 'https://via.placeholder.com/40'
    //     },
    //     {
    //       id_administrador: 3,
    //       id_persona: 103,
    //       usuario: 'operador01',
    //       contrasena: '******',
    //       nivel_acceso: 1,
    //       activo: false,
    //       foto: 'https://via.placeholder.com/40'
    //     }
    //   ];
    //   this.isLoading = false;
    // }, 1000);
  }

  openModal(administrador?: Administrador) {
    this.showModal = true;
    if (administrador) {
      this.editingId = administrador.id_administrador;
      this.administradorForm.patchValue({
        id_persona: administrador.id_persona,
        usuario: administrador.usuario,
        contrasena: '', // No mostramos la contraseña real
        nivel_acceso: administrador.nivel_acceso,
        activo: administrador.activo,
        foto: administrador.foto
      });
    } else {
      this.editingId = null;
      this.administradorForm.reset({
        nivel_acceso: 1,
        activo: true
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.administradorForm.reset();
  }

  onSubmit() {
    if (this.administradorForm.valid) {
      this.isLoading = true;
      const formData = this.administradorForm.value;
      
      if (this.editingId) {
        // Actualizar
        console.log('Actualizando administrador:', this.editingId, formData);
      } else {
        // Crear nuevo
        console.log('Creando nuevo administrador:', formData);
      }

      // Simular operación
      setTimeout(() => {
        this.loadAdministradores();
        this.closeModal();
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  deleteAdministrador(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este administrador?')) {
      this.isLoading = true;
      console.log('Eliminando administrador:', id);
      
      // Simular eliminación
      setTimeout(() => {
        this.administradores = this.administradores.filter(a => a.id_administrador !== id);
        this.isLoading = false;
      }, 1000);
    }
  }

  toggleStatus(administrador: Administrador) {
    administrador.activo = !administrador.activo;
    console.log('Cambiando estado:', administrador.id_administrador, administrador.activo);
    // Aquí llamarías al servicio para actualizar
  }

  private markFormGroupTouched() {
    Object.keys(this.administradorForm.controls).forEach(key => {
      const control = this.administradorForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para validaciones
  get f() { return this.administradorForm.controls; }

  get filteredAdministradores() {
    return this.administradores.filter(admin => {
      const matchesSearch = admin.usuario.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           admin.id_persona.toString().includes(this.searchTerm);
      const matchesNivel = !this.filtroNivelAcceso || admin.nivel_acceso.toString() === this.filtroNivelAcceso;
      const matchesActivo = this.filtroActivo === '' || 
                           (this.filtroActivo === 'true' && admin.activo) ||
                           (this.filtroActivo === 'false' && !admin.activo);
      
      return matchesSearch && matchesNivel && matchesActivo;
    });
  }

  get paginatedAdministradores() {
    const filtered = this.filteredAdministradores;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredAdministradores.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getNivelAccesoLabel(nivel: number): string {
    const niveles = {
      1: 'Operador',
      2: 'Asistente',
      3: 'Supervisor',
      4: 'Gerente',
      5: 'Administrador'
    };
    return niveles[nivel as keyof typeof niveles] || 'Desconocido';
  }

  getNivelAccesoColor(nivel: number): string {
    const colors = {
      1: 'bg-gray-100 text-gray-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    };
    return colors[nivel as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }
}