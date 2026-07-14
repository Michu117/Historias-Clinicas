# MediCampus – Sistema de Historias Clínicas

MediCampus es una aplicación web para la gestión de los servicios de Bienestar Universitario. El sistema permite administrar usuarios, roles, citas, servicios médicos, historias clínicas, atenciones, reportes y notificaciones.

El proyecto está compuesto por:

- Un **backend** desarrollado con Django y Django REST Framework.
- Un **frontend** desarrollado con React, TypeScript y Vite.
- Autenticación mediante JSON Web Tokens.
- Control de acceso basado en roles.
- Generación de reportes y archivos PDF.
- Documentación interactiva de la API.
- Pruebas automatizadas.

---

## Funcionalidades principales

- Registro e inicio de sesión.
- Autenticación mediante JWT.
- Administración de usuarios y roles.
- Gestión de citas y agendas.
- Administración de servicios clínicos.
- Registro de atenciones médicas.
- Gestión de historias clínicas.
- Gestión de casos y documentos.
- Generación de reportes estadísticos.
- Exportación de información en PDF y CSV.
- Gestión de notificaciones.
- Restricción de rutas según el rol del usuario.
- Panel administrativo de Django.
- Documentación de endpoints mediante Swagger y ReDoc.

---

# Tecnologías utilizadas

## Backend

- Python
- Django 6
- Django REST Framework
- SimpleJWT
- Django Filter
- DRF Spectacular
- Django CORS Headers
- ReportLab
- PostgreSQL
- SQLite para desarrollo local
- Pytest
- Pytest Django
- Pytest Coverage
- Python Dotenv

## Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS 3
- Axios
- Fetch API
- Chart.js
- React Context
- Hooks personalizados

---

# Arquitectura general

El backend está dividido en aplicaciones Django según su responsabilidad:

```text
Seguridad/
Agendas/
Historias/
Reportes/
Notificaciones/
HistoriasClinicas/
```

Cada módulo puede contener los siguientes archivos:

```text
models.py
serializers.py
services.py
views.py
urls.py
tests.py
```

La responsabilidad de cada capa es:

- `models.py`: define las entidades y relaciones de la base de datos.
- `serializers.py`: valida y transforma los datos enviados o recibidos por la API.
- `services.py`: contiene la lógica de negocio.
- `views.py`: procesa las solicitudes HTTP.
- `urls.py`: define las rutas de la aplicación.
- `tests.py`: contiene las pruebas automatizadas.

El frontend sigue una arquitectura modular basada en:

```text
src/
├── ui/
├── seguridad/
├── agendas/
├── historias-clinicas/
├── reportes/
├── notificaciones/
├── theme/
├── api.ts
├── App.tsx
└── main.tsx
```

El flujo general del frontend es:

```text
Página o vista
    ↓
Hook personalizado
    ↓
Servicio HTTP
    ↓
API REST de Django
    ↓
Base de datos
```

---

# Requisitos previos

Antes de instalar el proyecto se necesita:

- Git.
- Python 3.12 o superior.
- pip.
- Node.js 18 o superior.
- npm.
- PostgreSQL, únicamente si se utilizará esa base de datos.
- Un editor de código, como Visual Studio Code.

## Verificar Git

```bash
git --version
```

## Verificar Python

### Windows

```bash
py --version
```

También puede utilizarse:

```bash
python --version
```

### Linux o macOS

```bash
python3 --version
```

## Verificar pip

```bash
pip --version
```

## Verificar Node.js y npm

```bash
node --version
npm --version
```

Si alguno de estos comandos no muestra una versión, se debe instalar la herramienta correspondiente antes de continuar.

> En Windows, durante la instalación de Python se recomienda seleccionar la opción `Add Python to PATH`.

---

# Instalación del proyecto

## 1. Clonar el repositorio

Abre una terminal en la carpeta donde deseas guardar el proyecto y ejecuta:

```bash
git clone https://github.com/Michu117/Historias-Clinicas.git
```

Ingresa al repositorio:

```bash
cd Historias-Clinicas
```

---

# Instalación del backend

## 2. Ubicar la carpeta del backend

Debes ingresar a la carpeta que contiene el archivo:

```text
manage.py
```

Dependiendo de la estructura utilizada en el repositorio, puede ser necesario ejecutar:

```bash
cd HistoriasClinicas
```

Comprueba el contenido de la carpeta.

### Windows

```bash
dir
```

### Linux o macOS

```bash
ls
```

Debes observar un archivo llamado:

```text
manage.py
```

No continúes hasta encontrarte en la misma carpeta que contiene `manage.py`.

---

## 3. Crear un entorno virtual

El entorno virtual permite instalar las dependencias del proyecto sin afectar otras instalaciones de Python.

### Windows con CMD

```bash
py -m venv venv
venv\Scripts\activate
```

### Windows con PowerShell

```powershell
py -m venv venv
venv\Scripts\Activate.ps1
```

Si PowerShell bloquea la activación, ejecuta:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Después vuelve a ejecutar:

```powershell
venv\Scripts\Activate.ps1
```

### Linux o macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Cuando el entorno virtual esté activo, la terminal mostrará algo parecido a:

```text
(venv)
```

Cada vez que se abra una nueva terminal se debe volver a activar el entorno virtual.

---

## 4. Actualizar pip

```bash
python -m pip install --upgrade pip
```

En Linux también puede utilizarse:

```bash
python3 -m pip install --upgrade pip
```

---

## 5. Instalar las dependencias del backend

Ejecuta (desde la carpeta del repositorio):

```bash
pip install -r requirements.txt
```

> El archivo `requirements.txt` se encuentra en la raíz del repositorio. Si ya ingresaste a `HistoriasClinicas/`, usa `pip install -r ../requirements.txt`.

Verifica la instalación de Django:

```bash
python -m django --version
```

---

# Configuración del backend

## 6. Crear el archivo de variables de entorno

Las variables sensibles se cargan desde un archivo `.env` ubicado en la **raíz del repositorio** (junto a `requirements.txt`). Crea el archivo:

```text
.env
```

Agrega el siguiente contenido para la configuración de correo electrónico (las notificaciones del sistema usan Gmail SMTP):

```env
# Configuración SMTP de Gmail para el módulo de Notificaciones
# 1. Activa la verificación en dos pasos en tu cuenta de Google
# 2. Genera una contraseña de aplicación en: https://myaccount.google.com/apppasswords
# 3. Copia la contraseña de 16 caracteres

EMAIL_HOST_USER=tu.correo@gmail.com
EMAIL_HOST_PASSWORD=abcd1234efgh5678
DEFAULT_FROM_EMAIL=MediCampus <tu.correo@gmail.com>
```

> El backend usa SQLite por defecto, `SECRET_KEY` y `DEBUG` están configurados para desarrollo local, por lo que no es necesario definirlos en `.env`.

El archivo `.env` no debe subirse al repositorio.

---

## 7. Archivo `.env.example`

El repositorio ya incluye un archivo `.env.example` con las variables necesarias:

```env
EMAIL_HOST_USER=tu.correo@gmail.com
EMAIL_HOST_PASSWORD=abcd1234efgh5678
DEFAULT_FROM_EMAIL=MediCampus <tu.correo@gmail.com>
```

---

## 8. Configurar `.gitignore`

El archivo `.gitignore` debe contener, como mínimo:

```gitignore
# Variables de entorno
.env

# Entornos virtuales
venv/
.venv/
env/

# Python
__pycache__/
*.py[cod]
*$py.class

# Django
staticfiles/
media/

# Base de datos local
db.sqlite3

# Pytest
.pytest_cache/
.coverage
htmlcov/

# Visual Studio Code
.vscode/

# PyCharm
.idea/

# Archivos del sistema
.DS_Store
Thumbs.db
```

> No se debe subir información clínica real, contraseñas, tokens ni bases de datos con información privada.

---

# Configuración de la base de datos

El proyecto ya viene configurado con SQLite por defecto (no requiere instalar un servidor de base de datos). Django creará automáticamente el archivo `db.sqlite3` al ejecutar las migraciones.

Para desarrollo local, puedes continuar directamente en la sección **Aplicar las migraciones**.

---

## Opción alternativa: PostgreSQL

Si deseas usar PostgreSQL en lugar de SQLite, primero debes tenerlo instalado y en ejecución, y luego modificar `settings.py` manualmente.

### Crear la base de datos

Ingresa a PostgreSQL:

```bash
psql -U postgres
```

Crea la base de datos:

```sql
CREATE DATABASE historias_clinicas;
```

Crea un usuario:

```sql
CREATE USER historias_user WITH PASSWORD 'cambiar_contrasena';
```

Concede permisos:

```sql
GRANT ALL PRIVILEGES ON DATABASE historias_clinicas TO historias_user;
```

En versiones recientes de PostgreSQL también puede ser necesario conectarse a la base de datos:

```sql
\c historias_clinicas
```

Y conceder permisos sobre el esquema público:

```sql
GRANT ALL ON SCHEMA public TO historias_user;
```

Sal de PostgreSQL:

```sql
\q
```

### Configurar la base de datos en `HistoriasClinicas/HistoriasClinicas/settings.py`

Reemplaza el bloque `DATABASES` por:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "historias_clinicas",
        "USER": "historias_user",
        "PASSWORD": "cambiar_contrasena",
        "HOST": "localhost",
        "PORT": "5432",
    }
}
```

> Solo se debe utilizar una configuración de base de datos: SQLite o PostgreSQL. No ambas al mismo tiempo.

---

# Preparación del backend

## 9. Aplicar las migraciones

Las migraciones crean las tablas necesarias en la base de datos.

Ejecuta:

```bash
python manage.py makemigrations
```

Después:

```bash
python manage.py migrate
```

Si todo funciona correctamente, Django mostrará diferentes migraciones terminadas en:

```text
OK
```

Comprueba las migraciones aplicadas:

```bash
python manage.py showmigrations
```

Las migraciones aplicadas aparecerán marcadas con:

```text
[X]
```

---

## 10. Crear un superusuario

El superusuario permite acceder al panel administrativo de Django.

Ejecuta:

```bash
python manage.py createsuperuser
```

El sistema solicitará información como:

```text
Correo electrónico:
Nombre:
Apellido:
Contraseña:
Confirmación de contraseña:
```

Los campos pueden variar dependiendo del modelo personalizado de usuario.

Mientras se escribe la contraseña, la terminal no mostrará caracteres. Este comportamiento es normal.

---

## 11. Cargar datos iniciales

Si el proyecto incluye datos iniciales o fixtures, se pueden cargar mediante:

```bash
python manage.py loaddata nombre_del_archivo.json
```

Por ejemplo:

```bash
python manage.py loaddata datos_iniciales.json
```

Si el proyecto no incluye archivos JSON de datos iniciales, este paso se puede omitir.

Los roles, servicios y usuarios también pueden crearse desde el panel administrativo.

---

## 12. Comprobar la configuración

Antes de ejecutar el servidor, utiliza:

```bash
python manage.py check
```

El resultado esperado es:

```text
System check identified no issues
```

---

## 13. Ejecutar el backend

```bash
python manage.py runserver
```

El resultado debe mostrar una dirección similar a:

```text
Starting development server at http://127.0.0.1:8000/
```

El backend estará disponible en:

```text
http://127.0.0.1:8000/
```

Para detener el servidor:

```text
Ctrl + C
```

---

# Panel administrativo

Con el backend en ejecución, abre:

```text
http://127.0.0.1:8000/admin/
```

Inicia sesión con el superusuario creado anteriormente.

Desde el panel administrativo se pueden gestionar los modelos registrados, entre ellos:

- Roles.
- Usuarios.
- Servicios.
- Citas.
- Atenciones.
- Historias clínicas.
- Casos.
- Reportes.
- Notificaciones.

La disponibilidad de cada sección depende de los modelos registrados en sus respectivos archivos `admin.py`.

---

# Documentación de la API

El proyecto utiliza DRF Spectacular para generar documentación basada en OpenAPI.

Las direcciones habituales son:

## Swagger UI

```text
http://127.0.0.1:8000/api/docs/
```

## ReDoc

```text
http://127.0.0.1:8000/api/redoc/
```

## Esquema OpenAPI

```text
http://127.0.0.1:8000/api/schema/
```

Swagger permite:

- Consultar los endpoints disponibles.
- Revisar métodos HTTP.
- Ver parámetros requeridos.
- Consultar ejemplos de solicitudes y respuestas.
- Autorizar peticiones mediante JWT.
- Probar endpoints desde el navegador.

---

# Autenticación JWT

La API utiliza JSON Web Tokens mediante SimpleJWT.

## Registrar un usuario

```http
POST /api/v1/auth/register
```

Ejemplo de solicitud:

```json
{
  "correo": "usuario@ejemplo.com",
  "clave": "Contrasena123",
  "nombre": "Usuario",
  "apellido": "Ejemplo",
  "cedula": "1100000000"
}
```

## Iniciar sesión

```http
POST /api/v1/auth/login
```

Ejemplo:

```json
{
  "correo": "usuario@ejemplo.com",
  "clave": "Contrasena123"
}
```

La respuesta debe incluir tokens similares a:

```json
{
  "access": "token_de_acceso",
  "refresh": "token_de_actualizacion"
}
```

## Utilizar el token

Los endpoints protegidos requieren el siguiente encabezado:

```http
Authorization: Bearer TOKEN_DE_ACCESO
```

Ejemplo con `curl`:

```bash
curl http://127.0.0.1:8000/api/v1/agendas/citas/ \
  -H "Authorization: Bearer TOKEN_DE_ACCESO"
```

Reemplaza `TOKEN_DE_ACCESO` por el token obtenido al iniciar sesión.

## Renovar el token

```http
POST /api/token/refresh/
```

Cuerpo de la petición:

```json
{
  "refresh": "TOKEN_DE_ACTUALIZACION"
}
```

Respuesta esperada:

```json
{
  "access": "NUEVO_TOKEN_DE_ACCESO"
}
```

---

# Endpoints principales

## Seguridad

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/users
GET    /api/v1/auth/users/{id}
POST   /api/token/
POST   /api/token/refresh/
```

## Agendas

```text
GET    /api/v1/agendas/citas/
POST   /api/v1/agendas/citas/
GET    /api/v1/agendas/citas/{id}/
PUT    /api/v1/agendas/citas/{id}/
PATCH  /api/v1/agendas/citas/{id}/
DELETE /api/v1/agendas/citas/{id}/
```

## Servicios (solo lectura)

```text
GET    /api/v1/agendas/servicios/
GET    /api/v1/agendas/servicios/{id}/
```

## Consultas

```text
POST   /api/v1/agendas/consultas/
GET    /api/v1/agendas/consultas/{id}/
```

## Historias clínicas

```text
GET    /api/v1/historias/historias_clinicas/
POST   /api/v1/historias/historias_clinicas/
GET    /api/v1/historias/casos/
PATCH  /api/v1/historias/casos/{id}/
```

## Reportes

```text
GET    /api/v1/reportes/
POST   /api/v1/reportes/
GET    /api/v1/reportes/{id}/
GET    /api/v1/reportes/atenciones/
GET    /api/v1/reportes/estadisticas/
GET    /api/v1/reportes/diagnosticos-frecuentes/
GET    /api/v1/reportes/servicios-mas-usados/
```

## Notificaciones

```text
GET    /api/v1/notificaciones/
POST   /api/v1/notificaciones/
GET    /api/v1/notificaciones/{id}/
PATCH  /api/v1/notificaciones/{id}/leer/
PATCH  /api/v1/notificaciones/marcar-como-leidas/
```

---

# Instalación del frontend

## 17. Ubicar la carpeta del frontend

Desde la raíz del repositorio, ingresa a la carpeta que contiene el archivo:

```text
package.json
```

El nombre de la carpeta es:

```text
MediCampus-FrontEnd
```

Ingresa a ella:

```bash
cd MediCampus-FrontEnd
```

Comprueba que contiene `package.json`.

### Windows

```bash
dir
```

### Linux o macOS

```bash
ls
```

---

## 18. Instalar las dependencias del frontend

```bash
npm install
```

Este comando instalará todas las dependencias indicadas en `package.json`.

---

## 19. (Opcional) Crear las variables de entorno del frontend

El frontend ya funciona con el proxy de Vite (configurado en `vite.config.ts`), por lo que no es necesario crear un archivo `.env`. Si deseas sobrescribir la URL base del backend, crea en la carpeta del frontend:

```text
.env
```

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

> **Nota:** Algunos módulos del frontend usan rutas relativas del proxy (`/api/...`) y otros la URL base. Si estableces `VITE_API_BASE_URL`, ciertos módulos pueden no funcionar correctamente. Para desarrollo local se recomienda **no crearlo** y dejar que el proxy maneje las rutas.

Las variables de Vite deben comenzar con `VITE_`.

---

## 20. Configuración del proxy de Vite

El frontend puede comunicarse con Django utilizando el proxy de Vite.

Ejemplo de configuración en `vite.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/backend': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, ''),
      },
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
```

El proxy permite utilizar rutas como:

```text
/api/v1/auth
/backend/api/v1/reportes
```

sin escribir directamente la dirección completa del backend en cada servicio.

---

## 21. Ejecutar el frontend

```bash
npm run dev
```

Vite mostrará una dirección similar a:

```text
http://localhost:5173/
```

Abre esa dirección en el navegador.

Para detener el frontend:

```text
Ctrl + C
```

---

# Ejecución completa del sistema

Para usar la aplicación completa se necesitan dos terminales.

## Terminal 1: backend

Ubícate en la carpeta que contiene `manage.py`.

Activa el entorno virtual.

### Windows

```bash
venv\Scripts\activate
```

### Linux o macOS

```bash
source venv/bin/activate
```

Ejecuta Django:

```bash
python manage.py runserver
```

El backend funcionará en:

```text
http://127.0.0.1:8000/
```

## Terminal 2: frontend

Ubícate en la carpeta que contiene `package.json`:

```bash
cd MediCampus-FrontEnd
```

Ejecuta:

```bash
npm run dev
```

El frontend funcionará normalmente en:

```text
http://localhost:5173/
```

Ambos servidores deben permanecer activos mientras se utiliza la aplicación.

---

# Uso básico del sistema

## 1. Abrir la aplicación

Ingresa desde el navegador a:

```text
http://localhost:5173/
```

## 2. Registrar o crear usuarios

Dependiendo de los permisos habilitados, los usuarios pueden registrarse desde la pantalla de registro o ser creados por un administrador.

## 3. Iniciar sesión

Ingresa con el correo y contraseña de una cuenta registrada.

El frontend almacenará la información de autenticación y enviará el token JWT en las peticiones protegidas.

## 4. Acceso según roles

El contenido disponible dependerá del rol del usuario.

Ejemplos de roles:

- Administrador.
- Médico.
- Psicólogo.
- Odontólogo.
- Trabajador social.
- Paciente.

Las rutas protegidas verifican la autenticación y los permisos antes de permitir el acceso.

## 5. Gestión de citas

Desde el módulo de agendas se pueden:

- Consultar citas.
- Registrar nuevas citas.
- Modificar citas.
- Cancelar citas.
- Asignar servicios.
- Consultar atenciones.
- Registrar derivaciones.

## 6. Historias clínicas

El módulo de historias clínicas permite:

- Consultar historias.
- Registrar información clínica.
- Gestionar antecedentes.
- Administrar documentos.
- Consultar casos.
- Revisar información asociada al paciente.

## 7. Reportes

El módulo de reportes permite consultar información como:

- Cantidad de atenciones.
- Estadísticas por rango de fechas.
- Diagnósticos frecuentes.
- Servicios más utilizados.
- Consultas agrupadas por género.
- Información por profesional.
- Exportaciones en PDF o CSV.

## 8. Notificaciones

El usuario puede:

- Consultar sus notificaciones.
- Marcar una notificación como leída.
- Marcar todas las notificaciones como leídas.
- Recibir avisos relacionados con citas y atenciones.

---

# Formato de las respuestas de la API

Las respuestas de la API pueden utilizar una estructura uniforme similar a:

```typescript
interface ApiWrapper<T = unknown> {
  success: boolean
  message: string
  data: T | null
  errors?: Record<string, unknown> | null
}
```

Ejemplo de respuesta exitosa:

```json
{
  "success": true,
  "message": "Operación realizada correctamente",
  "data": {
    "id": 1
  },
  "errors": null
}
```

Ejemplo de error:

```json
{
  "success": false,
  "message": "No se pudo completar la operación",
  "data": null,
  "errors": {
    "correo": [
      "Este correo ya está registrado."
    ]
  }
}
```

---

# Ejecución de pruebas

## Pruebas del backend

Desde la carpeta que contiene `manage.py`, activa el entorno virtual y ejecuta:

```bash
pytest
```

Para mostrar más información:

```bash
pytest -v
```

Para generar un reporte de cobertura:

```bash
pytest --cov
```

Para generar un reporte HTML:

```bash
pytest --cov --cov-report=html
```

Después abre:

```text
htmlcov/index.html
```

También se pueden ejecutar pruebas de un módulo específico:

```bash
pytest Agendas/
```

```bash
pytest Notificaciones/
```

```bash
pytest Reportes/
```

---

## Pruebas del frontend

Si el proyecto tiene configurado un comando de pruebas en `package.json`, ejecútalo desde la carpeta del frontend:

```bash
npm test
```

O, dependiendo de la configuración:

```bash
npm run test
```

Para revisar los scripts disponibles:

```bash
npm run
```

---

# Errores frecuentes

## `python` no se reconoce como comando

En Windows prueba:

```bash
py manage.py runserver
```

En Linux o macOS prueba:

```bash
python3 manage.py runserver
```

---

## `No module named django`

El entorno virtual no está activo o las dependencias no se instalaron.

Activa el entorno virtual y ejecuta (desde la raíz del repositorio o con la ruta adecuada):

```bash
pip install -r ../requirements.txt
```

---

## `No module named dotenv`

Ejecuta:

```bash
pip install python-dotenv
```

---

## `No module named psycopg2`

Ejecuta:

```bash
pip install psycopg2-binary
```

---

## Error de conexión con PostgreSQL

Comprueba:

- Que PostgreSQL esté iniciado.
- Que la base de datos exista.
- Que el usuario y contraseña sean correctos.
- Que el puerto configurado sea `5432`.
- Que las variables del archivo `.env` sean correctas.

---

## Error `relation does not exist`

Las migraciones no se han aplicado.

Ejecuta:

```bash
python manage.py migrate
```

---

## Error de migraciones pendientes

Ejecuta:

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## Error `401 Unauthorized`

Posibles causas:

- No se envió el token.
- El token expiró.
- El formato del encabezado es incorrecto.

Formato correcto:

```http
Authorization: Bearer TOKEN_DE_ACCESO
```

---

## Error `403 Forbidden`

El usuario está autenticado, pero su rol no tiene permiso para realizar la operación.

Ingresa con una cuenta que tenga el rol requerido.

---

## Error de CORS

El proyecto tiene `CORS_ALLOW_ALL_ORIGINS = True` en desarrollo, por lo que no deberían haber errores de CORS. Si ocurren, comprueba que el frontend esté en los orígenes permitidos en `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
```

Después reinicia el servidor de Django.

---

## El frontend no se conecta con Django

Comprueba que:

1. Django esté ejecutándose en:

```text
http://127.0.0.1:8000/
```

2. El frontend esté ejecutándose en:

```text
http://localhost:5173/
```

3. No haber creado el archivo `.env` del frontend (el proxy de Vite funciona sin él).

4. El proxy de `vite.config.ts` apunte a Django.

5. El origen del frontend esté autorizado en CORS.

---

## El puerto 8000 está ocupado

Ejecuta Django en otro puerto:

```bash
python manage.py runserver 8001
```

Después actualiza la URL del backend en `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/backend': { target: 'http://127.0.0.1:8001', ... },
    '/api': { target: 'http://127.0.0.1:8001', ... },
  },
}
```

Si usas `VITE_API_BASE_URL`, cámbiala también:

---

## El puerto 5173 está ocupado

Vite utilizará otro puerto automáticamente o puede ejecutarse con:

```bash
npm run dev -- --port 5174
```

Si cambia el puerto, también debes agregarlo a los orígenes permitidos por CORS.

---

# Comandos rápidos

## Backend

```bash
git clone https://github.com/Michu117/Historias-Clinicas.git
cd Historias-Clinicas
cd HistoriasClinicas

python -m venv venv
```

### Activar en Windows

```bash
venv\Scripts\activate
```

### Activar en Linux o macOS

```bash
source venv/bin/activate
```

### Instalar y ejecutar

El archivo `requirements.txt` se encuentra en la raíz del repositorio:

```bash
pip install -r ../requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Frontend

```bash
cd MediCampus-FrontEnd
npm install
npm run dev
```

---

# Seguridad

- No subir el archivo `.env`.
- No publicar la clave secreta de Django.
- No guardar contraseñas directamente en el código.
- No subir tokens JWT.
- No compartir bases de datos con información clínica real.
- Utilizar contraseñas seguras.
- Desactivar `DEBUG` en producción.
- Configurar correctamente `ALLOWED_HOSTS`.
- Usar HTTPS en producción.
- Cambiar las credenciales predeterminadas.
- Mantener actualizadas las dependencias.

---

# Integrantes

- Douglas Carreño
- Viviana Córdova
- Arelys Ajila
- Fabricio Ruiz
- Jasiel Quezada

---

# Licencia

Este proyecto fue desarrollado con fines académicos.

El uso, modificación o distribución del código debe respetar las condiciones establecidas por los autores y la institución correspondiente.
