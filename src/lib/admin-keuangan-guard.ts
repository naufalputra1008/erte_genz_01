import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { isKeuanganAccessGranted } from "@/lib/keuangan-auth";

export async function requireAdminKeuanganAccess() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isKeuanganAccessGranted())) {
    return NextResponse.json({ error: "Password keuangan diperlukan" }, { status: 403 });
  }
  return null;
}
