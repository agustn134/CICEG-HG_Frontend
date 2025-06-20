import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  protected apiUrl = 'http://localhost:3000/api'; // 👈 Eliminado espacio adicional

  constructor(protected http: HttpClient) {}
}