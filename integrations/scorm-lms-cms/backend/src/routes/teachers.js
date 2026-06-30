'use strict';
const router = require('express').Router();
const { v4: uuid } = require('uuid');
const { query } = require('../db');
const { requireRole } = require('../middleware/auth');

// POST /api/ey/teachers/:teacherId/groups
router.post('/:teacherId/groups', requireRole('teacher','admin'), async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { name, purpose, class_id } = req.body;
    if (!name || !purpose || !class_id) {
      return res.status(400).json({ error: 'name, purpose and class_id are required.' });
    }
    const groupId = uuid();
    await query(
      `INSERT INTO groups (id, class_id, teacher_id, name, purpose) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO NOTHING`,
      [groupId, class_id, teacherId, name, purpose]
    );
    res.status(201).json({ group_id: groupId, name, purpose });
  } catch (err) { next(err); }
});

// GET /api/ey/teachers/:teacherId/assignments
router.get('/:teacherId/assignments', requireRole('teacher','admin'), async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const assignments = await query(
      `SELECT id, target_type, target_id, assignment_type, due_date, created_at
       FROM assignments WHERE teacher_id = $1 ORDER BY created_at DESC`,
      [teacherId]
    );
    res.json({ teacher_id: teacherId, assignments: assignments.rows });
  } catch (err) { next(err); }
});

module.exports = router;
