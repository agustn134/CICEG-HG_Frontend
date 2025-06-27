import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotasPreanestesica {

    private readonly API_URL = 'http://localhost:3000/api/documentos-clinicos/notas-preanestesica';

  constructor() { }
}
