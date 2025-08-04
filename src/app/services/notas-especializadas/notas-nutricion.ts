import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class NotasNutricion {
private readonly API_URL = `${environment.apiUrl}/api/notas-especializadas/notas-psicologia`;
  constructor() { }
}
