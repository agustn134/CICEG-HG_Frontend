import { Component } from '@angular/core';
import { PacientesListComponent } from './pacientes-list/pacientes-list';

@Component({
  selector: 'app-pacientes',
  imports: [PacientesListComponent],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css'
})
export class Pacientes {

}
