# Historias-Clinicas

## Objetivo del Sistema
El proyecto tiene como finalidad diseñar una aplicación orientada a centralizar y optimizar las actividades del área de Bienestar Universitario de la Universidad Nacional de Loja.
La aplicación permitirá a los miembros de la comunidad universitaria gestionar de manera eficiente diversos servicios, tales como: la programación de citas médicas, la recepción de notificaciones sobre citas pendientes, el acceso a resultados de exámenes médicos y la solicitud de permisos médicos.

## Arquitectura del Sistema
El sistema usará una aquitectura cliente-servidor, en conjunto con el Modelo-Vista-Controlador (MVC), mantenibilidad y eficiencia operativa tanto en entornos web como en futuros dispositivos móviles. Bajo este paradigma, las responsabilidades se distribuyen de manera estratégica: las aplicaciones cliente asumen la exclusividad de la capa de presentación o Vista, gestionando el renderizado gráfico y la interacción directa con el usuario de forma totalmente independiente. Por su parte, el backend operará estrictamente como una API REST centralizada, asumiendo los roles lógicos de Controlador y Modelo al delegar el procesamiento central a una capa de servicios y gestionar el acceso a datos. Finalmente, la comunicación entre ambas partes se realizará mediante el intercambio fluido de información estructurada a través de protocolos web estándar, consolidando al servidor como una única fuente de verdad robusta capaz de interactuar de manera uniforme y simultánea con múltiples plataformas tecnológicas.


## Entorno de desarrollo backend
Se configuró el entorno de desarrollo utilizando el IDE PyCharm, el cual permite la integración del framework Django junto con su entorno virtual para la gestión de dependencias.
En la [carpeta principal](HistoriasClinicas/HistoriasClinicas)  del proyecto se encuentra la configuración inicial del sistema. En la primera versión del proyecto, se incluyó únicamente la aplicación principal junto con sus respectivas configuraciones.
