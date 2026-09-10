"use server";

import { randomUUID } from "crypto";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE =
  50 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",

  "application/vnd.ms-powerpoint",

  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  "application/msword",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "text/plain",

  "video/mp4",
]);

const uploadResourceSchema = z.object({
  courseId:
    z.string().uuid(),

  courseSlug:
    z.string().min(1),

  title:
    z.string()
      .trim()
      .min(2)
      .max(150),

  description:
    z.string()
      .trim()
      .max(500)
      .optional(),

  resourceType:
    z.enum([
      "pdf",
      "presentation",
      "document",
      "video",
      "other",
    ]),

  lessonId:
    z.string()
      .uuid()
      .optional(),
});

export async function uploadCourseResource(
  formData: FormData
): Promise<void> {
  const { user } =
    await requireRole("trainer");

  const parsed =
    uploadResourceSchema.safeParse({
      courseId:
        formData.get("courseId"),

      courseSlug:
        formData.get("courseSlug"),

      title:
        formData.get("title"),

      description:
        formData.get("description") ||
        undefined,

      resourceType:
        formData.get("resourceType"),

      lessonId:
        formData.get("lessonId") ||
        undefined,
    });

  if (!parsed.success) {
    throw new Error(
      "Invalid learning resource data."
    );
  }

  const data = parsed.data;

  const fileValue =
    formData.get("file");

  if (
    !(fileValue instanceof File)
  ) {
    throw new Error(
      "A file is required."
    );
  }

  if (fileValue.size === 0) {
    throw new Error(
      "The selected file is empty."
    );
  }

  if (
    fileValue.size >
    MAX_FILE_SIZE
  ) {
    throw new Error(
      "File size must be 50 MB or less."
    );
  }

  if (
    !ALLOWED_MIME_TYPES.has(
      fileValue.type
    )
  ) {
    throw new Error(
      "This file type is not allowed."
    );
  }

  const supabase =
    await createClient();

  /*
   * SECURITY:
   * Never trust courseId from the form.
   * Verify ownership against the logged-in
   * trainer.
   */
  const {
    data: course,
    error: courseError,
  } = await supabase
    .from("courses")
    .select("id, slug")
    .eq(
      "id",
      data.courseId
    )
    .eq(
      "trainer_id",
      user.id
    )
    .maybeSingle();

  if (courseError) {
    console.error(
      "Unable to verify resource course:",
      courseError
    );

    throw new Error(
      "Unable to verify course."
    );
  }

  if (!course) {
    throw new Error(
      "You are not authorized to upload resources to this course."
    );
  }

  /*
   * Do not trust the slug from the form
   * either. It is only used for revalidation.
   */
  const trustedCourseSlug =
    course.slug;

  /*
   * If lessonId was supplied, make sure
   * that lesson genuinely belongs to
   * THIS course.
   */
  if (data.lessonId) {
    const {
      data: lesson,
      error: lessonError,
    } = await supabase
      .from("lessons")
      .select(`
        id,
        modules!inner (
          course_id
        )
      `)
      .eq(
        "id",
        data.lessonId
      )
      .maybeSingle();

    if (lessonError) {
      console.error(
        "Unable to verify lesson ownership:",
        lessonError
      );

      throw new Error(
        "Unable to verify lesson."
      );
    }

    if (!lesson) {
      throw new Error(
        "Selected lesson does not exist."
      );
    }

    const moduleRelation =
      Array.isArray(
        lesson.modules
      )
        ? lesson.modules[0]
        : lesson.modules;

    if (
      !moduleRelation ||
      moduleRelation.course_id !==
        data.courseId
    ) {
      throw new Error(
        "Selected lesson does not belong to this course."
      );
    }
  }

  const extension =
    getSafeExtension(
      fileValue.name
    );

  const storageFileName =
    extension
      ? `${randomUUID()}.${extension}`
      : randomUUID();

  const storagePath =
    `${data.courseId}/${user.id}/${storageFileName}`;

  const fileBuffer =
    await fileValue.arrayBuffer();

  /*
   * Upload first.
   */
  const {
    error: storageError,
  } = await supabase.storage
    .from("course-materials")
    .upload(
      storagePath,
      fileBuffer,
      {
        contentType:
          fileValue.type,

        upsert:
          false,

        cacheControl:
          "3600",
      }
    );

  if (storageError) {
    console.error(
      "Unable to upload learning resource:",
      storageError
    );
throw new Error(
  "Unable to upload the learning resource.",
);
  }

  /*
   * Then create DB metadata row.
   */
  const {
    error: databaseError,
  } = await supabase
    .from("learning_resources")
    .insert({
      course_id:
        data.courseId,

      lesson_id:
        data.lessonId ?? null,

      uploaded_by:
        user.id,

      title:
        data.title,

      description:
        data.description ?? null,

      resource_type:
        data.resourceType,

      storage_path:
        storagePath,

      mime_type:
        fileValue.type,

      file_size_bytes:
        fileValue.size,
    });

  if (databaseError) {
    console.error(
      "Unable to create learning resource record:",
      databaseError
    );

    /*
     * COMPENSATING CLEANUP:
     * Storage succeeded but DB failed.
     *
     * Remove the file again so we do not
     * leave an orphan in Storage.
     */
    const {
      error: cleanupError,
    } = await supabase.storage
      .from(
        "course-materials"
      )
      .remove([
        storagePath,
      ]);

    if (cleanupError) {
      console.error(
        "Unable to clean up orphaned resource:",
        cleanupError
      );
    }

    throw new Error(
      "Unable to save learning resource."
    );
  }

  revalidatePath(
    `/trainer/courses/${trustedCourseSlug}`
  );
}
export async function deleteCourseResource(
  formData: FormData
): Promise<void> {
  const { user } =
    await requireRole("trainer");

  const resourceIdValue =
    formData.get("resourceId");

  const courseIdValue =
    formData.get("courseId");

  if (
    typeof resourceIdValue !== "string" ||
    typeof courseIdValue !== "string"
  ) {
    throw new Error(
      "Invalid resource deletion request."
    );
  }

  const resourceIdSchema =
    z.string().uuid();

  const courseIdSchema =
    z.string().uuid();

  const resourceIdResult =
    resourceIdSchema.safeParse(
      resourceIdValue
    );

  const courseIdResult =
    courseIdSchema.safeParse(
      courseIdValue
    );

  if (
    !resourceIdResult.success ||
    !courseIdResult.success
  ) {
    throw new Error(
      "Invalid resource deletion request."
    );
  }

  const resourceId =
    resourceIdResult.data;

  const courseId =
    courseIdResult.data;

  const supabase =
    await createClient();

  /*
   * Verify course ownership using the
   * authenticated trainer identity.
   */
  const {
    data: course,
    error: courseError,
  } = await supabase
    .from("courses")
    .select("id, slug")
    .eq(
      "id",
      courseId
    )
    .eq(
      "trainer_id",
      user.id
    )
    .maybeSingle();

  if (courseError) {
    console.error(
      "Unable to verify course before resource deletion:",
      {
        message:
          courseError.message,
        code:
          courseError.code,
        details:
          courseError.details,
        hint:
          courseError.hint,
      }
    );

    throw new Error(
      "Unable to verify course ownership."
    );
  }

  if (!course) {
    throw new Error(
      "You are not authorized to delete resources from this course."
    );
  }

  /*
   * Fetch the resource only if it belongs
   * to this owned course.
   *
   * RLS is also protecting this query.
   */
  const {
    data: resource,
    error: resourceError,
  } = await supabase
    .from("learning_resources")
    .select(`
      id,
      storage_path,
      uploaded_by
    `)
    .eq(
      "id",
      resourceId
    )
    .eq(
      "course_id",
      courseId
    )
    .maybeSingle();

  if (resourceError) {
    console.error(
      "Unable to load resource before deletion:",
      {
        message:
          resourceError.message,
        code:
          resourceError.code,
        details:
          resourceError.details,
        hint:
          resourceError.hint,
      }
    );

    throw new Error(
      "Unable to verify learning resource."
    );
  }

  if (!resource) {
    throw new Error(
      "Learning resource not found."
    );
  }

  /*
   * Our current DELETE policy permits a
   * trainer to delete resources they
   * uploaded themselves.
   */
  if (
    resource.uploaded_by !==
    user.id
  ) {
    throw new Error(
      "You are not authorized to delete this resource."
    );
  }

  /*
   * Delete Storage object first.
   */
  const {
    error: storageDeleteError,
  } = await supabase.storage
    .from("course-materials")
    .remove([
      resource.storage_path,
    ]);

  if (storageDeleteError) {
    console.error(
      "Unable to delete resource file:",
      {
        message:
          storageDeleteError.message,
        name:
          storageDeleteError.name,
      }
    );

    throw new Error(
      `Unable to delete resource file: ${storageDeleteError.message}`
    );
  }

  /*
   * Storage succeeded.
   * Now remove the metadata row.
   */
  const {
    error: databaseDeleteError,
  } = await supabase
    .from("learning_resources")
    .delete()
    .eq(
      "id",
      resourceId
    )
    .eq(
      "course_id",
      courseId
    );

  if (databaseDeleteError) {
    console.error(
      "Storage deleted but resource metadata deletion failed:",
      {
        message:
          databaseDeleteError.message,
        code:
          databaseDeleteError.code,
        details:
          databaseDeleteError.details,
        hint:
          databaseDeleteError.hint,
      }
    );

    throw new Error(
      "File was removed, but the resource record could not be deleted."
    );
  }

  revalidatePath(
    `/trainer/courses/${course.slug}`
  );
}

function getSafeExtension(
  filename: string
): string {
  const lastDot =
    filename.lastIndexOf(".");

  if (
    lastDot <= 0 ||
    lastDot ===
      filename.length - 1
  ) {
    return "";
  }

  return filename
    .slice(lastDot + 1)
    .toLowerCase()
    .replace(
      /[^a-z0-9]/g,
      ""
    )
    .slice(0, 10);
}