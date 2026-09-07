import type { ReactNode } from "react";

import { AppSidebar, type ShellRole } from "./app-sidebar";
import { MobileNav } from "./mobile-nav";

export type RoleShellProps = {
  role: ShellRole;
  children: ReactNode;
};

export function RoleShell({ role, children }: RoleShellProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="flex min-h-screen">
        <AppSidebar role={role} />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileNav role={role} />
          <main className="min-h-[calc(100vh-4rem)] flex-1">
            <div className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
