import Link from "next/link";

import { requireRole } from "@/lib/auth/require-role";
import { getMyCertificates } from "@/lib/certificates/get-certificates";
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
  const eligibleEnrollments = enrollments.filter(
    (enrollment) => !issuedCourseIds.has(enrollment.course_id),
  );

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Certificates</h1>
        <p className="mt-2 text-gray-600">
          Certificates earned from completed CAPACITY CONNECT courses.
        </p>
      </div>

      {certificates.length === 0 && eligibleEnrollments.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
          No certificates are available yet.
        </div>
      ) : (
        <>
          {certificates.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                Issued Certificates
              </h2>
              <div className="space-y-4">
                {certificates.map((certificate) => (
                  <article
                    key={certificate.id}
                    className="rounded-xl border bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {certificate.courseTitle}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          Certificate {certificate.certificateNumber}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs ${certificate.revokedAt ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
                      >
                        {certificate.revokedAt ? "Revoked" : "Valid"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      Issued {formatDate(certificate.issuedAt)}
                    </p>
                    <Link
                      href={`/verify/${certificate.verificationCode}`}
                      className="mt-4 inline-flex rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Verify Certificate
                    </Link>
                    {!certificate.revokedAt && (
                      <Link
                        href={`/trainee/certificates/${certificate.id}/download`}
                        className="ml-2 mt-4 inline-flex rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
                      >
                        Download PDF
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {eligibleEnrollments.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-2xl font-semibold">
                Eligible Completed Courses
              </h2>
              <div className="space-y-4">
                {eligibleEnrollments.map((enrollment) => {
                  const course = Array.isArray(enrollment.courses)
                    ? enrollment.courses[0]
                    : enrollment.courses;
                  return (
                    <article
                      key={enrollment.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5"
                    >
                      <div>
                        <h3 className="font-semibold">
                          {course?.title ?? "Completed course"}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          Progress: 100%
                        </p>
                      </div>
                      <form action={issueCertificate}>
                        <input
                          type="hidden"
                          name="enrollmentId"
                          value={enrollment.id}
                        />
                        <button
                          type="submit"
                          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                        >
                          Issue Certificate
                        </button>
                      </form>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </main>
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

  if (error) {
    console.error("Unable to load eligible certificate courses:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error("Unable to load eligible completed courses.");
  }

  return (data ?? []) as EnrollmentWithCourse[];
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}
