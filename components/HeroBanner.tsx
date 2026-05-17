"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';
import { WeatherSheet, ExchangeSheet } from '@/components/UtilitySheet';

// ── 날씨 ────────────────────────────────────────────
const WEATHER_CACHE_KEY = "weather_cache";
const WEATHER_CACHE_TTL = 30 * 60 * 1000;
const WEATHER_API_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=31.2304&longitude=121.4737&current=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia/Shanghai&forecast_days=2";

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

interface WeatherData {
  temp: number;
  code: number;
  todayMax: number;
  todayMin: number;
  tomorrowCode: number;
  tomorrowMax: number;
  tomorrowMin: number;
}

function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const raw = localStorage.getItem(WEATHER_CACHE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (Date.now() - d.cachedAt < WEATHER_CACHE_TTL && d.tomorrowMax != null) {
          setData(d); return;
        }
      }
      const res = await fetch(WEATHER_API_URL);
      const json = await res.json();
      const fetched: WeatherData = {
        temp: Math.round(json.current.temperature_2m),
        code: json.current.weathercode,
        todayMax: Math.round(json.daily.temperature_2m_max[0]),
        todayMin: Math.round(json.daily.temperature_2m_min[0]),
        tomorrowCode: json.daily.weathercode[1],
        tomorrowMax: Math.round(json.daily.temperature_2m_max[1]),
        tomorrowMin: Math.round(json.daily.temperature_2m_min[1]),
      };
      setData(fetched);
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ ...fetched, cachedAt: Date.now() }));
    } catch {}
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);
  return data;
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

interface HeroBannerProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function HeroBanner({ searchValue, onSearchChange }: HeroBannerProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [today, setToday] = useState<{ month: number; day: number } | null>(null);
  const [weatherOpen, setWeatherOpen] = useState(false);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const weather = useWeather();

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
    <div className="relative h-[250px] overflow-hidden bg-gradient-to-b from-red-50 to-white">
      {/* 상단 중앙 말풍선 */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-3 py-1.5 shadow-sm whitespace-nowrap">
          <p className="text-[11px] font-medium text-gray-600 leading-snug">
            {TIPS[tipIndex]}
          </p>
        </div>
      </div>

      {/* 우측 상단 통합 pill 버튼 */}
      <div className="absolute top-3 right-3 z-10 flex items-center bg-white/90 backdrop-blur-sm rounded-full border border-gray-400 shadow-sm overflow-hidden">
        <button
          onClick={() => setWeatherOpen(true)}
          className="flex items-center justify-center px-3 py-1.5 active:bg-gray-100 transition-colors"
          aria-label="날씨 보기"
        >
          <span className="text-xs font-medium text-gray-700">날씨</span>
        </button>
        <div className="w-px h-4 bg-gray-500" />
        <button
          onClick={() => setExchangeOpen(true)}
          className="flex items-center justify-center px-3 py-1.5 active:bg-gray-100 transition-colors"
          aria-label="환율 계산기"
        >
          <span className="text-xs font-medium text-gray-700">환율</span>
        </button>
      </div>

      {/* 중앙: 마스코트 */}
      <div className="absolute inset-x-0 top-7 flex flex-col items-center">
        <Image
          src="/mascot2.png"
          alt="마스코트"
          width={150}
          height={150}
          className="object-contain"
        />
      </div>

      {/* 검색창 */}
      <div className="absolute bottom-3 left-4 right-4">
        <SearchBar value={searchValue} onChange={onSearchChange} />
      </div>

      {/* 바텀시트 */}
      <WeatherSheet isOpen={weatherOpen} onClose={() => setWeatherOpen(false)} weather={weather} today={today} />
      <ExchangeSheet isOpen={exchangeOpen} onClose={() => setExchangeOpen(false)} />

      {/* 왼쪽 열 (x ≤ 25%) */}
      <FloatingElement x={15} y={5}  size="text-2xl" rotation={5}>🏯</FloatingElement>
      <FloatingElement x={20} y={22} size="text-3xl" rotation={-15}>🗼</FloatingElement>
      <FloatingElement x={32} y={36} size="text-2xl" rotation={-5}>🥢</FloatingElement>
      <FloatingElement x={15} y={50} size="text-2xl" rotation={-5}>🍵</FloatingElement>

      {/* 오른쪽 열 (x ≥ 72%) */}
      <FloatingElement x={65} y={50} size="text-2xl" rotation={10}>🥟</FloatingElement>
      <FloatingElement x={70} y={28} size="text-2xl" rotation={15}>🍜</FloatingElement>
      <FloatingElement x={80} y={50} size="text-xl"  rotation={8}>🛍️</FloatingElement>
    </div>
  );
}
