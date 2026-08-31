# CAPACITY CONNECT — Security Specification

## 1. Purpose

This document defines the security model for CAPACITY CONNECT.

The application uses:

* Next.js
* Supabase Auth
* Supabase PostgreSQL
* Supabase Row Level Security
* Supabase Storage

The goal is to ensure that:

* Trainees can access only what they are allowed to access.
* Trainers can access only assigned training data.
* Admins can perform authorized administrative actions.
* Sensitive data and secrets are never exposed to the browser.
* Correct assessment answers remain protected.
* Authorization is enforced at more than one layer.

Security must not rely only on frontend navigation or hidden buttons.

---

# 2. Security Layers

CAPACITY CONNECT should use multiple layers of protection:

User Interface

↓

Server-side authorization

↓

Supabase Row Level Security

↓

Database constraints

This means:

A hidden button is not security.

A protected route alone is not security.

A server-side check alone should not replace database protection when RLS is appropriate.

---

# 3. Authentication

Authentication should use:

Supabase Auth

Supabase is responsible for:

* Password handling
* Login
* Session management
* Authentication tokens
* Password-reset functionality if enabled

CAPACITY CONNECT must not create a custom password table.

---

# 4. Application Identity

Supabase authentication identity exists in:

`auth.users`

Application-level user data exists in:

`profiles`

The primary relationship is:

`profiles.id = auth.users.id`

All role-specific data ultimately maps back to the authenticated identity.

---

# 5. Roles

Supported roles:

* trainee
* trainer
* admin

Roles should be stored in trusted database data.

A user must never gain permissions simply by changing a value in the browser.

Example malicious request:

```json id="rm1k4j"
{
  "role": "admin"
}
```

must never be sufficient to become an admin.

---

# 6. Role Assignment

New users should not be able to freely assign themselves privileged roles.

Preferred registration behavior:

A normal signup defaults to:

`trainee`

or

`pending`

depending on final approval workflow.

Trainer and Admin roles must be assigned through trusted administrative processes.

---

# 7. Profile Permissions

## Trainee

May:

* Read own profile
* Update permitted own profile fields

Must not:

* Change own role
* Change own approval status
* Change own active status
* Modify another user's profile

---

## Trainer

May:

* Read own profile
* Update permitted own trainer-profile information

Must not:

* Change own role
* Change own approval status
* Modify unrelated users

---

## Admin

May perform authorized profile-management operations such as:

* View users
* Approve users
* Change roles
* Activate/deactivate accounts

These operations should be server-authorized and ideally audit logged.

---

# 8. Sensitive Profile Fields

Users should not directly control fields such as:

* role
* is_approved
* is_active

These should be protected through:

* RLS
* server authorization
* restricted update logic

---

# 9. Route Protection

Protected route groups should verify user authentication.

Examples:

Trainee:

`/trainee/*`

Trainer:

`/trainer/*`

Admin:

`/admin/*`

If unauthorized:

Redirect safely or show access denied.

However, route protection does not replace RLS.

---

# 10. Permission Matrix Overview

Legend:

R = Read

C = Create

U = Update

D = Delete

Limited = only records allowed by relationship/policy

Admin = authorized admin operation

---

# 11. profiles

## Trainee

R: Own

C: Normally created during signup/profile initialization

U: Own permitted fields

D: No direct delete

## Trainer

R: Own

U: Own permitted fields

D: No direct delete

## Admin

R: Authorized users

U: Authorized administrative fields

D: Prefer deactivate rather than delete

---

# 12. trainee_profiles

## Trainee

R: Own

C: Own where permitted

U: Own

D: No direct delete

## Trainer

R: Only where necessary for assigned trainee/course context

U: No

D: No

## Admin

R: Authorized

U: Authorized

D: Prefer archival/deactivation approach

---

# 13. trainer_profiles

## Trainer

R: Own

C: Own where permitted

U: Own

## Trainee

R: Limited trainer information intended for discovery/recommendation

Do not expose unnecessary private fields.

## Admin

R/U: Authorized

---

# 14. competencies

## Trainee

R: Active competencies

C/U/D: No

## Trainer

R: Active competencies

C/U/D: No unless specifically delegated later

## Admin

R: Yes

C: Yes

U: Yes

D: Prefer deactivate rather than delete

---

# 15. user_competencies

## Trainee

R: Own

C: No direct client creation

U: No direct arbitrary update

D: No

Competency scores should be changed only through trusted scoring logic.

## Trainer

R:

Only permitted trainee competency information where relevant to assigned training relationships.

U:

No direct arbitrary updates.

## Admin

R:

Authorized aggregate/detail access.

Manual updates, if supported, must be explicitly controlled and audit logged.

---

# 16. trainer_competencies

## Trainee

R:

Public/authorized trainer expertise information used for recommendations.

## Trainer

R:

Own

U:

Possibly own declared expertise only if product rules allow it.

Verified status must not be self-assigned.

## Admin

R/C/U:

Authorized management.

---

# 17. courses

## Trainee

R:

Published courses.

C/U/D:

No.

## Trainer

R:

Assigned courses.

U:

Only permitted assigned-course fields.

C:

Only if product permits trainer-created courses.

Otherwise admin creates course.

D:

No permanent delete.

## Admin

R/C/U:

Authorized.

Publish/archive controlled by admin.

---

# 18. course_competencies

## Trainee

R:

Mappings for visible published courses.

C/U/D:

No.

## Trainer

R:

Assigned-course mappings.

U:

Only if product explicitly allows trainer mapping.

For MVP, prefer admin-controlled mapping.

## Admin

R/C/U:

Authorized.

---

# 19. modules and lessons

## Trainee

R:

Only content from published courses the trainee is permitted to access.

If enrollment is required for lesson content, policy should enforce enrollment.

C/U/D:

No.

## Trainer

R:

Assigned-course content.

C/U:

Assigned courses only.

D:

Prefer archive/status change where appropriate.

## Admin

Authorized access.

---

# 20. enrollments

## Trainee

R:

Own enrollments.

C:

May enroll self into permitted published courses through trusted flow.

U:

No arbitrary progress/status manipulation.

D:

No direct delete.

## Trainer

R:

Enrollments for assigned courses.

C/U/D:

No unless specific administrative functionality is added.

## Admin

Authorized access.

---

# 21. lesson_progress

## Trainee

R:

Own.

C/U:

Own progress only through verified enrollment relationship.

User must not create progress for lessons outside enrolled courses.

## Trainer

R:

Progress for trainees in assigned courses.

U:

No.

## Admin

Authorized read.

---

# 22. assessments

## Trainee

R:

Published assessments user is authorized to access.

C/U/D:

No.

## Trainer

R:

Assigned-course assessments.

C/U:

Assigned courses only.

Publish permissions should follow documented course rules.

## Admin

Authorized.

---

# 23. assessment_questions

## Trainee

R:

Authorized assessment questions.

Sensitive answer information must not be included.

## Trainer

R/C/U:

Questions belonging to assigned-course assessments.

## Admin

Authorized.

---

# 24. question_options

This table is especially sensitive.

Contains:

`is_correct`

Trainees must NOT be able to directly select this protected field before assessment submission.

Preferred security:

* Do not grant broad trainee SELECT to full table
* Use safe server-side query
* Or safe database view/function that excludes `is_correct`

Trainer access:

Only for assessments they are authorized to manage.

Admin:

Authorized.

---

# 25. assessment_attempts

## Trainee

R:

Own attempts.

C:

Only through trusted assessment-submission flow.

U:

No arbitrary score updates.

D:

No.

## Trainer

R:

Attempts for trainees in assigned courses.

## Admin

Authorized.

Scores must never be client-controlled.

---

# 26. assessment_answers

## Trainee

R:

Own submitted answers where product permits review.

C:

Only through trusted assessment submission.

U/D:

No.

## Trainer

R:

Authorized assessment context.

## Admin

Authorized.

Fields such as:

* is_correct
* points_awarded

must be calculated server-side.

---

# 27. competency_score_history

## Trainee

R:

Own.

C/U/D:

No direct client modification.

## Trainer

R:

Only authorized trainee context.

## Admin

Authorized.

History should be append-oriented.

Existing history should rarely be modified.

---

# 28. skill_gaps

## Trainee

R:

Own.

C/U/D:

No arbitrary client modification.

## Trainer

R:

Authorized relevant trainees.

## Admin

Authorized.

Skill-gap values should derive from trusted competency calculations.

---

# 29. feedback

## Trainee

R:

Own submitted feedback where allowed.

C:

Own feedback for eligible courses.

U:

Own feedback only if editing is permitted.

For MVP, feedback may become immutable after submission.

D:

No direct delete.

## Trainer

R:

Feedback related to assigned courses.

Do not allow trainer to alter learner feedback.

## Admin

Authorized.

---

# 30. certificates

## Trainee

R:

Own.

C:

No direct creation.

U/D:

No.

Certificates must be generated through trusted completion logic.

## Trainer

R:

Limited authorized context if needed.

## Admin

Authorized.

---

# 31. notifications

## Trainee

R:

Notifications targeted to trainee or all users.

C/U/D:

No.

## Trainer

R:

Notifications targeted to trainer or all users.

C/U/D:

No.

## Admin

R/C/U:

Authorized publishing.

Prefer deactivate/expire rather than destructive deletion.

---

# 32. notification_reads

Users may:

R:

Own read records.

C:

Mark notification as read for themselves.

U:

Own.

D:

Usually unnecessary.

Users must not mark another user's notification state.

---

# 33. audit_logs

Normal trainees and trainers:

No direct access.

Admins:

Read access may be provided.

Insert:

Should generally happen through trusted server/database processes.

Audit entries should not be arbitrarily editable or deletable.

---

# 34. Row Level Security

RLS should be enabled on every application table containing protected or user-specific data.

Examples:

* profiles
* trainee_profiles
* trainer_profiles
* user_competencies
* trainer_competencies
* courses
* modules
* lessons
* enrollments
* lesson_progress
* assessments
* assessment_attempts
* assessment_answers
* skill_gaps
* feedback
* certificates
* notifications

Do not create a table and forget to evaluate RLS.

---

# 35. RLS Helper Functions

Repeated role checks may later use safe PostgreSQL helper functions.

Example concept:

`is_admin()`

`is_trainer()`

However:

Avoid overly complex security helper abstractions initially.

Policies should remain understandable.

If helper functions are used, they must be implemented carefully with PostgreSQL security behavior understood.

---

# 36. Admin Detection

Avoid insecure patterns where database policy trusts browser-provided role values.

The database should derive admin authorization from authenticated user identity and trusted profile information.

Example logical concept:

Authenticated user ID

↓

Lookup trusted profile role

↓

role == admin

---

# 37. Storage Buckets

Possible storage buckets:

* avatars
* course-resources
* certificates
* future knowledge-documents

Storage access must also follow authorization rules.

Database RLS does not automatically secure Storage objects.

Storage policies must be configured separately.

---

# 38. Avatar Storage

Users may upload their own avatar.

Suggested path:

`avatars/{userId}/...`

Users should not be able to overwrite another user's files.

Allowed types should be restricted to appropriate image formats.

Limit size.

---

# 39. Course Resource Storage

Suggested path:

`course-resources/{courseId}/{resourceId}/...`

Upload permission:

Trainer assigned to course

or

Admin

Read permission:

Authorized trainee

Assigned trainer

Admin

Public access should not be enabled automatically for protected training resources.

---

# 40. Certificate Storage

If generated certificate files are stored:

Suggested path:

`certificates/{certificateId}/...`

Users may read their own certificate.

Public verification should not necessarily expose the raw stored file.

A verification page can expose only required verification information.

---

# 41. AI Knowledge Document Storage

Future approved RAG documents should live in a protected bucket.

Possible path:

`knowledge-documents/{documentId}/...`

Only authorized content administrators should upload/index documents.

Do not allow any trainee to upload arbitrary documents into the trusted knowledge base.

---

# 42. Environment Secret Security

Never commit:

`.env.local`

API keys

Service-role credentials

Private tokens

Ensure `.gitignore` covers local environment files.

Before every Git commit involving configuration, check:

`git status`

---

# 43. Supabase Anon Key

The Supabase anon/publishable key can be used in browser applications as intended.

It does not grant unrestricted database access when RLS is configured correctly.

Security must come from policies.

Do not confuse the anon key with the service-role key.

---

# 44. Supabase Service-Role Key

The service-role key bypasses normal RLS protections.

It must:

* Remain server-only
* Never use `NEXT_PUBLIC_`
* Never appear in browser bundles
* Never be committed to Git

Use only when necessary.

Routine application logic should not use service role simply to bypass security-policy problems.

---

# 45. Gemini API Key

Future Gemini API credentials must remain server-side.

Never:

* Embed in React client components
* Put in browser fetch code
* Commit to Git
* Display in logs

---

# 46. Input Validation

Never trust user input.

Validate:

* Form values
* UUIDs
* Ratings
* Scores
* Course status
* File metadata
* Role changes
* Search/filter inputs where appropriate

Use:

Zod

plus

Database constraints.

---

# 47. Database Constraints

RLS controls access.

Constraints protect data correctness.

Examples:

Competency score:

0–100

Rating:

1–5

Passing score:

0–100

Recommendation score:

0–100

Role:

Known allowed values

Unique relationships:

Prevent duplicate enrollments.

Security and integrity require both policies and constraints.

---

# 48. Mass Assignment Prevention

Do not blindly pass entire browser objects into database updates.

Bad:

```ts id="zx7lyo"
supabase
  .from("profiles")
  .update(formData)
```

if `formData` could contain privileged fields.

Prefer explicitly selecting allowed fields.

Example:

```ts id="aemz76"
{
  full_name,
  designation,
  bio
}
```

This prevents user-controlled updates to fields like:

`role`

or:

`is_approved`

---

# 49. IDOR Protection

IDOR means:

Insecure Direct Object Reference.

Example attack:

Trainee changes URL from:

`/trainee/certificate/ABC`

to:

`/trainee/certificate/XYZ`

hoping to access another person's record.

Every record lookup must verify authorization.

Never assume an unpredictable UUID alone makes a record secure.

---

# 50. Assessment Security

Assessment security is a high-priority area.

Protect against:

* Correct answers exposed before submission
* Client-calculated score
* Client-calculated competency update
* Unauthorized retakes
* Submission after deadline where forbidden
* Attempt modification after submission

Assessment result calculation must happen in trusted logic.

---

# 51. Competency Engine Security

The browser must not send authoritative values such as:

```text id="vofvcy"
newCompetencyScore = 95
```

Instead:

Server receives assessment answers.

↓

Calculates score.

↓

Calculates competency update.

↓

Writes trusted values.

Same principle applies to:

* Skill gap
* Recommendation score
* Trainer match

---

# 52. Trainer Data Access

Trainer access should follow assigned relationships.

Trainer role alone should not mean:

"Can see every trainee."

Trainer should see trainees associated with:

* Assigned courses
* Authorized training context

This reduces unnecessary employee-data exposure.

---

# 53. Admin Security

Admin pages are sensitive.

Every admin operation must verify server-side admin role.

Especially:

* Role changes
* User approval
* Course publishing
* Competency changes
* Account deactivation

Admin interfaces should not rely only on `/admin` route location.

---

# 54. Confirmation for Sensitive Actions

Actions such as:

* Deactivate user
* Archive course
* Change user role
* Publish assessment
* Change competency target

should use confirmation where accidental changes could be harmful.

---

# 55. Audit Logging

Important administrative actions should eventually produce audit records.

Suggested actions:

* USER_APPROVED
* USER_ROLE_CHANGED
* USER_DEACTIVATED
* COURSE_PUBLISHED
* COURSE_ARCHIVED
* COMPETENCY_CREATED
* COMPETENCY_UPDATED

Audit metadata should contain useful context without storing secrets.

---

# 56. Error Security

Never expose:

* Stack traces
* SQL queries
* Service keys
* Environment values
* Database internals

to normal users.

User-facing error:

"Unable to complete this action."

Server-side log:

Contains sufficient safe diagnostic detail.

---

# 57. File Upload Security

Validate:

* File extension
* MIME/content type where possible
* File size
* User permission
* Destination path

Avoid accepting arbitrary executable file types.

For course materials, expected types may include:

* PDF
* presentation/document formats
* approved video formats

The exact allowlist should be defined during implementation.

---

# 58. XSS Prevention

Avoid rendering arbitrary user-controlled HTML.

React escapes normal text by default.

Avoid `dangerouslySetInnerHTML` unless absolutely necessary and sanitized.

Course rich text should use a safe rendering strategy.

---

# 59. SQL Injection

Use Supabase query APIs and parameterized database functions.

Do not construct SQL queries by concatenating user input.

---

# 60. CSRF and Session Security

Follow supported Supabase + Next.js server authentication patterns.

Do not manually invent session-token handling.

Sensitive actions must verify current authenticated session.

---

# 61. Rate Limiting

High-risk or expensive endpoints may later need rate limiting.

Potential targets:

* Login abuse
* Public certificate verification
* AI endpoints
* Expensive searches

Do not add Redis solely for the MVP unless actually necessary.

---

# 62. Public Data

The following may be public if intentionally designed:

* Homepage
* Basic platform description
* Certificate verification result
* Possibly selected public course summaries

Do not expose:

* Full user directory
* Trainee scores
* Skill gaps
* Private training content
* Internal analytics

---

# 63. Demo Account Security

Demo accounts may exist for hackathon demonstrations.

Do not use real employee information.

Use clearly synthetic profiles.

Do not commit real credentials.

If demo credentials are displayed for judges, they should belong only to prototype data/accounts.

---

# 64. Seed Data

Seed data must be fictional/demonstrative.

Never imply seeded competency values represent actual IMD employee competency records.

Examples should be clearly prototype data.

---

# 65. Dependency Security

Do not install packages only because an AI agent suggests them.

Before adding a dependency:

1. Confirm existing stack cannot solve the problem simply.
2. Check package purpose.
3. Prefer maintained packages.
4. Avoid unnecessary dependencies.

Keep package count manageable.

---

# 66. AI Agent Security Rules

Antigravity must never:

* Place secrets in client code.
* Disable RLS just to make code work.
* Use service role throughout application.
* Expose correct answers to trainees.
* Trust client-supplied role.
* Trust client-supplied user ID for ownership.
* Trust client-calculated scores.
* Remove authorization checks to fix bugs.
* Commit `.env.local`.
* Generate overly broad RLS policies such as unrestricted access.

Example forbidden policy concept:

"Authenticated users can do everything."

Policies must correspond to documented permissions.

---

# 67. Security Review Before Each Feature

Before a feature is considered complete, answer:

1. Who can access it?
2. Who can modify it?
3. Does RLS protect the records?
4. Does server authorization exist where needed?
5. Can user manipulate ownership ID?
6. Are privileged fields protected?
7. Are secrets server-only?
8. Are database constraints present?
9. Can another role access the data by changing a URL?
10. Are errors safe?

---

# 68. MVP Security Priorities

Highest-priority security work:

1. Correct authentication
2. Role-based authorization
3. Profile RLS
4. Enrollment ownership
5. Trainer assignment restrictions
6. Assessment answer protection
7. Server-side scoring
8. Competency update protection
9. Admin action protection
10. Secure file access

Advanced enterprise security can come later.

---

# 69. Security vs Demo Speed

Hackathon time pressure must not justify deliberately insecure architecture.

However, avoid over-engineering.

Prefer:

Simple, correct RLS

*

Small number of trusted server operations

over:

Complex microservices

or

RLS disabled for convenience.

---

# 70. Production Disclaimer

CAPACITY CONNECT is currently a prototype.

A real production deployment within a government organization would require additional review such as:

* Organizational identity integration
* Formal security testing
* Vulnerability assessment
* Data classification
* Data-retention policy
* Backup and disaster recovery
* Monitoring
* Incident response
* Infrastructure/security approval

Do not claim the hackathon prototype is production-certified.

---

# 71. Source of Truth

Security implementation must align with:

* `01-requirements.md`
* `02-user-flows.md`
* `03-database-schema.md`
* `04-competency-engine.md`
* `05-ui-design.md`
* `06-api-rules.md`
* `07-security.md`

If development requires changing permissions, update this specification intentionally.

Do not silently weaken security to make a feature work.
