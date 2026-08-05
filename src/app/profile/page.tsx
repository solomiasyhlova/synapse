import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { SetPasswordDialog } from "@/components/profile/SetPasswordDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfileUser } from "@/lib/db/profile";

const MEMBER_SINCE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const user = await getProfileUser(session.user.id);
  if (!user) notFound();

  return (
    <div className="flex min-h-full flex-1 justify-center overflow-y-auto p-6">
      <div className="w-full max-w-sm space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <UserAvatar name={user.name ?? "Unknown user"} image={user.image} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name ?? "Unknown user"}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              <p className="truncate text-xs text-muted-foreground">
                Member since {MEMBER_SINCE_FORMAT.format(user.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>

        <ProfileStats userId={user.id} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {user.hasPassword ? <ChangePasswordDialog /> : <SetPasswordDialog />}
            <DeleteAccountDialog />
          </CardContent>
        </Card>

        <Link
          href="/dashboard"
          className="block text-center text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
