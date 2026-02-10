const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'juegotesis',
    password: 'postgres26',
    port: 5432,
});

async function addMejorasConstraint() {
    try {
        console.log('Adding unique constraint on (jugador_codigo) to prepost_mejoras...');
        await pool.query(`
            ALTER TABLE prepost_mejoras
            ADD CONSTRAINT prepost_mejoras_jugador_key UNIQUE (jugador_codigo);
        `);
        console.log('Constraint added successfully.');
    } catch (err) {
        console.error('Error adding constraint:', err);
    } finally {
        await pool.end();
    }
}

addMejorasConstraint();
