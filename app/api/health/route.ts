import { NextResponse } from "next/server";
import { getOperationsBackendStatus } from "@/lib/operations/store";

export const dynamic = "force-dynamic";

export function GET() {
  const operations = getOperationsBackendStatus();

  return NextResponse.json({
    ok: true,
    service: "essential-resourcing",
    operations: {
      enabled: operations.enabled,
      configured: operations.configured,
      state: operations.state,
    },
  });
}
