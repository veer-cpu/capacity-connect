import { notFound, redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

import { markLessonComplete } from "../actions";

type LearningPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LearningPage({
  params,
}: LearningPageProps) {
  const { user } = await requireRole("trainee");

  const { slug } = await params;

  const supabase = await createClient();

  const { data: course, error: courseError } =
    await supabase
      .from("courses")
      .select(`
        id,
        title,
        slug,

        modules (
          id,
          title,
          position,

          lessons (
            id,
            title,
            description,
            lesson_type,
            content,
            resource_url,
            position,
            estimated_duration_minutes,
            is_required
          )
        )
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .single();

  if (courseError || !course) {
    notFound();
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select(`
      id,
      status,
      progress_percentage
    `)
    .eq("course_id", course.id)
    .eq("trainee_id", user.id)
    .maybeSingle();

  if (!enrollment) {
    redirect(`/courses/${slug}`);
  }

  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("lesson_id, is_completed")
    .eq("enrollment_id", enrollment.id);

  const completedLessonIds = new Set(
    progressRows
      ?.filter((row) => row.is_completed)
      .map((row) => row.lesson_id) ?? []
  );

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-semibold">
        {course.title}
      </h1>

      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Course Progress
        </p>

        <div className="mt-2 h-3 overflow-hidden rounded bg-gray-200">
          <div
            className="h-full bg-black"
            style={{
              width: `${Number(
                enrollment.progress_percentage
              )}%`,
            }}
          />
        </div>

        <p className="mt-2 text-sm">
          {Number(
            enrollment.progress_percentage
          )}
          % complete
        </p>
      </div>

      <div className="mt-10 space-y-8">
        {course.modules
          ?.sort((a, b) => a.position - b.position)
          .map((module) => (
            <section key={module.id}>
              <h2 className="text-xl font-semibold">
                {module.title}
              </h2>

              <div className="mt-4 space-y-4">
                {module.lessons
                  ?.sort(
                    (a, b) =>
                      a.position - b.position
                  )
                  .map((lesson) => {
                    const completed =
                      completedLessonIds.has(
                        lesson.id
                      );

                    return (
                      <article
                        key={lesson.id}
                        className="rounded-xl border p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">
                              {lesson.title}
                            </h3>

                            {lesson.description && (
                              <p className="mt-2 text-sm text-gray-600">
                                {
                                  lesson.description
                                }
                              </p>
                            )}
                          </div>

                          <span className="text-sm">
                            {completed
                              ? "Completed"
                              : "Not completed"}
                          </span>
                        </div>

                        {lesson.lesson_type ===
                          "text" &&
                          lesson.content && (
                            <div className="mt-5 rounded-lg bg-gray-50 p-4">
                              <p>
                                {lesson.content}
                              </p>
                            </div>
                          )}

                        {!completed && (
                          <form
                            action={
                              markLessonComplete
                            }
                            className="mt-5"
                          >
                            <input
                              type="hidden"
                              name="enrollmentId"
                              value={
                                enrollment.id
                              }
                            />

                            <input
                              type="hidden"
                              name="lessonId"
                              value={lesson.id}
                            />

                            <input
                              type="hidden"
                              name="courseSlug"
                              value={course.slug}
                            />

                            <button
                              type="submit"
                              className="rounded-md bg-black px-4 py-2 text-white"
                            >
                              Mark Complete
                            </button>
                          </form>
                        )}
                      </article>
                    );
                  })}
              </div>
            </section>
          ))}
      </div>
    </main>
  );
}