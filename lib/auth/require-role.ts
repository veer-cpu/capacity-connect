import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "trainee" | "trainer" | "admin";

export async function requireRole(requiredRole: AppRole) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_approved, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/login");
  }

  if (!profile.is_active || !profile.is_approved) {
    redirect("/login");
  }

  if (profile.role !== requiredRole) {
    if (profile.role === "admin") {
      redirect("/admin/dashboard");
    }

    if (profile.role === "trainer") {
      redirect("/trainer/dashboard");
    }

    redirect("/trainee/dashboard");
  }

  return {
    user,
    profile,
  };
}