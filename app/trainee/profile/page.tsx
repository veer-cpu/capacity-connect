import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

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

      <div className="mt-6 space-y-2">
        <p>
          <strong>Name:</strong>{" "}
          {profile?.full_name ?? "Not provided"}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {profile?.email ?? "Not provided"}
        </p>

        <p>
          <strong>Designation:</strong>{" "}
          {profile?.designation ?? "Not provided"}
        </p>

        <p>
          <strong>Department:</strong>{" "}
          {profile?.department ?? "Not provided"}
        </p>

        <p>
          <strong>Employee Code:</strong>{" "}
          {traineeProfile?.employee_code ?? "Not provided"}
        </p>

        <p>
          <strong>Qualifications:</strong>{" "}
          {traineeProfile?.qualifications ?? "Not provided"}
        </p>

        <p>
          <strong>Work Experience:</strong>{" "}
          {traineeProfile?.work_experience ?? "Not provided"}
        </p>

        <p>
          <strong>Professional Interests:</strong>{" "}
          {traineeProfile?.professional_interests ?? "Not provided"}
        </p>
      </div>
    </main>
  );
}