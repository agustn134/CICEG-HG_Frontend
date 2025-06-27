import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SignosVitales {

  private readonly API_URL = 'http://localhost:3000/api/personas/signos-vitales';

  constructor() { }
}
