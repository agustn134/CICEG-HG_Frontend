import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReferenciasTraslado {

  private readonly API_URL = 'http://localhost:3000/api/documentos-clinicos/referencias-traslado';

  constructor() { }
}
