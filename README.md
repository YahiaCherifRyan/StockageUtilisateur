# Projet RBAC — Node.js + SQLite

Système d'authentification avec gestion des rôles et permissions (RBAC) en Node.js, Express et SQLite.

---

## Prérequis

- [Node.js LTS](https://nodejs.org) installé sur votre machine

---

## Installation

```bash
# 1. Cloner le repo
git clone <url-du-repo>
cd projet

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur
node server.js
```

Le site est accessible sur **http://localhost:3000**

> La base de données `database.db` est créée automatiquement au premier lancement.  
> Les rôles `admin` et `visiteur` sont insérés automatiquement.

---

## CLI — Gestion via terminal

Ouvrir un **second terminal** dans le dossier du projet, puis :

### Utilisateurs

```bash
# Créer un utilisateur
node cli.js create-user --username Ryan --password motdepasse --role admin
node cli.js create-user --username Jean --password 12345 --role visiteur

# Lister les utilisateurs
node cli.js list-users

# Supprimer un utilisateur
node cli.js delete-user --username Jean
```

### Rôles

```bash
# Créer un rôle
node cli.js create-role --nom moderateur --description "Modération du contenu"

# Lister les rôles
node cli.js list-roles

# Supprimer un rôle (admin et visiteur sont protégés)
node cli.js delete-role --nom moderateur
```

### Permissions

```bash
# Ajouter une permission à un rôle
node cli.js add-permission --role moderateur --permission read
node cli.js add-permission --role moderateur --permission delete

# Retirer une permission
node cli.js remove-permission --role moderateur --permission delete

# Lister toutes les permissions
node cli.js list-permissions

# Lister les permissions d'un rôle spécifique
node cli.js list-permissions --role moderateur
```

Permissions disponibles : `create`, `read`, `update`, `delete`

---

## Structure du projet

```
projet/
├── public/
│   ├── index.html      → Page principale (tableau de bord)
│   ├── login.html      → Page de connexion
│   └── style.css       → Styles
├── routes/
│   └── auth.js         → Routes login / logout / session
├── server.js           → Serveur Express
├── database.js         → Initialisation SQLite
├── cli.js              → Interface ligne de commande
├── database.db         → Fichier BDD (généré automatiquement)
└── package.json
```

---

## Base de données

| Table | Description |
|---|---|
| `roles` | Les rôles disponibles (admin, visiteur, ...) |
| `permissions` | Les permissions par rôle (create/read/update/delete) |
| `users` | Les utilisateurs avec leur rôle |

> Ajouter un nouveau rôle ou modifier des permissions ne nécessite **aucune modification du code**.

---

## Sécurité

- Mots de passe hashés avec **bcrypt** (salt rounds : 10)
- Sessions côté serveur avec **express-session**
- Vérification des permissions à chaque requête via la base de données
- Clés étrangères SQLite activées

---

## Démarrage rapide

```bash
npm install
node server.js
# Dans un autre terminal :
node cli.js create-user --username admin --password admin123 --role admin
# Ouvrir http://localhost:3000/login.html
```
