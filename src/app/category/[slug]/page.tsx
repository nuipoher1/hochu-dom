import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import ContractorCard from "@/components/ContractorCard";
import TipBlock from "@/components/TipBlock";
import { ChevronLeft, ChevronRight, AlertCircle, CheckSquare, Eye } from "lucide-react";

interface PageProps {
  params: { slug: string };
  searchParams: { sub?: string };
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { slug: true } });
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      subcategories: { orderBy: { order: "asc" } },
      tips: { orderBy: { order: "asc" } },
    },
  });

  if (!category) notFound();

  const allCategories = await prisma.category.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true, order: true } });
  const currentIndex = allCategories.findIndex((c) => c.slug === params.slug);
  const prevCat = currentIndex > 0 ? allCategories[currentIndex - 1] : null;
  const nextCat = currentIndex < allCategories.length - 1 ? allCategories[currentIndex + 1] : null;

  const activeSubSlug = searchParams.sub;

  const contractors = await prisma.contractor.findMany({
    where: {
      subcategories: {
        some: {
          subcategory: {
            categoryId: category.id,
            ...(activeSubSlug ? { slug: activeSubSlug } : {}),
          },
        },
      },
    },
    include: {
      subcategories: {
        include: { subcategory: { include: { category: { select: { name: true, slug: true } } } } },
      },
    },
    orderBy: [{ isFestivalPartner: "desc" }, { isSpeaker: "desc" }, { name: "asc" }],
  });

  const importantNotes: string[] = category.importantNotes ? JSON.parse(category.importantNotes) : [];
  const commonMistakes: string[] = category.commonMistakes ? JSON.parse(category.commonMistakes) : [];
  const attentionPoints: string[] = category.attentionPoints ? JSON.parse(category.attentionPoints) : [];

  return (
    <div className="min-h-screen bg-surface">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Хлебные крошки */}
        <nav className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-brand transition-colors">Главная</Link>
          <span>/</span>
          <span className="text-[#1a1a1a] font-medium">{category.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Сайдбар */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-border p-4 sticky top-20">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Услуги</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href={`/category/${category.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!activeSubSlug ? "bg-green-50 text-brand font-medium" : "text-muted hover:bg-surface"}`}
                  >
                    Все услуги
                  </Link>
                </li>
                {category.subcategories.map((sub) => (
                  <li key={sub.id}>
                    <Link
                      href={`/category/${category.slug}?sub=${sub.slug}`}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${activeSubSlug === sub.slug ? "bg-green-50 text-brand font-medium" : "text-muted hover:bg-surface"}`}
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Основной контент */}
          <main className="flex-1 min-w-0">
            <div className="mb-2">
              <span className="text-xs font-medium text-muted">Этап {category.order}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#1a1a1a] mb-8">{category.name}</h1>

            {/* Образовательная часть */}
            {(importantNotes.length > 0 || commonMistakes.length > 0 || attentionPoints.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {importantNotes.length > 0 && (
                  <div className="bg-white rounded-2xl border border-border p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckSquare size={16} className="text-brand" />
                      <h2 className="font-semibold text-sm text-[#1a1a1a]">Что важно учесть</h2>
                    </div>
                    <ul className="space-y-2">
                      {importantNotes.map((note, i) => (
                        <li key={i} className="text-xs text-muted flex gap-2">
                          <span className="text-brand mt-0.5 flex-shrink-0">·</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {commonMistakes.length > 0 && (
                  <div className="bg-white rounded-2xl border border-border p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle size={16} className="text-amber-500" />
                      <h2 className="font-semibold text-sm text-[#1a1a1a]">Частые ошибки</h2>
                    </div>
                    <ul className="space-y-2">
                      {commonMistakes.map((m, i) => (
                        <li key={i} className="text-xs text-muted flex gap-2">
                          <span className="text-amber-500 mt-0.5 flex-shrink-0">·</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {attentionPoints.length > 0 && (
                  <div className="bg-white rounded-2xl border border-border p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye size={16} className="text-purple-500" />
                      <h2 className="font-semibold text-sm text-[#1a1a1a]">Обратите внимание</h2>
                    </div>
                    <ul className="space-y-2">
                      {attentionPoints.map((p, i) => (
                        <li key={i} className="text-xs text-muted flex gap-2">
                          <span className="text-purple-500 mt-0.5 flex-shrink-0">·</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Подсказки */}
            {category.tips.length > 0 && (
              <div className="space-y-3 mb-8">
                {category.tips.map((tip) => (
                  <TipBlock key={tip.id} text={tip.text} type={tip.type} />
                ))}
              </div>
            )}

            {/* Партнёры */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#1a1a1a]">
                Партнёры{activeSubSlug && ` · ${category.subcategories.find(s => s.slug === activeSubSlug)?.name}`}
              </h2>
              <span className="text-sm text-muted">{contractors.length} {contractors.length === 1 ? "компания" : contractors.length < 5 ? "компании" : "компаний"}</span>
            </div>

            {contractors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contractors.map((contractor) => (
                  <ContractorCard key={contractor.id} contractor={contractor} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-border p-12 text-center">
                <p className="text-muted mb-1">Партнёры в этом разделе появятся скоро</p>
                <p className="text-xs text-muted">Следите за обновлениями</p>
              </div>
            )}

            {/* Навигация по этапам */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
              {prevCat ? (
                <Link href={`/category/${prevCat.slug}`} className="flex items-center gap-2 text-sm text-muted hover:text-brand transition-colors">
                  <ChevronLeft size={16} />
                  <span>Этап {prevCat.order} · {prevCat.name}</span>
                </Link>
              ) : <div />}
              {nextCat ? (
                <Link href={`/category/${nextCat.slug}`} className="flex items-center gap-2 text-sm text-muted hover:text-brand transition-colors">
                  <span>Этап {nextCat.order} · {nextCat.name}</span>
                  <ChevronRight size={16} />
                </Link>
              ) : <div />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
