import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HistoriasClinicas {
  private readonly API_URL = 'http://localhost:3000/api/documentos-clinicos/historias-clinicas';
//
  constructor() { }
}
