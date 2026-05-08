"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

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
  address: string;
  geography: string[];
  isFestivalPartner: boolean;
  isSpeaker: boolean;
  speakerTopic: string;
  speakerLectureUrl: string;
  subcategoryIds: string[];
};

const EMPTY: FormData = {
  name: "", description: "", phone: "", email: "", website: "",
  instagram: "", vk: "", telegram: "", address: "", geography: [],
  isFestivalPartner: false, isSpeaker: false, speakerTopic: "",
  speakerLectureUrl: "", subcategoryIds: [],
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
    ? { ...initial, geography: typeof initial.geography === "string" ? parseGeography(initial.geography) : (initial.geography ?? []) }
    : undefined;
  const [form, setForm] = useState<FormData>({ ...EMPTY, ...parsedInitial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

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
        // Если выбрали «Вся Россия» — снять всё остальное
        return { ...f, geography: f.geography.includes(d) ? [] : ["Вся Россия"] };
      }
      // При выборе конкретного округа — снять «Вся Россия»
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

      {/* Категории */}
      <section className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-semibold text-[#1a1a1a] mb-4">Категории и услуги</h2>
        <p className="text-xs text-muted mb-4">Выберите все подкатегории, которые относятся к этому партнёру</p>

        <div className="space-y-2">
          {categories.map((cat) => {
            const isOpen = !!openCats[cat.id];
            const selectedCount = cat.subcategories.filter((s) => form.subcategoryIds.includes(s.id)).length;
            return (
              <div key={cat.id} className="border border-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleCat(cat.id)}
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
                      const selected = form.subcategoryIds.includes(sub.id);
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => toggleSub(sub.id)}
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
