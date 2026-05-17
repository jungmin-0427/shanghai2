import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=CNY&to=KRW", {
      next: { revalidate: 1800 }, // 30분 서버 캐시
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const json = await res.json();
    return NextResponse.json({ rate: json.rates.KRW });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
