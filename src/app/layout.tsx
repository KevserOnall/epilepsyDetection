import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Radyologi - Radyoloji Görüntü Analiz Sistemi",
  description: "CT, X-Ray ve MRI görüntülerinin yapay zeka ile analizi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
