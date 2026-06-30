'use strict';
const express = require('express');
const catalogue = require('../../../data/resource_delivery_manifest.json');

const router = express.Router();

router.get('/', (req, res) => {
  const { course_id, module_code, resource_type } = req.query;
  const resources = catalogue.resources.filter(r =>
    (!course_id || r.course_id === course_id) &&
    (!module_code || r.module_code === module_code) &&
    (!resource_type || r.resource_type === resource_type)
  );
  res.json({ resources });
});

router.get('/:resourceId/download', (req, res) => {
  const resource = catalogue.resources.find(r => r.resource_id === req.params.resourceId);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });
  res.json({
    resource_id: resource.resource_id,
    title: resource.title,
    download_url: resource.cdn_url || resource.local_path,
    expires_in_seconds: 900,
    note: 'Production should return a signed CDN/object-storage URL.'
  });
});

module.exports = router;
