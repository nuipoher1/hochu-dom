import Link from "next/link";
import { Phone, Globe, Instagram, MessageCircle, Mic } from "lucide-react";

interface Subcategory {
  name: string;
  slug: string;
  category?: { name: string };
}

interface Contractor {
  id: number;
  name: string;
  description?: string | null;
  logo?: string | null;
  geography?: string | null;
  phone?: string | null;
  website?: string | null;
  instagram?: string | null;
  vk?: string | null;
  telegram?: string | null;
  whatsapp?: string | null;
  isFestivalPartner: boolean;
  isSpeaker: boolean;
  speakerTopic?: string | null;
  subcategories: { subcategory: Subcategory }[];
}

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

function Avatar({ contractor }: { contractor: Contractor }) {
  if (contractor.logo) {
    return (
      <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center flex-shrink-0 overflow-hidden bg-white">
        <img src={contractor.logo} alt={contractor.name} className="w-full h-full object-contain" />
      </div>
    );
  }

  // Спикер — фиолетовый квадрат с микрофоном
  if (contractor.isSpeaker) {
    return (
      <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center flex-shrink-0" title="Спикер фестиваля">
        <Mic size={20} className="text-purple-600" />
      </div>
    );
  }

  // Участник фестиваля — янтарный квадрат со звездой
  if (contractor.isFestivalPartner) {
    return (
      <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0" title="Участник фестиваля">
        <span className="text-amber-500 text-xl leading-none">★</span>
      </div>
    );
  }

  // Обычный партнёр — нейтральный серый квадрат с домиком
  return (
    <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center flex-shrink-0">
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L2 8v8h5v-5h4v5h5V8L9 2Z" fill="#9ca3af" />
      </svg>
    </div>
  );
}

export default function ContractorCard({ contractor }: { contractor: Contractor }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <Avatar contractor={contractor} />

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#1a1a1a] text-base leading-snug">{contractor.name}</h3>
          {contractor.isSpeaker && contractor.speakerTopic && (
            <p className="text-xs text-purple-600 mt-0.5 leading-snug line-clamp-1">{contractor.speakerTopic}</p>
          )}
          {!contractor.isSpeaker && contractor.isFestivalPartner && (
            <p className="text-xs text-amber-600 mt-0.5">Участник фестиваля</p>
          )}
        </div>
      </div>

      {contractor.description && (
        <p className="text-sm text-muted line-clamp-2 leading-relaxed">{contractor.description}</p>
      )}

      {contractor.subcategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {contractor.subcategories.slice(0, 3).map(({ subcategory }) => (
            <span key={subcategory.slug} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-100">
              {subcategory.name}
            </span>
          ))}
          {contractor.subcategories.length > 3 && (
            <span className="px-2.5 py-1 bg-surface text-muted text-xs rounded-full border border-border">
              +{contractor.subcategories.length - 3}
            </span>
          )}
        </div>
      )}

      {contractor.geography && (
        <p className="text-xs text-muted">📍 {formatGeography(contractor.geography)}</p>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-border mt-auto">
        <div className="flex items-center gap-3">
          {contractor.phone && (
            <a href={`tel:${contractor.phone}`} className="text-muted hover:text-brand transition-colors" title="Телефон">
              <Phone size={16} />
            </a>
          )}
          {contractor.website && (
            <a href={contractor.website} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-brand transition-colors" title="Сайт">
              <Globe size={16} />
            </a>
          )}
          {contractor.instagram && (
            <a href={contractor.instagram} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-brand transition-colors" title="Instagram">
              <Instagram size={16} />
            </a>
          )}
          {contractor.telegram && (
            <a href={`https://t.me/${contractor.telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-brand transition-colors" title="Telegram">
              <MessageCircle size={16} />
            </a>
          )}
        </div>
        <Link href={`/contractor/${contractor.id}`} className="text-xs text-brand font-medium hover:underline">
          Подробнее →
        </Link>
      </div>
    </div>
  );
}
