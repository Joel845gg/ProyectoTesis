const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres26',
    port: 5432,
});

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

        console.log("Creando tabla 'usuarios'...");
        await dbClient.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        codigo VARCHAR(4) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log("Base de datos configurada exitosamente.");
        await dbClient.end();
    } catch (err) {
        console.error('Error configurando la base de datos:', err);
        try { await client.end(); } catch { }
    }
}

setupQuery();
