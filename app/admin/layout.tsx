import type { ReactNode } from "react";

import { RoleShell } from "@/components/layout/role-shell";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("admin");

  return <RoleShell role="admin">{children}</RoleShell>;
}
