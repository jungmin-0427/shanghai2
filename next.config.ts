import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  // Turbopack이 기본 번들러입니다. webpack 전용 설정은 사용하지 않습니다.
};

export default withSerwist(nextConfig);
