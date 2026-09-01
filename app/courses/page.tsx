import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";

export default async function CoursesPage() {
  await requireRole("trainee");

  const supabase = await createClient();

  const { data: courses, error } = await supabase
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
      )
    `)
    .eq("status", "published")
    .order("title");

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">
          Course Catalogue
        </h1>

        <p className="mt-4">
          Unable to load courses.
        </p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div>
        <h1 className="text-2xl font-semibold">
          Course Catalogue
        </h1>

        <p className="mt-2 text-gray-600">
          Explore learning opportunities aligned with your competencies.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courses?.map((course) => (
          <article
            key={course.id}
            className="rounded-xl border p-5"
          >
            <div className="flex gap-2 text-sm text-gray-500">
              <span>{course.category}</span>

              <span>•</span>

              <span className="capitalize">
                {course.difficulty}
              </span>
            </div>

            <h2 className="mt-3 text-lg font-semibold">
              {course.title}
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {course.description}
            </p>

            <p className="mt-4 text-sm">
              Duration:{" "}
              {course.estimated_duration_minutes
                ? `${course.estimated_duration_minutes} minutes`
                : "Not specified"}
            </p>

            <Link
              href={`/courses/${course.slug}`}
              className="mt-5 inline-block rounded-md bg-black px-4 py-2 text-sm text-white"
            >
              View Course
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}