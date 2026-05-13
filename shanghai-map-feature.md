# 상하이 여행자 미니맵 기능 명세서

## 개요
한국인 여행자가 상하이 지명을 봤을 때 대략적인 위치감을 이해할 수 있도록,
정확한 지도보다는 "황푸강 기준 위치 안내도" 형태의 미니맵을 제공한다.

---

## 컴포넌트
```
components/ShanghaiAreaMap.tsx   ← 신규 생성
```

### 화면 배치 (app/page.tsx)
```
인기 지역 섹션 위에 배치
제목: "상하이 어디쯤일까?"
서브: "황푸강 기준으로 여행 지역을 한눈에 보기"
```

---

## 구현 방식
- **SVG 기반** 다이어그램 (외부 지도 API 없음, 이미지 파일 없음)
- 황푸강: 세로 방향 부드러운 곡선 `<path>` (소프트 블루)
- 지역: `<rect>` (rounded) + `<text>` 조합
- 정확한 지리 좌표 기반 아님 → UX용 상대적 위치 다이어그램

---

## 지역 배치

### 황푸강 서쪽 (Puxi)
| 지역 | area 값 | 대략 위치 |
|------|---------|---------|
| 징안사 | 징안사 | 북서 |
| 난징동루 | 난징동루 | 북중 |
| 인민광장 | 인민광장 | 북중 |
| 와이탄 | 와이탄 | 강변 북 |
| 신천지 | 신천지 | 중앙 |
| 예원 | 예원 | 강변 중 |
| 티엔쯔팡 | 티엔쯔팡 | 남중 |
| 우캉루 | 우캉루 | 남서 |

### 황푸강 동쪽 (Pudong)
| 지역 | area 값 | 대략 위치 |
|------|---------|---------|
| 루자주이 | 푸동 | 북동 (강변) |
| 푸동 | 푸동 | 중동 |
| 디즈니 | 디즈니 | 남동 |

---

## SVG 구조
```svg
<svg viewBox="0 0 320 400">
  <!-- 배경 -->
  <rect fill="#fdf8f0" ... />

  <!-- 황푸강 (세로 곡선) -->
  <path d="M 165,0 C 160,100 170,200 165,400"
        stroke="#93c5fd" stroke-width="18" fill="none"
        stroke-linecap="round" />

  <!-- 서쪽 지역 블록들 -->
  <g class="area-block" data-area="와이탄">
    <rect x="80" y="60" width="70" height="28" rx="10" ... />
    <text>와이탄</text>
  </g>
  ...

  <!-- 동쪽 지역 블록들 -->
  <g class="area-block" data-area="푸동">
    <rect x="185" y="80" width="70" height="28" rx="10" ... />
    <text>루자주이</text>
  </g>
</svg>
```

---

## 상태 연동
```typescript
// props
interface Props {
  selectedArea: Area | "all";
  onSelectArea: (area: Area | "all") => void;
}

// 클릭 동작
onClick: selectedArea === area ? onSelectArea("all") : onSelectArea(area)
// → 같은 지역 재클릭 시 선택 해제
```

---

## 선택 스타일
- 미선택: fill="#ffffff", stroke="#e5e7eb"
- 선택됨: fill="#fef2f2", stroke="#ef4444", stroke-width="2"
- hover: fill="#fef9f9"

---

## 디자인 가이드
| 요소 | 스타일 |
|------|--------|
| 배경 | 크림 (#fdf8f0) |
| 황푸강 | 소프트 블루 (#93c5fd), 너비 18px |
| 지역 블록 | 흰색/파스텔, rx=10 (둥근 모서리) |
| 텍스트 | gray-700, 11-12px |
| 선택 강조 | red-100 배경 + red-400 테두리 |
| 전체 크기 | viewBox 320×400, 모바일 100% width |

---

## 모바일 대응
- `width="100%"` + `viewBox` 고정 → 자동 비율 축소
- 가로 스크롤 없이 반응형 처리

---

## 개발 순서
1. `ShanghaiAreaMap.tsx` 컴포넌트 생성
2. SVG 황푸강 곡선 path 구현
3. 서쪽/동쪽 지역 블록 배치
4. 클릭 이벤트 + selectedArea 연동
5. `app/page.tsx` 에 삽입 (인기 지역 위)
6. selectedArea 상태를 인기 장소 필터와 연결
