import { NextResponse } from "next/server";
import { getKeuangan } from "@/lib/db";
import { buildKeuanganResponse } from "@/lib/keuangan";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(buildKeuanganResponse(getKeuangan()));
}
