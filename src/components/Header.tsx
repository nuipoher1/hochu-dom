"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 flex-1">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Д</span>
          </div>
          <span className="font-semibold text-[#1a1a1a] text-base hidden sm:block">
            Хочу дом
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5 flex-shrink-0">
          <Link href="/#stages" className="text-sm text-muted hover:text-brand transition-colors">
            Этапы
          </Link>
          <Link
            href="/pdf"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
          >
            Скачать PDF
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors flex-shrink-0"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 flex flex-col gap-4">
          <Link href="/" className="text-sm text-muted" onClick={() => setMenuOpen(false)}>Главная</Link>
          <Link href="/#stages" className="text-sm text-muted" onClick={() => setMenuOpen(false)}>Этапы</Link>
          <Link href="/pdf" className="text-sm font-medium text-brand" onClick={() => setMenuOpen(false)}>Скачать PDF</Link>
        </div>
      )}
    </header>
  );
}
