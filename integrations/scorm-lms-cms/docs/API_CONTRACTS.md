# BEA LMS/CMS/SCORM API Contracts v2.0

All protected endpoints require `Authorization: Bearer <JWT>`.

## LMS endpoints

### `GET /api/lms/catalogue`
Returns published courses available to the authenticated tenant.

### `GET /api/lms/courses/:courseId`
Returns course, modules, lessons, required resources, video assets and SCORM launch data.

### `POST /api/lms/enrolments`
Creates an enrolment.

Request:
```json
{ "learner_id": "learner-01", "course_id": "course-a1-starter" }
```

### `POST /api/lms/progress/events`
Records progress evidence from video, SCORM, quiz, activity or resource access.

Request:
```json
{
  "learner_id": "learner-01",
  "course_id": "course-a1-starter",
  "module_code": "A1-M01",
  "lesson_id": "A1-M01-L01",
  "event_type": "video_progress",
  "value": { "percent_watched": 94, "seconds_watched": 423 }
}
```

### `GET /api/lms/progress/:learnerId`
Returns course/module/lesson progress for the learner.

## CMS endpoints

### `GET /api/cms/content?type=course|module|lesson|page|resource`
Lists CMS records.

### `POST /api/cms/content`
Creates a draft content record.

### `PUT /api/cms/content/:contentId`
Updates a draft.

### `POST /api/cms/content/:contentId/submit-review`
Moves draft to review.

### `POST /api/cms/content/:contentId/publish`
Publishes reviewed content.

### `POST /api/cms/content/:contentId/archive`
Archives published content.

## SCORM endpoints

### `GET /api/scorm/packages`
Lists SCORM packages.

### `POST /api/scorm/packages/build`
Builds a SCORM package from a module definition.

Request:
```json
{
  "course_id": "course-a1-starter",
  "module_code": "A1-M01",
  "scorm_version": "1.2",
  "include_assets": false
}
```

### `POST /api/scorm/runtime/result`
Stores SCORM runtime result returned by embedded package or external LMS bridge.

Request:
```json
{
  "learner_id": "learner-01",
  "sco_id": "A1-M01-SCO",
  "lesson_status": "completed",
  "score_raw": 88,
  "session_time": "00:18:42",
  "suspend_data": "{...}",
  "interactions": []
}
```

## Video endpoints

### `GET /api/videos/:videoId`
Returns secure video, caption, thumbnail and transcript metadata.

### `POST /api/videos/:videoId/progress`
Records watch progress and completion.

## Resource endpoints

### `GET /api/resources?course_id=&module_code=&resource_type=`
Returns available resources.

### `GET /api/resources/:resourceId/download`
Returns a signed URL or local protected download route.
