import { getKegiatan } from "@/lib/db";
import KegiatanContent from "./KegiatanContent";

export default function KegiatanPage() {
  return <KegiatanContent initialData={getKegiatan()} />;
}
