import { Routes } from '@angular/router';

// === Auth ===
import { RecuperarPassword } from './auth/recuperar-password/recuperar-password';
import { CambiarPassword } from './auth/cambiar-password/cambiar-password';
import { Registro } from './auth/registro/registro';

// === Home/Dashboard ===
import { Dashboard } from './home/dashboard/dashboard';

// === Guards ===
import { AuthGuard } from './guards/auth-guard'; // Necesitas crear este guardia

// ===== Catálogos =====
import { Servicios } from './catalogos/servicios/servicios';
import { AreasInterconsulta } from './catalogos/areas-interconsulta/areas-interconsulta';
import { EstudiosMedicos } from './catalogos/estudios-medicos/estudios-medicos';
import { GuiasClinicas } from './catalogos/guias-clinicas/guias-clinicas';
import { Medicamentos } from './catalogos/medicamentos/medicamentos';
import { TiposSangre } from './catalogos/tipos-sangre/tipos-sangre';
import { TiposDocumento } from './catalogos/tipos-documento/tipos-documento';

// ===== Personas =====
import { Administradores } from './personas/administradores/administradores';
import { Pacientes } from './personas/pacientes/pacientes';
import { PacientesListComponent } from './personas/pacientes/pacientes-list/pacientes-list';
import { PersonalMedico } from './personas/personal-medico/personal-medico';
import { Persona } from './personas/persona/persona';

// ===== Gestión de Expedientes =====
import { Expedientes } from './gestion-expedientes/expedientes/expedientes';
import { Camas } from './gestion-expedientes/camas/camas';
import { Internamientos } from './gestion-expedientes/internamientos/internamientos';
import { SignosVitales } from './gestion-expedientes/signos-vitales/signos-vitales';

// ===== Documentos Clínicos =====
import { HistoriasClinicasService } from './services/documentos-clinicos/historias-clinicas.service';
import { NotasUrgencias } from './documentos-clinicos/notas-urgencias/notas-urgencias';
import { NotasEvolucion } from './documentos-clinicos/notas-evolucion/notas-evolucion';
import { NotasInterconsulta } from './documentos-clinicos/notas-interconsulta/notas-interconsulta';
import { NotasPreoperatoria } from './documentos-clinicos/notas-preoperatoria/notas-preoperatoria';
import { NotasPreanestesica } from './documentos-clinicos/notas-preanestesica/notas-preanestesica';
import { NotasPostoperatoria } from './documentos-clinicos/notas-postoperatoria/notas-postoperatoria';
import { NotasPostanestesica } from './documentos-clinicos/notas-postanestesica/notas-postanestesica';
import { NotasEgreso } from './documentos-clinicos/notas-egreso/notas-egreso';
import { ConsentimientosInformados } from './documentos-clinicos/consentimientos-informados/consentimientos-informados';
import { SolicitudesEstudio } from './documentos-clinicos/solicitudes-estudio/solicitudes-estudio';
import { ReferenciasTraslado } from './documentos-clinicos/referencias-traslado/referencias-traslado';
import { PrescripcionesMedicamento } from './documentos-clinicos/prescripciones-medicamento/prescripciones-medicamento';
import { RegistrosTransfusion } from './documentos-clinicos/registros-transfusion/registros-transfusion';

// ===== Notas Especializadas =====
import { NotasPsicologia } from './notas-especializadas/notas-psicologia/notas-psicologia';
import { NotasNutricion } from './notas-especializadas/notas-nutricion/notas-nutricion';

import { Documentos } from './documentos-clinicos/documentos/documentos';
import { HistoriasClinicasComponent } from './documentos-clinicos/historias-clinicas/historias-clinicas';
import { Login } from './auth/login/login';

export const routes: Routes = [
  // === Rutas públicas (autenticación) ===
  // { path: 'login', component: Login },
  // { path: 'recuperar-password', component: RecuperarPassword },
  // { path: 'cambiar-password', component: CambiarPassword },
  // { path: 'registro', component: Registro },

  

  // === Rutas protegidas (deben estar protegidas con AuthGuard)
  { path: '', redirectTo: '/app', pathMatch: 'full' },
  {
    path: 'app',
    // canActivate: [AuthGuard],
    children: [
      // === Rutas protegidas (dashboard e internas) ===
      { path: 'dashboard', component: Dashboard }, // Página principal
      // ===== Catálogos =====
      { path: 'catalogos/servicios', component: Servicios },
      { path: 'catalogos/areas-interconsulta', component: AreasInterconsulta },
      { path: 'catalogos/guias-clinicas', component: GuiasClinicas },
      { path: 'catalogos/estudios-medicos', component: EstudiosMedicos },
      { path: 'catalogos/medicamentos', component: Medicamentos },
      { path: 'catalogos/tipos-sangre', component: TiposSangre },
      { path: 'catalogos/tipos-documento', component: TiposDocumento },
      // ===== Personas =====
      { path: 'personas/administradores', component: Administradores },
      { path: 'personas/pacientes', component: Pacientes },
      {path: 'personas/pacientes-list', component: PacientesListComponent },
      { path: 'personas/personal-medico', component: PersonalMedico },
      { path: 'personas', component: Persona }, // Última ruta general

      // ===== Gestión de Expedientes =====
      { path: 'gestion-expedientes/expedientes', component: Expedientes },
      { path: 'gestion-expedientes/camas', component: Camas },
      { path: 'gestion-expedientes/internamientos', component: Internamientos },
      { path: 'gestion-expedientes/signos-vitales', component: SignosVitales },

      // ===== Documentos Clínicos =====
      { path: 'documentos-clinicos/documentos', component: Documentos },
      {
        path: 'documentos-clinicos/historias-clinicas',
        component: HistoriasClinicasComponent,
      },
      
      {
        path: 'documentos-clinicos/notas-urgencias',
        component: NotasUrgencias,
      },
      {
        path: 'documentos-clinicos/notas-evolucion',
        component: NotasEvolucion,
      },
      {
        path: 'documentos-clinicos/notas-interconsulta',
        component: NotasInterconsulta,
      },
      {
        path: 'documentos-clinicos/notas-preoperatoria',
        component: NotasPreoperatoria,
      },
      {
        path: 'documentos-clinicos/notas-preanestesica',
        component: NotasPreanestesica,
      },
      {
        path: 'documentos-clinicos/notas-postoperatoria',
        component: NotasPostoperatoria,
      },
      {
        path: 'documentos-clinicos/notas-postanestesica',
        component: NotasPostanestesica,
      },
      { path: 'documentos-clinicos/notas-egreso', component: NotasEgreso },
      {
        path: 'documentos-clinicos/consentimientos-informados',
        component: ConsentimientosInformados,
      },
      {
        path: 'documentos-clinicos/solicitudes-estudio',
        component: SolicitudesEstudio,
      },
      {
        path: 'documentos-clinicos/referencias-traslado',
        component: ReferenciasTraslado,
      },
      {
        path: 'documentos-clinicos/prescripciones-medicamento',
        component: PrescripcionesMedicamento,
      },
      {
        path: 'documentos-clinicos/registros-transfusion',
        component: RegistrosTransfusion,
      },

      // ===== Notas Especializadas =====
      {
        path: 'notas-especializadas/notas-psicologia',
        component: NotasPsicologia,
      },
      {
        path: 'notas-especializadas/notas-nutricion',
        component: NotasNutricion,
      },
    ],
  },
  // === Redirección por defecto ===
  { path: '**', redirectTo: '' },
];
