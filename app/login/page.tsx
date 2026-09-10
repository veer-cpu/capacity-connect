"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Invalid email or password.");
      setLoading(false);
      return;
    }

    if (!data.user) {
      setMessage("Unable to sign in.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_approved, is_active")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      setMessage("Profile could not be loaded.");
      setLoading(false);
      return;
    }

    if (!profile.is_active) {
await supabase.auth.signOut({
  scope: "local",
});      setMessage("This account is inactive.");
      setLoading(false);
      return;
    }

    if (!profile.is_approved) {
await supabase.auth.signOut({
  scope: "local",
});      setMessage("Your account is waiting for approval.");
      setLoading(false);
      return;
    }

   if (profile.role === "admin") {
  router.push("/admin/dashboard");
} else if (profile.role === "trainer") {
  router.push("/trainer/dashboard");
} else if (profile.role === "trainee") {
  router.push("/trainee/dashboard");
} else {
  await supabase.auth.signOut({
    scope: "local",
  });

  setMessage(
    "This account does not have a valid platform role."
  );
  setLoading(false);
  return;
}

    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-xl p-6">
        <h1 className="text-2xl font-semibold">Sign In</h1>

        <p className="mt-2 text-sm text-gray-600">
          Access your CAPACITY CONNECT account.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black text-white py-2 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}