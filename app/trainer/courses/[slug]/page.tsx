import Link from "next/link";

import { getTrainerCourseDetail } from "@/lib/trainer/get-course-detail";
import { getTrainerCourseTrainees } from "@/lib/trainer/get-course-trainees";
import { getTrainerCourseAssignments } from "@/lib/trainer/get-course-assignments";
import {
  deleteCourseResource,
  uploadCourseResource,
} from "./resource-actions";
import { getTrainerCourseResources } from "@/lib/trainer/get-course-resources";
import {
  evaluateSubmission,
  saveAssignment,
  submitCourseForReview,
} from "./actions";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TrainerCoursePage({
  params,
}: PageProps) {
  const { slug } = await params;

  const course = await getTrainerCourseDetail(slug);
  const trainees = await getTrainerCourseTrainees(course.id);
  const resources = await getTrainerCourseResources(course.id);
  const assignments = await getTrainerCourseAssignments(course.id);

  return (
    <main className="mx-auto max-w-6xl p-8">
      <section>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border px-3 py-1 text-xs capitalize">
            Publish Status: {course.status}
          </span>

          <span className="rounded-full border px-3 py-1 text-xs capitalize">
            Approval: {course.approvalStatus}
          </span>

          <span className="rounded-full border px-3 py-1 text-xs capitalize">
            {course.difficulty}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold">
          {course.title}
        </h1>

        {course.category && (
          <p className="mt-2 text-sm text-gray-500">
            {course.category}
          </p>
        )}

        {course.description && (
          <p className="mt-4 max-w-3xl text-gray-600">
            {course.description}
          </p>
        )}
      </section>

      {/* Approval Status Banner */}
      <section className="mt-6 rounded-xl border p-5 bg-gray-50/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Course Approval Status:</span>
              <span className={`rounded-full px-3 py-0.5 text-xs font-medium capitalize border ${
                course.approvalStatus === "approved"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : course.approvalStatus === "submitted"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : course.approvalStatus === "rejected"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}>
                {course.approvalStatus}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {course.approvalStatus === "draft" && "Submit this course for admin review once draft content and competencies are ready."}
              {course.approvalStatus === "submitted" && "Submitted for review. Pending admin approval."}
              {course.approvalStatus === "approved" && "Course approved by administration. Ready for publication."}
              {course.approvalStatus === "rejected" && "Review feedback provided below. Make necessary updates and resubmit."}
            </p>
          </div>

          {(course.approvalStatus === "draft" || course.approvalStatus === "rejected") && (
            <form action={submitCourseForReview}>
              <input type="hidden" name="courseId" value={course.id} />
              <input type="hidden" name="slug" value={course.slug} />
              <button
                type="submit"
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                {course.approvalStatus === "rejected" ? "Resubmit for Review" : "Submit Course for Review"}
              </button>
            </form>
          )}
        </div>

        {course.approvalStatus === "rejected" && course.reviewReason && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-semibold">Admin Rejection Reason:</p>
            <p className="mt-1">{course.reviewReason}</p>
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard
          label="Assessments"
          value={course.assessmentCount}
        />

        <InfoCard
          label="Modules"
          value={course.modules.length}
        />

        <InfoCard
          label="Estimated Duration"
          value={
            course.estimatedDurationMinutes
              ? `${course.estimatedDurationMinutes} min`
              : "Not set"
          }
        />
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">
          Competencies Covered
        </h2>

        {course.competencies.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">
            No competencies are mapped to this course.
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {course.competencies.map(
              (competency) => (
                <span
                  key={competency.id}
                  className="rounded-full border px-3 py-1 text-sm"
                >
                  {competency.name}
                </span>
              )
            )}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">
          Modules & Lessons
        </h2>

        {course.modules.length === 0 ? (
          <div className="mt-4 rounded-xl border p-6">
            <p className="text-sm text-gray-600">
              This course has no modules yet.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {course.modules.map(
              (module, index) => (
                <article
                  key={module.id}
                  className="rounded-xl border p-5"
                >
                  <div>
                    <p className="text-sm text-gray-500">
                      Module {index + 1}
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      {module.title}
                    </h3>

                    {module.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {module.description}
                      </p>
                    )}
                  </div>

                  {module.lessons.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-500">
                      No lessons in this module.
                    </p>
                  ) : (
                    <div className="mt-5 divide-y rounded-lg border">
                      {module.lessons.map(
                        (lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                          >
                            <div>
                              <p className="font-medium">
                                {lessonIndex + 1}.{" "}
                                {lesson.title}
                              </p>

                              <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                                {lesson.lessonType && (
                                  <span className="capitalize">
                                    {
                                      lesson.lessonType
                                    }
                                  </span>
                                )}

                                {lesson.durationMinutes !==
                                  null && (
                                  <span>
                                    {
                                      lesson.durationMinutes
                                    }{" "}
                                    min
                                  </span>
                                )}

                                {lesson.isRequired && (
                                  <span>
                                    Required
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </article>
              )
            )}
          </div>
        )}
      </section>
<section className="mt-10">
  <h2 className="text-xl font-semibold">
    Learning Materials
  </h2>

  <p className="mt-2 text-sm text-gray-600">
    Upload course resources such as PDFs,
    presentations, documents, and recorded lectures.
  </p>

  <form
    action={uploadCourseResource}
    className="mt-6 rounded-xl border p-6"
  >
    <input
      type="hidden"
      name="courseId"
      value={course.id}
    />

    <input
      type="hidden"
      name="courseSlug"
      value={course.slug}
    />

    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label
          htmlFor="title"
          className="text-sm font-medium"
        >
          Resource Title
        </label>

        <input
          id="title"
          name="title"
          required
          maxLength={150}
          className="mt-2 w-full rounded-md border px-3 py-2"
          placeholder="Radar Interpretation Notes"
        />
      </div>

      <div>
        <label
          htmlFor="resourceType"
          className="text-sm font-medium"
        >
          Resource Type
        </label>

        <select
          id="resourceType"
          name="resourceType"
          required
          className="mt-2 w-full rounded-md border px-3 py-2"
        >
          <option value="pdf">
            PDF
          </option>

          <option value="presentation">
            Presentation
          </option>

          <option value="document">
            Document
          </option>

          <option value="video">
            Video
          </option>

          <option value="other">
            Other
          </option>
        </select>
      </div>

      <div>
        <label
          htmlFor="lessonId"
          className="text-sm font-medium"
        >
          Attach to Lesson
        </label>

        <select
          id="lessonId"
          name="lessonId"
          className="mt-2 w-full rounded-md border px-3 py-2"
        >
          <option value="">
            Course-wide resource
          </option>

          {course.modules.flatMap(
            (module) =>
              module.lessons.map(
                (lesson) => (
                  <option
                    key={lesson.id}
                    value={lesson.id}
                  >
                    {module.title}
                    {" — "}
                    {lesson.title}
                  </option>
                )
              )
          )}
        </select>
      </div>

      <div>
        <label
          htmlFor="file"
          className="text-sm font-medium"
        >
          File
        </label>

        <input
          id="file"
          name="file"
          type="file"
          required
          accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.mp4"
          className="mt-2 block w-full text-sm"
        />

        <p className="mt-2 text-xs text-gray-500">
          Maximum size: 50 MB
        </p>
      </div>
    </div>

    <div className="mt-5">
      <label
        htmlFor="description"
        className="text-sm font-medium"
      >
        Description
      </label>

      <textarea
        id="description"
        name="description"
        rows={3}
        maxLength={500}
        className="mt-2 w-full rounded-md border px-3 py-2"
        placeholder="Optional description of this material."
      />
    </div>

    <button
      type="submit"
      className="mt-5 rounded-md bg-black px-5 py-2 text-white"
    >
      Upload Resource
    </button>
  </form>
    {resources.length === 0 ? (
    <div className="mt-6 rounded-xl border p-6">
      <h3 className="font-semibold">
        No learning materials
      </h3>

      <p className="mt-2 text-sm text-gray-600">
        No resources have been uploaded to this course yet.
      </p>
    </div>
  ) : (
    <div className="mt-6 space-y-3">
      {resources.map(
        (resource) => (
          <article
            key={resource.id}
            className="flex flex-col justify-between gap-4 rounded-xl border p-5 sm:flex-row sm:items-center"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">
                  {resource.title}
                </h3>

                <span className="rounded-full border px-2 py-1 text-xs capitalize">
                  {resource.resourceType}
                </span>
              </div>

              {resource.description && (
                <p className="mt-2 text-sm text-gray-600">
                  {resource.description}
                </p>
              )}

              <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                <span>
                  {formatFileSize(
                    resource.fileSizeBytes
                  )}
                </span>

                <span>
                  Uploaded{" "}
                  {new Date(
                    resource.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>

           <div className="flex flex-wrap gap-2">
  {resource.signedUrl ? (
    <a
      href={resource.signedUrl}
      target="_blank"
      rel="noreferrer"
      className="rounded-md border px-4 py-2 text-center text-sm"
    >
      Open Resource
    </a>
  ) : (
    <span className="rounded-md border px-4 py-2 text-sm text-gray-500">
      File unavailable
    </span>
  )}

  <form
    action={deleteCourseResource}
  >
    <input
      type="hidden"
      name="resourceId"
      value={resource.id}
    />

    <input
      type="hidden"
      name="courseId"
      value={course.id}
    />

    <button
      type="submit"
      className="rounded-md border px-4 py-2 text-sm"
    >
      Delete
    </button>
  </form>
</div>
          </article>
        )
      )}
    </div>
  )}
</section>

{/* Assignments Section */}
<section className="mt-10">
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h2 className="text-xl font-semibold">Course Assignments &amp; Evaluation</h2>
      <p className="mt-1 text-sm text-gray-600">
        Create assignments for trainees, inspect submissions, evaluate scores, and request resubmissions.
      </p>
    </div>
  </div>

  {/* Create Assignment Form */}
  <div className="mt-6 rounded-xl border p-6 bg-gray-50/40">
    <h3 className="text-base font-semibold">Create New Assignment</h3>
    <form action={saveAssignment} className="mt-4 space-y-4">
      <input type="hidden" name="courseId" value={course.id} />
      <input type="hidden" name="slug" value={course.slug} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="assign-title" className="block text-sm font-medium text-gray-700">
            Assignment Title *
          </label>
          <input
            id="assign-title"
            name="title"
            required
            maxLength={150}
            className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
            placeholder="e.g. Weather Radar Data Interpretation Exercise"
          />
        </div>

        <div>
          <label htmlFor="assign-module" className="block text-sm font-medium text-gray-700">
            Associate Module (Optional)
          </label>
          <select
            id="assign-module"
            name="moduleId"
            className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
          >
            <option value="">Course-wide (No specific module)</option>
            {course.modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="assign-score" className="block text-sm font-medium text-gray-700">
            Max Score *
          </label>
          <input
            id="assign-score"
            name="maxScore"
            type="number"
            required
            min={1}
            max={1000}
            defaultValue={100}
            className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="assign-due" className="block text-sm font-medium text-gray-700">
            Due Date &amp; Time (Optional)
          </label>
          <input
            id="assign-due"
            name="dueAt"
            type="datetime-local"
            className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="assign-status" className="block text-sm font-medium text-gray-700">
            Lifecycle Status *
          </label>
          <select
            id="assign-status"
            name="status"
            defaultValue="draft"
            required
            className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
          >
            <option value="draft">Draft (hidden from trainees)</option>
            <option value="published">Published (open for submission)</option>
            <option value="closed">Closed (submissions closed)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="assign-desc" className="block text-sm font-medium text-gray-700">
          Description / Guidelines
        </label>
        <textarea
          id="assign-desc"
          name="description"
          rows={3}
          maxLength={2000}
          className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
          placeholder="Detailed task instructions, expected output format, or reference link..."
        />
      </div>

      <button
        type="submit"
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Save Assignment
      </button>
    </form>
  </div>

  {/* Assignment List */}
  {assignments.length === 0 ? (
    <div className="mt-6 rounded-xl border p-6 text-center text-sm text-gray-500">
      No assignments created for this course yet.
    </div>
  ) : (
    <div className="mt-6 space-y-6">
      {assignments.map((assignment) => {
        const pendingCount = assignment.submissions.filter((s) => s.status === "submitted").length;

        return (
          <article key={assignment.id} className="rounded-xl border p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{assignment.title}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize border ${
                    assignment.status === "published"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : assignment.status === "closed"
                      ? "bg-gray-100 text-gray-700 border-gray-300"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }`}>
                    {assignment.status}
                  </span>
                  {assignment.moduleTitle && (
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      Module: {assignment.moduleTitle}
                    </span>
                  )}
                </div>
                {assignment.description && (
                  <p className="mt-2 text-sm text-gray-600">{assignment.description}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>Max Score: {assignment.maxScore}</span>
                  <span>Due: {assignment.dueAt ? new Date(assignment.dueAt).toLocaleString() : "No due date"}</span>
                  <span>Total Submissions: {assignment.submissions.length}</span>
                  {pendingCount > 0 && (
                    <span className="font-semibold text-amber-600">
                      {pendingCount} pending evaluation
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Submissions Section */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-800">
                Trainee Submissions ({assignment.submissions.length})
              </h4>

              {assignment.submissions.length === 0 ? (
                <p className="mt-2 text-xs text-gray-500">No trainee submissions yet.</p>
              ) : (
                <div className="mt-3 space-y-4">
                  {assignment.submissions.map((sub) => (
                    <div key={sub.id} className="rounded-lg border bg-gray-50/50 p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{sub.traineeName}</p>
                          <p className="text-xs text-gray-500">{sub.traineeEmail}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs capitalize border ${
                            sub.status === "evaluated"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : sub.status === "resubmission_required"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                            {sub.status === "resubmission_required" ? "Resubmission Required" : sub.status}
                          </span>
                          {sub.score !== null && (
                            <span className="text-sm font-semibold text-gray-800">
                              {sub.score} / {assignment.maxScore}
                            </span>
                          )}
                        </div>
                      </div>

                      {sub.submissionText && (
                        <div className="rounded border bg-white p-3 text-sm text-gray-800">
                          <p className="text-xs font-semibold text-gray-500 mb-1">Submission Text:</p>
                          <p className="whitespace-pre-wrap">{sub.submissionText}</p>
                        </div>
                      )}

                      {sub.submissionUrl && (
                        <div className="text-xs">
                          <span className="font-semibold text-gray-500">Submission Link: </span>
                          <a
                            href={sub.submissionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-blue-600 underline"
                          >
                            {sub.submissionUrl}
                          </a>
                        </div>
                      )}

                      {sub.feedback && (
                        <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                          <span className="font-semibold">Trainer Feedback: </span>
                          {sub.feedback}
                        </div>
                      )}

                      {/* Evaluation Form */}
                      <form action={evaluateSubmission} className="mt-3 rounded border bg-white p-3 space-y-3">
                        <input type="hidden" name="submissionId" value={sub.id} />
                        <input type="hidden" name="slug" value={course.slug} />

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700">
                              Score (Max {assignment.maxScore})
                            </label>
                            <input
                              type="number"
                              name="score"
                              min={0}
                              max={assignment.maxScore}
                              defaultValue={sub.score ?? undefined}
                              className="mt-1 w-full rounded border px-2 py-1 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700">
                              Evaluation Outcome *
                            </label>
                            <select
                              name="status"
                              defaultValue={sub.status === "resubmission_required" ? "resubmission_required" : "evaluated"}
                              required
                              className="mt-1 w-full rounded border px-2 py-1 text-sm"
                            >
                              <option value="evaluated">Evaluated / Graded</option>
                              <option value="resubmission_required">Request Resubmission</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700">
                            Trainer Feedback
                          </label>
                          <textarea
                            name="feedback"
                            rows={2}
                            maxLength={2000}
                            defaultValue={sub.feedback ?? ""}
                            placeholder="Provide evaluation score notes or guidelines for resubmission..."
                            className="mt-1 w-full rounded border px-2 py-1 text-sm"
                          />
                        </div>

                        <button
                          type="submit"
                          className="rounded bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                        >
                          Submit Evaluation
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  )}
</section>

<section className="mt-10">
  <h2 className="text-xl font-semibold">
    Enrolled Trainees
  </h2>

  <p className="mt-2 text-sm text-gray-600">
    Monitor enrollment status and course progress for trainees
    assigned to this course.
  </p>

  {trainees.length === 0 ? (
    <div className="mt-5 rounded-xl border p-6">
      <h3 className="font-semibold">
        No enrolled trainees
      </h3>

      <p className="mt-2 text-sm text-gray-600">
        No trainees are currently enrolled in this course.
      </p>
    </div>
  ) : (
    <div className="mt-5 overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium">
              Trainee
            </th>

            <th className="px-4 py-3 font-medium">
              Department
            </th>

            <th className="px-4 py-3 font-medium">
              Status
            </th>

            <th className="px-4 py-3 font-medium">
              Progress
            </th>

            <th className="px-4 py-3 font-medium">
              Enrolled
            </th>

            <th className="px-4 py-3 font-medium">
              Completed
            </th>
          </tr>
        </thead>

        <tbody>
          {trainees.map((trainee) => (
            <tr
              key={trainee.traineeId}
              className="border-b last:border-b-0"
            >
              <td className="px-4 py-4">
                <div>
                  <p className="font-medium">
                    {trainee.fullName}
                  </p>

                  {trainee.designation && (
                    <p className="mt-1 text-xs text-gray-500">
                      {trainee.designation}
                    </p>
                  )}
                </div>
              </td>

              <td className="px-4 py-4">
                {trainee.department ?? "—"}
              </td>

              <td className="px-4 py-4 capitalize">
                {trainee.enrollmentStatus}
              </td>

              <td className="px-4 py-4">
                <div className="min-w-32">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">
                      {trainee.progressPercentage.toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-black"
                      style={{
                        width: `${Math.min(
                          Math.max(
                            trainee.progressPercentage,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </td>

              <td className="px-4 py-4">
                {new Date(
                  trainee.enrolledAt
                ).toLocaleDateString()}
              </td>

              <td className="px-4 py-4">
                {trainee.completedAt
                  ? new Date(
                      trainee.completedAt
                    ).toLocaleDateString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/trainer/courses"
          className="rounded-md border px-4 py-2 text-sm"
        >
          Back to My Courses
        </Link>

        <Link
          href="/trainer/dashboard"
          className="rounded-md border px-4 py-2 text-sm"
        >
          Dashboard
        </Link>
      </div>
    </main>
  );
}
function formatFileSize(
  bytes: number
): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes =
    bytes / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(
      1
    )} KB`;
  }

  const megabytes =
    kilobytes / 1024;

  return `${megabytes.toFixed(
    1
  )} MB`;
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
})
 {
  return (
    <div className="rounded-xl border p-5">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold">
        {value}
      </p>
    </div>

  );
  
}