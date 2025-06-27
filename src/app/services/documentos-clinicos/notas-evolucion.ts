import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotasEvolucion {
  private readonly API_URL = 'http://localhost:3000/api/documentos-clinicos/notas-evolucion';

  constructor() { }
}
