import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TraineeCourseResource = {
  id: string;
  title: string;
  description: string | null;
  resourceType: string;
  lessonId: string | null;
  mimeType: string | null;
  fileSizeBytes: number | null;
  createdAt: string;
  signedUrl: string | null;
};

export async function getTraineeCourseResources(
  courseId: string
): Promise<TraineeCourseResource[]> {
  const { user } = await requireRole("trainee");

  const supabase = await createClient();

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", courseId)
    .eq("trainee_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (enrollmentError) {
    console.error(
      "Unable to verify trainee enrollment for course resources:",
      enrollmentError
    );

    throw new Error("Unable to verify your course enrollment.");
  }

  if (!enrollment) {
    throw new Error(
      "You are not enrolled in this course or your enrollment is not active."
    );
  }

  const { data: resources, error } = await supabase
    .from("learning_resources")
    .select(`
      id,
      title,
      description,
      resource_type,
      lesson_id,
      mime_type,
      file_size_bytes,
      created_at,
      storage_path
    `)
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "Unable to load learning resources:",
      error
    );

    throw new Error("Unable to load course resources.");
  }

  const signedResources = await Promise.all(
    (resources ?? []).map(async (resource) => {
      let signedUrl: string | null = null;

      if (resource.storage_path) {
        const { data: urlData, error: signedUrlError } = await supabase.storage
          .from("course-materials")
          .createSignedUrl(resource.storage_path, 15 * 60);

        if (signedUrlError) {
          console.error(
            "Unable to generate signed URL for learning resource:",
            signedUrlError
          );

          signedUrl = null;
        } else {
          signedUrl = urlData?.signedUrl ?? null;
        }
      }

      return {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        resourceType: resource.resource_type,
        lessonId: resource.lesson_id,
        mimeType: resource.mime_type,
        fileSizeBytes: resource.file_size_bytes,
        createdAt: resource.created_at,
        signedUrl,
      };
    })
  );

  return signedResources;
}
