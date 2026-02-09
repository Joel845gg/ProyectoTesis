const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'juegotesis',
    password: 'postgres26',
    port: 5432,
});

async function clearData() {
    try {
        await client.connect();
        console.log("Eliminando datos de la tabla 'usuarios'...");
        await client.query('TRUNCATE TABLE usuarios RESTART IDENTITY');
        console.log("Datos eliminados y contadores reiniciados.");
        await client.end();
    } catch (err) {
        console.error('Error eliminando datos:', err);
        try { await client.end(); } catch { }
    }
}

clearData();
