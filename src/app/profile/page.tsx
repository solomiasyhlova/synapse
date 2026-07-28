import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const { name, email, image } = session.user;

  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <UserAvatar name={name ?? "Unknown user"} image={image} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name ?? "Unknown user"}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
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
