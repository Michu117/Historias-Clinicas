# Historias Clínicas — Mobile App

Aplicación móvil del sistema de historias clínicas, desarrollada con **Flutter**.

## Stack

| Componente | Tecnología |
|---|---|
| Framework | Flutter 3.29.2 (Dart 3.7.2) |
| Plataformas | Android, iOS |
| Variables de entorno | `flutter_dotenv` |
| Backend | API REST (ver `.env`) |

## Requisitos

- **Flutter SDK** 3.29.2+
- **Android**: Android SDK 36+ (cmdline-tools, platform-tools)
- **iOS**: macOS con Xcode 16+ (solo compilación)

## Configuración

1. Clonar el repositorio.
2. Copiar `.env.example` a `.env` y ajustar:

```env
API_URL=http://<tu-ip>:8000
```

3. Instalar dependencias:

```bash
flutter pub get
```

## Ejecutar

```bash
# Android (dispositivo/emulador conectado)
flutter run

# Web (Chrome)
flutter run -d chrome
```

## Estructura

```
MobileApp/
├── lib/
│   └── main.dart          # Punto de entrada (carga dotenv + app)
├── android/               # Configuración nativa Android
├── ios/                   # Configuración nativa iOS (requiere macOS)
├── test/                  # Tests unitarios y de widgets
├── .env                   # Variables de entorno (ignorado en git)
├── .env.example           # Template de variables de entorno
└── pubspec.yaml           # Dependencias y assets
```

## Android

Compila y corre directamente en Linux. Se necesita un dispositivo físico con depuración USB habilitada o un emulador.

## iOS

La compilación requiere **macOS con Xcode**. Los archivos de proyecto (`ios/`) están generados y listos para abrir en Xcode desde una Mac.

```bash
# Solo en macOS
cd ios && pod install && cd ..
flutter run
```
