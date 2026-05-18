"use client";

import { useState } from "react";
import { X, CheckSquare, AlertCircle, Eye } from "lucide-react";

type NoteGroup = {
  label: string;
  items: string[];
  type: "green" | "amber" | "purple";
};

const styles = {
  green:  { bg: "#E8F5EE", border: "#b3e6c9", color: "#1e4534", popupBg: "#f0faf4", popupBorder: "#86efac", dot: "#2d6a4f" },
  amber:  { bg: "#fffbeb", border: "#fde68a", color: "#92400e", popupBg: "#fffbeb", popupBorder: "#fcd34d", dot: "#d97706" },
  purple: { bg: "#f5f0ff", border: "#ddd6fe", color: "#4c1d95", popupBg: "#f5f0ff", popupBorder: "#c4b5fd", dot: "#7c3aed" },
};

function Icon({ type }: { type: "green" | "amber" | "purple" }) {
  if (type === "green")  return <CheckSquare size={13} style={{ color: "#2d6a4f", flexShrink: 0 }} />;
  if (type === "amber")  return <AlertCircle  size={13} style={{ color: "#d97706", flexShrink: 0 }} />;
  return <Eye size={13} style={{ color: "#7c3aed", flexShrink: 0 }} />;
}

export default function NotesChips({ groups }: { groups: NoteGroup[] }) {
  const [open, setOpen] = useState<NoteGroup | null>(null);
  const filtered = groups.filter((g) => g.items.length > 0);
  if (!filtered.length) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-5">
        {filtered.map((g) => {
          const s = styles[g.type];
          return (
            <button
              key={g.label}
              onClick={() => setOpen(g)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-opacity hover:opacity-80 cursor-pointer"
              style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.color }}
            >
              <Icon type={g.type} />
              {g.label}
              <span
                className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: s.dot, color: "#fff" }}
              >
                {g.items.length}
              </span>
            </button>
          );
        })}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => setOpen(null)}
        >
          <div
            className="relative rounded-2xl p-6 max-w-md w-full shadow-xl"
            style={{ backgroundColor: styles[open.type].popupBg, border: `1px solid ${styles[open.type].popupBorder}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(null)}
              className="absolute top-3 right-3 p-1 rounded-lg transition-opacity hover:opacity-60"
              style={{ color: styles[open.type].color }}
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Icon type={open.type} />
              <h3 className="font-bold text-sm" style={{ color: styles[open.type].color }}>{open.label}</h3>
            </div>
            <ul className="space-y-2.5">
              {open.items.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed" style={{ color: styles[open.type].color }}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: styles[open.type].dot }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
