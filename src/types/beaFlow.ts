export type BeaRole = 'learner'|'parent'|'teacher'|'institution_admin'|'platform_admin'|'finance_admin'|'content_admin';
export type CefrLevel = 'A1'|'A2'|'B1'|'B2'|'C1'|'C2';
export type ProductType = 'level_test'|'single_course'|'bundle'|'subscription'|'institution_licence';
export type FlowStatus = { learnerUserId:string; hasPaidLevelTest:boolean; hasCompletedLevelTest:boolean; mappedLevel:CefrLevel|null; recommendedCourseId:string|null; diagnosticReportId:string|null; diagnosticCertificateId:string|null; hasUnlockedTrial:boolean; trialLessonId:string|null; hasPaidFullCourse:boolean; activeCourseId:string|null; nextActionLabel:string; nextActionHref:string; };
