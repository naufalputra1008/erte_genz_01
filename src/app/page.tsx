import { getDashboard } from "@/lib/db";
import HomeContent from "./HomeContent";

export default function HomePage() {
  return <HomeContent initialData={getDashboard()} />;
}
