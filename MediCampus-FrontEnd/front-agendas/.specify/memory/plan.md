# [MÓDULO AGENDAS] Plan Técnico MACRO - Arquitectura Restringida

**Fecha:** 25 de Mayo 2026  
**Versión:** 2.0 (Restricción Arquitectónica)  
**Rol:** Arquitecto Frontend  
**Restricción:** TODO código dentro de `src/ui/agendas/`

---

## PARTE 1: ESTRUCTURA DE CARPETAS - ARQUITECTURA RESTRINGIDA

```
src/ui/agendas/
├── component/                      [COMPONENTES VISUALES - Reutilizables]
│   │
│   ├── selectors/
│   │   ├── ServiceSelector.tsx
│   │   ├── ProfessionalSelector.tsx
│   │   └── DateTimeSlotSelector.tsx
│   │
│   ├── agenda/
│   │   ├── AgendaTable.tsx
│   │   ├── AgendaCard.tsx
│   │   ├── AgendaFilters.tsx
│   │   ├── CitaRow.tsx
│   │   └── EstadoBadge.tsx
│   │
│   ├── consulta/
│   │   ├── ConsultaForm.tsx
│   │   ├── ConsultaMedicaForm.tsx
│   │   ├── ConsultaOdontologicaForm.tsx
│   │   ├── ConsultaPsicologicaForm.tsx
│   │   ├── ConsultaSocialForm.tsx
│   │   └── SignosVitalesInput.tsx
│   │
│   ├── derivacion/
│   │   ├── DerivacionModal.tsx
│   │   ├── DerivacionInbox.tsx
│   │   ├── DerivacionCard.tsx
│   │   └── DerivacionActions.tsx
│   │
│   ├── shared/
│   │   ├── CitaModal.tsx
│   │   ├── EstadoBadge.tsx
│   │   ├── ErrorAlert.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── SuccessNotification.tsx
│   │   └── ConfirmDialog.tsx
│   │
│   ├── pages/
│   │   ├── AgendarCita.tsx           [HU-01 - Vista principal]
│   │   ├── MiAgenda.tsx              [HU-02 - Vista principal]
│   │   ├── Consulta.tsx              [HU-03 - Vista principal]
│   │   ├── Derivaciones.tsx          [HU-05 - Vista principal]
│   │   └── Certificados.tsx          [HU-04 - Vista principal - Iter 2]
│   │
│   └── index.ts                     [Exports centralizados]
│
├── test/                            [TESTS - Espejo de componentes]
│   │
│   ├── selectors/
│   │   ├── ServiceSelector.test.tsx
│   │   ├── ProfessionalSelector.test.tsx
│   │   └── DateTimeSlotSelector.test.tsx
│   │
│   ├── agenda/
│   │   ├── AgendaTable.test.tsx
│   │   ├── AgendaCard.test.tsx
│   │   ├── AgendaFilters.test.tsx
│   │   └── CitaRow.test.tsx
│   │
│   ├── consulta/
│   │   ├── ConsultaForm.test.tsx
│   │   ├── ConsultaMedicaForm.test.tsx
│   │   ├── ConsultaOdontologicaForm.test.tsx
│   │   └── SignosVitalesInput.test.tsx
│   │
│   ├── derivacion/
│   │   ├── DerivacionModal.test.tsx
│   │   ├── DerivacionInbox.test.tsx
│   │   └── DerivacionCard.test.tsx
│   │
│   ├── shared/
│   │   ├── CitaModal.test.tsx
│   │   └── ErrorAlert.test.tsx
│   │
│   ├── integration/
│   │   ├── HU-01.integration.test.tsx
│   │   ├── HU-02.integration.test.tsx
│   │   ├── HU-03.integration.test.tsx
│   │   ├── HU-05.integration.test.tsx
│   │   └── HU-04.integration.test.tsx
│   │
│   ├── fixtures/
│   │   ├── citas.fixture.ts
│   │   ├── servicios.fixture.ts
│   │   ├── usuarios.fixture.ts
│   │   └── derivaciones.fixture.ts
│   │
│   └── setupTests.ts
│
├── hooks/                           [CUSTOM HOOKS - Lógica reutilizable]
│   ├── useAgendamiento.ts
│   ├── useAgenda.ts
│   ├── useConsulta.ts
│   ├── useDerivacion.ts
│   ├── useAuth.ts
│   ├── useAvailability.ts
│   ├── useCertificado.ts
│   └── index.ts
│
├── services/                        [INTEGRACIÓN - API & Storage]
│   ├── api/
│   │   ├── agendaService.ts
│   │   ├── servicioService.ts
│   │   ├── profesionalService.ts
│   │   ├── consultaService.ts
│   │   ├── derivacionService.ts
│   │   ├── disponibilidadService.ts
│   │   ├── certificadoService.ts
│   │   └── axiosConfig.ts
│   │
│   ├── storage/
│   │   ├── authStorage.ts
│   │   ├── cacheStorage.ts
│   │   └── sessionStorage.ts
│   │
│   └── index.ts
│
├── types/                           [TIPOS TypeScript]
│   ├── cita.types.ts
│   ├── servicio.types.ts
│   ├── consulta.types.ts
│   ├── derivacion.types.ts
│   ├── api.types.ts
│   ├── user.types.ts
│   └── index.ts
│
├── utils/                           [UTILIDADES]
│   ├── validators/
│   │   ├── citaValidators.ts
│   │   ├── dateValidators.ts
│   │   ├── consultaValidators.ts
│   │   ├── derivacionValidators.ts
│   │   └── formValidators.ts
│   │
│   ├── formatters/
│   │   ├── dateFormatters.ts
│   │   ├── timeFormatters.ts
│   │   └── textFormatters.ts
│   │
│   ├── errors/
│   │   ├── ErrorHandler.ts
│   │   └── errorMessages.ts
│   │
│   ├── auth/
│   │   ├── jwtParser.ts
│   │   └── jwtValidator.ts
│   │
│   └── constants/
│       ├── messages.ts
│       ├── states.ts
│       ├── timing.ts
│       └── routes.ts
│
├── context/                         [CONTEXT API - Estado global (opcional)]
│   ├── AgendaContext.tsx
│   ├── AuthContext.tsx
│   └── index.ts
│
├── App.tsx                          [Entry point del módulo]
├── index.tsx                        [Main export]
└── README.md                        [Documentación local]

```

**Principio de Aislamiento:**
- ✅ TODO dentro de `src/ui/agendas/`
- ✅ Componentes en `component/`
- ✅ Tests en `test/` (mismo nombre que componente)
- ✅ Sin referencias a otros módulos (src/ui/other-module)
- ✅ Consumir solo de `src/components/ui/` (componentes globales) y `src/theme/`

---

## PARTE 2: COMPONENTES LOCALES REUTILIZABLES

### **TIER 1: SELECTORES (Entrada especializada)**

```
component/selectors/
```

| Componente | Propósito | Props | Validaciones | Estado |
|-----------|----------|-------|-------------|--------|
| **ServiceSelector** | Dropdown de servicios activos | `onSelect(service)`, `disabled?`, `placeholder?` | RN-004 (solo activos) | HU-01 |
| **ProfessionalSelector** | Dropdown de profesionales filtrando por servicio | `serviceId`, `onSelect(prof)`, `loading?` | RN-002 (capacidad) | HU-01 |
| **DateTimeSlotSelector** | Selector visual de fecha + hora con slots disponibles | `profId`, `serviceId`, `onSelect({fecha,hora})` | RN-001, RN-002, RN-003 | HU-01 |

---

### **TIER 2: AGENDA (Visualización de citas)**

```
component/agenda/
```

| Componente | Propósito | Props | Reutilizable | Casos |
|-----------|----------|-------|-------------|-------|
| **AgendaTable** | Tabla de citas con encabezados | `citas[]`, `onClickRow()`, `loading?` | Muy reutilizable | HU-02 |
| **CitaRow** | Fila individual en tabla | `cita`, `onClick`, `actions?` | Muy reutilizable | HU-02 |
| **AgendaCard** | Vista tarjeta alternativa de cita | `cita`, `onAction()` | Reutilizable | HU-02 |
| **AgendaFilters** | Barra de filtros (fecha, estado, etc) | `onFilterChange()`, `defaultDates?` | Muy reutilizable | HU-02 |
| **EstadoBadge** | Badge de estado coloreado | `estado`, `size?`, `className?` | MUY reutilizable | Todas |

---

### **TIER 3: CONSULTA (Registro polimórfico)**

```
component/consulta/
```

| Componente | Propósito | Subtipo | Validaciones |
|-----------|----------|--------|-------------|
| **ConsultaForm** | Wrapper que detecta tipo de servicio | Polimórfico | RN-007, RN-008 |
| **ConsultaMedicaForm** | Formulario médico general | Especializado | Campos médicos |
| **ConsultaOdontologicaForm** | Formulario odontología | Especializado | Campos dentales |
| **ConsultaPsicologicaForm** | Formulario psicología | Especializado | Escalas (0-100) |
| **ConsultaSocialForm** | Formulario trabajo social | Especializado | Datos socioeconómicos |
| **SignosVitalesInput** | Sub-componente para signos vitales | Reutilizable | Validar rangos |

---

### **TIER 4: DERIVACIÓN (Transferencia de pacientes)**

```
component/derivacion/
```

| Componente | Propósito | Props | Validaciones |
|-----------|----------|-------|-------------|
| **DerivacionModal** | Modal para crear derivación | `citaId`, `open`, `onSubmit()`, `onCancel()` | RN-010, RN-011 |
| **DerivacionInbox** | Bandeja de derivaciones pendientes | `profesionalId`, `onAccept()`, `onReject()` | RN-011, RN-005 |
| **DerivacionCard** | Tarjeta individual derivación | `derivacion`, `onAction()` | Información visual |
| **DerivacionActions** | Botones Aceptar/Rechazar | `derivacionId`, `estado`, `onAction()` | RN-012 |

---

### **TIER 5: SHARED (Componentes compartidos)**

```
component/shared/
```

| Componente | Propósito | Reutilizable | Stack |
|-----------|----------|-------------|-------|
| **CitaModal** | Modal expandido de detalles de cita | MUY reutilizable (Todas HU) | HU-01,02,03,05 |
| **ErrorAlert** | Mostrar errores de validación/API | MUY reutilizable | Todas HU |
| **LoadingSpinner** | Indicador de carga | MUY reutilizable | Todas HU |
| **SuccessNotification** | Notificación de éxito | MUY reutilizable | Todas HU |
| **ConfirmDialog** | Dialog de confirmación antes de acciones | MUY reutilizable | HU-01, HU-05 |

---

### **TIER 6: PAGES (Vistas principales - Ensambladores)**

```
component/pages/
```

| Vista | HU | Responsabilidad | Componentes que ensambla |
|------|----|-----------------|-----------------------|
| **AgendarCita.tsx** | HU-01 | Orquestar flujo agendamiento | ServiceSelector, ProfessionalSelector, DateTimeSlotSelector, CitaModal |
| **MiAgenda.tsx** | HU-02 | Mostrar agenda del profesional | AgendaTable, AgendaFilters, CitaModal, EstadoBadge |
| **Consulta.tsx** | HU-03 | Registrar datos de consulta | ConsultaForm (polimórfico), ErrorAlert, SuccessNotification |
| **Derivaciones.tsx** | HU-05 | Gestionar derivaciones pendientes | DerivacionInbox, DerivacionModal, DerivacionCard |
| **Certificados.tsx** | HU-04 (Iter 2) | Generar/descargar PDF | CitaModal, CertificateButton |

---

## PARTE 3: HOJA DE RUTA TÁCTICA - BABY STEPS

### **Filosofía:**
- **TDD riguroso:** RED → GREEN → REFACTOR
- **Aislamiento absoluto:** Todo en `src/ui/agendas/`
- **Incremental:** Cada paso completo antes del siguiente
- **YAGNI:** Solo lo que pide la HU actual

---

## ITERACIÓN 1: HU-01, HU-02, HU-03, HU-05

---

### **FASE 0: SCAFFOLDING & CONFIGURACIÓN (Día 1)**

#### **Paso 0.1: Crear estructura base de carpetas**
**Entrega:**
```
src/ui/agendas/
├── component/
│   ├── selectors/
│   ├── agenda/
│   ├── consulta/
│   ├── derivacion/
│   ├── shared/
│   ├── pages/
│   └── index.ts
├── test/
│   ├── selectors/
│   ├── agenda/
│   ├── consulta/
│   ├── derivacion/
│   ├── shared/
│   ├── integration/
│   ├── fixtures/
│   └── setupTests.ts
├── hooks/
├── services/
├── types/
├── utils/
├── context/
└── README.md
```

**Criterio de éxito:** Carpetas creadas, vacías, sin errores de compilación.

---

#### **Paso 0.2: Definir tipos TypeScript centralizados**
**Archivos:**
- `src/ui/agendas/types/cita.types.ts` - Cita, EstadoCita
- `src/ui/agendas/types/servicio.types.ts` - Servicio
- `src/ui/agendas/types/consulta.types.ts` - Consulta, subtipos
- `src/ui/agendas/types/derivacion.types.ts` - Derivacion, EstadoDerivacion
- `src/ui/agendas/types/user.types.ts` - Usuario, Rol
- `src/ui/agendas/types/api.types.ts` - Response, ErrorResponse

**Criterio:** TypeScript compila sin errores, interfaces exportadas en `index.ts`

---

#### **Paso 0.3: Configurar servicios HTTP y autenticación**
**Archivos:**
- `src/ui/agendas/services/api/axiosConfig.ts` - Cliente HTTP con JWT auto
- `src/ui/agendas/services/storage/authStorage.ts` - Guardar/leer JWT
- `src/ui/agendas/utils/auth/jwtValidator.ts` - Validar vigencia

**Tests:**
- `src/ui/agendas/test/` - Unit tests para cada función

**Criterio:** Validar JWT antes de cada request, manejo de 401 Unauthorized

---

#### **Paso 0.4: Crear constantes y utilidades base**
**Archivos:**
- `src/ui/agendas/utils/constants/messages.ts` - Mensajes UI
- `src/ui/agendas/utils/constants/states.ts` - Estados como constantes
- `src/ui/agendas/utils/constants/timing.ts` - Duraciones (30 min cita, etc)
- `src/ui/agendas/utils/formatters/dateFormatters.ts` - Formatear fechas
- `src/ui/agendas/utils/errors/ErrorHandler.ts` - Centralizar errores

**Criterio:** Funciones puras, 100% testeadas

---

### **FASE 1: HU-01 - AGENDAR CITA (Días 2-4)**

#### **Paso 1.1: Test-First - Validar reglas de negocio**
**Archivos:**
- `src/ui/agendas/test/` (Tests RED - Failing)

**Tests a escribir (deben fallar):**
```typescript
✗ Validador RN-001: Rechaza fecha pasada
✗ Validador RN-002: Detecta conflicto horario profesional
✗ Validador RN-003: Rechaza 2ª cita paciente mismo servicio mismo día
✗ Validador RN-004: Filtra solo servicios activos
✗ Validador RN-005: Valida JWT y rol
```

**Criterio:** Tests compilan, fallan (ROJO)

---

#### **Paso 1.2: Implementar validadores**
**Archivos:**
- `src/ui/agendas/utils/validators/citaValidators.ts`
- `src/ui/agendas/utils/validators/dateValidators.ts`

**Funciones:**
- `isDatePast(fecha)` → RN-001
- `hasConflict(profId, fecha)` → RN-002 (lógica local + validación backend)
- `hasCitaSameDayService(userId, servicio, fecha)` → RN-003
- `isServiceActive(servicio)` → RN-004
- `validateUserRole(jwt, expectedRole)` → RN-005

**Tests:** Todos pasan (VERDE) ✓

---

#### **Paso 1.3: Crear custom hook `useAgendamiento`**
**Archivo:**
- `src/ui/agendas/hooks/useAgendamiento.ts`
- `src/ui/agendas/test/integration/HU-01.integration.test.tsx`

**Responsabilidades:**
1. `loadServicios()` → GET /api/servicios/ (RN-004)
2. `loadProfesionales(servicioId)` → GET /api/profesionales/ (RN-002)
3. `checkDisponibilidad(profId, fecha)` → Valida RN-001, RN-002, RN-003
4. `crearCita(citaData)` → POST /api/citas/ (RN-005)

**Tests (TDD):**
- ✓ loadServicios retorna array, solo activos
- ✓ loadProfesionales filtra por servicio
- ✓ checkDisponibilidad valida todas las reglas
- ✓ crearCita valida antes de enviar, maneja errores

**Criterio:** Todas las validaciones pasan, mock de API

---

#### **Paso 1.4: Crear selectores especializados**
**Archivos:**
- `src/ui/agendas/component/selectors/ServiceSelector.tsx` + `.test.tsx`
- `src/ui/agendas/component/selectors/ProfessionalSelector.tsx` + `.test.tsx`
- `src/ui/agendas/component/selectors/DateTimeSlotSelector.tsx` + `.test.tsx`

**Tests (TDD - RED primero):**
- ServiceSelector: Renderiza dropdown, filtra activos, ejecuta onSelect
- ProfessionalSelector: Carga profesionales dinamicamente, deshabilita si ninguno
- DateTimeSlotSelector: Muestra solo slots disponibles, deshabilita pasados

**Criterio:** Componentes "tontos", solo props + render, sin lógica

---

#### **Paso 1.5: Crear vista `AgendarCita.tsx`**
**Archivo:**
- `src/ui/agendas/component/pages/AgendarCita.tsx` + test

**Estructura:**
1. Validar JWT (useAuth)
2. Usar useAgendamiento hook
3. Layout:
   - Paso 1: ServiceSelector
   - Paso 2: ProfessionalSelector (dependiente de Paso 1)
   - Paso 3: DateTimeSlotSelector
   - Paso 4: Campo "Motivo" (textarea)
   - Botón "Guardar"
4. ErrorAlert para errores
5. SuccessNotification al éxito

**Tests:**
- ✓ Flujo completo: Selecciona servicio → Profesional → Fecha → Guarda
- ✓ Valida RN-001 (rechaza pasada)
- ✓ Valida RN-003 (rechaza 2ª cita mismo día)
- ✓ Muestra confirmación al éxito

**Criterio:** Integración completa HU-01

---

#### **Paso 1.6: Integrar en App.tsx**
**Archivo:**
- `src/ui/agendas/App.tsx`

**Entrega:**
- Ruta `/agendas/agendar` → `AgendarCita.tsx`
- Protección: Si no hay JWT válido, redirect a login

**Criterio:** Ruta funciona sin errores

---

### **FASE 2: HU-02 - VISUALIZAR AGENDA (Días 5-6)**

#### **Paso 2.1: Crear custom hook `useAgenda`**
**Archivo:**
- `src/ui/agendas/hooks/useAgenda.ts` + test

**Responsabilidades:**
1. `loadAgenda(profId, filtros?)` → GET /api/citas/
2. `filtrarPorFecha(desde, hasta)` → Rango valido
3. Estados mostrados: AGENDADA, CONFIRMADA, ATENDIDA (RN-008)

**Validaciones:**
- RN-005: Solo citas del profesional actual
- RN-006: Rango de fechas valido
- RN-008: Mostrar solo estados correctos

---

#### **Paso 2.2: Crear componentes de agenda**
**Archivos:**
- `src/ui/agendas/component/agenda/AgendaTable.tsx` + test
- `src/ui/agendas/component/agenda/CitaRow.tsx` + test
- `src/ui/agendas/component/agenda/AgendaFilters.tsx` + test

**Tests (TDD):**
- AgendaTable: Renderiza N filas, ejecuta onClickRow
- CitaRow: Muestra Hora, Paciente, Estado, Motivo
- AgendaFilters: Captura rango, botón "Filtrar"

**Criterio:** Componentes 100% testeados

---

#### **Paso 2.3: Crear componente compartido `CitaModal.tsx`**
**Archivo:**
- `src/ui/agendas/component/shared/CitaModal.tsx` + test

**Contenido:**
- Detalles expandidos: Fecha, Paciente, Motivo, Estado
- Historial previo del paciente (read-only)
- Botones contextuales variables:
  - Si estado AGENDADA + usuario = profesional: "Iniciar Consulta"
  - Si estado AGENDADA + usuario = paciente: "Cancelar"
  - Si estado ATENDIDA + usuario = profesional: "Derivar", "Generar Certificado"

**Tests:**
- ✓ Abre/cierra sin errores
- ✓ Muestra detalles correctamente
- ✓ Botones aparecen según condiciones

**Criterio:** Modal reutilizable en múltiples HU

---

#### **Paso 2.4: Crear vista `MiAgenda.tsx`**
**Archivo:**
- `src/ui/agendas/component/pages/MiAgenda.tsx` + test integración

**Estructura:**
1. Validar rol = PROFESIONAL (useAuth)
2. Usar useAgenda hook
3. Renderizar:
   - AgendaFilters (encima)
   - AgendaTable (con datos filtrados)
   - Al clickear fila → CitaModal se abre

**Tests (Integration):**
- ✓ Carga agenda del profesor actual
- ✓ Filtra por rango fechas (RN-006)
- ✓ No muestra citas ajenas (RN-005)
- ✓ Click fila abre modal

**Criterio:** HU-02 completa

---

#### **Paso 2.5: Agregar a App.tsx**
- Ruta `/agendas/mi-agenda` → `MiAgenda.tsx`
- Protección: rol = profesional

---

### **FASE 3: HU-03 - REGISTRO DE CONSULTA (Días 7-8)**

#### **Paso 3.1: Test-First - Validar consultas**
**Archivos de test:**
- `src/ui/agendas/test/` (RED - Failing)

**Tests:**
- ✗ RN-007: Observaciones obligatorias, min 10 caracteres
- ✗ RN-008: Detectar consulta ya guardada (inmutable)
- ✗ RN-005: Solo profesional asignado puede guardar

---

#### **Paso 3.2: Implementar validadores**
**Archivo:**
- `src/ui/agendas/utils/validators/consultaValidators.ts`

**Funciones:**
- `validateObservaciones(obs)` → min 10 caracteres
- `isConsultaEditable(consulta)` → Booleano
- `canSaveConsulta(userId, citaProf)` → Match usuario actual

**Tests:** Todos pasan (VERDE)

---

#### **Paso 3.3: Crear custom hook `useConsulta`**
**Archivo:**
- `src/ui/agendas/hooks/useConsulta.ts` + test

**Responsabilidades:**
1. `obtenerConsulta(citaId)` → GET /api/consultas/
2. `crearConsulta(citaId, tipoServicio, data)` → POST /api/consultas/
3. `guardarConsulta(consultaId, data)` → PATCH /api/consultas/ (actualiza Cita.estado = ATENDIDA)

---

#### **Paso 3.4: Crear formularios polimórficos**
**Archivos:**
- `src/ui/agendas/component/consulta/ConsultaForm.tsx` (wrapper)
- `src/ui/agendas/component/consulta/ConsultaMedicaForm.tsx`
- `src/ui/agendas/component/consulta/ConsultaOdontologicaForm.tsx`
- `src/ui/agendas/component/consulta/ConsultaPsicologicaForm.tsx`
- `src/ui/agendas/component/consulta/ConsultaSocialForm.tsx`
- `src/ui/agendas/component/consulta/SignosVitalesInput.tsx`

**ConsultaForm (Wrapper):**
```
Props: tipoServicio, citaId, onSave, initialData?
Logic:
  - Detecta tipo de servicio
  - Renderiza subformulario correspondiente
  - onSave delega a hook useConsulta
```

**Cada subformulario:**
- Campo universal: **Observaciones** (textarea, obligatorio, min 10 caracteres)
- Campos especializados según tipo (médico, dental, psicológico, social)
- Deshabilitar después de guardar (RN-008 - Inmutabilidad)
- Mostrar solo lectura si ya fue guardada

**Tests:** Cada formulario valida sus campos específicos, RN-007, RN-008

---

#### **Paso 3.5: Integrar en CitaModal.tsx**
**Archivo:**
- `src/ui/agendas/component/shared/CitaModal.tsx` (ACTUALIZAR)

**Cambio:**
- Si estado AGENDADA + usuario = profesional + click "Iniciar Consulta"
- Renderizar ConsultaForm (polimórfico) dentro del modal
- onSave → Actualiza estado Cita a ATENDIDA, cierra modal

---

#### **Paso 3.6: Crear vista `Consulta.tsx` (Opcional)**
**Archivo:**
- `src/ui/agendas/component/pages/Consulta.tsx`

**Nota:** Si no cabe todo en CitaModal, crear página separada.

---

### **FASE 4: HU-05 - DERIVACIONES (Días 9-10)**

#### **Paso 4.1: Test-First - Validar derivaciones**
**Tests (RED):**
- ✗ RN-010: Servicio destino ≠ actual
- ✗ RN-011: Motivo obligatorio, min 10 caracteres
- ✗ RN-012: Trazabilidad (remitente, timestamp)
- ✗ RN-005: Solo profesional asignado puede derivar

---

#### **Paso 4.2: Implementar validadores**
**Archivo:**
- `src/ui/agendas/utils/validators/derivacionValidators.ts`

**Funciones:**
- `validateDerivationDestiny(servicioActual, servicioDest)` → Diferentes
- `validateMotivo(motivo)` → min 10 caracteres
- `canCreateDerivation(userId, citaProf)` → Match usuario

---

#### **Paso 4.3: Crear custom hook `useDerivacion`**
**Archivo:**
- `src/ui/agendas/hooks/useDerivacion.ts` + test

**Responsabilidades:**
1. `crearDerivacion(citaId, destinoId, motivo)` → POST /api/derivaciones/
2. `loadPendientes(profesionalId)` → GET /api/derivaciones/pendientes/
3. `aceptarDerivacion(derivacionId)` → PATCH (estado=ACEPTADA, crea cita)
4. `rechazarDerivacion(derivacionId, motivo?)` → PATCH (estado=RECHAZADA)

---

#### **Paso 4.4: Crear componentes de derivación**
**Archivos:**
- `src/ui/agendas/component/derivacion/DerivacionModal.tsx` + test
- `src/ui/agendas/component/derivacion/DerivacionInbox.tsx` + test
- `src/ui/agendas/component/derivacion/DerivacionCard.tsx` + test

**DerivacionModal:**
- Dropdown: Servicios destino (excluye actual, solo activos)
- Textarea: Motivo (min 10 caracteres, RN-011)
- Botones: Derivar, Cancelar

**DerivacionInbox:**
- Filtra derivaciones PENDIENTE para profesional actual
- Renderiza array de DerivacionCard

**DerivacionCard:**
- Muestra: Paciente, Motivo, Servicio origen, Fecha
- Botones: Aceptar, Rechazar (ejecutan useDerivacion)

**Tests:** RN-010, RN-011, RN-012 validadas

---

#### **Paso 4.5: Integrar en CitaModal.tsx**
**Archivo:**
- `src/ui/agendas/component/shared/CitaModal.tsx` (ACTUALIZAR)

**Cambio:**
- Si estado ATENDIDA + usuario = profesional
- Mostrar botón "Derivar Paciente"
- Click → Abre DerivacionModal dentro del modal

---

#### **Paso 4.6: Crear vista `Derivaciones.tsx`**
**Archivo:**
- `src/ui/agendas/component/pages/Derivaciones.tsx` + test integración

**Estructura:**
1. Validar rol = PROFESIONAL (useAuth)
2. Usar useDerivacion hook para cargar pendientes
3. Renderizar DerivacionInbox
4. Mostrar bandeja de derivaciones PENDIENTE

**Tests (Integration):**
- ✓ Carga derivaciones del profesional actual
- ✓ Click "Aceptar" → ACEPTADA, crea cita en agenda
- ✓ Click "Rechazar" → RECHAZADA, notifica remitente

---

#### **Paso 4.7: Agregar a App.tsx**
- Ruta `/agendas/derivaciones` → `Derivaciones.tsx`

---

### **FASE 5: INTEGRACIÓN & PULIDO ITERACIÓN 1 (Día 11)**

#### **Paso 5.1: Rutas finales en App.tsx**
```
/agendas/agendar        → AgendarCita
/agendas/mi-agenda      → MiAgenda
/agendas/consulta       → (dentro CitaModal o página)
/agendas/derivaciones   → Derivaciones
```

**Protecciones:** JWT + Rol validado en cada ruta

---

#### **Paso 5.2: Manejo global de errores**
**Archivo:**
- `src/ui/agendas/utils/errors/ErrorHandler.ts` (centralizar)

**Integrar:**
- ErrorAlert component en cada vista
- Mensajes user-friendly por tipo de error

---

#### **Paso 5.3: Tests integración por HU**
**Archivos:**
- `src/ui/agendas/test/integration/HU-01.integration.test.tsx`
- `src/ui/agendas/test/integration/HU-02.integration.test.tsx`
- `src/ui/agendas/test/integration/HU-03.integration.test.tsx`
- `src/ui/agendas/test/integration/HU-05.integration.test.tsx`

**Cada test simula:**
- Flujo completo usuario (mock API)
- Validaciones de reglas (RN-001 a RN-012)
- Estados finales correctos

---

#### **Paso 5.4: Documentación interna**
- `src/ui/agendas/README.md` - Guía para desarrolladores
- Comentarios en hooks críticos (useAgendamiento, useConsulta, etc)

---

---

## ITERACIÓN 2: HU-04 CERTIFICADOS

### **FASE 6: HU-04 - CERTIFICADOS (Días 12-13)**

#### **Paso 6.1: Test-First - Validar certificados**
**Tests (RED):**
- ✗ RN-009: Certificado solo si estado = ATENDIDA

---

#### **Paso 6.2: Crear custom hook `useCertificado`**
**Archivo:**
- `src/ui/agendas/hooks/useCertificado.ts` + test

**Responsabilidades:**
1. `generarCertificado(citaId)` → GET /api/citas/{id}/certificado/datos
2. `descargarPDF(datosConsulta)` → POST /api/certificados/ → Download PDF
3. Validar RN-009: Estado = ATENDIDA

---

#### **Paso 6.3: Crear servicio PDF**
**Archivo:**
- `src/ui/agendas/services/api/certificadoService.ts`

**Responsabilidades:**
- Llamar backend para generar PDF
- Registrar descarga (auditoría)
- Manejo de errores

---

#### **Paso 6.4: Crear componente `CertificateButton.tsx`**
**Archivo:**
- `src/ui/agendas/component/shared/CertificateButton.tsx` + test

**Props:**
- `citaId`, `estado`, `onSuccess?`, `onError?`

**Lógica:**
- Solo habilitado si estado = ATENDIDA
- Click → Descarga PDF
- Muestra spinner durante carga
- Success notification al éxito

**Tests:**
- ✓ Botón deshabilitado si estado ≠ ATENDIDA
- ✓ Click descarga sin errores
- ✓ Maneja errores correctamente

---

#### **Paso 6.5: Integrar en CitaModal.tsx**
**Archivo:**
- `src/ui/agendas/component/shared/CitaModal.tsx` (ACTUALIZAR)

**Cambio:**
- Si estado ATENDIDA + usuario = profesional
- Renderizar CertificateButton junto a botón "Derivar"

---

#### **Paso 6.6: Test integración HU-04**
**Archivo:**
- `src/ui/agendas/test/integration/HU-04.integration.test.tsx`

**Test:**
- ✓ Cita ATENDIDA → Botón visible
- ✓ Click descarga PDF
- ✓ Valida RN-009 (solo ATENDIDA)

---

#### **Paso 6.7: Actualizar documentación**
- `src/ui/agendas/README.md` - Agregar HU-04

---

### **FASE 7: REFINAMIENTO FINAL (Día 14)**

#### **Paso 7.1: Auditoría y logging**
**Archivo:**
- `src/ui/agendas/utils/` - Agregar logging calls en acciones críticas

#### **Paso 7.2: Performance (Lazy loading, memoización)**
- Memoizar componentes reutilizables (EstadoBadge, CitaRow, etc)
- Lazy loading de vistas si es necesario

#### **Paso 7.3: Accesibilidad (a11y)**
- Labels en inputs
- ARIA roles en componentes custom
- Teclado navigation en modales

#### **Paso 7.4: Cobertura de tests**
- Target mínimo: 80% cobertura
- Reporte: `npm run test:coverage`

---

## PARTE 4: RESUMEN ESQUEMÁTICO

### **Componentes por Fase:**

| Fase | HU | Componentes | Tests |
|------|----|-----------|----|
| 0 | Setup | Types, Services, Utils | 4 |
| 1 | HU-01 | Selectores (3) + AgendarCita | 10 |
| 2 | HU-02 | Agenda (5) + MiAgenda | 8 |
| 3 | HU-03 | Consultas (6) + Integración | 12 |
| 4 | HU-05 | Derivaciones (4) + Derivaciones | 10 |
| 5 | Pulido | ErrorHandler + Docs | 5 |
| 6 | HU-04 | CertificateButton + useCertificado | 4 |
| 7 | Final | Optimización + a11y | - |

**Total: 26 componentes, 53 tests unitarios + 5 integración**

---

## PARTE 5: PRINCIPIOS INMUTABLES (Guía)

### ✅ OBLIGATORIO en cada paso:
1. **Test-First:** Test ROJO → Código VERDE → Refactor
2. **Componentes Tontos:** Lógica en hooks, UI pura
3. **Tailwind Only:** Cero CSS custom, variables globales: -btn-primary-bg, --hc-bg (las variables se encuentras en /src/theme/global.css)
4. **Aislamiento Absoluto:** TODO en `src/ui/agendas/`, NO referencias a otros módulos
5. **Zero-Trust:** Validar JWT antes de cada request
6. **YAGNI:** Solo lo que la HU pide, nada más

### 🔄 Ciclo TDD por componente:
```
1. Escribe test (ROJO - Falla)
2. Escribe componente mínimo (VERDE - Pasa)
3. Refactoriza manteniendo test verde
4. Repeats
```

---

**FIN DEL PLAN TÉCNICO MACRO - Restricción Arquitectónica**

---

*Este plan respeta la restricción de aislamiento absoluto dentro de `src/ui/agendas/`. Cada paso es verificable, testeable y no anticipa funciones futuras.*
