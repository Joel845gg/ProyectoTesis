# Manual de Usuario - Juego Tesis

Bienvenido/a al Manual de Usuario de nuestro sistema de Juegos Cognitivos. Esta guía le ayudará a utilizar tanto la interfaz de jugador como las características del panel de administración.

---

## 1. Ingreso al Sistema

Existen dos roles dentro del sistema:
- **Jugador Convencional:** Utiliza la aplicación para jugar y registrar su evolución.
- **Administrador:** Puede observar los reportes, estadísticas globales y datos médicos (pre/post).

### Como Nuevo Jugador:
1. Al abrir la aplicación, en la pantalla principal haga clic en el botón **"Soy Nuevo"**.
2. Complete su nombre y apellido y acepte.
3. El sistema devolverá un **Código Secreto de 4 dígitos** (Ejemplo: `5413`). 
4. **Guarde este código herméticamente**, será utilizado en inicio de sesión futuros como su credencial.

### Como Jugador Existente:
1. En la pantalla principal, seleccione el botón **"Ya tengo un código"**.
2. Introduzca su código de 4 dígitos en el teclado numérico digital en pantalla.
3. Presione el botón Check verde.

### Como Administrador:
1. Presione **"Ya tengo un código"**.
2. En lugar del teclado numérico convencional, puede tipear desde su teclado directamente la palabra `admin` (en minúsculas).
3. Presione Check o "Enter". Será redigido al Panel de Administrador.

---

## 2. Para los Jugadores

### Selección de Juego
Una vez iniciado sesión, entrará a la pantalla **Selector de Juegos**.

1. Seleccione la tarjeta con el juego deseado.
2. Observe su **"Mejor Puntuación Global"** en la parte superior.
3. Juegue siguiendo las mecánicas de cada módulo.
4. Al culminar la partida, un resúmen detallará sus errores, el tiempo y su puntuación. Estos datos serán guardados en la nube y la partida culmina llevándolo a un nuevo menú.

### Funciones Adicionales Perfil del Jugador
En cualquier momento, a través del botón superior con icono de Usuario o icono de Trofeo puede ingresar a sus **Resultados Personales**.
- Esta pantalla le demostrará un registro en tabla de todo su **historial de juego** (puntajes, tiempos, fechas).
- Podrá ver un bloque listando su Mejor Puntuación obtenida en cada juego y su respectiva dificultad.
- Para salir del sistema, utilice el botón **"Salir"** o vuelva atrás.

---

## 3. Para el Administrador

El Administrador tiene una vista más analítica enfocada a las variables del experimento. El menú se ubica al lado izquierdo de la pantalla con botones e íconos:

### Dashboard (Tablero Principal)
En la parte principal y por defecto al ingresar se ven estadísticas como la cantidad de jugadores activos y el total de todo el universo de partidas jugadas con gráficas circulares interactivas. Se vislumbra también un listado de las Top 5 mayores puntuaciones.

### Tabla General de Progreso
Un listado con los filtros de búsqueda y un resumen de todos los jugadores que han utilizado la aplicación (su código y puntuaciones agregadas totales).
- Presionando el ícono de Ojo en un jugador específico, se abrirá un **Modal Detalle** con gráficas Lineales demostrando en una línea del tiempo cómo ha evolucionado (mejorado o empeorado) los resultados y tiempos del jugador con el paso de los días en la aplicación.

### Evaluaciones (Tests Pre/Post)
Pantalla especializada con formularios métricos. Aquí, un profesional que realizó la prueba externa o psicológica con un paciente, puede ingresar dichos valores:
1. Digitando el código del usuario o seleccionándolo.
2. Seleccionado si la prueba que carga es de tipo **"INICIAL"** (antes de usar la aplicación de juegos) o **"FINAL"** (luego de algunas semanas de uso).
3. Escribiendo la escala métrica obtenida de atención, cognición, tiempos de reacción etc.
Posteriormente, en la pestaña referida de las Estadísticas Pre/Post de la base de datos se le entregará la diferencia algorítmica y mejora lograda en porcentaje por el uso del software y se pueden promediar a todos los pacientes.

### Exportación de Reportes
A todos los datos analíticos del administrador se les puede presionar un botón de **"Exportar a Excel"** (si está habilitado), o un típico **"Descargar PDF"** en donde el administrador obtendrá el impreso legible para archivo.
