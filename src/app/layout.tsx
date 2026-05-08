import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Хочу дом — Партнёрский каталог фестиваля",
  description: "Справочник проверенных подрядчиков для строительства дома. Путь от участка до новоселья.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
