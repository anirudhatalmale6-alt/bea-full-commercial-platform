# Developer Integration Guide

## Mandatory full flow

```text
Landing Page → Course Preview → Register/Login → Paid Level Test → Level Test Completed → Pathway Mapped → Diagnostic Report + Certificate → Short Trial Lesson → Full Course Payment → Enrolment Created → Dashboard Updated → LMS Module 1 Opens → Progress Saves → Parent/Teacher/Institution Dashboards Update
```

## Critical rules

1. Payment success must create access automatically.
2. Level Test remains locked until payment webhook confirms payment.
3. Short trial remains locked until paid and completed Level Test.
4. Full course remains locked until course/bundle/subscription/institution access.
5. Parent can see linked child only.
6. Teacher can see assigned classes only.
7. Institution admin can see own institution only.
8. Every LMS lesson completion must save progress server-side.
