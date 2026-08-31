# CAPACITY CONNECT — Database Schema

## 1. Purpose

This document defines the proposed PostgreSQL database structure for CAPACITY CONNECT.

Database platform:

Supabase PostgreSQL

The schema must support:

* Authentication
* Trainee, Trainer, and Admin roles
* Profiles
* Courses
* Lessons
* Enrollments
* Learning progress
* Assessments
* Assessment attempts
* Competencies
* Skill gaps
* Trainer matching
* Feedback
* Certificates
* Notifications
* Analytics
* Future AI/RAG features

The database should remain simple enough for a student hackathon project while still being scalable and logically correct.

---

# 2. General Rules

All tables should use:

* UUID primary keys where practical
* `created_at`
* `updated_at` where appropriate

Use PostgreSQL foreign keys.

Avoid storing the same information in multiple places unnecessarily.

Prefer status fields over permanently deleting important historical records.

Supabase Auth is responsible for user authentication.

The application database should not store user passwords.

---

# 3. Users and Profiles

Supabase Auth creates users in:

`auth.users`

We should not modify this table directly.

Application-specific user information should be stored in:

`profiles`

---

# 4. profiles

Purpose:

Stores application-level information for every authenticated user.

Fields:

* `id`
* `email`
* `full_name`
* `role`
* `designation`
* `department`
* `bio`
* `avatar_url`
* `is_approved`
* `is_active`
* `created_at`
* `updated_at`

Primary key:

`id`

Foreign key:

`id -> auth.users.id`

Role values:

* trainee
* trainer
* admin

Recommended implementation:

PostgreSQL enum or constrained text.

Example:

`role IN ('trainee', 'trainer', 'admin')`

Important:

Role must never be trusted only from frontend state.

Database authorization must use Row Level Security.

---

# 5. trainee_profiles

Purpose:

Stores trainee-specific professional information.

Fields:

* `id`
* `user_id`
* `employee_code`
* `qualifications`
* `work_experience`
* `professional_interests`
* `created_at`
* `updated_at`

Primary key:

`id`

Foreign key:

`user_id -> profiles.id`

Relationship:

One profile may have one trainee profile.

Only users with trainee role should have records here.

For hackathon simplicity, qualifications and experience may initially use text fields.

They can later be normalized into separate tables if needed.

---

# 6. trainer_profiles

Purpose:

Stores trainer-specific information.

Fields:

* `id`
* `user_id`
* `years_of_experience`
* `trainer_bio`
* `availability_status`
* `average_rating`
* `created_at`
* `updated_at`

Primary key:

`id`

Foreign key:

`user_id -> profiles.id`

Availability examples:

* available
* limited
* unavailable

Average rating should preferably be calculated from feedback rather than manually edited.

---

# 7. competencies

Purpose:

Stores competency definitions.

Fields:

* `id`
* `name`
* `description`
* `category`
* `default_target_score`
* `is_active`
* `created_at`
* `updated_at`

Examples:

* Doppler Weather Radar
* Numerical Weather Prediction
* Forecast Verification
* Python
* Climate Analysis

Important:

The prototype competency taxonomy is configurable and must not be described as the official internal IMD competency framework.

---

# 8. user_competencies

Purpose:

Stores competency scores for users.

Mainly used for trainees and trainers.

Fields:

* `id`
* `user_id`
* `competency_id`
* `current_score`
* `target_score`
* `last_updated_at`
* `created_at`

Foreign keys:

`user_id -> profiles.id`

`competency_id -> competencies.id`

Constraints:

A user should have only one current record for a specific competency.

Recommended unique constraint:

`UNIQUE(user_id, competency_id)`

Score range:

0 to 100

---

# 9. trainer_competencies

Purpose:

Stores trainer expertise in specific competency areas.

Fields:

* `id`
* `trainer_id`
* `competency_id`
* `expertise_score`
* `years_experience`
* `verified`
* `created_at`
* `updated_at`

Foreign keys:

`trainer_id -> profiles.id`

`competency_id -> competencies.id`

Unique constraint:

`UNIQUE(trainer_id, competency_id)`

Expertise score range:

0 to 100

---

# 10. skills

Purpose:

Stores individual skills where finer detail is needed.

Fields:

* `id`
* `name`
* `description`
* `competency_id`
* `created_at`

Foreign key:

`competency_id -> competencies.id`

Example:

Competency:

Doppler Weather Radar

Possible skills:

* Radar Product Interpretation
* Reflectivity Analysis
* Velocity Analysis
* Severe Weather Detection

---

# 11. courses

Purpose:

Stores course metadata.

Fields:

* `id`
* `title`
* `slug`
* `description`
* `category`
* `difficulty`
* `thumbnail_url`
* `status`
* `trainer_id`
* `estimated_duration_minutes`
* `created_by`
* `created_at`
* `updated_at`

Foreign keys:

`trainer_id -> profiles.id`

`created_by -> profiles.id`

Difficulty examples:

* beginner
* intermediate
* advanced

Status examples:

* draft
* published
* archived

Only published courses should appear in the public trainee catalogue.

---

# 12. course_competencies

Purpose:

Maps courses to competencies.

Fields:

* `id`
* `course_id`
* `competency_id`
* `relevance_weight`
* `created_at`

Foreign keys:

`course_id -> courses.id`

`competency_id -> competencies.id`

Recommended unique constraint:

`UNIQUE(course_id, competency_id)`

Example:

Course:

Introduction to Doppler Weather Radar

Competency:

Doppler Weather Radar

Relevance weight:

100

---

# 13. course_skills

Purpose:

Maps courses to skills.

Fields:

* `id`
* `course_id`
* `skill_id`
* `created_at`

Foreign keys:

`course_id -> courses.id`

`skill_id -> skills.id`

Recommended unique constraint:

`UNIQUE(course_id, skill_id)`

---

# 14. modules

Purpose:

Groups lessons inside a course.

Fields:

* `id`
* `course_id`
* `title`
* `description`
* `position`
* `created_at`
* `updated_at`

Foreign key:

`course_id -> courses.id`

Position determines module ordering.

---

# 15. lessons

Purpose:

Stores individual learning units.

Fields:

* `id`
* `module_id`
* `title`
* `description`
* `lesson_type`
* `content`
* `resource_url`
* `position`
* `estimated_duration_minutes`
* `is_required`
* `created_at`
* `updated_at`

Foreign key:

`module_id -> modules.id`

Possible lesson types:

* text
* video
* pdf
* presentation
* external_link

Files themselves should be stored in Supabase Storage.

The database should store only file/resource metadata and URLs.

---

# 16. enrollments

Purpose:

Tracks trainees enrolled in courses.

Fields:

* `id`
* `trainee_id`
* `course_id`
* `status`
* `progress_percentage`
* `enrolled_at`
* `completed_at`
* `created_at`
* `updated_at`

Foreign keys:

`trainee_id -> profiles.id`

`course_id -> courses.id`

Status examples:

* active
* completed
* withdrawn

Unique constraint:

`UNIQUE(trainee_id, course_id)`

This prevents duplicate enrollment records.

Progress range:

0 to 100

---

# 17. lesson_progress

Purpose:

Tracks lesson completion for a trainee.

Fields:

* `id`
* `enrollment_id`
* `lesson_id`
* `is_completed`
* `completed_at`
* `created_at`
* `updated_at`

Foreign keys:

`enrollment_id -> enrollments.id`

`lesson_id -> lessons.id`

Unique constraint:

`UNIQUE(enrollment_id, lesson_id)`

---

# 18. assessments

Purpose:

Stores assessments associated with courses.

Fields:

* `id`
* `course_id`
* `title`
* `description`
* `passing_score`
* `deadline`
* `status`
* `created_by`
* `created_at`
* `updated_at`

Foreign keys:

`course_id -> courses.id`

`created_by -> profiles.id`

Status examples:

* draft
* published
* closed

Passing score range:

0 to 100

---

# 19. assessment_questions

Purpose:

Stores MCQ questions.

Fields:

* `id`
* `assessment_id`
* `question_text`
* `competency_id`
* `points`
* `position`
* `created_at`

Foreign keys:

`assessment_id -> assessments.id`

`competency_id -> competencies.id`

Each question should map to a competency wherever possible.

---

# 20. question_options

Purpose:

Stores answer choices for MCQ questions.

Fields:

* `id`
* `question_id`
* `option_text`
* `is_correct`
* `position`
* `created_at`

Foreign key:

`question_id -> assessment_questions.id`

Important security rule:

The frontend must not receive `is_correct` before submission.

Correct answer information must be protected from trainee access.

---

# 21. assessment_attempts

Purpose:

Stores trainee assessment submissions.

Fields:

* `id`
* `assessment_id`
* `trainee_id`
* `score`
* `percentage`
* `passed`
* `started_at`
* `submitted_at`
* `created_at`

Foreign keys:

`assessment_id -> assessments.id`

`trainee_id -> profiles.id`

Possible future field:

* `attempt_number`

---

# 22. assessment_answers

Purpose:

Stores individual answers submitted in an attempt.

Fields:

* `id`
* `attempt_id`
* `question_id`
* `selected_option_id`
* `is_correct`
* `points_awarded`
* `created_at`

Foreign keys:

`attempt_id -> assessment_attempts.id`

`question_id -> assessment_questions.id`

`selected_option_id -> question_options.id`

The server/database should determine correctness.

The client should not decide assessment scores.

---

# 23. competency_score_history

Purpose:

Stores changes in competency scores over time.

Fields:

* `id`
* `user_id`
* `competency_id`
* `previous_score`
* `new_score`
* `source_type`
* `source_id`
* `created_at`

Foreign keys:

`user_id -> profiles.id`

`competency_id -> competencies.id`

Source examples:

* assessment
* course_completion
* manual_admin_update

This table is important for showing competency improvement over time.

---

# 24. skill_gaps

Purpose:

Stores detected competency gaps.

Fields:

* `id`
* `trainee_id`
* `competency_id`
* `current_score`
* `target_score`
* `gap_score`
* `priority`
* `status`
* `detected_at`
* `resolved_at`

Foreign keys:

`trainee_id -> profiles.id`

`competency_id -> competencies.id`

Priority examples:

* low
* medium
* high
* critical

Status examples:

* open
* improving
* resolved

Skill gap may also be dynamically calculated rather than permanently stored.

For the hackathon MVP, storing it may make dashboards and demo flows simpler.

---

# 25. course_recommendations

Purpose:

Stores or caches recommended courses for trainees.

Fields:

* `id`
* `trainee_id`
* `course_id`
* `competency_id`
* `recommendation_score`
* `reason`
* `created_at`
* `expires_at`

Foreign keys:

`trainee_id -> profiles.id`

`course_id -> courses.id`

`competency_id -> competencies.id`

Recommendation score may use deterministic rules.

---

# 26. trainer_recommendations

Purpose:

Stores or caches trainer recommendations.

Fields:

* `id`
* `trainee_id`
* `trainer_id`
* `competency_id`
* `match_score`
* `competency_component`
* `experience_component`
* `performance_component`
* `course_relevance_component`
* `availability_component`
* `feedback_component`
* `reason`
* `created_at`

Foreign keys:

`trainee_id -> profiles.id`

`trainer_id -> profiles.id`

`competency_id -> competencies.id`

Match score should be explainable.

Example formula:

40% Competency Match

20% Experience

15% Training Performance

10% Course Relevance

10% Availability

5% Learner Feedback

---

# 27. feedback

Purpose:

Stores trainee feedback for courses.

Fields:

* `id`
* `trainee_id`
* `course_id`
* `trainer_id`
* `rating`
* `comment`
* `created_at`

Foreign keys:

`trainee_id -> profiles.id`

`course_id -> courses.id`

`trainer_id -> profiles.id`

Rating range:

1 to 5

Trainees should not be able to edit another trainee's feedback.

---

# 28. certificates

Purpose:

Stores issued certificates.

Fields:

* `id`
* `certificate_code`
* `trainee_id`
* `course_id`
* `issued_at`
* `verification_status`
* `created_at`

Foreign keys:

`trainee_id -> profiles.id`

`course_id -> courses.id`

Certificate code must be unique.

Example:

`CC-2026-ABC123`

Unique constraint:

`UNIQUE(certificate_code)`

---

# 29. notifications

Purpose:

Stores announcements and notifications.

Fields:

* `id`
* `title`
* `message`
* `type`
* `target_role`
* `published_by`
* `published_at`
* `expires_at`
* `is_active`
* `created_at`

Foreign key:

`published_by -> profiles.id`

Possible types:

* general
* announcement
* achievement
* training_update
* new_content

Possible target role:

* trainee
* trainer
* admin
* all

---

# 30. notification_reads

Purpose:

Tracks whether a user has read a notification.

Fields:

* `id`
* `notification_id`
* `user_id`
* `read_at`

Foreign keys:

`notification_id -> notifications.id`

`user_id -> profiles.id`

Unique constraint:

`UNIQUE(notification_id, user_id)`

---

# 31. audit_logs

Purpose:

Tracks important administrative operations.

Fields:

* `id`
* `user_id`
* `action`
* `entity_type`
* `entity_id`
* `metadata`
* `created_at`

Foreign key:

`user_id -> profiles.id`

Example actions:

* USER_ROLE_CHANGED
* COURSE_PUBLISHED
* USER_APPROVED
* COMPETENCY_UPDATED

For hackathon scope, audit logging may initially cover only important admin actions.

---

# 32. Future AI / RAG Tables

These are not needed for the initial MVP.

Possible future tables:

## knowledge_documents

Stores metadata for approved documents.

Fields:

* `id`
* `title`
* `file_url`
* `document_type`
* `uploaded_by`
* `created_at`

---

## knowledge_chunks

Stores document chunks for retrieval.

Fields:

* `id`
* `document_id`
* `content`
* `embedding`
* `chunk_index`
* `metadata`
* `created_at`

Vector field:

`embedding`

Technology:

Supabase pgvector

Do not create these tables until the AI/RAG phase.

---

# 33. Main Relationships

High-level structure:

`auth.users`

↓

`profiles`

↓

User-specific data

---

Trainee relationship:

`profiles`

↓

`trainee_profiles`

↓

`enrollments`

↓

`courses`

↓

`modules`

↓

`lessons`

↓

`lesson_progress`

---

Assessment relationship:

`courses`

↓

`assessments`

↓

`assessment_questions`

↓

`question_options`

---

Assessment submission:

`assessment_attempts`

↓

`assessment_answers`

↓

Competency update

↓

`user_competencies`

↓

`competency_score_history`

↓

`skill_gaps`

↓

`course_recommendations`

↓

`trainer_recommendations`

---

Trainer relationship:

`profiles`

↓

`trainer_profiles`

↓

`trainer_competencies`

↓

`competencies`

---

# 34. Minimum MVP Tables

Do not create every possible table immediately.

The first database implementation should prioritize:

1. profiles
2. trainee_profiles
3. trainer_profiles
4. competencies
5. user_competencies
6. trainer_competencies
7. courses
8. course_competencies
9. modules
10. lessons
11. enrollments
12. lesson_progress
13. assessments
14. assessment_questions
15. question_options
16. assessment_attempts
17. assessment_answers
18. competency_score_history
19. skill_gaps
20. feedback
21. certificates
22. notifications

Recommendation tables can be added after deterministic recommendation logic is implemented.

Audit logs can be added during the admin/security phase.

AI tables must be added only during the AI phase.

---

# 35. Tables That Should NOT Exist

Avoid tables such as:

* separate `admins`
* separate authentication password table
* duplicate user tables
* separate login table
* separate trainee authentication table
* separate trainer authentication table

Authentication identity comes from:

`auth.users`

Role and common application information come from:

`profiles`

Role-specific details come from specialized profile tables.

---

# 36. Data Deletion Strategy

Avoid permanently deleting important records.

Prefer:

Courses:

`status = archived`

Users:

`is_active = false`

Competencies:

`is_active = false`

This protects historical information such as:

* Assessment records
* Course completion
* Certificates
* Competency history

---

# 37. Database Security Principle

Every table containing user-specific information must later have Supabase Row Level Security policies.

Example intent:

Trainee:

Can read/update own profile.

Can read own enrollments.

Can read own assessment attempts.

Can read own competency information.

Cannot read other trainees' private records.

Trainer:

Can access courses assigned to them.

Can access authorized trainee learning information related to assigned courses.

Cannot arbitrarily access all user data.

Admin:

Can access authorized administrative information.

Database security must not depend only on frontend route protection.

Detailed policies belong in:

`docs/07-security.md`

---

# 38. Important Implementation Rule

Do not immediately create this entire schema in Supabase.

Implementation must happen in stages.

Recommended sequence:

Stage 1:

* profiles
* trainee_profiles
* trainer_profiles

Stage 2:

* competencies
* user_competencies
* trainer_competencies

Stage 3:

* courses
* course_competencies
* modules
* lessons

Stage 4:

* enrollments
* lesson_progress

Stage 5:

* assessments
* questions
* options
* attempts
* answers

Stage 6:

* competency history
* skill gaps

Stage 7:

* feedback
* certificates
* notifications

Stage 8:

* recommendations
* analytics support
* audit logs

Stage 9:

* AI/RAG tables

Each stage should be tested before proceeding.

---

# 39. Source of Truth

This document defines the intended database architecture.

Before creating or modifying a database table:

1. Check this document.
2. Check `01-requirements.md`.
3. Check `02-user-flows.md`.
4. Confirm the table is actually required.
5. Avoid duplicating existing data structures.

If database architecture changes during development, update this document before or alongside the implementation.
