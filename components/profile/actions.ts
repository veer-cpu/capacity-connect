"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const idSchema = z.string().uuid();

const optionalText = (maxLength = 500) =>
    z
        .string()
        .trim()
        .max(maxLength)
        .transform((value) => (value === "" ? undefined : value))
        .optional()

const completionYearSchema = z.preprocess(
    (value) => {
        if (value === "" || value === null || value === undefined) {
            return undefined
        }

        return Number(value)
    },
    z
        .number()
        .int()
        .min(1950)
        .max(2100)
        .optional()
)

const qualificationSchema = z.object({
    qualification: z
        .string()
        .trim()
        .min(2, "Qualification is required.")
        .max(150),

    fieldOfStudy: optionalText(150),

    institution: optionalText(200),

    completionYear: completionYearSchema,
})
const experienceSchema = z.object({ organization: z.string().trim().min(1).max(150), roleTitle: z.string().trim().min(1).max(150), department: optionalText(150), startDate: z.string().date(), endDate: z.union([z.string().date(), z.literal("")]).transform((value) => value || null), description: optionalText(2000) }).refine((value) => !value.endDate || value.endDate >= value.startDate, { path: ["endDate"] });
const certificationSchema = z.object({ name: z.string().trim().min(1).max(150), issuingOrganization: optionalText(150), issueDate: z.union([z.string().date(), z.literal("")]).transform((value) => value || null), expiryDate: z.union([z.string().date(), z.literal("")]).transform((value) => value || null), credentialId: optionalText(150), credentialUrl: z.union([z.string().url(), z.literal("")]).transform((value) => value || null) }).refine((value) => !value.issueDate || !value.expiryDate || value.expiryDate >= value.issueDate, { path: ["expiryDate"] });

async function authenticatedProfileClient() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) redirect("/login");
    const { data: profile } = await supabase.from("profiles").select("is_approved, is_active").eq("id", user.id).single();
    if (!profile?.is_approved || !profile.is_active) redirect("/login");
    return { supabase, user };
}

function profilePath(formData: FormData) { const path = formData.get("profilePath"); return path === "/trainee/profile" || path === "/trainer/profile" ? path : "/settings"; }
function revalidateProfile(path: string) { revalidatePath(path); }


export async function addQualification(formData: FormData) {
    const parsed = qualificationSchema.safeParse({
        qualification: formData.get("qualification"),
        fieldOfStudy: formData.get("fieldOfStudy"),
        institution: formData.get("institution"),
        completionYear: formData.get("completionYear"),
    })

    if (!parsed.success) {
        console.error(
            "Qualification validation failed:",
            parsed.error.flatten()
        )

        throw new Error("Invalid qualification details.")
    }

    const { supabase, user } = await authenticatedProfileClient()

    const { error } = await supabase
        .from("profile_qualifications")
        .insert({
            user_id: user.id,
            qualification: parsed.data.qualification,
            field_of_study: parsed.data.fieldOfStudy ?? null,
            institution: parsed.data.institution ?? null,
            completion_year: parsed.data.completionYear ?? null,
        })

    if (error) {
        console.error("Unable to save qualification:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
        })

        throw new Error("Unable to save qualification.")
    }

    revalidateProfile(profilePath(formData))
}
export async function updateQualification(formData: FormData) {
    const parsed = qualificationSchema.safeParse({
        qualification: formData.get("qualification"),
        fieldOfStudy: formData.get("fieldOfStudy"),
        institution: formData.get("institution"),
        completionYear: formData.get("completionYear"),
    })

    const id = idSchema.safeParse(formData.get("id"))

    if (!parsed.success || !id.success) {
        console.error("Qualification update validation failed", {
            validation: parsed.success
                ? null
                : parsed.error.flatten(),
            idValid: id.success,
        })

        throw new Error("Invalid qualification details.")
    }

    const { supabase, user } = await authenticatedProfileClient()

    const { error } = await supabase
        .from("profile_qualifications")
        .update({
            qualification: parsed.data.qualification,
            field_of_study: parsed.data.fieldOfStudy ?? null,
            institution: parsed.data.institution ?? null,
            completion_year: parsed.data.completionYear ?? null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id.data)
        .eq("user_id", user.id)

    if (error) {
        console.error("Unable to update qualification:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
        })

        throw new Error("Unable to update qualification.")
    }

    revalidateProfile(profilePath(formData))
}
export async function deleteQualification(formData: FormData) { await deleteOwned("profile_qualifications", formData); }
export async function addWorkExperience(formData: FormData) {
  const parsed = experienceSchema.safeParse({
    organization: formData.get("organization"),
    roleTitle: formData.get("roleTitle"),
    department: formData.get("department"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    description: formData.get("description"),
  })

  if (!parsed.success) {
    console.error(
      "Work experience validation failed:",
      parsed.error.flatten()
    )

    throw new Error("Invalid work experience details.")
  }

  const { supabase, user } = await authenticatedProfileClient()

  const { error } = await supabase
    .from("profile_work_experiences")
    .insert({
      user_id: user.id,
      organization: parsed.data.organization,
      role_title: parsed.data.roleTitle,
      department: parsed.data.department ?? null,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      description: parsed.data.description ?? null,
    })

  if (error) {
    console.error("Unable to save work experience:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })

    throw new Error("Unable to save work experience.")
  }

  revalidateProfile(profilePath(formData))
}

export async function updateWorkExperience(formData: FormData) {
  const parsed = experienceSchema.safeParse({
    organization: formData.get("organization"),
    roleTitle: formData.get("roleTitle"),
    department: formData.get("department"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    description: formData.get("description"),
  })

  const id = idSchema.safeParse(formData.get("id"))

  if (!parsed.success || !id.success) {
    console.error("Work experience update validation failed:", {
      validation: parsed.success
        ? null
        : parsed.error.flatten(),
      idValid: id.success,
    })

    throw new Error("Invalid work experience details.")
  }

  const { supabase, user } = await authenticatedProfileClient()

  const { error } = await supabase
    .from("profile_work_experiences")
    .update({
      organization: parsed.data.organization,
      role_title: parsed.data.roleTitle,
      department: parsed.data.department ?? null,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      description: parsed.data.description ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id.data)
    .eq("user_id", user.id)

  if (error) {
    console.error("Unable to update work experience:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })

    throw new Error("Unable to update work experience.")
  }

  revalidateProfile(profilePath(formData))
}
export async function deleteWorkExperience(formData: FormData) { await deleteOwned("profile_work_experiences", formData); }
export async function addInterest(formData: FormData) { const parsed = z.string().trim().min(1).max(100).safeParse(formData.get("name")); if (!parsed.success) throw new Error("Invalid professional interest."); const { supabase, user } = await authenticatedProfileClient(); const { error } = await supabase.from("profile_interests").insert({ user_id: user.id, name: parsed.data }); if (error) throw new Error("Unable to save professional interest."); revalidateProfile(profilePath(formData)); }
export async function deleteInterest(formData: FormData) { await deleteOwned("profile_interests", formData); }
export async function addExternalCertification(
  formData: FormData
) {
  const parsed = certificationSchema.safeParse({
    name: formData.get("name"),
    issuingOrganization: formData.get("issuingOrganization"),
    issueDate: formData.get("issueDate"),
    expiryDate: formData.get("expiryDate"),
    credentialId: formData.get("credentialId"),
    credentialUrl: formData.get("credentialUrl"),
  })

  if (!parsed.success) {
    console.error(
      "External certification validation failed:",
      parsed.error.flatten()
    )

    throw new Error(
      "Invalid external certification details."
    )
  }

  const { supabase, user } =
    await authenticatedProfileClient()

  const { error } = await supabase
    .from("external_certifications")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      issuing_organization:
        parsed.data.issuingOrganization ?? null,
      issue_date: parsed.data.issueDate,
      expiry_date: parsed.data.expiryDate,
      credential_id: parsed.data.credentialId ?? null,
      credential_url: parsed.data.credentialUrl,
    })

  if (error) {
    console.error("Unable to save external certification:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })

    throw new Error(
      "Unable to save external certification."
    )
  }

  revalidateProfile(profilePath(formData))
}

export async function updateExternalCertification(
  formData: FormData
) {
  const parsed = certificationSchema.safeParse({
    name: formData.get("name"),
    issuingOrganization: formData.get("issuingOrganization"),
    issueDate: formData.get("issueDate"),
    expiryDate: formData.get("expiryDate"),
    credentialId: formData.get("credentialId"),
    credentialUrl: formData.get("credentialUrl"),
  })

  const id = idSchema.safeParse(formData.get("id"))

  if (!parsed.success || !id.success) {
    console.error(
      "External certification update validation failed:",
      {
        validation: parsed.success
          ? null
          : parsed.error.flatten(),
        idValid: id.success,
      }
    )

    throw new Error(
      "Invalid external certification details."
    )
  }

  const { supabase, user } =
    await authenticatedProfileClient()

  const { error } = await supabase
    .from("external_certifications")
    .update({
      name: parsed.data.name,
      issuing_organization:
        parsed.data.issuingOrganization ?? null,
      issue_date: parsed.data.issueDate,
      expiry_date: parsed.data.expiryDate,
      credential_id: parsed.data.credentialId ?? null,
      credential_url: parsed.data.credentialUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id.data)
    .eq("user_id", user.id)

  if (error) {
    console.error(
      "Unable to update external certification:",
      {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      }
    )

    throw new Error(
      "Unable to update external certification."
    )
  }

  revalidateProfile(profilePath(formData))
}

export async function deleteExternalCertification(formData: FormData) { await deleteOwned("external_certifications", formData); }

async function deleteOwned(
  table:
    | "profile_qualifications"
    | "profile_work_experiences"
    | "profile_interests"
    | "external_certifications",
  formData: FormData
) {
  const id = idSchema.safeParse(formData.get("id"))

  if (!id.success) {
    throw new Error("Invalid record.")
  }

  const { supabase, user } =
    await authenticatedProfileClient()

  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id.data)
    .eq("user_id", user.id)

  if (error) {
    console.error(`Unable to remove ${table} record:`, {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })

    throw new Error("Unable to remove record.")
  }

  revalidateProfile(profilePath(formData))
}