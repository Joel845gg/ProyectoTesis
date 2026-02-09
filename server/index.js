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

        const result = await pool.query(
            'INSERT INTO usuarios (nombre, apellido, codigo) VALUES ($1, $2, $3) RETURNING *',
            [nombre, apellido, codigo]
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

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE codigo = $1', [codigo]);

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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
