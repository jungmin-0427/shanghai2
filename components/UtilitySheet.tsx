"use client";

import { useState, useEffect, useCallback } from "react";
import { X, RefreshCw } from "lucide-react";

// ── 환율 ──────────────────────────────────────────────
const CACHE_KEY = "exchange_rate_cache";
const CACHE_TTL = 30 * 60 * 1000;
const API_URL = "https://api.frankfurter.dev/v1/latest?from=CNY&to=KRW";

function loadCache(): { rate: number; cachedAt: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.cachedAt < CACHE_TTL) return data;
    return null;
  } catch { return null; }
}

function saveCache(rate: number) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, cachedAt: Date.now() }));
  } catch {}
}

function formatKrw(v: number) { return Math.round(v).toLocaleString("ko-KR"); }
function formatCny(v: number) { return v.toLocaleString("zh-CN", { maximumFractionDigits: 2 }); }

// ── 날씨 ──────────────────────────────────────────────
function getWeatherEmoji(code: number) {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  if (code <= 82) return "🌧️";
  return "⛈️";
}

function getWeatherLabel(code: number) {
  if (code === 0) return "맑음";
  if (code <= 2) return "구름 조금";
  if (code === 3) return "흐림";
  if (code <= 48) return "안개";
  if (code <= 55) return "이슬비";
  if (code <= 67) return "비";
  if (code <= 77) return "눈";
  if (code <= 82) return "소나기";
  return "천둥번개";
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

// ── 날씨 시트 ─────────────────────────────────────────
interface WeatherSheetProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherData | null;
  today: { month: number; day: number } | null;
}

export function WeatherSheet({ isOpen, onClose, weather, today }: WeatherSheetProps) {
  if (!isOpen) return null;

  const tomorrow = today ? { month: today.month, day: today.day + 1 } : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="bg-white rounded-t-3xl shadow-xl max-w-lg mx-auto px-5 pt-4 pb-8" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">상하이 날씨</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {weather ? (
            <div className="flex gap-3">
              {/* 오늘 */}
              <div className="flex-1 bg-red-50 rounded-2xl px-3 py-3 flex flex-col items-center gap-1.5">
                <p className="text-xs font-semibold text-red-400">
                  오늘{today ? ` · ${today.month}/${today.day}` : ""}
                </p>
                <span className="text-4xl">{getWeatherEmoji(weather.code)}</span>
                <p className="text-2xl font-bold text-gray-800">{weather.temp}°C</p>
                <p className="text-xs text-gray-500">{getWeatherLabel(weather.code)}</p>
              </div>

              {/* 내일 */}
              <div className="flex-1 bg-stone-50 rounded-2xl px-3 py-3 flex flex-col items-center gap-1.5">
                <p className="text-xs font-semibold text-gray-400">
                  내일{tomorrow ? ` · ${tomorrow.month}/${tomorrow.day}` : ""}
                </p>
                <span className="text-4xl">{getWeatherEmoji(weather.tomorrowCode)}</span>
                <p className="text-2xl font-bold text-gray-700">{weather.tomorrowMax}°C</p>
                <p className="text-xs text-gray-500">{getWeatherLabel(weather.tomorrowCode)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">날씨 정보를 불러오는 중...</p>
          )}
        </div>
      </div>
    </>
  );
}

// ── 환율 시트 ─────────────────────────────────────────
interface ExchangeSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExchangeSheet({ isOpen, onClose }: ExchangeSheetProps) {
  const [rate, setRate] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [cnyInput, setCnyInput] = useState("100");
  const [krwInput, setKrwInput] = useState("");

  const fetchRate = useCallback(async (force = false) => {
    if (!force) {
      const cached = loadCache();
      if (cached) {
        setRate(cached.rate);
        setUpdatedAt(new Date(cached.cachedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));
        return;
      }
    }
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error();
      const json = await res.json();
      const r: number = json.rates.KRW;
      setRate(r);
      saveCache(r);
      setUpdatedAt(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));
    } catch {
      setIsError(true);
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const d = JSON.parse(raw);
          setRate(d.rate);
          setUpdatedAt(new Date(d.cachedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) + " (오래됨)");
        }
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { if (isOpen) fetchRate(); }, [isOpen, fetchRate]);

  useEffect(() => {
    if (rate && cnyInput === "100" && krwInput === "") {
      setKrwInput(formatKrw(100 * rate));
    }
  }, [rate, cnyInput, krwInput]);

  function handleCnyChange(val: string) {
    setCnyInput(val);
    if (rate && val !== "") {
      const n = parseFloat(val.replace(/,/g, ""));
      setKrwInput(isNaN(n) ? "" : formatKrw(n * rate));
    } else setKrwInput("");
  }

  function handleKrwChange(val: string) {
    setKrwInput(val);
    if (rate && val !== "") {
      const n = parseFloat(val.replace(/,/g, ""));
      setCnyInput(isNaN(n) ? "" : formatCny(n / rate));
    } else setCnyInput("");
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="bg-white rounded-t-3xl shadow-xl max-w-lg mx-auto px-5 pt-4" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">환율 계산기</h2>
            <div className="flex items-center gap-2">
              {updatedAt && (
                <span className="text-[10px] text-gray-400">{isError ? "⚠️ " : ""}{updatedAt}</span>
              )}
              <button onClick={() => fetchRate(true)} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors" aria-label="새로고침">
                <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {isLoading && !rate ? (
            <p className="text-sm text-gray-400 py-4 text-center">환율 불러오는 중...</p>
          ) : isError && !rate ? (
            <p className="text-sm text-red-400 py-4 text-center">환율 정보를 불러올 수 없어요</p>
          ) : rate ? (
            <div className="bg-stone-50 rounded-2xl px-4 py-4">
              <p className="text-sm font-semibold text-gray-700 mb-4">
                1위안 = <span className="text-red-500 text-sm">{formatKrw(rate)}원</span>
              </p>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex-1 text-[11px] font-medium text-gray-400">위안화 (¥ CNY)</span>
                <span className="w-4" />
                <span className="flex-1 text-[11px] font-medium text-gray-400">원화 (₩ KRW)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white rounded-xl border border-stone-200 px-3 py-2.5 gap-1.5 flex-1">
                  <span className="text-gray-400 font-semibold text-sm shrink-0">¥</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={cnyInput}
                    onChange={(e) => handleCnyChange(e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent outline-none text-sm font-semibold text-gray-800 placeholder:text-gray-300"
                  />
                </div>
                <span className="text-gray-300 text-sm shrink-0">=</span>
                <div className="flex items-center bg-white rounded-xl border border-stone-200 px-3 py-2.5 gap-1.5 flex-1">
                  <span className="text-gray-400 font-semibold text-sm shrink-0">₩</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={krwInput}
                    onChange={(e) => handleKrwChange(e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent outline-none text-sm font-bold text-red-500 placeholder:text-gray-300"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
