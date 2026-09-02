import Link from "next/link";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export default async function AssessmentsPage() {
  await requireRole("trainee");

  const supabase = await createClient();

  const { data: assessments, error } = await supabase
    .from("assessments")
    .select(`
      id,
      title,
      description,
      passing_score,
      deadline,
      courses (
        title
      )
    `)
    .eq("status", "published")
    .order("created_at");

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">
          Assessments
        </h1>

        <p className="mt-4">
          Unable to load assessments.
        </p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">
        Assessments
      </h1>

      <div className="mt-8 space-y-4">
        {assessments?.map((assessment) => {
          const course = Array.isArray(assessment.courses)
            ? assessment.courses[0]
            : assessment.courses;

          return (
            <article
              key={assessment.id}
              className="rounded-xl border p-5"
            >
              <p className="text-sm text-gray-500">
                {course?.title}
              </p>

              <h2 className="mt-2 font-semibold">
                {assessment.title}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {assessment.description}
              </p>

              <p className="mt-3 text-sm">
                Passing score:{" "}
                {Number(assessment.passing_score)}%
              </p>

              <Link
                href={`/trainee/assessments/${assessment.id}`}
                className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-white"
              >
                Start Assessment
              </Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}