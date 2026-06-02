import { getKeuangan } from "@/lib/db";
import { buildKeuanganResponse } from "@/lib/keuangan";
import KeuanganContent from "./KeuanganContent";

export default function KeuanganPage() {
  return <KeuanganContent initialData={buildKeuanganResponse(getKeuangan())} />;
}
