'use strict';

/**
 * BEA CEFR Adaptive Engine
 *
 * Implements the routing rules from BEA_Adaptive_Rules.json
 * (BEA_Full_Comprehensive_Curriculum_Depth_Pack).
 *
 * Global thresholds:
 *   intensive_support: < 49
 *   guided_practice:   49–69
 *   targeted_review:   70–79
 *   mastery:           80–89
 *   extension:         >= 90
 *
 * Productive skills (speaking/writing) require rubric evidence in
 * addition to quiz scores; the effective score is the minimum of the
 * quiz score and any provided rubric scores, so a strong quiz cannot
 * mask a weak production task.
 */

const GLOBAL_THRESHOLDS = {
  intensive_support: 49,
  guided_practice: 69,
  targeted_review: 79,
  mastery: 80,
  extension: 90,
};

/**
 * Compute the effective module score. When rubric evidence is present
 * for productive skills, the lowest of {quiz, speaking, writing}
 * governs routing.
 *
 * @param {{ quiz_score?: number, speaking_rubric_score?: number, writing_rubric_score?: number }} scores
 * @returns {number}
 */
function effectiveScore({ quiz_score, speaking_rubric_score, writing_rubric_score }) {
  const present = [quiz_score, speaking_rubric_score, writing_rubric_score]
    .filter((v) => typeof v === 'number' && !Number.isNaN(v));
  if (!present.length) return 0;
  return Math.min(...present);
}

/**
 * Map an effective score to a CEFR module status + recommended action.
 *
 * @param {number} score
 * @returns {{ status: string, action: string }}
 */
function routeByScore(score) {
  if (score >= GLOBAL_THRESHOLDS.extension) {
    return { status: 'extension', action: 'unlock challenge task and portfolio evidence' };
  }
  if (score >= GLOBAL_THRESHOLDS.mastery) {
    return { status: 'mastered', action: 'advance to next module' };
  }
  if (score >= GLOBAL_THRESHOLDS.guided_practice + 1) {
    // 70–79 → targeted review
    return { status: 'targeted_review', action: 'assign targeted review of weak skill tags and re-check' };
  }
  if (score >= GLOBAL_THRESHOLDS.intensive_support + 1) {
    // 49 (exclusive) – 69 → guided practice
    return { status: 'guided_practice', action: 'assign guided practice mini-lessons and repeat skill check' };
  }
  // < 49 → intensive support
  return { status: 'intensive_support', action: 'assign intensive support pathway and teacher review' };
}

/**
 * Evaluate a CEFR module attempt and return the routing decision.
 *
 * @param {{
 *   module_code: string,
 *   quiz_score?: number,
 *   speaking_rubric_score?: number,
 *   writing_rubric_score?: number,
 *   skill_tags?: string[],
 * }} input
 * @returns {{ module_code: string, effective_score: number, status: string, action: string, rule_id: string }}
 */
function evaluateCefrModule(input) {
  const score = effectiveScore(input);
  const { status, action } = routeByScore(score);
  return {
    module_code: input.module_code,
    effective_score: score,
    status,
    action,
    rule_id: `RULE-${input.module_code}`,
  };
}

module.exports = { GLOBAL_THRESHOLDS, effectiveScore, routeByScore, evaluateCefrModule };
