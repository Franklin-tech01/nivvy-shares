import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { ErrorNotice, PageHeader } from "@/components/layout/page-header";
import { ProfileCard } from "@/components/profile/profile-card";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { getProfile } from "@/lib/data";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const { data, error } = await getProfile();
  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your basic account information."
        action={
          <form action={signOut} className="md:hidden">
            <Button variant="outline" size="sm" type="submit">
              <LogOut /> Logout
            </Button>
          </form>
        }
      />
      {error || !data ? (
        <ErrorNotice message={error ?? "Profile not found."} />
      ) : (
        <ProfileCard profile={data} />
      )}
    </>
  );
}
