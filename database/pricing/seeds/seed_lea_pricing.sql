-- BEA pricing seed data
INSERT INTO pricing_products (product_code, product_type, name, public_name, description, currency, price_pence, billing_interval, access_rule, stripe_price_env, is_recommended, active) VALUES
('lea_level_test', 'level_test', 'BEA Level Test, Score Report and Diagnostic Certificate', 'Level Test', 'Paid adaptive Level Test with mapped course pathway, score report and BEA diagnostic certificate.', 'gbp', 999, 'one_time', 'unlock_level_test', 'STRIPE_PRICE_BEA_LEVEL_TEST', true, true),
('lea_short_trial', 'trial_lesson', 'Mapped Short Trial Lesson', 'Short Trial Lesson', 'Very short appetiser lesson unlocked only after paid and completed Level Test.', 'gbp', 0, 'included_after_level_test', 'unlock_after_paid_completed_level_test', NULL, false, true)
ON CONFLICT (product_code) DO UPDATE SET price_pence = EXCLUDED.price_pence, active = EXCLUDED.active;

INSERT INTO course_pricing (course_code, course_slug, cefr_level, title, launch_price_pence, standard_price_pence, currency, access_days, requires_level_test_first, stripe_launch_price_env, stripe_standard_price_env, active) VALUES
('lea_a1_starter', 'a1-starter-english', 'A1', 'A1 Starter English', 2700, 4900, 'gbp', 180, true, 'STRIPE_PRICE_BEA_A1_STARTER_LAUNCH', 'STRIPE_PRICE_BEA_A1_STARTER_STANDARD', true),
('lea_a2_everyday', 'a2-everyday-english', 'A2', 'A2 Everyday English', 2700, 4900, 'gbp', 180, true, 'STRIPE_PRICE_BEA_A2_EVERYDAY_LAUNCH', 'STRIPE_PRICE_BEA_A2_EVERYDAY_STANDARD', true),
('lea_b1_independent', 'b1-independent-english', 'B1', 'B1 Independent English', 2700, 4900, 'gbp', 180, true, 'STRIPE_PRICE_BEA_B1_INDEPENDENT_LAUNCH', 'STRIPE_PRICE_BEA_B1_INDEPENDENT_STANDARD', true),
('lea_b2_confident', 'b2-confident-english', 'B2', 'B2 Confident English', 2700, 4900, 'gbp', 180, true, 'STRIPE_PRICE_BEA_B2_CONFIDENT_LAUNCH', 'STRIPE_PRICE_BEA_B2_CONFIDENT_STANDARD', true),
('lea_c1_advanced', 'c1-advanced-english', 'C1', 'C1 Advanced English', 2700, 4900, 'gbp', 180, true, 'STRIPE_PRICE_BEA_C1_ADVANCED_LAUNCH', 'STRIPE_PRICE_BEA_C1_ADVANCED_STANDARD', true),
('lea_c2_mastery', 'c2-mastery-english', 'C2', 'C2 Mastery English', 2700, 4900, 'gbp', 180, true, 'STRIPE_PRICE_BEA_C2_MASTERY_LAUNCH', 'STRIPE_PRICE_BEA_C2_MASTERY_STANDARD', true)
ON CONFLICT (course_code) DO UPDATE SET launch_price_pence = EXCLUDED.launch_price_pence, standard_price_pence = EXCLUDED.standard_price_pence, active = EXCLUDED.active;

INSERT INTO course_bundles (bundle_code, name, description, course_codes, launch_price_pence, standard_price_pence, currency, access_days, stripe_launch_price_env, stripe_standard_price_env, active) VALUES
('bundle_a1_b1_foundations', 'Foundation English Bundle A1-B1', 'A1, A2 and B1 self-paced courses for beginner to independent learners.', ARRAY['lea_a1_starter','lea_a2_everyday','lea_b1_independent'], 6900, 9900, 'gbp', 365, 'STRIPE_PRICE_BUNDLE_A1_B1_LAUNCH', 'STRIPE_PRICE_BUNDLE_A1_B1_STANDARD', true),
('bundle_b2_c2_advanced', 'Advanced English Bundle B2-C2', 'B2, C1 and C2 self-paced courses for academic, professional and mastery-level learners.', ARRAY['lea_b2_confident','lea_c1_advanced','lea_c2_mastery'], 8900, 12900, 'gbp', 365, 'STRIPE_PRICE_BUNDLE_B2_C2_LAUNCH', 'STRIPE_PRICE_BUNDLE_B2_C2_STANDARD', true),
('bundle_a1_c2_complete', 'Complete English Pathway A1-C2', 'Full A1-C2 self-paced BEA course library with all six level pathways.', ARRAY['lea_a1_starter','lea_a2_everyday','lea_b1_independent','lea_b2_confident','lea_c1_advanced','lea_c2_mastery'], 14900, 24900, 'gbp', 730, 'STRIPE_PRICE_BUNDLE_A1_C2_LAUNCH', 'STRIPE_PRICE_BUNDLE_A1_C2_STANDARD', true)
ON CONFLICT (bundle_code) DO UPDATE SET launch_price_pence = EXCLUDED.launch_price_pence, standard_price_pence = EXCLUDED.standard_price_pence, active = EXCLUDED.active;

INSERT INTO subscription_plans (plan_code, name, description, price_pence, currency, billing_interval, trial_days, teacher_feedback_credits, access_rule, stripe_price_env, active) VALUES
('sub_monthly_self_study', 'BEA Monthly Self-Study Access', 'Monthly access to all self-paced courses, games, worksheets and learner dashboard.', 1900, 'gbp', 'monthly', 0, 0, 'unlock_all_self_study_while_subscription_active', 'STRIPE_PRICE_SUB_MONTHLY_SELF_STUDY', true),
('sub_annual_self_study', 'BEA Annual Self-Study Access', 'Annual access to all self-paced courses at a reduced annual price.', 14900, 'gbp', 'annual', 0, 0, 'unlock_all_self_study_while_subscription_active', 'STRIPE_PRICE_SUB_ANNUAL_SELF_STUDY', true),
('sub_premium_with_feedback', 'BEA Premium With Teacher Feedback', 'Monthly self-study access plus limited teacher feedback credits for speaking/writing tasks.', 3900, 'gbp', 'monthly', 0, 4, 'unlock_all_self_study_and_feedback_credits', 'STRIPE_PRICE_SUB_PREMIUM_FEEDBACK', true)
ON CONFLICT (plan_code) DO UPDATE SET price_pence = EXCLUDED.price_pence, active = EXCLUDED.active;

INSERT INTO institution_licence_plans (plan_code, name, description, learner_limit, teacher_limit, price_pence, currency, billing_interval, extra_learner_price_pence, stripe_price_env, requires_sales_contact, active) VALUES
('inst_starter_25', 'Institution Starter Licence', 'For small schools, tutors or training centres.', 25, 3, 29900, 'gbp', 'annual', 800, 'STRIPE_PRICE_INST_STARTER_25', false, true),
('inst_growth_100', 'Institution Growth Licence', 'For schools, academies and employers with up to 100 learners.', 100, 10, 79900, 'gbp', 'annual', 700, 'STRIPE_PRICE_INST_GROWTH_100', false, true),
('inst_pro_300', 'Institution Pro Licence', 'For larger institutions with up to 300 learners.', 300, 30, 199900, 'gbp', 'annual', 600, 'STRIPE_PRICE_INST_PRO_300', false, true),
('inst_enterprise_custom', 'Enterprise Licence', 'Custom pricing for large schools, employers, councils or training providers.', NULL, NULL, NULL, 'gbp', 'custom_quote', NULL, NULL, true, true)
ON CONFLICT (plan_code) DO UPDATE SET price_pence = EXCLUDED.price_pence, active = EXCLUDED.active;

INSERT INTO pricing_coupons (code, discount_percent, applies_to, max_redemptions, active) VALUES
('LEAFOUNDERS30', 30, ARRAY['single_course','course_bundle','subscription'], 500, true),
('LEATESTFREE', 100, ARRAY['level_test'], 100, false),
('SCHOOL10', 10, ARRAY['institution_licence'], 100, true)
ON CONFLICT (code) DO UPDATE SET discount_percent = EXCLUDED.discount_percent, active = EXCLUDED.active;

INSERT INTO refund_policy_rules (product_type, refund_window_days, condition_text, auto_revoke_access, active) VALUES
('level_test', 7, 'Refund only before the Level Test is started. No automatic refund after test attempt begins.', 'True', true),
('single_course', 14, 'Refund available if less than 20% of the course has been completed and no certificate has been issued.', 'True', true),
('course_bundle', 14, 'Refund available if no more than one course in the bundle has been started and no certificate has been issued.', 'True', true),
('subscription', 7, 'First billing period refund only where usage is minimal. Cancellation stops future billing.', 'at_period_end_or_immediate_if_refunded', true),
('institution_licence', 14, 'Refund subject to written agreement if onboarding has not been completed and fewer than 10 learner accounts have been activated.', 'True', true)
ON CONFLICT (product_type) DO UPDATE SET refund_window_days = EXCLUDED.refund_window_days, condition_text = EXCLUDED.condition_text;
