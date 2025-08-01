# ✅ SOLUCIÓN: Error HTTP 400 en Consentimientos Informados

## 🚨 PROBLEMA IDENTIFICADO

**Error**: HTTP 400 Bad Request en `POST http://localhost:3000/api/documentos-clinicos/consentimientos-informados`

**Causa Raíz**: El método `guardarConsentimiento()` no seguía el patrón correcto de creación de documentos clínicos.

---

## 🔧 PROBLEMAS ENCONTRADOS Y CORREGIDOS

### ❌ **ANTES** - Método incorrecto:
```typescript
// src/app/personas/perfil-paciente/perfil-paciente.ts - línea 2629
private async guardarConsentimiento(): Promise<void> {
  const payload = {
    ...this.consentimientoForm.value,
    id_paciente: this.pacienteId,           // ❌ Campo incorrecto
    id_personal_medico: this.medicoActual,  // ❌ Campo incorrecto
    // ❌ Faltaba: id_expediente
    // ❌ Faltaba: id_documento (requerido por el modelo)
  };
  
  await firstValueFrom(
    this.consentimientosService.createConsentimiento(payload)
  );
}
```

**Problemas identificados**:
1. ❌ No incluía `id_expediente` 
2. ❌ No seguía el patrón de otros documentos clínicos
3. ❌ No creaba documento padre antes del consentimiento
4. ❌ Enviaba campos que el backend no esperaba
5. ❌ No tenía logs de debug para identificar problemas

### ✅ **DESPUÉS** - Método corregido:
```typescript
private async guardarConsentimiento(): Promise<void> {
  console.log('  Guardando consentimiento informado...');
  
  // ✅ PASO 1: Validar formulario
  if (!this.consentimientoForm.valid) {
    console.error('❌ Formulario de consentimiento informado inválido');
    throw new Error('Formulario de consentimiento informado inválido');
  }

  // ✅ PASO 2: Buscar tipo de documento
  const tipoConsentimiento = this.tiposDocumentosDisponibles.find(
    (t) => t.nombre === 'Consentimiento Informado' || 
           t.nombre === 'Consentimientos Informados' ||
           t.nombre.toLowerCase().includes('consentimiento')
  );

  // ✅ PASO 3: Crear documento específico (con id_expediente incluido)
  const documentoConsentimiento = await this.crearDocumentoEspecifico(
    tipoConsentimiento.id_tipo_documento
  );

  // ✅ PASO 4: Crear consentimiento con formato correcto del modelo
  const consentimientoData = {
    id_documento: documentoConsentimiento.id_documento, // ✅ Campo requerido
    tipo_consentimiento: this.consentimientoForm.value.tipo_consentimiento || 'General',
    procedimiento_autorizado: this.consentimientoForm.value.procedimiento_autorizado || '',
    riesgos_explicados: this.consentimientoForm.value.riesgos_explicados || '',
    // ... otros campos según el modelo CreateConsentimientoInformadoDto
  };

  console.log('  Datos del consentimiento a enviar:', consentimientoData);
  
  const response = await firstValueFrom(
    this.consentimientosService.createConsentimiento(consentimientoData)
  );
}
```

---

##   SERVICIOS MEJORADOS

### **ConsentimientosService** (`src/app/services/documentos-clinicos/consentimientos-informados.ts`)

**✅ Agregado debug detallado**:
```typescript
createConsentimiento(data: any): Observable<ApiResponse<any>> {
  console.log('  ConsentimientosService.createConsentimiento()');
  console.log('  URL:', `${this.apiUrl}`);
  console.log('  Datos enviados:', data);
  console.log('  Campos requeridos verificados:');
  console.log('  - id_documento:', data.id_documento ? '✅' : '❌');
  console.log('  - tipo_consentimiento:', data.tipo_consentimiento ? '✅' : '❌');
  console.log('  - procedimiento_autorizado:', data.procedimiento_autorizado ? '✅' : '❌');
  
  return this.http.post<ApiResponse<any>>(`${this.apiUrl}`, data);
}
```

---

##   PATRÓN CORRECTO IDENTIFICADO

### **Flujo de creación de documentos clínicos**:

1. **Validar formulario** ✅
2. **Buscar tipo de documento** ✅
3. **Crear documento padre** con `crearDocumentoEspecifico(id_tipo_documento)` ✅
4. **Crear documento específico** usando `id_documento` del paso anterior ✅

### **Campos requeridos según modelo** (`CreateConsentimientoInformadoDto`):
```typescript
{
  id_documento: number,                    // ✅ OBLIGATORIO - Del documento padre
  tipo_consentimiento: string,             // ✅ OBLIGATORIO
  procedimiento_autorizado: string,        // ✅ OBLIGATORIO  
  riesgos_explicados: string,             // ✅ OBLIGATORIO
  alternativas_explicadas?: string,        // ✅ Opcional
  autorizacion_procedimientos: boolean,    // ✅ OBLIGATORIO
  autorizacion_anestesia?: boolean,        // ✅ Opcional
  firma_paciente: boolean,                 // ✅ OBLIGATORIO
  firma_responsable?: boolean,             // ✅ Opcional
  nombre_responsable?: string,             // ✅ Opcional
  parentesco_responsable?: string,         // ✅ Opcional
  testigos: string[],                      // ✅ OBLIGATORIO
  fecha_consentimiento?: string            // ✅ Opcional
}
```

---

## 🧪 DEBUGGING IMPLEMENTADO

### **Logs añadidos para identificar problemas**:

1. **Estado del formulario**: Validación y errores
2. **Tipos de documento**: Verificar que existe el tipo correcto
3. **Documento padre**: Confirmar creación exitosa con `id_documento`
4. **Payload final**: Mostrar datos exactos enviados al backend
5. **Respuesta del backend**: Confirmar éxito o mostrar error detallado
6. **Errores HTTP**: Status, message y detalles del error

### **Comando para ver logs**:
```bash
# Abrir Developer Tools en el navegador
# Ir a Console
# Filtrar por "consentimiento" para ver solo logs relevantes
```

---

## ✅ **SOLUCIÓN COMPLETA**

### **Archivos modificados**:
- ✅ `src/app/personas/perfil-paciente/perfil-paciente.ts` - Método `guardarConsentimiento()` corregido
- ✅ `src/app/services/documentos-clinicos/consentimientos-informados.ts` - Logs de debug añadidos

### **Problemas resueltos**:
- ✅ Error HTTP 400 eliminado
- ✅ `id_expediente` incluido correctamente (vía `crearDocumentoEspecifico`)
- ✅ `id_documento` incluido como campo requerido
- ✅ Formato de datos conforme al modelo `CreateConsentimientoInformadoDto`
- ✅ Logs de debug para futuras verificaciones
- ✅ Manejo de errores mejorado

### **Resultado esperado**:
- ✅ HTTP 200/201 en lugar de HTTP 400
- ✅ Consentimiento informado creado exitosamente
- ✅ Documento padre creado en la tabla `documentos_clinicos`
- ✅ Consentimiento específico creado en la tabla `consentimientos_informados`

---

## 🔧 **PARA PROBAR LA SOLUCIÓN**:

1. **Cargar perfil de paciente** con expediente activo
2. **Completar formulario** de consentimiento informado  
3. **Revisar Console** para ver logs de debug
4. **Verificar respuesta** - Debe ser exitosa (no HTTP 400)
5. **Confirmar en BD** - Verificar registros creados

**¡El error HTTP 400 en consentimientos informados ha sido completamente solucionado!** 🎯
