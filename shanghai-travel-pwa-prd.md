# 상하이 여행 길잡이 — PWA MVP 기획 문서
> Cursor 개발용 | 작성일: 2026.04.12 | 버전: v0.1

---

## 1. 프로젝트 개요

### 한 줄 요약
상하이 여행 중 중국어 주소를 원탭으로 복사하고, 가오더지도를 바로 열 수 있는 PWA (Progressive Web App)

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
| 프레임워크 | Next.js 14 (App Router) | PWA 지원 용이, 빠른 개발 |
| 스타일링 | Tailwind CSS | 빠른 UI 구성 |
| PWA | next-pwa | Service Worker 자동 생성 |
| 데이터 | JSON 파일 (로컬) | DB 없이 빠르게 시작 |
| 배포 | Vercel (무료 플랜) | 한국에서 설치하므로 접속 문제 없음 |
| 패키지 매니저 | npm |  |

---

## 3. 폴더 구조

```
shanghai-travel/
├── public/
│   ├── manifest.json          # PWA 설정
│   ├── icons/                 # 앱 아이콘 (512x512, 192x192)
│   └── offline.html           # 오프라인 fallback 페이지
├── src/
│   ├── app/
│   │   ├── layout.tsx         # 루트 레이아웃 (PWA 메타태그 포함)
│   │   ├── page.tsx           # 메인 장소 리스트 페이지
│   │   └── place/[id]/
│   │       └── page.tsx       # 장소 상세 페이지
│   ├── components/
│   │   ├── PlaceCard.tsx      # 장소 카드 컴포넌트
│   │   ├── CopyButton.tsx     # 주소 복사 버튼
│   │   ├── MapButton.tsx      # 가오더지도 열기 버튼
│   │   ├── CategoryFilter.tsx # 카테고리 필터 탭
│   │   └── Toast.tsx          # 복사 완료 토스트
│   ├── data/
│   │   └── places.ts          # 장소 데이터 (JSON/TS)
│   └── types/
│       └── place.ts           # 타입 정의
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 4. 데이터 구조

### Place 타입 정의 (`src/types/place.ts`)

```typescript
export type Category = "맛집" | "관광" | "쇼핑" | "카페" | "바";
export type District = "와이탄" | "예원" | "신톈디" | "푸동" | "창닝" | "쉬후이";

export interface Place {
  id: string;
  name: string;               // 한국어 이름
  nameZh: string;             // 중국어 이름
  nameEn?: string;            // 영어 이름 (선택)
  category: Category;
  district: District;
  address: string;            // 한국어 주소
  addressZh: string;          // 중국어 주소 (복사 대상)
  gaodeId?: string;           // 가오더 POI ID (있으면 딥링크, 없으면 검색)
  description: string;        // 한국어 장소 설명 (2~3문장)
  reviews: string[];          // 핵심 후기 2~3개
  rating?: number;            // 별점 (1~5)
  tags: string[];             // 예: ["예약필수", "현금불가", "웨이팅있음"]
  openHours?: string;         // 영업시간
  priceRange?: string;        // 가격대 예: "1인 50~80위안"
  imageUrl?: string;          // 대표 이미지 URL
}
```

### 샘플 데이터 (`src/data/places.ts`)

```typescript
import { Place } from "@/types/place";

export const places: Place[] = [
  {
    id: "din-tai-fung-xintiandi",
    name: "딘타이펑 신톈디점",
    nameZh: "鼎泰丰 新天地店",
    category: "맛집",
    district: "신톈디",
    address: "상하이시 황푸구 신톈디 북里 11호",
    addressZh: "上海市黄浦区新天地北里11号",
    gaodeId: "",
    description: "대만 샤오롱바오 원조 딘타이펑의 상하이 지점. 신톈디 북리에 위치해 관광 후 방문하기 좋음.",
    reviews: [
      "샤오롱바오 8개에 68위안, 웨이팅 30분 예상",
      "한국어 메뉴판 있음, 신용카드 가능",
      "점심 11시 전에 가면 웨이팅 없이 바로 입장 가능"
    ],
    rating: 4.5,
    tags: ["웨이팅있음", "카드가능", "한국어메뉴"],
    openHours: "11:00 - 22:00",
    priceRange: "1인 100~150위안"
  },
  {
    id: "the-bund",
    name: "와이탄 (외탄)",
    nameZh: "外滩",
    category: "관광",
    district: "와이탄",
    address: "상하이시 황푸구 중산둥이루",
    addressZh: "上海市黄浦区中山东一路",
    description: "황푸강변을 따라 늘어선 유럽풍 건축물과 푸동 야경이 압권. 야경은 밤 8~9시가 피크.",
    reviews: [
      "야경 포인트는 와이탄 워터프론트 난간 앞",
      "인파가 많으니 소지품 주의",
      "맞은편 루자쭈이 전망대에서 바라보는 뷰도 추천"
    ],
    rating: 4.8,
    tags: ["무료입장", "야경명소", "포토스팟"],
    openHours: "24시간",
    priceRange: "무료"
  }
  // 추가 장소 계속 입력
];
```

---

## 5. 개발 스텝별 작업 명세

### STEP 1 — 프로젝트 초기 세팅

**Cursor에게 시킬 작업:**

```
다음 조건으로 Next.js 프로젝트를 세팅해줘:
- next.js 14 app router
- tailwind css
- typescript
- next-pwa 패키지 설치 및 설정
- public/manifest.json 생성 (앱 이름: "상하이 길잡이", short_name: "上海", theme_color: "#D4271B", background_color: "#ffffff", display: "standalone")
- src/types/place.ts 파일에 위 타입 정의 생성
- src/data/places.ts 에 샘플 데이터 3개 이상 생성
```

**체크리스트:**
- [ ] `npx create-next-app@latest` 실행
- [ ] `npm install next-pwa` 설치
- [ ] `next.config.js`에 PWA 설정 추가
- [ ] `public/manifest.json` 생성
- [ ] `public/icons/` 에 192x192, 512x512 아이콘 추가
- [ ] `src/types/place.ts` 타입 파일 생성
- [ ] `src/data/places.ts` 데이터 파일 생성 (최소 10개 장소)

---

### STEP 2 — 메인 리스트 페이지

**Cursor에게 시킬 작업:**

```
src/app/page.tsx 를 구현해줘.
- places.ts 데이터를 불러와서 PlaceCard 컴포넌트로 렌더링
- 상단에 카테고리 필터 탭 (전체 / 맛집 / 관광 / 쇼핑 / 카페 / 바)
- 카드 클릭 시 /place/[id] 로 이동
- 모바일 우선 레이아웃 (max-width 430px 기준)
- 배경색 흰색, 상단 헤더에 "🇨🇳 상하이 길잡이" 타이틀
```

**PlaceCard 컴포넌트 요구사항:**

```
src/components/PlaceCard.tsx 를 만들어줘.
카드에 들어갈 내용:
- 장소 이름 (한국어) + 중국어 이름 작게
- 카테고리 배지 (색상: 맛집=빨강, 관광=파랑, 쇼핑=보라, 카페=갈색, 바=남색)
- 지역구 텍스트
- 별점 (★ 기호로 표시)
- 한줄 설명 (description 앞 50자)
- 하단에 "주소 복사" 버튼, "가오더 열기" 버튼 나란히 배치
- 카드 전체 클릭 시 상세 페이지 이동, 버튼 클릭은 이벤트 버블링 방지
```

**체크리스트:**
- [ ] `src/app/page.tsx` 구현
- [ ] `src/components/PlaceCard.tsx` 구현
- [ ] `src/components/CategoryFilter.tsx` 구현
- [ ] 필터 클릭 시 카드 목록 실시간 필터링 동작 확인

---

### STEP 3 — 핵심 기능: 주소 복사 + 가오더 열기

**CopyButton 구현 요구사항:**

```
src/components/CopyButton.tsx 를 만들어줘.
- props: addressZh (string)
- 클릭 시 navigator.clipboard.writeText(addressZh) 실행
- 복사 성공 시 버튼 텍스트가 "복사 완료 ✓" 로 2초간 변경 후 복귀
- 복사 실패(구형 브라우저) 시 document.execCommand fallback 처리
- 버튼 스타일: 빨간색 배경, 흰 텍스트, 둥근 모서리
```

**MapButton 구현 요구사항:**

```
src/components/MapButton.tsx 를 만들어줘.
- props: nameZh (string), addressZh (string), gaodeId (string | undefined)
- 가오더 딥링크 우선 시도:
  - gaodeId 있을 때: amap://poi?sourceApplication=shanghaiGuide&poiname={nameZh}&poiid={gaodeId}
  - gaodeId 없을 때: amap://poi?sourceApplication=shanghaiGuide&poiname={nameZh}&keywords={addressZh}
- 딥링크 실패(앱 미설치) 시 300ms 후 웹 fallback:
  https://uri.amap.com/search?keyword={encodeURIComponent(addressZh)}&city=上海
- 버튼 스타일: 흰색 배경, 빨간 테두리, 빨간 텍스트
```

**체크리스트:**
- [ ] `CopyButton` 클립보드 복사 동작 확인 (Android Chrome, iOS Safari)
- [ ] `MapButton` 가오더 앱 설치된 기기에서 딥링크 열기 확인
- [ ] `MapButton` 가오더 미설치 시 웹 버전 fallback 확인
- [ ] iOS Safari에서 클립보드 복사 권한 처리 확인

---

### STEP 4 — 장소 상세 페이지

**Cursor에게 시킬 작업:**

```
src/app/place/[id]/page.tsx 를 구현해줘.
- URL의 id로 places.ts에서 해당 장소 데이터 조회
- 없는 id면 notFound() 처리
- 상단: 뒤로가기 버튼 + 장소 이름
- 본문 구성:
  1. 카테고리 배지 + 지역구 + 별점
  2. 중국어 이름 (크게) + 한국어 주소
  3. "중국어 주소 복사" CopyButton (전체 너비)
  4. "가오더지도 열기" MapButton (전체 너비)
  5. 구분선
  6. 장소 설명 (description)
  7. 영업시간 / 가격대 / 태그
  8. 후기 섹션: reviews 배열을 카드형으로 나열
```

**체크리스트:**
- [ ] 상세 페이지 라우팅 동작 확인
- [ ] 존재하지 않는 id 접근 시 404 처리 확인
- [ ] 모바일에서 버튼 탭 영역 충분한지 확인 (최소 44px 높이)

---

### STEP 5 — PWA 오프라인 캐싱

**Cursor에게 시킬 작업:**

```
next-pwa를 이용해 오프라인 캐싱을 설정해줘.
- next.config.js에 withPWA 설정 추가
- 캐싱 대상: 모든 페이지, 이미지, JS/CSS 번들
- 오프라인 시 /offline 페이지 표시
- public/offline.html 생성: "인터넷 연결 없음. 앱을 미리 열어두셨다면 홈으로 돌아가세요." 메시지 + 홈 버튼

next.config.js 설정 예시:
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "shanghai-guide-cache",
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }
      }
    }
  ]
});
```

**체크리스트:**
- [ ] `npm run build` 후 service worker 파일 생성 확인 (`public/sw.js`)
- [ ] Chrome DevTools → Application → Service Workers 등록 확인
- [ ] 네트워크 탭에서 "Offline" 체크 후 앱 동작 확인
- [ ] iOS Safari에서 "홈 화면에 추가" 후 앱 아이콘 노출 확인
- [ ] Android Chrome에서 "홈 화면에 추가" 배너 또는 메뉴 동작 확인

---

### STEP 6 — 배포 (Vercel)

**작업 순서:**

```bash
# 1. GitHub 레포 생성 후 푸시
git init
git add .
git commit -m "feat: MVP 초기 구현"
git remote add origin https://github.com/{username}/shanghai-travel.git
git push -u origin main

# 2. vercel.com 접속 → Import Project → GitHub 연동
# 3. 환경변수 없음, 기본 설정으로 Deploy
# 4. 배포 완료 후 URL 팀원과 공유
```

**배포 후 팀원 설치 가이드 (카톡으로 공유):**

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

**체크리스트:**
- [ ] Vercel 배포 성공 확인
- [ ] 배포 URL에서 iOS Safari 설치 테스트
- [ ] 배포 URL에서 Android Chrome 설치 테스트
- [ ] 설치 후 비행기 모드에서 앱 실행 확인

---

## 6. MVP 이후 개선 아이디어 (v2)

| 기능 | 우선순위 | 설명 |
|------|---------|------|
| 일정 저장 | 높음 | Day별 장소 담기, 로컬스토리지 저장 |
| 지역구 필터 | 높음 | 카테고리 + 지역구 교차 필터 |
| 검색 | 중간 | 장소명, 태그 키워드 검색 |
| 바이두지도 지원 | 중간 | 가오더 대안으로 바이두 딥링크 추가 |
| 환율 계산기 | 낮음 | CNY ↔ KRW 간단 계산 |
| 메뉴판 번역 | 낮음 | 사진 촬영 → AI 번역 |
| 도시 확장 | 낮음 | 베이징, 청두, 항저우 등 추가 |

---

## 7. 장소 데이터 입력 가이드

장소 추가 시 `src/data/places.ts` 에 아래 형식으로 추가:

```typescript
{
  id: "고유-영문-id",          // URL에 사용되므로 영문+하이픈만
  name: "한국어 이름",
  nameZh: "中文名称",
  category: "맛집",            // 맛집|관광|쇼핑|카페|바 중 하나
  district: "신톈디",           // 와이탄|예원|신톈디|푸동|창닝|쉬후이 중 하나
  address: "한국어 주소",
  addressZh: "中文地址",        // ← 가오더에서 검색한 정확한 주소 복사
  description: "2~3문장 한국어 설명",
  reviews: [
    "후기 1",
    "후기 2",
    "후기 3"
  ],
  rating: 4.5,
  tags: ["태그1", "태그2"],
  openHours: "10:00 - 22:00",
  priceRange: "1인 50~100위안"
}
```

> **중국어 주소 확인 방법:** 가오더지도 웹(amap.com)에서 장소 검색 → 상세페이지의 주소 복사

---

## 8. 예상 개발 시간

| 스텝 | 예상 시간 |
|------|---------|
| STEP 1: 초기 세팅 | 30분 |
| STEP 2: 리스트 페이지 | 1시간 |
| STEP 3: 복사/지도 기능 | 1시간 |
| STEP 4: 상세 페이지 | 30분 |
| STEP 5: PWA 캐싱 | 30분 |
| STEP 6: 배포 | 30분 |
| 장소 데이터 입력 (30개) | 2~3시간 |
| **총합** | **약 6~7시간** |
