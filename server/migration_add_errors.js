const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'juegotesis',
    password: 'postgres26',
    port: 5432,
});

async function runMigration() {
    try {
        await client.connect();
        console.log("Conectado a la base de datos...");

        // Agregar columna errores si no existe
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='historial_juegos' AND column_name='errores') THEN 
                    ALTER TABLE historial_juegos ADD COLUMN errores INT DEFAULT 0; 
                    RAISE NOTICE 'Columna errores agregada.';
                ELSE 
                    RAISE NOTICE 'La columna errores ya existe.';
                END IF; 
            END $$;
        `);

        console.log("Migración completada exitosamente.");
    } catch (err) {
        console.error("Error en la migración:", err);
    } finally {
        await client.end();
    }
}

runMigration();
