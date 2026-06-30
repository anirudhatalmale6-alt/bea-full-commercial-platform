# Adaptive Engine Logic

The included demo implements simple adaptive routing:

- Recent accuracy below 50% = review easier practice
- Recent accuracy 50-84% = continue current path
- Recent accuracy 85%+ = unlock challenge task

Production extension fields:

- skill_id
- CEFR level
- difficulty
- attempts
- accuracy
- response time
- mastered flag
- recommended_next_lesson_id
- teacher_intervention_flag

Recommended production actions:

- If learner fails twice: show review lesson.
- If learner passes first time: unlock challenge task.
- If learner is inactive: notify parent and teacher.
- If child learner struggles repeatedly: show parent practice card and teacher intervention alert.
