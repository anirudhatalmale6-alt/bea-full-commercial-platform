INSERT INTO bea_courses (id,slug,cefr_level,title,description,launch_price_pence,standard_price_pence) VALUES
('bea_a1_starter','a1-starter-english','A1','A1 Starter English','Self-paced A1 English course with lessons, activities, worksheets, assessment and certificate.',2700,4900),
('bea_a2_everyday','a2-everyday-english','A2','A2 Everyday English','Self-paced A2 English course with lessons, activities, worksheets, assessment and certificate.',2700,4900),
('bea_b1_independent','b1-independent-english','B1','B1 Independent English','Self-paced B1 English course with lessons, activities, worksheets, assessment and certificate.',2700,4900),
('bea_b2_confident','b2-confident-english','B2','B2 Confident English','Self-paced B2 English course with lessons, activities, worksheets, assessment and certificate.',2700,4900),
('bea_c1_advanced','c1-advanced-english','C1','C1 Advanced English','Self-paced C1 English course with lessons, activities, worksheets, assessment and certificate.',2700,4900),
('bea_c2_mastery','c2-mastery-english','C2','C2 Mastery English','Self-paced C2 English course with lessons, activities, worksheets, assessment and certificate.',2700,4900)
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;

INSERT INTO bea_course_modules (id,course_id,module_number,title,description) VALUES
('bea_a1_starter_m1','bea_a1_starter',1,'A1 Module 1','Module 1 for A1 Starter English'),
('bea_a1_starter_m2','bea_a1_starter',2,'A1 Module 2','Module 2 for A1 Starter English'),
('bea_a1_starter_m3','bea_a1_starter',3,'A1 Module 3','Module 3 for A1 Starter English'),
('bea_a1_starter_m4','bea_a1_starter',4,'A1 Module 4','Module 4 for A1 Starter English'),
('bea_a1_starter_m5','bea_a1_starter',5,'A1 Module 5','Module 5 for A1 Starter English'),
('bea_a1_starter_m6','bea_a1_starter',6,'A1 Module 6','Module 6 for A1 Starter English')
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;

INSERT INTO bea_lessons (id,course_id,module_id,lesson_number,title,lesson_type,content_json,is_trial) VALUES
('bea_a1_starter_trial','bea_a1_starter','bea_a1_starter_m1',0,'A1 Short Trial Lesson','trial','{"cta":"Start Full Course After Payment","objective":"Try a short mapped lesson."}'::jsonb,true),
('bea_a1_starter_m1_l1','bea_a1_starter','bea_a1_starter_m1',1,'A1 Lesson 1','standard','{"objective":"Complete lesson 1.","completion_rule":"save_progress"}'::jsonb,false),
('bea_a1_starter_m1_l2','bea_a1_starter','bea_a1_starter_m1',2,'A1 Lesson 2','standard','{"objective":"Complete lesson 2.","completion_rule":"save_progress"}'::jsonb,false),
('bea_a1_starter_m1_l3','bea_a1_starter','bea_a1_starter_m1',3,'A1 Lesson 3','standard','{"objective":"Complete lesson 3.","completion_rule":"save_progress"}'::jsonb,false),
('bea_a1_starter_m1_l4','bea_a1_starter','bea_a1_starter_m1',4,'A1 Lesson 4','standard','{"objective":"Complete lesson 4.","completion_rule":"save_progress"}'::jsonb,false),
('bea_a1_starter_m1_l5','bea_a1_starter','bea_a1_starter_m1',5,'A1 Lesson 5','standard','{"objective":"Complete lesson 5.","completion_rule":"save_progress"}'::jsonb,false),
('bea_a1_starter_m1_l6','bea_a1_starter','bea_a1_starter_m1',6,'A1 Lesson 6','standard','{"objective":"Complete lesson 6.","completion_rule":"save_progress"}'::jsonb,false)
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;

INSERT INTO bea_course_modules (id,course_id,module_number,title,description) VALUES
('bea_a2_everyday_m1','bea_a2_everyday',1,'A2 Module 1','Module 1 for A2 Everyday English'),
('bea_a2_everyday_m2','bea_a2_everyday',2,'A2 Module 2','Module 2 for A2 Everyday English'),
('bea_a2_everyday_m3','bea_a2_everyday',3,'A2 Module 3','Module 3 for A2 Everyday English'),
('bea_a2_everyday_m4','bea_a2_everyday',4,'A2 Module 4','Module 4 for A2 Everyday English'),
('bea_a2_everyday_m5','bea_a2_everyday',5,'A2 Module 5','Module 5 for A2 Everyday English'),
('bea_a2_everyday_m6','bea_a2_everyday',6,'A2 Module 6','Module 6 for A2 Everyday English')
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;

INSERT INTO bea_lessons (id,course_id,module_id,lesson_number,title,lesson_type,content_json,is_trial) VALUES
('bea_a2_everyday_trial','bea_a2_everyday','bea_a2_everyday_m1',0,'A2 Short Trial Lesson','trial','{"cta":"Start Full Course After Payment","objective":"Try a short mapped lesson."}'::jsonb,true),
('bea_a2_everyday_m1_l1','bea_a2_everyday','bea_a2_everyday_m1',1,'A2 Lesson 1','standard','{"objective":"Complete lesson 1.","completion_rule":"save_progress"}'::jsonb,false),
('bea_a2_everyday_m1_l2','bea_a2_everyday','bea_a2_everyday_m1',2,'A2 Lesson 2','standard','{"objective":"Complete lesson 2.","completion_rule":"save_progress"}'::jsonb,false),
('bea_a2_everyday_m1_l3','bea_a2_everyday','bea_a2_everyday_m1',3,'A2 Lesson 3','standard','{"objective":"Complete lesson 3.","completion_rule":"save_progress"}'::jsonb,false),
('bea_a2_everyday_m1_l4','bea_a2_everyday','bea_a2_everyday_m1',4,'A2 Lesson 4','standard','{"objective":"Complete lesson 4.","completion_rule":"save_progress"}'::jsonb,false),
('bea_a2_everyday_m1_l5','bea_a2_everyday','bea_a2_everyday_m1',5,'A2 Lesson 5','standard','{"objective":"Complete lesson 5.","completion_rule":"save_progress"}'::jsonb,false),
('bea_a2_everyday_m1_l6','bea_a2_everyday','bea_a2_everyday_m1',6,'A2 Lesson 6','standard','{"objective":"Complete lesson 6.","completion_rule":"save_progress"}'::jsonb,false)
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;

INSERT INTO bea_course_modules (id,course_id,module_number,title,description) VALUES
('bea_b1_independent_m1','bea_b1_independent',1,'B1 Module 1','Module 1 for B1 Independent English'),
('bea_b1_independent_m2','bea_b1_independent',2,'B1 Module 2','Module 2 for B1 Independent English'),
('bea_b1_independent_m3','bea_b1_independent',3,'B1 Module 3','Module 3 for B1 Independent English'),
('bea_b1_independent_m4','bea_b1_independent',4,'B1 Module 4','Module 4 for B1 Independent English'),
('bea_b1_independent_m5','bea_b1_independent',5,'B1 Module 5','Module 5 for B1 Independent English'),
('bea_b1_independent_m6','bea_b1_independent',6,'B1 Module 6','Module 6 for B1 Independent English')
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;

INSERT INTO bea_lessons (id,course_id,module_id,lesson_number,title,lesson_type,content_json,is_trial) VALUES
('bea_b1_independent_trial','bea_b1_independent','bea_b1_independent_m1',0,'B1 Short Trial Lesson','trial','{"cta":"Start Full Course After Payment","objective":"Try a short mapped lesson."}'::jsonb,true),
('bea_b1_independent_m1_l1','bea_b1_independent','bea_b1_independent_m1',1,'B1 Lesson 1','standard','{"objective":"Complete lesson 1.","completion_rule":"save_progress"}'::jsonb,false),
('bea_b1_independent_m1_l2','bea_b1_independent','bea_b1_independent_m1',2,'B1 Lesson 2','standard','{"objective":"Complete lesson 2.","completion_rule":"save_progress"}'::jsonb,false),
('bea_b1_independent_m1_l3','bea_b1_independent','bea_b1_independent_m1',3,'B1 Lesson 3','standard','{"objective":"Complete lesson 3.","completion_rule":"save_progress"}'::jsonb,false),
('bea_b1_independent_m1_l4','bea_b1_independent','bea_b1_independent_m1',4,'B1 Lesson 4','standard','{"objective":"Complete lesson 4.","completion_rule":"save_progress"}'::jsonb,false),
('bea_b1_independent_m1_l5','bea_b1_independent','bea_b1_independent_m1',5,'B1 Lesson 5','standard','{"objective":"Complete lesson 5.","completion_rule":"save_progress"}'::jsonb,false),
('bea_b1_independent_m1_l6','bea_b1_independent','bea_b1_independent_m1',6,'B1 Lesson 6','standard','{"objective":"Complete lesson 6.","completion_rule":"save_progress"}'::jsonb,false)
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;

INSERT INTO bea_course_modules (id,course_id,module_number,title,description) VALUES
('bea_b2_confident_m1','bea_b2_confident',1,'B2 Module 1','Module 1 for B2 Confident English'),
('bea_b2_confident_m2','bea_b2_confident',2,'B2 Module 2','Module 2 for B2 Confident English'),
('bea_b2_confident_m3','bea_b2_confident',3,'B2 Module 3','Module 3 for B2 Confident English'),
('bea_b2_confident_m4','bea_b2_confident',4,'B2 Module 4','Module 4 for B2 Confident English'),
('bea_b2_confident_m5','bea_b2_confident',5,'B2 Module 5','Module 5 for B2 Confident English'),
('bea_b2_confident_m6','bea_b2_confident',6,'B2 Module 6','Module 6 for B2 Confident English')
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;

INSERT INTO bea_lessons (id,course_id,module_id,lesson_number,title,lesson_type,content_json,is_trial) VALUES
('bea_b2_confident_trial','bea_b2_confident','bea_b2_confident_m1',0,'B2 Short Trial Lesson','trial','{"cta":"Start Full Course After Payment","objective":"Try a short mapped lesson."}'::jsonb,true),
('bea_b2_confident_m1_l1','bea_b2_confident','bea_b2_confident_m1',1,'B2 Lesson 1','standard','{"objective":"Complete lesson 1.","completion_rule":"save_progress"}'::jsonb,false),
('bea_b2_confident_m1_l2','bea_b2_confident','bea_b2_confident_m1',2,'B2 Lesson 2','standard','{"objective":"Complete lesson 2.","completion_rule":"save_progress"}'::jsonb,false),
('bea_b2_confident_m1_l3','bea_b2_confident','bea_b2_confident_m1',3,'B2 Lesson 3','standard','{"objective":"Complete lesson 3.","completion_rule":"save_progress"}'::jsonb,false),
('bea_b2_confident_m1_l4','bea_b2_confident','bea_b2_confident_m1',4,'B2 Lesson 4','standard','{"objective":"Complete lesson 4.","completion_rule":"save_progress"}'::jsonb,false),
('bea_b2_confident_m1_l5','bea_b2_confident','bea_b2_confident_m1',5,'B2 Lesson 5','standard','{"objective":"Complete lesson 5.","completion_rule":"save_progress"}'::jsonb,false),
('bea_b2_confident_m1_l6','bea_b2_confident','bea_b2_confident_m1',6,'B2 Lesson 6','standard','{"objective":"Complete lesson 6.","completion_rule":"save_progress"}'::jsonb,false)
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;

INSERT INTO bea_course_modules (id,course_id,module_number,title,description) VALUES
('bea_c1_advanced_m1','bea_c1_advanced',1,'C1 Module 1','Module 1 for C1 Advanced English'),
('bea_c1_advanced_m2','bea_c1_advanced',2,'C1 Module 2','Module 2 for C1 Advanced English'),
('bea_c1_advanced_m3','bea_c1_advanced',3,'C1 Module 3','Module 3 for C1 Advanced English'),
('bea_c1_advanced_m4','bea_c1_advanced',4,'C1 Module 4','Module 4 for C1 Advanced English'),
('bea_c1_advanced_m5','bea_c1_advanced',5,'C1 Module 5','Module 5 for C1 Advanced English'),
('bea_c1_advanced_m6','bea_c1_advanced',6,'C1 Module 6','Module 6 for C1 Advanced English')
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;

INSERT INTO bea_lessons (id,course_id,module_id,lesson_number,title,lesson_type,content_json,is_trial) VALUES
('bea_c1_advanced_trial','bea_c1_advanced','bea_c1_advanced_m1',0,'C1 Short Trial Lesson','trial','{"cta":"Start Full Course After Payment","objective":"Try a short mapped lesson."}'::jsonb,true),
('bea_c1_advanced_m1_l1','bea_c1_advanced','bea_c1_advanced_m1',1,'C1 Lesson 1','standard','{"objective":"Complete lesson 1.","completion_rule":"save_progress"}'::jsonb,false),
('bea_c1_advanced_m1_l2','bea_c1_advanced','bea_c1_advanced_m1',2,'C1 Lesson 2','standard','{"objective":"Complete lesson 2.","completion_rule":"save_progress"}'::jsonb,false),
('bea_c1_advanced_m1_l3','bea_c1_advanced','bea_c1_advanced_m1',3,'C1 Lesson 3','standard','{"objective":"Complete lesson 3.","completion_rule":"save_progress"}'::jsonb,false),
('bea_c1_advanced_m1_l4','bea_c1_advanced','bea_c1_advanced_m1',4,'C1 Lesson 4','standard','{"objective":"Complete lesson 4.","completion_rule":"save_progress"}'::jsonb,false),
('bea_c1_advanced_m1_l5','bea_c1_advanced','bea_c1_advanced_m1',5,'C1 Lesson 5','standard','{"objective":"Complete lesson 5.","completion_rule":"save_progress"}'::jsonb,false),
('bea_c1_advanced_m1_l6','bea_c1_advanced','bea_c1_advanced_m1',6,'C1 Lesson 6','standard','{"objective":"Complete lesson 6.","completion_rule":"save_progress"}'::jsonb,false)
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;

INSERT INTO bea_course_modules (id,course_id,module_number,title,description) VALUES
('bea_c2_mastery_m1','bea_c2_mastery',1,'C2 Module 1','Module 1 for C2 Mastery English'),
('bea_c2_mastery_m2','bea_c2_mastery',2,'C2 Module 2','Module 2 for C2 Mastery English'),
('bea_c2_mastery_m3','bea_c2_mastery',3,'C2 Module 3','Module 3 for C2 Mastery English'),
('bea_c2_mastery_m4','bea_c2_mastery',4,'C2 Module 4','Module 4 for C2 Mastery English'),
('bea_c2_mastery_m5','bea_c2_mastery',5,'C2 Module 5','Module 5 for C2 Mastery English'),
('bea_c2_mastery_m6','bea_c2_mastery',6,'C2 Module 6','Module 6 for C2 Mastery English')
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;

INSERT INTO bea_lessons (id,course_id,module_id,lesson_number,title,lesson_type,content_json,is_trial) VALUES
('bea_c2_mastery_trial','bea_c2_mastery','bea_c2_mastery_m1',0,'C2 Short Trial Lesson','trial','{"cta":"Start Full Course After Payment","objective":"Try a short mapped lesson."}'::jsonb,true),
('bea_c2_mastery_m1_l1','bea_c2_mastery','bea_c2_mastery_m1',1,'C2 Lesson 1','standard','{"objective":"Complete lesson 1.","completion_rule":"save_progress"}'::jsonb,false),
('bea_c2_mastery_m1_l2','bea_c2_mastery','bea_c2_mastery_m1',2,'C2 Lesson 2','standard','{"objective":"Complete lesson 2.","completion_rule":"save_progress"}'::jsonb,false),
('bea_c2_mastery_m1_l3','bea_c2_mastery','bea_c2_mastery_m1',3,'C2 Lesson 3','standard','{"objective":"Complete lesson 3.","completion_rule":"save_progress"}'::jsonb,false),
('bea_c2_mastery_m1_l4','bea_c2_mastery','bea_c2_mastery_m1',4,'C2 Lesson 4','standard','{"objective":"Complete lesson 4.","completion_rule":"save_progress"}'::jsonb,false),
('bea_c2_mastery_m1_l5','bea_c2_mastery','bea_c2_mastery_m1',5,'C2 Lesson 5','standard','{"objective":"Complete lesson 5.","completion_rule":"save_progress"}'::jsonb,false),
('bea_c2_mastery_m1_l6','bea_c2_mastery','bea_c2_mastery_m1',6,'C2 Lesson 6','standard','{"objective":"Complete lesson 6.","completion_rule":"save_progress"}'::jsonb,false)
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;
