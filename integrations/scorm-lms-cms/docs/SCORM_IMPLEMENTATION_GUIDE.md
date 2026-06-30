# BEA SCORM Implementation Guide

## Supported SCORM versions

BEA supports two export profiles:

1. **SCORM 1.2** - recommended default for broad LMS compatibility.
2. **SCORM 2004 4th Edition** - recommended when the destination LMS supports sequencing and richer completion data.

## SCORM data mapping

| BEA field | SCORM 1.2 | SCORM 2004 |
|---|---|---|
| completion status | `cmi.core.lesson_status` | `cmi.completion_status` |
| success status | `cmi.core.lesson_status=passed/failed` | `cmi.success_status` |
| raw score | `cmi.core.score.raw` | `cmi.score.raw` |
| min score | `cmi.core.score.min` | `cmi.score.min` |
| max score | `cmi.core.score.max` | `cmi.score.max` |
| bookmark | `cmi.core.lesson_location` | `cmi.location` |
| suspend data | `cmi.suspend_data` | `cmi.suspend_data` |
| session time | `cmi.core.session_time` | `cmi.session_time` |

## Build process

```bash
node scripts/build-scorm.js data/scorm_package_definitions/A1-M01-scorm12.json
node scripts/build-scorm.js data/scorm_package_definitions/A1-M01-scorm2004.json
```

Output ZIPs are written to:

```text
scorm/packages/
```

## SCORM package contents

```text
imsmanifest.xml
index.html
scormdriver.js
content/data.json
assets/
```

## Completion rule default

- Completed if learner reaches the final screen and score is greater than or equal to the mastery score.
- Passed if score is greater than or equal to mastery score.
- Failed if learner submits final screen below mastery score.
- Incomplete if learner exits before required score/completion.

## Offline media policy

For small packages, assets may be bundled. For larger BEA lessons, use CDN URLs in `content/data.json` and keep SCORM ZIP small. This reduces LMS upload size and improves update control.
