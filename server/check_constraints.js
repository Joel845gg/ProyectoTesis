const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'juegotesis',
    password: 'postgres26',
    port: 5432,
});

async function checkConstraints() {
    try {
        console.log('Checking constraints for prepost_evaluaciones...');
        const res = await pool.query(`
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE conrelid = 'prepost_evaluaciones'::regclass
        `);
        console.table(res.rows);

        console.log('Checking constraints for prepost_jugadores...');
        const res2 = await pool.query(`
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE conrelid = 'prepost_jugadores'::regclass
        `);
        console.table(res2.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkConstraints();
