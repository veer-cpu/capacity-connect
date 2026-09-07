import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buildDevelopmentPlanPreview } from "@/lib/competency/build-development-plan";
import {
  getActiveDevelopmentPlan,
  type ActiveDevelopmentPlan,
} from "@/lib/competency/get-development-plan";
import { requireRole } from "@/lib/auth/require-role";
import {
  createDevelopmentPlan,
  refreshDevelopmentPlan,
  updateDevelopmentPlanItemStatus,
} from "./actions";

export default async function DevelopmentPlanPage() {
  await requireRole("trainee");
  const plan = await getActiveDevelopmentPlan();
  return plan ? <ActivePlan plan={plan} /> : <PlanPreview />;
}

async function PlanPreview() {
  const preview = await buildDevelopmentPlanPreview();
  return (
    <div className="space-y-8">
      <PageHeader
        title="Personalized Development Plan"
        description="A competency-driven learning roadmap based on your current capacity gaps."
        actions={
          <Link
            href="/trainee/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />
      {preview.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No active competency gaps are available for a development plan.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Plan Preview</CardTitle>
              <CardDescription>
                Review the recommended sequence before creating your development
                plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Step</TableHead>
                    <TableHead>Competency</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Gap</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Recommended Course</TableHead>
                    <TableHead>Recommended Trainer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.items.map((item) => (
                    <TableRow key={item.competencyId}>
                      <TableCell>{item.sequenceOrder}</TableCell>
                      <TableCell className="font-medium">
                        {item.competencyName}
                      </TableCell>
                      <TableCell>{item.currentScore.toFixed(1)}</TableCell>
                      <TableCell>{item.targetScore.toFixed(1)}</TableCell>
                      <TableCell>{item.gapScore.toFixed(1)}</TableCell>
                      <TableCell>
                        <StatusBadge status={item.priority} />
                      </TableCell>
                      <TableCell>
                        {item.recommendedCourse?.title ?? "None"}
                      </TableCell>
                      <TableCell>
                        {item.recommendedTrainer?.fullName ?? "None"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Create Development Plan</CardTitle>
              <CardDescription>
                Save this personalized roadmap and track progress over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={createDevelopmentPlan}
                className="grid gap-4 sm:grid-cols-2"
              >
                <label className="space-y-1.5 text-sm">
                  <span className="block font-medium">Plan title</span>
                  <Input name="title" required maxLength={120} />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="block font-medium">Target date</span>
                  <Input name="targetDate" type="date" />
                </label>
                <div>
                  <Button type="submit">Create Development Plan</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function ActivePlan({ plan }: { plan: ActiveDevelopmentPlan }) {
  const trackable = plan.items.filter((item) => item.status !== "skipped");
  const completed = trackable.filter(
    (item) => item.status === "completed",
  ).length;
  const progress =
    trackable.length === 0 ? 0 : (completed / trackable.length) * 100;
  return (
    <div className="space-y-8">
      <PageHeader
        title="Personalized Development Plan"
        description="A competency-driven learning roadmap based on your current capacity gaps."
        actions={
          <Link
            href="/trainee/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />
      <form action={refreshDevelopmentPlan}>
        <Button type="submit" variant="outline">
          Re-evaluate Plan
        </Button>
      </form>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>{plan.title}</CardTitle>
              <CardDescription>
                Started {formatDate(plan.startDate)} · Target{" "}
                {formatDate(plan.targetDate)}
              </CardDescription>
            </div>
            <StatusBadge status={plan.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Progress value={progress} />
            <span className="text-sm tabular-nums">{progress.toFixed(0)}%</span>
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

function PlanItem({ item }: { item: ActiveDevelopmentPlan["items"][number] }) {
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
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="Original Current" value={item.currentScore} />
          <Detail
            label="Latest Current"
            value={item.latestCurrentScore ?? item.currentScore}
          />
          <Detail label="Target" value={item.targetScore} />
          <Detail label="Original Gap" value={item.gapScore} />
          <Detail
            label="Latest Gap"
            value={item.latestGapScore ?? item.gapScore}
          />
          <Detail
            label="Original Priority"
            value={<StatusBadge status={item.priority} />}
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
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <Detail
            label="Recommended Course"
            value={
              item.recommendedCourseSlug ? (
                <Link
                  className="text-primary hover:underline"
                  href={`/trainee/courses/${item.recommendedCourseSlug}`}
                >
                  {item.recommendedCourseTitle}
                </Link>
              ) : (
                "None"
              )
            }
          />
          <Detail
            label="Recommended Trainer"
            value={item.recommendedTrainerName ?? "None"}
          />
        </div>
        {item.rationale && (
          <p className="text-sm text-muted-foreground">{item.rationale}</p>
        )}
        {item.status === "pending" && (
          <StatusForm
            itemId={item.id}
            statuses={["in_progress", "skipped"]}
            labels={["Start", "Skip"]}
          />
        )}
        {item.status === "in_progress" && (
          <StatusForm
            itemId={item.id}
            statuses={["completed", "skipped"]}
            labels={["Complete", "Skip"]}
          />
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
function StatusForm({
  itemId,
  statuses,
  labels,
}: {
  itemId: string;
  statuses: string[];
  labels: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status, index) => (
        <form key={status} action={updateDevelopmentPlanItemStatus}>
          <input type="hidden" name="itemId" value={itemId} />
          <input type="hidden" name="status" value={status} />
          <Button
            type="submit"
            variant={status === "skipped" ? "outline" : "default"}
          >
            {labels[index]}
          </Button>
        </form>
      ))}
    </div>
  );
}
function formatDate(value: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}
