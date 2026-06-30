#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { buildManifest } = require('../backend/src/services/scormManifestBuilder');

async function main() {
  const defPath = process.argv[2];
  if (!defPath) {
    console.error('Usage: node scripts/build-scorm.js <definition.json>');
    process.exit(1);
  }
  const definition = JSON.parse(fs.readFileSync(defPath, 'utf8'));
  const root = path.resolve(__dirname, '..');
  const outDir = path.join(root, 'scorm', 'packages');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${definition.package_key}.zip`);

  const tempDir = path.join(root, '.tmp-scorm', definition.package_key);
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(tempDir, 'content'), { recursive: true });

  fs.writeFileSync(path.join(tempDir, 'imsmanifest.xml'), buildManifest(definition));
  fs.copyFileSync(path.join(root, 'scorm', 'templates', 'index.html'), path.join(tempDir, 'index.html'));
  fs.copyFileSync(path.join(root, 'scorm', 'templates', 'scormdriver.js'), path.join(tempDir, 'scormdriver.js'));
  fs.writeFileSync(path.join(tempDir, 'content', 'data.json'), JSON.stringify({
    title: definition.title,
    module_code: definition.module_code,
    mastery_score: definition.mastery_score || 80,
    summary: 'British English Academy SCORM checkpoint lesson.',
    items: [
      { prompt: 'Choose the best answer: My name ___ Sara.', choices: ['am', 'is', 'are'], correct_answer: 'is' }
    ]
  }, null, 2));

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(tempDir, false);
    archive.finalize();
  });

  console.log(`Built ${outPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
