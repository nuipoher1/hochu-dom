export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import {
  ArrowRight, MapPin, Wallet, PenLine, HardHat, Plug,
  LayoutGrid, Sofa, Trees, Sparkles,
  Users, Shield, BookOpen, Home, ChevronRight,
} from "lucide-react";

const stageIconMap: Record<string, React.ReactNode> = {
  zemlya:          <MapPin size={22} />,
  finansy:         <Wallet size={22} />,
  proekt:          <PenLine size={22} />,
  strojka:         <HardHat size={22} />,
  inzheneriya:     <Plug size={22} />,
  remont:          <LayoutGrid size={22} />,
  mebel:           <Sofa size={22} />,
  blagoustrojstvo: <Trees size={22} />,
  dosug:           <Sparkles size={22} />,
};

const categoryDesc: Record<string, string> = {
  zemlya:          "Участок, геология, межевание, коммуникации",
  finansy:         "Ипотека, бюджет, страхование, субсидии",
  proekt:          "Архитектура, дизайн, разрешения, смета",
  strojka:         "Фундамент, коробка, кровля, материалы",
  inzheneriya:     "Электрика, вода, отопление, вентиляция",
  remont:          "Отделка, двери, окна, полы, потолки",
  mebel:           "Кухня, шкафы, мягкая мебель, декор",
  blagoustrojstvo: "Ландшафт, забор, баня, освещение",
  dosug:           "Новоселье, фото, кейтеринг, праздник",
};

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { subcategories: true },
  });

  const [totalContractors, totalTips] = await Promise.all([
    prisma.contractor.count(),
    prisma.tip.count(),
  ]);

  return (
    <div className="min-h-screen" style={{ background: "url('/stages-bg.png') center/cover no-repeat #F4EDE0" }}>
      <Header />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden" style={{ minHeight: "660px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-cover.png"
          alt="Партнёрский каталог"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.38) 55%, #F4EDE0 100%)",
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col justify-center pb-24 pt-40">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.1] mb-3">
            Партнёрский<br />каталог
          </h1>
<p className="text-base leading-relaxed mb-8 max-w-md" style={{ color: "rgba(255,255,255,0.82)" }}>
            Пошаговый навигатор по строительству дома — от выбора участка до новоселья.
            Проверенные подрядчики, полезные советы и актуальные решения на каждом этапе.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#stages"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-2xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#2d6a4f", color: "#fff" }}
            >
              Выбрать этап <ArrowRight size={16} />
            </a>
            <a
              href="https://forms.yandex.ru/u/6a0a26b684227c677c4ed904"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-2xl transition-opacity hover:opacity-90"
              style={{ border: "2px solid rgba(255,255,255,0.55)", color: "#fff" }}
            >
              Стать партнёром
            </a>
          </div>
        </div>
      </section>

      {/* ─── COUNTERS ─── */}
      <section style={{ backgroundColor: "rgba(235,224,204,0.90)", borderTop: "1px solid #DED4C0", borderBottom: "1px solid #DED4C0" }} className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
            {[
              { icon: <Users size={22} />, value: `${totalContractors}`, label: "проверенных компаний" },
              { icon: <Home size={22} />, value: "9", label: "этапов от земли до новоселья" },
              { icon: <Shield size={22} />, value: "200+", label: "семей нашли свой путь к дому" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span style={{ color: "#2d6a4f" }}>{s.icon}</span>
                  <p className="text-3xl font-bold text-[#1a1a1a]">{s.value}</p>
                </div>
                <p className="text-sm" style={{ color: "#7a6f5e" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ПОИСК ─── */}
      <section className="pt-10 pb-4">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "rgba(255,255,255,0.82)", border: "1px solid rgba(222,212,192,0.8)" }}
          >
            <h2 className="font-bold text-[#1a1a1a] mb-4">Найти подрядчика по виду работ</h2>
            <SearchBar placeholder="Например: строители, пластиковые окна, дизайн интерьера, кровля..." />
            <div className="flex flex-wrap gap-2 mt-3">
              {["Строители", "Архитектор", "Дизайн интерьера", "Пластиковые окна", "Кровля", "Фундамент", "Ландшафтный дизайн"].map((tag) => (
                <a
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:border-brand hover:text-brand"
                  style={{ backgroundColor: "rgba(255,255,255,0.7)", borderColor: "#DED4C0", color: "#7a6f5e" }}
                >
                  {tag}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── STAGES ─── */}
      <section id="stages" className="pt-6 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-1">Этапы строительства</h2>
          <p className="text-sm mb-10" style={{ color: "#7a6f5e" }}>9 этапов от земли до новоселья</p>

          {/* Timeline */}
          <div className="relative">
            {/* Вертикальная пунктирная линия */}
            <div
              className="absolute top-5 bottom-5"
              style={{ left: "21px", borderLeft: "2px dashed #C8BAA0", width: 0 }}
            />

            <div className="flex flex-col gap-3">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="flex items-center gap-4">
                  {/* Кружок с номером — снаружи карточки */}
                  <div
                    className="relative z-10 flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: "#F4EDE0",
                      border: "2px solid #C8BAA0",
                      color: "#2d6a4f",
                    }}
                  >
                    {String(cat.order || idx + 1).padStart(2, "0")}
                  </div>

                  {/* Карточка */}
                  <Link
                    href={`/category/${cat.slug}`}
                    className="group flex-1 flex items-center gap-4 rounded-2xl px-5 py-4 transition-all hover:shadow-md"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.82)",
                      border: "1px solid rgba(222, 212, 192, 0.8)",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#E8F5EE", border: "1px solid #b3e6c9", color: "#2d6a4f" }}
                    >
                      {stageIconMap[cat.slug] ?? <Home size={24} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1a1a1a]">{cat.name}</p>
                      {categoryDesc[cat.slug] && (
                        <p className="text-xs mt-0.5" style={{ color: "#7a6f5e" }}>{categoryDesc[cat.slug]}</p>
                      )}
                    </div>

                    <ChevronRight
                      size={18}
                      className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
                      style={{ color: "#2d6a4f" }}
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ backgroundColor: "rgba(235,224,204,0.92)", borderTop: "1px solid #DED4C0" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand rounded-md flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L2 8v8h5v-5h4v5h5V8L9 2Z" fill="white" />
              </svg>
            </div>
            <span className="text-sm" style={{ color: "#7a6f5e" }}>© 2026 Фестиваль «Хочу дом»</span>
          </div>
          <Link href="/admin/login" className="text-xs hover:text-brand transition-colors" style={{ color: "#7a6f5e" }}>
            Вход для администратора
          </Link>
        </div>
      </footer>
    </div>
  );
}
