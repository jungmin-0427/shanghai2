# 상하이 여행 길잡이 — PWA MVP 기획 문서
> 작성일: 2026.04.12 | 버전: v0.2 (현재 구현 기준 업데이트)

---

## 1. 프로젝트 개요

### 한 줄 요약
상하이 여행 중 중국어 주소를 원탭으로 복사하고, 고덕지도(가오더)를 바로 열 수 있는 PWA (Progressive Web App)

### 핵심 컨셉
- **"한국에서 미리 설치, 현지에서 오프라인으로 사용"**
- 중국 내 Google Maps 사용 불가 문제 해결
- 앱스토어 없이 홈화면 설치 → Android/iOS 동시 지원
- 팀 내부용 MVP (외부 공개 없이 링크 공유)

### 타깃 유저
상하이를 방문하는 한국인 소규모 그룹 (초기: 개발팀 자체 사용)

---

## 2. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 16.2.3 (App Router) | PWA 지원 용이, 빠른 개발 |
| 스타일링 | Tailwind CSS v4 | 빠른 UI 구성 |
| PWA | next-pwa | Service Worker 자동 생성 |
| 데이터 | TS 파일 (로컬) | DB 없이 빠르게 시작 |
| 배포 | Vercel (무료 플랜) | 한국에서 설치하므로 접속 문제 없음 |
| 패키지 매니저 | npm |  |
| 아이콘 | lucide-react | |

---

## 3. 폴더 구조

```
shanghai2/
├── public/
│   ├── manifest.json          # PWA 설정
│   ├── icons/                 # 앱 아이콘 (512x512, 192x192)
│   └── offline.html           # 오프라인 fallback 페이지
├── app/
│   ├── globals.css
│   ├── layout.tsx             # 루트 레이아웃 (PWA 메타태그 포함)
│   ├── page.tsx               # 메인 홈 페이지 (인기 장소 + 지역 그리드)
│   └── places/
│       └── page.tsx           # 전체 장소 목록 (검색/필터)
├── components/
│   ├── PlaceCard.tsx          # 장소 카드 (주소 복사 + 고덕지도 버튼 포함)
│   ├── PlaceDetailModal.tsx   # 장소 상세 바텀시트 모달
│   ├── CategoryTabs.tsx       # 카테고리 필터 탭
│   ├── AreaFilter.tsx         # 지역구 필터
│   ├── SearchBar.tsx          # 검색 바
│   ├── BottomNav.tsx          # 하단 네비게이션
│   └── Toast.tsx              # 복사 완료 토스트
├── data/
│   └── places.ts              # 장소 데이터 + 타입 정의 (45개)
├── lib/
│   ├── amap.ts                # 고덕지도 URL 생성 유틸
│   └── utils.ts               # 필터/정렬/상수 유틸
├── deploy.sh                  # 배포 스크립트
├── next.config.ts
├── tailwind.config.js
└── package.json
```

---

## 4. 데이터 구조

### Place 타입 정의 (`data/places.ts` 내 통합)

```typescript
export type Category = "restaurant" | "cafe" | "landmark" | "shopping" | "hotel";

export type Area =
  | "와이탄" | "난징동루" | "예원" | "신천지"
  | "징안사" | "디즈니" | "푸동" | "창러루" | "티엔쯔팡";

export type Place = {
  id: string;
  category: Category;
  area: Area;
  nameKo: string;          // 한국어 이름
  nameZh: string;          // 중국어 이름
  addressZh: string;       // 중국어 주소 (복사 대상)
  description?: string;    // 한국어 설명
  amapUrl?: string;        // 고덕지도 직링크 (선택)
  image?: string;          // 대표 이미지 URL (선택)
  popularity?: number;     // 인기도 점수 1~100
};
```

### 카테고리 / 지역 상수 (`lib/utils.ts`)

```typescript
// 카테고리 레이블
CATEGORY_LABEL: { restaurant: "맛집", cafe: "카페", landmark: "관광", shopping: "쇼핑", hotel: "숙박" }

// 카테고리 색상 (Tailwind 클래스)
CATEGORY_COLOR: { restaurant: "bg-red-100 text-red-700", ... }

// 카테고리 이모지
CATEGORY_EMOJI: { restaurant: "🍜", cafe: "☕", landmark: "🏛️", shopping: "🛍️", hotel: "🏨" }
```

---

## 5. 개발 스텝별 작업 명세

### STEP 1 — 프로젝트 초기 세팅 ✅ 완료

- [x] Next.js 16.2.3 (App Router) + TypeScript + Tailwind CSS v4
- [x] `data/places.ts` 타입 정의 + 장소 데이터 45개
- [x] `lib/amap.ts`, `lib/utils.ts` 유틸 작성
- [ ] `npm install next-pwa` 설치
- [ ] `next.config.ts`에 PWA 설정 추가
- [ ] `public/manifest.json` 생성
- [ ] `public/icons/` 에 192x192, 512x512 아이콘 추가

---

### STEP 2 — 메인 리스트 페이지 ✅ 완료

- [x] `app/page.tsx` — 인기 장소 + 지역 그리드 홈 페이지
- [x] `app/places/page.tsx` — 전체 목록 + URL 파라미터 연동 필터
- [x] `components/PlaceCard.tsx` — 카드 내 복사·고덕지도 버튼 포함
- [x] `components/CategoryTabs.tsx` — 카테고리 필터
- [x] `components/AreaFilter.tsx` — 지역 필터
- [x] `components/BottomNav.tsx` — 하단 탭 네비게이션
- [x] `components/SearchBar.tsx` — 한국어/중국어 통합 검색

---

### STEP 3 — 핵심 기능: 주소 복사 + 고덕지도 열기 ✅ 완료

주소 복사와 지도 열기 기능은 독립 컴포넌트 대신 **PlaceCard / PlaceDetailModal 내부에 통합**됨.

- [x] 클립보드 복사 (`navigator.clipboard.writeText`)
- [x] 복사 완료 시 버튼 상태 변경 + Toast 알림
- [x] 고덕지도 URL 생성 (`lib/amap.ts` — `getAmapUrl`, `getAmapDirectUrl`)
- [x] 고덕지도 웹 fallback (앱 미설치 환경 대응)

---

### STEP 4 — 장소 상세 ✅ 완료 (모달 방식)

별도 `/place/[id]` 라우트 대신 **바텀시트 모달(PlaceDetailModal)** 로 구현.

- [x] 카테고리 배지 + 지역 + 이름(한/중) 표시
- [x] 중국어 주소 표시 + 복사 버튼
- [x] 고덕지도 열기 버튼
- [x] 장소 설명(description) 표시
- [x] 배경 클릭 / X 버튼으로 닫기
- [x] 슬라이드업 애니메이션

---

### STEP 5 — PWA 오프라인 캐싱 🔲 진행 예정

```
next-pwa를 이용해 오프라인 캐싱을 설정한다.
- next.config.ts에 withPWA 설정 추가
- 캐싱 대상: 모든 페이지, 이미지, JS/CSS 번들
- 오프라인 시 /offline 페이지 표시
- public/offline.html 생성
```

`next.config.ts` 설정:
```typescript
import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default pwaConfig({ /* nextConfig */ });
```

**체크리스트:**
- [ ] `npm install next-pwa` 설치
- [ ] `next.config.ts` PWA 설정
- [ ] `public/manifest.json` 생성 (앱 이름: "상하이 길잡이", theme_color: "#D4271B")
- [ ] `app/layout.tsx` PWA 메타태그 추가
- [ ] `public/icons/` 아이콘 파일 생성 (192×192, 512×512)
- [ ] `public/offline.html` 생성
- [ ] `npm run build` 후 `public/sw.js` 생성 확인
- [ ] Chrome DevTools → Service Workers 등록 확인

---

### STEP 6 — 배포 (Vercel) 🔲 진행 예정

```bash
# deploy.sh 스크립트로 자동화
./deploy.sh "feat: add PWA support"
# 또는
npm run deploy
```

**체크리스트:**
- [ ] Vercel 프로젝트 연동 (GitHub jungmin-0427/shanghai2)
- [ ] Vercel 배포 성공 확인
- [ ] 배포 URL에서 iOS Safari 홈화면 추가 테스트
- [ ] 배포 URL에서 Android Chrome 홈화면 추가 테스트
- [ ] 설치 후 비행기 모드에서 앱 실행 확인

**배포 후 팀원 설치 가이드:**
```
[상하이 길잡이 앱 설치 방법]

📱 iPhone:
1. Safari에서 {배포URL} 접속
2. 하단 공유 버튼 탭
3. "홈 화면에 추가" 선택

📱 Android:
1. Chrome에서 {배포URL} 접속
2. 우측 상단 ⋮ 메뉴
3. "홈 화면에 추가" 선택

✅ 설치 후 Wi-Fi 환경에서 한 번 열어두면 중국에서 오프라인으로 사용 가능!
```

---

## 6. MVP 이후 개선 아이디어 (v2)

| 기능 | 우선순위 | 설명 |
|------|---------|------|
| 일정 저장 | 높음 | Day별 장소 담기, 로컬스토리지 저장 |
| 검색 고도화 | 중간 | 태그, 후기 키워드 검색 |
| 장소 상세 강화 | 중간 | 영업시간, 가격대, 후기, 별점 필드 추가 |
| 바이두지도 지원 | 중간 | 고덕 대안으로 바이두 딥링크 추가 |
| 환율 계산기 | 낮음 | CNY ↔ KRW 간단 계산 |
| 도시 확장 | 낮음 | 베이징, 청두, 항저우 등 추가 |

---

## 7. 장소 데이터 입력 가이드

장소 추가 시 `data/places.ts` 에 아래 형식으로 추가:

```typescript
{
  id: "고유-영문-id",
  category: "restaurant",   // restaurant | cafe | landmark | shopping | hotel
  area: "신천지",            // 와이탄 | 난징동루 | 예원 | 신천지 | 징안사 | 디즈니 | 푸동 | 창러루 | 티엔쯔팡
  nameKo: "한국어 이름",
  nameZh: "中文名称",
  addressZh: "中文地址",     // ← 고덕지도(amap.com)에서 검색한 정확한 주소 복사
  description: "2~3문장 한국어 설명",
  popularity: 80,           // 1~100
}
```

> **중국어 주소 확인 방법:** 고덕지도 웹(amap.com)에서 장소 검색 → 상세페이지의 주소 복사
