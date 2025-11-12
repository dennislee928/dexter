import "./globals.css";

import type { Metadata } from "next";

import { ChatProvider } from "@/context/ChatContext";

export const metadata: Metadata = {
  title: "Dexter Control Center",
  description: "LocalAI 控制台，用於管理 Dexter 代理與 LocalAI 的互動。",
  icons: [{ rel: "icon", url: "/favicon.ico" }]
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900 antialiased">
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}

