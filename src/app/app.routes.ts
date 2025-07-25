import { Routes } from '@angular/router';

// === Auth ===
import { RecuperarPassword } from './auth/recuperar-password/recuperar-password';
import { CambiarPassword } from './auth/cambiar-password/cambiar-password';
import { Registro } from './auth/registro/registro';
import { Login } from './auth/login/login';

// === Layout Components ===
import { DashboardLayoutComponent } from './shared/components/dashboard-layout/dashboard-layout';
import { WizardLayout } from './shared/components/wizard-layout/wizard-layout';

// === Home/Dashboard ===
import { Dashboard } from './home/dashboard/dashboard';

// === Guards ===
// import { AuthGuard } from './guards/auth-guard'; // Comentado temporalmente
// import { WizardStepGuard } from './guards/wizard-step-guard';
// import { WizardFormValidGuard } from './guards/wizard-form-valid-guard';

// ===== NUEVOS COMPONENTES WIZARD =====
import { NuevoPaciente } from './nuevo-paciente/nuevo-paciente';
import { PasoPersona } from './nuevo-paciente/paso-persona/paso-persona';
import { PasoPaciente } from './nuevo-paciente/paso-paciente/paso-paciente';
import { PasoExpediente } from './nuevo-paciente/paso-expediente/paso-expediente';

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
import { PerfilPaciente } from './personas/perfil-paciente/perfil-paciente';
// ===== Gestión de Expedientes =====
import { Expedientes } from './gestion-expedientes/expedientes/expedientes';
import { CamasComponent } from './gestion-expedientes/camas/camas';
import { InternamientosComponent } from './gestion-expedientes/internamientos/internamientos';
import { SignosVitalesComponent } from './gestion-expedientes/signos-vitales/signos-vitales';

// ===== Documentos Clínicos =====
import { Documentos } from './documentos-clinicos/documentos/documentos';
import { HistoriasClinicasComponent } from './documentos-clinicos/historias-clinicas/historias-clinicas';
import { NotasUrgenciasComponent } from './documentos-clinicos/notas-urgencias/notas-urgencias';
import { NotasEvolucionComponent } from './documentos-clinicos/notas-evolucion/notas-evolucion';
import { NotasInterconsulta } from './documentos-clinicos/notas-interconsulta/notas-interconsulta';
import { NotasPreoperatoriaComponent } from './documentos-clinicos/notas-preoperatoria/notas-preoperatoria';
import { NotasPreanestesicaComponent } from './documentos-clinicos/notas-preanestesica/notas-preanestesica';
import { NotasPostoperatoria } from './documentos-clinicos/notas-postoperatoria/notas-postoperatoria';
import { NotasPostanestesica } from './documentos-clinicos/notas-postanestesica/notas-postanestesica';
import { NotasEgresoComponent } from './documentos-clinicos/notas-egreso/notas-egreso';
import { ConsentimientosInformados } from './documentos-clinicos/consentimientos-informados/consentimientos-informados';
import { SolicitudesEstudio } from './documentos-clinicos/solicitudes-estudio/solicitudes-estudio';
import { ReferenciasTraslado } from './documentos-clinicos/referencias-traslado/referencias-traslado';
import { PrescripcionesMedicamento } from './documentos-clinicos/prescripciones-medicamento/prescripciones-medicamento';
import { RegistrosTransfusion } from './documentos-clinicos/registros-transfusion/registros-transfusion';

// ===== Notas Especializadas =====
import { NotasPsicologia } from './notas-especializadas/notas-psicologia/notas-psicologia';
import { NotasNutricion } from './notas-especializadas/notas-nutricion/notas-nutricion';
import { AuthGuard } from './guards/auth-guard';
import { ConfiguracionComponent } from './admin/configuracion/configuracion';
import { PerfilMedico } from './personas/perfil-medico/perfil-medico';
import { AreaDescansoComponent} from './personal/area-descanso/area-descanso.component';

export const routes: Routes = [
  // === Rutas públicas (autenticación) ===
  { path: 'login', component: Login },
  { path: 'recuperar-password', component: RecuperarPassword },
  { path: 'cambiar-password', component: CambiarPassword },
  // { path: 'registro', component: Registro },
{ path: 'auth/reset-password', component: CambiarPassword },
  // === Redirección principal ===
  { path: '', redirectTo: '/app/dashboard', pathMatch: 'full' },

  // === Rutas protegidas con Dashboard Layout ===
  {
    path: 'app',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // === Dashboard principal ===
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      {
        path: 'bienestar',
        component: AreaDescansoComponent,
        data: {
          title: 'Área de Bienestar',
          description: 'Espacio de relajación para el personal médico'
        }
      },

      // ===== 🧠 FLUJO WIZARD NUEVO PACIENTE =====
      {
        path: 'nuevo-paciente',
        component: WizardLayout,
        children: [
          // Redirección por defecto al inicio
          { path: '', redirectTo: 'inicio', pathMatch: 'full' },

          // 🎯 Paso 0: Página de bienvenida/inicio
          {
            path: 'inicio',
            component: NuevoPaciente,
            data: {
              step: 0,
              title: 'Nuevo Paciente',
              description: 'Iniciar registro de nuevo paciente',
            },
          },

          //    Paso 1: Datos de la persona
          {
            path: 'persona',
            component: PasoPersona,
            // canActivate: [WizardStepGuard],
            data: {
              step: 1,
              title: 'Datos Personales',
              description: 'Información básica de la persona',
              requiredFields: [
                'nombre',
                'apellido_paterno',
                'fecha_nacimiento',
                'sexo',
              ],
            },
          },

          // 👤 Paso 2: Datos específicos del paciente
          {
            path: 'paciente',
            component: PasoPaciente,
            // canActivate: [WizardStepGuard, WizardFormValidGuard],
            data: {
              step: 2,
              title: 'Datos del Paciente',
              description: 'Información médica y de contacto',
              requiredFields: ['familiar_responsable', 'telefono_familiar'],
            },
          },

          // Paso 3: Creación automática del expediente
          {
            path: 'expediente',
            component: PasoExpediente,
            // canActivate: [WizardStepGuard],
            data: {
              step: 3,
              title: 'Expediente Clínico',
              description: 'Generación automática del expediente',
              autoProcess: true,
            },
          },
        ],
      },

      // ===== Catálogos =====
      {
        path: 'catalogos',
        children: [
          { path: '', redirectTo: 'servicios', pathMatch: 'full' },
          { path: 'servicios', component: Servicios },
          {
            path: 'areas-interconsulta',
            component: AreasInterconsultaComponent,
          },
          { path: 'guias-clinicas', component: GuiasClinicasComponent },
          { path: 'estudios-medicos', component: EstudiosMedicosComponent },
          { path: 'medicamentos', component: MedicamentosComponent },
          { path: 'tipos-sangre', component: TiposSangre },
          { path: 'tipos-documento', component: TiposDocumento },
        ],
      },

      // ===== Personas =====
      {
        path: 'personas',
        children: [
          { path: '', component: PersonasComponent },
          { path: 'administradores', component: Administradores },
          { path: 'pacientes', component: Pacientes },
          { path: 'pacientes-list', component: Pacientes },
          { path: 'personal-medico', component: PersonalMedicoComponent },

          //   RUTA CORREGIDA: Perfil de Paciente
          {
            path: 'perfil-paciente/:id',
            component: PerfilPaciente,
            title: 'Perfil de Paciente',
          },
          {
      path: 'perfil-medico/:id',
      component: PerfilMedico,
      title: 'Perfil Médico'
    },

          // Alias para acceso desde lista de pacientes
          {
            path: 'pacientes/:id/perfil',
            redirectTo: 'perfil-paciente/:id',
          },
        ],
      },
      {
        path: 'admin',
        children: [
          {
            path: 'configuracion',
            component: ConfiguracionComponent,
            canActivate: [AuthGuard],
          },
        ],
      },

      // ===== Gestión de Expedientes =====
      {
        path: 'gestion-expedientes',
        children: [
          { path: '', redirectTo: 'expedientes', pathMatch: 'full' },
          { path: 'expedientes', component: Expedientes },
          { path: 'camas', component: CamasComponent },
          { path: 'internamientos', component: InternamientosComponent },
          {
            path: 'internamientos/:id',
            loadComponent: () =>
              import(
                './gestion-expedientes/internamientos/internamientos'
              ).then((m) => m.InternamientosComponent),
          },
          { path: 'signos-vitales', component: SignosVitalesComponent },

          {
            path: 'expedientes/:expedienteId/paciente/:id',
            component: PerfilPaciente,
            title: 'Perfil de Paciente desde Expediente',
          },
        ],
      },

      // ===== Documentos Clínicos =====
      {
        path: 'documentos-clinicos',
        children: [
          { path: '', redirectTo: 'documentos', pathMatch: 'full' },
          { path: 'documentos', component: Documentos },
          { path: 'historias-clinicas', component: HistoriasClinicasComponent },
          { path: 'notas-urgencias', component: NotasUrgenciasComponent },
          { path: 'notas-evolucion', component: NotasEvolucionComponent },
          { path: 'notas-interconsulta', component: NotasInterconsulta },
          { path: 'notas-preoperatoria', component: NotasPreoperatoriaComponent },
          { path: 'notas-preanestesica', component: NotasPreanestesicaComponent },
          { path: 'notas-postoperatoria', component: NotasPostoperatoria },
          { path: 'notas-postanestesica', component: NotasPostanestesica },
          { path: 'notas-egreso', component: NotasEgresoComponent },
          {
            path: 'consentimientos-informados',
            component: ConsentimientosInformados,
          },
          { path: 'solicitudes-estudio', component: SolicitudesEstudio },
          { path: 'referencias-traslado', component: ReferenciasTraslado },
          {
            path: 'prescripciones-medicamento',
            component: PrescripcionesMedicamento,
          },
          { path: 'registros-transfusion', component: RegistrosTransfusion },
        ],
      },

      // ===== Notas Especializadas =====
      {
        path: 'notas-especializadas',
        children: [
          { path: '', redirectTo: 'notas-psicologia', pathMatch: 'full' },
          { path: 'notas-psicologia', component: NotasPsicologia },
          { path: 'notas-nutricion', component: NotasNutricion },
        ],
      },
    ],
  },



  // === Redirección por defecto ===
  { path: '**', redirectTo: '/app/dashboard' },
];
