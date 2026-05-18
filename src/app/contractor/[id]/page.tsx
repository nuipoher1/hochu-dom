export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import {
  Phone, Globe, Instagram, MessageCircle, Mail,
  ChevronLeft, Video, Mic, MapPin, ExternalLink,
} from "lucide-react";

function formatGeography(val: string): string {
  try {
    const arr = JSON.parse(val);
    if (Array.isArray(arr)) {
      return arr.map((d: string) =>
        d === "Вся Россия" || d.includes("федеральный")
          ? d
          : `${d} федеральный округ`
      ).join(", ");
    }
  } catch {}
  return val;
}

function parseImages(val: string | null): string[] {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

export default async function ContractorPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const contractor = await prisma.contractor.findUnique({
    where: { id },
    include: {
      subcategories: {
        include: { subcategory: { include: { category: { select: { name: true, slug: true } } } } },
      },
    },
  });

  if (!contractor) notFound();

  const portfolioImages = parseImages((contractor as { portfolioImages?: string | null }).portfolioImages ?? null);

  const phoneNumbers = contractor.phone
    ? contractor.phone.split(/[,;]+/).map((p) => p.trim()).filter(Boolean)
    : [];

  const contacts = [
    ...phoneNumbers.map((p) => ({ icon: Phone, label: "Телефон", value: p, href: `tel:${p}`, external: false })),
    { icon: Mail, label: "Email", value: contractor.email, href: `mailto:${contractor.email}`, external: false },
    { icon: MapPin, label: "Адрес", value: (contractor as any).address, href: (contractor as any).address ? `https://yandex.ru/maps/?text=${encodeURIComponent((contractor as any).address)}` : null, external: true },
    { icon: Globe, label: "Сайт", value: contractor.website, href: contractor.website, external: true },
    { icon: Instagram, label: "Instagram", value: contractor.instagram, href: contractor.instagram, external: true },
    { icon: MessageCircle, label: "ВКонтакте", value: contractor.vk, href: contractor.vk, external: true },
    { icon: MessageCircle, label: "Telegram", value: contractor.telegram, href: `https://t.me/${contractor.telegram?.replace("@", "")}`, external: true },
    { icon: MessageCircle, label: "Макс", value: contractor.whatsapp, href: contractor.whatsapp || null, external: true },
  ].filter((c) => c.value);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4EDE0" }}>
      <Header />

      {/* ─── ШАПКА ─── */}
      <section className="py-10" style={{ backgroundColor: "#EBE0CC", borderBottom: "1px solid #DED4C0" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="javascript:history.back()"
            className="inline-flex items-center gap-1.5 text-sm mb-5 transition-colors hover:opacity-80"
            style={{ color: "#7a6f5e" }}
          >
            <ChevronLeft size={15} /> Назад
          </Link>

          <div className="flex items-start gap-5">
            {/* Аватар */}
            <div className="flex-shrink-0">
              {contractor.logo ? (
                <div
                  className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{ border: "1px solid #DED4C0", backgroundColor: "#fff" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={contractor.logo} alt={contractor.name} className="w-full h-full object-contain" />
                </div>
              ) : contractor.isSpeaker ? (
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#f3f0ff", border: "1px solid #e0d7ff" }}
                >
                  <Mic size={30} style={{ color: "#7c3aed" }} />
                </div>
              ) : contractor.isFestivalPartner ? (
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}
                >
                  <span style={{ color: "#f59e0b", fontSize: "30px", lineHeight: 1 }}>★</span>
                </div>
              ) : (
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#E8F5EE", border: "1px solid #b3e6c9" }}
                >
                  <svg width="30" height="30" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2L2 8v8h5v-5h4v5h5V8L9 2Z" fill="#2d6a4f" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {contractor.isSpeaker && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: "#f3f0ff", color: "#7c3aed" }}>
                    Спикер фестиваля
                  </span>
                )}
                {!contractor.isSpeaker && contractor.isFestivalPartner && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: "#fffbeb", color: "#d97706" }}>
                    Участник фестиваля
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] leading-tight">{contractor.name}</h1>
              {contractor.geography && (
                <p className="flex items-center gap-1.5 text-sm mt-2" style={{ color: "#7a6f5e" }}>
                  <MapPin size={14} /> <span style={{ color: "#9a8f7e" }}>География услуг:</span>&nbsp;{formatGeography(contractor.geography)}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* ─── О КОМПАНИИ ─── */}
        {contractor.description && (
          <section
            className="rounded-2xl p-6"
            style={{ backgroundColor: "rgba(255,255,255,0.88)", border: "1px solid rgba(222,212,192,0.8)" }}
          >
            <h2 className="font-bold text-[#1a1a1a] mb-3">О компании</h2>
            <p className="leading-relaxed whitespace-pre-wrap" style={{ color: "#4a4035" }}>{contractor.description}</p>
          </section>
        )}

        {/* ─── ВЫСТУПЛЕНИЕ НА ФЕСТИВАЛЕ ─── */}
        {contractor.isSpeaker && contractor.speakerTopic && (
          <section
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#f5f0ff", border: "1px solid #ddd6fe" }}
          >
            <h2 className="font-bold mb-2" style={{ color: "#5b21b6" }}>Выступление на фестивале</h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#6d28d9" }}>{contractor.speakerTopic}</p>
            {contractor.speakerLectureUrl && (
              <a
                href={contractor.speakerLectureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                style={{ color: "#7c3aed" }}
              >
                <Video size={15} /> Смотреть запись
              </a>
            )}
          </section>
        )}

        {/* ─── УСЛУГИ И СПЕЦИАЛИЗАЦИЯ ─── */}
        {contractor.subcategories.length > 0 && (
          <section
            className="rounded-2xl p-6"
            style={{ backgroundColor: "rgba(255,255,255,0.88)", border: "1px solid rgba(222,212,192,0.8)" }}
          >
            <h2 className="font-bold text-[#1a1a1a] mb-4">Услуги и специализация</h2>
            <div className="flex flex-wrap gap-2">
              {contractor.subcategories.map(({ subcategory }) => (
                <Link
                  key={subcategory.id}
                  href={`/category/${subcategory.category.slug}?sub=${subcategory.slug}`}
                  className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: "#E8F5EE", color: "#2d6a4f", border: "1px solid #b3e6c9" }}
                >
                  {subcategory.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── ПОРТФОЛИО ─── */}
        {portfolioImages.length > 0 && (
          <section>
            <h2 className="font-bold text-[#1a1a1a] mb-4">Портфолио</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {portfolioImages.map((src, i) => (
                <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Фото ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-xl transition-opacity hover:opacity-90"
                    style={{ border: "1px solid #DED4C0" }}
                  />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ─── КОНТАКТЫ ─── */}
        {contacts.length > 0 && (
          <section
            className="rounded-2xl p-6"
            style={{ backgroundColor: "rgba(255,255,255,0.88)", border: "1px solid rgba(222,212,192,0.8)" }}
          >
            <h2 className="font-bold text-[#1a1a1a] mb-4">Контакты</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contacts.map((contact) => {
                const Icon = contact.icon;
                const inner = (
                  <>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#E8F5EE" }}>
                      <Icon size={16} style={{ color: "#2d6a4f" }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs mb-0.5" style={{ color: "#7a6f5e" }}>{contact.label}</p>
                      <p className="text-sm font-semibold text-[#1a1a1a]" style={{ wordBreak: "break-word" }}>{contact.value}</p>
                    </div>
                    {contact.external && <ExternalLink size={13} style={{ color: "#7a6f5e", flexShrink: 0 }} />}
                  </>
                );
                return contact.href ? (
                  <a
                    key={contact.label + contact.value}
                    href={contact.href}
                    target={contact.external ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl transition-all hover:shadow-sm"
                    style={{ border: "1px solid #DED4C0", backgroundColor: "#F4EDE0" }}
                  >{inner}</a>
                ) : (
                  <div
                    key={contact.label + contact.value}
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{ border: "1px solid #DED4C0", backgroundColor: "#F4EDE0" }}
                  >{inner}</div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
