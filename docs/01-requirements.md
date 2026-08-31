# CAPACITY CONNECT — Project Requirements

## 1. Project Identity

Project Name: CAPACITY CONNECT

Problem Statement: SIH26075

Organization: Ministry of Earth Sciences (MoES)

Department: India Meteorological Department (IMD)

Category: Software

Theme: Smart Education

CAPACITY CONNECT is an IMD-focused digital capacity building, competency development, training, and learning management platform.

The system must not behave like a generic LMS only.

Its main value proposition is:

Assessment
→ Competency Mapping
→ Skill Gap Detection
→ Learning Recommendation
→ Trainer Matching
→ Competency Improvement

---

## 2. User Roles

The system has exactly three primary roles:

1. Trainee
2. Trainer
3. Admin

Every protected feature must respect role-based access control.

---

# 3. Trainee Requirements

A trainee must be able to:

* Sign up and log in securely.
* Maintain a professional profile.
* Add educational qualifications.
* Add work experience.
* Add professional interests.
* View and maintain skills.
* View earned certificates.
* Browse available courses.
* Enroll in courses.
* View enrolled courses.
* Access lessons and learning resources.
* Track course completion progress.
* Take subject-wise MCQ assessments.
* View assessment scores.
* Receive competency scores derived from assessments.
* View detected skill gaps.
* Receive recommended courses for relevant skill gaps.
* Receive recommended trainers where applicable.
* Submit feedback on courses and training content.
* View notifications and announcements.
* View earned certificates and badges.

---

# 4. Trainer Requirements

A trainer must be able to:

* Log in securely.
* Maintain a professional trainer profile.
* Add areas of expertise.
* Add experience information.
* Add competencies.
* View courses assigned to them.
* Create and manage learning content.
* Upload recorded lectures.
* Upload presentations.
* Upload study materials.
* Maintain a trainer learning-resource library.
* Create MCQ questionnaires.
* Set assessment deadlines.
* View enrolled trainees.
* Monitor trainee participation.
* Monitor trainee progress.
* View trainee assessment performance.
* View feedback related to their courses.
* View trainer-match information where appropriate.

---

# 5. Admin Requirements

An admin must be able to:

* Log in securely.
* Approve new users where required.
* Manage users.
* Change and manage user roles.
* Manage courses.
* Manage competency categories.
* Manage skills.
* Manage trainer mappings.
* View course enrollment information.
* View assessment statistics.
* View certification statistics.
* View trainee participation.
* View competency information.
* View organizational skill gaps.
* View competency heatmaps.
* Publish notifications.
* Publish announcements.
* Publish achievements.
* Publish new learning content information.
* View administrative analytics.

---

# 6. Authentication and Authorization

The application must use secure authentication.

Authentication platform:

Supabase Auth

The application must support:

* Login
* Logout
* Session handling
* Role-based authorization
* Protected routes
* Server-side authorization checks
* Supabase Row Level Security

The frontend hiding a button must never be treated as sufficient authorization.

Authorization must also be enforced at the database level.

---

# 7. Course Management

A course should contain:

* Title
* Description
* Category
* Trainer
* Difficulty level
* Associated competencies
* Associated skills
* Thumbnail where applicable
* Status
* Creation date

A course may contain multiple modules.

A module may contain multiple lessons.

Lessons may contain:

* Text
* Video
* Presentation
* PDF/document
* External resource link

The system must track trainee lesson completion and overall course progress.

---

# 8. Enrollment

A trainee must be able to enroll in available courses.

The system must store:

* Trainee
* Course
* Enrollment date
* Enrollment status
* Progress percentage
* Completion status
* Completion date where applicable

Duplicate enrollment in the same active course should be prevented.

---

# 9. Assessments

The platform must support MCQ-based assessments.

An assessment should contain:

* Title
* Course
* Associated competency
* Associated skill where applicable
* Deadline
* Passing score
* Questions

Each MCQ should contain:

* Question text
* Possible answers
* Correct answer
* Score value
* Competency association

The system must record:

* Trainee attempt
* Submitted answers
* Score
* Percentage
* Pass/fail status
* Submission date
* Competency contribution

---

# 10. Competency Framework

The platform must contain a configurable competency framework.

The prototype competency framework is demonstrative and must not be presented as the official internal competency framework of IMD.

Possible prototype competency areas include:

* Atmospheric Science
* Meteorology
* Weather Forecasting
* Nowcasting
* Short Range Forecasting
* Medium Range Forecasting
* Observation Systems
* Automatic Weather Stations
* Doppler Weather Radar
* Satellite Meteorology
* Upper Air Observation
* Numerical Weather Prediction
* Model Interpretation
* Forecast Verification
* Climate Services
* Climate Analysis
* Data Analytics
* Python
* Machine Learning
* AI for Weather Applications

Administrators should eventually be able to modify the competency taxonomy without changing application code.

---

# 11. Competency Scoring

Competency scoring must use deterministic and explainable rules.

An LLM must not directly decide a trainee's competency score.

Example:

Assessment performance contributes to competency score.

Scores may be normalized to a 0–100 scale.

Example bands:

0–39: Beginner

40–59: Developing

60–79: Proficient

80–100: Advanced

These ranges are prototype rules and must remain configurable.

---

# 12. Skill Gap Detection

The platform should compare:

Current Competency Level

against

Target Competency Level

to calculate a competency gap.

Example:

Target competency = 80

Current competency = 45

Skill gap = 35

A larger gap indicates a higher training requirement.

The system should identify and rank competency gaps.

---

# 13. Learning Recommendations

Course recommendations should primarily use explainable matching logic.

Possible inputs include:

* Skill gap
* Course competency mapping
* Course difficulty
* Previous course completion
* Assessment performance

Example:

If a trainee has a large gap in Doppler Weather Radar competency, courses mapped to Doppler Weather Radar should receive higher recommendation priority.

AI may later improve recommendation explanations but must not be required for the core recommendation engine.

---

# 14. Trainer Matching

The system should recommend suitable trainers for a competency or subject.

Trainer matching should use deterministic scoring.

Prototype matching formula:

40% Competency Match

20% Relevant Experience

15% Training Performance

10% Course Relevance

10% Availability

5% Learner Feedback

The exact weights must be configurable later.

The system should show why a trainer was recommended.

An LLM must not independently determine the trainer score.

---

# 15. Certificates

Trainees should receive certificates when completion rules are satisfied.

A certificate should include:

* Trainee name
* Course name
* Completion date
* Unique certificate ID
* Verification status

A certificate verification page should allow a certificate ID to be checked.

QR-code verification may be added.

Blockchain is not required.

---

# 16. Notifications and Announcements

Admins should be able to publish:

* General notifications
* Announcements
* Achievements
* Training updates
* New course information

Trainees and trainers should see relevant notifications.

---

# 17. Feedback

Trainees should be able to submit course feedback.

Feedback may include:

* Rating
* Comment
* Submission date
* Course
* Trainer where applicable

Feedback may later contribute to trainer analytics.

---

# 18. Analytics

Admin analytics should eventually include:

* Number of trainees
* Number of trainers
* Number of active courses
* Course enrollments
* Course completion rate
* Assessment performance
* Certificates issued
* Competency distribution
* Major skill gaps
* Competency heatmap
* Participation trends

Charts may use Recharts.

---

# 19. Competency Heatmap

One key differentiating dashboard feature is an organizational competency heatmap.

It should allow administrators to understand:

* Strong competency areas
* Weak competency areas
* Department-level skill gaps where data permits
* Training priorities

The initial prototype may use seeded demonstration data.

---

# 20. AI Features

AI is optional for the core MVP.

AI features must only be implemented after the normal platform works.

Possible later features:

* IMD Knowledge Assistant
* Retrieval-Augmented Generation over approved training resources
* Automatic course tagging
* Suggested MCQ generation
* Skill extraction from trainer profiles
* Personalized development-plan explanation

Gemini API may be used for these features.

AI API keys must never be exposed in browser code.

---

# 21. IMD Knowledge Assistant

A later RAG assistant may answer trainee questions using approved learning material.

Preferred architecture:

Approved documents
→ text extraction
→ chunking
→ embeddings
→ pgvector
→ similarity search
→ Gemini
→ cited answer

The assistant should answer from approved indexed material rather than inventing unsupported information.

This is not part of the first implementation milestone.

---

# 22. Technology Stack

Frontend:

* Next.js
* TypeScript
* React
* Tailwind CSS
* shadcn/ui

Backend platform:

* Supabase

Database:

* PostgreSQL through Supabase

Authentication:

* Supabase Auth

Storage:

* Supabase Storage

Vector search if required:

* pgvector in Supabase

Charts:

* Recharts

Validation:

* Zod

AI:

* Gemini API when AI features are implemented

Version control:

* Git
* GitHub

Deployment:

* Vercel
* Supabase

---

# 23. Technologies NOT Required for Initial MVP

Do not introduce these unless a real technical requirement appears:

* FastAPI
* Redis
* Qdrant
* Keycloak
* Kubernetes
* Microservices
* Blockchain

The hackathon prototype should favor simplicity and reliability.

---

# 24. Security Requirements

The system must:

* Use Supabase Row Level Security.
* Validate user authorization server-side.
* Never expose the Supabase service-role key in client-side code.
* Never expose Gemini API keys in client-side code.
* Validate user input.
* Validate uploaded files.
* Protect admin operations.
* Restrict database records according to user roles.
* Use HTTPS in deployed environments.
* Avoid storing passwords manually.
* Use Supabase Auth for credentials.

---

# 25. Development Principles

Development must happen in small vertical slices.

Do not generate the entire application in one change.

Each feature should follow:

Requirement
→ Database
→ Authorization
→ Backend/server logic
→ UI
→ Validation
→ Testing
→ Git commit

The coding agent must avoid unnecessary architecture.

The coding agent must not rewrite unrelated working code.

The coding agent must inspect existing implementation before modifying files.

The coding agent should favor type-safe, maintainable solutions appropriate for a student hackathon team.

---

# 26. MVP Development Order

Implement features approximately in this order:

1. Project setup
2. Supabase connection
3. Authentication
4. Role-based access
5. User profiles
6. Course catalogue
7. Course enrollment
8. Lessons
9. Learning progress
10. Assessments
11. Trainer functionality
12. Admin functionality
13. Feedback
14. Certificates
15. Competency engine
16. Skill-gap detection
17. Learning recommendations
18. Trainer matching
19. Admin analytics
20. Competency heatmap
21. AI features
22. Testing
23. Deployment

Do not implement AI before the core LMS and competency flow work.

---

# 27. Primary Demo Flow

The primary demonstration should tell one connected story.

Trainee logs in.

↓

Trainee views profile.

↓

Trainee enrolls in an IMD-related course.

↓

Trainee studies learning material.

↓

Trainee completes an assessment.

↓

Assessment updates competency score.

↓

System detects a competency gap.

↓

System recommends relevant learning.

↓

System recommends a suitable trainer.

↓

Trainee completes training.

↓

Certificate is generated.

↓

Admin views competency analytics and heatmap.

This flow should be prioritized over building many disconnected features.

---

# 28. Product Positioning

CAPACITY CONNECT must be positioned as:

“An IMD-specific Competency Intelligence and Capacity Building Platform.”

It should not be described merely as:

“An LMS with AI.”

The differentiator is the closed-loop competency-development system:

Learn
→ Assess
→ Measure competency
→ Detect gap
→ Recommend intervention
→ Match trainer
→ Improve competency
→ Measure again
