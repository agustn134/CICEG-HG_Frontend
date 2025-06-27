import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Internamientos {

  private readonly API_URL = 'http://localhost:3000/api/personas/internamientos';

  constructor() { }
}
