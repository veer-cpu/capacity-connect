import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTrainerRecommendations } from "@/lib/competency/get-trainer-recommendations";

export default async function TrainerRecommendationsPage() {
  const { activeGaps, recommendations } = await getTrainerRecommendations();
  return (
    <div className="space-y-8">
      <PageHeader
        title="Recommended Trainers"
        description="Trainer recommendations are calculated from your active competency gaps using verified expertise, experience, course alignment, and availability."
        actions={
          <Link
            href="/trainee/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />
      {activeGaps.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">
            Your Active Development Areas
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {activeGaps.map((gap) => (
              <Badge key={gap.competencyId} variant="secondary">
                {gap.competencyName}: {gap.gapScore.toFixed(1)} pt gap
              </Badge>
            ))}
          </div>
        </section>
      )}
      {activeGaps.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No trainer matching required</CardTitle>
            <CardDescription>
              All current competency targets are met. There are no active
              competency gaps requiring trainer support right now.
            </CardDescription>
            <Link
              href="/trainee/competencies"
              className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-4`}
            >
              View My Competencies
            </Link>
          </CardHeader>
        </Card>
      )}
      {activeGaps.length > 0 && recommendations.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No matching trainers found</CardTitle>
            <CardDescription>
              No currently available, approved trainer has a verified competency
              match for your active development areas.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      {recommendations.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-xl font-semibold">Best Matches</h2>
          {recommendations.map((recommendation, index) => {
            const { trainer, matchScore, primaryDriver } = recommendation;
            return (
              <Card key={trainer.userId}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          #{index + 1}
                        </span>
                        <Badge variant="outline">
                          {matchScore.toFixed(1)}% Match
                        </Badge>
                      </div>
                      <CardTitle className="mt-4">{trainer.fullName}</CardTitle>
                      {trainer.designation && (
                        <CardDescription>{trainer.designation}</CardDescription>
                      )}
                      {trainer.department && (
                        <p className="text-sm text-muted-foreground">
                          {trainer.department}
                        </p>
                      )}
                    </div>
                    <div className="rounded-lg bg-muted/50 px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        Primary Match
                      </p>
                      <p className="mt-1 font-semibold">
                        {primaryDriver.competencyName}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Your gap: {primaryDriver.gapScore.toFixed(1)} pts
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      ["Verified Expertise", primaryDriver.expertiseScore],
                      ["Experience Score", primaryDriver.experienceScore],
                      ["Course Alignment", primaryDriver.relevanceScore],
                      ["Availability", primaryDriver.availabilityScore],
                      ["Training Performance", primaryDriver.performanceScore],
                      ["Learner Feedback", primaryDriver.feedbackScore],
                    ].map(([label, value]) => (
                      <Metric
                        key={String(label)}
                        label={String(label)}
                        value={`${Number(value).toFixed(1)}/100`}
                      />
                    ))}
                  </div>
                  <div className="mt-6 rounded-lg bg-muted/50 p-4">
                    <p className="text-sm font-medium">Why this trainer?</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {primaryDriver.explanation}
                    </p>
                  </div>
                  {trainer.trainerBio && (
                    <p className="mt-5 text-sm text-muted-foreground">
                      {trainer.trainerBio}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/trainee/recommendations"
          className={buttonVariants({ size: "sm" })}
        >
          View Recommended Courses
        </Link>
        <Link
          href="/trainee/competencies"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          View My Competencies
        </Link>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium tabular-nums">{value}</p>
    </div>
  );
}
