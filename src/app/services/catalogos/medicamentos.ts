import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Medicamentos {

  private readonly API_URL = 'http://localhost:3000/api/catalogos/medicamentos';

  constructor() { }
}
