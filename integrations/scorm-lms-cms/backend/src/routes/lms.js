'use strict';
const express = require('express');
const { query } = require('../db');
const { evaluateLessonCompletion } = require('../services/completionEngine');

const router = express.Router();
const fallbackCourses = require('../../../data/lms_course_catalogue.json');

router.get('/catalogue', async (req, res, next) => {
  try {
    try {
      const result = await query("SELECT course_key, title, cefr_level, description, status, metadata FROM lms_courses WHERE status='published' ORDER BY sort_order, title");
      return res.json({ courses: result.rows });
    } catch (_dbErr) {
      return res.json({ courses: fallbackCourses.courses });
    }
  } catch (err) { next(err); }
});

router.get('/courses/:courseId', async (req, res, next) => {
  try {
    const course = fallbackCourses.courses.find(c => c.course_key === req.params.courseId || c.id === req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) { next(err); }
});

router.post('/enrolments', async (req, res, next) => {
  try {
    const { learner_id, course_id } = req.body;
    if (!learner_id || !course_id) return res.status(400).json({ error: 'learner_id and course_id are required' });
    res.status(201).json({ enrolment_id: `enrol-${Date.now()}`, learner_id, course_id, status: 'active' });
  } catch (err) { next(err); }
});

router.post('/progress/events', async (req, res, next) => {
  try {
    const event = req.body || {};
    if (!event.learner_id || !event.course_id || !event.event_type) {
      return res.status(400).json({ error: 'learner_id, course_id and event_type are required' });
    }
    const completion = evaluateLessonCompletion(event, event.rules || {});
    res.status(201).json({ event_id: `progress-${Date.now()}`, saved: true, completion });
  } catch (err) { next(err); }
});

router.get('/progress/:learnerId', async (req, res, next) => {
  try {
    res.json({
      learner_id: req.params.learnerId,
      courses: fallbackCourses.courses.map(c => ({
        course_id: c.course_key,
        title: c.title,
        status: 'in_progress',
        percent_complete: 0,
        modules: (c.modules || []).map(m => ({ module_code: m.module_code, title: m.title, status: 'not_started' }))
      }))
    });
  } catch (err) { next(err); }
});

module.exports = router;
