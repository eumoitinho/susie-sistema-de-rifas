import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');

// Promisify database methods
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialize database
async function initDatabase() {
  // Create users table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create rifas table
  await run(`
    CREATE TABLE IF NOT EXISTS rifas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      descricao TEXT,
      foto_url TEXT,
      valor_bilhete REAL NOT NULL DEFAULT 0,
      data_sorteio DATETIME NOT NULL,
      numero_max INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create bilhetes table
  await run(`
    CREATE TABLE IF NOT EXISTS bilhetes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rifa_id INTEGER NOT NULL,
      numero INTEGER NOT NULL,
      nome_comprador TEXT NOT NULL,
      cpf TEXT NOT NULL,
      whatsapp TEXT,
      valor_pago REAL,
      data_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
      codigo_visualizacao TEXT UNIQUE,
      status_pagamento TEXT DEFAULT 'PENDING',
      pix_id TEXT,
      FOREIGN KEY (rifa_id) REFERENCES rifas(id),
      UNIQUE(rifa_id, numero)
    )
  `);

  // Adicionar colunas se não existirem
  try {
    await run(`ALTER TABLE bilhetes ADD COLUMN whatsapp TEXT`);
  } catch (err) {}
  try {
    await run(`ALTER TABLE bilhetes ADD COLUMN codigo_visualizacao TEXT UNIQUE`);
  } catch (err) {}
  try {
    await run(`ALTER TABLE bilhetes ADD COLUMN status_pagamento TEXT DEFAULT 'PENDING'`);
  } catch (err) {}
  try {
    await run(`ALTER TABLE bilhetes ADD COLUMN pix_id TEXT`);
  } catch (err) {}

  // Create fotos table
  await run(`
    CREATE TABLE IF NOT EXISTS fotos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rifa_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      ordem INTEGER DEFAULT 0,
      tipo TEXT DEFAULT 'foto',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (rifa_id) REFERENCES rifas(id) ON DELETE CASCADE
    )
  `);

  // Adicionar coluna tipo se não existir
  try {
    await run(`ALTER TABLE fotos ADD COLUMN tipo TEXT DEFAULT 'foto'`);
  } catch (err) {}

  console.log('Database initialized successfully');
}

export { db, run, get, all, initDatabase };

