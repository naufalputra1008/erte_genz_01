import { getProfil, getWarga } from "@/lib/db";
import WargaContent from "./WargaContent";

export default function WargaPage() {
  return <WargaContent initialWarga={getWarga()} initialProfil={getProfil()} />;
}
