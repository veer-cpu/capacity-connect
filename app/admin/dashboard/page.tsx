import Link from "next/link";

import { getAdminDashboardSummary } from "@/lib/admin/get-dashboard-summary";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminDashboard() {
  await requireRole("admin");
  const summary = await getAdminDashboardSummary();

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          CAPACITY CONNECT Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          MoES/IMD workforce capacity and learning overview.
        </p>
      </div>

      <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total Users" value={summary.totalUsers} />
        <SummaryCard label="Pending Approval" value={summary.pendingUsers} />
        <SummaryCard label="Active Trainees" value={summary.activeTrainees} />
        <SummaryCard label="Active Trainers" value={summary.activeTrainers} />
        <SummaryCard
          label="Published Courses"
          value={summary.publishedCourses}
        />
        <SummaryCard
          label="Critical Gap Groups"
          value={summary.criticalGapGroups}
          emphasis={summary.criticalGapGroups > 0}
        />
        <SummaryCard
          label="High Gap Groups"
          value={summary.highGapGroups}
          emphasis={summary.highGapGroups > 0}
        />
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Administrative Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ActionCard href="/admin/users" title="User Management" />
          <ActionCard href="/admin/courses" title="Course Management" />
          <ActionCard
            href="/admin/trainer-competencies"
            title="Trainer Competency Verification"
          />
          <ActionCard
            href="/admin/heatmap"
            title="Organizational Competency Heatmap"
          />
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Capacity Health</h2>
        <p className="mt-3 text-gray-600">
          {summary.criticalGapGroups > 0
            ? "Critical capacity gaps require attention."
            : summary.highGapGroups > 0
              ? "High-priority capacity gaps are present."
              : "No major organizational capacity gaps detected."}
        </p>
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm ${
        emphasis ? "border-red-200" : ""
      }`}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold ${
          emphasis ? "text-red-700" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ActionCard({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
    >
      <span className="font-medium">{title}</span>
      <span className="mt-2 block text-sm text-gray-500">Open section</span>
    </Link>
  );
}
