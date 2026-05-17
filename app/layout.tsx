import type { Metadata, Viewport } from "next";
import "./globals.css";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import { SerwistProvider } from "@/components/SerwistProvider";

export const metadata: Metadata = {
  title: "상하이콕",
  description: "상하이 인기 맛집·카페·관광지의 중국어 주소를 쉽게 복사하고 고덕지도에서 바로 열어보세요.",
  keywords: "상하이, 여행, 맛집, 카페, 관광지, 중국어 주소, 고덕지도, 가오더지도",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "상하이콕",
  },
  icons: {
    apple: "/mascot2.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#D4271B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-stone-50 antialiased">
        <SerwistProvider swUrl="/serwist/sw.js" disable={process.env.NODE_ENV === "development"}>
          <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-100 h-12">
            <div className="flex items-center gap-2 max-w-lg mx-auto h-full px-4">
              <Image
                src="/mascot2.png"
                alt="상하이콕 마스코트"
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="text-sm font-bold text-gray-900 tracking-tight">상하이콕</span>
            </div>
          </header>
          <div className="max-w-lg mx-auto min-h-screen relative">{children}</div>
          <BottomNav />
        </SerwistProvider>
      </body>
    </html>
  );
}
