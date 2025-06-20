import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [FormsModule],
  standalone: true,
})
export class Login {
  credentials = {
    usuario: '',
    contrasena: '',
  };

  constructor(private authService: AuthService, private router: Router) {}

  handleSubmit() {
    if (
      this.credentials.usuario === 'admin' &&
      this.credentials.contrasena === 'admin'
    ) {
      this.authService.login();
      this.router.navigate(['/app/dashboard']);
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  }
}
