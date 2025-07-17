// // src/app/guards/auth.guard.ts
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { AuthService } from '../services/auth/auth.service';

// export const authGuard = () => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   if (authService.isLoggedIn) {
//     return true;
//   }

//   router.navigate(['/login']);
//   return false;
// };
// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.currentUserValue;

    if (currentUser) {
      // Usuario autenticado
      return true;
    }

    // No autenticado, redirigir al login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
