'use strict';

/**
 * BEA Adaptive Engine v1.2
 *
 * Implements all rules from BEA_Early_Years_Adaptive_Game_Engine_Spec_v1_2.json
 *
 * Placement rules:  EY-PLACEMENT-001/002/003
 * During-activity:  EY-DURING-001/002/003/004/005
 * Post-activity:    EY-POST-001/002/003/004
 */

// ── Placement ────────────────────────────────────────────────────────────────

/**
 * @param {{ diagnostic_score: number, prompt_level: number, error_type?: string|null }} event
 * @returns {{ rule_id: string, route: string }}
 */
function evaluatePlacement({ diagnostic_score, prompt_level, error_type }) {
  const FOUNDATIONAL_ERRORS = [
    'phonological_awareness','letter_sound_correspondence','phonemic_blending',
    'cvc_decoding','print_concept','number_sequence','one_to_one_counting',
  ];

  if (diagnostic_score >= 85 && prompt_level <= 1) {
    return { rule_id: 'EY-PLACEMENT-001', route: 'start_at_current_grade_core_plus_challenge' };
  }
  if (diagnostic_score >= 70 && diagnostic_score <= 84) {
    return { rule_id: 'EY-PLACEMENT-002', route: 'start_at_current_grade_core_with_guided_intro' };
  }
  if (diagnostic_score < 70 || (error_type && FOUNDATIONAL_ERRORS.includes(error_type))) {
    return { rule_id: 'EY-PLACEMENT-003', route: 'start_at_prerequisite_skill_path' };
  }
  // Default fallback
  return { rule_id: 'EY-PLACEMENT-002', route: 'start_at_current_grade_core_with_guided_intro' };
}

// ── During-activity ──────────────────────────────────────────────────────────

/**
 * @param {{
 *   accuracy: number,
 *   prompt_level: number,
 *   attempt_count: number,
 *   consecutive_same_error_count: number,
 *   error_type?: string|null,
 *   response_time_seconds: number,
 *   baseline_average_response_time_seconds: number,
 *   learner_exit_count?: number,
 * }} attempt
 * @returns {{ rule_id: string, action: string, next_item?: string }|null}
 */
function evaluateDuringActivity(attempt) {
  const {
    accuracy, prompt_level, attempt_count, consecutive_same_error_count,
    error_type, response_time_seconds, baseline_average_response_time_seconds,
    learner_exit_count = 0,
  } = attempt;

  // EY-DURING-001 (priority 10) — consecutive same error
  if (consecutive_same_error_count >= 2 && error_type) {
    return {
      rule_id: 'EY-DURING-001',
      action: 'pause_game_show_error_type_targeted_mini_teach_then_retry_parallel_item',
      feedback_key: error_type,
    };
  }

  // EY-DURING-002 (priority 20) — general low accuracy
  if (attempt_count >= 5 && accuracy < 0.7) {
    return {
      rule_id: 'EY-DURING-002',
      action: 'reduce_difficulty_add_audio_visual_scaffold',
      feedback_key: error_type || 'fallback',
    };
  }

  // EY-DURING-003 (priority 30) — mastery + fluency — offer challenge
  if (
    accuracy >= 0.9 &&
    response_time_seconds <= baseline_average_response_time_seconds * 1.1 &&
    prompt_level <= 1
  ) {
    return {
      rule_id: 'EY-DURING-003',
      action: 'offer_challenge_item_and_bonus_badge',
      feedback_key: 'success',
    };
  }

  // EY-DURING-004 (priority 40) — fluency hesitation (accurate but slow)
  if (
    response_time_seconds > baseline_average_response_time_seconds * 1.5 &&
    accuracy === 1.0
  ) {
    return {
      rule_id: 'EY-DURING-004',
      action: 'keep_skill_as_nearly_mastered_add_fluency_practice',
      feedback_key: 'fluency_hesitation',
    };
  }

  // EY-DURING-005 (priority 50) — learner disengagement
  if (learner_exit_count >= 2) {
    return {
      rule_id: 'EY-DURING-005',
      action: 'recommend_shorter_activity_and_notify_teacher',
      feedback_key: 'attention_task_completion',
    };
  }

  return null;
}

// ── Post-activity ────────────────────────────────────────────────────────────

/**
 * @param {{
 *   rolling_accuracy: number,
 *   skill_session_count_meeting_mastery_threshold: number,
 *   max_prompt_level_last_two_sessions: number,
 *   needs_support_session_count_rolling: number,
 *   consecutive_same_error_count?: number,
 * }} aggregate
 * @returns {{ rule_id: string, action: string, mastery_status: string }}
 */
function evaluatePostActivity(aggregate) {
  const {
    rolling_accuracy,
    skill_session_count_meeting_mastery_threshold,
    max_prompt_level_last_two_sessions,
    needs_support_session_count_rolling,
    consecutive_same_error_count = 0,
  } = aggregate;

  // EY-POST-001 — mastered
  if (
    skill_session_count_meeting_mastery_threshold >= 2 &&
    rolling_accuracy >= 0.85 &&
    max_prompt_level_last_two_sessions <= 2
  ) {
    return {
      rule_id: 'EY-POST-001',
      action: 'mark_skill_mastered_unlock_next_skill_and_downloadable_home_card',
      mastery_status: 'mastered',
    };
  }

  // EY-POST-004 — intensive pathway (check before 003 — higher persistence)
  if (needs_support_session_count_rolling >= 3) {
    return {
      rule_id: 'EY-POST-004',
      action: 'flag_for_teacher_review_and_intensive_pathway',
      mastery_status: 'needs_support',
    };
  }

  // EY-POST-003 — needs support
  if (rolling_accuracy < 0.7 || consecutive_same_error_count >= 2) {
    return {
      rule_id: 'EY-POST-003',
      action: 'assign_error_type_targeted_mini_teach_teacher_small_group_card_parent_practice',
      mastery_status: 'needs_support',
    };
  }

  // EY-POST-002 — practising
  if (rolling_accuracy >= 0.7 && rolling_accuracy < 0.85) {
    return {
      rule_id: 'EY-POST-002',
      action: 'schedule_spaced_practice_after_24_72_hours',
      mastery_status: rolling_accuracy >= 0.8 ? 'nearly_mastered' : 'practising',
    };
  }

  return {
    rule_id: null,
    action: 'continue_current_pathway',
    mastery_status: 'practising',
  };
}

// ── Mastery status derivation ────────────────────────────────────────────────

/**
 * Compute rolling accuracy from last N sessions.
 * @param {number[]} accuracies
 * @param {number} window
 */
function rollingAccuracy(accuracies, window = 5) {
  if (!accuracies.length) return 0;
  const slice = accuracies.slice(-window);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

/**
 * Derives a mastery_evidence update from session completion data.
 */
function deriveAggregateUpdate({
  currentMastery,
  sessionAccuracy,
  sessionMaxPromptLevel,
  consecutiveSameErrorCount = 0,
  learnerExitCount = 0,
}) {
  const prev = currentMastery || {
    rolling_accuracy: 0,
    skill_session_count_meeting_mastery_threshold: 0,
    max_prompt_level_last_two_sessions: 4,
    needs_support_session_count_rolling: 0,
    status: 'not_started',
  };

  const newRollingAccuracy = prev.rolling_accuracy === 0
    ? sessionAccuracy
    : (prev.rolling_accuracy * 0.6 + sessionAccuracy * 0.4); // exponential moving avg

  const meetsThreshold = sessionAccuracy >= 0.85 && sessionMaxPromptLevel <= 2;
  const newSessionCount = meetsThreshold
    ? prev.skill_session_count_meeting_mastery_threshold + 1
    : prev.skill_session_count_meeting_mastery_threshold;

  const needsSupport = sessionAccuracy < 0.7 || consecutiveSameErrorCount >= 2;
  const newNeedsSupportCount = needsSupport
    ? prev.needs_support_session_count_rolling + 1
    : Math.max(0, prev.needs_support_session_count_rolling - 1);

  const updated = {
    rolling_accuracy: Math.round(newRollingAccuracy * 1000) / 1000,
    skill_session_count_meeting_mastery_threshold: newSessionCount,
    max_prompt_level_last_two_sessions: sessionMaxPromptLevel,
    needs_support_session_count_rolling: newNeedsSupportCount,
  };

  const result = evaluatePostActivity({
    ...updated,
    consecutive_same_error_count: consecutiveSameErrorCount,
  });

  updated.status = result.mastery_status;
  updated.post_activity_rule = result;

  return updated;
}

module.exports = { evaluatePlacement, evaluateDuringActivity, evaluatePostActivity, deriveAggregateUpdate, rollingAccuracy };
