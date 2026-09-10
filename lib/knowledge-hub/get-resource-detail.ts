import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import {
  KNOWLEDGE_HUB_BUCKET,
  type KnowledgeResourceStatus,
  type KnowledgeResourceType,
} from "@/lib/knowledge-hub/constants"

const SIGNED_URL_EXPIRY_SECONDS = 300;

export type KnowledgeResourceDetail = {
    id: string;
    title: string;
    description: string | null;
    resourceType: KnowledgeResourceType;
    category: string | null;
    status: KnowledgeResourceStatus;
    reviewReason: string | null;
    reviewedAt: string | null;
    externalUrl: string | null;
    signedUrl: string | null;
    mimeType: string | null;
    fileSizeBytes: number | null;
    uploadedByName: string | null;
    isOwnResource: boolean;
    competencyId: string | null;
    competencyName: string | null;
    courseId: string | null;
    courseTitle: string | null;
    courseSlug: string | null;
    createdAt: string;
};

type KnowledgeResourceRow = {
    id: string;
    title: string;
    description: string | null;
    resource_type: KnowledgeResourceType;
    category: string | null;
    status: KnowledgeResourceStatus;
    review_reason: string | null;
    reviewed_at: string | null;
    external_url: string | null;
    storage_path: string | null;
    mime_type: string | null;
    file_size_bytes: number | null;
    uploaded_by: string | null;
    competency_id: string | null;
    course_id: string | null;
    created_at: string;
};

/**
 * Loads a single knowledge resource for an authenticated user of any role,
 * enforcing access rules server-side (not just RLS) and generating a
 * short-lived signed URL for file-backed resources when access is allowed.
 * Returns null when the resource does not exist or the caller is not
 * authorized to view it.
 */
export async function getKnowledgeResourceDetail(
    resourceId: string
): Promise<KnowledgeResourceDetail | null> {
    const parsedId = z.string().uuid().safeParse(resourceId);
    if (!parsedId.success) {
        return null;
    }

    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login");
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_approved, is_active")
        .eq("id", user.id)
        .single();

    if (profileError || !profile || !profile.is_active || !profile.is_approved) {
        redirect("/login");
    }

    const { data, error } = await supabase
        .from("knowledge_resources")
        .select(
            "id, title, description, resource_type, category, status, review_reason, reviewed_at, external_url, storage_path, mime_type, file_size_bytes, uploaded_by, competency_id, course_id, created_at"
        )
        .eq("id", parsedId.data)
        .maybeSingle();

    if (error) {
        console.error("Unable to load knowledge resource:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        throw new Error(`Unable to load knowledge resource: ${error.message}`);
    }

    if (!data) {
        return null;
    }

    const row = data as KnowledgeResourceRow;

    const isOwner = row.uploaded_by === user.id;
    const isAdmin = profile.role === "admin";

    const isAuthorized =
        row.status === "approved" ||
        ((row.status === "pending" || row.status === "rejected" || row.status === "archived") &&
            (isOwner || isAdmin));

    if (!isAuthorized) {
        return null;
    }

    let signedUrl: string | null = null;
    if (row.storage_path) {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from(KNOWLEDGE_HUB_BUCKET)
            .createSignedUrl(row.storage_path, SIGNED_URL_EXPIRY_SECONDS);

        if (signedUrlError) {
            console.error("Unable to create signed URL for knowledge resource:", signedUrlError);
        } else {
            signedUrl = signedUrlData?.signedUrl ?? null;
        }
    }

    let uploadedByName: string | null = null;
    if (row.uploaded_by) {
        const { data: uploader } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", row.uploaded_by)
            .maybeSingle();
        uploadedByName = uploader?.full_name ?? null;
    }

    let competencyName: string | null = null;
    if (row.competency_id) {
        const { data: competency } = await supabase
            .from("competencies")
            .select("name")
            .eq("id", row.competency_id)
            .maybeSingle();
        competencyName = competency?.name ?? null;
    }

    let courseTitle: string | null = null;
    let courseSlug: string | null = null;
    if (row.course_id) {
        const { data: course } = await supabase
            .from("courses")
            .select("title, slug")
            .eq("id", row.course_id)
            .maybeSingle();
        courseTitle = course?.title ?? null;
        courseSlug = course?.slug ?? null;
    }

    return {
        id: row.id,
        title: row.title,
        description: row.description,
        resourceType: row.resource_type,
        category: row.category,
        status: row.status,
        reviewReason: row.review_reason,
        reviewedAt: row.reviewed_at,
        externalUrl: row.external_url,
        signedUrl,
        mimeType: row.mime_type,
        fileSizeBytes: row.file_size_bytes,
        uploadedByName,
        isOwnResource: isOwner,
        competencyId: row.competency_id,
        competencyName,
        courseId: row.course_id,
        courseTitle,
        courseSlug,
        createdAt: row.created_at,
    };
}
