import { Injectable } from '@angular/core';
import { CanActivateFn, CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthGuard {
//   constructor(private authService: AuthService) {}

//   canActivate: CanMatchFn = () => {
//     return this.authService.isAuthenticated();
//   };
// }

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  canActivate: CanActivateFn = (route, state) => {
    // return false; // Original
    return true; // Bypass temporal
  };
}