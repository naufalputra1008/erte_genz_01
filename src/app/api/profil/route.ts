import { NextResponse } from "next/server";
import { getProfil, updateProfil } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const profil = getProfil();
  return NextResponse.json(profil);
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const profil = updateProfil(body);
  return NextResponse.json(profil);
}
