import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Трекер расходов",
  description: "Учёт личных расходов",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
