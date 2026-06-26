# Guía de Desarrollo — MediCampus Mobile App

App móvil del módulo de Seguridad de MediCampus, construida con React Native (Expo SDK 54).

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
   Para obtener tu IP local ejecutá `ip addr show | grep "inet "` en Linux.

3. **Runtime override**: La app también permite cambiar la URL desde el menú Settings (engranaje ⚙️) sin reconstruir. Ese valor se guarda en AsyncStorage y tiene prioridad sobre el `.env`.

## Ejecutar en desarrollo

```bash
npx expo start
```
Escaneá el QR con Expo Go en tu celular (misma red WiFi).

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
│   ├── utils/               # Temas, colores
│   ├── ui/
│   │   ├── components/      # Componentes reutilizables (Button, Input, Card, etc.)
│   │   ├── global/          # LandingScreen, HomeScreen
│   │   └── seguridad/       # Módulo de seguridad
│   │       ├── context/     # AuthContext
│   │       ├── components/  # Sidebar, SidebarContext
│   │       ├── utils/       # authApi.ts, apiClient.ts, jwtUtils.ts
│   │       └── views/       # Login, Register, ForgotPassword, Dashboard, etc.
├── .env.example             # Template para variables de entorno
├── .gitignore               # Ignora node_modules/, .env, android/, ios/
├── app.json                 # Configuración Expo (nombre, slug, íconos, permisos)
├── babel.config.js          # Preset de Babel para Expo
├── eas.json                 # Configuración EAS Build
└── GUIA.md                  # Este archivo
```

## Notas

- La app usa HTTP (no HTTPS). Para que funcione en Android se agregó `usesCleartextTraffic="true"` al manifiesto.
- Si el backend usa HTTPS, cambiá las URLs a `https://...`.
- El sidebar usa `Animated` de React Native (no `react-native-reanimated`) por compatibilidad con Expo SDK 54.
- Para auto-descubrimiento del servidor en la red: configurá Avahi/mDNS en el servidor y usá `.local` hostnames.
- `expo-navigation-bar` oculta la barra de navegación del sistema Android al abrir la app (se muestra al deslizar desde abajo).
