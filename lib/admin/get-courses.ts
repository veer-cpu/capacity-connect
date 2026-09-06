import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type AdminCourseDifficulty = "beginner" | "intermediate" | "advanced";
export type AdminCourseStatus = "draft" | "published" | "archived";

export type AdminCourse = {
	courseId: string;
	title: string;
	slug: string;
	description: string | null;
	category: string | null;
	difficulty: AdminCourseDifficulty;
	status: AdminCourseStatus;
	trainerId: string | null;
	trainerName: string | null;
	estimatedDurationMinutes: number | null;
	createdAt: string;
};

type AdminCourseRow = {
	course_id: string;
	title: string;
	slug: string;
	description: string | null;
	category: string | null;
	difficulty: AdminCourseDifficulty;
	status: AdminCourseStatus;
	trainer_id: string | null;
	trainer_name: string | null;
	estimated_duration_minutes: number | string | null;
	created_at: string;
};

export async function getAdminCourses(): Promise<AdminCourse[]> {
	await requireRole("admin");

	const supabase = await createClient();
	const { data, error } = await supabase.rpc("admin_list_courses");

	if (error) {
		console.error("Unable to load admin courses:", {
			message: error.message,
			code: error.code,
			details: error.details,
			hint: error.hint,
		});

		throw new Error(`Unable to load courses: ${error.message}`);
	}

	return (data ?? []).map((row: AdminCourseRow) => ({
		courseId: row.course_id,
		title: row.title,
		slug: row.slug,
		description: row.description,
		category: row.category,
		difficulty: row.difficulty,
		status: row.status,
		trainerId: row.trainer_id,
		trainerName: row.trainer_name,
		estimatedDurationMinutes:
			row.estimated_duration_minutes === null
				? null
				: Number(row.estimated_duration_minutes),
		createdAt: row.created_at,
	}));
}
