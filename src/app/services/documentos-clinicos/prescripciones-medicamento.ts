import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrescripcionesMedicamento {

  private readonly API_URL = 'http://localhost:3000/api/documentos-clinicos/prescripciones-medicamento';


  constructor() { }
}
