import Link from "next/link";

import { requireRole } from "@/lib/auth/require-role";
import { getStaffDevelopmentPlans } from "@/lib/development-plan/get-staff-plans";

export default async function AdminDevelopmentPlansPage() {
  await requireRole("admin");
  const plans = await getStaffDevelopmentPlans();

  return (
    <main className="mx-auto max-w-7xl p-8">
      <Link
        href="/admin/dashboard"
        className="text-sm text-gray-500 hover:text-black"
      >
        Back to dashboard
      </Link>
      <h1 className="mt-2 text-3xl font-semibold">
        Workforce Development Plans
      </h1>
      <p className="mt-2 text-gray-600">
        Monitor competency-development progress across the organization.
      </p>
      <PlansTable plans={plans} />
    </main>
  );
}

function PlansTable({
  plans,
}: {
  plans: Awaited<ReturnType<typeof getStaffDevelopmentPlans>>;
}) {
  if (plans.length === 0)
    return (
      <div className="mt-8 rounded-xl border border-dashed p-8 text-center text-gray-500">
        No development plans are available.
      </div>
    );
  return (
    <div className="mt-8 overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3">Trainee</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Target Date</th>
              <th className="px-4 py-3">View Plan</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.planId} className="border-t">
                <td className="px-4 py-4 font-medium">
                  {plan.traineeName ?? "Unnamed trainee"}
                </td>
                <td className="px-4 py-4">{plan.department ?? "—"}</td>
                <td className="px-4 py-4">{plan.planTitle}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full border px-2.5 py-1 text-xs">
                    {plan.planStatus}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {plan.progressPercentage.toFixed(0)}%
                </td>
                <td className="px-4 py-4">{formatDate(plan.targetDate)}</td>
                <td className="px-4 py-4">
                  <Link
                    className="rounded-md border px-3 py-2 text-xs hover:bg-gray-50"
                    href={`/admin/development-plans/${plan.planId}`}
                  >
                    View Plan
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}
