#!/usr/bin/env python3
import json, pathlib, zipfile, sys
root = pathlib.Path(__file__).resolve().parents[1]
required = [
  'README.md',
  'docs/ARCHITECTURE.md',
  'docs/API_CONTRACTS.md',
  'docs/DEPLOYMENT_RUNBOOK.md',
  'docs/QA_AND_ACCEPTANCE_CHECKLIST.md',
  'database/migrations/001_create_lea_lms_cms_scorm.sql',
  'backend/src/routes/lms.js',
  'backend/src/routes/cms.js',
  'backend/src/routes/scorm.js',
  'backend/src/routes/resources.js',
  'backend/src/routes/videos.js',
  'backend/src/services/scormManifestBuilder.js',
  'backend/src/services/completionEngine.js',
  'frontend/src/pages/LMSAdmin.jsx',
  'frontend/src/pages/CMSAdmin.jsx',
  'frontend/src/pages/SCORMAdmin.jsx',
  'scorm/templates/index.html',
  'scorm/templates/scormdriver.js',
  'scorm/packages/LEA_A1_M01_SCORM_12.zip',
  'scorm/packages/LEA_A1_M01_SCORM_2004.zip',
  'data/lms_course_catalogue.json',
  'data/cms_content_schema.json',
  'data/resource_delivery_manifest.json',
  'data/video_lms_mapping.json',
  'deploy/docker-compose.yml',
  'deploy/.env.production.example'
]
missing = [p for p in required if not (root / p).is_file()]
if missing:
    print('Missing required files:')
    for p in missing: print(' -', p)
    sys.exit(1)
for p in ['data/lms_course_catalogue.json','data/cms_content_schema.json','data/resource_delivery_manifest.json','data/video_lms_mapping.json']:
    json.load(open(root / p, encoding='utf-8'))
for p in ['scorm/packages/LEA_A1_M01_SCORM_12.zip','scorm/packages/LEA_A1_M01_SCORM_2004.zip']:
    with zipfile.ZipFile(root / p) as z:
        names = set(z.namelist())
        required_zip = {'imsmanifest.xml','index.html','scormdriver.js','content/data.json'}
        if not required_zip.issubset(names):
            raise AssertionError(f'{p} missing {required_zip - names}')
print('LEA SCORM/LMS/CMS pack validation passed.')
