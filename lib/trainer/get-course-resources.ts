import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TrainerCourseResource = {
  id: string;
  title: string;
  description: string | null;
  resourceType: string;
  storagePath: string;
  mimeType: string;
  fileSizeBytes: number;
  createdAt: string;
  lessonId: string | null;
  signedUrl: string | null;
};

type ResourceRow = {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number;
  created_at: string;
  lesson_id: string | null;
};

export async function getTrainerCourseResources(
  courseId: string
): Promise<TrainerCourseResource[]> {
  const { user } = await requireRole("trainer");

  const supabase = await createClient();

  // Verify course ownership again.
  const {
    data: course,
    error: courseError,
  } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("trainer_id", user.id)
    .maybeSingle();

  if (courseError) {
    console.error(
      "Unable to verify trainer course ownership:",
      courseError
    );

    throw new Error(
      "Unable to verify course ownership."
    );
  }

  if (!course) {
    throw new Error(
      "You are not authorized to access this course."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("learning_resources")
    .select(`
      id,
      title,
      description,
      resource_type,
      storage_path,
      mime_type,
      file_size_bytes,
      created_at,
      lesson_id
    `)
    .eq("course_id", courseId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Unable to load course resources:",
      error
    );

    throw new Error(
      "Unable to load learning resources."
    );
  }

  const rows =
    (data ?? []) as ResourceRow[];

  const resources =
    await Promise.all(
      rows.map(async (row) => {
        const {
          data: signedData,
          error: signedError,
        } = await supabase.storage
          .from("course-materials")
          .createSignedUrl(
            row.storage_path,
            60 * 15
          );

        if (signedError) {
          console.error(
            "Unable to create signed resource URL:",
            signedError
          );
        }

        return {
          id: row.id,
          title: row.title,
          description: row.description,
          resourceType:
            row.resource_type,
          storagePath:
            row.storage_path,
          mimeType:
            row.mime_type,
          fileSizeBytes:
            Number(row.file_size_bytes),
          createdAt:
            row.created_at,
          lessonId:
            row.lesson_id,
          signedUrl:
            signedData?.signedUrl ?? null,
        };
      })
    );

  return resources;
}