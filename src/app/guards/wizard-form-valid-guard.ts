import { CanActivateFn } from '@angular/router';

export const wizardFormValidGuard: CanActivateFn = (route, state) => {
  return true;
};
