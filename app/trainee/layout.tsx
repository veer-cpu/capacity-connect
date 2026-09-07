import type { ReactNode } from "react";

import { RoleShell } from "@/components/layout/role-shell";
import { requireRole } from "@/lib/auth/require-role";

export default async function TraineeLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("trainee");

  return <RoleShell role="trainee">{children}</RoleShell>;
}
