'use strict';

function publicCdnUrl(storagePath) {
  const base = (process.env.CDN_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  if (!base) return storagePath;
  return `${base}/${String(storagePath).replace(/^\//, '')}`;
}

function buildStoragePath({ tenantKey = 'lea', assetType = 'document', filename }) {
  const safe = String(filename || 'asset.bin').replace(/[^a-zA-Z0-9._-]/g, '-');
  return `${tenantKey}/${assetType}/${safe}`;
}

module.exports = { publicCdnUrl, buildStoragePath };
