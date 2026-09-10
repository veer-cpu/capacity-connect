import Link from "next/link";

import { getTrainerProfile } from "@/lib/trainer/get-trainer-profile";

import { updateTrainerProfile } from "./actions";
import { ProfessionalProfile } from "@/components/profile/professional-profile";
import { getProfessionalProfile } from "@/lib/profile/get-professional-profile";
import { Separator } from "@/components/ui/separator";

export default async function TrainerProfilePage() {
  const profile = await getTrainerProfile();
  const professionalProfile = await getProfessionalProfile();

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-8">
      <section>
        <p className="text-sm font-medium text-gray-500">Trainer Workspace</p>

        <h1 className="mt-2 text-3xl font-semibold">Trainer Profile</h1>

        <p className="mt-3 text-gray-600">
          Maintain your professional and training information.
        </p>
      </section>

      <form action={updateTrainerProfile} className="mt-8 space-y-8">
        <section className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Professional Information</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field
              label="Full Name"
              name="fullName"
              defaultValue={profile.fullName}
              required
            />

            <Field
              label="Designation"
              name="designation"
              defaultValue={profile.designation ?? ""}
            />

            <Field
              label="Department"
              name="department"
              defaultValue={profile.department ?? ""}
            />
          </div>

          <div className="mt-5">
            <label htmlFor="bio" className="text-sm font-medium">
              Professional Bio
            </label>

            <textarea
              id="bio"
              name="bio"
              defaultValue={profile.bio ?? ""}
              rows={4}
              className="mt-2 w-full rounded-md border px-3 py-2"
            />
          </div>
        </section>

        <section className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Trainer Information</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field
              label="Years of Experience"
              name="yearsOfExperience"
              type="number"
              min="0"
              max="60"
              defaultValue={profile.yearsOfExperience ?? 0}
              required
            />

            <div>
              <label
                htmlFor="availabilityStatus"
                className="text-sm font-medium"
              >
                Availability
              </label>

              <select
                id="availabilityStatus"
                name="availabilityStatus"
                defaultValue={profile.availabilityStatus}
                className="mt-2 w-full rounded-md border px-3 py-2"
              >
                <option value="available">Available</option>

                <option value="limited">Limited</option>

                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="trainerBio" className="text-sm font-medium">
              Training Bio
            </label>

            <textarea
              id="trainerBio"
              name="trainerBio"
              defaultValue={profile.trainerBio ?? ""}
              rows={5}
              className="mt-2 w-full rounded-md border px-3 py-2"
            />

            <p className="mt-2 text-xs text-gray-500">
              Describe your training expertise and professional teaching
              experience.
            </p>
          </div>
        </section>

        <section className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Verified Competencies</h2>

          <p className="mt-2 text-sm text-gray-600">
            Verified trainer competencies are managed by administrators and
            cannot be edited from this page.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-md bg-black px-5 py-2 text-white"
          >
            Save Profile
          </button>

          <Link
            href="/trainer/dashboard"
            className="rounded-md border px-5 py-2"
          >
            Back to Dashboard
          </Link>
        </div>
      </form>
      <Separator />
      <ProfessionalProfile
        profile={professionalProfile}
        profilePath="/trainer/profile"
      />
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required = false,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue: string | number;
  required?: boolean;
  min?: string;
  max?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        min={min}
        max={max}
        className="mt-2 w-full rounded-md border px-3 py-2"
      />
    </div>
  );
}
