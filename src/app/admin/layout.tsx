import { headers } from "next/headers";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const isLogin = headersList.get("x-is-login") === "1";

  // Login page manages its own full-screen layout
  if (isLogin) return <>{children}</>;

  return (
    <div className="min-h-screen bg-surface flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-6 md:p-8">{children}</main>
    </div>
  );
}
