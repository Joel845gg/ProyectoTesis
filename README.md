# Manual de Instalación y Despliegue - Juego Tesis

Este proyecto está dividido en dos partes principales: un **Frontend** desarrollado en React (Vite) y un **Backend** desarrollado en Node.js (Express) con PostgreSQL como base de datos.

## Estructura del Proyecto

- `client/`: Carpeta del frontend (React, JavaScript, CSS).
- `server/`: Carpeta del backend (Node.js, Express, PostgreSQL).
- `backup_juegotesis.sql`: Script de creación de la base de datos (Incluye tablas, relaciones y datos de prueba).

---

## 1. Requisitos Previos
- **Node.js**: Versión 16.x o superior.
- **PostgreSQL**: Versión 12 o superior.
- **Git** (Opcional, para el clonado).

## 2. Configuración de la Base de Datos

El repositorio incluye el archivo `backup_juegotesis.sql` que contiene toda la estructura de la base de datos necesaria para correr el proyecto.

1. Abre PostgreSQL (usando psql o pgAdmin).
2. Crea una nueva base de datos llamada `juegotesis`:
   ```sql
   CREATE DATABASE juegotesis;
   ```
3. Restaura el archivo `.sql` en la base de datos creada. Desde la línea de comandos, ubicándote en la raíz del proyecto, ejecuta:
   ```bash
   psql -U postgres -d juegotesis -f backup_juegotesis.sql
   ```
   *Nota: Reemplaza `postgres` por tu usuario de base de datos.*

---

## 3. Configuración del Backend (Carpeta `server/`)

1. Navega a la carpeta del backend:
   ```bash
   cd server
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
   **Dependencias principales:** `express`, `pg` (PostgreSQL), `cors`, `dotenv`, `body-parser`.

3. Configura las variables de entorno:
   - Copia el archivo `.env.example` y renómbralo a `.env`.
   - Modifica las credenciales de tu base de datos en `DATABASE_URL`:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://TU_USUARIO:TU_CONTRASEÑA@localhost:5432/juegotesis
   NODE_ENV=development
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   El servidor backend correrá en `http://localhost:3000`.

---

## 4. Configuración del Frontend (Carpeta `client/`)

1. Abre una nueva terminal y navega a la carpeta del frontend:
   ```bash
   cd client
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
   **Dependencias principales:** `react`, `react-dom`, `vite`, `axios`, `recharts`, `lucide-react`, `jspdf`.

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   El frontend correrá típicamente en `http://localhost:5173`. Abre esa URL en tu navegador.

---

## 5. Instrucciones para Producción (Despliegue)

1. Construir el frontend:
   En la carpeta `client`, ejecuta `npm run build`. Esto generará una carpeta `dist/`.
2. El backend está configurado para servir la carpeta `dist/` cuando `NODE_ENV=production`. Puedes verificar esto en `server/index.js`.
3. Inicia el servidor simplemente con:
   ```bash
   cd server
   npm start
   ```
