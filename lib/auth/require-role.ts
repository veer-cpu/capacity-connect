import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const APP_ROLES = [
  "trainee",
  "trainer",
  "admin",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type AuthenticatedProfile = {
  role: AppRole;
  is_approved: boolean;
  is_active: boolean;
};

function isAppRole(value: unknown): value is AppRole {
  return (
    typeof value === "string" &&
    APP_ROLES.includes(value as AppRole)
  );
}

export function dashboardForRole(role: AppRole) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";

    case "trainer":
      return "/trainer/dashboard";

    case "trainee":
      return "/trainee/dashboard";
  }
}

export async function requireAuthenticatedProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role, is_approved, is_active")
      .eq("id", user.id)
      .single();

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    !profile.is_approved ||
    !isAppRole(profile.role)
  ) {
    redirect("/login");
  }

  return {
    user,
    profile: profile as AuthenticatedProfile,
    supabase,
  };
}

export async function requireAnyRole(
  allowedRoles: readonly AppRole[],
) {
  const result = await requireAuthenticatedProfile();

  if (!allowedRoles.includes(result.profile.role)) {
    redirect(dashboardForRole(result.profile.role));
  }

  return result;
}

export async function requireRole(
  requiredRole: AppRole,
) {
  return requireAnyRole([requiredRole]);
}