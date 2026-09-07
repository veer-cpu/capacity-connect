import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  MessageSquare,
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
import { requireRole } from "@/lib/auth/require-role";
import { getStaffDevelopmentPlans } from "@/lib/development-plan/get-staff-plans";
import { getAssignedCourses } from "@/lib/trainer/get-assigned-courses";
import { getTrainerAssessmentAnalytics } from "@/lib/trainer/get-assessment-analytics";
import { getTrainerCoursePerformance } from "@/lib/trainer/get-course-performance";
import { getTrainerFeedbackSummary } from "@/lib/trainer/get-feedback-summary";
import { createClient } from "@/lib/supabase/server";

export default async function TrainerDashboardPage() {
  await requireRole("trainer");
  const assigned = await getAssignedCourses();
  const courseIds = assigned.courses.map((course) => course.id);

  const [
    assessmentAnalytics,
    learnerPerformance,
    plans,
    feedback,
    publishedAssessments,
  ] = await Promise.all([
    Promise.all(
      assigned.courses.map(async (course) => ({
        course,
        assessments: await getTrainerAssessmentAnalytics(course.id),
      })),
    ),
    Promise.all(
      assigned.courses.map(async (course) => ({
        course,
        learners: await getTrainerCoursePerformance(course.id),
      })),
    ),
    getStaffDevelopmentPlans(),
    getTrainerFeedbackSummary(),
    getPublishedAssessmentCount(courseIds),
  ]);

  const assessmentRows = assessmentAnalytics.flatMap(
    ({ course, assessments }) =>
      assessments.map((assessment) => ({
        ...assessment,
        courseTitle: course.title,
      })),
  );
  const submittedAssessments = assessmentRows.filter(
    (assessment) => assessment.submittedCount > 0,
  );
  const averageAssessmentScore = submittedAssessments.length
    ? weightedAverage(
        submittedAssessments.map((assessment) => ({
          value: assessment.averagePercentage,
          weight: assessment.submittedCount,
        })),
      )
    : null;
  const attentionRows = learnerPerformance
    .flatMap(({ course, learners }) =>
      learners
        .filter((learner) => learner.performanceStatus === "Needs Attention")
        .map((learner) => ({ ...learner, courseTitle: course.title })),
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Trainer Dashboard"
        description="Monitor learner progress, assessments, competency development, and training outcomes."
      />

      <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          icon={BookOpen}
          label="Assigned Courses"
          value={assigned.assignedCoursesCount}
        />
        <MetricCard
          icon={Users}
          label="Active Learners"
          value={assigned.totalActiveTrainees}
        />
        <MetricCard
          icon={ClipboardCheck}
          label="Published Assessments"
          value={publishedAssessments}
        />
        <MetricCard
          icon={BarChart3}
          label="Average Assessment Score"
          value={formatPercent(averageAssessmentScore)}
        />
        <MetricCard
          icon={BookOpen}
          label="Average Course Completion"
          value={`${assigned.averageProgress}%`}
        />
        <MetricCard
          icon={MessageSquare}
          label="Average Feedback Rating"
          value={formatRating(feedback.averageTrainerRating)}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learners Needing Attention</CardTitle>
              <CardDescription>
                Existing performance signals that may need follow-up.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attentionRows.length === 0 ? (
                <Alert>
                  <Users className="size-4" />
                  <AlertTitle>
                    No trainees currently require immediate attention.
                  </AlertTitle>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {attentionRows.map((learner) => (
                    <div
                      key={`${learner.traineeId}-${learner.courseTitle}`}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{learner.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {learner.courseTitle}
                          </p>
                        </div>
                        <StatusBadge status="Needs Attention" />
                      </div>
                      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                        <Metric
                          label="Progress"
                          value={`${learner.progressPercentage}%`}
                        />
                        <Metric
                          label="Average score"
                          value={
                            learner.assessmentsCompleted
                              ? `${learner.averagePercentage}%`
                              : "No data"
                          }
                        />
                        <Metric
                          label="Assessments"
                          value={learner.assessmentsCompleted}
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
              <CardTitle>Recent Assessment Performance</CardTitle>
              <CardDescription>
                Latest assessment outcomes across assigned courses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assessmentRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No assessment performance data is available yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {assessmentRows.slice(0, 5).map((assessment) => (
                    <div
                      key={assessment.assessmentId}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{assessment.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {assessment.courseTitle}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {assessment.submittedCount} attempts
                        </Badge>
                      </div>
                      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                        <Metric
                          label="Average score"
                          value={`${assessment.averagePercentage}%`}
                        />
                        <Metric
                          label="Pass rate"
                          value={`${assessment.passRate}%`}
                        />
                        <div className="flex items-center">
                          <Progress value={assessment.passRate} />
                        </div>
                      </div>
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
              <CardTitle>Development Plan Oversight</CardTitle>
              <CardDescription>
                Active plans for learners in your courses.
              </CardDescription>
              <CardAction>
                <Link
                  href="/trainer/development-plans"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  View Development Plans
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              {plans.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active development plans are available.
                </p>
              ) : (
                <div className="space-y-3">
                  {plans.slice(0, 3).map((plan) => (
                    <div key={plan.planId} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {plan.traineeName ?? "Unnamed trainee"}
                          </p>
                          <p className="text-sm text-muted-foreground">
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

          <Card>
            <CardHeader>
              <CardTitle>Feedback Snapshot</CardTitle>
              <CardDescription>Ratings submitted by learners.</CardDescription>
              <CardAction>
                <Link
                  href="/trainer/feedback"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  View Feedback
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              {feedback.totalFeedback === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No feedback has been submitted yet.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <Metric
                    label="Trainer rating"
                    value={formatRating(feedback.averageTrainerRating)}
                  />
                  <Metric
                    label="Course rating"
                    value={formatRating(feedback.averageCourseRating)}
                  />
                  <Metric
                    label="Feedback count"
                    value={feedback.totalFeedback}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Courses</CardTitle>
              <CardDescription>
                Courses currently assigned to your trainer account.
              </CardDescription>
              <CardAction>
                <Link
                  href="/trainer/courses"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  View All Courses
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              {assigned.courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No assigned courses.
                </p>
              ) : (
                <div className="space-y-3">
                  {assigned.courses.slice(0, 3).map((course) => (
                    <div key={course.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {course.activeTrainees} learners ·{" "}
                            {course.averageProgress}% average progress
                          </p>
                        </div>
                        <StatusBadge status={course.status} />
                      </div>
                      <Link
                        href={`/trainer/courses/${course.slug}`}
                        className={`${buttonVariants({ size: "sm" })} mt-3`}
                      >
                        Open Course
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string | number;
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

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium tabular-nums">{value}</p>
    </div>
  );
}

function weightedAverage(values: Array<{ value: number; weight: number }>) {
  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);
  return totalWeight === 0
    ? null
    : Number(
        (
          values.reduce((sum, item) => sum + item.value * item.weight, 0) /
          totalWeight
        ).toFixed(1),
      );
}

async function getPublishedAssessmentCount(courseIds: string[]) {
  if (courseIds.length === 0) return 0;

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("assessments")
    .select("id", { count: "exact", head: true })
    .in("course_id", courseIds)
    .eq("status", "published");

  if (error) {
    throw new Error("Unable to load published assessments.");
  }

  return count ?? 0;
}

function formatPercent(value: number | null) {
  return value === null ? "N/A" : `${value}%`;
}

function formatRating(value: number | null) {
  return value === null ? "N/A" : value.toFixed(1);
}

function formatDate(value: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not set" : date.toLocaleDateString();
}
