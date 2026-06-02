import { notFound } from "next/navigation";
import { getKegiatanById } from "@/lib/db";
import KegiatanDetailContent from "./KegiatanDetailContent";

export default async function KegiatanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kegiatanId = Number(id);
  if (!kegiatanId) notFound();

  const kegiatan = getKegiatanById(kegiatanId);
  if (!kegiatan) notFound();

  return <KegiatanDetailContent id={id} initialData={kegiatan} />;
}
