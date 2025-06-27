import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EstudiosMedicos {
  private readonly API_URL = 'http://localhost:3000/api/catalogos/estudios-medicos';

  constructor() { }
}
