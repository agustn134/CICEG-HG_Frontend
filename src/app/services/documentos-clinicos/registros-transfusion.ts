import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegistrosTransfusion {

  private readonly API_URL = 'http://localhost:3000/api/documentos-clinicos/registros-transfusion';

  constructor() { }
}
