# MediCampus – Sistema de Historias Clínicas

MediCampus es una aplicación web para la gestión de los servicios de Bienestar Universitario. Permite administrar usuarios, roles, citas, servicios médicos, historias clínicas, atenciones, reportes y notificaciones.

## Requisitos

- Git
- Python 3.12+
- pip
- Node.js 18+
- npm

## Backend

1. Clona el repositorio e ingresa a la carpeta:

```bash
git clone https://github.com/Michu117/Historias-Clinicas.git
cd Historias-Clinicas
cd HistoriasClinicas
```

2. Crea y activa el entorno virtual:

```bash
python -m venv venv
```

**Windows (CMD):** `venv\Scripts\activate`
**Windows (PowerShell):** `venv\Scripts\Activate.ps1`
**Linux/macOS:** `source venv/bin/activate`

3. Instala las dependencias (el archivo `requirements.txt` está en la raíz del repositorio):

```bash
pip install -r ../requirements.txt
```

4. Ejecuta las migraciones:

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

Agrega el siguiente contenido:

```env
# Django SECRET_KEY — cambia este valor en producción
SECRET_KEY=django-insecure-!349^8mv0^9_dsy**7_(wm%*p2msa%r0$sktafkaq)ks62rcze

# Modo debug — desactivar en producción (False)
DEBUG=True

# Configuración SMTP de Gmail para el módulo de Notificaciones
# 1. Activa la verificación en dos pasos en tu cuenta de Google
# 2. Genera una contraseña de aplicación en: https://myaccount.google.com/apppasswords
# 3. Copia la contraseña de 16 caracteres

EMAIL_HOST_USER=tu.correo@gmail.com
EMAIL_HOST_PASSWORD=abcd1234efgh5678
DEFAULT_FROM_EMAIL=MediCampus <tu.correo@gmail.com>
```

> Si no creas el archivo `.env`, el backend usará valores por defecto para `SECRET_KEY` y `DEBUG` (modo desarrollo). En producción es obligatorio definir estas variables.

El archivo `.env` no debe subirse al repositorio.

---

## 7. Archivo `.env.example`

El repositorio ya incluye un archivo `.env.example` con las variables necesarias:

```env
SECRET_KEY=django-insecure-!349^8mv0^9_dsy**7_(wm%*p2msa%r0$sktafkaq)ks62rcze
DEBUG=True
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

5. Inicia el servidor:

```bash
python manage.py runserver
```

El backend queda disponible en `http://127.0.0.1:8000/`.

## Frontend

Abre otra terminal y ejecuta:

```bash
cd Historias-Clinicas
cd MediCampus-FrontEnd
npm install
npm run dev
```

Abre `http://localhost:5173/` en el navegador.

---

# Ejecución con Docker

## Requisitos

- Docker 24+ y Docker Compose 2.20+
- Verifica con: `docker --version && docker compose version`

---

## 1. Construir las imágenes

Solo necesario la primera vez o tras cambios en el código:

```bash
docker compose build
```

Construye dos imágenes:
- **`historias-clinicas-backend`** — Django + Gunicorn
- **`historias-clinicas-frontend`** — Nginx con el frontend compilado

---

## 2. Iniciar los servicios

### Opción A: Base de datos vacía (solo admin)

```bash
docker compose up -d
```

El backend arranca automáticamente con:
1. Migraciones aplicadas
2. Superusuario `admin@medicampus.local` creado
3. Servidor Gunicorn en puerto `8000`

### Opción B: Con datos de prueba precargados (recomendado)

**Linux / macOS:**
```bash
DJANGO_SEED_DATA=true docker compose up -d
```

**Windows (PowerShell):**
```powershell
$env:DJANGO_SEED_DATA="true"
docker compose up -d
```

**Windows (CMD):**
```cmd
set DJANGO_SEED_DATA=true
docker compose up -d
```

Además de lo anterior, se ejecuta el script `seed_all` que crea roles, profesionales, pacientes, historias clínicas, antecedentes, casos, documentos, citas, consultas, derivaciones y notificaciones de demostración.

---

## 3. Acceder a la aplicación

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | `http://localhost` | Aplicación web React |
| Backend API | `http://localhost:8000` | API REST Django |
| Admin Django | `http://localhost:8000/admin/` | Panel de administración |
| Swagger | `http://localhost:8000/api/docs/` | Documentación interactiva |
| ReDoc | `http://localhost:8000/api/redoc/` | Documentación alternativa |

---

## 4. Usuarios disponibles

### Sin seed (`DJANGO_SEED_DATA` por defecto):

| Email | Contraseña | Rol | Redirige a |
|-------|------------|-----|------------|
| `admin@medicampus.local` | `Admin12345.` | Superadmin + Admin | `/seguridad/dashboard` |

### Con seed (`DJANGO_SEED_DATA=true`):

| Email | Contraseña | Rol |
|-------|------------|-----|
| `admin@medicampus.local` | `Admin12345.` | Superadmin |
| `dr.juan@medicampus.com` | `MediCampus2024!` | Médico |
| `dra.maria@medicampus.com` | `MediCampus2024!` | Psicólogo |
| `dr.carlos@medicampus.com` | `MediCampus2024!` | Odontólogo |
| `ts.ana@medicampus.com` | `MediCampus2024!` | Trabajador Social |
| `est.pedro@medicampus.com` | `MediCampus2024!` | Estudiante |
| `laura.garcia@email.com` | `Paciente12345.` | Paciente |
| `roberto.castro@email.com` | `Paciente12345.` | Paciente |
| `carmen.ruiz@email.com` | `Paciente12345.` | Paciente |
| `diego.morales@email.com` | `Paciente12345.` | Paciente |
| `sofia.vega@email.com` | `Paciente12345.` | Paciente |

---

## 5. Gestión de servicios

```bash
# Ver estado
docker compose ps

# Ver logs de ambos servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs backend
docker compose logs frontend

# Detener (los datos persisten)
docker compose stop

# Reanudar
docker compose start

# Detener y eliminar contenedores (datos persisten)
docker compose down

# Detener, eliminar contenedores y borrar la base de datos
docker compose down --volumes
```

> Usa `--volumes` para empezar completamente desde cero.

---

## 6. Variables de entorno

**Linux / macOS:**
```bash
DJANGO_SEED_DATA=true DEBUG=True docker compose up -d
```

**Windows (PowerShell):**
```powershell
$env:DJANGO_SEED_DATA="true"
$env:DEBUG="True"
docker compose up -d
```

**Windows (CMD):**
```cmd
set DJANGO_SEED_DATA=true
set DEBUG=True
docker compose up -d
```

| Variable | Default | Descripción |
|----------|---------|-------------|
| `DJANGO_SEED_DATA` | `false` | `true` para cargar datos demo completos (roles, usuarios, historias clínicas, citas, consultas, derivaciones, notificaciones) |
| `SECRET_KEY` | (fija en docker-compose) | Clave secreta de Django |
| `DEBUG` | `False` | Activa el modo debug de Django |
| `EMAIL_BACKEND` | `console` | Backend de correo (`console` imprime en la terminal) |

---

## 7. Solución de problemas

### El puerto 80 ya está en uso

```bash
# Edita docker-compose.yml y cambia "80:80" por "8080:80"
# Luego accede en http://localhost:8080
```

### El puerto 8000 ya está en uso

```bash
# Edita docker-compose.yml y cambia "8000:8000" por "8001:8000"
```

### El admin de Django se ve sin estilos

```bash
# Reconstruye la imagen del backend y reinicia
docker compose build backend
docker compose up -d
```

### El contenedor backend se reinicia continuamente

```bash
# Limpia los datos y vuelve a iniciar
docker compose down --volumes
```

**Linux / macOS:**
```bash
DJANGO_SEED_DATA=true docker compose up -d
```

**Windows (PowerShell):**
```powershell
$env:DJANGO_SEED_DATA="true"
docker compose up -d
```

**Windows (CMD):**
```cmd
set DJANGO_SEED_DATA=true
docker compose up -d
```

### Error `host not found in upstream "backend"` (solo Windows)

El contenedor frontend (Nginx) intenta resolver el nombre `backend` antes de que el servicio esté registrado en la red de Docker.

**Solución:** Reconstruye la imagen del frontend:

```bash
docker compose build frontend
docker compose up -d
```

Si el error persiste, verifica que el backend esté funcionando:

```bash
docker compose logs backend
```

### Error `exec /entrypoint.sh: no such file or directory` (solo Windows)

El archivo `entrypoint.sh` se clonó con saltos de línea CRLF (Windows), por lo que el shebang `#!/bin/bash\r` no se encuentra dentro del contenedor Linux.

**Solución:** Reconstruye la imagen del backend:

```bash
docker compose build backend
docker compose up -d
```

Si el error persiste después de clonar el repo en Windows, asegúrate de tener el archivo `.gitattributes` en la raíz (ya incluido en el proyecto) y vuelve a clonar:

```bash
git clone https://github.com/Michu117/Historias-Clinicas.git
```

---

## Notas

- **Base de datos:** usa SQLite por defecto, no requiere configuración adicional.
- **Variables de entorno:** no es necesario crear archivos `.env` para desarrollo local.
- **Roles:** se precargan automáticamente al ejecutar `migrate`.
- **Superusuario:** `python manage.py createsuperuser` para acceder a `/admin/`.
- **Registro:** `POST /api/v1/auth/register` desde la API.
- **Documentación API:** `http://127.0.0.1:8000/api/docs/`.
