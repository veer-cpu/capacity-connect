import type { ReactNode } from "react";

import { RoleShell } from "@/components/layout/role-shell";
import { requireRole } from "@/lib/auth/require-role";

export default async function TrainerLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("trainer");

  return <RoleShell role="trainer">{children}</RoleShell>;
}
