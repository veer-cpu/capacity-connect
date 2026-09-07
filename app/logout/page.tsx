"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      const supabase = createClient();

const { error } = await supabase.auth.signOut({
  scope: "local",
})

if (error) {
  console.error("Sign out failed:", error)
}

      router.replace("/login");
      router.refresh();
    }

    logout();
  }, [router]);

  return (
    <main className="p-8">
      <p>Signing out...</p>
    </main>
  );
}