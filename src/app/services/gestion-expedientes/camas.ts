import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Camas {
  private readonly API_URL = 'http://localhost:3000/api/personas/camas';

  constructor() { }
}
