# Módulo Agendas

Módulo de gestión de agendas médicas del proyecto MediCampus.

## Arquitectura

```
src/ui/agendas/
├── component/         # Componentes UI
│   ├── agenda/        # Tabla, filas, filtros de agenda
│   ├── consulta/      # Formularios de consulta (HU-03)
│   ├── derivacion/    # Derivación (HU-05)
│   ├── pages/         # Páginas (AgendarCita, MiAgenda, Derivaciones)
│   ├── selectors/     # Selectores (Servicio, Profesional)
│   └── shared/        # Componentes compartidos (CitaModal, CertificateButton, etc.)
├── hooks/             # Custom hooks con lógica de negocio
├── services/api/      # Servicios de API (stubs para integración futura)
├── test/              # Tests unitarios y de integración
├── types/             # Interfaces y tipos TypeScript
└── utils/
    ├── constants/     # Mensajes y constantes
    ├── errors/        # Manejador de errores
    └── validators/    # Validadores de reglas de negocio
```

## Funcionalidades Implementadas (TDD)

| HU | Descripción | Estado |
|---|---|---|
| HU-01 | Agendar Cita (Servicio, Profesional, Fecha) | Completo |
| HU-02 | Visualizar Agenda (Mi Agenda) | Completo |
| HU-03 | Registro de Datos en Consulta Digital | Completo |
| HU-04 | Generar Certificado (RN-009) | Completo |
| HU-05 | Gestionar Derivaciones | Completo |

## Setup

```bash
# Instalar dependencias
npm install

# Ejecutar tests del módulo
npx vitest run src/ui/agendas/

# Ejecutar tests con watch
npx vitest src/ui/agendas/

# Ejecutar tests con coverage (requiere @vitest/coverage-v8 funcional)
npx vitest run --coverage src/ui/agendas/

# Compilar TypeScript
npx tsc --noEmit
```

## Tests

- Framework: **Vitest** + **React Testing Library**
- Enfoque: **TDD** (RED → GREEN → REFACTOR)
- Total: **209 tests** (31 archivos, 100% passing)
- Pruebas unitarias para validadores, hooks y componentes
- Pruebas de integración para flujos completos (HU-02 a HU-05)

### Estructura de Tests

```
test/
├── agenda/           # Tests de componentes de agenda
├── consulta/         # Tests de formularios de consulta
├── integration/      # Tests de integración (HU-02 a HU-05)
├── pages/            # Tests de páginas
├── selectors/        # Tests de selectores
├── shared/           # Tests de componentes compartidos
└── validators/       # Tests de validadores
```

## Reglas de Negocio Implementadas

- **RN-001**: `isDatePast` — valida que una fecha sea pasada
- **RN-002**: `hasConflict` — detecta conflictos de horario
- **RN-003**: `hasCitaSameDayService` — evita citas duplicadas mismo día/servicio
- **RN-004**: `isServiceActive` — solo servicios activos
- **RN-005**: `validateUserRole` — validación de rol por JWT
- **RN-009**: `canGenerateCertificate` — solo citas ATENDIDA generan certificado

## Convenciones

- Tailwind CSS (escala de grises)
- TypeScript estricto
- Nombres de componentes en PascalCase
- Nombres de hooks con prefijo `use`
- Mensajes de error en español (constantes en `messages.ts`)
- `estado` de cita tipado como `EstadoCita` enum
