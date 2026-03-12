# Manual de Instalación y Despliegue - Juego Tesis

**Repositorio del Proyecto:** [Joel845gg/ProyectoTesis](https://github.com/Joel845gg/ProyectoTesis.git)

Este proyecto está dividido en dos partes principales: un **Frontend** (la interfaz de usuario) desarrollado en React (Vite) y un **Backend** (el servidor y la lógica) desarrollado en Node.js (Express) con PostgreSQL como base de datos.

A continuación, se detallan los pasos exactos para que cualquier persona pueda instalar y hacer funcionar este proyecto desde cero en su computadora local.

---

## 1. Requisitos Previos (Programas Necesarios)

Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu computadora. Si no los tienes, descárgalos e instálalos usando los enlaces oficiales:

1. **Git**: Para clonar el repositorio. [Descargar Git](https://git-scm.com/downloads)
2. **Node.js**: Entorno de ejecución para Javascript (Se recomienda la versión LTS más reciente, ej. 18.x o superior). Incluye **npm** (gestor de paquetes de node). [Descargar Node.js](https://nodejs.org/)
3. **PostgreSQL**: El motor de base de datos relacional (Versión 12 o superior). Al instalarlo, te pedirá que crees una contraseña para el usuario `postgres`, **guárdala bien**. [Descargar PostgreSQL](https://www.postgresql.org/download/)
   * *(Opcional pero recomendado)*: Instalar **pgAdmin 4** (a menudo viene incluido con PostgreSQL) para gestionar tu base de datos de forma visual.
4. **Editor de Código**: Se recomienda Visual Studio Code. [Descargar VS Code](https://code.visualstudio.com/)

---

## 2. Descargar el Proyecto

Abre una terminal (Símbolo del sistema, PowerShell o Git Bash) y ejecuta el siguiente comando para descargar de GitHub todo el código del proyecto:

```bash
git clone https://github.com/Joel845gg/ProyectoTesis.git
```
Entra a la carpeta que se acaba de crear:
```bash
cd ProyectoTesis
```

*(Si descargaste el `.zip` desde GitHub, simplemente descomprímelo y abre esa carpeta en tu terminal o en VS Code).*

---

## 3. Configuración de la Base de Datos

El repositorio incluye el archivo `backup_juegotesis.sql` que contiene toda la estructura de la base de datos (tablas, relaciones) necesaria para correr el proyecto.

1. Abre la herramienta **pgAdmin 4** e inicia sesión con el usuario `postgres` y la contraseña que creaste al instalar PostgreSQL.
2. En el panel izquierdo ("Servers"), haz clic derecho sobre **Databases** -> **Create** -> **Database...**
3. En la ventana que aparece, escribe como nombre `juegotesis` y guarda.
4. **Para importar la estructura (Tablas)**:
   - Haz clic derecho sobre la base de datos recién creada `juegotesis` y selecciona **Restore** (o Restaurar).
   - En "Filename", busca en tu computadora y selecciona el archivo `backup_juegotesis.sql` que vino junto con el proyecto descargado.
   - Da clic en Restore.

*Alternativa por consola (si prefieres usar la terminal en vez de pgAdmin):*
```bash
psql -U postgres -d juegotesis -f backup_juegotesis.sql
```
*(Se te solicitará la contraseña de tu usuario postgres).*

---

## 4. Configurar e Iniciar el Servidor (Backend)

Sigue estos pasos para instalar los "motores" que hacen funcionar el código del servidor:

1. Abre tu terminal y ubícate en la carpeta raíz del proyecto (`ProyectoTesis`).
2. Entra a la carpeta del servidor:
   ```bash
   cd server
   ```
3. **Instalar dependencias**: Este comando descargará librerías necesarias (como express, para la API, y pg, para conectar con la base de datos). Asegúrate de tener conexión a Internet:
   ```bash
   npm install
   ```
4. **Conexión a la Base de Datos**:
   - Dentro de la carpeta `server/`, localiza el archivo llamado `.env.example`.
   - Haz una copia de ese archivo y renómbralo para que quede **únicamente** como `.env`.
   - Ábrelo con tu editor de código y modifica la segunda línea (`DATABASE_URL`). Donde dice `contraseña`, pon la contraseña que pusiste al instalar PostgreSQL:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://postgres:TUPASSWORD_AQUI@localhost:5432/juegotesis
   NODE_ENV=development
   ```
5. **Iniciar el servidor**:
   Ejecuta el siguiente comando en la misma terminal:
   ```bash
   npm run dev
   ```
   Si todo está correcto, verás un mensaje en rojo o blanco indicando `Server running on port 3000`. **¡No cierres esta terminal!** Debe quedarse corriendo.

---

## 5. Configurar e Iniciar la Interfaz Visual (Frontend)

Con el servidor backend ya encendido e interactuando con la base de datos, debemos encender la vista web.

1. Abre **una nueva ventana de terminal** (no interrumpas la que cerraste en el paso 4).
2. Ubícate nuevamente en la carpeta raíz del proyecto y entra a la carpeta del cliente:
   ```bash
   cd client
   ```
3. **Instalar dependencias**: Del mismo modo, este comando descarga las herramientas que dibujan las ventanas (React, gráficas, iconos):
   ```bash
   npm install
   ```
4. **Iniciar la aplicación**:
   ```bash
   npm run dev
   ```
5. Tras unos pocos segundos, en la terminal te aparecerá un texto que dice algo parecido a:
   `➜  Local:   http://localhost:5173/`

**¡Listo!** Mantén aplastado la tecla `Ctrl` y haz clic encima de ese enlace, o simplemente copia la dirección `http://localhost:5173/` y pégala en Google Chrome. El juego estará operativo y conectado a tu base local.

---

## Manuales Adicionales

Si necesitas más información profunda para continuar con el desarrollo, evaluar estadísticos o entender usos:
1. Revisa [MANUAL_USUARIO.md](./MANUAL_USUARIO.md) para explorar la funcionalidad como jugador / administrador.
2. Revisa [MANUAL_TECNICO.md](./MANUAL_TECNICO.md) para comprender la arquitectura tecnológica y los "endpoints" del sistema.
