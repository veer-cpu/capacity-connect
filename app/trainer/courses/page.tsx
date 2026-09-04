import Link from "next/link";

import { getAssignedCourses } from "@/lib/trainer/get-assigned-courses";

export default async function TrainerCoursesPage() {
  const data = await getAssignedCourses();

  return (
    <main className="mx-auto max-w-6xl p-8">
      <section>
        <p className="text-sm font-medium text-gray-500">
          Trainer Workspace
        </p>

        <h1 className="mt-2 text-3xl font-semibold">
          My Courses
        </h1>

        <p className="mt-3 text-gray-600">
          View the courses currently assigned to your trainer account.
        </p>
      </section>

      {data.courses.length === 0 ? (
        <section className="mt-8 rounded-xl border p-6">
          <h2 className="text-lg font-semibold">
            No assigned courses
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            You do not have any courses assigned yet. An administrator
            must assign a course before it appears here.
          </p>
        </section>
      ) : (
        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {data.courses.map((course) => (
            <article
              key={course.id}
              className="rounded-xl border p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm capitalize text-gray-500">
                    {course.status}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    {course.title}
                  </h2>

                  {course.category && (
                    <p className="mt-1 text-sm text-gray-600">
                      {course.category}
                    </p>
                  )}
                </div>

                <span className="rounded-full border px-3 py-1 text-xs capitalize">
                  {course.difficulty}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">
                    Trainees
                  </p>

                  <p className="mt-1 font-semibold">
                    {course.activeTrainees}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    Progress
                  </p>

                  <p className="mt-1 font-semibold">
                    {course.averageProgress}%
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    Assessments
                  </p>

                  <p className="mt-1 font-semibold">
                    {course.assessmentCount}
                  </p>
                </div>
              </div>

              <Link
                href={`/trainer/courses/${course.slug}`}
                className="mt-6 inline-block rounded-md bg-black px-4 py-2 text-sm text-white"
              >
                Open Course
              </Link>
            </article>
          ))}
        </section>
      )}

      <div className="mt-8">
        <Link
          href="/trainer/dashboard"
          className="rounded-md border px-4 py-2 text-sm"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}