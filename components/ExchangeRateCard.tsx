"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

const CACHE_KEY = "exchange_rate_cache";
const CACHE_TTL = 30 * 60 * 1000; // 30분 (ms)
const API_URL = "https://api.frankfurter.dev/v1/latest?from=CNY&to=KRW";

interface CacheData {
  rate: number;
  cachedAt: number;
}

function loadCache(): CacheData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data: CacheData = JSON.parse(raw);
    if (Date.now() - data.cachedAt < CACHE_TTL) return data;
    return null;
  } catch {
    return null;
  }
}

function saveCache(rate: number) {
  try {
    const data: CacheData = { rate, cachedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
}

function formatKrw(value: number) {
  return Math.round(value).toLocaleString("ko-KR");
}

function formatCny(value: number) {
  return value.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
}

export default function ExchangeRateCard() {
  const [rate, setRate] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [cnyInput, setCnyInput] = useState("100");
  const [krwInput, setKrwInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

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
      if (!res.ok) throw new Error("API 오류");
      const json = await res.json();
      const fetchedRate: number = json.rates.KRW;
      setRate(fetchedRate);
      saveCache(fetchedRate);
      setUpdatedAt(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));
    } catch {
      setIsError(true);
      // 캐시 만료돼도 마지막 값 유지
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const data: CacheData = JSON.parse(raw);
          setRate(data.rate);
          setUpdatedAt(new Date(data.cachedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) + " (오래됨)");
        }
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  // 위안 입력 → 원화 계산
  function handleCnyChange(val: string) {
    setCnyInput(val);
    if (rate && val !== "") {
      const num = parseFloat(val.replace(/,/g, ""));
      setKrwInput(isNaN(num) ? "" : formatKrw(num * rate));
    } else {
      setKrwInput("");
    }
  }

  // 원화 입력 → 위안 계산
  function handleKrwChange(val: string) {
    setKrwInput(val);
    if (rate && val !== "") {
      const num = parseFloat(val.replace(/,/g, ""));
      setCnyInput(isNaN(num) ? "" : formatCny(num / rate));
    } else {
      setCnyInput("");
    }
  }

  // 확장할 때 기본값 세팅
  function handleToggle() {
    if (!isExpanded && rate && cnyInput === "") {
      setCnyInput("100");
      setKrwInput(formatKrw(100 * rate));
    }
    setIsExpanded((v) => !v);
  }

  // 초기 확장 상태에서 rate 로드되면 기본값 계산
  useEffect(() => {
    if (rate && cnyInput === "100" && krwInput === "") {
      setKrwInput(formatKrw(100 * rate));
    }
  }, [rate, cnyInput, krwInput]);

  return (
    <div className="mx-4 mt-3 mb-1 rounded-2xl border border-stone-100 bg-white shadow-sm overflow-hidden">
      {/* 기본 노출 행 */}
      <div
        onClick={handleToggle}
        role="button"
        className="w-full flex items-center justify-between px-4 py-3 gap-2 active:bg-stone-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🪙</span>
          {isLoading ? (
            <span className="text-sm text-gray-400">환율 불러오는 중...</span>
          ) : isError && !rate ? (
            <span className="text-sm text-red-400">환율 정보를 불러올 수 없어요</span>
          ) : rate ? (
            <span className="text-sm font-semibold text-gray-800">
              1위안 ={" "}
              <span className="text-red-500">{formatKrw(rate)}원</span>
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {updatedAt && (
            <span className="text-[11px] text-gray-400">{isError ? "⚠️ " : ""}{updatedAt}</span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); fetchRate(true); }}
            className="p-1 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="환율 새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          {isExpanded
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />
          }
        </div>
      </div>

      {/* 계산기 영역 (확장 시) */}
      {isExpanded && rate && (
        <div className="border-t border-stone-100 px-4 py-3">
          {/* 라벨 행 */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex-1 text-[11px] font-medium text-gray-400">위안화 (¥ CNY)</span>
            <span className="w-5" />
            <span className="flex-1 text-[11px] font-medium text-gray-400">원화 (₩ KRW)</span>
          </div>
          {/* 입력 행 */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-stone-50 rounded-xl border border-stone-200 px-3 py-2.5 gap-1.5 transition-colors flex-1">
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
            <div className="flex items-center bg-stone-50 rounded-xl border border-stone-200 px-3 py-2.5 gap-1.5 transition-colors flex-1">
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
      )}
    </div>
  );
}
