import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TiposSangre {

  private readonly API_URL = 'http://localhost:3000/api/catalogos/tipos-sangre';

  constructor() { }
}
