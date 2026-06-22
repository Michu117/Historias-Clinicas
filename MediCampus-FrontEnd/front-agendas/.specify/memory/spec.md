# [MÓDULO AGENDAS] Especificación Funcional Completa

**Fecha:** 25 de Mayo 2026  
**Versión:** 1.0  
**Rol:** Analista Funcional  

---

## 1. ENTIDADES PRINCIPALES DEL MÓDULO

Basado en la estructura de modelos Django existentes en `HistoriasClinicas/Agendas/`:

### 1.1 **CITA** (Appointment)
**Propósito:** Reserva de un espacio de tiempo entre un paciente y un profesional para consulta.

**Atributos:**
- `id`: PK del sistema
- `usuario_id`: FK al paciente que agenda (referencia a tabla Usuario)
- `fecha_hora`: DateTime de la consulta (precisión: hora + minuto)
- `estado`: Enum de EstadoCita
- `motivo`: Descripción breve de la razón de la cita
- `servicios`: M2M a Servicio (puede tener múltiples servicios en una cita)
- `fecha_creacion`: Timestamp auto-generado
- `fecha_actualizacion`: Timestamp auto-actualizado

**Restricciones Actuales en BD:**
- `unique_together = [['usuario_id', 'fecha_hora']]` → Un usuario no puede tener DOS citas exactamente a la misma hora

---

### 1.2 **SERVICIO** (Medical Service/Specialty)
**Propósito:** Categorización de especialidades/departamentos médicos (Odontología, Psicología, etc.).

**Atributos:**
- `id`: PK
- `nombre`: Nombre del servicio (ej. "Odontología", "Psicología")
- `descripcion`: Información general del servicio
- `es_activo`: Booleano que indica si está habilitado para nuevas citas
- `fecha_creacion`: Timestamp de registro

**Relaciones:**
- 1-a-N con Cita (muchas citas pueden estar asociadas a un servicio)
- 1-a-N con Consulta (cada tipo de consulta se relaciona a servicios)

---

### 1.3 **CONSULTA** (Medical Consultation - Polimórfica)
**Propósito:** Registro detallado de lo que sucede durante la consulta. Estructura polimórfica según tipo de servicio.

**Clase Base (Abstracta):**
- `id`: PK
- `cita`: FK a Cita (referencia bidireccional)
- `historia_clinica_id`: Referencia al expediente médico del paciente
- `observaciones`: Campo de texto libre para notas generales
- `servicios`: M2M a Servicio
- `fecha_creacion`: Timestamp auto-generado

**Subclases Especializadas:**

#### **ConsultaMedica** (General Medicine)
- Hereda todos los campos base
- `anamnesis`: Relato de antecedentes médicos
- `tratamiento`: Plan terapéutico
- `diagnostico`: Diagnóstico médico
- `signos_vitales`: FK a SignosVitales (1-a-1)

#### **ConsultaOdontologica** (Dental)
- `odontograma`: Representación gráfica/textual del estado dental
- `procedimientos`: Descripción de procedimientos realizados

#### **ConsultaPsicologica** (Psychology)
- `notas_evolucion`: Evolución del paciente durante sesión
- `estado_humor`: Registro cualitativo del humor
- `nivel_ansiedad`: Escala numérica (0-100)
- `nivel_autoestima`: Escala numérica (0-100)
- `diagnostico`: Diagnóstico psicológico

#### **ConsultaSocial** (Social Work)
- `nivel_socioeconomico`: Clasificación socio-económica
- `descripcion_vivienda`: Contexto de vivienda del paciente

---

### 1.4 **SIGNOS_VITALES** (Vital Signs)
**Propósito:** Registro biométrico del paciente durante consulta médica.

**Atributos:**
- `id`: PK
- `peso_kg`: Peso en kilogramos (Decimal)
- `temperatura`: Temperatura en °C (Decimal)
- `presion_arterial`: Formato texto "Sistólica/Diastólica"
- `frecuencia_cardiaca`: Pulso en BPM (Integer)

**Relaciones:**
- 1-a-1 con ConsultaMedica

---

### 1.5 **DERIVACIÓN** (Referral)
**Propósito:** Referencia de un paciente a otro servicio/profesional para continuidad de cuidado.

**Atributos:**
- `id`: PK
- `usuario_id`: FK al paciente derivado
- `remitente_id`: FK al profesional que refiere
- `destinatario`: Nombre/servicio destino (CharField, no FK)
- `tipo`: Enum TipoDerivacion (INTERNA | EXTERNA)
- `motivo`: Texto libre con razón de la derivación
- `estado`: Enum EstadoDerivacion (PENDIENTE | ACEPTADA | RECHAZADA)
- `fecha_creacion`: Timestamp

**Relaciones:**
- N-a-1 con usuario (como paciente)
- N-a-1 con profesional (remitente)

---

### 1.6 **CERTIFICADO** (Attendance Certificate)
**Propósito:** Comprobante descargable en PDF de asistencia a consulta.

**Atributos:**
- `id`: PK
- `cita`: FK a Cita (1-a-N: una cita puede generar múltiples certificados)
- `tipo`: Tipo de certificado (ej. "Asistencia", "Consulta Completada")
- `archivo`: FileField con ruta de PDF almacenado
- `fecha_emision`: Timestamp de generación

---

## 2. MÁQUINA DE ESTADOS - CICLO DE VIDA DE CITA

### Estados Definidos (EstadoCita):
```
AGENDADA 
    ↓
CONFIRMADA  (opcional, validación)
    ↓
ATENDIDA  (profesional completa consulta)
    ↓
[FINALIZADA]*  (sistema, fin de ciclo)

Alternativas:
    ↓
CANCELADA  (en cualquier momento antes de ATENDIDA)
    ↓
NO_ASISTIDA  (paciente no llegó)
```

*Nota: El modelo actual NO tiene estado FINALIZADA explícito. Se asume que ATENDIDA es el estado terminal.

### Transiciones Válidas por Historia de Usuario:

| Estado Actual | Trigger | Estado Nuevo | Quién | Observación |
|---------------|---------|--------------|------|------------|
| - | Paciente agenda | **AGENDADA** | Frontend (paciente) | HU-01 |
| AGENDADA | Validación backend | CONFIRMADA | Sistema | Opcional |
| AGENDADA | Profesional inicia | ATENDIDA | Frontend (profesional) | HU-03 |
| AGENDADA | Paciente cancela | CANCELADA | Sistema | Antes de hora |
| AGENDADA | Hora pasó sin atender | NO_ASISTIDA | Sistema | Cierre automático |
| ATENDIDA | Profesional finaliza + guarda consulta | ATENDIDA ✓ | Frontend (profesional) | HU-03 |
| ATENDIDA | Profesional genera certificado | (mismo estado) | Frontend (profesional) | HU-04 |
| ATENDIDA | Profesional deriva | (mismo estado + Derivación creada) | Frontend (profesional) | HU-05 |

---

## 3. REGLAS DE NEGOCIO TRANSVERSALES (TDD Scope)

### **RN-001: Validación Temporal - Sin Fechas Pasadas**
**Enunciado:** No se puede agendar una cita con fecha/hora anterior a ahora.

**Criterios de Aceptación:**
- ✓ Si `fecha_hora < NOW()`, el sistema rechaza con error específico
- ✓ El frontend no debe permitir seleccionar fechas/horas pasadas en el picker
- ✓ El backend valida esta regla como defensa (zero-trust)

**Contexto:** HU-01  
**Entidad:** Cita  
**Responsable Validación:** Backend + Frontend (UX)

---

### **RN-002: Exclusividad de Horario por Profesional**
**Enunciado:** Un profesional NO puede tener dos citas activas (AGENDADA, CONFIRMADA, ATENDIDA) en el mismo bloque de tiempo.

**Criterios de Aceptación:**
- ✓ Al agendar, verificar que `profesional_id` no tenga otra cita en `[fecha_hora - 30min, fecha_hora + 30min]`
- ✓ El sistema debe mostrar SOLO horarios disponibles (no ocupados)
- ✓ Duración estándar de cita: 30 minutos (parametrizable)

**Contexto:** HU-01, HU-02  
**Entidad:** Cita  
**Nota:** El modelo actual usa `unique_together` pero solo por usuario+hora exacta. Necesita lógica adicional.  
**Responsable Validación:** Backend

---

### **RN-003: Una Cita por Especialidad por Día (Paciente)**
**Enunciado:** Un paciente NO puede tener dos citas ACTIVAS (AGENDADA, CONFIRMADA, ATENDIDA) para la misma especialidad (servicio) el mismo día calendario.

**Criterios de Aceptación:**
- ✓ Validar al agendar: `servicios.filter(es_activo=true) & fecha_cita.day == hoy`
- ✓ Si existe, mostrar error: "Ya tienes una cita para esta especialidad hoy"
- ✓ Solo cuenta citas en estados: AGENDADA, CONFIRMADA, ATENDIDA

**Contexto:** HU-01  
**Entidad:** Cita  
**Responsable Validación:** Backend

---

### **RN-004: Horarios Disponibles Solo Activos**
**Enunciado:** El sistema solo debe mostrar horarios de servicios/profesionales que están ACTIVOS (`es_activo = true`).

**Criterios de Aceptación:**
- ✓ Filtro en dropdown de servicios: solo mostrar `Servicio.es_activo = true`
- ✓ Filtro de profesionales: solo mostrar profesionales con servicios activos asignados
- ✓ Backend rechaza citas para servicios inactivos

**Contexto:** HU-01  
**Entidad:** Servicio, Cita  
**Responsable Validación:** Backend + Frontend

---

### **RN-005: Visibilidad Segregada de Agenda**
**Enunciado:** Un profesional SOLO puede visualizar sus propias citas, no la de otros profesionales. Un paciente SOLO puede visualizar/gestionar sus propias citas.

**Criterios de Aceptación:**
- ✓ Validar JWT: extraer `usuario_id` y `rol` (paciente vs profesional)
- ✓ Filtrar queryset: `Cita.filter(usuario_id=jwt_id)` para pacientes
- ✓ Filtrar queryset: `Cita.filter(profesional_id=jwt_id)` para profesionales
- ✓ Si intenta acceder a cita de otro usuario, retornar 403 Forbidden

**Contexto:** HU-01, HU-02, HU-03  
**Entidad:** Cita  
**Responsable Validación:** Backend (autenticación/autorización)

---

### **RN-006: Filtrado de Agenda por Fecha**
**Enunciado:** El profesional debe poder filtrar su agenda por rango de fechas.

**Criterios de Aceptación:**
- ✓ Parámetros en query: `?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD`
- ✓ Validar: `fecha_inicio <= fecha_fin`
- ✓ Filtrar: `Cita.filter(fecha_hora__gte=inicio, fecha_hora__lte=fin)`
- ✓ Si no se especifican, default: hoy + próximos 7 días

**Contexto:** HU-02  
**Entidad:** Cita  
**Responsable Validación:** Backend

---

### **RN-007: Registro de Consulta Obligatorio**
**Enunciado:** Al cambiar estado de cita a ATENDIDA, DEBE existir al menos una Consulta asociada (del tipo correspondiente al servicio).

**Criterios de Aceptación:**
- ✓ Si se intenta guardar ATENDIDA sin Consulta, rechazar con error
- ✓ La Consulta debe tener `observaciones` no vacías (mínimo 10 caracteres)
- ✓ Validar que `Consulta.cita_id = Cita.id`

**Contexto:** HU-03  
**Entidad:** Cita, Consulta  
**Responsable Validación:** Backend

---

### **RN-008: Consulta Inmutable Post-Guardado**
**Enunciado:** Una vez que se guarda y finaliza una Consulta, NO debe poder ser editada (no aplica update).

**Criterios de Aceptación:**
- ✓ Frontend: Deshabilitar campos después de guardar, mostrar solo lectura
- ✓ Backend: Rechazar PATCH/PUT a Consulta ya guardada (retornar 400/403)
- ✓ Audit trail: Registrar quién, cuándo guardó (timestamp en BD)

**Contexto:** HU-03  
**Entidad:** Consulta  
**Responsable Validación:** Backend (lógica) + Frontend (UX)

---

### **RN-009: Certificado Solo Post-Atención**
**Enunciado:** Un certificado de asistencia SOLO puede generarse si la cita está en estado ATENDIDA.

**Criterios de Aceptación:**
- ✓ Botón "Descargar Certificado" solo visible si `Cita.estado == ATENDIDA`
- ✓ Endpoint rechaza si `Cita.estado ∉ {ATENDIDA, FINALIZADA}`
- ✓ Solo el profesional que atendió puede generar (validar JWT)
- ✓ PDF debe incluir: Nombre paciente, Nombre profesional, Fecha cita, Servicio

**Contexto:** HU-04  
**Entidad:** Certificado, Cita  
**Responsable Validación:** Backend

---

### **RN-010: Derivación a Servicio Diferente**
**Enunciado:** Una derivación INTERNA solo es válida si el servicio destino es diferente al servicio actual.

**Criterios de Aceptación:**
- ✓ Validar: `servicio_destino_id ≠ servicio_origen_id`
- ✓ Servicio destino debe estar `es_activo = true`
- ✓ Si la derivación es válida, crear registro `Derivacion` con estado PENDIENTE
- ✓ Notificar al profesional destino (bandeja de derivaciones pendientes)

**Contexto:** HU-05  
**Entidad:** Derivacion, Cita  
**Responsable Validación:** Backend

---

### **RN-011: Bandeja de Derivaciones Pendientes**
**Enunciado:** Cuando se crea una derivación INTERNA en estado PENDIENTE, debe aparecer en la bandeja del servicio/profesional destino como alerta.

**Criterios de Aceptación:**
- ✓ Endpoint `GET /api/derivaciones/pendientes/` filtra por `remitente_id` actual y estado=PENDIENTE
- ✓ Mostrar en interfaz: Nombre paciente, Motivo, Servicio origen, Fecha derivación
- ✓ Profesional destino puede ACEPTAR o RECHAZAR:
  - **Aceptar:** Estado → ACEPTADA, cita generada en su agenda
  - **Rechazar:** Estado → RECHAZADA, notificación al remitente

**Contexto:** HU-05  
**Entidad:** Derivacion, Cita  
**Responsable Validación:** Backend

---

### **RN-012: Trazabilidad de Derivaciones**
**Enunciado:** Todo registro de derivación debe mantener auditoría completa: quién derivó, cuándo, por qué, a quién.

**Criterios de Aceptación:**
- ✓ Derivacion.remitente_id siempre grabado
- ✓ Derivacion.usuario_id siempre grabado
- ✓ Derivacion.motivo obligatorio (no vacío)
- ✓ Derivacion.fecha_creacion auto-grabado
- ✓ Cambios de estado registrados con timestamp (usar signals o middleware)

**Contexto:** HU-05  
**Entidad:** Derivacion  
**Responsable Validación:** Backend

---

## 4. MATRIZ DE COBERTURA - Reglas vs Historias

| Regla | HU-01 | HU-02 | HU-03 | HU-04 | HU-05 |
|-------|:-----:|:-----:|:-----:|:-----:|:-----:|
| RN-001 (No fechas pasadas) | ✓ | - | - | - | - |
| RN-002 (Exclusividad horario profesional) | ✓ | ✓ | - | - | - |
| RN-003 (Una cita por especialidad/día) | ✓ | - | - | - | - |
| RN-004 (Solo servicios activos) | ✓ | - | - | - | - |
| RN-005 (Segregación de datos por usuario) | ✓ | ✓ | ✓ | ✓ | ✓ |
| RN-006 (Filtrado por fecha) | - | ✓ | - | - | - |
| RN-007 (Consulta obligatoria) | - | - | ✓ | - | - |
| RN-008 (Consulta inmutable) | - | - | ✓ | - | - |
| RN-009 (Certificado post-atención) | - | - | - | ✓ | - |
| RN-010 (Derivación servicio diferente) | - | - | - | - | ✓ |
| RN-011 (Bandeja derivaciones pendientes) | - | - | - | - | ✓ |
| RN-012 (Trazabilidad derivaciones) | - | - | - | - | ✓ |

---

## 5. FLUJOS DE USUARIO DETALLADOS

### **HU-01: Agendar una Cita**

**Actor:** Paciente autenticado  
**Precondiciones:**
- JWT válido en localStorage
- Al menos 1 Servicio activo existe
- Al menos 1 profesional activo asignado a un servicio

**Flujo Principal:**

1. Paciente accede a módulo de agendas (ruta `/agendas`)
2. Sistema carga dropdown de Servicios activos (`Servicio.filter(es_activo=true)`)
3. Paciente selecciona servicio (ej. Odontología)
4. Sistema carga dropdown de Profesionales activos para ese servicio
5. Paciente selecciona profesional
6. **Sistema consulta disponibilidad:**
   - Excluye citas AGENDADA, CONFIRMADA, ATENDIDA del profesional
   - Respeta duración estándar (30 min)
   - Respeta horario laboral del profesional (ej. 08:00-17:00)
   - Respeta bloqueos del calendario (si existen)
7. Sistema muestra bloques de tiempo disponibles en calendario
8. Paciente selecciona fecha y hora **validación: fecha_hora > NOW()**
9. **Sistema valida:**
   - ✓ RN-001: No es pasada
   - ✓ RN-002: No hay conflicto de horario
   - ✓ RN-003: Paciente no tiene otra cita para este servicio hoy
   - ✓ RN-004: Servicio sigue activo
10. Paciente ingresa "Motivo" de cita (campo optativo)
11. Paciente presiona "Guardar"
12. Backend crea `Cita(usuario_id=jwt.id, fecha_hora=..., estado=AGENDADA, ...)`
13. Frontend muestra confirmación: "Cita agendada para [fecha] con [profesional]"
14. Opcional: Notificación al correo del paciente (backend async)

**Flujos Alternativos:**
- **A1:** Paciente cierra navegador sin guardar → Formulario se descarta
- **A2:** Servicio seleccionado se desactiva mientras paciente lo selecciona → Error con opción de recarga
- **A3:** Todas las citas del profesional están ocupadas ese día → Mensaje: "No hay disponibilidad, intenta otro día"

---

### **HU-02: Visualización de Citas (Agenda Profesional)**

**Actor:** Profesional autenticado  
**Precondiciones:**
- JWT válido, rol = profesional
- Profesional tiene citas asignadas

**Flujo Principal:**

1. Profesional accede a `/agendas/mi-agenda`
2. **Sistema carga citas por defecto:**
   - Filtro: `Cita.filter(profesional_id=jwt.id) & estado∈{AGENDADA,CONFIRMADA,ATENDIDA}`
   - Rango: Hoy + próximos 7 días
   - Orden: ASC por fecha_hora
3. Sistema renderiza tabla/calendario con columnas:
   - Hora
   - Nombre del Paciente
   - Estado (badge: AGENDADA/CONFIRMADA/ATENDIDA)
   - Servicio
   - Botones de acción (Atender, Ver detalles)
4. Profesional puede seleccionar rango de fechas con date picker:
   - Parámetro query: `?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`
5. Sistema re-filtra agenda (validar que desde ≤ hasta)
6. Profesional hace click en cita → Modal de detalles con:
   - Nombre completo del paciente
   - Cédula del paciente
   - Motivo de la cita
   - Historial de citas previas del paciente (read-only)
   - Botones: Iniciar Consulta, Cancelar Cita

**Flujos Alternativos:**
- **A1:** Sin citas en rango → Mostrar mensaje "No hay citas programadas"
- **A2:** Profesional intenta acceder a cita de otro profesional → Error 403

---

### **HU-03: Registro de Datos en Consulta Digital**

**Actor:** Profesional durante atención  
**Precondiciones:**
- Cita en estado AGENDADA o CONFIRMADA
- Horario de consulta llegó o está cercano

**Flujo Principal:**

1. Profesional hace click en botón "Iniciar Consulta" de cita
2. Sistema abre formulario de consulta según el servicio:
   - Si servicio = "Medicina General" → Cargar **ConsultaMedica** form:
     - Anamnesis (textarea)
     - Diagnóstico (textarea)
     - Tratamiento (textarea)
     - Signos Vitales: Peso, Temperatura, Presión, Frecuencia Cardíaca
   - Si servicio = "Odontología" → Cargar **ConsultaOdontologica** form:
     - Odontograma (textarea/dibujo)
     - Procedimientos (textarea)
   - Si servicio = "Psicología" → Cargar **ConsultaPsicologica** form:
     - Notas de Evolución (textarea)
     - Estado de Humor (select: Feliz, Triste, Ansioso, etc.)
     - Nivel Ansiedad (slider 0-100)
     - Nivel Autoestima (slider 0-100)
     - Diagnóstico (textarea)
   - Idem para **ConsultaSocial**
3. Campo universal: **Observaciones** (textarea, obligatorio, min 10 caracteres)
4. Profesional completa formulario durante/después consulta
5. Profesional presiona "Guardar Consulta"
6. **Backend valida:**
   - ✓ RN-007: Observaciones ≠ vacío y length ≥ 10
   - ✓ Campos requeridos según tipo de consulta
   - ✓ RN-005: Usuario actual == profesional asignado a cita
7. Sistema guarda Consulta (subclase específica)
8. Sistema actualiza Cita.estado = ATENDIDA
9. Frontend muestra confirmación: "Consulta guardada exitosamente"
10. Formulario se bloquea (read-only) - **RN-008: Inmutabilidad**
11. Nuevos botones disponibles: "Generar Certificado", "Derivar Paciente"

**Flujos Alternativos:**
- **A1:** Observaciones vacías → Error: "Debes registrar al menos una observación"
- **A2:** Cierra formulario sin guardar → Warning: "Se perderán los datos"
- **A3:** Intenta editar después de guardar → Campos deshabilitados, solo lectura

---

### **HU-04: Generación de Certificado**

**Actor:** Profesional post-consulta  
**Precondiciones:**
- Cita en estado ATENDIDA
- Consulta asociada guardada

**Flujo Principal:**

1. Cita está en estado ATENDIDA (luego de HU-03)
2. Botón "Descargar Certificado" aparece en pantalla de cita
3. Profesional presiona botón
4. **Backend valida:**
   - ✓ RN-009: Cita.estado == ATENDIDA
   - ✓ RN-005: JWT.profesional_id == Cita.profesional_id
   - ✓ Existe Consulta asociada
5. Backend obtiene datos:
   - Paciente: Nombre, Cédula, Contacto
   - Profesional: Nombre, Cédula, Especialidad
   - Cita: Fecha, Hora, Servicio
   - Consulta: Observaciones clínicas resumidas
6. Backend genera PDF con template:
   - Logo y membrete de la clínica
   - Título: "CERTIFICADO DE ASISTENCIA A CONSULTA MÉDICA"
   - Datos paciente (nombre, cédula)
   - Datos profesional (nombre, cédula, especialidad)
   - Fecha y hora de consulta
   - Motivo de consulta (si existe)
   - Resumen de observaciones clínicas (primeras 200 caracteres)
   - Fecha de emisión
   - Firma digital/QR (opcional)
7. Sistema crea registro `Certificado(cita_id=..., tipo='Asistencia', archivo=...)`
8. Archivo PDF se descarga al navegador
9. **RN-012:** Sistema registra timestamp de descarga para auditoría

**Flujos Alternativos:**
- **A1:** Cita aún está AGENDADA → Botón deshabilitado, tooltip: "Guardar consulta primero"
- **A2:** Error generando PDF → Mostrar error: "No se pudo generar certificado, intenta luego"

---

### **HU-05: Derivación a Otro Servicio**

**Actor:** Profesional post-consulta  
**Precondiciones:**
- Cita en estado ATENDIDA
- Consulta guardada
- Existe Servicio destino diferente al actual

**Flujo Principal:**

1. Profesional finaliza consulta (HU-03) → Cita ATENDIDA
2. Botón "Derivar Paciente" aparece junto a "Generar Certificado"
3. Profesional presiona "Derivar Paciente"
4. Modal se abre con:
   - Dropdown de Servicios destino (excluye servicio actual, solo activos)
   - Textarea: "Motivo de Derivación" (obligatorio, min 10 caracteres)
   - Botones: Derivar, Cancelar
5. Profesional selecciona servicio destino (ej. Psicología)
6. Profesional ingresa motivo (ej. "Posible depresión, requiere evaluación psicológica")
7. Profesional presiona "Derivar"
8. **Backend valida:**
   - ✓ RN-010: Servicio destino ≠ servicio actual
   - ✓ Servicio destino.es_activo == true
   - ✓ Motivo ≠ vacío y length ≥ 10
   - ✓ RN-005: Usuario actual es profesional de la cita
9. Backend crea:
   - `Derivacion(usuario_id=paciente, remitente_id=profesional_actual, destinatario=servicio_destino, tipo=INTERNA, motivo=..., estado=PENDIENTE)`
10. **RN-012:** Auditoría grabada automáticamente (timestamp, usuario)
11. Frontend muestra: "Derivación creada exitosamente"
12. Notificación al profesional destino: "Tienes una derivación pendiente del paciente [Nombre]"
13. Cita original NO cambia de estado (sigue ATENDIDA)

**Flujos Alternativos:**
- **A1:** Motivo vacío → Error: "Debes especificar el motivo"
- **A2:** Selecciona servicio actual → Error: "Debes derivar a un servicio diferente"
- **A3:** No hay servicios destino activos → Tooltip: "No hay servicios activos para derivar"

**Flujo en Bandeja de Derivaciones (Profesional Destino):**

1. Profesional destino accede a módulo de agendas
2. Sección: "Derivaciones Pendientes" muestra lista:
   - Nombre paciente
   - Motivo derivación
   - Servicio origen
   - Fecha de derivación
   - Botones: Aceptar, Rechazar
3. Si **Aceptar:**
   - Estado → ACEPTADA
   - Se crea automáticamente una Cita en la bandeja del profesional destino (estado AGENDADA, pendiente de disponibilidad)
   - Notificación al paciente: "Tu derivación ha sido aceptada. Te contactarán para agendar"
   - Notificación al remitente: "Derivación aceptada por [Profesional destino]"
4. Si **Rechazar:**
   - Estado → RECHAZADA
   - Notificación al remitente: "Derivación rechazada. Motivo: [texto opcional]"
   - Opción de re-derivar a otro servicio

---

## 6. REQUISITOS DE INTEGRACIÓN CON BACKEND

### API Endpoints Esperados:

```
GET    /api/servicios/                    → Lista servicios activos
GET    /api/servicios/{id}/profesionales/ → Profesionales por servicio
GET    /api/disponibilidad/?profesional={id}&fecha={fecha}  → Slots disponibles
GET    /api/citas/                        → Mis citas (filtrado por JWT)
GET    /api/citas/{id}/                   → Detalles de cita
POST   /api/citas/                        → Crear cita (HU-01)
PATCH  /api/citas/{id}/                   → Actualizar cita (estado, etc.)
GET    /api/consultas/{id}/               → Obtener consulta
POST   /api/consultas/                    → Crear consulta según tipo (HU-03)
GET    /api/citas/{id}/certificado/       → Datos para generar certificado
POST   /api/certificados/                 → Generar y descargar PDF (HU-04)
GET    /api/derivaciones/                 → Mis derivaciones
POST   /api/derivaciones/                 → Crear derivación (HU-05)
PATCH  /api/derivaciones/{id}/            → Aceptar/Rechazar derivación
GET    /api/derivaciones/pendientes/      → Bandeja de derivaciones pendientes
```

### Autenticación:
- JWT en localStorage (`Authorization: Bearer <token>`)
- Extraer `usuario_id`, `rol` (paciente/profesional) del token
- Zero-trust: Backend valida permisos en CADA endpoint

### Paginación y Filtros:
- Soportar query params: `?page=1&limit=20&desde=2026-05-01&hasta=2026-05-31`
- Formato de fechas: `YYYY-MM-DD` o ISO 8601

---

## 7. CONSIDERACIONES TÉCNICAS (Frontend)

### Testing Strategy (TDD):
Cada regla de negocio (RN-001 a RN-012) debe tener:
- **Unit test** para lógica pura (validaciones)
- **Integration test** para flujos API
- **Component test** para UI behavior

### Componentes Requeridos:
1. `<ServiceSelector />` - Dropdown de servicios
2. `<ProfessionalSelector />` - Dropdown de profesionales
3. `<DateTimeAvailability />` - Calendario con slots
4. `<AgendaTable />` - Tabla de citas profesional
5. `<ConsultationForm />` - Formularios polimórficos por tipo servicio
6. `<CertificateButton />` - Generación de PDF
7. `<DerivationModal />` - Interfaz de derivación
8. `<DerivationInbox />` - Bandeja de derivaciones

### Estado Global (Context/Zustand):
- Usuario autenticado (id, rol, token)
- Cita actual en edición
- Filtros de agenda aplicados
- Derivaciones pendientes

---

## 8. CONCLUSIÓN DEL ANÁLISIS FUNCIONAL

El **Módulo de Agendas** es un ecosistema de **planificación, ejecución y seguimiento de consultas médicas** con máquina de estados clara y 12 reglas de negocio críticas:

✓ **3 Entidades Core:** Cita, Consulta (polimórfica), Derivación  
✓ **6 Estados de Cita:** AGENDADA → CONFIRMADA → ATENDIDA (→ CANCELADA/NO_ASISTIDA)  
✓ **5 Historias de Usuario** bien segregadas por rol y responsabilidad  
✓ **12 Reglas de Negocio** cobriendo: Temporalidad, disponibilidad, integridad, seguridad, auditoría  
✓ **Trazabilidad Completa** desde agendamiento hasta derivación  

**Próximos pasos:**
1. Especificación de escenarios de test (test scenarios / acceptance criteria)
2. Implementación TDD-First con Vitest + React Testing Library
3. Desarrollo iterativo HU por HU
