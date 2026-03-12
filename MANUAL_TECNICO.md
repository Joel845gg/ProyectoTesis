# Manual Técnico - Juego Tesis

Este manual está dirigido al personal técnico interesado en la arquitectura, configuración, el despliegue y un entendimiento profundo del sistema desarrollado.

## 1. Arquitectura del Sistema

El sistema sigue una arquitectura cliente-servidor clásica:
- **Frontend (Cliente):** Aplicación Single Page Application (SPA) construida con ReactJS y Vite.
- **Backend (Servidor):** API RESTful desarrollada con Node.js y framework Express.
- **Base de Datos:** Sistema de Gestión de Base de Datos Relacional PostgreSQL.

## 2. Tecnologías Utilizadas

### Frontend (Client)
- **Framework Core:** React 19
- **Build Tool:** Vite 5
- **Peticiones HTTP:** Axios
- **Gráficas y Reportes:** Recharts, jsPDF, jsPDF-AutoTable
- **Iconografía:** Lucide-React
- **Estilos:** CSS Vanilla (Módulos / Global)

### Backend (Server)
- **Entorno:** Node.js
- **Framework:** Express (Servidor web / API)
- **Conector DB:** `pg` (node-postgres)
- **Middlewares:** `cors`, `body-parser`, `dotenv`

### Base de Datos
- **Motor:** PostgreSQL (Versión recomendada 18.x u 12+)
- **Estructura provista:** `backup_juegotesis.sql`

---

## 3. Estructura de la Base de Datos

La base de datos (con nombre recomendado `juegotesis`) está estructurada por las siguientes tablas principales:

- **jugadores**: Almacena el código único de 4 dígitos, nombre, apellido y fecha de registro. Es el registro principal.
- **estadisticas**: Vinculada `1:1` con `jugadores`. Guarda las sumas agregadas de total de juegos, puntuación mayor general y sumatoria de puntos total.
- **historial_juegos**: Registro detallado `1:N` por jugador. Almacena las jugadas del usuario: qué y cuándo jugó, su dificultad y qué puntuación/errores y tiempo consumió.
- **mejores_puntuaciones**: Guarda el mejor récord por configuración de Juego/Dificultad de cada usuario para rápidas comparaciones.
- **prepost_evaluaciones / prepost_mejoras**: Tablas asociadas a un proceso analítico específico de la tesis para evaluar atención, memoria y reacción de un jugador antes y después del uso de la aplicación.
- **app_navigation**: Metadatos para configuración de navegación del Dashboard Administrativo.

---

## 4. Detalles de la API Backend

El servidor se levanta en un puerto (por defecto `3000`) y expone los siguientes Endpoints clave:

**Control de Usuarios / Juego**
- `POST /api/registro`: Registra a un nuevo jugador validando que los datos no sean duplicados y dota un código de 4 dígitos autogenerado y único.
- `POST /api/login`: Valida el código e ingresa al usuario. Permite pase a usuario `admin` introduciendo la palabra "admin".
- `POST /api/guardar-resultado`: Endpoint transaccional que actualiza tanto `historial_juegos` como `mejores_puntuaciones` y las calculadas globales `estadisticas`.
- `GET /api/usuario/:codigo`: Recupera el perfil completo incluyendo todas sus estadísticas e historial para la vista de Puntuación.

**Dashboard Administrador**
- `GET /api/admin/stats`: Lista principal del dashboard con estadísticas globales agregadas de todos los jugadores.
- `GET /api/admin/dashboard-stats`: Construye los datos agregados para visualización por gráficas (totales jugados, promedio puntaje por juego, top 5).
- `GET /api/admin/analytics/:codigo`: Devuelve toda la evolución temporal de jugadas de un código jugador en específico.

**Módulo Pre/Post Test**
- `GET /api/admin/prepost/jugadores` y `GET /api/admin/prepost/stats`: Funciones de extracción de métricas.
- `POST /api/admin/evaluacion`: Guarda una prueba o batería diagnóstica vinculando los puntos pre/post.

---

## 5. Instrucciones de Despliegue en Producción

El proyecto está diseñado para funcionar en un solo puerto si es preciso (ej. en Render, Heroku o VPS local).

1. Al estar en la raíz, dirigirse a `client/` y correr:
   ```bash
   npm install
   npm run build
   ```
2. Esto generará la subcarpeta `client/dist`. 
3. El archivo `server/index.js` incluye una lógica que, si la variable de entorno es `NODE_ENV=production`, sirve de forma estática la carpeta `dist/` a través de express (rutas que no son de api retornan el `index.html`).
4. Por ende, para producción se necesita ejecutar en la carpeta `server/`:
   ```bash
   NODE_ENV=production node index.js
   ```

## 6. Variables de Entorno (.env)

En Backend, el archivo `.env` debe poseer:
- `DATABASE_URL`: URI de conexión a PostgreSQL.
- `PORT`: Opcional, puerto HTTP en donde escuchar.
- `NODE_ENV`: Utilizado en valor `production` o `development`.
