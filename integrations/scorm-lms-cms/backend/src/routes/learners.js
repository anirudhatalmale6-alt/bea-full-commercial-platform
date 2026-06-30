'use strict';
const router = require('express').Router({ mergeParams: true });
const { v4: uuid } = require('uuid');
const { query, withTransaction } = require('../db');
const { validate } = require('../validators/telemetry');
const { evaluatePlacement, evaluateDuringActivity, deriveAggregateUpdate } = require('../services/adaptiveEngine');
const { requireRole } = require('../middleware/auth');

// GET /api/ey/learners/:learnerId/pathway
router.get('/:learnerId/pathway', async (req, res, next) => {
  try {
    const { learnerId } = req.params;

    const learnerResult = await query(
      `SELECT l.id, l.grade_band, u.display_name FROM learners l
       JOIN users u ON u.id = l.user_id WHERE l.id = $1`, [learnerId]
    );
    if (!learnerResult.rows.length) return res.status(404).json({ error: 'Learner not found.' });

    const mastery = await query(
      `SELECT me.status, me.rolling_accuracy, s.skill_code, s.name as skill_name,
              s.grade_band, st.subject
       FROM mastery_evidence me
       JOIN skills s ON s.id = me.skill_id
       JOIN strands st ON st.id = s.strand_id
       WHERE me.learner_id = $1
       ORDER BY me.updated_at DESC`, [learnerId]
    );

    // Recommend up to 3 not-yet-mastered activities
    const nextActivities = await query(
      `SELECT a.id, a.title, a.mechanic, a.subject, a.grade_band, s.skill_code
       FROM activities a
       JOIN skills s ON s.id = a.skill_id
       WHERE a.grade_band = $1 AND a.active = true
         AND s.skill_code NOT IN (
           SELECT s2.skill_code FROM mastery_evidence me2
           JOIN skills s2 ON s2.id = me2.skill_id
           WHERE me2.learner_id = $2 AND me2.status = 'mastered'
         )
       ORDER BY a.id LIMIT 3`,
      [learnerResult.rows[0].grade_band, learnerId]
    );

    const recentRewards = await query(
      `SELECT reward_type, points, created_at FROM rewards
       WHERE learner_id = $1 ORDER BY created_at DESC LIMIT 10`, [learnerId]
    );

    res.json({
      learner_id: learnerId,
      display_name: learnerResult.rows[0].display_name,
      grade_band: learnerResult.rows[0].grade_band,
      next_activities: nextActivities.rows,
      mastery_summary: mastery.rows,
      recent_rewards: recentRewards.rows,
    });
  } catch (err) { next(err); }
});

// POST /api/ey/learners/:learnerId/diagnostics
router.post('/:learnerId/diagnostics', async (req, res, next) => {
  try {
    const { learnerId } = req.params;
    const event = { ...req.body, event_type: 'diagnostic_event', learner_id: learnerId };

    const { valid, errors } = validate(event);
    if (!valid) return res.status(400).json({ errors });

    const score = event.diagnostic_score ?? Math.round(event.accuracy * 100);
    const placement = evaluatePlacement({
      diagnostic_score: score,
      prompt_level: event.prompt_level,
      error_type: event.error_type,
    });

    // Emit dashboard event
    const learner = await query('SELECT class_id FROM learners WHERE id = $1', [learnerId]);
    if (!learner.rows.length) return res.status(404).json({ error: 'Learner not found.' });

    const tenantResult = await query(
      `SELECT t.id FROM tenants t JOIN schools sc ON sc.tenant_id = t.id
       JOIN classes c ON c.school_id = sc.id WHERE c.id = $1`,
      [learner.rows[0].class_id]
    );

    if (tenantResult.rows.length) {
      await query(
        `INSERT INTO dashboard_events (tenant_id, learner_id, event_type, payload_json)
         VALUES ($1,$2,$3,$4)`,
        [tenantResult.rows[0].id, learnerId, 'diagnostic_complete',
         JSON.stringify({ ...event, placement })]
      );
    }

    res.status(201).json({
      learner_id: learnerId,
      diagnostic_score: score,
      placement_route: placement.route,
      rule_id: placement.rule_id,
    });
  } catch (err) { next(err); }
});

// POST /api/ey/learners/:learnerId/sessions
router.post('/:learnerId/sessions', async (req, res, next) => {
  try {
    const { learnerId } = req.params;
    const { activity_id, activity_version, device, locale = 'en-GB', item_seed } = req.body;

    if (!activity_id || !activity_version || !device) {
      return res.status(400).json({ error: 'activity_id, activity_version and device are required.' });
    }

    const versionRow = await query(
      `SELECT av.id FROM activity_versions av
       WHERE av.activity_id = $1 AND av.version = $2`, [activity_id, activity_version]
    );
    if (!versionRow.rows.length) {
      return res.status(404).json({ error: 'Activity version not found.' });
    }

    const sessionId = uuid();
    await query(
      `INSERT INTO sessions (id, learner_id, activity_id, activity_version_id, device, locale, item_seed)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [sessionId, learnerId, activity_id, versionRow.rows[0].id, device, locale, item_seed || null]
    );

    res.status(201).json({ session_id: sessionId, learner_id: learnerId, started_at: new Date() });
  } catch (err) { next(err); }
});

// POST /api/ey/learners/:learnerId/sessions/:sessionId/attempts
router.post('/:learnerId/sessions/:sessionId/attempts', async (req, res, next) => {
  try {
    const { learnerId, sessionId } = req.params;
    const event = { ...req.body, event_type: 'attempt_event', learner_id: learnerId, session_id: sessionId };

    const { valid, errors } = validate(event);
    if (!valid) return res.status(400).json({ errors });

    // Get item id — look up or use provided
    const itemRow = await query(
      `SELECT id FROM items WHERE id = $1`, [event.item_id]
    );
    if (!itemRow.rows.length) {
      return res.status(404).json({ error: `Item ${event.item_id} not found.` });
    }

    await query(
      `INSERT INTO attempts
         (learner_id, session_id, activity_id, item_id, accuracy, prompt_level,
          response_time_seconds, baseline_average_response_time_seconds,
          attempt_count, consecutive_same_error_count, error_type,
          hint_count, audio_replay_count, teacher_override)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [learnerId, sessionId, event.activity_id, event.item_id,
       event.accuracy, event.prompt_level, event.response_time_seconds,
       event.baseline_average_response_time_seconds, event.attempt_count,
       event.consecutive_same_error_count, event.error_type || null,
       event.hint_count, event.audio_replay_count, event.teacher_override || false]
    );

    const duringAction = evaluateDuringActivity(event);

    res.status(201).json({
      attempt_id: null, // BIGSERIAL — returned from DB in prod
      next_action: duringAction ? mapActionToNext(duringAction.action) : 'continue',
      feedback_key: duringAction?.feedback_key || null,
      adaptive_rule: duringAction?.rule_id || null,
    });
  } catch (err) { next(err); }
});

function mapActionToNext(action) {
  if (action.includes('mini_teach') || action.includes('scaffold')) return 'prompt_scaffold';
  if (action.includes('challenge')) return 'extend';
  if (action.includes('shorter')) return 'prompt_scaffold';
  return 'continue';
}

// POST /api/ey/learners/:learnerId/sessions/:sessionId/complete
router.post('/:learnerId/sessions/:sessionId/complete', async (req, res, next) => {
  try {
    const { learnerId, sessionId } = req.params;
    const event = { ...req.body, event_type: 'session_complete_event', learner_id: learnerId, session_id: sessionId };

    const { valid, errors } = validate(event);
    if (!valid) return res.status(400).json({ errors });

    // Get skill for this activity
    const sessionRow = await query(
      `SELECT s.activity_id, a.skill_id FROM sessions s
       JOIN activities a ON a.id = s.activity_id WHERE s.id = $1`, [sessionId]
    );
    if (!sessionRow.rows.length) return res.status(404).json({ error: 'Session not found.' });

    const skillId = sessionRow.rows[0].skill_id;

    // Get current mastery
    const masteryRow = await query(
      `SELECT * FROM mastery_evidence WHERE learner_id = $1 AND skill_id = $2`,
      [learnerId, skillId]
    );
    const currentMastery = masteryRow.rows[0] || null;

    // Session aggregate from attempts table
    const attemptsAgg = await query(
      `SELECT MAX(prompt_level) as max_prompt, MAX(consecutive_same_error_count) as max_errors
       FROM attempts WHERE session_id = $1`, [sessionId]
    );
    const sessionMaxPrompt = attemptsAgg.rows[0]?.max_prompt ?? event.prompt_level;
    const consecutiveSameErrorCount = attemptsAgg.rows[0]?.max_errors ?? (event.consecutive_same_error_count || 0);

    const updated = deriveAggregateUpdate({
      currentMastery,
      sessionAccuracy: event.accuracy,
      sessionMaxPromptLevel: sessionMaxPrompt,
      consecutiveSameErrorCount,
      learnerExitCount: event.learner_exit_count || 0,
    });

    await withTransaction(async (client) => {
      // Update mastery evidence
      await client.query(
        `INSERT INTO mastery_evidence
           (learner_id, skill_id, rolling_accuracy, skill_session_count_meeting_mastery_threshold,
            max_prompt_level_last_two_sessions, needs_support_session_count_rolling, status,
            last_mastery_date, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now())
         ON CONFLICT (learner_id, skill_id) DO UPDATE SET
           rolling_accuracy = EXCLUDED.rolling_accuracy,
           skill_session_count_meeting_mastery_threshold = EXCLUDED.skill_session_count_meeting_mastery_threshold,
           max_prompt_level_last_two_sessions = EXCLUDED.max_prompt_level_last_two_sessions,
           needs_support_session_count_rolling = EXCLUDED.needs_support_session_count_rolling,
           status = EXCLUDED.status,
           last_mastery_date = EXCLUDED.last_mastery_date,
           updated_at = now()`,
        [learnerId, skillId, updated.rolling_accuracy,
         updated.skill_session_count_meeting_mastery_threshold,
         updated.max_prompt_level_last_two_sessions,
         updated.needs_support_session_count_rolling,
         updated.status,
         updated.status === 'mastered' ? new Date().toISOString().split('T')[0] : currentMastery?.last_mastery_date || null]
      );

      // Mark session complete
      await client.query(
        `UPDATE sessions SET completed_at = now() WHERE id = $1`, [sessionId]
      );

      // Award star reward
      await client.query(
        `INSERT INTO rewards (id, learner_id, reward_type, source_activity_id, points)
         VALUES ($1,$2,$3,$4,$5)`,
        [uuid(), learnerId, 'star', sessionRow.rows[0].activity_id, Math.round(event.accuracy * 10)]
      );
    });

    res.json({
      session_id: sessionId,
      mastery_status: updated.status,
      next_route: updated.post_activity_rule.action,
      rule_id: updated.post_activity_rule.rule_id,
      reward: { type: 'star', points: Math.round(event.accuracy * 10) },
    });
  } catch (err) { next(err); }
});

module.exports = router;
