'use strict';
const router = require('express').Router();
const { query } = require('../db');

// GET /api/ey/curriculum/scope?grade_band=Pre-K
router.get('/scope', async (req, res, next) => {
  try {
    const { grade_band } = req.query;
    let sql = `SELECT grade_band, week, unit, skill_focus, core_routine, downloadable, assessment
               FROM scope_sequence`;
    const params = [];
    if (grade_band) { params.push(grade_band); sql += ` WHERE grade_band = $1`; }
    sql += ` ORDER BY grade_band, week`;
    const result = await query(sql, params);
    res.json({ grade_band: grade_band || 'all', weeks: result.rows });
  } catch (err) { next(err); }
});

// GET /api/ey/curriculum/resources?type=CEFR&module=A1-M01
router.get('/resources', async (req, res, next) => {
  try {
    const { module, grade_band, source = 'cefr' } = req.query;

    if (source === 'cefr') {
      let sql = `SELECT id, module_code, resource_type, title, format, editable, adaptive_use
                 FROM cefr_module_resources`;
      const params = [];
      if (module) { params.push(module); sql += ` WHERE module_code = $1`; }
      sql += ` ORDER BY module_code, resource_type LIMIT 200`;
      const result = await query(sql, params);
      return res.json({ source: 'cefr', resources: result.rows });
    }

    // Early-years resources
    let sql = `SELECT id, grade_band, resource_type, title, format, editable, adaptive_use
               FROM ey_resources`;
    const params = [];
    if (grade_band) { params.push(grade_band); sql += ` WHERE grade_band = $1`; }
    sql += ` ORDER BY grade_band, resource_type LIMIT 200`;
    const result = await query(sql, params);
    res.json({ source: 'early_years', resources: result.rows });
  } catch (err) { next(err); }
});

module.exports = router;
