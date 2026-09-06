"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const optionalText = (max: number) =>
	z.preprocess(
		(value) => (value === "" ? undefined : value),
		z.string().max(max).optional()
	);

const courseSchema = z.object({
	title: z.string().trim().min(2).max(150),
	slug: z
		.string()
		.trim()
		.min(2)
		.max(150)
		.regex(/^[a-z0-9-]+$/, "Slug may contain only lowercase letters, numbers, and hyphens."),
	description: optionalText(2000),
	category: optionalText(100),
	difficulty: z.enum(["beginner", "intermediate", "advanced"]),
	estimatedDurationMinutes: z.preprocess(
		(value) => (value === "" ? undefined : value),
		z.coerce.number().int().min(0).optional()
	),
});

export async function createCourse(formData: FormData): Promise<void> {
	await requireRole("admin");

	const parsed = courseSchema.safeParse({
		title: formData.get("title"),
		slug: formData.get("slug"),
		description: formData.get("description"),
		category: formData.get("category"),
		difficulty: formData.get("difficulty"),
		estimatedDurationMinutes: formData.get("estimatedDurationMinutes"),
	});

	if (!parsed.success) {
		throw new Error("Invalid course details.");
	}

	const {
		title,
		slug,
		description,
		category,
		difficulty,
		estimatedDurationMinutes,
	} = parsed.data;
	const supabase = await createClient();
	const { error } = await supabase.rpc("admin_create_course", {
		p_title: title,
		p_slug: slug,
		p_description: description ?? null,
		p_category: category ?? null,
		p_difficulty: difficulty,
		p_estimated_duration_minutes: estimatedDurationMinutes ?? null,
	});

	if (error) {
		console.error("Unable to create admin course:", {
			message: error.message,
			code: error.code,
			details: error.details,
			hint: error.hint,
		});

		throw new Error(`Unable to create course: ${error.message}`);
	}

	revalidatePath("/admin/courses");
}

const assignmentSchema = z.object({
	courseId: z.string().uuid(),
	trainerId: z.string().uuid(),
});

export async function assignCourseTrainer(formData: FormData): Promise<void> {
	await requireRole("admin");

	const parsed = assignmentSchema.safeParse({
		courseId: formData.get("courseId"),
		trainerId: formData.get("trainerId"),
	});

	if (!parsed.success) {
		throw new Error("Invalid course trainer assignment.");
	}

	const supabase = await createClient();
	const { error } = await supabase.rpc("admin_assign_course_trainer", {
		p_course_id: parsed.data.courseId,
		p_trainer_id: parsed.data.trainerId,
	});

	if (error) {
		console.error("Unable to assign course trainer:", {
			message: error.message,
			code: error.code,
			details: error.details,
			hint: error.hint,
		});

		throw new Error(`Unable to assign course trainer: ${error.message}`);
	}

	revalidatePath("/admin/courses");
}
