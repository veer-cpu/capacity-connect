import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type AdminTrainerCompetency = {
	trainerId: string;
	trainerName: string | null;
	trainerEmail: string;
	competencyId: string;
	competencyName: string;
	expertiseScore: number;
	yearsExperience: number;
	verified: boolean;
};

type AdminTrainerCompetencyRow = {
	trainer_id: string;
	trainer_name: string | null;
	trainer_email: string;
	competency_id: string;
	competency_name: string;
	expertise_score: number | string;
	years_experience: number | string;
	verified: boolean | null;
};

export async function getAdminTrainerCompetencies(): Promise<
	AdminTrainerCompetency[]
> {
	await requireRole("admin");

	const supabase = await createClient();
	const { data, error } = await supabase.rpc(
		"admin_list_trainer_competencies"
	);

	if (error) {
		console.error("Unable to load trainer competencies:", {
			message: error.message,
			code: error.code,
			details: error.details,
			hint: error.hint,
		});

		throw new Error(`Unable to load trainer competencies: ${error.message}`);
	}

	return (data ?? []).map((row: AdminTrainerCompetencyRow) => ({
		trainerId: row.trainer_id,
		trainerName: row.trainer_name,
		trainerEmail: row.trainer_email,
		competencyId: row.competency_id,
		competencyName: row.competency_name,
		expertiseScore: Number(row.expertise_score),
		yearsExperience: Number(row.years_experience),
		verified: Boolean(row.verified),
	}));
}
