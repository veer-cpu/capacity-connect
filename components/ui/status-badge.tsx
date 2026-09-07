import { Badge } from "@/components/ui/badge";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const statusStyles: Record<
  string,
  { variant: BadgeVariant; className?: string }
> = {
  active: {
    variant: "default",
    className: "border-emerald-200 bg-emerald-100 text-emerald-800",
  },
  completed: {
    variant: "default",
    className: "border-emerald-200 bg-emerald-100 text-emerald-800",
  },
  published: {
    variant: "default",
    className: "border-emerald-200 bg-emerald-100 text-emerald-800",
  },
  verified: {
    variant: "default",
    className: "border-emerald-200 bg-emerald-100 text-emerald-800",
  },
  draft: { variant: "secondary" },
  pending: {
    variant: "secondary",
    className: "border-amber-200 bg-amber-100 text-amber-800",
  },
  in_progress: {
    variant: "secondary",
    className: "border-sky-200 bg-sky-100 text-sky-800",
  },
  improving: {
    variant: "secondary",
    className: "border-sky-200 bg-sky-100 text-sky-800",
  },
  high: {
    variant: "secondary",
    className: "border-amber-200 bg-amber-100 text-amber-800",
  },
  critical: { variant: "destructive" },
  urgent: { variant: "destructive" },
  revoked: { variant: "destructive" },
  closed: { variant: "secondary" },
  archived: { variant: "secondary" },
  inactive: { variant: "secondary" },
};

function formatStatus(status: string) {
  return status
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.trim().toLowerCase();
  const style = statusStyles[normalizedStatus] ?? {
    variant: "outline" as const,
  };

  return (
    <Badge variant={style.variant} className={style.className}>
      {formatStatus(status)}
    </Badge>
  );
}
