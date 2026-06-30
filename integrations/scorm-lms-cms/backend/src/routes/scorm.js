'use strict';
const express = require('express');
const path = require('path');
const fs = require('fs');
const { buildManifest } = require('../services/scormManifestBuilder');

const router = express.Router();
const packagesDir = path.resolve(__dirname, '../../../scorm/packages');

router.get('/packages', (_req, res) => {
  const packages = fs.existsSync(packagesDir)
    ? fs.readdirSync(packagesDir).filter(name => name.endsWith('.zip')).map(name => ({ name, path: `/scorm/packages/${name}` }))
    : [];
  res.json({ packages });
});

router.post('/packages/build', (req, res) => {
  const definition = req.body || {};
  const manifest_xml = buildManifest({
    package_key: definition.package_key || `${definition.module_code || 'LEA'}-${definition.scorm_version || '1.2'}`,
    title: definition.title || `${definition.module_code || 'LEA'} SCORM Package`,
    scorm_version: definition.scorm_version || '1.2',
    mastery_score: definition.mastery_score || 80,
    launch_path: 'index.html',
  });
  res.status(201).json({
    built: true,
    package_key: definition.package_key || `${definition.module_code || 'LEA'}-${definition.scorm_version || '1.2'}`,
    manifest_xml,
    next_step: 'Run scripts/build-scorm.js with a package definition to create a ZIP file.'
  });
});

router.post('/runtime/result', (req, res) => {
  const result = req.body || {};
  if (!result.learner_id || !result.sco_id) return res.status(400).json({ error: 'learner_id and sco_id are required' });
  res.status(201).json({ saved: true, result_id: `scorm-result-${Date.now()}`, result });
});

module.exports = router;
