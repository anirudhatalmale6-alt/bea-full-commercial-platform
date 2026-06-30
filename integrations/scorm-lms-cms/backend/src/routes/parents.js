'use strict';
const router = require('express').Router();
const { query } = require('../db');

// GET /api/ey/parents/:parentId/learners/:learnerId/summary
router.get('/:parentId/learners/:learnerId/summary', async (req, res, next) => {
  try {
    const { parentId, learnerId } = req.params;

    // Authorisation: parents may only view their own learners
    if (req.user.role === 'parent' && req.user.sub !== parentId) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const link = await query(
      `SELECT 1 FROM learners WHERE id = $1 AND (parent_user_id = $2 OR $3 IN ('teacher','admin'))`,
      [learnerId, parentId, req.user.role]
    );
    if (!link.rows.length && req.user.role === 'parent') {
      return res.status(403).json({ error: 'This learner is not linked to your account.' });
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sessions = await query(
      `SELECT COUNT(*) as sessions FROM sessions WHERE learner_id = $1 AND started_at > $2`,
      [learnerId, weekAgo]
    );
    const avgAcc = await query(
      `SELECT AVG(rolling_accuracy) as avg FROM mastery_evidence WHERE learner_id = $1`,
      [learnerId]
    );
    const mastered = await query(
      `SELECT s.name FROM mastery_evidence me JOIN skills s ON s.id = me.skill_id
       WHERE me.learner_id = $1 AND me.status = 'mastered' ORDER BY me.updated_at DESC LIMIT 3`,
      [learnerId]
    );
    const rewards = await query(
      `SELECT SUM(points) as total FROM rewards WHERE learner_id = $1 AND reward_type = 'star'`,
      [learnerId]
    );

    res.json({
      learner_id: learnerId,
      weekly_summary: {
        sessions_completed: parseInt(sessions.rows[0]?.sessions || 0),
        average_accuracy: parseFloat(avgAcc.rows[0]?.avg || 0).toFixed(2),
        stars_earned: parseInt(rewards.rows[0]?.total || 0),
      },
      recently_mastered: mastered.rows.map(r => r.name),
      celebration_message: mastered.rows.length
        ? `Great work! ${mastered.rows[0].name} was mastered this week.`
        : 'Keep practising — progress is happening every day.',
      home_practice: [
        { title: 'Read together for 10 minutes', type: 'reading' },
        { title: 'Play the listening game', type: 'activity' },
      ],
    });
  } catch (err) { next(err); }
});

module.exports = router;
