# LMS Audio Import Specification
Every generated audio file should create or update a media asset row with asset_code, asset_type, lesson/module ID, CEFR level, voice ID, engine, language code, storage URL, transcript URL, caption URL and QA status.

Suggested media asset types:
- lesson_listening_activity
- pronunciation_drill
- module_intro
- final_assessment_prompt

Access rules:
- Trial lesson audio unlocks after paid and completed Level Test.
- Course lesson audio unlocks after course payment, subscription or institution licence.
- Final assessment prompt unlocks when course completion rules allow it.
