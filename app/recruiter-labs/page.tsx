import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recruiter Labs | Essential Resourcing",
  description: "Private Recruiter Labs shortcut for Essential Resourcing.",
  alternates: {
    canonical: `${siteConfig.url}/recruiter-labs`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RecruiterLabsShortcutPage() {
  redirect("/admin/recruiter-labs");
}
