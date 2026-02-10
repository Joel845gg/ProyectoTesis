const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'juegotesis',
    password: 'postgres26',
    port: 5432,
});

async function checkContent() {
    try {
        console.log('Checking prepost_evaluaciones content (limit 5)...');
        const res = await pool.query('SELECT * FROM prepost_evaluaciones LIMIT 5');
        console.table(res.rows);

        console.log('Checking prepost_jugadores content (limit 5)...');
        const res2 = await pool.query('SELECT * FROM prepost_jugadores LIMIT 5');
        console.table(res2.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkContent();
