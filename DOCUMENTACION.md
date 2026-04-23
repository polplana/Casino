# Proyecto Intermodular 1º DAW: Web de Casino

**Autores:** Pol Plana Boivin y Andrés Tarrasó Sala

## Descripción del Proyecto
Este proyecto consiste en el desarrollo de una aplicación web que simula un casino, permitiendo a los usuarios registrarse, comprar fichas de manera simulada y jugar a distintos minijuegos. El sistema está estructurado con un frontend atractivo en HTML/CSS/JS, y la persistencia de datos está gestionada a través de una base de datos MySQL alojada en un contenedor Docker, con la que se interactúa mediante un backend en Java.

---

## Diario de Desarrollo

### Fase 1: Configuración Inicial e Infraestructura
**Fecha:** 23 de Abril de 2026

- **Estructura del Proyecto:** Se ha definido la jerarquía de carpetas separando `frontend`, `backend` y `database`.
- **Base de Datos:** Se ha creado el archivo `docker-compose.yml` para levantar un servidor MySQL (versión 8.0) local de forma rápida y reproducible. Se han definido las credenciales iniciales (`casino_user` / `casino_password`) y una base de datos por defecto (`casino_db`).
- **Driver JDBC:** Se ha integrado el driver `mysql-connector-j-8.2.0.jar` en la carpeta `backend/lib` para su posterior uso en la conexión con Java.
- **Frontend Inicial:** Se ha diseñado la página principal (`index.html`) y la hoja de estilos (`style.css`), estableciendo un diseño "premium" en tonos oscuros y dorados utilizando Flexbox y animaciones de CSS para la experiencia de usuario.

### Fase 2: (En proceso)
*Se documentará a medida que avancemos con el resto de pantallas y la integración de Java.*
