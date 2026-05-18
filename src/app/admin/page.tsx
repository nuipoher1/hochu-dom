export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, FolderTree, Star, Mic, Plus, Download } from "lucide-react";

export default async function AdminDashboard() {
  const [contractors, categories, festivalPartners, speakers] = await Promise.all([
    prisma.contractor.count(),
    prisma.category.count(),
    prisma.contractor.count({ where: { isFestivalPartner: true } }),
    prisma.contractor.count({ where: { isSpeaker: true } }),
  ]);

  const recentContractors = await prisma.contractor.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { subcategories: { include: { subcategory: true }, take: 1 } },
  });

  const stats = [
    { label: "Партнёров", value: contractors, icon: Users, color: "text-brand", bg: "bg-green-50" },
    { label: "Этапов", value: categories, icon: FolderTree, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Участников фестиваля", value: festivalPartners, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Спикеров", value: speakers, icon: Mic, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1a1a]">Дашборд</h1>
          <p className="text-sm text-muted mt-0.5">Обзор каталога</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/backup"
            download
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-muted text-sm font-medium rounded-xl border border-border hover:border-brand hover:text-brand transition-colors"
          >
            <Download size={16} /> Скачать резервную копию
          </a>
          <Link
            href="/admin/contractors/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-xl hover:bg-brand-dark transition-colors"
          >
            <Plus size={16} /> Добавить партнёра
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-border p-5">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className={s.color} />
              </div>
              <p className="text-2xl font-semibold text-[#1a1a1a]">{s.value}</p>
              <p className="text-xs text-muted mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-[#1a1a1a]">Последние добавленные</h2>
          <Link href="/admin/contractors" className="text-sm text-brand hover:underline">Все →</Link>
        </div>
        {recentContractors.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-muted text-sm mb-3">Партнёры ещё не добавлены</p>
            <Link href="/admin/contractors/new" className="inline-flex items-center gap-1.5 text-sm text-brand font-medium hover:underline">
              <Plus size={14} /> Добавить первого
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recentContractors.map((c) => (
              <li key={c.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    c.isSpeaker
                      ? "bg-purple-50 border border-purple-200"
                      : c.isFestivalPartner
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-surface border border-border"
                  }`}>
                    {c.isSpeaker ? (
                      <Mic size={14} className="text-purple-600" />
                    ) : c.isFestivalPartner ? (
                      <span className="text-amber-500 text-sm leading-none">★</span>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                        <path d="M9 2L2 8v8h5v-5h4v5h5V8L9 2Z" fill="#9ca3af" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a]">{c.name}</p>
                    <p className="text-xs text-muted">
                      {c.subcategories[0]?.subcategory.name || "Без услуги"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.isFestivalPartner && <span className="text-amber-500 text-xs">★</span>}
                  <Link href={`/admin/contractors/${c.id}`} className="text-xs text-brand hover:underline">Изменить</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
