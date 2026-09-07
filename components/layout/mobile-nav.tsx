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

export function MobileNav({ role }: { role: ShellRole }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:hidden">
      <div>
        <p className="text-sm font-bold leading-tight tracking-[0.16em]">
          CAPACITY CONNECT
        </p>
        <p className="text-xs text-muted-foreground">Competency Intelligence</p>
      </div>
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
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
    </header>
  );
}
