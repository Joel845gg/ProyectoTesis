const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'juegotesis',
    password: 'postgres26',
    port: 5432,
});

async function addConstraint() {
    try {
        console.log('Adding unique constraint on (jugador_codigo, tipo) to prepost_evaluaciones...');
        await pool.query(`
            ALTER TABLE prepost_evaluaciones
            ADD CONSTRAINT prepost_evaluaciones_jugador_tipo_key UNIQUE (jugador_codigo, tipo);
        `);
        console.log('Constraint added successfully.');
    } catch (err) {
        console.error('Error adding constraint:', err);
    } finally {
        await pool.end();
    }
}

addConstraint();
