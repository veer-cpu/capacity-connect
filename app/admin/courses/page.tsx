import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { getAdminCourseCompetencies } from "@/lib/admin/get-course-competencies";
import { getAdminCourses, type AdminCourse } from "@/lib/admin/get-courses";
import {
  getAssignableTrainers,
  type AssignableTrainer,
} from "@/lib/admin/get-assignable-trainers";
import { requireRole } from "@/lib/auth/require-role";
import {
  archiveCourse,
  assignCourseTrainer,
  createCourse,
  publishCourse,
} from "./actions";

type CourseView = {
  course: AdminCourse;
  mappedCompetencies: string[];
};

export default async function AdminCoursesPage() {
  await requireRole("admin");
  const [courses, trainers] = await Promise.all([
    getAdminCourses(),
    getAssignableTrainers(),
  ]);
  const courseViews: CourseView[] = await Promise.all(
    courses.map(async (course) => ({
      course,
      mappedCompetencies: (await getAdminCourseCompetencies(course.courseId))
        .filter((competency) => competency.mapped)
        .sort((left, right) => right.relevanceWeight - left.relevanceWeight)
        .map((competency) => competency.competencyName),
    })),
  );

  const totalCourses = courses.length;
  const draftCourses = courses.filter(
    (course) => course.status === "draft",
  ).length;
  const publishedCourses = courses.filter(
    (course) => course.status === "published",
  ).length;
  const archivedCourses = courses.filter(
    (course) => course.status === "archived",
  ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Course Management"
        description="Create and manage competency-aligned training programs."
        actions={
          <Link
            href="/admin/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total Courses" value={totalCourses} />
        <SummaryCard label="Draft" value={draftCourses} />
        <SummaryCard label="Published" value={publishedCourses} />
        <SummaryCard label="Archived" value={archivedCourses} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Create Course</CardTitle>
          <CardDescription>
            Start a draft course and align it to workforce competencies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCourse} className="grid gap-5 md:grid-cols-2">
            <Field label="Course Title">
              <Input name="title" required minLength={2} maxLength={150} />
            </Field>
            <Field label="Slug">
              <Input
                name="slug"
                required
                minLength={2}
                maxLength={150}
                pattern="[a-z0-9-]+"
                placeholder="doppler-weather-radar-operations"
              />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <Textarea name="description" maxLength={2000} rows={4} />
            </Field>
            <Field label="Category">
              <Input
                name="category"
                maxLength={100}
                placeholder="Radar Meteorology"
              />
            </Field>
            <Field label="Difficulty">
              <Select name="difficulty" defaultValue="beginner">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Estimated Duration (minutes)">
              <Input
                type="number"
                name="estimatedDurationMinutes"
                min={0}
                step={1}
              />
            </Field>
            <div className="flex items-end">
              <Button type="submit">Create Draft Course</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Course Directory</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage publishing, trainer assignment, competency mapping, and
            course content.
          </p>
        </div>
        {courseViews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No courses have been created yet.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Mapped Competencies</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="min-w-96">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseViews.map((view) => (
                    <CourseRow
                      key={view.course.courseId}
                      view={view}
                      trainers={trainers}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

function CourseRow({
  view,
  trainers,
}: {
  view: CourseView;
  trainers: AssignableTrainer[];
}) {
  const { course, mappedCompetencies } = view;
  const canPublish = Boolean(course.trainerId) && mappedCompetencies.length > 0;
  return (
    <TableRow className="align-top">
      <TableCell>
        <p className="font-medium">{course.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">/{course.slug}</p>
      </TableCell>
      <TableCell>{course.category ?? "—"}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {course.difficulty}
        </Badge>
      </TableCell>
      <TableCell>
        <p>{course.trainerName ?? "Unassigned"}</p>
        {trainers.length === 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            No active approved trainers available.
          </p>
        )}
      </TableCell>
      <TableCell>
        <div className="max-w-56 space-y-1">
          {mappedCompetencies.length === 0 ? (
            <span className="text-sm text-muted-foreground">None mapped</span>
          ) : (
            mappedCompetencies.slice(0, 3).map((name) => (
              <Badge key={name} variant="secondary" className="mr-1 mb-1">
                {name}
              </Badge>
            ))
          )}
          {mappedCompetencies.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{mappedCompetencies.length - 3} more
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={course.status} />
      </TableCell>
      <TableCell>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/courses/${course.courseId}/content`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Manage Content
            </Link>
            <Link
              href={`/admin/courses/${course.courseId}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Manage Competencies
            </Link>
          </div>
          {course.status === "draft" && (
            <div className="space-y-2">
              {!canPublish && (
                <Alert className="py-2">
                  <AlertTitle className="text-xs">
                    Publish unavailable
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    {!course.trainerId
                      ? "Assign a trainer"
                      : "Map at least one competency"}{" "}
                    before publishing.
                  </AlertDescription>
                </Alert>
              )}
              <form action={publishCourse}>
                <input type="hidden" name="courseId" value={course.courseId} />
                <Button type="submit" size="sm" disabled={!canPublish}>
                  Publish Course
                </Button>
              </form>
            </div>
          )}
          {course.status === "published" && (
            <form action={archiveCourse}>
              <input type="hidden" name="courseId" value={course.courseId} />
              <Button type="submit" size="sm" variant="outline">
                Archive Course
              </Button>
            </form>
          )}
          {course.status === "archived" && (
            <p className="text-xs text-muted-foreground">
              Archived courses remain visible for management.
            </p>
          )}
          {trainers.length > 0 && course.status !== "archived" && (
            <form
              action={assignCourseTrainer}
              className="flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="courseId" value={course.courseId} />
              <Select
                name="trainerId"
                defaultValue={course.trainerId ?? undefined}
                required
              >
                <SelectTrigger size="sm" className="min-w-48">
                  <SelectValue placeholder="Select trainer" />
                </SelectTrigger>
                <SelectContent>
                  {trainers.map((trainer) => (
                    <SelectItem
                      key={trainer.trainerId}
                      value={trainer.trainerId}
                    >
                      {trainer.fullName || trainer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" size="sm" variant="secondary">
                Assign Trainer
              </Button>
            </form>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card size="sm">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`space-y-1.5 text-sm ${className ?? ""}`}>
      <span className="block font-medium">{label}</span>
      {children}
    </label>
  );
}
