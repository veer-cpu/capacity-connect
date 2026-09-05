import Link from "next/link";

import { getTrainerAssessmentEditor } from "@/lib/trainer/get-trainer-assessment-editor";

import {
  addAssessmentQuestion,
  deleteAssessmentQuestion,
  publishAssessment,
} from "./actions";
import CoursePage from "@/app/courses/[slug]/page";

type PageProps = {
  params: Promise<{
    slug: string;
    assessmentId: string;
  }>;
};

function statusBadgeClass(status: string) {
  switch (status) {
    case "draft":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "published":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "closed":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export default async function TrainerAssessmentEditorPage({
  params,
}: PageProps) {
  const { slug, assessmentId } = await params;

  const editor = await getTrainerAssessmentEditor(slug, assessmentId);

  const assessmentDeadline = editor.assessment.deadline
    ? new Date(editor.assessment.deadline).toLocaleString()
    : "No deadline";

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {editor.assessment.status === "draft" && (
  <form action={publishAssessment}>
    <input
      type="hidden"
      name="assessmentId"
      value={assessmentId}
    />

    <input
      type="hidden"
      name="courseSlug"
      value={slug}
    />

    <button
      type="submit"
      className="rounded-md bg-black px-4 py-2 text-sm text-white"
    >
      Publish Assessment
    </button>
  </form>
)}
        <div>
          <Link
            href={`/trainer/courses/${slug}/assessments`}
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to assessments
          </Link>
          <h1 className="mt-2 text-3xl font-semibold">
            {editor.assessment.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusBadgeClass(
              editor.assessment.status,
            )}`}
          >
            {editor.assessment.status}
          </span>
        </div>
      </div>

      <section className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Passing score</p>
            <p className="mt-1 text-lg font-semibold">
              {Number(editor.assessment.passingScore)}%
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Deadline</p>
            <p className="mt-1 text-lg font-semibold">{assessmentDeadline}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Course</p>
            <p className="mt-1 text-lg font-semibold">{editor.course.title}</p>
          </div>
        </div>
      </section>

      {editor.assessment.status !== "draft" ? (
        <section className="mb-8 rounded-xl border border-dashed border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p className="font-medium">
            This assessment is not editable in draft mode.
          </p>
          <p className="mt-1 text-sm">
            Questions can only be added while the assessment is in draft status.
          </p>
        </section>
      ) : (
        <section className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Add Question</h2>

          <form action={addAssessmentQuestion} className="mt-5 space-y-5">
            <input
              type="hidden"
              name="assessmentId"
              value={editor.assessment.id}
            />
            <input type="hidden" name="courseSlug" value={editor.course.slug} />

            <div>
              <label
                htmlFor="questionText"
                className="mb-2 block text-sm font-medium"
              >
                Question
              </label>
              <textarea
                id="questionText"
                name="questionText"
                required
                minLength={2}
                maxLength={1000}
                rows={4}
                className="w-full rounded-md border px-3 py-2"
                placeholder="What is the correct response?"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="competencyId"
                  className="mb-2 block text-sm font-medium"
                >
                  Competency mapping
                </label>
                <select
                  id="competencyId"
                  name="competencyId"
                  className="w-full rounded-md border px-3 py-2"
                  defaultValue=""
                >
                  <option value="">No competency mapping</option>
                  {editor.competencies.map((competency) => (
                    <option key={competency.id} value={competency.id}>
                      {competency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="points"
                  className="mb-2 block text-sm font-medium"
                >
                  Points
                </label>
                <input
                  id="points"
                  name="points"
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  defaultValue={1}
                  required
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="option1"
                  className="mb-2 block text-sm font-medium"
                >
                  Option 1
                </label>
                <input
                  id="option1"
                  name="option1"
                  required
                  maxLength={500}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor="option2"
                  className="mb-2 block text-sm font-medium"
                >
                  Option 2
                </label>
                <input
                  id="option2"
                  name="option2"
                  required
                  maxLength={500}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor="option3"
                  className="mb-2 block text-sm font-medium"
                >
                  Option 3
                </label>
                <input
                  id="option3"
                  name="option3"
                  maxLength={500}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor="option4"
                  className="mb-2 block text-sm font-medium"
                >
                  Option 4
                </label>
                <input
                  id="option4"
                  name="option4"
                  maxLength={500}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium">Correct answer</p>
              <div className="flex flex-wrap gap-4">
                {[1, 2, 3, 4].map((optionNumber) => (
                  <label
                    key={optionNumber}
                    className="flex items-center gap-2 rounded-md border px-3 py-2"
                  >
                    <input
                      type="radio"
                      name="correctOption"
                      value={optionNumber}
                      required
                      defaultChecked={optionNumber === 1}
                    />
                    <span>Option {optionNumber}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Add Question
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Existing Questions</h2>

        {editor.questions.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed p-6 text-center text-gray-500">
            No questions added yet.
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {editor.questions.map((question, index) => (
              <article key={question.id} className="rounded-xl border p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm text-gray-500">
                      Question {question.position}
                    </p>

                    <h3 className="mt-1 font-semibold">
                      {question.questionText}
                    </h3>
                  </div>

                  {editor.assessment.status === "draft" && (
                    <form action={deleteAssessmentQuestion}>
                      <input
                        type="hidden"
                        name="questionId"
                        value={question.id}
                      />

                      <input
                        type="hidden"
                        name="assessmentId"
                        value={editor.assessment.id}
                      />

                      <input
                        type="hidden"
                        name="courseSlug"
                        value={editor.course.slug}
                      />

                      <button
                        type="submit"
                        className="rounded-md border px-3 py-2 text-sm"
                      >
                        Delete Question
                      </button>
                    </form>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">
                    {index + 1}. {question.questionText}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span>Points: {question.points}</span>
                    {question.competencyId ? (
                      <span>
                        Competency:{" "}
                        {editor.competencies.find(
                          (competency) =>
                            competency.id === question.competencyId,
                        )?.name ?? "Mapped"}
                      </span>
                    ) : (
                      <span>Unmapped</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={option.id}
                      className="rounded-md border px-3 py-2 text-sm text-gray-700"
                    >
                      {String.fromCharCode(65 + optionIndex)}.{" "}
                      {option.optionText}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
