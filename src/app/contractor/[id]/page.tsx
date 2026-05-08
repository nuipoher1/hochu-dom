import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import { Phone, Globe, Instagram, MessageCircle, Mail, ChevronLeft, Video } from "lucide-react";

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

  const initials = contractor.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const contacts = [
    { icon: Phone, label: "Телефон", value: contractor.phone, href: `tel:${contractor.phone}` },
    { icon: Mail, label: "Email", value: contractor.email, href: `mailto:${contractor.email}` },
    { icon: Globe, label: "Сайт", value: contractor.website, href: contractor.website },
    { icon: Instagram, label: "Instagram", value: contractor.instagram, href: contractor.instagram },
    { icon: MessageCircle, label: "VK", value: contractor.vk, href: contractor.vk },
    { icon: MessageCircle, label: "Telegram", value: contractor.telegram, href: `https://t.me/${contractor.telegram?.replace("@", "")}` },
    { icon: Phone, label: "WhatsApp", value: contractor.whatsapp, href: `https://wa.me/${contractor.whatsapp?.replace(/\D/g, "")}` },
  ].filter((c) => c.value);

  return (
    <div className="min-h-screen bg-surface">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="javascript:history.back()" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand transition-colors mb-6">
          <ChevronLeft size={16} />
          Назад
        </Link>

        <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
          {/* Заголовок */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {contractor.logo ? (
                <img src={contractor.logo} alt={contractor.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-brand font-bold text-lg">{initials}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                {contractor.isFestivalPartner && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    Участник фестиваля
                  </span>
                )}
                {contractor.isSpeaker && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    Спикер
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-semibold text-[#1a1a1a]">{contractor.name}</h1>
              {contractor.geography && (
                <p className="text-sm text-muted mt-1">📍 {formatGeography(contractor.geography)}</p>
              )}
            </div>
          </div>

          {/* Описание */}
          {contractor.description && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-[#1a1a1a] mb-2">О компании</h2>
              <p className="text-muted leading-relaxed">{contractor.description}</p>
            </div>
          )}

          {/* Участие в фестивале */}
          {contractor.isSpeaker && contractor.speakerTopic && (
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-4 mb-6">
              <h2 className="text-sm font-semibold text-purple-800 mb-1">Выступление на фестивале</h2>
              <p className="text-sm text-purple-700">{contractor.speakerTopic}</p>
              {contractor.speakerLectureUrl && (
                <a href={contractor.speakerLectureUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-purple-600 font-medium mt-2 hover:underline">
                  <Video size={14} /> Смотреть запись
                </a>
              )}
            </div>
          )}

          {/* Категории */}
          {contractor.subcategories.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">Услуги и специализация</h2>
              <div className="flex flex-wrap gap-2">
                {contractor.subcategories.map(({ subcategory }) => (
                  <Link
                    key={subcategory.id}
                    href={`/category/${subcategory.category.slug}?sub=${subcategory.slug}`}
                    className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full border border-green-100 hover:bg-green-100 transition-colors"
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Контакты */}
          {contacts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">Контакты</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contacts.map((contact) => {
                  const Icon = contact.icon;
                  return (
                    <a
                      key={contact.label}
                      href={contact.href || "#"}
                      target={contact.label !== "Телефон" && contact.label !== "Email" ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-green-300 hover:bg-green-50 transition-all"
                    >
                      <Icon size={16} className="text-brand flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted">{contact.label}</p>
                        <p className="text-sm font-medium text-[#1a1a1a] truncate">{contact.value}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
