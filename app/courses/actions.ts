"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";

const enrollmentSchema = z.object({
  courseId: z.string().uuid(),
  courseSlug: z.string().min(1),
});

export async function enrollInCourse(formData: FormData) {
  const { user } = await requireRole("trainee");

  const result = enrollmentSchema.safeParse({
    courseId: formData.get("courseId"),
    courseSlug: formData.get("courseSlug"),
  });

  if (!result.success) {
    throw new Error("Invalid enrollment request.");
  }

  const { courseId, courseSlug } = result.data;

  const supabase = await createClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, status")
    .eq("id", courseId)
    .eq("slug", courseSlug)
    .single();

  if (courseError || !course) {
    throw new Error("Course not found.");
  }

  if (course.status !== "published") {
    throw new Error("This course is not available for enrollment.");
  }

  const { data: existingEnrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("trainee_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!existingEnrollment) {
    const { error: enrollmentError } = await supabase
      .from("enrollments")
      .insert({
        trainee_id: user.id,
        course_id: courseId,
      });

    if (enrollmentError) {
      console.error("Enrollment failed:", enrollmentError);

      throw new Error("Unable to enroll in this course.");
    }
  }

  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/trainee/courses");

  redirect("/trainee/courses");
}