import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    attemptId: string;
  }>;
};

export default async function AssessmentResultPage({
  params,
}: PageProps) {
  const { user } = await requireRole("trainee");

  const { attemptId } = await params;

  const supabase = await createClient();

  const { data: attempt, error } = await supabase
    .from("assessment_attempts")
    .select(`
      id,
      score,
      percentage,
      passed,
      submitted_at,

      assessments (
        title,
        passing_score
      )
    `)
    .eq("id", attemptId)
    .eq("trainee_id", user.id)
    .single();

  if (error || !attempt) {
    notFound();
  }

  const assessment = Array.isArray(attempt.assessments)
    ? attempt.assessments[0]
    : attempt.assessments;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-semibold">
        Assessment Result
      </h1>

      <p className="mt-4 text-lg">
        {assessment?.title}
      </p>

      <div className="mt-8 rounded-xl border p-6">
        <p>
          Score:{" "}
          <strong>{Number(attempt.score)}</strong>
        </p>

        <p className="mt-2">
          Percentage:{" "}
          <strong>
            {Number(attempt.percentage)}%
          </strong>
        </p>

        <p className="mt-2">
          Result:{" "}
          <strong>
            {attempt.passed ? "Passed" : "Not Passed"}
          </strong>
        </p>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Competency impact will be calculated in the next
        development stage.
      </p>
    </main>
  );
}