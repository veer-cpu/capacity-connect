import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type AdminCourseCompetency = {
	competencyId: string;
	competencyName: string;
	relevanceWeight: number;
	mapped: boolean;
};

type AdminCourseCompetencyRow = {
	competency_id: string;
	competency_name: string;
	relevance_weight: number | string | null;
	mapped: boolean | null;
};

export async function getAdminCourseCompetencies(
	courseId: string
): Promise<AdminCourseCompetency[]> {
	await requireRole("admin");

	const parsedCourseId = z.string().uuid().safeParse(courseId);

	if (!parsedCourseId.success) {
		throw new Error("Invalid course ID.");
	}

	const supabase = await createClient();
	const { data, error } = await supabase.rpc(
		"admin_list_course_competencies",
		{ p_course_id: parsedCourseId.data }
	);

	if (error) {
		console.error("Unable to load course competencies:", {
			message: error.message,
			code: error.code,
			details: error.details,
			hint: error.hint,
		});

		throw new Error(`Unable to load course competencies: ${error.message}`);
	}

	return (data ?? []).map((row: AdminCourseCompetencyRow) => ({
		competencyId: row.competency_id,
		competencyName: row.competency_name,
		relevanceWeight:
			row.relevance_weight === null ? 0 : Number(row.relevance_weight),
		mapped: Boolean(row.mapped),
	}));
}
