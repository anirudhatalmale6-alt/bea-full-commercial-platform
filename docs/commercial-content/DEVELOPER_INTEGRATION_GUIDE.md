# Developer Integration Guide

## Goal

Connect the BEA commercial course content pack to the LMS so every course, lesson, activity, assessment and downloadable item becomes visible, trackable and commercially usable.

## Required tables

Use existing BEA tables where possible:

- courses
- course_modules
- lessons
- lesson_content_blocks
- activities
- activity_items
- downloadable_resources
- media_assets
- lesson_progress
- activity_attempts
- score_reports
- certificates

## Required import order

1. Courses
2. Modules
3. Lessons
4. Lesson content blocks
5. Activities
6. Activity items
7. Downloadable resources
8. Audio/media assets
9. Visual cards
10. Module assessments
11. Final level assessments
12. Rubrics
13. QA statuses

## Required UI connections

Every course page must show:

- course outcome
- CEFR level
- module list
- lesson list
- pricing/access state
- enrolment button
- course completion rule

Every lesson page must show:

- learner-facing explanation
- examples
- interactive practice
- speaking task
- writing task
- homework
- worksheet download
- progress status
- completion button or automatic completion rule

Every activity page must support:

- drag and drop
- matching
- listen and choose
- sentence builder
- word ordering
- phonics/spelling game screen
- speaking prompt
- writing submission
- instant feedback
- retry logic
- score saving
- badges/stars

## Required admin functions

Admin must be able to:

- edit lesson text
- edit activities
- edit answers and distractors
- upload audio files
- upload visual cards
- upload PDFs/DOCX
- publish/unpublish lessons
- run QA checks
- mark CEFR validation status
