# ?? WIZARD FORM - SISTEMA DE EXPEDIENTES CL�NICOS
## Hospital General San Luis de la Paz

### ?? ESTRUCTURA CREADA:
- nuevo-paciente/ (componente principal)
- nuevo-paciente/paso-persona/
- nuevo-paciente/paso-paciente/
- nuevo-paciente/paso-expediente/
- nuevo-paciente/paso-documento-clinico/
- nuevo-paciente/paso-llenar-documento/
- nuevo-paciente/paso-resumen/

### ?? COMPONENTES COMPARTIDOS:
- shared/components/wizard-layout/
- shared/components/wizard-progress/
- shared/components/paso-navigation/
- shared/components/catalogo-selector/

### ?? SERVICIOS:
- services/wizard-state.service.ts
- services/catalogo.service.ts

### ?? FLUJO DE NAVEGACI�N:
1. /app/dashboard ? Bot�n "Nuevo Paciente"
2. /app/nuevo-paciente/inicio ? P�gina de bienvenida
3. /app/nuevo-paciente/persona ? Datos personales
4. /app/nuevo-paciente/paciente ? Datos m�dicos
5. /app/nuevo-paciente/expediente ? Creaci�n autom�tica
6. /app/nuevo-paciente/documento-clinico ? Seleccionar tipo
7. /app/nuevo-paciente/llenar-documento/:tipo ? Formulario espec�fico
8. /app/nuevo-paciente/resumen ? Confirmaci�n final

### ?? PR�XIMOS PASOS:
1. Actualizar app.routes.ts
2. Implementar WizardStateService
3. Crear formularios reactivos
4. Conectar con backend
5. Agregar validaciones
6. Implementar navegaci�n
7. Estilizar con Tailwind CSS
