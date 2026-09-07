import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminUsers } from "@/lib/admin/get-users";
import { requireRole } from "@/lib/auth/require-role";
import {
  approveUser,
  deactivateUser,
  reactivateUser,
  setUserRole,
} from "./actions";

export default async function AdminUsersPage() {
  const { user } = await requireRole("admin");
  const currentUserId = user.id;
  const users = await getAdminUsers();

  const totalUsers = users.length;
  const pendingApproval = users.filter((item) => !item.isApproved).length;
  const activeTrainees = users.filter(
    (item) => item.role === "trainee" && item.isActive,
  ).length;
  const activeTrainers = users.filter(
    (item) => item.role === "trainer" && item.isActive,
  ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="User Management"
        description="Approve accounts, manage workforce roles, and control platform access."
        actions={
          <Link
            href="/admin/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />

      {pendingApproval > 0 && (
        <Alert>
          <AlertTitle>
            {pendingApproval} account{pendingApproval === 1 ? "" : "s"} waiting
            for approval.
          </AlertTitle>
          <AlertDescription>
            Review pending accounts below before granting platform access.
          </AlertDescription>
        </Alert>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Users" value={totalUsers} />
        <SummaryCard label="Pending Approval" value={pendingApproval} />
        <SummaryCard label="Active Trainees" value={activeTrainees} />
        <SummaryCard label="Active Trainers" value={activeTrainers} />
      </section>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Platform Users</CardTitle>
          <CardDescription>
            Review account access, approval state, and workforce role
            assignments.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Account Status</TableHead>
                    <TableHead className="min-w-80">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((item) => (
                    <TableRow key={item.userId} className="align-top">
                      <TableCell className="whitespace-nowrap font-medium">
                        {item.fullName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {item.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.department ?? "—"}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={item.isApproved ? "Approved" : "Pending"}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={item.isActive ? "Active" : "Inactive"}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          {!item.isApproved && (
                            <form action={approveUser}>
                              <input
                                type="hidden"
                                name="userId"
                                value={item.userId}
                              />
                              <Button type="submit" size="sm">
                                Approve
                              </Button>
                            </form>
                          )}

                          {item.isApproved &&
                            item.isActive &&
                            item.userId !== currentUserId && (
                              <form action={deactivateUser}>
                                <input
                                  type="hidden"
                                  name="userId"
                                  value={item.userId}
                                />
                                <Button
                                  type="submit"
                                  size="sm"
                                  variant="outline"
                                >
                                  Deactivate
                                </Button>
                              </form>
                            )}

                          {item.isApproved && !item.isActive && (
                            <form action={reactivateUser}>
                              <input
                                type="hidden"
                                name="userId"
                                value={item.userId}
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant="secondary"
                              >
                                Reactivate
                              </Button>
                            </form>
                          )}

                          {item.role !== "admin" && (
                            <form
                              action={setUserRole}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="hidden"
                                name="userId"
                                value={item.userId}
                              />
                              <Select name="newRole" defaultValue={item.role}>
                                <SelectTrigger
                                  size="sm"
                                  aria-label={`Role for ${item.fullName}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="trainee">
                                    Trainee
                                  </SelectItem>
                                  <SelectItem value="trainer">
                                    Trainer
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <Button type="submit" size="sm" variant="outline">
                                Change Role
                              </Button>
                            </form>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card size="sm">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
