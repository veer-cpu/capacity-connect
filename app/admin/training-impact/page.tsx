import Link from "next/link";

import { TrainingImpactDashboard } from "@/components/admin/training-impact-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getAdminTrainingImpact } from "@/lib/admin/get-training-impact";
import { requireRole } from "@/lib/auth/require-role";

export default async function TrainingImpactPage() {
  await requireRole("admin");

  const rows = await getAdminTrainingImpact();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Training Impact Analytics"
        description="Measure whether completed training produces measurable competency improvement and target attainment."
        actions={
          <Link
            href="/admin/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />

      <TrainingImpactDashboard rows={rows} />
    </div>
  );
}
