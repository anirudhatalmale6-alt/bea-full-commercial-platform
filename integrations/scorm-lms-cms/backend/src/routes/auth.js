'use strict';
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../db');

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

      const { email, password } = req.body;
      const result = await query(
        'SELECT id, tenant_id, role, display_name, password_hash FROM users WHERE email = $1',
        [email]
      );
      const user = result.rows[0];
      if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(401).json({ error: 'Invalid credentials.' });

      const token = jwt.sign(
        { sub: user.id, tenant_id: user.tenant_id, role: user.role, display_name: user.display_name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );

      res.json({ token, role: user.role, display_name: user.display_name, user_id: user.id });
    } catch (err) { next(err); }
  }
);

router.post('/refresh', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token.' });
  try {
    const old = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const token = jwt.sign(
      { sub: old.sub, tenant_id: old.tenant_id, role: old.role, display_name: old.display_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
    res.json({ token });
  } catch {
    res.status(401).json({ error: 'Token invalid or expired.' });
  }
});

module.exports = router;
