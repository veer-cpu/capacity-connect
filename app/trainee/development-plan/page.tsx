import Link from "next/link";

import { buildDevelopmentPlanPreview } from "@/lib/competency/build-development-plan";
import { getActiveDevelopmentPlan } from "@/lib/competency/get-development-plan";
import { requireRole } from "@/lib/auth/require-role";
import {
  createDevelopmentPlan,
  updateDevelopmentPlanItemStatus,
} from "./actions";

export default async function DevelopmentPlanPage() {
  await requireRole("trainee");
  const plan = await getActiveDevelopmentPlan();

  return plan ? <ActivePlan plan={plan} /> : <PlanPreview />;
}

async function PlanPreview() {
  const preview = await buildDevelopmentPlanPreview();

  return (
    <main className="mx-auto max-w-7xl p-8">
      <Header />
      <section className="mt-8">
        {preview.items.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
            No active competency gaps are available for a development plan.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Sequence</th>
                    <th className="px-4 py-3">Competency</th>
                    <th className="px-4 py-3">Current</th>
                    <th className="px-4 py-3">Target</th>
                    <th className="px-4 py-3">Gap</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Recommended Course</th>
                    <th className="px-4 py-3">Recommended Trainer</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.items.map((item) => (
                    <tr key={item.competencyId} className="border-t">
                      <td className="px-4 py-4">{item.sequenceOrder}</td>
                      <td className="px-4 py-4 font-medium">
                        {item.competencyName}
                      </td>
                      <td className="px-4 py-4">
                        {item.currentScore.toFixed(1)}
                      </td>
                      <td className="px-4 py-4">
                        {item.targetScore.toFixed(1)}
                      </td>
                      <td className="px-4 py-4">{item.gapScore.toFixed(1)}</td>
                      <td className="px-4 py-4">
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td className="px-4 py-4">
                        {item.recommendedCourse?.title ?? "None"}
                      </td>
                      <td className="px-4 py-4">
                        {item.recommendedTrainer?.fullName ?? "None"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form
              action={createDevelopmentPlan}
              className="mt-8 max-w-xl space-y-4 rounded-xl border bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold">
                Generate Development Plan
              </h2>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Plan title</span>
                <input
                  name="title"
                  required
                  maxLength={120}
                  className="w-full rounded-md border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Target date</span>
                <input
                  name="targetDate"
                  type="date"
                  className="rounded-md border px-3 py-2"
                />
              </label>
              <button
                type="submit"
                className="rounded-md bg-black px-4 py-2 text-sm text-white"
              >
                Generate Development Plan
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

function ActivePlan({
  plan,
}: {
  plan: Awaited<ReturnType<typeof getActiveDevelopmentPlan>> & object;
}) {
  const trackableItems = plan.items.filter((item) => item.status !== "skipped");
  const completedItems = trackableItems.filter(
    (item) => item.status === "completed",
  ).length;
  const progress =
    trackableItems.length === 0
      ? 0
      : (completedItems / trackableItems.length) * 100;

  return (
    <main className="mx-auto max-w-7xl p-8">
      <Header />
      <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">{plan.title}</h2>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Started: {formatDate(plan.startDate)}</span>
          <span>Target: {formatDate(plan.targetDate)}</span>
          <span>Status: {plan.status}</span>
        </div>
        <div className="mt-5">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded bg-gray-200">
            <div
              className="h-full bg-black"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        {plan.items.map((item) => (
          <article key={item.id} className="rounded-xl border p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">
                  Step {item.sequenceOrder}
                </p>
                <h3 className="mt-1 text-xl font-semibold">
                  {item.competencyName}
                </h3>
              </div>
              <PriorityBadge priority={item.priority} />
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <span>Current: {item.currentScore.toFixed(1)}</span>
              <span>Target: {item.targetScore.toFixed(1)}</span>
              <span>Gap: {item.gapScore.toFixed(1)}</span>
            </div>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <div>
                Course:{" "}
                {item.recommendedCourseSlug ? (
                  <Link
                    className="text-blue-700 hover:underline"
                    href={`/trainee/courses/${item.recommendedCourseSlug}`}
                  >
                    {item.recommendedCourseTitle}
                  </Link>
                ) : (
                  "None"
                )}
              </div>
              <div>Trainer: {item.recommendedTrainerName ?? "None"}</div>
            </div>
            {item.rationale && (
              <p className="mt-4 text-sm text-gray-600">{item.rationale}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border px-3 py-1 text-sm">
                {item.status}
              </span>
              {item.status === "pending" && (
                <StatusForm
                  itemId={item.id}
                  statuses={["in_progress", "skipped"]}
                  labels={["Start", "Skip"]}
                />
              )}
              {item.status === "in_progress" && (
                <StatusForm
                  itemId={item.id}
                  statuses={["completed", "skipped"]}
                  labels={["Complete", "Skip"]}
                />
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function StatusForm({
  itemId,
  statuses,
  labels,
}: {
  itemId: string;
  statuses: string[];
  labels: string[];
}) {
  return (
    <div className="flex gap-2">
      {statuses.map((status, index) => (
        <form key={status} action={updateDevelopmentPlanItemStatus}>
          <input type="hidden" name="itemId" value={itemId} />
          <input type="hidden" name="status" value={status} />
          <button
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            type="submit"
          >
            {labels[index]}
          </button>
        </form>
      ))}
    </div>
  );
}

function Header() {
  return (
    <div>
      <Link
        href="/trainee/dashboard"
        className="text-sm text-gray-500 hover:text-black"
      >
        Back to dashboard
      </Link>
      <h1 className="mt-2 text-3xl font-semibold">
        Personalized Development Plan
      </h1>
      <p className="mt-2 text-gray-600">
        A competency-driven learning roadmap based on your current capacity
        gaps.
      </p>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium">
      {priority}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}
