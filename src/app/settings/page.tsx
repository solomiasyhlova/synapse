import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { SetPasswordDialog } from "@/components/profile/SetPasswordDialog";
import { EditorPreferencesForm } from "@/components/settings/EditorPreferencesForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfileUser } from "@/lib/db/profile";
import { getEditorPreferences } from "@/lib/db/settings";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const [user, editorPreferences] = await Promise.all([
    getProfileUser(session.user.id),
    getEditorPreferences(session.user.id),
  ]);
  if (!user) notFound();

  return (
    <div className="flex min-h-full flex-1 justify-center overflow-y-auto p-6">
      <div className="w-full max-w-sm space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Settings</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {user.hasPassword ? <ChangePasswordDialog /> : <SetPasswordDialog />}
            <DeleteAccountDialog />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Editor Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <EditorPreferencesForm initialPreferences={editorPreferences} />
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
