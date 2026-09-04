import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TrainerAssignedCourse = {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string | null;
  difficulty: string;
  estimatedDurationMinutes: number | null;
  activeTrainees: number;
  averageProgress: number;
  assessmentCount: number;
};

export type TrainerDashboardData = {
  trainerName: string;
  assignedCoursesCount: number;
  totalActiveTrainees: number;
  totalAssessments: number;
  averageProgress: number;
  courses: TrainerAssignedCourse[];
};

export async function getAssignedCourses(): Promise<TrainerDashboardData> {
 const { user } = await requireRole("trainer");

const supabase = await createClient();

const {
  data: trainerProfile,
  error: trainerProfileError,
} = await supabase
  .from("profiles")
  .select("full_name")
  .eq("id", user.id)
  .single();

if (trainerProfileError) {
  console.error(
    "Unable to load trainer profile:",
    trainerProfileError
  );
}

  const { data: courses, error: coursesError } =
    await supabase
      .from("courses")
      .select(`
        id,
        title,
        slug,
        status,
        category,
        difficulty,
        estimated_duration_minutes
      `)
      .eq("trainer_id", user.id)
      .order("title");

  if (coursesError) {
    console.error(
      "Unable to load trainer courses:",
      coursesError
    );

    throw new Error(
      "Unable to load assigned courses."
    );
  }

  const courseRows = courses ?? [];

  if (courseRows.length === 0) {
    return {
     trainerName:
  trainerProfile?.full_name ?? "Trainer",
      assignedCoursesCount: 0,
      totalActiveTrainees: 0,
      totalAssessments: 0,
      averageProgress: 0,
      courses: [],
    };
  }

  const courseIds = courseRows.map(
    (course) => course.id
  );

  const { data: enrollments, error: enrollmentError } =
    await supabase
      .from("enrollments")
      .select(`
        course_id,
        trainee_id,
        status,
        progress_percentage
      `)
      .in("course_id", courseIds);

  if (enrollmentError) {
    console.error(
      "Unable to load trainer enrollments:",
      enrollmentError
    );

    throw new Error(
      "Unable to load course participation."
    );
  }

  const { data: assessments, error: assessmentError } =
    await supabase
      .from("assessments")
      .select(`
        id,
        course_id
      `)
      .in("course_id", courseIds);

  if (assessmentError) {
    console.error(
      "Unable to load trainer assessments:",
      assessmentError
    );

    throw new Error(
      "Unable to load course assessments."
    );
  }

  const enrollmentRows =
    enrollments ?? [];

  const assessmentRows =
    assessments ?? [];

  const activeEnrollments =
    enrollmentRows.filter(
      (row) => row.status === "active"
    );

  const uniqueActiveTrainees =
    new Set(
      activeEnrollments.map(
        (row) => row.trainee_id
      )
    );

  const overallAverageProgress =
    activeEnrollments.length > 0
      ? activeEnrollments.reduce(
          (sum, row) =>
            sum +
            Number(
              row.progress_percentage ?? 0
            ),
          0
        ) / activeEnrollments.length
      : 0;

  const mappedCourses:
    TrainerAssignedCourse[] =
    courseRows.map((course) => {
      const courseEnrollments =
        enrollmentRows.filter(
          (row) =>
            row.course_id === course.id &&
            row.status === "active"
        );

      const courseAssessments =
        assessmentRows.filter(
          (row) =>
            row.course_id === course.id
        );

      const averageProgress =
        courseEnrollments.length > 0
          ? courseEnrollments.reduce(
              (sum, row) =>
                sum +
                Number(
                  row.progress_percentage ??
                    0
                ),
              0
            ) /
            courseEnrollments.length
          : 0;

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        status: course.status,
        category: course.category,
        difficulty:
          course.difficulty,
        estimatedDurationMinutes:
          course.estimated_duration_minutes,
        activeTrainees:
          courseEnrollments.length,
        averageProgress:
          Number(
            averageProgress.toFixed(1)
          ),
        assessmentCount:
          courseAssessments.length,
      };
    });

  return {
   trainerName:
  trainerProfile?.full_name ?? "Trainer",

    assignedCoursesCount:
      courseRows.length,

    totalActiveTrainees:
      uniqueActiveTrainees.size,

    totalAssessments:
      assessmentRows.length,

    averageProgress:
      Number(
        overallAverageProgress.toFixed(1)
      ),

    courses: mappedCourses,
  };
}