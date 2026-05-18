"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown, ChevronRight, Plus, Pencil, Trash2, X,
  Save, AlertTriangle, BookOpen
} from "lucide-react";

type Subcategory = { id: number; name: string; slug: string };
type Category = {
  id: number; name: string; slug: string;
  icon: string | null; order: number;
  importantNotes: string | null;
  commonMistakes: string | null;
  attentionPoints: string | null;
  contractorCount: number;
  subcategories: Subcategory[];
};

function parseJson(val: string | null): string[] {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

const inputCls = "w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors";

// ──────────────────────────────────────────────
// Editable list of strings (importantNotes etc.)
// ──────────────────────────────────────────────
function StringListEditor({
  label, value, onChange,
}: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  function update(i: number, v: string) {
    const next = [...value];
    next[i] = v;
    onChange(next);
  }
  function remove(i: number) { onChange(value.filter((_, idx) => idx !== i)); }
  function add() { onChange([...value, ""]); }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</span>
        <button type="button" onClick={add} className="text-xs text-brand hover:underline flex items-center gap-1">
          <Plus size={11} /> Добавить
        </button>
      </div>
      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              className={inputCls}
              placeholder="Текст пункта..."
            />
            <button type="button" onClick={() => remove(i)} className="text-muted hover:text-red-500 transition-colors flex-shrink-0">
              <X size={15} />
            </button>
          </div>
        ))}
        {value.length === 0 && (
          <p className="text-xs text-muted italic">Нет пунктов</p>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Category editor modal
// ──────────────────────────────────────────────
function CategoryModal({
  cat, onClose, onSaved,
}: {
  cat: Category | null; // null = new
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !cat;
  const [name, setName] = useState(cat?.name || "");
  const [slug, setSlug] = useState(cat?.slug || "");

  const [icon, setIcon] = useState(cat?.icon || "");
  const [importantNotes, setImportantNotes] = useState<string[]>(parseJson(cat?.importantNotes || null));
  const [commonMistakes, setCommonMistakes] = useState<string[]>(parseJson(cat?.commonMistakes || null));
  const [attentionPoints, setAttentionPoints] = useState<string[]>(parseJson(cat?.attentionPoints || null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from name for new categories
  function handleNameChange(v: string) {
    setName(v);
    if (isNew) {
      setSlug(
        v.toLowerCase()
          .replace(/[а-яё]/g, (c) => ({ а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"kh",ц:"ts",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya" }[c] || c))
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      );
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const url = isNew ? "/api/categories" : `/api/categories/${cat!.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, icon, importantNotes, commonMistakes, attentionPoints }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Ошибка сохранения");
      }
      onSaved();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-border shadow-xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-[#1a1a1a]">{isNew ? "Новый этап" : `Редактировать этап: ${cat!.name}`}</h3>
          <button onClick={onClose} className="text-muted hover:text-[#1a1a1a] transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Base fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Название <span className="text-red-500">*</span></label>
              <input value={name} onChange={(e) => handleNameChange(e.target.value)} className={inputCls} placeholder="Земельный участок" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Slug <span className="text-red-500">*</span></label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputCls} placeholder="zemelniy-uchastok" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Иконка (Lucide)</label>
            <input value={icon} onChange={(e) => setIcon(e.target.value)} className={inputCls} placeholder="MapPin" />
            <p className="text-xs text-muted mt-1">Название компонента из lucide-react, например: MapPin, Home, Wrench</p>
          </div>

          <div className="border-t border-border pt-5 space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1a1a1a]">
              <BookOpen size={15} className="text-brand" />
              Образовательный контент
            </div>

            <StringListEditor
              label="На что обратить внимание"
              value={importantNotes}
              onChange={setImportantNotes}
            />
            <StringListEditor
              label="Частые ошибки"
              value={commonMistakes}
              onChange={setCommonMistakes}
            />
            <StringListEditor
              label="Важно знать"
              value={attentionPoints}
              onChange={setAttentionPoints}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">{error}</p>
          )}
        </div>

        <div className="flex gap-3 justify-end px-6 py-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-[#1a1a1a] transition-colors">Отмена</button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !slug.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 bg-brand text-white text-sm font-medium rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Subcategory inline row
// ──────────────────────────────────────────────
function SubcategoryRow({
  sub, categoryId, onRefresh,
}: { sub: Subcategory; categoryId: string; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(sub.name);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/subcategories/${sub.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: sub.slug }),
    });
    setSaving(false);
    setEditing(false);
    onRefresh();
  }

  async function del() {
    await fetch(`/api/subcategories/${sub.id}`, { method: "DELETE" });
    setConfirmDelete(false);
    onRefresh();
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-2.5 py-1.5 rounded-lg border border-brand bg-white text-sm focus:outline-none"
          autoFocus
        />
        <button onClick={save} disabled={saving} className="p-1.5 text-brand hover:text-brand-dark transition-colors">
          <Save size={14} />
        </button>
        <button onClick={() => { setEditing(false); setName(sub.name); }} className="p-1.5 text-muted hover:text-[#1a1a1a] transition-colors">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-1.5 group">
      <span className="text-sm text-[#1a1a1a]">{sub.name}</span>
      {!confirmDelete ? (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="p-1 text-muted hover:text-brand transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={() => setConfirmDelete(true)} className="p-1 text-muted hover:text-red-500 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-600">Удалить?</span>
          <button onClick={del} className="text-xs text-red-600 font-medium hover:underline">Да</button>
          <button onClick={() => setConfirmDelete(false)} className="text-xs text-muted hover:underline">Нет</button>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Add subcategory inline form
// ──────────────────────────────────────────────
function AddSubcategoryForm({ categoryId, onAdded }: { categoryId: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function slugify(v: string) {
    return v.toLowerCase()
      .replace(/[а-яё]/g, (c) => ({ а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"kh",ц:"ts",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya" }[c] || c))
      .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function save() {
    if (!name.trim()) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${categoryId}/subcategories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slugify(name.trim()) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Ошибка ${res.status}`);
      }
      setName("");
      setOpen(false);
      onAdded();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Не удалось добавить");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-brand hover:underline flex items-center gap-1 mt-2">
        <Plus size={11} /> Добавить услугу
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") { setOpen(false); setError(""); } }}
          placeholder="Название услуги"
          className="flex-1 px-2.5 py-1.5 rounded-lg border border-brand bg-white text-sm focus:outline-none"
          autoFocus
        />
        <button onClick={save} disabled={saving || !name.trim()} className="p-1.5 text-brand hover:text-brand-dark transition-colors disabled:opacity-40">
          <Save size={14} />
        </button>
        <button onClick={() => { setOpen(false); setName(""); setError(""); }} className="p-1.5 text-muted hover:text-[#1a1a1a] transition-colors">
          <X size={14} />
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ──────────────────────────────────────────────
// Main page component
// ──────────────────────────────────────────────
export default function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const [editModal, setEditModal] = useState<Category | null | "new">(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  function toggleCat(id: number | string) {
    setOpenCats((o) => ({ ...o, [id]: !o[id] }));
  }

  async function refresh() {
    router.refresh();
    // Optimistic: re-fetch categories via API
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    await fetch(`/api/categories/${deleteConfirm.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteConfirm(null);
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1a1a]">Этапы</h1>
          <p className="text-sm text-muted mt-0.5">{categories.length} этапов</p>
        </div>
        <button
          onClick={() => setEditModal("new")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-xl hover:bg-brand-dark transition-colors"
        >
          <Plus size={16} /> Добавить
        </button>
      </div>

      <div className="space-y-3">
        {categories.map((cat, idx) => {
          const isOpen = !!openCats[cat.id];
          return (
            <div key={cat.id} className="bg-white rounded-2xl border border-border overflow-hidden">
              {/* Category header row */}
              <div className="flex items-center gap-3 px-5 py-4">
                <span className="text-xs text-muted w-5 text-right flex-shrink-0">{idx + 1}</span>
                <button
                  onClick={() => toggleCat(cat.id)}
                  className="flex-1 flex items-center gap-3 text-left min-w-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1a1a1a]">{cat.name}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {cat.subcategories.length} услуг · {cat.contractorCount} партнёров
                    </p>
                  </div>
                  {isOpen
                    ? <ChevronDown size={16} className="text-muted flex-shrink-0 ml-auto" />
                    : <ChevronRight size={16} className="text-muted flex-shrink-0 ml-auto" />
                  }
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setEditModal(cat)}
                    className="p-1.5 text-muted hover:text-brand transition-colors"
                    title="Редактировать"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(cat)}
                    className="p-1.5 text-muted hover:text-red-500 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Expanded: subcategories + educational content preview */}
              {isOpen && (
                <div className="border-t border-border px-5 py-4 bg-surface/50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Subcategories */}
                    <div>
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Услуги</p>
                      <div className="divide-y divide-border">
                        {cat.subcategories.map((sub) => (
                          <SubcategoryRow key={sub.id} sub={sub} categoryId={cat.id} onRefresh={refresh} />
                        ))}
                      </div>
                      <AddSubcategoryForm categoryId={cat.id} onAdded={refresh} />
                    </div>

                    {/* Educational content preview */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider">Образовательный контент</p>

                      {[
                        { label: "На что обратить внимание", data: parseJson(cat.importantNotes) },
                        { label: "Частые ошибки", data: parseJson(cat.commonMistakes) },
                        { label: "Важно знать", data: parseJson(cat.attentionPoints) },
                      ].map(({ label, data }) => (
                        <div key={label}>
                          <p className="text-xs text-muted mb-1">{label}</p>
                          {data.length > 0 ? (
                            <ul className="space-y-0.5">
                              {data.slice(0, 2).map((item, i) => (
                                <li key={i} className="text-xs text-[#1a1a1a] truncate">· {item}</li>
                              ))}
                              {data.length > 2 && (
                                <li className="text-xs text-muted">и ещё {data.length - 2}...</li>
                              )}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted italic">Не заполнено</p>
                          )}
                        </div>
                      ))}

                      <button
                        onClick={() => setEditModal(cat)}
                        className="text-xs text-brand hover:underline flex items-center gap-1 mt-1"
                      >
                        <Pencil size={11} /> Редактировать контент
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit / New modal */}
      {editModal !== null && (
        <CategoryModal
          cat={editModal === "new" ? null : editModal}
          onClose={() => setEditModal(null)}
          onSaved={() => { setEditModal(null); refresh(); }}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl border border-border shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1a1a1a]">Удалить этап?</h3>
                <p className="text-sm text-muted mt-1">
                  <span className="font-medium text-[#1a1a1a]">{deleteConfirm.name}</span> и все его услуги будут удалены.
                  {deleteConfirm._count.contractors > 0 && (
                    <span className="text-red-600"> {deleteConfirm._count.contractors} партнёров потеряют эту категорию.</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-muted hover:text-[#1a1a1a] transition-colors">
                Отмена
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? "Удаление..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
