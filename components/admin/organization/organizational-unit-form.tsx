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
import type { OrganizationalUnit } from "@/lib/admin/get-organization";

import { upsertOrganizationalUnit } from "@/app/admin/organization/actions";

type OrganizationalUnitFormProps = {
  unit?: OrganizationalUnit;
  units: OrganizationalUnit[];
};

export function OrganizationalUnitForm({
  unit,
  units,
}: OrganizationalUnitFormProps) {
  const parentOptions = units.filter((candidate) => candidate.id !== unit?.id);

  return (
    <form
      key={unit ? `${unit.id}-${unit.updatedAt}` : "create-unit"}
      action={upsertOrganizationalUnit}
      className="grid gap-4 sm:grid-cols-2"
    >
      {unit && <input type="hidden" name="unitId" value={unit.id} />}

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Name</span>
        <Input
          name="name"
          defaultValue={unit?.name ?? ""}
          required
          minLength={2}
          maxLength={150}
        />
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Code</span>
        <Input name="code" defaultValue={unit?.code ?? ""} maxLength={50} />
      </label>

      <label className="space-y-1.5 text-sm sm:col-span-2">
        <span className="block font-medium">Description</span>
        <Textarea
          name="description"
          defaultValue={unit?.description ?? ""}
          maxLength={1000}
          rows={3}
        />
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Parent Unit</span>
        <Select name="parentUnitId" defaultValue={unit?.parentUnitId ?? "none"}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No parent</SelectItem>
            {parentOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Status</span>
        <Select
          name="isActive"
          defaultValue={unit ? String(unit.isActive) : "true"}
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
        <Button type="submit" variant={unit ? "outline" : "default"}>
          {unit ? "Save Changes" : "Create Organizational Unit"}
        </Button>
      </div>
    </form>
  );
}
