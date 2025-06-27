import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsentimientosInformados {

  private readonly API_URL = 'http://localhost:3000/api/documentos-clinicos/consentimientos-informados';

  constructor() { }
}
