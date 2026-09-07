import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

export default async function TrainerDevelopmentPlansPage() {
  await requireRole("trainer");
  const plans = await getStaffDevelopmentPlans();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Trainee Development Plans"
        description="Monitor competency-development roadmaps for trainees in your courses."
        actions={
          <Link
            href="/trainer/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />
      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No development plans are available.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Active and Historical Plans</CardTitle>
            <CardDescription>
              Review learner roadmaps and current completion progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Trainee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Target Date</TableHead>
                  <TableHead>Action</TableHead>
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
                    <TableCell>
                      <div className="flex min-w-28 items-center gap-2">
                        <Progress value={plan.progressPercentage} />
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {plan.progressPercentage.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(plan.targetDate)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/trainer/development-plans/${plan.planId}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        View Plan
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}
