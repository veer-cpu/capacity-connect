import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";

import { enrollInCourse } from "../actions";

import Link from "next/link";

type CoursePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CoursePage({
  params,
}: CoursePageProps) {
  const { user } = await requireRole("trainee");

  const { slug } = await params;

  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      slug,
      description,
      category,
      difficulty,
      estimated_duration_minutes,

      course_competencies (
        relevance_weight,
        competencies (
          name
        )
      ),

      modules (
        id,
        title,
        description,
        position,

        lessons (
          id,
          title,
          description,
          lesson_type,
          position,
          estimated_duration_minutes
        )
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !course) {
    notFound();
  }
const { data: enrollment } = await supabase
  .from("enrollments")
  .select("id, status, progress_percentage")
  .eq("trainee_id", user.id)
  .eq("course_id", course.id)
  .in("status", ["active", "completed"])
  .maybeSingle()

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div>
        <p className="text-sm text-gray-500">
          {course.category}
        </p>

        <h1 className="mt-2 text-3xl font-semibold">
          {course.title}
        </h1>

        <p className="mt-4 max-w-3xl text-gray-600">
          {course.description}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <span>
          Difficulty:{" "}
          <strong className="capitalize">
            {course.difficulty}
          </strong>
        </span>

        <span>
          Duration:{" "}
          <strong>
            {course.estimated_duration_minutes ?? "Not specified"} minutes
          </strong>
        </span>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">
          Competencies Covered
        </h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {course.course_competencies?.map((mapping) => {
            const competency = Array.isArray(mapping.competencies)
              ? mapping.competencies[0]
              : mapping.competencies;

            return (
              <span
                key={competency?.name}
                className="rounded-full border px-3 py-1 text-sm"
              >
                {competency?.name}
              </span>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">
          Course Content
        </h2>

        <div className="mt-4 space-y-6">
          {course.modules
            ?.sort((a, b) => a.position - b.position)
            .map((module) => (
              <div
                key={module.id}
                className="rounded-xl border p-5"
              >
                <h3 className="font-semibold">
                  {module.title}
                </h3>

                {module.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {module.description}
                  </p>
                )}

                <div className="mt-4 space-y-2">
                  {module.lessons
                    ?.sort((a, b) => a.position - b.position)
                    .map((lesson) => (
                      <div
                        key={lesson.id}
                        className="rounded-md bg-gray-50 p-3 text-sm"
                      >
                        <p className="font-medium">
                          {lesson.title}
                        </p>

                        <p className="mt-1 text-gray-500">
                          {lesson.lesson_type}
                          {lesson.estimated_duration_minutes
                            ? ` • ${lesson.estimated_duration_minutes} min`
                            : ""}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      </section>

      <section className="mt-10 border-t pt-6">
        {enrollment ? (
  <div>
    <p className="font-medium">
      You are enrolled in this course.
    </p>

    <p className="mt-1 text-sm text-gray-600">
      Progress: {Number(enrollment.progress_percentage)}%
    </p>

    <Link
      href={`/trainee/courses/${course.slug}`}
      className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-white"
    >
      Continue Learning
    </Link>
  </div>
) : (
          <form action={enrollInCourse}>
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

            <button
              type="submit"
              className="rounded-md bg-black px-5 py-2 text-white"
            >
              Enroll in Course
            </button>
          </form>
        )}
      </section>
    </main>
  );
}