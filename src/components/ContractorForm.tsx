"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Upload, X, ImagePlus } from "lucide-react";

const DISTRICTS = [
  "Вся Россия",
  "Центральный федеральный округ",
  "Северо-Западный федеральный округ",
  "Южный федеральный округ",
  "Северо-Кавказский федеральный округ",
  "Приволжский федеральный округ",
  "Уральский федеральный округ",
  "Сибирский федеральный округ",
  "Дальневосточный федеральный округ",
];

function parseGeography(val: string): string[] {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return val ? [val] : []; }
}

/** Сжимает картинку через Canvas, возвращает base64 JPEG */
async function compressImage(file: File, maxPx = 1200, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.width;
      let h = img.height;
      if (w > maxPx || h > maxPx) {
        if (w >= h) { h = Math.round(h * maxPx / w); w = maxPx; }
        else        { w = Math.round(w * maxPx / h); h = maxPx; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

type Subcategory = { id: number; name: string };
type Category = { id: number; name: string; subcategories: Subcategory[] };

type FormData = {
  name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  vk: string;
  telegram: string;
  whatsapp: string;
  address: string;
  logo: string;
  geography: string[];
  isFestivalPartner: boolean;
  isSpeaker: boolean;
  speakerTopic: string;
  speakerLectureUrl: string;
  portfolioImages: string[];
  subcategoryIds: string[];
};

const EMPTY: FormData = {
  name: "", description: "", phone: "", email: "", website: "",
  instagram: "", vk: "", telegram: "", whatsapp: "", address: "", logo: "", geography: [],
  isFestivalPartner: false, isSpeaker: false, speakerTopic: "",
  speakerLectureUrl: "", portfolioImages: [], subcategoryIds: [],
};

export default function ContractorForm({
  categories,
  initial,
  contractorId,
}: {
  categories: Category[];
  initial?: Partial<FormData>;
  contractorId?: string;
}) {
  const router = useRouter();
  const parsedInitial = initial
    ? {
        ...initial,
        geography: typeof initial.geography === "string" ? parseGeography(initial.geography) : (initial.geography ?? []),
        portfolioImages: typeof (initial as { portfolioImages?: unknown }).portfolioImages === "string"
          ? (() => { try { return JSON.parse((initial as { portfolioImages?: string }).portfolioImages!); } catch { return []; } })()
          : ((initial as { portfolioImages?: string[] }).portfolioImages ?? []),
      }
    : undefined;
  const [form, setForm] = useState<FormData>({ ...EMPTY, ...parsedInitial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const [logoLoading, setLogoLoading] = useState(false);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  function set(field: keyof FormData, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleSub(id: string) {
    setForm((f) => ({
      ...f,
      subcategoryIds: f.subcategoryIds.includes(id)
        ? f.subcategoryIds.filter((s) => s !== id)
        : [...f.subcategoryIds, id],
    }));
  }

  function toggleDistrict(d: string) {
    setForm((f) => {
      if (d === "Вся Россия") {
        return { ...f, geography: f.geography.includes(d) ? [] : ["Вся Россия"] };
      }
      const without = f.geography.filter((x) => x !== "Вся Россия");
      return {
        ...f,
        geography: without.includes(d)
          ? without.filter((x) => x !== d)
          : [...without, d],
      };
    });
  }

  function toggleCat(id: string) {
    setOpenCats((o) => ({ ...o, [id]: !o[id] }));
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoLoading(true);
    try {
      const compressed = await compressImage(file, 600, 0.82);
      set("logo", compressed);
    } catch {
      alert("Не удалось обработать изображение");
    } finally {
      setLogoLoading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  const MAX_PORTFOLIO = 6;

  async function handlePortfolioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = MAX_PORTFOLIO - form.portfolioImages.length;
    if (remaining <= 0) {
      alert(`Максимум ${MAX_PORTFOLIO} фотографий`);
      if (portfolioInputRef.current) portfolioInputRef.current.value = "";
      return;
    }
    const filesToUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      alert(`Можно добавить ещё ${remaining} фото. Лишние файлы пропущены.`);
    }
    setPortfolioLoading(true);
    try {
      const compressed = await Promise.all(filesToUpload.map((f) => compressImage(f, 1200, 0.78)));
      set("portfolioImages", [...form.portfolioImages, ...compressed]);
    } catch {
      alert("Не удалось обработать одно или несколько изображений");
    } finally {
      setPortfolioLoading(false);
      if (portfolioInputRef.current) portfolioInputRef.current.value = "";
    }
  }

  function removePortfolioImage(idx: number) {
    set("portfolioImages", form.portfolioImages.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = contractorId ? `/api/contractors/${contractorId}` : "/api/contractors";
      const method = contractorId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка сохранения");
      }

      router.push("/admin/contractors");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
      setSaving(false);
    }
  }

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors";
  const labelCls = "block text-sm font-medium text-[#1a1a1a] mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Основная информация */}
      <section className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-semibold text-[#1a1a1a]">Основная информация</h2>

        <div>
          <label className={labelCls}>Название компании <span className="text-red-500">*</span></label>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="ООО «Ромашка»"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Описание</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Коротко о компании, услугах и опыте..."
            rows={4}
            className={inputCls + " resize-none"}
          />
        </div>

        {/* Логотип */}
        <div>
          <label className={labelCls}>Логотип</label>
          <div className="flex items-center gap-4">
            {form.logo ? (
              <div className="relative flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.logo}
                  alt="Логотип"
                  className="w-20 h-20 object-contain rounded-xl border border-border bg-white p-1"
                />
                <button
                  type="button"
                  onClick={() => set("logo", "")}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X size={11} />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center flex-shrink-0 bg-surface">
                <Upload size={20} className="text-muted" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={logoLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border hover:border-brand hover:text-brand transition-colors disabled:opacity-50"
              >
                <Upload size={14} />
                {logoLoading ? "Обработка..." : form.logo ? "Заменить" : "Загрузить логотип"}
              </button>
              <p className="text-xs text-muted">JPG, PNG, WebP · Сжимается автоматически</p>
            </div>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </div>

        <div>
          <label className={labelCls}>География работы</label>
          <div className="flex flex-wrap gap-2">
            {DISTRICTS.map((d) => {
              const selected = form.geography.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDistrict(d)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selected
                      ? "bg-brand text-white border-brand"
                      : "border-border text-muted hover:border-brand hover:text-brand"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          {form.geography.length === 0 && (
            <p className="text-xs text-muted mt-1.5">Выберите один или несколько округов</p>
          )}
        </div>

        <div>
          <label className={labelCls}>Адрес офиса</label>
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="ул. Ленина, 1, г. Рязань"
            className={inputCls}
          />
        </div>
      </section>

      {/* Контакты */}
      <section className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-semibold text-[#1a1a1a]">Контакты</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Телефон</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+7 900 000-00-00" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="info@company.ru" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Сайт</label>
            <input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://company.ru" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Telegram</label>
            <input value={form.telegram} onChange={(e) => set("telegram", e.target.value)} placeholder="@company" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>ВКонтакте</label>
            <input value={form.vk} onChange={(e) => set("vk", e.target.value)} placeholder="https://vk.com/company" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Instagram</label>
            <input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@company" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Макс</label>
            <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="Ссылка или номер" className={inputCls} />
          </div>
        </div>
      </section>

      {/* Фестиваль */}
      <section className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-semibold text-[#1a1a1a]">Участие в фестивале</h2>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => set("isFestivalPartner", !form.isFestivalPartner)}
            className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.isFestivalPartner ? "bg-amber-400" : "bg-border"}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isFestivalPartner ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-sm font-medium text-[#1a1a1a]">Партнёр фестиваля</span>
          {form.isFestivalPartner && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Фестиваль</span>}
        </label>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => set("isSpeaker", !form.isSpeaker)}
            className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.isSpeaker ? "bg-purple-500" : "bg-border"}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isSpeaker ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-sm font-medium text-[#1a1a1a]">Спикер фестиваля</span>
          {form.isSpeaker && <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Спикер</span>}
        </label>

        {form.isSpeaker && (
          <div className="space-y-3 pl-1 border-l-2 border-purple-100 ml-1 pt-1">
            <div>
              <label className={labelCls}>Тема выступления</label>
              <input
                value={form.speakerTopic}
                onChange={(e) => set("speakerTopic", e.target.value)}
                placeholder="Как выбрать подрядчика и не пожалеть"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Ссылка на лекцию</label>
              <input
                value={form.speakerLectureUrl}
                onChange={(e) => set("speakerLectureUrl", e.target.value)}
                placeholder="https://youtube.com/..."
                className={inputCls}
              />
            </div>
          </div>
        )}
      </section>

      {/* Портфолио */}
      <section className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[#1a1a1a]">Примеры работ</h2>
            <p className="text-xs text-muted mt-0.5">Фото сжимаются автоматически до ~200–400 КБ</p>
          </div>
          <button
            type="button"
            onClick={() => portfolioInputRef.current?.click()}
            disabled={portfolioLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <ImagePlus size={14} />
            {portfolioLoading ? "Обработка..." : "Добавить фото"}
          </button>
        </div>

        <input
          ref={portfolioInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePortfolioUpload}
        />

        {form.portfolioImages.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {form.portfolioImages.map((src, idx) => (
                <div key={idx} className="relative group aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Фото ${idx + 1}`}
                    className="w-full h-full object-cover rounded-xl border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removePortfolioImage(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            {form.portfolioImages.length < MAX_PORTFOLIO && (
              <button
                type="button"
                onClick={() => portfolioInputRef.current?.click()}
                disabled={portfolioLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border hover:border-brand hover:text-brand transition-colors disabled:opacity-50"
              >
                <ImagePlus size={14} />
                {portfolioLoading ? "Обработка..." : `Добавить ещё (${form.portfolioImages.length}/${MAX_PORTFOLIO})`}
              </button>
            )}
            {form.portfolioImages.length >= MAX_PORTFOLIO && (
              <p className="text-xs text-muted">Достигнут лимит {MAX_PORTFOLIO} фотографий</p>
            )}
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-brand transition-colors"
            onClick={() => portfolioInputRef.current?.click()}
          >
            <ImagePlus size={28} className="mx-auto mb-2 text-muted" />
            <p className="text-sm text-muted">Нажмите чтобы добавить фото</p>
            <p className="text-xs text-muted mt-1">Можно выбрать несколько сразу · максимум {MAX_PORTFOLIO} фото</p>
          </div>
        )}
      </section>

      {/* Услуги и специализация */}
      <section className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-semibold text-[#1a1a1a] mb-4">Услуги и специализация</h2>
        <p className="text-xs text-muted mb-4">Выберите все услуги, которые относятся к этому партнёру</p>

        <div className="space-y-2">
          {categories.map((cat) => {
            const isOpen = !!openCats[String(cat.id)];
            const selectedCount = cat.subcategories.filter((s) => form.subcategoryIds.includes(String(s.id))).length;
            return (
              <div key={cat.id} className="border border-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleCat(String(cat.id))}
                  className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-green-50 transition-colors text-left"
                >
                  <span className="text-sm font-medium text-[#1a1a1a]">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    {selectedCount > 0 && (
                      <span className="text-xs bg-brand text-white px-2 py-0.5 rounded-full">{selectedCount}</span>
                    )}
                    {isOpen ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 py-3 flex flex-wrap gap-2 border-t border-border">
                    {cat.subcategories.map((sub) => {
                      const selected = form.subcategoryIds.includes(String(sub.id));
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => toggleSub(String(sub.id))}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            selected
                              ? "bg-brand text-white border-brand"
                              : "border-border text-muted hover:border-brand hover:text-brand"
                          }`}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">{error}</p>
      )}

      <div className="flex gap-3 justify-end pb-8">
        <button
          type="button"
          onClick={() => router.push("/admin/contractors")}
          className="px-5 py-2.5 text-sm text-muted hover:text-[#1a1a1a] transition-colors"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-brand text-white text-sm font-medium rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          {saving ? "Сохранение..." : contractorId ? "Сохранить изменения" : "Добавить партнёра"}
        </button>
      </div>
    </form>
  );
}
