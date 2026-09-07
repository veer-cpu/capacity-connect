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
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getStaffDevelopmentPlanDetail,
  type StaffDevelopmentPlanDetail,
} from "@/lib/development-plan/get-staff-plan-detail";
import { requireRole } from "@/lib/auth/require-role";

type PageProps = { params: Promise<{ planId: string }> };

export default async function TrainerDevelopmentPlanDetailPage({
  params,
}: PageProps) {
  await requireRole("trainer");
  const { planId } = await params;
  const plan = await getStaffDevelopmentPlanDetail(planId);
  if (!plan)
    return (
      <Card>
        <CardContent className="p-8 text-center">
          Development plan not found or unavailable.
        </CardContent>
      </Card>
    );
  return <PlanDetail plan={plan} />;
}

function PlanDetail({ plan }: { plan: StaffDevelopmentPlanDetail }) {
  return (
    <div className="space-y-8">
      <PageHeader
        title={plan.title}
        description="Review the learner's competency-development roadmap and current evaluation details."
        actions={
          <Link
            href="/trainer/development-plans"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to development plans
          </Link>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Trainee Summary</CardTitle>
          <CardDescription>
            {plan.traineeName ?? "Unnamed trainee"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Department" value={plan.department ?? "—"} />
            <Detail label="Designation" value={plan.designation ?? "—"} />
            <Detail
              label="Status"
              value={<StatusBadge status={plan.status} />}
            />
            <Detail label="Started" value={formatDate(plan.startDate)} />
            <Detail label="Target Date" value={formatDate(plan.targetDate)} />
          </div>
        </CardContent>
      </Card>
      <Separator />
      <div className="space-y-5">
        {plan.items.map((item) => (
          <PlanItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function PlanItem({
  item,
}: {
  item: StaffDevelopmentPlanDetail["items"][number];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">
              Step {item.sequenceOrder}
            </p>
            <CardTitle className="mt-1">{item.competencyName}</CardTitle>
          </div>
          <StatusBadge status={item.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Detail
            label="Original Current"
            value={formatScore(item.originalCurrentScore)}
          />
          <Detail
            label="Latest Current"
            value={formatScore(item.latestCurrentScore)}
          />
          <Detail label="Target" value={formatScore(item.targetScore)} />
          <Detail
            label="Original Gap"
            value={formatScore(item.originalGapScore)}
          />
          <Detail label="Latest Gap" value={formatScore(item.latestGapScore)} />
          <Detail
            label="Original Priority"
            value={<StatusBadge status={item.originalPriority} />}
          />
          <Detail
            label="Latest Priority"
            value={
              item.latestPriority ? (
                <StatusBadge status={item.latestPriority} />
              ) : (
                "—"
              )
            }
          />
          <Detail
            label="Last Evaluated"
            value={formatDate(item.lastEvaluatedAt)}
          />
        </div>
        <Separator />
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <Detail
            label="Recommended Course"
            value={item.recommendedCourseTitle ?? "None"}
          />
          <Detail
            label="Recommended Trainer"
            value={item.recommendedTrainerName ?? "None"}
          />
        </div>
        {item.rationale && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Rationale
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{item.rationale}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 font-medium">{value}</div>
    </div>
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
