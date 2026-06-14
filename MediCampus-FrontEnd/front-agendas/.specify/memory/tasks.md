# TRACKING DE TAREAS - MÓDULO AGENDAS (ENFOQUE MACRO-BATCHING)

**Estrategia:** Súper Lotes (Macro-Batching) - TDD Riguroso  
**Fecha:** 26 de Mayo 2026  
**Stack:** React + Vite + Tailwind + Vitest + React Testing Library

---

## FASE 0: SCAFFOLDING & CONFIGURACIÓN

- [x] **Tarea 0.1 - Estructura Base y Tipos TypeScript** ✅ COMPLETADA
  - [x] Crear directorios: `src/ui/agendas/component/`, `src/ui/agendas/test/`, `src/ui/agendas/hooks/`, `src/ui/agendas/services/`, `src/ui/agendas/types/`, `src/ui/agendas/utils/`
  - [x] Crear archivos de tipos en `src/ui/agendas/types/`:
    - [x] `cita.types.ts` (Cita, EstadoCita)
    - [x] `servicio.types.ts` (Servicio)
    - [x] `consulta.types.ts` (Consulta, subclases)
    - [x] `derivacion.types.ts` (Derivacion, enums)
    - [x] `user.types.ts` (Usuario, Rol)
    - [x] `api.types.ts` (Response, ErrorResponse)
    - [x] `index.ts` (exports)
  - [x] Crear `index.ts` en cada carpeta principal para exports centralizados
  - [x] Crear archivos stub/placeholder para componentes (27 componentes)
  - [x] Crear archivos stub/placeholder para hooks (7 hooks)
  - [x] Crear archivos stub/placeholder para servicios (9 servicios)
  - [x] Actualizar `tsconfig.json` con tipos de Vite
  - [x] Crear `App.tsx` principal del módulo
  - [x] Verificar compilación: `npm run build` sin errores ✅

- [x] **Tarea 0.2 - Configuración HTTP, Auth y Utilidades Base** ✅ COMPLETADA
  - [x] Crear `src/ui/agendas/services/api/axiosConfig.ts`:
    - [x] Cliente Axios configurado con baseURL y timeout
    - [x] Interceptor automático de JWT en headers
    - [x] Manejo de 401 Unauthorized con limpieza de token
  - [x] Crear `src/ui/agendas/services/storage/authStorage.ts`:
    - [x] `saveToken()` - con validación de expiración
    - [x] `getToken()` - retorna null si está expirado
    - [x] `isTokenValid()` - verifica token válido
    - [x] `clearToken()` - limpia localStorage
    - [x] `getTokenPayload()` - decodifica el JWT
    - [x] `getUserId()` - extrae user_id del token
    - [x] `saveUser()` / `getUser()` - manejo de datos de usuario
  - [x] Crear `src/ui/agendas/utils/auth/jwtValidator.ts`:
    - [x] `parseJWT()` - decodifica sin validar firma
    - [x] `isTokenExpired()` - verifica expiración con margen de 30s
    - [x] `getTokenExpiresIn()` - tiempo restante en ms
    - [x] `validateTokenRole()` - validación case-sensitive (RN-005)
  - [x] Crear `src/ui/agendas/utils/auth/jwtParser.ts`:
    - [x] `getTokenClaim()` - extrae claim individual
    - [x] `getTokenType()` - obtiene tipo de token
  - [x] Crear `src/ui/agendas/utils/formatters/dateFormatters.ts`:
    - [x] `formatDateToUI()` - ISO → DD/MM/YYYY
    - [x] `formatDateToISO()` - DD/MM/YYYY → ISO
    - [x] `getCurrentDateISO()` - fecha actual
    - [x] `addDaysToDate()` - suma días
    - [x] `getDaysDifference()` - calcula diferencia
  - [x] Crear `src/ui/agendas/utils/formatters/timeFormatters.ts`:
    - [x] `formatTimeToUI()` - Date → HH:mm
    - [x] `timeStringToMinutes()` - HH:mm → minutos
    - [x] `minutesToTimeString()` - minutos → HH:mm
    - [x] `addMinutesToTime()` - suma minutos a hora
    - [x] `getMinutesDifference()` - diferencia entre horas
  - [x] Crear `src/ui/agendas/utils/errors/ErrorHandler.ts`:
    - [x] `ErrorCode` enum con códigos estándar
    - [x] `handleError()` - convierte errores a ApiError
    - [x] `getErrorMessage()` - mensaje user-friendly
    - [x] `getErrorMessageByCode()` - mapeo de códigos
    - [x] `logError()` - log con contexto
  - [x] Crear `src/ui/agendas/utils/errors/errorMessages.ts`:
    - [x] Mensajes de error por contexto (auth, agendamiento, agenda, consulta, etc.)
  - [x] Crear `src/ui/agendas/utils/constants/messages.ts`:
    - [x] Títulos, acciones, placeholders, validación
    - [x] Confirmaciones, estados, fechas/horas
  - [x] Crear `src/ui/agendas/utils/constants/states.ts`:
    - [x] Estados de Cita, Derivación, Consulta
    - [x] Labels y colores Tailwind para cada estado
    - [x] Enums de Rol y Sexo
  - [x] Crear `src/ui/agendas/utils/constants/timing.ts`:
    - [x] Duraciones: cita (30 min), margen (30 min)
    - [x] Timeouts: API (30s), request (10s), debounce (300ms)
    - [x] JWT: expirationWarning (5 min), refreshThreshold (1 min)
    - [x] Agendamiento: minDaysInAdvance (1), maxDaysInAdvance (90)
    - [x] Horarios: scheduleStart (08:00), scheduleEnd (18:00)
    - [x] Polling intervals y retry configuration
  - [x] Instalar dependencia: axios (para cliente HTTP)
  - [x] Verificar compilación: `npm run build` sin errores ✅

---

## FASE 1: HISTORIA DE USUARIO 01 - AGENDAR CITA

### Tarea 1.1 - SÚPER FASE ROJA (HU-01)

Crear TODOS los archivos de prueba. Los tests deben fallar (Cannot find module / file not found).

**Archivos de test a crear en `src/ui/agendas/test/`:**

1. **`validators/citaValidators.test.ts`** (39 tests)
   - RN-001: Fechas pasadas (5 tests)
   - RN-002: Exclusividad horario profesional (9 tests)
   - RN-003: Una cita/especialidad/día (9 tests)
   - RN-004: Solo servicios activos (5 tests)
   - RN-005: Validación de rol (9 tests)

2. **`selectors/ServiceSelector.test.tsx`** (4-5 tests)
   - Renderiza dropdown con servicios activos
   - Ejecuta onSelect() al cambiar
   - Filtra solo servicios con es_activo=true

3. **`selectors/ProfessionalSelector.test.tsx`** (4-5 tests)
   - Carga profesionales dinámicamente por servicio
   - Deshabilita si no hay profesionales
   - Ejecuta onSelect()

4. **`selectors/DateTimeSlotSelector.test.tsx`** (5-6 tests)
   - Muestra slots disponibles
   - Deshabilita fechas pasadas
   - Filtra conflictos de horario
   - Ejecuta onSelect({fecha, hora})

5. **`integration/HU-01.integration.test.tsx`** (8-10 tests)
   - Hook useAgendamiento: loadServicios(), loadProfesionales(), checkDisponibilidad(), crearCita()
   - Flujo completo: selecciona servicio → profesional → fecha → guarda
   - Valida RN-001, RN-002, RN-003
   - Manejo de errores

**Resultado esperado:** Terminal muestra errores tipo `Cannot find module 'src/ui/agendas/utils/validators/citaValidators'`

- [x] Crear todos los archivos de test listados arriba
- [x] Ejecutar `npm run test -- src/ui/agendas/test/validators/citaValidators.test.ts` → FAIL
- [x] Ejecutar `npm run test -- src/ui/agendas/test/selectors/` → FAIL
- [x] Ejecutar `npm run test -- src/ui/agendas/test/integration/HU-01.integration.test.tsx` → FAIL

---

### Tarea 1.2 - SÚPER FASE VERDE (HU-01)

Implementar TODO el código de producción. Todos los tests de 1.1 deben pasar a VERDE.

**Archivos de código a crear en `src/ui/agendas/`:**

1. **`utils/validators/citaValidators.ts`**
   - `isDatePast(fecha)` - RN-001
   - `hasConflict(profId, fecha, citasExistentes)` - RN-002 (30 min de duración, margen 30 min)
   - `hasCitaSameDayService(userId, servicioId, fecha, citasExistentes)` - RN-003 (M2M support)
   - `isServiceActive(servicio)` - RN-004 (strict: === true)
   - `validateUserRole(jwt, expectedRole)` - RN-005 (case-sensitive, zero-trust)

2. **`hooks/useAgendamiento.ts`**
   - `loadServicios()` → GET /api/servicios/
   - `loadProfesionales(servicioId)` → GET /api/profesionales/
   - `checkDisponibilidad(profId, fecha)` - usa validadores
   - `crearCita(citaData)` → POST /api/citas/ con validaciones

3. **`component/selectors/ServiceSelector.tsx`**
   - Props: `onSelect(service)`, `disabled?`, `placeholder?`
   - Dropdown component (tonto: solo props + render)
   - Usar Tailwind + variables CSS (--hc-bg, --btn-primary-bg, etc.)

4. **`component/selectors/ProfessionalSelector.tsx`**
   - Props: `serviceId`, `onSelect(prof)`, `loading?`
   - Dropdown component con carga dinámica
   - Deshabilitar si no hay opciones

5. **`component/selectors/DateTimeSlotSelector.tsx`**
   - Props: `profId`, `serviceId`, `onSelect(slot)`, `availableSlots?`
   - Calendario o date/time picker
   - Deshabilitar fechas pasadas

6. **`component/shared/ErrorAlert.tsx`**
   - Props: `message: string`, `type?`, `onDismiss?()`
   - Alerta visual con Tailwind

7. **`component/shared/SuccessNotification.tsx`**
   - Props: `message: string`, `onDismiss?()`
   - Notificación toast o alert

8. **`component/pages/AgendarCita.tsx`** (Vista Principal HU-01)
   - Layout: 4 pasos progresivos
   - Paso 1: ServiceSelector
   - Paso 2: ProfessionalSelector (dependiente)
   - Paso 3: DateTimeSlotSelector
   - Paso 4: Textarea "Motivo" + Botón "Guardar"
   - ErrorAlert + SuccessNotification
   - Validar JWT antes de mostrar (useAuth)

**Resultado esperado:** Terminal muestra `39 passed` (citaValidators) + `4 passed` (ServiceSelector) + `4 passed` (ProfessionalSelector) + `5 passed` (DateTimeSlotSelector) + `10 passed` (integration) = ~62 tests PASS

- [x] Implementar `citaValidators.ts`
- [x] Implementar `useAgendamiento.ts`
- [x] Implementar tres selectores `.tsx`
- [x] Implementar componentes compartidos (ErrorAlert, SuccessNotification)
- [x] Implementar vista principal `AgendarCita.tsx`
- [ ] Ejecutar `npm run test -- src/ui/agendas/test/validators/citaValidators.test.ts` → 39 PASS ✓
- [ ] Ejecutar `npm run test -- src/ui/agendas/test/selectors/` → ~13 PASS ✓
- [ ] Ejecutar `npm run test -- src/ui/agendas/test/integration/HU-01.integration.test.tsx` → ~10 PASS ✓
- [x] Actualizar `src/ui/agendas/App.tsx`: Ruta `/agendas/agendar` → AgendarCita.tsx (con protección JWT)

---

### Tarea 1.3 - REFACTOR (HU-01)

Optimizar y pulir HU-01 manteniendo tests en VERDE.

- [x] Limpiar código duplicado en selectores
- [x] Extraer strings a constantes (`messages.ts`)
- [x] Mejorar nombres de variables en `useAgendamiento`
- [x] Revisar JSDoc en funciones críticas
- [x] Ejecutar `npm run test -- src/ui/agendas/test/integration/HU-01.integration.test.tsx` → Todos PASS ✓
- [x] Actualizar `src/ui/agendas/component/index.ts` con exports de componentes HU-01

---

## FASE 2: HISTORIA DE USUARIO 02 - VISUALIZAR AGENDA

### Tarea 2.1 - SÚPER FASE ROJA (HU-02)

Crear TODOS los archivos de prueba. Los tests deben fallar.

**Archivos de test a crear en `src/ui/agendas/test/`:**

1. **`integration/HU-02.integration.test.tsx`** (10-12 tests)
   - Hook `useAgenda`: loadAgenda(), filtrarPorFecha()
   - Filtra solo citas del profesional actual (RN-005)
   - Valida rango de fechas (RN-006)
   - No muestra CANCELADA

2. **`agenda/AgendaTable.test.tsx`** (4-5 tests)
   - Renderiza tabla con N filas
   - Ejecuta onClickRow() al hacer click
   - Muestra columnas: Hora, Paciente, Estado

3. **`agenda/CitaRow.test.tsx`** (3-4 tests)
   - Renderiza fila individual
   - Muestra datos correctos
   - Click ejecuta callback

4. **`agenda/AgendaFilters.test.tsx`** (4-5 tests)
   - Renderiza date pickers (desde, hasta)
   - Ejecuta onFilterChange() al aplicar
   - Valida desde <= hasta

5. **`shared/EstadoBadge.test.tsx`** (4-5 tests)
   - Renderiza badge por estado
   - Colores correctos según estado

6. **`shared/CitaModal.test.tsx`** (6-8 tests)
   - Abre/cierra sin errores
   - Muestra detalles de cita
   - Botones contextuales según estado y rol
   - Click botón ejecuta onAction()

7. **`pages/MiAgenda.page.test.tsx`** (6-8 tests)
   - Valida rol PROFESIONAL
   - Carga agenda del profesor actual
   - Filtra por rango de fechas
   - Click en fila abre modal
   - No muestra citas ajenas

**Resultado esperado:** Todos los tests fallan (archivos no existen)

- [x] Crear todos los archivos de test listados arriba
- [x] Ejecutar `npm run test -- src/ui/agendas/test/integration/HU-02.integration.test.tsx` → FAIL
- [x] Ejecutar `npm run test -- src/ui/agendas/test/agenda/` → FAIL
- [x] Ejecutar `npm run test -- src/ui/agendas/test/shared/` → FAIL (Nota: ErrorAlert, SuccessNotification ya existen de HU-01)
- [x] Ejecutar `npm run test -- src/ui/agendas/test/pages/MiAgenda.page.test.tsx` → FAIL

---

### Tarea 2.2 - SÚPER FASE VERDE (HU-02)

Implementar TODO el código de producción. Todos los tests de 2.1 deben pasar a VERDE.

**Archivos de código a crear/actualizar en `src/ui/agendas/`:**

1. **`hooks/useAgenda.ts`**
   - `loadAgenda(profId, filtros?)` → GET /api/citas/?profesional=id&desde=...&hasta=...
   - `filtrarPorFecha(desde, hasta)` - validar rango
   - Validar RN-005 (usuario actual)
   - Validar RN-006 (rango fechas)

2. **`component/agenda/AgendaTable.tsx`**
   - Props: `citas[]`, `onClickRow()`, `loading?`
   - Tabla HTML con Tailwind

3. **`component/agenda/CitaRow.tsx`**
   - Props: `cita`, `onClick`
   - Fila de tabla con: Hora, Paciente, Estado (usando EstadoBadge)

4. **`component/agenda/AgendaFilters.tsx`**
   - Props: `onFilterChange()`, `defaultDates?`
   - Date pickers para desde y hasta
   - Botón "Filtrar"

5. **`component/shared/EstadoBadge.tsx`**
   - Props: `estado: string`, `size?`
   - Badge con colores por estado (AGENDADA=azul, ATENDIDA=verde, etc.)
   - MUY reutilizable (usarlo en todas las vistas)

6. **`component/shared/CitaModal.tsx`** (Componente Compartido - Usado por múltiples HU)
   - Props: `cita`, `open: boolean`, `onClose()`, `onAction?(action, payload)`
   - Modal con detalles de cita
   - Botones contextuales (varían según estado y rol):
     - Si AGENDADA + profesional: "Iniciar Consulta"
     - Si AGENDADA + paciente: "Cancelar"
     - Si ATENDIDA + profesional: "Derivar", "Generar Certificado" (HU-04+)
   - Mostrar historial previo del paciente (read-only)

7. **`component/pages/MiAgenda.tsx`** (Vista Principal HU-02)
   - Layout: Filtros arriba + Tabla abajo
   - Usar `useAgenda` hook
   - Usar componentes: AgendaFilters, AgendaTable, CitaModal
   - Click en fila → abre CitaModal
   - Validar rol PROFESIONAL

**Resultado esperado:** Terminal muestra ~35-40 tests PASS (HU-02)

- [x] Implementar `hooks/useAgenda.ts`
- [x] Implementar componentes: AgendaTable, CitaRow, AgendaFilters, EstadoBadge
- [x] Implementar componente compartido `CitaModal.tsx`
- [x] Implementar vista principal `MiAgenda.tsx`
- [ ] Ejecutar `npm run test -- src/ui/agendas/test/integration/HU-02.integration.test.tsx` → ~12 PASS ✓
- [ ] Ejecutar `npm run test -- src/ui/agendas/test/agenda/` → ~12 PASS ✓
- [ ] Ejecutar `npm run test -- src/ui/agendas/test/shared/` → ~8 PASS ✓ (EstadoBadge, CitaModal)
- [ ] Ejecutar `npm run test -- src/ui/agendas/test/pages/MiAgenda.page.test.tsx` → ~8 PASS ✓
- [x] Actualizar `src/ui/agendas/App.tsx`: Ruta `/agendas/mi-agenda` → MiAgenda.tsx (con protección rol PROFESIONAL)

---

### Tarea 2.3 - REFACTOR (HU-02)

Optimizar y pulir HU-02 manteniendo tests en VERDE.

- [X] Limpiar JSX duplicado en tabla y modal
- [X] Extraer mapeo de colores a función reutilizable
- [X] Revisar responsive design en Tailwind
- [X] Ejecutar `npm run test -- src/ui/agendas/test/integration/HU-02.integration.test.tsx` → Todos PASS ✓
- [X] Actualizar `src/ui/agendas/component/index.ts` con exports de componentes HU-02

---

## FASE 3: HISTORIA DE USUARIO 03 - REGISTRO DE CONSULTA

### Tarea 3.1 - SÚPER FASE ROJA (HU-03)

Crear TODOS los archivos de prueba. Los tests deben fallar.

**Archivos de test a crear en `src/ui/agendas/test/`:**

1. **`validators/consultaValidators.test.ts`** (6-8 tests)
   - `validateObservaciones()` - min 10 caracteres (RN-007)
   - `isConsultaEditable()` - no editable si fue guardada (RN-008)

2. **`integration/HU-03.integration.test.tsx`** (10-12 tests)
   - Hook `useConsulta`: obtenerConsulta(), crearConsulta(), guardarConsulta()
   - Guardar cambia Cita.estado a ATENDIDA
   - Valida RN-007, RN-008, RN-005

3. **`consulta/ConsultaForm.test.tsx`** (4-6 tests)
   - Wrapper polimórfico detecta tipoServicio
   - Renderiza subformulario correcto
   - Ejecuta onSave()

4. **`consulta/ConsultaMedicaForm.test.tsx`** (5-6 tests)
   - Campos: Anamnesis, Diagnóstico, Tratamiento, SignosVitales
   - Observaciones obligatorias (RN-007)
   - Campos deshabilitados post-guardado (RN-008)

5. **`consulta/ConsultaOdontologicaForm.test.tsx`** (4-5 tests)
   - Campos: Odontograma, Procedimientos

6. **`consulta/ConsultaPsicologicaForm.test.tsx`** (4-5 tests)
   - Campos: NotasEvolucion, EstadoHumor, NivelAnsiedad (0-100), NivelAutoestima (0-100), Diagnóstico

7. **`consulta/ConsultaSocialForm.test.tsx`** (4-5 tests)
   - Campos: NivelSocioeconomico, DescripcionVivienda

8. **`consulta/SignosVitalesInput.test.tsx`** (4-5 tests)
   - Campos: Peso, Temperatura, PresionArterial, FrecuenciaCardiaca
   - Valida rangos
   - Ejecuta onUpdate()

**Resultado esperado:** Todos los tests fallan

- [ X] Crear todos los archivos de test listados arriba
- [ X] Ejecutar `npm run test -- src/ui/agendas/test/validators/consultaValidators.test.ts` → FAIL
- [ X] Ejecutar `npm run test -- src/ui/agendas/test/integration/HU-03.integration.test.tsx` → FAIL
- [ X] Ejecutar `npm run test -- src/ui/agendas/test/consulta/` → FAIL

---

### Tarea 3.2 - SÚPER FASE VERDE (HU-03)

Implementar TODO el código de producción. Todos los tests de 3.1 deben pasar a VERDE.

**Archivos de código a crear/actualizar en `src/ui/agendas/`:**

1. **`utils/validators/consultaValidators.ts`**
   - `validateObservaciones(obs)` - reject si < 10 chars
   - `isConsultaEditable(consulta)` - check si guardada

2. **`hooks/useConsulta.ts`**
   - `obtenerConsulta(citaId)` → GET /api/consultas/
   - `crearConsulta(citaId, tipo, data)` → POST /api/consultas/
   - `guardarConsulta(citaId, data)` → PATCH /api/consultas/ (actualiza Cita a ATENDIDA)
   - Validaciones: RN-007, RN-008

3. **`component/consulta/ConsultaForm.tsx`** (Wrapper Polimórfico)
   - Props: `tipoServicio`, `citaId`, `onSave()`, `initialData?`
   - Detectar tipo de servicio y renderizar subformulario

4. **`component/consulta/ConsultaMedicaForm.tsx`**
   - Campos especializados para medicina general
   - Usa `SignosVitalesInput`

5. **`component/consulta/ConsultaOdontologicaForm.tsx`**
   - Campos especializados para odontología

6. **`component/consulta/ConsultaPsicologicaForm.tsx`**
   - Campos especializados para psicología
   - Sliders para ansiedad y autoestima (0-100)

7. **`component/consulta/ConsultaSocialForm.tsx`**
   - Campos especializados para trabajo social

8. **`component/consulta/SignosVitalesInput.tsx`**
   - Sub-componente reutilizable
   - Props: `onUpdate(sv)`, `initialData?`

**Resultado esperado:** Terminal muestra ~35-40 tests PASS (HU-03)

- [x] Implementar `consultaValidators.ts`
- [x] Implementar `hooks/useConsulta.ts`
- [x] Implementar ConsultaForm (wrapper) + 4 subformularios especializados
- [x] Implementar `SignosVitalesInput.tsx`
- [x] Actualizar `CitaModal.tsx`: Si estado AGENDADA + profesional + click "Iniciar Consulta" → renderizar ConsultaForm
- [x] Ejecutar `npm run test -- src/ui/agendas/test/validators/consultaValidators.test.ts` → ~8 PASS ✓
- [x] Ejecutar `npm run test -- src/ui/agendas/test/integration/HU-03.integration.test.tsx` → ~12 PASS ✓
- [x] Ejecutar `npm run test -- src/ui/agendas/test/consulta/` → ~20 PASS ✓

---

### Tarea 3.3 - REFACTOR (HU-03)

Optimizar estructura polimórfica manteniendo tests en VERDE.

- [ ] Limpiar duplicados en subformularios (extraer validación común)
- [ ] Mejorar estructura de props en ConsultaForm
- [ ] Revisar campos inmutables post-guardado
- [ ] Ejecutar `npm run test -- src/ui/agendas/test/integration/HU-03.integration.test.tsx` → Todos PASS ✓
- [ ] Actualizar `src/ui/agendas/component/index.ts` con exports de componentes HU-03

---

## FASE 4: HISTORIA DE USUARIO 05 - DERIVACIONES

### Tarea 4.1 - SÚPER FASE ROJA (HU-05)

Crear TODOS los archivos de prueba. Los tests deben fallar.

**Archivos de test a crear en `src/ui/agendas/test/`:**

1. **`validators/derivacionValidators.test.ts`** (6-8 tests)
   - `validateDerivationDestiny()` - servicios diferentes (RN-010)
   - `validateMotivo()` - min 10 caracteres (RN-011)

2. **`integration/HU-05.integration.test.tsx`** (10-12 tests)
   - Hook `useDerivacion`: crearDerivacion(), loadPendientes(), aceptarDerivacion(), rechazarDerivacion()
   - Valida RN-010 (servicios diferentes)
   - Valida RN-011 (motivo obligatorio)
   - Aceptar crea nueva cita en agenda destino

3. **`derivacion/DerivacionModal.test.tsx`** (4-5 tests)
   - Renderiza dropdown servicios destino (excluye actual)
   - Textarea motivo
   - Ejecuta onSubmit()

4. **`derivacion/DerivacionInbox.test.tsx`** (4-5 tests)
   - Carga derivaciones PENDIENTE
   - Renderiza array de DerivacionCard
   - Maneja array vacío

5. **`derivacion/DerivacionCard.test.tsx`** (4-5 tests)
   - Muestra paciente, motivo, servicio origen, fecha
   - Botones Aceptar, Rechazar

6. **`pages/Derivaciones.page.test.tsx`** (6-8 tests)
   - Valida rol PROFESIONAL
   - Carga derivaciones del profesor actual
   - Click Aceptar cambia estado y crea cita
   - Click Rechazar cambia estado

**Resultado esperado:** Todos los tests fallan

- [x] Crear todos los archivos de test listados arriba
- [x] Ejecutar `npm run test -- src/ui/agendas/test/validators/derivacionValidators.test.ts` → FAIL (then PASS after GREEN)
- [x] Ejecutar `npm run test -- src/ui/agendas/test/integration/HU-05.integration.test.tsx` → FAIL (then PASS after GREEN)
- [x] Ejecutar `npm run test -- src/ui/agendas/test/derivacion/` → FAIL (then PASS after GREEN)
- [x] Ejecutar `npm run test -- src/ui/agendas/test/pages/Derivaciones.page.test.tsx` → FAIL (then PASS after GREEN)

---

### Tarea 4.2 - SÚPER FASE VERDE (HU-05)

Implementar TODO el código de producción. Todos los tests de 4.1 deben pasar a VERDE.

**Archivos de código a crear/actualizar en `src/ui/agendas/`:**

1. **`utils/validators/derivacionValidators.ts`**
   - `validateDerivationDestiny(servicioActual, servicioDest)` - diferentes
   - `validateMotivo(motivo)` - min 10 caracteres

2. **`hooks/useDerivacion.ts`**
   - `crearDerivacion(citaId, destinoId, motivo)` → POST /api/derivaciones/
   - `loadPendientes(profesionalId)` → GET /api/derivaciones/pendientes/
   - `aceptarDerivacion(derivacionId)` → PATCH (estado=ACEPTADA, crea cita)
   - `rechazarDerivacion(derivacionId, motivo?)` → PATCH (estado=RECHAZADA)
   - Validaciones: RN-010, RN-011, RN-012

3. **`component/derivacion/DerivacionModal.tsx`**
   - Dropdown servicios destino (excluye actual, solo activos)
   - Textarea motivo (validar min 10)
   - Props: `citaId`, `open`, `onSubmit()`, `onCancel()`

4. **`component/derivacion/DerivacionInbox.tsx`**
   - Props: `profesionalId`, `onAccept?()`, `onReject?()`
   - Usa `useDerivacion` para cargar pendientes
   - Renderiza array de DerivacionCard

5. **`component/derivacion/DerivacionCard.tsx`**
   - Props: `derivacion`, `onAceptar()`, `onRechazar()`
   - Muestra: Paciente, Motivo, Servicio Origen, Fecha
   - Botones Aceptar, Rechazar

6. **`component/pages/Derivaciones.tsx`** (Vista Principal HU-05)
   - Usa componente DerivacionInbox
   - Layout: Bandeja de derivaciones pendientes
   - Validar rol PROFESIONAL

**Resultado esperado:** Terminal muestra ~30-35 tests PASS (HU-05)

- [x] Implementar `derivacionValidators.ts`
- [x] Implementar `hooks/useDerivacion.ts`
- [x] Implementar componentes: DerivacionModal, DerivacionInbox, DerivacionCard
- [x] Implementar vista principal `Derivaciones.tsx`
- [x] Actualizar `CitaModal.tsx`: Si estado ATENDIDA + profesional → mostrar botón "Derivar Paciente" → abre DerivacionModal
- [x] Ejecutar `npm run test -- src/ui/agendas/test/validators/derivacionValidators.test.ts` → 7 PASS ✓
- [x] Ejecutar `npm run test -- src/ui/agendas/test/integration/HU-05.integration.test.tsx` → 11 PASS ✓
- [x] Ejecutar `npm run test -- src/ui/agendas/test/derivacion/` → 21 PASS ✓ (7+7+7)
- [x] Ejecutar `npm run test -- src/ui/agendas/test/pages/Derivaciones.page.test.tsx` → 8 PASS ✓
- [x] Actualizar `src/ui/agendas/App.tsx`: Ruta `/agendas/derivaciones` → Derivaciones.tsx (con protección rol PROFESIONAL)

---

### Tarea 4.3 - REFACTOR (HU-05) ✅ COMPLETADA

Revisar trazabilidad y auditoría manteniendo tests en VERDE.

- [x] Verificar que todas las derivaciones registren: remitente_id (`profesional_origen_id`), `usuario_id` (añadido), motivo, fecha_creacion, cambios de estado (estado + fecha_respuesta)
- [x] Limpiar código duplicado: extraer strings hardcodeadas a `messages.ts` (derivacion section), usar constantes en todos los componentes
- [x] Ejecutar `npm run test -- src/ui/agendas/test/integration/HU-05.integration.test.tsx` → Todos PASS ✓
- [x] Actualizar `src/ui/agendas/component/index.ts` con exports de componentes HU-05 (DerivacionModal, DerivacionInbox, DerivacionCard ✓ ya estaban)

---

## FASE 5: HISTORIA DE USUARIO 04 - CERTIFICADOS (ITERACIÓN 2)

### Tarea 5.1 - SÚPER FASE ROJA (HU-04) ✅ COMPLETADA

Crear TODOS los archivos de prueba. Los tests deben fallar.

**Archivos de test a crear en `src/ui/agendas/test/`:**

1. **`validators/certificadoValidators.test.ts`** (5 tests)
   - `canGenerateCertificate()` - solo si Cita.estado = ATENDIDA (RN-009)

2. **`integration/HU-04.integration.test.tsx`** (6 tests)
   - Hook `useCertificado`: generarCertificado(), descargarPDF()
   - Valida RN-009 (solo ATENDIDA)
   - Registra descarga para auditoría

3. **`shared/CertificateButton.test.tsx`** (6 tests)
   - Botón visible solo si estado = ATENDIDA
   - Botón deshabilitado si estado ≠ ATENDIDA
   - Click descarga sin errores
   - Muestra loader durante descarga

**Resultado esperado:** Todos los tests fallan

- [x] Crear archivos de test (5 + 6 + 6 = 17 tests total)
- [x] Ejecutar `npm run test -- src/ui/agendas/test/validators/certificadoValidators.test.ts` → FAIL ✓ (Cannot find module)
- [x] Ejecutar `npm run test -- src/ui/agendas/test/integration/HU-04.integration.test.tsx` → 6/6 FAIL ✓ (useCertificado stub returns {})
- [x] Ejecutar `npm run test -- src/ui/agendas/test/shared/CertificateButton.test.tsx` → 3/6 FAIL ✓ (placeholder, no button rendered)

---

### Tarea 5.2 - SÚPER FASE VERDE (HU-04) ✅ COMPLETADA

Implementar TODO el código de producción. Todos los tests de 5.1 deben pasar a VERDE.

**Archivos de código a crear/actualizar en `src/ui/agendas/`:**

1. **`utils/validators/certificadoValidators.ts`**
   - `canGenerateCertificate(cita)` - true si estado = ATENDIDA

2. **`hooks/useCertificado.ts`**
   - `generarCertificado(citaId)` → GET /api/citas/{id}/certificado/ (obtiene datos)
   - `descargarPDF(datos)` → POST /api/certificados/ → Dispara descarga del archivo
   - Validación: RN-009
   - Registro de auditoría (timestamp, usuario)

3. **`services/api/certificadoService.ts`**
   - `getCertificadoData(citaId)` → GET
   - `downloadCertificadoPDF(citaId)` → POST (retorna Blob)

4. **`component/shared/CertificateButton.tsx`**
   - Props: `citaId`, `estado`, `onSuccess?()`, `onError?()`
   - Usa hook `useCertificado`
   - Botón visible solo si estado = ATENDIDA (RN-009)
   - Loader durante descarga
   - Success notification al completar

**Resultado esperado:** Terminal muestra ~15-18 tests PASS (HU-04)

- [x] Implementar `certificadoValidators.ts`
- [x] Implementar `hooks/useCertificado.ts`
- [x] Implementar `certificadoService.ts`
- [x] Implementar `CertificateButton.tsx`
- [x] Actualizar `CitaModal.tsx`: Si estado ATENDIDA + profesional → mostrar CertificateButton junto a botón "Derivar"
- [x] Ejecutar `npm run test -- src/ui/agendas/test/validators/certificadoValidators.test.ts` → 5 PASS ✓
- [x] Ejecutar `npm run test -- src/ui/agendas/test/integration/HU-04.integration.test.tsx` → 6 PASS ✓
- [x] Ejecutar `npm run test -- src/ui/agendas/test/shared/CertificateButton.test.tsx` → 6 PASS ✓

---

### Tarea 5.3 - REFACTOR (HU-04) ✅ COMPLETADA

Pulido final de accesibilidad y cobertura.

- [x] Agregar ARIA roles en CertificateButton (`role="button"`, `aria-busy`, `aria-label`)
- [x] Labels accesibles para botón (`aria-label` con mensaje descriptivo)
- [x] Tests de accesibilidad (keyboard navigation: Enter key test agregado)
- [x] Ejecutar `npm run test -- src/ui/agendas/test/integration/HU-04.integration.test.tsx` → 6 PASS ✓
- [x] Actualizar `src/ui/agendas/component/index.ts` con exports de componentes HU-04 (CertificateButton ✓ ya estaba)

---

## INTEGRACIÓN Y VALIDACIÓN FINAL

- [ ] **Tarea Final.1 - Integración Completa**
  - Ejecutar `npm run test -- src/ui/agendas/test/` → Todos los tests PASS (150+)
  - Ejecutar `npm run build` sin errores
  - Verificar que no hay console warnings/errors

- [ ] **Tarea Final.2 - Cobertura de Tests**
  - Ejecutar `npm run test:coverage -- src/ui/agendas/`
  - Target: 80%+ cobertura
  - Generar reporte

- [ ] **Tarea Final.3 - Documentación**
  - Crear/actualizar `src/ui/agendas/README.md`
  - Incluir instrucciones de tests y estructura

---

## RESUMEN DE MACRO-BATCHING

| Fase | HU | Súper Tarea ROJA | Súper Tarea VERDE | REFACTOR | Tests |
|------|----|-----------------|--------------------|----------|-------|
| 0 | Setup | - | Tarea 0.1, 0.2 | - | ~5 |
| 1 | HU-01 | Tarea 1.1 | Tarea 1.2 | Tarea 1.3 | ~62 |
| 2 | HU-02 | Tarea 2.1 | Tarea 2.2 | Tarea 2.3 | ~40 |
| 3 | HU-03 | Tarea 3.1 | Tarea 3.2 | Tarea 3.3 | ~40 |
| 4 | HU-05 | Tarea 4.1 | Tarea 4.2 | Tarea 4.3 | ~35 |
| 5 | HU-04 | Tarea 5.1 | Tarea 5.2 | Tarea 5.3 | ~18 |

**Total: 18 Súper Tareas (Macro-Batching) = Desarrollo rápido y enfocado**

---

## NOTAS IMPORTANTES

1. **Reutilización de Componentes:** CitaModal se crea en HU-02 pero se actualiza en HU-03, HU-04, HU-05
2. **Orden de Ejecución:** Seguir orden lineal: Fase 0 → 1 → 2 → 3 → 4 → 5
3. **Variables CSS:** Usar `--hc-bg`, `--btn-primary-bg`, `--btn-danger-bg`, etc. con Tailwind arbitrarias
4. **Tests Ejecutables:** Cada Súper Tarea VERDE debe pasar 100% de sus tests
5. **Git Commits:** Un commit por Súper Tarea (3 commits por HU: ROJA, VERDE, REFACTOR)
