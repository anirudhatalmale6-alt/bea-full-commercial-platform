'use strict';
const router = require('express').Router();
const { v4: uuid } = require('uuid');
const { query } = require('../db');
const { requireRole } = require('../middleware/auth');

// GET /api/ey/classes/:classId/skills
router.get('/:classId/skills', requireRole('teacher','admin'), async (req, res, next) => {
  try {
    const { classId } = req.params;

    const heatmap = await query(
      `SELECT s.skill_code, s.name as skill_name, st.subject, s.grade_band,
              me.status, me.rolling_accuracy, l.id as learner_id, u.display_name
       FROM learners l
       JOIN users u ON u.id = l.user_id
       LEFT JOIN mastery_evidence me ON me.learner_id = l.id
       LEFT JOIN skills s ON s.id = me.skill_id
       LEFT JOIN strands st ON st.id = s.strand_id
       WHERE l.class_id = $1
       ORDER BY st.subject, s.grade_band, s.skill_code, u.display_name`,
      [classId]
    );

    // Aggregate by skill
    const bySkill = {};
    for (const row of heatmap.rows) {
      if (!row.skill_code) continue;
      if (!bySkill[row.skill_code]) {
        bySkill[row.skill_code] = {
          skill_code: row.skill_code,
          skill_name: row.skill_name,
          subject: row.subject,
          grade_band: row.grade_band,
          learners: [],
        };
      }
      bySkill[row.skill_code].learners.push({
        learner_id: row.learner_id,
        display_name: row.display_name,
        status: row.status || 'not_started',
        rolling_accuracy: row.rolling_accuracy || 0,
      });
    }

    res.json({ class_id: classId, skills: Object.values(bySkill) });
  } catch (err) { next(err); }
});

// GET /api/ey/classes/:classId/learners
router.get('/:classId/learners', requireRole('teacher','admin'), async (req, res, next) => {
  try {
    const { classId } = req.params;
    const learners = await query(
      `SELECT l.id, u.display_name, l.grade_band,
              COUNT(DISTINCT me.skill_id) FILTER (WHERE me.status = 'mastered') as mastered_skills,
              COUNT(DISTINCT me.skill_id) FILTER (WHERE me.status = 'needs_support') as needs_support_skills,
              SUM(r.points) as total_stars
       FROM learners l
       JOIN users u ON u.id = l.user_id
       LEFT JOIN mastery_evidence me ON me.learner_id = l.id
       LEFT JOIN rewards r ON r.learner_id = l.id AND r.reward_type = 'star'
       WHERE l.class_id = $1
       GROUP BY l.id, u.display_name, l.grade_band
       ORDER BY u.display_name`,
      [classId]
    );
    res.json({ class_id: classId, learners: learners.rows });
  } catch (err) { next(err); }
});

// POST /api/ey/classes/:classId/assignments
router.post('/:classId/assignments', requireRole('teacher','admin'), async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { assignment_type, payload, due_date } = req.body;
    if (!assignment_type || !payload) {
      return res.status(400).json({ error: 'assignment_type and payload are required.' });
    }

    const assignmentId = uuid();
    await query(
      `INSERT INTO assignments (id, teacher_id, target_type, target_id, assignment_type, payload_json, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [assignmentId, req.user.sub, 'class', classId, assignment_type, JSON.stringify(payload), due_date || null]
    );
    res.status(201).json({ assignment_id: assignmentId, created_at: new Date() });
  } catch (err) { next(err); }
});

module.exports = router;
