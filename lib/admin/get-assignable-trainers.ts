import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type AssignableTrainer = {
	trainerId: string;
	fullName: string | null;
	email: string;
};

type AssignableTrainerRow = {
	trainer_id: string;
	full_name: string | null;
	email: string;
};

export async function getAssignableTrainers(): Promise<AssignableTrainer[]> {
	await requireRole("admin");

	const supabase = await createClient();
	const { data, error } = await supabase.rpc(
		"admin_list_assignable_trainers"
	);

	if (error) {
		console.error("Unable to load assignable trainers:", {
			message: error.message,
			code: error.code,
			details: error.details,
			hint: error.hint,
		});

		throw new Error(`Unable to load assignable trainers: ${error.message}`);
	}

	return (data ?? []).map((row: AssignableTrainerRow) => ({
		trainerId: row.trainer_id,
		fullName: row.full_name,
		email: row.email,
	}));
}
