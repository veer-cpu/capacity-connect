"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const trainerCompetencySchema = z.object({
	trainerId: z.string().uuid(),
	competencyId: z.string().uuid(),
	expertiseScore: z.coerce.number().min(0).max(100),
	yearsExperience: z.coerce.number().min(0),
});

export async function updateTrainerCompetency(
	formData: FormData
): Promise<void> {
	await requireRole("admin");

	const parsed = trainerCompetencySchema.safeParse({
		trainerId: formData.get("trainerId"),
		competencyId: formData.get("competencyId"),
		expertiseScore: formData.get("expertiseScore"),
		yearsExperience: formData.get("yearsExperience"),
	});

	if (!parsed.success) {
		throw new Error("Invalid trainer competency data.");
	}

	const verified = formData.get("verified") === "on";
	const supabase = await createClient();
	const { error } = await supabase.rpc("admin_upsert_trainer_competency", {
		p_trainer_id: parsed.data.trainerId,
		p_competency_id: parsed.data.competencyId,
		p_expertise_score: parsed.data.expertiseScore,
		p_years_experience: parsed.data.yearsExperience,
		p_verified: verified,
	});

	if (error) {
		console.error("Unable to update trainer competency:", {
			message: error.message,
			code: error.code,
			details: error.details,
			hint: error.hint,
		});

		throw new Error(`Unable to update trainer competency: ${error.message}`);
	}

	revalidatePath("/admin/trainer-competencies");
}
