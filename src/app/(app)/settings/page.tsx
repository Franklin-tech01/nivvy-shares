import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Account security." />
      <PasswordForm />
    </>
  );
}
