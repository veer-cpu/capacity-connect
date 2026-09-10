import Link from "next/link";


import {
  ArrowRight,
  Grid3X3,
  Target,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAdminCompetencyHeatmap } from "@/lib/admin/get-competency-heatmap";
import { getAdminDashboardSummary } from "@/lib/admin/get-dashboard-summary";
import { getAdminFeedbackOverview } from "@/lib/admin/get-feedback-overview";
import { requireRole } from "@/lib/auth/require-role";
import { getStaffDevelopmentPlans } from "@/lib/development-plan/get-staff-plans";
import { getAdminCertificates } from "@/lib/certificates/get-admin-certificates";

export default async function AdminDashboard() {
  await requireRole("admin");

  const [summary, heatmap, feedback, plans, certificates] = await Promise.all([
    getAdminDashboardSummary(),
    getAdminCompetencyHeatmap(),
    getAdminFeedbackOverview(),
    getStaffDevelopmentPlans(),
    getAdminCertificates(),
  ]);

  const priorityRisks = heatmap
    .filter((row) => row.riskLevel === "Critical" || row.riskLevel === "High")
    .slice(0, 5);
  const activePlans = plans
    .filter((plan) => plan.planStatus === "active")
    .slice(0, 5);
  const issuedCertificates = certificates.filter(
    (certificate) => !certificate.revokedAt,
  );
  const revokedCertificates = certificates.filter(
    (certificate) => certificate.revokedAt,
  );
  const recentCertificates = certificates
    .slice()
    .sort(
      (left, right) =>
        new Date(right.issuedAt).getTime() - new Date(left.issuedAt).getTime(),
    )
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Capacity Intelligence Dashboard"
        description="Organization-wide view of workforce capability, learning readiness, and capacity-building priorities."
      />

      {summary.pendingUsers > 0 && (
        <Alert>
          <Users className="size-4" />
          <AlertTitle>
            {summary.pendingUsers} user account
            {summary.pendingUsers === 1 ? "" : "s"} waiting for approval.
            <Link
              href="/admin/users"
              className="ml-2 underline underline-offset-4 hover:text-foreground"
            >
              Review Users
            </Link>
          </AlertTitle>
        </Alert>
      )}

      <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          icon={Users}
          label="Active Trainees"
          value={summary.activeTrainees}
        />
        <MetricCard
          icon={Users}
          label="Active Trainers"
          value={summary.activeTrainers}
        />
        <MetricCard
          icon={ClipboardList}
          label="Pending Approvals"
          value={summary.pendingUsers}
        />
        <MetricCard
          icon={BookOpen}
          label="Published Courses"
          value={summary.publishedCourses}
        />
        <MetricCard
          icon={BarChart3}
          label="Critical Gap Groups"
          value={summary.criticalGapGroups}
        />
        <MetricCard
          icon={BarChart3}
          label="High Gap Groups"
          value={summary.highGapGroups}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Priority Capacity Risks</CardTitle>
              <CardDescription>
                Critical and high-risk department competency combinations.
              </CardDescription>
              <CardAction>
                <Link
                  href="/admin/heatmap"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  View Competency Heatmap
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              {priorityRisks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No critical or high-priority competency risks detected.
                </p>
              ) : (
                <div className="space-y-3">
                  {priorityRisks.map((risk) => (
                    <div
                      key={`${risk.department}-${risk.competencyId}`}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{risk.competencyName}</p>
                          <p className="text-sm text-muted-foreground">
                            {risk.department}
                          </p>
                        </div>
                        <StatusBadge status={risk.riskLevel} />
                      </div>
                      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
                        <Metric label="Learners" value={risk.learnerCount} />
                        <Metric
                          label="Avg current"
                          value={formatScore(risk.averageCurrentScore)}
                        />
                        <Metric
                          label="Avg target"
                          value={formatScore(risk.averageTargetScore)}
                        />
                        <Metric
                          label="Avg gap"
                          value={formatScore(risk.averageGap)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workforce Development Plans</CardTitle>
              <CardDescription>
                Active competency-development plans across the workforce.
              </CardDescription>
              <CardAction>
                <Link
                  href="/admin/development-plans"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  View Development Plans
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              {activePlans.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active development plans are available.
                </p>
              ) : (
                <div className="space-y-3">
                  {activePlans.map((plan) => (
                    <div key={plan.planId} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {plan.traineeName ?? "Unnamed trainee"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {plan.department ?? "Department not specified"} ·{" "}
                            {plan.planTitle}
                          </p>
                        </div>
                        <StatusBadge status={plan.planStatus} />
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <Progress value={plan.progressPercentage} />
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {plan.progressPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Target: {formatDate(plan.targetDate)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Feedback</CardTitle>
              <CardDescription>
                Aggregate ratings from submitted training feedback.
              </CardDescription>
              <CardAction>
                <Link
                  href="/admin/feedback"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  View Feedback
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              {feedback.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No training feedback has been submitted yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {feedback.slice(0, 5).map((row) => (
                    <div key={row.trainerId} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium">
                          {row.trainerName ?? "Unnamed trainer"}
                        </p>
                        <Badge variant="outline">
                          {row.feedbackCount} responses
                        </Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                        <Metric
                          label="Trainer rating"
                          value={formatRating(row.averageTrainerRating)}
                        />
                        <Metric
                          label="Course rating"
                          value={formatRating(row.averageCourseRating)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certificate Activity</CardTitle>
              <CardDescription>
                Issued and revoked credentials across the organization.
              </CardDescription>
              <CardAction>
                <Link
                  href="/admin/certificates"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Manage Certificates
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Issued" value={issuedCertificates.length} />
                <Metric label="Revoked" value={revokedCertificates.length} />
              </div>
              {recentCertificates.length > 0 && (
                <div className="mt-4 space-y-2">
                  {recentCertificates.map((certificate) => (
                    <div
                      key={certificate.id}
                      className="flex items-center justify-between gap-3 border-t pt-2 text-sm"
                    >
                      <span className="truncate">
                        {certificate.courseTitle} ·{" "}
                        {certificate.traineeName ?? "Unnamed trainee"}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(certificate.issuedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <section className="space-y-4">
  <div>
    <h2 className="text-xl font-semibold tracking-tight">
      Capacity Intelligence
    </h2>

    <p className="mt-1 text-sm text-muted-foreground">
      Move beyond training activity metrics to
      understand organizational capability,
      competency risk and measurable development
      outcomes.
    </p>
  </div>

  <div className="grid gap-4 lg:grid-cols-3">
    <IntelligenceCard
      title="Competency Heatmap"
      description="Identify departments and capability areas with the highest collective competency gaps."
      href="/admin/heatmap"
      action="View heatmap"
      icon={Target}
    />

    <IntelligenceCard
      title="Capacity Grid"
      description="Inspect employee-by-competency readiness, missing baselines and critical individual skill gaps."
      href="/admin/capacity-grid"
      action="Open capacity grid"
      icon={Grid3X3}
    />

    <IntelligenceCard
      title="Training Impact"
      description="Evaluate whether completed training produced measurable competency improvement and target attainment."
      href="/admin/training-impact"
      action="Analyze impact"
      icon={TrendingUp}
    />
  </div>
</section>

          <Card>
            <CardHeader>
              <CardTitle>Administration Quick Actions</CardTitle>
              <CardDescription>
                Common capacity-management tasks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {adminLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const adminLinks = [
  { label: "Manage Users", href: "/admin/users" },
  { label: "Manage Courses", href: "/admin/courses" },
  { label: "Manage Competencies", href: "/admin/competencies" },
  { label: "Competency Heatmap", href: "/admin/heatmap" },
  { label: "Development Plans", href: "/admin/development-plans" },
  { label: "Certificates", href: "/admin/certificates" },
] as const;

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium tabular-nums">{value}</p>
    </div>
  );
}

function formatScore(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : "0.0";
}

function formatRating(value: number | null) {
  return value === null || !Number.isFinite(value) ? "N/A" : value.toFixed(1);
}

function formatDate(value: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not set" : date.toLocaleDateString();
}
function IntelligenceCard({
  title,
  description,
  href,
  action,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="mb-3 flex size-10 items-center justify-center rounded-lg border bg-muted/40">
          <Icon className="size-5 text-muted-foreground" />
        </div>

        <CardTitle className="text-lg">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <p className="flex-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>

        <Button
          className="mt-5 w-full justify-between"
          variant="outline"
          nativeButton={false}
          render={<Link href={href} />}
        >
          {action}

          <ArrowRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
