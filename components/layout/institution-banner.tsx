import {
  CloudSun,
  ShieldCheck,
} from "lucide-react";

export function InstitutionBanner() {
  return (
    <div className="border-b bg-muted/30">
      <div className="flex min-h-10 items-center justify-between gap-4 px-4 py-2 lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <CloudSun className="size-4 shrink-0 text-muted-foreground" />

          <p className="truncate text-xs font-medium tracking-wide text-muted-foreground sm:text-sm">
            Capacity Connect · Competency Intelligence
            & Capacity Development
          </p>
        </div>

        <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
          <ShieldCheck className="size-3.5" />

          <span>
            Designed for MoES / IMD
          </span>
        </div>
      </div>
    </div>
  );
}