// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface UsuarioActual {
  id: number;
  usuario: string;
  nombre_completo: string;
  tipo_usuario: 'medico' | 'administrador';
  especialidad?: string;
  cargo?: string;
  departamento?: string;
  activo: boolean;
  foto?: string;
  id_referencia?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = false;

  // 🆕 Cambiar a BehaviorSubject para sincronización en tiempo real
  private currentUserSubject = new BehaviorSubject<UsuarioActual | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Cargar usuario desde localStorage si existe
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.loggedIn = true;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  private saveUserToStorage(user: UsuarioActual | null): void {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  isAuthenticated(): boolean {
    return this.loggedIn;
  }

  login(): void {
    this.loggedIn = true;
  }

  logout(): void {
    this.loggedIn = false;
    this.currentUserSubject.next(null);
    this.saveUserToStorage(null);
  }

  getCurrentUser(): UsuarioActual | null {
    return this.currentUserSubject.value;
  }

  // 🆕 Método para establecer el usuario completo (usado en login real)
  setCurrentUser(user: UsuarioActual): void {
    this.currentUserSubject.next(user);
    this.saveUserToStorage(user);
    this.loggedIn = true;
    console.log('  Usuario establecido en AuthService:', user);
  }

  // 🆕 Método para actualizar la foto del usuario actual
  updateUserPhoto(photoUrl: string | null): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedUser = { ...currentUser, foto: photoUrl || undefined };
      this.currentUserSubject.next(updatedUser);
      this.saveUserToStorage(updatedUser);
      console.log('  Foto sincronizada en AuthService:', photoUrl);
    }
  }

  // 🆕 Método para actualizar información específica del usuario
  updateCurrentUser(userUpdates: Partial<UsuarioActual>): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userUpdates };
      this.currentUserSubject.next(updatedUser);
      this.saveUserToStorage(updatedUser);
      console.log('  Usuario actualizado en AuthService:', userUpdates);
    }
  }
}
