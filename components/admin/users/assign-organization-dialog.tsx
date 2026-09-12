"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { assignTraineeOrganization } from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobRole, OrganizationalUnit } from "@/lib/admin/get-organization";

const NONE = "none";

type AssignOrganizationDialogProps = {
  userId: string;
  fullName: string;
  organizationalUnitId: string | null;
  jobRoleId: string | null;
  units: OrganizationalUnit[];
  roles: JobRole[];
};

export function AssignOrganizationDialog({
  userId,
  fullName,
  organizationalUnitId,
  jobRoleId,
  units,
  roles,
}: AssignOrganizationDialogProps) {
  const [open, setOpen] = useState(false);
  const [unitId, setUnitId] = useState(organizationalUnitId ?? NONE);
  const [roleId, setRoleId] = useState(jobRoleId ?? NONE);
  const [isPending, startTransition] = useTransition();

  // Roles scoped to the selected unit, plus roles that aren't tied to any unit.
  const filteredRoles = useMemo(
    () =>
      unitId === NONE
        ? roles
        : roles.filter(
            (role) =>
              role.organizationalUnitId === unitId ||
              role.organizationalUnitId === null,
          ),
    [roles, unitId],
  );

  function handleUnitChange(value: string | null) {
    const nextUnitId = value ?? NONE;
    setUnitId(nextUnitId);
    const roleStillValid = roles.some(
      (role) =>
        role.id === roleId &&
        (nextUnitId === NONE ||
          role.organizationalUnitId === nextUnitId ||
          role.organizationalUnitId === null),
    );
    if (!roleStillValid) {
      setRoleId(NONE);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setUnitId(organizationalUnitId ?? NONE);
      setRoleId(jobRoleId ?? NONE);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await assignTraineeOrganization(formData);
        toast.success("Organization assignment updated.");
        setOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to update organization assignment.",
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        Organization
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Organization & Role</DialogTitle>
          <DialogDescription>
            Set {fullName}&apos;s organizational unit and job role used for
            training need analysis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="organizationalUnitId" value={unitId} />
          <input type="hidden" name="jobRoleId" value={roleId} />

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Organizational Unit</label>
            <Select value={unitId} onValueChange={handleUnitChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Unassigned</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Job Role</label>
            <Select
              value={roleId}
              onValueChange={(value) => setRoleId(value ?? NONE)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Unassigned</SelectItem>
                {filteredRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filteredRoles.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No job roles are defined for this organizational unit yet.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
