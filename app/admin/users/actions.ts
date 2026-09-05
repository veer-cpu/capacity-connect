"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const userIdSchema = z.object({
  userId: z.string().uuid(),
});

async function performAdminAction(
  rpcName: "admin_approve_user" | "admin_deactivate_user" | "admin_reactivate_user",
  userId: string
) {
  await requireRole("admin");

  const supabase = await createClient();

  const { error } = await supabase.rpc(rpcName, {
    p_user_id: userId,
  });

  if (error) {
    console.error(`Admin RPC error for ${rpcName}:`, {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(
      `Unable to complete admin action: ${error.message}`
    );
  }
}
export async function setUserRole(
  formData: FormData
): Promise<void> {
  await requireRole("admin");

  const userIdResult =
    z.string().uuid().safeParse(
      formData.get("userId")
    );

  const roleResult =
    z.enum([
      "trainee",
      "trainer",
    ]).safeParse(
      formData.get("newRole")
    );

  if (
    !userIdResult.success ||
    !roleResult.success
  ) {
    throw new Error(
      "Invalid role change request."
    );
  }

  const supabase =
    await createClient();

  const {
    error,
  } = await supabase.rpc(
    "admin_set_user_role",
    {
      p_user_id:
        userIdResult.data,

      p_new_role:
        roleResult.data,
    }
  );

  if (error) {
    console.error(
      "Unable to change user role:",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }
    );

    throw new Error(
      `Unable to change role: ${error.message}`
    );
  }

  revalidatePath(
    "/admin/users"
  );
}

export async function approveUser(formData: FormData): Promise<void> {
  const parsed = userIdSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    throw new Error("Invalid user ID.");
  }

  await performAdminAction("admin_approve_user", parsed.data.userId);
  revalidatePath("/admin/users");
}

export async function deactivateUser(formData: FormData): Promise<void> {
  const parsed = userIdSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    throw new Error("Invalid user ID.");
  }

  await performAdminAction("admin_deactivate_user", parsed.data.userId);
  revalidatePath("/admin/users");
}

export async function reactivateUser(formData: FormData): Promise<void> {
  const parsed = userIdSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    throw new Error("Invalid user ID.");
  }

  await performAdminAction("admin_reactivate_user", parsed.data.userId);
  revalidatePath("/admin/users");
}
