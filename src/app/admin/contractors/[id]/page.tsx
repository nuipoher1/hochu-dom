import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import ContractorForm from "@/components/ContractorForm";

export default async function EditContractorPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const [contractor, categories] = await Promise.all([
    prisma.contractor.findUnique({
      where: { id },
      include: { subcategories: true },
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { subcategories: { orderBy: { name: "asc" } } },
    }),
  ]);

  if (!contractor) notFound();

  const initial = {
    name: contractor.name,
    description: contractor.description || "",
    phone: contractor.phone || "",
    email: contractor.email || "",
    website: contractor.website || "",
    instagram: contractor.instagram || "",
    vk: contractor.vk || "",
    telegram: contractor.telegram || "",
    address: (contractor as any).address || "",
    logo: contractor.logo || "",
    geography: contractor.geography || "",
    isFestivalPartner: contractor.isFestivalPartner,
    isSpeaker: contractor.isSpeaker,
    speakerTopic: contractor.speakerTopic || "",
    speakerLectureUrl: contractor.speakerLectureUrl || "",
    portfolioImages: (() => {
      const raw = (contractor as { portfolioImages?: string | null }).portfolioImages;
      if (!raw) return [] as string[];
      try { return JSON.parse(raw) as string[]; } catch { return [] as string[]; }
    })(),
    subcategoryIds: contractor.subcategories.map((s) => String(s.subcategoryId)),
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/contractors" className="p-1.5 text-muted hover:text-brand transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1a1a]">{contractor.name}</h1>
          <p className="text-sm text-muted mt-0.5">Редактирование партнёра</p>
        </div>
      </div>

      <ContractorForm categories={categories} initial={initial} contractorId={String(contractor.id)} />
    </div>
  );
}
