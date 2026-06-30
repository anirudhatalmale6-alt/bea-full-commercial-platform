# BEA Deployment Runbook v2.0

## 1. Prerequisites

- Docker and Docker Compose
- Node.js LTS for local developer tasks
- Production domain and DNS access
- PostgreSQL-compatible database or bundled Docker PostgreSQL
- Redis-compatible cache or bundled Docker Redis
- S3-compatible object storage: AWS S3, Cloudflare R2, DigitalOcean Spaces, Bunny Storage or MinIO
- CDN: CloudFront, Cloudflare or Bunny CDN
- SMTP/email provider for transactional email

## 2. Environment setup

Copy:

```bash
cp deploy/.env.production.example deploy/.env
```

Update at minimum:

```bash
PUBLIC_APP_URL=https://www.londonenglishacademy.com
API_PUBLIC_URL=https://api.londonenglishacademy.com
DATABASE_URL=postgres://lea_user:change_me@postgres:5432/lea
JWT_SECRET=replace_with_64_char_random_secret
S3_BUCKET=lea-production-assets
S3_ENDPOINT=https://s3.example.com
S3_ACCESS_KEY_ID=replace_me
S3_SECRET_ACCESS_KEY=replace_me
CDN_PUBLIC_BASE_URL=https://cdn.londonenglishacademy.com
```

## 3. Build and run

```bash
cd deploy
docker compose --env-file .env up --build -d
```

## 4. Database migration and seed

```bash
cd ..
npm install
npm run migrate
npm run seed
psql "$DATABASE_URL" -f database/migrations/001_create_lea_lms_cms_scorm.sql
```

## 5. SCORM package validation

Upload these files to a test LMS:

```text
scorm/packages/BEA_A1_M01_SCORM_12.zip
scorm/packages/BEA_A1_M01_SCORM_2004.zip
```

Confirm:
- package imports without manifest error
- learner can launch SCO
- score is reported
- completion status is reported
- suspend/resume works
- LMS reports show attempts/interactions/objectives where supported

## 6. CMS production validation

1. Login as admin.
2. Create a draft page.
3. Submit for review.
4. Publish page.
5. Confirm public page reads published version only.
6. Edit again and confirm public page remains stable until next publication.
7. Roll back to prior version.

## 7. LMS production validation

1. Create learner.
2. Enrol learner in course.
3. Open module.
4. Watch video over completion threshold.
5. Complete SCORM item.
6. Download required resource.
7. Complete assessment event.
8. Confirm module completion and certificate-readiness state.

## 8. Go-live checklist

- DNS points to production host
- HTTPS works on app, API and CDN
- All env variables are production values
- Demo credentials removed
- Admin MFA enabled if available
- Database backup schedule active
- Logs shipped to monitoring tool
- Object storage lifecycle rules active
- CDN cache purge tested
- SCORM test packages pass import and runtime tests
- Accessibility/caption/transcript checks complete
