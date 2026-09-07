import Link from "next/link";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export default async function AssessmentsPage() {
  await requireRole("trainee");

  const supabase = await createClient();

  const { data: assessments, error } = await supabase
    .from("assessments")
    .select(
      `
      id,
      title,
      description,
      passing_score,
      deadline,
      status,
      courses (
        title
      )
    `,
    )
    .in("status", ["published", "closed"])
    .order("created_at");

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">Assessments</h1>

        <p className="mt-4">Unable to load assessments.</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Assessments</h1>

      <div className="mt-8 space-y-4">
        {assessments?.map((assessment) => {
          const course = Array.isArray(assessment.courses)
            ? assessment.courses[0]
            : assessment.courses;

          const deadlinePassed = Boolean(
            assessment.deadline &&
            new Date(assessment.deadline).getTime() <= Date.now(),
          );

          return (
            <article key={assessment.id} className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">{course?.title}</p>

              <h2 className="mt-2 font-semibold">{assessment.title}</h2>

              <p className="mt-2 text-sm font-medium capitalize">
                Status: {assessment.status}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                {assessment.description}
              </p>

              <p className="mt-3 text-sm">
                Passing score: {Number(assessment.passing_score)}%
              </p>

              <p className="mt-2 text-sm">
                Deadline:{" "}
                {assessment.deadline
                  ? new Date(assessment.deadline).toLocaleString()
                  : "No deadline"}
              </p>

              {assessment.status === "closed" ? (
                <p className="mt-4 font-medium text-slate-700">Closed</p>
              ) : deadlinePassed ? (
                <p className="mt-4 font-medium text-amber-700">
                  Deadline passed
                </p>
              ) : (
                <Link
                  href={`/trainee/assessments/${assessment.id}`}
                  className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-white"
                >
                  Start Assessment
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
