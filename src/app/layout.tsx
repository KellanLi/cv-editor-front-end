import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chat Resume",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" data-theme="brand">
      <body>{children}</body>
    </html>
  );
}
