"use client";

import { useState, useEffect, useCallback } from "react";

const CACHE_KEY = "weather_cache";
const CACHE_TTL = 30 * 60 * 1000;
const API_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=31.2304&longitude=121.4737&current=temperature_2m,weathercode&timezone=Asia/Shanghai";

interface WeatherCache {
  temp: number;
  code: number;
  cachedAt: number;
}

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

function loadCache(): WeatherCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data: WeatherCache = JSON.parse(raw);
    if (Date.now() - data.cachedAt < CACHE_TTL) return data;
    return null;
  } catch { return null; }
}

function saveCache(temp: number, code: number) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ temp, code, cachedAt: Date.now() }));
  } catch {}
}

export default function WeatherCard() {
  const [temp, setTemp] = useState<number | null>(null);
  const [code, setCode] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchWeather = useCallback(async () => {
    const cached = loadCache();
    if (cached) {
      setTemp(cached.temp);
      setCode(cached.code);
      setIsLoaded(true);
      return;
    }
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error();
      const json = await res.json();
      const t = Math.round(json.current.temperature_2m);
      const c = json.current.weathercode;
      setTemp(t);
      setCode(c);
      saveCache(t, c);
    } catch {}
    finally { setIsLoaded(true); }
  }, []);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  if (!isLoaded || temp === null) return null;

  return (
    <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-md border border-stone-100">
      <span className="text-sm leading-none">{getWeatherEmoji(code!)}</span>
      <span className="text-xs font-semibold text-gray-700">{temp}°C</span>
      <span className="text-stone-300 text-xs">·</span>
      <span className="text-xs text-gray-400 font-medium">상하이</span>
    </div>
  );
}
