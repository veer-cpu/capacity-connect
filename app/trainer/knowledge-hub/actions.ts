"use server";

import { randomUUID } from "crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import {
  KNOWLEDGE_HUB_BUCKET,
  KNOWLEDGE_RESOURCE_TYPES,
} from "@/lib/knowledge-hub/constants"

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "video/mp4",
]);

const externalUrlSchema = z
    .string()
    .trim()
    .min(1)
    .max(2048)
    .refine((value) => {
        try {
            const url = new URL(value);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    }, "External URL must be a valid http or https link.");

const resourceFieldsSchema = z.object({
    title: z.string().trim().min(2).max(150),
    description: z.string().trim().max(1000).optional(),
    resourceType: z.enum(KNOWLEDGE_RESOURCE_TYPES),
    category: z.string().trim().min(1).max(100).optional(),
    competencyId: z.string().uuid().optional(),
    courseId: z.string().uuid().optional(),
    externalUrl: externalUrlSchema.optional(),
});

function sanitizeFilename(name: string): string {
    const base = name.trim().slice(-150);
    return base.replace(/[^a-zA-Z0-9._-]/g, "_") || "file";
}

/** The Select components use a "none" sentinel value for an unselected optional field. */
function normalizeSelectValue(value: FormDataEntryValue | null): string | undefined {
    if (typeof value !== "string" || value === "" || value === "none") {
        return undefined;
    }
    return value;
}

async function assertCompetencyAndCourse(
    supabase: Awaited<ReturnType<typeof createClient>>,
    trainerId: string,
    competencyId: string | undefined,
    courseId: string | undefined
) {
    if (competencyId) {
        const { data: competency } = await supabase
            .from("competencies")
            .select("id")
            .eq("id", competencyId)
            .eq("is_active", true)
            .maybeSingle();

        if (!competency) {
            throw new Error("Selected competency is not available.");
        }
    }

    if (courseId) {
        const { data: course } = await supabase
            .from("courses")
            .select("id")
            .eq("id", courseId)
            .eq("trainer_id", trainerId)
            .maybeSingle();

        if (!course) {
            throw new Error("Selected course is not assigned to you.");
        }
    }
}

export async function submitKnowledgeResource(formData: FormData): Promise<void> {
    const { user } = await requireRole("trainer");

    const parsed = resourceFieldsSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description") || undefined,
        resourceType: formData.get("resourceType"),
        category: formData.get("category") || undefined,
        competencyId: normalizeSelectValue(formData.get("competencyId")),
        courseId: normalizeSelectValue(formData.get("courseId")),
        externalUrl: formData.get("externalUrl") || undefined,
    });

    if (!parsed.success) {
        throw new Error("Invalid knowledge resource submission.");
    }

    const data = parsed.data;
    const fileValue = formData.get("file");
    const hasFile = fileValue instanceof File && fileValue.size > 0;

    if (!hasFile && !data.externalUrl) {
        throw new Error("Provide either a file or an external URL.");
    }

    if (hasFile && data.externalUrl) {
        throw new Error("Provide only one of file or external URL, not both.");
    }

    const supabase = await createClient();

    await assertCompetencyAndCourse(supabase, user.id, data.competencyId, data.courseId);

    const resourceId = randomUUID();
    let storagePath: string | null = null;

    if (hasFile) {
        const file = fileValue as File;

        if (file.size > MAX_FILE_SIZE) {
            throw new Error("File size must be 50 MB or less.");
        }

        if (!ALLOWED_MIME_TYPES.has(file.type)) {
            throw new Error("This file type is not allowed.");
        }

        const safeFilename = sanitizeFilename(file.name);
        storagePath = `${KNOWLEDGE_HUB_BUCKET}/${user.id}/${resourceId}/${safeFilename}`;

        const fileBuffer = await file.arrayBuffer();

        const { error: storageError } = await supabase.storage
            .from(KNOWLEDGE_HUB_BUCKET)
            .upload(storagePath, fileBuffer, {
                contentType: file.type,
                upsert: false,
                cacheControl: "3600",
            });

        if (storageError) {
            console.error("Unable to upload knowledge resource file:", storageError);
           console.error(
  "Unable to upload knowledge resource file:",
  storageError,
);

throw new Error(
  "Unable to upload the resource file.",
);
        }
    }

    const { error: insertError } = await supabase.from("knowledge_resources").insert({
        id: resourceId,
        title: data.title,
        description: data.description ?? null,
        resource_type: data.resourceType,
        category: data.category ?? null,
        storage_path: storagePath,
        external_url: hasFile ? null : data.externalUrl ?? null,
        mime_type: hasFile ? (fileValue as File).type : null,
        file_size_bytes: hasFile ? (fileValue as File).size : null,
        uploaded_by: user.id,
        competency_id: data.competencyId ?? null,
        course_id: data.courseId ?? null,
        status: "pending",
    });

    if (insertError) {
        console.error("Unable to create knowledge resource record:", insertError);

        // Compensating cleanup: Storage succeeded but the DB insert failed.
        if (storagePath) {
            const { error: cleanupError } = await supabase.storage
                .from(KNOWLEDGE_HUB_BUCKET)
                .remove([storagePath]);

            if (cleanupError) {
                console.error("Unable to clean up orphaned knowledge resource file:", cleanupError);
            }
        }

        throw new Error("Unable to submit knowledge resource.");
    }

    revalidatePath("/trainer/knowledge-hub");
}

const editResourceSchema = resourceFieldsSchema.extend({
    resourceId: z.string().uuid(),
});

export async function updateKnowledgeResource(formData: FormData): Promise<void> {
    const { user } = await requireRole("trainer");

    const parsed = editResourceSchema.safeParse({
        resourceId: formData.get("resourceId"),
        title: formData.get("title"),
        description: formData.get("description") || undefined,
        resourceType: formData.get("resourceType"),
        category: formData.get("category") || undefined,
        competencyId: normalizeSelectValue(formData.get("competencyId")),
        courseId: normalizeSelectValue(formData.get("courseId")),
        externalUrl: formData.get("externalUrl") || undefined,
    });

    if (!parsed.success) {
        throw new Error("Invalid knowledge resource update.");
    }

    const data = parsed.data;
    const supabase = await createClient();

    // SECURITY: scope strictly to the authenticated trainer's own resource.
    const { data: existing, error: existingError } = await supabase
        .from("knowledge_resources")
        .select("id, status, storage_path, mime_type, file_size_bytes, external_url")
        .eq("id", data.resourceId)
        .eq("uploaded_by", user.id)
        .maybeSingle();

    if (existingError) {
        console.error("Unable to load knowledge resource for editing:", existingError);
        throw new Error("Unable to load knowledge resource.");
    }

    if (!existing) {
        throw new Error("Knowledge resource not found.");
    }

    if (existing.status !== "pending" && existing.status !== "rejected") {
        throw new Error("Only pending or rejected resources can be edited.");
    }

    await assertCompetencyAndCourse(supabase, user.id, data.competencyId, data.courseId);

    const fileValue = formData.get("file");
    const hasNewFile = fileValue instanceof File && fileValue.size > 0;

    if (hasNewFile && data.externalUrl) {
        throw new Error("Provide only one of file or external URL, not both.");
    }

    let storagePath = existing.storage_path;
    let mimeType = existing.mime_type;
    let fileSizeBytes = existing.file_size_bytes;
    let externalUrl = existing.external_url;
    const previousStoragePath = existing.storage_path;

    if (hasNewFile) {
        const file = fileValue as File;

        if (file.size > MAX_FILE_SIZE) {
            throw new Error("File size must be 50 MB or less.");
        }

        if (!ALLOWED_MIME_TYPES.has(file.type)) {
            throw new Error("This file type is not allowed.");
        }

        const safeFilename = sanitizeFilename(file.name);
        const newStoragePath = `${KNOWLEDGE_HUB_BUCKET}/${user.id}/${data.resourceId}/${safeFilename}`;

        const fileBuffer = await file.arrayBuffer();
        const { error: storageError } = await supabase.storage
            .from(KNOWLEDGE_HUB_BUCKET)
            .upload(newStoragePath, fileBuffer, {
                contentType: file.type,
                upsert: false,
                cacheControl: "3600",
            });

        if (storageError) {
            console.error("Unable to upload replacement knowledge resource file:", storageError);
            throw new Error(`Unable to upload file: ${storageError.message}`);
        }

        storagePath = newStoragePath;
        mimeType = file.type;
        fileSizeBytes = file.size;
        externalUrl = null;
    } else if (data.externalUrl) {
        storagePath = null;
        mimeType = null;
        fileSizeBytes = null;
        externalUrl = data.externalUrl;
    }

    const { error: updateError } = await supabase
        .from("knowledge_resources")
        .update({
            title: data.title,
            description: data.description ?? null,
            resource_type: data.resourceType,
            category: data.category ?? null,
            storage_path: storagePath,
            mime_type: mimeType,
            file_size_bytes: fileSizeBytes,
            external_url: externalUrl,
            competency_id: data.competencyId ?? null,
            course_id: data.courseId ?? null,
            status: "pending",
            review_reason: null,
            reviewed_by: null,
            reviewed_at: null,
        })
        .eq("id", data.resourceId)
        .eq("uploaded_by", user.id);

    if (updateError) {
        console.error("Unable to update knowledge resource:", updateError);

        // Compensating cleanup: newly uploaded replacement file, DB update failed.
        if (hasNewFile && storagePath) {
            const { error: cleanupError } = await supabase.storage
                .from(KNOWLEDGE_HUB_BUCKET)
                .remove([storagePath]);

            if (cleanupError) {
                console.error("Unable to clean up orphaned knowledge resource file:", cleanupError);
            }
        }

        throw new Error("Unable to update knowledge resource.");
    }

    // Old file is only removed after the DB row is confirmed to point elsewhere.
    if (previousStoragePath && previousStoragePath !== storagePath) {
        const { error: cleanupError } = await supabase.storage
            .from(KNOWLEDGE_HUB_BUCKET)
            .remove([previousStoragePath]);

        if (cleanupError) {
            console.error("Unable to remove previous knowledge resource file:", cleanupError);
        }
    }

    revalidatePath("/trainer/knowledge-hub");
}

const deleteResourceSchema = z.object({
    resourceId: z.string().uuid(),
});

export async function deleteKnowledgeResource(formData: FormData): Promise<void> {
    const { user } = await requireRole("trainer");

    const parsed = deleteResourceSchema.safeParse({
        resourceId: formData.get("resourceId"),
    });

    if (!parsed.success) {
        throw new Error("Invalid knowledge resource deletion request.");
    }

    const supabase = await createClient();

    const { data: existing, error: existingError } = await supabase
        .from("knowledge_resources")
        .select("id, status, storage_path")
        .eq("id", parsed.data.resourceId)
        .eq("uploaded_by", user.id)
        .maybeSingle();

    if (existingError) {
        console.error("Unable to load knowledge resource before deletion:", existingError);
        throw new Error("Unable to verify knowledge resource.");
    }

    if (!existing) {
        throw new Error("Knowledge resource not found.");
    }

    if (existing.status !== "pending" && existing.status !== "rejected") {
        throw new Error("Only pending or rejected resources can be deleted.");
    }

    const storagePath = existing.storage_path;

const { error: deleteError } =
  await supabase
    .from("knowledge_resources")
    .delete()
    .eq("id", existing.id)
    .eq("uploaded_by", user.id);

if (deleteError) {
  console.error(
    "Unable to delete knowledge resource metadata:",
    deleteError,
  );

  throw new Error(
    "Unable to delete knowledge resource.",
  );
}

/*
 * Metadata is authoritative.
 *
 * Delete Storage only after the database row
 * has been successfully removed.
 *
 * A leftover object is preferable to a live
 * database row pointing to a missing file.
 */
if (storagePath) {
  const { error: storageDeleteError } =
    await supabase.storage
      .from(KNOWLEDGE_HUB_BUCKET)
      .remove([storagePath]);

  if (storageDeleteError) {
    console.error(
      "Knowledge resource metadata was deleted, but Storage cleanup failed:",
      storageDeleteError,
    );
  }
}

    revalidatePath("/trainer/knowledge-hub");
}
