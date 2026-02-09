const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'juegotesis',
    password: 'postgres26',
    port: 5432,
});

// Helper function to generate 4-digit code
function generateCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Routes

// Registro de usuario
app.post('/api/registro', async (req, res) => {
    const { nombre, apellido } = req.body;

    if (!nombre || !apellido) {
        return res.status(400).json({ error: 'Nombre y Apellido son requeridos' });
    }

    try {
        // 1. Validar duplicados
        const checkDuplicate = await pool.query(
            'SELECT * FROM usuarios WHERE LOWER(nombre) = LOWER($1) AND LOWER(apellido) = LOWER($2)',
            [nombre, apellido]
        );

        if (checkDuplicate.rows.length > 0) {
            return res.status(409).json({ error: 'Ya existe un usuario registrado con ese nombre y apellido.' });
        }

        // 2. Generar código único
        let codigo;
        let isUnique = false;

        // Intentar generar un código único hasta 5 veces
        for (let i = 0; i < 5; i++) {
            codigo = generateCode();
            const checkRes = await pool.query('SELECT 1 FROM usuarios WHERE codigo = $1', [codigo]);
            if (checkRes.rowCount === 0) {
                isUnique = true;
                break;
            }
        }

        if (!isUnique) {
            return res.status(500).json({ error: 'No se pudo generar un código único. Inténtalo de nuevo.' });
        }

        const estadisticas = {
            mejor_puntuacion_global: 0,
            puntuacion_total: 0,
            total_juegos_jugados: 0
        };
        const historial_juegos = [];
        const mejores_puntuaciones = {};

        const result = await pool.query(
            'INSERT INTO usuarios (nombre, apellido, codigo, estadisticas, historial_juegos, mejores_puntuaciones) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nombre, apellido, codigo, estadisticas, JSON.stringify(historial_juegos), mejores_puntuaciones]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ingreso por código
app.post('/api/login', async (req, res) => {
    const { codigo } = req.body;

    if (!codigo) {
        return res.status(400).json({ error: 'Código requerido' });
    }

    if (codigo === 'admin') {
        return res.json({
            codigo: 'admin',
            nombre: 'Administrador',
            apellido: '',
            isAdmin: true
        });
    }

    try {
        const result = await pool.query('SELECT * FROM jugadores WHERE codigo = $1', [codigo]);

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Endpoint Admin: Obtener estadísticas de todos los jugadores
app.get('/api/admin/stats', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT j.codigo, j.nombre, j.apellido, 
                   e.mejor_puntuacion_global, e.puntuacion_total, e.total_juegos_jugados 
            FROM jugadores j
            LEFT JOIN estadisticas e ON j.codigo = e.jugador_codigo
            ORDER BY e.mejor_puntuacion_global DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
});



// Guardar resultado de juego
app.post('/api/guardar-resultado', async (req, res) => {
    const { codigo, juego, dificultad, puntuacion, tiempo_jugado } = req.body;
    console.log(`[POST /api/guardar-resultado] Received:`, { codigo, juego, dificultad, puntuacion });

    if (!codigo || !juego || !dificultad) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    try {
        // 1. Buscar en 'usuarios' (Modelo JSON)
        const userRes = await pool.query('SELECT * FROM usuarios WHERE codigo = $1', [codigo]);
        if (userRes.rowCount > 0) {
            console.log(`User ${codigo} found in 'usuarios' table.`);
            const usuario = userRes.rows[0];
            let estadisticas = usuario.estadisticas || { mejor_puntuacion_global: 0, puntuacion_total: 0, total_juegos_jugados: 0 };
            let historial = usuario.historial_juegos || [];
            let mejores = usuario.mejores_puntuaciones || {};

            const nuevoJuego = {
                juego,
                dificultad,
                puntuacion: parseFloat(puntuacion),
                tiempo_jugado: parseFloat(tiempo_jugado),
                fecha: new Date().toISOString()
            };
            historial.push(nuevoJuego);

            const keyMejor = `${juego}_${dificultad}`;
            if (!mejores[keyMejor] || parseFloat(puntuacion) > parseFloat(mejores[keyMejor])) {
                mejores[keyMejor] = parseFloat(puntuacion);
            }

            estadisticas.total_juegos_jugados = (estadisticas.total_juegos_jugados || 0) + 1;
            estadisticas.puntuacion_total = (estadisticas.puntuacion_total || 0) + parseFloat(puntuacion);

            // Recalcular mejor global
            const currentBest = estadisticas.mejor_puntuacion_global || 0;
            estadisticas.mejor_puntuacion_global = Math.max(currentBest, parseFloat(puntuacion));

            await pool.query(
                'UPDATE usuarios SET estadisticas = $1, historial_juegos = $2, mejores_puntuaciones = $3 WHERE codigo = $4',
                [estadisticas, JSON.stringify(historial), mejores, codigo]
            );
            return res.json({ message: 'Resultado guardado (usuarios)', stats: estadisticas });
        }

        // 2. Buscar en 'jugadores' (Modelo Relacional)
        const playerRes = await pool.query('SELECT * FROM jugadores WHERE codigo = $1', [codigo]);
        if (playerRes.rowCount > 0) {
            console.log(`User ${codigo} found in 'jugadores' table.`);

            // a. Insertar en historial_juegos
            await pool.query(
                'INSERT INTO historial_juegos (jugador_codigo, juego, dificultad, puntuacion, tiempo_jugado, fecha) VALUES ($1, $2, $3, $4, $5, NOW())',
                [codigo, juego, dificultad, puntuacion, tiempo_jugado]
            );

            // b. Actualizar o Insertar mejores_puntuaciones ("Max score for this game/diff")
            const bestRes = await pool.query(
                'SELECT puntuacion FROM mejores_puntuaciones WHERE jugador_codigo = $1 AND juego = $2 AND dificultad = $3',
                [codigo, juego, dificultad]
            );

            if (bestRes.rowCount === 0) {
                await pool.query(
                    'INSERT INTO mejores_puntuaciones (jugador_codigo, juego, dificultad, puntuacion) VALUES ($1, $2, $3, $4)',
                    [codigo, juego, dificultad, puntuacion]
                );
            } else {
                if (parseFloat(puntuacion) > parseFloat(bestRes.rows[0].puntuacion)) {
                    await pool.query(
                        'UPDATE mejores_puntuaciones SET puntuacion = $1 WHERE jugador_codigo = $2 AND juego = $3 AND dificultad = $4',
                        [puntuacion, codigo, juego, dificultad]
                    );
                }
            }

            // c. Actualizar estadisticas globales
            // Primero verificamos si existe registro en estadisticas
            let statsRow = await pool.query('SELECT * FROM estadisticas WHERE jugador_codigo = $1', [codigo]);
            if (statsRow.rowCount === 0) {
                // Crear fila inicial si no existe
                await pool.query('INSERT INTO estadisticas (jugador_codigo, mejor_puntuacion_global, puntuacion_total, total_juegos_jugados) VALUES ($1, 0, 0, 0)', [codigo]);
                statsRow = await pool.query('SELECT * FROM estadisticas WHERE jugador_codigo = $1', [codigo]);
            }

            let stats = statsRow.rows[0];
            let newTotal = parseFloat(stats.puntuacion_total) + parseFloat(puntuacion);
            let newCount = parseInt(stats.total_juegos_jugados) + 1;
            let newGlobalBest = Math.max(parseFloat(stats.mejor_puntuacion_global), parseFloat(puntuacion));

            await pool.query(
                'UPDATE estadisticas SET puntuacion_total = $1, total_juegos_jugados = $2, mejor_puntuacion_global = $3 WHERE jugador_codigo = $4',
                [newTotal, newCount, newGlobalBest, codigo]
            );

            return res.json({ message: 'Resultado guardado (jugadores)' });
        }

        res.status(404).json({ error: 'Usuario no encontrado' });

    } catch (err) {
        console.error("Error guardar-resultado:", err);
        res.status(500).json({ error: 'Error al guardar resultado' });
    }
});

// Obtener usuario completo (Unificando tablas)
app.get('/api/usuario/:codigo', async (req, res) => {
    const { codigo } = req.params;
    try {
        // 1. Buscar en tabla 'usuarios' (Nuevos registros con JSON)
        const userRes = await pool.query('SELECT * FROM usuarios WHERE codigo = $1', [codigo]);
        if (userRes.rows.length > 0) {
            return res.json(userRes.rows[0]);
        }

        // 2. Buscar en tabla 'jugadores' (Datos semilla / Relacional)
        const playerRes = await pool.query('SELECT * FROM jugadores WHERE codigo = $1', [codigo]);
        if (playerRes.rows.length > 0) {
            const player = playerRes.rows[0];

            // Obtener estadísticas
            const statsRes = await pool.query('SELECT * FROM estadisticas WHERE jugador_codigo = $1', [codigo]);
            const stats = statsRes.rows[0] || {};

            // Obtener historial y formatearlo como el objeto JSON de 'usuarios'
            // Ordenamos ASC para que el reverse() del frontend muestre el más reciente primero
            const historyRes = await pool.query('SELECT * FROM historial_juegos WHERE jugador_codigo = $1 ORDER BY fecha ASC', [codigo]);

            const unifiedUser = {
                codigo: player.codigo,
                nombre: player.nombre,
                apellido: player.apellido,
                estadisticas: {
                    mejor_puntuacion_global: parseFloat(stats.mejor_puntuacion_global || 0),
                    puntuacion_total: parseFloat(stats.puntuacion_total || 0),
                    total_juegos_jugados: parseInt(stats.total_juegos_jugados || 0)
                },
                // Mapeamos para que coincida con la estructura que espera el frontend
                historial_juegos: historyRes.rows.map(h => ({
                    juego: h.juego,
                    dificultad: h.dificultad,
                    puntuacion: parseFloat(h.puntuacion),
                    fecha: h.fecha,
                    tiempo_jugado: h.tiempo_jugado
                }))
            };

            return res.json(unifiedUser);
        }

        res.status(404).json({ error: 'Usuario no encontrado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});

// Recuperar código por nombre y apellido
app.post('/api/recuperar', async (req, res) => {
    const { nombre, apellido } = req.body;

    if (!nombre || !apellido) {
        return res.status(400).json({ error: 'Nombre y Apellido son requeridos' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE LOWER(nombre) = LOWER($1) AND LOWER(apellido) = LOWER($2)',
            [nombre, apellido]
        );

        if (result.rows.length > 0) {
            res.json({ codigo: result.rows[0].codigo });
        } else {
            res.status(404).json({ error: 'No se encontró ningún usuario con esos datos.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Endpoint Admin: Datos para gráficos
app.get('/api/admin/dashboard-stats', async (req, res) => {
    try {
        // 1. Juegos más jugados
        const juegosRes = await pool.query(`
            SELECT juego, COUNT(*)::int as cantidad 
            FROM historial_juegos 
            GROUP BY juego
        `);

        // 2. Promedio de puntuación por juego
        const puntajeRes = await pool.query(`
            SELECT juego, ROUND(AVG(puntuacion), 2)::float as promedio 
            FROM historial_juegos 
            GROUP BY juego
        `);

        // 3. Totales generales
        const totalesRes = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM jugadores) as total_jugadores,
                (SELECT COUNT(*) FROM historial_juegos) as total_partidas
        `);

        res.json({
            juegos: juegosRes.rows,
            puntajes: puntajeRes.rows,
            generales: totalesRes.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error obteniendo datos del dashboard' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
