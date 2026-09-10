import type { ReactNode } from "react";
import {
  ProductFooter,
} from "@/components/layout/product-footer";
import { createClient } from "@/lib/supabase/server";
import {
  InstitutionBanner,
} from "@/components/layout/institution-banner";
import { AccountMenu } from "./account-menu";
import { AppSidebar, type ShellRole } from "./app-sidebar";
import { MobileNav } from "./mobile-nav";

export type RoleShellProps = {
  role: ShellRole;
  children: ReactNode;
};

export async function RoleShell({ role, children }: RoleShellProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="flex min-h-screen">
        <AppSidebar role={role} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="hidden border-b border-border bg-background lg:block">
            <div className="flex min-h-20 items-center justify-between gap-6 px-6 py-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.12em] text-[var(--institutional-slate)] uppercase">
                  Designed for MoES / IMD
                </p>
                <div className="mt-1 flex items-baseline gap-3">
                  <h1 className="font-heading text-xl font-bold text-primary">
                    CAPACITY CONNECT
                  </h1>
                  <span className="hidden h-4 w-px bg-[var(--institutional-saffron)] xl:block" />
                  <p className="hidden text-sm text-muted-foreground xl:block">
                    Competency Intelligence &amp; Capacity Building Platform
                  </p>
                </div>
              </div>
              <AccountMenu
                role={role}
                fullName={profile?.full_name ?? null}
                email={user?.email}
              />
            </div>
            <div className="h-1 bg-[var(--institutional-saffron)]" />
          </header>
          <MobileNav
            role={role}
            fullName={profile?.full_name ?? null}
            email={user?.email}
          />
          <InstitutionBanner />
          <main className="min-h-[calc(100vh-4rem)] flex-1">
            <div className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
          <ProductFooter />
        </div>
      </div>
    </div>
  );
}
