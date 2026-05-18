export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import NotesChips from "@/components/NotesChips";
import { ChevronLeft, ChevronRight, Mic, ExternalLink } from "lucide-react";

interface PageProps {
  params: { slug: string };
  searchParams: { sub?: string };
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { slug: true } });
  return categories.map((c) => ({ slug: c.slug }));
}

function ContractorRow({ contractor }: { contractor: {
  id: number;
  name: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  isFestivalPartner: boolean;
  isSpeaker: boolean;
  subcategories: { subcategory: { id: number; name: string; slug: string } }[];
}}) {
  return (
    <div
      className="flex items-center gap-5 rounded-2xl p-5 transition-all hover:shadow-md"
      style={{ backgroundColor: "rgba(255,255,255,0.92)", border: "1px solid rgba(222,212,192,0.8)" }}
    >
      {/* Лого — большой квадрат */}
      <Link href={`/contractor/${contractor.id}`} className="flex-shrink-0">
        <div
          className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: "#fff", border: "1px solid #DED4C0" }}
        >
          {contractor.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={contractor.logo} alt={contractor.name} className="w-full h-full object-contain p-1" />
          ) : contractor.isSpeaker ? (
            <Mic size={28} style={{ color: "#7c3aed" }} />
          ) : contractor.isFestivalPartner ? (
            <span style={{ color: "#f59e0b", fontSize: "28px", lineHeight: 1 }}>★</span>
          ) : (
            <svg width="28" height="28" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 8v8h5v-5h4v5h5V8L9 2Z" fill="#2d6a4f" /></svg>
          )}
        </div>
      </Link>

      {/* Имя + описание */}
      <Link href={`/contractor/${contractor.id}`} className="flex-1 min-w-0">
        <p className="font-bold text-[#1a1a1a] text-sm leading-snug mb-1 line-clamp-2">{contractor.name}</p>
        <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "#7a6f5e", minHeight: "2.5rem" }}>
          {contractor.description ?? ""}
        </p>
      </Link>

      {/* Теги */}
      <div className="hidden sm:flex flex-col gap-1.5 flex-shrink-0" style={{ width: "160px" }}>
        {contractor.subcategories.slice(0, 3).map(({ subcategory }) => (
          <span
            key={subcategory.id}
            className="text-xs px-2.5 py-1 rounded-lg overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ backgroundColor: "#F4EDE0", color: "#7a6f5e", border: "1px solid #DED4C0" }}
          >
            {subcategory.name}
          </span>
        ))}
        {contractor.subcategories.length === 0 && (
          <span className="text-xs" style={{ color: "transparent" }}>—</span>
        )}
      </div>

      {/* Ссылка */}
      <div className="flex-shrink-0 w-32 text-right">
        {contractor.website ? (
          <a
            href={contractor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "#2d6a4f" }}
          >
            Перейти на сайт <ExternalLink size={13} />
          </a>
        ) : (
          <Link href={`/contractor/${contractor.id}`} className="text-sm font-medium" style={{ color: "#2d6a4f" }}>
            Подробнее →
          </Link>
        )}
      </div>
    </div>
  );
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

  const allCategories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { slug: true, name: true, order: true },
  });
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
        include: {
          subcategory: { include: { category: { select: { name: true, slug: true } } } },
        },
      },
    },
    orderBy: [{ isFestivalPartner: "desc" }, { isSpeaker: "desc" }, { name: "asc" }],
  });

  const importantNotes: string[] = category.importantNotes ? JSON.parse(category.importantNotes) : [];
  const commonMistakes: string[] = category.commonMistakes ? JSON.parse(category.commonMistakes) : [];
  const attentionPoints: string[] = category.attentionPoints ? JSON.parse(category.attentionPoints) : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4EDE0" }}>
      <Header />

      {/* ─── HEADER СЕКЦИИ ─── */}
      <section className="py-10" style={{ backgroundColor: "#EBE0CC", borderBottom: "1px solid #DED4C0" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/#stages"
            className="inline-flex items-center gap-1.5 text-sm mb-4 transition-colors hover:opacity-80"
            style={{ color: "#7a6f5e" }}
          >
            <ChevronLeft size={15} /> Все этапы
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "#2d6a4f", color: "#fff" }}
            >
              Этап {String(category.order).padStart(2, "0")}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mt-2 mb-3">{category.name}</h1>
          <NotesChips groups={[
            { label: "Что важно учесть", items: importantNotes, type: "green" },
            { label: "Частые ошибки",    items: commonMistakes,  type: "amber" },
            { label: "Обратите внимание", items: attentionPoints, type: "purple" },
          ]} />
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* ─── СОВЕТЫ ─── */}
        {category.tips.length > 0 && (
          <div className="space-y-3 mb-10">
            {category.tips.map((tip) => (
              <div
                key={tip.id}
                className="rounded-xl px-4 py-3 text-sm leading-relaxed"
                style={{
                  backgroundColor: tip.type === "warning" ? "rgba(255,251,235,0.9)" : tip.type === "danger" ? "rgba(255,243,243,0.9)" : "rgba(232,245,238,0.9)",
                  border: `1px solid ${tip.type === "warning" ? "#fde68a" : tip.type === "danger" ? "#fecaca" : "#b3e6c9"}`,
                  color: "#1a1a1a",
                }}
              >
                {tip.text}
              </div>
            ))}
          </div>
        )}

        {/* ─── УСЛУГИ (вертикальный список) ─── */}
        {category.subcategories.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-3">Услуги</h2>
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.88)", border: "1px solid rgba(222,212,192,0.6)" }}>
              <Link
                href={`/category/${category.slug}`}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors"
                style={!activeSubSlug
                  ? { backgroundColor: "#5c6b40", borderBottom: "1px solid rgba(222,212,192,0.3)" }
                  : { borderBottom: "1px solid rgba(222,212,192,0.5)" }
                }
              >
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: !activeSubSlug ? "rgba(255,255,255,0.15)" : "#E8F5EE" }}>
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2L2 8v8h5v-5h4v5h5V8L9 2Z" fill={!activeSubSlug ? "#fff" : "#2d6a4f"} />
                  </svg>
                </span>
                <span className="flex-1 text-sm font-medium" style={{ color: !activeSubSlug ? "#fff" : "#1a1a1a" }}>Все услуги</span>
                <span className="text-sm" style={{ color: !activeSubSlug ? "rgba(255,255,255,0.7)" : "#2d6a4f" }}>→</span>
              </Link>
              {category.subcategories.map((sub, idx) => {
                const isActive = activeSubSlug === sub.slug;
                const isLast = idx === category.subcategories.length - 1;
                return (
                  <Link
                    key={sub.id}
                    href={`/category/${category.slug}?sub=${sub.slug}`}
                    className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#f7f2ea]"
                    style={isActive
                      ? { backgroundColor: "#5c6b40", borderBottom: isLast ? "none" : "1px solid rgba(222,212,192,0.3)" }
                      : { borderBottom: isLast ? "none" : "1px solid rgba(222,212,192,0.5)" }
                    }
                  >
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "#E8F5EE" }}>
                      <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="3" fill={isActive ? "#fff" : "#2d6a4f"} />
                        <circle cx="9" cy="9" r="6" stroke={isActive ? "rgba(255,255,255,0.5)" : "#2d6a4f"} strokeWidth="1.5" fill="none" />
                      </svg>
                    </span>
                    <span className="flex-1 text-sm" style={{ color: isActive ? "#fff" : "#1a1a1a", fontWeight: isActive ? 500 : 400 }}>{sub.name}</span>
                    <span className="text-sm" style={{ color: isActive ? "rgba(255,255,255,0.7)" : "#2d6a4f" }}>→</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── ПАРТНЁРЫ ─── */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1a1a1a]">
            Партнёры{activeSubSlug && ` · ${category.subcategories.find((s) => s.slug === activeSubSlug)?.name}`}
          </h2>
          <span className="text-sm" style={{ color: "#7a6f5e" }}>
            {contractors.length}{" "}
            {contractors.length === 1 ? "компания" : contractors.length < 5 ? "компании" : "компаний"}
          </span>
        </div>

        {contractors.length > 0 ? (
          <div className="flex flex-col gap-3 mb-10">
            {contractors.map((contractor) => (
              <ContractorRow
                key={contractor.id}
                contractor={{
                  ...contractor,
                  subcategories: contractor.subcategories.map(({ subcategory }) => ({
                    subcategory: {
                      id: subcategory.id,
                      name: subcategory.name,
                      slug: subcategory.slug,
                    },
                  })),
                }}
              />
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl p-12 text-center mb-10"
            style={{ backgroundColor: "rgba(255,255,255,0.88)", border: "1px solid rgba(222,212,192,0.8)" }}
          >
            <p className="mb-1" style={{ color: "#7a6f5e" }}>Партнёры в этом разделе появятся скоро</p>
            <p className="text-xs" style={{ color: "#7a6f5e" }}>Следите за обновлениями</p>
          </div>
        )}

        {/* ─── НАВИГАЦИЯ ─── */}
        <div
          className="flex items-center justify-between pt-6"
          style={{ borderTop: "1px solid #DED4C0" }}
        >
          {prevCat ? (
            <Link
              href={`/category/${prevCat.slug}`}
              className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
              style={{ color: "#7a6f5e" }}
            >
              <ChevronLeft size={15} />
              <span>Этап {prevCat.order} · {prevCat.name}</span>
            </Link>
          ) : <div />}
          {nextCat ? (
            <Link
              href={`/category/${nextCat.slug}`}
              className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
              style={{ color: "#7a6f5e" }}
            >
              <span>Этап {nextCat.order} · {nextCat.name}</span>
              <ChevronRight size={15} />
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
