import { createClient } from "@/lib/supabase/server";

export default async function SupabaseTestPage() {
    const supabase = await createClient();

    const { error } = await supabase.auth.getUser();

    return (
        <main className="p-8">
            <h1 className="text-2xl font-semibold">
                Supabase Connection Test
            </h1>

            <p className="mt-4">
                {error
                    ? "Supabase is reachable. No authenticated user exists yet."
                    : "Supabase is connected and an authenticated user exists."}
            </p>
        </main>
    );
}