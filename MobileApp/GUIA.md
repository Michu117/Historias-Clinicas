# Guía de Desarrollo — MediCampus Mobile App

App móvil del módulo de Seguridad de MediCampus.

## Tecnología

- **React Native 0.81** con **Expo SDK 54**
- **TypeScript**
- **React Navigation 7** (native-stack)
- **AsyncStorage** para persistencia local
- **expo-navigation-bar** para ocultar la barra del sistema Android
- **react-native-svg** para íconos en el sidebar

## Requisitos

- Node.js >= 18
- npm
- Java 17+ (para build APK)
- Android SDK (para build APK)

## Setup

```bash
cd MobileApp
npm install
```

## Configurar URL del backend

1. Copiá `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
2. Editá `.env` y poné la IP local de tu servidor:
   ```
   EXPO_PUBLIC_API_URL=http://TU_IP:8000
   ```
   Para obtener tu IP local ejecutá:
   ```bash
   ip addr show | grep "inet "
   ```
   Buscá la IP de tu interfaz de red (ej: `192.168.1.100`).

3. **Runtime override**: La app también permite cambiar la URL desde el menú Settings (engranaje ⚙️) sin reconstruir. Ese valor se guarda en AsyncStorage y tiene prioridad sobre el `.env`.

## Modo desarrollo — `npx expo start`

```bash
npx expo start
```

Esto levanta el **Metro bundler**, que compila JS/TS y lo sirve al dispositivo.

### Opciones útiles

| Comando | Descripción |
|---------|-------------|
| `npx expo start` | Inicia Metro con QR para Expo Go |
| `npx expo start --tunnel` | Usa tunneling (ngrok) si no funciona la LAN |
| `npx expo start --dev-client` | Para development build (APK personalizado) |
| `npx expo start --clear` | Limpia la caché de Metro antes de iniciar |

### Conectar el celular

1. Instalá **Expo Go** desde Play Store en tu celular.
2. Conectate a la **misma red WiFi** que la PC.
3. Escaneá el **código QR** que aparece en la terminal con Expo Go.

> Si el QR no funciona, probá con `--tunnel` o conectá el celular por USB y usá `npx expo start --localhost` con port forwarding.

### Recarga en caliente

- **Guardar archivo** → recarga automática (Fast Refresh).
- **Agitar el celular** → menú de desarrollador (Recargar, Debug JS, etc).
- **Presionar `r`** en la terminal → recargar manualmente.
- **Presionar `m`** en la terminal → abrir menú de desarrollador.

## Generar APK (primera vez)

```bash
# Genera la carpeta android/ con los módulos nativos
npx expo prebuild

# Build APK release
cd android && ./gradlew assembleRelease
```

El APK se genera en:
`android/app/build/outputs/apk/release/app-release.apk`

> Las carpetas `android/` y `ios/` no se suben al repo. Cada desarrollador debe ejecutar `npx expo prebuild` después de `npm install`.

## Generar APK (repetir)

Si solo cambiaste código JS/TS (no módulos nativos nuevos):

```bash
cd android && ./gradlew assembleRelease
```

## Publicar con EAS (alternativa)

```bash
npx eas build --profile preview --platform android
```

## Limpiar y empezar de cero

```bash
rm -rf android/ ios/ node_modules/
npm install
npx expo prebuild
```

## Estructura

```
MobileApp/
├── App.tsx                  # Entry point, navegación raíz
├── src/
│   ├── config.ts            # API URL (build-time + runtime override)
│   ├── navigationRef.ts     # Referencia compartida del navigator
│   ├── api/
│   │   └── client.ts        # Cliente HTTP base (sin usar, reemplazado por apiClient.ts)
│   ├── theme/
│   │   └── global.css        # Estilos globales CSS (para web)
│   ├── types/
│   │   └── index.ts         # Tipos compartidos
│   ├── utils/
│   │   └── theme.ts         # Colores, botones, radios del tema visual
│   ├── ui/
│   │   ├── components/      # Componentes reutilizables (Button, Input, Card, Badge, Select, Modal, Pagination, ToggleSwitch, NotificationBell)
│   │   ├── global/          # LandingScreen, HomeScreen
│   │   └── seguridad/       # Módulo de seguridad
│   │       ├── context/     # AuthContext (login, logout, persistencia, isAdmin)
│   │       ├── components/  # Sidebar (animado), SidebarContext
│   │       ├── hooks/       # useSession
│   │       ├── utils/       # authApi.ts, apiClient.ts, jwtUtils.ts
│   │       └── views/       # Login, Register, ForgotPassword, CambiarClave,
│   │                        # SecurityDashboard, UserManagement, AuditDashboard,
│   │                        # AuditLogDetail, CriticalAlerts, PermissionAssignment,
│   │                        # Settings, Forbidden
├── .env                     # Variables de entorno (no subir al repo)
├── .env.example             # Template para .env
├── .gitignore               # Ignora node_modules/, .env, android/, ios/
├── app.json                 # Configuración Expo (nombre, slug, íconos, permisos)
├── babel.config.js          # Preset de Babel para Expo
├── eas.json                 # Configuración EAS Build
├── package.json             # Dependencias y scripts
├── tsconfig.json            # Configuración de TypeScript
├── index.js                 # Entry point de Expo (registerRootComponent)
└── GUIA.md                  # Este archivo
```

## Notas técnicas

- **HTTP planificado**: La app usa HTTP (no HTTPS). Para que funcione en Android se agregó `usesCleartextTraffic="true"` y `network_security_config.xml` al manifiesto. Si el backend usa HTTPS, cambiá las URLs a `https://...` y modificá la config de seguridad.
- **Sidebar animado**: Usa `Animated` de React Native en lugar de `react-native-reanimated`, porque Reanimated 4 es incompatible con Expo SDK 54 (crash en `NativeWorklets.installTurboModule`).
- **Barra de navegación Android**: `expo-navigation-bar` la oculta al abrir la app. Se puede mostrar deslizando desde abajo (modo `overlay-swipe`).
- **Auto-descubrimiento mDNS**: Configurá Avahi en el servidor y usá hostnames `.local` para que la app encuentre el backend sin IP fija.
- **Runtime API URL**: La URL se puede cambiar desde Settings en cualquier momento, sin reconstruir la app. Se persiste en AsyncStorage y tiene prioridad sobre `.env`.
