"use client";

import type { Area } from "@/data/places";

interface AreaPin {
  id: Area;
  label: string;
  cx: number;
  cy: number;
}

// viewBox: 0 0 360 420
// 황푸강은 x≈202~222 구간을 세로로 흐름
const WEST_PINS: AreaPin[] = [
  { id: "징안사",   label: "징안사",   cx: 80,  cy: 86  },
  { id: "난징동루", label: "난징동루", cx: 156, cy: 108 },
  { id: "인민광장", label: "인민광장", cx: 112, cy: 140 },
  { id: "창러루",   label: "창러루",   cx: 70,  cy: 192 },
  { id: "와이탄",   label: "와이탄",   cx: 168, cy: 196 },
  { id: "신천지",   label: "신천지",   cx: 118, cy: 248 },
  { id: "예원",     label: "예원",     cx: 164, cy: 270 },
  { id: "우캉루",   label: "우캉루",   cx: 50,  cy: 262 },
  { id: "티엔쯔팡", label: "티엔쯔팡", cx: 100, cy: 318 },
  { id: "칭푸",     label: "칭푸",     cx: 38,  cy: 292 },
];

const EAST_PINS: AreaPin[] = [
  { id: "푸동",   label: "푸동",     cx: 256, cy: 196 },
  { id: "디즈니", label: "디즈니",   cx: 306, cy: 370 },
];

const ALL_PINS = [...WEST_PINS, ...EAST_PINS];

// pill 크기
const PW = 56; // 너비
const PH = 22; // 높이
const PR = 11; // 모서리 반경

// 황푸강 곡선 path (두 레이어)
const RIVER_PATH =
  "M 202,0 C 200,70 198,130 202,162 C 206,178 220,194 222,210 C 224,226 216,260 213,290 C 210,320 210,370 210,420";

interface Props {
  selected: Area | "all";
  onSelect: (area: Area | "all") => void;
}

export default function ShanghaiAreaMap({ selected, onSelect }: Props) {
  function handleClick(id: Area) {
    onSelect(selected === id ? "all" : id);
  }

  return (
    <div className="mx-4 rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
      <svg
        viewBox="0 0 360 420"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <defs>
          {/* 배경 도트 패턴 */}
          <pattern id="mapDotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="#d1c4a8" opacity="0.35" />
          </pattern>
          {/* 강 위 물결 효과용 마스크 (옵션) */}
          <clipPath id="leftClip">
            <rect x="0" y="0" width="190" height="420" />
          </clipPath>
          <clipPath id="rightClip">
            <rect x="222" y="0" width="138" height="420" />
          </clipPath>
        </defs>

        {/* ── 배경 ── */}
        <rect width="360" height="420" fill="#fdf8f0" />
        <rect width="360" height="420" fill="url(#mapDotGrid)" />

        {/* 서쪽(浦西) 구역 배경 */}
        <rect x="0" y="0" width="190" height="420" fill="#fff7ed" opacity="0.55" />
        {/* 동쪽(浦東) 구역 배경 */}
        <rect x="222" y="0" width="138" height="420" fill="#eff6ff" opacity="0.5" />

        {/* ── 황푸강 ── */}
        {/* 강 외곽 (넓은 소프트 블루) */}
        <path
          d={RIVER_PATH}
          stroke="#bfdbfe"
          strokeWidth="26"
          fill="none"
          strokeLinecap="round"
        />
        {/* 강 하이라이트 (가운데 밝은 선) */}
        <path
          d={RIVER_PATH}
          stroke="#dbeafe"
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* 강 중심 광택 */}
        <path
          d={RIVER_PATH}
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.25"
        />

        {/* ── 황푸강 라벨 ── */}
        <text
          x="210"
          y="350"
          textAnchor="middle"
          fontSize="7.5"
          fill="#1f2937"
          fontWeight="600"
          transform="rotate(-90, 210, 350)"
          letterSpacing="2.5"
          opacity="0.85"
        >
          황 푸 강
        </text>

        {/* ── 구역 이름 ── */}
        <text
          x="55" y="26"
          textAnchor="middle"
          fontSize="9"
          fill="#d97706"
          fontWeight="700"
          opacity="0.4"
          letterSpacing="0.5"
        >
          푸시
        </text>
        <text
          x="290" y="26"
          textAnchor="middle"
          fontSize="9"
          fill="#3b82f6"
          fontWeight="700"
          opacity="0.4"
          letterSpacing="0.5"
        >
          푸동
        </text>

        {/* ── 구역 구분선 ── */}

        {/* 서쪽(浦西) 전폭 구분선 — pill 사이 빈 구간에만 배치 */}
        {/* y=97  : 징안사(bottom97) ↔ 난징동루(top97)  — 경계선, 더 연하게 */}
        <line x1="8" y1="97"  x2="188" y2="97"  stroke="#ddd6cb" strokeWidth="0.5" strokeDasharray="4,5" opacity="0.35" />
        {/* y=124 : 난징동루(bottom119) ↔ 인민광장(top129) — 10px 갭 */}
        <line x1="8" y1="124" x2="188" y2="124" stroke="#d5c9b8" strokeWidth="0.6" strokeDasharray="5,4" opacity="0.55" />
        {/* y=166 : 인민광장(bottom151) ↔ 창러루(top181) — 30px 갭 */}
        <line x1="8" y1="166" x2="188" y2="166" stroke="#d5c9b8" strokeWidth="0.6" strokeDasharray="5,4" opacity="0.55" />
        {/* y=222 : 와이탄(bottom207) ↔ 신천지(top237) — 30px 갭 */}
        <line x1="8" y1="222" x2="188" y2="222" stroke="#d5c9b8" strokeWidth="0.6" strokeDasharray="5,4" opacity="0.55" />
        {/* y=281 : 예원(bottom281) ↔ 칭푸(top281) — 같은 경계, 칭푸·예원 x 사이 구간만 */}
        <line x1="68" y1="281" x2="130" y2="281" stroke="#d5c9b8" strokeWidth="0.5" strokeDasharray="4,5" opacity="0.4" />
        {/* y=305 : 칭푸(bottom303) ↔ 티엔쯔팡(top307) — 4px 갭 */}
        <line x1="8" y1="305" x2="188" y2="305" stroke="#d5c9b8" strokeWidth="0.6" strokeDasharray="5,4" opacity="0.55" />

        {/* 동쪽(浦東) 구분선 — 루자주이(bottom207) ↔ 디즈니(top359) */}
        <line x1="225" y1="280" x2="352" y2="280" stroke="#c8d8f0" strokeWidth="0.6" strokeDasharray="5,4" opacity="0.5" />

        {/* 와이탄↔루자주이 연결 점선 (맞은편 관계 표시) */}
        <line
          x1="197" y1="196"
          x2="227" y2="196"
          stroke="#93c5fd"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.55"
        />

        {/* ── 지역 핀 ── */}
        {ALL_PINS.map((pin) => {
          const sel = selected === pin.id;
          const px = pin.cx - PW / 2;
          const py = pin.cy - PH / 2;

          // 선택 시 포인트 컬러, 미선택 시 흰색
          const fillColor  = sel ? "#ef4444" : "#ffffff";
          const strokeColor = sel ? "#dc2626" : "#d1d5db";
          const strokeW    = sel ? 1.5 : 0.8;
          const textColor  = sel ? "#ffffff" : "#374151";

          return (
            <g
              key={pin.id}
              onClick={() => handleClick(pin.id)}
              style={{ cursor: "pointer" }}
            >
              {/* 확장 터치 영역 */}
              <rect
                x={px - 6}
                y={py - 6}
                width={PW + 12}
                height={PH + 12}
                fill="transparent"
              />

              {/* ① 그림자 */}
              <rect
                x={px + 1}
                y={py + 2}
                width={PW}
                height={PH}
                rx={PR}
                fill="#00000015"
              />

              {/* ② 선택 시 pulse ring */}
              {sel && (
                <rect
                  x={px - 3}
                  y={py - 3}
                  width={PW + 6}
                  height={PH + 6}
                  rx={PR + 3}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  opacity="0.25"
                />
              )}

              {/* ③ 필 본체 */}
              <rect
                x={px}
                y={py}
                width={PW}
                height={PH}
                rx={PR}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeW}
              />

              {/* ④ 핀 이모지 + 라벨 텍스트 */}
              <text
                x={pin.cx - PW / 2 + 10}
                y={pin.cy + 5}
                textAnchor="middle"
                fontSize="9"
                fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
              >
                📍
              </text>
              <text
                x={pin.cx + 5}
                y={pin.cy + 5}
                textAnchor="middle"
                fontSize="9"
                fontWeight={sel ? "700" : "500"}
                fill={textColor}
                fontFamily="-apple-system, BlinkMacSystemFont, 'Noto Sans KR', sans-serif"
              >
                {pin.label}
              </text>
            </g>
          );
        })}

{/* ── 참고 안내 ── */}
        <text
          x="8" y="414"
          fontSize="6.5"
          fill="#c4b5a0"
          letterSpacing="0.2"
        >
          위치 관계 참고용 · 실제 지형과 다를 수 있음
        </text>
      </svg>
    </div>
  );
}
