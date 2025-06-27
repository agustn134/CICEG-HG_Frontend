import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PersonalMedico {

  private readonly API_URL = 'http://localhost:3000/api/personas/personal-medico';

  constructor() { }
}
