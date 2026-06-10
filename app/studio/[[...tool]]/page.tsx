import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CMS_SESSION_COOKIE, isCmsSessionValid } from "@/lib/cms-auth";
import { StudioClient } from "./StudioClient";

type Props = {
  params?: Promise<{
    tool?: string[];
  }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

function studioPath(tool?: string[]) {
  return `/studio${tool?.length ? `/${tool.join("/")}` : ""}`;
}

export default async function StudioPage({ params }: Props) {
  const cookieStore = await cookies();
  const isValid = await isCmsSessionValid(
    cookieStore.get(CMS_SESSION_COOKIE)?.value,
  );

  if (!isValid) {
    const resolvedParams = await params;
    redirect(
      `/cms?next=${encodeURIComponent(studioPath(resolvedParams?.tool))}`,
    );
  }

  return <StudioClient />;
}
