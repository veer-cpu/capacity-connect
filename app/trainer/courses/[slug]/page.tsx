import Link from "next/link";

import { getTrainerCourseDetail } from "@/lib/trainer/get-course-detail";
import { getTrainerCourseTrainees } from "@/lib/trainer/get-course-trainees";
type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TrainerCoursePage({
  params,
}: PageProps) {
  const { slug } = await params;

  const course =
    await getTrainerCourseDetail(slug);
const trainees =
  await getTrainerCourseTrainees(
    course.id
  );
  return (
    <main className="mx-auto max-w-6xl p-8">
      <section>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border px-3 py-1 text-xs capitalize">
            {course.status}
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

function InfoCard({
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

      <p className="mt-2 text-xl font-semibold">
        {value}
      </p>
    </div>
  );
}