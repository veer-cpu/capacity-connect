import Link from "next/link";
import {
  requireAuthenticatedProfile,
} from "@/lib/auth/require-role";
import { changePassword } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants, Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type SettingsPageProps = {
  searchParams: Promise<{ password?: string }>;
};



const profileRoutes = {
  trainee: "/trainee/profile",
  trainer: "/trainer/profile",
} as const;



export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const {
  user,
  profile: authProfile,
  supabase,
} = await requireAuthenticatedProfile();
  

const { data: profile, error: profileError } =
  await supabase
    .from("profiles")
    .select(
      "full_name, email, role, designation, department"
    )
    .eq("id", user.id)
    .single();

 if (profileError || !profile) {
  throw new Error(
    "Unable to load account settings."
  );
}
  const { password } = await searchParams;
  const profileRole = authProfile.role;
  const profileRoute =
    profileRole === "trainee" || profileRole === "trainer"
      ? profileRoutes[profileRole]
      : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your CAPACITY CONNECT account, security, and active session.
        </p>
      </header>

      {password === "updated" ? (
        <Alert>
          <AlertTitle>Password updated</AlertTitle>
          <AlertDescription>Your password has been updated.</AlertDescription>
        </Alert>
      ) : null}
      {password === "invalid" ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to update password</AlertTitle>
          <AlertDescription>
            Use a password between 8 and 128 characters and confirm it exactly.
          </AlertDescription>
        </Alert>
      ) : null}
      {password === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to update password</AlertTitle>
          <AlertDescription>Please try again later.</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Details associated with your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <AccountDetail label="Full Name" value={profile.full_name} />
            <AccountDetail label="Email" value={user.email ?? profile.email} />
            <div className="space-y-1">
              <dt className="text-xs font-medium text-muted-foreground">
                Role
              </dt>
              <dd>
                <Badge variant="secondary" className="capitalize">
                  {profile.role}
                </Badge>
              </dd>
            </div>
            <AccountDetail label="Designation" value={profile.designation} />
            <AccountDetail label="Department" value={profile.department} />
          </dl>
          {profileRoute ? (
            <Link
              href={profileRoute}
              className={buttonVariants({ variant: "outline" })}
            >
              Edit Profile
            </Link>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Choose a new password for your CAPACITY CONNECT account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={changePassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
              />
            </div>
            <Separator />
            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountDetail({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value || "Not provided"}</dd>
    </div>
  );
}
