# CAPACITY CONNECT — User Flows

## 1. Purpose

This document defines the expected user journeys for CAPACITY CONNECT.

The system has three primary roles:

1. Trainee
2. Trainer
3. Admin

Every user flow should be implemented as a clear sequence of screens, actions, validations, and outcomes.

The application should prioritize simple navigation and minimal confusion.

---

# 2. Global Authentication Flow

## 2.1 Login

User opens CAPACITY CONNECT.

↓

User sees Login page.

↓

User enters:

* Email
* Password

↓

System validates credentials using Supabase Auth.

↓

If credentials are invalid:

* Show clear error message.
* Do not reveal whether the email or password specifically was incorrect.

↓

If credentials are valid:

* Load authenticated user profile.
* Determine user's role.

↓

Redirect based on role:

Trainee → `/trainee/dashboard`

Trainer → `/trainer/dashboard`

Admin → `/admin/dashboard`

---

## 2.2 Logout

Authenticated user clicks Logout.

↓

Supabase session is terminated.

↓

User is redirected to `/login`.

↓

Protected pages must no longer be accessible.

---

## 2.3 Unauthorized Access

Example:

A trainee manually enters:

`/admin/dashboard`

↓

System checks authorization.

↓

Access is denied.

↓

Redirect user to their permitted dashboard or show an Unauthorized page.

Hiding admin buttons in the UI is not sufficient security.

---

# 3. Trainee User Flow

## 3.1 Trainee Dashboard

Trainee logs in.

↓

Redirect to:

`/trainee/dashboard`

Dashboard should display:

* Welcome message
* Profile completion
* Enrolled courses
* Current learning progress
* Upcoming assessments
* Recent scores
* Competency summary
* Major skill gaps
* Recommended courses
* Recommended trainers
* Recent notifications
* Certificates earned

The dashboard should prioritize the trainee's next useful action.

---

# 4. Trainee Profile Flow

Trainee opens:

`/trainee/profile`

↓

System displays existing profile.

Profile may contain:

* Full name
* Employee/member identifier if applicable
* Job title/designation
* Department/unit
* Educational qualifications
* Work experience
* Professional interests
* Skills
* Competencies
* Certificates

↓

Trainee clicks Edit Profile.

↓

Trainee updates permitted fields.

↓

System validates input.

↓

If valid:

* Save profile.
* Show success message.

If invalid:

* Display validation errors.
* Preserve entered values.

---

# 5. Course Discovery Flow

Trainee opens:

`/courses`

↓

System displays published courses.

Trainee can:

* Search courses
* Filter by competency
* Filter by difficulty
* Filter by category
* View trainer
* View course description

↓

Trainee opens a course.

Route example:

`/courses/[courseId]`

↓

Course detail page displays:

* Course title
* Description
* Trainer
* Difficulty
* Competencies covered
* Skills covered
* Modules
* Estimated learning effort
* Enrollment status

---

# 6. Course Enrollment Flow

Trainee opens course detail.

↓

Clicks Enroll.

↓

System checks:

* User is authenticated.
* User has Trainee role.
* Course is active.
* Trainee is not already actively enrolled.

↓

If valid:

Create enrollment.

↓

Show:

"Successfully enrolled."

↓

Course becomes available under:

`/trainee/courses`

If already enrolled:

Do not create duplicate enrollment.

Show appropriate message.

---

# 7. Learning Flow

Trainee opens:

`/trainee/courses`

↓

Selects enrolled course.

↓

Course learning page displays:

* Modules
* Lessons
* Completion status
* Overall progress

↓

Trainee selects lesson.

↓

Lesson may contain:

* Text
* Video
* PDF
* Presentation
* Resource link

↓

Trainee consumes lesson.

↓

Trainee marks lesson complete or system records completion where appropriate.

↓

Progress is updated.

Example:

3 of 5 lessons completed

↓

Progress:

60%

↓

Dashboard reflects updated course progress.

---

# 8. Assessment Flow

Trainee opens assessment associated with a course.

↓

System displays:

* Assessment title
* Number of questions
* Deadline
* Passing score
* Instructions

↓

Trainee starts assessment.

↓

MCQ questions are displayed.

↓

Trainee selects answers.

↓

Trainee submits assessment.

↓

System validates submission.

↓

System calculates score deterministically.

↓

System stores:

* Attempt
* Answers
* Score
* Percentage
* Pass/fail result
* Submission time

↓

System updates relevant competency information.

↓

Results page displays:

* Score
* Percentage
* Pass/fail
* Competencies assessed
* Competency impact
* Areas needing improvement

---

# 9. Competency Update Flow

Assessment result is generated.

↓

System determines which competency each question contributes to.

↓

Assessment performance contributes to competency score.

↓

System calculates updated competency level.

Example:

Before assessment:

Radar Meteorology = 42

After assessment:

Radar Meteorology = 55

↓

Updated competency is stored.

↓

Trainee dashboard displays new competency level.

---

# 10. Skill Gap Detection Flow

System has:

Current competency level

and

Target competency level

↓

System calculates:

Skill Gap = Target Level - Current Level

Example:

Target = 80

Current = 55

Gap = 25

↓

If gap is significant:

Mark as development priority.

↓

Display gap on trainee dashboard.

Example:

Doppler Weather Radar

Current: 55

Target: 80

Gap: 25

Priority: High

---

# 11. Learning Recommendation Flow

Skill gap is detected.

↓

System searches courses mapped to that competency.

↓

Courses are ranked based on factors such as:

* Competency relevance
* Skill-gap severity
* Course difficulty
* Previous course completion
* Trainee competency level

↓

Trainee sees:

Recommended for You

↓

Each recommendation should explain why it appears.

Example:

"Recommended because your Doppler Weather Radar competency is below the target level."

---

# 12. Trainer Recommendation Flow

Trainee has a competency gap.

↓

System searches trainers associated with that competency.

↓

System calculates trainer match score.

Possible factors:

* Competency match
* Experience
* Training performance
* Course relevance
* Availability
* Learner feedback

↓

Top matching trainers are shown.

Example:

Trainer: Dr. Demo Trainer

Match Score: 87%

Reason:

* Strong Radar Meteorology competency
* Relevant forecasting experience
* High learner feedback

The recommendation should be explainable.

---

# 13. Feedback Flow

Trainee completes or participates in a course.

↓

Trainee opens feedback form.

↓

Provides:

* Rating
* Comment

↓

System validates input.

↓

Feedback is stored.

↓

Trainer/Admin may later see aggregated feedback.

---

# 14. Certificate Flow

Trainee satisfies course completion rules.

Example:

* Required lessons completed
* Required assessment passed

↓

System marks course as complete.

↓

Certificate record is generated.

↓

Certificate contains:

* Trainee name
* Course
* Completion date
* Certificate ID

↓

Trainee can view certificate under:

`/trainee/certificates`

↓

Certificate can eventually be verified through:

`/verify/[certificateId]`

---

# 15. Trainer User Flow

## 15.1 Trainer Dashboard

Trainer logs in.

↓

Redirect to:

`/trainer/dashboard`

Dashboard displays:

* Assigned courses
* Active trainees
* Upcoming assessment deadlines
* Recent assessment performance
* Learning content
* Course feedback
* Trainer competency summary
* Notifications

---

# 16. Trainer Profile Flow

Trainer opens:

`/trainer/profile`

↓

Views and edits permitted information.

Possible fields:

* Name
* Designation
* Department
* Experience
* Areas of expertise
* Competencies
* Skills
* Qualifications
* Trainer biography

↓

System validates and saves changes.

---

# 17. Trainer Course Flow

Trainer opens:

`/trainer/courses`

↓

Views assigned courses.

↓

Selects course.

↓

Can inspect:

* Course details
* Enrolled trainees
* Lessons
* Resources
* Assessments
* Progress statistics
* Feedback

Trainer should not automatically gain access to courses not assigned to them.

---

# 18. Learning Resource Upload Flow

Trainer opens course content management.

↓

Clicks Add Resource.

↓

Selects resource type:

* Video
* Presentation
* PDF/document
* External link

↓

Uploads/selects resource.

↓

System validates:

* File type
* File size
* Trainer authorization
* Course assignment

↓

File is uploaded to Supabase Storage.

↓

Metadata is saved in database.

↓

Resource becomes accessible to authorized trainees.

---

# 19. Assessment Creation Flow

Trainer selects course.

↓

Opens Assessments.

↓

Clicks Create Assessment.

↓

Enters:

* Title
* Description/instructions
* Deadline
* Passing score

↓

Adds MCQ questions.

Each question contains:

* Question
* Answer options
* Correct answer
* Competency mapping
* Score value

↓

Trainer saves draft.

↓

Trainer reviews assessment.

↓

Trainer publishes assessment.

↓

Enrolled trainees can access it.

---

# 20. Trainer Monitoring Flow

Trainer selects course.

↓

Opens trainee performance.

↓

Trainer sees:

* Enrolled trainees
* Progress
* Assessment scores
* Completion
* Participation
* Competency changes where permitted

↓

Trainer can identify trainees needing support.

---

# 21. Trainer Feedback View

Trainer opens course analytics.

↓

System displays aggregated feedback.

Possible information:

* Average rating
* Number of responses
* Feedback comments

Trainer should not be able to edit trainee feedback.

---

# 22. Admin User Flow

## 22.1 Admin Dashboard

Admin logs in.

↓

Redirect:

`/admin/dashboard`

Dashboard displays:

* Total users
* Trainees
* Trainers
* Courses
* Active enrollments
* Course completions
* Assessment performance
* Certificates
* Competency distribution
* Major competency gaps
* Participation trends
* Notifications

---

# 23. User Management Flow

Admin opens:

`/admin/users`

↓

System displays users.

Admin can:

* Search users
* Filter by role
* View profile
* Approve user
* Activate/deactivate account where supported
* Assign/change role

↓

Admin selects user.

↓

Makes authorized change.

↓

System validates action.

↓

Change is recorded.

Sensitive admin actions should eventually be audit logged.

---

# 24. Course Administration Flow

Admin opens:

`/admin/courses`

↓

Can:

* View courses
* Create course
* Edit course
* Assign trainer
* Publish/unpublish course
* Archive course

Admin should avoid permanently deleting records that are linked to historical training records.

Prefer status-based archival.

---

# 25. Competency Administration Flow

Admin opens:

`/admin/competencies`

↓

Views competency taxonomy.

↓

Admin can eventually:

* Add competency
* Edit competency
* Create competency category
* Set target levels
* Associate competencies with courses
* Associate competencies with trainers

The taxonomy must remain configurable.

---

# 26. Admin Analytics Flow

Admin opens:

`/admin/analytics`

↓

System displays charts and metrics.

Possible sections:

## Training

* Enrollment count
* Completion rate
* Active courses

## Assessment

* Average scores
* Pass rate
* Assessment participation

## Competency

* Competency distribution
* Major skill gaps
* Improvement trends

## Certification

* Certificates issued

## Participation

* Active learners
* Course engagement

---

# 27. Competency Heatmap Flow

Admin opens competency analytics.

↓

System displays competency heatmap.

Possible dimensions:

Rows:

* Competencies

Columns:

* Departments
* Teams
* Groups
* Overall organization

↓

Heatmap displays relative competency strength.

Admin can identify:

* Strong areas
* Weak areas
* High-priority development areas

Prototype data may be seeded for demonstration.

---

# 28. Notification Publishing Flow

Admin opens:

`/admin/notifications`

↓

Clicks Create Notification.

↓

Chooses type:

* Announcement
* Training update
* Achievement
* New learning content
* General information

↓

Adds:

* Title
* Message
* Target audience
* Publish date

↓

Publishes notification.

↓

Relevant users see it on dashboards/homepage.

---

# 29. Homepage Flow

Unauthenticated visitor opens application.

↓

Homepage should communicate:

* CAPACITY CONNECT purpose
* MoES/IMD capacity-building context
* Key platform capabilities
* Login action

It should not expose private training or user information.

Authenticated users may see relevant announcements.

---

# 30. Error and Empty States

Every major screen must support empty states.

Examples:

No courses:

"No courses are currently available."

No enrollments:

"You haven't enrolled in any courses yet."

No skill gaps:

"No significant competency gaps have been identified."

No assessment attempts:

"No assessment results yet."

No certificates:

"No certificates earned yet."

Errors should be understandable and should not expose technical details.

Avoid showing raw database errors to users.

---

# 31. Loading States

Database-backed pages should provide loading feedback.

Examples:

* Skeleton loaders
* Loading indicator
* Disabled submit buttons during submission

Users should not accidentally submit forms multiple times.

---

# 32. Form Validation Flow

User enters invalid information.

↓

System prevents invalid submission.

↓

Show field-specific error.

Example:

Email:

"Enter a valid email address."

Required field:

"This field is required."

↓

User corrects value.

↓

Submission succeeds.

Validation should exist both at UI level and server/database level where appropriate.

---

# 33. Mobile Flow

The core application must remain usable on:

* Desktop
* Tablet
* Mobile

Navigation may collapse into a mobile menu.

Important actions must remain accessible.

Tables should adapt appropriately rather than forcing unusable layouts.

---

# 34. Primary Hackathon Demo Flow

This is the highest-priority end-to-end flow.

## Trainee

Login as Trainee.

↓

Open dashboard.

↓

View existing competency status.

↓

Open course catalogue.

↓

Enroll in a weather-related training course.

↓

Complete lesson.

↓

Take MCQ assessment.

↓

Receive score.

↓

Competency score updates.

↓

System identifies competency gap.

↓

System recommends relevant course/intervention.

↓

System recommends suitable trainer.

↓

View development path.

↓

Complete training requirements.

↓

View certificate.

---

## Trainer

Switch to Trainer account.

↓

Open trainer dashboard.

↓

View assigned course.

↓

View trainees.

↓

Open trainee assessment performance.

↓

Show trainer learning-resource library.

↓

Show trainer competency/expertise association.

---

## Admin

Switch to Admin account.

↓

Open admin dashboard.

↓

View organization statistics.

↓

Open competency analytics.

↓

Show competency heatmap.

↓

Show major organizational skill gaps.

↓

Show training participation and progress.

This three-role story should be prioritized above disconnected feature quantity.

---

# 35. Development Rule

Every implementation task should reference one or more user flows in this document.

Before implementing a screen, determine:

* Who can access it?
* What data is shown?
* What actions are allowed?
* What happens on success?
* What happens on failure?
* What happens if there is no data?
* What happens while loading?

Antigravity should not invent new major user flows without updating this document first.
