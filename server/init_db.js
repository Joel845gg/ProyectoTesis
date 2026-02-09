const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres26',
    port: 5432,
});

const fs = require('fs');
const path = require('path');

async function setupQuery() {
    try {
        await client.connect();

        // Check if database exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname='juegotesis'");
        if (res.rowCount === 0) {
            console.log("Creando base de datos 'juegotesis'...");
            await client.query('CREATE DATABASE juegotesis');
        } else {
            console.log("La base de datos 'juegotesis' ya existe.");
        }

        await client.end();

        // Reconnect to the new database
        const dbClient = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'juegotesis',
            password: 'postgres26',
            port: 5432,
        });

        await dbClient.connect();

        console.log("Ejecutando script de base de datos...");

        // Read the SQL file
        const sqlPath = path.join(__dirname, '../client/src/assets/bdd/jugadores.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute the SQL
        await dbClient.query(sql);

        console.log("Base de datos y datos iniciales configurados exitosamente.");
        await dbClient.end();
    } catch (err) {
        console.error('Error configurando la base de datos:', err);
        try { await client.end(); } catch { }
    }
}

setupQuery();
