import Link from "next/link";
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
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { getMyCertificates } from "@/lib/certificates/get-certificates";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { issueCertificate } from "./actions";

type EnrollmentWithCourse = {
  id: string;
  status: string;
  progress_percentage: number | string | null;
  course_id: string;
  courses:
    | { title: string; slug: string }
    | { title: string; slug: string }[]
    | null;
};

export default async function TraineeCertificatesPage() {
  const { user } = await requireRole("trainee");
  const [certificates, enrollments] = await Promise.all([
    getMyCertificates(),
    getEligibleEnrollments(user.id),
  ]);
  const issuedCourseIds = new Set(
    certificates.map((certificate) => certificate.courseId),
  );
  const eligible = enrollments.filter(
    (enrollment) => !issuedCourseIds.has(enrollment.course_id),
  );
  return (
    <div className="space-y-8">
      <PageHeader
        title="Certificates"
        description="View and verify credentials earned through completed training."
        actions={
          <Link
            href="/trainee/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />
      {certificates.length === 0 && eligible.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No certificates are available yet.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Issued Certificates</CardTitle>
              <CardDescription>
                Credentials earned through completed CAPACITY CONNECT courses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">
                  No issued certificates yet.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {certificates.map((certificate) => (
                    <Card key={certificate.id} size="sm">
                      <CardContent className="space-y-4 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">
                              {certificate.courseTitle}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Certificate {certificate.certificateNumber}
                            </p>
                          </div>
                          <StatusBadge
                            status={certificate.revokedAt ? "Revoked" : "Valid"}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Issued {formatDate(certificate.issuedAt)}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/verify/${certificate.verificationCode}`}
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                            })}
                          >
                            Verify Certificate
                          </Link>
                          {!certificate.revokedAt && (
                            <Link
                              href={`/trainee/certificates/${certificate.id}/download`}
                              className={buttonVariants({ size: "sm" })}
                            >
                              Download PDF
                            </Link>
                          )}
                        </div>
                        {certificate.revokedAt && (
                          <Badge variant="destructive">
                            Revoked credential
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Separator />
          {eligible.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Eligible Completed Courses</CardTitle>
                <CardDescription>
                  Issue a certificate for a completed course when needed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {eligible.map((enrollment) => {
                  const course = Array.isArray(enrollment.courses)
                    ? enrollment.courses[0]
                    : enrollment.courses;
                  return (
                    <div
                      key={enrollment.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">
                          {course?.title ?? "Completed course"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Progress: 100%
                        </p>
                      </div>
                      <form action={issueCertificate}>
                        <input
                          type="hidden"
                          name="enrollmentId"
                          value={enrollment.id}
                        />
                        <Button type="submit">Issue Certificate</Button>
                      </form>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

async function getEligibleEnrollments(
  traineeId: string,
): Promise<EnrollmentWithCourse[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("id, status, progress_percentage, course_id, courses (title, slug)")
    .eq("trainee_id", traineeId)
    .eq("status", "completed")
    .eq("progress_percentage", 100)
    .order("updated_at", { ascending: false });
  if (error) throw new Error("Unable to load eligible completed courses.");
  return (data ?? []) as EnrollmentWithCourse[];
}
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}
