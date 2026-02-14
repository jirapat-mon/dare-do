import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import ClientProviders from "@/components/ClientProviders";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto-sans-thai",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "DareDo - เดิมพันกับตัวเอง | The Discipline Bet",
  description:
    "กล้าเดิมพันกับตัวเองไหม? วางเงินมัดจำ ทำภารกิจให้สำเร็จ ได้เงินคืน หรือเสียทั้งหมด - แอปพลิเคชันที่ใช้เงินเป็นแรงจูงใจให้คุณบรรลุเป้าหมาย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoSansThai.variable} font-sans antialiased bg-app text-app min-h-screen`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
