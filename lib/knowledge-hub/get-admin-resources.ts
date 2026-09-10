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

export type AdminKnowledgeResource = {
    id: string;
    title: string;
    description: string | null;
    resourceType: KnowledgeResourceType;
    category: string | null;
    externalUrl: string | null;
    hasFile: boolean;
    status: KnowledgeResourceStatus;
    reviewReason: string | null;
    reviewedAt: string | null;
    uploadedByName: string | null;
    competencyId: string | null;
    competencyName: string | null;
    courseId: string | null;
    courseTitle: string | null;
    createdAt: string;
};

type KnowledgeResourceRow = {
    id: string;
    title: string;
    description: string | null;
    resource_type: KnowledgeResourceType;
    category: string | null;
    external_url: string | null;
    storage_path: string | null;
    status: KnowledgeResourceStatus;
    review_reason: string | null;
    reviewed_at: string | null;
    uploaded_by: string | null;
    competency_id: string | null;
    course_id: string | null;
    created_at: string;
};

const statusFilterSchema = z
    .enum(["all", "pending", "approved", "rejected", "archived"])
    .catch("pending");

export async function getAdminKnowledgeResources(
    statusFilter?: string
): Promise<AdminKnowledgeResource[]> {
    await requireRole("admin");

    const supabase = await createClient();

    let query = supabase
        .from("knowledge_resources")
        .select(
            "id, title, description, resource_type, category, external_url, storage_path, status, review_reason, reviewed_at, uploaded_by, competency_id, course_id, created_at"
        )
        .order("created_at", { ascending: false });

    const status = statusFilterSchema.parse(statusFilter ?? "pending");
    if (status !== "all") {
        query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Unable to load admin knowledge resources:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        throw new Error(`Unable to load knowledge resources: ${error.message}`);
    }

    const rows = (data ?? []) as KnowledgeResourceRow[];
    const { profileMap, competencyMap, courseMap } = await buildRelatedNameMaps(
        supabase,
        rows
    );

    return rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        resourceType: row.resource_type,
        category: row.category,
        externalUrl: row.external_url,
        hasFile: !!row.storage_path,
        status: row.status,
        reviewReason: row.review_reason,
        reviewedAt: row.reviewed_at,
        uploadedByName: row.uploaded_by
            ? profileMap.get(row.uploaded_by) ?? null
            : null,
        competencyId: row.competency_id,
        competencyName: row.competency_id
            ? competencyMap.get(row.competency_id) ?? null
            : null,
        courseId: row.course_id,
        courseTitle: row.course_id ? courseMap.get(row.course_id)?.title ?? null : null,
        createdAt: row.created_at,
    }));
}
