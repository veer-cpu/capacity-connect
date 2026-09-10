import {
  addQualification,
  deleteQualification,
  updateQualification,
} from "./actions";
import type { Qualification } from "@/lib/profile/get-professional-profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function QualificationSection({
  items,
  profilePath,
}: {
  items: Qualification[];
  profilePath: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Qualifications</CardTitle>
        <CardDescription>
          Record your academic and professional qualifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={addQualification} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="profilePath" value={profilePath} />
          <Field name="qualification" label="Qualification" required />
          <Field name="fieldOfStudy" label="Field of Study" />
          <Field name="institution" label="Institution" />
          <Field
            name="completionYear"
            label="Completion Year"
            type="number"
            min="1950"
            max="2100"
          />
          <div className="sm:col-span-2">
            <Button type="submit">Add Qualification</Button>
          </div>
        </form>
        {items.length === 0 ? (
          <Empty>No qualifications added yet.</Empty>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
  <form
    key={[
      item.id,
      item.qualification,
      item.fieldOfStudy ?? "",
      item.institution ?? "",
      item.completionYear ?? "",
    ].join("-")}
                action={updateQualification}
                className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2"
              >
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="profilePath" value={profilePath} />
                <Field
                  name="qualification"
                  label="Qualification"
                  defaultValue={item.qualification}
                  required
                />
                <Field
                  name="fieldOfStudy"
                  label="Field of Study"
                  defaultValue={item.fieldOfStudy ?? ""}
                />
                <Field
                  name="institution"
                  label="Institution"
                  defaultValue={item.institution ?? ""}
                />
                <Field
                  name="completionYear"
                  label="Completion Year"
                  type="number"
                  defaultValue={item.completionYear?.toString() ?? ""}
                  min="1950"
                  max="2100"
                />
                <div className="flex gap-2 sm:col-span-2">
                  <Button type="submit" variant="outline">
                    Save Changes
                  </Button>
                  <DeleteButton
                    action={deleteQualification}
                  />
                </div>
              </form>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export function Field({
  name,
  label,
  defaultValue,
  required,
  type = "text",
  min,
  max,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  min?: string;
  max?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <Input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        min={min}
        max={max}
      />
    </label>
  );
}
export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-t border-border pt-4 text-sm text-muted-foreground">
      {children}
    </p>
  );
}
export function DeleteButton({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <Button type="submit" variant="destructive" formAction={action}>
      Remove
    </Button>
  );
}
