import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Administradores {

  private readonly API_URL = 'http://localhost:3000/api/personas/administradores';

  constructor() { }
}




