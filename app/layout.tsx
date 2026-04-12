import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "상하이 가이드 - 중국어 주소 쉽게 복사",
  description: "상하이 인기 맛집·카페·관광지의 중국어 주소를 쉽게 복사하고 고덕지도에서 바로 열어보세요.",
  keywords: "상하이, 여행, 맛집, 카페, 관광지, 중국어 주소, 고덕지도, 가오더지도",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-gray-50 antialiased">
        <div className="max-w-lg mx-auto min-h-screen relative">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
