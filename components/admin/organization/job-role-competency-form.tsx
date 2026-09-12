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
import type {
  CompetencyOption,
  JobRoleCompetency,
} from "@/lib/admin/get-organization";

import { setJobRoleCompetency } from "@/app/admin/organization/actions";

type JobRoleCompetencyFormProps = {
  jobRoleId: string;
  competencies: CompetencyOption[];
  requirement?: JobRoleCompetency;
};

export function JobRoleCompetencyForm({
  jobRoleId,
  competencies,
  requirement,
}: JobRoleCompetencyFormProps) {
  const defaultCompetencyId = requirement?.competencyId ?? competencies[0]?.id;

  return (
    <form
      key={requirement ? requirement.id : `${jobRoleId}-new-requirement`}
      action={setJobRoleCompetency}
      className="grid gap-4 sm:grid-cols-2"
    >
      <input type="hidden" name="jobRoleId" value={jobRoleId} />

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Competency</span>
        <Select name="competencyId" defaultValue={defaultCompetencyId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select competency" />
          </SelectTrigger>
          <SelectContent>
            {competencies.map((competency) => (
              <SelectItem key={competency.id} value={competency.id}>
                {competency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Required Score (0-100)</span>
        <Input
          type="number"
          name="requiredScore"
          min={0}
          max={100}
          step="any"
          defaultValue={requirement?.requiredScore}
          required
        />
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Importance</span>
        <Select
          name="importance"
          defaultValue={requirement?.importance ?? "important"}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="core">Core</SelectItem>
            <SelectItem value="important">Important</SelectItem>
            <SelectItem value="supporting">Supporting</SelectItem>
          </SelectContent>
        </Select>
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Rationale</span>
        <Textarea
          name="rationale"
          defaultValue={requirement?.rationale ?? ""}
          maxLength={1000}
          rows={1}
        />
      </label>

      <div className="flex items-end sm:col-span-2">
        <Button type="submit" variant={requirement ? "outline" : "default"}>
          {requirement ? "Update Requirement" : "Add Requirement"}
        </Button>
      </div>
    </form>
  );
}
