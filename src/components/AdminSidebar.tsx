"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Users, FolderTree, LogOut, ExternalLink } from "lucide-react";

const nav = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard, exact: true },
  { href: "/admin/contractors", label: "Партнёры", icon: Users },
  { href: "/admin/categories", label: "Этапы и услуги", icon: FolderTree },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-border flex flex-col min-h-screen">
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Д</span>
          </div>
          <div>
            <p className="font-semibold text-[#1a1a1a] text-sm leading-tight">Хочу дом</p>
            <p className="text-[10px] text-muted">Администратор</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active ? "bg-green-50 text-brand font-medium" : "text-muted hover:bg-surface hover:text-[#1a1a1a]"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:bg-surface hover:text-[#1a1a1a] transition-colors"
        >
          <ExternalLink size={16} />
          Открыть сайт
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={16} />
          Выйти
        </button>
      </div>
    </aside>
  );
}
