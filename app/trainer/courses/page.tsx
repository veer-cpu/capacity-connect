import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAssignedCourses } from "@/lib/trainer/get-assigned-courses";

export default async function TrainerCoursesPage() {
  const data = await getAssignedCourses();

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Courses"
        description="View the courses currently assigned to your trainer account."
        actions={
          <Link
            href="/trainer/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />

      {data.courses.length === 0 ? (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>No assigned courses</CardTitle>
            <CardDescription>
              You do not have any courses assigned yet. An administrator must
              assign a course before it appears here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {data.courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{course.title}</CardTitle>
                    {course.category && (
                      <CardDescription className="mt-1">
                        {course.category}
                      </CardDescription>
                    )}
                  </div>
                  <StatusBadge status={course.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <StatusBadge status={course.status} />
                  </div>

                  <StatusBadge status={course.difficulty} />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Trainees</p>

                    <p className="mt-1 font-semibold">
                      {course.activeTrainees}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Progress</p>

                    <p className="mt-1 font-semibold">
                      {course.averageProgress}%
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Assessments</p>

                    <p className="mt-1 font-semibold">
                      {course.assessmentCount}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/trainer/courses/${course.slug}`}
                  className={`${buttonVariants({ size: "sm" })} mt-6`}
                >
                  Open Course
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
