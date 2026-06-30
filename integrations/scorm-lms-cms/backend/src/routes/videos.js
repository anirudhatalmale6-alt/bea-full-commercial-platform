'use strict';
const express = require('express');
const map = require('../../../data/video_lms_mapping.json');
const { evaluateLessonCompletion } = require('../services/completionEngine');

const router = express.Router();

router.get('/:videoId', (req, res) => {
  const video = map.videos.find(v => v.video_id === req.params.videoId || v.video_key === req.params.videoId);
  if (!video) return res.status(404).json({ error: 'Video not found' });
  res.json(video);
});

router.post('/:videoId/progress', (req, res) => {
  const video = map.videos.find(v => v.video_id === req.params.videoId || v.video_key === req.params.videoId);
  if (!video) return res.status(404).json({ error: 'Video not found' });
  const event = { event_type: 'video_progress', value: req.body || {} };
  const completion = evaluateLessonCompletion(event, { video_threshold_percent: video.completion_threshold_percent || 90 });
  res.status(201).json({ saved: true, video_id: req.params.videoId, completion });
});

module.exports = router;
