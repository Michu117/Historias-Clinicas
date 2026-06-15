# Tasks - Módulo de Notificaciones (Iteración 2)

## 📋 Estructura de Ejecución
Todos los archivos van en `src/ui/notificaciones/`. Componentes en `component/`, tests en `test/`.
TDD Strict: Test → Implement → Refactor.

---

## 🏃 SPRINT 1: Componentes Atómicos (NotificationBadge + NotificationCard)

### NotificationBadge
- [x] **TEST** Crear `src/ui/notificaciones/test/NotificationBadge.test.tsx` ✅ ROJO (Fase 1)
  - [x] Test: Renderiza número de no leídas correctamente
  - [x] Test: Oculta badge si count = 0
  - [x] Test: Aplica clase CSS para color rojo (no leído)
- [x] **IMPLEMENT** Crear `src/ui/notificaciones/component/NotificationBadge.tsx` ✅ VERDE (Fase 2)
  - [x] Props: `count: number`, `className?: string`
  - [x] Renderiza solo si count > 0
  - [x] Usa clases Tailwind para estilos
  - [x] No imports de globales (componente simple)
- [ ] **REFACTOR** 
  - [ ] Validar alineación con tema global (colores)
  - [ ] Asegurar TypeScript strict sin `any`

### NotificationCard
- [x] **TEST** Crear `src/ui/notificaciones/test/NotificationCard.test.tsx` ✅ ROJO (Fase 1)
  - [x] Test: Renderiza tipo de notificación (cita/derivación)
  - [x] Test: Renderiza mensaje tal cual llega del backend
  - [x] Test: Renderiza timestamp legible
  - [x] Test: Diferencia visual entre no leído (fondo resaltado) vs leído (normal)
  - [x] Test: Botón "Marcar como leída" renderiza solo si estado = 'no_leido'
  - [x] Test: Click en botón dispara `onMarkAsRead(id)` con notificationId
  - [x] Test: Botón muestra loading state mientras `isLoading = true`
- [x] **IMPLEMENT** Crear `src/ui/notificaciones/component/NotificationCard.tsx` ✅ VERDE (Fase 2)
  - [x] Props: `notification: INotification`, `onMarkAsRead: (id: string) => void`, `isLoading?: boolean`
  - [x] Define interface `INotification` con: id, tipo ('cita'|'derivacion'), mensaje, estado ('no_leido'|'leido'), timestamp
  - [x] Renderiza Card.tsx global para contenedor
  - [x] Renderiza Button.tsx global para botón "Marcar como leída"
  - [x] CSS: Estado no leído con fondo claro (gris), leído sin fondo
  - [x] Timestamp formateado con fecha relativa o absoluta
- [ ] **REFACTOR**
  - [ ] Alinear estilos con Button.tsx y Card.tsx global
  - [ ] Validar TypeScript strict
  - [ ] Confirmar imports solo desde componentes globales existentes

---

## 🏃 SPRINT 2: Componente Lista (NotificationList)

### NotificationList
- [ ] **TEST** Crear `src/ui/notificaciones/test/NotificationList.test.tsx`
  - [ ] Test: Renderiza array de notificaciones en orden reciente primero
  - [ ] Test: Renderiza spinner/loading si `isLoading = true`
  - [ ] Test: Renderiza mensaje "No tienes notificaciones" si array vacío
  - [ ] Test: Renderiza error si `error` prop existe
  - [ ] Test: Click en cada card → dispara `onMarkAsRead(id)` con ID correcto
  - [ ] Test: Múltiples notificaciones renderean correctamente
- [ ] **IMPLEMENT** Crear `src/ui/notificaciones/component/NotificationList.tsx`
  - [ ] Props: `notifications: INotification[]`, `isLoading: boolean`, `onMarkAsRead: (id: string) => void`, `error?: string`
  - [ ] Renderiza array con `.map()` componiendo NotificationCard
  - [ ] Renderiza spinner (usa componentes globales si existen, sino div simple)
  - [ ] Renderiza estado vacío
  - [ ] Renderiza error si existe
  - [ ] Ordena por timestamp descendente (más reciente primero)
- [ ] **REFACTOR**
  - [ ] CSS limpio y consistente
  - [ ] Sin lógica de negocio compleja
  - [ ] TypeScript strict

---

## 🏃 SPRINT 3: Orquestador Principal (NotificationCenter)

### NotificationCenter
- [ ] **TEST** Crear `src/ui/notificaciones/test/NotificationCenter.test.tsx`
  - [ ] Test: En mount, dispara hook `useNotifications()`
  - [ ] Test: Renderiza NotificationBadge con count de no leídas
  - [ ] Test: Renderiza NotificationList con datos del hook
  - [ ] Test: Estado inicial: isLoading = true
  - [ ] Test: Tras data: NotificationList recibe notifications del hook
  - [ ] Test: Click en card → dispara hook `useMarkAsRead(notificationId)`
  - [ ] Test: Tras success en mark-read → notificación pasa a `estado: 'leido'` en UI
  - [ ] Test: Badge actualiza count tras mark-read (decrementa en 1)
  - [ ] Test: Error handling: muestra error en NotificationList
- [ ] **IMPLEMENT** Crear `src/ui/notificaciones/component/NotificationCenter.tsx`
  - [ ] Props: Sin props obligatorias (autenticación por JWT en el backend)
  - [ ] Hook: `const { notifications, isLoading, error } = useNotifications()`
  - [ ] Hook: `const { markAsRead, isLoadingMarkRead } = useMarkAsRead()`
  - [ ] State local: actualiza notificaciones localmente tras mark-read exitoso
  - [ ] Renderiza NotificationBadge + NotificationList
  - [ ] Handler `onMarkAsRead(id)` → dispara mutation + actualiza estado local
  - [ ] Manejo de errores: muestra en NotificationList
- [ ] **REFACTOR**
  - [ ] Validar flujo de datos unidireccional
  - [ ] State management limpio
  - [ ] TypeScript strict

---

## 🏃 SPRINT 4: Hooks API y Tests de Aceptación

### Tipos y Configuración
- [ ] **Crear** `src/ui/notificaciones/types.ts`
  - [ ] Interface: `INotification` con id, tipo ('cita'|'derivacion'), mensaje, estado ('no_leido'|'leido'), timestamp
  - [ ] Type: `INotificationType = 'cita' | 'derivacion'`
  - [ ] Type: `INotificationState = 'no_leido' | 'leido'`
- [ ] **Crear** `src/ui/notificaciones/constants.ts`
  - [ ] Strings de UI: "No tienes notificaciones", "Marcar como leída", etc.
  - [ ] Colores o clases si es necesario
- [ ] **Crear** `src/ui/notificaciones/api.ts`
  - [ ] Exportar `API_CONFIG` configurables:
    - [ ] `GET_NOTIFICACIONES: '/api/v1/notificaciones/'`
    - [ ] `MARK_AS_READ: '/api/v1/notificaciones/{id}/leer/'`
  - [ ] Stubs de hooks (implementar en subtasks abajo)

### Hook useNotifications
- [ ] **TEST** Crear o actualizar `src/ui/notificaciones/test/api.test.ts` - `useNotifications`
  - [ ] Test: Hook dispara GET a `API_CONFIG.GET_NOTIFICACIONES` (sin query params)
  - [ ] Test: Retorna `{ notifications: INotification[], isLoading: boolean, error: string | null }`
  - [ ] Test: En mount: loading = true → data llega → loading = false
  - [ ] Test: Si error HTTP: error = mensaje, notifications = []
  - [ ] Test: Mock fetch y valida headers, método GET
  - [ ] Test: Respuesta esperada: `{ "notificaciones": [...] }`
- [ ] **IMPLEMENT** `src/ui/notificaciones/api.ts` - `useNotifications()`
  - [ ] Fetch GET a `API_CONFIG.GET_NOTIFICACIONES` (sin query params, backend filtra por JWT)
  - [ ] Parse JSON response → mapea a `INotification[]`
  - [ ] Retorna `{ notifications, isLoading, error }`
  - [ ] Manejo de errores: try/catch → error message
  - [ ] Llamada en mount (dependencia: [])
- [ ] **REFACTOR**
  - [ ] Validaciones básicas (response.ok, etc.)
  - [ ] Error messages claros

### Hook useMarkAsRead
- [ ] **TEST** Crear o actualizar `src/ui/notificaciones/test/api.test.ts` - `useMarkAsRead`
  - [ ] Test: Hook dispara PATCH a `API_CONFIG.MARK_AS_READ.replace('{id}', notificationId)`
  - [ ] Test: Retorna `{ isLoading: boolean, error: string | null, success: boolean }`
  - [ ] Test: Body es `{}`
  - [ ] Test: Success: 200 OK → success = true
  - [ ] Test: Error: 404 → success = false, error message
  - [ ] Test: Error: 500 → success = false, error message
  - [ ] Test: Mock fetch y valida método PATCH
- [ ] **IMPLEMENT** `src/ui/notificaciones/api.ts` - `useMarkAsRead()`
  - [ ] Retorna función `markAsRead(notificationId: string)` que dispara PATCH
  - [ ] Endpoint: reemplaza `{id}` en `API_CONFIG.MARK_AS_READ`
  - [ ] Body: `{}`
  - [ ] Retorna `{ isLoading, error, success }`
  - [ ] Manejo de errores
- [ ] **REFACTOR**
  - [ ] Validación de ID antes de enviar
  - [ ] TypeScript strict

### Tests de Aceptación HU-12 (Citas)
- [ ] **TEST** `src/ui/notificaciones/test/NotificationCenter.test.tsx` - Caso HU-12
  - [ ] Escenario: Paciente recibe notificación de cita nueva
  - [ ] GIVEN: NotificationCenter montado (autenticado por JWT)
  - [ ] WHEN: `useNotifications` retorna `{ tipo: 'cita', mensaje: 'Nueva cita...', estado: 'no_leido' }`
  - [ ] THEN:
    - [ ] Badge muestra count = 1
    - [ ] Card renderiza tipo 'cita'
    - [ ] Card renderiza mensaje completo
    - [ ] Card muestra estado visual "no leído" (fondo resaltado)
    - [ ] Botón "Marcar como leída" está enabled
    - [ ] Click → PATCH exitoso → estado pasa a 'leido'
    - [ ] Badge actualiza count = 0
    - [ ] Card actualiza estado visual
  - [ ] Test debe pasar sin 100% coverage en otros componentes
- [ ] **VALIDAR** Integración completa HU-12
  - [ ] `useNotifications` trae notificación tipo 'cita'
  - [ ] `useMarkAsRead` marca como leída vía PATCH
  - [ ] UI refleja cambios correctamente

### Tests de Aceptación HU-13 (Derivaciones)
- [ ] **TEST** `src/ui/notificaciones/test/NotificationCenter.test.tsx` - Caso HU-13
  - [ ] Escenario: Profesional recibe notificación de derivación
  - [ ] GIVEN: NotificationCenter montado (autenticado por JWT)
  - [ ] WHEN: `useNotifications` retorna `{ tipo: 'derivacion', mensaje: 'Paciente derivado...', estado: 'no_leido' }`
  - [ ] THEN:
    - [ ] Badge muestra count = 1
    - [ ] Card renderiza tipo 'derivacion'
    - [ ] Card renderiza mensaje con motivo incluido
    - [ ] Card muestra estado visual "no leído"
    - [ ] Botón "Marcar como leída" está enabled
    - [ ] Click → PATCH exitoso → estado pasa a 'leido'
    - [ ] Badge actualiza count = 0
    - [ ] Card actualiza estado visual
  - [ ] Test debe pasar sin 100% coverage en otros componentes
- [ ] **VALIDAR** Integración completa HU-13
  - [ ] `useNotifications` trae notificación tipo 'derivacion'
  - [ ] `useMarkAsRead` marca como leída vía PATCH
  - [ ] UI refleja cambios correctamente

### Archivo de Exports
- [ ] **Crear** `src/ui/notificaciones/index.ts`
  - [ ] Export: `NotificationCenter` (componente principal)
  - [ ] Export: `NotificationBadge`, `NotificationCard`, `NotificationList` (si se usan externamente)
  - [ ] Export: `INotification`, `INotificationType`, `INotificationState` (tipos)
  - [ ] Export: `useNotifications`, `useMarkAsRead` (hooks)

---

## ✅ Validación Final

- [ ] Todos los archivos viven en `src/ui/notificaciones/`
- [ ] Componentes en `component/`, tests en `test/`
- [ ] Sin modificaciones fuera de `src/ui/notificaciones/`
- [ ] Sin adapters, modal, filtros, paginación, WebSocket
- [ ] Endpoints configurables en `api.ts`
- [ ] PATCH usa `/api/v1/notificaciones/{id}/leer/`
- [ ] Imports solo desde componentes globales existentes (`src/ui/components/`)
- [ ] TypeScript strict, sin `any`
- [ ] Todos los tests definidos para HU-12 y HU-13 pasan
- [ ] No 100% coverage requerida, solo casos específicos
- [ ] Backend genera notificaciones, frontend solo consulta/muestra/marca leídas
- [ ] Código listo para PR

---

## 📊 Progress
- [x] Sprint 1: 2/2 componentes completados ✅ VERDE
- [ ] Sprint 2: 0/1 componentes completados
- [ ] Sprint 3: 0/1 componentes completados
- [ ] Sprint 4: 0/6 tareas completadas (tipos, config, hooks, tests)
- **Total: 2/10 tareas principales completadas**
