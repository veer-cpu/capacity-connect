import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/require-role";
import { getCourseAssessments } from "@/lib/trainer/get-course-assessments";
import { getTrainerCourseDetail } from "@/lib/trainer/get-course-detail";

import { createAssessment } from "./actions";

type PageProps = {
  params: Promise<{
    slug: string;
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

export default async function TrainerCourseAssessmentsPage({
  params,
}: PageProps) {
  await requireRole("trainer");

  const { slug } = await params;

  const course = await getTrainerCourseDetail(slug);
  const assessments = await getCourseAssessments(course.id);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Link
            href={`/trainer/courses/${course.slug}`}
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to course
          </Link>
          <h1 className="mt-2 text-3xl font-semibold">Assessments</h1>
        </div>
      </div>

      <section className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Course</p>
            <h2 className="text-xl font-semibold">{course.title}</h2>
          </div>
          <Link
            href={`/trainer/courses/${course.slug}`}
            className="rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            View Course
          </Link>
        </div>
      </section>

      <section className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Create assessment</h2>

        <form action={createAssessment} className="mt-5 space-y-5">
          <input type="hidden" name="courseId" value={course.id} />

          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              minLength={2}
              maxLength={150}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Safety assessment"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              maxLength={1000}
              rows={4}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Optional description for this assessment"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="passingScore"
                className="mb-2 block text-sm font-medium"
              >
                Passing score (%)
              </label>
              <input
                id="passingScore"
                name="passingScore"
                type="number"
                min={0}
                max={100}
                step="1"
                defaultValue={80}
                required
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label
                htmlFor="deadline"
                className="mb-2 block text-sm font-medium"
              >
                Deadline (optional)
              </label>
              <input
                id="deadline"
                name="deadline"
                type="datetime-local"
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Save draft assessment
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Assessment list</h2>

        {assessments.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed p-8 text-center text-gray-500">
            No assessments created yet.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {assessments.map((assessment) => (
              <article
                key={assessment.id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {assessment.title}
                      </h3>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusBadgeClass(
                          assessment.status,
                        )}`}
                      >
                        {assessment.status}
                      </span>
                    </div>
                    {assessment.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {assessment.description}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/trainer/courses/${course.slug}/assessments/${assessment.id}`}
                    className="rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {assessment.status === "draft"
                      ? "Edit Questions"
                      : "Manage Assessment"}
                  </Link>
                </div>

                <div className="mt-4 grid gap-4 text-sm text-gray-700 sm:grid-cols-3">
                  <div>
                    <p className="text-gray-500">Passing score</p>
                    <p className="mt-1 font-medium">
                      {Number(assessment.passingScore)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Deadline</p>
                    <p className="mt-1 font-medium">
                      {assessment.deadline
                        ? new Date(assessment.deadline).toLocaleString()
                        : "No deadline"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="mt-1 font-medium">
                      {new Date(assessment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
