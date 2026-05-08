export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import { Suspense } from "react";
import {
  ArrowRight, MapPin, Banknote, PenTool, HardHat, Zap,
  Paintbrush, Sofa, Trees, PartyPopper,
  Users, Star, Mic, Layers,
} from "lucide-react";

const categoryDesc: Record<string, string> = {
  zemlya:        "Участок, геология, межевание, коммуникации",
  finansy:       "Ипотека, бюджет, страхование, субсидии",
  proekt:        "Архитектура, дизайн, разрешения, смета",
  strojka:       "Фундамент, коробка, кровля, материалы",
  inzheneriya:   "Электрика, вода, отопление, вентиляция",
  remont:        "Отделка, двери, окна, полы, потолки",
  mebel:         "Кухня, шкафы, мягкая мебель, декор",
  blagoustrojstvo: "Ландшафт, забор, баня, освещение",
  dosug:         "Новоселье, фото, кейтеринг, праздник",
};

const iconMap: Record<string, React.ReactNode> = {
  MapPin:      <MapPin size={20} />,
  Banknote:    <Banknote size={20} />,
  PenTool:     <PenTool size={20} />,
  HardHat:     <HardHat size={20} />,
  Zap:         <Zap size={20} />,
  Paintbrush:  <Paintbrush size={20} />,
  Sofa:        <Sofa size={20} />,
  Trees:       <Trees size={20} />,
  PartyPopper: <PartyPopper size={20} />,
};

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { subcategories: true },
  });

  const [totalContractors, festivalPartners, speakers] = await Promise.all([
    prisma.contractor.count(),
    prisma.contractor.count({ where: { isFestivalPartner: true } }),
    prisma.contractor.count({ where: { isSpeaker: true } }),
  ]);

  return (
    <div className="min-h-screen bg-surface">
      <Header />

      {/* ─── HERO ─── */}
      <section className="bg-white border-b border-border overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-stretch min-h-[500px]">

            {/* LEFT: text */}
            <div className="flex-1 py-14 lg:py-20 lg:pr-14 flex flex-col justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-brand text-xs font-semibold rounded-full border border-green-200 mb-6 self-start">
                <span className="w-1.5 h-1.5 bg-brand rounded-full" />
                Фестиваль «Хочу дом»
              </span>

              <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] leading-[1.15] mb-5">
                Партнёрский<br />каталог
              </h1>

              <p className="text-base text-muted leading-relaxed mb-8 max-w-md">
                Пошаговый навигатор по строительству дома — от выбора участка до новоселья.
                Проверенные подрядчики, полезные советы и актуальные решения на каждом этапе.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <a
                  href="#stages"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand text-white font-semibold rounded-xl hover:bg-brand-dark transition-colors text-sm"
                >
                  Выбрать этап <ArrowRight size={15} />
                </a>
              </div>

              {/* 3 features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: <Layers size={15} />, title: "Понятный путь", desc: "9 этапов от земли до новоселья" },
                  { icon: <Users size={15} />, title: "Проверенные подрядчики", desc: "Участники фестиваля и эксперты отрасли" },
                  { icon: <Star size={15} />, title: "Актуальные советы", desc: "Избегайте ошибок и экономьте время" },
                ].map((f) => (
                  <div key={f.title} className="flex gap-2.5 p-3 rounded-xl bg-surface border border-border">
                    <div className="w-7 h-7 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center text-brand flex-shrink-0 mt-0.5">
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1a1a1a]">{f.title}</p>
                      <p className="text-[11px] text-muted leading-snug mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: house photo */}
            <div className="hidden lg:flex lg:w-[480px] items-center py-10 pl-4">
              <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/hero-house.webp"
                  alt="Современный загородный дом"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:divide-x md:divide-border">
            {[
              { icon: <Users size={17} />, value: totalContractors || 0, label: "Подрядчиков в каталоге" },
              { icon: <Star size={17} />,  value: festivalPartners || 0,  label: "Участников фестиваля" },
              { icon: <Mic size={17} />,   value: speakers || 0,          label: "Спикеров выступлений" },
              { icon: <Layers size={17} />, value: 9,                     label: "Этапов строительства" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 md:pl-6 md:first:pl-0">
                <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-brand flex-shrink-0">
                  {s.icon}
                </div>
                <div>
                  <p className="text-xl font-bold text-[#1a1a1a] leading-none">{s.value}</p>
                  <p className="text-[11px] text-muted mt-1 leading-snug">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEARCH ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-2">
        <div className="bg-white rounded-2xl border border-border px-6 py-5">
          <p className="text-sm font-semibold text-[#1a1a1a] mb-3">Найти подрядчика по виду работ</p>
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

      {/* ─── STAGES ─── */}
      <section id="stages" className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a1a]">Этапы строительства</h2>
            <p className="text-muted mt-1 text-sm">9 этапов от земли до новоселья</p>
          </div>
          {totalContractors > 0 && (
            <span className="text-sm text-muted hidden md:block">
              {totalContractors} {totalContractors === 1 ? "партнёр" : "партнёров"} в каталоге
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group bg-white rounded-2xl border border-border p-5 hover:border-green-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-brand">
                    {cat.icon && iconMap[cat.icon]
                      ? iconMap[cat.icon]
                      : <span className="font-bold text-sm">{String(cat.order).padStart(2, "0")}</span>
                    }
                  </div>
                  <span className="text-xs font-medium text-muted tabular-nums">
                    {String(cat.order).padStart(2, "0")}
                  </span>
                </div>
                <ArrowRight size={15} className="text-muted group-hover:text-brand group-hover:translate-x-0.5 transition-all mt-0.5" />
              </div>
              <h3 className="font-semibold text-[#1a1a1a] text-base mb-1">{cat.name}</h3>
              {categoryDesc[cat.slug] && (
                <p className="text-xs text-muted mb-1.5">{categoryDesc[cat.slug]}</p>
              )}
              <p className="text-xs text-muted/60">
                {cat.subcategories.length}&nbsp;
                {cat.subcategories.length === 1
                  ? "услуга"
                  : cat.subcategories.length < 5
                  ? "услуги"
                  : "услуг"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="bg-white border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="md:w-72 flex-shrink-0">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">О фестивале</h2>
              <p className="text-sm text-muted leading-relaxed mb-4">
                «Хочу дом» — фестиваль для тех, кто строит или мечтает о своём доме.
                Мы собрали в одном месте экспертов, подрядчиков и полезные знания,
                чтобы ваш путь к дому был простым и комфортным.
              </p>
              <a href="#about" className="inline-flex items-center gap-1.5 text-sm text-brand font-medium hover:underline">
                Подробнее <ArrowRight size={14} />
              </a>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { num: "01", title: "Выберите этап", desc: "Найдите шаг, на котором вы сейчас находитесь" },
                { num: "02", title: "Изучите советы", desc: "Что важно учесть и каких ошибок избежать" },
                { num: "03", title: "Найдите партнёра", desc: "Выберите специалиста и свяжитесь напрямую" },
              ].map((step) => (
                <div key={step.num} className="flex flex-col gap-2 p-4 rounded-2xl bg-surface border border-border">
                  <span className="text-3xl font-bold text-green-100 leading-none">{step.num}</span>
                  <h4 className="font-semibold text-[#1a1a1a] text-sm">{step.title}</h4>
                  <p className="text-xs text-muted leading-snug">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand rounded-md flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L2 8v8h5v-5h4v5h5V8L9 2Z" fill="white" />
              </svg>
            </div>
            <span className="text-sm text-muted">© 2026 Фестиваль «Хочу дом»</span>
          </div>
          <Link href="/admin/login" className="text-xs text-muted hover:text-brand transition-colors">
            Вход для администратора
          </Link>
        </div>
      </footer>
    </div>
  );
}
