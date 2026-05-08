export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";

export default async function PdfPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      subcategories: {
        orderBy: { order: "asc" },
        include: {
          contractors: {
            include: { contractor: true },
          },
        },
      },
    },
  });

  const allContractors = await prisma.contractor.findMany({
    orderBy: [{ isFestivalPartner: "desc" }, { name: "asc" }],
    include: {
      subcategories: {
        include: { subcategory: { include: { category: { select: { name: true } } } } },
      },
    },
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Шапка — не печатается */}
      <div className="print:hidden bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-brand">← Назад</Link>
        <PrintButton />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 print:px-0 print:py-0">
        {/* Заголовок */}
        <div className="text-center mb-10 pb-6 border-b-2 border-[#1a1a1a]">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Партнёрский каталог</h1>
          <p className="text-base text-muted">Фестиваль «Хочу дом» · 2026</p>
        </div>

        {/* Таблицы по категориям */}
        {categories.map((cat) => {
          const catContractors = allContractors.filter(c =>
            c.subcategories.some(s => s.subcategory.category.name === cat.name)
          );
          if (catContractors.length === 0) return null;

          return (
            <div key={cat.id} className="mb-8 print:break-inside-avoid">
              {/* Заголовок категории */}
              <div style={{ backgroundColor: "#2d6a4f" }} className="rounded-lg px-4 py-2.5 mb-0 flex items-center gap-3">
                <span style={{ color: "#b3e6c9" }} className="text-xs font-bold tabular-nums opacity-70">
                  {String(cat.order).padStart(2, "0")}
                </span>
                <h2 className="text-sm font-bold text-white">{cat.name}</h2>
                <span style={{ color: "#b3e6c9" }} className="text-xs ml-auto opacity-70">
                  {catContractors.length} {catContractors.length === 1 ? "партнёр" : catContractors.length < 5 ? "партнёра" : "партнёров"}
                </span>
              </div>

              <table className="w-full text-xs border border-t-0 border-[#e5e9e6] rounded-b-lg overflow-hidden">
                <thead>
                  <tr style={{ backgroundColor: "#f0faf4" }} className="border-b border-[#d8f3e3]">
                    <th className="text-left py-1.5 px-3 text-[#2d6a4f] font-semibold w-1/4">Компания</th>
                    <th className="text-left py-1.5 pr-3 text-[#2d6a4f] font-semibold w-1/3">Услуги</th>
                    <th className="text-left py-1.5 pr-3 text-[#2d6a4f] font-semibold">Контакты</th>
                  </tr>
                </thead>
                <tbody>
                  {catContractors.map((c, idx) => (
                    <tr
                      key={c.id}
                      style={{ backgroundColor: idx % 2 === 1 ? "#f8faf7" : "#ffffff" }}
                      className="border-b border-[#e5e9e6] last:border-0"
                    >
                      <td className="py-2 px-3 font-semibold text-[#1a1a1a] align-top">
                        {c.name}
                        {c.isFestivalPartner && (
                          <span className="ml-1.5 text-[10px] font-bold text-amber-600">★</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-[#6b7280] align-top">
                        {c.subcategories
                          .filter(s => s.subcategory.category.name === cat.name)
                          .map(s => s.subcategory.name)
                          .join(", ")}
                      </td>
                      <td className="py-2 pr-3 text-[10px] text-[#6b7280] leading-[1.6] align-top">
                        {c.phone && <div className="font-medium text-[#1a1a1a]">{c.phone}</div>}
                        {c.address && <div>{c.address}</div>}
                        {[c.website, c.instagram, c.vk, c.telegram].filter(Boolean).map((link, i) => (
                          <div key={i}>{link}</div>
                        ))}
                        {!c.phone && !c.address && !c.website && !c.instagram && !c.vk && !c.telegram && "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        <div className="text-center text-xs text-muted mt-10 pt-4 border-t border-border">
          ★ — участник фестиваля · hochudom.ru
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 1.5cm; }
          body { font-size: 11px; }
        }
      `}</style>
    </div>
  );
}
