import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import DeleteContractorButton from "@/components/DeleteContractorButton";

export default async function ContractorsPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || "";
  const contractors = await prisma.contractor.findMany({
    where: q ? { name: { contains: q } } : undefined,
    orderBy: [{ isFestivalPartner: "desc" }, { name: "asc" }],
    include: {
      subcategories: { include: { subcategory: { include: { category: { select: { name: true } } } } }, take: 2 },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1a1a]">Партнёры</h1>
          <p className="text-sm text-muted mt-0.5">{contractors.length} записей</p>
        </div>
        <Link
          href="/admin/contractors/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-xl hover:bg-brand-dark transition-colors"
        >
          <Plus size={16} /> Добавить
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-border mb-4">
        <form className="p-4">
          <input
            name="q"
            defaultValue={q}
            placeholder="Поиск по названию..."
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
          />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {contractors.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted text-sm mb-3">{q ? "Ничего не найдено" : "Партнёры ещё не добавлены"}</p>
            {!q && (
              <Link href="/admin/contractors/new" className="inline-flex items-center gap-1.5 text-sm text-brand font-medium hover:underline">
                <Plus size={14} /> Добавить первого
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Компания</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Категории</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Контакты</th>
                <th className="px-5 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contractors.map((c) => (
                <tr key={c.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand text-xs font-semibold">{c.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1a1a1a]">{c.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          {c.isFestivalPartner && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Фестиваль</span>}
                          {c.isSpeaker && <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">Спикер</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {c.subcategories.map(({ subcategory }) => (
                        <span key={subcategory.id} className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                          {subcategory.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <p className="text-xs text-muted">{c.phone || ""}</p>
                    <p className="text-xs text-muted">{c.website || ""}</p>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/contractors/${c.id}`} className="p-1.5 text-muted hover:text-brand transition-colors" title="Редактировать">
                        <Pencil size={15} />
                      </Link>
                      <DeleteContractorButton id={c.id} name={c.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
