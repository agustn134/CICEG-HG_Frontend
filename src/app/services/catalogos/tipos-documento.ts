import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TiposDocumento {

  private readonly API_URL = 'http://localhost:3000/api/catalogos/tipos-documento';

  constructor() { }
}
