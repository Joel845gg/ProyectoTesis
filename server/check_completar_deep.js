const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'juegotesis',
    password: 'postgres26',
    port: 5432,
});

async function checkDeep() {
    try {
        console.log('Checking recent 50 Completar scores...');
        const res = await pool.query(`
            SELECT * FROM historial_juegos 
            WHERE juego = 'Completar' 
            ORDER BY fecha DESC 
            LIMIT 50
        `);
        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkDeep();
