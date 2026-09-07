import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getCourseRecommendations } from "@/lib/competency/get-course-recommendations";

export default async function TraineeRecommendationsPage() {
  const { activeGaps, recommendations } = await getCourseRecommendations();
  return (
    <div className="space-y-8">
      <PageHeader
        title="Course Recommendations"
        description="Training opportunities ranked against your current competency gaps."
        actions={
          <Link
            href="/trainee/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />
      {activeGaps.length === 0 ? (
        <Alert>
          <AlertTitle>No Active Gaps</AlertTitle>
          <AlertDescription>
            All current competency targets are met. No gap-driven learning
            recommendations are needed right now.
            <br />
            <Link
              href="/courses"
              className="mt-3 inline-flex text-primary underline underline-offset-4"
            >
              Browse Course Catalogue
            </Link>
          </AlertDescription>
        </Alert>
      ) : recommendations.length === 0 ? (
        <Alert>
          <AlertTitle>No matching courses</AlertTitle>
          <AlertDescription>
            No published courses currently match your active skill gaps. Check
            back later as new training materials are published.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Active Skill Gaps</CardTitle>
              <CardDescription>
                Competency gaps driving these recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {activeGaps.map((gap) => (
                <Badge key={gap.competencyId} variant="secondary">
                  {gap.competencyName}: {gap.gapScore} pts
                </Badge>
              ))}
            </CardContent>
          </Card>
          <Separator />
          <div className="space-y-5">
            {recommendations.map((rec) => {
              const course = rec.course;
              const primary = rec.primaryDriver;
              const secondary = rec.allMatchingScores.slice(1);
              return (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {course.category ?? "Training course"}
                        </CardDescription>
                      </div>
                      <Badge variant="default">
                        {rec.recommendationScore}% Match
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {course.description && (
                      <p className="text-sm text-muted-foreground">
                        {course.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="capitalize">
                        {course.difficulty}
                      </Badge>
                      {course.estimatedDurationMinutes && (
                        <Badge variant="outline">
                          {course.estimatedDurationMinutes} mins
                        </Badge>
                      )}
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Recommendation score</span>
                        <span>{rec.recommendationScore}%</span>
                      </div>
                      <Progress value={rec.recommendationScore} />
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Why Recommended
                      </p>
                      <p className="mt-1 text-sm">{primary.explanation}</p>
                    </div>
                    {secondary.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Also addresses:{" "}
                        {secondary
                          .map(
                            (match) =>
                              `${match.competencyName} (${match.score}%)`,
                          )
                          .join(", ")}
                      </p>
                    )}
                    <Link
                      href={`/courses/${course.slug}`}
                      className={buttonVariants({ size: "sm" })}
                    >
                      View Course
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
