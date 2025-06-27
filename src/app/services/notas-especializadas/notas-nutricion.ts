import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotasNutricion {
private readonly API_URL = 'http://localhost:3000/api/notas-especializadas/notas-psicologia';
  constructor() { }
}
