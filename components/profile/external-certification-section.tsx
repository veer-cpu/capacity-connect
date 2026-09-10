import {
  addExternalCertification,
  deleteExternalCertification,
  updateExternalCertification,
} from "./actions";
import { DeleteButton, Empty, Field } from "./qualification-section";
import type { ExternalCertification } from "@/lib/profile/get-professional-profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ExternalCertificationSection({
  items,
  profilePath,
}: {
  items: ExternalCertification[];
  profilePath: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>External Certifications</CardTitle>
        <CardDescription>
          Record certifications issued outside CAPACITY CONNECT.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <CertificationForm
          action={addExternalCertification}
          profilePath={profilePath}
          submitLabel="Add External Certification"
        />
        {items.length === 0 ? (
          <Empty>No external certifications added yet.</Empty>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <CertificationForm
  key={[
    item.id,
    item.name,
    item.issuingOrganization ?? "",
    item.issueDate ?? "",
    item.expiryDate ?? "",
    item.credentialId ?? "",
    item.credentialUrl ?? "",
  ].join("-")}
                action={updateExternalCertification}
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
function CertificationForm({
  action,
  profilePath,
  submitLabel,
  item,
}: {
  action: (formData: FormData) => Promise<void>;
  profilePath: string;
  submitLabel: string;
  item?: ExternalCertification;
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
        name="name"
        label="Certification Name"
        defaultValue={item?.name}
        required
      />
      <Field
        name="issuingOrganization"
        label="Issuing Organization"
        defaultValue={item?.issuingOrganization ?? ""}
      />
      <Field
        name="issueDate"
        label="Issue Date"
        type="date"
        defaultValue={item?.issueDate ?? ""}
      />
      <Field
        name="expiryDate"
        label="Expiry Date"
        type="date"
        defaultValue={item?.expiryDate ?? ""}
      />
      <Field
        name="credentialId"
        label="Credential ID"
        defaultValue={item?.credentialId ?? ""}
      />
      <Field
        name="credentialUrl"
        label="Credential URL"
        type="url"
        defaultValue={item?.credentialUrl ?? ""}
      />
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" variant={item ? "outline" : "default"}>
          {submitLabel}
        </Button>
        {item ? (
          <DeleteButton
            action={deleteExternalCertification}
          />
        ) : null}
      </div>
    </form>
  );
}
