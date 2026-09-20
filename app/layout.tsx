import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مركز دعم للغة العربية | Arabic Support Centre",
  description: "We Care Support Centre — internal workspace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
