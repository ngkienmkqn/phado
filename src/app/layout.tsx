import type { Metadata } from "next";
import { Inter, Noto_Serif } from "next/font/google";
import "./globals.css";

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
  title: "Phả Đồ Nguyễn Cẩm Giang",
  description: "Gia phả điện tử dòng họ Nguyễn Cẩm Giang - Từ năm 1469",
};

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
        {children}
      </body>
    </html>
  );
}
