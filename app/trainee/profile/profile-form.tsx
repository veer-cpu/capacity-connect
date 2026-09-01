"use client";

import { useActionState } from "react";

import {
  updateTraineeProfile,
  type ProfileActionState,
} from "./actions";

type ProfileFormProps = {
  initialData: {
    full_name: string;
    designation: string;
    department: string;
    bio: string;

    employee_code: string;
    qualifications: string;
    work_experience: string;
    professional_interests: string;
  };
};

const initialState: ProfileActionState = {
  success: false,
  message: "",
};

export default function ProfileForm({
  initialData,
}: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    updateTraineeProfile,
    initialState
  );

  return (
    <form action={formAction} className="mt-8 max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">
          Full Name
        </label>

        <input
          name="full_name"
          defaultValue={initialData.full_name}
          required
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Designation
        </label>

        <input
          name="designation"
          defaultValue={initialData.designation}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Department
        </label>

        <input
          name="department"
          defaultValue={initialData.department}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Bio
        </label>

        <textarea
          name="bio"
          defaultValue={initialData.bio}
          rows={4}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <hr />

      <div>
        <label className="block text-sm font-medium mb-1">
          Employee Code
        </label>

        <input
          name="employee_code"
          defaultValue={initialData.employee_code}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Qualifications
        </label>

        <textarea
          name="qualifications"
          defaultValue={initialData.qualifications}
          rows={3}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Work Experience
        </label>

        <textarea
          name="work_experience"
          defaultValue={initialData.work_experience}
          rows={4}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Professional Interests
        </label>

        <textarea
          name="professional_interests"
          defaultValue={initialData.professional_interests}
          rows={3}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save Profile"}
      </button>

      {state.message && (
        <p
          className={
            state.success
              ? "text-sm text-green-700"
              : "text-sm text-red-700"
          }
        >
          {state.message}
        </p>
      )}
    </form>
  );
}