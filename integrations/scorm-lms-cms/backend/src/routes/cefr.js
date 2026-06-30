'use strict';
const router = require('express').Router();
const { v4: uuid } = require('uuid');
const { query } = require('../db');
const { requireRole } = require('../middleware/auth');
const { evaluateCefrModule, GLOBAL_THRESHOLDS } = require('../services/cefrEngine');

// GET /api/ey/cefr/courses  — list all 6 CEFR courses
router.get('/courses', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT c.id, c.cefr_level, c.course_name, c.learner_profile,
              COUNT(m.id) as module_count
       FROM cefr_courses c
       LEFT JOIN cefr_modules m ON m.course_id = c.id
       GROUP BY c.id, c.cefr_level, c.course_name, c.learner_profile
       ORDER BY c.cefr_level`
    );
    res.json({ courses: result.rows, thresholds: GLOBAL_THRESHOLDS });
  } catch (err) { next(err); }
});

// GET /api/ey/cefr/courses/:courseId/modules
router.get('/courses/:courseId/modules', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT module_code, module_title, theme_summary, grammar, vocabulary,
              function_focus, lesson_path, assessment, adaptive_tags, module_order
       FROM cefr_modules WHERE course_id = $1 ORDER BY module_order`,
      [req.params.courseId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Course not found or has no modules.' });
    res.json({ course_id: req.params.courseId, modules: result.rows });
  } catch (err) { next(err); }
});

// GET /api/ey/cefr/modules/:moduleCode  — full module + resources
router.get('/modules/:moduleCode', async (req, res, next) => {
  try {
    const mod = await query(
      `SELECT * FROM cefr_modules WHERE module_code = $1`, [req.params.moduleCode]
    );
    if (!mod.rows.length) return res.status(404).json({ error: 'Module not found.' });

    const resources = await query(
      `SELECT id, resource_type, title, format, editable, adaptive_use
       FROM cefr_module_resources WHERE module_code = $1 ORDER BY resource_type`,
      [req.params.moduleCode]
    );

    res.json({ ...mod.rows[0], resources: resources.rows });
  } catch (err) { next(err); }
});

// POST /api/ey/cefr/modules/:moduleCode/submit  — submit scores, get routing
router.post('/modules/:moduleCode/submit', async (req, res, next) => {
  try {
    const { moduleCode } = req.params;
    const { user_id, quiz_score, speaking_rubric_score, writing_rubric_score } = req.body;
    const targetUser = user_id || req.user.sub;

    // Authorisation: learners can only submit for themselves
    if (req.user.role === 'learner' && targetUser !== req.user.sub) {
      return res.status(403).json({ error: 'Cannot submit for another learner.' });
    }

    const mod = await query(
      `SELECT adaptive_tags FROM cefr_modules WHERE module_code = $1`, [moduleCode]
    );
    if (!mod.rows.length) return res.status(404).json({ error: 'Module not found.' });

    if (quiz_score == null && speaking_rubric_score == null && writing_rubric_score == null) {
      return res.status(400).json({ error: 'At least one score is required.' });
    }

    const decision = evaluateCefrModule({
      module_code: moduleCode,
      quiz_score,
      speaking_rubric_score,
      writing_rubric_score,
      skill_tags: mod.rows[0].adaptive_tags,
    });

    await query(
      `INSERT INTO cefr_module_progress
         (user_id, module_code, quiz_score, speaking_rubric_score, writing_rubric_score,
          status, recommended_action, rule_id, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now())
       ON CONFLICT (user_id, module_code) DO UPDATE SET
         quiz_score = EXCLUDED.quiz_score,
         speaking_rubric_score = EXCLUDED.speaking_rubric_score,
         writing_rubric_score = EXCLUDED.writing_rubric_score,
         status = EXCLUDED.status,
         recommended_action = EXCLUDED.recommended_action,
         rule_id = EXCLUDED.rule_id,
         updated_at = now()`,
      [targetUser, moduleCode, quiz_score ?? null, speaking_rubric_score ?? null,
       writing_rubric_score ?? null, decision.status, decision.action, decision.rule_id]
    );

    res.status(201).json(decision);
  } catch (err) { next(err); }
});

// GET /api/ey/cefr/learners/:userId/progress
router.get('/learners/:userId/progress', async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (req.user.role === 'learner' && userId !== req.user.sub) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const enrolments = await query(
      `SELECT c.id, c.cefr_level, c.course_name FROM cefr_enrolments e
       JOIN cefr_courses c ON c.id = e.course_id WHERE e.user_id = $1`, [userId]
    );

    const progress = await query(
      `SELECT p.module_code, m.module_title, p.status, p.quiz_score,
              p.speaking_rubric_score, p.writing_rubric_score, p.recommended_action, p.updated_at
       FROM cefr_module_progress p
       JOIN cefr_modules m ON m.module_code = p.module_code
       WHERE p.user_id = $1 ORDER BY p.updated_at DESC`, [userId]
    );

    res.json({ user_id: userId, enrolments: enrolments.rows, progress: progress.rows });
  } catch (err) { next(err); }
});

// POST /api/ey/cefr/learners/:userId/enrol
router.post('/learners/:userId/enrol', requireRole('teacher','admin'), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { course_id } = req.body;
    if (!course_id) return res.status(400).json({ error: 'course_id is required.' });

    const id = uuid();
    await query(
      `INSERT INTO cefr_enrolments (id, user_id, course_id)
       VALUES ($1,$2,$3) ON CONFLICT (user_id, course_id) DO NOTHING`,
      [id, userId, course_id]
    );
    res.status(201).json({ enrolment_id: id, user_id: userId, course_id });
  } catch (err) { next(err); }
});

module.exports = router;
