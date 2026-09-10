import { z } from "zod";
import {
  isKnowledgeResourceType,
  sanitizeSearchTerm,
  type KnowledgeResourceType,
} from "@/lib/knowledge-hub/constants"
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

import {
  buildRelatedNameMaps,
} from "@/lib/knowledge-hub/server"

export type ApprovedKnowledgeResource = {
    id: string;
    title: string;
    description: string | null;
    resourceType: KnowledgeResourceType;
    category: string | null;
    externalUrl: string | null;
    hasFile: boolean;
    mimeType: string | null;
    fileSizeBytes: number | null;
    uploadedByName: string | null;
    competencyId: string | null;
    competencyName: string | null;
    courseId: string | null;
    courseTitle: string | null;
    createdAt: string;
};

export type ApprovedKnowledgeResourceFilters = {
    q?: string;
    type?: string;
    category?: string;
    competencyId?: string;
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
    uploaded_by: string | null;
    competency_id: string | null;
    course_id: string | null;
    created_at: string;
};

export async function getApprovedKnowledgeResources(
    filters: ApprovedKnowledgeResourceFilters = {}
): Promise<ApprovedKnowledgeResource[]> {
    await requireRole("trainee");

    const supabase = await createClient();

    let query = supabase
        .from("knowledge_resources")
        .select(
            "id, title, description, resource_type, category, external_url, storage_path, mime_type, file_size_bytes, uploaded_by, competency_id, course_id, created_at"
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false });

    if (isKnowledgeResourceType(filters.type)) {
        query = query.eq("resource_type", filters.type);
    }

    if (filters.category && filters.category !== "all") {
        query = query.eq("category", sanitizeSearchTerm(filters.category));
    }

    const competencyId = z.string().uuid().safeParse(filters.competencyId);
    if (competencyId.success) {
        query = query.eq("competency_id", competencyId.data);
    }

    const q = filters.q ? sanitizeSearchTerm(filters.q) : "";
    if (q) {
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Unable to load approved knowledge resources:", {
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
        mimeType: row.mime_type,
        fileSizeBytes: row.file_size_bytes,
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

/** Distinct categories among currently approved resources, used to populate the category filter. */
export async function getApprovedKnowledgeResourceCategories(): Promise<string[]> {
    await requireRole("trainee");

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("knowledge_resources")
        .select("category")
        .eq("status", "approved")
        .not("category", "is", null);

    if (error) {
        console.error("Unable to load knowledge resource categories:", error);
        return [];
    }

    const categories = new Set<string>();
    for (const row of data ?? []) {
        if (row.category) {
            categories.add(row.category);
        }
    }

    return [...categories].sort();
}
