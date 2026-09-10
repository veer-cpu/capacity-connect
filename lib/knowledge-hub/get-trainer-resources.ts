import { z } from "zod";
import {
  type KnowledgeResourceStatus,
  type KnowledgeResourceType,
} from "@/lib/knowledge-hub/constants"
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import {
  buildRelatedNameMaps,
} from "@/lib/knowledge-hub/server"

export type TrainerKnowledgeResource = {
    id: string;
    title: string;
    description: string | null;
    resourceType: KnowledgeResourceType;
    category: string | null;
    externalUrl: string | null;
    storagePath: string | null;
    mimeType: string | null;
    fileSizeBytes: number | null;
    status: KnowledgeResourceStatus;
    reviewReason: string | null;
    reviewedAt: string | null;
    competencyId: string | null;
    competencyName: string | null;
    courseId: string | null;
    courseTitle: string | null;
    createdAt: string;
    updatedAt: string;
};

type KnowledgeResourceRow = {
    id: string;
    title: string;
    description: string | null;
    resource_type: KnowledgeResourceType;
    category: string | null;
    external_url: string | null;
    storage_path: string | null;
    mime_type: string | null;
    file_size_bytes: number | null;
    status: KnowledgeResourceStatus;
    review_reason: string | null;
    reviewed_at: string | null;
    uploaded_by: string | null;
    competency_id: string | null;
    course_id: string | null;
    created_at: string;
    updated_at: string;
};

const statusFilterSchema = z
    .enum(["all", "pending", "approved", "rejected", "archived"])
    .catch("all");

export async function getTrainerKnowledgeResources(
    statusFilter?: string
): Promise<TrainerKnowledgeResource[]> {
    const { user } = await requireRole("trainer");

    const supabase = await createClient();

    let query = supabase
        .from("knowledge_resources")
        .select(
            "id, title, description, resource_type, category, external_url, storage_path, mime_type, file_size_bytes, status, review_reason, reviewed_at, uploaded_by, competency_id, course_id, created_at, updated_at"
        )
        .eq("uploaded_by", user.id)
        .order("created_at", { ascending: false });

    const status = statusFilterSchema.parse(statusFilter ?? "all");
    if (status !== "all") {
        query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Unable to load trainer knowledge resources:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        throw new Error(`Unable to load your knowledge resources: ${error.message}`);
    }

    const rows = (data ?? []) as KnowledgeResourceRow[];
    const { competencyMap, courseMap } = await buildRelatedNameMaps(supabase, rows);

    return rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        resourceType: row.resource_type,
        category: row.category,
        externalUrl: row.external_url,
        storagePath: row.storage_path,
        mimeType: row.mime_type,
        fileSizeBytes: row.file_size_bytes,
        status: row.status,
        reviewReason: row.review_reason,
        reviewedAt: row.reviewed_at,
        competencyId: row.competency_id,
        competencyName: row.competency_id
            ? competencyMap.get(row.competency_id) ?? null
            : null,
        courseId: row.course_id,
        courseTitle: row.course_id ? courseMap.get(row.course_id)?.title ?? null : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}
