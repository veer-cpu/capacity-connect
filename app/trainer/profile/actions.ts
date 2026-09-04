"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const trainerProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2)
    .max(100),

  designation: z
    .string()
    .trim()
    .max(120)
    .optional(),

  department: z
    .string()
    .trim()
    .max(120)
    .optional(),

  bio: z
    .string()
    .trim()
    .max(500)
    .optional(),

  yearsOfExperience: z.coerce
    .number()
    .min(0)
    .max(60),

  trainerBio: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  availabilityStatus: z.enum([
    "available",
    "limited",
    "unavailable",
  ]),
});

export async function updateTrainerProfile(
  formData: FormData
) {
  const { user } =
    await requireRole("trainer");

  const parsed =
    trainerProfileSchema.safeParse({
      fullName:
        formData.get("fullName"),

      designation:
        formData.get("designation") || undefined,

      department:
        formData.get("department") || undefined,

      bio:
        formData.get("bio") || undefined,

      yearsOfExperience:
        formData.get("yearsOfExperience"),

      trainerBio:
        formData.get("trainerBio") || undefined,

      availabilityStatus:
        formData.get("availabilityStatus"),
    });

  if (!parsed.success) {
    throw new Error(
      "Invalid trainer profile data."
    );
  }

  const data = parsed.data;

  const supabase =
    await createClient();

  const {
    error: profileError,
  } = await supabase
    .from("profiles")
    .update({
      full_name:
        data.fullName,

      designation:
        data.designation ?? null,

      department:
        data.department ?? null,

      bio:
        data.bio ?? null,
    })
    .eq("id", user.id);

  if (profileError) {
    console.error(
      "Unable to update base trainer profile:",
      profileError
    );

    throw new Error(
      "Unable to update trainer profile."
    );
  }

  const {
    error: trainerProfileError,
  } = await supabase
    .from("trainer_profiles")
    .upsert(
      {
        user_id:
          user.id,

        years_of_experience:
          data.yearsOfExperience,

        trainer_bio:
          data.trainerBio ?? null,

        availability_status:
          data.availabilityStatus,
      },
      {
        onConflict: "user_id",
      }
    );

  if (trainerProfileError) {
    console.error(
      "Unable to update trainer profile details:",
      trainerProfileError
    );

    throw new Error(
      "Unable to update trainer details."
    );
  }

  revalidatePath(
    "/trainer/profile"
  );

  revalidatePath(
    "/trainer/dashboard"
  );

 
}