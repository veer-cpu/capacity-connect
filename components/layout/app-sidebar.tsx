"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  BrainCircuit,
  ClipboardCheck,
  FileBadge,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Network,
  Settings2,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export type ShellRole = "trainee" | "trainer" | "admin";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const roleLabels: Record<ShellRole, string> = {
  trainee: "Trainee",
  trainer: "Trainer",
  admin: "Admin",
};

export const roleNavigation: Record<ShellRole, NavItem[]> = {
  trainee: [
    { label: "Dashboard", href: "/trainee/dashboard", icon: LayoutDashboard },
    { label: "My Learning", href: "/trainee/courses", icon: BookOpen },
    {
      label: "Assessments",
      href: "/trainee/assessments",
      icon: ClipboardCheck,
    },
    { label: "Skill Gaps", href: "/trainee/competencies", icon: Target },
    {
      label: "Course Recommendations",
      href: "/trainee/recommendations",
      icon: BrainCircuit,
    },
    {
      label: "Trainer Recommendations",
      href: "/trainee/trainers",
      icon: Users,
    },
    {
      label: "Development Plan",
      href: "/trainee/development-plan",
      icon: Gauge,
    },
    { label: "Certificates", href: "/trainee/certificates", icon: Award },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ],
  trainer: [
    { label: "Dashboard", href: "/trainer/dashboard", icon: LayoutDashboard },
    { label: "My Courses", href: "/trainer/courses", icon: BookOpen },
    { label: "Feedback", href: "/trainer/feedback", icon: MessageSquare },
    {
      label: "Development Plans",
      href: "/trainer/development-plans",
      icon: Network,
    },
    { label: "Profile", href: "/trainer/profile", icon: Settings2 },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Courses", href: "/admin/courses", icon: BookOpen },
    { label: "Competencies", href: "/admin/competencies", icon: Target },
    { label: "Competency Heatmap", href: "/admin/heatmap", icon: BarChart3 },
    { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
    {
      label: "Development Plans",
      href: "/admin/development-plans",
      icon: Network,
    },
    { label: "Certificates", href: "/admin/certificates", icon: FileBadge },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ],
};

export function AppSidebar({ role }: { role: ShellRole }) {
  return (
    <aside className="hidden h-screen w-68 shrink-0 flex-col border-r bg-background lg:flex">
      <SidebarBrand role={role} />
      <Separator />
      <nav
        className="flex-1 space-y-1 overflow-y-auto p-4"
        aria-label="Primary navigation"
      >
        <NavigationLinks role={role} />
      </nav>
      <div className="border-t p-4 text-xs text-muted-foreground">
        Competency Intelligence Platform
      </div>
    </aside>
  );
}

export function SidebarBrand({ role }: { role: ShellRole }) {
  return (
    <div className="flex items-start gap-3 px-5 py-6">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ShieldCheck className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-tight tracking-[0.16em]">
          CAPACITY
        </p>
        <p className="text-sm font-bold leading-tight tracking-[0.16em] text-primary">
          CONNECT
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Competency Intelligence
        </p>
        <Badge variant="secondary" className="mt-3 font-normal">
          {roleLabels[role]}
        </Badge>
      </div>
    </div>
  );
}

export function NavigationLinks({
  role,
  onNavigate,
}: {
  role: ShellRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {roleNavigation[role].map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={`${role}-${item.label}`}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}
