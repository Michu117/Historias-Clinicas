# Historias-Clinicas

## Objetivo del Sistema

El proyecto *Historias Clinicas* tiene como finalidad desarrollar una plataforma digital orientada a centralizar, optimizar y modernizar los procesos del área de Bienestar Universitario de la Universidad Nacional de Loja. La aplicación permitirá gestionar de manera eficiente diversos servicios médicos y administrativos dirigidos a la comunidad universitaria, facilitando tanto el acceso a la información como la automatización de procesos internos.

Entre las funcionalidades principales del sistema se encuentran:

- Programación y gestión de citas médicas.
- Recepción de notificaciones relacionadas con citas y procesos clínicos.
- Consulta de resultados de exámenes médicos.
- Solicitud y administración de permisos médicos.
- Gestión de historias clínicas digitales.
- Generación de reportes y seguimiento de atenciones.

El sistema busca mejorar la organización institucional, reducir tiempos de atención y proporcionar una plataforma segura y escalable para el manejo de información clínica.

## Arquitectura del Sistema

La aplicación fue diseñada bajo una arquitectura cliente-servidor complementada con el patrón Modelo-Vista-Controlador (MVC), permitiendo una adecuada separación de responsabilidades, mantenibilidad del código y escalabilidad del sistema.

Bajo este enfoque, las aplicaciones cliente se encargan exclusivamente de la capa de presentación o Vista, administrando la interacción directa con el usuario y el renderizado gráfico de manera independiente del backend. Por otro lado, el servidor opera como una API REST centralizada desarrollada con Django REST Framework, encargándose de procesar la lógica de negocio, administrar las reglas del sistema y gestionar el acceso a la base de datos.

La arquitectura backend se encuentra organizada en capas funcionales, entre las cuales destacan:

- **Views:** recepción y procesamiento de peticiones HTTP.
- **Serializers:** validación y transformación de datos.
- **Services:** encapsulamiento de lógica de negocio.
- **Models:** representación de entidades y relaciones de base de datos.
- **Permissions:** control de acceso y seguridad.

La comunicación entre cliente y servidor se realiza mediante intercambio de datos estructurados en formato JSON utilizando protocolos HTTP estándar, permitiendo compatibilidad con aplicaciones web y futuras aplicaciones móviles.

## Entorno de Desarrollo Backend

El entorno de desarrollo backend fue configurado utilizando el IDE PyCharm, integrando el framework Django junto con un entorno virtual de Python para la administración de dependencias y paquetes del proyecto.

La aplicación backend fue desarrollada utilizando:

- Python
- Django
- Django REST Framework
- SimpleJWT para autenticación JWT
- SQLite durante la fase inicial de desarrollo
- DRF Spectacular para documentación OpenAPI/Swagger

Dentro de la carpeta principal del proyecto se encuentran las configuraciones generales del sistema, incluyendo:

- configuración de rutas,
- registro de aplicaciones,
- configuración de base de datos,
- middlewares,
- autenticación,
- permisos,
- documentación de la API.

Durante la primera fase del desarrollo se implementó la estructura base del proyecto junto con los módulos principales relacionados con autenticación, agendas, historias clínicas, reportes y notificaciones, permitiendo establecer una arquitectura modular y escalable para futuras funcionalidades.
