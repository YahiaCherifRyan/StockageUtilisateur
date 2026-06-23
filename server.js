const express = require('express');
const session = require('express-session');
const path = require('path');

// Initialise la BDD dès le démarrage
require('./database');

const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Sessions
app.use(session({
  secret: 'mon_secret_rbac_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 24h
}));

// Routes
app.use('/auth', authRoutes);

// Middleware de vérification de permission
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Non connecté.' });
    }
    if (!req.session.user.permissions.includes(permission)) {
      return res.status(403).json({ success: false, message: 'Permission refusée.' });
    }
    next();
  };
}

// Exemple de route protégée (lecture)
app.get('/api/data', requirePermission('read'), (req, res) => {
  res.json({ success: true, data: 'Données accessibles en lecture.' });
});

// Exemple de route protégée (admin seulement)
app.post('/api/data', requirePermission('create'), (req, res) => {
  res.json({ success: true, message: 'Donnée créée.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  console.log(`💡 Aucun utilisateur créé. Utilisez le CLI pour en créer un :`);
  console.log(`   node cli.js create-user --username Ryan --password motdepasse --role admin`);
});
