const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'juegotesis',
    password: 'postgres26',
    port: 5432,
});

async function runPrePostSQL() {
    try {
        await client.connect();
        console.log("Conectado a la base de datos...");

        const sqlPath = path.join(__dirname, '../client/src/assets/bdd/prepost.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);
        console.log("Tablas pre/post creadas exitosamente.");
    } catch (err) {
        console.error("Error ejecutando prepost.sql:", err);
    } finally {
        await client.end();
    }
}

runPrePostSQL();
