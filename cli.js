const args = require('minimist')(process.argv.slice(2));
const bcrypt = require('bcryptjs');
const db = require('./database');

const command = args._[0];

function printTable(rows) {
  if (!rows || rows.length === 0) {
    console.log('  (aucun résultat)');
    return;
  }
  console.table(rows);
}

async function main() {
  switch (command) {

    // ─── UTILISATEURS ───────────────────────────────────────

    case 'create-user': {
      const { username, password, role } = args;
      if (!username || !password || !role) {
        console.error('❌ Usage : node cli.js create-user --username X --password X --role X');
        process.exit(1);
      }
      const roleRow = db.get('SELECT * FROM roles WHERE nom = ?', [role]);
      if (!roleRow) {
        console.error(`❌ Rôle "${role}" introuvable. Utilisez "node cli.js list-roles" pour voir les rôles disponibles.`);
        process.exit(1);
      }
      const existing = db.get('SELECT id FROM users WHERE username = ?', [username]);
      if (existing) {
        console.error(`❌ L'utilisateur "${username}" existe déjà.`);
        process.exit(1);
      }
      const hash = await bcrypt.hash(String(password), 10);
      db.run('INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)', [username, hash, roleRow.id]);
      console.log(`✅ Utilisateur "${username}" créé avec le rôle "${role}".`);
      break;
    }

    case 'list-users': {
      const users = db.all(`
        SELECT users.id, users.username, roles.nom as role
        FROM users
        JOIN roles ON users.role_id = roles.id
      `);
      console.log('\n📋 Liste des utilisateurs :');
      printTable(users);
      break;
    }

    case 'delete-user': {
      const { username } = args;
      if (!username) {
        console.error('❌ Usage : node cli.js delete-user --username X');
        process.exit(1);
      }
      const existing = db.get('SELECT id FROM users WHERE username = ?', [username]);
      if (!existing) {
        console.error(`❌ Utilisateur "${username}" introuvable.`);
      } else {
        db.run('DELETE FROM users WHERE username = ?', [username]);
        console.log(`✅ Utilisateur "${username}" supprimé.`);
      }
      break;
    }

    // ─── RÔLES ──────────────────────────────────────────────

    case 'create-role': {
      const { nom, description } = args;
      if (!nom) {
        console.error('❌ Usage : node cli.js create-role --nom X --description X');
        process.exit(1);
      }
      const existing = db.get('SELECT id FROM roles WHERE nom = ?', [nom]);
      if (existing) {
        console.error(`❌ Le rôle "${nom}" existe déjà.`);
        process.exit(1);
      }
      db.run('INSERT INTO roles (nom, description) VALUES (?, ?)', [nom, description || '']);
      console.log(`✅ Rôle "${nom}" créé.`);
      break;
    }

    case 'list-roles': {
      const roles = db.all('SELECT * FROM roles');
      console.log('\n📋 Liste des rôles :');
      printTable(roles);
      break;
    }

    case 'delete-role': {
      const { nom } = args;
      if (!nom) {
        console.error('❌ Usage : node cli.js delete-role --nom X');
        process.exit(1);
      }
      if (nom === 'admin' || nom === 'visiteur') {
        console.error(`❌ Le rôle "${nom}" est un rôle système, il ne peut pas être supprimé.`);
        process.exit(1);
      }
      const existing = db.get('SELECT id FROM roles WHERE nom = ?', [nom]);
      if (!existing) {
        console.error(`❌ Rôle "${nom}" introuvable.`);
      } else {
        db.run('DELETE FROM roles WHERE nom = ?', [nom]);
        console.log(`✅ Rôle "${nom}" supprimé.`);
      }
      break;
    }

    // ─── PERMISSIONS ────────────────────────────────────────

    case 'add-permission': {
      const { role, permission } = args;
      if (!role || !permission) {
        console.error('❌ Usage : node cli.js add-permission --role X --permission X');
        process.exit(1);
      }
      const validPerms = ['create', 'read', 'update', 'delete'];
      if (!validPerms.includes(permission)) {
        console.error(`❌ Permission invalide. Valeurs acceptées : ${validPerms.join(', ')}`);
        process.exit(1);
      }
      const roleRow = db.get('SELECT * FROM roles WHERE nom = ?', [role]);
      if (!roleRow) {
        console.error(`❌ Rôle "${role}" introuvable.`);
        process.exit(1);
      }
      const existing = db.get('SELECT id FROM permissions WHERE role_id = ? AND permission = ?', [roleRow.id, permission]);
      if (existing) {
        console.error(`❌ Le rôle "${role}" a déjà la permission "${permission}".`);
      } else {
        db.run('INSERT INTO permissions (role_id, permission) VALUES (?, ?)', [roleRow.id, permission]);
        console.log(`✅ Permission "${permission}" ajoutée au rôle "${role}".`);
      }
      break;
    }

    case 'remove-permission': {
      const { role, permission } = args;
      if (!role || !permission) {
        console.error('❌ Usage : node cli.js remove-permission --role X --permission X');
        process.exit(1);
      }
      const roleRow = db.get('SELECT * FROM roles WHERE nom = ?', [role]);
      if (!roleRow) {
        console.error(`❌ Rôle "${role}" introuvable.`);
        process.exit(1);
      }
      const existing = db.get('SELECT id FROM permissions WHERE role_id = ? AND permission = ?', [roleRow.id, permission]);
      if (!existing) {
        console.error(`❌ Permission "${permission}" non trouvée pour le rôle "${role}".`);
      } else {
        db.run('DELETE FROM permissions WHERE role_id = ? AND permission = ?', [roleRow.id, permission]);
        console.log(`✅ Permission "${permission}" retirée du rôle "${role}".`);
      }
      break;
    }

    case 'list-permissions': {
      const { role } = args;
      if (!role) {
        const perms = db.all(`
          SELECT roles.nom as role, permissions.permission
          FROM permissions
          JOIN roles ON permissions.role_id = roles.id
          ORDER BY roles.nom
        `);
        console.log('\n📋 Toutes les permissions :');
        printTable(perms);
      } else {
        const roleRow = db.get('SELECT * FROM roles WHERE nom = ?', [role]);
        if (!roleRow) {
          console.error(`❌ Rôle "${role}" introuvable.`);
          process.exit(1);
        }
        const perms = db.all('SELECT permission FROM permissions WHERE role_id = ?', [roleRow.id]);
        console.log(`\n📋 Permissions du rôle "${role}" :`);
        printTable(perms);
      }
      break;
    }

    // ─── AIDE ───────────────────────────────────────────────

    default: {
      console.log(`
🛠️  CLI RBAC - Commandes disponibles :

  Utilisateurs :
    node cli.js create-user --username X --password X --role X
    node cli.js list-users
    node cli.js delete-user --username X

  Rôles :
    node cli.js create-role --nom X --description X
    node cli.js list-roles
    node cli.js delete-role --nom X

  Permissions :
    node cli.js add-permission --role X --permission X
    node cli.js remove-permission --role X --permission X
    node cli.js list-permissions [--role X]

  Permissions disponibles : create, read, update, delete
      `);
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
});
