# CAPACITY CONNECT — API and Server Logic Rules

## 1. Purpose

This document defines how CAPACITY CONNECT should handle data access, server-side logic, Supabase operations, validation, and privileged actions.

The goal is to keep the architecture:

* Simple
* Secure
* Maintainable
* Suitable for Next.js + Supabase
* Easy for a student team to understand
* Resistant to insecure AI-generated shortcuts

CAPACITY CONNECT should not introduce a separate backend service unless a real technical requirement appears.

For the MVP, the preferred architecture is:

Next.js

*

Supabase

*

Next.js Server Actions / Route Handlers where required

---

# 2. High-Level Architecture

Preferred request flow:

Browser

↓

Next.js UI

↓

Server Component / Server Action / Route Handler where needed

↓

Supabase

↓

PostgreSQL / Auth / Storage

Not every request needs a custom API route.

Use the simplest safe mechanism.

---

# 3. Supabase Clients

The application may require separate Supabase clients for:

1. Browser usage
2. Server usage

Browser client:

Used only for actions safe for the authenticated user under Row Level Security.

Server client:

Used for server-side authenticated operations.

Privileged service-role access:

Used only for rare trusted server-side administrative operations.

The service-role key must never be exposed to the browser.

---

# 4. Environment Variables

Public browser-safe environment variables may use names such as:

`NEXT_PUBLIC_SUPABASE_URL`

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

These values may be used by browser code.

Sensitive secrets must NOT use `NEXT_PUBLIC_`.

Examples of sensitive secrets:

* Supabase service-role key
* Gemini API key
* Future private API credentials

Sensitive values should exist only in server environment variables.

---

# 5. Never Expose These to the Browser

Never send or embed:

* Supabase service-role key
* Gemini API key
* Private administrative tokens
* Database passwords
* Secret signing keys
* Internal credentials

Do not place secrets inside:

* React components rendered to browser
* Client-side JavaScript
* Public Git repository
* Static JSON files
* Browser localStorage

---

# 6. Direct Browser-to-Supabase Access

Direct browser access to Supabase is acceptable when:

* User is authenticated.
* Data belongs to the current user.
* Row Level Security fully protects the operation.
* No privileged secrets are required.
* No sensitive scoring logic is exposed.

Examples that may use normal authenticated Supabase access:

* Read own profile
* Update permitted profile fields
* Read published courses
* Read own enrollments
* Read own notifications
* Read own certificates

This must still be protected by RLS.

---

# 7. Server-Side Operations

Use server-side logic when:

* Operation is security-sensitive.
* Multiple database writes must happen together.
* Hidden fields are involved.
* Business logic must not be trusted to client.
* A privileged API key is needed.
* Assessment correctness is calculated.
* Competency score changes.
* Trainer matching runs.
* Certificate issuance occurs.
* Admin performs sensitive actions.

---

# 8. Server Components

Prefer Server Components for read-heavy pages where client interactivity is not required.

Examples:

* Initial dashboard data
* Course details
* Admin analytics
* Competency profile
* Certificate view

Benefits:

* Reduced browser-side code
* Server-side data access
* Less accidental secret exposure

Use Client Components only where interactivity requires them.

---

# 9. Client Components

Use `"use client"` only when required.

Examples:

* Interactive forms
* Tabs requiring client state
* Modals
* Dropdowns
* Assessment answer selection
* Interactive charts where needed
* Mobile menu

Do not mark an entire page as a Client Component just because one small section requires interaction.

Prefer extracting the interactive part.

---

# 10. Server Actions

Server Actions are preferred for many authenticated form submissions and business operations.

Possible examples:

* Update profile
* Enroll in course
* Mark lesson complete
* Submit feedback
* Create course
* Publish course
* Create assessment
* Submit assessment
* Approve user
* Publish notification

A Server Action must:

1. Validate input.
2. Verify authenticated user.
3. Verify role/authorization.
4. Perform database action.
5. Return safe result.
6. Avoid leaking internal errors.

---

# 11. Route Handlers

Use Next.js Route Handlers when a normal HTTP endpoint is genuinely useful.

Possible use cases:

* Certificate verification endpoint
* Webhooks
* File-processing endpoint
* AI/RAG endpoint
* External integration
* Streaming AI response

Do not create an API route for every database query.

---

# 12. Validation

Use Zod for application-level validation.

Validation should exist at multiple layers where appropriate:

Browser:

For user experience.

Server:

For security and correctness.

Database:

For final constraints.

Example:

Rating:

UI validates 1–5.

Server validates 1–5.

Database constraint enforces 1–5.

---

# 13. Authentication Check

Every protected server operation must verify the authenticated user.

Do not trust:

* User ID from request body
* Role from browser state
* Hidden form field
* URL parameter alone

The authenticated identity should come from the Supabase session.

---

# 14. Authorization Check

Authentication answers:

"Who is this user?"

Authorization answers:

"Is this user allowed to do this?"

Every protected operation must check both.

Example:

A logged-in trainee is authenticated.

But that trainee is not authorized to:

* Approve users
* Create admin notifications
* Modify another trainee's score
* Publish courses

---

# 15. Role Checks

Roles:

* trainee
* trainer
* admin

Server-side role checks should use trusted profile/database information.

Do not trust a client-supplied value such as:

`role: "admin"`

Frontend role checks are only for interface behavior.

They are not security controls.

---

# 16. Row Level Security

RLS is mandatory for user-sensitive tables.

Application authorization should combine:

Frontend UX restriction

*

Server-side authorization

*

Database RLS

The database should remain safe even if someone bypasses the UI.

---

# 17. Profile Update Rules

Trainee may update permitted personal profile fields.

Trainer may update permitted trainer profile fields.

Users must not be able to change their own role through a normal profile update.

Fields such as:

* role
* is_approved
* is_active

must be controlled by authorized admin/server operations.

---

# 18. Enrollment Operation

Preferred enrollment flow:

Trainee clicks Enroll.

↓

Server Action receives course ID.

↓

Server identifies authenticated user.

↓

Verify role = trainee.

↓

Verify course exists.

↓

Verify course status = published.

↓

Check existing enrollment.

↓

Create enrollment.

↓

Return success.

Never accept trainee ID from browser as authoritative.

Use authenticated user ID.

---

# 19. Lesson Completion

Preferred flow:

Trainee clicks Mark Complete.

↓

Server verifies:

* User authenticated
* User is trainee
* User is enrolled in course
* Lesson belongs to enrolled course

↓

Upsert lesson progress.

↓

Recalculate course progress.

↓

Return updated progress.

Client should not directly set arbitrary progress percentage.

---

# 20. Course Progress

Course progress should be derived from lesson completion.

Example:

Required lessons completed

divided by

Total required lessons

× 100

Client should not send:

`progress = 90`

and have database blindly accept it.

The server/database should calculate the progress.

---

# 21. Assessment Start

Before assessment begins, server should verify:

* User authenticated
* User is trainee
* User has access to assessment
* Assessment is published
* Deadline has not passed where applicable
* Attempt rules allow another attempt

Do not send correct answer information to trainee.

---

# 22. Assessment Question Security

This is a critical rule.

Trainee-facing queries must not expose:

`question_options.is_correct`

before submission.

Do not fetch all columns using:

`select("*")`

on sensitive assessment tables if that exposes correct answers.

Create safe queries/views or select only required fields.

---

# 23. Assessment Submission

Preferred flow:

Browser sends:

* Assessment ID
* Selected option IDs

Browser must NOT send:

* Final score
* Correct/incorrect values
* Points awarded
* Pass/fail status

Server determines these values.

Flow:

Receive answers.

↓

Verify authenticated trainee.

↓

Fetch assessment questions and protected answer key server-side.

↓

Calculate score.

↓

Create assessment attempt.

↓

Store submitted answers.

↓

Update competency scores.

↓

Create competency history.

↓

Recalculate skill gaps.

↓

Return safe result.

---

# 24. Assessment Transaction

Assessment submission modifies multiple records.

Possible writes:

* assessment_attempts
* assessment_answers
* user_competencies
* competency_score_history
* skill_gaps

These operations should ideally be atomic.

If practical, use:

* PostgreSQL function / RPC

or another transaction-safe server approach.

Avoid a state where:

Assessment saves

but

Competency update fails

leaving inconsistent records.

For early MVP implementation, prioritize correctness and test carefully.

---

# 25. Competency Calculation Location

Competency calculations must not run only in client JavaScript.

Preferred locations:

* Server-side TypeScript
* PostgreSQL function if appropriate

The browser may display calculations but must not be authoritative.

---

# 26. Skill Gap Calculation

Inputs:

* Current competency
* Target competency

Calculation:

`max(target - current, 0)`

This should be performed in trusted server/database logic.

The client should display the result.

---

# 27. Course Recommendation Logic

Course recommendation ranking should run in trusted application/server logic.

Inputs may include:

* Competency gap
* Course relevance
* Difficulty suitability

The browser should not be able to manipulate recommendation scores.

For MVP, recommendation calculations may happen when the dashboard is loaded rather than being permanently stored.

---

# 28. Trainer Matching Logic

Trainer matching should run server-side.

Inputs include:

* Trainer competency
* Experience
* Performance
* Course relevance
* Availability
* Feedback

The resulting score must be calculated from trusted data.

Do not accept matching component scores from the browser.

---

# 29. Certificate Issuance

Certificates must be issued only after trusted completion checks.

Flow:

Verify:

* Trainee enrolled
* Required lessons completed
* Required assessments passed
* Certificate not already issued

↓

Generate unique certificate code.

↓

Create certificate.

↓

Return certificate information.

Do not let the browser directly insert arbitrary certificates.

---

# 30. Certificate Verification

Certificate verification may be public.

Example route:

`/verify/[certificateId]`

Public information should be minimal.

Possible visible information:

* Certificate validity
* Trainee name
* Course
* Issue date
* Certificate code

Do not expose unrelated profile information.

---

# 31. Trainer Course Operations

Trainer may modify only authorized/assigned courses.

Server must verify trainer-course relationship before allowing:

* Resource upload
* Lesson creation
* Assessment creation
* Trainee performance access

Trainer role alone should not automatically grant access to every course.

---

# 32. Admin Operations

Sensitive admin operations include:

* Role change
* User approval
* Account activation/deactivation
* Course publishing
* Competency management
* Trainer assignment
* Notification publishing

All must run through trusted server logic.

Every operation must verify:

Authenticated user role = admin.

Important changes should eventually be audit logged.

---

# 33. Storage Upload Rules

Supabase Storage may contain:

* Course PDFs
* Presentations
* Training videos
* Profile images
* Future approved knowledge documents

Uploads must validate:

* Authenticated user
* Permission
* File type
* File size
* Storage path

Do not rely only on the HTML file picker `accept` attribute.

Server/storage rules must enforce restrictions too.

---

# 34. Storage Path Structure

Suggested organization:

`course-resources/{courseId}/{resourceId}/...`

`avatars/{userId}/...`

`certificates/{certificateId}/...`

Future:

`knowledge-documents/{documentId}/...`

Avoid dumping all files into one shared root folder.

---

# 35. Service Role Usage

Supabase service role bypasses RLS.

Therefore:

Use it only when absolutely required.

Allowed examples may include:

* Trusted administrative maintenance
* Secure backend job
* Controlled server-only operation

Do NOT use the service-role key simply because an RLS policy is difficult to write.

Fix the policy instead.

---

# 36. Error Handling

Server operations should log useful technical information internally.

Users should receive safe messages.

Good user message:

"Unable to enroll in this course."

Bad user message:

`duplicate key value violates unique constraint enrollments_trainee_id_course_id_key`

Do not expose:

* SQL
* Stack traces
* Secret values
* Internal file paths

---

# 37. Response Shape

Server operations should use predictable result formats.

Example:

Success:

```ts
{
  success: true,
  data: ...
}
```

Failure:

```ts
{
  success: false,
  error: "COURSE_ALREADY_ENROLLED"
}
```

UI can map error codes to friendly messages.

Avoid returning random response shapes across the app.

---

# 38. Error Codes

Possible application-level error codes:

* UNAUTHENTICATED
* UNAUTHORIZED
* VALIDATION_ERROR
* NOT_FOUND
* COURSE_NOT_PUBLISHED
* COURSE_ALREADY_ENROLLED
* ASSESSMENT_CLOSED
* ATTEMPT_NOT_ALLOWED
* CERTIFICATE_ALREADY_EXISTS
* STORAGE_UPLOAD_FAILED
* INTERNAL_ERROR

Do not expose sensitive implementation details through error codes.

---

# 39. Pagination

Large lists should eventually use pagination.

Examples:

* Users
* Courses
* Notifications
* Audit logs
* Assessment attempts

For small seeded hackathon datasets, simple pagination or limited result sets are sufficient.

Avoid fetching unlimited rows.

---

# 40. Search and Filtering

Prefer database-level filtering rather than downloading all records and filtering in the browser.

Example:

Course catalogue filtering should eventually query:

* Category
* Difficulty
* Competency
* Search term

This becomes important as data grows.

---

# 41. Database Queries

Avoid excessive sequential queries when one query or joined view can safely return needed information.

But also avoid giant complicated queries that are hard for the team to maintain.

Prioritize:

Correctness

↓

Security

↓

Clarity

↓

Optimization

---

# 42. Type Safety

Use TypeScript types.

When practical, generate Supabase database types.

Avoid widespread use of:

`any`

Use Zod schemas or typed inputs for server operations.

---

# 43. Naming Convention

Suggested server action names:

`updateProfile`

`enrollInCourse`

`markLessonComplete`

`submitAssessment`

`submitFeedback`

`issueCertificate`

`createCourse`

`publishCourse`

`approveUser`

`publishNotification`

Use descriptive names.

Avoid ambiguous functions such as:

`handleData()`

`doAction()`

`updateStuff()`

---

# 44. Suggested Project Structure

A possible structure:

`app/`

Routes and pages.

`components/`

Reusable UI components.

`lib/`

Shared utilities.

`lib/supabase/`

Supabase clients.

`lib/competency/`

Competency calculation logic.

`lib/validation/`

Zod schemas.

`actions/`

Server Actions if centralized structure is chosen.

`types/`

Shared TypeScript types.

Do not restructure the repository unnecessarily if Next.js conventions already provide a clean solution.

---

# 45. Supabase Client Structure

Possible structure:

`lib/supabase/client.ts`

Browser Supabase client.

`lib/supabase/server.ts`

Server Supabase client.

Possible privileged client:

`lib/supabase/admin.ts`

Only if genuinely necessary.

Any admin/service-role client must be server-only.

---

# 46. AI API Rules

Future Gemini API calls must run server-side.

Never call Gemini using a secret API key directly from browser JavaScript.

Possible future endpoint:

`/api/ai/knowledge-assistant`

or equivalent server action/route.

AI should receive only the data necessary for the task.

Do not send unrestricted sensitive user records to external AI APIs.

Detailed AI rules belong in:

`docs/08-ai-features.md`

---

# 47. Logging

During development, useful server logs may include:

* Failed operation type
* Safe user identifier
* Error category
* Timestamp

Do not log:

* Passwords
* Authentication tokens
* API keys
* Full sensitive documents

Production logging should be more controlled.

---

# 48. Rate Limiting

Rate limiting may eventually be useful for:

* Login-related abuse
* AI endpoints
* Public certificate verification
* Expensive operations

For the hackathon MVP, do not introduce Redis solely for rate limiting.

Use platform-supported/simple mechanisms if needed.

---

# 49. No Separate FastAPI Backend Initially

Do not add FastAPI simply because Python is available.

Next.js + Supabase can support the initial application.

A separate backend may be justified later for:

* Heavy data processing
* Dedicated ML services
* Complex integrations
* Large asynchronous jobs

None are required for the initial MVP.

---

# 50. No Generic CRUD API Layer

Do not build routes such as:

`/api/create`

`/api/update`

`/api/delete`

with arbitrary table access.

Each operation should represent a known business action.

Good:

`enrollInCourse`

Bad:

`updateAnyTable`

This reduces security risk.

---

# 51. Business Logic Ownership

Important business rules must have one authoritative implementation.

Example:

Trainer matching formula should not exist separately in:

* Dashboard component
* API endpoint
* Admin page
* Mobile component

Create shared server-safe logic.

Suggested location:

`lib/competency/trainer-matching.ts`

Similarly:

`lib/competency/skill-gap.ts`

`lib/competency/course-recommendation.ts`

---

# 52. Testing Expectations

Important server operations should eventually be tested.

Highest-priority tests:

* Authorization
* Course enrollment
* Assessment scoring
* Competency updates
* Skill-gap calculation
* Trainer matching
* Certificate eligibility

Avoid relying only on manual browser testing.

---

# 53. Development Rule for Antigravity

Before creating a data-access operation, Antigravity should determine:

1. Who performs the action?
2. Is authentication required?
3. What role is required?
4. What records may the user access?
5. Does RLS protect the operation?
6. Is server-side logic required?
7. What input validation is required?
8. What happens on failure?
9. Does this operation modify multiple tables?
10. Does it require testing?

The agent must not default to client-side database writes simply because they are easier.

---

# 54. Source of Truth

Before implementing server/database interaction, consult:

* `01-requirements.md`
* `02-user-flows.md`
* `03-database-schema.md`
* `04-competency-engine.md`
* `05-ui-design.md`
* `06-api-rules.md`

If implementation requires violating these rules, update the relevant documentation intentionally rather than silently working around it.
