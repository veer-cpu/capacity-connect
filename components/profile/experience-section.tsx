import {
  addWorkExperience,
  deleteWorkExperience,
  updateWorkExperience,
} from "./actions";
import { DeleteButton, Empty, Field } from "./qualification-section";
import type { WorkExperience } from "@/lib/profile/get-professional-profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function ExperienceSection({
  items,
  profilePath,
}: {
  items: WorkExperience[];
  profilePath: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Experience</CardTitle>
        <CardDescription>
          Maintain your professional employment history.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ExperienceForm
          action={addWorkExperience}
          profilePath={profilePath}
          submitLabel="Add Work Experience"
        />
        {items.length === 0 ? (
          <Empty>No work experience added yet.</Empty>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
             <ExperienceForm
  key={[
    item.id,
    item.organization,
    item.roleTitle,
    item.department ?? "",
    item.startDate,
    item.endDate ?? "",
    item.description ?? "",
  ].join("-")}
                action={updateWorkExperience}
                profilePath={profilePath}
                submitLabel="Save Changes"
                item={item}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function ExperienceForm({
  action,
  profilePath,
  submitLabel,
  item,
}: {
  action: (formData: FormData) => Promise<void>;
  profilePath: string;
  submitLabel: string;
  item?: WorkExperience;
}) {
  return (
    <form
      action={action}
      className={
        item
          ? "grid gap-3 border-t border-border pt-4 sm:grid-cols-2"
          : "grid gap-3 sm:grid-cols-2"
      }
    >
      <input type="hidden" name="profilePath" value={profilePath} />
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <Field
        name="organization"
        label="Organization"
        defaultValue={item?.organization}
        required
      />
      <Field
        name="roleTitle"
        label="Role / Designation"
        defaultValue={item?.roleTitle}
        required
      />
      <Field
        name="department"
        label="Department"
        defaultValue={item?.department ?? ""}
      />
      <Field
        name="startDate"
        label="Start Date"
        type="date"
        defaultValue={item?.startDate}
        required
      />
      <Field
        name="endDate"
        label="End Date"
        type="date"
        defaultValue={item?.endDate ?? ""}
      />
      <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
        Description
        <Textarea name="description" defaultValue={item?.description ?? ""} />
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" variant={item ? "outline" : "default"}>
          {submitLabel}
        </Button>
        {item ? (
          <DeleteButton
            action={deleteWorkExperience}
          />
        ) : null}
      </div>
    </form>
  );
}
