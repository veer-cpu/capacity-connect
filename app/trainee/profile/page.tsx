import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

import ProfileForm from "./profile-form";

export default async function TraineeProfilePage() {
  const { user } = await requireRole("trainee");

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, designation, department, bio")
    .eq("id", user.id)
    .single();

  const { data: traineeProfile } = await supabase
    .from("trainee_profiles")
    .select(
      "employee_code, qualifications, work_experience, professional_interests"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">
        My Profile
      </h1>

      <p className="mt-2 text-sm text-gray-600">
        {profile?.email}
      </p>

      <ProfileForm
        initialData={{
          full_name: profile?.full_name ?? "",
          designation: profile?.designation ?? "",
          department: profile?.department ?? "",
          bio: profile?.bio ?? "",

          employee_code:
            traineeProfile?.employee_code ?? "",

          qualifications:
            traineeProfile?.qualifications ?? "",

          work_experience:
            traineeProfile?.work_experience ?? "",

          professional_interests:
            traineeProfile?.professional_interests ?? "",
        }}
      />
    </main>
  );
}