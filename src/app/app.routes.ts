import { Routes } from '@angular/router';

// === Auth ===
import { RecuperarPassword } from './auth/recuperar-password/recuperar-password';
import { CambiarPassword } from './auth/cambiar-password/cambiar-password';
import { Registro } from './auth/registro/registro';
import { Login } from './auth/login/login';

// === Layout Components ===
import { DashboardLayoutComponent } from './shared/components/dashboard-layout/dashboard-layout';

// === Home/Dashboard ===
import { Dashboard } from './home/dashboard/dashboard';

// === Guards ===
// import { AuthGuard } from './guards/auth-guard'; // Comentado temporalmente

// ===== Catálogos =====
import { Servicios } from './catalogos/servicios/servicios';
import { AreasInterconsultaComponent } from './catalogos/areas-interconsulta/areas-interconsulta';
import { EstudiosMedicosComponent } from './catalogos/estudios-medicos/estudios-medicos';
import { GuiasClinicasComponent } from './catalogos/guias-clinicas/guias-clinicas';
import { MedicamentosComponent } from './catalogos/medicamentos/medicamentos';
import { TiposSangre } from './catalogos/tipos-sangre/tipos-sangre';
import { TiposDocumento } from './catalogos/tipos-documento/tipos-documento';

// ===== Personas =====
import { Administradores } from './personas/administradores/administradores';
import { Pacientes } from './personas/pacientes/pacientes';
import { PersonalMedicoComponent } from './personas/personal-medico/personal-medico';
import { PersonasComponent } from './personas/personas/personas';

// ===== Gestión de Expedientes =====
import { Expedientes } from './gestion-expedientes/expedientes/expedientes';
import { Camas } from './gestion-expedientes/camas/camas';
import { Internamientos } from './gestion-expedientes/internamientos/internamientos';
import { SignosVitales } from './gestion-expedientes/signos-vitales/signos-vitales';

// ===== Documentos Clínicos =====
import { Documentos } from './documentos-clinicos/documentos/documentos';
import { HistoriasClinicas } from './documentos-clinicos/historias-clinicas/historias-clinicas';
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

export const routes: Routes = [
  // === Rutas públicas (autenticación) ===
  // { path: 'login', component: Login },
  // { path: 'recuperar-password', component: RecuperarPassword },
  // { path: 'cambiar-password', component: CambiarPassword },
  // { path: 'registro', component: Registro },

  // === Redirección principal ===
  { path: '', redirectTo: '/app/dashboard', pathMatch: 'full' },

  // === Rutas protegidas con Dashboard Layout ===
  {
    path: 'app',
    component: DashboardLayoutComponent, // 🔥 Layout principal con sidebar
    // canActivate: [AuthGuard], // Descomenta cuando tengas el guard
    children: [
      // === Dashboard principal ===
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },

      // ===== Catálogos =====
      {
        path: 'catalogos',
        children: [
          { path: '', redirectTo: 'servicios', pathMatch: 'full' },
          { path: 'servicios', component: Servicios },
          { path: 'areas-interconsulta', component: AreasInterconsultaComponent },
          { path: 'guias-clinicas', component: GuiasClinicasComponent },
          { path: 'estudios-medicos', component: EstudiosMedicosComponent },
          { path: 'medicamentos', component: MedicamentosComponent },
          { path: 'tipos-sangre', component: TiposSangre },
          { path: 'tipos-documento', component: TiposDocumento },
        ]
      },

      // ===== Personas =====
      {
        path: 'personas',
        children: [
          { path: '', component: PersonasComponent },
          { path: 'administradores', component: Administradores },
          { path: 'pacientes', component: Pacientes },
          { path: 'pacientes-list', component: Pacientes }, // Mismo componente por ahora
          { path: 'personal-medico', component: PersonalMedicoComponent },
        ]
      },

      // ===== Gestión de Expedientes =====
      {
        path: 'gestion-expedientes',
        children: [
          { path: '', redirectTo: 'expedientes', pathMatch: 'full' },
          { path: 'expedientes', component: Expedientes },
          { path: 'camas', component: Camas },
          { path: 'internamientos', component: Internamientos },
          { path: 'signos-vitales', component: SignosVitales },
        ]
      },

      // ===== Documentos Clínicos =====
      {
        path: 'documentos-clinicos',
        children: [
          { path: '', redirectTo: 'documentos', pathMatch: 'full' },
          { path: 'documentos', component: Documentos },
          { path: 'historias-clinicas', component: HistoriasClinicas },
          { path: 'notas-urgencias', component: NotasUrgencias },
          { path: 'notas-evolucion', component: NotasEvolucion },
          { path: 'notas-interconsulta', component: NotasInterconsulta },
          { path: 'notas-preoperatoria', component: NotasPreoperatoria },
          { path: 'notas-preanestesica', component: NotasPreanestesica },
          { path: 'notas-postoperatoria', component: NotasPostoperatoria },
          { path: 'notas-postanestesica', component: NotasPostanestesica },
          { path: 'notas-egreso', component: NotasEgreso },
          { path: 'consentimientos-informados', component: ConsentimientosInformados },
          { path: 'solicitudes-estudio', component: SolicitudesEstudio },
          { path: 'referencias-traslado', component: ReferenciasTraslado },
          { path: 'prescripciones-medicamento', component: PrescripcionesMedicamento },
          { path: 'registros-transfusion', component: RegistrosTransfusion },
        ]
      },

      // ===== Notas Especializadas =====
      {
        path: 'notas-especializadas',
        children: [
          { path: '', redirectTo: 'notas-psicologia', pathMatch: 'full' },
          { path: 'notas-psicologia', component: NotasPsicologia },
          { path: 'notas-nutricion', component: NotasNutricion },
        ]
      },
    ],
  },

  // === Redirección por defecto ===
  { path: '**', redirectTo: '/app/dashboard' },
];
