import type { Metadata } from "next";
import { Inter, Noto_Serif } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Phả Đồ Họ Nguyễn Cẩm Giang",
  description: "Gia phả điện tử dòng họ Nguyễn Cẩm Giang - Từ năm 1469",
};

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} ${notoSerif.variable} antialiased`}
        style={{ fontFamily: "var(--font-inter), var(--font-noto-serif), serif" }}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
