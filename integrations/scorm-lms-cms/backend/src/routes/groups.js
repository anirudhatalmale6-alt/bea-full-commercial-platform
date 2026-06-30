'use strict';
const router = require('express').Router();
const { v4: uuid } = require('uuid');
const { query } = require('../db');
const { requireRole } = require('../middleware/auth');

// POST /api/ey/groups/:groupId/assignments
router.post('/:groupId/assignments', requireRole('teacher','admin'), async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { assignment_type, payload, due_date } = req.body;
    if (!assignment_type || !payload) {
      return res.status(400).json({ error: 'assignment_type and payload are required.' });
    }
    const id = uuid();
    await query(
      `INSERT INTO assignments (id, teacher_id, target_type, target_id, assignment_type, payload_json, due_date)
       VALUES ($1,$2,'group',$3,$4,$5,$6)`,
      [id, req.user.sub, groupId, assignment_type, JSON.stringify(payload), due_date || null]
    );
    res.status(201).json({ assignment_id: id, created_at: new Date() });
  } catch (err) { next(err); }
});

module.exports = router;
