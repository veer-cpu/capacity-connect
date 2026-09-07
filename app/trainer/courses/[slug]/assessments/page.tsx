import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
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
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth/require-role";
import { getCourseAssessments } from "@/lib/trainer/get-course-assessments";
import { getTrainerCourseDetail } from "@/lib/trainer/get-course-detail";
import { createAssessment } from "./actions";

type PageProps = { params: Promise<{ slug: string }> };

export default async function TrainerCourseAssessmentsPage({
  params,
}: PageProps) {
  await requireRole("trainer");
  const { slug } = await params;
  const course = await getTrainerCourseDetail(slug);
  if (!course) notFound();
  const assessments = await getCourseAssessments(course.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Assessments"
        description={`Manage assessment lifecycle and question authoring for ${course.title}.`}
        actions={
          <Link
            href={`/trainer/courses/${course.slug}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View Course
          </Link>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Create Assessment</CardTitle>
          <CardDescription>
            New assessments begin as drafts and can be published after question
            authoring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAssessment} className="space-y-5">
            <input type="hidden" name="courseId" value={course.id} />
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Title">
                <Input
                  name="title"
                  required
                  minLength={2}
                  maxLength={150}
                  placeholder="Safety assessment"
                />
              </Field>
              <Field label="Passing Score (%)">
                <Input
                  name="passingScore"
                  type="number"
                  min={0}
                  max={100}
                  step="1"
                  defaultValue={80}
                  required
                />
              </Field>
            </div>
            <Field label="Description">
              <Textarea
                name="description"
                maxLength={1000}
                rows={4}
                placeholder="Optional description for this assessment"
              />
            </Field>
            <Field label="Deadline (optional)">
              <Input name="deadline" type="datetime-local" />
            </Field>
            <Button type="submit">Save Draft Assessment</Button>
          </form>
        </CardContent>
      </Card>
      <Separator />
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Assessment List</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Draft, published, and closed assessments for this course.
          </p>
        </div>
        {assessments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No assessments created yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>{assessment.title}</CardTitle>
                      {assessment.description && (
                        <CardDescription className="mt-1">
                          {assessment.description}
                        </CardDescription>
                      )}
                    </div>
                    <StatusBadge status={assessment.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 text-sm sm:grid-cols-3">
                    <Metric
                      label="Passing score"
                      value={`${assessment.passingScore}%`}
                    />
                    <Metric
                      label="Deadline"
                      value={
                        assessment.deadline
                          ? new Date(assessment.deadline).toLocaleString()
                          : "No deadline"
                      }
                    />
                    <Metric
                      label="Created"
                      value={new Date(assessment.createdAt).toLocaleString()}
                    />
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      Lifecycle: {assessment.status}
                    </Badge>
                    <Link
                      href={`/trainer/courses/${course.slug}/assessments/${assessment.id}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      {assessment.status === "draft"
                        ? "Edit Questions"
                        : "Manage Assessment"}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1.5 text-sm">
      <span className="block font-medium">{label}</span>
      {children}
    </label>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
