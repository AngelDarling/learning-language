import type { Metadata } from "next";
import { Nunito, DM_Sans } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LangMaster — Học mỗi ngày, thi một lần",
    template: "%s | LangMaster",
  },
  description:
    "Nền tảng luyện thi TOEIC, IELTS, TOEFL hàng đầu. Lộ trình cá nhân hóa, đề thi thật, phân tích điểm yếu chính xác.",
  keywords: ["TOEIC", "IELTS", "TOEFL", "luyện thi tiếng Anh", "học tiếng Anh online"],
  openGraph: {
    title: "LangMaster — Học mỗi ngày, thi một lần",
    description: "Luyện TOEIC, IELTS, TOEFL với lộ trình cá nhân hóa.",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${nunito.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
