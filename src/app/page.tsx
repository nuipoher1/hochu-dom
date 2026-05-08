export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import { Suspense } from "react";
import { ArrowRight, MapPin, Banknote, PenTool, HardHat, Zap, Paintbrush, Sofa, Trees, PartyPopper } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  MapPin:      <MapPin size={22} />,
  Banknote:    <Banknote size={22} />,
  PenTool:     <PenTool size={22} />,
  HardHat:     <HardHat size={22} />,
  Zap:         <Zap size={22} />,
  Paintbrush:  <Paintbrush size={22} />,
  Sofa:        <Sofa size={22} />,
  Trees:       <Trees size={22} />,
  PartyPopper: <PartyPopper size={22} />,
};

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { subcategories: true },
  });

  const totalContractors = await prisma.contractor.count();

  return (
    <div className="min-h-screen bg-surface">
      <Header />

      {/* Hero */}
      <section className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-green-50 text-brand text-xs font-semibold rounded-full border border-green-200 mb-5">
              Фестиваль «Хочу дом»
            </span>
            <h1 className="text-3xl md:text-5xl font-semibold text-[#1a1a1a] leading-tight mb-4">
              Партнёрский<br />каталог
            </h1>
            <p className="text-lg text-muted leading-relaxed mb-8">
              Пошаговый навигатор строительства дома — от выбора участка до новоселья.
              Что делать на каждом этапе и к кому обратиться.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#stages" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white font-medium rounded-lg hover:bg-brand-dark transition-colors">
                Выбрать этап <ArrowRight size={16} />
              </a>
              <Link href="/pdf" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-brand font-medium rounded-lg border border-green-200 hover:bg-green-50 transition-colors">
                Скачать PDF
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Как пользоваться */}
      <section className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Выберите этап", desc: "Найдите на схеме ниже тот шаг, на котором вы сейчас находитесь" },
              { num: "02", title: "Изучите советы", desc: "В каждом разделе — что важно учесть и каких ошибок избежать" },
              { num: "03", title: "Найдите партнёра", desc: "Выберите подходящего специалиста и свяжитесь напрямую" },
            ].map((step) => (
              <div key={step.num} className="flex gap-4">
                <span className="text-3xl font-bold text-green-100 flex-shrink-0 leading-none pt-1">{step.num}</span>
                <div>
                  <h3 className="font-semibold text-[#1a1a1a] mb-1">{step.title}</h3>
                  <p className="text-sm text-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Поиск */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-4 pt-2">
        <div className="bg-white rounded-2xl border border-border px-6 py-5">
          <p className="text-sm font-medium text-[#1a1a1a] mb-3">Найти подрядчика по виду работ</p>
          <Suspense>
            <SearchBar placeholder="Например: строители, пластиковые окна, дизайн интерьера, кровля..." />
          </Suspense>
          <div className="flex flex-wrap gap-2 mt-3">
            {["Строители", "Архитектор", "Дизайн интерьера", "Пластиковые окна", "Кровля", "Фундамент", "Ландшафтный дизайн"].map((hint) => (
              <a
                key={hint}
                href={`/search?q=${encodeURIComponent(hint)}`}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-muted hover:border-brand hover:text-brand transition-colors"
              >
                {hint}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Этапы */}
      <section id="stages" className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#1a1a1a]">Путь строителя</h2>
            <p className="text-muted mt-1 text-sm">9 этапов от земли до новоселья</p>
          </div>
          {totalContractors > 0 && (
            <span className="text-sm text-muted hidden md:block">{totalContractors} {totalContractors === 1 ? "партнёр" : "партнёров"} в каталоге</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group bg-white rounded-2xl border border-border p-6 hover:border-green-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-brand">
                    {cat.icon && iconMap[cat.icon] ? iconMap[cat.icon] : <span className="font-bold text-sm">{cat.order}</span>}
                  </div>
                  <span className="text-xs font-medium text-muted">Этап {cat.order}</span>
                </div>
                <ArrowRight size={16} className="text-muted group-hover:text-brand group-hover:translate-x-0.5 transition-all mt-0.5" />
              </div>
              <h3 className="font-semibold text-[#1a1a1a] text-base mb-2">{cat.name}</h3>
              <p className="text-xs text-muted">
                {cat.subcategories.length}&nbsp;
                {cat.subcategories.length === 1 ? "услуга" : cat.subcategories.length < 5 ? "услуги" : "услуг"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* О фестивале */}
      <section className="bg-white border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-4">О фестивале</h2>
            <p className="text-muted leading-relaxed">
              «Хочу дом» — фестиваль для тех, кто думает о строительстве собственного дома.
              Лекции, мастер-классы и живое общение с профессионалами отрасли. Каталог помогает
              найти нужного специалиста до, во время и после фестиваля.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm text-muted">© 2025 Фестиваль «Хочу дом»</span>
          <Link href="/admin/login" className="text-xs text-muted hover:text-brand transition-colors">
            Вход для администратора
          </Link>
        </div>
      </footer>
    </div>
  );
}
