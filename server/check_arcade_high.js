const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'juegotesis',
    password: 'postgres26',
    port: 5432,
});

async function checkHighArcade() {
    try {
        console.log('Checking High Atrapar and Topo scores...');
        const res = await pool.query(`
            SELECT * FROM historial_juegos 
            WHERE juego IN ('Atrapar', 'Topo') AND puntuacion >= 30
            ORDER BY puntuacion DESC
            LIMIT 20
        `);
        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkHighArcade();
