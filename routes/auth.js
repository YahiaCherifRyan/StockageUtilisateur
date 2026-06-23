const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');

const router = express.Router();

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Champs manquants.' });
  }

  const user = db.get(`
    SELECT users.*, roles.nom as role_nom
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE users.username = ?
  `, [username]);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Utilisateur introuvable.' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Mot de passe incorrect.' });
  }

  const permissions = db.all(
    'SELECT permission FROM permissions WHERE role_id = ?', [user.role_id]
  ).map(p => p.permission);

  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role_nom,
    role_id: user.role_id,
    permissions
  };

  res.json({ success: true, user: req.session.user });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// GET /auth/me
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Non connecté.' });
  }
  res.json({ success: true, user: req.session.user });
});

module.exports = router;
