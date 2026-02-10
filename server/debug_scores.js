const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'juegotesis',
    password: 'postgres26',
    port: 5432,
});

async function checkScores() {
    try {
        console.log('Checking history for user 7617 (Omar Quimbita)...');
        // Assuming 7617 is the code based on the screenshot, but I should verify if that's the code or just part of the ID.
        // The screenshot shows "7617" in the "Codigo" column (first column likely).

        const res = await pool.query(`
            SELECT * FROM historial_juegos 
            WHERE jugador_codigo = '7617' 
            ORDER BY fecha DESC
        `);
        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkScores();
