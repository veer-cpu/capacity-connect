"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";

const profileSchema = z.object({
  full_name: z.string().min(2).max(100),
  designation: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),

  employee_code: z.string().max(50).optional(),
  qualifications: z.string().max(1000).optional(),
  work_experience: z.string().max(2000).optional(),
  professional_interests: z.string().max(1000).optional(),
});

export type ProfileActionState = {
  success: boolean;
  message: string;
};

export async function updateTraineeProfile(
  _previousState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const { user } = await requireRole("trainee");

  const rawData = {
    full_name: formData.get("full_name"),
    designation: formData.get("designation"),
    department: formData.get("department"),
    bio: formData.get("bio"),

    employee_code: formData.get("employee_code"),
    qualifications: formData.get("qualifications"),
    work_experience: formData.get("work_experience"),
    professional_interests: formData.get("professional_interests"),
  };

  const result = profileSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      message: "Please check the form values and try again.",
    };
  }

  const data = result.data;

  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      designation: data.designation || null,
      department: data.department || null,
      bio: data.bio || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    console.error("Profile update failed:", profileError);

    return {
      success: false,
      message: "Unable to update your profile.",
    };
  }

  const { error: traineeError } = await supabase
    .from("trainee_profiles")
    .upsert(
      {
        user_id: user.id,
        employee_code: data.employee_code || null,
        qualifications: data.qualifications || null,
        work_experience: data.work_experience || null,
        professional_interests: data.professional_interests || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (traineeError) {
    console.error("Trainee profile update failed:", traineeError);

    return {
      success: false,
      message: "Basic profile updated, but trainee details could not be saved.",
    };
  }

  revalidatePath("/trainee/profile");

  return {
    success: true,
    message: "Profile updated successfully.",
  };
}