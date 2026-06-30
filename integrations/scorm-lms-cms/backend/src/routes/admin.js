'use strict';
const router = require('express').Router();
const { query } = require('../db');
const { requireRole } = require('../middleware/auth');
const telemetrySchema = require('../validators/telemetry');

// GET /api/ey/admin/tenants/:tenantId/telemetry/schema
router.get('/tenants/:tenantId/telemetry/schema', requireRole('admin'), async (req, res, next) => {
  try {
    res.json({
      tenant_id: req.params.tenantId,
      schema_version: '1.2.0',
      error_type_enum: telemetrySchema.ERROR_TYPE_ENUM,
    });
  } catch (err) { next(err); }
});

// GET /api/ey/admin/tenants/:tenantId/content/coverage
router.get('/tenants/:tenantId/content/coverage', requireRole('admin'), async (req, res, next) => {
  try {
    const eyCoverage = await query(
      `SELECT st.subject, s.grade_band, COUNT(a.id) as activity_count,
              COUNT(DISTINCT s.id) as skill_count
       FROM activities a JOIN skills s ON s.id = a.skill_id JOIN strands st ON st.id = s.strand_id
       GROUP BY st.subject, s.grade_band ORDER BY st.subject, s.grade_band`
    );
    const cefrCoverage = await query(
      `SELECT c.cefr_level, c.course_name, COUNT(m.id) as module_count,
              COUNT(r.id) as resource_count
       FROM cefr_courses c
       LEFT JOIN cefr_modules m ON m.course_id = c.id
       LEFT JOIN cefr_module_resources r ON r.module_code = m.module_code
       GROUP BY c.cefr_level, c.course_name ORDER BY c.cefr_level`
    );
    const totals = await query(`
      SELECT
        (SELECT COUNT(*) FROM activities WHERE active = true) as ey_activities,
        (SELECT COUNT(*) FROM cefr_modules) as cefr_modules,
        (SELECT COUNT(*) FROM cefr_module_resources) as cefr_resources,
        (SELECT COUNT(*) FROM ey_resources) as ey_resources,
        (SELECT COUNT(*) FROM scope_sequence) as scope_weeks
    `);

    res.json({
      tenant_id: req.params.tenantId,
      totals: totals.rows[0],
      early_years_coverage: eyCoverage.rows,
      cefr_coverage: cefrCoverage.rows,
    });
  } catch (err) { next(err); }
});

// GET /api/ey/admin/tenants/:tenantId/audit
router.get('/tenants/:tenantId/audit', requireRole('admin'), async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const events = await query(
      `SELECT id, learner_id, actor_user_id, event_type, created_at
       FROM dashboard_events WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [req.params.tenantId, parseInt(limit)]
    );
    res.json({ tenant_id: req.params.tenantId, events: events.rows });
  } catch (err) { next(err); }
});

module.exports = router;
