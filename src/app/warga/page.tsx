import { getProfil, getWarga } from "@/lib/db";
import WargaContent from "./WargaContent";

export default function WargaPage() {
  const initialWarga = getWarga().map(({ no_ktp: _, ...rest }) => rest);
  return <WargaContent initialWarga={initialWarga} initialProfil={getProfil()} />;
}
