# Commercial Flow

## Parent/child flow

1. Parent creates account.
2. Parent adds child profile and gives required consent.
3. Parent buys CEFR Level Test for the child.
4. Payment confirmation creates `placement_access` entitlement for the child.
5. Child completes Level Test.
6. System recommends CEFR level and trial lesson.
7. Trial lesson is unlocked.
8. Parent buys recommended course.
9. Payment confirmation creates `course_access` entitlement and `enrolment` for child.
10. Child completes lessons.
11. Parent and teacher dashboards update.
12. Certificate generates when course completion is 100%.

## Payment status logic

- pending = no unlock
- paid = unlock entitlement
- failed = no unlock
- refunded = revoke entitlement unless admin override
- chargeback = revoke entitlement and flag admin review
