import { CompetencyPassport } from "@/components/trainee/competency-passport";
import { getMyCompetencyPassport } from "@/lib/trainee/get-competency-passport";
import { requireRole } from "@/lib/auth/require-role";

export default async function CompetencyPassportPage() {
  await requireRole("trainee");

  const items = await getMyCompetencyPassport();

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Verified Capability Record
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Competency Passport
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          A verified view of your current capabilities, required targets,
          evidence and competency development.
        </p>
      </div>

      <CompetencyPassport items={items} />
    </main>
  );
}
