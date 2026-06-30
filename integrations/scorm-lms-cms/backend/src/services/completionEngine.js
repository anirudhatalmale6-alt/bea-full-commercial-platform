'use strict';

function clampPercent(value) {
  const n = Number(value || 0);
  return Math.max(0, Math.min(100, n));
}

function evaluateLessonCompletion(event, rules = {}) {
  const type = event.event_type;
  const value = event.value || {};
  const defaults = {
    video_threshold_percent: 90,
    assessment_pass_score: 80,
    scorm_mastery_score: 80,
  };
  const config = { ...defaults, ...rules };

  if (type === 'video_progress') {
    const watched = clampPercent(value.percent_watched);
    return {
      status: watched >= config.video_threshold_percent ? 'completed' : 'in_progress',
      score: watched,
      evidence: { watched, threshold: config.video_threshold_percent },
    };
  }

  if (type === 'scorm_result') {
    const score = Number(value.score_raw || value.score || 0);
    const complete = ['completed', 'passed'].includes(value.lesson_status) || ['completed'].includes(value.completion_status);
    const passed = score >= config.scorm_mastery_score || value.success_status === 'passed' || value.lesson_status === 'passed';
    return {
      status: passed ? 'passed' : complete ? 'completed' : 'in_progress',
      score,
      evidence: { ...value, mastery_score: config.scorm_mastery_score },
    };
  }

  if (type === 'assessment_result') {
    const score = Number(value.score || 0);
    return {
      status: score >= config.assessment_pass_score ? 'passed' : 'failed',
      score,
      evidence: { ...value, pass_score: config.assessment_pass_score },
    };
  }

  if (type === 'resource_downloaded') {
    return {
      status: 'completed',
      score: null,
      evidence: value,
    };
  }

  if (type === 'interactive_activity_result') {
    const score = Number(value.accuracy || value.score || 0);
    return {
      status: score >= 80 ? 'passed' : 'completed',
      score,
      evidence: value,
    };
  }

  return { status: 'in_progress', score: null, evidence: value };
}

module.exports = { evaluateLessonCompletion };
