import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type AdminCourseContent = {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    category: string | null;
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedDurationMinutes: number | null;
    status: "draft" | "published" | "archived";
    trainerId: string | null;
    trainerName: string | null;
    modules: AdminCourseModule[];
};

export type AdminCourseModule = {
    id: string;
    title: string;
    description: string | null;
    sequenceOrder: number;
    lessons: AdminCourseLesson[];
};

export type AdminCourseLesson = {
    id: string;
    title: string;
    content: string | null;
    sequenceOrder: number;
    isRequired: boolean;
};

type AdminCourseContentRow = {
    course_id: string;
    title: string;
    slug: string;
    description: string | null;
    category: string | null;
    difficulty: AdminCourseContent["difficulty"];
    estimated_duration_minutes: number | string | null;
    status: AdminCourseContent["status"];
    trainer_id: string | null;
    trainer_name: string | null;
    module_id: string | null;
    module_title: string | null;
    module_description: string | null;
    module_sequence_order: number | string | null;
    lesson_id: string | null;
    lesson_title: string | null;
    lesson_content: string | null;
    lesson_sequence_order: number | string | null;
    lesson_is_required: boolean | null;
};

export async function getAdminCourseContent(
    courseId: string,
): Promise<AdminCourseContent | null> {
    await requireRole("admin");

    const parsedCourseId = z.string().uuid().safeParse(courseId);
    if (!parsedCourseId.success) {
        throw new Error("Invalid course ID.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("admin_get_course_content", {
        p_course_id: parsedCourseId.data,
    });

    if (error) {
        console.error("Unable to load admin course content:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(`Unable to load course content: ${error.message}`);
    }

    const rows = (data ?? []) as AdminCourseContentRow[];
    if (rows.length === 0) {
        return null;
    }

    const firstRow = rows[0];
    const modules = new Map<string, AdminCourseModule>();

    for (const row of rows) {
        if (!row.module_id) {
            continue;
        }

        let module = modules.get(row.module_id);
        if (!module) {
            module = {
                id: row.module_id,
                title: row.module_title ?? "",
                description: row.module_description,
                sequenceOrder: Number(row.module_sequence_order ?? 0),
                lessons: [],
            };
            modules.set(row.module_id, module);
        }

        if (row.lesson_id) {
            module.lessons.push({
                id: row.lesson_id,
                title: row.lesson_title ?? "",
                content: row.lesson_content,
                sequenceOrder: Number(row.lesson_sequence_order ?? 0),
                isRequired: row.lesson_is_required ?? false,
            });
        }
    }

    return {
        id: firstRow.course_id,
        title: firstRow.title,
        slug: firstRow.slug,
        description: firstRow.description,
        category: firstRow.category,
        difficulty: firstRow.difficulty,
        estimatedDurationMinutes:
            firstRow.estimated_duration_minutes === null
                ? null
                : Number(firstRow.estimated_duration_minutes),
        status: firstRow.status,
        trainerId: firstRow.trainer_id,
        trainerName: firstRow.trainer_name,
        modules: [...modules.values()]
            .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
            .map((module) => ({
                ...module,
                lessons: module.lessons.sort(
                    (a, b) => a.sequenceOrder - b.sequenceOrder,
                ),
            })),
    };
}
