import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import ContractorCard from "@/components/ContractorCard";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { Search } from "lucide-react";
import { Suspense } from "react";

async function SearchResults({ q }: { q: string }) {
  if (!q.trim()) return null;

  const qLower = q.toLowerCase();

  const all = await prisma.contractor.findMany({
    orderBy: [{ isFestivalPartner: "desc" }, { isSpeaker: "desc" }, { name: "asc" }],
    include: {
      subcategories: {
        include: { subcategory: { include: { category: { select: { name: true } } } } },
      },
    },
  });

  const contractors = all.filter((c) => {
    const inName = c.name.toLowerCase().includes(qLower);
    const inDesc = c.description?.toLowerCase().includes(qLower) ?? false;
    const inSub  = c.subcategories.some((s) =>
      s.subcategory.name.toLowerCase().includes(qLower)
    );
    return inName || inDesc || inSub;
  });

  if (contractors.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Search size={28} className="text-muted" />
        </div>
        <p className="text-[#1a1a1a] font-medium mb-2">Ничего не найдено</p>
        <p className="text-sm text-muted mb-6">
          По запросу «{q}» партнёры не найдены. Попробуйте другие слова.
        </p>
        <div className="flex flex-wrap gap-2 justify-center text-xs text-muted">
          {["строители", "архитектор", "дизайн интерьера", "окна", "кровля", "фундамент"].map((hint) => (
            <Link
              key={hint}
              href={`/search?q=${encodeURIComponent(hint)}`}
              className="px-3 py-1.5 rounded-full border border-border hover:border-brand hover:text-brand transition-colors"
            >
              {hint}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted mb-6">
        Найдено <span className="font-medium text-[#1a1a1a]">{contractors.length}</span> партнёров
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contractors.map((c) => (
          <ContractorCard key={c.id} contractor={c} />
        ))}
      </div>
    </>
  );
}

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || "";

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1a1a1a] mb-1">
            {q ? `Поиск: «${q}»` : "Поиск по каталогу"}
          </h1>
          <p className="text-sm text-muted mb-6">
            Введите название услуги, вид работ или специализацию
          </p>
          <Suspense>
            <SearchBar
              placeholder="Например: строители, пластиковые окна, дизайн интерьера..."
              className="max-w-xl"
            />
          </Suspense>
        </div>

        {q ? (
          <Suspense fallback={<p className="text-sm text-muted">Ищем...</p>}>
            <SearchResults q={q} />
          </Suspense>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted text-sm">Начните вводить запрос чтобы найти подрядчика</p>
          </div>
        )}
      </main>
    </div>
  );
}
