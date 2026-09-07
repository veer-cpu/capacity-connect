import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
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
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { getTrainerFeedbackDetails } from "@/lib/trainer/get-feedback-details";
import { getTrainerFeedbackSummary } from "@/lib/trainer/get-feedback-summary";

export default async function TrainerFeedbackPage() {
  const [summary, details] = await Promise.all([
    getTrainerFeedbackSummary(),
    getTrainerFeedbackDetails(),
  ]);
  const distribution = [
    ["5 Star", summary.fiveStarCount],
    ["4 Star", summary.fourStarCount],
    ["3 Star", summary.threeStarCount],
    ["2 Star", summary.twoStarCount],
    ["1 Star", summary.oneStarCount],
  ] as const;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Training Feedback"
        description="Review learner feedback and identify opportunities to improve training effectiveness."
        actions={
          <Link
            href="/trainer/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Average Trainer Rating"
          value={formatRating(summary.averageTrainerRating)}
        />
        <MetricCard
          label="Average Course Rating"
          value={formatRating(summary.averageCourseRating)}
        />
        <MetricCard label="Feedback Count" value={summary.totalFeedback} />
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
          <CardDescription>
            Aggregate ratings across submitted feedback.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {distribution.map(([label, count]) => (
            <div
              key={label}
              className="flex items-center justify-between border-b pb-3 text-sm last:border-0 last:pb-0"
            >
              <span>{label}</span>
              <Badge variant="secondary">{count}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Anonymous Feedback</CardTitle>
          <CardDescription>
            Comments and ratings are shown without trainee identity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {details.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No trainee feedback is available yet.
            </p>
          ) : (
            <div className="space-y-4">
              {details.map((feedback) => (
                <article
                  key={feedback.feedbackId}
                  className="rounded-lg border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium">{feedback.courseTitle}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Submitted {formatDate(feedback.createdAt)} · Updated{" "}
                        {formatDate(feedback.updatedAt)}
                      </p>
                    </div>
                    <StatusBadge status="Anonymous" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline">
                      Course: {formatRating(feedback.courseRating)}
                    </Badge>
                    <Badge variant="outline">
                      Trainer: {formatRating(feedback.trainerRating)}
                    </Badge>
                  </div>
                  {feedback.comments && (
                    <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">
                      {feedback.comments}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card size="sm">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function formatRating(value: number | null) {
  return value === null || !Number.isFinite(value) ? "N/A" : value.toFixed(1);
}
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}
