import { getProfil } from "@/lib/db";
import VisiMisiContent from "./VisiMisiContent";

export default function VisiMisiPage() {
  return <VisiMisiContent initialData={getProfil()} />;
}
