# Proyecto Intermodular 1º DAW: Web de Casino

**Autores:** Pol Plana Boivin y Andrés Tarrasó Sala

## Descripción del Proyecto
Este proyecto consiste en el desarrollo de una aplicación web que simula un casino, permitiendo a los usuarios registrarse, comprar fichas de manera simulada y jugar a distintos minijuegos. El sistema está estructurado con un frontend atractivo en HTML/CSS/JS, y la persistencia de datos está gestionada a través de una base de datos MySQL alojada en un contenedor Docker, con la que se interactúa mediante un backend en Java.

---

## Diario de Desarrollo

### Fase 1: Configuración Inicial e Infraestructura
**Fecha:** 2 de Abril de 2026

- **Estructura del Proyecto:** Se ha definido la jerarquía de carpetas separando `frontend`, `backend` y `database`.
- **Base de Datos:** Se ha creado el archivo `docker-compose.yml` para levantar un servidor MySQL (versión 8.0) local de forma rápida y reproducible. Se han definido las credenciales iniciales (`casino_user` / `casino_password`) y una base de datos por defecto (`casino_db`).
- **Driver JDBC:** Se ha integrado el driver `mysql-connector-j-8.2.0.jar` en la carpeta `backend/lib` para su posterior uso en la conexión con Java.
- **Frontend Inicial:** Se ha diseñado la página principal (`index.html`) y la hoja de estilos (`style.css`), estableciendo un diseño "premium" en tonos oscuros y dorados utilizando Flexbox y animaciones de CSS para la experiencia de usuario.

### Fase 2 y 3: Diseño e Implementación del Frontend (Tienda y Juego)
**Fecha:** 16 de Abril de 2026

- **Sistema de Tienda (`tienda.html` y `tienda.js`):**
  - Interfaz de usuario para la simulación de compra de fichas mediante distintos paquetes de pago.
  - Lógica JavaScript que suma las fichas adquiridas y guarda el estado en `localStorage` (`casino_balance`) para mantener persistencia temporal a nivel de navegador antes de integrarlo con la base de datos real.

- **Lobby de Juegos (`juego.html`):**
  - Se ha creado una sala principal ("Lobby") que muestra todos los juegos disponibles en forma de tarjetas.
  - Sirve como menú distribuidor para mantener la web organizada y evitar que la ruleta ocupe toda la sección.

- **Juego: Ruleta Europea (`ruleta.html`, `roulette.css` y `roulette.js`):**
  - **Diseño del Tapete:** Implementado mediante `CSS Grid` avanzado para estructurar correctamente las zonas de apuestas (plenos, docenas, mitades, columnas) respetando los colores y el layout de los casinos reales.
  - **Ruleta Visual:** Creada usando CSS Puro con gradientes cónicos y animaciones (`@keyframes spin`) para emular el giro de la rueda al iniciar una partida.
  - **Lógica de Apuestas:** 
    - Selección dinámica del valor de la ficha (5, 25, 100, 500).
    - Colocación de fichas sobre el tapete, verificando que el saldo sea suficiente.
    - Resolución de apuestas basada en las normativas estándar de la Ruleta Europea (ganancias de 35 a 1 para plenos, 2 a 1 para docenas/columnas y 1 a 1 para suertes sencillas).
    - Actualización dinámica del saldo post-partida.

### Fase 4: Expansión de Juegos (Tragaperras Clásica)
**Fecha:** 23 de Abril de 2026

- **Nuevo Juego: Tragaperras Clásica (`slots.html`, `slots.css` y `slots.js`):**
  - **Lobby Actualizado:** Se habilitó el acceso desde el menú principal de juegos (`juego.html`).
  - **Estructura y Estética:** Interfaz retro/premium manteniendo la paleta de colores del casino. Animaciones rápidas de desenfoque (`spin-blur`) para los rodillos y paradas escalonadas (1s, 1.5s, 2s).
  - **Lógica de Juego:** 
    - Selección de apuestas dinámicas (10, 25, 50, 100).
    - 5 símbolos disponibles y tabla de premios ajustada para asegurar un RTP (Return to Player) balanceado cercano al 96% (y un hit frequency de premio del 52% para mejorar la satisfacción del jugador).
    - Persistencia del saldo sincronizada de forma automática con el `localStorage` (`casino_balance`).

### Fase 5:

