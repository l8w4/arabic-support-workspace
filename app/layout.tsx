import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مساحة عمل مركز الدعم | Support Centre Workspace",
  description: "We Care Support Centre — internal workspace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
