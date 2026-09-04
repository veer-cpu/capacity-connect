import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TrainerProfileData = {
  fullName: string;
  designation: string | null;
  department: string | null;
  bio: string | null;

  yearsOfExperience: number | null;
  trainerBio: string | null;
  availabilityStatus:
    | "available"
    | "limited"
    | "unavailable";
};

export async function getTrainerProfile(): Promise<TrainerProfileData> {
  const { user } = await requireRole("trainer");

  const supabase = await createClient();

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      full_name,
      designation,
      department,
      bio
    `)
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error(
      "Unable to load trainer base profile:",
      profileError
    );

    throw new Error(
      "Unable to load trainer profile."
    );
  }

  const {
    data: trainerProfile,
    error: trainerProfileError,
  } = await supabase
    .from("trainer_profiles")
    .select(`
      years_of_experience,
      trainer_bio,
      availability_status
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  if (trainerProfileError) {
    console.error(
      "Unable to load trainer profile details:",
      trainerProfileError
    );

    throw new Error(
      "Unable to load trainer details."
    );
  }

  return {
    fullName:
      profile.full_name ?? "Trainer",

    designation:
      profile.designation,

    department:
      profile.department,

    bio:
      profile.bio,

    yearsOfExperience:
      trainerProfile?.years_of_experience !== null &&
      trainerProfile?.years_of_experience !== undefined
        ? Number(
            trainerProfile.years_of_experience
          )
        : null,

    trainerBio:
      trainerProfile?.trainer_bio ?? null,

    availabilityStatus:
      trainerProfile?.availability_status ??
      "limited",
  };
}