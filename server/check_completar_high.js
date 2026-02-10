const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'juegotesis',
    password: 'postgres26',
    port: 5432,
});

async function checkHighScores() {
    try {
        console.log('Checking high scores for Completar...');
        const res = await pool.query(`
            SELECT * FROM historial_juegos 
            WHERE juego = 'Completar' AND puntuacion >= 10
            ORDER BY fecha DESC
            LIMIT 20
        `);
        if (res.rowCount === 0) {
            console.log('No scores >= 10 found.');
        } else {
            console.table(res.rows);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkHighScores();
