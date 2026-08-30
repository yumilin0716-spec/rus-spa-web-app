import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ru's SPA｜美容產品庫存",
  description: "依部位、保養步驟與效期整理的 Ru's SPA 美容產品庫存。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
