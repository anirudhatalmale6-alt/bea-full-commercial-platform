# Database Objects for Production

Use these tables or equivalent collections in production:

- users
- children
- parent_child_links
- institutions
- classes
- teacher_classes
- class_learners
- courses
- lessons
- activities
- resources
- products
- prices
- orders
- payments
- entitlements
- enrolments
- placement_questions
- placement_attempts
- lesson_progress
- activity_attempts
- evidence_submissions
- downloads
- reports
- certificates
- legal_pages
- cms_pages
- audit_logs

## Critical access rule

Never rely on title text. Use IDs only:

- learner_id
- parent_id
- teacher_id
- institution_id
- course_id
- lesson_id
- product_id
- order_id
- entitlement_id
- enrolment_id
- certificate_id
