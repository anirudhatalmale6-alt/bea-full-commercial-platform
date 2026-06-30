# BEA QA and Acceptance Checklist v2.0

## SCORM QA

- [ ] Every package has valid `imsmanifest.xml`.
- [ ] SCORM 1.2 package imports into Moodle/TalentLMS/Canvas-compatible SCORM tool or selected LMS.
- [ ] SCORM 2004 package imports into supported SCORM 2004 LMS.
- [ ] Launch opens in iframe/new window according to LMS policy.
- [ ] `Initialize/LMSInitialize` called successfully.
- [ ] Score reported.
- [ ] Completion reported.
- [ ] Lesson location/bookmark resumes.
- [ ] Suspend data remains under LMS limits.
- [ ] Exit/terminate event fires.
- [ ] Failed/disconnected attempt is handled gracefully.

## LMS QA

- [ ] Course catalogue only shows published courses.
- [ ] Learners can enrol or be assigned.
- [ ] Teachers can assign class modules.
- [ ] Parents only see linked learners.
- [ ] Progress events save correctly.
- [ ] Module completion rules work.
- [ ] Certificate readiness is accurate.
- [ ] Learner cannot access another learner's data by changing URL.
- [ ] Tenant isolation is enforced.

## CMS QA

- [ ] Admin can create course/module/lesson/page/resource.
- [ ] Draft content is not public.
- [ ] Review status is visible.
- [ ] Publish makes content public.
- [ ] Version history exists.
- [ ] Rollback restores older version.
- [ ] Media URLs are signed or CDN-safe.
- [ ] Audit log records author, reviewer and publisher.

## Video/accessibility QA

- [ ] Every video has provider ID.
- [ ] Every video has thumbnail URL.
- [ ] Every instructional video has captions.
- [ ] Transcript exists and is accessible.
- [ ] Completion threshold works.
- [ ] Seeking and replay do not falsely mark completion.
- [ ] Keyboard controls work.
- [ ] Captions can be toggled.

## Resource QA

- [ ] DOCX/PDF/HTML paths are present.
- [ ] Protected download links expire.
- [ ] Resources are mapped to course/module/resource type.
- [ ] Teacher-only resources are hidden from learner accounts.
- [ ] Parent cards are visible to linked parent accounts.

## Infrastructure QA

- [ ] Docker build succeeds.
- [ ] Health endpoint returns OK.
- [ ] Database migration succeeds.
- [ ] Backups configured.
- [ ] Redis connects.
- [ ] Object storage upload/download works.
- [ ] CDN serves assets.
- [ ] Logs do not expose personal data or secrets.
- [ ] Rate limiting enabled.
- [ ] Production demo accounts removed.
