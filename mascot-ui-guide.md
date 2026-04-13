# 마스코트 이미지 UI 적용 가이드

> Cursor 에이전트 명령용 | 대상 파일: 홈, 헤더, PWA 아이콘, 빈 상태 화면

---

## 사전 준비

마스코트 이미지 파일을 아래 경로에 저장:

```
public/mascot.png
```

---

## 작업 명세

### 1. 홈페이지 히어로 섹션 (`app/page.tsx`)

현재 🇨🇳 이모지를 마스코트 이미지로 교체해줘.

```
- 현재 🇨🇳 이모지 제거
- Next.js Image 컴포넌트로 /public/mascot.png 삽입
- 이미지 크기: 120x120px
- 중앙 정렬
- alt 텍스트: "상하이 길잡이 마스코트"
- 이미지 아래 "상하이 여행 가이드" 타이틀 및 기존 텍스트 유지
```

---

### 2. 상단 헤더 네비게이션 (공통 레이아웃)

"상하이 길잡이" 텍스트 왼쪽에 마스코트 이미지를 작게 추가해줘.

```
- Next.js Image 컴포넌트로 /public/mascot.png 삽입
- 이미지 크기: 32x32px
- border-radius: 50% (rounded-full)
- 텍스트와 이미지 수평 정렬 (flex, items-center, gap-2)
- alt 텍스트: "상하이 길잡이 마스코트"
```

---

### 3. PWA 앱 아이콘 (`public/manifest.json`)

기존 아이콘을 마스코트 이미지로 교체해줘.

```json
"icons": [
  {
    "src": "/mascot.png",
    "sizes": "192x192",
    "type": "image/png"
  },
  {
    "src": "/mascot.png",
    "sizes": "512x512",
    "type": "image/png"
  }
]
```

---

### 4. 빈 상태 화면 (검색 결과 없을 때)

장소 검색 결과가 없을 때 표시되는 빈 상태 UI에 마스코트를 추가해줘.

```
- Next.js Image 컴포넌트로 /public/mascot.png 삽입
- 이미지 크기: 80x80px
- 중앙 정렬
- 이미지 아래 텍스트: "장소를 찾을 수 없어요"
- 텍스트 스타일: 회색, 14px
```

---

## 공통 사항

모든 이미지는 아래 방식으로 import해서 사용:

```tsx
import Image from 'next/image'

<Image
  src="/mascot.png"
  alt="상하이 길잡이 마스코트"
  width={120}
  height={120}
/>
```

---

## 작업 완료 후

```bash
git add .
git commit -m "feat: 마스코트 이미지 UI 전체 적용"
git push origin main
```
