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
          <p className="text-base text-muted">Фестиваль «Хочу дом» · 2025</p>
        </div>

        {/* Таблицы по категориям */}
        {categories.map((cat) => {
          const catContractors = allContractors.filter(c =>
            c.subcategories.some(s => s.subcategory.category.name === cat.name)
          );
          if (catContractors.length === 0) return null;

          return (
            <div key={cat.id} className="mb-8 print:break-inside-avoid">
              <h2 className="text-base font-bold text-[#1a1a1a] mb-2 pb-1 border-b border-[#1a1a1a]">
                {cat.order}. {cat.name}
              </h2>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 pr-3 text-muted font-medium w-1/4">Компания</th>
                    <th className="text-left py-1.5 pr-3 text-muted font-medium w-1/3">Услуги</th>
                    <th className="text-left py-1.5 pr-3 text-muted font-medium w-1/5">Телефон</th>
                    <th className="text-left py-1.5 text-muted font-medium">Контакты</th>
                  </tr>
                </thead>
                <tbody>
                  {catContractors.map((c) => {
                    const subs = c.subcategories
                      .filter(s => s.subcategory.category.name === cat.name)
                      .map(s => s.subcategory.name)
                      .join(", ");
                    return (
                      <tr key={c.id} className="border-b border-border/50">
                        <td className="py-1.5 pr-3 font-medium text-[#1a1a1a]">
                          {c.name}
                          {c.isFestivalPartner && <span className="ml-1 text-amber-600">★</span>}
                        </td>
                        <td className="py-1.5 pr-3 text-muted">{subs}</td>
                        <td className="py-1.5 pr-3 text-muted">{c.phone || "—"}</td>
                        <td className="py-1.5 text-muted text-[10px]">
                          {[c.website, c.instagram, c.telegram].filter(Boolean).join(" · ") || "—"}
                        </td>
                      </tr>
                    );
                  })}
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
