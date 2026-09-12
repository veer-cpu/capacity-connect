import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/require-role";
import { getAdminReportsData } from "@/lib/admin/get-reports-data";
import { AdminReportsDashboard } from "@/components/admin/reports/admin-reports-dashboard";

export default async function AdminReportsPage() {
  await requireRole("admin");

  const reportsData = await getAdminReportsData();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports & Exports"
        description="Operational, competency and training-effectiveness reports for capacity planning."
        actions={
          <Link
            href="/admin/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />

      <AdminReportsDashboard data={reportsData} />
    </div>
  );
}
