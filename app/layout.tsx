import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CRM - Quản lý quan hệ khách hàng",
  description: "Hệ thống CRM hiện đại để quản lý liên hệ, công ty và thương vụ",
  icons: {
    icon: "/logo-w.png",
    apple: "/logo-w.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
