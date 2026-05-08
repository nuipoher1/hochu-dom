import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ContractorForm from "@/components/ContractorForm";

export default async function NewContractorPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { subcategories: { orderBy: { name: "asc" } } },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/contractors" className="p-1.5 text-muted hover:text-brand transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1a1a]">Новый партнёр</h1>
          <p className="text-sm text-muted mt-0.5">Заполните информацию о компании</p>
        </div>
      </div>

      <ContractorForm categories={categories} />
    </div>
  );
}
