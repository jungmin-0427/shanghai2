# 환율 기능 명세서

## 개요
상하이 여행 앱 메인 화면 Hero 배너 아래에 위안화↔원화 환율 카드를 추가한다.

---

## UI 배치 (안 A)

```
Hero 배너 (빨간 그라디언트)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
[환율 카드] ← 여기 추가
━━━━━━━━━━━━━━━━━━━━━━━━━━━
검색 + 카테고리 (sticky)
인기지역 / 인기장소
BottomNav
```

---

## 기능 목록

### 1. 환율 카드 (기본 상태)
- 1위안(CNY) = XXX원(KRW) 항상 노출
- 마지막 업데이트 시간 표시 (예: `업데이트 14:30`)
- 탭하면 계산기 영역 확장/축소 (토글)

### 2. 환율 계산기 (확장 상태)
- 위안 입력 → 원화 자동 계산
- 원화 입력 → 위안 자동 계산
- 양방향 실시간 계산 (숫자 입력 즉시 반영)
- 천 단위 콤마 표시 (예: 19,230원)

### 3. 환율 데이터
- **API**: Frankfurter API (무료, 인증 불필요)
  - Endpoint: `https://api.frankfurter.app/latest?from=CNY&to=KRW`
- **업데이트 방식**: 30분 캐시 (localStorage)
  - 앱 진입 시 캐시 확인 → 30분 이내면 캐시 사용
  - 30분 초과 시 API 재요청
- **API 실패 시**: 마지막 캐시 데이터 유지, 안내 문구 표시

---

## 컴포넌트 구조

```
components/
  ExchangeRateCard.tsx   ← 신규 생성
```

### ExchangeRateCard Props
```typescript
// props 없음 (자체적으로 API 호출 및 상태 관리)
```

### 내부 상태
```typescript
rate: number          // 1위안 = N원
updatedAt: string     // 마지막 업데이트 시간
isExpanded: boolean   // 계산기 확장 여부
cnyInput: string      // 위안 입력값
krwInput: string      // 원화 입력값
isLoading: boolean    // API 로딩 중
isError: boolean      // API 오류 여부
```

---

## localStorage 캐시 구조

```typescript
{
  "exchange_rate_cache": {
    "rate": 192.3,
    "cachedAt": 1718000000000  // Unix timestamp (ms)
  }
}
```

---

## UI 스케치

### 기본 상태 (접힌 상태)
```
┌─────────────────────────────────────┐
│  🪙  1위안 = 192.3원    업데이트 14:30  ∨ │
└─────────────────────────────────────┘
```

### 확장 상태 (계산기 열림)
```
┌─────────────────────────────────────┐
│  🪙  1위안 = 192.3원    업데이트 14:30  ∧ │
│─────────────────────────────────────│
│  ¥  [ 100              ]            │
│        = 19,230 원                  │
│                                     │
│  ₩  [ 10,000           ]            │
│        = ¥ 52.0                     │
└─────────────────────────────────────┘
```

---

## 디자인 가이드
- 앱 기존 테마 색상 유지 (red-500, stone-50)
- 카드 배경: white, 테두리: stone-100
- 위안 입력 강조색: red-500
- 폰트 크기: 기존 앱과 동일한 sm/xs 계열
- 모서리: rounded-xl (기존 카드와 통일)

---

## 적용 위치 (page.tsx)

```tsx
// app/page.tsx
<Hero 배너 />
<ExchangeRateCard />   {/* ← 여기 삽입 */}
<검색 + 카테고리 sticky />
```

---

## 개발 순서

1. `ExchangeRateCard.tsx` 컴포넌트 생성
2. Frankfurter API 호출 + 30분 캐시 로직 구현
3. 기본 노출 (1위안 = N원) UI 구현
4. 탭 시 계산기 확장 UI 구현
5. 양방향 계산 로직 구현
6. `app/page.tsx` 에 컴포넌트 삽입
