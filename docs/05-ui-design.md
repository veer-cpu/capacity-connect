# CAPACITY CONNECT — UI Design Specification

## 1. Purpose

This document defines the page structure, navigation, dashboard layout, and visual design rules for CAPACITY CONNECT.

The product should look like a professional government/enterprise training platform, not a flashy consumer app.

Primary goals:

* Clear
* Professional
* Easy to navigate
* Responsive
* Role-specific
* Demo-friendly
* Consistent across pages

---

# 2. Design Direction

CAPACITY CONNECT should visually communicate:

* Trust
* Competence
* Learning
* Institutional professionalism
* Data-driven capacity building

Avoid:

* Excessive gradients
* Neon effects
* Overly playful design
* Unnecessary animation
* Crowded dashboards
* Too many decorative cards

Prefer:

* Clean whitespace
* Strong hierarchy
* Accessible typography
* Simple cards
* Clear data visualizations
* Consistent spacing
* Responsive layouts

---

# 3. UI Technology

Use:

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide icons
* Recharts for analytics

Avoid adding additional UI frameworks unless required.

---

# 4. Global Layout

Authenticated application layout:

Top bar

*

Left sidebar on desktop

*

Main content area

On mobile:

Sidebar becomes a drawer/mobile menu.

Example:

## CAPACITY CONNECT

Sidebar | Main Content
|
|
|

---

# 5. Global Top Bar

Top bar should contain:

* CAPACITY CONNECT branding
* Page title or breadcrumb
* Notification icon
* User avatar
* User name
* Role indicator
* Logout/account menu

Do not overcrowd the top bar.

---

# 6. Sidebar Design

Sidebar should contain only role-relevant navigation.

Do not show inaccessible role pages.

This is for usability only.

Actual security must still be enforced through authorization and database policies.

---

# 7. Trainee Sidebar

Recommended navigation:

* Dashboard
* My Learning
* Course Catalogue
* Assessments
* Competencies
* Development Plan
* Trainers
* Certificates
* Notifications
* Profile

Possible routes:

`/trainee/dashboard`

`/trainee/courses`

`/courses`

`/trainee/assessments`

`/trainee/competencies`

`/trainee/development`

`/trainee/trainers`

`/trainee/certificates`

`/trainee/notifications`

`/trainee/profile`

---

# 8. Trainer Sidebar

Recommended navigation:

* Dashboard
* My Courses
* Trainees
* Assessments
* Resource Library
* Performance
* Feedback
* Notifications
* Profile

Possible routes:

`/trainer/dashboard`

`/trainer/courses`

`/trainer/trainees`

`/trainer/assessments`

`/trainer/resources`

`/trainer/performance`

`/trainer/feedback`

`/trainer/notifications`

`/trainer/profile`

---

# 9. Admin Sidebar

Recommended navigation:

* Dashboard
* Users
* Courses
* Competencies
* Analytics
* Competency Heatmap
* Certificates
* Notifications
* Audit Logs
* Settings

Possible routes:

`/admin/dashboard`

`/admin/users`

`/admin/courses`

`/admin/competencies`

`/admin/analytics`

`/admin/competency-heatmap`

`/admin/certificates`

`/admin/notifications`

`/admin/audit-logs`

`/admin/settings`

Audit logs and settings may be delayed in MVP.

---

# 10. Public Pages

Public routes should include:

`/`

Homepage

`/login`

Login

`/signup`

Signup if enabled

`/verify/[certificateId]`

Certificate verification

Protected application information must never be exposed on public pages.

---

# 11. Homepage

The homepage should explain the product quickly.

Recommended structure:

Hero section

↓

Platform purpose

↓

Core capabilities

↓

Competency-development workflow

↓

Role overview

↓

Login CTA

Suggested hero message:

"Building Competency. Strengthening Capacity."

Supporting message:

"A centralized learning and competency intelligence platform designed for structured training, skill-gap identification, and workforce development."

Avoid making unverified claims about official production deployment.

This is a prototype.

---

# 12. Login Page

Login page should contain:

* Logo/platform title
* Email field
* Password field
* Login button
* Useful validation errors

Optional:

* Forgot password
* Signup link

Do not provide separate login pages for trainee, trainer, and admin.

One login page should determine role after authentication.

---

# 13. Trainee Dashboard

This is one of the most important demo screens.

Top section:

Welcome message

Example:

"Good morning, Ananya"

Supporting line:

"Continue your learning and strengthen your professional competencies."

---

## 13.1 Trainee Summary Cards

Display approximately four main metrics:

* Courses in Progress
* Assessments Completed
* Average Competency
* Certificates Earned

Avoid displaying ten or more metrics at once.

---

## 13.2 Continue Learning

Show currently enrolled courses.

Each course card may display:

* Course title
* Trainer
* Progress bar
* Percentage complete
* Continue button

---

## 13.3 Competency Snapshot

Show strongest and weakest relevant competencies.

Example:

Doppler Weather Radar — 55 / 80

Numerical Weather Prediction — 72 / 80

Forecast Verification — 68 / 75

Use progress bars or simple visual indicators.

---

## 13.4 Priority Skill Gap

Highlight one or more important competency gaps.

Example:

Priority Development Area

Doppler Weather Radar

Current: 55

Target: 80

Gap: 25

Priority: High

CTA:

View Development Plan

This is a major demo element.

---

## 13.5 Recommended Learning

Show approximately three recommended courses.

Each card:

* Course title
* Competency
* Difficulty
* Recommendation score
* Short explanation
* View Course button

Example reason:

"Recommended because your Radar competency is below the target level."

---

## 13.6 Recommended Trainer

Show best matching trainer.

Information:

* Trainer name
* Expertise
* Match score
* Availability
* Explanation

CTA:

View Profile

---

# 14. Course Catalogue

Route:

`/courses`

Layout:

Heading

Search

Filters

Course grid

Possible filters:

* Competency
* Difficulty
* Category

Course cards should contain:

* Title
* Short description
* Difficulty
* Trainer
* Competency tags
* View Course

Avoid overly large cards.

---

# 15. Course Detail Page

Route:

`/courses/[courseId]`

Recommended layout:

Course header

↓

Description

↓

Competencies covered

↓

Course modules

↓

Trainer information

↓

Enrollment action

Display:

* Course title
* Category
* Difficulty
* Duration
* Trainer
* Description
* Competencies
* Skills
* Modules
* Enrollment status

Primary CTA:

Enroll

or

Continue Learning

depending on state.

---

# 16. Learning Page

Show:

Left:

Module/lesson navigation

Right:

Lesson content

Desktop example:

Modules         Lesson

---

Module 1       Video/Text/PDF
Lesson 1
Lesson 2

Module 2
Lesson 3

Include:

* Lesson title
* Learning resource
* Previous
* Next
* Mark Complete
* Course progress

On mobile, lesson navigation may become a dropdown/drawer.

---

# 17. Assessment Page

Before start:

Show:

* Assessment title
* Instructions
* Number of questions
* Passing score
* Deadline
* Start Assessment

During assessment:

* Question number
* Question
* Options
* Previous
* Next
* Submit

Avoid showing whether answers are correct before final submission unless requirements later specify otherwise.

---

# 18. Assessment Result Page

After submission, show:

* Score
* Percentage
* Pass/fail
* Competencies assessed
* Improvement areas
* Competency update

Example:

Assessment Score

75%

Passed

Competency Impact

Doppler Weather Radar

Before: 50

After: 57.5

Target: 80

CTA:

View Development Plan

This creates a strong transition from LMS functionality to competency intelligence.

---

# 19. Competency Page

Route:

`/trainee/competencies`

Display trainee competency profile.

Possible table/cards:

Competency

Current score

Target score

Gap

Level

Priority

Example:

| Competency | Current | Target | Gap | Level      |
| ---------- | ------: | -----: | --: | ---------- |
| Radar      |      55 |     80 |  25 | Developing |
| NWP        |      72 |     80 |   8 | Proficient |

Provide simple visual indicators.

---

# 20. Development Plan Page

Route:

`/trainee/development`

This should connect the full intelligence loop.

For each major gap display:

Competency

↓

Current vs Target

↓

Recommended Course

↓

Recommended Trainer

↓

Suggested next action

Example:

Doppler Weather Radar

Current: 55

Target: 80

Gap: 25

Recommended Course:

Doppler Weather Radar Fundamentals

Recommendation Score:

86%

Recommended Trainer:

Trainer Demo

Match:

91%

CTA:

Start Recommended Course

This can become one of the strongest hackathon demonstration screens.

---

# 21. Certificates Page

Display certificate cards/list.

Each record:

* Course
* Issue date
* Certificate ID
* View
* Verify

Certificate display screen should look professional and printable.

---

# 22. Trainer Dashboard

Top summary metrics:

* Active Courses
* Total Trainees
* Assessments
* Average Course Rating

Main sections:

* Assigned Courses
* Upcoming Deadlines
* Recent Assessment Activity
* Trainees Needing Support
* Course Feedback

---

# 23. Trainer Course Management

Trainer course page should contain tabs:

Overview

Content

Assessments

Trainees

Performance

Feedback

This avoids creating too many disconnected screens.

---

# 24. Trainer Resource Library

Route:

`/trainer/resources`

Display uploaded resources.

Filters:

* Course
* Type

Actions:

* Upload Resource
* View
* Edit metadata
* Archive where allowed

Upload modal/form:

* Title
* Resource type
* Course
* File/link
* Description

---

# 25. Trainer Trainee View

Trainer sees only permitted trainees.

Table may display:

* Name
* Course
* Progress
* Latest score
* Status

Clicking trainee may show authorized course-level performance.

Avoid exposing unrelated personal information.

---

# 26. Admin Dashboard

The Admin Dashboard is another major demo screen.

Top metric cards:

* Total Trainees
* Trainers
* Active Courses
* Completion Rate

Additional metrics:

* Assessments Completed
* Certificates Issued

Main sections:

* Training participation trend
* Assessment performance
* Competency distribution
* Major organizational skill gaps
* Recent activity

---

# 27. Admin User Management

Route:

`/admin/users`

Table:

* Name
* Email
* Role
* Department
* Approval status
* Account status
* Actions

Filters:

* Role
* Status
* Department

Actions:

* View
* Approve
* Change role
* Activate/deactivate

Destructive actions should require confirmation.

---

# 28. Admin Competency Management

Route:

`/admin/competencies`

Display:

* Competency name
* Category
* Default target
* Active status
* Number of mapped courses
* Number of mapped trainers

Actions:

* Add
* Edit
* Deactivate

Avoid permanent deletion when historical data exists.

---

# 29. Competency Heatmap

Route:

`/admin/competency-heatmap`

This is one of the main "wow" screens.

Rows:

Competencies

Columns:

Departments/groups

Cells:

Average competency score

Example:

| Competency | Forecasting | Observation | Research |
| ---------- | ----------: | ----------: | -------: |
| Radar      |          74 |          88 |       62 |
| NWP        |          69 |          55 |       85 |
| Python     |          61 |          53 |       91 |

The visualization should make weak and strong areas immediately understandable.

Include:

* Department filter
* Competency category filter
* Summary insight

Example:

"Observation has the largest NWP training gap."

For MVP, this insight can be deterministic.

---

# 30. Admin Analytics

Route:

`/admin/analytics`

Use Recharts.

Recommended charts:

1. Enrollment trend

2. Course completion rate

3. Assessment performance

4. Competency distribution

5. Skill-gap priorities

Do not create unnecessary charts merely to fill space.

Every chart should answer a useful question.

---

# 31. Notifications Page

Notifications should appear as a chronological list.

Each notification:

* Type
* Title
* Message preview
* Date
* Read/unread status

Admin creation UI should support:

* Title
* Message
* Type
* Target role
* Publish date

---

# 32. Empty States

Every data-driven screen must have a useful empty state.

Examples:

No enrolled courses:

"You haven't enrolled in any courses yet."

CTA:

Browse Courses

No competency data:

"Complete an assessment to begin building your competency profile."

No recommendations:

"No priority learning recommendations right now."

No certificates:

"Complete eligible training to earn certificates."

Do not show blank cards or broken tables.

---

# 33. Loading States

Use loading skeletons for:

* Dashboard
* Course cards
* Tables
* Analytics
* Profile loading

Buttons should display loading state when actions are processing.

Example:

Enroll

becomes

Enrolling...

Prevent accidental duplicate submissions.

---

# 34. Error States

Use user-friendly messages.

Good:

"We couldn't load your courses. Please try again."

Bad:

"PostgREST PGRST116 error"

Never expose raw database/API errors to normal users.

---

# 35. Forms

Forms should use:

* Clear labels
* Required markers
* Inline validation
* Consistent button placement
* Zod validation where appropriate

Do not rely only on placeholders as labels.

Primary action should be obvious.

---

# 36. Tables

Tables should support:

* Clear headings
* Pagination if needed
* Search/filter where useful
* Empty state
* Loading state

On mobile:

Use horizontal scroll or responsive card representation.

Do not compress large tables until unreadable.

---

# 37. Status Indicators

Use consistent status components.

Examples:

Course:

Draft

Published

Archived

Enrollment:

Active

Completed

Withdrawn

Skill Gap:

Low

Medium

High

Critical

Assessment:

Draft

Published

Closed

Use badges consistently.

---

# 38. Responsive Design

Required breakpoints should accommodate:

* Mobile
* Tablet
* Desktop

Desktop:

Sidebar visible.

Tablet:

Sidebar may collapse.

Mobile:

Navigation drawer.

Important cards should stack vertically.

Avoid horizontal overflow.

---

# 39. Accessibility

Basic accessibility should include:

* Proper labels
* Keyboard-accessible buttons
* Sufficient contrast
* Semantic HTML
* Alt text for meaningful images
* Visible focus indicators
* Accessible form errors

Icons should not be the only way important information is communicated.

---

# 40. Demo Data

The prototype should contain seeded demo data.

Suggested accounts:

Trainee demo

Trainer demo

Admin demo

Demo content should include at minimum:

* Several competencies
* Several courses
* Trainer profiles
* Trainee competency scores
* Course enrollment
* Assessment
* Skill gaps
* Recommendations
* Certificate
* Notifications

Do not present seeded data as real IMD employee data.

---

# 41. Primary Demo UI Sequence

The visual demo should flow like this:

Homepage

↓

Login

↓

Trainee Dashboard

↓

Course Catalogue

↓

Course Detail

↓

Learning Screen

↓

Assessment

↓

Assessment Result

↓

Competency Page

↓

Development Plan

↓

Trainer Recommendation

↓

Certificate

↓

Trainer Dashboard

↓

Admin Dashboard

↓

Competency Heatmap

↓

Analytics

The UI should make this story easy to demonstrate without excessive navigation.

---

# 42. MVP UI Priority

Build screens in this approximate order:

1. Login
2. Shared authenticated layout
3. Trainee dashboard
4. Course catalogue
5. Course details
6. Learning screen
7. Assessment
8. Assessment results
9. Competency profile
10. Development plan
11. Trainer dashboard
12. Trainer course management
13. Admin dashboard
14. User management
15. Competency heatmap
16. Certificates
17. Notifications
18. Analytics polish

Avoid spending early development time on:

* Settings
* Advanced admin pages
* Complex animations
* Theme customization
* AI chat interface

---

# 43. Component Reuse

Create reusable components where clearly useful.

Examples:

* DashboardMetricCard
* PageHeader
* EmptyState
* StatusBadge
* CourseCard
* CompetencyProgress
* SkillGapCard
* RecommendationCard
* TrainerCard
* DataTable
* LoadingSkeleton

Do not create abstractions purely for abstraction's sake.

---

# 44. Visual Consistency

Maintain consistent:

* Border radius
* Spacing
* Typography hierarchy
* Button variants
* Card structure
* Icon sizing
* Form layouts

Do not let different Antigravity tasks generate completely different styles.

---

# 45. Branding

Use:

CAPACITY CONNECT

Primary descriptor:

Competency Intelligence & Capacity Building Platform

Prototype context:

MoES / IMD

Do not claim:

"Official IMD production system"

unless explicitly authorized.

The project is a prototype designed for the problem statement.

---

# 46. AI UI

AI features should not dominate the initial interface.

Future AI assistant may appear as:

"Knowledge Assistant"

It should be clearly separated from deterministic functions such as:

* Competency scoring
* Skill-gap detection
* Course ranking
* Trainer matching

AI UI belongs to the later implementation stage.

---

# 47. Source of Truth

Before creating a page or major UI component:

Check:

* `01-requirements.md`
* `02-user-flows.md`
* `03-database-schema.md`
* `04-competency-engine.md`
* `05-ui-design.md`

The coding agent should not invent major pages or navigation structures without updating this document.

Changes to the UI architecture should be reflected here.
