# CAPACITY CONNECT — Competency Engine

## 1. Purpose

The Competency Engine is the main differentiating layer of CAPACITY CONNECT.

Its purpose is to convert trainee learning and assessment activity into measurable competency information.

The core flow is:

Assessment

→ Competency Score

→ Skill Gap

→ Learning Recommendation

→ Trainer Recommendation

→ Competency Improvement

The engine must be deterministic, explainable, configurable, and suitable for a hackathon prototype.

It must not depend on an LLM for scoring decisions.

---

# 2. Core Principles

The competency engine must follow these rules:

1. Scores must be explainable.
2. The same inputs should produce the same output.
3. Score calculations should not depend on Gemini or another LLM.
4. Competency ranges and thresholds should be configurable.
5. Prototype competency data must not be described as the official internal IMD competency framework.
6. The system should preserve score history.
7. The system should show trainees why a gap or recommendation exists.

---

# 3. Competency Score Scale

All competency scores use a normalized range:

0 to 100

Prototype competency bands:

* 0–39: Beginner
* 40–59: Developing
* 60–79: Proficient
* 80–100: Advanced

These labels and thresholds are prototype values.

They should remain configurable later.

---

# 4. Initial Competency Score

When a trainee has no existing competency score, the system may initialize the score using one of these methods:

Preferred MVP method:

Start at:

0

Alternative future methods may include:

* Baseline assessment
* Verified prior qualification
* Verified experience
* Admin-assigned baseline

For the hackathon MVP, assessment-driven scoring is sufficient.

---

# 5. Question-to-Competency Mapping

Every assessment question should map to one competency wherever possible.

Example:

Question:

"What does Doppler velocity primarily measure?"

Mapped competency:

Doppler Weather Radar

Points:

1

This allows assessment performance to update competency scores.

---

# 6. Per-Competency Assessment Score

For each competency represented in an assessment:

Competency Assessment Score =

Points earned for that competency

divided by

Total possible points for that competency

multiplied by 100

Example:

Radar questions:

5 total questions

Each question = 1 point

Trainee gets 4 correct

Competency Assessment Score:

4 / 5 × 100 = 80

---

# 7. Updating Current Competency Score

The system should not completely replace a trainee's existing competency score after every assessment.

Use a weighted update.

Prototype formula:

New Competency Score =

70% Existing Competency Score

*

30% Latest Competency Assessment Score

Formula:

New Score =

(Existing Score × 0.70)

*

(Assessment Score × 0.30)

Example:

Existing competency:

50

Latest assessment competency score:

80

New score:

(50 × 0.70) + (80 × 0.30)

= 35 + 24

= 59

New competency score:

59

---

# 8. First Assessment Rule

If the trainee does not yet have a meaningful competency score:

Use the first assessment result as the initial score.

Example:

No existing score.

Assessment result:

65

Initial competency score:

65

This avoids unfairly combining the first assessment with a zero score.

---

# 9. Multiple Assessments

Each new assessment updates the current score.

Example:

Initial:

65

Second assessment:

80

Updated:

65 × 0.70 + 80 × 0.30

= 69.5

Third assessment:

90

Updated:

69.5 × 0.70 + 90 × 0.30

= 75.65

This causes recent evidence to improve the score gradually.

---

# 10. Score Boundaries

All competency scores must remain between:

0 and 100

Use:

Minimum:

0

Maximum:

100

If calculations create decimals, the UI may display:

* Rounded whole number

or

* One decimal place

The database may keep greater precision.

---

# 11. Competency History

Every score update should create a history record.

Store:

* User
* Competency
* Previous score
* New score
* Source
* Date

Example:

Previous:

59

New:

68

Source:

Assessment XYZ

This enables:

* Progress charts
* Improvement analysis
* Admin analytics
* Before/after demo storytelling

---

# 12. Target Competency Score

Every trainee competency should have a target level.

Target score may come from:

1. Individual competency target
2. Role-based target
3. Department-based target
4. Competency default

For MVP, use:

User-specific target if available.

Otherwise:

Competency default target.

Example:

Doppler Weather Radar:

Current = 55

Target = 80

---

# 13. Skill Gap Calculation

Skill Gap = Target Score - Current Score

Example:

Target:

80

Current:

55

Gap:

25

If current score exceeds target:

Gap = 0

Use:

Gap = max(Target - Current, 0)

---

# 14. Skill Gap Priority

Prototype priority bands:

Gap 0–9:

Low

Gap 10–19:

Medium

Gap 20–34:

High

Gap 35+:

Critical

Example:

Current:

45

Target:

80

Gap:

35

Priority:

Critical

These thresholds must remain configurable.

---

# 15. Skill Gap Status

Possible statuses:

* open
* improving
* resolved

Rules:

If gap > 0:

open

If score has improved but target is not reached:

improving

If current score >= target:

resolved

---

# 16. Course Recommendation Goal

The course recommendation engine should identify courses most relevant to a trainee's competency gaps.

It should not use an LLM for the ranking score.

Recommendations must be explainable.

---

# 17. Course Recommendation Inputs

Possible inputs:

* Competency gap severity
* Course competency relevance
* Course difficulty suitability
* Whether trainee already completed course
* Whether trainee is currently enrolled
* Current competency level

---

# 18. Course Recommendation Score

Prototype scoring formula:

Recommendation Score =

50% Competency Gap Match

*

30% Course Relevance

*

20% Difficulty Suitability

Each component should be normalized to:

0–100

---

# 19. Competency Gap Match Component

Larger gaps should increase recommendation priority.

Example normalization:

Gap 0:

0

Gap 10:

25

Gap 20:

50

Gap 30:

75

Gap 40 or more:

100

Implementation may use:

Gap Match Score = min((Gap / 40) × 100, 100)

---

# 20. Course Relevance Component

Use `course_competencies.relevance_weight`.

Range:

0–100

Example:

Course:

Doppler Weather Radar Fundamentals

Competency relevance:

95

Course Relevance Score:

95

---

# 21. Difficulty Suitability

Prototype logic:

If trainee competency score is:

0–39:

Beginner course = 100

Intermediate = 60

Advanced = 20

If trainee competency score is:

40–59:

Beginner = 70

Intermediate = 100

Advanced = 50

If trainee competency score is:

60–79:

Beginner = 40

Intermediate = 100

Advanced = 80

If trainee competency score is:

80–100:

Beginner = 20

Intermediate = 60

Advanced = 100

This avoids recommending obviously unsuitable content.

---

# 22. Final Course Recommendation Example

Trainee:

Radar score = 50

Target = 80

Gap = 30

Gap Match Score:

75

Course relevance:

90

Difficulty suitability:

100

Formula:

Recommendation Score =

(75 × 0.50)

*

(90 × 0.30)

*

(100 × 0.20)

=

37.5 + 27 + 20

=

84.5

Recommendation score:

84.5

---

# 23. Recommendation Filtering

Do not recommend a course when:

* Course is archived
* Course is draft
* Trainee already completed it
* Course does not map to relevant competency
* User lacks access

Currently enrolled courses may either be excluded or shown separately.

---

# 24. Recommendation Explanation

Every recommendation should include an explanation.

Example:

"Recommended because your Doppler Weather Radar competency is 30 points below the target level and this course has a 90% relevance mapping to that competency."

The explanation should be generated from deterministic data.

AI may later rewrite the explanation in more natural language, but the actual reason must come from the scoring engine.

---

# 25. Trainer Matching Goal

Trainer matching identifies the most suitable trainer for a competency gap.

The scoring must remain deterministic and explainable.

Prototype formula:

Trainer Match Score =

40% Competency Match

*

20% Experience

*

15% Training Performance

*

10% Course Relevance

*

10% Availability

*

5% Learner Feedback

Total:

100%

---

# 26. Competency Match

Trainer competency expertise score:

0–100

Example:

Trainer Radar Expertise:

92

Competency component:

92

Weighted contribution:

92 × 0.40

=

36.8

---

# 27. Experience Component

Normalize trainer experience to 0–100.

Prototype rule:

0 years:

0

1 year:

20

2 years:

40

3 years:

60

4 years:

80

5 or more years:

100

Possible formula:

min((years_experience / 5) × 100, 100)

---

# 28. Training Performance Component

Possible inputs:

* Trainee completion rate
* Assessment improvement
* Training outcomes

For MVP, if meaningful performance data is unavailable:

Use a seeded prototype value.

Or:

Use neutral score:

50

Do not invent highly precise performance metrics from nonexistent data.

---

# 29. Course Relevance Component

If trainer is assigned to or experienced in a course mapped to the relevant competency:

Score should increase.

Prototype values:

Strong direct relevance:

100

Related:

70

Weak relevance:

30

No relevance:

0

---

# 30. Availability Component

Prototype values:

available:

100

limited:

50

unavailable:

0

---

# 31. Learner Feedback Component

Convert rating from 1–5 into 0–100.

Formula:

Feedback Score =

Average Rating / 5 × 100

Example:

4.5 rating

4.5 / 5 × 100

=

90

---

# 32. Trainer Match Example

Trainer:

Competency Match:

90

Experience:

100

Training Performance:

80

Course Relevance:

90

Availability:

100

Feedback:

90

Calculation:

90 × 0.40 = 36

100 × 0.20 = 20

80 × 0.15 = 12

90 × 0.10 = 9

100 × 0.10 = 10

90 × 0.05 = 4.5

Total:

91.5

Trainer Match Score:

91.5%

---

# 33. Trainer Recommendation Explanation

Example:

"Recommended because this trainer has strong Doppler Weather Radar expertise, more than five years of relevant experience, high learner feedback, and is currently available."

Explanation should be based on actual calculated components.

---

# 34. Trainer Filtering

Do not recommend trainer if:

* Account inactive
* Trainer unavailable
* Trainer has no competency association
* User is not trainer role
* Trainer does not meet access rules

For the MVP, completely unavailable trainers should normally be excluded.

---

# 35. Competency Improvement Flow

The complete loop should work as follows:

Trainee completes assessment.

↓

Assessment score calculated.

↓

Relevant competency score updated.

↓

Competency history created.

↓

Skill gap recalculated.

↓

Course recommendations recalculated.

↓

Trainer recommendations recalculated.

↓

Dashboard updated.

This is the main intelligence loop of CAPACITY CONNECT.

---

# 36. Example End-to-End Scenario

Competency:

Doppler Weather Radar

Target:

80

Initial score:

45

Gap:

35

Priority:

Critical

↓

System recommends:

Radar Fundamentals

Score:

88

↓

System recommends:

Trainer A

Match:

91%

↓

Trainee studies course.

↓

Trainee completes assessment.

Assessment competency score:

75

↓

Updated competency:

45 × 0.70 + 75 × 0.30

=

31.5 + 22.5

=

54

↓

New gap:

80 - 54

=

26

↓

Priority:

High

↓

Further learning takes place.

↓

Next assessment:

90

↓

Updated competency:

54 × 0.70 + 90 × 0.30

=

37.8 + 27

=

64.8

↓

Gap:

15.2

↓

Priority:

Medium

This demonstrates measurable improvement.

---

# 37. Organizational Competency Heatmap

Admin analytics should aggregate trainee competency scores.

Possible dimensions:

Rows:

Competencies

Columns:

Departments or organizational groups

Values:

Average competency score

Example:

| Competency | Forecasting | Observation | Research |
| ---------- | ----------: | ----------: | -------: |
| Radar      |          74 |          88 |       62 |
| NWP        |          69 |          55 |       85 |
| Python     |          61 |          53 |       91 |

The UI may convert values into a heatmap visualization.

---

# 38. Organizational Gap Score

Possible metric:

Average Gap =

Sum of trainee gaps for competency

divided by

Number of relevant trainees

This may help identify organization-level training priorities.

---

# 39. Competency Improvement Metric

Possible metric:

Improvement =

Current Score - Previous Baseline Score

Example:

Baseline:

45

Current:

65

Improvement:

20

Admin dashboards may show average improvement over time.

---

# 40. AI Boundary

AI must not calculate:

* Assessment correctness
* Assessment score
* Competency score
* Skill gap
* Recommendation rank
* Trainer match score
* Pass/fail result

These must remain deterministic.

AI may later help with:

* Explaining recommendations
* Generating draft questions
* Tagging course material
* Searching approved documents
* Creating personalized development-plan text

AI must not override deterministic calculations.

---

# 41. MVP Scope

For the internal/hackathon prototype, implement:

1. Assessment scoring
2. Competency update
3. Skill-gap calculation
4. Priority classification
5. Course recommendation scoring
6. Trainer matching scoring
7. Competency history
8. Basic admin competency aggregation

Do not over-engineer advanced machine learning.

The strength of the system should come from:

* Clear logic
* Explainability
* End-to-end integration
* Strong demo storytelling

---

# 42. Testing Requirements

The engine should be tested using known numerical inputs.

Example test:

Existing competency:

50

Assessment score:

80

Expected updated score:

59

---

Example test:

Current:

55

Target:

80

Expected gap:

25

Expected priority:

High

---

Example recommendation test:

Gap match:

75

Course relevance:

90

Difficulty suitability:

100

Expected:

84.5

---

Example trainer match test:

Competency:

90

Experience:

100

Performance:

80

Course relevance:

90

Availability:

100

Feedback:

90

Expected:

91.5

These calculations should be unit-tested later.

---

# 43. Configuration Principle

Hard-coded prototype values may initially be stored in application constants.

Later, important values may move into configuration/database tables.

Potential configurable values:

* Competency bands
* Skill-gap priority thresholds
* Assessment weighting
* Recommendation weights
* Trainer-match weights
* Experience normalization
* Difficulty mappings

The architecture should not make these impossible to modify.

---

# 44. Source of Truth

This document defines the intended competency logic.

Before changing competency calculations:

1. Update this document.
2. Ensure database schema supports the change.
3. Add or update tests.
4. Preserve explainability.

The coding agent must not invent new formulas without explicitly updating this specification.
