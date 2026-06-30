'use strict';
const router = require('express').Router();
const { query } = require('../db');

// GET /api/ey/activities
router.get('/', async (req, res, next) => {
  try {
    const { grade_band, subject, limit = 20, offset = 0 } = req.query;
    let sql = `SELECT a.id, a.title, a.mechanic, a.subject, a.grade_band, s.skill_code, s.name as skill_name
               FROM activities a JOIN skills s ON s.id = a.skill_id WHERE a.active = true`;
    const params = [];
    if (grade_band) { params.push(grade_band); sql += ` AND a.grade_band = $${params.length}`; }
    if (subject) { params.push(subject); sql += ` AND a.subject = $${params.length}`; }
    params.push(parseInt(limit)); sql += ` ORDER BY a.id LIMIT $${params.length}`;
    params.push(parseInt(offset)); sql += ` OFFSET $${params.length}`;
    const result = await query(sql, params);
    const total = await query('SELECT COUNT(*) as c FROM activities WHERE active = true');
    res.json({
      activities: result.rows,
      total: parseInt(total.rows[0].c),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) { next(err); }
});

// GET /api/ey/activities/:activityId
router.get('/:activityId', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT a.*, av.version, av.schema_json, s.skill_code, s.name as skill_name
       FROM activities a
       JOIN activity_versions av ON av.activity_id = a.id
       JOIN skills s ON s.id = a.skill_id
       WHERE a.id = $1 ORDER BY av.created_at DESC LIMIT 1`,
      [req.params.activityId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Activity not found.' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
