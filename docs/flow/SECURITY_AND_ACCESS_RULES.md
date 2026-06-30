# Security and Access Rules

Public can view landing page, previews and pricing only.
Learner can view own courses, reports, certificates and progress.
Parent can view own linked child progress only.
Teacher can view assigned classes and learners only.
Institution admin can view own institution only.
Platform admin can manage all platform records.

Do not rely on frontend hiding. Every API route must check server-side relationship and access rights.
