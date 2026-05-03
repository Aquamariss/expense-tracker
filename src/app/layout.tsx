import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Трекер расходов",
  description: "Учёт личных расходов",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
