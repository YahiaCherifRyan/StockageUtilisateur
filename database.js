const { Database } = require('node-sqlite3-wasm');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.db'));

// Activation des clés étrangères
db.exec('PRAGMA foreign_keys = ON');

// Création des tables
db.exec(`
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT UNIQUE NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL,
    permission TEXT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
  );
`);

// Insertion des rôles par défaut au premier lancement
const rolesExistants = db.get('SELECT COUNT(*) as count FROM roles');
if (rolesExistants.count === 0) {
  db.run('INSERT INTO roles (nom, description) VALUES (?, ?)', ['admin', 'Accès total à toutes les fonctionnalités']);
  db.run('INSERT INTO roles (nom, description) VALUES (?, ?)', ['visiteur', 'Lecture seule']);

  const adminRole = db.get('SELECT id FROM roles WHERE nom = ?', ['admin']);
  const visiteurRole = db.get('SELECT id FROM roles WHERE nom = ?', ['visiteur']);

  ['create', 'read', 'update', 'delete'].forEach(p => {
    db.run('INSERT INTO permissions (role_id, permission) VALUES (?, ?)', [adminRole.id, p]);
  });
  db.run('INSERT INTO permissions (role_id, permission) VALUES (?, ?)', [visiteurRole.id, 'read']);

  console.log('✅ Rôles par défaut créés : admin, visiteur');
}

module.exports = db;
