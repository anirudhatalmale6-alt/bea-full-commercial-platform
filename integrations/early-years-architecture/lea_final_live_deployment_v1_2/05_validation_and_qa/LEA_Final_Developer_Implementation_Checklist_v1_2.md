# BEA Final Developer Implementation Checklist v1.2

## Backend
- [ ] Implement all OpenAPI v1.2 routes exactly as specified.
- [ ] Enforce telemetry JSON Schema v1.2 with additionalProperties=false.
- [ ] Store attempts, sessions, mastery evidence, assignments, rewards and dashboard events using the SQL model.
- [ ] Validate `error_type` against the enum before saving attempts.
- [ ] Calculate `diagnostic_score = round(accuracy * 100)` only if the diagnostic payload omits it.
- [ ] Calculate baseline response time per learner + skill before applying hesitation logic.
- [ ] Apply adaptive rules by priority and trigger event.

## Frontend / Learner Engine
- [ ] Implement tap, drag, trace, listen_choose, blend, sort, record, story_path, count_group and mission mechanics.
- [ ] Use en-GB strings by default.
- [ ] Ensure no time pressure by default for early-years learners.
- [ ] Use feedback.interventions_by_error_type[error_type] before fallback_intervention.
- [ ] Support audio replay, captions, keyboard navigation and alt text.

## Dashboards
- [ ] Learner: next game, stars, badges, story map, gentle retry queue.
- [ ] Parent: weekly summary, home practice, celebration message.
- [ ] Teacher: class heatmap, group builder, assignments, intervention cards.
- [ ] Admin: content coverage, schema validation, activity performance and audit logs.

## Production
- [ ] Configure tenant/school/class/group/user roles.
- [ ] Run unit, integration, accessibility and load tests.
- [ ] Complete child-safety, privacy and data-retention reviews.
- [ ] Configure payment, email, video hosting and analytics only through secure environment variables.
- [ ] Run UAT with sample learners, teachers, parents and admins before public launch.
