import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotasPsicologia {

  private readonly API_URL = 'http://localhost:3000/api/notas-especializadas/notas-nutricion';

  constructor() { }
}
