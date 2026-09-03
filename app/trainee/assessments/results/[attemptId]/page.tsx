import Link from "next/link";
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

  const { data: attempt, error: attemptError } = await supabase
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

  if (attemptError || !attempt) {
    notFound();
  }

  const assessment = Array.isArray(attempt.assessments)
    ? attempt.assessments[0]
    : attempt.assessments;

  // Fetch competency impact recorded for this assessment attempt
  const { data: historyItems } = await supabase
    .from("competency_score_history")
    .select(`
      id,
      competency_id,
      previous_score,
      assessment_score,
      new_score,
      competencies (
        id,
        name,
        category,
        default_target_score
      )
    `)
    .eq("source_type", "assessment")
    .eq("source_id", attemptId)
    .eq("user_id", user.id);

  const competencyIds = historyItems?.map((h) => h.competency_id) || [];

  const { data: skillGaps } =
    competencyIds.length > 0
      ? await supabase
          .from("skill_gaps")
          .select(`
            competency_id,
            current_score,
            target_score,
            gap_score,
            priority,
            status
          `)
          .eq("trainee_id", user.id)
          .in("competency_id", competencyIds)
      : { data: [] };

  const skillGapsMap = new Map(
    skillGaps?.map((sg) => [sg.competency_id, sg]) || []
  );

  return (
    <main className="mx-auto max-w-3xl p-6 sm:p-8">
      <div className="mb-6">
        <Link
          href="/trainee/assessments"
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to Assessments
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">
          Assessment Result
        </h1>
        <p className="mt-1 text-gray-600">
          {assessment?.title}
        </p>
      </div>

      {/* Overall Assessment Performance Card */}
      <section className="rounded-xl border p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Overall Performance
        </h2>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-3xl font-bold">
              {Number(attempt.percentage)}%
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Score: <strong>{Number(attempt.score)}</strong> points | Passing threshold:{" "}
              {Number(assessment?.passing_score)}%
            </p>
          </div>

          <div>
            <span
              className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${
                attempt.passed
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {attempt.passed ? "PASSED" : "NOT PASSED"}
            </span>
          </div>
        </div>
      </section>

      {/* Competency Impact Section */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">
          Competency Impact & Skill Gap Updates
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          How this assessment updated your competency levels and reduced skill gaps.
        </p>

        {!historyItems || historyItems.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed p-6 text-center text-gray-500">
            No specific competency impact recorded for this assessment.
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {historyItems.map((item) => {
              const competency = Array.isArray(item.competencies)
                ? item.competencies[0]
                : item.competencies;

              const prevScore = Number(item.previous_score);
              const assessScore = Number(item.assessment_score);
              const updatedScore = Number(item.new_score);

              const gapRecord = skillGapsMap.get(item.competency_id);
              const targetScore = gapRecord
                ? Number(gapRecord.target_score)
                : Number(competency?.default_target_score ?? 100);

              const remainingGap = gapRecord
                ? Number(gapRecord.gap_score)
                : Math.max(targetScore - updatedScore, 0);

              const priority = gapRecord?.priority ?? "medium";
              const status =
                gapRecord?.status ??
                (remainingGap === 0 ? "resolved" : "open");

              const diff = updatedScore - prevScore;
              let diffDisplay = "0 pts";
              if (diff > 0) {
                const formatted = Number(diff.toFixed(1));
                diffDisplay = `+${formatted} pts`;
              } else if (diff < 0) {
                const formatted = Number(diff.toFixed(1));
                diffDisplay = `${formatted} pts`;
              }

              return (
                <div
                  key={item.id}
                  className="rounded-xl border p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {competency?.name}
                      </h3>
                      {competency?.category && (
                        <span className="text-xs text-gray-500">
                          {competency.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">
                        Priority: {priority}
                      </span>
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${
                          status === "resolved"
                            ? "bg-emerald-100 text-emerald-800"
                            : status === "improving"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        Status: {status}
                      </span>
                    </div>
                  </div>

                  {/* Competency Scores Breakdown Grid */}
                  <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500">Previous Score</p>
                      <p className="mt-1 font-semibold text-gray-900">{prevScore}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Assessment Score</p>
                      <p className="mt-1 font-semibold text-gray-900">{assessScore}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Updated Score</p>
                      <p className="mt-1 font-semibold text-gray-900">{updatedScore}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Point Improvement</p>
                      <p
                        className={`mt-1 font-semibold ${
                          diff > 0
                            ? "text-emerald-600"
                            : diff < 0
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}
                      >
                        {diffDisplay}
                      </p>
                    </div>
                  </div>

                  {/* Target & Gap Progress Bar */}
                  <div className="mt-6">
                    <div className="mb-2 flex justify-between text-sm text-gray-600">
                      <span>
                        Target Score: <strong>{targetScore}</strong>
                      </span>
                      <span>
                        Remaining Gap: <strong>{remainingGap}</strong>
                      </span>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-black transition-all duration-300"
                        style={{
                          width: `${Math.min(Math.max(updatedScore, 0), 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Action Footer */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="/trainee/competencies"
          className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          View My Competencies
        </Link>
        <Link
          href="/trainee/assessments"
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Assessments
        </Link>
      </div>
    </main>
  );
}
