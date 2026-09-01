import Link from "next/link";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export default async function MyLearningPage() {
  const { user } = await requireRole("trainee");

  const supabase = await createClient();

  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select(`
      id,
      status,
      progress_percentage,
      enrolled_at,

      courses (
        id,
        title,
        slug,
        description,
        category,
        difficulty
      )
    `)
    .eq("trainee_id", user.id)
    .order("enrolled_at", {
      ascending: false,
    });

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">
          My Learning
        </h1>

        <p className="mt-4">
          Unable to load your courses.
        </p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">
        My Learning
      </h1>

      <p className="mt-2 text-gray-600">
        Continue your enrolled training.
      </p>

      {!enrollments?.length ? (
        <div className="mt-8 rounded-xl border p-6">
          <p>
            You haven't enrolled in any courses yet.
          </p>

          <Link
            href="/courses"
            className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-white"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {enrollments.map((enrollment) => {
            const course = Array.isArray(enrollment.courses)
              ? enrollment.courses[0]
              : enrollment.courses;

            if (!course) {
              return null;
            }

            const progress = Number(
              enrollment.progress_percentage
            );

            return (
              <article
                key={enrollment.id}
                className="rounded-xl border p-5"
              >
                <p className="text-sm text-gray-500">
                  {course.category}
                </p>

                <h2 className="mt-2 text-lg font-semibold">
                  {course.title}
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  {course.description}
                </p>

                <div className="mt-5">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded bg-gray-200">
                    <div
                      className="h-full bg-black"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <Link
                  href={`/courses/${course.slug}`}
                  className="mt-5 inline-block rounded-md border px-4 py-2 text-sm"
                >
                  View Course
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}