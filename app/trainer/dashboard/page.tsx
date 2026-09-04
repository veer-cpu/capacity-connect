import Link from "next/link";

import { getAssignedCourses } from "@/lib/trainer/get-assigned-courses";

export default async function TrainerDashboardPage() {
  const data =
    await getAssignedCourses();

  return (
    <main className="mx-auto max-w-6xl p-8">
      <section>
        <p className="text-sm font-medium text-gray-500">
          Trainer Workspace
        </p>

        <h1 className="mt-2 text-3xl font-semibold">
          Welcome, {data.trainerName}
        </h1>

        <p className="mt-3 text-gray-600">
          Monitor your assigned courses,
          learner participation, and course
          progress.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Assigned Courses"
          value={data.assignedCoursesCount}
        />

        <MetricCard
          label="Active Trainees"
          value={data.totalActiveTrainees}
        />

        <MetricCard
          label="Assessments"
          value={data.totalAssessments}
        />

        <MetricCard
          label="Average Progress"
          value={`${data.averageProgress}%`}
        />
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              Assigned Courses
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Courses currently assigned to
              your trainer account.
            </p>
          </div>

          {data.courses.length > 0 && (
            <Link
              href="/trainer/courses"
              className="rounded-md border px-4 py-2 text-sm"
            >
              View All
            </Link>
          )}
        </div>

        {data.courses.length === 0 ? (
          <div className="mt-6 rounded-xl border p-6">
            <h3 className="font-semibold">
              No assigned courses
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              You have no courses assigned
              to you yet. An administrator
              must assign a course before
              it appears here.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {data.courses.map(
              (course) => (
                <article
                  key={course.id}
                  className="rounded-xl border p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm capitalize text-gray-500">
                        {course.status}
                      </p>

                      <h3 className="mt-1 text-lg font-semibold">
                        {course.title}
                      </h3>
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
                        {
                          course.activeTrainees
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">
                        Progress
                      </p>

                      <p className="mt-1 font-semibold">
                        {
                          course.averageProgress
                        }
                        %
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">
                        Assessments
                      </p>

                      <p className="mt-1 font-semibold">
                        {
                          course.assessmentCount
                        }
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
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border p-5">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}