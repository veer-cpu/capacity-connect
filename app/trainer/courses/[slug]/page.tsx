import Link from "next/link";

import { getTrainerCourseDetail } from "@/lib/trainer/get-course-detail";

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

      <section className="mt-10 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">
          Enrolled Trainees
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Trainee participation and progress will be shown here in the
          next trainer slice.
        </p>
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