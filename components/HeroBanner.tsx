"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

// ── 날씨 ────────────────────────────────────────────
const WEATHER_CACHE_KEY = "weather_cache";
const WEATHER_CACHE_TTL = 30 * 60 * 1000;
const WEATHER_API_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=31.2304&longitude=121.4737&current=temperature_2m,weathercode&timezone=Asia/Shanghai";

function getWeatherEmoji(code: number): string {
  if (code === 0)  return "☀️";
  if (code <= 2)   return "🌤️";
  if (code === 3)  return "☁️";
  if (code <= 48)  return "🌫️";
  if (code <= 55)  return "🌦️";
  if (code <= 67)  return "🌧️";
  if (code <= 77)  return "🌨️";
  if (code <= 82)  return "🌧️";
  return "⛈️";
}

function useWeather() {
  const [temp, setTemp] = useState<number | null>(null);
  const [code, setCode] = useState<number | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const raw = localStorage.getItem(WEATHER_CACHE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (Date.now() - d.cachedAt < WEATHER_CACHE_TTL) {
          setTemp(d.temp); setCode(d.code); return;
        }
      }
      const res = await fetch(WEATHER_API_URL);
      const json = await res.json();
      const t = Math.round(json.current.temperature_2m);
      const c = json.current.weathercode;
      setTemp(t); setCode(c);
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ temp: t, code: c, cachedAt: Date.now() }));
    } catch {}
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);
  return { temp, code };
}

interface FloatingElementProps {
  x: number;
  y: number;
  size: string;
  rotation: number;
  children: React.ReactNode;
}

function FloatingElement({ x, y, size, rotation, children }: FloatingElementProps) {
  return (
    <div
      className={`absolute ${size} select-none pointer-events-none`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotation}deg)`,
        opacity: 0.88,
      }}
    >
      {children}
    </div>
  );
}

const TIPS = [
  "핫플 장소들 고덕지도로 바로 연결해요 💫",
  "와이탄 야경은 저녁 7시가 최고예요 ✨",
  "디즈니 티켓은 미리 예매하세요! 🎢",
  "예원은 저녁 방문이 더 예뻐요 🏮",
  "난징동루에서 쇼핑 즐기세요 🛍️",
  "신천지 카페 거리 꼭 가보세요 ☕",
  "푸동 야경은 와이탄에서 봐요 🌃",
];

export default function HeroBanner() {
  const [tipIndex, setTipIndex] = useState(0);
  const [today, setToday] = useState<{ month: number; day: number } | null>(null);
  const { temp, code } = useWeather();

  useEffect(() => {
    // 클라이언트에서만 랜덤 tip 인덱스·날짜 설정 (hydration 오류 방지)
    setTipIndex(Math.floor(Math.random() * TIPS.length));
    const now = new Date();
    setToday({ month: now.getMonth() + 1, day: now.getDate() });

    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[210px] overflow-hidden bg-gradient-to-b from-red-50 to-white">
      {/* 배경 도트 패턴 */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, #ef4444 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* 날씨 pill — 상단 중앙 고정 */}
      {temp !== null && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10
                        flex items-center gap-1.5
                        bg-white/85 backdrop-blur-sm
                        rounded-full px-3 py-1 shadow-sm border border-stone-100
                        whitespace-nowrap">
          <span className="text-sm leading-none">{getWeatherEmoji(code!)}</span>
          <span className="text-xs font-semibold text-gray-700">{temp}°C</span>
          <span className="text-stone-300 text-[10px]">·</span>
          <span className="text-xs text-gray-400 font-medium">
            {today ? `${today.month}월 ${today.day}일 · 상하이` : "상하이"}
          </span>
        </div>
      )}

      {/* 중앙: 마스코트 + 말풍선 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0 pt-6">
        <Image
          src="/mascot2.png"
          alt="마스코트"
          width={140}
          height={140}
          className="object-contain -mb-2"
        />
        {/* 말풍선 */}
        <div className="relative mt-0">
          {/* 말풍선 꼭지 (위쪽 삼각형) */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '8px solid #fef3c7',
            }}
          />
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-3 py-1.5 shadow-sm text-center whitespace-nowrap">
            <p className="text-[11px] font-medium text-gray-600 leading-snug">
              {TIPS[tipIndex]}
            </p>
          </div>
        </div>
      </div>

      {/* 왼쪽 열 (x ≤ 25%) */}
      <FloatingElement x={15} y={8}  size="text-2xl" rotation={5}>🏯</FloatingElement>
      <FloatingElement x={20} y={28} size="text-3xl" rotation={-15}>🗼</FloatingElement>
      <FloatingElement x={32} y={44} size="text-2xl" rotation={-5}>🥢</FloatingElement>
      <FloatingElement x={15} y={58} size="text-2xl" rotation={-5}>🍵</FloatingElement>

      {/* 오른쪽 열 (x ≥ 72%) */}
      <FloatingElement x={73} y={8}  size="text-2xl" rotation={10}>🥟</FloatingElement>
      <FloatingElement x={70} y={35} size="text-2xl" rotation={15}>🍜</FloatingElement>
      <FloatingElement x={80} y={60} size="text-xl"  rotation={8}>🛍️</FloatingElement>
    </div>
  );
}
