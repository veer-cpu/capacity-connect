import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type ProfessionalProfile = {
    fullName: string | null;
    email: string | null;
    role: string;
    designation: string | null;
    department: string | null;
    bio: string | null;
    avatarUrl: string | null;
    qualifications: Qualification[];
    experiences: WorkExperience[];
    interests: Interest[];
    competencies: Competency[];
    externalCertifications: ExternalCertification[];
};

export type Qualification = { id: string; qualification: string; fieldOfStudy: string | null; institution: string | null; completionYear: number | null };
export type WorkExperience = { id: string; organization: string; roleTitle: string; department: string | null; startDate: string; endDate: string | null; description: string | null };
export type Interest = { id: string; name: string };
export type Competency = { id: string; name: string; currentScore: number; targetScore: number };
export type ExternalCertification = { id: string; name: string; issuingOrganization: string | null; issueDate: string | null; expiryDate: string | null; credentialId: string | null; credentialUrl: string | null };

export async function getProfessionalProfile(): Promise<ProfessionalProfile> {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) redirect("/login");

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email, role, designation, department, bio, avatar_url, is_approved, is_active")
        .eq("id", user.id)
        .single();
    if (profileError || !profile || !profile.is_approved || !profile.is_active) redirect("/login");

    const [qualificationsResult, experiencesResult, interestsResult, competenciesResult, certificationsResult] = await Promise.all([
        supabase.from("profile_qualifications").select("id, qualification, field_of_study, institution, completion_year").eq("user_id", user.id).order("completion_year", { ascending: false }),
        supabase.from("profile_work_experiences").select("id, organization, role_title, department, start_date, end_date, description").eq("user_id", user.id).order("start_date", { ascending: false }),
        supabase.from("profile_interests").select("id, name").eq("user_id", user.id).order("created_at", { ascending: true }),
        supabase.from("user_competencies").select("competency_id, current_score, target_score, competencies (name)").eq("user_id", user.id).order("current_score", { ascending: true }),
        supabase.from("external_certifications").select("id, name, issuing_organization, issue_date, expiry_date, credential_id, credential_url").eq("user_id", user.id).order("issue_date", { ascending: false }),
    ]);
    // if ([qualificationsResult, experiencesResult, interestsResult, competenciesResult, certificationsResult].some(({ error }) => error)) {
    //     throw new Error("Unable to load professional profile.");
    // }
    const results = {
        qualifications: qualificationsResult,
        experiences: experiencesResult,
        interests: interestsResult,
        competencies: competenciesResult,
        certifications: certificationsResult,
    }

    for (const [name, result] of Object.entries(results)) {
        if (result.error) {
            console.error("Professional profile query failed", {
  query: name,
  message: result.error.message,
  code: result.error.code,
  details: result.error.details,
  hint: result.error.hint,
})

           throw new Error("Unable to load professional profile.")
        }
    }

    return {
        fullName: profile.full_name,
        email: user.email ?? profile.email,
        role: profile.role,
        designation: profile.designation,
        department: profile.department,
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
        qualifications: (qualificationsResult.data ?? []).map((item) => ({ id: item.id, qualification: item.qualification, fieldOfStudy: item.field_of_study, institution: item.institution, completionYear: item.completion_year })),
        experiences: (experiencesResult.data ?? []).map((item) => ({ id: item.id, organization: item.organization, roleTitle: item.role_title, department: item.department, startDate: item.start_date, endDate: item.end_date, description: item.description })),
        interests: interestsResult.data ?? [],
        competencies: (competenciesResult.data ?? []).map((item) => {
            const competency = item.competencies as unknown as { name: string } | null;
            return { id: item.competency_id, name: competency?.name ?? "Competency", currentScore: Number(item.current_score), targetScore: Number(item.target_score) };
        }),
        externalCertifications: (certificationsResult.data ?? []).map((item) => ({ id: item.id, name: item.name, issuingOrganization: item.issuing_organization, issueDate: item.issue_date, expiryDate: item.expiry_date, credentialId: item.credential_id, credentialUrl: item.credential_url })),
    };
}