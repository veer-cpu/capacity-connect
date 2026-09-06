import Link from "next/link";

import {
  getStaffDevelopmentPlanDetail,
  type StaffDevelopmentPlanDetail,
} from "@/lib/development-plan/get-staff-plan-detail";
import { requireRole } from "@/lib/auth/require-role";

type PageProps = { params: Promise<{ planId: string }> };

export default async function AdminDevelopmentPlanDetailPage({
  params,
}: PageProps) {
  await requireRole("admin");
  const { planId } = await params;
  const plan = await getStaffDevelopmentPlanDetail(planId);

  if (!plan)
    return (
      <main className="p-8">
        <Link href="/admin/development-plans" className="text-sm text-gray-500">
          Back to development plans
        </Link>
        <p className="mt-6 text-gray-600">
          Development plan not found or unavailable.
        </p>
      </main>
    );

  return (
    <main className="mx-auto max-w-7xl p-8">
      <Link
        href="/admin/development-plans"
        className="text-sm text-gray-500 hover:text-black"
      >
        Back to development plans
      </Link>
      <div className="mt-4 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">{plan.title}</h1>
        <div className="mt-4 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
          <span>Trainee: {plan.traineeName ?? "Unnamed trainee"}</span>
          <span>Department: {plan.department ?? "—"}</span>
          <span>Designation: {plan.designation ?? "—"}</span>
          <span>Status: {plan.status}</span>
          <span>Started: {formatDate(plan.startDate)}</span>
          <span>Target: {formatDate(plan.targetDate)}</span>
        </div>
      </div>
      <div className="mt-8 space-y-5">
        {plan.items.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">
                  Step {item.sequenceOrder}
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  {item.competencyName}
                </h2>
              </div>
              <span className="rounded-full border px-2.5 py-1 text-xs">
                {item.status}
              </span>
            </div>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <span>
                Original Current: {formatScore(item.originalCurrentScore)}
              </span>
              <span>
                Latest Current: {formatScore(item.latestCurrentScore)}
              </span>
              <span>Target: {formatScore(item.targetScore)}</span>
              <span>Original Gap: {formatScore(item.originalGapScore)}</span>
              <span>Latest Gap: {formatScore(item.latestGapScore)}</span>
              <span>Original Priority: {item.originalPriority}</span>
              <span>Latest Priority: {item.latestPriority ?? "—"}</span>
              <span>Last Evaluated: {formatDate(item.lastEvaluatedAt)}</span>
            </div>
            <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
              <span>
                Recommended Course: {item.recommendedCourseTitle ?? "None"}
              </span>
              <span>
                Recommended Trainer: {item.recommendedTrainerName ?? "None"}
              </span>
            </div>
            {item.rationale && (
              <p className="mt-5 text-sm text-gray-600">{item.rationale}</p>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

function formatScore(value: number | null) {
  return value === null ? "—" : value.toFixed(1);
}
function formatDate(value: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}
