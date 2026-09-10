"use client";

import Link from "next/link";
import { LogOut, Settings, UserRound } from "lucide-react";

import { signOut } from "@/app/settings/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { ShellRole } from "./app-sidebar";

const profileRoutes: Partial<Record<ShellRole, string>> = {
  trainee: "/trainee/profile",
  trainer: "/trainer/profile",
};

type AccountMenuProps = {
  role: ShellRole;
  fullName: string | null;
  email?: string;
};

export function AccountMenu({ role, fullName, email }: AccountMenuProps) {
  const displayName = fullName || email || "Account";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const profileRoute = profileRoutes[role];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-10 max-w-64 gap-2 border border-transparent px-2 hover:border-border"
            aria-label="Open account menu"
          />
        }
      >
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden truncate text-left text-sm font-medium sm:block">
          {displayName}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">
            {displayName}
          </DropdownMenuLabel>
          {email ? (
            <DropdownMenuLabel className="truncate font-normal">
              {email}
            </DropdownMenuLabel>
          ) : null}
          {profileRoute ? (
            <DropdownMenuItem
  render={<Link href={profileRoute} />}
>
  <UserRound className="size-4" />
  My Profile
</DropdownMenuItem>
            
          ) : null}
          <DropdownMenuItem
  render={<Link href="/settings" />}
>
  <Settings className="size-4" />
  Settings
</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <form action={signOut}>
  <DropdownMenuItem
    nativeButton={true}
    render={
      <button
        type="submit"
        className="w-full"
      />
    }
  ><LogOut className="size-4" />
    Sign Out
  </DropdownMenuItem>
</form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
