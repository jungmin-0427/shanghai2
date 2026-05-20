/**
 * Toss Mini App 전용 빌드 스크립트
 * - 빌드에 필요한 파일을 임시로 패치 → next build → 원복
 * - 이 스크립트 실행 전후로 소스 파일은 변경되지 않습니다.
 */

import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const patches = [
  {
    file: "next.config.ts",
    apply: (s) =>
      s.replace(
        "const nextConfig: NextConfig = {",
        'const nextConfig: NextConfig = {\n  output: "export",\n  distDir: "dist",'
      ),
  },
  {
    file: "app/opengraph-image.tsx",
    apply: (s) =>
      s.replace(
        'export const runtime = "nodejs";',
        'export const dynamic = "force-static";'
      ),
  },
  {
    file: "app/manifest.ts",
    apply: (s) =>
      s.replace(
        'import type { MetadataRoute } from "next";',
        'import type { MetadataRoute } from "next";\nexport const dynamic = "force-static";'
      ),
  },
  {
    file: "app/api/exchange-rate/route.ts",
    apply: (s) =>
      s.replace(
        'import { NextResponse }',
        'export const dynamic = "force-static";\nimport { NextResponse }'
      ),
  },
  {
    file: "components/ExchangeRateCard.tsx",
    apply: (s) =>
      s.replace(
        'const API_URL = "/api/exchange-rate";',
        'const API_URL = "https://api.frankfurter.app/latest?from=CNY&to=KRW";'
      ),
  },
];

// 원본 저장 → 패치 적용
const originals = patches.map(({ file, apply }) => {
  const original = readFileSync(file, "utf8");
  writeFileSync(file, apply(original));
  return { file, original };
});

try {
  execSync("npx next build", { stdio: "inherit" });
} finally {
  // 성공/실패 무관하게 항상 원복
  originals.forEach(({ file, original }) => writeFileSync(file, original));
  console.log("✓ 소스 파일 원복 완료");
}
