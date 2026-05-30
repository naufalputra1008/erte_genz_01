import { NextResponse } from "next/server";
import { getDashboard } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = getDashboard();
  return NextResponse.json(data);
}
