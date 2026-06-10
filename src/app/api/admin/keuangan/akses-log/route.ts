import { NextResponse } from "next/server";
import { getKeuanganAksesLogs } from "@/lib/auth-store";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(getKeuanganAksesLogs());
}
