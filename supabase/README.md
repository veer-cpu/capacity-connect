# Capacity Connect — Supabase Migrations & Reproducibility Guide

This directory contains version-controlled, idempotent PostgreSQL SQL migration scripts to reproduce the complete Capacity Connect application database on a fresh Supabase project.

---

## 1. Migration Directory Structure & Execution Order

All migrations are located under `supabase/migrations/` and must be applied in sequential numerical/timestamp order:

1. **`20260913000001_core_profiles.sql`**
   - Core UUID extensions (`uuid-ossp`, `pgcrypto`)
   - `organizational_units`, `job_roles`, `profiles`, `trainee_profiles`, `trainer_profiles`, `job_role_competencies`
   - Automated trigger `handle_new_user()` for Supabase Auth integration
   - Admin user administration and organization assignment RPCs
   - Base Row Level Security (RLS) policies

2. **`20260913000002_competencies.sql`**
   - `competencies`, `skills`, `user_competencies`, `trainer_competencies`
   - Target calculation engine `get_effective_competency_target()`
   - Analytics RPCs: `admin_list_competencies`, `admin_upsert_competency`, `admin_competency_heatmap`, `admin_capacity_grid`

3. **`20260913000003_courses_learning.sql`**
   - `courses`, `course_competencies`, `course_skills`, `modules`, `lessons`, `learning_resources`, `enrollments`, `lesson_progress`
   - Course review & approval workflow (`approval_status`, `trainer_submit_course_for_review`, `admin_review_course`)
   - Trainee lesson progress calculation `complete_lesson()`

4. **`20260913000004_assessments_assignments.sql`**
   - `assessments`, `assessment_questions`, `question_options`, `assessment_attempts`, `assessment_answers`
   - MCQ security protection (`get_safe_question_options` hiding `is_correct` from trainees)
   - Authoritative assessment scoring RPC `submit_assessment()`
   - `assignments` and `assignment_submissions` with trainer evaluation workflow RPCs

5. **`20260913000005_history_gaps_plans.sql`**
   - `competency_score_history`, `skill_gaps`, `development_plans`, `development_plan_items`
   - Competency Passport backend RPC `get_my_competency_passport()`
   - Training Impact analytics RPC `admin_training_impact()`
   - Development Plan staff management RPCs

6. **`20260913000006_notifications_feedback_certificates.sql`**
   - `notifications`, `notification_reads`, `announcements`, `feedback`, `certificates`
   - In-app notification engine and admin announcement publisher
   - Certificate issuance `issue_course_certificate()`, public verification `verify_certificate()`, and admin course completion reporting `admin_course_completion_report()`

7. **`20260913000007_knowledge_hub_audit_storage.sql`**
   - `knowledge_resources`, `audit_logs`
   - Storage bucket creation (`knowledge-hub`, `course-materials`) and RLS policies on `storage.objects`

---

## 2. How to Apply Migrations

### Option A: Via Supabase CLI (Recommended)

1. Ensure the Supabase CLI is installed:
   ```bash
   npx supabase --version
   ```

2. Link your local environment to your remote Supabase project:
   ```bash
   npx supabase link --project-ref <YOUR_PROJECT_REF>
   ```

3. Push all migrations sequentially:
   ```bash
   npx supabase db push
   ```

### Option B: Via Supabase Dashboard SQL Editor

If executing manually through the web UI:
1. Open the **SQL Editor** in your Supabase Dashboard.
2. Execute the files sequentially from `20260913000001_core_profiles.sql` through `20260913000007_knowledge_hub_audit_storage.sql`.

---

## 3. What is Intentionally Excluded

To strictly maintain security, compliance, and clean environment separation, the following elements are **NOT** contained in these schema migration files:

- ❌ `auth.users` rows and credentials
- ❌ Live/production user profiles and personal data
- ❌ Database passwords, connection strings, or JWT secrets
- ❌ `vault.secrets` or local `.env` configuration values
- ❌ Artificial seed rows or sample demo content

---

## 4. Handling Seed Data

Seed data (e.g., initial competency taxonomy, organizational units, job role definitions, and synthetic test data for IMD/MoES demonstration) will be placed in `supabase/seed.sql`.

To apply seed data after running migrations:
```bash
npx supabase db reset
# or run seed.sql manually in SQL Editor after schema migrations pass
```
