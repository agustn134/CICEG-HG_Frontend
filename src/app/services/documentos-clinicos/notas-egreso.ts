import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotasEgreso {

  private readonly API_URL = 'http://localhost:3000/api/documentos-clinicos/notas-egreso';

  constructor() { }
}
