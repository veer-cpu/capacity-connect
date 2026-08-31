# CAPACITY CONNECT — AI Features Specification

## 1. Purpose

This document defines the optional AI capabilities for CAPACITY CONNECT.

AI is not part of the core scoring or authorization logic.

The platform must remain fully usable without AI.

AI should improve:

* Learning support
* Content discovery
* Explanation quality
* Trainer productivity

AI must not control:

* Authentication
* Authorization
* Assessment correctness
* Assessment score
* Competency score
* Skill-gap calculation
* Trainer match score
* Certificate eligibility

---

# 2. AI Technology

Preferred AI provider:

Gemini API

AI calls must run server-side.

The Gemini API key must never be exposed to browser code.

---

# 3. AI Implementation Order

AI should be implemented only after:

1. Authentication works
2. Roles work
3. Courses work
4. Assessments work
5. Competency scoring works
6. Skill gaps work
7. Trainer matching works
8. Core dashboards work

AI is an enhancement, not a dependency.

---

# 4. Primary AI Feature

The main AI feature should be:

IMD Knowledge Assistant

Purpose:

Help trainees ask questions using approved training material.

The assistant should answer using trusted indexed learning documents rather than relying only on model memory.

---

# 5. RAG Architecture

Preferred future architecture:

Approved document

↓

Supabase Storage

↓

Text extraction

↓

Chunking

↓

Embeddings

↓

Supabase pgvector

↓

Similarity search

↓

Relevant chunks

↓

Gemini

↓

Answer with source references

---

# 6. Approved Knowledge Sources

The assistant may index:

* Course PDFs
* Training manuals
* Presentations
* Approved learning documents
* Trainer-uploaded approved materials

Do not automatically index every uploaded file.

Knowledge sources should be deliberately approved.

---

# 7. Knowledge Document Metadata

Possible metadata:

* Document title
* Course
* Trainer
* Competency
* Document type
* Upload date
* Approval status
* Source path

This metadata can improve retrieval quality.

---

# 8. Knowledge Assistant Flow

Trainee opens Knowledge Assistant.

↓

Enters question.

↓

Server receives question.

↓

System searches approved document chunks.

↓

Top relevant chunks are retrieved.

↓

Gemini receives:

* User question
* Relevant chunks
* Instructions

↓

Gemini generates answer.

↓

UI displays:

* Answer
* Source document names
* Relevant citations where possible

---

# 9. Grounding Rule

The Knowledge Assistant should prefer answers based on retrieved approved content.

If suitable evidence is unavailable, it should say that the indexed learning material does not provide enough information.

It should not confidently invent unsupported answers.

---

# 10. Example Assistant Response

Question:

"What is the purpose of Doppler velocity?"

Possible response structure:

Answer

↓

Short explanation

↓

Sources:

* Doppler Radar Training Module
* Radar Interpretation Notes

The system should prioritize concise educational explanations.

---

# 11. AI Course Recommendation Explanation

The actual recommendation score must remain deterministic.

AI may convert structured recommendation data into friendly language.

Example structured data:

Competency:

Doppler Weather Radar

Current:

55

Target:

80

Gap:

25

Recommended course:

Radar Fundamentals

Recommendation score:

86

AI may produce:

"This course is recommended because your current radar competency is below the target level and the course strongly covers that competency."

AI is explaining the result, not deciding it.

---

# 12. AI Development Plan Explanation

The platform may produce a personalized development-plan summary.

Input may contain:

* Competency gaps
* Recommended courses
* Recommended trainers
* Learning progress

Example output:

"Focus first on Doppler Weather Radar, where your current score is 25 points below target. Complete Radar Fundamentals and review the recommended trainer resources before retaking the assessment."

The underlying priorities must come from deterministic platform data.

---

# 13. AI MCQ Generation

Trainer may optionally request draft MCQ questions.

Possible flow:

Trainer selects:

* Course
* Competency
* Number of questions
* Difficulty

↓

Server sends relevant course content to Gemini.

↓

Gemini generates draft questions.

↓

Trainer reviews.

↓

Trainer edits if required.

↓

Trainer explicitly approves.

↓

Questions are saved.

Important:

AI-generated questions must never be automatically published without trainer review.

---

# 14. AI Question Generation Output

Each suggested question may contain:

* Question
* Four options
* Suggested correct option
* Competency
* Difficulty
* Explanation

Trainer remains responsible for approval.

---

# 15. AI Course Tagging

When course material is uploaded, AI may suggest:

* Competencies
* Skills
* Keywords
* Difficulty
* Content category

Example:

Uploaded course:

"Introduction to Weather Radar"

AI suggestions:

Competency:

Doppler Weather Radar

Skills:

* Reflectivity interpretation
* Velocity interpretation
* Severe weather identification

These must remain suggestions until approved.

---

# 16. AI Trainer Skill Extraction

AI may extract potential expertise areas from trainer-provided profile content or approved documents.

Example:

Input:

Trainer biography and qualifications.

AI suggests:

* Numerical Weather Prediction
* Forecast Verification
* Python

These suggestions must not automatically become verified trainer competencies.

Admin/trainer confirmation is required.

---

# 17. AI Feedback Summarization

AI may summarize multiple course-feedback comments.

Example output:

"Most trainees appreciated the practical examples, while several requested more hands-on radar interpretation exercises."

The system should retain original feedback.

AI summary must not replace underlying feedback records.

---

# 18. AI Analytics Explanation

AI may eventually explain dashboard data.

Example:

"The Observation group shows a lower average NWP competency than other groups, suggesting a possible training priority."

The actual metrics must come from database calculations.

AI should not invent numbers.

---

# 19. AI Features Not Required for MVP

Do not prioritize:

* Fully autonomous learning agents
* AI-generated competency scores
* AI-only trainer matching
* Voice assistant
* Live avatar tutors
* Complex multi-agent systems
* Fine-tuned custom model
* Predictive workforce modeling
* Automatic HR decisions

These would increase complexity without strengthening the core hackathon story.

---

# 20. Prompt Security

AI prompts should not include unnecessary sensitive information.

Avoid sending:

* Passwords
* Authentication tokens
* API keys
* Entire user database
* Unrelated employee records

Send only the minimum information necessary.

---

# 21. Prompt Injection Risk

Documents used in RAG may contain malicious or misleading instructions.

The AI system should treat retrieved documents as data, not as higher-priority system instructions.

The assistant should follow application instructions over instructions embedded in documents.

---

# 22. Sensitive Data Boundary

Before sending profile or competency data to Gemini, evaluate whether it is actually required.

Prefer sending:

* Competency names
* Scores necessary for explanation
* Course titles

Avoid sending unrelated personal profile details.

---

# 23. AI Error Handling

If Gemini is unavailable:

The core application must continue working.

Example:

Recommendation score still works.

Trainer matching still works.

Assessments still work.

Only optional AI explanation may be unavailable.

Display:

"AI explanation is temporarily unavailable."

Do not break the page.

---

# 24. AI Rate Limits

AI calls may be rate limited.

Avoid unnecessary calls.

Good:

Generate explanation only when requested or needed.

Bad:

Call Gemini every time a dashboard component renders.

Cache suitable AI outputs when appropriate.

---

# 25. AI Cost Control

Use AI for high-value tasks.

Prefer deterministic code for:

* Calculations
* Filtering
* Sorting
* Validation
* Role checks
* Database queries

Do not use AI where normal code is simpler.

---

# 26. Model Selection

Use an appropriate Gemini model based on task complexity.

Routine tasks:

Use lower-cost/faster model where suitable.

Complex document reasoning:

Use stronger model when justified.

Do not hard-code model assumptions throughout the application.

Model configuration should be centralized.

---

# 27. AI Server Architecture

Possible structure:

`lib/ai/`

Potential files:

`gemini.ts`

`prompts.ts`

`knowledge-assistant.ts`

`question-generator.ts`

`course-tagger.ts`

Keep AI code separated from deterministic competency logic.

---

# 28. RAG Database Tables

Future tables may include:

`knowledge_documents`

`knowledge_chunks`

Possible fields for documents:

* id
* title
* file_url
* course_id
* competency_id
* approval_status
* uploaded_by
* created_at

Possible fields for chunks:

* id
* document_id
* content
* embedding
* chunk_index
* metadata
* created_at

Use pgvector for embeddings.

---

# 29. Document Approval Flow

Trainer uploads training material.

↓

Material enters approved course resource flow.

↓

Authorized user decides whether resource may enter AI knowledge base.

↓

Document marked approved for knowledge indexing.

↓

Text extracted.

↓

Chunks generated.

↓

Embeddings created.

↓

Chunks stored.

This prevents arbitrary files from automatically becoming trusted AI knowledge.

---

# 30. Retrieval

User submits question.

↓

Create query embedding.

↓

Search vector database.

↓

Retrieve top matching chunks.

↓

Optionally filter by:

* Course
* Competency
* User access
* Document approval

↓

Pass selected chunks to Gemini.

---

# 31. Access-Aware Retrieval

RAG must respect document permissions.

A trainee should not retrieve content from a course or document they are not permitted to access.

Vector search must not become a way to bypass normal access controls.

---

# 32. AI Answer Citations

Where possible, AI answers should show:

* Source title
* Course
* Relevant document section/page if available

This improves trust and demo quality.

---

# 33. Hallucination Handling

The assistant should be instructed:

* Use supplied sources when available.
* Do not invent official IMD policies.
* Do not invent meteorological facts when evidence is absent.
* Clearly state uncertainty.
* Do not claim prototype data is official internal data.

---

# 34. Prototype Disclaimer

Any AI demonstration using seeded data must be clearly understood as prototype behavior.

Do not imply:

* Real employee analysis
* Official internal competency evaluation
* Official IMD AI deployment

unless verified and authorized.

---

# 35. AI and Competency Score Separation

These must remain separate modules.

Example:

`lib/competency/score.ts`

Deterministic.

`lib/ai/development-explanation.ts`

AI-assisted.

AI code must not overwrite trusted scores.

---

# 36. AI and Trainer Matching Separation

Trainer score:

Calculated deterministically.

AI:

May explain why the trainer matches.

Example:

Match:

91.5%

AI explanation:

"This trainer is a strong match because of high radar expertise, relevant experience, availability, and strong trainee feedback."

The 91.5% must not originate from Gemini.

---

# 37. AI and Assessments

AI may:

* Draft questions
* Suggest explanations
* Suggest difficulty tags

AI must not:

* Automatically publish assessments
* Decide final trainee score
* Change answers after submission
* Alter competency result without deterministic logic

---

# 38. Human-in-the-Loop Principle

AI-generated administrative/trainer content should generally require human approval before becoming authoritative.

Examples:

MCQ generation:

AI drafts → Trainer approves

Competency tagging:

AI suggests → Trainer/Admin approves

Trainer skill extraction:

AI suggests → Admin verifies

---

# 39. Knowledge Assistant UI

Future route may be:

`/trainee/knowledge-assistant`

Possible interface:

Conversation area

*

Question input

*

Source references

Keep UI simple.

Do not build this before core learning features.

---

# 40. Example AI Demo

After demonstrating the competency-development flow:

Open Knowledge Assistant.

Ask:

"What should I revise before the radar assessment?"

↓

Assistant searches approved radar learning materials.

↓

Returns concise answer with sources.

This provides an AI "wow" moment without making AI the core system.

---

# 41. Best Hackathon AI Features

If time is limited, prioritize:

1. RAG Knowledge Assistant
2. AI-generated draft MCQs
3. Development-plan explanation

Optional:

4. Feedback summarization
5. Course tagging

Do not attempt every AI feature.

---

# 42. Minimum AI Implementation

A minimum useful AI implementation should demonstrate:

Question

↓

Approved document retrieval

↓

Relevant context

↓

Gemini answer

↓

Source citation

That is enough to demonstrate meaningful AI integration.

---

# 43. AI Testing

Test:

* Questions with strong source evidence
* Questions with no relevant evidence
* Prompt injection inside documents
* Unauthorized document retrieval
* Gemini API failure
* Empty retrieval results
* Incorrect model output formatting

The core app must survive AI failure.

---

# 44. AI Observability

During development, log safe information such as:

* AI feature invoked
* Success/failure
* Model used
* Retrieval count
* Execution time where useful

Do not log:

* API keys
* Authentication tokens
* Sensitive unrestricted user data

---

# 45. Configuration

AI configuration should be centralized.

Possible configuration:

* Model name
* Maximum retrieved chunks
* Similarity threshold
* Maximum response length
* Temperature where appropriate

Avoid scattering AI settings across UI components.

---

# 46. AI Development Rule for Antigravity

Before adding any AI feature, Antigravity must answer:

1. Can normal deterministic code solve this better?
2. Does this feature require an LLM?
3. What data is sent to the model?
4. Is that data necessary?
5. Does user authorization permit access to that data?
6. What happens if Gemini fails?
7. Is the result advisory or authoritative?
8. Is human review required?
9. Can the output be grounded in approved data?
10. Does the feature improve the demo enough to justify its complexity?

If these questions are not answered, do not implement the feature.

---

# 47. Source of Truth

AI implementation must align with:

* `01-requirements.md`
* `02-user-flows.md`
* `03-database-schema.md`
* `04-competency-engine.md`
* `05-ui-design.md`
* `06-api-rules.md`
* `07-security.md`
* `08-ai-features.md`

AI must never silently override deterministic business rules.
