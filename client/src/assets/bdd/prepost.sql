-- ==========================================
-- SQL (PostgreSQL) generado desde prepost.json
-- Tablas: navegación, jugadores, evaluaciones, mejoras
-- ==========================================

DROP TABLE IF EXISTS prepost_mejoras;
DROP TABLE IF EXISTS prepost_evaluaciones;
DROP TABLE IF EXISTS prepost_jugadores;
DROP TABLE IF EXISTS app_navigation;

CREATE TABLE app_navigation (
  id SERIAL PRIMARY KEY,
  icon VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  href VARCHAR(200) NOT NULL
);

CREATE TABLE prepost_jugadores (
  codigo VARCHAR(10) PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL
);

CREATE TABLE prepost_evaluaciones (
  id SERIAL PRIMARY KEY,
  jugador_codigo VARCHAR(10) NOT NULL REFERENCES prepost_jugadores(codigo) ON DELETE CASCADE,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('inicial','final')),
  atencion INT NOT NULL,
  memoria INT NOT NULL,
  reaccion INT NOT NULL
);

CREATE TABLE prepost_mejoras (
  id SERIAL PRIMARY KEY,
  jugador_codigo VARCHAR(10) NOT NULL REFERENCES prepost_jugadores(codigo) ON DELETE CASCADE,
  atencion INT NOT NULL,
  memoria INT NOT NULL,
  reaccion INT NOT NULL
);

-- --------------------------
-- INSERTS
-- --------------------------

INSERT INTO app_navigation (icon, label, href) VALUES
('BarChart3','Resultados','/resultados');

INSERT INTO prepost_jugadores (codigo, nombre) VALUES
('0184','Alejandro Gallo'),
('1031','Juliana Salas'),
('1329','Andrea Mena'),
('1393','Monica Diaz'),
('1569','Carlos Rivera'),
('1812','Jose Paredes'),
('2436','Maria Lopez'),
('2532','Roberto Bravo'),
('2850','Juan Martinez'),
('3201','Manuel Torres'),
('4005','Antonio Sanchez'),
('5413','Carmen Lopez'),
('5660','Ramon Caiza'),
('7649','Isabel Garcia'),
('8187','Luis Diaz'),
('8434','Carmen Chicaiza'),
('8687','Rosa Fernandez'),
('8872','Digna Chacon'),
('9377','Isabel Vizuete');

INSERT INTO prepost_evaluaciones (jugador_codigo, tipo, atencion, memoria, reaccion) VALUES
('0184','inicial',11,11,9),
('0184','final',13,14,10),
('1031','inicial',9,8,7),
('1031','final',11,10,8),
('1329','inicial',8,9,7),
('1329','final',10,12,8),
('1393','inicial',10,10,8),
('1393','final',12,12,9),
('1569','inicial',8,7,6),
('1569','final',10,9,7),
('1812','inicial',7,8,6),
('1812','final',9,10,7),
('2436','inicial',6,7,5),
('2436','final',8,9,6),
('2532','inicial',9,9,7),
('2532','final',11,12,8),
('2850','inicial',10,9,8),
('2850','final',12,12,9),
('3201','inicial',11,10,9),
('3201','final',13,13,10),
('4005','inicial',8,8,6),
('4005','final',10,10,7),
('5413','inicial',9,10,7),
('5413','final',11,13,8),
('5660','inicial',7,7,5),
('5660','final',9,10,6),
('7649','inicial',10,11,8),
('7649','final',12,14,9),
('8187','inicial',8,9,7),
('8187','final',10,12,8),
('8434','inicial',7,8,6),
('8434','final',9,10,7),
('8687','inicial',9,9,7),
('8687','final',11,12,8),
('8872','inicial',6,7,5),
('8872','final',8,9,6),
('9377','inicial',8,8,6),
('9377','final',10,10,7);

INSERT INTO prepost_mejoras (jugador_codigo, atencion, memoria, reaccion) VALUES
('0184',2,3,1),
('1031',2,2,1),
('1329',2,3,1),
('1393',2,2,1),
('1569',2,2,1),
('1812',2,2,1),
('2436',2,2,1),
('2532',2,3,1),
('2850',2,3,1),
('3201',2,3,1),
('4005',2,2,1),
('5413',2,3,1),
('5660',2,3,1),
('7649',2,3,1),
('8187',2,3,1),
('8434',2,2,1),
('8687',2,3,1),
('8872',2,2,1),
('9377',2,2,1);