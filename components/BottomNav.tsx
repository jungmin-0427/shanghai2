"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin } from "lucide-react";

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/places", label: "탐색", icon: MapPin },
];

// Toss WebView on Android: RN layer already handles the navigation bar safe area,
// so env(safe-area-inset-bottom) causes double-padding. Use 0 on Android.
const isAndroid =
  typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
const safeBottom = isAndroid ? "0px" : "env(safe-area-inset-bottom)";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100"
      style={{ paddingBottom: safeBottom }}
    >
      <div className="flex max-w-lg mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors
                ${active ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
