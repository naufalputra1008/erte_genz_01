import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/auth";

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ success: true });
}
