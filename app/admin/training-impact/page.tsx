import {
  ArrowUpRight,
  CheckCircle2,
  GraduationCap,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import {
  getAdminTrainingImpact,
  type TrainingImpactRow,
} from "@/lib/admin/get-training-impact";

import { requireRole } from "@/lib/auth/require-role";

export default async function TrainingImpactPage() {
  await requireRole("admin");

  const rows =
    await getAdminTrainingImpact();

  const rowsWithEvidence =
    rows.filter(
      (row) =>
        row.averageImprovement !== null,
    );

  const completedTrainees =
    rows.reduce(
      (total, row) =>
        total + row.completedTrainees,
      0,
    );

  const averageImprovement =
    rowsWithEvidence.length === 0
      ? 0
      : rowsWithEvidence.reduce(
          (total, row) =>
            total +
            (row.averageImprovement ?? 0),
          0,
        ) /
        rowsWithEvidence.length;

  const improvementRate =
    rowsWithEvidence.length === 0
      ? 0
      : rowsWithEvidence.reduce(
          (total, row) =>
            total +
            row.improvementRate,
          0,
        ) /
        rowsWithEvidence.length;

  const targetAttainment =
    rowsWithEvidence.length === 0
      ? 0
      : rowsWithEvidence.reduce(
          (total, row) =>
            total +
            row.targetAttainmentRate,
          0,
        ) /
        rowsWithEvidence.length;

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Capacity Development Effectiveness
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Training Impact Analytics
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Measure whether completed training
          resulted in measurable competency
          improvement instead of relying only
          on course completion statistics.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Completed Learners"
          value={String(completedTrainees)}
          icon={Users}
        />

        <MetricCard
          title="Average Improvement"
          value={`${formatSigned(
            averageImprovement,
          )} pts`}
          icon={TrendingUp}
        />

        <MetricCard
          title="Improvement Rate"
          value={`${improvementRate.toFixed(
            0,
          )}%`}
          icon={ArrowUpRight}
        />

        <MetricCard
          title="Target Attainment"
          value={`${targetAttainment.toFixed(
            0,
          )}%`}
          icon={Target}
        />
      </section>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-medium">
              No training impact data yet
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Impact analytics will appear
              after learners complete mapped
              training and competency evidence
              becomes available.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {rows.map((row) => (
            <ImpactCard
              key={row.courseId}
              row={row}
            />
          ))}
        </section>
      )}
    </main>
  );
}
function ImpactCard({
  row,
}: {
  row: TrainingImpactRow;
}) {
  const hasEvidence =
    row.averageImprovement !== null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>
              {row.courseTitle}
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Trainer: {row.trainerName}
            </p>
          </div>

          {hasEvidence ? (
            <Badge variant="secondary">
              Impact measured
            </Badge>
          ) : (
            <Badge variant="outline">
              Awaiting evidence
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <SmallMetric
            label="Completed"
            value={String(
              row.completedTrainees,
            )}
          />

          <SmallMetric
            label="Measurements"
            value={String(
              row.preTrainingSample,
            )}
          />

          <SmallMetric
            label="Before"
            value={
              row.averageBeforeScore === null
                ? "—"
                : row.averageBeforeScore.toFixed(
                    1,
                  )
            }
          />

          <SmallMetric
            label="After"
            value={
              row.averageAfterScore === null
                ? "—"
                : row.averageAfterScore.toFixed(
                    1,
                  )
            }
          />
        </div>

        {hasEvidence ? (
          <>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Average competency movement
                </span>

                <span className="text-xl font-semibold">
                  {formatSigned(
                    row.averageImprovement ?? 0,
                  )}
                </span>
              </div>
            </div>

            <MetricProgress
              label="Learners showing improvement"
              value={row.improvementRate}
            />

            <MetricProgress
              label="Capability target attainment"
              value={
                row.targetAttainmentRate
              }
            />

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="size-3" />

                {row.improvedTrainees}
                {" "}improved measurements
              </span>

              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="size-3" />

                {row.targetAttainmentCount}
                {" "}target achievements
              </span>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
            This course has not yet produced
            enough paired competency evidence
            for impact measurement.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function MetricProgress({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const safeValue =
    Math.max(
      0,
      Math.min(100, value),
    );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{label}</span>

        <span className="font-medium">
          {safeValue.toFixed(0)}%
        </span>
      </div>

      <Progress value={safeValue} />
    </div>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {value}
      </p>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {value}
          </p>
        </div>

        <Icon className="size-5 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

function formatSigned(
  value: number,
) {
  if (value > 0) {
    return `+${value.toFixed(1)}`;
  }

  return value.toFixed(1);
}