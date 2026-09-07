import { Badge } from "@/components/ui/badge";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const statusStyles: Record<
  string,
  { variant: BadgeVariant; className?: string }
> = {
  active: {
    variant: "default",
  },
  approved: { variant: "default" },
  valid: { variant: "default" },
  completed: {
    variant: "default",
  },
  published: {
    variant: "default",
  },
  verified: {
    variant: "default",
  },
  draft: { variant: "secondary" },
  pending: { variant: "secondary" },
  in_progress: { variant: "secondary" },
  improving: { variant: "secondary" },
  high: { variant: "secondary" },
  medium: { variant: "secondary" },
  low: { variant: "secondary" },
  anonymous: { variant: "secondary" },
  needs_attention: { variant: "secondary" },
  critical: { variant: "destructive" },
  urgent: { variant: "destructive" },
  revoked: { variant: "destructive" },
  "deadline passed": { variant: "destructive" },
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
