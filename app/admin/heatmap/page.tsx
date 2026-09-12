import Link from "next/link";

import { CapacityGridDashboard } from "@/components/admin/capacity-grid-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getAdminCapacityGrid } from "@/lib/admin/get-capacity-grid";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminCapacityGridPage() {
  await requireRole("admin");

  const rows = await getAdminCapacityGrid();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Capacity Grid & Training Need Analysis"
        description="Organization-wide competency readiness, gaps, and training priorities across organizational units and job roles."
        actions={
          <Link
            href="/admin/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />

      <CapacityGridDashboard rows={rows} />
    </div>
  );
}
