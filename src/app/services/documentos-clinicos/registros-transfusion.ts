import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class RegistrosTransfusion {

  private readonly API_URL = `${environment.apiUrl}/documentos-clinicos/registros-transfusion`;

  constructor() { }
}
