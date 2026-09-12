# Capacity Connect — Development Context

## Product

Capacity Connect is an IMD/MoES-oriented competency intelligence and capacity-building platform.

It is NOT merely an LMS.

Core loop:

Assessment
→ Competency Mapping
→ Skill Gap Detection
→ Training Need Analysis
→ Course Recommendation
→ Trainer Matching
→ Development Plan
→ Learning
→ Reassessment
→ Competency Improvement
→ Training Impact Analytics

Do not claim this is an official deployed IMD product.
Use wording such as "Designed for MoES / IMD".

---

## Stack

- Next.js 16 App Router
- TypeScript strict
- React 19
- Supabase Auth/Postgres/Storage
- Tailwind
- shadcn/ui using Base UI
- Zod
- Recharts where analytics charts are needed
- pdf-lib + qrcode for certificates

---

## Roles

- trainee
- trainer
- admin

Authorization is enforced through:
- server-side role guards
- Supabase RLS
- trusted RPCs
- database constraints

Never rely on client-side role checks for security.

---

## Important coding rules

1. Inspect existing files before creating new files.
2. Do not create duplicate routes/components/helpers.
3. Preserve existing architecture and naming conventions.
4. Do not modify components/ui primitives unless explicitly necessary.
5. Navigation uses Link.
6. Mutations use Button/native button.
7. Avoid uncontrolled Base UI defaultValue warnings.
8. Use server components for loading when practical.
9. Use server actions for mutations.
10. Use Zod safeParse for action input.
11. Generic errors to users; detailed console.error server-side.
12. No `any`.
13. No service-role key in browser code.
14. Do not weaken RLS.
15. Prefer trusted database RPCs for authoritative mutations.
16. Never calculate authoritative scores/roles/gaps in browser code.
17. Do not add AI functionality yet.

---

## Existing major functionality

Already implemented:

- authentication
- role-based layouts
- admin user approval/activation
- trainee/trainer/admin dashboards
- competency management
- courses/modules/lessons
- enrollment and lesson progress
- trainer assessment authoring
- secure assessment submission/scoring
- competency score history
- skill gaps
- course recommendations
- trainer recommendations
- development plans
- trainer/admin plan oversight
- notifications
- feedback
- certificates + QR verification
- professional profiles
- Knowledge Hub
- trainer analytics
- admin dashboard analytics
- competency heatmap/capacity grid backend
- training impact backend
- competency passport backend
- organization/job-role competency model

---

## Assessment security

Correct answers are protected.

Authenticated trainees can read safe question option columns only.

`is_correct` must never be exposed to trainees.

`private.submit_assessment()` is authoritative for:
- validation
- scoring
- pass/fail
- assessment attempts
- competency updates
- skill gaps

Do not move this logic to client code.

---

## Organization / Training Need model

New tables:

- organizational_units
- job_roles
- job_role_competencies

profiles contains:
- organizational_unit_id
- job_role_id

Job role competency requirements define required competency scores.

Effective target resolution:

Job-role required target
→ individual target fallback
→ competency default fallback

Helper:

private.get_effective_competency_target(uuid, uuid)

---

## Capacity Grid

Existing RPC:

public.admin_capacity_grid()

It should represent:

Employee
→ Job Role
→ Required Competencies
→ Current Score
→ Required Score
→ Gap
→ Priority

Do not revert to trainee × every competency.

---

## Competency Passport

Existing route:

app/trainee/passport/page.tsx

DO NOT create:
app/trainee/competency-passport/page.tsx

Existing RPC:

public.get_my_competency_passport()

Passport should distinguish:
- current capability
- required capability
- evidence

If current score = 0 and there is no evidence, label it:
"Not yet assessed"

Do not imply the trainee actually scored zero.

---

## Training Impact

Existing RPC:

public.admin_training_impact()

Measures:
- completed trainees
- before score
- after score
- improvement
- improvement rate
- target attainment

Training completion is NOT equivalent to training effectiveness.

---

## Notifications vs Announcements

Notifications:
- individual/system event messages

Announcements:
- admin-published organizational communications

Keep these concepts separate.

---

## Current focus

Finish visible competency-intelligence layer:

1. Capacity Grid UI
2. Competency Passport UI
3. Training Impact Analytics UI
4. Admin Announcements

Then:

5. assignments + trainer evaluation
6. course approval workflow
7. reports/CSV
8. migrations/reproducibility
9. realistic synthetic IMD demo seed
10. regression
11. deployment
12. final presentation preparation

AI integration is optional and LAST.