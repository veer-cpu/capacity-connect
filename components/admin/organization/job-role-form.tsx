import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { JobRole, OrganizationalUnit } from "@/lib/admin/get-organization";

import { upsertJobRole } from "@/app/admin/organization/actions";

type JobRoleFormProps = {
  role?: JobRole;
  units: OrganizationalUnit[];
};

export function JobRoleForm({ role, units }: JobRoleFormProps) {
  return (
    <form
      key={role ? `${role.id}-${role.updatedAt}` : "create-role"}
      action={upsertJobRole}
      className="grid gap-4 sm:grid-cols-2"
    >
      {role && <input type="hidden" name="roleId" value={role.id} />}

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Name</span>
        <Input
          name="name"
          defaultValue={role?.name ?? ""}
          required
          minLength={2}
          maxLength={150}
        />
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Code</span>
        <Input name="code" defaultValue={role?.code ?? ""} maxLength={50} />
      </label>

      <label className="space-y-1.5 text-sm sm:col-span-2">
        <span className="block font-medium">Description</span>
        <Textarea
          name="description"
          defaultValue={role?.description ?? ""}
          maxLength={1000}
          rows={3}
        />
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Organizational Unit</span>
        <Select
          name="organizationalUnitId"
          defaultValue={role?.organizationalUnitId ?? "none"}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Unassigned</SelectItem>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Status</span>
        <Select
          name="isActive"
          defaultValue={role ? String(role.isActive) : "true"}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </label>

      <div className="flex items-end sm:col-span-2">
        <Button type="submit" variant={role ? "outline" : "default"}>
          {role ? "Save Changes" : "Create Job Role"}
        </Button>
      </div>
    </form>
  );
}
