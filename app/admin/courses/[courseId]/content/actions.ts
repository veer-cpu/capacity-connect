"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const uuid = z.string().uuid();
const optionalText = (max: number) =>
    z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().trim().max(max).optional(),
    );
const courseMetadataSchema = z.object({
    courseId: uuid,
    title: z.string().trim().min(2).max(150),
    description: optionalText(3000),
    category: optionalText(120),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    estimatedDurationMinutes: z.coerce.number().int().min(1),
});
const createModuleSchema = z.object({
    courseId: uuid,
    title: z.string().trim().min(2).max(150),
    description: optionalText(2000),
});
const moduleSchema = createModuleSchema.extend({ moduleId: uuid });
const createLessonSchema = z.object({
    courseId: uuid,
    moduleId: uuid,
    title: z.string().trim().min(2).max(150),
    content: optionalText(20000),
    isRequired: z.boolean(),
});
const lessonSchema = createLessonSchema.extend({ lessonId: uuid });
const moveSchema = z.object({
    id: uuid,
    courseId: uuid,
    direction: z.enum(["up", "down"]),
});

function checkboxValue(formData: FormData, name: string) {
    return formData.get(name) === "on" || formData.get(name) === "true";
}

function revalidateCourse(courseId: string) {
    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}/content`);
}

async function callAdminRpc(
    rpcName: string,
    params: Record<string, unknown>,
    errorMessage: string,
) {
    const supabase = await createClient();
    const { error } = await supabase.rpc(rpcName, params);
    if (error) {
        console.error(errorMessage, {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(`${errorMessage} ${error.message}`);
    }
}

export async function updateCourseMetadata(formData: FormData): Promise<void> {
    await requireRole("admin");
    const parsed = courseMetadataSchema.safeParse({
        courseId: formData.get("courseId"),
        title: formData.get("title"),
        description: formData.get("description"),
        category: formData.get("category"),
        difficulty: formData.get("difficulty"),
        estimatedDurationMinutes: formData.get("estimatedDurationMinutes"),
    });
    if (!parsed.success) throw new Error("Invalid course details.");

    await callAdminRpc(
        "admin_update_course_metadata",
        {
            p_course_id: parsed.data.courseId,
            p_title: parsed.data.title,
            p_description: parsed.data.description ?? null,
            p_category: parsed.data.category ?? null,
            p_difficulty: parsed.data.difficulty,
            p_estimated_duration_minutes: parsed.data.estimatedDurationMinutes,
        },
        "Unable to update course metadata:",
    );
    revalidateCourse(parsed.data.courseId);
}

export async function createModule(formData: FormData): Promise<void> {
    await requireRole("admin");
    const parsed = createModuleSchema.safeParse({
        courseId: formData.get("courseId"),
        title: formData.get("title"),
        description: formData.get("description"),
    });
    if (!parsed.success) throw new Error("Invalid module details.");

    await callAdminRpc("admin_create_module", {
        p_course_id: parsed.data.courseId,
        p_title: parsed.data.title,
        p_description: parsed.data.description ?? null,
    }, "Unable to create module:");
    revalidateCourse(parsed.data.courseId);
}

export async function updateModule(formData: FormData): Promise<void> {
    await requireRole("admin");
    const parsed = moduleSchema.safeParse({
        courseId: formData.get("courseId"),
        moduleId: formData.get("moduleId"),
        title: formData.get("title"),
        description: formData.get("description"),
    });
    if (!parsed.success) throw new Error("Invalid module details.");

    await callAdminRpc("admin_update_module", {
        p_module_id: parsed.data.moduleId,
        p_title: parsed.data.title,
        p_description: parsed.data.description ?? null,
    }, "Unable to update module:");
    revalidateCourse(parsed.data.courseId);
}

export async function moveModule(formData: FormData): Promise<void> {
    await requireRole("admin");
    const parsed = moveSchema.safeParse({
        id: formData.get("moduleId"),
        courseId: formData.get("courseId"),
        direction: formData.get("direction"),
    });
    if (!parsed.success) throw new Error("Invalid module move request.");

    await callAdminRpc("admin_move_module", {
        p_module_id: parsed.data.id,
        p_direction: parsed.data.direction,
    }, "Unable to move module:");
    revalidateCourse(parsed.data.courseId);
}

export async function createLesson(formData: FormData): Promise<void> {
    await requireRole("admin");
    const parsed = createLessonSchema.safeParse({
        courseId: formData.get("courseId"),
        moduleId: formData.get("moduleId"),
        title: formData.get("title"),
        content: formData.get("content"),
        isRequired: checkboxValue(formData, "isRequired"),
    });
    if (!parsed.success) throw new Error("Invalid lesson details.");

    await callAdminRpc("admin_create_lesson", {
        p_module_id: parsed.data.moduleId,
        p_title: parsed.data.title,
        p_content: parsed.data.content ?? null,
        p_is_required: parsed.data.isRequired,
    }, "Unable to create lesson:");
    revalidateCourse(parsed.data.courseId);
}

export async function updateLesson(formData: FormData): Promise<void> {
    await requireRole("admin");
    const parsed = lessonSchema.safeParse({
        courseId: formData.get("courseId"),
        moduleId: formData.get("moduleId"),
        lessonId: formData.get("lessonId"),
        title: formData.get("title"),
        content: formData.get("content"),
        isRequired: checkboxValue(formData, "isRequired"),
    });
    if (!parsed.success) throw new Error("Invalid lesson details.");

    await callAdminRpc("admin_update_lesson", {
        p_lesson_id: parsed.data.lessonId,
        p_title: parsed.data.title,
        p_content: parsed.data.content ?? null,
        p_is_required: parsed.data.isRequired,
    }, "Unable to update lesson:");
    revalidateCourse(parsed.data.courseId);
}

export async function moveLesson(formData: FormData): Promise<void> {
    await requireRole("admin");
    const parsed = moveSchema.safeParse({
        id: formData.get("lessonId"),
        courseId: formData.get("courseId"),
        direction: formData.get("direction"),
    });
    if (!parsed.success) throw new Error("Invalid lesson move request.");

    await callAdminRpc("admin_move_lesson", {
        p_lesson_id: parsed.data.id,
        p_direction: parsed.data.direction,
    }, "Unable to move lesson:");
    revalidateCourse(parsed.data.courseId);
}
