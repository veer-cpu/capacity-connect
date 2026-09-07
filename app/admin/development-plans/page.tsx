import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStaffDevelopmentPlans } from "@/lib/development-plan/get-staff-plans";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminDevelopmentPlansPage() {
  await requireRole("admin");
  const plans = await getStaffDevelopmentPlans();
  return (
    <div className="space-y-8">
      <PageHeader
        title="Workforce Development Plans"
        description="Monitor competency-development progress across the organization."
        actions={
          <Link
            href="/admin/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />
      <PlansTable plans={plans} />
    </div>
  );
}

function PlansTable({
  plans,
}: {
  plans: Awaited<ReturnType<typeof getStaffDevelopmentPlans>>;
}) {
  if (plans.length === 0)
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        No development plans are available.
      </div>
    );
  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Trainee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Target Date</TableHead>
            <TableHead>View Plan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.planId}>
              <TableCell className="font-medium">
                {plan.traineeName ?? "Unnamed trainee"}
              </TableCell>
              <TableCell>{plan.department ?? "—"}</TableCell>
              <TableCell>{plan.planTitle}</TableCell>
              <TableCell>
                <StatusBadge status={plan.planStatus} />
              </TableCell>
              <TableCell>{plan.progressPercentage.toFixed(0)}%</TableCell>
              <TableCell>{formatDate(plan.targetDate)}</TableCell>
              <TableCell>
                <Link
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                  href={`/admin/development-plans/${plan.planId}`}
                >
                  View Plan
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}
