"use client";

import { useState } from "react";
import { X, Lightbulb, AlertTriangle, AlertCircle } from "lucide-react";

type Tip = {
  id: number;
  text: string;
  type: string | null;
};

function tipStyle(type: string | null) {
  if (type === "warning") return {
    bg: "#fffbeb", border: "#fde68a", color: "#92400e",
    icon: <AlertTriangle size={13} style={{ color: "#d97706", flexShrink: 0 }} />,
    popupBg: "#fffbeb", popupBorder: "#fcd34d",
  };
  if (type === "danger") return {
    bg: "#fff1f1", border: "#fecaca", color: "#991b1b",
    icon: <AlertCircle size={13} style={{ color: "#ef4444", flexShrink: 0 }} />,
    popupBg: "#fff1f1", popupBorder: "#fca5a5",
  };
  return {
    bg: "#E8F5EE", border: "#b3e6c9", color: "#1e4534",
    icon: <Lightbulb size={13} style={{ color: "#2d6a4f", flexShrink: 0 }} />,
    popupBg: "#E8F5EE", popupBorder: "#86efac",
  };
}

const PREVIEW_LEN = 55;

export default function TipsPopup({ tips }: { tips: Tip[] }) {
  const [open, setOpen] = useState<Tip | null>(null);

  if (!tips.length) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-4">
        {tips.map((tip) => {
          const s = tipStyle(tip.type);
          const preview = tip.text.length > PREVIEW_LEN
            ? tip.text.slice(0, PREVIEW_LEN).trimEnd() + "…"
            : tip.text;
          return (
            <button
              key={tip.id}
              onClick={() => setOpen(tip)}
              className="flex items-start gap-1.5 text-left text-xs px-3 py-2 rounded-xl transition-opacity hover:opacity-80 cursor-pointer"
              style={{
                backgroundColor: s.bg,
                border: `1px solid ${s.border}`,
                color: s.color,
                maxWidth: "260px",
              }}
            >
              {s.icon}
              <span className="leading-snug">{preview}</span>
            </button>
          );
        })}
      </div>

      {/* Попап */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => setOpen(null)}
        >
          <div
            className="relative rounded-2xl p-6 max-w-md w-full shadow-xl"
            style={{
              backgroundColor: tipStyle(open.type).popupBg,
              border: `1px solid ${tipStyle(open.type).popupBorder}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(null)}
              className="absolute top-3 right-3 p-1 rounded-lg transition-opacity hover:opacity-60"
              style={{ color: tipStyle(open.type).color }}
            >
              <X size={16} />
            </button>
            <div className="flex items-start gap-2 mb-1">
              {tipStyle(open.type).icon}
              <p
                className="text-sm leading-relaxed pr-4"
                style={{ color: tipStyle(open.type).color }}
              >
                {open.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
