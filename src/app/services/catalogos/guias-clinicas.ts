import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GuiasClinicas {

  private readonly API_URL = 'http://localhost:3000/api/catalogos/guias-clinicas';

  constructor() { }
}
