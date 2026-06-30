# BEA SCORM, LMS and CMS Architecture v2.0

## 1. Platform layers

### Public and learner layer
- Marketing pages and course catalogue
- Learner dashboard
- SCORM launch player
- Video lesson player with captions and transcripts
- Downloadable worksheets, parent cards and assessment resources
- Progress tracker and certificate readiness view

### Teacher and parent layer
- Class dashboard
- Learner activity evidence
- Intervention recommendations
- Downloadable resources by module, CEFR level and learner need
- Parent practice cards and home-learning history

### Admin CMS layer
- Course, module, lesson and activity editing
- Resource upload and metadata editing
- Hero/banner/page text editing
- Publish workflow: draft -> review -> published -> archived
- Content versioning and rollback
- Media asset management
- SCORM package generation and LMS export

### Backend application layer
- Authentication and role-based access control
- LMS delivery API
- CMS content API
- SCORM package builder and runtime result capture
- Progress and completion engine
- Resource delivery service
- Video progress service
- Audit logging service

### Data and infrastructure layer
- PostgreSQL for relational learning records
- Redis for sessions, queues and rate-limited events
- S3-compatible object storage for media and downloadable files
- CDN for public/static media delivery
- Nginx reverse proxy for frontend, API and uploaded assets
- Docker Compose for deployable local/staging production parity

## 2. End-to-end learning flow

1. Admin creates or imports course/module content in CMS.
2. Admin attaches lessons, activities, videos, downloadable resources and assessment rules.
3. Admin publishes the module.
4. Learner enrols or is assigned by a teacher/admin.
5. Learner opens LMS module.
6. For SCORM lesson: LMS launches SCO and listens for SCORM runtime data.
7. For video lesson: video service tracks watch percentage, captions and transcript availability.
8. For interactive activity: adaptive engine records item attempts, accuracy, response time, prompt level and support level.
9. Completion engine evaluates rules.
10. Progress, assessment evidence and certificate readiness are updated.

## 3. Roles

| Role | Core access |
|---|---|
| Learner | Own courses, modules, activities, video lessons and progress |
| Parent | Linked learner progress, downloadable parent cards and home-practice tasks |
| Teacher | Assigned classes, groups, learner evidence and intervention tools |
| Content editor | Draft content, upload resources and prepare SCORM packages |
| QA reviewer | Review content, run QA checklist and approve/reject publication |
| Admin | Full tenant configuration, users, CMS, LMS, reports and deployment settings |

## 4. SCORM architecture

BEA uses SCORM exports for compatibility with external LMS platforms. The internal BEA LMS stores richer telemetry, while exported SCORM packages report standard values such as lesson status, score, location, suspend data and interactions.

Supported profiles:
- SCORM 1.2 for widest LMS compatibility
- SCORM 2004 4th Edition for richer sequencing/completion when supported

Each SCORM package contains:
- `imsmanifest.xml`
- `index.html`
- `scormdriver.js`
- `content/data.json`
- `assets/` media references or offline assets

## 5. CMS publishing architecture

Every page, course, module, lesson and resource has:
- stable public ID
- version number
- locale
- status
- draft JSON body
- published JSON body
- author/reviewer metadata
- audit trail

Content is never overwritten in-place in production. New edits create a draft revision. Publishing freezes the revision and updates public read endpoints.

## 6. Completion engine

Completion combines:
- SCORM score/status
- video watch percentage
- activity item success
- assessment score
- required downloadable resource acknowledgement, where needed
- teacher-reviewed speaking/writing task status, where needed

Default BEA rules:
- Lesson complete: required activity/video/SCORM event completed
- Module complete: 80% lesson completion plus required assessment passed
- Course complete: all required modules complete plus final assessment or portfolio check
- Certificate ready: course complete and learner identity/account status valid
