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

## Notas

- **Base de datos:** usa SQLite por defecto, no requiere configuración adicional.
- **Variables de entorno:** no es necesario crear archivos `.env` para desarrollo local.
- **Roles:** se precargan automáticamente al ejecutar `migrate`.
- **Superusuario:** `python manage.py createsuperuser` para acceder a `/admin/`.
- **Registro:** `POST /api/v1/auth/register` desde la API.
- **Documentación API:** `http://127.0.0.1:8000/api/docs/`.
