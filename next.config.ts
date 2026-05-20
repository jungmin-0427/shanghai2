import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  // Turbopack이 기본 번들러입니다. webpack 전용 설정은 사용하지 않습니다.
  // 로컬 네트워크 디바이스(샌드박스 앱 등)에서 접근 허용
  allowedDevOrigins: ["192.168.0.7"],
};

export default withSerwist(nextConfig);
