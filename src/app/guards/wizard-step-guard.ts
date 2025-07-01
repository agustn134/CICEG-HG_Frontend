import { CanActivateFn } from '@angular/router';

export const wizardStepGuard: CanActivateFn = (route, state) => {
  return true;
};
