"use client";
import { Grid3X3,BadgeCheck } from "lucide-react";
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
  Library,
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
    {
  label: "Competency Passport",
  href: "/trainee/passport",
  icon: BadgeCheck,
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
    {
      label: "Knowledge Hub",
      href: "/trainee/knowledge-hub",
      icon: Library,
    },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Settings", href: "/settings", icon: Settings2 },
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
    {
      label: "Knowledge Hub",
      href: "/trainer/knowledge-hub",
      icon: Library,
    },
    { label: "Profile", href: "/trainer/profile", icon: Settings2 },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Settings", href: "/settings", icon: Settings2 },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Courses", href: "/admin/courses", icon: BookOpen },
    { label: "Competencies", href: "/admin/competencies", icon: Target },
    { label: "Competency Heatmap", href: "/admin/heatmap", icon: BarChart3 },
    {
      label: "Capacity Grid",
      href: "/admin/capacity-grid",
      icon: Grid3X3,
    },
    { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
    {
      label: "Development Plans",
      href: "/admin/development-plans",
      icon: Network,
    },
    { label: "Certificates", href: "/admin/certificates", icon: FileBadge },
    {
      label: "Knowledge Hub",
      href: "/admin/knowledge-hub",
      icon: Library,
    },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Settings", href: "/settings", icon: Settings2 },
  ],
};

export function AppSidebar({ role }: { role: ShellRole }) {
  return (
    <aside className="hidden h-screen w-68 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <SidebarBrand role={role} />
      <Separator />
      <nav
        className="flex-1 space-y-1 overflow-y-auto p-4"
        aria-label="Primary navigation"
      >
        <NavigationLinks role={role} />
      </nav>
      <div className="border-t border-sidebar-border px-5 py-4 text-xs leading-5 text-sidebar-foreground/70">
        Capacity Building &amp; Competency Intelligence
      </div>
    </aside>
  );
}

export function SidebarBrand({ role }: { role: ShellRole }) {
  return (
    <div className="flex items-start gap-3 px-5 py-6">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[var(--institutional-saffron)] text-primary">
        <ShieldCheck className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-tight tracking-[0.16em] text-white">
          CAPACITY
        </p>
        <p className="text-sm font-bold leading-tight tracking-[0.16em] text-[var(--institutional-saffron)]">
          CONNECT
        </p>
        <p className="mt-1 text-xs text-sidebar-foreground/70">
          MoES / IMD Capacity Building
        </p>
        <Badge className="mt-3 rounded-sm bg-white/10 font-semibold tracking-[0.1em] text-white uppercase hover:bg-white/10">
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
            className={`flex items-center gap-3 border-l-2 px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-[var(--institutional-saffron)] bg-white/10 text-white"
                : "border-transparent text-sidebar-foreground/70 hover:bg-white/8 hover:text-white"
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
