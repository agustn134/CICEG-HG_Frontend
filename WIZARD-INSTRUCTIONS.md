# ?? WIZARD FORM - SISTEMA DE EXPEDIENTES CLÍNICOS
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

### ?? FLUJO DE NAVEGACIÓN:
1. /app/dashboard ? Botón "Nuevo Paciente"
2. /app/nuevo-paciente/inicio ? Página de bienvenida
3. /app/nuevo-paciente/persona ? Datos personales
4. /app/nuevo-paciente/paciente ? Datos médicos
5. /app/nuevo-paciente/expediente ? Creación automática
6. /app/nuevo-paciente/documento-clinico ? Seleccionar tipo
7. /app/nuevo-paciente/llenar-documento/:tipo ? Formulario específico
8. /app/nuevo-paciente/resumen ? Confirmación final

### ?? PRÓXIMOS PASOS:
1. Actualizar app.routes.ts
2. Implementar WizardStateService
3. Crear formularios reactivos
4. Conectar con backend
5. Agregar validaciones
6. Implementar navegación
7. Estilizar con Tailwind CSS
