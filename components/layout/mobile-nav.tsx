"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { NavigationLinks, SidebarBrand, type ShellRole } from "./app-sidebar";
import { AccountMenu } from "./account-menu";

export function MobileNav({
  role,
  fullName,
  email,
}: {
  role: ShellRole;
  fullName: string | null;
  email?: string;
}) {
  return (
    <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between border-b border-sidebar-border bg-primary px-4 py-2 text-primary-foreground lg:hidden">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold leading-tight tracking-[0.12em]">
          CAPACITY CONNECT
        </p>
        <p className="truncate text-xs text-primary-foreground/70">
          Designed for MoES / IMD
        </p>
      </div>
      <div className="flex items-center gap-2">
        <AccountMenu role={role} fullName={fullName} email={email} />
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="secondary"
                size="icon"
                aria-label="Open navigation"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(20rem,85vw)] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <SidebarBrand role={role} />
            <nav
              className="flex-1 overflow-y-auto px-4 pb-6"
              aria-label="Mobile navigation"
            >
              <NavigationLinks role={role} />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
