import Link from "next/link";
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  BadgeCheck,
  CircleAlert,
  Target,
  UserRound,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { AnnouncementFeed } from "@/components/announcements/announcement-feed";
import { StatusBadge } from "@/components/ui/status-badge";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants, Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getMyCertificates } from "@/lib/certificates/get-certificates";
import { getCourseRecommendations } from "@/lib/competency/get-course-recommendations";
import { getActiveDevelopmentPlan } from "@/lib/competency/get-development-plan";
import { getTrainerRecommendations } from "@/lib/competency/get-trainer-recommendations";
import {
  getMyNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications/get-notifications";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

type EnrollmentRow = {
  id: string;
  status: string;
  progress_percentage: number | string | null;
  courses:
    | { title: string; slug: string; difficulty: string | null }
    | { title: string; slug: string; difficulty: string | null }[]
    | null;
};

type GapRow = {
  current_score: number | string;
  target_score: number | string;
  gap_score: number | string;
  priority: string;
  status: string;
  competencies: { name: string } | { name: string }[] | null;
};

export default async function TraineeDashboard() {
  const { user } = await requireRole("trainee");
  const supabase = await createClient();

  const [
    profileResult,
    enrollmentResult,
    gapsResult,
    certificates,
    unreadNotifications,
    notifications,
    courseRecommendations,
    trainerRecommendations,
    developmentPlan,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("enrollments")
      .select(
        "id, status, progress_percentage, courses (title, slug, difficulty)",
      )
      .eq("trainee_id", user.id)
      .in("status", ["active", "completed"])
      .order("updated_at", { ascending: false }),
    supabase
      .from("skill_gaps")
      .select(
        "current_score, target_score, gap_score, priority, status, competencies (name)",
      )
      .eq("trainee_id", user.id)
      .neq("status", "resolved")
      .gt("gap_score", 0),
    getMyCertificates(),
    getUnreadNotificationCount(),
    getMyNotifications(3),
    getCourseRecommendations(),
    getTrainerRecommendations(),
    getActiveDevelopmentPlan(),
  ]);

  if (enrollmentResult.error) {
    throw new Error("Unable to load your learning progress.");
  }
  if (gapsResult.error) {
    throw new Error("Unable to load your competency gaps.");
  }

  const enrollments = (enrollmentResult.data ?? []) as EnrollmentRow[];
  const gaps = ((gapsResult.data ?? []) as GapRow[]).sort((left, right) => {
    const priorityOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    return (
      (priorityOrder[left.priority] ?? 4) -
        (priorityOrder[right.priority] ?? 4) ||
      Number(right.gap_score) - Number(left.gap_score)
    );
  });
  const activeEnrollments = enrollments.filter(
    (item) => item.status === "active",
  );
  const averageProgress = enrollments.length
    ? Math.round(
        enrollments.reduce(
          (total, item) => total + Number(item.progress_percentage ?? 0),
          0,
        ) / enrollments.length,
      )
    : 0;
  const unresolvedGaps = gaps.length;
  const priorityGaps = gaps.filter((gap) =>
    ["high", "critical"].includes(gap.priority),
  ).length;
  const validCertificates = certificates.filter(
    (certificate) => !certificate.revokedAt,
  ).length;
  const traineeName =
    profileResult.data?.full_name?.trim() || user.email || "Trainee";
  const topCourse = courseRecommendations.recommendations[0];
  const topTrainer = trainerRecommendations.recommendations[0];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${traineeName}`}
        description="Track your learning progress, competency gaps, and personalized development journey."
      />

      <AnnouncementFeed />

      <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          icon={BookOpen}
          label="Active Courses"
          value={activeEnrollments.length}
        />
        <MetricCard
          icon={Target}
          label="Average Progress"
          value={`${averageProgress}%`}
        />
        <MetricCard
          icon={CircleAlert}
          label="Open Skill Gaps"
          value={unresolvedGaps}
        />
        <MetricCard
          icon={CircleAlert}
          label="Priority Gaps"
          value={priorityGaps}
        />
        <MetricCard
          icon={Award}
          label="Certificates"
          value={validCertificates}
        />
        <MetricCard
          icon={Bell}
          label="Unread Notifications"
          value={unreadNotifications}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Priority Skill Gaps</CardTitle>
              <CardDescription>
                Your most important competency areas to develop next.
              </CardDescription>
              <CardAction>
                <Link
                  href="/trainee/competencies"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                  })}
                >
                  View All Gaps
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              {gaps.length === 0 ? (
                <Alert>
                  <Target className="size-4" />
                  <AlertTitle>
                    You&apos;re currently meeting your competency targets.
                  </AlertTitle>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {gaps.slice(0, 3).map((gap, index) => (
                    <GapItem key={`${gap.priority}-${index}`} gap={gap} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="size-5" />
                Competency Passport
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                Review your consolidated capability record, competency levels
                and supporting assessment and certification evidence.
              </p>

              <Button
                className="mt-4"
                variant="outline"
                nativeButton={false}
                render={<Link href="/trainee/passport" />}
              >
                View my passport
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>My Learning</CardTitle>
              <CardDescription>
                Continue the courses currently in progress.
              </CardDescription>
              <CardAction>
                <Link
                  href="/trainee/courses"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                  })}
                >
                  View All Courses
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              {activeEnrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active courses right now.
                </p>
              ) : (
                <div className="space-y-4">
                  {activeEnrollments.slice(0, 3).map((enrollment) => {
                    const course = Array.isArray(enrollment.courses)
                      ? enrollment.courses[0]
                      : enrollment.courses;
                    if (!course) return null;
                    const progress = Math.min(
                      Math.max(Number(enrollment.progress_percentage ?? 0), 0),
                      100,
                    );
                    return (
                      <div
                        key={enrollment.id}
                        className="space-y-3 rounded-lg border p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <StatusBadge status={enrollment.status} />
                          </div>
                          <Link
                            href={`/trainee/courses/${course.slug}`}
                            className={buttonVariants({ size: "sm" })}
                          >
                            Continue Learning
                            <ArrowRight />
                          </Link>
                        </div>
                        <Progress value={progress} />
                        <p className="text-right text-xs text-muted-foreground">
                          {progress}% complete
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <RecommendationCard course={topCourse} />
          <TrainerCard trainer={topTrainer} />
          <DevelopmentPlanCard plan={developmentPlan} />
          <NotificationsCard notifications={notifications} />
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

function GapItem({ gap }: { gap: GapRow }) {
  const competency = Array.isArray(gap.competencies)
    ? gap.competencies[0]
    : gap.competencies;
  const current = Number(gap.current_score);
  const target = Number(gap.target_score);
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{competency?.name ?? "Competency"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Current: {current} · Target: {target} · Gap: {Number(gap.gap_score)}
          </p>
        </div>
        <StatusBadge status={gap.priority} />
      </div>
      <Progress value={Math.min(Math.max(current, 0), 100)} />
    </div>
  );
}

function RecommendationCard({
  course,
}: {
  course:
    | Awaited<
        ReturnType<typeof getCourseRecommendations>
      >["recommendations"][number]
    | undefined;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Next Course</CardTitle>
        <CardDescription>
          Personalized learning based on your current gaps.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {course ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{course.course.title}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {course.course.difficulty}
                </Badge>
                <Badge variant="outline">
                  Score: {course.recommendationScore}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {course.primaryDriver.explanation}
            </p>
            <Link
              href="/trainee/recommendations"
              className={buttonVariants({ variant: "outline" })}
            >
              View Recommendations
            </Link>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No course recommendation is needed right now.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function TrainerCard({
  trainer,
}: {
  trainer:
    | Awaited<
        ReturnType<typeof getTrainerRecommendations>
      >["recommendations"][number]
    | undefined;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Trainer</CardTitle>
        <CardDescription>
          Support matched to your competency needs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {trainer ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <UserRound className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{trainer.trainer.fullName}</h3>
                <p className="text-sm text-muted-foreground">
                  {[trainer.trainer.designation, trainer.trainer.department]
                    .filter(Boolean)
                    .join(" · ") || "Trainer"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Match Score: {trainer.matchScore}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {trainer.primaryDriver.explanation}
            </p>
            <Link
              href="/trainee/trainers"
              className={buttonVariants({ size: "sm" })}
            >
              View Trainer Matches
              <ArrowRight />
            </Link>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No trainer recommendation is currently required.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function DevelopmentPlanCard({
  plan,
}: {
  plan: Awaited<ReturnType<typeof getActiveDevelopmentPlan>>;
}) {
  const nextStep = plan?.items.find((item) =>
    ["pending", "in_progress"].includes(item.status),
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Development Plan</CardTitle>
        <CardDescription>
          Your next steps toward closing skill gaps.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {plan ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{plan.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Target: {formatDate(plan.targetDate)}
                </p>
              </div>
              <StatusBadge status={plan.status} />
            </div>
            <Progress value={plan.progressPercentage} />
            <p className="text-right text-xs text-muted-foreground">
              {plan.progressPercentage}% complete
            </p>
            {nextStep && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="font-medium">Next Step</p>
                <p className="mt-1">{nextStep.competencyName}</p>
                {nextStep.recommendedCourseTitle && (
                  <p className="mt-1 text-muted-foreground">
                    Recommended course: {nextStep.recommendedCourseTitle}
                  </p>
                )}
              </div>
            )}
            <Link href="/trainee/development-plan" className={buttonVariants()}>
              Open Development Plan
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No active development plan.
            </p>
            <Link
              href="/trainee/development-plan"
              className={buttonVariants({ size: "sm" })}
            >
              Create Development Plan
              <ArrowRight />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NotificationsCard({
  notifications,
}: {
  notifications: Awaited<ReturnType<typeof getMyNotifications>>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Notifications</CardTitle>
        <CardDescription>Your latest platform updates.</CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{notification.title}</p>
                  {!notification.isRead && (
                    <Badge variant="secondary">Unread</Badge>
                  )}
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(notification.createdAt)}
                </p>
                {notification.actionUrl && (
                  <Link
                    href="notifications.actionURL"
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    Open
                  </Link>
                )}
              </div>
            ))}
            <Separator />
            <Link
              href="/notifications"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              View All Notifications
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatDate(value: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not set" : date.toLocaleDateString();
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
}
