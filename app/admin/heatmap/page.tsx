import Link from "next/link";

import {
  getAdminCompetencyHeatmap,
  type AdminCompetencyHeatmapRow,
} from "@/lib/admin/get-competency-heatmap";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminCompetencyHeatmapPage() {
  await requireRole("admin");

  const rows = await getAdminCompetencyHeatmap();
  const departments = groupByDepartment(rows);
  const departmentCount = departments.length;
  const competencyAreaCount = new Set(rows.map((row) => row.competencyId)).size;
  const usersBelowTarget = rows.reduce(
    (total, row) => total + row.usersBelowTarget,
    0,
  );
  const criticalGapGroups = rows.filter(
    (row) => row.riskLevel === "Critical",
  ).length;

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="text-sm text-gray-500 hover:text-black"
        >
          Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">
          Organizational Competency Heatmap
        </h1>
        <p className="mt-2 text-gray-600">
          Department-wise capacity gaps across MoES/IMD competencies.
        </p>
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <SummaryCard label="Departments" value={departmentCount} />
        <SummaryCard label="Competency Areas" value={competencyAreaCount} />
        <SummaryCard label="Users Below Target" value={usersBelowTarget} />
        <SummaryCard label="Critical Gap Groups" value={criticalGapGroups} />
      </section>

      {departments.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
          No competency data is available yet.
        </div>
      ) : (
        <div className="space-y-8">
          {departments.map(([department, departmentRows]) => (
            <section
              key={department}
              className="overflow-hidden rounded-xl border bg-white shadow-sm"
            >
              <div className="border-b bg-gray-50 px-5 py-4">
                <h2 className="text-xl font-semibold">{department}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Competency</th>
                      <th className="px-4 py-3 font-medium">Learners</th>
                      <th className="px-4 py-3 font-medium">Avg Current</th>
                      <th className="px-4 py-3 font-medium">Avg Target</th>
                      <th className="px-4 py-3 font-medium">Avg Gap</th>
                      <th className="px-4 py-3 font-medium">Below Target</th>
                      <th className="px-4 py-3 font-medium">Critical Gaps</th>
                      <th className="px-4 py-3 font-medium">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentRows.map((row) => (
                      <tr key={row.competencyId} className="border-t">
                        <td className="px-4 py-4 font-medium">
                          {row.competencyName}
                        </td>
                        <td className="px-4 py-4">{row.learnerCount}</td>
                        <td className="px-4 py-4">
                          {formatScore(row.averageCurrentScore)}
                        </td>
                        <td className="px-4 py-4">
                          {formatScore(row.averageTargetScore)}
                        </td>
                        <td className="px-4 py-4 font-medium">
                          {formatScore(row.averageGap)}
                        </td>
                        <td className="px-4 py-4">{row.usersBelowTarget}</td>
                        <td className="px-4 py-4">{row.criticalGapCount}</td>
                        <td className="px-4 py-4">
                          <RiskBadge risk={row.riskLevel} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function groupByDepartment(
  rows: AdminCompetencyHeatmapRow[],
): [string, AdminCompetencyHeatmapRow[]][] {
  const grouped = new Map<string, AdminCompetencyHeatmapRow[]>();

  for (const row of rows) {
    const departmentRows = grouped.get(row.department) ?? [];
    departmentRows.push(row);
    grouped.set(row.department, departmentRows);
  }

  return Array.from(grouped.entries()).map(([department, departmentRows]) => [
    department,
    departmentRows.sort((left, right) => right.averageGap - left.averageGap),
  ]);
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function formatScore(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : "0.0";
}

function RiskBadge({ risk }: { risk: AdminCompetencyHeatmapRow["riskLevel"] }) {
  const styles = {
    Critical: "border-red-200 bg-red-100 text-red-800",
    High: "border-orange-200 bg-orange-100 text-orange-800",
    Medium: "border-amber-200 bg-amber-100 text-amber-800",
    Low: "border-emerald-200 bg-emerald-100 text-emerald-800",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[risk]}`}
    >
      {risk}
    </span>
  );
}
