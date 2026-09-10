import { notFound, redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { getTraineeCourseFeedback } from "@/lib/trainee/get-course-feedback";
import { getTraineeCourseResources } from "@/lib/trainee/get-course-resources";

import { markLessonComplete } from "../actions";
import { submitCourseFeedback } from "./actions";

type LearningPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LearningPage({ params }: LearningPageProps) {
  const { user } = await requireRole("trainee");

  const { slug } = await params;

  const supabase = await createClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select(
      `
        id,
        title,
        slug,
        trainer_id,

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
      `,
    )
    .eq("slug", slug)
.in("status", ["published", "archived"])
.single();

if (courseError) {
  console.error("Unable to load trainee course:", courseError);
  throw new Error("Unable to load course.");
}

if (!course) {
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
  .in("status", ["active", "completed"])
  .maybeSingle()

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
      .map((row) => row.lesson_id) ?? [],
  );

  const resources = await getTraineeCourseResources(course.id);
  const feedback = await getTraineeCourseFeedback(course.id);

  const formatBytes = (bytes: number | null) => {
    if (bytes === null || bytes === undefined) {
      return "Unknown size";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    const units = ["KB", "MB", "GB"];
    let value = bytes / 1024;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }

    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-semibold">{course.title}</h1>

      <div className="mt-4">
        <p className="text-sm text-gray-600">Course Progress</p>

        <div className="mt-2 h-3 overflow-hidden rounded bg-gray-200">
          <div
            className="h-full bg-black"
            style={{
              width: `${Number(enrollment.progress_percentage)}%`,
            }}
          />
        </div>

        <p className="mt-2 text-sm">
          {Number(enrollment.progress_percentage)}% complete
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Learning Materials</h2>

        {resources.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">
            No learning materials have been uploaded yet.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {resources.map((resource) => (
              <article key={resource.id} className="rounded-xl border p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{resource.title}</h3>
                    {resource.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {resource.description}
                      </p>
                    )}
                  </div>

                  {resource.signedUrl ? (
                    <a
                      href={resource.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-md bg-black px-4 py-2 text-sm text-white"
                    >
                      Open Resource
                    </a>
                  ) : (
                    <span className="rounded-md border px-3 py-2 text-sm text-gray-500">
                      Preview unavailable
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>Type: {resource.resourceType}</span>
                  <span>Size: {formatBytes(resource.fileSizeBytes)}</span>
                  <span>
                    {resource.lessonId ? "Linked to lesson" : "Course-wide"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Course Feedback</h2>

        <form action={submitCourseFeedback} className="mt-5 space-y-5">
          <input type="hidden" name="courseId" value={course.id} />
          <input type="hidden" name="courseSlug" value={course.slug} />

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Course Rating</span>
            <select
              name="courseRating"
              defaultValue={feedback?.courseRating ?? ""}
              required
              className="rounded-md border px-3 py-2"
            >
              <option value="" disabled>
                Select rating
              </option>
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>
                  {rating}
                </option>
              ))}
            </select>
          </label>

          {course.trainer_id && (
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Trainer Rating</span>
              <select
                name="trainerRating"
                defaultValue={feedback?.trainerRating ?? ""}
                required
                className="rounded-md border px-3 py-2"
              >
                <option value="" disabled>
                  Select rating
                </option>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Comments</span>
            <textarea
              name="comments"
              maxLength={1000}
              rows={4}
              defaultValue={feedback?.comments ?? ""}
              className="w-full rounded-md border px-3 py-2"
            />
          </label>

          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-sm text-white"
          >
            {feedback ? "Update Feedback" : "Submit Feedback"}
          </button>
        </form>
      </section>

      <div className="mt-10 space-y-8">
        {course.modules
          ?.sort((a, b) => a.position - b.position)
          .map((module) => (
            <section key={module.id}>
              <h2 className="text-xl font-semibold">{module.title}</h2>

              <div className="mt-4 space-y-4">
                {module.lessons
                  ?.sort((a, b) => a.position - b.position)
                  .map((lesson) => {
                    const completed = completedLessonIds.has(lesson.id);

                    return (
                      <article
                        key={lesson.id}
                        className="rounded-xl border p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{lesson.title}</h3>

                            {lesson.description && (
                              <p className="mt-2 text-sm text-gray-600">
                                {lesson.description}
                              </p>
                            )}
                          </div>

                          <span className="text-sm">
                            {completed ? "Completed" : "Not completed"}
                          </span>
                        </div>

                        {lesson.lesson_type === "text" && lesson.content && (
                          <div className="mt-5 rounded-lg bg-gray-50 p-4">
                            <p>{lesson.content}</p>
                          </div>
                        )}

                        {!completed && (
                          <form action={markLessonComplete} className="mt-5">
                            <input
                              type="hidden"
                              name="enrollmentId"
                              value={enrollment.id}
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
