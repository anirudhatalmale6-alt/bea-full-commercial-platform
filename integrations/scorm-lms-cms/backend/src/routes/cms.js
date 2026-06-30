'use strict';
const express = require('express');
const { assertTransition, nextVersion } = require('../services/cmsWorkflow');

const router = express.Router();
const store = new Map();

router.get('/content', (req, res) => {
  const type = req.query.type;
  const records = Array.from(store.values()).filter(item => !type || item.content_type === type);
  res.json({ records });
});

router.post('/content', (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.content_key || !body.content_type || !body.title) {
      return res.status(400).json({ error: 'content_key, content_type and title are required' });
    }
    const id = `cms-${Date.now()}`;
    const record = {
      id,
      content_key: body.content_key,
      content_type: body.content_type,
      title: body.title,
      locale: body.locale || 'en-GB',
      draft_body: body.draft_body || {},
      published_body: null,
      version: 1,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.set(id, record);
    res.status(201).json(record);
  } catch (err) { next(err); }
});

router.put('/content/:contentId', (req, res) => {
  const record = store.get(req.params.contentId);
  if (!record) return res.status(404).json({ error: 'Content not found' });
  if (record.status === 'published') {
    record.version = nextVersion(record.version);
    record.status = 'draft';
  }
  record.draft_body = req.body.draft_body || record.draft_body;
  record.title = req.body.title || record.title;
  record.updated_at = new Date().toISOString();
  res.json(record);
});

router.post('/content/:contentId/submit-review', (req, res, next) => {
  try {
    const record = store.get(req.params.contentId);
    if (!record) return res.status(404).json({ error: 'Content not found' });
    assertTransition(record.status, 'in_review');
    record.status = 'in_review';
    record.updated_at = new Date().toISOString();
    res.json(record);
  } catch (err) { next(err); }
});

router.post('/content/:contentId/publish', (req, res, next) => {
  try {
    const record = store.get(req.params.contentId);
    if (!record) return res.status(404).json({ error: 'Content not found' });
    assertTransition(record.status, 'published');
    record.status = 'published';
    record.published_body = record.draft_body;
    record.published_at = new Date().toISOString();
    record.updated_at = new Date().toISOString();
    res.json(record);
  } catch (err) { next(err); }
});

router.post('/content/:contentId/archive', (req, res, next) => {
  try {
    const record = store.get(req.params.contentId);
    if (!record) return res.status(404).json({ error: 'Content not found' });
    assertTransition(record.status, 'archived');
    record.status = 'archived';
    record.updated_at = new Date().toISOString();
    res.json(record);
  } catch (err) { next(err); }
});

module.exports = router;
