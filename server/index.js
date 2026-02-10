const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'juegotesis',
    password: 'postgres26',
    port: 5432,
});

// Función para generar código único
function generateCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Registro de usuario
app.post('/api/registro', async (req, res) => {
    const { nombre, apellido } = req.body;

    if (!nombre || !apellido) {
        return res.status(400).json({ error: 'Nombre y Apellido son requeridos' });
    }

    try {
        // 1. Validar duplicados en tabla JUGADORES
        const checkDuplicate = await pool.query(
            'SELECT * FROM jugadores WHERE LOWER(nombre) = LOWER($1) AND LOWER(apellido) = LOWER($2)',
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
            const checkRes = await pool.query('SELECT 1 FROM jugadores WHERE codigo = $1', [codigo]);
            if (checkRes.rowCount === 0) {
                isUnique = true;
                break;
            }
        }

        if (!isUnique) {
            return res.status(500).json({ error: 'No se pudo generar un código único. Inténtalo de nuevo.' });
        }

        // 3. Insertar en tabla JUGADORES
        const result = await pool.query(
            'INSERT INTO jugadores (codigo, nombre, apellido, fecha_registro) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [codigo, nombre, apellido]
        );

        // 4. Inicializar ESTADISTICAS en 0
        await pool.query(
            'INSERT INTO estadisticas (jugador_codigo, mejor_puntuacion_global, puntuacion_total, total_juegos_jugados) VALUES ($1, 0, 0, 0)',
            [codigo]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Login (Validar código)
app.post('/api/login', async (req, res) => {
    const { codigo } = req.body;

    if (!codigo) {
        return res.status(400).json({ error: 'Código es requerido' });
    }

    try {
        // Verificar si es el código especial de admin
        if (codigo.toLowerCase() === 'admin') {
            return res.json({
                codigo: 'admin',
                nombre: 'Administrador',
                apellido: 'Sistema',
                isAdmin: true
            });
        }

        // Si no es admin, buscar en la base de datos
        const result = await pool.query('SELECT * FROM jugadores WHERE codigo = $1', [codigo]);

        if (result.rows.length > 0) {
            res.json({ ...result.rows[0], isAdmin: false });
        } else {
            res.status(404).json({ error: 'Código no encontrado' });
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
                   COALESCE(e.mejor_puntuacion_global, 0) as mejor_puntuacion_global, 
                   COALESCE(e.puntuacion_total, 0) as puntuacion_total, 
                   COALESCE(e.total_juegos_jugados, 0) as total_juegos_jugados 
            FROM jugadores j
            LEFT JOIN estadisticas e ON j.codigo = e.jugador_codigo
            ORDER BY e.mejor_puntuacion_global DESC NULLS LAST
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
});

// Endpoint Admin: Analytics Detallado (Evolución)
app.get('/api/admin/analytics/:codigo', async (req, res) => {
    const { codigo } = req.params;
    try {
        // Obtener historial completo ordenado por fecha
        const historyRes = await pool.query(`
            SELECT juego, dificultad, puntuacion, errores, tiempo_jugado, fecha 
            FROM historial_juegos 
            WHERE jugador_codigo = $1 
            ORDER BY fecha ASC
        `, [codigo]);

        res.json(historyRes.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error obteniendo analytics' });
    }
});

// Endpoint: Obtener todos los jugadores con evaluaciones pre/post
app.get('/api/admin/prepost/jugadores', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                pj.codigo,
                pj.nombre,
                ei.atencion as atencion_inicial,
                ei.memoria as memoria_inicial,
                ei.reaccion as reaccion_inicial,
                ef.atencion as atencion_final,
                ef.memoria as memoria_final,
                ef.reaccion as reaccion_final,
                m.atencion as mejora_atencion,
                m.memoria as mejora_memoria,
                m.reaccion as mejora_reaccion
            FROM prepost_jugadores pj
            LEFT JOIN prepost_evaluaciones ei ON pj.codigo = ei.jugador_codigo AND ei.tipo = 'inicial'
            LEFT JOIN prepost_evaluaciones ef ON pj.codigo = ef.jugador_codigo AND ef.tipo = 'final'
            LEFT JOIN prepost_mejoras m ON pj.codigo = m.jugador_codigo
            ORDER BY pj.nombre
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error obteniendo datos pre/post' });
    }
});

// Endpoint: Obtener estadísticas agregadas pre/post
app.get('/api/admin/prepost/stats', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                AVG(ei.atencion) as promedio_atencion_inicial,
                AVG(ef.atencion) as promedio_atencion_final,
                AVG(ei.memoria) as promedio_memoria_inicial,
                AVG(ef.memoria) as promedio_memoria_final,
                AVG(ei.reaccion) as promedio_reaccion_inicial,
                AVG(ef.reaccion) as promedio_reaccion_final,
                AVG(m.atencion) as promedio_mejora_atencion,
                AVG(m.memoria) as promedio_mejora_memoria,
                AVG(m.reaccion) as promedio_mejora_reaccion
            FROM prepost_jugadores pj
            LEFT JOIN prepost_evaluaciones ei ON pj.codigo = ei.jugador_codigo AND ei.tipo = 'inicial'
            LEFT JOIN prepost_evaluaciones ef ON pj.codigo = ef.jugador_codigo AND ef.tipo = 'final'
            LEFT JOIN prepost_mejoras m ON pj.codigo = m.jugador_codigo
        `);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error obteniendo estadísticas pre/post' });
    }
});

// Endpoint: Guardar Evaluación Manual (Pre/Post)
app.post('/api/admin/evaluacion', async (req, res) => {
    const { codigo, tipo, respuestas } = req.body;
    // respuestas = { A: 12, B: 15, C: 10 } (Sumas ya calculadas o array de respuestas)
    // El frontend enviará los puntajes totales por sección: atencion, memoria, reaccion

    if (!codigo || !tipo || !respuestas) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    try {
        // 1. Asegurar que el jugador existe en prepost_jugadores
        // Primero buscamos si existe en tabla master 'jugadores'
        const playerMaster = await pool.query('SELECT * FROM jugadores WHERE codigo = $1', [codigo]);
        if (playerMaster.rowCount === 0) {
            return res.status(404).json({ error: 'Jugador no encontrado en el sistema.' });
        }

        const { nombre, apellido } = playerMaster.rows[0];
        const nombreCompleto = `${nombre} ${apellido}`;

        // Verificar/Insertar en prepost_jugadores
        await pool.query(`
            INSERT INTO prepost_jugadores (codigo, nombre)
            VALUES ($1, $2)
            ON CONFLICT (codigo) DO NOTHING
        `, [codigo, nombreCompleto]);

        // 2. Insertar/Actualizar Evaluación
        // tipo debe ser 'inicial' o 'final'
        await pool.query(`
            INSERT INTO prepost_evaluaciones (jugador_codigo, tipo, atencion, memoria, reaccion)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (jugador_codigo, tipo) 
            DO UPDATE SET atencion = $3, memoria = $4, reaccion = $5
        `, [codigo, tipo, respuestas.atencion, respuestas.memoria, respuestas.reaccion]);

        // 3. Recalcular Mejoras (Si existen ambas)
        const evaluaciones = await pool.query(`
            SELECT tipo, atencion, memoria, reaccion 
            FROM prepost_evaluaciones 
            WHERE jugador_codigo = $1
        `, [codigo]);

        const inicial = evaluaciones.rows.find(e => e.tipo === 'inicial');
        const final = evaluaciones.rows.find(e => e.tipo === 'final');

        if (inicial && final) {
            const mejoraAtencion = final.atencion - inicial.atencion;
            const mejoraMemoria = final.memoria - inicial.memoria;
            const mejoraReaccion = final.reaccion - inicial.reaccion;

            await pool.query(`
                INSERT INTO prepost_mejoras (jugador_codigo, atencion, memoria, reaccion)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (jugador_codigo)
                DO UPDATE SET atencion = $2, memoria = $3, reaccion = $4
            `, [codigo, mejoraAtencion, mejoraMemoria, mejoraReaccion]);
        }

        res.json({ message: 'Evaluación guardada correctamente' });

    } catch (err) {
        console.error("Error guardando evaluación:", err);
        res.status(500).json({ error: 'Error al guardar evaluación' });
    }
});

// Guardar resultado de juego
app.post('/api/guardar-resultado', async (req, res) => {
    const { codigo, juego, dificultad, puntuacion, tiempo_jugado, errores } = req.body;
    console.log(`[POST /api/guardar-resultado] Received:`, { codigo, juego, dificultad, puntuacion, errores });

    if (!codigo || !juego || !dificultad) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    try {
        // Buscar en 'jugadores' (Modelo Relacional Único)
        const playerRes = await pool.query('SELECT * FROM jugadores WHERE codigo = $1', [codigo]);
        if (playerRes.rowCount > 0) {

            // a. Insertar en historial_juegos (Ahora con errores)
            await pool.query(
                'INSERT INTO historial_juegos (jugador_codigo, juego, dificultad, puntuacion, tiempo_jugado, errores, fecha) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
                [codigo, juego, dificultad, puntuacion, tiempo_jugado || 0, errores || 0]
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
                // Crear fila inicial si no existe (aunque debió crearse al registro)
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

            return res.json({ message: 'Resultado guardado correctamente' });
        }

        res.status(404).json({ error: 'Usuario no encontrado' });

    } catch (err) {
        console.error("Error guardar-resultado:", err);
        res.status(500).json({ error: 'Error al guardar resultado' });
    }
});

// Obtener usuario completo (con estadísticas e historial)
app.get('/api/usuario/:codigo', async (req, res) => {
    const { codigo } = req.params;
    try {
        // Buscar en tabla 'jugadores'
        const playerRes = await pool.query('SELECT * FROM jugadores WHERE codigo = $1', [codigo]);
        if (playerRes.rows.length > 0) {
            const player = playerRes.rows[0];

            // Obtener estadísticas
            const statsRes = await pool.query('SELECT * FROM estadisticas WHERE jugador_codigo = $1', [codigo]);
            const stats = statsRes.rows[0] || {};

            // Obtener historial y formatearlo
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
            'SELECT * FROM jugadores WHERE LOWER(nombre) = LOWER($1) AND LOWER(apellido) = LOWER($2)',
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

// Eliminar usuario
app.delete('/api/usuario/:codigo', async (req, res) => {
    const { codigo } = req.params;
    try {
        const result = await pool.query('DELETE FROM jugadores WHERE codigo = $1 RETURNING *', [codigo]);

        if (result.rowCount > 0) {
            res.json({ message: 'Usuario eliminado correctamente', usuario: result.rows[0] });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (err) {
        console.error('Error eliminando usuario:', err);
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
