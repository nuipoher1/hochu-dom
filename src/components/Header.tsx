"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Download } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L2 8v8h5v-5h4v5h5V8L9 2Z" fill="white" />
            </svg>
          </div>
          <div className="hidden sm:block leading-none">
            <div className="font-bold text-[#1a1a1a] text-sm tracking-wide uppercase">Хочу дом</div>
            <div className="text-[10px] text-muted font-medium tracking-wider uppercase">Фестиваль</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          <Link href="/#stages" className="text-sm text-muted hover:text-brand px-3 py-2 rounded-lg hover:bg-green-50 transition-colors">
            Этапы строительства
          </Link>
          <Link href="/pdf" className="text-sm text-muted hover:text-brand px-3 py-2 rounded-lg hover:bg-green-50 transition-colors">
            Каталог подрядчиков
          </Link>
          <Link href="#about" className="text-sm text-muted hover:text-brand px-3 py-2 rounded-lg hover:bg-green-50 transition-colors">
            О фестивале
          </Link>
        </nav>

        {/* Right: PDF button */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <Link
            href="/pdf"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-xl hover:bg-brand-dark transition-colors"
          >
            <Download size={14} />
            Скачать каталог PDF
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors flex-shrink-0 ml-auto"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 flex flex-col gap-3">
          <Link href="/" className="text-sm text-muted py-1" onClick={() => setMenuOpen(false)}>Главная</Link>
          <Link href="/#stages" className="text-sm text-muted py-1" onClick={() => setMenuOpen(false)}>Этапы строительства</Link>
          <Link href="#about" className="text-sm text-muted py-1" onClick={() => setMenuOpen(false)}>О фестивале</Link>
          <Link href="/pdf" className="text-sm font-medium text-brand py-1" onClick={() => setMenuOpen(false)}>Скачать каталог PDF</Link>
        </div>
      )}
    </header>
  );
}
